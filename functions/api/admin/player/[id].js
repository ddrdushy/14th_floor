// GET /api/admin/player/:id  one player: profile, progress per case, solved puzzles and the event timeline.
import { adminHandler, json, fail, methodNotAllowed, handler, UUID_RE } from '../../_lib.js';

export const onRequestGet = adminHandler(async ({ env, params }) => {
  const id = String(params.id || '');
  if (!UUID_RE.test(id)) return fail(400, 'bad_player');
  const db = env.DB;
  const [player, progress, solves, events, saves] = await db.batch([
    db.prepare(`SELECT id, created_at, last_seen, COALESCE(profile_name, detective_name) AS name, show_on_board AS shown, country, platform, dev, sessions FROM players WHERE id = ?1`).bind(id),
    db.prepare(`SELECT case_id, opened_at, levels_solved, total_time, hints_used, verdict, correct, closed_at, updated_at FROM progress WHERE player_id = ?1 ORDER BY opened_at`).bind(id),
    db.prepare(`SELECT case_id, level_id, time, hints, at FROM solves WHERE player_id = ?1 ORDER BY at`).bind(id),
    db.prepare(`SELECT id, type, case_id, level_id, data, at, received_at FROM events WHERE player_id = ?1 ORDER BY at DESC, id DESC LIMIT 300`).bind(id),
    db.prepare(`SELECT name, score, updated_at, pin_hash IS NOT NULL AS has_pin, pin_fails, locked_until FROM saves WHERE player_id = ?1 LIMIT 1`).bind(id),
  ]);
  if (!player.results.length) return fail(404, 'not_found');
  const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
  return json({
    ok: true,
    player: player.results[0],
    progress: progress.results.map((r) => ({ ...r, verdict: parse(r.verdict) })),
    solves: solves.results,
    events: events.results.map((e) => ({ ...e, data: parse(e.data) })),
    save: saves.results[0] || null,
  });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
