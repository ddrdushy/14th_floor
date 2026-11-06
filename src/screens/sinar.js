// The Sinar File: a red-string investigation file on the man at the top of Sinar Holdings.
// Everything in it is copied from what the cases have already shown this player (data/chairman.js).
// Nothing here names him, describes his face or ties him to anybody: the player's own theory at the
// top is theirs alone, and the file never says whether it is right.
import { h, toast } from '../core/ui.js';
import { go } from '../core/router.js';
import { backButton } from '../core/nav.js';
import { state } from '../core/state.js';
import { sharing } from '../core/telemetry.js';
import { CASES, CASE_ORDER, caseLabel } from '../data/cases.js';
import { paintInto, hasImage, imgUrl } from '../core/assets.js';
import { avatarSvg } from '../core/avatar.js';
import { app } from '../core/app.js';
import { threadsFor, knownFor, unknownFor, aliasesFor, KNOWN_GROUPS, NO_THREAD, candidates } from '../data/chairman.js';
import { readGuess, saveGuess, shareFor } from '../core/casebook.js';
import '../styles/casebook.css';

const BACKS = {
  office: ['Office', 'Office', () => go('office')],
  archive: ['Case archive', 'Archive', () => go('archive')],
};

export function mount(host, { back = 'office', caseId } = {}) {
  app.scene.setMode('dim');
  const s = state();
  const [backLabel, backShort, backGo] = back === 'closed' && caseId
    ? ['Closed file', 'Back', () => go('closed', { caseId })]
    : BACKS[back] || BACKS.office;

  const threads = threadsFor(s);
  const openCount = threads.filter((t) => t.open).length;

  // ---------------- the folder cover ----------------
  const aliases = aliasesFor(s);
  const cover = h('header', { class: 'sf-cover' },
    h('p', { class: 'sf-kicker' }, 'Floor 14. Private file'),
    h('h1', {}, 'The Sinar File'),
    h('div', { class: 'sf-subject' },
      h('div', { class: 'sf-mug', role: 'img', 'aria-label': 'No photograph on file' },
        h('span', { class: 'sf-mug-q', 'aria-hidden': 'true' }, '?'),
        h('span', { class: 'sf-mug-cap' }, 'No photograph')),
      h('dl', { class: 'sf-fields' },
        h('div', {}, h('dt', {}, 'Subject'), h('dd', {}, 'The Chairman, Sinar Holdings Berhad')),
        h('div', {}, h('dt', {}, 'Name'), h('dd', {}, h('span', { class: 'sf-redact', 'aria-hidden': 'true' }, 'XXXXXXXXXXXX'), h('span', { class: 'sr-only' }, 'Unknown'))),
        h('div', {}, h('dt', {}, 'Face'), h('dd', {}, 'Nobody in these files has described it.')),
        aliases.length ? h('div', {}, h('dt', {}, 'Known as'), h('dd', {}, aliases.map((a) => a.text).join(', '))) : null,
        h('div', {}, h('dt', {}, 'Threads'), h('dd', {}, openCount ? `${openCount} pinned so far.` : 'None yet. Keep working your cases.')))));

  // ---------------- your theory ----------------
  const theory = h('section', { class: 'sf-theory', 'aria-labelledby': 'sf-theory-h' });
  function drawTheory(share) {
    const { guess, history } = readGuess();
    const cands = candidates(state());
    const cand = guess ? cands.find((x) => x.id === guess.who) : null;
    const name = cand?.name || (guess ? 'Somebody no longer in your files' : null);
    const kids = [h('h2', { id: 'sf-theory-h' }, 'Your theory')];
    if (guess) {
      const face = facePhoto(cand);
      kids.push(h('div', { class: 'sf-guess' }, face,
        h('div', { class: 'sf-guess-text' },
          h('p', { class: 'sf-guess-label' }, 'You suspect'),
          h('p', { class: 'sf-guess-name' }, name),
          guess.why ? h('blockquote', { class: 'doc' }, guess.why) : h('p', { class: 'cf-lede' }, 'No reason written down.'),
          share != null ? h('p', { class: 'sf-share' }, `You and ${share}% of detectives suspect ${name}.`) : null)));
      if (history.length > 1) kids.push(historyList(history, cands));
      kids.push(h('p', { class: 'sf-theory-note' }, 'Only you can see this, and it stays your theory. The file will never tell you whether it is right.'));
      kids.push(h('button', { class: 'btn btn--paper', type: 'button', onclick: openPicker }, 'Change your theory'));
    } else {
      kids.push(h('p', { class: 'doc' }, 'Who do you think he is? Pick anybody you have met in these files, or nobody you have met yet, and write down why.'));
      kids.push(h('button', { class: 'btn btn--primary', type: 'button', onclick: openPicker }, 'Name your suspect'));
    }
    theory.replaceChildren(...kids);
  }
  drawTheory(shareFor(readGuess().guess));

  function openPicker() {
    guessDialog(readGuess().guess).then((r) => {
      if (!r) return;
      const pending = saveGuess(r.who, r.why);
      drawTheory(null);
      toast('Theory written down.');
      pending.then((share) => { if (share != null && theory.isConnected) drawTheory(share); });
      theory.querySelector('h2')?.focus?.();
    });
  }

  // ---------------- threads, grouped by case in story order ----------------
  const groups = [];
  for (const id of CASE_ORDER) {
    const c = CASES[id];
    if (!c || !s.cases?.[id]) continue; // only the cases this player has reached
    const mine = threads.filter((t) => t.caseId === id);
    const items = mine.map((t) => (t.open ? threadCard(t) : redacted(t)));
    if (!mine.length && NO_THREAD[id]) items.push(h('li', { class: 'sf-none doc' }, NO_THREAD[id]));
    if (!items.length) continue;
    groups.push(h('section', { class: 'sf-group', 'aria-labelledby': `sf-g-${id}` },
      h('h3', { class: 'sf-group-h', id: `sf-g-${id}` }, h('span', { class: 'sf-pin', 'aria-hidden': 'true' }), `${caseLabel(c)}: ${c.title}`),
      h('ol', { class: 'sf-threads' }, items)));
  }
  const string = h('section', { class: 'sf-string', 'aria-labelledby': 'sf-threads-h' },
    h('h2', { id: 'sf-threads-h' }, 'Threads'),
    h('p', { class: 'cf-lede' }, 'Every place a case has touched him, in the order you found it. Blacked-out lines are still out there.'),
    groups.length ? groups : h('p', { class: 'doc sf-empty' }, 'Nothing pinned yet. Somewhere in your cases, a name is waiting.'));

  // ---------------- what we know / don't know ----------------
  const known = knownFor(s);
  const knownBox = h('section', { class: 'sf-known', 'aria-labelledby': 'sf-known-h' },
    h('h2', { id: 'sf-known-h' }, 'What we know'),
    known.length
      ? h('div', { class: 'sf-known-grid' }, KNOWN_GROUPS.map((g) => {
        const facts = known.filter((k) => k.group === g.id);
        return h('div', { class: `sf-kgroup${facts.length ? '' : ' is-empty'}` },
          h('h3', {}, g.label),
          facts.length ? h('ul', {}, facts.map((k) => h('li', {}, k.text))) : h('p', { class: 'sf-nothing' }, 'Nothing yet.'));
      }))
      : h('p', { class: 'doc' }, 'Almost nothing. That is how he likes it.'));
  const unknown = unknownFor(s);
  const unknownBox = h('section', { class: 'sf-unknown', 'aria-labelledby': 'sf-unknown-h' },
    h('h2', { id: 'sf-unknown-h' }, 'What we don\'t know'),
    h('ul', { class: 'sf-questions' }, unknown.map((u) => h('li', {}, h('span', { class: 'sf-q', 'aria-hidden': 'true' }, '?'), h('span', {}, u.q)))));

  const root = h('section', { class: 'screen sf-screen' },
    h('header', { class: 'topbar' },
      backButton(backLabel, backGo, backShort),
      h('div', { class: 'topbar-title' }, h('strong', {}, 'The Sinar File'), h('span', {}, 'Everything the cases have shown you about him.'))),
    h('div', { class: 'scroll sf-scroll' },
      h('div', { class: 'sf' },
        h('div', { class: 'sf-main' }, cover, theory, string),
        h('aside', { class: 'sf-side', 'aria-label': 'Summary' }, knownBox, unknownBox))));
  host.append(root);
  return {};
}

