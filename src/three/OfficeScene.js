// The detective's office above a Brickfields mamak: rain on the window, the KL skyline, a banker's
// lamp, Daniel's lighter, and the case board where red thread connects the evidence.
// Layout, in metres: the room runs x -3..3, y 0..3, z -4..2. The back wall (z = -4) holds the window
// on the left and the case board on the right; the desk stands in front of the window.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { imgUrl } from '../core/assets.js';
import {
  makeCityTexture, makeCorkTexture, makePlasterTexture, makeFloorTexture, makeWoodTexture, makeRugTexture,
  makeSuspectCardTexture, makeEvidenceCardTexture, makeFolderTexture, makeLicenceTexture, makeClockTexture,
  makeGlowTexture, drawPhoneScreen, loadImage,
} from './textures.js';
import { rainWindowMaterial } from './rainWindow.js';

const WIN = { x: -1.0, y: 1.68, w: 2.2, h: 1.7 };
const BOARD = { x: 1.75, y: 1.74, w: 2.1, h: 1.4 };
const DESK = { x: -0.5, z: -3.15, top: 0.8, w: 2.0, d: 0.95 };
const BACK = -4;

const VIEWS = {
  title: { pos: [WIN.x, 1.6, -1.45], look: [WIN.x, 1.7, BACK] },
  office: { pos: [0.4, 1.72, -0.4], look: [0.3, 1.26, BACK] },
  // tall phone screens: the desk and the window, the board's edge on the right
  officeTall: { pos: [-0.45, 1.76, -0.1], look: [-0.4, 0.95, BACK] },
  board: { pos: [BOARD.x, 1.62, -1.7], look: [BOARD.x, 1.6, BACK] },
  dim: { pos: [0.6, 1.72, 0.2], look: [-0.2, 1.4, BACK] },
};

// Things on the desk and walls you can click, in the order touch labels are placed.
const PICK_ORDER = ['phone', 'board', 'folder', 'lighter', 'cup', 'lamp'];
const PICK_LABELS = { board: 'Case board', phone: 'Phone', lighter: "Daniel's lighter", cup: 'Kopi', folder: 'Case file', lamp: 'Desk lamp' };
const MAX_CARDS = 16;

