// Settings panel: music on/off and volume, sound effects on/off and volume.
// Opened from the title menu and from the global gear button (main.js).
import { h } from './ui.js';
import { state, save } from './state.js';
import { app } from './app.js';
import { sfx, startRain, stopRain, applySfxVolume, unlock } from './audio.js';
import { showLoopTutorial } from './howto.js';

let openPanel = null;

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

// Leaderboard and privacy (read by core/telemetry.js through the save):
//   shareProgress: send anonymous progress (default on)   showOnBoard: show the detective name (default off)
function leaderboardGroup(s) {
  const share = toggleRow('Share anonymous progress', 'set-share', () => s.shareProgress !== false, (v) => {
    s.shareProgress = v;
    save();
    name.querySelector('.set-switch').disabled = !v;
  });
  const name = toggleRow('Show my detective name on the leaderboard', 'set-board-name', () => s.showOnBoard === true, (v) => {
    s.showOnBoard = v;
    save();
  });
  name.querySelector('.set-switch').disabled = s.shareProgress === false;
  return h('section', { class: 'set-group set-group--privacy' },
    h('h3', {}, 'Leaderboard'),
    share,
    name,
    h('p', { class: 'set-help set-privacy' },
      'Progress is sent with a random player number, never an account, email or exact location (only your country). ',
      'Your detective name is only sent if you choose to show it. Turn sharing off and nothing more leaves this device.'));
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
      h('section', { class: 'set-group' },
        h('h3', {}, 'Music'),
        toggleRow('Music', 'set-music', () => s.music !== false, (v) => app.music.setEnabled(v)),
        sliderRow('Music volume', 'set-music-vol', () => s.musicVolume ?? 0.6, (v) => app.music.setVolume(v))),
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
