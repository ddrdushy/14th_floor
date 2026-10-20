// Turn-based pursuit through a procedurally generated grid of KL streets. You are on foot and can
// cut through lorong alleys; the suspect is on a motorbike, obeys one-way arrows and red lights,
// and moves by a fixed rule printed on the screen. Every map is checked by a full search so a
// catch is possible within the move limit.
// Variants: 'easy-grid' (two-way streets) and 'one-way' (one-way streets, more lights, tighter limit).
import { h } from '../core/ui.js';
import { shuffle, mulberry32 } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import * as HT from '../core/howto-kit.js';

export const meta = { id: 'chase', name: 'Street Chase', category: 'Navigation' };
export const demo = { variant: 'one-way', params: { rounds: 2 } };

const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const DIRN = ['north', 'east', 'south', 'west'];
const ROWS = ['Jln Tun Perak', 'Jln Petaling', 'Jln Sultan', 'Jln Hang Lekir', 'Jln Silang', 'Jln Pudu', 'Jln Imbi'];
const COLS = ['Jln Raja Laut', 'Jln TAR', 'Jln Masjid India', 'Jln Melayu', 'Jln HS Lee', 'Jln Alor', 'Jln Changkat', 'Jln Doraisamy'];
const C = 64, M = 34; // cell size and margin in map units

function buildMap(r, W, H, oneWay) {
  const N = W * H;
  const edges = new Array(N * 4).fill(null);
  const link = (a, d, e) => { const x = a % W, y = Math.floor(a / W); const b = (y + DY[d]) * W + x + DX[d]; edges[a * 4 + d] = e; edges[b * 4 + ((d + 2) % 4)] = e; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = y * W + x;
    if (x < W - 1) link(a, 1, { type: 'road', allow: -1 });
    if (y < H - 1) link(a, 2, { type: 'road', allow: -1 });
  }
  const all = [...new Set(edges.filter(Boolean))];
  const ends = (e) => { const i = edges.indexOf(e); return [Math.floor(i / 4), i % 4]; };
  // close some streets, keeping every junction reachable on foot
  const connected = () => {
    const seen = new Set([0]); const q = [0];
    while (q.length) { const a = q.pop(); for (let d = 0; d < 4; d++) { const e = edges[a * 4 + d]; if (!e) continue; const b = a + DY[d] * W + DX[d]; if (!seen.has(b)) { seen.add(b); q.push(b); } } }
    return seen.size === N;
  };
  for (const e of shuffle(r, all).slice(0, Math.floor(all.length * 0.16))) {
    const [a, d] = ends(e);
    const b = a + DY[d] * W + DX[d];
    edges[a * 4 + d] = null; edges[b * 4 + ((d + 2) % 4)] = null;
    if (!connected()) { edges[a * 4 + d] = e; edges[b * 4 + ((d + 2) % 4)] = e; }
  }
  const live = [...new Set(edges.filter(Boolean))];
  for (const e of shuffle(r, live).slice(0, Math.floor(live.length * 0.14))) e.type = 'lorong';
  if (oneWay) for (const e of shuffle(r, live.filter((x) => x.type === 'road')).slice(0, Math.floor(live.length * 0.32))) { const [, d] = ends(e); e.allow = r() < 0.5 ? d : (d + 2) % 4; }
  const lights = new Map();
  const nodes = shuffle(r, Array.from({ length: N }, (_, i) => i).filter((a) => [0, 1, 2, 3].filter((d) => edges[a * 4 + d]?.type === 'road').length >= 3));
  nodes.slice(0, oneWay ? 5 : 3).forEach((a) => lights.set(a, Math.floor(r() * 2)));
  return { W, H, N, edges, lights };
}

