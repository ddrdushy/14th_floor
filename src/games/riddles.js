// Riddles and lateral-thinking situations from the case files. Typed answers, tolerant matching, limited clues.
import { h } from '../core/ui.js';
import { shuffle } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'riddles', name: 'Riddles', category: 'Lateral thinking' };
export const demo = { variant: 'mixed', params: {} };

// Short riddles: a = accepted answers (any one matches), c = progressive clues, x = explanation once solved.
export const RIDDLES = [
  { id: 'r1', q: 'The more you take, the more you leave behind. Every suspect leaves a trail of them.', a: ['footsteps', 'footprints', 'steps', 'tracks', 'foot prints', 'foot steps'], c: ['You make them with every stride.', 'Look down at the mud below the window.'], x: 'Footsteps: the more you take, the more you leave behind.' },
  { id: 'r2', q: 'I have keys but open no locks. I have space but no room. You can enter, but never go inside. The night clerk at the station pounds on me for hours.', a: ['keyboard', 'typewriter', 'computer'], c: ['Every statement passes through me.', 'Q, W, E, R, T, Y.'], x: 'A keyboard: keys, a space bar and an Enter key.' },
  { id: 'r3', q: 'What gets wetter the more it dries? There is one by the sink in every interrogation-room washroom.', a: ['towel', 'hand towel', 'cloth', 'rag'], c: ['It hangs on a rail.', 'You use it after washing your hands.'], x: 'A towel gets wetter the more it dries you.' },
  { id: 'r4', q: 'I have a face and two hands but no arms or legs. The witness swore by what I said: eleven forty-two.', a: ['clock', 'watch', 'wristwatch', 'wall clock'], c: ['I tell you something without speaking.', 'Tick.'], x: 'A clock: a face, two hands, and the time of the crime.' },
  { id: 'r5', q: 'The one who makes it sells it. The one who buys it never uses it. The one who uses it never knows. The undertaker keeps three in the back.', a: ['coffin', 'casket'], c: ['It is made of wood and lined with cloth.', 'Its user is lying down for good.'], x: 'A coffin: its user never knows they are in it.' },
  { id: 'r6', q: 'I have cities but no houses, rivers but no water, roads but no cars. The getaway driver studied me for a week.', a: ['map', 'street map', 'road map', 'atlas'], c: ['I fold, badly.', 'Every route out of town is on me.'], x: 'A map: cities, rivers and roads, all on paper.' },
  { id: 'r7', q: 'What has one eye but cannot see? The tailor in Chow Kit keeps one tucked in his lapel.', a: ['needle', 'sewing needle'], c: ['The eye is very small.', 'Thread goes through it.'], x: 'A needle has an eye for the thread.' },
  { id: 'r8', q: 'What has to be broken before you can use it? The mamak cook breaks dozens before dawn.', a: ['egg', 'eggs'], c: ['It comes from a hen.', 'Half-boiled, with soy sauce and pepper.'], x: 'An egg: no use until it is broken.' },
  { id: 'r9', q: 'I drift across the strait every dry season. The more of me there is, the less you see. Perfect cover for a getaway.', a: ['haze', 'smoke', 'smog', 'fog', 'mist'], c: ['I come from burning forests.', 'The air quality index climbs when I arrive.'], x: 'The haze: the thicker it gets, the less you can see.' },
  { id: 'r10', q: 'What word becomes shorter when you add two letters to it?', a: ['short', 'shorter'], c: ['Do not think about length. Think about spelling.', 'Add E and R.'], x: '"Short" plus two letters becomes "shorter".' },
  { id: 'r11', q: 'I have a neck but no head, and I wear a cap. One of me was found smashed in the alley behind the bar.', a: ['bottle', 'glass bottle', 'beer bottle'], c: ['You drink from me.', 'The cap twists or pops off.'], x: 'A bottle: a neck and a cap, but no head.' },
  { id: 'r12', q: 'I run but never walk. I have a mouth but never talk, a bed but never sleep. In this city two of me meet and turn to mud.', a: ['river', 'rivers', 'klang', 'gombak'], c: ['Kuala Lumpur is named after where two of me meet.', 'The Klang is one.'], x: 'A river: it runs, it has a mouth and a bed.' },
  { id: 'r13', q: 'Two fathers and two sons went fishing at Port Klang. Each caught exactly one fish, yet only three fish came home and none were lost. How?', a: ['grandfather', 'three people', 'three of them', 'three men', 'grandpa', 'grandson', 'three generations', '3 people', '3 men'], c: ['Count the people, not the titles.', 'One man is both a father and a son.'], x: 'There were only three of them: a grandfather, his son and his grandson.' },
  { id: 'r14', q: 'What belongs to you, but other people use it far more than you do? The desk sergeant asks for it first.', a: ['name', 'your name', 'my name'], c: ['It is written on your IC.', 'People call you by it.'], x: 'Your name: everyone else uses it more than you.' },
  { id: 'r15', q: 'I am light as a feather, yet the strongest man cannot hold me for more than a few minutes. Ask any suspect sweating under the lamp.', a: ['breath', 'your breath', 'air', 'breathing'], c: ['You take me in and let me out.', 'Hold it.'], x: 'Your breath: weightless, and impossible to hold for long.' },
  { id: 'r16', q: 'Feed me and I live. Give me a drink and I die. The arsonist knew exactly what I wanted.', a: ['fire', 'flame', 'flames', 'blaze'], c: ['I need air and fuel.', 'Water kills me.'], x: 'Fire: fuel feeds it, water kills it.' },
  { id: 'r17', q: 'What comes once in a minute, twice in a moment, but never in a thousand years?', a: ['m', 'letter m', 'the letter m'], c: ['Read the words, do not count the time.', 'Look at the spelling of minute and moment.'], x: 'The letter M.' },
  { id: 'r18', q: 'Say my name and I disappear. The suspect kept me for the whole interview.', a: ['silence', 'quiet', 'the silence'], c: ['A lawyer might advise it.', 'Speaking breaks it.'], x: 'Silence: saying its name breaks it.' },
  { id: 'r19', q: 'I have branches but no fruit, no trunk and no leaves. There are a dozen of me along Jalan Sultan Ismail.', a: ['bank', 'banks'], c: ['You can open an account with me.', 'Robbers like me.'], x: 'A bank has branches.' },
  { id: 'r20', q: 'What can you catch but never throw? The detective caught one standing in the monsoon rain all night.', a: ['cold', 'a cold', 'flu', 'chill', 'the flu', 'fever'], c: ['It comes with a sniffle.', 'Achoo.'], x: 'A cold: you can catch one but you cannot throw it.' },
  { id: 'r21', q: 'The informant had one. The moment he shared it, he no longer had it. What was it?', a: ['secret', 'a secret', 'the secret'], c: ['It is told in a whisper.', 'Once told, it is not this any more.'], x: 'A secret: share it and it is gone.' },
  { id: 'r22', q: 'It goes up but never comes down, no matter how many cases you close.', a: ['age', 'your age', 'my age', 'years'], c: ['Everyone has one, and it only climbs.', 'Birthdays add to it.'], x: 'Your age only goes up.' },
];

