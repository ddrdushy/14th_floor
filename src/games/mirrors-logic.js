// Laser Grid: pure puzzle logic (no DOM), so node tests can import it.
// The board is size x size cells. The emitter and the sensor sit on the wall outside the board.
// A port is { side: 'N'|'E'|'S'|'W', k } : k is the row (E/W walls) or column (N/S walls).
// Cells: '.' empty, '#' crate (absorbs the beam), '/' or '\\' mirror, 'R' relay (beam passes straight).
import { mulberry32, shuffle } from '../core/rng.js';

const VEC = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };

export function clampParams(params = {}) {
  const num = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  const size = num(params.size, 5, 9, 6);
  return {
    size,
    mirrors: num(params.mirrors, 2, 7, 3),
    relays: num(params.relays, 0, 2, 0),
    obstacles: num(params.obstacles, 0, 12, 4),
  };
}

/** Where a beam starts when it enters from a wall port: the first cell and its direction. */
export function entry(size, port) {
  const { side, k } = port;
  if (side === 'W') return { r: k, c: 0, dr: 0, dc: 1 };
  if (side === 'E') return { r: k, c: size - 1, dr: 0, dc: -1 };
  if (side === 'N') return { r: 0, c: k, dr: 1, dc: 0 };
  return { r: size - 1, c: k, dr: -1, dc: 0 };
}

/** The wall port a beam leaving cell (r,c) in direction (dr,dc) hits. */
export function exitPort(size, r, c, dr, dc) {
  if (dc === 1) return { side: 'E', k: r };
  if (dc === -1) return { side: 'W', k: r };
  if (dr === 1) return { side: 'S', k: c };
  return { side: 'N', k: c };
}

export const reflect = (m, dr, dc) => (m === '/' ? [-dc, -dr] : m === '\\' ? [dc, dr] : [dr, dc]);
const samePort = (a, b) => a && b && a.side === b.side && a.k === b.k;

/**
 * Follow the beam. cells: array (row-major) of '.', '#', '/', '\\', 'R'; placed: index -> '/' | '\\'.
 * Returns { path: [{ r, c, dr, dc }...] (each visit, direction of travel on entering),
 *           end: 'sensor' | 'wall' | 'crate', exit (port, if it left the board), stop (index, if a crate),
 *           relaysHit: Set, solved }
 */
export function trace(puz, placed = {}) {
  const { size, cells, emitter, sensor } = puz;
  let { r, c, dr, dc } = entry(size, emitter);
  const path = [];
  const relaysHit = new Set();
  for (let step = 0; step < size * size * 8; step++) {
    const i = r * size + c;
    path.push({ r, c, dr, dc });
    const t = cells[i];
    if (t === '#') return finish('crate', null, i);
    if (t === 'R') relaysHit.add(i);
    const m = t === '/' || t === '\\' ? t : placed[i];
    if (m) [dr, dc] = reflect(m, dr, dc);
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= size || nc >= size) {
      const ex = exitPort(size, r, c, dr, dc);
      return finish(samePort(ex, sensor) ? 'sensor' : 'wall', ex, null);
    }
    r = nr; c = nc;
  }
  return finish('wall', null, null); // cannot happen: a beam from a wall always leaves again
  function finish(end, exit, stop) {
    const relays = puz.relays || [];
    const solved = end === 'sensor' && relays.every((x) => relaysHit.has(x));
    return { path, end, exit, stop, relaysHit, solved };
  }
}

/**
 * A lower bound on the mirrors still needed for a beam at (r,c) heading (dr,dc) to leave by the
 * sensor: 0 if it is already on the sensor's line heading for it, 1 if its ray crosses that line,
 * otherwise 2. Used to prune the searches.
 */
