// Floor 14 admin dashboard (admin.html). Password prompt, then /api/admin/* with a Bearer token kept in
// sessionStorage. Views: Overview (KPIs, new players, players by stage, per-case funnel and verdicts,
// countries and platforms), Players (search, list, one player's timeline) and Voices.
//
// Voices: another module, src/admin/voices.js, may export mountVoices(el, { api, h, token }).
// It is picked up automatically when the file exists (import.meta.glob) and mounted into #voices.
import '@fontsource/big-shoulders-display/800';
import '@fontsource/archivo/400';
import '@fontsource/archivo/600';
import '@fontsource/archivo/700';
import './admin.css';
import { CASES, CASE_ORDER, caseLabel } from '../data/cases.js';
import { lineChart, barChart } from './charts.js';

const TOKEN_KEY = 'floor14.admin.token';
const DEV_KEY = 'floor14.admin.dev';
const THEME_KEY = 'floor14.admin.theme';
const DAY = 86_400_000;
const root = document.getElementById('admin');

// ---------- tiny DOM helper (text is always set as text) ----------
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const store = {
  get(k, s = sessionStorage) { try { return s.getItem(k); } catch { return null; } },
  set(k, v, s = sessionStorage) { try { if (v == null) s.removeItem(k); else s.setItem(k, v); } catch { /* ignore */ } },
};

// ---------- formatting ----------
const nf = new Intl.NumberFormat();
const fmtN = (n) => nf.format(Math.round(Number(n) || 0));
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '–');
export function fmtDuration(sec) {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  if (s < 3600) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
}
const dateTime = (ts) => (ts ? new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '–');
function ago(ts) {
  if (!ts) return '–';
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return new Date(ts).toLocaleDateString();
}
const tzMinutes = () => -new Date().getTimezoneOffset();

// ---------- case helpers ----------
const cname = (id) => (CASES[id] ? caseLabel(CASES[id]) : id || '–');
const isBranch = (l) => typeof l.when === 'function';
const baseLevels = (c) => c.levels.filter((l) => !isBranch(l));
function levelName(caseId, levelId) {
  const c = CASES[caseId];
  const i = c ? c.levels.findIndex((l) => l.id === levelId) : -1;
  return i >= 0 ? `${i + 1}. ${c.levels[i].title}` : levelId || '';
}
function stageLabel(s) {
  if (!s.case_id) return 'Not started a case';
  const c = CASES[s.case_id];
  const cl = cname(s.case_id);
  if (s.closed || s.case_closed) return `${cl}: case closed`;
  if (!c) return `${cl}: ${s.levels_solved} solved`;
  const lv = baseLevels(c);
  const n = s.levels_solved || 0;
  if (n >= lv.length) return `${cl}: deduction room`;
  return `${cl} · ${n + 1}. ${lv[n].title}`;
}
function verdictText(caseId, charged = [], answers = {}) {
  const c = CASES[caseId];
  const names = charged.map((id) => c?.suspects.find((s) => s.id === id)?.name || id);
  const extra = (c?.deduction?.questions || []).map((q) => {
    const o = q.options.find((x) => x.id === answers[q.id]);
    return o ? `${q.short || q.q} ${o.label}` : null;
  }).filter(Boolean);
  const other = Object.entries(answers).filter(([k]) => !(c?.deduction?.questions || []).some((q) => q.id === k)).map(([k, v]) => `${k}: ${v}`);
  return { who: names.length ? names.join(' + ') : 'Nobody', extra: [...extra, ...other].join(' · ') };
}
const okPill = (ok) => h('span', { class: `pill ${ok ? 'pill--good' : 'pill--bad'}` }, ok ? '✓ Correct' : '✗ Wrong');

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
}
const ui = {};
let withDev = store.get(DEV_KEY, localStorage) === '1';

function showApp() {
  cleanup();
  const navLinks = [['overview', 'Overview'], ['players', 'Players'], ['voices', 'Voices']].map(([id, label]) =>
    h('a', { href: `#${id}`, 'data-view': id }, label));
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
  ui.overview = h('section', { id: 'view-overview', 'aria-label': 'Overview' });
  ui.players = h('section', { id: 'view-players', 'aria-label': 'Players', hidden: true });
  ui.voices = h('section', { id: 'voices', 'aria-label': 'Voices', hidden: true });
  ui.nav = navLinks;
  root.replaceChildren(top, h('main', { class: 'adm-main' }, ui.overview, ui.players, ui.voices));
  window.addEventListener('hashchange', route);
  cleanups.push(() => window.removeEventListener('hashchange', route));
  loaded.overview = false;
  loaded.players = null;
  loaded.voices = false;
  route();
}