// Situation puzzles: k = groups of keywords; every group needs at least one hit. Clues are yes or no questions put to the lab.
export const SITUATIONS = [
  { id: 's1', q: 'A man is found hanged from the ceiling fan of an empty room on the fourteenth floor. The door is bolted from the inside. There is no furniture, nothing he could have stood on, only a damp patch on the floor beneath him. How did he reach the fan?', k: [['ice']], c: ['Was anything carried out of the room? Nothing was.', 'Was the damp patch there the night before? No.', 'Did he stand on something? Yes, something that is now mostly water.'], x: 'He stood on a block of ice, which melted away.' },
  { id: 's2', q: 'Ali and Mei are found dead on the floor of a Bangsar flat, among water and broken glass. A window is open and the curtain is flapping. Nobody else was there and nobody will be charged. What happened?', k: [['fish', 'goldfish', 'bowl', 'tank', 'aquarium']], c: ['Were Ali and Mei people? No.', 'Did the wind matter? Yes, it knocked something off a ledge.', 'Did they drown? Quite the opposite.'], x: 'Ali and Mei were goldfish. The wind knocked their bowl to the floor.' },
  { id: 's3', q: 'A man walks into a kopitiam and asks for a glass of water. The owner pulls a pistol from under the counter and points it at him. The man says thank you and walks out, quite happy. Why?', k: [['hiccup', 'hiccough', 'hic']], c: ['Was the man thirsty? No.', 'Did the owner mean him harm? No, he was helping.', 'Was the man cured of something? Yes, by the shock.'], x: 'The man had hiccups. The scare cured them faster than water.' },
  { id: 's4', q: 'A woman in Ampang shoots her husband. Then she holds him under water for five minutes. Finally, she hangs him. An hour later they go out to dinner together. How?', k: [['photo', 'picture', 'camera', 'film', 'negative', 'develop', 'print', 'darkroom']], c: ['Was the husband hurt? No.', 'Was a gun involved? No.', 'Does she work in a darkroom? Yes.'], x: 'She is a photographer. She shot his picture, developed it in a bath, and hung it to dry.' },
  { id: 's5', q: 'A man pushes his car up to a hotel and tells the owner he is bankrupt. Why?', k: [['monopoly', 'board game', 'boardgame', 'game']], c: ['Is the car full size? No, it fits in your hand.', 'Is he really ruined? Only for this evening.', 'Were dice involved? Yes.'], x: 'He is playing Monopoly. His token is the car, and he landed on a hotel.' },
  { id: 's6', q: 'A man lives on the fourteenth floor. Every morning he takes the lift down. Coming home, he rides to the eighth floor and walks the rest, except on rainy days, when he rides all the way up. Why?', k: [['short', 'height', 'reach', 'umbrella', 'small', 'tall', 'dwarf', 'little']], c: ['Does he enjoy the stairs? No.', 'Is the lift faulty? No.', 'Does the umbrella matter? Yes, it lets him do something he normally cannot.'], x: 'He is too short to reach the button for fourteen. With an umbrella he can press it.' },
  { id: 's7', q: 'A condemned smuggler must choose one of three rooms. The first is full of raging fire. The second holds assassins with loaded guns. The third holds lions that have not eaten in three years. Which room is safest, and why?', k: [['lion', 'third', '3'], ['dead', 'starv', 'die', 'not alive']], c: ['Can the fire be put out? No.', 'Will the assassins miss? No.', 'How long can a lion live without food? Nowhere near three years.'], x: 'The third room. Lions that have not eaten in three years are long dead.' },
  { id: 's8', q: 'A man is found dead in the middle of a field. Next to him lies an unopened pack. There are no footprints anywhere around him. How did he die?', k: [['parachute', 'chute', 'skydiv']], c: ['Did he walk into the field? No.', 'Was the pack his? Yes, he was wearing it.', 'Did he fall? Yes, from very high.'], x: 'His parachute failed to open.' },
  { id: 's9', q: 'The detective plays the cassette found in the dead man\'s hand. A voice says "I can\'t go on," then a gunshot. The detective says, "This was murder." Why?', k: [['rewind', 'rewound', 'wound back', 'beginning', 'at the start', 'back to the start']], c: ['Was it the dead man\'s voice? Yes.', 'Where was the tape when it was found? Ready to play from the very start.', 'Can a dead man press buttons? No.'], x: 'The tape had been rewound. A man who shot himself could not have rewound it.' },
  { id: 's10', q: 'A man in a Penang hotel hears a knock. When he opens the door, a stranger says, "Sorry, I thought this was my room," and leaves. The man calls security at once. Why?', k: [['knock']], c: ['Did the stranger look odd? Not especially.', 'Was it what he said, or what he did? What he did first.', 'Do you knock on your own door? No.'], x: 'Nobody knocks on the door of their own room. The stranger was checking whether it was empty.' },
  { id: 's11', q: 'Two women drink iced tea at a stall in Pudu. One gulps hers down and leaves. The other sips slowly for half an hour. The slow drinker dies, the fast one is fine. Both glasses were poisoned. How?', k: [['ice', 'cube']], c: ['Was the tea itself poisoned? No.', 'Did time matter? Yes.', 'Was the poison inside something solid? Yes.'], x: 'The poison was frozen in the ice cubes. It was only released as they melted.' },
  { id: 's12', q: 'A man shaves many times a day, yet he still has a full beard. How?', k: [['barber', 'shaves other', 'shaves customer', 'shaves people', 'shaves others']], c: ['Does he shave himself? No.', 'Is it his job? Yes.'], x: 'He is a barber. He shaves other people.' },
  { id: 's13', q: 'A lorry driver goes the wrong way down a one-way street in Chinatown. A traffic policeman watches him but does nothing. Why?', k: [['walk', 'foot', 'pedestrian', 'not driving', 'on foot', 'no lorry', 'without']], c: ['Was a lorry in the street? No.', 'Was he working? No, he was off duty.', 'Was he in any vehicle? No.'], x: 'The lorry driver was walking. Pedestrians can go either way.' },
  { id: 's14', q: 'A woman gave birth to two sons in the same hour of the same day of the same year, yet they are not twins. How?', k: [['triplet', 'quadruplet', 'quintuplet', 'three', 'third', 'one of three']], c: ['Do they share a mother? Yes.', 'Were only two children born? No.'], x: 'They were two of a set of triplets.' },
  { id: 's15', q: 'A window cleaner slips and falls from the twentieth floor of an office tower in Bukit Bintang, yet he is not hurt at all. How?', k: [['inside', 'indoor', 'interior', 'in the room', 'in the office', 'into the room', 'into the office', 'onto the floor', 'office floor', 'inner side']], c: ['Did he fall twenty floors? No.', 'Was he outside the glass? No.'], x: 'He was cleaning the inside of the window, so he fell onto the office floor.' },
  { id: 's16', q: 'A man lies dead at a table with fifty-three bicycles scattered around him. What happened?', k: [['card', 'deck'], ['cheat', 'extra', '53', 'ace', 'too many', 'one more', 'fifty']], c: ['Are they real bicycles? No, they are printed.', 'Was he playing a game? Yes, for money.', 'How many should there have been? Fifty-two.'], x: 'Bicycle is a brand of playing cards. There were 53 cards in the deck: he was caught cheating.' },
];

