// Mental rotation: a reference shape and four turned copies. Some are the same shape, only turned;
// the rest are its mirror image, turned. Ten trials per series; the examiner wants a set score.
// Variants: '2d' (flat polyominoes) and '3d' (cube figures drawn in isometric view).
import { h } from '../core/ui.js';
import { shuffle, mulberry32, randInt } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'rotation', name: 'Mental Rotation', category: 'Spatial' };
export const demo = { variant: '3d', params: { trials: 10, target: 8, options: 4 } };

// ---------- 2D polyominoes ----------
const key2 = (cells) => {
  const mx = Math.min(...cells.map((c) => c[0])), my = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => `${x - mx},${y - my}`).sort().join(';');
};
const rot90 = (cells) => cells.map(([x, y]) => [-y, x]);
const mirror2 = (cells) => cells.map(([x, y]) => [-x, y]);
function rotations2(cells) { const out = [cells]; for (let i = 0; i < 3; i++) out.push(rot90(out[out.length - 1])); return out; }

function genPoly(r, n) {
  for (;;) {
    const cells = [[0, 0]];
    const has = (x, y) => cells.some((c) => c[0] === x && c[1] === y);
    while (cells.length < n) {
      const [x, y] = cells[Math.floor(r() * cells.length)];
      const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(r() * 4)];
      if (!has(x + dx, y + dy)) cells.push([x + dx, y + dy]);
    }
    const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
    if (Math.max(...xs) - Math.min(...xs) < 2 || Math.max(...ys) - Math.min(...ys) < 2) continue;
    const forms = new Set(rotations2(cells).map(key2));
    if (rotations2(mirror2(cells)).some((c) => forms.has(key2(c)))) continue; // must be chiral
    return cells;
  }
}

function svg2(cells, angle, R) {
  const cx = cells.reduce((s, c) => s + c[0] + 0.5, 0) / cells.length, cy = cells.reduce((s, c) => s + c[1] + 0.5, 0) / cells.length;
  const sq = cells.map(([x, y]) => `<rect x="${(x - cx).toFixed(3)}" y="${(y - cy).toFixed(3)}" width="1" height="1" fill="#d9c49a" stroke="#1d1a16" stroke-width=".07"/>`).join('');
  return `<svg viewBox="${-R} ${-R} ${2 * R} ${2 * R}" aria-hidden="true"><g transform="rotate(${angle})">${sq}</g></svg>`;
}

// ---------- 3D polycubes ----------
const ROT3 = (() => {
  const out = [];
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (const p of perms) for (let s = 0; s < 8; s++) {
    const sg = [s & 1 ? -1 : 1, s & 2 ? -1 : 1, s & 4 ? -1 : 1];
    const m = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (p[i] === j ? sg[i] : 0)));
    const det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    if (det === 1) out.push(m);
  }
  return out;
})();
const apply = (m, [x, y, z]) => [m[0][0] * x + m[0][1] * y + m[0][2] * z, m[1][0] * x + m[1][1] * y + m[1][2] * z, m[2][0] * x + m[2][1] * y + m[2][2] * z];
const key3 = (cells) => {
  const mn = [0, 1, 2].map((i) => Math.min(...cells.map((c) => c[i])));
  return cells.map((c) => c.map((v, i) => v - mn[i]).join(',')).sort().join(';');
};

