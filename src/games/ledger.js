// Cooked Books: a company ledger where someone changed a few figures after the totals were printed.
// Every row and column that no longer adds up to its printed total gives the change away, but only
// to someone who does the sums: the adding-machine tape does them. Tap figures onto the tape, then
// tap a printed total to compare. Flag the changed figure; on harder levels, also type what it said.
// The generator guarantees one answer: each changed figure is the only one in its row and column,
// and no two were changed by the same amount (see ledger-logic.js, checked by a solver).
//
// params (all optional):
//   rows       3..7 accounts (default 4)
//   cols       3..6 months (default 4)
//   altered    1..3 figures changed (default 1; never more than rows or cols)
//   restore    true: after flagging, type the original figure too (default false)
//   currency   label for the money, e.g. 'RM' or 'LKR' (default 'RM')
//   rowLabels  [names] for the accounts (default: shell-company names)
//   colLabels  [names] for the columns (default: a run of months)
//   magnitude  'hundreds' | 'thousands' | 'lakhs' (default 'thousands'); 1,250,000 grouping
//   clue       story note shown above the ledger
import '../styles/games-d/ledger.css';
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, ring, tap, C } from '../core/howto-kit.js';
import { settings, generate, labels, fmt, parseAmount, offsets, ledgerSig } from './ledger-logic.js';

export const meta = { id: 'ledger', name: 'Cooked Books', category: 'Forensic accounting' };
export const demo = {
  params: {
    rows: 4, cols: 4, altered: 2, restore: true,
    clue: 'Practice ledger. In a case, a clue from the story is pinned here.',
  },
};

