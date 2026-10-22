// POST /api/track  { player_id, events: [{ type, case_id, level_id, data, at }] }
// Batched, anonymous progress events from the game (src/core/telemetry.js). Unknown or malformed
// events are skipped, not fatal. Times and hint counts are clamped; case totals are rebuilt on the
// server from the per-puzzle rows, never taken from the client.
import {
  handler, json, fail, readJson, methodNotAllowed, LIMITS, EVENT_TYPES, ID_RE, UUID_RE, EARLIEST,
  clampInt, platformOf, countryOf, clientIp, overLimit, verdictCorrect, cleanName,
} from './_lib.js';

const cleanId = (v) => (typeof v === 'string' && ID_RE.test(v) ? v : null);

function cleanEvent(e, now) {
  if (!e || typeof e !== 'object' || !EVENT_TYPES.has(e.type)) return null;
  const caseId = cleanId(e.case_id);
  const levelId = cleanId(e.level_id);
  if ((e.type === 'case_open' || e.type === 'case_closed') && !caseId) return null;
  if (e.type === 'level_solved' && (!caseId || !levelId)) return null;
  let at = Number(e.at);
  if (!Number.isFinite(at) || at < EARLIEST || at > now + 5 * 60_000) at = now;
  const raw = e.data && typeof e.data === 'object' && !Array.isArray(e.data) ? e.data : {};
  let data = {};
  switch (e.type) {
    case 'session_start':
      data = { dev: raw.dev === true, v: clampInt(raw.v, 0, 1000, 0) };
      if (typeof raw.lang === 'string') data.lang = raw.lang.slice(0, 16);
      break;
    case 'level_solved':
      data = { time: clampInt(raw.time, 0, LIMITS.levelSeconds), hints: clampInt(raw.hints, 0, LIMITS.levelHints) };
      break;
    case 'case_closed': {
      const charged = Array.isArray(raw.charged) ? [...new Set(raw.charged.filter((x) => cleanId(x)))].slice(0, 12).sort() : [];
      const answers = {};
      if (raw.answers && typeof raw.answers === 'object') {
        for (const [k, v] of Object.entries(raw.answers).slice(0, 8)) if (cleanId(k) && cleanId(v)) answers[k] = v;
      }
      const levels = {};
      if (raw.levels && typeof raw.levels === 'object') {
        for (const [id, x] of Object.entries(raw.levels).slice(0, 60)) {
          if (cleanId(id) && x && typeof x === 'object') levels[id] = { time: clampInt(x.time, 0, LIMITS.levelSeconds), hints: clampInt(x.hints, 0, LIMITS.levelHints) };
        }
      }
      data = { charged, answers, levels, correct: raw.correct === true };
      break;
    }
    case 'profile_set': {
      const show = raw.show === true;
      data = { show, name: show ? cleanName(raw.name) : null };
      break;
    }
    default:
      break;
  }
  if (JSON.stringify(data).length > LIMITS.eventDataBytes) return null;
  return { type: e.type, caseId, levelId, data, at };
}

const verdictKey = (charged, answers) => {
  const extra = Object.keys(answers).sort().map((k) => `${k}=${answers[k]}`).join(',');
  return `${charged.join('+') || '-'}${extra ? `|${extra}` : ''}`;
};

