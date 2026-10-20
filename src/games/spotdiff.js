// Spot the difference between two procedurally drawn photographs of the balcony.
import { h } from '../core/ui.js';
import { shuffle, randInt, pick } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'spotdiff', name: 'Spot the Difference', category: 'Observation' };

const W = 480, H = 360;

// Each object: { id, kind, x, y, s, fill, hidden }
function baseScene(rng) {
  const objs = [];
  const add = (kind, x, y, s, fill, extra = {}) => objs.push({ id: `${kind}${objs.length}`, kind, x, y, s, fill, ...extra });
  // background building windows across the street
  for (let i = 0; i < 14; i++) {
    const lit = rng() < 0.55;
    add('window', 24 + (i % 7) * 64, 34 + Math.floor(i / 7) * 54, 1, lit ? '#e8b25a' : '#2a3a48');
  }
  add('moon', 400, 40, 1, '#d8dfe6');
  add('lantern', 70, 150, 1, '#c8312c');
  add('lantern', 410, 150, 1, '#c8312c');
  add('pot', 52, 268, 1, '#8a4b2a');
  add('plant', 52, 238, 1, '#3d6b45');
  add('pot', 420, 272, 0.9, '#6b4a3a');
  add('plant', 420, 244, 0.9, '#4e7a3a');
  add('chair', 300, 262, 1, '#9a7a4a', { tilt: 18 });
  add('table', 180, 262, 1, '#6a5038');
  add('cup', 172, 226, 1, '#ede6d6');
  add('ashtray', 198, 230, 1, '#7a8288');
  add('slipper', 118, 318, 1, '#2f4f6f', { rot: -15 });
  add('slipper', 146, 326, 1, '#2f4f6f', { rot: 10 });
  add('print', 252, 316, 1, '#141414', { rot: 30 });
  add('print', 276, 300, 1, '#141414', { rot: 30 });
  add('print', 300, 286, 1, '#141414', { rot: 30 });
  add('towel', 360, 196, 1, '#e5d7b8');
  add('umbrella', 450, 304, 1, '#1f3b2c');
  add('coin', 238, 197, 1, '#c9a43a');
  add('paper', 240, 190, 1, '#f3ecda');
  add('clock', 132, 96, 1, '#ede6d6', { hand: 52 });
  return objs;
}

const MUTATIONS = ['remove', 'color', 'move', 'scale', 'rotate'];
const ALT_COLORS = ['#3d6b9a', '#b3202a', '#e8a33d', '#5a8a5a', '#d8cfc0', '#444', '#7a3a7a'];

function mutate(rng, objs, count) {
  const copy = objs.map((o) => ({ ...o }));
  const diffs = [];
  const candidates = shuffle(rng, copy.filter((o) => o.kind !== 'window' || rng() < 0.3));
  for (const o of candidates) {
    if (diffs.length >= count) break;
    if (diffs.some((d) => Math.hypot(d.x - o.x, d.y - o.y) < 36)) continue;
    let m = pick(rng, MUTATIONS);
    if (o.kind === 'clock') m = 'hand';
    // windows are drawn at a fixed size, so only a light switched on/off or a missing pane shows
    if (o.kind === 'window') m = m === 'remove' ? 'remove' : 'light';
    if (m === 'light') o.fill = o.fill === '#e8b25a' ? '#2a3a48' : '#e8b25a';
    if (m === 'rotate' && o.rot === undefined && o.tilt === undefined) m = 'color';
    if (m === 'color') o.fill = pick(rng, ALT_COLORS.filter((c) => c !== o.fill));
    if (m === 'remove') o.hidden = true;
    if (m === 'move') o.x += pick(rng, [-1, 1]) * randInt(rng, 14, 20);
    if (m === 'scale') o.s *= pick(rng, [0.7, 1.35]);
    if (m === 'rotate') { if (o.rot !== undefined) o.rot += 70; else o.tilt += 30; }
    if (m === 'hand') o.hand += 140;
    const off = o.kind === 'window' ? [17, 19] : [0, 0];
    diffs.push({ id: o.id, x: o.x + off[0], y: o.y + off[1], kind: o.kind, m });
  }
  return { copy, diffs };
}