const K_ = (r, c) => `${r},${c}`;
const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mount(el, ctx) {
  const P = ctx.params || {};
  const S = settings(P);
  const L = generate(ctx.rng, P);
  const lab = labels(ctx.rng, P, S.R, S.C);
  const sig = ledgerSig(L);
  const { R } = S, CC = S.C;
  const cur = S.currency;
  const altAt = new Map(L.altered.map((a) => [K_(a.r, a.c), a]));

  // ---- state ----
  let mode = 'tape';
  let tape = []; // keys "r,c" in the order they were added
  let found = new Set(); // altered cells the player flagged
  let restored = new Set(); // altered cells whose first figure was typed in (restore levels)
  let wrong = new Set(); // cells flagged by mistake (checked, not altered)
  let checks = {}; // line key ('r2', 'c1', 'g') -> how far it was off when compared with a full tape
  let hintStage = {}; // altered key -> 1 (line shown) | 2 (cell shown)
  let hintLine = null; // 'r2' | 'c1'
  let hintCell = null; // 'r,c'
  let active = null; // altered key whose figure is being typed in
  let solved = false;
  let told = false;
  const timers = [];

  const validKey = (k) => typeof k === 'string' && /^\d+,\d+$/.test(k) && (() => { const [r, c] = k.split(',').map(Number); return r < R && c < CC; })();
  const sv = ctx.saved;
  if (sv && typeof sv === 'object' && sv.v === 1 && sv.sig === sig) {
    mode = sv.mode === 'flag' ? 'flag' : 'tape';
    tape = (Array.isArray(sv.tape) ? sv.tape : []).filter(validKey).filter((k, i, a) => a.indexOf(k) === i);
    found = new Set((Array.isArray(sv.found) ? sv.found : []).filter((k) => altAt.has(k)));
    restored = new Set((Array.isArray(sv.restored) ? sv.restored : []).filter((k) => found.has(k) && S.restore));
    wrong = new Set((Array.isArray(sv.wrong) ? sv.wrong : []).filter((k) => validKey(k) && !altAt.has(k)));
    if (sv.checks && typeof sv.checks === 'object') for (const [k, v] of Object.entries(sv.checks)) if (/^(r\d+|c\d+|g)$/.test(k) && Number.isFinite(v)) checks[k] = v;
    if (sv.hintStage && typeof sv.hintStage === 'object') for (const [k, v] of Object.entries(sv.hintStage)) if (altAt.has(k) && (v === 1 || v === 2)) hintStage[k] = v;
    hintLine = typeof sv.hintLine === 'string' && /^(r\d+|c\d+)$/.test(sv.hintLine) ? sv.hintLine : null;
    hintCell = altAt.has(sv.hintCell) ? sv.hintCell : null;
  }

  const fixed = (k) => found.has(k) && (!S.restore || restored.has(k));
  const value = (r, c) => { const k = K_(r, c); return fixed(k) ? altAt.get(k).orig : L.cells[r][c]; };
  const lineKeys = (line) => {
    if (line === 'g') { const out = []; for (let r = 0; r < R; r++) for (let c = 0; c < CC; c++) out.push(K_(r, c)); return out; }
    const n = Number(line.slice(1));
    return line[0] === 'r' ? Array.from({ length: CC }, (_, c) => K_(n, c)) : Array.from({ length: R }, (_, r) => K_(r, n));
  };
  const printed = (line) => (line === 'g' ? L.grand : line[0] === 'r' ? L.rowTotals[Number(line.slice(1))] : L.colTotals[Number(line.slice(1))]);
  const lineSum = (line) => lineKeys(line).reduce((a, k) => { const [r, c] = k.split(',').map(Number); return a + value(r, c); }, 0);
  const lineOff = (line) => lineSum(line) - printed(line);
  const lineName = (line) => (line === 'g' ? 'The grand total' : line[0] === 'r' ? lab.rows[Number(line.slice(1))] : `The ${lab.cols[Number(line.slice(1))]} column`);
  const done = (a) => fixed(K_(a.r, a.c));
  const isSolved = () => L.altered.every(done);
  const money = (n) => `${cur} ${fmt(n)}`;

  // ---- DOM ----
  const status = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const modeTape = h('button', { class: 'btn btn--small ldg-mode', type: 'button', onclick: () => setMode('tape') }, h('span', { 'aria-hidden': 'true' }, '＋ '), 'Add to tape');
  const modeFlag = h('button', { class: 'btn btn--small ldg-mode', type: 'button', onclick: () => setMode('flag') }, h('span', { 'aria-hidden': 'true' }, '⚑ '), 'Flag altered');
  const readSum = h('b', { class: 'ldg-read-sum' });
  const readN = h('span', { class: 'ldg-read-n' });
  const clearBtn = h('button', { class: 'btn btn--small ldg-clear', type: 'button', onclick: () => clearTape() }, 'Clear tape');
  const readout = h('div', { class: 'ldg-readout', role: 'status', 'aria-label': 'Adding machine' }, h('span', { class: 'ldg-read-l' }, 'Tape'), readN, readSum, clearBtn);

  const cellBtn = [];
  const rowTot = [], colTot = [];
  const rowHead = [], rowLabelRow = [], colHead = [];
  const table = h('table', { class: 'ldg-table' });
  const caption = h('caption', { class: 'ldg-cap' }, `Ledger, amounts in ${cur}`);
  table.append(caption);
  const thead = h('thead', {}, h('tr', {},
    h('th', { class: 'ldg-corner', scope: 'col' }, 'Account'),
    lab.cols.map((name, c) => (colHead[c] = h('th', { class: 'ldg-ch', scope: 'col' }, h('span', { class: 'ldg-ch-n' }, name), h('span', { class: 'ldg-mark' })))),
    h('th', { class: 'ldg-ch ldg-ch--tot', scope: 'col' }, 'Total')));
  const tbody = h('tbody', {});
  const mkBtn = (r, c, cls, onclick) => h('button', { class: cls, type: 'button', tabindex: '-1', 'data-r': r, 'data-c': c, onclick });
  for (let r = 0; r < R; r++) {
    rowLabelRow[r] = h('tr', { class: 'ldg-lrow', 'aria-hidden': 'true' }, h('td', { colspan: String(CC + 2) }, h('span', { class: 'ldg-ln' }, lab.rows[r]), h('span', { class: 'ldg-mark' })));
    rowHead[r] = h('th', { class: 'ldg-rh', scope: 'row' }, h('span', { class: 'ldg-rn' }, lab.rows[r]), h('span', { class: 'ldg-mark' }));
    cellBtn[r] = [];
    const tr = h('tr', { class: 'ldg-row' }, rowHead[r]);
    for (let c = 0; c < CC; c++) {
      cellBtn[r][c] = mkBtn(r, c, 'ldg-cell', () => act(r, c));
      tr.append(h('td', { class: 'ldg-td' }, cellBtn[r][c]));
    }
    rowTot[r] = mkBtn(r, CC, 'ldg-tot', () => compare(`r${r}`));
    tr.append(h('td', { class: 'ldg-td ldg-td--tot' }, rowTot[r]));
    tbody.append(rowLabelRow[r], tr);
  }
  const grandBtn = mkBtn(R, CC, 'ldg-tot ldg-grand', () => compare('g'));
  const footLabel = h('tr', { class: 'ldg-lrow ldg-lrow--tot', 'aria-hidden': 'true' }, h('td', { colspan: String(CC + 2) }, h('span', { class: 'ldg-ln' }, 'Printed totals'), h('span', { class: 'ldg-mark ldg-mark--g' })));
  const grandMark = h('span', { class: 'ldg-mark' });
  const tfoot = h('tfoot', {}, footLabel, h('tr', { class: 'ldg-row ldg-row--tot' },
    h('th', { class: 'ldg-rh ldg-rh--tot', scope: 'row' }, h('span', { class: 'ldg-rn' }, 'Total'), grandMark),
    Array.from({ length: CC }, (_, c) => h('td', { class: 'ldg-td ldg-td--foot' }, (colTot[c] = mkBtn(R, c, 'ldg-tot', () => compare(`c${c}`))))),
    h('td', { class: 'ldg-td ldg-td--tot ldg-td--foot' }, grandBtn)));
  table.append(thead, tbody, tfoot);
  const scroll = h('div', { class: 'ldg-scroll' }, table);
  const bigStamp = h('div', { class: 'ldg-bigstamp', 'aria-hidden': 'true' }, 'Falsified');
  const sheet = h('div', { class: 'ldg-sheet' }, scroll, bigStamp);

  const roll = h('ol', { class: 'ldg-roll', 'aria-label': 'Figures on the tape' });
  const rollSum = h('div', { class: 'ldg-roll-sum' });
  const tapeBox = h('aside', { class: 'ldg-tape', 'aria-label': 'Adding machine tape' },
    h('h3', { class: 'ldg-tape-h' }, 'Adding machine'),
    h('p', { class: 'ldg-roll-empty' }, 'Empty. Tap figures to add them.'),
    roll, rollSum);

  const rInput = h('input', { class: 'text-input ldg-input', type: 'text', inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'The first figure' });
  const rLabel = h('p', { class: 'ldg-rest-q' });
  const restoreBox = h('form', { class: 'ldg-restore', hidden: true, onsubmit: (e) => { e.preventDefault(); submitRestore(); } },
    rLabel,
    h('div', { class: 'ldg-rest-row' }, h('span', { class: 'ldg-rest-cur', 'aria-hidden': 'true' }, cur), rInput,
      h('button', { class: 'btn btn--primary btn--small', type: 'submit' }, 'Restore')));

  const wrap = h('div', { class: `ldg-wrap ldg-mag-${S.magnitude}` }, h('div', { class: 'ldg-main' }, readout, sheet, restoreBox), tapeBox);
  el.append(...[
    h('p', { class: 'game-rules' }, `${S.K === 1 ? 'One figure was' : `${S.K} figures were`} changed after the totals were printed${S.K > 1 ? ', no two in the same row or column' : ''}. Add figures on the tape, tap a printed total to compare, then flag the change${S.restore ? ' and type what it first said' : ''}.`),
    P.clue ? h('p', { class: 'ldg-clue' }, h('span', { class: 'ldg-clue-pin', 'aria-hidden': 'true' }), String(P.clue)) : null,
    h('div', { class: 'game-toolbar ldg-tools', role: 'group', 'aria-label': 'What a tap on a figure does' }, modeTape, modeFlag),
    wrap,
    status,
  ].filter(Boolean));

  // ---- render ----
  function cellLabel(r, c) {
    const k = K_(r, c);
    const bits = [`${lab.rows[r]}, ${lab.cols[c]}: ${money(L.cells[r][c])}`];
    if (found.has(k)) bits.push(fixed(k) ? `altered, first said ${money(altAt.get(k).orig)}` : 'altered, first figure not typed in yet');
    if (wrong.has(k)) bits.push('checked, not altered');
    if (tape.includes(k)) bits.push('on the tape');
    return bits.join(', ');
  }

  function markText(line) {
    if (!(line in checks)) return { t: '', cls: '' };
    const off = checks[line];
    return off === 0 ? { t: '✓', cls: 'is-ok' } : { t: `✕ ${fmt(Math.abs(off))}`, cls: 'is-off' };
  }
  function setMark(node, line) {
    const m = markText(line);
    node.textContent = m.t;
    node.className = `ldg-mark${m.cls ? ` ${m.cls}` : ''}`;
    if (m.t) node.setAttribute('title', m.cls === 'is-ok' ? 'Adds up' : `Off by ${fmt(Math.abs(checks[line]))}`);
  }

  function render() {
    modeTape.setAttribute('aria-pressed', String(mode === 'tape'));
    modeFlag.setAttribute('aria-pressed', String(mode === 'flag'));
    wrap.classList.toggle('is-flagmode', mode === 'flag');
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < CC; c++) {
        const k = K_(r, c), b = cellBtn[r][c];
        b.innerHTML = '';
        if (found.has(k)) {
          const a = altAt.get(k);
          b.append(h('s', { class: 'ldg-was' }, fmt(a.now)));
          if (fixed(k)) b.append(h('span', { class: 'ldg-fix' }, fmt(a.orig)));
          else b.append(h('span', { class: 'ldg-ask' }, '?'));
        } else b.append(h('span', { class: 'ldg-num' }, fmt(L.cells[r][c])));
        b.classList.toggle('is-taped', tape.includes(k));
        b.classList.toggle('is-found', found.has(k));
        b.classList.toggle('is-pending', found.has(k) && !fixed(k));
        b.classList.toggle('is-active', active === k);
        b.classList.toggle('is-wrong', wrong.has(k));
        b.classList.toggle('is-hintcell', hintCell === k && !found.has(k));
        b.classList.toggle('is-hintline', hintLine === `r${r}` || hintLine === `c${c}`);
        b.setAttribute('aria-label', cellLabel(r, c));
      }
      rowTot[r].textContent = fmt(L.rowTotals[r]);
      rowTot[r].setAttribute('aria-label', `Printed total for ${lab.rows[r]}: ${money(L.rowTotals[r])}. Tap to compare with the tape.`);
      rowTot[r].classList.toggle('is-hintline', hintLine === `r${r}`);
      setMark(rowHead[r].querySelector('.ldg-mark'), `r${r}`);
      setMark(rowLabelRow[r].querySelector('.ldg-mark'), `r${r}`);
      rowHead[r].classList.toggle('is-hintline', hintLine === `r${r}`);
      rowLabelRow[r].classList.toggle('is-hintline', hintLine === `r${r}`);
    }
    for (let c = 0; c < CC; c++) {
      colTot[c].textContent = fmt(L.colTotals[c]);
      colTot[c].setAttribute('aria-label', `Printed total for ${lab.cols[c]}: ${money(L.colTotals[c])}. Tap to compare with the tape.`);
      colTot[c].classList.toggle('is-hintline', hintLine === `c${c}`);
      setMark(colHead[c].querySelector('.ldg-mark'), `c${c}`);
      colHead[c].classList.toggle('is-hintline', hintLine === `c${c}`);
    }
    grandBtn.textContent = fmt(L.grand);
    grandBtn.setAttribute('aria-label', `Printed grand total: ${money(L.grand)}. Tap to compare with the tape.`);
    setMark(grandMark, 'g');
    setMark(footLabel.querySelector('.ldg-mark'), 'g');
    // roving focus
    allBtns().forEach((b) => b.setAttribute('tabindex', '-1'));
    (btnAt(focus.r, focus.c) || cellBtn[0][0]).setAttribute('tabindex', solved ? '-1' : '0');
    renderTape();
    renderRestore();
  }

  function tapeSum() { return tape.reduce((a, k) => { const [r, c] = k.split(',').map(Number); return a + value(r, c); }, 0); }
  function renderTape() {
    const sum = tapeSum();
    readN.textContent = tape.length ? `${tape.length} ${tape.length === 1 ? 'figure' : 'figures'}` : 'empty';
    readSum.textContent = `= ${fmt(sum)}`;
    clearBtn.disabled = !tape.length;
    roll.innerHTML = '';
    tape.forEach((k) => {
      const [r, c] = k.split(',').map(Number);
      roll.append(h('li', {}, h('span', { class: 'ldg-roll-l' }, `${lab.cols[c]} · ${lab.rows[r]}`), h('span', { class: 'ldg-roll-v' }, `${fmt(value(r, c))} +`)));
    });
    tapeBox.querySelector('.ldg-roll-empty').hidden = tape.length > 0;
    rollSum.textContent = `${fmt(sum)} ✱`;
    rollSum.hidden = !tape.length;
    roll.scrollTop = roll.scrollHeight;
  }

  function renderRestore() {
    const pending = [...found].filter((k) => !fixed(k));
    if (!S.restore || solved || !pending.length) { restoreBox.hidden = true; active = null; return; }
    if (!pending.includes(active)) active = pending[0];
    const a = altAt.get(active);
    restoreBox.hidden = false;
    rLabel.textContent = `${lab.rows[a.r]}, ${lab.cols[a.c]} was changed. It now says ${fmt(a.now)}. What did it say first?`;
  }

  function persist() {
    ctx.onSave({ v: 1, sig, mode, tape, found: [...found], restored: [...restored], wrong: [...wrong], checks, hintStage, hintLine, hintCell });
  }

  function progress() {
    if (isSolved()) return 1;
    const credit = L.altered.map((a) => {
      const k = K_(a.r, a.c);
      if (found.has(k)) return fixed(k) ? 1 : 0.7;
      let c = 0;
      if (checks[`r${a.r}`]) c += 0.15;
      if (checks[`c${a.c}`]) c += 0.15;
      return c;
    });
    return Math.min(0.95, credit.reduce((x, y) => x + y, 0) / L.altered.length);
  }

  function update() { persist(); render(); ctx.onProgress(progress()); }

  function say(t, kind = '') { status.textContent = t; status.className = `feedback${kind ? ` is-${kind}` : ''}`; }

  // ---- actions ----
  function setMode(m) {
    if (solved) return;
    mode = m;
    sfx.click();
    say(m === 'flag' ? 'Flag mode: tap the figure you think was changed.' : 'Tape mode: tap figures to add them up.');
    update();
  }

  function act(r, c) {
    if (solved) return;
    focus = { r, c };
    if (mode === 'flag') flag(r, c); else toggleTape(r, c);
  }

  function toggleTape(r, c) {
    const k = K_(r, c);
    const i = tape.indexOf(k);
    if (i >= 0) { tape.splice(i, 1); say(`Took ${fmt(value(r, c))} off the tape.`); } else { tape.push(k); say(`+ ${fmt(value(r, c))}. Tape: ${fmt(tapeSum())}.`); }
    sfx.key();
    update();
  }

  function clearTape() {
    if (!tape.length) return;
    tape = [];
    sfx.click();
    say('Tape cleared.');
    update();
  }

  function compare(line) {
    if (solved) return;
    if (line !== 'g') focus = line[0] === 'r' ? { r: Number(line.slice(1)), c: CC } : { r: R, c: Number(line.slice(1)) };
    else focus = { r: R, c: CC };
    const name = lineName(line);
    if (!tape.length) {
      say(`Tap the figures of ${line === 'g' ? 'the whole ledger' : line[0] === 'r' ? 'that row' : 'that column'} first, then tap this total to compare.`);
      sfx.click();
      update();
      return;
    }
    const want = lineKeys(line);
    const sum = tapeSum(), pr = printed(line);
    const exact = want.length === tape.length && want.every((k) => tape.includes(k));
    if (exact) {
      const off = sum - pr;
      checks = { ...checks, [line]: off };
      if (off === 0) { say(`${name} adds up: ${fmt(sum)}.`, 'good'); sfx.click(); }
      else { say(`${name} is off by ${fmt(Math.abs(off))}. Tape ${fmt(sum)}, printed ${fmt(pr)}.`, 'bad'); sfx.good(); }
      if (hintLine === line && off === 0) hintLine = null;
    } else {
      const have = want.filter((k) => tape.includes(k)).length;
      const extra = tape.length - have;
      const diff = sum - pr;
      const more = extra ? 'The tape also holds figures from other lines: clear it and add just this one.' : `The tape holds ${have} of its ${want.length} figures.`;
      say(`Tape ${fmt(sum)} against printed ${fmt(pr)} (${diff === 0 ? 'equal' : `${diff > 0 ? '+' : '-'}${fmt(Math.abs(diff))}`}). ${more}`);
      sfx.click();
    }
    update();
  }

  function stampOn(b, word) {
    const s = h('span', { class: 'ldg-stamp', 'aria-hidden': 'true' }, word);
    b.append(s);
    timers.push(setTimeout(() => s.remove(), reduceMotion() ? 1400 : 1900));
  }

  function flag(r, c) {
    const k = K_(r, c);
    const b = cellBtn[r][c];
    if (found.has(k)) {
      if (!fixed(k)) { active = k; update(); rInput.focus(); say('Type the figure it first said.'); } else say('Already caught.');
      return;
    }
    if (altAt.has(k)) {
      found.add(k);
      if (hintCell === k) hintCell = null;
      if (hintLine === `r${r}` || hintLine === `c${c}`) hintLine = null;
      sfx.stamp();
      if (S.restore) {
        active = k;
        say(`Caught it. ${lab.rows[r]}, ${lab.cols[c]} was changed. Now type what it first said.`, 'good');
        update();
        rInput.value = '';
        rInput.focus({ preventScroll: true });
        if (restoreBox.getBoundingClientRect().bottom > innerHeight) restoreBox.scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' });
      } else {
        say(`Caught it. ${lab.rows[r]}, ${lab.cols[c]} first said ${fmt(altAt.get(k).orig)}.`, 'good');
        update();
        checkSolved();
      }
      return;
    }
    // a wrong flag costs nothing; it says why
    const rOff = lineOff(`r${r}`), cOff = lineOff(`c${c}`);
    wrong.add(k);
    sfx.bad();
    if (rOff === 0 && cOff === 0) {
      say(`Not this one. Its row and its column both add up.`, 'bad');
    } else if (rOff === 0) say(`Not this one. ${lab.rows[r]} adds up, so this figure is fine.`, 'bad');
    else if (cOff === 0) say(`Not this one. The ${lab.cols[c]} column adds up, so this figure is fine.`, 'bad');
    else say(`Not this one. Its row and column are both off, but not by the same amount.`, 'bad');
    update();
    if (rOff === 0 && cOff === 0) stampOn(b, 'Balances');
  }

  function submitRestore() {
    if (!active || solved) return;
    const a = altAt.get(active);
    const v = parseAmount(rInput.value);
    if (v == null) { say('Type a number, like 12,450.', 'bad'); return; }
    if (v === a.orig) {
      restored.add(active);
      sfx.good();
      say(`Restored: ${fmt(a.orig)}. ${lab.rows[a.r]} adds up again.`, 'good');
      rInput.value = '';
      const k = active;
      active = null;
      update();
      checkSolved();
      if (!solved) btnAt(...k.split(',').map(Number))?.focus({ preventScroll: true });
    } else {
      sfx.bad();
      say(`With ${fmt(v)} there, ${lab.rows[a.r]} still would not add up.`, 'bad');
      rInput.select();
    }
  }

  function checkSolved() {
    if (solved || !isSolved()) return;
    solved = true;
    hintLine = null;
    hintCell = null;
    for (let r = 0; r < R; r++) checks[`r${r}`] = 0;
    for (let c = 0; c < CC; c++) checks[`c${c}`] = 0;
    checks.g = 0;
    persist();
    render();
    sheet.classList.add('is-solved');
    wrap.classList.add('is-solved');
    say('Every line adds up again. Somebody cooked these books.', 'good');
    timers.push(setTimeout(() => {
      sfx.stamp();
      ctx.onProgress(1);
      if (!told) { told = true; ctx.onSolved(); }
    }, reduceMotion() ? 50 : 650));
  }

  // ---- keyboard: arrows move around the ledger ----
  let focus = { r: 0, c: 0 };
  const btnAt = (r, c) => (r < R ? (c < CC ? cellBtn[r][c] : rowTot[r]) : (c < CC ? colTot[c] : grandBtn));
  const allBtns = () => [...cellBtn.flat(), ...rowTot, ...colTot, grandBtn];
  table.addEventListener('keydown', (e) => {
    if (solved || e.ctrlKey || e.metaKey || e.altKey) return;
    const b = e.target.closest?.('button');
    if (!b) return;
    const r = Number(b.dataset.r), c = Number(b.dataset.c);
    const mv = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (mv) {
      e.preventDefault();
      const nr = Math.max(0, Math.min(R, r + mv[0])), nc = Math.max(0, Math.min(CC, c + mv[1]));
      focus = { r: nr, c: nc };
      allBtns().forEach((x) => x.setAttribute('tabindex', '-1'));
      const t = btnAt(nr, nc);
      t.setAttribute('tabindex', '0');
      t.focus();
      return;
    }
    const key = e.key.toLowerCase();
    const isCell = r < R && c < CC;
    if (key === 'f' && isCell) { e.preventDefault(); focus = { r, c }; flag(r, c); refocus(); }
    else if ((key === 'a' || key === '+' || key === '=') && isCell) { e.preventDefault(); focus = { r, c }; toggleTape(r, c); refocus(); }
    else if (key === 'c' || key === 'delete') { e.preventDefault(); clearTape(); refocus(); }
    else if (key === 'backspace') { e.preventDefault(); if (tape.length) { tape.pop(); sfx.key(); say('Took the last figure off the tape.'); update(); } refocus(); }
    else if (key === 't') { e.preventDefault(); setMode(mode === 'tape' ? 'flag' : 'tape'); refocus(); }
  });
  function refocus() { const t = btnAt(focus.r, focus.c); if (t && !solved) t.focus({ preventScroll: true }); }
  // a click (or Enter/Space) re-renders the buttons' contents; keep focus where it was
  table.addEventListener('click', () => { if (document.activeElement === document.body) refocus(); });

  // ---- narrow sheets: account names move onto their own line above each row ----
  let ro = null;
  function fit() {
    wrap.classList.remove('is-stacked');
    if (scroll.scrollWidth > scroll.clientWidth + 2) wrap.classList.add('is-stacked');
  }
  let raf = 0;
  const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
  if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(onResize); ro.observe(el); } else window.addEventListener('resize', onResize);

  // ---- start ----
  render();
  persist();
  ctx.onProgress(progress());
  requestAnimationFrame(fit);
  document.fonts?.ready?.then(() => { if (el.isConnected) fit(); });
  if (isSolved()) checkSolved();

  return {
    hint() {
      if (solved) return null;
      const a = L.altered.find((x) => !done(x));
      if (!a) return null;
      const k = K_(a.r, a.c);
      if (found.has(k)) {
        // flagged but not typed in: read the first figure for them
        restored.add(k);
        active = null;
        update();
        sfx.pin();
        checkSolved();
        return `Under the correction fluid it first said ${fmt(a.orig)}.`;
      }
      const stage = hintStage[k] || 0;
      const rowKnown = !!checks[`r${a.r}`], colKnown = !!checks[`c${a.c}`];
      if (stage === 0 && !(rowKnown && colKnown)) {
        hintLine = rowKnown ? `c${a.c}` : `r${a.r}`;
        hintStage = { ...hintStage, [k]: 1 };
        update();
        sfx.pin();
        return `${lineName(hintLine)} does not add up. It is marked in yellow.`;
      }
      hintCell = k;
      hintLine = null;
      hintStage = { ...hintStage, [k]: 2 };
      update();
      sfx.pin();
      return `This one: ${lab.rows[a.r]}, ${lab.cols[a.c]}. Flag it.`;
    },
    devSolve() {
      if (solved) return;
      for (const a of L.altered) { const k = K_(a.r, a.c); found.add(k); if (S.restore) restored.add(k); }
      active = null;
      update();
      checkSolved();
    },
    destroy() {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', onResize);
    },
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Find the figures someone changed after the totals were printed.',
  steps: [
    'Tap the figures in one row. The tape adds them up.',
    'Tap that row\'s printed total. The tape says if it matches.',
    'A row that is off has a changed figure. So does a column.',
    'Where the bad row and bad column cross: tap Flag altered, then tap that figure.',
    ({ params }) => (params.restore ? 'Then type the figure it first said.' : 'Clear the tape before you check the next line.'),
  ],
  example: {
    caption: 'Row B adds up to 70, but its printed total says 60. The Feb column is off by 10 too. They cross at 30: that figure was changed.',
    render(el) {
      const x0 = 70, y0 = 30, cw = 50, rh = 30;
      let s = rect(0, 0, 380, 158, { fill: '#f4f1e2', stroke: C.line, sw: 1, rx: 4 });
      const cols = ['Jan', 'Feb', 'Total'];
      cols.forEach((t, i) => { s += text(x0 + i * cw + cw / 2, y0 - 10, t, { size: 12, weight: 700, fill: C.soft }); });
      const rows = [['A', 20, 15, 35], ['B', 40, 30, 60], ['Total', 60, 35, 95]];
      rows.forEach((row, r) => {
        const y = y0 + r * rh;
        s += text(x0 - 12, y + 20, row[0], { size: 13, weight: 700, anchor: 'end' });
        for (let c = 0; c < 3; c++) {
          const tot = c === 2 || r === 2;
          s += rect(x0 + c * cw, y, cw, rh, { fill: tot ? '#e6e0c8' : '#fbf7ec', stroke: '#b9c7b0', sw: 1 });
          s += text(x0 + c * cw + cw - 8, y + 20, String(row[c + 1]), { size: 14, anchor: 'end', font: tot ? 'ui' : 'doc', weight: tot ? 700 : 400 });
        }
      });
      // row B off, Feb column off
      s += `<rect x="${x0 - 30}" y="${y0 + rh}" width="${cw * 3 + 30}" height="${rh}" fill="${C.yellow}" opacity=".22"/>`;
      s += `<rect x="${x0 + cw}" y="${y0 - 22}" width="${cw}" height="${rh * 3 + 22}" fill="${C.yellow}" opacity=".18"/>`;
      s += ring(x0 + cw * 1.5 + 6, y0 + rh * 1.5, 17);
      s += tap(x0 + cw * 1.5 + 26, y0 + rh * 1.5 + 16);
      // tape
      s += rect(250, 14, 112, 128, { fill: '#fffdf4', stroke: C.line, sw: 1, rx: 2 });
      s += text(306, 32, 'TAPE', { size: 11, weight: 700, fill: C.soft });
      s += text(350, 54, '40 +', { size: 14, anchor: 'end', font: 'doc' });
      s += text(350, 74, '30 +', { size: 14, anchor: 'end', font: 'doc' });
      s += `<line x1="262" y1="84" x2="352" y2="84" stroke="${C.ink}" stroke-width="1"/>`;
      s += text(350, 102, '70', { size: 15, anchor: 'end', font: 'doc', weight: 700 });
      s += text(306, 128, 'printed 60: off 10', { size: 11, fill: C.red, weight: 700 });
      put(el, svg(380, 158, s, 'A small ledger: row B and the Feb column are both off by 10; they cross at the changed figure'));
    },
  },
  tips: [
    ({ params }) => ((params.altered || 1) > 1 ? 'More than one change? Match each bad row to the bad column that is off by the same amount.' : 'You only need to check rows until one is off. Then check the columns.'),
    'A wrong flag costs nothing. It tells you if that row and column add up.',
  ],
  controls: {
    touch: 'Tap figures to add them to the tape, tap a total to compare. Switch to Flag altered to accuse a figure.',
    keys: 'Arrows move. A adds a figure, F flags it, Enter does what the mode says, C clears the tape, T switches mode.',
  },
};
