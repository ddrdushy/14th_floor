// Theories tab: "Who is the Chairman?" What the players think, how theories move from case to case, and
// their reasons in their own words. GET /api/admin/chairman. The game has no answer stored anywhere: this is
// for the owner, to see what players suspect before deciding the reveal.
import { h, fmtN, pct, cname, shortTime, kpi, barCell, table, empty, loading, sectionHead } from './util.js';

const whoText = (r) => r.label || (r.who === 'unknown' ? 'Someone not met yet' : r.who);

export function renderTheoriesTab(el, ctx) {
  const body = h('div', {}, loading('Reading the theories…'));
  el.replaceChildren(sectionHead('Theories', 'Who players think the Chairman is, and why. There is no right answer in the game yet.'), body);
  (async () => {
    try {
      const d = await ctx.api(`/admin/chairman${ctx.withDev() ? '?dev=1' : ''}`);
      ctx.stamp();
      render(body, d);
    } catch (err) {
      if (err.status !== 401) body.replaceChildren(h('div', { class: 'err-box', role: 'alert' }, ctx.explain(err)));
    }
  })();
  return { destroy() {} };
}

function render(body, d) {
  const t = d.totals || {};
  const total = Number(t.players) || 0;
  if (!total) {
    body.replaceChildren(h('div', { class: 'note' }, 'No theories yet. Players name a suspect in the Sinar File.'));
    return;
  }
  const max = Math.max(...d.tally.map((r) => r.n), 1);
  const tally = table('Current theories', [{ label: 'Suspect' }, { label: 'Detectives' }, { label: 'Share', cls: 'num' }],
    d.tally.map((r) => h('tr', {}, h('td', {}, whoText(r)), h('td', {}, barCell(r.n, max)), h('td', { class: 'num' }, pct(r.n, total)))));

  // how theories split by the last case closed when the guess was made
  const groups = new Map();
  for (const r of d.byCase) {
    if (!groups.has(r.after)) groups.set(r.after, []);
    groups.get(r.after).push(r);
  }
  const moves = [...groups.entries()].map(([after, rows]) => {
    const n = rows.reduce((a, r) => a + r.n, 0);
    return h('tr', {},
      h('td', {}, after ? `After ${cname(after)}` : 'Before any case closed'),
      h('td', {}, fmtN(n)),
      h('td', {}, rows.slice(0, 3).map((r) => `${whoText(r)} ${pct(r.n, n)}`).join(' · ')));
  });

  const recent = d.recent.length
    ? table('Latest changes of theory', [{ label: 'When' }, { label: 'Detective' }, { label: 'Suspect' }, { label: 'Why' }, { label: 'After' }],
      d.recent.map((r) => h('tr', {},
        h('td', {}, shortTime(r.at)),
        h('td', {}, r.player_id ? h('a', { href: `#player/${encodeURIComponent(r.player_id)}` }, r.name || 'Unnamed') : '–'),
        h('td', {}, whoText(r)),
        h('td', { class: 'wrap' }, r.why || '–'),
        h('td', {}, r.after ? cname(r.after) : '–'))))
    : empty('No reasons written yet.');

  body.replaceChildren(
    h('div', { class: 'kpis' },
      kpi('Detectives with a theory', fmtN(total)),
      kpi('Theory changes', fmtN(t.changes)),
      kpi('Changed their mind', fmtN(t.switched), pct(t.switched, total))),
    h('div', { class: 'card' }, h('h3', {}, 'Current theories'), tally),
    h('div', { class: 'card' }, h('h3', {}, 'How theories move, case by case'),
      table('Theories by case', [{ label: 'When guessed' }, { label: 'Detectives' }, { label: 'Top suspects' }], moves)),
    h('div', { class: 'card' }, h('h3', {}, 'In their own words'), recent));
}
