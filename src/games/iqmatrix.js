// Pattern matrices: six Raven-style 3x3 grids of drawn tiles, each hiding rules across its rows (or columns).
import { h } from '../core/ui.js';
import { shuffle, pick, mulberry32 } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'iqmatrix', name: 'Pattern Matrix', category: 'Pattern' };
export const demo = { variant: 'rows', params: { count: 6 } };

const SYM_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'cross'];
const ASYM_SHAPES = ['arrow', 'ell', 'pac', 'flag'];
const FILLS = ['ink', 'thread', 'hollow'];
const FILL_NAME = { ink: 'black', thread: 'red', hollow: 'hollow' };
const SIZES = [0.62, 0.8, 1];
const SIZE_NAME = ['small', 'medium', 'large'];
const SEGS = [[10, 50, 90, 50], [50, 10, 50, 90], [14, 14, 86, 86], [86, 14, 14, 86], [8, 8, 92, 8], [8, 92, 92, 92], [8, 8, 8, 92], [92, 8, 92, 92]];
const LAYOUT = {
  1: [[50, 50]], 2: [[29, 50], [71, 50]], 3: [[50, 28], [28, 70], [72, 70]], 4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[27, 27], [73, 27], [50, 50], [27, 73], [73, 73]], 6: [[24, 31], [50, 31], [76, 31], [24, 69], [50, 69], [76, 69]],
};
const BASE_R = { 1: 27, 2: 18, 3: 16, 4: 15, 5: 12.5, 6: 11.5 };

// ---------- drawing ----------
function poly(cx, cy, r, n, rot, inner = null) {
  const pts = [];
  const k = inner ? n * 2 : n;
  for (let i = 0; i < k; i++) {
    const a = (rot - 90 + (360 / k) * i) * Math.PI / 180;
    const rr = inner && i % 2 ? r * inner : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}"/>`;
}
function shapeSvg(shape, cx, cy, r, rot) {
  const T = `transform="rotate(${rot} ${cx} ${cy})"`;
  switch (shape) {
    case 'circle': return `<circle cx="${cx}" cy="${cy}" r="${r * 0.92}"/>`;
    case 'square': return poly(cx, cy, r * 1.05, 4, 45 + rot);
    case 'triangle': return poly(cx, cy, r * 1.1, 3, rot);
    case 'diamond': return poly(cx, cy, r * 1.08, 4, rot);
    case 'hexagon': return poly(cx, cy, r, 6, rot);
    case 'star': return poly(cx, cy, r * 1.1, 5, rot, 0.45);
    case 'cross': {
      const a = r * 0.34, b = r;
      return `<path ${T} d="M${cx - a} ${cy - b}h${2 * a}v${b - a}h${b - a}v${2 * a}h${a - b}v${b - a}h${-2 * a}v${a - b}h${a - b}v${-2 * a}h${b - a}z"/>`;
    }
    case 'arrow': {
      // points up when rot = 0
      return `<path ${T} d="M${cx} ${cy - r}L${cx + r * 0.8} ${cy - r * 0.05}H${cx + r * 0.3}V${cy + r}H${cx - r * 0.3}V${cy - r * 0.05}H${cx - r * 0.8}Z"/>`;
    }
    case 'ell': {
      const w = r * 0.42;
      return `<path ${T} d="M${cx - r * 0.7} ${cy - r}h${w}v${2 * r - w}h${1.4 * r - w}v${w}h${-1.4 * r}z"/>`;
    }
    case 'pac': {
      // circle with a wedge cut out, the mouth facing up at rot = 0
      const R = r * 0.95;
      const a1 = (-90 + 35) * Math.PI / 180, a2 = (-90 - 35) * Math.PI / 180;
      return `<path ${T} d="M${cx} ${cy}L${(cx + R * Math.cos(a1)).toFixed(1)} ${(cy + R * Math.sin(a1)).toFixed(1)}A${R} ${R} 0 1 1 ${(cx + R * Math.cos(a2)).toFixed(1)} ${(cy + R * Math.sin(a2)).toFixed(1)}Z"/>`;
    }
    case 'flag': {
      return `<path ${T} d="M${cx - r * 0.55} ${cy + r}V${cy - r}L${cx + r * 0.85} ${cy - r * 0.5}L${cx - r * 0.35} ${cy}V${cy + r}Z"/>`;
    }
    default: return '';
  }
}

