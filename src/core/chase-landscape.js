// The foot chase (games/pursuit.js) on a phone: offer to play it full screen and sideways.
// Hooked in from outside the game: while the puzzle screen is open it watches for the chase stage
// (.pu-stage), and on a phone held upright shows a small "Full screen, landscape" chip. Tapping it
// presses the game's own Expand button (so the game's full-screen state and layout follow) and then
// locks the screen to landscape. Leaving full screen unlocks it again.
// Offered only where the browser allows both: the Fullscreen API on elements and
// screen.orientation.lock (Android Chrome and friends; not iPhone Safari, which has neither).
import { onNavigate } from './router.js';
import { h } from './ui.js';

const SHOW_MS = 12_000;
let observer = null;
let chip = null;
let chipTimer = 0;
let offeredFor = null; // the stage element the chip was offered for
let wantLock = false;
let locked = false;

const phone = () => {
  try {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const short = Math.min(screen.width || innerWidth, screen.height || innerHeight);
    return coarse && short < 820;
  } catch { return false; }
};
const portrait = () => (screen.orientation?.type ? screen.orientation.type.startsWith('portrait') : innerHeight > innerWidth);
const supported = () => !!(document.fullscreenEnabled && screen.orientation && typeof screen.orientation.lock === 'function');

function hideChip() {
  clearTimeout(chipTimer);
  chip?.remove();
  chip = null;
}

function offer(stage) {
  if (offeredFor === stage || !phone() || !portrait() || !supported() || document.fullscreenElement) return;
  offeredFor = stage;
  hideChip();
  chip = h('button', { class: 'chase-chip', type: 'button', onclick: () => go(stage) },
    h('span', { class: 'chase-chip-ico', 'aria-hidden': 'true' }),
    h('span', {}, h('strong', {}, 'Full screen, landscape'), h('small', {}, 'Turn your phone for a wider street')));
  document.getElementById('app')?.append(chip);
  chipTimer = setTimeout(hideChip, SHOW_MS);
}

function go(stage) {
  hideChip();
  const expand = stage.querySelector('.pu-expand');
  wantLock = true;
  if (expand) expand.click(); // still inside the tap, so the browser allows full screen
  else stage.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => { wantLock = false; });
}

document.addEventListener('fullscreenchange', () => {
  const fs = document.fullscreenElement;
  if (fs && wantLock && (fs.matches?.('.pu-stage') || fs.querySelector?.('.pu-stage'))) {
    wantLock = false;
    screen.orientation.lock('landscape').then(() => { locked = true; }).catch(() => { /* not allowed here: play it upright */ });
    hideChip();
  } else if (!fs) {
    wantLock = false;
    if (locked) {
      locked = false;
      try { screen.orientation.unlock(); } catch { /* ignore */ }
    }
  }
});

function watch() {
  const root = document.getElementById('screen');
  if (!root || observer) return;
  const look = () => {
    const stage = root.querySelector('.pu-stage');
    if (!stage) return;
    // found it: stop watching (the chase redraws its HUD every frame) and offer once per puzzle
    observer?.disconnect();
    offer(stage);
  };
  observer = new MutationObserver(look);
  observer.observe(root, { childList: true, subtree: true });
  look();
}

function unwatch() {
  observer?.disconnect();
  observer = null;
  offeredFor = null;
  hideChip();
}

let started = false;
export function initChaseLandscape() {
  if (started) return;
  started = true;
  onNavigate((name) => {
    if (name === 'puzzle' || name === 'lab') {
      unwatch();
      watch();
    } else unwatch();
  });
}
