// Music: real audio tracks in public/assets/audio/music_<cue>.(m4a|mp3|ogg|wav), with crossfades.
//
//   music.play('office')   crossfade to a cue (no-op if it is already playing)
//   music.stop()           fade out
//   music.duck(0.35)       dip the music under dialogue or a big sound; music.unduck() restores it
//   music.setVolume(0..1), music.setEnabled(bool)   saved in state.settings (musicVolume, music)
//
// Three persistent <audio> "decks" are routed through the shared Web Audio context, so a crossfade
// is just gain ramps. All decks are unlocked inside the first user gesture (iOS needs this), after
// which any cue can start at any time. Tracks that are not seamless loops (xloop) are looped by
// crossfading into a fresh copy a few seconds before the end. A missing or undecodable file is not an
// error: the lookup moves on to the next format, and if none plays the game simply stays quiet (or
// the current track keeps playing).
import { state, save } from './state.js';
import { audioContext } from './audio.js';

export const CUES = {
  title: { file: 'music_title', gain: 1, xloop: true },
  office: { file: 'music_office', gain: 0.85, xloop: true },
  intro: { file: 'music_intro', gain: 0.9 },
  puzzle: { file: 'music_puzzle', gain: 0.55, xloop: true }, // long puzzles: keep it low
  tension: { file: 'music_tension', gain: 0.85, xloop: true },
  closed: { file: 'music_closed', gain: 0.9 },
  fire: { file: 'music_fire', gain: 1, loop: false }, // plays once, then back to the previous cue
};

// story cues used in case data, mapped onto the tracks we have
const ALIASES = {
  investigation: 'puzzle',
  port: 'intro',
  panic: 'fire',
  memory: 'closed',
  deduction: 'tension',
  resolution: 'closed',
};

const BASE = 'assets/audio/';
// first match wins; the MIME check skips formats this browser cannot decode (e.g. AAC in plain Chromium)
const FORMATS = [['mp3', 'audio/mpeg'], ['m4a', 'audio/mp4; codecs="mp4a.40.2"'], ['ogg', 'audio/ogg'], ['wav', 'audio/wav']];
const LOOP_FADE = 2.5; // seconds of overlap at the loop point for xloop cues
const RESUME_WINDOW = 150; // come back to a cue within this many seconds and it resumes where it was

// 0.1 s of silence, used to unlock the decks inside the first gesture
const SILENCE = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA';

const found = new Map(); // cue -> Promise<url|null>
const memory = new Map(); // cue -> { time, at }
let decks = null;
let live = null; // deck currently audible
let wanted = null; // cue the game wants right now
let lastLoop = null; // last looping cue, for returning after a stinger
let gestured = false;
let ctx = null;
let bus = null; // music volume
let duckNode = null;

const settings = () => state().settings;
const level = () => {
  const s = settings();
  if (s.music === false) return 0;
  const v = Number(s.musicVolume);
  const lin = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.6;
  return lin * lin; // perceptual curve for the slider
};
const cueGain = (cue) => CUES[cue]?.gain ?? 1;

/** Find the first playable file for a cue. Resolves to a URL or null. */
function locate(cue) {
  if (found.has(cue)) return found.get(cue);
  const cfg = CUES[cue];
  const probe = document.createElement('audio');
  const candidates = cfg ? FORMATS.filter(([, mime]) => probe.canPlayType(mime)).map(([ext]) => `${BASE}${cfg.file}.${ext}`) : [];
  const p = (async () => {
    for (const url of candidates) {
      if (await loads(url)) return url;
    }
    return null;
  })();
  found.set(cue, p);
  return p;
}

function loads(url) {
  return new Promise((resolve) => {
    const a = document.createElement('audio');
    a.preload = 'metadata';
    let t = null;
    const done = (ok) => {
      clearTimeout(t);
      a.onloadedmetadata = a.onerror = null;
      a.removeAttribute('src');
      try { a.load(); } catch { /* ignore */ }
      resolve(ok);
    };
    a.onloadedmetadata = () => done(a.duration > 0);
    a.onerror = () => done(false);
    t = setTimeout(() => done(false), 15000);
    a.src = url;
  });
}

