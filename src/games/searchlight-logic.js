// Searchlight: pure Akari / Light Up logic (no DOM). Used by searchlight.js and by the node checks.
//
// A puzzle is { n, cells } where cells[i] is EMPTY (-1), WALL (5, a wall with no number) or 0..4
// (a numbered wall: exactly that many searchlights on the four cells beside it).
// A searchlight lights its own cell and every cell along its row and column until a wall.

export const EMPTY = -1;
export const WALL = 5;
export const DENSITY = { low: 0.12, medium: 0.19, high: 0.27 };

const U = 0, L = 1, X = 2;

/** Segments: every empty cell belongs to one row run and one column run between walls. */
export function layout(n, cells) {
  const rowSeg = new Int16Array(n * n).fill(-1), colSeg = new Int16Array(n * n).fill(-1);
  const segs = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const i = r * n + c;
    if (cells[i] !== EMPTY) continue;
    if (c === 0 || cells[i - 1] !== EMPTY) segs.push([]);
    rowSeg[i] = segs.length - 1; segs[segs.length - 1].push(i);
  }
  for (let c = 0; c < n; c++) for (let r = 0; r < n; r++) {
    const i = r * n + c;
    if (cells[i] !== EMPTY) continue;
    if (r === 0 || cells[i - n] !== EMPTY) segs.push([]);
    colSeg[i] = segs.length - 1; segs[segs.length - 1].push(i);
  }
  const adj = [];
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, a = [];
    if (r > 0) a.push(i - n);
    if (r < n - 1) a.push(i + n);
    if (c > 0) a.push(i - 1);
    if (c < n - 1) a.push(i + 1);
    adj.push(a);
  }
  const empties = [], numbers = [];
  for (let i = 0; i < n * n; i++) {
    if (cells[i] === EMPTY) empties.push(i);
    else if (cells[i] >= 0 && cells[i] <= 4) numbers.push(i);
  }
  return { n, cells, rowSeg, colSeg, segs, adj, empties, numbers };
}

/** Cells lit by a set of lights (Uint8Array of 0/1 per cell, lights included). */
export function litMap(lay, lights) {
  const lit = new Uint8Array(lay.n * lay.n);
  for (const i of lights) for (const s of [lay.rowSeg[i], lay.colSeg[i]]) for (const j of lay.segs[s]) lit[j] = 1;
  return lit;
}

/** Check a set of lights against the rules: { lit, clashes: Set of lights that see another, over/under/ok: numbered walls, unlit, solved }. */
export function check(lay, lights) {
  const set = new Set(lights);
  const lit = litMap(lay, set);
  const clashes = new Set();
  for (const s of lay.segs) {
    const ls = s.filter((j) => set.has(j));
    if (ls.length > 1) ls.forEach((j) => clashes.add(j));
  }
  const over = [], ok = [], under = [];
  for (const w of lay.numbers) {
    const k = lay.adj[w].filter((j) => set.has(j)).length;
    (k > lay.cells[w] ? over : k === lay.cells[w] ? ok : under).push(w);
  }
  const unlit = lay.empties.filter((i) => !lit[i]).length;
  return { lit, clashes, over, ok, under, unlit, solved: !unlit && !clashes.size && !over.length && !under.length };
}

// ---- solver: constraint propagation + branching on the cell with the fewest ways to be lit ----

function place(lay, st, i) {
  if (st.val[i] === L) return true;
  if (st.val[i] === X) return false;
  const rs = lay.rowSeg[i], cs = lay.colSeg[i];
  if (st.segLight[rs] || st.segLight[cs]) return false;
  st.val[i] = L;
  st.segLight[rs] = 1; st.segLight[cs] = 1;
  for (const s of [rs, cs]) for (const j of lay.segs[s]) if (j !== i && st.val[j] === U) st.val[j] = X;
  return true;
}
const isLit = (lay, st, i) => st.segLight[lay.rowSeg[i]] || st.segLight[lay.colSeg[i]];

function candidates(lay, st, i) {
  const out = [];
  for (const s of [lay.rowSeg[i], lay.colSeg[i]]) for (const j of lay.segs[s]) if (st.val[j] === U && !out.includes(j)) out.push(j);
  return out;
}

/** Apply forced steps until nothing changes. Returns false on a contradiction. */
export function propagate(lay, st) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const w of lay.numbers) {
      const k = lay.cells[w];
      let nl = 0, nu = 0;
      for (const j of lay.adj[w]) { if (st.val[j] === L) nl++; else if (st.val[j] === U && lay.cells[j] === EMPTY) nu++; }
      if (nl > k || nl + nu < k) return false;
      if (!nu) continue;
      if (nl === k) { for (const j of lay.adj[w]) if (st.val[j] === U && lay.cells[j] === EMPTY) st.val[j] = X; changed = true; }
      else if (nl + nu === k) {
        for (const j of lay.adj[w]) if (st.val[j] === U && lay.cells[j] === EMPTY) if (!place(lay, st, j)) return false;
        changed = true;
      }
    }
    for (const i of lay.empties) {
      if (isLit(lay, st, i)) continue;
      const c = candidates(lay, st, i);
      if (!c.length) return false;
      if (c.length === 1) { if (!place(lay, st, c[0])) return false; changed = true; }
    }
  }
  return true;
}

