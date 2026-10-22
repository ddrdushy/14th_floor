// Wire Tap: tap a phone line in a Colombo exchange box. Every tile holds a piece of wire (end, straight,
// corner or T). Turn the tiles until one network runs from the tap terminal to every tile, with no
// loose ends. Current flows from the tap, so joined wires light up; a loose end on a live wire sparks.
//
// params (all optional):
//   size     4..8, tiles per side (default 5)
//   targets  1..4, phone handsets sitting on end tiles (default 2)
//   wrap     true lets wires run off one edge and come back on the other side (default false)
//   clue     story note shown above the box, e.g. 'Mr Perera's line is the one with the brass tag.'
import '../styles/games-d/wiretap.css';
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { svg, text, ring, C } from '../core/howto-kit.js';
import { N, E, S, W, DIRS, rotate, bits, kind, degree, neighbour, generate, evaluate, clampParams } from './wiretap-logic.js';

export const meta = { id: 'wiretap', name: 'Wire Tap', category: 'Wiring' };
export const demo = { params: { size: 5, targets: 2, clue: 'Practice box. In a case, a note from the story is pinned here.' } };

const WORD = { [N]: 'up', [E]: 'right', [S]: 'down', [W]: 'left' };
const KIND = { end: 'end wire', straight: 'straight wire', corner: 'corner wire', tee: 'T wire' };
const PORT = { [N]: [50, 0], [E]: [100, 50], [S]: [50, 100], [W]: [0, 50] };
const SPARK = { [N]: [50, 9], [E]: [91, 50], [S]: [50, 91], [W]: [9, 50] };
const LONG_MS = 430;

/** The wire drawing for one tile (in its solved orientation; the game turns it with CSS). */
function wireMarkup(mask, { sparks = true } = {}) {
  const arms = bits(mask).map((d) => `M50 50L${PORT[d][0]} ${PORT[d][1]}`).join('');
  const sp = sparks ? bits(mask).map((d) => `<g class="wt-spark" data-d="${d}" transform="translate(${SPARK[d][0]} ${SPARK[d][1]})"><path d="M0 -9L2.4 -2.4L9 0L2.4 2.4L0 9L-2.4 2.4L-9 0L-2.4 -2.4Z"/></g>`).join('') : '';
  const cap = degree(mask) === 1 ? '<circle class="wt-cap" cx="50" cy="50" r="11"/>' : '<circle class="wt-knot" cx="50" cy="50" r="8"/>';
  return `<path class="wt-case" d="${arms}"/><path class="wt-core" d="${arms}"/>${cap}${sp}`;
}
const TAP_MARKUP = '<g class="wt-tap"><rect x="27" y="27" width="46" height="46" rx="5"/><circle cx="36" cy="36" r="3.4"/><circle cx="64" cy="36" r="3.4"/><circle cx="36" cy="64" r="3.4"/><circle cx="64" cy="64" r="3.4"/><path d="M42 50h16M50 42v16"/></g>';
const PHONE_MARKUP = '<g class="wt-phone"><circle cx="50" cy="50" r="25"/><path class="wt-handle" d="M33 50Q50 31 67 50"/><rect x="24" y="48" width="18" height="12" rx="4"/><rect x="58" y="48" width="18" height="12" rx="4"/></g>';