function makeDeck(i) {
  const el = document.createElement('audio');
  el.preload = 'auto';
  el.crossOrigin = 'anonymous';
  const deck = { i, el, cue: null, gain: null, fadeTimer: null, handedOff: false };
  el.addEventListener('ended', () => onEnded(deck));
  el.addEventListener('timeupdate', () => checkLoop(deck));
  return deck;
}

function wire() {
  if (decks) return;
  decks = [makeDeck(0), makeDeck(1), makeDeck(2)];
  ctx = audioContext();
  if (!ctx) return; // no Web Audio: fall back to element volume
  try {
    bus = ctx.createGain();
    duckNode = ctx.createGain();
    bus.gain.value = level();
    bus.connect(duckNode).connect(ctx.destination);
    for (const d of decks) {
      d.gain = ctx.createGain();
      d.gain.gain.value = 0;
      ctx.createMediaElementSource(d.el).connect(d.gain).connect(bus);
    }
  } catch {
    ctx = null;
    bus = null;
    for (const d of decks) d.gain = null;
  }
}

function ramp(deck, to, seconds) {
  if (deck.gain && ctx) {
    const g = deck.gain.gain;
    const now = ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(to, now + Math.max(0.02, seconds));
  } else {
    // element-volume fallback: no fades, just the right level
    deck.el.volume = Math.max(0, Math.min(1, to * level()));
  }
}

function remember(deck) {
  if (deck.cue && deck.el.currentTime > 0) memory.set(deck.cue, { time: deck.el.currentTime, at: performance.now() });
}

function fadeOut(deck, seconds, { keep = true } = {}) {
  if (!deck || !deck.cue) return;
  if (keep) remember(deck);
  ramp(deck, 0, seconds);
  clearTimeout(deck.fadeTimer);
  deck.fadeTimer = setTimeout(() => {
    deck.el.pause();
    deck.cue = null;
    deck.fadeTimer = null;
  }, seconds * 1000 + 80);
}

/** A deck that is free (or the quietest one that is not live). */
function pickDeck() {
  return decks.find((d) => d !== live && !d.cue) || decks.find((d) => d !== live && d.fadeTimer) || decks.find((d) => d !== live);
}

function load(deck, cue, url, at) {
  clearTimeout(deck.fadeTimer);
  deck.fadeTimer = null;
  deck.cue = cue;
  deck.handedOff = false;
  deck.el.loop = CUES[cue].loop !== false; // xloop cues also loop natively, as a safety net
  if (!deck.el.src.endsWith(url)) deck.el.src = url;
  try { deck.el.currentTime = at; } catch { /* set once metadata loads */ }
  if (at) deck.el.addEventListener('loadedmetadata', () => { try { deck.el.currentTime = at; } catch { /* ignore */ } }, { once: true });
  if (deck.gain) deck.gain.gain.value = 0;
  ramp(deck, 0, 0.01);
}

async function begin(deck, fade) {
  if (document.hidden || level() === 0) return; // resumes on visibility / when re-enabled
  try {
    await deck.el.play();
  } catch {
    return; // autoplay refused: the next gesture calls unlock() and tries again
  }
  if (deck.cue) ramp(deck, cueGain(deck.cue), fade);
}

async function start(cue, { fade = 2.2, restart = false } = {}) {
  const cfg = CUES[cue];
  if (!cfg || !decks) return;
  if (live && live.cue === cue && !live.el.paused) return; // already playing
  const url = await locate(cue);
  if (wanted !== cue) return; // the game moved on while we were looking
  if (!url) return; // missing file: keep whatever is playing
  if (live && live.cue === cue && !live.el.paused) return;
  const mem = memory.get(cue);
  const resumeAt = !restart && cfg.loop !== false && mem && performance.now() - mem.at < RESUME_WINDOW * 1000 ? mem.time : 0;
  const deck = pickDeck();
  const old = live;
  live = deck;
  load(deck, cue, url, resumeAt);
  if (old && old !== deck) fadeOut(old, fade);
  if (cfg.loop !== false) lastLoop = cue;
  begin(deck, fade);
}

