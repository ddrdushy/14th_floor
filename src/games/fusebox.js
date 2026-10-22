// Fuse box: the building is blacked out. Flip breakers until every one is ON. Each flip also switches
// some neighbours (Lights Out). Boards are made by flipping breakers on a fully lit panel, so every
// board can be solved; the fewest-flip solution (par, and the hints) comes from GF(2) algebra.
//
// params (all optional):
//   size     3..6, breakers per side (default 4)
//   pattern  'plus' (default: itself + up/down/left/right) | 'x' (itself + the 4 diagonals)
//            | 'row' (itself + its whole row and column; hardest to see)
//   presses  3..12, scramble flips (default 5). This is par, capped by what a board allows
//            (3x3 has only 9 breakers; 4x4 plus tops out near 6, 3x3 row at 3, 5x5 row at 8)
//   clue     story note shown above the panel
import '../styles/games-d/fusebox.css';
import { h, svgEl } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, arrow, C } from '../core/howto-kit.js';
import { clampParams, generate, solve, press, isSolved, litRows, maskOf } from './fusebox-logic.js';

export { generate, solve } from './fusebox-logic.js';

export const meta = { id: 'fusebox', name: 'Fuse Box', category: 'Logic' };
export const demo = { params: { size: 4, pattern: 'plus', presses: 5, clue: 'Practice panel. In a case, a note from the story is pinned here.' } };

const REACH = {
  plus: 'the breakers above, below, left and right of it',
  x: 'the four breakers on its corners (diagonals)',
  row: 'every breaker in its row and its column',
};
const TOP_FLOOR = 14;
const floorOf = (r) => TOP_FLOOR - r;

/** A tiny glyph of which breakers one flip switches. */
function patternGlyph(pattern, size = 22) {
  const n = pattern === 'row' ? 5 : 3, mid = Math.floor(n / 2), s = size / n;
  const on = new Set(maskOf(n, pattern, mid * n + mid));
  const g = svgEl('svg', { class: 'fb-glyph', viewBox: `0 0 ${size} ${size}`, width: size, height: size, 'aria-hidden': 'true' });
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n;
    g.append(svgEl('rect', { x: c * s + 0.6, y: r * s + 0.6, width: s - 1.2, height: s - 1.2, rx: 0.8,
      class: i === mid * n + mid ? 'is-me' : on.has(i) ? 'is-on' : '' }));
  }
  return g;
}

export const howTo = {
  goal: 'Turn every breaker ON to bring the power back.',
  steps: ({ params }) => {
    const { pattern } = clampParams(params);
    return [
      'Tap a breaker to flip it.',
      `Each flip also switches ${REACH[pattern]}.`,
      'ON breakers glow amber. OFF ones are dark.',
      'A floor lamp lights when its whole row is ON.',
      'Try to finish in par flips or fewer. Undo is free.',
    ];
  },
  example: {
    caption: ({ params }) => ({
      plus: 'Flip the middle breaker: it and its 4 neighbours switch. OFF turns ON, ON turns OFF.',
      x: 'Flip the middle breaker: it and its 4 corner breakers switch. OFF turns ON, ON turns OFF.',
      row: 'Flip the middle breaker: its whole row and column switch. OFF turns ON, ON turns OFF.',
    }[clampParams(params).pattern]),
    render(el, info) {
      const { pattern } = clampParams(info?.params);
      const n = 3, s = 30, mid = 4;
      // a board one flip from done, so the example ends with the panel fully lit
      const before = pattern === 'x' ? [0, 1, 0, 1, 0, 1, 0, 1, 0] : [1, 0, 1, 0, 0, 0, 1, 0, 1];
      const reach = new Set(maskOf(n, pattern, mid));
      const after = before.map((v, i) => (reach.has(i) ? 1 - v : v));
      const draw = (x0, b, ringIt) => {
        let o = rect(x0 - 6, 6, n * s + 12, n * s + 12, { fill: '#2a3238', stroke: '#11161a', sw: 2, rx: 6 });
        b.forEach((v, i) => {
          const x = x0 + (i % n) * s, y = 12 + Math.floor(i / n) * s;
          o += rect(x + 2, y + 2, s - 4, s - 4, { fill: v ? C.amber : '#141a1e', stroke: v ? '#f6cf8c' : '#3a444b', sw: 1.5, rx: 3 });
          o += rect(x + s / 2 - 4, y + (v ? 6 : s - 15), 8, 9, { fill: v ? '#fff3d6' : '#55606a', stroke: 'none', sw: 0, rx: 2 });
        });
        if (ringIt) o += `<rect x="${x0 + s - 1}" y="${12 + s - 1}" width="${s + 2}" height="${s + 2}" rx="5" fill="none" stroke="${C.red}" stroke-width="3"/>`;
        return o;
      };
      let m = draw(20, before, true) + arrow(140, 57, 196, 57, { bend: -10 }) + draw(220, after, false);
      m += text(65, 128, 'before', { size: 13, fill: C.soft }) + text(265, 128, 'after one flip', { size: 13, fill: C.soft });
      put(el, svg(340, 136, m, 'A 3 by 3 breaker panel before and after flipping the middle breaker'));
    },
  },
  tips: [
    'Flipping the same breaker twice undoes it. Each breaker needs at most one flip.',
    'Order does not matter. Only which breakers you flip.',
  ],
  controls: {
    touch: 'Tap a breaker to flip it. Undo and Reset are under the panel.',
    keys: 'Arrow keys move between breakers, Enter or Space flips, U or Ctrl+Z undoes.',
  },
};

