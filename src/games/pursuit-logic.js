// Foot Chase: the rules, with no rendering. Used by pursuit.js (3D and 2D views) and by the node
// tests in scripts/pursuit-logic.test.mjs.
//
// The world is a straight lane running forward. `dist` is metres travelled. Three lanes, 0..2
// (left, middle, right). Rows of obstacles sit at fixed distances; every row has at least one
// answer (a free lane, a low thing to jump, or a high thing to slide under), and consecutive rows
// are spaced so that a player can get from any answer of one row to an answer of the next with a
// human reaction time, at the fastest speed the player can be running there.
//
// The chase itself is a gap in metres: running clean closes it, stumbling opens it, and a sprint
// (a cup of teh tarik) closes it faster for a few seconds. Gap <= 0 is the catch; gap > maxGap and
// he is gone.

export const LANES = 3;
export const LANE_W = 2.2; // metres between lane centres
export const laneX = (lane) => (lane - 1) * LANE_W;

export const PHYS = {
  jumpT: 0.62, // seconds in the air
  jumpH: 1.25, // apex height, m
  lowClear: 0.45, // feet above this clear a low obstacle
  slideT: 0.72, // seconds of a slide
  laneT: 0.16, // seconds to move one lane
  buffer: 0.3, // an early jump/slide press is kept this long
  stumbleSpeed: 0.62, // speed factor while stumbling
  sprintSpeed: 1.12, // speed factor while sprinting
  dropV: 16, // fast fall when sliding in the air, m/s
  grace: 0.35, // extra seconds of no-penalty after a stumble ends
};
const G = (8 * PHYS.jumpH) / (PHYS.jumpT * PHYS.jumpT);
const JUMP_V = (4 * PHYS.jumpH) / PHYS.jumpT;

// timing used by the fairness rule
export const FAIR = {
  tail: 0.36, // after clearing a row with a jump or slide, the body is still busy this long
  lead: { 0: 0, 1: 0.32, 2: 0.22 }, // a jump (1) or slide (2) must start this early
  margin: 1.12, // spacing safety factor
};

export const DIFF = {
  easy: {
    v0: 11, vmax: 14, ramp: 700,
    gap: 40, maxGap: 76, close: 1.0, hitCost: 2.5, drift: 1.0, stumbleT: 0.8,
    sprintT: 3, sprintClose: 2.2,
    spacing: [26, 36], reaction: 0.6, first: 58,
    patterns: { single: 5, double: 4, spanLow: 1, spanHigh: 1, wall: 0, mixed: 0.5 },
    pickupEvery: [5, 8], throwEvery: [7, 11],
  },
  medium: {
    v0: 13, vmax: 17, ramp: 900,
    gap: 50, maxGap: 88, close: 0.95, hitCost: 4, drift: 1.4, stumbleT: 0.95,
    sprintT: 3, sprintClose: 2.0,
    spacing: [21, 30], reaction: 0.5, first: 62,
    patterns: { single: 3, double: 4, spanLow: 1, spanHigh: 1, wall: 1, mixed: 1 },
    pickupEvery: [6, 9], throwEvery: [6, 10],
  },
  hard: {
    v0: 15, vmax: 20, ramp: 1100,
    gap: 80, maxGap: 118, close: 0.9, hitCost: 5.5, drift: 1.8, stumbleT: 1.05,
    sprintT: 2.5, sprintClose: 1.8,
    spacing: [17, 25], reaction: 0.42, first: 66,
    patterns: { single: 2, double: 4, spanLow: 1, spanHigh: 1, wall: 2, mixed: 1.5 },
    pickupEvery: [7, 10], throwEvery: [5, 8],
  },
};
export const diffOf = (k) => DIFF[k] || DIFF.easy;

/** Running speed at a distance, before stumbles and sprints. */
export function speedAt(d, dist) {
  return d.v0 + (d.vmax - d.v0) * Math.min(1, Math.max(0, dist) / d.ramp);
}
/** The fastest the player can possibly be running anywhere (spacing is planned for this). */
export const fastest = (d) => d.vmax * PHYS.sprintSpeed;
/** How far ahead a thrown obstacle becomes visible. */
export const revealDist = (v) => Math.max(26, v * 2);

// ---- rows ---------------------------------------------------------------------------------
// row.lanes[i]: null (free) or { type: 'low' | 'high' | 'block', variant, hit, slot }
// row.span: one object covers all three lanes (all low or all high)
// row.pickup: lane of a teh tarik cup, or -1
// row.thrown: the suspect knocks this one into the lane (hidden until revealDist)

