import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = import.meta.dirname;

/**
 * Builds the service worker (sw.js at the site root) from src/pwa/sw.template.js.
 * Its precache list is the app shell: the game's page ('' = the scope root, which is how Cloudflare
 * Pages serves index.html) plus every JS chunk and CSS file reachable from the game's entry, static
 * or lazy, and the Latin font files. Admin-only chunks are left out. The version is a hash of all of
 * that, so every deploy that changes the game gets a new shell cache and the old one is removed.
 */
function floor14ServiceWorker() {
  const template = resolve(root, 'src/pwa/sw.template.js');
  return {
    name: 'floor14-sw',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const files = Object.values(bundle);
      const entry = files.find((f) => f.type === 'chunk' && f.isEntry && f.name === 'main');
      if (!entry) {
        this.warn('floor14-sw: no "main" entry chunk; sw.js not written');
        return;
      }
      const shell = new Set();
      const seen = new Set();
      const queue = [entry.fileName];
      while (queue.length) {
        const name = queue.shift();
        if (seen.has(name)) continue;
        seen.add(name);
        const chunk = bundle[name];
        if (!chunk || chunk.type !== 'chunk') continue;
        shell.add(name);
        for (const css of chunk.viteMetadata?.importedCss || []) shell.add(css);
        queue.push(...(chunk.imports || []), ...(chunk.dynamicImports || []));
      }
      // fonts: the Latin subsets every screen uses (other subsets are cached at runtime when used)
      for (const f of files) {
        if (f.type === 'asset' && /(^|\/)[\w-]+-latin-\d+-normal-[\w-]+\.woff2$/.test(f.fileName)) shell.add(f.fileName);
      }
      // never precache 3D models or the office plates: runtime cache only (see sw.template.js)
      for (const f of [...shell]) if (/\.(glb|gltf|bin)$/i.test(f) || f.includes('assets/office/')) shell.delete(f);
      const html = bundle['index.html'];
      const list = ['', ...[...shell].sort()];
      const hash = createHash('sha256');
      hash.update(String(html?.source ?? ''));
      for (const f of list) hash.update(`\n${f}`);
      const src = readFileSync(template, 'utf8');
      hash.update(src);
      const version = hash.digest('hex').slice(0, 12);
      const code = src
        .replace("'__F14_VERSION__'", JSON.stringify(version))
        .replace('__F14_PRECACHE__', JSON.stringify(list, null, 0));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: code });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [floor14ServiceWorker()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
    // two pages: the game and the owner's admin dashboard (admin.html, noindex)
    rolldownOptions: {
      input: {
        main: resolve(root, 'index.html'),
        admin: resolve(root, 'admin.html'),
      },
    },
  },
});
