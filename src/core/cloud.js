// Cloud save: a copy of the save kept on the server under the detective's name (functions/api/save.js),
// so a player can carry on on another device by typing that name on the title screen.
//
// - Rides on "Share progress" (settings.shareProgress): off means nothing leaves the device.
// - Pushes a few seconds after the save changes (and when the page hides), skipping unchanged copies.
// - The name belongs to whoever saved it first (their random player id). Loading it on another device
//   takes that id over, so both devices keep saving to the same case file.
// - If the online copy is further ahead than this device (another device played on, or "New game" was
//   pressed here), the player chooses which one to keep.
// Never throws into the game; with no backend it does nothing.
import { state, onChange, replaceSave } from './state.js';
import { backendReady, playerId, sharing, adoptPlayer } from './telemetry.js';
import { h, modal, toast } from './ui.js';
import { CASES, CASE_ORDER } from '../data/cases.js';

const STORE = 'floor14.cloud.v1';
const API = './api/save';
const DEBOUNCE_MS = 5000;

let meta = load(); // { hash, at, takenKey }
let timer = 0;
let busy = false;
let again = false;
let asking = false;
let adopting = false;

function load() {
  try {
    const m = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (m && typeof m === 'object') return m;
  } catch { /* blocked */ }
  return {};
}
function persist() {
  try { localStorage.setItem(STORE, JSON.stringify(meta)); } catch { /* session only */ }
}

