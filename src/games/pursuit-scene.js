// Foot Chase: the three.js view. It owns its own WebGLRenderer (never the office scene's) and
// releases everything in destroy(). The rules live in pursuit-logic.js; this file only draws a run.
//
// One renderer for the whole chase; load(setting) swaps the world (ground, skyline, scenery kinds,
// obstacle models) between legs. Characters, rain, light decals and the first-person view persist.
// First person by default (eye height, head bob, lean into the steering, fists showing at the
// bottom of the frame on the pump); third person behind the detective as an option.
//
// Budget: everything repeated is instanced (scenery kinds, obstacles, cups, halos, light pools,
// wet-road streaks, light shafts, shadows), so a frame is roughly 50-90 draw calls whatever the
// setting or camera. Nothing is allocated per frame: temp vectors and matrices are module-level.
import * as THREE from 'three';
import { SETTINGS, buildObstacle, buildKind, buildCup, GB, buildBikeInto, hasModel } from './pursuit-kits.js';
import { modelNames, dimOf, X_MAX } from './pursuit-logic.js';
import { mulberry32, hashStr } from '../core/rng.js';
import { drawBackdrop, drawGround } from './pursuit-paint.js';

const CH = 48; // scenery chunk length, m
const NCH = 4;
const MAXREC = 200;
const ROAD_LEN = 208;
const TILE = 16; // ground textures repeat every 16 m (photo tiles every 4 m)
const PHOTO_M = 4;
// tiles with a visible seam or patch repeat less often
const PHOTO_SIZE = { zinc_roof: 7 };
const PI = Math.PI;
const LONG = { hoarding: 2.0, containerLong: 2.0, fenceLong: 1.9 }; // stretched walls: built 1 m long, this wide
const PHOTO = { asphalt: 'asphalt_wet', market: 'asphalt_wet', oldroad: 'cobble_wet', yard: 'concrete_stain', planks: 'planks_wet', roofdeck: 'concrete_stain', laterite: 'laterite', pavement: 'concrete_stain', concrete: 'concrete_stain', grass: 'grass_dark', zinc: 'zinc_roof' };

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const _look = new THREE.Vector3();
const Q0 = new THREE.Quaternion();
const QPI = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), PI);
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const smooth = (u) => u * u * (3 - 2 * u);

function gradientTex(size, stops, linear = false) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = linear ? g.createLinearGradient(0, 0, 0, size) : g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

// photo tiles are shared by every leg; a failed load leaves the painted texture in place
const photoCache = new Map();
function loadPhoto(name) {
  if (!photoCache.has(name)) photoCache.set(name, new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0 ? img : null);
    img.onerror = () => resolve(null);
    img.src = `assets/tex/${name}.jpg`;
  }));
  return photoCache.get(name);
}

