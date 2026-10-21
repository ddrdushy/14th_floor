// "How to play" cards.
//
// Each mini game may export a `howTo` object:
//
//   export const howTo = {
//     goal: 'One plain sentence: what you are trying to do.',
//     steps: ['Short imperative step', ...],          // 3 to 5 steps, about 14 words each at most
//     example: { caption: '...', render?: (el, info) => void },  // a tiny static worked example
//     tips: ['optional short tip', ...],              // 0 to 2
//     controls: { touch: '...', keys: '...' },        // optional, one line each
//   };
//
// Optional extras (all additive, the plain object above is enough):
//   - any text field (goal, a step, a tip, a caption, the steps/tips arrays themselves) may be a
//     function ({ params, variant }) => value, so numbers can follow the level data;
//   - `variants: { <variant id>: { ...fields to replace } }` swaps fields for one variant.
//
// The puzzle screen shows the card the first time a player meets a game (state().seenHowTo[id]),
// and before the very first puzzle a short explainer of how a case works (state().seenLoop).
import { h } from './ui.js';
import { state, save } from './state.js';
import { put, svg, rect, text, arrow, ring, C } from './howto-kit.js';
import { onNavigate } from './router.js';

let uid = 0;
let open = null; // { close(result) } for the card on screen

const MAGNIFIER = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/></svg>';

/** The howTo of a game module, with variant overrides applied and function fields evaluated. */
export function resolveHowTo(mod, { params = {}, variant } = {}) {
  let ht = mod?.howTo;
  if (!ht) return null;
  const info = { params: params || {}, variant };
  if (typeof ht === 'function') ht = ht(info);
  if (!ht) return null;
  const v = variant && ht.variants?.[variant];
  const m = v ? { ...ht, ...v, controls: v.controls === undefined ? ht.controls : v.controls } : ht;
  const val = (x) => (typeof x === 'function' ? x(info) : x);
  const list = (x) => (val(x) || []).map(val).filter(Boolean);
  const ex = val(m.example);
  const ctl = val(m.controls);
  return {
    goal: val(m.goal) || '',
    steps: list(m.steps),
    example: ex ? { caption: val(ex.caption) || '', render: ex.render || null } : null,
    tips: list(m.tips),
    controls: ctl ? { touch: val(ctl.touch) || '', keys: val(ctl.keys) || '' } : null,
    info,
  };
}

// ---------------------------------------------------------------------------------------------
// seen flags
export const seenHowTo = (id) => !!state().seenHowTo?.[id];
export function markHowToSeen(id) {
  const s = state();
  if (!s.seenHowTo || typeof s.seenHowTo !== 'object') s.seenHowTo = {};
  s.seenHowTo[id] = true;
  save();
}
/** Players who already solved puzzles before this card existed know the loop: skip it for them. */
export const needsLoopTutorial = () => !state().seenLoop && !(state().solvedTotal > 0);
export function markLoopSeen() {
  state().seenLoop = true;
  save();
}

// ---------------------------------------------------------------------------------------------
// the card

/** Close whatever card is open (used when a screen is destroyed). */
export function closeHowTo() {
  open?.close('gone');
}
export const isHowToOpen = () => !!open;

/**
 * Show a card over the game panel. anchor: { topbar, panel } elements of the current screen.
 * Resolves 'done' when the player dismisses it, 'gone' if it was closed by the screen.
 */
