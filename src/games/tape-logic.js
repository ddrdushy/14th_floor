// Tape forensics logic (pure, no DOM, no Web Audio): node-testable.
//
//   spectro  a code drawn into a recording's spectrogram: glyph font, layout plan, additive synthesis,
//            a small FFT / STFT to read it back
//   splice   cut points at the quiet moments of a voice line, word-boundary text pieces, the shuffle
//   reverse  scramble modes, the speed knob and its detents, the scrambled caption, answer matching
import { mulberry32, randInt, shuffle } from '../core/rng.js';

export const VARIANTS = ['spectro', 'splice', 'reverse'];
export const variantOf = (v) => (VARIANTS.includes(v) ? v : 'spectro');

const num = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

// =============================================================================================
// spectro: the font
// 5 x 7 pixels, row 0 on top (the highest frequency). Zero is slashed so it never reads as O.
const G = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
  3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.',
  7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '-': '.....|.....|.....|#####|.....|.....|.....',
};
export const GLYPH_W = 5, GLYPH_H = 7;
export const CHARSET = Object.keys(G).join('');
/** A glyph as rows of booleans: glyph('A')[row][col]. */
export const glyph = (ch) => (G[ch] ? G[ch].split('|').map((r) => [...r].map((c) => c === '#')) : null);

/** Story answers: A-Z, 0-9 and '-', at most 10 characters. */
export const sanitizeCode = (s) => String(s ?? '').toUpperCase().replace(/[^A-Z0-9-]/g, '').replace(/^-+|-+$/g, '').slice(0, 10);

/** A random per-player code like "RT-482" (no O, I or Q, which a hurried eye can misread). */
export function makeCode(rng) {
  const L = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  const l = () => L[randInt(rng, 0, L.length - 1)];
  const d = () => String(randInt(rng, 0, 9));
  return `${l()}${l()}-${randInt(rng, 2, 9)}${d()}${d()}`;
}

export function spectroParams(params = {}) {
  const given = sanitizeCode(params.answer);
  return {
    answer: given.length >= 1 ? given : null,
    noise: num(params.noise, 0, 1, 0.6),
    decoys: Math.round(num(params.decoys, 0, 3, 2)),
  };
}

export const SPEC = {
  sampleRate: 22050,
  col: 0.1, // seconds per glyph column
  gap: 1.2, // blank columns between characters
  lead: 0.7, // seconds before the first glyph and after the last
  minDur: 4,
  fMin: 400, fMax: 7600, // where anything is drawn
  bandMin: 500, bandMax: 6000, // where the answer may sit
  view: 8000, // the display shows 0..view Hz
};

/**
 * Where everything goes. Cells are rectangles in time x frequency that sound: { t0, t1, f0, f1 }.
 * The answer's band is [band.lo, band.hi]; decoy bands and whines never come within one row of it.
 */
