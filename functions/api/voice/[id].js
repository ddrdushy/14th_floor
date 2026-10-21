// GET /api/voice/<id>?v=<map version>: the MP3 for one manifest line.
// Only ids in src/data/voice-manifest.json are accepted, so nobody can make this server say
// arbitrary text. The first request for a line generates it with Fish Audio and stores it in KV;
// every later request (any player) is served from KV or the edge cache.
import { json, fail, overLimit, clientIp, sameOrigin } from '../_lib.js';
import { MANIFEST, ID_RE, configured, getMap, lineAudio, audioHeaders, FishError } from './_shared.js';

const LIMIT_REQUESTS = 300; // per IP per minute, cached or not
const LIMIT_GENERATE = 30; // per IP per minute, lines not yet in KV

export async function onRequestGet(ctx) {
  const { request, env, params } = ctx;
  try {
    const id = String(params.id || '');
    if (!ID_RE.test(id) || !MANIFEST.lines[id]) return fail(404, 'unknown_line');
    if (!configured(env)) return fail(503, 'not_configured');
    if (!sameOrigin(request)) return fail(403, 'cross_origin');
    const ip = clientIp(request);
    if (overLimit(`voice:${ip}`, LIMIT_REQUESTS)) return fail(429, 'slow_down');

    const url = new URL(request.url);
    const v = Number(url.searchParams.get('v')) || 0;
    const cacheKey = new Request(`${url.origin}${url.pathname}?v=${v}`, { method: 'GET' });
    const cache = typeof caches !== 'undefined' ? caches.default : null;
    if (cache && v) {
      const hit = await cache.match(cacheKey).catch(() => null);
      if (hit) {
        const res = new Response(hit.body, hit);
        res.headers.set('x-voice-cache', 'edge');
        return notModified(request, res) || res;
      }
    }

    let map = await getMap(env);
    if (v > (Number(map._version) || 0)) map = await getMap(env, { fresh: true }); // the edge copy is older than the player's
    let out = await lineAudio(env, id, map, { generate: false });
    if (out.unvoiced) return fail(404, 'unvoiced');
    if (out.missing) {
      if (overLimit(`voice-gen:${ip}`, LIMIT_GENERATE)) return fail(429, 'slow_down');
      const job = lineAudio(env, id, map);
      ctx.waitUntil(job.catch(() => {})); // finish and store even if the player has moved on
      out = await job;
    }
    const etag = `"${id}-${out.variant}"`;
    const res = new Response(out.audio, { headers: { ...audioHeaders(etag, !!v), 'x-voice-cache': out.cached ? 'hit' : 'miss' } });
    if (cache && v) ctx.waitUntil(cache.put(cacheKey, res.clone()).catch(() => {}));
    return notModified(request, res) || res;
  } catch (err) {
    const status = err instanceof FishError ? err.status : 0;
    console.error('voice line', params.id, err && (err.message || err));
    if (status === 429) return fail(429, 'tts_busy');
    if (status === 401 || status === 402 || status === 403) return fail(503, 'tts_unavailable');
    return fail(502, 'tts_failed');
  }
}

function notModified(request, res) {
  const etag = res.headers.get('etag');
  if (etag && request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { etag, 'cache-control': res.headers.get('cache-control') } });
  }
  return null;
}

export const onRequest = () => json({ ok: false, error: 'method_not_allowed' }, 405);
