// Foot Chase: the three.js view. It owns its own WebGLRenderer (never the office scene's) and
// releases everything in destroy(). The rules live in pursuit-logic.js; this file only draws a run.
//
// Budget: everything repeated is instanced (scenery kinds, obstacles, cups, halos, light pools,
// wet-road streaks), so a frame is roughly 50-90 draw calls whatever the setting. Nothing is
// allocated per frame: temp vectors and matrices are module-level, instance buffers are fixed.
import * as THREE from 'three';
import { SETTINGS, buildObstacle, buildKind, buildCup, GB, buildBikeInto } from './pursuit-kits.js';
import { laneX } from './pursuit-logic.js';
import { mulberry32, hashStr } from '../core/rng.js';
import { drawBackdrop, drawGround } from './pursuit-paint.js';

const CH = 48; // chunk length, m
const NCH = 4; // chunks alive
const MAXREC = 200; // scenery records per chunk
const ROAD_LEN = 208;
const TILE = 16; // ground textures repeat every 16 m
const PI = Math.PI;

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
const _v = new THREE.Vector3(), _look = new THREE.Vector3();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const Q0 = new THREE.Quaternion();
const QPI = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), PI);
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

function gradientTex(size, stops, kind = 'radial', w = size, hgt = size) {
  const c = document.createElement('canvas');
  c.width = w; c.height = hgt;
  const g = c.getContext('2d');
  const grd = kind === 'radial' ? g.createRadialGradient(w / 2, hgt / 2, 0, w / 2, hgt / 2, Math.min(w, hgt) / 2) : g.createLinearGradient(0, 0, 0, hgt);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.fillRect(0, 0, w, hgt);
  return c;
}