const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Additive light volume (window shafts, lamp cone). `along` runs 0 at the light to 1 at the far end.
function hazeMaterial(color, intensity, flip = false) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity }, uTime: { value: 0 }, uFlip: { value: flip ? 1 : 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uIntensity; uniform float uTime; uniform float uFlip;
      varying vec2 vUv;
      void main() {
        float along = mix(vUv.y, 1.0 - vUv.y, uFlip);
        float across = vUv.x;
        float a = smoothstep(0.0, 0.2, along) * pow(1.0 - clamp(along, 0.0, 1.0), 1.5);
        a *= smoothstep(0.0, 0.3, across) * smoothstep(1.0, 0.7, across);
        a *= 0.82 + 0.18 * sin(uTime * 0.6 + along * 7.0 + across * 4.0);
        gl_FragColor = vec4(uColor * a * uIntensity, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/** Four open sides joining rectangle `a` (near the light) to rectangle `b`. Corners in order around. */
function frustumGeometry(a, b) {
  const pos = [], uv = [], idx = [];
  for (let s = 0; s < 4; s++) {
    const i0 = s, i1 = (s + 1) % 4;
    const base = pos.length / 3;
    [a[i0], a[i1], b[i1], b[i0]].forEach((p) => pos.push(p.x, p.y, p.z));
    uv.push(0, 0, 1, 0, 1, 1, 0, 1);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export class OfficeScene {
  constructor(canvas) {
    this.canvas = canvas;
    // phones and small touch screens: cap the pixel ratio lower and skip MSAA. The scene sits behind
    // blurred, dimmed screens most of the time, so the extra pixels mostly cost battery and frame rate.
    const small = Math.min(window.screen?.width || innerWidth, window.screen?.height || innerHeight) < 820;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches;
    this.lowPower = !!(small && coarse);
    this.finePointer = !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const rm = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.reducedMotion = !!rm?.matches;
    rm?.addEventListener?.('change', (e) => { this.reducedMotion = e.matches; });

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !this.lowPower, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1.5 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0b1016');
    this.scene.fog = new THREE.Fog('#0b1016', 7, 16);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.05, 50);
    this.camBase = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.parallax = new THREE.Vector2();
    this.timer = new THREE.Timer();
    this.pointer = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.picks = {};
    this.pickHandler = null;
    this.hovered = null;
    this.hoverCard = null;
    this.mode = 'title';
    this.running = true;
    this.phoneRinging = false;
    this.lampOn = true;
    this.player = {};

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.glowTex = makeGlowTexture();

    this.build();
    this.buildTags();
    this.setMode('title', true);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', (e) => {
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      this.pointerOnCanvas = e.target === this.canvas && e.pointerType === 'mouse';
      this.pointerDirty = true;
    });
    document.documentElement.addEventListener('pointerleave', () => { this.pointerOnCanvas = false; this.pointerDirty = true; });
    canvas.addEventListener('click', (e) => this.onClick(e));
    document.addEventListener('visibilitychange', () => { this.running = !document.hidden; });
    this.scheduleLightning();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  /* ------------------------------------------------------------------ */
  /* Building the room                                                    */
  /* ------------------------------------------------------------------ */

  build() {
    this.buildRoom();
    this.buildWindow();
    this.buildDesk();
    this.buildProps();
    this.buildBoard();
    this.buildLights();
    this.buildAtmosphere();
  }

  std(params) {
    return new THREE.MeshStandardMaterial(params);
  }

  metal(color, roughness = 0.3, metalness = 0.85) {
    return this.std({ color, roughness, metalness, envMap: this.envMap, envMapIntensity: 0.3 });
  }

  add(mesh, { cast = false, receive = false } = {}) {
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    this.scene.add(mesh);
    return mesh;
  }

  box(w, h, d, mat, x, y, z, opts) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    return opts === false ? m : this.add(m, opts || { cast: true, receive: true });
  }

  buildRoom() {
    const plaster = makePlasterTexture();
    this.wallMat = this.std({ map: plaster, color: '#d9e2dc', roughness: 0.95 });
    const panelMat = this.std({ color: '#2a1b12', roughness: 0.7, map: makeWoodTexture(41, [70, 44, 28]) });
    const floorMat = this.std({ map: makeFloorTexture(), roughness: 0.55, metalness: 0.05 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -1;
    this.add(floor, { receive: true });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), this.std({ color: '#3a3f3e', roughness: 1 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3, -1);
    this.add(ceiling);

    // back wall, cut around the window
    const wb = WIN.y - WIN.h / 2, wt = WIN.y + WIN.h / 2, wl = WIN.x - WIN.w / 2, wr = WIN.x + WIN.w / 2;
    const panel = (w, h, x, y) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), this.wallMat);
      m.position.set(x, y, BACK);
      this.add(m, { cast: true, receive: true });
    };
    panel(6, wb, 0, wb / 2);
    panel(6, 3 - wt, 0, (3 + wt) / 2);
    panel(wl + 3, WIN.h, (-3 + wl) / 2, WIN.y);
    panel(3 - wr, WIN.h, (3 + wr) / 2, WIN.y);
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), this.wallMat);
      wall.rotation.y = -side * Math.PI / 2;
      wall.position.set(side * 3, 1.5, -1);
      this.add(wall, { receive: true });
    }

    // wainscot and chair rail
    const rail = this.std({ color: '#3b281b', roughness: 0.55 });
    this.box(6, 0.74, 0.02, panelMat, 0, 0.37, BACK + 0.01, { receive: true });
    this.box(6, 0.045, 0.04, rail, 0, 0.76, BACK + 0.02, { receive: true });
    for (const side of [-1, 1]) {
      this.box(0.02, 0.74, 6, panelMat, side * 2.99, 0.37, -1, { receive: true });
      this.box(0.04, 0.045, 6, rail, side * 2.98, 0.76, -1, { receive: true });
    }
    this.box(6, 0.1, 0.02, rail, 0, 0.05, BACK + 0.025, { receive: true });

    const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.0), this.std({ map: makeRugTexture(), roughness: 1 }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(DESK.x + 0.2, 0.004, -2.35);
    this.add(rug, { receive: true });
  }

  buildWindow() {
    this.cityTex = makeCityTexture(this.lowPower ? 0.67 : 1);
    this.windowMat = rainWindowMaterial(this.cityTex);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w, WIN.h), this.windowMat);
    glass.position.set(WIN.x, WIN.y, BACK - 0.01);
    this.scene.add(glass);
    const frameMat = this.std({ color: '#1c2326', roughness: 0.55, metalness: 0.3 });
    const bar = (w, h, x, y, d = 0.06) => this.box(w, h, d, frameMat, x, y, BACK + 0.03, { cast: true, receive: true });
    const wl = WIN.x - WIN.w / 2, wr = WIN.x + WIN.w / 2, wb = WIN.y - WIN.h / 2, wt = WIN.y + WIN.h / 2;
    bar(WIN.w + 0.14, 0.08, WIN.x, wt);
    bar(WIN.w + 0.14, 0.08, WIN.x, wb);
    bar(0.08, WIN.h, wl, WIN.y);
    bar(0.08, WIN.h, wr, WIN.y);
    bar(0.045, WIN.h, WIN.x - WIN.w / 6, WIN.y, 0.05);
    bar(0.045, WIN.h, WIN.x + WIN.w / 6, WIN.y, 0.05);
    bar(WIN.w, 0.04, WIN.x, wb + WIN.h * 0.72, 0.05);
    // sill
    this.box(WIN.w + 0.3, 0.035, 0.2, this.std({ color: '#d8d2c2', roughness: 0.7, map: makePlasterTexture() }), WIN.x, wb - 0.02, BACK + 0.09);
  }

  buildDesk() {
    const { x, z, top, w, d } = DESK;
    const woodMap = makeWoodTexture(5, [96, 58, 32]);
    const wood = this.std({ map: woodMap, roughness: 0.42, metalness: 0.02 });
    const woodDark = this.std({ map: woodMap, color: '#9a8a7a', roughness: 0.6 });
    const brass = this.metal('#c9a35a', 0.3, 0.9);
    this.box(w, 0.05, d, wood, x, top - 0.025, z);
    const leather = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.36, d - 0.3), this.std({ color: '#1a3326', roughness: 0.8 }));
    leather.rotation.x = -Math.PI / 2;
    leather.position.set(x, top + 0.001, z + 0.02);
    this.add(leather, { receive: true });
    // pedestals with drawers facing the room
    for (const side of [-1, 1]) {
      const px = x + side * (w / 2 - 0.26);
      this.box(0.48, top - 0.05, d - 0.06, woodDark, px, (top - 0.05) / 2, z);
      for (let i = 0; i < 3; i++) {
        const dy = 0.13 + i * 0.22;
        this.box(0.42, 0.19, 0.015, wood, px, dy, z + d / 2 - 0.02, { receive: true });
        this.box(0.1, 0.012, 0.02, brass, px, dy + 0.03, z + d / 2 - 0.005, { cast: false, receive: false });
      }
    }
    this.box(w - 1.0, 0.5, 0.02, woodDark, x, top - 0.3, z - d / 2 + 0.05);

    this.buildLamp();
    this.buildFolder();
    this.buildLighter();
    this.buildCup();
    this.buildPhone();

    // notepad and pen, a stack of old files
    const pad = this.box(0.15, 0.01, 0.21, this.std({ color: '#efe4bf', roughness: 0.9 }), x + 0.12, top + 0.005, z - 0.2);
    pad.rotation.y = 0.35;
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.14, 8), this.metal('#1b1b1f', 0.35, 0.6));
    pen.rotation.set(Math.PI / 2, 0, 0.9);
    pen.position.set(x + 0.2, top + 0.016, z - 0.18);
    this.add(pen, { cast: true });
    const fileMat = this.std({ color: '#cdb27a', roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const f = this.box(0.36, 0.022, 0.27, fileMat, x + 0.7 + (hash(i) - 0.5) * 0.03, top + 0.012 + i * 0.024, z - 0.3);
      f.rotation.y = (hash(i + 4) - 0.5) * 0.2;
    }
  }

  /** Register something clickable. `mats` glow on hover; the label floats at `anchor`. */
  addPick(id, root, anchor, mats, glow = 0.28) {
    root.traverse((o) => { o.userData.pickId = id; });
    this.picks[id] = { id, root, anchor, mats, glow };
  }

  buildLamp() {
    const { x, z, top } = DESK;
    const lamp = new THREE.Group();
    lamp.position.set(x - 0.72, top, z - 0.12);
    lamp.rotation.y = 0.25;
    const brass = this.metal('#c49a4e', 0.28, 0.9);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.025, 28), brass);
    base.position.y = 0.0125;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.3, 12), brass);
    stem.position.y = 0.16;
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.06), brass);
    yoke.position.set(0, 0.31, 0.03);
    this.shadeMat = this.std({ color: '#1f7048', emissive: '#2c8a57', emissiveIntensity: 0.55, roughness: 0.22, metalness: 0.1, side: THREE.DoubleSide, envMap: this.envMap, envMapIntensity: 0.6 });
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.4, 28, 1, true, 0, Math.PI), this.shadeMat);
    shade.rotation.z = Math.PI / 2;
    shade.position.set(0, 0.33, 0.06);
    const capGeo = new THREE.CircleGeometry(0.075, 20, 0, Math.PI);
    for (const s of [-1, 1]) {
      const cap = new THREE.Mesh(capGeo, brass);
      cap.rotation.set(0, s * Math.PI / 2, Math.PI / 2);
      cap.position.set(s * 0.2, 0.33, 0.06);
      lamp.add(cap);
    }
    this.bulbMat = new THREE.MeshBasicMaterial({ color: '#fff0d0' });
    const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.26, 10), this.bulbMat);
    bulb.rotation.z = Math.PI / 2;
    bulb.position.set(0, 0.315, 0.06);
    lamp.add(base, stem, yoke, shade, bulb);
    lamp.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    bulb.castShadow = false;
    shade.castShadow = false;
    this.scene.add(lamp);
    this.lampGroup = lamp;
    lamp.updateMatrixWorld(true);
    this.lampBulbPos = bulb.getWorldPosition(new THREE.Vector3());

    this.lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: '#ffc27a', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.lampGlow.scale.set(0.55, 0.3, 1);
    this.lampGlow.position.copy(this.lampBulbPos).add(new THREE.Vector3(0, -0.04, 0.02));
    this.scene.add(this.lampGlow);

    // the cone of warm haze under the shade
    this.lampCone = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.42, 0.33, 24, 1, true), hazeMaterial('#ffb867', 0.22, true));
    this.lampCone.position.copy(this.lampBulbPos).add(new THREE.Vector3(0.05, -0.17, 0.1));
    this.scene.add(this.lampCone);
    this.addPick('lamp', lamp, this.lampBulbPos.clone().add(new THREE.Vector3(0, 0.1, 0)), [brass, this.shadeMat]);
  }

  buildFolder() {
    const { x, z, top } = DESK;
    const g = new THREE.Group();
    g.position.set(x - 0.1, top, z + 0.12);
    g.rotation.y = 0.12;
    const backMat = this.std({ color: '#c3a66c', roughness: 0.9 });
    const pagesMat = this.std({ color: '#f1ead6', roughness: 0.95 });
    this.folderTex = makeFolderTexture('CASE 1', '');
    this.folderMat = this.std({ map: this.folderTex, roughness: 0.85 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.004, 0.33), backMat);
    back.position.y = 0.002;
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.012, 0.31), pagesMat);
    pages.position.set(0.012, 0.01, -0.006);
    pages.rotation.y = -0.04;
    const cover = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.33), this.folderMat);
    cover.rotation.x = -Math.PI / 2;
    cover.position.y = 0.0175;
    // the paper clip and a photo corner sticking out
    const photo = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.002, 0.09), this.std({ color: '#2b3a44', roughness: 0.4 }));
    photo.position.set(0.2, 0.014, -0.11);
    photo.rotation.y = -0.3;
    g.add(back, pages, photo, cover);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.scene.add(g);
    this.addPick('folder', g, new THREE.Vector3(x - 0.1, top + 0.06, z + 0.12), [this.folderMat, backMat]);
  }

  buildLighter() {
    const { x, z, top } = DESK;
    const g = new THREE.Group();
    g.position.set(x - 0.42, top, z + 0.33);
    g.rotation.y = 0.55;
    const chrome = this.metal('#d3d8de', 0.2, 1);
    chrome.envMapIntensity = 0.9;
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.062, 0.02), chrome);
    body.position.y = 0.031;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.024, 0.02), chrome);
    lid.position.y = 0.075;
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.0525, 0.002, 0.0205), this.std({ color: '#30353a' }));
    seam.position.y = 0.063;
    g.add(body, lid, seam);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.scene.add(g);
    this.lighter = g;
    this.addPick('lighter', g, new THREE.Vector3(x - 0.42, top + 0.11, z + 0.33), [chrome]);
  }

  buildCup() {
    const { x, z, top } = DESK;
    const g = new THREE.Group();
    g.position.set(x + 0.36, top, z + 0.24);
    g.scale.setScalar(1.25);
    const china = this.std({ color: '#f2ede2', roughness: 0.3, envMap: this.envMap, envMapIntensity: 0.4 });
    const green = this.std({ color: '#2f7d4f', roughness: 0.4 });
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.058, 0.012, 32), china);
    saucer.position.y = 0.006;
    const profile = [[0.0, 0], [0.032, 0], [0.034, 0.004], [0.04, 0.03], [0.045, 0.07], [0.047, 0.074], [0.044, 0.074], [0.041, 0.04], [0.0, 0.04]].map(([r, y]) => new THREE.Vector2(r, y));
    const cup = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), china);
    cup.position.y = 0.012;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0445, 0.0425, 0.012, 32, 1, true), green);
    band.position.y = 0.012 + 0.052;
    const kopi = new THREE.Mesh(new THREE.CircleGeometry(0.042, 28), this.std({ color: '#2b160a', roughness: 0.12 }));
    kopi.rotation.x = -Math.PI / 2;
    kopi.position.y = 0.012 + 0.062;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0055, 8, 18, Math.PI * 1.2), china);
    handle.position.set(0.05, 0.012 + 0.04, 0);
    handle.rotation.z = -Math.PI * 0.6;
    const spoon = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.003, 0.012), this.metal('#c8ccd0', 0.25));
    spoon.position.set(-0.035, 0.014, 0.045);
    spoon.rotation.y = 0.6;
    g.add(saucer, cup, band, kopi, handle, spoon);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.scene.add(g);
    this.addPick('cup', g, new THREE.Vector3(x + 0.36, top + 0.15, z + 0.24), [china]);
  }

  buildPhone() {
    const { x, z, top } = DESK;
    const g = new THREE.Group();
    g.position.set(x + 0.72, top, z + 0.08);
    g.rotation.y = -0.18;
    const standMat = this.std({ color: '#222326', roughness: 0.6 });
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.08), standMat);
    stand.position.y = 0.01;
    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.012), standMat);
    lip.position.set(0, 0.025, 0.03);
    const tilt = new THREE.Group();
    tilt.position.set(0, 0.02, 0.022);
    tilt.rotation.x = -0.32;
    this.phoneBodyMat = this.metal('#18191c', 0.3, 0.7);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.165, 0.009), this.phoneBodyMat);
    body.position.y = 0.0825;
    const sc = document.createElement('canvas');
    sc.width = 192;
    sc.height = 384;
    this.phoneCanvas = sc;
    this.phoneTex = new THREE.CanvasTexture(sc);
    this.phoneTex.colorSpace = THREE.SRGBColorSpace;
    this.phoneScreenMat = new THREE.MeshBasicMaterial({ map: this.phoneTex, color: '#8c8c8c', toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.072, 0.152), this.phoneScreenMat);
    screen.position.set(0, 0.0825, 0.0047);
    tilt.add(body, screen);
    g.add(stand, lip, tilt);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.scene.add(g);
    this.phone = g;
    this.phoneBaseX = g.position.x;
    this.phoneGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: '#7fe0b0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.phoneGlow.scale.set(0.42, 0.42, 1);
    this.phoneGlow.position.set(x + 0.72, top + 0.1, z + 0.12);
    this.scene.add(this.phoneGlow);
    this.drawPhone();
    this.addPick('phone', g, new THREE.Vector3(x + 0.72, top + 0.2, z + 0.08), [this.phoneBodyMat, standMat]);
  }

  drawPhone() {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const key = `${time}|${this.phoneRinging}|${this.player.caller || ''}`;
    if (key === this.phoneKey) return;
    this.phoneKey = key;
    drawPhoneScreen(this.phoneCanvas.getContext('2d'), 192, 384, { time, ringing: this.phoneRinging, caller: this.player.caller });
    this.phoneTex.needsUpdate = true;
  }

  buildProps() {
    // coat rack between the window and the board: trench coat and a fedora
    const rx = 0.42, rz = BACK + 0.28;
    const dark = this.std({ color: '#2a1c14', roughness: 0.6 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.86, 12), dark);
    pole.position.set(rx, 0.93, rz);
    this.add(pole, { cast: true });
    for (let i = 0; i < 3; i++) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.035), dark);
      foot.position.set(rx, 0.02, rz);
      foot.rotation.y = (i * Math.PI) / 3;
      this.add(foot, { cast: true });
    }
    const coatProfile = [[0.0, 1.8], [0.05, 1.79], [0.15, 1.73], [0.185, 1.64], [0.17, 1.4], [0.19, 1.1], [0.24, 0.8], [0.25, 0.7], [0.0, 0.69]].map(([r, y]) => new THREE.Vector2(r, y));
    const coat = new THREE.Mesh(new THREE.LatheGeometry(coatProfile, 20), this.std({ color: '#7a6240', roughness: 0.92 }));
    coat.scale.set(1, 1, 0.42);
    coat.position.set(rx + 0.04, 0, rz + 0.07);
    coat.rotation.y = 0.15;
    this.add(coat, { cast: true, receive: true });
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.206, 0.206, 0.04, 20, 1, true), this.std({ color: '#4d3d27', roughness: 0.9 }));
    belt.scale.set(1, 1, 0.43);
    belt.position.set(rx + 0.04, 1.24, rz + 0.07);
    this.add(belt);
    const coatMat = coat.material;
    for (const side of [-1, 1]) {
      const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.52, 4, 10), coatMat);
      sleeve.position.set(rx + 0.04 + side * 0.19, 1.36, rz + 0.08);
      sleeve.rotation.z = side * 0.08;
      sleeve.scale.set(1, 1, 0.8);
      this.add(sleeve, { cast: true, receive: true });
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.012), this.std({ color: '#5d4a30', roughness: 0.9 }));
      lapel.position.set(rx + 0.04 + side * 0.05, 1.6, rz + 0.155);
      lapel.rotation.z = side * -0.35;
      this.add(lapel, { cast: false, receive: true });
    }
    const hatMat = this.std({ color: '#2b2622', roughness: 0.85 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 28), hatMat);
    brim.position.set(rx, 1.87, rz);
    brim.rotation.z = 0.1;
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.085, 0.1, 24), hatMat);
    crown.position.set(rx - 0.005, 1.925, rz);
    crown.rotation.z = 0.1;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0855, 0.0855, 0.022, 24, 1, true), this.std({ color: '#0e0d0c' }));
    band.position.set(rx - 0.003, 1.885, rz);
    band.rotation.z = 0.1;
    [brim, crown, band].forEach((m) => this.add(m, { cast: true }));

    // wall clock above the coat rack (it keeps real time)
    const clock = new THREE.Group();
    clock.position.set(0.42, 2.48, BACK + 0.02);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.15, 40), this.std({ map: makeClockTexture(), roughness: 0.6 }));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.014, 10, 40), this.metal('#1e1f22', 0.4, 0.6));
    const handMat = this.std({ color: '#121212', roughness: 0.5 });
    const mk = (len, wd) => {
      const pivot = new THREE.Group();
      const m = new THREE.Mesh(new THREE.BoxGeometry(wd, len, 0.004), handMat);
      m.position.y = len / 2 - 0.015;
      pivot.add(m);
      pivot.position.z = 0.006;
      clock.add(pivot);
      return pivot;
    };
    this.clockHands = { h: mk(0.08, 0.012), m: mk(0.12, 0.008), s: mk(0.13, 0.003) };
    this.clockHands.s.children[0].material = this.std({ color: '#b3202a' });
    this.clockHands.s.position.z = 0.009;
    clock.add(face, rim);
    this.scene.add(clock);

    // framed licence and the filing cabinet in the corner beside the window
    this.licenceTex = makeLicenceTexture('', '');
    this.licenceMat = this.std({ map: this.licenceTex, roughness: 0.7 });
    const frame = this.box(0.46, 0.36, 0.025, this.std({ color: '#1a120c', roughness: 0.5 }), -2.52, 1.95, BACK + 0.015);
    frame.castShadow = false;
    const lic = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), this.licenceMat);
    lic.position.set(-2.52, 1.95, BACK + 0.029);
    this.add(lic, { receive: true });

    const cab = new THREE.Group();
    cab.position.set(-2.6, 0, BACK + 0.33);
    const olive = this.metal('#465040', 0.62, 0.3);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.32, 0.6), olive);
    body.position.y = 0.66;
    cab.add(body);
    const handle = this.metal('#c9b07a', 0.3, 0.9);
    for (let i = 0; i < 4; i++) {
      const y = 0.17 + i * 0.31;
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.27, 0.02), olive);
      drawer.position.set(0, y, 0.305);
      const hnd = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.025), handle);
      hnd.position.set(0, y - 0.04, 0.32);
      const card = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.035), this.std({ color: '#efe6cf' }));
      card.position.set(0, y + 0.06, 0.316);
      cab.add(drawer, hnd, card);
    }
    // a money plant on top, as in every office in KL
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.14, 16), this.std({ color: '#8a4b2a', roughness: 0.8 }));
    pot.position.set(0.05, 1.39, 0);
    cab.add(pot);
    const leafMat = this.std({ color: '#2f5a2a', roughness: 0.6 });
    for (let i = 0; i < 14; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), leafMat);
      const a = hash(i) * Math.PI * 2, r = 0.05 + hash(i + 9) * 0.12;
      leaf.position.set(0.05 + Math.cos(a) * r, 1.47 + hash(i + 3) * 0.14 - r * 0.6, Math.sin(a) * r);
      leaf.scale.set(1, 0.35, 0.7);
      leaf.rotation.set(hash(i + 1), a, hash(i + 2));
      cab.add(leaf);
    }
    cab.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.scene.add(cab);

    // ceiling fan, slowly turning, its blades cut by the top of the frame
    const frameMat = this.metal('#1a1d20', 0.5, 0.5);
    this.fan = new THREE.Group();
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.12, 18), frameMat);
    this.fan.add(hub);
    const bladeMat = this.std({ color: '#4a3a2c', roughness: 0.8 });
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.012, 0.13), bladeMat);
      blade.position.x = 0.44;
      blade.rotation.x = 0.12;
      const pivot = new THREE.Group();
      pivot.rotation.y = (i * Math.PI * 2) / 3;
      pivot.add(blade);
      this.fan.add(pivot);
    }
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.42), frameMat);
    rod.position.y = 0.26;
    this.fan.add(rod);
    this.fan.position.set(-0.2, 2.53, -2.6);
    this.scene.add(this.fan);
  }

  buildBoard() {
    this.board = new THREE.Group();
    this.board.position.set(BOARD.x, BOARD.y, BACK + 0.03);
    this.boardFrameMat = this.std({ map: makeWoodTexture(17, [70, 44, 26]), roughness: 0.55 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(BOARD.w + 0.12, BOARD.h + 0.12, 0.04), this.boardFrameMat);
    frame.position.z = -0.012;
    frame.castShadow = frame.receiveShadow = true;
    this.corkMat = this.std({ map: makeCorkTexture(), roughness: 1 });
    const cork = new THREE.Mesh(new THREE.PlaneGeometry(BOARD.w, BOARD.h), this.corkMat);
    cork.position.z = 0.009;
    cork.receiveShadow = true;
    this.board.add(frame, cork);
    // brass picture light over the board
    const brass = this.metal('#b8924a', 0.3, 0.9);
    const lampBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 18, 1, false, 0, Math.PI), brass);
    lampBar.rotation.set(0, 0, Math.PI / 2);
    lampBar.position.set(0, BOARD.h / 2 + 0.17, 0.14);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2), brass);
    arm.rotation.x = Math.PI / 2 - 0.5;
    arm.position.set(0, BOARD.h / 2 + 0.14, 0.06);
    this.picGlowMat = new THREE.MeshBasicMaterial({ color: '#ffe0b0' });
    const tube = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.008, 0.02), this.picGlowMat);
    tube.position.set(0, BOARD.h / 2 + 0.145, 0.15);
    this.board.add(lampBar, arm, tube);
    this.scene.add(this.board);
    this.boardItems = new THREE.Group();
    this.board.add(this.boardItems);
    this.addPick('board', this.board, new THREE.Vector3(BOARD.x, BOARD.y + BOARD.h / 2 + 0.06, BACK + 0.1), [this.boardFrameMat], 0.07);

    // shared pieces for the pinned cards
    this.cardGeo = new THREE.PlaneGeometry(1, 1);
    this.cardShadowMat = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.38, depthWrite: false });
    this.pinGeo = new THREE.SphereGeometry(0.017, 14, 10);
    this.pinNeedleGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.03, 6);
    this.pinMats = ['#c3202c', '#d9a420', '#1f6fb3'].map((c) => this.std({ color: c, roughness: 0.3, metalness: 0.1, envMap: this.envMap, envMapIntensity: 0.6 }));
    this.needleMat = this.metal('#bfc4c8', 0.3, 1);
    this.threadMats = {
      case: this.std({ color: '#8f1c24', roughness: 0.7 }),
      mine: this.std({ color: '#e0303c', roughness: 0.5, emissive: '#5a0a10', emissiveIntensity: 0.6 }),
    };
    [this.cardGeo, this.pinGeo, this.pinNeedleGeo].forEach((g) => { g.userData.shared = true; });
    [this.cardShadowMat, this.needleMat, ...this.pinMats, this.threadMats.case, this.threadMats.mine].forEach((m) => { m.userData.shared = true; });
  }

  buildLights() {
    const s = this.scene;
    // soft fill so the room reads: cool from above, warm bounce from the floor
    // phones skip the lamp's fill light, so their sky light is a little stronger
    this.ambient = new THREE.HemisphereLight('#7f97b0', '#3a2618', this.lowPower ? 1.35 : 1.05);
    this.hemiBase = this.ambient.intensity;
    s.add(this.ambient);

    // key: the banker's lamp pours warm light over the desk
    this.lamp = new THREE.SpotLight('#ffb35c', 26, 5, 1.0, 0.75, 1.5);
    this.lamp.position.copy(this.lampBulbPos).add(new THREE.Vector3(0, -0.03, 0.04));
    this.lamp.target.position.set(DESK.x - 0.2, DESK.top, DESK.z + 0.35);
    this.lamp.castShadow = true;
    const sm = this.lowPower ? 512 : 1024;
    this.lamp.shadow.mapSize.set(sm, sm);
    this.lamp.shadow.bias = -0.0004;
    this.lamp.shadow.normalBias = 0.02;
    this.lamp.shadow.camera.near = 0.05;
    s.add(this.lamp, this.lamp.target);
    this.lampBase = this.lamp.intensity;
    if (!this.lowPower) {
      this.lampFill = new THREE.PointLight('#ffa552', 2.4, 4.5, 1.4);
      this.lampFill.position.copy(this.lampBulbPos).add(new THREE.Vector3(0.1, 0.25, 0.35));
      s.add(this.lampFill);
      this.lampFillBase = this.lampFill.intensity;
    }

    // rim: the city's blue-teal glow through the window, throwing the window bars across the room
    this.windowLight = new THREE.SpotLight('#7fb2d8', 10, 14, 0.6, 0.7, 1.1);
    this.windowLight.position.set(WIN.x + 0.4, 3.3, BACK - 2.4);
    this.windowLight.target.position.set(WIN.x + 0.9, 0.2, -1.2);
    if (!this.lowPower) {
      this.windowLight.castShadow = true;
      this.windowLight.shadow.mapSize.set(1024, 1024);
      this.windowLight.shadow.bias = -0.0006;
      this.windowLight.shadow.normalBias = 0.03;
      this.windowLight.shadow.camera.near = 1.5;
      this.windowLight.shadow.camera.far = 12;
    }
    s.add(this.windowLight, this.windowLight.target);
    this.windowBase = this.windowLight.intensity;

    // the board's picture light
    this.boardLight = new THREE.SpotLight('#ffd7a4', 14, 4, 0.85, 0.85, 1.4);
    this.boardLight.position.set(BOARD.x, BOARD.y + BOARD.h / 2 + 0.2, BACK + 0.5);
    this.boardLight.target.position.set(BOARD.x, BOARD.y - 0.35, BACK);
    s.add(this.boardLight, this.boardLight.target);

    // neon from the mamak sign below the window, washing the ceiling and the sill
    this.neon = new THREE.PointLight('#38e0a6', 2.2, 6, 1.4);
    this.neon.position.set(WIN.x + 0.2, WIN.y - WIN.h / 2 - 0.2, BACK - 0.45);
    s.add(this.neon);
    if (!this.lowPower) {
      this.neonRed = new THREE.PointLight('#ff3550', 1.6, 5, 1.6);
      this.neonRed.position.set(WIN.x + 0.6, WIN.y - WIN.h / 2 + 0.05, BACK - 0.5);
      s.add(this.neonRed);
    }
  }

  buildAtmosphere() {
    // light shafts from the three window bays, fading as they reach into the room
    const dir = new THREE.Vector3(0.12, -0.5, 1).normalize();
    const len = 2.6;
    this.shaftMat = hazeMaterial('#86b6dc', 0.05);
    const wb = WIN.y - WIN.h / 2 + 0.05, wt = WIN.y + WIN.h / 2 - 0.05;
    for (let i = 0; i < 3; i++) {
      const x0 = WIN.x - WIN.w / 2 + (WIN.w / 3) * i + 0.06, x1 = x0 + WIN.w / 3 - 0.12;
      const a = [new THREE.Vector3(x0, wt, BACK + 0.02), new THREE.Vector3(x1, wt, BACK + 0.02), new THREE.Vector3(x1, wb, BACK + 0.02), new THREE.Vector3(x0, wb, BACK + 0.02)];
      const b = a.map((p) => p.clone().addScaledVector(dir, len).add(new THREE.Vector3((p.x - WIN.x) * 0.25, 0, 0)));
      const shaft = new THREE.Mesh(frustumGeometry(a, b), this.shaftMat);
      shaft.renderOrder = 2;
      this.scene.add(shaft);
    }
    // the neon's glow on the ceiling above the window
    const ceilGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshBasicMaterial({ map: this.glowTex, color: '#16684d', transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
    ceilGlow.rotation.x = Math.PI / 2;
    ceilGlow.position.set(WIN.x, 2.99, BACK + 0.6);
    this.ceilGlow = ceilGlow;
    this.scene.add(ceilGlow);

    // dust turning in the lamp light and the window shafts
    const n = this.lowPower ? 140 : 320;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const nearLamp = i % 2 === 0;
      pos[i * 3] = nearLamp ? DESK.x - 0.9 + Math.random() * 1.2 : WIN.x - 1 + Math.random() * 2.4;
      pos[i * 3 + 1] = nearLamp ? 0.85 + Math.random() * 0.8 : 0.6 + Math.random() * 2.2;
      pos[i * 3 + 2] = nearLamp ? DESK.z - 0.3 + Math.random() * 0.9 : BACK + 0.1 + Math.random() * 2.2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#ffe6c2', size: 0.011, map: this.glowTex, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.scene.add(this.dust);
  }

  /* ------------------------------------------------------------------ */
  /* Floating labels for the things you can click                          */
  /* ------------------------------------------------------------------ */

  buildTags() {
    const layer = document.createElement('div');
    layer.className = 'scene-tags';
    layer.hidden = true;
    if (!this.finePointer) layer.classList.add('is-touch');
    this.tags = {};
    for (const id of PICK_ORDER) {
      if (!this.picks[id]) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'scene-tag is-off';
      b.dataset.pick = id;
      const text = document.createElement('span');
      text.className = 'scene-tag-text';
      text.textContent = PICK_LABELS[id];
      b.append(text);
      b.addEventListener('click', () => this.pick(id));
      b.addEventListener('focus', () => { this.focused = id; this.setHover(id); });
      b.addEventListener('blur', () => { if (this.focused === id) this.focused = null; this.setHover(null); });
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') this.setHover(id); });
      b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && this.focused !== id) this.setHover(null); });
      layer.append(b);
      this.tags[id] = { el: b, text, w: 0, h: 0, visible: false };
    }
    // under the screen layer, so the hub's own panels always sit on top of the labels
    this.canvas.after(layer);
    this.tagLayer = layer;
  }

  setTagText(id, label) {
    const t = this.tags?.[id];
    if (!t || t.text.textContent === label) return;
    t.text.textContent = label;
    t.w = 0;
  }

  setHover(id, card = null) {
    if (this.hovered !== id) {
      if (this.hovered) this.setGlow(this.hovered, false);
      this.hovered = id;
      if (id) this.setGlow(id, true);
    }
    // on the board, the label names the card under the pointer
    this.hoverCard = card;
    if (this.tags?.board) this.setTagText('board', card || PICK_LABELS.board);
    this.canvas.style.cursor = id && this.pointerOnCanvas ? 'pointer' : '';
    if (this.tags) for (const [tid, t] of Object.entries(this.tags)) t.el.classList.toggle('is-on', tid === id);
  }

  setGlow(id, on) {
    const p = this.picks[id];
    if (!p) return;
    for (const m of p.mats) {
      if (!m.userData.base) m.userData.base = { c: m.emissive.clone(), i: m.emissiveIntensity };
      if (on) {
        m.emissive.set('#ff9a45');
        m.emissiveIntensity = Math.max(m.userData.base.i, p.glow);
        m.userData.glowing = true;
      } else {
        m.emissive.copy(m.userData.base.c);
        m.emissiveIntensity = m.userData.base.i;
        m.userData.glowing = false;
      }
    }
  }

  updateTags(t) {
    const layer = this.tagLayer;
    const show = this.mode === 'office';
    if (layer.hidden === show) layer.hidden = !show;
    if (!show) return;
    const W = window.innerWidth, H = window.innerHeight;
    const v = new THREE.Vector3();
    const placed = [];
    for (const id of PICK_ORDER) {
      const tag = this.tags[id];
      if (!tag) continue;
      v.copy(id === 'board' && this.hoverCard && this.cardAnchor ? this.cardAnchor : this.picks[id].anchor).project(this.camera);
      const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
      if (!tag.w) { tag.w = tag.el.offsetWidth; tag.h = tag.el.offsetHeight; }
      let visible = v.z < 1 && x > 8 && x < W - 8 && y > 8 && y < H - 8;
      if (visible && !this.finePointer) {
        // touch: every label shows, faintly, so skip any that would sit on top of another
        const r = { l: x - tag.w / 2 - 4, r: x + tag.w / 2 + 4, t: y - tag.h - 22, b: y };
        if (placed.some((o) => r.l < o.r && r.r > o.l && r.t < o.b && r.b > o.t)) visible = false;
        else placed.push(r);
      }
      if (visible !== tag.visible) {
        tag.visible = visible;
        tag.el.classList.toggle('is-off', !visible);
      }
      // keep the whole label on screen; the leader line still points at the object
      const cx = Math.min(Math.max(x, tag.w / 2 + 6), W - tag.w / 2 - 6);
      if (visible) tag.el.style.transform = `translate3d(${cx.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    // a gentle pulse on whatever is lit up
    if (this.hovered) {
      const hp = this.picks[this.hovered];
      const pulse = hp.glow * (0.85 + Math.sin(t * 4) * 0.3);
      for (const m of hp.mats) if (m.userData.glowing) m.emissiveIntensity = Math.max(m.userData.base.i, pulse);
    }
  }

  /* ------------------------------------------------------------------ */
  /* The board                                                             */
  /* ------------------------------------------------------------------ */

  clearBoardItems() {
    this.boardItems.traverse((o) => {
      if (!o.isMesh) return;
      if (!o.geometry.userData.shared) o.geometry.dispose();
      const m = o.material;
      if (!m.userData.shared) {
        m.map?.dispose();
        m.dispose();
      }
    });
    this.boardItems.clear();
  }

  /**
   * Suspects and collected evidence pinned to the board: real mugshots and evidence photos.
   * The case's own thread joins the evidence in discovery order (`order`); the player's links
   * (`links`, pairs of 's:<suspect id>' / 'e:<level id>' as saved by the board screen) run brighter.
   */
  async setBoard({ suspects = [], evidence = [], order = null, links = [] } = {}) {
    const token = (this.boardToken = (this.boardToken || 0) + 1);
    const sus = suspects.slice(0, 6);
    let ev = evidence.slice();
    if (order?.length) {
      const at = new Map(order.map((id, i) => [id, i]));
      ev.sort((a, b) => (at.has(a.id) ? at.get(a.id) : 1e3 + (a.tag || 0)) - (at.has(b.id) ? at.get(b.id) : 1e3 + (b.tag || 0)));
    }
    const room = MAX_CARDS - sus.length;
    if (ev.length > room) ev = ev.slice(ev.length - room); // the latest finds stay pinned
    const [imgs] = await Promise.all([
      Promise.all([...sus, ...ev].map((c) => loadImage(c.img ? imgUrl(c.img) : null))),
      document.fonts?.ready,
    ]);
    if (token !== this.boardToken) return;
    this.clearBoardItems();
    const pins = new Map();
    const z0 = 0.012;
    const addCard = (key, tex, x, y, w, hgt, rot, i, label, pinMat) => {
      const card = new THREE.Group();
      card.position.set(x, y, z0 + i * 0.0012);
      card.rotation.z = rot;
      const shadow = new THREE.Mesh(this.cardGeo, this.cardShadowMat);
      shadow.scale.set(w * 1.02, hgt * 1.02, 1);
      shadow.position.set(0.012, -0.016, -0.0006);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.1 });
      const face = new THREE.Mesh(this.cardGeo, mat);
      face.scale.set(w, hgt, 1);
      face.userData.card = label;
      face.userData.cardTop = new THREE.Vector3(0, hgt / 2 + 0.01, 0.03);
      face.receiveShadow = true;
      const pin = new THREE.Mesh(this.pinGeo, pinMat);
      pin.position.set(0, hgt / 2 - 0.03, 0.026);
      const needle = new THREE.Mesh(this.pinNeedleGeo, this.needleMat);
      needle.rotation.x = Math.PI / 2;
      needle.position.set(0, hgt / 2 - 0.03, 0.012);
      card.add(shadow, face, needle, pin);
      this.boardItems.add(card);
      card.updateMatrix();
      pins.set(key, pin.position.clone().applyMatrix4(card.matrix));
    };

    // suspects along the top
    const sw = 0.34, sh = sw * (512 / 384);
    const sStep = sus.length > 1 ? Math.min(0.5, (BOARD.w - 0.2 - sw) / (sus.length - 1)) : 0;
    const sY = BOARD.h / 2 - 0.06 - sh / 2;
    sus.forEach((sp, i) => {
      const x = (i - (sus.length - 1) / 2) * sStep + (hash(i + 50) - 0.5) * 0.03;
      addCard(`s:${sp.id}`, makeSuspectCardTexture(sp, imgs[i]), x, sY + (hash(i + 60) - 0.5) * 0.03, sw, sh, (hash(i + 70) - 0.5) * 0.07, i, sp.name, this.pinMats[0]);
    });

    // evidence fills the rest in rows, in the order it was found
    if (ev.length) {
      const areaTop = sY - sh / 2 - 0.04, areaBottom = -BOARD.h / 2 + 0.05, areaW = BOARD.w - 0.16;
      const rows = ev.length <= 5 ? 1 : ev.length <= 10 ? 2 : 3;
      const cols = Math.ceil(ev.length / rows);
      const cellW = areaW / cols, cellH = (areaTop - areaBottom) / rows;
      const ew = Math.min(0.37, cellW * 0.88, (cellH * 0.9) / (464 / 512));
      const eh = ew * (464 / 512);
      ev.forEach((e, i) => {
        const row = Math.floor(i / cols), col = i % cols;
        const inRow = Math.min(cols, ev.length - row * cols);
        const x = (col - (inRow - 1) / 2) * cellW + (hash(i + 7) - 0.5) * 0.04;
        const y = areaTop - cellH * (row + 0.5) + (hash(i + 13) - 0.5) * 0.03;
        addCard(`e:${e.id}`, makeEvidenceCardTexture(e, imgs[sus.length + i]), x, y, ew, eh, (hash(i + 21) - 0.5) * 0.09, sus.length + i, `Exhibit ${e.tag}: ${e.title}`, this.pinMats[i % 5 === 3 ? 1 : 0]);
      });
    }

    // red thread
    const thread = (a, b, mine) => {
      const p1 = pins.get(a), p2 = pins.get(b);
      if (!p1 || !p2) return;
      const mid = p1.clone().lerp(p2, 0.5);
      mid.y -= Math.min(0.09, p1.distanceTo(p2) * 0.14);
      mid.z += 0.02;
      const curve = new THREE.QuadraticBezierCurve3(p1.clone().setZ(p1.z + 0.004), mid, p2.clone().setZ(p2.z + 0.004));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, mine ? 0.0034 : 0.0024, 5), mine ? this.threadMats.mine : this.threadMats.case);
      tube.castShadow = false;
      this.boardItems.add(tube);
    };
    for (let i = 1; i < ev.length; i++) thread(`e:${ev[i - 1].id}`, `e:${ev[i].id}`, false);
    (links || []).forEach(([a, b]) => thread(a, b, true));
    this.board.traverse((o) => { o.userData.pickId = 'board'; });
  }

  /** Details that make the room yours: the licence on the wall, the case file, the drink. */
  setPlayer({ name = '', license = '', drink = '', caseLabel = '', caseTitle = '', caller = '' } = {}) {
    const p = this.player;
    if (name !== p.name || license !== p.license) {
      this.licenceTex.dispose();
      this.licenceTex = makeLicenceTexture(name, license);
      this.licenceMat.map = this.licenceTex;
      this.licenceMat.needsUpdate = true;
    }
    if (caseLabel !== p.caseLabel || caseTitle !== p.caseTitle) {
      this.folderTex.dispose();
      this.folderTex = makeFolderTexture((caseLabel || 'Case').toUpperCase(), caseTitle);
      this.folderMat.map = this.folderTex;
      this.folderMat.needsUpdate = true;
    }
    this.player = { name, license, drink, caseLabel, caseTitle, caller };
    this.setTagText('cup', drink || PICK_LABELS.cup);
    this.setTagText('folder', caseLabel ? `${caseLabel} file` : PICK_LABELS.folder);
    this.drawPhone();
  }

  /* ------------------------------------------------------------------ */
  /* Modes, input, weather                                                 */
  /* ------------------------------------------------------------------ */

  viewFor(mode) {
    if (mode === 'office' && this.camera.aspect < 0.8) return VIEWS.officeTall;
    return VIEWS[mode] || VIEWS.office;
  }

  setMode(mode, instant = false) {
    this.mode = mode;
    this.modeAt = performance.now();
    const v = this.viewFor(mode);
    this.viewKey = v;
    this.canvas.classList.toggle('is-dim', mode === 'dim');
    this.canvas.classList.toggle('is-hidden', mode === 'hidden');
    if (mode !== 'office') {
      this.focused = null;
      this.setHover(null);
      if (this.tagLayer) this.tagLayer.hidden = true;
    }
    gsap.killTweensOf(this.camBase);
    gsap.killTweensOf(this.lookTarget);
    if (instant || this.reducedMotion) {
      this.camBase.set(...v.pos);
      this.lookTarget.set(...v.look);
      return;
    }
    gsap.to(this.camBase, { x: v.pos[0], y: v.pos[1], z: v.pos[2], duration: 2.2, ease: 'power3.inOut' });
    gsap.to(this.lookTarget, { x: v.look[0], y: v.look[1], z: v.look[2], duration: 2.2, ease: 'power3.inOut' });
  }

  ringPhone(on) {
    this.phoneRinging = on;
    this.setTagText('phone', on ? 'Answer the phone' : PICK_LABELS.phone);
    this.tags?.phone?.el.classList.toggle('is-alert', !!on);
    if (!on) {
      this.phone.position.x = this.phoneBaseX;
      this.phoneGlow.material.opacity = 0;
      this.phoneScreenMat.color.set('#8c8c8c');
    }
    this.drawPhone();
  }

  onPick(fn) {
    this.pickHandler = fn;
  }

  pick(id) {
    if (id === 'lamp') this.toggleLamp();
    this.pickHandler?.(id);
  }

  // wall-clock fade, like the lightning, so a slow frame never leaves the lamp half on
  toggleLamp() {
    const now = performance.now();
    this.lampFade = { from: this.lampLevel(now), to: this.lampOn ? 0.06 : 1, at: now, dur: this.lampOn ? 200 : 350 };
    this.lampOn = !this.lampOn;
  }

  lampLevel(now) {
    const f = this.lampFade;
    if (!f) return 1;
    const k = Math.min(1, Math.max(0, (now - f.at) / f.dur));
    return f.from + (f.to - f.from) * (1 - (1 - k) * (1 - k));
  }

  hitTest(ndc) {
    this.raycaster.setFromCamera(ndc, this.camera);
    const roots = Object.values(this.picks).map((p) => p.root);
    const hit = this.raycaster.intersectObjects(roots, true)[0];
    if (!hit) return { id: null, card: null };
    const o = hit.object;
    if (o.userData.cardTop) this.cardAnchor = o.userData.cardTop.clone().applyMatrix4(o.parent.matrixWorld);
    return { id: o.userData.pickId || null, card: o.userData.card || null };
  }

  onClick(e) {
    if (this.mode !== 'office' && this.mode !== 'board') return;
    const p = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    const { id } = this.hitTest(p);
    if (id) this.pick(id);
  }

  // Lightning runs on the wall clock rather than a tween, so a slow frame never stretches the flash.
  flash(strength = 1) {
    this.flashAt = performance.now();
    this.flashStrength = strength;
  }

  flashLevel(now) {
    const e = (now - (this.flashAt ?? -1e9)) / 1000, k = this.flashStrength || 0;
    if (e < 0 || e > 1.4) return 0;
    if (e < 0.05) return (k * e) / 0.05;
    if (e < 0.3) return k * (1 - (0.9 * (e - 0.05)) / 0.25);
    if (e < 0.34) return k * (0.1 + (0.6 * (e - 0.3)) / 0.04);
    return k * 0.7 * (1 - (e - 0.34) / 1.06);
  }

  scheduleLightning() {
    const next = 9000 + Math.random() * 16000;
    this.lightningTimer = setTimeout(() => {
      if (this.mode !== 'hidden' && this.running) {
        this.flash(0.6 + Math.random() * 0.5);
        this.onLightning?.();
      }
      this.scheduleLightning();
    }, next);
  }

  resize() {
    const w = window.innerWidth, hgt = window.innerHeight;
    this.renderer.setSize(w, hgt, false);
    const a = w / hgt;
    this.camera.aspect = a;
    // keep the same horizontal reach on narrower screens; tall phones get a fixed wide lens
    this.camera.fov = a < 0.8 ? 68 : a < 1.6 ? Math.min(68, (2 * Math.atan(Math.tan((25 * Math.PI) / 180) * (1.6 / a)) * 180) / Math.PI) : 50;
    this.camera.updateProjectionMatrix();
    if (this.mode === 'office' && this.viewFor('office') !== this.viewKey) this.setMode('office');
    if (this.tags) for (const t of Object.values(this.tags)) t.w = 0;
  }

  tick() {
    if (!this.running || this.mode === 'hidden') return;
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.05);
    const t = this.timer.getElapsed();
    if (this.mode === 'dim') {
      // Behind puzzles the scene is blurred and darkened: run smoothly while the camera settles,
      // then drop to a few frames a second so the puzzles get the CPU/GPU (and phones keep their battery).
      const now = performance.now();
      const settled = now - (this.modeAt || 0) > 2600;
      if (settled && now - (this.lastDimFrame || 0) < 250) return;
      if (!settled && Math.floor(t * 60) % 2) return;
      this.lastDimFrame = now;
    }
    const calm = this.reducedMotion;
    const f = this.flashLevel(performance.now());
    this.windowMat.uniforms.uTime.value = t;
    this.windowMat.uniforms.uFlash.value = f;
    this.shaftMat.uniforms.uTime.value = t;
    this.shaftMat.uniforms.uIntensity.value = 0.05 + f * 0.3;
    this.lampCone.material.uniforms.uTime.value = t;
    this.ambient.intensity = this.hemiBase * (1 + f * 1.8);
    this.windowLight.intensity = this.windowBase * (1 + f * 5);

    // lamp (on/off)
    const L = this.lampLevel(performance.now());
    this.lamp.intensity = this.lampBase * L;
    if (this.lampFill) this.lampFill.intensity = this.lampFillBase * L;
    this.lampGlow.material.opacity = 0.55 * L;
    this.lampCone.material.uniforms.uIntensity.value = 0.22 * L;
    this.bulbMat.color.setScalar(0.25 + 0.75 * L).multiply(new THREE.Color('#fff0d0'));
    if (!this.shadeMat.userData.glowing) this.shadeMat.emissiveIntensity = 0.08 + 0.47 * L;

    if (!calm) this.fan.rotation.y += dt * 0.35;
    // neon: a steady hum with the odd stutter
    const stutter = Math.sin(t * 13) > 0.97 || (Math.sin(t * 0.9) > 0.995) ? 0.25 : 1;
    const hum = (0.92 + Math.sin(t * 0.7) * 0.08) * stutter;
    this.neon.intensity = 2.2 * hum;
    if (this.neonRed) this.neonRed.intensity = 1.6 * (Math.sin(t * 0.45 + 1) > -0.6 ? 1 : 0.2);
    this.windowMat.uniforms.uNeon.value = 0.8 * hum;
    this.ceilGlow.material.opacity = 0.3 * hum;

    if (!calm) {
      const d = this.dust.geometry.attributes.position;
      for (let i = 0; i < d.count; i++) {
        d.array[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.0004;
        d.array[i * 3] += Math.cos(t * 0.2 + i * 0.5) * 0.0003;
      }
      d.needsUpdate = true;
    }

    if (this.phoneRinging) {
      const on = Math.sin(t * 9) > 0;
      this.phoneScreenMat.color.setScalar(on ? 1.15 : 0.6);
      this.phoneGlow.material.opacity = on ? 0.75 : 0.25;
      this.phone.position.x = this.phoneBaseX + (on && !calm ? Math.sin(t * 90) * 0.003 : 0);
    }

    // the wall clock and the phone's lock screen keep real time
    const now = new Date();
    if (now.getSeconds() !== this.lastSecond) {
      this.lastSecond = now.getSeconds();
      const s = now.getSeconds(), m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
      this.clockHands.s.rotation.z = (-s / 60) * Math.PI * 2;
      this.clockHands.m.rotation.z = (-m / 60) * Math.PI * 2;
      this.clockHands.h.rotation.z = (-h / 12) * Math.PI * 2;
      if (s === 0 || !this.phoneKey) this.drawPhone();
    }

    // camera: a slow handheld drift, and a little parallax under the mouse
    const interactive = this.mode === 'office' || this.mode === 'title';
    const par = !calm && this.finePointer && interactive ? 1 : 0;
    const k = 1 - Math.exp(-dt * 2.4);
    this.parallax.x += (this.pointer.x * 0.14 * par - this.parallax.x) * k;
    this.parallax.y += (this.pointer.y * 0.06 * par - this.parallax.y) * k;
    const drift = calm ? 0 : 1;
    this.camera.position.set(
      this.camBase.x + this.parallax.x + Math.sin(t * 0.11) * 0.03 * drift,
      this.camBase.y + this.parallax.y + Math.sin(t * 0.17 + 1.3) * 0.015 * drift,
      this.camBase.z,
    );
    this.camera.lookAt(this.lookTarget.x + this.parallax.x * 0.35, this.lookTarget.y + this.parallax.y * 0.35, this.lookTarget.z);

    // hover: what's under the mouse
    if (this.mode === 'office' && this.finePointer && (this.pointerDirty || this.pointerOnCanvas)) {
      this.pointerDirty = false;
      if (this.pointerOnCanvas) {
        this.camera.updateMatrixWorld();
        const { id, card } = this.hitTest(this.pointer);
        if (id !== this.hovered || card !== this.hoverCard) this.setHover(id, card);
      } else if (this.hovered && !this.focused && !this.tags[this.hovered]?.el.matches(':hover')) {
        this.setHover(null);
      }
    }
    if (this.tagLayer) {
      this.camera.updateMatrixWorld();
      this.updateTags(t);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
