// Floor 14 admin dashboard (admin.html). Password prompt, then /api/admin/* with a Bearer token kept in
// sessionStorage. Views:
//   Overview  KPIs (online now, today, 7 / 30 days), engagement (daily active players, play time per
//             day, retention, sessions), cloud saves, new players, players by stage, per-case
//             completion, countries and platforms                       GET /api/admin/summary
//   Cases     one case in depth (./cases-tab.js)                         GET /api/admin/cases
//   Players   search, sort, filters, CSV export; one player's file with play time, per-puzzle times,
//             AI transcript and timeline                                 GET /api/admin/players, /player/:id
//   AI        the AI games' log, latency, outcomes and a model test bench (./ai-tab.js)
//   Voices    src/admin/voices.js, when it exists (import.meta.glob), mounted into #voices
import '@fontsource/big-shoulders-display/800';
import '@fontsource/archivo/400';
import '@fontsource/archivo/600';
import '@fontsource/archivo/700';
import './admin.css';
import {
  h, CASES, CASE_ORDER, fmtN, shortTime, fmt1, pct, fmtDuration, dateTime, ago, tzMinutes, lastDays, cname, caseTitle, caseIds,
  levelName, stageLabel, verdictText, okPill, pill, kpi, barCell, table, empty, loading, sectionHead, select, downloadCsv,
} from './util.js';
import { lineChart, barChart } from './charts.js';
import { renderCasesTab } from './cases-tab.js';
import { renderAiTab, renderTranscript } from './ai-tab.js';

export { h, fmtDuration };

const TOKEN_KEY = 'floor14.admin.token';
const DEV_KEY = 'floor14.admin.dev';
const THEME_KEY = 'floor14.admin.theme';
const root = document.getElementById('admin');

const store = {
  get(k, s = sessionStorage) { try { return s.getItem(k); } catch { return null; } },
  set(k, v, s = sessionStorage) { try { if (v == null) s.removeItem(k); else s.setItem(k, v); } catch { /* ignore */ } },
};

// ---------- API ----------
class ApiError extends Error {
  constructor(status, code, data) { super(code); this.status = status; this.code = code; this.data = data; }
}
let token = store.get(TOKEN_KEY);

