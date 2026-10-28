// The language model behind the AI mini games. Provider-agnostic:
//   - any OpenAI-compatible chat API (ILMU, Mistral, OpenAI, Groq, OpenRouter, …):
//       secret AI_API_KEY, plus optional variables AI_BASE_URL (default ILMU, https://api.ilmu.ai/v1),
//       AI_MODEL (default DEFAULT_MODEL below) and AI_REASONING (reasoning_effort, e.g. none / low)
//   - or Cloudflare Workers AI: a binding named AI (Settings → Bindings → Workers AI), used when no
//     AI_API_KEY is set; optional AI_MODEL (default @cf/meta/llama-3.3-70b-instruct-fp8-fast)
// Without either, aiReady() is false and the games fall back to answers from the case file.

export const aiReady = (env) => !!(env.AI_API_KEY || env.AI);
export const DEFAULT_BASE = 'https://api.ilmu.ai/v1';
export const DEFAULT_MODEL = 'ilmu-mini-v3.3';
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
    const effort = reasoning ?? env.AI_REASONING;
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
