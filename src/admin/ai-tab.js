// Admin "AI" tab: the AI games from ai_log. Calls per day by kind, latency (average and 95th
// percentile), error and block rates, per-model numbers, interrogation outcomes per level, blocked
// inputs, a searchable log of recent calls, and a test bench for comparing models on a real suspect
// (POST /api/admin/ai-lab). Also exports renderTranscript() for a player's page.
import {
  h, CASES, CASE_ORDER, fmtN, fmt1, pct, fmtMs, shortTime, ago, levelName, levelOf, cname, caseIds,
  pill, kpi, barCell, table, empty, loading, sectionHead, select, lastDays, tzMinutes,
} from './util.js';
import { columnChart } from './charts.js';

const KIND_LABEL = { ask: 'Typed question', topic: 'Topic chip', confront: 'Evidence card', judge: 'Theory judged' };
const KIND_SHORT = { ask: 'Typed', topic: 'Topic', confront: 'Card', judge: 'Theory' };
const KIND_ORDER = ['ask', 'topic', 'confront', 'judge'];
const SERIES = ['c-s1', 'c-s2', 'c-s3', 'c-s4', 'c-s5'];
const state = { days: 30, q: '', kind: '', flag: '', level: '', offset: 0, limit: 25 };
const bench = { runs: [], models: null };

const levelLabel = (caseId, levelId) => {
  const n = levelName(caseId, levelId);
  return `${cname(caseId)} · ${n && n !== levelId ? n : levelId || '–'}`;
};

/** The suspect sheet of an interrogation level, or null. */
const paramsOf = (caseId, levelId) => levelOf(caseId, levelId)?.params || null;

/** A readable version of what the player sent. */
export function describeInput(r) {
  const p = paramsOf(r.case_id, r.level_id);
  if (r.kind === 'confront') {
    const m = /^(\w+) \+ (\w+)$/.exec(r.input || '');
    if (m && p) {
      const claim = [...(p.facts || []), ...(p.lies || [])].find((x) => x.id === m[1]);
      const ev = (p.evidence || []).find((x) => x.id === m[2]);
      return `Showed "${ev?.title || m[2]}" against the claim about ${claim?.topic || m[1]}`;
    }
  }
  return r.input || '';
}

/** The reply text, and claim labels, from a log row's output. */
export function describeOutput(r) {
  const o = r.output;
  if (o == null) return { text: '', claims: [] };
  if (typeof o === 'string') return { text: o, claims: [] };
  const p = paramsOf(r.case_id, r.level_id);
  const claims = (Array.isArray(o.claims) ? o.claims : []).map((id) => {
    const x = p && [...(p.facts || []), ...(p.lies || [])].find((y) => y.id === id);
    return x ? `${id}: ${x.topic}${(p.lies || []).includes(x) ? ' (lie)' : ''}` : id;
  });
  if (typeof o.reply === 'string') return { text: o.reply, claims };
  // a judgement or anything else: its fields, short
  const text = Object.entries(o).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ');
  return { text, claims };
}

export function flagPill(r) {
  if (!r.ok) return pill('error', 'bad', 'The model call failed; the player got the case-file answer');
  const f = r.flag || '';
  if (f.startsWith('blocked:')) {
    const [, why, p] = f.split(':');
    return pill(`blocked: ${why}${p ? ` ${Math.round(Number(p) * 100)}%` : ''}`, 'bad', `Screened out before reaching the player (${f})`);
  }
  if (f === 'broken') return pill('broke the lie', 'good');
  if (f === 'wrong_card') return pill('wrong card', 'warn');
  return f ? pill(f, 'plain') : null;
}

/** Mount the AI tab into `el`. ctx: { api, explain, stamp, withDev() }. Returns { destroy }. */
export function renderAiTab(el, ctx) {
  let charts = [];
  const destroy = () => { charts.forEach((c) => c.destroy()); charts = []; };
  const daysSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Period' },
    [7, 30, 90].map((n) => h('button', { type: 'button', 'aria-pressed': String(n === state.days), onclick: () => { state.days = n; state.offset = 0; destroy(); renderAiTab(el, ctx); } }, `${n} days`)));
  const stats = h('div', {}, loading('Loading the AI log…'));
  const logCard = h('div', { class: 'card' });
  const benchCard = h('div', { class: 'card' });
  el.replaceChildren(
    sectionHead('AI', 'Every call the AI games made: interrogations now, theory judging when it ships', daysSeg),
    stats,
    sectionHead('Recent calls', 'Search what players typed and what the suspects said'),
    logCard,
    sectionHead('Test bench', 'Ask a real suspect one question with any model, to compare before changing AI_MODEL'),
    benchCard);

  let levelsSeen = [];
  (async () => {
    try {
      const d = await ctx.api(`/admin/ai?days=${state.days}&tz=${tzMinutes()}${ctx.withDev() ? '&dev=1' : ''}`);
      ctx.stamp();
      levelsSeen = d.levels;
      charts = renderStats(stats, d);
      renderLog(logCard, ctx, d);
    } catch (err) {
      if (err.status !== 401) stats.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, ctx.explain(err)));
      renderLog(logCard, ctx, { byKind: [], levels: levelsSeen });
    }
  })();
  renderBench(benchCard, ctx);
  return { destroy };
}

