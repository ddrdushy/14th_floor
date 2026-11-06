// Settings panel: difficulty and vibration, music on/off and volume, sound effects on/off and volume.
// Opened from the title menu and from the global gear button (main.js).
import { h } from './ui.js';
import { state, save, onChange } from './state.js';
import { app } from './app.js';
import { sfx, startRain, stopRain, applySfxVolume, unlock } from './audio.js';
import { showLoopTutorial } from './howto.js';
import { MODES, MODE_INFO, currentMode, syncHints } from './difficulty.js';
import { haptic, canVibrate } from './feel.js';
import '../styles/feel.css';
import { CASES } from '../data/cases.js';
import { officeSettingsGroup } from '../three/officeSettings.js';

let openPanel = null;

// A case opened while Story or Hardboiled is chosen gets its magnifier budget on the next save, so the
// map and the office show the right count before any puzzle is opened. syncHints is a no-op once in step.
let syncing = false;
onChange((data) => {
  if (syncing) return;
  syncing = true;
  try {
    let changed = false;
    for (const [id, cs] of Object.entries(data.cases || {})) changed = syncHints(cs, currentMode(), CASES[id]?.hints) || changed;
    if (changed) save();
  } finally {
    syncing = false;
  }
});

function toggleRow(label, id, get, set) {
  const sw = h('button', { class: 'set-switch', role: 'switch', id, 'aria-checked': String(get()), onclick: () => {
    set(!get());
    sw.setAttribute('aria-checked', String(get()));
  } }, h('span', { class: 'set-switch-knob' }));
  return h('div', { class: 'set-row' }, h('label', { for: id }, label), sw);
}

function sliderRow(label, id, get, set, onRelease) {
  const out = h('output', { for: id, class: 'set-val' }, `${Math.round(get() * 100)}`);
  const input = h('input', { type: 'range', id, min: 0, max: 100, step: 1, value: Math.round(get() * 100), class: 'set-range' });
  const paint = () => input.style.setProperty('--fill', `${input.value}%`);
  input.addEventListener('input', () => { set(input.value / 100); out.textContent = input.value; paint(); });
  input.addEventListener('change', () => onRelease?.());
  paint();
  return h('div', { class: 'set-row set-row--slider' }, h('label', { for: id }, label), input, out);
}

// Music pace: the tracks play slightly faster (pitch kept) so long puzzles do not drag. core/music.js PACES.
function paceRow(s) {
  const opts = [['calm', 'Calm'], ['lively', 'Lively'], ['fast', 'Fast']];
  const cur = () => s.musicPace || 'lively';
  const btns = opts.map(([v, label]) => h('button', { type: 'button', class: 'set-seg-btn', 'aria-pressed': String(cur() === v), onclick: () => {
    app.music.setPace(v);
    btns.forEach((b, i) => b.setAttribute('aria-pressed', String(opts[i][0] === cur())));
  } }, label));
  return h('div', { class: 'set-row' }, h('span', { id: 'set-pace-label' }, 'Music pace'), h('div', { class: 'set-seg', role: 'group', 'aria-labelledby': 'set-pace-label' }, btns));
}

// Difficulty (core/difficulty.js): state().settings.difficulty, read by the puzzle screen and the leaderboard.
// A change counts from the next puzzle opened; magnifiers of open cases move to the new budget at once.
export function setDifficulty(mode) {
  if (!MODES.includes(mode)) return;
  const s = state();
  s.settings.difficulty = mode;
  s.difficultyAsked = true;
  for (const [id, cs] of Object.entries(s.cases || {})) syncHints(cs, mode, CASES[id]?.hints);
  save();
}

