// Alibi check: suspects account for their evening, place by place. Receipts, toll records,
// CCTV stills and car park tickets put them somewhere at a given minute, and a table gives the
// night-time driving times across KL. Exactly one claim is impossible; point at it and at the
// document that breaks it. Scenarios are generated and checked so only that pair contradicts.
import { h } from '../core/ui.js';
import { shuffle, pick, randInt, mulberry32 } from '../core/rng.js';
import { sfx } from '../core/audio.js';
import { put, svg, text, rect, grid, arrow, ring, tap, chip, badge, C } from '../core/howto-kit.js';

export const meta = { id: 'alibi', name: 'Alibi Check', category: 'Profiling' };
export const demo = { variant: 'classic', params: { rounds: 3 } };

const PLACES = ['Bangsar', 'Mont Kiara', 'Brickfields', 'KLCC', 'Bukit Bintang', 'Chow Kit', 'Duta toll plaza', 'Sprint toll plaza'];
const SHORT = ['Bangsar', 'Mt Kiara', 'Brickf.', 'KLCC', 'B. Bintang', 'Chow Kit', 'Duta toll', 'Sprint toll'];
const RAW = [
  [0, 17, 8, 16, 15, 17, 12, 7],
  [17, 0, 20, 17, 21, 15, 6, 10],
  [8, 20, 0, 13, 11, 14, 14, 12],
  [16, 17, 13, 0, 7, 8, 12, 17],
  [15, 21, 11, 7, 0, 10, 16, 17],
  [17, 15, 14, 8, 10, 0, 10, 16],
  [12, 6, 14, 12, 16, 10, 0, 9],
  [7, 10, 12, 17, 17, 16, 9, 0],
];
// shortest paths, so the table is self-consistent
const TT = RAW.map((r) => [...r]);
for (let k = 0; k < 8; k++) for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) TT[i][j] = Math.min(TT[i][j], TT[i][k] + TT[k][j]);
const TOWNS = [0, 1, 2, 3, 4, 5];
const TOLLS = [6, 7];
const STAYS = {
  0: ['having supper at Restoran Sri Bangsar', 'at a friend’s flat in Bangsar', 'at the gym in Bangsar'],
  1: ['at home in Mont Kiara', 'at a condo party in Mont Kiara', 'at the club house in Mont Kiara'],
  2: ['at the office in Brickfields', 'at the temple in Brickfields', 'at my cousin’s shop in Brickfields'],
  3: ['at a bar near KLCC', 'at the cinema at KLCC', 'walking in the KLCC park'],
  4: ['at a karaoke in Bukit Bintang', 'eating on Jalan Alor, Bukit Bintang', 'at a hotel lobby in Bukit Bintang'],
  5: ['at the night market in Chow Kit', 'at my mother’s house in Chow Kit', 'at a mamak in Chow Kit'],
};
const SHOPS = {
  0: ['Restoran Sri Bangsar', 'Kedai Runcit Telawi', 'Bangsar Pharmacy'], 1: ['Mamak 24, Mont Kiara', 'Kiara Mart', 'Solaris Dry Cleaners'],
  2: ['Kopitiam Lucky, Brickfields', 'Vel’s Banana Leaf', 'Brickfields Florist'], 3: ['Skybar Lounge, KLCC', 'Cineplex, KLCC', 'Kiosk Kopi, KLCC park'],
  4: ['Jalan Alor Satay House', 'Karaoke Bintang', 'Bintang Convenience'], 5: ['Chow Kit Night Market, stall 41', 'Restoran Haji Ali', 'Kedai Ubat Chow Kit'],
};
const CARPARKS = { 1: 'Kiara Plaza car park', 3: 'Suria car park, KLCC', 4: 'Pavilion Lane car park', 0: 'Bangsar Village car park', 2: 'NU Sentral car park', 5: 'Chow Kit market car park' };
const NAMES = ['Azman Yusof', 'Lim Wei Jie', 'R. Selvam', 'Nurul Huda', 'Tan Ah Kow', 'Priya Nair', 'Hafiz Rahman', 'Wong Mei Ling', 'K. Ganesan', 'Siti Aminah', 'Chong Kar Wai', 'Farid Ismail', 'Danny Ooi', 'Kavitha Raj'];
const PLATE_L = ['WVA', 'BMK', 'VBH', 'WXY', 'BPC', 'WTT', 'VCA', 'BKR'];

