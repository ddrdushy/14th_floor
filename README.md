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
  data/                story: intro.js (opening cinematic), cases.js (case order, flag rules), case01.js, side01.js, case02.js, case03.js
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

Cases are played in the order of `CASE_ORDER` in `src/data/cases.js` (Case 1, the side case, Case 2, Case 3). When one closes, the office phone rings; answering it plays the next case's `opening` cinematic and opens its map. Copy the shape of `src/data/case02.js`:

- `suspects`, `levels` (each level = one game + the evidence it reveals + image hotspot), `hints`, `label` (optional, e.g. "Side case")
- `opening`: cinematic panels; the last panel can be `{ title: { kicker: 'Case 2', name: 'Container 47' } }`
- `deduction`: copy for the deduction room, plus optional extra `questions` (e.g. "Where is Azman hiding?") with options
- `flagNames` + `flags({ charged, answers })`: the hidden story flags this case sets
- `ending(v)`: the outcome cinematic, built from the verdict (`v.charged`, `v.answers`, `v.flags`, `v.has(id)`)

Levels, panels and lines may carry `when: (flags) => boolean`, so earlier choices add puzzles or change lines. A case keeps a snapshot of the flags it was opened with, so reopening an older case never changes a case in progress. Evidence tags are numbered automatically.

### Images

Image keys live in `src/data/intro.js` (cinematic panels) and in each case file (`opening`, `ending`, `evidence.img`, suspect `img`). Prompts for the side case, Case 2 and Case 3 are in `docs/image_prompts.md`. Save a JPG as `public/assets/img/<key>.jpg`. Evidence photos are 4:3; set `evidence.hotspot` `{x, y, r}` (fractions of the photo) to circle the hidden item.

#### Video clips

Any cinematic panel (the intro, a case's `opening` or `ending`) can play a short clip with sound instead of its still. Drop the file in and it is used automatically:

- `public/assets/video/<img key>.mp4`, e.g. `public/assets/video/intro_01_rain.mp4` for the panel with `img: 'intro_01_rain'`.
- A panel with `video: '<key>'` looks for `public/assets/video/<key>.mp4` instead (used where a still appears twice: `intro_11_pocket`, `c2_intro_05b_breathe`). `video: false` turns clips off for a panel.
- Format: 16:9, about 8 seconds, H.264 video + AAC audio in MP4 (what Google Flow / Veo exports). Keep each under ~6 MB (`ffmpeg -i in.mp4 -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 128k -movflags +faststart out.mp4`).
- The still stays as the poster and the fallback: if the clip is missing or cannot play, the panel shows the still with its slow camera move as before. Captions keep their own timing; a short clip holds its last frame, a long one is cut when the panel advances.
- Clips play at the sound-effects volume (Settings), duck the music, and replace the panel's procedural sound effect and weather overlay. If a phone blocks sound, the clip plays muted with a "Tap for sound" button.
- The game checks for each clip with one `HEAD` request per session. On a static host, panels without a clip show up as 404 lines in the network log; that is harmless.
