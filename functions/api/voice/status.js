// GET /api/voice/status: can this deployment speak, and which voices are assigned?
// Always 200 (the game asks once per session and must not log a console error). On a static host
// without Functions the game gets public/api/voice/status instead ({"ok":false}).
//   { ok, v, voiced: ["Narrator", ...] }   v = voice map version, appended to audio URLs as ?v=
import { json } from '../_lib.js';
import { configured, getMap, voicedNames } from './_shared.js';

export async function onRequestGet({ env }) {
  if (!configured(env)) return json({ ok: false, reason: 'not_configured' }, 200, { 'cache-control': 'public, max-age=60' });
  try {
    const map = await getMap(env);
    const voiced = voicedNames(map);
    return json({ ok: voiced.length > 0, v: Number(map._version) || 0, voiced }, 200, { 'cache-control': 'public, max-age=30' });
  } catch (err) {
    console.error('voice status', err && (err.stack || err.message || err));
    return json({ ok: false, reason: 'error' });
  }
}

export const onRequest = () => json({ ok: false, error: 'method_not_allowed' }, 405);
