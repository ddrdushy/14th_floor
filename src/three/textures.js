// Canvas-drawn textures: the KL night skyline, the room's surfaces, the cards pinned to the board,
// and the small printed things on the desk and walls. Everything is drawn once and cached by the scene.
import * as THREE from 'three';

function seeded(seed) {
  let a = seed;
  return () => {
    a = (a * 16807) % 2147483647;
    return (a - 1) / 2147483646;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(c, { srgb = true, repeat = null, aniso = 4 } = {}) {
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  return tex;
}

/* ------------------------------------------------------------------ */
/* KL at night, seen from the fourteenth floor                          */
/* ------------------------------------------------------------------ */

// Drawn in a 1536 x 1120 design space (the window's own aspect) and scaled to the canvas.
const CW = 1536, CH = 1120, HORIZON = 600;
// rows (design-space y) the shader runs traffic along; keep in sync with rainWindow.js
export const CITY_ROADS = [868, 952, 1048];

export function makeCityTexture(scale = 1) {
  const [c, g] = canvas(Math.round(CW * scale), Math.round(CH * scale));
  g.scale(scale, scale);
  const r = seeded(1408);

  // sky: monsoon cloud deck lit orange from below by the city
  const sky = g.createLinearGradient(0, 0, 0, HORIZON + 40);
  sky.addColorStop(0, '#050913');
  sky.addColorStop(0.32, '#0e1630');
  sky.addColorStop(0.62, '#2a2442');
  sky.addColorStop(0.86, '#6a3a3c');
  sky.addColorStop(1, '#a35a3a');
  g.fillStyle = sky;
  g.fillRect(0, 0, CW, HORIZON + 40);
  for (let i = 0; i < 70; i++) {
    const x = r() * CW, y = 30 + r() * (HORIZON - 120), rx = 120 + r() * 260, ry = 30 + r() * 60;
    const lowLit = y / HORIZON;
    const grd = g.createRadialGradient(x, y, 0, x, y, rx);
    grd.addColorStop(0, `rgba(${Math.round(60 + 110 * lowLit)}, ${Math.round(52 + 50 * lowLit)}, ${Math.round(80 + 20 * lowLit)}, ${0.1 + 0.08 * lowLit})`);
    grd.addColorStop(1, 'rgba(40, 40, 70, 0)');
    g.fillStyle = grd;
    g.save();
    g.translate(x, y);
    g.scale(1, ry / rx);
    g.translate(-x, -y);
    g.fillRect(x - rx, y - rx, rx * 2, rx * 2);
    g.restore();
  }

  // the ground plane below the horizon: the city seen from above, thousands of sodium lights
  const ground = g.createLinearGradient(0, HORIZON, 0, CH);
  ground.addColorStop(0, '#2a1a20');
  ground.addColorStop(0.25, '#140f16');
  ground.addColorStop(1, '#0a0a10');
  g.fillStyle = ground;
  g.fillRect(0, HORIZON, CW, CH - HORIZON);
  const dot = (x, y, rad, col, a) => {
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(${col}, ${a})`);
    grd.addColorStop(0.35, `rgba(${col}, ${a * 0.45})`);
    grd.addColorStop(1, `rgba(${col}, 0)`);
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  };
  // avenues converging on the horizon
  const vx = CW * 0.52;
  for (let k = 0; k < 9; k++) {
    const x0 = -400 + k * 290 + r() * 80;
    for (let s = 0; s < 70; s++) {
      const t = Math.pow(s / 70, 1.6);
      const x = vx + (x0 - vx) * t, y = HORIZON + 10 + (CH - HORIZON) * t;
      dot(x + (r() - 0.5) * 6, y, 1.5 + t * 7, r() < 0.8 ? '255, 176, 86' : '255, 236, 200', 0.5 + r() * 0.4);
    }
  }
  for (let i = 0; i < 2200; i++) {
    const t = Math.pow(r(), 2.1);
    const y = HORIZON + 6 + t * (CH - HORIZON - 6);
    const x = r() * CW;
    const v = r();
    const col = v < 0.62 ? '255, 170, 80' : v < 0.82 ? '255, 230, 190' : v < 0.92 ? '120, 200, 255' : '255, 90, 90';
    dot(x, y, 0.8 + t * 5, col, 0.35 + r() * 0.5);
  }
  // roads where the traffic runs (the moving lights are added in the window shader)
  CITY_ROADS.forEach((y, i) => {
    g.fillStyle = 'rgba(8, 8, 12, 0.85)';
    g.fillRect(0, y - 7 - i * 2, CW, 14 + i * 4);
    g.fillStyle = 'rgba(255, 190, 120, 0.12)';
    g.fillRect(0, y - 9 - i * 2, CW, 2);
    for (let x = 10; x < CW; x += 90 + i * 30) dot(x, y - 12 - i * 3, 10 + i * 4, '255, 180, 90', 0.45);
  });

  // far skyline along the horizon
  const block = (x, bw, top, base, col, lit, cell = 9) => {
    g.fillStyle = col;
    g.fillRect(x, top, bw, base - top);
    for (let yy = top + 6; yy < base - 4; yy += cell + 2) {
      for (let xx = x + 3; xx < x + bw - 3; xx += cell) {
        if (r() < lit) {
          const warm = r() < 0.72;
          g.fillStyle = warm ? `rgba(255, ${185 + r() * 55}, ${105 + r() * 70}, ${0.45 + r() * 0.5})` : `rgba(165, 210, 255, ${0.35 + r() * 0.45})`;
          g.fillRect(xx, yy, Math.max(2, cell * 0.45), Math.max(2, cell * 0.5));
        }
      }
    }
  };
  for (let x = -10; x < CW; x += 14 + r() * 30) block(x, 14 + r() * 34, HORIZON - 20 - r() * 90, HORIZON + 30, '#1a1b2c', 0.22, 5);

  // KL Tower: shaft, the lit pod, the antenna and its red light
  const klx = 300;
  g.fillStyle = '#141a2b';
  g.beginPath();
  g.moveTo(klx - 16, 740);
  g.lineTo(klx - 7, 300);
  g.lineTo(klx + 7, 300);
  g.lineTo(klx + 16, 740);
  g.fill();
  g.beginPath();
  g.ellipse(klx, 290, 46, 14, 0, 0, Math.PI * 2);
  g.fill();
  g.fillRect(klx - 34, 262, 68, 26);
  g.beginPath();
  g.ellipse(klx, 262, 36, 10, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(140, 220, 255, 0.85)';
  g.fillRect(klx - 40, 280, 80, 3);
  g.fillStyle = 'rgba(255, 210, 150, 0.8)';
  for (let i = -30; i <= 30; i += 6) g.fillRect(klx + i, 268, 3, 8);
  g.fillStyle = '#141a2b';
  g.fillRect(klx - 3, 130, 6, 135);
  g.fillRect(klx - 1, 70, 2, 70);
  dot(klx, 70, 16, '255, 60, 60', 0.95);
  dot(klx, 290, 120, '120, 200, 255', 0.12);
  for (let yy = 330; yy < 730; yy += 26) { g.fillStyle = 'rgba(200, 230, 255, 0.35)'; g.fillRect(klx - 2, yy, 4, 8); }

  // Petronas Twin Towers, lit silver
  const tower = (cx) => {
    const base = 780;
    const tiers = [[46, 330], [40, 290], [34, 250], [27, 214], [20, 182], [13, 156], [8, 136]];
    g.fillStyle = '#20283c';
    tiers.forEach(([hw, top]) => g.fillRect(cx - hw, top, hw * 2, base - top));
    // spire
    g.beginPath();
    g.moveTo(cx - 6, 140);
    g.lineTo(cx, 30);
    g.lineTo(cx + 6, 140);
    g.fill();
    // vertical light ribs and tier bands
    tiers.forEach(([hw, top], ti) => {
      const next = ti ? tiers[ti - 1][1] : base;
      for (let xx = cx - hw + 4; xx < cx + hw - 2; xx += 6) {
        const edge = 1 - Math.abs(xx - cx) / hw;
        g.fillStyle = `rgba(215, 230, 255, ${0.18 + edge * 0.5})`;
        g.fillRect(xx, top + 2, 1.6, next - top - 4);
      }
      g.fillStyle = 'rgba(235, 242, 255, 0.85)';
      g.fillRect(cx - hw, top, hw * 2, 2);
    });
    g.fillStyle = 'rgba(235, 242, 255, 0.9)';
    g.fillRect(cx - 1, 40, 2, 100);
    dot(cx, 160, 140, '190, 215, 255', 0.16);
    dot(cx, 34, 10, '255, 255, 255', 0.9);
  };
  tower(1040);
  tower(1170);
  // the skybridge
  g.fillStyle = '#20283c';
  g.fillRect(1080, 468, 52, 10);
  g.fillStyle = 'rgba(235, 242, 255, 0.85)';
  g.fillRect(1080, 470, 52, 2);
  g.strokeStyle = 'rgba(200, 220, 255, 0.5)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(1090, 478);
  g.lineTo(1106, 520);
  g.lineTo(1122, 478);
  g.stroke();

  // mid-distance towers: lit window grids, a few LED crowns and aircraft lights
  for (let x = -20; x < CW; x += 50 + r() * 70) {
    if (x > 980 && x < 1230) continue; // keep the twin towers clear
    const bw = 40 + r() * 70, top = HORIZON - 40 - r() * 230, base = HORIZON + 120 + r() * 60;
    block(x, bw, top, base, r() < 0.5 ? '#121626' : '#161a2b', 0.28 + r() * 0.2, 8);
    if (r() < 0.35) dot(x + bw / 2, top - 4, 7, '255, 60, 60', 0.9);
    if (r() < 0.22) {
      g.fillStyle = r() < 0.5 ? 'rgba(70, 230, 210, 0.7)' : 'rgba(255, 90, 170, 0.7)';
      g.fillRect(x, top, bw, 3);
      dot(x + bw / 2, top, bw * 0.8, '120, 220, 220', 0.08);
    }
  }

  // near towers at the sides, close enough to see rooms
  const near = (x, bw, top) => {
    g.fillStyle = '#0b0d16';
    g.fillRect(x, top, bw, CH - top);
    for (let yy = top + 14; yy < CH - 20; yy += 26) {
      for (let xx = x + 10; xx < x + bw - 16; xx += 22) {
        const v = r();
        if (v < 0.16) {
          g.fillStyle = `rgba(255, ${190 + r() * 40}, ${120 + r() * 50}, ${0.55 + r() * 0.35})`;
          g.fillRect(xx, yy, 14, 16);
        } else if (v < 0.2) {
          g.fillStyle = 'rgba(120, 170, 255, 0.55)';
          g.fillRect(xx, yy, 14, 16);
        }
      }
    }
  };
  near(-30, 190, 380);
  near(1390, 180, 300);

  // a hotel's vertical neon on the right tower
  g.save();
  g.shadowColor = 'rgba(255, 70, 80, 0.9)';
  g.shadowBlur = 18;
  g.fillStyle = 'rgba(255, 90, 100, 0.95)';
  g.font = '800 34px "Big Shoulders Display", sans-serif';
  ['H', 'O', 'T', 'E', 'L'].forEach((ch, i) => g.fillText(ch, 1405, 380 + i * 36));
  g.restore();

  // haze where the city light meets the cloud
  const haze = g.createLinearGradient(0, HORIZON - 160, 0, HORIZON + 120);
  haze.addColorStop(0, 'rgba(200, 120, 100, 0)');
  haze.addColorStop(0.6, 'rgba(210, 130, 100, 0.16)');
  haze.addColorStop(1, 'rgba(120, 80, 90, 0)');
  g.fillStyle = haze;
  g.fillRect(0, HORIZON - 160, CW, 280);

  const tex = toTexture(c, { aniso: 1 });
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

/* ------------------------------------------------------------------ */
/* Room surfaces                                                         */
/* ------------------------------------------------------------------ */

export function makeCorkTexture() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#9a6d40';
  g.fillRect(0, 0, 512, 512);
  const r = seeded(77);
  for (let i = 0; i < 14000; i++) {
    const v = r();
    g.fillStyle = v < 0.5 ? `rgba(60, 35, 15, ${0.15 + r() * 0.3})` : `rgba(215, 165, 105, ${0.1 + r() * 0.25})`;
    g.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 3);
  }
  // old pin holes
  for (let i = 0; i < 90; i++) {
    g.fillStyle = 'rgba(30, 18, 8, 0.55)';
    g.fillRect(r() * 512, r() * 512, 2, 2);
  }
  return toTexture(c, { repeat: [2, 1.3] });
}

/** Painted plaster, mottled by years of damp. Repeats across the walls. */
export function makePlasterTexture() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#7d8c86';
  g.fillRect(0, 0, 512, 512);
  const r = seeded(31);
  for (let i = 0; i < 140; i++) {
    const x = r() * 512, y = r() * 512, rad = 20 + r() * 90;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    const dark = r() < 0.55;
    grd.addColorStop(0, dark ? 'rgba(40, 50, 45, 0.08)' : 'rgba(170, 180, 165, 0.08)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 6000; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? '30, 36, 34' : '200, 205, 195'}, ${0.04 + r() * 0.06})`;
    g.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2);
  }
  // a damp streak or two
  for (let i = 0; i < 5; i++) {
    const x = r() * 512;
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, 'rgba(40, 45, 40, 0.07)');
    grd.addColorStop(1, 'rgba(40, 45, 40, 0)');
    g.fillStyle = grd;
    g.fillRect(x, 0, 6 + r() * 10, 300 + r() * 200);
  }
  return toTexture(c, { repeat: [3, 1.5] });
}

