// Foot Chase: low-poly procedural geometry for the five night settings. No image files.
// Every model is built once into two merged, vertex-coloured geometries (a lit body and an unlit
// glow part) that the scene draws as instanced meshes. Lights a model carries (halo, ground pool,
// wet-road streak, optional point light) are recorded in model space.
//
// Side scenery is modelled with its street frontage along z and facing +x (the lane is at +x);
// the right side of the street is the same model turned half a circle.
// Obstacles are modelled centred in one lane (or across all three for a span), facing +z.
import * as THREE from 'three';
import { mulberry32 } from '../core/rng.js';

const TM = new THREE.Matrix4(), TQ = new THREE.Quaternion(), TE = new THREE.Euler(), TP = new THREE.Vector3(), TS = new THREE.Vector3(), TC = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0), TD = new THREE.Vector3();
const PI = Math.PI;

function prep(geom) {
  const g = geom.index ? geom.toNonIndexed() : geom;
  if (g !== geom) geom.dispose();
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  return g;
}

function merge(list) {
  if (!list.length) return null;
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o);
    nor.set(g.attributes.normal.array, o);
    col.set(g.attributes.color.array, o);
    o += g.attributes.position.count * 3;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}

/** Geometry builder: boxes, cylinders, spheres, beams, roofs, extruded shapes, lights. */
export class GB {
  constructor(seed = 1) {
    this.rng = mulberry32(seed);
    this.body = [];
    this.glow = [];
    this.lights = [];
    this.stack = [new THREE.Matrix4()];
  }
  get top() { return this.stack[this.stack.length - 1]; }
  push(x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, s = 1) {
    TE.set(rx, ry, rz);
    TQ.setFromEuler(TE);
    const m = new THREE.Matrix4().compose(TP.set(x, y, z), TQ, TS.set(s, s, s));
    this.stack.push(this.top.clone().multiply(m));
    return this;
  }
  pop() { this.stack.pop(); return this; }
  r(a = 0, b = 1) { return a + this.rng() * (b - a); }
  pick(arr) { return arr[Math.floor(this.rng() * arr.length)]; }

  colorize(g, color, o) {
    TC.set(color);
    let k = o.i || 1;
    if (o.jit) k *= 1 + (this.rng() * 2 - 1) * o.jit;
    const n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = TC.r * k; a[i * 3 + 1] = TC.g * k; a[i * 3 + 2] = TC.b * k; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    (o.glow ? this.glow : this.body).push(g);
  }
  add(geom, color, o = {}) {
    const g = prep(geom);
    TE.set(o.rx || 0, o.ry || 0, o.rz || 0);
    TQ.setFromEuler(TE);
    TM.compose(TP.set(o.x || 0, o.y || 0, o.z || 0), TQ, TS.set(o.sx || 1, o.sy || 1, o.sz || 1));
    TM.premultiply(this.top);
    g.applyMatrix4(TM);
    this.colorize(g, color, o);
    return this;
  }
  /** Box with its base at y. */
  box(w, h, d, x, y, z, color, o = {}) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    o.x = x; o.y = y; o.z = z;
    return this.add(g, color, o);
  }
  /** Cylinder with its base at y (axis up unless rotated). */
  cyl(rt, rb, h, x, y, z, color, o = {}) {
    const g = new THREE.CylinderGeometry(rt, rb, h, o.seg || 8, 1, !!o.open);
    g.translate(0, h / 2, 0);
    o.x = x; o.y = y; o.z = z;
    return this.add(g, color, o);
  }
  /** Cylinder lying along x, centred at (x,y,z). */
  cylX(r, len, x, y, z, color, o = {}) {
    const g = new THREE.CylinderGeometry(r, r, len, o.seg || 10);
    g.rotateZ(PI / 2);
    o.x = x; o.y = y; o.z = z;
    return this.add(g, color, o);
  }
  /** Cylinder lying along z, centred at (x,y,z). */
  cylZ(r, len, x, y, z, color, o = {}) {
    const g = new THREE.CylinderGeometry(r, r, len, o.seg || 10);
    g.rotateX(PI / 2);
    o.x = x; o.y = y; o.z = z;
    return this.add(g, color, o);
  }
  sph(r, x, y, z, color, o = {}) {
    const g = new THREE.SphereGeometry(r, o.ws || 8, o.hs || 6);
    o.x = x; o.y = y; o.z = z;
    return this.add(g, color, o);
  }
  /** A thin box from point a to point b. */
  beam(a, b, t, color, o = {}) {
    TD.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const len = TD.length();
    const g = prep(new THREE.BoxGeometry(o.tw || t, len, o.td || t));
    g.translate(0, len / 2, 0);
    TQ.setFromUnitVectors(UP, TD.normalize());
    TM.compose(TP.set(a[0], a[1], a[2]), TQ, TS.set(1, 1, 1));
    TM.premultiply(this.top);
    g.applyMatrix4(TM);
    this.colorize(g, color, o);
    return this;
  }
  /** A sagging wire from a to b made of `n` beams. */
  wire(a, b, sag, t, color, n = 6, o = {}) {
    let p = a;
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      const q = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u), a[2] + (b[2] - a[2]) * u];
      this.beam(p, q, t, color, o);
      p = q;
    }
    return this;
  }
  /** Point on a sagging wire. */
  static wireAt(a, b, sag, u) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u), a[2] + (b[2] - a[2]) * u]; }
  /** Gable roof: ridge along z, width w across x, rise h, base at y. */
  roof(w, d, h, x, y, z, color, o = {}) {
    const hw = w / 2, hd = d / 2;
    const v = [
      // two slopes
      -hw, 0, hd, 0, h, hd, 0, h, -hd, -hw, 0, hd, 0, h, -hd, -hw, 0, -hd,
      hw, 0, hd, hw, 0, -hd, 0, h, -hd, hw, 0, hd, 0, h, -hd, 0, h, hd,
      // gable ends
      -hw, 0, hd, hw, 0, hd, 0, h, hd,
      hw, 0, -hd, -hw, 0, -hd, 0, h, -hd,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
    g.computeVertexNormals();
    o.x = x; o.y = y; o.z = z;
    return this.add(g, color, o);
  }
  /** A flat shape (THREE.Shape in the yz plane, facing +x), extruded `depth` toward -x. */
  shape(shape, depth, x, y, z, color, o = {}) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
    // shape is drawn in (u, v) = (z, y); extrude goes along +w; map to x = -w
    g.rotateY(PI / 2);
    g.translate(-depth, 0, 0);
    o.x = x; o.y = y; o.z = z;
    return this.add(g, color, o);
  }
  /** Lights carried by this model. spec: { c, i, halo, pool, streak, point } */
  light(x, y, z, spec) {
    TP.set(x, y, z).applyMatrix4(this.top);
    this.lights.push({ x: TP.x, y: TP.y, z: TP.z, c: spec.c, i: spec.i || 1, halo: spec.halo || 0, pool: spec.pool || 0, streak: spec.streak || 0, point: spec.point || 0 });
    return this;
  }
  build() { return { body: merge(this.body), glow: merge(this.glow), lights: this.lights }; }
}

// ---------------------------------------------------------------------------------------------
// shared pieces

const WOOD = '#6b4a2e', WOOD_D = '#47311f', STEEL = '#59636a', STEEL_D = '#2f363b', BLACK = '#121417', RUBBER = '#16181a';
const SARONG = ['#7a1e2c', '#1f5d63', '#b8862f', '#3b3f7a', '#9a4a2a', '#cdbf9d', '#2f6b45', '#5a2a52'];
const BULB = '#ffc477';

function wheel(gb, r, w, x, y, z) {
  gb.cylX(r, w, x, y, z, RUBBER, { seg: 12 });
  gb.cylX(r * 0.45, w * 1.1, x, y, z, '#8a9096', { seg: 8 });
}

/** A kapcai / step-through motorbike, along z, at the origin. */
function bike(gb, body = '#2b4f7a', o = {}) {
  wheel(gb, 0.3, 0.1, 0, 0.3, 0.62);
  wheel(gb, 0.3, 0.1, 0, 0.3, -0.62);
  gb.box(0.26, 0.28, 0.9, 0, 0.38, -0.12, body, { jit: 0.05 }); // body under the seat
  gb.box(0.3, 0.12, 0.62, 0, 0.72, -0.2, '#141414'); // seat
  gb.box(0.32, 0.22, 0.6, 0, 0.5, -0.25, body);
  gb.beam([0, 0.35, 0.55], [0, 1.0, 0.42], 0.08, STEEL_D); // fork
  gb.box(0.36, 0.5, 0.12, 0, 0.45, 0.42, body, { rx: -0.25 }); // leg shield
  gb.box(0.62, 0.05, 0.05, 0, 1.0, 0.42, STEEL); // handlebar
  gb.box(0.2, 0.14, 0.12, 0, 0.9, 0.5, body);
  gb.box(0.12, 0.08, 0.04, 0, 0.92, 0.57, '#fff2d0', { glow: true, i: o.lit ? 1.6 : 0.35 });
  gb.box(0.14, 0.06, 0.04, 0, 0.66, -0.58, '#ff2a2a', { glow: true, i: o.lit ? 1.8 : 0.4 });
  if (o.box) gb.box(0.48, 0.42, 0.46, 0, 0.8, -0.42, o.box, { jit: 0.05 });
  if (o.helmet) gb.sph(0.15, 0, 1.08, 0.36, o.helmet, { sy: 0.85 });
}

function crate(gb, w, h, d, x, y, z, c = WOOD) {
  gb.box(w, h, d, x, y, z, c, { jit: 0.08 });
  // slats
  for (const yy of [0.25, 0.7]) gb.box(w + 0.02, h * 0.1, d + 0.02, x, y + h * yy, z, WOOD_D);
  gb.box(w * 0.08, h, d + 0.03, x - w * 0.42, y, z, WOOD_D);
  gb.box(w * 0.08, h, d + 0.03, x + w * 0.42, y, z, WOOD_D);
}

function plasticCrate(gb, w, h, d, x, y, z, c) {
  gb.box(w, h, d, x, y, z, c, { jit: 0.06 });
  gb.box(w + 0.02, h * 0.18, d + 0.02, x, y + h * 0.82, z, c, { i: 0.75 });
  gb.box(w * 0.6, h * 0.25, d + 0.03, x, y + h * 0.42, z, BLACK, { i: 1 }); // handle hole
}

