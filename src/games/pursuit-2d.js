// Foot Chase: the plain 2D canvas view, used when WebGL is unavailable or the GPU drops the
// context. Same run, same rules (pursuit-logic.js), drawn as a pseudo-3D street from behind the
// detective: boxes for things to go round, low bars to jump, high bars to slide under, dark bands
// for drains and gaps, a cup for teh tarik, two running figures. It supports every leg.
import { groundAt } from './pursuit-logic.js';

const PAL = {
  city: { sky: ['#050a0e', '#1e3640'], road: '#1b2023', side: '#262c30', wall: '#2c3236', lamp: '#ffad55' },
  market: { sky: ['#080a0c', '#3a2c22'], road: '#1e2120', side: '#2a2824', wall: '#2e2a26', lamp: '#ffbe6a' },
  docks: { sky: ['#070c0e', '#3a3226'], road: '#3a3d3e', side: '#33363a', wall: '#2a4a5a', lamp: '#ff9a3a' },
  heritage: { sky: ['#060c11', '#22323c'], road: '#1a1e20', side: '#3a2420', wall: '#46574f', lamp: '#ff6a40' },
  kampung: { sky: ['#050b10', '#2a3a4a'], road: '#4a3420', side: '#16200f', wall: '#5a3d26', lamp: '#ffb860' },
  rooftop: { sky: ['#050b10', '#26404c'], road: '#34373a', side: '#2a2c2c', wall: '#3a3e40', lamp: '#cfe6ff' },
  estate: { sky: ['#1a2224', '#3a4648'], road: '#5a2e1c', side: '#1a2418', wall: '#2a2a22', lamp: '#ffb860' },
};
const TYPE_C = { low: '#d8641e', high: '#3ef2e0', block: '#59636a', gap: '#050607', puddle: 'rgba(60,110,130,0.45)' };

