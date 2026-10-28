// Foot Chase: the rules, with no rendering. Used by pursuit.js (3D and 2D views) and by the node
// tests in scripts/pursuit-logic.test.mjs.
//
// A chase is a route of LEGS (default 6), each in one setting and about two to three minutes long.
// There are no lanes: the street is a strip |x| <= X_MAX and you steer freely across it (`x` is
// analog), jumping low things and sliding under high ones. `dist` is metres run in this leg.
//
// Obstacles are scattered, not templated: a Poisson-disc scatter whose density drifts between
// clusters and clear stretches and rises leg by leg, with models of different widths and lengths.
// Set-pieces (a hurdle or a rope of laundry across the whole street, an open drain or a gap between
// roofs, a roller shutter coming down, a motorbike crossing, a pot falling, a crate thrown back,
// stairs, a narrow, a fork with a shortcut) land at random places and times.
//
// FAIRNESS. Each 40 m of track is checked by a path search on a grid (5 cm across, 1 m along):
// starting from everywhere you could be, you must be able to steer, at 75% of your turn rate and
// at the fastest you can run there, through a corridor at least 1.3 x your body wide; full-width
// hurdles are answered by a jump or a slide in a clear stretch. Where the search fails, the scatter
// loses the obstacle that closed the way, until it passes.
//
// The chase is a gap in metres per leg: running clean closes it (faster as he tires), stumbling opens
// it, a cup of teh tarik closes it faster for a few seconds. Gap <= 0 ends the leg: he breaks away
// into the next place (or, on the last leg, you tackle him). Gap > maxGap: he is gone; the leg restarts.

export const X_MAX = 3.5; // the furthest your centre gets from the middle of the street
export const ROAD_HALF = 3.9;
export const PR = 0.3; // half your body width
export const CORRIDOR = 1.4 * 2 * PR; // the brief asks for at least 1.3 x
export const HIT_R = 0.22; // collisions forgive a few centimetres of shoulder
const INFL = CORRIDOR / 2;
export const CELL = 0.05;
export const NC = Math.round((2 * X_MAX) / CELL) + 1;
export const cellX = (i) => -X_MAX + i * CELL;
const cellOf = (x) => Math.max(0, Math.min(NC - 1, Math.round((x + X_MAX) / CELL)));
const DD = 1; // metres per search step
const CH = 40; // metres per generated chunk

export const PHYS = {
  jumpT: 0.62, jumpH: 1.25,
  lowClear: 0.45, gapClear: 0.1,
  slideT: 0.72,
  buffer: 0.3,
  stumbleSpeed: 0.62, sprintSpeed: 1.12,
  dropV: 16, grace: 0.35,
  steerAccel: 34, // m/s^2 sideways
  stairsUp: 2.6, stairsFlat: 8.8, stairsDown: 2.6, stairsH: 0.9,
};
export const STAIRS_LEN = PHYS.stairsUp + PHYS.stairsFlat + PHYS.stairsDown;
const G = (8 * PHYS.jumpH) / (PHYS.jumpT * PHYS.jumpT);
const JUMP_V = (4 * PHYS.jumpH) / PHYS.jumpT;
export const FAIR = { plan: 0.75, tail: 0.4, lead: 0.32, late: 1.05, margin: 1.12 };
export const SIGHT = 38; // metres you can make things out in the fog (the views keep at least this)

// ---- difficulty curve: [first leg, last leg] -----------------------------------------------
export const CURVE = {
  easy: {
    v0: [9.5, 11.5], vmax: [11.5, 14], vx: [4.6, 4.9], reaction: [0.6, 0.5], rmin: [7.4, 4.6],
    legT: [152, 178], close: 0.5, slack: [34, 28], hitCost: 1.5, drift: 0.6, stumbleT: 0.7, sprintClose: 1.6, puddleCost: 0.5,
    pieces: [0.22, 0.5], cups: [110, 170],
  },
  medium: {
    v0: [11, 13.5], vmax: [13.5, 17], vx: [4.8, 5.3], reaction: [0.5, 0.42], rmin: [5.8, 3.6],
    legT: [222, 256], close: 0.45, slack: [27, 21], hitCost: 2, drift: 0.8, stumbleT: 0.9, sprintClose: 1.4, puddleCost: 1.0,
    pieces: [0.3, 0.62], cups: [130, 200],
  },
  hard: {
    v0: [12.5, 15.5], vmax: [15.5, 19.5], vx: [5.0, 5.7], reaction: [0.42, 0.34], rmin: [4.9, 3.0],
    legT: [262, 296], close: 0.42, slack: [22, 16], hitCost: 4, drift: 1.4, stumbleT: 1.0, sprintClose: 1.3, puddleCost: 1.4,
    pieces: [0.38, 0.75], cups: [150, 230],
  },
};
export const DIFF_KEYS = Object.keys(CURVE);

export const SETTING_LIST = ['city', 'market', 'docks', 'heritage', 'kampung', 'rooftop', 'estate'];

/** The rules for leg i of n on a difficulty. Speed, density, set-pieces and reaction windows tighten each leg. */
export function legSpec(diffKey, i = 0, n = 1, setting = 'city') {
  const key = CURVE[diffKey] ? diffKey : 'easy';
  const c = CURVE[key];
  const u = n > 1 ? Math.min(1, Math.max(0, i / (n - 1))) : 0;
  const L = (a) => a[0] + (a[1] - a[0]) * u;
  const legT = L(c.legT);
  const gap = Math.round(legT * c.close);
  return {
    key, index: i, legs: n, u, final: i >= n - 1, setting: SETTING_LIST.includes(setting) ? setting : 'city',
    v0: L(c.v0), vmax: L(c.vmax), ramp: 500, vx: L(c.vx), reaction: L(c.reaction), rmin: L(c.rmin),
    legT, gap, maxGap: gap + Math.round(L(c.slack)), close: c.close,
    hitCost: c.hitCost, drift: c.drift, stumbleT: c.stumbleT, sprintT: 3, sprintClose: c.sprintClose, puddleCost: c.puddleCost,
    pieceRate: L(c.pieces), cups: c.cups,
    // which set-pieces exist yet: 0 hurdles and throws, 1 movers and falls, 2 drains, shutters, stairs, 3 narrows, 4 forks
    unlock: n > 1 ? Math.round(u * 5) : 2,
  };
}
export const speedAt = (s, dist) => s.v0 + (s.vmax - s.v0) * Math.min(1, Math.max(0, dist) / s.ramp);
export const fastest = (s) => s.vmax * PHYS.sprintSpeed;
/** Something that appears late (thrown, falling, rolling in) has settled this far ahead of you. */
export const settleDist = (s) => Math.max(26, fastest(s) * (s.reaction + FAIR.late) * FAIR.margin);

