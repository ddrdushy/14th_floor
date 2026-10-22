// Car Park Getaway: Rush Hour in a multi-storey car park. Slide the other cars and lorries out of
// the way so the red car can drive out of the exit gap on the right of its row. Cars (2 bays) and
// lorries (3 bays) only roll forwards and backwards. Every layout comes from a bank built offline by a
// full breadth-first search, so its par (the fewest possible moves) is exact.
//
// params (all optional):
//   difficulty  'easy' (6-10 moves) | 'medium' (11-18) | 'hard' (19-30), default 'medium'
//   target      label painted on the red car, default 'YOUR CAR' (e.g. 'SUSPECT VAN'); 14 letters at most
//   clue        story note shown above the car park, e.g. 'The guard lifts the barrier at 2 a.m. sharp.'
import '../styles/games-d/getaway.css';
import { h, svgEl } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { shuffle, mulberry32 } from '../core/rng.js';
import { put, svg, text, arrow, C } from '../core/howto-kit.js';
import { BANK } from './getaway-bank.js';
import { N, BANDS, parseBoard, startPos, goalPos, occupancy, range, legal, solve, distanceMap, pickPuzzle } from './getaway-logic.js';

export const meta = { id: 'getaway', name: 'Car Park Getaway', category: 'Spatial' };
export const demo = { params: { difficulty: 'medium', target: 'YOUR CAR', clue: 'Practice level. In a case, a clue from the story is pinned here.' } };

const CELL = 100;
const M = 26; // concrete wall thickness
const CAR_COLOURS = ['#4b5d6b', '#6b6f5a', '#7d6a4a', '#4a5a52', '#5e5468', '#3d4a57', '#8a7d64', '#6a7a80', '#475048', '#73655a', '#55606e', '#5f5248'];
const LORRY_COLOURS = ['#7a6d52', '#55604c', '#6b5a4a', '#4f5866', '#66705f'];
const STATES = ['W', 'B', 'J', 'P', 'N', 'A', 'K', 'V', 'M', 'T', 'R', 'D', 'C'];
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXY';
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const NUM_WORD = ['zero', 'one', 'two', 'three', 'four', 'five'];

