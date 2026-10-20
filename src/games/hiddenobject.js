// Hidden objects: a cluttered, procedurally drawn scene with 40 to 80 small things in it.
// Find every item on the list. Some are tiny, some are half under paper.
// Variant 'silhouette' shows the list as outlines only, without names.
import { h } from '../core/ui.js';
import { shuffle, pick, randInt } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { icon, iconSvg } from './_icons_c.js';

export const meta = { id: 'hiddenobject', name: 'Hidden Objects', category: 'Observation' };
export const demo = { variant: 'list', params: { scene: 'desk', targets: 12, objects: 66 } };

const W = 800, H = 560;
const NAMES = {
  key: 'brass key', coin: '50 sen coin', pen: 'fountain pen', pencil: 'pencil', phone: 'mobile phone', lighter: 'lighter',
  matchbox: 'matchbox', glasses: 'spectacles', watch: 'wristwatch', ring: 'diamond ring', paperclip: 'paper clip',
  scissors: 'scissors', knife: 'knife', bullet: 'bullet', cassette: 'cassette tape', usb: 'USB stick', envelope: 'envelope',
  stamp: 'postage stamp', button: 'button', battery: 'battery', lock: 'padlock', teacup: 'cup of teh', spoon: 'spoon',
  fork: 'fork', chili: 'chilli', egg: 'egg', bottle: 'bottle', can: 'drink can', card: 'playing card', dice: 'dice',
  comb: 'comb', lipstick: 'lipstick', badge: 'police badge', magnifier: 'magnifying glass', torch: 'torch',
  screwdriver: 'screwdriver', tape: 'roll of tape', candle: 'candle', simcard: 'SIM card', ticket: 'ticket stub',
  photo: 'photograph', notebook: 'notebook', calculator: 'calculator', whistle: 'whistle', syringe: 'syringe',
  pills: 'pill bottle', mahjong: 'mahjong tile', gun: 'pistol', tie: 'necktie', cup: 'mug', bell: 'bell', hook: 'fish hook', clock: 'clock',
};
const KINDS = Object.keys(NAMES);
const ALT = ['#c8312c', '#3d6b9a', '#3f7d5a', '#e8a33d', '#7a3a7a', '#2a2d33', '#d8d4c8', '#8a9096', '#c9a43a', '#5a3a24'];
const SCENES = {
  desk: { label: "the suspect's desk", where: "on the suspect's desk", occluder: 'paper' },
  mamak: { label: 'the mamak table', where: 'on the mamak table', occluder: 'napkin' },
  boot: { label: 'the car boot', where: 'in the car boot', occluder: 'rag' },
};
const ZOOMS = [1, 1.6, 2.5, 4];
let uid = 0;

function paperSheet(x, y, w, hh, rot, fill = '#f3ecda', lines = true) {
  const rows = lines ? Array.from({ length: Math.floor((hh - 24) / 11) }, (_, i) => `<line x1="${-w / 2 + 12}" y1="${-hh / 2 + 18 + i * 11}" x2="${w / 2 - 12 - ((i * 37) % 40)}" y2="${-hh / 2 + 18 + i * 11}" stroke="#7a7466" stroke-width="2" opacity=".45"/>`).join('') : '';
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-w / 2 + 4}" y="${-hh / 2 + 5}" width="${w}" height="${hh}" fill="#000" opacity=".25"/><rect x="${-w / 2}" y="${-hh / 2}" width="${w}" height="${hh}" fill="${fill}" stroke="#b9ae95"/>${rows}</g>`;
}