export function mount(el, ctx) {
  const { params = {}, rng } = ctx;
  const P = clampParams(params);
  const { size: n, pattern } = P;
  const N = n * n;
  const gen = generate(rng, P);
  const start = gen.start;
  const par = gen.par;

  // ---- state (restored if the save fits this board) ----
  let hist = [];
  const sv = ctx.saved && typeof ctx.saved === 'object' ? ctx.saved : null;
  if (sv && sv.v === 1 && Array.isArray(sv.start) && sv.start.join('') === start.join('') && Array.isArray(sv.hist)) {
    hist = sv.hist.filter((i) => Number.isInteger(i) && i >= 0 && i < N).slice(0, 500);
  }
  const boardFrom = (list) => list.reduce((b, i) => press(b, n, pattern, i), start.slice());
  let board = boardFrom(hist);
  let done = isSolved(board);
  let hintCell = -1;
  let focusIdx = 0;
  let solveTimer = null;
  let destroyed = false;

  // ---- DOM ----
  const status = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const counter = h('p', { class: 'fb-count', 'aria-live': 'off' });
  const lamps = Array.from({ length: n }, (_, r) => h('li', { class: 'fb-lamp', style: { '--i': r } },
    h('span', { class: 'fb-bulb', 'aria-hidden': 'true' }), h('span', { class: 'fb-fl' }, `${floorOf(r)}F`)));
  const lampStrip = h('ol', { class: 'fb-floors', 'aria-label': 'Floor lamps' }, lamps);
  const cells = [];
  const grid = h('div', { class: 'fb-grid', role: 'grid', 'aria-label': `Breaker panel, ${n} by ${n}` });
  for (let r = 0; r < n; r++) {
    const row = h('div', { class: 'fb-row', role: 'row' }, h('span', { class: 'fb-tag', 'aria-hidden': 'true' }, String(floorOf(r))));
    for (let c = 0; c < n; c++) {
      const i = r * n + c;
      const b = h('button', {
        class: 'fb-brk', type: 'button', role: 'gridcell', tabindex: i === 0 ? '0' : '-1',
        onclick: () => flip(i),
        onfocus: () => { focusIdx = i; reach(i, true); },
        onblur: () => reach(i, false),
        onpointerenter: (e) => { if (e.pointerType === 'mouse') reach(i, true); },
        onpointerleave: (e) => { if (e.pointerType === 'mouse') reach(i, false); },
      }, h('span', { class: 'fb-slot', 'aria-hidden': 'true' }, h('span', { class: 'fb-lever' })));
      cells.push(b);
      row.append(b);
    }
    grid.append(row);
  }
  const undoBtn = h('button', { class: 'btn btn--small fb-tool', type: 'button', onclick: undo }, 'Undo');
  const resetBtn = h('button', { class: 'btn btn--small fb-tool', type: 'button', onclick: reset }, 'Reset');
  const box = h('div', { class: 'fb-box' },
    h('div', { class: 'fb-head' },
      h('span', { class: 'fb-plate' }, 'MAIN DB · BLOCK B'),
      counter),
    lampStrip,
    grid,
    h('div', { class: 'fb-tools' }, undoBtn, resetBtn));
  box.style.setProperty('--n', n);

  el.append(
    h('p', { class: 'game-rules' }, `The building is dark. Flip breakers until all ${N} are ON. Each flip also switches ${REACH[pattern]}.`),
    params.clue ? h('p', { class: 'fb-clue' }, h('span', { class: 'fb-clue-pin', 'aria-hidden': 'true' }), params.clue) : null,
    h('p', { class: 'fb-legend' }, patternGlyph(pattern), h('span', {}, `One flip switches the breaker ${pattern === 'row' ? 'and its whole row and column' : pattern === 'x' ? 'and its 4 corners' : 'and its 4 neighbours'}.`)),
    box,
    status,
  );

  function persist() { ctx.onSave({ v: 1, start, hist }); }
  function say(t, kind = '') { status.textContent = t; status.className = `feedback${kind ? ` is-${kind}` : ''}`; }

  function reach(i, on) {
    for (const j of maskOf(n, pattern, i)) cells[j].classList.toggle('is-reach', on && !done);
  }

  function render() {
    const lit = litRows(board, n);
    board.forEach((v, i) => {
      const b = cells[i], r = Math.floor(i / n), c = i % n;
      b.classList.toggle('is-on', !!v);
      b.classList.toggle('is-hint', i === hintCell);
      b.setAttribute('aria-pressed', String(!!v));
      b.setAttribute('aria-label', `Floor ${floorOf(r)}, breaker ${c + 1}: ${v ? 'on' : 'off'}${i === hintCell ? ', flip this one' : ''}`);
      b.tabIndex = i === focusIdx ? 0 : -1;
    });
    lamps.forEach((l, r) => {
      l.classList.toggle('is-lit', lit[r]);
      l.setAttribute('aria-label', `Floor ${floorOf(r)}: ${lit[r] ? 'lights on' : 'dark'}`);
    });
    grid.querySelectorAll('.fb-row').forEach((row, r) => row.classList.toggle('is-lit', lit[r]));
    counter.textContent = `Flips ${hist.length} · Par ${par}`;
    counter.classList.toggle('is-over', hist.length > par && !done);
    undoBtn.disabled = done || !hist.length;
    resetBtn.disabled = done || !hist.length;
    box.classList.toggle('is-solved', done);
    // progress: how much of the shortest fix is behind the player, plus a little for lit breakers
    if (done) ctx.onProgress(1);
    else {
      const left = solve(board, n, pattern).length;
      const litFrac = board.reduce((s, v) => s + v, 0) / N;
      ctx.onProgress(Math.min(0.95, Math.max(0, 0.85 * (1 - left / Math.max(1, par)) + 0.1 * litFrac)));
    }
  }

  function flip(i) {
    if (done) return;
    const before = litRows(board, n);
    board = press(board, n, pattern, i);
    hist.push(i);
    if (i === hintCell) hintCell = -1;
    else if (hintCell >= 0 && !solve(board, n, pattern).includes(hintCell)) hintCell = -1;
    focusIdx = i;
    sfx.stamp();
    const after = litRows(board, n);
    persist();
    if (isSolved(board)) { win(); return; }
    const newly = after.map((v, r) => v && !before[r] ? r : -1).filter((r) => r >= 0);
    if (newly.length) { sfx.good(); say(`Floor ${newly.map(floorOf).join(' and ')} ${newly.length > 1 ? 'have' : 'has'} power.`); }
    else say(hist.length > par ? `Over par. Undo or keep going.` : '');
    render();
  }

  function undo() {
    if (done || !hist.length) return;
    hist.pop();
    board = boardFrom(hist);
    hintCell = -1;
    sfx.click();
    say('Undone.');
    persist(); render();
  }
  function reset() {
    if (done || !hist.length) return;
    hist = [];
    board = start.slice();
    hintCell = -1;
    sfx.click();
    say('Panel back to how you found it.');
    persist(); render();
  }

  function win() {
    done = true;
    hintCell = -1;
    cells.forEach((b) => b.classList.remove('is-reach'));
    render();
    const f = hist.length;
    say(f <= par ? `Power is back on every floor. ${f} flips, par ${par}. Clean work.` : `Power is back on every floor. ${f} flips, par ${par}.`, 'good');
    solveTimer = setTimeout(() => { if (!destroyed) ctx.onSolved(); }, 650);
  }

  const onKey = (e) => {
    if (!el.isConnected || done) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'u' || e.key === 'U') { undo(); return; }
    const inGrid = t && grid.contains(t);
    if (!inGrid) return;
    const r = Math.floor(focusIdx / n), c = focusIdx % n;
    let nx = -1;
    if (e.key === 'ArrowLeft') nx = r * n + Math.max(0, c - 1);
    else if (e.key === 'ArrowRight') nx = r * n + Math.min(n - 1, c + 1);
    else if (e.key === 'ArrowUp') nx = Math.max(0, r - 1) * n + c;
    else if (e.key === 'ArrowDown') nx = Math.min(n - 1, r + 1) * n + c;
    else if (e.key === 'Home') nx = r * n;
    else if (e.key === 'End') nx = r * n + n - 1;
    if (nx < 0) return;
    e.preventDefault();
    focusIdx = nx;
    cells.forEach((b, i) => { b.tabIndex = i === nx ? 0 : -1; });
    cells[nx].focus();
  };
  document.addEventListener('keydown', onKey);

  persist();
  render();
  if (done) say('Power is back on every floor.', 'good');

  return {
    destroy() {
      destroyed = true;
      clearTimeout(solveTimer);
      document.removeEventListener('keydown', onKey);
    },
    hint() {
      if (done) return null;
      const sol = solve(board, n, pattern);
      if (!sol || !sol.length) return null;
      hintCell = sol.includes(hintCell) ? hintCell : sol[Math.floor(rng() * sol.length)];
      render();
      const r = Math.floor(hintCell / n), c = hintCell % n;
      return `The pulsing breaker (floor ${floorOf(r)}, number ${c + 1}) is part of the fastest fix. ${sol.length} flip${sol.length > 1 ? 's' : ''} to go.`;
    },
    devSolve() {
      if (done) return;
      const sol = solve(board, n, pattern);
      for (const i of sol) { board = press(board, n, pattern, i); hist.push(i); }
      persist();
      if (isSolved(board)) win();
    },
  };
}
