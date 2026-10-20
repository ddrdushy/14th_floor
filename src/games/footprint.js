// Shoe print comparison. Soles are drawn procedurally (chevrons, rings, brogue perforations,
// hexagons, bars, waffle, zigzag), and every individual shoe carries its own wear and cuts.
// Step 1: name the tread. Step 2: overlay the muddy lift on seized shoes and find the one whose
// cuts and wear line up. Variant 'size': the print is full length beside a scale, so you also
// read the outsole length and work out the UK size.
import { h } from '../core/ui.js';
import { shuffle, pick, randInt } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'footprint', name: 'Shoe Print', category: 'Forensics' };
export const demo = { variant: 'classic', params: { shoes: 8 } };

const PX_CM = 11; // canvas pixels per centimetre
const SIZES = [6, 7, 8, 9, 10, 11];
const lower1 = (t) => t[0].toLowerCase() + t.slice(1);
const lengthCm = (uk) => 27 + (uk - 6) * 0.85;
const PATTERNS = {
  chevron: { label: 'Chevrons', note: 'rows of V shapes' },
  circles: { label: 'Rings', note: 'rows of small rings' },
  brogue: { label: 'Brogue', note: 'smooth sole, punched dots in a wingtip curve' },
  hex: { label: 'Hexagons', note: 'a honeycomb of six-sided cells' },
  bars: { label: 'Bars', note: 'straight bars across the sole' },
  waffle: { label: 'Waffle', note: 'a grid of square blocks' },
  zigzag: { label: 'Zigzag', note: 'continuous zigzag lines' },
};
const BRANDS = ['Kasut Raja', 'Tiger Tread', 'Lorong', 'Bata Jaya', 'Pacer 9', 'Sentul Works', 'Monsun', 'Kampung Kick'];
const OWNERS = ['Seized from Azman Yusof', 'Seized from Lim Wei Jie', 'Seized from R. Selvam', 'Seized from Tan Ah Kow', 'Seized from Hafiz Rahman', 'Seized from K. Ganesan', 'Seized from Chong Kar Wai', 'Seized from Farid Ismail', 'Lost property, Pudu', 'Seized from Danny Ooi'];

// ---- sole geometry (toe at the top, heel at the bottom, a right shoe) ----
function outline(model, L) {
  const Wb = L * model.wide;
  const pts = [];
  const N = 60;
  const half = (t, inner) => {
    let w;
    if (t < 0.13) {
      const u = t / 0.13;
      w = Wb * (model.toe === 'pointed' ? u ** 0.85 * (inner ? 0.95 : 1) : model.toe === 'square' ? Math.min(1, 0.55 + u * 0.8) : Math.sqrt(u));
    } else if (t < 0.36) w = Wb;
    else if (t < 0.64) { const u = (t - 0.36) / 0.28; const dip = Math.sin(u * Math.PI); w = Wb * (1 - dip * (inner ? 0.36 : 0.13)) + (Wb * 0.8 - Wb) * u * (1 - dip); }
    else if (t < 0.93) w = Wb * 0.8;
    else w = Wb * 0.8 * Math.sqrt(Math.max(0, (1 - t) / 0.07));
    return w;
  };
  for (let i = 0; i <= N; i++) { const t = i / N; pts.push([half(t, false) + (t < 0.13 ? Wb * 0.06 * (1 - t / 0.13) : 0), -L / 2 + t * L]); }
  for (let i = N; i >= 0; i--) { const t = i / N; pts.push([-half(t, true) + (t < 0.13 ? Wb * 0.06 * (1 - t / 0.13) : 0), -L / 2 + t * L]); }
  return pts;
}

function tracePath(g, pts) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
}

