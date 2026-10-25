// Cloud save, filed under the detective's name, so a player can carry on on another device by typing it.
//
//   GET  /api/save?name=<detective name>
//        → { ok, found: false } | { ok, found: true, name, player_id, updated_at, score, save }
//   POST /api/save  { player_id, name, save, force? }
//        → { ok, updated_at, score }
//        | 409 { error: 'name_taken' }            another player already keeps a case file under this name
//        | 409 { error: 'newer', save, score, … } the stored copy (from another device) is further ahead;
//                                                 send again with force: true to replace it anyway
//
// The name is the only key, by the owner's choice: anyone who types it can load that progress. The
// player's random id (the same one telemetry uses) owns the name; loading a save on a new device takes
// that id over, which is what lets the new device keep saving under the name.
import {
  handler, json, fail, readJson, methodNotAllowed, UUID_RE, clientIp, overLimit, cleanName, nameKey,
} from './_lib.js';

const MAX_SAVE_BYTES = 384 * 1024;

/** How far a save has got: puzzles solved, plus a big step for every closed case. */
export function scoreOf(save) {
  let n = 0;
  const cases = save && typeof save.cases === 'object' && save.cases ? save.cases : {};
  for (const cs of Object.values(cases)) {
    if (!cs || typeof cs !== 'object') continue;
    n += Object.keys(cs.solved && typeof cs.solved === 'object' ? cs.solved : {}).length;
    if (cs.status === 'closed') n += 50;
  }
  return n;
}

export const onRequestGet = handler(async ({ request, env }) => {
  const ip = clientIp(request);
  if (overLimit(`save-get:${ip}`, 30) || overLimit(`save-get-h:${ip}`, 300, 3_600_000)) return fail(429, 'rate_limited');
  const key = nameKey(new URL(request.url).searchParams.get('name'));
  if (!key) return fail(400, 'bad_name');
  const row = await env.DB.prepare(`SELECT name, player_id, data, score, updated_at FROM saves WHERE name_key = ?1`).bind(key).first();
  if (!row) return json({ ok: true, found: false });
  let save = null;
  try { save = JSON.parse(row.data); } catch { save = null; }
  if (!save) return json({ ok: true, found: false });
  return json({ ok: true, found: true, name: row.name, player_id: row.player_id, updated_at: row.updated_at, score: row.score, save });
});

export const onRequestPost = handler(async ({ request, env }) => {
  const ip = clientIp(request);
  if (overLimit(`save-post:${ip}`, 60)) return fail(429, 'rate_limited');
  const body = await readJson(request, MAX_SAVE_BYTES + 1024);
  if (body.error) return fail(body.status, body.error);
  const { player_id: playerId, name: rawName, save, force } = body.data || {};
  if (typeof playerId !== 'string' || !UUID_RE.test(playerId)) return fail(400, 'bad_player');
  if (overLimit(`save-player:${playerId}`, 20)) return fail(429, 'rate_limited');
  const name = cleanName(rawName);
  const key = nameKey(rawName);
  if (!key) return fail(400, 'bad_name');
  if (!save || typeof save !== 'object' || Array.isArray(save) || !save.profile || typeof save.cases !== 'object') return fail(400, 'bad_save');
  const data = JSON.stringify(save);
  if (data.length > MAX_SAVE_BYTES) return fail(413, 'too_large');
  const score = scoreOf(save);
  const db = env.DB;
  const row = await db.prepare(`SELECT player_id, data, score, updated_at FROM saves WHERE name_key = ?1`).bind(key).first();
  if (row && row.player_id !== playerId) return fail(409, 'name_taken');
  if (row && force !== true && row.score > score) {
    let stored = null;
    try { stored = JSON.parse(row.data); } catch { stored = null; }
    if (stored) return json({ ok: false, error: 'newer', name: row.name, player_id: row.player_id, updated_at: row.updated_at, score: row.score, save: stored }, 409);
  }
  const now = Date.now();
  await db.batch([
    // a renamed detective gives up the old name
    db.prepare(`DELETE FROM saves WHERE player_id = ?1 AND name_key <> ?2`).bind(playerId, key),
    db.prepare(`INSERT INTO saves (name_key, name, player_id, data, score, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      ON CONFLICT(name_key) DO UPDATE SET name = excluded.name, data = excluded.data, score = excluded.score, updated_at = excluded.updated_at`)
      .bind(key, name, playerId, data, score, now),
    db.prepare(`UPDATE players SET profile_name = ?2 WHERE id = ?1`).bind(playerId, name),
  ]);
  return json({ ok: true, updated_at: now, score });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