// ---- routes, models ---------------------------------------------------------------------------
const ROUTES = {
  city: ['city', 'market', 'rooftop', 'city', 'heritage', 'docks'],
  market: ['market', 'city', 'rooftop', 'market', 'city', 'docks'],
  docks: ['docks', 'city', 'rooftop', 'market', 'docks', 'estate'],
  heritage: ['heritage', 'market', 'rooftop', 'heritage', 'city', 'docks'],
  kampung: ['kampung', 'city', 'rooftop', 'market', 'kampung', 'estate'],
  rooftop: ['city', 'rooftop', 'market', 'rooftop', 'city', 'docks'],
  estate: ['kampung', 'city', 'rooftop', 'market', 'kampung', 'estate'],
};
export function makeRoute(setting = 'city', legs = 6, route = null) {
  const ok = (s) => SETTING_LIST.includes(s);
  let r = Array.isArray(route) ? route.filter(ok) : [];
  const n = Math.max(1, Math.min(12, Math.round(Number(legs) || (r.length || 6))));
  if (!r.length) r = ROUTES[ok(setting) ? setting : 'city'];
  const out = [];
  for (let i = 0; i < n; i++) out.push(r[i % r.length]);
  return out;
}

/** Footprints of the models as built: [width across, length along, centre offset along (- is away from you)]. */
export const DIM = {
  barrier: [1.9, 0.45], bags: [1.9, 0.7], kerb: [1.95, 0.5], hurdle: [1.9, 0.2], crates: [1.9, 0.75], plastic: [1.8, 0.6], pallets: [1.8, 1.0],
  drums: [1.8, 0.62], pots: [1.9, 0.6], log: [2.0, 0.55], planks: [1.95, 0.8], coconuts: [1.8, 0.8], acUnit: [1.9, 0.5], pipeLow: [2.0, 0.4],
  bucket: [1.2, 0.6], potFall: [1.0, 0.8], cones: [1.3, 0.45], frondPile: [1.8, 1.2], fruitPile: [1.1, 0.9], bin: [1.0, 0.95],
  pipe: [2.3, 0.4], laundry: [2.0, 0.2], cables: [2.15, 0.3], signHang: [2.1, 0.2], tarp: [2.0, 0.7], heightbar: [2.2, 0.2], sign: [2.1, 0.15],
  lanterns: [2.0, 0.4], kain: [2.0, 0.2], wires: [2.1, 0.3], branch: [2.4, 0.4],
  dumpster: [1.95, 1.2], motorbike: [1.9, 1.8], table: [1.9, 1.6], cart: [1.8, 0.95], container: [1.95, 5.8, -2.5], containerTeal: [1.95, 5.8, -2.5],
  containerBlue: [1.95, 5.8, -2.5], forklift: [1.15, 3.0, 0.2], beca: [1.4, 1.9, -0.3], coop: [1.85, 1.0], woodcart: [1.9, 2.0], tank: [1.7, 1.5],
  dish: [1.9, 1.8], acStack: [2.0, 0.6], trayMan: [0.75, 0.8], door: [2.0, 0.2],
  pole: [0.3, 0.3], bollard: [0.4, 0.4], pillar: [0.62, 0.62], bike1: [0.6, 1.8], drum1: [0.62, 0.62], palmTrunk: [0.7, 0.7], rubberTree: [0.45, 0.45],
  wheelbarrow: [0.8, 1.6], lorry: [2.4, 6.5],
};
// field: [model, type, weight]; then spans and set-piece models
export const MODELS = {
  city: { field: [['pole', 'block', 3], ['bollard', 'block', 2], ['bike1', 'block', 3], ['drum1', 'block', 1], ['dumpster', 'block', 1], ['table', 'block', 0.8], ['barrier', 'low', 1], ['bags', 'low', 1], ['hurdle', 'low', 1], ['cones', 'low', 1], ['signHang', 'high', 1], ['cables', 'high', 0.6]],
    spanLow: 'kerbSpan', spanHigh: 'laundrySpan', thrown: ['bin', 'bags'], mover: ['cart', 'trayMan', 'door', 'motorbike'], fall: 'potFall', shutter: 'shutter', gap: 'drain', gapSpan: 'drainSpan', wall: 'hoarding', puddle: 0.05 },
  market: { field: [['cart', 'block', 2], ['table', 'block', 2], ['bike1', 'block', 2], ['trayMan', 'block', 1], ['drum1', 'block', 1], ['pole', 'block', 1], ['crates', 'low', 2], ['plastic', 'low', 1], ['tarp', 'high', 1], ['signHang', 'high', 0.6]],
    spanLow: 'crateSpan', spanHigh: 'tarpSpan', thrown: ['crates', 'plastic'], mover: ['cart', 'trayMan', 'motorbike'], fall: 'crates', shutter: 'shutter', gap: 'drain', gapSpan: 'drainSpan', wall: 'hoarding', puddle: 0.06 },
  docks: { field: [['bollard', 'block', 2], ['drum1', 'block', 3], ['pole', 'block', 1], ['container', 'block', 1], ['forklift', 'block', 1], ['pallets', 'low', 2], ['kerb', 'low', 1], ['drums', 'low', 1], ['heightbar', 'high', 1], ['pipe', 'high', 0.5]],
    spanLow: 'blockSpan', spanHigh: 'pipeSpan', thrown: ['drums'], mover: ['forklift', 'motorbike'], fall: 'pallets', shutter: 'boomGate', gap: 'drain', gapSpan: 'drainSpan', wall: 'containerLong', puddle: 0.09 },
  heritage: { field: [['pillar', 'block', 3], ['bike1', 'block', 2], ['beca', 'block', 1], ['pole', 'block', 1], ['pots', 'low', 2], ['crates', 'low', 1], ['lanterns', 'high', 1], ['sign', 'high', 1]],
    spanLow: 'potSpan', spanHigh: 'lanternSpan', thrown: ['pots'], mover: ['beca', 'trayMan', 'door'], fall: 'potFall', shutter: 'shutter', gap: 'drain', gapSpan: 'drainSpan', wall: 'hoarding', puddle: 0.05 },
  kampung: { field: [['palmTrunk', 'block', 3], ['bike1', 'block', 1], ['coop', 'block', 1], ['woodcart', 'block', 1], ['drum1', 'block', 1], ['log', 'low', 2], ['coconuts', 'low', 1], ['kain', 'high', 1]],
    spanLow: 'logSpan', spanHigh: 'kainSpan', thrown: ['coconuts'], mover: ['motorbike', 'woodcart'], fall: 'coconuts', shutter: null, gap: 'drain', gapSpan: 'drainSpan', wall: 'fenceLong', puddle: 0.09 },
  rooftop: { field: [['tank', 'block', 1], ['dish', 'block', 1], ['acStack', 'block', 1], ['pole', 'block', 2], ['acUnit', 'low', 2], ['pipeLow', 'low', 1], ['bucket', 'low', 0.5], ['wires', 'high', 1], ['laundry', 'high', 1]],
    spanLow: 'pipeSpanLow', spanHigh: 'laundrySpan', thrown: ['bucket'], mover: ['door'], fall: null, shutter: null, gap: 'skylight', gapSpan: 'roofGap', wall: 'hoarding', puddle: 0.07 },
  estate: { field: [['palmTrunk', 'block', 4], ['rubberTree', 'block', 4], ['wheelbarrow', 'block', 0.5], ['lorry', 'block', 0.25], ['frondPile', 'low', 2], ['fruitPile', 'low', 1], ['branch', 'high', 1.2]],
    spanLow: 'logSpan', spanHigh: 'branchSpan', thrown: ['fruitPile'], mover: ['motorbike', 'wheelbarrow'], fall: 'fruitPile', shutter: null, gap: 'drain', gapSpan: 'drainSpan', wall: 'fenceLong', puddle: 0.1 },
};
export function modelNames(setting) {
  const m = MODELS[setting] || MODELS.city;
  return [...new Set([...m.field.map((f) => f[0]), m.spanLow, m.spanHigh, ...m.thrown, ...m.mover, m.fall, m.shutter, m.gap, m.gapSpan, m.wall, 'puddle', 'stairs'].filter(Boolean))];
}
export const dimOf = (model) => DIM[model] || [2, 0.6, 0];

