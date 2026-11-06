// Game feel: the small physical moments around a puzzle. Haptics on phones, the "Exhibit secured"
// rubber stamp on a solve, the card flying to the case board when it is pinned, a fanfare card on a
// promotion, and a one-line sense of how far the case has come.
//
// Everything here is decoration over the puzzle screen (screens/puzzle.js): nothing in it can stop
// the game from working. With prefers-reduced-motion there are no flights or shakes, only fades.
// Messages are written into aria-live regions, so screen readers hear them.
import { h } from './ui.js';
import { state, RANKS } from './state.js';
import { sfx, onCue } from './audio.js';
import { activeLevels } from '../data/cases.js';
import '../styles/feel.css';

export const reducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

// ---------- screen reader announcements ----------
let live = null;
/** Say something politely to screen readers (one shared, visually hidden live region). */
export function announce(text) {
  if (!text) return;
  try {
    if (!live || !live.isConnected) {
      live = h('div', { class: 'feel-sr', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
      document.body.append(live);
    }
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 60);
  } catch { /* never break the game for an announcement */ }
}

// ---------- haptics ----------
const PATTERNS = {
  solve: [22, 60, 22, 60, 80],
  wrong: [55],
  hint: [14],
  rank: [30, 50, 30, 50, 30, 90, 160],
};

/** True where the Vibration API exists (most Android browsers; not iOS Safari or desktop). */
export const canVibrate = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

/** Buzz for a moment of play ('solve' | 'wrong' | 'hint' | 'rank'). Does nothing if unsupported or switched off. */
export function haptic(kind) {
  if (!canVibrate()) return false;
  try {
    if (state().settings?.vibration === false) return false;
    return navigator.vibrate(PATTERNS[kind] || 20);
  } catch {
    return false;
  }
}

/** While a puzzle is open: a game's "wrong" cue (sfx.bad, a camera alarm) also buzzes. Returns a stop function. */
export function watchWrongMoves() {
  let last = 0;
  return onCue((name) => {
    if (name !== 'bad' && name !== 'alarm') return;
    const now = Date.now();
    if (now - last < 300) return; // a burst of wrong cues is one buzz
    last = now;
    haptic('wrong');
  });
}

// ---------- the solve stamp ----------

/**
 * Land an "Exhibit secured" rubber stamp on the evidence card, with a thud.
 * Resolves when the stamp has settled.
 */
export function stampSecured(card, { sub = '' } = {}) {
  const reduced = reducedMotion();
  const stamp = h('span', { class: 'feel-stamp', 'aria-hidden': 'true' },
    h('span', { class: 'feel-stamp-main' }, 'Exhibit secured'),
    sub ? h('span', { class: 'feel-stamp-sub' }, sub) : null);
  card.classList.add('has-feel-stamp');
  card.append(stamp);
  // force a style pass so the landing animation starts from its first frame
  void stamp.offsetWidth;
  stamp.classList.add(reduced ? 'is-fading' : 'is-landing');
  const impact = reduced ? 0 : 190;
  setTimeout(() => {
    sfx.thud();
    if (!reduced) {
      card.classList.add('feel-jolt');
      setTimeout(() => card.classList.remove('feel-jolt'), 420);
    }
  }, impact);
  return new Promise((r) => setTimeout(r, reduced ? 320 : 640));
}

// ---------- the card flies to the board ----------

const visible = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';

/** Where the case board lives right now: the phone nav's Board tab, else the top bar's Board button. */
export function boardTarget(root = document) {
  const tab = document.querySelector('body.nav-on .phone-nav .pn-board');
  if (visible(tab)) return tab;
  const btn = root.querySelector?.('.topbar .nav-dup');
  if (visible(btn)) return btn;
  return null;
}

/**
 * A copy of the card flies off toward the board and shrinks into it; the board button glows.
 * Reduced motion: no flight, the board button glows and fades. Resolves when done.
 */
export function flyToBoard(card, root = document) {
  const target = boardTarget(root);
  const glow = () => {
    if (!target) return;
    target.classList.remove('feel-board-ping');
    void target.offsetWidth;
    target.classList.add('feel-board-ping');
    setTimeout(() => target.classList.remove('feel-board-ping'), 1300);
  };
  if (reducedMotion() || typeof card.animate !== 'function') { glow(); return Promise.resolve(); }
  const from = card.getBoundingClientRect();
  if (!from.width) { glow(); return Promise.resolve(); }
  // no board button on screen (a narrow top bar): aim for the top right corner, where it usually sits
  const to = target ? target.getBoundingClientRect() : { left: window.innerWidth - 60, top: 10, width: 40, height: 40 };
  const ghost = card.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.classList.add('feel-ghost');
  ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  Object.assign(ghost.style, {
    position: 'fixed', left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`,
    margin: '0', zIndex: '70', pointerEvents: 'none', animation: 'none', transformOrigin: '50% 50%',
  });
  document.body.append(ghost);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const end = Math.max(0.06, Math.min(0.2, 48 / from.width));
  const anim = ghost.animate([
    { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
    { transform: `translate(${dx * 0.18}px, ${dy * 0.18 - 36}px) scale(0.72) rotate(-5deg)`, opacity: 1, offset: 0.35 },
    { transform: `translate(${dx}px, ${dy}px) scale(${end}) rotate(-12deg)`, opacity: 0.35 },
  ], { duration: 700, easing: 'cubic-bezier(0.45, 0, 0.6, 1)', fill: 'forwards' });
  return new Promise((resolve) => {
    const done = () => { ghost.remove(); glow(); resolve(); };
    anim.onfinish = done;
    anim.oncancel = done;
    setTimeout(() => { if (ghost.isConnected) done(); }, 1400); // a frozen tab never leaves a copy behind
  });
}

// ---------- promotion ----------

/** The rank a number of solved puzzles earns (same rule as rank() in state.js). */
export function rankAt(n) {
  let current = RANKS[0], next = null;
  for (let i = 0; i < RANKS.length; i++) if (n >= RANKS[i].at) { current = RANKS[i]; next = RANKS[i + 1] || null; }
  return { ...current, next };
}

let rankCard = null;

/** A brief fanfare card: "Promoted: Licensed PI". Dismissed by a tap, Escape, or on its own. */
export function showRankUp(r) {
  rankCard?.close();
  const host = document.getElementById('overlay') || document.body;
  const reduced = reducedMotion();
  const solved = state().solvedTotal || 0;
  const line = r.next
    ? `${r.next.at - solved} more ${r.next.at - solved === 1 ? 'exhibit' : 'exhibits'} to ${r.next.name}.`
    : 'There is nobody left above you. Only the cases.';
  const card = h('div', { class: `feel-rank${reduced ? ' is-reduced' : ''}` },
    h('div', { class: 'feel-rank-card' },
      h('p', { class: 'feel-rank-kicker' }, 'Promotion'),
      h('p', { class: 'feel-rank-name' }, r.name),
      h('p', { class: 'feel-rank-line' }, line),
      h('button', { class: 'feel-rank-close', type: 'button', 'aria-label': 'Dismiss the promotion' }, h('span', { 'aria-hidden': 'true' }, '×'))));
  let timer = 0;
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  function close() {
    if (!card.isConnected) return;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    card.classList.add('is-leaving');
    setTimeout(() => card.remove(), reduced ? 200 : 320);
    if (rankCard?.card === card) rankCard = null;
  }
  card.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  host.append(card);
  announce(`Promotion: ${r.name}. ${line}`);
  sfx.fanfare();
  haptic('rank');
  timer = setTimeout(close, 5500);
  rankCard = { card, close };
  return rankCard;
}

/** Remove a promotion card that is still showing (the puzzle screen is closing). */
export const closeRankUp = () => rankCard?.close();

// ---------- momentum ----------

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * One line on how far the case has come after solving levelId, from the case's levels and phases.
 * The total number of puzzles stays a secret until the last stretch (three or fewer left).
 */
export function momentumLine(c, cs, levelId) {
  try {
    const levels = activeLevels(c, cs);
    const left = levels.filter((l) => !cs.solved[l.id]);
    if (!left.length) return 'Every exhibit is in. The deduction room is open.';
    if (left.length <= 3) return `Last stretch: ${plural(left.length, 'puzzle', 'puzzles')} before the deduction room.`;
    const phase = levels.find((l) => l.id === levelId)?.phase;
    if (!phase) return '';
    const here = left.filter((l) => l.phase === phase).length;
    if (here > 0) return `${plural(here, 'more exhibit', 'more exhibits')} to clear ${phase}.`;
    return `${phase}: cleared. A new lead is waiting on the map.`;
  } catch {
    return '';
  }
}

/** Puzzles solved in a row, across cases, without a magnifier. */
export function cleanStreak() {
  try {
    const all = Object.values(state().cases || {})
      .flatMap((cs) => Object.values(cs?.solved || {}))
      .filter((x) => x && x.at)
      .sort((a, b) => a.at - b.at);
    let n = 0;
    for (let i = all.length - 1; i >= 0 && !(all[i].hints > 0); i--) n++;
    return n;
  } catch {
    return 0;
  }
}
