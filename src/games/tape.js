// Tape forensics: three ways to pull evidence out of a recording on an old reel-to-reel deck.
//
// variant 'spectro'  Hidden in the hiss. A code is drawn into the recording's spectrogram (sine
//                    partials tracing a 5 x 7 font in time x frequency, buried in hiss and whines).
//                    Play it, find the band, turn up the contrast, read it, type it.
//   params: answer   the code from the story: A-Z, 0-9 and '-', up to 10 characters
//                    (default: a random per-player code like 'RT-482')
//           noise    0..1 hiss level (default 0.6)
//           decoys   0..3 fake glyph fragments in other bands (default 2)
//
// variant 'splice'   Cut tape. A voiced line was cut into pieces and the pieces shuffled. Listen,
//                    reorder, play the splice.
//   params: line     { who, en, orig? } exactly as a line appears in a case file (required)
//           pieces   3..8 (default 5)
//
// variant 'reverse'  Played backwards, slowed down. A voiced line is reversed and/or at the wrong
//                    speed. Find the direction and speed where it turns into speech, type the key words.
//   params: line     { who, en, orig? } (required)
//           answer   the key words said in the line, e.g. 'Beira Lake' (default: its longest word)
//           accept   [other spellings that count]
//           ask      the question above the answer box (default 'What does the voice say?')
//           mode     'rev' | 'slow' | 'fast' | 'revslow' to force the scramble (default: random)
//
// all variants:      label   text on the deck's label strip
//                    clue    story note pinned above the deck
//
// splice and reverse play the line's real recorded voice when this deployment has voices (the same
// audio the cinema plays: api/voice/<id>?v=...). Without it (static host, no voice for the line,
// voices or sound off, offline) they fall back to the same puzzle on the line's caption text.
import '../styles/games-d/tape.css';
import { h, svgEl } from '../core/ui.js';
import { sfx, audioContext, unlock } from '../core/audio.js';
import { state } from '../core/state.js';
import { app } from '../core/app.js';
import { mulberry32, hashStr } from '../core/rng.js';
import { initVoices, voiceIdFor } from '../core/voice-player.js';
import { put, svg, text, rect, C } from '../core/howto-kit.js';
import * as L from './tape-logic.js';

export { cutPoints, textPieces, shuffleOrder, planSpectro, synthSpectro, phraseMatches } from './tape-logic.js';

export const meta = { id: 'tape', name: 'Tape Forensics', category: 'Audio forensics' };

// ---------- the lab demo: ?screen=lab&game=tape&variant=splice picks a variant ----------
const DEMO_LINE_A = { who: 'Tharshini Yogeswaran', en: 'Appa did not drink. And he could not swim, so he never went near the water after dark. Never.' };
const DEMO_LINE_B = { who: 'Tharshini Yogeswaran', en: 'They found him in Beira Lake this morning. The police say he drank arrack and fell in.' };
const DEMO = {
  spectro: { noise: 0.6, decoys: 2, label: 'EXHIBIT 7 · REEL B · "STATIC"', clue: 'Practice reel. Something is written into the hiss: play it and look at the sound, not just listen.' },
  splice: { line: DEMO_LINE_A, pieces: 5, label: 'EXHIBIT 9 · CUT REEL · 5 PIECES', clue: 'Practice reel. Someone cut the tape and spliced it back in the wrong order.' },
  reverse: { line: DEMO_LINE_B, answer: 'Beira Lake', ask: 'Where did they find him?', label: 'EXHIBIT 4 · REEL C · "NOISE"', clue: 'Practice reel. The deck was rigged to play it wrong. Undo it.' },
};
const urlVariant = () => { try { return new URLSearchParams(location.search).get('variant'); } catch { return null; } };
export const demo = {
  get variant() { return L.variantOf(urlVariant()); },
  get params() { return DEMO[L.variantOf(urlVariant())]; },
};

// ---------- the voice of a line, fetched the way the cinema does ----------
let statusP = null;
function voiceStatus() {
  if (!statusP) {
    statusP = fetch('api/voice/status', { cache: 'no-store', headers: { accept: 'application/json' } })
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => { try { return JSON.parse(t); } catch { return null; } })
      .catch(() => null);
  }
  return statusP;
}
/** The audio URL the cinema would play for a case-file line ({ who, en, orig? }), or null. */
export async function lineAudioUrl(line) {
  if (!line || state().settings.sound === false) return null;
  if (!(await initVoices())) return null;
  const key = voiceIdFor(line);
  if (!key) return null;
  const st = await voiceStatus();
  if (!st || st.ok !== true) return null;
  const lines = (await import('../data/voice-manifest.json')).default.lines || {};
  const [id, d] = key.split('@');
  const r = lines[id]?.rev;
  return `api/voice/${id}?v=${Number(st.v) || 0}${r ? `&r=${r}` : ''}${d ? `&d=${d}` : ''}`;
}
/** Fetch and decode a line's voice. Resolves { url, buffer } or null; never rejects. */
export async function loadLineAudio(line, { signal, sampleRate = 44100, timeout = 12000 } = {}) {
  try {
    const url = await lineAudioUrl(line);
    if (!url || signal?.aborted) return null;
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = ctl ? setTimeout(() => ctl.abort(), timeout) : null;
    signal?.addEventListener?.('abort', () => ctl?.abort());
    try {
      const res = await fetch(url, ctl ? { signal: ctl.signal } : {});
      if (!res.ok || !(res.headers.get('content-type') || '').toLowerCase().startsWith('audio/')) return null;
      const data = await res.arrayBuffer();
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OAC) return null;
      const oac = new OAC(1, 1, sampleRate);
      const buffer = await new Promise((ok, bad) => { const p = oac.decodeAudioData(data, ok, bad); if (p && p.then) p.then(ok, bad); });
      return buffer && buffer.length ? { url, buffer } : null;
    } finally { if (t) clearTimeout(t); }
  } catch { return null; }
}

// ---------- How to play ----------
function exSpectro(el) {
  const plan = { cells: [] };
  const code = 'K7';
  [...code].forEach((ch, k) => {
    const g = L.glyph(ch);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r][c]) plan.cells.push({ x: 86 + (k * 6 + c) * 8, y: 26 + r * 8 });
  });
  let m = rect(14, 8, 200, 92, { fill: '#0b0d10', stroke: '#3a444b', sw: 1, rx: 3 });
  const rr = mulberry32(9);
  for (let i = 0; i < 260; i++) m += `<rect x="${(16 + rr() * 196).toFixed(1)}" y="${(10 + rr() * 88).toFixed(1)}" width="2" height="2" fill="#6b4a2a" opacity="${(0.3 + rr() * 0.5).toFixed(2)}"/>`;
  for (const c of plan.cells) m += `<rect x="${c.x}" y="${c.y}" width="7.4" height="7.4" fill="${C.amber}"/>`;
  m += `<path d="M24 20 L70 30 L120 24" stroke="#c9c1aa" stroke-width="1.4" fill="none" opacity=".7"/>`;
  m += `<path d="M216 24 h8 v58 h-8" stroke="${C.red}" stroke-width="2.5" fill="none"/>`;
  m += text(250, 48, 'zoom', { size: 12, weight: 700, fill: C.soft }) + text(250, 64, 'here', { size: 12, weight: 700, fill: C.soft });
  m += text(332, 62, 'K7', { size: 30, weight: 800, fill: C.ink, font: 'display' });
  m += text(332, 86, 'type it', { size: 12, fill: C.soft });
  put(el, svg(380, 108, m, 'A spectrogram: hiss everywhere, and in one band the letters K7 drawn in bright blocks'));
}
function exSplice(el) {
  const strip = (x, y, lab, on) => rect(x, y, 70, 30, { fill: '#1b1f22', stroke: on ? C.amber : '#556066', sw: on ? 2.5 : 1.5, rx: 3 })
    + text(x + 11, y + 20, lab, { size: 13, weight: 800, fill: C.amber, font: 'display' })
    + `<path d="M${x + 22} ${y + 15} q4 -9 8 0 t8 0 t8 0 t8 0 t8 0" stroke="#e8dcc0" stroke-width="1.6" fill="none"/>`;
  let m = strip(10, 10, 'C', false) + strip(10, 46, 'A', true) + strip(10, 82, 'B', false);
  m += `<path d="M96 60 C140 60 140 60 176 60" stroke="${C.red}" stroke-width="3" fill="none" marker-end="url(#a)"/>`;
  m = `<defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${C.red}"/></marker></defs>` + m;
  m += strip(196, 10, 'A', false) + strip(196, 46, 'B', false) + strip(196, 82, 'C', false);
  m += text(330, 66, '"…sounds', { size: 12, fill: C.soft }) + text(330, 82, 'right"', { size: 12, fill: C.soft });
  put(el, svg(380, 120, m, 'Three tape pieces in the order C A B are moved into the order A B C'));
}
function exReverse(el) {
  let m = '';
  const cx = 64, cy = 60;
  m += `<circle cx="${cx}" cy="${cy}" r="40" fill="#20262a" stroke="#556066" stroke-width="2"/>`;
  L.DETENTS.forEach((d) => {
    const a = (Math.log2(d) * 135 - 90) * Math.PI / 180;
    m += `<line x1="${cx + Math.cos(a) * 44}" y1="${cy + Math.sin(a) * 44}" x2="${cx + Math.cos(a) * 50}" y2="${cy + Math.sin(a) * 50}" stroke="${C.ink}" stroke-width="2"/>`;
  });
  const a = (Math.log2(1.6) * 135 - 90) * Math.PI / 180;
  m += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * 32}" y2="${cy + Math.sin(a) * 32}" stroke="${C.amber}" stroke-width="5" stroke-linecap="round"/>`;
  m += text(cx, 116, 'speed 1.6×', { size: 12, weight: 700, fill: C.soft });
  m += rect(130, 22, 236, 30, { fill: '#f6e7b8', stroke: C.line, sw: 1, rx: 3 }) + text(248, 42, 'ekaL ariqB ni mih dnuof', { size: 13, fill: C.soft, font: 'doc' });
  m += rect(130, 72, 236, 30, { fill: '#f6e7b8', stroke: C.green, sw: 2, rx: 3 }) + text(248, 92, 'found him in Beira Lake', { size: 13, fill: C.ink, font: 'doc' });
  m += text(248, 64, '▼', { size: 12, fill: C.red });
  put(el, svg(380, 122, m, 'A speed knob turned to 1.6 times; the garbled caption turns into plain words'));
}
export const howTo = {
  goal: 'Find the code someone hid inside the hiss of a recording.',
  steps: [
    'Press Play. It sounds like static, but watch the spectrogram: pitch goes up, time goes right.',
    'After one full play the whole tape is printed. Swipe along it.',
    'Move Band and Zoom until you find writing. Raise Contrast to make it stand out.',
    'Some scraps are decoys. Type the whole code and press Check.',
  ],
  example: { caption: 'High notes are at the top, low ones at the bottom. In one band, the tones spell K7.', render: exSpectro },
  tips: ['No sound needed: the picture is made from the recording itself, so it works muted.', 'Replay as often as you like. Nothing is lost.'],
  controls: {
    touch: 'Tap Play, drag the sliders, swipe along the printed tape, tap it to jump there.',
    keys: 'Space plays or pauses, Left and Right scrub, Up and Down move the band, Enter checks.',
  },
  variants: {
    splice: {
      goal: 'Splice a cut recording back into the right order.',
      steps: [
        'Tap ▶ on a piece to hear it.',
        'Tap one piece, then another, to swap them. Or drag a piece by its grip.',
        'Press Play the splice. It plays your order and tells you if it runs true.',
        'No sound? The pieces show the words instead.',
      ],
      example: { caption: 'Piece A starts the sentence, so it goes first. Then B, then C.', render: exSplice },
      tips: ['Listen for a sentence that starts: a breath, a capital, a first word.', 'Wrong splices cost nothing. Try again.'],
      controls: {
        touch: 'Tap ▶ to hear a piece. Tap two pieces to swap them, or drag one by its grip.',
        keys: 'Up and Down pick a piece, Shift with Up or Down moves it, Space plays it, Enter plays the splice.',
      },
    },
    reverse: {
      goal: 'Undo a tape played backwards or at the wrong speed, and say what it says.',
      steps: [
        'Press Play. The voice sounds wrong: backwards, too slow or too fast.',
        'Flip Direction and turn the Speed knob until it turns into plain speech.',
        'Listen, then type the words the question asks for and press Check.',
        'No sound? The caption untangles when the setting is right.',
      ],
      example: { caption: 'At the right direction and speed, the mess becomes words.', render: exReverse },
      tips: ['The knob clicks into stops. The right one is always a stop.', 'Slow voices sound deep, fast ones squeaky.'],
      controls: {
        touch: 'Tap Play, tap Direction, turn the knob or tap − and +. Type the answer, then Check.',
        keys: 'Space plays or pauses, Left and Right turn the knob, D flips direction, Enter checks.',
      },
    },
  },
};

