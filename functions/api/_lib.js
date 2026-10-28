// Shared helpers for the Floor 14 Pages Functions: JSON responses, same-origin checks, the D1 schema
// (created on first use, no SQL console steps), admin auth, and the per-case verdict rules.
// This file exports no onRequest handler, so Pages does not turn it into a route.

export const SCHEMA_VERSION = 3;

// Cases in play order. Mirrors CASE_ORDER in src/data/cases.js; a case missing here still works,
// it is just treated as "after" the known ones when working out how far a player has got.
export const CASE_ORDER = ['case01', 'side01', 'case02', 'case03', 'case04', 'case05'];
export const caseRank = (id) => {
  const i = CASE_ORDER.indexOf(id);
  return i < 0 ? 99 : i + 1;
};
/** SQL expression ranking a case_id column by play order (ids are fixed strings, safe to inline). */
export const caseRankSql = (col) => `CASE ${col} ${CASE_ORDER.map((id, i) => `WHEN '${id}' THEN ${i + 1}`).join(' ')} ELSE 99 END`;

// Was the verdict right? The same rules as the hidden flags each case sets (see src/data/*.js
// `flags()`), written against the charged suspects and the extra answers:
//   case01: JASON_FREE, RIZAL_FREE off and SHANTI_WRONGED off
//   side01: BOBBY_FREE, AHLAN_WRONGED, RAVI_WRONGED all off
//   case02: TONY_FREE, NORHAYATI_FREE, FAIZAL_WRONGED off and AZMAN_ALIVE (hideout = kelong)
//   case03: MELISSA_FREE, SHAHRUL_FREE, KENNY_WRONGED, CHEAH_WRONGED off and BODY_NAMED (xray = weijie)
//   case04: SHEHANI_FREE, KASUN_FREE, MOHAN_WRONGED, RAJAN_HUNTED off and BOOK_FOUND (book = fort)
//   case05: VIVIAN_FREE, ZUL_FREE, KHAIRUL_WRONGED, DANIEL_CHARGED off and DANIEL_FOUND (daniel = kgbaru)
const CORRECT = {
  case01: (c) => c.has('jason') && c.has('rizal') && !c.has('shanti'),
  side01: (c) => c.has('bobby') && !c.has('ahlan') && !c.has('ravi'),
  case02: (c, a) => c.has('tony') && c.has('norhayati') && !c.has('faizal') && a.hideout === 'kelong',
  case03: (c, a) => c.has('melissa') && c.has('shahrul') && !c.has('kenny') && !c.has('cheah') && a.xray === 'weijie',
  case04: (c, a) => c.has('shehani') && c.has('kasun') && !c.has('mohan') && !c.has('rajan') && a.book === 'fort',
  case05: (c, a) => c.has('vivian') && c.has('zul') && !c.has('khairul') && !c.has('rajan') && a.daniel === 'kgbaru',
};
/** true/false for a known case, null when the server has no rule (then the client's value is used). */
export function verdictCorrect(caseId, charged, answers) {
  const rule = CORRECT[caseId];
  if (!rule) return null;
  const set = new Set(charged);
  return !!rule({ has: (id) => set.has(id) }, answers || {});
}

// ---------- limits ----------
export const LIMITS = {
  bodyBytes: 8192,
  events: 50,
  eventDataBytes: 2048,
  levelSeconds: 4 * 3600, // one puzzle never counts for more than 4 hours
  levelHints: 20,
  requestsPerMinute: 30, // per player
  nameLength: 24,
};
// Runs averaging fewer seconds than this per puzzle are left off the board (skipped or scripted).
export const MIN_SECONDS_PER_LEVEL = 5;
export const EVENT_TYPES = new Set(['session_start', 'case_open', 'level_solved', 'case_closed', 'profile_set']);
export const ID_RE = /^[a-z0-9_]{1,32}$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const EARLIEST = Date.UTC(2025, 0, 1);

export const clampInt = (v, lo, hi, dflt = lo) => {
  if (v == null || v === '') return dflt;
  const n = Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(hi, Math.max(lo, Math.round(n)));
};

// ---------- responses ----------
const BASE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex',
};
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...BASE_HEADERS, ...headers } });
}
export const fail = (status, error, extra = {}) => json({ ok: false, error, ...extra }, status);

/**
 * Wrap a handler: same-origin only, a 503 when the D1 binding is missing, schema on first use,
 * and no stack traces in responses (errors go to the Functions log).
 */
