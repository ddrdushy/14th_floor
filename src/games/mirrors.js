// Laser Grid: a security laser in a warehouse. Put the mirrors from the tray on empty floor cells so the
// beam bounces into the sensor. Crates soak up the beam, fixed mirrors are bolted down, and relays
// (if any) must all be crossed on the way. The beam is drawn live from the emitter.
//
// params (all optional):
//   size       5..9, cells per side (default 6)
//   mirrors    2..7, mirrors in the tray (default 3)
//   relays     0..2, relay prisms the beam must pass through (default 0)
//   obstacles  0..12, crates on the floor (default 4). Big trays need crates: with few crates the
//              beam finds shorter routes, so mirrors 5+ wants obstacles 6+ (or relays) to bite.
//   clue       story note shown above the floor, e.g. 'The guard said the sensor is by the loading bay.'
import '../styles/games-d/mirrors.css';
import { h, svgEl } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { svg, text, C } from '../core/howto-kit.js';
import { clampParams, generate, trace } from './mirrors-logic.js';

export const meta = { id: 'mirrors', name: 'Laser Grid', category: 'Optics' };
export const demo = { params: { size: 6, mirrors: 3, relays: 1, obstacles: 4, clue: 'Practice floor. In a case, a note from the story is pinned here.' } };

const RIM = 0.7; // wall width, in cells
const CYCLE = { '': '/', '/': '\\', '\\': '' };
const SLANT = { '/': 'slanting up to the right', '\\': 'slanting down to the right' };

export const howTo = {
  goal: 'Bounce the laser into the sensor with the mirrors in your tray.',
  steps: [
    'Tap an empty floor cell to put a mirror there.',
    'Tap again to flip it. A third tap takes it back.',
    'The beam bounces off mirrors. Crates stop it.',
    'Bolted mirrors cannot move. Use them too.',
    'If there are relay prisms, the beam must pass through every one.',
  ],
  example: {
    caption: 'The laser goes right, hits a mirror, turns down and reaches the sensor.',
    render(el) {
      const s = 40, x0 = 26, y0 = 14;
      let body = `<rect x="${x0 - 14}" y="${y0 - 10}" width="${3 * s + 28}" height="${3 * s + 24}" rx="6" fill="#3b4045"/>`;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) body += `<rect x="${x0 + c * s}" y="${y0 + r * s}" width="${s}" height="${s}" fill="#8d8a80" stroke="#5f5c55" stroke-width="1.5"/>`;
      // crate
      body += `<rect x="${x0 + 2 * s + 5}" y="${y0 + 5}" width="${s - 10}" height="${s - 10}" fill="#9a6a35" stroke="#4b3015" stroke-width="2"/><path d="M${x0 + 2 * s + 5} ${y0 + 5}l${s - 10} ${s - 10}M${x0 + 3 * s - 5} ${y0 + 5}l${-(s - 10)} ${s - 10}" stroke="#4b3015" stroke-width="2"/>`;
      // beam: from the emitter on the left wall along row 0, mirror at (0,1), down to the sensor on the bottom wall
      const bx = x0 + 1.5 * s, by = y0 + 0.5 * s;
      body += `<path d="M${x0 - 8} ${by}H${bx}V${y0 + 3 * s + 6}" fill="none" stroke="#ff3b3b" stroke-width="7" opacity=".3"/><path d="M${x0 - 8} ${by}H${bx}V${y0 + 3 * s + 6}" fill="none" stroke="#ff5a4a" stroke-width="2.5"/>`;
      body += `<line x1="${bx - 12}" y1="${by - 12}" x2="${bx + 12}" y2="${by + 12}" stroke="#1d1a16" stroke-width="7" stroke-linecap="round"/><line x1="${bx - 12}" y1="${by - 12}" x2="${bx + 12}" y2="${by + 12}" stroke="#eef4f8" stroke-width="4" stroke-linecap="round"/>`;
      body += `<rect x="${x0 - 22}" y="${by - 9}" width="16" height="18" rx="3" fill="#b3202a" stroke="#1d1a16" stroke-width="2"/>`;
      body += `<circle cx="${bx}" cy="${y0 + 3 * s + 9}" r="8" fill="#3f9d5a" stroke="#1d1a16" stroke-width="2"/>`;
      body += text(bx, y0 + 3 * s + 30, 'your mirror turns the beam', { size: 12, fill: C.red, weight: 700 });
      el.innerHTML = `<div class="lz-howto">${svg(3 * s + 70, 3 * s + 50, body, 'A laser on the left wall, one mirror turning the beam down into a green sensor, and a crate in the corner')}</div>`;
    },
  },
  tips: [
    'Work back from the sensor: the beam must arrive in a straight line.',
    'You do not have to use every mirror.',
  ],
  controls: {
    touch: 'Tap a cell: mirror /, then \\, then empty. Clear takes all your mirrors back.',
    keys: 'Arrows move. Enter or Space cycles the mirror. / and \\ place one. Delete removes it.',
  },
};

