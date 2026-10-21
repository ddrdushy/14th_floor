// /api/admin/voices/*: casting voices for the dialogue. Authorization: Bearer <ADMIN_PASSWORD>.
//
//   GET  /api/admin/voices                 speakers (from the manifest), the voice map, config state
//   GET  /api/admin/voices/cache           cached line counts per speaker (one KV list per speaker)
//   GET  /api/admin/voices/lines?voice=X   that speaker's lines, each marked cached / stale / missing
//   GET  /api/admin/voices/map             the voice map
//   PUT  /api/admin/voices/map             replace the voice map  { "<voice>": { reference_id, speed?, model?, off?, title?, cover? }, "_default": {...}, "_settings": {...} }
//   GET  /api/admin/voices/search?q=&lang=&page=&sort=&self=   Fish Audio voice models
//   POST /api/admin/voices/preview         { voice, id? | text?, reference_id?, model?, speed? } -> audio/mpeg (kept a day)
//   POST /api/admin/voices/purge           { voice } | { all: true }   delete stored audio; the next play regenerates
//   POST /api/admin/voices/generate        { voice? , max? }  generate missing lines in the background
//   GET  /api/admin/voices/job             the last generation run
import { json, fail, readJson, requireAdmin, sameOrigin } from '../../_lib.js';
import {
  MANIFEST, MODELS, KEYS, RESERVED, ID_RE, configured, getMap, putMap, resolveVoice, ttsParams, fishTTS, fishSearch,
  lineAudio, linesFor, listKeys, audioPrefix, voiceNames, FishError,
} from '../../voice/_shared.js';
import { hashText } from '../../../../src/core/voice.js';

const BATCH_MAX = 30; // lines per generate call
const BATCH_CONCURRENCY = 2; // Fish Starter tier allows 5 concurrent requests
const BATCH_BUDGET_MS = 25_000; // stop starting new lines after this (waitUntil has ~30 s)

export async function onRequest(ctx) {
  const { request, env, params } = ctx;
  try {
    if (!sameOrigin(request)) return fail(403, 'cross_origin');
    const deny = await requireAdmin(ctx);
    if (deny) return deny;
    if (!env.VOICE) return fail(503, 'not_configured', { message: 'KV namespace VOICE is not bound' });
    const path = [].concat(params.path || []).join('/');
    const route = `${request.method} ${path}`;
    switch (route) {
      case 'GET ':
      case 'GET speakers': return overview(env);
      case 'GET cache': return cacheCounts(env);
      case 'GET lines': return lines(env, new URL(request.url).searchParams.get('voice'));
      case 'GET map': return json({ ok: true, map: await getMap(env, { fresh: true }) });
      case 'PUT map': return saveMap(env, request);
      case 'GET search': return search(env, new URL(request.url).searchParams);
      case 'POST preview': return preview(env, request);
      case 'POST purge': return purge(env, request);
      case 'POST generate': return generate(ctx);
      case 'GET job': return json({ ok: true, job: (await env.VOICE.get(KEYS.job, { type: 'json' })) || null });
      default: return fail(404, 'not_found');
    }
  } catch (err) {
    if (err instanceof FishError) return fail(err.status === 401 || err.status === 402 ? err.status : 502, 'fish_error', { status: err.status, message: err.message.slice(0, 200) });
    console.error('admin voices', err && (err.stack || err.message || err));
    return fail(500, 'server_error');
  }
}

async function overview(env) {
  const map = await getMap(env, { fresh: true });
  const speakers = voiceNames().map((name) => {
    const s = MANIFEST.speakers[name];
    const sample = linesFor(name).slice(0, 1).map(([id, e]) => ({ id, text: e.text, en: e.en }))[0] || null;
    return { name, lines: s.lines, chars: s.chars, langs: s.langs, shownAs: s.shownAs || [], voice: map[name] || null, voiced: !!resolveVoice(map, name), sample };
  });
  return json({
    ok: true,
    configured: { kv: !!env.VOICE, fish: !!env.FISH_API_KEY, stub: !!env.FISH_API_BASE },
    models: MODELS,
    totals: { lines: Object.keys(MANIFEST.lines).length, bytes: Object.values(MANIFEST.lines).reduce((n, e) => n + new TextEncoder().encode(e.tts || e.text).length, 0) },
    speakers,
    map,
  });
}

async function cacheCounts(env) {
  const map = await getMap(env, { fresh: true });
  const out = {};
  for (const name of voiceNames()) {
    const keys = await listKeys(env, audioPrefix(name));
    const voice = resolveVoice(map, name);
    const current = new Set();
    if (voice) for (const [id, e] of linesFor(name)) current.add(`${audioPrefix(name)}${id}:${ttsParams(env, map, e, voice).variant}`);
    out[name] = { stored: keys.length, current: keys.filter((k) => current.has(k.name)).length, total: MANIFEST.speakers[name].lines };
  }
  return json({ ok: true, cache: out });
}

