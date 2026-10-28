// Node tests for the Foot Chase rules (src/games/pursuit-logic.js).
// Run: node scripts/pursuit-logic.test.mjs
import assert from 'node:assert/strict';
import { mulberry32 } from '../src/core/rng.js';
import {
  DIFF, PHYS, FAIR, createGenerator, createRun, answers, requiredTime, fastest, revealDist, laneX,
} from '../src/games/pursuit-logic.js';

const KEYS = ['easy', 'medium', 'hard'];
let failures = 0;
function test(name, fn) {
  try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.log(`FAIL ${name}\n     ${e.message}`); }
}

// ---- generator ----------------------------------------------------------------------------
for (const k of KEYS) {
  test(`${k}: 5000 rows, every row has an answer and fair spacing`, () => {
    const d = DIFF[k];
    for (const seed of [1, 2, 3]) {
      const gen = createGenerator(mulberry32(seed * 7919), k);
      let prev = { lanes: [null, null, null] }, prevDist = 0;
      const counts = {};
      let pickups = 0, thrown = 0;
      for (let i = 0; i < 5000; i++) {
        const r = gen.next();
        counts[r.pattern] = (counts[r.pattern] || 0) + 1;
        assert.ok(answers(r).length > 0, `row ${i} has no answer: ${JSON.stringify(r.lanes.map((o) => o && o.type))}`);
        assert.ok(r.lanes.some(Boolean), `row ${i} is empty`);
        const gap = r.dist - prevDist;
        const v = fastest(d);
        const need = requiredTime(prev, r, d.reaction) * v;
        assert.ok(gap >= need, `row ${i}: ${gap.toFixed(2)} m from the last row, ${need.toFixed(2)} m needed at ${v} m/s`);
        assert.ok(gap >= d.spacing[0] - 1e-6, `row ${i}: spacing ${gap} below the minimum`);
        if (r.pickup >= 0) { pickups++; assert.equal(r.lanes[r.pickup], null, 'a cup sits in a free lane'); }
        if (r.thrown) {
          thrown++;
          assert.equal(r.lanes.filter(Boolean).length, 1, 'a thrown row blocks one lane');
          assert.equal(r.lanes.find(Boolean).type, 'low', 'a thrown obstacle can always be jumped');
          const window = revealDist(v) / v; // seconds from reveal to arrival at full sprint
          assert.ok(window >= d.reaction + 2 * PHYS.laneT + FAIR.lead[1], `thrown row ${i}: ${window.toFixed(2)} s to react`);
        }
        prev = r; prevDist = r.dist;
      }
      assert.ok(pickups > 300, `cups appear (${pickups})`);
      assert.ok(thrown > 300, `thrown obstacles appear (${thrown})`);
      if (seed === 1) console.log(`     ${k} patterns: ${Object.entries(counts).map(([p, n]) => `${p} ${n}`).join(', ')}; mean spacing ${(prevDist / 5000).toFixed(1)} m`);
    }
  });
}

// ---- a bot that plays by the same rules a person does --------------------------------------
// It reacts to a row only `reaction` seconds after clearing the one before (or after a thrown
// obstacle appears), takes the nearest answer, and presses jump/slide at the last moment.
function makeBot(run, { failEvery = 0 } = {}) {
  const d = run.d;
  let waitUntil = 0, lastDone = 0, planned = null, plannedFor = -1, obstacleRows = 0;
  const pressed = new Set();
  return function step() {
    const next = run.rows.find((r) => !r.done && !r.hidden);
    if (!next) return;
    const passed = run.rowsPassed;
    if (passed !== lastDone) { lastDone = passed; waitUntil = run.t + d.reaction; }
    if (plannedFor !== next.id) {
      plannedFor = next.id;
      planned = null;
      if (next.lanes.some(Boolean)) obstacleRows++;
      if (failEvery && next.lanes.some(Boolean) && obstacleRows % failEvery === 0) {
        // walk into the first obstacle lane and do nothing
        const L = next.lanes.findIndex(Boolean);
        planned = { lane: L, act: -1 };
      }
    }
    if (run.t < waitUntil && !planned?.locked) return;
    if (!planned) {
      let best = null, bestCost = Infinity;
      for (const a of answers(next)) {
        const cost = Math.abs(a.lane - run.lane) * 10 + a.act + (next.pickup === a.lane ? -0.5 : 0);
        if (cost < bestCost) { bestCost = cost; best = a; }
      }
      planned = best;
    }
    planned.locked = true;
    while (run.lane < planned.lane) run.input('right');
    while (run.lane > planned.lane) run.input('left');
    const tt = (next.dist - run.dist) / run.speed;
    const key = `${next.id}`;
    if (planned.act === 1 && tt <= 0.3 && !pressed.has(key)) { pressed.add(key); run.input('jump'); }
    if (planned.act === 2 && tt <= 0.2 && !pressed.has(key)) { pressed.add(key); run.input('slide'); }
  };
}

function play(k, { seed = 11, failEvery = 0, gap, maxT = 400, dt = 1 / 60 } = {}) {
  const run = createRun({ difficulty: k, rng: mulberry32(seed), gap });
  const bot = makeBot(run, { failEvery });
  while (run.status === 'run' && run.t < maxT) {
    bot();
    run.step(dt);
    run.events.length = 0;
  }
  return run;
}