// ---- objects --------------------------------------------------------------------------------
// o = { id, d, x, w, len, type: 'low'|'high'|'block'|'gap'|'puddle'|'cup'|'stairs', model, span?, wall?, anim?, hidden?,
//       reveal, piece?, field?, hit, contact }
// low/gap: jump · high: slide · block: steer round · puddle: free, but it slows you unless you jump it.
// span: across the whole street. wall: a long wall (a narrow, or a fork's divider) you cannot pass through.
// anim: { type: 'mover'|'fall'|'shutter'|'throw', from } settles by o.reveal metres before you reach it.

/** Does this object stop you unless you go round it (for the path search)? Spans are answered by a jump or slide. */
const blocksPath = (o) => !o.span && o.type !== 'puddle' && o.type !== 'cup';

function weightedPick(rng, list) {
  let sum = 0;
  for (const f of list) sum += f[2];
  let r = rng() * sum;
  for (const f of list) { r -= f[2]; if (r <= 0) return f; }
  return list[0];
}

/** Rasterise blocking objects into a grid of steps [d0, d0 + n*DD) x NC cells (1 = blocked). */
export function rasterise(objs, d0, n, grid = new Uint8Array(n * NC), filter = blocksPath) {
  grid.fill(0, 0, n * NC);
  for (const o of objs) {
    if (!filter(o)) continue;
    // one extra step either side: you are clear before the step that holds it begins and until after it ends
    const a = o.d - o.len / 2 - 0.3 - DD, b = o.d + o.len / 2 + 0.3 + DD;
    const j0 = Math.max(0, Math.floor((a - d0) / DD)), j1 = Math.min(n - 1, Math.floor((b - d0) / DD));
    if (j1 < 0 || j0 > n - 1) continue;
    const i0 = Math.max(0, Math.ceil((o.x - o.w / 2 - INFL + X_MAX) / CELL - 1e-9)), i1 = Math.min(NC - 1, Math.floor((o.x + o.w / 2 + INFL + X_MAX) / CELL + 1e-9));
    if (i1 < i0) continue;
    for (let j = j0; j <= j1; j++) grid.fill(1, j * NC + i0, j * NC + i1 + 1);
  }
  return grid;
}
/** dst[i] = 1 if src has a 1 within r cells of i. */
function dilate(src, r, dst) {
  let last = -1e9;
  for (let i = 0; i < NC; i++) { if (src[i]) last = i; dst[i] = i - last <= r ? 1 : 0; }
  last = 1e9;
  for (let i = NC - 1; i >= 0; i--) { if (src[i]) last = i; if (last - i <= r) dst[i] = 1; }
  return dst;
}
/** Cells you can move per search step, at turn rate vx and forward speed v (planned at 75%). */
export const reachCells = (vx, v) => Math.max(1, Math.floor((FAIR.plan * vx * DD) / v / CELL));

/**
 * The scatter for one leg. gen.next() returns objects in order of distance; gen.features lists
 * stairs, narrows and forks; gen.spine is a line through the field that always continues (the
 * suspect runs it, and teh tarik cups sit on it).
 */
