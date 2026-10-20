// Lie detector calibration: a Stroop test. Name the ink, not the word (or the reverse), faster every round.
import { h } from '../core/ui.js';
import { pick, shuffle, mulberry32 } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'colorword', name: 'Lie Detector', category: 'Speed' };
export const demo = { variant: 'stroop', params: { difficulty: 'hard' } };

const COLOURS = [
  { id: 'red', word: 'RED', hex: '#b3202a', key: 'r' },
  { id: 'blue', word: 'BLUE', hex: '#2a4a8a', key: 'b' },
  { id: 'green', word: 'GREEN', hex: '#2f7a4f', key: 'g' },
  { id: 'black', word: 'BLACK', hex: '#1d1a16', key: 'k' },
  { id: 'purple', word: 'PURPLE', hex: '#74409a', key: 'p' },
];
const SETTINGS = {
  easy: { rounds: [2.6, 2.2, 1.9, 1.6], trials: 10, need: 8, colours: 4 },
  medium: { rounds: [2.4, 2.0, 1.7, 1.45, 1.25], trials: 12, need: 10, colours: 4 },
  hard: { rounds: [2.2, 1.8, 1.5, 1.25, 1.05], trials: 12, need: 10, colours: 5 },
  expert: { rounds: [2.0, 1.6, 1.3, 1.1, 0.95, 0.85], trials: 14, need: 12, colours: 5 },
};

export function makeTrials(r, n, colours, variant) {
  const out = [];
  let prev = null;
  for (let i = 0; i < n; i++) {
    let word, ink;
    do {
      word = pick(r, colours);
      ink = r() < 0.8 ? pick(r, colours.filter((c) => c !== word)) : word;
    } while (prev && prev.word === word && prev.ink === ink);
    const mode = variant === 'switch' ? (r() < 0.5 ? 'ink' : 'word') : variant === 'reverse' ? 'word' : 'ink';
    out.push({ word: word.id, ink: ink.id, mode });
    prev = { word, ink };
  }
  return out;
}

