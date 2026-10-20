// Morse and tap code: decode an intercepted message from a paper tape, from sound, or from knocks on a cell wall.
import { h, svgEl } from '../core/ui.js';
import { shuffle, pick, randInt } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'morse', name: 'Morse Intercept', category: 'Code Breaking' };
export const demo = { variant: 'visual', params: { difficulty: 'hard' } };

export const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
};
const TAP_ROWS = ['ABCDE', 'FGHIJ', 'LMNOP', 'QRSTU', 'VWXYZ'];
export function tapOf(ch) {
  const L = ch === 'K' ? 'C' : ch;
  const r = TAP_ROWS.findIndex((row) => row.includes(L));
  return [r + 1, TAP_ROWS[r].indexOf(L) + 1];
}

const NAMES = ['THE TAILOR', 'THE DENTIST', 'UNCLE LIM', 'MADAM ROSE', 'THE BOATMAN', 'AH SENG', 'THE PRIEST', 'THE CLERK'];
const PLACES = ['PUDU', 'CHOW KIT', 'BANGSAR', 'BRICKFIELDS', 'AMPANG', 'CHERAS', 'KEPONG', 'SENTUL', 'PASAR SENI', 'KAMPUNG BARU', 'JALAN ALOR', 'TITIWANGSA'];
const TIMES = ['AT MIDNIGHT', 'BEFORE DAWN', 'AT TEN', 'AFTER THE RAIN', 'AT SUNDOWN', 'ON FRIDAY', 'TONIGHT'];
const OBJECTS = ['THE LEDGER', 'THE KEY', 'THE PHOTOS', 'THE CASH', 'THE PASSPORTS', 'THE TAPE', 'THE PISTOL', 'THE DIARY'];
const HIDES = ['UNDER THE STAIRS', 'IN THE LIFT SHAFT', 'BEHIND THE ALTAR', 'IN LOCKER NINE', 'UNDER THE FLOOR', 'INSIDE THE PIANO'];
const TEMPLATES = [
  'MEET {N} AT {P} {T}', '{O} IS {H} AT {P}', 'MOVE {O} TO {P} {T}', '{N} KNOWS ABOUT FLOOR FOURTEEN',
  'TRUST NO ONE AT {P}', 'POLICE ARE WATCHING {P}', '{N} TALKED SO WE MOVE {T}', 'BURN {O} {T}',
  'THE LIFT STOPS AT FOURTEEN WITH THE KEY', 'DO NOT CALL {N} AGAIN', '{N} HAS {O}', 'BRING {O} TO {N}',
];

function sentence(rng) {
  return pick(rng, TEMPLATES)
    .replace('{N}', pick(rng, NAMES)).replace('{P}', pick(rng, PLACES))
    .replace('{T}', pick(rng, TIMES)).replace('{O}', pick(rng, OBJECTS)).replace('{H}', pick(rng, HIDES));
}

export function generate(rng, variant = 'visual', difficulty = 'hard') {
  const lens = { easy: [5, 8], medium: [7, 11], hard: [9, 14], expert: [12, 18] }[difficulty] || [9, 14];
  const [lo, hi] = variant === 'audio' ? [Math.max(4, lens[0] - 3), lens[1] - 4] : lens;
  let words = [];
  for (let k = 0; k < 20 && words.length < lo; k++) {
    const s = sentence(rng).split(' ');
    if (words.length + s.length > hi) continue;
    if (words.length && words.join(' ').includes(s.join(' '))) continue;
    words = words.concat(s);
  }
  if (!words.length) words = sentence(rng).split(' ');
  // smudges: one unreadable letter in some longer words (never in audio, where the sound is the challenge)
  const smudge = words.map(() => -1);
  if (variant !== 'audio') {
    const want = { easy: 0, medium: 2, hard: 3, expert: 5 }[difficulty] ?? 3;
    const cands = shuffle(rng, words.map((w, i) => (w.length >= 5 && i > 0 ? i : -1)).filter((i) => i >= 0));
    for (const i of cands.slice(0, want)) smudge[i] = randInt(rng, 1, words[i].length - 2);
  }
  return { words, smudge };
}

