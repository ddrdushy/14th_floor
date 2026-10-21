// GET /api/status: is the backend here? Always answers 200, so the game can ask without a console error.
// On a static host without Functions the game gets public/api/status instead ({"ok":false}).
import { handler, json } from './_lib.js';

export const onRequestGet = handler(async ({ env }) => json({ ok: !!env.DB, backend: true, db: !!env.DB }), { needsDb: false });
export const onRequest = handler(async () => json({ ok: false, error: 'method_not_allowed' }, 405), { needsDb: false });
