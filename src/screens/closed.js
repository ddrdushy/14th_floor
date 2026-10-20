import { gsap } from 'gsap';
import { h, fmtTime } from '../core/ui.js';
import { go } from '../core/router.js';
import { CASES, getCaseState, caseHeading, progress, resolveCaseId } from '../data/cases.js';
import { sfx } from '../core/audio.js';
import { app } from '../core/app.js';
import '../styles/cases.css';

const listNames = (names) => (names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

export function mount(host, { caseId } = {}) {
  app.scene.setMode('dim');
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  const total = Object.values(cs.solved).reduce((s, x) => s + (x.time || 0), 0);
  const names = (cs.accusation || []).map((id) => c.suspects.find((s) => s.id === id)?.name).filter(Boolean);
  const answers = (c.deduction?.questions || []).map((q) => {
    const o = q.options.find((x) => x.id === cs.answers?.[q.id]);
    return o ? h('li', {}, `${q.q} Your answer: ${o.label}.`) : null;
  }).filter(Boolean);
  const used = Math.max(0, (cs.hintsMax ?? c.hints ?? 5) - cs.hints);
  const ringing = progress().ringing;
  const stamp = h('div', { class: 'closed-stamp' }, 'Closed');
  const root = h('section', { class: 'screen scroll', style: { background: 'rgba(10,15,20,.55)' } },
    h('article', { class: 'closed-file' },
      stamp,
      h('h1', {}, caseHeading(c)),
      h('p', {}, c.victim),
      h('p', {}, `Charged on your word: ${listNames(names)}.`),
      answers.length ? h('ul', { class: 'closed-answers' }, answers) : null,
      h('p', {}, `${Object.keys(cs.solved).length} exhibits. ${fmtTime(total)} of puzzle work. ${used} ${used === 1 ? 'magnifier' : 'magnifiers'} used.`),
      h('p', { style: { borderTop: '1px dashed var(--ink-soft)', paddingTop: '12px' } }, 'If you ever doubt this file, it waits for you in the case archive.'),
      ringing ? h('p', {}, 'Back in Brickfields, the office phone has started ringing.') : null,
      h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' } },
        h('button', { class: 'btn btn--primary', onclick: () => go('office') }, 'Back to the office'),
        h('button', { class: 'btn btn--paper', onclick: () => go('archive') }, 'Case archive'))));
  host.append(root);
  gsap.fromTo(stamp, { opacity: 0, scale: 2.5 }, { opacity: 1, scale: 1, duration: 0.4, delay: 0.6, ease: 'back.out(2)', onStart: () => sfx.stamp() });
  return {};
}
