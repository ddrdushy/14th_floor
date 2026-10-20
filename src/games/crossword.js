// Themed crime crossword: a freeform grid fitted from a bank of crime, KL and detective words.
import { h } from '../core/ui.js';
import { shuffle } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'crossword', name: 'Crossword', category: 'Words' };
export const demo = { variant: 'classic', params: { size: 13 } };

// [answer, plain clue, cryptic-lite clue]. Spaces in answers become word breaks in the enumeration.
export const BANK = [
  ['ALIBI', 'Claim of being somewhere else when the crime happened', 'Bail I rearranged for a defence'],
  ['MOTIVE', 'Reason behind a crime', 'Move it around to find the reason'],
  ['SUSPECT', 'Person thought to be guilty', 'Doubt the person in the frame'],
  ['WITNESS', 'Someone who saw it happen', 'See one who saw it'],
  ['EVIDENCE', 'Proof laid before a court', 'Show proof'],
  ['VERDICT', 'Decision delivered at the end of a trial', 'Truly said, in Latin, when the trial ends'],
  ['FORENSIC', 'Kind of science practised in a crime lab', 'Fir cones scattered for the lab science'],
  ['AUTOPSY', 'Post-mortem examination', 'Pays out wildly for a post-mortem'],
  ['CORONER', 'Official who investigates sudden deaths', 'Crooner sings off-key? He looks into deaths'],
  ['DETECTIVE', 'Investigator assigned to a case', 'Private eye, perhaps'],
  ['INSPECTOR', 'Police rank above sergeant', 'Crisp tone, oddly arranged, from a senior officer'],
  ['SERGEANT', 'Police rank below inspector', 'Grantees reorganised under the officer'],
  ['HANDCUFFS', 'Steel restraints for the wrists', 'Help with blows? They hold the wrists'],
  ['WARRANT', 'Court order allowing a search or arrest', 'Justify a search'],
  ['RANSOM', 'Money demanded for a hostage', "Manors sold for a kidnapper's demand"],
  ['HOSTAGE', 'Captive held to force demands', 'Hogs eat wildly with the captive'],
  ['SMUGGLER', 'One who moves contraband past customs', 'Runner who avoids duty'],
  ['CONTRABAND', 'Smuggled goods', 'Against the group, these goods are banned'],
  ['GETAWAY', 'Escape after a robbery', 'Short holiday, or a dash from the bank'],
  ['HEIST', 'Large, planned robbery', "Robbery hidden in 'the ache is tolerable'"],
  ['MURDER', 'Unlawful killing', 'Rum red, mixed: a killing'],
  ['POISON', 'Toxic substance slipped into a drink', 'Toxin found in hippo is on the loose'],
  ['DAGGER', 'Short stabbing blade', "Typesetter's cross, or a blade"],
  ['PISTOL', 'Small handgun', 'Spoilt, gone off: a handgun'],
  ['BULLET', 'Round fired from a gun', 'Point on a list, or a round'],
  ['FINGERPRINT', 'Mark left by a fingertip', 'Accuse and publish? That leaves a mark'],
  ['INTERPOL', 'International police organisation', 'Trip lone, rearranged, for the global police'],
  ['INFORMER', 'Person who tips off the police', 'Snitch in one-time position'],
  ['SNITCH', 'Informer, informally', 'Grass, or pinch'],
  ['CULPRIT', 'Person responsible for an offence', 'Party to blame'],
  ['CORRUPT', 'Dishonest, like a bent official', 'Bent, or make bent'],
  ['BRIBE', 'Illegal payment to sway an official', 'Coffee money, in KL parlance'],
  ['FRAUD', 'Deception for financial gain', 'Deception, or an impostor'],
  ['FORGERY', 'Faked document or signature', 'Smithy by the railway: a fake'],
  ['PETALING', "___ Street, KL's Chinatown market", 'Copy-watch street in Chinatown'],
  ['MERDEKA', 'Malay word for independence', 'Shout heard in the stadium in 1957'],
  ['KLANG', 'River that gives the valley its name', 'Clang, by the sound of it, in the valley'],
  ['GOMBAK', 'River that meets the Klang at Masjid Jamek', 'Other half of a muddy confluence'],
  ['MAMAK', 'Late-night Indian Muslim eatery', 'Two mothers and a king run a late-night stall'],
  ['KOPITIAM', 'Traditional coffee shop', 'Local coffee, time, I am at the shop'],
  ['TEH TARIK', 'Pulled milk tea', 'Drink that is stretched and poured from a height'],
  ['RENDANG', 'Slow-cooked dry curry', 'Danger at north, stewed into a curry'],
  ['SATAY', 'Skewered grilled meat', 'Remain, holding a, for grilled skewers'],
  ['BRICKFIELDS', "KL's Little India", 'Clay blocks and meadows make Little India'],
  ['CHOW KIT', 'KL district known for its wet market', 'Food and gear at an old KL market'],
  ['PUDU', 'Old KL prison, now demolished', 'Old jail hidden in spud under the ground'],
  ['BANGSAR', 'Leafy KL suburb known for its bars', 'Telawi is the bar street of this suburb'],
  ['AMPANG', 'KL district famed for yong tau foo', 'Yong tau foo country, east of the city'],
  ['MONSOON', 'Seasonal rains', 'Day of the week, before long: the rains'],
  ['HAZE', 'Smoky pall from forest fires', 'It drifts across the strait each dry season'],
  ['TOWER', 'Petronas ___', 'One that pulls a car, or one that stands tall'],
  ['LIFT', 'Elevator, in Malaysian English', 'Steal a ride to Floor 14'],
  ['FLOOR', 'Storey of a building', 'Knock down a level'],
  ['NOIR', 'Dark crime genre', 'Iron, bent, for a dark genre'],
  ['GUMSHOE', 'Slang for a private detective', 'Sticky stuff on footwear? A private eye'],
  ['SLEUTH', 'Detective', 'Hustle around for a detective'],
  ['HUNCH', 'Gut feeling', 'Stoop with a gut feeling'],
  ['LEAD', 'Promising line of inquiry', 'Clue to follow, or a heavy metal'],
  ['TAIL', 'Follow a suspect covertly', 'Follow the end of a dog'],
  ['STAKEOUT', 'Covert surveillance of a place', 'Steak out, cooked differently, for a long watch'],
  ['CONFESS', 'Admit to the crime', 'Come clean'],
  ['PERJURY', 'Lying under oath', 'Telling stories under oath'],
  ['MOLE', 'Spy inside an organisation', 'Spy, or one that digs'],
  ['ARSON', 'Crime of deliberately setting fires', 'Sonar spun round for a fire crime'],
  ['LOOT', 'Stolen goods', 'Tool reworked: stolen goods'],
  ['SWAG', "Burglar's haul", 'Loot, or style'],
  ['CASE', 'Investigation file', 'Investigation, or a suitcase'],
  ['CELL', 'Small prison room', 'Prison room, or a phone'],
  ['BAIL', 'Money paid to secure release before trial', 'Scoop water, or secure release'],
  ['PAROLE', 'Early release on good behaviour', "Release in return for one's word"],
  ['TRIAD', 'Chinese criminal society', 'Group of three, or a gang'],
  ['JURY', 'Panel that decides guilt in some courts', 'Panel Malaysia scrapped in 1995'],
  ['GAVEL', "Judge's hammer", "Donated pound? A judge's hammer"],
  ['LENS', 'Part of a magnifying glass', "Glass hidden in Allen's pocket"],
  ['TORCH', 'Flashlight', 'Set fire to the flashlight'],
  ['ROBBER', 'One who steals with force', "Cops' opposite number in a playground game"],
  ['PICKPOCKET', 'Thief working a crowd', 'Choose a small pouch? Petaling Street thief'],
  ['SECRET', 'Something kept hidden', 'Erects a new hidden thing'],
  ['CIPHER', 'Secret code', 'Nonentity, or secret writing'],
  ['DOSSIER', 'File on a person', "Rose's ID, shuffled into a file"],
  ['INTEL', 'Gathered information', "Information hidden in ain't elegant"],
  ['BADGE', 'Police shield', 'Flashed at the door by an officer'],
  ['UNDERCOVER', 'Working in disguise', 'Beneath a blanket, working incognito'],
  ['SAFEHOUSE', 'Secret refuge for a witness', 'Secure home for a protected witness'],
  ['OPPORTUNITY', 'Means, motive and ___', 'Chance that completes means and motive'],
  ['GANGSTER', 'Member of a criminal gang', 'Mobster'],
  ['KIDNAP', 'Abduct for ransom', 'Child sleeps? Abduct!'],
  ['BURGLAR', 'House-breaker', 'One who enters in the small hours, uninvited'],
  ['CRIME', 'Offence against the law', 'Cold frost? An offence'],
  ['GUILTY', 'Verdict that sends one down', 'Not innocent'],
  ['PRISON', 'Jail', 'Where time is done'],
  ['CUSTODY', 'Detention by the police', 'Keeping, or being kept'],
  ['ARREST', 'Take into custody', 'Rarest arrangement: take in'],
  ['SIREN', 'Wailing police alarm', 'Rinse out the wailer'],
  ['PATROL', 'Route walked by police', 'Portal opens up for a beat'],
  ['BEAT', "Officer's regular round", "Thrash an officer's round"],
  ['CANE', 'Rattan rod used as punishment', 'Rod, or sugar source'],
  ['SAMSENG', 'Malaysian slang for a thug', 'Local tough guy'],
  ['AH LONG', 'Loan shark, in Malaysian slang', 'Illegal lender, informally'],
  ['ANGPAO', 'Red packet of money', 'Red envelope at new year'],
  ['DURIAN', 'Spiky fruit banned on public transport', 'King of fruits, barred from the train'],
  ['HAWKER', 'Street food seller', 'One who peddles, or flies a falcon'],
];

