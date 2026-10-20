// Anagrams: unscramble crime and KL words. One letter of each answer is circled; the circled letters make a final word.
import { h } from '../core/ui.js';
import { shuffle, pick } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'anagram', name: 'Anagrams', category: 'Words' };
export const demo = { variant: 'words', params: { difficulty: 'hard' } };

// [answer, definition]. Long words with no common alternative anagram.
export const WORDS = [
  ['INSPECTOR', 'Police rank above sergeant'], ['SERGEANT', 'Police rank below inspector'],
  ['FORENSIC', 'Kind of science used in a crime lab'], ['AUTOPSY', 'Post-mortem examination'],
  ['HANDCUFFS', 'Steel restraints for the wrists'], ['WARRANT', 'Court order to search or arrest'],
  ['HOSTAGE', 'Captive held to force demands'], ['SMUGGLER', 'One who runs goods past customs'],
  ['CONTRABAND', 'Smuggled goods'], ['GETAWAY', 'Escape after a robbery'],
  ['FINGERPRINT', 'Mark left by a fingertip'], ['INTERPOL', 'International police organisation'],
  ['CULPRIT', 'Person to blame'], ['CORRUPT', 'Dishonest, like a bent official'],
  ['FORGERY', 'Faked signature or document'], ['PETALING', '___ Street, the Chinatown market'],
  ['MERDEKA', 'Malay word for independence'], ['KOPITIAM', 'Traditional coffee shop'],
  ['BRICKFIELDS', "KL's Little India"], ['BANGSAR', 'Leafy suburb with a bar street'],
  ['MONSOON', 'Season of heavy rain'], ['GUMSHOE', 'Slang for a private detective'],
  ['PERJURY', 'Lying under oath'], ['DOSSIER', 'File on a person'],
  ['UNDERCOVER', 'Working in disguise'], ['SAFEHOUSE', 'Secret refuge for a witness'],
  ['OPPORTUNITY', 'Means, motive and ___'], ['GANGSTER', 'Member of a criminal gang'],
  ['KIDNAPPER', 'One who abducts for ransom'], ['BURGLARY', 'Breaking in to steal'],
  ['CUSTODY', 'Detention by the police'], ['DETECTIVE', 'Investigator on a case'],
  ['EVIDENCE', 'Proof laid before a court'], ['VERDICT', 'Decision at the end of a trial'],
  ['SUSPECT', 'Person thought to be guilty'], ['WITNESS', 'Someone who saw it happen'],
  ['CONFESSION', 'Admission of guilt'], ['ACCOMPLICE', 'Partner in crime'],
  ['BLACKMAIL', 'Demanding money with threats'], ['EMBEZZLE', 'Steal funds you were trusted with'],
  ['COUNTERFEIT', 'Fake, like a copied banknote'], ['CONSPIRACY', 'Secret plot by several people'],
  ['MAGISTRATE', 'Judge in a lower court'], ['PROSECUTOR', 'Lawyer who brings the charge'],
  ['DEFENDANT', 'Person accused in court'], ['TESTIMONY', 'Evidence given under oath'],
  ['INFORMANT', 'Person who tips off the police'], ['BALACLAVA', 'Knitted mask with eye holes'],
  ['CROWBAR', 'Iron bar for forcing doors'], ['LOCKPICK', 'Tool for opening a lock without a key'],
  ['CHLOROFORM', 'Old anaesthetic on a rag'], ['CYANIDE', 'Poison with a bitter almond smell'],
  ['KAMPUNG', 'Malay village'], ['CHINATOWN', 'District around Petaling Street'],
  ['PUTRAJAYA', 'Federal administrative capital'], ['INTERROGATE', 'Question at length'],
  ['MOTORCYCLE', 'Two-wheeled getaway in KL traffic'], ['STAKEHOLDER', 'One who holds the bets'],
  ['PATHOLOGIST', 'Doctor who examines the dead'], ['STRANGLER', 'Killer with the hands'],
];

