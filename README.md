# Floor 14

A Malaysian noir detective thriller played through mind puzzles. Kuala Lumpur, monsoon season. A dentist falls from a floor that officially does not exist, and the paper mousedeer on the railing is meant for you.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/
```

Requires Node 20+. If you copied `node_modules` from another machine, delete it and run `npm install` again.

## Useful URLs

| URL | What it does |
| --- | --- |
| `/` | Normal game start |
| `/?dev` | Adds a "Solve (dev)" button to every puzzle |
| `/?dev&screen=puzzle&level=l05` | Jump to a Case 1 puzzle (needs a saved detective) |
| `/?dev&screen=puzzle&case=case02&level=c2_03` | Jump to a puzzle in another case |
| `/?screen=opening&case=side01` | Play a case's opening cinematic (opens the case) |
| `/?dev&screen=lab&game=sudoku` | Puzzle lab: try any mini game on its own |
| `/?screen=office`, `map`, `board`, `deduce`, `archive` | Jump to a screen |

## How it fits together

```
src/
  main.js              screen registry, 3D background, deep links
  core/                router, save state (localStorage), audio (procedural), seeded rng, UI helpers, avatar
  three/               the 3D office: rain-on-glass shader, KL skyline, case board with red thread
  screens/             title, profile, intro (motion comic), office, map, puzzle, board, deduce, outcome, closed, archive, lab
  games/               one file per mini game + registry.js (registry_b.js, registry_c.js for newer games)
  data/                story: intro.js (opening cinematic), cases.js (case order, flag rules), case01.js, side01.js, case02.js, case03.js, case04.js
