// Substitution cipher written in dental-chart tooth symbols.
import { h } from '../core/ui.js';
import { shuffle } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'cipher', name: 'Cipher', category: 'Code Breaking' };

const SHAPES = {
  incisor: 'M12 6 h16 q3 0 3 4 v12 q0 4 -4 5 l-3 15 q-1 3 -4 0 l-3 -15 q-4 -1 -4 -5 v-12 q0 -4 3 -4z',
  canine: 'M20 3 q12 6 11 19 q0 4 -4 6 l-4 14 q-3 4 -6 0 l-4 -14 q-4 -2 -4 -6 q-1 -13 11 -19z',
  molar: 'M7 7 q3 -3 7 -1 q6 2 12 0 q4 -2 7 1 q3 4 1 15 q-1 4 -4 5 l-2 13 q-2 3 -4 0 l-1 -10 h-4 l-1 10 q-2 3 -4 0 l-2 -13 q-3 -1 -4 -5 q-2 -11 1 -15z',
};
const MARKS = {
  none: '',
  top: '<path d="M9 8 h22 v8 h-22z" class="m"/>',
  root: '<path d="M14 30 h12 v10 h-12z" class="m"/>',
  dot: '<circle cx="20" cy="17" r="3.5" class="m"/>',
  cross: '<path d="M13 11 l14 12 M27 11 l-14 12" class="s"/>',
  slash: '<path d="M12 24 l16 -14" class="s"/>',
  ring: '<circle cx="20" cy="17" r="6" class="s"/>',
  left: '<path d="M9 8 h11 v20 h-11z" class="m"/>',
  right: '<path d="M20 8 h11 v20 h-11z" class="m"/>',
};

function glyphSvg(shape, mark) {
  return `<svg viewBox="0 0 40 48" aria-hidden="true"><defs><clipPath id="c-${shape}"><path d="${SHAPES[shape]}"/></clipPath></defs>
    <g clip-path="url(#c-${shape})">${MARKS[mark]}</g>
    <path d="${SHAPES[shape]}" class="o"/></svg>`;
}

export function mount(el, ctx) {
  const { params, rng, saved } = ctx;
  const message = params.message.toUpperCase();
  const letters = [...new Set(message.replace(/[^A-Z]/g, ''))];
  const combos = [];
  for (const s of Object.keys(SHAPES)) for (const m of Object.keys(MARKS)) combos.push([s, m]);
  const pool = shuffle(rng, combos);
  const glyphOf = {}; // letter -> glyph id
  letters.forEach((L, i) => { glyphOf[L] = i; });
  const glyphs = letters.map((_, i) => pool[i]);
  const truth = Object.fromEntries(letters.map((L, i) => [i, L]));
  const guess = saved?.guess || {};
  for (const g of params.given || []) if (glyphOf[g] !== undefined) guess[glyphOf[g]] = g;
  const locked = new Set((params.given || []).map((g) => glyphOf[g]).filter((x) => x !== undefined));
  const status = h('p', { class: 'feedback' });

  const tokens = [];
  const text = h('div', { class: 'ci-text' });
  for (const word of message.split(' ')) {
    const w = h('span', { class: 'ci-word' });
    for (const ch of word) {
      if (!/[A-Z]/.test(ch)) { w.append(h('span', { class: 'ci-punct' }, ch)); continue; }
      const gid = glyphOf[ch];
      const input = h('input', { class: 'ci-input', 'aria-label': 'Letter for this tooth symbol', autocomplete: 'off', autocapitalize: 'characters' });
      if (locked.has(gid)) input.readOnly = true;
      input.addEventListener('input', () => {
        const had = guess[gid];
        set(gid, input.value);
        if (guess[gid] && guess[gid] !== had) focusNext(input);
      });
      input.addEventListener('keydown', (e) => {
        if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // typing over a filled square replaces its letter everywhere
          e.preventDefault();
          if (!locked.has(gid)) { set(gid, e.key); }
          focusNext(input);
          return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          set(gid, '');
          return;
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const idx = tokens.findIndex((t) => t.input === input);
          tokens[idx + (e.key === 'ArrowRight' ? 1 : -1)]?.input.focus();
        }
      });
      input.addEventListener('focus', () => { highlight(gid); input.select(); });
      const tok = h('span', { class: 'ci-tok' }, h('span', { class: 'ci-glyph', html: glyphSvg(...glyphs[gid]) }), input);
      tokens.push({ gid, input, tok });
      w.append(tok);
    }
    text.append(w);
  }

  const counts = {};
  for (const ch of message) if (/[A-Z]/.test(ch)) counts[glyphOf[ch]] = (counts[glyphOf[ch]] || 0) + 1;
  const freq = h('div', { class: 'ci-freq' });

  el.append(
    h('p', { class: 'game-rules' }, 'Each tooth symbol always stands for the same letter. Type a letter under any symbol and it fills in everywhere. The three letters the lab already confirmed are filled in. In English, E, T, A, O, I and N are the most common letters.'),
    text,
    h('h3', { class: 'lg-h' }, 'How often each symbol appears'),
    freq,
    status,
  );

  function focusNext(input) {
    const idx = tokens.findIndex((t) => t.input === input);
    for (let k = idx + 1; k < tokens.length; k++) {
      if (!locked.has(tokens[k].gid) && !guess[tokens[k].gid]) { tokens[k].input.focus(); return; }
    }
  }

  function highlight(gid) {
    tokens.forEach((t) => t.tok.classList.toggle('is-active', t.gid === gid));
  }

  function set(gid, v) {
    const L = (v || '').toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
    if (locked.has(gid)) return;
    if (L) guess[gid] = L; else delete guess[gid];
    sfx.key();
    render();
    ctx.onSave({ guess });
    check();
  }

  function render() {
    const used = {};
    Object.entries(guess).forEach(([g, L]) => { (used[L] ||= []).push(Number(g)); });
    tokens.forEach((t) => {
      const L = guess[t.gid] || '';
      if (t.input.value !== L) t.input.value = L;
      t.tok.classList.toggle('is-dup', !!L && used[L].length > 1);
      t.tok.classList.toggle('is-given', locked.has(t.gid));
    });
    freq.innerHTML = '';
    Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([gid, c]) => {
      freq.append(h('span', { class: 'ci-f' }, h('span', { class: 'ci-glyph', html: glyphSvg(...glyphs[gid]) }), h('b', {}, guess[gid] || '·'), h('small', {}, `×${c}`)));
    });
  }

  function check() {
    const correct = letters.filter((_, i) => guess[i] === truth[i]).length;
    ctx.onProgress(correct / letters.length);
    if (correct === letters.length) {
      status.textContent = 'The diary reads clean.';
      status.className = 'feedback is-good';
      tokens.forEach((t) => { t.input.readOnly = true; });
      ctx.onSolved();
    } else if (letters.every((_, i) => guess[i])) {
      status.textContent = 'Every symbol has a letter, but some are wrong. Words that look almost right are the place to start.';
      status.className = 'feedback is-bad';
    } else status.textContent = '';
  }

  render();
  check();
  return {
    hint() {
      const order = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([g]) => Number(g));
      const gid = order.find((g) => guess[g] !== truth[g]);
      if (gid === undefined) return null;
      guess[gid] = truth[gid];
      locked.add(gid);
      tokens.forEach((t) => { if (t.gid === gid) t.input.readOnly = true; });
      render(); ctx.onSave({ guess }); check();
      return `The lab cracked one more symbol: it means ${truth[gid]}.`;
    },
    devSolve() { letters.forEach((_, i) => { guess[i] = truth[i]; }); render(); check(); },
  };
}

