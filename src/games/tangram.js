// Tangram: drag and turn the seven pieces to fill a silhouette exactly.
// Pieces turn in 45 degree steps, the parallelogram can be flipped, and every drop snaps a corner
// to the grid. Coverage is checked by sampling the area: 97% of the silhouette must be covered.
// Each silhouette is stored as a known solution, so every one is guaranteed solvable.
import { h } from '../core/ui.js';
import { shuffle, mulberry32 } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'tangram', name: 'Tangram', category: 'Spatial' };
export const demo = { variant: 'classic', params: { rounds: 3 } };

// solutions on an integer grid; the small triangle has legs of 1 unit
const SHAPES = [
  { id: 'house', label: 'a house', w: 4, h: 4, p: [['L', [2, 2, 0, 2, 2, 0]], ['L', [2, 2, 2, 0, 4, 2]], ['M', [1, 2, 3, 2, 2, 3]], ['S', [1, 3, 1, 2, 2, 3]], ['P', [3, 2, 3, 3, 2, 4, 2, 3]], ['Q', [1, 3, 2, 3, 2, 4, 1, 4]], ['S', [3, 4, 2, 4, 3, 3]]] },
  { id: 'boat', label: 'a sailing boat', w: 5, h: 4, p: [['L', [2, 2, 2, 0, 4, 2]], ['S', [2, 2, 3, 2, 2, 3]], ['L', [3, 4, 1, 4, 3, 2]], ['Q', [3, 2, 4, 2, 4, 3, 3, 3]], ['M', [0, 3, 2, 3, 1, 4]], ['S', [3, 3, 4, 3, 3, 4]], ['P', [5, 3, 4, 3, 3, 4, 4, 4]]] },
  { id: 'key', label: 'a key', w: 5, h: 3, p: [['L', [0, 0, 2, 0, 0, 2]], ['L', [2, 2, 0, 2, 2, 0]], ['M', [2, 1, 4, 1, 3, 2]], ['S', [2, 2, 2, 1, 3, 2]], ['P', [4, 1, 4, 2, 3, 3, 3, 2]], ['Q', [4, 1, 5, 1, 5, 2, 4, 2]], ['S', [4, 3, 3, 3, 4, 2]]] },
  { id: 'chair', label: 'a chair', w: 3, h: 5, p: [['S', [0, 0, 1, 0, 0, 1]], ['M', [1, 0, 1, 2, 0, 1]], ['P', [1, 3, 1, 2, 0, 1, 0, 2]], ['L', [0, 4, 0, 2, 2, 4]], ['L', [3, 3, 3, 5, 1, 3]], ['Q', [0, 4, 1, 4, 1, 5, 0, 5]], ['S', [2, 5, 2, 4, 3, 5]]] },
  { id: 'cat', label: "a cat's head", w: 3, h: 4, p: [['L', [0, 2, 0, 0, 2, 2]], ['M', [3, 0, 3, 2, 2, 1]], ['P', [1, 1, 2, 1, 3, 2, 2, 2]], ['L', [1, 2, 3, 2, 1, 4]], ['S', [3, 3, 2, 3, 3, 2]], ['S', [2, 4, 1, 4, 2, 3]], ['Q', [2, 3, 3, 3, 3, 4, 2, 4]]] },
  { id: 'pistol', label: 'a pistol', w: 5, h: 3, p: [['L', [2, 0, 2, 2, 0, 0]], ['M', [2, 0, 4, 0, 3, 1]], ['S', [2, 1, 2, 0, 3, 1]], ['S', [4, 1, 3, 1, 4, 0]], ['Q', [4, 0, 5, 0, 5, 1, 4, 1]], ['L', [1, 3, 1, 1, 3, 3]], ['P', [3, 3, 3, 2, 2, 1, 2, 2]]] },
  { id: 'castle', label: 'a castle wall', w: 5, h: 2, p: [['S', [1, 0, 1, 1, 0, 0]], ['L', [0, 2, 0, 0, 2, 2]], ['Q', [2, 0, 3, 0, 3, 1, 2, 1]], ['S', [4, 0, 5, 0, 4, 1]], ['L', [5, 2, 3, 2, 5, 0]], ['M', [1, 1, 3, 1, 2, 2]], ['P', [4, 1, 3, 1, 2, 2, 3, 2]]] },
  { id: 'hat', label: 'a top hat', w: 4, h: 3, p: [['L', [1, 0, 3, 0, 1, 2]], ['L', [3, 2, 1, 2, 3, 0]], ['M', [0, 2, 2, 2, 1, 3]], ['S', [0, 3, 0, 2, 1, 3]], ['P', [3, 2, 2, 2, 1, 3, 2, 3]], ['S', [3, 3, 2, 3, 3, 2]], ['Q', [3, 2, 4, 2, 4, 3, 3, 3]]] },
  { id: 'crown', label: 'a crown', w: 4, h: 3, p: [['L', [1, 2, 1, 0, 3, 2]], ['M', [3, 0, 3, 2, 2, 1]], ['L', [0, 3, 0, 1, 2, 3]], ['S', [4, 2, 3, 2, 4, 1]], ['P', [1, 2, 2, 2, 3, 3, 2, 3]], ['S', [3, 2, 3, 3, 2, 2]], ['Q', [3, 2, 4, 2, 4, 3, 3, 3]]] },
  { id: 'fish', label: 'a fish', w: 4, h: 5, p: [['L', [0, 2, 2, 0, 2, 2]], ['L', [0, 2, 2, 2, 2, 4]], ['M', [2, 1, 2, 3, 3, 2]], ['S', [3, 2, 4, 1, 4, 2]], ['S', [3, 2, 4, 2, 4, 3]], ['Q', [2, 0, 3, 0, 3, 1, 2, 1]], ['P', [2, 3, 2, 4, 3, 5, 3, 4]]] },
  { id: 'runner', label: 'a running man', w: 5, h: 5, p: [['Q', [3, 0, 4, 0, 4, 1, 3, 1]], ['L', [2, 1, 4, 1, 2, 3]], ['M', [2, 1, 2, 3, 1, 2]], ['P', [3, 2, 4, 1, 5, 1, 4, 2]], ['L', [2, 3, 2, 5, 4, 5]], ['S', [2, 3, 2, 4, 1, 4]], ['S', [1, 4, 1, 5, 0, 5]]] },
  { id: 'boot', label: 'a boot', w: 4, h: 3, p: [['S', [1, 0, 2, 0, 1, 1]], ['M', [2, 0, 2, 2, 1, 1]], ['L', [1, 3, 1, 1, 3, 3]], ['L', [4, 1, 4, 3, 2, 1]], ['S', [2, 2, 2, 1, 3, 2]], ['Q', [0, 2, 1, 2, 1, 3, 0, 3]], ['P', [2, 2, 3, 2, 4, 3, 3, 3]]] },
];

