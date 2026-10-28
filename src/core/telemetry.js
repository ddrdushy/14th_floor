// Anonymous progress for the leaderboard and the owner's play statistics.
// Watches the save (state.js onChange) and reports what changed: a case opened, a puzzle solved,
// a case closed with its verdict, the detective name shown or hidden. Nothing on any screen calls in here.
//
// - An anonymous player id (crypto.randomUUID) lives in the save as `playerId` and in this module's
//   own small store, so it survives "New game".
// - Events queue up and go out in batches (fetch keepalive; sendBeacon when the page hides).
//   Failures retry later with backoff. Nothing here ever throws or blocks the game.
// - It asks /api/status once per page load. On a static host (vite preview, file://) that is a static
//   file saying {"ok":false}, so telemetry stays off without a single failed request.
// - Settings: "Share anonymous progress" (settings.shareProgress, default on) and
//   "Show my detective name on the leaderboard" (settings.showOnBoard, default off).
// - What has been reported is compared with the save, never trusted blindly: anything the save no
//   longer has (after "New game") is forgotten, so it is reported again when it happens again.
import { state, save, onChange } from './state.js';
import { CASES } from '../data/cases.js';
import { isDev } from './ui.js';

const STORE = 'floor14.telemetry.v1';
const API = './api';
const MAX_QUEUE = 300;
const MAX_BATCH = 50;
const MAX_BYTES = 7800; // the server takes 8 KB
const VERSION = 1;

let store = loadStore(); // { playerId, reported: { [caseId]: { open, levels: {}, closedAt } }, profileKey, queue: [] }
let status = 'unknown'; // unknown | checking | on | off
let statusPromise = null;
let sending = false;
let backoff = 0;
let retryTimer = 0;
let diffTimer = 0;
let lastShare = null;

function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (s && typeof s === 'object') return { reported: {}, queue: [], ...s, queue: Array.isArray(s.queue) ? s.queue : [] };
  } catch { /* storage blocked or corrupt */ }
  return { reported: {}, queue: [] };
}
function persist() {
  try { localStorage.setItem(STORE, JSON.stringify(store)); } catch { /* session only */ }
}

