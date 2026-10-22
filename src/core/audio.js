// Procedural sound: monsoon rain, thunder, phone buzz and UI cues. No audio files needed.
// Music (real audio files) lives in music.js and shares this AudioContext.
import { state } from './state.js';

let ctx = null;
let master = null;
let rainNodes = null;
let noiseBuf = null;
let gestured = false; // browsers only allow audio after a user gesture
let pendingRain = null; // rain asked for before the first gesture

// Weather sits under everything else: callers pass a "scene" level, this keeps it a quiet bed.
const RAIN_SCALE = 0.4;
const DUCK = 0.35; // rain while someone is speaking
const THUNDER_GAP = 14; // seconds between the end of one roll and the start of the next
let rainLevel = 0; // the caller's level, before scale and duck
let ducked = false;
let hush = false; // a video clip with its own sound is playing
let thunderFreeAt = 0; // ctx time when the last roll has died away
const rainTarget = () => rainLevel * RAIN_SCALE * (ducked ? DUCK : 1);

function ensure() {
  if (ctx) return ctx;
  if (!gestured) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = sfxLevel();
  master.connect(ctx.destination);
  const len = ctx.sampleRate * 2;
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

const enabled = () => state().settings.sound;
const sfxLevel = () => {
  const v = Number(state().settings.sfxVolume);
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.8;
};

/** The shared AudioContext, or null before the first user gesture. */
export const audioContext = () => ensure();
export const hasGesture = () => gestured;

/** Apply settings.sfxVolume to rain, thunder and UI cues. */
export function applySfxVolume() {
  if (!master || !ctx) return;
  master.gain.setTargetAtTime(sfxLevel(), ctx.currentTime, 0.05);
}

// a hidden tab goes quiet (rain, thunder, music); it picks up again when the player returns
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else ctx.resume().catch(() => {});
});

export function unlock() {
  gestured = true;
  const c = ensure();
  if (c && c.state === 'suspended') c.resume();
  if (pendingRain != null) { const l = pendingRain; pendingRain = null; startRain(l); }
}

function noise() {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  return src;
}

export function startRain(level = 0.22) {
  if (enabled() && !gestured) { pendingRain = level; return; }
  if (!enabled() || !ensure()) return;
  rainLevel = level;
  if (rainNodes) {
    rainNodes.gain.gain.setTargetAtTime(rainTarget(), ctx.currentTime, 0.8);
    return;
  }
  const src = noise();
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 900;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(hp).connect(lp).connect(gain).connect(master);
  // a second, deeper layer for the roof
  const src2 = noise();
  const lp2 = ctx.createBiquadFilter();
  lp2.type = 'lowpass';
  lp2.frequency.value = 500;
  const g2 = ctx.createGain();
  g2.gain.value = 0.35;
  src2.connect(lp2).connect(g2).connect(gain);
  src.start();
  src2.start();
  gain.gain.setTargetAtTime(rainTarget(), ctx.currentTime, 1.2);
  rainNodes = { src, src2, gain };
}

export function setRain(level) {
  if (!rainNodes || !ctx) return startRain(level);
  rainLevel = level;
  rainNodes.gain.gain.setTargetAtTime(rainTarget(), ctx.currentTime, 0.6);
}

/** No thunder while a clip with its own soundtrack plays. */
export function hushThunder(on) { hush = !!on; }

/** Lower the weather while a voice line plays (and skip thunder), raise it again after. */
export function duckAmbient(on) {
  ducked = !!on;
  if (rainNodes && ctx) rainNodes.gain.gain.setTargetAtTime(rainTarget(), ctx.currentTime, ducked ? 0.25 : 1.2);
}

export function stopRain() {
  if (!rainNodes) return;
  const { src, src2, gain } = rainNodes;
  gain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
  setTimeout(() => { try { src.stop(); src2.stop(); } catch { /* already stopped */ } }, 2500);
  rainNodes = null;
}

export function thunder(delay = 0.6) {
  if (!enabled() || !ensure() || ducked || hush) return;
  const t = ctx.currentTime + delay;
  // one roll at a time: lightning in the office, the title and the cinematics all ask for thunder
  if (t < thunderFreeAt) return;
  thunderFreeAt = t + 4 + THUNDER_GAP;
  const src = noise();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(260, t);
  lp.frequency.exponentialRampToValueAtTime(60, t + 3.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.3, t + 0.15);
  g.gain.exponentialRampToValueAtTime(0.08, t + 0.9);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
  src.connect(lp).connect(g).connect(master);
  src.start(t);
  src.stop(t + 4.2);
}

function tone(freq, dur, { type = 'sine', vol = 0.2, at = 0, attack = 0.005, glide = null } = {}) {
  if (!enabled() || !ensure()) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  click: () => tone(1800, 0.04, { type: 'square', vol: 0.04 }),
  key: () => tone(2400 + Math.random() * 600, 0.03, { type: 'square', vol: 0.025 }),
  pin: () => { tone(180, 0.12, { type: 'triangle', vol: 0.3 }); tone(90, 0.2, { vol: 0.2, at: 0.02 }); },
  good: () => { tone(523, 0.18, { vol: 0.12 }); tone(659, 0.22, { vol: 0.1, at: 0.06 }); },
  bad: () => tone(140, 0.25, { type: 'sawtooth', vol: 0.08, glide: 90 }),
  solve: () => [392, 494, 587, 784].forEach((f, i) => tone(f, 0.9, { vol: 0.09, at: i * 0.09, type: 'triangle' })),
  reveal: () => {
    if (!enabled() || !ensure()) return;
    const src = noise();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(400, ctx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    src.connect(bp).connect(g).connect(master);
    src.start();
    src.stop(ctx.currentTime + 1);
  },
  buzz: () => {
    // phone vibrating on a wooden desk
    for (let i = 0; i < 2; i++) tone(58, 0.42, { type: 'sawtooth', vol: 0.18, at: i * 0.55, attack: 0.02 });
  },
  lift: () => { tone(1318, 0.5, { vol: 0.12 }); tone(1046, 0.7, { vol: 0.1, at: 0.25 }); },
  stamp: () => { tone(70, 0.18, { type: 'square', vol: 0.3 }); tone(120, 0.1, { type: 'triangle', vol: 0.2, at: 0.01 }); },
  alarm: () => [0, 0.3, 0.6].forEach((a) => tone(880, 0.22, { type: 'square', vol: 0.06, at: a })),
};
