// Searchlight: the Akari / Light Up puzzle, set in a dark warehouse yard.
// Put searchlights on empty squares. Each one lights its row and column until a wall (a stack of
// crates). Every square must be lit, no light may shine on another, and a number on a crate says
// exactly how many lights stand beside it. Every puzzle is generated with exactly one answer.
//
// params (all optional):
//   size   6..10, squares per side (default 7)
//   walls  'low' | 'medium' | 'high' crate density (default 'medium'); fewer crates = longer beams,
//          fewer numbers, more to work out
//   clue   story note shown above the yard, e.g. 'The guard said every corner was lit that night.'
import '../styles/games-d/searchlight.css';
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, C } from '../core/howto-kit.js';
import { generate, layout, check, solve, deduce, EMPTY, WALL, DENSITY } from './searchlight-logic.js';

export const meta = { id: 'searchlight', name: 'Searchlight', category: 'Logic' };
export const demo = { params: { size: 7, walls: 'medium', clue: 'Practice yard. In a case, a clue from the story is pinned here.' } };

const NONE = 0, LIGHT = 1, DOT = 2;
const STATE_WORD = ['empty', 'searchlight', 'marked no light'];
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const LAMP = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="sl-rays"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g><circle cx="12" cy="12" r="6.6"/></svg>';

export const howTo = {
  goal: 'Light up the whole yard with searchlights, with no light shining on another.',
  steps: [
    'Tap an empty square to put a searchlight there.',
    'A light shines along its row and column until it hits a crate.',
    'Every square must be lit. No light may shine on another light.',
    'A number on a crate means exactly that many lights touch it, side by side.',
    'Tap again for a dot: a note that no light goes there.',
  ],
  example: {
    caption: 'The 1 crate has one light beside it. That light lights its row and column up to the crates.',
    render(el) {
      const s = 40, x0 = 10, y0 = 10, n = 4;
      // walls: (1,1) numbered 1, (2,3) plain. Four lights, none seeing another, light every square.
      const wall = { '1,1': '1', '2,3': '' };
      const lightAt = [[0, 1], [3, 2], [2, 0], [1, 3]];
      const lit = new Set();
      for (const [r, c] of lightAt) {
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          let rr = r, cc = c;
          while (rr >= 0 && cc >= 0 && rr < n && cc < n && !(`${rr},${cc}` in wall)) { lit.add(`${rr},${cc}`); rr += dr; cc += dc; }
        }
      }
      let body = '';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const k = `${r},${c}`, X = x0 + c * s, Y = y0 + r * s;
        if (k in wall) {
          body += rect(X, Y, s, s, { fill: '#5b4a36', stroke: C.ink, sw: 1.2 });
          if (wall[k]) body += text(X + s / 2, Y + s / 2 + 8, wall[k], { size: 22, weight: 800, fill: C.paper, font: 'display' });
        } else body += rect(X, Y, s, s, { fill: lit.has(k) ? '#e9c46a' : '#2a3237', stroke: C.ink, sw: 1.2 });
      }
      for (const [r, c] of lightAt) {
        const cx = x0 + c * s + s / 2, cy = y0 + r * s + s / 2;
        body += `<circle cx="${cx}" cy="${cy}" r="9" fill="#fff4cf" stroke="${C.ink}" stroke-width="1.5"/>`;
      }
      body += rect(x0, y0, n * s, n * s, { fill: 'none', stroke: C.ink, sw: 2.5 });
      put(el, svg(n * s + 20, n * s + 20, body, 'A 4 by 4 yard with four searchlights lighting every square'));
    },
  },
  tips: [
    'A 0 crate: no light on any side. Dot them all first.',
    'A 4 crate, or a 3 against the edge: every free side gets a light.',
  ],
  controls: {
    touch: 'Tap a square: light, then dot, then empty again.',
    keys: 'Arrow keys move. Space or Enter: light, dot, empty. X marks a dot. Backspace clears.',
  },
};

function validPuzzle(p, n) {
  if (!p || p.n !== n || !Array.isArray(p.cells) || p.cells.length !== n * n) return false;
  if (!p.cells.every((v) => Number.isInteger(v) && (v === EMPTY || (v >= 0 && v <= WALL)))) return false;
  const res = solve(layout(n, p.cells), 2);
  return res.count === 1 ? res.solution : false;
}

