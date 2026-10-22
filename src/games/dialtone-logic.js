// Dial tones logic (pure, no DOM): DTMF keys, the dialled number, and the fuzzy spectrum of each tone.
import { mulberry32, randInt } from '../core/rng.js';

export const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
export const LOW = [697, 770, 852, 941]; // row group
export const HIGH = [1209, 1336, 1477]; // column group
export const LETTERS = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ', 0: '+' };

/** [row, column] of a key on the 3 x 4 keypad. */
export function keyRC(k) {
  const i = KEYS.indexOf(String(k));
  return i < 0 ? null : [Math.floor(i / 3), i % 3];
}
export const freqs = (k) => { const rc = keyRC(k); return rc ? [LOW[rc[0]], HIGH[rc[1]]] : null; };
export const keyAt = (row, col) => KEYS[row * 3 + col];

export function clampParams(params = {}) {
  const num = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  const digits = Math.round(num(params.digits, 4, 11, 7));
  const noise = num(params.noise, 0, 1, 0.15);
  const given = typeof params.number === 'string' || typeof params.number === 'number'
    ? [...String(params.number)].filter((ch) => KEYS.includes(ch)).slice(0, 16).join('') : '';
  return { digits: given.length >= 1 ? given.length : digits, noise, number: given || null };
}

/**
 * The dialled number. A story number wins; otherwise random digits that look like a phone number:
 * long ones start like a Malaysian mobile (01x), short ones never start with 0 or 1, and no digit
 * runs three times in a row (keeps it fair to count tones by ear).
 */
export function makeNumber(rng, { digits = 7, number = null } = {}) {
  if (number) return number;
  const out = [];
  if (digits >= 10) out.push('0', '1', '2346789'[randInt(rng, 0, 6)]);
  while (out.length < digits) {
    let d = String(randInt(rng, 0, 9));
    if (out.length === 0 && (d === '0' || d === '1')) d = String(randInt(rng, 2, 9));
    const n = out.length;
    if (n >= 2 && out[n - 1] === d && out[n - 2] === d) continue;
    out.push(d);
  }
  return out.join('');
}

/**
 * The bar heights (0..1) the line analyser shows for one recorded tone. The two real bars stand
 * tallest in their group; with more noise the other bars rise too (ghosts), the near ones most.
 * Ghosts top out at 0.68 while real bars never drop under 0.8, so a careful look always reads it.
 */
export function spectrum(seed, key, noise = 0) {
  const rr = mulberry32(seed);
  const [row, col] = keyRC(key);
  const z = Math.max(0, Math.min(1, noise));
  const group = (count, on) => Array.from({ length: count }, (_, i) => {
    if (i === on) return 1 - rr() * (0.06 + 0.12 * z);
    const near = Math.abs(i - on) === 1;
    const top = near ? 0.1 + 0.55 * z : 0.07 + 0.33 * z;
    return 0.03 + rr() * top;
  });
  return { low: group(4, row), high: group(3, col) };
}

/** A clean spectrum: what a key pressed on the reference keypad shows. */
export function cleanSpectrum(key) {
  const [row, col] = keyRC(key);
  return { low: [0, 1, 2, 3].map((i) => (i === row ? 1 : 0.04)), high: [0, 1, 2].map((i) => (i === col ? 1 : 0.04)) };
}

/** Read a spectrum back to a key (tallest bar in each group). */
export function readSpectrum(s) {
  const arg = (a) => a.indexOf(Math.max(...a));
  return keyAt(arg(s.low), arg(s.high));
}

/** Seeds for every tone's spectrum, from one rng draw. */
export const toneSeed = (base, i) => (base + Math.imul(i + 1, 2654435761)) >>> 0;

export const TIMING = { normal: { on: 0.18, gap: 0.12 }, slow: { on: 0.42, gap: 0.36 } };

/** Start times of each tone in seconds (after a short lead-in), and the total length. */
export function timeline(count, slow = false, lead = 0.35) {
  const { on, gap } = slow ? TIMING.slow : TIMING.normal;
  const tones = Array.from({ length: count }, (_, i) => ({ t: lead + i * (on + gap), d: on }));
  return { tones, total: lead + count * (on + gap) + 0.25 };
}