/** fetch /api<path> as the admin. Resolves with the JSON body; rejects with ApiError. */
export async function api(path, opts = {}) {
  let res;
  try {
    res = await fetch(`./api${path}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      ...opts,
      headers: { ...(opts.body && typeof opts.body === 'string' ? { 'content-type': 'application/json' } : {}), ...(opts.headers || {}), authorization: `Bearer ${token || ''}` },
    });
  } catch {
    throw new ApiError(0, 'network');
  }
  let data = null;
  try { data = await res.json(); } catch { /* not JSON: no backend here */ }
  if (res.status === 401 && !opts.noSignOut) {
    signOut('Signed out. Enter the password again.');
    throw new ApiError(401, 'unauthorized', data);
  }
  if (!res.ok || !data) throw new ApiError(res.status, data?.error || (res.ok ? 'no_backend' : `http_${res.status}`), data);
  return data;
}

function explain(err) {
  if (!(err instanceof ApiError)) return 'Something went wrong.';
  if (err.status === 0) return 'Could not reach the server.';
  if (err.code === 'not_configured') return err.data?.message === 'ADMIN_PASSWORD is not set'
    ? 'The server has no ADMIN_PASSWORD secret yet. Add it in Cloudflare Pages, then redeploy.'
    : 'No D1 database is bound as DB yet. Bind one in Cloudflare Pages, then redeploy.';
  if (err.code === 'no_key') return 'The server has no AI_API_KEY secret, so it cannot reach a model.';
  if (err.code === 'no_backend' || err.status === 404 || err.status === 405) return 'There is no backend here (static preview). Use the deployed site or wrangler pages dev.';
  if (err.status === 401) return 'Wrong password.';
  if (err.status === 429) return 'Too many tries. Wait a few minutes.';
  return `The server answered ${err.status} (${err.code}).`;
}

// ---------- theme ----------
function applyTheme(t) {
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
applyTheme(store.get(THEME_KEY, localStorage));

// ---------- login ----------
function showLogin(message = '') {
  cleanup();
  const input = h('input', { class: 'a-input', type: 'password', id: 'pw', autocomplete: 'current-password', required: true });
  const err = h('p', { class: 'err', role: 'alert' }, message);
  const btn = h('button', { class: 'a-btn a-btn--primary', type: 'submit' }, 'Sign in');
  const form = h('form', { 'aria-labelledby': 'login-title' },
    h('h1', { id: 'login-title' }, 'Floor 14 admin'),
    h('p', {}, 'Players, progress and the leaderboard.'),
    h('label', { for: 'pw' }, 'Admin password'),
    input, btn, err);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    err.textContent = '';
    token = input.value.trim();
    try {
      await api(`/admin/summary?tz=${tzMinutes()}`, { noSignOut: true });
      store.set(TOKEN_KEY, token);
      showApp();
    } catch (ex) {
      token = null;
      err.textContent = explain(ex);
      btn.disabled = false;
      input.select();
    }
  });
  root.replaceChildren(h('div', { class: 'adm-login' }, form));
  input.focus();
}

function signOut(message) {
  token = null;
  store.set(TOKEN_KEY, null);
  showLogin(message);
}

// ---------- app shell ----------
let cleanups = [];
function cleanup() {
  cleanups.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
  cleanups = [];
  Object.values(tabHandles).forEach((t) => t?.destroy?.());
  tabHandles = {};
}
let tabHandles = {};
const ui = {};
let withDev = store.get(DEV_KEY, localStorage) === '1';
const TABS = [['overview', 'Overview'], ['cases', 'Cases'], ['players', 'Players'], ['ai', 'AI'], ['voices', 'Voices']];
const ctx = { api, explain, stamp: () => stamp(), withDev: () => withDev };

function showApp() {
  cleanup();
  const navLinks = TABS.map(([id, label]) => h('a', { href: `#${id}`, 'data-view': id }, label));
  const dev = h('input', { type: 'checkbox', checked: withDev });
  dev.addEventListener('change', () => { withDev = dev.checked; store.set(DEV_KEY, withDev ? '1' : null, localStorage); refresh(); });
  ui.status = h('span', { class: 'adm-status', 'aria-live': 'polite' });
  const themeBtn = h('button', { class: 'a-btn a-btn--ghost', type: 'button', title: 'Switch light or dark', 'aria-label': 'Switch light or dark' }, 'Theme');
  themeBtn.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    store.set(THEME_KEY, next, localStorage);
    applyTheme(next);
  });
  const top = h('header', { class: 'adm-top' }, h('div', { class: 'adm-top-in' },
    h('div', { class: 'adm-brand' }, h('strong', {}, 'Floor ', h('i', {}, '14')), h('span', {}, 'Case office')),
    h('nav', { class: 'adm-nav', 'aria-label': 'Admin' }, navLinks),
    h('div', { class: 'adm-tools' },
      ui.status,
      h('label', { class: 'a-check', title: 'Players who opened the game with ?dev' }, dev, 'Include dev sessions'),
      h('button', { class: 'a-btn', type: 'button', onclick: () => refresh() }, 'Refresh'),
      themeBtn,
      h('button', { class: 'a-btn a-btn--ghost', type: 'button', onclick: () => signOut('Signed out.') }, 'Sign out'))));
  for (const [id, label] of TABS) ui[id] = h('section', { id: id === 'voices' ? 'voices' : `view-${id}`, 'aria-label': label, hidden: true });
  ui.nav = navLinks;
  root.replaceChildren(top, h('main', { class: 'adm-main' }, TABS.map(([id]) => ui[id])));
  window.addEventListener('hashchange', route);
  cleanups.push(() => window.removeEventListener('hashchange', route));
  for (const k of Object.keys(loaded)) loaded[k] = null;
  route();
}

const loaded = { overview: null, cases: null, players: null, ai: null, voices: null };
function route() {
  const hash = location.hash.replace(/^#/, '') || 'overview';
  const [view, rawArg] = hash.split('/');
  const arg = rawArg ? decodeURIComponent(rawArg) : '';
  const name = ['overview', 'cases', 'players', 'player', 'ai', 'voices'].includes(view) ? view : 'overview';
  const tab = name === 'player' ? 'players' : name;
  for (const [id] of TABS) ui[id].hidden = tab !== id;
  ui.nav.forEach((a) => (a.dataset.view === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  if (tab === 'overview' && !loaded.overview) loadOverview();
  if (tab === 'cases') showCases(arg);
  if (name === 'players') showPlayers();
  if (name === 'player' && arg) showPlayer(arg);
  if (tab === 'ai' && !loaded.ai) showAi();
  if (tab === 'voices' && !loaded.voices) loadVoices();
}

function refresh() {
  loaded.overview = null;
  loaded.players = null;
  loaded.cases = null;
  loaded.ai = null;
  route();
}

function stamp() {
  ui.status.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function swapHandle(key, handle) {
  tabHandles[key]?.destroy?.();
  tabHandles[key] = handle;
}

// ---------- cases / AI tabs ----------
let lastCase = null;
function showCases(arg) {
  const id = arg || lastCase || caseIds()[0];
  if (loaded.cases === id) return;
  loaded.cases = id;
  lastCase = id;
  swapHandle('cases', renderCasesTab(ui.cases, { ...ctx, caseId: id, onPick: (c) => { location.hash = `#cases/${c}`; } }));
}

function showAi() {
  loaded.ai = 'yes';
  swapHandle('ai', renderAiTab(ui.ai, ctx));
}

// ---------- overview ----------
let charts = [];
async function loadOverview() {
  loaded.overview = 'yes';
  ui.overview.replaceChildren(loading('Loading the numbers…'));
  try {
    const data = await api(`/admin/summary?tz=${tzMinutes()}${withDev ? '&dev=1' : ''}`);
    renderOverview(data);
    stamp();
  } catch (err) {
    loaded.overview = null;
    if (err.status !== 401) ui.overview.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, explain(err)));
  }
}

function stat(label, value, note, share) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat-v' }, value),
    h('div', { class: 'stat-l' }, label),
    share != null ? h('div', { class: 'meter', role: 'presentation' }, h('i', { style: { width: `${Math.round(Math.max(0, Math.min(1, share)) * 100)}%` } })) : null,
    note ? h('div', { class: 'stat-n' }, note) : null);
}