export const fmt = (m) => {
  const t = 20 * 60 + m;
  let hh = Math.floor(t / 60) % 24;
  const mm = t % 60;
  const ap = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return `${hh}:${String(mm).padStart(2, '0')} ${ap}`;
};

// does a document (place, minute) make a claimed stay impossible?
export function conflicts(claim, doc) {
  if (doc.place === claim.place) return false;
  return doc.t > claim.a - TT[doc.place][claim.place] && doc.t < claim.b + TT[claim.place][doc.place];
}

function buildRound(r, nSuspects) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const names = shuffle(r, NAMES).slice(0, nSuspects);
    const people = names.map((name, i) => {
      // a true evening of three stays
      const stays = [];
      let t = randInt(r, 0, 8) * 5;
      let prev = -1;
      for (let k = 0; k < 3; k++) {
        const place = pick(r, TOWNS.filter((p) => p !== prev));
        if (k > 0) t += TT[prev][place] + randInt(r, 0, 3) * 5;
        t = Math.ceil(t / 5) * 5;
        const len = randInt(r, 7, 16) * 5;
        stays.push({ place, a: t, b: t + len, what: pick(r, STAYS[place]) });
        t += len;
        prev = place;
      }
      const plate = `${pick(r, PLATE_L)} ${randInt(r, 1000, 9899)}`;
      return { name, stays, claims: stays.map((s) => ({ ...s })), plate, docs: [], i };
    });
    const liar = people[Math.floor(r() * people.length)];
    // the lie: one boundary moved so a real document becomes impossible to reach in time
    const k = randInt(r, 0, 1);
    const X = liar.stays[k], Y = liar.stays[k + 1];
    const tt = TT[X.place][Y.place];
    let lieDoc, lieClaim;
    const shortBy = randInt(r, 3, 8);
    if (r() < 0.5) {
      // caught later than claimed: the doc is at the next place early, the claim says they stayed on
      const tDoc = Y.a + randInt(r, 0, 6);
      const b2 = Math.floor((tDoc - tt + shortBy) / 5) * 5;
      if (!(b2 > X.b && tDoc - b2 < tt && tDoc - b2 > 0)) continue;
      liar.claims[k].b = b2;
      const c2 = Math.ceil((b2 + tt + randInt(r, 0, 2) * 5) / 5) * 5;
      liar.claims[k + 1].a = Math.max(liar.claims[k + 1].a, c2);
      if (liar.claims[k + 1].a >= liar.claims[k + 1].b - 15) continue;
      lieDoc = { place: Y.place, t: tDoc, who: liar.i, lie: true };
      lieClaim = k;
    } else {
      // seen at the earlier place too late to have arrived when they say
      const tDoc = X.b - randInt(r, 0, 6);
      const c2 = Math.ceil((tDoc + tt - shortBy) / 5) * 5;
      if (!(c2 < Y.a && c2 - tDoc < tt && c2 > tDoc)) continue;
      liar.claims[k + 1].a = c2;
      liar.claims[k].b = Math.min(liar.claims[k].b, Math.floor((c2 - tt) / 5) * 5);
      if (liar.claims[k].b <= liar.claims[k].a + 10) continue;
      lieDoc = { place: X.place, t: tDoc, who: liar.i, lie: true };
      lieClaim = k + 1;
    }
    // other documents, consistent with each claimed evening; some cut it fine
    for (const p of people) {
      const n = randInt(r, 2, 3);
      for (let d = 0; d < n; d++) {
        const kind = r();
        const s = pick(r, p.claims);
        if (kind < 0.25 && p.claims.indexOf(s) < 2) {
          // a toll record on the way to the next place
          const nx = p.claims[p.claims.indexOf(s) + 1];
          const plaza = TOLLS.find((z) => TT[s.place][z] + TT[z][nx.place] <= TT[s.place][nx.place] + 4 && TT[s.place][z] + TT[z][nx.place] <= nx.a - s.b);
          if (plaza === undefined) continue;
          const lo = s.b + TT[s.place][plaza], hi = nx.a - TT[plaza][nx.place];
          p.docs.push({ place: plaza, t: randInt(r, lo, hi), who: p.i });
        } else if (kind < 0.6) {
          // tight: right at the edge of a stay
          const edge = r() < 0.5 ? s.a + randInt(r, 0, 3) : s.b - randInt(r, 0, 3);
          p.docs.push({ place: s.place, t: edge, who: p.i });
        } else p.docs.push({ place: s.place, t: randInt(r, s.a + 5, s.b - 5), who: p.i });
      }
    }
    liar.docs.push(lieDoc);
    // validate: exactly one contradicting (claim, document) pair across everyone
    const found = [];
    for (const p of people) {
      // statements must be possible on their own
      for (let c = 0; c < 2; c++) if (p.claims[c + 1].a - p.claims[c].b < TT[p.claims[c].place][p.claims[c + 1].place]) found.push(['self', p.i, c]);
      p.claims.forEach((c, ci) => p.docs.forEach((d) => { if (conflicts(c, d)) found.push([p.i, ci, d]); }));
      if (p.docs.length < 2) found.push(['few']);
    }
    if (found.length !== 1 || found[0][2] !== lieDoc || found[0][1] !== lieClaim) continue;
    // documents get their paperwork
    const docs = shuffle(r, people.flatMap((p) => p.docs)).map((d, i) => {
      const p = people[d.who];
      let type;
      if (TOLLS.includes(d.place)) type = 'toll';
      else type = pick(r, CARPARKS[d.place] ? ['receipt', 'cctv', 'parking'] : ['receipt', 'cctv']);
      return { ...d, id: i, type, shop: type === 'receipt' ? pick(r, SHOPS[d.place]) : type === 'parking' ? CARPARKS[d.place] : type === 'cctv' ? `Camera ${randInt(r, 2, 19)}, ${PLACES[d.place]}` : PLACES[d.place], plate: p.plate, amount: (randInt(r, 45, 1890) / 10).toFixed(2), card: String(randInt(r, 1000, 9999)), conf: randInt(r, 91, 99), direction: pick(r, ['northbound', 'southbound']) };
    });
    return { people, docs, liar: liar.i, lieClaim, lieDoc: docs.find((d) => d.lie).id };
  }
  throw new Error('alibi: could not build a round');
}

