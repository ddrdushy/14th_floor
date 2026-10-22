// Pure logic for Cooked Books (no DOM, safe to import in node): the seeded ledger, the altered
// figures, money formatting and a solver that proves the altered figures can be pinned down from
// the printed totals alone.
//
// The rule the player is told: K figures were changed after the totals were printed, and no two of
// them share a row or a column. Then any explanation with K changed figures must put exactly one in
// each row and each column that does not add up, and the amount each row is off by must equal the
// amount its partner column is off by. The generator only accepts ledgers where exactly one such
// pairing exists (all K amounts are different), so the answer is always unique.
import { randInt, shuffle } from '../core/rng.js';

export const MAGNITUDES = {
  // amounts are lo..hi times step; a change is dlo..dhi times step
  hundreds: { lo: 21, hi: 199, step: 5, dlo: 2, dhi: 36 }, // 105..995, changed by 10..180
  thousands: { lo: 120, hi: 4800, step: 10, dlo: 6, dhi: 640 }, // 1,200..48,000, changed by 60..6,400
  lakhs: { lo: 240, hi: 9800, step: 500, dlo: 4, dhi: 700 }, // 120,000..4,900,000, changed by 2,000..350,000
};

export const DEFAULT_ROWS = [
  'Murni Holdings', 'Tasek Jaya Trading', 'Golden Lotus Imports', 'Bukit Indah Ventures',
  'Pantai Mutiara Sdn Bhd', 'Kenanga Capital', 'Lim & Sons Logistics',
];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const clampInt = (v, lo, hi, d) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d;
};

/** Params with defaults and clamps applied. */
export function settings(params = {}) {
  const R = clampInt(params.rows ?? 4, 3, 7, 4);
  const Cn = clampInt(params.cols ?? 4, 3, 6, 4);
  const K = Math.min(R, Cn, clampInt(params.altered ?? 1, 1, 3, 1));
  const magnitude = MAGNITUDES[params.magnitude] ? params.magnitude : 'thousands';
  const currency = typeof params.currency === 'string' && params.currency.trim() ? params.currency.trim().slice(0, 6) : 'RM';
  return { R, C: Cn, K, restore: !!params.restore, magnitude, currency };
}

/** Western grouping, 1,250,000 (used for RM and LKR alike). */
export function fmt(n) {
  const neg = n < 0;
  const s = String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return neg ? `-${s}` : s;
}

/** Reads what a player typed: '12,450', 'RM 12450', '12 450' -> 12450. null when no digits. */
export function parseAmount(str) {
  const s = String(str ?? '').replace(/[^\d.]/g, '');
  if (!s) return null;
  const n = Math.round(Number(s.split('.')[0]));
  return Number.isFinite(n) ? n : null;
}

const sumRow = (cells, r) => cells[r].reduce((a, b) => a + b, 0);
const sumCol = (cells, c) => cells.reduce((a, row) => a + row[c], 0);

/** How far each row and column is off its printed total (sum minus printed). */
export function offsets(cells, rowTotals, colTotals) {
  return {
    rows: cells.map((_, r) => sumRow(cells, r) - rowTotals[r]),
    cols: colTotals.map((t, c) => sumCol(cells, c) - t),
  };
}

function permutations(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const out = [];
  arr.forEach((x, i) => { for (const p of permutations([...arr.slice(0, i), ...arr.slice(i + 1)])) out.push([x, ...p]); });
  return out;
}

/**
 * Every way to explain the totals with K changed figures, no two in a row or column.
 * Returns [[{ r, c, delta }...], ...]. A fair ledger has exactly one.
 */
export function solve(cells, rowTotals, colTotals, K) {
  const { rows, cols } = offsets(cells, rowTotals, colTotals);
  const badR = rows.map((d, r) => (d ? r : -1)).filter((r) => r >= 0);
  const badC = cols.map((d, c) => (d ? c : -1)).filter((c) => c >= 0);
  if (badR.length !== K || badC.length !== K) return [];
  const out = [];
  for (const perm of permutations(badC)) {
    const pairs = badR.map((r, i) => ({ r, c: perm[i], delta: rows[r] }));
    if (pairs.every((p) => cols[p.c] === p.delta && cells[p.r][p.c] - p.delta > 0)) out.push(pairs);
  }
  return out;
}