export function createGenerator(rng, spec) {
  const M = MODELS[spec.setting] || MODELS.city;
  const roof = spec.setting === 'rooftop';
  const vf = fastest(spec);
  const rc = reachCells(spec.vx, vf);
  const settle = settleDist(spec);
  let id = 0, pid = 0;
  let mood = 0.8;
  let reach = new Uint8Array(NC).fill(1); // everywhere is reachable after the run-up
  let nextCup = 70 + spec.cups[0] * rng();
  const features = [];
  const spine = []; // [d, x, d, x, ...]
  const all = []; // generated, not yet released
  const out = []; // released, in order
  const released = []; // handed out recently (long walls still matter to the next chunks)
  const windows = []; // [d0, d1] where the scatter stays away
  let chunk = 0;
  let pending = null;
  const stats = { removed: 0, placed: 0 };

  const mk = (o) => ({ id: ++id, hit: false, contact: false, reveal: 0, ...o });
  const freeOfWindows = (d, len) => !windows.some(([a, b]) => d + len / 2 > a && d - len / 2 < b);
  const inWall = (d, x, w) => features.some((f) => f.walls && d >= f.d0 - 1 && d <= f.d1 + 1 && f.walls.some(([a, b]) => x + w / 2 > a - 0.4 && x - w / 2 < b + 0.4));
  const windowAt = (d0, d1) => windows.some(([a, b]) => d1 > a && d0 < b);

  // ---- set-pieces, at random places
  /** Keep a stretch clear: no scatter there, and anything already scattered there goes. */
  function clearWindow(a, b) {
    windows.push([a, b]);
    for (let i = all.length - 1; i >= 0; i--) { const o = all[i]; if (o.field && o.d + o.len / 2 > a && o.d - o.len / 2 < b) all.splice(i, 1); }
  }
  function span(type, model, d, extra = {}) {
    const [, len] = dimOf(model);
    all.push(mk({ d, x: 0, w: 2 * ROAD_HALF, len: Math.max(len, type === 'gap' ? 1.6 : 0.3), type, model, span: true, ...extra }));
    clearWindow(d - vf * (spec.reaction + FAIR.lead + 0.45), d + vf * (FAIR.tail + 0.3));
  }
  function piece(d) {
    const pc = (name, score) => ({ id: ++pid, name, score });
    const avail = [
      ['hurdle', 0, 3], ['thrown', 0, 1.5],
      ['mover', 1, M.mover.length ? 2 : 0], ['fall', 1, M.fall ? 1.5 : 0],
      ['drain', roof ? 0 : 2, roof ? 4 : 1.5], ['shutter', 2, M.shutter ? 1.5 : 0], ['stairs', 2, 1],
      ['narrow', 3, 1.5], ['fork', 4, 1.5],
    ].filter((p) => p[1] <= spec.unlock && p[2] > 0);
    const name = weightedPick(rng, avail)[0];
    if (windowAt(d - 20, d + 20) || features.some((f) => d > f.d0 - 25 && d < f.d1 + 15)) return;
    if (name === 'hurdle') {
      const low = rng() < 0.55;
      span(low ? 'low' : 'high', low ? M.spanLow : M.spanHigh, d, { piece: pc('hurdle', 2) });
    } else if (name === 'drain') {
      if (roof || rng() < 0.55) span('gap', M.gapSpan, d, { piece: pc('gap', 3) });
      else { const x = (rng() * 2 - 1) * (X_MAX - 1); all.push(mk({ d, x, w: 1.95, len: 1.3, type: 'gap', model: M.gap, piece: pc('drain', 1) })); clearWindow(d - 3, d + 3); windows.push([d - 18, d + 6]); }
    } else if (name === 'shutter') {
      span('high', M.shutter, d, { anim: { type: 'shutter' }, reveal: settle, piece: pc('shutter', 3) });
    } else if (name === 'stairs') {
      features.push({ type: 'stairs', d0: d, d1: d + STAIRS_LEN });
      all.push(mk({ d: d + STAIRS_LEN / 2, x: 0, w: 2 * ROAD_HALF, len: STAIRS_LEN, type: 'stairs', model: 'stairs', span: true }));
      clearWindow(d - 10, d + STAIRS_LEN + 8);
    } else if (name === 'mover' || name === 'fall' || name === 'thrown') {
      const model = name === 'mover' ? M.mover[Math.floor(rng() * M.mover.length)] : name === 'fall' ? M.fall : M.thrown[Math.floor(rng() * M.thrown.length)];
      const [w, len] = dimOf(model);
      const x = model === 'door' ? (rng() < 0.5 ? -1 : 1) * (ROAD_HALF - 1.0) : (rng() * 2 - 1) * (X_MAX - w / 2);
      const crosses = model === 'motorbike' || model === 'forklift';
      const side = x < 0 ? -1 : 1;
      const anim = name === 'mover' ? { type: 'mover', from: (crosses ? -side : side) * 5.6 } : { type: name === 'fall' ? 'fall' : 'throw' };
      all.push(mk({ d, x, w, len, type: name === 'mover' ? 'block' : 'low', model, anim, reveal: settle, hidden: name === 'thrown', piece: pc(name, 2) }));
      clearWindow(d - settle - 4, d + 6); // nothing to hem you in when it lands: you can steer anywhere
    } else if (name === 'narrow' || name === 'fork') {
      const L = 22 + rng() * (18 + spec.u * 20);
      const f = { type: name, d0: d, d1: d + L, walls: [] };
      if (name === 'narrow') {
        const side = rng() < 0.5 ? -1 : 1, open = 2.6 + rng() * 1.6;
        const inner = side < 0 ? ROAD_HALF - open : -(ROAD_HALF - open);
        f.walls.push(side < 0 ? [-ROAD_HALF - 0.1, inner] : [inner, ROAD_HALF + 0.1]);
        f.piece = pc('narrow', 4);
      } else {
        f.walls.push([-0.8, 0.8]);
        f.short = rng() < 0.5 ? -1 : 1;
        f.bonus = Math.round(4 + L / 6);
        f.done = false;
        f.piece = pc('fork', 5);
      }
      for (const [a, b] of f.walls) all.push(mk({ d: d + L / 2, x: (a + b) / 2, w: b - a, len: L, type: 'block', model: M.wall, wall: true, piece: f.piece, feature: f }));
      features.push(f);
      clearWindow(d - vf * (spec.reaction + 1.3) - 6, d + 1); // a clear approach: once you see it, you can reach the open side
      if (f.type === 'fork') { // the shortcut side is busier
        const small = M.field.filter((q) => dimOf(q[0])[0] < 1.0);
        for (let k = 0; k < L / 7; k++) {
          const [model, type] = weightedPick(rng, small.length ? small : M.field);
          const [w, len] = dimOf(model);
          const x = f.short * (1.25 + rng() * Math.max(0.1, X_MAX - 1.25 - w / 2));
          all.push(mk({ d: d + 6 + rng() * (L - 8), x, w, len, type, model, field: true, piece: f.piece }));
        }
      }
    }
  }

  // ---- the scatter
  function scatter(d0, d1, prev) {
    if (chunk > 1 && rng() < 0.12) mood = 0.12; else mood = Math.max(0.3, Math.min(1.35, mood + (rng() - 0.5) * 0.7));
    const rmin = spec.rmin / Math.sqrt(mood);
    const tries = Math.ceil((((d1 - d0) * 2 * ROAD_HALF) / (rmin * rmin)) * 3);
    const placed = prev.slice();
    for (let t = 0; t < tries; t++) {
      const [model, type] = weightedPick(rng, M.field);
      const [w, len] = dimOf(model);
      const d = d0 + rng() * (d1 - d0);
      const lim = ROAD_HALF - w / 2 + Math.min(0.4, w * 0.3);
      const x = (rng() * 2 - 1) * lim;
      if (!freeOfWindows(d, len + 2) || inWall(d, x, w)) continue;
      const need = rmin * (0.7 + 0.25 * (w + len) / 2);
      let ok = true;
      for (const p of placed) { const dx = p.x - x, dd = p.d - d; if (dx * dx + dd * dd < need * need) { ok = false; break; } }
      if (!ok) continue;
      const o = mk({ d, x, w, len, type, model, field: true });
      placed.push(o);
      all.push(o);
      stats.placed++;
    }
    for (let k = 0; k < (d1 - d0) / 12; k++) if (rng() < M.puddle * 4) {
      const d = d0 + rng() * (d1 - d0), x = (rng() * 2 - 1) * (X_MAX - 0.6);
      if (freeOfWindows(d, 2)) all.push(mk({ d, x, w: 1.6, len: 2.2, type: 'puddle', model: 'puddle' }));
    }
  }

  // ---- the path search for one chunk (overlapping the last one by OVL metres): drops field objects until every step can be reached
  const n = CH / DD, OVL = 32; // the look back covers the visible horizon, so pockets across chunks are measured whole
  const grid = new Uint8Array((n + OVL) * NC);
  const tmp = new Uint8Array(NC);
  const rows = Array.from({ length: n + OVL }, () => new Uint8Array(NC));
  function search(ds, m, startReach, objs) {
    rasterise(objs, ds, m, grid);
    let r = startReach;
    for (let j = 0; j < m; j++) {
      const nr = rows[j];
      dilate(r, rc, tmp);
      let any = false;
      for (let i = 0; i < NC; i++) { nr[i] = tmp[i] && !grid[j * NC + i] ? 1 : 0; if (nr[i]) any = true; }
      if (any) for (const f of features) if (f.type === 'fork' && ds + j * DD > f.d0 + 1 && ds + j * DD < f.d1 - 1) {
        let l = false, rr = false;
        for (let i = 0; i < NC; i++) if (nr[i]) { if (cellX(i) < 0) l = true; else rr = true; }
        if (!l || !rr) any = false; // both sides of a fork must stay open
      }
      if (!any) return { fail: j, last: r };
      r = nr;
    }
    return { fail: -1, last: r };
  }
  /**
   * No traps: from anywhere you can reach you can always go on. Builds the set of places with a
   * future (backward from the end of the window) and follows any reachable place without one
   * forward to where its pocket closes. Returns { row, set } of that dead end, or null.
   */
  const safeRows = Array.from({ length: n + OVL }, () => new Uint8Array(NC));
  const dead = new Uint8Array(NC), dead2 = new Uint8Array(NC);
  // a pocket that closes within what you can see from its mouth is visible; a longer one is a trap
  const trapRows = Math.max(6, Math.floor((SIGHT - vf * spec.reaction) / DD) - 3);
  function findTrap(m) {
    safeRows[m - 1].set(rows[m - 1]);
    for (let j = m - 2; j >= 0; j--) {
      dilate(safeRows[j + 1], rc, tmp);
      for (let i = 0; i < NC; i++) safeRows[j][i] = tmp[i] && !grid[j * NC + i] ? 1 : 0;
    }
    for (let j = 0; j < m - 1; j++) {
      let any = false;
      for (let i = 0; i < NC; i++) { dead[i] = rows[j][i] && !safeRows[j][i] ? 1 : 0; if (dead[i]) any = true; }
      if (!any) continue;
      for (let jj = j + 1; jj < m; jj++) {
        dilate(dead, rc, tmp);
        let live = false;
        for (let i = 0; i < NC; i++) { dead2[i] = tmp[i] && !grid[jj * NC + i] && !safeRows[jj][i] ? 1 : 0; if (dead2[i]) live = true; }
        if (!live) { if (jj - j >= trapRows) return { row: jj, set: dead.slice() }; break; }
        dead.set(dead2);
      }
    }
    return null;
  }
  function validate(d0) {
    const ds = d0 === 0 ? 0 : d0 - OVL, m = n + (d0 === 0 ? 0 : OVL);
    while (released.length && released[0].d + released[0].len / 2 + 80 < ds) released.shift();
    const objs = all.concat(released).filter((o) => o.d + o.len / 2 + 1.4 >= ds && o.d - o.len / 2 - 1.4 < ds + m * DD);
    for (let guard = 0; guard < 600; guard++) {
      const res = search(ds, m, reach, objs);
      let failRow = res.fail, failSet = res.last;
      if (failRow < 0) {
        const trap = findTrap(m);
        if (!trap) { reach = rows[m - OVL - 1].slice(); return; }
        failRow = trap.row; failSet = trap.set;
      }
      const dj = ds + failRow * DD + DD / 2;
      let cx = 0, cnt = 0;
      for (let i = 0; i < NC; i++) if (failSet[i]) { cx += cellX(i); cnt++; }
      cx = cnt ? cx / cnt : 0;
      let victim = null, best = Infinity;
      for (const o of objs) {
        if (!o.field && !(o.anim && o.anim.type !== 'shutter')) continue;
        if (!all.includes(o)) continue; // already handed out
        if (Math.abs(o.d - dj) > o.len / 2 + 2.6) continue;
        const sc = Math.abs(o.x - cx) + Math.abs(o.d - dj) * 0.2;
        if (sc < best) { best = sc; victim = o; }
      }
      if (!victim) { for (const o of objs) if (o.wall && Math.abs(o.d - dj) < o.len) o.w *= 0.8; continue; }
      objs.splice(objs.indexOf(victim), 1);
      all.splice(all.indexOf(victim), 1);
      stats.removed++;
    }
    stats.failed = (stats.failed || 0) + 1;
    reach = new Uint8Array(NC).fill(1);
  }
  /** The spine through chunk c, using chunk c+1 to make sure it can always continue (forks: the short side). */
  function makeSpine(d0) {
    const n2 = 2 * n;
    const objs = all.concat(released).filter((o) => o.d + o.len / 2 + 1.4 >= d0 && o.d - o.len / 2 - 1.4 < d0 + n2 * DD);
    const g2 = rasterise(objs, d0, n2, new Uint8Array(n2 * NC));
    for (const f of features) if (f.type === 'fork') for (let j = 0; j < n2; j++) {
      const d = d0 + j * DD;
      if (d < f.d0 - 8 || d > f.d1) continue;
      let any = false;
      for (let i = 0; i < NC; i++) if (Math.sign(cellX(i)) === f.short && !g2[j * NC + i]) any = true;
      if (any) for (let i = 0; i < NC; i++) if (Math.sign(cellX(i)) !== f.short) g2[j * NC + i] = 1;
    }
    const safe = Array.from({ length: n2 }, () => new Uint8Array(NC));
    for (let i = 0; i < NC; i++) safe[n2 - 1][i] = g2[(n2 - 1) * NC + i] ? 0 : 1;
    for (let j = n2 - 2; j >= 0; j--) {
      dilate(safe[j + 1], rc, tmp);
      let any = false;
      for (let i = 0; i < NC; i++) { safe[j][i] = tmp[i] && !g2[j * NC + i] ? 1 : 0; if (safe[j][i]) any = true; }
      if (!any) for (let i = 0; i < NC; i++) safe[j][i] = g2[j * NC + i] ? 0 : 1;
    }
    let ci = spine.length ? cellOf(spine[spine.length - 1]) : cellOf(0);
    for (let j = 0; j < n; j++) {
      let best = -1, bd = 1e9;
      for (let i = Math.max(0, ci - rc); i <= Math.min(NC - 1, ci + rc); i++) if (safe[j][i]) { const dd = Math.abs(i - ci) + Math.abs(cellX(i)) * 0.4; if (dd < bd) { bd = dd; best = i; } }
      if (best < 0) for (let i = 0; i < NC; i++) if (safe[j][i] && Math.abs(i - ci) < bd) { bd = Math.abs(i - ci); best = i; }
      if (best >= 0) ci = best;
      spine.push(d0 + j * DD, cellX(ci));
    }
  }

  function generateChunk() {
    const d0 = chunk * CH, d1 = d0 + CH;
    if (chunk === 0) windows.push([0, 60]);
    if (chunk > 1 && rng() < spec.pieceRate) piece(d0 + 6 + rng() * (CH - 12));
    if (chunk > 2 && rng() < spec.pieceRate * 0.35) piece(d0 + 6 + rng() * (CH - 12));
    scatter(chunk === 0 ? 60 : d0, d1, all.filter((o) => o.field && o.d > d0 - 12));
    validate(d0);
    chunk++;
  }

  return {
    features, spine, stats, windows,
    next() {
      while (!out.length) {
        generateChunk();
        if (pending !== null) {
          makeSpine(pending);
          for (let k = spine.length - 2 * n; k < spine.length; k += 2) {
            const d = spine[k];
            if (d >= nextCup && freeOfWindows(d, 3)) { all.push(mk({ d, x: spine[k + 1], w: 0.5, len: 0.5, type: 'cup', model: 'cup' })); nextCup = d + spec.cups[0] + rng() * (spec.cups[1] - spec.cups[0]); }
          }
          const ready = all.filter((o) => o.d - o.len / 2 < pending + CH);
          ready.sort((a, b) => (a.d - a.len / 2) - (b.d - b.len / 2));
          for (const o of ready) { all.splice(all.indexOf(o), 1); out.push(o); released.push(o); }
        }
        pending = (chunk - 1) * CH;
      }
      return out.shift();
    },
  };
}

