// Warm the offline cache for a case when its map opens: the evidence photos and suspect portraits
// the map, the board and the puzzles of that case show. Listens to router.js onNavigate (no screen
// calls in here). One image per idle slot, low priority, and only when:
// - a service worker controls the page (that is what keeps them; see src/pwa/sw.template.js),
// - navigator.connection says the line is cheap: wifi or ethernet, or, where the browser does not say
//   the type (desktop Chrome), a 4g-class line; never with Data Saver. Browsers without
//   navigator.connection (Safari, Firefox) are not preloaded; their art is cached as it is shown.
import { onNavigate } from './router.js';
import { CASES, resolveCaseId } from '../data/cases.js';
import { imgUrl } from './assets.js';

const warmed = new Set();
const MAX_PER_CASE = 80;

function cheapLine() {
  const c = navigator.connection;
  if (!c) return false;
  if (c.saveData) return false;
  if (typeof c.type === 'string' && c.type !== 'unknown') return c.type === 'wifi' || c.type === 'ethernet';
  return c.effectiveType === '4g';
}

/** Every image key a case's levels and suspects name (evidence.img, suspect img, ...). */
export function caseImageKeys(c) {
  const keys = new Set();
  const walk = (o, depth) => {
    if (!o || depth > 6 || keys.size >= MAX_PER_CASE) return;
    if (Array.isArray(o)) { for (const x of o) walk(x, depth + 1); return; }
    if (typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (k === 'img' && typeof v === 'string' && /^[\w-]+$/.test(v)) keys.add(v);
      else if (v && typeof v === 'object') walk(v, depth + 1);
    }
  };
  walk(c?.suspects, 0);
  walk(c?.levels, 0);
  return [...keys];
}

const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 400));

function warm(caseId) {
  if (warmed.has(caseId) || !CASES[caseId]) return;
  if (!navigator.serviceWorker?.controller || !('caches' in window) || !cheapLine()) return;
  warmed.add(caseId);
  const queue = caseImageKeys(CASES[caseId]).map((k) => new URL(imgUrl(k), location.href).href);
  const next = () => {
    if (!queue.length) return;
    if (document.hidden || !cheapLine()) { warmed.delete(caseId); return; } // try again on the next visit
    idle(async () => {
      const url = queue.shift();
      try {
        if (!(await caches.match(url))) {
          const res = await fetch(url, { credentials: 'same-origin', priority: 'low' });
          await res.arrayBuffer(); // drain it; the service worker keeps its own copy
        }
      } catch { /* missing art or offline: skip it */ }
      next();
    });
  };
  next();
}

let started = false;
export function initPreload() {
  if (started) return;
  started = true;
  onNavigate((name, params = {}) => {
    if (name !== 'map') return;
    let id = params.caseId;
    try { id = resolveCaseId(params.caseId); } catch { /* keep the param */ }
    // after the map has drawn its own images
    if (id) setTimeout(() => warm(id), 2500);
  });
}
