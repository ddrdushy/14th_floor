// Pure logic for Shredded Note (no DOM, safe to import in node): text wrapping, the seeded
// shuffle, which strips fit, moves and the hint. Strips are numbered 0..n-1 left to right in the
// original document. `order[p]` is the strip at place p; `flips[s]` is 1 when strip s is upside down.
import { shuffle } from '../core/rng.js';

export const MIN_STRIPS = 5;
export const MAX_STRIPS = 14;

export const DEFAULT_TEXT = [
  'Daniel,',
  '',
  'If you are reading this, I could not wait for you at the jetty. They came to the shop at ten. Two men, one with a burnt hand.',
  '',
  'The ledger is not in the safe any more. I left it with the old man who sells kopi at Pasar Chow Kit. Ask for the blue tin.',
  '',
  'Burn this note after you read it. Trust no one on Floor 14.',
].join('\n');

export const clampStrips = (n) => {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.max(MIN_STRIPS, Math.min(MAX_STRIPS, v)) : 8;
};

/**
 * Greedy word wrap. measure(str) -> width. Keeps blank lines (paragraph breaks) and chops any word
 * that is wider than a whole line. Returns an array of lines.
 */
export function wrapLines(text, maxWidth, measure) {
  const out = [];
  const paras = String(text ?? '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
  for (const para of paras) {
    const words = para.split(/ +/).filter((w) => w.length);
    if (!words.length) { out.push(''); continue; }
    let line = '';
    for (let w of words) {
      // a word longer than a line: cut it into pieces that fit
      while (measure(w) > maxWidth && w.length > 1) {
        if (line) { out.push(line); line = ''; }
        let k = w.length - 1;
        while (k > 1 && measure(w.slice(0, k)) > maxWidth) k--;
        out.push(w.slice(0, k));
        w = w.slice(k);
      }
      const next = line ? `${line} ${w}` : w;
      if (measure(next) <= maxWidth || !line) line = next;
      else { out.push(line); line = w; }
    }
    if (line) out.push(line);
  }
  // no blank lines at the very start or end
  while (out.length && out[0] === '') out.shift();
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.length ? out : [''];
}

/** True when the strips at places p and p+1 are true neighbours, both the right way up. */
export function fitsAt(order, flips, p) {
  const a = order[p], b = order[p + 1];
  return b === a + 1 && !flips[a] && !flips[b];
}

export function fitCount(order, flips) {
  let k = 0;
  for (let p = 0; p < order.length - 1; p++) if (fitsAt(order, flips, p)) k++;
  return k;
}

export const isSolved = (order, flips) => order.every((s, p) => s === p && !flips[s]);

/** Progress 0..1 (never 1 unless solved): seams that fit count most, upright strips a little. */
export function progressOf(order, flips, flipsOn) {
  if (isSolved(order, flips)) return 1;
  const n = order.length;
  const f = fitCount(order, flips) / (n - 1);
  if (!flipsOn) return Math.min(0.95, 0.95 * f);
  const up = order.filter((s) => !flips[s]).length / n;
  return Math.min(0.95, 0.8 * f + 0.15 * up);
}

/**
 * The starting pile: a seeded shuffle where no two strips already fit and the note is not already
 * in order. With flipsOn, about half the strips start upside down (at least two).
 */
export function scramble(rng, n, flipsOn) {
  const ids = Array.from({ length: n }, (_, i) => i);
  let order = null;
  for (let tries = 0; tries < 400; tries++) {
    const o = shuffle(rng, ids);
    let bad = false;
    for (let p = 0; p < n - 1 && !bad; p++) if (o[p + 1] === o[p] + 1) bad = true;
    if (!bad) { order = o; break; }
  }
  if (!order) order = ids.slice().reverse(); // reversed never has a strip followed by its right neighbour
  const flips = Array(n).fill(0);
  if (flipsOn) {
    for (let s = 0; s < n; s++) flips[s] = rng() < 0.5 ? 1 : 0;
    const want = Math.max(2, Math.floor(n / 3));
    const up = shuffle(rng, ids.filter((s) => !flips[s]));
    while (flips.reduce((a, b) => a + b, 0) < want && up.length) flips[up.pop()] = 1;
    // keep at least two upright, so the seams can still teach the player
    const down = shuffle(rng, ids.filter((s) => flips[s]));
    while (n - flips.reduce((a, b) => a + b, 0) < 2 && down.length) flips[down.pop()] = 0;
  }
  return { order, flips };
}

/** Places that are free to move (not pinned by a hint). pinned: Set of strip ids (each sits at its own place). */
export const freePlaces = (n, pinned) => Array.from({ length: n }, (_, p) => p).filter((p) => !pinned.has(p));

/** Nearest free place to p (p itself if free). */
export function nearestFree(n, pinned, p) {
  const free = freePlaces(n, pinned);
  if (!free.length) return -1;
  return free.reduce((best, q) => (Math.abs(q - p) < Math.abs(best - p) ? q : best), free[0]);
}

/**
 * Lift the strip at place `from` and drop it at place `to`, sliding the others along. Pinned places
 * never change. Returns a new order.
 */
export function moveStrip(order, pinned, from, to) {
  const n = order.length;
  if (pinned.has(from)) return order.slice();
  const free = freePlaces(n, pinned);
  const t = pinned.has(to) ? nearestFree(n, pinned, to) : to;
  const fi = free.indexOf(from), ti = free.indexOf(t);
  if (fi < 0 || ti < 0 || fi === ti) return order.slice();
  const seq = free.map((p) => order[p]);
  const [s] = seq.splice(fi, 1);
  seq.splice(ti, 0, s);
  const out = order.slice();
  free.forEach((p, i) => { out[p] = seq[i]; });
  return out;
}

/** Swap the strips at places a and b (no-op when either is pinned). */
export function swapStrips(order, pinned, a, b) {
  const out = order.slice();
  if (a === b || pinned.has(a) || pinned.has(b)) return out;
  [out[a], out[b]] = [out[b], out[a]];
  return out;
}

/**
 * The hint: the leftmost strip that is not yet right goes to its own place, the right way up, and
 * is pinned there. Returns { order, flips, pinned, strip } or null when the note is already whole.
 */
export function hintStep(order, flips, pinned) {
  const n = order.length;
  const p = order.findIndex((s, q) => !(s === q && !flips[s]) && !pinned.has(q));
  if (p < 0) return null;
  const q = order.indexOf(p);
  const o = order.slice();
  [o[p], o[q]] = [o[q], o[p]];
  const f = flips.slice();
  f[p] = 0;
  const pin = new Set(pinned);
  pin.add(p);
  return { order: o, flips: f, pinned: pin, strip: p, n };
}

/** Is `saved` a usable state for n strips? Returns a clean copy or null. */
export function cleanSaved(saved, n, flipsOn, sig) {
  if (!saved || typeof saved !== 'object' || saved.v !== 1 || saved.sig !== sig) return null;
  const { order, flips, pinned } = saved;
  if (!Array.isArray(order) || order.length !== n) return null;
  const seen = new Set(order);
  if (seen.size !== n || !order.every((s) => Number.isInteger(s) && s >= 0 && s < n)) return null;
  const f = Array.isArray(flips) && flips.length === n ? flips.map((x) => (flipsOn && x ? 1 : 0)) : Array(n).fill(0);
  const pin = new Set((Array.isArray(pinned) ? pinned : []).filter((s) => Number.isInteger(s) && order[s] === s && !f[s]));
  return { order: order.slice(), flips: f, pinned: pin };
}

/** A short signature of the puzzle, so a save made for different text or strip count is ignored. */
export function puzzleSig(text, n, flipsOn) {
  let h = 2166136261;
  const s = `${n}|${flipsOn ? 1 : 0}|${text}`;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
