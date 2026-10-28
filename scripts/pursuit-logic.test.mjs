// Node tests for the Foot Chase rules (src/games/pursuit-logic.js).
// Run: node scripts/pursuit-logic.test.mjs
import assert from 'node:assert/strict';
import { mulberry32 } from '../src/core/rng.js';
import {
  PHYS, FAIR, DIFF_KEYS, SETTING_LIST, legSpec, makeRoute, createGenerator, createRun, fastest, groundAt, STAIRS_LEN,
  modelNames, MODELS, rasterise, reachCells, NC, X_MAX, plan, spineAt, CORRIDOR, PR,
} from '../src/games/pursuit-logic.js';

let failures = 0;
function test(name, fn) {
  const t0 = Date.now();
  try { fn(); console.log(`ok   ${name} (${((Date.now() - t0) / 1000).toFixed(1)} s)`); } catch (e) { failures++; console.log(`FAIL ${name}\n     ${e.message}`); }
}
const LEGS = 6;
const take = (gen, metres) => { const a = []; for (;;) { const o = gen.next(); a.push(o); if (o.d > metres) return a; } };

// ---- the scatter: an independent check that a corridor always exists -----------------------
test('every stretch of every leg in every setting has a corridor >= 1.4 x body width at the leg\'s speed and turn rate', () => {
  let objects = 0;
  const kinds = {};
  for (const k of DIFF_KEYS) for (let leg = 0; leg < LEGS; leg++) for (const setting of SETTING_LIST) {
    const s = legSpec(k, leg, LEGS, setting);
    const gen = createGenerator(mulberry32(1000 + leg * 31 + setting.length * 7 + k.length), s);
    const objs = take(gen, 1200);
    objects += objs.length;
    for (const o of objs) kinds[o.piece?.name || o.type] = (kinds[o.piece?.name || o.type] || 0) + 1;
    const n = 1200;
    const grid = rasterise(objs, 0, n);
    const rc = reachCells(s.vx, fastest(s));
    let r = new Uint8Array(NC).fill(1);
    for (let j = 0; j < n; j++) {
      const nr = new Uint8Array(NC);
      let any = false;
      for (let i = 0; i < NC; i++) {
        if (grid[j * NC + i]) continue;
        for (let q = Math.max(0, i - rc); q <= Math.min(NC - 1, i + rc); q++) if (r[q]) { nr[i] = 1; any = true; break; }
      }
      assert.ok(any, `${k} leg ${leg + 1} ${setting}: no way through at ${j} m`);
      r = nr;
    }
    const v = fastest(s);
    for (const o of objs) {
      if (o.span && o.type !== 'stairs') {
        const a = o.d - v * (s.reaction + FAIR.lead + 0.3), b = o.d + v * (FAIR.tail + 0.2);
        const clash = objs.find((p) => p !== o && p.type !== 'puddle' && p.type !== 'cup' && !p.wall && p.d + p.len / 2 > a && p.d - p.len / 2 < b);
        assert.ok(!clash, `${k} ${setting}: ${o.model} at ${o.d.toFixed(0)} m has ${clash?.model} at ${clash?.d.toFixed(1)} m in its clear stretch`);
      }
      if (o.anim && o.anim.type !== 'shutter') assert.ok(o.reveal / v >= s.reaction + FAIR.tail + 0.5, `${k} ${setting}: ${o.model} settles too late`);
      assert.ok(o.model, 'every object has a model');
    }
    for (let i = 1; i < objs.length; i++) assert.ok(objs[i].d - objs[i].len / 2 >= objs[i - 1].d - objs[i - 1].len / 2 - 1e-6, 'objects come in order');
  }
  for (const name of ['block', 'low', 'high', 'puddle', 'cup', 'hurdle', 'thrown', 'mover', 'fall', 'gap', 'shutter', 'narrow', 'fork']) assert.ok(kinds[name] > 10, `${name} appears (${kinds[name] || 0})`);
  console.log(`     ${objects} objects: ${Object.entries(kinds).map(([a, b]) => `${a} ${b}`).join(', ')}; corridor ${CORRIDOR.toFixed(2)} m for a ${(2 * PR).toFixed(2)} m body`);
});