const loaded = { overview: false, players: null, voices: false };
function route() {
  const hash = location.hash.replace(/^#/, '') || 'overview';
  const [view, arg] = hash.split('/');
  const name = ['overview', 'players', 'player', 'voices'].includes(view) ? view : 'overview';
  const tab = name === 'player' ? 'players' : name;
  ui.overview.hidden = tab !== 'overview';
  ui.players.hidden = tab !== 'players';
  ui.voices.hidden = tab !== 'voices';
  ui.nav.forEach((a) => (a.dataset.view === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  if (tab === 'overview' && !loaded.overview) loadOverview();
  if (name === 'players') showPlayers();
  if (name === 'player' && arg) showPlayer(decodeURIComponent(arg));
  if (tab === 'voices' && !loaded.voices) loadVoices();
}

function refresh() {
  loaded.overview = false;
  loaded.players = null;
  route();
}

function stamp() {
  ui.status.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// ---------- overview ----------
let charts = [];
async function loadOverview() {
  loaded.overview = true;
  ui.overview.replaceChildren(h('p', { class: 'loading' }, 'Loading the numbers…'));
  try {
    const data = await api(`/admin/summary?tz=${tzMinutes()}${withDev ? '&dev=1' : ''}`);
    renderOverview(data);
    stamp();
  } catch (err) {
    loaded.overview = false;
    if (err.status !== 401) ui.overview.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, explain(err)));
  }
}

function kpi(label, value, note, accent) {
  return h('div', { class: `kpi${accent ? ' kpi--accent' : ''}` },
    h('div', { class: 'kpi-label' }, label),
    h('div', { class: 'kpi-value' }, value),
    note ? h('div', { class: 'kpi-note' }, note) : null);
}

function renderOverview(d) {
  charts.forEach((c) => c.destroy());
  charts = [];
  const t = d.totals;
  const kpis = h('div', { class: 'kpis' },
    kpi('Players', fmtN(t.players), withDev ? `including ${fmtN(t.dev)} dev` : t.dev ? `${fmtN(t.dev)} dev ${t.dev === 1 ? 'player' : 'players'} not counted` : 'everyone who opened the game', true),
    kpi('Active, 24 hours', fmtN(t.active24h), `${fmtN(t.new24h)} new today`),
    kpi('Active, 7 days', fmtN(t.active7d), pct(t.active7d, t.players) + ' of players'),
    kpi('Active, 30 days', fmtN(t.active30d), pct(t.active30d, t.players) + ' of players'),
    kpi('Cases closed', fmtN(t.casesClosed), t.casesClosed ? `${pct(t.casesCorrect, t.casesClosed)} with the right verdict` : 'none yet'),
    kpi('On the leaderboard', fmtN(t.onBoard), 'chose to show their name'));

  // new players per day, the last 30 local days with gaps filled
  const byDay = new Map(d.newPerDay.map((r) => [r.day, r.n]));
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const iso = new Date(d.generatedAt + d.tz * 60_000 - i * DAY).toISOString().slice(0, 10);
    const dt = new Date(`${iso}T12:00:00Z`);
    days.push({
      value: byDay.get(iso) || 0,
      label: dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
      short: dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    });
  }
  const newTotal = days.reduce((s, x) => s + x.value, 0);
  const lineBox = h('div');
  const newCard = h('div', { class: 'card' },
    h('h3', {}, 'New players per day'),
    h('p', { class: 'sub' }, `${fmtN(newTotal)} in the last 30 days, by your local date`),
    lineBox);

  // players by where they are now
  const stageRows = d.stages.filter((s) => s.n > 0);
  const notStarted = stageRows.filter((s) => !s.case_id);
  const ordered = [...notStarted, ...stageRows.filter((s) => s.case_id)];
  const barBox = h('div');
  const stageCard = h('div', { class: 'card' },
    h('h3', {}, 'Players by current stage'),
    h('p', { class: 'sub' }, 'Each player counted once, at the furthest case they have opened'),
    ordered.length ? barBox : h('p', { class: 'chart-empty' }, 'No players yet.'));

  const caseBox = h('div');
  const geo = h('div', { class: 'grid-2' },
    listCard('Countries', 'Country', 'From Cloudflare, by player', d.countries, (k) => (k === '??' ? 'Unknown' : k)),
    listCard('Platforms', 'Platform', 'Operating system / device form', d.platforms, (k) => k));

  ui.overview.replaceChildren(
    h('div', { class: 'adm-h' }, h('h2', {}, 'Overview'), h('p', {}, `Generated ${dateTime(d.generatedAt)}`)),
    kpis,
    h('div', { class: 'adm-h' }, h('h2', {}, 'Growth and progress')),
    h('div', { class: 'grid-2' }, newCard, stageCard),
    h('div', { class: 'adm-h' }, h('h2', {}, 'Cases'), h('p', {}, 'Where players stop, how long puzzles take, and whom they charge')),
    caseBox,
    h('div', { class: 'adm-h' }, h('h2', {}, 'Audience')),
    geo);

  charts.push(lineChart(lineBox, days, { title: 'New players per day, last 30 days', valueLabel: (v) => `${fmtN(v)} new ${v === 1 ? 'player' : 'players'}` }));
  if (ordered.length) {
    charts.push(barChart(barBox, ordered.map((s) => ({ label: stageLabel(s), value: s.n, note: s.case_id ? `${stageLabel(s)} · ${s.levels_solved} solved` : 'Profile made or title screen only' })), {
      title: 'Players by current stage', labelWidth: 300, valueLabel: (v) => fmtN(v),
    }));
  }
  renderCases(caseBox, d);
}

function listCard(title, col, sub, rows, fmtKey) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  const total = rows.reduce((s, r) => s + r.n, 0);
  return h('div', { class: 'card' },
    h('h3', {}, title), h('p', { class: 'sub' }, sub),
    rows.length ? h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, col), h('th', { scope: 'col' }, 'Players'), h('th', { scope: 'col', class: 'r' }, 'Share'))),
      h('tbody', {}, rows.map((r) => h('tr', {},
        h('th', { scope: 'row' }, fmtKey(r.k)),
        h('td', {}, barCell(r.n, max)),
        h('td', { class: 'r' }, pct(r.n, total))))))) : h('p', { class: 'chart-empty' }, 'No data yet.'));
}

