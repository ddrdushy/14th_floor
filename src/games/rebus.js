// Rebus: picture-word sums. Pictures are read as words (or as they sound), letters are added,
// and a minus takes the first matching letters out. Typed answers, forgiving of small typos.
import { h } from '../core/ui.js';
import { shuffle } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { iconSvg } from './_icons_c.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';
import { icon as htIcon } from './_icons_c.js';

export const meta = { id: 'rebus', name: 'Picture Words', category: 'Lateral thinking' };
export const demo = { variant: 'mixed', params: { count: 10 } };

// tier 1: plain compounds, tier 2: read the picture by its sound, tier 3: minus operations.
// {icon} reads as the icon's name, {icon=WORD} reads as WORD.
const PUZZLES = [
  ['KEYBOARD', '{key} + BOARD', 1], ['SUNDAY', '{sun} + DAY', 1], ['CARPET', '{car} + PET', 1],
  ['HANDCUFFS', '{hand} + CUFFS', 1], ['FOOTPRINT', '{foot} + PRINT', 1], ['DOORBELL', '{door} + {bell}', 1],
  ['POCKETKNIFE', 'POCKET + {knife}', 1], ['BELLY', '{bell} + Y', 1], ['STARFISH', '{star} + {fish}', 1],
  ['EARTH', '{ear} + TH', 1], ['EARRING', '{ear} + {ring}', 1], ['PANCAKE', '{pan} + CAKE', 1],
  ['CUPBOARD', '{cup} + BOARD', 1], ['BATTLE', '{bat} + TLE', 1], ['WATCHMAN', '{watch} + MAN', 1],
  ['GUNPOWDER', '{gun} + POWDER', 1], ['KEYHOLE', '{key} + HOLE', 1], ['RINGLEADER', '{ring} + LEADER', 1],
  ['MOONLIGHT', '{moon} + LIGHT', 1], ['CLOCKWISE', '{clock} + WISE', 1], ['LOCKSMITH', '{lock} + SMITH', 1],
  ['PENKNIFE', '{pen} + {knife}', 1], ['KNIFEPOINT', '{knife} + POINT', 1], ['PHONEY', '{phone} + Y', 1],
  ['SUNGLASSES', '{sun} + {glass} + ES', 1], ['HANDSOME', '{hand} + SOME', 1], ['FISHHOOK', '{fish} + {hook}', 1],
  ['CATFISH', '{cat} + {fish}', 1], ['CARGO', '{car} + GO', 1], ['MOONSHINE', '{moon} + SHINE', 1],
  ['HANDGUN', '{hand} + {gun}', 1], ['DEADLOCK', 'DEAD + {lock}', 1], ['SPYGLASS', 'SPY + {glass}', 1],
  ['EYEWITNESS', '{eye} + WITNESS', 1],
  ['BELIEVE', '{bee=BE} + LIEVE', 2], ['IDEAL', '{eye=I} + DEAL', 2], ['ICON', '{eye=I} + CON', 2],
  ['TEAM', '{teacup=TEA} + M', 2], ['TEAPOT', '{teacup=TEA} + {pot}', 2], ['RAINBOW', '{cloud=RAIN} + {bow}', 2],
  ['TEACHER', '{teacup=TEA} + CHER', 2], ['BEHAVE', '{bee=BE} + HAVE', 2], ['RAINCOAT', '{cloud=RAIN} + COAT', 2],
  ['KINGPIN', 'K + {ring} - R + {pin}', 3], ['RUNAWAY', 'R + {gun} - G + AWAY', 3], ['BETRAY', '{bee} - E + TRAY', 3],
  ['FLOOR', 'FL + {door} - D', 3], ['CATCH', 'C + {watch} - W', 3], ['LOOT', 'L + {foot} - F', 3],
  ['SHELL', 'SH + {bell} - B', 3], ['COAT', 'C + {boat} - B', 3], ['BEACH', '{bee} - E + ACH', 3],
  ['TIGER', '{tie} - E + GER', 3], ['CROOK', 'CR + {hook} - H', 3], ['GUN', 'G + {sun} - S', 3],
];

const ICON_WORD = { teacup: 'TEACUP', cloud: 'RAIN CLOUD', glass: 'GLASS', pin: 'PIN' };

export function parse(expr) {
  const out = [];
  let op = '+';
  for (const tok of expr.split(' ')) {
    if (tok === '+' || tok === '-') { op = tok; continue; }
    const m = tok.match(/^\{(\w+)(?:=(\w+))?\}$/);
    if (m) out.push({ op, icon: m[1], read: (m[2] || m[1]).toUpperCase() });
    else out.push({ op, text: tok });
  }
  return out;
}

export function evaluate(tokens) {
  let s = '';
  for (const t of tokens) {
    const w = t.icon ? t.read : t.text;
    if (t.op === '+') s += w;
    else {
      const i = s.indexOf(w);
      if (i >= 0) s = s.slice(0, i) + s.slice(i + w.length);
    }
  }
  return s;
}