export function need(size, sensor, r, c, dr, dc) {
  const { side, k } = sensor;
  const horiz = side === 'E' || side === 'W';
  const want = side === 'E' ? [0, 1] : side === 'W' ? [0, -1] : side === 'S' ? [1, 0] : [-1, 0];
  if (horiz) {
    if (r === k && dr === want[0] && dc === want[1]) return 0;
    if (dc === 0 && (k - r) * dr >= 0) return 1;
  } else {
    if (c === k && dr === want[0] && dc === want[1]) return 0;
    if (dr === 0 && (k - c) * dc >= 0) return 1;
  }
  return 2;
}

/**
 * Search for solutions with at most `max` placed mirrors. The beam is followed; at each empty cell
 * it either passes (the cell is then frozen empty) or a mirror is placed there.
 * Returns { min (fewest mirrors in any solution found, or Infinity), count (solutions found, capped), aborted }.
 */
export function solve(puz, max, { limit = 50, budget = 300000 } = {}) {
  const { size, cells, sensor } = puz;
  const relays = puz.relays || [];
  let count = 0, min = Infinity, nodes = 0, aborted = false;
  const placed = new Map();
  const frozen = new Set();
  const start = entry(size, puz.emitter);
  const free = cells.filter((t) => t === '/' || t === '\\').length;
  function go(r, c, dr, dc, left, hit, steps) {
    if (aborted || count >= limit) return;
    if (++nodes > budget) { aborted = true; return; }
    if (steps > size * size * 8) return;
    if (need(size, sensor, r, c, dr, dc) > left + free) return; // bolted mirrors turn for free
    const i = r * size + c;
    const t = cells[i];
    if (t === '#') return;
    let h = hit;
    if (t === 'R' && !(hit & (1 << relays.indexOf(i)))) h = hit | (1 << relays.indexOf(i));
    const fixedM = t === '/' || t === '\\' ? t : placed.get(i);
    const options = [];
    if (fixedM) options.push([fixedM, false]);
    else if (t === 'R' || frozen.has(i)) options.push([null, false]);
    else {
      options.push([null, true]);
      if (left > 0) { options.push(['/', true]); options.push(['\\', true]); }
    }
    for (const [m, fresh] of options) {
      if (fresh) { if (m) placed.set(i, m); else frozen.add(i); }
      const [ndr, ndc] = m ? reflect(m, dr, dc) : [dr, dc];
      const nr = r + ndr, nc = c + ndc;
      const used = left - (fresh && m ? 1 : 0);
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) {
        const ex = exitPort(size, r, c, ndr, ndc);
        if (samePort(ex, sensor) && h === (1 << relays.length) - 1) {
          count++;
          min = Math.min(min, max - used);
        }
      } else go(nr, nc, ndr, ndc, used, h, steps + 1);
      if (fresh) { if (m) placed.delete(i); else frozen.delete(i); }
      if (aborted || count >= limit) return;
    }
  }
  go(start.r, start.c, start.dr, start.dc, max, 0, 0);
  return { min, count, aborted };
}

/** Fewest mirrors that solve the board (iterative deepening up to `upTo`), or Infinity. */
export function fewest(puz, upTo, budget = 300000) {
  for (let m = 0; m <= upTo; m++) {
    const s = solve(puz, m, { limit: 1, budget });
    if (s.count) return m;
    if (s.aborted) return Infinity; // too big to tell: treat as not cheaper
  }
  return Infinity;
}

const portEq = samePort;
function randomPort(r, size) {
  const side = ['N', 'E', 'S', 'W'][Math.floor(r() * 4)];
  return { side, k: Math.floor(r() * size) };
}

/**
 * Generate a puzzle. Returns { size, cells[], emitter, sensor, relays[], tray, solution: { index: mirror } ,
 * order: [indices of solution mirrors in beam order], pathCells: [...] }.
 */
