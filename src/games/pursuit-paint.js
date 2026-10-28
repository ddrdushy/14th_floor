// Foot Chase: procedural canvas painting for ground textures and the far backdrops. No image files.
// Ground tiles are 256 x 512 px for a strip `wM` metres wide and 16 m long.
// Roughness maps use the green channel (three.js convention): dark = shiny wet, light = matte.

const TILE_M = 16;

function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

function speckle(g, r, w, h, n, base, spread, alpha = 0.5, size = 2) {
  for (let i = 0; i < n; i++) {
    const v = base + (r() - 0.5) * spread;
    g.fillStyle = `rgba(${v},${v + 2},${v + 4},${alpha})`;
    g.fillRect(r() * w, r() * h, size * (0.5 + r()), size * (0.5 + r()));
  }
}

function blob(g, x, y, rx, ry, fill, blur = 0) {
  g.save();
  if (blur) g.filter = `blur(${blur}px)`;
  g.fillStyle = fill;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** Puddles drawn on both maps: darker/bluer in colour, glassy in roughness. Wraps vertically. */
function puddles(g, rg, r, w, h, n, minR = 14, maxR = 42) {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, rx = minR + r() * (maxR - minR), ry = rx * (1.4 + r() * 1.6);
    for (const yy of [y, y - h, y + h]) {
      blob(g, x, yy, rx, ry, 'rgba(34,58,70,0.22)', 5);
      blob(g, x, yy, rx * 0.8, ry * 0.85, 'rgba(70,96,108,0.10)', 3);
      blob(rg, x, yy, rx * 1.1, ry * 1.1, 'rgb(0,92,0)', 8);
      blob(rg, x, yy, rx * 0.7, ry * 0.7, 'rgb(0,72,0)', 5);
    }
  }
}