function barCell(n, max, text) {
  return h('div', { class: 'bar-cell' },
    h('span', {}, text ?? fmtN(n)),
    h('div', { class: 'bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${max ? Math.round((n / max) * 100) : 0}%` } })));
}

let currentCase = null;
function renderCases(box, d) {
  const known = CASE_ORDER.filter((id) => CASES[id]);
  const extra = [...new Set(d.cases.map((c) => c.case_id))].filter((id) => !known.includes(id));
  const ids = [...known, ...extra];
  if (!ids.includes(currentCase)) currentCase = ids.find((id) => d.cases.some((c) => c.case_id === id)) || ids[0];
  const btns = ids.map((id) => h('button', { type: 'button', 'aria-pressed': String(id === currentCase), onclick: () => { currentCase = id; renderCases(box, d); } }, cname(id)));
  const row = d.cases.find((c) => c.case_id === currentCase) || { opened: 0, closed: 0, correct: 0 };
  const c = CASES[currentCase];

  // funnel
  const solves = new Map(d.funnel.filter((f) => f.case_id === currentCase).map((f) => [f.level_id, f]));
  const levels = c ? [...c.levels] : [];
  for (const id of solves.keys()) if (!levels.some((l) => l.id === id)) levels.push({ id, title: id, phase: 'not in this build' });
  let prev = row.opened;
  const trs = levels.map((l, i) => {
    const f = solves.get(l.id) || { players: 0 };
    const branch = isBranch(l);
    const drop = !branch && prev ? 1 - f.players / prev : null;
    if (!branch) prev = f.players;
    return h('tr', {},
      h('td', { class: 'r muted' }, String(i + 1)),
      h('th', { scope: 'row' }, l.title, branch ? h('span', { class: 'branch', title: 'Only some players get this puzzle, depending on earlier verdicts' }, 'branch') : null, h('span', { class: 'phase' }, `${l.phase || ''}${l.game ? ` · ${l.game}` : ''}`)),
      h('td', {}, barCell(f.players, row.opened || 1)),
      h('td', { class: 'r' }, pct(f.players, row.opened)),
      h('td', { class: `r${drop != null && drop >= 0.25 ? ' drop-hi' : ''}` }, drop == null ? '–' : `${Math.round(drop * 100)}%`),
      h('td', { class: 'r' }, f.players ? fmtDuration(f.avgTime) : '–'),
      h('td', { class: 'r hide-sm' }, f.players ? (Math.round(f.avgHints * 10) / 10).toFixed(1) : '–'));
  });
  const closeDrop = prev ? 1 - row.closed / prev : null;
  trs.push(h('tr', {},
    h('td', { class: 'r muted' }, '⚖'),
    h('th', { scope: 'row' }, 'Deduction room: case closed', h('span', { class: 'phase' }, 'charges made')),
    h('td', {}, barCell(row.closed, row.opened || 1)),
    h('td', { class: 'r' }, pct(row.closed, row.opened)),
    h('td', { class: `r${closeDrop != null && closeDrop >= 0.25 ? ' drop-hi' : ''}` }, closeDrop == null ? '–' : `${Math.round(closeDrop * 100)}%`),
    h('td', { class: 'r' }, row.closed ? fmtDuration(row.avgTime) : '–'),
    h('td', { class: 'r hide-sm' }, row.closed ? (Math.round(row.avgHints * 10) / 10).toFixed(1) : '–')));
  const funnel = h('div', { class: 'card card--wide' },
    h('h3', {}, 'Puzzle funnel'),
    h('p', { class: 'sub' }, `Players who solved each puzzle, out of the ${fmtN(row.opened)} who opened the case. Drop-off is against the previous puzzle; 25% or more is marked. The last row's time and hints are whole-case averages.`),
    h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {},
        h('th', { scope: 'col', class: 'r' }, '#'), h('th', { scope: 'col' }, 'Puzzle'), h('th', { scope: 'col' }, 'Solved by'),
        h('th', { scope: 'col', class: 'r' }, 'Of opened'), h('th', { scope: 'col', class: 'r' }, 'Drop-off'),
        h('th', { scope: 'col', class: 'r' }, 'Avg time'), h('th', { scope: 'col', class: 'r hide-sm' }, 'Avg hints'))),
      h('tbody', {}, trs))));

  // verdicts
  const vs = d.verdicts.filter((v) => v.case_id === currentCase);
  const vmax = Math.max(1, ...vs.map((v) => v.n));
  const verdicts = h('div', { class: 'card card--wide' },
    h('h3', {}, 'Verdicts'),
    h('p', { class: 'sub' }, row.closed ? `${fmtN(row.closed)} closed files, ${pct(row.correct, row.closed)} correct` : 'Nobody has closed this case yet.'),
    vs.length ? h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Charged'), h('th', { scope: 'col' }, 'Players'), h('th', { scope: 'col', class: 'r' }, 'Share'), h('th', { scope: 'col' }, 'Verdict'))),
      h('tbody', {}, vs.map((v) => {
        const t = verdictText(currentCase, v.charged, v.answers);
        return h('tr', {},
          h('th', { scope: 'row' }, t.who, t.extra ? h('span', { class: 'phase' }, t.extra) : null),
          h('td', {}, barCell(v.n, vmax)),
          h('td', { class: 'r' }, pct(v.n, row.closed)),
          h('td', {}, okPill(v.correct)));
      })))) : null);

  box.replaceChildren(
    h('div', { class: 'toolbar' }, h('div', { class: 'seg', role: 'group', 'aria-label': 'Case' }, btns)),
    h('div', { class: 'case-kpis' },
      h('span', {}, h('b', {}, fmtN(row.opened)), 'opened'),
      h('span', {}, h('b', {}, fmtN(row.closed)), `closed (${pct(row.closed, row.opened)})`),
      h('span', {}, h('b', {}, pct(row.correct, row.closed)), 'correct verdicts'),
      h('span', {}, h('b', {}, row.closed ? fmtDuration(row.avgTime) : '–'), 'avg puzzle time per closed case')),
    h('div', { class: 'grid-2' }, funnel, verdicts));
}