/** Dark varnished planks, scuffed where the chair rolls. */
export function makeFloorTexture() {
  const [c, g] = canvas(1024, 1024);
  const r = seeded(19);
  const plank = 1024 / 8;
  for (let i = 0; i < 8; i++) {
    let y = 0;
    const off = r() * 300;
    while (y < 1024) {
      const len = 280 + r() * 400;
      const tone = 34 + r() * 18;
      g.fillStyle = `rgb(${tone + 16}, ${tone}, ${tone * 0.7})`;
      g.fillRect(i * plank, y - off, plank, len);
      g.fillRect(i * plank, y - off + 1024, plank, len);
      for (let k = 0; k < 26; k++) {
        g.fillStyle = `rgba(${r() < 0.5 ? '20, 12, 6' : '110, 75, 45'}, ${0.08 + r() * 0.12})`;
        g.fillRect(i * plank + r() * plank, y - off + r() * len, 1 + r() * 2, 30 + r() * 120);
      }
      g.fillStyle = 'rgba(8, 5, 3, 0.9)';
      g.fillRect(i * plank, y - off, plank, 2);
      y += len;
    }
    g.fillStyle = 'rgba(8, 5, 3, 0.95)';
    g.fillRect(i * plank, 0, 2, 1024);
  }
  return toTexture(c, { repeat: [3, 3] });
}

