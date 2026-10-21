// Voiced dialogue: shared server code for /api/voice/* and /api/admin/voices/*.
// This file exports no onRequest handler, so Pages does not turn it into a route.
//
// Bindings (Cloudflare dashboard > Pages project > Settings):
//   VOICE           KV namespace: the voice map and every generated line
//   FISH_API_KEY    secret: Fish Audio API key. Never sent to the browser.
//   ADMIN_PASSWORD  secret: guards /api/admin/voices/* (shared with the rest of /admin)
//   FISH_MODEL      optional plain var: default TTS model (otherwise s2.1-pro)
//   FISH_API_BASE   optional, for local tests only: point at a stub instead of https://api.fish.audio
//
// KV keys:
//   voices:map                         {"_version": n, "_default": {...}, "_settings": {...}, "<voice>": {reference_id, speed?, model?, off?, title?, cover?}}
//   audio:<voice-slug>:<id>:<variant>  MP3 bytes. variant = hash of (tts text, reference_id, model, speed, settings),
//                                      so reassigning a voice or editing a line never serves stale audio
//   preview:<hash>                     admin previews, expire after a day
//   voices:job                         status of the last pre-generation run
import manifest from '../../../src/data/voice-manifest.json';
import { hashText, speakerSlug } from '../../../src/core/voice.js';

export const MANIFEST = manifest;
export const FISH_BASE = 'https://api.fish.audio';
export const MODELS = ['s2.1-pro', 's2.1-pro-free', 's2-pro', 's1', 'drama-3'];
export const DEFAULT_MODEL = 's2.1-pro';
export const KEYS = { map: 'voices:map', job: 'voices:job' };
export const ID_RE = /^[0-9a-z]{11}$/;
export const RESERVED = new Set(['_default', '_settings', '_version']);

export const audioPrefix = (voice) => `audio:${speakerSlug(voice)}:`;
export const audioKey = (voice, id, variant) => `${audioPrefix(voice)}${id}:${variant}`;
export const fishBase = (env) => String(env.FISH_API_BASE || FISH_BASE).replace(/\/+$/, '');
export const configured = (env) => !!(env && env.VOICE && env.FISH_API_KEY);

/** Voice names (cast names) in the manifest, Narrator first. */
export const voiceNames = () => Object.keys(MANIFEST.speakers || {});
export const linesFor = (voice) => Object.entries(MANIFEST.lines).filter(([, e]) => e.voice === voice);

// ---------- voice map ----------
let mapCache = { at: 0, map: null };

/** The voice map. Cached per isolate for a few seconds and at the edge for a minute unless fresh. */
export async function getMap(env, { fresh = false } = {}) {
  if (!fresh && mapCache.map && Date.now() - mapCache.at < 10_000) return mapCache.map;
  let map = null;
  try {
    map = await env.VOICE.get(KEYS.map, fresh ? { type: 'json' } : { type: 'json', cacheTtl: 60 });
  } catch {
    map = null;
  }
  if (!map || typeof map !== 'object' || Array.isArray(map)) map = {};
  mapCache = { at: Date.now(), map };
  return map;
}

export async function putMap(env, map) {
  await env.VOICE.put(KEYS.map, JSON.stringify(map));
  mapCache = { at: Date.now(), map };
}

/** Bump the map version so players fetch fresh audio URLs (?v=) instead of their year-long browser cache. */
export async function bumpVersion(env) {
  const map = { ...(await getMap(env, { fresh: true })) };
  map._version = (Number(map._version) || 0) + 1;
  await putMap(env, map);
  return map._version;
}

/** The voice entry used for a cast name, or null when that voice is unassigned or switched off. */
export function resolveVoice(map, voice) {
  const own = map[voice];
  if (own && own.off) return null;
  if (own && own.reference_id) return own;
  const dflt = map._default;
  if (dflt && dflt.reference_id && !dflt.off) return { ...dflt, take: (Number(dflt.take) || 0) + (Number(own?.take) || 0), fallback: true };
  return null;
}

/** Which voices will speak right now. */
export function voicedNames(map) {
  return voiceNames().filter((v) => resolveVoice(map, v));
}

const clamp = (n, lo, hi, d) => (Number.isFinite(Number(n)) ? Math.min(hi, Math.max(lo, Number(n))) : d);

/** Everything that decides how a line sounds, and the variant hash of it. */
export function ttsParams(env, map, entry, voice, overrides = {}) {
  const s = map._settings || {};
  const model = MODELS.includes(overrides.model) ? overrides.model
    : MODELS.includes(voice.model) ? voice.model
    : MODELS.includes(s.model) ? s.model
    : MODELS.includes(env.FISH_MODEL) ? env.FISH_MODEL : DEFAULT_MODEL;
  const p = {
    text: String(overrides.text || entry.tts || entry.text).slice(0, 2000),
    reference_id: overrides.reference_id || voice.reference_id,
    model,
    speed: clamp(overrides.speed ?? voice.speed, 0.5, 2, 1),
    volume: clamp(voice.volume, -20, 20, 0),
    temperature: clamp(s.temperature, 0, 1, 0.7),
    top_p: clamp(s.top_p, 0, 1, 0.7),
    mp3_bitrate: [64, 128, 192].includes(Number(s.mp3_bitrate)) ? Number(s.mp3_bitrate) : 128,
    latency: ['low', 'normal', 'balanced'].includes(s.latency) ? s.latency : 'normal',
    language: entry.lang === 'en' ? 'en' : null, // other lines mix languages: let Fish detect per chunk
    take: Number(voice.take) || 0, // bumped by "Regenerate" in /admin: a new take gets a new key
  };
  p.variant = hashText(JSON.stringify([p.text, p.reference_id, p.model, p.speed, p.volume, p.temperature, p.top_p, p.mp3_bitrate, p.latency, p.take]));
  return p;
}