export function planSpectro(rng, P) {
  const answer = P.answer || makeCode(rng);
  const chars = [...answer];
  const step = GLYPH_W + SPEC.gap;
  const glyphSpan = (chars.length * step - SPEC.gap) * SPEC.col;
  const duration = Math.max(SPEC.minDur, glyphSpan + 2 * SPEC.lead);
  const t0 = (duration - glyphSpan) / 2;
  const height = 1500 + rng() * 900;
  const lo = SPEC.bandMin + rng() * (SPEC.bandMax - SPEC.bandMin - height);
  const band = { lo, hi: lo + height };
  const rowH = height / GLYPH_H;
  const cells = [];
  chars.forEach((ch, k) => {
    const g = glyph(ch);
    if (!g) return;
    for (let r = 0; r < GLYPH_H; r++) for (let c = 0; c < GLYPH_W; c++) {
      if (!g[r][c]) continue;
      const ta = t0 + (k * step + c) * SPEC.col;
      const fHi = band.hi - r * rowH;
      cells.push({ t0: ta, t1: ta + SPEC.col, f0: fHi - rowH, f1: fHi, row: r, ch: k });
    }
  });
  const span = { t0, t1: t0 + glyphSpan };

  // free frequency space for decoys and whines: below and above the answer, one row of margin
  const margin = rowH * 1.2;
  const gaps = [[SPEC.fMin, band.lo - margin], [band.hi + margin, SPEC.fMax]].filter(([a, b]) => b - a > 300);
  const decoys = [];
  const glyphKeys = CHARSET.replace('-', '');
  for (let d = 0; d < P.decoys && gaps.length; d++) {
    const [a, b] = gaps[d % gaps.length];
    const hgt = Math.min(b - a, height * (0.7 + rng() * 0.4));
    if (hgt < 350) continue;
    const dlo = a + rng() * (b - a - hgt);
    const dband = { lo: dlo, hi: dlo + hgt };
    const drh = hgt / GLYPH_H;
    const dcells = [];
    const frags = randInt(rng, 3, 5);
    for (let f = 0; f < frags; f++) {
      const g = glyph(glyphKeys[randInt(rng, 0, glyphKeys.length - 1)]);
      const c0 = randInt(rng, 0, 2), w = randInt(rng, 2, 3);
      const at = SPEC.lead * 0.4 + rng() * (duration - SPEC.lead * 0.8 - w * SPEC.col);
      for (let c = c0; c < Math.min(GLYPH_W, c0 + w); c++) for (let r = 0; r < GLYPH_H; r++) {
        if (!g[r][c]) continue;
        const ta = at + (c - c0) * SPEC.col;
        const fHi = dband.hi - r * drh;
        dcells.push({ t0: ta, t1: ta + SPEC.col, f0: fHi - drh, f1: fHi });
      }
    }
    decoys.push({ band: dband, cells: dcells });
  }

  // the whines: slow sweeps that live in the free space too
  const whines = [];
  const nw = gaps.length ? 2 + (rng() < 0.5 ? 1 : 0) : 0;
  for (let i = 0; i < nw; i++) {
    const [a, b] = gaps[randInt(rng, 0, gaps.length - 1)];
    const fa = a + rng() * (b - a), fb = a + rng() * (b - a);
    const ta = rng() * duration * 0.5, tb = ta + duration * (0.3 + rng() * 0.5);
    whines.push({ t0: ta, t1: Math.min(duration, tb), f0: fa, f1: fb, amp: 0.5 + rng() * 0.5, wobble: 2 + rng() * 5 });
  }
  return { answer, duration, band, rowH, cells, window: span, decoys, whines, seed: Math.floor(rng() * 2 ** 31) };
}

/**
 * The recording as samples: the glyph cells as bundles of sine partials (one every ~45 Hz across a
 * cell, with soft edges in time so a cell reads as a solid block), decoys, whines, mains hum and hiss.
 * Peak-normalised to 0.85.
 */