// ---- the run (one leg) --------------------------------------------------------------------

/** How far ahead the suspect is drawn for a given gap (the view compresses long gaps). */
export const aheadFor = (gap) => 1.6 + 27 * (1 - Math.exp(-Math.max(0, gap) / 30));

export function groundAt(features, d) {
  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    if (f.type !== 'stairs' || d < f.d0 || d > f.d1) continue;
    const t = d - f.d0;
    if (t < PHYS.stairsUp) return PHYS.stairsH * Math.ceil((t / PHYS.stairsUp) * 5) / 5;
    if (t > STAIRS_LEN - PHYS.stairsDown) return PHYS.stairsH * Math.ceil(((STAIRS_LEN - t) / PHYS.stairsDown) * 5) / 5;
    return PHYS.stairsH;
  }
  return 0;
}
export function spineAt(spine, d) {
  if (spine.length < 4) return spine.length ? spine[1] : 0;
  let lo = 0, hi = spine.length / 2 - 1;
  if (d <= spine[0]) return spine[1];
  if (d >= spine[hi * 2]) return spine[hi * 2 + 1];
  while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (spine[mid * 2] <= d) lo = mid; else hi = mid; }
  const d0 = spine[lo * 2], d1 = spine[hi * 2];
  const u = d1 > d0 ? (d - d0) / (d1 - d0) : 0;
  return spine[lo * 2 + 1] + (spine[hi * 2 + 1] - spine[lo * 2 + 1]) * u;
}