function backdrop(rng, scene) {
  let s = '';
  if (scene === 'desk') {
    for (let i = 0; i < 8; i++) s += `<rect x="0" y="${i * 70}" width="${W}" height="70" fill="${pick(rng, ['#6b4a30', '#704d32', '#66472e', '#74503a'])}"/><line x1="0" y1="${i * 70}" x2="${W}" y2="${i * 70}" stroke="#3e2a1a" stroke-width="2"/>`;
    for (let i = 0; i < 40; i++) {
      const y = rng() * H, x = rng() * W, l = 60 + rng() * 200;
      s += `<path d="M${x} ${y} q${l / 2} ${(rng() - 0.5) * 8} ${l} 0" stroke="#4a3220" stroke-width="${0.6 + rng()}" fill="none" opacity=".5"/>`;
    }
    for (let i = 0; i < 3; i++) s += `<circle cx="${80 + rng() * 640}" cy="${60 + rng() * 440}" r="${22 + rng() * 8}" fill="none" stroke="#3a2210" stroke-width="3" opacity=".35"/>`;
    s += `<g transform="translate(${150 + rng() * 120} ${130 + rng() * 60}) rotate(${-8 + rng() * 6})"><rect x="-4" y="6" width="250" height="180" fill="#000" opacity=".25"/><rect x="-10" y="-14" width="80" height="20" rx="4" fill="#c9b07e"/><rect x="-10" y="0" width="250" height="180" fill="#d9c49a" stroke="#b9a272"/><text x="20" y="40" font-family="monospace" font-size="16" fill="#8a3030" opacity=".7">SULIT</text></g>`;
    for (let i = 0; i < 4; i++) s += paperSheet(80 + rng() * 640, 70 + rng() * 420, 120 + rng() * 60, 150 + rng() * 40, -25 + rng() * 50);
    s += `<rect x="${500 + rng() * 120}" y="${300 + rng() * 120}" width="170" height="110" fill="#2f4a3a" stroke="#1d2a22" stroke-width="4" transform="rotate(${-6 + rng() * 12} 600 380)"/>`;
  } else if (scene === 'mamak') {
    s += `<rect width="${W}" height="${H}" fill="#d9ddd2"/>`;
    for (let i = 0; i < 700; i++) s += `<circle cx="${(rng() * W).toFixed(1)}" cy="${(rng() * H).toFixed(1)}" r="${(0.6 + rng() * 1.4).toFixed(1)}" fill="${pick(rng, ['#9aa59a', '#b8bfb3', '#7f8a80', '#c9c0a8'])}"/>`;
    s += `<rect y="${H - 26}" width="${W}" height="26" fill="#8a9096"/><rect y="${H - 26}" width="${W}" height="4" fill="#c8ccd0"/>`;
    s += `<g transform="translate(${470 + rng() * 120} ${120 + rng() * 60}) rotate(${-10 + rng() * 20})"><rect x="-150" y="-100" width="300" height="200" fill="#000" opacity=".2" transform="translate(5 6)"/><rect x="-150" y="-100" width="300" height="200" fill="#ece6d4" stroke="#b9ae95"/><text x="-136" y="-70" font-family="serif" font-weight="700" font-size="26" fill="#2a2a2a">HARIAN KOTA</text>${Array.from({ length: 12 }, (_, i) => `<line x1="${-136 + (i % 3) * 96}" y1="${-50 + Math.floor(i / 3) * 34}" x2="${-56 + (i % 3) * 96}" y2="${-50 + Math.floor(i / 3) * 34}" stroke="#777" stroke-width="12" opacity=".25"/>`).join('')}</g>`;
    for (let i = 0; i < 3; i++) {
      const x = 110 + i * 230 + rng() * 60, y = 140 + rng() * 300, r = 68 + rng() * 18;
      s += `<circle cx="${x + 4}" cy="${y + 6}" r="${r}" fill="#000" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r}" fill="#f8f6ef" stroke="#c8ccd0" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="none" stroke="#9fc3d0" stroke-width="2"/>`;
      if (i === 1) s += `<ellipse cx="${x}" cy="${y}" rx="${r * 0.55}" ry="${r * 0.4}" fill="#e8c27a" opacity=".85"/><ellipse cx="${x + 10}" cy="${y + 6}" rx="${r * 0.3}" ry="${r * 0.18}" fill="#c8812c" opacity=".7"/>`;
    }
    s += `<path d="M40 420 Q120 360 260 400 Q330 430 300 500 Q180 540 60 500Z" fill="#3f7d3a" opacity=".9"/><path d="M60 470 Q170 420 290 450" stroke="#2e5e2a" stroke-width="3" fill="none"/>`;
    for (let i = 0; i < 5; i++) s += `<ellipse cx="${rng() * W}" cy="${rng() * H}" rx="${10 + rng() * 22}" ry="${6 + rng() * 12}" fill="#c8812c" opacity=".35"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="#4a4e54"/>`;
    for (let i = 0; i < 900; i++) s += `<rect x="${(rng() * W).toFixed(1)}" y="${(rng() * H).toFixed(1)}" width="2" height="2" fill="${pick(rng, ['#3e4247', '#565a60', '#43474c'])}"/>`;
    s += `<path d="M0 0 L70 0 L40 ${H} L0 ${H}Z" fill="#33363a"/><path d="M${W} 0 L${W - 70} 0 L${W - 40} ${H} L${W} ${H}Z" fill="#33363a"/>`;
    s += `<circle cx="${640 + rng() * 40}" cy="${110 + rng() * 30}" r="120" fill="#1d1e21"/><circle cx="${650}" cy="${120}" r="70" fill="#4a4e55"/><circle cx="650" cy="120" r="30" fill="#1d1e21"/>`;
    s += `<g transform="translate(${220 + rng() * 60} ${140 + rng() * 40}) rotate(${-6 + rng() * 12})"><rect x="-130" y="-80" width="260" height="160" fill="#000" opacity=".3" transform="translate(6 8)"/><rect x="-130" y="-80" width="260" height="160" fill="#a8824e" stroke="#7a5a30" stroke-width="3"/><path d="M-130 -80 L0 -40 L130 -80" fill="none" stroke="#7a5a30" stroke-width="3"/><text x="-40" y="40" font-family="monospace" font-size="18" fill="#5a3a20">FRAGILE</text></g>`;
    s += `<path d="M90 330 Q300 270 520 340 Q560 470 400 520 Q200 540 110 480Z" fill="#2f5a8a" opacity=".85"/><path d="M120 360 Q300 320 500 370" stroke="#244a72" stroke-width="3" fill="none"/>`;
    s += `<path d="M560 360 q60 -60 120 0 t110 30" stroke="#b3202a" stroke-width="6" fill="none"/><path d="M560 380 q70 -40 130 10 t100 20" stroke="#111" stroke-width="6" fill="none"/>`;
    s += `<rect y="${H - 30}" width="${W}" height="30" fill="#8a9096"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 42}" y="${H - 22}" width="24" height="5" fill="#6a7076"/>`).join('')}`;
  }
  return s;
}

function occluderShape(kind, x, y, rot) {
  if (kind === 'paper') return paperSheet(x, y, 86, 64, rot);
  if (kind === 'napkin') return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-40 -26 Q-10 -36 38 -28 Q46 0 36 26 Q0 36 -38 28 Q-48 0 -40 -26Z" fill="#000" opacity=".2" transform="translate(3 4)"/><path d="M-40 -26 Q-10 -36 38 -28 Q46 0 36 26 Q0 36 -38 28 Q-48 0 -40 -26Z" fill="#fbfaf5" stroke="#d0d0c8"/><path d="M-20 -10 Q0 0 22 -14 M-26 12 Q4 6 24 16" stroke="#d8d8d0" fill="none" stroke-width="2"/></g>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-42 -24 Q-6 -34 40 -24 Q48 2 38 24 Q-4 34 -40 26 Q-50 0 -42 -24Z" fill="#000" opacity=".25" transform="translate(3 4)"/><path d="M-42 -24 Q-6 -34 40 -24 Q48 2 38 24 Q-4 34 -40 26 Q-50 0 -42 -24Z" fill="#6a6e64" stroke="#4a4e44"/><path d="M-30 -8 Q0 4 30 -10 M-28 12 Q0 4 26 18" stroke="#585c52" fill="none" stroke-width="3"/></g>`;
}

