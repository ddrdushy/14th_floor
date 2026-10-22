// /api/admin/voices/*: casting voices for the dialogue. Authorization: Bearer <ADMIN_PASSWORD>.
//
//   GET  /api/admin/voices                 speakers (from the manifest), the 8 detective slots, the voice map, config state
//   GET  /api/admin/voices/cache           stored line counts per speaker and per detective slot
//   GET  /api/admin/voices/lines?voice=X   that speaker's (or slot's, e.g. "You@det_03") lines: cached / stale / missing
//   GET  /api/admin/voices/map             the voice map
//   PUT  /api/admin/voices/map             replace the voice map (see README "Voices" for the shape)
//   GET  /api/admin/voices/search?q=&lang=&page=&size=&sort=&self=   Fish Audio voice models
//   POST /api/admin/voices/preview         { voice, id? | text?, reference_id?, model?, speed?, direction? } -> audio/mpeg (kept a day)
//   POST /api/admin/voices/purge           { voice } | { all: true }   delete stored audio; the next play regenerates
//   POST /api/admin/voices/generate        { voice?, max? }  generate missing lines in the background
//   GET  /api/admin/voices/job             the last generation run
//   PUT  /api/admin/voices/directions      { id, cue?, say?, speed? } | { id, reset: true }   a line's delivery (overrides the file)
//   POST /api/admin/voices/regenerate      { id, voice? }   a new take of one line (voice = "You@det_0N" for a player slot)
//
// "voice" is a cast name from the manifest ("Narrator", "Rachel Goh", "You", ...) or a player slot "You@det_01".."You@det_08".
import { json, fail, readJson, requireAdmin, sameOrigin } from '../../_lib.js';
import {
  MANIFEST, MODELS, KEYS, RESERVED, ID_RE, PLAYER, DETECTIVES, configured, getMap, putMap, resolveVoice, ttsParams, fishTTS,
  fishSearch, lineAudio, linesFor, listKeys, audioPrefix, voiceNames, FishError, splitSlot, slotName, currentKey,
  getDirections, putDirections, directionOf, composeText,
} from '../../voice/_shared.js';
import { hashText } from '../../../../src/core/voice.js';

const BATCH_MAX = 30; // lines per generate call
const BATCH_CONCURRENCY = 2; // Fish Starter tier allows 5 concurrent requests
const BATCH_BUDGET_MS = 25_000; // stop starting new lines after this (waitUntil has ~30 s)
const SLOTS = DETECTIVES.map((x) => slotName(x.id));

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
      case 'GET speakers': return await overview(env);
      case 'GET cache': return await cacheCounts(env);
      case 'GET lines': return await lines(env, new URL(request.url).searchParams.get('voice'));
      case 'GET map': return json({ ok: true, map: await getMap(env, { fresh: true }) });
      case 'PUT map': return await saveMap(env, request);
      case 'GET search': return await search(env, new URL(request.url).searchParams);
      case 'POST preview': return await preview(env, request);
      case 'POST purge': return await purge(env, request);
      case 'POST generate': return await generate(ctx);
      case 'GET job': return json({ ok: true, job: (await env.VOICE.get(KEYS.job, { type: 'json' })) || null });
      case 'GET directions': return json({ ok: true, directions: await getDirections(env, { fresh: true }) });
      case 'PUT directions': return saveDirection(env, request);
      case 'POST regenerate': return regenerate(ctx);
      default: return fail(404, 'not_found');
    }
  } catch (err) {
    if (err instanceof FishError) return fail(err.status === 401 || err.status === 402 ? err.status : 502, 'fish_error', { status: err.status, message: err.message.slice(0, 200) });
    console.error('admin voices', err && (err.stack || err.message || err));
    return fail(500, 'server_error');
  }
}

/** { voice, d } for a cast name or player slot, or null when unknown. */
function target(name) {
  const t = splitSlot(name);
  return t.voice && MANIFEST.speakers[t.voice] ? t : null;
}
/** Stored keys of a cast name; for the player, only those of one portrait (d) or of none (d = null). */
const keysOf = (all, d) => all.filter((k) => (k.metadata?.d || null) === d);

