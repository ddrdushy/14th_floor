// The office as rendered in Blender (tools/office/build_office.py): on phones and weak devices a 2.5D
// plate (officePlates.js), on capable ones the baked 3D room (officeGlb.js, loaded on demand), both with
// the same live layer on top (officeOverlay.js). Same public API as the classic procedural office;
// OfficeScene.js chooses between them and falls back to the classic one if anything here fails.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { PlateRoom, loadManifest } from './officePlates.js';
import { Overlay } from './officeOverlay.js';
import { VIEWS, PICK_ORDER, PICK_LABELS, PICKS, WIN, BOARD, BACK, fovFor } from './officeLayout.js';
import { currentPeriod, probeFrames } from './officeTier.js';

const RAIN = { morning: 0.45, afternoon: 0.3, evening: 0.7, night: 1.0 };
const LAMP_DEFAULT = { morning: false, afternoon: false, evening: true, night: true };
const LIGHTNING_GAP = { morning: [40, 70], afternoon: [45, 80], evening: [14, 26], night: [9, 25] };
const HOVER_IDS = { phone: 2, board: 3, folder: 4, lighter: 5, cup: 6, lamp: 7 };
// where the 2.5D camera looks in each mode: zoom and the point it centres on
const PLATE_MODES = {
  title: { zoom: 1.32, at: [WIN.x, WIN.y + 0.05, BACK] },
  board: { zoom: 1.7, at: [BOARD.x, BOARD.y, BACK] },
  office: { zoom: 1, at: null },
  dim: { zoom: 1.02, at: null },
  hidden: { zoom: 1, at: null },
};

