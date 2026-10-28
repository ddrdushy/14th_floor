// GET /api/admin/summary[?tz=<minutes east of UTC>&dev=1]
// Everything the admin overview draws: player counts, who is online now and today, retention,
// sessions and play time per day (30 days), new players per day, players by current stage, the
// per-puzzle funnel, per-case completion (with medians), verdicts per case, cloud saves, AI calls,
// countries and platforms. Players who used dev tools are left out of the game statistics unless dev=1.
import { adminHandler, json, methodNotAllowed, handler, clampInt, caseRankSql } from '../_lib.js';

const DAY = 86_400_000;
const MIN = 60_000;
const ALL_TYPES = `'session_start', 'case_open', 'level_solved', 'case_closed', 'profile_set'`;

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
  const dayOf = (col) => `strftime('%Y-%m-%d', (${col} + ${tz * 60_000}) / 1000, 'unixepoch')`;
  // the start of today on the owner's clock, as a UTC timestamp
  const midnight = Math.floor((now + tz * MIN) / DAY) * DAY - tz * MIN;
  const realPl = withDev ? '' : 'AND dev = 0';

  const [totals, devCount, perDay, stages, opened, funnel, verdicts, countries, platforms, events24,
    online, retention, sessionMed, activity, playtime, caseMed, saves, locked, ai24] = await db.batch([
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
    // online now: sent progress or talked to an AI suspect in the last 5 minutes; and today on the owner's clock
    db.prepare(`SELECT
        (SELECT COUNT(*) FROM (SELECT id FROM players WHERE last_seen >= ?1 ${realPl}
          UNION SELECT player_id FROM ai_log WHERE at >= ?1 AND player_id IS NOT NULL AND ${real('player_id')})) AS online,
        (SELECT COUNT(*) FROM players WHERE last_seen >= ?2 ${realPl}) AS today,
        (SELECT COUNT(*) FROM players WHERE created_at >= ?2 ${realPl}) AS newToday`).bind(now - 5 * MIN, midnight),
    // retention: of the players first seen at least 1 (7) days ago, how many came back 1 (7)+ days later
    db.prepare(`SELECT COALESCE(SUM(created_at <= ?1), 0) AS elig1, COALESCE(SUM(created_at <= ?1 AND last_seen - created_at >= ?3), 0) AS back1,
        COALESCE(SUM(created_at <= ?2), 0) AS elig7, COALESCE(SUM(created_at <= ?2 AND last_seen - created_at >= ?4), 0) AS back7,
        COALESCE(SUM(sessions), 0) AS sessions, COALESCE(SUM(sessions > 0), 0) AS withSessions, COALESCE(SUM(sessions > 1), 0) AS multi
      FROM players WHERE 1 = 1 ${realPl}`).bind(now - DAY, now - 7 * DAY, DAY, 7 * DAY),
    db.prepare(`WITH r AS (SELECT sessions AS v, ROW_NUMBER() OVER (ORDER BY sessions) AS rn, COUNT(*) OVER () AS c FROM players WHERE sessions > 0 ${realPl})
      SELECT AVG(v) AS med FROM r WHERE rn IN ((c + 1) / 2, (c + 2) / 2)`),
    // daily active players and sessions from the events (every type, so the (type, at) index is used)
    db.prepare(`SELECT ${dayOf('at')} AS day, COUNT(DISTINCT player_id) AS players, COALESCE(SUM(type = 'session_start'), 0) AS sessions
      FROM events WHERE type IN (${ALL_TYPES}) AND at >= ?1 AND ${real('player_id')} GROUP BY day ORDER BY day`).bind(since30 - DAY),
    // play time per day: puzzle time solved that day (seconds), and how many players it was spread over
    db.prepare(`SELECT ${dayOf('at')} AS day, COALESCE(SUM(time), 0) AS seconds, COUNT(DISTINCT player_id) AS players
      FROM solves WHERE at >= ?1 AND ${real('player_id')} GROUP BY day ORDER BY day`).bind(since30 - DAY),
    // medians per case for closed files: total puzzle time and hints
    db.prepare(`WITH t AS (SELECT case_id, total_time AS v, ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY total_time) AS rn, COUNT(*) OVER (PARTITION BY case_id) AS c
          FROM progress WHERE closed_at IS NOT NULL AND ${real('player_id')}),
        h AS (SELECT case_id, hints_used AS v, ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY hints_used) AS rn, COUNT(*) OVER (PARTITION BY case_id) AS c
          FROM progress WHERE closed_at IS NOT NULL AND ${real('player_id')})
      SELECT t.case_id, t.med AS medTime, h.med AS medHints FROM
        (SELECT case_id, AVG(v) AS med FROM t WHERE rn IN ((c + 1) / 2, (c + 2) / 2) GROUP BY case_id) t
        LEFT JOIN (SELECT case_id, AVG(v) AS med FROM h WHERE rn IN ((c + 1) / 2, (c + 2) / 2) GROUP BY case_id) h ON h.case_id = t.case_id`),
    db.prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(pin_hash IS NOT NULL), 0) AS withPin, COALESCE(SUM(locked_until > ?1), 0) AS locked,
        COALESCE(SUM(pin_fails > 0 AND locked_until <= ?1), 0) AS failing, COALESCE(SUM(updated_at >= ?2), 0) AS updated7, MAX(updated_at) AS lastAt FROM saves`).bind(now, now - 7 * DAY),
    db.prepare(`SELECT name, player_id, locked_until, pin_fails FROM saves WHERE locked_until > ?1 ORDER BY locked_until DESC LIMIT 20`).bind(now),
    db.prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(ok = 0), 0) AS errors, COALESCE(SUM(flag LIKE 'blocked:%'), 0) AS blocked FROM ai_log WHERE at >= ?1 AND ${real('player_id')}`).bind(now - DAY),
  ]);

  const t = totals.results[0] || {};
  const startedPlayers = stages.results.reduce((s, r) => s + r.n, 0);
  const dev = devCount.results[0]?.n || 0;
  const realPlayers = t.players || 0; // already without dev players unless dev=1
  const o = online.results[0] || {};
  const r = retention.results[0] || {};
  const med = new Map(caseMed.results.map((x) => [x.case_id, x]));
  const sv = saves.results[0] || {};
  const ai = ai24.results[0] || {};
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
      onlineNow: o.online || 0,
      activeToday: o.today || 0,
      newToday: o.newToday || 0,
      ai24h: ai.n || 0,
      aiErrors24h: ai.errors || 0,
      aiBlocked24h: ai.blocked || 0,
    },
    todayStart: midnight,
    retention: { eligible1: r.elig1 || 0, back1: r.back1 || 0, eligible7: r.elig7 || 0, back7: r.back7 || 0 },
    sessions: { total: r.sessions || 0, players: r.withSessions || 0, returning: r.multi || 0, median: sessionMed.results[0]?.med ?? null },
    activity: activity.results,
    playtime: playtime.results,
    saves: { total: sv.n || 0, withPin: sv.withPin || 0, withoutPin: (sv.n || 0) - (sv.withPin || 0), locked: sv.locked || 0, failing: sv.failing || 0, updated7d: sv.updated7 || 0, lastAt: sv.lastAt || null, lockedList: locked.results },
    newPerDay: perDay.results,
    stages: [...stages.results, { case_id: null, levels_solved: 0, closed: 0, n: Math.max(0, realPlayers - startedPlayers) }],
    cases: opened.results.map((x) => ({ ...x, medTime: med.get(x.case_id)?.medTime ?? null, medHints: med.get(x.case_id)?.medHints ?? null })),
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
