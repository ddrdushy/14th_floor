// Kakuro and killer cages: generated sum grids with a unique solution, pencil marks and a combination helper.
import { h } from '../core/ui.js';
import { shuffle, randInt } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'kakuro', name: 'Kakuro', category: 'Numbers' };
export const demo = { variant: 'classic', params: { difficulty: 'hard' } };

const SIZES = { easy: 6, medium: 7, hard: 8, expert: 9 };
const KILLER_SIZES = { easy: 5, medium: 6, hard: 6, expert: 7 };

// ---------- combination tables ----------
// COMBOS[len][sum] = list of digit bitmasks (bit d set for digit d), digits 1..9
const COMBOS = [];
for (let len = 0; len <= 9; len++) COMBOS.push([]);
for (let m = 0; m < 512; m++) {
  let len = 0, sum = 0;
  for (let d = 1; d <= 9; d++) if (m & (1 << (d - 1))) { len++; sum += d; }
  (COMBOS[len][sum] ||= []).push(m << 1);
}
const bits = (m) => { const out = []; for (let d = 1; d <= 9; d++) if (m & (1 << d)) out.push(d); return out; };
const popcount = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };

/** Digits that can still go in a group, given what is placed. maxD limits digits (killer uses 1..N). */
function allowedFor(len, sum, usedMask, usedSum, usedCount, maxD) {
  const k = len - usedCount;
  const rem = sum - usedSum;
  if (k === 0) return rem === 0 ? 0 : -1;
  const list = COMBOS[k]?.[rem];
  if (!list) return -1;
  const lim = (1 << (maxD + 1)) - 2;
  let out = 0;
  for (const m of list) if (!(m & usedMask) && (m & ~lim) === 0) out |= m;
  return out || -1;
}

// ---------- generic solver over sum groups ----------
// model: { size, cells: [{ kind: 'block'|'input' }], groups: [{ cells, sum|null }], maxD }
function cellGroups(model) {
  const of = model.cells.map(() => []);
  model.groups.forEach((g, gi) => g.cells.forEach((c) => of[c].push(gi)));
  return of;
}

export function countSolutions(model, limit = 2, nodeCap = 200000) {
  const { groups, maxD } = model;
  const of = cellGroups(model);
  const inputs = model.cells.map((c, i) => (c.kind === 'input' ? i : -1)).filter((i) => i >= 0);
  const val = new Array(model.cells.length).fill(0);
  const gUsed = groups.map(() => 0), gSum = groups.map(() => 0), gCnt = groups.map(() => 0);
  for (const i of inputs) if (model.cells[i].given) place(i, model.cells[i].given);
  const sols = [];
  let nodes = 0, aborted = false;

  function place(i, d) {
    val[i] = d;
    for (const g of of[i]) { gUsed[g] |= 1 << d; gSum[g] += d; gCnt[g]++; }
  }
  function unplace(i) {
    const d = val[i];
    for (const g of of[i]) { gUsed[g] &= ~(1 << d); gSum[g] -= d; gCnt[g]--; }
    val[i] = 0;
  }
  function cands(i) {
    let m = ((1 << (maxD + 1)) - 2);
    for (const g of of[i]) {
      const G = groups[g];
      if (G.sum == null) { m &= ~gUsed[g]; continue; }
      const a = allowedFor(G.cells.length, G.sum, gUsed[g], gSum[g], gCnt[g], maxD);
      if (a < 0) return 0;
      m &= a;
    }
    return m;
  }
  function rec() {
    if (++nodes > nodeCap) { aborted = true; return; }
    let best = -1, bestM = 0, bestN = 99;
    for (const i of inputs) {
      if (val[i]) continue;
      const m = cands(i);
      const n = popcount(m);
      if (n === 0) return;
      if (n < bestN) { bestN = n; best = i; bestM = m; if (n === 1) break; }
    }
    if (best < 0) { sols.push(val.slice()); return; }
    for (const d of bits(bestM)) {
      place(best, d);
      rec();
      unplace(best);
      if (sols.length >= limit || aborted) return;
    }
  }
  rec();
  return { count: aborted ? limit : sols.length, sols, aborted };
}

