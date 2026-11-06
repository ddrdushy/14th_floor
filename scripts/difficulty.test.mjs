// Difficulty modes: run adjust() over every level of every case in every mode.
//   node scripts/difficulty.test.mjs
// Checks: Detective returns the level's params untouched; phone limits hold; authored content and
// answers never change (only the knobs listed in TUNABLE may move); params stay inside each game's
// documented ranges; the input is never mutated; magnifier budgets move without losing used ones.
import assert from 'node:assert/strict';
import { CASES } from '../src/data/cases.js';
import { adjust, MODES, UNCHANGED, hintBudget, syncHints } from '../src/core/difficulty.js';

// The only keys a mode may change or add, per game. Everything else in params must be deep-equal.
const TUNABLE = {
  sudoku: ['difficulty'], kakuro: ['difficulty'], morse: ['difficulty'], colorword: ['difficulty'],
  quickmath: ['difficulty', 'seconds'], anagram: ['difficulty'], getaway: ['difficulty'], pursuit: ['difficulty'],
  crossword: ['size'], hiddenobject: ['targets', 'objects'], spotdiff: ['differences'], footprint: ['shoes'],
  dna: ['suspects'], iqmatrix: ['count', 'startLevel'], rotation: ['target'], rebus: ['count', 'mix'],
  alibi: ['rounds'], tangram: ['cover', 'spill'], lineup: ['studySeconds'], witness: ['readSeconds', 'pass'],
  riddles: ['reveals'], chase: ['slack'], safecracker: ['tries', 'bonus'], cipher: ['given'], dialtone: ['noise'],
  fusebox: ['presses'], ledger: ['restore'], mirrors: ['size', 'mirrors', 'relays', 'obstacles'],
  searchlight: ['size', 'walls'], shredder: ['strips', 'flips'], wiretap: ['size', 'targets'],
  tape: ['noise', 'decoys', 'pieces'], interrogation: ['maxQuestions'], maze: ['showCameras'],
};

// Authored answers and content, named explicitly (also covered by the TUNABLE rule above).
const AUTHORED = {
  logicgrid: ['categories', 'solution', 'clues'], whoslying: ['people', 'liars'], timeline: ['frames', 'order'],
  nonogram: ['picture'], series: ['items'], fingerprint: ['candidates', 'answer'], wordsearch: ['words', 'extra', 'message', 'size'],
  theory: ['prompt', 'context', 'points', 'need'], maze: ['map', 'cameras', 'exits', 'answer'],
  safecracker: ['digits', 'repeats', 'fixed', 'contains', 'clue'], dialtone: ['number', 'digits', 'clue'],
  cipher: ['message'], ledger: ['rows', 'cols', 'altered', 'rowLabels', 'colLabels', 'currency', 'magnitude', 'clue'],
  tape: ['answer', 'line', 'accept', 'ask', 'mode', 'label'], interrogation: ['suspect', 'facts', 'lies', 'evidence', 'setting'],
  witness: ['statement', 'questions', 'header'], tangram: ['shapes', 'rounds'], shredder: ['text', 'title', 'stamp', 'sign'],
  pursuit: ['route', 'legs', 'beats', 'setting', 'vehicle', 'suspect'], getaway: ['target'], hiddenobject: ['scene'],
};

const clone = (x) => JSON.parse(JSON.stringify(x));
let levels = 0, checks = 0;
const changedGames = { story: new Set(), hardboiled: new Set() };
const seenGames = new Set();

