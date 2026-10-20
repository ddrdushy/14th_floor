// Canvas-drawn textures: the KL night skyline, cork, and the cards pinned to the board.
import * as THREE from 'three';

function seeded(seed) {
  let a = seed;
  return () => {
    a = (a * 16807) % 2147483647;
    return (a - 1) / 2147483646;
  };
}

export function makeCityTexture() {
  const w = 1024, h = 640;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const r = seeded(1408);
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0b1424');
  sky.addColorStop(0.55, '#20263f');
  sky.addColorStop(0.85, '#5a3a3a');
  sky.addColorStop(1, '#8a5a3a');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  // far buildings
  const drawBlock = (x, bw, bh, col, lit) => {
    g.fillStyle = col;
    g.fillRect(x, h - bh, bw, bh);
    for (let yy = h - bh + 8; yy < h - 10; yy += 11) {
      for (let xx = x + 5; xx < x + bw - 5; xx += 9) {
        if (r() < lit) {
          g.fillStyle = r() < 0.75 ? `rgba(255, ${190 + r() * 50}, ${110 + r() * 60}, ${0.5 + r() * 0.5})` : `rgba(170, 210, 255, ${0.4 + r() * 0.4})`;
          g.fillRect(xx, yy, 4, 5);
        }
      }
    }
  };
  for (let x = -20; x < w; x += 30 + r() * 50) drawBlock(x, 40 + r() * 60, 120 + r() * 160, '#141a2a', 0.25);

  // Petronas Twin Towers
  const tower = (cx) => {
    g.fillStyle = '#1b2234';
    const levels = [[34, 360], [30, 400], [24, 440], [17, 470], [10, 495], [5, 515]];
    levels.forEach(([hw, top]) => g.fillRect(cx - hw, h - top, hw * 2, top));
    g.fillRect(cx - 1.5, h - 585, 3, 75);
    g.fillStyle = 'rgba(210, 225, 255, .55)';
    for (let yy = h - 500; yy < h - 20; yy += 7) g.fillRect(cx - 26 + (yy % 3), yy, 52 - (yy < h - 400 ? 22 : 0), 1.2);
  };
  tower(610);
  tower(700);
  g.fillStyle = '#1b2234';
  g.fillRect(610, h - 300, 90, 8);

  // KL Tower
  g.fillStyle = '#1a2133';
  g.fillRect(842, h - 420, 10, 420);
  g.beginPath();
  g.ellipse(847, h - 430, 30, 18, 0, 0, Math.PI * 2);
  g.fill();
  g.fillRect(845, h - 540, 4, 110);
  g.fillStyle = 'rgba(255, 120, 120, .9)';
  g.fillRect(845, h - 545, 4, 6);

  // near buildings
  for (let x = -30; x < w; x += 60 + r() * 70) drawBlock(x, 60 + r() * 80, 60 + r() * 110, '#0c0f18', 0.35);

  // street-level bokeh
  for (let i = 0; i < 120; i++) {
    const x = r() * w, y = h - r() * 70, rad = 4 + r() * 16;
    const col = r() < 0.6 ? '255, 170, 70' : r() < 0.5 ? '255, 70, 70' : '120, 220, 200';
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(${col}, .55)`);
    grd.addColorStop(1, `rgba(${col}, 0)`);
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // haze
  const haze = g.createLinearGradient(0, h * 0.4, 0, h);
  haze.addColorStop(0, 'rgba(120, 100, 120, 0)');
  haze.addColorStop(1, 'rgba(160, 110, 90, .25)');
  g.fillStyle = haze;
  g.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

export function makeCorkTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#93693f';
  g.fillRect(0, 0, 512, 512);
  const r = seeded(77);
  for (let i = 0; i < 9000; i++) {
    const v = r();
    g.fillStyle = v < 0.5 ? `rgba(60, 35, 15, ${0.15 + r() * 0.3})` : `rgba(210, 160, 100, ${0.1 + r() * 0.25})`;
    g.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1.2);
  return tex;
}

function wrap(g, text, x, y, maxW, lh, maxLines) {
  const words = String(text).split(' ');
  let line = '';
  let lines = 0;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y);
      y += lh;
      line = w;
      if (++lines >= maxLines - 1) break;
    } else line = test;
  }
  g.fillText(line, x, y);
}

export function makeCardTexture(card) {
  const suspect = card.kind === 'suspect';
  const c = document.createElement('canvas');
  c.width = suspect ? 320 : 400;
  c.height = suspect ? 400 : 300;
  const g = c.getContext('2d');
  g.fillStyle = suspect ? '#f3ecda' : '#d9c49a';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#1d1a16';
  if (suspect) {
    g.fillStyle = '#c9bfa8';
    g.fillRect(20, 20, 280, 270);
    g.fillStyle = '#1d1a16';
    g.globalAlpha = 0.85;
    g.beginPath();
    g.ellipse(160, 140, 62, 76, 0, 0, Math.PI * 2);
    g.fill();
    g.fillRect(70, 220, 180, 70);
    g.globalAlpha = 1;
    g.font = '800 40px "Big Shoulders Display", sans-serif';
    g.fillText(card.name || '', 20, 336);
    g.font = '20px "Special Elite", monospace';
    g.fillText(card.role || '', 20, 370);
    if (card.mark) {
      g.save();
      g.translate(200, 120);
      g.rotate(-0.25);
      g.strokeStyle = card.mark === 'cleared' ? '#3f7d5a' : '#b3202a';
      g.fillStyle = g.strokeStyle;
      g.lineWidth = 6;
      g.font = '800 44px "Big Shoulders Display", sans-serif';
      const label = card.mark.toUpperCase();
      const tw = g.measureText(label).width;
      g.strokeRect(-tw / 2 - 12, -40, tw + 24, 56);
      g.fillText(label, -tw / 2, 4);
      g.restore();
    }
  } else {
    g.fillStyle = '#f2c230';
    g.fillRect(16, 16, 54, 40);
    g.fillStyle = '#1d1a16';
    g.font = '800 34px "Big Shoulders Display", sans-serif';
    g.fillText(String(card.tag || ''), 26, 48);
    g.font = '800 36px "Big Shoulders Display", sans-serif';
    wrap(g, card.title || '', 16, 100, 368, 36, 2);
    g.font = '19px "Special Elite", monospace';
    wrap(g, card.short || '', 16, 180, 368, 24, 4);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