function renderStats(box, d) {
  const charts = [];
  const t = d.totals || {};
  if (!t.calls) {
    box.replaceChildren(h('div', { class: 'note' }, `No AI calls in the last ${d.days} days. They appear here once players reach an AI level (Case 5, "Your floor, Zul") on a server with AI_API_KEY or a Workers AI binding.`));
    return charts;
  }
  const kinds = [...new Set([...KIND_ORDER.filter((k) => d.byKind.some((r) => r.kind === k)), ...d.byKind.map((r) => r.kind)])];
  const kpis = h('div', { class: 'kpis' },
    kpi('AI calls', fmtN(t.calls), `${fmtN(t.last24h)} in the last 24 hours`, { accent: true }),
    kpi('Players', fmtN(t.players), 'who talked to an AI suspect'),
    kpi('Average reply', fmtMs(t.avgMs), 'successful calls'),
    kpi('95th percentile', fmtMs(t.p95Ms), '1 in 20 replies is slower'),
    kpi('Errors', pct(t.errors, t.calls), `${fmtN(t.errors)} failed; case-file answer used`),
    kpi('Blocked inputs', fmtN(t.blocked), `${pct(t.blocked, t.calls)} of calls screened out`));

  const days = lastDays(d.generatedAt, d.tz, d.days);
  const per = new Map();
  for (const r of d.perDay) per.set(`${r.day}|${r.kind}`, r.n);
  const chartBox = h('div');
  const perDay = h('div', { class: 'card card--wide' },
    h('h3', {}, 'Calls per day'),
    h('p', { class: 'sub' }, `Last ${d.days} days by your local date, stacked by kind`),
    chartBox);

  const kindRows = d.byKind.map((r) => h('tr', {},
    h('th', { scope: 'row' }, KIND_LABEL[r.kind] || r.kind, h('span', { class: 'phase mono' }, r.kind)),
    h('td', { class: 'r' }, fmtN(r.n)),
    h('td', { class: 'r hide-sm' }, fmtN(r.players)),
    h('td', { class: 'r' }, fmtMs(r.avgMs)),
    h('td', { class: 'r' }, fmtMs(r.p95Ms)),
    h('td', { class: `r${r.errors ? ' drop-hi' : ''}` }, pct(r.errors, r.n)),
    h('td', { class: 'r' }, fmtN(r.blocked))));
  const byKind = h('div', { class: 'card' },
    h('h3', {}, 'By kind'),
    h('p', { class: 'sub' }, 'Latency counts successful calls only'),
    table('AI calls by kind', [{ label: 'Kind' }, { label: 'Calls', cls: 'r' }, { label: 'Players', cls: 'r hide-sm' }, { label: 'Avg', cls: 'r' }, { label: 'p95', cls: 'r' }, { label: 'Errors', cls: 'r' }, { label: 'Blocked', cls: 'r' }], kindRows));
  const modelRows = d.byModel.map((r) => h('tr', {},
    h('th', { scope: 'row', class: 'mono' }, r.model),
    h('td', { class: 'r' }, fmtN(r.n)),
    h('td', { class: 'r' }, fmtMs(r.avgMs)),
    h('td', { class: 'r' }, fmtMs(r.p95Ms)),
    h('td', { class: `r${r.errors ? ' drop-hi' : ''}` }, pct(r.errors, r.n)),
    h('td', { class: 'hide-sm' }, ago(r.lastAt))));
  const byModel = h('div', { class: 'card' },
    h('h3', {}, 'By model'),
    h('p', { class: 'sub' }, 'Which model answered, as logged with each call'),
    table('AI calls by model', [{ label: 'Model' }, { label: 'Calls', cls: 'r' }, { label: 'Avg', cls: 'r' }, { label: 'p95', cls: 'r' }, { label: 'Errors', cls: 'r' }, { label: 'Last used', cls: 'hide-sm' }], modelRows));

  // outcomes per level
  const lvl = [...d.levels].sort((a, b) => CASE_ORDER.indexOf(a.case_id) - CASE_ORDER.indexOf(b.case_id) || String(a.level_id).localeCompare(b.level_id));
  const lvRows = lvl.map((r) => {
    const judged = r.judged > 0 && !r.questions && !r.confronts;
    return h('tr', {},
      h('th', { scope: 'row' }, levelLabel(r.case_id, r.level_id), h('span', { class: 'phase' }, levelOf(r.case_id, r.level_id)?.game || (judged ? 'theory' : ''))),
      h('td', { class: 'r' }, fmtN(r.players)),
      h('td', { class: 'r' }, judged ? '–' : fmtN(r.questions)),
      h('td', { class: 'r hide-sm' }, judged ? '–' : fmt1(r.questions / Math.max(1, r.players))),
      h('td', {}, judged ? h('span', { class: 'muted' }, `${fmtN(r.judged)} theories judged`) : barCell(r.broke, r.players, `${fmtN(r.broke)} · ${pct(r.broke, r.players)}`, 'bar-cell--good')),
      h('td', { class: 'r' }, judged ? '–' : `${fmtN(r.wrongCards)}${r.wrongPlayers ? ` (${fmtN(r.wrongPlayers)} pl.)` : ''}`),
      h('td', { class: 'r' }, fmtN(r.blocked)),
      h('td', { class: `r${r.errors ? ' drop-hi' : ''}` }, fmtN(r.errors)));
  });
  const levels = h('div', { class: 'card card--wide' },
    h('h3', {}, 'Outcomes per level'),
    h('p', { class: 'sub' }, '"Broke the lie": players who put the right evidence card against the lie. Wrong cards: cards shown that did not break it (players who showed one).'),
    table('AI outcomes per level', [{ label: 'Level' }, { label: 'Players', cls: 'r' }, { label: 'Questions', cls: 'r' }, { label: 'Per player', cls: 'r hide-sm' },
      { label: 'Broke the lie' }, { label: 'Wrong cards', cls: 'r' }, { label: 'Blocked', cls: 'r' }, { label: 'Errors', cls: 'r' }], lvRows));

  // blocked inputs
  const blocked = h('div', { class: 'card card--wide' },
    h('h3', {}, 'Blocked inputs'),
    h('p', { class: 'sub' }, `Typed questions the screen stopped before they reached the suspect (latest ${Math.min(25, d.blocked.length)}). The percentage is the screen's confidence.`),
    d.blocked.length ? table('Blocked inputs', [{ label: 'When' }, { label: 'Player' }, { label: 'Level', cls: 'hide-sm' }, { label: 'What they typed' }, { label: 'Reason' }],
      d.blocked.map((r) => h('tr', {},
        h('td', { class: 'nowrap' }, shortTime(r.at)),
        h('td', {}, playerLink(r)),
        h('td', { class: 'hide-sm' }, levelLabel(r.case_id, r.level_id)),
        h('td', { class: 'q-cell' }, r.input || ''),
        h('td', {}, flagPill({ ok: 1, flag: r.flag }))))) : empty('Nothing blocked in this period.'));

  box.replaceChildren(kpis, h('div', { class: 'grid-2 mt' }, perDay, byKind, byModel, levels, blocked));
  charts.push(columnChart(chartBox, days, kinds.map((k, i) => ({
    name: KIND_SHORT[k] || k, cls: SERIES[i % SERIES.length], values: days.map((x) => per.get(`${x.iso}|${k}`) || 0),
  })), { mode: 'stack', height: 220, title: 'AI calls per day by kind', valueLabel: (v) => fmtN(v) }));
  return charts;
}