const clean = (a) => a.replace(/[^A-Z]/g, '');
const enumeration = (a) => a.split(' ').map((w) => w.length).join(',');

function tryBuild(rng, size, words, target) {
  const grid = Array(size * size).fill('');
  const dirAt = Array(size * size).fill(0); // bit 1 across, bit 2 down
  const placed = [];
  const at = (r, c) => (r < 0 || c < 0 || r >= size || c >= size ? null : grid[r * size + c]);

  function fits(word, r, c, dr, dc) {
    const L = word.length;
    if (r < 0 || c < 0 || r + dr * (L - 1) >= size || c + dc * (L - 1) >= size) return -1;
    if (at(r - dr, c - dc)) return -1;
    if (at(r + dr * L, c + dc * L)) return -1;
    const bit = dr ? 2 : 1;
    let cross = 0;
    for (let k = 0; k < L; k++) {
      const rr = r + dr * k, cc = c + dc * k;
      const cur = grid[rr * size + cc];
      if (cur) {
        if (cur !== word[k] || dirAt[rr * size + cc] & bit) return -1;
        cross++;
      } else if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) return -1;
    }
    return cross === L ? -1 : cross;
  }
  function put(entry, word, r, c, dr, dc) {
    for (let k = 0; k < word.length; k++) {
      const i = (r + dr * k) * size + c + dc * k;
      grid[i] = word[k];
      dirAt[i] |= dr ? 2 : 1;
    }
    placed.push({ entry, word, r, c, dir: dr ? 'down' : 'across' });
  }

  // longer words first (with some noise) give a better-knit grid
  const pool = shuffle(rng, words).map((e) => [e, clean(e[0]).length + rng() * 4]).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
  const firstIdx = pool.findIndex((e) => clean(e[0]).length >= Math.min(size - 2, 9));
  const first = pool.splice(Math.max(0, firstIdx), 1)[0];
  const fw = clean(first[0]);
  const fr = Math.floor(size / 2) + (rng() < 0.5 ? -1 : 0);
  put(first, fw, fr, Math.floor((size - fw.length) * rng()), 0, 1);

  // best-fit greedy: each step places the word and spot with the most crossings
  while (placed.length < target && pool.length) {
    let best = null;
    for (let wi = 0; wi < pool.length; wi++) {
      const w = clean(pool[wi][0]);
      for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const x = fits(w, r, c, dr, dc);
        if (x <= 0) continue;
        const score = x * 12 + rng() * 20;
        if (!best || score > best.score) best = { score, wi, w, r, c, dr, dc };
      }
    }
    if (!best) break;
    put(pool[best.wi], best.w, best.r, best.c, best.dr, best.dc);
    pool.splice(best.wi, 1);
  }
  return { grid, placed };
}

