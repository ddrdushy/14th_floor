// The case list and the rules that decide what each case looks like for this player.
// Cases are played in CASE_ORDER. A case's levels, cinematic panels and lines may carry
// `when: (flags) => boolean`, so choices in earlier cases add or change what comes later.
import { CASE01 } from './case01.js';
import { SIDE01 } from './side01.js';
import { CASE02 } from './case02.js';
import { state, caseState } from '../core/state.js';

export const CASES = { case01: CASE01, side01: SIDE01, case02: CASE02 };
export const CASE_ORDER = ['case01', 'side01', 'case02'];

// What the phone says once every written case is closed.
export const COMING_SOON = {
  title: 'Case 3',
  teaser: 'A small parcel with a Colombo postmark is waiting with Bala Anne. Inside: one uncut blue sapphire, wrapped in a mamak receipt. The receipt is folded into the shape of a kancil.',
};

/** Short label for a case: "Case 2" or "Side case". */
export const caseLabel = (c) => c.label || `Case ${c.number}`;
export const caseHeading = (c) => `${caseLabel(c)}: ${c.title}`;

/** Case progress, created with the case's own defaults (hints, a snapshot of the story flags). */
export function getCaseState(caseId) {
  const s = state();
  const isNew = !s.cases[caseId];
  const cs = caseState(caseId);
  const c = CASES[caseId];
  if (isNew && c) {
    cs.hints = c.hints ?? 5;
    cs.hintsMax = cs.hints;
    // freeze the flags this case was opened with, so reopening an older case later
    // never adds or removes puzzles in the middle of this one
    cs.flags = { ...s.flags };
  }
  if (cs.hintsMax == null) cs.hintsMax = c?.hints ?? 5;
  return cs;
}

/** The story flags a case is judged by: its own snapshot, or the live flags for older saves. */
export const flagsFor = (cs) => (cs && cs.flags) || state().flags || {};

const passes = (x, flags) => !x || typeof x.when !== 'function' || !!x.when(flags);

/**
 * The levels this player gets in this case, in order. Solved levels always stay.
 * Each returned level is a shallow copy with its evidence tag numbered by position.
 */
export function activeLevels(c, cs) {
  const flags = flagsFor(cs);
  return c.levels
    .filter((l) => (cs && cs.solved[l.id]) || passes(l, flags))
    .map((l, i) => ({ ...l, evidence: { ...l.evidence, tag: i + 1 } }));
}

export function findLevel(c, cs, levelId) {
  return activeLevels(c, cs).find((l) => l.id === levelId)
    || (() => { const l = c.levels.find((x) => x.id === levelId); return l ? { ...l, evidence: { ...l.evidence, tag: l.evidence.tag || 0 } } : null; })();
}

export function levelStatus(c, cs) {
  const levels = activeLevels(c, cs);
  const solved = levels.filter((l) => cs.solved[l.id]);
  const current = levels.find((l) => !cs.solved[l.id]) || null;
  return { levels, solved, current, allSolved: !current };
}

/** Drop panels and lines whose `when` does not hold for these flags. */
export function filterPanels(panels, flags = state().flags) {
  return panels
    .filter((p) => passes(p, flags))
    .map((p) => (p.lines ? { ...p, lines: p.lines.filter((ln) => passes(ln, flags)) } : p))
    .filter((p) => p.title || !p.lines || p.lines.length || p.keepEmpty);
}

/**
 * Where the player stands in the case list.
 *  open:    cases started and not closed, in order
 *  latest:  the furthest case started (open or closed)
 *  next:    the next case not yet started, or null
 *  ringing: true when the next case is waiting on the phone (its predecessor is closed)
 */
export function progress() {
  const s = state();
  const started = CASE_ORDER.filter((id) => s.cases[id]);
  const open = started.filter((id) => s.cases[id].status !== 'closed');
  const latest = started[started.length - 1] || null;
  const nextIdx = CASE_ORDER.findIndex((id) => !s.cases[id]);
  const next = nextIdx >= 0 ? CASE_ORDER[nextIdx] : null;
  const prev = nextIdx > 0 ? CASE_ORDER[nextIdx - 1] : null;
  const ringing = !!next && !!prev && s.cases[prev]?.status === 'closed';
  const allClosed = !next && started.length === CASE_ORDER.length && !open.length;
  return { started, open, latest, next, ringing, allClosed };
}

/**
 * Close a case on the player's answers: record them and set the case's hidden flags.
 * answers.charged = suspect ids; other keys answer the case's extra questions.
 */
export function judge(caseId, answers) {
  const c = CASES[caseId];
  const s = state();
  const cs = getCaseState(caseId);
  const charged = answers.charged || [];
  cs.accusation = [...charged];
  cs.answers = { ...answers };
  delete cs.answers.charged;
  cs.status = 'closed';
  cs.closedAt = Date.now();
  const result = c.flags ? c.flags({ charged, answers: cs.answers }) : {};
  // flags a case owns are cleared first, so reopening and re-accusing replaces the old verdict
  for (const name of c.flagNames || Object.keys(result)) delete s.flags[name];
  for (const [name, on] of Object.entries(result)) if (on) s.flags[name] = true;
  return cs;
}

/** Everything an ending or summary needs to know about the verdict. */
export function verdictOf(caseId) {
  const c = CASES[caseId];
  const cs = getCaseState(caseId);
  const charged = cs.accusation || [];
  const answers = cs.answers || {};
  return {
    c, cs, charged, answers,
    has: (id) => charged.includes(id),
    flags: state().flags,
    you: state().profile?.name || 'Detective',
    pronoun: state().profile?.pronoun || 'they',
  };
}

/** The case the player is most likely looking for: the furthest open one, else the furthest started. */
export function currentCaseId() {
  const p = progress();
  const id = p.open[p.open.length - 1] || p.latest || CASE_ORDER[0];
  return CASES[id] ? id : CASE_ORDER[0];
}

/** Resolve a caseId parameter: unknown or missing ids fall back to the current case. */
export const resolveCaseId = (id) => (id && CASES[id] ? id : currentCaseId());