export function freshState(lay) {
  return { val: new Int8Array(lay.n * lay.n), segLight: new Uint8Array(lay.segs.length) };
}
const cloneState = (st) => ({ val: st.val.slice(), segLight: st.segLight.slice() });

/** Count solutions up to `max`. Returns { count, solution: [light cells] of the first one found }. */
export function solve(lay, max = 2, st = freshState(lay)) {
  let count = 0, solution = null, nodes = 0;
  const all = [];
  const rec = (s) => {
    if (count >= max || ++nodes > 200000) return;
    if (!propagate(lay, s)) return;
    let best = null, bc = null;
    for (const i of lay.empties) {
      if (isLit(lay, s, i)) continue;
      const c = candidates(lay, s, i);
      if (!best || c.length < bc.length) { best = i; bc = c; if (c.length <= 2) break; }
    }
    if (best == null) {
      count++;
      all.push(lay.empties.filter((i) => s.val[i] === L));
      if (!solution) solution = all[0];
      return;
    }
    for (let k = 0; k < bc.length; k++) {
      const t = cloneState(s);
      for (let m = 0; m < k; m++) t.val[bc[m]] = X;
      if (place(lay, t, bc[k])) rec(t);
      if (count >= max) return;
    }
  };
  rec(st);
  return { count: nodes > 200000 ? Math.max(count, max) : count, solution, all };
}

/**
 * What follows by plain deduction from what the player has right so far.
 * known: { lights: [cells], dots: [cells] } (both assumed correct). Returns { lights, dots } newly forced.
 */
export function deduce(lay, known) {
  const st = freshState(lay);
  for (const i of known.dots) if (st.val[i] === U) st.val[i] = X;
  for (const i of known.lights) place(lay, st, i);
  const before = st.val.slice();
  if (!propagate(lay, st)) return { lights: [], dots: [] };
  const lights = [], dots = [];
  for (const i of lay.empties) if (before[i] === U) { if (st.val[i] === L) lights.push(i); else if (st.val[i] === X) dots.push(i); }
  return { lights, dots };
}

/** Make a puzzle with exactly one solution. rng must be the seeded game rng. Returns { n, cells, solution }. */
export function generate(n, density, rng) {
  n = Math.max(6, Math.min(10, n | 0));
  const frac = DENSITY[density] ?? DENSITY.medium;
  for (let attempt = 0; attempt < 400; attempt++) {
    // 1. walls, 180-degree symmetric like a printed puzzle
    const cells = new Int8Array(n * n).fill(EMPTY);
    const want = Math.round(n * n * frac);
    let walls = 0, guard = 0;
    while (walls < want && guard++ < 1000) {
      const i = Math.floor(rng() * n * n), j = n * n - 1 - i;
      if (cells[i] !== EMPTY) continue;
      cells[i] = WALL; cells[j] = WALL;
      walls += i === j ? 1 : 2;
    }
    // 2. a random valid set of searchlights that lights everything
    let lay = layout(n, cells);
    if (!lay.empties.length) continue;
    const order = lay.empties.slice();
    for (let k = order.length - 1; k > 0; k--) { const m = Math.floor(rng() * (k + 1)); [order[k], order[m]] = [order[m], order[k]]; }
    const lights = new Set();
    const lit = new Uint8Array(n * n);
    for (const i of order) {
      if (lit[i]) continue;
      lights.add(i);
      for (const s of [lay.rowSeg[i], lay.colSeg[i]]) for (const j of lay.segs[s]) lit[j] = 1;
    }
    // 3. number every wall from that placement
    for (let i = 0; i < n * n; i++) if (cells[i] === WALL) cells[i] = lay.adj[i].filter((j) => lights.has(j)).length;
    // 3b. still two answers? Turn a square where the other answer puts a light into a numbered crate,
    //     as long as our own lights still light every square. Each repair rules that other answer out.
    let res = solve(layout(n, cells), 2);
    for (let fix = 0; fix < 30 && res.count > 1 && res.all.length > 1; fix++) {
      const other = res.all.find((sol) => sol.length !== lights.size || sol.some((i) => !lights.has(i)));
      if (!other) break;
      const cands = other.filter((i) => !lights.has(i));
      let done = false;
      for (const c of cands) {
        const trial = cells.slice();
        trial[c] = 0;
        const tl = layout(n, trial);
        const lit = litMap(tl, lights);
        if (tl.empties.some((i) => !lit[i])) continue;
        trial[c] = tl.adj[c].filter((j) => lights.has(j)).length;
        cells.set(trial);
        done = true;
        break;
      }
      if (!done) break;
      res = solve(layout(n, cells), 2);
    }
    if (res.count !== 1) continue;
    lay = layout(n, cells);
    // 4. take numbers away while the answer stays unique
    const nums = lay.numbers.slice();
    for (let k = nums.length - 1; k > 0; k--) { const m = Math.floor(rng() * (k + 1)); [nums[k], nums[m]] = [nums[m], nums[k]]; }
    for (const w of nums) {
      const keep = cells[w];
      cells[w] = WALL;
      if (solve(layout(n, cells), 2).count !== 1) cells[w] = keep;
    }
    lay = layout(n, cells);
    const fin = solve(lay, 2);
    if (fin.count !== 1) continue;
    return { n, cells: Array.from(cells), solution: fin.solution, attempt };
  }
  throw new Error('searchlight: no unique puzzle found');
}