function stool(gb, x, z, c) {
  gb.cyl(0.17, 0.2, 0.06, x, 0.44, z, c);
  for (const [dx, dz] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) gb.beam([x + dx * 1.2, 0, z + dz * 1.2], [x + dx * 0.7, 0.45, z + dz * 0.7], 0.035, c);
}

function umbrella(gb, x, y, z, r, c, c2) {
  gb.cyl(0.025, 0.025, y, x, 0, z, '#c9c4b8');
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * PI * 2;
    gb.push(x, y, z, a);
    gb.box(r * 0.8, 0.03, r * 0.42, r * 0.42, -0.18, 0, i % 2 ? c : c2, { rz: -0.32 });
    gb.pop();
  }
  gb.cyl(0, 0.06, 0.12, x, y, z, c2);
}

function lantern(gb, x, y, z, c = '#ff3a2a', s = 1) {
  gb.box(0.02, 0.14 * s, 0.02, x, y + 0.4 * s, z, '#2a1a10');
  gb.sph(0.21 * s, x, y + 0.2 * s, z, c, { glow: true, i: 1.9, sy: 0.85, ws: 10, hs: 7 });
  gb.cyl(0.13 * s, 0.13 * s, 0.05 * s, x, y + 0.36 * s, z, '#d9a640', { glow: true, i: 0.9 });
  gb.cyl(0.13 * s, 0.13 * s, 0.05 * s, x, y - 0.0, z, '#d9a640', { glow: true, i: 0.9 });
  gb.box(0.02, 0.18 * s, 0.02, x, y - 0.18 * s, z, '#d9a640', { glow: true, i: 0.8 });
}

function bulbOn(gb, x, y, z, c = BULB, r = 0.07) {
  gb.box(0.01, 0.12, 0.01, x, y + r, z, '#111');
  gb.sph(r, x, y, z, c, { glow: true, i: 2.4, ws: 6, hs: 4 });
}

function palm(gb, x, z, h, lean, seed) {
  const r = mulberry32(seed);
  let px = x, py = 0, pz = z;
  const segs = 7;
  const dx = lean * (r() < 0.5 ? -1 : 1), dz = (r() - 0.5) * 0.6;
  for (let i = 0; i < segs; i++) {
    const u = (i + 1) / segs;
    const nx = x + dx * u * u * h * 0.25, ny = h * u, nz = z + dz * u * u * h * 0.2;
    gb.beam([px, py, pz], [nx, ny + 0.05, nz], 0.24 - u * 0.08, i % 2 ? '#5d5244' : '#544a3e');
    px = nx; py = ny; pz = nz;
  }
  // crown
  const fronds = 10;
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * PI * 2 + r() * 0.3;
    const len = 2.4 + r() * 0.8;
    const ca = Math.cos(a), sa = Math.sin(a);
    const m1 = [px + ca * len * 0.45, py + 0.35, pz + sa * len * 0.45];
    const m2 = [px + ca * len, py - 0.9 - r() * 0.6, pz + sa * len];
    gb.beam([px, py, pz], m1, 0.08, '#2f4a2a', { tw: 0.5, td: 0.04 });
    gb.beam(m1, m2, 0.08, '#2a4426', { tw: 0.42, td: 0.04 });
  }
  for (let i = 0; i < 4; i++) gb.sph(0.13, px + Math.cos(i * 1.7) * 0.22, py - 0.25, pz + Math.sin(i * 1.7) * 0.22, '#5a4a26');
}

// ---------------------------------------------------------------------------------------------
// obstacles (centred in a lane, facing +z, lane is 2.2 m wide)

const LOW = {
  crates(gb) {
    crate(gb, 0.88, 0.62, 0.7, -0.47, 0, 0);
    crate(gb, 0.88, 0.62, 0.7, 0.47, 0, 0.05, '#7a5634');
    for (let i = 0; i < 9; i++) gb.sph(0.09, -0.8 + (i % 5) * 0.38 + gb.r(-0.05, 0.05), 0.68, gb.r(-0.2, 0.2), gb.pick(['#e08a2a', '#d2a33a', '#c45a22']));
  },
  plastic(gb) {
    const cs = ['#b8262d', '#2a5fa8', '#d6a12a', '#2f7a4a'];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) plasticCrate(gb, 0.86, 0.32, 0.6, -0.46 + i * 0.92, j * 0.33, gb.r(-0.05, 0.05), gb.pick(cs));
  },
  barrier(gb) {
    gb.box(1.9, 0.5, 0.42, 0, 0, 0, '#d8641e', { jit: 0.04 });
    gb.box(1.8, 0.14, 0.34, 0, 0.5, 0, '#d8641e');
    gb.box(1.92, 0.1, 0.44, 0, 0.26, 0, '#e8e2d2');
    gb.box(0.12, 0.08, 0.12, 0.7, 0.64, 0, '#ffb43a', { glow: true, i: 2.6 });
    gb.light(0.7, 0.72, 0, { c: '#ffb43a', halo: 0.8, i: 0.9 });
  },
  kerb(gb) {
    gb.box(1.95, 0.42, 0.5, 0, 0, 0, '#8d8a82', { jit: 0.05 });
    for (let i = 0; i < 6; i++) gb.box(0.18, 0.3, 0.02, -0.82 + i * 0.33, 0.06, 0.26, i % 2 ? '#141414' : '#e0b52a', { rz: 0.5 });
  },
  bags(gb) {
    for (let i = 0; i < 5; i++) gb.sph(0.3, -0.7 + i * 0.36, 0.24, gb.r(-0.15, 0.15), '#14181b', { sy: 0.85, sx: 1.1, ws: 7, hs: 5, jit: 0.2 });
    gb.box(0.5, 0.36, 0.4, 0.55, 0.35, -0.1, '#8a6a44', { ry: 0.4 });
  },
  drums(gb) {
    const cs = ['#2a4f8a', '#8a2a24', '#3b6b4a'];
    for (const x of [-0.46, 0.46]) {
      const c = gb.pick(cs);
      gb.cylX(0.3, 0.86, x, 0.3, 0, c, { seg: 12 });
      gb.cylX(0.31, 0.06, x - 0.25, 0.3, 0, '#555', { seg: 12 });
      gb.cylX(0.31, 0.06, x + 0.25, 0.3, 0, '#555', { seg: 12 });
    }
  },
  pallets(gb) {
    for (let k = 0; k < 3; k++) {
      gb.box(1.8, 0.04, 1.0, 0, k * 0.15 + 0.11, 0, '#9a7b52', { jit: 0.06 });
      for (const x of [-0.8, 0, 0.8]) gb.box(0.12, 0.11, 1.0, x, k * 0.15, 0, '#7c6040');
    }
    gb.box(1.2, 0.22, 0.8, 0.1, 0.45, 0, '#2c4b5a', { jit: 0.08 }); // wrapped load
  },
  pots(gb) {
    for (const x of [-0.65, 0, 0.65]) {
      gb.cyl(0.28, 0.2, 0.46, x, 0, 0, gb.pick(['#2f5f73', '#7a3a22', '#2a5a48']), { seg: 10 });
      gb.sph(0.3, x, 0.58, 0, '#2c4a2a', { jit: 0.15, sy: 0.7 });
    }
  },
  log(gb) {
    gb.cylX(0.27, 2.0, 0, 0.27, 0, '#5d5244', { seg: 9 });
    for (let i = 0; i < 6; i++) gb.cylX(0.285, 0.04, -0.85 + i * 0.34, 0.27, 0, '#4a4136', { seg: 9 });
  },
  planks(gb) {
    for (let k = 0; k < 4; k++) gb.box(1.95, 0.1, 0.24, gb.r(-0.06, 0.06), k * 0.11, -0.3 + (k % 2) * 0.3, '#8a6a46', { jit: 0.12, ry: gb.r(-0.06, 0.06) });
    gb.box(1.9, 0.1, 0.24, 0, 0.44, 0, '#7a5a3a', { ry: 0.05 });
  },
  coconuts(gb) {
    gb.cyl(0.42, 0.34, 0.38, -0.45, 0, 0, '#8a6a3a', { seg: 10 });
    gb.cyl(0.42, 0.34, 0.38, 0.45, 0, 0, '#7a5a30', { seg: 10 });
    for (let i = 0; i < 10; i++) gb.sph(0.15, gb.r(-0.75, 0.75), 0.42 + gb.r(0, 0.12), gb.r(-0.2, 0.2), gb.pick(['#4a5a26', '#5a4a26', '#3f4f22']));
  },
  bin(gb) {
    gb.cylX(0.34, 0.95, 0, 0.34, 0, '#2a6a4a', { seg: 10 });
    gb.box(0.08, 0.7, 0.72, 0.5, 0, 0, '#235a3e');
    for (let i = 0; i < 3; i++) gb.sph(0.22, -0.6 + i * 0.5, 0.18, 0.35 + gb.r(0, 0.2), '#14181b', { sy: 0.8 });
  },
};

