// Safe cracker: find the code. Every guessed digit is marked, Wordle style:
// ✓ green = right digit, right place; ↔ amber = in the code, somewhere else; ✕ grey = not in the code.
//
// params (all optional):
//   digits   3..6, length of the code (default 4)
//   tries    tries before the lock jams (default 8)
//   bonus    tries given back after each jam (default half of tries, at least 3)
//   repeats  true lets the code repeat a digit (default false: every digit is different)
//   clue     story note shown above the lock, e.g. 'Goh said the safe remembers Rachel.'
//   fixed    { position: digit } revealed from the start; positions count from 1, e.g. { 1: 7 }
//   contains [digits] the code is guaranteed to contain (position unknown), e.g. [7]
import { h } from '../core/ui.js';
import { mulberry32, randInt, shuffle } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'safecracker', name: 'Safe Cracker', category: 'Code Breaking' };
export const demo = { params: { digits: 4, tries: 8, clue: 'Practice lock. In a case, a clue from the story is pinned here.' } };

const JAM_MS = 5000;
const ICON = { g: '✓', a: '↔', x: '✕' };
const WORD = { g: 'right place', a: 'in the code, wrong place', x: 'not in the code' };

/** Per-position marks for one guess: 'g' | 'a' | 'x'. Greens first, then ambers up to the copies left. */
export function mark(code, guess) {
  const out = Array(code.length).fill('x');
  const left = {};
  code.forEach((d, i) => { if (guess[i] === d) out[i] = 'g'; else left[d] = (left[d] || 0) + 1; });
  guess.forEach((d, i) => { if (out[i] !== 'g' && left[d] > 0) { out[i] = 'a'; left[d]--; } });
  return out;
}

function tile(d, m, extra = '') {
  return h('span', { class: `sc-tile is-${m}${extra}`, 'aria-label': `${d}, ${WORD[m]}` },
    h('b', {}, String(d)), h('i', { 'aria-hidden': 'true' }, ICON[m]));
}

export const howTo = {
  goal: 'Open the lock by finding its secret number code.',
  steps: [
    'Type a guess, one digit in each box, then press Try.',
    '✓ Green: right digit, right box. Keep it there.',
    '↔ Amber: the digit is in the code, but in another box. Move it.',
    '✕ Grey: the digit is not in the code. Stop using it.',
    'Out of tries? The lock jams for 5 seconds, then gives you more.',
  ],
  example: {
    caption: 'Secret code 3 7 1 5. You try 1 7 2 9: 7 is right, 1 is in the wrong box, 2 and 9 are not in the code.',
    render(el) {
      const code = [3, 7, 1, 5];
      const guess = [1, 7, 2, 9];
      const m = mark(code, guess);
      el.append(h('div', { class: 'sc-howto' },
        h('div', { class: 'sc-row' }, guess.map((d, i) => tile(d, m[i]))),
        h('ul', { class: 'sc-legend' },
          h('li', {}, tile(7, 'g', ' is-mini'), 'right digit, right box'),
          h('li', {}, tile(1, 'a', ' is-mini'), 'in the code, different box'),
          h('li', {}, tile(2, 'x', ' is-mini'), 'not in the code'))));
    },
  },
  tips: [
    'No digit appears twice. Early on, try new digits to learn the most.',
    'The yellow clue note above the lock is real. Use it.',
  ],
  controls: {
    touch: 'Tap the keypad to type, ⌫ to delete, Try to test. Notes: tap a square to mark ✕ or ●.',
    keys: 'Type digits 0 to 9, Backspace to delete, Left and Right arrows to move between boxes, Enter to try.',
  },
};