function renderOverview(d) {
  charts.forEach((c) => c.destroy());
  charts = [];
  const t = d.totals;
  const kpis = h('div', { class: 'kpis' },
    kpi('Players', fmtN(t.players), withDev ? `including ${fmtN(t.dev)} dev` : t.dev ? `${fmtN(t.dev)} dev ${t.dev === 1 ? 'player' : 'players'} not counted` : 'everyone who opened the game', { accent: true }),
    kpi('Online now', fmtN(t.onlineNow), 'sent progress or asked an AI suspect in the last 5 min', { live: t.onlineNow > 0 }),
    kpi('Active today', fmtN(t.activeToday), `${fmtN(t.newToday)} new since midnight`),
    kpi('Active, 7 days', fmtN(t.active7d), `${pct(t.active7d, t.players)} of players`),
    kpi('Active, 30 days', fmtN(t.active30d), `${pct(t.active30d, t.players)} of players`),
    kpi('Cases closed', fmtN(t.casesClosed), t.casesClosed ? `${pct(t.casesCorrect, t.casesClosed)} with the right verdict` : 'none yet'),
    kpi('AI calls, 24 hours', fmtN(t.ai24h), t.ai24h ? `${fmtN(t.aiErrors24h)} errors · ${fmtN(t.aiBlocked24h)} blocked` : 'none today'),
    kpi('On the leaderboard', fmtN(t.onBoard), 'chose to show their name'));

  const days = lastDays(d.generatedAt, d.tz, 30);
  const series = (rows, fn) => {
    const m = new Map(rows.map((r) => [r.day, r]));
    return days.map((x) => ({ label: x.label, short: x.short, value: m.has(x.iso) ? fn(m.get(x.iso)) : 0 }));
  };

  // engagement
  const dau = series(d.activity, (r) => r.players);
  const sessions30 = d.activity.reduce((s, r) => s + r.sessions, 0);
  const dauBox = h('div');
  const dauAvg = dau.reduce((s, x) => s + x.value, 0) / dau.length;
  const dauCard = h('div', { class: 'card' },
    h('h3', {}, 'Daily active players'),
    h('p', { class: 'sub' }, `Players who sent anything that day · ${fmt1(dauAvg)} a day on average · ${fmtN(sessions30)} sessions in 30 days`),
    dauBox);
  const play = series(d.playtime, (r) => (r.players ? r.seconds / r.players / 60 : 0));
  const playSec = d.playtime.reduce((s, r) => s + r.seconds, 0);
  const playerDays = d.playtime.reduce((s, r) => s + r.players, 0);
  const playBox = h('div');
  const playCard = h('div', { class: 'card' },
    h('h3', {}, 'Play time per player per day'),
    h('p', { class: 'sub' }, playerDays ? `Minutes of puzzle time solved that day, averaged over the players who played · ${fmtDuration(playSec / playerDays)} on an average playing day` : 'No puzzle solved in the last 30 days.'),
    playBox);

  const r = d.retention;
  const s = d.sessions;
  const retCard = h('div', { class: 'card' },
    h('h3', {}, 'Retention and sessions'),
    h('p', { class: 'sub' }, 'Came back: seen again at least that long after their first visit, out of the players old enough to have done it'),
    h('div', { class: 'stats' },
      stat('came back 1+ day later', pct(r.back1, r.eligible1), `${fmtN(r.back1)} of ${fmtN(r.eligible1)} players`, r.eligible1 ? r.back1 / r.eligible1 : 0),
      stat('came back 7+ days later', pct(r.back7, r.eligible7), `${fmtN(r.back7)} of ${fmtN(r.eligible7)} players`, r.eligible7 ? r.back7 / r.eligible7 : 0),
      stat('sessions per player', s.players ? fmt1(s.total / s.players) : '–', `median ${s.median == null ? '–' : fmt1(s.median)} · ${fmtN(s.total)} sessions`),
      stat('played more than once', pct(s.returning, s.players), `${fmtN(s.returning)} of ${fmtN(s.players)} players`, s.players ? s.returning / s.players : 0)));

  const sv = d.saves;
  const saveCard = h('div', { class: 'card' },
    h('h3', {}, 'Online case files'),
    h('p', { class: 'sub' }, 'Cloud saves players can load on another device with their detective name and PIN'),
    sv.total ? h('div', { class: 'stats' },
      stat('case files', fmtN(sv.total), `${fmtN(sv.updated7d)} saved in the last 7 days`),
      stat('with a PIN', fmtN(sv.withPin), pct(sv.withPin, sv.total), sv.withPin / sv.total),
      stat('without a PIN', fmtN(sv.withoutPin), 'cannot be loaded elsewhere yet', sv.withoutPin / sv.total),
      stat('locked right now', fmtN(sv.locked), sv.failing ? `${fmtN(sv.failing)} more with wrong tries` : 'after 5 wrong PINs')) : empty('No online case files yet.'),
    sv.lockedList.length ? h('ul', { class: 'locked-list' }, sv.lockedList.map((x) => h('li', {},
      h('a', { href: `#player/${x.player_id}`, class: 'plink' }, x.name),
      h('span', { class: 'muted' }, ` · ${x.pin_fails} wrong tries · unlocks ${new Date(x.locked_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)))) : null);

  // new players per day
  const newDays = series(d.newPerDay, (x) => x.n);
  const newTotal = newDays.reduce((a, x) => a + x.value, 0);
  const lineBox = h('div');
  const newCard = h('div', { class: 'card' },
    h('h3', {}, 'New players per day'),
    h('p', { class: 'sub' }, `${fmtN(newTotal)} in the last 30 days, by your local date`),
    lineBox);

  // players by where they are now
  const stageRows = d.stages.filter((x) => x.n > 0);
  const ordered = [...stageRows.filter((x) => !x.case_id), ...stageRows.filter((x) => x.case_id)];
  const barBox = h('div');
  const stageCard = h('div', { class: 'card' },
    h('h3', {}, 'Players by current stage'),
    h('p', { class: 'sub' }, 'Each player counted once, at the furthest case they have opened'),
    ordered.length ? barBox : empty('No players yet.'));

  // per-case completion
  const byCase = new Map(d.cases.map((c) => [c.case_id, c]));
  const ids = caseIds(d.cases.map((c) => c.case_id));
  const maxOpen = Math.max(1, ...d.cases.map((c) => c.opened));
  const caseRows = ids.map((id) => {
    const c = byCase.get(id) || { opened: 0, closed: 0, correct: 0 };
    const go = () => { location.hash = `#cases/${id}`; };
    return h('tr', { class: 'is-click', tabindex: 0, onclick: go, onkeydown: (e) => { if (e.key === 'Enter') go(); } },
      h('th', { scope: 'row' }, cname(id), h('span', { class: 'phase' }, CASES[id]?.title || '')),
      h('td', {}, barCell(c.opened, maxOpen)),
      h('td', {}, barCell(c.closed, c.opened || 1, `${fmtN(c.closed)} · ${pct(c.closed, c.opened)}`)),
      h('td', { class: 'r' }, c.closed ? pct(c.correct, c.closed) : '–'),
      h('td', { class: 'r' }, c.closed ? fmtDuration(c.medTime) : '–'),
      h('td', { class: 'r' }, c.closed ? fmt1(c.medHints) : '–'),
      h('td', { class: 'r hide-sm' }, c.closed ? fmtDuration(c.avgTime) : '–'));
  });
  const caseCard = h('div', { class: 'card' },
    h('h3', {}, 'Completion by case'),
    h('p', { class: 'sub' }, 'Times and hints are for closed files. Select a case for its puzzle-by-puzzle funnel.'),
    table('Completion by case', [{ label: 'Case' }, { label: 'Opened' }, { label: 'Closed' }, { label: 'Correct', cls: 'r' },
      { label: 'Median time', cls: 'r' }, { label: 'Median hints', cls: 'r' }, { label: 'Avg time', cls: 'r hide-sm' }], caseRows));

  const geo = h('div', { class: 'grid-2' },
    listCard('Countries', 'Country', 'From Cloudflare, by player', d.countries, (k) => (k === '??' ? 'Unknown' : k)),
    listCard('Platforms', 'Platform', 'Operating system / device form', d.platforms, (k) => k));

  ui.overview.replaceChildren(
    sectionHead('Overview', `Generated ${dateTime(d.generatedAt)}`),
    kpis,
    sectionHead('Engagement', 'How often players come back and how long they play'),
    h('div', { class: 'grid-2' }, dauCard, playCard, retCard, saveCard),
    sectionHead('Cases', 'Opened, closed and judged, in play order'),
    caseCard,
    sectionHead('Growth and progress'),
    h('div', { class: 'grid-2' }, newCard, stageCard),
    sectionHead('Audience'),
    geo);

  charts.push(lineChart(dauBox, dau, { title: 'Daily active players, last 30 days', valueLabel: (v) => `${fmtN(v)} ${v === 1 ? 'player' : 'players'}` }));
  charts.push(lineChart(playBox, play, { title: 'Minutes of puzzle time per playing player per day', valueLabel: (v) => (v ? `${fmtDuration(v * 60)} per player` : 'nobody played') }));
  charts.push(lineChart(lineBox, newDays, { title: 'New players per day, last 30 days', valueLabel: (v) => `${fmtN(v)} new ${v === 1 ? 'player' : 'players'}` }));
  if (ordered.length) {
    charts.push(barChart(barBox, ordered.map((x) => ({ label: stageLabel(x), value: x.n, note: x.case_id ? `${stageLabel(x)} · ${x.levels_solved} solved` : 'Profile made or title screen only' })), {
      title: 'Players by current stage', labelWidth: 300, valueLabel: (v) => fmtN(v),
    }));
  }
}

function listCard(title, col, sub, rows, fmtKey) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  const total = rows.reduce((s, r) => s + r.n, 0);
  return h('div', { class: 'card' },
    h('h3', {}, title), h('p', { class: 'sub' }, sub),
    rows.length ? table(title, [{ label: col }, { label: 'Players' }, { label: 'Share', cls: 'r' }], rows.map((r) => h('tr', {},
      h('th', { scope: 'row' }, fmtKey(r.k)),
      h('td', {}, barCell(r.n, max)),
      h('td', { class: 'r' }, pct(r.n, total))))) : empty('No data yet.'));
}

// ---------- players ----------
const playersState = { q: '', sort: 'last_seen', country: '', platform: '', cloud: '', dev: '', offset: 0, limit: 50 };
let facets = null;
const SORT_OPTIONS = [['last_seen', 'Last seen'], ['first_seen', 'Newest players'], ['solved', 'Most puzzles solved'], ['furthest', 'Furthest case'],
  ['closed', 'Most cases closed'], ['playtime', 'Most play time'], ['sessions', 'Most sessions']];

function playersQuery(extra = {}) {
  const st = { ...playersState, ...extra };
  const q = new URLSearchParams({ limit: st.limit, offset: st.offset, sort: st.sort });
  for (const k of ['q', 'country', 'platform', 'cloud', 'dev']) if (st[k]) q.set(k, st[k]);
  return q;
}

function showPlayers() {
  if (loaded.players === 'list' && ui.players.querySelector('.players-list')) return;
  loaded.players = 'list';
  const search = h('input', { class: 'a-input', type: 'search', placeholder: 'Search a name, id prefix or country code', 'aria-label': 'Search players', value: playersState.q });
  const count = h('span', { class: 'muted' });
  const body = h('div', { class: 'players-body' }, loading('Loading players…'));
  let timer = 0;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { playersState.q = search.value.trim(); playersState.offset = 0; load(); }, 300);
  });
  const set = (k) => (v) => { playersState[k] = v; playersState.offset = 0; load(); };
  const filters = h('div', { class: 'toolbar toolbar--filters' });
  const drawFilters = () => {
    const c = facets?.countries || [];
    const p = facets?.platforms || [];
    filters.replaceChildren(
      select('Sort by', SORT_OPTIONS, playersState.sort, set('sort'), { visibleLabel: true }),
      select('Country', [['', 'Any country'], ...c.map((x) => [x.k, `${x.k === '??' ? 'Unknown' : x.k} (${x.n})`])], playersState.country, set('country'), { visibleLabel: true }),
      select('Platform', [['', 'Any platform'], ...p.map((x) => [x.k, `${x.k} (${x.n})`])], playersState.platform, set('platform'), { visibleLabel: true }),
      select('Cloud save', [['', 'Any'], ['1', 'Has a case file'], ['0', 'No case file']], playersState.cloud, set('cloud'), { visibleLabel: true }),
      select('Dev', [['', 'All players'], ['0', 'Real players only'], ['1', 'Dev players only']], playersState.dev, set('dev'), { visibleLabel: true }),
      exportBtn);
  };
  const exportBtn = h('button', { class: 'a-btn', type: 'button' }, 'Export CSV');
  exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    const label = exportBtn.textContent;
    try {
      const all = [];
      for (let offset = 0, total = Infinity; offset < total && offset < 20000; offset += 200) {
        exportBtn.textContent = `Exporting ${fmtN(offset)}…`;
        const d = await api(`/admin/players?${playersQuery({ offset, limit: 200 })}`);
        total = d.total;
        all.push(...d.players);
        if (!d.players.length) break;
      }
      const iso = (ts) => (ts ? new Date(ts).toISOString() : '');
      downloadCsv(`floor14-players-${new Date().toISOString().slice(0, 10)}.csv`,
        ['id', 'name', 'first_seen', 'last_seen', 'country', 'platform', 'sessions', 'furthest_stage', 'cases_closed', 'puzzles_solved', 'play_time_seconds', 'ai_calls', 'cloud_save', 'on_leaderboard', 'dev'],
        all.map((p) => [p.id, p.name || '', iso(p.created_at), iso(p.last_seen), p.country || '', p.platform || '', p.sessions, stageLabel(p), p.closed_cases, p.solves, p.play_time, p.ai_calls, p.cloud ? 1 : 0, p.shown ? 1 : 0, p.dev ? 1 : 0]));
      count.textContent = `Exported ${fmtN(all.length)} ${all.length === 1 ? 'player' : 'players'}`;
    } catch (err) {
      if (err.status !== 401) count.textContent = explain(err);
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = label;
    }
  });
  drawFilters();
  ui.players.replaceChildren(h('div', { class: 'players-list' },
    sectionHead('Players', 'Detective names as players typed them; "board" means the name is also on the public leaderboard, "cloud" that the game is saved online.'),
    h('div', { class: 'toolbar' }, search, count),
    filters,
    h('div', { class: 'card' }, body)));

  async function load() {
    body.replaceChildren(loading('Loading players…'));
    try {
      const q = playersQuery();
      if (!facets) q.set('facets', '1');
      const d = await api(`/admin/players?${q}`);
      stamp();
      if (d.facets) { facets = d.facets; drawFilters(); }
      count.textContent = `${fmtN(d.total)} ${d.total === 1 ? 'player' : 'players'}`;
      const filtered = playersState.q || playersState.country || playersState.platform || playersState.cloud || playersState.dev;
      if (!d.players.length) { body.replaceChildren(empty(filtered ? 'Nobody matches.' : 'No players yet.')); return; }
      const rows = d.players.map((p) => h('tr', { class: 'is-click', tabindex: 0, onclick: () => { location.hash = `#player/${p.id}`; }, onkeydown: (e) => { if (e.key === 'Enter') location.hash = `#player/${p.id}`; } },
        h('th', { scope: 'row' }, h('div', { class: 'who' }, h('b', {}, p.name || 'No name yet'), h('span', { class: 'mono' }, p.id.slice(0, 8)))),
        h('td', {}, stageLabel(p)),
        h('td', { class: 'r' }, fmtN(p.closed_cases)),
        h('td', { class: 'r' }, fmtN(p.solves)),
        h('td', { class: 'r' }, p.play_time ? fmtDuration(p.play_time) : '–'),
        h('td', { class: 'r hide-sm' }, fmtN(p.sessions)),
        h('td', {}, p.country || '–'),
        h('td', { class: 'hide-sm' }, p.platform || '–'),
        h('td', { class: 'hide-sm nowrap' }, shortTime(p.created_at)),
        h('td', { class: 'nowrap' }, ago(p.last_seen)),
        h('td', {}, h('span', { class: 'tags' }, p.dev ? pill('dev') : null, p.cloud ? pill('cloud') : null, p.shown ? pill('board', 'good') : null, p.ai_calls ? pill(`AI ${p.ai_calls}`) : null))));
      const prev = h('button', { class: 'a-btn', type: 'button', disabled: playersState.offset === 0, onclick: () => { playersState.offset = Math.max(0, playersState.offset - playersState.limit); load(); } }, '← Previous');
      const next = h('button', { class: 'a-btn', type: 'button', disabled: playersState.offset + d.players.length >= d.total, onclick: () => { playersState.offset += playersState.limit; load(); } }, 'Next →');
      body.replaceChildren(
        table('Players', [{ label: 'Detective' }, { label: 'Furthest stage' }, { label: 'Closed', cls: 'r' }, { label: 'Solved', cls: 'r' }, { label: 'Play time', cls: 'r' },
          { label: 'Sessions', cls: 'r hide-sm' }, { label: 'Country' }, { label: 'Platform', cls: 'hide-sm' }, { label: 'First seen', cls: 'hide-sm' }, { label: 'Last seen' }, { label: 'Tags', sr: true }], rows),
        h('div', { class: 'pager' }, h('span', {}, `${fmtN(playersState.offset + 1)}–${fmtN(playersState.offset + d.players.length)} of ${fmtN(d.total)}`), prev, next));
    } catch (err) {
      if (err.status !== 401) body.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, explain(err)));
    }
  }
  load();
}