async function overview(env) {
  const map = await getMap(env, { fresh: true });
  const speakers = voiceNames().map((name) => {
    const s = MANIFEST.speakers[name];
    const sample = linesFor(name).slice(0, 1).map(([id, e]) => ({ id, text: e.text, en: e.en }))[0] || null;
    return { name, lines: s.lines, chars: s.chars, langs: s.langs, shownAs: s.shownAs || [], voice: map[name] || null, voiced: !!resolveVoice(map, name), sample };
  });
  const hasPlayer = !!MANIFEST.speakers[PLAYER];
  const detectives = hasPlayer ? DETECTIVES.map((x) => {
    const slot = slotName(x.id);
    const v = resolveVoice(map, PLAYER, x.id);
    return { id: x.id, slot, label: x.label, img: `assets/img/${x.id}.jpg`, voice: map[slot] || null, voiced: !!v, using: v ? (v.slot ? 'own' : v.fallback ? '_default' : PLAYER) : null };
  }) : [];
  return json({
    ok: true,
    configured: { kv: !!env.VOICE, fish: !!env.FISH_API_KEY, stub: !!env.FISH_API_BASE },
    models: MODELS,
    player: hasPlayer ? PLAYER : null,
    totals: { lines: Object.keys(MANIFEST.lines).length, bytes: Object.values(MANIFEST.lines).reduce((n, e) => n + new TextEncoder().encode(e.tts || e.text).length, 0) },
    speakers,
    detectives,
    map,
  });
}

async function cacheCounts(env) {
  const map = await getMap(env, { fresh: true });
  const dirs = await getDirections(env, { fresh: true });
  const out = {};
  for (const name of voiceNames()) {
    const all = await listKeys(env, audioPrefix(name));
    const dets = name === PLAYER ? [null, ...DETECTIVES.map((x) => x.id)] : [null];
    for (const d of dets) {
      const current = new Set(linesFor(name).map(([id]) => currentKey(env, map, id, d, dirs)).filter(Boolean));
      const mine = name === PLAYER ? keysOf(all, d) : all;
      out[d ? slotName(d) : name] = { stored: mine.length, current: mine.filter((k) => current.has(k.name)).length, total: MANIFEST.speakers[name].lines };
    }
  }
  return json({ ok: true, cache: out });
}

async function lines(env, name) {
  const t = target(name);
  if (!t) return fail(404, 'unknown_voice');
  const map = await getMap(env, { fresh: true });
  const dirs = await getDirections(env, { fresh: true });
  const all = await listKeys(env, audioPrefix(t.voice));
  const mine = t.voice === PLAYER ? keysOf(all, t.d) : all;
  const stored = new Set(mine.map((k) => k.name));
  const storedIds = new Set(mine.map((k) => k.name.split(':')[2]));
  return json({
    ok: true,
    voice: name,
    lines: linesFor(t.voice).map(([id, e]) => {
      const key = currentKey(env, map, id, t.d, dirs);
      const dir = directionOf(e, id, dirs);
      return {
        id, rev: e.rev || null, speaker: e.speaker, text: e.text, en: e.en, tts: e.tts || null, lang: e.lang, where: e.where,
        direction: dir.dir, fileDirection: e.dir || null, custom: dir.custom, take: dir.take, sends: composeText(e, dir.dir),
        state: key && stored.has(key) ? 'cached' : storedIds.has(id) ? 'stale' : 'missing',
      };
    }),
  });
}