function threadCard(t) {
  const img = h('span', { class: 'sf-thumb', 'aria-hidden': 'true' });
  paintInto(img, t.img, '', 'night');
  return h('li', { class: 'sf-thread' },
    img,
    h('div', { class: 'sf-thread-body' },
      h('h4', {}, t.title),
      h('p', { class: 'doc' }, t.text),
      h('p', { class: 'sf-cite' }, citation(t))));
}

function redacted(t) {
  // widths vary by id so the bars look typed, not stamped
  const n = [...t.id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const w = (k) => `${55 + ((n * (k + 3)) % 40)}%`;
  return h('li', { class: 'sf-thread is-redacted' },
    h('span', { class: 'sr-only' }, 'A thread you have not found yet.'),
    h('div', { class: 'sf-bars', 'aria-hidden': 'true' }, h('i', { style: { width: w(1) } }), h('i', { style: { width: w(2) } }), h('i', { style: { width: w(3) } })));
}

function citation(t) {
  const c = CASES[t.caseId];
  if (t.from === 'opening') return `From the opening of ${caseLabel(c)}.`;
  if (t.from === 'ending') return `From the ending of ${caseLabel(c)}, as you got it.`;
  const l = c.levels.find((x) => x.id === t.from);
  return l ? `From ${caseLabel(c)}, ${l.phase}: "${l.evidence.title}".` : `From ${caseLabel(c)}.`;
}

function facePhoto(cand) {
  const face = h('span', { class: 'sf-guess-face', 'aria-hidden': 'true' });
  if (!cand || cand.id === 'char:unmet') { face.textContent = '?'; face.classList.add('is-blank'); return face; }
  if (cand.img) hasImage(cand.img).then((ok) => { if (ok) face.style.backgroundImage = `url(${imgUrl(cand.img)})`; else if (cand.look) face.innerHTML = avatarSvg(cand.look); else { face.textContent = initials(cand.name); face.classList.add('is-blank'); } });
  else { face.textContent = initials(cand.name); face.classList.add('is-blank'); }
  return face;
}
const initials = (name) => name.replace(/^(Inspector|Fire Officer|Dr\.|Dato'|Tan Sri|Uncle|Madam|Mak|Supt\.)\s+/i, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function historyList(history, cands) {
  const nameOf = (id) => cands.find((x) => x.id === id)?.name || 'Somebody no longer in your files';
  const when = (e) => (e.after && CASES[e.after] ? `After ${caseLabel(CASES[e.after])}` : 'Before your first verdict');
  return h('details', { class: 'sf-history' },
    h('summary', {}, `How your theory has moved (${history.length})`),
    h('ol', {}, history.slice().reverse().map((e) => h('li', {},
      h('span', { class: 'sf-h-when' }, when(e)),
      h('span', { class: 'sf-h-who' }, nameOf(e.who)),
      e.why ? h('span', { class: 'sf-h-why doc' }, e.why) : null))));
}

/** The guess picker. Resolves to { who, why } or null. A plain dialog: Esc and Back close it. */
function guessDialog(current) {
  return new Promise((resolve) => {
    const cands = candidates(state());
    let picked = current && cands.some((x) => x.id === current.who) ? current.who : null;
    const overlay = document.getElementById('overlay');
    const before = document.activeElement;
    const why = h('textarea', { class: 'text-input sf-why', id: 'sf-why', maxlength: '280', rows: '3', placeholder: 'What makes you think so?' });
    why.value = current?.why || '';
    const count = h('span', { class: 'sf-count', 'aria-live': 'polite' });
    const saveBtn = h('button', { class: 'btn btn--primary', type: 'button', onclick: () => done({ who: picked, why: why.value.trim() }) }, 'Write it down');
    const refresh = () => {
      count.textContent = `${why.value.length} / 280`;
      saveBtn.disabled = !picked;
    };
    why.addEventListener('input', refresh);
    const opts = cands.map((cand) => {
      const radio = h('input', { type: 'radio', name: 'sf-cand', value: cand.id, class: 'sf-radio', checked: cand.id === picked });
      radio.addEventListener('change', () => { picked = cand.id; refresh(); });
      return h('label', { class: `sf-cand${cand.id === 'char:unmet' ? ' is-unmet' : ''}` }, radio, facePhoto(cand),
        h('span', { class: 'sf-cand-text' }, h('strong', {}, cand.name), h('span', {}, cand.where)));
    });
    const box = h('div', { class: 'modal sf-picker', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sf-picker-h' },
      h('h2', { id: 'sf-picker-h' }, 'Who is the Chairman?'),
      h('p', { class: 'sf-picker-lede' }, 'Your guess, from the people in your files. You can change it whenever you like; every change is kept.'),
      h('fieldset', { class: 'sf-cands' }, h('legend', { class: 'sr-only' }, 'Your suspect'), h('div', { class: 'sf-cand-grid' }, opts)),
      h('label', { class: 'sf-why-label', for: 'sf-why' }, 'Why? ', h('span', { class: 'muted-ink' }, '(optional, 280 characters)')),
      why, count,
      sharing() ? h('p', { class: 'sf-privacy' }, 'Your guess is shared anonymously, so you can see how many detectives agree. Turn this off in Settings, under "Share anonymous progress".') : null,
      h('div', { class: 'actions' }, h('button', { class: 'btn btn--paper', type: 'button', onclick: () => done(null) }, 'Cancel'), saveBtn));
    const backdrop = h('div', { class: 'modal-backdrop', onclick: (e) => { if (e.target === backdrop) done(null); } }, box);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); done(null); return; }
      if (e.key === 'Tab') {
        const f = [...box.querySelectorAll('input:checked, input[type=radio]:not(:checked), textarea, button')]
          .filter((x) => !x.disabled && !(x.type === 'radio' && !x.checked && box.querySelector('input[type=radio]:checked')));
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1]?.focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0]?.focus(); }
      }
    };
    function done(v) {
      backdrop.remove();
      document.removeEventListener('keydown', onKey, true);
      if (before?.isConnected) before.focus?.({ preventScroll: true });
      resolve(v && v.who ? v : null);
    }
    overlay.append(backdrop);
    document.addEventListener('keydown', onKey, true);
    refresh();
    requestAnimationFrame(() => (box.querySelector('input:checked') || box.querySelector('input[type=radio]'))?.focus({ preventScroll: false }));
  });
}
