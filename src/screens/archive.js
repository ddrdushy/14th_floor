// Case archive: closed files, each with your accusation on record. Reopen one to accuse again.
import { h, modal } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { state, save } from '../core/state.js';
import { CASES, CASE_ORDER, caseHeading } from '../data/cases.js';
import { app } from '../core/app.js';

const listNames = (names) => (names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

export function mount(host) {
  app.scene.setMode('dim');
  const s = state();
  const items = CASE_ORDER.filter((id) => s.cases[id] && CASES[id]).map((id) => {
    const c = CASES[id];
    const cs = s.cases[id];
    const names = (cs.accusation || []).map((sid) => c.suspects.find((x) => x.id === sid)?.name).filter(Boolean);
    const extra = (c.deduction?.questions || []).map((q) => { const o = q.options.find((x) => x.id === cs.answers?.[q.id]); return o ? { label: `${q.short || q.q} ${o.label}` } : null; }).filter(Boolean);
    const closed = cs.status === 'closed';
    return h('article', { class: 'archive-item' },
      h('div', {},
        h('h3', {}, caseHeading(c)),
        h('p', {}, closed ? `Closed. Charged: ${listNames(names)}.${extra.length ? ` ${extra.map((o) => o.label).join('. ')}.` : ''}` : `Open. ${Object.keys(cs.solved).length} exhibits so far.`),
        cs.reopened ? h('p', {}, `Reopened ${cs.reopened} ${cs.reopened === 1 ? 'time' : 'times'}.`) : null),
      closed
        ? h('button', { class: 'btn btn--paper', onclick: () => reopen(id) }, 'Reopen the file')
        : h('button', { class: 'btn btn--primary', onclick: () => go('map', { caseId: id }) }, 'Continue'));
  });
  host.append(h('section', { class: 'screen' },
    h('header', { class: 'topbar' },
      backButton('Office', () => go('office')),
      h('div', { class: 'topbar-title' }, h('strong', {}, 'Case archive'), h('span', {}, 'Every file you have touched.'))),
    h('div', { class: 'scroll', style: { flex: 1 } }, h('div', { class: 'archive-list' }, items.length ? items : h('p', { class: 'doc' }, 'No files yet.')))));

  async function reopen(id) {
    const ok = await modal({
      title: 'Reopen this case?',
      body: 'Your exhibits stay on the board. You will stand in the deduction room again, and whoever you charged before goes back to being a suspect.',
      buttons: [{ label: 'Leave it closed', value: false }, { label: 'Reopen', kind: 'primary', value: true }],
    });
    if (!ok) return;
    const cs = s.cases[id];
    cs.status = 'active';
    cs.reopened = (cs.reopened || 0) + 1;
    save();
    go('deduce', { caseId: id });
  }
  return {};
}
