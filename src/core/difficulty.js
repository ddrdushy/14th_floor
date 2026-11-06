// Difficulty modes: Story (easier), Detective (the game as written) and Hardboiled (harder).
//
// The player's choice lives in state().settings.difficulty: 'story' | 'detective' | 'hardboiled'
// (default 'detective'). That key is a contract: the leaderboard reads it, and every solve records
// the mode it was played in (cs.solved[levelId].mode). A puzzle keeps the mode it was started in
// (cs.inprogress[levelId].mode), so a change in Settings takes effect from the next puzzle opened.
//
// adjust(game, params, mode) returns the level params for a mode. Rules:
//  - Detective returns the params untouched (the same object).
//  - Authored content is never changed: answers, codes, numbers, lines, labels, statements, maps,
//    pictures, clue lists. Only time, attempts, sizes of generated boards, tolerance and how much help
//    is shown move, and only for knobs the game module documents.
//  - Phone limits hold in every mode: shredder strips <= 10, searchlight size <= 8, mirrors size <= 7,
//    ledger columns <= 5 (no mode changes ledger columns at all).
//  - Story may switch on one free reveal where the game supports it (cipher: an extra letter;
//    anagram: definitions shown; maze: one camera view marked).
//
// Games with no safe knob, unchanged in every mode (they still get the per-case magnifier budget):
//   logicgrid, whoslying, timeline, nonogram, series, fingerprint, wordsearch (the leftover letters
//   spell an authored message, so the grid cannot change), theory (the number of points the prosecutor
//   needs is written into the level's clue).
//
// Magnifiers: each case has a base number (case file `hints`). Story doubles it, Hardboiled halves it
// (rounded up). syncHints() keeps cs.hints / cs.hintsMax in step with the mode, so the map, the
// closed-case file and the puzzle all read the same numbers; magnifiers already used stay used.
import { state } from './state.js';

export const MODES = ['story', 'detective', 'hardboiled'];
export const DEFAULT_MODE = 'detective';

export const MODE_INFO = {
  story: {
    label: 'Story',
    short: 'For the story. Smaller boards, more time, twice the magnifiers.',
    long: 'Smaller boards and fewer pieces, more time and more tries, twice the magnifiers, and a free head start where a puzzle has one.',
  },
  detective: {
    label: 'Detective',
    short: 'The game as written. A fair fight.',
    long: 'Every puzzle as it was written. The intended balance of time, tries and magnifiers.',
  },
  hardboiled: {
    label: 'Hardboiled',
    short: 'Bigger boards, tighter limits, half the magnifiers.',
    long: 'Bigger boards, tighter limits and less time, half the magnifiers, and no free reveals.',
  },
};

export const isMode = (m) => MODES.includes(m);
export const modeLabel = (m) => (MODE_INFO[m] || MODE_INFO[DEFAULT_MODE]).label;

