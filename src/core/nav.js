// Phone navigation: a thumb-reachable tab bar (Office, Case map, Board, Puzzle, Settings)
// and the hardware/gesture Back button wired to each screen's own back action.
// The bar is only drawn on small touch screens (see styles/mobile.css); on desktop it stays hidden.
import { h } from './ui.js';
import { go, onNavigate } from './router.js';
import { state } from './state.js';
import { openSettings } from './settings.js';
import { CASES, levelStatus, resolveCaseId } from '../data/cases.js';

// screens that get the bar; cinematics, the title and detective creation stay full screen
const NAV_SCREENS = new Set(['office', 'map', 'puzzle', 'board', 'deduce', 'archive', 'closed', 'lab']);

const ICONS = {
  office: '<path d="M4 20h16M6 20V9l6-4 6 4v11M10 20v-5h4v5" />',
  map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4zM9 4v14M15 6v14" />',
  board: '<rect x="3.5" y="4.5" width="17" height="13" rx="1" /><path d="M8 21l2-3.5M16 21l-2-3.5M7.5 9.5l4 3 5-4" /><circle cx="7.5" cy="9.5" r="1.2" /><circle cx="16.5" cy="8.5" r="1.2" />',
  puzzle: '<circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5.5 5.5" />',
  settings: '<path d="M10.3 2.6h3.4l.5 2.6c.6.2 1.2.5 1.7.9l2.5-.9 1.7 2.9-2 1.7c.1.6.1 1.3 0 1.9l2 1.7-1.7 2.9-2.5-.9c-.5.4-1.1.7-1.7.9l-.5 2.6h-3.4l-.5-2.6c-.6-.2-1.2-.5-1.7-.9l-2.5.9-1.7-2.9 2-1.7a6 6 0 0 1 0-1.9l-2-1.7 1.7-2.9 2.5.9c.5-.4 1.1-.7 1.7-.9z" /><circle cx="12" cy="12" r="2.8" />',
  back: '<path d="M14.5 5.5 8 12l6.5 6.5" />',
};
export const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

/**
 * A screen's back button: chevron plus label (and an optional shorter label for phones).
 * The phone Back gesture presses it too.
 */
export function backButton(label, onclick, short) {
  return h('button', { class: `btn btn--ghost btn--small back-btn${short ? ' has-short' : ''}`, 'data-back': '', onclick, 'aria-label': short ? label : null },
    h('span', { class: 'back-ico', html: icon('back') }),
    h('span', { class: 'back-label' }, label),
    short ? h('span', { class: 'back-short', 'aria-hidden': 'true' }, short) : null);
}

let current = null; // screen name
let params = {};
let lastCase = null;
let lastPuzzle = null; // { caseId, levelId }

const caseNow = () => resolveCaseId(lastCase || undefined);

/** Where the Puzzle tab leads: the puzzle you left, else the case's next puzzle, else the deduction. */
function puzzleTarget() {
  const id = caseNow();
  const c = CASES[id];
  const cs = state().cases?.[id];
  if (!c) return { name: 'office', params: {}, label: 'Puzzle' };
  if (lastPuzzle && lastPuzzle.caseId === id && !(cs && cs.solved[lastPuzzle.levelId])) return { name: 'puzzle', params: { ...lastPuzzle }, label: 'Puzzle' };
  if (!cs) return { name: 'map', params: { caseId: id }, label: 'Puzzle' };
  const { current: next } = levelStatus(c, cs);
  if (next) return { name: 'puzzle', params: { caseId: id, levelId: next.id }, label: 'Puzzle' };
  if (cs.status === 'closed') return { name: 'closed', params: { caseId: id }, label: 'Case file' };
  return { name: 'deduce', params: { caseId: id }, label: 'Deduce' };
}

const TABS = [
  { id: 'office', label: 'Office', active: ['office', 'archive'], go: () => go('office') },
  { id: 'map', label: 'Case map', active: ['map'], go: () => go('map', { caseId: caseNow() }) },
  {
    id: 'board', label: 'Board', active: ['board'],
    go: () => go('board', {
      caseId: caseNow(),
      back: current === 'puzzle' ? 'puzzle' : current === 'office' ? 'office' : 'map',
      levelId: current === 'puzzle' ? params.levelId : undefined,
    }),
  },
  { id: 'puzzle', label: 'Puzzle', active: ['puzzle', 'deduce', 'closed', 'lab'], go: () => { const t = puzzleTarget(); go(t.name, t.params); } },
  { id: 'settings', label: 'Settings', active: [], go: () => openSettings() },
];

export function initNav() {
  const app = document.getElementById('app');
  const buttons = {};
  const bar = h('nav', { class: 'phone-nav', 'aria-label': 'Main' },
    TABS.map((t) => {
      const lbl = h('span', { class: 'pn-label' }, t.label);
      const b = h('button', { class: `pn-tab pn-${t.id}`, type: 'button', onclick: () => {
        // tapping the tab you are on does nothing (except settings, which always opens)
        if (t.id !== 'settings' && t.active.includes(current) && !(t.id === 'puzzle' && current !== 'puzzle' && puzzleTarget().name !== current)) return;
        t.go();
      } }, h('span', { class: 'pn-ico', html: icon(t.id) }), lbl);
      buttons[t.id] = { b, lbl };
      return b;
    }));
  app.append(bar);

  function update() {
    const on = NAV_SCREENS.has(current) && !!state().profile;
    document.body.classList.toggle('nav-on', on);
    if (!on) return;
    for (const t of TABS) {
      const isActive = t.active.includes(current);
      if (isActive) buttons[t.id].b.setAttribute('aria-current', 'page');
      else buttons[t.id].b.removeAttribute('aria-current');
    }
    buttons.puzzle.lbl.textContent = current === 'puzzle' || current === 'lab' ? 'Puzzle' : puzzleTarget().label;
  }

  onNavigate((name, p = {}) => {
    current = name;
    params = p || {};
    if (p?.caseId && CASES[p.caseId]) lastCase = p.caseId;
    if (name === 'puzzle') {
      const cid = resolveCaseId(p.caseId);
      lastCase = cid;
      if (p.levelId) lastPuzzle = { caseId: cid, levelId: p.levelId };
    }
    if (name === 'office' || name === 'title') lastCase = null;
    update();
  });

  initBackGesture();
}

// Phone Back (Android button, edge swipe, browser back): close an open dialog first, otherwise
// press the screen's own back button. One spare history entry is added after a tap so the
// gesture lands here instead of leaving the game.
function initBackGesture() {
  let armed = false;
  const arm = () => {
    if (armed) return;
    armed = true;
    try { history.pushState({ floor14: true }, ''); } catch { armed = false; }
  };
  window.addEventListener('click', arm, { capture: true });
  window.addEventListener('popstate', () => {
    armed = false;
    const overlay = document.getElementById('overlay');
    if (overlay.querySelector('.modal-backdrop')) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return;
    }
    const host = document.getElementById('screen').lastElementChild;
    const back = host?.querySelector('[data-back]');
    if (back) back.click();
  });
}
