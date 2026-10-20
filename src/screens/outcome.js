// What happens after the arrests. Each case writes its own ending from the verdict
// (who was charged, any other answers, the story flags). Then the case file closes.
import { go } from '../core/router.js';
import { CASES, verdictOf, filterPanels, resolveCaseId } from '../data/cases.js';
import { playCinematic } from './cinema.js';
import { app } from '../core/app.js';

export function outcomePanels(caseId) {
  const v = verdictOf(caseId);
  return filterPanels(v.c.ending ? v.c.ending(v) : [], v.flags);
}

export function mount(host, { caseId } = {}) {
  app.scene.setMode('hidden');
  caseId = resolveCaseId(caseId);
  if (!CASES[caseId].ending) { go('closed', { caseId }); return {}; }
  playCinematic(host, outcomePanels(caseId)).then(() => go('closed', { caseId }));
  return {};
}
