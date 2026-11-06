// The detective's office above a Brickfields mamak, behind every screen of the game.
//
// Same API as ever (main.js, the screens and the board call it): setMode('title' | 'office' | 'board' |
// 'dim' | 'hidden'), setBoard, setPlayer, ringPhone, onPick, pick, flash, and the onLightning hook.
// Behind it, one of:
//   * RealOffice (RealOffice.js): the office built in Blender (tools/office/build_office.py). Capable
//     devices get the baked 3D room (GLB), phones and weak devices photo-real 2.5D plates. Both follow
//     the player's local clock (morning, afternoon, evening, night).
//   * ProceduralOfficeScene: the classic procedural office, if the Blender assets fail to load, WebGL2
//     is missing, or ?office=classic.
// Settings (core/settings.js, the "Office" row): office3d auto | full | light, officeTime auto | morning | ...
import { ProceduralOfficeScene } from './ProceduralOfficeScene.js';
import { RealOffice } from './RealOffice.js';
import { deviceCaps, pickTier, officePrefs, currentPeriod } from './officeTier.js';

export class OfficeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = { mode: 'title', board: null, player: null, ringing: false, pick: null };
    this.lightningFn = null;
    const caps = deviceCaps();
    const { tier, reason } = pickTier(caps);
    this.tierReason = reason;
    this.caps = caps;
    if (tier === 'classic' || tier === 'none') this.useClassic(canvas);
    else this.useReal(canvas, tier);
    // tests and support: window.__office() describes what is drawing
    window.__office = () => this.info();
    window.__officeScene = this;
  }

  useReal(canvas, tier) {
    try {
      this.impl = new RealOffice(canvas, { tier, forced: officePrefs().quality !== 'auto', onFail: () => this.fallback() });
      this.kind = 'real';
    } catch (err) {
      console.warn('[office] could not start the Blender office:', err?.message || err);
      this.useClassic(canvas);
    }
  }

  useClassic(canvas) {
    this.impl = new ProceduralOfficeScene(canvas);
    this.kind = 'classic';
  }

  /** Swap the canvas for a fresh one (a WebGL context cannot be shared) and replay the state. */
  fallback() {
    if (this.kind === 'classic') return;
    const old = this.canvas;
    try { this.impl.dispose(); } catch { /* already gone */ }
    const fresh = old.cloneNode(false);
    old.replaceWith(fresh);
    this.canvas = fresh;
    this.useClassic(fresh);
    this.replay();
  }

  replay() {
    const s = this.state;
    this.impl.onLightning = this.lightningFn;
    if (s.pick) this.impl.onPick(s.pick);
    this.impl.setMode(s.mode, true);
    if (s.player) this.impl.setPlayer(s.player);
    if (s.board) this.impl.setBoard(s.board);
    this.impl.ringPhone(s.ringing);
  }

  /** Settings changed (core/settings.js): quality auto | full | light, time auto | morning | ... */
  applyPrefs() {
    const { tier } = pickTier(this.caps, officePrefs().quality);
    if (this.kind === 'real' && tier !== 'none' && tier !== 'classic') {
      this.impl.setTier(tier, officePrefs().quality !== 'auto');
      this.impl.setPeriod(currentPeriod(), 1.5);
    }
  }

  get mode() { return this.impl.mode; }

  get onLightning() { return this.lightningFn; }

  set onLightning(fn) {
    this.lightningFn = fn;
    this.impl.onLightning = fn;
  }

  setMode(mode, instant = false) {
    this.state.mode = mode;
    this.impl.setMode(mode, instant);
  }

  setBoard(board) {
    this.state.board = board;
    return this.impl.setBoard(board);
  }

  setPlayer(player) {
    this.state.player = player;
    this.impl.setPlayer(player);
  }

  ringPhone(on) {
    this.state.ringing = on;
    this.impl.ringPhone(on);
  }

  onPick(fn) {
    this.state.pick = fn;
    this.impl.onPick(fn);
  }

  pick(id) { this.impl.pick(id); }

  flash(strength) { this.impl.flash(strength); }

  info() {
    const base = { kind: this.kind, reason: this.tierReason, renderer: this.caps.renderer };
    return this.kind === 'real' ? { ...base, ...this.impl.info() } : { ...base, mode: this.impl.mode };
  }
}