// ---------- players ----------
const playersState = { q: '', offset: 0, limit: 50 };
function showPlayers() {
  if (loaded.players === 'list' && ui.players.querySelector('.players-list')) return;
  loaded.players = 'list';
  const search = h('input', { class: 'a-input', type: 'search', placeholder: 'Search a name, id prefix or country code', 'aria-label': 'Search players', value: playersState.q });
  const count = h('span', { class: 'muted' });
  const body = h('div', { class: 'players-body' }, h('p', { class: 'loading' }, 'Loading players…'));
  let timer = 0;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { playersState.q = search.value.trim(); playersState.offset = 0; load(); }, 300);
  });
  ui.players.replaceChildren(h('div', { class: 'players-list' },
    h('div', { class: 'adm-h' }, h('h2', {}, 'Players'), h('p', {}, 'Most recently seen first. Detective names as players typed them; "board" means the name is also shown on the public leaderboard, "cloud" that the game is saved online.')),
    h('div', { class: 'toolbar' }, search, count),
    h('div', { class: 'card' }, body)));

  async function load() {
    body.replaceChildren(h('p', { class: 'loading' }, 'Loading players…'));
    try {
      const q = new URLSearchParams({ limit: playersState.limit, offset: playersState.offset });
      if (playersState.q) q.set('q', playersState.q);
      const d = await api(`/admin/players?${q}`);
      stamp();
      count.textContent = `${fmtN(d.total)} ${d.total === 1 ? 'player' : 'players'}`;
      if (!d.players.length) { body.replaceChildren(h('p', { class: 'chart-empty' }, playersState.q ? 'Nobody matches.' : 'No players yet.')); return; }
      const rows = d.players.map((p) => {
        const tr = h('tr', { class: 'is-click', tabindex: 0, onclick: () => { location.hash = `#player/${p.id}`; }, onkeydown: (e) => { if (e.key === 'Enter') location.hash = `#player/${p.id}`; } },
          h('th', { scope: 'row' }, h('div', { class: 'who' }, h('b', {}, p.name || 'No name yet'), h('span', { class: 'mono' }, p.id.slice(0, 8)))),
          h('td', {}, stageLabel(p)),
          h('td', { class: 'r' }, fmtN(p.closed_cases)),
          h('td', { class: 'r' }, fmtN(p.solves)),
          h('td', {}, p.country || '–'),
          h('td', { class: 'hide-sm' }, p.platform || '–'),
          h('td', { class: 'hide-sm' }, dateTime(p.created_at)),
          h('td', {}, ago(p.last_seen)),
          h('td', {}, h('span', { class: 'tags' }, p.dev ? h('span', { class: 'pill pill--plain' }, 'dev') : null, p.cloud ? h('span', { class: 'pill pill--plain' }, 'cloud') : null, p.shown ? h('span', { class: 'pill pill--good' }, 'board') : null)));
        return tr;
      });
      const prev = h('button', { class: 'a-btn', type: 'button', disabled: playersState.offset === 0, onclick: () => { playersState.offset = Math.max(0, playersState.offset - playersState.limit); load(); } }, '← Newer');
      const next = h('button', { class: 'a-btn', type: 'button', disabled: playersState.offset + d.players.length >= d.total, onclick: () => { playersState.offset += playersState.limit; load(); } }, 'Older →');
      body.replaceChildren(
        h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' },
          h('thead', {}, h('tr', {},
            h('th', { scope: 'col' }, 'Detective'), h('th', { scope: 'col' }, 'Furthest stage'), h('th', { scope: 'col', class: 'r' }, 'Closed'),
            h('th', { scope: 'col', class: 'r' }, 'Solved'), h('th', { scope: 'col' }, 'Country'), h('th', { scope: 'col', class: 'hide-sm' }, 'Platform'),
            h('th', { scope: 'col', class: 'hide-sm' }, 'First seen'), h('th', { scope: 'col' }, 'Last seen'), h('th', { scope: 'col' }, h('span', { class: 'sr-only' }, 'Tags')))),
          h('tbody', {}, rows))),
        h('div', { class: 'pager' }, h('span', {}, `${fmtN(playersState.offset + 1)}–${fmtN(playersState.offset + d.players.length)} of ${fmtN(d.total)}`), prev, next));
    } catch (err) {
      if (err.status !== 401) body.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, explain(err)));
    }
  }
  load();
}

