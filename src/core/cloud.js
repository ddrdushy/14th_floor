// Cloud save: a copy of the save kept on the server under the detective's name and a 4-digit PIN
// (functions/api/save.js), so a player can carry on on another device by typing both on the title screen.
//
// - Rides on "Share progress" (settings.shareProgress): off means nothing leaves the device.
// - Pushes a few seconds after the save changes (and when the page hides), skipping unchanged copies.
// - The case file belongs to this device's random player id. Loading it elsewhere with the right PIN
//   hands that id over, so both devices keep saving to the same file.
// - Every player is asked once per session to set a PIN until they have one (new detectives while
//   signing their licence). The PIN is only kept on this device until the server has it.
// - If the online copy is further ahead (another device played on, or "New game" here), the player
//   chooses which game to keep.
// Never throws into the game; with no backend it does nothing.
import { state, onChange, replaceSave } from './state.js';
import { backendReady, playerId, sharing, adoptPlayer } from './telemetry.js';
import { h, modal, toast } from './ui.js';
import { CASES, CASE_ORDER } from '../data/cases.js';

const STORE = 'floor14.cloud.v1';
const API = './api/save';
const DEBOUNCE_MS = 5000;
const PIN_RE = /^\d{4}$/;

let meta = load(); // { hash, at, takenKey, pendingPin, hasPin }
let timer = 0;
let busy = false;
let again = false;
let asking = false;
let adopting = false;
let askedPin = false;

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

/** One line about a save (or the server's brief of one): "Case 1: The Fall · 23 puzzles solved". */
export function summaryOf(s) {
  const cases = s?.cases || {};
  const started = CASE_ORDER.filter((id) => cases[id]);
  const last = started[started.length - 1];
  const solved = Object.values(cases).reduce((n, cs) => n + Object.keys(cs?.solved || {}).length, 0);
  const closed = Object.values(cases).filter((cs) => cs?.status === 'closed').length;
  const where = last ? `${CASES[last]?.label || caseLabel(last)}${CASES[last]?.title ? `: ${CASES[last].title}` : ''}` : 'No case opened yet';
  return `${where} · ${solved} puzzle${solved === 1 ? '' : 's'} solved${closed ? ` · ${closed} case${closed === 1 ? '' : 's'} closed` : ''}`;
}
function caseLabel(id) {
  const m = /^case0*(\d+)$/.exec(id);
  return m ? `Case ${m[1]}` : 'Side case';
}

const ready = async () => sharing() && (await backendReady());

async function call(url, opts = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 9000);
  try {
    const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin', signal: ctl.signal, ...opts });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  } catch {
    return { status: 0, data: null };
  } finally {
    clearTimeout(t);
  }
}

/** Look a case file up by name. Resolves { found, name, has_pin, mine, score, brief } or null (offline / error). */
export async function findSave(name) {
  if (!(await backendReady())) return null;
  const q = new URLSearchParams({ name: String(name).trim() });
  if (sharing()) q.set('me', playerId());
  const { data } = await call(`${API}?${q}`);
  return data && data.ok ? data : null;
}

/** Open a case file with its PIN. Resolves the server's answer ({ ok, save, player_id, … } or { error, left, retry_after }). */
async function loadWithPin(name, pin) {
  const { status, data } = await call(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'load', name, pin }) });
  return data || { ok: false, error: status ? `http_${status}` : 'offline' };
}

/** Load an opened case file on this device (replaces the local game), then reload the page. */
export function adopt(found) {
  adopting = true;
  clearTimeout(timer);
  const next = { ...found.save, playerId: found.player_id };
  replaceSave(next);
  adoptPlayer(found.player_id, next);
  meta = { hash: null, at: found.updated_at, takenKey: null, hasPin: true };
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
  if (f.mine) return 'mine';
  return { taken: f };
}

// ---------- PIN ----------
function pinInput(label) {
  return h('input', { class: 'text-input cloud-pin', type: 'text', inputmode: 'numeric', pattern: '[0-9]*', maxlength: 4, autocomplete: 'off', 'aria-label': label, placeholder: '• • • •',
    oninput: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); },
    onkeydown: (e) => { if (e.key === 'Enter') e.target.closest('.modal')?.querySelector('.actions .btn--primary')?.click(); } });
}

