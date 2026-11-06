// POST /api/chairman/guess  a player's theory of who the Chairman is (the Sinar File, src/data/chairman.js).
//
// Body: { player_id, who, name, why?, after? }
//   who    candidate id: 'case03:kamal', 'char:bala', or 'unknown' (someone not met yet)
//   name   the candidate's display name, as the player saw it
//   why    the player's reason (≤ 280 characters), read only by the owner in the admin
//   after  the last case the player closed when they made this guess
// Answer: { ok, share } where share is the % of detectives (dev players left out) with the same current
// guess, or null while fewer than 10 have guessed. The theory is the player's own: there is no right answer
// stored anywhere, and nothing here says whether a guess is right.
import { handler, json, fail, readJson, methodNotAllowed, UUID_RE, ID_RE, clientIp, overLimit } from '../_lib.js';

const WHO_RE = /^(?:unknown|char:[a-z0-9_]{1,32}|[a-z0-9_]{1,32}:[a-z0-9_]{1,32})$/;
const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const MIN_FOR_SHARE = 10;

export const onRequestPost = handler(async ({ request, env }) => {
  const ip = clientIp(request);
  if (overLimit(`chair-ip:${ip}`, 20)) return fail(429, 'rate_limited');
  const body = await readJson(request, 4 * 1024);
  if (body.error) return fail(body.status, body.error);
  const b = body.data || {};
  if (typeof b.player_id !== 'string' || !UUID_RE.test(b.player_id)) return fail(400, 'bad_player');
  if (overLimit(`chair-player:${b.player_id}`, 10) || overLimit(`chair-player-h:${b.player_id}`, 60, 3_600_000)) return fail(429, 'rate_limited');
  const who = String(b.who || '');
  if (!WHO_RE.test(who)) return fail(400, 'bad_who');
  const label = clip(b.name, 60) || null;
  const why = clip(b.why, 280) || null;
  const after = typeof b.after === 'string' && ID_RE.test(b.after) ? b.after : null;
  const now = Date.now();
  const db = env.DB;
  const prev = await db.prepare(`SELECT who, why FROM chairman_guesses WHERE player_id = ?1`).bind(b.player_id).first();
  const same = prev && prev.who === who && (prev.why || null) === why;
  const writes = [
    db.prepare(`INSERT INTO chairman_guesses (player_id, who, label, why, after, changes, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6, ?6)
      ON CONFLICT(player_id) DO UPDATE SET who = excluded.who, label = excluded.label, why = excluded.why, after = excluded.after,
        changes = chairman_guesses.changes + CASE WHEN chairman_guesses.who <> excluded.who THEN 1 ELSE 0 END, updated_at = excluded.updated_at`)
      .bind(b.player_id, who, label, why, after, now),
  ];
  if (!same) writes.push(db.prepare(`INSERT INTO chairman_history (player_id, who, label, why, after, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`).bind(b.player_id, who, label, why, after, now));
  await db.batch(writes);
  const counts = await db.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN g.who = ?1 THEN 1 ELSE 0 END) AS same
    FROM chairman_guesses g LEFT JOIN players pl ON pl.id = g.player_id WHERE COALESCE(pl.dev, 0) = 0`).bind(who).first();
  const total = Number(counts?.total) || 0;
  const share = total >= MIN_FOR_SHARE ? Math.round(((Number(counts?.same) || 0) / total) * 100) : null;
  return json({ ok: true, share });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