const playerLink = (r) => (r.player_id
  ? h('a', { href: `#player/${r.player_id}`, class: 'plink' }, r.name || r.player_id.slice(0, 8))
  : h('span', { class: 'muted' }, 'test bench'));

function renderLog(card, ctx, d) {
  const search = h('input', { class: 'a-input', type: 'search', placeholder: 'Search questions, replies or a player name', 'aria-label': 'Search AI calls', value: state.q });
  let timer = 0;
  search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.q = search.value.trim(); state.offset = 0; load(); }, 300);
  });
  const kinds = [...new Set([...KIND_ORDER, ...(d.byKind || []).map((r) => r.kind)])];
  const levels = [...new Set((d.levels || []).map((r) => `${r.case_id}/${r.level_id}`))];
  const set = (k) => (v) => { state[k] = v; state.offset = 0; load(); };
  const count = h('span', { class: 'muted' });
  const body = h('div', {}, loading('Loading calls…'));
  card.replaceChildren(
    h('div', { class: 'toolbar' }, search,
      select('Kind', [['', 'Any kind'], ...kinds.map((k) => [k, KIND_LABEL[k] || k])], state.kind, set('kind')),
      select('Outcome', [['', 'Any outcome'], ['flagged', 'Any flag'], ['blocked', 'Blocked'], ['broken', 'Broke the lie'], ['wrong_card', 'Wrong card'], ['error', 'Errors']], state.flag, set('flag')),
      select('Level', [['', 'Any level'], ...levels.map((v) => { const [c, l] = v.split('/'); return [v, levelLabel(c, l)]; })], state.level, set('level')),
      count),
    body);

  async function load() {
    body.replaceChildren(loading('Loading calls…'));
    try {
      const q = new URLSearchParams({ limit: state.limit, offset: state.offset });
      if (state.q) q.set('q', state.q);
      if (state.kind) q.set('kind', state.kind);
      if (state.flag) q.set('flag', state.flag);
      if (state.level) { const [c, l] = state.level.split('/'); q.set('case', c); q.set('level', l); }
      if (ctx.withDev()) q.set('dev', '1');
      const r = await ctx.api(`/admin/ai-log?${q}`);
      count.textContent = `${fmtN(r.total)} ${r.total === 1 ? 'call' : 'calls'}`;
      if (!r.rows.length) { body.replaceChildren(empty(state.q || state.kind || state.flag || state.level ? 'No call matches.' : 'No AI calls yet.')); return; }
      const rows = r.rows.map((x) => {
        const out = describeOutput(x);
        return h('tr', {},
          h('td', { class: 'nowrap' }, shortTime(x.at)),
          h('td', {}, playerLink(x), x.dev ? h('span', { class: 'pill pill--plain' }, 'dev') : null),
          h('td', { class: 'lv-cell' }, levelLabel(x.case_id, x.level_id)),
          h('td', {}, h('span', { class: `kind k-${x.kind}` }, KIND_SHORT[x.kind] || x.kind)),
          h('td', { class: 'q-cell' }, describeInput(x)),
          h('td', { class: 'q-cell q-cell--reply' }, out.text, out.claims.length ? h('span', { class: 'phase' }, `claims ${out.claims.join(', ')}`) : null),
          h('td', { class: 'r nowrap' }, fmtMs(x.ms), h('span', { class: 'phase mono' }, x.model || '')),
          h('td', {}, flagPill(x)));
      });
      const prev = h('button', { class: 'a-btn', type: 'button', disabled: state.offset === 0, onclick: () => { state.offset = Math.max(0, state.offset - state.limit); load(); } }, '← Newer');
      const next = h('button', { class: 'a-btn', type: 'button', disabled: state.offset + r.rows.length >= r.total, onclick: () => { state.offset += state.limit; load(); } }, 'Older →');
      body.replaceChildren(
        table('Recent AI calls', [{ label: 'When' }, { label: 'Player' }, { label: 'Level' }, { label: 'Kind' }, { label: 'Question' }, { label: 'Reply' }, { label: 'Time', cls: 'r' }, { label: 'Flag' }], rows, { cls: 'tbl--log' }),
        h('div', { class: 'pager' }, h('span', {}, `${fmtN(state.offset + 1)}–${fmtN(state.offset + r.rows.length)} of ${fmtN(r.total)}`), prev, next));
    } catch (err) {
      if (err.status !== 401) body.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, ctx.explain(err)));
    }
  }
  load();
}