function shape(o) {
  if (o.hidden) return '';
  const t = `translate(${o.x} ${o.y}) scale(${o.s})`;
  switch (o.kind) {
    case 'window': return `<rect x="${o.x}" y="${o.y}" width="34" height="38" fill="${o.fill}" stroke="#101820" stroke-width="3"/>`;
    case 'moon': return `<circle cx="${o.x}" cy="${o.y}" r="${20 * o.s}" fill="${o.fill}"/><circle cx="${o.x + 8}" cy="${o.y - 4}" r="${16 * o.s}" fill="#1a2430"/>`;
    case 'lantern': return `<g transform="${t}"><line x1="0" y1="-40" x2="0" y2="-20" stroke="#222"/><ellipse rx="16" ry="20" fill="${o.fill}"/><rect x="-8" y="18" width="16" height="5" fill="#e8a33d"/><path d="M-6 23 v12 M0 23 v14 M6 23 v12" stroke="#e8a33d"/></g>`;
    case 'pot': return `<g transform="${t}"><path d="M-22 -14 L22 -14 L16 22 L-16 22Z" fill="${o.fill}"/></g>`;
    case 'plant': return `<g transform="${t}" fill="${o.fill}"><ellipse cx="-10" cy="-6" rx="8" ry="22" transform="rotate(-25)"/><ellipse cx="10" cy="-6" rx="8" ry="22" transform="rotate(25)"/><ellipse cx="0" cy="-14" rx="7" ry="24"/></g>`;
    case 'chair': return `<g transform="${t} rotate(${o.tilt})"><rect x="-26" y="-6" width="52" height="8" fill="${o.fill}"/><rect x="-26" y="-50" width="8" height="48" fill="${o.fill}"/><rect x="-24" y="0" width="6" height="34" fill="${o.fill}"/><rect x="18" y="0" width="6" height="34" fill="${o.fill}"/></g>`;
    case 'table': return `<g transform="${t}"><ellipse cx="0" cy="-30" rx="40" ry="9" fill="${o.fill}"/><rect x="-4" y="-30" width="8" height="58" fill="${o.fill}"/><rect x="-20" y="26" width="40" height="5" fill="${o.fill}"/></g>`;
    case 'cup': return `<g transform="${t}"><rect x="-7" y="-8" width="14" height="14" rx="2" fill="${o.fill}"/><path d="M7 -4 q7 3 0 8" stroke="${o.fill}" stroke-width="2" fill="none"/></g>`;
    case 'ashtray': return `<g transform="${t}"><ellipse rx="10" ry="4" fill="${o.fill}"/><rect x="2" y="-6" width="12" height="2" fill="#ddd" transform="rotate(-20)"/></g>`;
    case 'slipper': return `<g transform="${t} rotate(${o.rot})"><ellipse rx="9" ry="20" fill="${o.fill}"/><path d="M-9 -4 q9 -9 18 0" stroke="#e8e0d0" stroke-width="3" fill="none"/></g>`;
    case 'print': return `<g transform="${t} rotate(${o.rot})" fill="${o.fill}" opacity=".75"><ellipse cx="0" cy="-6" rx="7" ry="11"/><ellipse cx="0" cy="11" rx="5" ry="5"/></g>`;
    case 'towel': return `<g transform="${t}"><line x1="-50" y1="-22" x2="50" y2="-22" stroke="#444" stroke-width="2"/><path d="M-22 -22 h44 v46 l-10 -6 l-12 6 l-10 -6 l-12 6Z" fill="${o.fill}"/><rect x="-22" y="-8" width="44" height="5" fill="#b3202a" opacity=".6"/></g>`;
    case 'umbrella': return `<g transform="${t}"><path d="M0 -50 L-10 30 L10 30Z" fill="${o.fill}"/><path d="M0 30 v14 q0 6 -6 6" stroke="#222" stroke-width="3" fill="none"/></g>`;
    case 'coin': return `<g transform="${t}"><circle r="5" fill="${o.fill}" stroke="#8a6a1a"/></g>`;
    case 'paper': return `<g transform="${t}"><path d="M-12 6 L0 -12 L12 6 L6 2 L0 8 L-6 2Z" fill="${o.fill}" stroke="#b9a272"/></g>`;
    case 'clock': {
      const a = (o.hand * Math.PI) / 180;
      return `<g transform="${t}"><circle r="22" fill="${o.fill}" stroke="#222" stroke-width="3"/><line x1="0" y1="0" x2="0" y2="-15" stroke="#222" stroke-width="3"/><line x1="0" y1="0" x2="${Math.sin(a) * 18}" y2="${-Math.cos(a) * 18}" stroke="#b3202a" stroke-width="2"/></g>`;
    }
    default: return '';
  }
}