export function generate(seed, params = {}) {
  const P = clampParams(params);
  const { size } = P;
  const r = mulberry32(seed);
  const n = size * size;
  let fallback = null;
  for (let attempt = 0; attempt < 400; attempt++) { // usually 1 to 20
    // ---- 1. a random beam path with P.mirrors turns (plus maybe one fixed mirror turn)
    const fixedTurns = size >= 6 && r() < 0.5 ? 1 : 0;
    const turns = P.mirrors + fixedTurns;
    const emitter = randomPort(r, size);
    let { r: cr, c: cc, dr, dc } = entry(size, emitter);
    const mirrorAt = new Map(); // index -> mirror
    const passed = new Set();
    const order = [];
    const visits = [];
    let ok = true, exit = null;
    for (let t = 0; t <= turns && ok; t++) {
      // walk a straight run of at least 1 cell; turn at its last cell unless this is the last run
      const room = [];
      for (let k = 0, rr = cr, c2 = cc; rr >= 0 && c2 >= 0 && rr < size && c2 < size; k++, rr += dr, c2 += dc) {
        const i = rr * size + c2;
        if (mirrorAt.has(i)) break; // never run through a mirror cell
        room.push(i);
      }
      if (!room.length) { ok = false; break; }
      if (t === turns) {
        // last run: straight out to the wall, must not cross a mirror
        const last = room[room.length - 1];
        const lr = Math.floor(last / size), lc = last % size;
        const nr = lr + dr, nc = lc + dc;
        if (nr >= 0 && nc >= 0 && nr < size && nc < size) { ok = false; break; }
        room.forEach((i) => { passed.add(i); visits.push(i); });
        exit = exitPort(size, lr, lc, dr, dc);
        break;
      }
      // turn somewhere along the run: on a cell the beam has not passed straight through
      const choices = room.map((i, k) => k).filter((k) => !passed.has(room[k]));
      if (!choices.length) { ok = false; break; }
      // prefer runs of 2+ cells so the path spreads out
      const longer = choices.filter((k) => k >= 1);
      const list = longer.length && r() < 0.85 ? longer : choices;
      const k = list[Math.floor(r() * list.length)];
      for (let q = 0; q < k; q++) { passed.add(room[q]); visits.push(room[q]); }
      const ti = room[k];
      const m = r() < 0.5 ? '/' : '\\';
      mirrorAt.set(ti, m); order.push(ti); visits.push(ti);
      [dr, dc] = reflect(m, dr, dc);
      cr = Math.floor(ti / size) + dr; cc = (ti % size) + dc;
      if (cr < 0 || cc < 0 || cr >= size || cc >= size) { ok = false; break; } // turned straight into a wall
    }
    if (!ok || !exit) continue;
    if (portEq(exit, emitter)) continue;
    // a cell passed straight through must not also be a mirror cell
    if ([...passed].some((i) => mirrorAt.has(i))) continue;

    // ---- 2. lay out the board
    const cells = new Array(n).fill('.');
    const solution = {};
    // which turn is a fixed mirror (never the first: the player should place the first turn)
    const fixedIdx = fixedTurns ? order[1 + Math.floor(r() * (order.length - 1))] : -1;
    for (const i of order) { if (i === fixedIdx) cells[i] = mirrorAt.get(i); else solution[i] = mirrorAt.get(i); }
    const onPath = new Set(visits);
    // relays on straight-through cells of the path, spread along it
    const straight = visits.filter((i) => !mirrorAt.has(i));
    if (straight.length < P.relays) continue;
    const relays = [];
    if (P.relays) {
      const pool = shuffle(r, [...new Set(straight)]);
      for (const i of pool) { if (relays.length < P.relays && !relays.includes(i)) relays.push(i); }
      relays.forEach((i) => { cells[i] = 'R'; });
    }
    const puz = { size, cells, emitter, sensor: exit, relays, tray: P.mirrors };
    // the plain beam (no mirrors placed) must not already hit the sensor
    if (trace(puz).solved) continue;
    // ---- 3. obstacles: first block cheaper routes, then scatter the rest; never on the path
    const free = () => Array.from({ length: n }, (_, i) => i).filter((i) => cells[i] === '.' && !onPath.has(i));
    let budgetLeft = P.obstacles;
    // decoy fixed mirror off the path on bigger boards
    if (size >= 7 && r() < 0.7) {
      const f = free();
      if (f.length) { const i = f[Math.floor(r() * f.length)]; cells[i] = r() < 0.5 ? '/' : '\\'; }
    }
    const want = Math.max(1, P.mirrors - 1); // a solution may save at most one mirror
    // greedy: crate the free cell that the most cheaper routes cross
    for (let guard = 0; budgetLeft > 0 && guard < 20; guard++) {
      const trails = cheapTrails(puz, want - 1, 40, 40000);
      if (!trails.length) break;
      const freq = new Map();
      for (const t of trails) for (const i of new Set(t)) if (cells[i] === '.' && !onPath.has(i)) freq.set(i, (freq.get(i) || 0) + 1);
      if (!freq.size) break;
      const top = Math.max(...freq.values());
      const best = [...freq.keys()].filter((i) => freq.get(i) === top).sort((a, b) => a - b);
      cells[best[Math.floor(r() * best.length)]] = '#';
      budgetLeft--;
    }
    const f = shuffle(r, free());
    while (budgetLeft > 0 && f.length) { cells[f.pop()] = '#'; budgetLeft--; }
    if (trace(puz).solved || !trace(puz, solution).solved) continue;
    // is there still a route that saves two or more mirrors?
    const shortcut = solve(puz, want - 1, { limit: 1, budget: 250000 });
    const out = { ...puz, solution, order: order.filter((i) => i !== fixedIdx), path: visits };
    if (!shortcut.count && !shortcut.aborted) { out.min = want; return out; }
    out.min = fewest(puz, want - 1, 80000);
    if (out.min >= 1 && (!fallback || out.min > fallback.min)) fallback = out;
    if (fallback && attempt >= 150) break; // good enough: the tray is generous on this board
  }
  return fallback;

}

