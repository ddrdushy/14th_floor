// GET /api/admin/summary[?tz=<minutes east of UTC>&dev=1]
// Everything the admin dashboard draws: player counts, activity, new players per day (30 days),
// players by current stage, the per-puzzle funnel with average time and hints, verdicts per case,
// countries and platforms. Players who used dev tools are left out of the game statistics unless dev=1.
import { adminHandler, json, methodNotAllowed, handler, clampInt, caseRankSql } from '../_lib.js';

const DAY = 86_400_000;

export const onRequestGet = adminHandler(async ({ request, env }) => {
  const db = env.DB;
  const url = new URL(request.url);
  const tz = clampInt(url.searchParams.get('tz'), -840, 840, 0); // minutes
  const withDev = url.searchParams.get('dev') === '1';
  const now = Date.now();
  const since30 = now - 30 * DAY;
  // a filter on a player_id column: real players only, unless dev runs are asked for
  const real = (col) => (withDev ? '1 = 1' : `${col} NOT IN (SELECT id FROM players WHERE dev = 1)`);
  const local = `(created_at + ${tz * 60_000}) / 1000`;

  const [totals, devCount, perDay, stages, opened, funnel, verdicts, countries, platforms, events24] = await db.batch([
    db.prepare(`SELECT COUNT(*) AS players,
        COALESCE(SUM(last_seen >= ?1), 0) AS active1, COALESCE(SUM(last_seen >= ?2), 0) AS active7, COALESCE(SUM(last_seen >= ?3), 0) AS active30,
        COALESCE(SUM(dev), 0) AS dev, COALESCE(SUM(show_on_board), 0) AS onBoard, COALESCE(SUM(created_at >= ?1), 0) AS new1
      FROM players ${withDev ? '' : 'WHERE dev = 0'}`).bind(now - DAY, now - 7 * DAY, since30),
    db.prepare(`SELECT COUNT(*) AS n FROM players WHERE dev = 1`),
    db.prepare(`SELECT strftime('%Y-%m-%d', ${local}, 'unixepoch') AS day, COUNT(*) AS n FROM players
      WHERE created_at >= ?1 AND ${real('id')} GROUP BY day ORDER BY day`).bind(since30 - DAY),
    db.prepare(`WITH ranked AS (
        SELECT player_id, case_id, levels_solved, closed_at,
          ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY ${caseRankSql('case_id')} DESC, opened_at DESC) AS rn
        FROM progress WHERE ${real('player_id')})
      SELECT case_id, levels_solved, closed_at IS NOT NULL AS closed, COUNT(*) AS n FROM ranked WHERE rn = 1
      GROUP BY case_id, levels_solved, closed ORDER BY ${caseRankSql('case_id')}, closed, levels_solved`),
    db.prepare(`SELECT case_id, COUNT(*) AS opened, COALESCE(SUM(closed_at IS NOT NULL), 0) AS closed, COALESCE(SUM(correct), 0) AS correct,
        AVG(CASE WHEN closed_at IS NOT NULL THEN total_time END) AS avgTime, AVG(CASE WHEN closed_at IS NOT NULL THEN hints_used END) AS avgHints
      FROM progress WHERE ${real('player_id')} GROUP BY case_id`),
    db.prepare(`SELECT case_id, level_id, COUNT(*) AS players, AVG(time) AS avgTime, AVG(hints) AS avgHints, MIN(time) AS minTime
      FROM solves WHERE ${real('player_id')} GROUP BY case_id, level_id`),
    db.prepare(`SELECT case_id, verdict_key, verdict, correct, COUNT(*) AS n FROM progress
      WHERE closed_at IS NOT NULL AND ${real('player_id')} GROUP BY case_id, verdict_key, correct ORDER BY case_id, n DESC`),
    db.prepare(`SELECT COALESCE(country, '??') AS k, COUNT(*) AS n FROM players WHERE ${real('id')} GROUP BY k ORDER BY n DESC LIMIT 25`),
    db.prepare(`SELECT COALESCE(platform, 'unknown') AS k, COUNT(*) AS n FROM players WHERE ${real('id')} GROUP BY k ORDER BY n DESC LIMIT 25`),
    db.prepare(`SELECT COUNT(*) AS n FROM events WHERE received_at >= ?1`).bind(now - DAY),
  ]);

  const t = totals.results[0] || {};
  const startedPlayers = stages.results.reduce((s, r) => s + r.n, 0);
  const dev = devCount.results[0]?.n || 0;
  const realPlayers = t.players || 0; // already without dev players unless dev=1
  return json({
    ok: true,
    generatedAt: now,
    tz,
    withDev,
    totals: {
      players: realPlayers,
      dev,
      onBoard: t.onBoard || 0,
      new24h: t.new1 || 0,
      active24h: t.active1 || 0,
      active7d: t.active7 || 0,
      active30d: t.active30 || 0,
      casesClosed: opened.results.reduce((s, r) => s + r.closed, 0),
      casesCorrect: opened.results.reduce((s, r) => s + r.correct, 0),
      events24h: events24.results[0]?.n || 0,
    },
    newPerDay: perDay.results,
    stages: [...stages.results, { case_id: null, levels_solved: 0, closed: 0, n: Math.max(0, realPlayers - startedPlayers) }],
    cases: opened.results,
    funnel: funnel.results,
    verdicts: verdicts.results.map((r) => {
      let v = null;
      try { v = JSON.parse(r.verdict); } catch { /* keep null */ }
      return { case_id: r.case_id, key: r.verdict_key, charged: v?.charged || [], answers: v?.answers || {}, correct: !!r.correct, n: r.n };
    }),
    countries: countries.results,
    platforms: platforms.results,
  });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
