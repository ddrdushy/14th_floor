// GET /api/leaderboard?case=case01[&me=<player id>]   (case=overall or no case: the overall board)
//
// Every fair run is ranked (case closed, no dev tools, not skipped through). Per case: correct verdict
// first, then total puzzle time, then magnifiers used, then who closed it first. Overall: cases closed
// correctly, cases closed, total time, magnifiers.
//
// - `rows`: the top 50 among players who chose to show their detective name, each with their rank
//   among *all* ranked players (so a gap in the numbers is a detective who keeps their name private).
// - `total`: how many players are ranked; `named`: how many of them show their name.
// - `me` adds `you` (the caller's own standing, even with the name hidden) and `near`: the caller's
//   rank plus the 2 players above and the 2 below. In `near`, a player who did not opt in to showing
//   their name (players.show_on_board) has `name: null, anon: true`; the game shows "A detective".
// - Each row carries `mode`, the difficulty the player last played on ('story' | 'detective' |
//   'hardboiled'; null for players not seen since difficulty modes shipped). It is a label only and
//   never changes the ranking.
// Player ids are never returned.
import { handler, json, fail, methodNotAllowed, ID_RE, UUID_RE, MIN_SECONDS_PER_LEVEL } from './_lib.js';

const LIMIT = 50;
const NEAR = 2; // rivals each side of the caller
// a run counts when the case is closed, it was not played with dev tools, and it was not skipped through
const FAIR = `p.closed_at IS NOT NULL AND pl.dev = 0 AND p.total_time >= p.levels_solved * ${MIN_SECONDS_PER_LEVEL}`;
const SHOWN = `r.shown = 1 AND r.name IS NOT NULL AND r.name <> ''`;
const MODES = new Set(['story', 'detective', 'hardboiled']);
const mode = (v) => (MODES.has(v) ? v : null);

// Ranked runs (`r`, with `rk` = rank among everyone ranked). Ids are inlined only as bound parameters.
const caseRanked = `WITH r AS (
  SELECT pl.id AS pid, pl.detective_name AS name, pl.show_on_board AS shown, pl.difficulty AS mode,
         p.correct, p.total_time AS time, p.hints_used AS hints, p.levels_solved AS levels, p.closed_at,
         ROW_NUMBER() OVER (ORDER BY p.correct DESC, p.total_time ASC, p.hints_used ASC, p.closed_at ASC, pl.id ASC) AS rk
  FROM progress p JOIN players pl ON pl.id = p.player_id
  WHERE p.case_id = ?1 AND ${FAIR})`;

const overallRanked = `WITH b AS (
  SELECT pl.id AS pid, pl.detective_name AS name, pl.show_on_board AS shown, pl.difficulty AS mode,
         SUM(p.correct) AS correct, COUNT(*) AS closed, SUM(p.total_time) AS time, SUM(p.hints_used) AS hints
  FROM progress p JOIN players pl ON pl.id = p.player_id
  WHERE ${FAIR}
  GROUP BY pl.id),
r AS (SELECT b.*, ROW_NUMBER() OVER (ORDER BY correct DESC, closed DESC, time ASC, hints ASC, pid ASC) AS rk FROM b)`;

/** Top rows, counts and (with `me`) the caller's neighbourhood, in one D1 round trip. */
async function ranked(db, base, bind, me) {
  const stmts = [
    db.prepare(`${base} SELECT * FROM r WHERE ${SHOWN} ORDER BY rk LIMIT ${LIMIT}`).bind(...bind),
    db.prepare(`${base} SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN ${SHOWN} THEN 1 ELSE 0 END), 0) AS named FROM r`).bind(...bind),
  ];
  if (me) {
    const meIdx = bind.length + 1;
    stmts.push(db.prepare(
      `${base} SELECT r.* FROM r, (SELECT rk AS mine FROM r WHERE pid = ?${meIdx}) m
       WHERE r.rk BETWEEN m.mine - ${NEAR} AND m.mine + ${NEAR} ORDER BY r.rk`,
    ).bind(...bind, me));
  }
  const [top, counts, near] = await db.batch(stmts);
  return { top: top.results || [], total: counts.results?.[0]?.total || 0, named: counts.results?.[0]?.named || 0, near: near ? near.results || [] : null };
}