/** Warm teak grain for the desk and the board frame. */
export function makeWoodTexture(seed = 5, base = [92, 58, 34]) {
  const [c, g] = canvas(512, 256);
  const [R, G, B] = base;
  g.fillStyle = `rgb(${R}, ${G}, ${B})`;
  g.fillRect(0, 0, 512, 256);
  const r = seeded(seed);
  for (let i = 0; i < 160; i++) {
    const y = r() * 256;
    g.strokeStyle = `rgba(${r() < 0.6 ? '35, 20, 10' : '150, 100, 60'}, ${0.08 + r() * 0.18})`;
    g.lineWidth = 0.6 + r() * 2;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.012 + i) * 4 + (r() - 0.5) * 2);
    g.stroke();
  }
  return toTexture(c, { repeat: [1, 1] });
}

/** A worn rug: maroon field, faded border, the kind sold by the kilo on Jalan Masjid India. */
export function makeRugTexture() {
  const [c, g] = canvas(512, 384);
  const r = seeded(404);
  g.fillStyle = '#4a1a1c';
  g.fillRect(0, 0, 512, 384);
  g.strokeStyle = '#a07a46';
  g.lineWidth = 10;
  g.strokeRect(22, 22, 468, 340);
  g.strokeStyle = '#1f2a3a';
  g.lineWidth = 6;
  g.strokeRect(40, 40, 432, 304);
  g.fillStyle = 'rgba(160, 122, 70, 0.55)';
  for (let i = 0; i < 9; i++) {
    g.save();
    g.translate(256, 192);
    g.rotate((i / 9) * Math.PI * 2);
    g.beginPath();
    g.ellipse(0, -60, 14, 46, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? '0, 0, 0' : '200, 150, 120'}, ${r() * 0.12})`;
    g.fillRect(r() * 512, r() * 384, 2, 2);
  }
  return toTexture(c);
}

/* ------------------------------------------------------------------ */
/* Board cards                                                           */
/* ------------------------------------------------------------------ */

const imageCache = new Map();
/** Resolves to the loaded image, or null when it is missing. Cached per URL. */
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    }));
  }
  return imageCache.get(src);
}

function paper(g, w, h, seed, tone = '#f1ead8') {
  g.fillStyle = tone;
  g.fillRect(0, 0, w, h);
  const r = seeded(seed);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? '120, 100, 70' : '255, 255, 255'}, ${r() * 0.07})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  const edge = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  edge.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edge.addColorStop(1, 'rgba(110, 85, 50, 0.22)');
  g.fillStyle = edge;
  g.fillRect(0, 0, w, h);
}

function cover(g, img, dx, dy, dw, dh, focusY = 0.35) {
  const ar = dw / dh;
  let sw = img.width, sh = img.width / ar;
  if (sh > img.height) { sh = img.height; sw = sh * ar; }
  const sx = (img.width - sw) / 2;
  const sy = Math.max(0, Math.min(img.height - sh, img.height * focusY - sh * focusY));
  g.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function fitText(g, text, maxW, weightFamily, start, min) {
  let size = start;
  g.font = `${weightFamily.replace('{s}', size)}`;
  while (g.measureText(text).width > maxW && size > min) {
    size -= 2;
    g.font = `${weightFamily.replace('{s}', size)}`;
  }
  if (g.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && g.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

function silhouette(g, x, y, w, h) {
  g.fillStyle = '#c9bfa8';
  g.fillRect(x, y, w, h);
  g.fillStyle = '#1d1a16';
  g.globalAlpha = 0.85;
  g.beginPath();
  g.ellipse(x + w / 2, y + h * 0.4, w * 0.2, h * 0.24, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(x + w / 2, y + h * 1.02, w * 0.42, h * 0.38, 0, Math.PI, 0);
  g.fill();
  g.globalAlpha = 1;
}

/** A suspect's mugshot as a pinned polaroid: photo, name, role, and the player's mark stamped across it. */
export function makeSuspectCardTexture(card, img) {
  const W = 384, H = 512;
  const [c, g] = canvas(W, H);
  paper(g, W, H, (card.name || '').length * 13 + 7);
  const px = 22, py = 22, pw = W - 44, ph = 372;
  if (img) {
    g.save();
    g.filter = 'sepia(0.18) contrast(1.06) saturate(0.85)';
    cover(g, img, px, py, pw, ph, 0.3);
    g.restore();
    const vig = g.createRadialGradient(px + pw / 2, py + ph / 2, ph * 0.25, px + pw / 2, py + ph / 2, ph * 0.75);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(20, 12, 4, 0.35)');
    g.fillStyle = vig;
    g.fillRect(px, py, pw, ph);
  } else {
    silhouette(g, px, py, pw, ph);
  }
  g.strokeStyle = 'rgba(30, 25, 20, 0.35)';
  g.lineWidth = 2;
  g.strokeRect(px, py, pw, ph);
  g.fillStyle = '#1d1a16';
  const name = fitText(g, card.name || '', W - 44, '800 {s}px "Big Shoulders Display", sans-serif', 50, 32);
  g.fillText(name, 22, 440);
  g.fillStyle = '#4a443b';
  const role = fitText(g, card.role || '', W - 44, '{s}px "Special Elite", monospace', 24, 16);
  g.fillText(role, 22, 476);
  if (card.mark) {
    g.save();
    g.translate(W * 0.58, 120);
    g.rotate(-0.22);
    g.strokeStyle = card.mark === 'cleared' ? '#2f7a52' : '#b3202a';
    g.fillStyle = g.strokeStyle;
    g.lineWidth = 7;
    g.globalAlpha = 0.88;
    g.font = '800 54px "Big Shoulders Display", sans-serif';
    const label = card.mark.toUpperCase();
    const tw = g.measureText(label).width;
    g.strokeRect(-tw / 2 - 14, -46, tw + 28, 64);
    g.fillText(label, -tw / 2, 4);
    g.restore();
  }
  return toTexture(c);
}

/** An evidence photo as a pinned print: 4:3 photo, exhibit number and title. */
export function makeEvidenceCardTexture(card, img) {
  const W = 512, H = 464;
  const [c, g] = canvas(W, H);
  paper(g, W, H, (card.tag || 1) * 31 + 3, '#f3eddc');
  const px = 18, py = 18, pw = W - 36, ph = Math.round((W - 36) * 0.75);
  if (img) {
    g.save();
    g.filter = 'contrast(1.08) saturate(0.9)';
    cover(g, img, px, py, pw, ph, 0.5);
    g.restore();
  } else {
    const grd = g.createLinearGradient(0, py, 0, py + ph);
    grd.addColorStop(0, '#2c3e4c');
    grd.addColorStop(1, '#121a21');
    g.fillStyle = grd;
    g.fillRect(px, py, pw, ph);
    g.fillStyle = 'rgba(237, 230, 214, 0.5)';
    g.font = '28px "Special Elite", monospace';
    g.fillText('Photo pending', px + 20, py + ph - 24);
  }
  // yellow exhibit tag in the photo's corner, like the forensic markers on the balcony
  g.fillStyle = '#f2c230';
  g.fillRect(px + 12, py + 12, 74, 62);
  g.fillStyle = '#1d1a16';
  g.font = '800 52px "Big Shoulders Display", sans-serif';
  const tag = String(card.tag ?? '');
  g.fillText(tag, px + 12 + (74 - g.measureText(tag).width) / 2, py + 64);
  g.fillStyle = '#1d1a16';
  const title = fitText(g, card.title || '', W - 40, '{s}px "Special Elite", monospace', 34, 22);
  g.fillText(title, 20, H - 30);
  return toTexture(c);
}

/* ------------------------------------------------------------------ */
/* Desk and wall details                                                 */
/* ------------------------------------------------------------------ */

/** The case file on the desk: manila cover, typed label, a red CONFIDENTIAL stamp. */
export function makeFolderTexture(label = 'CASE 1', title = '') {
  const W = 512, H = 368;
  const [c, g] = canvas(W, H);
  paper(g, W, H, 91, '#d6bf8e');
  g.fillStyle = 'rgba(80, 60, 30, 0.25)';
  g.fillRect(0, 0, W, 6);
  // typed label strip
  g.fillStyle = '#f3ecd8';
  g.fillRect(44, 54, 300, 96);
  g.strokeStyle = 'rgba(60, 45, 25, 0.5)';
  g.strokeRect(44, 54, 300, 96);
  g.fillStyle = '#1d1a16';
  g.font = '34px "Special Elite", monospace';
  g.fillText(label, 60, 96);
  g.font = '800 36px "Big Shoulders Display", sans-serif';
  g.fillText(fitText(g, title, 270, '800 {s}px "Big Shoulders Display", sans-serif', 36, 22), 60, 136);
  g.save();
  g.translate(360, 270);
  g.rotate(-0.12);
  g.strokeStyle = 'rgba(179, 32, 42, 0.85)';
  g.fillStyle = 'rgba(179, 32, 42, 0.85)';
  g.lineWidth = 5;
  g.font = '800 40px "Big Shoulders Display", sans-serif';
  const t = 'SULIT';
  const tw = g.measureText(t).width;
  g.strokeRect(-tw / 2 - 12, -38, tw + 24, 52);
  g.fillText(t, -tw / 2, 2);
  g.restore();
  return toTexture(c);
}

/** The framed private investigator's licence on the wall. */
export function makeLicenceTexture(name = '', number = '') {
  const W = 384, H = 288;
  const [c, g] = canvas(W, H);
  paper(g, W, H, 12, '#efe6cf');
  g.strokeStyle = '#7a5a2a';
  g.lineWidth = 6;
  g.strokeRect(14, 14, W - 28, H - 28);
  g.lineWidth = 1.5;
  g.strokeRect(24, 24, W - 48, H - 48);
  g.fillStyle = '#1d2a4a';
  g.font = '800 30px "Big Shoulders Display", sans-serif';
  const head = 'LESEN PENYIASAT PERSENDIRIAN';
  g.fillText(fitText(g, head, W - 70, '800 {s}px "Big Shoulders Display", sans-serif', 30, 18), 36, 70);
  g.fillStyle = '#4a443b';
  g.font = '18px "Special Elite", monospace';
  g.fillText('Private Investigator Licence', 36, 98);
  g.fillStyle = '#1d1a16';
  g.fillText(fitText(g, name, W - 80, '700 {s}px "Special Elite", monospace', 30, 18), 36, 160);
  g.font = '18px "Special Elite", monospace';
  if (number) g.fillText(`No. ${number}`, 36, 196);
  // seal
  g.fillStyle = 'rgba(179, 32, 42, 0.8)';
  g.beginPath();
  g.arc(W - 70, H - 72, 30, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#1d1a16';
  g.beginPath();
  g.moveTo(40, H - 50);
  g.bezierCurveTo(90, H - 80, 120, H - 30, 180, H - 60);
  g.stroke();
  return toTexture(c);
}

/** Wall clock face. */
export function makeClockTexture() {
  const S = 256;
  const [c, g] = canvas(S, S);
  g.fillStyle = '#efe7d2';
  g.beginPath();
  g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#1d1a16';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const len = i % 5 ? 6 : 16, wd = i % 5 ? 2 : 5;
    g.save();
    g.translate(S / 2, S / 2);
    g.rotate(a);
    g.fillRect(-wd / 2, -S / 2 + 10, wd, len);
    g.restore();
  }
  g.font = '700 22px "Archivo", sans-serif';
  g.textAlign = 'center';
  g.fillText('SEIKO', S / 2, S / 2 - 40);
  const edge = g.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S / 2);
  edge.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edge.addColorStop(1, 'rgba(90, 70, 40, 0.35)');
  g.fillStyle = edge;
  g.fillRect(0, 0, S, S);
  return toTexture(c);
}

/** Soft round glow for sprites (bulbs, phone screen, pins catching light). */
export function makeGlowTexture() {
  const [c, g] = canvas(128, 128);
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grd.addColorStop(0.25, 'rgba(255, 255, 255, 0.45)');
  grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return toTexture(c, { srgb: false, aniso: 1 });
}

/** The phone's lock screen: time and, when it rings, the caller. */
export function drawPhoneScreen(ctx, w, h, { time = '', ringing = false, caller = '' } = {}) {
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, ringing ? '#163a2c' : '#0e1a2a');
  grd.addColorStop(1, ringing ? '#0a1f18' : '#060b14');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(237, 240, 245, 0.92)';
  ctx.textAlign = 'center';
  ctx.font = '700 64px "Archivo", sans-serif';
  ctx.fillText(time, w / 2, h * 0.3);
  if (ringing) {
    ctx.font = '600 26px "Archivo", sans-serif';
    ctx.fillText('Incoming call', w / 2, h * 0.52);
    ctx.font = '700 30px "Archivo", sans-serif';
    ctx.fillText(caller || 'Unknown', w / 2, h * 0.6);
    ctx.fillStyle = '#2fbf71';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.82, 34, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.font = '22px "Archivo", sans-serif';
    ctx.fillStyle = 'rgba(237, 240, 245, 0.6)';
    ctx.fillText('No new messages', w / 2, h * 0.42);
  }
  ctx.textAlign = 'left';
}