for (const [caseId, c] of Object.entries(CASES)) {
  for (const level of c.levels) {
    levels++;
    const { game, variant } = level;
    seenGames.add(game);
    const where = `${caseId}/${level.id} (${game})`;
    const input = level.params || {};
    const before = clone(input);
    for (const mode of MODES) {
      const out = adjust(game, input, mode, variant);
      const at = `${where} [${mode}]`;
      assert.deepEqual(input, before, `${at}: input params were mutated`);

      if (mode === 'detective') {
        assert.equal(out, input, `${at}: Detective must return the same params`);
        assert.deepEqual(out, before, `${at}: Detective must be deep-equal`);
        checks += 2;
        continue;
      }

      // phone limits
      if (game === 'shredder') assert.ok((out.strips ?? 8) <= 10, `${at}: shredder strips ${out.strips} > 10`);
      if (game === 'searchlight') assert.ok((out.size ?? 7) <= 8, `${at}: searchlight size ${out.size} > 8`);
      if (game === 'mirrors') assert.ok((out.size ?? 6) <= 7, `${at}: mirrors size ${out.size} > 7`);
      if (game === 'ledger') assert.ok((out.cols ?? 4) <= 5, `${at}: ledger cols ${out.cols} > 5`);
      checks++;

      // only tunable knobs move
      const allowed = new Set(TUNABLE[game] || []);
      for (const k of new Set([...Object.keys(before), ...Object.keys(out)])) {
        if (allowed.has(k)) continue;
        assert.deepEqual(out[k], before[k], `${at}: authored key "${k}" changed`);
        checks++;
      }
      for (const k of AUTHORED[game] || []) {
        assert.deepEqual(out[k], before[k], `${at}: authored answer/content "${k}" changed`);
        checks++;
      }
      if (UNCHANGED[game]) { assert.equal(out, input, `${at}: ${game} is listed as unchanged`); checks++; }
      if (JSON.stringify(out) !== JSON.stringify(before)) changedGames[mode].add(game);

      // stay inside each game's documented ranges, and keep every level winnable
      const inRange = (v, lo, hi, name) => { assert.ok(v == null || (v >= lo && v <= hi), `${at}: ${name}=${v} outside ${lo}..${hi}`); checks++; };
      const D4 = ['easy', 'medium', 'hard', 'expert'];
      if (['sudoku', 'kakuro', 'morse', 'colorword', 'quickmath', 'anagram'].includes(game) && out.difficulty) assert.ok(D4.includes(out.difficulty), at);
      if (['getaway', 'pursuit'].includes(game) && out.difficulty) assert.ok(['easy', 'medium', 'hard'].includes(out.difficulty), at);
      if (game === 'hiddenobject') { inRange(out.targets, 1, 14, 'targets'); inRange(out.objects, 40, 80, 'objects'); }
      if (game === 'footprint') inRange(out.shoes, 6, 10, 'shoes');
      if (game === 'dna') inRange(out.suspects, 6, 8, 'suspects');
      if (game === 'iqmatrix') { inRange(out.count, 3, 8, 'count'); inRange(out.startLevel, 0, 7, 'startLevel'); }
      if (game === 'rotation') inRange(out.target, 1, out.trials ?? 10, 'target');
      if (game === 'witness') { inRange(out.pass, 1, out.questions.length, 'pass'); inRange(out.readSeconds, 30, 300, 'readSeconds'); }
      if (game === 'lineup') out.studySeconds.forEach((x) => inRange(x, 4, 30, 'studySeconds'));
      if (game === 'fusebox') inRange(out.presses, 3, 12, 'presses');
      if (game === 'mirrors') { inRange(out.size, 5, 7, 'size'); inRange(out.mirrors, 2, 7, 'mirrors'); inRange(out.relays, 0, 2, 'relays'); inRange(out.obstacles, 0, 12, 'obstacles'); }
      if (game === 'searchlight') { inRange(out.size, 6, 8, 'size'); assert.ok(['low', 'medium', 'high'].includes(out.walls), at); }
      if (game === 'shredder') inRange(out.strips, 5, 10, 'strips');
      if (game === 'wiretap') { inRange(out.size, 4, 7, 'size'); inRange(out.targets, 1, 4, 'targets'); }
      if (game === 'dialtone') inRange(out.noise, 0, 1, 'noise');
      if (game === 'tape') { inRange(out.noise, 0, 1, 'noise'); inRange(out.decoys, 0, 3, 'decoys'); inRange(out.pieces, 3, 8, 'pieces'); }
      if (game === 'safecracker') { inRange(out.tries, 5, 20, 'tries'); inRange(out.bonus, 2, 12, 'bonus'); }
      if (game === 'chase') inRange(out.slack, 0, 6, 'slack');
      if (game === 'interrogation') inRange(out.maxQuestions, 3, 30, 'maxQuestions');
      if (game === 'tangram') { inRange(out.cover, 0.9, 0.99, 'cover'); inRange(out.spill, 0.01, 0.08, 'spill'); }
      if (game === 'maze') inRange(out.showCameras, 0, out.cameras.length, 'showCameras');
      if (game === 'rebus') { inRange(out.count, 1, 13, 'count'); assert.ok(Math.abs(out.mix.reduce((a, b) => a + b, 0) - 1) < 1e-9, `${at}: rebus mix must add to 1`); }
      if (game === 'cipher') {
        // every given letter is in the message, so the free letter really helps
        for (const g of out.given) assert.ok(out.message.toUpperCase().includes(g), `${at}: given letter ${g} not in the message`);
        if (mode === 'story') assert.equal(out.given.length, before.given.length + 1, `${at}: Story gives one extra letter`);
        if (mode === 'hardboiled') assert.ok(out.given.length <= 2, `${at}: Hardboiled gives at most two letters`);
      }
      if (mode === 'hardboiled') {
        // no free reveals in Hardboiled
        assert.ok(!out.showCameras, `${at}: Hardboiled reveals a camera`);
        if (game === 'anagram') assert.notEqual(out.difficulty, 'easy', `${at}: Hardboiled shows definitions`);
      }
    }
  }
}

