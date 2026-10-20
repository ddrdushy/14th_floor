// Sudoku with a unique-solution generator, pencil marks and keyboard play.
import { h } from '../core/ui.js';
import { shuffle } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'sudoku', name: 'Sudoku', category: 'Numbers' };

const CLUES = { easy: 38, medium: 31, hard: 26, expert: 23 };

function canPlace(g, i, v) {
  const r = Math.floor(i / 9), c = i % 9;
  for (let k = 0; k < 9; k++) {
    if (g[r * 9 + k] === v || g[k * 9 + c] === v) return false;
  }
  const br = r - (r % 3), bc = c - (c % 3);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) if (g[(br + y) * 9 + bc + x] === v) return false;
  return true;
}

function fill(g, rng) {
  const i = g.indexOf(0);
  if (i < 0) return true;
  for (const v of shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (canPlace(g, i, v)) {
      g[i] = v;
      if (fill(g, rng)) return true;
      g[i] = 0;
    }
  }
  return false;
}

function countSolutions(g, limit = 2) {
  let best = -1, bestCount = 10;
  for (let i = 0; i < 81; i++) {
    if (g[i]) continue;
    let n = 0;
    for (let v = 1; v <= 9; v++) if (canPlace(g, i, v)) n++;
    if (n < bestCount) { bestCount = n; best = i; if (n === 0) return 0; }
  }
  if (best < 0) return 1;
  let count = 0;
  for (let v = 1; v <= 9 && count < limit; v++) {
    if (canPlace(g, best, v)) {
      g[best] = v;
      count += countSolutions(g, limit - count);
      g[best] = 0;
    }
  }
  return count;
}