export function mount(el, ctx) {
  const { params = {}, rng } = ctx;
  const P = clampParams(params || {});
  const puz = generate(Math.floor(rng() * 2 ** 31), P);
  const { size, cells, emitter, sensor, relays, solution } = puz;
  const n = size * size;
  const tray = puz.tray;
  const sig = `${size}|${cells.join('')}|${emitter.side}${emitter.k}|${sensor.side}${sensor.k}|${tray}`;

  // ---- state
  let placed = {}; // index -> '/' | '\\'
  let locked = new Set(); // set by the magnifier
  const s0 = ctx.saved && typeof ctx.saved === 'object' ? ctx.saved : null;
  if (s0 && s0.v === 1 && s0.sig === sig && s0.placed && typeof s0.placed === 'object') {
    for (const [k, m] of Object.entries(s0.placed)) {
      const i = Number(k);
      if (Number.isInteger(i) && i >= 0 && i < n && cells[i] === '.' && (m === '/' || m === '\\') && Object.keys(placed).length < tray) placed[i] = m;
    }
    if (Array.isArray(s0.locked)) locked = new Set(s0.locked.filter((i) => placed[i] && solution[i] === placed[i]));
  }
  const used = () => Object.keys(placed).length;
  let solved = false, solvedTimer = null, destroyed = false;
  let focusI = 0;

  // ---- geometry (SVG units: 1 cell = 10)
  const U = 10, R = RIM * U, VB = size * U + 2 * R;
  const cx = (c) => R + c * U + U / 2, cy = (r) => R + r * U + U / 2;
  function portXY(p, out = 0.5) { // a point on the wall at port p; out=0.5 is the middle of the rim
    const o = R * out;
    if (p.side === 'W') return [R - o, cy(p.k)];
    if (p.side === 'E') return [R + size * U + o, cy(p.k)];
    if (p.side === 'N') return [cx(p.k), R - o];
    return [cx(p.k), R + size * U + o];
  }

  // ---- DOM
  const status = h('p', { class: 'feedback lz-status', 'aria-live': 'polite' });
  const floor = svgEl('svg', { class: 'lz-svg', viewBox: `0 0 ${VB} ${VB}`, 'aria-hidden': 'true', focusable: 'false' });
  const gBeam = svgEl('g', { class: 'lz-beam' });
  const gMarks = svgEl('g', {});
  const gMirrors = svgEl('g', {});
  const gTop = svgEl('g', {});
  // walls and floor
  floor.append(
    svgEl('rect', { x: 0, y: 0, width: VB, height: VB, rx: 2.2, class: 'lz-wall' }),
    svgEl('rect', { x: R, y: R, width: size * U, height: size * U, class: 'lz-floor' }),
  );
  for (let k = 1; k < size; k++) {
    floor.append(svgEl('line', { x1: R + k * U, y1: R, x2: R + k * U, y2: R + size * U, class: 'lz-seam' }));
    floor.append(svgEl('line', { x1: R, y1: R + k * U, x2: R + size * U, y2: R + k * U, class: 'lz-seam' }));
  }
  // fixed things
  const relayEls = {};
  cells.forEach((t, i) => {
    const r = Math.floor(i / size), c = i % size, x = R + c * U, y = R + r * U;
    if (t === '#') {
      floor.append(svgEl('g', { class: 'lz-crate' },
        svgEl('rect', { x: x + 0.9, y: y + 0.9, width: U - 1.8, height: U - 1.8, rx: 0.5 }),
        svgEl('path', { d: `M${x + 0.9} ${y + 0.9}l${U - 1.8} ${U - 1.8}M${x + U - 0.9} ${y + 0.9}l${-(U - 1.8)} ${U - 1.8}M${x + 0.9} ${y + U / 2}h${U - 1.8}` })));
    } else if (t === 'R') {
      const g = svgEl('g', { class: 'lz-relay' },
        svgEl('path', { d: `M${cx(c)} ${cy(r) - 3.6}L${cx(c) + 3.6} ${cy(r)}L${cx(c)} ${cy(r) + 3.6}L${cx(c) - 3.6} ${cy(r)}Z` }),
        svgEl('circle', { cx: cx(c), cy: cy(r), r: 1 }));
      relayEls[i] = g;
      gTop.append(g);
    } else if (t === '/' || t === '\\') {
      gMirrors.append(mirrorEl(r, c, t, 'is-fixed'));
    }
  });
  // emitter and sensor
  const [ex, ey] = portXY(emitter);
  const [sx, sy] = portXY(sensor);
  const horizE = emitter.side === 'W' || emitter.side === 'E';
  gTop.append(svgEl('g', { class: 'lz-emitter' },
    svgEl('rect', { x: ex - (horizE ? 3 : 2.6), y: ey - (horizE ? 2.6 : 3), width: horizE ? 6 : 5.2, height: horizE ? 5.2 : 6, rx: 1 }),
    svgEl('circle', { cx: ex, cy: ey, r: 1.1 })));
  const sensorEl = svgEl('g', { class: 'lz-sensor' },
    svgEl('circle', { cx: sx, cy: sy, r: 2.9, class: 'lz-sensor-ring' }),
    svgEl('circle', { cx: sx, cy: sy, r: 1.4, class: 'lz-sensor-eye' }));
  gTop.append(sensorEl);
  const endSpark = svgEl('path', { class: 'lz-burn', d: 'M0 -2.4L0.7 -0.7L2.4 0L0.7 0.7L0 2.4L-0.7 0.7L-2.4 0L-0.7 -0.7Z' });
  const beamGlow = svgEl('polyline', { class: 'lz-glow' });
  const beamCore = svgEl('polyline', { class: 'lz-core' });
  const beamFlow = svgEl('polyline', { class: 'lz-flow' });
  gBeam.append(beamGlow, beamCore, beamFlow, endSpark);
  floor.append(gMarks, gBeam, gMirrors, gTop);
  const playerMirrors = svgEl('g', {});
  floor.insertBefore(playerMirrors, gTop);
  const drawn = new Map(); // index -> { m, lock, el } of the player mirrors on screen

  function mirrorEl(r, c, m, cls = '') {
    const x = cx(c), y = cy(r), d = 3.6;
    const [x1, y1, x2, y2] = m === '/' ? [x - d, y + d, x + d, y - d] : [x - d, y - d, x + d, y + d];
    return svgEl('g', { class: `lz-mirror ${cls}` },
      svgEl('line', { x1, y1, x2, y2, class: 'lz-mirror-back' }),
      svgEl('line', { x1, y1, x2, y2, class: 'lz-mirror-glass' }),
      cls.includes('is-fixed') ? [svgEl('circle', { cx: x1 + (x2 - x1) * 0.18, cy: y1 + (y2 - y1) * 0.18, r: 0.55, class: 'lz-bolt' }), svgEl('circle', { cx: x1 + (x2 - x1) * 0.82, cy: y1 + (y2 - y1) * 0.82, r: 0.55, class: 'lz-bolt' })] : null);
  }

  // tap targets on top of the drawing
  const pad = `${(R / VB) * 100}%`;
  const cellsEl = h('div', { class: 'lz-cells', role: 'grid', 'aria-label': `Warehouse floor, ${size} by ${size}`, style: { inset: pad } });
  cellsEl.style.setProperty('--lz-n', size);
  const btns = [];
  for (let r = 0; r < size; r++) {
    const row = h('div', { class: 'lz-row', role: 'row' });
    for (let c = 0; c < size; c++) {
      const i = r * size + c;
      const b = h('button', { type: 'button', class: `lz-cell${cells[i] !== '.' ? ' is-fixed' : ''}`, role: 'gridcell', tabindex: i === focusI ? '0' : '-1', 'data-i': i });
      btns.push(b);
      row.append(b);
    }
    cellsEl.append(row);
  }
  const board = h('div', { class: 'lz-board' }, floor, cellsEl);
  const trayEl = h('div', { class: 'lz-tray', 'aria-live': 'polite' });
  const clearBtn = h('button', { type: 'button', class: 'btn btn--small btn--paper lz-clear', onclick: clearAll }, 'Clear');
  el.append(...[
    h('p', { class: 'game-rules' }, `Place up to ${tray} mirrors so the laser reaches the sensor${relays.length ? ` through ${relays.length === 1 ? 'the relay prism' : `all ${relays.length} relay prisms`}` : ''}. Tap a cell to cycle / then \\ then empty.`),
    params && params.clue ? h('p', { class: 'lz-clue' }, h('span', { class: 'lz-clue-pin', 'aria-hidden': 'true' }), params.clue) : null,
    board,
    h('div', { class: 'lz-bar' }, trayEl, clearBtn),
    status,
  ].filter(Boolean));

  function say(t, k = '') { status.textContent = t; status.className = `feedback lz-status${k ? ` is-${k}` : ''}`; }
  function persist() { ctx.onSave({ v: 1, sig, placed, locked: [...locked] }); }

  function cellLabel(i, res) {
    const r = Math.floor(i / size) + 1, c = (i % size) + 1;
    const t = cells[i];
    const onBeam = res.path.some((p) => p.r * size + p.c === i);
    let what;
    if (t === '#') what = 'crate';
    else if (t === 'R') what = `relay prism, ${res.relaysHit.has(i) ? 'lit' : 'dark'}`;
    else if (t === '/' || t === '\\') what = `bolted mirror ${SLANT[t]}`;
    else if (placed[i]) what = `your mirror ${SLANT[placed[i]]}${locked.has(i) ? ', locked' : ''}`;
    else what = 'empty floor';
    return `Row ${r}, column ${c}: ${what}${onBeam && t !== '#' ? ', beam passes' : ''}`;
  }

  function render() {
    // player mirrors
    for (const [i, v] of drawn) if (placed[i] !== v.m || locked.has(i) !== v.lock) { v.el.remove(); drawn.delete(i); }
    for (const [k, m] of Object.entries(placed)) {
      const i = Number(k);
      if (drawn.has(i)) continue;
      const lock = locked.has(i);
      const g = mirrorEl(Math.floor(i / size), i % size, m, lock ? 'is-mine is-locked' : 'is-mine');
      playerMirrors.append(g);
      drawn.set(i, { m, lock, el: g });
    }
    const res = trace(puz, placed);
    // beam polyline: emitter, every turn, then the end
    const pts = [[ex, ey]];
    res.path.forEach((p, k) => {
      const next = res.path[k + 1];
      const turns = next && (next.dr !== p.dr || next.dc !== p.dc);
      if (turns) pts.push([cx(p.c), cy(p.r)]);
    });
    const last = res.path[res.path.length - 1];
    let end;
    if (res.end === 'crate') end = [cx(last.c) - last.dc * U * 0.42, cy(last.r) - last.dr * U * 0.42];
    else if (res.end === 'sensor') end = [sx, sy];
    else end = portXY(res.exit, 0.2);
    pts.push(end);
    const str = pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
    [beamGlow, beamCore, beamFlow].forEach((pl) => pl.setAttribute('points', str));
    endSpark.setAttribute('transform', `translate(${end[0].toFixed(2)} ${end[1].toFixed(2)})`);
    endSpark.style.display = res.end === 'sensor' ? 'none' : '';
    sensorEl.classList.toggle('is-hit', res.solved);
    sensorEl.classList.toggle('is-near', res.end === 'sensor' && !res.solved);
    for (const [k, g] of Object.entries(relayEls)) g.classList.toggle('is-lit', res.relaysHit.has(Number(k)));
    btns.forEach((b, i) => {
      b.setAttribute('aria-label', cellLabel(i, res));
      b.classList.toggle('is-locked', locked.has(i));
    });
    // tray
    const left = tray - used();
    trayEl.replaceChildren(
      h('span', { class: 'lz-tray-label' }, 'Tray'),
      ...Array.from({ length: tray }, (_, k) => h('span', { class: `lz-token${k < left ? '' : ' is-used'}`, 'aria-hidden': 'true' })),
      h('span', { class: 'lz-tray-n' }, `${left} of ${tray} left`));
    clearBtn.disabled = !Object.keys(placed).some((k) => !locked.has(Number(k)));
    // progress: how far the beam follows the planned route, plus the relays it lights
    let prefix = 0;
    while (prefix < res.path.length && prefix < puz.path.length && res.path[prefix].r * size + res.path[prefix].c === puz.path[prefix]) prefix++;
    const relayShare = relays.length ? res.relaysHit.size / relays.length : 0;
    const p = res.solved ? 1 : Math.min(0.95, 0.85 * (prefix / puz.path.length) + (relays.length ? 0.1 * relayShare : 0));
    ctx.onProgress(p);
    return res;
  }

  function report(res, before) {
    if (res.solved) return;
    if (res.end === 'sensor') say(`The sensor sees it, but ${relays.length - res.relaysHit.size} relay ${relays.length - res.relaysHit.size === 1 ? 'prism is' : 'prisms are'} still dark.`, 'bad');
    else if (res.end === 'crate') say('The beam dies on a crate.');
    else say('The beam hits bare wall.');
    if (before && before.end !== 'sensor' && res.end === 'sensor') sfx.good();
  }

  function check(res) {
    if (!res.solved || solved) return;
    solved = true;
    board.classList.add('is-solved');
    clearBtn.disabled = true;
    say('Sensor tripped. The shutter rolls up.', 'good');
    sfx.good();
    solvedTimer = setTimeout(() => { if (!destroyed) ctx.onSolved(); }, 750);
  }

  function setCell(i, m) {
    if (solved) return;
    const t = cells[i];
    if (t !== '.') {
      sfx.bad();
      say(t === '#' ? 'A crate. It will not budge.' : t === 'R' ? 'A relay prism. Leave it be: the beam must go through it.' : 'That mirror is bolted to the floor.', 'bad');
      nudge(i);
      return;
    }
    if (locked.has(i)) { sfx.bad(); say('The magnifier set that one. It stays.', 'bad'); nudge(i); return; }
    const cur = placed[i] || '';
    if (m === cur) return;
    if (!cur && m && used() >= tray) {
      sfx.bad();
      say('The tray is empty. Tap a mirror until it lifts off, or press Clear.', 'bad');
      nudge(i);
      return;
    }
    const before = trace(puz, placed);
    if (m) placed[i] = m; else delete placed[i];
    sfx.click();
    persist();
    const res = render();
    report(res, before);
    check(res);
  }
  function cycle(i) { setCell(i, CYCLE[placed[i] || '']); }
  function clearAll() {
    if (solved) return;
    for (const k of Object.keys(placed)) if (!locked.has(Number(k))) delete placed[k];
    sfx.click();
    persist();
    report(render());
  }
  function nudge(i) { const b = btns[i]; b.classList.remove('is-nudge'); void b.offsetWidth; b.classList.add('is-nudge'); }
  function focusCell(i) { btns[focusI].tabIndex = -1; focusI = i; btns[i].tabIndex = 0; btns[i].focus(); }

  cellsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.lz-cell');
    if (!b || e.detail === 0) return; // keyboard handled below
    const i = Number(b.dataset.i);
    if (focusI !== i) { btns[focusI].tabIndex = -1; focusI = i; b.tabIndex = 0; }
    cycle(i);
  });
  cellsEl.addEventListener('contextmenu', (e) => { if (e.target.closest('.lz-cell')) e.preventDefault(); });
  cellsEl.addEventListener('keydown', (e) => {
    const b = e.target.closest('.lz-cell');
    if (!b || e.ctrlKey || e.metaKey || e.altKey) return;
    const i = Number(b.dataset.i), r = Math.floor(i / size), c = i % size;
    const mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (mv) { e.preventDefault(); focusCell(((r + mv[0] + size) % size) * size + ((c + mv[1] + size) % size)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) cycle(i); }
    else if (e.key === '/') { e.preventDefault(); setCell(i, '/'); }
    else if (e.key === '\\') { e.preventDefault(); setCell(i, '\\'); }
    else if (e.key === 'Delete' || e.key === 'Backspace' || e.key === '0') { e.preventDefault(); if (placed[i]) setCell(i, ''); }
  });
  cellsEl.addEventListener('keyup', (e) => { if (e.key === ' ') e.preventDefault(); });

  persist();
  const res0 = render();
  if (res0.solved) { solved = true; board.classList.add('is-solved'); clearBtn.disabled = true; setTimeout(() => { if (!destroyed) ctx.onSolved(); }, 0); }
  else say(res0.end === 'crate' ? 'The beam dies on a crate.' : 'The beam hits bare wall.');

  return {
    destroy() { destroyed = true; clearTimeout(solvedTimer); },
    hint() {
      if (solved) return null;
      // the first planned mirror (in beam order) that is missing or wrong
      const i = puz.order.find((x) => placed[x] !== solution[x]);
      if (i == null) {
        // all planned mirrors are down: a stray mirror must be in the way
        const res = trace(puz, placed);
        const stray = res.path.map((p) => p.r * size + p.c).find((x) => placed[x] && !solution[x] && !locked.has(x));
        if (stray == null) return null;
        delete placed[stray];
        persist();
        check(render());
        return `A stray mirror at row ${Math.floor(stray / size) + 1}, column ${(stray % size) + 1} was in the way. It is back in the tray.`;
      }
      if (!placed[i] && used() >= tray) {
        // free a slot: take back a mirror that is not part of the plan
        const spare = Object.keys(placed).map(Number).find((x) => !solution[x] && !locked.has(x));
        if (spare != null) delete placed[spare];
      }
      placed[i] = solution[i];
      locked.add(i);
      persist();
      const res = render();
      nudge(i);
      focusCell(i);
      report(res);
      check(res);
      return `Chalk on the floor: a mirror ${solution[i]} goes at row ${Math.floor(i / size) + 1}, column ${(i % size) + 1}. It is locked in.`;
    },
    devSolve() {
      if (solved) return;
      placed = { ...solution };
      persist();
      check(render());
    },
  };
}
