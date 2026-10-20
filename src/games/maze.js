// Escape route: trace a path from the stairwell to an exit without entering any camera's view.
// Camera cones are hidden until a camera catches you.
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'maze', name: 'Escape Route', category: 'Navigation' };

const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };

export function visibleCells(map, cam) {
  const H = map.length, W = map[0].length;
  const wall = (x, y) => x < 0 || y < 0 || x >= W || y >= H || map[y][x] === '#';
  const [dx, dy] = DIRS[cam.dir];
  const out = new Set([`${cam.x},${cam.y}`]);
  for (let d = 1; d <= cam.range; d++) {
    const half = Math.floor(d / 2);
    for (let l = -half; l <= half; l++) {
      const tx = cam.x + dx * d + (dy !== 0 ? l : 0);
      const ty = cam.y + dy * d + (dx !== 0 ? l : 0);
      if (wall(tx, ty)) continue;
      let blocked = false;
      const steps = d * 4;
      for (let s = 1; s < steps; s++) {
        const fx = cam.x + 0.5 + ((tx - cam.x) * s) / steps;
        const fy = cam.y + 0.5 + ((ty - cam.y) * s) / steps;
        if (wall(Math.floor(fx), Math.floor(fy))) { blocked = true; break; }
      }
      if (!blocked) out.add(`${tx},${ty}`);
    }
  }
  return out;
}