export const howTo = {
  goal: ({ params }) => `Clear a path and drive ${params?.target ? `the red car, ${String(params.target)},` : 'your car'} out of the car park.`,
  steps: [
    'Drag a car or lorry to slide it. It only moves forwards and backwards.',
    'Cars cannot jump over each other or turn.',
    'Make a clear road to the EXIT gap on the right.',
    'Slide the red car out through the gap to escape.',
    'Par is the fewest moves it can be done in. Try to match it.',
  ],
  example: {
    caption: 'The grey car blocks the road. Slide it down, then the red car drives out.',
    render(el) {
      const s = 40, x0 = 12, y0 = 12, rows = 4;
      let b = `<rect x="${x0 - 6}" y="${y0 - 6}" width="${4 * s + 12}" height="${rows * s + 12}" fill="#8c877c"/>`;
      b += `<rect x="${x0}" y="${y0}" width="${4 * s}" height="${rows * s}" fill="#2d3236"/>`;
      b += `<rect x="${x0 + 4 * s}" y="${y0 + s}" width="12" height="${s}" fill="#2d3236"/>`;
      for (let c = 1; c < 4; c++) b += `<line x1="${x0 + c * s}" y1="${y0}" x2="${x0 + c * s}" y2="${y0 + rows * s}" stroke="#d8d2c2" stroke-opacity=".18"/>`;
      // where the grey car will go
      b += `<rect x="${x0 + 2 * s + 6}" y="${y0 + 2 * s + 4}" width="${s - 12}" height="${2 * s - 8}" rx="9" fill="none" stroke="#c4bba5" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      b += `<rect x="${x0 + 4}" y="${y0 + s + 5}" width="${2 * s - 8}" height="${s - 10}" rx="9" fill="#a8323a" stroke="${C.ink}" stroke-width="1.5"/>`;
      b += `<rect x="${x0 + 2 * s + 6}" y="${y0 + s + 4}" width="${s - 12}" height="${2 * s - 8}" rx="9" fill="#6a7a80" stroke="${C.ink}" stroke-width="1.5"/>`;
      b += arrow(x0 + 2.5 * s, y0 + 1.25 * s, x0 + 2.5 * s, y0 + 3.6 * s, { color: C.amber, sw: 3 });
      b += arrow(x0 + 1.9 * s, y0 + 1.5 * s, x0 + 4.25 * s, y0 + 1.5 * s, { color: C.red, sw: 3, bend: -10 });
      b += text(x0 + 4 * s + 30, y0 + 1.5 * s + 4, 'EXIT', { size: 12, weight: 800, fill: C.amber, font: 'display' });
      put(el, svg(4 * s + 70, rows * s + 24, b, 'A red car blocked by a grey car; the grey car slides down and the red car drives to the exit'));
    },
  },
  tips: [
    'Work backwards: which car blocks the red car, and what blocks that car?',
    'Lorries are long. Move them early, or they trap you later.',
  ],
  controls: {
    touch: 'Drag a vehicle along its lane. Undo takes back your last move.',
    keys: 'Tab to pick a vehicle, arrow keys slide it. Arrows across its lane jump to the next vehicle.',
  },
};

function plateFor(r) {
  const st = STATES[Math.floor(r() * STATES.length)];
  const two = r() < 0.75;
  const ls = st + LETTERS[Math.floor(r() * LETTERS.length)] + (two ? LETTERS[Math.floor(r() * LETTERS.length)] : '');
  return `${ls} ${1 + Math.floor(r() * 9998)}`;
}

/** Top-down vehicle, drawn facing right along +x, `len` bays long and one bay wide. */
function vehicleShape(len, colour, isTarget) {
  const L = len * CELL;
  const g = svgEl('g', { class: 'gw-body' });
  if (len === 2) {
    g.append(
      svgEl('rect', { x: 6, y: 9, width: L - 12, height: 82, rx: 24, fill: '#000', opacity: 0.28, transform: 'translate(3 4)' }),
      svgEl('rect', { x: 6, y: 9, width: L - 12, height: 82, rx: 24, fill: colour, stroke: '#141414', 'stroke-width': 3 }),
      svgEl('rect', { x: 52, y: 20, width: 84, height: 60, rx: 12, fill: '#fff', opacity: 0.08 }),
      svgEl('path', { d: `M${L - 64} 20 q14 30 0 60 l-20 -6 q8 -24 0 -48 z`, fill: '#1a2329', opacity: 0.85 }),
      svgEl('path', { d: 'M38 22 q-10 28 0 56 l14 -5 q-6 -23 0 -46 z', fill: '#1a2329', opacity: 0.75 }),
      svgEl('rect', { x: L - 16, y: 17, width: 7, height: 14, rx: 2, fill: '#f3e6b0' }),
      svgEl('rect', { x: L - 16, y: 69, width: 7, height: 14, rx: 2, fill: '#f3e6b0' }),
      svgEl('rect', { x: 8, y: 18, width: 6, height: 12, rx: 2, fill: '#c7343c' }),
      svgEl('rect', { x: 8, y: 70, width: 6, height: 12, rx: 2, fill: '#c7343c' }),
      svgEl('ellipse', { cx: L - 70, cy: 8, rx: 7, ry: 4, fill: colour, stroke: '#141414', 'stroke-width': 2 }),
      svgEl('ellipse', { cx: L - 70, cy: 92, rx: 7, ry: 4, fill: colour, stroke: '#141414', 'stroke-width': 2 }),
    );
    if (isTarget) g.append(svgEl('path', { d: `M${L - 44} 50 h18`, stroke: '#fff', 'stroke-opacity': 0.25, 'stroke-width': 3 }));
  } else {
    // lorry: cab at the front, a ribbed box behind, both on one dark chassis
    const cab = 74;
    g.append(
      svgEl('rect', { x: 5, y: 7, width: L - 10, height: 86, rx: 10, fill: '#000', opacity: 0.28, transform: 'translate(3 4)' }),
      svgEl('rect', { x: 8, y: 14, width: L - 16, height: 72, rx: 8, fill: '#1b1d1f' }),
      svgEl('rect', { x: L - cab - 4, y: 12, width: cab, height: 76, rx: 16, fill: colour, stroke: '#141414', 'stroke-width': 3 }),
      svgEl('path', { d: `M${L - 30} 20 q10 30 0 60 l-14 -4 q6 -26 0 -52 z`, fill: '#1a2329', opacity: 0.85 }),
      svgEl('rect', { x: L - 14, y: 18, width: 6, height: 12, rx: 2, fill: '#f3e6b0' }),
      svgEl('rect', { x: L - 14, y: 70, width: 6, height: 12, rx: 2, fill: '#f3e6b0' }),
      svgEl('rect', { x: 5, y: 6, width: L - cab - 12, height: 88, rx: 5, fill: colour, stroke: '#141414', 'stroke-width': 3 }),
      svgEl('rect', { x: 8, y: 9, width: L - cab - 18, height: 82, rx: 3, fill: '#fff', opacity: 0.13 }),
    );
    for (let x = 30; x < L - cab - 16; x += 26) g.append(svgEl('line', { x1: x, y1: 10, x2: x, y2: 90, stroke: '#141414', 'stroke-opacity': 0.25, 'stroke-width': 2 }));
  }
  return g;
}

export function mount(el, ctx) {
  const { params = {}, rng } = ctx;
  const difficulty = params.difficulty in BANDS ? params.difficulty : 'medium';
  const label = String(params.target || 'YOUR CAR').toUpperCase().slice(0, 14);

  // ---- puzzle: the save's layout if it is still a fair one, else a pick from the bank ----
  const saved = ctx.saved && typeof ctx.saved === 'object' ? ctx.saved : null;
  const picked = pickPuzzle(BANK, difficulty, rng);
  const looks = mulberry32(Math.floor(rng() * 4294967296)); // colours and plates: their own stream
  let board = picked.board, par = picked.par;
  let vehicles = parseBoard(board);
  let pos = startPos(vehicles);
  let hist = [];
  if (saved && saved.v === 1 && saved.difficulty === difficulty && typeof saved.board === 'string' && saved.board.length === N * N) {
    try {
      const vs = parseBoard(saved.board);
      const okVs = vs[0].h && vs[0].len === 2 && vs.every((v) => v.len === 2 || v.len === 3);
      const sp = startPos(vs);
      const path = okVs && legal(vs, sp) ? solve(vs, sp) : null;
      if (path && legal(vs, saved.pos)) {
        board = saved.board; vehicles = vs; par = path.length;
        pos = saved.pos.slice();
        hist = (Array.isArray(saved.hist) ? saved.hist : []).filter((m) => m && Number.isInteger(m.v) && m.v >= 0 && m.v < vs.length && Number.isInteger(m.from) && Number.isInteger(m.to));
      }
    } catch { /* an old or broken save: start fresh */ }
  }
  const start = startPos(vehicles);
  const exitRow = vehicles[0].r;

  // looks: colours and plates come from the rng too, so the same player sees the same car park
  const pal = shuffle(looks, CAR_COLOURS), lpal = shuffle(looks, LORRY_COLOURS);
  let ci = 0, li = 0;
  const info = vehicles.map((v, i) => ({
    colour: i === 0 ? '#a8323a' : v.len === 3 ? lpal[li++ % lpal.length] : pal[ci++ % pal.length],
    plate: plateFor(looks),
    flip: i !== 0 && looks() < 0.5,
  }));
  const nameOf = (i) => (i === 0 ? `the red car, ${label}` : `the ${vehicles[i].len === 3 ? 'lorry' : 'car'} ${info[i].plate}`);

  let done = false, drag = null, winTimer = null, focusV = 0;

  // ---- DOM ----
  const status = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const movesEl = h('span', { class: 'gw-moves' });
  const undoBtn = h('button', { class: 'btn btn--small', type: 'button', onclick: undo }, 'Undo');
  const resetBtn = h('button', { class: 'btn btn--small', type: 'button', onclick: reset }, 'Reset');
  const W = N * CELL;
  const root = svgEl('svg', { class: 'gw-svg', viewBox: `${-M} ${-M} ${W + 2 * M + 46} ${W + 2 * M}`, role: 'group',
    'aria-label': `Car park, ${N} by ${N} bays. Exit on the right of row ${exitRow + 1}.` });
  // floor
  const floor = svgEl('g', { class: 'gw-floor', 'aria-hidden': 'true' });
  floor.append(svgEl('rect', { x: -M, y: -M, width: W + 2 * M, height: W + 2 * M, fill: '#8c877c' }));
  floor.append(svgEl('rect', { x: 0, y: 0, width: W, height: W, fill: '#2d3236' }));
  for (let k = 1; k < N; k++) {
    floor.append(svgEl('line', { x1: k * CELL, y1: 0, x2: k * CELL, y2: W, class: 'gw-bay' }));
    floor.append(svgEl('line', { x1: 0, y1: k * CELL, x2: W, y2: k * CELL, class: 'gw-bay is-dim' }));
  }
  // the exit lane: a gap in the right wall, chevrons, the sign
  const ey = exitRow * CELL;
  floor.append(svgEl('rect', { x: W - 2, y: ey, width: M + 50, height: CELL, fill: '#2d3236' }));
  floor.append(svgEl('rect', { x: W, y: ey - 6, width: M, height: 6, fill: '#e8a33d' }));
  floor.append(svgEl('rect', { x: W, y: ey + CELL, width: M, height: 6, fill: '#e8a33d' }));
  for (let k = 0; k < 2; k++) floor.append(svgEl('path', { d: `M${W + 6 + k * 20} ${ey + 34} l14 16 l-14 16`, class: 'gw-chev' }));
  floor.append(svgEl('text', { x: W + M + 23, y: ey + 50, class: 'gw-exit', transform: `rotate(90 ${W + M + 23} ${ey + 50})` }, 'EXIT'));
  floor.append(svgEl('text', { x: 10, y: W - 12, class: 'gw-level' }, `LEVEL ${3 + Math.floor(looks() * 6)}`));
  // pillars at the wall corners
  for (const [x, y] of [[-M, -M], [W, -M], [-M, W], [W, W]]) floor.append(svgEl('rect', { x, y, width: M, height: M, fill: '#6e695f' }));
  const carLayer = svgEl('g', { class: 'gw-cars' });
  root.append(floor, carLayer);

  const carEls = vehicles.map((v, i) => {
    const L = v.len * CELL;
    const g = svgEl('g', { class: `gw-car${i === 0 ? ' is-target' : ''}`, tabindex: '0', role: 'button', 'data-v': i });
    const inner = svgEl('g', { transform: v.h ? (info[i].flip ? `translate(${L} 0) scale(-1 1)` : '') : (info[i].flip ? `translate(0 ${L}) rotate(-90)` : `translate(${CELL} 0) rotate(90)`) });
    inner.append(vehicleShape(v.len, info[i].colour, i === 0));
    const w = v.h ? L : CELL, hgt = v.h ? CELL : L;
    g.append(inner);
    // the plate sits upright at the back, so it always reads the same way
    const rearLeft = v.h ? !info[i].flip : false;
    const px = v.h ? (rearLeft ? 12 : L - 78) : 17, py = v.h ? 40 : (info[i].flip ? L - 33 : 12);
    const plate = svgEl('g', { class: 'gw-plate', transform: `translate(${px} ${py})` });
    plate.append(svgEl('rect', { width: 66, height: 20, rx: 3 }), svgEl('text', { x: 33, y: 14.5 }, info[i].plate));
    if (i === 0) {
      g.append(svgEl('text', { class: 'gw-tag', x: 128, y: 55, ...(label.length > 8 ? { textLength: 96, lengthAdjust: 'spacingAndGlyphs' } : {}) }, label));
    }
    g.append(plate, svgEl('rect', { class: 'gw-ring', x: 3, y: 3, width: w - 6, height: hgt - 6, rx: 18 }));
    carLayer.append(g);
    return g;
  });

  el.append(
    h('p', { class: 'game-rules' }, `Slide the cars and lorries to clear a road. Drive the red car (${label}) out of the EXIT on the right. Vehicles only move forwards and backwards.`),
    params.clue ? h('p', { class: 'gw-clue' }, h('span', { class: 'gw-clue-pin', 'aria-hidden': 'true' }), String(params.clue)) : null,
    h('div', { class: 'gw-wrap' }, root),
    h('div', { class: 'game-toolbar gw-bar' }, movesEl, h('span', { class: 'gw-par' }, `Par ${par}`), undoBtn, resetBtn),
    status,
  );

  // ---- drawing ----
  function place(i, p, animate = true) {
    const v = vehicles[i];
    const g = carEls[i];
    g.classList.toggle('no-anim', !animate);
    const x = v.h ? p * CELL : v.c * CELL, y = v.h ? v.r * CELL : p * CELL;
    g.style.transform = `translate(${x}px, ${y}px)`;
  }
  function labelFor(i) {
    const v = vehicles[i];
    const a = v.h ? `columns ${pos[i] + 1} to ${pos[i] + v.len}, row ${v.r + 1}` : `rows ${pos[i] + 1} to ${pos[i] + v.len}, column ${v.c + 1}`;
    return `${i === 0 ? `Red car, ${label}` : `${v.len === 3 ? 'Lorry' : 'Car'} ${info[i].plate}`}, ${a}. Moves ${v.h ? 'left and right' : 'up and down'}.`;
  }
  function render(animate = true) {
    vehicles.forEach((_, i) => { place(i, pos[i], animate); carEls[i].setAttribute('aria-label', labelFor(i)); });
    movesEl.textContent = `Moves ${hist.length}`;
    undoBtn.disabled = done || !hist.length;
    resetBtn.disabled = done || !hist.length;
  }
  // every state's distance to the exit, worked out once just after the first paint
  let dmap = null;
  const mapTimer = setTimeout(() => { dmap = distanceMap(vehicles, start); progress(); }, 60);
  const movesLeft = () => (dmap ? dmap.dist(pos) : -1);
  function nextMove() {
    if (dmap) return dmap.next(pos);
    const path = solve(vehicles, pos);
    return path && path.length ? path[0] : null;
  }
  function progress() {
    if (done || !dmap) return;
    const d = movesLeft();
    if (d < 0) return;
    ctx.onProgress(Math.max(0, Math.min(0.95, (par - d + 0.5) / (par + 1))));
  }
  const persist = () => ctx.onSave({ v: 1, difficulty, board, pos, hist });
  function say(t, kind = '') { status.textContent = t; status.className = `feedback${kind ? ` is-${kind}` : ''}`; }

  // ---- moves ----
  function commit(i, to, { quiet = false } = {}) {
    if (done || to === pos[i]) return false;
    const from = pos[i];
    const last = hist[hist.length - 1];
    if (last && last.v === i) { last.to = to; if (last.from === to) hist.pop(); } // the same vehicle again is still one move
    else hist.push({ v: i, from, to });
    pos[i] = to;
    if (!quiet) sfx.click();
    render();
    persist();
    if (pos[0] === goalPos()) win();
    else { progress(); say(''); }
    return true;
  }
  function undo() {
    if (done || !hist.length) return;
    const m = hist.pop();
    const back = pos.slice(); back[m.v] = m.from;
    if (!legal(vehicles, back)) { hist = []; render(); persist(); return; } // a history that no longer fits: drop it
    pos = back;
    sfx.click();
    render(); persist(); progress();
    say('Move taken back.');
  }
  function reset() {
    if (done || !hist.length) return;
    pos = start.slice();
    hist = [];
    sfx.click();
    render(); persist(); progress();
    say('Back to where the cars were parked.');
  }
  function win() {
    done = true;
    render();
    root.classList.add('is-done');
    // drive the red car out through the gap
    const g = carEls[0];
    g.classList.remove('no-anim');
    g.classList.add('is-leaving');
    requestAnimationFrame(() => { g.style.transform = `translate(${(N + 1.6) * CELL}px, ${exitRow * CELL}px)`; });
    sfx.good();
    const n = hist.length;
    say(n <= par ? `Out in ${n} moves. Par. Clean getaway.` : `Out in ${n} moves (par ${par}). Nobody saw a thing.`, 'good');
    ctx.onProgress(0.97);
    winTimer = setTimeout(() => ctx.onSolved(), reduced() ? 50 : 900);
  }

  // ---- pointer drag ----
  const toSvg = (e) => {
    const m = root.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  root.addEventListener('pointerdown', (e) => {
    if (done || drag || (e.button != null && e.button > 0)) return;
    const g = e.target.closest?.('.gw-car');
    if (!g) return;
    const i = Number(g.dataset.v);
    e.preventDefault();
    focusV = i;
    g.focus({ preventScroll: true });
    const [lo, hi] = range(vehicles, pos, i, occupancy(vehicles, pos));
    drag = { i, id: e.pointerId, p0: pos[i], at: toSvg(e), lo, hi, cur: pos[i], moved: false };
    root.setPointerCapture?.(e.pointerId);
    g.classList.add('is-drag', 'no-anim');
  });
  root.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const v = vehicles[drag.i];
    const p = toSvg(e);
    const delta = ((v.h ? p.x - drag.at.x : p.y - drag.at.y) / CELL);
    if (Math.abs(delta) > 0.06) drag.moved = true;
    drag.cur = Math.max(drag.lo, Math.min(drag.hi, drag.p0 + delta));
    const x = v.h ? drag.cur * CELL : v.c * CELL, y = v.h ? v.r * CELL : drag.cur * CELL;
    carEls[drag.i].style.transform = `translate(${x}px, ${y}px)`;
    const snap = Math.round(drag.cur);
    if (snap !== drag.lastSnap) { if (drag.lastSnap != null) sfx.key(); drag.lastSnap = snap; }
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { i, cur, p0, lo, hi } = drag;
    carEls[i].classList.remove('is-drag', 'no-anim');
    drag = null;
    const to = Math.round(cur);
    if (to !== p0) commit(i, to);
    else {
      place(i, p0);
      if (lo === hi) { sfx.bad(); say(i === 0 ? 'The red car is boxed in. Move what blocks it.' : `${info[i].plate} is boxed in.`); }
    }
  };
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);

  // ---- keyboard ----
  function nearest(from, dx, dy) {
    const cx = (k) => (vehicles[k].h ? pos[k] + vehicles[k].len / 2 : vehicles[k].c + 0.5);
    const cy = (k) => (vehicles[k].h ? vehicles[k].r + 0.5 : pos[k] + vehicles[k].len / 2);
    let best = -1, bd = Infinity;
    vehicles.forEach((_, k) => {
      if (k === from) return;
      const ddx = cx(k) - cx(from), ddy = cy(k) - cy(from);
      const along = ddx * dx + ddy * dy;
      if (along <= 0.01) return;
      const d = along + 2 * Math.abs(dx ? ddy : ddx);
      if (d < bd) { bd = d; best = k; }
    });
    return best;
  }
  root.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const g = e.target.closest?.('.gw-car');
    if (!g) return;
    const i = Number(g.dataset.v);
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault();
    if (done) return;
    const v = vehicles[i];
    const along = v.h ? d[0] : d[1];
    if (along) {
      const [lo, hi] = range(vehicles, pos, i);
      const to = pos[i] + along;
      if (to < lo || to > hi) { sfx.bad(); say(`${i === 0 ? 'The red car' : info[i].plate} cannot go that way.`); return; }
      commit(i, to);
    } else {
      const k = nearest(i, d[0], d[1]);
      if (k >= 0) { focusV = k; carEls[k].focus(); sfx.key(); }
    }
  });
  root.addEventListener('focusin', (e) => { const g = e.target.closest?.('.gw-car'); if (g) focusV = Number(g.dataset.v); });

  render(false);
  persist();
  progress();
  if (pos[0] === goalPos()) { done = true; root.classList.add('is-done'); render(false); }

  return {
    destroy() { clearTimeout(winTimer); clearTimeout(mapTimer); },
    hint() {
      if (done) return null;
      const m = nextMove();
      if (!m) return null;
      const v = vehicles[m.v];
      const dist = Math.abs(m.to - m.from);
      const dir = v.h ? (m.to > m.from ? 'right' : 'left') : (m.to > m.from ? 'down' : 'up');
      const g = carEls[m.v];
      commit(m.v, m.to);
      g.classList.remove('is-hint'); void g.getBBox?.(); g.classList.add('is-hint');
      setTimeout(() => g.classList.remove('is-hint'), 1400);
      const name = nameOf(m.v);
      const left = done ? 0 : movesLeft();
      return `${name[0].toUpperCase()}${name.slice(1)}: ${dir} ${NUM_WORD[dist] || dist} ${dist === 1 ? 'bay' : 'bays'}.${left > 0 ? ` ${left} more ${left === 1 ? 'move' : 'moves'} at best.` : ''}`;
    },
    devSolve() {
      if (done) return;
      for (let guard = 0; guard < 60 && !done; guard++) {
        const m = nextMove();
        if (!m) break;
        commit(m.v, m.to, { quiet: true });
      }
    },
  };
}