const keyOf = (name) => String(name || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

function hashOf(str) {
  let x = 2166136261;
  for (let i = 0; i < str.length; i++) x = Math.imul(x ^ str.charCodeAt(i), 16777619);
  return `${str.length}:${(x >>> 0).toString(36)}`;
}

/** How far a save has got (same rule as the server): puzzles solved, plus 50 per closed case. */
export function scoreOf(s) {
  let n = 0;
  for (const cs of Object.values(s?.cases || {})) {
    if (!cs || typeof cs !== 'object') continue;
    n += Object.keys(cs.solved || {}).length;
    if (cs.status === 'closed') n += 50;
  }
  return n;
}

/** One line about a save: "Case 2: Container 47 · 23 puzzles solved". */
export function summaryOf(s) {
  const cases = s?.cases || {};
  const started = CASE_ORDER.filter((id) => cases[id]);
  const last = started[started.length - 1];
  const solved = Object.values(cases).reduce((n, cs) => n + Object.keys(cs?.solved || {}).length, 0);
  const closed = Object.values(cases).filter((cs) => cs?.status === 'closed').length;
  const where = last ? (CASES[last]?.title ? `${CASES[last].label || caseLabel(last)}: ${CASES[last].title}` : last) : 'No case opened yet';
  return `${where} · ${solved} puzzle${solved === 1 ? '' : 's'} solved${closed ? ` · ${closed} case${closed === 1 ? '' : 's'} closed` : ''}`;
}
function caseLabel(id) {
  const m = /^case0*(\d+)$/.exec(id);
  return m ? `Case ${m[1]}` : 'Side case';
}

const ready = async () => sharing() && (await backendReady());

/** Look a case file up by detective name. Resolves { found, name, player_id, updated_at, score, save } or null (offline / error). */
export async function findSave(name) {
  try {
    if (!(await backendReady())) return null;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 8000);
    const res = await fetch(`${API}?name=${encodeURIComponent(String(name).trim())}`, { cache: 'no-store', credentials: 'same-origin', signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const d = await res.json();
    return d && d.ok ? d : null;
  } catch {
    return null;
  }
}

/** Load a found case file on this device (replaces the local game), then reload the page. */
export function adopt(found) {
  adopting = true;
  clearTimeout(timer);
  const next = { ...found.save, playerId: found.player_id };
  replaceSave(next);
  adoptPlayer(found.player_id, next);
  meta = { hash: null, at: found.updated_at, takenKey: null };
  persist();
  try { sessionStorage.setItem('floor14.cloud.loaded', found.name || '1'); } catch { /* fine */ }
  location.reload();
}

/** Is this name free for this player (or theirs already)? Resolves 'free' | 'mine' | { taken: found } | 'unknown'. */
export async function checkName(name) {
  if (!(await ready())) return 'unknown';
  const f = await findSave(name);
  if (!f) return 'unknown';
  if (!f.found) return 'free';
  if (f.player_id === playerId()) return 'mine';
  return { taken: f };
}

async function push({ force = false } = {}) {
  if (adopting) return;
  if (busy) { again = true; return; }
  const s = state();
  if (!s.profile?.name || !(await ready())) return;
  const body = { player_id: playerId(), name: s.profile.name, save: s, ...(force ? { force: true } : {}) };
  const text = JSON.stringify(body);
  const hash = hashOf(JSON.stringify(s));
  if (!force && meta.hash === hash) return;
  if (!force && meta.takenKey && meta.takenKey === keyOf(s.profile.name)) return; // told once; wait for a rename
  busy = true;
  try {
    const res = await fetch(API, { method: 'POST', body: text, credentials: 'same-origin', keepalive: text.length < 60_000, headers: { 'content-type': 'application/json' } });
    const d = await res.json().catch(() => null);
    if (res.ok && d?.ok) {
      meta = { ...meta, hash, at: d.updated_at, takenKey: null };
      persist();
    } else if (res.status === 409 && d?.error === 'name_taken') {
      meta.takenKey = keyOf(s.profile.name);
      persist();
      toast(`Another detective already keeps a case file as "${s.profile.name}", so this game is not backed up. Change your name in Profile to back it up.`, 7000);
    } else if (res.status === 409 && d?.error === 'newer' && d.save) {
      await offerNewer(d);
    }
  } catch { /* offline: the next change tries again */ } finally {
    busy = false;
    if (again) { again = false; schedule(); }
  }
}

/** The online copy is further ahead than this device: let the player choose. */
async function offerNewer(found) {
  if (asking) return;
  asking = true;
  try {
    const here = state();
    const body = h('div', { class: 'cloud-choice' },
      h('p', {}, `Your case file saved online is further ahead than the game on this device.`),
      h('dl', { class: 'cloud-compare' },
        h('dt', {}, 'Online'), h('dd', {}, summaryOf(found.save)),
        h('dt', {}, 'This device'), h('dd', {}, summaryOf(here))));
    const v = await modal({
      title: 'Which game do you keep?', body, dismissable: false,
      buttons: [{ label: 'Keep this device', value: 'here' }, { label: 'Load the online one', kind: 'primary', value: 'cloud' }],
    });
    if (v === 'cloud') adopt(found);
    else await push({ force: true });
  } finally {
    asking = false;
  }
}

function schedule(ms = DEBOUNCE_MS) {
  clearTimeout(timer);
  timer = setTimeout(() => push(), ms);
}

/** Start syncing. Checks the online copy once at start, then pushes after changes. */
export async function initCloud() {
  try {
    try {
      const n = sessionStorage.getItem('floor14.cloud.loaded');
      if (n) { sessionStorage.removeItem('floor14.cloud.loaded'); setTimeout(() => toast(`Case file loaded. Welcome back, ${state().profile?.name || 'detective'}.`, 4500), 1200); }
    } catch { /* fine */ }
    onChange(() => { if (!adopting) schedule(); });
    const hide = () => { if (document.visibilityState === 'hidden') push(); };
    document.addEventListener('visibilitychange', hide);
    if (!(await ready())) return;
    const s = state();
    if (!s.profile?.name) return;
    const f = await findSave(s.profile.name);
    if (f?.found && f.player_id === playerId() && f.score > scoreOf(s)) { await offerNewer(f); return; }
    schedule(1500);
  } catch { /* the game never notices */ }
}

/** Title-screen dialog: type a detective name, load that case file here. */
export async function openCloudLoad() {
  if (!(await backendReady())) {
    await modal({ title: 'Case files are out of reach', body: 'The online case files cannot be reached right now. Check your connection and try again.' });
    return;
  }
  let name = '';
  for (;;) {
    const input = h('input', { class: 'text-input', type: 'text', maxlength: 24, autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false', placeholder: 'e.g. Arjun Pillai', value: name, 'aria-label': 'Detective name',
      onkeydown: (e) => { if (e.key === 'Enter') e.target.closest('.modal')?.querySelector('.actions .btn--primary')?.click(); } });
    const body = h('div', { class: 'cloud-load' },
      h('p', {}, 'Played on another phone or computer? Type the detective name you used there and your game continues here.'),
      input,
      h('p', { class: 'cloud-note' }, 'Your progress is saved online under your detective name while "Share progress" is on in Settings.'));
    setTimeout(() => input.focus(), 60);
    const go = await modal({ title: 'Continue on this device', body, buttons: [{ label: 'Cancel', value: false }, { label: 'Find my case file', kind: 'primary', value: true }] });
    if (!go) return;
    name = input.value.trim();
    if (name.length < 2) continue;
    const f = await findSave(name);
    if (!f) {
      await modal({ title: 'Could not check', body: 'The case files did not answer. Try again in a moment.' });
      return;
    }
    if (!f.found) {
      const retry = await modal({ title: 'No case file under that name', body: `Nothing is filed as "${name}". Check the spelling (it must match exactly, but capitals do not matter).`, buttons: [{ label: 'Cancel', value: false }, { label: 'Try again', kind: 'primary', value: true }] });
      if (retry) continue;
      return;
    }
    const here = state();
    const replacing = !!here.profile && here.playerId !== f.player_id;
    const info = h('div', { class: 'cloud-choice' },
      h('p', {}, h('b', {}, f.name || name)),
      h('p', {}, summaryOf(f.save)),
      replacing ? h('p', { class: 'cloud-warn' }, `This replaces the game on this device (${here.profile.name}: ${summaryOf(here)}).`) : null);
    const ok = await modal({ title: 'Case file found', body: info, buttons: [{ label: 'Cancel', value: false }, { label: 'Load it here', kind: 'primary', value: true }] });
    if (ok) adopt(f);
    return;
  }
}