// ---------- test bench ----------
function interrogationLevels() {
  const out = [];
  for (const id of caseIds()) {
    for (const l of CASES[id]?.levels || []) if (l.game === 'interrogation' && l.params) out.push({ caseId: id, level: l });
  }
  return out;
}

function renderBench(card, ctx) {
  const levels = interrogationLevels();
  if (!levels.length) { card.replaceChildren(h('p', { class: 'muted' }, 'No interrogation level in the case files.')); return; }
  const uid = 'bench';
  const levelSel = h('select', { class: 'a-input a-select', id: `${uid}-level` },
    levels.map((x, i) => h('option', { value: i }, `${levelLabel(x.caseId, x.level.id)} (${x.level.params.suspect?.name || 'suspect'})`)));
  const lieSel = h('select', { class: 'a-input a-select', id: `${uid}-lie` });
  const modelIn = h('input', { class: 'a-input', id: `${uid}-model`, list: `${uid}-models`, placeholder: 'server default (AI_MODEL)', autocomplete: 'off', spellcheck: 'false' });
  const modelList = h('datalist', { id: `${uid}-models` }, (bench.models || []).map((m) => h('option', { value: m })));
  const reasonSel = h('select', { class: 'a-input a-select', id: `${uid}-reason` },
    [['', 'Model default'], ['none', 'none'], ['low', 'low'], ['medium', 'medium'], ['high', 'high']].map(([v, l]) => h('option', { value: v }, l)));
  const qIn = h('input', { class: 'a-input', id: `${uid}-q`, list: `${uid}-qs`, maxlength: 300, placeholder: 'Ask the suspect something', autocomplete: 'off' });
  const qList = h('datalist', { id: `${uid}-qs` });
  const fillLevel = () => {
    const p = levels[Number(levelSel.value)].level.params;
    lieSel.replaceChildren(...(p.lies || []).map((l) => h('option', { value: l.id }, `${l.id}: ${l.topic}`)));
    qList.replaceChildren(...(p.suggested || []).map((s) => h('option', { value: s })));
    if (!qIn.value) qIn.value = (p.suggested || [])[0] || '';
  };
  levelSel.addEventListener('change', () => { qIn.value = ''; fillLevel(); });
  fillLevel();
  const status = h('p', { class: 'muted bench-status', role: 'status' });
  const modelsBtn = h('button', { class: 'a-btn', type: 'button' }, bench.models ? `${bench.models.length} models loaded` : 'Load model list');
  modelsBtn.addEventListener('click', async () => {
    modelsBtn.disabled = true;
    status.textContent = 'Asking the provider for its models…';
    try {
      const r = await ctx.api('/admin/ai-lab', { method: 'POST', body: JSON.stringify({ op: 'models' }) });
      bench.models = r.models || [];
      modelList.replaceChildren(...bench.models.map((m) => h('option', { value: m })));
      modelsBtn.textContent = `${bench.models.length} models loaded`;
      status.textContent = r.ok ? `The provider lists ${bench.models.length} models. Pick one in the Model field.` : `The provider answered ${r.status}.`;
    } catch (err) { status.textContent = benchError(err, ctx); } finally { modelsBtn.disabled = false; }
  });
  const runBtn = h('button', { class: 'a-btn a-btn--primary', type: 'submit' }, 'Ask');
  const results = h('div', { class: 'bench-runs' });
  const form = h('form', { class: 'bench' },
    h('div', { class: 'bench-grid' },
      field('Suspect', levelSel, `${uid}-level`),
      field('Their lie', lieSel, `${uid}-lie`),
      field('Model', h('div', { class: 'bench-model' }, modelIn, modelList), `${uid}-model`),
      field('Reasoning', reasonSel, reasonSel.id)),
    field('Question', h('div', {}, qIn, qList), `${uid}-q`),
    h('div', { class: 'toolbar' }, runBtn, modelsBtn, status));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const x = levels[Number(levelSel.value)];
    const question = qIn.value.trim();
    if (!question) { status.textContent = 'Type a question first.'; qIn.focus(); return; }
    runBtn.disabled = true;
    status.textContent = 'Waiting for the suspect…';
    const req = { op: 'chat', case_id: x.caseId, level_id: x.level.id, lie_id: lieSel.value, question, ...(modelIn.value.trim() ? { model: modelIn.value.trim() } : {}), ...(reasonSel.value ? { reasoning: reasonSel.value } : {}) };
    try {
      const r = await ctx.api('/admin/ai-lab', { method: 'POST', body: JSON.stringify(req) });
      bench.runs.unshift({ at: Date.now(), req, res: r });
      status.textContent = r.ok ? `Answered in ${fmtMs(r.ms)}.` : `The model failed after ${fmtMs(r.ms)}.`;
      drawRuns(results);
    } catch (err) { status.textContent = benchError(err, ctx); } finally { runBtn.disabled = false; }
  });
  card.replaceChildren(
    h('p', { class: 'sub' }, 'Runs the real interrogation prompt for the chosen suspect and lie, once, and is not written to the AI log. Results stay on this page so you can compare models side by side.'),
    form, results);
  drawRuns(results);
}