// high: something to slide under. The underside sits at 1.2 m or higher; posts stand at the lane edges.
function posts(gb, h, c = '#6d6a62', x = 1.0) {
  gb.cyl(0.04, 0.05, h, -x, 0, 0, c);
  gb.cyl(0.04, 0.05, h, x, 0, 0, c);
}
function clothes(gb, x0, x1, y, palette, minDrop = 0.58, maxDrop = 0.72) {
  let x = x0;
  while (x < x1 - 0.2) {
    const w = gb.r(0.34, 0.62), drop = gb.r(minDrop, maxDrop);
    gb.box(Math.min(w, x1 - x), drop, 0.03, x + Math.min(w, x1 - x) / 2, y - drop, gb.r(-0.03, 0.03), gb.pick(palette), { jit: 0.1, rz: gb.r(-0.05, 0.05) });
    x += w + 0.04;
  }
}
const HIGH = {
  laundry(gb) {
    posts(gb, 2.05, '#8a8478');
    gb.beam([-1.0, 1.98, 0], [1.0, 1.98, 0], 0.03, '#ccc');
    clothes(gb, -0.95, 0.95, 1.97, SARONG);
  },
  tarp(gb) {
    posts(gb, 2.25, '#9a8a5a');
    gb.beam([-1.0, 2.2, 0], [1.0, 2.2, 0], 0.07, '#9a8a5a');
    const c = gb.pick(['#2a5c9a', '#2a7a8a', '#b8402a']);
    gb.box(1.95, 0.06, 0.62, -0.5, 1.7, 0, c, { rz: 0.42, jit: 0.04 });
    gb.box(1.95, 0.06, 0.62, 0.5, 1.7, 0, c, { rz: -0.42, jit: 0.04 });
    gb.box(1.9, 0.38, 0.04, 0, 1.28, 0.3, c, { i: 0.85 });
  },
  pipe(gb) {
    for (const x of [-1.0, 1.0]) { gb.box(0.1, 1.72, 0.1, x, 0, 0, '#5b5f63'); gb.box(0.36, 0.08, 0.36, x, 0, 0, '#3a3d40'); }
    gb.cylX(0.2, 2.3, 0, 1.47, 0, '#7a7f84', { seg: 12 });
    for (let i = 0; i < 5; i++) gb.cylX(0.205, 0.2, -0.9 + i * 0.45, 1.47, 0, i % 2 ? '#141414' : '#e0b52a', { seg: 12 });
  },
  heightbar(gb) {
    posts(gb, 1.75, '#d9b02a', 1.02);
    gb.box(2.2, 0.22, 0.14, 0, 1.5, 0, '#e0b52a');
    for (let i = 0; i < 6; i++) gb.box(0.18, 0.22, 0.02, -0.95 + i * 0.38, 1.5, 0.08, '#141414', { rz: 0.6 });
    for (let i = 0; i < 7; i++) gb.box(0.02, 0.28, 0.02, -0.9 + i * 0.3, 1.22, 0, '#777');
    gb.box(0.1, 0.08, 0.1, -1.02, 1.75, 0, '#ffb43a', { glow: true, i: 2.4 });
    gb.light(-1.02, 1.8, 0, { c: '#ffb43a', halo: 0.7, i: 0.8 });
  },
  sign(gb) {
    posts(gb, 2.3, '#3a2a1e', 1.0);
    gb.box(2.1, 0.08, 0.1, 0, 2.22, 0, '#3a2a1e');
    for (const x of [-0.7, 0.7]) gb.box(0.02, 0.45, 0.02, x, 1.77, 0, '#888');
    gb.box(1.75, 0.52, 0.06, 0, 1.25, 0, '#5a3a22', { jit: 0.05 });
    gb.box(1.62, 0.4, 0.07, 0, 1.31, 0, '#7a1e1c');
    gb.box(1.4, 0.06, 0.08, 0, 1.47, 0, '#c9a04a', { glow: true, i: 0.5 });
  },
  lanterns(gb) {
    posts(gb, 2.25, '#5a1e18', 1.0);
    gb.beam([-1.0, 2.15, 0], [1.0, 2.15, 0], 0.05, '#2a1a10');
    for (const x of [-0.6, 0, 0.6]) {
      gb.box(0.015, 0.3, 0.015, x, 1.85, 0, '#222');
      lantern(gb, x, 1.32, 0, '#ff3a2a', 1.15);
    }
    gb.light(0, 1.6, 0.1, { c: '#ff4a32', halo: 1.6, i: 0.7 });
  },
  cables(gb) {
    posts(gb, 2.2, '#5b5f63', 1.02);
    gb.box(2.15, 0.1, 0.1, 0, 2.1, 0, '#5b5f63');
    for (let k = 0; k < 4; k++) gb.wire([-1.0, 2.05, k * 0.04], [1.0, 2.05, k * 0.04], 0.55 + k * 0.08, 0.035, '#141414', 6);
    gb.box(1.4, 0.08, 0.2, 0, 1.36, 0, '#d9dde0');
    gb.box(1.3, 0.04, 0.12, 0, 1.33, 0, '#dff4ff', { glow: true, i: 2.2 });
    gb.light(0, 1.3, 0, { c: '#cdeeff', halo: 1.2, i: 0.6 });
  },
  kain(gb) {
    posts(gb, 2.1, '#7a6a4a', 1.0);
    gb.beam([-1.0, 2.0, 0], [1.0, 2.0, 0], 0.025, '#bbb');
    clothes(gb, -0.95, 0.95, 1.99, ['#7a2a4a', '#2a5a6a', '#b8782a', '#4a2a6a', '#8a3a2a', '#3a6a3a'], 0.6, 0.76);
  },
};

const BLOCK = {
  motorbike(gb) {
    gb.push(-0.45, 0, 0.1, 0.15); bike(gb, gb.pick(['#2b4f7a', '#7a2b2b', '#2b6a5a']), { box: '#c9302c' }); gb.pop();
    gb.push(0.5, 0, -0.15, -0.2); bike(gb, gb.pick(['#c9c3b0', '#3a3a3a', '#7a6a2b']), { box: '#2a6a3a', helmet: '#d8d2c2' }); gb.pop();
  },
  cart(gb) {
    gb.box(1.8, 0.75, 0.9, 0, 0.25, 0, '#8a6a46', { jit: 0.05 });
    gb.box(1.8, 0.05, 0.94, 0, 1.0, 0, '#b0aa9a');
    wheel(gb, 0.22, 0.08, -0.75, 0.22, 0.38); wheel(gb, 0.22, 0.08, 0.75, 0.22, 0.38);
    wheel(gb, 0.22, 0.08, -0.75, 0.22, -0.38); wheel(gb, 0.22, 0.08, 0.75, 0.22, -0.38);
    gb.box(1.5, 0.6, 0.7, 0, 1.05, 0, '#3a5560', { i: 0.7 }); // glass case
    gb.box(1.4, 0.5, 0.02, 0, 1.1, 0.36, '#ffe2a8', { glow: true, i: 0.45 });
    gb.box(1.6, 0.06, 0.8, 0, 1.65, 0, '#c9c4b8');
    gb.cyl(0.03, 0.03, 0.75, 0.82, 1.0, -0.38, '#888');
    umbrella(gb, 0, 2.3, 0, 1.1, '#b8402a', '#e8dcc0');
    bulbOn(gb, 0, 1.95, 0.1);
    gb.light(0, 1.95, 0.1, { c: BULB, halo: 1.2, pool: 2.2, i: 0.9 });
  },
  table(gb) {
    gb.box(0.9, 0.05, 0.9, -0.3, 0.72, 0, '#d9d2c0');
    gb.cyl(0.04, 0.08, 0.72, -0.3, 0, 0, '#888');
    stool(gb, -0.85, 0.3, '#c0282a'); stool(gb, 0.2, 0.35, '#2a5fa8'); stool(gb, -0.4, -0.55, '#c0282a');
    for (let k = 0; k < 4; k++) gb.cyl(0.18, 0.21, 0.4, 0.62, k * 0.3, 0, '#2a5fa8'); // stacked stools
    umbrella(gb, -0.3, 2.35, 0, 1.15, '#2a6a4a', '#d8d0b0');
    gb.box(0.08, 0.12, 0.08, -0.4, 0.77, 0.1, '#c98a3a', { glow: true, i: 0.5 }); // a glass of teh
  },
  container(gb, c = '#8a3a2a') {
    const W = 1.95, H = 2.55, L = 5.8;
    gb.box(W, H, L, 0, 0, -L / 2 + 0.4, c, { jit: 0.04 });
    for (let i = 0; i < 18; i++) {
      gb.box(0.06, H - 0.2, 0.08, -W / 2 - 0.02, 0.1, -L + 0.6 + i * 0.32, c, { i: 0.8 });
      gb.box(0.06, H - 0.2, 0.08, W / 2 + 0.02, 0.1, -L + 0.6 + i * 0.32, c, { i: 0.8 });
    }
    gb.box(0.04, H - 0.2, 0.04, 0, 0.1, 0.42, c, { i: 0.7 });
    for (const x of [-0.6, -0.25, 0.25, 0.6]) gb.box(0.04, H - 0.3, 0.05, x, 0.15, 0.43, '#aaa');
    for (const [x, y] of [[-W / 2, 0], [W / 2, 0], [-W / 2, H - 0.18], [W / 2, H - 0.18]]) gb.box(0.18, 0.18, 0.18, x, y, 0.36, '#3a3a3a');
  },
  containerTeal(gb) { BLOCK.container(gb, '#2a6a6e'); },
  containerBlue(gb) { BLOCK.container(gb, '#2a4a7a'); },
  forklift(gb) {
    const Y = '#d9a020';
    gb.box(1.1, 0.9, 1.8, 0, 0.25, -0.2, Y, { jit: 0.04 });
    gb.box(1.12, 0.5, 0.5, 0, 0.3, -1.1, '#3a3a3a'); // counterweight
    wheel(gb, 0.3, 0.22, -0.55, 0.3, 0.45); wheel(gb, 0.3, 0.22, 0.55, 0.3, 0.45);
    wheel(gb, 0.25, 0.22, -0.55, 0.25, -0.9); wheel(gb, 0.25, 0.22, 0.55, 0.25, -0.9);
    for (const x of [-0.5, 0.5]) for (const z of [-0.8, 0.3]) gb.box(0.06, 1.1, 0.06, x, 1.15, z, '#2a2a2a');
    gb.box(1.1, 0.06, 1.2, 0, 2.25, -0.25, '#2a2a2a');
    gb.box(0.9, 0.5, 0.4, 0, 1.0, -0.4, '#1a1a1a'); // seat back
    for (const x of [-0.35, 0.35]) gb.box(0.08, 2.6, 0.1, x, 0, 0.8, '#3a3a3a');
    gb.box(0.9, 0.12, 0.1, 0, 0.9, 0.85, '#3a3a3a');
    for (const x of [-0.3, 0.3]) gb.box(0.12, 0.05, 1.0, x, 0.08, 1.3, '#5a5a5a');
    gb.box(0.9, 0.5, 0.8, 0, 0.13, 1.3, '#8a6a46');
    gb.cyl(0.08, 0.08, 0.1, 0.4, 2.31, -0.6, '#ff9a2a', { glow: true, i: 2.6 });
    gb.light(0.4, 2.4, -0.6, { c: '#ff9a2a', halo: 1.0, i: 0.8 });
  },
  dumpster(gb) {
    gb.box(1.85, 1.2, 1.1, 0, 0.16, 0, '#2a5a3a', { jit: 0.05 });
    gb.box(1.95, 0.08, 1.2, 0, 1.36, 0, '#244c32');
    gb.box(1.9, 0.06, 1.1, 0, 1.45, -0.55, '#1e3e2a', { rx: -1.1 }); // open lid
    for (const x of [-0.75, 0.75]) for (const z of [-0.4, 0.4]) gb.cyl(0.08, 0.08, 0.16, x, 0, z, RUBBER);
    for (let i = 0; i < 3; i++) gb.sph(0.28, -0.5 + i * 0.5, 1.48, gb.r(-0.2, 0.2), '#14181b', { sy: 0.8 });
    gb.box(1.88, 0.08, 1.14, 0, 0.7, 0, '#d9d2c0', { i: 0.6 });
  },
  beca(gb) {
    const c = gb.pick(['#2a6a8a', '#8a2a4a', '#2a7a4a']);
    wheel(gb, 0.33, 0.06, -0.62, 0.33, 0.3); wheel(gb, 0.33, 0.06, 0.62, 0.33, 0.3); wheel(gb, 0.36, 0.06, 0.15, 0.36, -1.1);
    gb.box(1.3, 0.12, 0.8, 0, 0.5, 0.3, c);
    gb.box(1.2, 0.45, 0.12, 0, 0.6, -0.1, c); // seat back
    gb.box(1.2, 0.12, 0.6, 0, 0.62, 0.15, '#8a1e1e');
    for (const x of [-0.6, 0.6]) gb.beam([x, 0.6, -0.1], [x, 1.85, -0.05], 0.04, '#cfc8b8');
    gb.box(1.35, 0.06, 1.0, 0, 1.85, 0.25, c, { rx: -0.12 });
    gb.box(1.35, 0.4, 0.04, 0, 1.45, -0.12, c, { i: 0.8 });
    gb.beam([0, 0.55, -0.1], [0.15, 0.9, -1.0], 0.05, '#9a9a9a');
    gb.box(0.25, 0.06, 0.3, 0.15, 1.05, -0.95, '#141414');
    gb.box(0.55, 0.04, 0.04, 0.15, 1.15, -0.7, '#9a9a9a');
    for (let i = 0; i < 6; i++) gb.sph(0.07, -0.55 + i * 0.22, 1.92, 0.72, gb.pick(['#ff5a8a', '#ffd04a', '#ff8a3a']), { glow: true, i: 0.9 });
  },
  coop(gb) {
    for (const x of [-0.85, 0.85]) for (const z of [-0.45, 0.45]) gb.box(0.08, 0.5, 0.08, x, 0, z, WOOD_D);
    gb.box(1.85, 0.06, 1.0, 0, 0.5, 0, WOOD);
    for (let i = 0; i < 10; i++) gb.box(0.05, 0.95, 0.04, -0.85 + i * 0.19, 0.56, 0.5, WOOD, { jit: 0.1 });
    gb.box(1.85, 0.95, 0.04, 0, 0.56, -0.5, WOOD_D);
    gb.box(0.04, 0.95, 1.0, -0.9, 0.56, 0, WOOD_D); gb.box(0.04, 0.95, 1.0, 0.9, 0.56, 0, WOOD_D);
    gb.roof(1.0, 2.1, 0.35, 0, 1.51, 0, '#6a6e70', { ry: PI / 2 });
    gb.sph(0.15, -0.3, 0.75, 0.2, '#d8d0c0'); gb.sph(0.14, 0.35, 0.72, 0.1, '#9a5a2a');
  },
  woodcart(gb) {
    gb.box(1.8, 0.6, 1.4, 0, 0.55, -0.1, WOOD, { jit: 0.06 });
    for (let i = 0; i < 4; i++) gb.box(1.82, 0.05, 1.42, 0, 0.6 + i * 0.14, -0.1, WOOD_D);
    wheel(gb, 0.45, 0.08, -0.95, 0.45, -0.1); wheel(gb, 0.45, 0.08, 0.95, 0.45, -0.1);
    for (let i = 0; i < 8; i++) gb.sph(0.2, gb.r(-0.7, 0.7), 1.25 + gb.r(0, 0.25), gb.r(-0.6, 0.4), gb.pick(['#4a5a26', '#5a4a26', '#3f4f22']));
    gb.box(0.9, 0.4, 0.6, 0.3, 1.15, -0.4, '#8a7a5a');
    gb.beam([-0.5, 0.55, 0.6], [-0.5, 0.2, 1.4], 0.06, WOOD_D); gb.beam([0.5, 0.55, 0.6], [0.5, 0.2, 1.4], 0.06, WOOD_D);
  },
};

