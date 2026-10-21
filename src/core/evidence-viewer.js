// Evidence viewer: look at a found exhibit again, any time.
//
//   openEvidence({ caseId, levelId })   one exhibit: the cleared photo with its hotspot ring, the
//                                       card text and when it was solved; prev/next (and swipe on
//                                       phones) through everything found in the case so far
//   openEvidenceFile({ caseId })        the evidence file: every exhibit found, in order, as thumbnails
//   openLightbox(evidence)              the photo alone, fitted to the screen
//   evidencePhoto(evidence)             the cleared photo element (hotspot ring included), reusable
//   evidenceFileButton(caseId)          a top bar button that opens the evidence file
//
// Layers stack (file -> exhibit -> full screen photo). Esc, the close button and the phone Back
// gesture close the top one only: nav.js turns Back into an Escape key press whenever an element
// with .modal-backdrop is in #overlay, the same convention the "How to play" cards use.
import { h, fmtTime } from './ui.js';
import { paintInto } from './assets.js';
import { onNavigate } from './router.js';
import { CASES, getCaseState, activeLevels, findLevel, caseHeading, resolveCaseId } from '../data/cases.js';

const ICON = {
  close: '<path d="M6 6l12 12M18 6 6 18" />',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />',
  prev: '<path d="M14.5 5.5 8 12l6.5 6.5" />',
  next: '<path d="M9.5 5.5 16 12l-6.5 6.5" />',
  file: '<path d="M3.5 6.5a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" /><path d="M7 12h10M7 15.5h6" />',
};
export const evIcon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;

// ---------------------------------------------------------------------------------------------
// layer stack

const stack = []; // { layer, close, onKey }
let wired = false;

function wire() {
  if (wired) return;
  wired = true;
  // capture on window so the top layer sees keys before games or other dialogs (and Back's Escape)
  window.addEventListener('keydown', (e) => {
    const top = stack[stack.length - 1];
    if (!top) return;
    if (document.querySelector('.settings-backdrop')) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); top.close(); return; }
    if (e.key === 'Tab') {
      const f = [...top.layer.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
      if (f.length) {
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
      }
      e.stopPropagation();
      return;
    }
    top.onKey?.(e);
    e.stopPropagation();
  }, true);
  // leaving the screen closes every layer
  onNavigate(() => closeAllEvidence());
}

function pushLayer(layer, { onKey, onClose, focus } = {}) {
  wire();
  const before = document.activeElement;
  const entry = { layer, onKey };
  entry.close = () => {
    const i = stack.indexOf(entry);
    if (i < 0) return;
    stack.splice(i, 1);
    layer.classList.add('is-closing');
    setTimeout(() => layer.remove(), 140);
    onClose?.();
    if (before && before.isConnected) before.focus?.({ preventScroll: true });
  };
  stack.push(entry);
  document.getElementById('overlay').append(layer);
  requestAnimationFrame(() => (focus || layer.querySelector('.ev-close'))?.focus({ preventScroll: true }));
  return entry.close;
}

/** Close every evidence layer at once (used on navigation). */
export function closeAllEvidence() {
  while (stack.length) stack[stack.length - 1].close();
}
export const isEvidenceOpen = () => stack.length > 0;

const closeButton = (onclick, label = 'Close') => h('button', { class: 'ev-close', type: 'button', 'aria-label': label, title: label, onclick, html: evIcon('close') });

// ---------------------------------------------------------------------------------------------
// data

/** Everything found in a case so far, in exhibit order (each with its numbered evidence tag). */
export function collectedEvidence(caseId) {
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  return activeLevels(c, cs).filter((l) => cs.solved[l.id]);
}

