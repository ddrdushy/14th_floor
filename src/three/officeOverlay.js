// The live layer of the office, drawn over the baked room or the 2.5D plate with the same camera: the
// case board's cards and red thread, the phone's screen and its glow when it rings, the case file's label,
// the licence on the wall, the clock's hands, the fan's blades, kopi steam and dust in the light.
// Colours here are display-referred, like the plates and the baked textures (no tone mapping).
import * as THREE from 'three';
import { imgUrl } from '../core/assets.js';
import { makeSuspectCardTexture, makeEvidenceCardTexture, makeGlowTexture, drawPhoneScreen, loadImage } from './textures.js';
import { BOARD, BACK, PHONE, FOLDER, LICENCE, CLOCK, FAN, CUP, LAMP_BULB, WIN, DESK, hash } from './officeLayout.js';

const MAX_CARDS = 16;

/** How bright the live pieces sit in each time of day (display space), and their tint. */
export const OVERLAY_LIGHT = {
  morning: { card: 0.86, tint: [0.97, 1.0, 1.03], hands: 0.16, blade: [0.3, 0.23, 0.17], dust: 0.35, steam: 0.1 },
  afternoon: { card: 0.95, tint: [1.03, 1.0, 0.95], hands: 0.18, blade: [0.32, 0.24, 0.18], dust: 0.6, steam: 0.08 },
  evening: { card: 0.84, tint: [1.08, 0.97, 0.86], hands: 0.12, blade: [0.16, 0.1, 0.07], dust: 0.4, steam: 0.16 },
  night: { card: 0.78, tint: [1.08, 0.95, 0.82], hands: 0.1, blade: [0.1, 0.07, 0.06], dust: 0.3, steam: 0.18 },
};