export function mount(el, ctx) {
  const { params = {}, rng } = ctx;
  const n = Math.max(6, Math.min(10, Math.round(Number(params.size) || 7)));
  const density = params.walls in DENSITY ? params.walls : 'medium';

  // ---- puzzle: from the save when it still fits, otherwise generated from the seeded rng ----
  const saved = ctx.saved && typeof ctx.saved === 'object' ? ctx.saved : null;
  let puzzle = null, solution = null;
  const savedSol = saved && saved.v === 1 && saved.density === density ? validPuzzle(saved.puzzle, n) : false;
  if (savedSol) { puzzle = { n, cells: saved.puzzle.cells.slice() }; solution = savedSol; }
  else { const g = generate(n, density, rng); puzzle = { n, cells: g.cells }; solution = g.solution; }
  const lay = layout(n, puzzle.cells);
  const solSet = new Set(solution);

  let marks = new Array(n * n).fill(NONE);
  let given = new Set(); // cells fixed by a hint
  if (savedSol && Array.isArray(saved.marks) && saved.marks.length === n * n) {
    marks = saved.marks.map((m, i) => (puzzle.cells[i] === EMPTY && (m === LIGHT || m === DOT) ? m : NONE));
    given = new Set((Array.isArray(saved.given) ? saved.given : []).filter((i) => Number.isInteger(i) && puzzle.cells[i] === EMPTY && marks[i] !== NONE));
  }
  let done = false;
  let focusIdx = lay.empties[0] ?? 0;
  let solveTimer = null;

  // ---- DOM ----
  const status = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const count = h('p', { class: 'sl-count' });
  const grid = h('div', { class: 'sl-grid', role: 'grid', 'aria-label': `Yard, ${n} by ${n}. Arrow keys move, Space places a light.` });
  grid.style.setProperty('--sl-n', n);
  const btns = [];
  for (let r = 0; r < n; r++) {
    const row = h('div', { class: 'sl-row', role: 'row' });
    for (let c = 0; c < n; c++) {
      const i = r * n + c, v = puzzle.cells[i];
      let b;
      if (v === EMPTY) {
        b = h('button', { type: 'button', class: 'sl-cell', role: 'gridcell', tabindex: '-1', 'data-i': i,
          onclick: () => { if (!done) { focusIdx = i; cycle(i); } } },
        h('span', { class: 'sl-beam', 'aria-hidden': 'true' }), h('span', { class: 'sl-mark', 'aria-hidden': 'true', html: LAMP }));
      } else {
        b = h('div', { class: `sl-crate${v <= 4 ? ' has-num' : ''}`, role: 'gridcell', tabindex: '-1', 'data-i': i,
          'aria-label': `Row ${r + 1}, column ${c + 1}: crates${v <= 4 ? `, number ${v}` : ''}` },
        v <= 4 ? h('b', { 'aria-hidden': 'true' }, String(v)) : null);
      }
      btns[i] = b;
      row.append(b);
    }
    grid.append(row);
  }
  const clearBtn = h('button', { class: 'btn btn--small', type: 'button', onclick: clearAll }, 'Clear yard');

  el.append(
    h('p', { class: 'game-rules' }, 'Light every square with searchlights. A light shines along its row and column until a crate. No light may shine on another. A number says how many lights touch that crate.'),
    params.clue ? h('p', { class: 'sl-clue' }, h('span', { class: 'sl-clue-pin', 'aria-hidden': 'true' }), String(params.clue)) : null,
    h('div', { class: 'sl-yard' }, grid),
    h('div', { class: 'game-toolbar sl-bar' }, count, clearBtn),
    status,
  );

  function persist() {
    ctx.onSave({ v: 1, density, puzzle: { n, cells: puzzle.cells }, marks, given: [...given] });
  }
  function say(t, kind = '') { status.textContent = t; status.className = `feedback${kind ? ` is-${kind}` : ''}`; }
  const lightsList = () => lay.empties.filter((i) => marks[i] === LIGHT);
  const where = (i) => `row ${Math.floor(i / n) + 1}, column ${(i % n) + 1}`;

  function render() {
    const lights = lightsList();
    const res = check(lay, lights);
    const set = new Set(lights);
    // which direction lights each cell, for the beam bars
    const byRow = new Uint8Array(n * n), byCol = new Uint8Array(n * n);
    for (const l of lights) {
      for (const j of lay.segs[lay.rowSeg[l]]) byRow[j] = 1;
      for (const j of lay.segs[lay.colSeg[l]]) byCol[j] = 1;
    }
    const clashSegs = new Set();
    for (const l of res.clashes) { const rs = lay.rowSeg[l], cs = lay.colSeg[l]; if (lay.segs[rs].filter((j) => set.has(j)).length > 1) clashSegs.add(rs); if (lay.segs[cs].filter((j) => set.has(j)).length > 1) clashSegs.add(cs); }
    for (const i of lay.empties) {
      const b = btns[i], m = marks[i];
      const hot = clashSegs.has(lay.rowSeg[i]) || clashSegs.has(lay.colSeg[i]);
      b.className = `sl-cell${byRow[i] ? ' is-lr' : ''}${byCol[i] ? ' is-lc' : ''}${m === LIGHT ? ' is-light' : m === DOT ? ' is-dot' : ''}${res.clashes.has(i) ? ' is-clash' : ''}${hot ? ' is-hot' : ''}${given.has(i) ? ' is-given' : ''}`;
      b.tabIndex = i === focusIdx ? 0 : -1;
      b.setAttribute('aria-label', `Row ${Math.floor(i / n) + 1}, column ${(i % n) + 1}: ${STATE_WORD[m]}${m !== LIGHT ? (res.lit[i] ? ', lit' : ', dark') : ''}${res.clashes.has(i) ? ', shines on another light' : ''}${given.has(i) ? ', from a hint' : ''}`);
    }
    const over = new Set(res.over), ok = new Set(res.ok);
    // a crate dims once it is done: its lights are all there (a 0 dims once every side is dotted or lit)
    const settled = (w) => ok.has(w) && (puzzle.cells[w] > 0 || lay.adj[w].every((j) => puzzle.cells[j] !== EMPTY || marks[j] === DOT || res.lit[j]));
    for (const w of lay.numbers) {
      btns[w].className = `sl-crate has-num${over.has(w) ? ' is-over' : settled(w) ? ' is-ok' : ''}`;
      btns[w].tabIndex = w === focusIdx ? 0 : -1;
    }
    for (let i = 0; i < n * n; i++) if (puzzle.cells[i] === WALL) btns[i].tabIndex = i === focusIdx ? 0 : -1;
    count.textContent = `${lights.length} ${lights.length === 1 ? 'light' : 'lights'} · ${res.unlit} dark ${res.unlit === 1 ? 'square' : 'squares'}`;
    // progress: right lights placed, minus wrong ones; lit area counts a little
    const right = lights.filter((i) => solSet.has(i)).length, wrong = lights.length - right;
    const litShare = 1 - res.unlit / lay.empties.length;
    const p = res.solved ? 1 : Math.max(0, Math.min(0.95, 0.75 * ((right - wrong) / solution.length) + 0.2 * litShare));
    ctx.onProgress(p);
    return res;
  }

  function after(prevRes) {
    const res = render();
    persist();
    if (res.solved && !done) return win();
    if (res.clashes.size > (prevRes?.clashes.size || 0)) { sfx.bad(); say('Two searchlights shine on each other.', 'bad'); }
    else if (res.over.length > (prevRes?.over.length || 0)) { sfx.bad(); say('Too many lights beside that crate.', 'bad'); }
    else if (!res.unlit && !res.clashes.size && res.under.length) say('All lit, but a crate still wants more lights beside it.');
    else say('');
    return res;
  }

  function setMark(i, m) {
    if (done || puzzle.cells[i] !== EMPTY || given.has(i) || marks[i] === m) return;
    const prev = check(lay, lightsList());
    marks[i] = m;
    sfx.click();
    after(prev);
  }
  function cycle(i) { if (given.has(i)) { say('That one came from a hint. It is right.'); return; } setMark(i, (marks[i] + 1) % 3); }

  function clearAll() {
    if (done) return;
    for (const i of lay.empties) if (!given.has(i)) marks[i] = NONE;
    sfx.click();
    render(); persist();
    say('Yard cleared.');
  }

  function win() {
    done = true;
    grid.classList.add('is-done');
    clearBtn.disabled = true;
    sfx.good();
    say('Every corner of the yard is lit. Nothing hides here now.', 'good');
    solveTimer = setTimeout(() => ctx.onSolved(), reduced() ? 0 : 700);
  }

  // ---- keyboard: roving focus over the whole grid ----
  function moveFocus(dr, dc) {
    const r = Math.floor(focusIdx / n), c = focusIdx % n;
    const nr = Math.max(0, Math.min(n - 1, r + dr)), nc = Math.max(0, Math.min(n - 1, c + dc));
    focusIdx = nr * n + nc;
    btns.forEach((b, i) => { b.tabIndex = i === focusIdx ? 0 : -1; });
    btns[focusIdx].focus();
  }
  grid.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    const dir = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[k];
    if (dir) { e.preventDefault(); moveFocus(...dir); return; }
    const i = focusIdx;
    if (puzzle.cells[i] !== EMPTY || done) return;
    if (k === 'x' || k === 'X') { e.preventDefault(); if (given.has(i)) return; setMark(i, marks[i] === DOT ? NONE : DOT); }
    else if (k === 'l' || k === 'L') { e.preventDefault(); if (given.has(i)) return; setMark(i, marks[i] === LIGHT ? NONE : LIGHT); }
    else if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); setMark(i, NONE); }
    // Space and Enter reach the button's own click, which cycles
  });
  grid.addEventListener('focusin', (e) => {
    const i = Number(e.target?.dataset?.i);
    if (Number.isInteger(i) && i !== focusIdx) { focusIdx = i; btns.forEach((b, j) => { b.tabIndex = j === focusIdx ? 0 : -1; }); }
  });

  const first = render();
  persist();
  if (first.solved) { done = true; grid.classList.add('is-done'); clearBtn.disabled = true; }

  return {
    destroy() { clearTimeout(solveTimer); },
    hint() {
      if (done) return null;
      const res = render();
      // 1. a wrong searchlight is the most useful thing to point out
      const wrongLight = lightsList().find((i) => !solSet.has(i) && !given.has(i));
      if (wrongLight != null) {
        marks[wrongLight] = NONE;
        after(res); flash(wrongLight);
        return `The searchlight at ${where(wrongLight)} is wrong. Taken away.`;
      }
      const wrongDot = lay.empties.find((i) => marks[i] === DOT && solSet.has(i));
      if (wrongDot != null) {
        marks[wrongDot] = LIGHT; given.add(wrongDot);
        after(res); flash(wrongDot);
        return `That dot at ${where(wrongDot)} is wrong: a searchlight goes there.`;
      }
      // 2. the next light that plain logic forces from what is already right
      const known = { lights: lightsList(), dots: lay.empties.filter((i) => marks[i] === DOT) };
      const d = deduce(lay, known);
      const missing = solution.filter((i) => marks[i] !== LIGHT);
      let cell = d.lights.find((i) => solSet.has(i));
      let kind = LIGHT;
      if (cell == null) {
        // 3. no light is forced yet: rule out the empty square that would trap a player most, else any light
        const dot = d.dots.find((i) => marks[i] === NONE && !solSet.has(i));
        if (dot != null) { cell = dot; kind = DOT; }
        else cell = missing[Math.floor(rng() * missing.length)];
      }
      if (cell == null) return null;
      marks[cell] = kind; given.add(cell);
      after(res); flash(cell);
      return kind === LIGHT ? `A searchlight belongs at ${where(cell)}.` : `No light can stand at ${where(cell)}. Marked with a dot.`;
    },
    devSolve() {
      if (done) return;
      for (const i of lay.empties) marks[i] = solSet.has(i) ? LIGHT : NONE;
      after(null);
    },
  };

  function flash(i) {
    const b = btns[i];
    b.classList.remove('is-flash'); void b.offsetWidth; b.classList.add('is-flash');
    setTimeout(() => b.classList.remove('is-flash'), 1200);
  }
}
