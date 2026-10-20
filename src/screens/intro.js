import { gsap } from 'gsap';
import { h } from '../core/ui.js';
import { go } from '../core/router.js';
import { state, save } from '../core/state.js';
import { getCaseState } from '../data/cases.js';
import { INTRO } from '../data/intro.js';
import { playCinematic } from './cinema.js';
import { app } from '../core/app.js';

function titleCard() {
  const thread = h('div', { style: { height: '3px', background: 'var(--thread)', width: '0', margin: '18px auto 0', boxShadow: '0 0 12px rgba(216,50,61,.7)' } });
  const word = h('div', { class: 'display', style: { fontSize: 'clamp(4.5rem, 16vw, 11rem)', color: 'var(--sodium)', textShadow: '0 0 30px rgba(232,163,61,.5)' } }, 'Floor 14');
  const sub = h('p', { class: 'doc', style: { color: 'var(--mist)', marginTop: '14px', opacity: 0 } }, 'Case 1: The Fall');
  const el = h('div', { class: 'cine-title' }, h('div', {}, word, thread, sub));
  gsap.from(word, { opacity: 0, letterSpacing: '0.3em', duration: 2, ease: 'power2.out' });
  gsap.to(thread, { width: 'min(70vw, 620px)', duration: 1.6, delay: 0.8, ease: 'power3.inOut' });
  gsap.to(sub, { opacity: 1, duration: 1, delay: 2 });
  return el;
}

export function mount(host) {
  app.scene.setMode('hidden');
  playCinematic(host, INTRO, { titleNode: titleCard }).then(() => {
    const s = state();
    s.seenIntro = true;
    getCaseState('case01');
    save();
    go('map', { caseId: 'case01', fresh: true });
  });
  return {};
}