test('no rows, no templates: obstacles spread across the street at any x, density rises leg by leg', () => {
  const field = (o) => (o.type === 'block' || o.type === 'low' || o.type === 'high') && !o.span && !o.wall;
  for (const k of DIFF_KEYS) {
    // density over the scattered stretches (set-pieces keep their approaches clear)
    const density = (leg) => {
      const g = createGenerator(mulberry32(3), legSpec(k, leg, LEGS, 'city'));
      const objs = take(g, 1500).filter(field).filter((o) => !o.piece);
      const merged = [];
      for (const [a, b] of g.windows.filter(([a]) => a < 1500).sort((p, q) => p[0] - q[0])) { if (merged.length && a <= merged[merged.length - 1][1]) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], b); else merged.push([a, b]); }
      const clear = merged.reduce((t, [a, b]) => t + Math.max(0, Math.min(1500, b) - Math.max(0, a)), 0);
      return { objs, per100: (objs.length / (1500 - clear)) * 100 };
    };
    const d0 = density(0), d5 = density(LEGS - 1);
    assert.ok(d5.per100 > d0.per100 * 1.1, `${k}: ${d0.per100.toFixed(1)} obstacles per 100 m of scatter on leg 1, ${d5.per100.toFixed(1)} on leg ${LEGS}`);
    console.log(`     ${k}: ${d0.per100.toFixed(1)} -> ${d5.per100.toFixed(1)} obstacles per 100 m of scatter`);
    const first = d0.objs;
    const xs = new Set(first.map((o) => Math.round(o.x * 4)));
    assert.ok(xs.size > 20, `${k}: obstacles sit at many different x (${xs.size})`);
    const gaps = first.slice(1).map((o, i) => o.d - first[i].d);
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const sd = Math.sqrt(gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length);
    assert.ok(sd > mean * 0.5, `${k}: spacing varies (mean ${mean.toFixed(1)} m, sd ${sd.toFixed(1)})`);
    const a = legSpec(k, 0, LEGS), b = legSpec(k, LEGS - 1, LEGS);
    assert.ok(b.vmax > a.vmax && b.reaction < a.reaction && b.rmin < a.rmin && b.pieceRate > a.pieceRate, `${k}: the last leg is tighter`);
    const g0 = take(createGenerator(mulberry32(5), a), 1500);
    assert.ok(!g0.some((o) => ['narrow', 'fork', 'shutter', 'mover'].includes(o.piece?.name)), `${k}: leg 1 has no narrows, forks, shutters or movers yet`);
  }
});

// ---- a steering bot that plays like a person ------------------------------------------------
// It only sees what has been out of the fog (40 m) for its reaction time, steers toward a planned
// line at the game's turn rate, and jumps/slides at the last moment. A sloppy bot "zones out" now
// and then: it lets go of the controls and runs straight.
function playLeg(spec, seed, { gap, maxT = 1500, metres = 0, noHits = false, zoneEvery = 0, zoneFor = 1.4 } = {}) {
  const run = createRun({ spec, rng: mulberry32(seed), gap });
  let k = 0, zoned = 0, nextZone = zoneEvery;
  while (run.status === 'run' && run.t < maxT && (!metres || run.dist < metres)) {
    if (zoneEvery && run.t > nextZone) { zoned = zoneFor; nextZone = run.t + zoneEvery; }
    if (zoned > 0) { zoned -= 1 / 60; run.steer(0); }
    else if (k++ % 2 === 0) { const p = plan(run); run.steer(p.vx / run.spec.vx); if (p.act) run.input(p.act); }
    run.step(1 / 60);
    if (noHits) for (const e of run.events) if (e.type === 'hit') throw new Error(`${spec.key} leg ${spec.index + 1} ${spec.setting}: hit ${e.o.model} (${e.o.type}${e.o.span ? ', full width' : ''}${e.o.piece ? `, ${e.o.piece.name}` : ''}) at ${run.dist.toFixed(1)} m, x ${run.x.toFixed(2)} vs ${e.o.x.toFixed(2)} (w ${e.o.w})`);
    run.events.length = 0;
  }
  return run;
}

test('a steering bot with the leg\'s reaction time and turn rate clears every leg of every difficulty in every setting, never hit', () => {
  let metres = 0;
  for (const k of DIFF_KEYS) for (let leg = 0; leg < LEGS; leg++) for (const setting of SETTING_LIST) {
    const run = playLeg(legSpec(k, leg, LEGS, setting), 77 + leg * 3 + setting.length, { gap: 1e9, metres: 700, noHits: true });
    assert.equal(run.hits, 0);
    metres += run.dist;
  }
  console.log(`     ${(metres / 1000).toFixed(0)} km of scatter run without a hit`);
});