/** The mode chosen in Settings (anything unknown counts as Detective). */
export function currentMode() {
  try {
    const m = state().settings?.difficulty;
    return isMode(m) ? m : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

// ---------- helpers ----------
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const round2 = (v) => Math.round(v * 100) / 100;
/** Move `value` `delta` steps along `steps`, staying inside it (unknown values start from `fallback`). */
function step(steps, value, delta, fallback) {
  let i = steps.indexOf(value);
  if (i < 0) i = steps.indexOf(fallback);
  return steps[clamp(i + delta, 0, steps.length - 1)];
}
const D4 = ['easy', 'medium', 'hard', 'expert'];
const D3 = ['easy', 'medium', 'hard'];

/** The most frequent letter of an authored message that is not already given (for the cipher's free letter). */
function extraLetter(message, given) {
  const counts = {};
  for (const ch of String(message || '').toUpperCase()) if (ch >= 'A' && ch <= 'Z' && !given.includes(ch)) counts[ch] = (counts[ch] || 0) + 1;
  let best = null;
  for (const [ch, n] of Object.entries(counts)) if (!best || n > counts[best] || (n === counts[best] && ch < best)) best = ch;
  return best;
}

// Each entry: (params, easier) => changes, where easier is true for Story and false for Hardboiled.
// Defaults below are the module defaults, so a level that leaves a knob out scales from what it plays.
const RULES = {
  // ---- generated boards, difficulty bands ----
  sudoku: (p, s) => ({ difficulty: step(D4, p.difficulty, s ? -1 : 1, 'hard') }),
  kakuro: (p, s) => ({ difficulty: step(D4, p.difficulty, s ? -1 : 1, 'hard') }),
  morse: (p, s) => ({ difficulty: step(D4, p.difficulty, s ? -1 : 1, 'hard') }),
  colorword: (p, s) => ({ difficulty: step(D4, p.difficulty, s ? -1 : 1, 'hard') }),
  quickmath: (p, s) => {
    const difficulty = step(D4, p.difficulty, s ? -1 : 1, 'hard');
    const seconds = num(p.seconds, 180);
    if (s) return { difficulty, seconds: seconds + 60 };
    // already at the top band: take time off the clock instead
    return (p.difficulty || 'hard') === 'expert' ? { seconds: Math.max(120, seconds - 30) } : { difficulty };
  },
  // only 'easy' differs (shorter words, and the definitions are shown: the free reveal); nothing harder exists
  anagram: (p, s) => (s ? { difficulty: 'easy' } : {}),
  getaway: (p, s) => ({ difficulty: step(D3, p.difficulty, s ? -1 : 1, 'medium') }),
  pursuit: (p, s) => ({ difficulty: step(D3, p.difficulty, s ? -1 : 1, 'easy') }),
  crossword: (p, s) => (s ? { size: Math.max(9, num(p.size, 13) - 2) } : {}), // 13 is the most a phone shows well

  // ---- counts of generated things ----
  hiddenobject: (p, s) => (s
    ? { targets: Math.max(6, Math.min(14, num(p.targets, 12)) - 3), objects: clamp(num(p.objects, 64) - 12, 40, 80) }
    : { targets: Math.min(14, num(p.targets, 12) + 2), objects: clamp(num(p.objects, 64) + 8, 40, 80) }),
  spotdiff: (p, s) => ({ differences: s ? Math.max(5, num(p.differences, 9) - 2) : Math.min(12, num(p.differences, 9) + 2) }),
  footprint: (p, s) => ({ shoes: s ? Math.max(6, num(p.shoes, 8) - 3) : Math.min(10, num(p.shoes, 8) + 2) }),
  dna: (p, s) => ({ suspects: s ? 6 : 8 }),
  iqmatrix: (p, s) => {
    const count = clamp(num(p.count, 6), 3, 8), start = num(p.startLevel, 0);
    return s ? { count: Math.max(3, count - 1), startLevel: Math.max(0, start - 1) } : { count: Math.min(8, count + 1), startLevel: Math.min(7, start + 1) };
  },
  rotation: (p, s) => {
    const trials = num(p.trials, 10), target = Math.min(trials, num(p.target, 8));
    return { target: s ? Math.max(Math.ceil(trials / 2), target - 2) : Math.min(trials, target + 1) };
  },
  rebus: (p, s) => (s ? { count: 8, mix: [0.55, 0.3, 0.15] } : { count: 10, mix: [0.2, 0.3, 0.5] }),
  alibi: (p, s) => ({ rounds: s ? Math.max(1, num(p.rounds, 3) - 1) : num(p.rounds, 3) + 1 }),
  // tangram: the silhouettes are authored, so only the coverage tolerance moves (Story only)
  tangram: (p, s) => (s ? { cover: 0.94, spill: 0.05 } : {}),

  // ---- time, tries and tolerance ----
  lineup: (p, s) => {
    const base = p.studySeconds ?? [12, 10, 8];
    const list = Array.isArray(base) ? base : [base];
    return { studySeconds: list.map((x) => (s ? num(x, 10) + 4 : Math.max(4, num(x, 10) - 2))) };
  },
  witness: (p, s) => {
    const q = Array.isArray(p.questions) ? p.questions.length : 9;
    const read = num(p.readSeconds, 90), pass = num(p.pass, 7);
    return s
      ? { readSeconds: read + 40, pass: Math.max(Math.ceil(q / 2), pass - 1) }
      // one more right answer, but never a perfect score: the clock is the main squeeze
      : { readSeconds: Math.max(45, read - 20), pass: Math.max(pass, Math.min(q - 1, pass + 1)) };
  },
  riddles: (p, s) => {
    const r = num(p.reveals, 5);
    return { reveals: s ? r + 3 : Math.max(1, r - 2) };
  },
  chase: (p, s, v) => {
    const slack = num(p.slack, v === 'one-way' ? 1 : 2);
    return { slack: s ? slack + 2 : Math.max(0, slack - 1) };
  },
  safecracker: (p, s) => {
    const tries = Math.max(1, num(p.tries, 8));
    const bonus = Math.max(1, num(p.bonus, Math.max(3, Math.ceil(tries / 2))));
    return s ? { tries: tries + 3, bonus: bonus + 2 } : { tries: Math.max(5, tries - 2), bonus: Math.max(2, bonus - 1) };
  },
  cipher: (p, s) => {
    const given = Array.isArray(p.given) ? p.given : ['E', 'T', 'A'];
    if (s) { const x = extraLetter(p.message, given); return x ? { given: [...given, x] } : {}; }
    return given.length > 2 ? { given: given.slice(0, 2) } : {};
  },
  dialtone: (p, s) => {
    const noise = num(p.noise, 0.15);
    return { noise: s ? round2(Math.max(0, noise - 0.1)) : round2(Math.min(0.6, noise + 0.1)) };
  },
  fusebox: (p, s) => {
    const presses = num(p.presses, 5);
    return { presses: s ? Math.max(3, presses - 2) : Math.min(12, presses + 2) };
  },
  // the figures are generated; the labels (rows and columns) are authored, so only the restore step moves
  ledger: (p, s) => (s ? (p.restore ? { restore: false } : {}) : (p.restore ? {} : { restore: true })),
  mirrors: (p, s) => {
    const size = clamp(num(p.size, 6), 5, 9), m = num(p.mirrors, 3), relays = num(p.relays, 0), obst = num(p.obstacles, 4);
    return s
      ? { mirrors: Math.max(2, m - 1), relays: Math.max(0, relays - 1) }
      : { size: Math.min(7, size + 1), mirrors: Math.min(5, m + 1), obstacles: Math.min(12, obst + 2) };
  },
  searchlight: (p, s) => {
    const size = clamp(Math.round(num(p.size, 7)), 6, 10);
    const walls = ['low', 'medium', 'high'];
    // more crates mean more numbered clues and shorter beams: easier
    return s
      ? { size: Math.max(6, Math.min(8, size) - 1), walls: step(walls, p.walls, 1, 'medium') }
      : { size: Math.min(8, size + 1), walls: step(walls, p.walls, -1, 'medium') };
  },
  shredder: (p, s) => {
    const strips = clamp(Math.round(num(p.strips, 8)), 5, 14);
    return s ? { strips: Math.max(5, Math.min(10, strips) - 2), flips: false } : { strips: Math.min(10, strips + 2), flips: true };
  },
  wiretap: (p, s) => {
    const size = clamp(Math.round(num(p.size, 5)), 4, 8), targets = num(p.targets, 2);
    return s ? { size: Math.max(4, size - 1) } : { size: Math.min(7, size + 1), targets: Math.min(4, targets + 1) };
  },
  tape: (p, s, v) => {
    if (v === 'spectro') {
      const noise = num(p.noise, 0.6);
      return s ? { noise: round2(Math.max(0.2, noise - 0.2)), decoys: 0 } : { noise: round2(Math.min(0.85, noise + 0.15)), decoys: 3 };
    }
    if (v === 'splice') {
      const pieces = num(p.pieces, 5);
      return { pieces: s ? Math.max(3, pieces - 1) : Math.min(7, pieces + 1) };
    }
    return {}; // reverse: the line and its answer are authored
  },
  interrogation: (p, s) => {
    const q = num(p.maxQuestions, 14);
    return { maxQuestions: s ? Math.min(30, q + 6) : Math.max(8, q - 4) };
  },
  // maze: the map and its one safe exit are authored; Story marks one camera view from the start
  maze: (p, s) => (s ? { showCameras: 1 } : {}),
};

/** Games adjust() never changes, and why (see the header). */
export const UNCHANGED = {
  logicgrid: 'authored clues and solution',
  whoslying: 'authored statements and liars',
  timeline: 'authored frames and order',
  nonogram: 'authored picture',
  series: 'authored sequences and answers',
  fingerprint: 'authored candidates and answer',
  wordsearch: 'the leftover letters spell an authored message',
  theory: 'points needed are written into the clue',
};

/**
 * The params a level plays with in a mode. Never mutates `params`.
 * @param {string} game  game id (level.game)
 * @param {object} params level.params
 * @param {string} mode  'story' | 'detective' | 'hardboiled'
 * @param {string} [variant] level.variant (tape and chase scale per variant)
 */
export function adjust(game, params, mode, variant) {
  if (!isMode(mode) || mode === 'detective') return params;
  const rule = RULES[game];
  if (!rule) return params;
  const p = params || {};
  const changes = rule(p, mode === 'story', variant) || {};
  if (!Object.keys(changes).length) return params;
  return { ...p, ...changes };
}

// ---------- magnifiers ----------

/** Magnifiers a case starts with in a mode, from the case file's base number. */
export function hintBudget(base, mode) {
  const b = Math.max(0, Math.round(num(base, 5)));
  if (mode === 'story') return b * 2;
  if (mode === 'hardboiled') return Math.max(1, Math.ceil(b / 2));
  return b;
}

/**
 * Bring a case's magnifiers in line with a mode. Used magnifiers stay used; only the budget moves.
 * cs.hintsBase: the case file's number; cs.hintMode: the mode cs.hints/cs.hintsMax are counted in.
 * Returns true when it changed anything (the caller saves).
 */
export function syncHints(cs, mode, caseBase) {
  if (!cs || cs.status === 'closed') return false;
  const m = isMode(mode) ? mode : DEFAULT_MODE;
  const from = isMode(cs.hintMode) ? cs.hintMode : DEFAULT_MODE;
  if (cs.hintsBase == null) cs.hintsBase = from === DEFAULT_MODE && cs.hintsMax != null ? cs.hintsMax : num(caseBase, 5);
  if (cs.hintMode === m) return false;
  const max = cs.hintsMax != null ? cs.hintsMax : hintBudget(cs.hintsBase, from);
  const left = Number.isFinite(cs.hints) ? cs.hints : max;
  // magnifiers used so far: counted at the last sync plus what has gone since (exact even when a
  // smaller budget ran out), or, the first time, the gap between the budget and what is left
  const used = Number.isFinite(cs.hintsUsed) && Number.isFinite(cs.hintsLeftAtSync)
    ? cs.hintsUsed + Math.max(0, cs.hintsLeftAtSync - left)
    : Math.max(0, max - left);
  cs.hintsMax = hintBudget(cs.hintsBase, m);
  cs.hints = Math.max(0, cs.hintsMax - used);
  cs.hintsUsed = used;
  cs.hintsLeftAtSync = cs.hints;
  cs.hintMode = m;
  return true;
}