function genCubes(r, n) {
  const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  for (;;) {
    const cells = [[0, 0, 0]];
    let dir = dirs[Math.floor(r() * 6)];
    const lens = [];
    let left = n - 1;
    while (left > 0) { const l = Math.min(left, 2 + Math.floor(r() * 2)); lens.push(l); left -= l; }
    if (lens.length < 3 || lens.length > 4) continue;
    let ok = true;
    for (let a = 0; a < lens.length && ok; a++) {
      if (a > 0) {
        const perp = dirs.filter((d) => d[0] * dir[0] + d[1] * dir[1] + d[2] * dir[2] === 0);
        dir = perp[Math.floor(r() * perp.length)];
      }
      for (let k = 0; k < lens[a]; k++) {
        const last = cells[cells.length - 1];
        const nx = [last[0] + dir[0], last[1] + dir[1], last[2] + dir[2]];
        // no overlaps, and arms may not touch each other
        if (cells.some((c) => c[0] === nx[0] && c[1] === nx[1] && c[2] === nx[2])) { ok = false; break; }
        if (cells.slice(0, -1).some((c) => Math.abs(c[0] - nx[0]) + Math.abs(c[1] - nx[1]) + Math.abs(c[2] - nx[2]) === 1)) { ok = false; break; }
        cells.push(nx);
      }
    }
    if (!ok) continue;
    const spans = [0, 1, 2].map((i) => Math.max(...cells.map((c) => c[i])) - Math.min(...cells.map((c) => c[i])));
    if (spans.some((s) => s === 0)) continue; // must use all three directions
    const forms = new Set(ROT3.map((m) => key3(cells.map((c) => apply(m, c)))));
    const mir = cells.map(([x, y, z]) => [-x, y, z]);
    if (ROT3.some((m) => forms.has(key3(mir.map((c) => apply(m, c)))))) continue;
    return cells;
  }
}

const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
const proj = ([x, y, z]) => [(x - y) * C30, (x + y) * S30 - z];

function isoFaces(cells) {
  const has = (x, y, z) => cells.some((c) => c[0] === x && c[1] === y && c[2] === z);
  const sorted = [...cells].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const faces = [];
  for (const cell of sorted) {
    const [x, y, z] = cell;
    if (!has(x, y + 1, z)) faces.push({ pts: [[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], fill: '#8a7650', c: cell });
    if (!has(x + 1, y, z)) faces.push({ pts: [[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]], fill: '#b9a272', c: cell });
    if (!has(x, y, z + 1)) faces.push({ pts: [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], fill: '#efe4c8', c: cell });
  }
  return { faces, sorted };
}

function hexOf([x, y, z]) {
  return [[x + 1, y, z], [x + 1, y, z + 1], [x, y, z + 1], [x, y + 1, z + 1], [x, y + 1, z], [x + 1, y + 1, z]].map(proj);
}
function inConvex(pt, poly) {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length];
    const cr = (bx - ax) * (pt[1] - ay) - (by - ay) * (pt[0] - ax);
    if (Math.abs(cr) < 1e-9) continue;
    const s = Math.sign(cr);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}
// every cube must show at least one face that is not hidden behind a nearer cube
function readable(cells) {
  const { faces, sorted } = isoFaces(cells);
  return sorted.every((c, idx) => {
    const mine = faces.filter((f) => f.c === c);
    if (!mine.length) return false;
    const nearer = sorted.slice(idx + 1).filter((o) => o[0] + o[1] + o[2] > c[0] + c[1] + c[2]).map(hexOf);
    return mine.some((f) => {
      const p = proj([0, 1, 2].map((i) => f.pts.reduce((s, q) => s + q[i], 0) / 4));
      return !nearer.some((hx) => inConvex(p, hx));
    });
  });
}

