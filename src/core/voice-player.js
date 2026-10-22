// Voiced dialogue for the cinematics. Asks the server once per session whether voices are on
// (GET api/voice/status), then plays api/voice/<id>?v=<version> for each line it knows about.
// Every failure is quiet: the game falls back to captions only and stops asking for the session.
//
// One <audio> element is reused for every line. Mobile browsers only let an element play sound if it
// was started inside a tap, so unlockVoice() is called from taps (see unlockCinemaVideo in cinema.js).
import { state, onChange } from './state.js';
import { lineIdCandidates, isVoiceable, PLAYER, portraitOf } from './voice.js';

const STATUS_URL = 'api/voice/status';
const SILENCE = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA';
const MAX_CACHED = 40; // object URLs kept in memory
const FETCH_TIMEOUT = 12_000; // a line that is not yet generated can take a few seconds

let ready = null; // Promise<boolean>
let off = false; // given up for this session
let version = 0;
let voiced = new Set();
let lines = null; // manifest lines (id -> { voice, ... })
let strikes = 0; // network errors in a row
const failed = new Set(); // ids that will not play this session
const cache = new Map(); // id -> { promise: Promise<string|null>, url: string|null }
let el = null;
let unlocked = false;
let current = null; // the line playing now

export const voicesOn = () => state().settings.voices !== false;
export const voiceVolume = () => {
  const v = Number(state().settings.voiceVolume);
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1;
};

function audioEl() {
  if (!el) {
    el = new Audio();
    el.preload = 'auto';
    el.setAttribute('aria-hidden', 'true');
  }
  return el;
}

/** Call inside a user gesture (tap / click / key) so later lines may play with sound on iOS. */
export function unlockVoice() {
  if (unlocked || off) return;
  const a = audioEl();
  if (current) return;
  unlocked = true;
  a.muted = true;
  a.src = SILENCE;
  const p = a.play();
  if (p && p.then) p.then(() => { if (!current) a.pause(); a.muted = false; }).catch(() => { a.muted = false; unlocked = false; });
  else a.muted = false;
}

function giveUp() {
  off = true;
  stopVoice();
  for (const e of cache.values()) if (e.url) URL.revokeObjectURL(e.url);
  cache.clear();
}

/** Ask the server once whether voices are available. Resolves true/false, never rejects. */
export function initVoices() {
  if (ready) return ready;
  if (off || typeof fetch !== 'function' || typeof Audio === 'undefined') return (ready = Promise.resolve(false));
  ready = (async () => {
    try {
      const res = await fetch(STATUS_URL, { cache: 'no-store', headers: { accept: 'application/json' } });
      if (!res.ok) return false;
      let s = null;
      try { s = JSON.parse(await res.text()); } catch { return false; } // a static host's index.html
      if (!s || s.ok !== true || !Array.isArray(s.voiced) || !s.voiced.length) return false;
      version = Number(s.v) || 0;
      voiced = new Set(s.voiced);
      lines = (await import('../data/voice-manifest.json')).default.lines || {};
      return true;
    } catch {
      return false;
    }
  })().then((ok) => {
    if (!ok) off = true;
    return ok;
  });
  return ready;
}

/**
 * What this line plays: its manifest id, or "<id>@det_0N" for the player's own lines ("You"), which
 * are voiced to match the chosen detective portrait. null when it has no voice right now.
 * Every other speaker's URL is the same for all players, so their audio is shared in every cache.
 */
export function voiceIdFor(line) {
  if (off || !lines || !line || !voicesOn() || !isVoiceable(line)) return null;
  const profile = state().profile;
  for (const id of lineIdCandidates(line, { you: profile?.name })) {
    const e = lines[id];
    if (!e) continue;
    const d = e.voice === PLAYER ? portraitOf(profile) : null;
    const key = d ? `${id}@${d}` : id;
    const speaks = d ? voiced.has(`${PLAYER}@${d}`) : voiced.has(e.voice);
    return speaks && !failed.has(key) ? key : null;
  }
  return null;
}
// v: the voice map version (changes when voices or live directions change); r: the line's revision in this
// build (changes when its text or written direction changes); d: the player's portrait, player lines only
const lineUrl = (key) => {
  const [id, d] = key.split('@');
  const r = lines?.[id]?.rev;
  return `api/voice/${id}?v=${version}${r ? `&r=${r}` : ''}${d ? `&d=${d}` : ''}`;
};

