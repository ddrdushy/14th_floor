// Word search. Variants: 'list' (words shown), 'hidden' (only a count), 'secret' (leftover letters spell a message).
import { h } from '../core/ui.js';
import { shuffle, pick } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'wordsearch', name: 'Word Search', category: 'Words' };

const DIRS = [[1, 0], [0, 1], [1, 1], [-1, 1], [-1, 0], [0, -1], [-1, -1], [1, -1]];
const ALPHA = 'ABCDEFGHIJKLMNOPRSTUWY';

function tryPlace(grid, n, word, rng, owner) {
  const options = [];
  for (const [dx, dy] of DIRS) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const ex = x + dx * (word.length - 1), ey = y + dy * (word.length - 1);
        if (ex < 0 || ey < 0 || ex >= n || ey >= n) continue;
        let overlap = 0, ok = true;
        for (let k = 0; k < word.length; k++) {
          const ch = grid[(y + dy * k) * n + x + dx * k];
          if (ch && ch !== word[k]) { ok = false; break; }
          if (ch) overlap++;
        }
        if (ok && overlap < word.length) options.push({ x, y, dx, dy, overlap });
      }
    }
  }
  if (!options.length) return null;
  // prefer overlaps: they make room for the secret message and make the grid denser
  options.sort((a, b) => b.overlap - a.overlap);
  const top = options.filter((o) => o.overlap === options[0].overlap);
  const o = rng() < 0.6 ? pick(rng, top) : pick(rng, options);
  const cells = [];
  for (let k = 0; k < word.length; k++) {
    const i = (o.y + o.dy * k) * n + o.x + o.dx * k;
    grid[i] = word[k];
    cells.push(i);
  }
  return { word, cells, owner };
}

export function generate(rng, { size, words, extra = [], message = '' }) {
  if (!message) return generateSized(rng, size, words, extra, message, 400);
  // With a secret message, every non-message cell must belong to a word, so the grid can only be
  // as large as the available letters allow. Start at the requested size and shrink until it fits.
  const letters = [...words, ...extra].reduce((s, w) => s + w.length, 0);
  const longest = Math.max(...words.map((w) => w.length));
  for (let n = size; n >= longest; n--) {
    if (n * n - message.length > letters) continue;
    const out = generateSized(rng, n, words, extra, message, 250);
    if (out) return out;
  }
  throw new Error('word search generation failed');
}

function generateSized(rng, n, words, extra, message, attempts) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const grid = new Array(n * n).fill('');
    const placed = [];
    let ok = true;
    for (const w of shuffle(rng, words).sort((a, b) => b.length - a.length)) {
      const p = tryPlace(grid, n, w, rng);
      if (!p) { ok = false; break; }
      placed.push(p);
    }
    if (!ok) continue;
    const free = () => grid.filter((c) => !c).length;
    if (message) {
      // add extra words until the free cells exactly fit the message
      for (const w of shuffle(rng, extra)) {
        if (free() === message.length) break;
        const before = grid.slice();
        const p = tryPlace(grid, n, w, rng);
        if (!p) continue;
        if (free() < message.length) { grid.splice(0, grid.length, ...before); continue; }
        placed.push(p);
      }
      if (free() !== message.length) continue;
      let k = 0;
      for (let i = 0; i < grid.length; i++) if (!grid[i]) grid[i] = message[k++];
    } else {
      for (let i = 0; i < grid.length; i++) if (!grid[i]) grid[i] = pick(rng, ALPHA);
    }
    return { n, grid, placed };
  }
  if (!message) throw new Error('word search generation failed');
  return null;
}