function showCard({ kicker, title, build, button = 'Got it, start', anchor = {}, labelId }) {
  open?.close('gone');
  return new Promise((resolve) => {
    const overlay = document.getElementById('overlay');
    const before = document.activeElement;
    const id = labelId || `ht-title-${++uid}`;
    const go = h('button', { class: 'btn btn--primary ht-go', type: 'button', onclick: () => close('done') }, button);
    const card = h('section', { class: 'howto-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id },
      h('header', { class: 'ht-head' },
        h('p', { class: 'ht-kicker' }, kicker),
        h('h2', { class: 'ht-title', id }, title),
        h('button', { class: 'ht-close', type: 'button', 'aria-label': 'Close', onclick: () => close('done') }, h('span', { 'aria-hidden': 'true' }, '×'))),
      h('div', { class: 'ht-body' }, build()),
      h('footer', { class: 'ht-foot' }, go));
    const layer = h('div', { class: 'modal-backdrop howto-layer' }, card);

    const place = () => {
      const appBox = document.getElementById('app').getBoundingClientRect();
      const scr = document.getElementById('screen').getBoundingClientRect();
      let top = scr.top, left = scr.left;
      const { right, bottom } = scr;
      if (anchor.topbar?.isConnected) top = Math.max(top, Math.min(bottom - 200, anchor.topbar.getBoundingClientRect().bottom));
      // wide layouts: cover only the game column, so the evidence photo stays in view
      if (anchor.panel?.isConnected) {
        const r = anchor.panel.getBoundingClientRect();
        if (r.left - left > 160 && right - r.left >= 420) left = r.left;
      }
      Object.assign(layer.style, { top: `${top - appBox.top}px`, left: `${left - appBox.left}px`, width: `${right - left}px`, height: `${bottom - top}px` });
    };

    // keys stay inside the card: games listen on document, so stop them at the window first
    const onKey = (e) => {
      if (document.querySelector('.settings-backdrop')) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close('done'); return; }
      if (e.key === 'Tab') {
        const f = [...card.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
        if (f.length) {
          const i = f.indexOf(document.activeElement);
          if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
        }
      }
      e.stopPropagation();
    };

    // leaving the screen closes the card (screens also close it in destroy())
    const offNav = onNavigate(() => close('gone'));

    function close(result) {
      if (!layer.isConnected) return;
      offNav();
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', place);
      if (open && open.layer === layer) open = null;
      layer.classList.add('is-closing');
      setTimeout(() => layer.remove(), result === 'gone' ? 0 : 160);
      if (result !== 'gone' && before && before.isConnected) before.focus?.({ preventScroll: true });
      resolve(result);
    }

    overlay.append(layer);
    place();
    window.addEventListener('resize', place);
    window.addEventListener('keydown', onKey, true);
    open = { close, layer };
    requestAnimationFrame(() => { place(); go.focus({ preventScroll: true }); });
  });
}

function exampleFigure(ex, info) {
  if (!ex || (!ex.render && !ex.caption)) return null;
  const art = h('div', { class: 'ht-ex-art' });
  if (ex.render) {
    try { ex.render(art, info); } catch (err) { console.warn('howTo example failed', err); art.remove(); }
  }
  return h('figure', { class: 'ht-example' },
    h('figcaption', { class: 'ht-ex-label' }, 'Example'),
    ex.render ? art : null,
    ex.caption ? h('p', { class: 'ht-ex-cap' }, ex.caption) : null);
}

function howToBody(ht) {
  const out = [];
  if (ht.goal) out.push(h('div', { class: 'ht-goal' }, h('span', { class: 'ht-label' }, 'Your goal'), h('p', {}, ht.goal)));
  if (ht.steps.length) {
    out.push(h('h3', { class: 'ht-sub' }, 'Steps'));
    out.push(h('ol', { class: 'ht-steps' }, ht.steps.map((s, i) => h('li', {}, h('span', { class: 'ht-num', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'ht-step' }, s)))));
  }
  out.push(exampleFigure(ht.example, ht.info));
  if (ht.tips.length) out.push(h('ul', { class: 'ht-tips' }, ht.tips.map((t) => h('li', {}, h('b', {}, 'Tip '), t))));
  if (ht.controls && (ht.controls.touch || ht.controls.keys)) {
    out.push(h('dl', { class: 'ht-controls' },
      ht.controls.touch ? h('div', { class: 'ht-ctl ht-ctl--touch' }, h('dt', {}, 'Touch'), h('dd', {}, ht.controls.touch)) : null,
      ht.controls.keys ? h('div', { class: 'ht-ctl ht-ctl--keys' }, h('dt', {}, 'Keyboard'), h('dd', {}, ht.controls.keys)) : null));
  }
  return out.filter(Boolean);
}

/** The "How to play" card for one game. ht from resolveHowTo; fallbackText when a game has none. */
export function showGameHowTo({ name, ht, fallbackText = '', anchor, button }) {
  const body = ht || { goal: fallbackText, steps: [], example: null, tips: [], controls: null, info: {} };
  return showCard({ kicker: 'How to play', title: name, anchor, button, build: () => howToBody(body) });
}

// ---------------------------------------------------------------------------------------------
// the case loop, taught once

function loopArt() {
  // puzzle sheet -> fogged photo clearing -> card pinned to the board
  let s = rect(0, 0, 380, 132, { fill: '#1c2730', stroke: 'none', sw: 0, rx: 4 });
  // 1. puzzle sheet with a small grid
  s += rect(8, 14, 84, 92, { fill: C.paper, stroke: C.ink, sw: 1.5, rx: 3 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) s += rect(20 + c * 20, 30 + r * 20, 20, 20, { fill: r === 1 && c === 2 ? C.yellow : C.paper, stroke: C.ink, sw: 1 });
  s += text(30, 45, '4', { size: 14, weight: 700, font: 'display' }) + text(70, 85, '7', { size: 14, weight: 700, font: 'display' }) + text(50, 65, '2', { size: 14, weight: 700, font: 'display' });
  s += text(50, 124, '1. Solve', { size: 13, weight: 700, fill: C.paper });
  s += arrow(100, 60, 128, 60, { color: C.amber, sw: 2.5, head: 8 });
  // 2. photo, half fog
  s += rect(136, 14, 96, 92, { fill: '#f4efe3', stroke: '#f4efe3', sw: 1, rx: 1 });
  s += rect(142, 20, 84, 64, { fill: '#3a4a56', stroke: 'none', sw: 0 });
  s += `<path d="M142 70 L170 48 L190 62 L214 40 L226 52 L226 84 L142 84Z" fill="#5b6a70"/>`;
  s += `<circle cx="200" cy="66" r="7" fill="${C.amber}"/>`;
  s += `<rect x="142" y="20" width="44" height="64" fill="#24303a" opacity=".85"/><circle cx="172" cy="40" r="16" fill="#24303a" opacity=".7"/>`;
  s += ring(200, 66, 12, { sw: 2.5 });
  s += text(184, 124, '2. Fog clears', { size: 13, weight: 700, fill: C.paper });
  s += arrow(240, 60, 268, 60, { color: C.amber, sw: 2.5, head: 8 });
  // 3. cork board with pinned card and thread
  s += rect(276, 14, 96, 92, { fill: '#8a6a44', stroke: '#5a4428', sw: 2, rx: 2 });
  s += rect(288, 30, 34, 40, { fill: C.paper, stroke: C.ink, sw: 1 }) + rect(330, 46, 32, 40, { fill: '#e9dcb8', stroke: C.ink, sw: 1 });
  s += `<path d="M305 30 Q330 18 346 46" fill="none" stroke="${C.red}" stroke-width="2.2"/><circle cx="305" cy="30" r="3.4" fill="${C.red}"/><circle cx="346" cy="46" r="3.4" fill="${C.red}"/>`;
  s += text(324, 124, '3. Pin & decide', { size: 13, weight: 700, fill: C.paper });
  return svg(380, 132, s, 'Solve the puzzle, the fog clears from the photo, the clue is pinned to your board');
}

/**
 * The once-only explainer of how a case works. opts.hints: magnifiers left in this case (if known).
 * opts.next: the name of the game whose card follows, for the button label.
 */
export function showLoopTutorial({ anchor, hints, next } = {}) {
  const build = () => {
    const art = h('div', { class: 'ht-loop-art' });
    put(art, loopArt());
    const count = Number.isFinite(hints) ? hints : null;
    return [
      art,
      h('ol', { class: 'ht-steps ht-steps--loop' },
        h('li', {}, h('span', { class: 'ht-num', 'aria-hidden': 'true' }, '1'), h('span', { class: 'ht-step' }, h('b', {}, 'Solve the puzzle. '), 'Each case is a chain of puzzles. Do them one at a time.')),
        h('li', {}, h('span', { class: 'ht-num', 'aria-hidden': 'true' }, '2'), h('span', { class: 'ht-step' }, h('b', {}, 'Watch the photo. '), 'Every correct step clears some fog from the crime-scene photo. When you finish, a hidden clue is circled.')),
        h('li', {}, h('span', { class: 'ht-num', 'aria-hidden': 'true' }, '3'), h('span', { class: 'ht-step' }, h('b', {}, 'Pin it and decide. '), 'Each clue goes on your case board. After the last puzzle, tap "Name the killer" on the case map. Nobody will tell you if you are right.'))),
      h('div', { class: 'ht-magnifier' },
        h('span', { class: 'ht-mag-chip', 'aria-hidden': 'true' }, h('span', { class: 'ht-mag-ico', html: MAGNIFIER }), h('span', { class: 'ht-mag-n' }, count != null ? String(count) : '5')),
        h('div', {},
          h('h3', {}, 'Stuck? Use the Magnifier'),
          h('p', {}, `The Magnifier button at the top asks the lab for help: a clue, a filled square, or a wrong answer ruled out. ${count != null ? `This case gives you ${count}.` : 'Each case gives you only a few.'} They are shared by every puzzle in the case, so save them.`))),
      h('p', { class: 'ht-note' }, 'The "?" button at the top shows the rules again at any time. Your progress is kept.'),
    ];
  };
  return showCard({ kicker: 'Your first case', title: 'How a case works', anchor, build, button: next ? 'Next: how to play' : 'Got it' });
}

// ---------------------------------------------------------------------------------------------
// other screens' explainers (same card, same Back/Esc behaviour)

/** A plain explainer card in the "How to play" style. build: () => nodes for the body. */
export function showInfoCard({ kicker, title, build, button = 'Got it', anchor }) {
  return showCard({ kicker, title, build, button, anchor });
}

// ---------------------------------------------------------------------------------------------
// small pieces for screens

/** The persistent "?" / "How to play" button for a screen's top bar. */
export function howToButton(onclick) {
  return h('button', { class: 'btn btn--small howto-btn', type: 'button', onclick, 'aria-label': 'How to play', title: 'How to play' },
    h('span', { class: 'howto-btn-q', 'aria-hidden': 'true' }, '?'), h('span', { class: 'howto-btn-label' }, 'How to play'));
}

/** One line under the game title: the goal and a link to the full card. */
export function goalLine(ht, onclick) {
  return h('p', { class: 'howto-goal-line' },
    h('span', { class: 'howto-goal-text' }, h('b', {}, 'Goal: '), ht.goal),
    ' ',
    h('button', { class: 'howto-link', type: 'button', onclick }, 'How to play'));
}