function chase(k, { seed = 1, setting = 'city', legs = LEGS, zoneEvery = 0 } = {}) {
  const route = makeRoute(setting, legs);
  let total = 0, retries = 0, hits = 0, shortcuts = 0;
  const per = [];
  for (let i = 0; i < legs; i++) {
    let tries = 0;
    for (;;) {
      const run = playLeg(legSpec(k, i, legs, route[i]), seed * 100 + i * 7 + tries, { zoneEvery });
      total += run.t; hits += run.hits; shortcuts += run.shortcuts;
      if (run.status === 'escaped' || run.status === 'caught') { per.push(run.t); assert.equal(run.status, i === legs - 1 ? 'caught' : 'escaped'); break; }
      assert.equal(run.status, 'lost', `${k} leg ${i + 1}: ${run.status} after ${run.t.toFixed(0)} s`);
      retries++;
      if (++tries > 6) throw new Error(`${k} leg ${i + 1} (${route[i]}): lost 7 times in a row`);
    }
  }
  return { total, retries, hits, shortcuts, per };
}
const BAND = { easy: [9, 12.5], medium: [13.5, 18.5], hard: [15.5, 21] }; // minutes of running, clean play
for (const k of DIFF_KEYS) {
  test(`${k}: a clean chase of ${LEGS} legs takes ${BAND[k][0]}-${BAND[k][1]} minutes and ends in the catch`, () => {
    for (const [seed, setting] of [[1, 'city'], [2, 'kampung']]) {
      const r = chase(k, { seed, setting });
      assert.equal(r.retries, 0); assert.equal(r.hits, 0);
      const min = r.total / 60;
      assert.ok(min >= BAND[k][0] && min <= BAND[k][1], `${setting}: ${min.toFixed(1)} min`);
      if (seed === 1) console.log(`     ${k}: ${min.toFixed(1)} min (legs ${r.per.map((t) => Math.round(t)).join(', ')} s), ${r.shortcuts} shortcuts`);
    }
  });
}

test('easy: a sloppy runner (lets go of the controls for 1.4 s every 10 s) still finishes without losing a leg', () => {
  const r = chase('easy', { seed: 3, zoneEvery: 10 });
  assert.equal(r.retries, 0, `lost ${r.retries} legs`);
  assert.ok(r.hits > 5, `only ${r.hits} stumbles`);
  console.log(`     easy, sloppy: ${(r.total / 60).toFixed(1)} min, ${r.hits} stumbles`);
});
test('medium: zoning out every 14 s is slower but fine; hard: zoning out every 5 s costs legs', () => {
  const m = chase('medium', { seed: 2, zoneEvery: 14 });
  console.log(`     medium, sloppy: ${(m.total / 60).toFixed(1)} min, ${m.hits} stumbles, ${m.retries} restarts`);
  assert.ok(m.total / 60 < 27);
  let lost = 0;
  for (let i = 0; i < LEGS; i++) if (playLeg(legSpec('hard', i, LEGS, 'city'), 40 + i, { zoneEvery: 5, zoneFor: 1.6 }).status === 'lost') lost++;
  console.log(`     hard, zoning out every 5 s: lost ${lost} of ${LEGS} legs`);
  assert.ok(lost >= 2, `hard, zoning out every 5 s, lost only ${lost} of ${LEGS} legs`);
});