export class RealOffice {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{tier: 'high'|'mid'|'low', onFail: (err) => void, onReady: () => void}} opts
   */
  constructor(canvas, { tier = 'low', onFail, onReady, forced = false } = {}) {
    this.canvas = canvas;
    this.forced = forced;
    this.tier = tier;
    this.onFail = onFail;
    this.onReady = onReady;
    const small = Math.min(window.screen?.width || innerWidth, window.screen?.height || innerHeight) < 820;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches;
    this.touch = !!(small && coarse);
    this.finePointer = !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const rm = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.reducedMotion = !!rm?.matches;
    rm?.addEventListener?.('change', (e) => { this.reducedMotion = e.matches; });

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: tier !== 'low', powerPreference: tier === 'low' ? 'default' : 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping; // plates and bakes are already display-referred (AgX in Blender)
    this.pixelCap = tier === 'high' ? 1.75 : tier === 'mid' ? 1.4 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.pixelCap));
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0b1016');
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60);
    this.camBase = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.parallax = new THREE.Vector2();
    this.tilt = new THREE.Vector2();
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.timer = new THREE.Timer();
    this.mode = 'title';
    this.running = true;
    this.phoneRinging = false;
    this.player = {};
    this.hovered = null;
    this.hoverCard = null;
    this.room = 'none';
    this.effects = tier === 'high' ? 2 : 1;
    this.plateView = { zoom: 1, cx: 0.5, cy: 0.5 };
    try { this.snap = new URLSearchParams(location.search).has('officesnap'); } catch { this.snap = false; }

    this.plates = new PlateRoom();
    const pu = this.plates.uniforms;
    this.shared = { uPlate: pu.uPlateA, uView: pu.uView, uRes: { value: new THREE.Vector2(1, 1) }, uBoardLum: { value: 0.35 } };
    this.overlay = new Overlay(this.scene, { shared: this.shared, plateMode: true });
    this.buildProxies();

    this.period = currentPeriod();
    this.lampOn = LAMP_DEFAULT[this.period];
    this.lampUser = false;
    this.overlay.setLight(this.period);
    this.buildTags();
    this.resize();
    this.setMode('title', true);

    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.onPointer = (e) => {
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      this.pointerOnCanvas = e.target === this.canvas && e.pointerType === 'mouse';
      this.pointerDirty = true;
    };
    window.addEventListener('pointermove', this.onPointer);
    this.onLeave = () => { this.pointerOnCanvas = false; this.pointerDirty = true; };
    document.documentElement.addEventListener('pointerleave', this.onLeave);
    this.onClickBound = (e) => this.onClick(e);
    canvas.addEventListener('click', this.onClickBound);
    this.onVis = () => { this.running = !document.hidden; };
    document.addEventListener('visibilitychange', this.onVis);
    this.setupTilt();
    this.scheduleLightning();
    this.periodTimer = setInterval(() => this.checkPeriod(), 20000);
    this.start();
  }

  /* ------------------------------------------------------------------ loading */

  async start() {
    try {
      await this.showPlates(this.period, this.orientFor());
    } catch (err) {
      this.fail(err);
      return;
    }
    this.renderer.setAnimationLoop(() => this.tick());
    this.onReady?.();
    if (this.tier === 'high' || this.tier === 'mid') this.upgrade();
    else this.probePlates();
  }

  fail(err) {
    if (this.failed) return;
    this.failed = true;
    console.warn('[office] falling back to the classic office:', err?.message || err);
    this.onFail?.(err);
  }

  orientFor() {
    return window.innerWidth / window.innerHeight < 0.8 ? 'portrait' : 'landscape';
  }

  async showPlates(period, orient, fade = 0) {
    const set = await this.plates.load(period, orient);
    if (this.disposed) return;
    if (!this.plates.current || !fade || this.plates.current.orient !== orient) {
      this.plates.show(set);
      this.plateSet = set;
    } else {
      this.plates.show(this.plates.current, set);
      this.fadePlates(set, fade);
    }
    this.shared.uBoardLum.value = set.boardLum;
    if (this.room === 'none') {
      this.scene.add(this.plates.mesh);
      this.room = 'plate';
      this.overlay.setPlateMode(true);
    }
    this.applyPlateCamera();
  }

  fadePlates(next, seconds) {
    const u = this.plates.uniforms;
    gsap.killTweensOf(u.uMix);
    u.uMix.value = 0;
    gsap.to(u.uMix, {
      value: 1, duration: this.reducedMotion ? 0.01 : seconds, ease: 'sine.inOut',
      onComplete: () => { this.plates.show(next); this.plateSet = next; },
    });
  }

  /** Capable devices: fetch the baked 3D room and swap it in once it has drawn a few frames well. */
  async upgrade() {
    if (this.glbLoading || this.glb) return;
    this.glbLoading = true;
    try {
      const { GlbRoom } = await import('./officeGlb.js');
      const glb = new GlbRoom(this.renderer, { tier: this.tier });
      await glb.load(this.period);
      if (this.disposed) { glb.dispose(); return; }
      this.glb = glb;
      this.useGlb();
      // the probe: if the room cannot hold a steady frame rate here, go back to the plates
      await new Promise((r) => setTimeout(r, 400));
      const ms = await probeFrames(() => {}, 30);
      this.probeMs = ms;
      if (ms > 40 && !this.forced) {
        console.info(`[office] ${ms.toFixed(1)} ms per frame with the 3D room: using the 2.5D office`);
        this.usePlates();
      } else if (ms > 22 && this.tier === 'high' && !this.forced) {
        this.tier = 'mid';
        this.effects = 1;
        this.pixelCap = 1.25;
        this.resize();
      }
    } catch (err) {
      console.warn('[office] 3D room unavailable, staying in 2.5D:', err?.message || err);
    } finally {
      this.glbLoading = false;
    }
  }

  async probePlates() {
    await new Promise((r) => setTimeout(r, 1500));
    if (this.disposed || this.mode === 'hidden') return;
    const ms = await probeFrames(() => {}, 20);
    this.probeMs = ms;
    if (ms > 45 && this.pixelCap > 1) {
      this.pixelCap = 1;
      this.effects = 0;
      this.resize();
    }
  }

  useGlb() {
    if (!this.glb) return;
    this.room = 'glb';
    this.scene.add(this.glb.group);
    this.overlay.setPlateMode(false);
    // the plate fades out on top while the room appears under it
    const u = this.plates.uniforms;
    const m = this.plates.mesh.material;
    m.transparent = true;
    m.depthWrite = false;
    this.plates.mesh.renderOrder = 1000;
    u.uOpacity.value = 1;
    gsap.to(u.uOpacity, {
      value: 0, duration: this.reducedMotion ? 0.01 : 1.2, ease: 'power2.inOut',
      onComplete: () => { if (this.room === 'glb') this.scene.remove(this.plates.mesh); },
    });
    this.setMode(this.mode, true);
  }

  usePlates() {
    if (this.glb) {
      this.scene.remove(this.glb.group);
      this.glb.dispose();
      this.glb = null;
    }
    const m = this.plates.mesh.material;
    m.transparent = false;
    m.depthWrite = true;
    this.plates.mesh.renderOrder = -100;
    this.plates.uniforms.uOpacity.value = 1;
    if (!this.plates.mesh.parent) this.scene.add(this.plates.mesh);
    this.room = 'plate';
    this.tier = 'low';
    this.overlay.setPlateMode(true);
    this.setMode(this.mode, true);
  }

  /** Settings changed: 'high' | 'mid' | 'low'. */
  setTier(tier, forced = false) {
    this.forced = forced;
    if (tier === this.tier && (tier === 'low') === (this.room === 'plate')) return;
    this.tier = tier;
    this.effects = tier === 'high' ? 2 : 1;
    this.pixelCap = tier === 'high' ? 1.75 : tier === 'mid' ? 1.4 : 2;
    if (tier === 'low') this.usePlates();
    else if (this.glb) { this.glb.setTier?.(tier); }
    else this.upgrade();
    this.resize();
  }

  /* ------------------------------------------------------------------ time of day */

  checkPeriod() {
    const p = currentPeriod();
    if (p !== this.period) this.setPeriod(p);
  }

  async setPeriod(p, fade = 8) {
    if (p === this.period) return;
    this.period = p;
    if (!this.lampUser) this.setLampTarget(LAMP_DEFAULT[p] ? 1 : 0, 1.2);
    this.overlay.setLight(p);
    try {
      await this.showPlates(p, this.plates.current?.orient || this.orientFor(), fade);
      if (this.glb) await this.glb.setPeriod(p, fade);
    } catch (err) {
      console.warn('[office] could not change the time of day:', err?.message || err);
    }
  }

  /* ------------------------------------------------------------------ picking */

  buildProxies() {
    this.proxies = new THREE.Group();
    this.picks = {};
    const mat = new THREE.MeshBasicMaterial({ visible: false });
    for (const id of PICK_ORDER) {
      const p = PICKS[id];
      const b = p.box;
      const depth = id === 'board' ? 0.01 : b.s[2];
      const m = new THREE.Mesh(new THREE.BoxGeometry(b.s[0], b.s[1], depth), mat);
      m.position.set(b.c[0], b.c[1], id === 'board' ? BACK + 0.02 : b.c[2]);
      m.rotation.y = b.yaw;
      m.userData.pickId = id;
      this.proxies.add(m);
      this.picks[id] = { id, anchor: new THREE.Vector3(...p.anchor) };
    }
    this.scene.add(this.proxies);
    this.proxies.updateMatrixWorld(true);
  }

  hitTest(ndc) {
    this.raycaster.setFromCamera(ndc, this.camera);
    const roots = [this.overlay.board];
    if (this.room === 'glb' && this.glb) roots.push(...this.glb.pickRoots());
    else roots.push(this.proxies);
    const hit = this.raycaster.intersectObjects(roots, true)[0];
    if (!hit) return { id: null, card: null };
    const o = hit.object;
    if (o.userData.cardTop) this.cardAnchor = o.userData.cardTop.clone().applyMatrix4(o.parent.matrixWorld);
    let id = o.userData.pickId || null;
    for (let q = o; !id && q; q = q.parent) id = q.userData.pickId || null;
    return { id, card: o.userData.card || null };
  }

  onClick(e) {
    if (this.mode !== 'office' && this.mode !== 'board') return;
    this.maybeAskTilt();
    const p = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    const { id } = this.hitTest(p);
    if (id) this.pick(id);
  }

  onPick(fn) {
    this.pickHandler = fn;
  }

  pick(id) {
    if (id === 'lamp') this.toggleLamp();
    this.pickHandler?.(id);
  }

  /* ------------------------------------------------------------------ labels (same DOM and CSS as the classic office) */

  buildTags() {
    const layer = document.createElement('div');
    layer.className = 'scene-tags';
    layer.hidden = true;
    if (!this.finePointer) layer.classList.add('is-touch');
    this.tags = {};
    for (const id of PICK_ORDER) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'scene-tag is-off';
      b.dataset.pick = id;
      const text = document.createElement('span');
      text.className = 'scene-tag-text';
      text.textContent = PICK_LABELS[id];
      b.append(text);
      b.addEventListener('click', () => { this.maybeAskTilt(); this.pick(id); });
      b.addEventListener('focus', () => { this.focused = id; this.setHover(id); });
      b.addEventListener('blur', () => { if (this.focused === id) this.focused = null; this.setHover(null); });
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') this.setHover(id); });
      b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && this.focused !== id) this.setHover(null); });
      layer.append(b);
      this.tags[id] = { el: b, text, w: 0, h: 0, visible: false };
    }
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
      this.hovered = id;
      this.hoverAt = performance.now();
    }
    this.hoverCard = card;
    if (this.tags?.board) this.setTagText('board', card || PICK_LABELS.board);
    this.canvas.style.cursor = id && this.pointerOnCanvas ? 'pointer' : '';
    if (this.tags) for (const [tid, t] of Object.entries(this.tags)) t.el.classList.toggle('is-on', tid === id);
  }

  updateTags() {
    const layer = this.tagLayer;
    const show = this.mode === 'office';
    if (layer.hidden === show) layer.hidden = !show;
    if (!show) return;
    const W = window.innerWidth, H = window.innerHeight;
    const v = new THREE.Vector3();
    const placed = [];
    for (const id of PICK_ORDER) {
      const tag = this.tags[id];
      v.copy(id === 'board' && this.hoverCard && this.cardAnchor ? this.cardAnchor : this.picks[id].anchor).project(this.camera);
      const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
      if (!tag.w) { tag.w = tag.el.offsetWidth; tag.h = tag.el.offsetHeight; }
      let visible = v.z < 1 && x > 8 && x < W - 8 && y > 8 && y < H - 8;
      if (visible && !this.finePointer) {
        const r = { l: x - tag.w / 2 - 4, r: x + tag.w / 2 + 4, t: y - tag.h - 22, b: y };
        if (placed.some((o) => r.l < o.r && r.r > o.l && r.t < o.b && r.b > o.t)) visible = false;
        else placed.push(r);
      }
      if (visible !== tag.visible) {
        tag.visible = visible;
        tag.el.classList.toggle('is-off', !visible);
      }
      const cx = Math.min(Math.max(x, tag.w / 2 + 6), W - tag.w / 2 - 6);
      if (visible) tag.el.style.transform = `translate3d(${cx.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }

  /* ------------------------------------------------------------------ board, player, phone */

  setBoard(b) {
    return this.overlay.setBoard(b);
  }

  setPlayer({ name = '', license = '', drink = '', caseLabel = '', caseTitle = '', caller = '' } = {}) {
    const next = { name, license, drink, caseLabel, caseTitle, caller };
    this.overlay.setPlayer(next, this.player);
    this.player = next;
    this.setTagText('cup', drink || PICK_LABELS.cup);
    this.setTagText('folder', caseLabel ? `${caseLabel} file` : PICK_LABELS.folder);
    this.overlay.drawPhone(this.phoneRinging, caller);
  }

  ringPhone(on) {
    this.phoneRinging = on;
    this.setTagText('phone', on ? 'Answer the phone' : PICK_LABELS.phone);
    this.tags?.phone?.el.classList.toggle('is-alert', !!on);
    this.overlay.ring(on);
    this.overlay.drawPhone(on, this.player.caller);
  }

  /* ------------------------------------------------------------------ lamp, lightning */

  toggleLamp() {
    this.lampUser = true;
    this.lampOn = !this.lampOn;
    this.setLampTarget(this.lampOn ? 1 : 0, this.lampOn ? 0.35 : 0.2);
  }

  setLampTarget(to, dur) {
    const now = performance.now();
    this.lampFade = { from: this.lampLevel(now), to, at: now, dur: dur * 1000 };
    this.lampOn = to > 0.5;
  }

  lampLevel(now) {
    const f = this.lampFade;
    if (!f) return this.lampOn ? 1 : 0;
    const k = Math.min(1, Math.max(0, (now - f.at) / f.dur));
    return f.from + (f.to - f.from) * (1 - (1 - k) * (1 - k));
  }

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
    const [a, b] = LIGHTNING_GAP[this.period] || [9, 25];
    this.lightningTimer = setTimeout(() => {
      if (this.disposed) return;
      if (this.mode !== 'hidden' && this.running) {
        const night = this.period === 'night' || this.period === 'evening';
        this.flash((night ? 0.6 : 0.35) + Math.random() * 0.5);
        this.onLightning?.();
      }
      this.scheduleLightning();
    }, (a + Math.random() * (b - a)) * 1000);
  }

  /* ------------------------------------------------------------------ device tilt (phones) */

  setupTilt() {
    this.onOrient = (e) => {
      if (e.beta == null || e.gamma == null) return;
      const portrait = window.innerHeight >= window.innerWidth;
      const gx = portrait ? e.gamma : e.beta;
      const gy = portrait ? e.beta : -e.gamma;
      if (this.tiltRest == null) this.tiltRest = { x: gx, y: gy };
      // the resting angle drifts slowly toward how the phone is held, so only changes in tilt move the room
      this.tiltRest.x += (gx - this.tiltRest.x) * 0.01;
      this.tiltRest.y += (gy - this.tiltRest.y) * 0.01;
      this.tilt.set(Math.max(-1, Math.min(1, (gx - this.tiltRest.x) / 18)), Math.max(-1, Math.min(1, -(gy - this.tiltRest.y) / 18)));
      this.tiltLive = true;
    };
    const D = window.DeviceOrientationEvent;
    if (!this.touch || !D) return;
    if (typeof D.requestPermission === 'function') this.tiltNeedsAsk = true; // iOS: only from a tap
    else window.addEventListener('deviceorientation', this.onOrient);
  }

  maybeAskTilt() {
    if (!this.tiltNeedsAsk || this.reducedMotion) return;
    this.tiltNeedsAsk = false;
    window.DeviceOrientationEvent.requestPermission().then((r) => {
      if (r === 'granted') window.addEventListener('deviceorientation', this.onOrient);
    }).catch(() => {});
  }

  /* ------------------------------------------------------------------ camera and modes */

  viewFor(mode) {
    if (mode === 'office' && this.camera.aspect < 0.8) return VIEWS.officeTall;
    return VIEWS[mode] || VIEWS.office;
  }

  setMode(mode, instant = false) {
    if (this.snap) instant = true;
    this.mode = mode;
    this.modeAt = performance.now();
    this.canvas.classList.toggle('is-dim', mode === 'dim');
    this.canvas.classList.toggle('is-hidden', mode === 'hidden');
    if (mode !== 'office') {
      this.focused = null;
      this.setHover(null);
      if (this.tagLayer) this.tagLayer.hidden = true;
    }
    if (mode === 'hidden') return;
    // 3D camera (GLB room)
    const v = this.viewFor(mode);
    this.viewKey = v;
    gsap.killTweensOf(this.camBase);
    gsap.killTweensOf(this.lookTarget);
    gsap.killTweensOf(this.plateView);
    const target = this.plateTarget(mode);
    if (instant || this.reducedMotion) {
      this.camBase.set(...v.pos);
      this.lookTarget.set(...v.look);
      Object.assign(this.plateView, target);
      return;
    }
    gsap.to(this.camBase, { x: v.pos[0], y: v.pos[1], z: v.pos[2], duration: 2.2, ease: 'power3.inOut' });
    gsap.to(this.lookTarget, { x: v.look[0], y: v.look[1], z: v.look[2], duration: 2.2, ease: 'power3.inOut' });
    gsap.to(this.plateView, { ...target, duration: 2.2, ease: 'power3.inOut' });
  }

  /** The 2.5D crop for a mode: zoom, and the plate-uv point to centre on. */
  plateTarget(mode) {
    const pm = PLATE_MODES[mode] || PLATE_MODES.office;
    const set = this.plates.current;
    if (!pm.at || !set) return { zoom: pm.zoom, cx: 0.5, cy: 0.5 };
    const uv = this.projectToPlate(new THREE.Vector3(...pm.at), set.meta);
    return { zoom: pm.zoom, cx: uv.x, cy: uv.y };
  }

  plateCamera(meta) {
    if (this._plateCamFor === meta) return this._plateCam;
    const c = new THREE.PerspectiveCamera(meta.fov, meta.w / meta.h, 0.05, 60);
    c.position.set(...meta.pos);
    c.lookAt(...meta.look);
    c.updateMatrixWorld(true);
    this._plateCam = c;
    this._plateCamFor = meta;
    return c;
  }

  projectToPlate(p, meta) {
    const v = p.clone().project(this.plateCamera(meta));
    return new THREE.Vector2((v.x + 1) / 2, (v.y + 1) / 2);
  }

  /** Point the camera at the plate: cover-crop for this screen, the mode's zoom, parallax from tilt or mouse. */
  applyPlateCamera(dx = 0, dy = 0) {
    const set = this.plates.current;
    if (!set) return;
    const meta = set.meta;
    const pc = this.plateCamera(meta);
    const W = window.innerWidth, H = window.innerHeight;
    const as = W / H, ap = meta.w / meta.h;
    let cw = 1, ch = 1;
    if (as > ap) ch = ap / as; else cw = as / ap;
    const s0 = 1 / (meta.overscan || 1);
    const pv = this.plateView;
    cw *= s0 / pv.zoom;
    ch *= s0 / pv.zoom;
    const P11 = 1 / Math.tan(THREE.MathUtils.degToRad(meta.fov) / 2), P00 = P11 / ap;
    const zf = 3.4;
    let cx = pv.cx - (dx * P00) / (2 * zf);
    let cy = pv.cy - (dy * P11) / (2 * zf);
    cx = Math.min(Math.max(cx, cw / 2), 1 - cw / 2);
    cy = Math.min(Math.max(cy, ch / 2), 1 - ch / 2);
    const cam = this.camera;
    cam.fov = meta.fov;
    cam.aspect = ap;
    cam.near = 0.05;
    cam.far = 60;
    cam.quaternion.copy(pc.quaternion);
    cam.position.copy(pc.position);
    if (dx || dy) {
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(pc.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(pc.quaternion);
      cam.position.addScaledVector(right, dx).addScaledVector(up, dy);
    }
    cam.setViewOffset(meta.w, meta.h, (cx - cw / 2) * meta.w, (1 - (cy + ch / 2)) * meta.h, cw * meta.w, ch * meta.h);
    cam.updateMatrixWorld(true);
    const u = this.plates.uniforms;
    u.uView.value.set(cx - cw / 2, cy - ch / 2, cw, ch);
    u.uShift.value.set((-dx * P00) / 2, (-dy * P11) / 2);
    u.uCamWorld.value.copy(pc.matrixWorld);
    u.uProj.value.set(P00, P11);
    u.uClip.value.set(cam.near, cam.far);
  }

  applyGlbCamera(t, calm) {
    const cam = this.camera;
    if (cam.view?.enabled) cam.clearViewOffset();
    const a = window.innerWidth / window.innerHeight;
    cam.aspect = a;
    cam.fov = fovFor(a);
    cam.updateProjectionMatrix();
    const drift = calm ? 0 : 1;
    cam.position.set(
      this.camBase.x + this.parallax.x + Math.sin(t * 0.11) * 0.03 * drift,
      this.camBase.y + this.parallax.y + Math.sin(t * 0.17 + 1.3) * 0.015 * drift,
      this.camBase.z,
    );
    cam.lookAt(this.lookTarget.x + this.parallax.x * 0.35, this.lookTarget.y + this.parallax.y * 0.35, this.lookTarget.z);
    cam.updateMatrixWorld(true);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.pixelCap));
    this.renderer.setSize(w, h, false);
    this.renderer.getDrawingBufferSize(this.shared.uRes.value);
    this.camera.aspect = w / h;
    if (this.tags) for (const t of Object.values(this.tags)) t.w = 0;
    const orient = this.orientFor();
    if (this.plates.current && this.plates.current.orient !== orient) {
      this.showPlates(this.period, orient).then(() => this.setMode(this.mode, true)).catch(() => {});
    }
    if (this.room === 'glb' && this.mode === 'office' && this.viewFor('office') !== this.viewKey) this.setMode('office');
  }

  /* ------------------------------------------------------------------ frame */

  tick() {
    if (!this.running || this.mode === 'hidden' || this.disposed) return;
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 0.05);
    const t = this.timer.getElapsed();
    const nowMs = performance.now();
    if (this.mode === 'dim') {
      const settled = nowMs - (this.modeAt || 0) > 2600;
      if (settled && nowMs - (this.lastDimFrame || 0) < 250) return;
      if (!settled && Math.floor(t * 60) % 2) return;
      this.lastDimFrame = nowMs;
    }
    const calm = this.reducedMotion;
    const f = this.flashLevel(nowMs);
    const L = this.lampLevel(nowMs);
    // a banker's lamp on old wiring: steady, with the rare sag
    const sag = calm ? 1 : 1 - 0.035 * Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 1.9) - 0.6) * 4 - (Math.sin(t * 0.37) > 0.997 ? 0.25 : 0);
    const stutter = Math.sin(t * 13) > 0.97 || Math.sin(t * 0.9) > 0.995 ? 0.25 : 1;
    const neon = calm ? 1 : (0.92 + Math.sin(t * 0.7) * 0.08) * stutter;
    const night = this.period === 'night' || this.period === 'evening';

    // parallax input: device tilt on phones, the mouse on desktops; nothing with reduced motion
    const interactive = this.mode === 'office' || this.mode === 'title';
    const k = 1 - Math.exp(-dt * 2.4);
    let tx = 0, ty = 0;
    if (!calm && interactive) {
      if (this.tiltLive) { tx = this.tilt.x; ty = this.tilt.y; }
      else if (this.finePointer) { tx = this.pointer.x; ty = this.pointer.y; }
    }

    if (this.room === 'glb' && this.glb) {
      this.parallax.x += (tx * 0.14 - this.parallax.x) * k;
      this.parallax.y += (ty * 0.06 - this.parallax.y) * k;
      this.applyGlbCamera(t, calm);
      this.glb.update(t, dt, { lamp: L * sag, flash: f, neon, calm, rain: RAIN[this.period], effects: this.effects });
    }
    if (this.plates.mesh.parent) {
      this.parallax.x += (tx * 0.05 - this.parallax.x) * (this.room === 'plate' ? k : 0);
      this.parallax.y += (ty * 0.03 - this.parallax.y) * (this.room === 'plate' ? k : 0);
      const drift = calm ? 0 : 1;
      if (this.room === 'plate') {
        this.applyPlateCamera(this.parallax.x + Math.sin(t * 0.11) * 0.012 * drift, this.parallax.y + Math.sin(t * 0.17 + 1.3) * 0.006 * drift);
      }
      const u = this.plates.uniforms;
      const set = this.plates.current;
      const L0 = set?.meta.lamp_default ? 1 : 0;
      u.uTime.value = t;
      u.uRain.value = RAIN[this.period];
      u.uLamp.value = L * sag - L0;
      u.uNeon.value = neon;
      u.uFlash.value = f;
      u.uCalm.value = calm ? 1 : 0;
      u.uFanAngle.value = this.overlay.fan.rotation.y;
      u.uDayLight.value = this.period === 'night' ? 0.4 + 0.6 * L : 1;
      u.uFxOn.value = this.effects > 0 || L !== L0 || f > 0 ? 1 : 0;
      // a car passes below now and then (evening, night): its headlights sweep the ceiling
      if (night && !calm) {
        if (!this.car || nowMs > this.car.end + this.car.gap) {
          this.car = { start: nowMs, end: nowMs + 2600 + Math.random() * 1400, gap: 6000 + Math.random() * 14000, dir: Math.random() < 0.5 ? 1 : -1 };
        }
        const ph = (nowMs - this.car.start) / (this.car.end - this.car.start);
        u.uHead.value = ph >= 0 && ph <= 1 ? Math.sin(ph * Math.PI) : 0;
        u.uHeadPhase.value = Math.min(Math.max(ph, 0), 1);
        u.uHeadDir.value = this.car.dir;
      } else u.uHead.value = 0;
      // hover
      if (this.hovered && this.room === 'plate') {
        u.uHover.value = HOVER_IDS[this.hovered] ?? -1;
        u.uHoverAmt.value = 0.85 + Math.sin(t * 4) * 0.3;
      } else u.uHoverAmt.value = 0;
    }
    if (this.room === 'glb' && this.glb) this.glb.setGlow(this.hovered, 0.85 + Math.sin(t * 4) * 0.3);
    this.overlay.setBoardGlow(this.hovered === 'board' ? 0.85 + Math.sin(t * 4) * 0.3 : 0);
    this.overlay.update(t, dt, { calm, ringing: this.phoneRinging, effects: this.effects });

    // wall clock and the phone's lock screen keep real time
    const now = new Date();
    if (now.getSeconds() !== this.lastSecond) {
      this.lastSecond = now.getSeconds();
      this.overlay.setClock(now);
      this.glb?.setClock(now);
      if (now.getSeconds() === 0) this.overlay.drawPhone(this.phoneRinging, this.player.caller);
    }

    // hover under the mouse
    if (this.mode === 'office' && this.finePointer && (this.pointerDirty || this.pointerOnCanvas)) {
      this.pointerDirty = false;
      if (this.pointerOnCanvas) {
        const { id, card } = this.hitTest(this.pointer);
        if (id !== this.hovered || card !== this.hoverCard) this.setHover(id, card);
      } else if (this.hovered && !this.focused && !this.tags[this.hovered]?.el.matches(':hover')) {
        this.setHover(null);
      }
    }
    if (this.tagLayer) this.updateTags();
    this.renderer.render(this.scene, this.camera);
    this.frames = (this.frames || 0) + 1;
    // CPU-side cost of a frame (submit + JS); the GPU time shows up in the rAF interval instead
    (this.cpuMs ||= []).push(performance.now() - nowMs);
    if (this.cpuMs.length > 120) this.cpuMs.shift();
  }

  /** For tests and the settings screen. */
  info() {
    const ri = this.renderer.info.render;
    const cpu = (this.cpuMs || []).slice().sort((x, y) => x - y);
    let bytes = 0;
    try {
      for (const e of performance.getEntriesByType('resource')) if (e.name.includes('/assets/office/')) bytes += e.transferSize || e.encodedBodySize || 0;
    } catch { /* no timing */ }
    return {
      room: this.room, tier: this.tier, period: this.period, orient: this.plates.current?.orient, probeMs: this.probeMs, frames: this.frames,
      mode: this.mode, calls: ri.calls, triangles: ri.triangles, cpuMsMedian: cpu.length ? +cpu[cpu.length >> 1].toFixed(2) : null, officeBytes: bytes,
      lampOn: this.lampOn,
    };
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    clearTimeout(this.lightningTimer);
    clearInterval(this.periodTimer);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('deviceorientation', this.onOrient);
    document.documentElement.removeEventListener('pointerleave', this.onLeave);
    document.removeEventListener('visibilitychange', this.onVis);
    this.canvas.removeEventListener('click', this.onClickBound);
    this.tagLayer?.remove();
    this.glb?.dispose();
    this.plates.dispose();
    this.renderer.dispose();
  }
}

export { loadManifest };
