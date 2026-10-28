// GET /api/admin/players?limit=50&offset=0[&q=<name or id prefix>&sort=&country=&platform=&cloud=&dev=&facets=1]
// Players with how far each has got (their furthest case and puzzles solved), puzzle play time and AI calls.
//   sort      last_seen (default) | first_seen | solved | furthest | closed | playtime | sessions
//   country   two-letter code, or ?? for unknown      platform  e.g. android/mobile, or unknown
//   cloud     1 = has an online case file, 0 = has not  dev  1 = dev players only, 0 = no dev players
//   facets=1  also the countries and platforms seen, for the filter menus
import { adminHandler, json, fail, methodNotAllowed, handler, clampInt, likeEscape, caseRankSql } from '../_lib.js';

const SORTS = {
  last_seen: 'pl.last_seen DESC',
  first_seen: 'pl.created_at DESC',
  solved: 'solves DESC, pl.last_seen DESC',
  furthest: `furthest_rank DESC, r.closed_at IS NOT NULL DESC, r.levels_solved DESC, pl.last_seen DESC`,
  closed: 'closed_cases DESC, solves DESC, pl.last_seen DESC',
  playtime: 'play_time DESC, pl.last_seen DESC',
  sessions: 'pl.sessions DESC, pl.last_seen DESC',
};

export const onRequestGet = adminHandler(async ({ request, env }) => {
  const url = new URL(request.url);
  const sp = url.searchParams;
  const limit = clampInt(sp.get('limit'), 1, 200, 50);
  const offset = clampInt(sp.get('offset'), 0, 1e7, 0);
  const sort = SORTS[sp.get('sort')] ? sp.get('sort') : 'last_seen';
  const where = [];
  const binds = [];
  const bind = (v) => { binds.push(v); return `?${binds.length}`; };
  const q = (sp.get('q') || '').trim().slice(0, 64);
  if (q) {
    const a = bind(`${likeEscape(q.toLowerCase())}%`);
    const b = bind(`%${likeEscape(q)}%`);
    const c = bind(q.toUpperCase());
    where.push(`(pl.id LIKE ${a} ESCAPE '\\' OR pl.detective_name LIKE ${b} ESCAPE '\\' OR pl.profile_name LIKE ${b} ESCAPE '\\' OR pl.country = ${c})`);
  }
  const country = (sp.get('country') || '').trim();
  if (country === '??') where.push('pl.country IS NULL');
  else if (country) {
    if (!/^[A-Z0-9]{2}$/.test(country)) return fail(400, 'bad_country');
    where.push(`pl.country = ${bind(country)}`);
  }
  const platform = (sp.get('platform') || '').trim().slice(0, 40);
  if (platform === 'unknown') where.push('pl.platform IS NULL');
  else if (platform) where.push(`pl.platform = ${bind(platform)}`);
  const cloud = sp.get('cloud');
  if (cloud === '1') where.push('EXISTS (SELECT 1 FROM saves sv WHERE sv.player_id = pl.id)');
  else if (cloud === '0') where.push('NOT EXISTS (SELECT 1 FROM saves sv WHERE sv.player_id = pl.id)');
  const dev = sp.get('dev');
  if (dev === '1') where.push('pl.dev = 1');
  else if (dev === '0') where.push('pl.dev = 0');
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const db = env.DB;
  const stmts = [
    db.prepare(`WITH ranked AS (
        SELECT player_id, case_id, levels_solved, closed_at,
          ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY ${caseRankSql('case_id')} DESC, opened_at DESC) AS rn
        FROM progress)
      SELECT pl.id, pl.created_at, pl.last_seen, COALESCE(pl.profile_name, pl.detective_name) AS name, pl.show_on_board AS shown,
        EXISTS (SELECT 1 FROM saves sv WHERE sv.player_id = pl.id) AS cloud, pl.country, pl.platform, pl.dev, pl.sessions,
        r.case_id, r.levels_solved, r.closed_at IS NOT NULL AS case_closed,
        CASE WHEN r.case_id IS NULL THEN 0 ELSE ${caseRankSql('r.case_id')} END AS furthest_rank,
        (SELECT COUNT(*) FROM progress p2 WHERE p2.player_id = pl.id AND p2.closed_at IS NOT NULL) AS closed_cases,
        (SELECT COUNT(*) FROM solves s WHERE s.player_id = pl.id) AS solves,
        (SELECT COALESCE(SUM(time), 0) FROM solves s WHERE s.player_id = pl.id) AS play_time,
        (SELECT COUNT(*) FROM ai_log a WHERE a.player_id = pl.id) AS ai_calls
      FROM players pl LEFT JOIN ranked r ON r.player_id = pl.id AND r.rn = 1
      ${w}
      ORDER BY ${SORTS[sort]} LIMIT ${limit} OFFSET ${offset}`).bind(...binds),
    db.prepare(`SELECT COUNT(*) AS n FROM players pl ${w}`).bind(...binds),
  ];
  if (sp.get('facets') === '1') {
    stmts.push(
      db.prepare(`SELECT COALESCE(country, '??') AS k, COUNT(*) AS n FROM players GROUP BY k ORDER BY n DESC LIMIT 100`),
      db.prepare(`SELECT COALESCE(platform, 'unknown') AS k, COUNT(*) AS n FROM players GROUP BY k ORDER BY n DESC LIMIT 60`),
    );
  }
  const [list, count, countries, platforms] = await db.batch(stmts);
  return json({
    ok: true, total: count.results[0]?.n || 0, limit, offset, sort, players: list.results,
    ...(countries ? { facets: { countries: countries.results, platforms: platforms.results } } : {}),
  });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