const BASE = { L: [[0, 0], [2, 0], [0, 2]], M: [[0, 0], [2, 0], [1, 1]], S: [[0, 0], [1, 0], [0, 1]], Q: [[0, 0], [1, 0], [1, 1], [0, 1]], P: [[0, 0], [1, 0], [2, 1], [1, 1]] };
const NAMES = { L: 'large triangle', M: 'medium triangle', S: 'small triangle', Q: 'square', P: 'parallelogram' };
const KINDS = ['L', 'L', 'M', 'S', 'S', 'Q', 'P'];
const COLORS = ['#b3202a', '#3d6b9a', '#3f7d5a', '#e8a33d', '#c9a43a', '#7a3a7a', '#8a6a4a'];
const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
const CENTRED = Object.fromEntries(Object.entries(BASE).map(([k, pts]) => { const [cx, cy] = centroid(pts); return [k, pts.map(([x, y]) => [x - cx, y - cy])]; }));

function verts(kind, st) {
  const a = (st.r * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a);
  return CENTRED[kind].map(([x, y]) => { const fx = st.f ? -x : x; return [fx * c - y * s + st.x, fx * s + y * c + st.y]; });
}
function inPoly(px, py, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
// the pose (turn, flip, position) that puts a piece exactly on a solution polygon
function poseFor(kind, poly) {
  const [cx, cy] = centroid(poly);
  for (let f = 0; f < 2; f++) for (let r = 0; r < 8; r++) {
    const v = verts(kind, { x: cx, y: cy, r, f });
    if (v.every(([x, y]) => poly.some(([px, py]) => Math.abs(px - x) < 1e-6 && Math.abs(py - y) < 1e-6))) return { x: cx, y: cy, r, f };
  }
  return null;
}

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const rounds = Math.max(1, Math.min(SHAPES.length, params.rounds || 3));
  const order = params.shapes ? params.shapes.map((id) => SHAPES.find((s) => s.id === id)).filter(Boolean) : shuffle(rng, SHAPES).slice(0, rounds);
  const trayRng = rng();
  const portrait = (el.clientWidth || el.parentElement?.clientWidth || 800) < 540;
  const BW = portrait ? 10 : 18, BH = portrait ? 17 : 10;
  const targetBox = portrait ? { x: 0, y: 0.5, w: 10, h: 8 } : { x: 0, y: 0, w: 10, h: 10 };
  const slots = portrait
    ? Array.from({ length: 7 }, (_, i) => [1.7 + (i % 3) * 3.3 + (i >= 6 ? 3.3 : 0), 10.3 + Math.floor(i / 3) * 2.6])
    : Array.from({ length: 7 }, (_, i) => [11.6 + (i % 2) * 3.6, 1.4 + Math.floor(i / 2) * 2.45]);

  let round = saved?.round || 0;
  let pieces = null; // [{kind, x, y, r, f, locked}]
  let selected = -1;
  let done = false;
  let coverage = 0;

  const status = h('p', { class: 'feedback' });
  const head = h('p', { class: 'doc tg-head' });
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${BW} ${BH}`);
  svg.setAttribute('class', `tg-svg${portrait ? ' is-portrait' : ''}`);
  svg.setAttribute('role', 'application');
  svg.setAttribute('aria-label', 'Tangram board. Tab to a piece, arrow keys move it, Q and E turn it, F flips it.');
  const gridLayer = document.createElementNS(svgNS, 'g');
  const targetLayer = document.createElementNS(svgNS, 'g');
  const pieceLayer = document.createElementNS(svgNS, 'g');
  svg.append(gridLayer, targetLayer, pieceLayer);
  const covEl = h('span', { class: 'doc tg-cov' });
  const nextBtn = h('button', { class: 'btn btn--primary', hidden: true, onclick: () => nextRound() }, 'Next silhouette');
  el.append(
    h('p', { class: 'game-rules' }, `Fill the black silhouette with all seven pieces, no overlaps. Drag to move; double-click, or use the buttons, to turn by 45 degrees. Only the parallelogram ever needs flipping. ${rounds} silhouettes.`),
    head,
    h('div', { class: 'tg-wrap' }, svg),
    h('div', { class: 'game-toolbar' },
      h('button', { class: 'btn btn--small', onclick: () => turn(-1), 'aria-label': 'Turn the selected piece left' }, 'Turn left'),
      h('button', { class: 'btn btn--small', onclick: () => turn(1), 'aria-label': 'Turn the selected piece right' }, 'Turn right'),
      h('button', { class: 'btn btn--small', onclick: () => flip(), 'aria-label': 'Flip the selected piece' }, 'Flip'),
      h('button', { class: 'btn btn--small', onclick: () => { resetPieces(); persist(); draw(); }, 'aria-label': 'Put every piece back in the tray' }, 'Clear'),
      covEl, nextBtn),
    status,
  );

  const shape = () => order[Math.min(round, order.length - 1)];
  const offset = () => {
    const s = shape();
    return [Math.round(targetBox.x + (targetBox.w - s.w) / 2), Math.round(targetBox.y + (targetBox.h - s.h) / 2)];
  };
  const targetPolys = () => {
    const [ox, oy] = offset();
    return shape().p.map(([k, c]) => ({ k, pts: Array.from({ length: c.length / 2 }, (_, i) => [c[i * 2] + ox, c[i * 2 + 1] + oy]) }));
  };

  function resetPieces() {
    const r = mulberry32(Math.floor(trayRng * 1e9) + round * 7777);
    const slotOrder = shuffle(r, slots.map((_, i) => i));
    pieces = KINDS.map((kind, i) => ({ kind, x: slots[slotOrder[i]][0], y: slots[slotOrder[i]][1], r: Math.floor(r() * 4) * 2, f: kind === 'P' && r() < 0.5 ? 1 : 0, locked: false }));
    pieces.forEach((p) => snap(p));
    selected = -1;
  }

  function snap(p) {
    const v = verts(p.kind, p);
    let best = null;
    for (const [x, y] of v) {
      const dx = Math.round(x) - x, dy = Math.round(y) - y, d = Math.hypot(dx, dy);
      if (!best || d < best.d) best = { d, dx, dy };
    }
    p.x += best.dx; p.y += best.dy;
    // keep the piece on the board
    const v2 = verts(p.kind, p);
    const minx = Math.min(...v2.map((q) => q[0])), maxx = Math.max(...v2.map((q) => q[0]));
    const miny = Math.min(...v2.map((q) => q[1])), maxy = Math.max(...v2.map((q) => q[1]));
    if (minx < 0) p.x += Math.ceil(-minx);
    if (maxx > BW) p.x -= Math.ceil(maxx - BW);
    if (miny < 0) p.y += Math.ceil(-miny);
    if (maxy > BH) p.y -= Math.ceil(maxy - BH);
  }

  function persist() {
    ctx.onSave({ round, pieces: pieces.map((p) => ({ x: +p.x.toFixed(4), y: +p.y.toFixed(4), r: p.r, f: p.f, locked: p.locked })) });
  }

  function measure() {
    const T = targetPolys().map((t) => t.pts);
    const [ox, oy] = offset();
    const s = shape();
    const P = pieces.map((p) => verts(p.kind, p));
    const step = 1 / 8;
    let inT = 0, cov = 0;
    // sample offsets chosen so no sample ever lies on a grid line or a 45 degree edge
    for (let y = oy + step * 0.57; y < oy + s.h; y += step) for (let x = ox + step * 0.31; x < ox + s.w; x += step) {
      if (!T.some((t) => inPoly(x, y, t))) continue;
      inT++;
      if (P.some((q) => inPoly(x, y, q))) cov++;
    }
    let spill = 0;
    for (const q of P) {
      const xs = q.map((v) => v[0]), ys = q.map((v) => v[1]);
      for (let y = Math.floor(Math.min(...ys)) + step * 0.57; y < Math.max(...ys); y += step) for (let x = Math.floor(Math.min(...xs)) + step * 0.31; x < Math.max(...xs); x += step) {
        if (inPoly(x, y, q) && !T.some((t) => inPoly(x, y, t))) spill++;
      }
    }
    return { coverage: cov / inT, spill: spill / inT };
  }

  function check() {
    const m = measure();
    coverage = m.coverage;
    covEl.textContent = `Silhouette covered: ${Math.floor(m.coverage * 100)}%`;
    ctx.onProgress(Math.min(0.99, (round + Math.min(1, m.coverage) * 0.9) / rounds));
    if (m.coverage >= 0.97 && m.spill <= 0.03 && !done) {
      sfx.good();
      if (round >= rounds - 1) {
        done = true;
        status.textContent = `${shape().label[0].toUpperCase()}${shape().label.slice(1)}, exactly. Every silhouette is filled.`;
        status.className = 'feedback is-good';
        ctx.onProgress(1);
        ctx.onSolved();
      } else {
        status.textContent = `${shape().label[0].toUpperCase()}${shape().label.slice(1)}, exactly.`;
        status.className = 'feedback is-good';
        nextBtn.hidden = false;
        pieces.forEach((p) => { p.locked = true; });
        draw();
      }
    }
  }

  function nextRound() {
    round++;
    nextBtn.hidden = true;
    status.textContent = '';
    status.className = 'feedback';
    resetPieces();
    persist();
    drawTarget();
    draw();
    check();
  }

  function drawTarget() {
    const [ox, oy] = offset();
    const s = shape();
    let g = '';
    for (let y = 0; y <= BH; y++) for (let x = 0; x <= BW; x++) g += `<circle cx="${x}" cy="${y}" r=".045" fill="#b9ae95"/>`;
    g += portrait ? `<line x1="0.3" y1="9.05" x2="${BW - 0.3}" y2="9.05" stroke="#b9ae95" stroke-width=".04" stroke-dasharray=".2 .15"/>` : `<line x1="10.05" y1="0.3" x2="10.05" y2="${BH - 0.3}" stroke="#b9ae95" stroke-width=".04" stroke-dasharray=".2 .15"/>`;
    gridLayer.innerHTML = g;
    targetLayer.innerHTML = targetPolys().map((t) => `<polygon points="${t.pts.map((p) => p.join(',')).join(' ')}" fill="#1d1a16" stroke="#1d1a16" stroke-width=".05" stroke-linejoin="round"/>`).join('')
      + `<text x="${ox + s.w / 2}" y="${Math.min(BH - 0.2, oy + s.h + 0.75)}" text-anchor="middle" font-size=".5" font-family="Special Elite, monospace" fill="#4a443b">${s.label}</text>`;
    head.textContent = `Silhouette ${round + 1} of ${rounds}: ${s.label}.`;
  }

  function draw() {
    pieceLayer.innerHTML = '';
    pieces.forEach((p, i) => {
      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', `tg-piece${i === selected ? ' is-sel' : ''}${p.locked ? ' is-locked' : ''}`);
      g.setAttribute('tabindex', p.locked ? '-1' : '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${NAMES[p.kind]}${p.locked ? ', fixed in place' : ''}`);
      g.dataset.i = i;
      const pts = verts(p.kind, p).map((v) => v.map((n) => n.toFixed(3)).join(',')).join(' ');
      g.innerHTML = `<polygon points="${pts}" fill="${COLORS[i]}" stroke="${i === selected ? '#fbf7ec' : '#1d1a16'}" stroke-width="${i === selected ? 0.09 : 0.05}" stroke-linejoin="round"/>`;
      pieceLayer.append(g);
    });
    // keep the selected piece on top
    if (selected >= 0) pieceLayer.append(pieceLayer.querySelector(`[data-i="${selected}"]`));
  }

  function select(i) {
    selected = i;
    draw();
    const g = pieceLayer.querySelector(`[data-i="${i}"]`);
    if (g && document.activeElement !== g) g.focus({ preventScroll: true });
  }

  function turn(d) {
    const p = pieces[selected];
    if (!p || p.locked) { status.textContent = 'Select a piece first.'; status.className = 'feedback'; return; }
    p.r = (p.r + d + 8) % 8;
    snap(p);
    sfx.click();
    persist();
    draw();
    check();
  }
  function flip() {
    const p = pieces[selected];
    if (!p || p.locked) { status.textContent = 'Select a piece first.'; status.className = 'feedback'; return; }
    p.f = p.f ? 0 : 1;
    snap(p);
    sfx.click();
    persist();
    draw();
    check();
  }

  // pointer: drag a piece, double-click to turn
  const toBoard = (e) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  let drag = null, lastTap = { i: -1, t: 0 };
  svg.addEventListener('pointerdown', (e) => {
    const g = e.target.closest?.('.tg-piece');
    if (!g) { selected = -1; draw(); return; }
    const i = Number(g.dataset.i);
    const p = pieces[i];
    if (p.locked) return;
    e.preventDefault();
    const b = toBoard(e);
    drag = { i, dx: p.x - b.x, dy: p.y - b.y, moved: false, sx: e.clientX, sy: e.clientY };
    svg.setPointerCapture(e.pointerId);
    if (selected !== i) select(i);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) drag.moved = true;
    if (!drag.moved) return;
    const b = toBoard(e);
    const p = pieces[drag.i];
    p.x = b.x + drag.dx; p.y = b.y + drag.dy;
    const poly = pieceLayer.querySelector(`[data-i="${drag.i}"] polygon`);
    poly.setAttribute('points', verts(p.kind, p).map((v) => v.map((n) => n.toFixed(3)).join(',')).join(' '));
  });
  const up = () => {
    if (!drag) return;
    const { i, moved } = drag;
    drag = null;
    if (moved) {
      snap(pieces[i]);
      sfx.click();
      persist();
      draw();
      check();
    } else {
      const now = performance.now();
      if (lastTap.i === i && now - lastTap.t < 380) { turn(1); lastTap = { i: -1, t: 0 }; } else lastTap = { i, t: now };
    }
  };
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);

  // keyboard on a focused piece
  svg.addEventListener('keydown', (e) => {
    const g = e.target.closest?.('.tg-piece');
    if (!g) return;
    const i = Number(g.dataset.i);
    const p = pieces[i];
    if (p.locked) return;
    if (selected !== i) { selected = i; }
    const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (mv) {
      e.preventDefault();
      p.x += mv[0]; p.y += mv[1];
      snap(p);
      persist();
      draw();
      pieceLayer.querySelector(`[data-i="${i}"]`)?.focus({ preventScroll: true });
      check();
    } else if (e.key === 'q' || e.key === 'Q' || e.key === 'e' || e.key === 'E' || e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      if (e.key.toLowerCase() === 'f') flip(); else turn(e.key.toLowerCase() === 'e' ? 1 : -1);
      pieceLayer.querySelector(`[data-i="${i}"]`)?.focus({ preventScroll: true });
    }
  });
  svg.addEventListener('focusin', (e) => {
    const g = e.target.closest?.('.tg-piece');
    if (g && selected !== Number(g.dataset.i)) { selected = Number(g.dataset.i); g.querySelector('polygon').setAttribute('stroke', '#fbf7ec'); g.querySelector('polygon').setAttribute('stroke-width', '0.09'); pieceLayer.querySelectorAll('.tg-piece').forEach((o) => { if (o !== g) { o.querySelector('polygon').setAttribute('stroke', '#1d1a16'); o.querySelector('polygon').setAttribute('stroke-width', '0.05'); } }); }
  });

  // place a piece where the solution has it
  function placeOne() {
    const T = targetPolys();
    const usedT = new Set();
    const okPiece = new Set();
    pieces.forEach((p, i) => {
      const v = verts(p.kind, p);
      const ti = T.findIndex((t, k) => !usedT.has(k) && t.k === p.kind && t.pts.length === v.length && v.every(([x, y]) => t.pts.some(([a, b]) => Math.abs(a - x) < 1e-3 && Math.abs(b - y) < 1e-3)));
      if (ti >= 0) { usedT.add(ti); okPiece.add(i); }
    });
    const order2 = ['L', 'M', 'P', 'Q', 'S'];
    for (const kind of order2) {
      const i = pieces.findIndex((p, k) => p.kind === kind && !okPiece.has(k));
      const ti = T.findIndex((t, k) => t.k === kind && !usedT.has(k));
      if (i < 0 || ti < 0) continue;
      const pose = poseFor(kind, T[ti].pts);
      Object.assign(pieces[i], pose, { locked: true });
      return i;
    }
    return -1;
  }

  // ---- start ----
  if (saved?.pieces && saved.pieces.length === 7) {
    pieces = KINDS.map((kind, i) => ({ kind, ...saved.pieces[i] }));
  } else resetPieces();
  if (round >= order.length) round = order.length - 1;
  drawTarget();
  draw();
  check();

  return {
    hint() {
      if (done) return null;
      const i = placeOne();
      if (i < 0) return null;
      persist();
      draw();
      check();
      return `The ${NAMES[pieces[i].kind]} is now fixed in its place.`;
    },
    devSolve() {
      for (let guard = 0; !done && guard < rounds + 1; guard++) {
        nextBtn.hidden = true;
        pieces.forEach((p) => { p.locked = false; });
        for (let k = 0; k < 7 && placeOne() >= 0; k++);
        draw();
        check();
        if (!done) nextRound();
      }
    },
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Fill the black shape using all seven coloured pieces.',
  steps: [
    'Drag a coloured piece onto the black shape.',
    'Tap a piece to select it. Then tap Turn left or Turn right.',
    'Double-tap a piece to turn it too.',
    'Pieces snap into place. They must not overlap.',
    ({ params }) => `Cover the whole shape to finish. ${params.rounds || 3} shapes in all.`,
  ],
  example: {
    caption: 'The red triangle is in place. Drag the blue one up, turn it, and it fills the other half of the roof.',
    render(el) {
      const u = 32, ox = 24, oy = 14;
      const P = (pts) => pts.map(([x, y]) => `${(ox + x * u).toFixed(1)},${(oy + y * u).toFixed(1)}`).join(' ');
      const pairs = (flat) => flat.reduce((a, v, i) => (i % 2 ? (a[a.length - 1].push(v), a) : [...a, [v]]), []);
      const house = SHAPES[0];
      let s = house.p.map(([, f]) => `<polygon points="${P(pairs(f))}" fill="${C.ink}" stroke="${C.ink}" stroke-width="1" stroke-linejoin="round"/>`).join('');
      s += `<polygon points="${P(pairs(house.p[0][1]))}" fill="${COLORS[0]}" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
      s += `<polygon points="${P(pairs(house.p[1][1]))}" fill="none" stroke="${COLORS[1]}" stroke-width="2.5" stroke-dasharray="5 4"/>`;
      // tray
      const t = (pts, k, x, y, col, op = 1) => `<polygon points="${pts.map(([a, b]) => `${x + a * k},${y + b * k}`).join(' ')}" fill="${col}" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round" opacity="${op}"/>`;
      s += rect(214, 10, 158, 134, { fill: '#f1ead8', stroke: C.line, sw: 1, rx: 4, dash: '4 3' }) + text(293, 138, 'pieces', { size: 12, fill: C.soft, font: 'doc' });
      s += t(BASE.L, 30, 236, 22, COLORS[1]);
      s += t(BASE.M, 26, 304, 84, COLORS[2], 0.55) + t(BASE.S, 26, 236, 92, COLORS[3], 0.55) + t(BASE.Q, 26, 320, 30, COLORS[5], 0.55);
      s += arrow(250, 40, 116, 46, { bend: -26, sw: 3 });
      put(el, svg(380, 152, s, 'A house silhouette with one triangle placed and another being dragged in'));
    },
  },
  tips: ['Place the two big triangles first.', 'Only the parallelogram ever needs Flip.'],
  controls: { touch: 'Drag pieces. Double-tap or use the Turn buttons.', keys: 'Tab to a piece. Arrows move it, Q and E turn it, F flips it.' },
};