// spans: one object across all three lanes (6.6 m)
const SPAN_LOW = {
  kerbSpan(gb) {
    for (let i = 0; i < 3; i++) { gb.push((i - 1) * 2.2, 0, (i % 2) * 0.1); LOW.barrier(gb); gb.pop(); }
  },
  crateSpan(gb) {
    for (let i = 0; i < 7; i++) crate(gb, 0.9, 0.6, 0.7, -2.9 + i * 0.97, 0, gb.r(-0.08, 0.08), gb.pick([WOOD, '#7a5634', '#5a3e26']));
    for (let i = 0; i < 12; i++) gb.sph(0.1, gb.r(-3, 3), 0.67, gb.r(-0.2, 0.2), gb.pick(['#e08a2a', '#cc3a2a', '#7aa03a']));
  },
  blockSpan(gb) {
    for (let i = 0; i < 4; i++) {
      gb.box(1.6, 0.5, 0.6, -2.55 + i * 1.7, 0, 0, '#8d8a82', { jit: 0.06 });
      for (let k = 0; k < 4; k++) gb.box(0.2, 0.36, 0.02, -3.1 + i * 1.7 + k * 0.38, 0.07, 0.31, k % 2 ? '#141414' : '#e0b52a', { rz: 0.5 });
    }
  },
  potSpan(gb) {
    gb.box(6.6, 0.32, 0.5, 0, 0, 0, '#9a8a72', { jit: 0.04 });
    for (let i = 0; i < 8; i++) gb.sph(0.34, -2.95 + i * 0.84, 0.42, 0, gb.pick(['#2c4a2a', '#2f5230', '#3a5a2a']), { sy: 0.6, jit: 0.1 });
    for (let i = 0; i < 6; i++) gb.sph(0.06, -2.5 + i * 1.0, 0.62, 0.15, gb.pick(['#ff5a8a', '#ffd04a', '#ff8a3a']));
  },
  logSpan(gb) {
    gb.cylX(0.3, 6.9, 0, 0.3, 0, '#5d5244', { seg: 10 });
    for (let i = 0; i < 16; i++) gb.cylX(0.315, 0.05, -3.2 + i * 0.43, 0.3, 0, '#4a4136', { seg: 10 });
    gb.beam([3.4, 0.4, 0], [4.4, 1.2, -0.4], 0.08, '#2f4a2a', { tw: 0.5, td: 0.04 });
  },
};
const SPAN_HIGH = {
  laundrySpan(gb) {
    posts(gb, 2.05, '#8a8478', 3.4);
    gb.wire([-3.4, 2.0, 0], [3.4, 2.0, 0], 0.08, 0.025, '#ccc', 8);
    clothes(gb, -3.3, 3.3, 1.96, SARONG);
  },
  kainSpan(gb) {
    posts(gb, 2.1, '#7a6a4a', 3.4);
    gb.wire([-3.4, 2.02, 0], [3.4, 2.02, 0], 0.06, 0.025, '#bbb', 8);
    clothes(gb, -3.3, 3.3, 1.98, ['#7a2a4a', '#2a5a6a', '#b8782a', '#4a2a6a', '#8a3a2a', '#3a6a3a'], 0.62, 0.78);
  },
  tarpSpan(gb) {
    posts(gb, 2.3, '#9a8a5a', 3.4);
    gb.box(6.9, 0.08, 0.08, 0, 2.25, 0, '#9a8a5a');
    const c = gb.pick(['#2a5c9a', '#b8402a']);
    for (let i = 0; i < 3; i++) {
      gb.box(2.25, 0.05, 0.7, (i - 1) * 2.25 - 0.56, 1.76, 0, c, { rz: 0.38, jit: 0.04 });
      gb.box(2.25, 0.05, 0.7, (i - 1) * 2.25 + 0.56, 1.76, 0, c, { rz: -0.38, jit: 0.04 });
    }
    gb.box(6.7, 0.36, 0.04, 0, 1.3, 0.34, c, { i: 0.85 });
  },
  pipeSpan(gb) {
    for (const x of [-3.4, 3.4]) { gb.box(0.14, 1.75, 0.14, x, 0, 0, '#5b5f63'); gb.box(0.4, 0.08, 0.4, x, 0, 0, '#3a3d40'); }
    gb.box(0.14, 0.4, 0.14, 0, 1.68, 0, '#5b5f63');
    gb.cylX(0.22, 7.0, 0, 1.47, 0, '#7a7f84', { seg: 12 });
    for (let i = 0; i < 9; i++) gb.cylX(0.225, 0.25, -3.0 + i * 0.75, 1.47, 0, i % 2 ? '#141414' : '#e0b52a', { seg: 12 });
  },
  lanternSpan(gb) {
    posts(gb, 2.3, '#5a1e18', 3.4);
    gb.wire([-3.4, 2.25, 0], [3.4, 2.25, 0], 0.15, 0.03, '#2a1a10', 8);
    for (let i = 0; i < 7; i++) {
      const x = -2.85 + i * 0.95;
      gb.box(0.015, 0.3, 0.015, x, 1.85, 0, '#222');
      lantern(gb, x, 1.3, 0, i % 2 ? '#ff3a2a' : '#ff5a2a', 1.15);
    }
    gb.light(-1.5, 1.6, 0.1, { c: '#ff4a32', halo: 1.8, i: 0.6 });
    gb.light(1.5, 1.6, 0.1, { c: '#ff4a32', halo: 1.8, i: 0.6 });
  },
};

/** The teh tarik cup (pickup). */
export function buildCup() {
  const gb = new GB(7);
  gb.cyl(0.13, 0.1, 0.3, 0, 0, 0, '#c98a4a', { seg: 12, i: 1.1 });
  gb.cyl(0.135, 0.135, 0.06, 0, 0.3, 0, '#f2e6c8', { seg: 12, glow: true, i: 0.9 });
  gb.cyl(0.14, 0.105, 0.36, 0, -0.02, 0, '#e8d8b0', { seg: 12, open: true, i: 0.6 });
  gb.light(0, 0.2, 0, { c: '#ffb050', halo: 1.4, i: 1 });
  return gb.build();
}