// [phrase, definition]
export const PHRASES = [
  ['SMOKING GUN', 'Undeniable proof'], ['COLD CASE', 'Unsolved file left on the shelf'],
  ['INSIDE JOB', 'Crime committed with help from within'], ['CRIME SCENE', 'Place taped off by police'],
  ['RED HERRING', 'Clue meant to mislead'], ['PRIME SUSPECT', 'The person police most suspect'],
  ['HUSH MONEY', 'Payment for silence'], ['PETALING STREET', 'Chinatown market street'],
  ['NASI LEMAK', 'Coconut rice with sambal'], ['MERDEKA SQUARE', 'Field where independence was declared'],
  ['TWIN TOWERS', 'Petronas landmark'], ['PUDU JAIL', 'Old prison on Jalan Hang Tuah'],
  ['LOAN SHARK', 'Illegal lender'], ['DOUBLE CROSS', 'Betrayal of a partner'],
  ['FALL GUY', 'One set up to take the blame'], ['DEAD DROP', 'Secret hand-off spot'],
  ['CAT BURGLAR', 'Thief who climbs in'], ['PAPER TRAIL', 'Documents that tell the story'],
  ['KUALA LUMPUR', 'Muddy confluence'], ['BUKIT BINTANG', 'Shopping district, star hill'],
  ['LITTLE INDIA', 'Brickfields, by another name'], ['CENTRAL MARKET', 'Pasar Seni building'],
  ['MASJID JAMEK', 'Mosque at the confluence'], ['DARK ALLEY', 'Unlit back lane'],
  ['NIGHT SHIFT', 'Hours worked after dark'], ['FALSE ALIBI', 'Lie about where you were'],
  ['MURDER WEAPON', 'Exhibit A, often'], ['MISSING PERSON', 'Someone who has vanished'],
  ['LOCKED ROOM', 'Classic impossible-crime setting'], ['BLIND SPOT', 'Where the camera cannot see'],
  ['GRAVEYARD SHIFT', 'Work through the small hours'], ['CHOW KIT MARKET', 'Wet market off Jalan Raja Laut'],
];

// final words, with a definition shown to the player
const METAS_WORDS = [
  ['SUSPECT', 'The person in the frame'], ['WITNESS', 'The one who saw it'], ['VERDICT', 'What the court delivers'],
  ['CULPRIT', 'The one to blame'], ['HOSTAGE', 'The one held captive'], ['CUSTODY', 'Where the arrested are kept'],
  ['AUTOPSY', 'What the pathologist performs'], ['EVIDENCE', 'What the case rests on'], ['INFORMER', 'Who tipped off the police'],
  ['FORENSIC', 'Kind of lab that cracked it'], ['ACCOMPLICE', 'Who helped'], ['GETAWAY', 'How they fled'],
];
const METAS_PHRASE = [
  ['ALIBI', 'What every suspect needs'], ['MOTIVE', 'Why it was done'], ['RANSOM', 'What the kidnappers want'],
  ['BRIBE', 'Coffee money'], ['HEIST', 'The big job'], ['TRIAD', 'The society behind it'],
  ['CORPSE', 'What was found'], ['SNITCH', 'Who talked'], ['POISON', 'What was in the tea'],
];

const letters = (s) => s.replace(/[^A-Z]/g, '');

function scramble(rng, word) {
  const src = [...word];
  let best = null, bestMoved = -1;
  for (let k = 0; k < 30; k++) {
    const s = shuffle(rng, src);
    const moved = s.filter((ch, i) => ch !== src[i]).length;
    // avoid leaving long runs of the answer intact
    let run = 0;
    for (let i = 0; i + 1 < s.length; i++) if (word.includes(s[i] + s[i + 1])) run++;
    const score = moved - run * 0.7;
    if (score > bestMoved && s.join('') !== word) { best = s; bestMoved = score; }
  }
  return best;
}

export function generate(rng, variant = 'words', difficulty = 'hard') {
  const phrase = variant === 'phrase';
  const pool = phrase ? PHRASES : WORDS;
  const metas = (phrase ? METAS_PHRASE : METAS_WORDS).filter(([m]) => (difficulty === 'easy' ? m.length <= 7 : true));
  for (let attempt = 0; attempt < 50; attempt++) {
    const [metaWord, metaDef] = pick(rng, metas);
    const usable = shuffle(rng, pool.filter(([w]) => letters(w) !== metaWord));
    const items = [];
    const used = new Set();
    let ok = true;
    for (const L of metaWord) {
      const cand = usable.find(([w]) => !used.has(w) && letters(w).includes(L));
      if (!cand) { ok = false; break; }
      used.add(cand[0]);
      const ans = letters(cand[0]);
      const spots = [...ans].map((ch, i) => (ch === L ? i : -1)).filter((i) => i >= 0);
      items.push({ answer: cand[0], def: cand[1], circle: pick(rng, spots) });
    }
    if (!ok) continue;
    const order = shuffle(rng, items);
    order.forEach((it) => { it.tiles = scramble(rng, letters(it.answer)); });
    const metaTiles = order.map((it) => letters(it.answer)[it.circle]);
    return { items: order, meta: { answer: metaWord, def: metaDef, tiles: metaTiles } };
  }
  throw new Error('anagram generation failed');
}