/**
 * Ask for a new PIN. `required` hides "Not now" (a detective signing their licence).
 * Resolves the PIN (kept until the server has it) or null.
 */
export async function promptPin({ required = false, change = false } = {}) {
  let note = '';
  for (;;) {
    const input = pinInput('New 4-digit PIN');
    const body = h('div', { class: 'cloud-load' },
      h('p', {}, change
        ? 'Choose a new 4-digit PIN for your case file.'
        : 'Your game is saved online under your detective name. Choose a 4-digit PIN: with your name and this PIN you can continue on any phone or computer.'),
      input,
      note ? h('p', { class: 'cloud-warn' }, note) : null,
      h('p', { class: 'cloud-note' }, 'Write it down. Nobody else can open your case file without it.'));
    setTimeout(() => input.focus(), 60);
    const buttons = [...(required ? [] : [{ label: change ? 'Cancel' : 'Not now', value: false }]), { label: 'Save my PIN', kind: 'primary', value: true }];
    const ok = await modal({ title: change ? 'Change your PIN' : 'Lock your case file', body, buttons, dismissable: !required });
    if (!ok) return null;
    const pin = input.value.trim();
    if (!PIN_RE.test(pin)) { note = 'Type exactly 4 digits.'; continue; }
    if (/^(\d)\1{3}$/.test(pin) || pin === '1234' || pin === '0000') { note = 'Too easy to guess. Pick another one.'; continue; }
    meta.pendingPin = pin;
    persist();
    if (state().profile) await push({ force: false, pinOnly: true });
    if (!meta.pendingPin) toast('PIN saved. Your case file is locked.', 3500);
    return pin;
  }
}

/** Ask an existing player without a PIN to set one (once per session). */
async function askForPinIfMissing() {
  if (askedPin || meta.hasPin || meta.pendingPin) return;
  const s = state();
  if (!s.profile?.name || !(await ready())) return;
  const f = await findSave(s.profile.name);
  if (!f || (f.found && !f.mine)) return; // offline, or the name belongs to someone else (push will say)
  if (f.found && f.has_pin) { meta.hasPin = true; persist(); return; }
  askedPin = true;
  await promptPin();
}

