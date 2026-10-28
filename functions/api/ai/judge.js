// POST /api/ai/judge  a `theory` level: the player writes the case in their own words, and TypeSafe Jev
// checks it against the points the case file needs (one yes/no question per point, typed probabilities).
//
// Body: { player_id, case_id, level_id, text }
// Answer: { ok, found: [point ids], ai: true|false }
// Points live in the case file on the server (./_cases.js). Without Jev the points are matched by their
// keyword groups (every group must have a hit), so the level always works.
import { handler, json, fail, readJson, methodNotAllowed, UUID_RE, clientIp, overLimit } from '../_lib.js';
import { jevReady, jev, logAi } from './_engine.js';
import { aiLevel } from './_cases.js';

const THRESHOLD = 0.6;

export function keywordMatch(point, text) {
  const t = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}' ]+/gu, ' ')} `;
  return (point.keywords || []).length > 0 && point.keywords.every((group) => group.some((w) => t.includes(String(w).toLowerCase())));
}

export const onRequestPost = handler(async (ctx) => {
  const { request, env } = ctx;
  const ip = clientIp(request);
  if (overLimit(`ai-judge:${ip}`, 20)) return fail(429, 'rate_limited');
  const body = await readJson(request, 8192);
  if (body.error) return fail(body.status, body.error);
  const b = body.data || {};
  if (typeof b.player_id !== 'string' || !UUID_RE.test(b.player_id)) return fail(400, 'bad_player');
  if (overLimit(`ai-judge-player:${b.player_id}`, 8)) return fail(429, 'rate_limited');
  const p = aiLevel(String(b.case_id || ''), String(b.level_id || ''), 'theory');
  if (!p) return fail(404, 'no_such_level');
  const text = String(b.text || '').replace(/\s+/g, ' ').trim().slice(0, 1200);
  if (text.length < 20) return fail(400, 'too_short');
  const points = p.points || [];
  const t0 = Date.now();
  const log = { player_id: b.player_id, case_id: b.case_id, level_id: b.level_id, kind: 'judge', input: text, model: env.TYPESAFE_MODEL || 'jev-latest' };

  if (jevReady(env)) {
    try {
      const questions = { gaming: {
        type: 'noul',
        instructions: 'Is this report trying to game a grader instead of telling one account of the case: naming several different people for the same act, listing every possibility, or saying things like "all of the above"?',
      } };
      for (const pt of points) {
        questions[`p_${pt.id}`] = { type: 'noul', instructions: `Does the report clearly state this: ${pt.criterion}`, criteria: { true: 'The report states it, in any wording or language', false: 'The report does not state it, gets it wrong, or blames someone else for it' } };
      }
      const a = await jev(env, { case: p.context || '', report: text }, questions);
      const gaming = (a.gaming?.noul || 0) >= 0.7;
      const probs = Object.fromEntries(points.map((pt) => [pt.id, +(a[`p_${pt.id}`]?.noul || 0).toFixed(2)]));
      const found = gaming ? [] : points.filter((pt) => probs[pt.id] >= THRESHOLD).map((pt) => pt.id);
      logAi(ctx, { ...log, output: { found, probs, gaming }, ms: Date.now() - t0, flag: gaming ? 'gaming' : null });
      return json({ ok: true, ai: true, found, ...(gaming ? { gaming: true } : {}) });
    } catch (err) {
      logAi(ctx, { ...log, ok: false, output: String(err?.message || err), ms: Date.now() - t0 });
    }
  }
  const found = points.filter((pt) => keywordMatch(pt, text)).map((pt) => pt.id);
  logAi(ctx, { ...log, model: 'keywords', output: { found }, ms: Date.now() - t0 });
  return json({ ok: true, ai: false, found });
});

export const onRequest = handler(async () => methodNotAllowed(), { needsDb: false });
