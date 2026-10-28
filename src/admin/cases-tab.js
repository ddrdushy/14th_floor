// Admin "Cases" tab: one case in depth. Puzzle-by-puzzle funnel with drop-off, median / average /
// 90th-percentile solve time and hints (the three hardest puzzles and the biggest drop-off are
// marked), where unfinished players stopped, the verdicts, whom players charge, the answers to the
// extra questions, and openings / closings per day. Data: GET /api/admin/cases?case=<id>.
import {
  h, CASES, fmtN, fmt1, pct, fmtDuration, fmtSpan, isBranch, caseIds, caseTitle, cname, suspectName,
  verdictText, okPill, pill, barCell, table, empty, loading, sectionHead, lastDays, tzMinutes,
} from './util.js';
import { barChart, columnChart } from './charts.js';

const MIN_PLAYERS = 3; // a puzzle needs this many solvers before it can be called one of the hardest

/** Mount into `el`. ctx: { api, explain, stamp, withDev(), caseId, onPick(id) }. Returns { destroy }. */
export function renderCasesTab(el, ctx) {
  let charts = [];
  const destroy = () => { charts.forEach((c) => c.destroy()); charts = []; };
  const ids = caseIds();
  const caseId = ids.includes(ctx.caseId) ? ctx.caseId : ids[0];
  const btns = ids.map((id) => h('button', { type: 'button', 'aria-pressed': String(id === caseId), onclick: () => ctx.onPick(id) }, cname(id)));
  const body = h('div', {}, loading('Loading the case file…'));
  el.replaceChildren(
    sectionHead('Cases', 'Pick a case: where players stop, which puzzles are hardest, and whom they charge'),
    h('div', { class: 'toolbar' }, h('div', { class: 'seg', role: 'group', 'aria-label': 'Case' }, btns)),
    body);

  (async () => {
    try {
      const d = await ctx.api(`/admin/cases?case=${encodeURIComponent(caseId)}&tz=${tzMinutes()}${ctx.withDev() ? '&dev=1' : ''}`);
      ctx.stamp();
      destroy();
      charts = render(body, d, caseId);
    } catch (err) {
      if (err.status !== 401) body.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, ctx.explain(err)));
    }
  })();
  return { destroy };
}

