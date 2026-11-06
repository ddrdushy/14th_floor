// Tappable notices in the toast stack (#toasts): "A new version is ready", "You moved up to #7".
// ui.js toast() is text only and never takes a tap; these do. Styles: styles/pwa.css (.notice).
import { h } from './ui.js';

/**
 * Show a notice. Returns { close }.
 * opts: { text, sub, kind: 'up' | 'down' | 'update' | 'info', ms (0 = stays until tapped or closed),
 *         onClick, closeLabel, id (a notice with the same id replaces the earlier one) }
 */
export function notice({ text, sub, kind = 'info', ms = 6500, onClick, id } = {}) {
  const box = document.getElementById('toasts');
  if (!box) return { close() {} };
  if (id) box.querySelector(`.notice[data-id="${CSS.escape(id)}"]`)?.remove();
  let done = false;
  let timer = 0;
  const close = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    const a = el.animate?.([{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 240 });
    if (a) a.onfinish = () => el.remove();
    else el.remove();
  };
  const icon = kind === 'up' ? '▲' : kind === 'down' ? '▼' : kind === 'update' ? '↻' : '✦';
  const main = h(onClick ? 'button' : 'div', {
    class: 'notice-main',
    type: onClick ? 'button' : null,
    onclick: onClick ? () => { close(); onClick(); } : null,
  },
  h('span', { class: 'notice-ico', 'aria-hidden': 'true' }, icon),
  h('span', { class: 'notice-text' }, h('strong', {}, text), sub ? h('small', {}, sub) : null));
  const x = h('button', { class: 'notice-x', type: 'button', 'aria-label': 'Dismiss', onclick: close }, '×');
  const el = h('div', { class: `notice notice--${kind}`, 'data-id': id || null }, main, x);
  box.append(el);
  el.animate?.([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  if (ms > 0) timer = setTimeout(close, ms);
  return { close, el };
}