const REF_RE = /^[A-Za-z0-9_-]{1,64}$/;
function cleanEntry(e, { settings = false } = {}) {
  if (!e || typeof e !== 'object') return null;
  if (settings) {
    const out = {};
    if (MODELS.includes(e.model)) out.model = e.model;
    for (const k of ['temperature', 'top_p']) if (Number.isFinite(Number(e[k])) && e[k] !== null && e[k] !== '') out[k] = Math.min(1, Math.max(0, Number(e[k])));
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
  const known = new Set([...voiceNames(), ...(MANIFEST.speakers[PLAYER] ? SLOTS : [])]);
  const old = await getMap(env, { fresh: true });
  const map = { _version: (Number(old._version) || 0) + 1 };
  const dropped = [];
  for (const [k, v] of Object.entries(incoming)) {
    if (k === '_version') continue;
    if (!known.has(k) && !RESERVED.has(k)) { dropped.push(k); continue; } // unknown speakers are dropped
    const e = cleanEntry(v, { settings: k === '_settings' });
    if (e) map[k] = e;
  }
  // keep each entry's take counter unless the client sent one
  for (const k of Object.keys(old)) if (old[k]?.take && map[k] && !map[k].take) map[k].take = old[k].take;
  await putMap(env, map);
  return json({ ok: true, map, ...(dropped.length ? { dropped } : {}) });
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
  const { voice: name, id, text, reference_id, model, speed, direction } = body.data || {};
  const t = target(name);
  if (!t) return fail(404, 'unknown_voice');
  if (reference_id != null && (typeof reference_id !== 'string' || !REF_RE.test(reference_id))) return fail(400, 'bad_reference_id');
  let entry;
  if (id) {
    if (!ID_RE.test(id) || !MANIFEST.lines[id]) return fail(404, 'unknown_line');
    entry = MANIFEST.lines[id];
  } else if (typeof text === 'string' && text.trim()) {
    entry = { text: text.trim().slice(0, 300), lang: 'en' };
  } else {
    entry = linesFor(t.voice)[0]?.[1];
  }
  const map = await getMap(env, { fresh: true });
  const voice = reference_id ? { ...(map[name] || {}), reference_id, off: false } : resolveVoice(map, t.voice, t.d);
  if (!voice || !voice.reference_id) return fail(400, 'no_voice', { message: 'Pick a voice first' });
  const dirs = await getDirections(env, { fresh: true });
  const dirOverride = direction !== undefined ? cleanDirection(direction) : undefined; // try an edit before saving it
  const p = ttsParams(env, map, entry, voice, { model, speed, reference_id, d: t.d, id: id || null, dirs, ...(dirOverride !== undefined ? { dir: dirOverride } : {}) });
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
  const targets = all === true ? voiceNames().map((v) => ({ voice: v, d: null, all: true })) : [target(name)].filter(Boolean);
  if (!targets.length) return fail(404, 'unknown_voice');
  const map = { ...(await getMap(env, { fresh: true })) };
  let deleted = 0;
  const bumped = [];
  for (const t of targets) {
    let keys = await listKeys(env, audioPrefix(t.voice));
    if (t.voice === PLAYER && !t.all) {
      // a slot: only that portrait's audio. Plain "You": everything not made by a slot's own voice.
      keys = t.d ? keysOf(keys, t.d) : keys.filter((k) => !k.metadata?.d || !map[slotName(k.metadata.d)]?.reference_id);
    }
    for (let i = 0; i < keys.length; i += 20) await Promise.all(keys.slice(i, i + 20).map((k) => env.VOICE.delete(k.name)));
    deleted += keys.length;
    // a new take: new KV keys (no stale edge copies) and new ?v= URLs for players
    const names = t.all && t.voice === PLAYER ? [PLAYER, ...SLOTS] : [t.d ? slotName(t.d) : t.voice];
    for (const n of names) {
      if (n !== t.voice && !map[n]) continue;
      map[n] = { ...(map[n] || {}), take: (Number(map[n]?.take) || 0) + 1 };
      bumped.push(n);
    }
  }
  map._version = (Number(map._version) || 0) + 1;
  await putMap(env, map);
  return json({ ok: true, deleted, voices: bumped, v: map._version });
}

async function generate(ctx) {
  const { env, request } = ctx;
  if (!configured(env)) return fail(503, 'not_configured', { message: 'FISH_API_KEY is not set' });
  const body = await readJson(request, 4096);
  if (body.error) return fail(body.status, body.error);
  const { voice: name, max } = body.data || {};
  const t = name ? target(name) : null;
  if (name && !t) return fail(404, 'unknown_voice');
  const running = await env.VOICE.get(KEYS.job, { type: 'json' });
  if (running && running.running && Date.now() - running.startedAt < 60_000) return json({ ok: true, busy: true, job: running });

  const map = await getMap(env, { fresh: true });
  const dirs = await getDirections(env, { fresh: true });
  // players always send their portrait, so the player's lines are made once per detective
  const plan = t ? [t] : voiceNames().map((v) => ({ voice: v, d: null }));
  const jobs = [];
  for (const p of plan) {
    const dets = p.voice === PLAYER && !p.d ? DETECTIVES.map((x) => x.id) : [p.d];
    const stored = new Set((await listKeys(env, audioPrefix(p.voice))).map((k) => k.name));
    for (const d of dets) {
      for (const [id] of linesFor(p.voice)) {
        const key = currentKey(env, map, id, d, dirs);
        if (key && !stored.has(key)) jobs.push({ id, d });
      }
    }
  }
  const limit = Math.min(BATCH_MAX, Math.max(1, Number(max) || BATCH_MAX));
  const batch = jobs.slice(0, limit);
  const job = { running: batch.length > 0, voice: name || null, queued: batch.length, missing: jobs.length, done: 0, failed: 0, errors: [], startedAt: Date.now(), finishedAt: null };
  await env.VOICE.put(KEYS.job, JSON.stringify(job));
  if (batch.length) {
    ctx.waitUntil((async () => {
      const t0 = Date.now();
      const queue = batch.slice();
      const worker = async () => {
        while (queue.length && Date.now() - t0 < BATCH_BUDGET_MS) {
          const { id, d } = queue.shift();
          try {
            await lineAudio(env, id, map, { d, dirs });
            job.done++;
          } catch (err) {
            job.failed++;
            if (job.errors.length < 5) job.errors.push(`${id}${d ? `@${d}` : ''}: ${String(err?.message || err).slice(0, 120)}`);
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
  return json({ ok: true, job, remaining: Math.max(0, jobs.length - batch.length) });
}

/** A direction from the admin: { cue?, say?, speed? } with limits, or null for "spoken plainly". */
function cleanDirection(d) {
  if (!d || typeof d !== 'object') return null;
  const out = {};
  if (typeof d.cue === 'string' && d.cue.trim()) out.cue = d.cue.trim().slice(0, 300);
  if (typeof d.say === 'string' && d.say.trim()) out.say = d.say.trim().slice(0, 1500);
  if (d.speed != null && d.speed !== '' && Number.isFinite(Number(d.speed))) out.speed = Math.min(1.6, Math.max(0.6, Number(d.speed)));
  return Object.keys(out).length ? out : null;
}

async function bumpMapVersion(env) {
  const map = { ...(await getMap(env, { fresh: true })) };
  map._version = (Number(map._version) || 0) + 1;
  await putMap(env, map);
  return map._version;
}

async function saveDirection(env, request) {
  const body = await readJson(request, 8192);
  if (body.error) return fail(body.status, body.error);
  const { id, reset } = body.data || {};
  if (!ID_RE.test(String(id || '')) || !MANIFEST.lines[id]) return fail(404, 'unknown_line');
  const dirs = { ...(await getDirections(env, { fresh: true })) };
  const prev = dirs[id] || {};
  if (reset === true) {
    if (prev.take) dirs[id] = { take: prev.take }; else delete dirs[id];
  } else {
    dirs[id] = { ...prev, dir: cleanDirection(body.data), at: Date.now() }; // dir null = spoken plainly
  }
  await putDirections(env, dirs);
  const v = await bumpMapVersion(env); // players fetch the new URL
  const e = MANIFEST.lines[id];
  const dir = directionOf(e, id, dirs);
  return json({ ok: true, id, direction: dir.dir, custom: dir.custom, sends: composeText(e, dir.dir), v });
}

async function regenerate(ctx) {
  const { env, request } = ctx;
  if (!configured(env)) return fail(503, 'not_configured', { message: 'FISH_API_KEY is not set' });
  const body = await readJson(request, 4096);
  if (body.error) return fail(body.status, body.error);
  const { id, voice: name } = body.data || {};
  if (!ID_RE.test(String(id || '')) || !MANIFEST.lines[id]) return fail(404, 'unknown_line');
  const e = MANIFEST.lines[id];
  const t = name ? target(name) : { voice: e.voice, d: null };
  if (!t || t.voice !== e.voice) return fail(400, 'wrong_voice');
  // a new take: the line's take counter is part of its cache key, so nothing old can be served
  const dirs = { ...(await getDirections(env, { fresh: true })) };
  dirs[id] = { ...(dirs[id] || {}), take: (Number(dirs[id]?.take) || 0) + 1 };
  await putDirections(env, dirs);
  const v = await bumpMapVersion(env);
  const map = await getMap(env, { fresh: true });
  // old takes of this line are deleted (players have the new ?v= URL already)
  const old = (await listKeys(env, audioPrefix(e.voice))).filter((k) => k.name.split(':')[2] === id);
  const keep = new Set(DETECTIVES.map((x) => currentKey(env, map, id, x.id, dirs)).concat(currentKey(env, map, id, null, dirs)));
  await Promise.all(old.filter((k) => !keep.has(k.name)).map((k) => env.VOICE.delete(k.name)));
  // generate now for the slot asked for (the player's lines: every portrait, in the background)
  if (e.voice === PLAYER && !t.d) {
    ctx.waitUntil(Promise.all(DETECTIVES.map((x) => lineAudio(env, id, map, { d: x.id, dirs }).catch(() => null))));
    return json({ ok: true, id, v, queued: DETECTIVES.length });
  }
  const out = await lineAudio(env, id, map, { d: t.d, dirs });
  if (out.unvoiced) return json({ ok: true, id, v, unvoiced: true });
  return json({ ok: true, id, v, variant: out.variant, bytes: out.audio.byteLength });
}
