// The case file reader: one case, read again from the top. How it began (and, once there is a verdict,
// how it ended and what you decided), every exhibit you found, the persons of interest you met, and
// what your choices set in motion. An open case shows nothing past what the player has reached.
// Opened from the archive ("Read the file"), the case map and the case board.
import { h } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { CASES, caseLabel, caseHeading, resolveCaseId, levelStatus, revealedSuspects } from '../data/cases.js';
import { openEvidence } from '../core/evidence-viewer.js';
import { paintInto, hasImage, imgUrl } from '../core/assets.js';
import { avatarSvg } from '../core/avatar.js';
import { app } from '../core/app.js';
import { caseStateOf, hasVerdict, verdictFor, choicesFor, openingPanels, endingPanels, transcript, listNames } from '../core/casebook.js';
import '../styles/casebook.css';

const MARK_LABEL = { suspect: 'Suspect', cleared: 'Cleared', unsure: 'Unsure' };
const BACKS = {
  archive: ['Case archive', 'Archive', () => go('archive')],
  office: ['Office', 'Office', () => go('office')],
};

const fmtDate = (t) => {
  try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
};

export function mount(host, { caseId, back = 'archive', focus } = {}) {
  app.scene.setMode('dim');
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  const cs = caseStateOf(caseId);
  const [backLabel, backShort, backGo] = back === 'map'
    ? ['Case map', 'Map', () => go('map', { caseId })]
    : back === 'board' ? ['Case board', 'Board', () => go('board', { caseId, back: 'map' })]
      : BACKS[back] || BACKS.archive;

  const topbar = h('header', { class: 'topbar' },
    backButton(backLabel, backGo, backShort),
    h('div', { class: 'topbar-title' }, h('strong', {}, 'Case file'), h('span', {}, caseHeading(c))));

  // a case the player has not reached has no file
  if (!cs) {
    host.append(h('section', { class: 'screen cf-screen' }, topbar,
      h('div', { class: 'scroll cf-scroll' }, h('div', { class: 'cf' },
        h('article', { class: 'cf-head' }, h('p', { class: 'cf-kicker' }, caseLabel(c)), h('h1', {}, 'Not opened yet'),
          h('p', { class: 'doc' }, 'This file is still on somebody else\'s desk. The phone will ring when it is yours.'))))));
    return {};
  }

  const v = verdictFor(caseId);
  const closed = cs.status === 'closed';
  const reopened = !closed && hasVerdict(cs);
  const status = closed ? 'Closed' : reopened ? 'Reopened' : 'Open';
  const replay = (part) => go('replay', { caseId, part, back });

  // ---------------- header ----------------
  const when = [`Opened ${fmtDate(cs.openedAt)}`];
  if (cs.closedAt) when.push(`${closed ? 'closed' : 'last closed'} ${fmtDate(cs.closedAt)}`);
  const head = h('article', { class: 'cf-head' },
    h('span', { class: `cf-stamp cf-stamp--${status.toLowerCase()}`, 'aria-hidden': 'true' }, status),
    h('p', { class: 'cf-kicker' }, caseLabel(c)),
    h('h1', {}, c.title),
    h('dl', { class: 'cf-facts' },
      h('div', {}, h('dt', {}, 'Where'), h('dd', {}, c.place || '')),
      h('div', {}, h('dt', {}, 'The case'), h('dd', {}, c.victim || '')),
      h('div', {}, h('dt', {}, 'When'), h('dd', {}, `${when.join(', ')}.`)),
      h('div', {}, h('dt', {}, 'Status'), h('dd', {}, closed ? 'Closed on your word.' : reopened ? `Reopened ${cs.reopened || 1} ${cs.reopened === 1 ? 'time' : 'times'}. The last verdict is still on record below.` : 'Open. You are still on it.'))));

  // ---------------- what happened ----------------
  const watchOpen = h('button', { class: 'btn btn--small cf-watch', type: 'button', onclick: () => replay('opening') }, playIcon(), 'Watch again');
  const sections = [];
  const happened = [
    block('How it began', 'cf-begin', transcript(openingPanels(caseId), { caseTitle: c.title }), watchOpen, 'Read the opening'),
  ];
  let watchEnd = null;
  if (v) {
    watchEnd = h('button', { class: 'btn btn--small cf-watch', type: 'button', onclick: () => replay('ending') }, playIcon(), 'Watch again');
    happened.push(block('How it ended', 'cf-end', transcript(endingPanels(caseId), { caseTitle: c.title }), watchEnd, 'Read the ending'));
    happened.push(h('div', { class: 'cf-verdict' },
      h('h3', {}, reopened ? 'Your last verdict' : 'Your verdict'),
      h('p', { class: 'doc' }, v.names.length ? `Charged on your word: ${listNames(v.names)}.` : 'Nobody charged.'),
      v.questions.length ? h('ul', { class: 'cf-answers' }, v.questions.map(({ q, o }) => h('li', { class: 'doc' }, `${q.q} Your answer: ${o.label}.`))) : null,
      h('p', { class: `cf-right ${v.right ? 'is-right' : 'is-wrong'}` },
        h('span', { class: 'cf-right-mark', 'aria-hidden': 'true' }, v.right ? '✓' : '✗'),
        v.right ? 'Correct verdict.' : 'Wrong verdict.'),
      v.right ? null : h('p', { class: 'cf-note' }, closed ? 'Somewhere in this file is the mistake. You can reopen it from the case archive and stand in the deduction room again.' : 'You have reopened it. Find the mistake, and stand in the deduction room again.')));
  } else {
    happened.push(h('p', { class: 'cf-open-note doc' }, 'Not closed yet. How it ends is up to you.'));
  }
  sections.push(section('cf-what', 'What happened', happened));

  // ---------------- exhibits ----------------
  const { levels, solved, current } = levelStatus(c, cs);
  const exhibits = solved.map((l) => {
    const ev = l.evidence;
    const img = h('span', { class: 'cf-ex-img', 'aria-hidden': 'true' });
    paintInto(img, ev.img, '', 'night');
    return h('li', {}, h('button', { class: 'cf-ex', type: 'button', 'aria-label': `Exhibit ${ev.tag}: ${ev.title}. Open it large`, onclick: () => openEvidence({ caseId, levelId: l.id, list: solved }) },
      h('span', { class: 'cf-ex-photo' }, img, h('span', { class: 'cf-ex-tag', 'aria-hidden': 'true' }, String(ev.tag))),
      h('span', { class: 'cf-ex-body' },
        h('span', { class: 'cf-ex-kicker' }, `Exhibit ${ev.tag}. ${l.phase}`),
        h('strong', { class: 'cf-ex-title' }, ev.title),
        h('span', { class: 'cf-ex-text' }, ev.text))));
  });
  if (current && !closed) {
    exhibits.push(h('li', {}, h('div', { class: 'cf-ex is-locked' },
      h('span', { class: 'cf-ex-photo' }, h('span', { class: 'cf-ex-lock', 'aria-hidden': 'true', html: lockIcon() }), h('span', { class: 'cf-ex-tag', 'aria-hidden': 'true' }, String(current.evidence.tag))),
      h('span', { class: 'cf-ex-body' }, h('strong', { class: 'cf-ex-title' }, `Exhibit ${current.evidence.tag}: not found yet`), h('span', { class: 'cf-ex-text' }, 'Your next lead is waiting on the case map.')))));
    if (levels.length - solved.length > 1) {
      exhibits.push(h('li', {}, h('div', { class: 'cf-ex is-fog' }, h('span', { class: 'cf-ex-body' }, h('strong', { class: 'cf-ex-title' }, '…'), h('span', { class: 'cf-ex-text' }, 'The trail goes on. Nobody will tell you how far.')))));
    }
  }
  sections.push(section('cf-exhibits', 'Exhibits', [
    h('p', { class: 'cf-lede' }, solved.length ? `${solved.length} ${solved.length === 1 ? 'exhibit' : 'exhibits'} found. Tap one to open it large.` : 'Nothing found yet. Every puzzle you solve adds an exhibit here.'),
    exhibits.length ? h('ol', { class: 'cf-exlist' }, exhibits) : null,
  ]));

  // ---------------- persons of interest ----------------
  const people = revealedSuspects(c, cs);
  const marks = cs.board?.marks || {};
  sections.push(section('cf-people', 'Persons of interest', people.length
    ? h('ul', { class: 'cf-people' }, people.map((s) => {
      const face = h('span', { class: 'cf-face', 'aria-hidden': 'true' });
      hasImage(s.img).then((ok) => { if (ok) face.style.backgroundImage = `url(${imgUrl(s.img)})`; else face.innerHTML = avatarSvg(s.look); });
      const mark = marks[s.id];
      const charged = v && v.has(s.id);
      return h('li', { class: 'cf-person' }, face,
        h('div', { class: 'cf-person-text' },
          h('h3', {}, s.name),
          h('p', { class: 'cf-role' }, s.role),
          s.revealLine ? h('p', { class: 'cf-reveal doc' }, s.revealLine) : null,
          h('p', { class: 'cf-tags' },
            h('span', { class: `cf-mark${mark ? ` cf-mark--${mark}` : ''}` }, mark ? `Your stamp: ${MARK_LABEL[mark]}` : 'No stamp on the board'),
            charged ? h('span', { class: 'cf-mark cf-mark--charged' }, reopened ? 'Charged last time' : 'Charged') : null)));
    }))
    : h('p', { class: 'cf-lede' }, 'Nobody yet. The clues will name them.')));

  // ---------------- your choices ----------------
  if (v) {
    const ch = choicesFor(caseId);
    sections.push(section('cf-choices', 'Your choices', ch.length
      ? h('ul', { class: 'cf-choices' }, ch.map((x) => h('li', { class: 'doc' }, x.text)))
      : h('p', { class: 'cf-lede' }, 'Nothing you decided here has followed you yet.')));
  }

  // in-page jumps (handy on phones, where the file is long)
  const jumps = h('nav', { class: 'cf-jumps', 'aria-label': 'Sections of this file' },
    sections.map((sec) => h('button', { class: 'chip', type: 'button', onclick: () => { sec.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); sec.querySelector('h2')?.focus({ preventScroll: true }); } }, sec.dataset.label)));

  const scroll = h('div', { class: 'scroll cf-scroll' }, h('div', { class: 'cf' }, head, jumps, sections));
  host.append(h('section', { class: 'screen cf-screen' }, topbar, scroll));

  if (focus === 'opening') requestAnimationFrame(() => { watchOpen.scrollIntoView({ block: 'center' }); watchOpen.focus({ preventScroll: true }); });
  else if (focus === 'ending' && watchEnd) requestAnimationFrame(() => { watchEnd.scrollIntoView({ block: 'center' }); watchEnd.focus({ preventScroll: true }); });
  return {};
}

function section(id, label, children) {
  const el = h('section', { class: 'cf-section', id, 'aria-labelledby': `${id}-h`, 'data-label': label },
    h('h2', { id: `${id}-h`, tabindex: '-1' }, label), children);
  return el;
}

/** A transcript block: heading, Watch again, and the script folded inside a <details>. */
function block(title, cls, lines, button, summary) {
  return h('div', { class: `cf-block ${cls}` },
    h('div', { class: 'cf-block-head' }, h('h3', {}, title), button),
    lines.length
      ? h('details', { class: 'cf-script' }, h('summary', {}, summary), h('div', { class: 'cf-script-body' }, lines))
      : h('p', { class: 'cf-lede' }, 'No transcript on file.'));
}

const playIcon = () => h('span', { class: 'cf-ico', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg>' });
const lockIcon = () => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
