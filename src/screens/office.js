// The hub: your office in 3D. The board, the phone and the lighter are all clickable.
// When a case closes, the phone rings with the next one.
import { h, toast, modal } from '../core/ui.js';
import { go } from '../core/router.js';
import { state, rank } from '../core/state.js';
import { CASES, COMING_SOON, levelStatus, getCaseState, progress, caseLabel } from '../data/cases.js';
import { avatarSvg } from '../core/avatar.js';
import { sfx, startRain } from '../core/audio.js';
import { app } from '../core/app.js';
import '../styles/cases.css';

export function mount(host) {
  const s = state();
  if (!s.profile) { go('title'); return {}; }
  app.scene.setMode('office');
  startRain(0.2);
  app.music?.play?.('office');

  const p = progress();
  // a fresh profile that skipped the intro still lands on Case 1
  if (!p.started.length) { go('intro'); return {}; }
  const mainId = p.open[p.open.length - 1] || p.latest;
  const c = CASES[mainId];
  const cs = getCaseState(mainId);
  const { solved } = levelStatus(c, cs);
  const ringing = p.ringing || p.allClosed;
  app.scene.setBoard({
    suspects: c.suspects.map((sp) => ({ name: sp.name, role: sp.role, mark: cs.board.marks[sp.id] })),
    evidence: solved.map((l) => ({ tag: l.evidence.tag, title: l.evidence.title, short: l.evidence.short })),
  });
  app.scene.ringPhone(ringing);
  if (ringing) sfx.buzz();

  const r = rank();
  const card = h('div', { class: 'hub-card' },
    h('div', { class: 'mini-photo', html: avatarSvg(s.profile.look) }),
    h('div', {},
      h('strong', {}, s.profile.name),
      h('span', {}, r.name),
      h('div', { class: 'rank-bar', title: r.next ? `Next rank: ${r.next.name}` : 'Highest rank' }, h('i', { style: { width: `${Math.round(r.pct * 100)}%` } }))));

  const buttons = [];
  if (ringing) buttons.push(h('button', { class: 'btn btn--primary', onclick: answerPhone }, 'Answer the phone'));
  // every open case gets a way back in, the furthest one first
  [...p.open].reverse().forEach((id, i) => {
    const oc = CASES[id];
    const ocs = getCaseState(id);
    const started = Object.keys(ocs.solved).length > 0;
    buttons.push(h('button', { class: `btn${!ringing && i === 0 ? ' btn--primary' : ''}`, onclick: () => go('map', { caseId: id }) },
      `${started || ocs.reopened ? 'Continue' : 'Start'} ${caseLabel(oc)}`));
  });
  buttons.push(
    h('button', { class: 'btn nav-dup', onclick: () => go('board', { caseId: mainId, back: 'office' }) }, 'Case board'),
    h('button', { class: 'btn', onclick: () => go('archive') }, 'Case archive'),
    h('button', { class: 'btn btn--ghost', onclick: () => go('title') }, 'Title screen'));
  const actions = h('nav', { class: 'hub-actions', 'aria-label': 'Office' }, buttons);

  const note = h('p', { class: 'hub-note' }, ringing
    ? 'Your phone is buzzing on the desk.'
    : `Bala Anne left a ${s.profile.drink.toLowerCase()} on your desk. It has gone cold. Tap the board, the phone or the lighter.`);

  host.append(h('section', { class: 'screen hub' }, card, note, actions));

  app.scene.onPick((what) => {
    if (what === 'board') go('board', { caseId: mainId, back: 'office' });
    else if (what === 'phone') ringing ? answerPhone() : toast(c.phoneIdle || 'No missed calls. Rachel said she would message if she remembered anything.');
    else if (what === 'lighter') {
      sfx.click();
      toast("Daniel's lighter. Engraved on the base: \"V.R. 1996\". You never asked him who V.R. was.", 5200);
    }
  });

  async function answerPhone() {
    app.scene.ringPhone(false);
    sfx.click();
    if (p.next) {
      go('opening', { caseId: p.next });
      return;
    }
    await modal({
      title: COMING_SOON.title,
      body: h('div', {}, h('p', { class: 'doc' }, COMING_SOON.teaser), h('p', {}, 'The next case is being written. Your choices so far are saved and will follow you into it.')),
      buttons: [{ label: 'Hang up', kind: 'primary', value: true }],
    });
    app.scene.ringPhone(true);
  }

  return { destroy: () => app.scene.onPick(null) };
}