// ---------- classic kakuro ----------
function makeLayout(rng, N, maxRun) {
  const idx = (r, c) => r * N + c;
  for (let attempt = 0; attempt < 200; attempt++) {
    const white = new Array(N * N).fill(false);
    for (let r = 1; r < N; r++) for (let c = 1; c < N; c++) white[idx(r, c)] = true;
    const setBlack = (r, c) => { white[idx(r, c)] = false; white[idx(N - r, N - c)] = false; };
    const interior = (N - 1) * (N - 1);
    const seeds = Math.round(interior * (0.12 + rng() * 0.08));
    for (let k = 0; k < seeds; k++) setBlack(randInt(rng, 1, N - 1), randInt(rng, 1, N - 1));
    let changed = true, guard = 0;
    while (changed && guard++ < 50) {
      changed = false;
      for (let r = 1; r < N; r++) for (let c = 1; c < N; c++) {
        if (!white[idx(r, c)]) continue;
        const hl = runLen(white, N, r, c, 0, 1), vl = runLen(white, N, r, c, 1, 0);
        if (hl < 2 || vl < 2) { setBlack(r, c); changed = true; }
      }
      // break over-long runs
      for (let r = 1; r < N; r++) for (let c = 1; c < N; c++) {
        if (!white[idx(r, c)]) continue;
        for (const [dr, dc] of [[0, 1], [1, 0]]) {
          if (white[idx(r - dr, c - dc)]) continue; // not a run start
          let L = 0;
          while (r + dr * L < N && c + dc * L < N && white[idx(r + dr * L, c + dc * L)]) L++;
          if (L > maxRun) {
            const cut = randInt(rng, 2, L - 3 >= 2 ? L - 3 : 2);
            setBlack(r + dr * cut, c + dc * cut);
            changed = true;
          }
        }
      }
    }
    const whites = white.reduce((n, w) => n + (w ? 1 : 0), 0);
    if (whites < interior * 0.6) continue;
    // every white needs both runs >= 2, and whites must be connected
    let ok = true;
    for (let r = 1; r < N && ok; r++) for (let c = 1; c < N; c++) {
      if (white[idx(r, c)] && (runLen(white, N, r, c, 0, 1) < 2 || runLen(white, N, r, c, 1, 0) < 2)) { ok = false; break; }
    }
    // no wasted all-black rows or columns
    for (let k = 1; k < N && ok; k++) {
      let rowW = false, colW = false;
      for (let j = 1; j < N; j++) { rowW ||= white[idx(k, j)]; colW ||= white[idx(j, k)]; }
      if (!rowW || !colW) ok = false;
    }
    if (!ok || !connected(white, N)) continue;
    return white;
  }
  return null;
}

function runLen(white, N, r, c, dr, dc) {
  let n = 1, rr = r - dr, cc = c - dc;
  while (rr >= 0 && cc >= 0 && white[rr * N + cc]) { n++; rr -= dr; cc -= dc; }
  rr = r + dr; cc = c + dc;
  while (rr < N && cc < N && white[rr * N + cc]) { n++; rr += dr; cc += dc; }
  return n;
}

function connected(white, N) {
  const start = white.indexOf(true);
  if (start < 0) return false;
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const i = stack.pop();
    const r = Math.floor(i / N), c = i % N;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
      const j = rr * N + cc;
      if (white[j] && !seen.has(j)) { seen.add(j); stack.push(j); }
    }
  }
  return seen.size === white.filter(Boolean).length;
}