/**
 * Build a ledger. Returns { R, C, K, cells (as they read now), orig, rowTotals, colTotals, grand,
 * altered: [{ r, c, orig, now, delta }] }.
 */
export function generate(rng, params = {}) {
  const { R, C, K, magnitude } = settings(params);
  const m = MAGNITUDES[magnitude];
  const lo = m.lo * m.step, hi = m.hi * m.step;
  for (let attempt = 0; attempt < 200; attempt++) {
    // a ledger looks more real when each account has its own scale of business
    const scale = Array.from({ length: R }, () => 0.35 + rng() * 0.65);
    const orig = Array.from({ length: R }, (_, r) => Array.from({ length: C }, () => {
      const top = Math.max(m.lo + 4, Math.round(m.hi * scale[r]));
      return randInt(rng, m.lo, top) * m.step;
    }));
    const rowsPick = shuffle(rng, Array.from({ length: R }, (_, i) => i)).slice(0, K);
    const colsPick = shuffle(rng, Array.from({ length: C }, (_, i) => i)).slice(0, K);
    const altered = [];
    const used = new Set();
    let ok = true;
    for (let k = 0; k < K && ok; k++) {
      const r = rowsPick[k], c = colsPick[k];
      let placed = false;
      for (let t = 0; t < 60 && !placed; t++) {
        const size = randInt(rng, m.dlo, m.dhi) * m.step;
        const delta = rng() < 0.5 ? size : -size;
        const now = orig[r][c] + delta;
        if (used.has(size) || now < lo || now > hi) continue;
        used.add(size);
        altered.push({ r, c, orig: orig[r][c], now, delta });
        placed = true;
      }
      if (!placed) ok = false;
    }
    if (!ok) continue;
    const cells = orig.map((row) => row.slice());
    for (const a of altered) cells[a.r][a.c] = a.now;
    const rowTotals = orig.map((row) => row.reduce((x, y) => x + y, 0));
    const colTotals = Array.from({ length: C }, (_, c) => orig.reduce((x, row) => x + row[c], 0));
    const grand = rowTotals.reduce((x, y) => x + y, 0);
    const sols = solve(cells, rowTotals, colTotals, K);
    if (sols.length !== 1) continue;
    const key = (list) => list.map((p) => `${p.r},${p.c}`).sort().join('|');
    if (key(sols[0]) !== key(altered)) continue;
    altered.sort((a, b) => a.r - b.r || a.c - b.c);
    return { R, C, K, magnitude, cells, orig, rowTotals, colTotals, grand, altered };
  }
  throw new Error('ledger: could not build a fair ledger');
}

/** Row labels: the level's, topped up with defaults; column labels: the level's or a run of months. */
export function labels(rng, params, R, C) {
  const given = Array.isArray(params.rowLabels) ? params.rowLabels.map(String).filter(Boolean) : [];
  const pool = shuffle(rng, DEFAULT_ROWS.filter((n) => !given.includes(n)));
  const rows = [...given.slice(0, R)];
  while (rows.length < R) rows.push(pool.shift() || `Account ${rows.length + 1}`);
  const gc = Array.isArray(params.colLabels) ? params.colLabels.map(String).filter(Boolean) : [];
  let cols;
  if (gc.length >= C) cols = gc.slice(0, C);
  else {
    const startM = randInt(rng, 0, 12 - C);
    cols = [...gc, ...MONTHS.slice(startM + gc.length, startM + C)];
    while (cols.length < C) cols.push(`Col ${cols.length + 1}`);
  }
  return { rows, cols };
}

/** A short signature of a ledger, so a save for a different ledger is ignored. */
export function ledgerSig(L) {
  const s = JSON.stringify([L.cells, L.rowTotals, L.colTotals]);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
