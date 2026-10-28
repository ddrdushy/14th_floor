// GET /api/admin/cases?case=<case id>[&dev=1]
// One case in depth for the admin "Cases" tab: open/closed totals with medians, every puzzle's solve
// count, median / average / 90th-percentile time and hints, where players who have not closed it
// stopped (their latest solved puzzle, and how many of them have been quiet for 3+ days), the verdicts,
// and new opens / closes per day over the last 30 days. Dev players are left out unless dev=1.
import { adminHandler, json, fail, methodNotAllowed, handler, ID_RE, clampInt } from '../_lib.js';

const DAY = 86_400_000;

export const onRequestGet = adminHandler(async ({ request, env }) => {
  const url = new URL(request.url);
  const caseId = url.searchParams.get('case') || '';
  if (!ID_RE.test(caseId)) return fail(400, 'bad_case');
  const withDev = url.searchParams.get('dev') === '1';
  const tz = clampInt(url.searchParams.get('tz'), -840, 840, 0);
  const real = (col) => (withDev ? '1 = 1' : `${col} NOT IN (SELECT id FROM players WHERE dev = 1)`);
  const now = Date.now();
  const stale = now - 3 * DAY;
  const dayOf = (col) => `strftime('%Y-%m-%d', (${col} + ${tz * 60_000}) / 1000, 'unixepoch')`;
  // median / percentile helper over a window: rows ranked within each level
  const pctRow = (p) => `CAST(((c - 1) * ${p}) AS INTEGER) + 1`;
  const db = env.DB;

  const [totals, caseMed, levels, levelMed, stops, verdicts, opensPerDay, closesPerDay] = await db.batch([
    db.prepare(`SELECT COUNT(*) AS opened, COALESCE(SUM(closed_at IS NOT NULL), 0) AS closed, COALESCE(SUM(correct), 0) AS correct,
        AVG(CASE WHEN closed_at IS NOT NULL THEN total_time END) AS avgTime, AVG(CASE WHEN closed_at IS NOT NULL THEN hints_used END) AS avgHints,
        COALESCE(SUM(closed_at IS NULL), 0) AS open, COALESCE(SUM(closed_at IS NULL AND updated_at < ?2), 0) AS openStale,
        COALESCE(SUM(closed_at IS NULL AND levels_solved = 0), 0) AS openNoSolve,
        AVG(CASE WHEN closed_at IS NOT NULL THEN (closed_at - opened_at) END) AS avgSpan
      FROM progress WHERE case_id = ?1 AND ${real('player_id')}`).bind(caseId, stale),
    db.prepare(`WITH t AS (SELECT total_time AS v, ROW_NUMBER() OVER (ORDER BY total_time) AS rn, COUNT(*) OVER () AS c FROM progress
          WHERE case_id = ?1 AND closed_at IS NOT NULL AND ${real('player_id')}),
        h AS (SELECT hints_used AS v, ROW_NUMBER() OVER (ORDER BY hints_used) AS rn, COUNT(*) OVER () AS c FROM progress
          WHERE case_id = ?1 AND closed_at IS NOT NULL AND ${real('player_id')}),
        s AS (SELECT (closed_at - opened_at) AS v, ROW_NUMBER() OVER (ORDER BY closed_at - opened_at) AS rn, COUNT(*) OVER () AS c FROM progress
          WHERE case_id = ?1 AND closed_at IS NOT NULL AND opened_at IS NOT NULL AND ${real('player_id')})
      SELECT (SELECT AVG(v) FROM t WHERE rn IN ((c + 1) / 2, (c + 2) / 2)) AS medTime,
        (SELECT AVG(v) FROM h WHERE rn IN ((c + 1) / 2, (c + 2) / 2)) AS medHints,
        (SELECT AVG(v) FROM s WHERE rn IN ((c + 1) / 2, (c + 2) / 2)) AS medSpan`).bind(caseId),
    db.prepare(`SELECT level_id, COUNT(*) AS players, AVG(time) AS avgTime, MIN(time) AS minTime, MAX(time) AS maxTime,
        AVG(hints) AS avgHints, COALESCE(SUM(hints > 0), 0) AS hinted, COALESCE(SUM(hints), 0) AS hints
      FROM solves WHERE case_id = ?1 AND ${real('player_id')} GROUP BY level_id LIMIT 200`).bind(caseId),
    db.prepare(`WITH t AS (SELECT level_id, time AS v, ROW_NUMBER() OVER (PARTITION BY level_id ORDER BY time) AS rn, COUNT(*) OVER (PARTITION BY level_id) AS c
          FROM solves WHERE case_id = ?1 AND ${real('player_id')}),
        h AS (SELECT level_id, hints AS v, ROW_NUMBER() OVER (PARTITION BY level_id ORDER BY hints) AS rn, COUNT(*) OVER (PARTITION BY level_id) AS c
          FROM solves WHERE case_id = ?1 AND ${real('player_id')})
      SELECT m.level_id, m.medTime, p.p90Time, hm.medHints FROM
        (SELECT level_id, AVG(v) AS medTime FROM t WHERE rn IN ((c + 1) / 2, (c + 2) / 2) GROUP BY level_id) m
        LEFT JOIN (SELECT level_id, MAX(v) AS p90Time FROM t WHERE rn = ${pctRow(0.9)} GROUP BY level_id) p ON p.level_id = m.level_id
        LEFT JOIN (SELECT level_id, AVG(v) AS medHints FROM h WHERE rn IN ((c + 1) / 2, (c + 2) / 2) GROUP BY level_id) hm ON hm.level_id = m.level_id
      LIMIT 200`).bind(caseId),
    // players with the case still open, by the last puzzle they solved
    db.prepare(`WITH last AS (SELECT player_id, level_id, ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY at DESC, time DESC) AS rn
          FROM solves WHERE case_id = ?1)
      SELECT l.level_id, COUNT(*) AS n, COALESCE(SUM(p.updated_at < ?2), 0) AS stale
      FROM progress p JOIN last l ON l.player_id = p.player_id AND l.rn = 1
      WHERE p.case_id = ?1 AND p.closed_at IS NULL AND ${real('p.player_id')}
      GROUP BY l.level_id LIMIT 200`).bind(caseId, stale),
    db.prepare(`SELECT verdict_key, verdict, correct, COUNT(*) AS n, AVG(total_time) AS avgTime FROM progress
      WHERE case_id = ?1 AND closed_at IS NOT NULL AND ${real('player_id')}
      GROUP BY verdict_key, correct ORDER BY n DESC LIMIT 100`).bind(caseId),
    db.prepare(`SELECT ${dayOf('opened_at')} AS day, COUNT(*) AS n FROM progress
      WHERE case_id = ?1 AND opened_at >= ?2 AND ${real('player_id')} GROUP BY day ORDER BY day`).bind(caseId, now - 31 * DAY),
    db.prepare(`SELECT ${dayOf('closed_at')} AS day, COUNT(*) AS n FROM progress
      WHERE case_id = ?1 AND closed_at >= ?2 AND ${real('player_id')} GROUP BY day ORDER BY day`).bind(caseId, now - 31 * DAY),
  ]);

  const med = new Map(levelMed.results.map((r) => [r.level_id, r]));
  const t = totals.results[0] || {};
  const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
  return json({
    ok: true,
    generatedAt: now,
    tz,
    case_id: caseId,
    totals: { ...t, ...(caseMed.results[0] || {}) },
    levels: levels.results.map((r) => ({ ...r, ...(med.get(r.level_id) || {}) })),
    stops: stops.results,
    verdicts: verdicts.results.map((r) => {
      const v = parse(r.verdict);
      return { key: r.verdict_key, charged: v?.charged || [], answers: v?.answers || {}, correct: !!r.correct, n: r.n, avgTime: r.avgTime };
    }),
    opensPerDay: opensPerDay.results,
    closesPerDay: closesPerDay.results,
  });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