const article = (w) => `${/^[aeiou]/.test(w) ? 'an' : 'a'} ${w}`;
const norm = (s) => s.toUpperCase().replace(/[^A-Z]/g, '');

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
}

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const count = params.count || 10;
  const mix = params.mix || [0.4, 0.3, 0.3];
  const byTier = [1, 2, 3].map((t) => shuffle(rng, PUZZLES.filter((p) => p[2] === t)));
  const want = [Math.round(count * mix[0]), Math.round(count * mix[1])];
  want.push(Math.max(0, count - want[0] - want[1]));
  const chosen = [];
  want.forEach((n, t) => chosen.push(...byTier[t].slice(0, n)));
  // plain compounds first, sound readings next, minus sums last
  const set = chosen.map(([answer, expr, tier]) => ({ answer, expr, tier, tokens: parse(expr) }));

  const solved = new Set(saved?.solved || []);
  const hints = saved?.hints || {};
  let cur = saved?.cur ?? 0;
  let wrong = saved?.wrong || 0;
  let done = false;

  const status = h('p', { class: 'feedback' });
  const dots = h('div', { class: 'rb-dots', role: 'tablist', 'aria-label': 'Puzzles' });
  const row = h('div', { class: 'rb-row', role: 'img' });
  const enumEl = h('p', { class: 'rb-enum doc' });
  const hintEl = h('p', { class: 'rb-hint doc' });
  const input = h('input', { class: 'text-input rb-input', type: 'text', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'Your answer' });
  const checkBtn = h('button', { class: 'btn btn--primary', type: 'submit' }, 'Check');
  const form = h('form', { class: 'rb-form', onsubmit: (e) => { e.preventDefault(); check(); } }, input, checkBtn);
  const prev = h('button', { class: 'btn btn--small', onclick: () => go(cur - 1), 'aria-label': 'Previous puzzle' }, 'Previous');
  const next = h('button', { class: 'btn btn--small', onclick: () => go(cur + 1), 'aria-label': 'Next puzzle' }, 'Next');
  const counter = h('span', { class: 'doc rb-count' });

  el.append(
    h('p', { class: 'game-rules' }, 'Read each picture as a word, or by how it sounds, then do the sum. A plus adds letters on the end; a minus takes out the first matching letters. Solve every card on the board.'),
    dots,
    h('div', { class: 'rb-card' }, row, enumEl, form, hintEl),
    h('div', { class: 'game-toolbar' }, prev, next, counter),
    status,
  );

  function persist() { ctx.onSave({ solved: [...solved], hints, cur, wrong }); }

  function tile(t, i) {
    const parts = [];
    if (i > 0) parts.push(h('span', { class: 'rb-op', 'aria-label': t.op === '+' ? 'plus' : 'minus' }, t.op === '+' ? '+' : '−'));
    if (t.icon) {
      const s = h('span', { class: 'rb-pic' });
      s.innerHTML = iconSvg(t.icon, { size: 64 });
      parts.push(s);
    } else parts.push(h('span', { class: 'rb-text' }, t.text));
    return parts;
  }

  function render() {
    const p = set[cur];
    dots.innerHTML = '';
    set.forEach((q, i) => dots.append(h('button', {
      class: `rb-dot${solved.has(i) ? ' is-solved' : ''}${i === cur ? ' is-cur' : ''}`,
      role: 'tab', 'aria-selected': String(i === cur), 'aria-label': `Puzzle ${i + 1}${solved.has(i) ? ', solved' : ''}`,
      onclick: () => go(i),
    }, String(i + 1))));
    row.innerHTML = '';
    p.tokens.forEach((t, i) => row.append(...tile(t, i)));
    row.setAttribute('aria-label', p.tokens.map((t, i) => `${i ? (t.op === '+' ? 'plus ' : 'minus ') : ''}${t.icon ? `a picture of ${article((ICON_WORD[t.icon] || t.icon).toLowerCase())}` : `the letters ${t.text.split('').join(' ')}`}`).join(', '));
    enumEl.textContent = `(${p.answer.length} letters)`;
    const isSolved = solved.has(cur);
    input.value = isSolved ? p.answer : '';
    input.disabled = isSolved;
    checkBtn.disabled = isSolved;
    row.parentElement.classList.toggle('is-solved', isSolved);
    hintEl.textContent = hintText(cur);
    prev.disabled = cur === 0;
    next.disabled = cur === set.length - 1;
    counter.textContent = `${solved.size} of ${set.length} solved · ${wrong} wrong ${wrong === 1 ? 'guess' : 'guesses'}`;
    ctx.onProgress(solved.size / set.length);
  }

  function hintText(i) {
    const lv = hints[i] || 0;
    const p = set[i];
    const out = [];
    if (lv >= 1) {
      const pics = p.tokens.filter((t) => t.icon);
      out.push(`Pictures: ${pics.map((t) => (ICON_WORD[t.icon] || t.icon).toLowerCase()).join(', ')}.`);
      if (p.tier === 2) out.push('Say it out loud.');
    }
    if (lv >= 2) out.push(`Starts with ${p.answer[0]}.`);
    if (lv >= 3) out.push(`Begins ${p.answer.slice(0, Math.ceil(p.answer.length / 2))}...`);
    return out.join(' ');
  }

  function go(i) {
    if (i < 0 || i >= set.length) return;
    cur = i;
    status.textContent = '';
    status.className = 'feedback';
    sfx.click();
    persist();
    render();
    if (!solved.has(cur)) input.focus({ preventScroll: true });
  }

  function markSolved(i) {
    solved.add(i);
    if (solved.size === set.length && !done) {
      done = true;
      status.textContent = 'Every card on the board reads clean. The note in the margin was never a shopping list.';
      status.className = 'feedback is-good';
      persist();
      render();
      ctx.onProgress(1);
      ctx.onSolved();
      return true;
    }
    return false;
  }

  function check() {
    const p = set[cur];
    const guess = norm(input.value);
    if (!guess || solved.has(cur)) return;
    const d = lev(guess, p.answer);
    if (guess === p.answer || (p.answer.length >= 7 && d <= 1)) {
      sfx.good();
      const finished = markSolved(cur);
      if (finished) return;
      status.textContent = guess === p.answer ? `${p.answer}. Correct.` : `Close enough: ${p.answer}.`;
      status.className = 'feedback is-good';
      persist();
      render();
      const nextOpen = set.findIndex((_, i) => i > cur && !solved.has(i));
      const any = nextOpen >= 0 ? nextOpen : set.findIndex((_, i) => !solved.has(i));
      if (any >= 0) setTimeout(() => { if (cur === set.indexOf(p)) go(any); }, 900);
    } else {
      wrong++;
      sfx.bad();
      status.textContent = d <= 2 ? 'Very close. Check your spelling.' : guess.length !== p.answer.length ? `Not that. The answer has ${p.answer.length} letters.` : 'Not that.';
      status.className = 'feedback is-bad';
      persist();
      render();
      input.value = '';
      input.focus({ preventScroll: true });
    }
  }

  render();
  return {
    hint() {
      let i = solved.has(cur) ? set.findIndex((_, k) => !solved.has(k)) : cur;
      if (i < 0) return null;
      if ((hints[i] || 0) >= 3) {
        i = set.findIndex((_, k) => !solved.has(k) && (hints[k] || 0) < 3);
        if (i < 0) return null;
      }
      hints[i] = (hints[i] || 0) + 1;
      if (i !== cur) cur = i;
      persist();
      render();
      return `Card ${i + 1}: ${hintText(i)}`;
    },
    devSolve() {
      set.forEach((_, i) => solved.add(i));
      solved.delete(set.length - 1);
      markSolved(set.length - 1);
    },
  };
}