function difficultyRow() {
  const desc = h('p', { class: 'set-mode-desc', id: 'set-mode-desc', 'aria-live': 'polite' }, MODE_INFO[currentMode()].long);
  const btns = MODES.map((m) => h('button', { type: 'button', class: 'set-seg-btn', 'data-mode': m, 'aria-pressed': String(currentMode() === m), 'aria-describedby': 'set-mode-desc', onclick: () => {
    setDifficulty(m);
    sfx.click();
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === currentMode())));
    desc.textContent = MODE_INFO[currentMode()].long;
  } }, MODE_INFO[m].label));
  return h('div', { class: 'set-row set-row--stack' },
    h('span', { id: 'set-mode-label' }, 'Difficulty'),
    h('div', { class: 'set-seg', role: 'group', 'aria-labelledby': 'set-mode-label' }, btns),
    desc,
    h('p', { class: 'set-mode-note' }, 'Counts from the next puzzle you start. A puzzle already under way keeps its mode.'));
}

function gameGroup(s) {
  const vib = toggleRow('Vibration', 'set-vibration', () => s.vibration !== false, (v) => {
    s.vibration = v;
    save();
    if (v) haptic('hint');
  });
  return h('section', { class: 'set-group' },
    h('h3', {}, 'Game'),
    difficultyRow(),
    vib,
    canVibrate() ? null : h('p', { class: 'set-help' }, 'This device or browser cannot vibrate, so this does nothing here.'));
}

/**
 * The one-time question on a new profile: how hard? Resolves with the chosen mode. Escape or a tap
 * outside keeps Detective. Never shown to a save that already had a detective (state.js).
 */
export function askDifficulty() {
  return new Promise((resolve) => {
    const overlay = document.getElementById('overlay');
    const before = document.activeElement;
    const finish = (mode) => {
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
      setDifficulty(MODES.includes(mode) ? mode : 'detective');
      before?.focus?.();
      resolve(currentMode());
    };
    const onKey = (e) => { if (e.key === 'Escape') finish('detective'); };
    const opts = MODES.map((m) => h('li', {}, h('button', { class: 'diff-ask-opt', type: 'button', 'data-mode': m, onclick: () => { sfx.click(); finish(m); } },
      h('span', { class: 'mode-badge', 'data-mode': m, 'aria-hidden': 'true' }, m === 'detective' ? 'As written' : m === 'story' ? 'Easier' : 'Harder'),
      h('b', {}, MODE_INFO[m].label),
      h('span', { class: 'diff-ask-desc' }, MODE_INFO[m].short))));
    const box = h('div', { class: 'diff-ask', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'diff-ask-title', 'aria-describedby': 'diff-ask-lede' },
      h('h2', { id: 'diff-ask-title' }, 'How do you like your cases?'),
      h('p', { class: 'diff-ask-lede', id: 'diff-ask-lede' }, 'Pick how hard the puzzles push back. The story is the same in every mode.'),
      h('ul', { class: 'diff-ask-list' }, opts),
      h('p', { class: 'diff-ask-foot' }, 'You can change this any time in Settings.'));
    const backdrop = h('div', { class: 'modal-backdrop diff-ask-backdrop', onclick: (e) => { if (e.target === backdrop) finish('detective'); } }, box);
    overlay.append(backdrop);
    document.addEventListener('keydown', onKey);
    box.querySelector('[data-mode="detective"]')?.focus();
  });
}

// Leaderboard and privacy (read by core/telemetry.js through the save):
//   shareProgress: send progress + cloud save (default on)   showOnBoard: show the detective name (default off)
function leaderboardGroup(s) {
  const share = toggleRow('Share progress and save my game online', 'set-share', () => s.shareProgress !== false, (v) => {
    s.shareProgress = v;
    save();
    name.querySelector('.set-switch').disabled = !v;
  });
  const name = toggleRow('Show my detective name on the leaderboard', 'set-board-name', () => s.showOnBoard === true, (v) => {
    s.showOnBoard = v;
    save();
  });
  name.querySelector('.set-switch').disabled = s.shareProgress === false;
  const pinBtn = h('button', { class: 'btn btn--small set-pin', onclick: () => import('./cloud.js').then((m) => m.promptPin({ change: true })) }, 'Change my PIN');
  return h('section', { class: 'set-group set-group--privacy' },
    h('h3', {}, 'Leaderboard'),
    share,
    name,
    state().profile ? h('div', { class: 'set-row' }, h('span', {}, 'Case file PIN (to continue on another device)'), pinBtn) : null,
    h('p', { class: 'set-help set-privacy' },
      'Progress is sent with a random player number and your detective name, never an account, email or exact location (only your country). ',
      'Your game is saved online under your detective name and locked with your 4-digit PIN: type both on the title screen of another device to continue there. ',
      'Other players only see your name if you choose to show it on the leaderboard. Turn sharing off and nothing more leaves this device.'));
}

