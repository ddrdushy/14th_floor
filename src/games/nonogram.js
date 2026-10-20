// Nonogram: rebuild a picture from row and column run counts.
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'nonogram', name: 'Nonogram', category: 'Logic' };

const runs = (line) => {
  const out = [];
  let n = 0;
  for (const v of line) {
    if (v) n++;
    else if (n) { out.push(n); n = 0; }
  }
  if (n) out.push(n);
  return out.length ? out : [0];
};

export function mount(el, ctx) {
  const { params, saved } = ctx;
  const pic = params.picture.map((r) => [...r].map((c) => (c === '#' ? 1 : 0)));
  const R = pic.length, C = pic[0].length;
  const rowClues = pic.map(runs);
  const colClues = Array.from({ length: C }, (_, c) => runs(pic.map((r) => r[c])));
  const cells = saved?.cells || Array(R * C).fill(0); // 0 empty, 1 filled, 2 crossed
  let mode = 1;
  const status = h('p', { class: 'feedback' });

  const table = h('div', { class: 'ng', style: { gridTemplateColumns: `auto repeat(${C}, var(--ng-cell))` } });
  table.append(h('div', { class: 'ng-corner' }));
  const colEls = colClues.map((cl, c) => {
    const d = h('div', { class: `ng-col${c % 5 === 4 ? ' b5' : ''}` }, cl.map((n) => h('span', {}, n)));
    table.append(d);
    return d;
  });
  const rowEls = [];
  const cellEls = [];
  for (let r = 0; r < R; r++) {
    const rd = h('div', { class: `ng-row${r % 5 === 4 ? ' b5' : ''}` }, rowClues[r].map((n) => h('span', {}, n)));
    rowEls.push(rd);
    table.append(rd);
    for (let c = 0; c < C; c++) {
      const b = h('div', { class: `ng-cell${c % 5 === 4 ? ' r5' : ''}${r % 5 === 4 ? ' b5' : ''}`, 'data-i': r * C + c });
      cellEls.push(b);
      table.append(b);
    }
  }
  const fillBtn = h('button', { class: 'btn btn--small', 'aria-pressed': 'true', onclick: () => setMode(1) }, '■ Fill');
  const crossBtn = h('button', { class: 'btn btn--small', 'aria-pressed': 'false', onclick: () => setMode(2) }, '✕ Mark empty');
  el.append(
    h('p', { class: 'game-rules' }, 'Numbers give the runs of filled squares in each row and column, in order. Drag to paint. Mark squares you know are empty.'),
    h('div', { class: 'game-toolbar' }, fillBtn, crossBtn, h('button', { class: 'btn btn--small', onclick: () => { cells.fill(0); render(); persist(); } }, 'Clear')),
    h('div', { class: 'ng-scroll' }, table),
    status,
  );

  function setMode(m) {
    mode = m;
    fillBtn.setAttribute('aria-pressed', String(m === 1));
    crossBtn.setAttribute('aria-pressed', String(m === 2));
  }

  let painting = null;
  table.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('.ng-cell');
    if (!t) return;
    e.preventDefault();
    table.setPointerCapture(e.pointerId);
    const i = Number(t.dataset.i);
    painting = cells[i] === mode ? 0 : mode;
    paint(i);
  });
  table.addEventListener('pointermove', (e) => {
    if (painting == null) return;
    const t = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.ng-cell');
    if (t) paint(Number(t.dataset.i));
  });
  const stop = () => { if (painting != null) { painting = null; persist(); check(); } };
  table.addEventListener('pointerup', stop);
  table.addEventListener('pointercancel', stop);

  function paint(i) {
    if (cells[i] === painting) return;
    cells[i] = painting;
    sfx.key();
    render();
  }

  function persist() { ctx.onSave({ cells }); }

  function render() {
    cellEls.forEach((b, i) => {
      b.classList.toggle('is-on', cells[i] === 1);
      b.classList.toggle('is-x', cells[i] === 2);
    });
    for (let r = 0; r < R; r++) rowEls[r].classList.toggle('is-ok', runs(cells.slice(r * C, r * C + C).map((v) => v === 1)).join() === rowClues[r].join());
    for (let c = 0; c < C; c++) colEls[c].classList.toggle('is-ok', runs(Array.from({ length: R }, (_, r) => cells[r * C + c] === 1)).join() === colClues[c].join());
  }

  function check() {
    const ok = rowEls.filter((e) => e.classList.contains('is-ok')).length + colEls.filter((e) => e.classList.contains('is-ok')).length;
    ctx.onProgress(ok / (R + C));
    if (ok === R + C) {
      status.textContent = params.solvedText || 'The picture resolves: the sole of a shoe, mid-step.';
      status.className = 'feedback is-good';
      ctx.onSolved();
    }
  }

  render();
  check();
  return {
    hint() {
      for (let r = 0; r < R; r++) {
        if (!rowEls[r].classList.contains('is-ok')) {
          for (let c = 0; c < C; c++) cells[r * C + c] = pic[r][c] ? 1 : 2;
          render(); persist(); check();
          return `Row ${r + 1} restored from the cache.`;
        }
      }
      return null;
    },
    devSolve() { pic.forEach((row, r) => row.forEach((v, c) => { cells[r * C + c] = v ? 1 : 2; })); render(); check(); },
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Fill in squares to reveal a hidden picture.',
  steps: [
    'The numbers beside each row and above each column are clues.',
    '"3 1" means: 3 filled squares in a row, a gap, then 1.',
    'Tap or drag across squares to fill them.',
    'Switch to ✕ Mark empty for squares that must stay blank.',
    'A clue fades when its line is right. Finish every line.',
  ],
  example: {
    caption: 'Row clue "3 1": three filled squares, at least one gap, then one more. ✕ marks squares that stay empty.',
    render(el) {
      const fill = [1, 1, 1, 2, 1, 2, 2, 2];
      let s = rect(10, 28, 76, 34, { fill: '#efe6d0', stroke: C.line, sw: 1 }) + text(48, 52, '3  1', { size: 20, weight: 700, font: 'display' });
      s += grid(92, 28, 1, 8, 34, (r, c) => (fill[c] === 1 ? { fill: C.ink } : { t: '✕', color: C.soft, size: 16, font: 'ui' }), { sw: 1 });
      s += `<path d="M94 72 v6 h98 v-6" fill="none" stroke="${C.red}" stroke-width="2"/>` + text(143, 98, '3', { size: 18, weight: 700, fill: C.red, font: 'display' });
      s += `<path d="M230 72 v6 h30 v-6" fill="none" stroke="${C.red}" stroke-width="2"/>` + text(245, 98, '1', { size: 18, weight: 700, fill: C.red, font: 'display' });
      put(el, svg(380, 108, s, 'A row with the clue 3 1 solved: three filled squares, a gap, one filled square'));
    },
  },
  tips: ['Start with big numbers: a 13 in a 15-square row fixes most of it.'],
  controls: { touch: 'Tap or drag to fill. Pick ✕ Mark empty first to mark blanks.', keys: 'Mouse: click or drag to fill.' },
};
