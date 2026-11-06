// 2.5D office: a Cycles-rendered plate per time of day and orientation (tools/office/build_office.py),
// brought to life in one full-screen shader: depth parallax, rain running down the window, the lamp
// switching and flickering, the mamak's neon stuttering, lightning, car headlights sweeping the ceiling,
// the fan's shadow turning, and a warm glow on whatever the pointer is over. The plate writes its depth,
// so the live cards, the phone and the steam (officeOverlay.js) tuck in behind nearer things.
import * as THREE from 'three';
import { WIN, GLASS_Z, FAN, BOARD, BACK } from './officeLayout.js';

const BASE = `${import.meta.env.BASE_URL || '/'}assets/office/`;

export const RAIN_GLSL = /* glsl */ `
  float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  // rain on glass (after Heartfelt, by Martijn Steinrucken): drops that stick, slide and leave trails
  vec3 layer(vec2 UV, float t) {
    vec2 aspect = vec2(2.0, 1.0);
    vec2 uv = UV * 4.0 * aspect;
    uv.y += t * 0.25;
    vec2 gv = fract(uv) - 0.5;
    vec2 id = floor(uv);
    float n = h21(id);
    t += n * 6.2831;
    float w = UV.y * 10.0;
    float x = (n - 0.5) * 0.8;
    x += (0.4 - abs(x)) * sin(3.0 * w) * pow(sin(w), 6.0) * 0.45;
    float y = -sin(t + sin(t + sin(t) * 0.5)) * 0.45;
    y -= (gv.x - x) * (gv.x - x);
    vec2 dropPos = (gv - vec2(x, y)) / aspect;
    float drop = smoothstep(0.05, 0.03, length(dropPos));
    vec2 trailPos = (gv - vec2(x, t * 0.25)) / aspect;
    trailPos.y = (fract(trailPos.y * 8.0) - 0.5) / 8.0;
    float trail = smoothstep(0.03, 0.01, length(trailPos));
    float fogTrail = smoothstep(-0.05, 0.05, dropPos.y);
    fogTrail *= smoothstep(0.5, y, gv.y);
    trail *= fogTrail;
    fogTrail *= smoothstep(0.05, 0.04, abs(dropPos.x));
    return vec3(drop * dropPos + trail * trailPos, fogTrail + drop);
  }
  float staticDrops(vec2 uv, float t) {
    uv *= 40.0;
    vec2 id = floor(uv);
    uv = fract(uv) - 0.5;
    vec3 n = vec3(h21(id), h21(id + 7.1), h21(id + 3.3));
    vec2 p = (n.xy - 0.5) * 0.7;
    float d = length(uv - p);
    float fade = clamp(sin(t * 0.6 + n.z * 6.2831) * 0.5 + 0.5, 0.0, 1.0);
    return smoothstep(0.3, 0.0, d) * fract(n.z * 10.0) * fade;
  }

`;

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPlateA, uPlateB, uFxA, uFxB, uAux;
  uniform float uMix;
  uniform vec4 uView;       // plate uv = uView.xy + vUv * uView.zw
  uniform vec2 uShift;      // parallax: plate-uv shift times 1/depth
  uniform vec2 uDepth;      // near, far of the encoded depth (m)
  uniform vec2 uAuxSize;
  uniform mat4 uCamWorld;   // the plate camera's world matrix
  uniform vec2 uProj;       // the plate projection's x and y scale
  uniform vec2 uClip;       // overlay camera near, far (for gl_FragDepth)
  uniform vec4 uWin;        // window: x0, y0, w, h (world)
  uniform float uGlassZ;
  uniform vec3 uFan;
  uniform float uOpacity;
  uniform float uTime, uRain, uLamp, uNeon, uFlash, uHover, uHoverAmt, uFanAngle, uHead, uHeadPhase, uHeadDir, uCalm, uGrain, uDayLight, uFxOn;
  uniform vec3 uLampTint;
  varying vec2 vUv;

  
  float depthAt(vec2 p) {
    float d = texture2D(uAux, p).r;
    return d > 0.995 ? 40.0 : mix(uDepth.x, uDepth.y, d);
  }
  float idAt(vec2 p) {
    ivec2 q = ivec2(clamp(p, 0.0, 0.9999) * uAuxSize);
    return floor(texelFetch(uAux, q, 0).g * 255.0 / 16.0 + 0.5);
  }
  vec3 plate(vec2 p, float lod) {
    vec3 a = textureLod(uPlateA, p, lod).rgb;
    if (uMix <= 0.0) return a;
    return mix(a, textureLod(uPlateB, p, lod).rgb, uMix);
  }
  vec3 fxAt(vec2 p) {
    vec3 a = texture2D(uFxA, p).rgb;
    if (uMix <= 0.0) return a;
    return mix(a, texture2D(uFxB, p).rgb, uMix);
  }
  vec3 viewRay(vec2 p) { return vec3((p.x * 2.0 - 1.0) / uProj.x, (p.y * 2.0 - 1.0) / uProj.y, -1.0); }

  ${RAIN_GLSL}
  void main() {
    vec2 base = uView.xy + vUv * uView.zw;
    // parallax: find the plate pixel that lands here once the camera has moved (three fixed-point steps)
    vec2 p = base;
    for (int i = 0; i < 3; i++) p = base - uShift / depthAt(p);
    p = clamp(p, vec2(0.001), vec2(0.999));
    float z = depthAt(p);
    float id = idAt(p);
    float glass = texture2D(uAux, p).b;

    vec3 col = plate(p, 0.0);
    vec3 dir = mat3(uCamWorld) * viewRay(p);
    vec3 cam = uCamWorld[3].xyz;

    // ---- rain on the window glass
    if (glass > 0.02 && uRain > 0.0) {
      float tg = (uGlassZ - cam.z) / dir.z;
      vec3 hit = cam + dir * tg;
      vec2 wuv = (hit.xy - uWin.xy) / uWin.zw;
      float t = uTime * 0.35 * (1.0 - uCalm * 0.9);
      vec3 d = layer(wuv, t);
      if (uRain > 0.35) d += layer(wuv * 1.23 + 7.54, t);
      if (uRain > 0.6) d += layer(wuv * 1.35 + 1.54, t);
      if (uRain > 0.85) d += layer(wuv * 1.57 + 7.54, t);
      float st = staticDrops(wuv * vec2(1.3, 1.0), uTime) * uRain;
      float clear = clamp(d.z + st, 0.0, 1.0);
      vec2 offs = (d.xy + vec2(st) * 0.02) * vec2(0.035, 0.05) * uView.zw / max(uView.z, 0.3);
      float fog = mix(0.2 + uRain * 1.1, 0.0, clear);
      vec3 wet = plate(clamp(p + offs, 0.0, 1.0), fog);
      // a few streaks of rain falling outside, catching the light
      float fall = 0.0;
      vec2 fu = wuv * vec2(90.0, 2.2) + vec2(0.0, uTime * 3.4 * (1.0 - uCalm));
      float lane = h21(vec2(floor(fu.x), 3.0));
      fall = step(0.82, lane) * smoothstep(0.65, 1.0, fract(fu.y + lane * 9.0)) * smoothstep(0.5, 0.0, abs(fract(fu.x) - 0.5)) * uRain * 0.06;
      vec3 rainy = wet * (0.92 + clear * 0.12) + fall * (0.6 + dot(col, vec3(0.33)));
      col = mix(col, rainy, glass);
      col += glass * uFlash * vec3(0.32, 0.36, 0.45);
    }

    // ---- live light: the lamp's own contribution (switch, flicker), neon stutter, lightning
    vec3 fx = fxAt(p) * uFxOn;
    // lamp: switching it on adds its warm light; switching it off takes its share away, keeping the hue of what remains
    if (uLamp >= 0.0) col += fx.r * uLamp * uLampTint;
    else col *= 1.0 + uLamp * clamp(fx.r / max(dot(col, vec3(0.3, 0.55, 0.15)), 0.004), 0.0, 1.0);
    vec3 world = cam + dir * z;
    vec3 neonTint = mix(vec3(0.25, 1.15, 0.8), vec3(1.25, 0.35, 0.5), smoothstep(WINX0, WINX1, world.x));
    col += fx.g * 0.5 * (uNeon - 1.0) * neonTint;
    col += fx.b * uFlash * vec3(0.85, 0.9, 1.05);

    bool ceiling = abs(id - 8.0) < 0.5;
    bool wall = abs(id - 11.0) < 0.5;
    // ---- headlights from the road below sweep across the ceiling (evening and night)
    if (uHead > 0.0 && (ceiling || (wall && world.y > 2.0))) {
      float along = world.x - mix(-5.0, 5.0, uHeadPhase) * uHeadDir - (world.z - BACKZ) * 0.6 * uHeadDir;
      float beam = smoothstep(0.7, 0.0, abs(along)) * exp(-(world.z - BACKZ) * 0.45);
      beam *= ceiling ? 1.0 : smoothstep(2.0, 2.9, world.y) * 0.5;
      col += beam * uHead * vec3(1.0, 0.92, 0.78) * 0.22;
    }
    // ---- the fan's blades turning in the light: a soft rotating shadow on the ceiling
    if (ceiling) {
      vec2 r = world.xz - uFan.xz;
      float rl = length(r);
      float a = atan(r.y, r.x) + uFanAngle;
      float blades = pow(max(0.0, cos(a * 3.0)), 6.0) * smoothstep(1.1, 0.35, rl) * smoothstep(0.08, 0.2, rl);
      col *= 1.0 - blades * 0.16 * uDayLight;
    }

    // ---- hover: the thing under the pointer warms and gets a rim
    if (uHoverAmt > 0.001) {
      float h = uHover;
      bool on = abs(id - h) < 0.5 || (h == 7.0 && abs(id - 10.0) < 0.5) || (h == 2.0 && abs(id - 9.0) < 0.5);
      if (on) {
        col = col * (1.0 + 0.22 * uHoverAmt) + vec3(0.07, 0.035, 0.0) * uHoverAmt;
        vec2 e = 1.0 / uAuxSize;
        float edge = 0.0;
        for (int k = 0; k < 4; k++) {
          vec2 o = k == 0 ? vec2(e.x, 0.0) : k == 1 ? vec2(-e.x, 0.0) : k == 2 ? vec2(0.0, e.y) : vec2(0.0, -e.y);
          float n2 = idAt(p + o);
          bool same = abs(n2 - id) < 0.5 || (h == 7.0 && abs(n2 - 10.0) < 0.5) || (h == 7.0 && abs(n2 - 7.0) < 0.5) || (h == 2.0 && (abs(n2 - 9.0) < 0.5 || abs(n2 - 2.0) < 0.5));
          edge += same ? 0.0 : 1.0;
        }
        col += min(edge, 1.0) * vec3(1.0, 0.6, 0.27) * 0.28 * uHoverAmt;
      }
    }

    // film grain and a breath of vignette
    float g = h21(gl_FragCoord.xy + fract(uTime * 7.3) * 91.0) - 0.5;
    col += g * uGrain;
    vec2 vc = vUv - 0.5;
    col *= 1.0 - dot(vc, vc) * 0.35;

    gl_FragColor = vec4(max(col, 0.0), uOpacity);
    // depth for the live layer: pushed back a little so cards and decals win against the coarse map
    float zd = z + 0.03;
    float n = uClip.x, f = uClip.y;
    float ndc = (f + n) / (f - n) - 2.0 * f * n / ((f - n) * zd);
    gl_FragDepth = glass > 0.5 || z > 30.0 ? 0.99999 : clamp(ndc * 0.5 + 0.5, 0.0, 0.99999);
  }`;

function loadTex(url, { mip = true, srgb = false } = {}) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.generateMipmaps = mip;
      t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.flipY = true;
      resolve(t);
    }, undefined, () => reject(new Error(`office: ${url}`)));
  });
}

let manifest = null;
export function loadManifest() {
  if (!manifest) {
    manifest = fetch(`${BASE}plates.json`, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error('office: plates.json');
      return r.json();
    }).catch((e) => { manifest = null; throw e; });
  }
  return manifest;
}

export class PlateRoom {
  constructor() {
    this.uniforms = {
      uPlateA: { value: null }, uPlateB: { value: null }, uFxA: { value: null }, uFxB: { value: null }, uAux: { value: null },
      uMix: { value: 0 },
      uView: { value: new THREE.Vector4(0, 0, 1, 1) },
      uShift: { value: new THREE.Vector2() },
      uDepth: { value: new THREE.Vector2(0.3, 7) },
      uAuxSize: { value: new THREE.Vector2(1, 1) },
      uCamWorld: { value: new THREE.Matrix4() },
      uProj: { value: new THREE.Vector2(1, 1) },
      uClip: { value: new THREE.Vector2(0.05, 60) },
      uWin: { value: new THREE.Vector4(WIN.x - WIN.w / 2, WIN.y - WIN.h / 2, WIN.w, WIN.h) },
      uGlassZ: { value: GLASS_Z },
      uFan: { value: new THREE.Vector3(...FAN.pos) },
      uTime: { value: 0 }, uRain: { value: 0.6 }, uLamp: { value: 0 }, uNeon: { value: 1 }, uFlash: { value: 0 },
      uHover: { value: -1 }, uHoverAmt: { value: 0 }, uFanAngle: { value: 0 }, uHead: { value: 0 }, uHeadPhase: { value: 0 }, uHeadDir: { value: 1 },
      uCalm: { value: 0 }, uOpacity: { value: 1 }, uGrain: { value: 0.018 }, uDayLight: { value: 1 }, uFxOn: { value: 1 },
      uLampTint: { value: new THREE.Vector3(1.25, 0.95, 0.62) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vert,
      fragmentShader: frag.replace(/WINX0/g, (WIN.x + 0.2).toFixed(2)).replace(/WINX1/g, (WIN.x + 0.9).toFixed(2)).replace(/BACKZ/g, BACK.toFixed(2)),
      depthTest: true,
      depthWrite: true,
      depthFunc: THREE.AlwaysDepth,
      toneMapped: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -100;
    this.sets = new Map();
    this.aux = new Map();
  }

  /** Load one time of day in one orientation: { plate, fx, aux, meta }. Cached. */
  async load(period, orient) {
    const key = `${period}_${orient}`;
    if (this.sets.has(key)) return this.sets.get(key);
    const job = (async () => {
      const m = await loadManifest();
      const meta = m.plates[key];
      if (!meta) throw new Error(`office: no plate ${key}`);
      const v = m.version ? `?v=${m.version}` : '';
      if (!this.aux.has(orient)) this.aux.set(orient, loadTex(`${BASE}aux_${orient}.webp${v}`, { mip: false }));
      const [plate, fx, aux] = await Promise.all([
        loadTex(`${BASE}plate_${key}.webp${v}`),
        loadTex(`${BASE}fx_${key}.webp${v}`, { mip: false }),
        this.aux.get(orient),
      ]);
      return { key, period, orient, plate, fx, aux, meta, depth: m.depth || [0.3, 7], boardLum: boardLuminance(plate.image, meta) };
    })();
    this.sets.set(key, job);
    job.catch(() => this.sets.delete(key));
    return job;
  }

  /** Show set `a`, or crossfade from a to b with uMix. */
  show(a, b = null) {
    const u = this.uniforms;
    u.uPlateA.value = a.plate;
    u.uFxA.value = a.fx;
    u.uAux.value = a.aux;
    u.uAuxSize.value.set(a.aux.image.width, a.aux.image.height);
    u.uDepth.value.set(...a.depth);
    u.uPlateB.value = b ? b.plate : a.plate;
    u.uFxB.value = b ? b.fx : a.fx;
    if (!b) u.uMix.value = 0;
    this.current = a;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    for (const job of this.sets.values()) job.then((s) => { s.plate.dispose(); s.fx.dispose(); }).catch(() => {});
    for (const job of this.aux.values()) job.then((t) => t.dispose()).catch(() => {});
  }
}

/** Average display luminance of the cork in a plate: the reference the live cards are lit against. */
function boardLuminance(img, meta) {
  try {
    if (!meta.board) return 0.35;
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, 64, 64);
    const [u0, v0, u1, v1] = meta.board; // plate uv (y down) of the cork's corners, inset
    const d = g.getImageData(Math.floor(u0 * 64), Math.floor(v0 * 64), Math.max(1, Math.ceil((u1 - u0) * 64)), Math.max(1, Math.ceil((v1 - v0) * 64))).data;
    let s = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { s += (d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15) / 255; n++; }
    return n ? s / n : 0.35;
  } catch {
    return 0.35;
  }
}

export { BOARD };