// ---------- audio ----------
let actx = null;
function audioCtx() {
  if (actx) return actx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  actx = new AC();
  return actx;
}

const SPEEDS = { slow: { wpm: 12, fw: 6 }, medium: { wpm: 16, fw: 10 }, fast: { wpm: 20, fw: 15 } };

/** Build a timeline of [startSec, durSec] marks for a list of words. */
export function morseTimeline(words, speed = 'medium') {
  const { wpm, fw } = SPEEDS[speed] || SPEEDS.medium;
  const u = 1.2 / wpm; // element unit
  const fu = 1.2 / fw; // stretched unit for gaps (Farnsworth)
  const marks = [];
  let t = 0;
  words.forEach((w, wi) => {
    [...w].forEach((ch, ci) => {
      [...MORSE[ch]].forEach((sym, si) => {
        const d = sym === '.' ? u : 3 * u;
        marks.push([t, d]);
        t += d + (si < MORSE[ch].length - 1 ? u : 0);
      });
      if (ci < w.length - 1) t += 3 * fu;
    });
    if (wi < words.length - 1) t += 7 * fu;
  });
  return { marks, total: t };
}

export function tapTimeline(words, speed = 'medium') {
  const k = { slow: 1.4, medium: 1, fast: 0.75 }[speed] || 1;
  const marks = [];
  let t = 0;
  words.forEach((w) => {
    [...w].forEach((ch) => {
      const [r, c] = tapOf(ch);
      for (let i = 0; i < r; i++) { marks.push([t, 0.06]); t += 0.2 * k; }
      t += 0.35 * k;
      for (let i = 0; i < c; i++) { marks.push([t, 0.06]); t += 0.2 * k; }
      t += 0.75 * k;
    });
    t += 1.1 * k;
  });
  return { marks, total: t };
}