function remember(id, entry) {
  cache.set(id, entry);
  while (cache.size > MAX_CACHED) {
    const [oldId, old] = cache.entries().next().value;
    if (current && current.id === oldId) break;
    cache.delete(oldId);
    if (old.url) URL.revokeObjectURL(old.url);
  }
}

/** Fetch a line's audio once; resolves to an object URL, or null if it will not play. */
function load(id) {
  const have = cache.get(id);
  if (have) {
    cache.delete(id); // refresh its place in the LRU
    cache.set(id, have);
    return have.promise;
  }
  const entry = { url: null, promise: null };
  entry.promise = (async () => {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = ctl ? setTimeout(() => ctl.abort(), FETCH_TIMEOUT) : null;
    try {
      const res = await fetch(lineUrl(id), ctl ? { signal: ctl.signal } : {});
      if (!res.ok) {
        if (res.status === 503 || res.status === 403 || res.status === 401) giveUp();
        else if (res.status !== 429) failed.add(id); // 404 unvoiced/unknown, 502 generation failed
        cache.delete(id);
        return null;
      }
      const type = (res.headers.get('content-type') || '').toLowerCase();
      if (!type.startsWith('audio/')) { giveUp(); return null; }
      const blob = await res.blob();
      strikes = 0;
      if (off) return null;
      entry.url = URL.createObjectURL(blob);
      return entry.url;
    } catch {
      cache.delete(id);
      if (++strikes >= 3) giveUp();
      return null;
    } finally {
      if (t) clearTimeout(t);
    }
  })();
  remember(id, entry);
  return entry.promise;
}

/** Start loading these lines' audio (the current and next panel). */
export function prefetchLines(list) {
  if (off || !lines) return;
  for (const line of list || []) {
    const id = voiceIdFor(line);
    if (id) load(id);
  }
}

/** Stop the line that is playing (if any). */
export function stopVoice() {
  const c = current;
  current = null;
  if (el) {
    el.onended = el.onerror = el.onpause = null;
    try { el.pause(); } catch { /* nothing playing */ }
  }
  if (c) c.finish('stopped');
}

/**
 * Speak a line. Returns null when the line has no voice; otherwise
 *   { id, started: Promise<boolean>, ended: Promise<'ended'|'error'|'stopped'>, stop() }
 * `started` is false if the audio is not playing within maxWait ms (then the captions carry on alone).
 * onBlocked() is called when the browser refuses sound until the next tap.
 */
export function speak(line, { maxWait = 2500, onBlocked } = {}) {
  // still asking the server (a tap in the first moment of the intro): decide once it answers
  const pending = !lines && ready && !off;
  const id = pending ? null : voiceIdFor(line);
  if (!id && !pending) return null;
  stopVoice();
  let finish, start;
  const ended = new Promise((r) => (finish = r));
  const started = new Promise((r) => (start = r));
  const me = { id, finish: (why) => { start(false); finish(why); } };
  current = me;
  const giveUpAt = setTimeout(() => { if (current === me && !me.playing) { current = null; me.finish('stopped'); } }, maxWait);
  const lineId = pending
    ? ready.then(() => voiceIdFor(line))
    : Promise.resolve(id);
  lineId.then((lid) => (lid ? load((me.id = lid)) : null)).then((url) => {
    if (current !== me) return;
    if (!url) { clearTimeout(giveUpAt); current = null; me.finish('error'); return; }
    const a = audioEl();
    a.onended = () => { if (current === me) { current = null; finish('ended'); } };
    a.onerror = () => { if (current === me) { current = null; me.finish('error'); } };
    a.muted = false;
    a.volume = voiceVolume();
    a.src = url;
    try { a.currentTime = 0; } catch { /* not seekable yet */ }
    const p = a.play();
    const ok = () => { if (current !== me) { a.pause(); return; } clearTimeout(giveUpAt); me.playing = true; start(true); };
    if (p && p.then) {
      p.then(ok).catch((err) => {
        if (current !== me) return;
        clearTimeout(giveUpAt);
        current = null;
        if (err?.name === 'NotAllowedError') { unlocked = false; onBlocked?.(); }
        me.finish('error');
      });
    } else ok();
  });
  return { id, started, ended, stop: () => { if (current === me) stopVoice(); } };
}

/** Pause / resume with the page (tab hidden). */
export function pauseVoice(paused) {
  if (!el || !current || !current.playing) return;
  if (paused) el.pause();
  else el.play().catch(() => {});
}

onChange(() => {
  if (!el) return;
  el.volume = voiceVolume();
  if (!voicesOn()) stopVoice();
});