function whenSolved(rec) {
  if (!rec) return [];
  const out = [];
  if (Number.isFinite(rec.time)) out.push(['Solved in', fmtTime(rec.time)]);
  if (rec.at) {
    try {
      out.push(['Found', new Date(rec.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })]);
    } catch { /* no date */ }
  }
  if (rec.hints) out.push(['Magnifiers', String(rec.hints)]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// the photo

/** The cleared evidence photo with a pulsing ring around the hidden item. */
export function evidencePhoto(ev, { caption = true, label } = {}) {
  const img = h('div', { class: 'evp-img' });
  paintInto(img, ev.img, label || `Exhibit ${ev.tag}`, 'night');
  const hs = ev.hotspot || { x: 0.5, y: 0.5, r: 0.12 };
  const ring = h('span', { class: 'evp-ring', 'aria-hidden': 'true', style: { left: `${hs.x * 100}%`, top: `${hs.y * 100}%`, width: `${hs.r * 200}%` } });
  // the image area is exactly 4:3 (the paper border sits outside it), so hotspot fractions line up
  return h('div', { class: `evp${caption ? '' : ' evp--bare'}` }, h('div', { class: 'evp-area' }, img, ring),
    caption ? h('div', { class: 'evp-caption' }, `Exhibit ${ev.tag}: ${ev.title}`) : null);
}

/** The photo alone, fitted to the screen. Tap anywhere, Esc or Back closes it. */
export function openLightbox(ev) {
  let close;
  const fig = h('figure', { class: 'evl-fig' },
    evidencePhoto(ev, { caption: false }),
    h('figcaption', { class: 'evl-cap' }, h('span', { class: 'evl-tag' }, String(ev.tag)), ' ', ev.title));
  const layer = h('div', { class: 'modal-backdrop ev-layer ev-lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Exhibit ${ev.tag}, full screen photo` },
    closeButton(() => close(), 'Close the photo'),
    fig,
    h('p', { class: 'evl-hint', 'aria-hidden': 'true' }, 'Tap anywhere to close'));
  layer.addEventListener('click', (e) => { if (!e.target.closest('.ev-close')) close(); });
  close = pushLayer(layer);
  return close;
}

// ---------------------------------------------------------------------------------------------
// one exhibit

/**
 * Open the exhibit viewer. list: the levels to page through (defaults to everything found).
 * fromFile: opened from the evidence file (then its own "Evidence file" button is left out).
 */
export function openEvidence({ caseId, levelId, list, fromFile = false } = {}) {
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  list = list || collectedEvidence(caseId);
  let i = list.findIndex((l) => l.id === levelId);
  if (i < 0) {
    const l = findLevel(c, cs, levelId);
    if (!l) return () => {};
    list = [l];
    i = 0;
  }

  const kicker = h('p', { class: 'evv-kicker' });
  const stage = h('div', { class: 'evv-stage' });
  const body = h('div', { class: 'evv-body' }, stage);
  const prev = h('button', { class: 'btn btn--small evv-nav evv-prev', type: 'button', onclick: () => show(i - 1) },
    h('span', { class: 'evv-nav-ico', html: evIcon('prev') }), h('span', {}, 'Previous'));
  const next = h('button', { class: 'btn btn--small evv-nav evv-next', type: 'button', onclick: () => show(i + 1) },
    h('span', {}, 'Next'), h('span', { class: 'evv-nav-ico', html: evIcon('next') }));
  const counter = h('span', { class: 'evv-count', 'aria-live': 'polite' });
  const fileBtn = fromFile ? null : h('button', { class: 'btn btn--small btn--ghost evv-file', type: 'button', onclick: () => openEvidenceFile({ caseId }) },
    h('span', { class: 'evv-nav-ico', html: evIcon('file') }), h('span', {}, 'Evidence file'));
  const panel = h('div', { class: 'evv' },
    h('header', { class: 'evv-head' },
      h('div', { class: 'evv-head-text' }, kicker, h('p', { class: 'evv-case' }, caseHeading(c))),
      fileBtn,
      closeButton(() => close())),
    body,
    list.length > 1 ? h('footer', { class: 'evv-foot' }, prev, counter, next) : null);
  const layer = h('div', { class: 'modal-backdrop ev-layer ev-viewer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Evidence' }, panel);
  layer.addEventListener('click', (e) => { if (e.target === layer) close(); });

  function show(n, dir = 0) {
    if (n < 0 || n >= list.length) return;
    dir = dir || Math.sign(n - i);
    i = n;
    const l = list[i];
    const ev = l.evidence;
    const rec = cs.solved[l.id];
    kicker.textContent = `Exhibit ${ev.tag}`;
    layer.setAttribute('aria-label', `Exhibit ${ev.tag}: ${ev.title}`);
    counter.textContent = `${i + 1} of ${list.length} found`;
    prev.disabled = i === 0;
    next.disabled = i === list.length - 1;
    const photo = evidencePhoto(ev);
    const photoBtn = h('button', { class: 'evv-photo', type: 'button', 'aria-label': `View the photo for exhibit ${ev.tag} full screen`, onclick: () => openLightbox(ev) },
      photo,
      h('span', { class: 'evv-zoom', 'aria-hidden': 'true' }, h('span', { html: evIcon('expand') }), 'Full screen'));
    const meta = whenSolved(rec);
    const card = h('article', { class: 'evidence-card evv-card' },
      h('span', { class: 'tag' }, String(ev.tag)),
      h('h3', {}, ev.title),
      h('p', { class: 'evv-text' }, ev.text),
      h('p', { class: 'evv-where' }, `${l.phase}. ${l.title}.`),
      meta.length ? h('dl', { class: 'evv-meta' }, meta.map(([k, v]) => h('div', {}, h('dt', {}, k), h('dd', {}, v)))) : null);
    stage.replaceChildren(h('div', { class: `evv-grid${dir ? (dir > 0 ? ' from-right' : ' from-left') : ''}` }, photoBtn, card));
    body.scrollTop = 0;
  }

  // swipe left/right on phones (only clearly sideways moves, so vertical scrolling still works)
  let sx = 0, sy = 0, st = 0, tracking = false;
  body.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { tracking = false; return; }
    tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now();
  }, { passive: true });
  body.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - st < 800) show(dx < 0 ? i + 1 : i - 1);
  }, { passive: true });

  const close = pushLayer(layer, {
    onKey: (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
    },
  });
  show(i, 0);
  return close;
}