export function createScene3D({ canvas, setting = 'city', vehicle = 'foot', reduced = false, lowPower = false, seed = 1 }) {
  const S = SETTINGS[setting] || SETTINGS.city;
  const owned = { geo: [], mat: [], tex: [] };
  const G = (g) => { owned.geo.push(g); return g; };
  const M = (m) => { owned.mat.push(m); return m; };
  const T = (t) => { owned.tex.push(t); return t; };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance', stencil: false, depth: true });
  if (!renderer.getContext()) throw new Error('no webgl');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = S.exposure;
  renderer.setClearColor(S.bg, 1);
  const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(S.bg);
  scene.fog = new THREE.Fog(S.fog[0], S.fog[1], S.fog[2]);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 330);

  // ---- lights
  const hemi = new THREE.HemisphereLight(S.hemi[0], S.hemi[1], S.hemi[2]);
  const moon = new THREE.DirectionalLight(S.moon[0], S.moon[1]);
  moon.position.set(-0.4, 1, 0.3);
  scene.add(hemi, moon, moon.target);
  const NPL = lowPower ? 3 : 4;
  const points = [];
  for (let i = 0; i < NPL; i++) { const l = new THREE.PointLight(S.point.c, 0, S.point.d, 1.7); scene.add(l); points.push(l); }
  // a soft fill that rides with the camera so the detective never reads as a black shape
  const fill = new THREE.PointLight('#c0ccd0', 7, 10, 1.5);
  scene.add(fill);

  // ---- materials
  const matBody = M(new THREE.MeshLambertMaterial({ vertexColors: true }));
  const matGlow = M(new THREE.MeshBasicMaterial({ vertexColors: true }));
  const haloTex = T(new THREE.CanvasTexture(gradientTex(64, [[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,255,255,0.55)'], [0.45, 'rgba(255,255,255,0.14)'], [1, 'rgba(255,255,255,0)']])));
  const poolTex = T(new THREE.CanvasTexture(gradientTex(64, [[0, 'rgba(255,255,255,0.8)'], [0.5, 'rgba(255,255,255,0.28)'], [1, 'rgba(255,255,255,0)']])));
  const streakCanvas = (() => {
    const c = document.createElement('canvas'); c.width = 32; c.height = 128;
    const g = c.getContext('2d');
    for (let y = 0; y < 128; y++) {
      const v = Math.sin((y / 128) * PI) * (0.55 + 0.45 * Math.sin(y * 0.9) * Math.sin(y * 0.23));
      const grd = g.createLinearGradient(0, 0, 32, 0);
      grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.5, `rgba(255,255,255,${Math.max(0, v).toFixed(3)})`); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, y, 32, 1);
    }
    return c;
  })();
  const streakTex = T(new THREE.CanvasTexture(streakCanvas));
  const blobTex = T(new THREE.CanvasTexture(gradientTex(64, [[0, 'rgba(0,0,0,0.75)'], [0.6, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0)']])));
  const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const matHalo = M(new THREE.MeshBasicMaterial({ map: haloTex, ...add, fog: false }));
  const matPool = M(new THREE.MeshBasicMaterial({ map: poolTex, ...add, polygonOffset: true, polygonOffsetFactor: -2 }));
  const matStreak = M(new THREE.MeshBasicMaterial({ map: streakTex, ...add, polygonOffset: true, polygonOffsetFactor: -3 }));
  const matBlob = M(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));

  // ---- ground
  const groundTex = (type, wM, rough) => {
    const { color, roughness } = drawGround(type, mulberry32(hashStr(type) ^ seed), wM);
    const map = T(new THREE.CanvasTexture(color));
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = maxAniso;
    const rm = T(new THREE.CanvasTexture(roughness));
    rm.wrapS = rm.wrapT = THREE.RepeatWrapping;
    return M(new THREE.MeshStandardMaterial({ map, roughnessMap: rm, roughness: rough, metalness: 0.0 }));
  };
  const roadW = 7.8;
  const roadMat = groundTex(S.road, roadW, 1);
  roadMat.map.repeat.set(1, ROAD_LEN / TILE); roadMat.roughnessMap.repeat.copy(roadMat.map.repeat);
  const road = new THREE.Mesh(G(new THREE.PlaneGeometry(roadW, ROAD_LEN)), roadMat);
  road.rotation.x = -PI / 2;
  scene.add(road);
  const sideMat = groundTex(S.side, 8, 1);
  sideMat.map.repeat.set(36 / 8, ROAD_LEN / TILE); sideMat.roughnessMap.repeat.copy(sideMat.map.repeat);
  const sideGeo = G(new THREE.PlaneGeometry(36, ROAD_LEN));
  const sides = [-1, 1].map((s) => {
    const m = new THREE.Mesh(sideGeo, sideMat);
    m.rotation.x = -PI / 2;
    m.position.x = s * (roadW / 2 + 18);
    m.position.y = S.side === 'grass' ? -0.18 : 0.0;
    scene.add(m);
    return m;
  });
  // kerbs / boardwalk edges
  const edgeGB = new GB(3);
  for (const s of [-1, 1]) {
    if (S.side === 'grass') { edgeGB.box(0.22, 0.24, ROAD_LEN, s * 3.95, -0.2, 0, '#3e2c1c'); }
    else if (S.side !== 'yard') { edgeGB.box(0.3, 0.16, ROAD_LEN, s * 4.02, 0, 0, '#6a6a66'); edgeGB.box(0.5, 0.02, ROAD_LEN, s * 3.62, 0.005, 0, '#121416'); }
  }
  const edgeBuilt = edgeGB.build();
  const edges = edgeBuilt.body ? new THREE.Mesh(G(edgeBuilt.body), matBody) : null;
  if (edges) scene.add(edges);

  // ---- the far backdrop (skyline, cranes, the twin towers)
  const bdCanvas = drawBackdrop(S.backdrop, mulberry32(seed ^ 77), S.bg);
  const bdTex = T(new THREE.CanvasTexture(bdCanvas));
  bdTex.colorSpace = THREE.SRGBColorSpace;
  const backdropMat = M(new THREE.MeshBasicMaterial({ map: bdTex, fog: false, depthWrite: false }));
  const backdrop = new THREE.Mesh(G(new THREE.PlaneGeometry(560, 140)), backdropMat);
  backdrop.renderOrder = -1;
  scene.add(backdrop);

  // ---- instanced scenery kinds
  const kindNames = Object.keys(S.kinds);
  const kinds = kindNames.map((name, i) => {
    const b = buildKind(setting, name, 100 + i);
    const cap = 170;
    const k = { name, lights: b.lights, body: null, glow: null, n: 0 };
    if (b.body) { k.body = new THREE.InstancedMesh(G(b.body), matBody, cap); k.body.frustumCulled = false; k.body.count = 0; scene.add(k.body); }
    if (b.glow) { k.glow = new THREE.InstancedMesh(G(b.glow), matGlow, cap); k.glow.frustumCulled = false; k.glow.count = 0; scene.add(k.glow); }
    k.cap = cap;
    return k;
  });
  const kindIndex = Object.fromEntries(kindNames.map((n, i) => [n, i]));

  // decals: halos (billboards facing the runner), light pools and wet streaks on the ground
  const mkDecal = (geo, mat, cap) => {
    const m = new THREE.InstancedMesh(G(geo), mat, cap);
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    m.frustumCulled = false; m.count = 0;
    scene.add(m);
    return m;
  };
  const planeXY = new THREE.PlaneGeometry(1, 1);
  const planeXZ = new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2);
  const halos = mkDecal(planeXY, matHalo, 900);
  const pools = mkDecal(planeXZ, matPool, 400);
  const streaks = mkDecal(planeXZ.clone(), matStreak, 400);
  const dynHalos = mkDecal(planeXY.clone(), matHalo, 48);
  const blobs = new THREE.InstancedMesh(G(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2)), matBlob, 2);
  blobs.frustumCulled = false;
  scene.add(blobs);

  // lamp list for the moving point lights
  const MAXL = 96;
  const lampD = new Float32Array(MAXL), lampX = new Float32Array(MAXL), lampY = new Float32Array(MAXL), lampZ = new Float32Array(MAXL);
  const lampR = new Float32Array(MAXL), lampG = new Float32Array(MAXL), lampB = new Float32Array(MAXL), lampI = new Float32Array(MAXL);
  const lampOrder = new Int16Array(MAXL);
  let lampN = 0;

  // chunks of scenery records: [kind, x, dist, side, flags]
  const chunks = Array.from({ length: NCH }, () => ({ ci: -1, n: 0, rec: new Float32Array(MAXREC * 5) }));
  function layoutChunk(ch, ci) {
    ch.ci = ci; ch.n = 0;
    const r = mulberry32(hashStr(`${setting}|${seed}|${ci}`));
    S.layout(ci, ci * CH, r, (name, x, dist, side, flags = 0) => {
      if (ch.n >= MAXREC) return;
      const o = ch.n++ * 5;
      ch.rec[o] = kindIndex[name]; ch.rec[o + 1] = x; ch.rec[o + 2] = dist; ch.rec[o + 3] = side; ch.rec[o + 4] = flags;
    });
  }
  const haloK = 0.9, poolK = 0.55, streakK = 0.42 * (S.wet || 1);
  const pointC = new THREE.Color(S.point.c);
  const CUP_C = new THREE.Color('#ffb050'), TAIL_C = new THREE.Color('#ff2a2a');
  function putDecal(mesh, x, y, z, sx, sz, col, k) {
    if (mesh.count >= mesh.instanceMatrix.count) return;
    if (mesh === halos || mesh === dynHalos) _m.makeScale(sx, sx, 1);
    else _m.makeScale(sx, 1, sz);
    _m.setPosition(x, y, z);
    mesh.setMatrixAt(mesh.count, _m);
    mesh.instanceColor.setXYZ(mesh.count, col.r * k, col.g * k, col.b * k);
    mesh.count++;
  }
  function rebuildScenery() {
    for (const k of kinds) k.n = 0;
    halos.count = pools.count = streaks.count = 0;
    lampN = 0;
    for (const ch of chunks) {
      for (let i = 0; i < ch.n; i++) {
        const o = i * 5;
        const k = kinds[ch.rec[o]];
        if (!k || k.n >= k.cap) continue;
        const x = ch.rec[o + 1], d = ch.rec[o + 2], side = ch.rec[o + 3], flags = ch.rec[o + 4];
        const flip = side > 0;
        _m.compose(_p.set(x, 0, -d), flip ? QPI : Q0, _s.set(1, 1, 1));
        if (k.body) k.body.setMatrixAt(k.n, _m);
        if (k.glow) k.glow.setMatrixAt(k.n, _m);
        k.n++;
        for (const L of k.lights) {
          const wx = x + (flip ? -L.x : L.x), wz = -d + (flip ? -L.z : L.z);
          _c.set(L.c);
          if (L.halo) putDecal(halos, wx, L.y, wz, L.halo, 1, _c, haloK * L.i);
          if (L.pool) putDecal(pools, wx, 0.03, wz, L.pool * 2, L.pool * 2, _c, poolK * L.i);
          if (L.streak) {
            const sx = clamp(wx * 0.82, -3.7, 3.7);
            putDecal(streaks, sx, 0.035, wz + L.streak * 0.45, 0.35 + L.halo * 0.18, L.streak, _c, streakK * L.i);
          }
          if (L.point && (flags & 1) && lampN < MAXL) {
            lampD[lampN] = -wz; lampX[lampN] = wx; lampY[lampN] = L.y - 0.3; lampZ[lampN] = wz;
            lampR[lampN] = pointC.r; lampG[lampN] = pointC.g; lampB[lampN] = pointC.b; lampI[lampN] = L.point;
            lampOrder[lampN] = lampN; lampN++;
          }
        }
      }
    }
    for (const k of kinds) {
      if (k.body) { k.body.count = k.n; k.body.instanceMatrix.needsUpdate = true; k.body.visible = k.n > 0; }
      if (k.glow) { k.glow.count = k.n; k.glow.instanceMatrix.needsUpdate = true; k.glow.visible = k.n > 0; }
    }
    for (const m of [halos, pools, streaks]) { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
    // insertion sort the lamps by distance (a few dozen at most, once per chunk)
    for (let i = 1; i < lampN; i++) {
      const v = lampOrder[i];
      let j = i - 1;
      while (j >= 0 && lampD[lampOrder[j]] > lampD[v]) { lampOrder[j + 1] = lampOrder[j]; j--; }
      lampOrder[j + 1] = v;
    }
  }
  let firstChunk = 0;
  function resetChunks(dist) {
    firstChunk = Math.max(0, Math.floor(dist / CH) - 1);
    chunks.forEach((ch, i) => layoutChunk(ch, firstChunk + i));
    rebuildScenery();
  }
  function advanceChunks(dist) {
    let changed = false;
    while (dist - CH * (firstChunk + 1) > 14) {
      const ch = chunks.shift();
      layoutChunk(ch, firstChunk + NCH);
      chunks.push(ch);
      firstChunk++;
      changed = true;
    }
    if (changed) rebuildScenery();
  }

  // ---- obstacles
  const O = S.obstacles;
  const obNames = [...new Set([...O.low, ...O.high, ...O.block, O.spanLow, O.spanHigh, ...O.thrown])];
  const pools_ = {};
  obNames.forEach((name, i) => {
    const b = buildObstacle(name, 300 + i);
    for (const L of b.lights) L.col = new THREE.Color(L.c);
    const span = name === O.spanLow || name === O.spanHigh;
    const cap = span ? 5 : 14;
    const p = { name, cap, n: 0, items: new Array(cap).fill(null), lights: b.lights, body: null, glow: null };
    if (b.body) { p.body = new THREE.InstancedMesh(G(b.body), matBody, cap); p.body.frustumCulled = false; p.body.count = 0; scene.add(p.body); }
    if (b.glow) { p.glow = new THREE.InstancedMesh(G(b.glow), matGlow, cap); p.glow.frustumCulled = false; p.glow.count = 0; scene.add(p.glow); }
    pools_[name] = p;
  });
  const poolList = Object.values(pools_);
  const cupB = buildCup();
  const CUPS = 8;
  const cupBody = new THREE.InstancedMesh(G(cupB.body), matBody, CUPS); cupBody.frustumCulled = false; cupBody.count = 0; scene.add(cupBody);
  const cupGlow = new THREE.InstancedMesh(G(cupB.glow), matGlow, CUPS); cupGlow.frustumCulled = false; cupGlow.count = 0; scene.add(cupGlow);
  const cups = new Array(CUPS).fill(null);
  let cupN = 0;

  function modelFor(row, o, lane) {
    if (row.span) return o.type === 'low' ? O.spanLow : O.spanHigh;
    const list = row.thrown ? O.thrown : O[o.type];
    return list[o.variant % list.length];
  }
  function rowAdd(row) {
    if (row.inView) return;
    row.inView = true;
    for (let i = 0; i < 3; i++) {
      const o = row.lanes[i];
      if (!o || o.ref) continue;
      const p = pools_[modelFor(row, o, i)];
      if (!p || p.n >= p.cap) { o.pool = null; continue; }
      o.pool = p; o.slot = p.n; p.items[p.n++] = o;
      o.row = row; o.x = row.span ? 0 : laneX(i); o.knockT = -1; o.throwT = row.thrown ? -2 : -1;
      o.side = i === 0 ? -1 : i === 2 ? 1 : (row.id % 2 ? 1 : -1);
    }
    if (row.pickup >= 0 && cupN < CUPS) { row.cupSlot = cupN; cups[cupN++] = row; } else row.cupSlot = -1;
  }
  function rowDrop(row) {
    if (!row.inView) return;
    row.inView = false;
    for (let i = 0; i < 3; i++) {
      const o = row.lanes[i];
      if (!o || o.ref || !o.pool) continue;
      const p = o.pool, last = p.items[--p.n];
      p.items[o.slot] = last; last.slot = o.slot; p.items[p.n] = null;
      o.pool = null; o.row = null;
    }
    if (row.cupSlot >= 0) {
      const last = cups[--cupN];
      cups[row.cupSlot] = last; last.cupSlot = row.cupSlot; cups[cupN] = null; row.cupSlot = -1;
    }
  }

  // ---- characters
  function part(build) {
    const gb = new GB(5); build(gb); const b = gb.build();
    const m = new THREE.Mesh(G(b.body), matBody); m.frustumCulled = false;
    if (!b.glow) return m;
    const grp = new THREE.Group(); const gm = new THREE.Mesh(G(b.glow), matGlow); gm.frustumCulled = false;
    grp.add(m, gm); return grp;
  }
  function makeRunner(look) {
    const root = new THREE.Group(), hips = new THREE.Group(), torso = new THREE.Group(), headG = new THREE.Group();
    root.add(hips); hips.add(torso);
    hips.position.y = 0.98;
    torso.add(part((gb) => {
      gb.box(0.46, 0.62, 0.27, 0, 0, 0, look.coat, { jit: 0.02 });
      gb.box(0.2, 0.2, 0.06, 0, 0.42, -0.13, look.shirt);
      gb.box(0.5, 0.12, 0.3, 0, 0.55, 0.01, look.coat, { i: 0.85 }); // collar / shoulders
      if (look.stripe) { gb.box(0.47, 0.05, 0.28, 0, 0.3, 0, look.stripe, { glow: true, i: 1.1 }); gb.box(0.47, 0.05, 0.28, 0, 0.18, 0, look.stripe, { glow: true, i: 1.1 }); }
      gb.box(0.12, 0.1, 0.12, 0, 0.62, 0, look.skin);
    }));
    torso.add(headG); headG.position.y = 0.72;
    headG.add(part((gb) => {
      gb.box(0.2, 0.24, 0.22, 0, 0, 0, look.skin);
      gb.box(0.22, 0.09, 0.24, 0, 0.17, 0.01, look.hair);
      gb.box(0.22, 0.14, 0.06, 0, 0.06, 0.1, look.hair);
      if (look.cap) { gb.box(0.24, 0.08, 0.26, 0, 0.2, 0, look.cap); gb.box(0.22, 0.02, 0.14, 0, 0.2, -0.17, look.cap); }
    }));
    if (look.skirt) hips.add(part((gb) => gb.box(0.5, 0.56, 0.31, 0, -0.5, 0.01, look.coat, { jit: 0.02 })));
    const limbs = {};
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * 0.29, 0.54, 0); torso.add(sh);
      sh.add(part((gb) => { gb.box(0.12, 0.32, 0.13, 0, -0.3, 0, look.sleeve || look.coat); if (look.stripe) gb.box(0.13, 0.04, 0.14, 0, -0.22, 0, look.stripe, { glow: true, i: 1.1 }); }));
      const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
      el.add(part((gb) => { gb.box(0.1, 0.28, 0.11, 0, -0.27, 0, look.sleeve || look.coat); gb.box(0.09, 0.09, 0.1, 0, -0.35, 0, look.skin); }));
      const hp = new THREE.Group(); hp.position.set(s * 0.11, 0, 0); hips.add(hp);
      hp.add(part((gb) => gb.box(0.16, 0.47, 0.17, 0, -0.47, 0, look.legs)));
      const kn = new THREE.Group(); kn.position.y = -0.47; hp.add(kn);
      kn.add(part((gb) => { gb.box(0.14, 0.45, 0.15, 0, -0.45, 0, look.legs); gb.box(0.13, 0.08, 0.27, 0, -0.51, -0.05, look.shoes); }));
      limbs[s] = { sh, el, hp, kn };
    }
    return { root, hips, torso, head: headG, L: limbs[-1], R: limbs[1], phase: 0 };
  }
  const hero = makeRunner({ coat: '#b08650', shirt: '#d8d0c0', skin: '#a8774f', hair: '#16120e', legs: '#24282c', shoes: '#101010', skirt: true });
  const thief = makeRunner({ coat: '#cc2a32', sleeve: '#b8262d', stripe: '#d8e4e0', shirt: '#2a2a2a', skin: '#9a6a44', hair: '#121010', cap: '#141414', legs: '#2a3448', shoes: '#e8e6e0' });
  scene.add(hero.root, thief.root);
  let scooter = null, tail = null;
  if (vehicle === 'scooter') {
    const gb = new GB(9);
    buildBikeInto(gb, '#c9c3b0', { lit: true, box: '#2a4a6a' });
    const b = gb.build();
    scooter = new THREE.Group();
    scooter.add(new THREE.Mesh(G(b.body), matBody), new THREE.Mesh(G(b.glow), matGlow));
    scooter.rotation.order = 'YXZ';
    scene.add(scooter);
    tail = new THREE.Mesh(G(planeXZ.clone()), M(new THREE.MeshBasicMaterial({ map: streakTex, ...add, color: new THREE.Color('#ff3030').multiplyScalar(0.9) })));
    scene.add(tail);
  }

  function pose(r, mode, dt, speed, y, slide, extra = 0) {
    r.phase += dt * speed * 1.5;
    const ph = r.phase, sn = Math.sin(ph), cs = Math.cos(ph);
    const { L, R, hips, torso } = r;
    hips.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0);
    r.root.rotation.set(0, 0, 0);
    hips.position.y = 0.98;
    L.sh.rotation.set(0, 0, 0); R.sh.rotation.set(0, 0, 0);
    if (mode === 'idle') {
      const b = Math.sin(ph * 0.15) * 0.03;
      L.hp.rotation.x = 0.05; R.hp.rotation.x = -0.05; L.kn.rotation.x = -0.08; R.kn.rotation.x = -0.05;
      L.sh.rotation.x = 0.1 + b; R.sh.rotation.x = -0.05 - b; L.el.rotation.x = 0.3; R.el.rotation.x = 0.25;
      L.sh.rotation.z = -0.08; R.sh.rotation.z = 0.08;
      torso.rotation.x = -0.05;
      return;
    }
    if (mode === 'ride') {
      hips.position.y = 0.82;
      L.hp.rotation.x = R.hp.rotation.x = 1.45; L.kn.rotation.x = R.kn.rotation.x = -1.35;
      L.sh.rotation.x = R.sh.rotation.x = 1.0; L.el.rotation.x = R.el.rotation.x = 0.5;
      torso.rotation.x = -0.3;
      return;
    }
    if (mode === 'tackle') {
      r.root.rotation.x = -1.2 * extra;
      hips.position.y = 0.98 - 0.5 * extra;
      L.sh.rotation.x = R.sh.rotation.x = 2.7 * extra; L.el.rotation.x = R.el.rotation.x = 0.2;
      L.hp.rotation.x = -0.3; R.hp.rotation.x = 0.2; L.kn.rotation.x = -0.6; R.kn.rotation.x = -0.3;
      return;
    }
    if (mode === 'fall') {
      r.root.rotation.x = -1.35 * extra;
      L.sh.rotation.x = R.sh.rotation.x = 2.2 * extra; L.sh.rotation.z = -0.6 * extra; R.sh.rotation.z = 0.6 * extra;
      L.hp.rotation.x = 0.4; R.hp.rotation.x = -0.2; L.kn.rotation.x = -0.9; R.kn.rotation.x = -0.4;
      return;
    }
    if (slide > 0) {
      hips.position.y = 0.36;
      hips.rotation.x = 1.15;
      torso.rotation.x = -0.25;
      L.hp.rotation.x = 0.35; R.hp.rotation.x = 0.1; L.kn.rotation.x = -0.15; R.kn.rotation.x = -0.9;
      L.sh.rotation.x = -0.6; R.sh.rotation.x = 0.4; L.sh.rotation.z = -0.5; R.sh.rotation.z = 0.5;
      L.el.rotation.x = R.el.rotation.x = 0.4;
      return;
    }
    if (y > 0.02) {
      L.hp.rotation.x = 1.0; R.hp.rotation.x = -0.15; L.kn.rotation.x = -1.4; R.kn.rotation.x = -0.9;
      L.sh.rotation.x = -0.8; R.sh.rotation.x = 1.2; L.el.rotation.x = R.el.rotation.x = 0.9;
      torso.rotation.x = -0.25;
      return;
    }
    const A = 0.95;
    L.hp.rotation.x = A * sn; R.hp.rotation.x = -A * sn;
    L.kn.rotation.x = -(0.2 + 1.35 * Math.max(0, cs)); R.kn.rotation.x = -(0.2 + 1.35 * Math.max(0, -cs));
    L.sh.rotation.x = -0.8 * sn; R.sh.rotation.x = 0.8 * sn;
    L.el.rotation.x = R.el.rotation.x = 1.35;
    hips.position.y = 0.98 + 0.06 * Math.abs(cs);
    torso.rotation.x = mode === 'stumble' ? -0.6 + Math.sin(ph * 2) * 0.15 : -0.22;
    if (mode === 'stumble') { L.sh.rotation.z = -0.9; R.sh.rotation.z = 0.9; }
    torso.rotation.y = 0.12 * sn;
  }

  // ---- rain
  const NR = reduced ? 500 : lowPower ? 900 : 1500;
  const rpos = new Float32Array(NR * 6), rseed = new Float32Array(NR * 6), rtip = new Float32Array(NR * 2);
  const rr = mulberry32(seed ^ 991);
  for (let i = 0; i < NR; i++) {
    const a = rr(), b = rr(), c = rr();
    rseed.set([a, b, c, a, b, c], i * 6);
    rtip[i * 2] = 0; rtip[i * 2 + 1] = 1;
  }
  const rainGeo = G(new THREE.BufferGeometry());
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rpos, 3));
  rainGeo.setAttribute('seed', new THREE.BufferAttribute(rseed, 3));
  rainGeo.setAttribute('tip', new THREE.BufferAttribute(rtip, 1));
  const rainMat = M(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(26, 16, 46) }, uFall: { value: reduced ? 9 : 17 }, uSpeed: { value: 0 }, uColor: { value: new THREE.Color(S.rain[0], S.rain[1], S.rain[2]) }, uAlpha: { value: S.rain[3] } },
    vertexShader: `
      attribute vec3 seed; attribute float tip;
      uniform float uTime; uniform vec3 uCam; uniform vec3 uBox; uniform float uFall; uniform float uSpeed;
      varying float vA;
      void main() {
        vec3 p;
        p.x = uCam.x + (seed.x - 0.5) * uBox.x;
        p.y = mod(seed.y * uBox.y - uTime * uFall, uBox.y) - 0.5;
        p.z = uCam.z - mod(seed.z * uBox.z + uCam.z, uBox.z) + 5.0;
        p += vec3(0.1, -1.0, 0.0) * (uFall * 0.03 * tip) + vec3(0.0, 0.0, uSpeed * 0.018 * tip);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = (1.0 - smoothstep(8.0, 40.0, -mv.z)) * (0.45 + 0.55 * seed.z) * smoothstep(-0.5, 0.6, p.y);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uAlpha; varying float vA;
      void main() { gl_FragColor = vec4(uColor, uAlpha * vA); }`,
  }));
  const rain = new THREE.LineSegments(rainGeo, rainMat);
  rain.frustumCulled = false;
  scene.add(rain);

  // ---- state
  let run = null;
  let width = 1, height = 1;
  let shake = 0;
  let flash = 0, nextFlash = 8 + Math.random() * 10;
  let time = 0;
  const camPos = new THREE.Vector3(0, 3, 6);
  let lastCalls = 0, lastTris = 0;
  let catchX = 0;
  let onThunder = null;

  function attach(r) {
    if (run) for (const row of run.rows) rowDrop(row);
    run = r;
    if (!run) return;
    for (const row of run.rows) rowAdd(row);
    resetChunks(run.dist);
    hero.phase = 0; thief.phase = 1.7;
  }

  function event(e) {
    if (e.type === 'hit') { shake = reduced ? 0 : 0.5; const o = e.row?.lanes[e.lane]; const t = o && (o.ref || o); if (t) t.knockT = 0; }
    else if (e.type === 'brush') { const o = e.row?.lanes[e.lane]; const t = o && (o.ref || o); if (t) t.knockT = 0; }
    else if (e.type === 'throw') {
      const o = e.row.lanes.find(Boolean);
      if (o) {
        o.throwT = 0;
        const ahead = run.suspect.ahead, rel = e.row.dist - run.dist;
        if (ahead > rel + 2) { o.fx = run.suspect.x; o.fy = 1.3; o.fz = -(run.dist + ahead); } else { o.fx = o.side * 4.6; o.fy = 1.0; o.fz = -e.row.dist + 0.8; }
      }
    }
  }

  function placeObstacles(dt) {
    dynHalos.count = 0;
    for (let pi = 0; pi < poolList.length; pi++) {
      const p = poolList[pi];
      for (let i = 0; i < p.n; i++) {
        const o = p.items[i], row = o.row;
        let x = o.x, y = 0, z = -row.dist, rx = 0, ry = 0, rz = 0, sc = 1;
        if (row.hidden) sc = 0;
        if (o.throwT >= 0 && o.throwT < 1) {
          o.throwT = Math.min(1, o.throwT + dt / 0.55);
          const u = o.throwT, e = 1 - (1 - u) * (1 - u);
          x = o.fx + (o.x - o.fx) * e; z = o.fz + (-row.dist - o.fz) * e; y = o.fy * (1 - u) + Math.sin(u * PI) * 1.6;
          rx = (1 - u) * 5; rz = (1 - u) * 2 * o.side;
        }
        if (o.knockT >= 0) {
          o.knockT += dt;
          const t = o.knockT;
          if (o.type === 'block') rz = Math.sin(t * 34) * 0.07 * Math.exp(-t * 4);
          else if (o.type === 'low') { const u = Math.min(1, t * 2.2); z -= u * 2.2; x += o.side * u * 0.9; rx = -u * 1.4; rz = o.side * u * 0.5; }
          else rx = -0.7 * Math.exp(-t * 2.5) * Math.cos(t * 10);
        }
        _e.set(rx, ry, rz); _q.setFromEuler(_e);
        _m.compose(_p.set(x, y, z), _q, _s.set(sc, sc, sc));
        if (p.body) p.body.setMatrixAt(i, _m);
        if (p.glow) p.glow.setMatrixAt(i, _m);
        if (sc > 0) for (let li = 0; li < p.lights.length; li++) { const L = p.lights[li]; putDecal(dynHalos, x + L.x, y + L.y, z + L.z, L.halo, 1, L.col, haloK * L.i); }
      }
      if (p.body) { p.body.count = p.n; p.body.visible = p.n > 0; p.body.instanceMatrix.needsUpdate = true; }
      if (p.glow) { p.glow.count = p.n; p.glow.visible = p.n > 0; p.glow.instanceMatrix.needsUpdate = true; }
    }
    for (let i = 0; i < cupN; i++) {
      const row = cups[i];
      const taken = row.pickupTaken;
      const sc = taken ? 0 : 1;
      _e.set(0.15, time * 2.4 + i, 0); _q.setFromEuler(_e);
      _m.compose(_p.set(laneX(row.pickup), 0.85 + Math.sin(time * 3 + i) * 0.08, -row.dist), _q, _s.set(sc * 1.6, sc * 1.6, sc * 1.6));
      cupBody.setMatrixAt(i, _m); cupGlow.setMatrixAt(i, _m);
      if (!taken) putDecal(dynHalos, laneX(row.pickup), 1.1, -row.dist, 1.5 + Math.sin(time * 5) * 0.2, 1, CUP_C, 0.75);
    }
    cupBody.count = cupGlow.count = cupN;
    cupBody.visible = cupGlow.visible = cupN > 0;
    cupBody.instanceMatrix.needsUpdate = cupGlow.instanceMatrix.needsUpdate = true;
  }

  function placeLights(dist) {
    let k = 0;
    for (let j = 0; j < lampN && k < NPL; j++) {
      const i = lampOrder[j];
      const a = lampD[i] - dist;
      if (a < -10) continue;
      const fade = a > 44 ? clamp((64 - a) / 20, 0, 1) : a < -4 ? clamp((a + 10) / 6, 0, 1) : 1;
      const l = points[k++];
      l.position.set(lampX[i], lampY[i], lampZ[i]);
      l.color.setRGB(lampR[i], lampG[i], lampB[i]);
      l.intensity = S.point.i * lampI[i] * fade;
    }
    for (; k < NPL; k++) points[k].intensity = 0;
  }

  function frame(dt, view) {
    time += dt;
    if (!run) return;
    const s = run.suspect;
    let pd = run.dist;
    const ct = view.catchT;
    // the catch: slow motion, a short dive, the camera swings to the side
    if (view.mode === 'catch') pd += Math.min(1, ct / 0.9) * 0.9;
    advanceChunks(pd);
    placeObstacles(view.mode === 'catch' ? dt * 0.3 : dt);
    placeLights(pd);

    // characters
    const moving = view.mode === 'run' || view.mode === 'catch' || view.mode === 'lost';
    const animDt = view.mode === 'catch' ? dt * 0.3 : moving ? dt : dt * 0.3;
    hero.root.position.set(run.x, run.y, -pd);
    if (view.mode === 'catch') {
      const u = clamp((ct - 0.15) / 0.6, 0, 1);
      hero.root.position.y = 0.25 * Math.sin(u * PI) + 0.0;
      pose(hero, 'tackle', animDt, run.speed, 0, 0, u);
    } else pose(hero, !moving || view.mode === 'lost' ? 'idle' : run.stumbleT > 0 ? 'stumble' : 'run', animDt, run.speed, run.y, run.slideT);
    let sAhead = s.ahead;
    if (view.mode === 'catch') sAhead = 1.6 + Math.min(1, ct / 0.9) * 0.2;
    if (view.mode === 'lost') sAhead = s.ahead + view.lostT * 18;
    const sz = -(pd + sAhead);
    thief.root.position.set(s.x, s.y, sz);
    if (scooter) {
      scooter.position.set(s.x, s.y, sz);
      scooter.rotation.set(0, 0, clamp((laneX(s.lane) - s.x) * -0.25, -0.35, 0.35));
      thief.root.position.y += 0;
      thief.root.rotation.z = scooter.rotation.z;
      if (view.mode === 'catch') { const u = clamp((ct - 0.4) / 0.8, 0, 1); scooter.rotation.z = u * 1.4; scooter.position.x += u * 1.5; }
      pose(thief, view.mode === 'catch' && ct > 0.45 ? 'fall' : 'ride', animDt, run.speed, 0, 0, clamp((ct - 0.45) / 0.5, 0, 1));
      tail.position.set(s.x, 0.04, sz + 2.2);
      tail.scale.set(0.5, 1, 4.5);
    } else {
      pose(thief, view.mode === 'catch' && ct > 0.45 ? 'fall' : moving ? 'run' : 'idle', animDt, run.speed * 0.98, s.y, s.slideT, clamp((ct - 0.45) / 0.5, 0, 1));
    }
    // he looks back now and then
    thief.head.rotation.y = !scooter && moving && Math.sin(time * 0.7) > 0.86 ? 2.4 : 0;
    // blob shadows
    _m.makeScale(0.9 + run.y * 0.2, 1, 0.9); _m.setPosition(run.x, 0.04, -pd); blobs.setMatrixAt(0, _m);
    _m.makeScale(scooter ? 1.0 : 0.85, 1, scooter ? 1.8 : 0.85); _m.setPosition(s.x, 0.04, sz); blobs.setMatrixAt(1, _m);
    blobs.instanceMatrix.needsUpdate = true;
    dynHalos.instanceMatrix.needsUpdate = true; dynHalos.instanceColor.needsUpdate = true;
    if (scooter) putDecal(dynHalos, s.x, s.y + 0.7, sz + 0.62, 1.1, 1, TAIL_C, 0.9);

    // ground follows in whole texture tiles, so the textures stay put in the world
    const snap = Math.floor(pd / TILE) * TILE;
    road.position.z = -snap - ROAD_LEN / 2 + 30;
    for (const m of sides) m.position.z = road.position.z;
    if (edges) edges.position.z = road.position.z;

    // camera
    const portrait = width / height < 0.9;
    const back = portrait ? 6.4 : 5.6, up = portrait ? 3.7 : 3.05;
    let tx = run.x * 0.55, ty = up + run.y * 0.35, tz = -pd + back;
    let lx = run.x * 0.7, ly = portrait ? 0.9 : 1.25, lz = -pd - 11;
    if (view.mode === 'catch') {
      const u = reduced ? 0 : clamp(ct / 1.1, 0, 1);
      const e = u * u * (3 - 2 * u);
      catchX = run.x;
      tx = catchX + 4.2 * e + (1 - e) * tx; ty = ty + (1.7 - ty) * e; tz = tz + (-pd - 1.5 - tz) * e;
      lx = catchX + (lx - catchX) * (1 - e); ly = ly + (0.7 - ly) * e; lz = lz + (-pd - 1.2 - lz) * e;
    }
    if (view.mode === 'idle' || view.mode === 'count') { tz += 0.6; ty += 0.2; }
    const k = Math.min(1, dt * 9);
    camPos.x += (tx - camPos.x) * k; camPos.y += (ty - camPos.y) * k; camPos.z = tz;
    if (view.mode === 'catch') { camPos.x = tx; camPos.y = ty; }
    camera.position.copy(camPos);
    if (shake > 0) {
      shake = Math.max(0, shake - dt * 1.6);
      camera.position.x += (Math.random() - 0.5) * shake * 0.5;
      camera.position.y += (Math.random() - 0.5) * shake * 0.4;
    }
    _look.set(lx, ly, lz);
    camera.lookAt(_look);
    const fov = (portrait ? 66 : 54) + (!reduced && run.sprintT > 0 && view.mode === 'run' ? 6 : 0);
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix(); }

    fill.position.set(camPos.x, camPos.y - 0.5, camPos.z - 2.5);
    backdrop.position.set(camPos.x * 0.9, 38, camPos.z - 270);
    rainMat.uniforms.uTime.value = time;
    rainMat.uniforms.uCam.value.copy(camPos);
    rainMat.uniforms.uSpeed.value = moving && view.mode !== 'lost' ? run.speed : 0;

    // lightning, now and then (never with reduced motion)
    if (!reduced) {
      nextFlash -= dt;
      if (nextFlash <= 0) { flash = 0.32; nextFlash = 10 + Math.random() * 14; onThunder?.(); }
      if (flash > 0) flash = Math.max(0, flash - dt);
      const f = flash > 0.22 || (flash > 0.06 && flash < 0.12) ? 1 : 0;
      hemi.intensity = S.hemi[2] * (1 + f * 2.2);
      backdropMat.color.setScalar(1 + f * 0.8);
    }

    renderer.render(scene, camera);
    lastCalls = renderer.info.render.calls;
    lastTris = renderer.info.render.triangles;
  }

  function resize(w, h, dpr) {
    width = Math.max(1, w); height = Math.max(1, h);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width / height < 0.9 ? 66 : 54;
    camera.updateProjectionMatrix();
  }

  function destroy() {
    run = null;
    scene.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
    for (const g of owned.geo) g.dispose();
    for (const m of owned.mat) m.dispose();
    for (const t of owned.tex) t.dispose();
    planeXY.dispose(); planeXZ.dispose();
    scene.clear();
    renderer.renderLists.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return {
    kind: '3d',
    attach, rowAdd, rowDrop, event, frame, resize, destroy,
    set onThunder(f) { onThunder = f; },
    info: () => ({ calls: lastCalls, triangles: lastTris, programs: renderer.info.programs?.length || 0, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }),
    renderer,
    scene,
  };
}