export function mount(el, ctx) {
  const { rng, params, saved, variant } = ctx;
  const sil = variant === 'silhouette';
  const sceneKey = SCENES[params.scene] ? params.scene : pick(rng, Object.keys(SCENES));
  const scene = SCENES[sceneKey];
  const nTargets = Math.min(14, params.targets || 12);
  const nObjects = Math.max(40, Math.min(80, params.objects || 64));

  // ---- generate ----
  const kinds = shuffle(rng, KINDS);
  const targetKinds = kinds.slice(0, nTargets);
  const fillerKinds = kinds.slice(nTargets);
  const objs = [];
  const tooClose = (x, y, d, list) => list.some((o) => Math.hypot(o.x - x, o.y - y) < d);
  const place = (minD, among, margin = 34) => {
    for (let t = 0; t < 400; t++) {
      const x = margin + rng() * (W - margin * 2), y = margin + rng() * (H - margin * 2 - 20);
      if (!tooClose(x, y, minD, among)) return [x, y];
    }
    return [margin + rng() * (W - margin * 2), margin + rng() * (H - margin * 2)];
  };
  const tinyIdx = new Set(shuffle(rng, targetKinds.map((_, i) => i)).slice(0, 2));
  const targets = targetKinds.map((k, i) => {
    const [x, y] = place(86, objs.filter((o) => o.target));
    const o = { kind: k, x, y, s: tinyIdx.has(i) ? 0.5 + rng() * 0.1 : 0.85 + rng() * 0.3, rot: randInt(rng, -170, 170), fill: rng() < 0.4 ? pick(rng, ALT) : null, target: true };
    objs.push(o);
    return o;
  });
  const fillers = [];
  for (let i = 0; i < nObjects - nTargets; i++) {
    const [x, y] = place(30, [...fillers, ...targets.map((t) => ({ x: t.x, y: t.y }))].filter(() => true), 26);
    fillers.push({ kind: pick(rng, fillerKinds), x, y, s: 0.75 + rng() * 0.55, rot: randInt(rng, -180, 180), fill: rng() < 0.5 ? pick(rng, ALT) : null, target: false });
  }
  // draw order: shuffled, but no filler may be drawn on top of the middle of a target
  let order = shuffle(rng, [...targets, ...fillers]);
  for (const t of targets) {
    const ti = order.indexOf(t);
    const later = order.slice(ti + 1).filter((o) => !o.target && Math.hypot(o.x - t.x, o.y - t.y) < 15 * (o.s + t.s) * 0.8);
    if (later.length) {
      order = order.filter((o) => !later.includes(o));
      order.splice(order.indexOf(t), 0, ...later);
    }
  }
  // a few targets get partly covered by a sheet of paper, a napkin or a rag
  const occluders = [];
  shuffle(rng, targets.filter((t, i) => !tinyIdx.has(i))).slice(0, 3).forEach((t) => {
    for (let k = 0; k < 80; k++) {
      const a = rng() * Math.PI * 2, d = 30 + rng() * 30;
      const x = t.x + Math.cos(a) * d, y = t.y + Math.sin(a) * d;
      const rot = randInt(rng, -40, 40);
      // inside test against the occluder, approximated as a rotated 86 x 64 rectangle
      const inside = (px, py, m = 0) => {
        const c = Math.cos((-rot * Math.PI) / 180), s = Math.sin((-rot * Math.PI) / 180);
        const u = (px - x) * c - (py - y) * s, v = (px - x) * s + (py - y) * c;
        return Math.abs(u) < 43 + m && Math.abs(v) < 32 + m;
      };
      if (inside(t.x, t.y, 5)) continue;
      const ring = Array.from({ length: 8 }, (_, i) => inside(t.x + Math.cos((i * Math.PI) / 4) * 13 * t.s, t.y + Math.sin((i * Math.PI) / 4) * 13 * t.s)).filter(Boolean).length;
      if (ring < 2 || ring > 4) continue;
      if (targets.some((o) => o !== t && Math.hypot(o.x - x, o.y - y) < 70)) continue;
      occluders.push({ x, y, rot, after: t });
      break;
    }
  });
  const backdropSvg = backdrop(rng, sceneKey);

  // ---- state ----
  const found = new Set(saved?.found || []);
  let misses = saved?.misses || 0;
  let done = false;

  const id = `ho${++uid}`;
  const objMarkup = order.map((o) => {
    let m = `<g transform="translate(${o.x.toFixed(1)} ${o.y.toFixed(1)}) rotate(${o.rot}) scale(${o.s.toFixed(2)})">${icon(o.kind, o.fill)}</g>`;
    occluders.filter((c) => c.after === o).forEach((c) => { m += occluderShape(scene.occluder, c.x, c.y, c.rot); });
    return m;
  }).join('');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ho-svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Photograph of ${scene.label}, cluttered with objects`);
  svg.innerHTML = `<defs><filter id="${id}sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1.5" dy="2" stdDeviation="1.2" flood-opacity=".45"/></filter>
    <radialGradient id="${id}vg" cx="50%" cy="45%" r="70%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".45"/></radialGradient></defs>
    <g>${backdropSvg}</g><g filter="url(#${id}sh)">${objMarkup}</g>
    <rect width="${W}" height="${H}" fill="url(#${id}vg)" pointer-events="none"/>`;
  const marks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const fx = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const cursor = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  cursor.setAttribute('class', 'ho-cursor');
  svg.append(marks, fx, cursor);

  const wrap = h('div', { class: 'ho-wrap', tabindex: '0', 'aria-label': 'Scene. Arrow keys move the magnifier, Enter marks an object, plus and minus zoom.' }, svg);
  const zoomLabel = h('span', { class: 'doc ho-zoom' });
  const counter = h('span', { class: 'doc ho-count' });
  const status = h('p', { class: 'feedback' });
  const list = h('ul', { class: `ho-list${sil ? ' is-sil' : ''}` });
  const items = targets.map((t) => {
    const li = h('li', { class: 'ho-item' });
    li.innerHTML = `${iconSvg(t.kind, { size: 34, cls: sil ? 'ho-outline' : '' })}<span>${sil ? '' : NAMES[t.kind]}</span>`;
    list.append(li);
    return li;
  });

  el.append(
    h('p', { class: 'game-rules' }, sil
      ? `Find the ${nTargets} objects shown as outlines ${scene.where}. Drag to look around, zoom in for the small ones. Wrong taps go on your record.`
      : `Find the ${nTargets} listed objects ${scene.where}. Drag to look around, zoom in for the small ones. Wrong taps go on your record.`),
    wrap,
    h('div', { class: 'game-toolbar' },
      h('button', { class: 'btn btn--small', onclick: () => zoomBy(-1), 'aria-label': 'Zoom out' }, '−'),
      zoomLabel,
      h('button', { class: 'btn btn--small', onclick: () => zoomBy(1), 'aria-label': 'Zoom in' }, '+'),
      counter),
    list,
    status,
  );

  // ---- view (zoom and pan) ----
  let zi = saved?.zi || 0;
  const vb = { x: 0, y: 0, w: W, h: H };
  const cur = { x: W / 2, y: H / 2, on: false };
  function applyView() {
    const z = ZOOMS[zi];
    vb.w = W / z; vb.h = H / z;
    vb.x = Math.max(0, Math.min(W - vb.w, vb.x));
    vb.y = Math.max(0, Math.min(H - vb.h, vb.y));
    svg.setAttribute('viewBox', `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`);
    zoomLabel.textContent = `${z}×`;
    wrap.classList.toggle('is-zoomed', zi > 0);
  }
  function zoomBy(d, fxp = vb.x + vb.w / 2, fyp = vb.y + vb.h / 2) {
    const nz = Math.max(0, Math.min(ZOOMS.length - 1, zi + d));
    if (nz === zi) return;
    const rx = (fxp - vb.x) / vb.w, ry = (fyp - vb.y) / vb.h;
    zi = nz;
    const z = ZOOMS[zi];
    vb.x = fxp - rx * (W / z);
    vb.y = fyp - ry * (H / z);
    applyView();
  }
  const toScene = (e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  // ---- drawing state ----
  function drawMarks() {
    marks.innerHTML = targets.filter((t) => found.has(t.kind)).map((t) => {
      const r = 19 * t.s + 6;
      return `<circle cx="${t.x}" cy="${t.y}" r="${r}" fill="none" stroke="#d8323d" stroke-width="3.5"/><circle cx="${t.x}" cy="${t.y}" r="${r}" fill="none" stroke="#fff" stroke-width="1" opacity=".6"/>`;
    }).join('');
    items.forEach((li, i) => {
      const t = targets[i];
      const isF = found.has(t.kind);
      li.classList.toggle('is-found', isF);
      if (sil && isF) li.querySelector('span').textContent = NAMES[t.kind];
    });
    counter.textContent = `${found.size} of ${nTargets} found · ${misses} wrong ${misses === 1 ? 'tap' : 'taps'}`;
    ctx.onProgress(found.size / nTargets);
  }
  function drawCursor() {
    cursor.innerHTML = cur.on ? `<circle cx="${cur.x}" cy="${cur.y}" r="16" fill="none" stroke="#e8a33d" stroke-width="3"/><path d="M${cur.x - 24} ${cur.y} h12 M${cur.x + 12} ${cur.y} h12 M${cur.x} ${cur.y - 24} v12 M${cur.x} ${cur.y + 12} v12" stroke="#e8a33d" stroke-width="2.5"/>` : '';
  }
  function flash(markup, ms) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = markup;
    fx.append(g);
    setTimeout(() => g.remove(), ms);
  }

  function tapAt(x, y) {
    if (done) return;
    const cands = targets.filter((t) => !found.has(t.kind)).map((t) => ({ t, d: Math.hypot(t.x - x, t.y - y) })).filter((c) => c.d <= 17 * c.t.s + 9);
    if (cands.length) {
      cands.sort((a, b) => a.d - b.d);
      const t = cands[0].t;
      found.add(t.kind);
      sfx.good();
      status.textContent = `Found the ${NAMES[t.kind]}.`;
      status.className = 'feedback is-good';
    } else if (targets.some((t) => found.has(t.kind) && Math.hypot(t.x - x, t.y - y) < 17 * t.s + 9)) {
      return;
    } else {
      misses++;
      sfx.bad();
      flash(`<text x="${x - 9}" y="${y + 9}" font-size="30" font-weight="700" fill="#e8a33d" stroke="#1d1a16" stroke-width="1">×</text>`, 700);
      status.textContent = 'Nothing on the list there.';
      status.className = 'feedback is-bad';
    }
    ctx.onSave({ found: [...found], misses, zi });
    drawMarks();
    if (found.size === nTargets) {
      done = true;
      status.textContent = `Everything on the list is accounted for, with ${misses} wrong ${misses === 1 ? 'tap' : 'taps'}.`;
      status.className = 'feedback is-good';
      ctx.onProgress(1);
      ctx.onSolved();
    }
  }

  // ---- pointer: tap to mark, drag to pan, pinch or wheel to zoom ----
  const pointers = new Map();
  let drag = null, pinch = null;
  wrap.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    wrap.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      drag = null;
    } else drag = { sx: e.clientX, sy: e.clientY, vx: vb.x, vy: vb.y, moved: false };
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d / pinch.d > 1.35) { const p = toScene({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }); zoomBy(1, p.x, p.y); pinch.d = d; }
      else if (d / pinch.d < 0.74) { zoomBy(-1); pinch.d = d; }
      return;
    }
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (Math.hypot(dx, dy) > 6) drag.moved = true;
    if (drag.moved && zi > 0) {
      const k = vb.w / svg.clientWidth;
      vb.x = drag.vx - dx * k;
      vb.y = drag.vy - dy * k;
      applyView();
    }
  });
  const end = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pinch) { if (pointers.size < 2) pinch = null; drag = null; return; }
    if (drag && !drag.moved && e.type === 'pointerup') {
      const p = toScene(e);
      cur.on = false; drawCursor();
      tapAt(p.x, p.y);
    }
    drag = null;
  };
  wrap.addEventListener('pointerup', end);
  wrap.addEventListener('pointercancel', end);
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = toScene(e);
    zoomBy(e.deltaY < 0 ? 1 : -1, p.x, p.y);
  }, { passive: false });

  // ---- keyboard: a magnifier cursor ----
  wrap.addEventListener('keydown', (e) => {
    const step = (e.shiftKey ? 40 : 12) / ZOOMS[zi];
    const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (mv) {
      e.preventDefault();
      if (!cur.on) { cur.on = true; cur.x = vb.x + vb.w / 2; cur.y = vb.y + vb.h / 2; }
      cur.x = Math.max(0, Math.min(W, cur.x + mv[0] * step));
      cur.y = Math.max(0, Math.min(H, cur.y + mv[1] * step));
      if (cur.x < vb.x + 20 || cur.x > vb.x + vb.w - 20) vb.x = cur.x - vb.w / 2;
      if (cur.y < vb.y + 20 || cur.y > vb.y + vb.h - 20) vb.y = cur.y - vb.h / 2;
      applyView();
      drawCursor();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!cur.on) { cur.on = true; cur.x = vb.x + vb.w / 2; cur.y = vb.y + vb.h / 2; drawCursor(); return; }
      tapAt(cur.x, cur.y);
    } else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1, cur.on ? cur.x : undefined, cur.on ? cur.y : undefined); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(-1); }
  });
  wrap.addEventListener('blur', () => { cur.on = false; drawCursor(); });

  applyView();
  drawMarks();

  return {
    hint() {
      const t = targets.find((o) => !found.has(o.kind));
      if (!t) return null;
      const a = rng() * Math.PI * 2, off = 30 + rng() * 40;
      const cx = Math.max(60, Math.min(W - 60, t.x + Math.cos(a) * off)), cy = Math.max(60, Math.min(H - 60, t.y + Math.sin(a) * off));
      flash(`<circle cx="${cx}" cy="${cy}" r="110" fill="#e8a33d" fill-opacity=".12" stroke="#e8a33d" stroke-width="4" stroke-dasharray="10 8"/>`, 6000);
      const vert = t.y < H / 3 ? 'top' : t.y < (2 * H) / 3 ? 'middle' : 'bottom';
      const horiz = t.x < W / 3 ? 'left' : t.x < (2 * W) / 3 ? 'centre' : 'right';
      return `The ${NAMES[t.kind]} is somewhere in the ${vert} ${horiz}, inside the marked circle.`;
    },
    devSolve() {
      targets.forEach((t) => found.add(t.kind));
      found.delete(targets[0].kind);
      tapAt(targets[0].x, targets[0].y);
    },
    // exposed for automated tests
    _targets: () => targets.map((t) => ({ kind: t.kind, x: t.x, y: t.y })),
  };
}