function drawPattern(g, kind, x0, y0, x1, y1, s) {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (kind === 'chevron') {
    g.lineWidth = 4.2 * s;
    for (let y = y0; y < y1; y += 13 * s) { g.beginPath(); g.moveTo(x0, y + 8 * s); g.lineTo(0, y); g.lineTo(x1, y + 8 * s); g.stroke(); }
  } else if (kind === 'circles') {
    g.lineWidth = 2.6 * s;
    let row = 0;
    for (let y = y0; y < y1; y += 13 * s, row++) for (let x = x0 + (row % 2) * 7 * s; x < x1; x += 14 * s) { g.beginPath(); g.arc(x, y, 4.2 * s, 0, Math.PI * 2); g.stroke(); }
  } else if (kind === 'hex') {
    g.lineWidth = 2.2 * s;
    const r = 7.5 * s, dx = r * Math.sqrt(3), dy = r * 1.5;
    let row = 0;
    for (let y = y0; y < y1 + dy; y += dy, row++) for (let x = x0 + (row % 2) * dx / 2; x < x1 + dx; x += dx) {
      g.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k * Math.PI) / 3; const px = x + Math.cos(a) * r * 0.86, py = y + Math.sin(a) * r * 0.86; if (k) g.lineTo(px, py); else g.moveTo(px, py); }
      g.closePath();
      g.stroke();
    }
  } else if (kind === 'bars') {
    for (let y = y0; y < y1; y += 12 * s) { g.fillRect(x0, y, -x0 - 3 * s, 6 * s); g.fillRect(3 * s, y, x1, 6 * s); }
  } else if (kind === 'waffle') {
    for (let y = y0; y < y1; y += 12 * s) for (let x = x0; x < x1; x += 12 * s) g.fillRect(x + 2 * s, y + 2 * s, 8 * s, 8 * s);
  } else if (kind === 'zigzag') {
    g.lineWidth = 3 * s;
    for (let y = y0; y < y1; y += 11 * s) { g.beginPath(); let up = true; for (let x = x0; x <= x1 + 8 * s; x += 6 * s, up = !up) { if (x === x0) g.moveTo(x, y); else g.lineTo(x, y + (up ? -4 : 4) * s); } g.stroke(); }
  }
}