// Card material: the card's own picture, lit either by sampling the 2.5D plate under it (so the picture
// light's falloff and shadows carry onto the cards) or by a flat level with a top-lit gradient (GLB).
const cardVert = /* glsl */ `
  varying vec2 vUv;
  varying float vY;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vY = w.y;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;
const cardFrag = /* glsl */ `
  uniform sampler2D map;
  uniform sampler2D uPlate;
  uniform vec4 uView;
  uniform vec2 uRes;
  uniform float uRelight, uBoardLum, uLevel, uGlow, uOpacity;
  uniform vec3 uTint, uColor;
  uniform float uBoardTop, uBoardH;
  varying vec2 vUv;
  varying float vY;
  void main() {
    vec4 tex = texture2D(map, vUv);
    vec3 albedo = tex.rgb * uColor;
    float light = uLevel;
    if (uRelight > 0.5) {
      vec2 s = gl_FragCoord.xy / uRes;
      vec3 under = textureLod(uPlate, uView.xy + s * uView.zw, 3.5).rgb;
      float lum = dot(under, vec3(0.3, 0.55, 0.15));
      light *= clamp(lum / max(uBoardLum, 0.02), 0.35, 1.45);
    } else {
      // the picture light: brightest just under the lamp, falling off down the board
      float t = clamp((uBoardTop - vY) / uBoardH, 0.0, 1.0);
      light *= mix(1.12, 0.78, t);
    }
    vec3 c = albedo * light * uTint + uGlow * vec3(1.0, 0.6, 0.27);
    gl_FragColor = vec4(c, tex.a * uOpacity);
    #include <colorspace_fragment>
  }`;

function glowSprite(tex, color, opacity = 0) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  return s;
}

/** Ink-only canvas for multiply decals: the case file's label, the licence text. */
function inkCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, w, h);
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function fitText(g, text, max, size, font) {
  let s = size;
  g.font = `${s}px ${font}`;
  while (s > 10 && g.measureText(text).width > max) {
    s -= 2;
    g.font = `${s}px ${font}`;
  }
}

export function folderInk(label = 'CASE 1', title = '') {
  return inkCanvas(512, 368, (g, w, h) => {
    // a typed label strip, the case stamp, a coffee ring's ghost stays in the photo
    g.strokeStyle = 'rgba(40,30,20,0.55)';
    g.lineWidth = 3;
    g.strokeRect(w * 0.08, h * 0.12, w * 0.6, h * 0.24);
    g.fillStyle = 'rgba(25,22,20,0.9)';
    fitText(g, label, w * 0.56, 54, '"Special Elite", "Courier New", monospace');
    g.fillText(label, w * 0.1, h * 0.29);
    if (title) {
      g.fillStyle = 'rgba(25,22,20,0.8)';
      fitText(g, title, w * 0.8, 34, '"Special Elite", "Courier New", monospace');
      g.fillText(title, w * 0.1, h * 0.52);
    }
    g.save();
    g.translate(w * 0.74, h * 0.74);
    g.rotate(-0.18);
    g.strokeStyle = 'rgba(150,30,30,0.75)';
    g.lineWidth = 5;
    g.strokeRect(-80, -30, 160, 60);
    g.fillStyle = 'rgba(150,30,30,0.75)';
    g.font = 'bold 30px "Archivo", sans-serif';
    g.textAlign = 'center';
    g.fillText('SULIT', 0, 11);
    g.restore();
  });
}

export function licenceInk(name = '', number = '') {
  return inkCanvas(512, 384, (g, w, h) => {
    g.strokeStyle = 'rgba(90,70,40,0.7)';
    g.lineWidth = 6;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.lineWidth = 2;
    g.strokeRect(26, 26, w - 52, h - 52);
    g.fillStyle = 'rgba(40,30,20,0.85)';
    g.textAlign = 'center';
    g.font = 'bold 26px "Archivo", sans-serif';
    g.fillText('LESEN PENYIASAT PERSENDIRIAN', w / 2, 78);
    g.font = '20px "Special Elite", monospace';
    g.fillText('Private Investigator Licence', w / 2, 108);
    g.fillStyle = 'rgba(25,22,20,0.92)';
    fitText(g, name || ' ', w * 0.8, 46, '"Special Elite", monospace');
    g.fillText(name || '', w / 2, 200);
    g.font = '24px "Special Elite", monospace';
    g.fillText(number ? `No. ${number}` : '', w / 2, 246);
    g.strokeStyle = 'rgba(40,30,20,0.6)';
    g.beginPath();
    g.moveTo(w * 0.18, 312);
    g.bezierCurveTo(w * 0.3, 290, w * 0.36, 330, w * 0.48, 306);
    g.stroke();
    g.fillStyle = 'rgba(160,24,30,0.85)';
    g.beginPath();
    g.arc(w * 0.78, 300, 34, 0, Math.PI * 2);
    g.fill();
  });
}

export class Overlay {
  /**
   * @param {THREE.Scene} scene
   * @param {object} opts  { relight: shared uniforms {uPlate, uView, uRes, uBoardLum} or null, plateMode }
   */
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = 'overlay';
    scene.add(this.root);
    this.shared = opts.shared;
    this.glowTex = makeGlowTexture();
    this.level = { card: 0.85, tint: new THREE.Color(1, 1, 1) };
    this.cardMats = new Set();
    this.buildBoard();
    this.buildPhone();
    this.buildDecals();
    this.buildClock();
    this.buildFan();
    this.buildSteam();
    this.buildDust();
    this.setPlateMode(!!opts.plateMode);
  }

  /** In 2.5D the clock hands and fan blades are drawn here; the GLB room has its own. */
  setPlateMode(on) {
    this.plateMode = on;
    this.clock.visible = on;
    this.fan.visible = on;
    for (const m of this.cardMats) m.uniforms.uRelight.value = on ? 1 : 0;
  }

  setLight(period) {
    const L = OVERLAY_LIGHT[period] || OVERLAY_LIGHT.night;
    this.light = L;
    for (const m of this.cardMats) {
      m.uniforms.uLevel.value = L.card;
      m.uniforms.uTint.value.setRGB(...L.tint);
    }
    const k = L.card;
    this.pinMats.forEach((m, i) => m.color.copy(this.pinBase[i]).multiplyScalar(k));
    this.threadMats.case.color.set('#8f1c24').multiplyScalar(k);
    this.threadMats.mine.color.set('#e0303c').multiplyScalar(k * 1.05);
    this.needleMat.color.set('#bfc4c8').multiplyScalar(k * 0.8);
    this.handMat.color.setRGB(L.hands, L.hands, L.hands, THREE.SRGBColorSpace);
    this.bladeMat.color.setRGB(...L.blade, THREE.SRGBColorSpace);
    this.dust.material.opacity = L.dust;
    this.steamLevel = L.steam;
  }

  /* ---------------------------------------------------------------- board */
  buildBoard() {
    this.board = new THREE.Group();
    this.board.position.set(BOARD.x, BOARD.y, BACK + 0.03);
    this.boardItems = new THREE.Group();
    this.board.add(this.boardItems);
    this.root.add(this.board);
    this.cardGeo = new THREE.PlaneGeometry(1, 1);
    this.cardShadowMat = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.4, depthWrite: false, toneMapped: false });
    this.pinGeo = new THREE.SphereGeometry(0.017, 14, 10);
    this.pinNeedleGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.03, 6);
    this.pinBase = ['#c3202c', '#d9a420', '#1f6fb3'].map((c) => new THREE.Color(c));
    this.pinMats = this.pinBase.map((c) => new THREE.MeshBasicMaterial({ color: c.clone(), toneMapped: false }));
    this.needleMat = new THREE.MeshBasicMaterial({ color: '#9a9ea2', toneMapped: false });
    this.threadMats = {
      case: new THREE.MeshBasicMaterial({ color: '#7a1820', toneMapped: false }),
      mine: new THREE.MeshBasicMaterial({ color: '#d02a36', toneMapped: false }),
    };
    [this.cardGeo, this.pinGeo, this.pinNeedleGeo].forEach((g) => { g.userData.shared = true; });
    [this.cardShadowMat, this.needleMat, ...this.pinMats, this.threadMats.case, this.threadMats.mine].forEach((m) => { m.userData.shared = true; });
  }

  cardMaterial(tex) {
    const s = this.shared;
    const m = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: tex },
        uPlate: s.uPlate, uView: s.uView, uRes: s.uRes, uBoardLum: s.uBoardLum,
        uRelight: { value: this.plateMode ? 1 : 0 },
        uLevel: { value: this.light?.card ?? 0.85 },
        uTint: { value: new THREE.Color(...(this.light?.tint || [1, 1, 1])) },
        uColor: { value: new THREE.Color(1, 1, 1) },
        uGlow: { value: 0 },
        uOpacity: { value: 1 },
        uBoardTop: { value: BOARD.y + BOARD.h / 2 },
        uBoardH: { value: BOARD.h },
      },
      vertexShader: cardVert,
      fragmentShader: cardFrag,
      toneMapped: false,
    });
    this.cardMats.add(m);
    return m;
  }

  clearBoardItems() {
    this.boardItems.traverse((o) => {
      if (!o.isMesh) return;
      if (!o.geometry.userData.shared) o.geometry.dispose();
      const m = o.material;
      if (!m.userData.shared) {
        (m.uniforms?.map?.value || m.map)?.dispose();
        this.cardMats.delete(m);
        m.dispose();
      }
    });
    this.boardItems.clear();
  }

  /** Same board as the classic office: suspects along the top, evidence in rows, red thread between. */
  async setBoard({ suspects = [], evidence = [], order = null, links = [] } = {}) {
    const token = (this.boardToken = (this.boardToken || 0) + 1);
    const sus = suspects.slice(0, 6);
    let ev = evidence.slice();
    if (order?.length) {
      const at = new Map(order.map((id, i) => [id, i]));
      ev.sort((a, b) => (at.has(a.id) ? at.get(a.id) : 1e3 + (a.tag || 0)) - (at.has(b.id) ? at.get(b.id) : 1e3 + (b.tag || 0)));
    }
    const room = MAX_CARDS - sus.length;
    if (ev.length > room) ev = ev.slice(ev.length - room);
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
      shadow.scale.set(w * 1.03, hgt * 1.03, 1);
      shadow.position.set(0.012, -0.016, -0.0006);
      const face = new THREE.Mesh(this.cardGeo, this.cardMaterial(tex));
      face.scale.set(w, hgt, 1);
      face.userData.card = label;
      face.userData.cardTop = new THREE.Vector3(0, hgt / 2 + 0.01, 0.03);
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
    const sw = 0.34, sh = sw * (512 / 384);
    const sStep = sus.length > 1 ? Math.min(0.5, (BOARD.w - 0.2 - sw) / (sus.length - 1)) : 0;
    const sY = BOARD.h / 2 - 0.06 - sh / 2;
    sus.forEach((sp, i) => {
      const x = (i - (sus.length - 1) / 2) * sStep + (hash(i + 50) - 0.5) * 0.03;
      addCard(`s:${sp.id}`, makeSuspectCardTexture(sp, imgs[i]), x, sY + (hash(i + 60) - 0.5) * 0.03, sw, sh, (hash(i + 70) - 0.5) * 0.07, i, sp.name, this.pinMats[0]);
    });
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
    const thread = (a, b, mine) => {
      const p1 = pins.get(a), p2 = pins.get(b);
      if (!p1 || !p2) return;
      const mid = p1.clone().lerp(p2, 0.5);
      mid.y -= Math.min(0.09, p1.distanceTo(p2) * 0.14);
      mid.z += 0.02;
      const curve = new THREE.QuadraticBezierCurve3(p1.clone().setZ(p1.z + 0.004), mid, p2.clone().setZ(p2.z + 0.004));
      this.boardItems.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, mine ? 0.0034 : 0.0024, 5), mine ? this.threadMats.mine : this.threadMats.case));
    };
    for (let i = 1; i < ev.length; i++) thread(`e:${ev[i - 1].id}`, `e:${ev[i].id}`, false);
    (links || []).forEach(([a, b]) => thread(a, b, true));
    this.board.traverse((o) => { o.userData.pickId = 'board'; });
    this.board.updateMatrixWorld(true);
  }

  /** Hover glow on the cards (the board itself glows in the room layer). */
  setBoardGlow(v) {
    for (const m of this.cardMats) m.uniforms.uGlow.value = v * 0.12;
  }

  /* ---------------------------------------------------------------- phone */
  buildPhone() {
    const g = new THREE.Group();
    g.position.set(...PHONE.pos);
    g.rotation.y = PHONE.yaw;
    const tilt = new THREE.Group();
    tilt.position.set(...PHONE.tiltPos);
    tilt.rotation.x = PHONE.tilt;
    const sc = document.createElement('canvas');
    sc.width = 192;
    sc.height = 384;
    this.phoneCanvas = sc;
    this.phoneTex = new THREE.CanvasTexture(sc);
    this.phoneTex.colorSpace = THREE.SRGBColorSpace;
    this.phoneScreenMat = new THREE.MeshBasicMaterial({ map: this.phoneTex, color: '#6e6e6e', toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(...PHONE.size), this.phoneScreenMat);
    screen.position.set(...PHONE.screen);
    tilt.add(screen);
    g.add(tilt);
    this.root.add(g);
    this.phone = g;
    this.phoneBaseX = g.position.x;
    this.phoneGlow = glowSprite(this.glowTex, '#7fe0b0');
    this.phoneGlow.scale.set(0.42, 0.42, 1);
    this.phoneGlow.position.set(PHONE.pos[0], PHONE.pos[1] + 0.1, PHONE.pos[2] + 0.04);
    this.root.add(this.phoneGlow);
  }

  drawPhone(ringing, caller) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const key = `${time}|${ringing}|${caller || ''}`;
    if (key === this.phoneKey) return;
    this.phoneKey = key;
    drawPhoneScreen(this.phoneCanvas.getContext('2d'), 192, 384, { time, ringing, caller });
    this.phoneTex.needsUpdate = true;
  }

  /* ---------------------------------------------------------------- decals: case file label, licence */
  buildDecals() {
    const mk = (tex, w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({
      map: tex, transparent: true, blending: THREE.MultiplyBlending, premultipliedAlpha: true, depthWrite: false, toneMapped: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
    }));
    this.folderDecal = mk(folderInk(), FOLDER.size[0] * 0.98, FOLDER.size[1] * 0.98);
    this.folderDecal.rotation.order = 'YXZ';
    this.folderDecal.rotation.set(-Math.PI / 2, FOLDER.yaw, 0);
    this.folderDecal.position.set(...FOLDER.pos);
    this.licenceDecal = mk(licenceInk(), ...LICENCE.size);
    this.licenceDecal.position.set(...LICENCE.pos);
    this.root.add(this.folderDecal, this.licenceDecal);
  }

  setPlayer({ name, license, caseLabel, caseTitle }, prev = {}) {
    if (name !== prev.name || license !== prev.license) {
      this.licenceDecal.material.map.dispose();
      this.licenceDecal.material.map = licenceInk(name, license);
    }
    if (caseLabel !== prev.caseLabel || caseTitle !== prev.caseTitle) {
      this.folderDecal.material.map.dispose();
      this.folderDecal.material.map = folderInk((caseLabel || 'Case').toUpperCase(), caseTitle);
    }
  }

  /* ---------------------------------------------------------------- clock hands and fan blades (2.5D only) */
  buildClock() {
    this.clock = new THREE.Group();
    this.clock.position.set(...CLOCK.pos);
    this.handMat = new THREE.MeshBasicMaterial({ color: '#1a1a1a', toneMapped: false });
    const secMat = new THREE.MeshBasicMaterial({ color: '#7a1a1e', toneMapped: false });
    const mk = (len, wd, mat, z) => {
      const pivot = new THREE.Group();
      const m = new THREE.Mesh(new THREE.BoxGeometry(wd, len, 0.003), mat);
      m.position.y = len / 2 - 0.015;
      pivot.add(m);
      pivot.position.z = z;
      this.clock.add(pivot);
      return pivot;
    };
    this.hands = { h: mk(0.075, 0.011, this.handMat, 0.001), m: mk(0.115, 0.007, this.handMat, 0.003), s: mk(0.125, 0.0025, secMat, 0.005) };
    this.secMat = secMat;
    this.root.add(this.clock);
  }

  setClock(date) {
    const s = date.getSeconds(), m = date.getMinutes() + s / 60, h = (date.getHours() % 12) + m / 60;
    this.hands.s.rotation.z = (-s / 60) * Math.PI * 2;
    this.hands.m.rotation.z = (-m / 60) * Math.PI * 2;
    this.hands.h.rotation.z = (-h / 12) * Math.PI * 2;
  }

  buildFan() {
    this.fan = new THREE.Group();
    this.fan.position.set(...FAN.pos);
    this.bladeMat = new THREE.MeshBasicMaterial({ color: '#2a1d14', toneMapped: false });
    const iron = new THREE.MeshBasicMaterial({ color: '#0e0f10', toneMapped: false });
    for (let i = 0; i < 3; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.y = (i * Math.PI * 2) / 3;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.008, 0.12), this.bladeMat);
      blade.position.set(0.43, -0.03, 0);
      blade.rotation.x = 0.1;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.01, 0.03), iron);
      arm.position.set(0.13, -0.025, 0);
      pivot.add(blade, arm);
      this.fan.add(pivot);
    }
    this.root.add(this.fan);
  }

  /* ---------------------------------------------------------------- kopi steam and dust */
  buildSteam() {
    this.steam = [];
    for (let i = 0; i < 7; i++) {
      const s = glowSprite(this.glowTex, '#e8e2d8', 0);
      s.scale.set(0.05, 0.08, 1);
      s.userData.seed = hash(i + 91) * 10;
      this.steam.push(s);
      this.root.add(s);
    }
    this.steamLevel = 0.12;
  }

  buildDust() {
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const nearLamp = i % 3 === 0;
      pos[i * 3] = nearLamp ? DESK.x - 0.9 + Math.random() * 1.2 : WIN.x - 1 + Math.random() * 2.4;
      pos[i * 3 + 1] = nearLamp ? 0.85 + Math.random() * 0.8 : 0.7 + Math.random() * 2.0;
      pos[i * 3 + 2] = nearLamp ? DESK.z - 0.3 + Math.random() * 0.9 : BACK + 0.15 + Math.random() * 2.0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffe9cc', size: 0.009, map: this.glowTex, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    this.root.add(this.dust);
  }

  /** Per frame. `calm` = prefers-reduced-motion. */
  update(t, dt, { calm = false, ringing = false, effects = 2 } = {}) {
    if (!calm) this.fan.rotation.y += dt * 0.55;
    // steam: wisps rise, drift and fade above the cup
    const sl = effects > 0 && !calm ? this.steamLevel : 0;
    this.steam.forEach((s, i) => {
      const k = ((t * 0.16 + i / this.steam.length) % 1);
      s.position.set(CUP.pos[0] + Math.sin(t * 0.7 + s.userData.seed) * 0.012 * (1 + k * 2), CUP.pos[1] + k * 0.16, CUP.pos[2] + Math.cos(t * 0.5 + s.userData.seed) * 0.01);
      s.scale.set(0.035 + k * 0.06, 0.06 + k * 0.07, 1);
      s.material.opacity = sl * Math.sin(k * Math.PI) * (0.6 + 0.4 * Math.sin(t * 1.3 + i));
    });
    this.dust.visible = effects > 1;
    if (!calm && effects > 1) {
      const d = this.dust.geometry.attributes.position;
      for (let i = 0; i < d.count; i++) {
        d.array[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.0003;
        d.array[i * 3] += Math.cos(t * 0.2 + i * 0.5) * 0.00025;
      }
      d.needsUpdate = true;
    }
    if (ringing) {
      const on = Math.sin(t * 9) > 0;
      this.phoneScreenMat.color.setScalar(on ? 1.1 : 0.55);
      this.phoneGlow.material.opacity = on ? 0.7 : 0.22;
      this.phone.position.x = this.phoneBaseX + (on && !calm ? Math.sin(t * 90) * 0.003 : 0);
    }
  }

  ring(on) {
    if (!on) {
      this.phone.position.x = this.phoneBaseX;
      this.phoneGlow.material.opacity = 0;
      this.phoneScreenMat.color.set('#6e6e6e');
    }
  }
}

export { LAMP_BULB };
