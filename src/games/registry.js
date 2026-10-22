import { GAMES_B, CATEGORY_B } from './registry_b.js';
import { GAMES_C, CATEGORY_C } from './registry_c.js';
import { GAMES_D, CATEGORY_D } from './registry_d.js';

// All mini games, loaded on demand. Each module exports { meta, mount(el, ctx) }.
export const GAMES = {
  sudoku: () => import('./sudoku.js'),
  wordsearch: () => import('./wordsearch.js'),
  spotdiff: () => import('./spotdiff.js'),
  fingerprint: () => import('./fingerprint.js'),
  series: () => import('./series.js'),
  witness: () => import('./witness.js'),
  logicgrid: () => import('./logicgrid.js'),
  cipher: () => import('./cipher.js'),
  safecracker: () => import('./safecracker.js'),
  timeline: () => import('./timeline.js'),
  nonogram: () => import('./nonogram.js'),
  whoslying: () => import('./whoslying.js'),
  maze: () => import('./maze.js'),
  ...GAMES_B,
  ...GAMES_C,
  ...GAMES_D,
};

export const CATEGORY_OF = {
  sudoku: 'Numbers', wordsearch: 'Words', spotdiff: 'Observation', fingerprint: 'Forensics', series: 'Pattern',
  witness: 'Memory', logicgrid: 'Logic', cipher: 'Code breaking', safecracker: 'Code breaking', timeline: 'Logic',
  nonogram: 'Logic', whoslying: 'Profiling', maze: 'Navigation',
  ...CATEGORY_B,
  ...CATEGORY_C,
  ...CATEGORY_D,
};