export function mount(el, ctx) {
  const { params, saved } = ctx;
  const map = params.map;
  const H = map.length, W = map[0].length;
  const cones = params.cameras.map((c) => visibleCells(map, c));
  const revealed = new Set(saved?.revealed || []);
  let caught = saved?.caught || 0;
  let start;
  map.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'S') start = [x, y]; }));
  let path = Array.isArray(saved?.path) && saved.path.length ? saved.path : [start];
  const persist = () => ctx.onSave({ revealed: [...revealed], caught, path });
  const status = h('p', { class: 'feedback' });
  const S = 28;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W * S} ${H * S}`);
  svg.setAttribute('class', 'mz-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', params.aria || 'Floor plan of the stairwell and car park');

  let base = '';
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ch = map[y][x];
      const fill = ch === '#' ? '#1d1a16' : '#d8d0bd';
      base += `<rect x="${x * S}" y="${y * S}" width="${S}" height="${S}" fill="${fill}" stroke="${ch === '#' ? '#1d1a16' : '#c4bba5'}" stroke-width="1"/>`;
      if (params.exits[ch]) base += `<rect x="${x * S + 2}" y="${y * S + 2}" width="${S - 4}" height="${S - 4}" fill="#3f7d5a"/><text x="${x * S + S / 2}" y="${y * S + S / 2 + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${ch}</text>`;
      if (ch === 'S') base += `<rect x="${x * S + 2}" y="${y * S + 2}" width="${S - 4}" height="${S - 4}" fill="#b3202a"/><text x="${x * S + S / 2}" y="${y * S + S / 2 + 5}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">${params.startLabel || 'L15'}</text>`;
    }
  }
  const camShapes = params.cameras.map((c) => {
    const cx = c.x * S + S / 2, cy = c.y * S + S / 2;
    const ang = { N: -90, S: 90, E: 0, W: 180 }[c.dir];
    return `<g transform="translate(${cx} ${cy}) rotate(${ang})"><rect x="-9" y="-6" width="14" height="12" rx="2" fill="#1d1a16"/><path d="M5 -4 L12 -7 L12 7 L5 4Z" fill="#1d1a16"/><circle cx="-4" cy="0" r="2" fill="#d8323d"/></g>`;
  }).join('');
  const coneLayer = document.createElementNS(svgNS, 'g');
  const pathLayer = document.createElementNS(svgNS, 'g');
  const hit = document.createElementNS(svgNS, 'g');
  svg.innerHTML = base;
  svg.append(coneLayer, pathLayer);
  svg.insertAdjacentHTML('beforeend', camShapes);
  svg.append(hit);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (map[y][x] === '#') continue;
    const r = document.createElementNS(svgNS, 'rect');
    Object.entries({ x: x * S, y: y * S, width: S, height: S, fill: 'transparent', 'data-x': x, 'data-y': y }).forEach(([k, v]) => r.setAttribute(k, v));
    hit.append(r);
  }

  const legend = h('ul', { class: 'mz-legend doc' }, Object.entries(params.exits).map(([k, v]) => h('li', {}, h('b', {}, k), ` ${v}`)));
  el.append(
    h('p', { class: 'game-rules' }, `Start at ${params.startName || 'the L15 stairwell door'} (red). Drag square by square to an exit. Each camera watches a widening cone in the direction it points, unless a wall blocks its view. Get spotted and you start again.`),
    h('div', { class: 'mz-layout' }, h('div', { class: 'mz-wrap' }, svg), legend),
    h('div', { class: 'game-toolbar' }, h('button', { class: 'btn btn--small', onclick: reset }, 'Start over')),
    status,
  );

  function drawCones() {
    coneLayer.innerHTML = '';
    params.cameras.forEach((_, i) => {
      if (!revealed.has(i)) return;
      for (const k of cones[i]) {
        const [x, y] = k.split(',').map(Number);
        coneLayer.insertAdjacentHTML('beforeend', `<rect x="${x * S}" y="${y * S}" width="${S}" height="${S}" fill="#e8a33d" opacity=".35"/>`);
      }
    });
  }

  function drawPath() {
    pathLayer.innerHTML = '';
    const pts = path.map(([x, y]) => `${x * S + S / 2},${y * S + S / 2}`).join(' ');
    pathLayer.insertAdjacentHTML('beforeend', `<polyline points="${pts}" fill="none" stroke="#b3202a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`);
    const [hx, hy] = path[path.length - 1];
    pathLayer.insertAdjacentHTML('beforeend', `<circle cx="${hx * S + S / 2}" cy="${hy * S + S / 2}" r="8" fill="#b3202a" stroke="#fff" stroke-width="2"/>`);
    ctx.onProgress(Math.min(0.9, path.length / 40));
  }

  function reset() {
    path = [start];
    drawPath();
    persist();
  }

  let drawing = false;
  const cellFromEvent = (e) => {
    const t = document.elementFromPoint(e.clientX, e.clientY);
    if (!t || !t.dataset || t.dataset.x === undefined) return null;
    return [Number(t.dataset.x), Number(t.dataset.y)];
  };
  svg.addEventListener('pointerdown', (e) => {
    const c = cellFromEvent(e);
    if (!c) return;
    const last = path[path.length - 1];
    if (c[0] === last[0] && c[1] === last[1]) {
      drawing = true;
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
    } else step(c);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const c = cellFromEvent(e);
    if (c) step(c);
  });
  const stop = () => { drawing = false; };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);

  function step([x, y]) {
    const last = path[path.length - 1];
    if (Math.abs(last[0] - x) + Math.abs(last[1] - y) !== 1) return;
    const prev = path[path.length - 2];
    if (prev && prev[0] === x && prev[1] === y) { path.pop(); drawPath(); persist(); return; }
    if (path.some(([px, py]) => px === x && py === y)) return;
    path.push([x, y]);
    const ci = cones.findIndex((cone) => cone.has(`${x},${y}`));
    if (ci >= 0) {
      caught++;
      revealed.add(ci);
      sfx.alarm();
      status.textContent = `Camera ${ci + 1} caught you. Its view is now marked on the plan.`;
      status.className = 'feedback is-bad';
      drawing = false;
      drawCones();
      setTimeout(reset, 450);
      drawPath();
      return;
    }
    drawPath();
    persist();
    const ch = map[y][x];
    if (params.exits[ch]) {
      drawing = false;
      if (ch !== params.answer) {
        sfx.bad();
        status.textContent = `The ${params.exits[ch].toLowerCase()} has its own camera on the door. Whoever left that night did not go this way.`;
        status.className = 'feedback is-bad';
        setTimeout(reset, 900);
      } else {
        sfx.solve();
        status.textContent = `Out through the ${params.exits[ch].toLowerCase()}, and not one camera saw it.`;
        status.className = 'feedback is-good';
        ctx.onProgress(1);
        ctx.onSolved();
      }
    }
  }

  drawCones();
  drawPath();
  return {
    hint() {
      const next = params.cameras.findIndex((_, i) => !revealed.has(i));
      if (next < 0) return 'Every camera view is marked. The way out is the one route the orange never touches.';
      revealed.add(next);
      persist();
      drawCones();
      return `The view of camera ${next + 1} is now marked.`;
    },
    devSolve() { ctx.onProgress(1); ctx.onSolved(); },
  };
}
