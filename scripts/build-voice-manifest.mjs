#!/usr/bin/env node
// Builds src/data/voice-manifest.json: every line that can be spoken in a cinematic (the intro, each
// case's opening and every branch of each case's ending), keyed by its voice id (src/core/voice.js).
//
//   node scripts/build-voice-manifest.mjs           (runs automatically before `npm run build`)
//   node scripts/build-voice-manifest.mjs --check   exit 1 if the committed manifest is out of date
//
// Lines with `when(flags)` are all included, whatever their condition. Endings are functions of the
// verdict, so ending(v) is called for every combination of charged suspects x every answer to the
// case's extra questions x the case's own flags (with other cases' flags all off and all on), and with
// v.you = "{you}" so lines that name the player share one recording ("Detective" is spoken there).
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { INTRO } from '../src/data/intro.js';
import { CASES, CASE_ORDER } from '../src/data/cases.js';
import { VOICE_OVERRIDES, VOICE_CAST } from '../src/data/voice-overrides.js';
import { VOICE_DIRECTIONS } from '../src/data/voice-directions.js';
import { NARRATOR, YOU_TOKEN, YOU_SPOKEN, speakerOf, spokenOf, withoutCues, isVoiceable, voiceId, guessLang, hashText } from '../src/core/voice.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'src/data/voice-manifest.json');
const MAX_COMBOS = 20000;

const lines = new Map(); // id -> entry
const seen = new Map(); // id -> "speaker\u0000text" (collision guard)

function addLine(line, where) {
  if (!line || typeof line !== 'object' || typeof line.en !== 'string') return;
  if (!isVoiceable(line)) return; // "[Incoming call]" and other stage cues
  const speaker = speakerOf(line);
  const text = spokenOf(line);
  const id = voiceId(speaker, text);
  const sig = `${speaker.toLowerCase()}\u0000${text}`;
  if (seen.has(id) && seen.get(id) !== sig) throw new Error(`voice id collision: ${id}\n  ${seen.get(id)}\n  ${sig}`);
  seen.set(id, sig);
  let entry = lines.get(id);
  if (!entry) {
    const ov = VOICE_OVERRIDES[text] || {};
    const say = withoutCues(line.say || ov.say || text).split(YOU_TOKEN).join(YOU_SPOKEN);
    const voice = VOICE_CAST[`${where}|${speaker}`] || VOICE_CAST[speaker] || speaker;
    entry = { speaker, voice, text, en: line.en.trim(), lang: ov.lang || line.lang || guessLang(line) };
    if (say !== text) entry.tts = say;
    entry.where = [];
    lines.set(id, entry);
  }
  if (!entry.where.includes(where)) entry.where.push(where);
}

function addPanels(panels, where) {
  for (const panel of panels || []) for (const line of panel?.lines || []) addLine(line, where);
}

/** All subsets of a list (the power set), smallest first. */
function subsets(list) {
  const out = [[]];
  for (const x of list) for (const s of out.slice()) out.push([...s, x]);
  return out.sort((a, b) => a.length - b.length);
}

function answerCombos(questions) {
  let combos = [{}];
  for (const q of questions || []) {
    const ids = [...(q.options || []).map((o) => (typeof o === 'object' ? o.id : o)), undefined];
    combos = combos.flatMap((a) => ids.map((id) => (id === undefined ? { ...a } : { ...a, [q.id]: id })));
  }
  return combos;
}

const allFlagNames = [...new Set(CASE_ORDER.flatMap((id) => CASES[id]?.flagNames || []))];

function addEnding(caseId, c) {
  const suspects = (c.suspects || []).map((s) => s.id);
  const chargedSets = suspects.length <= 10 ? subsets(suspects) : [[], ...suspects.map((s) => [s])];
  const answers = answerCombos(c.deduction?.questions);
  let n = 0;
  for (const charged of chargedSets) {
    for (const ans of answers) {
      const own = c.flags ? c.flags({ charged, answers: ans }) : {};
      for (const others of [false, true]) {
        const flags = Object.fromEntries(allFlagNames.map((f) => [f, others]));
        for (const [k, on] of Object.entries(own)) flags[k] = !!on;
        for (const pronoun of ['they', 'she', 'he']) {
          if (++n > MAX_COMBOS) throw new Error(`${caseId}: too many ending combinations`);
          const v = {
            c, cs: { accusation: charged, answers: ans, status: 'closed' }, charged, answers: ans,
            has: (id) => charged.includes(id), flags, you: YOU_TOKEN, pronoun,
          };
          addPanels(c.ending(v), `${caseId}:ending`);
        }
      }
    }
  }
  return n;
}

