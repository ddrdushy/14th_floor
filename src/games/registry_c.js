// Mini games added by build batch C. Same shape as GAMES in registry.js.
export const GAMES_C = {
  hiddenobject: () => import('./hiddenobject.js'),
  lineup: () => import('./lineup.js'),
  tangram: () => import('./tangram.js'),
  rotation: () => import('./rotation.js'),
  dna: () => import('./dna.js'),
  footprint: () => import('./footprint.js'),
  chase: () => import('./chase.js'),
  alibi: () => import('./alibi.js'),
  rebus: () => import('./rebus.js'),
};
export const CATEGORY_C = {
  hiddenobject: 'Observation',
  lineup: 'Memory',
  tangram: 'Spatial',
  rotation: 'Spatial',
  dna: 'Forensics',
  footprint: 'Forensics',
  chase: 'Navigation',
  alibi: 'Profiling',
  rebus: 'Lateral thinking',
};