function sceneSvg(objs, label) {
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
    <rect width="${W}" height="${H}" fill="#1a2430"/>
    <rect x="0" y="0" width="${W}" height="140" fill="#22303d"/>
    ${objs.filter((o) => o.kind === 'window' || o.kind === 'moon').map(shape).join('')}
    <rect x="0" y="140" width="${W}" height="220" fill="#5b6a70"/>
    <g stroke="#4b585e">${Array.from({ length: 12 }, (_, i) => `<line x1="${i * 44}" y1="200" x2="${i * 44 - 30}" y2="${H}"/>`).join('')}<line x1="0" y1="250" x2="${W}" y2="250"/><line x1="0" y1="300" x2="${W}" y2="300"/></g>
    <rect x="0" y="180" width="${W}" height="10" fill="#2b3338"/>
    <g fill="#2b3338">${Array.from({ length: 25 }, (_, i) => `<rect x="${i * 20}" y="140" width="4" height="44"/>`).join('')}</g>
    <rect x="0" y="136" width="${W}" height="8" fill="#39444a"/>
    ${objs.filter((o) => o.kind !== 'window' && o.kind !== 'moon').map(shape).join('')}
  </svg>`;
}

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const base = baseScene(rng);
  const { copy, diffs } = mutate(rng, base, params.differences || 9);
  const found = new Set(saved?.found || []);
  let misses = saved?.misses || 0;

  const left = h('div', { class: 'sd-photo' });
  const right = h('div', { class: 'sd-photo' });
  left.innerHTML = sceneSvg(base, "Rachel's photo, 12:05 AM");
  right.innerHTML = sceneSvg(copy, 'Police photo, 12:40 AM');
  const counter = h('p', { class: 'doc' });
  const status = h('p', { class: 'feedback' });
  el.append(
    h('p', { class: 'game-rules' }, 'Tap a difference on either photo. Careless taps are noted in your file.'),
    h('div', { class: 'sd-pair' },
      h('figure', {}, left, h('figcaption', { class: 'doc' }, "Rachel's photo, 12:05 AM")),
      h('figure', {}, right, h('figcaption', { class: 'doc' }, 'Police photo, 12:40 AM'))),
    counter, status,
  );

  const markers = [left, right].map((ph) => {
    const svg = ph.querySelector('svg');
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.append(g);
    return g;
  });

  function draw() {
    markers.forEach((g) => {
      g.innerHTML = diffs.filter((d) => found.has(d.id)).map((d) => `<circle cx="${d.x}" cy="${d.y}" r="26" fill="none" stroke="#d8323d" stroke-width="4"/>`).join('');
    });
    counter.textContent = `${found.size} of ${diffs.length} differences found · ${misses} careless ${misses === 1 ? 'tap' : 'taps'}`;
    ctx.onProgress(found.size / diffs.length);
    if (found.size === diffs.length) {
      status.textContent = 'Every change is marked. Someone cleaned this balcony before the police photographer arrived.';
      status.className = 'feedback is-good';
      ctx.onSolved();
    }
  }

  const onTap = (ph) => (e) => {
    const svg = ph.querySelector('svg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const hit = diffs.find((d) => !found.has(d.id) && Math.hypot(d.x - p.x, d.y - p.y) < 30);
    if (hit) {
      found.add(hit.id);
      sfx.good();
    } else if (!diffs.some((d) => Math.hypot(d.x - p.x, d.y - p.y) < 30)) {
      misses++;
      sfx.bad();
      const g = markers[ph === left ? 0 : 1];
      const x = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      x.setAttribute('x', p.x - 8); x.setAttribute('y', p.y + 8); x.setAttribute('fill', '#e8a33d'); x.setAttribute('font-size', '26');
      x.textContent = '×';
      g.append(x);
      setTimeout(() => x.remove(), 700);
      return;
    }
    ctx.onSave({ found: [...found], misses });
    draw();
  };
  left.addEventListener('click', onTap(left));
  right.addEventListener('click', onTap(right));
  draw();

  return {
    hint() {
      const d = diffs.find((x) => !found.has(x.id));
      if (!d) return null;
      const area = d.y < 140 ? 'top' : d.y < 250 ? 'middle' : 'bottom';
      const side = d.x < 160 ? 'left' : d.x < 320 ? 'centre' : 'right';
      return `Look at the ${area} ${side} of the photo.`;
    },
    devSolve() {
      diffs.forEach((d) => found.add(d.id));
      draw();
    },
  };
}