export function synthSpectro(plan, { sampleRate = SPEC.sampleRate, noise = 0.5 } = {}) {
  const sr = sampleRate;
  const n = Math.ceil(plan.duration * sr);
  const out = new Float32Array(n);
  const rr = mulberry32(plan.seed ^ 0x51ed);
  const ramp = Math.round(0.012 * sr);
  const amp = 0.02;
  const TAU = Math.PI * 2;

  // group cells per row so neighbouring "on" columns of a row join without a click
  function drawCells(cells, level) {
    const rows = new Map();
    for (const c of cells) {
      const k = `${c.f0.toFixed(1)}`;
      if (!rows.has(k)) rows.set(k, { f0: c.f0, f1: c.f1, spans: [] });
      rows.get(k).spans.push([c.t0, c.t1]);
    }
    for (const row of rows.values()) {
      row.spans.sort((a, b) => a[0] - b[0]);
      const merged = [];
      for (const s of row.spans) {
        const last = merged[merged.length - 1];
        if (last && s[0] <= last[1] + 1e-6) last[1] = Math.max(last[1], s[1]); else merged.push([...s]);
      }
      const span = row.f1 - row.f0;
      const k = Math.max(3, Math.round(span / 45));
      const parts = Array.from({ length: k }, (_, i) => ({ f: row.f0 + span * (0.08 + 0.84 * (i + 0.5) / k) + (rr() - 0.5) * 8, ph: rr() * TAU }));
      for (const [ta, tb] of merged) {
        const a = Math.max(0, Math.floor(ta * sr)), b = Math.min(n, Math.ceil(tb * sr));
        for (const p of parts) {
          const w = TAU * p.f / sr;
          // sine by rotation: cheap and exact enough for a few seconds
          let s = Math.sin(p.ph + w * a), c = Math.cos(p.ph + w * a);
          const cw = Math.cos(w), sw = Math.sin(w);
          for (let i = a; i < b; i++) {
            const e = Math.min(1, (i - a) / ramp, (b - i) / ramp);
            out[i] += level * amp * e * s;
            const s2 = s * cw + c * sw; c = c * cw - s * sw; s = s2;
          }
        }
      }
    }
  }
  drawCells(plan.cells, 1);
  for (const d of plan.decoys) drawCells(d.cells, 0.9);

  // whines: a slightly wobbling sweep
  for (const wh of plan.whines) {
    const a = Math.floor(wh.t0 * sr), b = Math.min(n, Math.floor(wh.t1 * sr));
    let ph = rr() * TAU;
    for (let i = a; i < b; i++) {
      const u = (i - a) / Math.max(1, b - a);
      const f = wh.f0 + (wh.f1 - wh.f0) * u + 25 * Math.sin(TAU * wh.wobble * (i / sr));
      ph += TAU * f / sr;
      const e = Math.min(1, u * 8, (1 - u) * 8);
      out[i] += amp * 3.2 * wh.amp * e * Math.sin(ph);
    }
  }

  // mains hum (50 Hz and its harmonics) and tape hiss with a slow flutter
  const z = Math.max(0, Math.min(1, noise));
  const hiss = amp * (1.2 + 8.5 * z);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const g = (rr() + rr() + rr() - 1.5) * 1.15; // roughly gaussian
    lp = lp * 0.97 + g * 0.03;
    const flutter = 1 + 0.25 * Math.sin(TAU * 0.7 * t) * Math.sin(TAU * 0.13 * t + 1);
    out[i] += hiss * flutter * g + 6 * hiss * lp
      + amp * 2.2 * (Math.sin(TAU * 50 * t) + 0.6 * Math.sin(TAU * 100 * t + 0.4) + 0.3 * Math.sin(TAU * 150 * t + 1.1));
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
  const k = peak > 0 ? 0.85 / peak : 1;
  for (let i = 0; i < n; i++) out[i] *= k;
  return out;
}

// ---- FFT / STFT ----
/** In-place radix-2 FFT of (re, im); length must be a power of two. */
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi;
        re[a] += xr; im[a] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}

/**
 * Short-time spectrum in dB: { frames: Float32Array[] (bins up to maxFreq), binHz, hop (s), sampleRate }.
 * Hann window.
 */
export function stft(samples, sampleRate, { size = 1024, hop = 256, maxFreq = SPEC.view } = {}) {
  const win = new Float32Array(size);
  for (let i = 0; i < size; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (size - 1));
  const binHz = sampleRate / size;
  const bins = Math.min(size / 2, Math.ceil(maxFreq / binHz) + 1);
  const frames = [];
  const re = new Float64Array(size), im = new Float64Array(size);
  const norm = 2 / (size * 0.5);
  for (let s = -size / 2; s + size / 2 < samples.length; s += hop) {
    for (let i = 0; i < size; i++) { const j = s + i; re[i] = (j >= 0 && j < samples.length ? samples[j] : 0) * win[i]; im[i] = 0; }
    fft(re, im);
    const f = new Float32Array(bins);
    for (let b = 0; b < bins; b++) f[b] = 20 * Math.log10(Math.hypot(re[b], im[b]) * norm + 1e-9);
    frames.push(f);
  }
  return { frames, binHz, hop: hop / sampleRate, sampleRate, size };
}

/** Mean dB of the spectrogram inside a time x frequency rectangle. */
export function meanDb(spec, t0, t1, f0, f1) {
  let s = 0, n = 0;
  const a = Math.max(0, Math.floor(t0 / spec.hop)), b = Math.min(spec.frames.length - 1, Math.ceil(t1 / spec.hop));
  const ba = Math.max(0, Math.floor(f0 / spec.binHz)), bb = Math.min(spec.frames[0].length - 1, Math.ceil(f1 / spec.binHz));
  for (let i = a; i <= b; i++) for (let k = ba; k <= bb; k++) { s += spec.frames[i][k]; n++; }
  return n ? s / n : -200;
}

