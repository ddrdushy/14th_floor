// Car Park Getaway: pure Rush Hour logic (no DOM). Used by getaway.js and by the offline bank script.
//
// A board is a 36-character string, row by row: '.' empty, 'A' the target car, 'B'..'Z' other vehicles.
// A vehicle is { r, c, len, h } (h = horizontal). Its position along its axis is c (horizontal) or r.
// One move = one vehicle slid any distance along its axis. The exit is on the right edge of the
// target's row, so the puzzle is solved when the target's right end reaches column 5.

export const N = 6;
export const BANDS = { easy: [6, 10], medium: [11, 18], hard: [19, 30] };

export function parseBoard(str) {
  const cells = {};
  for (let i = 0; i < N * N; i++) {
    const ch = str[i];
    if (ch && ch !== '.' && ch !== 'o') (cells[ch] = cells[ch] || []).push(i);
  }
  const ids = Object.keys(cells).sort();
  if (ids[0] !== 'A') throw new Error('board has no target car A');
  return ids.map((id) => {
    const list = cells[id];
    const r = Math.floor(list[0] / N), c = list[0] % N;
    const h = list.length > 1 && list[1] === list[0] + 1;
    return { r, c, len: list.length, h };
  });
}

export function boardString(vehicles, pos) {
  const out = Array(N * N).fill('.');
  vehicles.forEach((v, i) => {
    const p = pos ? pos[i] : v.h ? v.c : v.r;
    for (let k = 0; k < v.len; k++) {
      const r = v.h ? v.r : p + k, c = v.h ? p + k : v.c;
      out[r * N + c] = String.fromCharCode(65 + i);
    }
  });
  return out.join('');
}

/** Flip a board top to bottom (the exit row moves too, so every flip is still a fair puzzle). */
export function flipBoard(str) {
  let out = '';
  for (let r = N - 1; r >= 0; r--) out += str.slice(r * N, r * N + N);
  return out;
}

export const startPos = (vehicles) => vehicles.map((v) => (v.h ? v.c : v.r));
export const goalPos = () => N - 2; // target is length 2

/** Occupancy grid: index of the vehicle in each cell, -1 when empty. */
export function occupancy(vehicles, pos) {
  const g = new Int8Array(N * N).fill(-1);
  vehicles.forEach((v, i) => {
    for (let k = 0; k < v.len; k++) {
      const r = v.h ? v.r : pos[i] + k, c = v.h ? pos[i] + k : v.c;
      g[r * N + c] = i;
    }
  });
  return g;
}

/** How far vehicle i can slide: [lowest position, highest position]. */
export function range(vehicles, pos, i, occ = occupancy(vehicles, pos)) {
  const v = vehicles[i];
  const at = (p) => (v.h ? occ[v.r * N + p] : occ[p * N + v.c]);
  let lo = pos[i], hi = pos[i];
  while (lo - 1 >= 0 && at(lo - 1) === -1) lo--;
  while (hi + v.len < N && at(hi + v.len) === -1) hi++;
  return [lo, hi];
}

/** Is a position list legal (in bounds, no overlaps, target on its row)? */
export function legal(vehicles, pos) {
  if (!Array.isArray(pos) || pos.length !== vehicles.length) return false;
  const seen = new Uint8Array(N * N);
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i], p = pos[i];
    if (!Number.isInteger(p) || p < 0 || p + v.len > N) return false;
    for (let k = 0; k < v.len; k++) {
      const r = v.h ? v.r : p + k, c = v.h ? p + k : v.c;
      if (seen[r * N + c]) return false;
      seen[r * N + c] = 1;
    }
  }
  return true;
}

const key = (pos) => { let k = 0; for (let i = 0; i < pos.length; i++) k = k * 6 + pos[i]; return k; };

