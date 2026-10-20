// The detective's office above a Brickfields mamak: rain on the window, KL skyline,
// desk lamp, Daniel's lighter, and the case board where red thread connects the evidence.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { makeCityTexture, makeCorkTexture, makeCardTexture } from './textures.js';
import { rainWindowMaterial } from './rainWindow.js';

const VIEWS = {
  title: { pos: [0.55, 1.55, -1.2], look: [0.55, 1.6, -4] },
  office: { pos: [1.75, 1.62, 1.55], look: [-0.9, 1.25, -2.3] },
  board: { pos: [-0.9, 1.55, -0.15], look: [-2.95, 1.55, -0.85] },
  dim: { pos: [1.2, 1.7, 1.2], look: [-0.4, 1.35, -2.5] },
};

export class OfficeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a0f14');
    this.scene.fog = new THREE.Fog('#0a0f14', 6, 14);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.05, 50);
    this.lookTarget = new THREE.Vector3();
    this.timer = new THREE.Timer();
    this.pointer = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
    this.pickables = [];
    this.pickHandler = null;
    this.mode = 'title';
    this.running = true;
    this.phoneRinging = false;

    this.build();
    this.setMode('title', true);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', (e) => {
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    });
    canvas.addEventListener('click', (e) => this.onClick(e));
    document.addEventListener('visibilitychange', () => { this.running = !document.hidden; });
    this.scheduleLightning();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  build() {
    const s = this.scene;
    const wallMat = new THREE.MeshStandardMaterial({ color: '#3a4a4f', roughness: 0.95 });
    const floorMat = new THREE.MeshStandardMaterial({ color: '#2a1f18', roughness: 0.8 });

    // room: 6 wide (x -3..3), 3 tall, 6 deep (z -4..2)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -1;
    floor.receiveShadow = true;
    s.add(floor);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ color: '#20292d', roughness: 1 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3, -1);
    s.add(ceiling);

    // back wall with a window cut-out made of four panels
    const back = new THREE.Group();
    const winW = 2.6, winH = 1.7, winX = 0.55, winY = 1.6;
    const addPanel = (w, h, x, y) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
      m.position.set(x, y, -4);
      m.receiveShadow = true;
      back.add(m);
    };
    addPanel(6, winY - winH / 2, 0, (winY - winH / 2) / 2);
    addPanel(6, 3 - (winY + winH / 2), 0, (3 + winY + winH / 2) / 2);
    addPanel(winX - winW / 2 + 3, winH, (-3 + winX - winW / 2) / 2, winY);
    addPanel(3 - (winX + winW / 2), winH, (3 + winX + winW / 2) / 2, winY);
    s.add(back);

    this.cityTex = makeCityTexture();
    this.windowMat = rainWindowMaterial(this.cityTex);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), this.windowMat);
    glass.position.set(winX, winY, -4.01);
    s.add(glass);
    // window frame & bars
    const frameMat = new THREE.MeshStandardMaterial({ color: '#151a1d', roughness: 0.6, metalness: 0.4 });
    const bar = (w, h, x, y) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), frameMat);
      m.position.set(x, y, -3.97);
      s.add(m);
    };
    bar(winW + 0.12, 0.07, winX, winY + winH / 2);
    bar(winW + 0.12, 0.09, winX, winY - winH / 2);
    bar(0.07, winH, winX - winW / 2, winY);
    bar(0.07, winH, winX + winW / 2, winY);
    bar(0.04, winH, winX, winY);
    for (let i = 1; i < 6; i++) bar(0.018, winH, winX - winW / 2 + (winW / 6) * i, winY); // grille

    // side walls
    const left = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), wallMat);
    left.rotation.y = Math.PI / 2;
    left.position.set(-3, 1.5, -1);
    left.receiveShadow = true;
    s.add(left);
    const right = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), wallMat);
    right.rotation.y = -Math.PI / 2;
    right.position.set(3, 1.5, -1);
    s.add(right);

    // desk
    const wood = new THREE.MeshStandardMaterial({ color: '#4a3020', roughness: 0.65 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.07, 1), wood);
    desk.position.set(0.6, 0.78, -2.7);
    desk.castShadow = desk.receiveShadow = true;
    s.add(desk);
    for (const [x, z] of [[-0.45, -2.3], [1.65, -2.3], [-0.45, -3.1], [1.65, -3.1]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 0.06), wood);
      leg.position.set(x, 0.39, z);
      s.add(leg);
    }

    // desk lamp (warm pool of light)
    const lampMat = new THREE.MeshStandardMaterial({ color: '#2e4a3a', roughness: 0.4, metalness: 0.5 });
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 24), lampMat);
    lampBase.position.set(-0.2, 0.83, -2.95);
    s.add(lampBase);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45), lampMat);
    arm.position.set(-0.2, 1.05, -2.95);
    s.add(arm);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.16, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#2e4a3a', side: THREE.DoubleSide, metalness: 0.4, roughness: 0.5 }));
    shade.position.set(-0.08, 1.27, -2.85);
    shade.rotation.z = -0.5;
    s.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: '#ffd9a0' }));
    bulb.position.set(-0.05, 1.22, -2.83);
    s.add(bulb);
    this.lamp = new THREE.SpotLight('#ffbf73', 16, 6, 0.8, 0.6, 1.4);
    this.lamp.position.copy(bulb.position);
    this.lamp.target.position.set(0.35, 0.8, -2.6);
    this.lamp.castShadow = true;
    this.lamp.shadow.mapSize.set(1024, 1024);
    s.add(this.lamp, this.lamp.target);

    // teh tarik glass, files, phone, Daniel's lighter
    const glassMat = new THREE.MeshPhysicalMaterial({ color: '#e6c79b', roughness: 0.1, transmission: 0.4, transparent: true, opacity: 0.75 });
    const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.13, 20), glassMat);
    tea.position.set(1.05, 0.88, -2.55);
    s.add(tea);
    const folder = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.3), new THREE.MeshStandardMaterial({ color: '#d9c49a', roughness: 0.9 }));
    folder.position.set(0.5, 0.825, -2.6);
    folder.rotation.y = 0.15;
    folder.castShadow = true;
    s.add(folder);
    const phone = new THREE.Group();
    const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.17), new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.3, metalness: 0.6 }));
    this.phoneScreenMat = new THREE.MeshBasicMaterial({ color: '#0b0f12' });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.155), this.phoneScreenMat);
    screen.rotation.x = -Math.PI / 2;
    screen.position.y = 0.007;
    phone.add(phoneBody, screen);
    phone.position.set(1.3, 0.82, -2.8);
    phone.rotation.y = -0.4;
    phone.userData.pick = 'phone';
    phoneBody.userData.pick = 'phone';
    screen.userData.pick = 'phone';
    this.phone = phone;
    s.add(phone);
    this.pickables.push(phoneBody, screen);
    const lighter = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.055, 0.015), new THREE.MeshStandardMaterial({ color: '#c8ccd0', metalness: 1, roughness: 0.25 }));
    lighter.position.set(0.1, 0.842, -2.45);
    lighter.rotation.y = 0.6;
    lighter.userData.pick = 'lighter';
    s.add(lighter);
    this.pickables.push(lighter);

    // dead ceiling fan
    this.fan = new THREE.Group();
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16), frameMat);
    this.fan.add(hub);
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.01, 0.12), new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.8 }));
      blade.position.x = 0.42;
      const pivot = new THREE.Group();
      pivot.rotation.y = (i * Math.PI * 2) / 3;
      pivot.add(blade);
      this.fan.add(pivot);
    }
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35), frameMat);
    rod.position.y = 0.2;
    this.fan.add(rod);
    this.fan.position.set(0.2, 2.62, -1.6);
    s.add(this.fan);

    // case board on the left wall
    this.board = new THREE.Group();
    const cork = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), new THREE.MeshStandardMaterial({ map: makeCorkTexture(), roughness: 1 }));
    cork.receiveShadow = true;
    cork.userData.pick = 'board';
    this.pickables.push(cork);
    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 0.03), new THREE.MeshStandardMaterial({ color: '#3b2a1c', roughness: 0.7 }));
    boardFrame.position.z = -0.02;
    this.board.add(boardFrame, cork);
    this.board.rotation.y = Math.PI / 2;
    this.board.position.set(-2.97, 1.55, -0.85);
    s.add(this.board);
    this.boardItems = new THREE.Group();
    this.board.add(this.boardItems);

    // light: moonlit monsoon blue through the window + low fill
    this.ambient = new THREE.AmbientLight('#5a7286', 0.9);
    s.add(this.ambient);
    this.windowLight = new THREE.DirectionalLight('#7fa6c8', 1.5);
    this.windowLight.position.set(0.6, 2.4, -6);
    this.windowLight.target.position.set(0, 0, 0);
    s.add(this.windowLight, this.windowLight.target);
    this.boardLight = new THREE.PointLight('#ffcf9a', 3, 4.5, 1.5);
    this.boardLight.position.set(-2.1, 2.4, -0.8);
    s.add(this.boardLight);
    // neon from the mamak sign below the window
    this.neon = new THREE.PointLight('#3fd0a0', 0.0, 5, 2);
    this.neon.position.set(0.55, 0.6, -4.4);
    s.add(this.neon);

    // dust in the lamp beam
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = -1.5 + Math.random() * 3.5;
      pos[i * 3 + 1] = 0.6 + Math.random() * 2.2;
      pos[i * 3 + 2] = -3.6 + Math.random() * 4;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#ffe2b8', size: 0.008, transparent: true, opacity: 0.55, depthWrite: false }));
    s.add(this.dust);
  }

  /** Evidence and suspects pinned to the 3D board, joined by red thread in discovery order. */
  async setBoard({ suspects = [], evidence = [] }) {
    await document.fonts?.ready;
    this.boardItems.clear();
    const pinMat = new THREE.MeshStandardMaterial({ color: '#b3202a', roughness: 0.4, metalness: 0.2 });
    const pinGeo = new THREE.SphereGeometry(0.018, 12, 12);
    const pins = [];
    const addCard = (card, x, y, w, hgt, rot) => {
      const tex = makeCardTexture(card);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, hgt), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
      mesh.position.set(x, y, 0.005);
      mesh.rotation.z = rot;
      mesh.castShadow = true;
      mesh.userData.pick = 'board';
      this.pickables.push(mesh);
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, y + hgt / 2 - 0.035, 0.03);
      this.boardItems.add(mesh, pin);
      pins.push(pin.position.clone());
    };
    suspects.forEach((sp, i) => addCard({ ...sp, kind: 'suspect' }, -0.75 + i * 0.75, 0.38, 0.32, 0.4, (i - 1) * 0.03));
    const evPins = [];
    evidence.forEach((ev, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      const before = pins.length;
      addCard({ ...ev, kind: 'evidence' }, -0.98 + col * 0.39, -0.12 - row * 0.3, 0.3, 0.22, ((i * 37) % 7 - 3) * 0.012);
      evPins.push(pins[before]);
    });
    const threadMat = new THREE.MeshStandardMaterial({ color: '#c3242f', roughness: 0.6 });
    for (let i = 1; i < evPins.length; i++) {
      const a = evPins[i - 1], b = evPins[i];
      const mid = a.clone().lerp(b, 0.5);
      mid.y -= 0.05;
      mid.z += 0.01;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      this.boardItems.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.003, 5), threadMat));
    }
  }

  setMode(mode, instant = false) {
    this.mode = mode;
    this.modeAt = performance.now();
    const v = VIEWS[mode] || VIEWS.office;
    this.canvas.classList.toggle('is-dim', mode === 'dim');
    this.canvas.classList.toggle('is-hidden', mode === 'hidden');
    const target = { x: v.look[0], y: v.look[1], z: v.look[2] };
    if (instant) {
      this.camera.position.set(...v.pos);
      this.lookTarget.set(...v.look);
      return;
    }
    gsap.to(this.camera.position, { x: v.pos[0], y: v.pos[1], z: v.pos[2], duration: 2.2, ease: 'power3.inOut' });
    gsap.to(this.lookTarget, { ...target, duration: 2.2, ease: 'power3.inOut' });
  }

  ringPhone(on) {
    this.phoneRinging = on;
    if (!on) this.phoneScreenMat.color.set('#0b0f12');
  }

  onPick(fn) {
    this.pickHandler = fn;
  }

  onClick(e) {
    if (this.mode !== 'office' && this.mode !== 'board') return;
    const p = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(p, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickables, false)[0];
    if (hit && this.pickHandler) this.pickHandler(hit.object.userData.pick);
  }

  flash(strength = 1) {
    const base = { a: 0.9 };
    const tl = gsap.timeline();
    tl.to(this.ambient, { intensity: 2.6 * strength, duration: 0.05 })
      .to(this.windowMat.uniforms.uFlash, { value: 1 * strength, duration: 0.05 }, '<')
      .to(this.ambient, { intensity: base.a, duration: 0.25 })
      .to(this.windowMat.uniforms.uFlash, { value: 0, duration: 0.25 }, '<')
      .to(this.ambient, { intensity: 1.8 * strength, duration: 0.04 })
      .to(this.ambient, { intensity: base.a, duration: 0.9 });
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
    this.camera.aspect = w / hgt;
    // keep the scene readable on tall phones
    this.camera.fov = w / hgt < 0.8 ? 68 : 50;
    this.camera.updateProjectionMatrix();
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
    this.windowMat.uniforms.uTime.value = t;
    this.fan.rotation.y += dt * 0.08;
    this.neon.intensity = 0.35 + (Math.sin(t * 13) > 0.97 ? -0.3 : 0) + Math.sin(t * 0.7) * 0.05;
    const d = this.dust.geometry.attributes.position;
    for (let i = 0; i < d.count; i++) {
      d.array[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.0004;
      d.array[i * 3] += Math.cos(t * 0.2 + i * 0.5) * 0.0003;
    }
    d.needsUpdate = true;
    if (this.phoneRinging) {
      const on = Math.sin(t * 9) > 0;
      this.phoneScreenMat.color.set(on ? '#cfe8ff' : '#2a3f52');
      this.phone.position.x = 1.3 + (on ? Math.sin(t * 90) * 0.003 : 0);
    }
    // gentle parallax from the pointer
    const sway = this.mode === 'title' ? 0.06 : 0.12;
    const look = this.lookTarget.clone();
    look.x += this.pointer.x * sway;
    look.y += this.pointer.y * sway * 0.5;
    this.camera.lookAt(look);
    this.renderer.render(this.scene, this.camera);
  }
}
