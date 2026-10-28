// The language model behind the AI mini games. Provider-agnostic:
//   - any OpenAI-compatible chat API (ILMU, Mistral, OpenAI, Groq, OpenRouter, …):
//       secret AI_API_KEY, plus optional variables AI_BASE_URL (default ILMU, https://api.ilmu.ai/v1),
//       AI_MODEL (default DEFAULT_MODEL below) and AI_REASONING (reasoning_effort, e.g. none / low)
//   - or Cloudflare Workers AI: a binding named AI (Settings → Bindings → Workers AI), used when no
//     AI_API_KEY is set; optional AI_MODEL (default @cf/meta/llama-3.3-70b-instruct-fp8-fast)
// Without either, aiReady() is false and the games fall back to answers from the case file.

export const aiReady = (env) => !!(env.AI_API_KEY || env.AI);
export const DEFAULT_BASE = 'https://api.ilmu.ai/v1';
// ilmu-v3.1 with reasoning off stayed in character and never invented facts in testing (~0.7 s a reply);
// ilmu-mini-v3.3 was faster but made up damaging details under pressure.
export const DEFAULT_MODEL = 'ilmu-v3.1';
const DEFAULT_REASONING = { 'ilmu-v3.1': 'none' };
export const baseUrl = (env) => (env.AI_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '');
export const aiProvider = (env) => (env.AI_API_KEY ? `api:${hostOf(baseUrl(env))}` : env.AI ? 'workers-ai' : null);
function hostOf(u) { try { return new URL(u).host; } catch { return 'custom'; } }

export class AiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/** Chat completion; resolves the assistant text. `json` asks for a JSON object reply where supported. */
export async function chat(env, messages, { maxTokens = 260, temperature = 0.7, json = false, timeoutMs = 25000, model: modelOverride, reasoning } = {}) {
  if (env.AI_API_KEY) {
    const base = baseUrl(env);
    const model = modelOverride || env.AI_MODEL || DEFAULT_MODEL;
    const effort = reasoning ?? env.AI_REASONING ?? DEFAULT_REASONING[model];
    const send = async (withFormat) => {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), timeoutMs);
      try {
        return await fetch(`${base}/chat/completions`, {
          method: 'POST',
          signal: ctl.signal,
          headers: { 'content-type': 'application/json', authorization: `Bearer ${env.AI_API_KEY}` },
          body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature, ...(effort ? { reasoning_effort: effort } : {}), ...(withFormat ? { response_format: { type: 'json_object' } } : {}) }),
        });
      } finally {
        clearTimeout(t);
      }
    };
    let res = await send(json);
    if (json && res.status === 400) res = await send(false); // some providers reject response_format
    if (!res.ok) throw new AiError(res.status, `model http ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
    const d = await res.json();
    const text = d?.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new AiError(502, 'model returned no text');
    return text;
  }
  if (env.AI) {
    const model = env.AI_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
    const out = await env.AI.run(model, { messages, max_tokens: maxTokens, temperature });
    const text = typeof out === 'string' ? out : out?.response;
    if (typeof text !== 'string') throw new AiError(502, 'model returned no text');
    return text;
  }
  throw new AiError(503, 'no model configured');
}

/** The first JSON object in a model reply (models sometimes wrap it in prose or code fences). */
export function parseJsonReply(text) {
  if (typeof text !== 'string') return null;
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s < 0 || e <= s) return null;
  try { return JSON.parse(text.slice(s, e + 1)); } catch { return null; }
}

// ---------- speech (live lines from the AI games) ----------
// ILMU text-to-speech (OpenAI-style /audio/speech). Voices voice_1 … voice_5 (and OpenAI-style names).
export const ttsReady = (env) => !!env.AI_API_KEY && !env.AI_TTS_OFF;

/** Speak a line; resolves an ArrayBuffer of audio/mpeg. */
export async function speech(env, text, voice) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(`${baseUrl(env)}/audio/speech`, {
      method: 'POST', signal: ctl.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${env.AI_API_KEY}` },
      body: JSON.stringify({ model: env.AI_TTS_MODEL || 'ilmu-tts-v2.1', input: text, voice: voice || 'voice_1', response_format: 'mp3' }),
    });
    if (!res.ok) throw new AiError(res.status, `tts http ${res.status}`);
    return await res.arrayBuffer();
  } finally {
    clearTimeout(t);
  }
}

// Lines the server wrote are signed, so /api/ai/speak only ever voices them (it is not a free TTS).
async function hmacKey(env) {
  const secret = `${env.ADMIN_PASSWORD || ''}:${env.AI_API_KEY || ''}:floor14-speak`;
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
export async function signLine(env, scope, text) {
  const mac = await crypto.subtle.sign('HMAC', await hmacKey(env), new TextEncoder().encode(`${scope}|${text}`));
  return [...new Uint8Array(mac)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}
