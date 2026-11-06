// Leaderboard updates: tell the player when their overall rank changes.
//
// The last rank they saw is kept in the save as `boardSeen` (additive field, persisted by save(), so
// it follows a cloud save): { [board]: { rank, total, above: [names above, null = hidden], at } }.
// The leaderboard screen updates it per tab (and shows "up 2 since last time"); this module checks the
// overall board when the game opens and after a puzzle is solved or a case is closed, and shows
// "You moved up to #7 (+2)" or "Detective Ravi passed you: you are #8".
//
// Quiet rules: never while sharing is off (settings.shareProgress === false), never during a puzzle or
// a cinematic (it waits for the next calm screen), at most one notice every 10 minutes (a change that
// could not be shown yet is kept for later), not over an open dialog, and nothing the first time
// (there is nothing to compare).
import { state, save, onChange } from './state.js';
import { onNavigate, go } from './router.js';
import { fetchLeaderboard, sharing, backendReady } from './telemetry.js';
import { notice } from './notice.js';

const CALM = new Set(['title', 'office', 'map', 'board', 'closed', 'archive']);
const TOAST_GAP = 10 * 60_000;
const CHECK_GAP = 45_000;
const TOAST_KEY = 'floor14.rank.toastAt';

let screen = null;
let pending = false;
let checking = false;
let lastCheck = 0;
let timer = 0;
const dialogOpen = () => !!document.querySelector('#overlay .modal-backdrop');

const toastAt = () => { try { return Number(localStorage.getItem(TOAST_KEY)) || 0; } catch { return 0; } };
const setToastAt = (t) => { try { localStorage.setItem(TOAST_KEY, String(t)); } catch { /* ignore */ } };

/** The rank last seen on a board ('overall' or a case id), or null. */
export function seenBoard(id) {
  const b = state().boardSeen;
  const x = b && typeof b === 'object' ? b[id] : null;
  return x && Number.isFinite(x.rank) ? x : null;
}

/** Remember what the player has now seen on a board (from a leaderboard response's `near`). */
export function markSeen(id, near) {
  if (!near || !Number.isFinite(near.rank)) return;
  const above = (near.rows || []).filter((r) => r.rank < near.rank).map((r) => (r.anon ? null : r.name));
  const prev = seenBoard(id);
  if (prev && prev.rank === near.rank && prev.total === near.total && JSON.stringify(prev.above || []) === JSON.stringify(above)) return;
  const s = state();
  s.boardSeen = { ...(s.boardSeen && typeof s.boardSeen === 'object' ? s.boardSeen : {}), [id]: { rank: near.rank, total: near.total, above, at: Date.now() } };
  save();
}

/** "up 2 since last time" / "down 1 since last time" / null. */
export function sinceLastTime(prev, rank) {
  if (!prev || !Number.isFinite(rank) || prev.rank === rank) return null;
  const d = prev.rank - rank;
  return { up: d > 0, n: Math.abs(d), text: `${d > 0 ? 'up' : 'down'} ${Math.abs(d)} since last time` };
}

export const detectiveName = (name) => (/^(det\.?|detective|insp\.?|inspector|dr\.?|tuan|puan|encik|cik)\s/i.test(name) ? name : `Detective ${name}`);

/** The words for a change in rank, or null when there is none. */
export function rankMessage(prev, near) {
  if (!prev || !near) return null;
  const now = near.rank;
  const d = prev.rank - now;
  if (!d) return null;
  if (d > 0) return { kind: 'up', text: `You moved up to #${now} (+${d})`, sub: `${near.total} detectives ranked. Tap for the roster.` };
  const above = (near.rows || []).filter((r) => r.rank < now);
  const before = new Set((prev.above || []).filter(Boolean));
  const fresh = above.filter((r) => !r.anon && !before.has(r.name));
  let who = null;
  if (-d === 1) {
    const passer = fresh.length === 1 ? fresh[0] : above.find((r) => r.rank === now - 1);
    if (passer) who = passer.anon ? 'A detective' : detectiveName(passer.name);
  } else if (fresh.length === 1) who = `${detectiveName(fresh[0].name)} and ${-d - 1} other${-d - 1 === 1 ? '' : 's'}`;
  return {
    kind: 'down',
    text: who ? `${who} passed you: you are #${now}` : `You slipped to #${now} (−${-d})`,
    sub: 'Tap for the roster.',
  };
}

function schedule(ms = 1200) {
  clearTimeout(timer);
  timer = setTimeout(check, ms);
}

async function check() {
  if (!pending || checking || !sharing() || !state().profile || !CALM.has(screen)) return;
  if (dialogOpen()) { schedule(8000); return; } // wait until the player has dealt with it
  const now = Date.now();
  if (now - toastAt() < TOAST_GAP) return; // a change waits; checked again on a later calm screen
  if (now - lastCheck < CHECK_GAP) { schedule(CHECK_GAP - (now - lastCheck) + 50); return; }
  checking = true;
  lastCheck = now;
  try {
    const data = await fetchLeaderboard('overall');
    const near = data && data.ok ? data.near : null;
    if (!near) { pending = !data?.ok && data?.reason === 'error'; return; }
    const prev = seenBoard('overall');
    const msg = rankMessage(prev, near);
    if (!msg) { markSeen('overall', near); pending = false; return; }
    // the player may have opened a puzzle while we asked: keep the news for the next calm screen
    if (!CALM.has(screen) || !sharing()) return;
    if (dialogOpen()) { schedule(8000); return; }
    pending = false;
    setToastAt(Date.now());
    markSeen('overall', near);
    notice({
      id: 'rank',
      kind: msg.kind,
      text: msg.text,
      sub: msg.sub,
      ms: 7000,
      onClick: () => go('leaderboard', screen === 'title' ? { back: 'title' } : {}),
    });
  } catch {
    /* the game never notices */
  } finally {
    checking = false;
  }
}

const closedCount = (s) => Object.values(s.cases || {}).filter((c) => c && c.status === 'closed').length;

let started = false;
export function initRankWatch() {
  if (started) return;
  started = true;
  let solved = state().solvedTotal || 0;
  let closed = closedCount(state());
  onChange((s) => {
    const n = s.solvedTotal || 0;
    const c = closedCount(s);
    if (n > solved || c > closed) {
      pending = true;
      schedule(2500); // after telemetry has sent the solve
    }
    solved = n;
    closed = c;
  });
  onNavigate((name) => {
    screen = name;
    if (pending && CALM.has(name)) schedule(1500);
  });
  // when the game opens
  backendReady().then((ok) => {
    if (!ok) return;
    pending = true;
    schedule(5000);
  });
}