export function handler(fn, { needsDb = true } = {}) {
  return async (ctx) => {
    const { request, env } = ctx;
    try {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { allow: 'GET, POST, OPTIONS' } });
      if (!sameOrigin(request)) return fail(403, 'cross_origin');
      if (needsDb) {
        if (!env.DB) return fail(503, 'not_configured');
        await migrate(env.DB);
      }
      return await fn(ctx);
    } catch (err) {
      console.error('floor14 api error', request.method, new URL(request.url).pathname, err && (err.stack || err.message || err));
      return fail(500, 'server_error');
    }
  };
}

export const methodNotAllowed = () => fail(405, 'method_not_allowed');

/** Browsers send Origin on POST and on cross-origin GET; requests without one (curl, same-origin GET) pass. */
export function sameOrigin(request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return !origin;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

/** Read a request body as JSON with a hard byte limit. Returns { data } or { error, status }. */
export async function readJson(request, maxBytes) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > maxBytes) return { status: 413, error: 'too_large' };
  let text;
  try {
    text = await request.text();
  } catch {
    return { status: 400, error: 'bad_body' };
  }
  if (new TextEncoder().encode(text).length > maxBytes) return { status: 413, error: 'too_large' };
  try {
    return { data: JSON.parse(text) };
  } catch {
    return { status: 400, error: 'bad_json' };
  }
}

// ---------- schema ----------
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT)`,
  `CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,
    detective_name TEXT,
    profile_name TEXT,
    show_on_board INTEGER NOT NULL DEFAULT 0,
    platform TEXT,
    country TEXT,
    dev INTEGER NOT NULL DEFAULT 0,
    sessions INTEGER NOT NULL DEFAULT 0,
    rl_window INTEGER NOT NULL DEFAULT 0,
    rl_count INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS players_last_seen ON players (last_seen)`,
  `CREATE INDEX IF NOT EXISTS players_created ON players (created_at)`,
  `CREATE INDEX IF NOT EXISTS players_board ON players (show_on_board, dev)`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    type TEXT NOT NULL,
    case_id TEXT,
    level_id TEXT,
    data TEXT,
    at INTEGER NOT NULL,
    received_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS events_player ON events (player_id, at)`,
  `CREATE INDEX IF NOT EXISTS events_type ON events (type, at)`,
  `CREATE TABLE IF NOT EXISTS progress (
    player_id TEXT NOT NULL,
    case_id TEXT NOT NULL,
    opened_at INTEGER,
    levels_solved INTEGER NOT NULL DEFAULT 0,
    total_time INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    verdict TEXT,
    verdict_key TEXT,
    correct INTEGER,
    closed_at INTEGER,
    updated_at INTEGER,
    PRIMARY KEY (player_id, case_id)
  )`,
  `CREATE INDEX IF NOT EXISTS progress_board ON progress (case_id, closed_at, correct, total_time, hints_used)`,
  // one row per puzzle a player has solved: the funnel, averages and case totals are built from this
  `CREATE TABLE IF NOT EXISTS solves (
    player_id TEXT NOT NULL,
    case_id TEXT NOT NULL,
    level_id TEXT NOT NULL,
    time INTEGER NOT NULL,
    hints INTEGER NOT NULL,
    at INTEGER NOT NULL,
    PRIMARY KEY (player_id, case_id, level_id)
  )`,
  `CREATE INDEX IF NOT EXISTS solves_level ON solves (case_id, level_id)`,
  // cloud saves: one per detective name, so a player can carry on on another device by typing it
  `CREATE TABLE IF NOT EXISTS saves (
    name_key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    player_id TEXT NOT NULL,
    data TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    pin_salt TEXT,
    pin_hash TEXT,
    pin_fails INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS saves_player ON saves (player_id)`,
];

// Columns added after a table first shipped: [version, sql]. "duplicate column" errors are ignored,
// so a database that already has the column (a fresh one, created from SCHEMA) is fine.
const ALTERS = [
  [2, `ALTER TABLE players ADD COLUMN profile_name TEXT`],
  [3, `ALTER TABLE saves ADD COLUMN pin_salt TEXT`],
  [3, `ALTER TABLE saves ADD COLUMN pin_hash TEXT`],
  [3, `ALTER TABLE saves ADD COLUMN pin_fails INTEGER NOT NULL DEFAULT 0`],
  [3, `ALTER TABLE saves ADD COLUMN locked_until INTEGER NOT NULL DEFAULT 0`],
];

