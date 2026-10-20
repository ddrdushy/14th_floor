// Image lookup with a graceful fallback while art is still being generated.
import { h } from './ui.js';

const cache = new Map();

export const imgUrl = (key) => `assets/img/${key}.jpg`;

/** Resolves true when the image for this key exists. */
export function hasImage(key) {
  if (!key) return Promise.resolve(false);
  if (cache.has(key)) return cache.get(key);
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imgUrl(key);
  });
  cache.set(key, p);
  return p;
}

const PALETTES = {
  night: ['#0d1620', '#1f3342', '#e8a33d'],
  fire: ['#1a0a05', '#7a2a0c', '#ffb347'],
  warm: ['#24170e', '#6b4626', '#f1c27d'],
  police: ['#0b1220', '#1d2c4a', '#d8323d'],
  day: ['#2a3640', '#6d8796', '#ede6d6'],
};

/** A moody stand-in panel so every scene still reads before its art exists. */
export function placeholderArt(label = '', mood = 'night') {
  const [a, b, c] = PALETTES[mood] || PALETTES.night;
  const el = h('div', { class: 'ph-art', style: { background: `radial-gradient(ellipse at 65% 35%, ${b} 0%, ${a} 70%)` } });
  el.innerHTML = `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;opacity:.55">
    <g fill="${a}">
      <rect x="10" y="150" width="50" height="150"/><rect x="70" y="120" width="40" height="180"/>
      <rect x="250" y="135" width="60" height="165"/><rect x="320" y="100" width="45" height="200"/>
      <path d="M150 300 L158 80 L166 300Z M190 300 L198 80 L206 300Z"/>
      <rect x="157" y="160" width="42" height="4"/>
    </g>
    <g fill="${c}" opacity=".5">
      ${Array.from({ length: 40 }, (_, i) => `<rect x="${(i * 53) % 360 + 15}" y="${150 + ((i * 37) % 130)}" width="3" height="4"/>`).join('')}
    </g>
  </svg>`;
  el.append(h('div', { class: 'ph-art-label' }, label));
  return el;
}

/** Fill an element with the image if present, else with the placeholder. */
export async function paintInto(el, key, label, mood) {
  el.style.backgroundImage = '';
  el.querySelector('.ph-art')?.remove();
  if (await hasImage(key)) {
    el.style.backgroundImage = `url(${imgUrl(key)})`;
  } else {
    el.append(placeholderArt(label, mood));
  }
}