function runsOf(white, N) {
  const runs = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (white[r * N + c]) continue;
    for (const [dr, dc, dir] of [[0, 1, 'a'], [1, 0, 'd']]) {
      const cells = [];
      let rr = r + dr, cc = c + dc;
      while (rr < N && cc < N && white[rr * N + cc]) { cells.push(rr * N + cc); rr += dr; cc += dc; }
      if (cells.length) runs.push({ head: r * N + c, dir, cells, sum: 0 });
    }
  }
  return runs;
}

function fillDigits(rng, N, runs, cellsCount) {
  const of = Array.from({ length: cellsCount }, () => []);
  runs.forEach((g, gi) => g.cells.forEach((c) => of[c].push(gi)));
  const order = [...new Set(runs.flatMap((g) => g.cells))].sort((a, b) => a - b);
  const val = new Array(cellsCount).fill(0);
  let nodes = 0;
  function rec(k) {
    if (k === order.length) return true;
    if (++nodes > 20000) return false;
    const i = order[k];
    for (const d of shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (of[i].some((g) => runs[g].cells.some((c) => val[c] === d))) continue;
      val[i] = d;
      if (rec(k + 1)) return true;
      val[i] = 0;
    }
    return false;
  }
  return rec(0) ? val : null;
}

function kakuroModel(N, white, runs, val) {
  const cells = [];
  for (let i = 0; i < N * N; i++) cells.push(white[i] ? { kind: 'input', sol: val[i] } : { kind: 'block' });
  for (const g of runs) {
    g.sum = g.cells.reduce((s, c) => s + val[c], 0);
    cells[g.head][g.dir] = g.sum;
  }
  return { kind: 'kakuro', size: N, cells, groups: runs.map((g) => ({ cells: g.cells, sum: g.sum, dir: g.dir, head: g.head })), maxD: 9 };
}

export function generateKakuro(rng, N = 8) {
  const maxRun = N >= 8 ? 5 : 4;
  for (let attempt = 0; attempt < 60; attempt++) {
    const white = makeLayout(rng, N, maxRun);
    if (!white) continue;
    const runs = runsOf(white, N);
    const val = fillDigits(rng, N, runs, N * N);
    if (!val) continue;
    const of = Array.from({ length: N * N }, () => []);
    runs.forEach((g, gi) => g.cells.forEach((c) => of[c].push(gi)));
    for (let iter = 0; iter < 80; iter++) {
      const model = kakuroModel(N, white, runs, val);
      const res = countSolutions(model, 2);
      if (res.count === 1 && !res.aborted) return model;
      if (res.aborted) break;
      // nudge one cell where another solution disagrees, keeping the fill legal
      const alt = res.sols.find((s) => s.some((v, i) => v !== val[i])) || res.sols[0];
      const diffs = shuffle(rng, alt.map((v, i) => (white[i] && v !== val[i] ? i : -1)).filter((i) => i >= 0));
      let moved = false;
      for (const i of diffs) {
        const taken = new Set(of[i].flatMap((g) => runs[g].cells.filter((c) => c !== i).map((c) => val[c])));
        const opts = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !taken.has(d) && d !== val[i] && d !== alt[i]));
        // prefer extreme digits, which pin combinations down
        opts.sort((a, b) => Math.abs(b - 5) - Math.abs(a - 5));
        if (opts.length) { val[i] = opts[0]; moved = true; break; }
      }
      if (!moved) break;
    }
  }
  throw new Error('kakuro generation failed');
}

// ---------- killer cages (latin square with cage sums) ----------
function latin(rng, N) {
  const g = new Array(N * N).fill(0);
  function rec(i) {
    if (i === N * N) return true;
    const r = Math.floor(i / N), c = i % N;
    for (const d of shuffle(rng, [...Array(N)].map((_, k) => k + 1))) {
      let ok = true;
      for (let k = 0; k < N; k++) if (g[r * N + k] === d || g[k * N + c] === d) { ok = false; break; }
      if (!ok) continue;
      g[i] = d;
      if (rec(i + 1)) return true;
      g[i] = 0;
    }
    return false;
  }
  rec(0);
  return g;
}