export function createScene2D({ canvas, setting = 'city', vehicle = 'foot', reduced = false }) {
  const g = canvas.getContext('2d');
  if (!g) throw new Error('no 2d canvas');
  let P = PAL[setting] || PAL.city;
  let run = null, W = 1, H = 1, dpr = 1, time = 0, shake = 0, phase = 0;
  const drops = Array.from({ length: reduced ? 40 : 110 }, () => [Math.random(), Math.random(), 0.5 + Math.random() * 0.5]);

  const camBack = 6, camH = 3;
  let hor = 0, f = 0, camX = 0, camY = 0;
  const sy = (dz, y = 0) => hor + ((camH + camY - y) * f) / (dz + camBack);
  const sx = (dz, x) => W / 2 + ((x - camX) * f) / (dz + camBack);
  const sc = (dz) => f / (dz + camBack);

  function figure(dz, x, y, slide, colBody, colLegs, ph) {
    const s = sc(dz), bx = sx(dz, x), by = sy(dz, y);
    const hgt = (slide > 0 ? 0.9 : 1.75) * s;
    g.save();
    g.translate(bx, by);
    g.lineCap = 'round';
    g.strokeStyle = colLegs; g.lineWidth = Math.max(2, 0.16 * s);
    const sw = Math.sin(ph) * 0.35 * s;
    g.beginPath(); g.moveTo(0, -hgt * 0.5); g.lineTo(sw, 0); g.moveTo(0, -hgt * 0.5); g.lineTo(-sw, 0); g.stroke();
    g.fillStyle = colBody; g.fillRect(-0.24 * s, -hgt * 0.92, 0.48 * s, hgt * 0.46);
    g.beginPath(); g.arc(0, -hgt * 0.92 - 0.12 * s, 0.13 * s, 0, Math.PI * 2); g.fillStyle = '#a8774f'; g.fill();
    g.strokeStyle = colBody; g.lineWidth = Math.max(2, 0.12 * s);
    g.beginPath(); g.moveTo(-0.22 * s, -hgt * 0.85); g.lineTo(-0.3 * s - sw * 0.6, -hgt * 0.55); g.moveTo(0.22 * s, -hgt * 0.85); g.lineTo(0.3 * s + sw * 0.6, -hgt * 0.55); g.stroke();
    g.restore();
  }
  function box(dz, x, y0, y1, w, col, outline) {
    const s = sc(dz);
    const x0 = sx(dz, x) - (w / 2) * s, top = sy(dz, y1), bot = sy(dz, y0);
    g.fillStyle = col; g.fillRect(x0, top, w * s, bot - top);
    if (outline) { g.strokeStyle = outline; g.lineWidth = Math.max(1, 0.05 * s); g.strokeRect(x0, top, w * s, bot - top); }
  }
  function slab(a, b, x, w, y0, y1, col) { // a long box seen from behind: its near face and its top
    a = Math.max(0.3, a);
    if (b <= a) return;
    const l = x - w / 2, r = x + w / 2;
    g.fillStyle = col;
    g.beginPath(); g.moveTo(sx(a, l), sy(a, y1)); g.lineTo(sx(a, r), sy(a, y1)); g.lineTo(sx(b, r), sy(b, y1)); g.lineTo(sx(b, l), sy(b, y1)); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.fillRect(sx(a, l), sy(a, y1), (r - l) * sc(a), sy(a, y0) - sy(a, y1));
  }

  function frame(dt, view) {
    time += dt;
    if (!run) return;
    const s = run.suspect;
    camX += (run.x * 0.6 - camX) * Math.min(1, dt * 8);
    camY = run.ground;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (shake > 0) { shake = Math.max(0, shake - dt * 2); g.translate((Math.random() - 0.5) * shake * 10, (Math.random() - 0.5) * shake * 8); }
    hor = H * 0.34; f = H * 0.78;
    const grd = g.createLinearGradient(0, 0, 0, hor);
    grd.addColorStop(0, P.sky[0]); grd.addColorStop(1, P.sky[1]);
    g.fillStyle = grd; g.fillRect(-20, -20, W + 40, hor + 20);
    g.fillStyle = '#081014';
    for (let i = 0; i < 14; i++) { const bw = W / 14; const bh = 10 + ((i * 37) % 23) * 1.6; g.fillRect(i * bw, hor - bh, bw - 2, bh); }
    g.fillStyle = P.side; g.fillRect(-20, hor, W + 40, H - hor + 20);
    const far = 90, base = run.dist;
    g.fillStyle = P.road;
    g.beginPath(); g.moveTo(sx(far, -3.9), sy(far)); g.lineTo(sx(far, 3.9), sy(far)); g.lineTo(sx(-2, 3.9), sy(-2)); g.lineTo(sx(-2, -3.9), sy(-2)); g.fill();
    for (let k = Math.ceil((base + far) / 6); k >= Math.floor(base / 6); k--) {
      const a = Math.max(0.3, k * 6 - base), b = k * 6 + 6 - base;
      if (b < 0.3 || a > far) continue;
      for (const side of [-1, 1]) {
        const hgt = 4 + ((k * 7 + (side > 0 ? 3 : 0)) % 5), x = side * 4.6;
        g.fillStyle = (k + (side > 0 ? 1 : 0)) % 2 ? P.wall : P.side;
        g.beginPath(); g.moveTo(sx(a, x), sy(a)); g.lineTo(sx(b, x), sy(b)); g.lineTo(sx(b, x), sy(b, hgt)); g.lineTo(sx(a, x), sy(a, hgt)); g.fill();
        const ld = k * 6 + 3 - base;
        if ((k + (side > 0 ? 1 : 0)) % 4 === 0 && ld > 1) {
          const lx = sx(ld, side * 4.2), ly = sy(ld, 4.4), r = Math.max(2, sc(ld) * 1.2);
          const lg = g.createRadialGradient(lx, ly, 0, lx, ly, r * 3);
          lg.addColorStop(0, P.lamp); lg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = lg; g.fillRect(lx - r * 3, ly - r * 3, r * 6, r * 6);
        }
      }
    }
    // things on the street, far to near, the suspect in depth order with them
    const sAhead = view.mode === 'catch' ? 1.6 : view.mode === 'lost' ? s.ahead + view.lostT * 18 : view.mode === 'escape' ? s.ahead + (view.escT || 0) * 9 : s.ahead;
    const sVis = !(view.mode === 'escape' && (view.escT || 0) > 1.3);
    let thiefDrawn = !sVis;
    for (let i = run.objs.length - 1; i >= 0; i--) {
      const o = run.objs[i];
      const dz = o.d - base;
      if (!thiefDrawn && dz < sAhead) { figure(sAhead, s.x, s.y + groundAt(run.features, base + sAhead) - camY, s.slideT, '#b8282f', '#2a3448', phase + 1.7); thiefDrawn = true; }
      if (dz + o.len / 2 < -1.5 || dz - o.len / 2 > far || o.hidden) continue;
      if (o.anim && o.anim.type !== 'shutter' && !o.settled && o.anim.type !== 'mover') continue;
      if (o.type === 'cup') {
        if (o.taken) continue;
        const cx = sx(dz, o.x), cy = sy(dz, 0.9 + Math.sin(time * 3) * 0.08), r = Math.max(2, sc(dz) * 0.22);
        g.fillStyle = '#c98a4a'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#ffd08a'; g.lineWidth = 2; g.stroke();
      } else if (o.type === 'stairs') slab(dz - o.len / 2, dz + o.len / 2, 0, 7.4, 0, 0.9, '#5c5c58');
      else if (o.wall) slab(dz - o.len / 2, dz + o.len / 2, o.x, o.w, 0, 2.3, '#3e4a56');
      else if (o.type === 'gap' || o.type === 'puddle') slab(dz - o.len / 2, dz + o.len / 2, o.x, o.w, 0, 0.01, TYPE_C[o.type]);
      else {
        let x = o.x;
        if (o.anim?.type === 'mover' && !o.settled) x = o.anim.from + (o.x - o.anim.from) * Math.max(0, Math.min(1, (o.reveal + 18 - dz) / 18));
        const knocked = o.hit ? 0.5 : 1;
        if (o.type === 'block') box(dz, x, 0, o.model === 'pole' ? 3.5 : 2.0, o.w, TYPE_C.block, '#e8a33d');
        else if (o.type === 'low') box(dz, x, 0, 0.65 * knocked, o.w, TYPE_C.low, '#2a1a10');
        else { box(dz, x - o.w / 2, 0, 2.0, 0.08, '#888', null); box(dz, x + o.w / 2, 0, 2.0, 0.08, '#888', null); box(dz, x, 1.25, 1.95, o.w, TYPE_C.high, '#0a3a3a'); }
      }
    }
    if (!thiefDrawn) figure(sAhead, s.x, s.y, s.slideT, '#b8282f', '#2a3448', phase + 1.7);
    if (vehicle === 'scooter' && sVis) box(sAhead, s.x, 0.2, 0.75, 0.5, '#c9c3b0', '#ff2a2a');
    if (view.mode === 'run' || view.mode === 'catch') phase += dt * run.speed * 1.5;
    figure(0, run.x, run.y, run.slideT, '#9a7a52', '#24282c', phase);
    g.strokeStyle = 'rgba(160,200,215,0.35)'; g.lineWidth = 1;
    g.beginPath();
    for (const d of drops) {
      d[1] = (d[1] + dt * d[2] * (reduced ? 0.6 : 1.4)) % 1;
      const x = d[0] * W, y = d[1] * H;
      g.moveTo(x, y); g.lineTo(x - 2, y + 12 * d[2]);
    }
    g.stroke();
    if (run.sprintT > 0) { g.fillStyle = 'rgba(232,163,61,0.12)'; g.fillRect(0, 0, W, H); }
  }

  return {
    kind: '2d',
    load(st) { P = PAL[st] || PAL.city; },
    attach(r) { run = r; },
    onAdd() {}, onDrop() {},
    event(e) { if (e.type === 'hit' && !reduced) shake = 0.6; },
    frame,
    resize(w, h, d) { W = Math.max(1, w); H = Math.max(1, h); dpr = d; canvas.width = Math.round(W * d); canvas.height = Math.round(H * d); },
    destroy() { run = null; canvas.width = canvas.height = 1; },
    set onThunder(fn) { /* no lightning in the plain view */ },
    get pov() { return false; },
    setPov() {},
    info: () => ({ calls: 0, triangles: 0 }),
  };
}