// ---------- Fish Audio ----------
export class FishError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * POST https://api.fish.audio/v1/tts  (Authorization: Bearer <key>, model: <model>, JSON body).
 * Returns the MP3 as an ArrayBuffer.
 */
export async function fishTTS(env, p) {
  const body = {
    text: p.text,
    reference_id: p.reference_id || null,
    format: 'mp3',
    mp3_bitrate: p.mp3_bitrate,
    normalize: true,
    latency: p.latency,
    temperature: p.temperature,
    top_p: p.top_p,
    chunk_length: 300,
    prosody: { speed: p.speed, volume: p.volume },
  };
  if (p.language) body.language = p.language;
  const res = await fetch(`${fishBase(env)}/v1/tts`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.FISH_API_KEY}`, 'content-type': 'application/json', model: p.model },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = '';
    try { msg = (await res.text()).slice(0, 300); } catch { /* no body */ }
    throw new FishError(res.status, `fish tts ${res.status} ${msg}`);
  }
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 64) throw new FishError(502, 'fish tts returned no audio');
  return buf;
}

/** GET https://api.fish.audio/model: public voice models (title search, language filter). */
export async function fishSearch(env, { q = '', lang = '', page = 1, size = 20, sort = 'score', self = false } = {}) {
  const u = new URL(`${fishBase(env)}/model`);
  u.searchParams.set('page_size', String(clamp(size, 1, 50, 20)));
  u.searchParams.set('page_number', String(clamp(page, 1, 500, 1)));
  if (q) u.searchParams.set('title', String(q).slice(0, 80));
  if (lang) u.searchParams.set('language', String(lang).slice(0, 12));
  if (['score', 'task_count', 'created_at'].includes(sort)) u.searchParams.set('sort_by', sort);
  if (self) u.searchParams.set('self', 'true');
  const res = await fetch(u, { headers: { authorization: `Bearer ${env.FISH_API_KEY}` } });
  if (!res.ok) throw new FishError(res.status, `fish model list ${res.status}`);
  const data = await res.json();
  const cover = (c) => (!c ? null : /^https?:\/\//.test(c) ? c : `https://public-platform.r2.fish.audio/cdn-cgi/image/width=96,format=webp/${String(c).replace(/^\/+/, '')}`);
  return {
    total: data.total ?? 0,
    hasMore: !!data.has_more,
    items: (data.items || []).map((m) => ({
      id: m._id,
      title: m.title,
      description: String(m.description || '').slice(0, 240),
      languages: m.languages || [],
      tags: (m.tags || []).slice(0, 8),
      cover: cover(m.cover_image),
      author: m.author?.nickname || null,
      likes: m.like_count ?? 0,
      uses: m.task_count ?? 0,
      visibility: m.visibility || null,
      samples: (m.samples || []).slice(0, 3).map((s) => ({ title: s.title || '', text: String(s.text || '').slice(0, 200), audio: s.audio || null })).filter((s) => s.audio),
    })),
  };
}

// ---------- generation ----------
const inflight = new Map(); // KV key -> Promise<ArrayBuffer>, so two players asking at once cost one call

/**
 * Cached audio for a manifest line, generating (and storing) it when missing.
 * Returns { audio, variant, cached } or { unvoiced: true }.
 */
export async function lineAudio(env, id, map, { generate = true } = {}) {
  const entry = MANIFEST.lines[id];
  if (!entry) return { unknown: true };
  const voice = resolveVoice(map, entry.voice);
  if (!voice) return { unvoiced: true };
  const p = ttsParams(env, map, entry, voice);
  const key = audioKey(entry.voice, id, p.variant);
  const hit = await env.VOICE.get(key, { type: 'arrayBuffer', cacheTtl: 86400 });
  if (hit) return { audio: hit, variant: p.variant, cached: true };
  if (!generate) return { missing: true, variant: p.variant };
  let job = inflight.get(key);
  if (!job) {
    job = (async () => {
      const audio = await fishTTS(env, p);
      await env.VOICE.put(key, audio, {
        metadata: { id, voice: entry.voice, ref: p.reference_id, model: p.model, bytes: audio.byteLength, at: Date.now() },
      });
      return audio;
    })().finally(() => inflight.delete(key));
    inflight.set(key, job);
  }
  return { audio: await job, variant: p.variant, cached: false };
}

/** All KV keys under a prefix (paged). */
export async function listKeys(env, prefix, max = 5000) {
  const out = [];
  let cursor;
  do {
    const page = await env.VOICE.list({ prefix, cursor, limit: 1000 });
    out.push(...page.keys);
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor && out.length < max);
  return out;
}

export const audioHeaders = (etag, immutable) => ({
  'content-type': 'audio/mpeg',
  'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=600',
  etag,
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex',
});