const STOP = new Set(['a', 'an', 'the', 'it', 'is', 'its', 'was', 'my', 'your', 'his', 'her', 'their', 'of', 'to', 'i', 'think', 'maybe', 'answer', 'perhaps', 'probably', 'that', 'this']);
const words = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
const stem = (w) => (w.length > 4 && w.endsWith('es') ? w.slice(0, -2) : w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
}
const near = (x, y) => stem(x) === stem(y) || (y.length >= 5 && lev(x, y) <= 1) || (y.length >= 8 && lev(x, y) <= 2);

/** Riddle check: every word of some accepted answer appears (allowing small typos), in a short reply. */
let ANSWER_WORDS = null;
export function matchRiddle(input, accepted) {
  const toks = words(input).filter((w) => !STOP.has(w));
  if (!toks.length || toks.length > 14) return false;
  // a list of guesses is not an answer: refuse replies that also name other riddles' answers
  ANSWER_WORDS ||= new Set(RIDDLES.flatMap((r) => r.a.flatMap(words)).filter((w) => w.length > 2 && !STOP.has(w)));
  const mine = new Set(accepted.flatMap(words));
  const foreign = new Set(toks.filter((t) => ANSWER_WORDS.has(t) && !mine.has(t)));
  if (foreign.size >= 2) return false;
  return accepted.some((a) => {
    const need = words(a).filter((w) => !STOP.has(w));
    return need.length > 0 && need.every((n) => toks.some((t) => near(t, n)));
  });
}