// draws one sole into a canvas at a given scale; colour is the ink of the marks
function renderSole(shoe, canvas, { color = '#1d1a16', base = '#d9d2c2', scale = 1, padX = 16, padY = 14, decor = true } = {}) {
  const L = lengthCm(shoe.size) * PX_CM;
  const pts = outline(shoe.model, L);
  const Wb = L * shoe.model.wide;
  const cw = Math.ceil((Wb * 2.2 + padX * 2) * scale), ch = Math.ceil((L + padY * 2) * scale);
  canvas.width = cw; canvas.height = ch;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, cw, ch);
  g.save();
  g.translate(cw / 2, ch / 2);
  g.scale(scale, scale);
  if (base) { tracePath(g, pts); g.fillStyle = base; g.fill(); }
  g.save();
  tracePath(g, pts);
  g.clip();
  g.strokeStyle = color;
  g.fillStyle = color;
  const m = shoe.model;
  const heelTop = -L / 2 + L * 0.64;
  // forefoot
  g.save(); g.beginPath(); g.rect(-Wb * 1.3, -L / 2, Wb * 2.6, L * 0.6); g.clip();
  if (m.pattern === 'brogue') {
    g.lineWidth = 1.2; g.setLineDash([3, 3]);
    tracePath(g, outline(m, L).map(([x, y]) => [x * 0.86, y * 0.95])); g.stroke(); g.setLineDash([]);
    for (let row = 0; row < 2; row++) for (let i = 0; i <= 26; i++) {
      const t = i / 26, x = (t - 0.5) * Wb * 1.7, y = -L / 2 + L * (0.22 + row * 0.035) + Math.abs(Math.sin(t * Math.PI * 2)) * -L * 0.06 + Math.abs(t - 0.5) * L * 0.05;
      g.beginPath(); g.arc(x, y, 1.7, 0, Math.PI * 2); g.fill();
    }
  } else drawPattern(g, m.pattern, -Wb * 1.3, -L / 2, Wb * 1.3, -L / 2 + L * 0.6, m.scale);
  g.restore();
  // waist logo
  g.save();
  g.translate(Wb * 0.08, -L / 2 + L * 0.5);
  g.font = `bold ${Math.round(L * 0.032)}px sans-serif`;
  g.textAlign = 'center';
  g.fillText(m.brand.toUpperCase(), 0, 0);
  g.beginPath(); g.arc(0, -L * 0.05, L * 0.022, 0, Math.PI * 2); g.lineWidth = 2; g.stroke();
  g.restore();
  // heel
  g.save(); g.beginPath(); g.rect(-Wb * 1.3, heelTop, Wb * 2.6, L); g.clip();
  if (m.heelGap) { g.lineWidth = 2.4; g.beginPath(); g.moveTo(-Wb * 1.2, heelTop); g.lineTo(Wb * 1.2, heelTop); g.stroke(); }
  if (m.pattern === 'brogue') {
    for (let i = 0; i < 18; i++) { const a = (i / 17) * Math.PI; g.beginPath(); g.arc(Math.cos(a) * Wb * 0.55, heelTop + L * 0.2 + Math.sin(a) * L * 0.1, 1.7, 0, Math.PI * 2); g.fill(); }
    g.font = `${Math.round(L * 0.028)}px serif`; g.textAlign = 'center'; g.fillText('MADE IN KL', 0, heelTop + L * 0.14);
  } else drawPattern(g, m.heel, -Wb * 1.3, heelTop + 6, Wb * 1.3, L / 2, m.scale);
  g.restore();
  // individual characteristics: wear erases, cuts erase, stones add
  g.globalCompositeOperation = 'destination-out';
  for (const w of shoe.wear) {
    const gr = g.createRadialGradient(w.x * Wb, w.y * L, 0, w.x * Wb, w.y * L, w.r * L);
    gr.addColorStop(0, `rgba(0,0,0,${w.s})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(-Wb * 1.5, -L, Wb * 3, L * 2);
  }
  g.lineWidth = 2.4;
  g.lineCap = 'butt';
  for (const c of shoe.cuts) { g.beginPath(); g.moveTo(c[0] * Wb, c[1] * L); g.lineTo(c[2] * Wb, c[3] * L); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = color;
  for (const st of shoe.stones) { g.beginPath(); g.arc(st[0] * Wb, st[1] * L, 2.6, 0, Math.PI * 2); g.fill(); }
  g.restore();
  if (decor) { tracePath(g, pts); g.lineWidth = 1.5; g.strokeStyle = 'rgba(29,26,22,.55)'; g.stroke(); }
  g.restore();
  return { L, Wb, cw, ch, scale };
}

function makeModel(r, pattern, brand) {
  return {
    pattern, brand,
    heel: pattern === 'brogue' ? 'brogue' : r() < 0.6 ? pattern : pick(r, ['bars', 'waffle', 'circles', 'chevron', 'zigzag', 'hex'].filter((p) => p !== pattern)),
    toe: pick(r, ['round', 'pointed', 'square']),
    wide: 0.17 + r() * 0.035,
    scale: 0.85 + r() * 0.35,
    heelGap: pattern === 'brogue' || r() < 0.5,
  };
}
function individual(r, model, size) {
  return {
    model, size,
    wear: [
      { x: 0.25 + r() * 0.35, y: 0.38 + r() * 0.08, r: 0.06 + r() * 0.05, s: 0.55 + r() * 0.35 },
      { x: -0.4 + r() * 0.8, y: -0.25 + r() * 0.1, r: 0.05 + r() * 0.05, s: 0.4 + r() * 0.45 },
      ...(r() < 0.6 ? [{ x: -0.5 + r(), y: -0.42 + r() * 0.05, r: 0.04 + r() * 0.03, s: 0.6 }] : []),
    ],
    cuts: Array.from({ length: randInt(r, 3, 5) }, () => {
      const x = -0.6 + r() * 1.2, y = -0.4 + r() * 0.85, a = r() * Math.PI, l = 0.18 + r() * 0.2;
      return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l * 0.35];
    }),
    stones: Array.from({ length: randInt(r, 1, 2) }, () => [-0.5 + r(), -0.38 + r() * 0.8]),
  };
}

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const sizeVariant = ctx.variant === 'size';
  const nShoes = Math.max(6, Math.min(10, params.shoes || 8));

  // ---- build the evidence ----
  const families = shuffle(rng, Object.keys(PATTERNS));
  const brands = shuffle(rng, BRANDS);
  const answerModel = makeModel(rng, families[0], brands[0]);
  const otherModels = [1, 2, 3, 4].map((i) => makeModel(rng, families[i], brands[i]));
  // a second model with the same tread family as the culprit, so naming the pattern is not enough
  otherModels.push(makeModel(rng, families[0], brands[5]));
  const answerSize = pick(rng, SIZES);
  const shoes = [individual(rng, answerModel, answerSize)];
  shoes.push(individual(rng, answerModel, sizeVariant ? pick(rng, SIZES.filter((s) => s !== answerSize)) : answerSize));
  shoes.push(individual(rng, answerModel, sizeVariant ? answerSize : pick(rng, SIZES)));
  shoes.push(individual(rng, otherModels[4], answerSize));
  for (let i = 0; shoes.length < nShoes; i++) shoes.push(individual(rng, otherModels[i % 4], pick(rng, SIZES)));
  const order = shuffle(rng, shoes.map((_, i) => i));
  const db = order.map((i) => shoes[i]);
  const answerIdx = order.indexOf(0);
  const owners = shuffle(rng, OWNERS).slice(0, nShoes);
  const culprit = shoes[0];

  // the lift: a region around two of the culprit's cuts
  const lift = { theta: (rng() - 0.5) * (sizeVariant ? 0.08 : 1.1), seed: rng() * 10 };
  const cutA = culprit.cuts[0], cutB = culprit.cuts.reduce((best, c) => (Math.hypot(c[0] - cutA[0], c[1] - cutA[1]) < Math.hypot(best[0] - cutA[0], best[1] - cutA[1]) && c !== cutA ? c : best), culprit.cuts[1]);
  lift.cx = (cutA[0] + cutB[0]) / 2; lift.cy = Math.max(-0.32, Math.min(0.32, (cutA[1] + cutB[1]) / 2));
  const blobs = Array.from({ length: 7 }, () => [rng() * Math.PI * 2, 0.35 + rng() * 0.5, 0.35 + rng() * 0.25]);
  const speck = Array.from({ length: 260 }, () => [rng(), rng(), rng()]);

  // ---- state ----
  let stage = saved?.stage || 1;
  let wrong = saved?.wrong || 0;
  const excluded = new Set(saved?.excluded || []);
  let selected = null;
  let done = false;

  // ---- lift rendering ----
  function renderLift(canvas, tint, forOverlay) {
    const src = document.createElement('canvas');
    const geo = renderSole(culprit, src, { color: '#000', base: null, decor: false });
    let S, W2, H2;
    if (sizeVariant) { W2 = geo.cw + (forOverlay ? 0 : 60); H2 = geo.ch; } else { S = 200; W2 = S; H2 = S; }
    canvas.width = W2; canvas.height = H2;
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, W2, H2);
    // mask
    const mask = document.createElement('canvas');
    mask.width = W2; mask.height = H2;
    const mg = mask.getContext('2d');
    if (sizeVariant) {
      for (let i = 0; i < 9; i++) {
        const y = geo.ch * (0.04 + (i / 8) * 0.92), x = geo.cw / 2 + (blobs[i % 7][1] - 0.6) * 40;
        const rr = 46 + blobs[i % 7][2] * 50;
        const gr = mg.createRadialGradient(x, y, rr * 0.3, x, y, rr);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        mg.fillStyle = gr; mg.fillRect(0, 0, W2, H2);
      }
    } else {
      blobs.forEach(([a, d, rr]) => {
        const x = W2 / 2 + Math.cos(a) * d * 50, y = H2 / 2 + Math.sin(a) * d * 50, R = rr * 150;
        const gr = mg.createRadialGradient(x, y, R * 0.35, x, y, R);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        mg.fillStyle = gr; mg.fillRect(0, 0, W2, H2);
      });
    }
    // the print itself
    g.save();
    if (sizeVariant) {
      g.translate(geo.cw / 2, geo.ch / 2); g.rotate(lift.theta); g.translate(-geo.cw / 2, -geo.ch / 2);
      g.drawImage(src, 0, 0);
    } else {
      g.translate(W2 / 2, H2 / 2); g.rotate(lift.theta);
      g.translate(-(geo.cw / 2 + lift.cx * geo.Wb), -(geo.ch / 2 + lift.cy * geo.L));
      g.drawImage(src, 0, 0);
    }
    g.restore();
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(mask, 0, 0);
    g.globalCompositeOperation = 'destination-out';
    speck.forEach(([a, b, c]) => { g.fillStyle = `rgba(0,0,0,${0.3 + c * 0.6})`; g.beginPath(); g.arc(a * W2, b * H2, 0.6 + c * 2.2, 0, Math.PI * 2); g.fill(); });
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = tint;
    g.fillRect(0, 0, W2, H2);
    g.globalCompositeOperation = 'source-over';
    if (!forOverlay && sizeVariant) {
      // a forensic scale along the right edge, in centimetres
      const x = W2 - 34, top = (geo.ch - geo.L) / 2;
      g.fillStyle = '#f4efe3'; g.fillRect(x - 4, 0, 34, H2);
      g.strokeStyle = '#1d1a16'; g.fillStyle = '#1d1a16'; g.lineWidth = 1;
      g.font = '9px monospace';
      for (let mm = 0; mm <= Math.floor((H2 - top) / (PX_CM / 10)); mm++) {
        const y = top + mm * (PX_CM / 10);
        if (y > H2) break;
        const len = mm % 10 === 0 ? 12 : mm % 5 === 0 ? 8 : 4;
        g.beginPath(); g.moveTo(x - 4, y + 0.5); g.lineTo(x - 4 + len, y + 0.5); g.stroke();
        if (mm % 10 === 0) g.fillText(String(mm / 10), x + 10, y + 3);
      }
      g.fillText('cm', x + 8, H2 - 4);
    }
    return geo;
  }

  // ---- DOM ----
  const status = h('p', { class: 'feedback' });
  const liftCanvas = h('canvas', { class: `fs-lift${sizeVariant ? ' is-full' : ''}`, 'aria-label': 'Muddy shoe print lifted from the stairwell landing' });
  renderLift(liftCanvas, '#5a3d24', false);
  const fams = shuffle(rng, Object.keys(PATTERNS));
  const swatch = (kind) => {
    const c = h('canvas', { 'aria-hidden': 'true', width: 56, height: 40 });
    const g = c.getContext('2d');
    g.fillStyle = '#d9d2c2'; g.fillRect(0, 0, 56, 40);
    g.save(); g.translate(28, 0); g.fillStyle = '#1d1a16'; g.strokeStyle = '#1d1a16';
    if (kind === 'brogue') { for (let i = 0; i < 12; i++) { const t = i / 11; g.beginPath(); g.arc((t - 0.5) * 48, 14 + Math.abs(Math.sin(t * Math.PI * 2)) * -6 + Math.abs(t - 0.5) * 10, 1.6, 0, Math.PI * 2); g.fill(); } g.setLineDash([3, 3]); g.strokeRect(-24, 4, 48, 32); }
    else drawPattern(g, kind, -30, 2, 30, 40, 0.8);
    g.restore();
    return c;
  };
  const stage1 = h('div', { class: 'fs-stage' },
    h('p', { class: 'doc' }, 'Step 1. What tread made the print?'),
    h('div', { class: 'fs-types' }, fams.map((k) => h('button', { class: 'btn btn--paper fs-type', onclick: () => classify(k) }, swatch(k), h('span', {}, h('strong', {}, PATTERNS[k].label), h('small', {}, PATTERNS[k].note))))));

  const grid = h('div', { class: 'fs-grid' });
  const cards = db.map((shoe, i) => {
    const cv = h('canvas', { 'aria-hidden': 'true' });
    renderSole(shoe, cv);
    const card = h('button', { class: 'fs-card', onclick: () => choose(i), 'aria-label': `${owners[i]}, ${shoe.model.brand}` }, cv, h('span', { class: 'doc' }, owners[i]), h('small', {}, shoe.model.brand));
    grid.append(card);
    return card;
  });

  const benchShoe = h('canvas', { class: 'fs-bench-shoe' });
  const overlay = h('canvas', { class: 'fs-overlay', tabindex: '0', 'aria-label': 'Lifted print overlay. Arrow keys move it.' });
  renderLift(overlay, '#c81e2a', true);
  const rot = h('input', { type: 'range', min: -90, max: 90, value: 0, 'aria-label': 'Turn the lift' });
  const opacity = h('input', { type: 'range', min: 20, max: 100, value: 70, 'aria-label': 'Lift opacity' });
  const pos = { x: 0, y: 0 };
  const bench = h('div', { class: 'fs-bench' }, benchShoe, overlay);
  const benchWrap = h('div', { class: 'fs-bench-wrap', hidden: true },
    h('p', { class: 'doc' }, 'Drag the red lift over the sole and turn it until the tread lines up. Then check the cuts and worn patches.'),
    bench,
    h('label', { class: 'fs-slider' }, 'Turn', rot),
    h('label', { class: 'fs-slider' }, 'Opacity', opacity),
    h('div', { class: 'game-toolbar' },
      h('button', { class: 'btn btn--primary', onclick: () => declare() }, 'Declare a match'),
      h('button', { class: 'btn', onclick: () => { benchWrap.hidden = true; selected = null; mark(); } }, 'Back to the shoes')));
  const applyOverlay = () => {
    overlay.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${rot.value}deg)`;
    overlay.style.opacity = opacity.value / 100;
  };
  rot.oninput = applyOverlay;
  opacity.oninput = applyOverlay;
  let drag = null;
  overlay.addEventListener('pointerdown', (e) => { drag = { sx: e.clientX, sy: e.clientY, x: pos.x, y: pos.y }; overlay.setPointerCapture(e.pointerId); e.preventDefault(); });
  overlay.addEventListener('pointermove', (e) => { if (!drag) return; const k = overlay.offsetWidth ? overlay.width / overlay.offsetWidth : 1; pos.x = drag.x + (e.clientX - drag.sx) * k; pos.y = drag.y + (e.clientY - drag.sy) * k; applyOverlay(); });
  overlay.addEventListener('pointerup', () => { drag = null; });
  overlay.addEventListener('keydown', (e) => {
    const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!mv) return;
    e.preventDefault();
    const st = e.shiftKey ? 10 : 2;
    pos.x += mv[0] * st; pos.y += mv[1] * st;
    applyOverlay();
  });
  applyOverlay();
  const stage2 = h('div', { class: 'fs-stage' }, h('p', { class: 'doc' }, 'Step 2. Compare the lift with the seized shoes. Choose one to put on the bench.'), grid, benchWrap);

  const sizeBtns = SIZES.map((s) => h('button', { class: 'chip fs-size', onclick: () => sizeGuess(s) }, `UK ${s}`));
  const chart = h('table', { class: 'fs-chart doc' }, h('tr', {}, h('th', {}, 'UK size'), SIZES.map((s) => h('td', {}, String(s)))), h('tr', {}, h('th', {}, 'Outsole length'), SIZES.map((s) => h('td', {}, `${lengthCm(s).toFixed(1)} cm`))));
  const stage3 = h('div', { class: 'fs-stage' },
    h('p', { class: 'doc' }, 'Step 3. The warrant needs a size. Measure the print from the back of the heel to the tip of the toe against the scale, then read the chart.'),
    chart, h('div', { class: 'fs-sizes' }, sizeBtns));

  const counter = h('p', { class: 'doc fs-count' });
  el.append(
    h('p', { class: 'game-rules' }, `Shoe examiners name the tread first, then compare the damage only one shoe in the world has: cuts, stones caught in the grooves, worn patches. A wrong declaration costs the lab time.${sizeVariant ? ' This time you also need the size.' : ''}`),
    h('div', { class: 'fs-top' }, h('figure', { class: 'fs-liftfig' }, liftCanvas, h('figcaption', { class: 'doc' }, 'Lift: stairwell landing, level 14'))),
    ...[stage1, stage2, sizeVariant ? stage3 : null, counter, status].filter(Boolean),
  );

  function persist() { ctx.onSave({ stage, wrong, excluded: [...excluded] }); }
  function mark() {
    cards.forEach((c, i) => {
      c.classList.toggle('is-excluded', excluded.has(i));
      c.classList.toggle('is-selected', selected === i);
      c.disabled = excluded.has(i);
    });
  }
  function show() {
    stage1.hidden = stage !== 1;
    stage2.hidden = stage !== 2;
    stage3.hidden = stage !== 3;
    counter.textContent = `${wrong} wrong ${wrong === 1 ? 'call' : 'calls'}`;
    ctx.onProgress(done ? 1 : stage === 1 ? 0.1 : stage === 2 ? 0.3 + excluded.size * 0.06 : 0.85);
    mark();
  }
  function say(t, good) { status.textContent = t; status.className = `feedback ${good ? 'is-good' : 'is-bad'}`; }

  function classify(k) {
    if (k === answerModel.pattern) {
      sfx.good();
      stage = 2;
      db.forEach((s, i) => { if (s.model.pattern !== k) excluded.add(i); });
      say(`${PATTERNS[k].label}. Shoes with any other tread are set aside.`, true);
    } else {
      sfx.bad();
      wrong++;
      say(`Look again. ${PATTERNS[k].label} would show ${PATTERNS[k].note}.`, false);
    }
    persist();
    show();
  }
  function choose(i) {
    if (excluded.has(i)) return;
    selected = i;
    renderSole(db[i], benchShoe);
    benchWrap.hidden = false;
    pos.x = (benchShoe.width - overlay.width) / 2;
    pos.y = sizeVariant ? 0 : (benchShoe.height - overlay.height) / 2;
    applyOverlay();
    mark();
    benchWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function finish() {
    done = true;
    say(sizeVariant ? `A UK ${answerSize}, seized from the right person. The print puts them on the landing.` : `The cuts and the worn heel line up exactly. The shoe was ${lower1(owners[answerIdx])}.`, true);
    show();
    ctx.onProgress(1);
    ctx.onSolved();
  }
  function declare() {
    if (selected == null || done) return;
    if (selected === answerIdx) {
      sfx.good();
      benchWrap.hidden = true;
      if (sizeVariant) { stage = 3; say('That is the shoe. Now the size.', true); persist(); show(); return; }
      finish();
      return;
    }
    wrong++;
    sfx.bad();
    excluded.add(selected);
    say(`No. The ${db[selected].model.brand === answerModel.brand ? 'tread matches, but the cuts and wear do not' : 'tread looks close, but the brand mark and spacing differ'}. Shoe excluded.`, false);
    selected = null;
    benchWrap.hidden = true;
    persist();
    show();
  }
  function sizeGuess(s) {
    if (done) return;
    if (s === answerSize) { sfx.good(); finish(); return; }
    wrong++;
    sfx.bad();
    say(`Not a UK ${s}. Measure again: back of the heel to the very tip of the toe.`, false);
    persist();
    show();
  }

  show();
  return {
    hint() {
      if (done) return null;
      if (stage === 1) return `Look at the forefoot of the print. The marks are ${PATTERNS[answerModel.pattern].note}.`;
      if (stage === 3) return `The print is between ${Math.floor(lengthCm(answerSize))} and ${Math.floor(lengthCm(answerSize)) + 1} cm long.`;
      const options = db.map((_, i) => i).filter((i) => !excluded.has(i) && i !== answerIdx);
      if (!options.length) return null;
      excluded.add(options[0]);
      persist();
      show();
      return `The lab ruled out the shoe ${lower1(owners[options[0]])}.`;
    },
    devSolve() {
      if (stage === 1) classify(answerModel.pattern);
      if (stage === 2) { selected = answerIdx; declare(); }
      if (stage === 3) sizeGuess(answerSize);
    },
    _answer: () => ({ idx: answerIdx, size: answerSize, pattern: answerModel.pattern }),
  };
}