// ---------- push ----------
async function push({ force = false, pinOnly = false } = {}) {
  if (adopting) return;
  if (busy) { again = true; return; }
  const s = state();
  if (!s.profile?.name || !(await ready())) return;
  const pin = meta.pendingPin || null;
  const hash = hashOf(JSON.stringify(s));
  if (!force && !pin && meta.hash === hash) return;
  if (!force && meta.takenKey && meta.takenKey === keyOf(s.profile.name)) return; // told once; wait for a rename
  const text = JSON.stringify({ player_id: playerId(), name: s.profile.name, save: s, ...(pin ? { pin } : {}), ...(force ? { force: true } : {}) });
  busy = true;
  try {
    const res = await fetch(API, { method: 'POST', body: text, credentials: 'same-origin', keepalive: text.length < 60_000, headers: { 'content-type': 'application/json' } });
    const d = await res.json().catch(() => null);
    if (res.ok && d?.ok) {
      meta = { ...meta, hash, at: d.updated_at, takenKey: null, hasPin: !!d.has_pin };
      if (pin) delete meta.pendingPin;
      persist();
    } else if (res.status === 409 && d?.error === 'name_taken') {
      meta.takenKey = keyOf(s.profile.name);
      persist();
      toast(`Another detective already keeps a case file as "${s.profile.name}", so this game is not saved online. Change your name in Profile to save it.`, 7000);
    } else if (res.status === 409 && d?.error === 'newer' && d.save && !pinOnly) {
      busy = false;
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
      h('p', {}, 'Your case file saved online is further ahead than the game on this device.'),
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

/** Start syncing: push after changes, and ask a player without a PIN to set one. */
export async function initCloud() {
  try {
    try {
      const n = sessionStorage.getItem('floor14.cloud.loaded');
      if (n) { sessionStorage.removeItem('floor14.cloud.loaded'); setTimeout(() => toast(`Case file loaded. Welcome back, ${state().profile?.name || 'detective'}.`, 4500), 1200); }
    } catch { /* fine */ }
    onChange(() => { if (!adopting) schedule(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') push(); });
    if (!(await ready()) || !state().profile?.name) return;
    await push();
    setTimeout(() => askForPinIfMissing(), 2500);
  } catch { /* the game never notices */ }
}

// ---------- loading on this device ----------
/** Ask for the PIN of a found case file, open it, confirm, then load it here. */
async function pinAndLoad(found, typedName) {
  const name = found.name || typedName;
  if (!found.has_pin) {
    await modal({ title: 'This case file has no PIN yet', body: `"${name}" has not set a PIN, so it cannot be opened on another device yet. Open the game on the device you played on: it will ask you to choose a PIN. Then come back here.` });
    return false;
  }
  let note = '';
  for (;;) {
    const input = pinInput('Your 4-digit PIN');
    const body = h('div', { class: 'cloud-load' },
      h('p', {}, h('b', {}, name), h('br'), summaryOf(found.brief)),
      h('p', {}, 'Type your 4-digit PIN.'),
      input,
      note ? h('p', { class: 'cloud-warn' }, note) : null,
      h('p', { class: 'cloud-note' }, 'Forgot it? Change it in Settings on the device you played on, or ask the game owner to reset it.'));
    setTimeout(() => input.focus(), 60);
    const go = await modal({ title: 'Open your case file', body, buttons: [{ label: 'Cancel', value: false }, { label: 'Open', kind: 'primary', value: true }] });
    if (!go) return false;
    const pin = input.value.trim();
    if (!PIN_RE.test(pin)) { note = 'Type exactly 4 digits.'; continue; }
    const r = await loadWithPin(name, pin);
    if (r.ok && r.save) {
      const here = state();
      if (here.profile && here.playerId !== r.player_id) {
        const ok = await modal({ title: 'Replace this game?', body: h('div', { class: 'cloud-choice' },
          h('p', {}, `Load ${r.name}: ${summaryOf(r.save)}.`),
          h('p', { class: 'cloud-warn' }, `This replaces the game on this device (${here.profile.name}: ${summaryOf(here)}).`)),
        buttons: [{ label: 'Cancel', value: false }, { label: 'Load it here', kind: 'primary', value: true }] });
        if (!ok) return false;
      }
      adopt(r);
      return true;
    }
    if (r.error === 'wrong_pin') { note = r.left > 0 ? `Wrong PIN. ${r.left} ${r.left === 1 ? 'try' : 'tries'} left before the file locks for a while.` : 'Wrong PIN.'; continue; }
    if (r.error === 'locked') {
      const mins = Math.max(1, Math.ceil((r.retry_after || 900) / 60));
      await modal({ title: 'Case file locked', body: `Too many wrong PINs. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` });
      return false;
    }
    if (r.error === 'rate_limited') { note = 'Too many tries from here. Wait a minute.'; continue; }
    await modal({ title: 'Could not open it', body: 'The case files did not answer. Try again in a moment.' });
    return false;
  }
}

/** A detective signing up with a name that is already on file says "that is me": open it with the PIN. */
export const loadTaken = (found) => pinAndLoad(found, found.name);

/** Title-screen dialog: type the detective name, then the PIN, and the game continues here. */
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
      h('p', {}, 'Played on another phone or computer? Type the detective name you used there. You will need your 4-digit PIN too.'),
      input);
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
      const retry = await modal({ title: 'No case file under that name', body: `Nothing is filed as "${name}". Check the spelling (capitals do not matter).`, buttons: [{ label: 'Cancel', value: false }, { label: 'Try again', kind: 'primary', value: true }] });
      if (retry) continue;
      return;
    }
    await pinAndLoad(f, name);
    return;
  }
}
