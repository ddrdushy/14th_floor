// Leaderboard: the duty roster at Bukit Aman. One tab per case plus an overall board.
// Per case: correct verdict first, then total puzzle time, then magnifiers used.
// Data comes from /api/leaderboard through core/telemetry.js; without a backend it says so and stays calm.
import { h } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { state } from '../core/state.js';
import { openSettings } from '../core/settings.js';
import { CASES, CASE_ORDER, caseLabel } from '../data/cases.js';
import { fetchLeaderboard, sharing, showingName } from '../core/telemetry.js';
import { sfx } from '../core/audio.js';
import { app } from '../core/app.js';

const TAB_KEY = 'floor14.lb.tab';

/** 75 -> "1:15", 4520 -> "1h 15m" */
export function fmtDuration(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s < 3600) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const hh = Math.floor(s / 3600);
  return `${hh}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
}

const sr = (text) => h('span', { class: 'sr-only' }, text);

export function mount(host, params = {}) {
  // the roster covers the whole screen, so the 3D office can rest
  app.scene.setMode('hidden');
  const tabs = ['overall', ...CASE_ORDER.filter((id) => CASES[id])];
  const label = (id) => (id === 'overall' ? 'Overall' : caseLabel(CASES[id]));
  let saved = null;
  try { saved = sessionStorage.getItem(TAB_KEY); } catch { /* ignore */ }
  let active = tabs.includes(params.caseId) ? params.caseId : tabs.includes(saved) ? saved : 'overall';
  let destroyed = false;
  let req = 0;

  const back = () => {
    if (params.back === 'closed' && params.caseId) go('closed', { caseId: params.caseId });
    else if (params.back === 'title' || !state().profile) go('title');
    else go('office');
  };

  const tabButtons = tabs.map((id) => h('button', {
    class: 'lb-tab', role: 'tab', id: `lb-tab-${id}`, 'aria-controls': 'lb-panel', type: 'button',
    onclick: () => select(id),
  }, label(id)));
  const tablist = h('div', { class: 'lb-tabs', role: 'tablist', 'aria-label': 'Leaderboards' }, tabButtons);
  tablist.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = tabs.indexOf(active);
    const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    select(tabs[n]);
    tabButtons[n].focus();
  });

  const heading = h('h1', { class: 'lb-title' });
  const rule = h('p', { class: 'lb-rule' });
  const body = h('div', { class: 'lb-body', 'aria-live': 'polite' });
  const you = h('div', { class: 'lb-you' });
  const panel = h('article', { class: 'lb-file', id: 'lb-panel', role: 'tabpanel' },
    h('div', { class: 'lb-file-head' }, heading, h('span', { class: 'lb-stamp', 'aria-hidden': 'true' }, 'Roster')), rule, body, you);

  const root = h('section', { class: 'screen lb-screen' },
    h('header', { class: 'topbar' },
      backButton(params.back === 'closed' ? 'Case file' : state().profile && params.back !== 'title' ? 'Office' : 'Title', back, 'Back'),
      h('div', { class: 'topbar-title' }, h('strong', {}, 'Leaderboard'), h('span', {}, 'Fastest correct closures in KL'))),
    h('div', { class: 'scroll lb-scroll' }, h('div', { class: 'lb-wrap' }, tablist, panel)));
  host.append(root);

  function select(id) {
    if (!tabs.includes(id)) return;
    if (id !== active) sfx.click?.();
    active = id;
    try { sessionStorage.setItem(TAB_KEY, id); } catch { /* ignore */ }
    tabButtons.forEach((b, i) => {
      const on = tabs[i] === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `lb-tab-${id}`);
    load();
  }

  async function load() {
    const my = ++req;
    const id = active;
    heading.textContent = id === 'overall' ? 'Every case' : `${label(id)}: ${CASES[id].title}`;
    rule.textContent = id === 'overall'
      ? 'Ranked by cases closed correctly, then cases closed, then total puzzle time, then magnifiers.'
      : 'Ranked by a correct verdict first, then total puzzle time, then magnifiers used.';
    body.replaceChildren(h('p', { class: 'lb-state' }, 'Pulling the roster from Bukit Aman…'));
    you.replaceChildren();
    const data = await fetchLeaderboard(id);
    if (destroyed || my !== req) return;
    if (!data.ok) {
      body.replaceChildren(h('div', { class: 'lb-state lb-state--off' },
        h('strong', {}, data.reason === 'offline' ? 'The roster is out of reach.' : 'The line to Bukit Aman went dead.'),
        h('p', {}, data.reason === 'offline'
          ? 'The leaderboard needs the game server, and this copy of the game has none. Your progress is safe on this device.'
          : 'Try again in a moment. Your progress is safe on this device.'),
        h('button', { class: 'btn btn--paper btn--small', type: 'button', onclick: load }, 'Try again')));
      return;
    }
    body.replaceChildren(data.rows.length ? table(id, data.rows) : h('div', { class: 'lb-state' },
      h('strong', {}, 'No names on this roster yet.'),
      h('p', {}, id === 'overall' ? 'Close a case and show your name to be the first.' : 'Close this case and show your name to be the first.')));
    you.replaceChildren(...youLine(id, data));
  }

  function table(id, rows) {
    const overall = id === 'overall';
    return h('table', { class: `lb-table${overall ? ' lb-table--overall' : ''}` },
      h('caption', { class: 'sr-only' }, `${label(id)} leaderboard, top ${rows.length}`),
      h('thead', {}, h('tr', {},
        h('th', { scope: 'col', class: 'lb-rank' }, h('span', { 'aria-hidden': 'true' }, '#'), sr('Rank')),
        h('th', { scope: 'col', class: 'lb-name' }, 'Detective'),
        h('th', { scope: 'col', class: 'lb-ok' }, overall ? 'Right' : 'Verdict'),
        h('th', { scope: 'col', class: 'lb-num' }, 'Time'),
        h('th', { scope: 'col', class: 'lb-num lb-hints' }, h('span', { 'aria-hidden': 'true' }, 'Hints'), sr('Magnifiers used')))),
      h('tbody', {}, rows.map((r) => h('tr', { class: `${r.you ? 'is-you' : ''}${r.rank <= 3 ? ` is-top is-top${r.rank}` : ''}` },
        h('td', { class: 'lb-rank' }, h('span', { class: 'lb-rank-n' }, String(r.rank))),
        h('th', { scope: 'row', class: 'lb-name' }, h('div', { class: 'lb-name-in' }, h('span', { class: 'lb-name-text' }, r.name), r.you ? h('span', { class: 'lb-you-tag' }, 'You') : null)),
        h('td', { class: 'lb-ok' }, overall
          ? h('span', { class: 'lb-count', title: `${r.correct} of ${r.closed} closed correctly` }, h('b', {}, String(r.correct)), `/${r.closed}`)
          : r.correct
            ? h('span', { class: 'lb-mark is-right', title: 'Correct verdict' }, h('span', { 'aria-hidden': 'true' }, '✓'), sr('Correct'))
            : h('span', { class: 'lb-mark is-wrong', title: 'Wrong verdict' }, h('span', { 'aria-hidden': 'true' }, '✗'), sr('Wrong'))),
        h('td', { class: 'lb-num' }, fmtDuration(r.time)),
        h('td', { class: 'lb-num lb-hints' }, String(r.hints))))));
  }

  function youLine(id, data) {
    const settingsBtn = (text) => h('button', { class: 'lb-link', type: 'button', onclick: async () => { await openSettings(); if (!destroyed) load(); } }, text);
    if (!sharing()) return [h('p', {}, 'You are not sharing progress, so you are not on the roster. ', settingsBtn('Change in Settings'))];
    const y = data.you;
    const of = data.total ? ` of ${data.total}` : '';
    if (!y || !y.closed) {
      if (y?.dev) return [h('p', {}, 'Cases played with dev tools are not ranked.')];
      return [h('p', {}, id === 'overall' ? 'Close a case to get on the roster.' : 'Close this case to get on the roster.')];
    }
    if (!y.eligible) return [h('p', {}, y.dev ? 'Cases played with dev tools are not ranked.' : 'This file was closed too quickly to be ranked.')];
    if (!y.shown || !showingName()) {
      return [h('p', {}, h('strong', {}, `You would be #${y.rank}${of}. `), 'Your name is hidden. ', settingsBtn('Show it in Settings'))];
    }
    if (!data.rows.some((r) => r.you)) return [h('p', {}, h('strong', {}, `You are #${y.rank}${of}.`), ` ${fmtDuration(y.time)}, ${y.hints} ${y.hints === 1 ? 'magnifier' : 'magnifiers'}.`)];
    return [h('p', {}, h('strong', {}, `You are #${y.rank}${of}.`))];
  }

  select(active);
  return { destroy: () => { destroyed = true; } };
}
