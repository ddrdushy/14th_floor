// POST /api/ai/speak { case_id, level_id, text, sig } → audio/mpeg
// Voices a line the interrogation endpoint wrote (it signs every reply), in the suspect's voice from the
// level's params (suspect.voice, an ILMU voice id). Cached in KV (binding VOICE) when it is there.
import { handler, fail, readJson, methodNotAllowed, clientIp, overLimit } from '../_lib.js';
import { ttsReady, speech, signLine } from './_engine.js';
import { aiLevel } from './_cases.js';

async function keyOf(text, voice) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${voice}|${text}`)));
  return `ai-tts:${[...d].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export const onRequestPost = handler(async ({ request, env }) => {
  if (!ttsReady(env)) return fail(503, 'no_tts');
  const ip = clientIp(request);
  if (overLimit(`ai-tts:${ip}`, 30)) return fail(429, 'rate_limited');
  const body = await readJson(request, 4096);
  if (body.error) return fail(body.status, body.error);
  const { case_id: caseId, level_id: levelId, text, sig } = body.data || {};
  const p = aiLevel(String(caseId || ''), String(levelId || ''), 'interrogation');
  if (!p || typeof text !== 'string' || !text || text.length > 600) return fail(400, 'bad_line');
  if (sig !== (await signLine(env, `${caseId}|${levelId}`, text))) return fail(403, 'unsigned');
  const voice = p.suspect?.voice || 'voice_1';
  const k = await keyOf(text, voice);
  let audio = env.VOICE ? await env.VOICE.get(k, { type: 'arrayBuffer' }) : null;
  if (!audio) {
    audio = await speech(env, text, voice);
    if (env.VOICE) await env.VOICE.put(k, audio, { expirationTtl: 60 * 60 * 24 * 30 }).catch(() => {});
  }
  return new Response(audio, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'private, max-age=86400' } });
}, { needsDb: false });

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
