// How the office is drawn on this device, and what time it is in the office.
//
// Tiers: 'high' = the baked Blender room (GLB) with every effect, 'mid' = the same room with half-size
// textures and fewer effects, 'low' = photo-real 2.5D plates (phones, weak or software GPUs, Save-Data).
// Settings (state().settings): office3d 'auto' | 'full' | 'light', officeTime 'auto' | 'morning' | ...
// URL overrides for testing: ?office=full|light|classic&tod=night
import { state } from '../core/state.js';

export const PERIODS = ['morning', 'afternoon', 'evening', 'night'];

/** The office's time of day from the player's local clock: morning 5-11, afternoon 11-16, evening 16-19:30, night. */
export function periodAt(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 16) return 'afternoon';
  if (h >= 16 && h < 19.5) return 'evening';
  return 'night';
}

const query = () => {
  try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); }
};

export function officePrefs() {
  const s = state()?.settings || {};
  const q = query();
  return {
    quality: q.get('office') || s.office3d || 'auto',
    time: q.get('tod') || s.officeTime || 'auto',
  };
}

export function currentPeriod() {
  const t = officePrefs().time;
  return PERIODS.includes(t) ? t : periodAt();
}

/** Static capabilities, no rendering: what the GPU and the device report. */
export function deviceCaps() {
  const caps = { webgl2: false, software: false, maxTex: 0, renderer: '' };
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
    if (gl) {
      caps.webgl2 = true;
      caps.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      caps.renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '');
      caps.software = /swiftshader|llvmpipe|software|basic render|mesa offscreen/i.test(caps.renderer);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch { /* no WebGL */ }
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  caps.memory = nav.deviceMemory || 0; // GB, Chromium only
  caps.cores = nav.hardwareConcurrency || 0;
  caps.saveData = !!nav.connection?.saveData;
  caps.slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType || '');
  const sw = window.screen?.width || innerWidth, sh = window.screen?.height || innerHeight;
  caps.small = Math.min(sw, sh) < 820;
  caps.coarse = !!window.matchMedia?.('(pointer: coarse)').matches;
  caps.phone = caps.small && caps.coarse;
  return caps;
}

/**
 * The tier from caps alone (the frame-time probe can lower it later).
 * Returns { tier, reason } where tier is 'high' | 'mid' | 'low' | 'classic'.
 */
export function pickTier(caps = deviceCaps(), quality = officePrefs().quality) {
  if (quality === 'classic') return { tier: 'classic', reason: 'forced classic' };
  if (!caps.webgl2) return { tier: 'none', reason: 'no WebGL2' };
  if (quality === 'light') return { tier: 'low', reason: 'settings: light' };
  if (quality === 'full') return { tier: caps.memory && caps.memory < 4 ? 'mid' : 'high', reason: 'settings: full 3D' };
  if (caps.saveData || caps.slowNet) return { tier: 'low', reason: 'save-data' };
  if (caps.phone) return { tier: 'low', reason: 'phone' };
  if (caps.software) return { tier: 'low', reason: 'software GPU' };
  if (caps.maxTex && caps.maxTex < 4096) return { tier: 'low', reason: 'small textures' };
  if (caps.memory && caps.memory <= 2) return { tier: 'low', reason: 'low memory' };
  if (caps.cores && caps.cores <= 2) return { tier: 'low', reason: 'few cores' };
  if ((caps.memory && caps.memory < 8) || (caps.cores && caps.cores < 8) || caps.small) return { tier: 'mid', reason: 'mid device' };
  return { tier: 'high', reason: 'capable device' };
}

/**
 * A short frame-time probe: median rAF interval over `frames` frames while `draw` renders.
 * Resolves with milliseconds per frame. Hidden tabs report nothing useful, so they resolve with 0.
 */
export function probeFrames(draw, frames = 24) {
  return new Promise((resolve) => {
    if (document.hidden) { resolve(0); return; }
    const times = [];
    let last = 0;
    const step = (t) => {
      if (last) times.push(t - last);
      last = t;
      try { draw(); } catch { /* the probe only measures */ }
      if (times.length < frames) requestAnimationFrame(step);
      else {
        times.sort((a, b) => a - b);
        resolve(times[Math.floor(times.length / 2)]);
      }
    };
    requestAnimationFrame(step);
  });
}
