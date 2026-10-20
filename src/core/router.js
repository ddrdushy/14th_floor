// Screen manager. Each screen module exports mount(root, params) -> { destroy?() }.
import { gsap } from 'gsap';
import { app } from './app.js';

// Which music cue plays under each screen. Screens not listed keep the current music.
// A screen can still call app.music.play(...) itself for a moment-specific cue.
export const SCREEN_MUSIC = {
  title: 'title',
  profile: 'title',
  intro: 'intro',
  opening: 'intro', // a case's opening cinematic
  office: 'office',
  map: 'office',
  board: 'office',
  archive: 'office',
  puzzle: 'puzzle',
  lab: 'puzzle',
  deduce: 'tension',
  outcome: 'closed',
  closed: 'closed',
};

const screens = {};
let current = null;
let busy = false;
let pending = null;

export function register(name, loader) {
  screens[name] = loader;
}

// Listeners told about every screen change (the phone nav bar uses this to follow along).
const listeners = new Set();
export function onNavigate(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function go(name, params = {}) {
  if (busy) {
    // a transition is running: remember the latest request instead of dropping it
    pending = [name, params];
    return;
  }
  busy = true;
  const root = document.getElementById('screen');
  try {
    const mod = await screens[name]();
    // start the crossfade while the old screen fades out
    if (SCREEN_MUSIC[name]) app.music?.play(SCREEN_MUSIC[name]);
    document.body.dataset.screen = name;
    listeners.forEach((fn) => { try { fn(name, params); } catch (e) { console.error(e); } });
    const old = root.firstElementChild;
    if (old) {
      await gsap.to(old, { opacity: 0, duration: 0.35, ease: 'power2.in' });
      current?.destroy?.();
      old.remove();
    }
    const host = document.createElement('div');
    host.className = 'screen-host';
    host.style.cssText = 'position:absolute;inset:0;opacity:0';
    root.append(host);
    current = (await mod.mount(host, params)) || {};
    current.name = name;
    gsap.to(host, { opacity: 1, duration: 0.45, ease: 'power2.out' });
  } catch (err) {
    console.error(err);
    // never leave the player on a blank screen
    current = {};
    const host = root.lastElementChild;
    if (host) {
      host.style.opacity = '1';
      host.innerHTML = '';
      const box = document.createElement('div');
      box.className = 'screen';
      box.style.cssText = 'display:grid;place-items:center;padding:16px;text-align:center';
      box.innerHTML = '<div class="modal" style="max-width:420px"><h2>The file is smudged</h2><p>Something went wrong opening this page. Your progress is saved.</p><div class="actions"><button class="btn btn--primary">Back to the case map</button></div></div>';
      box.querySelector('button').onclick = () => go('map', { caseId: params.caseId || 'case01' });
      host.append(box);
    }
  } finally {
    busy = false;
    if (pending) {
      const [n, p] = pending;
      pending = null;
      go(n, p);
    }
  }
}

export const currentScreen = () => current?.name;