// every game the cases use is either scaled or listed as unchanged
for (const g of seenGames) {
  assert.ok(TUNABLE[g] || UNCHANGED[g], `game ${g} has neither a rule nor an UNCHANGED entry`);
  if (!UNCHANGED[g]) assert.ok(changedGames.story.has(g), `Story changes nothing in ${g}`);
}

// magnifiers
assert.equal(hintBudget(8, 'detective'), 8);
assert.equal(hintBudget(8, 'story'), 16);
assert.equal(hintBudget(8, 'hardboiled'), 4);
assert.equal(hintBudget(5, 'hardboiled'), 3);
{
  // an older save, Detective, two of eight used
  const cs = { status: 'active', hints: 6, hintsMax: 8 };
  assert.equal(syncHints(cs, 'detective', 8), true);
  assert.deepEqual([cs.hints, cs.hintsMax, cs.hintMode], [6, 8, 'detective'], 'Detective keeps the numbers');
  syncHints(cs, 'story', 8);
  assert.deepEqual([cs.hints, cs.hintsMax], [14, 16], 'Story doubles the budget, used stay used');
  cs.hints -= 5; // seven used now
  syncHints(cs, 'hardboiled', 8);
  assert.deepEqual([cs.hints, cs.hintsMax], [0, 4], 'Hardboiled never goes below zero');
  syncHints(cs, 'detective', 8);
  assert.deepEqual([cs.hints, cs.hintsMax], [1, 8], 'back to Detective: 7 of 8 used');
  const closed = { status: 'closed', hints: 2, hintsMax: 5 };
  assert.equal(syncHints(closed, 'story', 5), false, 'a closed case is left alone');
  checks += 9;
}

console.log(`difficulty: ${levels} levels x ${MODES.length} modes, ${checks} checks passed.`);
console.log(`  Story changes: ${[...changedGames.story].sort().join(', ')}`);
console.log(`  Hardboiled changes: ${[...changedGames.hardboiled].sort().join(', ')}`);
console.log(`  Unchanged (no safe knob): ${Object.keys(UNCHANGED).join(', ')}`);