const ACT = { low: 1, high: 2 };
/** The answers of a row: [{ lane, act }] with act 0 run through, 1 jump, 2 slide. */
export function answers(row) {
  const out = [];
  for (let i = 0; i < LANES; i++) {
    const o = row.lanes[i];
    if (!o) out.push({ lane: i, act: 0 });
    else if (o.type !== 'block') out.push({ lane: i, act: ACT[o.type] });
  }
  return out;
}

/** Seconds needed between crossing row a and reaching row b, for the worst answer taken at a. */
export function requiredTime(a, b, reaction) {
  const A = answers(a), B = answers(b);
  if (!B.length) return Infinity;
  let worst = 0;
  for (const x of A) {
    let best = Infinity;
    for (const y of B) {
      const t = reaction + Math.max(x.act ? FAIR.tail : 0, Math.abs(x.lane - y.lane) * PHYS.laneT) + FAIR.lead[y.act];
      if (t < best) best = t;
    }
    if (best > worst) worst = best;
  }
  return worst;
}

/** The start: the player stands in the middle lane, free. */
const START_ROW = { lanes: [null, null, null], pickup: -1 };

function weighted(rng, table) {
  let sum = 0;
  for (const k in table) sum += table[k];
  let r = rng() * sum;
  for (const k in table) { r -= table[k]; if (r <= 0) return k; }
  return Object.keys(table)[0];
}
const ri = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const ob = (rng, type) => ({ type, variant: Math.floor(rng() * 6), hit: false, slot: -1, anim: 0 });
const TYPES = ['low', 'high', 'block'];

/** A stream of rows. gen.next() returns the next row, spaced fairly from the one before. */
export function createGenerator(rng, diffKey) {
  const d = diffOf(diffKey);
  let dist = d.first;
  let prev = START_ROW;
  let id = 0;
  let untilPickup = ri(rng, d.pickupEvery[0], d.pickupEvery[1]);
  let untilThrow = ri(rng, d.throwEvery[0], d.throwEvery[1]);
  let lastSpan = 0;

  function build() {
    const lanes = [null, null, null];
    const row = { id: ++id, dist: 0, lanes, span: false, pickup: -1, thrown: false, hidden: false, done: false, pattern: '' };
    if (--untilThrow <= 0 && id > 2) {
      untilThrow = ri(rng, d.throwEvery[0], d.throwEvery[1]);
      lanes[ri(rng, 0, 2)] = ob(rng, 'low');
      row.thrown = true;
      row.hidden = true;
      row.pattern = 'thrown';
      return row;
    }
    let p = weighted(rng, d.patterns);
    if ((p === 'spanLow' || p === 'spanHigh') && id - lastSpan < 3) p = 'double';
    row.pattern = p;
    if (p === 'single') {
      lanes[ri(rng, 0, 2)] = ob(rng, TYPES[ri(rng, 0, 2)]);
    } else if (p === 'double') {
      const free = ri(rng, 0, 2);
      for (let i = 0; i < 3; i++) if (i !== free) lanes[i] = ob(rng, rng() < 0.55 ? 'block' : TYPES[ri(rng, 0, 1)]);
    } else if (p === 'spanLow' || p === 'spanHigh') {
      const t = p === 'spanLow' ? 'low' : 'high';
      const o = ob(rng, t);
      for (let i = 0; i < 3; i++) lanes[i] = i === 1 ? o : { ...o, slot: -1, ref: o };
      row.span = true;
      lastSpan = id;
    } else if (p === 'wall') {
      // two blockers and one lane you have to jump or slide through
      const gate = ri(rng, 0, 2);
      for (let i = 0; i < 3; i++) lanes[i] = ob(rng, i === gate ? TYPES[ri(rng, 0, 1)] : 'block');
    } else { // mixed: three lanes of low and high, no blockers
      for (let i = 0; i < 3; i++) lanes[i] = ob(rng, TYPES[ri(rng, 0, 1)]);
    }
    if (--untilPickup <= 0) {
      const free = [];
      for (let i = 0; i < 3; i++) if (!lanes[i]) free.push(i);
      if (free.length) { row.pickup = free[ri(rng, 0, free.length - 1)]; untilPickup = ri(rng, d.pickupEvery[0], d.pickupEvery[1]); }
      else untilPickup = 1;
    }
    return row;
  }

  return {
    next() {
      const row = build();
      const v = fastest(d);
      const base = d.spacing[0] + rng() * (d.spacing[1] - d.spacing[0]);
      const need = requiredTime(prev, row, d.reaction) * v * FAIR.margin;
      dist += Math.max(base, need);
      row.dist = Math.round(dist * 100) / 100;
      prev = row;
      return row;
    },
  };
}