export function createScene3D({ canvas, vehicle = 'foot', reduced = false, lowPower = false, seed = 1, pov = true, skyline = 'kl' }) {
  const own = { geo: [], mat: [], tex: [] };
  const G = (g, o = own) => { o.geo.push(g); return g; };
  const M = (m, o = own) => { o.mat.push(m); return m; };
  const T = (t, o = own) => { o.tex.push(t); return t; };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance', stencil: false, depth: true });
  if (!renderer.getContext()) throw new Error('no webgl');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a2b33');
  scene.fog = new THREE.FogExp2('#1c2e36', 0.024);
  const camera = new THREE.PerspectiveCamera(64, 1, 0.05, 260);
  scene.add(camera);

  // ---- lights (colours follow the setting)
  const hemi = new THREE.HemisphereLight('#5a8a9a', '#2a1a10', 0.85);
  const moon = new THREE.DirectionalLight('#9fc8d8', 0.35);
  moon.position.set(-0.4, 1, 0.3);
  scene.add(hemi, moon, moon.target);
  const NPL = lowPower ? 3 : 4;
  const points = [];
  for (let i = 0; i < NPL; i++) { const l = new THREE.PointLight('#ffad55', 0, 24, 1.7); scene.add(l); points.push(l); }
  const fill = new THREE.PointLight('#c0ccd0', 5, 10, 1.5); // rides with the camera
  scene.add(fill);

  // ---- shared materials and textures
  const matBody = M(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.74, metalness: 0.04 }));
  const matGlow = M(new THREE.MeshBasicMaterial({ vertexColors: true }));
  const haloTex = T(new THREE.CanvasTexture(gradientTex(64, [[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,255,255,0.55)'], [0.45, 'rgba(255,255,255,0.14)'], [1, 'rgba(255,255,255,0)']])));
  const poolTex = T(new THREE.CanvasTexture(gradientTex(64, [[0, 'rgba(255,255,255,0.8)'], [0.5, 'rgba(255,255,255,0.28)'], [1, 'rgba(255,255,255,0)']])));
  const shaftTex = T(new THREE.CanvasTexture(gradientTex(64, [[0, 'rgba(255,255,255,0.55)'], [0.35, 'rgba(255,255,255,0.22)'], [1, 'rgba(255,255,255,0)']], true)));
  const streakTex = T(new THREE.CanvasTexture((() => {
    const c = document.createElement('canvas'); c.width = 32; c.height = 128;
    const g = c.getContext('2d');
    for (let y = 0; y < 128; y++) {
      const v = Math.sin((y / 128) * PI) * (0.55 + 0.45 * Math.sin(y * 0.9) * Math.sin(y * 0.23));
      const grd = g.createLinearGradient(0, 0, 32, 0);
      grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.5, `rgba(255,255,255,${Math.max(0, v).toFixed(3)})`); grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, y, 32, 1);
    }
    return c;
  })()));
  const blobTex = T(new THREE.CanvasTexture(gradientTex(64, [[0, 'rgba(0,0,0,0.78)'], [0.6, 'rgba(0,0,0,0.38)'], [1, 'rgba(0,0,0,0)']])));
  const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const matHalo = M(new THREE.MeshBasicMaterial({ map: haloTex, ...add, fog: false }));
  const matPool = M(new THREE.MeshBasicMaterial({ map: poolTex, ...add, polygonOffset: true, polygonOffsetFactor: -2 }));
  const matStreak = M(new THREE.MeshBasicMaterial({ map: streakTex, ...add, polygonOffset: true, polygonOffsetFactor: -3 }));
  const matShaft = M(new THREE.MeshBasicMaterial({ map: shaftTex, ...add, side: THREE.DoubleSide }));
  const matBlob = M(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));

  // ---- decals
  const mkInst = (geo, mat, cap, colored) => {
    const m = new THREE.InstancedMesh(G(geo), mat, cap);
    if (colored) m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    m.frustumCulled = false; m.count = 0;
    scene.add(m);
    return m;
  };
  const planeXY = () => new THREE.PlaneGeometry(1, 1);
  const planeXZ = () => new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2);
  const halos = mkInst(planeXY(), matHalo, 900, true);
  const pools = mkInst(planeXZ(), matPool, 400, true);
  const streaks = mkInst(planeXZ(), matStreak, 400, true);
  const shafts = mkInst(new THREE.CylinderGeometry(0.12, 1, 1, 14, 1, true).translate(0, -0.5, 0), matShaft, 120, true);
  const dynHalos = mkInst(planeXY(), matHalo, 64, true);
  const blobs = mkInst(planeXZ(), matBlob, 16, false);
  const haloK = 0.9, poolK = 0.55;
  function putDecal(mesh, x, y, z, sx, sz, col, k, sy = 1) {
    if (mesh.count >= mesh.instanceMatrix.count) return;
    if (mesh === halos || mesh === dynHalos) _m.makeScale(sx, sx, 1);
    else _m.makeScale(sx, sy, sz);
    _m.setPosition(x, y, z);
    mesh.setMatrixAt(mesh.count, _m);
    if (mesh.instanceColor) mesh.instanceColor.setXYZ(mesh.count, col.r * k, col.g * k, col.b * k);
    mesh.count++;
  }
  const putBlob = (x, y, z, sx, sz) => putDecal(blobs, x, y + 0.04, z, sx, sz, null, 1);

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
      gb.box(0.5, 0.12, 0.3, 0, 0.55, 0.01, look.coat, { i: 0.85 });
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
    scene.add(scooter);
    tail = new THREE.Mesh(G(planeXZ()), M(new THREE.MeshBasicMaterial({ map: streakTex, ...add, color: new THREE.Color('#ff3030').multiplyScalar(0.9) })));
    scene.add(tail);
  }

  // first person: fists that show at the bottom of the frame on the pump, reach out for the tackle
  const arms = new THREE.Group();
  camera.add(arms);
  const armOf = (s) => {
    const g = new THREE.Group();
    g.add(part((gb) => {
      gb.box(0.11, 0.11, 0.46, 0, -0.055, 0.16, '#b08650', { jit: 0.02 });
      gb.box(0.1, 0.11, 0.04, 0, -0.055, -0.08, '#d8d0c0');
      gb.box(0.09, 0.1, 0.12, 0, -0.05, -0.16, '#a8774f');
      gb.box(0.03, 0.05, 0.08, -s * 0.055, -0.03, -0.14, '#9a6a44');
    }));
    arms.add(g);
    return g;
  };
  const armL = armOf(-1), armR = armOf(1);
  // speed lines while sprinting (never under reduced motion)
  const NS = 70;
  const sSeed = new Float32Array(NS * 6), sTip = new Float32Array(NS * 2);
  const sr = mulberry32(seed ^ 4242);
  for (let i = 0; i < NS; i++) { const a = sr() * PI * 2, r = 0.9 + sr() * 1.6, ph = sr(); sSeed.set([a, r, ph, a, r, ph], i * 6); sTip[i * 2 + 1] = 1; }
  const speedGeo = G(new THREE.BufferGeometry());
  speedGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 6), 3));
  speedGeo.setAttribute('seed', new THREE.BufferAttribute(sSeed, 3));
  speedGeo.setAttribute('tip', new THREE.BufferAttribute(sTip, 1));
  const speedMat = M(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 } },
    vertexShader: `
      attribute vec3 seed; attribute float tip; uniform float uTime; varying float vA;
      void main() {
        float z = -mod(seed.z * 26.0 + uTime * 46.0, 26.0) - 1.2;
        vec3 p = vec3(cos(seed.x) * seed.y, sin(seed.x) * seed.y * 0.78, z - tip * 3.2);
        vA = smoothstep(-27.0, -10.0, p.z) * (1.0 - smoothstep(-3.5, -1.2, p.z)) * (0.4 + 0.6 * seed.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `uniform float uAlpha; varying float vA; void main() { gl_FragColor = vec4(0.95, 0.88, 0.72, uAlpha * vA); }`,
  }));
  const speedLines = new THREE.LineSegments(speedGeo, speedMat);
  speedLines.frustumCulled = false;
  speedLines.renderOrder = 10;
  camera.add(speedLines);

  // ---- rain
  const NR = reduced ? 500 : lowPower ? 900 : 1500;
  const rseed = new Float32Array(NR * 6), rtip = new Float32Array(NR * 2);
  const rr = mulberry32(seed ^ 991);
  for (let i = 0; i < NR; i++) { const a = rr(), b = rr(), c = rr(); rseed.set([a, b, c, a, b, c], i * 6); rtip[i * 2 + 1] = 1; }
  const rainGeo = G(new THREE.BufferGeometry());
  rainGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NR * 6), 3));
  rainGeo.setAttribute('seed', new THREE.BufferAttribute(rseed, 3));
  rainGeo.setAttribute('tip', new THREE.BufferAttribute(rtip, 1));
  const rainMat = M(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(26, 16, 46) }, uFall: { value: reduced ? 9 : 17 }, uSpeed: { value: 0 }, uColor: { value: new THREE.Color(0.62, 0.78, 0.84) }, uAlpha: { value: 0.32 } },
    vertexShader: `
      attribute vec3 seed; attribute float tip;
      uniform float uTime; uniform vec3 uCam; uniform vec3 uBox; uniform float uFall; uniform float uSpeed;
      varying float vA;
      void main() {
        vec3 p;
        p.x = uCam.x + (seed.x - 0.5) * uBox.x;
        p.y = uCam.y - 4.0 + mod(seed.y * uBox.y - uTime * uFall, uBox.y);
        p.z = uCam.z - mod(seed.z * uBox.z + uCam.z, uBox.z) + 5.0;
        p += vec3(0.1, -1.0, 0.0) * (uFall * 0.03 * tip) + vec3(0.0, 0.0, uSpeed * 0.018 * tip);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = (1.0 - smoothstep(8.0, 40.0, -mv.z)) * (0.45 + 0.55 * seed.z) * smoothstep(0.3, 2.0, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 uColor; uniform float uAlpha; varying float vA; void main() { gl_FragColor = vec4(uColor, uAlpha * vA); }`,
  }));
  const rain = new THREE.LineSegments(rainGeo, rainMat);
  rain.frustumCulled = false;
  scene.add(rain);

  // ---- cups (teh tarik), shared by every world
  const cupB = buildCup();
  const CUPS = 10;
  const cupBody = mkInst(cupB.body, matBody, CUPS, false);
  const cupGlow = mkInst(cupB.glow, matGlow, CUPS, false);
  const cups = new Array(CUPS).fill(null);
  let cupN = 0;
  const CUP_C = new THREE.Color('#ffb050'), TAIL_C = new THREE.Color('#ff2a2a');

  // ---- the escape props: a wall he vaults, an edge he drops from
  const vaultWall = (() => {
    const gb = new GB(13);
    gb.box(7.8, 1.35, 0.45, 0, 0, 0, '#5a524a', { jit: 0.03 });
    for (let i = 0; i < 6; i++) gb.box(7.82, 0.03, 0.47, 0, 0.2 + i * 0.2, 0, '#3a342e');
    gb.box(8.0, 0.12, 0.6, 0, 1.35, 0, '#7a746a');
    gb.box(7.8, 3.0, 0.3, 0, 1.47, -2.5, '#2a2e30');
    const m = new THREE.Mesh(G(gb.build().body), matBody); m.visible = false; scene.add(m); return m;
  })();
  const ledge = (() => { const b = buildObstacle('roofGap', 3); const g = new THREE.Group(); g.add(new THREE.Mesh(G(b.body), matBody)); if (b.glow) g.add(new THREE.Mesh(G(b.glow), matGlow)); g.scale.set(1, 1, 3); g.visible = false; scene.add(g); return g; })();

  // ---- the world for one setting ------------------------------------------------------------
  let W = null;
  const MAXL = 96;
  const lampD = new Float32Array(MAXL), lampX = new Float32Array(MAXL), lampY = new Float32Array(MAXL), lampZ = new Float32Array(MAXL), lampI = new Float32Array(MAXL);
  const lampOrder = new Int16Array(MAXL);
  let lampN = 0;

  function load(setting) {
    unload();
    const S = SETTINGS[setting] || SETTINGS.city;
    const wo = { geo: [], mat: [], tex: [] };
    const objs = [];
    const addObj = (o) => { scene.add(o); objs.push(o); return o; };
    renderer.toneMappingExposure = S.exposure;
    renderer.setClearColor(S.bg, 1);
    scene.background.set(S.bg);
    scene.fog.color.set(S.fog[0]);
    scene.fog.density = S.fogD || 0.025;
    hemi.color.set(S.hemi[0]); hemi.groundColor.set(S.hemi[1]); hemi.intensity = S.hemi[2];
    moon.color.set(S.moon[0]); moon.intensity = S.moon[1];
    rainMat.uniforms.uColor.value.setRGB(S.rain[0], S.rain[1], S.rain[2]);
    rainMat.uniforms.uAlpha.value = S.rain[3];
    const pointC = new THREE.Color(S.point.c);
    for (const l of points) { l.color.copy(pointC); l.distance = S.point.d; }

    // ground: painted maps first, photo tiles swapped in when they load
    const groundMat = (type, wM, len, tileW = wM) => {
      const { color, roughness } = drawGround(type, mulberry32(hashStr(type) ^ seed), tileW);
      const map = T(new THREE.CanvasTexture(color), wo);
      map.colorSpace = THREE.SRGBColorSpace;
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = maxAniso;
      map.repeat.set(wM / tileW, len / TILE);
      const rm = T(new THREE.CanvasTexture(roughness), wo);
      rm.wrapS = rm.wrapT = THREE.RepeatWrapping;
      rm.repeat.copy(map.repeat);
      const mat = M(new THREE.MeshStandardMaterial({ map, roughnessMap: rm, roughness: 1, metalness: 0 }), wo);
      const photo = PHOTO[type];
      if (photo) loadPhoto(photo).then((img) => {
        if (!img || !W || W.wo !== wo) return;
        const t = T(new THREE.Texture(img), wo);
        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = maxAniso;
        const pm = PHOTO_SIZE[photo] || PHOTO_M;
        t.repeat.set(wM / pm, len / pm);
        t.needsUpdate = true;
        mat.map = t;
        mat.color.setScalar(type === 'grass' || type === 'laterite' ? 0.85 : 0.7);
        mat.needsUpdate = true;
      });
      return mat;
    };
    const roadW = 7.8;
    const road = addObj(new THREE.Mesh(G(new THREE.PlaneGeometry(roadW, ROAD_LEN), wo), groundMat(S.road, roadW, ROAD_LEN)));
    road.rotation.x = -PI / 2;
    const sideMat = groundMat(S.side, 36, ROAD_LEN, 8);
    const sideGeo = G(new THREE.PlaneGeometry(36, ROAD_LEN), wo);
    const sides = [-1, 1].map((s) => {
      const m = addObj(new THREE.Mesh(sideGeo, sideMat));
      m.rotation.x = -PI / 2;
      m.position.x = s * (roadW / 2 + 18);
      m.position.y = S.sideY ?? (S.side === 'grass' ? -0.18 : 0);
      return m;
    });
    const edgeGB = new GB(3);
    for (const s of [-1, 1]) {
      if (S.side === 'grass') edgeGB.box(0.22, 0.24, ROAD_LEN, s * 3.95, -0.2, 0, S.road === 'laterite' ? '#3a2a1c' : '#3e2c1c');
      else if (S.side === 'zinc') { edgeGB.box(0.3, 0.75, ROAD_LEN, s * 4.05, 0, 0, '#5a5c5a'); edgeGB.box(0.4, 0.08, ROAD_LEN, s * 4.05, 0.75, 0, '#7a7c78'); edgeGB.box(0.3, 2.6, ROAD_LEN, s * 4.05, -2.6, 0, '#2e3234'); }
      else if (S.side !== 'yard') { edgeGB.box(0.3, 0.16, ROAD_LEN, s * 4.02, 0, 0, '#6a6a66'); edgeGB.box(0.5, 0.02, ROAD_LEN, s * 3.62, 0.005, 0, '#121416'); }
    }
    const eb = edgeGB.build();
    const edges = eb.body ? addObj(new THREE.Mesh(G(eb.body, wo), matBody)) : null;
    const bdTex = T(new THREE.CanvasTexture(drawBackdrop(S.backdrop, mulberry32(seed ^ 77), S.bg, S.haze || 0, skyline)), wo);
    bdTex.colorSpace = THREE.SRGBColorSpace;
    const backdropMat = M(new THREE.MeshBasicMaterial({ map: bdTex, fog: false, depthWrite: false }), wo);
    const backdrop = addObj(new THREE.Mesh(G(new THREE.PlaneGeometry(560, 140), wo), backdropMat));
    backdrop.renderOrder = -1;

    // scenery kinds
    const kindNames = Object.keys(S.kinds);
    const kinds = kindNames.map((name, i) => {
      const b = buildKind(setting, name, 100 + i);
      const k = { name, lights: b.lights, body: null, glow: null, n: 0, cap: 170, y: (S.kindY || 0) + (S.raised?.[name] || 0) };
      for (const L of k.lights) L.col = new THREE.Color(L.c);
      if (b.body) { k.body = addObj(new THREE.InstancedMesh(G(b.body, wo), matBody, k.cap)); k.body.frustumCulled = false; k.body.count = 0; }
      if (b.glow) { k.glow = addObj(new THREE.InstancedMesh(G(b.glow, wo), matGlow, k.cap)); k.glow.frustumCulled = false; k.glow.count = 0; }
      return k;
    });
    const kindIndex = Object.fromEntries(kindNames.map((n, i) => [n, i]));

    // obstacle and set-piece models
    const pools = {};
    const names = modelNames(setting);
    for (const n of [...names]) if (hasModel(`${n}Nose`)) names.push(`${n}Nose`);
    names.forEach((name, i) => {
      const b = buildObstacle(name, 300 + i);
      for (const L of b.lights) L.col = new THREE.Color(L.c);
      const big = name === 'stairs' || name.endsWith('Nose') || LONG[name] || name.endsWith('Span') || name === 'shutter' || name === 'boomGate' || name === 'roofGap' || name === 'lorry';
      const cap = name === 'puddle' ? 30 : big ? 8 : 26;
      const p = { name, cap, n: 0, items: new Array(cap).fill(null), lights: b.lights, body: null, glow: null, long: LONG[name] || 0, zc: dimOf(name)[2] || 0 };
      if (b.body) { p.body = addObj(new THREE.InstancedMesh(G(b.body, wo), matBody, cap)); p.body.frustumCulled = false; p.body.count = 0; }
      if (b.glow) { p.glow = addObj(new THREE.InstancedMesh(G(b.glow, wo), matGlow, cap)); p.glow.frustumCulled = false; p.glow.count = 0; }
      pools[name] = p;
    });

    W = { S, setting, wo, objs, road, sides, edges, backdrop, backdropMat, kinds, kindIndex, pools, poolList: Object.values(pools), pointC,
      streakK: 0.42 * (S.wet || 1), chunks: Array.from({ length: NCH }, () => ({ ci: -1, n: 0, rec: new Float32Array(MAXREC * 5) })), firstChunk: 0 };
    resetChunks(0);
  }

  function unload() {
    if (!W) return;
    if (run) for (const o of run.objs) onDrop(o);
    for (const o of W.objs) { scene.remove(o); if (o.isInstancedMesh) o.dispose(); }
    for (const g of W.wo.geo) g.dispose();
    for (const m of W.wo.mat) m.dispose();
    for (const t of W.wo.tex) t.dispose();
    W = null;
  }

  // ---- scenery chunks
  function layoutChunk(ch, ci) {
    ch.ci = ci; ch.n = 0;
    const r = mulberry32(hashStr(`${W.setting}|${seed}|${ci}`));
    W.S.layout(ci, ci * CH, r, (name, x, dist, side, flags = 0) => {
      if (ch.n >= MAXREC || W.kindIndex[name] === undefined) return;
      const o = ch.n++ * 5;
      ch.rec[o] = W.kindIndex[name]; ch.rec[o + 1] = x; ch.rec[o + 2] = dist; ch.rec[o + 3] = side; ch.rec[o + 4] = flags;
    });
  }
  function rebuildScenery() {
    const { kinds, chunks } = W;
    for (const k of kinds) k.n = 0;
    halos.count = pools.count = streaks.count = shafts.count = 0;
    lampN = 0;
    for (const ch of chunks) {
      for (let i = 0; i < ch.n; i++) {
        const o = i * 5;
        const k = kinds[ch.rec[o]];
        if (!k || k.n >= k.cap) continue;
        const x = ch.rec[o + 1], d = ch.rec[o + 2], side = ch.rec[o + 3], flags = ch.rec[o + 4];
        const flip = side > 0;
        _m.compose(_p.set(x, k.y, -d), flip ? QPI : Q0, _s.set(1, 1, 1));
        if (k.body) k.body.setMatrixAt(k.n, _m);
        if (k.glow) k.glow.setMatrixAt(k.n, _m);
        k.n++;
        for (const L of k.lights) {
          const wx = x + (flip ? -L.x : L.x), wz = -d + (flip ? -L.z : L.z), wy = L.y + k.y;
          if (L.halo) putDecal(halos, wx, wy, wz, L.halo, 1, L.col, haloK * L.i);
          if (L.pool) putDecal(pools, wx, Math.max(0.03, k.y + 0.03), wz, L.pool * 2, L.pool * 2, L.col, poolK * L.i);
          if (L.streak) putDecal(streaks, clamp(wx * 0.82, -3.7, 3.7), 0.035, wz + L.streak * 0.45, 0.35 + L.halo * 0.18, L.streak, L.col, W.streakK * L.i);
          // a cone of light through the rain under every real lamp
          if (L.pool >= 2.5 && wy > 1.8 && !reduced) putDecal(shafts, wx, wy, wz, L.pool * 0.5, L.pool * 0.5, L.col, 0.16 * L.i, wy - Math.max(0, k.y));
          if (L.point && (flags & 1) && lampN < MAXL) {
            lampD[lampN] = -wz; lampX[lampN] = wx; lampY[lampN] = wy - 0.3; lampZ[lampN] = wz; lampI[lampN] = L.point;
            lampOrder[lampN] = lampN; lampN++;
          }
        }
      }
    }
    for (const k of kinds) {
      if (k.body) { k.body.count = k.n; k.body.instanceMatrix.needsUpdate = true; k.body.visible = k.n > 0; }
      if (k.glow) { k.glow.count = k.n; k.glow.instanceMatrix.needsUpdate = true; k.glow.visible = k.n > 0; }
    }
    for (const m of [halos, pools, streaks, shafts]) { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
    for (let i = 1; i < lampN; i++) {
      const v = lampOrder[i];
      let j = i - 1;
      while (j >= 0 && lampD[lampOrder[j]] > lampD[v]) { lampOrder[j + 1] = lampOrder[j]; j--; }
      lampOrder[j + 1] = v;
    }
  }
  function resetChunks(dist) {
    W.firstChunk = Math.max(0, Math.floor(dist / CH) - 1);
    W.chunks.forEach((ch, i) => layoutChunk(ch, W.firstChunk + i));
    rebuildScenery();
  }
  function advanceChunks(dist) {
    let changed = false;
    while (dist - CH * (W.firstChunk + 1) > 14) {
      const ch = W.chunks.shift();
      layoutChunk(ch, W.firstChunk + NCH);
      W.chunks.push(ch);
      W.firstChunk++;
      changed = true;
    }
    if (changed) rebuildScenery();
  }

  // ---- objects -> pooled instances
  function poolAdd(name, ent) {
    const p = W.pools[name];
    if (!p || p.n >= p.cap) return false;
    ent.pool = p; ent.slot = p.n; p.items[p.n++] = ent;
    return true;
  }
  function poolRemove(ent) {
    const p = ent.pool;
    if (!p) return;
    const last = p.items[--p.n];
    p.items[ent.slot] = last; last.slot = ent.slot; p.items[p.n] = null;
    ent.pool = null;
  }
  function onAdd(o) {
    if (!W || o.inView) return;
    o.inView = true;
    if (o.type === 'cup') { if (cupN < CUPS) { o.cupSlot = cupN; cups[cupN++] = o; } else o.cupSlot = -1; return; }
    o.ents = [];
    const ent = { o, nose: false, knockT: -1, throwT: o.anim?.type === 'throw' ? -2 : -1, side: o.x < 0 ? -1 : 1, fx: 0, fy: 0, fz: 0 };
    if (poolAdd(o.model, ent)) o.ents.push(ent);
    if (o.wall && W.pools[`${o.model}Nose`]) { const n = { ...ent, nose: true }; if (poolAdd(`${o.model}Nose`, n)) o.ents.push(n); }
    o.ent = ent;
  }
  function onDrop(o) {
    if (!o.inView) return;
    o.inView = false;
    if (o.type === 'cup') {
      if (o.cupSlot >= 0) { const last = cups[--cupN]; cups[o.cupSlot] = last; last.cupSlot = o.cupSlot; cups[cupN] = null; o.cupSlot = -1; }
      return;
    }
    if (o.ents) for (const e of o.ents) poolRemove(e);
    o.ents = null; o.ent = null;
  }

  function placeObstacles(dt) {
    dynHalos.count = 0;
    const pl = W.poolList;
    for (let pi = 0; pi < pl.length; pi++) {
      const p = pl[pi];
      for (let i = 0; i < p.n; i++) {
        const ent = p.items[i], o = ent.o, a = o.anim;
        let x = o.x, y = 0, z = -o.d - p.zc, rx = 0, ry = 0, rz = 0, sc = 1, sx = 1, sz = 1;
        if (o.wall) {
          z = -(o.d - o.len / 2);
          sx = o.w / (ent.nose ? 2.0 : p.long || 2.0);
          if (!ent.nose) sz = o.len;
          if (o.feature?.type === 'fork') { /* the divider: a little taller */ }
        } else if (o.type === 'stairs') {
          z = -(o.d - o.len / 2);
        }
        if (o.hidden) sc = 0;
        if (a && run) {
          const ahead = o.d - run.dist, R = o.reveal;
          if (a.type === 'mover') {
            const u = smooth(clamp((R + 18 - ahead) / 18, 0, 1));
            if (o.model === 'door') {
              const left = o.x < 0;
              x = o.x + (left ? -1.0 : 1.0);
              ry = (left ? 0 : PI) + (left ? 1 : -1) * (PI / 2) * (1 - u);
            } else {
              x = a.from + (o.x - a.from) * u;
              if (o.model === 'motorbike' || o.model === 'forklift') ry = Math.sign(o.x - a.from) * (PI / 2) * (1 - u * 0.65);
            }
          } else if (a.type === 'fall') {
            const sh = clamp((R + 42 - ahead) / 42, 0, 1);
            if (sh > 0) putBlob(o.x, 0, -o.d, 0.6 + sh * 1.2, 0.6 + sh * 1.2);
            const u = clamp((R + 12 - ahead) / 12, 0, 1);
            if (u <= 0) sc = 0;
            else { y = 7 * (1 - u) * (1 - u); rx = (1 - u) * 4; }
          } else if (a.type === 'shutter') {
            y = 1.6 * (1 - smooth(clamp((R + 30 - ahead) / 30, 0, 1)));
          }
        }
        if (ent.throwT >= 0 && ent.throwT < 1) {
          ent.throwT = Math.min(1, ent.throwT + dt / 0.55);
          const u = ent.throwT, e = 1 - (1 - u) * (1 - u);
          x = ent.fx + (x - ent.fx) * e; z = ent.fz + (z - ent.fz) * e; y = ent.fy * (1 - u) + Math.sin(u * PI) * 1.6;
          rx = (1 - u) * 5; rz = (1 - u) * 2 * ent.side;
        }
        if (ent.knockT >= 0 && !o.wall) {
          ent.knockT += dt;
          const t = ent.knockT;
          if (o.type === 'block') rz = Math.sin(t * 34) * 0.07 * Math.exp(-t * 4);
          else if (o.type === 'low') { const u = Math.min(1, t * 2.2); z -= u * 2.2; x += ent.side * u * 0.9; rx = -u * 1.4; rz = ent.side * u * 0.5; }
          else if (o.type === 'high' && !a) rx = -0.7 * Math.exp(-t * 2.5) * Math.cos(t * 10);
        }
        _e.set(rx, ry, rz); _q.setFromEuler(_e);
        _m.compose(_p.set(x, y, z), _q, _s.set(sc * sx, sc, sc * sz));
        if (p.body) p.body.setMatrixAt(i, _m);
        if (p.glow) p.glow.setMatrixAt(i, _m);
        if (sc > 0) for (let li = 0; li < p.lights.length; li++) { const L = p.lights[li]; putDecal(dynHalos, x + L.x * sx, y + L.y, z + L.z, L.halo, 1, L.col, haloK * L.i); }
      }
      if (p.body) { p.body.count = p.n; p.body.visible = p.n > 0; p.body.instanceMatrix.needsUpdate = true; }
      if (p.glow) { p.glow.count = p.n; p.glow.visible = p.n > 0; p.glow.instanceMatrix.needsUpdate = true; }
    }
    for (let i = 0; i < cupN; i++) {
      const o = cups[i];
      const sc = o.taken ? 0 : 1.1;
      _e.set(0.15, time * 2.4 + i, 0); _q.setFromEuler(_e);
      _m.compose(_p.set(o.x, 0.85 + Math.sin(time * 3 + i) * 0.08, -o.d), _q, _s.set(sc, sc, sc));
      cupBody.setMatrixAt(i, _m); cupGlow.setMatrixAt(i, _m);
      if (!o.taken) putDecal(dynHalos, o.x, 1.1, -o.d, 1.5 + Math.sin(time * 5) * 0.2, 1, CUP_C, 0.75);
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
      l.intensity = W.S.point.i * lampI[i] * fade;
    }
    for (; k < NPL; k++) points[k].intensity = 0;
  }

  // ---- poses
  function pose(r, mode, dt, speed, y, slide, extra = 0) {
    r.phase += dt * speed * 1.5;
    const ph = r.phase, sn = Math.sin(ph), cs = Math.cos(ph);
    const { L, R, hips, torso } = r;
    hips.rotation.set(0, 0, 0); torso.rotation.set(0, 0, 0); r.root.rotation.set(0, 0, 0);
    hips.position.y = 0.98;
    L.sh.rotation.set(0, 0, 0); R.sh.rotation.set(0, 0, 0);
    if (mode === 'idle') {
      L.hp.rotation.x = 0.05; R.hp.rotation.x = -0.05; L.kn.rotation.x = -0.08; R.kn.rotation.x = -0.05;
      L.sh.rotation.x = 0.1; R.sh.rotation.x = -0.05; L.el.rotation.x = 0.3; R.el.rotation.x = 0.25;
      L.sh.rotation.z = -0.08; R.sh.rotation.z = 0.08; torso.rotation.x = -0.05;
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
      r.root.rotation.x = -1.2 * extra; hips.position.y = 0.98 - 0.5 * extra;
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
    if (mode === 'throw') { torso.rotation.y = 2.2 * extra; R.sh.rotation.x = 2.6 * extra; R.el.rotation.x = 0.4; }
    if (slide > 0) {
      hips.position.y = 0.36; hips.rotation.x = 1.15; torso.rotation.x = -0.25;
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
    if (mode !== 'throw') { L.sh.rotation.x = -0.8 * sn; R.sh.rotation.x = 0.8 * sn; L.el.rotation.x = R.el.rotation.x = 1.35; }
    hips.position.y = 0.98 + 0.06 * Math.abs(cs);
    torso.rotation.x = mode === 'stumble' ? -0.6 + Math.sin(ph * 2) * 0.15 : -0.22;
    if (mode === 'stumble') { L.sh.rotation.z = -0.9; R.sh.rotation.z = 0.9; }
    if (mode !== 'throw') torso.rotation.y = 0.12 * sn;
  }
  function poseArms(mode, ph, slide, air, u = 0) {
    const sn = Math.sin(ph), cs = Math.cos(ph);
    const bob = reduced ? 0.4 : 1;
    for (const [g, s] of [[armL, -1], [armR, 1]]) {
      const k = s < 0 ? sn : -sn, kc = s < 0 ? cs : -cs;
      // low in the frame: a fist shows at the top of each pump, like when you really run
      let x = s * 0.3, y = -0.52, z = -0.42, rx = 0.25, ry = -s * 0.22, rz = 0;
      if (mode === 'tackle') { x = s * (0.24 - 0.08 * u); y = -0.36 + 0.16 * u; z = -0.45 - 0.4 * u; rx = 0.1; ry = -s * 0.1; }
      else if (mode === 'idle') { y = -0.7; z = -0.38; rx = 0.6; }
      else if (slide) { x = s * 0.48; y = -0.4; z = -0.36; rz = s * 0.55; rx = -0.1; }
      else if (air) { y = -0.36; z = -0.48; rx = -0.15; x = s * 0.32; }
      else if (mode === 'stumble') { x = s * (0.44 + 0.06 * k); y = -0.34 + 0.08 * kc; rz = s * 0.7; }
      else { y += 0.11 * Math.max(0, k) * bob; z += 0.06 * kc * bob; rx += 0.38 * k * bob; }
      g.position.set(x, y, z); g.rotation.set(rx, ry, rz);
    }
  }

  // ---- state
  let run = null;
  let width = 1, height = 1;
  let shake = 0, flash = 0, nextFlash = 8 + Math.random() * 10, time = 0;
  const camPos = new THREE.Vector3(0, 3, 6);
  let lastCalls = 0, lastTris = 0;
  let onThunder = null;
  let usePov = !!pov;
  let roll = 0, eyeY = 1.55, sprintA = 0, throwPose = 0;

  function attach(r) {
    if (run && W) for (const o of run.objs) onDrop(o);
    run = r;
    if (!run || !W) return;
    for (const o of run.objs) onAdd(o);
    resetChunks(run.dist);
    hero.phase = 0; thief.phase = 1.7;
  }

  function event(e) {
    if (!run) return;
    const ent = e.o?.ent;
    if (e.type === 'hit') { shake = reduced ? 0 : 0.6; if (ent) ent.knockT = 0; }
    else if (e.type === 'brush') { if (ent) ent.knockT = 0; }
    else if (e.type === 'tell') throwPose = 0.8;
    else if (e.type === 'throw' && ent) {
      ent.throwT = 0;
      const ahead = run.suspect.ahead, rel = e.o.d - run.dist;
      if (ahead > rel + 2) { ent.fx = run.suspect.x; ent.fy = 1.3; ent.fz = -(run.dist + ahead); } else { ent.fx = (e.o.x < 0 ? -1 : 1) * 4.6; ent.fy = 1.0; ent.fz = -e.o.d + 0.8; }
    }
  }

  function frame(dt, view) {
    time += dt;
    if (!run || !W) return;
    const s = run.suspect;
    const mode = view.mode;
    let pd = run.dist;
    const ct = view.catchT, et = view.escT || 0;
    if (mode === 'catch') pd += Math.min(1, ct / 0.9) * 0.9;
    const escV = Math.max(8, run.speed);
    const stopAt = escV * 0.55;
    if (mode === 'escape') pd += et < 1.1 ? escV * (et - (et * et) / 2.2) : stopAt;
    advanceChunks(pd);
    placeObstacles(mode === 'catch' ? dt * 0.3 : dt);
    placeLights(pd);
    const g0 = run.ground;

    const moving = mode === 'run' || mode === 'catch' || (mode === 'escape' && et < 1.1);
    const animDt = mode === 'catch' ? dt * 0.3 : moving ? dt : dt * 0.3;
    hero.root.visible = !usePov;
    hero.root.position.set(run.x, run.y + g0, -pd);
    hero.root.rotation.z = 0;
    if (mode === 'catch') {
      const u = clamp((ct - 0.15) / 0.6, 0, 1);
      hero.root.position.y = g0 + 0.25 * Math.sin(u * PI);
      pose(hero, 'tackle', animDt, run.speed, 0, 0, u);
    } else pose(hero, !moving ? 'idle' : run.stumbleT > 0 ? 'stumble' : 'run', animDt, run.speed, run.y, run.slideT);
    if (!usePov && moving) hero.root.rotation.z = clamp(-run.vx * 0.04, -0.2, 0.2);

    // the suspect
    let sAhead = s.ahead, sx = s.x, sy = s.y + s.ground, sVis = true;
    if (mode === 'catch') sAhead = 1.6 + Math.min(1, ct / 0.9) * 0.2;
    if (mode === 'lost') sAhead = s.ahead + view.lostT * 18;
    const wallAt = run.dist + 1.6 + stopAt + 2.2;
    if (mode === 'escape') {
      const kind = view.escKind;
      const runTo = (wallAt - run.dist) - 0.6;
      sAhead = 1.6 + (runTo - 1.6) * clamp(et / 0.8, 0, 1) + Math.max(0, et - 0.8) * 5;
      if (kind === 'vault') { vaultWall.visible = true; vaultWall.position.set(0, g0, -wallAt); if (et > 0.7) { const u = clamp((et - 0.7) / 0.7, 0, 1); sy = Math.sin(u * PI * 0.85) * 1.6 - (u > 0.8 ? (u - 0.8) * 9 : 0); } if (et > 1.6) sVis = false; }
      else if (kind === 'ledge') { ledge.visible = true; ledge.position.set(0, g0, -(wallAt + 3.5)); if (et > 0.85) sy = -Math.pow(et - 0.85, 2) * 14 + (et < 1.0 ? (et - 0.85) * 4 : 0); if (et > 1.7) sVis = false; }
      else { const side = s.x < 0 ? -1 : 1; sx = s.x + (side * 5.6 - s.x) * smooth(clamp((et - 0.3) / 0.9, 0, 1)); if (et > 1.35) sVis = false; }
    } else { vaultWall.visible = false; ledge.visible = false; }
    const sz = -(pd + sAhead);
    thief.root.visible = sVis;
    thief.root.position.set(sx, sy, sz);
    if (throwPose > 0) throwPose = Math.max(0, throwPose - dt);
    if (scooter) {
      scooter.visible = sVis;
      scooter.position.set(sx, sy, sz);
      scooter.rotation.set(0, 0, 0);
      thief.root.rotation.z = 0;
      if (mode === 'catch') { const u = clamp((ct - 0.4) / 0.8, 0, 1); scooter.rotation.z = u * 1.4; scooter.position.x += u * 1.5; }
      pose(thief, mode === 'catch' && ct > 0.45 ? 'fall' : 'ride', animDt, run.speed, 0, 0, clamp((ct - 0.45) / 0.5, 0, 1));
      tail.visible = sVis;
      tail.position.set(sx, 0.04 + s.ground, sz + 2.2);
      tail.scale.set(0.5, 1, 4.5);
    } else {
      const tm = mode === 'catch' && ct > 0.45 ? 'fall' : throwPose > 0 && moving ? 'throw' : moving || mode === 'escape' ? 'run' : 'idle';
      pose(thief, tm, animDt, run.speed * 0.98, s.y, s.slideT, tm === 'throw' ? Math.sin(clamp(throwPose / 0.8, 0, 1) * PI) : clamp((ct - 0.45) / 0.5, 0, 1));
    }
    thief.head.rotation.y = !scooter && moving && throwPose <= 0 && Math.sin(time * 0.7) > 0.86 ? 2.4 : 0;
    if (!usePov) putBlob(run.x, g0, -pd, 0.9 + run.y * 0.2, 0.9);
    if (sVis) putBlob(sx, s.ground, sz, scooter ? 1.0 : 0.85, scooter ? 1.8 : 0.85);
    blobs.instanceMatrix.needsUpdate = true;
    if (scooter && sVis) putDecal(dynHalos, sx, sy + 0.7, sz + 0.62, 1.1, 1, TAIL_C, 0.9);
    dynHalos.instanceMatrix.needsUpdate = true; dynHalos.instanceColor.needsUpdate = true;

    const snap = Math.floor(pd / TILE) * TILE;
    W.road.position.z = -snap - ROAD_LEN / 2 + 30;
    for (const m of W.sides) m.position.z = W.road.position.z;
    if (W.edges) W.edges.position.z = W.road.position.z;

    // camera
    const portrait = width / height < 0.9;
    let fov;
    if (usePov) {
      arms.visible = mode === 'catch'; // a clean view while running; the hands reach out for the tackle
      const slideK = run.slideT > 0 ? 1 : 0;
      eyeY += (1.55 - slideK * 0.8 - eyeY) * Math.min(1, dt * 14);
      const bobOn = moving && !run.air && !slideK && !reduced;
      const bob = bobOn ? 0.045 * Math.abs(Math.sin(hero.phase)) : 0;
      const sway = bobOn ? 0.025 * Math.sin(hero.phase) : 0;
      const lean = reduced ? 0 : clamp(-run.vx * 0.022, -0.12, 0.12);
      roll += (lean - roll) * Math.min(1, dt * 8);
      let ex = run.x + sway, ey = g0 + eyeY + run.y * 0.8 + bob, ez = -pd + 0.05;
      let lx = run.x + run.vx * 0.12 + sway * 0.5, ly = ey - 0.36, lz = -pd - 12;
      if (mode === 'catch') {
        const u = reduced ? Math.min(1, ct) : smooth(clamp(ct / 0.9, 0, 1));
        ey -= u * 0.95; ez -= u * 0.9; ly = ey - 0.9 * u - 0.3; lz = -pd - 4;
      } else if (mode === 'idle' || mode === 'count') ly = ey - 0.25;
      if (shake > 0 && !reduced) { shake = Math.max(0, shake - dt * 1.6); ex += (Math.random() - 0.5) * shake * 0.18; ey += (Math.random() - 0.5) * shake * 0.14; } else shake = 0;
      camera.position.set(ex, ey, ez);
      camPos.copy(camera.position);
      _look.set(lx, ly, lz);
      camera.lookAt(_look);
      if (!reduced) camera.rotateZ(roll + (mode === 'catch' ? -0.12 * Math.min(1, ct) : 0));
      poseArms(mode === 'catch' ? 'tackle' : !moving ? 'idle' : run.stumbleT > 0 ? 'stumble' : 'run', hero.phase, slideK, run.air, clamp(ct / 0.5, 0, 1));
      fov = portrait ? 74 : 66;
    } else {
      arms.visible = false;
      const back = portrait ? 6.4 : 5.6, up = portrait ? 3.7 : 3.05;
      let tx = run.x * 0.6, ty = up + run.y * 0.35 + g0, tz = -pd + back;
      let lx = run.x * 0.75, ly = (portrait ? 0.9 : 1.25) + g0, lz = -pd - 11;
      if (mode === 'catch') {
        const u = reduced ? 0 : clamp(ct / 1.1, 0, 1), e = smooth(u);
        tx = run.x + 4.2 * e + (1 - e) * tx; ty += (1.7 + g0 - ty) * e; tz += (-pd - 1.5 - tz) * e;
        lx = run.x + (lx - run.x) * (1 - e); ly += (0.7 + g0 - ly) * e; lz += (-pd - 1.2 - lz) * e;
      }
      if (mode === 'idle' || mode === 'count') { tz += 0.6; ty += 0.2; }
      const k = Math.min(1, dt * 9);
      camPos.x += (tx - camPos.x) * k; camPos.y += (ty - camPos.y) * k; camPos.z = tz;
      if (mode === 'catch') { camPos.x = tx; camPos.y = ty; }
      camera.position.copy(camPos);
      if (shake > 0 && !reduced) { shake = Math.max(0, shake - dt * 1.6); camera.position.x += (Math.random() - 0.5) * shake * 0.5; camera.position.y += (Math.random() - 0.5) * shake * 0.4; } else shake = 0;
      _look.set(lx, ly, lz);
      camera.lookAt(_look);
      fov = portrait ? 66 : 54;
    }
    const sprinting = run.sprintT > 0 && mode === 'run' && !reduced;
    fov += sprinting ? 6 : 0;
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 5); camera.updateProjectionMatrix(); }
    sprintA += ((sprinting ? 0.55 : 0) - sprintA) * Math.min(1, dt * 5);
    speedLines.visible = sprintA > 0.01;
    speedMat.uniforms.uAlpha.value = sprintA;
    speedMat.uniforms.uTime.value = time;

    fill.position.set(camPos.x, camPos.y - 0.5, camPos.z - (usePov ? 0.6 : 2.5));
    W.backdrop.position.set(camPos.x * 0.9, 38, camPos.z - 220);
    rainMat.uniforms.uTime.value = time;
    rainMat.uniforms.uCam.value.copy(camPos);
    rainMat.uniforms.uSpeed.value = moving ? run.speed : 0;

    if (!reduced) {
      nextFlash -= dt;
      if (nextFlash <= 0) { flash = 0.32; nextFlash = 10 + Math.random() * 14; onThunder?.(); }
      if (flash > 0) flash = Math.max(0, flash - dt);
      const f = flash > 0.22 || (flash > 0.06 && flash < 0.12) ? 1 : 0;
      hemi.intensity = W.S.hemi[2] * (1 + f * 2.2);
      W.backdropMat.color.setScalar(1 + f * 0.8);
    }

    renderer.render(scene, camera);
    blobs.count = 0;
    lastCalls = renderer.info.render.calls;
    lastTris = renderer.info.render.triangles;
  }

  function resize(w, h, dpr) {
    width = Math.max(1, w); height = Math.max(1, h);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function destroy() {
    unload();
    run = null;
    scene.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
    for (const g of own.geo) g.dispose();
    for (const m of own.mat) m.dispose();
    for (const t of own.tex) t.dispose();
    scene.clear();
    renderer.renderLists.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return {
    kind: '3d',
    load, attach, onAdd, onDrop, event, frame, resize, destroy,
    set onThunder(f) { onThunder = f; },
    get pov() { return usePov; },
    setPov(on) { usePov = !!on; eyeY = 1.55; },
    info: () => ({ calls: lastCalls, triangles: lastTris, programs: renderer.info.programs?.length || 0, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, setting: W?.setting, pov: usePov, xmax: X_MAX }),
    renderer,
    scene,
  };
}
