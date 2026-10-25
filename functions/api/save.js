// Cloud save, filed under the detective's name and locked with a 4-digit PIN, so a player can carry on
// on another device by typing the name and the PIN.
//
//   GET  /api/save?name=<detective name>[&me=<player_id>]
//        → { ok, found: false } | { ok, found: true, name, has_pin, mine, score, brief }
//          (never the save itself, never the owner's id; `brief` is just case ids, statuses and solve counts)
//   POST /api/save  { action: 'load', name, pin }
//        → { ok, name, player_id, updated_at, score, save }
//        | 404 not_found | 409 no_pin | 403 { error: 'wrong_pin', left } | 429 { error: 'locked', retry_after }
//   POST /api/save  { player_id, name, save, pin?, force? }            (the owner's device saving)
//        → { ok, updated_at, score, has_pin }
//        | 409 name_taken                         another player keeps a case file under this name
//        | 409 { error: 'newer', save, score, … } the stored copy (another device) is further ahead;
//                                                 send again with force: true to replace it anyway
//
// The owner is the player's random id (the same one telemetry uses; never shown to anyone). The owner's
// device can set or change the PIN without the old one. Loading with the right PIN hands that id to the
// new device, so both keep saving to the same case file. Five wrong PINs lock the file for 15 minutes,
// doubling each time after that.
import {
  handler, json, fail, readJson, methodNotAllowed, UUID_RE, clientIp, overLimit, cleanName, nameKey,
} from './_lib.js';

const MAX_SAVE_BYTES = 384 * 1024;
const PIN_RE = /^\d{4}$/;
const FREE_TRIES = 5;
const LOCK_MS = 15 * 60_000;

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

/** Enough of a save to describe it ("Case 2 · 23 puzzles solved"), and nothing else. */
function briefOf(save) {
  const cases = {};
  for (const [id, cs] of Object.entries(save?.cases || {})) {
    if (!cs || typeof cs !== 'object' || !/^[a-z0-9_]{1,32}$/.test(id)) continue;
    cases[id] = { status: cs.status === 'closed' ? 'closed' : 'active', solved: Object.fromEntries(Object.keys(cs.solved || {}).slice(0, 80).map((k) => [k, 1])) };
  }
  return { cases };
}

async function sha256hex(s) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const newSalt = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
const pinHash = (salt, pin) => sha256hex(`floor14-pin:${salt}:${pin}`);

export const onRequestGet = handler(async ({ request, env }) => {
  const ip = clientIp(request);
  if (overLimit(`save-get:${ip}`, 30) || overLimit(`save-get-h:${ip}`, 300, 3_600_000)) return fail(429, 'rate_limited');
  const url = new URL(request.url);
  const key = nameKey(url.searchParams.get('name'));
  if (!key) return fail(400, 'bad_name');
  const me = url.searchParams.get('me') || '';
  const row = await env.DB.prepare(`SELECT name, player_id, data, score, pin_hash FROM saves WHERE name_key = ?1`).bind(key).first();
  if (!row) return json({ ok: true, found: false });
  let save = null;
  try { save = JSON.parse(row.data); } catch { save = null; }
  return json({ ok: true, found: true, name: row.name, has_pin: !!row.pin_hash, mine: !!me && me === row.player_id, score: row.score, brief: briefOf(save) });
});

async function load({ request, env }, body) {
  const ip = clientIp(request);
  if (overLimit(`save-load:${ip}`, 10) || overLimit(`save-load-h:${ip}`, 60, 3_600_000)) return fail(429, 'rate_limited');
  const key = nameKey(body.name);
  if (!key) return fail(400, 'bad_name');
  const pin = String(body.pin ?? '');
  if (!PIN_RE.test(pin)) return fail(400, 'bad_pin');
  const db = env.DB;
  const row = await db.prepare(`SELECT name, player_id, data, score, updated_at, pin_salt, pin_hash, pin_fails, locked_until FROM saves WHERE name_key = ?1`).bind(key).first();
  if (!row) return fail(404, 'not_found');
  if (!row.pin_hash) return fail(409, 'no_pin');
  const now = Date.now();
  if (row.locked_until > now) return json({ ok: false, error: 'locked', retry_after: Math.ceil((row.locked_until - now) / 1000) }, 429);
  if ((await pinHash(row.pin_salt, pin)) !== row.pin_hash) {
    const fails = (row.pin_fails || 0) + 1;
    const over = fails - FREE_TRIES;
    const lockedUntil = over >= 0 ? now + LOCK_MS * 2 ** Math.min(over, 6) : 0;
    await db.prepare(`UPDATE saves SET pin_fails = ?2, locked_until = ?3 WHERE name_key = ?1`).bind(key, fails, lockedUntil).run();
    if (lockedUntil) return json({ ok: false, error: 'locked', retry_after: Math.ceil((lockedUntil - now) / 1000) }, 429);
    return json({ ok: false, error: 'wrong_pin', left: FREE_TRIES - fails }, 403);
  }
  if (row.pin_fails) await db.prepare(`UPDATE saves SET pin_fails = 0, locked_until = 0 WHERE name_key = ?1`).bind(key).run();
  let save = null;
  try { save = JSON.parse(row.data); } catch { save = null; }
  if (!save) return fail(404, 'not_found');
  return json({ ok: true, name: row.name, player_id: row.player_id, updated_at: row.updated_at, score: row.score, save });
}