/**
 * Read the answer back from a spectrogram, the way a player would with the band known: for every
 * glyph cell, is it louder than the quiet cells around it? Returns the best-matching character per
 * position. Used by the tests to prove the drawing is readable.
 */
export function readSpectro(spec, plan) {
  const step = GLYPH_W + SPEC.gap;
  const rowH = plan.rowH;
  const out = [];
  const n = [...plan.answer].length;
  for (let k = 0; k < n; k++) {
    const grid = [];
    for (let r = 0; r < GLYPH_H; r++) {
      const row = [];
      for (let c = 0; c < GLYPH_W; c++) {
        const ta = plan.window.t0 + (k * step + c) * SPEC.col;
        const fHi = plan.band.hi - r * rowH;
        row.push(meanDb(spec, ta + 0.02, ta + SPEC.col - 0.02, fHi - rowH * 0.8, fHi - rowH * 0.2));
      }
      grid.push(row);
    }
    const flat = grid.flat().sort((a, b) => a - b);
    const thr = (flat[0] + flat[flat.length - 1]) / 2;
    let best = '?', bestScore = -1;
    for (const ch of CHARSET) {
      const g = glyph(ch);
      let score = 0;
      for (let r = 0; r < GLYPH_H; r++) for (let c = 0; c < GLYPH_W; c++) if ((grid[r][c] > thr) === g[r][c]) score++;
      if (score > bestScore) { bestScore = score; best = ch; }
    }
    out.push(best);
  }
  return out.join('');
}

/** Does the view [lo, hi] show the answer's band well enough to read it? */
export function bandFound(view, band) {
  const over = Math.max(0, Math.min(view.hi, band.hi) - Math.max(view.lo, band.lo));
  const bh = band.hi - band.lo;
  return over >= 0.8 * bh && (view.hi - view.lo) <= 2.6 * bh;
}

