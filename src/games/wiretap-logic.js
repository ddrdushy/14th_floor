// Wire Tap: pure puzzle logic (no DOM), so node tests can import it.
// A tile is a 4-bit mask of the sides its wire leaves by: N=1, E=2, S=4, W=8.
// Rotating a tile 90 degrees clockwise moves N->E->S->W->N.
import { mulberry32, shuffle } from '../core/rng.js';

export const N = 1, E = 2, S = 4, W = 8;
export const DIRS = [N, E, S, W];
export const OPP = { [N]: S, [E]: W, [S]: N, [W]: E };
const DR = { [N]: -1, [E]: 0, [S]: 1, [W]: 0 };
const DC = { [N]: 0, [E]: 1, [S]: 0, [W]: -1 };

export const rotCW = (m) => ((m << 1) | (m >> 3)) & 15;
export const rotate = (m, k) => { let x = m; for (let i = 0; i < (((k % 4) + 4) % 4); i++) x = rotCW(x); return x; };
export const bits = (m) => DIRS.filter((d) => m & d);
export const degree = (m) => bits(m).length;

/** 'end' | 'straight' | 'corner' | 'tee' */
export function kind(m) {
  const d = degree(m);
  if (d === 1) return 'end';
  if (d === 3) return 'tee';
  return m === (N | S) || m === (E | W) ? 'straight' : 'corner';
}

/** Distinct masks a tile can show (a straight has 2, the rest 4). */
export function orientations(m) { return [...new Set([0, 1, 2, 3].map((k) => rotate(m, k)))]; }

/** Neighbour index of cell i in direction d, or -1 off the board. */
export function neighbour(size, i, d, wrap = false) {
  let r = Math.floor(i / size) + DR[d], c = (i % size) + DC[d];
  if (wrap) { r = (r + size) % size; c = (c + size) % size; } else if (r < 0 || c < 0 || r >= size || c >= size) return -1;
  return r * size + c;
}

export function clampParams(params = {}) {
  const num = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  const size = num(params.size, 4, 8, 5);
  return { size, targets: num(params.targets, 1, 4, 2), wrap: params.wrap === true };
}

/** Random spanning tree with no four-way crossings (max degree 3). Returns masks or null. */
function spanningTree(r, size, wrap, src) {
  const n = size * size;
  const mask = new Array(n).fill(0);
  const seen = new Array(n).fill(false);
  seen[src] = true;
  let count = 1;
  const frontier = [];
  const addEdges = (i) => { for (const d of DIRS) { const j = neighbour(size, i, d, wrap); if (j >= 0 && !seen[j]) frontier.push([i, d, j]); } };
  addEdges(src);
  while (frontier.length) {
    const k = Math.floor(r() * frontier.length);
    const [i, d, j] = frontier[k];
    frontier[k] = frontier[frontier.length - 1];
    frontier.pop();
    if (seen[j] || degree(mask[i]) >= 3) continue;
    mask[i] |= d; mask[j] |= OPP[d];
    seen[j] = true; count++;
    addEdges(j);
  }
  return count === n ? mask : null;
}

/**
 * Count solutions (up to `limit`) of a board whose tiles are the shapes in `masks`, ignoring the
 * given orientation. A solution: every wire meets a wire, no wire leaves the board, all one network.
 * `fixed` (optional): index -> mask that a tile must show.
 */
export function countSolutions(size, masks, { wrap = false, limit = 2, fixed = {}, budget = 200000 } = {}) {
  const n = size * size;
  const dom = masks.map((m, i) => (fixed[i] != null ? [fixed[i]] : orientations(m)));
  let found = 0, nodes = 0, aborted = false;
  // edge requirement between i and its neighbour j in direction d must agree
  function propagate(D, queue) {
    while (queue.length) {
      const i = queue.pop();
      for (const d of DIRS) {
        const j = neighbour(size, i, d, wrap);
        if (j < 0) {
          const nd = D[i].filter((m) => !(m & d));
          if (nd.length !== D[i].length) { if (!nd.length) return false; D[i] = nd; queue.push(i); }
          continue;
        }
        const canOn = D[i].some((m) => m & d), canOff = D[i].some((m) => !(m & d));
        const od = OPP[d];
        const nd = D[j].filter((m) => ((m & od) ? canOn : canOff));
        if (nd.length !== D[j].length) { if (!nd.length) return false; D[j] = nd; queue.push(j); }
      }
    }
    return true;
  }
  // a closed piece of network smaller than the whole board, or a loop, is a dead end
  function sane(D) {
    const fixedCell = (i) => D[i].length === 1;
    const comp = new Array(n).fill(-1);
    for (let s = 0; s < n; s++) {
      if (comp[s] >= 0 || !fixedCell(s)) continue;
      // walk the edges that are certain (both ends fixed and joined)
      const stack = [[s, -1]]; comp[s] = s;
      let closed = true, size1 = 0;
      while (stack.length) {
        const [i, from] = stack.pop(); size1++;
        for (const d of bits(D[i][0])) {
          const j = neighbour(size, i, d, wrap);
          if (j < 0) return false;
          if (!fixedCell(j)) { closed = false; continue; }
          if (j === from) continue;
          if (comp[j] === s) return false; // loop
          comp[j] = s; stack.push([j, i]);
        }
      }
      if (closed && size1 < n) return false;
    }
    return true;
  }
  function search(D) {
    if (aborted || found >= limit) return;
    if (++nodes > budget) { aborted = true; return; }
    if (!sane(D)) return;
    let best = -1;
    for (let i = 0; i < n; i++) if (D[i].length > 1 && (best < 0 || D[i].length < D[best].length)) best = i;
    if (best < 0) { found++; return; }
    for (const m of D[best]) {
      const D2 = D.slice(); D2[best] = [m];
      if (propagate(D2, [best])) search(D2);
      if (aborted || found >= limit) return;
    }
  }
  const D0 = dom.slice();
  if (propagate(D0, Array.from({ length: n }, (_, i) => i))) search(D0);
  return { count: found, aborted, nodes };
}

