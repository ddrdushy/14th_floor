// GET /api/admin/ai?days=30[&tz=<minutes east of UTC>&dev=1]
// The AI games from ai_log over the last `days` days: totals, calls per day by kind, latency (average
// and 95th percentile, successful calls) per kind and per model, error and block rates, interrogation
// outcomes per level (who broke the lie, wrong cards shown) and the latest blocked inputs.
// Dev players are left out unless dev=1. Every query is bounded by `at` (ai_log_at index).
import { adminHandler, json, methodNotAllowed, handler, clampInt } from '../_lib.js';

const DAY = 86_400_000;

export const onRequestGet = adminHandler(async ({ request, env }) => {
  const url = new URL(request.url);
  const days = clampInt(url.searchParams.get('days'), 1, 365, 30);
  const tz = clampInt(url.searchParams.get('tz'), -840, 840, 0);
  const withDev = url.searchParams.get('dev') === '1';
  const now = Date.now();
  const since = now - days * DAY;
  const real = withDev ? '1 = 1' : `(a.player_id IS NULL OR a.player_id NOT IN (SELECT id FROM players WHERE dev = 1))`;
  const day = `strftime('%Y-%m-%d', (a.at + ${tz * 60_000}) / 1000, 'unixepoch')`;
  const base = `FROM ai_log a WHERE a.at >= ?1 AND ${real}`;
  // 95th percentile of ms over successful calls, per group column (or overall with group = null)
  const p95 = (group) => {
    const part = group ? `PARTITION BY ${group}` : '';
    return `WITH r AS (SELECT ${group ? `${group} AS g,` : `'all' AS g,`} a.ms AS v, ROW_NUMBER() OVER (${part} ORDER BY a.ms) AS rn, COUNT(*) OVER (${part}) AS c
        ${base} AND a.ok = 1 AND a.ms IS NOT NULL)
      SELECT g, MAX(v) AS p95 FROM r WHERE rn = CAST(((c - 1) * 0.95) AS INTEGER) + 1 GROUP BY g`;
  };
  const db = env.DB;
  const [totals, totalP95, perDay, byKind, kindP95, byModel, modelP95, levels, blocked, flags] = await db.batch([
    db.prepare(`SELECT COUNT(*) AS calls, COUNT(DISTINCT a.player_id) AS players, COALESCE(SUM(a.ok = 0), 0) AS errors,
        COALESCE(SUM(a.flag LIKE 'blocked:%'), 0) AS blocked, AVG(CASE WHEN a.ok = 1 THEN a.ms END) AS avgMs,
        COALESCE(SUM(a.at >= ?2), 0) AS last24h, MAX(a.at) AS lastAt ${base}`).bind(since, now - DAY),
    db.prepare(p95(null)).bind(since),
    db.prepare(`SELECT ${day} AS day, a.kind, COUNT(*) AS n, COALESCE(SUM(a.ok = 0), 0) AS errors, COALESCE(SUM(a.flag LIKE 'blocked:%'), 0) AS blocked
      ${base} GROUP BY day, a.kind ORDER BY day LIMIT 3000`).bind(since),
    db.prepare(`SELECT a.kind, COUNT(*) AS n, COUNT(DISTINCT a.player_id) AS players, COALESCE(SUM(a.ok = 0), 0) AS errors,
        COALESCE(SUM(a.flag LIKE 'blocked:%'), 0) AS blocked, AVG(CASE WHEN a.ok = 1 THEN a.ms END) AS avgMs
      ${base} GROUP BY a.kind ORDER BY n DESC LIMIT 20`).bind(since),
    db.prepare(p95('a.kind')).bind(since),
    db.prepare(`SELECT COALESCE(a.model, '?') AS model, COUNT(*) AS n, COALESCE(SUM(a.ok = 0), 0) AS errors, AVG(CASE WHEN a.ok = 1 THEN a.ms END) AS avgMs,
        MIN(a.at) AS firstAt, MAX(a.at) AS lastAt
      ${base} GROUP BY model ORDER BY n DESC LIMIT 20`).bind(since),
    db.prepare(p95(`COALESCE(a.model, '?')`)).bind(since),
    // per level: who played, how many questions, who broke the lie, wrong cards, blocked inputs
    db.prepare(`SELECT a.case_id, a.level_id, COUNT(DISTINCT a.player_id) AS players,
        COALESCE(SUM(a.kind IN ('ask', 'topic')), 0) AS questions, COALESCE(SUM(a.kind = 'ask'), 0) AS typed,
        COALESCE(SUM(a.kind = 'confront'), 0) AS confronts,
        COUNT(DISTINCT CASE WHEN a.flag = 'broken' THEN a.player_id END) AS broke,
        COALESCE(SUM(a.flag = 'wrong_card'), 0) AS wrongCards,
        COUNT(DISTINCT CASE WHEN a.flag = 'wrong_card' THEN a.player_id END) AS wrongPlayers,
        COALESCE(SUM(a.flag LIKE 'blocked:%'), 0) AS blocked, COALESCE(SUM(a.ok = 0), 0) AS errors,
        COALESCE(SUM(a.kind = 'judge'), 0) AS judged
      ${base} GROUP BY a.case_id, a.level_id ORDER BY a.case_id, a.level_id LIMIT 200`).bind(since),
    db.prepare(`SELECT a.id, a.at, a.player_id, COALESCE(pl.profile_name, pl.detective_name) AS name, a.case_id, a.level_id, a.kind, a.input, a.flag
      FROM ai_log a LEFT JOIN players pl ON pl.id = a.player_id
      WHERE a.at >= ?1 AND ${real} AND a.flag LIKE 'blocked:%' ORDER BY a.at DESC LIMIT 25`).bind(since),
    // blocked reasons: "blocked:<kind>:<p>" grouped by kind
    db.prepare(`SELECT CASE WHEN a.flag LIKE 'blocked:%' THEN substr(a.flag, 1, instr(substr(a.flag, 9), ':') + 7) ELSE a.flag END AS flag, COUNT(*) AS n
      ${base} AND a.flag IS NOT NULL GROUP BY 1 ORDER BY n DESC LIMIT 20`).bind(since),
  ]);
  const kp = new Map(kindP95.results.map((r) => [r.g, r.p95]));
  const mp = new Map(modelP95.results.map((r) => [r.g, r.p95]));
  return json({
    ok: true,
    generatedAt: now,
    tz,
    days,
    totals: { ...(totals.results[0] || {}), p95Ms: totalP95.results[0]?.p95 ?? null },
    perDay: perDay.results,
    byKind: byKind.results.map((r) => ({ ...r, p95Ms: kp.get(r.kind) ?? null })),
    byModel: byModel.results.map((r) => ({ ...r, p95Ms: mp.get(r.model) ?? null })),
    levels: levels.results,
    blocked: blocked.results,
    flags: flags.results,
  });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