// ---------------------------------------------------------------------------------------------
// side scenery

function cityWall(gb, h, seed) {
  const r = mulberry32(seed);
  const L = 10, base = gb.pick(['#5a5650', '#4c5552', '#5c5246', '#45505a']);
  gb.box(1.2, h, L, -0.6, 0, 0, base, { jit: 0.03 });
  gb.box(0.06, 0.5, L, 0.02, 0, 0, '#2a2a28');
  // ground floor: shutters and a back door
  for (const z of [-2.8, 2.6]) {
    gb.box(0.08, 2.6, 2.8, 0.04, 0, z, '#6a6d6e', { jit: 0.05 });
    for (let i = 0; i < 9; i++) gb.box(0.1, 0.05, 2.8, 0.06, 0.2 + i * 0.28, z, '#4a4d4e');
    gb.box(0.2, 0.25, 3.0, 0.1, 2.6, z, '#3a3a3a');
  }
  gb.box(0.06, 2.1, 1.0, 0.03, 0, -0.1, '#2a4038');
  gb.box(0.25, 0.12, 0.25, 0.15, 2.35, -0.1, '#333');
  gb.box(0.12, 0.12, 0.12, 0.22, 2.24, -0.1, '#ffd08a', { glow: true, i: 2.6 });
  gb.light(0.3, 2.25, -0.1, { c: '#ffc070', halo: 1.4, pool: 2.6, streak: 3, i: 0.9 });
  // floors
  const floors = Math.floor((h - 3.4) / 3.1);
  for (let f = 0; f < floors; f++) {
    const y = 3.4 + f * 3.1;
    gb.box(0.22, 0.12, L, 0.1, y - 0.15, 0, '#6a6a64');
    for (const z of [-3.2, 0, 3.2]) {
      const lit = r() < 0.32, cool = r() < 0.4;
      if (lit) gb.box(0.04, 1.35, 1.15, 0.0, y + 0.55, z, cool ? '#bfe6ff' : '#ffc98a', { glow: true, i: 0.9 + r() * 0.8 });
      else gb.box(0.04, 1.35, 1.15, 0.0, y + 0.55, z, r() < 0.5 ? '#0c1418' : '#141c22');
      gb.box(0.12, 0.08, 1.3, 0.05, y + 0.5, z, '#8a8a84');
      gb.box(0.12, 0.08, 1.3, 0.05, y + 1.9, z, '#8a8a84');
      if (r() < 0.5) for (let k = 0; k < 4; k++) gb.box(0.04, 1.4, 0.04, 0.1, y + 0.5, z - 0.45 + k * 0.3, '#3a3d40');
      if (r() < 0.55) {
        const az = z + (r() < 0.5 ? -0.25 : 0.25);
        gb.box(0.4, 0.55, 0.78, 0.22, y + 0.0, az, '#bdbcb2', { jit: 0.06 });
        gb.cylX(0.2, 0.04, 0.43, y + 0.27, az, '#2a2f33', { seg: 10 });
        gb.box(0.03, y + 0.0, 0.03, 0.05, 0, az + 0.36, '#4a4d50');
      }
    }
  }
  for (const z of [-4.7, 4.7]) gb.cyl(0.07, 0.07, h, 0.12, 0, z, '#3d4246');
  gb.box(1.3, 0.6, L, -0.6, h, 0, '#3e3c38');
  if (r() < 0.5) { gb.cyl(0.7, 0.7, 1.4, -0.9, h, gb.r(-3, 3), '#4a5a62'); }
}

function neonSign(gb, c) {
  gb.box(0.08, 0.08, 0.08, 0.05, 4.6, 0, STEEL_D);
  gb.box(1.0, 2.2, 0.14, 0.75, 3.6, 0, '#14161a');
  const g = { glow: true, i: 2.4 };
  // tube outline (no lettering)
  gb.box(0.86, 0.05, 0.05, 0.75, 3.7, 0.09, c, g); gb.box(0.86, 0.05, 0.05, 0.75, 5.66, 0.09, c, g);
  gb.box(0.05, 1.96, 0.05, 0.34, 3.7, 0.09, c, g); gb.box(0.05, 1.96, 0.05, 1.16, 3.7, 0.09, c, g);
  gb.box(0.86, 0.05, 0.05, 0.75, 3.7, -0.09, c, g); gb.box(0.86, 0.05, 0.05, 0.75, 5.66, -0.09, c, g);
  gb.box(0.05, 1.96, 0.05, 0.34, 3.7, -0.09, c, g); gb.box(0.05, 1.96, 0.05, 1.16, 3.7, -0.09, c, g);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * PI * 2;
    gb.box(0.05, 0.12, 0.05, 0.75 + Math.cos(a) * 0.24, 5.0 + Math.sin(a) * 0.24, 0.09, c, { ...g, rz: a });
    gb.box(0.05, 0.12, 0.05, 0.75 + Math.cos(a) * 0.24, 5.0 + Math.sin(a) * 0.24, -0.09, c, { ...g, rz: a });
  }
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    gb.box(0.05, 0.3, 0.05, 0.75 + s * 0.1, 3.95 + k * 0.32, 0.09, c, { ...g, rz: s * 0.8 });
    gb.box(0.05, 0.3, 0.05, 0.75 + s * 0.1, 3.95 + k * 0.32, -0.09, c, { ...g, rz: s * 0.8 });
  }
  gb.light(0.75, 4.7, 0, { c, halo: 4.2, streak: 7, pool: 3, i: 0.75 });
}

function wallLamp(gb) {
  gb.box(0.1, 0.3, 0.2, 0.05, 5.0, 0, STEEL_D);
  gb.beam([0.05, 5.2, 0], [1.3, 5.45, 0], 0.06, STEEL_D);
  gb.box(0.5, 0.12, 0.3, 1.3, 5.3, 0, '#3a3d40');
  gb.box(0.42, 0.05, 0.24, 1.3, 5.26, 0, '#ffb35a', { glow: true, i: 2.8 });
  gb.light(1.3, 5.2, 0, { c: '#ffad55', halo: 2.6, pool: 6.5, streak: 9, point: 1, i: 1 });
}

function sideClutter(gb, kind) {
  if (kind === 'bins') {
    for (const z of [-0.4, 0.4]) {
      gb.box(0.6, 0.95, 0.62, -0.2, 0.05, z, gb.pick(['#2a6a4a', '#2a4a7a', '#7a6a2a']), { jit: 0.05 });
      gb.box(0.66, 0.06, 0.68, -0.2, 1.0, z, '#1e3e2a');
    }
    gb.sph(0.28, 0.3, 0.22, 0.9, '#14181b', { sy: 0.8 });
  } else if (kind === 'bike') {
    gb.push(-0.2, 0, 0, 0.4); bike(gb, gb.pick(['#2b4f7a', '#7a2b2b', '#c9c3b0']), { helmet: '#2a2a2a' }); gb.pop();
  } else if (kind === 'crates') {
    const cs = ['#b8262d', '#2a5fa8', '#d6a12a', '#2f7a4a'];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) plasticCrate(gb, 0.6, 0.32, 0.45, -0.3, i * 0.33, -0.6 + j * 0.62 + i * 0.3, gb.pick(cs));
    gb.box(0.6, 0.4, 0.5, -0.4, 0, 1.2, '#e8e6e0', { jit: 0.05 });
  }
}

function overheadCables(gb) {
  for (let k = 0; k < 5; k++) {
    const y = 7.6 + k * 0.35, zo = (k - 2) * 0.5;
    gb.wire([-5.3, y, zo], [5.3, y + 0.4, zo + 0.6], 0.9 + k * 0.2, 0.035, '#0e1012', 8);
  }
}

// ---- market
function stall(gb, tarpC, covered, seed) {
  const r = mulberry32(seed);
  const D = 2.6, L = 3.2;
  for (const z of [-L / 2 + 0.1, L / 2 - 0.1]) { gb.cyl(0.04, 0.04, 2.35, -0.1, 0, z, '#8a8478'); gb.cyl(0.04, 0.04, 2.7, -D + 0.1, 0, z, '#8a8478'); }
  // roof tarp, sloping toward the lane, sagging in the middle
  gb.box(D + 0.5, 0.05, L / 2 + 0.1, -D / 2 + 0.15, 2.45, -L / 4, tarpC, { rz: 0.11, rx: 0.06, jit: 0.05 });
  gb.box(D + 0.5, 0.05, L / 2 + 0.1, -D / 2 + 0.15, 2.45, L / 4, tarpC, { rz: 0.11, rx: -0.06, jit: 0.05 });
  gb.box(0.04, 0.3, L + 0.1, 0.38, 2.12, 0, tarpC, { i: 0.8 }); // valance
  gb.box(1.0, 0.82, L - 0.2, -0.6, 0, 0, WOOD, { jit: 0.05 }); // counter
  if (covered) {
    gb.box(1.1, 0.5, L - 0.1, -0.6, 0.82, 0, gb.pick(['#2a5c9a', '#3a6a8a', '#8a3a2a']), { jit: 0.08 });
    gb.box(1.12, 0.3, L, -0.6, 1.25, 0, '#2a4c7a', { rz: 0.08, jit: 0.08 });
  } else {
    for (let i = 0; i < 4; i++) plasticCrate(gb, 0.5, 0.25, 0.6, -0.6, 0.82, -1.1 + i * 0.72, gb.pick(['#b8262d', '#2a5fa8', '#d6a12a']));
    for (let i = 0; i < 8; i++) gb.sph(0.1, -0.6 + gb.r(-0.2, 0.2), 1.12, -1.2 + i * 0.33, gb.pick(['#e08a2a', '#7aa03a', '#cc3a2a', '#d2b84a']));
  }
  for (let i = 0; i < 3; i++) plasticCrate(gb, 0.5, 0.3, 0.45, -1.7, i * 0.31, -0.9, gb.pick(['#b8262d', '#2a5fa8', '#2f7a4a']));
  gb.box(0.55, 0.45, 0.5, -1.8, 0, 0.6, '#e8e6e0', { jit: 0.05 }); // styrofoam box
  // the bulb
  const lit = r() < 0.85;
  gb.box(0.01, 0.35, 0.01, 0.0, 1.95, 0, '#111');
  if (lit) {
    gb.sph(0.08, 0.0, 1.9, 0, BULB, { glow: true, i: 2.6, ws: 6, hs: 4 });
    gb.light(0.0, 1.9, 0, { c: '#ffbe6a', halo: 1.5, pool: 3.4, streak: 4, point: 1, i: 1 });
  } else gb.sph(0.08, 0.0, 1.9, 0, '#4a4a40');
  gb.box(3.0, 0.02, L + 0.8, -1.2, 0.01, 0, '#2a2a28', { i: 1 }); // stall floor stain
}

