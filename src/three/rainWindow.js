// Rain-streaked window glass: drops slide down and refract the KL skyline behind them.
// Traffic crawls along the roads far below, and the mamak's neon sign bleeds up from under the sill.
import * as THREE from 'three';
import { CITY_ROADS } from './textures.js';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uCity;
  uniform float uTime;
  uniform float uFlash;
  uniform float uNeon;
  uniform vec3 uRoads;
  varying vec2 vUv;

  float h21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

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
    vec2 offs = drop * dropPos + trail * trailPos;
    return vec3(offs, fogTrail + drop);
  }

  // one lane of cars: short streaks that drift along x, some cells empty
  vec3 lane(vec2 p, float y, float thick, float dir, float speed, vec3 col, float seed) {
    float d = abs(p.y - y);
    float band = smoothstep(thick, 0.0, d);
    float x = p.x * 26.0 + dir * uTime * speed + seed;
    float cell = floor(x);
    float on = step(0.45, h21(vec2(cell, seed)));
    float f = fract(x);
    float car = smoothstep(0.0, 0.08, f) * smoothstep(0.32, 0.12, f);
    return col * band * car * on;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.35;
    vec3 d = layer(uv, t);
    d += layer(uv * 1.23 + 7.54, t);
    d += layer(uv * 1.35 + 1.54, t);
    d += layer(uv * 1.57 + 7.54, t);
    float clear = clamp(d.z, 0.0, 1.0);
    vec2 cuv = uv + d.xy * 1.1;
    // misted glass between the drops, clear inside them
    float blur = mix(2.2, 0.0, clear);
    vec3 col = textureLod(uCity, cuv, blur).rgb;

    // traffic far below: tail lights one way, headlights the other
    vec3 traffic = vec3(0.0);
    traffic += lane(cuv, uRoads.x + 0.004, 0.004, 1.0, 0.9, vec3(1.0, 0.18, 0.12), 3.0);
    traffic += lane(cuv, uRoads.x - 0.004, 0.004, -1.0, 1.1, vec3(1.0, 0.85, 0.6), 7.0);
    traffic += lane(cuv, uRoads.y + 0.005, 0.005, -1.0, 0.7, vec3(1.0, 0.2, 0.15), 11.0);
    traffic += lane(cuv, uRoads.y - 0.005, 0.005, 1.0, 0.8, vec3(1.0, 0.9, 0.7), 17.0);
    traffic += lane(cuv, uRoads.z + 0.006, 0.006, 1.0, 0.55, vec3(1.0, 0.85, 0.65), 23.0);
    traffic += lane(cuv, uRoads.z - 0.006, 0.006, -1.0, 0.6, vec3(1.0, 0.16, 0.12), 29.0);
    col += traffic * mix(0.55, 1.0, clear);

    // lit windows flicker now and then
    vec2 cellId = floor(cuv * vec2(220.0, 160.0));
    float tw = step(0.996, h21(cellId + floor(uTime * 0.25)));
    col += tw * col * 0.6;

    col *= 0.9 + clear * 0.3;
    col *= 1.12;
    // the mamak's neon below the sill, smeared up the wet glass
    float neon = smoothstep(0.32, 0.0, uv.y) * uNeon;
    col += neon * mix(vec3(0.05, 0.75, 0.5), vec3(0.9, 0.15, 0.2), smoothstep(0.35, 0.75, uv.x)) * (0.28 + clear * 0.35);
    col += uFlash * vec3(0.55, 0.6, 0.75);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function rainWindowMaterial(cityTexture) {
  const H = 1120;
  const roads = CITY_ROADS.map((y) => 1 - y / H);
  return new THREE.ShaderMaterial({
    uniforms: {
      uCity: { value: cityTexture },
      uTime: { value: 0 },
      uFlash: { value: 0 },
      uNeon: { value: 0.8 },
      uRoads: { value: new THREE.Vector3(...roads) },
    },
    vertexShader,
    fragmentShader,
  });
}
