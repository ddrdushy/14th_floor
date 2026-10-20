// A case's opening cinematic, played when the player answers the phone for it.
// Panels and lines can depend on the story flags (choices made in earlier cases).
import { go } from '../core/router.js';
import { state, save } from '../core/state.js';
import { CASES, getCaseState, filterPanels, resolveCaseId } from '../data/cases.js';
import { playCinematic } from './cinema.js';
import { app } from '../core/app.js';

export function mount(host, { caseId } = {}) {
  caseId = resolveCaseId(caseId);
  const c = CASES[caseId];
  if (c.openingScreen) { go(c.openingScreen); return {}; }
  app.scene.setMode('hidden');
  // flags are read before the case is opened, so the snapshot and the cinematic agree
  const panels = filterPanels(c.opening || [], state().flags);
  playCinematic(host, panels).then(() => {
    const cs = getCaseState(caseId);
    cs.seenOpening = true;
    save();
    go('map', { caseId, fresh: true });
  });
  return {};
}
