// Logic grid: three categories, five items each, classic X / tick elimination grid.
import { h } from '../core/ui.js';
import { sfx } from '../core/audio.js';

export const meta = { id: 'logicgrid', name: 'Logic Grid', category: 'Logic' };

export function mount(el, ctx) {
  const { params, saved } = ctx;
  const [A, B, C] = params.categories; // Person, Location, Holding
  const n = A.items.length;
  // three sub-grids: AB (person x location), AC (person x holding), CB (holding x location)
  const grids = saved?.grids || { AB: Array(n * n).fill(0), AC: Array(n * n).fill(0), CB: Array(n * n).fill(0) };
  const struck = new Set(saved?.struck || []);
  let auto = saved?.auto ?? true;
  const status = h('p', { class: 'feedback' });

  const table = h('table', { class: 'lg-table' });
  const cellEls = { AB: [], AC: [], CB: [] };
  const cellBtn = (key, r, c) => {
    const b = h('button', { class: 'lg-cell', 'aria-label': '', onclick: () => cycle(key, r, c) });
    cellEls[key][r * n + c] = b;
    return b;
  };
  const vhead = (t) => h('th', { class: 'lg-vh', scope: 'col' }, h('span', {}, t));
  // header rows
  table.append(h('tr', {}, h('th', {}), h('th', { class: 'lg-cat', colspan: n }, B.name), h('th', { class: 'lg-cat', colspan: n }, C.name)));
  table.append(h('tr', {}, h('th', {}), B.items.map(vhead), C.items.map(vhead)));
  A.items.forEach((a, r) => {
    table.append(h('tr', {}, h('th', { scope: 'row', class: 'lg-rh' }, a),
      B.items.map((_, c) => h('td', { class: c === n - 1 ? 'sep' : '' }, cellBtn('AB', r, c))),
      C.items.map((_, c) => h('td', {}, cellBtn('AC', r, c)))));
  });
  table.append(h('tr', { class: 'lg-gap' }, h('th', { scope: 'row', class: 'lg-cat-row' }, C.name), h('td', { colspan: n * 2 })));
  C.items.forEach((cName, r) => {
    table.append(h('tr', {}, h('th', { scope: 'row', class: 'lg-rh' }, cName),
      B.items.map((_, c) => h('td', { class: c === n - 1 ? 'sep' : '' }, cellBtn('CB', r, c))),
      h('td', { colspan: n })));
  });

  const clueList = h('ol', { class: 'lg-clues doc' }, params.clues.map((cl, i) => {
    const li = h('li', { onclick: () => { struck.has(i) ? struck.delete(i) : struck.add(i); li.classList.toggle('is-struck'); persist(); } }, cl);
    if (struck.has(i)) li.classList.add('is-struck');
    return li;
  }));
  const autoBtn = h('button', { class: 'btn btn--small', 'aria-pressed': String(auto), onclick: () => { auto = !auto; autoBtn.setAttribute('aria-pressed', String(auto)); persist(); } }, 'Auto-cross');
  const clearBtn = h('button', { class: 'btn btn--small', onclick: () => { Object.values(grids).forEach((g) => g.fill(0)); render(); persist(); } }, 'Clear grid');

  el.append(
    h('p', { class: 'game-rules' }, 'Tap a square once for ✕ (ruled out), twice for ✓ (confirmed). Tap a clue to strike it out when you have used it.'),
    h('div', { class: 'lg-layout' },
      h('div', { class: 'lg-scroll' }, table),
      h('div', {}, h('h3', { class: 'lg-h' }, 'Clues'), clueList, h('div', { class: 'game-toolbar' }, autoBtn, clearBtn))),
    status,
  );

  function cycle(key, r, c) {
    const g = grids[key];
    const i = r * n + c;
    g[i] = (g[i] + 1) % 3;
    if (g[i] === 2 && auto) {
      for (let k = 0; k < n; k++) {
        if (k !== c && g[r * n + k] === 0) g[r * n + k] = 1;
        if (k !== r && g[k * n + c] === 0) g[k * n + c] = 1;
      }
    }
    sfx.click();
    render();
    persist();
    check();
  }

  function persist() { ctx.onSave({ grids, struck: [...struck], auto }); }

  function render() {
    for (const key of ['AB', 'AC', 'CB']) {
      cellEls[key].forEach((b, i) => {
        const v = grids[key][i];
        b.textContent = v === 1 ? '✕' : v === 2 ? '✓' : '';
        b.className = `lg-cell${v === 1 ? ' is-x' : v === 2 ? ' is-tick' : ''}`;
      });
    }
  }

  function check() {
    const sol = params.solution;
    let correct = 0;
    for (let r = 0; r < n; r++) {
      if (grids.AB[r * n + sol[r][0]] === 2) correct++;
      if (grids.AC[r * n + sol[r][1]] === 2) correct++;
    }
    ctx.onProgress(correct / (n * 2));
    const ticks = (g) => g.filter((v) => v === 2).length;
    if (ticks(grids.AB) === n && ticks(grids.AC) === n) {
      if (correct === n * 2) {
        status.textContent = 'Everyone is placed. The timeline holds.';
        status.className = 'feedback is-good';
        ctx.onSolved();
      } else {
        status.textContent = 'One of your ticks breaks a clue. Read them again.';
        status.className = 'feedback is-bad';
        sfx.bad();
      }
    } else {
      status.textContent = '';
    }
  }

  render();
  check();
  return {
    hint() {
      const sol = params.solution;
      for (const r of [n - 1, 1, 0, 2, 3]) {
        if (grids.AB[r * n + sol[r][0]] !== 2) {
          grids.AB[r * n + sol[r][0]] = 2;
          render(); persist(); check();
          return `Confirmed: ${A.items[r]} was at ${B.items[sol[r][0]]}.`;
        }
      }
      for (let r = 0; r < n; r++) {
        if (grids.AC[r * n + sol[r][1]] !== 2) {
          grids.AC[r * n + sol[r][1]] = 2;
          render(); persist(); check();
          return `Confirmed: ${A.items[r]} was holding the ${C.items[sol[r][1]].toLowerCase()}.`;
        }
      }
      return null;
    },
    devSolve() {
      params.solution.forEach(([loc, item], r) => {
        grids.AB[r * n + loc] = 2;
        grids.AC[r * n + item] = 2;
        grids.CB[item * n + loc] = 2;
      });
      render(); check();
    },
  };
}
