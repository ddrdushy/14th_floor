// Puzzle lab: try any mini game on its own. Open with ?screen=lab&game=<id> (needs a saved profile).
import { h, toast } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { GAMES, CATEGORY_OF } from '../games/registry.js';
import { rngFor } from '../core/rng.js';
import { app } from '../core/app.js';

export async function mount(host, params = {}) {
  app.scene.setMode('dim');
  const q = new URLSearchParams(location.search);
  const gameId = params.game || q.get('game');
  const list = h('nav', { class: 'chips lab-chips', 'aria-label': 'Mini games', style: { padding: '12px 16px' } },
    Object.keys(GAMES).map((id) => h('button', { class: 'chip', 'aria-pressed': String(id === gameId), onclick: () => go('lab', { game: id }) }, id)));
  const sheet = h('div', { class: 'game-sheet' });
  const status = h('p', { class: 'doc', style: { color: 'var(--mist)', padding: '0 16px' } });
  host.append(h('section', { class: 'screen scroll' },
    h('header', { class: 'topbar' },
      backButton('Office', () => go('office')),
      h('div', { class: 'topbar-title' }, h('strong', {}, 'Puzzle lab'), h('span', {}, gameId ? `${gameId}, ${CATEGORY_OF[gameId] || ''}` : 'Pick a game')),
      gameId ? h('button', { class: 'btn btn--small', onclick: () => game?.devSolve?.() }, 'Solve (dev)') : null,
      gameId ? h('button', { class: 'btn btn--small', onclick: () => { const m = game?.hint?.(); toast(m || 'No hint.'); } }, 'Hint') : null),
    list, status,
    h('div', { class: 'game-col', style: { overflow: 'visible' } }, sheet)));
  let game = null;
  if (!gameId || !GAMES[gameId]) return {};
  const mod = await GAMES[gameId]();
  const demo = mod.demo || {};
  sheet.append(h('h2', {}, mod.meta?.name || gameId));
  const el = h('div', {});
  sheet.append(el);
  game = mod.mount(el, {
    params: demo.params || {},
    variant: demo.variant,
    rng: rngFor('lab', gameId, String(Date.now())),
    saved: null,
    onProgress: (p) => { status.textContent = `Progress ${Math.round(p * 100)}%`; },
    onSave: () => {},
    onSolved: () => { status.textContent = 'Solved.'; toast('Solved.'); },
  }) || {};
  return { destroy: () => game?.destroy?.() };
}