export function generate(rng, size = 11, cryptic = false) {
  const target = size >= 13 ? 26 : size >= 11 ? 20 : size >= 9 ? 14 : 10;
  const words = BANK.filter((e) => clean(e[0]).length <= size && clean(e[0]).length >= 3);
  let best = null, bestScore = -1;
  for (let attempt = 0; attempt < 12; attempt++) {
    const res = tryBuild(rng, size, words, target);
    const letters = res.grid.filter(Boolean).length;
    const crossings = res.placed.reduce((n, p) => n + p.word.length, 0) - letters;
    const score = res.placed.length * 100 + crossings * 10 + letters;
    if (score > bestScore) { best = res; bestScore = score; }
  }
  // crop to the used area so the sheet has no dead bands
  const { placed: placed0 } = best;
  let r0 = size, r1 = 0, c0 = size, c1 = 0;
  best.grid.forEach((ch, i) => {
    if (!ch) return;
    const r = Math.floor(i / size), c = i % size;
    r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c);
  });
  const rows = r1 - r0 + 1, cols = c1 - c0 + 1;
  const grid = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) grid.push(best.grid[r * size + c]);
  const placed = placed0.map((p) => ({ ...p, r: p.r - r0, c: p.c - c0 }));
  // numbering in reading order
  const starts = new Set(placed.map((p) => p.r * cols + p.c));
  const numOf = {};
  let n = 0;
  for (let i = 0; i < rows * cols; i++) if (starts.has(i)) numOf[i] = ++n;
  const clues = placed.map((p) => {
    const cells = [...Array(p.word.length)].map((_, k) => (p.dir === 'down' ? (p.r + k) * cols + p.c : p.r * cols + p.c + k));
    return {
      num: numOf[p.r * cols + p.c], dir: p.dir, answer: p.word, enumr: enumeration(p.entry[0]),
      clue: cryptic ? p.entry[2] : p.entry[1], cells,
    };
  }).sort((a, b) => (a.dir === b.dir ? a.num - b.num : a.dir === 'across' ? -1 : 1));
  return { rows, cols, solution: grid, numOf, clues };
}

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

