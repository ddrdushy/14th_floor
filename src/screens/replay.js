// "Watch again": replay a case's opening or ending cinematic from the case file, exactly as this player
// saw it, then come back to the case file. Changes nothing in the save.
import { go } from '../core/router.js';
import { CASES, resolveCaseId } from '../data/cases.js';
import { openingPanels, endingPanels } from '../core/casebook.js';
import { playCinematic } from './cinema.js';
import { app } from '../core/app.js';

export function mount(host, { caseId, part = 'opening', back } = {}) {
  caseId = resolveCaseId(caseId);
  const panels = part === 'ending' ? endingPanels(caseId) : openingPanels(caseId);
  const done = () => go('casefile', { caseId, back, focus: part });
  if (!CASES[caseId] || !panels.length) { done(); return {}; }
  app.scene.setMode('hidden');
  playCinematic(host, panels).then(done);
  return {};
}