/**
 * One leg. opts: { spec (legSpec), rng, gap (start gap override), view, hooks: { onAdd, onDrop } }.
 * steer(-1..1) for held keys, steerTo(x) for a finger, tilt or the bot; input('jump' | 'slide'); step(dt).
 * run.events collects { type, o? } (hit, brush, splash, pickup, tell, throw, settle, shortcut,
 * jump, slide, land, escape, caught, lost); the caller empties it.
 */
export function createRun({ spec, rng, gap, view = 170, hooks = {} } = {}) {
  const s = spec || legSpec('easy', 0, 1);
  const gen = createGenerator(rng, s);
  const startGap = Number.isFinite(gap) && gap > 0 ? gap : s.gap;
  const run = {
    spec: s, startGap, maxGap: Math.max(s.maxGap, startGap + 16), gen,
    t: 0, dist: 0, speed: s.v0, ground: 0,
    x: 0, vx: 0, steerMode: 'held', steerVal: 0, steerX: 0,
    y: 0, vy: 0, air: false, slideT: 0, stumbleT: 0, graceT: 0, sprintT: 0, slowT: 0,
    buffered: null, bufferedUntil: 0,
    gap: startGap, best: startGap, status: 'run', hits: 0, splashes: 0, shortcuts: 0, passed: 0,
    objs: [], events: [], features: gen.features, spine: gen.spine,
    suspect: { ahead: aheadFor(startGap), x: 0, y: 0, vy: 0, air: false, slideT: 0, ground: 0 },
  };
  const emit = (type, o = null) => { run.events.push({ type, o }); };

  function fill() {
    let last = run.objs.length ? run.objs[run.objs.length - 1].d : 0;
    while (last < run.dist + view) {
      const o = gen.next();
      run.objs.push(o);
      hooks.onAdd?.(o);
      last = o.d;
    }
  }
  fill();

  function jump() { run.slideT = 0; run.air = true; run.vy = JUMP_V; emit('jump'); }
  function doAct(a) {
    if (a === 'jump') { if (!run.air) jump(); else { run.buffered = 'jump'; run.bufferedUntil = run.t + PHYS.buffer; } }
    else if (a === 'slide') { if (run.air) { run.vy = Math.min(run.vy, -PHYS.dropV); run.buffered = 'slide'; run.bufferedUntil = run.t + PHYS.buffer + 0.2; } else { run.slideT = PHYS.slideT; emit('slide'); } }
  }
  run.input = (a) => { if (run.status === 'run') doAct(a); };
  run.steer = (v) => { run.steerMode = 'held'; run.steerVal = Math.max(-1, Math.min(1, v)); };
  run.steerTo = (x) => { run.steerMode = 'target'; run.steerX = Math.max(-X_MAX, Math.min(X_MAX, x)); };

  function wallPush(o) {
    const a = o.x - o.w / 2 - PR - 0.05, b = o.x + o.w / 2 + PR + 0.05;
    let nx = Math.abs(run.x - a) < Math.abs(run.x - b) ? a : b;
    if (nx < -X_MAX) nx = b; else if (nx > X_MAX) nx = a;
    run.x = Math.max(-X_MAX, Math.min(X_MAX, nx)); run.vx = 0; run.steerX = run.x;
  }
  function stumble(o) {
    if (run.graceT > 0) { emit('brush', o); return; }
    run.hits++;
    run.gap += s.hitCost;
    run.stumbleT = s.stumbleT;
    run.graceT = s.stumbleT + PHYS.grace;
    run.sprintT = 0;
    emit('hit', o);
  }
  function touch(o) {
    if (o.type === 'cup') { if (!o.taken) { o.taken = true; run.sprintT = s.sprintT; emit('pickup', o); } return; }
    if (o.type === 'stairs' || o.hidden) return;
    let hit = false;
    if (o.type === 'block') hit = true;
    else if (o.type === 'low') hit = run.y < PHYS.lowClear;
    else if (o.type === 'gap') hit = run.y < PHYS.gapClear;
    else if (o.type === 'high') hit = run.slideT <= 0 || run.air;
    else if (o.type === 'puddle') { if (run.y < PHYS.gapClear && !o.contact) { o.contact = true; run.gap += s.puddleCost; run.slowT = 0.5; run.splashes++; emit('splash', o); } return; }
    if (o.wall && hit) { o.hit = true; stumble(o); wallPush(o); return; }
    if (hit && !o.contact) { o.contact = true; o.hit = true; stumble(o); }
  }

  function moveSuspect(dt) {
    const sp = run.suspect;
    sp.ahead = aheadFor(run.gap);
    const at = run.dist + sp.ahead;
    const tx = spineAt(run.spine, at + 2);
    const k = s.vx * dt;
    sp.x += Math.max(-k, Math.min(k, tx - sp.x));
    for (let i = 0; i < run.objs.length; i++) {
      const o = run.objs[i];
      if (o.d < at - 0.5) continue;
      if (o.d > at + 8) break;
      if (!o.span || o.hidden || o.type === 'stairs') continue;
      const tt = (o.d - o.len / 2 - at) / Math.max(1, run.speed);
      if ((o.type === 'low' || o.type === 'gap') && !sp.air && tt < 0.3) { sp.air = true; sp.vy = JUMP_V * 0.9; }
      if (o.type === 'high' && sp.slideT <= 0 && tt < 0.25) sp.slideT = PHYS.slideT;
      break;
    }
    if (sp.air) { sp.vy -= G * dt; sp.y += sp.vy * dt; if (sp.y <= 0) { sp.y = 0; sp.vy = 0; sp.air = false; } }
    if (sp.slideT > 0) sp.slideT -= dt;
    sp.ground = groundAt(run.features, at);
  }

  run.step = (dt) => {
    if (run.status !== 'run') return;
    run.t += dt;
    const nominal = speedAt(s, run.dist);
    const rising = run.ground > 0 && groundAt(run.features, run.dist + 0.5) > run.ground;
    run.speed = nominal * (run.stumbleT > 0 ? PHYS.stumbleSpeed : 1) * (run.sprintT > 0 ? PHYS.sprintSpeed : 1) * (run.slowT > 0 ? 0.8 : 1) * (rising ? 0.9 : 1);
    run.dist += run.speed * dt;
    run.ground = groundAt(run.features, run.dist);
    // steering: held keys set a velocity, a finger / tilt / bot sets a target
    const want = run.steerMode === 'held' ? run.steerVal * s.vx : Math.max(-s.vx, Math.min(s.vx, (run.steerX - run.x) * 12));
    const acc = PHYS.steerAccel * dt;
    run.vx += Math.max(-acc, Math.min(acc, want - run.vx));
    run.x += run.vx * dt;
    if (run.x < -X_MAX) { run.x = -X_MAX; run.vx = Math.max(0, run.vx); }
    if (run.x > X_MAX) { run.x = X_MAX; run.vx = Math.min(0, run.vx); }
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
    fill();
    for (let i = 0; i < run.objs.length; i++) {
      const o = run.objs[i];
      const ahead = o.d - run.dist;
      if (ahead - o.len / 2 > 60) break;
      if (o.anim && !o.settled && ahead <= o.reveal) {
        o.settled = true;
        if (o.hidden) { o.hidden = false; emit('throw', o); } else emit('settle', o);
      }
      if (o.anim && o.anim.type === 'throw' && !o.told && ahead <= o.reveal + run.speed * 0.7) { o.told = true; emit('tell', o); }
      if (Math.abs(ahead) < o.len / 2 + 0.2) {
        const reachX = o.type === 'cup' ? 0.6 : HIT_R;
        if (Math.abs(run.x - o.x) < o.w / 2 + reachX) touch(o);
      } else if (ahead < 0 && !o.passed) { o.passed = true; run.passed++; }
    }
    while (run.objs.length && run.objs[0].d + run.objs[0].len / 2 < run.dist - 22) { const o = run.objs.shift(); hooks.onDrop?.(o); }
    for (let i = 0; i < run.features.length; i++) {
      const f = run.features[i];
      if (f.type === 'fork' && !f.done && run.dist >= f.d1) {
        f.done = true;
        if (Math.sign(run.x) === f.short) { run.gap = Math.max(0.5, run.gap - f.bonus); run.shortcuts++; emit('shortcut'); }
      }
    }
    while (run.features.length && run.features[0].d1 < run.dist - 60) run.features.shift();
    while (run.spine.length > 8 && run.spine[2] < run.dist - 10) run.spine.splice(0, 2);
    if (run.stumbleT > 0) run.gap += s.drift * dt;
    else {
      const u = run.t / (s.legT || 120), late = Math.max(0, u - 0.9);
      run.gap -= (s.close * (1 + 0.6 * u + 2.5 * late * late) + (run.sprintT > 0 ? s.sprintClose : 0)) * dt;
    }
    if (run.stumbleT > 0) run.stumbleT = Math.max(0, run.stumbleT - dt);
    if (run.graceT > 0) run.graceT = Math.max(0, run.graceT - dt);
    if (run.sprintT > 0) run.sprintT = Math.max(0, run.sprintT - dt);
    if (run.slowT > 0) run.slowT = Math.max(0, run.slowT - dt);
    if (run.gap < run.best) run.best = run.gap;
    moveSuspect(dt);
    if (run.gap <= 0) {
      run.gap = 0; run.best = 0;
      if (s.final) { run.status = 'caught'; emit('caught'); } else { run.status = 'escaped'; emit('escape'); }
    } else if (run.gap > run.maxGap) { run.status = 'lost'; emit('lost'); }
  };

  run.slip = (m = 10) => { run.gap = Math.max(1.5, run.gap - m); if (run.gap < run.best) run.best = run.gap; };
  /** The hint's other option: take the hardest set-piece out of the next stretch. Returns its name. */
  run.skipPiece = () => {
    let best = null;
    for (const o of run.objs) {
      if (!o.piece || o.d < run.dist + 35 || o.d > run.dist + 260 || o.piece.skipped) continue;
      if (!best || o.piece.score > best.score) best = o.piece;
    }
    if (!best) return null;
    best.skipped = true;
    for (let i = run.objs.length - 1; i >= 0; i--) {
      const o = run.objs[i];
      if (o.piece !== best) continue;
      hooks.onDrop?.(o);
      run.objs.splice(i, 1);
    }
    for (let i = run.features.length - 1; i >= 0; i--) if (run.features[i].piece === best) run.features.splice(i, 1);
    return best.name;
  };
  run.closed = () => Math.max(0, Math.min(1, (run.startGap - run.gap) / run.startGap));
  run.dispose = () => { while (run.objs.length) { const o = run.objs.shift(); hooks.onDrop?.(o); } };
  return run;
}