export function mount(el, ctx) {
  const { rng, params = {}, saved } = ctx;
  const variant = ['stroop', 'reverse', 'switch'].includes(ctx.variant) ? ctx.variant : 'stroop';
  const cfg = SETTINGS[params.difficulty || 'hard'] || SETTINGS.hard;
  const colours = COLOURS.slice(0, cfg.colours);
  const st = saved?.seed != null ? saved : { seed: Math.floor(rng() * 2 ** 31), round: 0, tries: 0, eased: 0, slow: 0, solved: false };
  const need = () => Math.max(cfg.trials - 4, cfg.need - st.eased);
  let finished = !!st.solved;
  let live = null; // { trials, i, hits, t0, limit, raf, timer }

  const status = h('p', { class: 'feedback' });
  const pips = h('div', { class: 'cwd-pips', 'aria-hidden': 'true' });
  const needle = h('div', { class: 'cwd-needle' });
  const gauge = h('div', { class: 'cwd-gauge', 'aria-hidden': 'true' }, needle, h('span', { class: 'cwd-gl' }, 'calm'), h('span', { class: 'cwd-gr' }, 'stress'));
  const cue = h('div', { class: 'cwd-cue' });
  const word = h('div', { class: 'cwd-word', 'aria-live': 'assertive' });
  const tbar = h('div', { class: 'cwd-tbar' }, h('i', {}));
  const stage = h('div', { class: 'cwd-stage' }, cue, word, tbar);
  const tally = h('p', { class: 'cwd-tally doc' });
  // reverse mode answers with unlabelled swatches; the others answer with colour names
  const btnRow = h('div', { class: 'cwd-btns' }, colours.map((c, i) => {
    const b = h('button', {
      class: `cwd-btn${variant === 'reverse' ? ' is-swatch' : ''}`, 'aria-label': c.word.toLowerCase(),
      onpointerdown: (e) => { e.preventDefault(); answer(c.id); },
    },
    h('span', { class: 'cwd-sw', style: { background: c.hex } }),
    variant === 'reverse' ? null : h('span', { class: 'cwd-lab' }, c.word.toLowerCase()),
    h('span', { class: 'cwd-k' }, String(i + 1)));
    return b;
  }));
  const startBtn = h('button', { class: 'btn btn--primary', onclick: () => startRound() }, 'Start round 1');
  const between = h('div', { class: 'cwd-between' });

  el.append(
    h('p', { class: 'game-rules' }, {
      stroop: `Calibrate the polygraph. A colour word flashes up printed in a coloured ink: answer with the ink colour, never the word. Use the buttons or keys 1 to ${colours.length}. Each round is faster; get ${cfg.need} of ${cfg.trials} right to pass it.`,
      reverse: `Reverse calibration. A colour word flashes up in a misleading ink: answer with what the word says, using the plain colour patches. Keys 1 to ${colours.length} work too. Each round is faster; get ${cfg.need} of ${cfg.trials} right to pass it.`,
      switch: `Switching calibration. Above each word the needle says INK or WORD: answer the ink colour or the word's meaning to match. Keys 1 to ${colours.length} work too. Each round is faster; get ${cfg.need} of ${cfg.trials} right to pass it.`,
    }[variant]),
    h('div', { class: 'cwd-head' }, pips, gauge),
    stage,
    tally,
    btnRow,
    between,
    status,
  );

  function persist() { ctx.onSave({ ...st }); }
  const rounds = cfg.rounds.length;

  function renderPips() {
    pips.innerHTML = '';
    for (let i = 0; i < rounds; i++) pips.append(h('i', { class: i < st.round ? 'is-done' : i === st.round && !finished ? 'is-cur' : '' }, String(i + 1)));
  }

  function idle(msg) {
    word.textContent = finished ? 'CALIBRATED' : 'READY';
    word.style.color = 'var(--ink)';
    cue.textContent = '';
    tbar.firstChild.style.width = '0%';
    btnRow.classList.add('is-idle');
    between.innerHTML = '';
    if (!finished) {
      startBtn.textContent = st.tries ? `Retry round ${st.round + 1}` : `Start round ${st.round + 1}`;
      between.append(h('p', { class: 'doc' }, msg || `Round ${st.round + 1} of ${rounds}: ${cfg.rounds[st.round].toFixed(2)} seconds per word, ${need()} of ${cfg.trials} to pass.`), startBtn);
    }
    renderPips();
    setNeedle(finished ? 0.15 : 0.5);
  }

  function setNeedle(v) { needle.style.transform = `rotate(${-60 + v * 120}deg)`; }

  function startRound() {
    if (finished) return;
    st.tries++;
    persist();
    const r = mulberry32((st.seed + st.round * 7907 + st.tries * 131) >>> 0);
    live = { trials: makeTrials(r, cfg.trials, colours, variant), i: -1, hits: 0, limit: cfg.rounds[st.round] * (1 + 0.25 * st.slow) };
    between.innerHTML = '';
    btnRow.classList.remove('is-idle');
    status.textContent = ''; status.className = 'feedback';
    nextTrial();
  }

  function nextTrial() {
    live.i++;
    tally.textContent = `${live.hits} right, ${live.i - live.hits} missed`;
    if (live.i >= live.trials.length) { endRound(); return; }
    const t = live.trials[live.i];
    const w = colours.find((c) => c.id === t.word), ink = colours.find((c) => c.id === t.ink);
    word.textContent = w.word;
    word.style.color = ink.hex;
    cue.textContent = variant === 'switch' ? (t.mode === 'ink' ? 'INK' : 'WORD') : '';
    cue.className = `cwd-cue${t.mode === 'word' ? ' is-word' : ''}`;
    live.t0 = performance.now();
    const step = () => {
      if (!live) return;
      const el2 = (performance.now() - live.t0) / 1000;
      tbar.firstChild.style.width = `${Math.max(0, 1 - el2 / live.limit) * 100}%`;
      if (el2 >= live.limit) { miss(true); return; }
      live.raf = requestAnimationFrame(step);
    };
    cancelAnimationFrame(live.raf);
    live.raf = requestAnimationFrame(step);
    // a timer backs up the animation frame, which may be throttled
    clearTimeout(live.timer);
    live.timer = setTimeout(() => { if (live && performance.now() - live.t0 >= live.limit * 1000 - 5) miss(true); }, live.limit * 1000 + 30);
  }

  function answer(id) {
    if (!live || live.i < 0 || live.i >= live.trials.length) return;
    const t = live.trials[live.i];
    const want = t.mode === 'ink' ? t.ink : t.word;
    if (id === want) {
      live.hits++;
      sfx.key();
      flash('is-hit');
      setNeedle(Math.max(0.05, 0.5 - live.hits / (live.i + 1) * 0.4));
      advance();
    } else miss(false);
  }

  function miss(timeout) {
    if (!live) return;
    sfx.bad();
    flash('is-miss');
    setNeedle(0.85);
    status.textContent = timeout ? 'Too slow.' : 'Wrong colour.';
    status.className = 'feedback is-bad';
    advance();
  }

  function advance() {
    cancelAnimationFrame(live.raf);
    clearTimeout(live.timer);
    word.textContent = '';
    const l = live;
    setTimeout(() => { if (live === l) nextTrial(); }, 220);
  }

  function flash(cls) {
    stage.classList.remove('is-hit', 'is-miss');
    void stage.offsetWidth;
    stage.classList.add(cls);
  }

  function endRound() {
    const hits = live.hits;
    cancelAnimationFrame(live.raf);
    clearTimeout(live.timer);
    live = null;
    if (hits >= need()) {
      st.round++;
      st.tries = 0;
      st.slow = 0;
      sfx.good();
      ctx.onProgress(st.round / rounds);
      if (st.round >= rounds) { win(); return; }
      status.textContent = `Round passed with ${hits} of ${cfg.trials}. The needle settles.`;
      status.className = 'feedback is-good';
      persist();
      idle();
    } else {
      status.textContent = `${hits} of ${cfg.trials}. The needle jumped: ${need()} needed. Breathe, then go again.`;
      status.className = 'feedback is-bad';
      persist();
      idle();
    }
  }

  function win() {
    st.round = rounds;
    st.solved = true;
    persist();
    if (finished) return;
    finished = true;
    status.textContent = 'Calibrated. The machine trusts you now, which is more than the suspect can say.';
    status.className = 'feedback is-good';
    sfx.solve();
    idle();
    ctx.onProgress(1);
    ctx.onSolved();
  }

  const onVis = () => {
    if (document.hidden && live) {
      cancelAnimationFrame(live.raf);
      clearTimeout(live.timer);
      live = null;
      st.tries = Math.max(0, st.tries - 1);
      status.textContent = 'Round paused while you were away. Start it again when ready.';
      status.className = 'feedback';
      idle();
    }
  };
  const onKey = (e) => {
    if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!live) {
      if ((e.key === 'Enter' || e.key === ' ') && !finished && e.target.tagName !== 'BUTTON') { e.preventDefault(); startRound(); }
      return;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= colours.length) { e.preventDefault(); answer(colours[n - 1].id); return; }
    const c = colours.find((x) => x.key === e.key.toLowerCase());
    if (c) { e.preventDefault(); answer(c.id); }
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', onVis);
  idle();
  ctx.onProgress(Math.min(1, st.round / rounds));
  persist();
  if (finished) { status.textContent = 'Calibrated.'; status.className = 'feedback is-good'; ctx.onSolved(); }

  return {
    destroy() {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
      if (live) { cancelAnimationFrame(live.raf); clearTimeout(live.timer); live = null; }
    },
    hint() {
      if (finished) return null;
      if (live) {
        live.limit *= 1.25;
        st.slow++;
        persist();
        return 'The lab slowed the needle: a quarter more time per word for this round.';
      }
      if (need() <= cfg.trials - 4) {
        st.slow++;
        persist();
        idle();
        return 'The lab slowed the needle: the next round gives a quarter more time per word.';
      }
      st.eased++;
      persist();
      idle();
      return `The lab loosened the tolerance: ${need()} of ${cfg.trials} now passes a round.`;
    },
    devSolve() {
      if (live) { cancelAnimationFrame(live.raf); clearTimeout(live.timer); live = null; }
      win();
    },
  };
}