// ---------- shared helpers ----------
const sfxLevel = () => { const v = Number(state().settings.sfxVolume); return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.8; };
const soundOn = () => state().settings.sound !== false;
const hasWebAudio = () => !!(window.AudioContext || window.webkitAudioContext);
const fmt = (s) => { const t = Math.max(0, s); return `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`; };
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

// colour map for spectrograms: black, oxblood, rust, sodium, cream
const LUT = (() => {
  const stops = [[0, [7, 9, 11]], [0.32, [52, 14, 18]], [0.58, [138, 58, 20]], [0.82, [232, 163, 61]], [1, [255, 243, 214]]];
  const out = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const v = i / 255;
    let k = 0;
    while (k < stops.length - 2 && v > stops[k + 1][0]) k++;
    const [a, ca] = stops[k], [b, cb] = stops[k + 1];
    const u = (v - a) / (b - a);
    for (let c = 0; c < 3; c++) out[i * 3 + c] = ca[c] + (cb[c] - ca[c]) * u;
  }
  return out;
})();

/** The reel-to-reel deck: two reels, tape path, VU needle, counter, label strip. */
function makeDeck(label) {
  const CY = 70, RL = 72, RR = 288, RMIN = 15, RMAX = 52;
  const s = svgEl('svg', { class: 'tp-deck-svg', viewBox: '0 0 360 150', 'aria-hidden': 'true', focusable: 'false' });
  const tape = svgEl('path', { class: 'tp-tape-path' });
  s.append(tape);
  const reels = [RL, RR].map((cx) => {
    const g = svgEl('g', {});
    g.append(svgEl('circle', { cx, cy: CY, r: 56, class: 'tp-well' }));
    const pack = svgEl('circle', { cx, cy: CY, r: 30, class: 'tp-pack' });
    const spin = svgEl('g', {});
    // flange: a disc with three windows (even-odd holes)
    let d = `M${cx - 56} ${CY} a56 56 0 1 0 112 0 a56 56 0 1 0 -112 0 `;
    for (let k = 0; k < 3; k++) {
      const a0 = (k * 120 - 32) * Math.PI / 180, a1 = (k * 120 + 32) * Math.PI / 180;
      const p = (r, a) => `${(cx + Math.cos(a) * r).toFixed(2)} ${(CY + Math.sin(a) * r).toFixed(2)}`;
      d += `M${p(19, a0)} L${p(49, a0)} A49 49 0 0 1 ${p(49, a1)} L${p(19, a1)} A19 19 0 0 0 ${p(19, a0)}Z `;
    }
    spin.append(svgEl('path', { d, class: 'tp-flange', 'fill-rule': 'evenodd' }));
    spin.append(svgEl('circle', { cx, cy: CY, r: 11, class: 'tp-hub' }));
    for (let k = 0; k < 3; k++) {
      spin.append(svgEl('rect', { x: cx - 2, y: CY - 11, width: 4, height: 5, class: 'tp-tooth', transform: `rotate(${k * 120 + 60} ${cx} ${CY})` }));
    }
    spin.append(svgEl('circle', { cx, cy: CY, r: 3.2, class: 'tp-spindle' }));
    g.append(pack, spin);
    s.append(g);
    return { cx, pack, spin, ang: Math.random() * 360, r: 30 };
  });
  // rollers and head
  s.append(svgEl('circle', { cx: 122, cy: 134, r: 6, class: 'tp-roller' }), svgEl('circle', { cx: 238, cy: 134, r: 6, class: 'tp-roller' }));
  s.append(svgEl('rect', { x: 164, y: 128, width: 32, height: 18, rx: 4, class: 'tp-head' }), svgEl('rect', { x: 178.5, y: 128, width: 3, height: 18, class: 'tp-head-gap' }));
  // VU meter
  const vu = svgEl('g', { class: 'tp-vu' });
  vu.append(svgEl('rect', { x: 136, y: 12, width: 88, height: 54, rx: 4, class: 'tp-vu-face' }));
  for (let i = 0; i <= 10; i++) {
    const a = (-48 + i * 9.6) * Math.PI / 180;
    const x1 = 180 + Math.sin(a) * 40, y1 = 72 - Math.cos(a) * 40, x2 = 180 + Math.sin(a) * (i % 5 ? 45 : 48), y2 = 72 - Math.cos(a) * (i % 5 ? 45 : 48);
    vu.append(svgEl('line', { x1, y1, x2, y2, class: i >= 8 ? 'tp-vu-tick is-red' : 'tp-vu-tick' }));
  }
  vu.append(svgEl('path', { d: `M${180 + Math.sin(0.5) * 46} ${72 - Math.cos(0.5) * 46} A46 46 0 0 1 ${180 + Math.sin(0.84) * 46} ${72 - Math.cos(0.84) * 46}`, class: 'tp-vu-red' }));
  vu.append(svgEl('text', { x: 142, y: 62, class: 'tp-vu-txt' }, 'VU'));
  const needle = svgEl('line', { x1: 180, y1: 72, x2: 180, y2: 26, class: 'tp-vu-needle' });
  vu.append(needle, svgEl('rect', { x: 136, y: 60, width: 88, height: 10, class: 'tp-vu-cap' }));
  s.append(vu);
  const lamp = svgEl('circle', { cx: 146, cy: 92, r: 4, class: 'tp-lamp' });
  const counter = svgEl('text', { x: 196, y: 97, class: 'tp-counter' }, '00:00.0');
  s.append(lamp, counter);

  const labelEl = h('div', { class: 'tp-label' }, h('span', {}, label));
  const el = h('div', { class: 'tp-deck' }, s, labelEl);
  let pos = 0, speed = 0, target = 0, level = 0, needleA = -48;
  function layout() {
    const rl = Math.sqrt(RMIN * RMIN + (RMAX * RMAX - RMIN * RMIN) * (1 - pos));
    const rr = Math.sqrt(RMIN * RMIN + (RMAX * RMAX - RMIN * RMIN) * pos);
    reels[0].r = rl; reels[1].r = rr;
    reels[0].pack.setAttribute('r', rl.toFixed(1));
    reels[1].pack.setAttribute('r', rr.toFixed(1));
    tape.setAttribute('d', `M${RL - 2} ${(CY + rl).toFixed(1)} L122 140 L238 140 L${RR + 2} ${(CY + rr).toFixed(1)}`);
  }
  function draw() {
    for (const r of reels) r.spin.setAttribute('transform', `rotate(${r.ang.toFixed(1)} ${r.cx} ${CY})`);
    needle.setAttribute('transform', `rotate(${needleA.toFixed(1)} 180 72)`);
  }
  layout(); draw();
  return {
    el,
    setPos(p) { const q = Math.max(0, Math.min(1, p)); if (Math.abs(q - pos) > 0.002) { pos = q; layout(); } },
    setSpeed(v) { speed = v; el.classList.toggle('is-playing', v !== 0); },
    setLevel(v) { target = Math.max(0, Math.min(1, v)); },
    setTime(t) { counter.textContent = fmt(t); },
    setLabel(t) { labelEl.firstChild.textContent = t; },
    /** advance one animation frame; true while anything still moves */
    frame(dt) {
      if (!reduced()) for (const r of reels) r.ang = (r.ang - speed * dt * 260 * (28 / r.r)) % 360;
      const want = -48 + 96 * Math.min(1, target);
      needleA += (want - needleA) * Math.min(1, dt * (want > needleA ? 14 : 5));
      if (speed === 0) target *= Math.max(0, 1 - dt * 6);
      draw();
      return speed !== 0 || Math.abs(needleA + 48) > 0.3;
    },
  };
}