function shopRow(gb, seed) {
  const r = mulberry32(seed);
  const L = 12, H = 10.5;
  gb.box(1.0, H, L, -0.5, 0, 0, gb.pick(['#4a4a46', '#43494c', '#504840']), { jit: 0.03 });
  for (const z of [-4, 0, 4]) {
    gb.box(0.08, 2.8, 3.6, 0.04, 0, z, '#555a5c');
    for (let i = 0; i < 9; i++) gb.box(0.1, 0.05, 3.6, 0.06, 0.2 + i * 0.3, z, '#3c4042');
    // blank signboard over each shop (no lettering)
    gb.box(0.2, 0.9, 3.8, 0.12, 3.0, z, gb.pick(['#7a2a24', '#24486a', '#2a5a3a', '#6a5a2a']), { jit: 0.1 });
    gb.box(0.05, 0.05, 3.8, 0.24, 3.0, z, '#e8e0c8', { glow: true, i: r() < 0.5 ? 0.6 : 0.15 });
    for (let f = 0; f < 2; f++) {
      const lit = r() < 0.35;
      gb.box(0.04, 1.3, 1.6, 0.0, 4.6 + f * 3.0, z - 0.9, lit ? '#e8a860' : '#0d1418', lit ? { glow: true, i: 0.55 + r() * 0.25 } : {});
      const cool = r() < 0.2;
      gb.box(0.04, 1.3, 1.6, 0.0, 4.6 + f * 3.0, z + 0.9, cool ? '#8fb8c8' : '#111a1f', cool ? { glow: true, i: 0.45 } : {});
      for (let k = 0; k < 3; k++) gb.box(0.07, 1.3, 0.04, 0.03, 4.6 + f * 3.0, z - 1.3 + k * 0.4, '#1a1e20'); // grille
    }
  }
  gb.box(1.2, 0.5, L, -0.5, H, 0, '#3a3834');
}

function bulbLine(gb, seed) {
  const r = mulberry32(seed);
  const a = [-4.6, 4.3, -2], b = [4.6, 4.5, 2];
  gb.wire(a, b, 0.5, 0.02, '#111', 10);
  for (let i = 1; i < 10; i++) {
    const p = GB.wireAt(a, b, 0.5, i / 10);
    if (r() < 0.85) { bulbOn(gb, p[0], p[1] - 0.2, p[2], i % 3 ? BULB : '#ffe0a8', 0.06); gb.light(p[0], p[1] - 0.2, p[2], { c: '#ffbe6a', halo: 0.9, i: 0.8 }); }
  }
}

// ---- docks
const BOX_C = ['#8a3a2a', '#2a6a6e', '#2a4a7a', '#b8902a', '#c9c3b0', '#5a6a3a', '#7a2a3a', '#3a3f45'];
function containerUnit(gb, x, y, z, c) {
  const W = 2.44, H = 2.6, L = 6.06;
  gb.box(W, H, L, x, y, z, c, { jit: 0.05 });
  for (let i = 0; i < 16; i++) gb.box(0.05, H - 0.24, 0.12, x + W / 2 + 0.02, y + 0.12, z - L / 2 + 0.35 + i * 0.36, c, { i: 0.78 });
  gb.box(0.1, 0.14, L, x + W / 2 + 0.02, y, z, '#2a2a2a');
  gb.box(0.1, 0.14, L, x + W / 2 + 0.02, y + H - 0.14, z, c, { i: 0.7 });
  for (const zz of [-L / 2, L / 2]) gb.box(0.16, H, 0.16, x + W / 2, y, z + zz, '#2a2a2a');
}
function containerStack(gb, high, seed) {
  const r = mulberry32(seed);
  for (let row = 0; row < 2; row++) {
    const n = row === 0 ? high : Math.min(4, high + 1);
    for (let k = 0; k < n; k++) if (!(row === 0 && k === n - 1 && r() < 0.25)) containerUnit(gb, -1.25 - row * 2.6, k * 2.62, 0, BOX_C[Math.floor(r() * BOX_C.length)]);
  }
}
function sodiumMast(gb) {
  gb.cyl(0.18, 0.32, 18, 0, 0, 0, '#5a5e60', { seg: 8 });
  gb.cyl(0.6, 0.6, 0.5, 0, 0, 0, '#3a3c3e', { seg: 8 });
  gb.box(3.2, 0.25, 0.3, 0.6, 17.6, 0, '#3a3c3e');
  for (const x of [-0.6, 0.4, 1.4, 2.0]) {
    gb.box(0.55, 0.3, 0.55, x, 17.3, 0, '#2a2c2e');
    gb.box(0.5, 0.06, 0.5, x, 17.26, 0, '#ffa040', { glow: true, i: 3.2 });
  }
  gb.light(0.7, 17.0, 0, { c: '#ff9a3a', halo: 6.5, pool: 11, streak: 16, point: 2.4, i: 1 });
}
function dockClutter(gb, kind) {
  if (kind === 'drums') {
    for (let i = 0; i < 5; i++) gb.cyl(0.3, 0.3, 0.9, -0.4 - (i % 2) * 0.62, 0, -1.2 + i * 0.6, gb.pick(['#2a4f8a', '#8a2a24', '#3b6b4a', '#7a7a2a']), { seg: 12 });
  } else if (kind === 'bollards') {
    for (const z of [-1.5, 1.5]) { gb.cyl(0.18, 0.2, 0.9, 0.0, 0, z, '#d9b02a'); gb.cyl(0.19, 0.19, 0.12, 0.0, 0.6, z, '#141414'); }
  } else if (kind === 'fork') {
    gb.push(-1.0, 0, 0, PI / 2); BLOCK.forklift(gb); gb.pop();
  } else if (kind === 'pallets') {
    gb.push(-0.8, 0, 0, 0.3); LOW.pallets(gb); gb.pop();
    gb.push(-0.8, 0.75, 0.1, 0.1); LOW.pallets(gb); gb.pop();
  }
}

// ---- heritage
function shophouse(gb, colors, seed) {
  const r = mulberry32(seed);
  const L = 4.4, H1 = 3.6, H2 = 3.4, deep = 2.6;
  const [wall, trim] = colors;
  // arcade front: an arched opening in a wall, extruded
  const s = new THREE.Shape();
  s.moveTo(-L / 2, 0); s.lineTo(L / 2, 0); s.lineTo(L / 2, H1); s.lineTo(-L / 2, H1); s.lineTo(-L / 2, 0);
  const hole = new THREE.Path();
  const hw = 1.55, sp = 2.35;
  hole.moveTo(-hw, 0); hole.lineTo(hw, 0); hole.lineTo(hw, sp); hole.absarc(0, sp, hw, 0, PI, false); hole.lineTo(-hw, 0);
  s.holes.push(hole);
  gb.shape(s, 0.45, 0, 0, 0, wall, { jit: 0.03 });
  gb.box(0.55, 0.3, L, -0.2, 0, 0, trim); // plinth
  gb.box(0.6, 0.2, L + 0.02, -0.2, H1 - 0.22, 0, trim); // band
  // the five-foot way: floor, ceiling, back wall with timber doors
  gb.box(deep, 0.12, L, -deep / 2, 0, 0, '#7a4a36', { jit: 0.04 });
  gb.box(deep, 0.1, L, -deep / 2, H1 - 0.1, 0, '#3a3430');
  gb.box(0.2, H1, L, -deep - 0.1, 0, 0, wall, { i: 0.65 });
  const lit = r() < 0.55;
  gb.box(0.06, 2.6, 2.0, -deep + 0.02, 0.12, 0, lit ? '#ffc07a' : '#3a2618', lit ? { glow: true, i: 0.75 + r() * 0.5 } : { jit: 0.1 });
  if (lit) for (let i = 0; i < 6; i++) gb.box(0.08, 2.6, 0.05, -deep + 0.05, 0.12, -0.85 + i * 0.34, '#4a2a18');
  gb.box(0.08, 0.5, 2.6, -deep + 0.03, 2.75, 0, '#2a1a12'); // transom
  // lantern under the arch
  gb.box(0.015, 0.4, 0.015, -0.4, H1 - 0.5, 0, '#222');
  lantern(gb, -0.4, 2.55, 0, '#ff3a2a', 1.05);
  gb.light(-0.4, 2.75, 0, { c: '#ff5a3a', halo: 1.9, pool: 2.4, streak: 4.0, point: 1, i: 0.55 });
  // upper floor
  gb.box(0.5, H2, L, -0.25, H1, 0, wall, { jit: 0.03 });
  for (const z of [-1.35, 0, 1.35]) {
    const on = r() < 0.4;
    gb.box(0.06, 1.9, 0.86, 0.02, H1 + 0.6, z, on ? '#ffbf78' : '#1a2420', on ? { glow: true, i: 0.8 + r() * 0.4 } : {});
    for (let k = 0; k < 7; k++) gb.box(0.09, 0.05, 0.82, 0.04, H1 + 0.7 + k * 0.26, z, on ? '#5a3a20' : '#2f4a3e'); // louvres
    gb.box(0.12, 0.08, 1.0, 0.05, H1 + 0.55, z, trim);
    gb.box(0.14, 0.14, 1.0, 0.06, H1 + 2.5, z, trim);
    gb.box(0.08, 0.3, 0.9, 0.05, H1 + 2.62, z, trim, { i: 0.85 }); // fanlight
  }
  gb.box(0.7, 0.25, L + 0.02, -0.15, H1 + H2 - 0.25, 0, trim);
  gb.box(0.4, 0.12, L + 0.02, 0.0, H1 + 0.02, 0, trim);
  // roof
  gb.roof(6.0, L + 0.04, 1.4, -2.6, H1 + H2, 0, '#7a3a26', { jit: 0.05, ry: 0 });
  gb.box(0.25, 0.25, L + 0.1, 0.25, H1 + H2 - 0.05, 0, '#5a2a1a');
}