const uuid = () => {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch { /* insecure context */ }
  const b = new Uint8Array(16);
  (globalThis.crypto?.getRandomValues ? crypto.getRandomValues(b) : b.forEach((_, i) => { b[i] = Math.random() * 256; }));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const x = [...b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
};

const settings = () => state().settings || {};
export const sharing = () => settings().shareProgress !== false;
export const showingName = () => settings().showOnBoard === true;
const isDevSession = () => { try { return isDev(); } catch { return false; } };

/**
 * Take over another device's player id and mark everything in `saveData` as already reported
 * (used when a cloud save is loaded on this device, just before the page reloads).
 */
export function adoptPlayer(id, saveData) {
  const reported = {};
  for (const [caseId, cs] of Object.entries(saveData?.cases || {})) {
    if (!cs || typeof cs !== 'object') continue;
    const levels = {};
    for (const lid of Object.keys(cs.solved || {})) levels[lid] = 1;
    reported[caseId] = { open: 1, levels, ...(cs.status === 'closed' && cs.closedAt ? { closedAt: cs.closedAt } : {}) };
  }
  store = { playerId: id, reported, queue: [], profileKey: null };
  persist();
}

/** The anonymous player id (created on first use, kept across "New game"). */
export function playerId() {
  const s = state();
  const id = (typeof s.playerId === 'string' && s.playerId) || store.playerId || uuid();
  if (store.playerId !== id) { store.playerId = id; persist(); }
  if (s.playerId !== id) s.playerId = id; // saved with the next save()
  return id;
}

// ---------- verdicts ----------
// Right when every guilty party is charged, nobody innocent is, and the extra answers hold, judged by
// the flags the case itself sets (src/data/*.js `flags()`). The server checks the same rules.
const RULES = {
  case01: (f) => !f.JASON_FREE && !f.RIZAL_FREE && !f.SHANTI_WRONGED,
  side01: (f) => !f.BOBBY_FREE && !f.AHLAN_WRONGED && !f.RAVI_WRONGED,
  case02: (f) => !f.TONY_FREE && !f.NORHAYATI_FREE && !f.FAIZAL_WRONGED && !!f.AZMAN_ALIVE,
  case03: (f) => !f.MELISSA_FREE && !f.SHAHRUL_FREE && !f.KENNY_WRONGED && !f.CHEAH_WRONGED && !!f.BODY_NAMED,
  case04: (f) => !f.SHEHANI_FREE && !f.KASUN_FREE && !f.MOHAN_WRONGED && !f.RAJAN_HUNTED && !!f.BOOK_FOUND,
  case05: (f) => !f.VIVIAN_FREE && !f.ZUL_FREE && !f.KHAIRUL_WRONGED && !f.DANIEL_CHARGED && !!f.DANIEL_FOUND,
};
export function verdictCorrect(caseId, charged = [], answers = {}) {
  const c = CASES[caseId];
  const rule = RULES[caseId];
  if (!c || !rule || typeof c.flags !== 'function') return false;
  try {
    return !!rule(c.flags({ charged, answers }) || {});
  } catch {
    return false;
  }
}

// ---------- queue ----------
function enqueue(type, fields = {}) {
  store.queue.push({ type, at: Date.now(), ...fields });
  if (store.queue.length > MAX_QUEUE) {
    // keep progress; drop the oldest session markers first, then the oldest of anything
    const i = store.queue.findIndex((e) => e.type === 'session_start');
    store.queue.splice(i >= 0 ? i : 0, 1);
  }
}

/** Compare the save with what was reported and queue the difference. */
function diff() {
  const s = state();
  const rep = store.reported;
  const cases = s.cases || {};
  // forget what the save no longer has (a new game), so it is reported again when it happens again
  for (const id of Object.keys(rep)) {
    const cs = cases[id];
    if (!cs) { delete rep[id]; continue; }
    for (const lid of Object.keys(rep[id].levels || {})) if (!cs.solved?.[lid]) delete rep[id].levels[lid];
  }
  for (const [caseId, cs] of Object.entries(cases)) {
    if (!cs || typeof cs !== 'object') continue;
    const r = (rep[caseId] ||= { levels: {} });
    r.levels ||= {};
    if (!r.open) {
      enqueue('case_open', { case_id: caseId, at: cs.openedAt || Date.now() });
      r.open = 1;
    }
    for (const [lid, x] of Object.entries(cs.solved || {})) {
      if (r.levels[lid]) continue;
      enqueue('level_solved', { case_id: caseId, level_id: lid, at: x?.at || Date.now(), data: { time: x?.time || 0, hints: x?.hints || 0 } });
      r.levels[lid] = 1;
    }
    if (cs.status === 'closed' && cs.closedAt && r.closedAt !== cs.closedAt) {
      const charged = Array.isArray(cs.accusation) ? cs.accusation : [];
      const answers = cs.answers || {};
      const levels = {};
      for (const [lid, x] of Object.entries(cs.solved || {})) levels[lid] = { time: x?.time || 0, hints: x?.hints || 0 };
      enqueue('case_closed', { case_id: caseId, at: cs.closedAt, data: { charged, answers, levels, correct: verdictCorrect(caseId, charged, answers) } });
      r.closedAt = cs.closedAt;
    }
  }
  // `name` goes on the public leaderboard only when the player chose to show it; `profile` (the same
  // name) is private: the owner's dashboard and the cloud save
  if (s.profile) {
    const show = showingName() && !!s.profile.name;
    const key = `p:${show ? 1 : 0}:${s.profile.name || ''}`;
    if (store.profileKey !== key) {
      enqueue('profile_set', { data: { show, name: show ? s.profile.name : null, profile: s.profile.name || null } });
      store.profileKey = key;
    }
  }
  persist();
}

function batchOf(queue) {
  const out = [];
  let bytes = 80;
  for (const e of queue) {
    const n = JSON.stringify(e).length + 1;
    if (out.length >= MAX_BATCH || bytes + n > MAX_BYTES) break;
    out.push(e);
    bytes += n;
  }
  if (!out.length && queue.length) out.push(queue[0]); // one oversized event: the server will skip it
  return out;
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  backoff = Math.min(backoff ? backoff * 2 : 15_000, 10 * 60_000);
  retryTimer = setTimeout(() => flush(), backoff);
}

/** Send what is queued. Resolves when done (or when there is nothing to do); never rejects. */
export async function flush({ beacon = false, force = false } = {}) {
  try {
    if (status !== 'on' || (!sharing() && !force) || !store.queue.length) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { scheduleRetry(); return; }
    const batch = batchOf(store.queue);
    const body = JSON.stringify({ player_id: playerId(), events: batch });
    const drop = () => {
      store.queue.splice(0, batch.length);
      persist();
    };
    if (beacon && navigator.sendBeacon) {
      if (navigator.sendBeacon(`${API}/track`, new Blob([body], { type: 'text/plain' }))) drop();
      return;
    }
    if (sending) return;
    sending = true;
    let res = null;
    try {
      res = await fetch(`${API}/track`, { method: 'POST', body, keepalive: body.length < 60_000, credentials: 'same-origin', headers: { 'content-type': 'application/json' } });
    } catch {
      res = null;
    } finally {
      sending = false;
    }
    if (!res) { scheduleRetry(); return; }
    if (res.ok) {
      drop();
      backoff = 0;
      if (store.queue.length) setTimeout(() => flush(), 1000);
    } else if (res.status === 400 || res.status === 413) {
      drop(); // malformed or too big: sending it again will not help
    } else if (res.status === 404 || res.status === 405 || res.status === 503) {
      status = 'off'; // no backend here (or no database bound): stay quiet for this page load
    } else {
      scheduleRetry(); // 429, 5xx
    }
  } catch {
    /* never let telemetry reach the game */
  }
}

/** Is the backend reachable? Asked once per page load; resolves true/false, never rejects. */
export function backendReady() {
  if (status === 'on') return Promise.resolve(true);
  if (status === 'off') return Promise.resolve(false);
  if (!statusPromise) {
    status = 'checking';
    statusPromise = (async () => {
      try {
        if (!/^https?:$/.test(location.protocol)) throw new Error('no http');
        const res = await fetch(`${API}/status`, { cache: 'no-store', credentials: 'same-origin' });
        const data = res.ok ? await res.json() : null;
        status = data && data.ok === true ? 'on' : 'off';
      } catch {
        status = 'off';
      }
      return status === 'on';
    })();
  }
  return statusPromise;
}

function onSave() {
  try {
    const share = sharing();
    if (lastShare === true && !share && store.profileKey && store.profileKey !== '0') {
      // sharing just turned off: take the name off the board, then go quiet
      store.queue = [{ type: 'profile_set', at: Date.now(), data: { show: false, name: null } }];
      store.profileKey = '0';
      persist();
      flush({ force: true }).then(() => { if (!sharing()) { store.queue = []; persist(); } });
      lastShare = share;
      return;
    }
    if (!share && lastShare !== false) { store.queue = []; persist(); }
    lastShare = share;
    if (!share || status !== 'on') return;
    clearTimeout(diffTimer);
    diffTimer = setTimeout(() => {
      diff();
      flush();
    }, 400);
  } catch { /* ignore */ }
}

let started = false;
/** Start watching the save. Safe to call more than once; does nothing without a backend. */
export async function initTelemetry() {
  if (started) return;
  started = true;
  try {
    lastShare = sharing();
    onChange(onSave);
    if (!(await backendReady())) return;
    const bye = () => { if (document.visibilityState === 'hidden') flush({ beacon: true }); };
    document.addEventListener('visibilitychange', bye);
    window.addEventListener('pagehide', () => flush({ beacon: true }));
    window.addEventListener('online', () => flush());
    if (!sharing()) return;
    const s = state();
    const had = s.playerId;
    playerId();
    if (!had && s.profile) save(); // keep the id in the save (additive field)
    enqueue('session_start', { data: { dev: isDevSession(), v: VERSION, lang: (navigator.language || '').slice(0, 16) } });
    diff();
    flush();
  } catch { /* the game never notices */ }
}

/**
 * The leaderboard for a case ('overall' for all cases). Resolves { ok, rows, total, you } or
 * { ok: false, reason: 'offline' | 'error' }. Sends anything queued first, so a case just closed shows up.
 */
export async function fetchLeaderboard(caseId = 'overall') {
  try {
    if (!(await backendReady())) return { ok: false, reason: 'offline' };
    if (sharing()) {
      diff();
      await flush();
    }
    const q = new URLSearchParams({ case: caseId });
    if (sharing()) q.set('me', playerId());
    const res = await fetch(`${API}/leaderboard?${q}`, { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) return { ok: false, reason: res.status === 503 || res.status === 404 ? 'offline' : 'error' };
    const data = await res.json();
    return data && data.ok ? data : { ok: false, reason: 'error' };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
