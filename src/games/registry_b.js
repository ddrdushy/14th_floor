// Mini games added by build batch B. Same shape as GAMES in registry.js.
export const GAMES_B = {
  kakuro: () => import('./kakuro.js'),
  crossword: () => import('./crossword.js'),
  anagram: () => import('./anagram.js'),
  morse: () => import('./morse.js'),
  iqmatrix: () => import('./iqmatrix.js'),
  quickmath: () => import('./quickmath.js'),
  colorword: () => import('./colorword.js'),
  riddles: () => import('./riddles.js'),
};
export const CATEGORY_B = {
  kakuro: 'Numbers',
  crossword: 'Words',
  anagram: 'Words',
  morse: 'Code Breaking',
  iqmatrix: 'Pattern',
  quickmath: 'Speed',
  colorword: 'Speed',
  riddles: 'Lateral thinking',
};