export function mount(el, ctx) {
  const { rng, params, variant, saved } = ctx;
  const gen = saved?.gen || generate(rng, params);
  const { n, grid, placed } = gen;
  const found = new Set(saved?.found || []);
  const secret = variant === 'secret';
  const total = placed.length;

  const board = h('div', { class: 'ws-grid', style: { gridTemplateColumns: `repeat(${n}, 1fr)` }, role: 'grid', 'aria-label': 'Letter grid' });
  const cells = grid.map((ch, i) => {
    const c = h('div', { class: 'ws-cell', 'data-i': i }, ch);
    board.append(c);
    return c;
  });
  const svgNS = 'http://www.w3.org/2000/svg';
  const lines = document.createElementNS(svgNS, 'svg');
  lines.setAttribute('class', 'ws-lines');
  lines.setAttribute('viewBox', `0 0 ${n} ${n}`);
  const wrap = h('div', { class: 'ws-wrap' }, board, lines);

  const list = h('ul', { class: 'ws-list' });
  const listItems = new Map();
  if (variant !== 'hidden') {
    for (const p of [...placed].sort((a, b) => a.word.localeCompare(b.word))) {
      const li = h('li', {}, p.word);
      listItems.set(p.word, li);
      list.append(li);
    }
  }
  const counter = h('p', { class: 'ws-count doc' });
  const secretBox = h('div', { class: 'ws-secret', hidden: true });
  const status = h('p', { class: 'feedback' });
  el.append(
    h('p', { class: 'game-rules' }, secret
      ? 'Drag across letters to circle a word, in any of eight directions. Find every listed item, then read the leftover letters left to right, top to bottom.'
      : 'Drag across letters to circle a word, in any of eight directions.'),
    h('div', { class: 'ws-layout' }, wrap, h('div', {}, counter, list)),
    secretBox,
    status,
  );

  const centre = (i) => [(i % n) + 0.5, Math.floor(i / n) + 0.5];
  function drawFound(p, cls = 'found') {
    const [x1, y1] = centre(p.cells[0]);
    const [x2, y2] = centre(p.cells[p.cells.length - 1]);
    const line = document.createElementNS(svgNS, 'line');
    Object.entries({ x1, y1, x2, y2, class: cls }).forEach(([k, v]) => line.setAttribute(k, v));
    lines.append(line);
    return line;
  }

  function refresh() {
    lines.querySelectorAll('.found').forEach((l) => l.remove());
    for (const p of placed) {
      if (!found.has(p.word)) continue;
      drawFound(p);
      listItems.get(p.word)?.classList.add('is-found');
    }
    counter.textContent = `${found.size} of ${total} found`;
    ctx.onProgress(found.size / total);
    if (found.size === total) finish();
  }

  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    const used = new Set(placed.flatMap((p) => p.cells));
    if (secret) {
      cells.forEach((c, i) => { if (!used.has(i)) c.classList.add('is-left'); });
      secretBox.hidden = false;
      secretBox.innerHTML = '';
      const input = h('input', { class: 'text-input', placeholder: 'Type the hidden message', 'aria-label': 'Hidden message', autocomplete: 'off' });
      const go = h('button', { class: 'btn btn--primary' }, 'Check message');
      const check = () => {
        const v = input.value.toUpperCase().replace(/[^A-Z]/g, '');
        if (v === params.message) {
          status.textContent = `"${params.messageSpaced}"`;
          status.className = 'feedback is-good';
          ctx.onSolved();
        } else {
          sfx.bad();
          status.textContent = 'That is not what the letters say. Read the highlighted letters in order.';
          status.className = 'feedback is-bad';
        }
      };
      go.onclick = check;
      input.addEventListener('keydown', (e) => e.key === 'Enter' && check());
      secretBox.append(h('p', { class: 'doc' }, 'Every item is circled. The leftover letters are highlighted.'), h('div', { class: 'ws-secret-row' }, input, go));
      input.focus();
    } else {
      ctx.onSolved();
    }
  }

  // drag selection
  let start = null, temp = null;
  const cellAt = (e) => {
    const t = document.elementFromPoint(e.clientX, e.clientY);
    return t && t.classList?.contains('ws-cell') ? Number(t.dataset.i) : null;
  };
  const lineCells = (a, b) => {
    const ax = a % n, ay = Math.floor(a / n), bx = b % n, by = Math.floor(b / n);
    const dx = Math.sign(bx - ax), dy = Math.sign(by - ay);
    const len = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    if (!(ax === bx || ay === by || Math.abs(bx - ax) === Math.abs(by - ay))) return null;
    return Array.from({ length: len + 1 }, (_, k) => (ay + dy * k) * n + ax + dx * k);
  };
  board.addEventListener('pointerdown', (e) => {
    const i = cellAt(e);
    if (i == null || finished) return;
    e.preventDefault();
    board.setPointerCapture(e.pointerId);
    start = i;
    temp = drawFound({ cells: [i, i] }, 'temp');
  });
  board.addEventListener('pointermove', (e) => {
    if (start == null) return;
    const i = cellAt(e);
    if (i == null) return;
    const lc = lineCells(start, i);
    if (!lc) return;
    temp.remove();
    temp = drawFound({ cells: lc }, 'temp');
  });
  const end = (e) => {
    if (start == null) return;
    const i = cellAt(e);
    temp?.remove();
    const lc = i != null ? lineCells(start, i) : null;
    start = null;
    if (!lc || lc.length < 2) return;
    const key = lc.join(',');
    const rev = [...lc].reverse().join(',');
    const hit = placed.find((p) => !found.has(p.word) && (p.cells.join(',') === key || p.cells.join(',') === rev));
    if (hit) {
      found.add(hit.word);
      sfx.good();
      ctx.onSave({ gen, found: [...found] });
      refresh();
    } else {
      sfx.click();
    }
  };
  board.addEventListener('pointerup', end);
  board.addEventListener('pointercancel', () => { temp?.remove(); start = null; });

  ctx.onSave({ gen, found: [...found] });
  refresh();

  return {
    hint() {
      const p = placed.find((q) => !found.has(q.word));
      if (!p) {
        if (!secret || !finished) return null;
        const words = params.messageSpaced.split(' ');
        return `The leftover letters start with "${words.slice(0, 2).join(' ')}".`;
      }
      const c = cells[p.cells[0]];
      c.classList.add('is-hint');
      setTimeout(() => c.classList.remove('is-hint'), 4000);
      return variant === 'hidden' ? `One word starts at the flashing letter.` : `${p.word} starts at the flashing letter.`;
    },
    devSolve() {
      placed.forEach((p) => found.add(p.word));
      ctx.onSave({ gen, found: [...found] });
      refresh();
      if (secret) {
        const inp = el.querySelector('.ws-secret input');
        if (inp) { inp.value = params.message; el.querySelector('.ws-secret .btn').click(); }
      }
    },
  };
}

