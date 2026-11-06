// The "Office" settings group (added to core/settings.js as a single row): how the office is drawn
// (Auto / Full 3D / Light) and its time of day (Auto follows this device's clock).
import { h } from '../core/ui.js';
import { state, save } from '../core/state.js';
import { app } from '../core/app.js';

function seg(label, id, opts, get, set) {
  const btns = opts.map(([v, text]) => h('button', { type: 'button', class: 'set-seg-btn', 'aria-pressed': String(get() === v), onclick: () => {
    set(v);
    btns.forEach((b, i) => b.setAttribute('aria-pressed', String(opts[i][0] === get())));
  } }, text));
  return h('div', { class: 'set-row set-row--stack' }, h('span', { id }, label), h('div', { class: 'set-seg', role: 'group', 'aria-labelledby': id }, btns));
}

export function officeSettingsGroup() {
  const s = state().settings;
  const apply = () => { save(); app.scene?.applyPrefs?.(); };
  return h('section', { class: 'set-group' },
    h('h3', {}, 'Office'),
    seg('Graphics', 'set-office3d', [['auto', 'Auto'], ['full', 'Full 3D'], ['light', 'Light']], () => s.office3d || 'auto', (v) => { s.office3d = v; apply(); }),
    seg('Time of day', 'set-officetime', [['auto', 'Auto'], ['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['night', 'Night']], () => s.officeTime || 'auto', (v) => { s.officeTime = v; apply(); }),
    h('p', { class: 'set-help' }, 'Auto picks the 3D office on capable devices and a lighter photo office on phones, and follows your clock.'));
}