function makeCages(rng, N, sol) {
  const cage = new Array(N * N).fill(-1);
  let id = 0;
  for (const start of shuffle(rng, [...Array(N * N).keys()])) {
    if (cage[start] >= 0) continue;
    const target = randInt(rng, 2, 5);
    const members = [start];
    cage[start] = id;
    while (members.length < target) {
      const frontier = [];
      for (const m of members) {
        const r = Math.floor(m / N), c = m % N;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
          const j = rr * N + cc;
          if (cage[j] < 0 && !members.some((x) => sol[x] === sol[j])) frontier.push(j);
        }
      }
      if (!frontier.length) break;
      const j = frontier[Math.floor(rng() * frontier.length)];
      cage[j] = id;
      members.push(j);
    }
    id++;
  }
  return cage;
}

function killerModel(N, sol, cage) {
  const cages = [];
  cage.forEach((k, i) => { (cages[k] ||= []).push(i); });
  const groups = [];
  for (let r = 0; r < N; r++) groups.push({ cells: [...Array(N)].map((_, c) => r * N + c), sum: null, line: true });
  for (let c = 0; c < N; c++) groups.push({ cells: [...Array(N)].map((_, r) => r * N + c), sum: null, line: true });
  const cageList = cages.filter(Boolean);
  for (const cells of cageList) groups.push({ cells: cells.slice().sort((a, b) => a - b), sum: cells.reduce((s, i) => s + sol[i], 0), cage: true });
  const cageOf = new Array(N * N);
  cageList.forEach((cells, k) => cells.forEach((i) => { cageOf[i] = k; }));
  return {
    kind: 'killer', size: N, maxD: N,
    cells: sol.map((v) => ({ kind: 'input', sol: v })),
    groups, cageOf,
  };
}

export function generateKiller(rng, N = 6) {
  // build a few unique candidates and keep the one that needs the fewest single-square cages
  let best = null, bestScore = Infinity;
  for (let k = 0; k < 8; k++) {
    const m = killerOnce(rng, N);
    if (!m) continue;
    const singles = m.groups.filter((g) => g.cage && g.cells.length === 1).length;
    if (singles < bestScore) { best = m; bestScore = singles; }
    if (singles <= 1) break;
  }
  if (!best) throw new Error('killer generation failed');
  return best;
}

function killerOnce(rng, N) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const sol = latin(rng, N);
    const cage = makeCages(rng, N, sol);
    let next = Math.max(...cage) + 1;
    for (let iter = 0; iter < 60; iter++) {
      const model = killerModel(N, sol, cage);
      const res = countSolutions(model, 2);
      if (res.count === 1 && !res.aborted) return model;
      if (res.aborted) break;
      const alt = res.sols.find((s) => s.some((v, i) => v !== sol[i]));
      const diffs = shuffle(rng, alt.map((v, i) => (v !== sol[i] ? i : -1)).filter((i) => i >= 0));
      // split the biggest disputed cage in two
      diffs.sort((a, b) => cage.filter((k) => k === cage[b]).length - cage.filter((k) => k === cage[a]).length);
      const i = diffs[0];
      const members = cage.map((k, j) => (k === cage[i] ? j : -1)).filter((j) => j >= 0);
      if (members.length === 1) break;
      // peel off the disputed cell plus (if possible) one neighbour so we avoid too many single givens
      cage[i] = next;
      const nb = members.find((j) => j !== i && Math.abs(Math.floor(j / N) - Math.floor(i / N)) + Math.abs((j % N) - (i % N)) === 1);
      const remaining = members.filter((j) => j !== i).length;
      if (nb !== undefined && remaining > 2 && rng() < 0.7) cage[nb] = next;
      next++;
      // keep cages contiguous: re-split any cage that fell apart
      relabelContiguous(cage, N);
      next = Math.max(...cage) + 1;
    }
  }
  return null;
}