export function mount(el, ctx) {
  const { rng, params, saved } = ctx;
  const rounds = params.rounds || 3;
  const seed = Math.floor(rng() * 2 ** 31);
  let round = saved?.round || 0;
  let wrong = saved?.wrong || 0;
  let hintLv = saved?.hintLv || 0;
  let selClaim = null; // [person, claim]
  let selDoc = null;
  let finished = false;
  let S = null;

  const status = h('p', { class: 'feedback' });
  const head = h('p', { class: 'doc ab-head' });
  const stmts = h('div', { class: 'ab-stmts' });
  const docsEl = h('div', { class: 'ab-docs' });
  const tableWrap = h('div', { class: 'ab-tablewrap' });
  const register = h('ul', { class: 'ab-register doc' });
  const flagBtn = h('button', { class: 'btn btn--primary', onclick: () => flag() }, 'Flag the contradiction');
  const nextBtn = h('button', { class: 'btn btn--primary', hidden: true, onclick: () => { round++; hintLv = 0; build(); persist(); render(); } }, 'Next case');
  const sel = h('p', { class: 'doc ab-sel' });
  el.append(
    h('p', { class: 'game-rules' }, `One claim below cannot be true. Click that claim, then the document that proves it impossible, then flag it. Driving times are for the fastest route at night; nobody can beat them, but anyone can take longer. ${rounds} cases.`),
    head,
    h('div', { class: 'ab-layout' },
      h('section', {}, h('h3', { class: 'ab-h' }, 'Statements'), stmts),
      h('section', {}, h('h3', { class: 'ab-h' }, 'Evidence'), docsEl,
        h('h3', { class: 'ab-h' }, 'Night driving times (minutes)'), tableWrap,
        h('h3', { class: 'ab-h' }, 'Vehicle register'), register)),
    h('div', { class: 'ab-bar' }, sel, h('div', { class: 'game-toolbar' }, flagBtn, nextBtn)),
    status,
  );

  // travel table
  const tbl = h('table', { class: 'ab-table doc' },
    h('tr', {}, h('th', {}, ''), SHORT.map((s) => h('th', { scope: 'col' }, s))),
    PLACES.map((p, i) => h('tr', {}, h('th', { scope: 'row' }, SHORT[i]), PLACES.map((_, j) => h('td', { class: i === j ? 'is-self' : '' }, i === j ? '–' : String(TT[i][j]))))));
  tableWrap.append(tbl);

  function build() {
    const n = round === 0 ? 4 : 5;
    S = buildRound(mulberry32(seed + round * 6151), n);
    selClaim = null; selDoc = null;
  }
  function persist() { ctx.onSave({ round, wrong, hintLv }); }

  function docCard(d) {
    const p = S.people[d.who];
    const t = fmt(d.t);
    let body;
    if (d.type === 'receipt') body = [h('b', {}, d.shop), h('span', {}, `${t}`), h('span', {}, `Total RM ${d.amount}`), h('span', {}, `Card ending ${d.card}`), h('span', {}, `Cardholder: ${p.name}`)];
    else if (d.type === 'toll') body = [h('b', {}, `${PLACES[d.place]}, ${d.direction}`), h('span', {}, `Passed ${t}`), h('span', {}, `Vehicle ${d.plate}`), h('span', {}, 'Class 1, Touch n Go')];
    else if (d.type === 'parking') body = [h('b', {}, d.shop), h('span', {}, `Exit barrier ${t}`), h('span', {}, `Plate read: ${d.plate}`)];
    else body = [h('b', {}, d.shop), h('span', {}, `Frame time ${t}`), h('span', {}, `Face match: ${p.name} (${d.conf}%)`)];
    const label = { receipt: 'Receipt', toll: 'Toll record', parking: 'Car park ticket', cctv: 'CCTV still' }[d.type];
    const b = h('button', { class: `ab-doc ab-doc--${d.type}${selDoc === d.id ? ' is-sel' : ''}`, 'aria-pressed': String(selDoc === d.id), onclick: () => { selDoc = selDoc === d.id ? null : d.id; sfx.click(); render(); } },
      h('small', {}, `${label} #${d.id + 1}`), ...body);
    if (d.type === 'cctv') b.prepend(h('i', { class: 'ab-cam', 'aria-hidden': 'true' }, t));
    return b;
  }

  function render() {
    head.textContent = `Case ${Math.min(round + 1, rounds)} of ${rounds} · ${wrong} wrong ${wrong === 1 ? 'flag' : 'flags'}`;
    stmts.innerHTML = '';
    S.people.forEach((p, pi) => {
      const card = h('article', { class: `ab-stmt${hintLv >= 1 && pi === S.liar ? ' is-hinted' : ''}` }, h('h4', {}, p.name), h('p', { class: 'ab-plate doc' }, `Drives ${p.plate}`));
      p.claims.forEach((c, ci) => {
        const on = selClaim && selClaim[0] === pi && selClaim[1] === ci;
        card.append(h('button', { class: `ab-claim${on ? ' is-sel' : ''}`, 'aria-pressed': String(!!on), onclick: () => { selClaim = on ? null : [pi, ci]; sfx.click(); render(); } },
          `${ci === 0 ? 'From' : 'Then from'} ${fmt(c.a)} to ${fmt(c.b)} I was ${c.what}.`));
      });
      stmts.append(card);
    });
    docsEl.innerHTML = '';
    S.docs.forEach((d) => { const c = docCard(d); if (hintLv >= 2 && d.id === S.lieDoc) c.classList.add('is-hinted'); docsEl.append(c); });
    register.innerHTML = '';
    S.people.forEach((p) => register.append(h('li', {}, h('b', {}, p.plate), ` ${p.name}`)));
    const cTxt = selClaim ? `${S.people[selClaim[0]].name}, claim ${selClaim[1] + 1}` : 'no claim';
    sel.textContent = `Selected: ${cTxt}; ${selDoc != null ? `document #${selDoc + 1}` : 'no document'}.`;
    flagBtn.disabled = !selClaim || selDoc == null || finished;
    flagBtn.hidden = !nextBtn.hidden || finished;
    ctx.onProgress(finished ? 1 : round / rounds);
  }

  function flag() {
    if (!selClaim || selDoc == null || finished) return;
    const [pi, ci] = selClaim;
    const d = S.docs.find((x) => x.id === selDoc);
    const claim = S.people[pi].claims[ci];
    const ok = d.who === pi && conflicts(claim, d);
    if (ok) {
      sfx.good();
      const need = TT[d.place][claim.place];
      const explain = `${S.people[pi].name} was at ${PLACES[d.place]} at ${fmt(d.t)}, and ${PLACES[claim.place]} is ${need} minutes away. The claim cannot be true.`;
      if (round >= rounds - 1) {
        finished = true;
        status.textContent = `${explain} That is the alibi that falls apart.`;
        status.className = 'feedback is-good';
        persist();
        render();
        ctx.onProgress(1);
        ctx.onSolved();
        return;
      }
      status.textContent = explain;
      status.className = 'feedback is-good';
      nextBtn.hidden = false;
      render();
      return;
    }
    wrong++;
    sfx.bad();
    status.textContent = d.who !== pi
      ? 'That document is about someone else. It cannot break this claim.'
      : 'Check the times again: with the driving table, that claim and that document can both be true.';
    status.className = 'feedback is-bad';
    persist();
    render();
  }

  build();
  render();
  return {
    hint() {
      if (finished || !nextBtn.hidden) return null;
      hintLv = Math.min(2, hintLv + 1);
      persist();
      render();
      return hintLv === 1 ? `Look hard at ${S.people[S.liar].name}'s statement.` : `Document #${S.lieDoc + 1} is the one that breaks it.`;
    },
    devSolve() {
      for (let g = 0; !finished && g < rounds + 1; g++) {
        if (!nextBtn.hidden) { nextBtn.hidden = true; round++; hintLv = 0; build(); }
        const d = S.docs.find((x) => x.id === S.lieDoc);
        selClaim = [S.liar, S.people[S.liar].claims.findIndex((c) => conflicts(c, d))];
        selDoc = S.lieDoc;
        flag();
      }
    },
    _answer: () => ({ liar: S.liar, claim: S.lieClaim, doc: S.lieDoc }),
  };
}