// ---------- How to play (see core/howto.js) ----------
const wsExample = {
  caption: 'Press on C and slide to N. COIN gets a red line and is crossed off the list.',
  render(el) {
    const rows = ['KCOIN', 'ATEAP', 'RMLDU', 'SHOEB', 'WIREG'];
    let s = grid(14, 14, 5, 5, 32, (r, c) => ({ t: rows[r][c], font: 'doc', size: 17 }), { sw: 0.6 });
    const under = 14 + 32 * 5 + 14;
    s += `<line x1="${14 + 32 * 1.5}" y1="30" x2="${14 + 32 * 4.5}" y2="30" stroke="${C.red}" stroke-width="20" stroke-linecap="round" opacity=".32"/>`;
    s += arrow(14 + 32 * 1.5, under, 14 + 32 * 4.5, under, { sw: 2.5, head: 8 }) + text(14 + 32 * 1.5, under + 20, 'press', { size: 11, weight: 700, fill: C.red }) + text(14 + 32 * 4.5, under + 20, 'let go', { size: 11, weight: 700, fill: C.red });
    s += text(210, 30, 'Find:', { size: 14, weight: 700, anchor: 'start' });
    s += text(210, 56, 'COIN', { size: 16, anchor: 'start', font: 'doc', fill: C.soft }) + `<line x1="208" y1="51" x2="258" y2="51" stroke="${C.red}" stroke-width="2.5"/>`;
    s += text(210, 82, 'SHOE', { size: 16, anchor: 'start', font: 'doc' }) + text(210, 108, 'WIRE', { size: 16, anchor: 'start', font: 'doc' });
    put(el, svg(300, 214, s, 'A letter grid with the word COIN circled'));
  },
};
export const howTo = {
  goal: 'Find every word on the list, hidden in the letter grid.',
  steps: [
    'Pick a word from the list.',
    'Find its first letter in the grid.',
    'Press on that letter and slide to the last letter.',
    'Words go across, down, diagonal, and even backwards.',
    'Found words get a red line and are crossed off.',
  ],
  example: wsExample,
  controls: { touch: 'Press and slide your finger across the letters.', keys: 'Mouse: click the first letter and drag to the last.' },
  variants: {
    secret: {
      goal: 'Find every word on the list. Then read the hidden message in the letters left over.',
      steps: [
        'Find each listed word: press its first letter, slide to its last.',
        'Words go across, down, diagonal, and even backwards.',
        'When all are found, the unused letters turn yellow.',
        'Read the yellow letters left to right, row by row.',
        'Type that message in the box and tap Check message.',
      ],
      tips: ['The Magnifier makes the first letter of a missing word flash.'],
    },
    hidden: {
      goal: 'Find all the hidden words. Only the number of words is shown, not the words.',
    },
  },
};