function makeRules(map, every) {
  const { W, edges, lights } = map;
  const nb = (a, d) => a + DY[d] * W + DX[d];
  const footOK = (a, d) => !!edges[a * 4 + d];
  const phase = (a, t) => (lights.get(a) + Math.floor(t / every)) % 2; // 0: north-south green
  const bikeOK = (a, d, t, you) => {
    const e = edges[a * 4 + d];
    if (!e || e.type === 'lorong') return false;
    if (e.allow !== -1 && e.allow !== d) return false;
    if (lights.has(a) && phase(a, t) !== d % 2) return false;
    return nb(a, d) !== you;
  };
  const adjacent = (you, b) => [0, 1, 2, 3].some((d) => footOK(you, d) && nb(you, d) === b);
  // the suspect's rule: left, straight, right, back; first allowed move that does not end next to you,
  // otherwise the first allowed move; if nothing is allowed he waits
  const flee = (him, hd, t, you) => {
    const pref = [(hd + 3) % 4, hd, (hd + 1) % 4, (hd + 2) % 4];
    const ok = pref.filter((d) => bikeOK(him, d, t, you));
    if (!ok.length) return [him, hd];
    const safe = ok.find((d) => !adjacent(you, nb(him, d)) && nb(him, d) !== you);
    const d = safe ?? ok[0];
    return [nb(him, d), d];
  };
  // one turn: you act (0-3 move, 4 wait), then he moves. Returns null for an illegal action.
  const step = (s, act) => {
    let you = s.you;
    if (act < 4) { if (!footOK(you, act)) return null; you = nb(you, act); }
    if (you === s.him) return { you, him: s.him, hd: s.hd, t: s.t + 1, caught: true };
    const [him, hd] = flee(s.him, s.hd, s.t, you);
    return { you, him, hd, t: s.t + 1, caught: false };
  };
  // breadth-first search for the fastest catch from a state
  const solve = (s0, maxDepth) => {
    const per = every * 2;
    const k = (s) => `${s.you},${s.him},${s.hd},${s.t % per}`;
    const seen = new Map([[k(s0), null]]);
    let frontier = [s0];
    for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
      const next = [];
      for (const s of frontier) for (let a = 0; a < 5; a++) {
        const n = step(s, a);
        if (!n) continue;
        if (n.caught) {
          const path = [a]; let cur = s;
          while (seen.get(k(cur))) { const [prev, pa] = seen.get(k(cur)); path.unshift(pa); cur = prev; }
          return path;
        }
        const nk = k(n);
        if (seen.has(nk)) continue;
        seen.set(nk, [s, a]);
        next.push(n);
      }
      frontier = next;
    }
    return null;
  };
  return { nb, footOK, bikeOK, phase, step, solve, flee };
}

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const oneWay = ctx.variant !== 'easy-grid';
  const rounds = params.rounds || 2;
  const every = params.lightEvery || 3;
  const slack = params.slack ?? (oneWay ? 1 : 2);
  const seed = Math.floor(rng() * 2 ** 31);

  let round = saved?.round || 0;
  let moves = saved?.moves || [];
  let attempts = saved?.attempts || 0;
  let G, R, start, limit, best, state, finished = false, lost = false;

  function newRound() {
    const r = mulberry32(seed + round * 4049);
    const W = oneWay ? 8 : 7, H = oneWay ? 6 : 5;
    for (let tries = 0; ; tries++) {
      G = buildMap(r, W, H, oneWay);
      R = makeRules(G, every);
      const you = Math.floor(r() * G.N);
      const cand = Array.from({ length: G.N }, (_, i) => i).filter((i) => Math.abs((i % W) - (you % W)) + Math.abs(Math.floor(i / W) - Math.floor(you / W)) >= 5);
      if (!cand.length) continue;
      const him = cand[Math.floor(r() * cand.length)];
      const hd = [0, 1, 2, 3].find((d) => R.bikeOK(him, d, 0, you));
      if (hd === undefined) continue;
      start = { you, him, hd, t: 0 };
      const path = R.solve(start, 26);
      const lo = oneWay ? 12 : 9, hi = oneWay ? 22 : 18;
      if (path && path.length >= lo && path.length <= hi) { best = path; break; }
      if (tries > 400 && path) { best = path; break; }
    }
    limit = best.length + slack;
  }

  function replay() {
    state = { ...start, caught: false };
    for (const a of moves) { const n = R.step(state, a); if (!n) break; state = n; if (n.caught) break; }
    lost = !state.caught && moves.length >= limit;
  }

  newRound();
  replay();

  const status = h('p', { class: 'feedback' });
  const head = h('p', { class: 'doc ch-head' });
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'ch-svg');
  svg.setAttribute('role', 'application');
  svg.setAttribute('aria-label', 'Street map. Arrow keys move you one junction; space waits.');
  svg.setAttribute('tabindex', '0');
  const base = document.createElementNS(svgNS, 'g');
  const dyn = document.createElementNS(svgNS, 'g');
  svg.append(base, dyn);
  const waitBtn = h('button', { class: 'btn btn--small', onclick: () => act(4) }, 'Wait a turn');
  const undoBtn = h('button', { class: 'btn btn--small', onclick: () => undo() }, 'Undo');
  const resetBtn = h('button', { class: 'btn btn--small', onclick: () => restart() }, 'Restart chase');
  const nextBtn = h('button', { class: 'btn btn--primary', hidden: true, onclick: () => nextRound() }, 'Next chase');
  el.append(
    h('p', { class: 'game-rules' }, `Catch the suspect by stepping onto his junction within the move limit. Each turn you move one block (or wait), then he moves one block. ${rounds} chases.`),
    h('div', { class: 'ch-rule doc' },
      h('strong', {}, 'How he rides. '),
      'At every junction he tries, in this order: turn left, go straight, turn right, turn back. He takes the first that is allowed and does not end next to you; if every allowed move ends next to you, he takes the first allowed one; if none is allowed, he waits. ',
      'Allowed means: never into a lorong (dashed), never against a one-way arrow, never away from a junction on a red light, never onto your junction. ',
      `Lights change every ${every} turns. You are on foot: lorongs, arrows and lights do not stop you.`),
    head,
    h('div', { class: 'ch-wrap' }, svg),
    h('div', { class: 'game-toolbar' }, waitBtn, undoBtn, resetBtn, nextBtn),
    status,
  );

  const px = (a) => M + (a % G.W) * C, py = (a) => M + Math.floor(a / G.W) * C;

  function drawBase() {
    const { W, H, edges } = G;
    svg.setAttribute('viewBox', `0 0 ${M * 2 + (W - 1) * C} ${M * 2 + (H - 1) * C}`);
    let s = `<rect width="100%" height="100%" fill="#e4d8bb"/>`;
    // blocks
    for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) s += `<rect x="${M + x * C + 9}" y="${M + y * C + 9}" width="${C - 18}" height="${C - 18}" rx="3" fill="#cdbb92" stroke="#b39d6e"/>`;
    const seen = new Set();
    // closed streets: draw the block across them
    for (let a = 0; a < G.N; a++) for (const d of [1, 2]) {
      const x = a % W, y = Math.floor(a / W);
      if ((d === 1 && x === W - 1) || (d === 2 && y === H - 1)) continue;
      if (!edges[a * 4 + d]) {
        const x1 = px(a), y1 = py(a);
        s += d === 1 ? `<rect x="${x1 + 8}" y="${y1 - 9}" width="${C - 16}" height="18" fill="#cdbb92"/>` : `<rect x="${x1 - 9}" y="${y1 + 8}" width="18" height="${C - 16}" fill="#cdbb92"/>`;
      }
    }
    for (let a = 0; a < G.N; a++) for (let d = 0; d < 4; d++) {
      const e = edges[a * 4 + d];
      if (!e || seen.has(e)) continue;
      seen.add(e);
      const b = R.nb(a, d);
      const [x1, y1, x2, y2] = [px(a), py(a), px(b), py(b)];
      if (e.type === 'lorong') s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8a6a4a" stroke-width="4" stroke-dasharray="5 5"/>`;
      else {
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4a443b" stroke-width="16" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f8f2e2" stroke-width="13" stroke-linecap="round"/>`;
        if (e.allow !== -1) {
          const dd = e.allow, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          const ang = [-90, 0, 90, 180][dd];
          s += `<g transform="translate(${mx} ${my}) rotate(${ang})"><path d="M-12 0 H7 M2 -5 L9 0 L2 5" fill="none" stroke="#1d1a16" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
        }
      }
    }
    // street names, written along a plain two-way stretch of each street
    const label = (txt, x1, y1, x2, y2) => {
      const vert = x1 === x2;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return `<text transform="translate(${mx} ${my}) rotate(${vert ? 90 : 0})" text-anchor="middle" dy="2.3" font-size="6.6" font-family="Special Elite, monospace" fill="#5a4a32">${txt}</text>`;
    };
    for (let y = 0; y < H; y++) {
      const x = [...Array(W - 1).keys()].find((k) => { const e = edges[(y * W + k) * 4 + 1]; return e && e.type === 'road' && e.allow === -1; });
      if (x !== undefined) s += label(ROWS[y % ROWS.length], px(y * W + x), py(y * W), px(y * W + x + 1), py(y * W));
    }
    for (let x = 0; x < W; x++) {
      const y = [...Array(H - 1).keys()].find((k) => { const e = edges[(k * W + x) * 4 + 2]; return e && e.type === 'road' && e.allow === -1; });
      if (y !== undefined) s += label(COLS[x % COLS.length], px(x), py(y * W), px(x), py((y + 1) * W));
    }
    base.innerHTML = s;
  }

  function drawDyn() {
    let s = '';
    for (const [a] of G.lights) {
      const ph = R.phase(a, state.t);
      const x = px(a), y = py(a);
      s += `<g transform="translate(${x + 13} ${y - 13})"><rect x="-7" y="-7" width="14" height="14" rx="3" fill="#1d1a16"/><rect x="-1.6" y="-5.5" width="3.2" height="11" rx="1" fill="${ph === 0 ? '#5ad07a' : '#e04040'}"/><rect x="-5.5" y="-1.6" width="11" height="3.2" rx="1" fill="${ph === 1 ? '#5ad07a' : '#e04040'}" opacity=".95"/></g>`;
    }
    if (!state.caught && !lost && !finished) {
      for (let d = 0; d < 4; d++) if (R.footOK(state.you, d)) { const b = R.nb(state.you, d); s += `<circle class="ch-step" data-n="${b}" cx="${px(b)}" cy="${py(b)}" r="13" fill="#3d6b9a" fill-opacity=".14" stroke="#3d6b9a" stroke-width="2" stroke-dasharray="4 3"/>`; }
    }
    // suspect
    const hx = px(state.him), hy = py(state.him);
    s += `<g transform="translate(${hx} ${hy})"><circle r="12" fill="#b3202a" stroke="#1d1a16" stroke-width="2"/><g transform="rotate(${[-90, 0, 90, 180][state.hd]})"><path d="M2 -6 L11 0 L2 6Z" fill="#fff"/></g><text y="4" x="-4" font-size="10" font-weight="700" fill="#fff" font-family="sans-serif">S</text></g>`;
    const yx = px(state.you), yy = py(state.you);
    s += `<g transform="translate(${yx} ${yy})"><circle r="12" fill="#2a4a7a" stroke="#fff" stroke-width="2.5"/><text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="sans-serif">You</text></g>`;
    // clickable junctions
    for (let a = 0; a < G.N; a++) s += `<circle data-n="${a}" cx="${px(a)}" cy="${py(a)}" r="${C / 2 - 4}" fill="transparent"/>`;
    dyn.innerHTML = s;
    const left = limit - moves.length;
    const ph = G.lights.size ? `Lights change in ${every - (state.t % every)} ${every - (state.t % every) === 1 ? 'turn' : 'turns'}.` : '';
    head.textContent = `Chase ${round + 1} of ${rounds} · ${left} ${left === 1 ? 'move' : 'moves'} left of ${limit} · ${ph}`;
    undoBtn.disabled = !moves.length || finished || state.caught;
    waitBtn.disabled = state.caught || lost || finished;
    ctx.onProgress(finished ? 1 : Math.min(0.95, (round + (state.caught ? 1 : Math.min(0.8, moves.length / limit))) / rounds));
  }

  function persist() { ctx.onSave({ round, moves, attempts }); }

  function act(a) {
    if (state.caught || lost || finished) return;
    const n = R.step(state, a);
    if (!n) return;
    moves.push(a);
    state = n;
    sfx.click();
    if (n.caught) {
      sfx.good();
      if (round >= rounds - 1) {
        finished = true;
        status.textContent = `Caught him at the junction, ${moves.length} ${moves.length === 1 ? 'move' : 'moves'} in. He is not riding anywhere tonight.`;
        status.className = 'feedback is-good';
        persist();
        drawDyn();
        ctx.onProgress(1);
        ctx.onSolved();
        return;
      }
      status.textContent = `Caught in ${moves.length} ${moves.length === 1 ? 'move' : 'moves'}. He had a friend, and the friend is running.`;
      status.className = 'feedback is-good';
      nextBtn.hidden = false;
    } else if (moves.length >= limit) {
      lost = true;
      sfx.bad();
      status.textContent = 'He is gone, lost in the traffic. Undo a few moves or restart the chase.';
      status.className = 'feedback is-bad';
    } else {
      status.textContent = '';
      status.className = 'feedback';
    }
    persist();
    drawDyn();
  }
  function undo() {
    if (!moves.length || state.caught || finished) return;
    moves.pop();
    replay();
    status.textContent = '';
    status.className = 'feedback';
    persist();
    drawDyn();
  }
  function restart() {
    if (finished) return;
    if (moves.length) attempts++;
    moves = [];
    replay();
    nextBtn.hidden = true;
    status.textContent = '';
    status.className = 'feedback';
    persist();
    drawDyn();
  }
  function nextRound() {
    round++;
    moves = [];
    nextBtn.hidden = true;
    status.textContent = '';
    status.className = 'feedback';
    newRound();
    replay();
    persist();
    drawBase();
    drawDyn();
  }

  svg.addEventListener('click', (e) => {
    const n = Number(e.target.closest?.('[data-n]')?.dataset.n);
    if (Number.isNaN(n)) return;
    if (n === state.you) { act(4); return; }
    const d = [0, 1, 2, 3].find((k) => R.footOK(state.you, k) && R.nb(state.you, k) === n);
    if (d !== undefined) act(d);
  });
  svg.addEventListener('keydown', (e) => {
    const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
    if (d !== undefined) { e.preventDefault(); act(d); }
    else if (e.key === ' ' || e.key === '.') { e.preventDefault(); act(4); }
    else if (e.key === 'u' || e.key === 'Backspace') { e.preventDefault(); undo(); }
  });

  if (state.caught && round < rounds - 1) nextBtn.hidden = false;
  if (state.caught && round >= rounds - 1) finished = true;
  drawBase();
  drawDyn();

  return {
    hint() {
      if (finished || state.caught) return null;
      const left = limit - moves.length;
      const path = R.solve(state, left);
      if (!path) return 'From here he cannot be caught in time. Undo some moves or restart the chase.';
      const a = path[0];
      // also show where he will be after that move
      const n = R.step(state, a);
      return `Best move now: ${a === 4 ? 'wait a turn' : `go ${DIRN[a]}`}. ${n && !n.caught ? `He will then ride to the junction ${n.him === state.him ? 'he is on (he waits)' : `${DIRN[n.hd]} of him`}.` : 'That catches him.'}`;
    },
    devSolve() {
      for (let guard = 0; !finished && guard < rounds + 1; guard++) {
        if (state.caught) { nextRound(); continue; }
        moves = [];
        replay();
        const path = R.solve(state, 30);
        for (const a of path) act(a);
        if (!finished && state.caught) nextRound();
      }
    },
    _best: () => best,
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Catch the suspect on his motorbike before you run out of moves.',
  steps: [
    'You are the blue dot. He is the red S.',
    'Tap a dashed circle next to you to walk one block.',
    'After each of your moves, he rides one block.',
    'He follows the rules in the box. Use them to guess his move.',
    'Step onto his junction to catch him.',
  ],
  example: {
    caption: 'Tap a dashed circle to walk there. Then he rides one block, by his rules.',
    render(el) {
      const G = 70, X = 50, Y = 26;
      const px = (c) => X + c * G, py = (r) => Y + r * G;
      let s = HT.rect(8, 6, 364, 168, { fill: '#e4d8bb', stroke: 'none', sw: 0, rx: 4 });
      for (let r = 0; r < 3; r++) s += `<line x1="${px(0)}" y1="${py(r)}" x2="${px(4)}" y2="${py(r)}" stroke="#4a443b" stroke-width="16" stroke-linecap="round"/><line x1="${px(0)}" y1="${py(r)}" x2="${px(4)}" y2="${py(r)}" stroke="#f8f2e2" stroke-width="13" stroke-linecap="round"/>`;
      for (let c = 0; c < 5; c++) s += `<line x1="${px(c)}" y1="${py(0)}" x2="${px(c)}" y2="${py(2)}" stroke="#4a443b" stroke-width="16" stroke-linecap="round"/><line x1="${px(c)}" y1="${py(0)}" x2="${px(c)}" y2="${py(2)}" stroke="#f8f2e2" stroke-width="13" stroke-linecap="round"/>`;
      // a one-way arrow on one street
      s += `<g transform="translate(${(px(2) + px(3)) / 2} ${py(1)})"><path d="M-12 0 H7 M2 -5 L9 0 L2 5" fill="none" stroke="${HT.C.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      [[1, 2], [0, 1]].forEach(([c, r]) => { s += `<circle cx="${px(c)}" cy="${py(r)}" r="13" fill="#3d6b9a" fill-opacity=".14" stroke="#3d6b9a" stroke-width="2" stroke-dasharray="4 3"/>`; });
      s += HT.arrow(px(0) + 16, py(2), px(1) - 16, py(2), { sw: 3, head: 8 }) + HT.tap(px(1), py(2));
      s += `<g transform="translate(${px(3)} ${py(0)})"><circle r="12" fill="${HT.C.red}" stroke="${HT.C.ink}" stroke-width="2"/><path d="M-3 4 L4 11" stroke="none"/><text y="4" x="0" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="sans-serif">S</text></g>`;
      s += `<g transform="translate(${px(0)} ${py(2)})"><circle r="13" fill="#2a4a7a" stroke="#fff" stroke-width="2.5"/><text y="4" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="sans-serif">You</text></g>`;
      HT.put(el, HT.svg(380, 180, s, 'A street grid: you, the suspect, and the junctions you can step to'));
    },
  },
  tips: ['On foot you can use alleys and ignore arrows and lights. He cannot.', 'Undo takes back a move. Tap your own dot to wait a turn.'],
  controls: { touch: 'Tap a dashed circle to move. Tap yourself to wait.', keys: 'Click the map, then: arrow keys move, Space waits, U undoes.' },
};
