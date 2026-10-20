// Puzzle lab: try any mini game on its own. Open with ?screen=lab&game=<id> (needs a saved profile).
import { h, toast } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { GAMES, CATEGORY_OF } from '../games/registry.js';
import { rngFor } from '../core/rng.js';
import { app } from '../core/app.js';
import { CASES } from '../data/cases.js';
import { resolveHowTo, showGameHowTo, closeHowTo, howToButton, goalLine } from '../core/howto.js';

/** Games without a `demo` export borrow the params of the first case level that uses them. */
function levelFor(gameId) {
  for (const c of Object.values(CASES)) {
    const l = (c.levels || []).find((x) => x.game === gameId);
    if (l) return l;
  }
  return null;
}

export async function mount(host, params = {}) {
  app.scene.setMode('dim');
  const q = new URLSearchParams(location.search);
  const gameId = params.game || q.get('game');
  const valid = !!(gameId && GAMES[gameId]);
  const list = h('nav', { class: 'chips lab-chips', 'aria-label': 'Mini games', style: { padding: '12px 16px' } },
    Object.keys(GAMES).map((id) => h('button', { class: 'chip', 'aria-pressed': String(id === gameId), onclick: () => go('lab', { game: id }) }, id)));
  const sheet = h('div', { class: 'game-sheet' });
  const status = h('p', { class: 'doc', style: { color: 'var(--mist)', padding: '0 16px' } });
  const gameCol = h('div', { class: 'game-col', style: { overflow: 'visible' } }, sheet);
  let openHowTo = () => {};
  const top = h('header', { class: 'topbar' },
    backButton('Office', () => go('office')),
    h('div', { class: 'topbar-title' }, h('strong', {}, 'Puzzle lab'), h('span', {}, gameId ? `${gameId}, ${CATEGORY_OF[gameId] || ''}` : 'Pick a game')),
    valid ? howToButton(() => openHowTo()) : null,
    gameId ? h('button', { class: 'btn btn--small', onclick: () => game?.devSolve?.() }, 'Solve (dev)') : null,
    gameId ? h('button', { class: 'btn btn--small', onclick: () => { const m = game?.hint?.(); toast(m || 'No hint.'); } }, 'Hint') : null);
  host.append(h('section', { class: 'screen scroll' }, top, list, status, gameCol));
  let game = null;
  if (!valid) return {};
  const mod = await GAMES[gameId]();
  const level = mod.demo ? null : levelFor(gameId);
  const demo = mod.demo || (level ? { params: level.params, variant: level.variant } : {});
  const ht = resolveHowTo(mod, { params: demo.params || {}, variant: demo.variant });
  sheet.append(h('h2', {}, mod.meta?.name || gameId));
  if (ht) { sheet.classList.add('has-howto'); sheet.append(goalLine(ht, () => openHowTo())); }
  const el = h('div', {});
  sheet.append(el);
  openHowTo = () => showGameHowTo({
    name: mod.meta?.name || gameId, ht, anchor: { topbar: top, panel: gameCol },
    fallbackText: el.querySelector('.game-rules')?.textContent || `${CATEGORY_OF[gameId] || 'Mini'} puzzle.`,
  });
  game = mod.mount(el, {
    params: demo.params || {},
    variant: demo.variant,
    rng: rngFor('lab', gameId, String(Date.now())),
    saved: null,
    onProgress: (p) => { status.textContent = `Progress ${Math.round(p * 100)}%`; },
    onSave: () => {},
    onSolved: () => { status.textContent = 'Solved.'; toast('Solved.'); },
  }) || {};
  return { destroy: () => { closeHowTo(); game?.destroy?.(); } };
}
