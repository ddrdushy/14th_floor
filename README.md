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
  data/                story: intro.js (opening cinematic), cases.js (case order, flag rules), case01.js, side01.js, case02.js
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

Cases are played in the order of `CASE_ORDER` in `src/data/cases.js` (Case 1, the side case, Case 2). When one closes, the office phone rings; answering it plays the next case's `opening` cinematic and opens its map. Copy the shape of `src/data/case02.js`:

- `suspects`, `levels` (each level = one game + the evidence it reveals + image hotspot), `hints`, `label` (optional, e.g. "Side case")
- `opening`: cinematic panels; the last panel can be `{ title: { kicker: 'Case 2', name: 'Container 47' } }`
- `deduction`: copy for the deduction room, plus optional extra `questions` (e.g. "Where is Azman hiding?") with options
- `flagNames` + `flags({ charged, answers })`: the hidden story flags this case sets
- `ending(v)`: the outcome cinematic, built from the verdict (`v.charged`, `v.answers`, `v.flags`, `v.has(id)`)

Levels, panels and lines may carry `when: (flags) => boolean`, so earlier choices add puzzles or change lines. A case keeps a snapshot of the flags it was opened with, so reopening an older case never changes a case in progress. Evidence tags are numbered automatically.

### Images

Image keys live in `src/data/intro.js` (cinematic panels) and in each case file (`opening`, `ending`, `evidence.img`, suspect `img`). Prompts for the side case and Case 2 are in `docs/image_prompts.md`. Save a JPG as `public/assets/img/<key>.jpg`. Evidence photos are 4:3; set `evidence.hotspot` `{x, y, r}` (fractions of the photo) to circle the hidden item.