async function showPlayer(id) {
  loaded.players = 'detail';
  const back = () => h('p', {}, h('a', { href: '#players', class: 'a-btn a-btn--ghost' }, '← All players'));
  ui.players.replaceChildren(loading('Loading the file…'));
  try {
    const d = await api(`/admin/player/${encodeURIComponent(id)}`);
    stamp();
    const p = d.player;
    const playTime = d.solves.reduce((s, x) => s + (x.time || 0), 0);
    const hints = d.solves.reduce((s, x) => s + (x.hints || 0), 0);
    const progress = [...d.progress].sort((a, b) => CASE_ORDER.indexOf(a.case_id) - CASE_ORDER.indexOf(b.case_id));
    const solvesBy = new Map();
    for (const x of d.solves) {
      if (!solvesBy.has(x.case_id)) solvesBy.set(x.case_id, []);
      solvesBy.get(x.case_id).push(x);
    }
    const cases = progress.map((r) => {
      const v = r.verdict ? verdictText(r.case_id, r.verdict.charged, r.verdict.answers) : null;
      const sl = (solvesBy.get(r.case_id) || []).slice().sort((a, b) => {
        const lv = CASES[r.case_id]?.levels || [];
        return lv.findIndex((l) => l.id === a.level_id) - lv.findIndex((l) => l.id === b.level_id) || a.at - b.at;
      });
      const slowest = sl.reduce((m, x) => (x.time > (m?.time || 0) ? x : m), null);
      return h('div', { class: 'card pd-case' },
        h('h3', {}, h('span', {}, cname(r.case_id)), r.closed_at ? okPill(!!r.correct) : pill('open')),
        h('p', {}, `${r.levels_solved} puzzles · ${fmtDuration(r.total_time)} puzzle time · ${r.hints_used} ${r.hints_used === 1 ? 'hint' : 'hints'}`),
        v ? h('p', {}, `Charged ${v.who}${v.extra ? ` · ${v.extra}` : ''}`) : null,
        h('p', { class: 'muted' }, `Opened ${dateTime(r.opened_at)}${r.closed_at ? ` · closed ${dateTime(r.closed_at)}` : ''}`),
        sl.length ? h('details', { class: 'pd-times' },
          h('summary', {}, `Puzzle times${slowest ? ` · slowest: ${levelName(r.case_id, slowest.level_id)}` : ''}`),
          table(`Puzzle times in ${caseTitle(r.case_id)}`, [{ label: 'Puzzle' }, { label: 'Time', cls: 'r' }, { label: 'Hints', cls: 'r' }],
            sl.map((x) => h('tr', { class: x === slowest ? 'is-hard' : null },
              h('th', { scope: 'row' }, levelName(r.case_id, x.level_id)),
              h('td', { class: 'r' }, fmtDuration(x.time)),
              h('td', { class: 'r' }, fmtN(x.hints)))))) : null);
    });
    const describe = (e) => {
      const x = e.data || {};
      switch (e.type) {
        case 'session_start': return `Opened the game${x.dev ? ' with dev tools' : ''}${x.lang ? ` · ${x.lang}` : ''}`;
        case 'case_open': return `Opened ${cname(e.case_id)}`;
        case 'level_solved': return `${cname(e.case_id)} · ${levelName(e.case_id, e.level_id)} · ${fmtDuration(x.time)}, ${x.hints || 0} ${x.hints === 1 ? 'hint' : 'hints'}`;
        case 'case_closed': {
          const v = verdictText(e.case_id, x.charged, x.answers);
          return `Closed ${cname(e.case_id)}: charged ${v.who}${v.extra ? ` · ${v.extra}` : ''}`;
        }
        case 'profile_set': return x.show ? `Shows the name "${x.name}" on the leaderboard` : 'Name hidden from the leaderboard';
        default: return e.type;
      }
    };
    const label = { session_start: 'Session', case_open: 'Case opened', level_solved: 'Puzzle solved', case_closed: 'Case closed', profile_set: 'Profile' };
    const ai = d.ai || [];
    const sessionDays = new Set(d.events.filter((e) => e.type === 'session_start').map((e) => new Date(e.at).toDateString())).size;
    ui.players.replaceChildren(
      back(),
      h('div', { class: 'card' },
        h('div', { class: 'pd-head' },
          h('div', {}, h('h2', {}, p.name || 'Anonymous detective'), h('p', { class: 'mono' }, p.id)),
          h('span', { class: 'tags' }, p.dev ? pill('dev tools used') : null, p.shown ? pill('on the leaderboard', 'good') : pill('name hidden'))),
        h('dl', { class: 'pd-facts' },
          h('div', {}, h('dt', {}, 'First seen'), h('dd', {}, dateTime(p.created_at))),
          h('div', {}, h('dt', {}, 'Last seen'), h('dd', {}, `${ago(p.last_seen)} (${dateTime(p.last_seen)})`)),
          h('div', {}, h('dt', {}, 'Sessions'), h('dd', {}, `${fmtN(p.sessions)}${sessionDays ? ` on ${fmtN(sessionDays)} ${sessionDays === 1 ? 'day' : 'days'}` : ''}`)),
          h('div', {}, h('dt', {}, 'Total play time'), h('dd', {}, playTime ? fmtDuration(playTime) : '–')),
          h('div', {}, h('dt', {}, 'Puzzles solved'), h('dd', {}, `${fmtN(d.solves.length)} · ${fmtN(hints)} ${hints === 1 ? 'hint' : 'hints'}`)),
          h('div', {}, h('dt', {}, 'AI calls'), h('dd', {}, fmtN(ai.length))),
          h('div', {}, h('dt', {}, 'Country'), h('dd', {}, p.country || '–')),
          h('div', {}, h('dt', {}, 'Platform'), h('dd', {}, p.platform || '–')))),
      caseFileCard(p, d.save),
      sectionHead('Cases', 'Puzzle time per case; open a case for each puzzle'),
      cases.length ? h('div', { class: 'pd-cases' }, cases) : h('p', { class: 'note' }, 'No case opened yet.'),
      sectionHead('AI interrogations', ai.length ? `${fmtN(ai.length)} calls, grouped by level, oldest first` : null),
      h('div', { class: 'card' }, renderTranscript(ai)),
      sectionHead('Timeline', d.events.length >= 300 ? 'Latest 300 events' : `${d.events.length} events, newest first`),
      h('div', { class: 'card' }, d.events.length ? h('ol', { class: 'timeline' }, d.events.map((e) => h('li', {},
        h('time', { datetime: new Date(e.at).toISOString() }, dateTime(e.at)),
        h('span', { class: `ev-type t-${e.type}` }, label[e.type] || e.type),
        h('span', { class: 'ev-what' }, describe(e))))) : empty('No events.')));
  } catch (err) {
    if (err.status !== 401) ui.players.replaceChildren(back(), h('div', { class: 'err-box', role: 'alert' }, err.status === 404 ? 'No player with that id.' : explain(err)));
  }
}