/** How many tiles plain propagation fixes from the start (a rough "how much can be reasoned" score). */
export function forcedShare(size, masks, wrap = false) {
  const n = size * size;
  const D = masks.map((m) => orientations(m));
  const q = Array.from({ length: n }, (_, i) => i);
  // same propagation as above, inlined small
  while (q.length) {
    const i = q.pop();
    for (const d of DIRS) {
      const j = neighbour(size, i, d, wrap);
      if (j < 0) { const nd = D[i].filter((m) => !(m & d)); if (nd.length < D[i].length) { D[i] = nd; q.push(i); } continue; }
      const on = D[i].some((m) => m & d), off = D[i].some((m) => !(m & d));
      const nd = D[j].filter((m) => ((m & OPP[d]) ? on : off));
      if (nd.length < D[j].length) { D[j] = nd; q.push(j); }
    }
  }
  return D.filter((x) => x.length === 1).length / n;
}

/**
 * Generate a puzzle. Returns { size, wrap, src, targets[], solution[], start[] (rotation 0..3 per tile) }.
 * Every tile's current mask is rotate(solution[i], start[i]).
 */
export function generate(seed, params = {}) {
  const { size, targets: T, wrap } = clampParams(params);
  const r = mulberry32(seed);
  const n = size * size;
  let best = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    const mid = Math.floor(size / 2);
    const off = () => (size % 2 ? 0 : Math.floor(r() * 2)); // even boards have four middle cells
    const src = (mid - off()) * size + (mid - off());
    const sol = spanningTree(r, size, wrap, src);
    if (!sol) continue;
    const leaves = shuffle(r, Array.from({ length: n }, (_, i) => i).filter((i) => i !== src && degree(sol[i]) === 1));
    if (leaves.length < T) continue;
    // spread handsets out: greedy farthest picks
    const dist = (a, b) => Math.abs(Math.floor(a / size) - Math.floor(b / size)) + Math.abs((a % size) - (b % size));
    const targets = [leaves[0]];
    while (targets.length < T) {
      let pickI = -1, pickD = -1;
      for (const l of leaves) { if (targets.includes(l)) continue; const d = Math.min(dist(l, src), ...targets.map((t) => dist(l, t))); if (d > pickD) { pickD = d; pickI = l; } }
      targets.push(pickI);
    }
    const res = countSolutions(size, sol, { wrap, limit: 2, budget: 40000 });
    const unique = res.count === 1 && !res.aborted;
    const cand = { size, wrap, src, targets, solution: sol, unique };
    if (unique) { best = cand; break; }
    if (!best && res.count >= 1) best = cand;
  }
  // scramble: random turns, but most tiles must start wrong
  for (let tries = 0; ; tries++) {
    const start = best.solution.map(() => Math.floor(r() * 4));
    const right = start.filter((k, i) => rotate(best.solution[i], k) === best.solution[i]).length;
    if (right <= Math.floor(n * 0.25) || tries > 50) { best.start = start; break; }
  }
  return best;
}

/** Live state of a board: which tiles carry current, which wire ends are loose. */
export function evaluate(size, masks, src, wrap = false) {
  const n = size * size;
  const lit = new Array(n).fill(false);
  const loose = masks.map(() => 0); // mask of open ends per tile
  for (let i = 0; i < n; i++) for (const d of bits(masks[i])) {
    const j = neighbour(size, i, d, wrap);
    if (j < 0 || !(masks[j] & OPP[d])) loose[i] |= d;
  }
  const stack = [src]; lit[src] = true;
  while (stack.length) {
    const i = stack.pop();
    for (const d of bits(masks[i])) {
      const j = neighbour(size, i, d, wrap);
      if (j >= 0 && !lit[j] && (masks[j] & OPP[d])) { lit[j] = true; stack.push(j); }
    }
  }
  const litCount = lit.filter(Boolean).length;
  const looseCount = loose.reduce((s, m) => s + degree(m), 0);
  const good = lit.filter((x, i) => x && !loose[i]).length; // lit tiles with every wire joined
  return { lit, loose, litCount, looseCount, good, solved: litCount === n && looseCount === 0 };
}
