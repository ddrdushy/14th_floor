// GET /api/ai/status → { ok, ai: true|false } : is a language model configured for the AI mini games?
import { handler, json } from '../_lib.js';
import { aiReady } from './_engine.js';

export const onRequestGet = handler(async ({ env }) => json({ ok: true, ai: aiReady(env) }), { needsDb: false });
export const onRequest = handler(async () => json({ ok: false, error: 'method_not_allowed' }, 405), { needsDb: false });
