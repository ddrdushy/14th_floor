// Receipt check: a timed arithmetic gauntlet through a suspect's receipts, or ringgit change-making at the counter.
import { h } from '../core/ui.js';
import { pick, randInt, shuffle, mulberry32 } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'quickmath', name: 'Receipt Check', category: 'Speed' };
export const demo = { variant: 'receipts', params: { difficulty: 'hard' } };

const LEVELS = { easy: { target: 8, seconds: 180 }, medium: { target: 10, seconds: 180 }, hard: { target: 12, seconds: 180 }, expert: { target: 15, seconds: 180 } };

const ITEMS = [
  ['Teh tarik', 250], ['Kopi O', 180], ['Roti canai', 150], ['Nasi lemak', 450], ['Mee goreng', 600], ['Milo ais', 320],
  ['Char kway teow', 850], ['Satay, 10 sticks', 900], ['Cendol', 420], ['Parking, per hour', 300], ['Cigarettes', 1700],
  ['Newspaper', 150], ['Prepaid top-up', 1000], ['Umbrella', 1590], ['Torchlight batteries', 790], ['Bus fare', 270],
  ['Nasi kandar', 1150], ['Kaya toast set', 690], ['Ice lemon tea', 380], ['Roti telur', 280], ['Bottled water', 120],
  ['Lighter', 220], ['Phone charger', 2490], ['Taxi fare', 1840], ['Laundry, per kilo', 650], ['Duct tape', 590],
];

const rm = (sen) => `RM${(sen / 100).toFixed(2)}`;
const round5 = (sen) => {
  const r = sen % 5;
  // Malaysian cash rounding: 1-2 sen down, 3-4 up, 6-7 down, 8-9 up (to the nearest 5 sen)
  return r <= 2 ? sen - r : sen + (5 - r);
};
const DENOMS = [10000, 5000, 2000, 1000, 500, 100, 50, 20, 10, 5];
export function fewestPieces(sen) {
  let n = 0, left = sen;
  for (const d of DENOMS) { n += Math.floor(left / d); left %= d; }
  return left === 0 ? n : -1;
}

/** One problem: { lines: [[label, text]], ask, answer (number), unit: 'RM' | '' } */
export function makeProblem(r, variant, k) {
  const lvl = Math.min(4, Math.floor(k / 3));
  if (variant === 'currency') {
    const type = pick(r, lvl < 1 ? ['change', 'change', 'split'] : lvl < 2 ? ['change', 'round', 'split', 'pieces'] : ['round', 'pieces', 'split', 'fx', 'roundpieces']);
    if (type === 'change') {
      const bill = randInt(r, 300, lvl < 1 ? 4000 : 9000);
      const billR = bill - (bill % 5);
      const paid = [1000, 2000, 5000, 10000].find((p) => p > billR);
      return { title: 'Cash sale', lines: [['Bill', rm(billR)], ['Paid', rm(paid)]], ask: 'Change due, in ringgit?', answer: (paid - billR) / 100, unit: 'RM' };
    }
    if (type === 'round') {
      let bill;
      do bill = randInt(r, 500, 9800); while (bill % 5 === 0);
      const paid = [2000, 5000, 10000].find((p) => p > bill + 5);
      return { title: 'Cash sale, rounded to 5 sen', lines: [['Bill', rm(bill)], ['Paid', rm(paid)]], ask: 'Change due after cash rounding?', answer: (paid - round5(bill)) / 100, unit: 'RM' };
    }
    if (type === 'split') {
      const n = pick(r, [2, 3, 4, 5, 6]);
      const each = randInt(r, 400, lvl < 2 ? 3000 : 6000);
      const eachR = each - (each % 10);
      return { title: 'Dinner bill, split evenly', lines: [['Total', rm(eachR * n)], ['People', String(n)]], ask: 'Each person pays, in ringgit?', answer: eachR / 100, unit: 'RM' };
    }
    if (type === 'pieces' || type === 'roundpieces') {
      let change;
      do change = randInt(r, 105, lvl < 3 ? 4000 : 9900); while (change % 5 !== 0);
      if (type === 'roundpieces') {
        let bill;
        do bill = randInt(r, 500, 4800); while (bill % 5 === 0);
        const paid = 5000;
        const ch = paid - round5(bill);
        return { title: 'Cash sale, rounded to 5 sen', lines: [['Bill', rm(bill)], ['Paid', rm(paid)]], ask: 'Fewest notes and coins for the change?', answer: fewestPieces(ch), unit: '' };
      }
      return { title: 'Change to hand back', lines: [['Change', rm(change)]], ask: 'Fewest notes and coins to make it?', answer: fewestPieces(change), unit: '' };
    }
    // fx
    const [cur, rate] = pick(r, [['USD', 440], ['SGD', 340], ['GBP', 560], ['EUR', 480], ['AUD', 290]]);
    const amt = pick(r, [5, 10, 15, 20, 25, 30, 40, 50, 60, 80]);
    return { title: 'Money changer board', lines: [[`1 ${cur} buys`, rm(rate)], ['Customer brings', `${amt} ${cur}`]], ask: 'Worth how many ringgit?', answer: (amt * rate) / 100, unit: 'RM' };
  }
  // receipts
  const nLines = lvl < 1 ? 2 : lvl < 3 ? 3 : 4;
  const picks = shuffle(r, ITEMS).slice(0, nLines);
  const lines = picks.map(([name, p]) => [name, randInt(r, 1, lvl < 3 ? 3 : 4), p]);
  const sub = lines.reduce((s, [, q, p]) => s + q * p, 0);
  const shown = lines.map(([name, q, p]) => [`${q} x ${name}`, `@ ${rm(p)}`]);
  const type = pick(r, lvl < 1 ? ['total'] : lvl < 2 ? ['total', 'over'] : ['total', 'over', 'service', 'over']);
  if (type === 'total') return { title: 'Receipt', lines: shown, ask: 'What should the total be?', answer: sub / 100, unit: 'RM' };
  if (type === 'service') {
    // every price is a whole number of 10 sen, so ten per cent lands on an exact sen
    const few = lines.slice(0, 2);
    const s2 = few.reduce((s, [, q, p]) => s + q * p, 0);
    return { title: 'Restaurant bill', lines: [...shown.slice(0, 2), ['Service charge', '10%']], ask: 'Total with the service charge?', answer: Math.round((s2 * 11) / 10) / 100, unit: 'RM' };
  }
  const over = pick(r, [50, 100, 150, 200, 250, 300, 500, 1000, 120, 380]);
  return { title: 'Receipt', lines: [...shown, ['Printed total', rm(sub + over)]], ask: 'Overcharged by how much?', answer: over / 100, unit: 'RM' };
}

