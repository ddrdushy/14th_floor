// Floor 14 as a phone app: service worker registration, the "new version" offer, and installing.
//
// - The service worker (built from src/pwa/sw.template.js) is registered only in a production
//   build, after the page has loaded. `?sw=off` unregisters it and clears its caches (support tool).
// - A new deploy installs in the background. When it is ready the player gets a notice, "A new
//   version is ready. Tap to reload", never during a puzzle or a cinematic, and nothing reloads
//   until they tap it.
// - Install: Chrome/Edge/Android fire `beforeinstallprompt`; it is kept here (listening from the
//   first moment, since main.js imports this file first) and the title menu offers "Install Floor 14".
//   iOS has no prompt, so iOS Safari gets the menu item with Share > Add to Home Screen steps and a
//   one-time hint.
import { onNavigate } from './router.js';
import { notice } from './notice.js';
import { h, modal } from './ui.js';

const QUIET = new Set(['puzzle', 'lab', 'intro', 'opening', 'outcome', 'deduce', 'profile']);
const IOS_HINT_KEY = 'floor14.pwa.iosHint';
const UPDATE_EVERY = 30 * 60_000;

let screen = null;
let deferred = null; // the beforeinstallprompt event
let installed = false;
const subs = new Set();
const emit = () => subs.forEach((fn) => { try { fn(installState()); } catch { /* ignore */ } });

const mm = (q) => { try { return window.matchMedia(q).matches; } catch { return false; } };
export const isStandalone = () => mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)') || mm('(display-mode: minimal-ui)') || navigator.standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

/** 'prompt' (the browser can install), 'ios' (show the Share steps), or null (installed / not possible). */
export function installState() {
  if (installed || isStandalone()) return null;
  if (deferred) return 'prompt';
  if (isIOS()) return 'ios';
  return null;
}
export function onInstallChange(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

/** Install from a tap (title menu). Resolves 'accepted' | 'dismissed' | 'ios' | null. */
export async function installApp() {
  const kind = installState();
  if (kind === 'prompt') {
    const e = deferred;
    deferred = null;
    emit();
    try {
      await e.prompt();
      const choice = await e.userChoice;
      if (choice?.outcome === 'accepted') installed = true;
      emit();
      return choice?.outcome || null;
    } catch {
      return null;
    }
  }
  if (kind === 'ios') {
    await modal({
      title: 'Install Floor 14',
      body: h('div', { class: 'pwa-ios' },
        h('p', {}, 'Play it full screen from your Home Screen, like an app. Your case files stay on this phone.'),
        h('ol', { class: 'pwa-steps' },
          h('li', {}, 'Tap ', h('span', { class: 'pwa-share', 'aria-label': 'the Share button' }, shareIcon()), ' Share in Safari’s toolbar.'),
          h('li', {}, 'Scroll down and tap ', h('strong', {}, 'Add to Home Screen'), '.'),
          h('li', {}, 'Tap ', h('strong', {}, 'Add'), '. Floor 14 opens from its own icon.'))),
      buttons: [{ label: 'Got it', kind: 'primary', value: true }],
    });
    try { localStorage.setItem(IOS_HINT_KEY, '1'); } catch { /* ignore */ }
    return 'ios';
  }
  return null;
}

function shareIcon() {
  const s = h('span', { class: 'pwa-share-ico', 'aria-hidden': 'true' });
  s.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>';
  return s;
}

/** Once per device, on iOS Safari (not yet on the Home Screen): Share > Add to Home Screen. */
export function iosInstallHint() {
  try {
    if (installState() !== 'ios' || localStorage.getItem(IOS_HINT_KEY)) return;
    localStorage.setItem(IOS_HINT_KEY, '1');
  } catch {
    return;
  }
  setTimeout(() => notice({
    id: 'ios-install',
    kind: 'info',
    text: 'Play Floor 14 like an app',
    sub: 'In Safari tap Share → Add to Home Screen.',
    ms: 9000,
    onClick: () => installApp(),
  }), 1800);
}

// ---------- service worker ----------
let waiting = null;
let offer = null;
let reloading = false;

function offerReload() {
  if (!waiting || offer || QUIET.has(screen)) return;
  offer = notice({
    id: 'sw-update',
    kind: 'update',
    text: 'A new version is ready',
    sub: 'Tap to reload. Your progress is saved.',
    ms: 0,
    onClick: () => {
      reloading = true;
      try { waiting.postMessage({ type: 'SKIP_WAITING' }); } catch { location.reload(); }
      setTimeout(() => location.reload(), 4000); // in case controllerchange never comes
    },
  });
  // closed with ×: ask again on a later screen change, not straight away
  const el = offer.el;
  el?.querySelector('.notice-x')?.addEventListener('click', () => { offer = null; });
}

function setWaiting(sw) {
  waiting = sw;
  offerReload();
}

function watch(reg) {
  if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
  reg.addEventListener('updatefound', () => {
    const sw = reg.installing;
    sw?.addEventListener('statechange', () => {
      if (sw.state === 'installed' && navigator.serviceWorker.controller) setWaiting(sw);
    });
  });
  let last = Date.now();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || Date.now() - last < UPDATE_EVERY) return;
    last = Date.now();
    reg.update().catch(() => {});
  });
}

async function turnOff() {
  try {
    for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
    for (const k of await caches.keys()) if (k.startsWith('f14-')) await caches.delete(k);
  } catch { /* ignore */ }
}

let started = false;
export function initPwa() {
  if (started) return;
  started = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // the title menu offers it instead of the browser's mini bar
    deferred = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    emit();
  });
  onNavigate((name) => {
    screen = name;
    if (QUIET.has(name) && offer) {
      offer.close(); // never sit over a puzzle; offered again afterwards
      offer = null;
    } else offerReload();
  });

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if (new URLSearchParams(location.search).get('sw') === 'off') { turnOff(); return; }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) location.reload();
  });
  const register = () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(watch).catch(() => { /* no offline mode, the game still runs */ });
  };
  if (document.readyState === 'complete') setTimeout(register, 1200);
  else window.addEventListener('load', () => setTimeout(register, 1200), { once: true });
}