function svg3(cells, box) {
  const { faces } = isoFaces(cells);
  const polys = faces.map((f) => `<polygon points="${f.pts.map(proj).map((p) => p.map((v) => v.toFixed(3)).join(',')).join(' ')}" fill="${f.fill}" stroke="#1d1a16" stroke-width=".06" stroke-linejoin="round"/>`).join('');
  return `<svg viewBox="${box.join(' ')}" aria-hidden="true">${polys}</svg>`;
}
function bounds3(cells) {
  const pts = cells.flatMap((c) => hexOf(c));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
const centre3 = (cells) => {
  const mn = [0, 1, 2].map((i) => Math.min(...cells.map((c) => c[i])));
  return cells.map((c) => c.map((v, i) => v - mn[i]));
};

// ---------- game ----------
export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const is3d = ctx.variant !== '2d';
  const trials = params.trials || 10;
  const target = Math.min(trials, params.target || 8);
  const nOpt = params.options || 4;
  const seed = Math.floor(rng() * 2 ** 31);

  let series = saved?.series || 0;
  let trial = saved?.trial || 0;
  let results = saved?.results || [];
  let picks = new Set(saved?.picks || []);
  let revealed = new Set(saved?.revealed || []);
  let answered = false;
  let done = false;
  let T = build();

  const status = h('p', { class: 'feedback' });
  const head = h('p', { class: 'doc rt-head' });
  const refBox = h('div', { class: 'rt-ref' });
  const opts = h('div', { class: 'rt-opts', role: 'group', 'aria-label': 'Options' });
  const submit = h('button', { class: 'btn btn--primary', onclick: () => answer() }, 'Submit');
  const next = h('button', { class: 'btn btn--primary', hidden: true, onclick: () => advance() }, 'Next trial');
  const score = h('span', { class: 'doc rt-score' });
  el.append(
    h('p', { class: 'game-rules' }, `Select every option that is the reference shape, only turned. The others are its mirror image, turned. ${trials} trials; the examiner wants ${target} right.${is3d ? ' The figures are solid cubes joined face to face.' : ''}`),
    head,
    h('div', { class: 'rt-layout' }, h('figure', { class: 'rt-reffig' }, refBox, h('figcaption', { class: 'doc' }, 'Reference')), opts),
    h('div', { class: 'game-toolbar' }, submit, next, score),
    status,
  );

  function build() {
    const r = mulberry32(seed + series * 100003 + trial * 7919);
    const sameCount = randInt(r, 1, nOpt - 1);
    const kinds = shuffle(r, Array.from({ length: nOpt }, (_, i) => i < sameCount));
    if (!is3d) {
      const cells = genPoly(r, params.cells || 7 + Math.floor(r() * 2));
      const mir = mirror2(cells);
      const cx = cells.reduce((s, c) => s + c[0] + 0.5, 0) / cells.length, cy = cells.reduce((s, c) => s + c[1] + 0.5, 0) / cells.length;
      const R = Math.max(...cells.flatMap(([x, y]) => [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].map(([a, b]) => Math.hypot(a - cx, b - cy)))) + 0.3;
      const refAngle = randInt(r, 0, 23) * 15;
      const used = new Set([refAngle]);
      const options = kinds.map((same) => {
        let a;
        do a = randInt(r, 0, 23) * 15; while (used.has(a));
        used.add(a);
        return { same, svg: svg2(same ? cells : mir, a, R) };
      });
      return { ref: svg2(cells, refAngle, R), options };
    }
    const views = (shape) => shuffle(r, ROT3.map((m) => centre3(shape.map((c) => apply(m, c)))).filter(readable));
    let refViews, mirViews, ref, sameViews, guard = 0;
    do {
      const cells = genCubes(r, params.cubes || 9 + Math.floor(r() * 2));
      refViews = views(cells);
      mirViews = views(cells.map(([x, y, z]) => [-x, y, z]));
      ref = refViews[0];
      sameViews = refViews.slice(1).filter((v) => key3(v) !== key3(ref));
    } while ((sameViews.length < nOpt || mirViews.length < nOpt) && ++guard < 200);
    let si = 0, mi = 0;
    const figs = kinds.map((same) => ({ same, cells: same ? sameViews[si++ % sameViews.length] : mirViews[mi++ % mirViews.length] }));
    const all = [ref, ...figs.map((f) => f.cells)].map(bounds3);
    const w = Math.max(...all.map((b) => b[2] - b[0])) + 0.4, hgt = Math.max(...all.map((b) => b[3] - b[1])) + 0.4;
    const s = Math.max(w, hgt);
    const box = (b) => [((b[0] + b[2]) / 2 - s / 2).toFixed(3), ((b[1] + b[3]) / 2 - s / 2).toFixed(3), s.toFixed(3), s.toFixed(3)];
    return { ref: svg3(ref, box(bounds3(ref))), options: figs.map((f) => ({ same: f.same, svg: svg3(f.cells, box(bounds3(f.cells))) })) };
  }

  function persist() {
    ctx.onSave({ series, trial, results, picks: [...picks], revealed: [...revealed] });
  }

  function render() {
    const right = results.filter(Boolean).length;
    head.textContent = `Series ${series + 1} · trial ${Math.min(trial + 1, trials)} of ${trials}`;
    score.textContent = `${right} right, ${results.length - right} wrong`;
    refBox.innerHTML = T.ref;
    opts.innerHTML = '';
    T.options.forEach((o, i) => {
      const fixed = revealed.has(i);
      const sel = fixed ? o.same : picks.has(i);
      const cls = ['rt-opt'];
      if (sel) cls.push('is-picked');
      if (answered || fixed) cls.push(o.same ? 'is-same' : 'is-mirror');
      const b = h('button', {
        class: cls.join(' '), 'aria-pressed': String(sel), disabled: answered || fixed,
        'aria-label': `Option ${i + 1}${fixed || answered ? (o.same ? ', same shape' : ', mirror image') : ''}`,
        onclick: () => { if (picks.has(i)) picks.delete(i); else picks.add(i); sfx.click(); persist(); render(); },
      });
      b.innerHTML = o.svg;
      b.append(h('span', { class: 'rt-num' }, String(i + 1)));
      if (answered || fixed) b.append(h('span', { class: 'rt-tag' }, o.same ? 'Same' : 'Mirror'));
      opts.append(b);
    });
    submit.hidden = answered;
    next.hidden = !answered || done;
    ctx.onProgress(done ? 1 : Math.min(0.95, results.filter(Boolean).length / target));
  }

  function answer() {
    if (answered || done) return;
    const chosen = new Set([...picks, ...[...revealed].filter((i) => T.options[i].same)]);
    const ok = T.options.every((o, i) => o.same === chosen.has(i));
    results.push(ok);
    answered = true;
    if (ok) { sfx.good(); status.textContent = 'Correct.'; status.className = 'feedback is-good'; }
    else { sfx.bad(); status.textContent = 'Not quite. The marked options show which were turned and which were mirrored.'; status.className = 'feedback is-bad'; }
    trial++;
    picks = new Set();
    revealed = new Set();
    const right = results.filter(Boolean).length;
    if (right >= target) {
      done = true;
      persist();
      render();
      status.textContent = `${right} of ${results.length}. The examiner signs you off: your spatial read on the CCTV can be trusted.`;
      status.className = 'feedback is-good';
      ctx.onProgress(1);
      ctx.onSolved();
      return;
    }
    if (results.length - right > trials - target) {
      // can no longer reach the target in this series
      status.textContent += ` That is ${results.length - right} wrong; the examiner wants ${target} of ${trials}. A fresh series starts.`;
      series++;
      trial = 0;
      results = [];
    }
    persist();
    render();
    next.focus({ preventScroll: true });
  }

  function advance() {
    answered = false;
    status.textContent = '';
    status.className = 'feedback';
    T = build();
    render();
  }

  const onKey = (e) => {
    if (!el.isConnected || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const n = Number(e.key);
    if (n >= 1 && n <= nOpt && !answered) { e.preventDefault(); opts.children[n - 1]?.click(); }
    else if (e.key === 'Enter' && !answered && !done && picks.size && e.target === document.body) { e.preventDefault(); answer(); }
  };
  document.addEventListener('keydown', onKey);

  render();
  return {
    destroy() { document.removeEventListener('keydown', onKey); },
    hint() {
      if (done || answered) return null;
      const i = T.options.findIndex((_, k) => !revealed.has(k));
      if (i < 0 || revealed.size >= nOpt - 1) return null;
      revealed.add(i);
      picks.delete(i);
      persist();
      render();
      return `Option ${i + 1} is ${T.options[i].same ? 'the same shape, turned' : 'a mirror image'}.`;
    },
    devSolve() {
      while (!done) {
        if (answered) advance();
        picks = new Set(T.options.map((o, i) => (o.same ? i : -1)).filter((i) => i >= 0));
        answer();
      }
    },
    _answer: () => T.options.map((o) => o.same),
  };
}