public/assets/img/     generated art (Google Flow). Missing images fall back to a placeholder panel.
```

### Adding a mini game

Create `src/games/<id>.js` exporting `meta`, `demo` and `mount(el, ctx)`:

- `ctx.params`, `ctx.variant`: from the level data
- `ctx.rng()`: seeded random, deterministic per player and level
- `ctx.saved`, `ctx.onSave(state)`: resume a 20-minute puzzle after a reload
- `ctx.onProgress(0..1)`: clears the fog on the evidence photo
- `ctx.onSolved()`: reveals the evidence

Return `{ destroy, hint, devSolve }`. Register it in a registry file.

### Adding a case

Cases are played in the order of `CASE_ORDER` in `src/data/cases.js` (Case 1, the side case, Case 2, Case 3, Case 4). When one closes, the office phone rings; answering it plays the next case's `opening` cinematic and opens its map. Copy the shape of `src/data/case02.js`:

- `suspects`, `levels` (each level = one game + the evidence it reveals + image hotspot), `hints`, `label` (optional, e.g. "Side case")
- each suspect has `revealedBy: '<level id>'`, the level whose exhibit first makes them a person of interest, and an optional one-line `revealLine`. Nobody is on the map, the board or the office wall before that level is solved; then a "New person of interest" card offers to pin them, and anyone not pinned waits in the board's tray. Spread them over the first half of the case, never all on level 1, and never on a flag-conditional level. Pins are saved in `cases[id].pinnedSuspects`.
- `opening`: cinematic panels; the last panel can be `{ title: { kicker: 'Case 2', name: 'Container 47' } }`
- `deduction`: copy for the deduction room, plus optional extra `questions` (e.g. "Where is Azman hiding?") with options
- `flagNames` + `flags({ charged, answers })`: the hidden story flags this case sets
- `ending(v)`: the outcome cinematic, built from the verdict (`v.charged`, `v.answers`, `v.flags`, `v.has(id)`)

Levels, panels and lines may carry `when: (flags) => boolean`, so earlier choices add puzzles or change lines. A case keeps a snapshot of the flags it was opened with, so reopening an older case never changes a case in progress. Evidence tags are numbered automatically.

### Images

Image keys live in `src/data/intro.js` (cinematic panels) and in each case file (`opening`, `ending`, `evidence.img`, suspect `img`). Prompts for the side case and Cases 2 to 4 are in `docs/image_prompts.md`. Save a JPG as `public/assets/img/<key>.jpg`. Evidence photos are 4:3; set `evidence.hotspot` `{x, y, r}` (fractions of the photo) to circle the hidden item.

#### Video clips

Any cinematic panel (the intro, a case's `opening` or `ending`) can play a short clip with sound instead of its still. Drop the file in and it is used automatically:

- `public/assets/video/<img key>.mp4`, e.g. `public/assets/video/intro_01_rain.mp4` for the panel with `img: 'intro_01_rain'`.
- A panel with `video: '<key>'` looks for `public/assets/video/<key>.mp4` instead (used where a still appears twice: `intro_11_pocket`, `c2_intro_05b_breathe`). `video: false` turns clips off for a panel.
- Format: 16:9, about 8 seconds, H.264 video + AAC audio in MP4 (what Google Flow / Veo exports). Keep each under ~6 MB (`ffmpeg -i in.mp4 -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 128k -movflags +faststart out.mp4`).
- The still stays as the poster and the fallback: if the clip is missing or cannot play, the panel shows the still with its slow camera move as before. Captions keep their own timing; a short clip holds its last frame, a long one is cut when the panel advances.
- Clips play at the sound-effects volume (Settings), duck the music, and replace the panel's procedural sound effect and weather overlay. If a phone blocks sound, the clip plays muted with a "Tap for sound" button.
- The game checks for each clip with one `HEAD` request per session. On a static host, panels without a clip show up as 404 lines in the network log; that is harmless.

## Backend: players, leaderboard, admin

The game is still a static site; a few Cloudflare Pages Functions in `functions/api/` add anonymous play statistics, a leaderboard (title menu, office, closed case file) and an owner dashboard at `/admin.html`. Without them (vite dev, `vite preview`, any static host) the game asks `/api/status` once, gets the static `public/api/status` (`{"ok":false}`), and stays quiet: no failed requests, no errors, the leaderboard says it is out of reach.

### Set up on Cloudflare Pages

1. **Storage & Databases → D1 → Create** a database (e.g. `floor14`).
2. In the Pages project, **Settings → Bindings → Add → D1 database**: variable name **`DB`**, the database above (Production, and Preview if you want it there).
3. **Settings → Variables and Secrets → Add → Secret**: **`ADMIN_PASSWORD`**, a long random password (it also guards the Voices admin).
4. Redeploy (push a commit or "Retry deployment"); bindings only apply to new deployments.

There is no `wrangler.toml` on purpose: with one, Pages takes bindings from the file and locks them in the dashboard. The schema creates itself: the first request to any `/api` route runs `CREATE TABLE IF NOT EXISTS` for every table and index (once per isolate, recorded in `meta.schema`), so there is nothing to paste into the D1 console. Future changes go in `functions/api/_lib.js` (`SCHEMA`, bump `SCHEMA_VERSION`).

| Table | What it holds |
| --- | --- |
| `players` | `id` (random UUID from the browser), `created_at`, `last_seen`, `detective_name` (only if shown), `show_on_board`, `platform` (e.g. `android/mobile`, from the user agent), `country` (Cloudflare's `request.cf.country`), `dev` (opened the game with `?dev`), `sessions`, rate-limit counters |
| `events` | every accepted event: `type`, `case_id`, `level_id`, `data` (JSON), `at`, `received_at` |
| `solves` | one row per player per solved puzzle: `time` (seconds, clamped to 4 h), `hints` (clamped to 20) |
| `progress` | per player per case: `opened_at`, `levels_solved`, `total_time`, `hints_used` (rebuilt from `solves` on the server, never taken from the client), `verdict` (`{charged, answers}`), `correct`, `closed_at` |

### Endpoints

| Route | |
| --- | --- |
| `GET /api/status` | `{ok, backend, db}`; always 200 |
| `POST /api/track` | `{player_id, events:[{type, case_id, level_id, data, at}]}`. Types: `session_start`, `case_open`, `level_solved`, `case_closed`, `profile_set`. At most 50 events and 8 KB per request, 30 requests a minute per player (stored in D1) plus a best-effort per-IP limit. Bad events are skipped, not fatal. |
| `GET /api/leaderboard?case=case01&me=<id>` | Top 50 players who chose to show their name. Per case: correct verdict, then total puzzle time, then magnifiers. `case=overall` (default): cases closed correctly, cases closed, time, magnifiers. `me` adds your own rank, even with your name hidden. Players who used `?dev`, or averaged under 5 s a puzzle, are not ranked. Player ids are never returned. |
| `GET /api/admin/summary?tz=<min>&dev=1` | KPIs, new players per day (30 days), players by current stage, the per-puzzle funnel with average time and hints, verdicts per case, countries, platforms. Dev players are left out unless `dev=1`. |
| `GET /api/admin/players?limit&offset&q` | Players by last seen with their furthest stage; `q` matches a name, an id prefix or a country code. |
| `GET /api/admin/player/:id` | One player's progress, solves and event timeline. |

`/api/admin/*` needs `Authorization: Bearer <ADMIN_PASSWORD>` (compared in constant time; 401 otherwise, 429 after 10 wrong tries in 5 minutes from one IP). If `ADMIN_PASSWORD` is not set the admin routes answer 503 `not_configured`; if `DB` is not bound every data route answers 503 and the game ignores it. All routes are JSON, same-origin only (cross-site `Origin` gets 403), `no-store`, and never return stack traces. Other admin routes can reuse `requireAdmin` / `adminHandler` from `functions/api/_lib.js`.

Whether a verdict is right follows the flags each case sets: Case 1, Jason and Rizal charged and not Shanti; side case, Bobby only; Case 2, Tony and Norhayati, not Faizal, and Azman found at the kelong; Case 3, Melissa and Shahrul, not Kenny or Cheah, and the X-ray named as Ong Wei Jie; Case 4, Shehani and Kasun, not Mohan or K. Rajan, and the book found at Colombo Fort station. The client sends its own `correct` (from `src/data/*.js` `flags()`), but the server recomputes it for known cases (`verdictCorrect` in `_lib.js`); keep both in step when a case's answer changes.

### In the game

`src/core/telemetry.js` watches the save (`onChange` in `state.js`; no screen calls it) and reports the difference from what it last sent: a case opened, a puzzle solved, a case closed with its verdict, the name shown or hidden. Players who started before the backend existed are backfilled from their save on their next visit. Events queue in `localStorage` (`floor14.telemetry.v1`), go out in batches with `fetch` keepalive (`sendBeacon` when the page hides) and retry with backoff; nothing in it can throw into the game. The leaderboard screen is `src/screens/leaderboard.js` (+ `src/styles/leaderboard.css`).

**Privacy.** The player id is a random `crypto.randomUUID()` kept in the save (`playerId`); there is no account, email or IP stored, only the country Cloudflare reports. Settings → Leaderboard: **Share anonymous progress** (on by default; off sends nothing more and removes your name from the board) and **Show my detective name on the leaderboard** (off by default; the name is only sent while this is on).

### Admin

`/admin.html` (also `/admin`; `noindex` meta and `X-Robots-Tag` from `public/_headers`). Sign in with `ADMIN_PASSWORD`; the token lives in `sessionStorage` for that tab. **Overview**: players, active in 24 h / 7 / 30 days, cases closed and % correct, names on the board; new players per day; players by current stage; per case, the puzzle funnel (drop-off against the previous puzzle, average time and hints) and the verdict breakdown; countries and platforms. "Include dev sessions" adds players who used `?dev`. **Players**: search, list, and each player's timeline. **Voices**: `src/admin/voices.js` (see below). Charts are plain SVG (`src/admin/charts.js`). Built as a second Vite page (`build.rolldownOptions.input` in `vite.config.js`).

### Local test with the backend

```bash
npm run build
npx wrangler pages dev dist --d1 DB=floor14 --binding ADMIN_PASSWORD=test --port 8788
# game: http://localhost:8788   admin: http://localhost:8788/admin.html (password: test)
```

Local D1 data lives in `.wrangler/state` (delete it to start over). `curl -H 'Authorization: Bearer test' localhost:8788/api/admin/summary` shows the raw numbers.

## Voices

Cinematic dialogue can be spoken by [Fish Audio](https://fish.audio) voices. Captions stay exactly as they are (English, with the original-language line small above it); the voice says the original. Without the backend below, or if anything fails, the game plays captions only and never asks again that session.

### Set up on Cloudflare Pages

In the Pages project, **Settings → Bindings / Variables and Secrets**:

| Name | Type | What it is |
| --- | --- | --- |
| `VOICE` | KV namespace binding | Holds the voice map and every generated line. Create one namespace (e.g. `floor14-voice`) and bind it as `VOICE` for Production (and Preview if you want voices there). |
| `FISH_API_KEY` | Secret | Your Fish Audio API key. It only ever lives in the Function; it is never sent to the browser and is not in the repo. |
| `ADMIN_PASSWORD` | Secret | Already used by `/admin`; it also guards the voice admin endpoints. |
| `FISH_MODEL` | Variable (optional) | Default TTS model when the admin page has not set one: `s2.1-pro` (default), `s2.1-pro-free`, `s2-pro`, `s1`, `drama-3`. |

Redeploy after adding them. `FISH_API_BASE` is for local tests only (points the Functions at a stub instead of `https://api.fish.audio`); never set it in production.

### Casting voices in /admin

Open `/admin.html`, sign in, and choose **Voices**. Every speaker in the cinematics is listed with its languages and line count (Narrator, Inspector Farah Iskandar, Jo Lim, Bala Anne, Rachel Goh, Salmah, ...). For each one: **Cast & lines** → search Fish Audio's public voice library (or your own voices with "My voices"), play a voice's sample, **Hear a line** to hear one of that speaker's real lines in it, then **Assign**. Speed and model can be set per speaker; **Silent** keeps a speaker unvoiced. A fallback voice can cover every unassigned speaker; without one, unassigned speakers stay silent. **Generate missing lines** (per speaker, or for everyone at the top) fills the cache in the background, 30 lines per round; **Regenerate (purge)** deletes a speaker's stored lines so the next play makes a new take.

Some caption speakers are one character under another name: "Woman" on the phone is Rachel (intro), Salmah (Case 2), Jo (Case 3) and Tharshini (Case 4), and "???" on the phone at the end of Case 4 and "???" in the intro dream is Daniel. That mapping is `VOICE_CAST` in `src/data/voice-overrides.js`, so each person has one voice everywhere.

### Acting: per-line directions

Fish Audio S2 models act from bracket cues in the text (`[sobbing]`, `[whispering]`, `[cold, quiet contempt]`, `[break]`, `[long-break]`, `[emphasis]` before a word; natural language, best at the start of a sentence, at most 3 ideas each; see docs.fish.audio/developer-guide/core-features/emotions). Every voiced line has a direction in `src/data/voice-directions.js`, keyed by line id, with the caption as a comment above it:

```js
// Rachel Goh: He didn't jump.
'16b3o3lkpw8': { cue: '[break][sobbing][trembling voice]', speed: 0.85 },
// Inspector Farah Iskandar: Kau. Of all people.  /  You. Of all people.
'06nh9lf74vy': { say: '[cold, surprised] Kau. [break] [quiet contempt] Of all people.', speed: 0.95 },
```

`cue` goes in front of the line; `say` is the whole line with cues inside (same words; `{you}` for the player's name); `speed` multiplies the speaker's speed. Brackets in the case files' own text are still stripped from what the voice reads; directions are added only to the text sent to Fish, never to captions. The build bakes them into the manifest (`entry.dir`, plus `entry.rev`, which the game sends as `&r=`), and `npm run voices:manifest` lists lines without a direction and directions whose line no longer exists.

In /admin > Voices > a speaker > Lines, each line shows exactly what is sent to Fish. **Edit direction** changes it live (stored in KV `voices:directions`, which wins over the file; **Try it** previews before saving, **Use the file's** removes the override), and **Regenerate line** makes a new take for players. A changed direction is part of the line's cache key, so it is generated again on its next play; players' browsers get the new URL too.

Console equivalents (see "Admin API"): `A('/directions', { method: 'PUT', body: JSON.stringify({ id, cue, say, speed }) })`, `{ id, reset: true }` to go back to the file, `A('/regenerate', { method: 'POST', body: JSON.stringify({ id, voice }) })`, and `A('/directions')` to list overrides.

### The player's own voice

Lines spoken by `You` (the player's detective) are voiced to match the portrait the player chose (`profile.portrait`, `det_01`..`det_08` in `src/core/avatar.js`). In /admin > Voices, **Your detective** lists the eight portraits (Detective 1 Indian man 50s, 2 Malay woman in a tudung 30s, 3 Chinese man 30s, 4 Indian woman 30s, 5 Malay man 50s, 6 Chinese woman 30s, 7 Malay/Eurasian man 30s, 8 Malay/Sabahan woman 40s), each with the same search / sample / assign / preview / silent controls. They are stored as map keys `You@det_01`..`You@det_08`; a portrait without its own voice uses `You`, then the fallback voice. The game adds `&d=det_0N` to the audio URL for `You` lines only (every other line has one shared URL), and `d` is part of the cache variant, so two detectives never share audio. Lines where another character says the player's name (`{you}`) belong to that character's voice, not the detective's.

### Admin API (from the browser console on /admin.html)

The admin page keeps the password in `sessionStorage['floor14.admin.token']`, sent as `Authorization: Bearer <password>`.

```js
const T = sessionStorage.getItem('floor14.admin.token');
const A = (path, opts = {}) => fetch(`/api/admin/voices${path}`, { ...opts, headers: { authorization: `Bearer ${T}`, 'content-type': 'application/json', ...(opts.headers || {}) } }).then((r) => r.json());
await A('');                                                     // speakers, detectives, map, config
await A('/search?q=malaysian%20woman&lang=ms&sort=score&page=1&size=20'); // Fish voices: items[].id is a reference_id
const { map } = await A('/map');                                 // current map
map['You@det_02'] = { reference_id: '<fish model id>', title: 'Nur', speed: 1 };
map['Narrator'] = { reference_id: '<fish model id>', title: 'Narrator' };
await A('/map', { method: 'PUT', body: JSON.stringify({ map }) }); // replaces the whole map; returns { ok, map, dropped? }
await A('/generate', { method: 'POST', body: JSON.stringify({ voice: 'You@det_02' }) }); // or {} for everyone
```

`search` params: `q` (title words), `lang` (e.g. `en`, `ms`, `ta`, `zh`), `sort` (`score` | `task_count` | `created_at`), `page`, `size` (1-50), `self=1` (your own Fish voices). The PUT body is `{ "map": { ... } }` (a bare map also works). Keys: any speaker name from the manifest, `You@det_01`..`You@det_08`, `_default` (fallback voice) and `_settings` (`{ model, temperature, top_p, mp3_bitrate, latency }`). Each voice entry: `{ reference_id, speed? (0.5-2), volume? (dB), model?, off? (true = silent), title?, cover?, languages? }`. Unknown keys are dropped (listed in `dropped`); `_version` and `take` are managed by the server.

### How lines are made and cached

- `scripts/build-voice-manifest.mjs` runs before every `npm run build` (`prebuild`; also `npm run voices:manifest`). It walks the intro, each case's `opening` and every branch of each case's `ending(v)` (all charged-suspect combinations x every answer to the extra questions x flags) and writes `src/data/voice-manifest.json`: `{ speakers, lines: { <id>: { speaker, voice, text, en, lang, tts?, where } } }`. Commit it with the case files.
- A line's id is a hash of speaker + spoken text (`orig || en`), from `src/core/voice.js`, which the game, the build script and the Functions share. The same sentence by the same speaker is one recording wherever it appears. Lines that name the player (`${v.you}`) are stored with `{you}` and spoken with "Detective". Stage cues like `[Incoming call]` are not spoken.
- `src/data/voice-overrides.js` can change what the voice reads without touching the subtitle: romanised Tamil and Cantonese lines are sent to Fish in Tamil script and Chinese characters there. Penang Hokkien stays romanised (in Han characters a voice reads it as Mandarin). Fish's `language` hint is only sent for English lines; mixed lines are auto-detected.
- `GET /api/voice/<id>?v=<version>` only accepts ids in the manifest, so the endpoint cannot be made to say arbitrary text. The first request for a line calls Fish (`POST https://api.fish.audio/v1/tts`, `model` header, MP3 128 kbps), stores the MP3 in KV and returns it; every later request from any player is served from the edge cache or KV. Responses are `immutable` for a year; the `v` (voice map version) changes whenever voices are reassigned or purged, so players never keep an old voice.
- KV keys: `voices:map` (the map, with `_version`), `audio:<speaker-slug>:<id>:<variant>` (variant = hash of the text sent, voice id, model, speed and take, so changing any of them never serves stale audio), `preview:<hash>` (admin previews, expire after a day), `voices:job` (last pre-generation run).
- Limits: per IP 300 voice requests and 30 newly generated lines a minute (best effort, per isolate); pre-generation runs 2 lines at a time (Fish's Starter tier allows 5 concurrent requests).

### Costs

Fish bills by UTF-8 bytes of text: $15 per million bytes on `s2.1-pro` / `s2-pro` (`s2.1-pro-free` is $0 for testing). All 171 lines in the manifest are about 15 KB of text, so voicing the whole game once costs roughly **$0.25** per full set of voices. The player's 4 `You` lines are generated once per detective portrait (8 x 130 bytes, a fraction of a cent). Each unique line is generated once and then served from KV; players replaying never cost anything. You pay again only when you reassign a voice, change its speed/model, purge, or edit a line. Tamil and Chinese text costs 3 bytes per character. KV on the free plan allows 1,000 writes a day (one per generated line) and 100,000 reads.

### Testing locally without a Fish key

```bash
npm run build
npx wrangler pages dev dist --kv VOICE --binding ADMIN_PASSWORD=test \
  --binding FISH_API_KEY=test-key --binding FISH_API_BASE=http://127.0.0.1:8789
```

with any small HTTP server on port 8789 that answers `POST /v1/tts` with an MP3 and `GET /model` with `{ "total": 1, "items": [...] }`. The game's settings have a **Voices** section (on/off and volume).

### Files

`src/core/voice.js` (ids, shared), `src/core/voice-player.js` (playback), `src/screens/cinema.js` (timing, ducking, prefetch), `src/data/voice-overrides.js`, `src/data/voice-directions.js` (acting), `src/data/voice-manifest.json` (generated), `scripts/build-voice-manifest.mjs`, `functions/api/voice/` (`status.js`, `[id].js`, `_shared.js`), `functions/api/admin/voices/[[path]].js`, `src/admin/voices.js` + `voices.css` (mounted by `src/admin/admin.js` as `mountVoices(el, { api, h, token })`), `public/api/voice/status` (static-host fallback).