export const onRequestPost = handler(async (ctx) => {
  const { request, env } = ctx;
  const ip = clientIp(request);
  if (overLimit(`save-post:${ip}`, 60)) return fail(429, 'rate_limited');
  const body = await readJson(request, MAX_SAVE_BYTES + 1024);
  if (body.error) return fail(body.status, body.error);
  const b = body.data || {};
  if (b.action === 'load') return load(ctx, b);

  const { player_id: playerId, name: rawName, save, force } = b;
  if (typeof playerId !== 'string' || !UUID_RE.test(playerId)) return fail(400, 'bad_player');
  if (overLimit(`save-player:${playerId}`, 20)) return fail(429, 'rate_limited');
  const name = cleanName(rawName);
  const key = nameKey(rawName);
  if (!key) return fail(400, 'bad_name');
  const pin = b.pin == null ? null : String(b.pin);
  if (pin !== null && !PIN_RE.test(pin)) return fail(400, 'bad_pin');
  if (!save || typeof save !== 'object' || Array.isArray(save) || !save.profile || typeof save.cases !== 'object') return fail(400, 'bad_save');
  const data = JSON.stringify(save);
  if (data.length > MAX_SAVE_BYTES) return fail(413, 'too_large');
  const score = scoreOf(save);
  const db = env.DB;
  const row = await db.prepare(`SELECT name, player_id, data, score, updated_at, pin_hash FROM saves WHERE name_key = ?1`).bind(key).first();
  if (row && row.player_id !== playerId) return fail(409, 'name_taken');
  if (row && force !== true && row.score > score) {
    let stored = null;
    try { stored = JSON.parse(row.data); } catch { stored = null; }
    if (stored) return json({ ok: false, error: 'newer', name: row.name, player_id: row.player_id, updated_at: row.updated_at, score: row.score, save: stored }, 409);
  }
  const now = Date.now();
  const salt = pin ? newSalt() : null;
  const hash = pin ? await pinHash(salt, pin) : null;
  // a renamed detective takes the PIN along to the new name
  const old = !row && !pin ? await db.prepare(`SELECT pin_salt, pin_hash FROM saves WHERE player_id = ?1 AND pin_hash IS NOT NULL LIMIT 1`).bind(playerId).first() : null;
  await db.batch([
    db.prepare(`INSERT INTO saves (name_key, name, player_id, data, score, updated_at, pin_salt, pin_hash) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
      ON CONFLICT(name_key) DO UPDATE SET name = excluded.name, data = excluded.data, score = excluded.score, updated_at = excluded.updated_at,
        pin_salt = COALESCE(excluded.pin_salt, saves.pin_salt), pin_hash = COALESCE(excluded.pin_hash, saves.pin_hash),
        pin_fails = CASE WHEN excluded.pin_hash IS NOT NULL THEN 0 ELSE saves.pin_fails END,
        locked_until = CASE WHEN excluded.pin_hash IS NOT NULL THEN 0 ELSE saves.locked_until END`)
      .bind(key, name, playerId, data, score, now, salt || old?.pin_salt || null, hash || old?.pin_hash || null),
    // a renamed detective gives up the old name
    db.prepare(`DELETE FROM saves WHERE player_id = ?1 AND name_key <> ?2`).bind(playerId, key),
    db.prepare(`UPDATE players SET profile_name = ?2 WHERE id = ?1`).bind(playerId, name),
  ]);
  return json({ ok: true, updated_at: now, score, has_pin: !!(hash || row?.pin_hash || old?.pin_hash) });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