/** Every state one move away: [{ v, to, pos }]. */
export function neighbours(vehicles, pos) {
  const occ = occupancy(vehicles, pos);
  const out = [];
  for (let i = 0; i < vehicles.length; i++) {
    const [lo, hi] = range(vehicles, pos, i, occ);
    for (let p = lo; p <= hi; p++) {
      if (p === pos[i]) continue;
      const next = pos.slice();
      next[i] = p;
      out.push({ v: i, to: p, pos: next });
    }
  }
  return out;
}

/**
 * Breadth-first search from pos to the exit. Returns the optimal list of moves [{ v, from, to }]
 * ([] when already solved), or null when the target can never get out.
 */
export function solve(vehicles, pos, limit = 400000) {
  pos = Array.from(pos);
  if (pos[0] === goalPos()) return [];
  const start = key(pos);
  const parent = new Map([[start, null]]);
  let frontier = [pos];
  while (frontier.length) {
    const next = [];
    for (const cur of frontier) {
      const ck = key(cur);
      for (const n of neighbours(vehicles, cur)) {
        const k = key(n.pos);
        if (parent.has(k)) continue;
        parent.set(k, { prev: ck, prevPos: cur, v: n.v, to: n.to });
        if (n.pos[0] === goalPos()) {
          const path = [];
          let kk = k;
          while (parent.get(kk)) {
            const p = parent.get(kk);
            path.push({ v: p.v, from: p.prevPos[p.v], to: p.to });
            kk = p.prev;
          }
          return path.reverse();
        }
        next.push(n.pos);
      }
      if (parent.size > limit) return null;
    }
    frontier = next;
  }
  return null;
}

/**
 * Distance to the exit for every state reachable from pos (the whole component, explored once).
 * Returns { dist(pos) -> moves left or -1, next(pos) -> one optimal move { v, from, to } or null, size }.
 * After this, the progress bar and hints cost almost nothing per move.
 */
export function distanceMap(vehicles, pos, limit = 200000) {
  const nV = vehicles.length;
  const index = new Map();
  const states = [];
  const adj = [];
  const add = (p) => { const k = key(p); let id = index.get(k); if (id === undefined) { id = states.length; index.set(k, id); states.push(p); } return id; };
  add(Array.from(pos));
  for (let s = 0; s < states.length; s++) {
    if (states.length > limit) return null;
    const cur = states[s];
    const occ = occupancy(vehicles, cur);
    const list = [];
    for (let i = 0; i < nV; i++) {
      const [lo, hi] = range(vehicles, cur, i, occ);
      for (let p = lo; p <= hi; p++) {
        if (p === cur[i]) continue;
        const nx = cur.slice(); nx[i] = p;
        list.push(add(nx));
      }
    }
    adj.push(list);
  }
  const d = new Int16Array(states.length).fill(-1);
  let frontier = [];
  for (let s = 0; s < states.length; s++) if (states[s][0] === goalPos()) { d[s] = 0; frontier.push(s); }
  while (frontier.length) {
    const next = [];
    for (const s of frontier) for (const t of adj[s]) if (d[t] < 0) { d[t] = d[s] + 1; next.push(t); }
    frontier = next;
  }
  const dist = (p) => { const id = index.get(key(p)); return id === undefined ? -1 : d[id]; };
  return {
    size: states.length,
    dist,
    next(p) {
      const here = dist(p);
      if (here <= 0) return null;
      for (const n of neighbours(vehicles, p)) if (dist(n.pos) === here - 1) return { v: n.v, from: p[n.v], to: n.to };
      return null;
    },
  };
}

/** Pick a bank entry for a difficulty band, flipped at random. Returns { board, par, id }. */
export function pickPuzzle(bank, difficulty, rng) {
  const list = bank[difficulty] || bank.medium;
  const n = Math.floor(rng() * list.length);
  const flip = rng() < 0.5;
  const [str, par] = list[n];
  return { board: flip ? flipBoard(str) : str, par, id: `${difficulty}:${n}:${flip ? 1 : 0}` };
}