export function mount(el, ctx) {
  const { rng, params = {}, saved } = ctx;
  const variant = ctx.variant === 'currency' ? 'currency' : 'receipts';
  const base = LEVELS[params.difficulty || 'hard'] || LEVELS.hard;
  const fullTarget = params.target || base.target;
  const seconds = params.seconds || base.seconds;
  const st = saved?.seed != null ? saved : { seed: Math.floor(rng() * 2 ** 31), best: 0, runs: 0, eased: 0, solved: false };
  const target = () => Math.max(Math.ceil(fullTarget * 0.6), fullTarget - st.eased);
  let run = null; // { r, k, score, left, problem, entry, timer, last }
  let finished = !!st.solved;

  const status = h('p', { class: 'feedback' });
  const panel = h('div', { class: 'qm-panel' });
  el.append(
    h('p', { class: 'game-rules' }, variant === 'currency'
      ? `You are on the counter at a money changer in Jalan Masjid India. Answer ${fullTarget} questions about ringgit change before the clock runs out. Notes: RM100, 50, 20, 10, 5, 1. Coins: 50, 20, 10 and 5 sen. Cash totals round to the nearest 5 sen. A wrong answer costs 5 seconds.`
      : `A shoebox of the suspect's receipts. Check them fast: reach ${fullTarget} correct answers before the clock runs out. Answers are in ringgit, like 12.40. A wrong answer costs 5 seconds; skipping costs 3.`),
    panel,
    status,
  );

  function persist() { ctx.onSave({ ...st }); }

  function intro(msg) {
    panel.innerHTML = '';
    const best = st.best ? `Best so far: ${st.best} of ${target()}.` : 'No shift on record yet.';
    panel.append(h('div', { class: 'qm-intro' },
      h('p', { class: 'qm-big' }, finished ? (variant === 'currency' ? 'The till balances.' : 'Receipts reconciled.') : msg || `Target: ${target()} correct in ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}.`),
      h('p', { class: 'doc' }, best),
      finished ? null : h('button', { class: 'btn btn--primary', onclick: start }, st.runs ? 'Try again' : 'Start the clock')));
  }

  function start() {
    st.runs++;
    persist();
    run = { r: mulberry32((st.seed + st.runs * 977) >>> 0), k: 0, score: 0, left: seconds, entry: '', last: performance.now() };
    status.textContent = ''; status.className = 'feedback';
    build();
    next();
    run.timer = setInterval(tick, 200);
  }

  let els = {};
  function build() {
    panel.innerHTML = '';
    const bar = h('div', { class: 'qm-bar' }, h('i', {}));
    const score = h('span', { class: 'qm-score' });
    const clock = h('span', { class: 'qm-clock' });
    const card = h('div', { class: 'qm-receipt' });
    const answer = h('div', { class: 'qm-answer', 'aria-live': 'polite' });
    const keys = h('div', { class: 'qm-keys' },
      ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'].map((k) => h('button', { class: 'btn qm-key', onpointerdown: (e) => { e.preventDefault(); press(k); } }, k)),
      h('button', { class: 'btn qm-key qm-skip', onpointerdown: (e) => { e.preventDefault(); skip(); } }, 'Skip'),
      h('button', { class: 'btn btn--primary qm-key qm-ok', onpointerdown: (e) => { e.preventDefault(); submit(); } }, 'Enter'));
    panel.append(h('div', { class: 'qm-top' }, score, clock), bar, h('div', { class: 'qm-play' }, card, h('div', { class: 'qm-input' }, answer, keys)));
    els = { bar, score, clock, card, answer };
  }

  function next() {
    run.problem = makeProblem(run.r, variant, run.k);
    run.entry = '';
    const p = run.problem;
    els.card.innerHTML = '';
    els.card.append(h('p', { class: 'qm-title' }, p.title),
      h('table', {}, p.lines.map(([a, b]) => h('tr', {}, h('td', {}, a), h('td', {}, b)))),
      h('p', { class: 'qm-ask' }, p.ask));
    draw();
  }

  function draw() {
    if (!run) return;
    const t = Math.max(0, run.left);
    els.clock.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    els.clock.classList.toggle('is-low', t < 20);
    els.score.textContent = `${run.score} of ${target()}`;
    els.bar.firstChild.style.width = `${(t / seconds) * 100}%`;
    els.answer.textContent = `${run.problem.unit ? 'RM ' : ''}${run.entry || ''}`;
    els.answer.classList.toggle('is-empty', !run.entry);
  }

  function tick() {
    const now = performance.now();
    const dt = (now - run.last) / 1000;
    run.last = now;
    if (document.hidden) return;
    run.left -= dt;
    if (run.left <= 0) end();
    else draw();
  }

  function press(k) {
    if (!run) return;
    sfx.key();
    if (k === '⌫') run.entry = run.entry.slice(0, -1);
    else if (k === '.') { if (!run.entry.includes('.')) run.entry = (run.entry || '0') + '.'; }
    else if (run.entry.length < 8) {
      const dot = run.entry.indexOf('.');
      if (dot < 0 || run.entry.length - dot <= 2) run.entry += k;
    }
    draw();
    // accept as soon as the typed value is right
    if (run.entry && !run.entry.endsWith('.') && Math.abs(Number(run.entry) - run.problem.answer) < 0.001) correct();
  }

  function correct() {
    sfx.good();
    run.score++;
    run.k++;
    els.card.classList.remove('is-bad');
    flash('is-good');
    if (run.score >= target()) { end(); return; }
    next();
  }
  function submit() {
    if (!run || !run.entry) return;
    if (Math.abs(Number(run.entry) - run.problem.answer) < 0.001) { correct(); return; }
    sfx.bad();
    run.left -= 5;
    status.textContent = `Not ${run.problem.unit ? 'RM' : ''}${run.entry}. It was ${run.problem.unit ? 'RM' + run.problem.answer.toFixed(2) : run.problem.answer}. Five seconds lost.`;
    status.className = 'feedback is-bad';
    flash('is-bad');
    run.k++;
    if (run.left <= 0) end(); else next();
  }
  function skip() {
    if (!run) return;
    run.left -= 3;
    run.k++;
    sfx.click();
    if (run.left <= 0) end(); else next();
  }
  function flash(cls) {
    els.card.classList.remove('is-good', 'is-bad');
    void els.card.offsetWidth;
    els.card.classList.add(cls);
  }

  function end() {
    if (!run) return;
    clearInterval(run.timer);
    const score = run.score;
    run = null;
    st.best = Math.max(st.best, score);
    if (score >= target()) win();
    else {
      sfx.bad();
      status.textContent = `Time. ${score} of ${target()} checked. The numbers are still hiding something.`;
      status.className = 'feedback is-bad';
      intro(`Shift over: ${score} of ${target()}.`);
    }
    ctx.onProgress(Math.min(1, st.best / target()));
    persist();
  }

  function win() {
    st.solved = true;
    persist();
    if (finished) { intro(); return; }
    finished = true;
    status.textContent = variant === 'currency' ? 'The till balances to the sen. The changer was skimming.' : 'Every receipt checked. One of them puts the suspect in Chow Kit at 2 a.m.';
    status.className = 'feedback is-good';
    sfx.solve();
    intro();
    ctx.onSolved();
  }

  const onKey = (e) => {
    if (!run || e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === '.' || e.key === ',') press('.');
    else if (e.key === 'Backspace') { e.preventDefault(); press('⌫'); }
    else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === ' ' || e.key === 'Tab') { e.preventDefault(); skip(); }
  };
  document.addEventListener('keydown', onKey);
  intro();
  ctx.onProgress(Math.min(1, st.best / target()));
  persist();
  if (finished) { status.textContent = variant === 'currency' ? 'The till balances.' : 'Receipts reconciled.'; status.className = 'feedback is-good'; ctx.onSolved(); }

  return {
    destroy() { document.removeEventListener('keydown', onKey); if (run) clearInterval(run.timer); },
    hint() {
      if (finished) return null;
      if (run) {
        run.left += 20;
        draw();
        return 'The lab bought you twenty more seconds on the clock.';
      }
      if (target() <= Math.ceil(fullTarget * 0.6)) return null;
      st.eased++;
      persist();
      intro();
      return `The lab pre-checked one receipt. The target is now ${target()}.`;
    },
    devSolve() {
      if (run) { clearInterval(run.timer); run = null; }
      st.best = Math.max(st.best, target());
      ctx.onProgress(1);
      win();
    },
  };
}