// ---------- How to play (see core/howto.js) ----------
export const howTo = {
  goal: 'Find the one statement that cannot be true.',
  steps: [
    'Read each statement: where the person says they were, and when.',
    'Check the evidence: receipts, toll records, CCTV and parking tickets.',
    'Look for a person shown somewhere else at the same time.',
    'The driving table shows the fastest time between two places.',
    'Tap the false claim, then the document, then Flag the contradiction.',
  ],
  example: {
    caption: 'Ali says he was in Bangsar until 11:00. But his card paid in KLCC at 10:30. That claim cannot be true.',
    render(el) {
      let s = rect(8, 8, 174, 92, { fill: '#f6e3a8', stroke: C.red, sw: 2.5, rx: 4 });
      s += text(20, 30, 'Ali', { size: 16, weight: 800, anchor: 'start', font: 'display' }) + text(20, 54, '"From 10:00 to 11:00', { size: 13, anchor: 'start', font: 'doc' }) + text(20, 74, 'I was in Bangsar."', { size: 13, anchor: 'start', font: 'doc' });
      s += rect(198, 8, 174, 92, { fill: '#fffdf6', stroke: C.red, sw: 2.5, rx: 4 });
      s += text(210, 28, 'Receipt #3', { size: 11, anchor: 'start', fill: C.soft }) + text(210, 50, 'Kedai Kopi, KLCC', { size: 13, weight: 700, anchor: 'start' }) + text(210, 70, '10:30 PM', { size: 13, anchor: 'start', font: 'doc' }) + text(210, 90, 'Cardholder: Ali', { size: 13, anchor: 'start', font: 'doc' });
      s += badge(190, 54, false, 14);
      s += chip(70, 116, 240, 32, 'Bangsar to KLCC: 16 min', { size: 13, fill: '#efe6d0' });
      put(el, svg(380, 156, s, 'Ali claims Bangsar but his card paid in KLCC at the same time'));
    },
  },
  tips: ['Car plates tell you whose car passed a toll: see the Vehicle register.', 'Nobody can beat the driving table, but anyone can take longer.'],
  controls: { touch: 'Tap a claim, tap a document, then Flag.', keys: 'Mouse: click a claim, a document, then Flag.' },
};
