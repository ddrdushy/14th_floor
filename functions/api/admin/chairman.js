// GET /api/admin/chairman[?dev=1]  "Who is the Chairman?": what the players think.
//   tally     current guesses by candidate, most first
//   byCase    current guesses split by the last case closed when they guessed (how theories move)
//   recent    the latest 100 changes of theory, with the reason and the detective's name
//   totals    players with a theory, changes made, players who changed their mind at least once
// Dev players are left out unless dev=1.
import { adminHandler, json, handler, methodNotAllowed } from '../_lib.js';

export const onRequestGet = adminHandler(async ({ request, env }) => {
  const dev = new URL(request.url).searchParams.get('dev') === '1';
  const noDev = dev ? '1 = 1' : 'COALESCE(pl.dev, 0) = 0';
  const db = env.DB;
  const [tally, byCase, recent, totals] = await db.batch([
    db.prepare(`SELECT g.who, MAX(g.label) AS label, COUNT(*) AS n FROM chairman_guesses g LEFT JOIN players pl ON pl.id = g.player_id
      WHERE ${noDev} GROUP BY g.who ORDER BY n DESC LIMIT 60`),
    db.prepare(`SELECT COALESCE(g.after, '') AS after, g.who, MAX(g.label) AS label, COUNT(*) AS n FROM chairman_guesses g LEFT JOIN players pl ON pl.id = g.player_id
      WHERE ${noDev} GROUP BY 1, 2 ORDER BY 1, n DESC`),
    db.prepare(`SELECT h.at, h.player_id, COALESCE(pl.profile_name, pl.detective_name) AS name, h.who, h.label, h.why, h.after
      FROM chairman_history h LEFT JOIN players pl ON pl.id = h.player_id WHERE ${noDev} ORDER BY h.at DESC LIMIT 100`),
    db.prepare(`SELECT COUNT(*) AS players, COALESCE(SUM(g.changes), 0) AS changes, SUM(CASE WHEN g.changes > 1 THEN 1 ELSE 0 END) AS switched
      FROM chairman_guesses g LEFT JOIN players pl ON pl.id = g.player_id WHERE ${noDev}`),
  ]);
  return json({ ok: true, tally: tally.results, byCase: byCase.results, recent: recent.results, totals: totals.results[0] || {} });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