function templeGate(gb) {
  const R = '#8a1a14', GOLD = '#c9a040', GREEN = '#2f6a4a';
  for (const s of [-1, 1]) {
    gb.box(0.7, 0.4, 0.7, s * 4.4, 0, 0, '#4a4440');
    gb.cyl(0.3, 0.32, 6.4, s * 4.4, 0.4, 0, R, { seg: 10 });
    gb.cyl(0.36, 0.36, 0.2, s * 4.4, 6.4, 0, GOLD, { glow: true, i: 0.4 });
  }
  gb.box(9.6, 0.5, 0.5, 0, 5.3, 0, R);
  gb.box(9.2, 0.18, 0.55, 0, 5.15, 0, GOLD, { glow: true, i: 0.35 });
  gb.box(10.4, 0.55, 0.6, 0, 6.6, 0, R);
  gb.box(2.4, 0.9, 0.12, 0, 5.75, 0.25, GOLD, { glow: true, i: 0.5 }); // blank plaque
  gb.box(2.2, 0.7, 0.14, 0, 5.85, 0.25, R);
  // tiled roof with upturned eaves
  gb.roof(1.6, 11.6, 0.8, 0, 7.15, 0, GREEN, { ry: PI / 2 });
  gb.box(11.6, 0.1, 1.7, 0, 7.1, 0, GREEN, { i: 0.8 });
  for (const s of [-1, 1]) {
    gb.box(1.0, 0.1, 1.7, s * 6.0, 7.2, 0, GREEN, { rz: s * 0.35 });
    gb.box(0.5, 0.12, 0.12, s * 5.4, 7.98, 0, GOLD, { rz: s * 0.5, glow: true, i: 0.5 });
  }
  gb.box(11.4, 0.14, 0.14, 0, 7.94, 0, GOLD, { glow: true, i: 0.45 });
  gb.sph(0.3, 0, 8.2, 0, GOLD, { glow: true, i: 0.8 });
  for (const x of [-2.5, 2.5]) {
    gb.box(0.02, 0.6, 0.02, x, 4.7, 0, '#222');
    lantern(gb, x, 4.0, 0, '#ff3a2a', 1.6);
    gb.light(x, 4.2, 0, { c: '#ff4a32', halo: 3.0, pool: 4.5, streak: 6, point: 1.4, i: 1 });
  }
}

// ---- kampung
function stiltHouse(gb, seed) {
  const r = mulberry32(seed);
  const L = 8, D = 6, P = 1.5, Hw = 2.6;
  const plank = ['#6a4a30', '#5e4128', '#734f33', '#5a3d26'];
  for (const x of [-0.3, -D / 2, -D + 0.3]) for (const z of [-L / 2 + 0.3, 0, L / 2 - 0.3]) gb.box(0.18, P, 0.18, x, 0, z, '#4a3624');
  gb.box(D, 0.18, L, -D / 2, P, 0, WOOD_D);
  // walls of planks
  for (let k = 0; k < 9; k++) gb.box(0.08, Hw / 9 + 0.01, L, 0.0, P + 0.18 + k * (Hw / 9), 0, plank[k % 4], { jit: 0.06 });
  gb.box(D, Hw, 0.08, -D / 2, P + 0.18, L / 2, plank[1], { i: 0.9 });
  gb.box(D, Hw, 0.08, -D / 2, P + 0.18, -L / 2, plank[2], { i: 0.9 });
  // windows: shutters open, warm light
  for (const z of [-2.4, 2.4]) {
    const on = r() < 0.75;
    gb.box(0.06, 1.0, 1.0, 0.05, P + 1.0, z, on ? '#ffb45a' : '#1a1410', on ? { glow: true, i: 0.9 + r() * 0.6 } : {});
    gb.box(0.08, 1.05, 0.08, 0.08, P + 0.98, z, WOOD_D);
    gb.box(0.05, 1.0, 0.5, 0.3, P + 1.0, z - 0.75, '#7a5a3a', { ry: 0.9 });
    gb.box(0.05, 1.0, 0.5, 0.3, P + 1.0, z + 0.75, '#7a5a3a', { ry: -0.9 });
    if (on) gb.light(0.3, P + 1.5, z, { c: '#ffae55', halo: 1.4, streak: 3.5, i: 0.8 });
  }
  // door, steps, verandah rail
  gb.box(0.06, 2.0, 1.0, 0.05, P + 0.2, 0, '#3a2818');
  for (let s = 0; s < 4; s++) gb.box(0.35, 0.08, 1.1, 0.5 + s * 0.35, P - (s + 1) * 0.36, 0, '#6a4a30');
  gb.beam([0.35, P + 0.2, -0.6], [1.9, 0.0, -0.6], 0.06, WOOD_D); gb.beam([0.35, P + 0.2, 0.6], [1.9, 0.0, 0.6], 0.06, WOOD_D);
  gb.box(0.05, 0.05, L, 0.9, P + 0.95, 0, WOOD_D);
  for (let i = 0; i < 9; i++) if (Math.abs(i - 4) > 0) gb.box(0.04, 0.8, 0.04, 0.9, P + 0.18, -L / 2 + 0.5 + i * 0.88, WOOD_D);
  gb.box(1.0, 0.1, L, 0.45, P, 0, WOOD_D);
  // roof: steep gable along the street, zinc or attap
  const rc = r() < 0.5 ? '#5a5650' : '#3e3424';
  gb.roof(D + 2.4, L + 0.8, 2.6, -D / 2 + 0.3, P + 0.18 + Hw, 0, rc, { jit: 0.04 });
  gb.box(0.08, 0.6, 0.6, -D / 2 + 0.3, P + Hw + 2.5, L / 2 + 0.42, '#2a1a10', { rz: 0.6 }); // crossed gable tips
  gb.box(0.08, 0.6, 0.6, -D / 2 + 0.3, P + Hw + 2.5, -L / 2 - 0.42, '#2a1a10', { rz: -0.6 });
  // a bulb at the door
  bulbOn(gb, 0.5, P + 2.25, 0);
  gb.light(0.5, P + 2.25, 0, { c: '#ffb860', halo: 1.6, pool: 4.0, streak: 5, point: 1, i: 1 });
}

function kampungLamp(gb) {
  gb.cyl(0.08, 0.1, 5.2, 0, 0, 0, '#5a4630');
  gb.beam([0, 4.9, 0], [1.2, 5.0, 0], 0.06, '#5a4630');
  gb.box(0.3, 0.12, 0.3, 1.2, 4.86, 0, '#2a2a2a');
  gb.sph(0.09, 1.2, 4.8, 0, '#ffe2a0', { glow: true, i: 2.6, ws: 6, hs: 4 });
  gb.light(1.2, 4.75, 0, { c: '#ffbf70', halo: 2.0, pool: 5.5, streak: 6, point: 1, i: 1 });
}

function fence(gb, L = 6) {
  gb.box(0.05, 0.06, L, 0, 0.75, 0, '#6a5a40');
  gb.box(0.05, 0.06, L, 0, 0.35, 0, '#6a5a40');
  for (let i = 0; i < L / 0.5; i++) gb.box(0.08, 0.9 + gb.r(-0.05, 0.05), 0.08, 0, 0, -L / 2 + 0.25 + i * 0.5, '#6a5a40', { jit: 0.1 });
}
function banana(gb) {
  gb.cyl(0.12, 0.15, 1.8, 0, 0, 0, '#3a4a26');
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * PI * 2;
    gb.beam([0, 1.7, 0], [Math.cos(a) * 1.4, 2.4 - (i % 2) * 0.6, Math.sin(a) * 1.4], 0.1, '#2f5a2a', { tw: 0.6, td: 0.03 });
  }
}
function fireflies(gb, seed) {
  const r = mulberry32(seed);
  for (let i = 0; i < 7; i++) gb.sph(0.04, r() * -3, 0.5 + r() * 2, (r() - 0.5) * 8, '#d8ff8a', { glow: true, i: 2.2, ws: 4, hs: 3 });
}

// ---------------------------------------------------------------------------------------------
// settings

const pick = (r, a) => a[Math.floor(r() * a.length)];

