// Shredded Note: a typed note went through a strip-cut shredder. Put the strips back in order.
// The note is drawn to a canvas at the width of the game area (so the type stays readable on a
// phone), cut into equal vertical strips and shuffled with the level's seeded rng. Two strips that
// sit next to their true neighbour (both the right way up) show a small green mark on their seam.
//
// params (all optional):
//   text    the note, '\n' for line breaks; long lines wrap (default: a short noir demo note)
//   title   letterhead printed across the top, e.g. 'Kedai Kopi Seng Huat' (default none)
//   strips  5..14, how many strips (default 8)
//   flips   true turns some strips upside down; tap one, then Turn over (or press R) (default false)
//   stamp   ink stamp text across the body (default 'CONFIDENTIAL'; false for none)
//   sign    a typed name under the signature scrawl (default none, the scrawl is always there)
//   clue    story note shown above the desk
import '../styles/games-d/shredder.css';
import { h } from '../core/ui.js';
import { mulberry32 } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, arrow, C } from '../core/howto-kit.js';
import {
  DEFAULT_TEXT, clampStrips, wrapLines, fitsAt, fitCount, isSolved, progressOf, scramble,
  moveStrip, swapStrips, hintStep, cleanSaved, puzzleSig, freePlaces,
} from './shredder-logic.js';

export const meta = { id: 'shredder', name: 'Shredded Note', category: 'Reconstruction' };
export const demo = {
  params: {
    strips: 8,
    flips: false,
    title: 'Kedai Kopi Seng Huat',
    clue: 'Practice note. In a case, a clue from the story is pinned here.',
  },
};

const GAP = 4; // px between strips that do not fit yet
const JIT = 7; // max vertical jitter of a loose strip
const LIFT = 10; // how far a picked-up strip rises

const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ord = (n) => ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth'][n] || `${n + 1}th`;