addPanels(INTRO, 'intro');
for (const id of CASE_ORDER) {
  const c = CASES[id];
  if (!c) continue;
  addPanels(c.opening, `${id}:opening`);
  if (typeof c.ending === 'function') addEnding(id, c);
}

// delivery directions (src/data/voice-directions.js): { cue?, say?, speed? } per id
const cleanDir = (d) => {
  if (!d || typeof d !== 'object') return null;
  const out = {};
  if (typeof d.cue === 'string' && d.cue.trim()) out.cue = d.cue.trim();
  if (typeof d.say === 'string' && d.say.trim()) out.say = d.say.trim().split(YOU_TOKEN).join(YOU_SPOKEN);
  if (Number.isFinite(d.speed) && d.speed > 0) out.speed = Math.min(1.6, Math.max(0.6, d.speed));
  return Object.keys(out).length ? out : null;
};
const undirected = [];
for (const [id, e] of lines) {
  const dir = cleanDir(VOICE_DIRECTIONS[id]);
  if (dir) e.dir = dir;
  else undirected.push(id);
  // rev changes whenever what the voice is asked to say changes; the game puts it in the audio URL
  e.rev = hashText(JSON.stringify([e.tts || e.text, e.dir || null]));
}
const staleDirections = Object.keys(VOICE_DIRECTIONS).filter((id) => !lines.has(id));

// stable output: in order of first appearance (intro, then each case's opening and ending)
const ordered = [...lines.entries()];
const speakers = {};
for (const [, e] of ordered) {
  const s = (speakers[e.voice] ||= { lines: 0, chars: 0, langs: {}, shownAs: [] });
  if (e.speaker !== e.voice && !s.shownAs.includes(e.speaker)) s.shownAs.push(e.speaker);
  s.lines++;
  s.chars += (e.tts || e.text).length;
  s.langs[e.lang] = (s.langs[e.lang] || 0) + 1;
}
for (const s of Object.values(speakers)) if (!s.shownAs.length) delete s.shownAs;
// Narrator first, then by line count
const speakerOrder = Object.keys(speakers).sort((a, b) => (a === NARRATOR ? -1 : b === NARRATOR ? 1 : speakers[b].lines - speakers[a].lines || a.localeCompare(b)));
const manifest = {
  version: 1,
  note: 'Generated by scripts/build-voice-manifest.mjs. Do not edit; edit the case files or src/data/voice-overrides.js.',
  speakers: Object.fromEntries(speakerOrder.map((s) => [s, speakers[s]])),
  lines: Object.fromEntries(ordered),
};
const json = `${JSON.stringify(manifest, null, 1)}\n`;

if (process.argv.includes('--check')) {
  const old = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (old !== json) {
    console.error('voice-manifest.json is out of date: run `npm run voices:manifest`');
    process.exit(1);
  }
  console.log('voice-manifest.json is up to date');
} else {
  const old = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (old !== json) writeFileSync(OUT, json);
  const total = ordered.length;
  const bytes = ordered.reduce((n, [, e]) => n + Buffer.byteLength(e.tts || e.text), 0);
  console.log(`voice manifest: ${total} lines, ${speakerOrder.length} speakers, ${bytes} UTF-8 bytes of text${old === json ? ' (unchanged)' : ''}`);
  for (const s of speakerOrder) console.log(`  ${String(speakers[s].lines).padStart(4)}  ${s}  ${Object.entries(speakers[s].langs).map(([l, k]) => `${l}:${k}`).join(' ')}`);
  if (undirected.length) console.log(`  ${undirected.length} line(s) have no direction in src/data/voice-directions.js (spoken plainly):\n${undirected.map((id) => `    '${id}'  ${lines.get(id).speaker}: ${lines.get(id).text}`).join('\n')}`);
  if (staleDirections.length) console.log(`  ${staleDirections.length} direction(s) no longer match any line (the line text changed?): ${staleDirections.join(', ')}`);
}
