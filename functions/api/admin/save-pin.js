// POST /api/admin/save-pin { player_id, pin }  set a new 4-digit PIN on a player's online case file
// (a player who lost their device and forgot the PIN asks the owner; the owner tells them the new one).
import { adminHandler, json, fail, readJson, methodNotAllowed, handler, UUID_RE } from '../_lib.js';

const hex = (a) => [...a].map((b) => b.toString(16).padStart(2, '0')).join('');

export const onRequestPost = adminHandler(async ({ request, env }) => {
  const body = await readJson(request, 1024);
  if (body.error) return fail(body.status, body.error);
  const { player_id: id, pin } = body.data || {};
  if (typeof id !== 'string' || !UUID_RE.test(id)) return fail(400, 'bad_player');
  if (!/^\d{4}$/.test(String(pin ?? ''))) return fail(400, 'bad_pin');
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`floor14-pin:${salt}:${pin}`))));
  const r = await env.DB.prepare(`UPDATE saves SET pin_salt = ?2, pin_hash = ?3, pin_fails = 0, locked_until = 0 WHERE player_id = ?1`).bind(id, salt, hash).run();
  if (!r.meta?.changes) return fail(404, 'no_case_file');
  return json({ ok: true });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