export function mount(el, ctx) {
  const { rng, params = {}, saved } = ctx;
  const cryptic = ctx.variant === 'cryptic-lite';
  const gen = saved?.gen || generate(rng, params.size || (ctx.variant === 'mini' ? 9 : cryptic ? 12 : 13), cryptic);
  const { rows, cols, solution, numOf, clues } = gen;
  const letters = saved?.letters || solution.map(() => '');
  const revealed = new Set(saved?.revealed || []);
  let wrongMarks = new Set();
  let cur = 0; // clue index
  let pos = clues[0].cells[0];
  let solved = false;
  const total = solution.filter(Boolean).length;

  const gridEl = h('div', { class: 'cw-grid', role: 'grid', 'aria-label': 'Crossword grid' });
  gridEl.style.setProperty('--cw-c', cols);
  gridEl.style.setProperty('--cw-r', rows);
  const cellEls = solution.map((ch, i) => {
    if (!ch) { const b = h('div', { class: 'cw-block', 'aria-hidden': 'true' }); gridEl.append(b); return b; }
    const c = h('div', { class: 'cw-cell', role: 'gridcell', 'data-i': i },
      numOf[i] ? h('span', { class: 'cw-num' }, String(numOf[i])) : null,
      h('span', { class: 'cw-letter' }));
    c.addEventListener('pointerdown', (e) => { e.preventDefault(); tapCell(i); });
    gridEl.append(c);
    return c;
  });

  const bar = h('div', { class: 'cw-bar', 'aria-live': 'polite' });
  const prevBtn = h('button', { class: 'btn btn--small cw-nav', 'aria-label': 'Previous clue', onclick: () => stepClue(-1) }, '‹');
  const nextBtn = h('button', { class: 'btn btn--small cw-nav', 'aria-label': 'Next clue', onclick: () => stepClue(1) }, '›');
  const listA = h('ol', { class: 'cw-list' });
  const listD = h('ol', { class: 'cw-list' });
  const clueItems = clues.map((cl, k) => {
    const li = h('li', { class: 'cw-clue', onclick: () => { setClue(k); } },
      h('b', {}, String(cl.num)), ' ', cl.clue, h('span', { class: 'cw-enum' }, ` (${cl.enumr})`));
    (cl.dir === 'across' ? listA : listD).append(li);
    return li;
  });
  const kb = h('div', { class: 'cw-kb', 'aria-label': 'Letter keys' },
    ROWS.map((row, ri) => h('div', { class: 'cw-kb-row' },
      [...row].map((L) => h('button', { class: 'cw-key', onpointerdown: (e) => { e.preventDefault(); type(L); } }, L)),
      ri === 2 ? h('button', { class: 'cw-key cw-key--wide', 'aria-label': 'Delete', onpointerdown: (e) => { e.preventDefault(); back(); } }, 'Del') : null)));
  const checkBtn = h('button', { class: 'btn btn--small', onclick: checkGrid }, 'Check grid');
  const status = h('p', { class: 'feedback' });

  el.append(
    h('p', { class: 'game-rules' }, cryptic
      ? 'Cryptic-lite clues: most hide a definition at one end and wordplay (an anagram, a hidden word, a double meaning or a sum of parts) in the rest. Tap a square, tap again to switch direction, and type. Numbers in brackets give word lengths.'
      : 'Tap a square, tap it again to switch between across and down, and type. Arrow keys move, Tab jumps to the next clue. Numbers in brackets give word lengths.'),
    h('div', { class: 'cw-layout' },
      h('div', { class: 'cw-main' }, h('div', { class: 'cw-barrow' }, prevBtn, bar, nextBtn), gridEl, kb,
        h('div', { class: 'game-toolbar' }, checkBtn)),
      h('div', { class: 'cw-clues' }, h('h3', { class: 'cw-h' }, 'Across'), listA, h('h3', { class: 'cw-h' }, 'Down'), listD)),
    status,
  );

  function cluesAt(i) { return clues.map((c, k) => (c.cells.includes(i) ? k : -1)).filter((k) => k >= 0); }

  function tapCell(i) {
    const ks = cluesAt(i);
    if (i === pos && ks.length > 1) cur = ks.find((k) => k !== cur) ?? cur;
    else if (!ks.includes(cur)) cur = ks.find((k) => clues[k].dir === clues[cur].dir) ?? ks[0];
    pos = i;
    sfx.click();
    render();
  }
  function setClue(k) {
    cur = k;
    pos = clues[k].cells.find((i) => !letters[i]) ?? clues[k].cells[0];
    render();
  }
  function stepClue(d) { setClue((cur + d + clues.length) % clues.length); }

  function type(L) {
    if (solved) return;
    if (!revealed.has(pos)) { letters[pos] = L; wrongMarks.delete(pos); }
    sfx.key();
    const cells = clues[cur].cells;
    const k = cells.indexOf(pos);
    // jump to the next empty square in the word, otherwise just step forward
    const nextEmpty = cells.slice(k + 1).find((i) => !letters[i]);
    if (nextEmpty !== undefined) pos = nextEmpty;
    else if (k < cells.length - 1) pos = cells[k + 1];
    persist(); render(); check();
  }
  function back() {
    if (solved) return;
    const cells = clues[cur].cells;
    const k = cells.indexOf(pos);
    if (letters[pos] && !revealed.has(pos)) letters[pos] = '';
    else if (k > 0) { pos = cells[k - 1]; if (!revealed.has(pos)) letters[pos] = ''; }
    wrongMarks.delete(pos);
    sfx.key();
    persist(); render(); check();
  }
  function move(dr, dc) {
    let r = Math.floor(pos / cols), c = pos % cols;
    for (;;) {
      r += dr; c += dc;
      if (r < 0 || c < 0 || r >= rows || c >= cols) return;
      if (solution[r * cols + c]) break;
    }
    const i = r * cols + c;
    const want = dr ? 'down' : 'across';
    const ks = cluesAt(i);
    cur = ks.find((k) => clues[k].dir === want) ?? ks[0];
    pos = i;
    render();
  }

  function checkGrid() {
    wrongMarks = new Set(solution.map((ch, i) => (ch && letters[i] && letters[i] !== ch ? i : -1)).filter((i) => i >= 0));
    const empty = solution.filter((ch, i) => ch && !letters[i]).length;
    if (wrongMarks.size) {
      sfx.bad();
      status.textContent = `${wrongMarks.size} ${wrongMarks.size === 1 ? 'letter is' : 'letters are'} wrong, marked in red.`;
      status.className = 'feedback is-bad';
    } else {
      status.textContent = empty ? `Everything filled so far is right. ${empty} squares to go.` : '';
      status.className = 'feedback is-good';
    }
    render();
  }

  function render() {
    const active = new Set(clues[cur].cells);
    cellEls.forEach((c, i) => {
      if (!solution[i]) return;
      c.querySelector('.cw-letter').textContent = letters[i];
      c.classList.toggle('is-word', active.has(i));
      c.classList.toggle('is-pos', i === pos);
      c.classList.toggle('is-wrong', wrongMarks.has(i));
      c.classList.toggle('is-revealed', revealed.has(i));
    });
    const cl = clues[cur];
    bar.innerHTML = '';
    bar.append(h('b', {}, `${cl.num} ${cl.dir}`), ' ', cl.clue, h('span', { class: 'cw-enum' }, ` (${cl.enumr})`));
    clueItems.forEach((li, k) => {
      li.classList.toggle('is-active', k === cur);
      li.classList.toggle('is-filled', clues[k].cells.every((i) => letters[i]));
    });
  }

  function check() {
    const right = solution.filter((ch, i) => ch && letters[i] === ch).length;
    ctx.onProgress(right / total);
    if (right === total && !solved) {
      solved = true;
      status.textContent = 'Every answer interlocks. The grid is clean.';
      status.className = 'feedback is-good';
      sfx.solve();
      ctx.onSolved();
    } else if (!solved && solution.every((ch, i) => !ch || letters[i])) {
      status.textContent = 'The grid is full, but something is off. Use Check grid to find it.';
      status.className = 'feedback is-bad';
    }
  }

  function persist() { ctx.onSave({ gen, letters, revealed: [...revealed] }); }

  const onKey = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); type(e.key.toUpperCase()); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); back(); }
    else if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); stepClue(e.shiftKey ? -1 : 1); }
    else if (e.key === ' ') { e.preventDefault(); tapCell(pos); }
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const [dr, dc] = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      move(dr, dc);
    }
  };
  document.addEventListener('keydown', onKey);
  render();
  check();
  persist();

  return {
    destroy: () => document.removeEventListener('keydown', onKey),
    hint() {
      if (solved) return null;
      // fix a wrong letter first, else reveal one in the current word, else anywhere
      let i = solution.findIndex((ch, k) => ch && letters[k] && letters[k] !== ch);
      if (i < 0) i = clues[cur].cells.find((k) => letters[k] !== solution[k]) ?? -1;
      if (i < 0) i = solution.findIndex((ch, k) => ch && letters[k] !== ch);
      if (i < 0) return null;
      letters[i] = solution[i];
      revealed.add(i);
      wrongMarks.delete(i);
      pos = i;
      const ks = cluesAt(i);
      if (!ks.includes(cur)) cur = ks[0];
      persist(); render(); check();
      const cl = clues[cur];
      return `The lab filled in a letter in ${cl.num} ${cl.dir}.`;
    },
    devSolve() {
      solution.forEach((ch, i) => { if (ch) letters[i] = ch; });
      persist(); render(); check();
    },
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Fill the grid with words that answer the clues.',
  steps: [
    'Tap a square. Its clue shows in the bar above the grid.',
    'Type the answer with the letter keys.',
    'Tap the same square again to switch between across and down.',
    'The number in brackets is the word length, like (5).',
    'Tap Check grid to see which letters are wrong.',
  ],
  example: {
    caption: '(5) means five letters. ALIBI fits 1 Across.',
    render(el) {
      let s = rect(8, 8, 364, 38, { fill: '#efe6d0', stroke: C.line, sw: 1, rx: 4 });
      s += text(18, 32, '1 Across: Claim of being somewhere else (5)', { size: 13.5, anchor: 'start', weight: 600 });
      s += grid(90, 72, 1, 5, 40, (r, c) => ({ t: 'ALIBI'[c], fill: c === 0 ? C.yellow : '#e9f0f7', size: 22 }), { sw: 1.2 });
      s += text(94, 84, '1', { size: 10, anchor: 'start', weight: 700 });
      s += grid(210, 112, 1, 1, 40, () => ({}), { sw: 1.2, outer: 1.2 });
      s += arrow(110, 48, 110, 70, { sw: 2.5, head: 8 });
      put(el, svg(380, 160, s, 'The clue bar and the answer ALIBI written across'));
    },
  },
  tips: ['Short words first: their letters help with the long ones.'],
  controls: { touch: 'Tap squares. Use the letter keys under the grid. Del deletes.', keys: 'Type letters. Arrow keys move. Tab jumps to the next clue.' },
  variants: {
    'cryptic-lite': {
      tips: ['Each clue has a plain meaning at one end, and wordplay (a mixed-up word, a hidden word) in the rest.'],
    },
  },
};