/** xloop: a few seconds before the end, crossfade into a fresh copy from the top. */
function checkLoop(deck) {
  if (deck !== live || !deck.cue || deck.handedOff) return;
  const cfg = CUES[deck.cue];
  const d = deck.el.duration;
  if (!cfg?.xloop || !(d > LOOP_FADE * 4) || deck.el.paused) return;
  if (d - deck.el.currentTime > LOOP_FADE + 0.3) return;
  deck.handedOff = true;
  const url = deck.el.currentSrc || deck.el.src;
  const next = pickDeck();
  live = next;
  load(next, deck.cue, url, 0);
  fadeOut(deck, LOOP_FADE, { keep: false });
  begin(next, LOOP_FADE);
}

function onEnded(deck) {
  if (deck !== live) return;
  const cue = deck.cue;
  deck.cue = null;
  memory.delete(cue);
  if (wanted === cue && lastLoop && lastLoop !== cue) {
    wanted = lastLoop;
    start(lastLoop, { fade: 1.6 });
  }
}

export const music = {
  cues: Object.keys(CUES),

  /** Crossfade to a cue. Safe to call before the first gesture: it starts on unlock. */
  play(cue, opts) {
    cue = ALIASES[cue] || cue;
    if (!cue || !CUES[cue]) return;
    wanted = cue;
    locate(cue); // look for the file now, so it is ready when it is needed
    if (!gestured) return;
    start(cue, opts);
  },

  stop(fade = 1.6) {
    wanted = null;
    if (live) fadeOut(live, fade);
    live = null;
  },

  /** Call inside a user gesture (pointerdown/keydown). Unlocks the decks and starts the wanted cue. */
  unlock() {
    if (gestured) return;
    gestured = true;
    wire();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    for (const d of decks) {
      if (d.el.src) continue;
      d.el.src = SILENCE;
      const p = d.el.play();
      if (p && p.then) p.then(() => { if (!d.cue) d.el.pause(); }).catch(() => {});
    }
    if (wanted) start(wanted);
  },

  /** Dip the music, e.g. under a voice line. 0 = silent, 1 = no dip. */
  duck(amount = 0.35, seconds = 0.4) {
    if (!duckNode || !ctx) return;
    duckNode.gain.setTargetAtTime(Math.max(0, Math.min(1, amount)), ctx.currentTime, seconds / 3);
  },
  unduck(seconds = 0.8) {
    if (!duckNode || !ctx) return;
    duckNode.gain.setTargetAtTime(1, ctx.currentTime, seconds / 3);
  },

  setVolume(v) {
    settings().musicVolume = Math.max(0, Math.min(1, Number(v) || 0));
    save();
    this.apply();
  },

  setEnabled(on) {
    settings().music = !!on;
    save();
    this.apply();
  },

  /** Re-read settings: volume, mute, and resume a muted cue when music comes back on. */
  apply() {
    if (bus && ctx) bus.gain.setTargetAtTime(level(), ctx.currentTime, 0.08);
    else if (live?.cue) live.el.volume = Math.max(0, Math.min(1, cueGain(live.cue) * level()));
    if (!gestured) return;
    if (level() === 0) {
      decks?.forEach((d) => d.el.pause());
    } else if (wanted) {
      if (live && live.cue === wanted && live.el.paused) begin(live, 0.6);
      else if (!live || live.cue !== wanted) start(wanted);
    }
  },

  get current() { return live?.cue && !live.el.paused ? live.cue : null; },
  get wanted() { return wanted; },
  /** For debugging: what each deck is doing. */
  debug() {
    return decks?.map((d) => ({ cue: d.cue, t: Math.round(d.el.currentTime * 10) / 10, paused: d.el.paused, gain: d.gain ? Math.round(d.gain.gain.value * 100) / 100 : d.el.volume, live: d === live, src: d.el.src.split('/').pop().slice(0, 24) }));
  },
  /** For testing: jump the live track to a time (negative = seconds before the end). */
  seek(t) {
    if (!live) return;
    const d = live.el.duration || 0;
    live.el.currentTime = t < 0 ? Math.max(0, d + t) : t;
  },
  /** Resolves to the URL a cue will play, or null if its file is missing. */
  locate,
};

document.addEventListener('visibilitychange', () => {
  if (!live) return;
  if (document.hidden) {
    decks.forEach((d) => d.el.pause());
  } else if (gestured && level() > 0 && live.cue) {
    begin(live, 1.2);
  }
});