function field(label, control, id) {
  return h('div', { class: 'a-field' }, h('label', { for: id }, label), control);
}

function benchError(err, ctx) {
  if (err?.code === 'no_key') return 'The server has no AI_API_KEY secret, so the test bench cannot reach a model. Add it in Cloudflare Pages, then redeploy.';
  if (err?.code === 'no_such_level') return 'The server does not have this level in its AI case list (functions/api/ai/_cases.js).';
  return ctx.explain(err);
}

function drawRuns(box) {
  if (!bench.runs.length) { box.replaceChildren(); return; }
  const rows = bench.runs.slice(0, 30).map(({ at, req, res }) => {
    const p = paramsOf(req.case_id, req.level_id);
    const parsed = res.parsed || null;
    const claims = (parsed?.claims || []).map((id) => {
      const x = p && [...(p.facts || []), ...(p.lies || [])].find((y) => y.id === id);
      return x ? `${id}: ${x.topic}${x.id === req.lie_id ? ' (the lie)' : ''}` : id;
    });
    return h('tr', {},
      h('td', { class: 'nowrap' }, new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
      h('td', { class: 'mono' }, req.model || 'default', h('span', { class: 'phase' }, `reasoning ${req.reasoning || 'default'}`)),
      h('td', { class: 'q-cell' }, req.question, h('span', { class: 'phase' }, `lie ${req.lie_id}`)),
      h('td', { class: 'q-cell q-cell--reply' }, res.ok ? (parsed?.reply || res.raw || '') : h('span', { class: 'drop-hi' }, res.error || 'failed'),
        res.ok && !parsed ? h('span', { class: 'phase' }, 'not valid JSON') : null),
      h('td', {}, claims.length ? claims.join(', ') : h('span', { class: 'muted' }, 'none')),
      h('td', { class: 'r nowrap' }, fmtMs(res.ms)));
  });
  box.replaceChildren(h('h3', { class: 'mt' }, 'This session’s runs'),
    table('Test bench runs', [{ label: 'When' }, { label: 'Model' }, { label: 'Question' }, { label: 'Reply' }, { label: 'Claims' }, { label: 'Time', cls: 'r' }], rows, { cls: 'tbl--log' }));
}

// ---------- a player's transcript ----------
/** One player's AI calls, grouped by level, as a readable transcript. */
export function renderTranscript(rows) {
  if (!rows.length) return empty('This player has not talked to an AI suspect.');
  const groups = new Map();
  for (const r of rows) {
    const k = `${r.case_id}/${r.level_id}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  return h('div', { class: 'transcripts' }, [...groups.entries()].map(([k, list]) => {
    const [c, l] = k.split('/');
    const p = paramsOf(c, l);
    const broke = list.some((r) => r.flag === 'broken');
    const wrong = list.filter((r) => r.flag === 'wrong_card').length;
    const qs = list.filter((r) => r.kind === 'ask' || r.kind === 'topic').length;
    return h('details', { class: 'tr-group', open: groups.size <= 2 },
      h('summary', {},
        h('b', {}, levelLabel(c, l)),
        h('span', { class: 'muted' }, ` · ${p?.suspect?.name ? `${p.suspect.name} · ` : ''}${fmtN(qs)} ${qs === 1 ? 'question' : 'questions'}${wrong ? ` · ${wrong} wrong ${wrong === 1 ? 'card' : 'cards'}` : ''} · ${shortTime(list[0].at)}`),
        broke ? pill('broke the lie', 'good') : list.some((r) => r.kind === 'confront') ? pill('not broken', 'plain') : null),
      h('ol', { class: 'chat' }, list.map((r) => {
        const out = describeOutput(r);
        return h('li', { class: `chat-turn${r.ok ? '' : ' is-err'}` },
          h('div', { class: 'chat-q' },
            h('span', { class: `kind k-${r.kind}` }, KIND_SHORT[r.kind] || r.kind),
            h('span', {}, describeInput(r)),
            h('time', { datetime: new Date(r.at).toISOString(), class: 'muted' }, new Date(r.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))),
          h('div', { class: 'chat-a' },
            h('span', {}, out.text || '–'),
            h('span', { class: 'chat-meta' }, flagPill(r), out.claims.length ? h('span', { class: 'muted' }, `claims ${out.claims.join(', ')}`) : null, h('span', { class: 'muted' }, `${fmtMs(r.ms)} · ${r.model || ''}`))));
      })));
  }));
}