export function tileSvg(t) {
  let out = '';
  if (t.lines) {
    out += '<g class="iq-lines">';
    SEGS.forEach(([x1, y1, x2, y2], i) => { if (t.lines & (1 << i)) out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; });
    out += '</g>';
  }
  if (t.count > 0) {
    const r = BASE_R[t.count] * SIZES[t.size] * (t.lines ? 0.8 : 1);
    out += `<g class="iq-f-${t.fill}">`;
    for (const [x, y] of LAYOUT[t.count]) out += shapeSvg(t.shape, x, y, r, t.rot * 45);
    out += '</g>';
  }
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${out}</svg>`;
}

// ---------- rules ----------
// Each level lists attribute rules. Attributes: shape, count, fill, size, rot, lines.
const LEVELS = [
  { count: 'prog', shape: 'rowconst' },
  { shape: 'dist3', count: 'rowconst' },
  { rot: 'prog', fill: 'dist3', asym: true },
  { lines: 'xor', shape: 'rowconst' },
  { count: 'prog', shape: 'dist3', fill: 'dist3' },
  { lines: 'xor', rot: 'prog', fill: 'dist3', asym: true },
  { count: 'dist3', size: 'prog', fill: 'dist3', shape: 'rowconst' },
  { lines: 'xor', shape: 'dist3', fill: 'rowconst', size: 'dist3' },
];

const DOMAIN = {
  count: [1, 2, 3, 4, 5, 6], fill: [0, 1, 2], size: [0, 1, 2], rot: [0, 1, 2, 3, 4, 5, 6, 7],
};

function makeAttr(rng, rule, attr, shapes, flip = false) {
  // returns 3x3 array of values [row][col]
  const g = [[], [], []];
  if (attr === 'shape') {
    if (rule === 'dist3' || rule === 'rowconst') {
      const vals = shuffle(rng, shapes).slice(0, 3);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g[r][c] = rule === 'dist3' ? vals[(flip ? r + 2 * c : r + c) % 3] : vals[r];
    } else { const v = pick(rng, shapes); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g[r][c] = v; }
    return g;
  }
  const dom = DOMAIN[attr];
  if (rule === 'prog') {
    if (attr === 'rot') {
      const d = pick(rng, [1, 2, -1, -2, 3]);
      for (let r = 0; r < 3; r++) { const s = Math.floor(rng() * 8); for (let c = 0; c < 3; c++) g[r][c] = ((s + d * c) % 8 + 8) % 8; }
      g.step = d;
    } else {
      const d = attr === 'count' && rng() < 0.3 ? -1 : 1;
      const lo = dom[0], hi = dom[dom.length - 1];
      const starts = shuffle(rng, dom.filter((v) => v + 2 * d >= lo && v + 2 * d <= hi)).slice(0, 3);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g[r][c] = starts[r % starts.length] + d * c;
      g.step = d;
    }
  } else if (rule === 'dist3') {
    const vals = shuffle(rng, dom).slice(0, 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g[r][c] = vals[(flip ? r + 2 * c : r + c) % 3];
  } else if (rule === 'rowconst') {
    const vals = shuffle(rng, dom).slice(0, 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g[r][c] = vals[r];
  } else {
    const v = pick(rng, dom);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g[r][c] = v;
  }
  return g;
}

function xorRows(rng) {
  const g = [[], [], []];
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 200; k++) {
      const a = 1 + Math.floor(rng() * 255), b = 1 + Math.floor(rng() * 255);
      const pa = popc(a), pb = popc(b), x = a ^ b;
      if (pa < 2 || pa > 4 || pb < 2 || pb > 4 || popc(x) < 2) continue;
      // shown rows must rule out OR and plain subtraction: need overlap and private bits on both sides
      if (r < 2 && (!(a & b) || !(a & ~b) || !(b & ~a))) continue;
      g[r] = [a, b, x];
      break;
    }
  }
  return g;
}
const popc = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };

function describe(level, attrs, columns) {
  const across = columns ? 'down each column' : 'across each row';
  const line = columns ? 'column' : 'row';
  const out = [];
  for (const [attr, rule] of Object.entries(level)) {
    if (attr === 'asym') continue;
    const st = attrs[attr]?.step;
    if (attr === 'count') out.push(rule === 'prog' ? `The number of shapes ${st > 0 ? 'rises' : 'falls'} by one ${across}.` : rule === 'dist3' ? `Each ${line} shows three different counts of shapes, once each.` : `Every tile in a ${line} has the same number of shapes.`);
    if (attr === 'shape') out.push(rule === 'dist3' ? `Each ${line} uses three different shapes, one in each tile.` : `Each ${line} keeps to a single kind of shape.`);
    if (attr === 'fill') out.push(rule === 'dist3' ? `Black, red and hollow each appear once in every ${line}.` : `Each ${line} keeps a single colour.`);
    if (attr === 'size') out.push(rule === 'prog' ? `The shapes ${st > 0 ? 'grow' : 'shrink'} one size step ${across}.` : rule === 'dist3' ? `Small, medium and large each appear once in every ${line}.` : `Each ${line} keeps one size.`);
    if (attr === 'rot') out.push(`The shape turns ${Math.abs(st) * 45} degrees ${st > 0 ? 'clockwise' : 'anticlockwise'} at each step ${across}.`);
    if (attr === 'lines') out.push(`In each ${line}, the third tile shows only the lines that appear in exactly one of the first two.`);
  }
  return out;
}

export function generateMatrix(rng, levelIdx, columns = false) {
  const level = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
  const shapes = level.asym ? ASYM_SHAPES : SYM_SHAPES;
  const attrs = {};
  // alternate the latin pattern between distributed attributes so they never travel together
  let flip = rng() < 0.5;
  for (const a of ['shape', 'count', 'fill', 'size', 'rot']) {
    const rule = level[a] || 'fixed';
    attrs[a] = makeAttr(rng, rule, a, shapes, flip);
    if (rule === 'dist3') flip = !flip;
  }
  if (!level.rot) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) attrs.rot[r][c] = 0;
  if (!level.count && (level.lines || level.rot)) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) attrs.count[r][c] = 1;
  if (!level.size && !level.count && (level.lines || level.rot)) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) attrs.size[r][c] = level.lines ? 1 : 2;
  if (level.count === 'prog' && !level.size) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) attrs.size[r][c] = 2;
  attrs.lines = level.lines ? xorRows(rng) : [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const tiles = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    tiles.push({ shape: attrs.shape[r][c], count: attrs.count[r][c], fill: FILLS[attrs.fill[r][c]], size: attrs.size[r][c], rot: attrs.rot[r][c], lines: attrs.lines[r][c] });
  }
  let grid = tiles;
  if (columns) grid = [0, 3, 6, 1, 4, 7, 2, 5, 8].map((i) => tiles[i]);
  const answer = grid[8];

  // options: perturb three attributes, each with one plausible alternative, giving 2^3 = 8 balanced options
  const pert = [];
  const ruled = Object.keys(level).filter((k) => k !== 'asym');
  const others = ['fill', 'shape', 'count', 'size'].filter((a) => !ruled.includes(a));
  for (const a of [...shuffle(rng, ruled), ...shuffle(rng, others)]) {
    if (pert.length >= 3) break;
    const alt = altValue(rng, a, answer, grid, shapes);
    if (alt !== null) pert.push([a, alt]);
  }
  const options = [];
  for (let m = 0; m < 1 << pert.length; m++) {
    const t = { ...answer };
    pert.forEach(([a, v], i) => { if (m & (1 << i)) t[a] = v; });
    options.push(t);
  }
  const order = shuffle(rng, options.map((_, i) => i));
  return {
    grid: grid.slice(0, 8), answer, options: order.map((i) => options[i]), correct: order.indexOf(0),
    rules: describe(level, attrs, columns),
  };
}

function altValue(rng, a, ans, grid, shapes) {
  if (a === 'lines') {
    const [m1, m2] = [grid[6].lines, grid[7].lines];
    const orv = m1 | m2;
    if (orv !== ans.lines) return orv;
    return ans.lines ^ (1 << Math.floor(rng() * 8));
  }
  if (a === 'count') {
    const c = ans.count;
    const cands = [c - 1, c + 1].filter((v) => v >= 1 && v <= 6);
    return pick(rng, cands);
  }
  if (a === 'shape') {
    const seen = [...new Set(grid.map((t) => t.shape))].filter((s) => s !== ans.shape);
    return seen.length ? pick(rng, seen) : pick(rng, shapes.filter((s) => s !== ans.shape));
  }
  if (a === 'fill') return pick(rng, FILLS.filter((f) => f !== ans.fill));
  if (a === 'size') return pick(rng, [0, 1, 2].filter((s) => s !== ans.size && Math.abs(s - ans.size) === 1));
  if (a === 'rot') return (ans.rot + pick(rng, [1, 2, 6, 7, 4])) % 8;
  return null;
}

export function mount(el, ctx) {
  const { rng, params = {}, saved } = ctx;
  const columns = ctx.variant === 'columns';
  const total = Math.min(Math.max(params.count || 6, 3), 8);
  const startLevel = params.startLevel || 0;
  const st = saved?.seed != null ? saved : { seed: Math.floor(rng() * 2 ** 31), idx: 0, attempts: Array(total).fill(0), out: [], miss: 0, told: 0 };
  let finished = false;
  let cur = null;
  let advancing = false;

  const status = h('p', { class: 'feedback' });
  const counter = h('span', { class: 'iq-count doc' });
  const pips = h('div', { class: 'iq-pips', 'aria-hidden': 'true' });
  const matrixEl = h('div', { class: 'iq-matrix', role: 'img', 'aria-label': 'Three by three pattern with the last tile missing' });
  const optsEl = h('div', { class: 'iq-options', role: 'group', 'aria-label': 'Answer options' });
  const notes = h('ul', { class: 'iq-notes' });

  el.append(
    h('p', { class: 'game-rules' }, columns
      ? 'Six panels from the suspect\'s aptitude test. In each 3 by 3 grid, the same hidden rules run down every column. Pick the tile that completes the grid, or press 1 to 8. Two wrong picks on a panel and the lab swaps in a fresh one.'
      : 'Six panels from the suspect\'s aptitude test. In each 3 by 3 grid, the same hidden rules run across every row. Pick the tile that completes the grid, or press 1 to 8. Two wrong picks on a panel and the lab swaps in a fresh one.'),
    h('div', { class: 'iq-head' }, counter, pips),
    h('div', { class: 'iq-layout' }, matrixEl, h('div', { class: 'iq-side' }, optsEl, notes)),
    status,
  );

  function load() {
    const lvl = Math.min(startLevel + st.idx, LEVELS.length - 1);
    const r = mulberry32((st.seed + st.idx * 7919 + st.attempts[st.idx] * 104729) >>> 0);
    cur = generateMatrix(r, lvl, columns);
  }

  function render(reveal = false) {
    counter.textContent = finished ? `All ${total} panels complete` : `Panel ${st.idx + 1} of ${total}`;
    pips.innerHTML = '';
    for (let i = 0; i < total; i++) pips.append(h('i', { class: i < st.idx || finished ? 'is-done' : i === st.idx ? 'is-cur' : '' }));
    matrixEl.innerHTML = '';
    cur.grid.forEach((t) => matrixEl.append(h('div', { class: 'iq-tile', html: tileSvg(t) })));
    matrixEl.append(h('div', { class: `iq-tile iq-missing${reveal ? ' is-filled' : ''}`, html: reveal ? tileSvg(cur.answer) : '<span>?</span>' }));
    optsEl.innerHTML = '';
    cur.options.forEach((t, i) => {
      const struck = st.out.includes(i);
      optsEl.append(h('button', {
        class: `iq-opt${struck ? ' is-struck' : ''}${reveal && i === cur.correct ? ' is-right' : ''}`,
        disabled: struck || reveal || finished, 'aria-label': `Option ${i + 1}`,
        onclick: () => choose(i),
      }, h('span', { class: 'iq-opt-n' }, String(i + 1)), h('span', { class: 'iq-opt-svg', html: tileSvg(t) })));
    });
    notes.innerHTML = '';
    const shown = reveal ? cur.rules : cur.rules.slice(0, st.told);
    for (const r of shown) notes.append(h('li', {}, r));
  }

  function choose(i) {
    if (finished || advancing || st.out.includes(i)) return;
    if (i === cur.correct) {
      sfx.good();
      advancing = true;
      status.textContent = st.idx + 1 < total ? 'Correct. The rules are noted beside the grid.' : 'Correct.';
      status.className = 'feedback is-good';
      render(true);
      const done = st.idx + 1 >= total;
      st.idx = Math.min(st.idx + 1, total);
      st.out = []; st.miss = 0; st.told = 0;
      if (done) { st.idx = total - 1; finish(); persist(); return; }
      persist();
      ctx.onProgress(st.idx / total);
      const next = h('button', { class: 'btn btn--primary', onclick: () => { advancing = false; next.remove(); load(); render(); status.textContent = ''; status.className = 'feedback'; } }, 'Next panel');
      status.after(next);
      next.focus();
    } else {
      sfx.bad();
      st.out.push(i);
      st.miss++;
      if (st.miss >= 2) {
        st.attempts[st.idx]++;
        st.out = []; st.miss = 0; st.told = 0;
        status.textContent = 'Two misses. The lab swaps in a fresh panel built on the same kind of rules.';
        status.className = 'feedback is-bad';
        load();
      } else {
        status.textContent = 'Not that one. One more miss and this panel is replaced.';
        status.className = 'feedback is-bad';
      }
      persist();
      render();
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    ctx.onProgress(1);
    status.textContent = 'All panels complete. Whoever set this test thinks in patterns, and so do you.';
    status.className = 'feedback is-good';
    sfx.solve();
    ctx.onSolved();
    el.querySelectorAll('.iq-opt').forEach((b) => { b.disabled = true; });
    counter.textContent = `All ${total} panels complete`;
  }

  function persist() { ctx.onSave({ ...st, finished }); }

  const onKey = (e) => {
    if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[1-8]$/.test(e.key) && Number(e.key) <= cur.options.length) choose(Number(e.key) - 1);
  };
  document.addEventListener('keydown', onKey);
  load();
  if (saved?.finished) { finished = true; render(true); finish(); } else render();
  ctx.onProgress(st.idx / total);
  persist();

  return {
    destroy: () => document.removeEventListener('keydown', onKey),
    hint() {
      if (finished || advancing) return null;
      if (st.told < cur.rules.length) {
        st.told++;
        persist(); render();
        return `Lab note added: ${cur.rules[st.told - 1]}`;
      }
      // all rules told: strike two wrong options
      const wrongs = cur.options.map((_, i) => i).filter((i) => i !== cur.correct && !st.out.includes(i));
      if (wrongs.length <= 1) return null;
      const strike = wrongs.slice(0, 2);
      st.out.push(...strike); // struck by the lab, so they do not count as misses
      persist(); render();
      return `The lab ruled out options ${strike.map((i) => i + 1).join(' and ')}.`;
    },
    devSolve() {
      if (finished) return;
      st.idx = total - 1;
      st.out = []; st.miss = 0;
      load();
      render(true);
      finish();
      persist();
    },
  };
}

// ---------- How to play (see core/howto.js) ----------
const iqTile = (t, x, y, s) => tileSvg(t).replace('<svg ', `<svg x="${x}" y="${y}" width="${s}" height="${s}" `);
export const howTo = {
  goal: 'Find the tile that completes each 3 by 3 pattern.',
  steps: [
    'Look across each row. What changes from tile to tile?',
    'The same rules work in all three rows.',
    'Use them on the last row to picture the missing tile.',
    'Tap the option that matches.',
    ({ params }) => `Solve ${Math.min(Math.max(params.count || 6, 3), 8)} panels. Two wrong picks bring a new panel.`,
  ],
  example: {
    caption: 'In every row the shape grows: small, medium, large. The missing tile is the large triangle.',
    render(el) {
      const shapes = ['circle', 'square', 'triangle'];
      let s = '';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const x = 10 + c * 46, y = 8 + r * 46;
        s += rect(x, y, 42, 42, { fill: C.paper, stroke: C.line, sw: 1.2, rx: 3 });
        if (r === 2 && c === 2) s += rect(x, y, 42, 42, { fill: '#f6e7b8', stroke: C.ink, sw: 1.5, rx: 3, dash: '4 3' }) + text(x + 21, y + 29, '?', { size: 22, weight: 800, font: 'display' });
        else s += iqTile({ shape: shapes[r], count: 1, fill: 'ink', size: c, rot: 0, lines: 0 }, x + 2, y + 2, 38);
      }
      const opts = [{ shape: 'triangle', size: 0 }, { shape: 'circle', size: 2 }, { shape: 'triangle', size: 2 }];
      opts.forEach((o, i) => {
        const x = 200 + i * 58, y = 54;
        s += rect(x, y, 50, 50, { fill: C.paper, stroke: i === 2 ? C.red : C.soft, sw: i === 2 ? 3 : 1.2, rx: 4 }) + iqTile({ ...o, count: 1, fill: 'ink', rot: 0, lines: 0 }, x + 4, y + 4, 42);
        s += text(x + 25, y + 68, String(i + 1), { size: 13, weight: 700, fill: C.soft });
      });
      s += arrow(316, 50, 150, 118, { bend: 30, sw: 2.5 });
      put(el, svg(380, 150, s, 'A 3 by 3 pattern where shapes grow; the answer is the large triangle'));
    },
  },
  tips: ['Check one thing at a time: shape, number, colour, size, turn.', 'The Magnifier writes down one of the hidden rules.'],
  controls: { touch: 'Tap an option.', keys: 'Press 1 to 8 to pick an option.' },
  variants: {
    columns: {
      steps: [
        'Look down each column. What changes from tile to tile?',
        'The same rules work in all three columns.',
        'Use them on the last column to picture the missing tile.',
        'Tap the option that matches.',
        ({ params }) => `Solve ${Math.min(Math.max(params.count || 6, 3), 8)} panels. Two wrong picks bring a new panel.`,
      ],
      example: { caption: 'Here the rule runs down each column instead of across each row.' },
    },
  },
};