/** Normalised compare for codes: case and spaces never matter; a hyphen is optional. */
export function codeMatches(typed, answer) {
  const a = sanitizeCode(answer).replace(/-/g, '');
  const t = String(typed ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return a.length > 0 && t === a;
}
/** How many characters are right, position by position (hyphens ignored). */
export function codeRightCount(typed, answer) {
  const a = sanitizeCode(answer).replace(/-/g, '');
  const t = String(typed ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  let n = 0;
  for (let i = 0; i < Math.min(a.length, t.length); i++) if (a[i] === t[i]) n++;
  return n;
}

// =============================================================================================
// splice

export function spliceParams(params = {}) {
  return { pieces: Math.round(num(params.pieces, 3, 8, 5)) };
}

/** RMS envelope in frames of `frameSec`. */
export function envelope(samples, sampleRate, frameSec = 0.01) {
  const fl = Math.max(1, Math.round(frameSec * sampleRate));
  const n = Math.ceil(samples.length / fl);
  const env = new Float32Array(n);
  for (let f = 0; f < n; f++) {
    let s = 0;
    const a = f * fl, b = Math.min(samples.length, a + fl);
    for (let i = a; i < b; i++) s += samples[i] * samples[i];
    env[f] = Math.sqrt(s / Math.max(1, b - a));
  }
  return { env, frame: fl };
}

/**
 * Cut a voice line into `pieces` segments at quiet moments (the silences between words).
 * Returns [{ start, end }] in samples, in order, covering the trimmed line end to end.
 * Leading and trailing silence is trimmed; every piece is at least minSec long when that is possible.
 */
export function cutPoints(samples, sampleRate, pieces = 5, { minSec = 0.28 } = {}) {
  const { env, frame } = envelope(samples, sampleRate, 0.01);
  const n = env.length;
  let peak = 0;
  for (const v of env) peak = Math.max(peak, v);
  if (!n || peak <= 0) return null;
  const sorted = Array.from(env).sort((a, b) => a - b);
  const floor = sorted[Math.floor(n * 0.1)];
  const thr = Math.max(peak * 0.08, floor * 2.2, 1e-4);
  // trim
  let a = 0, b = n - 1;
  while (a < n && env[a] < thr) a++;
  while (b > a && env[b] < thr) b--;
  a = Math.max(0, a - 4); b = Math.min(n - 1, b + 6);
  const span = b - a;
  const minF = Math.round(minSec / 0.01);
  if (span < pieces * minF * 0.6) return null;

  // candidates: the middle of every quiet run, scored by its length and how quiet it is
  const cands = [];
  for (let i = a + 1; i < b;) {
    if (env[i] < thr) {
      let j = i;
      while (j < b && env[j] < thr) j++;
      const len = j - i;
      if (len >= 2) {
        let m = i, mv = Infinity;
        for (let k = i; k < j; k++) if (env[k] < mv) { mv = env[k]; m = k; }
        cands.push({ at: Math.round((i + j) / 2), len, quiet: 1 - mv / thr });
      }
      i = j;
    } else i++;
  }
  // too few pauses: add the quietest frame near each even split as a soft candidate
  const smooth = (k) => { let s = 0, c = 0; for (let d = -3; d <= 3; d++) { const x = k + d; if (x >= a && x <= b) { s += env[x]; c++; } } return s / c; };
  for (let p = 1; p < pieces; p++) {
    const target = a + Math.round(span * p / pieces);
    const w = Math.round(span / pieces / 2.5);
    let m = target, mv = Infinity;
    for (let k = Math.max(a + minF, target - w); k <= Math.min(b - minF, target + w); k++) { const v = smooth(k); if (v < mv) { mv = v; m = k; } }
    if (!cands.some((c) => Math.abs(c.at - m) < minF / 2)) cands.push({ at: m, len: 0, quiet: 0, soft: true });
  }
  cands.sort((x, y) => x.at - y.at);

  // choose pieces-1 cuts: close to an even split, preferring long real pauses (DP over candidates)
  const K = pieces - 1, M = cands.length;
  if (M < K) return null;
  const ideal = span / pieces;
  const cost = (c, k) => {
    const dev = (c.at - (a + ideal * (k + 1))) / ideal;
    return dev * dev * 1.4 - (c.soft ? -1.2 : Math.min(1, c.len / 12) * 0.9 + c.quiet * 0.3);
  };
  const INF = 1e18;
  const dp = Array.from({ length: K }, () => new Float64Array(M).fill(INF));
  const from = Array.from({ length: K }, () => new Int32Array(M).fill(-1));
  for (let j = 0; j < M; j++) if (cands[j].at - a >= minF) dp[0][j] = cost(cands[j], 0);
  for (let k = 1; k < K; k++) for (let j = 0; j < M; j++) {
    const c = cands[j];
    for (let i = 0; i < j; i++) {
      if (dp[k - 1][i] >= INF || c.at - cands[i].at < minF) continue;
      const v = dp[k - 1][i] + cost(c, k);
      if (v < dp[k][j]) { dp[k][j] = v; from[k][j] = i; }
    }
  }
  let best = -1, bv = INF;
  for (let j = 0; j < M; j++) if (dp[K - 1][j] < bv && b - cands[j].at >= minF) { bv = dp[K - 1][j]; best = j; }
  if (best < 0) return null;
  const cuts = [];
  for (let k = K - 1, j = best; k >= 0; k--) { cuts.unshift(cands[j].at); j = from[k][j]; }
  const edges = [a, ...cuts, b + 1].map((f) => Math.min(samples.length, f * frame));
  return edges.slice(0, -1).map((s, i) => ({ start: s, end: edges[i + 1] }));
}

/** Split a sentence into n pieces at word boundaries, as even in length as possible. */
export function textPieces(text, n) {
  const words = String(text ?? '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const k = Math.max(1, Math.min(n, words.length));
  const len = (i, j) => words.slice(i, j).join(' ').length;
  const total = len(0, words.length);
  const ideal = total / k;
  // dp[p][j]: best cost putting the first j words in p pieces
  const INF = 1e18;
  const dp = Array.from({ length: k + 1 }, () => new Float64Array(words.length + 1).fill(INF));
  const from = Array.from({ length: k + 1 }, () => new Int32Array(words.length + 1).fill(-1));
  dp[0][0] = 0;
  for (let p = 1; p <= k; p++) for (let j = p; j <= words.length; j++) for (let i = p - 1; i < j; i++) {
    if (dp[p - 1][i] >= INF) continue;
    const d = len(i, j) - ideal;
    const v = dp[p - 1][i] + d * d;
    if (v < dp[p][j]) { dp[p][j] = v; from[p][j] = i; }
  }
  const cuts = [];
  for (let p = k, j = words.length; p > 0; p--) { const i = from[p][j]; cuts.unshift([i, j]); j = i; }
  return cuts.map(([i, j]) => words.slice(i, j).join(' '));
}

/** Fake waveform bars for a text piece: one bump per syllable-ish vowel group, a dip at each space. */
export function waveBars(text, seed, count = 40) {
  const rr = mulberry32(seed >>> 0);
  const s = String(text ?? '');
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const ch = s[Math.min(s.length - 1, Math.floor(i / count * s.length))] || ' ';
    const base = ch === ' ' ? 0.06 : /[aeiou]/i.test(ch) ? 0.75 : /[.,!?;:]/.test(ch) ? 0.04 : 0.4;
    out[i] = Math.max(0.03, Math.min(1, base * (0.65 + rr() * 0.55)));
  }
  return out;
}

/** Pairs (order[i], order[i+1]) that follow on correctly. */
export const rightJoins = (order) => order.reduce((n, x, i) => n + (i > 0 && order[i - 1] + 1 === x ? 1 : 0), 0);
export const isInOrder = (order) => order.every((x, i) => x === i);
/** Minimum number of swaps from order to the identity (n minus the number of cycles). */
export function swapDistance(order) {
  const seen = new Array(order.length).fill(false);
  let cycles = 0;
  for (let i = 0; i < order.length; i++) {
    if (seen[i]) continue;
    cycles++;
    for (let j = i; !seen[j]; j = order[j]) seen[j] = true;
  }
  return order.length - cycles;
}

/**
 * The shuffled reel: never already in order, never a single swap away when there are 5 or more
 * pieces, and at most one join already right (none for 4 or fewer pieces).
 */
export function shuffleOrder(rng, n) {
  const ids = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return ids;
  const ok = (o) => !isInOrder(o) && (n < 5 || swapDistance(o) >= 2) && rightJoins(o) <= (n >= 5 ? 1 : 0)
    && (n < 3 || swapDistance(o) >= 1);
  for (let tries = 0; tries < 400; tries++) {
    const o = shuffle(rng, ids);
    if (ok(o)) return o;
  }
  // fallback that always satisfies the rules: evens descending, then odds descending
  const o = [...ids.filter((x) => x % 2 === 0).reverse(), ...ids.filter((x) => x % 2 === 1).reverse()];
  return ok(o) ? o : ids.slice().reverse();
}

// =============================================================================================
// reverse

export const REV_MODES = {
  rev: { reversed: true, speed: 1, label: 'played backwards' },
  slow: { reversed: false, speed: 0.6, label: 'slowed down' },
  fast: { reversed: false, speed: 1.6, label: 'sped up' },
  revslow: { reversed: true, speed: 0.6, label: 'backwards and slowed down' },
};
/** Knob stops: geometric steps between 0.5x and 2x. 1.6 undoes 0.6 (0.96), 0.625 undoes 1.6. */
export const DETENTS = [0.5, 0.625, 0.8, 1, 1.25, 1.6, 2];
export const KNOB_MIN = 0.5, KNOB_MAX = 2;

export function reverseParams(params = {}) {
  const mode = REV_MODES[params.mode] ? params.mode : null;
  return { mode };
}
export const pickMode = (rng, forced) => (REV_MODES[forced] ? forced : ['rev', 'slow', 'fast', 'revslow'][randInt(rng, 0, 3)]);

/** Clamp the knob and snap it onto a detent when it is close (within ~5%). */
export function snapKnob(v) {
  const k = Math.max(KNOB_MIN, Math.min(KNOB_MAX, Number(v) || 1));
  for (const d of DETENTS) if (Math.abs(Math.log2(k / d)) < 0.07) return d;
  return k;
}
export function stepKnob(v, dir) {
  const k = snapKnob(v);
  if (dir > 0) return DETENTS.find((d) => d > k + 1e-6) ?? KNOB_MAX;
  return [...DETENTS].reverse().find((d) => d < k - 1e-6) ?? KNOB_MIN;
}

/**
 * What the player hears for a knob setting: rate (1 = natural), and whether the speech runs
 * backwards. dir: 1 forward, -1 reversed playback.
 */
export function effective(knob, dir, mode) {
  const m = REV_MODES[mode] || REV_MODES.rev;
  return { rate: knob * m.speed, backwards: (dir < 0) !== m.reversed };
}
/** How far from natural speech: 0 when right. Wrong direction counts heavily. */
export function offness(knob, dir, mode) {
  const e = effective(knob, dir, mode);
  return Math.abs(Math.log2(e.rate)) + (e.backwards ? 0.6 : 0);
}
export const isNatural = (knob, dir, mode) => offness(knob, dir, mode) < 0.1;
/** The knob and direction that undo a mode. */
export function rightSetting(mode) {
  const m = REV_MODES[mode] || REV_MODES.rev;
  const want = 1 / m.speed;
  const knob = DETENTS.reduce((best, d) => (Math.abs(Math.log2(d / want)) < Math.abs(Math.log2(best / want)) ? d : best), 1);
  return { knob, dir: m.reversed ? -1 : 1 };
}

const SMEAR = 'abcdefghijklmnopqrstuvwxyz';
/**
 * The caption as it reads at a setting: reversed when the speech runs backwards, and letters smeared
 * the further the speed is off. Spaces and punctuation stay put, so it still looks like a sentence.
 * Stable for a given (seed, offness bucket) so it does not flicker while the knob turns.
 */
export function scrambleCaption(text, off, backwards, seed = 1) {
  const s = String(text ?? '');
  const chars = backwards ? [...s].reverse() : [...s];
  const bucket = Math.round(off * 20);
  const rr = mulberry32((seed ^ Math.imul(bucket + 1, 0x9e3779b1)) >>> 0);
  const th = mulberry32(seed >>> 0);
  return chars.map((ch) => {
    const t = 0.04 + th() * 0.5; // each letter's own tolerance
    const x = rr();
    if (!/[A-Za-z0-9]/.test(ch) || off < t) return ch;
    const r = SMEAR[Math.floor(x * SMEAR.length)];
    return ch === ch.toUpperCase() && /[A-Z]/.test(ch) ? r.toUpperCase() : /[0-9]/.test(ch) ? String(Math.floor(x * 10)) : r;
  }).join('');
}

// ---- answers ----
const STOP = new Set(['the', 'a', 'an', 'at', 'in', 'on', 'to', 'by', 'of']);
/** Lowercase, no accents or punctuation, single spaces, leading little words dropped. */
export function normPhrase(s) {
  const w = String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  while (w.length > 1 && STOP.has(w[0])) w.shift();
  return w.join(' ');
}
export function levenshtein(a, b) {
  a = String(a); b = String(b);
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
/** Exact after normalising; one typo allowed when the answer has 6 or more letters. */
export function phraseMatches(typed, answers) {
  const t = normPhrase(typed);
  if (!t) return false;
  for (const ans of [].concat(answers || [])) {
    const a = normPhrase(ans);
    if (!a) continue;
    if (t === a) return true;
    const ta = t.replace(/ /g, ''), aa = a.replace(/ /g, '');
    if (ta === aa) return true;
    if (aa.length >= 6 && levenshtein(ta, aa) <= 1) return true;
  }
  return false;
}
/** A default key phrase when a level gives none: the longest word of the line. */
export function defaultPhrase(text) {
  const words = String(text ?? '').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').split(/\s+/).filter(Boolean);
  return words.reduce((best, w) => (w.length > best.length ? w : best), '');
}