// ---------- How to play (see core/howto.js) ----------
let htClip = 0;
function htGlyph(shape, mark, x, y) {
  const id = `ht-ci-${++htClip}`;
  const m = MARKS[mark].replace(/class="m"/g, `fill="${C.ink}"`).replace(/class="s"/g, `fill="none" stroke="${C.ink}" stroke-width="2.5"`);
  return `<g transform="translate(${x} ${y})"><defs><clipPath id="${id}"><path d="${SHAPES[shape]}"/></clipPath></defs><g clip-path="url(#${id})">${m}</g><path d="${SHAPES[shape]}" fill="none" stroke="${C.ink}" stroke-width="2"/></g>`;
}
export const howTo = {
  goal: 'Decode a secret message written in tooth symbols.',
  steps: [
    'Each tooth symbol always stands for the same letter.',
    'Tap the box under a symbol and type a letter.',
    'That letter fills in under every matching symbol.',
    ({ params }) => `${(params.given || ['E', 'T', 'A']).join(', ')} are filled in already to help you.`,
    'Guess words from the letters you have, until every box is right.',
  ],
  example: {
    caption: 'Type H under one symbol, and H fills in under every matching symbol.',
    render(el) {
      const G = { T: ['incisor', 'top'], H: ['molar', 'dot'], E: ['canine', 'none'], A: ['incisor', 'cross'] };
      let s = '';
      const word = (x, letters) => letters.split('').forEach((L, i) => {
        const gx = x + i * 50;
        s += htGlyph(...G[L], gx + 3, 8);
        const isH = L === 'H';
        s += rect(gx, 62, 46, 34, { fill: isH ? '#f6e3a8' : C.paper, stroke: C.soft, sw: 1.2, rx: 3 });
        s += text(gx + 23, 87, L, { size: 22, weight: 700, fill: isH ? C.red : C.green, font: 'display' });
      });
      word(14, 'THE');
      word(214, 'HAT');
      s += arrow(89, 104, 230, 104, { bend: 22, sw: 2.5 });
      put(el, svg(380, 140, s, 'Tooth symbols for THE and HAT; typing H fills both H boxes'));
    },
  },
  tips: ['E, T, A, O, I and N are the most common letters in English.', 'The list under the message shows how often each symbol appears.'],
  controls: { touch: 'Tap a box under a symbol, then type a letter.', keys: 'Type letters. Arrow keys move between boxes. Backspace clears.' },
};
