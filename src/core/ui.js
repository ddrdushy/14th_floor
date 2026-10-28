// Tiny DOM helpers, toasts and modals.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function svgEl(tag, attrs = {}, ...children) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  for (const c of children.flat(Infinity)) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

export function toast(message, ms = 3200) {
  const box = document.getElementById('toasts');
  const t = h('div', { class: 'toast' }, message);
  box.append(t);
  t.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
  setTimeout(() => {
    t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => t.remove();
  }, ms);
}

/** Show a modal. buttons: [{label, kind, value}]. Resolves with the clicked value. */
export function modal({ title, body, buttons = [{ label: 'OK', kind: 'primary', value: true }], dismissable = true }) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('overlay');
    const close = (v) => {
      backdrop.remove();
      document.removeEventListener('keydown', onKey);
      resolve(v);
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) close(null);
    };
    const box = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      title && h('h2', {}, title),
      typeof body === 'string' ? h('p', {}, body) : body,
      h('div', { class: 'actions' }, buttons.map((b) =>
        h('button', { class: `btn btn--${b.kind || 'paper'}`, onclick: () => close(b.value) }, b.label))),
    );
    const backdrop = h('div', { class: 'modal-backdrop', onclick: (e) => { if (e.target === backdrop && dismissable) close(null); } }, box);
    overlay.append(backdrop);
    document.addEventListener('keydown', onKey);
    box.querySelector('.actions .btn:last-child')?.focus();
  });
}

export const fmtTime = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Is this a local machine? Dev tools (?dev, the lab's Solve/Hint) only ever work here, never on the live site. */
export const isLocal = () => {
  try {
    const h = location.hostname;
    return import.meta.env?.DEV === true || h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h.endsWith('.local') || h.endsWith('.localhost');
  } catch { return false; }
};
export const isDev = () => isLocal() && new URLSearchParams(location.search).has('dev');