async function lines(env, name) {
  if (!name || !MANIFEST.speakers[name]) return fail(404, 'unknown_voice');
  const map = await getMap(env, { fresh: true });
  const voice = resolveVoice(map, name);
  const stored = new Set((await listKeys(env, audioPrefix(name))).map((k) => k.name));
  const storedIds = new Set([...stored].map((k) => k.split(':')[2]));
  return json({
    ok: true,
    voice: name,
    lines: linesFor(name).map(([id, e]) => {
      const key = voice ? `${audioPrefix(name)}${id}:${ttsParams(env, map, e, voice).variant}` : null;
      return { id, speaker: e.speaker, text: e.text, en: e.en, tts: e.tts || null, lang: e.lang, where: e.where, state: key && stored.has(key) ? 'cached' : storedIds.has(id) ? 'stale' : 'missing' };
    }),
  });
}

const REF_RE = /^[A-Za-z0-9_-]{1,64}$/;
function cleanEntry(e, { settings = false } = {}) {
  if (!e || typeof e !== 'object') return null;
  if (settings) {
    const out = {};
    if (MODELS.includes(e.model)) out.model = e.model;
    for (const k of ['temperature', 'top_p']) if (Number.isFinite(Number(e[k]))) out[k] = Math.min(1, Math.max(0, Number(e[k])));
    if ([64, 128, 192].includes(Number(e.mp3_bitrate))) out.mp3_bitrate = Number(e.mp3_bitrate);
    if (['low', 'normal', 'balanced'].includes(e.latency)) out.latency = e.latency;
    return out;
  }
  const out = {};
  if (typeof e.reference_id === 'string' && REF_RE.test(e.reference_id)) out.reference_id = e.reference_id;
  if (Number.isFinite(Number(e.speed)) && e.speed !== null && e.speed !== '') out.speed = Math.min(2, Math.max(0.5, Number(e.speed)));
  if (Number.isFinite(Number(e.volume)) && e.volume !== null && e.volume !== '') out.volume = Math.min(20, Math.max(-20, Number(e.volume)));
  if (MODELS.includes(e.model)) out.model = e.model;
  if (e.off === true) out.off = true;
  if (Number.isInteger(e.take) && e.take > 0) out.take = e.take;
  if (typeof e.title === 'string') out.title = e.title.slice(0, 120);
  if (typeof e.cover === 'string' && /^https:\/\//.test(e.cover)) out.cover = e.cover.slice(0, 400);
  if (Array.isArray(e.languages)) out.languages = e.languages.filter((l) => typeof l === 'string').slice(0, 12).map((l) => l.slice(0, 12));
  return Object.keys(out).length ? out : null;
}

async function saveMap(env, request) {
  const body = await readJson(request, 64 * 1024);
  if (body.error) return fail(body.status, body.error);
  const incoming = body.data && typeof body.data === 'object' ? body.data.map || body.data : null;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return fail(400, 'bad_map');
  const known = new Set(voiceNames());
  const old = await getMap(env, { fresh: true });
  const map = { _version: (Number(old._version) || 0) + 1 };
  for (const [k, v] of Object.entries(incoming)) {
    if (k === '_version') continue;
    if (!known.has(k) && !RESERVED.has(k)) continue; // unknown speakers are dropped
    const e = cleanEntry(v, { settings: k === '_settings' });
    if (e) map[k] = e;
  }
  // keep each speaker's take counter unless the client sent one
  for (const k of Object.keys(old)) if (old[k]?.take && map[k] && !map[k].take) map[k].take = old[k].take;
  await putMap(env, map);
  return json({ ok: true, map });
}

async function search(env, sp) {
  if (!env.FISH_API_KEY) return fail(503, 'not_configured', { message: 'FISH_API_KEY is not set' });
  const out = await fishSearch(env, {
    q: sp.get('q') || '', lang: sp.get('lang') || '', page: Number(sp.get('page')) || 1,
    size: Number(sp.get('size')) || 20, sort: sp.get('sort') || 'score', self: sp.get('self') === '1' || sp.get('self') === 'true',
  });
  return json({ ok: true, ...out });
}

async function preview(env, request) {
  if (!configured(env)) return fail(503, 'not_configured', { message: 'FISH_API_KEY is not set' });
  const body = await readJson(request, 8192);
  if (body.error) return fail(body.status, body.error);
  const { voice: name, id, text, reference_id, model, speed } = body.data || {};
  if (!name || !MANIFEST.speakers[name]) return fail(404, 'unknown_voice');
  if (reference_id != null && (typeof reference_id !== 'string' || !REF_RE.test(reference_id))) return fail(400, 'bad_reference_id');
  let entry;
  if (id) {
    if (!ID_RE.test(id) || !MANIFEST.lines[id]) return fail(404, 'unknown_line');
    entry = MANIFEST.lines[id];
  } else if (typeof text === 'string' && text.trim()) {
    entry = { text: text.trim().slice(0, 300), lang: 'en' };
  } else {
    entry = linesFor(name)[0]?.[1];
  }
  const map = await getMap(env, { fresh: true });
  const voice = reference_id ? { ...(map[name] || {}), reference_id, off: false } : resolveVoice(map, name);
  if (!voice || !voice.reference_id) return fail(400, 'no_voice', { message: 'Pick a voice first' });
  const p = ttsParams(env, map, entry, voice, { model, speed, reference_id });
  const key = `preview:${hashText(JSON.stringify([p.variant, p.reference_id]))}`;
  let audio = await env.VOICE.get(key, { type: 'arrayBuffer' });
  if (!audio) {
    audio = await fishTTS(env, p);
    await env.VOICE.put(key, audio, { expirationTtl: 86400 });
  }
  return new Response(audio, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}

async function purge(env, request) {
  const body = await readJson(request, 4096);
  if (body.error) return fail(body.status, body.error);
  const { voice: name, all } = body.data || {};
  const names = all === true ? voiceNames() : name && MANIFEST.speakers[name] ? [name] : null;
  if (!names) return fail(404, 'unknown_voice');
  let deleted = 0;
  for (const n of names) {
    const keys = await listKeys(env, audioPrefix(n));
    for (let i = 0; i < keys.length; i += 20) {
      await Promise.all(keys.slice(i, i + 20).map((k) => env.VOICE.delete(k.name)));
    }
    deleted += keys.length;
  }
  // a new take: new KV keys (no stale edge copies) and new ?v= URLs for players
  const map = { ...(await getMap(env, { fresh: true })) };
  for (const n of names) map[n] = { ...(map[n] || {}), take: (Number(map[n]?.take) || 0) + 1 };
  map._version = (Number(map._version) || 0) + 1;
  await putMap(env, map);
  return json({ ok: true, deleted, voices: names, v: map._version });
}

async function generate(ctx) {
  const { env, request } = ctx;
  if (!configured(env)) return fail(503, 'not_configured', { message: 'FISH_API_KEY is not set' });
  const body = await readJson(request, 4096);
  if (body.error) return fail(body.status, body.error);
  const { voice: name, max } = body.data || {};
  if (name && !MANIFEST.speakers[name]) return fail(404, 'unknown_voice');
  const running = await env.VOICE.get(KEYS.job, { type: 'json' });
  if (running && running.running && Date.now() - running.startedAt < 60_000) return json({ ok: true, busy: true, job: running });

  const map = await getMap(env, { fresh: true });
  const names = name ? [name] : voiceNames();
  const todo = [];
  for (const n of names) {
    const voice = resolveVoice(map, n);
    if (!voice) continue;
    const stored = new Set((await listKeys(env, audioPrefix(n))).map((k) => k.name));
    for (const [id, e] of linesFor(n)) {
      if (!stored.has(`${audioPrefix(n)}${id}:${ttsParams(env, map, e, voice).variant}`)) todo.push(id);
    }
  }
  const limit = Math.min(BATCH_MAX, Math.max(1, Number(max) || BATCH_MAX));
  const batch = todo.slice(0, limit);
  const job = { running: batch.length > 0, voice: name || null, queued: batch.length, missing: todo.length, done: 0, failed: 0, errors: [], startedAt: Date.now(), finishedAt: null };
  await env.VOICE.put(KEYS.job, JSON.stringify(job));
  if (batch.length) {
    ctx.waitUntil((async () => {
      const t0 = Date.now();
      const queue = batch.slice();
      const worker = async () => {
        while (queue.length && Date.now() - t0 < BATCH_BUDGET_MS) {
          const id = queue.shift();
          try {
            await lineAudio(env, id, map);
            job.done++;
          } catch (err) {
            job.failed++;
            if (job.errors.length < 5) job.errors.push(`${id}: ${String(err?.message || err).slice(0, 120)}`);
            if (err instanceof FishError && (err.status === 401 || err.status === 402)) queue.length = 0; // bad key or no credit: stop
          }
        }
      };
      await Promise.all(Array.from({ length: BATCH_CONCURRENCY }, worker));
      job.running = false;
      job.finishedAt = Date.now();
      job.left = queue.length;
      await env.VOICE.put(KEYS.job, JSON.stringify(job));
    })().catch((err) => console.error('voice generate', err)));
  }
  return json({ ok: true, job, remaining: Math.max(0, todo.length - batch.length) });
}
