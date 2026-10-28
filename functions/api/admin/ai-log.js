// GET /api/admin/ai-log?limit=50&offset=0[&q=&kind=&flag=&case=&level=&player=&order=asc&dev=1]
// AI calls from ai_log, newest first (order=asc for a transcript), with the player's own name.
//   q       text in the question, the reply or the player's name
//   kind    ask | topic | confront | judge | …
//   flag    blocked | broken | wrong_card | error (failed calls) | flagged (any flag)
//   case, level, player   exact ids
// Dev players are left out unless dev=1 or a player is asked for by id.
import { adminHandler, json, fail, methodNotAllowed, handler, clampInt, likeEscape, ID_RE, UUID_RE } from '../_lib.js';

export const onRequestGet = adminHandler(async ({ request, env }) => {
  const url = new URL(request.url);
  const sp = url.searchParams;
  const player = sp.get('player') || '';
  if (player && !UUID_RE.test(player)) return fail(400, 'bad_player');
  const limit = clampInt(sp.get('limit'), 1, player ? 1000 : 200, 50);
  const offset = clampInt(sp.get('offset'), 0, 1e7, 0);
  const where = [];
  const binds = [];
  const bind = (v) => { binds.push(v); return `?${binds.length}`; };
  if (player) where.push(`a.player_id = ${bind(player)}`);
  else if (sp.get('dev') !== '1') where.push(`(a.player_id IS NULL OR a.player_id NOT IN (SELECT id FROM players WHERE dev = 1))`);
  const kind = sp.get('kind') || '';
  if (kind) { if (!ID_RE.test(kind)) return fail(400, 'bad_kind'); where.push(`a.kind = ${bind(kind)}`); }
  for (const [param, col] of [['case', 'a.case_id'], ['level', 'a.level_id']]) {
    const v = sp.get(param) || '';
    if (!v) continue;
    if (!ID_RE.test(v)) return fail(400, `bad_${param}`);
    where.push(`${col} = ${bind(v)}`);
  }
  const flag = sp.get('flag') || '';
  if (flag === 'blocked') where.push(`a.flag LIKE 'blocked:%'`);
  else if (flag === 'error') where.push('a.ok = 0');
  else if (flag === 'flagged') where.push('a.flag IS NOT NULL');
  else if (flag === 'broken' || flag === 'wrong_card') where.push(`a.flag = ${bind(flag)}`);
  else if (flag) return fail(400, 'bad_flag');
  const q = (sp.get('q') || '').trim().slice(0, 80);
  if (q) {
    const p = bind(`%${likeEscape(q)}%`);
    where.push(`(a.input LIKE ${p} ESCAPE '\\' OR a.output LIKE ${p} ESCAPE '\\' OR pl.profile_name LIKE ${p} ESCAPE '\\' OR pl.detective_name LIKE ${p} ESCAPE '\\')`);
  }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = sp.get('order') === 'asc' ? 'ASC' : 'DESC';
  const db = env.DB;
  const [rows, count] = await db.batch([
    db.prepare(`SELECT a.id, a.at, a.player_id, COALESCE(pl.profile_name, pl.detective_name) AS name, pl.dev, a.case_id, a.level_id,
        a.kind, a.input, a.output, a.ms, a.model, a.ok, a.flag
      FROM ai_log a LEFT JOIN players pl ON pl.id = a.player_id ${w}
      ORDER BY a.at ${order}, a.id ${order} LIMIT ${limit} OFFSET ${offset}`).bind(...binds),
    db.prepare(`SELECT COUNT(*) AS n FROM ai_log a LEFT JOIN players pl ON pl.id = a.player_id ${w}`).bind(...binds),
  ]);
  const parse = (s) => {
    if (typeof s !== 'string' || !s.startsWith('{')) return s;
    try { return JSON.parse(s); } catch { return s; }
  };
  return json({ ok: true, total: count.results[0]?.n || 0, limit, offset, rows: rows.results.map((r) => ({ ...r, output: parse(r.output) })) });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