/** A row in the neighbourhood: names only for players who chose to show them. */
const nearRow = (r, me, extra) => {
  const shown = !!r.shown && !!r.name;
  return { rank: r.rk, name: shown ? r.name : null, anon: !shown, mode: mode(r.mode), you: r.pid === me, time: r.time, hints: r.hints, ...extra(r) };
};

function nearOf(rows, me, total, extra) {
  if (!rows || !rows.length) return null;
  const mine = rows.find((r) => r.pid === me);
  if (!mine) return null;
  return { rank: mine.rk, total, rows: rows.map((r) => nearRow(r, me, extra)) };
}

async function caseBoard(db, caseId, me) {
  const { top, total, named, near } = await ranked(db, caseRanked, [caseId], me);
  const extra = (r) => ({ correct: !!r.correct, levels: r.levels });
  let you = null;
  let around = null;
  if (me) {
    const mine = await db.prepare(
      `SELECT p.correct, p.total_time AS time, p.hints_used AS hints, p.levels_solved AS levels, p.closed_at, pl.dev,
              pl.show_on_board AS shown, (${FAIR}) AS fair
       FROM progress p JOIN players pl ON pl.id = p.player_id WHERE p.case_id = ?1 AND p.player_id = ?2`,
    ).bind(caseId, me).first();
    around = nearOf(near, me, total, extra);
    if (mine && mine.closed_at) {
      you = { rank: mine.fair ? around?.rank ?? null : null, correct: !!mine.correct, time: mine.time, hints: mine.hints, levels: mine.levels, shown: !!mine.shown, eligible: !!mine.fair, dev: !!mine.dev, closed: true };
    } else you = { closed: false };
  }
  return {
    rows: top.map((r) => ({ rank: r.rk, name: r.name, mode: mode(r.mode), correct: !!r.correct, time: r.time, hints: r.hints, levels: r.levels, you: !!me && r.pid === me })),
    total,
    named,
    you,
    near: around,
  };
}

async function overallBoard(db, me) {
  const { top, total, named, near } = await ranked(db, overallRanked, [], me);
  const extra = (r) => ({ correct: r.correct, closed: r.closed });
  let you = null;
  let around = null;
  if (me) {
    around = nearOf(near, me, total, extra);
    const mine = near?.find((r) => r.pid === me);
    if (mine) {
      you = { rank: mine.rk, correct: mine.correct, closedCases: mine.closed, time: mine.time, hints: mine.hints, shown: !!mine.shown, eligible: true, closed: true };
    } else {
      const player = await db.prepare(`SELECT dev, show_on_board AS shown FROM players WHERE id = ?1`).bind(me).first();
      you = { closed: false, dev: !!player?.dev, shown: !!player?.shown, eligible: !player?.dev };
    }
  }
  return {
    rows: top.map((r) => ({ rank: r.rk, name: r.name, mode: mode(r.mode), correct: r.correct, closed: r.closed, time: r.time, hints: r.hints, you: !!me && r.pid === me })),
    total,
    named,
    you,
    near: around,
  };
}

export const onRequestGet = handler(async ({ request, env }) => {
  const url = new URL(request.url);
  const caseId = url.searchParams.get('case') || 'overall';
  if (caseId !== 'overall' && !ID_RE.test(caseId)) return fail(400, 'bad_case');
  const meRaw = url.searchParams.get('me');
  const me = meRaw && UUID_RE.test(meRaw) ? meRaw : null;
  const board = caseId === 'overall' ? await overallBoard(env.DB, me) : await caseBoard(env.DB, caseId, me);
  // a personal board is never stored by a shared cache; the service worker never caches /api at all
  return json({ ok: true, case: caseId, ...board }, 200, { 'cache-control': me ? 'private, no-store' : 'public, max-age=30' });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