/** Peaks of a sample range for a waveform canvas. */
function drawWave(cv, data, { color = '#e8a33d', bg = null, mid = 'rgba(237,230,214,.18)', bars = false } = {}) {
  const w = Math.max(10, Math.round(cv.clientWidth || cv.width)), hh = Math.max(10, Math.round(cv.clientHeight || cv.height));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = w * dpr; cv.height = hh * dpr;
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, hh);
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, hh); }
  g.fillStyle = mid; g.fillRect(0, hh / 2 - 0.5, w, 1);
  g.fillStyle = color;
  if (bars) {
    const n = data.length, bw = w / n;
    for (let i = 0; i < n; i++) { const v = data[i] * (hh / 2 - 2); g.fillRect(i * bw + bw * 0.18, hh / 2 - v, bw * 0.64, v * 2); }
    return;
  }
  const n = data.length;
  let peak = 1e-4;
  for (let i = 0; i < n; i += 7) peak = Math.max(peak, Math.abs(data[i]));
  for (let x = 0; x < w; x++) {
    const a = Math.floor(x / w * n), b = Math.max(a + 1, Math.floor((x + 1) / w * n));
    let lo = 0, hi = 0;
    for (let i = a; i < b; i += 2) { const v = data[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
    const y0 = hh / 2 - (hi / peak) * (hh / 2 - 2), y1 = hh / 2 - (lo / peak) * (hh / 2 - 2);
    g.fillRect(x, y0, 1, Math.max(1, y1 - y0));
  }
}

// =============================================================================================
export function mount(el, ctx) {
  const variant = L.variantOf(ctx.variant);
  const params = ctx.params || {};
  const sv = ctx.saved && typeof ctx.saved === 'object' && ctx.saved.v === 1 && ctx.saved.variant === variant ? ctx.saved : null;
  let destroyed = false, solved = false, solveTimer = null;

  const root = h('div', { class: `tp tp--${variant}` });
  const status = h('p', { class: 'feedback tp-status', 'aria-live': 'polite' });
  const note = h('p', { class: 'tp-note', role: 'note', hidden: true });
  const deck = makeDeck(params.label || { spectro: 'EXHIBIT · REEL · STATIC', splice: 'EXHIBIT · CUT REEL', reverse: 'EXHIBIT · REEL · NOISE' }[variant]);
  const body = h('div', { class: 'tp-body' });
  const paper = h('div', { class: 'tp-paper' });
  const RULES = {
    spectro: 'It sounds like static. Play it and watch the spectrogram: someone wrote a code into the sound. Find it and type it.',
    splice: 'Someone cut this recording and spliced the pieces in the wrong order. Listen to each piece and put them back.',
    reverse: 'This tape plays wrong: backwards, too slow or too fast. Find the direction and speed where it becomes speech, then type what it says.',
  };
  root.append(
    h('p', { class: 'game-rules' }, RULES[variant]),
    params.clue ? h('p', { class: 'sc-clue tp-clue' }, h('span', { class: 'sc-clue-pin', 'aria-hidden': 'true' }), params.clue) : null,
    h('div', { class: 'tp-machine' }, h('i', { class: 'tp-screws', 'aria-hidden': 'true' }), deck.el, body), note, paper, status);
  el.append(root);

  const say = (t, kind = '') => { status.textContent = t; status.className = `feedback tp-status${kind ? ` is-${kind}` : ''}`; };
  const shake = (node) => { node.classList.remove('is-shake'); void node.offsetWidth; node.classList.add('is-shake'); };

  // ---- sound ----
  let ducked = false;
  const snd = {
    can: () => soundOn() && hasWebAudio(),
    ctx() {
      if (!soundOn()) return null;
      unlock(); // we are inside a tap or a key press
      const ac = audioContext();
      if (!ac) return null;
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    },
    out(ac) { const g = ac.createGain(); g.gain.value = sfxLevel() * 0.9; g.connect(ac.destination); return g; },
    duck(on) {
      if (on === ducked) return;
      ducked = on;
      try { if (on) app.music?.duck?.(0.3); else app.music?.unduck?.(); } catch { /* no music */ }
    },
    kill(nodes) { for (const n of nodes || []) { try { n.stop?.(); } catch { /* not started */ } try { n.disconnect(); } catch { /* gone */ } } },
  };
  function showNote(textOnly) {
    note.hidden = !textOnly && snd.can();
    const printed = variant === 'splice' ? 'printed the pieces as text strips' : 'typed up a transcript that untangles as you fix the setting';
    note.textContent = !soundOn() ? (variant === 'spectro' ? 'Sound is off in Settings. The spectrogram is drawn from the recording itself, so you can solve it silently.' : `Sound is off in Settings, so the lab ${printed}.`)
      : !hasWebAudio() ? (variant === 'spectro' ? 'This device cannot play the tape, but the printed spectrogram still shows everything.' : `This device cannot play the tape, so the lab ${printed}.`)
        : textOnly ? `No recording of this voice reached the lab, so it ${printed}.` : '';
    if (!note.textContent) note.hidden = true;
  }

  // ---- one animation loop for the deck and the variant ----
  let raf = 0, lastT = 0;
  let game = null;
  function loop(now) {
    const dt = Math.min(0.1, Math.max(0, (now - lastT) / 1000));
    lastT = now;
    let more = false;
    try { more = game?.frame?.(dt) || false; } catch (e) { console.error(e); }
    more = deck.frame(dt) || more;
    raf = more && !destroyed ? requestAnimationFrame(loop) : 0;
  }
  const kick = () => { if (!raf && !destroyed) { lastT = performance.now(); raf = requestAnimationFrame(loop); } };

  function win(message) {
    if (solved) return;
    solved = true;
    game?.stop?.();
    root.classList.add('is-solved');
    sfx.good();
    say(message, 'good');
    ctx.onProgress(1);
    solveTimer = setTimeout(() => { if (!destroyed) ctx.onSolved(); }, 900);
  }
  const api = { root, body, paper, deck, say, shake, snd, kick, params, rng: ctx.rng, ctx, sv, win, showNote, isSolved: () => solved, isDestroyed: () => destroyed };
  game = variant === 'splice' ? spliceGame(api) : variant === 'reverse' ? reverseGame(api) : spectroGame(api);

  // ---- keyboard ----
  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || destroyed || !el.isConnected) return;
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' && t.type !== 'range' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (t && t.closest && t.closest('.modal, .ht-card, [role="dialog"]')) return;
    if (e.key === 'Enter') {
      if (t && t.tagName === 'BUTTON') return; // a focused button keeps its own Enter
      if (typing && !root.contains(t)) return;
      e.preventDefault();
      game.check?.();
      return;
    }
    if (typing) return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      if (t && t.tagName === 'BUTTON') return; // Space on a focused button presses it
      e.preventDefault();
      game.toggle?.();
      return;
    }
    if (t && t.tagName === 'INPUT' && t.type === 'range') return; // sliders keep their arrows
    if (game.key?.(e)) e.preventDefault();
  };
  document.addEventListener('keydown', onKey);
  const onVis = () => { if (document.hidden) { game?.stop?.(); snd.duck(false); } };
  document.addEventListener('visibilitychange', onVis);
  const onResize = () => game?.resize?.();
  window.addEventListener('resize', onResize);

  return {
    destroy() {
      destroyed = true;
      clearTimeout(solveTimer);
      cancelAnimationFrame(raf);
      try { game?.destroy?.(); } catch { /* already gone */ }
      game?.stop?.();
      snd.duck(false);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
    },
    hint() { return solved ? null : game.hint(); },
    devSolve() { if (!solved) game.devSolve(); },
  };
}