export const onRequestPost = handler(async ({ request, env }) => {
  const now = Date.now();
  const ip = clientIp(request);
  if (overLimit(`ip:${ip}`, 240)) return fail(429, 'rate_limited');

  const body = await readJson(request, LIMITS.bodyBytes);
  if (body.error) return fail(body.status, body.error);
  const { player_id: playerId, events } = body.data || {};
  if (typeof playerId !== 'string' || !UUID_RE.test(playerId)) return fail(400, 'bad_player');
  if (!Array.isArray(events) || !events.length) return fail(400, 'no_events');
  if (events.length > LIMITS.events) return fail(413, 'too_many_events');
  if (overLimit(`player:${playerId}`, LIMITS.requestsPerMinute)) return fail(429, 'rate_limited');

  const clean = events.map((e) => cleanEvent(e, now)).filter(Boolean);
  const db = env.DB;

  // upsert the player and count this request in its one-minute window (durable rate limit)
  const minute = Math.floor(now / 60_000);
  const sessions = clean.filter((e) => e.type === 'session_start').length;
  const dev = clean.some((e) => e.type === 'session_start' && e.data.dev) ? 1 : 0;
  const row = await db.prepare(
    `INSERT INTO players (id, created_at, last_seen, platform, country, dev, sessions, rl_window, rl_count)
     VALUES (?1, ?2, ?2, ?3, ?4, ?5, ?6, ?7, 1)
     ON CONFLICT(id) DO UPDATE SET
       last_seen = excluded.last_seen,
       platform = COALESCE(excluded.platform, players.platform),
       country = COALESCE(excluded.country, players.country),
       -- the latest session decides: someone who tried ?dev once and then plays normally counts again
       dev = CASE WHEN excluded.sessions > 0 THEN excluded.dev ELSE players.dev END,
       sessions = players.sessions + excluded.sessions,
       rl_count = CASE WHEN players.rl_window = excluded.rl_window THEN players.rl_count + 1 ELSE 1 END,
       rl_window = excluded.rl_window
     RETURNING rl_count`,
  ).bind(playerId, now, platformOf(request.headers.get('user-agent') || ''), countryOf(request), dev, sessions, minute).first();
  if (row && row.rl_count > LIMITS.requestsPerMinute) return fail(429, 'rate_limited');
  if (!clean.length) return json({ ok: true, accepted: 0, rejected: events.length });

  const stmts = [];
  const touched = new Set();
  const ensureProgress = (caseId, at) => {
    stmts.push(db.prepare(
      `INSERT INTO progress (player_id, case_id, opened_at, updated_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(player_id, case_id) DO UPDATE SET opened_at = MIN(COALESCE(progress.opened_at, excluded.opened_at), excluded.opened_at)`,
    ).bind(playerId, caseId, at, now));
    touched.add(caseId);
  };
  const solve = (caseId, levelId, time, hints, at) => stmts.push(db.prepare(
    `INSERT INTO solves (player_id, case_id, level_id, time, hints, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(player_id, case_id, level_id) DO UPDATE SET time = excluded.time, hints = excluded.hints, at = excluded.at`,
  ).bind(playerId, caseId, levelId, time, hints, at));

  const closes = [];
  for (const e of clean) {
    stmts.push(db.prepare(
      `INSERT INTO events (player_id, type, case_id, level_id, data, at, received_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    ).bind(playerId, e.type, e.caseId, e.levelId, JSON.stringify(e.data), e.at, now));
    if (e.type === 'case_open') ensureProgress(e.caseId, e.at);
    else if (e.type === 'level_solved') {
      ensureProgress(e.caseId, e.at);
      solve(e.caseId, e.levelId, e.data.time, e.data.hints, e.at);
    } else if (e.type === 'case_closed') {
      ensureProgress(e.caseId, e.at);
      for (const [lid, x] of Object.entries(e.data.levels)) solve(e.caseId, lid, x.time, x.hints, e.at);
      closes.push(e);
    } else if (e.type === 'profile_set') {
      stmts.push(db.prepare(`UPDATE players SET detective_name = ?2, show_on_board = ?3 WHERE id = ?1`)
        .bind(playerId, e.data.show ? e.data.name : null, e.data.show && e.data.name ? 1 : 0));
    }
  }
  // case totals come from the per-puzzle rows
  for (const caseId of touched) {
    stmts.push(db.prepare(
      `UPDATE progress SET
         levels_solved = (SELECT COUNT(*) FROM solves s WHERE s.player_id = ?1 AND s.case_id = ?2),
         total_time = (SELECT COALESCE(SUM(time), 0) FROM solves s WHERE s.player_id = ?1 AND s.case_id = ?2),
         hints_used = (SELECT COALESCE(SUM(hints), 0) FROM solves s WHERE s.player_id = ?1 AND s.case_id = ?2),
         updated_at = ?3
       WHERE player_id = ?1 AND case_id = ?2`,
    ).bind(playerId, caseId, now));
  }
  // the verdict last, so a reopened and re-closed case replaces the earlier one
  for (const e of closes) {
    const { charged, answers } = e.data;
    const server = verdictCorrect(e.caseId, charged, answers);
    const correct = server == null ? e.data.correct : server;
    stmts.push(db.prepare(
      `UPDATE progress SET verdict = ?3, verdict_key = ?4, correct = ?5, closed_at = ?6, updated_at = ?7 WHERE player_id = ?1 AND case_id = ?2`,
    ).bind(playerId, e.caseId, JSON.stringify({ charged, answers }), verdictKey(charged, answers), correct ? 1 : 0, e.at, now));
  }
  await db.batch(stmts);
  return json({ ok: true, accepted: clean.length, rejected: events.length - clean.length });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
