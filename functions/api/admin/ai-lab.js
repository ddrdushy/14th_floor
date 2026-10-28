// POST /api/admin/ai-lab  the owner's test bench for the language / speech provider.
//   { op: 'models' }                                         the provider's model list
//   { op: 'chat', model?, reasoning?, maxTokens?, case_id, level_id, lie_id?, question }
//        one interrogation answer with timing, to compare models before choosing AI_MODEL
//   { op: 'speech', model?, voice?, text }                   try the provider's /audio/speech; returns
//        status, content type, size and (for small replies) the error text
import { adminHandler, json, fail, readJson, methodNotAllowed, handler } from '../_lib.js';
import { chat, baseUrl, parseJsonReply } from '../ai/_engine.js';
import { aiLevel } from '../ai/_cases.js';
import { sheet } from '../ai/interrogate.js';

export const onRequestPost = adminHandler(async ({ request, env }) => {
  if (!env.AI_API_KEY) return fail(503, 'no_key');
  const body = await readJson(request, 8192);
  if (body.error) return fail(body.status, body.error);
  const b = body.data || {};
  const auth = { authorization: `Bearer ${env.AI_API_KEY}` };
  if (b.op === 'models') {
    const r = await fetch(`${baseUrl(env)}/models`, { headers: auth });
    const d = await r.json().catch(() => null);
    return json({ ok: r.ok, status: r.status, models: (d?.data || []).map((m) => m.id) });
  }
  if (b.op === 'chat') {
    const p = aiLevel(String(b.case_id || ''), String(b.level_id || ''), 'interrogation');
    if (!p) return fail(404, 'no_such_level');
    const lie = (p.lies || []).find((l) => l.id === b.lie_id) || p.lies[0];
    const t0 = Date.now();
    try {
      const text = await chat(env, [{ role: 'system', content: sheet(p, lie) }, { role: 'user', content: String(b.question || 'Where were you at 11:47?').slice(0, 300) }],
        { json: true, model: b.model, reasoning: b.reasoning, maxTokens: Number(b.maxTokens) || 600, timeoutMs: 60000 });
      return json({ ok: true, ms: Date.now() - t0, lie: lie.id, raw: text.slice(0, 1200), parsed: parseJsonReply(text) });
    } catch (err) {
      return json({ ok: false, ms: Date.now() - t0, error: String(err?.message || err).slice(0, 400) });
    }
  }
  if (b.op === 'speech') {
    const t0 = Date.now();
    const r = await fetch(`${baseUrl(env)}/audio/speech`, {
      method: 'POST', headers: { ...auth, 'content-type': 'application/json' },
      body: JSON.stringify({ model: b.model || 'ilmu-tts-v2.1', input: String(b.text || 'Selamat malam, detektif.').slice(0, 400), ...(b.voice ? { voice: b.voice } : {}), ...(b.format ? { response_format: b.format } : {}) }),
    });
    const type = r.headers.get('content-type') || '';
    const buf = await r.arrayBuffer();
    const small = buf.byteLength < 4000 ? new TextDecoder().decode(buf) : null;
    return json({ ok: r.ok, status: r.status, ms: Date.now() - t0, type, bytes: buf.byteLength, text: small });
  }
  return fail(400, 'bad_op');
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