export const howTo = {
  goal: 'Turn the wires so one line runs from the tap to every tile, with no loose ends.',
  steps: [
    'Tap a tile to turn it a quarter turn.',
    'Hold it, or right-click, to turn it back.',
    'Wires joined to the tap light up. A spark means a loose end.',
    'Every phone must ring, and every tile must be lit.',
    'Sure of a tile? Switch on Mark, then tap it to pin it.',
  ],
  example: {
    caption: 'Current runs from the tap into two tiles. The corner sparks: its wire points up at nothing. Turn it to point down at the phone.',
    render(el) {
      const s = 46, x0 = 8, y0 = 8;
      const tiles = [[E, 'tap'], [E | W, 'lit'], [N | W, 'spark'], [0, ''], [0, ''], [N, 'phone']];
      let body = `<rect x="2" y="2" width="${3 * s + 12}" height="${2 * s + 12}" rx="8" fill="#20272c"/>`;
      tiles.forEach(([m, k], i) => {
        const X = x0 + (i % 3) * s, Y = y0 + Math.floor(i / 3) * s;
        body += `<g transform="translate(${X} ${Y}) scale(${(s - 2) / 100})"><rect width="100" height="100" rx="8" fill="#2c353b" stroke="#11161a" stroke-width="3"/>`;
        if (m) body += `<g class="wt-ex ${k === 'tap' || k === 'lit' || k === 'spark' ? 'is-lit' : ''}${k === 'spark' ? ' is-sparky' : ''}">${wireMarkup(m)}</g>`;
        if (k === 'tap') body += TAP_MARKUP;
        if (k === 'phone') body += `<g class="wt-ex">${PHONE_MARKUP}</g>`;
        body += '</g>';
      });
      body += ring(x0 + 2 * s + 22, y0 + 4, 9, { sw: 2.5 });
      body += text(x0 + 1.5 * s, y0 + 2 * s + 24, 'spark = loose end', { size: 12, fill: C.red, weight: 700 });
      el.innerHTML = `<div class="wt-howto">${svg(3 * s + 16, 2 * s + 34, body, 'A tap terminal, two lit wires, a sparking corner and a phone that is not yet connected')}</div>`;
      el.querySelector('.wt-ex.is-sparky .wt-spark[data-d="1"]')?.classList.add('is-on');
    },
  },
  tips: [
    'Start at the edges and corners: a wire can never point off the box.',
    'Two end tiles side by side can never face each other. That would cut them off.',
  ],
  controls: {
    touch: 'Tap to turn. Hold to turn back. Mark, then tap, to pin or unpin a tile.',
    keys: 'Arrows move. Enter or Space turns. Shift+Enter turns back. L pins a tile.',
  },
};