async function showPlayer(id) {
  loaded.players = 'detail';
  ui.players.replaceChildren(h('p', { class: 'loading' }, 'Loading the file…'));
  try {
    const d = await api(`/admin/player/${encodeURIComponent(id)}`);
    stamp();
    const p = d.player;
    const progress = [...d.progress].sort((a, b) => CASE_ORDER.indexOf(a.case_id) - CASE_ORDER.indexOf(b.case_id));
    const cases = progress.map((r) => {
      const v = r.verdict ? verdictText(r.case_id, r.verdict.charged, r.verdict.answers) : null;
      return h('div', { class: 'card pd-case' },
        h('h3', {}, h('span', {}, cname(r.case_id)), r.closed_at ? okPill(!!r.correct) : h('span', { class: 'pill pill--plain' }, 'open')),
        h('p', {}, `${r.levels_solved} puzzles · ${fmtDuration(r.total_time)} · ${r.hints_used} ${r.hints_used === 1 ? 'hint' : 'hints'}`),
        v ? h('p', {}, `Charged ${v.who}${v.extra ? ` · ${v.extra}` : ''}`) : null,
        h('p', { class: 'muted' }, `Opened ${dateTime(r.opened_at)}${r.closed_at ? ` · closed ${dateTime(r.closed_at)}` : ''}`));
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
    ui.players.replaceChildren(
      h('p', {}, h('a', { href: '#players', class: 'a-btn a-btn--ghost' }, '← All players')),
      h('div', { class: 'card' },
        h('div', { class: 'pd-head' },
          h('div', {}, h('h2', {}, p.name || 'Anonymous detective'), h('p', { class: 'mono' }, p.id)),
          h('span', { class: 'tags' }, p.dev ? h('span', { class: 'pill pill--plain' }, 'dev tools used') : null, p.shown ? h('span', { class: 'pill pill--good' }, 'on the leaderboard') : h('span', { class: 'pill pill--plain' }, 'name hidden'))),
        h('dl', { class: 'pd-facts' },
          h('div', {}, h('dt', {}, 'First seen'), h('dd', {}, dateTime(p.created_at))),
          h('div', {}, h('dt', {}, 'Last seen'), h('dd', {}, `${ago(p.last_seen)} (${dateTime(p.last_seen)})`)),
          h('div', {}, h('dt', {}, 'Sessions'), h('dd', {}, fmtN(p.sessions))),
          h('div', {}, h('dt', {}, 'Puzzles solved'), h('dd', {}, fmtN(d.solves.length))),
          h('div', {}, h('dt', {}, 'Country'), h('dd', {}, p.country || '–')),
          h('div', {}, h('dt', {}, 'Platform'), h('dd', {}, p.platform || '–')))),
      h('div', { class: 'adm-h' }, h('h2', {}, 'Cases')),
      cases.length ? h('div', { class: 'pd-cases' }, cases) : h('p', { class: 'note' }, 'No case opened yet.'),
      h('div', { class: 'adm-h' }, h('h2', {}, 'Timeline'), h('p', {}, d.events.length >= 300 ? 'Latest 300 events' : `${d.events.length} events, newest first`)),
      h('div', { class: 'card' }, d.events.length ? h('ol', { class: 'timeline' }, d.events.map((e) => h('li', {},
        h('time', { datetime: new Date(e.at).toISOString() }, dateTime(e.at)),
        h('span', { class: `ev-type t-${e.type}` }, label[e.type] || e.type),
        h('span', { class: 'ev-what' }, describe(e))))) : h('p', { class: 'chart-empty' }, 'No events.')));
  } catch (err) {
    if (err.status !== 401) ui.players.replaceChildren(h('p', {}, h('a', { href: '#players', class: 'a-btn a-btn--ghost' }, '← All players')), h('div', { class: 'err-box', role: 'alert' }, err.status === 404 ? 'No player with that id.' : explain(err)));
  }
}

// ---------- voices (mounted from ./voices.js when that module exists) ----------
const voiceModules = import.meta.glob('./voices.js');
async function loadVoices() {
  loaded.voices = true;
  const el = ui.voices;
  const loader = voiceModules['./voices.js'];
  if (!loader) {
    el.replaceChildren(
      h('div', { class: 'adm-h' }, h('h2', {}, 'Voices')),
      h('div', { class: 'note', 'data-placeholder': 'voices' }, 'Voices are not set up in this build yet. This tab loads src/admin/voices.js and calls its mountVoices(el, { api, h, token }) when it exists.'));
    return;
  }
  el.replaceChildren(h('p', { class: 'loading' }, 'Loading voices…'));
  try {
    const mod = await loader();
    el.replaceChildren();
    if (typeof mod.mountVoices !== 'function') throw new Error('voices.js has no mountVoices export');
    const handle = await mod.mountVoices(el, { api, h, token: () => token });
    if (handle && typeof handle.destroy === 'function') cleanups.push(() => handle.destroy());
  } catch (err) {
    console.error(err);
    loaded.voices = false;
    el.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, 'The voices panel could not load.'));
  }
}

// ---------- start ----------
if (token) showApp();
else showLogin();
