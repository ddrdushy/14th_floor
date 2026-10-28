// Mini games added by build batch D (Case 4). Same shape as GAMES in registry.js.
// Each module imports its own stylesheet from src/styles/games-d/<id>.css.
export const GAMES_D = {
  wiretap: () => import('./wiretap.js'),
  mirrors: () => import('./mirrors.js'),
  shredder: () => import('./shredder.js'),
  ledger: () => import('./ledger.js'),
  getaway: () => import('./getaway.js'),
  searchlight: () => import('./searchlight.js'),
  dialtone: () => import('./dialtone.js'),
  fusebox: () => import('./fusebox.js'),
  interrogation: () => import('./interrogation.js'),
};
export const CATEGORY_D = {
  wiretap: 'Wiring',
  mirrors: 'Optics',
  shredder: 'Reconstruction',
  ledger: 'Forensic accounting',
  getaway: 'Spatial',
  searchlight: 'Logic',
  dialtone: 'Listening',
  fusebox: 'Logic',
  interrogation: 'Interrogation',
};
