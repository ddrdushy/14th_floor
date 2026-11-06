// The baked 3D office for capable devices: office.glb (meshopt) with its lighting baked in Blender per
// time of day (tools/office/bake_glb.py). Every surface is a display-referred texture, as in the 2.5D
// plates, so both look the same; the lamp and lightning are baked deltas mixed in live, the window glass
// runs the same rain over a render of the view outside, and the fan and the clock's hands move.
// Loaded on demand (RealOffice.upgrade), so phones never download it.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RAIN_GLSL } from './officePlates.js';
import { WIN, GLASS_Z } from './officeLayout.js';

const BASE = `${import.meta.env.BASE_URL || '/'}assets/office/`;

const vert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

const bakedFrag = /* glsl */ `
  uniform sampler2D uA, uB, uFxA, uFxB;
  uniform float uMix, uLamp, uFlash, uGlow;
  uniform vec3 uLampTint;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uA, vUv).rgb;
    vec3 fx = texture2D(uFxA, vUv).rgb;
    if (uMix > 0.0) {
      c = mix(c, texture2D(uB, vUv).rgb, uMix);
      fx = mix(fx, texture2D(uFxB, vUv).rgb, uMix);
    }
    if (uLamp >= 0.0) c += fx.r * uLamp * uLampTint;
    else c *= 1.0 + uLamp * clamp(fx.r / max(dot(c, vec3(0.3, 0.55, 0.15)), 0.004), 0.0, 1.0);
    c += fx.b * uFlash * vec3(0.85, 0.9, 1.05);
    c = c * (1.0 + 0.22 * uGlow) + vec3(0.07, 0.035, 0.0) * uGlow;
    gl_FragColor = vec4(c, 1.0);
  }`;

const glassFrag = /* glsl */ `
  uniform sampler2D uBackA, uBackB;
  uniform float uMix, uTime, uRain, uFlash, uCalm;
  uniform mat4 uBackVP;
  uniform vec4 uWin;
  varying vec3 vWorld;
  ${RAIN_GLSL}
  vec3 back(vec2 uv, float lod) {
    vec3 a = textureLod(uBackA, uv, lod).rgb;
    return uMix > 0.0 ? mix(a, textureLod(uBackB, uv, lod).rgb, uMix) : a;
  }
  void main() {
    vec3 dir = normalize(vWorld - cameraPosition);
    float t = (${(GLASS_Z - 40).toFixed(2)} - cameraPosition.z) / dir.z;
    vec4 c = uBackVP * vec4(cameraPosition + dir * t, 1.0);
    vec2 buv = c.xy / c.w * 0.5 + 0.5;
    vec2 wuv = (vWorld.xy - uWin.xy) / uWin.zw;
    float tt = uTime * 0.35 * (1.0 - uCalm * 0.9);
    vec3 d = layer(wuv, tt);
    if (uRain > 0.35) d += layer(wuv * 1.23 + 7.54, tt);
    if (uRain > 0.6) d += layer(wuv * 1.35 + 1.54, tt);
    if (uRain > 0.85) d += layer(wuv * 1.57 + 7.54, tt);
    float st = staticDrops(wuv * vec2(1.3, 1.0), uTime) * uRain;
    float clear = clamp(d.z + st, 0.0, 1.0);
    vec3 col = back(buv + (d.xy + st * 0.02) * vec2(0.05, 0.07), mix(0.3 + uRain * 1.3, 0.0, clear));
    col *= 0.9 + clear * 0.14;
    col += uFlash * vec3(0.32, 0.36, 0.45);
    gl_FragColor = vec4(col, 1.0);
  }`;

function loadTex(url, { flipY = false, mip = true } = {}) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.NoColorSpace; // display-referred values, written out as they are
      t.flipY = flipY;
      t.generateMipmaps = mip;
      t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
      t.anisotropy = 8;
      resolve(t);
    }, undefined, () => reject(new Error(`office: ${url}`)));
  });
}

export class GlbRoom {
  constructor(renderer, { tier = 'high' } = {}) {
    this.renderer = renderer;
    this.tier = tier;
    this.group = new THREE.Group();
    this.group.name = 'office-glb';
    this.atlas = {};
    for (const name of ['room', 'desk']) {
      this.atlas[name] = {
        uA: { value: null }, uB: { value: null }, uFxA: { value: null }, uFxB: { value: null },
        uMix: { value: 0 }, uLamp: { value: 0 }, uFlash: { value: 0 }, uLampTint: { value: new THREE.Vector3(1.25, 0.95, 0.62) },
      };
    }
    this.glassU = {
      uBackA: { value: null }, uBackB: { value: null }, uMix: { value: 0 }, uTime: { value: 0 }, uRain: { value: 0.6 }, uFlash: { value: 0 }, uCalm: { value: 0 },
      uBackVP: { value: new THREE.Matrix4() }, uWin: { value: new THREE.Vector4(WIN.x - WIN.w / 2, WIN.y - WIN.h / 2, WIN.w, WIN.h) },
    };
    this.picks = {};
    this.sets = new Map();
  }