/** Up to `limit` solutions with at most `max` placed mirrors, each as the list of cells its beam crosses. */
export function cheapTrails(puz, max, limit = 60, budget = 150000) {
  const out = [];
  if (max < 0) return out;
  const { size, cells, sensor } = puz;
  const relays = puz.relays || [];
  const placed = new Map();
  const frozen = new Set();
  const trail = [];
  let nodes = 0;
  const start = entry(size, puz.emitter);
  const free = cells.filter((t) => t === '/' || t === '\\').length;
  (function go(r, c, dr, dc, left, hit) {
    if (out.length >= limit || ++nodes > budget || trail.length > size * size * 8) return;
    if (need(size, sensor, r, c, dr, dc) > left + free) return; // bolted mirrors turn for free
    const i = r * size + c;
    const t = cells[i];
    if (t === '#') return;
    const h = t === 'R' ? hit | (1 << relays.indexOf(i)) : hit;
    const fixedM = t === '/' || t === '\\' ? t : placed.get(i);
    const options = fixedM ? [[fixedM, false]] : t === 'R' || frozen.has(i) ? [[null, false]]
      : [[null, true], ...(left > 0 ? [['/', true], ['\\', true]] : [])];
    trail.push(i);
    for (const [m, fresh] of options) {
      if (fresh) { if (m) placed.set(i, m); else frozen.add(i); }
      const [ndr, ndc] = m ? reflect(m, dr, dc) : [dr, dc];
      const nr = r + ndr, nc = c + ndc;
      const used = left - (fresh && m ? 1 : 0);
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) {
        if (samePort(exitPort(size, r, c, ndr, ndc), sensor) && h === (1 << relays.length) - 1) out.push(trail.slice());
      } else go(nr, nc, ndr, ndc, used, h);
      if (fresh) { if (m) placed.delete(i); else frozen.delete(i); }
      if (out.length >= limit) break;
    }
    trail.pop();
  })(start.r, start.c, start.dr, start.dc, max, 0);
  return out;
}