export function mount(el, ctx) {
  const { rng, params = {}, saved } = ctx;
  const variant = ctx.variant === 'phrase' ? 'phrase' : 'words';
  const difficulty = params.difficulty || 'hard';
  const gen = saved?.gen || generate(rng, variant, difficulty);
  const showDefs = difficulty === 'easy';
  // row state: slots hold tile indices (or null); locked slots were revealed by hints
  const rows = saved?.rows || gen.items.map((it) => ({ slots: Array(letters(it.answer).length).fill(null), locked: [], solved: false, def: showDefs }));
  const metaRow = saved?.metaRow || { slots: Array(gen.meta.answer.length).fill(null), locked: [], solved: false };
  let active = rows.findIndex((r) => !r.solved);
  if (active < 0) active = metaRow.solved ? 0 : -1;
  let finished = false;
  const status = h('p', { class: 'feedback' });

  const rowEls = gen.items.map((it, ri) => buildRow(ri));
  const metaEl = buildMeta();

  el.append(
    h('p', { class: 'game-rules' }, variant === 'phrase'
      ? 'Each line is a phrase with its letters scrambled; the gaps show the word lengths. Tap letters (or type) to fill the slots, tap a slot to take a letter back. Solved phrases give up their circled letter for the final word.'
      : 'Each line is one scrambled word from the case. Tap letters (or type) to fill the slots, tap a slot to take a letter back. Solved words give up their circled letter for the final word at the bottom.'),
    h('div', { class: 'an-list' }, rowEls.map((r) => r.root)),
    metaEl.root,
    status,
  );

  function itemFor(ri) { return ri === -1 ? { answer: gen.meta.answer, tiles: gen.meta.tiles } : gen.items[ri]; }
  function stateFor(ri) { return ri === -1 ? metaRow : rows[ri]; }
  function availableTiles(ri) {
    if (ri !== -1) return itemFor(ri).tiles.map((_, i) => i);
    return gen.items.map((_, i) => i).filter((i) => rows[i].solved);
  }

  function buildRow(ri) {
    const it = gen.items[ri];
    const tilesEl = h('div', { class: 'an-tiles' });
    const slotsEl = h('div', { class: 'an-slots' });
    const defEl = h('p', { class: 'an-def' });
    const root = h('div', { class: 'an-row', onpointerdown: () => { if (active !== ri) { active = ri; renderAll(); } } },
      h('span', { class: 'an-num' }, String(ri + 1)),
      h('div', { class: 'an-body' }, tilesEl, slotsEl, defEl));
    return { root, tilesEl, slotsEl, defEl };
  }
  function buildMeta() {
    const tilesEl = h('div', { class: 'an-tiles' });
    const slotsEl = h('div', { class: 'an-slots' });
    const root = h('div', { class: 'an-meta', onpointerdown: () => { if (active !== -1) { active = -1; renderAll(); } } },
      h('h3', { class: 'an-h' }, 'Final word'),
      h('p', { class: 'an-def' }, `${gen.meta.def}. ${gen.meta.answer.length} letters.`),
      tilesEl, slotsEl);
    return { root, tilesEl, slotsEl };
  }

  function wordBreaks(ans) {
    const breaks = new Set();
    let n = 0;
    for (const ch of ans) { if (ch === ' ') breaks.add(n); else n++; }
    return breaks;
  }

  function renderRow(ri) {
    const R = ri === -1 ? metaEl : rowEls[ri];
    const st = stateFor(ri);
    const it = itemFor(ri);
    const used = new Set(st.slots.filter((x) => x != null));
    R.root.classList.toggle('is-active', active === ri);
    R.root.classList.toggle('is-solved', st.solved);
    R.root.classList.toggle('is-wrong', !st.solved && st.slots.every((x) => x != null));
    R.tilesEl.innerHTML = '';
    const avail = availableTiles(ri);
    if (ri === -1 && !avail.length) R.tilesEl.append(h('span', { class: 'an-wait' }, 'Circled letters will collect here.'));
    for (const ti of avail) {
      const isUsed = used.has(ti);
      R.tilesEl.append(h('button', {
        class: `an-tile${isUsed ? ' is-used' : ''}`, disabled: isUsed || st.solved, 'aria-label': `Letter ${it.tiles[ti]}`,
        onclick: () => { active = ri; place(ri, ti); },
      }, it.tiles[ti]));
    }
    R.slotsEl.innerHTML = '';
    const ans = it.answer;
    const breaks = ri === -1 ? new Set() : wordBreaks(ans);
    st.slots.forEach((ti, k) => {
      if (breaks.has(k) && k > 0) R.slotsEl.append(h('span', { class: 'an-gap' }));
      const circled = ri !== -1 && gen.items[ri].circle === k;
      R.slotsEl.append(h('button', {
        class: `an-slot${circled ? ' is-circled' : ''}${st.locked[k] ? ' is-locked' : ''}`,
        'aria-label': `Slot ${k + 1}${ti != null ? `, ${it.tiles[ti]}` : ', empty'}${circled ? ', circled' : ''}`,
        onclick: () => { active = ri; unplace(ri, k); },
      }, ti != null ? it.tiles[ti] : ''));
    });
    if (ri !== -1) R.defEl.textContent = st.def ? `Lab note: ${gen.items[ri].def}.` : '';
  }

  function renderAll() {
    rows.forEach((_, ri) => renderRow(ri));
    renderRow(-1);
    const solvedN = rows.filter((r) => r.solved).length + (metaRow.solved ? 1 : 0);
    ctx.onProgress(solvedN / (rows.length + 1));
  }

  function place(ri, ti) {
    const st = stateFor(ri);
    if (st.solved || st.slots.includes(ti)) return;
    const k = st.slots.findIndex((x) => x == null);
    if (k < 0) return;
    st.slots[k] = ti;
    sfx.key();
    afterChange(ri);
  }
  function unplace(ri, k) {
    const st = stateFor(ri);
    if (st.solved || st.locked[k] || st.slots[k] == null) return;
    st.slots[k] = null;
    sfx.click();
    afterChange(ri);
  }
  function backspace(ri) {
    const st = stateFor(ri);
    if (st.solved) return;
    for (let k = st.slots.length - 1; k >= 0; k--) if (st.slots[k] != null && !st.locked[k]) { st.slots[k] = null; break; }
    sfx.click();
    afterChange(ri);
  }
  function clearRow(ri) {
    const st = stateFor(ri);
    if (st.solved) return;
    st.slots = st.slots.map((x, k) => (st.locked[k] ? x : null));
    afterChange(ri);
  }

  function afterChange(ri) {
    const st = stateFor(ri);
    const it = itemFor(ri);
    if (st.slots.every((x) => x != null)) {
      const word = st.slots.map((ti) => it.tiles[ti]).join('');
      const target = letters(it.answer);
      if (word === target) {
        st.solved = true;
        sfx.good();
        if (ri !== -1) {
          status.textContent = `Unscrambled: ${it.answer}. Its circled letter drops into the final word.`;
          status.className = 'feedback is-good';
          const next = rows.findIndex((r) => !r.solved);
          active = next >= 0 ? next : -1;
        }
      } else {
        sfx.bad();
        status.textContent = 'Those letters do not make the answer. Tap a slot to take a letter back.';
        status.className = 'feedback is-bad';
      }
    }
    persist();
    renderAll();
    checkDone();
  }

  function checkDone() {
    if (finished) return;
    if (metaRow.solved && rows.every((r) => r.solved)) {
      finished = true;
      status.textContent = `The final word is ${gen.meta.answer}. The scrambled notes give it up.`;
      status.className = 'feedback is-good';
      sfx.solve();
      ctx.onSolved();
    }
  }

  function persist() { ctx.onSave({ gen, rows, metaRow }); }

  const onKey = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (active == null) return;
    if (/^[a-zA-Z]$/.test(e.key)) {
      const L = e.key.toUpperCase();
      const st = stateFor(active), it = itemFor(active);
      const ti = availableTiles(active).find((i) => it.tiles[i] === L && !st.slots.includes(i));
      if (ti != null) place(active, ti); else sfx.bad();
    } else if (e.key === 'Backspace') { e.preventDefault(); backspace(active); }
    else if (e.key === 'Escape') clearRow(active);
    else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      active = active === -1 ? 0 : active + 1 >= rows.length ? -1 : active + 1;
      renderAll();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = active === -1 ? rows.length - 1 : active === 0 ? -1 : active - 1;
      renderAll();
    }
  };
  document.addEventListener('keydown', onKey);
  renderAll();
  checkDone();
  persist();

  // place the right tile into slot k, removing it from any other slot
  function reveal(ri, k) {
    const st = stateFor(ri), it = itemFor(ri);
    const want = letters(it.answer)[k];
    const avail = availableTiles(ri);
    // prefer a tile that is not already sitting in a correct, locked slot
    let ti = avail.find((i) => it.tiles[i] === want && !st.slots.some((x, j) => x === i && st.locked[j]) && !st.slots.includes(i));
    if (ti == null) ti = avail.find((i) => it.tiles[i] === want && !st.slots.some((x, j) => x === i && st.locked[j]));
    if (ti == null) return false;
    const j = st.slots.indexOf(ti);
    if (j >= 0) st.slots[j] = null;
    if (st.slots[k] != null && st.slots[k] !== ti) st.slots[k] = null;
    st.slots[k] = ti;
    st.locked[k] = true;
    return true;
  }

  return {
    destroy: () => document.removeEventListener('keydown', onKey),
    hint() {
      if (finished) return null;
      const ri = rows[active] && !rows[active].solved ? active : rows.findIndex((r) => !r.solved);
      if (ri >= 0) {
        const st = rows[ri];
        active = ri;
        if (!st.def) {
          st.def = true;
          persist(); renderAll();
          return `The lab added a note under line ${ri + 1}.`;
        }
        const ans = letters(gen.items[ri].answer);
        const k = ans.split('').findIndex((ch, i) => !st.locked[i]);
        if (k < 0) return null;
        // clear unlocked letters so the reveal cannot clash
        st.slots = st.slots.map((x, i) => (st.locked[i] ? x : null));
        reveal(ri, k);
        afterChange(ri);
        return `Line ${ri + 1}: letter ${k + 1} is ${ans[k]}.`;
      }
      const ans = gen.meta.answer;
      const k = ans.split('').findIndex((_, i) => !metaRow.locked[i]);
      if (k < 0) return null;
      active = -1;
      metaRow.slots = metaRow.slots.map((x, i) => (metaRow.locked[i] ? x : null));
      reveal(-1, k);
      afterChange(-1);
      return `The final word, letter ${k + 1}, is ${ans[k]}.`;
    },
    devSolve() {
      gen.items.forEach((it, ri) => {
        const st = rows[ri];
        st.slots = st.slots.map(() => null);
        const ans = letters(it.answer);
        const usedT = new Set();
        [...ans].forEach((ch, k) => { const ti = it.tiles.findIndex((t, i) => t === ch && !usedT.has(i)); usedT.add(ti); st.slots[k] = ti; });
        st.solved = true;
      });
      const usedT = new Set();
      metaRow.slots = [...gen.meta.answer].map((ch) => { const ti = gen.meta.tiles.findIndex((t, i) => t === ch && !usedT.has(i)); usedT.add(ti); return ti; });
      metaRow.solved = true;
      persist(); renderAll(); checkDone();
    },
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Unscramble each word, then use the circled letters to make one final word.',
  steps: [
    'Each line shows the letters of one word, mixed up.',
    'Tap the letters in the right order to spell the word.',
    'Tap a slot to take its letter back.',
    'Each solved word sends its circled letter down to the final word.',
    'Unscramble the final word at the bottom to finish.',
  ],
  example: {
    caption: 'B L I A I rearranged spells ALIBI. Its circled letter (B) goes to the final word.',
    render(el) {
      let s = '';
      'BLIAI'.split('').forEach((L, i) => { s += chip(70 + i * 50, 10, 42, 42, L, { size: 20, weight: 700, fill: '#efe2bf' }); });
      'ALIBI'.split('').forEach((L, i) => {
        s += rect(70 + i * 50, 92, 42, 42, { fill: C.paper, stroke: C.ink, sw: 1.5, rx: 4 }) + text(91 + i * 50, 120, L, { size: 22, weight: 700, fill: C.blue, font: 'display' });
      });
      s += ring(91 + 3 * 50, 113, 25);
      s += arrow(40, 31, 40, 108, { bend: 0, sw: 2.5 });
      put(el, svg(380, 144, s, 'Scrambled tiles BLIAI arranged into ALIBI'));
    },
  },
  tips: ['The Magnifier places one correct letter for you.'],
  controls: { touch: 'Tap letter tiles. Tap a filled slot to remove its letter.', keys: 'Type the letters. Backspace removes the last one.' },
  variants: {
    phrase: {
      goal: 'Unscramble each phrase, then use the circled letters to make one final word.',
      steps: [
        'Each line is a phrase with its letters mixed up.',
        'Gaps between the slots show where words end.',
        'Tap the letters in order to fill the slots.',
        'Each solved phrase sends its circled letter to the final word.',
        'Unscramble the final word at the bottom to finish.',
      ],
    },
  },
};