// Sanity check used by tests: every puzzle sum must produce its answer.
export function selfTest() {
  return PUZZLES.filter(([a, e]) => evaluate(parse(e)) !== a).map(([a, e]) => `${a}: ${e} -> ${evaluate(parse(e))}`);
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Solve each picture sum to make a word.',
  steps: [
    'Say the name of each picture.',
    'Plus (+) joins the words or letters together.',
    'Minus (−) takes those letters out again.',
    'Some pictures go by sound: an eye can mean the letter I.',
    'Type the word, tap Check, and solve every card.',
  ],
  example: {
    caption: 'KEY + BOARD = KEYBOARD.  FL + DOOR − D = FLOOR.',
    render(el) {
      const pic = (name, x, y) => `<g transform="translate(${x} ${y}) scale(1.25)">${htIcon(name)}</g>`;
      const word = (s2, x, y, col = C.ink) => text(x, y, s2, { size: 22, weight: 800, fill: col, font: 'display', anchor: 'start' });
      let s = pic('key', 36, 36) + text(36, 76, 'key', { size: 12, fill: C.soft }) + word('+', 70, 44) + word('BOARD', 92, 44) + word('=', 178, 44) + word('KEYBOARD', 202, 44, C.green);
      s += word('FL', 14, 124) + word('+', 46, 124) + pic('door', 90, 116) + text(90, 156, 'door', { size: 12, fill: C.soft }) + word('−', 122, 124) + word('D', 146, 124) + word('=', 178, 124) + word('FLOOR', 202, 124, C.green);
      put(el, svg(380, 164, s, 'Picture sums: key plus board is keyboard; F L plus door minus D is floor'));
    },
  },
  tips: ['Say the sum out loud. It often helps.', 'The Magnifier names the pictures, then gives the first letters.'],
  controls: { touch: 'Tap the box, type, then tap Check.', keys: 'Type the word and press Enter.' },
};
