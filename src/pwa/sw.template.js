/* Floor 14 service worker.
 *
 * Built into the site root as sw.js by the floor14-sw plugin in vite.config.js, which fills in
 * VERSION and PRECACHE from the build (the app shell: the page plus every hashed JS/CSS file the
 * game loads, and the Latin font files). This file itself is never bundled.
 *
 * Strategy
 * - Shell (precache, `f14-shell-<version>`): the page and its hashed JS/CSS are cached on install,
 *   so a second launch is instant and works offline. Served cache-first; a new deploy is a new
 *   version, installed in the background, and the game offers "tap to reload" (core/pwa.js). It
 *   never takes over on its own (no automatic skipWaiting), so nobody is reloaded mid-puzzle.
 * - Art, music, textures, fonts (runtime, `f14-<kind>-v1`): cache-first, filled as they are used,
 *   each cache capped by entry count (oldest out first). Entries older than a week are refreshed
 *   in the background, since these file names carry no hash.
 * - Office plates and models (/assets/office/*, and any hashed assets/*.glb): cache-first like the art,
 *   in their own cache with an entry cap and a byte cap (60 MB). A single file over 16 MB, or a ranged
 *   .glb request that is not already cached, goes straight to the network and is not stored.
 *   Nothing from /assets/office is ever precached.
 * - Media range requests (<audio> asks for byte ranges): answered from the cache as 206 when the
 *   whole file is cached; otherwise streamed from the network while the whole file is fetched once
 *   in the background (not with Data Saver on).
 * - Network only, never cached, never touched: /api/* (telemetry, leaderboard, cloud save, voices
 *   from KV, AI games, admin), video clips, admin.html and its scripts, anything not listed above.
 */
const VERSION = '__F14_VERSION__';
const PRECACHE = __F14_PRECACHE__; // paths relative to the scope; '' is the page itself

const PREFIX = 'f14-';
const SHELL = `${PREFIX}shell-${VERSION}`;
const RUNTIME = {
  img: { name: `${PREFIX}img-v1`, max: 240 },
  audio: { name: `${PREFIX}audio-v1`, max: 16 },
  tex: { name: `${PREFIX}tex-v1`, max: 60 },
  font: { name: `${PREFIX}font-v1`, max: 40 },
  // office plates (webp/jpg per time of day, ~0.5 MB) and the desk model (.glb, up to ~12 MB)
  office: { name: `${PREFIX}office-v1`, max: 40, maxBytes: 60 * 1024 * 1024, maxItem: 16 * 1024 * 1024 },
};
const KEEP = new Set([SHELL, ...Object.values(RUNTIME).map((r) => r.name)]);
const STALE_MS = 7 * 24 * 3600 * 1000;
const STAMP = 'x-f14-cached-at';
const SIZE = 'x-f14-size';

const SCOPE = new URL(self.registration.scope);
const BASE = SCOPE.pathname; // e.g. "/"
const PRECACHED = new Set(PRECACHE);
const abs = (rel) => new URL(rel, SCOPE).href;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // hashed files may come from the HTTP cache; the page itself is always fetched fresh
    await Promise.all(PRECACHE.map(async (rel) => {
      const res = await fetch(new Request(abs(rel), { cache: rel === '' ? 'no-cache' : 'default', credentials: 'same-origin' }));
      if (!res.ok) throw new Error(`precache ${rel}: ${res.status}`);
      await cache.put(abs(rel), await clean(res));
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && !KEEP.has(key)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'VERSION') event.source?.postMessage({ type: 'VERSION', version: VERSION });
});

function kindOf(rel) {
  if (rel.startsWith('assets/img/')) return 'img';
  if (rel.startsWith('assets/audio/')) return 'audio';
  if (rel.startsWith('assets/tex/')) return 'tex';
  if (rel.startsWith('assets/office/') || /^assets\/[^/]+\.glb$/.test(rel)) return 'office';
  if (/^assets\/[^/]+\.(woff2?|ttf|otf)$/.test(rel)) return 'font';
  return null;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(BASE)) return;
  let rel;
  try { rel = decodeURIComponent(url.pathname.slice(BASE.length)); } catch { return; }
  // the API is network only: never answered from or written to a cache here
  if (rel === 'api' || rel.startsWith('api/')) return;
  if (req.mode === 'navigate') {
    // only the game's page; admin.html, /admin and anything else go straight to the network
    if (rel === '' || rel === 'index.html') event.respondWith(shell(req));
    return;
  }
  if (PRECACHED.has(rel) && rel !== '') {
    event.respondWith(precached(req, rel));
    return;
  }
  const kind = kindOf(rel);
  if (kind) event.respondWith(runtime(event, req, kind, url));
});