function render(body, d, caseId) {
  const charts = [];
  const c = CASES[caseId];
  const t = d.totals || {};
  const stats = new Map(d.levels.map((r) => [r.level_id, r]));
  const stops = new Map(d.stops.map((r) => [r.level_id, r]));
  const levels = c ? [...c.levels] : [];
  for (const id of stats.keys()) if (!levels.some((l) => l.id === id)) levels.push({ id, title: id, phase: 'not in this build' });

  if (!t.opened) {
    body.replaceChildren(h('div', { class: 'note' }, `Nobody has opened ${caseTitle(caseId)} yet.`));
    return charts;
  }

  // drop-off against the previous non-branch puzzle; hardest = highest median time
  let prev = t.opened;
  const rows = levels.map((l, i) => {
    const s = stats.get(l.id) || { players: 0 };
    const branch = isBranch(l);
    const drop = !branch && prev ? 1 - s.players / prev : null;
    const prevN = prev;
    if (!branch) prev = s.players;
    return { l, i, s, branch, drop, prevN, stop: stops.get(l.id) };
  });
  const closeDrop = prev ? 1 - t.closed / prev : null;
  const hardest = rows.filter((r) => r.s.players >= Math.min(MIN_PLAYERS, Math.max(1, t.opened))).sort((a, b) => (b.s.medTime || 0) - (a.s.medTime || 0)).slice(0, 3);
  const hardRank = new Map(hardest.map((r, k) => [r.l.id, k + 1]));
  const drops = rows.filter((r) => r.drop != null && r.prevN >= 2);
  const biggest = drops.length ? drops.reduce((a, b) => (b.drop > a.drop ? b : a)) : null;
  const biggestId = biggest && biggest.drop > 0 ? biggest.l.id : null;
  const closeIsBiggest = closeDrop != null && closeDrop > 0 && (!biggestId || closeDrop > biggest.drop);

  const kpis = h('div', { class: 'case-kpis' },
    h('span', {}, h('b', {}, fmtN(t.opened)), 'opened'),
    h('span', {}, h('b', {}, fmtN(t.closed)), `closed (${pct(t.closed, t.opened)})`),
    h('span', {}, h('b', {}, pct(t.correct, t.closed)), 'correct verdicts'),
    h('span', {}, h('b', {}, t.closed ? fmtDuration(t.medTime) : '–'), 'median puzzle time per closed case'),
    h('span', {}, h('b', {}, t.closed ? fmt1(t.medHints) : '–'), 'median hints'),
    h('span', {}, h('b', {}, t.closed ? fmtSpan(t.medSpan) : '–'), 'median from opening to verdict'),
    h('span', {}, h('b', {}, fmtN(t.open)), `still open${t.openStale ? `, ${fmtN(t.openStale)} quiet 3+ days` : ''}`));

  // headline cards
  const lvTitle = (r) => `${r.i + 1}. ${r.l.title}`;
  const callouts = h('div', { class: 'callouts' },
    hardest.map((r, k) => h('div', { class: 'callout' },
      h('div', { class: 'callout-k' }, `Hardest #${k + 1}`),
      h('div', { class: 'callout-t' }, lvTitle(r)),
      h('div', { class: 'callout-n' }, `median ${fmtDuration(r.s.medTime)} · ${fmt1(r.s.avgHints)} hints avg · ${pct(r.s.hinted, r.s.players)} used a hint`))),
    biggestId || closeIsBiggest ? h('div', { class: 'callout callout--drop' },
      h('div', { class: 'callout-k' }, 'Biggest drop-off'),
      h('div', { class: 'callout-t' }, closeIsBiggest ? 'Deduction room' : lvTitle(biggest)),
      h('div', { class: 'callout-n' }, closeIsBiggest
        ? `${Math.round(closeDrop * 100)}% who solved every puzzle have not made their charges`
        : `${Math.round(biggest.drop * 100)}% of the ${fmtN(biggest.prevN)} who solved the puzzle before did not solve this one`)) : null);

  // funnel table
  const trs = rows.map((r) => {
    const { l, i, s, branch, drop, stop } = r;
    const rank = hardRank.get(l.id);
    const isDrop = l.id === biggestId && !closeIsBiggest;
    return h('tr', { class: rank ? 'is-hard' : null },
      h('td', { class: 'r muted' }, String(i + 1)),
      h('th', { scope: 'row' }, l.title,
        branch ? h('span', { class: 'branch', title: 'Only some players get this puzzle, depending on earlier verdicts' }, 'branch') : null,
        rank ? pill(`hard #${rank}`, 'bad') : null,
        isDrop ? pill('biggest drop', 'warn') : null,
        h('span', { class: 'phase' }, `${l.phase || ''}${l.game ? ` · ${l.game}` : ''}`)),
      h('td', {}, barCell(s.players, t.opened)),
      h('td', { class: 'r' }, pct(s.players, t.opened)),
      h('td', { class: `r${drop != null && (drop >= 0.25 || isDrop) ? ' drop-hi' : ''}` }, drop == null ? '–' : `${Math.round(drop * 100)}%`),
      h('td', { class: 'r' }, s.players ? fmtDuration(s.medTime) : '–'),
      h('td', { class: 'r hide-sm' }, s.players ? fmtDuration(s.avgTime) : '–'),
      h('td', { class: 'r hide-sm' }, s.players ? fmtDuration(s.p90Time) : '–'),
      h('td', { class: 'r' }, s.players ? fmt1(s.avgHints) : '–'),
      h('td', { class: 'r hide-sm' }, s.players ? pct(s.hinted, s.players) : '–'),
      h('td', { class: 'r' }, stop ? h('span', { title: `${stop.n} with the case still open stopped after this puzzle; ${stop.stale} of them quiet for 3+ days` }, fmtN(stop.n), stop.stale ? h('span', { class: 'muted' }, ` (${fmtN(stop.stale)} quiet)`) : null) : '–'));
  });
  trs.push(h('tr', {},
    h('td', { class: 'r muted' }, '⚖'),
    h('th', { scope: 'row' }, 'Deduction room: case closed', closeIsBiggest ? pill('biggest drop', 'warn') : null, h('span', { class: 'phase' }, 'charges made')),
    h('td', {}, barCell(t.closed, t.opened)),
    h('td', { class: 'r' }, pct(t.closed, t.opened)),
    h('td', { class: `r${closeDrop != null && (closeDrop >= 0.25 || closeIsBiggest) ? ' drop-hi' : ''}` }, closeDrop == null ? '–' : `${Math.round(closeDrop * 100)}%`),
    h('td', { class: 'r' }, t.closed ? fmtDuration(t.medTime) : '–'),
    h('td', { class: 'r hide-sm' }, t.closed ? fmtDuration(t.avgTime) : '–'),
    h('td', { class: 'r hide-sm' }, '–'),
    h('td', { class: 'r' }, t.closed ? fmt1(t.avgHints) : '–'),
    h('td', { class: 'r hide-sm' }, '–'),
    h('td', { class: 'r' }, t.openNoSolve ? h('span', { title: 'Opened the case but solved no puzzle yet' }, `${fmtN(t.openNoSolve)} before #1`) : '–')));
  const funnel = h('div', { class: 'card card--wide' },
    h('h3', {}, 'Puzzle funnel'),
    h('p', { class: 'sub' }, `Players who solved each puzzle, out of the ${fmtN(t.opened)} who opened the case. Drop-off is against the previous puzzle (25% or more in red). "Stopped after" counts players with the case still open whose latest solve is that puzzle. The last row's time and hints are whole-case figures.`),
    table(`Puzzle funnel for ${caseTitle(caseId)}`, [
      { label: '#', cls: 'r' }, { label: 'Puzzle' }, { label: 'Solved by' }, { label: 'Of opened', cls: 'r' }, { label: 'Drop-off', cls: 'r' },
      { label: 'Median', cls: 'r', title: 'Median solve time' }, { label: 'Avg', cls: 'r hide-sm', title: 'Average solve time' },
      { label: '90th %', cls: 'r hide-sm', title: '90% of players solved it faster than this' }, { label: 'Hints', cls: 'r', title: 'Average hints' },
      { label: 'Used hints', cls: 'r hide-sm', title: 'Share of solvers who used at least one hint' }, { label: 'Stopped after', cls: 'r' },
    ], trs));

  // median time per puzzle, hardest flagged
  const timeBox = h('div');
  const timed = rows.filter((r) => r.s.players);
  const timeCard = h('div', { class: 'card' },
    h('h3', {}, 'Median solve time per puzzle'),
    h('p', { class: 'sub' }, 'The three hardest are in red. Hover or focus a bar for the solver count.'),
    timed.length ? timeBox : empty('No puzzle solved yet.'));

  // verdicts
  const vs = d.verdicts;
  const vmax = Math.max(1, ...vs.map((v) => v.n));
  const verdicts = h('div', { class: 'card' },
    h('h3', {}, 'Verdicts'),
    h('p', { class: 'sub' }, t.closed ? `${fmtN(t.closed)} closed files, ${pct(t.correct, t.closed)} correct` : 'Nobody has closed this case yet.'),
    vs.length ? table(`Verdicts for ${caseTitle(caseId)}`, [{ label: 'Charged' }, { label: 'Players' }, { label: 'Share', cls: 'r' }, { label: 'Verdict' }],
      vs.map((v) => {
        const vt = verdictText(caseId, v.charged, v.answers);
        return h('tr', {},
          h('th', { scope: 'row' }, vt.who, vt.extra ? h('span', { class: 'phase' }, vt.extra) : null),
          h('td', {}, barCell(v.n, vmax)),
          h('td', { class: 'r' }, pct(v.n, t.closed)),
          h('td', {}, okPill(v.correct)));
      })) : null);

  // whom players charge, and how the right verdicts treat each suspect
  const right = vs.filter((v) => v.correct);
  const rightN = right.reduce((a, v) => a + v.n, 0);
  const suspects = [...new Set([...(c?.suspects || []).map((s) => s.id), ...vs.flatMap((v) => v.charged)])];
  const chargeRows = suspects.map((id) => {
    const n = vs.filter((v) => v.charged.includes(id)).reduce((a, v) => a + v.n, 0);
    const inRight = right.filter((v) => v.charged.includes(id)).reduce((a, v) => a + v.n, 0);
    let role = null;
    if (rightN) role = inRight === rightN ? pill('in every correct verdict', 'good') : inRight === 0 ? pill('never in a correct verdict', 'plain') : pill('in some correct verdicts', 'plain');
    return { id, n, role };
  }).sort((a, b) => b.n - a.n);
  const charged = h('div', { class: 'card' },
    h('h3', {}, 'Who gets charged'),
    h('p', { class: 'sub' }, 'Share of closed files naming each suspect. The tag comes from the verdicts the server marked correct.'),
    t.closed ? table(`Suspects charged in ${caseTitle(caseId)}`, [{ label: 'Suspect' }, { label: 'Charged by' }, { label: 'Share', cls: 'r' }, { label: 'Correct verdicts', cls: 'hide-sm' }],
      chargeRows.map((r) => h('tr', {},
        h('th', { scope: 'row' }, suspectName(caseId, r.id)),
        h('td', {}, barCell(r.n, t.closed)),
        h('td', { class: 'r' }, pct(r.n, t.closed)),
        h('td', { class: 'hide-sm' }, r.role || '–')))) : empty('No charges yet.'));

  // extra questions
  const qs = c?.deduction?.questions || [];
  const qCards = qs.map((q) => {
    const counts = new Map();
    let answered = 0;
    for (const v of vs) {
      const a = v.answers[q.id];
      if (!a) continue;
      answered += v.n;
      counts.set(a, (counts.get(a) || 0) + v.n);
    }
    const rightAns = new Set(right.map((v) => v.answers[q.id]).filter(Boolean));
    const opts = [...q.options.map((o) => ({ id: o.id, label: o.label })), ...[...counts.keys()].filter((k) => !q.options.some((o) => o.id === k)).map((k) => ({ id: k, label: k }))];
    const max = Math.max(1, ...counts.values());
    return h('div', { class: 'card' },
      h('h3', {}, q.q),
      h('p', { class: 'sub' }, answered ? `${fmtN(answered)} answers` : 'No answers yet.'),
      answered ? table(`Answers to "${q.q}"`, [{ label: 'Answer' }, { label: 'Players' }, { label: 'Share', cls: 'r' }],
        opts.map((o) => h('tr', {},
          h('th', { scope: 'row' }, o.label, rightAns.size === 1 && rightAns.has(o.id) ? pill('✓ right', 'good') : null),
          h('td', {}, barCell(counts.get(o.id) || 0, max)),
          h('td', { class: 'r' }, pct(counts.get(o.id) || 0, answered))))) : null);
  });

  // openings and closings per day
  const days = lastDays(d.generatedAt, d.tz, 30);
  const om = new Map(d.opensPerDay.map((r) => [r.day, r.n]));
  const cm = new Map(d.closesPerDay.map((r) => [r.day, r.n]));
  const flowBox = h('div');
  const flowCard = h('div', { class: 'card card--wide' },
    h('h3', {}, 'Opened and closed per day'),
    h('p', { class: 'sub' }, 'Last 30 days, by your local date'),
    flowBox);

  body.replaceChildren(
    kpis,
    callouts,
    h('div', { class: 'grid-2' }, funnel),
    h('div', { class: 'grid-2 mt' }, timeCard, h('div', { class: 'stack' }, verdicts, charged, ...qCards)),
    h('div', { class: 'grid-2 mt' }, flowCard));

  if (timed.length) {
    charts.push(barChart(timeBox, timed.map((r) => ({
      label: `${r.i + 1}. ${r.l.title}`, value: r.s.medTime || 0, hot: hardRank.has(r.l.id),
      note: `${fmtN(r.s.players)} solvers · avg ${fmtDuration(r.s.avgTime)}`,
    })), { title: 'Median solve time per puzzle', labelWidth: 220, barHeight: 16, valueLabel: (v) => fmtDuration(v) }));
  }
  charts.push(columnChart(flowBox, days, [
    { name: 'Opened', values: days.map((x) => om.get(x.iso) || 0), cls: 'c-s1' },
    { name: 'Closed', values: days.map((x) => cm.get(x.iso) || 0), cls: 'c-s2' },
  ], { mode: 'group', height: 200, title: 'Cases opened and closed per day', valueLabel: (v) => fmtN(v) }));
  return charts;
}