// ---------------------------------------------------------------------------------------------
// the evidence file

export function openEvidenceFile({ caseId } = {}) {
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  const list = collectedEvidence(caseId);
  // already open on top? just keep it
  const top = stack[stack.length - 1];
  if (top?.layer.classList.contains('ev-file')) return top.close;
  const items = list.map((l) => {
    const ev = l.evidence;
    const thumb = h('div', { class: 'evf-thumb' }, evidencePhoto(ev, { caption: false }), h('span', { class: 'evf-tag' }, String(ev.tag)));
    return h('li', {}, h('button', { class: 'evf-item', type: 'button', onclick: () => openEvidence({ caseId, levelId: l.id, list, fromFile: true }) },
      thumb,
      h('span', { class: 'evf-text' }, h('strong', {}, ev.title), h('span', {}, ev.short))));
  });
  const panel = h('div', { class: 'evf' },
    h('header', { class: 'evf-head' },
      h('div', {},
        h('p', { class: 'evv-kicker' }, 'Evidence file'),
        h('h2', { class: 'evf-title' }, caseHeading(c)),
        h('p', { class: 'evf-count' }, list.length ? `${list.length} ${list.length === 1 ? 'exhibit' : 'exhibits'} found. Tap one to read it again.` : '')),
      closeButton(() => close())),
    list.length
      ? h('ol', { class: 'evf-list' }, items)
      : h('p', { class: 'evf-empty doc' }, 'Nothing in the file yet. Every puzzle you solve adds an exhibit here.'));
  const layer = h('div', { class: 'modal-backdrop ev-layer ev-file', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Evidence file, ${caseHeading(c)}` }, panel);
  layer.addEventListener('click', (e) => { if (e.target === layer) close(); });
  const close = pushLayer(layer);
  return close;
}

/** Top bar button that opens the evidence file (icon only on phones). */
export function evidenceFileButton(caseId, { label = 'Evidence file' } = {}) {
  return h('button', { class: 'btn btn--small ev-file-btn', type: 'button', 'aria-label': label, title: label, onclick: () => openEvidenceFile({ caseId }) },
    h('span', { class: 'ev-file-ico', html: evIcon('file') }), h('span', { class: 'ev-file-label' }, label));
}