/** Opens the settings sheet. Resolves when it closes. */
export function openSettings() {
  if (openPanel) return openPanel;
  unlock();
  app.music.unlock();
  const s = state().settings;
  openPanel = new Promise((resolve) => {
    const overlay = document.getElementById('overlay');
    const before = document.activeElement;
    const close = () => {
      document.removeEventListener('keydown', onKey);
      backdrop.classList.add('is-closing');
      setTimeout(() => backdrop.remove(), 180);
      openPanel = null;
      before?.focus?.();
      resolve();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const replayTutorial = () => {
      // forget which puzzles were explained, then show the case explainer right away
      state().seenHowTo = {};
      state().seenLoop = false;
      save();
      close();
      setTimeout(() => {
        showLoopTutorial().then((r) => { if (r === 'done') { state().seenLoop = true; save(); } });
      }, 200);
    };

    const panel = h('div', { class: 'settings-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'set-title' },
      h('header', { class: 'set-head' },
        h('h2', { id: 'set-title' }, 'Settings'),
        h('button', { class: 'set-close', 'aria-label': 'Close settings', onclick: close }, h('span', { 'aria-hidden': 'true' }, '×'))),
      gameGroup(s),
      h('section', { class: 'set-group' },
        h('h3', {}, 'Music'),
        toggleRow('Music', 'set-music', () => s.music !== false, (v) => app.music.setEnabled(v)),
        sliderRow('Music volume', 'set-music-vol', () => s.musicVolume ?? 0.6, (v) => app.music.setVolume(v)),
        paceRow(s)),
      h('section', { class: 'set-group' },
        h('h3', {}, 'Sound effects'),
        toggleRow('Rain, thunder and clicks', 'set-sound', () => s.sound !== false, (v) => {
          s.sound = v;
          save();
          if (v) { unlock(); startRain(0.22); sfx.click(); } else stopRain();
        }),
        sliderRow('Sound effects volume', 'set-sfx-vol', () => s.sfxVolume ?? 0.8, (v) => { s.sfxVolume = v; save(); applySfxVolume(); }, () => sfx.good())),
      // voiced dialogue in the cinematics (core/voice-player.js); only heard when the server has voices
      h('section', { class: 'set-group set-group--voices' },
        h('h3', {}, 'Voices'),
        toggleRow('Spoken dialogue', 'set-voices', () => s.voices !== false, (v) => { s.voices = v; save(); }),
        sliderRow('Voice volume', 'set-voice-vol', () => s.voiceVolume ?? 1, (v) => { s.voiceVolume = v; save(); })),
      officeSettingsGroup(),
      leaderboardGroup(s),
      h('section', { class: 'set-group' },
        h('h3', {}, 'Help'),
        h('div', { class: 'set-row set-row--help' },
          h('p', { class: 'set-help' }, 'See how a case works again. Each puzzle will also show its "How to play" card the next time you open it.'),
          h('button', { class: 'btn btn--paper set-replay', type: 'button', onclick: replayTutorial }, 'Replay tutorial'))),
      h('p', { class: 'set-note' }, 'Headphones recommended. Settings are saved on this device.'),
      h('div', { class: 'set-actions' }, h('button', { class: 'btn btn--primary', onclick: close }, 'Done')));

    const backdrop = h('div', { class: 'modal-backdrop settings-backdrop', onclick: (e) => { if (e.target === backdrop) close(); } }, panel);
    overlay.append(backdrop);
    document.addEventListener('keydown', onKey);
    panel.querySelector('.set-switch')?.focus();
  });
  return openPanel;
}
