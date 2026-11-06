// The case book: everything the case file reader, the Sinar File and "Previously on Floor 14" share.
//
//   verdictFor(caseId)        the verdict on record (null if none): who was charged, the answers,
//                             whether it was right, and the flags the ending was played with
//   openingPanels(caseId)     the opening cinematic as this player saw it (their flag snapshot)
//   endingPanels(caseId)      the ending as this player got it
//   transcript(panels)        those panels as readable text
//   storySoFar() / openStorySoFar()   "Previously on Floor 14"
//   checkReturn()             offer the story so far once, after 3+ days away from an open case
//   chairman guess            readGuess / saveGuess (state().chairman) and the server share
import { h, modal } from './ui.js';
import { go } from './router.js';
import { state, save } from './state.js';
import { playerId, sharing, verdictCorrect } from './telemetry.js';
import { CASES, CASE_ORDER, filterPanels, flagsFor, caseHeading, progress } from '../data/cases.js';
import { INTRO } from '../data/intro.js';
import { RECAPS, SETUPS, CHOICES } from '../data/casebook.js';
import { candidates, lastClosedCase, fileOpen } from '../data/chairman.js';

export const caseStateOf = (caseId) => state().cases?.[caseId] || null;
/** A verdict is on record (the ending has played), even if the file was reopened since. */
export const hasVerdict = (cs) => !!(cs && cs.closedAt && Array.isArray(cs.accusation));
export const listNames = (names) => (names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

/** The flags this case's ending was played with: its opening snapshot plus its own verdict. */
function endingFlags(c, cs, charged, answers) {
  const own = c.flags ? c.flags({ charged, answers }) : {};
  const base = { ...(cs.flags || state().flags || {}) };
  for (const n of c.flagNames || Object.keys(own)) delete base[n];
  for (const [n, on] of Object.entries(own)) if (on) base[n] = true;
  return { flags: base, own };
}

export function verdictFor(caseId) {
  const c = CASES[caseId];
  const cs = caseStateOf(caseId);
  if (!c || !hasVerdict(cs)) return null;
  const charged = cs.accusation || [];
  const answers = cs.answers || {};
  const { flags, own } = endingFlags(c, cs, charged, answers);
  let right = false;
  try { right = verdictCorrect(caseId, charged, answers); } catch { right = false; }
  return {
    c, cs, charged, answers, flags, own, right,
    has: (id) => charged.includes(id),
    you: state().profile?.name || 'Detective',
    pronoun: state().profile?.pronoun || 'they',
    names: charged.map((id) => c.suspects.find((s) => s.id === id)?.name).filter(Boolean),
    questions: (c.deduction?.questions || []).map((q) => ({ q, o: q.options.find((x) => x.id === answers[q.id]) })).filter((x) => x.o),
  };
}

/** The consequences this verdict set, in plain words (only flags that are on and have words). */
export function choicesFor(caseId) {
  const v = verdictFor(caseId);
  if (!v) return [];
  const words = CHOICES[caseId] || {};
  return Object.entries(v.own).filter(([n, on]) => on && words[n]).map(([n]) => ({ flag: n, text: words[n] }));
}

export function openingPanels(caseId) {
  const c = CASES[caseId];
  const cs = caseStateOf(caseId);
  if (!c) return [];
  if (c.openingScreen === 'intro') return INTRO;
  return filterPanels(c.opening || [], flagsFor(cs));
}

export function endingPanels(caseId) {
  const v = verdictFor(caseId);
  if (!v || typeof v.c.ending !== 'function') return [];
  try { return filterPanels(v.c.ending(v), v.flags); } catch (e) { console.error(e); return []; }
}

/** Panels as a readable script: a place line, then who said what (the original language small above). */
export function transcript(panels, { caseTitle } = {}) {
  const out = [];
  for (const p of panels) {
    if (p.title) {
      const t = typeof p.title === 'object' ? p.title : { kicker: null, name: caseTitle || 'Floor 14' };
      out.push(h('p', { class: 'tr-title' }, t.kicker ? h('span', {}, t.kicker) : null, t.name));
      continue;
    }
    const lines = (p.lines || []).filter((ln) => ln && ln.en && ln.en !== '[Incoming call]');
    const call = (p.lines || []).some((ln) => ln?.en === '[Incoming call]');
    if (!lines.length && !p.place) continue;
    out.push(h('div', { class: 'tr-panel' },
      p.place ? h('p', { class: 'tr-place' }, p.place) : null,
      call ? h('p', { class: 'tr-line tr-narr' }, h('em', {}, 'The phone rings. Unknown number.')) : null,
      lines.map((ln) => (ln.who
        ? h('p', { class: 'tr-line' },
          ln.orig && ln.orig !== ln.en ? h('span', { class: 'tr-orig', lang: 'mul' }, ln.orig) : null,
          h('span', { class: 'tr-who' }, `${ln.who}: `), ln.en)
        : h('p', { class: 'tr-line tr-narr' }, ln.en)))));
  }
  return out;
}

// ------------------------------------------------------------------------------------------------
// Previously on Floor 14

/** { recap: { caseId, heading, lines } | null, setup: { caseId, heading, lines } | null } */
export function storySoFar() {
  const s = state();
  const p = progress();
  const current = p.open[p.open.length - 1] || null;
  const limit = current ? CASE_ORDER.indexOf(current) : CASE_ORDER.length;
  let last = null;
  for (const id of CASE_ORDER.slice(0, limit)) if (hasVerdict(s.cases?.[id])) last = id;
  let recap = null;
  if (last && RECAPS[last]) {
    const v = verdictFor(last);
    try { recap = { caseId: last, heading: caseHeading(CASES[last]), lines: RECAPS[last](v) }; } catch (e) { console.error(e); }
  }
  let setup = null;
  if (current && SETUPS[current]) {
    setup = { caseId: current, heading: caseHeading(CASES[current]), lines: SETUPS[current](flagsFor(s.cases[current])) };
  }
  return { recap, setup };
}

export function openStorySoFar() {
  const { recap, setup } = storySoFar();
  const body = h('div', { class: 'sofar' },
    recap ? h('section', {}, h('p', { class: 'sofar-kicker' }, `Last time: ${recap.heading}`), recap.lines.map((t) => h('p', { class: 'doc' }, t))) : null,
    setup ? h('section', {}, h('p', { class: 'sofar-kicker' }, `Now: ${setup.heading}`), setup.lines.map((t) => h('p', { class: 'doc' }, t))) : null,
    !recap && !setup ? h('p', { class: 'doc' }, 'Every file you have touched is closed. The phone will ring when the next one is ready.') : null);
  const buttons = [];
  if (setup) buttons.push({ label: 'Read the file', value: 'file' });
  buttons.push({ label: setup ? 'Back to work' : 'Close', kind: 'primary', value: 'ok' });
  return modal({ title: 'Previously on Floor 14', body, buttons }).then((v) => {
    if (v === 'file' && setup) go('casefile', { caseId: setup.caseId, back: 'office' });
    return v;
  });
}

const DAY = 24 * 60 * 60 * 1000;
/** The latest moment the save shows the player doing anything. */
function lastActivity(s) {
  let t = Number(s.lastSeenAt) || 0;
  for (const cs of Object.values(s.cases || {})) {
    t = Math.max(t, Number(cs.openedAt) || 0, Number(cs.closedAt) || 0);
    for (const r of Object.values(cs.solved || {})) t = Math.max(t, Number(r?.at) || 0);
  }
  return t;
}

/**
 * Called by the office when it opens. After three or more days away from an open case, offer the
 * story so far, once: the visit is recorded straight away, so the offer does not come back until the
 * next long absence.
 */
export async function checkReturn() {
  const s = state();
  if (!s.profile) return;
  const now = Date.now();
  const last = lastActivity(s);
  s.lastSeenAt = now;
  save();
  const p = progress();
  if (!p.open.length || !last || now - last < 3 * DAY) return;
  const days = Math.floor((now - last) / DAY);
  const v = await modal({
    title: 'Welcome back',
    body: h('div', {}, h('p', { class: 'doc' }, `${days} days since you last opened a file. The rain has not stopped.`), h('p', {}, 'Do you want the story so far?')),
    buttons: [{ label: 'Straight back in', value: false }, { label: 'Story so far', kind: 'primary', value: true }],
  });
  if (v) await openStorySoFar();
}

// ------------------------------------------------------------------------------------------------
// The player's theory: who is the Chairman?

const HISTORY_MAX = 20;
export const readGuess = () => {
  const ch = state().chairman;
  return ch && typeof ch === 'object' ? { guess: ch.guess || null, history: Array.isArray(ch.history) ? ch.history : [] } : { guess: null, history: [] };
};

export function candidateById(id) {
  return candidates(state()).find((x) => x.id === id) || null;
}

/** Save a new theory. Every change is kept (newest last, at most 20). Resolves to the server share or null. */
export function saveGuess(who, why) {
  const s = state();
  const entry = { who, why: String(why || '').slice(0, 280), at: Date.now(), after: lastClosedCase(s) };
  const { history } = readGuess();
  const next = [...history, entry].slice(-HISTORY_MAX);
  s.chairman = { guess: entry, history: next };
  save();
  return sendGuess(entry);
}

let lastShare = null; // { at, who, share } from this session only
export const shareFor = (guess) => (guess && lastShare && lastShare.at === guess.at && lastShare.who === guess.who ? lastShare.share : null);

/** Fire and forget. Nothing is sent when the player has turned off sharing. */
async function sendGuess(entry) {
  if (!sharing()) return null;
  const cand = candidateById(entry.who);
  try {
    const res = await fetch('./api/chairman/guess', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ player_id: playerId(), who: entry.who, why: entry.why, after: entry.after, name: cand?.name || entry.who }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const share = data && data.ok && Number.isFinite(data.share) ? Math.round(data.share) : null;
    lastShare = { at: entry.at, who: entry.who, share };
    return share;
  } catch {
    return null;
  }
}

/**
 * The closed-case screen's one gentle nudge, once per verdict: a line with a link to the Sinar File.
 * Returns an element, or null when there is nothing to say.
 */
export function theoryNudge(caseId) {
  const s = state();
  const cs = s.cases?.[caseId];
  if (!cs?.closedAt || !fileOpen(s)) return null;
  s.sinarNudged = s.sinarNudged && typeof s.sinarNudged === 'object' ? s.sinarNudged : {};
  if (s.sinarNudged[caseId] === cs.closedAt) return null;
  s.sinarNudged[caseId] = cs.closedAt;
  save();
  const { guess } = readGuess();
  return h('p', { class: 'theory-nudge' },
    guess ? 'Has this changed your theory? ' : 'Who do you think sits at the top of Sinar? ',
    h('button', { class: 'linkish', type: 'button', onclick: () => go('sinar', { back: 'closed', caseId }) }, guess ? 'Open the Sinar File' : 'Name your suspect'));
}
