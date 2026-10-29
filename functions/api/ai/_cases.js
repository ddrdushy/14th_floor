// Case data on the server, so the AI games build their prompts from the real case file and never from
// text a client sends (which would turn the endpoint into a free chatbot). Add each new case here.
import { CASE04 } from '../../../src/data/case04.js';
import { CASE05 } from '../../../src/data/case05.js';
import { CASE06 } from '../../../src/data/case06.js';
import { CASE07 } from '../../../src/data/case07.js';

const ALL = [CASE04, CASE05, CASE06, CASE07];
export const CASES = Object.fromEntries(ALL.map((c) => [c.id, c]));

/** The params of an AI level, or null. */
export function aiLevel(caseId, levelId, game) {
  const c = CASES[caseId];
  const l = c?.levels?.find((x) => x.id === levelId);
  return l && l.game === game ? l.params || null : null;
}