export function drawGround(type, r, wM = 8) {
  const W = 256, H = 512, ppm = W / wM;
  const [c, g] = cv(W, H);
  const [rc, rg] = cv(W, H);
  const rough = (v) => { rg.fillStyle = `rgb(0,${Math.round(v * 255)},0)`; rg.fillRect(0, 0, W, H); };
  const yAt = (m) => (m / TILE_M) * H;
  const xAt = (m) => (m + wM / 2) * ppm; // x in metres from the centre
  if (type === 'asphalt' || type === 'market' || type === 'oldroad') {
    g.fillStyle = type === 'oldroad' ? '#1a1e20' : type === 'market' ? '#1e2120' : '#1b2023';
    g.fillRect(0, 0, W, H);
    rough(0.62);
    speckle(g, r, W, H, 5000, 40, 30, 0.45, 2);
    // patches and seams
    for (let i = 0; i < 4; i++) {
      g.fillStyle = `rgba(${30 + r() * 14},${34 + r() * 14},${36 + r() * 14},0.55)`;
      const x = r() * W, y = r() * H;
      g.fillRect(x, y, 30 + r() * 80, 40 + r() * 140);
    }
    g.strokeStyle = 'rgba(5,8,10,0.6)'; g.lineWidth = 1.2;
    for (let i = 0; i < 7; i++) { g.beginPath(); let x = r() * W, y = r() * H; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 30; y += r() * 26; g.lineTo(x, y); } g.stroke(); }
    if (type === 'asphalt') {
      // lane dashes, 3 m painted / 5 m gap
      g.fillStyle = 'rgba(205,205,190,0.32)';
      for (const lx of [-1.1, 1.1]) for (let m = 0; m < TILE_M; m += 8) g.fillRect(xAt(lx) - 3, yAt(m + 1), 6, yAt(3));
      // double yellow lines by the kerbs
      g.fillStyle = 'rgba(214,170,40,0.5)';
      for (const ex of [-3.55, -3.4, 3.4, 3.55]) g.fillRect(xAt(ex) - 1.5, 0, 3, H);
      // a manhole cover
      g.fillStyle = '#262a2c'; g.beginPath(); g.arc(xAt(0.4), yAt(9), 0.35 * ppm, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#151819'; g.lineWidth = 2; g.stroke();
    } else if (type === 'oldroad') {
      g.fillStyle = 'rgba(200,200,190,0.18)';
      for (const ex of [-3.5, 3.5]) g.fillRect(xAt(ex) - 2, 0, 4, H);
      g.fillStyle = '#2a2a28';
      g.fillRect(xAt(-0.6), yAt(5), 1.2 * ppm, 0.6 * ppm);
      g.strokeStyle = '#121212'; g.lineWidth = 1;
      for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(xAt(-0.6) + k * 0.2 * ppm, yAt(5)); g.lineTo(xAt(-0.6) + k * 0.2 * ppm, yAt(5.6)); g.stroke(); }
    } else {
      // litter after the market: leaves, paper, plastic
      const cols = ['rgba(90,130,60,0.7)', 'rgba(200,190,170,0.5)', 'rgba(170,40,40,0.55)', 'rgba(40,90,160,0.5)', 'rgba(220,150,40,0.5)'];
      for (let i = 0; i < 70; i++) {
        g.save(); g.translate(r() * W, r() * H); g.rotate(r() * 3);
        g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(-2, -1.5, 3 + r() * 5, 2 + r() * 3); g.restore();
      }
      g.fillStyle = 'rgba(200,200,190,0.12)';
      for (let m = 0; m < TILE_M; m += 8) g.fillRect(xAt(0) - 3, yAt(m + 1), 6, yAt(3));
    }
    puddles(g, rg, r, W, H, type === 'oldroad' ? 3 : 5);
  } else if (type === 'yard') {
    g.fillStyle = '#3a3d3e'; g.fillRect(0, 0, W, H);
    rough(0.7);
    speckle(g, r, W, H, 4000, 62, 26, 0.4, 2);
    g.strokeStyle = 'rgba(20,22,24,0.7)'; g.lineWidth = 1.5;
    for (let m = 0; m <= TILE_M; m += 4) { g.beginPath(); g.moveTo(0, yAt(m)); g.lineTo(W, yAt(m)); g.stroke(); }
    for (let x = 0; x <= W; x += 4 * ppm) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let i = 0; i < 6; i++) blob(g, r() * W, r() * H, 10 + r() * 22, 16 + r() * 30, 'rgba(14,14,12,0.45)', 6); // oil
    if (wM < 8.5) {
      g.fillStyle = 'rgba(222,178,40,0.75)';
      for (const lx of [-1.1, 1.1]) g.fillRect(xAt(lx) - 2.5, 0, 5, H);
      for (const ex of [-3.7, 3.7]) g.fillRect(xAt(ex) - 3, 0, 6, H);
    }
    puddles(g, rg, r, W, H, 6, 18, 55);
  } else if (type === 'roofdeck') {
    // a flat concrete roof: tar-sealed joints, patched slabs, a painted walkway line, ponding water
    g.fillStyle = '#34373a'; g.fillRect(0, 0, W, H);
    rough(0.66);
    speckle(g, r, W, H, 4000, 58, 24, 0.4, 2);
    for (let m = 0; m < TILE_M; m += 2) { g.fillStyle = 'rgba(12,12,12,0.7)'; g.fillRect(0, yAt(m), W, 2); }
    for (let x = 0; x <= W; x += 2 * ppm) { g.fillStyle = 'rgba(12,12,12,0.6)'; g.fillRect(x, 0, 2, H); }
    for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(${40 + r() * 20},${40 + r() * 18},${38 + r() * 14},0.6)`; g.fillRect(r() * W, r() * H, 30 + r() * 60, 20 + r() * 50); }
    g.fillStyle = 'rgba(214,170,40,0.35)';
    for (const ex of [-3.5, 3.5]) g.fillRect(xAt(ex) - 2, 0, 4, H);
    puddles(g, rg, r, W, H, 6, 16, 46);
  } else if (type === 'zinc') {
    // the lower roofs: rusty zinc sheets in patchwork
    g.fillStyle = '#2c2e2e'; g.fillRect(0, 0, W, H);
    rough(0.5);
    const sh = 1.2 * ppm, sl = 2.4 * (H / TILE_M);
    for (let y = 0; y < H; y += sl) for (let x = 0; x < W; x += sh) {
      const v = r();
      g.fillStyle = v < 0.3 ? `rgb(${70 + r() * 30},${44 + r() * 14},${30})` : `rgb(${58 + v * 26},${62 + v * 24},${64 + v * 22})`;
      g.fillRect(x, y, sh - 1, sl - 1);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      for (let k = 0; k < sh; k += 4) g.fillRect(x + k, y, 1.5, sl - 1);
    }
  } else if (type === 'laterite') {
    // a laterite lorry track: red earth, two ruts, standing water
    g.fillStyle = '#5a2e1c'; g.fillRect(0, 0, W, H);
    rough(0.8);
    for (let i = 0; i < 7000; i++) { const v = r(); g.fillStyle = `rgba(${90 + v * 50},${44 + v * 22},${26 + v * 12},0.5)`; g.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); }
    for (const rx of [-1.6, 1.4]) {
      g.fillStyle = 'rgba(40,18,10,0.55)'; g.fillRect(xAt(rx) - 0.35 * ppm, 0, 0.7 * ppm, H);
      rg.fillStyle = 'rgb(0,90,0)'; rg.fillRect(xAt(rx) - 0.3 * ppm, 0, 0.6 * ppm, H);
    }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(30,40,24,0.5)'; g.fillRect(r() < 0.5 ? r() * 0.12 * W : W - r() * 0.12 * W, r() * H, 3 + r() * 6, 2 + r() * 8); }
    puddles(g, rg, r, W, H, 6, 14, 40);
  } else if (type === 'planks') {
    g.fillStyle = '#3a2a1c'; g.fillRect(0, 0, W, H);
    rough(0.58);
    const pw = 0.28 * (H / TILE_M);
    const n = Math.round(H / pw);
    for (let i = 0; i < n; i++) {
      const y = i * (H / n);
      const v = r();
      g.fillStyle = `rgb(${78 + v * 30},${56 + v * 20},${36 + v * 12})`;
      g.fillRect(0, y + 1, W, H / n - 2);
      // a few planks are split across the width
      if (r() < 0.4) { g.fillStyle = 'rgba(20,12,8,0.8)'; g.fillRect(r() * W, y, 2, H / n); }
      g.fillStyle = 'rgba(20,14,10,0.7)';
      for (const xm of [-3.3, -1.1, 1.1, 3.3]) g.fillRect(xAt(xm) - 1, y + H / n / 2 - 1, 2, 2);
      if (r() < 0.3) { rg.fillStyle = 'rgb(0,60,0)'; rg.fillRect(r() * W * 0.7, y, 40 + r() * 80, H / n); }
    }
    speckle(g, r, W, H, 1500, 40, 30, 0.25, 2);
    puddles(g, rg, r, W, H, 2, 10, 24);
  } else if (type === 'pavement' || type === 'concrete') {
    g.fillStyle = type === 'pavement' ? '#30353a' : '#34332f'; g.fillRect(0, 0, W, H);
    rough(0.72);
    speckle(g, r, W, H, 3000, 58, 26, 0.4, 2);
    if (type === 'pavement') {
      g.strokeStyle = 'rgba(15,18,20,0.6)'; g.lineWidth = 1;
      for (let y = 0; y <= H; y += 0.6 * (H / TILE_M)) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      for (let x = 0; x <= W; x += 0.6 * ppm) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    }
    for (let i = 0; i < 5; i++) blob(g, r() * W, r() * H, 10 + r() * 30, 14 + r() * 30, 'rgba(12,12,10,0.35)', 6);
    puddles(g, rg, r, W, H, 4);
  } else if (type === 'tiles') {
    g.fillStyle = '#2a2420'; g.fillRect(0, 0, W, H);
    rough(0.66);
    const t = 0.3 * ppm;
    for (let y = 0; y < H; y += t) for (let x = 0; x < W; x += t) {
      const v = r();
      g.fillStyle = r() < 0.08 ? '#3a3a36' : `rgb(${92 + v * 30},${48 + v * 14},${36 + v * 10})`;
      g.fillRect(x + 1, y + 1, t - 2, t - 2);
    }
    puddles(g, rg, r, W, H, 3);
  } else { // grass and mud
    g.fillStyle = '#16200f'; g.fillRect(0, 0, W, H);
    rough(0.85);
    for (let i = 0; i < 6000; i++) {
      const v = r();
      g.fillStyle = v < 0.7 ? `rgba(${30 + r() * 20},${46 + r() * 26},${20 + r() * 10},0.6)` : `rgba(${48 + r() * 18},${38 + r() * 12},${26},0.6)`;
      g.fillRect(r() * W, r() * H, 1 + r() * 2, 2 + r() * 4);
    }
    for (let i = 0; i < 5; i++) blob(g, r() * W, r() * H, 20 + r() * 40, 30 + r() * 60, 'rgba(38,30,20,0.6)', 8);
    puddles(g, rg, r, W, H, 4, 20, 60);
  }
  return { color: c, roughness: rc };
}

// ---------------------------------------------------------------------------------------------
// backdrops: 1024 x 256, horizon at y = 194

const HOR = 194;

function sky(g, w, top, glow, bg) {
  const grd = g.createLinearGradient(0, 0, 0, HOR + 8);
  grd.addColorStop(0, top);
  grd.addColorStop(0.62, top);
  grd.addColorStop(1, glow);
  g.fillStyle = grd;
  g.fillRect(0, 0, w, HOR + 8);
  g.fillStyle = bg;
  g.fillRect(0, HOR + 6, w, 256);
}
function clouds(g, r, w, col, n = 10) {
  g.save();
  g.filter = 'blur(10px)';
  for (let i = 0; i < n; i++) { g.fillStyle = col; g.beginPath(); g.ellipse(r() * w, 30 + r() * 90, 80 + r() * 140, 14 + r() * 22, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
function windows(g, r, x, y, w, h, density, warm = 0.6) {
  for (let yy = y + 3; yy < y + h - 2; yy += 4) for (let xx = x + 2; xx < x + w - 2; xx += 3.5) {
    if (r() > density) continue;
    g.fillStyle = r() < warm ? `rgba(255,${190 + r() * 40},${110 + r() * 50},${0.5 + r() * 0.4})` : `rgba(${180 + r() * 40},${220 + r() * 30},255,${0.45 + r() * 0.4})`;
    g.fillRect(xx, yy, 1.6, 1.6);
  }
}
function skyline(g, r, w, base, minH, maxH, col, density, gap = 2) {
  let x = -10;
  while (x < w + 10) {
    const bw = 10 + r() * 34, bh = minH + r() * (maxH - minH);
    g.fillStyle = col;
    g.fillRect(x, base - bh, bw, bh + 10);
    if (r() < 0.25) g.fillRect(x + bw * 0.3, base - bh - 6 - r() * 10, bw * 0.4, 12);
    windows(g, r, x, base - bh, bw, bh, density);
    if (r() < 0.15) { g.fillStyle = 'rgba(255,40,40,0.9)'; g.fillRect(x + bw / 2, base - bh - 2, 2, 2); }
    x += bw + gap + r() * 6;
  }
}
function glowAt(g, x, y, rad, col) {
  const grd = g.createRadialGradient(x, y, 0, x, y, rad);
  grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
}
function klTower(g, x, base, h) {
  g.fillStyle = '#0c1418';
  g.beginPath(); g.moveTo(x - 6, base); g.lineTo(x - 3, base - h * 0.62); g.lineTo(x + 3, base - h * 0.62); g.lineTo(x + 6, base); g.fill();
  g.beginPath(); g.ellipse(x, base - h * 0.66, 9, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillRect(x - 7, base - h * 0.72, 14, 5);
  g.fillRect(x - 1, base - h, 2, h * 0.3);
  g.fillStyle = 'rgba(160,230,255,0.85)'; g.fillRect(x - 8, base - h * 0.665, 16, 1.5);
  g.fillStyle = 'rgba(255,60,60,1)'; g.fillRect(x - 1, base - h - 2, 2, 2);
  glowAt(g, x, base - h * 0.66, 18, 'rgba(120,200,240,0.25)');
}
function petronas(g, cx, base, h) {
  glowAt(g, cx, base - h * 0.55, h * 0.9, 'rgba(170,200,255,0.28)');
  for (const s of [-1, 1]) {
    const x = cx + s * 17, bw = 14;
    const tiers = [[0, 1], [0.55, 0.86], [0.7, 0.72], [0.8, 0.58], [0.87, 0.44], [0.92, 0.3]];
    for (let i = 0; i < tiers.length; i++) {
      const [y0, k] = tiers[i], y1 = i + 1 < tiers.length ? tiers[i + 1][0] : 0.96;
      const ww = bw * k;
      const grd = g.createLinearGradient(x - ww, 0, x + ww, 0);
      grd.addColorStop(0, '#6f7f96'); grd.addColorStop(0.45, '#e8eefc'); grd.addColorStop(0.6, '#f6f8ff'); grd.addColorStop(1, '#7a88a0');
      g.fillStyle = grd;
      g.fillRect(x - ww, base - h * y1, ww * 2, h * (y1 - y0) + 0.5);
      g.fillStyle = 'rgba(40,60,90,0.35)';
      for (let lx = x - ww + 2; lx < x + ww - 1; lx += 2.6) g.fillRect(lx, base - h * y1, 0.8, h * (y1 - y0));
    }
    g.fillStyle = '#e8eefc';
    g.beginPath(); g.moveTo(x - 1.6, base - h * 0.96); g.lineTo(x, base - h * 1.18); g.lineTo(x + 1.6, base - h * 0.96); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(x - 0.6, base - h * 1.18, 1.2, 2);
  }
  // the skybridge
  g.fillStyle = '#d8e0f0';
  g.fillRect(cx - 5, base - h * 0.44, 10, 2.4);
  g.strokeStyle = '#c0cbe0'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(cx, base - h * 0.43); g.lineTo(cx - 6, base - h * 0.3); g.moveTo(cx, base - h * 0.43); g.lineTo(cx + 6, base - h * 0.3); g.stroke();
}
function palmSil(g, x, base, h, s = 1) {
  g.strokeStyle = '#060c0c'; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + s * 6, base - h * 0.6, x + s * 4, base - h); g.stroke();
  g.lineWidth = 1.8;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.beginPath(); g.moveTo(x + s * 4, base - h);
    g.quadraticCurveTo(x + s * 4 + Math.cos(a) * 9, base - h - 6, x + s * 4 + Math.cos(a) * 15, base - h + 5 + Math.abs(Math.sin(a)) * 4);
    g.stroke();
  }
}
function crane(g, x, base, h, s) {
  g.strokeStyle = '#0a1012'; g.fillStyle = '#0a1012'; g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x - 14, base); g.lineTo(x - 10, base - h); g.moveTo(x + 14, base); g.lineTo(x + 10, base - h);
  g.moveTo(x - 12, base - h * 0.5); g.lineTo(x + 12, base - h * 0.5);
  g.moveTo(x - 14, base - h); g.lineTo(x + s * 80, base - h); // boom
  g.moveTo(x - 30 * s, base - h); g.lineTo(x - 30 * s, base - h);
  g.stroke();
  g.lineWidth = 1;
  g.beginPath(); g.moveTo(x, base - h - 18); g.lineTo(x + s * 70, base - h); g.moveTo(x, base - h - 18); g.lineTo(x - s * 26, base - h); g.moveTo(x - 6, base - h); g.lineTo(x, base - h - 18); g.lineTo(x + 6, base - h); g.stroke();
  g.fillStyle = 'rgba(255,50,50,1)'; g.fillRect(x - 1, base - h - 20, 2, 2); g.fillRect(x + s * 78, base - h - 2, 2, 2);
  glowAt(g, x + s * 40, base - h + 4, 16, 'rgba(255,190,120,0.35)');
  g.fillStyle = 'rgba(255,220,170,0.9)'; g.fillRect(x + s * 40, base - h + 1, 2, 2);
}

// The landmark on the skyline depends on the city the chase is in, not on the kind of street.
function komtar(g, x, base, h) {
  g.fillStyle = '#0c1418';
  g.fillRect(x - 14, base - h, 28, h + 6);
  for (let y = base - h + 4; y < base - 4; y += 4) for (let xx = x - 12; xx < x + 12; xx += 3) if ((xx * 7 + y * 13) % 5 < 2) { g.fillStyle = 'rgba(255,214,150,0.45)'; g.fillRect(xx, y, 1.5, 1.5); }
  g.fillStyle = 'rgba(255,60,60,1)'; g.fillRect(x - 1, base - h - 4, 2, 2);
}
function lotusTower(g, x, base, h) {
  glowAt(g, x, base - h * 0.8, h * 0.45, 'rgba(200,120,255,0.22)');
  g.fillStyle = '#121a20';
  g.beginPath(); g.moveTo(x - 7, base); g.lineTo(x - 2.5, base - h * 0.72); g.lineTo(x + 2.5, base - h * 0.72); g.lineTo(x + 7, base); g.fill();
  // the bud: four petals of light around a pod
  for (const [dx, k] of [[-1, 0.8], [1, 0.8], [0, 1]]) {
    g.fillStyle = k < 1 ? 'rgba(186,96,230,0.9)' : 'rgba(120,220,140,0.85)';
    g.beginPath(); g.ellipse(x + dx * 6, base - h * 0.8, 5 * k, 12 * k, dx * 0.5, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#121a20'; g.fillRect(x - 1, base - h, 2, h * 0.14);
  g.fillStyle = 'rgba(255,60,60,1)'; g.fillRect(x - 1, base - h - 2, 2, 2);
}
function landmark(g, city, kind, x, base, h) {
  if (city === 'colombo') { if (kind === 'twin') lotusTower(g, x, base, h * 1.1); return; }
  if (city === 'penang') { if (kind === 'twin') komtar(g, x, base, h * 0.9); return; }
  if (city === 'town') return;
  if (kind === 'twin') petronas(g, x, base, h); else klTower(g, x, base, h);
}
export function drawBackdrop(type, r, bg, haze = 0, city = 'kl') {
  const W = 1024, H = 256;
  const [c, g] = cv(W, H);
  if (type === 'mist') {
    // nothing but mist and the dark tops of the palms
    const grd = g.createLinearGradient(0, 0, 0, HOR + 8);
    grd.addColorStop(0, '#1a2224'); grd.addColorStop(1, bg);
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.fillStyle = bg; g.fillRect(0, HOR, W, H);
    for (let i = 0; i < 40; i++) palmSil(g, r() * W, HOR + 4, 24 + r() * 26, r() < 0.5 ? -1 : 1);
    glowAt(g, W * 0.72, HOR - 6, 30, 'rgba(255,190,110,0.35)');
  } else if (type === 'klcc') {
    sky(g, W, '#050b10', '#2a3a4a', bg);
    clouds(g, r, W, 'rgba(40,60,74,0.35)', 8);
    glowAt(g, W / 2, HOR, 360, 'rgba(255,170,90,0.12)');
    skyline(g, r, W, HOR + 4, 8, 34, '#0b1418', 0.3);
    landmark(g, city, 'tower', W / 2 - 170, HOR, 92);
    landmark(g, city, 'twin', W / 2 + 40, HOR + 2, 128);
    // kampung roofs and palms against the glow
    g.fillStyle = '#050a0b';
    for (let x = -20; x < W; x += 30 + r() * 40) { const hh = 6 + r() * 8; g.beginPath(); g.moveTo(x, HOR + 6); g.lineTo(x + 14, HOR + 6 - hh); g.lineTo(x + 28, HOR + 6); g.fill(); }
    for (let i = 0; i < 14; i++) palmSil(g, r() * W, HOR + 6, 18 + r() * 16, r() < 0.5 ? -1 : 1);
  } else if (type === 'port') {
    sky(g, W, '#070c0e', '#3a3226', bg);
    clouds(g, r, W, 'rgba(70,60,50,0.3)', 7);
    glowAt(g, W * 0.3, HOR, 300, 'rgba(255,150,60,0.16)');
    glowAt(g, W * 0.75, HOR, 260, 'rgba(255,150,60,0.12)');
    g.fillStyle = '#0a0f10';
    for (let x = 0; x < W; x += 26 + r() * 30) g.fillRect(x, HOR - 6 - r() * 14, 22 + r() * 20, 30);
    g.fillRect(W * 0.55, HOR - 22, 200, 30); // a ship's hull
    g.fillRect(W * 0.62, HOR - 40, 40, 20);
    windows(g, r, W * 0.62, HOR - 40, 40, 18, 0.5, 0.8);
    crane(g, W * 0.18, HOR + 2, 70, 1); crane(g, W * 0.42, HOR + 2, 82, 1); crane(g, W * 0.82, HOR + 2, 76, -1);
  } else if (type === 'penang') {
    sky(g, W, '#060c11', '#22323c', bg);
    clouds(g, r, W, 'rgba(50,70,84,0.35)', 9);
    // Penang Hill
    g.fillStyle = '#0a1418';
    g.beginPath(); g.moveTo(0, HOR); g.bezierCurveTo(W * 0.2, HOR - 70, W * 0.45, HOR - 50, W * 0.6, HOR - 80); g.bezierCurveTo(W * 0.75, HOR - 100, W * 0.9, HOR - 40, W, HOR - 30); g.lineTo(W, HOR + 6); g.lineTo(0, HOR + 6); g.fill();
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,200,130,0.6)'; g.fillRect(W * 0.5 + r() * W * 0.4, HOR - 30 - r() * 40, 1.5, 1.5); }
    // KOMTAR, when this is George Town
    if (city === 'kl' || city === 'penang') {
      g.fillStyle = '#0c1418';
      g.fillRect(W * 0.3 - 14, HOR - 120, 28, 126);
      windows(g, r, W * 0.3 - 14, HOR - 120, 28, 120, 0.25, 0.4);
      g.fillStyle = 'rgba(255,60,60,1)'; g.fillRect(W * 0.3 - 1, HOR - 124, 2, 2);
    } else if (city === 'colombo') lotusTower(g, W * 0.3, HOR, 130);
    skyline(g, r, W, HOR + 4, 6, 22, '#0b1418', 0.25, 0);
    // a temple roof
    g.fillStyle = '#0a1012';
    g.beginPath(); g.moveTo(W * 0.68 - 40, HOR - 18); g.quadraticCurveTo(W * 0.68, HOR - 30, W * 0.68 + 40, HOR - 18); g.lineTo(W * 0.68 + 30, HOR - 10); g.lineTo(W * 0.68 - 30, HOR - 10); g.fill();
  } else if (type === 'klroof') {
    // from the roofs the skyline is close and tall
    sky(g, W, '#050b10', '#26404c', bg);
    clouds(g, r, W, 'rgba(46,70,84,0.4)', 10);
    glowAt(g, W / 2, HOR, 420, 'rgba(255,170,90,0.12)');
    skyline(g, r, W, HOR + 4, 50, 150, '#0b141a', 0.45);
    landmark(g, city, 'tower', W * 0.3, HOR, 150);
    landmark(g, city, 'twin', W * 0.64, HOR + 2, 140);
    skyline(g, r, W, HOR + 6, 14, 54, '#070c0f', 0.3);
  } else if (type === 'chowkit') {
    sky(g, W, '#080a0c', '#3a2c22', bg);
    clouds(g, r, W, 'rgba(70,56,46,0.3)', 8);
    glowAt(g, W / 2, HOR, 380, 'rgba(255,160,80,0.13)');
    skyline(g, r, W, HOR + 4, 20, 70, '#0b1012', 0.35);
    landmark(g, city, 'tower', W * 0.78, HOR, 100);
    skyline(g, r, W, HOR + 6, 6, 26, '#07090a', 0.18);
  } else { // kl
    sky(g, W, '#050a0e', '#1e3640', bg);
    clouds(g, r, W, 'rgba(40,64,76,0.35)', 10);
    glowAt(g, W / 2, HOR, 380, 'rgba(255,170,90,0.1)');
    glowAt(g, W * 0.3, HOR, 200, 'rgba(255,60,140,0.08)');
    skyline(g, r, W, HOR + 4, 30, 110, '#0a1216', 0.4);
    landmark(g, city, 'tower', W * 0.22, HOR, 120);
    landmark(g, city, 'twin', W * 0.7, HOR + 2, 96);
    skyline(g, r, W, HOR + 6, 10, 40, '#060a0c', 0.2);
  }
  if (haze > 0) { g.globalAlpha = haze; g.fillStyle = bg; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  return c;
}