for (const k of KEYS) {
  test(`${k}: a bot with ${DIFF[k].reaction}s reaction clears 5000 rows without a single hit`, () => {
    for (const seed of [5, 6]) {
      const run = createRun({ difficulty: k, rng: mulberry32(seed), gap: 1e9 });
      const bot = makeBot(run);
      let steps = 0;
      while (run.rowsPassed < 5000) {
        bot();
        run.step(1 / 60);
        for (const e of run.events) if (e.type === 'hit') throw new Error(`hit at row ${e.row.id} (${e.row.pattern}, lanes ${e.row.lanes.map((o) => o && o.type)}) lane ${e.lane}, t=${run.t.toFixed(1)}`);
        run.events.length = 0;
        if (++steps > 2e6) throw new Error('bot stuck');
      }
      assert.equal(run.hits, 0);
    }
  });
}

const TARGET = { easy: 45, medium: 70, hard: 100 };
for (const k of KEYS) {
  test(`${k}: a perfect run catches the suspect within ${TARGET[k]} s`, () => {
    const times = [];
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const run = play(k, { seed });
      assert.equal(run.status, 'caught', `seed ${seed}: ${run.status} at gap ${run.gap.toFixed(1)}`);
      assert.equal(run.hits, 0);
      assert.ok(run.t <= TARGET[k], `seed ${seed}: caught after ${run.t.toFixed(1)} s`);
      times.push(run.t);
    }
    console.log(`     ${k} perfect catch: ${Math.min(...times).toFixed(1)}..${Math.max(...times).toFixed(1)} s`);
  });
}

test('easy: hitting every 4th obstacle still catches him, in about a minute', () => {
  const times = [];
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const run = play('easy', { seed, failEvery: 4 });
    assert.equal(run.status, 'caught', `seed ${seed}: ${run.status}, gap ${run.gap.toFixed(1)}, hits ${run.hits}`);
    assert.ok(run.hits >= 3, `seed ${seed}: only ${run.hits} hits`);
    assert.ok(run.t <= 70, `seed ${seed}: ${run.t.toFixed(1)} s`);
    times.push(run.t);
  }
  console.log(`     easy, every 4th hit: ${Math.min(...times).toFixed(1)}..${Math.max(...times).toFixed(1)} s`);
});

test('medium and hard: hitting every 2nd obstacle loses him (the gap matters)', () => {
  for (const k of ['medium', 'hard']) {
    const run = play(k, { seed: 3, failEvery: 2 });
    assert.notEqual(run.status, 'caught', `${k} with every 2nd obstacle hit still caught him`);
  }
});

test('a run that hits everything loses him, never catches', () => {
  const run = createRun({ difficulty: 'easy', rng: mulberry32(9) });
  let lastP = 0;
  while (run.status === 'run' && run.t < 300) {
    // stand in a blocked lane whenever there is one
    const next = run.rows.find((r) => !r.done && !r.hidden);
    const L = next ? next.lanes.findIndex((o) => o && o.type === 'block') : -1;
    if (L >= 0) { while (run.lane < L) run.input('right'); while (run.lane > L) run.input('left'); }
    run.step(1 / 60);
    run.events.length = 0;
    lastP = Math.max(lastP, run.closed());
  }
  assert.equal(run.status, 'lost');
  assert.ok(lastP < 1);
});

test('controls: jump clears a low obstacle, slide passes a high one, lane change dodges a block', () => {
  for (const [type, act] of [['low', 'jump'], ['high', 'slide'], ['block', 'left']]) {
    const run = createRun({ difficulty: 'easy', rng: mulberry32(1) });
    const row = run.rows[0];
    row.lanes = [null, { type, variant: 0, hit: false }, null];
    row.pickup = -1; row.thrown = false; row.hidden = false;
    let did = false;
    while (!row.done) {
      const tt = (row.dist - run.dist) / run.speed;
      if (!did && tt < (act === 'jump' ? 0.3 : act === 'slide' ? 0.2 : 0.4)) { run.input(act); did = true; }
      run.step(1 / 60);
    }
    assert.equal(run.hits, 0, `${type} with ${act}`);
    const run2 = createRun({ difficulty: 'easy', rng: mulberry32(1) });
    const row2 = run2.rows[0];
    row2.lanes = [null, { type, variant: 0, hit: false }, null];
    row2.pickup = -1; row2.thrown = false; row2.hidden = false;
    while (!row2.done) run2.step(1 / 60);
    assert.equal(run2.hits, 1, `${type} with no input hits`);
  }
});

test('input buffering: a jump pressed just before landing fires on landing', () => {
  const run = createRun({ difficulty: 'easy', rng: mulberry32(1) });
  run.input('jump');
  while (!(run.vy < 0 && run.y < 0.4)) run.step(1 / 60);
  run.input('jump'); // still in the air
  let jumps = 0;
  for (let i = 0; i < 30; i++) { run.step(1 / 60); for (const e of run.events) if (e.type === 'jump') jumps++; run.events.length = 0; }
  assert.ok(jumps >= 1, 'buffered jump fired');
});

test('hint slip and stumble arithmetic', () => {
  const run = createRun({ difficulty: 'medium', rng: mulberry32(2) });
  const g = run.gap;
  run.slip(10);
  assert.equal(run.gap, g - 10);
  run.gap = 5; run.slip(10);
  assert.equal(run.gap, 1.5, 'a slip never catches him by itself');
  assert.ok(laneX(0) < 0 && laneX(2) > 0);
});

console.log(failures ? `\n${failures} failing` : '\nall passed');
process.exit(failures ? 1 : 0);