/** Situation check: 'all' when every keyword group is hit, 'some' for partial, or false. */
export function matchSituation(input, groups) {
  const text = ` ${words(input).join(' ')} `;
  const toks = words(input);
  const hit = groups.map((g) => g.some((k) => (k.includes(' ') ? text.includes(` ${k} `) || text.includes(` ${k}`) : toks.some((t) => t.startsWith(k) || (k.length >= 6 && lev(t, k) <= 1)))));
  if (hit.every(Boolean)) return 'all';
  return hit.some(Boolean) ? 'some' : false;
}

const PLAN = { riddles: [6, 0], situations: [0, 4], mixed: [4, 2] };
const REVEALS = { riddles: 4, situations: 6, mixed: 5 };

export function mount(el, ctx) {
  const { rng, params = {}, saved } = ctx;
  const variant = PLAN[ctx.variant] ? ctx.variant : 'mixed';
  const [nr, ns] = PLAN[variant];
  const st = saved?.ids ? saved : (() => {
    const ids = [...shuffle(rng, RIDDLES).slice(0, params.riddles ?? nr), ...shuffle(rng, SITUATIONS).slice(0, params.situations ?? ns)].map((x) => x.id);
    return { ids, solved: ids.map(() => 0), shown: ids.map(() => 0), tries: ids.map(() => 0), typed: ids.map(() => ''), left: params.reveals ?? REVEALS[variant] };
  })();
  const items = st.ids.map((id) => RIDDLES.find((x) => x.id === id) || SITUATIONS.find((x) => x.id === id));
  let finished = false;
  const status = h('p', { class: 'feedback' });
  const leftEl = h('span', { class: 'rd-left doc' });

  const cards = items.map((it, i) => {
    const situ = !!it.k;
    const input = h(situ ? 'textarea' : 'input', {
      class: 'rd-input', rows: situ ? 2 : null, autocomplete: 'off', spellcheck: 'false',
      'aria-label': `Answer ${i + 1}`, placeholder: situ ? 'Explain what happened' : 'Your answer',
    });
    input.value = st.typed[i] || '';
    input.addEventListener('input', () => { st.typed[i] = input.value; persist(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(i); } });
    const go = h('button', { class: 'btn btn--small rd-go', onclick: () => submit(i) }, 'Answer');
    const ask = h('button', { class: 'btn btn--small rd-ask', onclick: () => clue(i, true) }, situ ? 'Ask the lab a question' : 'Ask for a clue');
    const clues = h('ul', { class: 'rd-clues' });
    const note = h('p', { class: 'rd-note' });
    const card = h('article', { class: `rd-card${situ ? ' is-situation' : ''}` },
      h('header', { class: 'rd-head' }, h('span', { class: 'rd-n' }, String(i + 1)), h('span', { class: 'rd-kind' }, situ ? 'Situation' : 'Riddle')),
      h('p', { class: 'rd-q' }, it.q),
      clues,
      h('div', { class: 'rd-row' }, input, go),
      h('div', { class: 'rd-tools' }, ask),
      note);
    return { card, input, go, ask, clues, note, situ };
  });

  el.append(
    h('p', { class: 'game-rules' }, {
      riddles: 'Six riddles found in the victim\'s notebook. Type an answer and press Enter. Spelling slips are forgiven. Clues are limited, so spend them wisely.',
      situations: 'Four situations from old case files. Each has a simple explanation that makes everything fit. Write it in a few words; you need the key idea, not an essay. Asking the lab a yes or no question uses up a clue.',
      mixed: 'Riddles and situations from the victim\'s notebook. Riddles need a word or two; situations need the key idea that explains everything. Spelling slips are forgiven. Clues are limited.',
    }[variant]),
    h('div', { class: 'game-toolbar' }, leftEl),
    h('div', { class: 'rd-list' }, cards.map((c) => c.card)),
    status,
  );

  function persist() { ctx.onSave({ ...st }); }

  function cluesOf(i) {
    const it = items[i];
    if (it.k) return it.c;
    const a = it.a[0];
    return [...it.c, `${a.replace(/[a-z]/gi, '_ ').trim()}  (${a.replace(/[^a-z]/gi, '').length} letters, starting with ${a[0].toUpperCase()})`];
  }

  function render() {
    leftEl.textContent = `${st.left} ${st.left === 1 ? 'clue' : 'clues'} left for this page`;
    cards.forEach((c, i) => {
      const it = items[i];
      const done = st.solved[i];
      c.card.classList.toggle('is-solved', !!done);
      c.input.disabled = !!done;
      c.go.disabled = !!done;
      const all = cluesOf(i);
      c.ask.disabled = !!done || st.shown[i] >= all.length || st.left <= 0;
      c.ask.style.display = done ? 'none' : '';
      c.clues.innerHTML = '';
      all.slice(0, st.shown[i]).forEach((t) => c.clues.append(h('li', {}, t)));
      if (done) {
        c.note.textContent = `${done === 2 ? 'Revealed by the lab. ' : ''}${it.x}`;
        c.note.className = 'rd-note is-good';
        if (!it.k && !c.input.value) c.input.value = it.a[0];
      }
    });
    const n = st.solved.filter(Boolean).length;
    ctx.onProgress(n / items.length);
  }

  function submit(i) {
    if (st.solved[i]) return;
    const it = items[i];
    const v = cards[i].input.value.trim();
    if (!v) return;
    const res = it.k ? matchSituation(v, it.k) : matchRiddle(v, it.a) ? 'all' : false;
    const c = cards[i];
    if (res === 'all') {
      st.solved[i] = 1;
      sfx.good();
      status.textContent = '';
    } else {
      st.tries[i]++;
      sfx.bad();
      c.note.className = 'rd-note is-bad';
      c.note.textContent = res === 'some' ? 'You are onto part of it, but that does not explain everything yet.' : st.tries[i] >= 3 ? 'Still no. Read it again: every word in it is there for a reason.' : 'No, that is not it.';
    }
    persist(); render(); check();
    if (res === 'all') cards.find((x, k) => !st.solved[k])?.input.focus();
  }

  function clue(i, spend) {
    const all = cluesOf(i);
    if (st.solved[i] || st.shown[i] >= all.length) return false;
    if (spend) {
      if (st.left <= 0) return false;
      st.left--;
    }
    st.shown[i]++;
    sfx.click();
    persist(); render();
    return true;
  }

  function check() {
    if (finished) return;
    if (st.solved.every(Boolean)) {
      finished = true;
      status.textContent = variant === 'situations' ? 'Every file on the page makes sense now.' : 'Every riddle answered. The notebook gives up its last page.';
      status.className = 'feedback is-good';
      sfx.solve();
      ctx.onSolved();
    }
  }

  render();
  check();
  persist();

  return {
    hint() {
      if (finished) return null;
      const i = st.solved.findIndex((s) => !s);
      if (i < 0) return null;
      if (clue(i, false)) return `The lab added a clue to ${items[i].k ? 'situation' : 'riddle'} ${i + 1}.`;
      st.solved[i] = 2;
      persist(); render(); check();
      return `The lab gave away number ${i + 1}: ${items[i].x}`;
    },
    devSolve() {
      st.solved = st.solved.map((s) => s || 1);
      persist(); render(); check();
    },
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Answer the riddles and explain the strange situations.',
  steps: [
    'Read the riddle slowly. Every word is a clue.',
    'Type a short answer and tap Answer.',
    'Small spelling mistakes are fine.',
    'A situation needs the key idea in a few words, not a long story.',
    'Stuck? Tap Ask for a clue. Clues are limited, so choose well.',
  ],
  example: {
    caption: 'A towel gets wetter as it dries you. Type "towel" and tap Answer.',
    render(el) {
      let s = rect(8, 8, 364, 128, { fill: '#fbf7ec', stroke: C.line, sw: 1.5, rx: 4 });
      s += `<circle cx="28" cy="30" r="12" fill="${C.ink}"/>` + text(28, 35, '1', { size: 13, weight: 700, fill: C.paper }) + text(48, 35, 'Riddle', { size: 13, weight: 700, anchor: 'start', fill: C.soft });
      s += text(24, 64, 'What gets wetter the more it dries?', { size: 16, anchor: 'start', font: 'doc' });
      s += rect(24, 82, 200, 38, { fill: '#fff', stroke: C.soft, sw: 1.5, rx: 3 }) + text(36, 107, 'towel', { size: 17, anchor: 'start', fill: C.blue, weight: 600 });
      s += chip(236, 82, 90, 38, 'Answer', { fill: C.ink, color: C.paper, stroke: C.ink }) + badge(346, 101, true, 13);
      put(el, svg(380, 144, s, 'A riddle answered with the word towel'));
    },
  },
  tips: ['The Magnifier adds a clue for free, without using your clue count.'],
  controls: { touch: 'Tap the box, type, then tap Answer.', keys: 'Type and press Enter.' },
};
