// Rain-streaked window glass: drops slide down and refract a blurred KL skyline.
import * as THREE from 'three';

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

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.35;
    vec3 d = layer(uv, t);
    d += layer(uv * 1.23 + 7.54, t);
    d += layer(uv * 1.35 + 1.54, t);
    d += layer(uv * 1.57 + 7.54, t);
    float clear = clamp(d.z, 0.0, 1.0);
    float blur = mix(5.5, 0.6, clear);
    vec3 col = textureLod(uCity, uv + d.xy * 1.2, blur).rgb;
    col *= 0.85 + clear * 0.35;
    col += uFlash * vec3(0.55, 0.6, 0.75);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function rainWindowMaterial(cityTexture) {
  return new THREE.ShaderMaterial({
    uniforms: { uCity: { value: cityTexture }, uTime: { value: 0 }, uFlash: { value: 0 } },
    vertexShader,
    fragmentShader,
  });
}