// ---- a planner over what you can see: the test bot steers with it -----------------------------
/**
 * Plan a steering target. Sees only what has been out of the fog (`sight` metres) for `reaction`
 * seconds, and things that settle late only `reaction` seconds after they settle.
 * Returns { x, act } where act is 'jump', 'slide' or null for a full-width hurdle just ahead.
 */
export function plan(run, { sight = SIGHT, reaction = run.spec.reaction, preferShort = true, bufs = null } = {}) {
  const s = run.spec, v = Math.max(1, run.speed);
  const horizon = Math.max(8, sight - v * reaction);
  const n = Math.min(79, Math.ceil(horizon / DD));
  const d0 = Math.floor(run.dist); // rows on whole metres, the same grid the scatter was checked on
  const rc = reachCells(s.vx, fastest(s));
  const B = bufs || (plan.bufs ||= { grid: new Uint8Array(80 * NC), safe: Array.from({ length: 80 }, () => new Uint8Array(NC)), tmp: new Uint8Array(NC) });
  const known = (o) => !o.hidden && (!o.anim || (o.settled && o.reveal - (o.d - d0) >= v * reaction));
  const vis = [];
  for (const o of run.objs) { if (o.d - o.len / 2 > d0 + horizon) break; if (o.d + o.len / 2 + 0.5 < d0) continue; if (known(o)) vis.push(o); }
  rasterise(vis, d0, n, B.grid);
  if (preferShort) for (const f of run.features) if (f.type === 'fork' && f.d0 - d0 < horizon && f.d1 > d0) {
    const committed = d0 > f.d0 - 1 && Math.sign(run.x) !== f.short;
    if (!committed) for (let j = 0; j < n; j++) {
      const d = d0 + j * DD;
      if (d < f.d0 - 5 || d > f.d1) continue;
      for (let i = 0; i < NC; i++) if (Math.sign(cellX(i)) !== f.short) B.grid[j * NC + i] = 1;
    }
  }
  const safe = B.safe;
  for (let i = 0; i < NC; i++) safe[n - 1][i] = B.grid[(n - 1) * NC + i] ? 0 : 1;
  for (let j = n - 2; j >= 0; j--) {
    dilate(safe[j + 1], rc, B.tmp);
    for (let i = 0; i < NC; i++) safe[j][i] = B.tmp[i] && !B.grid[j * NC + i] ? 1 : 0;
  }
  // keep to the middle of the open corridor (most room either side), not its edge
  let ci = cellOf(run.x);
  const look = Math.max(1, Math.min(n - 1, Math.round((v * 0.25) / DD)));
  const clr = B.clr || (B.clr = new Float32Array(NC));
  let target = run.x;
  const path = B.path || (B.path = new Float32Array(80));
  path[0] = run.x;
  for (let j = 1; j < n; j++) {
    const row = safe[j];
    let c = 0;
    for (let i = 0; i < NC; i++) { c = row[i] ? c + 1 : 0; clr[i] = c; }
    c = 0;
    for (let i = NC - 1; i >= 0; i--) { c = row[i] ? c + 1 : 0; if (c < clr[i]) clr[i] = c; }
    let best = -1, bv = -1e9;
    // stick to the line chosen last time (a person commits to a side)
    const pj = Math.round(d0 + j - (B.prevD0 ?? -1e9));
    const prevC = pj >= 0 && pj < (B.prevN || 0) ? cellOf(B.prevPath[pj]) : -1;
    for (let i = Math.max(0, ci - rc); i <= Math.min(NC - 1, ci + rc); i++) if (row[i]) {
      const val = Math.min(clr[i], 14) - Math.abs(i - ci) * 0.25 - (prevC >= 0 ? Math.abs(i - prevC) * 0.6 : 0);
      if (val > bv) { bv = val; best = i; }
    }
    if (best < 0) { // cornered: head for the nearest safe place as fast as allowed
      let bd = 1e9, near = -1;
      for (let i = 0; i < NC; i++) if (row[i] && Math.abs(i - ci) < bd) { bd = Math.abs(i - ci); near = i; }
      if (near >= 0) best = ci + Math.sign(near - ci) * Math.min(rc * 2, Math.abs(near - ci));
    }
    if (best >= 0) ci = best;
    path[j] = cellX(ci);
    if (j === look) target = path[j];
    if (j >= look + 2) break;
  }
  let act = null;
  // about to clip something low or high that is not across the whole street: jump it, slide under it
  for (const o of vis) {
    if (o.span || o.d + o.len / 2 < d0) continue;
    const tt = (o.d - o.len / 2 - d0) / v;
    if (tt > 0.4) break;
    const xAt = run.x + run.vx * Math.max(0, tt);
    if (Math.abs(xAt - o.x) > o.w / 2 + HIT_R + 0.05) continue;
    if ((o.type === 'low' || o.type === 'gap') && tt < 0.26) act = 'jump';
    if (o.type === 'high' && tt < 0.18) act = 'slide';
  }
  for (const o of vis) {
    if (!o.span || o.type === 'stairs' || o.d + o.len / 2 < d0) continue;
    const tt = (o.d - o.len / 2 - d0) / v;
    if (tt > 0.5) break;
    if ((o.type === 'low' || o.type === 'gap') && tt < 0.26) act = 'jump';
    if (o.type === 'high' && tt < 0.18) act = 'slide';
    break;
  }
  // remember this line (in absolute distance) for next time
  const pp = B.prevPath || (B.prevPath = new Float32Array(80));
  let pn = 0;
  for (let j = 0; j < n && j <= look + 2; j++) pp[pn++] = path[j];
  B.prevD0 = Math.round(d0); B.prevN = pn;
  // the speed across that follows the path's slope over the next couple of metres
  const vxWant = Math.max(-s.vx, Math.min(s.vx, ((path[1] - run.x) * v) / DD));
  return { x: target, act, vx: vxWant };
}
