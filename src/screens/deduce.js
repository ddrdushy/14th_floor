// The deduction room. No hints. Charge whoever you believe is responsible, one or more,
// and answer any further questions the case asks (where someone is hiding, what was taken).
import { h, modal } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { save } from '../core/state.js';
import { CASES, getCaseState, activeLevels, judge, caseHeading, resolveCaseId } from '../data/cases.js';
import { avatarSvg } from '../core/avatar.js';
import { hasImage, imgUrl } from '../core/assets.js';
import { sfx } from '../core/audio.js';
import { app } from '../core/app.js';
import '../styles/cases.css';

// Kept for older callers: close a case on a list of charged suspects.
export function applyFlags(caseId, charged, answers = {}) {
  judge(caseId, { ...answers, charged });
}

const listNames = (names) => (names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

export function mount(host, { caseId } = {}) {
  app.scene.setMode('dim');
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  const D = c.deduction || {};
  const extra = D.questions || [];
  const chosen = new Set();
  const answers = {};
  const evidence = activeLevels(c, cs).filter((l) => cs.solved[l.id]);
  app.music?.play?.('deduction');

  const charge = h('button', { class: 'btn btn--primary', disabled: true, onclick: confirm }, D.button || 'Make the arrests');
  const count = h('span', { class: 'doc' }, 'Nobody charged yet.');
  const nameOf = (id) => c.suspects.find((x) => x.id === id).name;

  function refresh() {
    const missing = extra.filter((q) => !answers[q.id]);
    charge.disabled = !chosen.size || missing.length > 0;
    const who = chosen.size ? `Charging ${listNames([...chosen].map(nameOf))}.` : 'Nobody charged yet.';
    const rest = extra.map((q) => {
      const o = q.options.find((x) => x.id === answers[q.id]);
      return o ? ` ${q.short || q.q} ${o.label}.` : '';
    }).join('');
    count.textContent = `${who}${rest}${chosen.size && missing.length ? ` ${missing[0].q}` : ''}`;
  }

  const dossiers = c.suspects.map((s) => {
    const portrait = h('div', { class: 'portrait' });
    hasImage(s.img).then((ok) => { if (ok) portrait.style.backgroundImage = `url(${imgUrl(s.img)})`; else portrait.innerHTML = avatarSvg(s.look); });
    const b = h('button', { class: 'dossier', 'aria-pressed': 'false', onclick: () => {
      chosen.has(s.id) ? chosen.delete(s.id) : chosen.add(s.id);
      b.setAttribute('aria-pressed', String(chosen.has(s.id)));
      sfx.stamp();
      refresh();
    } },
    portrait,
    h('span', { class: 'charge' }, 'Charged'),
    h('h3', {}, s.name),
    h('p', { class: 'role' }, s.role),
    h('dl', {}, h('dt', {}, 'Known motive'), h('dd', {}, s.motive), h('dt', {}, 'Their story'), h('dd', {}, s.claim)));
    return b;
  });

  // further questions: one choice each, drawn from what the evidence suggests
  const questionBlocks = extra.map((q, qi) => {
    const cards = q.options.map((o) => {
      const b = h('button', { class: 'dq-option', 'aria-pressed': 'false', onclick: () => {
        answers[q.id] = o.id;
        cards.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        sfx.stamp();
        refresh();
      } },
      h('span', { class: 'dq-pin', 'aria-hidden': 'true' }, String.fromCharCode(65 + q.options.indexOf(o))),
      h('strong', {}, o.label),
      o.note ? h('span', { class: 'dq-note' }, o.note) : null);
      return b;
    });
    return h('section', { class: 'dq', 'aria-labelledby': `dq-${qi}` },
      h('h2', { class: 'display dq-title', id: `dq-${qi}` }, q.q),
      q.lede ? h('p', { class: 'lede' }, q.lede) : null,
      h('div', { class: 'dq-grid', role: 'group', 'aria-label': q.q }, cards));
  });

  const exhibitList = h('ol', { class: 'doc', style: { paddingLeft: '1.3em', color: 'var(--mist)', maxWidth: '70ch' } },
    evidence.map((l) => h('li', { style: { marginBottom: '6px' } }, h('strong', { style: { color: 'var(--paper)' } }, `${l.evidence.title}. `), l.evidence.short)));

  const root = h('section', { class: 'screen deduce-screen' },
    h('header', { class: 'topbar' },
      backButton('Case map', () => go('map', { caseId }), 'Map'),
      h('div', { class: 'topbar-title' }, h('strong', {}, 'Deduction room'), h('span', {}, caseHeading(c))),
      h('button', { class: 'btn btn--small nav-dup', onclick: () => go('board', { caseId, back: 'map' }) }, 'Case board')),
    h('div', { class: 'scroll', style: { flex: 1 } },
      h('div', { class: 'deduce-wrap' },
        h('h1', {}, c.question),
        h('p', { class: 'lede' }, D.lede || 'Farah will make the arrests on your word alone. Charge everyone you believe is responsible, and only them. There is no one to tell you if you are right.'),
        h('div', { class: 'suspect-row' }, dossiers),
        questionBlocks,
        h('h2', { class: 'display', style: { fontSize: '1.8rem', margin: '36px 0 10px' } }, 'What you know'),
        exhibitList)),
    h('div', { class: 'deduce-bar' }, count, charge));
  host.append(root);

  async function confirm() {
    const names = listNames([...chosen].map(nameOf));
    const body = h('div', {},
      h('p', {}, (D.confirm || 'Farah will charge {names}. Once the file is closed, the city moves on.').replace('{names}', names)),
      extra.map((q) => h('p', { class: 'doc' }, `${q.q} ${q.options.find((o) => o.id === answers[q.id]).label}.`)));
    const ok = await modal({
      title: D.confirmTitle || 'Make the arrests?',
      body,
      buttons: [{ label: 'Look again', value: false }, { label: D.confirmButton || 'Charge them', kind: 'primary', value: true }],
    });
    if (!ok) return;
    judge(caseId, { ...answers, charged: [...chosen] });
    save();
    go('outcome', { caseId });
  }
  refresh();
  return {};
}