function relabelContiguous(cage, N) {
  const seen = new Array(cage.length).fill(false);
  let id = 0;
  const out = new Array(cage.length);
  for (let s = 0; s < cage.length; s++) {
    if (seen[s]) continue;
    const stack = [s];
    seen[s] = true;
    while (stack.length) {
      const i = stack.pop();
      out[i] = id;
      const r = Math.floor(i / N), c = i % N;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        const j = rr * N + cc;
        if (!seen[j] && cage[j] === cage[i]) { seen[j] = true; stack.push(j); }
      }
    }
    id++;
  }
  out.forEach((v, i) => { cage[i] = v; });
}

// ---------- UI ----------
export function mount(el, ctx) {
  const { rng, params = {}, saved } = ctx;
  const killer = ctx.variant === 'killer-cage' || ctx.variant === 'killer';
  const diff = params.difficulty || 'hard';
  const model = saved?.model || (killer
    ? generateKiller(rng, params.size || KILLER_SIZES[diff] || 6)
    : generateKakuro(rng, params.size || SIZES[diff] || 8));
  const N = model.size;
  const maxD = model.maxD;
  const values = saved?.values || model.cells.map(() => 0);
  const notes = saved?.notes || model.cells.map(() => 0);
  const inputs = model.cells.map((c, i) => (c.kind === 'input' ? i : -1)).filter((i) => i >= 0);
  const of = cellGroups(model);
  let sel = inputs.find((i) => !values[i]) ?? inputs[0];
  let pencil = false;
  let solved = false;

  const grid = h('div', { class: `kk-grid${killer ? ' kk-killer' : ''}`, role: 'grid', 'aria-label': killer ? 'Killer cage grid' : 'Kakuro grid' });
  grid.style.setProperty('--kk-n', N);
  const cellEls = model.cells.map((c, i) => {
    if (c.kind === 'block') {
      const b = h('div', { class: `kk-block${c.a || c.d ? ' has-clue' : ''}`, 'aria-hidden': c.a || c.d ? null : 'true' });
      if (c.a || c.d) {
        b.append(h('span', { class: 'kk-diag', 'aria-hidden': 'true' }));
        if (c.a) b.append(h('span', { class: 'kk-a', title: `Across sum ${c.a}` }, String(c.a)));
        if (c.d) b.append(h('span', { class: 'kk-d', title: `Down sum ${c.d}` }, String(c.d)));
      }
      grid.append(b);
      return b;
    }
    const r = Math.floor(i / N), col = i % N;
    const btn = h('button', { class: 'kk-cell', role: 'gridcell', 'aria-label': `Row ${r + 1} column ${col + 1}`, onclick: () => select(i) });
    if (killer) {
      const k = model.cageOf[i];
      const same = (j) => j >= 0 && j < N * N && model.cageOf[j] === k;
      if (!(r > 0 && same(i - N))) btn.classList.add('ct');
      if (!(r < N - 1 && same(i + N))) btn.classList.add('cb');
      if (!(col > 0 && same(i - 1))) btn.classList.add('cl');
      if (!(col < N - 1 && same(i + 1))) btn.classList.add('cr');
      const cageGroup = model.groups.find((g) => g.cage && g.cells[0] === i);
      if (cageGroup) btn.append(h('span', { class: 'kk-cage-sum' }, String(cageGroup.sum)));
    }
    btn.append(h('span', { class: 'kk-val' }));
    grid.append(btn);
    return btn;
  });

  const pencilBtn = h('button', { class: 'btn btn--small', 'aria-pressed': 'false', onclick: () => togglePencil() }, 'Pencil marks');
  const clearBtn = h('button', { class: 'btn btn--small', onclick: () => { clearNotesHere(); } }, 'Clear marks');
  const pad = h('div', { class: 'kk-pad' },
    [...Array(maxD)].map((_, k) => h('button', { class: 'btn', onclick: () => input(k + 1) }, String(k + 1))),
    h('button', { class: 'btn kk-erase', onclick: () => input(0), 'aria-label': 'Erase' }, 'Erase'));
  const helper = h('div', { class: 'kk-help doc', 'aria-live': 'polite' });
  const status = h('p', { class: 'feedback' });

  el.append(
    h('p', { class: 'game-rules' }, killer
      ? `Fill every square with 1 to ${N} so no digit repeats in a row or column. The digits in each dashed cage add up to its small number and never repeat inside the cage. Arrow keys move, numbers fill, P toggles pencil marks.`
      : 'Fill every white square with 1 to 9. Each run of squares adds up to the clue on its left (across) or above it (down), and no digit repeats within a run. Arrow keys move, numbers fill, P toggles pencil marks.'),
    h('div', { class: 'kk-wrap' }, grid,
      h('div', { class: 'kk-side' }, h('div', { class: 'game-toolbar' }, pencilBtn, clearBtn), pad, helper)),
    status,
  );

  function togglePencil() {
    pencil = !pencil;
    pencilBtn.setAttribute('aria-pressed', String(pencil));
  }
  function clearNotesHere() {
    if (sel == null) return;
    notes[sel] = 0;
    render(); persist();
  }
  function select(i) { sel = i; sfx.click(); render(); }

  function input(n) {
    if (solved || sel == null || model.cells[sel].kind !== 'input' || model.cells[sel].locked) return;
    sfx.key();
    if (pencil && n) notes[sel] ^= 1 << n;
    else {
      values[sel] = n;
      notes[sel] = 0;
      if (n) for (const g of of[sel]) for (const c of model.groups[g].cells) notes[c] &= ~(1 << n);
    }
    render(); persist(); check();
  }

  function groupState(g) {
    const G = model.groups[g];
    let used = 0, sum = 0, cnt = 0, dup = false;
    for (const c of G.cells) {
      const v = values[c];
      if (!v) continue;
      if (used & (1 << v)) dup = true;
      used |= 1 << v; sum += v; cnt++;
    }
    const full = cnt === G.cells.length;
    const badSum = G.sum != null && (full ? sum !== G.sum : sum >= G.sum && cnt < G.cells.length);
    return { used, sum, cnt, dup, badSum, full };
  }

  function render() {
    const states = model.groups.map((_, g) => groupState(g));
    const selGroups = sel != null ? of[sel] : [];
    const peers = new Set(selGroups.flatMap((g) => model.groups[g].cells));
    for (const i of inputs) {
      const b = cellEls[i];
      const v = values[i];
      const bad = of[i].some((g) => (states[g].dup && model.groups[g].cells.some((c) => c !== i && values[c] === v && v)) || (states[g].badSum && v));
      b.classList.toggle('is-sel', i === sel);
      b.classList.toggle('is-peer', peers.has(i) && i !== sel);
      b.classList.toggle('is-bad', !!bad);
      b.classList.toggle('is-locked', !!model.cells[i].locked);
      const span = b.querySelector('.kk-val');
      if (v) { span.className = 'kk-val'; span.textContent = v; } else if (notes[i]) {
        span.className = 'kk-val kk-notes';
        span.innerHTML = [...Array(9)].map((_, k) => `<i>${notes[i] & (1 << (k + 1)) ? k + 1 : ''}</i>`).join('');
      } else { span.className = 'kk-val'; span.textContent = ''; }
      b.setAttribute('aria-label', `Row ${Math.floor(i / N) + 1} column ${(i % N) + 1}${v ? `, ${v}` : ', empty'}`);
    }
    // combination helper for the selected square
    helper.innerHTML = '';
    if (sel == null) return;
    for (const g of selGroups) {
      const G = model.groups[g];
      if (G.sum == null) continue;
      const st = states[g];
      const label = killer ? `Cage of ${G.cells.length}, total ${G.sum}` : `${G.dir === 'a' ? 'Across' : 'Down'}: ${G.sum} in ${G.cells.length}`;
      const lim = (1 << (maxD + 1)) - 2;
      const combos = (COMBOS[G.cells.length][G.sum] || []).filter((m) => (m & ~lim) === 0);
      const row = h('div', { class: 'kk-help-row' }, h('b', {}, label));
      const list = h('span', { class: 'kk-combos' });
      for (const m of combos) {
        const fits = (m & st.used) === st.used && !st.dup;
        list.append(h('span', { class: `kk-combo${fits ? '' : ' is-out'}` }, bits(m).join('')));
      }
      row.append(list);
      helper.append(row);
    }
  }

  function correctCount() { return inputs.filter((i) => values[i] === model.cells[i].sol).length; }

  function check() {
    ctx.onProgress(correctCount() / inputs.length);
    if (inputs.every((i) => values[i] === model.cells[i].sol)) {
      if (!solved) {
        solved = true;
        status.textContent = killer ? 'Every cage balances. The books are square.' : 'Every run adds up. The ledger balances.';
        status.className = 'feedback is-good';
        sfx.solve();
        ctx.onSolved();
      }
    } else if (inputs.every((i) => values[i])) {
      status.textContent = 'The grid is full but the sums do not hold. Red squares break a rule.';
      status.className = 'feedback is-bad';
      sfx.bad();
    } else { status.textContent = ''; status.className = 'feedback'; }
  }

  function persist() { ctx.onSave({ model, values, notes }); }

  function moveSel(dr, dc) {
    if (sel == null) return;
    let r = Math.floor(sel / N), c = sel % N;
    for (let k = 0; k < N; k++) {
      r = (r + dr + N) % N; c = (c + dc + N) % N;
      if (model.cells[r * N + c].kind === 'input') { sel = r * N + c; break; }
    }
    render();
  }

  const onKey = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[1-9]$/.test(e.key) && Number(e.key) <= maxD) input(Number(e.key));
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') input(0);
    else if (e.key === 'p' || e.key === 'P') togglePencil();
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const [dr, dc] = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      moveSel(dr, dc);
    }
  };
  document.addEventListener('keydown', onKey);
  render();
  check();
  persist();

  return {
    destroy: () => document.removeEventListener('keydown', onKey),
    hint() {
      if (solved) return null;
      const wrong = inputs.find((i) => values[i] && values[i] !== model.cells[i].sol);
      if (wrong != null) {
        const was = values[wrong];
        values[wrong] = model.cells[wrong].sol;
        model.cells[wrong].locked = true;
        sel = wrong;
        render(); persist(); check();
        return `The ${was} in row ${Math.floor(wrong / N) + 1}, column ${(wrong % N) + 1} was wrong. The lab corrected it to ${values[wrong]}.`;
      }
      // reveal the empty square with the fewest possibilities
      let best = null, bestN = 99;
      for (const i of inputs) {
        if (values[i]) continue;
        let m = (1 << (maxD + 1)) - 2;
        for (const g of of[i]) {
          const G = model.groups[g], st = groupState(g);
          if (G.sum == null) m &= ~st.used;
          else { const a = allowedFor(G.cells.length, G.sum, st.used, st.sum, st.cnt, maxD); m &= a < 0 ? 0 : a; }
        }
        const n = popcount(m) || 99;
        if (n < bestN) { bestN = n; best = i; }
      }
      if (best == null) return null;
      values[best] = model.cells[best].sol;
      model.cells[best].locked = true;
      sel = best;
      render(); persist(); check();
      return `The lab pencilled in one square for you: row ${Math.floor(best / N) + 1}, column ${(best % N) + 1} is ${values[best]}.`;
    },
    devSolve() {
      for (const i of inputs) values[i] = model.cells[i].sol;
      render(); persist(); check();
    },
  };
}