export function mount(el, ctx) {
  const { params = {}, rng } = ctx;
  const D = Math.max(3, Math.min(6, params.digits || 4));
  const T = Math.max(1, params.tries || 8);
  const B = Math.max(1, params.bonus || Math.max(3, Math.ceil(T / 2)));
  const repeats = !!params.repeats;

  // story-given positions (1-based in the level data)
  const fixed = {};
  for (const [k, v] of Object.entries(params.fixed || {})) {
    const p = Number(k) - 1, d = Number(v);
    if (p >= 0 && p < D && d >= 0 && d <= 9 && (repeats || !Object.values(fixed).includes(d))) fixed[p] = d;
  }
  const contains = [...new Set((params.contains || []).map(Number).filter((d) => d >= 0 && d <= 9))];

  const codeSeed = Math.floor(rng() * 1e9);
  function makeCode() {
    const rr = mulberry32(codeSeed);
    const code = Array(D).fill(null);
    for (const [p, d] of Object.entries(fixed)) code[p] = d;
    const open = shuffle(rr, Array.from({ length: D }, (_, i) => i).filter((i) => code[i] == null));
    for (const d of contains) {
      if (!open.length) break;
      if (code.includes(d)) continue; // already there (a fixed box)
      code[open.pop()] = d;
    }
    const pool = shuffle(rr, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => repeats || !code.includes(d)));
    for (const i of open) code[i] = repeats ? randInt(rr, 0, 9) : pool.pop();
    return code;
  }

  // ---- state, with old saves ({ code, history, round, told }) migrated ----
  const saved = ctx.saved && typeof ctx.saved === 'object' ? ctx.saved : null;
  let code, history = [], told = [], extra = 0, notes = null, notesOpen = false;
  const validCode = (c) => Array.isArray(c) && c.length === D && c.every((d) => Number.isInteger(d) && d >= 0 && d <= 9)
    && (repeats || new Set(c).size === D) && Object.entries(fixed).every(([p, d]) => c[p] === d)
    && contains.every((d) => c.includes(d));
  if (saved && validCode(saved.code)) {
    code = saved.code.slice();
    history = (Array.isArray(saved.history) ? saved.history : []).filter((g) => Array.isArray(g) && g.length === D);
    told = (Array.isArray(saved.told) ? saved.told : []).filter((p) => Number.isInteger(p) && p >= 0 && p < D);
    extra = saved.v === 2 ? Math.max(0, saved.extra | 0) : 0;
    if (Array.isArray(saved.notes) && saved.notes.length === 10) notes = saved.notes.map((r) => Array.from({ length: D }, (_, i) => (Array.isArray(r) ? r[i] | 0 : 0) % 3));
    notesOpen = !!saved.notesOpen;
  } else {
    code = makeCode(); // no save, or an old 5-digit / repeated-digit code that no longer fits this lock
  }
  if (!notes) notes = Array.from({ length: 10 }, () => Array(D).fill(0));
  const allowed = () => T + extra * B;
  while (history.length >= allowed() && !isSolved()) extra++; // a save made mid-jam: give the tries back

  function isSolved() { return history.some((g) => g.every((d, i) => d === code[i])); }

  // ---- knowledge derived from the attempts ----
  function knowledge() {
    const greenAt = Array(D).fill(null);
    const digit = {}; // d -> 'g' | 'a' | 'x' (best known)
    const rank = { x: 1, a: 2, g: 3 };
    const up = (d, m) => { if (!digit[d] || rank[m] > rank[digit[d]]) digit[d] = m; };
    for (const g of history) {
      const m = mark(code, g);
      g.forEach((d, i) => { up(d, m[i]); if (m[i] === 'g') greenAt[i] = d; });
    }
    for (const [p, d] of Object.entries(fixed)) { greenAt[p] = d; up(d, 'g'); }
    for (const p of told) { greenAt[p] = code[p]; up(code[p], 'g'); }
    return { greenAt, digit };
  }
  const locked = (i) => i in fixed || told.includes(i);

  // ---- DOM ----
  let current = Array(D).fill(null);
  let cursor = 0;
  let jamTimer = null, jamTick = null;
  const status = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const dial = h('div', { class: 'sc-current', role: 'group', 'aria-label': 'Code being entered' });
  const log = h('ol', { class: 'sc-log', 'aria-label': 'Attempts' });
  const logEmpty = h('p', { class: 'sc-empty' }, 'No tries yet. Any guess is a good start.');
  const keyBtns = {};
  const keyFor = (n) => (keyBtns[n] = h('button', { class: 'btn sc-key', type: 'button', 'data-digit': n, onclick: () => press(n) }, h('b', {}, String(n)), h('i', { 'aria-hidden': 'true' })));
  const tryBtn = h('button', { class: 'btn btn--primary sc-try', type: 'button', onclick: submit }, 'Try');
  const keypad = h('div', { class: 'sc-keys' },
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map(keyFor),
    h('button', { class: 'btn sc-del', type: 'button', onclick: back, 'aria-label': 'Delete digit' }, '⌫'),
    keyFor(0), tryBtn);
  const left = h('p', { class: 'sc-left' });
  const jam = h('div', { class: 'sc-jam', hidden: true, role: 'status' });
  const notesGrid = h('div', { class: 'sc-notes' });
  notesGrid.style.setProperty('--sc-d', D);
  const notesBox = h('details', { class: 'sc-notes-box', open: notesOpen || null,
    ontoggle: () => { notesOpen = notesBox.open; persist(); } },
  h('summary', {}, 'Notes ', h('small', {}, 'tap a square: ✕ not here, ● maybe here')),
  notesGrid,
  h('button', { class: 'btn btn--small btn--paper sc-notes-clear', type: 'button', onclick: () => { notes.forEach((r) => r.fill(0)); persist(); renderNotes(); } }, 'Clear notes'));

  el.append(
    h('p', { class: 'game-rules' }, `Find the ${D}-digit code${repeats ? ' (digits can repeat)' : ', no digit used twice'}; each try marks every digit.`),
    params.clue ? h('p', { class: 'sc-clue' }, h('span', { class: 'sc-clue-pin', 'aria-hidden': 'true' }), params.clue) : null,
    h('ul', { class: 'sc-legend', 'aria-label': 'What the marks mean' },
      h('li', {}, h('span', { class: 'sc-tile is-g is-mini', 'aria-hidden': 'true' }, h('i', {}, ICON.g)), 'right place'),
      h('li', {}, h('span', { class: 'sc-tile is-a is-mini', 'aria-hidden': 'true' }, h('i', {}, ICON.a)), 'wrong place'),
      h('li', {}, h('span', { class: 'sc-tile is-x is-mini', 'aria-hidden': 'true' }, h('i', {}, ICON.x)), 'not in code')),
    h('div', { class: 'sc-layout' },
      h('div', { class: 'sc-board' }, h('h3', { class: 'lg-h' }, 'Attempts'), logEmpty, log),
      h('div', { class: 'sc-safe' }, dial, keypad, left, jam),
      notesBox),
    status,
  );

  function persist() { ctx.onSave({ v: 2, code, history, told, extra, notes, notesOpen }); }

  function prefill() {
    const { greenAt } = knowledge();
    current = greenAt.slice();
    cursor = current.findIndex((d, i) => d == null && !locked(i));
    if (cursor < 0) cursor = current.findIndex((d, i) => !locked(i));
    if (cursor < 0) cursor = 0;
  }
  function nextOpen(from, dir = 1) {
    for (let i = from + dir; i >= 0 && i < D; i += dir) if (!locked(i)) return i;
    return -1;
  }

  function renderDial() {
    dial.innerHTML = '';
    const { greenAt } = knowledge();
    current.forEach((d, i) => dial.append(h('button', {
      type: 'button', tabindex: '-1',
      class: `sc-digit${i === cursor ? ' is-cur' : ''}${locked(i) ? ' is-locked' : d != null && d === greenAt[i] ? ' is-known' : ''}`,
      'aria-label': `Box ${i + 1}: ${d == null ? 'empty' : d}${locked(i) ? ', known' : ''}`,
      onclick: () => { if (!locked(i) && !jamming()) { cursor = i; renderDial(); } },
    }, d == null ? '·' : String(d))));
  }

  function renderNotes() {
    notesGrid.innerHTML = '';
    notesGrid.append(h('span', { class: 'sc-nh' }));
    for (let p = 0; p < D; p++) notesGrid.append(h('span', { class: 'sc-nh' }, `Box ${p + 1}`));
    const { digit } = knowledge();
    for (let d = 0; d <= 9; d++) {
      notesGrid.append(h('span', { class: `sc-nd${digit[d] ? ` is-${digit[d]}` : ''}` }, String(d)));
      for (let p = 0; p < D; p++) {
        const v = notes[d][p];
        notesGrid.append(h('button', {
          type: 'button', class: `sc-nc${v === 1 ? ' is-no' : v === 2 ? ' is-yes' : ''}`,
          'aria-label': `${d} in box ${p + 1}: ${v === 1 ? 'crossed out' : v === 2 ? 'maybe' : 'no note'}`,
          onclick: () => { notes[d][p] = (notes[d][p] + 1) % 3; persist(); renderNotes(); },
        }, v === 1 ? '✕' : v === 2 ? '●' : ''));
      }
    }
  }

  function render() {
    renderDial();
    log.innerHTML = '';
    logEmpty.hidden = history.length > 0;
    history.forEach((g, n) => {
      const m = mark(code, g);
      log.append(h('li', { class: 'sc-row', 'aria-label': `Try ${n + 1}: ${g.map((d, i) => `${d} ${WORD[m[i]]}`).join(', ')}` },
        h('span', { class: 'sc-n', 'aria-hidden': 'true' }, String(n + 1)),
        g.map((d, i) => tile(d, m[i]))));
    });
    const { greenAt, digit } = knowledge();
    for (let n = 0; n <= 9; n++) {
      const k = digit[n];
      keyBtns[n].className = `btn sc-key${k ? ` is-${k}` : ''}`;
      keyBtns[n].lastChild.textContent = k ? ICON[k] : '';
      keyBtns[n].setAttribute('aria-label', `${n}${k ? `, ${WORD[k]}` : ''}`);
    }
    const rem = allowed() - history.length;
    left.textContent = isSolved() ? 'Open.' : `${rem} ${rem === 1 ? 'try' : 'tries'} left${extra ? ' (bonus)' : ''} before the lock jams`;
    renderNotes();
    // progress: boxes pinned down count most, digits found count a little
    const greens = greenAt.filter((d) => d != null).length;
    const found = Math.min(D, Object.values(digit).filter((m) => m !== 'x').length);
    ctx.onProgress(isSolved() ? 1 : Math.min(0.95, 0.75 * (greens / D) + 0.25 * (found / D)));
  }

  const jamming = () => jamTimer != null;
  function say(text, kind = '') { status.textContent = text; status.className = `feedback${kind ? ` is-${kind}` : ''}`; }

  function press(n) {
    if (jamming() || isSolved()) return;
    if (locked(cursor)) { const c = current.findIndex((d, i) => !locked(i)); if (c < 0) return; cursor = c; }
    if (!repeats) {
      const dup = current.findIndex((d, i) => d === n && i !== cursor);
      if (dup >= 0) {
        if (locked(dup)) { say(`${n} is already known to be in box ${dup + 1}. No digit is used twice.`, 'bad'); shake(); return; }
        current[dup] = null; // move the digit here instead of repeating it
      }
    }
    current[cursor] = n;
    const c = nextOpen(cursor);
    if (c >= 0) cursor = c;
    sfx.key();
    say('');
    renderDial();
  }
  function back() {
    if (jamming() || isSolved()) return;
    if ((current[cursor] == null || locked(cursor))) { const c = nextOpen(cursor, -1); if (c >= 0) cursor = c; }
    if (!locked(cursor)) current[cursor] = null;
    renderDial();
  }
  function move(dir) {
    const c = nextOpen(cursor, dir);
    if (c >= 0) { cursor = c; renderDial(); }
  }
  function shake() { dial.classList.remove('is-shake'); void dial.offsetWidth; dial.classList.add('is-shake'); }

  function submit() {
    if (jamming() || isSolved()) return;
    if (current.some((d) => d == null)) { say(`Fill all ${D} boxes first.`, 'bad'); shake(); return; }
    const g = current.slice();
    history.push(g);
    const m = mark(code, g);
    if (m.every((x) => x === 'g')) {
      sfx.solve();
      say('The bolts slide back. It is open.', 'good');
      persist(); render();
      keypad.classList.add('is-done');
      ctx.onSolved();
      return;
    }
    sfx.click();
    prefill();
    if (history.length >= allowed()) {
      extra++; // granted now, so a reload during the jam never loses it
      persist();
      startJam();
    } else {
      const ng = m.filter((x) => x === 'g').length, na = m.filter((x) => x === 'a').length;
      say(ng || na ? `${ng} in place, ${na} elsewhere.` : 'None of those digits are in the code. That is useful too.');
      persist();
    }
    render();
    if (dial.getBoundingClientRect().bottom > innerHeight) dial.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function startJam() {
    sfx.alarm();
    const end = Date.now() + JAM_MS;
    keypad.classList.add('is-jammed');
    jam.hidden = false;
    const draw = () => { jam.textContent = `The lock jams… ${Math.max(1, Math.ceil((end - Date.now()) / 1000))}`; };
    draw();
    say('Out of tries. The lock jams for a moment. Your attempts and notes stay.', 'bad');
    jamTick = setInterval(draw, 250);
    jamTimer = setTimeout(endJam, JAM_MS);
  }
  function endJam() {
    clearTimeout(jamTimer); clearInterval(jamTick);
    jamTimer = jamTick = null;
    jam.hidden = true;
    keypad.classList.remove('is-jammed');
    sfx.click();
    say(`The tumblers loosen. ${B} more tries.`);
    render();
  }

  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (!el.isConnected) return;
    if (/^[0-9]$/.test(e.key)) press(Number(e.key));
    else if (e.key === 'Backspace') { e.preventDefault(); back(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    else if (e.key === 'Enter') {
      if (t && t.closest && t.closest('.sc-notes-box')) return; // let Enter toggle a note or the summary
      e.preventDefault(); // stop a focused keypad button from also clicking
      submit();
    }
  };
  document.addEventListener('keydown', onKey);
  prefill();
  persist();
  render();
  if (isSolved()) keypad.classList.add('is-done');
  return {
    destroy() {
      document.removeEventListener('keydown', onKey);
      clearTimeout(jamTimer); clearInterval(jamTick);
    },
    hint() {
      if (isSolved()) return null;
      const { greenAt } = knowledge();
      const open = Array.from({ length: D }, (_, i) => i).filter((i) => greenAt[i] == null);
      if (open.length <= 1) return null; // never give the whole combination away
      const pos = open[randInt(rng, 0, open.length - 1)];
      told.push(pos);
      persist();
      if (!repeats) { const dup = current.findIndex((d, i) => d === code[pos] && i !== pos); if (dup >= 0) current[dup] = null; }
      current[pos] = code[pos];
      if (cursor === pos) { const c = nextOpen(pos); cursor = c >= 0 ? c : Math.max(0, nextOpen(pos, -1)); }
      render();
      return `A stethoscope on the dial: box ${pos + 1} is ${code[pos]}.`;
    },
    devSolve() {
      if (jamming()) endJam();
      current = code.slice();
      submit();
    },
  };
}
