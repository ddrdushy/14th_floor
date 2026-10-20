// Safe cracker: guess the code; green = right digit right place, amber = right digit wrong place.
import { h } from '../core/ui.js';
import { mulberry32, randInt } from '../core/rng.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'safecracker', name: 'Safe Cracker', category: 'Code Breaking' };

function score(code, guess) {
  let green = 0, amber = 0;
  const cRest = [], gRest = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === guess[i]) green++;
    else { cRest.push(code[i]); gRest.push(guess[i]); }
  }
  for (const d of gRest) {
    const k = cRest.indexOf(d);
    if (k >= 0) { amber++; cRest.splice(k, 1); }
  }
  return { green, amber };
}

export function mount(el, ctx) {
  const { params, rng, saved } = ctx;
  const D = params.digits || 5;
  const T = params.tries || 12;
  let round = saved?.round || 0;
  const makeCode = (r) => {
    const rr = mulberry32(Math.floor(rng() * 1e9) + r * 7919);
    return Array.from({ length: D }, () => randInt(rr, 0, 9));
  };
  const seedBase = rng();
  let code = saved?.code || makeCode(0);
  let history = saved?.history || [];
  let told = saved?.told || []; // positions already revealed by the magnifier this round
  let current = Array(D).fill(null);
  let cursor = 0;
  const status = h('p', { class: 'feedback' });

  const dial = h('div', { class: 'sc-current' });
  const log = h('ol', { class: 'sc-log' });
  const keypad = h('div', { class: 'sc-keys' },
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => h('button', { class: 'btn', onclick: () => press(n) }, String(n))),
    h('button', { class: 'btn', onclick: back, 'aria-label': 'Delete digit' }, '⌫'),
    h('button', { class: 'btn btn--primary', onclick: submit }, 'Try'));
  const left = h('p', { class: 'doc sc-left' });
  el.append(
    h('p', { class: 'game-rules' }, `${D} digits, 0 to 9, digits may repeat. `, h('span', { class: 'sc-dot g' }), 'Green: right digit, right place. ', h('span', { class: 'sc-dot a' }), `Amber: right digit, wrong place. After ${T} wrong tries the safe locks and re-scrambles.`),
    h('div', { class: 'sc-layout' },
      h('div', { class: 'sc-safe' }, dial, keypad, left),
      h('div', {}, h('h3', { class: 'lg-h' }, 'Attempts'), log)),
    status,
  );

  function persist() { ctx.onSave({ code, history, round, told }); }

  function render() {
    dial.innerHTML = '';
    current.forEach((d, i) => dial.append(h('span', { class: `sc-digit${i === cursor ? ' is-cur' : ''}` }, d == null ? '·' : String(d))));
    log.innerHTML = '';
    history.forEach((g) => {
      const s = score(code, g);
      log.append(h('li', {}, h('span', { class: 'sc-guess' }, g.join(' ')),
        h('span', { class: 'sc-lights', 'aria-label': `${s.green} green, ${s.amber} amber` },
          Array.from({ length: s.green }, () => h('i', { class: 'g' })),
          Array.from({ length: s.amber }, () => h('i', { class: 'a' })),
          Array.from({ length: D - s.green - s.amber }, () => h('i', {})))));
    });
    left.textContent = `${T - history.length} tries before lockout`;
    const best = history.reduce((m, g) => Math.max(m, score(code, g).green), 0);
    ctx.onProgress(best / D);
  }

  function press(n) {
    current[cursor] = n;
    cursor = Math.min(D - 1, cursor + 1);
    sfx.key();
    render();
  }
  function back() {
    if (current[cursor] == null && cursor > 0) cursor--;
    current[cursor] = null;
    render();
  }
  function submit() {
    if (current.some((d) => d == null)) {
      status.textContent = `Enter all ${D} digits.`;
      status.className = 'feedback is-bad';
      return;
    }
    const g = current.slice();
    history.push(g);
    const s = score(code, g);
    current = Array(D).fill(null);
    cursor = 0;
    if (s.green === D) {
      sfx.solve();
      status.textContent = 'The bolts slide back. The safe is open.';
      status.className = 'feedback is-good';
      persist(); render();
      ctx.onSolved();
      return;
    }
    sfx.click();
    if (history.length >= T) {
      sfx.alarm();
      round++;
      code = makeCode(round + seedBase);
      history = [];
      told = [];
      status.textContent = 'Lockout. The safe re-scrambles its code. Start again, and think before each try.';
      status.className = 'feedback is-bad';
    } else status.textContent = '';
    persist();
    render();
  }

  const onKey = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (/^[0-9]$/.test(e.key)) press(Number(e.key));
    else if (e.key === 'Backspace') { e.preventDefault(); back(); }
    else if (e.key === 'Enter') { e.preventDefault(); submit(); } // stop a focused button from submitting twice
  };
  document.addEventListener('keydown', onKey);
  persist();
  render();
  return {
    destroy: () => document.removeEventListener('keydown', onKey),
    hint() {
      const open = Array.from({ length: D }, (_, i) => i).filter((i) => !told.includes(i));
      if (open.length <= 1) return null; // never give the whole combination away
      const pos = open[randInt(rng, 0, open.length - 1)];
      told.push(pos);
      persist();
      return `A stethoscope on the dial: position ${pos + 1} is ${code[pos]}.`;
    },
    devSolve() { current = code.slice(); submit(); },
  };
}