  async load(period) {
    const v = await fetch(`${BASE}glb.json`, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error('office: glb.json');
      return r.json();
    });
    this.manifest = v;
    this.q = v.version ? `?v=${v.version}` : '';
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const [gltf, set] = await Promise.all([loader.loadAsync(`${BASE}office.glb${this.q}`), this.loadSet(period)]);
    const bd = v.backdrop;
    if (bd) {
      const c = new THREE.PerspectiveCamera(bd.fov, bd.aspect, 0.5, 10000);
      c.position.set(...bd.pos);
      c.lookAt(...bd.look);
      c.updateMatrixWorld(true);
      this.glassU.uBackVP.value.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
    }
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      const name = o.name.replace(/_\d+$/, '');
      const matName = (o.material?.name || 'atlas_room').replace(/^atlas_/, '').replace(/\.\d+$/, '');
      if (matName === 'glass') {
        o.material = new THREE.ShaderMaterial({ uniforms: this.glassU, vertexShader: vert, fragmentShader: glassFrag, toneMapped: false });
      } else {
        const atlas = matName === 'desk' ? 'desk' : 'room';
        o.material = new THREE.ShaderMaterial({ uniforms: { ...this.atlas[atlas], uGlow: { value: 0 } }, vertexShader: vert, fragmentShader: bakedFrag, toneMapped: false });
      }
      o.frustumCulled = true;
      void name;
    });
    gltf.scene.traverse((o) => {
      const m = /^pick_(\w+)/.exec(o.name);
      if (m && !this.picks[m[1]]) {
        this.picks[m[1]] = o;
        o.traverse((q) => { q.userData.pickId = m[1]; });
      }
      if (o.name === 'fan') this.fan = o;
      if (o.name === 'clock_hour') this.hourHand = o;
      if (o.name === 'clock_minute') this.minuteHand = o;
    });
    this.group.add(gltf.scene);
    this.show(set);
    this.period = period;
    // compile now so the first frame after the swap does not stutter
    this.renderer.compile?.(this.group, new THREE.PerspectiveCamera());
  }

  async loadSet(period) {
    const key = `${period}_${this.tier}`;
    if (this.sets.has(key)) return this.sets.get(key);
    const sfx = this.tier === 'high' ? '' : '_1k';
    const q = this.q || '';
    const job = Promise.all([
      loadTex(`${BASE}bake_room_${period}${sfx}.webp${q}`),
      loadTex(`${BASE}bake_desk_${period}${sfx}.webp${q}`),
      loadTex(`${BASE}bakefx_room_${period}.webp${q}`, { mip: false }),
      loadTex(`${BASE}bakefx_desk_${period}.webp${q}`, { mip: false }),
      loadTex(`${BASE}backdrop_${period}.webp${q}`, { flipY: true }),
    ]).then(([room, desk, fxRoom, fxDesk, backdrop]) => ({ period, room, desk, fxRoom, fxDesk, backdrop, lamp0: this.manifest?.bakes?.[period]?.lamp_default ? 1 : 0 }));
    this.sets.set(key, job);
    job.catch(() => this.sets.delete(key));
    return job;
  }

  show(a, b = null) {
    const R = this.atlas.room, D = this.atlas.desk, G = this.glassU;
    R.uA.value = a.room; R.uFxA.value = a.fxRoom; D.uA.value = a.desk; D.uFxA.value = a.fxDesk; G.uBackA.value = a.backdrop;
    const n = b || a;
    R.uB.value = n.room; R.uFxB.value = n.fxRoom; D.uB.value = n.desk; D.uFxB.value = n.fxDesk; G.uBackB.value = n.backdrop;
    if (!b) this.setMix(0);
    this.current = a;
  }

  setMix(k) {
    this.atlas.room.uMix.value = k;
    this.atlas.desk.uMix.value = k;
    this.glassU.uMix.value = k;
  }

  async setPeriod(period, seconds = 8) {
    if (period === this.period) return;
    this.period = period;
    const next = await this.loadSet(period);
    if (!this.current) { this.show(next); return; }
    this.show(this.current, next);
    const start = performance.now();
    this.fade = { start, dur: seconds * 1000, next };
  }

  setTier(tier) {
    if (tier === this.tier) return;
    this.tier = tier;
    this.loadSet(this.period).then((s) => this.show(s)).catch(() => {});
  }

  update(t, dt, { lamp = 1, flash = 0, calm = false, rain = 0.6 } = {}) {
    if (this.fade) {
      const k = Math.min(1, (performance.now() - this.fade.start) / this.fade.dur);
      this.setMix(k * k * (3 - 2 * k));
      if (k >= 1) {
        this.show(this.fade.next);
        this.fade = null;
      }
    }
    const L0 = this.current?.lamp0 ?? 1;
    for (const a of Object.values(this.atlas)) {
      a.uLamp.value = lamp - L0;
      a.uFlash.value = flash;
    }
    const g = this.glassU;
    g.uTime.value = t;
    g.uRain.value = rain;
    g.uFlash.value = flash;
    g.uCalm.value = calm ? 1 : 0;
    if (this.fan && !calm) this.fan.rotation.y += dt * 0.55;
  }

  setClock(date) {
    const s = date.getSeconds(), m = date.getMinutes() + s / 60, h = (date.getHours() % 12) + m / 60;
    if (this.minuteHand) this.minuteHand.rotation.z = (-m / 60) * Math.PI * 2;
    if (this.hourHand) this.hourHand.rotation.z = (-h / 12) * Math.PI * 2;
  }

  setGlow(id, amt) {
    for (const [pid, root] of Object.entries(this.picks)) {
      const v = pid === id ? amt : 0;
      root.traverse((o) => { if (o.material?.uniforms?.uGlow) o.material.uniforms.uGlow.value = v; });
    }
  }

  pickRoots() {
    return Object.values(this.picks);
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.isMesh) {
        o.geometry.dispose();
        o.material.dispose();
      }
    });
    for (const job of this.sets.values()) {
      job.then((s) => [s.room, s.desk, s.fxRoom, s.fxDesk, s.backdrop].forEach((t) => t.dispose())).catch(() => {});
    }
  }
}
