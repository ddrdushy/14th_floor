// GET /api/leaderboard?case=case01[&me=<player id>]   (case=overall or no case: the overall board)
// Top 50 among players who chose to show their detective name. Per case: correct verdict first,
// then total puzzle time, then magnifiers used. Overall: cases closed correctly, cases closed,
// total time, magnifiers. `me` adds the caller's own standing (even when their name is hidden).
// Player ids are never returned.
import { handler, json, fail, methodNotAllowed, ID_RE, UUID_RE, MIN_SECONDS_PER_LEVEL } from './_lib.js';

const LIMIT = 50;
// a run counts when the case is closed, it was not played with dev tools, and it was not skipped through
const FAIR = `p.closed_at IS NOT NULL AND pl.dev = 0 AND p.total_time >= p.levels_solved * ${MIN_SECONDS_PER_LEVEL}`;
const SHOWN = `pl.show_on_board = 1 AND pl.detective_name IS NOT NULL AND pl.detective_name <> ''`;

async function caseBoard(db, caseId, me) {
  const { results } = await db.prepare(
    `SELECT pl.id AS pid, pl.detective_name AS name, p.correct, p.total_time AS time, p.hints_used AS hints, p.levels_solved AS levels, p.closed_at
     FROM progress p JOIN players pl ON pl.id = p.player_id
     WHERE p.case_id = ?1 AND ${FAIR} AND ${SHOWN}
     ORDER BY p.correct DESC, p.total_time ASC, p.hints_used ASC, p.closed_at ASC
     LIMIT ${LIMIT}`,
  ).bind(caseId).all();
  const total = await db.prepare(
    `SELECT COUNT(*) AS n FROM progress p JOIN players pl ON pl.id = p.player_id WHERE p.case_id = ?1 AND ${FAIR} AND ${SHOWN}`,
  ).bind(caseId).first();
  let you = null;
  if (me) {
    const mine = await db.prepare(
      `SELECT p.correct, p.total_time AS time, p.hints_used AS hints, p.levels_solved AS levels, p.closed_at, pl.dev,
              pl.show_on_board AS shown, (${FAIR}) AS fair
       FROM progress p JOIN players pl ON pl.id = p.player_id WHERE p.case_id = ?1 AND p.player_id = ?2`,
    ).bind(caseId, me).first();
    if (mine && mine.closed_at) {
      const better = await db.prepare(
        `SELECT COUNT(*) AS n FROM progress p JOIN players pl ON pl.id = p.player_id
         WHERE p.case_id = ?1 AND ${FAIR} AND ${SHOWN} AND p.player_id <> ?2 AND (
           p.correct > ?3 OR (p.correct = ?3 AND (p.total_time < ?4 OR (p.total_time = ?4 AND (p.hints_used < ?5 OR (p.hints_used = ?5 AND p.closed_at < ?6))))))`,
      ).bind(caseId, me, mine.correct, mine.time, mine.hints, mine.closed_at).first();
      you = { rank: mine.fair ? better.n + 1 : null, correct: !!mine.correct, time: mine.time, hints: mine.hints, levels: mine.levels, shown: !!mine.shown, eligible: !!mine.fair, dev: !!mine.dev, closed: true };
    } else you = { closed: false };
  }
  return {
    rows: results.map((r, i) => ({ rank: i + 1, name: r.name, correct: !!r.correct, time: r.time, hints: r.hints, levels: r.levels, you: !!me && r.pid === me })),
    total: total?.n || 0,
    you,
  };
}

const OVERALL = `SELECT pl.id AS pid, pl.detective_name AS name, pl.show_on_board AS shown,
    SUM(p.correct) AS correct, COUNT(*) AS closed, SUM(p.total_time) AS time, SUM(p.hints_used) AS hints
  FROM progress p JOIN players pl ON pl.id = p.player_id
  WHERE ${FAIR}
  GROUP BY pl.id`;
const OVERALL_ORDER = `ORDER BY correct DESC, closed DESC, time ASC, hints ASC`;

async function overallBoard(db, me) {
  const { results } = await db.prepare(`SELECT * FROM (${OVERALL}) b WHERE b.shown = 1 AND b.name IS NOT NULL AND b.name <> '' ${OVERALL_ORDER} LIMIT ${LIMIT}`).all();
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM (${OVERALL}) b WHERE b.shown = 1 AND b.name IS NOT NULL AND b.name <> ''`).first();
  let you = null;
  if (me) {
    const mine = await db.prepare(`SELECT * FROM (${OVERALL}) b WHERE b.pid = ?1`).bind(me).first();
    const player = await db.prepare(`SELECT dev, show_on_board AS shown FROM players WHERE id = ?1`).bind(me).first();
    if (mine) {
      const better = await db.prepare(
        `SELECT COUNT(*) AS n FROM (${OVERALL}) b WHERE b.shown = 1 AND b.name IS NOT NULL AND b.name <> '' AND b.pid <> ?1 AND (
          b.correct > ?2 OR (b.correct = ?2 AND (b.closed > ?3 OR (b.closed = ?3 AND (b.time < ?4 OR (b.time = ?4 AND b.hints < ?5))))))`,
      ).bind(me, mine.correct, mine.closed, mine.time, mine.hints).first();
      you = { rank: better.n + 1, correct: mine.correct, closedCases: mine.closed, time: mine.time, hints: mine.hints, shown: !!mine.shown, eligible: true, closed: true };
    } else you = { closed: false, dev: !!player?.dev, shown: !!player?.shown, eligible: !player?.dev };
  }
  return {
    rows: results.map((r, i) => ({ rank: i + 1, name: r.name, correct: r.correct, closed: r.closed, time: r.time, hints: r.hints, you: !!me && r.pid === me })),
    total: total?.n || 0,
    you,
  };
}

export const onRequestGet = handler(async ({ request, env }) => {
  const url = new URL(request.url);
  const caseId = url.searchParams.get('case') || 'overall';
  if (caseId !== 'overall' && !ID_RE.test(caseId)) return fail(400, 'bad_case');
  const meRaw = url.searchParams.get('me');
  const me = meRaw && UUID_RE.test(meRaw) ? meRaw : null;
  const board = caseId === 'overall' ? await overallBoard(env.DB, me) : await caseBoard(env.DB, caseId, me);
  return json({ ok: true, case: caseId, ...board }, 200, { 'cache-control': me ? 'private, max-age=10' : 'public, max-age=30' });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
