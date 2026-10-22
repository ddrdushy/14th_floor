// Fuse box logic (pure, no DOM): Lights Out over GF(2).
// A board is an array of 0/1 (1 = breaker ON), row by row. Pressing a breaker toggles the cells in
// its mask. The minimum-press solution comes from Gaussian elimination plus a search of the null space
// (at most 2^8 combinations for the sizes allowed here).
import { mulberry32, shuffle } from '../core/rng.js';

export const PATTERNS = ['plus', 'x', 'row'];

export function clampParams(params = {}) {
  const num = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  const size = num(params.size, 3, 6, 4);
  const pattern = PATTERNS.includes(params.pattern) ? params.pattern : 'plus';
  const presses = num(params.presses, 3, 12, 5);
  return { size, pattern, presses };
}

/** Cell indices a press at i toggles. */
export function maskOf(n, pattern, i) {
  const r = Math.floor(i / n), c = i % n;
  const out = new Set();
  const add = (rr, cc) => { if (rr >= 0 && rr < n && cc >= 0 && cc < n) out.add(rr * n + cc); };
  add(r, c);
  if (pattern === 'plus') { add(r - 1, c); add(r + 1, c); add(r, c - 1); add(r, c + 1); }
  else if (pattern === 'x') { add(r - 1, c - 1); add(r - 1, c + 1); add(r + 1, c - 1); add(r + 1, c + 1); }
  else if (pattern === 'row') { for (let k = 0; k < n; k++) { add(r, k); add(k, c); } }
  return [...out].sort((a, b) => a - b);
}

export function press(board, n, pattern, i) {
  const b = board.slice();
  for (const j of maskOf(n, pattern, i)) b[j] ^= 1;
  return b;
}

export const isSolved = (board) => board.every((v) => v === 1);

const bit = (i) => 1n << BigInt(i);
const popcount = (v) => { let c = 0; while (v) { v &= v - 1n; c++; } return c; };

const cache = new Map();
/** Row-reduced system for (n, pattern): pivot rows that turn a target into a particular solution, and a null-space basis. */
function system(n, pattern) {
  const key = `${n}|${pattern}`;
  if (cache.has(key)) return cache.get(key);
  const N = n * n;
  // augmented rows: equation for cell j: sum over presses i that touch j. Track combination of original rows in `comb`.
  const rows = [];
  for (let j = 0; j < N; j++) {
    let coef = 0n;
    for (let i = 0; i < N; i++) if (maskOf(n, pattern, i).includes(j)) coef |= bit(i);
    rows.push({ coef, comb: bit(j) });
  }
  const pivCol = [];
  let rank = 0;
  for (let col = 0; col < N; col++) {
    let p = -1;
    for (let k = rank; k < N; k++) if (rows[k].coef & bit(col)) { p = k; break; }
    if (p < 0) continue;
    [rows[rank], rows[p]] = [rows[p], rows[rank]];
    for (let k = 0; k < N; k++) {
      if (k !== rank && (rows[k].coef & bit(col))) { rows[k].coef ^= rows[rank].coef; rows[k].comb ^= rows[rank].comb; }
    }
    pivCol[rank] = col;
    rank++;
  }
  const pivotSet = new Set(pivCol);
  const free = [];
  for (let col = 0; col < N; col++) if (!pivotSet.has(col)) free.push(col);
  // null-space basis: one vector per free column
  const basis = free.map((f) => {
    let v = bit(f);
    for (let r = 0; r < rank; r++) if (rows[r].coef & bit(f)) v |= bit(pivCol[r]);
    return v;
  });
  const sys = { N, rows, rank, pivCol, basis };
  cache.set(key, sys);
  return sys;
}

/** Minimum set of presses (cell indices) that turns `board` all ON, or null if impossible. */
export function solve(board, n, pattern) {
  const { N, rows, rank, pivCol, basis } = system(n, pattern);
  let target = 0n; // cells that must toggle
  for (let j = 0; j < N; j++) if (!board[j]) target |= bit(j);
  // each reduced row r says: sum of coef bits = parity of target over comb
  let x = 0n;
  for (let r = 0; r < N; r++) {
    const parity = popcount(rows[r].comb & target) & 1;
    if (r >= rank) { if (parity) return null; continue; }
    if (parity) x |= bit(pivCol[r]);
  }
  // search the null space (Gray code) for the lightest solution
  let best = x, bestW = popcount(x), cur = x;
  const k = basis.length;
  for (let g = 1; g < (1 << k); g++) {
    const flip = 31 - Math.clz32(g & -g);
    cur ^= basis[flip];
    const w = popcount(cur);
    if (w < bestW) { best = cur; bestW = w; }
  }
  const out = [];
  for (let i = 0; i < N; i++) if (best & bit(i)) out.push(i);
  return out;
}

/**
 * A scrambled board: random distinct presses applied to the all-ON board. Retries until the minimum
 * solution needs exactly `presses` flips (or as close as the size allows), so `presses` really is par.
 */
export function generate(rng, params = {}) {
  const { size: n, pattern, presses } = clampParams(params);
  const N = n * n;
  const want = Math.min(presses, N);
  const seed = Math.floor(rng() * 1e9);
  let best = null;
  for (let attempt = 0; attempt < 80; attempt++) {
    const rr = mulberry32(seed + attempt * 101);
    const cells = shuffle(rr, Array.from({ length: N }, (_, i) => i)).slice(0, want);
    let board = Array(N).fill(1);
    for (const i of cells) board = press(board, n, pattern, i);
    if (isSolved(board)) continue;
    const sol = solve(board, n, pattern);
    if (!sol) continue;
    // never start with a whole row already lit: every floor begins dark or flickering
    const litRows = Array.from({ length: n }, (_, r) => board.slice(r * n, r * n + n).every(Boolean)).filter(Boolean).length;
    const score = Math.abs(sol.length - want) * 10 + litRows;
    if (!best || score < best.score) best = { score, start: board, par: sol.length };
    if (score === 0) break;
  }
  return { n, pattern, start: best.start, par: best.par };
}

/** Rows (top first) that are fully ON. */
export const litRows = (board, n) => Array.from({ length: n }, (_, r) => board.slice(r * n, r * n + n).every(Boolean));