export function mount(el, ctx) {
  const { params = {}, rng } = ctx;
  const P = clampParams(params || {});
  const puz = generate(Math.floor(rng() * 2 ** 31), P);
  const { size, src, wrap, solution } = puz;
  const n = size * size;
  const targets = new Set(puz.targets);
  const sig = `${size}|${wrap ? 1 : 0}|${src}|${solution.join(',')}|${puz.targets.join(',')}`;

  // ---- state (rot[i]: quarter turns from the solved way; the tile shows rotate(solution[i], rot[i]))
  let rot = puz.start.slice();
  let pinned = new Set(); // player pins
  let fixedByHint = new Set(); // hint pins, never unpinned
  const s0 = ctx.saved && typeof ctx.saved === 'object' ? ctx.saved : null;
  if (s0 && s0.v === 1 && s0.sig === sig && Array.isArray(s0.rot) && s0.rot.length === n && s0.rot.every((k) => Number.isInteger(k) && k >= 0 && k < 4)) {
    rot = s0.rot.slice();
    const idx = (a) => (Array.isArray(a) ? a.filter((i) => Number.isInteger(i) && i >= 0 && i < n) : []);
    pinned = new Set(idx(s0.pin));
    fixedByHint = new Set(idx(s0.hint));
  }
  const vis = rot.map((k) => k * 90); // visual angle, keeps turning the same way for smooth animation
  const masks = () => rot.map((k, i) => rotate(solution[i], k));
  const isPinned = (i) => pinned.has(i) || fixedByHint.has(i);
  let markMode = false, solved = false, solvedTimer = null, destroyed = false;
  let focusI = src;
  let lastLive = -1;

  // ---- DOM
  const status = h('p', { class: 'feedback wt-status', 'aria-live': 'polite' });
  const grid = h('div', { class: `wt-grid${wrap ? ' is-wrap' : ''}`, role: 'grid', 'aria-label': `Exchange box, ${size} by ${size} tiles` });
  grid.style.setProperty('--wt-n', size);
  const tiles = [];
  for (let r = 0; r < size; r++) {
    const row = h('div', { class: 'wt-row', role: 'row' });
    for (let c = 0; c < size; c++) {
      const i = r * size + c;
      const wire = h('div', { class: 'wt-wire', html: `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">${wireMarkup(solution[i])}</svg>` });
      const top = i === src ? TAP_MARKUP : targets.has(i) ? PHONE_MARKUP : '';
      const btn = h('button', {
        type: 'button', class: 'wt-tile', role: 'gridcell', tabindex: i === focusI ? '0' : '-1', 'data-i': i,
      }, wire, top ? h('div', { class: 'wt-top', html: `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">${top}</svg>` }) : null,
      h('span', { class: 'wt-pin', 'aria-hidden': 'true' }));
      tiles.push({ btn, wire, sparks: [...wire.querySelectorAll('.wt-spark')] });
      row.append(btn);
    }
    grid.append(row);
  }
  const markBtn = h('button', { type: 'button', class: 'btn btn--small btn--paper wt-mark', 'aria-pressed': 'false', onclick: () => setMark(!markMode) },
    h('span', { class: 'wt-mark-dot', 'aria-hidden': 'true' }), 'Mark');
  const phones = h('span', { class: 'wt-count' });
  const loose = h('span', { class: 'wt-count' });
  const box = h('div', { class: 'wt-box' },
    h('div', { class: 'wt-plate', 'aria-hidden': 'true' }, h('span', {}, 'SLT · EXCHANGE 14'), h('span', {}, wrap ? 'LOOPED BUS' : 'DIST. BOX')),
    grid);
  el.append(...[
    h('p', { class: 'game-rules' }, `Turn the wires so one line runs from the tap to all ${n} tiles and ${targets.size === 1 ? 'the phone' : `all ${targets.size} phones`}. No loose ends.${wrap ? ' Wires that leave one edge come back on the other side.' : ''}`),
    params && params.clue ? h('p', { class: 'wt-clue' }, h('span', { class: 'wt-clue-pin', 'aria-hidden': 'true' }), params.clue) : null,
    box,
    h('div', { class: 'wt-bar' }, markBtn, h('div', { class: 'wt-counts' }, phones, loose)),
    status,
  ].filter(Boolean));

  function say(t, k = '') { status.textContent = t; status.className = `feedback wt-status${k ? ` is-${k}` : ''}`; }
  function persist() { ctx.onSave({ v: 1, sig, rot, pin: [...pinned], hint: [...fixedByHint] }); }

  function label(i, m, ev) {
    const r = Math.floor(i / size) + 1, c = (i % size) + 1;
    const what = i === src ? 'tap terminal, ' : targets.has(i) ? 'phone, ' : '';
    const ends = bits(m).map((d) => WORD[d]).join(' and ');
    const state = ev.lit[i] ? (ev.loose[i] ? 'live, loose end' : 'live') : 'dead';
    return `Row ${r}, column ${c}: ${what}${KIND[kind(m)]} pointing ${ends}, ${state}${isPinned(i) ? ', pinned' : ''}`;
  }

  function render() {
    const m = masks();
    const ev = evaluate(size, m, src, wrap);
    tiles.forEach((t, i) => {
      t.wire.style.transform = `rotate(${vis[i]}deg)`;
      t.btn.classList.toggle('is-lit', ev.lit[i]);
      t.btn.classList.toggle('is-pinned', isPinned(i));
      t.btn.classList.toggle('is-hinted', fixedByHint.has(i));
      // a spark sits on the base port that now points at the loose side
      t.sparks.forEach((sp) => {
        const d = Number(sp.dataset.d);
        sp.classList.toggle('is-on', ev.lit[i] && !!(ev.loose[i] & rotate(d, rot[i])));
      });
      t.btn.setAttribute('aria-label', label(i, m[i], ev));
    });
    const live = puz.targets.filter((t) => ev.lit[t]).length;
    phones.textContent = `Phones live ${live}/${targets.size}`;
    loose.textContent = `Loose ends ${ev.looseCount}`;
    loose.classList.toggle('is-zero', ev.looseCount === 0);
    if (lastLive >= 0 && live > lastLive && !ev.solved) sfx.good();
    lastLive = live;
    ctx.onProgress(ev.solved ? 1 : Math.min(0.95, 0.9 * (ev.good / n) + 0.05 * (live / targets.size)));
    return ev;
  }

  function check(ev) {
    if (!ev.solved || solved) return;
    solved = true;
    grid.classList.add('is-solved');
    box.classList.add('is-solved');
    markBtn.disabled = true;
    say('The line hums. Every handset is live. You are on the call.', 'good');
    sfx.good();
    solvedTimer = setTimeout(() => { if (!destroyed) ctx.onSolved(); }, 750);
  }

  function turn(i, dir) {
    if (solved) return;
    if (isPinned(i)) {
      sfx.bad();
      say(fixedByHint.has(i) ? 'That tile was set by the magnifier. It stays.' : 'Pinned. Switch on Mark and tap it to unpin.', 'bad');
      nudge(i);
      return;
    }
    rot[i] = (rot[i] + dir + 4) % 4;
    vis[i] += dir * 90;
    sfx.click();
    say('');
    persist();
    check(render());
  }
  function togglePin(i) {
    if (solved) return;
    if (fixedByHint.has(i)) { sfx.bad(); say('That tile was set by the magnifier. It stays.', 'bad'); return; }
    if (pinned.has(i)) pinned.delete(i); else pinned.add(i);
    sfx.pin();
    say(pinned.has(i) ? 'Pinned.' : 'Unpinned.');
    persist();
    render();
  }
  function nudge(i) {
    const b = tiles[i].btn;
    b.classList.remove('is-nudge'); void b.offsetWidth; b.classList.add('is-nudge');
  }
  function setMark(on) {
    markMode = on;
    markBtn.setAttribute('aria-pressed', String(on));
    markBtn.classList.toggle('is-on', on);
    grid.classList.toggle('is-marking', on);
    say(on ? 'Mark is on: tap a tile to pin or unpin it.' : '');
  }
  function focusTile(i) {
    tiles[focusI].btn.tabIndex = -1;
    focusI = i;
    tiles[i].btn.tabIndex = 0;
    tiles[i].btn.focus();
  }

  // ---- pointer: tap turns (or pins in Mark mode), hold or right-click turns back
  let press = null; // { i, timer, fired, type }
  const tileOf = (e) => { const b = e.target.closest && e.target.closest('.wt-tile'); return b && grid.contains(b) ? Number(b.dataset.i) : -1; };
  grid.addEventListener('pointerdown', (e) => {
    const i = tileOf(e);
    if (i < 0 || e.button > 0) return;
    if (press) clearTimeout(press.timer);
    press = { i, fired: false, type: e.pointerType, x: e.clientX, y: e.clientY };
    press.timer = setTimeout(() => {
      if (!press || press.i !== i) return;
      press.fired = true;
      if (markMode) togglePin(i); else turn(i, -1);
      if (navigator.vibrate) try { navigator.vibrate(12); } catch { /* not allowed */ }
    }, LONG_MS);
  });
  const cancelPress = () => { if (press) clearTimeout(press.timer); };
  grid.addEventListener('pointermove', (e) => { if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 14) { clearTimeout(press.timer); } });
  grid.addEventListener('pointercancel', () => { cancelPress(); press = null; });
  grid.addEventListener('pointerup', cancelPress);
  grid.addEventListener('pointerleave', cancelPress);
  grid.addEventListener('click', (e) => {
    const i = tileOf(e);
    if (i < 0) return;
    if (e.detail === 0) return; // keyboard clicks are handled in keydown
    const wasLong = press && press.fired && press.i === i;
    press = null;
    if (wasLong) return;
    if (focusI !== i) { tiles[focusI].btn.tabIndex = -1; focusI = i; tiles[i].btn.tabIndex = 0; }
    if (markMode) togglePin(i); else turn(i, 1);
  });
  grid.addEventListener('contextmenu', (e) => {
    const i = tileOf(e);
    if (i < 0) return;
    e.preventDefault();
    if (press && press.type !== 'mouse') return; // a touch hold is handled by the timer
    if (press) clearTimeout(press.timer);
    press = null;
    if (markMode) togglePin(i); else turn(i, -1);
  });

  grid.addEventListener('keydown', (e) => {
    const i = tileOf(e);
    if (i < 0 || e.ctrlKey || e.metaKey || e.altKey) return;
    const r = Math.floor(i / size), c = i % size;
    const mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (mv) {
      e.preventDefault();
      const nr = (r + mv[0] + size) % size, nc = (c + mv[1] + size) % size;
      focusTile(nr * size + nc);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (e.repeat) return;
      if (markMode && !e.shiftKey) togglePin(i); else turn(i, e.shiftKey ? -1 : 1);
    } else if (e.key === 'l' || e.key === 'L' || e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      togglePin(i);
    } else if (e.key === 'Home') { e.preventDefault(); focusTile(r * size); } else if (e.key === 'End') { e.preventDefault(); focusTile(r * size + size - 1); }
  });
  grid.addEventListener('keyup', (e) => { if (e.key === ' ') e.preventDefault(); });

  persist();
  const ev0 = render();
  if (ev0.solved) { solved = true; grid.classList.add('is-solved'); box.classList.add('is-solved'); markBtn.disabled = true; setTimeout(() => { if (!destroyed) ctx.onSolved(); }, 0); }

  return {
    destroy() { destroyed = true; clearTimeout(solvedTimer); if (press) clearTimeout(press.timer); },
    hint() {
      if (solved) return null;
      const m = masks();
      const wrong = Array.from({ length: n }, (_, i) => i).filter((i) => m[i] !== solution[i] && !fixedByHint.has(i));
      if (!wrong.length) return null;
      // most useful first: a wrong tile touching the live network, else the first wrong one
      const ev = evaluate(size, m, src, wrap);
      const touches = (i) => DIRS.some((d) => { const j = neighbour(size, i, d, wrap); return j >= 0 && ev.lit[j]; });
      const i = wrong.find((x) => !ev.lit[x] && touches(x)) ?? wrong.find((x) => ev.lit[x]) ?? wrong[0];
      // turn the short way to the solved orientation (a straight wire is solved two ways)
      const goals = [0, 1, 2, 3].filter((k) => rotate(solution[i], k) === solution[i]);
      let bestStep = 0, bestCost = 9;
      for (const g of goals) for (const step of [1, -1, 2, -2, 3, -3]) {
        if ((rot[i] + step + 8) % 4 === g && Math.abs(step) < bestCost) { bestCost = Math.abs(step); bestStep = step; }
      }
      rot[i] = (rot[i] + bestStep + 8) % 4;
      vis[i] += bestStep * 90;
      pinned.delete(i);
      fixedByHint.add(i);
      persist();
      const ev2 = render();
      nudge(i);
      focusTile(i);
      check(ev2);
      return `A lineman's note: row ${Math.floor(i / size) + 1}, column ${(i % size) + 1} goes this way. It is pinned now.`;
    },
    devSolve() {
      if (solved) return;
      rot = rot.map((k, i) => { const step = [0, 1, 2, 3].find((s) => rotate(solution[i], (k + s) % 4) === solution[i]); vis[i] += step * 90; return (k + step) % 4; });
      persist();
      check(render());
    },
  };
}