export function mount(el, ctx) {
  const params = ctx.params || {};
  const rng = ctx.rng;
  const N = clampStrips(params.strips ?? 8);
  const flipsOn = !!params.flips;
  const note = typeof params.text === 'string' && params.text.trim() ? params.text : DEFAULT_TEXT;
  const title = typeof params.title === 'string' ? params.title.trim() : '';
  const stampText = params.stamp === false ? '' : typeof params.stamp === 'string' && params.stamp.trim() ? params.stamp.trim().toUpperCase() : 'CONFIDENTIAL';
  const sign = typeof params.sign === 'string' ? params.sign.trim() : '';
  const sig = puzzleSig(`${title}|${note}`, N, flipsOn);

  // rng order matters: the pile first, then the look of the paper
  const start = scramble(rng, N, flipsOn);
  const artSeed = Math.floor(rng() * 1e9);
  const jr = mulberry32(artSeed ^ 0x2f6b);
  const jitter = Array.from({ length: N }, () => Math.round((jr() * 2 - 1) * JIT));

  const restored = cleanSaved(ctx.saved, N, flipsOn, sig);
  let order = restored ? restored.order : start.order;
  let flips = restored ? restored.flips : start.flips;
  let pinned = restored ? restored.pinned : new Set();
  let selS = null; // strip id picked by a tap
  let held = null; // strip id lifted with the keyboard
  let heldFrom = null; // order before the keyboard lift, for Escape
  let focusPos = 0;
  let solved = false;
  let told = false;
  let drag = null;
  const timers = [];

  // ---- DOM ----
  const status = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const count = h('span', { class: 'doc shr-count' });
  const bed = h('div', { class: 'shr-bed', role: 'group', 'aria-label': `Shredded note in ${N} strips. Arrow keys move between strips, Space picks one up and drops it${flipsOn ? ', R turns it over' : ''}.` });
  const whole = h('div', { class: 'shr-whole', 'aria-hidden': 'true' });
  bed.append(whole);
  const desk = h('div', { class: 'shr-desk' }, bed);
  const turnBtn = flipsOn ? h('button', { class: 'btn btn--small shr-turn', type: 'button', disabled: true, onclick: () => { if (selS != null) flip(selS); } }, h('span', { 'aria-hidden': 'true' }, '↻ '), 'Turn over') : null;
  const transcript = h('div', { class: 'shr-transcript', hidden: true },
    h('h3', { class: 'shr-tr-h' }, 'Typed out'),
    title ? h('p', { class: 'shr-tr-title' }, title) : null,
    h('p', { class: 'shr-tr-body' }, note),
    sign ? h('p', { class: 'shr-tr-sign' }, `— ${sign}`) : null);

  el.append(...[
    h('p', { class: 'game-rules' }, `Put the ${N} strips back in order so the note can be read. Drag a strip sideways, or tap two strips to swap them.${flipsOn ? ' Some strips are upside down: tap one, then Turn over.' : ''} A green mark on a seam means those two strips belong together.`),
    params.clue ? h('p', { class: 'shr-clue' }, h('span', { class: 'shr-clue-pin', 'aria-hidden': 'true' }), String(params.clue)) : null,
    desk,
    h('div', { class: 'game-toolbar shr-tools' }, turnBtn, count),
    status,
    transcript,
  ].filter(Boolean));

  const strips = Array.from({ length: N }, (_, s) => {
    const c = document.createElement('canvas');
    const d = h('div', { class: 'shr-strip', role: 'button', tabindex: '-1', 'data-s': s }, c);
    bed.append(d);
    return { el: d, canvas: c };
  });

  // ---- drawing the note ----
  let sw = 0, W = 0, H = 0, bedW = 0, bedH = 0, topY = 0;
  let lastAvail = 0;

  function availWidth() {
    const cs = getComputedStyle(desk);
    const inner = desk.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
    return Math.max(200, Math.min(680, Math.floor(inner || el.clientWidth || 320)));
  }

  function drawDoc() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const fs = W >= 520 ? 17 : W >= 400 ? 16 : 15;
    const pad = Math.round(Math.max(14, Math.min(30, W * 0.06)));
    const lh = Math.round(fs * 1.55);
    const docFont = `${fs}px 'Special Elite', 'Courier New', monospace`;
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    g.font = docFont;
    const cache = new Map();
    const cw = (ch) => { if (!cache.has(ch)) cache.set(ch, g.measureText(ch).width); return cache.get(ch); };
    const measure = (s) => { let w = 0; for (const ch of s) w += cw(ch); return w; };
    const lines = wrapLines(note, W - pad * 2, measure);
    const titleSize = Math.round(Math.max(20, Math.min(36, W * 0.075)));
    const headH = title ? titleSize + 22 : 0;
    const bodyTop = pad + headH + (title ? 10 : 4);
    const bodyH = lines.length * lh;
    const signTop = bodyTop + bodyH + 6;
    const signH = 58 + (sign ? lh : 0);
    H = Math.ceil(signTop + signH + pad);
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    g.scale(dpr, dpr);
    const r = mulberry32(artSeed);

    // paper
    g.fillStyle = '#f6f0de';
    g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(W * 0.45, H * 0.4, Math.min(W, H) * 0.2, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(255,255,255,0)');
    vg.addColorStop(1, 'rgba(120,96,60,0.16)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < Math.round((W * H) / 900); i++) {
      g.fillStyle = `rgba(90,70,40,${0.04 + r() * 0.08})`;
      g.fillRect(r() * W, r() * H, 1 + r() * 1.4, 1 + r() * 1.4);
    }
    // a fold crease across the whole sheet
    const fy = Math.round(H * (0.34 + r() * 0.08));
    g.fillStyle = 'rgba(70,55,30,0.09)';
    g.fillRect(0, fy, W, 1);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.fillRect(0, fy + 1, W, 1);
    // coffee ring, top right
    const rr = Math.max(26, Math.min(58, W * 0.11));
    const cx = W * (0.68 + r() * 0.14), cy = bodyTop + rr * 0.6 + r() * lh * 2;
    g.strokeStyle = 'rgba(122,78,34,0.16)';
    g.lineWidth = 3.2;
    g.beginPath(); g.arc(cx, cy, rr, 0.15 * Math.PI, 1.75 * Math.PI); g.stroke();
    g.lineWidth = 1.2;
    g.strokeStyle = 'rgba(122,78,34,0.12)';
    g.beginPath(); g.arc(cx + 2, cy + 1, rr - 5, 0.4 * Math.PI, 1.95 * Math.PI); g.stroke();

    // letterhead
    if (title) {
      g.fillStyle = 'rgba(34,29,24,0.82)';
      g.font = `800 ${titleSize}px 'Big Shoulders Display', 'Arial Narrow', sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      try { g.letterSpacing = '2px'; } catch { /* older canvas */ }
      let t = title.toUpperCase();
      while (g.measureText(t).width > W - pad * 2 && t.length > 4) t = `${t.slice(0, -2)}…`;
      g.fillText(t, W / 2, pad + titleSize);
      try { g.letterSpacing = '0px'; } catch { /* older canvas */ }
      const ry = pad + titleSize + 9;
      g.fillStyle = 'rgba(34,29,24,0.6)';
      g.fillRect(pad, ry, W - pad * 2, 2);
      g.fillRect(pad, ry + 4, W - pad * 2, 1);
    }

    // typed body: each letter sits a hair off the line, like a tired typewriter
    g.font = docFont;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    lines.forEach((line, i) => {
      let x = pad;
      const y = bodyTop + i * lh + fs;
      for (const ch of line) {
        if (ch !== ' ') {
          g.fillStyle = `rgba(30,25,20,${0.74 + r() * 0.26})`;
          g.fillText(ch, x, y + (r() - 0.5) * 0.9);
        }
        x += cw(ch);
      }
    });

    // ink stamp across the body
    if (stampText) {
      g.save();
      const ss = Math.round(Math.max(16, Math.min(30, W * 0.065)));
      g.font = `800 ${ss}px 'Big Shoulders Display', 'Arial Narrow', sans-serif`;
      try { g.letterSpacing = '3px'; } catch { /* older canvas */ }
      const tw = g.measureText(stampText).width;
      const bw = Math.min(W * 0.8, tw + 26), bh = ss + 18;
      const sx = Math.min(W - bw / 2 - 8, Math.max(bw / 2 + 8, W * (0.5 + r() * 0.18)));
      const sy = bodyTop + bodyH * (0.45 + r() * 0.3);
      g.translate(sx, sy);
      g.rotate((-10 - r() * 8) * (Math.PI / 180));
      g.strokeStyle = 'rgba(170,30,40,0.3)';
      g.fillStyle = 'rgba(170,30,40,0.3)';
      g.lineWidth = 3;
      g.strokeRect(-bw / 2, -bh / 2, bw, bh);
      g.lineWidth = 1.2;
      g.strokeRect(-bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10);
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(stampText, 0, 1, bw - 16);
      g.restore();
    }

    // signature scrawl, wide enough to cross several strips
    const sx0 = pad + 6, sy0 = signTop + 30;
    const sW = Math.min(W - pad * 2 - 10, Math.max(150, W * 0.55));
    g.strokeStyle = 'rgba(31,52,110,0.88)';
    g.lineWidth = 1.8;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(sx0, sy0);
    const loops = 5 + Math.floor(r() * 3);
    for (let k = 0; k < loops; k++) {
      const x1 = sx0 + (sW * (k + 0.35)) / loops, x2 = sx0 + (sW * (k + 1)) / loops;
      const up = 16 + r() * 16, dn = 6 + r() * 12;
      g.bezierCurveTo(x1 - 10, sy0 - up, x1 + 12, sy0 - up * 0.8, x1, sy0 + dn * 0.2);
      g.bezierCurveTo(x1 - 6, sy0 + dn, x2 - 8, sy0 + dn * 0.6, x2, sy0 - 2 + (r() - 0.5) * 6);
    }
    g.stroke();
    g.beginPath();
    g.moveTo(sx0 - 4, sy0 + 12);
    g.quadraticCurveTo(sx0 + sW * 0.5, sy0 + 18 + r() * 6, sx0 + sW + 6, sy0 + 8);
    g.stroke();
    if (sign) {
      g.font = `${fs - 1}px 'Special Elite', 'Courier New', monospace`;
      g.fillStyle = 'rgba(30,25,20,0.85)';
      g.fillText(sign, sx0, sy0 + 26 + lh * 0.6);
    }
    return { c, dpr };
  }

  function cutStrips(edges = !solved) {
    const { c, dpr } = drawDoc();
    strips.forEach(({ canvas }, s) => {
      canvas.width = Math.round(sw * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${sw}px`;
      canvas.style.height = `${H}px`;
      const g = canvas.getContext('2d');
      g.drawImage(c, Math.round(s * sw * dpr), 0, Math.round(sw * dpr), Math.round(H * dpr), 0, 0, canvas.width, canvas.height);
      // the shredder's cut edges catch a little shadow (gone once the note is whole again)
      if (!edges) return;
      g.fillStyle = 'rgba(60,45,25,0.10)';
      g.fillRect(0, 0, Math.max(1, dpr), canvas.height);
      g.fillRect(canvas.width - Math.max(1, dpr), 0, Math.max(1, dpr), canvas.height);
    });
  }

  function measureAll() {
    const avail = availWidth();
    lastAvail = avail;
    sw = Math.max(16, Math.floor((avail - (N - 1) * GAP) / N));
    W = sw * N;
    cutStrips();
    bedW = W + (N - 1) * GAP;
    topY = JIT + LIFT + 4;
    bedH = H + topY + JIT + 6;
    bed.style.width = `${bedW}px`;
    bed.style.height = `${bedH}px`;
  }

  // ---- layout ----
  function xsFor(o) {
    const xs = [];
    let x = 0;
    for (let p = 0; p < N; p++) {
      if (p > 0) x += sw + (solved || fitsAt(o, flips, p - 1) ? 0 : GAP);
      xs.push(x);
    }
    const off = Math.round((bedW - (x + sw)) / 2);
    return xs.map((v) => v + off);
  }
  function ysFor(o) {
    const ys = [];
    let head = jitter[o[0]];
    for (let p = 0; p < N; p++) {
      if (p > 0 && !fitsAt(o, flips, p - 1)) head = jitter[o[p]];
      ys.push(solved ? topY : topY + head);
    }
    return ys;
  }

  function layout(preview = null) {
    const o = preview || order;
    const xs = xsFor(o), ys = ysFor(o);
    o.forEach((s, p) => {
      const st = strips[s].el;
      if (drag && drag.moving && s === drag.s) return; // follows the pointer
      const lift = (s === selS || s === held) && !solved ? -LIFT : 0;
      st.style.transform = `translate(${xs[p]}px, ${ys[p] + lift}px)`;
    });
    if (solved) {
      whole.style.transform = `translate(${xs[0]}px, ${topY}px)`;
      whole.style.width = `${W}px`;
      whole.style.height = `${H}px`;
    }
  }

  function decorate() {
    order.forEach((s, p) => {
      const st = strips[s].el;
      const isPin = pinned.has(p);
      const fitR = !solved && p < N - 1 && fitsAt(order, flips, p);
      const fitL = !solved && p > 0 && fitsAt(order, flips, p - 1);
      st.classList.toggle('is-sel', s === selS);
      st.classList.toggle('is-held', s === held);
      st.classList.toggle('is-pinned', isPin);
      st.classList.toggle('is-flipped', !!flips[s]);
      st.classList.toggle('is-fitR', fitR);
      st.setAttribute('tabindex', p === focusPos && !solved ? '0' : '-1');
      st.setAttribute('aria-pressed', String(s === selS || s === held));
      if (solved) st.setAttribute('aria-disabled', 'true');
      const bits = [`Strip in place ${p + 1} of ${N}`];
      if (flips[s]) bits.push('upside down');
      if (isPin) bits.push('pinned');
      if (fitL && fitR) bits.push('fits both neighbours');
      else if (fitL) bits.push('fits the strip on its left');
      else if (fitR) bits.push('fits the strip on its right');
      if (s === held) bits.push('picked up');
      st.setAttribute('aria-label', bits.join(', '));
    });
    if (turnBtn) turnBtn.disabled = selS == null || solved || pinned.has(order.indexOf(selS));
    const k = fitCount(order, flips);
    const down = flips.filter(Boolean).length;
    count.textContent = solved ? 'Every seam fits.' : `Seams that fit: ${k} of ${N - 1}${flipsOn && down ? ` · ${down} upside down` : ''}`;
  }

  function render(preview) { layout(preview); decorate(); }

  function persist() { ctx.onSave({ v: 1, sig, order, flips, pinned: [...pinned] }); }

  function say(t, kind = '') { status.textContent = t; status.className = `feedback${kind ? ` is-${kind}` : ''}`; }

  let lastFits = fitCount(order, flips);
  function commit({ quiet = false } = {}) {
    const k = fitCount(order, flips);
    if (!quiet) { if (k > lastFits) sfx.good(); else sfx.click(); }
    lastFits = k;
    persist();
    render();
    ctx.onProgress(progressOf(order, flips, flipsOn));
    checkSolved();
  }

  function checkSolved() {
    if (solved || !isSolved(order, flips)) return;
    solved = true;
    selS = null;
    held = null;
    drag = null;
    bed.classList.add('is-solved');
    render();
    say('The seams close. The note reads clean.', 'good');
    const rm = reduceMotion();
    timers.push(setTimeout(() => {
      bed.classList.add('is-sealed');
      cutStrips(false);
      transcript.hidden = false;
      sfx.solve();
      ctx.onProgress(1);
      if (!told) { told = true; ctx.onSolved(); }
    }, rm ? 60 : 700));
  }

  function focusStrip() {
    const s = order[focusPos];
    decorate();
    strips[s].el.focus({ preventScroll: true });
  }

  function flip(s) {
    if (solved) return;
    const p = order.indexOf(s);
    if (pinned.has(p)) { say('That strip is pinned. It is already right.'); return; }
    flips = flips.slice();
    flips[s] = flips[s] ? 0 : 1;
    commit();
    say(flips[s] ? 'Turned over. Now it is upside down.' : 'Turned over. The type is the right way up.');
  }

  function tap(p) {
    if (solved) return;
    focusPos = p;
    const s = order[p];
    if (pinned.has(p)) { say('That strip is pinned in its place.'); decorate(); return; }
    if (selS == null) {
      selS = s;
      sfx.click();
      say(flipsOn ? 'Tap another strip to swap, or Turn over.' : 'Tap another strip to swap them.');
      render();
    } else if (selS === s) {
      selS = null;
      say('');
      render();
    } else {
      const a = order.indexOf(selS);
      order = swapStrips(order, pinned, a, p);
      selS = null;
      say('');
      commit();
    }
  }

  // ---- pointer: drag sideways, or tap ----
  function placeAt(clientX) {
    const box = bed.getBoundingClientRect();
    const x = clientX - box.left - drag.grab; // left edge of the dragged strip
    const xs = xsFor(order);
    let best = 0;
    xs.forEach((v, p) => { if (Math.abs(v - x) < Math.abs(xs[best] - x)) best = p; });
    return best;
  }

  bed.addEventListener('pointerdown', (e) => {
    if (solved || drag) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const st = e.target.closest?.('.shr-strip');
    if (!st) return;
    const s = Number(st.dataset.s);
    const p = order.indexOf(s);
    const box = st.getBoundingClientRect();
    drag = { s, p, id: e.pointerId, sx: e.clientX, sy: e.clientY, moving: false, grab: e.clientX - box.left, type: e.pointerType, to: p };
    try { st.setPointerCapture(e.pointerId); } catch { /* fine */ }
    if (e.pointerType === 'mouse') e.preventDefault(); // no text selection while dragging
  });
  bed.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moving) {
      const far = drag.type === 'mouse' ? Math.hypot(dx, dy) > 6 : Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2;
      if (!far) return;
      if (pinned.has(drag.p)) { drag = null; say('That strip is pinned in its place.'); return; }
      drag.moving = true;
      selS = null;
      held = null;
      strips[drag.s].el.classList.add('is-drag');
      decorate();
    }
    e.preventDefault();
    const box = bed.getBoundingClientRect();
    const x = Math.max(-sw / 2, Math.min(bedW - sw / 2, e.clientX - box.left - drag.grab));
    strips[drag.s].el.style.transform = `translate(${x}px, ${topY - LIFT}px)`;
    let to = placeAt(e.clientX);
    if (pinned.has(to)) to = drag.to;
    drag.to = to;
    layout(moveStrip(order, pinned, drag.p, to));
  });
  function endPointer(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    strips[d.s].el.classList.remove('is-drag');
    if (cancelled) { render(); return; }
    if (d.moving) {
      const before = order;
      order = moveStrip(order, pinned, d.p, d.to);
      focusPos = order.indexOf(d.s);
      if (before.join() === order.join()) { sfx.click(); render(); } else commit();
    } else tap(d.p);
  }
  bed.addEventListener('pointerup', (e) => endPointer(e, false));
  bed.addEventListener('pointercancel', (e) => endPointer(e, true));
  bed.addEventListener('lostpointercapture', (e) => { if (drag && e.pointerId === drag.id && drag.moving) endPointer(e, false); });

  // ---- keyboard: focus a strip, Space picks up, arrows move, Space drops ----
  bed.addEventListener('keydown', (e) => {
    if (solved || e.ctrlKey || e.metaKey || e.altKey) return;
    const st = e.target.closest?.('.shr-strip');
    if (!st) return;
    const s = Number(st.dataset.s);
    const p = order.indexOf(s);
    focusPos = p;
    const k = e.key;
    if (k === ' ' || k === 'Enter') {
      e.preventDefault();
      if (held == null) {
        if (pinned.has(p)) { say('That strip is pinned in its place.'); return; }
        held = s;
        heldFrom = order.slice();
        selS = null;
        sfx.click();
        say('Picked up. Left and Right move it. Space drops it. Escape puts it back.');
        render();
      } else {
        held = null;
        heldFrom = null;
        say('Dropped.');
        commit({ quiet: false });
        focusStrip();
      }
    } else if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End') {
      e.preventDefault();
      const dir = k === 'ArrowLeft' || k === 'Home' ? -1 : 1;
      if (held != null) {
        const hp = order.indexOf(held);
        const free = freePlaces(N, pinned);
        const i = free.indexOf(hp);
        const j = k === 'Home' ? 0 : k === 'End' ? free.length - 1 : i + dir;
        if (j < 0 || j >= free.length || j === i) return;
        order = moveStrip(order, pinned, hp, free[j]);
        focusPos = free[j];
        sfx.click();
        persist();
        render();
        focusStrip();
      } else {
        const q = k === 'Home' ? 0 : k === 'End' ? N - 1 : p + dir;
        if (q < 0 || q >= N) return;
        focusPos = q;
        focusStrip();
      }
    } else if (k === 'Escape' && held != null) {
      e.preventDefault();
      order = heldFrom || order;
      held = null;
      heldFrom = null;
      focusPos = order.indexOf(s);
      say('Put back.');
      render();
      persist();
      focusStrip();
    } else if ((k === 'r' || k === 'R') && flipsOn) {
      e.preventDefault();
      flip(s);
      focusStrip();
    }
  });
  bed.addEventListener('focusout', (e) => {
    if (held != null && !bed.contains(e.relatedTarget)) { held = null; heldFrom = null; commit({ quiet: true }); }
  });

  // ---- size: redraw when the game area changes width ----
  let ro = null, raf = 0;
  const onResize = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (Math.abs(availWidth() - lastAvail) < 12) return;
      bed.classList.add('is-instant');
      measureAll();
      render();
      requestAnimationFrame(() => bed.classList.remove('is-instant'));
    });
  };
  if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(onResize); ro.observe(desk); } else window.addEventListener('resize', onResize);

  // ---- start ----
  bed.classList.add('is-instant');
  measureAll();
  render();
  requestAnimationFrame(() => requestAnimationFrame(() => bed.classList.remove('is-instant')));
  // web fonts may arrive after the first draw: draw the paper again with the real type
  if (document.fonts?.load) {
    Promise.all([
      document.fonts.load("16px 'Special Elite'"),
      title || stampText ? document.fonts.load("800 30px 'Big Shoulders Display'") : null,
    ]).then(() => { if (el.isConnected) { measureAll(); render(); } }).catch(() => {});
  }
  persist();
  ctx.onProgress(progressOf(order, flips, flipsOn));
  if (isSolved(order, flips)) checkSolved();

  return {
    hint() {
      if (solved) return null;
      const r = hintStep(order, flips, pinned);
      if (!r) return null;
      order = r.order;
      flips = r.flips;
      pinned = r.pinned;
      selS = null;
      held = null;
      focusPos = r.strip;
      commit({ quiet: true });
      sfx.pin();
      const st = strips[r.strip].el;
      st.classList.remove('is-hinted');
      void st.offsetWidth;
      st.classList.add('is-hinted');
      return `The ${ord(r.strip)} strip from the left is back in its place, pinned.`;
    },
    devSolve() {
      if (solved) return;
      order = Array.from({ length: N }, (_, i) => i);
      flips = Array(N).fill(0);
      commit({ quiet: true });
    },
    destroy() {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', onResize);
    },
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Put the shredded strips back in order so you can read the note.',
  steps: [
    'Drag a strip left or right to move it.',
    'Or tap one strip, then tap another, to swap them.',
    'A green mark on a seam means two strips belong together.',
    ({ params }) => (params.flips ? 'Upside-down strip? Tap it, then tap Turn over.' : 'Use the words, the stamp and the signature as guides.'),
    'When every seam fits, the note can be read.',
  ],
  example: {
    caption: 'The first two strips fit, so their seam has green marks. Drag the strip with the arrow one place to the left, and the words join up.',
    render(el) {
      const sw = 40, hh = 96, n = 5;
      const doc = rect(0, 0, sw * n, hh, { fill: '#f6f0de', stroke: 'none', sw: 0 })
        + text(100, 22, 'SENG HUAT', { size: 15, weight: 800, font: 'display', fill: C.soft })
        + `<rect x="12" y="29" width="176" height="1.6" fill="${C.soft}"/>`
        + text(14, 52, 'MEET ME', { size: 15, anchor: 'start', font: 'doc' })
        + text(14, 72, 'AT THE JETTY', { size: 15, anchor: 'start', font: 'doc' })
        + `<path d="M120 86 q8 -12 14 0 t14 0 t14 0" fill="none" stroke="${C.blue}" stroke-width="1.6" stroke-linecap="round"/>`;
      const shown = [0, 1, 3, 2, 4];
      const xs = [], ys = [12, 12, 4, 16, 8];
      let x = 18;
      shown.forEach((s, p) => { if (p > 0) x += sw + (p === 1 ? 0 : 7); xs.push(x); });
      let s = rect(0, 0, 300, 128, { fill: '#2a2521', stroke: 'none', sw: 0, rx: 6 });
      shown.forEach((id, p) => {
        s += `<rect x="${xs[p] + 1}" y="${ys[p] + 2}" width="${sw}" height="${hh}" fill="rgba(0,0,0,.4)"/>`;
        s += `<svg x="${xs[p]}" y="${ys[p]}" width="${sw}" height="${hh}" viewBox="${id * sw} 0 ${sw} ${hh}">${doc}</svg>`;
      });
      // green seam marks between the first two
      const sx = xs[1] - 1.5;
      s += `<rect x="${sx}" y="${ys[0] - 7}" width="3" height="6" fill="${C.green}"/><rect x="${sx}" y="${ys[0] + hh + 1}" width="3" height="6" fill="${C.green}"/>`;
      s += arrow(xs[3] + 34, 60, xs[2] + 6, 60, { bend: -16, sw: 3 });
      s += `<rect x="${xs[3] - 1}" y="${ys[3] - 1}" width="${sw + 2}" height="${hh + 2}" fill="none" stroke="${C.amber}" stroke-width="2.5"/>`;
      put(el, svg(300, 128, s, 'Five strips of a note on a desk; the first two fit, one strip is dragged one place left'));
    },
  },
  tips: [
    'Start with the letterhead or the first line: it shows where each strip goes.',
    ({ params }) => (params.flips ? 'The green mark only shows on strips that are the right way up.' : 'Strips you swap by mistake can always be swapped back.'),
  ],
  controls: {
    touch: 'Drag a strip sideways, or tap two strips to swap them. Swipe up and down to scroll.',
    keys: ({ params }) => `Tab to the strips, Left and Right to choose one, Space to pick it up, Left and Right to move it, Space to drop it.${params.flips ? ' R turns it over.' : ''}`,
  },
};