// ---- the run ------------------------------------------------------------------------------

/** How far ahead the suspect is drawn for a given gap (the view compresses long gaps). */
export const aheadFor = (gap) => 1.6 + 27 * (1 - Math.exp(-Math.max(0, gap) / 30));

/**
 * One attempt. opts: { difficulty, rng, gap (start gap), view (metres of rows kept ahead) }.
 * Call input(action) with 'left' | 'right' | 'jump' | 'slide', step(dt) every frame.
 * run.events collects { type, row?, lane? } (hit, brush, pickup, throw, edge, jump, slide, land,
 * caught, lost); the caller empties it.
 */
export function createRun({ difficulty = 'easy', rng, gap, view = 150, hooks = {} } = {}) {
  const d = diffOf(difficulty);
  const gen = createGenerator(rng, difficulty);
  const startGap = Number.isFinite(gap) && gap > 0 ? gap : d.gap;
  const run = {
    d, difficulty, startGap, maxGap: Math.max(d.maxGap, startGap + 20),
    t: 0, dist: 0, speed: d.v0,
    lane: 1, x: 0, y: 0, vy: 0, air: false, slideT: 0, stumbleT: 0, graceT: 0, sprintT: 0,
    buffered: null, bufferedUntil: 0,
    gap: startGap, best: startGap, status: 'run', hits: 0, rowsPassed: 0,
    rows: [], events: [],
    suspect: { ahead: aheadFor(startGap), x: 0, lane: 1, y: 0, vy: 0, air: false, slideT: 0 },
  };
  const emit = (type, row = null, lane = -1) => { run.events.push({ type, row, lane }); };

  function fill() {
    let last = run.rows.length ? run.rows[run.rows.length - 1].dist : 0;
    while (last < run.dist + view) {
      const r = gen.next();
      run.rows.push(r);
      hooks.onRowAdd?.(r);
      last = r.dist;
    }
  }
  fill();

  function jump() {
    run.slideT = 0;
    run.air = true;
    run.vy = JUMP_V;
    emit('jump');
  }
  function doAct(a) {
    if (a === 'jump') {
      if (!run.air) jump();
      else { run.buffered = 'jump'; run.bufferedUntil = run.t + PHYS.buffer; }
    } else if (a === 'slide') {
      if (run.air) { run.vy = Math.min(run.vy, -PHYS.dropV); run.buffered = 'slide'; run.bufferedUntil = run.t + PHYS.buffer + 0.2; } else { run.slideT = PHYS.slideT; emit('slide'); }
    }
  }

  run.input = (a) => {
    if (run.status !== 'run') return;
    if (a === 'left' || a === 'right') {
      const n = run.lane + (a === 'left' ? -1 : 1);
      if (n < 0 || n > 2) { emit('edge'); return; }
      run.lane = n;
    } else doAct(a);
  };

  /** The lane the body counts as being in: the target lane once most of the way there. */
  run.hitLane = () => {
    const tx = laneX(run.lane);
    if (Math.abs(run.x - tx) < LANE_W * 0.6) return run.lane;
    return Math.max(0, Math.min(2, Math.round(run.x / LANE_W) + 1));
  };

  function cross(row) {
    row.done = true;
    run.rowsPassed++;
    const L = run.hitLane();
    const o = row.lanes[L];
    let hit = false;
    if (o && !row.hidden) {
      if (o.type === 'block') hit = true;
      else if (o.type === 'low') hit = run.y < PHYS.lowClear;
      else hit = run.slideT <= 0 || run.air;
    }
    if (hit) {
      (o.ref || o).hit = true;
      if (run.graceT > 0) emit('brush', row, L);
      else {
        run.hits++;
        run.gap += d.hitCost;
        run.stumbleT = d.stumbleT;
        run.graceT = d.stumbleT + PHYS.grace;
        run.sprintT = 0;
        emit('hit', row, L);
      }
    } else if (row.pickup === L) {
      run.sprintT = d.sprintT;
      row.pickupTaken = true;
      emit('pickup', row, L);
    }
  }

  function moveSuspect(dt) {
    const s = run.suspect;
    s.ahead = aheadFor(run.gap);
    const at = run.dist + s.ahead;
    let next = null;
    for (let i = 0; i < run.rows.length; i++) { const r = run.rows[i]; if (r.dist > at - 0.5 && !r.hidden) { next = r; break; } }
    if (next) {
      // stay if this lane is free, else the nearest free lane, else the nearest jump/slide lane
      let best = -1, bestCost = 99;
      for (let i = 0; i < 3; i++) {
        const o = next.lanes[i];
        const cost = (o ? (o.type === 'block' ? 99 : 3) : 0) + Math.abs(i - s.lane) * 1.1;
        if (cost < bestCost) { bestCost = cost; best = i; }
      }
      if (best >= 0) s.lane = best;
      const o = next.lanes[s.lane];
      const tt = (next.dist - at) / Math.max(1, run.speed);
      if (o && o.type === 'low' && !s.air && tt < 0.3) { s.air = true; s.vy = JUMP_V * 0.9; }
      if (o && o.type === 'high' && s.slideT <= 0 && tt < 0.25) s.slideT = PHYS.slideT;
    }
    const tx = laneX(s.lane), k = (LANE_W / PHYS.laneT) * 0.75 * dt;
    s.x += Math.max(-k, Math.min(k, tx - s.x));
    if (s.air) { s.vy -= G * dt; s.y += s.vy * dt; if (s.y <= 0) { s.y = 0; s.vy = 0; s.air = false; } }
    if (s.slideT > 0) s.slideT -= dt;
  }

  run.step = (dt) => {
    if (run.status !== 'run') return;
    run.t += dt;
    const nominal = speedAt(d, run.dist);
    run.speed = nominal * (run.stumbleT > 0 ? PHYS.stumbleSpeed : 1) * (run.sprintT > 0 ? PHYS.sprintSpeed : 1);
    run.dist += run.speed * dt;
    // lateral
    const tx = laneX(run.lane), k = (LANE_W / PHYS.laneT) * dt;
    run.x += Math.max(-k, Math.min(k, tx - run.x));
    // vertical
    if (run.air) {
      run.vy -= G * dt;
      run.y += run.vy * dt;
      if (run.y <= 0) {
        run.y = 0; run.vy = 0; run.air = false;
        emit('land');
        if (run.buffered && run.t <= run.bufferedUntil) { const b = run.buffered; run.buffered = null; doAct(b); }
        run.buffered = null;
      }
    }
    if (run.slideT > 0) run.slideT = Math.max(0, run.slideT - dt);
    // rows: reveal thrown ones, cross, drop
    fill();
    const reveal = revealDist(nominal * PHYS.sprintSpeed);
    for (let i = 0; i < run.rows.length; i++) {
      const r = run.rows[i];
      if (r.hidden && r.dist - run.dist <= reveal) { r.hidden = false; emit('throw', r); }
      if (!r.done && r.dist <= run.dist) cross(r);
    }
    while (run.rows.length && run.rows[0].dist < run.dist - 22) { const r = run.rows.shift(); hooks.onRowDrop?.(r); }
    // the gap
    if (run.stumbleT > 0) run.gap += d.drift * dt;
    else run.gap -= (d.close + (run.sprintT > 0 ? d.sprintClose : 0)) * dt;
    if (run.stumbleT > 0) run.stumbleT = Math.max(0, run.stumbleT - dt);
    if (run.graceT > 0) run.graceT = Math.max(0, run.graceT - dt);
    if (run.sprintT > 0) run.sprintT = Math.max(0, run.sprintT - dt);
    if (run.gap < run.best) run.best = run.gap;
    moveSuspect(dt);
    if (run.gap <= 0) { run.gap = 0; run.best = 0; run.status = 'caught'; emit('caught'); } else if (run.gap > run.maxGap) { run.status = 'lost'; emit('lost'); }
  };

  /** The suspect slips: the gap shrinks (never straight to a catch). */
  run.slip = (m = 10) => { run.gap = Math.max(1.5, run.gap - m); if (run.gap < run.best) run.best = run.gap; };
  /** Fraction of the start gap closed, 0..1. */
  run.closed = () => Math.max(0, Math.min(1, (run.startGap - run.gap) / run.startGap));
  run.dispose = () => { while (run.rows.length) { const r = run.rows.shift(); hooks.onRowDrop?.(r); } };
  return run;
}