/** The player's online case file (cloud save): when it was saved, its PIN, and a way to set a new PIN. */
function caseFileCard(p, sv) {
  if (!sv) return h('div', { class: 'card pd-save' }, h('h3', {}, 'Online case file'), h('p', { class: 'muted' }, 'None yet. It appears once the player has a detective name and plays with "Share progress" on.'));
  const locked = sv.locked_until > Date.now();
  const input = h('input', { type: 'text', inputmode: 'numeric', maxlength: 4, pattern: '[0-9]{4}', placeholder: '4 digits', 'aria-label': 'New PIN', class: 'pd-pin-input' });
  const msg = h('p', { class: 'muted', role: 'status' });
  const btn = h('button', { class: 'a-btn', onclick: async () => {
    const pin = input.value.trim();
    if (!/^\d{4}$/.test(pin)) { msg.textContent = 'Type exactly 4 digits.'; return; }
    btn.disabled = true;
    try {
      await api('/admin/save-pin', { method: 'POST', body: JSON.stringify({ player_id: p.id, pin }) });
      msg.textContent = `PIN set. Tell ${sv.name} the new PIN: ${pin}.`;
      input.value = '';
    } catch (err) { msg.textContent = explain(err); } finally { btn.disabled = false; }
  } }, 'Set new PIN');
  return h('div', { class: 'card pd-save' },
    h('h3', {}, 'Online case file'),
    h('p', {}, `Saved as "${sv.name}" · ${ago(sv.updated_at)} · `, sv.has_pin ? (locked ? h('b', {}, 'PIN locked after wrong tries') : 'PIN set') : h('b', {}, 'no PIN yet (cannot be loaded on another device)'), sv.pin_fails && !locked ? ` · ${sv.pin_fails} wrong ${sv.pin_fails === 1 ? 'try' : 'tries'}` : ''),
    h('div', { class: 'pd-pin' }, input, btn),
    msg);
}

// ---------- voices (mounted from ./voices.js when that module exists) ----------
const voiceModules = import.meta.glob('./voices.js');
async function loadVoices() {
  loaded.voices = 'yes';
  const el = ui.voices;
  const loader = voiceModules['./voices.js'];
  if (!loader) {
    el.replaceChildren(
      sectionHead('Voices'),
      h('div', { class: 'note', 'data-placeholder': 'voices' }, 'Voices are not set up in this build yet. This tab loads src/admin/voices.js and calls its mountVoices(el, { api, h, token }) when it exists.'));
    return;
  }
  el.replaceChildren(loading('Loading voices…'));
  try {
    const mod = await loader();
    el.replaceChildren();
    if (typeof mod.mountVoices !== 'function') throw new Error('voices.js has no mountVoices export');
    const handle = await mod.mountVoices(el, { api, h, token: () => token });
    if (handle && typeof handle.destroy === 'function') cleanups.push(() => handle.destroy());
  } catch (err) {
    console.error(err);
    loaded.voices = null;
    el.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, 'The voices panel could not load.'));
  }
}

// ---------- start ----------
if (token) showApp();
else showLogin();