// ---- mechanics ------------------------------------------------------------------------------
function rig(o) {
  const run = createRun({ spec: legSpec('easy', 0, 1), rng: mulberry32(1) });
  for (const p of run.objs) p.d += 1000; // move the scatter out of the way
  const ob = { id: 9999, d: 70, x: 0, w: 1.9, len: 0.5, hit: false, contact: false, reveal: 0, model: 'x', ...o };
  run.objs.unshift(ob);
  return { run, ob };
}
const runTo = (run, d, each) => { while (run.dist < d) { each?.(); run.step(1 / 60); } };
test('steering: held keys and targets move you at the turn rate, never off the street', () => {
  const { run } = rig({ x: 99 });
  run.steer(1);
  runTo(run, 30);
  assert.equal(run.x, X_MAX);
  run.steerTo(-1);
  const t0 = run.t;
  while (run.x > -0.99) run.step(1 / 60);
  const rate = (X_MAX + 1) / (run.t - t0);
  assert.ok(rate <= run.spec.vx * 1.05 && rate > run.spec.vx * 0.7, `turn rate ${rate.toFixed(2)} m/s`);
});
test('jump clears low things and gaps, slide passes high ones, steering round dodges a block', () => {
  for (const [type, act] of [['low', 'jump'], ['gap', 'jump'], ['high', 'slide'], ['block', 'steer']]) {
    const { run, ob } = rig({ type });
    let did = false;
    runTo(run, 75, () => {
      const tt = (ob.d - ob.len / 2 - run.dist) / run.speed;
      if (!did && act === 'jump' && tt < 0.26) { run.input('jump'); did = true; }
      if (!did && act === 'slide' && tt < 0.18) { run.input('slide'); did = true; }
      if (act === 'steer' && tt < 1.2) run.steerTo(2.2);
    });
    assert.equal(run.hits, 0, `${type} with ${act}`);
    const b = rig({ type });
    runTo(b.run, 75);
    assert.equal(b.run.hits, 1, `${type} with no input`);
  }
});
test('puddles slow you and cost a little, unless you jump them', () => {
  const { run } = rig({ type: 'puddle', w: 1.6, len: 2.2 });
  runTo(run, 75);
  assert.equal(run.hits, 0); assert.equal(run.splashes, 1);
});
test('walls push you out; a fork pays the side the suspect took', () => {
  const { run } = rig({ type: 'block', wall: true, x: 0, w: 1.6, len: 30, d: 85 });
  runTo(run, 80);
  assert.equal(run.hits, 1);
  assert.ok(Math.abs(run.x) >= 0.8 + PR, 'pushed out of the wall');
  const f = rig({ x: 99 });
  f.run.features.push({ type: 'fork', d0: 10, d1: 40, walls: [[-0.8, 0.8]], short: 1, bonus: 9, done: false });
  f.run.steer(1);
  const g = f.run.gap;
  runTo(f.run, 41);
  assert.equal(f.run.shortcuts, 1);
  assert.ok(f.run.gap < g - 8);
});
test('stairs lift the ground and bring it down again', () => {
  const f = [{ type: 'stairs', d0: 10, d1: 10 + STAIRS_LEN }];
  assert.equal(groundAt(f, 5), 0);
  assert.equal(groundAt(f, 10 + STAIRS_LEN / 2), PHYS.stairsH);
  assert.equal(groundAt(f, 11 + STAIRS_LEN), 0);
});
test('the suspect runs the spine: it stays clear of obstacles', () => {
  const s = legSpec('hard', 5, 6, 'market');
  const gen = createGenerator(mulberry32(4), s);
  const objs = take(gen, 800);
  let bad = 0;
  for (let d = 70; d < 760; d += 0.5) {
    const x = spineAt(gen.spine, d);
    if (objs.some((o) => !o.span && o.type !== 'puddle' && o.type !== 'cup' && Math.abs(o.d - d) < o.len / 2 && Math.abs(o.x - x) < o.w / 2)) bad++;
  }
  assert.ok(bad < 4, `${bad} spine points inside obstacles`);
});
test('hint: slip and skip; the last leg ends in a catch, the others in an escape; routes and models', () => {
  const run = createRun({ spec: legSpec('medium', 5, 6, 'city'), rng: mulberry32(2) });
  run.gap = 5; run.slip(10);
  assert.equal(run.gap, 1.5);
  let skipped = null;
  for (let i = 0; i < 6000 && !skipped; i++) { run.step(1 / 60); run.events.length = 0; skipped = run.skipPiece(); if (run.status !== 'run') { run.status = 'run'; run.gap = 50; } }
  assert.ok(skipped, 'a set-piece was skipped');
  const a = createRun({ spec: legSpec('easy', 0, 3), rng: mulberry32(1) }); a.gap = 0.01; a.step(0.1);
  assert.equal(a.status, 'escaped');
  const b = createRun({ spec: legSpec('easy', 2, 3), rng: mulberry32(1) }); b.gap = 0.01; b.step(0.1);
  assert.equal(b.status, 'caught');
  assert.deepEqual(makeRoute('heritage', 4), ['heritage', 'market', 'rooftop', 'heritage']);
  assert.deepEqual(makeRoute('city', 3, ['docks', 'nowhere', 'estate']), ['docks', 'estate', 'docks']);
  for (const st of SETTING_LIST) assert.ok(modelNames(st).length > 10 && MODELS[st]);
});

console.log(failures ? `\n${failures} failing` : '\nall passed');
process.exit(failures ? 1 : 0);