async function shell(req) {
  const hit = await caches.match(abs(''), { cacheName: SHELL });
  if (hit) return hit;
  return fetch(req);
}

async function precached(req, rel) {
  const hit = await caches.match(abs(rel), { cacheName: SHELL });
  return hit || fetch(req);
}

// ---------- runtime caches ----------
const filling = new Set();

async function runtime(event, req, kind, url) {
  const cfg = RUNTIME[kind];
  const key = url.origin + url.pathname; // no query strings for static assets
  const cache = await caches.open(cfg.name);
  const hit = await cache.match(key);
  const range = req.headers.get('range');
  if (hit) {
    const at = Number(hit.headers.get(STAMP)) || 0;
    if (Date.now() - at > STALE_MS) event.waitUntil(fill(cache, key, cfg));
    return range ? partial(hit, range) : hit;
  }
  if (range) {
    // a ranged model download (or anything ranged in the office cache) is left to the network
    if (kind === 'office') return fetch(req);
    // media streaming: let it stream, and keep the whole file for next time
    if (!saveData()) event.waitUntil(fill(cache, key, cfg));
    return fetch(req);
  }
  const res = await fetch(req);
  if (res.status === 200 && (res.type === 'basic' || res.type === 'default') && fits(res, cfg)) {
    event.waitUntil(store(cache, key, res.clone(), cfg));
  }
  return res;
}

const saveData = () => {
  try { return !!(self.navigator && self.navigator.connection && self.navigator.connection.saveData); } catch { return false; }
};

/** false when the response says it is bigger than one entry may be (then it is never stored). */
function fits(res, cfg) {
  if (!cfg.maxItem) return true;
  const len = Number(res.headers.get('content-length'));
  return !(len > cfg.maxItem);
}

async function fill(cache, key, cfg) {
  if (filling.has(key)) return;
  filling.add(key);
  try {
    const res = await fetch(key, { credentials: 'same-origin', cache: 'no-cache' });
    if (res.status === 200 && fits(res, cfg)) await store(cache, key, res, cfg);
  } catch { /* offline: keep what we have */ } finally {
    filling.delete(key);
  }
}

async function store(cache, key, res, cfg) {
  try {
    const headers = new Headers(res.headers);
    headers.set(STAMP, String(Date.now()));
    const body = await res.blob();
    if (cfg.maxItem && body.size > cfg.maxItem) return; // no content-length up front, too big after all
    headers.set(SIZE, String(body.size));
    await cache.put(key, new Response(body, { status: 200, statusText: 'OK', headers }));
    await trim(cache, cfg.max, cfg.maxBytes);
  } catch { /* quota or a broken stream: just do not cache it */ }
}

async function trim(cache, max, maxBytes) {
  let keys = await cache.keys(); // insertion order: oldest first
  while (keys.length > max) await cache.delete(keys.shift());
  if (!maxBytes) return;
  const sizes = [];
  for (const k of keys) sizes.push(Number((await cache.match(k))?.headers.get(SIZE)) || 0);
  let total = sizes.reduce((a, b) => a + b, 0);
  // over the byte cap: drop the oldest first, but never the one just stored (the last key)
  for (let i = 0; i < keys.length - 1 && total > maxBytes; i++) {
    await cache.delete(keys[i]);
    total -= sizes[i];
  }
}

/** A cached response cut to a "bytes=a-b" range, as the media element asked for. */
async function partial(res, range) {
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  const headers = new Headers(res.headers);
  headers.set('accept-ranges', 'bytes');
  if (!m || (m[1] === '' && m[2] === '')) {
    headers.set('content-length', String(size));
    return new Response(buf, { status: 200, headers });
  }
  let start;
  let end;
  if (m[1] === '') {
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } });
  }
  const body = buf.slice(start, end + 1);
  headers.set('content-range', `bytes ${start}-${end}/${size}`);
  headers.set('content-length', String(body.byteLength));
  return new Response(body, { status: 206, statusText: 'Partial Content', headers });
}

/** A response safe to answer a navigation with (a redirected one is not). */
async function clean(res) {
  if (!res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}
