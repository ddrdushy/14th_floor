// GET /api/admin/players?limit=50&offset=0&q=<name or id prefix>
// Players, most recently seen first, with how far each has got (their furthest case and puzzles solved).
import { adminHandler, json, methodNotAllowed, handler, clampInt, likeEscape, caseRankSql } from '../_lib.js';

export const onRequestGet = adminHandler(async ({ request, env }) => {
  const url = new URL(request.url);
  const limit = clampInt(url.searchParams.get('limit'), 1, 200, 50);
  const offset = clampInt(url.searchParams.get('offset'), 0, 1e7, 0);
  const q = (url.searchParams.get('q') || '').trim().slice(0, 64);
  const where = q ? `WHERE (pl.id LIKE ?1 ESCAPE '\\' OR pl.detective_name LIKE ?2 ESCAPE '\\' OR pl.profile_name LIKE ?2 ESCAPE '\\' OR pl.country = ?3)` : '';
  const binds = q ? [`${likeEscape(q.toLowerCase())}%`, `%${likeEscape(q)}%`, q.toUpperCase()] : [];
  const db = env.DB;
  const [list, count] = await db.batch([
    db.prepare(`WITH ranked AS (
        SELECT player_id, case_id, levels_solved, closed_at,
          ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY ${caseRankSql('case_id')} DESC, opened_at DESC) AS rn
        FROM progress)
      SELECT pl.id, pl.created_at, pl.last_seen, COALESCE(pl.profile_name, pl.detective_name) AS name, pl.show_on_board AS shown,
        EXISTS (SELECT 1 FROM saves sv WHERE sv.player_id = pl.id) AS cloud, pl.country, pl.platform, pl.dev, pl.sessions,
        r.case_id, r.levels_solved, r.closed_at IS NOT NULL AS case_closed,
        (SELECT COUNT(*) FROM progress p2 WHERE p2.player_id = pl.id AND p2.closed_at IS NOT NULL) AS closed_cases,
        (SELECT COUNT(*) FROM solves s WHERE s.player_id = pl.id) AS solves
      FROM players pl LEFT JOIN ranked r ON r.player_id = pl.id AND r.rn = 1
      ${where}
      ORDER BY pl.last_seen DESC LIMIT ${limit} OFFSET ${offset}`).bind(...binds),
    db.prepare(`SELECT COUNT(*) AS n FROM players pl ${where}`).bind(...binds),
  ]);
  return json({ ok: true, total: count.results[0]?.n || 0, limit, offset, players: list.results });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