export function mount(el, ctx) {
  const { rng, params = {}, saved } = ctx;
  const variant = ['visual', 'audio', 'tapcode'].includes(ctx.variant) ? ctx.variant : 'visual';
  const tap = variant === 'tapcode';
  const difficulty = params.difficulty || 'hard';
  const gen = saved?.gen || generate(rng, variant, difficulty);
  const { words, smudge } = gen;
  const solved = saved?.solved || words.map(() => false);
  const typed = saved?.typed || words.map(() => '');
  let finished = false;
  let speed = saved?.speed || (variant === 'audio' ? 'slow' : 'medium');
  let playing = null;
  const norm = (s) => {
    const x = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return tap ? x.replace(/K/g, 'C') : x;
  };

  const status = h('p', { class: 'feedback' });
  const lamp = h('span', { class: 'mo-lamp', 'aria-hidden': 'true' });
  const lampToggle = h('input', { type: 'checkbox', checked: variant !== 'audio' });
  const speedSel = h('select', { class: 'mo-select', 'aria-label': 'Playback speed', onchange: () => { speed = speedSel.value; persist(); } },
    ['slow', 'medium', 'fast'].map((s) => h('option', { value: s, selected: s === speed }, s[0].toUpperCase() + s.slice(1))));
  const playAll = h('button', { class: 'btn btn--small', onclick: () => play(words.map((_, i) => i)) }, tap ? 'Play the knocks' : 'Play the message');
  const stopBtn = h('button', { class: 'btn btn--small', onclick: stop, disabled: true }, 'Stop');

  const wordEls = words.map((w, wi) => {
    const input = h('input', {
      class: 'mo-input', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false',
      'aria-label': `Word ${wi + 1}`, value: typed[wi],
    });
    input.addEventListener('input', () => onType(wi));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || (e.key === 'ArrowRight' && input.selectionStart === input.value.length)) {
        const nx = wordEls.slice(wi + 1).find((x) => !x.input.disabled);
        if (nx) { e.preventDefault(); nx.input.focus(); }
      } else if (e.key === 'ArrowLeft' && input.selectionStart === 0) {
        const pv = wordEls.slice(0, wi).reverse().find((x) => !x.input.disabled);
        if (pv) { e.preventDefault(); pv.input.focus(); }
      }
    });
    const replay = h('button', { class: 'mo-replay', 'aria-label': `Play word ${wi + 1}`, onclick: () => play([wi]) }, '▶');
    const box = h('div', { class: 'mo-word' },
      variant === 'audio' ? null : tape(w, smudge[wi]),
      h('div', { class: 'mo-answer' }, input, replay));
    return { box, input };
  });

  const chart = h('details', { class: 'mo-chart', open: true },
    h('summary', {}, tap ? 'Tap code grid' : 'Morse reference card'),
    tap ? tapGrid() : morseCard());

  el.append(
    h('p', { class: 'game-rules' }, {
      visual: 'An intercepted paper tape. A dot is a short mark, a dash a long one; a wider gap ends a letter. Decode each word and type it underneath. Some marks are smudged: work out the missing letter from the rest of the message.',
      audio: 'A recorded radio burst, sound only. Short beeps are dots, long beeps are dashes, and longer silences split letters and words. Play the whole message or one word at a time, and type each word as you decode it.',
      tapcode: 'Knocks heard through a cell wall in Pudu. Each letter is two groups of knocks: the first gives the row of the grid, the second the column. C and K share a square. Some knocks were drowned out: infer those letters from the rest.',
    }[variant]),
    h('div', { class: 'game-toolbar mo-bar' }, playAll, stopBtn, h('label', { class: 'mo-lab' }, 'Speed ', speedSel),
      h('label', { class: 'mo-lab' }, lampToggle, ' Lamp'), lamp),
    h('div', { class: 'mo-words' }, wordEls.map((x) => x.box)),
    chart,
    status,
  );

  function tape(word, smudgeAt) {
    const box = h('div', { class: 'mo-tape', 'aria-hidden': 'true' });
    [...word].forEach((ch, ci) => {
      if (tap) {
        const [r, c] = tapOf(ch);
        const g = h('span', { class: `mo-tap${ci === smudgeAt ? ' is-smudge' : ''}` },
          h('span', { class: 'mo-tg' }, '●'.repeat(r)), h('span', { class: 'mo-tg' }, '●'.repeat(c)));
        box.append(g);
        return;
      }
      const code = MORSE[ch];
      const units = [...code].reduce((n, s) => n + (s === '.' ? 1 : 3), 0) + code.length - 1;
      const U = 7;
      const svg = svgEl('svg', { class: `mo-letter${ci === smudgeAt ? ' is-smudge' : ''}`, viewBox: `0 0 ${units * U} 14`, width: units * U, height: 14 });
      let x = 0;
      for (const s of code) {
        if (s === '.') svg.append(svgEl('circle', { cx: x + U / 2, cy: 7, r: 3.2 }));
        else svg.append(svgEl('rect', { x: x + 0.5, y: 4, width: 3 * U - 1, height: 6, rx: 3 }));
        x += (s === '.' ? 1 : 3) * U + U;
      }
      box.append(svg);
    });
    return box;
  }
  function morseCard() {
    const keys = Object.keys(MORSE).sort((a, b) => (/\d/.test(a) - /\d/.test(b)) || a.localeCompare(b));
    return h('div', { class: 'mo-card' }, keys.map((L) => h('span', { class: 'mo-ref' }, h('b', {}, L), h('i', {}, MORSE[L].replace(/\./g, '•').replace(/-/g, '▬')))));
  }
  function tapGrid() {
    const t = h('table', { class: 'mo-grid' });
    t.append(h('tr', {}, h('th', {}), [1, 2, 3, 4, 5].map((n) => h('th', {}, String(n)))));
    TAP_ROWS.forEach((row, r) => t.append(h('tr', {}, h('th', {}, String(r + 1)), [...row].map((L) => h('td', {}, L === 'C' ? 'C/K' : L)))));
    return t;
  }

  function onType(wi) {
    const v = wordEls[wi].input.value;
    typed[wi] = v;
    if (norm(v) === norm(words[wi]) && !solved[wi]) {
      solved[wi] = true;
      sfx.good();
      const nx = wordEls.slice(wi + 1).find((x, k) => !solved[wi + 1 + k]);
      if (nx) nx.input.focus();
    }
    persist(); render(); check();
  }

  function render() {
    wordEls.forEach((x, wi) => {
      x.box.classList.toggle('is-solved', solved[wi]);
      x.input.disabled = solved[wi];
      if (solved[wi]) x.input.value = words[wi];
      x.box.querySelector('.mo-letter.is-smudge, .mo-tap.is-smudge')?.classList.toggle('is-clear', solved[wi]);
    });
  }

  function check() {
    const n = solved.filter(Boolean).length;
    ctx.onProgress(n / words.length);
    if (n === words.length && !finished) {
      finished = true;
      stop();
      status.textContent = `Decoded: ${words.join(' ').toLowerCase()}.`;
      status.className = 'feedback is-good';
      sfx.solve();
      ctx.onSolved();
    }
  }

  function persist() { ctx.onSave({ gen, solved, typed, speed }); }

  // ---------- playback ----------
  function play(idx) {
    stop();
    const ac = audioCtx();
    const list = idx.map((i) => words[i]);
    const tl = tap ? tapTimeline(list, speed) : morseTimeline(list, speed);
    const t0 = (ac ? ac.currentTime : 0) + 0.15;
    const nodes = [];
    if (ac) {
      if (ac.state === 'suspended') ac.resume();
      const out = ac.createGain();
      out.gain.value = 0.9;
      out.connect(ac.destination);
      if (tap) {
        const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.08), ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.012));
        for (const [s] of tl.marks) {
          const src = ac.createBufferSource();
          src.buffer = buf;
          const lp = ac.createBiquadFilter();
          lp.type = 'lowpass'; lp.frequency.value = 700;
          const g = ac.createGain(); g.gain.value = 1.4;
          src.connect(lp).connect(g).connect(out);
          src.start(t0 + s);
          nodes.push(src);
        }
      } else {
        const osc = ac.createOscillator();
        osc.type = 'sine'; osc.frequency.value = 640;
        const g = ac.createGain();
        g.gain.setValueAtTime(0, t0);
        for (const [s, d] of tl.marks) {
          g.gain.setValueAtTime(0, t0 + s);
          g.gain.linearRampToValueAtTime(0.35, t0 + s + 0.006);
          g.gain.setValueAtTime(0.35, t0 + s + d - 0.006);
          g.gain.linearRampToValueAtTime(0, t0 + s + d);
        }
        osc.connect(g).connect(out);
        osc.start(t0);
        osc.stop(t0 + tl.total + 0.2);
        nodes.push(osc);
      }
      nodes.push(out);
    }
    // lamp follows the same timeline
    const start = performance.now() + 150;
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const on = lampToggle.checked && tl.marks.some(([s, d]) => t >= s && t < s + Math.max(d, 0.08));
      lamp.classList.toggle('is-on', on);
      if (t < tl.total + 0.3) raf = requestAnimationFrame(tick);
      else stop();
    };
    raf = requestAnimationFrame(tick);
    playing = { nodes, raf };
    stopBtn.disabled = false;
    playAll.disabled = true;
  }
  function stop() {
    if (!playing) return;
    cancelAnimationFrame(playing.raf);
    for (const n of playing.nodes) { try { n.stop?.(); n.disconnect(); } catch { /* already stopped */ } }
    playing = null;
    lamp.classList.remove('is-on');
    stopBtn.disabled = true;
    playAll.disabled = false;
  }

  render();
  check();
  persist();

  return {
    destroy: () => stop(),
    hint() {
      if (finished) return null;
      // a smudged word first, since those need inference; then the longest unsolved word
      let wi = words.findIndex((_, i) => !solved[i] && smudge[i] >= 0);
      if (wi < 0) {
        const open = words.map((w, i) => (solved[i] ? -1 : i)).filter((i) => i >= 0);
        wi = open.sort((a, b) => words[b].length - words[a].length)[0];
      }
      if (wi == null) return null;
      solved[wi] = true;
      typed[wi] = words[wi];
      persist(); render(); check();
      return `The lab cleaned up word ${wi + 1}: ${words[wi]}.`;
    },
    devSolve() {
      words.forEach((w, i) => { solved[i] = true; typed[i] = w; });
      persist(); render(); check();
    },
  };
}