export function generate(rng, difficulty = 'hard') {
  const solution = new Array(81).fill(0);
  fill(solution, rng);
  const puzzle = solution.slice();
  const target = CLUES[difficulty] || CLUES.hard;
  let filled = 81;
  for (const i of shuffle(rng, [...Array(81).keys()])) {
    if (filled <= target) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions(puzzle.slice()) !== 1) puzzle[i] = keep;
    else filled--;
  }
  return { puzzle, solution };
}

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const gen = saved?.puzzle ? saved : generate(rng, params.difficulty);
  const { puzzle, solution } = gen;
  const values = saved?.values || puzzle.slice();
  const notes = (saved?.notes || Array(81).fill(0)).slice(); // bitmask of pencil marks
  let sel = values.indexOf(0);
  let pencil = false;
  const empties = puzzle.filter((v) => !v).length;

  const grid = h('div', { class: 'sdk', role: 'grid', 'aria-label': 'Sudoku grid' });
  const cells = [];
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9), c = i % 9;
    const cell = h('button', {
      class: `sdk-cell${puzzle[i] ? ' is-given' : ''}${c % 3 === 2 && c < 8 ? ' br' : ''}${r % 3 === 2 && r < 8 ? ' bb' : ''}`,
      role: 'gridcell',
      'aria-label': `Row ${r + 1} column ${c + 1}`,
      onclick: () => select(i),
    });
    cells.push(cell);
    grid.append(cell);
  }

  const pencilBtn = h('button', { class: 'btn btn--small', 'aria-pressed': 'false', onclick: () => togglePencil() }, 'Pencil marks');
  const pad = h('div', { class: 'sdk-pad' },
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => h('button', { class: 'btn', onclick: () => input(n) }, String(n))),
    h('button', { class: 'btn', onclick: () => input(0), 'aria-label': 'Erase' }, 'Erase'),
  );
  const status = h('p', { class: 'feedback' });

  el.append(
    h('p', { class: 'game-rules' }, 'Place 1 to 9 in every empty square so no digit repeats in a row, column or bold 3×3 box. Arrow keys move, numbers fill, P toggles pencil marks.'),
    h('div', { class: 'sdk-wrap' }, grid, h('div', { class: 'sdk-side' }, h('div', { class: 'game-toolbar' }, pencilBtn), pad)),
    status,
  );

  function togglePencil() {
    pencil = !pencil;
    pencilBtn.setAttribute('aria-pressed', String(pencil));
  }

  function select(i) {
    sel = i;
    render();
  }

  function input(n) {
    if (sel < 0 || puzzle[sel]) return;
    sfx.key();
    if (pencil && n) {
      notes[sel] ^= 1 << n;
    } else {
      values[sel] = n;
      notes[sel] = 0;
      if (n) {
        // clear this digit from pencil marks in the same row, column and box
        for (let j = 0; j < 81; j++) {
          const same = Math.floor(j / 9) === Math.floor(sel / 9) || j % 9 === sel % 9 ||
            (Math.floor(j / 27) === Math.floor(sel / 27) && Math.floor((j % 9) / 3) === Math.floor((sel % 9) / 3));
          if (same) notes[j] &= ~(1 << n);
        }
      }
    }
    render();
    persist();
    check();
  }

  function conflicts(i) {
    const v = values[i];
    if (!v) return false;
    const r = Math.floor(i / 9), c = i % 9;
    for (let j = 0; j < 81; j++) {
      if (j === i || values[j] !== v) continue;
      const rj = Math.floor(j / 9), cj = j % 9;
      if (rj === r || cj === c || (Math.floor(rj / 3) === Math.floor(r / 3) && Math.floor(cj / 3) === Math.floor(c / 3))) return true;
    }
    return false;
  }

  function render() {
    const sv = sel >= 0 ? values[sel] : 0;
    cells.forEach((cell, i) => {
      const r = Math.floor(i / 9), c = i % 9;
      const sr = Math.floor(sel / 9), sc = sel % 9;
      const peer = sel >= 0 && (r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3)));
      cell.classList.toggle('is-sel', i === sel);
      cell.classList.toggle('is-peer', peer && i !== sel);
      cell.classList.toggle('is-same', !!sv && values[i] === sv && i !== sel);
      cell.classList.toggle('is-bad', conflicts(i));
      if (values[i]) {
        cell.textContent = values[i];
      } else if (notes[i]) {
        cell.innerHTML = `<span class="sdk-notes">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<i>${notes[i] & (1 << n) ? n : ''}</i>`).join('')}</span>`;
      } else cell.textContent = '';
    });
  }

  function correctCount() {
    let n = 0;
    for (let i = 0; i < 81; i++) if (!puzzle[i] && values[i] === solution[i]) n++;
    return n;
  }

  function check() {
    const n = correctCount();
    ctx.onProgress(n / empties);
    if (values.every((v, i) => v === solution[i])) {
      status.textContent = 'Every row, column and box holds.';
      status.className = 'feedback is-good';
      ctx.onSolved();
    } else if (values.every((v) => v)) {
      status.textContent = 'The grid is full but something does not add up. Look for the red digits.';
      status.className = 'feedback is-bad';
      sfx.bad();
    }
  }

  function persist() {
    ctx.onSave({ puzzle, solution, values, notes });
  }

  const onKey = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (/^[1-9]$/.test(e.key)) input(Number(e.key));
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') input(0);
    else if (e.key === 'p' || e.key === 'P') togglePencil();
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const d = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key];
      sel = (sel + d + 81) % 81;
      render();
    }
  };
  document.addEventListener('keydown', onKey);
  render();
  ctx.onProgress(correctCount() / empties);
  persist();

  return {
    destroy: () => document.removeEventListener('keydown', onKey),
    hint() {
      const wrong = values.findIndex((v, i) => v && v !== solution[i]);
      if (wrong >= 0) {
        select(wrong);
        return `The ${values[wrong]} in row ${Math.floor(wrong / 9) + 1}, column ${(wrong % 9) + 1} is wrong.`;
      }
      // reveal the most constrained empty cell
      let best = -1, bestN = 10;
      for (let i = 0; i < 81; i++) {
        if (values[i]) continue;
        let n = 0;
        for (let v = 1; v <= 9; v++) if (canPlace(values, i, v)) n++;
        if (n < bestN) { bestN = n; best = i; }
      }
      if (best < 0) return null;
      select(best);
      values[best] = solution[best];
      render(); persist(); check();
      return `The lab enhanced one square: row ${Math.floor(best / 9) + 1}, column ${(best % 9) + 1} is ${solution[best]}.`;
    },
    devSolve() {
      for (let i = 0; i < 81; i++) values[i] = solution[i];
      render(); persist(); check();
    },
  };
}