let migrated = null; // one schema pass per isolate
export function migrate(db) {
  if (!migrated) {
    migrated = (async () => {
      const row = await db.prepare(`SELECT v FROM meta WHERE k = 'schema'`).first().catch(() => null);
      if (row && Number(row.v) >= SCHEMA_VERSION) return;
      await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
      const from = Number(row?.v) || 0;
      for (const [v, sql] of ALTERS) {
        if (from >= v) continue;
        try { await db.prepare(sql).run(); } catch (err) { if (!/duplicate column/i.test(String(err?.message || err))) throw err; }
      }
      await db.prepare(`INSERT INTO meta (k, v) VALUES ('schema', ?1) ON CONFLICT(k) DO UPDATE SET v = excluded.v`).bind(String(SCHEMA_VERSION)).run();
    })().catch((err) => {
      migrated = null; // try again on the next request
      throw err;
    });
  }
  return migrated;
}

// ---------- request facts ----------
/** A coarse platform class from the user agent: "<os>/<form>", e.g. "android/mobile". */
export function platformOf(ua = '') {
  const u = ua.toLowerCase();
  let os = 'other';
  if (/iphone|ipad|ipod/.test(u)) os = 'ios';
  else if (/android/.test(u)) os = 'android';
  else if (/windows/.test(u)) os = 'windows';
  else if (/macintosh|mac os x/.test(u)) os = /mobile/.test(u) ? 'ios' : 'mac';
  else if (/cros/.test(u)) os = 'chromeos';
  else if (/linux/.test(u)) os = 'linux';
  let form = 'desktop';
  if (/ipad|tablet/.test(u) || (os === 'android' && !/mobile/.test(u))) form = 'tablet';
  else if (/mobi|iphone|ipod/.test(u)) form = 'mobile';
  if (/bot|crawl|spider|headless/.test(u)) form = 'bot';
  return `${os}/${form}`;
}

export const countryOf = (request) => {
  const c = request.cf?.country;
  return typeof c === 'string' && /^[A-Z0-9]{2}$/.test(c) ? c : null;
};
export const clientIp = (request) => request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'local';

// ---------- best-effort in-memory limiter (per isolate) ----------
const buckets = new Map();
/** true when `key` has gone over `max` hits in the current `windowMs`. */
export function overLimit(key, max, windowMs = 60_000) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.start >= windowMs) {
    b = { start: now, n: 0 };
    buckets.set(key, b);
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now - v.start >= windowMs) buckets.delete(k);
    }
  }
  b.n++;
  return b.n > max;
}

// ---------- admin auth ----------
async function digest(s) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
}
/** Compare two secrets in constant time (both are hashed first, so lengths never leak). */
export async function safeEqual(a, b) {
  const [x, y] = await Promise.all([digest(String(a)), digest(String(b))]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/**
 * Guard for /api/admin/*: `Authorization: Bearer <ADMIN_PASSWORD>`.
 * Returns null when allowed, otherwise the Response to send (503 not configured, 429, 401).
 * Other admin endpoints (e.g. voices) can share it: `const deny = await requireAdmin(ctx); if (deny) return deny;`
 */
export async function requireAdmin({ request, env }) {
  const secret = env.ADMIN_PASSWORD;
  if (!secret) return fail(503, 'not_configured', { message: 'ADMIN_PASSWORD is not set' });
  const ip = clientIp(request);
  const m = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '');
  const ok = m ? await safeEqual(m[1].trim(), secret) : false;
  if (ok) return null;
  if (overLimit(`admin-fail:${ip}`, 10, 5 * 60_000)) return fail(429, 'too_many_attempts');
  return json({ ok: false, error: 'unauthorized' }, 401, { 'www-authenticate': 'Bearer realm="floor14-admin"' });
}

/** Wrap an admin handler: same-origin, DB, schema, then the password check. */
export const adminHandler = (fn) => handler(async (ctx) => (await requireAdmin(ctx)) || fn(ctx));

/** Escape a user string for use inside a LIKE pattern (with ESCAPE '\'). */
export const likeEscape = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** The key a cloud save is filed under: the cleaned name, lower case. */
export const nameKey = (v) => {
  const n = cleanName(v);
  return n && n.length >= 2 ? n.toLowerCase() : null;
};

/** Clean a detective name for public display: printable, single-spaced, short. */
export function cleanName(v) {
  if (typeof v !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  const s = v.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩<>]/g, '').replace(/\s+/g, ' ').trim();
  return s ? [...s].slice(0, LIMITS.nameLength).join('') : null;
}