export const SETTINGS = {
  city: {
    label: 'KL back lane',
    fog: ['#0b1a20', 14, 115], bg: '#0b1a20', exposure: 1.15,
    hemi: ['#5a8a9a', '#2a1a10', 0.85], moon: ['#9fc8d8', 0.35],
    point: { c: '#ffad55', i: 34, d: 24 },
    rain: [0.62, 0.78, 0.84, 0.32],
    road: 'asphalt', side: 'pavement', wet: 1,
    backdrop: 'kl',
    obstacles: { low: ['barrier', 'bags', 'kerb'], high: ['pipe', 'laundry', 'cables'], block: ['dumpster', 'motorbike', 'table'], spanLow: 'kerbSpan', spanHigh: 'laundrySpan', thrown: ['bin', 'bags'] },
    kinds: {
      wallA: (gb) => cityWall(gb, 14, 11), wallB: (gb) => cityWall(gb, 18.5, 23), wallC: (gb) => cityWall(gb, 12, 37), wallD: (gb) => cityWall(gb, 21, 51),
      neonPink: (gb) => neonSign(gb, '#ff3d8b'), neonTeal: (gb) => neonSign(gb, '#3ef2e0'), neonAmber: (gb) => neonSign(gb, '#ffb03a'),
      lamp: wallLamp, cables: overheadCables,
      bins: (gb) => sideClutter(gb, 'bins'), bike: (gb) => sideClutter(gb, 'bike'), crates: (gb) => sideClutter(gb, 'crates'),
    },
    layout(ci, d0, r, put) {
      for (const s of [-1, 1]) {
        let d = d0 + r() * 2;
        while (d < d0 + 48) { put(pick(r, ['wallA', 'wallB', 'wallC', 'wallD']), s * 5.4, d + 5, s); d += 10 + (r() < 0.2 ? 1.5 : 0.1); }
        for (let k = 0; k < 3; k++) if (r() < 0.6) put(pick(r, ['bins', 'bike', 'crates']), s * 4.75, d0 + 4 + k * 15 + r() * 8, s);
        if (r() < 0.8) put(pick(r, ['neonPink', 'neonTeal', 'neonAmber', 'neonPink']), s * 5.4, d0 + 10 + r() * 28, s);
      }
      put('lamp', -5.4, d0 + 12, -1, 1);
      put('lamp', 5.4, d0 + 36, 1, 1);
      put('cables', 0, d0 + 6 + r() * 10, -1);
      if (r() < 0.6) put('cables', 0, d0 + 30 + r() * 10, -1);
    },
  },
  market: {
    label: 'Chow Kit after closing',
    fog: ['#120f0c', 14, 108], bg: '#14110d', exposure: 1.2,
    hemi: ['#5a7a80', '#3a2414', 0.75], moon: ['#9fc0c8', 0.25],
    point: { c: '#ffb560', i: 26, d: 18 },
    rain: [0.7, 0.72, 0.68, 0.3],
    road: 'market', side: 'concrete', wet: 1,
    backdrop: 'chowkit',
    obstacles: { low: ['crates', 'plastic', 'barrier'], high: ['tarp', 'laundry'], block: ['cart', 'table', 'motorbike'], spanLow: 'crateSpan', spanHigh: 'tarpSpan', thrown: ['crates', 'plastic'] },
    kinds: {
      stallBlue: (gb) => stall(gb, '#2a5c9a', false, 3), stallRed: (gb) => stall(gb, '#a8382a', false, 5), stallGreen: (gb) => stall(gb, '#2a7a5a', false, 7),
      stallStripe: (gb) => stall(gb, '#c98a2a', true, 9), stallShut: (gb) => stall(gb, '#3a4a6a', true, 13),
      shops: (gb) => shopRow(gb, 4), shops2: (gb) => shopRow(gb, 8),
      bulbs: (gb) => bulbLine(gb, 2), bulbs2: (gb) => bulbLine(gb, 6),
      crates: (gb) => sideClutter(gb, 'crates'), bike: (gb) => sideClutter(gb, 'bike'),
    },
    layout(ci, d0, r, put) {
      for (const s of [-1, 1]) {
        let d = d0 + r();
        let n = 0;
        while (d < d0 + 48) {
          const k = pick(r, ['stallBlue', 'stallRed', 'stallGreen', 'stallStripe', 'stallShut', 'stallBlue']);
          put(k, s * 4.9, d + 1.6, s, (n++ % 3 === (s > 0 ? 1 : 0)) ? 1 : 0);
          d += 3.2 + (r() < 0.25 ? 1.2 + r() * 1.5 : 0.15);
          if (r() < 0.12) { put(pick(r, ['crates', 'bike']), s * 4.6, d + 0.8, s); d += 1.8; }
        }
        for (let d2 = d0; d2 < d0 + 48; d2 += 12) put(pick(r, ['shops', 'shops2']), s * 8.6, d2 + 6, s);
      }
      put('bulbs', 0, d0 + 8, -1); put('bulbs2', 0, d0 + 24, 1); put('bulbs', 0, d0 + 40, 1);
    },
  },
  docks: {
    label: 'Port Klang',
    fog: ['#131a1c', 16, 125], bg: '#141a1c', exposure: 1.18,
    hemi: ['#5a7a88', '#3a2a18', 0.9], moon: ['#9fc0d0', 0.35],
    point: { c: '#ff9a3a', i: 110, d: 36 },
    rain: [0.7, 0.66, 0.55, 0.3],
    road: 'yard', side: 'yard', wet: 1.2,
    backdrop: 'port',
    obstacles: { low: ['pallets', 'drums', 'kerb'], high: ['heightbar', 'pipe'], block: ['container', 'forklift', 'containerTeal', 'containerBlue'], spanLow: 'blockSpan', spanHigh: 'pipeSpan', thrown: ['drums'] },
    kinds: {
      stack1: (gb) => containerStack(gb, 1, 3), stack2: (gb) => containerStack(gb, 2, 5), stack3: (gb) => containerStack(gb, 3, 9), stack2b: (gb) => containerStack(gb, 2, 17), stack3b: (gb) => containerStack(gb, 3, 21),
      mast: sodiumMast,
      drums: (gb) => dockClutter(gb, 'drums'), bollards: (gb) => dockClutter(gb, 'bollards'), fork: (gb) => dockClutter(gb, 'fork'), pallets: (gb) => dockClutter(gb, 'pallets'),
    },
    layout(ci, d0, r, put) {
      for (const s of [-1, 1]) {
        let d = d0 + r() * 2;
        while (d < d0 + 48) {
          if (r() < 0.14) { d += 5 + r() * 4; continue; }
          put(pick(r, ['stack1', 'stack2', 'stack3', 'stack2b', 'stack3b', 'stack2']), s * 7.4, d + 3.1, s);
          d += 6.25;
        }
        for (let k = 0; k < 2; k++) if (r() < 0.55) put(pick(r, ['drums', 'bollards', 'fork', 'pallets']), s * 5.0, d0 + 6 + k * 22 + r() * 12, s);
      }
      put('mast', -5.2, d0 + 8, -1, 1);
      put('mast', 5.2, d0 + 32, 1, 1);
    },
  },
  heritage: {
    label: 'George Town',
    fog: ['#121a1f', 14, 110], bg: '#131b20', exposure: 1.2,
    hemi: ['#5a8090', '#3a2418', 0.8], moon: ['#a8c8d4', 0.3],
    point: { c: '#ff9a5a', i: 22, d: 16 },
    rain: [0.66, 0.76, 0.8, 0.3],
    road: 'oldroad', side: 'tiles', wet: 1,
    backdrop: 'penang',
    obstacles: { low: ['pots', 'crates', 'kerb'], high: ['sign', 'lanterns'], block: ['beca', 'motorbike', 'cart'], spanLow: 'potSpan', spanHigh: 'lanternSpan', thrown: ['pots'] },
    kinds: {
      houseMint: (gb) => shophouse(gb, ['#7aa496', '#e2dccb'], 3), houseOchre: (gb) => shophouse(gb, ['#c8a060', '#efe6d0'], 5),
      houseBlue: (gb) => shophouse(gb, ['#7a98b0', '#e8e2d4'], 7), houseCream: (gb) => shophouse(gb, ['#d8ccb0', '#8a4a3a'], 11),
      houseRose: (gb) => shophouse(gb, ['#b88080', '#efe6d0'], 13),
      gate: templeGate,
      beca: (gb) => { gb.push(-0.8, 0, 0, 0.3); BLOCK.beca(gb); gb.pop(); },
      pots: (gb) => { gb.push(-0.5, 0, 0, PI / 2); LOW.pots(gb); gb.pop(); },
      bike: (gb) => sideClutter(gb, 'bike'),
    },
    layout(ci, d0, r, put) {
      for (const s of [-1, 1]) {
        let d = d0;
        let n = 0;
        while (d < d0 + 48) { put(pick(r, ['houseMint', 'houseOchre', 'houseBlue', 'houseCream', 'houseRose']), s * 4.75, d + 2.2, s, (n++ % 3 === (s > 0 ? 0 : 2)) ? 1 : 0); d += 4.4; }
        for (let k = 0; k < 2; k++) if (r() < 0.5) put(pick(r, ['beca', 'pots', 'bike']), s * 4.35, d0 + 8 + k * 20 + r() * 10, s);
      }
      if (ci % 3 === 1) put('gate', 0, d0 + 24, -1, 1);
    },
  },
  kampung: {
    label: 'Kampung Baru',
    fog: ['#0a1618', 16, 120], bg: '#0b1719', exposure: 1.2,
    hemi: ['#4a7a8a', '#1e2a18', 0.85], moon: ['#a8c8e0', 0.45],
    point: { c: '#ffb560', i: 30, d: 20 },
    rain: [0.62, 0.74, 0.8, 0.3],
    road: 'planks', side: 'grass', wet: 0.9,
    backdrop: 'klcc',
    obstacles: { low: ['log', 'planks', 'coconuts'], high: ['kain', 'laundry'], block: ['coop', 'motorbike', 'woodcart'], spanLow: 'logSpan', spanHigh: 'kainSpan', thrown: ['coconuts'] },
    kinds: {
      house: (gb) => stiltHouse(gb, 3), house2: (gb) => stiltHouse(gb, 8), house3: (gb) => stiltHouse(gb, 15),
      palm: (gb) => palm(gb, 0, 0, 9, 0.9, 4), palm2: (gb) => palm(gb, 0, 0, 11, 1.3, 9), palm3: (gb) => palm(gb, 0, 0, 7.5, 0.6, 21),
      lamp: kampungLamp, fence: (gb) => fence(gb, 6), banana, flies: (gb) => fireflies(gb, 5),
      bike: (gb) => sideClutter(gb, 'bike'),
    },
    layout(ci, d0, r, put) {
      for (const s of [-1, 1]) {
        let d = d0 + r() * 4;
        while (d < d0 + 48) {
          if (r() < 0.75) put(pick(r, ['house', 'house2', 'house3']), s * (6.6 + r() * 2.5), d + 4, s);
          d += 9 + r() * 6;
        }
        for (let k = 0; k < 4; k++) if (r() < 0.75) put(pick(r, ['palm', 'palm2', 'palm3']), s * (4.9 + r() * 1.2), d0 + k * 12 + r() * 10, s);
        for (let k = 0; k < 3; k++) if (r() < 0.5) put(pick(r, ['fence', 'banana', 'flies', 'bike']), s * 4.3, d0 + 5 + k * 15 + r() * 6, s);
      }
      put('lamp', -4.4, d0 + 12, -1, 1);
      put('lamp', 4.4, d0 + 36, 1, 1);
    },
  },
};
export const SETTING_IDS = Object.keys(SETTINGS);

/** Build an obstacle model by name (low, high, block or span). */
export function buildObstacle(name, seed = 1) {
  const gb = new GB(seed);
  const f = LOW[name] || HIGH[name] || BLOCK[name] || SPAN_LOW[name] || SPAN_HIGH[name];
  if (!f) throw new Error(`no obstacle ${name}`);
  f(gb);
  return gb.build();
}
export function buildKind(setting, name, seed = 1) {
  const gb = new GB(seed);
  SETTINGS[setting].kinds[name](gb);
  return gb.build();
}
export { bike as buildBikeInto };