// =============================================================================================
// spectro: hidden in the hiss
function spectroGame(api) {
  const { body, paper, deck, say, shake, snd, kick, params, rng, ctx, sv, win } = api;
  const P = L.spectroParams(params);
  const plan = L.planSpectro(rng, P);
  const SR = L.SPEC.sampleRate, DUR = plan.duration, VIEW = L.SPEC.view;
  const samples = L.synthSpectro(plan, { sampleRate: SR, noise: P.noise });
  const PXS = 110; // pixels per second, live and printed

  const ok = sv && sv.answer === plan.answer;
  let played = ok && sv.played === true;
  let bandOk = ok && sv.bandOk === true;
  let center = ok && Number.isFinite(sv.center) ? sv.center : VIEW / 2;
  let zoom = ok && Number.isFinite(sv.zoom) ? sv.zoom : 1;
  let contrast = ok && Number.isFinite(sv.contrast) ? sv.contrast : 0.15;
  let revealed = ok && Array.isArray(sv.revealed) ? sv.revealed.filter((i) => Number.isInteger(i) && i >= 0 && i < plan.answer.length) : [];
  let mode = 'live';
  let pos = 0, playing = null; // { nodes, an, startAt, offset, silent, perf }
  let whole = null, wholeLevels = null; // printed spectrogram and its dB percentiles
  const live = []; // { wt, d: Float32Array }
  let liveWt = 0, liveBinHz = 0, liveLevels = null, liveCount = 0;
  let audioBuf = null;

  // ---- DOM ----
  const axis = h('canvas', { class: 'tp-axis', 'aria-hidden': 'true' });
  const cv = h('canvas', { class: 'tp-cv' });
  const head = h('div', { class: 'tp-playhead', 'aria-hidden': 'true' });
  const msg = h('div', { class: 'tp-scope-msg' });
  const inner = h('div', { class: 'tp-cv-wrap' }, cv, head);
  const scroller = h('div', { class: 'tp-scroll', tabindex: '-1' }, inner);
  const scope = h('div', { class: 'tp-scope', role: 'img', 'aria-label': 'Spectrogram of the recording. Higher pitch is higher up, time runs to the right.' }, axis, scroller, msg);
  const liveBtn = h('button', { class: 'tp-seg', type: 'button', 'aria-pressed': 'true', onclick: () => setMode('live') }, 'Live');
  const wholeBtn = h('button', { class: 'tp-seg', type: 'button', 'aria-pressed': 'false', onclick: () => setMode('whole') }, 'Printed tape');
  const playBtn = h('button', { class: 'btn btn--small tp-play', type: 'button', onclick: () => toggle() }, '▶ Play');
  const rewBtn = h('button', { class: 'btn btn--small tp-rew', type: 'button', 'aria-label': 'Back to the start', onclick: () => seek(0, true) }, '⏮');
  const scrub = h('input', { class: 'tp-range tp-scrub', type: 'range', min: '0', max: DUR.toFixed(2), step: '0.01', value: '0', 'aria-label': 'Tape position' });
  const mkSlider = (label, min, max, step, value, oninput) => {
    const out = h('output', { class: 'tp-sl-val' });
    const inp = h('input', { class: 'tp-range', type: 'range', min, max, step, value: String(value), 'aria-label': label });
    inp.addEventListener('input', () => oninput(Number(inp.value)));
    return { inp, out, el: h('label', { class: 'tp-slider' }, h('span', { class: 'tp-sl-lab' }, label), inp, out) };
  };
  const bandS = mkSlider('Band', 0, VIEW, 25, center, (v) => { center = v; viewChanged(); });
  const zoomS = mkSlider('Zoom', 1, 6, 0.05, zoom, (v) => { zoom = v; viewChanged(); });
  const conS = mkSlider('Contrast', 0, 1, 0.01, contrast, (v) => { contrast = v; viewChanged(); });
  const input = h('input', { class: 'tp-input tp-code', type: 'text', maxlength: '14', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', inputmode: 'text', placeholder: '·'.repeat(plan.answer.length), 'aria-label': 'The code on the tape' });
  input.value = ok && typeof sv.typed === 'string' ? sv.typed : '';
  input.addEventListener('input', () => { const c = input.selectionStart; input.value = input.value.toUpperCase(); try { input.setSelectionRange(c, c); } catch { /* not focused */ } persist(); });
  const checkBtn = h('button', { class: 'btn btn--primary tp-check', type: 'button', onclick: () => check() }, 'Check');
  const labNote = h('p', { class: 'tp-labnote', hidden: true });
  const answerRow = h('div', { class: 'tp-answer' }, h('label', { class: 'tp-ask' }, 'Code on the tape', input), checkBtn);

  body.append(
    h('div', { class: 'tp-transport' }, playBtn, rewBtn, h('div', { class: 'tp-segs', role: 'group', 'aria-label': 'Spectrogram view' }, liveBtn, wholeBtn)),
    scope, scrub,
    h('div', { class: 'tp-sliders' }, bandS.el, zoomS.el, conS.el));
  paper.append(answerRow, labNote);

  // ---- view maths ----
  const view = () => {
    const span = VIEW / Math.max(1, zoom);
    const lo = Math.max(0, Math.min(VIEW - span, center - span / 2));
    return { lo, hi: lo + span };
  };
  function levelsOf(frames, binHz) {
    const vals = [];
    const top = Math.floor(VIEW / binHz);
    const step = Math.max(1, Math.floor(frames.length / 120));
    for (let i = 0; i < frames.length; i += step) for (let b = 2; b < Math.min(top, frames[i].length); b += 3) vals.push(frames[i][b]);
    vals.sort((a, b) => a - b);
    const q = (p) => vals[Math.min(vals.length - 1, Math.floor(vals.length * p))] ?? -100;
    const p10 = q(0.1), med = Math.max(q(0.5), p10 + 3);
    return { p10, med, peak: Math.max(q(0.997), med + 12) };
  }
  function mapper(lv) {
    const lo = (lv.p10 - 8) + (lv.med + 4 - (lv.p10 - 8)) * contrast;
    const hi = (lv.peak + 8) - 14 * contrast;
    const k = 255 / Math.max(3, hi - lo);
    return (db) => { const v = (db - lo) * k; return v <= 0 ? 0 : v >= 255 ? 255 : v | 0; };
  }
  function paintAxis() {
    const hh = scroller.clientHeight || 200, w = 30;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    axis.width = w * dpr; axis.height = hh * dpr;
    const g = axis.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, hh);
    const { lo, hi } = view();
    const span = hi - lo;
    const step = span > 4000 ? 2000 : span > 2000 ? 1000 : 500;
    g.font = '600 10px Archivo, system-ui, sans-serif';
    g.fillStyle = 'rgba(237,230,214,.75)';
    g.textAlign = 'right';
    for (let f = Math.ceil(lo / step) * step; f <= hi; f += step) {
      const y = (1 - (f - lo) / span) * hh;
      g.fillRect(w - 4, Math.round(y), 4, 1);
      g.fillText(f >= 1000 ? `${(f / 1000).toFixed(f % 1000 ? 1 : 0)}k` : String(f), w - 6, Math.max(9, Math.min(hh - 2, y + 3.5)));
    }
  }
  function paintFrames(width, hh, frameAt, binHz, lv) {
    cv.width = width; cv.height = hh;
    cv.style.width = `${width}px`;
    const g = cv.getContext('2d');
    const img = g.createImageData(width, hh);
    const d = img.data;
    const { lo, hi } = view();
    const map = mapper(lv);
    const bins = new Float32Array(hh);
    for (let y = 0; y < hh; y++) bins[y] = (hi - (y + 0.5) / hh * (hi - lo)) / binHz;
    for (let x = 0; x < width; x++) {
      const f = frameAt(x);
      for (let y = 0; y < hh; y++) {
        let idx = 0;
        if (f) {
          const b = bins[y], b0 = b | 0, u = b - b0;
          const v = b0 + 1 < f.length ? f[b0] * (1 - u) + f[b0 + 1] * u : f[f.length - 1];
          idx = map(v);
        }
        const o = (y * width + x) * 4;
        d[o] = LUT[idx * 3]; d[o + 1] = LUT[idx * 3 + 1]; d[o + 2] = LUT[idx * 3 + 2]; d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
  }
  function paint() {
    const hh = Math.round(scroller.clientHeight || 200);
    if (mode === 'whole' && whole) {
      const width = Math.max(Math.round(scroller.clientWidth || 300), Math.round(DUR * PXS));
      const fpx = (DUR / width) / whole.hop;
      paintFrames(width, hh, (x) => whole.frames[Math.min(whole.frames.length - 1, Math.floor((x + 0.5) * fpx))], whole.binHz, wholeLevels);
      placeHead();
      msg.textContent = '';
    } else {
      const width = Math.round(scroller.clientWidth || 300);
      if (!live.length) {
        const g = (cv.width = width, cv.height = hh, cv.style.width = `${width}px`, cv.getContext('2d'));
        g.fillStyle = '#07090b'; g.fillRect(0, 0, width, hh);
        msg.textContent = snd.can() ? 'Press Play. The sound is drawn here as it plays.' : '';
      } else {
        msg.textContent = '';
        const end = liveWt;
        let j = live.length - 1;
        const cols = new Array(width);
        // each frame paints the stretch of time since the one before it
        for (let x = width - 1; x >= 0; x--) {
          const t = end - (width - 1 - x) / PXS;
          while (j > 0 && live[j - 1].wt >= t) j--;
          const f = live[j];
          cols[x] = f.wt >= t && f.wt - f.dt <= t + 1e-6 ? f.d : null;
        }
        paintFrames(width, hh, (x) => cols[x], liveBinHz, liveLevels || { p10: -110, med: -95, peak: -30 });
      }
      head.style.display = 'none';
    }
    paintAxis();
    updateLabels();
  }
  function placeHead() {
    if (mode !== 'whole') return;
    const width = cv.width;
    head.style.display = '';
    head.style.transform = `translateX(${(pos / DUR * width).toFixed(1)}px)`;
  }
  function updateLabels() {
    const { lo, hi } = view();
    bandS.out.textContent = `${(lo / 1000).toFixed(1)}–${(hi / 1000).toFixed(1)} kHz`;
    zoomS.out.textContent = `${zoom.toFixed(1)}×`;
    conS.out.textContent = `${Math.round(contrast * 100)}%`;
    liveBtn.setAttribute('aria-pressed', String(mode === 'live'));
    wholeBtn.setAttribute('aria-pressed', String(mode === 'whole'));
    wholeBtn.disabled = !whole || !(played || !snd.can());
    liveBtn.disabled = !snd.can();
    scrub.value = pos.toFixed(2);
    deck.setPos(pos / DUR);
    deck.setTime(pos);
  }
  function setMode(m) {
    if (m === 'whole' && (!whole || !(played || !snd.can()))) return;
    if (m === 'live' && !snd.can()) return;
    mode = m;
    persist();
    paint();
    if (m === 'whole') follow(true);
  }
  function follow(force) {
    if (mode !== 'whole') return;
    const x = pos / DUR * cv.width, w = scroller.clientWidth;
    if (force || x < scroller.scrollLeft + 20 || x > scroller.scrollLeft + w - 40) scroller.scrollLeft = Math.max(0, x - w * 0.3);
  }
  let paintQueued = false;
  function viewChanged() {
    if (!paintQueued) { paintQueued = true; requestAnimationFrame(() => { paintQueued = false; if (!api.isDestroyed()) paint(); }); }
    const found = L.bandFound(view(), plan.band);
    if (found && !bandOk) {
      bandOk = true;
      say('That band is busier than the hiss around it. Look closely.');
      progress();
    }
    persist();
  }

  // ---- the printed tape: rendered offline from the same graph that plays ----
  (async () => {
    let data = samples;
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (OAC) {
      try {
        const oac = new OAC(1, samples.length, SR);
        const b = oac.createBuffer(1, samples.length, SR);
        b.getChannelData(0).set(samples);
        const s = oac.createBufferSource();
        s.buffer = b;
        const lp = oac.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 9000;
        s.connect(lp).connect(oac.destination);
        s.start();
        const r = await oac.startRendering();
        data = r.getChannelData(0);
      } catch { /* the raw samples are the same recording */ }
    }
    if (api.isDestroyed()) return;
    whole = L.stft(data, SR, { size: 1024, hop: 220, maxFreq: VIEW + 200 });
    wholeLevels = levelsOf(whole.frames, whole.binHz);
    if ((played || !snd.can()) && (mode === 'live' || !snd.can())) mode = 'whole';
    if (ok && sv.mode === 'live' && snd.can()) mode = 'live';
    paint();
  })();

  // ---- playing ----
  function bufferFor(ac) {
    if (audioBuf && audioBuf.sampleRate === SR) return audioBuf;
    audioBuf = ac.createBuffer(1, samples.length, SR);
    audioBuf.getChannelData(0).set(samples);
    return audioBuf;
  }
  function play(from = pos) {
    stop();
    if (from >= DUR - 0.05) from = 0;
    const ac = snd.ctx();
    const p = { nodes: [], an: null, offset: from, silent: !ac, perf: performance.now(), startAt: 0 };
    if (ac) {
      const src = ac.createBufferSource();
      src.buffer = bufferFor(ac);
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 9000;
      const an = ac.createAnalyser();
      an.fftSize = 2048; an.smoothingTimeConstant = 0; an.minDecibels = -120; an.maxDecibels = 0;
      const out = snd.out(ac);
      src.connect(lp).connect(an).connect(out);
      p.startAt = ac.currentTime + 0.03;
      src.start(p.startAt, from);
      p.nodes.push(src, lp, an, out);
      p.an = an; p.ac = ac;
      p.fbuf = new Float32Array(an.frequencyBinCount);
      p.tbuf = new Float32Array(an.fftSize);
      liveBinHz = ac.sampleRate / an.fftSize;
      snd.duck(true);
      if (mode === 'whole' && !played) mode = 'live';
    } else if (mode === 'live') mode = whole ? 'whole' : 'live';
    playing = p;
    deck.setSpeed(1);
    playBtn.textContent = '❚❚ Pause';
    playBtn.setAttribute('aria-pressed', 'true');
    paint();
    kick();
  }
  function stop() {
    if (!playing) return;
    snd.kill(playing.nodes);
    playing = null;
    deck.setSpeed(0);
    snd.duck(false);
    playBtn.textContent = '▶ Play';
    playBtn.setAttribute('aria-pressed', 'false');
  }
  function toggle() { if (api.isSolved() && !playing) { play(0); return; } if (playing) { stop(); persist(); } else play(); }
  function seek(t, user) {
    pos = Math.max(0, Math.min(DUR, t));
    if (playing) play(pos);
    else { updateLabels(); placeHead(); if (user) follow(false); }
    persist();
  }
  scrub.addEventListener('input', () => seek(Number(scrub.value), true));
  // tap the printed tape to jump there
  cv.addEventListener('click', (e) => {
    if (mode !== 'whole') return;
    const r = cv.getBoundingClientRect();
    seek((e.clientX - r.left) / r.width * DUR, false);
  });

  function finished() {
    stop();
    pos = DUR;
    const first = !played;
    played = true;
    if (first) {
      if (whole) { mode = 'whole'; say('The lab printed the whole tape below. Study it as long as you like.'); }
      progress();
    }
    persist();
    paint();
    if (mode === 'whole') scroller.scrollLeft = 0; // read it from the start
  }

  function frame(dt) {
    if (!playing) return false;
    const p = playing;
    if (p.silent) pos = p.offset + (performance.now() - p.perf) / 1000;
    else pos = p.offset + Math.max(0, p.ac.currentTime - p.startAt);
    if (pos >= DUR) { finished(); return false; }
    if (p.an) {
      p.an.getFloatFrequencyData(p.fbuf);
      const bins = Math.min(p.fbuf.length, Math.ceil((VIEW + 200) / liveBinHz));
      const fd = Math.min(0.25, dt);
      liveWt += fd;
      const d = p.fbuf.slice(0, bins);
      for (let i = 0; i < d.length; i++) if (!(d[i] > -160)) d[i] = -160; // silence reads as -Infinity
      live.push({ wt: liveWt, dt: fd, d });
      if (live.length > 3000) live.splice(0, live.length - 3000);
      if (++liveCount < 30 || liveCount % 15 === 0) liveLevels = levelsOf(live.slice(-240), liveBinHz);
      p.an.getFloatTimeDomainData(p.tbuf);
      let s = 0;
      for (let i = 0; i < p.tbuf.length; i += 4) s += p.tbuf[i] * p.tbuf[i];
      deck.setLevel(Math.sqrt(s / (p.tbuf.length / 4)) * 3.2);
    } else deck.setLevel(0.35 + 0.25 * Math.sin(pos * 9) * Math.sin(pos * 2.3));
    if (mode === 'live') paint();
    else { placeHead(); follow(false); updateLabels(); }
    return true;
  }

  // ---- answer ----
  function persist() {
    ctx.onSave({ v: 1, variant: 'spectro', answer: plan.answer, played, bandOk, center, zoom, contrast, revealed, typed: input.value, mode });
  }
  function progress() { ctx.onProgress(Math.max(played ? 0.3 : 0, bandOk ? 0.5 : 0, played && bandOk ? 0.55 : 0)); }
  function check() {
    if (api.isSolved()) return;
    const t = input.value.trim();
    const want = plan.answer.replace(/-/g, '');
    if (!t) { say('Type the code the tape spells first.', 'bad'); input.focus(); return; }
    if (L.codeMatches(t, plan.answer)) {
      stop();
      persist();
      win(`Read off the tape: ${plan.answer}.`);
      return;
    }
    sfx.bad();
    shake(answerRow);
    const typed = t.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const right = L.codeRightCount(t, plan.answer);
    if (typed.length !== want.length) say(`Not that. The code on the tape has ${want.length} letters and digits${plan.answer.includes('-') ? ' (and a dash)' : ''}.`, 'bad');
    else if (right >= want.length - 2) say('Close. One or two characters are off. Look again at the shapes.', 'bad');
    else say('Not that. Some of those scraps are decoys: find the band with the whole code.', 'bad');
  }
  function showLabNote() {
    if (!revealed.length) { labNote.hidden = true; return; }
    const ord = (i) => `${i + 1}${['st', 'nd', 'rd'][((i + 1) % 100 - 20) % 10 - 1] || 'th'}`;
    labNote.hidden = false;
    labNote.textContent = `Lab notes: ${revealed.slice().sort((a, b) => a - b).map((i) => `${ord(i)} is ${plan.answer[i] === '-' ? 'a dash' : plan.answer[i]}`).join(', ')}.`;
  }

  // ---- first paint ----
  bandS.inp.value = String(center); zoomS.inp.value = String(zoom); conS.inp.value = String(contrast);
  if (ok && sv.mode === 'whole' && played) mode = 'whole';
  api.showNote(false);
  showLabNote();
  requestAnimationFrame(() => { if (!api.isDestroyed()) paint(); });
  progress();
  persist();

  return {
    frame, stop, toggle, check,
    resize: () => paint(),
    key(e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { seek(pos + (e.key === 'ArrowLeft' ? -0.5 : 0.5), true); return true; }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        center = Math.max(0, Math.min(VIEW, center + (e.key === 'ArrowUp' ? 1 : -1) * (VIEW / zoom) * 0.15));
        bandS.inp.value = String(center);
        viewChanged();
        return true;
      }
      return false;
    },
    hint() {
      if (!L.bandFound(view(), plan.band) || contrast < 0.5) {
        const bh = plan.band.hi - plan.band.lo;
        zoom = Math.min(6, Math.max(1, VIEW / (bh * 1.6)));
        center = (plan.band.lo + plan.band.hi) / 2;
        contrast = Math.max(contrast, 0.6);
        bandS.inp.value = String(center); zoomS.inp.value = String(zoom); conS.inp.value = String(contrast);
        if (whole && !snd.can()) mode = 'whole';
        viewChanged();
        return `The lab tuned the scope to ${(plan.band.lo / 1000).toFixed(1)}–${(plan.band.hi / 1000).toFixed(1)} kHz and turned up the contrast. The code is written there${played || !snd.can() ? '' : ': play the tape'}.`;
      }
      const typed = input.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      const open = [...plan.answer].map((_, i) => i).filter((i) => !revealed.includes(i) && plan.answer[i] !== '-');
      if (!open.length) return null;
      const i = open.find((k) => typed[k] !== plan.answer[k]) ?? open[0];
      revealed.push(i);
      showLabNote();
      persist();
      return `Lab enhancement: character ${i + 1} of the code is ${plan.answer[i]}.`;
    },
    devSolve() { input.value = plan.answer; played = true; bandOk = true; check(); },
    destroy() { stop(); },
  };
}

// =============================================================================================
// splice: cut tape
function spliceGame(api) {
  const { body, paper, deck, say, shake, snd, kick, params, rng, ctx, sv, win } = api;
  const line = params.line && typeof params.line === 'object' ? params.line : { who: null, en: String(params.line || 'No line given.') };
  const words = String(line.en || '').trim().split(/\s+/).filter(Boolean);
  const N = Math.max(2, Math.min(L.spliceParams(params).pieces, words.length));
  const texts = L.textPieces(line.en, N);
  const seed = hashStr(`${line.who}|${line.en}`);
  const shuffled = L.shuffleOrder(rng, N);
  // reel labels: random letters whose alphabetical order is itself a wrong order, so sorting them never solves it
  const pool = L.shuffleOrder(mulberry32(seed ^ 0x51ce), 12).slice(0, N).map((i) => 'BDFHKMPRTVWX'[i]).sort();
  const labelPerm = L.shuffleOrder(mulberry32(seed ^ 0x7a11), N);
  const LAB = Array.from({ length: N }, (_, id) => pool[labelPerm[id]]);
  let order = sv && Array.isArray(sv.order) && sv.order.length === N && [...sv.order].sort((a, b) => a - b).every((x, i) => x === i) ? sv.order.slice() : shuffled;
  let mode = 'loading'; // 'audio' | 'text'
  let readOnly = sv?.read === true; // player chose the text strips
  let pieces = null; // audio: [{ buffer, data }]
  let sel = null; // selected slot
  let playing = null; // { nodes, perf, ac, startAt, items:[{slot, at, dur}], all, idx }
  let audioReady = null;
  let lastJoins = L.rightJoins(order);
  const abort = typeof AbortController === 'function' ? new AbortController() : null;

  const list = h('ol', { class: 'tp-reel', 'aria-label': 'Tape pieces, in splice order' });
  const playAllBtn = h('button', { class: 'btn btn--primary tp-playall', type: 'button', onclick: () => check() }, '▶ Play the splice');
  const readBtn = h('button', { class: 'btn btn--small btn--ghost tp-read', type: 'button', hidden: true, onclick: () => { readOnly = !readOnly; stop(); setMode(readOnly ? 'text' : 'audio'); persist(); } });
  const transcript = h('p', { class: 'tp-transcript', 'aria-live': 'polite', hidden: true });
  body.append(list, h('div', { class: 'tp-actions' }, playAllBtn, readBtn));
  paper.append(transcript);

  // ---- the audio, or the text strips (started at the end of setup) ----
  const load = async () => {
    say('Threading the reel…');
    let got = null;
    if (snd.can()) got = await loadLineAudio(line, { signal: abort?.signal });
    if (api.isDestroyed()) return;
    if (got) {
      const b = got.buffer;
      const data = b.getChannelData(0);
      const cuts = L.cutPoints(data, b.sampleRate, N);
      if (cuts && cuts.length === N) {
        const fade = Math.round(0.006 * b.sampleRate);
        pieces = cuts.map(({ start, end }) => {
          const seg = data.slice(start, end);
          for (let i = 0; i < Math.min(fade, seg.length); i++) { seg[i] *= i / fade; seg[seg.length - 1 - i] *= i / fade; }
          return { data: seg, sampleRate: b.sampleRate, dur: seg.length / b.sampleRate };
        });
        audioReady = true;
      }
    }
    if (!audioReady) audioReady = false;
    setMode(audioReady && !readOnly ? 'audio' : 'text');
    say(mode === 'audio' ? 'Tap ▶ to hear a piece. Tap two pieces to swap them.' : 'Read the strips. Tap two pieces to swap them.');
  };

  function setMode(m) {
    mode = m;
    readBtn.hidden = !audioReady;
    readBtn.textContent = mode === 'audio' ? 'Can’t listen? Read the strips' : 'Listen instead';
    api.showNote(mode === 'text' && !readOnly);
    render();
  }

  const bufFor = (ac, p) => {
    if (p.buf && p.bufCtx === ac) return p.buf;
    p.buf = ac.createBuffer(1, p.data.length, p.sampleRate);
    p.buf.getChannelData(0).set(p.data);
    p.bufCtx = ac;
    return p.buf;
  };
  const textDur = (i) => 0.35 + texts[i].length * 0.055;
  const durOf = (id) => (mode === 'audio' ? pieces[id].dur : textDur(id));

  // ---- render ----
  const items = [];
  function render() {
    list.textContent = '';
    items.length = 0;
    list.classList.toggle('is-text', mode === 'text');
    list.classList.toggle('is-loading', mode === 'loading');
    if (mode === 'loading') {
      for (let i = 0; i < N; i++) list.append(h('li', { class: 'tp-piece is-ghost' }, h('span', { class: 'tp-ptag' }, '·'), h('span', { class: 'tp-pbody' })));
      playAllBtn.disabled = true;
      return;
    }
    playAllBtn.disabled = api.isSolved();
    order.forEach((id, slot) => {
      const wave = h('canvas', { class: 'tp-pwave', 'aria-hidden': 'true' });
      const pbtn = h('button', { class: 'tp-pplay', type: 'button', 'aria-label': `Play piece ${LAB[id]}`, onclick: (e) => { e.stopPropagation(); playPiece(slot); } }, '▶');
      const grip = h('span', { class: 'tp-grip', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'));
      const pbody = h('div', { class: 'tp-pbody' },
        mode === 'text' ? h('span', { class: 'tp-ptext' }, texts[id]) : null,
        wave);
      const li = h('li', {
        class: `tp-piece${sel === slot ? ' is-sel' : ''}`, tabindex: slot === (sel ?? 0) ? '0' : '-1', role: 'button',
        'aria-label': `Slot ${slot + 1}: piece ${LAB[id]}${mode === 'text' ? `, "${texts[id]}"` : ''}${sel === slot ? ', picked up' : ''}`,
      }, h('span', { class: 'tp-slotn', 'aria-hidden': 'true' }, String(slot + 1)), pbtn, h('span', { class: 'tp-ptag', 'aria-hidden': 'true' }, LAB[id]), pbody, grip);
      li.addEventListener('click', () => tapSlot(slot));
      li.addEventListener('focus', () => { focusSlot = slot; });
      attachDrag(li, grip, slot);
      list.append(li);
      items.push({ li, wave, id });
    });
    requestAnimationFrame(drawWaves);
    progress();
  }
  function drawWaves() {
    for (const it of items) {
      if (!it.wave.isConnected) continue;
      if (mode === 'audio') drawWave(it.wave, pieces[it.id].data);
      else drawWave(it.wave, L.waveBars(texts[it.id], seed + it.id, Math.max(14, Math.round(texts[it.id].length * 1.1))), { bars: true, color: 'rgba(232,163,61,.75)' });
    }
  }
  let focusSlot = 0;
  function focusAt(slot) { focusSlot = slot; const li = items[slot]?.li; if (li) { items.forEach((x, i) => x.li.setAttribute('tabindex', i === slot ? '0' : '-1')); li.focus({ preventScroll: false }); } }

  function tapSlot(slot) {
    if (api.isSolved() || mode === 'loading') return;
    if (sel == null) { sel = slot; sfx.click(); say(`Piece ${LAB[order[slot]]} picked up. Tap another piece to swap them.`); render(); focusAt(slot); return; }
    if (sel === slot) { sel = null; render(); focusAt(slot); say(''); return; }
    swap(sel, slot);
    sel = null;
    render();
    focusAt(slot);
  }
  function swap(a, b) {
    [order[a], order[b]] = [order[b], order[a]];
    stop();
    sfx.click();
    afterMove();
  }
  function moveTo(from, to) {
    if (from === to) return;
    const [x] = order.splice(from, 1);
    order.splice(to, 0, x);
    stop();
    sfx.click();
    afterMove();
  }
  function afterMove() {
    const j = L.rightJoins(order);
    lastJoins = j;
    persist();
    say(`Order now: ${order.map((id) => LAB[id]).join(' ')}.`);
  }
  function persist() { ctx.onSave({ v: 1, variant: 'splice', order, read: readOnly }); }
  function progress() { if (!api.isSolved()) ctx.onProgress(0.9 * (L.rightJoins(order) / Math.max(1, N - 1))); }

  // ---- drag (by the grip on touch; anywhere on the piece with a mouse) ----
  let drag = null;
  function attachDrag(li, grip, slot) {
    const start = (e, viaGrip) => {
      if (api.isSolved() || mode === 'loading') return;
      if (e.button != null && e.button !== 0) return;
      if (!viaGrip && e.pointerType !== 'mouse') return;
      if (e.target.closest('.tp-pplay')) return;
      drag = { slot, x0: e.clientX, y0: e.clientY, on: false, li, ghost: null, marker: null, to: slot, id: e.pointerId };
      if (viaGrip) e.preventDefault();
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    };
    grip.addEventListener('pointerdown', (e) => start(e, true));
    li.addEventListener('pointerdown', (e) => { if (!e.target.closest('.tp-grip')) start(e, false); });
  }
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.on) {
      if (Math.hypot(dx, dy) < 7) return;
      drag.on = true;
      const r = drag.li.getBoundingClientRect();
      drag.ghost = drag.li.cloneNode(true);
      drag.ghost.classList.add('tp-ghost');
      const c0 = drag.li.querySelector('canvas'), c1 = drag.ghost.querySelector('canvas');
      if (c0 && c1) { c1.width = c0.width; c1.height = c0.height; c1.getContext('2d').drawImage(c0, 0, 0); }
      Object.assign(drag.ghost.style, { width: `${r.width}px`, height: `${r.height}px`, left: `${r.left}px`, top: `${r.top}px` });
      document.body.append(drag.ghost);
      drag.r0 = r;
      drag.li.classList.add('is-dragging');
      drag.marker = h('div', { class: 'tp-drop', 'aria-hidden': 'true' });
      list.append(drag.marker);
      sel = null;
    }
    e.preventDefault();
    drag.ghost.style.transform = `translate(${dx}px, ${dy}px) rotate(-1deg)`;
    // insertion point: nearest gap between pieces
    let best = 0, bd = Infinity;
    const rects = items.map((it) => it.li.getBoundingClientRect());
    const lr = list.getBoundingClientRect();
    for (let k = 0; k <= rects.length; k++) {
      const r = k < rects.length ? rects[k] : rects[rects.length - 1];
      const horiz = rects.length > 1 && Math.abs(rects[1].top - rects[0].top) < rects[0].height / 2;
      const gx = k < rects.length ? (horiz ? r.left : r.left + r.width / 2) : (horiz ? r.right : r.left + r.width / 2);
      const gy = k < rects.length ? (horiz ? r.top + r.height / 2 : r.top) : (horiz ? r.top + r.height / 2 : r.bottom);
      const d = Math.hypot(e.clientX - gx, e.clientY - gy);
      if (d < bd) { bd = d; best = k; drag.mk = { horiz, x: gx - lr.left, y: gy - lr.top, w: r.width, hgt: r.height }; }
    }
    drag.to = best > drag.slot ? best - 1 : best;
    const m = drag.mk;
    Object.assign(drag.marker.style, m.horiz
      ? { left: `${m.x - 2}px`, top: `${m.y - m.hgt / 2}px`, width: '4px', height: `${m.hgt}px` }
      : { left: `${m.x - m.w / 2}px`, top: `${m.y - 3}px`, width: `${m.w}px`, height: '4px' });
  }
  function end(e) {
    if (!drag || (e.pointerId != null && e.pointerId !== drag.id)) return;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    const d = drag;
    drag = null;
    if (!d.on) return; // a plain tap: the click handler deals with it
    d.ghost?.remove();
    d.marker?.remove();
    d.li.classList.remove('is-dragging');
    // swallow the click that follows a drag
    const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    window.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
    if (e.type !== 'pointercancel') moveTo(d.slot, d.to);
    render();
    focusAt(Math.min(N - 1, Math.max(0, d.to)));
  }

  // ---- playing ----
  function highlight(slot) { items.forEach((it, i) => it.li.classList.toggle('is-on', i === slot)); }
  function play(slots, all) {
    stop();
    const ac = mode === 'audio' ? snd.ctx() : null;
    const p = { nodes: [], items: [], all, perf: performance.now(), ac, startAt: 0, idx: -1 };
    let at = 0;
    for (const slot of slots) { const d = durOf(order[slot]); p.items.push({ slot, at, dur: d }); at += d + (mode === 'text' ? 0.08 : 0); }
    p.total = at;
    if (ac) {
      const out = snd.out(ac);
      const an = ac.createAnalyser();
      an.fftSize = 1024;
      an.connect(out);
      p.an = an; p.tbuf = new Float32Array(an.fftSize);
      p.startAt = ac.currentTime + 0.04;
      for (const it of p.items) {
        const src = ac.createBufferSource();
        src.buffer = bufFor(ac, pieces[order[it.slot]]);
        src.connect(an);
        src.start(p.startAt + it.at);
        p.nodes.push(src);
      }
      p.nodes.push(an, out);
      snd.duck(true);
    }
    playing = p;
    deck.setSpeed(1);
    if (all) { playAllBtn.textContent = '■ Stop'; transcript.hidden = mode !== 'text'; transcript.textContent = ''; }
    kick();
  }
  function stop() {
    if (!playing) return;
    snd.kill(playing.nodes);
    const wasAll = playing.all;
    playing = null;
    deck.setSpeed(0);
    snd.duck(false);
    highlight(-1);
    if (wasAll) playAllBtn.textContent = '▶ Play the splice';
  }
  function playPiece(slot) {
    if (mode === 'loading') return;
    if (playing && !playing.all && playing.items[0]?.slot === slot) { stop(); return; }
    focusSlot = slot;
    play([slot], false);
  }
  function frame() {
    if (!playing) return false;
    const p = playing;
    const t = p.ac ? p.ac.currentTime - p.startAt : (performance.now() - p.perf) / 1000;
    const idx = p.items.findIndex((it) => t >= it.at && t < it.at + it.dur);
    if (idx !== p.idx) {
      p.idx = idx;
      highlight(idx >= 0 ? p.items[idx].slot : -1);
      if (p.all && mode === 'text' && idx >= 0) transcript.textContent = p.items.slice(0, idx + 1).map((it) => texts[order[it.slot]]).join(' ');
    }
    deck.setPos(Math.max(0, Math.min(1, t / p.total)));
    deck.setTime(Math.max(0, t));
    if (p.an) {
      p.an.getFloatTimeDomainData(p.tbuf);
      let s = 0;
      for (let i = 0; i < p.tbuf.length; i += 2) s += p.tbuf[i] * p.tbuf[i];
      deck.setLevel(Math.sqrt(s / (p.tbuf.length / 2)) * 4);
    } else if (idx >= 0) {
      const it = p.items[idx];
      const bars = L.waveBars(texts[order[it.slot]], seed + order[it.slot], 24);
      deck.setLevel(bars[Math.min(23, Math.floor((t - it.at) / it.dur * 24))]);
    }
    if (t >= p.total) {
      const all = p.all;
      stop();
      if (all) verdict();
      return false;
    }
    return true;
  }
  function toggle() {
    if (playing) { stop(); return; }
    if (mode === 'loading') return;
    if (sel != null) playPiece(sel); else if (document.activeElement && items.some((it) => it.li === document.activeElement)) playPiece(focusSlot); else check();
  }
  function check() {
    if (api.isSolved() || mode === 'loading') return;
    if (playing?.all) { stop(); return; }
    sel = null;
    render();
    say(mode === 'audio' ? 'Playing your splice…' : 'Reading your splice…');
    play(order.map((_, i) => i), true);
  }
  function verdict() {
    if (L.isInOrder(order)) {
      transcript.hidden = false;
      transcript.textContent = line.en;
      persist();
      win(mode === 'audio' ? 'It runs clean: the sentence plays as it was spoken.' : 'It reads clean: the sentence is whole again.');
      render();
      return;
    }
    const j = L.rightJoins(order);
    sfx.bad();
    shake(list);
    say(j === 0 ? `It jumps at every splice. ${mode === 'audio' ? 'Listen' : 'Look'} for how the sentence starts.` : `It jumps. ${j} of ${N - 1} splices run smooth.`, 'bad');
  }

  render();
  load();
  return {
    frame, stop, toggle, check,
    resize: () => drawWaves(),
    key(e) {
      if (mode === 'loading') return false;
      const k = e.key;
      const back = k === 'ArrowUp' || k === 'ArrowLeft', fwd = k === 'ArrowDown' || k === 'ArrowRight';
      if (!back && !fwd) {
        if (k === 'Escape' && sel != null) { sel = null; render(); return true; }
        return false;
      }
      const cur = sel ?? focusSlot;
      const to = Math.max(0, Math.min(N - 1, cur + (fwd ? 1 : -1)));
      if (e.shiftKey) {
        if (to !== cur) { swap(cur, to); sel = sel != null ? to : null; render(); }
        focusAt(to);
      } else { if (sel != null) sel = null; render(); focusAt(to); }
      return true;
    },
    hint() {
      if (mode === 'loading') return null;
      const slot = order.findIndex((x, i) => x !== i);
      if (slot < 0) return null;
      const from = order.indexOf(slot);
      [order[slot], order[from]] = [order[from], order[slot]];
      sel = null;
      persist();
      render();
      if (L.isInOrder(order)) { check(); }
      return `The lab matched the cut edges: piece ${LAB[slot]} goes in slot ${slot + 1}.`;
    },
    devSolve() { order = order.map((_, i) => i); sel = null; render(); if (mode === 'loading') { persist(); api.win('It runs clean.'); } else check(); },
    destroy() { abort?.abort(); stop(); drag?.ghost?.remove(); },
  };
}

// =============================================================================================
// reverse: played backwards, slowed down
function reverseGame(api) {
  const { body, paper, deck, say, shake, snd, kick, params, rng, ctx, sv, win } = api;
  const line = params.line && typeof params.line === 'object' ? params.line : { who: null, en: String(params.line || '') };
  const caption = String(line.en || '').trim();
  const answer = String(params.answer || L.defaultPhrase(caption));
  const answers = [answer, ...(Array.isArray(params.accept) ? params.accept : [])];
  const scr = L.pickMode(rng, L.reverseParams(params).mode);
  const M = L.REV_MODES[scr];
  const right = L.rightSetting(scr);
  const seed = hashStr(caption) ^ 0x2f6b;
  const ok = sv && sv.mode === scr;
  let knob = ok && Number.isFinite(sv.knob) ? L.snapKnob(sv.knob) : 1;
  let dir = ok && (sv.dir === -1 || sv.dir === 1) ? sv.dir : 1;
  let near = ok && sv.near === true;
  let heard = ok && sv.heard === true;
  let readOnly = ok && sv.read === true;
  let mode = 'loading';
  let audio = null; // { buf: Float32Array, rev: Float32Array, sr, dur }
  let audioReady = null;
  let playing = null; // { src, nodes, ac, an, tbuf, perf }
  let tau = 0; // tape position, seconds of tape
  const abort = typeof AbortController === 'function' ? new AbortController() : null;

  // ---- DOM ----
  const knobSvg = svgEl('svg', { class: 'tp-knob-svg', viewBox: '0 0 160 160', 'aria-hidden': 'true', focusable: 'false' });
  const KC = 80, A = (k) => Math.log2(k) * 135; // degrees from straight up
  for (const d of L.DETENTS) {
    const a = (A(d) - 90) * Math.PI / 180;
    knobSvg.append(svgEl('line', { x1: KC + Math.cos(a) * 52, y1: KC + Math.sin(a) * 52, x2: KC + Math.cos(a) * 60, y2: KC + Math.sin(a) * 60, class: 'tp-ktick' }));
    knobSvg.append(svgEl('text', { x: KC + Math.cos(a) * 71, y: KC + Math.sin(a) * 71 + 4, class: 'tp-klab' }, d === 0.625 ? '⅝' : d === 0.5 ? '½' : String(d)));
  }
  knobSvg.append(svgEl('circle', { cx: KC, cy: KC, r: 46, class: 'tp-kbody' }), svgEl('circle', { cx: KC, cy: KC, r: 38, class: 'tp-kcap' }));
  const pointer = svgEl('g', {});
  pointer.append(svgEl('line', { x1: KC, y1: KC - 12, x2: KC, y2: KC - 36, class: 'tp-kptr' }));
  knobSvg.append(pointer);
  const knobVal = h('output', { class: 'tp-kval' });
  const knobEl = h('div', { class: 'tp-knob', role: 'slider', tabindex: '0', 'aria-label': 'Playback speed', 'aria-valuemin': '0.5', 'aria-valuemax': '2' }, knobSvg);
  const minus = h('button', { class: 'btn tp-kbtn', type: 'button', 'aria-label': 'Slower', onclick: () => setKnob(L.stepKnob(knob, -1)) }, '−');
  const plus = h('button', { class: 'btn tp-kbtn', type: 'button', 'aria-label': 'Faster', onclick: () => setKnob(L.stepKnob(knob, 1)) }, '+');
  const revBtn = h('button', { class: 'tp-seg', type: 'button', onclick: () => setDir(-1) }, '◀ Reverse');
  const fwdBtn = h('button', { class: 'tp-seg', type: 'button', onclick: () => setDir(1) }, 'Forward ▶');
  const playBtn = h('button', { class: 'btn btn--small tp-play', type: 'button', onclick: () => toggle() }, '▶ Play');
  const wave = h('canvas', { class: 'tp-rwave', 'aria-hidden': 'true' });
  const rhead = h('div', { class: 'tp-playhead', 'aria-hidden': 'true' });
  const waveBox = h('div', { class: 'tp-rwave-box' }, wave, rhead);
  const capText = h('span', { class: 'tp-cap-text' });
  const capBox = h('div', { class: 'tp-caption', 'aria-live': 'off' }, h('span', { class: 'tp-cap-lab' }, 'Lab transcript'), capText);
  const readBtn = h('button', { class: 'btn btn--small btn--ghost tp-read', type: 'button', hidden: true, onclick: () => { readOnly = !readOnly; stop(); setMode(readOnly ? 'text' : 'audio'); persist(); } });
  const input = h('input', { class: 'tp-input', type: 'text', maxlength: '60', autocomplete: 'off', spellcheck: 'false', 'aria-label': params.ask || 'What does the voice say?' });
  input.value = ok && typeof sv.typed === 'string' ? sv.typed : '';
  input.addEventListener('input', () => persist());
  const checkBtn = h('button', { class: 'btn btn--primary tp-check', type: 'button', onclick: () => check() }, 'Check');
  const answerRow = h('div', { class: 'tp-answer' }, h('label', { class: 'tp-ask' }, params.ask || 'What does the voice say? Type the key words.', input), checkBtn);
  body.append(
    h('div', { class: 'tp-rev-controls' },
      h('div', { class: 'tp-knob-wrap' }, minus, h('div', { class: 'tp-knob-col' }, knobEl, knobVal), plus),
      h('div', { class: 'tp-rev-side' },
        h('div', { class: 'tp-segs tp-dir', role: 'group', 'aria-label': 'Direction' }, revBtn, fwdBtn),
        playBtn, readBtn)),
    waveBox, capBox);
  paper.append(answerRow);
  waveBox.hidden = true;
  capBox.hidden = true;

  // ---- loading the voice (started at the end of setup) ----
  const load = async () => {
    say('Threading the reel…');
    let got = null;
    if (snd.can()) got = await loadLineAudio(line, { signal: abort?.signal });
    if (api.isDestroyed()) return;
    if (got) {
      const d = got.buffer.getChannelData(0);
      const sr = got.buffer.sampleRate;
      const pad = Math.round(sr * 0.7);
      const buf = new Float32Array(d.length + pad);
      buf.set(d, 0);
      const rev = new Float32Array(d.length + pad);
      for (let i = 0; i < d.length; i++) rev[i] = d[d.length - 1 - i];
      audio = { buf, rev, sr, dur: buf.length / sr };
      audioReady = true;
    } else audioReady = false;
    setMode(audioReady && !readOnly ? 'audio' : 'text');
    say(mode === 'audio' ? 'Press Play, then flip the direction and turn the knob until it sounds like a person.' : 'Flip the direction and turn the knob until the transcript reads as words.');
  };

  const tapeDur = () => (audio ? audio.dur / M.speed : Math.max(3, caption.length * 0.07) / M.speed);
  function setMode(m) {
    mode = m;
    readBtn.hidden = !audioReady;
    readBtn.textContent = mode === 'audio' ? 'Can’t listen? Read the transcript' : 'Listen instead';
    capBox.hidden = mode !== 'text';
    waveBox.hidden = mode !== 'audio';
    api.showNote(mode === 'text' && !readOnly);
    if (mode === 'audio') requestAnimationFrame(drawTape);
    update();
  }
  function drawTape() {
    if (!audio || !wave.isConnected) return;
    // the tape as recorded: backwards if the mode reversed it
    drawWave(wave, M.reversed ? audio.rev : audio.buf, { color: '#e8a33d' });
  }

  // ---- state -> view ----
  function update() {
    const a = A(knob);
    pointer.setAttribute('transform', `rotate(${a.toFixed(1)} ${KC} ${KC})`);
    knobVal.textContent = `${knob % 1 === 0 ? knob.toFixed(0) : knob === 0.625 ? '0.625' : String(+knob.toFixed(2))}×`;
    knobEl.setAttribute('aria-valuenow', knob.toFixed(3));
    knobEl.setAttribute('aria-valuetext', `${knobVal.textContent} speed`);
    revBtn.setAttribute('aria-pressed', String(dir < 0));
    fwdBtn.setAttribute('aria-pressed', String(dir > 0));
    const e = L.effective(knob, dir, scr);
    const off = L.offness(knob, dir, scr);
    if (mode === 'text') {
      capText.textContent = L.scrambleCaption(caption, off, e.backwards, seed);
      const ls = e.rate < 1 ? Math.min(0.5, (1 / e.rate - 1) * 0.28) : -Math.min(0.06, (e.rate - 1) * 0.06);
      capText.style.letterSpacing = `${ls.toFixed(3)}em`;
      capBox.classList.toggle('is-clean', off < 0.1);
    }
    if (!near && L.isNatural(knob, dir, scr)) {
      near = true;
      say(mode === 'audio' ? 'There: a voice. Listen to what it says.' : 'There: the transcript reads clean.', 'good');
    }
    if (playing) applyRate();
    progress();
  }
  function progress() { if (!api.isSolved()) ctx.onProgress(near ? 0.5 : heard ? 0.1 : 0); }
  function persist() { ctx.onSave({ v: 1, variant: 'reverse', mode: scr, knob, dir, near, heard, read: readOnly, typed: input.value }); }
  function setKnob(v) {
    const k = L.snapKnob(v);
    if (k !== knob && L.DETENTS.includes(k)) sfx.key();
    knob = k;
    update();
    persist();
  }
  function setDir(d) {
    if (d === dir) return;
    dir = d;
    sfx.click();
    if (playing && playing.src) restart();
    update();
    persist();
  }

  // ---- knob dragging: turn by angle around the centre ----
  let turning = null;
  knobEl.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    knobEl.setPointerCapture?.(e.pointerId);
    turning = { id: e.pointerId };
    turnTo(e);
  });
  knobEl.addEventListener('pointermove', (e) => { if (turning && e.pointerId === turning.id) turnTo(e); });
  const endTurn = () => { if (turning) { turning = null; setKnob(knob); } };
  knobEl.addEventListener('pointerup', endTurn);
  knobEl.addEventListener('pointercancel', endTurn);
  function turnTo(e) {
    const r = knobSvg.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(x, y) < 6) return;
    let a = Math.atan2(x, -y) * 180 / Math.PI; // 0 = up, clockwise positive
    a = Math.max(-135, Math.min(135, a));
    const k = L.snapKnob(2 ** (a / 135));
    if (k !== knob) { if (L.DETENTS.includes(k)) sfx.key(); knob = k; update(); }
  }
  knobEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); setKnob(L.stepKnob(knob, 1)); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); setKnob(L.stepKnob(knob, -1)); }
    else if (e.key === 'Home') { e.preventDefault(); e.stopPropagation(); setKnob(0.5); }
    else if (e.key === 'End') { e.preventDefault(); e.stopPropagation(); setKnob(2); }
  });

  // ---- playing: the tape loops so you can turn the knob while it runs ----
  function start() {
    const ac = mode === 'audio' ? snd.ctx() : null;
    const p = { nodes: [], ac, perf: performance.now(), last: performance.now() };
    if (ac && audio) {
      const out = snd.out(ac);
      const an = ac.createAnalyser();
      an.fftSize = 1024;
      an.connect(out);
      p.an = an; p.tbuf = new Float32Array(an.fftSize);
      p.out = out;
      p.nodes.push(an, out);
      snd.duck(true);
    }
    playing = p;
    if (p.an) restart();
    heard = true;
    playBtn.textContent = '❚❚ Pause';
    deck.setSpeed(dir * knob);
    persist();
    progress();
    kick();
  }
  function bufOf(ac, which) {
    const key = `_${which}`;
    if (audio[key] && audio[key].ctx === ac) return audio[key].b;
    const b = ac.createBuffer(1, audio.buf.length, audio.sr);
    b.getChannelData(0).set(which === 'rev' ? audio.rev : audio.buf);
    audio[key] = { ctx: ac, b };
    return b;
  }
  function restart() {
    const p = playing;
    if (!p || !p.an) return;
    if (p.src) { try { p.src.stop(); } catch { /* done */ } try { p.src.disconnect(); } catch { /* gone */ } }
    const e = L.effective(knob, dir, scr);
    const T = tapeDur();
    // where in the original we are
    let orig = (tau / T) * audio.dur;
    if (M.reversed) orig = audio.dur - orig;
    const src = p.ac.createBufferSource();
    src.buffer = bufOf(p.ac, e.backwards ? 'rev' : 'fwd');
    src.loop = true;
    src.playbackRate.value = e.rate;
    src.connect(p.an);
    const off = e.backwards ? audio.dur - orig : orig;
    src.start(p.ac.currentTime + 0.02, Math.max(0, Math.min(audio.dur - 0.01, off)));
    p.src = src;
  }
  function applyRate() {
    const p = playing;
    deck.setSpeed(dir * knob);
    if (!p || !p.src) return;
    const e = L.effective(knob, dir, scr);
    p.src.playbackRate.setTargetAtTime(e.rate, p.ac.currentTime, 0.04);
  }
  function stop() {
    if (!playing) return;
    const p = playing;
    if (p.src) p.nodes.push(p.src);
    snd.kill(p.nodes);
    playing = null;
    deck.setSpeed(0);
    snd.duck(false);
    playBtn.textContent = '▶ Play';
    rhead.style.transform = `translateX(${(tau / tapeDur() * (wave.clientWidth || 0)).toFixed(1)}px)`;
  }
  function toggle() { if (mode === 'loading') return; if (playing) stop(); else start(); }
  function frame(dt) {
    if (!playing) return false;
    const T = tapeDur();
    tau = ((tau + dir * knob * dt) % T + T) % T;
    deck.setPos(tau / T);
    deck.setTime(tau);
    rhead.style.transform = `translateX(${(tau / T * (wave.clientWidth || 0)).toFixed(1)}px)`;
    if (playing.an) {
      playing.an.getFloatTimeDomainData(playing.tbuf);
      let s = 0;
      for (let i = 0; i < playing.tbuf.length; i += 2) s += playing.tbuf[i] * playing.tbuf[i];
      deck.setLevel(Math.sqrt(s / (playing.tbuf.length / 2)) * 4);
    } else {
      const u = tau / T;
      const bars = L.waveBars(caption, seed, 64);
      deck.setLevel(bars[Math.min(63, Math.floor(u * 64))] * 0.9);
      capBox.style.setProperty('--tp-sweep', `${(u * 100).toFixed(1)}%`);
    }
    return true;
  }

  // ---- answer ----
  function check() {
    if (api.isSolved() || mode === 'loading') return;
    const t = input.value.trim();
    if (!t) { say('Type what the voice says first.', 'bad'); input.focus(); return; }
    if (L.phraseMatches(t, answers)) {
      stop();
      knob = right.knob; dir = right.dir;
      if (mode === 'text') update();
      persist();
      capBox.hidden = false;
      capText.textContent = caption;
      capText.style.letterSpacing = '';
      capBox.classList.add('is-clean');
      win(`On the tape: "${answer}".`);
      return;
    }
    sfx.bad();
    shake(answerRow);
    say(near ? 'Not what the tape says. Play it again and listen closely.' : 'Not that. The tape still sounds wrong: fix the direction and speed first.', 'bad');
  }

  update();
  persist();
  load();
  return {
    frame, stop, toggle, check,
    resize: () => { if (mode === 'audio') drawTape(); },
    key(e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setKnob(L.stepKnob(knob, -1)); return true; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setKnob(L.stepKnob(knob, 1)); return true; }
      if (e.key === 'd' || e.key === 'D') { setDir(-dir); return true; }
      return false;
    },
    hint() {
      if (mode === 'loading') return null;
      if (!L.isNatural(knob, dir, scr)) {
        knob = right.knob; dir = right.dir;
        if (playing?.src) restart();
        update();
        persist();
        return `The lab found the setting: ${right.dir < 0 ? 'reverse' : 'forward'}, speed ${right.knob}×. Now listen.`;
      }
      const n = normalizedLetters(answer);
      return `The words you want start with "${answer.slice(0, Math.max(2, Math.ceil(n / 3)))}…" (${n} letters).`;
    },
    devSolve() { input.value = answer; knob = right.knob; dir = right.dir; near = true; if (mode === 'loading') { api.win(`On the tape: "${answer}".`); return; } check(); },
    destroy() { abort?.abort(); stop(); },
  };
}
const normalizedLetters = (s) => String(s).replace(/[^\p{L}\p{N}]/gu, '').length;
