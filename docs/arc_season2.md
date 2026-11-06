# Floor 14, Season Two: Cases 8 to 12 ("The New Driver")

The story plan for `case08.js` to `case12.js`. Five writers will each be handed this whole document and will write one case from it, in parallel, without seeing each other's files. So everything a case needs from another case (names, times, numbers, flags, exhibits) is fixed here. If something you need is not here, do not invent a fact about the Chairman or about another case: keep it inside your own case.

How to read it:

- §0 to §7 apply to every case. Read them all.
- Then read your own case in full, and the **Truth** and **Flags** blocks of the other four, so your references match.
- §P, **Private notes**, is for the owner. Writers read it only to know what they must *not* settle.

---

## §0 The season on one page

**Logline.** At ten past two on the first of December you get into the front of a black car with no plates, and for three and a half months the man in the back seat sends you on errands: drive me, open my box, fetch my signature, tell them about my first night, bury me. Every errand leads to a crime, and every crime leads a little closer to him. At the end a man in a white shirt dies in his car, nobody can say who he was, and at ten past two the car comes for you again.

**The secret under the season (writers only).** Since 2016 the Chairman has been preparing to die in public. In August 2016 (the week of the third lighter) he amended the letter of wishes to his Singapore trust: *"On my death the Trust is to be directed by whoever drives me last."* That sentence is bait. It makes ambitious people want to be the last one at the wheel, and it gives his death a ceremony. He chose the detective as his "new driver" because the detective is the one witness in Kuala Lumpur whom police, prosecutor and press will all believe. In Case 12 a man of his mother's line, who has had no voice for years, is killed in the back of his car at the gate where Sinar began, and the detective is asked to write the dead man's name on the form. Whether that man was the Chairman is **not** decided, and must stay undecided.

**The spine: five errands, one each case.**

| # | id | Title | The errand | Where | When | Crime | Structure | Second question |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8 | `case08` | Ten Past Two | "Drive me." | Brickfields, Jalan Ampang, Federal Highway, Pulau Indah, Jugra | Tue 1 to Thu 3 Dec 2026 | Attempted murder: Farah's car is pushed into the divider | Road movie and hostage night: one drive, then retracing it | Where did he get out of the car? |
| 9 | `case09` | Box 14 | "Open my box." | Melaka | Thu 24 to Mon 28 Dec 2026 | Burglary: a Christmas Eve heist that leaves the gold | Heist reconstructed: inside woman, river crew, a double-cross | Where is the promissory note? |
| 10 | `case10` | Telok Ayer | "Fetch my signature." | Singapore, and the Johor shore | Wed 13 to Sun 17 Jan 2027 | Abduction: an old solicitor vanishes from a bolted room | Locked room, abroad | How did Arthur Seah leave the bolted room? |
| 11 | `case11` | The Gate | "Tell them about my first night." | Shah Alam coroner's court, Jugra, Banting, Butterworth | Mon 1 to Thu 4 Feb 2027 | Attempted murder by poison, during an inquest into a 1986 drowning | Courtroom: four days of an inquest | What happened at Jugra at 2:10 AM on 1 December 1986? |
| 12 | `case12` | Unknown Male | "Bury me." | Jugra, Hospital Kuala Lumpur, Menara Sinar, Bukit Aman, Brickfields | Sat 20 to Wed 24 Feb 2027 | Murder and arson: a man dies in the back of the black car | Finale: whose body is it? | What does the death certificate say? |

**What the season gives the player about him** (detail in §3): his rules, his hand (left-handed writing, two words in ink), his habits (old street names, Getaran Jiwa, four minutes at any stop, never crosses water), his first money (a Chettiar loan in Melaka, 1986), his ownership (a Singapore trust signed in a dead driver's name), his past (the man who drove Teoh Ah Chuan's lorry, and kept his watch), his biology (a grey hair: mitochondrial DNA only, in no file), and finally a body that may or may not be his.

**Pursuits** (exactly three, each a different starting setting and skyline): Case 8 Kuala Lumpur (`city` start, skyline `kl`), Case 10 Singapore (`market` start, skyline `town`), Case 11 Butterworth (`docks` start, skyline `penang`, George Town across the channel). Cases 9 and 12 have none (Case 9 has a `getaway`, both have a `chase` as a conditional level).

**Tape variants:** Case 8 `splice`, Case 9 `spectro`, Case 10 `reverse` (mode `slow`), Case 11 `splice`, Case 12 `spectro`.

**The ending of Case 12 (the season's hook).** A man in a white shirt, about seventy-five, with no larynx, is dead in the back of a burned black car at the Jugra gate. His thumb matches the 1987 trust deed on nine points of sixteen; his mother's line matches a grey hair from 1 December. The detective is asked to write his name on the burial permit. Whatever they write, at 2:10 AM on Wednesday 24 February a second black car with no plates stops outside Restoran Bala with the **back** door open. The voice, from the driver's seat: *"Good evening, detective. Not the front. Tonight I drive."* He tilts the rear-view mirror until it holds your eyes and his, and the reading light comes on. You look. Cut to black. No face, no name, no reaction that gives one away.

---

## §1 Rules for every writer

### The Chairman

1. **Never named. Never seen.** No face, in text or image. At most: a silhouette, a hand in a white cuff, a cigarette's glow, a shape behind the driver's seat, a shadow on the ground, a back in the water (1986). His age is never stated as a number; "old", "an old man's hand", "older than he looked" are allowed.
2. **His voice** is the speaker `'The Chairman'` in every case (Case 7 convention; same cast voice everywhere). Do not label him `'A voice'`. Exception: in Case 11 the 1986 voice at the river is **narrated** (`who: null`, quoted), never voiced, because whether the 1986 driver and the voice are one man is undecided.
3. **The dead man in Case 12** never speaks (he has no larynx). Nobody in the season ever calls him the Chairman as fact, except characters who are wrong or lying.
4. **Only the facts in §3** may be told about him, each in the case listed. Do not add a fact, a habit, a place or a relative. If a scene seems to need one, cut the scene.
5. **Candidate protection.** The owner is keeping several people plausible (see §P). For **Bala Anne, Uncle Wong (Wong Kam Fatt), Tan Sri Azhar Kamaruddin and Pak Itam**, never establish in any case: which hand they write or hold things with; their height; whether they smoke or have ever smoked; which wrist their watch is on; whether they can swim or have ever been to Singapore; their brothers, sisters, mother or mother's family; any scar on the throat; what they were doing in 1985 to 1987. And never put any of them on screen, or give them an alibi, at these times: **2:00 to 6:00 AM on Tue 1 Dec 2026**, **1:00 to 2:40 AM on Sun 21 Feb 2027**, and **1:30 to 2:30 AM on Wed 24 Feb 2027**. The only exceptions are written into the cases and must be kept exactly: Pak Itam at the Jugra gate from 5:30 to 5:45 AM on 1 Dec (Case 8) and from 1:00 to 2:40 AM on 21 Feb (Case 12); Tan Sri Azhar at Jenjarom at 2:12 and at the gate at 2:20 to 2:22 AM on 21 Feb (Case 12).
6. **His orders** are printed, collected by hand and shredded, signed "Office of the Chairman", come in pairs ("X first. Then Y.") and end "Nothing on the phones." Every case has one.
7. **His times.** Each ending closes on a 2:10 AM panel with `music: 'chairman'`. He always says thank you.
8. **Images.** He never appears in a prompt except as the shapes in rule 1.

### Structure (checked by the integrator)

- About **22 base levels**, plus the conditional levels listed for your case (each with `when:`). Your level list below is the plan; you may rename titles and rewrite briefs, but keep the ids, games, order, the clue each exhibit proves, and the conditions.
- Exactly **two `interrogation`** levels, **one `theory`** immediately before the final interrogation, **one `tape`** in the variant given, at most **one `pursuit`** (only where planned). **No game type more than twice** in a case (conditionals count).
- **Suspects:** `revealedBy` on a base level in the first half, never level 1, never a conditional level. Each suspect has a `revealLine`.
- **`flags()`** sees only `{ charged, answers }`, never earlier flags. Anything that depends on an earlier case is written with `when:` on levels, panels and lines, or read from `v.flags` in `ending(v)`.
- **New flag names must be unique across the whole game.** `judge()` deletes every flag a case owns before setting it, so never reuse an earlier case's flag name (that is why Case 12 uses `AZHAR_WRONGED_12`).
- **The tape line.** For `splice` and `reverse`, define the line as a `const` and use it word for word both in your opening (or ending) and in the tape level's `params.line`, so the voice manifest records it (see `TABLE_LINE` in `case07.js`).
- **Wrong verdicts** must read as a closed case, never as a failure screen (house style since Case 2).
- **The detective** is "you", with no gender, no name except `${v.you}` in endings.
- **Evidence:** `short` one or two sentences, `text` one paragraph, Case 7 house style. Use `hotspot: HOT()` (`{ x: 0.5, y: 0.5, r: 0.12 }`) until the art exists.
- **Interrogation voices:** `voice_2` or `voice_3` for men, `voice_1` or `voice_4` for women.
- `hints: 8`, `music: 'investigation'` on the case; cinematic panels use the existing cues (`office`, `tension`, `memory`, `resolution`, `chairman`, `fire`/`panic`, `intro`).

### Language

Dialogue may carry an original line (`orig`) and the English (`en`). Use other languages **sparingly**: one or two lines per scene at most, and only from the speaker's own life. Tamil and Cantonese are written romanised in the case file and need an entry in `src/data/voice-overrides.js` with the native script (see the Tamil and Cantonese entries there). Penang and Selangor Hokkien stay romanised (no override text, only `lang`). Malay needs only `{ lang: 'ms' }`. Sinhala in script. Kristang (Case 9) is never voiced: only on signs or in narration.

### Motifs to keep

- Frightened men Sinar pays always keep something back (Ismail's tape, Kamal's envelope, Jason's bag). Every Season Two culprit or accomplice keeps one thing.
- Two teh, drink one (Daniel). The paper kancil is Daniel's only.
- "Jangan tengok belakang." Don't look back. Its origin is revealed in Case 11.
- Ten past two.

---

## §2 Shared predicates

Copy what you need to the top of your case file.

```js
// Daniel at the start of Case 8: exactly case07.js's rules.
const HELD7 = (f) => (!!f.DANIEL_TAKEN || !f.DANIEL_FOUND) && !f.ARCHIVE_SEIZED; // in Sinar's hands
const REMAND7 = (f) => !HELD7(f) && !!f.DANIEL_CHARGED;                           // Sungai Buloh, Block C
const FREE7 = (f) => !HELD7(f) && !f.DANIEL_CHARGED;                              // Farah's safe house

// Case 8 returns him to everyone who had lost him (he is in the back seat on 1 December).
// From Case 9 on, Daniel is free in every branch.
const WAS_HELD = HELD7;                          // he rode hooded in the back seat on 1 December
const DNAA = (f) => !!f.DANIEL_CHARGED;          // his murder charge was withdrawn on 22 Dec 2026 as a
                                                 // "discharge not amounting to acquittal": it can come back

// Who signs the Office of the Chairman's letters, by Case 5.
const SECRETARY = (f) => (f.VIVIAN_FREE ? 'vivian' : f.MELISSA_FREE ? 'melissa' : 'unknown');
// vivian: Vivian Chua, in Singapore since Case 5. melissa: Melissa Ong, the Office's secretary since Case 5.
// unknown: a typed initial nobody can match.
```

---

## §3 The Chairman: what is known, and what each case adds

### Canon at the end of Case 7 (do not contradict)

- Sinar began in 1986: "one lorry, a yard in the oil palm under Bukit Jugra, and a sun painted on the gate. I have the gate still." Jeffrey Ho started driving for Sinar Pengangkutan in 1987: "In 1987 he was the man who owned the lorry."
- Muthu (Muthusamy a/l Perumal, 71) drove him from November 1986; sat behind the screen at every dinner from 1997; went to his doctor for him from 2014; fetched the third D.R. lighter in August 2016; paid for the teh at table seven in August 2016; was killed on 14 Nov 2026 "after the forty seconds"; cremated at Cheras on Mon 16 Nov.
- His voice: calm, close, "like a man ordering tea"; the snap of a flip-top lid between sentences; he says "detective" and "thank you". At the Bay 3 fire in 2021 he said "Biarkan, Tuan Ismail. Biar dua-dua sekali." He has spoken from Level 14 and by telephone from the car in Bay V1.
- A black car with no plates; a hand in a white cuff; he smokes and has lit the third lighter thousands of times; he never gets out of the car; he comes himself only to watch.
- Orders: "Office of the Chairman", printed, in pairs, "Nothing on the phones". Prepaid numbers that only receive calls; one ends in 1986.
- He has watched the detective since 2016 (a grey folder, "Opened 2016"); a telescope on Level 14 points at Restoran Bala; the BALA line has been tapped.
- At Muthu's cremation: "Jangan tengok belakang, detektif. That is what your partner said to you in the fire. I was close enough to hear it. Muthu drove me for forty years and never once looked in the mirror. I need a new driver. The first of December. Ten past two. Outside Restoran Bala. You may look in the mirror as often as you like." A car key on a ring with a small brass sun in your pocket.
- In Case 7 the car came down to Bay V1 "with two people in the back" (Daniel was one of them only in the HELD branch).

### What Season Two adds (each fact only in the case named, and nothing else)

| Case | New facts about him |
| --- | --- |
| 8 | He rode directly behind the driver's seat from 2:10 to 3:44 AM, and left the car at the Warehouse 6 gate; for the rest of the drive his voice came from a telephone on the back seat. He uses the old names of Kuala Lumpur's streets (Batu Road, Birch Road, Brickfields Road, Mountbatten Road, Treacher Road). He hums Getaran Jiwa. A tailor on Batu Road has measured him in the dark, in the back of the car, since December 1986: collar 15½, the right cuff cut wider for a watch; his first order, on 2 Dec 1986, was a white shirt and a black mourning band. His nine typed rules, and two words in ink ("Terima kasih."), written left-handed. A grey hair from the back seat: mitochondrial DNA only, in no file, and the same hair in the escort car. The escort: "Some nights there are two in the back. I have never known which one is him." He said of the attack on Farah: "That was not mine." He said: "Forty years ago tonight I drove this road the other way, in a lorry with no lights." The 1986 lorry's number plate, BCK 210, kept for forty years. |
| 9 | His first money: RM 18,000 from a Chettiar firm in Melaka on 2 Dec 1986 for "Sinar Pengangkutan, Jugra, the bearer", Muthu as guarantor; repaid on 1 Dec 1987 to the day; Box 14 rented that day for fifty years, paid in advance; every 1 December the box was visited for four minutes, signed "M.P." until 2025, and in 2026 by a small drawn sun. The Chettiar's note: "Not a good man. But he will repay." Box 14 held Teoh Ah Chuan's watch, stopped at 2:10 and full of river mud; the lorry's registration card; a 1986 photograph of the gate with a girl holding a brush and the long shadow of the photographer, a slim man in a cap; the cancelled note with his left thumb (nine clear points; not enough for a search). He sends the detective the photograph back on New Year's Day with two lines in the same hand. |
| 10 | Sinar's top: the Jugra Trust, settled at Johor Bahru on 1 Dec 1987 with Seah & Seah of Singapore; it owns Sinar Holdings Pte Ltd, which owns 51% of Sinar Holdings Berhad. The settlor on paper is "Muthusamy a/l Perumal", but the signature is not Muthu's and the left thumb is not Muthu's. He would not cross to Singapore: "I do not cross water." The letter of wishes, amended 19 Aug 2016: "On my death the Trust is to be directed by whoever drives me last." (whole sentence only if Arthur is found; otherwise only its last three words survive). Arthur Seah met him once, in the back of a car at dusk on the Johor waterfront in 1987: "younger than me and older than he looked; a face you forget while you are looking at it; he signed with his left hand." |
| 11 | 1 Dec 1986, 2:10 AM: Teoh Ah Chuan drowned in his own lorry at the washing ramp of his yard on Sungai Langat; the man who drove for him held the cab door shut under the water while Muthu, his attendant, held the torch on the bank; across the yard he said "Jangan tengok belakang" to Muthu. That is why Muthu never looked in the mirror, and why it is always ten past two. At 3 AM he gave Teoh's brother the watch to hold and took it back: "I will keep the time." His 1986 statement to the police, in the same left-handed hand, with the page bearing his name torn out in 1987. He came to Jugra in 1985 from Kuala Lumpur, and spoke Hokkien to Teoh, Tamil to Muthu, Malay to the police and English to the bank. He named the company after the sun Teoh's daughter painted on the gate. The first official he ever bought was a corporal, for RM 2,000. |
| 12 | A man in a white shirt, about seventy-five, dies in the back of the black car at the Jugra gate on the fifteenth night of the new year: smothered before the fire. He had no larynx (an old, healed laryngectomy) and could not have spoken in Case 7 or Case 8. His left thumb: nine points of sixteen against the 1987 deed. His mitochondrial DNA matches the grey hair from 1 December: him, or his brother, or anyone of his mother's line. He wore the shirt the tailor made in December "for a long journey" ("It fits him the way it would fit the man I measured"). There are two black cars and two keys. The voice is alive on Wednesday. |

---

## §4 Continuity: who is where at the start of each case

"Wronged" people are free unless a later line says otherwise. Season One flags not listed here only colour lines (Shanti, Ravi, Ah Lan, Bobby, Faizal, Kenny, Cheah, Mohan, Ah Fook, Amirul, Wei Jie's grave).

| Person | Start of Case 8 (1 Dec 2026) | Case 9 (24 Dec) | Case 10 (13 Jan 2027) | Case 11 (1 Feb) | Case 12 (20 Feb) |
| --- | --- | --- | --- | --- | --- |
| **Farah** | On duty; tails the car | Medical leave: left knee braced, three ribs, a walking stick | Stick; comes to Singapore "on leave" | Back on duty, no stick | On duty |
| **Daniel** | `FREE7`: Farah's safe house, guarded by her men (Sjn. Asri among them). `REMAND7`: Sungai Buloh, Block C. `HELD7`: Sinar's; hooded in the back seat of the car | Free in every branch (DNAA if `DANIEL_CHARGED`); your partner again, travels with you | Free; stays in KL (no passport he can use) | Free; with you | Free; with you |
| **Bala Anne** | Restoran Bala | same | same | same | same |
| **Sjn. Mohd. Asri** (new) | Farah's sergeant, D9 | same | same | Guards the witness room | Watches Bay V1 for Farah (culprit) |
| **Supt. Khairul** | `KHAIRUL_WRONGED`: suspended (C5 charge dropped). Else: superintendent, D9 | `KHAIRUL_FREE`: as before, hostile. Else: remanded (abetting attempted murder) | same | same | same |
| **Roslan Daud** (new) | The escort, "three lengths behind" | `ROSLAN_FREE`: still the escort, Sinar's courier. Else: remanded | same | same | same |
| **Tan Sri Azhar** | `AZHAR_WRONGED`: remanded for Muthu's murder. Else: Group MD | Free (charge withdrawn, DNAA, 9 Dec). Wronged: off the board. Else: Group MD | same | same | same |
| **Nurul Ain** | `AIN_WRONGED`: remanded. Else: freelance | Free (DNAA 9 Dec), freelance | same | same | same |
| **Dr. Meera** | `MEERA_WRONGED`: remanded. Else: clinic | Free (DNAA 9 Dec); if wronged, suspended by the MMC | same | same | same |
| **Desmond Yap** | `DESMOND_FREE`: dead (Bay V1, Wed 18 Nov). Else: remanded, trial May 2027 | same | same | same | same |
| **Jason Ooi** | `JASON_FREE`: drives for the Office (grey sedan WXY 1408). Else: prison since Case 1 | same | same | same | same |
| **Rizal Hamdan** | `RIZAL_FREE`: resigned, phone off. Else: prison | same | `RIZAL_FREE`: night gate guard at Tuas SecureShred, Singapore | same | same |
| **Zul** | `ZUL_FREE`: security, Sinar Cold Chain Westport. Else: remanded | same | same | same | same |
| **Vivian Chua** | `VIVIAN_FREE`: Singapore. Else: Kajang women's prison | same | same | same | same |
| **Melissa Ong** | `MELISSA_FREE`: Sinar Heritage; the Office's secretary if Vivian is caught. Else: prison | same | same | same | same |
| **Jeffrey Ho** | `JEFFREY_FREE`: retired. Else: remanded | same | same | same | same |
| **Kasun / Kamal / Tony / Shehani / Norhayati** | Free versions keep their Case 4 to 7 lives (Kasun at sea, Kamal in Colombo, Tony at large, Shehani in Singapore, Norhayati still stamping permits) | same | same | same | same |
| **Azman** | `AZMAN_ALIVE`: crane operator, Westport | same | same | same | same |
| **Uncle Wong, Rosli, Hamidah, Ken Lim, Bishnu, Mak Teh** | As in Case 7 | same | same | same | same |
| **Pak Itam** (new) | Watchman at the Jugra yard since 1985 | same | same | Inquest witness | Suspect |
| **Leong Kam Wah** (new) | Tailor, Batu Road | same | same | same | Witness |
| Case 8 suspects | | Murali, Kamarul: if wronged, remanded | | | |
| Case 9 suspects | | | Ram, Jock: if wronged, remanded; Vanessa, Shamsul: if free, at work | | |
| Case 10 suspects | | | | Clarissa, Gary: if free, in Singapore | |
| Case 11 | | | | | Teoh Siew Yang: if `YANG_WRONGED`, remanded (she is not at the gate) |

---

## §5 Recurring cast for Season Two

Use these descriptions for every image prompt and every line, so five writers draw the same people.

| Who | First case | Description (images) | Voice (cinematics) |
| --- | --- | --- | --- |
| **Sjn. Mohd. Asri bin Ghazali**, 38 | 8 | Lean Kelantanese Malay man, close-cropped hair, thin moustache, a navy PDRM windbreaker, a police handheld radio on his belt | Male, soft Kelantan Malay; English for work; slips into dialect ("gapo", "demo") when tired |
| **Roslan Daud** ("Abang Lan"), 49 | 8 | Broad Malay man, grey crew cut, heavy moustache, a sun-faded cap, a driver's grey safari jacket | Male, Perak Malay, clipped ex-army English |
| **Leong Kam Wah**, 81 | 8 | Small, stooped Chinese man in a white singlet and grey trousers, a tape measure round his neck, half-moon glasses | Male, old KL Cantonese; English slow and formal |
| **Pak Itam** (Ibrahim bin Sulong), 74 | 8 | Thin, very dark-skinned Malay man, white stubble, a faded batik shirt and a kain pelekat, rubber flip-flops, a bunch of keys on a string | Male, Kuala Langat coastal Malay; answers in pantun when he does not want to answer |
| **Ramanathan "Ram" Chettiar**, 46 | 9 | Malaysian Tamil man, receding hair, a white veshti with a shirt over it, gold-rimmed glasses, a ring of old iron keys | Male, Melaka Tamil and careful English |
| **ASP Teo Wei Ling**, 44 | 10 | Singaporean Chinese woman, short hair, a grey trouser suit, a lanyard | Female, Singapore English with Singlish and a little Hokkien when off guard |
| **Arthur Seah**, 82 | 10 | Thin Peranakan Chinese man, white hair combed flat, a cardigan over a white shirt, a hearing aid, a walking stick | Male, old-school Singapore English, the occasional Hokkien word |
| **Teoh Siew Yang**, 55 | 11 | Chinese woman with paint on her forearms, cropped grey hair, a sign-painter's apron, a tin of brushes | Female, Penang Hokkien and English |
| **Hamidah Yusof**, Deputy Public Prosecutor | (Case 5) | Malay woman in her fifties, black tudung, wet hair at dawn, a flask of teh, a pencil she never uses | Female, crisp KL Malay and English (new cinematic speaker if she speaks in a panel) |
| Existing: Farah (Malay woman inspector, dark tudung), Daniel (tall Malaysian Indian man in his forties, short beard), Bala Anne (heavyset Malaysian Indian man in his sixties, white moustache, singlet), Rosli (Bomba officer, navy uniform), Uncle Wong (old Chinese lift engineer, grey overalls), Ken Lim (your school friend, phone shop, Low Yat), Nurul Ain (young Malay woman, black tudung, camera), Tan Sri Azhar (68, silver hair, white moustache) | | as in `docs/image_prompts.md` | as cast |

---

## §6 Image style rules (copied from `docs/image_prompts.md`, Case 7)

Every new key goes in a new `## Case N: <Title>` section of `docs/image_prompts.md`, in the same three tables, with a count line ("N new keys: a cinematic, b evidence, c suspects").

- **Aspect ratios.** 16:9 cinematic panels (openings and endings); 4:3 evidence photos; 3:4 suspect portraits. Save as `public/assets/img/<key>.jpg`; until a file exists the game shows a placeholder panel.
- **Keys.** `c8_intro_01_…`, `c8_out_01_…`, `ev_c8_…`, `sus_<id>` (and the same for 9 to 12). Reuse an existing key where the same image already exists (for example `sus_khairul`, `sus_azhar`, `sus_ain`, `intro_03_fire`).
- **Cinematic template:** "Cinematic photorealistic film still, *[scene]*, neo-noir, teal and amber, 35mm film grain, no text". Where signs or papers would be in shot add "no signs, no lettering, no readable words or numbers anywhere".
- **Evidence template:** "Photorealistic forensic evidence photograph with flash, *[scene]*, the key item clearly visible in the center of the frame, gritty documentary realism, no people, no faces, no readable writing, neo-noir, teal and amber, 35mm film grain, no text". For papers add "any writing on the papers is a blurred illegible scrawl, no headings, no printed titles". For car parks and streets add "no signs, no painted numbers or letters".
- **Portrait template:** "Photorealistic police suspect photo, head and shoulders portrait of a *[ethnicity] [man/woman], [age]*, *[hair, face, expression]*, wearing *[clothes]*, plain grey wall background with faint height chart lines, harsh flat flash lighting, documentary realism, no text".
- **Hotspots.** Every evidence entry uses the placeholder `hotspot: HOT()` (`{ x: 0.5, y: 0.5, r: 0.12 }`) until the art exists; set real hotspots once the images are in.
- **The Chairman is never shown:** at most a silhouette, a hand in a white cuff, a cigarette's glow. Season Two adds: a shape behind a driver's seat, out of focus; a long shadow on laterite; a man's back in dark water (1986, Case 11, drawn in pencil only); the dead man of Case 12 only as a covered shape on a steel table, or a hand.
- People are described by ethnicity, age, hair and clothes, never by a famous likeness.

---

## §7 Integration checklist (for whoever wires the five files)

1. `src/data/cases.js`: import `CASE08`…`CASE12`, add to `CASES`, append to `CASE_ORDER` in order. Update `COMING_SOON` to the teaser of the first unwritten case (each case below gives the teaser for the case after it); after Case 12, use the Season Three teaser in Case 12's section.
2. `src/core/music.js`: add `theme_case08`…`theme_case12` to `CUES` (same shape as `theme_case07`, `fallback: 'puzzle'`). Each case gives its music brief.
3. `src/data/voice-overrides.js`: Tamil and Cantonese `say` entries, Malay and Hokkien `lang` labels, as each case lists.
4. `src/data/casebook.js`: `CHOICES` for every new flag (one plain sentence each, in the style there), plus `RECAPS` and `SETUPS`.
5. `functions/api/_lib.js`, `verdictCorrect`: Case 8 Roslan and Khairul, not Murali or Kamarul, exit `bay3`. Case 9 Vanessa and Shamsul, not Ram or Jock, note `xavier`. Case 10 Clarissa and Gary, not Lucas or Rajendran, method `lift`. Case 11 Teoh Ah Kow only, not Ridzuan, Yang or Shamir, night `held`. Case 12 Asri only, not Azhar, Pak Itam or Ain, certificate `unknown`. Also the README paragraph that lists verdicts.
6. `src/data/chairman.js` (the Sinar File): one THREAD per row of §3, unlocked by the level or ending named in each case's "Chairman beats". Add to `PEOPLE` as they are met: Asri, Leong, Pak Itam (Case 8), Ram (9), Arthur Seah and ASP Teo (10), Teoh Siew Yang (11). The `UNKNOWN` question "Why is it always ten past two?" gets `until:` the Case 11 level `c11_16`. Nothing in the file may answer who he is.
7. `npm run voices:manifest`, then directions in `voice-directions.js` for every new voiced line.

---

## Case 8: Ten Past Two (`case08`)

**Header.** `id: 'case08'`, `number: 8`, `title: 'Ten Past Two'`, `place: 'Brickfields to Jugra, Selangor'`, `hints: 8`.
`victim`: "Inspector Farah Iskandar. Pushed into the divider of the Federal Highway at Batu Tiga at 3:12 AM on Tuesday. Alive, in intensive care."
`question`: "Who tried to kill Farah?"
`brief`: "At ten past two you got into the front of a black car with no plates, and a man behind you said don't look back. Three cars behind, Farah followed. At 3:12, on the Federal Highway, somebody put her car into the divider, and the voice behind you said do not stop. You did not stop. Klang wants to know why. So do you."
`mapIntro`: "Every puzzle gives up one exhibit. Two questions wait at the end: who put Farah into the divider, and where the man behind you got out of the car. Nobody will tell you if you get either of them right."
`finalLabel: 'Name them'`.

**Where and when.** Mon 30 Nov 2026, 11:40 PM (opening) to Thu 3 Dec 2026, 6 AM; ending panels to Fri 4 Dec, 2:10 AM. Restoran Bala and Jalan Tun Sambanthan, Brickfields; Leong Brothers Tailor, Jalan Tuanku Abdul Rahman ("Batu Road"); Jalan Ampang under Menara Sinar; the Federal Highway at Batu Tiga, Shah Alam; the gate of Warehouse 6, Pulau Indah; Banting; the old Sinar yard under Bukit Jugra; Hospital Shah Alam; Low Yat Plaza, Bukit Bintang and Jalan Alor; Bengkel Seng Lee, a panel beater on Jalan Sentul; IPD Shah Alam; Bukit Aman.

**Music (`theme_case08`).** Night drive: a slow analogue pulse like an indicator ticking, wipers in six-eight, a bass line that never resolves; once, far under it, a music-box phrase of P. Ramlee's *Getaran Jiwa*.

### Truth (writers only)

- **The drive.** At 2:09 AM a long black saloon with no plates stops outside Restoran Bala, engine running, driver's door open. The back seat is taken: a man sits **directly behind the driver's seat**, where the mirror cannot see him; the rear-view mirror has been angled so it shows only the empty left half. As you sit, a hand in a white cuff rests on your shoulder: "Jangan tengok belakang, detektif." He speaks live, in the voice, until 3:44. Route and stops (rule 3: never more than four minutes; rule 5: nobody gets out on the right):
  - 2:24 to 2:28, **Batu Road**, outside Leong Brothers Tailor: old Mr. Leong at his door in a singlet, a paper parcel. The rear left window goes down; a hand in a white cuff takes the parcel. "Mr. Leong has measured me in the dark since 1986. He has never asked for a light."
  - 2:38, **Jalan Ampang**: the car slows, does not stop, under the black band of Menara Sinar, where a lamp burns on Level 14 (the timer from Case 7, 2:10 to 2:40). "My lamp."
  - **3:12, Federal Highway, Batu Tiga, westbound.** Farah's grey Proton Waja (WQE 8812), three cars behind, is pushed into the concrete divider by a black Toyota Land Cruiser with a bull bar and no front plate. In the side mirror: headlights swerving, sparks. "Do not stop. She will live. That was not mine." You drive on.
  - **3:44 to 3:48, the gate of Warehouse 6, Pulau Indah.** "Open your window. Look at Bay 3. I watched it burn twice." While you look right at the black bay, the rear **left** door opens and closes softly (you take it for something being handed in, as at Batu Road). He crosses to the Land Cruiser, which has pulled up on the left with one headlight broken. On the back seat he leaves an old Nokia on loudspeaker, already on a call to his own phone, and a cigarette burning in the rear ashtray. From here to the end his voice comes from that telephone.
  - 3:52 to 5:40, south by Banting to Jugra. The voice (phone): "Forty years ago tonight I drove this road the other way, in a lorry with no lights." He hums Getaran Jiwa twice.
  - **5:40, the gate with the pink sun, Jugra.** "Thank you, detective. Wait until you hear the door. Then open the boot." Pak Itam, the yard's watchman, told by a call to his hut at 5:30, opens the rear left door, takes the Nokia, closes the door and walks back to his hut. You hear the door and flip-flops on laterite. You look: an empty seat, a cigarette cold in the ashtray.
- **The boot** (the brass-sun key opens it): a grey archive box with a small embossed sun. Inside: a white driver's shirt in your size and a peaked cap; RM 1,986 in old RM 50 notes in an envelope; a rusted lorry number plate, **BCK 210**, with a small sun painted in its corner; and a typed card, THE RULES:
  1. Nothing on the phones. 2. The driver does not look in the mirror. 3. The car does not wait more than four minutes. 4. Never the same road twice in one night. 5. Nobody gets out on the right. 6. The car is washed by hand, never at a garage. 7. Pay in cash, the morning after. 8. Say thank you. 9. At ten past two, the lamp.
  Under the typing, in ink, two words: *Terima kasih.* The ink is dragged along the line by the side of the writing hand: written left-handed.
- **The attack.** **Roslan Daud**, 49, has driven the escort car ("the tail", *ekor*), three lengths behind the black car, since 2003: Sinar Cold Chain fleet car **F-03**, a black Land Cruiser with a bull bar (plate WVT 3022, front plate removed that night). He expected to be the driver when Muthu died ("Forty years Muthu, then me"). On 1 December the Chairman put the detective in Muthu's seat and told Roslan to drive "three lengths behind the inspector". Roslan rammed Farah to make the detective **stop** and break the rules, so the Chairman would throw the detective out of the seat. The detective did not stop. At 3:44 the Chairman got into Roslan's car anyway. Roslan drove him away (to Melaka; only `TAIL_TRACED` players learn that, in Case 9). At 6 AM Roslan put F-03 into Bengkel Seng Lee in Sentul for "a cow at Kapar" and a new bull bar.
- **The location.** **Supt. Khairul Anuar** told Roslan where Farah was. At 2:31, 2:49 and 3:04 AM he requested her phone's live location through the telco's police location portal, under a report number that does not exist ("IPD Dang Wangi report 1401/26, kidnapping"), and phoned each position to the Land Cruiser's prepaid. Khairul has collected his RM 8,000 envelope from Roslan's car since Level 14 was sealed; Farah has been the end of his career for a year. He knew she would tail the car because the BALA line is still tapped: at 11:40 PM Farah, her own phone flat, rang Asri from Bala's wall phone ("Three cars behind, in my Waja"), and the relay sent the call to a recorder in a room above a sari shop across Jalan Tun Sambanthan; at 1:10 AM that recording was played back by a call from Khairul's office line (if `KHAIRUL_WRONGED`, he is suspended: from his house in Bangsar, and he used the portal with Kpl. Faridah Ismail's login, borrowed in October "for overtime claims").
- **Red herring 1: Murali Krishnan**, 52, owner-driver of a red prime mover from Teluk Gadong, Klang, hauling for Sinar Cold Chain among others. At 3:11 he was 200 metres ahead of Farah in the left lane; his trailer's left side has a fresh scrape. He saw the Land Cruiser push her in his mirror and **drove on**, because his licence is suspended and he had driven fifteen hours. *Cleared by:* the paint on Farah's door is black, at bull-bar height (70 to 90 cm), not his trailer's red at 1.2 m, and his scrape carries the yellow paint of the Kapar weighbridge (c8_05); his own dashcam shows the Land Cruiser (c8_17).
- **Red herring 2: Kamarul Zaman bin Hashim**, 39, aide to a deputy minister, the "Encik Kamarul" who lied about the balcony in Case 7, and whom Farah's Case 7 report named as a liar. He drives a black Land Cruiser **Prado**, was on the road at 3 AM, and told Klang he was home in Ampang. *Cleared by:* no bull bar; the Kesas toll at Kota Kemuning at 3:09, seven kilometres away; he lied to hide a night at a karaoke lounge in Klang with a woman who is not his wife (c8_06, c8_19).
- **Not a suspect: Nizam "Jam" Jamaluddin**, 24, e-hailing driver. He stopped at 3:13, pulled Farah out of the car and rang 999 at 3:14, and took her phone, her dashcam and her purse. On Tuesday afternoon he sells the phone on the third floor of Low Yat Plaza, where Ken Lim has his shop (pursuit c8_10).
- **The second question.** Where did he get out of the car? Answer: **the gate of Warehouse 6, Pulau Indah, at 3:44**.

### Suspects

| id | Name | Age | Background | Voice (interrogation / cinematic) | revealedBy |
| --- | --- | --- | --- | --- | --- |
| `murali` | Murali Krishnan | 52 | Owner-driver of a red prime mover, Teluk Gadong, Klang. Hauls reefers for Sinar Cold Chain and anyone else. Licence suspended in October. | Male, Klang Tamil, Malaysian English with "aiyo" and "anne"; `voice_3` | `c8_04` |
| `kamarul` | Kamarul Zaman bin Hashim | 39 | Aide to a deputy minister (the "Encik Kamarul" of Case 7's head table). Black Land Cruiser Prado. | Male, KL Malay, smooth political English; `voice_2` | `c8_06` |
| `khairul` | Supt. Khairul Anuar | 52 | Existing (Case 5). Superintendent, D9, Bukit Aman, or suspended if `KHAIRUL_WRONGED`. On Sinar's payroll since 2019. Reuse `sus_khairul`. | Male; existing speaker "Supt. Khairul Anuar" | `c8_09` |
| `roslan` | Roslan Daud | 49 | Escort driver for the Office of the Chairman since 2003, Sinar Cold Chain fleet car F-03. Ex-Royal Malay Regiment, lance corporal, 1995 to 2002. | Male, Perak Malay, clipped army English; calls the detective "driver"; `voice_2` | `c8_11` |

`revealLine`s: Murali, "His prime mover was two hundred metres ahead of her at 3:11, and it did not stop." Kamarul, "A black Land Cruiser at a Kota Kemuning petrol station at 2:58, and the man from the head table at the wheel." Khairul, "Farah's call from Bala's phone was played back at 1:10 AM, from a line you know." Roslan, "Fleet car F-03 has had one driver for twenty-three years."

### New recurring characters

Sjn. Mohd. Asri (Farah's sergeant; on the phone with her at 3:11; rings you at 5:52 with the news), Leong Kam Wah, Pak Itam, Roslan Daud (see §5). Ken Lim returns (Low Yat). **Writers of Case 8 to 11:** Asri is the Case 12 culprit. Give him nothing suspicious beyond what is written here: he knew at 5:52 that the crashed car was Farah's although her purse and phone had been taken (he says he ran her plate), and her last words before the crash were spoken to him.

### Opening (panels)

1. *Restoran Bala, Brickfields. Monday, 11:40 PM.* `music: 'office'`. Bala Anne will not pull the shutter. "Thambi. Andha car-la ēra vendaam." (Boy. Don't get into that car.) Farah at the counter, her phone dead, borrows Bala's wall phone to ring Asri: "Three cars behind, in my Waja. If he turns, I turn." Branch lines (one each, `when`): `SHANTI_WRONGED`, `RAVI_WRONGED`, `AHFOOK_WRONGED`, `AMIRUL_WRONGED` (as Case 7's opening does); `FREE7`: Daniel rings from the safe house, "Machan. Do not drink anything you did not order. And count his stops." `REMAND7`: a letter from Sungai Buloh in Daniel's hand, folded into a kancil. `HELD7`: nothing from Daniel; the drawer of kancils.
2. *Jalan Tun Sambanthan. 1:50 AM.* Bala Anne pulls the shutter down and does not come out again (keep him off screen after this). The street empty, rain; a grey Waja parked three shops down.
3. *2:09 AM.* The black car, engine running, driver's door open. Shape in the back. `HELD7`: in the mirror, on the left half of the seat, a man with a cloth hood over his head and his hands tied in his lap. You know the shoulders.
4. *2:10 AM.* `music: 'chairman'`. The hand in the white cuff on your shoulder. The Chairman: "Jangan tengok belakang, detektif." (reuse the exact Case 7 line). "Drive. Brickfields Road, then Birch Road. You will not need the mirror." The smell of tobacco and old hair oil.
5. *Batu Road. 2:24 AM.* The tailor at his door; the window down; the parcel; "measured me in the dark since 1986".
6. *Jalan Ampang. 2:38 AM.* The black band; the lamp; "My lamp."
7. *Federal Highway, three cars behind. 3:11 AM.* (A panel without you, as Case 2's flashback does.) Farah, on the phone: `FARAH_LINE`. Headlights with no lights coming up on her left.
8. *3:12 AM.* `music: 'panic'`, `sfx: 'thunder'`. In your side mirror: sparks, a car spinning into the divider. Your foot comes off the pedal. The Chairman: "Do not stop. She will live. That was not mine." You drive on.
9. *Pulau Indah. 3:44 AM.* "Open your window. Look at Bay 3. I watched it burn twice." The black bay; the soft sound of a door behind you, which you take for a parcel.
10. *Banting road. 4:30 AM.* The voice, a little thinner now: "Forty years ago tonight I drove this road the other way, in a lorry with no lights." Humming.
11. *Jugra. 5:40 AM.* The gate with the pink sun. "Thank you, detective. Wait until you hear the door. Then open the boot." The door; flip-flops on laterite; you look: nobody. `HELD7`: Daniel, hood off, wrists cut free: "Machan. You can look now." Then your phone: Asri, 5:52: "Puan Farah. Batu Tiga. The divider. She is alive."
12. Title: `{ title: { kicker: 'Case 8', name: 'Ten Past Two' } }`.

```js
const FARAH_LINE = { who: 'Inspector Farah Iskandar', en: 'Asri. A black four-by-four with no lights is coming up on my left. If anything happens, it was not an accident.' };
```

### Levels

| # | id | game (variant) | Evidence title | Purpose |
| --- | --- | --- | --- | --- |
| 1 | `c8_01` | hiddenobject (list, `scene: 'boot'`) | Nine rules | The boot: the rules card with "Terima kasih." in ink, written left-handed; RM 1,986; the driver's shirt and cap; the plate BCK 210 with a painted sun. *Chairman beat.* |
| 2 | `c8_02` | footprint (classic) | Nobody got out here | Laterite at the rear left door: one pair of rubber flip-flops came from the hut to the door and went back. No leather sole ever stepped out at Jugra. |
| 3 | `c8_03` | searchlight | Cold ash | Rosli's lamps in the yard's lorry shed: one cigarette burnt to the filter, its ash fallen, out for about two hours; a Hacks sweet wrapper; hair oil on the headrest behind the driver, at the height of a man of about 1.70 m sitting straight; one grey hair with no root. |
| c | `c8_dn` | morse (tapcode) — `when: HELD7` | HE IS GONE | Your phone recorded the drive in your breast pocket. At 3:46 Daniel, gagged, tapped on the back of your seat in tap code: HE IS GONE. |
| 4 | `c8_04` | timeline (log) | Pushed, at 3:12 | The night from 2:10 to 3:44 (frames below). A prime mover 200 m ahead that did not stop; a black 4x4 leaving west at 3:13; the highway camera "under maintenance" 3:00 to 3:30. Reveals **Murali**. |
| 5 | `c8_05` | spotdiff | Knee height | Farah's car at the scene (3:40, Bomba photo) and at the police yard (9 AM): dashcam, phone and purse gone; black paint at 70 to 90 cm on the left rear door: a bull bar, not a trailer. |
| 6 | `c8_06` | lineup (single) | A black Prado | The night attendant at a Kota Kemuning petrol station picks the face three times: Encik Kamarul, at 2:58, in a black Land Cruiser Prado, who told Klang he was at home. Reveals **Kamarul**. |
| c | `c8_jx` | lineup (single) — `when: f => f.JASON_FREE` | Three cars behind her | The grey sedan WXY 1408 was behind Farah. Jason picks the face at the Land Cruiser's wheel when its interior light came on (Roslan); and at 3:44, from the Westport road, he saw the black car and a 4x4 side by side at the Warehouse 6 gate. Jason keeps things: a photo of the 4x4's rear window, sticker F-03. |
| 7 | `c8_07` | witness (statement) | Measured in the dark | Leong Kam Wah: three white shirts a year since December 1986, measured by touch in the back of the car with the light off; collar 15½, sleeve 33, right cuff three-quarters of an inch wider "for the watch"; last night's parcel was "a shirt for a long journey"; "Forty years, and I have never seen his face." *Chairman beat.* |
| 8 | `c8_08` | crossword (classic) | A city that is not there any more | Every street he named had changed its name by the early 1980s: Batu Road, Birch Road, Brickfields Road, Mountbatten Road, Treacher Road, Foch Avenue. He learned Kuala Lumpur before then, and never relearned it. *Chairman beat.* |
| 9 | `c8_09` | wiretap | Played back at 1:10 | The BALA relay is still live, rerouted to a recorder in a rented room above a sari shop across the road (a chair facing Bala's window, rent paid in cash "for the Office"). It recorded Farah's 11:40 PM call; at 1:10 AM it was played back by a call from Khairul's line (his house if `KHAIRUL_WRONGED`). Reveals **Khairul**. |
| 10 | `c8_10` | pursuit | A hero with her purse | Ken spots Farah's phone for sale at Low Yat. The seller runs. You catch him: Jam pulled Farah out of the car and rang 999; he also took her phone, dashcam and purse. The dashcam card was wiped at a stall. Ken: "Give me a night." |
| 11 | `c8_11` | tape (splice) | F-03 | Ken carves five fragments off the wiped card; reorder `FARAH_LINE`. The video: a black Land Cruiser with a bull bar, no front plate, its interior light on, a moustached man in a cap with a phone to his ear; on the rear side window a fleet sticker, F-03. Reveals **Roslan**. |
| 12 | `c8_12` | kakuro | A black band, 2 December 1986 | Leong's order book, the figures run in the wet, cross-sums in the margins. First order for "Tuan", 2 Dec 1986: one white shirt, one black mourning band. Paid in cash, the morning after, every time since. *Chairman beat.* |
| 13 | `c8_13` | getaway | The old bull bar | Bengkel Seng Lee, Sentul: F-03 boxed in by wrecks. A new bull bar fitted; the old one in the scrap pile with grey paint from Farah's door in its tubes; the left headlight new. The car's logbook: "Ekor. 2003 to. R. Daud." Out 01:40, in 09:50. |
| 14 | `c8_14` | maze (cameras) | A door at 3:45 | The Warehouse 6 gate: the only approach no camera sees is the service road along the drain, onto the black car's left side. The gate cabin camera caught, reflected in the black car's rear window, one broken headlight at 3:44 and the rear left door opening at 3:45. |
| c | `c8_az` | rotation (3d) — `when: f => f.AZMAN_ALIVE` | Crane 12 | Azman's spreader camera on a Westport crane, mirrored as ever, looks down on the Pulau Indah road: at 3:45 a man in a white shirt walks from a black car to a 4x4 and does not look up. |
| 15 | `c8_15` | dna (mixed) | A man in no file | Swabs from F-03's back seat: Roslan's sweat on the belt, and grey rootless hair. Rootless hair gives only mitochondrial DNA. It matches the hair on the black car's headrest. It is in no database in Malaysia. *Chairman beat.* |
| 16 | `c8_16` | riddles (mixed) | The telephone in the rice tin | Pak Itam answers in pantun ("Pulau Pandan jauh ke tengah…"). Answered, he tells it: a call to his hut at 5:30, "open the door when the car stops, take the telephone, close the door, do not look at the driver". He kept the Nokia in his rice tin. Its log: one incoming call at 3:43, lasting 1 hour 57 minutes. "Forty years I keep the gate. He never gets out at the gate." |
| 17 | `c8_17` | interrogation | What his mirror saw | **Murali** (red herring). Caught in one lie, he gives up his dashcam: at 3:13 the Land Cruiser passes him with its light on, a man in a cap on the phone; at 3:44, queueing for Westport, his camera caught the black car and the 4x4 side by side at the Warehouse 6 gate. |
| 18 | `c8_18` | ledger | Three pings | The telco's location-request ledger for D9, printed weekly for audit; three cells changed on Tuesday. Restored: 2:31, 2:49, 3:04, Farah's number, report 1401/26, login K. ANUAR (or Kpl. F. Ismail's, `KHAIRUL_WRONGED`). There is no report 1401/26. |
| 19 | `c8_19` | whoslying | Two liars, one Land Cruiser | Five statements in the Sinar Cold Chain fleet room: Roslan, Hashim the fleet clerk, Devi the night dispatcher, Wan the mechanic, Kamarul (by phone). Liars: **Roslan** and **Hashim** (paid to write F-03 "in workshop since Saturday"). Kamarul tells the truth now: Kota Kemuning, a karaoke lounge, a woman, a toll at 3:09. |
| 20 | `c8_20` | logicgrid | Everyone at 3:12 | Solution below. |
| 21 | `c8_21` | theory | For the prosecutor | Hamidah Yusof, Bukit Aman, Thursday 4:30 AM. Points below. |
| 22 | `c8_22` | interrogation | Three lengths behind | **Roslan** (culprit). |

Counts: 22 base, 3 conditional. Each game at most twice (`lineup` and `interrogation` twice). Batch D: searchlight, wiretap, pursuit, tape, getaway, ledger, theory, interrogation ×2.

**Clue chain.**
- *Roslan:* F-03 (c8_11) → The old bull bar (c8_12: Farah's paint, the logbook) → A man in no file (c8_15: he carried the passenger) → What his mirror saw (c8_17) → Two liars, one Land Cruiser (c8_19) → interrogation c8_22.
- *Khairul:* Played back at 1:10 (c8_09) → Three pings (c8_18) → Roslan's evidence on solve (three calls with her position) → theory.
- *Murali cleared:* Pushed, at 3:12 puts him ahead of her; Knee height (black paint at bull-bar height, not his red trailer); his own dashcam (c8_17).
- *Kamarul cleared:* A black Prado → Knee height (no bull bar) → c8_19 (Kota Kemuning toll at 3:09).
- *Exit at Warehouse 6:* Nobody got out here (c8_02), Cold ash (c8_03, out two hours before Jugra), A door at 3:45 (c8_14), A man in no file (c8_15, his hair in the 4x4), The telephone in the rice tin (c8_16, a call from 3:43 to the end), What his mirror saw (c8_17); conditionals c8_dn, c8_jx, c8_az. Decoys answered: at Batu Road only a hand came out of the window; at Jalan Ampang the car never stopped (c8_04 frame c); at Jugra only flip-flops came to the door (c8_02).

### Key parameters

- **c8_04 timeline frames** (order a to h): a `02:1▮` Restoran Bala: the black car pulls away; a grey Waja pulls out three cars behind. b `02:31` Telco portal: location request, Farah's number, report 1401/26. c `02:3▮` Jalan Ampang: the black car slows under the black band; a lamp on Level 14. d `03:04` Telco portal: third request. e `03:1▮` Murali's prime mover GPS: Federal Highway, Batu Tiga, 88 km/h, 200 m ahead. f `03:12` Farah's phone stops moving, at the divider. g `03:14` 999: "A car in the divider. A black jeep drove off, west." h `03:4▮` Warehouse 6 gate camera: the black car stops; a 4x4 with one headlight comes alongside.
- **c8_10 pursuit:** `setting: 'city'`, `route: ['city', 'market', 'rooftop', 'city']`, `legs: 4`, `skyline: 'kl'`, `vehicle: 'foot'`, `difficulty: 'medium'`, `suspect: 'Jam'`. Beats: out of Low Yat into Bukit Bintang; through Jalan Alor's woks and plastic stools; up a fire stair and across the Pudu shophouse roofs, KL Tower ahead; down into the back lanes of Jalan Pudu.
- **c8_11 tape:** `variant: 'splice'`, `line: FARAH_LINE`, `pieces: 5`, `label: 'DASHCAM · WQE 8812 · RECOVERED'`.
- **c8_16 riddles:** `riddles: 4, situations: 2`. Pak Itam's opening pantun may be the traditional "Pulau Pandan jauh ke tengah, Gunung Daik bercabang tiga; hancur badan dikandung tanah, budi yang baik dikenang juga."
- **c8_19 whoslying:** liars `['roslan', 'hashim']`; give Devi a `fact` statement ("F-03 left the yard at 1:40", the gate log) and Kamarul a `fact` ("I paid the Kota Kemuning toll at 3:09", his card).
- **c8_20 logicgrid.** Person: Roslan, Khairul, Murali, Kamarul, You. Location: Batu Tiga, beside Farah's car / Bangsar, at home / 200 m ahead, left lane / Kota Kemuning toll / three cars ahead of Farah. Holding: prepaid phone / laptop / logbook / toll card / a key with a brass sun. Solution: Roslan, beside Farah, prepaid; Khairul, Bangsar, laptop; Murali, 200 m ahead, logbook; Kamarul, Kota Kemuning, toll card; You, three cars ahead, the key.
- **c8_21 theory**, `need: 3`. Points: `push` Roslan Daud pushed Farah's car into the divider with the Land Cruiser F-03 (its bull bar). `where` Khairul told him where she was (location requests under a false report, phone calls to the 4x4, or the tapped call). `why` To make the detective stop and break the rules, so Roslan, not the detective, would be the driver (jealousy over Muthu's seat). `paid` Khairul is on Sinar's payroll / collects an envelope from the escort car.
- **c8_17 Murali** (`voice_3`). Lies: "I was already at the depot in Klang by three" (exposed by *Pushed, at 3:12*); "That scrape is from the divider" (by *Knee height*); "My licence is in order" (by *Pushed, at 3:12*, whose evidence text must mention the JPJ record: suspended since October). Secret: he saw it in his mirror, drove on because of the licence and fifteen hours at the wheel, and hid the dashcam card in his thermos bag.
- **c8_22 Roslan** (`voice_2`). Persona: ex-army, short sentences, calls the detective "driver" with contempt and Farah "Inspector"; touches his moustache when cornered. Lies: "F-03 never left the yard on Monday night" (exposed by *Two liars, one Land Cruiser* or *The old bull bar*); "I hit a cow at Kapar on Sunday" (by *The old bull bar*); "Nobody tells me where anybody is. I drive behind the car" (by *Three pings*); "Tuan was in the car the whole night; I never came near it" (by *A door at 3:45* or *A man in no file*). Secret: he rammed Farah to make the detective stop; Khairul phoned him her position three times; at 3:44 the Tuan got into his car anyway. Evidence on solve, "Three lengths behind": he will not say where he drove the Tuan ("Rule four, driver"), but he says one true thing: "Twenty-three years three lengths behind him, and I never saw his face. Some nights there are two in the back. I have never known which one is him."

### Deduction

`lede`: "Hamidah Yusof will charge whoever you name with the attempted murder of a police officer, on your word, while Farah is still in intensive care. Name everyone who did it or made it possible, and only them." Button "Tell Hamidah".

Extra question `exit`: "Where did he get out of the car?" short "He got out at". `lede`: "Hamidah can ask a magistrate for one set of records: one place, one minute. Whichever you choose, the Office of the Chairman will know by lunch." Options:

| id | label | note |
| --- | --- | --- |
| `tailor` | Batu Road, outside Leong Brothers Tailor, 2:24 AM | The window went down and a hand took a parcel. |
| `ampang` | Jalan Ampang, under the black band, 2:38 AM | The car slowed under his lamp. |
| `bay3` | The gate of Warehouse 6, Pulau Indah, 3:44 AM | He told you to look at Bay 3. |
| `jugra` | The gate with the pink sun, Jugra, 5:40 AM | You heard the door. |

`outcomes.correct: ['roslan', 'khairul']`. Charged lines: Roslan "is arrested at Bengkel Seng Lee with grease to the elbows. He asks whether the Tuan has a new escort yet." Khairul "is arrested at (Bukit Aman / his house in Bangsar, `KHAIRUL_WRONGED`) by officers he trained. He asks whether Farah is awake, and does not seem to know which answer he wants." Murali "is charged; his prime mover is impounded and his wife sells their thosai stall's second tawa to pay the lawyer." Kamarul "is charged; the deputy minister's office says it has never heard of him."

### Flags

- **Reads:** `HELD7`/`FREE7`/`REMAND7` (from `DANIEL_TAKEN`, `DANIEL_FOUND`, `DANIEL_CHARGED`, `ARCHIVE_SEIZED`); `JASON_FREE` (c8_jx, ending); `AZMAN_ALIVE` (c8_az); `KHAIRUL_WRONGED` (login and location variants); `ZUL_FREE`, `VIVIAN_FREE`, `MELISSA_FREE` (ending); `AZHAR_WRONGED`, `AIN_WRONGED`, `MEERA_WRONGED`, `DESMOND_FREE` (ending); `SHANTI_WRONGED`, `RAVI_WRONGED`, `AHFOOK_WRONGED`, `AMIRUL_WRONGED`, `BOBBY_FREE` (opening and Ken's lines); `VOICE_TRACED` (one line in the car, below).
- **Sets:** `flagNames: ['ROSLAN_FREE', 'KHAIRUL_FREE', 'MURALI_WRONGED', 'KAMARUL_WRONGED', 'TAIL_TRACED', 'TAIL_LOST']`; `ROSLAN_FREE: !charged.includes('roslan')`, `KHAIRUL_FREE: !charged.includes('khairul')`, `MURALI_WRONGED: charged.includes('murali')`, `KAMARUL_WRONGED: charged.includes('kamarul')`, `TAIL_TRACED: answers.exit === 'bay3'`, `TAIL_LOST: answers.exit !== 'bay3'`.
- Optional line in panel 6 (`when: f => f.VOICE_TRACED`): "Your prosecutor wrote my telephone number on a charge sheet. I have had it framed."

### Ending (panels)

1. *Bukit Aman. Thursday, 5:00 AM.* `resolution`. One line per charged suspect.
2. *Hospital Shah Alam. Wednesday.* Farah awake, a brace on her knee, three ribs taped. Line by verdict: right (both culprits, nobody wronged): "You did not stop. Good. If you had stopped, you would be his." Khairul missed: "Khairul sent flowers. I gave them to the nurse with the worst cough." Wronged: "You charged a man for what he saw in his mirror. Go and find what he did not see." `ZUL_FREE`: a card on the flowers, no name: "Left shoulder, Inspector." Asri at the door with teh, as every day.
3. *The magistrates' court, Jalan Duta. Wednesday 9 December.* (only if any of `AZHAR_WRONGED`, `AIN_WRONGED`, `MEERA_WRONGED`) Hamidah withdraws the Case 7 murder charges as a discharge not amounting to acquittal: one line for each wronged person (Azhar leaves by the side door; Ain asks the press to photograph her; Meera's suspension by the Medical Council stays).
4. Daniel. `HELD7` and not `DANIEL_CHARGED`: Farah's safe house, Daniel asleep in his clothes with the lights on. `HELD7` and `DANIEL_CHARGED`: the warrant is still open; Farah's men take him to Sungai Buloh with her jacket over his wrists. `FREE7`: the safe house; he makes you count the stops again. `REMAND7`: Sungai Buloh, visiting room 4. Last line in every branch where `DANIEL_CHARGED`: "Hamidah has applied to withdraw the charge. The hearing is on the twenty-second."
5. The tail. `TAIL_TRACED`: Hamidah's records for the gate at 3:44 lead to F-03's toll card: Pulau Indah, the Kesas, the ELITE, the North-South Expressway south; **Ayer Keroh, Melaka, 5:28 AM**. Nobody knows why Melaka. `TAIL_LOST`: the records come back empty; Pak Itam's hut is padlocked; the plate BCK 210 hangs on your office wall.
6. *Brickfields. Friday, 2:10 AM.* `chairman`. Bala Anne's wall phone. Nobody else is downstairs; Bala's shutter is down. The Chairman: "You did not stop. Muthu would not have stopped either. Thank you, detective." A lid, open and shut. "Keep the plate."

### Chairman beats (exactly this, nothing more)

He rode behind the driver's seat from 2:10 to 3:44 and left at the Warehouse 6 gate (the exhibits prove it; the answer only records whether you said so). The nine rules and "Terima kasih", left-handed (c8_01). Old street names (c8_08). Getaran Jiwa (opening). Leong: measured in the dark since 1986, collar 15½, right cuff wider for a watch, first order 2 Dec 1986 with a black mourning band (c8_07, c8_12). One grey rootless hair, mitochondrial DNA only, in no file, in both cars (c8_15). "Some nights there are two in the back" (c8_22). "That was not mine." "Forty years ago tonight I drove this road the other way, in a lorry with no lights." The plate BCK 210. **Sinar File threads:** *Nine rules* (c8_01), *Measured in the dark* (c8_07), *A man in no file* (c8_15), *Two in the back* (c8_22), *Keep the plate* (ending). New unknown: "Why did he keep a lorry's number plate for forty years?"

### Hook and teaser

The plate BCK 210 goes to JPJ: registered in 1984 to **Teoh Ah Chuan** of Jugra; transferred on 3 Dec 1986 to Sinar Pengangkutan; a lien recorded the same week to "Sp.M.R.M. Chettiar, Melaka". On 22 Dec Hamidah applies for an order to open whatever Sinar Pengangkutan keeps with that firm. The hearing is set for 28 Dec.

`COMING_SOON` for Case 9: "On Christmas Eve, while the Portuguese Settlement lets off its fireworks over the Straits, somebody will open one iron box in a Chettiar strongroom on the Melaka river and leave the gold behind. The box was rented in December 1987, for fifty years, by a man who signed with his thumb. Daniel is coming with you. He says he would like to see a box that has waited longer than he did."

### New speakers

Sjn. Asri (m, 38, Kelantan Malay), Leong Kam Wah (m, 81, Cantonese), Pak Itam (m, 74, Kuala Langat Malay), Roslan Daud (m, 49, Perak Malay) if he speaks in a panel, Hamidah Yusof (f, 50s) if she speaks. Existing: The Chairman, Farah, Bala Anne, Daniel Raj, Ken Lim, Fire Officer Rosli. Voice overrides: Bala's Tamil line; any Cantonese line of Leong's (e.g. "Sei sap nin, ngo mou gin gwo keoi go min." 四十年，我冇見過佢個面。).

---

## Case 9: Box 14 (`case09`)

**Header.** `id: 'case09'`, `number: 9`, `title: 'Box 14'`, `place: 'Melaka'`, `hints: 8`.
`victim`: "The iron room of Sp.M.R.M. Muthiah Chettiar & Co., Melaka (1912). Box 14 emptied on Christmas Eve; the other forty-one boxes, and their gold, left untouched."
`question`: "Who emptied Box 14?"
`brief`: "Box 14 was rented in December 1987 by a lorry company from Jugra, for fifty years, paid in advance. On the twenty-second Hamidah asked a court to open it. On Christmas Eve, while the whole of Melaka watched the fireworks, somebody opened it first, by drilling one lock in a room full of gold, and took nothing else."
`mapIntro`: "Every puzzle gives up one exhibit. Two questions wait at the end: who emptied Box 14, and where the one thing they kept back is now. Nobody will tell you if you get either of them right."
`finalLabel: 'Name them'`.

**Where and when.** Thu 24 Dec 2026 (heist 11:50 PM to 12:20 AM) to Mon 28 Dec 2026; ending panel Fri 1 Jan 2027, 2:10 AM. The Kittangi, a Sinar Heritage hotel in the old Chettiar firm house on Jalan Kampung Pantai, backing onto the Melaka river; the iron room inside it; Jalan Tukang Emas (Harmony Street: the Sri Poyyatha Vinayagar Moorthi temple, Kampung Kling mosque, Cheng Hoon Teng); the river cruise jetty and Kampung Morten; the Portuguese Settlement (Christmas lights, fireworks over the Straits); St. Paul's Hill and the ruined church; Bukit China; Melaka Sentral bus terminal; Mahkota Medical Centre; IPD Melaka Tengah.

**Music (`theme_case09`).** Christmas Eve heist: an upright bass and brushed snare at walking pace, a far-off brass band playing a carol slightly out of tune, temple bells and river water underneath.

### Truth (writers only)

- **The firm and the box.** Sp.M.R.M. Muthiah Chettiar & Co. lent money from this house from 1912 to 1994. Its iron room (*petti arai*): forty-two deposit boxes set into the wall behind a 1938 iron door. Sinar Heritage Hotels bought the building in 2024 and made it The Kittangi; Muthiah Chettiar's will kept the iron room out of the sale until every renter has claimed or died. Keeper: his grandson **Ramanathan "Ram" Chettiar**, 46. Since 2024 the room's alarm runs through the hotel's panel.
- **The loan** (Muthiah's ledger, in Tamil): 2 Dec 1986, RM 18,000 to "Sinar Pengangkutan, Jugra, the bearer", against a Bedford lorry BCK 210 (registration card deposited), 2% a month, guarantor M. Perumal (right thumb). Repaid 1 Dec 1987, to the day. The same day Box 14 was rented for fifty years, paid in advance in cash. Muthiah's remark in the margin: "நல்ல மனுஷன் இல்லை. ஆனால் கடனைத் திருப்பித் தருவான்." (Not a good man. But he will repay.) The iron room's visitor book: every 1 December from 1987 to 2025, Box 14 opened for four minutes, signed "M.P."; on 1 Dec 2026, no signature, only a small sun drawn in ink.
- **Box 14 held:** Teoh Ah Chuan's Seiko watch, stopped at 2:10, Langat mud in the crown, engraved on the back TEOH A.C. 1979; the registration card of BCK 210 (owner Teoh Ah Chuan; transferred 3 Dec 1986 to Sinar Pengangkutan); a 1986 photograph of the Jugra yard gate with a sun freshly painted on it, a girl of about fifteen holding a brush, and across the laterite in the foreground the long afternoon shadow of the photographer, a slim man in a cap holding a camera at his chest; and the **cancelled promissory note** with two thumbprints: Muthu's right thumb as guarantor, the borrower's left thumb.
- **The leak.** Ram, who owes RM 400,000 of his late father's debts, agreed in November to sell the iron room's rights to Sinar Heritage for RM 3 million "with vacant possession by 31 December". On 22 Dec he told the hotel's general manager that a court would open Box 14 on the 28th.
- **The inside woman: Vanessa Low**, 38, general manager of The Kittangi. On the Office of the Chairman's printed instruction she: in October borrowed Ram's iron-room key "for the insurer's inspection" and had a copy cut by Jock Sequeira; at **23:50** on Christmas Eve bypassed the iron room's zone on the hotel panel with her own user code, 07, "because the fireworks set off the vibration sensors"; unlocked the river-steps gate; at 1:30 drove the hotel van to Kampung Morten with RM 30,000 in an envelope marked "S."; shredded the instruction on Christmas morning.
- **The crew: Shamsul Bakri**, 33, night pilot of the Melaka river cruise, from Kampung Morten. At 23:52 he took cruise boat 7 from the jetty with two hired men from Kuala Lumpur (never named, never found), radioed the hotel's river-steps handheld at 23:56 ("Tujuh, sampai."), and from **23:58 to 00:09**, under the midnight fireworks, the men opened the iron door with Jock's key and drilled Box 14's lock. The thieves' copy key snapped in the iron door on the way out. Back at Kampung Morten by 00:20. At **2:10 AM** at Melaka Sentral, bay 9, he handed a dry bag to a Sinar courier (a man in a cap; if `ROSLAN_FREE`, Roslan, with F-03). Before that he photographed everything with his phone, and **kept back the promissory note**. At 3:05 AM he climbed St. Paul's Hill with the carollers' candles still burning and taped the note, in a plastic sleeve, under the rim of the iron grille over the **empty grave of St. Francis Xavier** in the ruined church. At 3:20 he rang Nurul Ain's old newsroom voicemail to sell "a paper with two thumbprints" for RM 50,000.
- **Red herring 1: Ram Chettiar.** Debts, Sinar's offer, the only legitimate key, and he lied that Sinar never asked him to give up the room. *Cleared by:* from 23:30 to 01:15 he was at Mahkota Medical Centre with his mother (heart); his key never left his ring; his leak was greed, not theft (c9_09, c9_11).
- **Red herring 2: Joaquim "Jock" Sequeira**, 66, Kristang locksmith from the Portuguese Settlement, who has cut keys for the old houses for forty years and files a tiny notch into every key he cuts. The snapped key is his. *Cleared by:* his receipt book, 14 Oct, "Kittangi, spare, iron room, insurance. V. Low. RM 80"; at midnight he was at the Settlement's Christmas Eve mass and the dancing after it, in a hundred photographs (c9_10).
- **The second question.** Where is the promissory note now? Answer: **St. Paul's Hill, in the empty grave of St. Francis Xavier**.

### Suspects

| id | Name | Age | Background | Voice | revealedBy |
| --- | --- | --- | --- | --- | --- |
| `jock` | Joaquim "Jock" Sequeira | 66 | Kristang locksmith, Portuguese Settlement (Ujong Pasir). Cuts keys for every old house in Melaka; files a notch in each. | Male, Melaka English and Malay; never voiced in Kristang; `voice_3` | `c9_02` |
| `ram` | Ramanathan "Ram" Chettiar | 46 | Keeper of the iron room, grandson of Muthiah Chettiar. Debts; agreed to sell to Sinar Heritage. | Male, Melaka Tamil and careful English; `voice_2` | `c9_03` |
| `vanessa` | Vanessa Low Pei Shan | 38 | General manager, The Kittangi (Sinar Heritage Hotels). | Female, KL Cantonese-English, very correct, "aiyah" only when angry; `voice_4` | `c9_06` |
| `shamsul` | Shamsul Bakri | 33 | Night pilot, Melaka river cruise, Kampung Morten. Owes money to a Jonker Street tontine. | Male, Melaka Malay, quick, jokes when afraid; `voice_3` | `c9_08` |

`revealLine`s: Jock, "The key snapped in the iron door has a little notch filed into its bow. Only one man in Melaka files that notch." Ram, "He agreed to give up the iron room by the thirty-first, for three million. Box 14 was the last thing in it." Vanessa, "User 07 switched the iron room off at ten to midnight." Shamsul, "Boat seven moved in the night. Its pilot lives two houses from the jetty."

### Opening (panels)

1. *Brickfields. Christmas morning, 7:05 AM.* `office`. Hamidah on Bala's phone: "Box 14 is empty. They drilled one lock in a room full of gold." Daniel (free in every branch; `WAS_HELD`: he sleeps with the light on now; `DNAA`: "They can bring the charge back any morning they like") is already at your door with two teh.
2. *North-South Expressway, 9:00 AM.* Daniel folds a kancil from the toll receipt. Farah, braced and on a stick, in the back seat: "I am on medical leave. I am not here." `TAIL_TRACED`: "Ayer Keroh, 5:28 AM, on the first. Now we know why Melaka." Branch line `KHAIRUL_FREE` and not `KHAIRUL_WRONGED`: Khairul has told Melaka Tengah the Kuala Lumpur detective has no standing.
3. *Jalan Kampung Pantai.* The Kittangi: whitewash, brass lamps, a Christmas tree in the courtyard of a Chettiar house. Vanessa Low greets you by name. `SECRETARY === 'melissa'`: "Puan Melissa sends her regards." `VIVIAN_FREE`: a card in copperplate from Singapore on the reception desk.
4. *The iron room.* Ram at the door in a veshti, a ring of old keys. The room: forty-two iron doors in the wall, forty-one shut, one open, its lock drilled out; gold chains visible through the slots of the next box. Ram: "Thaathaa sonnaar: mugatha paakkaadhe, saaviya paaru." (Grandfather said: don't look at the face, look at the key.)
5. *Harmony Street, noon.* Temple bells, the mosque, joss smoke from Cheng Hoon Teng, all in one street. Daniel: "Machan. He kept a box for forty years, in a street where every god in Melaka lives next door."
6. Title `{ kicker: 'Case 9', name: 'Box 14' }`.

### Levels

| # | id | game (variant) | Evidence title | Purpose |
| --- | --- | --- | --- | --- |
| 1 | `c9_01` | wordsearch (secret) | They left the gold | Ram's inventory of the forty-two boxes. Hidden message: ONLY FOURTEEN OPENED. The iron door unforced; one lock drilled; gold in 13 and 15 untouched. |
| 2 | `c9_02` | rotation (2d) | The notch | Compare the snapped key with the bows on Jock's board, turned and reflected: the copy is Jock's, by his notch. Reveals **Jock**. |
| 3 | `c9_03` | ledger | Vacant by the thirty-first | Ram's family accounts and Sinar Heritage's offer; two cells changed. Restored: RM 400,000 owed; RM 3 million "with vacant possession of the iron room by 31 December". Reveals **Ram**. |
| 4 | `c9_04` | kakuro | Not a good man | Muthiah Chettiar's 1986 ledger, cross-sums in Tamil numerals. The loan of 2 Dec 1986, the guarantor M. Perumal, repaid 1 Dec 1987 to the day; Box 14 rented that day for fifty years; the margin note. *Chairman beat.* |
| c | `c9_tl` | safecracker — `when: f => f.TAIL_TRACED` | Four minutes | Ram's private log in a drawer with a four-digit lock (the firm's year, 1912: `repeats: true`, `contains: [9, 2]`). On Tue 1 Dec at 6:10 AM Ram opened the iron room for "the bearer of Box 14": an old man with an umbrella, a white cuff. Ram looked at the key, not the face. Four minutes. A black Land Cruiser waited in the lane. |
| 5 | `c9_05` | fusebox | Zone fourteen | The hotel's alarm panel, tripped by the fireworks. Back on, its memory: iron room bypassed 23:50:12, restored 00:31:40. The user field is corrupted. |
| 6 | `c9_06` | tape (spectro) | USER-07 | The alarm company's recording of the panel's phone line at 23:50: under the hiss, the panel's report burst, drawn in the spectrogram: USER-07. Code 07 is Vanessa Low's. Reveals **Vanessa**. |
| 7 | `c9_07` | maze (cameras) | The river steps | The only way into the iron room no hotel camera sees is from the river steps through the old godown passage. River mud on the passage tiles; the river gate's padlock opened with its key, not cut. |
| 8 | `c9_08` | spotdiff | Boat seven | The cruise jetty's camera at 11:30 PM and at 6 AM: boat 7 moved, fenders wet, a scrape of the hotel's white river-step paint on its bow. Night pilot: Shamsul Bakri. Reveals **Shamsul**. |
| 9 | `c9_09` | interrogation | He told her the date | **Ram** (red herring). |
| 10 | `c9_10` | witness (statement) | A spare for the insurer | Jock, in his workshop in the Settlement, Christmas lights still on. October: the hotel GM brought the iron-room key "for the insurer" and paid cash; midnight: mass and the dancing after it. Receipt: 14 Oct, "V. Low. RM 80". |
| 11 | `c9_11` | timeline (cctv) | Under the fireworks | Frames below. |
| 12 | `c9_12` | hiddenobject (list, `scene: 'desk'`) | An insurer that does not exist | Vanessa's office: a letter from an insurer with no address, Jock's receipt, a second phone, a Christmas card from the Office of the Chairman with no name. |
| 13 | `c9_13` | shredder | Box 14 only | Vanessa's shredded instruction (text below). |
| 14 | `c9_14` | getaway | Iron filings | The hotel van boxed in by Christmas guests in the basement. Inside: a cordless drill with a core bit full of iron filings, and an empty envelope marked "S." with a bank band for RM 30,000. Its log: out 01:30, in 02:20. |
| 15 | `c9_15` | lineup (single) | He kept one sleeve | The night ticket clerk at Melaka Sentral picks Shamsul: bay 9, 2:10 AM, a dry bag handed to a man in a cap; Shamsul kept one plastic sleeve inside his jacket. |
| c | `c9_rs` | chase (one-way) — `when: f => f.ROSLAN_FREE` | The courier | Melaka's one-way old town, a black Land Cruiser with a new bull bar: F-03. You lose him at Ayer Keroh, but not before the clerk at the toll photographs Roslan at the wheel at 2:41. |
| 16 | `c9_16` | nonogram | What he photographed | Shamsul's phone, a corrupted thumbnail rebuilt: the watch at 2:10 (TEOH A.C. 1979), the registration card of BCK 210, the 1986 photograph of the gate with the girl and the photographer's shadow, the note with two thumbs. *Chairman beat.* |
| 17 | `c9_17` | dialtone | A paper with two thumbs | Ain's newsroom voicemail, 3:20 AM Christmas morning: a man offers "a paper with two thumbprints, from box fourteen" for RM 50,000, then keys his callback number. The tones: Shamsul's prepaid, 013-627 1486. He kept it, and he did not throw it away. |
| 18 | `c9_18` | footprint (classic) | Wax, not ash | Shamsul's sandals: red laterite and white candle wax in the tread. Bukit China's paths are red too, but its graves take joss sticks; after midnight mass the carollers climb St. Paul's Hill with candles. |
| c | `c9_ar` | iqmatrix — `when: f => f.ARCHIVE_SEIZED` | No river patrol | Carton M of the Jugra archive, at Bukit Aman: the Melaka Tengah marine sergeant on a monthly figure since 2020. On Christmas Eve the river patrol boat was "in for repairs". |
| 19 | `c9_19` | whoslying | Five on Christmas Day | Statements at IPD Melaka Tengah: Vanessa, Shamsul, Ram, Jock, the hotel's night porter Kumar. Liars: **Vanessa** and **Shamsul**. Ram's `fact`: "I was at Mahkota with my mother from half past eleven" (hospital camera). |
| 20 | `c9_20` | logicgrid | Everyone at midnight | Solution below. |
| 21 | `c9_21` | theory | For the prosecutor | Hamidah, by phone and fax, at IPD Melaka Tengah. Points below. |
| 22 | `c9_22` | interrogation | Leave the gold | **Vanessa** (culprit). |

Counts: 22 base, 3 conditional; each game at most twice (`interrogation` twice). Batch D: ledger, fusebox, tape, shredder, getaway, dialtone, theory, interrogation ×2. No pursuit in this case.

**Clue chain.**
- *Vanessa:* Zone fourteen (c9_05) → USER-07 (c9_06) → He told her the date (c9_09) → A spare for the insurer (c9_10) → An insurer that does not exist (c9_12) → Box 14 only (c9_13) → Iron filings (c9_14) → c9_19 → c9_22.
- *Shamsul:* The river steps (c9_07) → Boat seven (c9_08) → Under the fireworks (c9_11) → the envelope marked "S." (c9_14) → He kept one sleeve (c9_15) → What he photographed (c9_16) → A paper with two thumbs (c9_17) → Wax, not ash (c9_18).
- *Ram cleared:* the Mahkota frame (c9_11 b), his `fact` in c9_19; his crime was the leak (c9_09).
- *Jock cleared:* the October receipt and the Settlement's photographs (c9_10).
- *The note:* not at Melaka Sentral (he kept one sleeve, c9_15); not in the river (he was still selling it at 3:20, c9_17); not on Bukit China (candle wax, not joss ash, c9_18); the hill with candles after midnight mass is St. Paul's, and its open grave has an iron grille.

### Key parameters

- **c9_06 tape:** `variant: 'spectro'`, `answer: 'USER-07'`, `noise: 0.6`, `decoys: 2`, `label: 'ALARM LINE · KITTANGI · 24 DEC 23:50'`, clue: "A panel that changes state reports it down the phone line, under the noise. Look at the sound."
- **c9_11 timeline frames** (a to h): a `23:30` Cruise jetty: the last cruise ties up; boat 7 dark. b `23:3▮` Mahkota Medical Centre: Ram signs in at A&E with his mother. c `23:50` Hotel panel: zone 14 bypassed. d `23:52` Jetty camera: boat 7 slips out with no lights, three aboard. e `23:56` Hotel river-steps handheld: "Tujuh, sampai." f `00:0▮` Settlement fireworks; the hotel's courtyard countdown. g `00:2▮` Jetty camera: boat 7 back; one man walks up toward Kampung Morten. h `02:1▮` Melaka Sentral, bay 9: a man with a dry bag.
- **c9_13 shredder:** title `SINAR HOLDINGS BERHAD`, text: "OFFICE OF THE CHAIRMAN\n\nTo: V.L.\nChristmas Eve\n\nBox 14 only.\nLeave the gold.\n\nThe river at midnight.\nMelaka Sentral at ten past two.\n\nNothing on the phones.", `strips: 10`, `flips: true`, `stamp: 'PRIVATE'`. (Pairs: "Box 14 only. Leave the gold.")
- **c9_17 dialtone:** `number: '0136271486'`, `noise: 0.25`.
- **c9_20 logicgrid.** Person: Vanessa, Shamsul, Ram, Jock, Kumar (the night porter). Location: hotel lobby, by the alarm panel / the river steps / Mahkota Medical Centre / the Portuguese Settlement / the courtyard countdown. Holding: user card 07 / a drill / his mother's handbag / a rosary / a sparkler. Solution: Vanessa, panel, card; Shamsul, river steps, drill; Ram, Mahkota, handbag; Jock, Settlement, rosary; Kumar, courtyard, sparkler.
- **c9_21 theory**, `need: 3`. `inside` Vanessa Low (the general manager) switched off the iron room's alarm / opened the river gate / had the key copied. `crew` Shamsul Bakri brought the thieves by river cruise boat 7 and drilled Box 14. `why` To empty Box 14 before the court opened it on the 28th, on the Office of the Chairman's orders (leave the gold). `kept` Shamsul kept the promissory note back and tried to sell it.
- **c9_09 Ram** (`voice_2`). Persona: courteous, precise, keys always in his hand; Tamil when emotional ("Ayyo"); ashamed of the debts. Lies: "Sinar never asked me to give up the room" (by *Vacant by the thirty-first*); "Nobody else has ever had a key" (by *The notch*); "I told nobody about the court" (by *Vacant by the thirty-first*, whose restored cells must include an advance of RM 50,000 from Sinar Heritage on 22 Dec, the day the hearing date was fixed). Secret: he told Vanessa the date for the money; he was at the hospital. Evidence on solve: *He told her the date*: and Ram adds, from memory, that Box 14 has been opened once a year, every 1 December, for four minutes, by a man who signed "M.P."; and that the iron room's visitor book went missing from its shelf in December. *Chairman beat.*
- **c9_22 Vanessa** (`voice_4`). Lies: "The iron room's alarm was never touched" (by *USER-07*); "I have never had a key to that room" (by *A spare for the insurer*); "Nobody from Sinar told me anything about Box 14" (by *Box 14 only*); "The van never left the basement" (by *Iron filings*). Secret: she did it for the general managership of Sinar Heritage Singapore; the instruction came printed, in the Christmas hamper. Evidence on solve: *Leave the gold*: she has never met anybody above her secretary's signature, and the Office asked one more thing: to burn the iron room's visitor book. She did not. It is in her car: "M.P." on every 1 December from 1987 to 2025, four minutes each, and for 2026 no signature, only a small sun drawn in ink. *Chairman beat.*

### Deduction

`lede`: "Melaka Tengah will charge whoever you name with the burglary of Box 14, on your word and Hamidah's fax. Name everyone who planned it or did it, and only them."
Extra question `note`: "Where is the promissory note?" short "The note is". `lede`: "One paper from Box 14 never reached the courier: the note with two thumbprints. Melaka Tengah can search one place, once, today. Sinar will hear where by evening." Options:

| id | label | note |
| --- | --- | --- |
| `sentral` | Melaka Sentral: it went with the rest | Bay 9, 2:10 AM, a dry bag and a man in a cap. |
| `xavier` | St. Paul's Hill, in the empty grave of St. Francis Xavier | The ruined church on the hill, an iron grille over an open grave. |
| `bukitcina` | Bukit China, in the urn of an old grave | Twelve thousand graves on a hill of red earth. |
| `river` | The bottom of the Melaka river | Thrown off boat seven on the way home. |

`outcomes.correct: ['vanessa', 'shamsul']`. Charged lines: Vanessa "is arrested in the courtyard under the Christmas tree. She asks whether the hotel will be told before the guests wake." Shamsul "is arrested on the cruise jetty in his pilot's shirt and asks the constable to tell his mother he was not in a fight." Ram "is charged; the iron room is sealed, and Sinar Heritage's lawyers write to the court the same afternoon to buy it." Jock "is charged; the Settlement holds a collection for his lawyer on Boxing Day."

### Flags

- **Reads:** `TAIL_TRACED` (c9_tl, opening), `ROSLAN_FREE` (c9_rs, truth of the courier, ending), `ARCHIVE_SEIZED` (c9_ar), `KHAIRUL_FREE`, `KHAIRUL_WRONGED` (opening), `VIVIAN_FREE`, `MELISSA_FREE` (opening, ending), `WAS_HELD`, `DANIEL_CHARGED` (Daniel's lines), `AIN_WRONGED` (Ain's line in the ending: whether she still has a newsroom voicemail; she does in both branches, freelance), `NORHAYATI_FREE` (ending gag).
- **Sets:** `flagNames: ['VANESSA_FREE', 'SHAMSUL_FREE', 'RAM_WRONGED', 'JOCK_WRONGED', 'NOTE_FOUND', 'NOTE_LOST']`; `NOTE_FOUND: answers.note === 'xavier'`, `NOTE_LOST: answers.note !== 'xavier'`.

### Ending (panels)

1. *IPD Melaka Tengah. Monday 28 December, 6 AM.* `resolution`. Charged lines.
2. *The iron room.* Ram (if not wronged) closes the iron door on forty-one boxes. Line by verdict. `RAM_WRONGED`: the iron room sold to Sinar Heritage before the year is out. `JOCK_WRONGED`: the Settlement's New Year dance without its locksmith.
3. The note. `NOTE_FOUND`: *St. Paul's Hill, dawn.* Under the grille of the empty grave, a plastic sleeve taped to the iron. The cancelled note: two thumbs. JPN matches the right thumb to Muthusamy a/l Perumal at once. The left thumb has nine clear points; the national search needs twelve. Hamidah: "Nine points is a man. It is not yet a name." `NOTE_LOST` (wrong place line, then): "On Tuesday the grille over the empty grave on St. Paul's Hill is found with a strip of tape on it and nothing under the tape."
4. Box 14's photographs (every branch; from Shamsul's phone): the watch, TEOH A.C. 1979. Farah runs the name: Teoh Ah Chuan, of Jugra, died 1 Dec 1986, drowned, "kemalangan". Daniel looks at the shadow in the 1986 photograph for a long time. `ROSLAN_FREE`: the dry bag went north with Roslan at 2:41 and has not been seen since. `NORHAYATI_FREE`: "A Sinar parcel left Port Klang for Singapore on Boxing Day. Officer: N. SALLEH."
5. *Brickfields. New Year's Day, 2:10 AM.* `chairman`. A courier at Bala's shutter (Bala does not come down). Inside an envelope: the original 1986 photograph from Box 14. On its back, in the left-handed hand: *"Selamat Tahun Baru, detektif. She is fifty-five now."* Fireworks over the city.

### Chairman beats (exactly this)

The loan, the guarantor, repaid to the day, the box for fifty years, the margin note (c9_04). Every 1 December for four minutes (c9_09); the visitor book, with a sun instead of "M.P." in 2026 (c9_22). `TAIL_TRACED` only: an old man with an umbrella and a white cuff, 6:10 AM on 1 Dec (c9_tl; nobody says this was the Chairman). The watch at 2:10, TEOH A.C. 1979; the registration card; the photograph with the girl and the shadow of a slim man in a cap; the note with his left thumb, nine points (c9_16, ending). The photograph sent back with two handwritten lines (ending). **Sinar File threads:** *Not a good man* (c9_04), *Four minutes a year* (c9_22), *The photographer's shadow* (c9_16), *Nine points* (ending, `NOTE_FOUND`), *She is fifty-five now* (ending). New unknown: "Whose watch did he keep for forty years, and why stop it at ten past two?"

### Hook and teaser

On 2 January a letter arrives at Restoran Bala from Singapore, in a careful old hand: Arthur Seah, solicitor, of Seah & Seah, 214 Telok Ayer Street. In 1987 he witnessed a trust deed signed in the back of a car on the Johor shore; he has read about Box 14 in the papers; he is eighty-two.

`COMING_SOON` for Case 10: "A solicitor of eighty-two on Telok Ayer Street has written to you in a careful hand. In 1987 he watched a man sign a trust deed in the back of a car on the Johor shore, and the man would not cross the water. He would like to tell somebody before he forgets. Come on Friday, he says. Seven o'clock. He will have it all out on the table."

### New speakers

Ram Chettiar (m, 46, Melaka Tamil), Vanessa Low (f, 38, KL Cantonese-English), Jock Sequeira (m, 66, Melaka English/Malay), Shamsul Bakri (m, 33, Melaka Malay) if they speak in panels. Existing: Daniel Raj, Inspector Farah Iskandar, Bala Anne, Hamidah Yusof (new speaker if not yet added). Voice overrides: Ram's Tamil line (தாத்தா சொன்னார்: முகத்தைப் பாக்காதே, சாவியைப் பாரு.).

---

## Case 10: Telok Ayer (`case10`)

**Header.** `id: 'case10'`, `number: 10`, `title: 'Telok Ayer'`, `place: 'Telok Ayer Street, Singapore'`, `hints: 8`.
`victim`: "Arthur Seah Boon Huat, 82, solicitor. Missing from his bolted room at 214 Telok Ayer Street since the night of Thursday 14 January."
`question`: "Who took Arthur Seah?"
`brief`: "Arthur Seah bolted his door at two minutes past ten on Thursday night with a deed from 1987 on his desk, and said he would have it all out on the table for you at seven. At seven the door was still bolted. Singapore police had to break it. The deed, the old man and the letter he kept for forty years were gone, and the window bars had not been touched since the Japanese left."
`mapIntro`: "Every puzzle gives up one exhibit. Two questions wait at the end: who took Arthur Seah, and how he left a room bolted from the inside. ASP Teo can act on one answer, once. Nobody will tell you if you get either right."
`finalLabel: 'Name them'`.

**Where and when.** Wed 13 Jan 2027 (the Causeway) to Sun 17 Jan 2027; ending panel Mon 18 Jan, 2:10 AM, in Singapore. Seah & Seah, 214 Telok Ayer Street, a 1920s shophouse with a 1961 file lift; Thian Hock Keng temple across the street; Amoy Street Food Centre; Ann Siang Hill; Tuas SecureShred Pte Ltd, Tuas; Little India (Serangoon Road, Tekka Centre, Rowell Road); the Johor Bahru waterfront and the Causeway; a small hotel on Club Street.

**Music (`theme_case10`).** A lounge piano in an empty office at three in the morning, the hum of an old lift motor, the brass bells of Thian Hock Keng, and a thread of Hokkien opera on a radio somewhere.

### Truth (writers only)

- **The trust.** The **Jugra Trust**, settled on 1 Dec 1987 with Seah & Seah of Singapore as trustee (Seah & Seah Trust Co.), owns Sinar Holdings Pte Ltd (incorporated 1988), which owns 51% of Sinar Holdings Berhad. The deed names the settlor as "Muthusamy a/l Perumal, sole proprietor of Sinar Pengangkutan, Jugra". It is signed with a flourish in Latin letters and a **left** thumbprint. Muthu signed everything in Tamil, and neither of the thumbs on his MyKad matches. The deed says it was signed at Johor Bahru, witnessed by Arthur Seah.
- **1987.** Arthur met him once, at dusk on 1 Dec 1987, in the back of a car on the Johor Bahru waterfront. He would not cross to Singapore: "I do not cross water." His driver (Muthu) stood outside the car with his back to it the whole time. He signed with his left hand.
- **The letter of wishes**, sealed in 1987, amended on **19 Aug 2016** by one typed page and one handwritten line in the same left-handed hand: *"On my death the Trust is to be directed by whoever drives me last."* Arthur told him it was not a legal sentence. "It will be, Arthur, when I am dead." The envelope is endorsed "Amended 19.8.2016" in that hand.
- **Arthur Seah**, 82, read about Box 14, wrote to you on 2 January, and asked you to come on Fri 15 Jan at 7 AM. On Thursday at 22:02 he took the deed and the letter up to his room on the third floor and bolted the door from inside, as he has every night since a break-in in 1994. He dictates notes into a pocket recorder that starts at the sound of a voice.
- **Clarissa Seah**, 41, his granddaughter and the partner who runs the trust's administration (the Jugra Trust pays the firm S$1.2 million a year). She had told the Office of the Chairman about the appointment; the reply came printed: "The trustee first. Then the letter." At 22:28 she knocked and handed in his nightly chrysanthemum tea with two of her own temazepam crushed in it. By 23:00 he was asleep in his chair. At **05:50** she let herself in by the back door, rang Gary Raju at 05:52 from the partners' line ("Bin seven. Hold it."), and sent the **1961 file lift** (out of order "since 1998", rewired by Gary's men in December) up to the third floor, where its hatch opens behind the bottom of Arthur's bookcase. **Ganesan "Gary" Raju**, 48, operations supervisor at Tuas SecureShred (a subsidiary of Sinar Cold Chain Pte), rode it up at 05:55, folded the sedated old man into the cab, rode down, and put him in a 240-litre shredding bin, bin 7. At **06:04** his crew wheeled seven bins instead of six out of the basement to the Friday truck, as they do every Friday at six. The door upstairs stayed bolted. Clarissa took the deed and the letter home, burned the letter in a brass bowl on her desk, and came in "for the first time" at 06:55 to meet you. At 07:00 the door was broken.
- **Bin 7** went to Tuas on truck 7. It was not tipped. At 06:51 it was parked in the bale room, a cold store at 4°C, to wait for instructions.
- **Red herring 1: Lucas Seah**, 55, Arthur's son, bankrupt, gambling; came at 1:02 AM to beg for money and was turned away at the street door; slept on a bench at Amoy Street; inherits. Lied that he spent the night in Geylang. *Cleared by:* the coffee-shop auntie and the camera put him on the bench all night; at 06:04 he saw two men lift one bin over the kerb "like it was full of wet sand" and read TSS on the truck (c10_03, c10_10).
- **Red herring 2: R. Rajendran**, 67, night guard. Says he did his rounds and nobody came. *Cleared by:* he slept at his desk from 2:10 to 4:55 (camera), so he lied about the rounds, but he never went upstairs, and his card was never used (c10_11, c10_19).
- **The second question.** How did Arthur Seah leave the bolted room? Answer: **down the old file lift, and out in a shredding bin at 6:04**.
- **If found** (`ARTHUR_FOUND`): Singapore police open the bale room at Tuas at 2 PM on Friday; Arthur is alive, cold, wrapped in shred sacks, and asks for his hearing aid. **If lost** (`ARTHUR_LOST`): bin 7 has left the bale room by the time anyone looks; the plant's log has a gap from 11:00 to 11:40; Arthur Seah is not found. (Do not say he is dead.)

### Suspects

| id | Name | Age | Background | Voice | revealedBy |
| --- | --- | --- | --- | --- | --- |
| `rajendran` | R. Rajendran | 67 | Night guard at 214 Telok Ayer for eleven years; ex-army; widower. | Male, Singapore Tamil, formal English; `voice_3` | `c10_02` |
| `lucas` | Lucas Seah | 55 | Arthur's son. Bankrupt, gambles, estranged; inherits. | Male, Singlish, charming and ashamed; `voice_2` | `c10_03` |
| `clarissa` | Clarissa Seah | 41 | Arthur's granddaughter; partner, Seah & Seah; runs the Jugra Trust's administration. | Female, convent-school Singapore English, Hokkien to her grandfather; `voice_4` | `c10_05` |
| `gary` | Ganesan "Gary" Raju | 48 | Operations supervisor, Tuas SecureShred (Sinar Cold Chain Pte). Ex-SAF. A 2015 arrest for affray (DNA on file). | Male, Singlish, Tamil when cornered; `voice_2` | `c10_09` |

`revealLine`s: Rajendran, "He says he walked every floor twice. The stairs say nobody walked them." Lucas, "The auntie at Amoy Street knows him. He sat on her bench from one until six." Clarissa, "Eighty thousand dollars to the shredding company on Thursday, approved C.S." Gary, "His sweat is on the handrail of a lift that has not worked since 1998."

### Singapore ally

**ASP Teo Wei Ling**, 44, Singapore Police Force CID; on an Interpol course with Farah in Lyon in 2014. She has jurisdiction; you and Farah have none. She lets you look "as a courtesy". Daniel stays in Kuala Lumpur (the only passport he could use is K. Rajan's).

### Opening (panels)

1. *Brickfields. Wednesday 13 January, 6 AM.* `office`. Asri drives you to the Causeway in Farah's car; Farah in front with her stick. Asri asks what time you are meeting the old man; you tell him. (One line only. Do not dwell.)
2. *Woodlands Checkpoint. 8:10 AM.* The Causeway, the Straits under it, Johor behind you. Farah: "He would not cross this. Forty years, a whole port, and he never once came over."
3. *Telok Ayer Street.* Shophouses, the temple roofs of Thian Hock Keng, the towers of the CBD standing over them.
4. *Arthur on the phone, Wednesday night.* `ARTHUR_LINE`. "I will have it all out on the table."
5. *214 Telok Ayer. Friday, 7:00 AM.* `tension`. Clarissa, the guard, two constables, ASP Teo. The door bolted from inside. The constable's shoulder. The room: the chair, the stick, the spectacles, the hearing aid on the floor, the empty deed box, a slit envelope. Nobody.
6. Teo: "Can or not, you tell me. Bolted inside, bars outside, camera on the corridor. Where did an old man go?"
7. Title `{ kicker: 'Case 10', name: 'Telok Ayer' }`.

```js
const ARTHUR_LINE = { who: 'Arthur Seah', en: 'Seven o\'clock on Friday. I met him once, in 1987, on the Johor side. He would not cross the water.' };
```

### Levels

| # | id | game (variant) | Evidence title | Purpose |
| --- | --- | --- | --- | --- |
| 1 | `c10_01` | hiddenobject (list, `scene: 'desk'`) | Amended 19.8.2016 | The bolted room: the bolt thrown from inside and unscratched; the window bars painted over and never moved; stick, spectacles, hearing aid, empty deed box, a cold cup of chrysanthemum tea with a chalky ring, and the slit envelope "Letter of wishes. Amended 19.8.2016" in a left-handed hand. *Chairman beat (the hand).* |
| 2 | `c10_02` | witness (statement) | Nobody came, he says | Rajendran's account: rounds every two hours; Lucas at the street door at 1 AM, sent away; the shredding men at six, "as every Friday". Reveals **Rajendran**. |
| 3 | `c10_03` | lineup (single) | The son across the road | The Amoy Street auntie picks Lucas: on her bench from one until six. Reveals **Lucas**. |
| 4 | `c10_04` | spotdiff | The bookcase moved | Arthur's own photo of his desk, sent to you at 22:10, against the room at 7:00: the bottom of the bookcase two centimetres out from the wall; the tea moved; the deed gone. |
| 5 | `c10_05` | ledger | Eighty thousand to Tuas | The firm's trust ledger, printed for the auditors on Thursday at five, changed on Friday: a "special disbursement" of S$80,000 to Tuas SecureShred on 14 Jan, approved C.S. Reveals **Clarissa**. |
| 6 | `c10_06` | wiretap | The file lift works | The 1961 file lift's call circuit, "dead since 1998": rewire it and the basement and the third floor both answer. New wire in an old duct; fresh grease on the cables. |
| 7 | `c10_07` | tape (reverse, `mode: 'slow'`) | Ah Kong, your tea | Arthur's pocket recorder from the floor, on its slow speed. Brought right, it is `ARTHUR_LINE`, rehearsed for you; then what woke it in the night: 22:28 Clarissa, "Ah Kong, your tea"; 05:56 a motor, a cab bumping a wall, a man's voice: "Mannikkanum, aiya." (Sorry, sir.) |
| 8 | `c10_08` | searchlight | Wheel tracks | The basement archive, lit shelf by shelf: two tracks of a 240-litre bin's wheels in the dust from the file lift's basement door to the loading door; a hearing-aid battery. |
| 9 | `c10_09` | dna (mixed) | A man from Tuas | The file lift's cab: Arthur's hair, and a second man's sweat on the handrail: Ganesan Raju, on file since 2015. Reveals **Gary**. |
| c | `c10_rz` | fingerprint — `when: f => f.RIZAL_FREE` | New uniform, new company | Rizal Hamdan keeps the night gate at Tuas SecureShred. His gate log: truck 7 in at 06:51, "BIN 7 HOLD, instructions C.S.". The print on the bale-room padlock is Gary's. Rizal: "I have learned not to ask. I am asking you to ask." |
| 10 | `c10_10` | interrogation | Too heavy for paper | **Lucas** (red herring). |
| 11 | `c10_11` | timeline (cctv) | In at 5:50 | Frames below. |
| 12 | `c10_12` | shredder | The trustee first | Clarissa's own office shredder, which nobody empties on Fridays: her printed email to the Office ("He means to show the deed and the letter to the Malaysian at seven on Friday") and the printed reply (text below). |
| 13 | `c10_13` | nonogram | The settlor who was not Muthu | The firm's 1987 microfiche, one frame corrupt; rebuild it: the deed's signing page. "Muthusamy a/l Perumal", a Latin flourish, a left thumb, "at Johor Bahru", witnessed A. Seah. Farah's JPN check: Muthu signed in Tamil, and neither of his thumbs is this one. *Chairman beat.* |
| c | `c10_nf` | fingerprint — `when: f => f.NOTE_FOUND` | Two left thumbs | The left thumb on the 1987 deed against the left thumb on the Melaka note: the same nine clear points on both. The same man borrowed in 1986 and settled the trust in 1987. Still nine points. |
| 14 | `c10_14` | safecracker | Ashes and one corner | Clarissa's desk drawer (four digits, no repeats: the trust's year, 1987): the original deed. In the brass bowl on her desk, ashes, and one unburnt corner of a handwritten line: "…drives me last." *Chairman beat.* |
| 15 | `c10_15` | quickmath (receipts) | Sixty-one kilos | Tuas SecureShred's Friday weighbridge slips: six bins at 18 to 24 kg of paper, and bin 7 at 79 kg. |
| 16 | `c10_16` | dialtone | Bin seven. Hold it. | The partners' line records every call: 05:52 Friday, eight tones and five words. The number is Gary Raju's mobile. |
| 17 | `c10_17` | pursuit | The bale-room key | ASP Teo's team at Gary's flat on Rowell Road. He runs: Tekka market, Serangoon Road, the back lanes, a car-park roof. In his pocket, the bale-room key and a bin tag: "BIN 7 HOLD C.S." |
| 18 | `c10_18` | getaway | Truck seven never tipped | The Tuas plant yard, truck 7 boxed in by bale trailers and forklifts. Its tipping log: no tip on Friday; parked in the bale room at 06:51. The bale room is a cold store. |
| c | `c10_vv` | anagram (phrase) — `when: f => f.VIVIAN_FREE` | Never in a room | Vivian Chua, on a bench on Ann Siang Hill, gives you her shorthand pad, scrambled on purpose. Unscrambled: "In twenty-seven years he dictated to me down a car telephone. I never once typed a word he said in a room." |
| 19 | `c10_19` | whoslying | Two liars at the firm | Five statements: Clarissa, Rajendran, Lucas, Mrs. Pang the office manager, the TSS driver. Liars: **Clarissa** and **Rajendran** (he lied about his rounds, not about Arthur). |
| 20 | `c10_20` | logicgrid | Everyone at 6:04 | Solution below. |
| 21 | `c10_21` | theory | For ASP Teo | Points below. |
| 22 | `c10_22` | interrogation | The trustee first | **Clarissa** (culprit). |

Counts: 22 base, 3 conditional. `fingerprint` twice (both conditional), `interrogation` twice. Batch D: ledger, wiretap, tape, searchlight, shredder, dialtone, pursuit, getaway, theory, interrogation ×2.

**Clue chain.**
- *Clarissa:* Eighty thousand to Tuas (c10_05) → Ah Kong, your tea (c10_07) → In at 5:50 (c10_11) → The trustee first (c10_12) → Ashes and one corner (c10_14) → Bin seven. Hold it. (c10_16) → c10_19 → c10_22.
- *Gary:* The file lift works (c10_06) → Wheel tracks (c10_08) → A man from Tuas (c10_09) → Sixty-one kilos (c10_15) → Bin seven. Hold it. (c10_16) → The bale-room key (c10_17) → Truck seven never tipped (c10_18).
- *Lucas cleared:* The son across the road (c10_03) → Too heavy for paper (c10_10: he saw the bin lifted).
- *Rajendran cleared:* asleep from 2:10 to 4:55 (c10_11 d); he lied only about his rounds (c10_19).
- *The method:* The bookcase moved (c10_04), The file lift works (c10_06), the lift motor at 5:56 (c10_07, c10_11 f), Wheel tracks (c10_08), A man from Tuas (c10_09), Sixty-one kilos (c10_15). Decoys answered: the bolt is unscratched and the bars painted over (c10_01); No. 216's wall is solid brick behind the archive shelving (say so in c10_08's text).

### Key parameters

- **c10_07 tape:** `variant: 'reverse'`, `mode: 'slow'`, `line: ARTHUR_LINE`, `answer: 'cross the water'`, `accept: ['the water', 'water', 'cross water']`, `ask: 'What would the man in 1987 not do?'`, `label: 'DICTAPHONE · A.S. · THU-FRI'`.
- **c10_11 timeline frames** (a to h): a `22:02` Corridor camera: Arthur goes in with a document box; the bolt. b `22:28` Corridor: Clarissa hands a cup through the door; the bolt again. c `01:0▮` Street door: Lucas, turned away. d `02:10` Guard desk: Rajendran's head on his arms. e `05:50` Back door: keycard C. SEAH. f `05:5▮` Building meter: the file lift motor draws current for four minutes. g `06:0▮` Basement corridor: two TSS men wheel out seven bins. h `06:55` Front door: keycard C. SEAH, "first arrival".
- **c10_12 shredder:** title `SINAR HOLDINGS BERHAD`, text: "OFFICE OF THE CHAIRMAN\n\nTo: C.S., Seah & Seah\nWednesday, 23:40\n\nThe trustee first.\nThen the letter.\n\nTuas will collect\non Friday as usual.\n\nNothing on the phones.", `strips: 10`, `flips: true`, `stamp: 'PRIVATE'`.
- **c10_16 dialtone:** `digits: 8`, `number: '96274013'`, `noise: 0.2`, clue "Singapore mobiles are eight digits and start with 8 or 9."
- **c10_17 pursuit:** `setting: 'market'`, `route: ['market', 'city', 'city', 'rooftop']`, `legs: 4`, `skyline: 'town'`, `vehicle: 'foot'`, `difficulty: 'medium'`, `suspect: 'Gary'`. Beats: through Tekka's wet market, fish scales and ice; up Serangoon Road between the sari shops and garland stalls; into the back lanes behind Rowell Road; up the ramps of a multi-storey car park to the roof. (Engine note: `pursuit.js` has no Singapore landmark; `town` keeps the horizon generic. If an engineer adds a `singapore` skyline later, switch to it.)
- **c10_20 logicgrid.** Person: Clarissa, Gary, Lucas, Rajendran, You. Location: the back lane / the basement file-lift door / the Amoy Street bench / the guard desk / a hotel on Club Street. Holding: the deed / a bin tag / a kopi / his cap / a key with a brass sun. Solution: Clarissa, back lane, deed; Gary, basement, bin tag; Lucas, bench, kopi; Rajendran, guard desk, cap; You, Club Street, the key.
- **c10_21 theory**, `need: 3`. `who` Clarissa Seah and Gary Raju took Arthur. `how` Down the old file lift, then out in a shredding bin with the Friday collection at 6:04 (the door stayed bolted). `why` To stop him showing the detective the 1987 deed and the letter of wishes (on the Office of the Chairman's order / for the trust). `letter` Clarissa burned the letter of wishes.
- **c10_10 Lucas** (`voice_2`). Lies: "I was in Geylang all night" (by *The son across the road*); "I never came near the office" (by *Nobody came, he says*: Rajendran turned him away at the street door at 1 AM). Secret: he begged, was refused, slept on the bench; at 6:04 he saw two men lift one bin over the kerb "like it was full of wet sand", and the truck said TSS, Tuas.
- **c10_22 Clarissa** (`voice_4`). Persona: composed, legal, calls her grandfather "Ah Kong" and the detective "the Malaysian"; touches her pearl earring when a question lands. Lies: "I came in at 6:55, the first time that morning" (by *In at 5:50*); "The file lift has not worked since 1998" (by *The file lift works*); "Ah Kong burned his own letter years ago" (by *Ashes and one corner*); "The firm has never paid Tuas more than its invoice" (by *Eighty thousand to Tuas*). Secret: she drugged him and sent the lift; she burned the letter because whoever "drives him last" would take the trust from the trustees; the Office's reply. Evidence on solve: *The trustee first*: she has never seen him; the Office's letters come by courier from Johor; "Ah Kong saw him once. He said he had a face you forget while you are looking at it."

### Deduction

`lede`: "ASP Teo will arrest whoever you name for the abduction of Arthur Seah, on your word, which in Singapore is worth exactly as much as she says it is. Name everyone who took him, and only them."
Extra question `method`: "How did Arthur Seah leave the bolted room?" short "He left". `lede`: "Teo can search one route, once, today. Whichever it is, the Office will know by lunch, and an old man in a cold room has until then." Options:

| id | label | note |
| --- | --- | --- |
| `door` | Through the door: the bolt was thrown from outside with a magnet | An old bolt, a strong magnet, a careful hand. |
| `window` | Out of the window: the bars were taken off and put back | Four iron bars over Telok Ayer Street. |
| `wall` | Through the party wall into No. 216 | The firm owned No. 216 until 1971. |
| `lift` | Down the old file lift, and out in a shredding bin at 6:04 | Out of order since 1998, they say. |

`outcomes.correct: ['clarissa', 'gary']`. Charged lines: Clarissa "is arrested in the firm's boardroom under her great-grandfather's portrait, and asks for a Singapore lawyer who has never acted for Sinar. There is not one in the Law Society's directory." Gary "is arrested in his overalls at the plant gate. He asks whether the old man was cold." Lucas "is charged; he asks the magistrate to tell his father he is sorry, and the magistrate does not know where to send it." Rajendran "is charged; his firm takes his uniform back the same afternoon."

### Flags

- **Reads:** `RIZAL_FREE` (c10_rz), `NOTE_FOUND` (c10_nf), `VIVIAN_FREE` (c10_vv, opening), `MELISSA_FREE`, `SHEHANI_FREE`, `TONY_FREE`, `KAMAL_FREE` (ending flavour), `DNAA`/`WAS_HELD` (Daniel's phone lines), `KHAIRUL_FREE` (one line: he rang SPF to say you are not police), `NORHAYATI_FREE` (gag).
- **Sets:** `flagNames: ['CLARISSA_FREE', 'GARY_FREE', 'LUCAS_WRONGED', 'RAJENDRAN_WRONGED', 'ARTHUR_FOUND', 'ARTHUR_LOST']`; `ARTHUR_FOUND: answers.method === 'lift'`, `ARTHUR_LOST: answers.method !== 'lift'`.

### Ending (panels)

1. *Police Cantonment Complex. Sunday, 6 AM.* `resolution`. Charged lines.
2. Arthur. `ARTHUR_FOUND`: *Singapore General Hospital, Saturday.* Under three blankets, his hearing aid back in. He recites the letter of wishes from memory, every word: "On my death the Trust is to be directed by whoever drives me last." "I told him that is not a legal sentence. He said, it will be, Arthur, when I am dead." And 1987: the waterfront at dusk, the car, the driver with his back to it, "younger than me and older than he looked; he signed with his left hand; I do not cross water, he said." `ARTHUR_LOST`: (wrong route line), then: "By the time Teo's team reaches Tuas the bale room is empty and cold. The plant's log has forty minutes missing. Arthur Seah is not found." Only the corner survives: "…drives me last."
3. *Ann Siang Hill.* The deed goes into the High Court's custody; Hamidah gets a certified copy. `CLARISSA_FREE`: Clarissa is still the trustee on Monday. `VIVIAN_FREE`: a card in copperplate at your hotel: "He will be sorry about the old man." `SHEHANI_FREE`: Teo mentions a Sri Lankan woman who sits on the trust's investment committee. `NORHAYATI_FREE`: "Bin 7's empty frame crossed back into Johor on Saturday. Officer: N. SALLEH."
4. Optional (`KAMAL_FREE` or `TONY_FREE`): Herath, from Colombo, by phone: "Ayubowan. Your fire officer and your depot manager send their regards from my side of the water." (One Sinhala greeting only: ආයුබෝවන්.)
5. *Club Street, Singapore. Monday, 2:10 AM.* `chairman`. The hotel room's telephone. The Chairman: "You crossed the water for me, detective. I never have. Thank you." Lid, open and shut.

### Chairman beats (exactly this)

The Jugra Trust and the chain to Sinar Holdings Berhad (c10_13). The settlor named as Muthu, but not Muthu's hand or thumb (c10_13). "I do not cross water" (`ARTHUR_LINE`, ending). The 2016 amendment, in his hand (c10_01); the whole sentence only if `ARTHUR_FOUND`, otherwise "…drives me last" (c10_14). Arthur's 1987 description (ending, `ARTHUR_FOUND` only). `NOTE_FOUND`: the same left thumb in 1986 and 1987 (c10_nf). `VIVIAN_FREE`: he dictates down a car telephone, never in a room (c10_vv). The Office's reply, "The trustee first. Then the letter." **Sinar File threads:** *The Jugra Trust* (c10_13), *Whoever drives me last* (ending or c10_14), *I do not cross water* (c10_07). New unknown: "Who drives him last?"

### Hook and teaser

The plate (Case 8), the watch (Case 9) and the deed bring Hamidah to the Selangor coroner: the 1986 death of Teoh Ah Chuan is to be reopened. The man who wrote "accident" in 1986, retired Corporal Tarmizi Hassan, asks for police protection.

`COMING_SOON` for Case 11: "On the first of February the coroner's court in Shah Alam will open a file that was closed in eleven minutes in December 1986: a lorry, a river, a watch that stopped at ten past two. The man who wrote 'accident' is sixty-six and has asked for protection. The girl who painted the sun on the gate is fifty-five, and she is coming to court with her brushes."

### New speakers

Arthur Seah (m, 82, Singapore English), Clarissa Seah (f, 41, Singapore English), ASP Teo Wei Ling (f, 44, Singapore English/Singlish), Lucas Seah (m, 55, Singlish), R. Rajendran (m, 67, Singapore Tamil) and Gary Raju (m, 48, Singlish) if they speak in panels. Existing: Inspector Farah Iskandar, The Chairman, Vivian Chua, Inspector Ruwan Herath. Voice overrides: Gary's "Mannikkanum, aiya." (மன்னிக்கணும், ஐயா.) if it is voiced; Herath's Sinhala greeting.

---

## Case 11: The Gate (`case11`)

**Header.** `id: 'case11'`, `number: 11`, `title: 'The Gate'`, `place: 'Shah Alam, Jugra and Butterworth'`, `hints: 8`.
`victim`: "Tarmizi bin Hassan, 66, retired police corporal. Poisoned in the witness room of the Shah Alam coroner's court at 9:40 AM on Wednesday, before he could give evidence. Alive."
`question`: "Who poisoned Corporal Tarmizi?"
`brief`: "In December 1986 a lorry owner called Teoh Ah Chuan drowned in his own lorry at the bottom of his own yard, and a corporal called it an accident in eleven minutes. Forty years later the coroner has opened the file again. On the second day the corporal said, in the witness box, that he had written 'accident' for forty years. On the third day, before he could say why, somebody put something in his tea."
`mapIntro`: "Every puzzle gives up one exhibit. Two questions wait at the end: who poisoned the corporal, and what happened at the Jugra yard at ten past two on 1 December 1986. The coroner will write one finding, once. Nobody will tell you if you get either right."
`finalLabel: 'Name them'`.

**Where and when.** Mon 1 Feb to Thu 4 Feb 2027 (the eve of Chinese New Year is Fri 5 Feb); ending panel Fri 5 Feb, 2:10 AM. The coroner's court, Shah Alam court complex (witness room, gallery, canteen); the old Sinar yard under Bukit Jugra, its gate with the pink sun, its washing ramp into Sungai Langat, Pak Itam's hut; Banting (Teoh Ah Kow's terrace behind the wet market); Kampung Jugra; the Forest Research Institute (FRIM), Kepong; Butterworth (Bagan Luar, Teoh Siew Yang's sign shop, the ferry terminal and Madam Ong's drinks stall, Prai).

**Music (`theme_case11`).** A courtroom ceiling fan for a metronome, a woodblock like a gavel, a Hokkien funeral suona far off, and under it the slow pull of a tidal river.

### Truth (writers only)

- **1986.** Teoh Ah Chuan, 52, Hokkien, owned a yard and one Bedford lorry, BCK 210, under Bukit Jugra, hauling palm oil to Port Klang and Butterworth. In 1985 a man came from Kuala Lumpur to drive for him (nameless; "the driver"); he spoke Hokkien to Teoh, Tamil to his attendant, Malay to the police and English to the bank. In November 1986 he took on Muthusamy Perumal, 31, as his lorry attendant (*kelindan*). On **1 Dec 1986 at 2:10 AM**, at the yard's washing ramp, at high spring tide, the lorry went nose-first into three metres of water with Teoh in the cab. The driver, in the water, held the cab door shut. Muthu stood on the bank with the torch. Across the yard the driver said to him: "Jangan tengok belakang." (Don't look back.) Teoh's daughter **Siew Yang**, 15, sleeping in the yard office, saw two figures from the window and heard those words. Teoh's watch stopped at 2:10.
- **3 AM, 1 Dec 1986.** The driver, wet to the knees, came to the door of Teoh's younger brother **Teoh Ah Kow** (then 34, deep in gambling debt to him) with Teoh's watch in his hand. "Your debts are finished. Tell them it was the brakes." He gave Ah Kow the watch to hold, and took it back: "I will keep the time." Ah Kow identified the body, said it was the brakes, signed the yard and the lorry over to "Sinar Pengangkutan", and on the driver's behalf paid **Corporal Tarmizi** of Balai Polis Jugra RM 2,000 to write "kemalangan". (Paid again in 1987.) Ah Kow has received RM 300 "the morning after the first" of every month since January 1987. Tarmizi's family has received RM 1,000 a month since 1987.
- **The papers.** The driver gave a statement in his own hand, in Malay, at Balai Polis Jugra; Muthu gave one in Tamil ("I was asleep in the cab"). In 1987, when he was paid the second time, Tarmizi tore out the page with the driver's name and identity card number and gave it to Ah Kow to burn; he kept his carbon of the rest in a police-issue document tin. The district's own file was retyped in 1987 ("brakes failed; attendant asleep; 3:00 AM") and lost the name page too. Siew Yang was told by her uncle that she dreamed it; in 1985, aged fourteen, she had painted the sun on the yard gate, and the driver named the company after it.
- **The inquest, 2027.** Hamidah applies; the coroner sits Mon 1 to Thu 4 Feb. Day 1: exhibits; Siew Yang, the applicant. Day 2: Pak Itam; Tarmizi, who says in the box "I wrote 'accident'. For forty years I have been writing 'accident'", and that he kept the driver's statement without its name page. That night (Tue, 9:10 PM) Tarmizi phones Ah Kow: "Esok saya cakap semua. Termasuk awak." (Tomorrow I tell everything. Including you.) The same night the court's recording of Tuesday afternoon is cut into five and re-saved by the recording clerk, paid by Sinar's counsel Shamir Kassim, who also visited the witness room on Wednesday at 9:20 to offer Tarmizi money. On Monday night Ah Kow's grandson Wei Liang, 22, broke into Siew Yang's sign shop in Butterworth and took her 1986 sketchbook; he was told to burn it and kept it to sell.
- **The poisoning (the culprit): Teoh Ah Kow**, 74, on the Office's printed order and for himself. On Wednesday at 9:3x he bought two teh at the court canteen, one with extra condensed milk, stirred crushed **kecubung** seeds (datura, from the shrub behind his terrace in Banting) into it, and carried the tray down the corridor in his white shirt. At 9:36 **Sjn. Asri**, guarding the witness room, took the tray at the door and carried it in without looking (his only part; he is not a suspect here). Tarmizi drank at 9:40 and collapsed at 10:05, delirious; he lives, and testifies from a wheelchair on Thursday if Ah Kow is charged.
- **Red herring 1: Ridzuan Tarmizi**, 38, the corporal's son, tow-truck operator in Banting. The Sinar money built his house; he deleted his father's voice notes on Monday night; he brought a flask to court. *Cleared by:* Asri refused his flask at the door at 9:28 (camera); the tea his father drank came from the canteen; FRIM traces the seeds to Ah Kow's shrub (c11_10, c11_14).
- **Red herring 2: Teoh Siew Yang**, 55. She hated the man who called her father's death an accident; she brought a flask to the gallery. *Cleared by:* she never left the gallery from 9:15 to 10:10 (camera); her flask holds kopi, nothing else; her prints are nowhere on the cup (c11_10, c11_11).
- **Red herring 3: Encik Shamir Kassim**, 44, Sinar's counsel on a watching brief. He was in the witness room at 9:20 to 9:22 and had the recording cut. *Cleared by:* he left eleven minutes before the tray came; he is guilty of tampering and of offering a witness money (Hamidah reports him to the Bar), not of poison (c11_05, c11_19).
- **Pak Itam** testifies on Day 2 (not a suspect): watchman at the yard since 1985, asleep on toddy that night, "I saw the driver's face every day in 1986. I have not seen it since 1987." He will not describe it: "Biasa. Ordinary. Like anybody. If I say, the gate goes."
- **The second question.** What happened at Jugra at 2:10 AM on 1 December 1986? Answer: **the man who drove for Teoh held the cab door shut under the water, while Muthu held the torch**.

### Suspects

| id | Name | Age | Background | Voice | revealedBy |
| --- | --- | --- | --- | --- | --- |
| `yang` | Teoh Siew Yang | 55 | Teoh Ah Chuan's daughter; sign painter, Bagan Luar, Butterworth; the inquest's applicant. | Female, Penang Hokkien and plain English; `voice_1` | `c11_03` |
| `shamir` | Shamir Kassim | 44 | Advocate & solicitor, KL; Sinar's counsel, watching brief at the inquest. | Male, polished KL English, Malay to the court; `voice_2` | `c11_05` |
| `ahkow` | Teoh Ah Kow | 74 | Teoh Ah Chuan's younger brother; retired, Banting; Buddhist, prayer beads. | Male, Selangor Hokkien and Malay ("lu", "wa", "aiya"), soft; `voice_3` | `c11_06` |
| `ridzuan` | Ridzuan Tarmizi | 38 | The corporal's son; tow-truck operator, Banting. | Male, Selangor Malay, short-tempered; `voice_2` | `c11_09` |

`revealLine`s: Yang, "She brought a flask to court, and she has hated the word 'accident' for forty years." Shamir, "The court's recording was cut into five at 4:40 on Tuesday. The clerk says he was paid by a lawyer." Ah Kow, "'Paid RM 2,000. Through T.A.K.' Three initials in a corporal's tin." Ridzuan, "A thousand ringgit a month from Sinar since 1987, and the house it built is in his name."

### Opening (panels)

1. *Shah Alam court complex. Monday, 8:40 AM.* `office`. Hamidah on the steps with her flask: "Third court this season, detective. This one is forty years old." Tarmizi arrives between two constables and Asri, thin, frightened. In the corridor, to you, `TARMIZI_LINE`.
2. *The gallery.* A woman with paint on her forearms and a tin of brushes on her knee: Teoh Siew Yang. Beside her, an old man with prayer beads: her uncle, Ah Kow. Daniel sits behind them and folds nothing.
3. *Flashback, 1 Dec 1986.* `memory`. A girl at the office window, a torch on the bank, a lorry's tail lights going under black water. **Narrated**, not voiced: *"Across the yard a man's voice said: jangan tengok belakang."* Two figures, one in the water. Never a face.
4. *Jugra.* `tension`. The gate with the pink sun; Pak Itam opening it for the coroner's site visit; the ramp still running down into the Langat.
5. Branch lines (one each, `when`): `BODY_NAMED`: "In Cheras a headstone says Ong Wei Jie now"; `NOTE_FOUND`: the note from Melaka is Exhibit P7; `ARTHUR_FOUND`: Arthur's affidavit from Singapore is Exhibit P9; `TAIL_TRACED`: the plate BCK 210 leans against the exhibit table. `KHAIRUL_FREE`: Khairul in the back row, in plain clothes, "observing".
6. Title `{ kicker: 'Case 11', name: 'The Gate' }`.

```js
const TARMIZI_LINE = { who: 'Tarmizi Hassan', orig: 'Saya tulis kemalangan. Empat puluh tahun saya tulis kemalangan.', en: 'I wrote "accident". For forty years I have been writing "accident".' };
```

### Levels

| # | id | game (variant) | Evidence title | Purpose |
| --- | --- | --- | --- | --- |
| 1 | `c11_01` | wordsearch (secret) | Name torn out | The 1986 file's index. Hidden message: NAME PAGE MISSING. An inquiry of eleven minutes; "kemalangan"; the driver's statement page gone since 1987. |
| 2 | `c11_02` | series | Three metres of water | Six number runs from the 1986 tide tables, the lorry's logbook and the ramp's survey. At 2:10 AM on 1 Dec 1986 the Langat was at high spring tide: three metres at the foot of the ramp. The file says the lorry "rolled back into shallow water"; it went in nose-first, driven. |
| 3 | `c11_03` | witness (statement) | Two men on the ramp | Siew Yang, Day 1: she was fifteen, asleep in the yard office; the engine at ten past two; from the window, a torch on the bank and a man in the water at the cab door; the words across the yard; her uncle told her she dreamed it; she painted the sun in 1985. Reveals **Yang**. |
| 4 | `c11_04` | hiddenobject (silhouette, `scene: 'desk'`) | A cab door in the wall | Pak Itam's table and hut: the hut's back wall is the driver's door of a Bedford cab, painted over; its inside handle bent outward, as if somebody outside pulled against somebody inside. The old gate key on a nail. |
| 5 | `c11_05` | tape (splice) | Cut at 4:40 | The court's recording of Tuesday afternoon, cut into five and re-saved under the recording clerk's login at 4:40 PM. Restored: `TARMIZI_LINE`, and after it: he tore out the page with the driver's name in 1987 and kept the rest. The clerk: a lawyer paid him. Reveals **Shamir**. |
| 6 | `c11_06` | safecracker | Through T.A.K. | Tarmizi's police-issue document tin under his bed (four digits, the year: contains 8 and 6). The carbon of the driver's statement, name page torn away; Muthu's statement in Tamil; and the corporal's own pencil note: "Dibayar RM 2,000. 2.12.86. Melalui T.A.K." (Paid through T.A.K.) Reveals **Ah Kow**. |
| 7 | `c11_07` | witness (statement) | Every day in 1986 | Pak Itam, Day 2: the yard in 1985 and 1986; the driver "from KL with one bag and a white shirt for Sundays"; asleep on toddy at 2:10; "I saw his face every day in 1986. I have not seen it since 1987." He will not describe it. *Chairman beat (ambiguous).* |
| 8 | `c11_08` | spotdiff | The same hand | The district file's typed 1987 version against Tarmizi's carbon of the handwritten original: 2:10 became 3:00; "kelindan holding the torch" became "kelindan asleep"; "the door would not open" became "the brakes failed". The handwriting, letter for letter: the closed loop of the k, the crossed 7, the ink dragged by a left hand: the hand of "Terima kasih" and "Amended 19.8.2016". *Chairman beat.* |
| 9 | `c11_09` | ledger | The morning after the first | Two passbooks: Ah Kow's (RM 300 on the 2nd of every month since January 1987) and the Tarmizi family's (RM 1,000 a month); two cells changed by Ridzuan before the inquest. Reveals **Ridzuan**. |
| c | `c11_ar` | kakuro — `when: f => f.ARCHIVE_SEIZED` | The first page | Carton T of the Jugra archive at Bukit Aman. The oldest folder in the whole archive: "Kpl. Tarmizi Hassan, Balai Jugra. RM 2,000 (2.12.86). RM 2,000 (1.12.87)." The first official he ever bought. *Chairman beat.* |
| 10 | `c11_10` | timeline (cctv) | Nine-forty | Frames below. |
| 11 | `c11_11` | fingerprint | A thumb on the saucer | Prints on the canteen cup and saucer: Tarmizi's, Asri's (he carried the tray in), and on the underside of the saucer, Teoh Ah Kow's thumb. Siew Yang's nowhere. |
| c | `c11_nf` | fingerprint — `when: f => f.NOTE_FOUND` | The morning after | The driver rolled his left thumb on his 1986 statement at Balai Jugra. Against the Melaka note of 2 Dec 1986: the same nine points. He gave his statement on the first and borrowed the money on the second. |
| 12 | `c11_12` | interrogation | Five voice notes | **Ridzuan** (red herring). |
| 13 | `c11_13` | dialtone | Including you | Ridzuan gives up his father's phone. Tarmizi's last voice note, Tuesday 9:10 PM, records him dialling a landline (tones) and saying "Esok saya cakap semua. Termasuk awak." The number is Teoh Ah Kow's, in Banting. |
| 14 | `c11_14` | dna (mixed) | From the shrub behind the market | FRIM in Kepong, the plant lab: the seed coat in the tea is datura, *kecubung*; its profile matches the shrub behind Ah Kow's terrace, not the one by Pak Itam's hut. |
| 15 | `c11_15` | pursuit | The sketchbook | Butterworth. Wei Liang tries to sell a 1986 sketchbook to a dealer by the ferry terminal; he runs: the ferry concourse, Bagan Luar market, the old shophouse lanes, the Prai wharf, George Town across the water. In his bag, the sketchbook. "Ah Kong asked me." |
| 16 | `c11_16` | nonogram | His back, at ten past two | One water-stained page of the sketchbook, rebuilt square by square: the ramp; the cab under the water; a man in the water at the door, from behind, white singlet, wet hair; a figure on the bank with a torch; a clock face drawn in the corner at 2:10. *Chairman beat. This level answers "Why is it always ten past two?" in the Sinar File.* |
| 17 | `c11_17` | searchlight | Stripped pods | Ah Kow's back garden at night, behind the Banting wet market: a kecubung shrub with its spiny pods stripped, and a stone mortar with a grey paste in it. |
| 18 | `c11_18` | shredder | The corporal first | A copy shop on Jalan Sultan Abdul Samad, Banting, where Ah Kow had the order shredded "for privacy". Text below. |
| 19 | `c11_19` | whoslying | Day two, again | Five Tuesday statements put back to the court: Ah Kow, Shamir, Siew Yang, Pak Itam, the canteen lady Kak Ros. Liars: **Ah Kow** and **Shamir** (he lied about the witness room: he went in to offer money). |
| 20 | `c11_20` | logicgrid | Everyone at 9:40 | Solution below. |
| 21 | `c11_21` | theory | For the coroner | Points below. |
| 22 | `c11_22` | interrogation | I will keep the time | **Teoh Ah Kow** (culprit). |

Counts: 22 base, 2 conditional. `witness` twice, `fingerprint` twice (one conditional), `interrogation` twice. Batch D: tape, ledger, dialtone, pursuit, searchlight, shredder, theory, interrogation ×2.

**Clue chain.**
- *Ah Kow:* Through T.A.K. (c11_06) → The morning after the first (c11_09) → Nine-forty (c11_10 d, e) → A thumb on the saucer (c11_11) → Including you (c11_13) → From the shrub behind the market (c11_14) → The sketchbook (c11_15: "Ah Kong asked me") → Stripped pods (c11_17) → The corporal first (c11_18) → c11_19 → c11_22.
- *Ridzuan cleared:* his flask refused at the door (c11_10 c); the tea came from the canteen; FRIM (c11_14).
- *Siew Yang cleared:* in the gallery throughout (c11_10 a); no print on cup or saucer (c11_11); kopi in her flask.
- *Shamir cleared:* out of the witness room at 9:22 (c11_10 b); his crimes are the cut recording (c11_05) and the offered money (c11_19).
- *The night:* Three metres of water (c11_02), Two men on the ramp (c11_03), A cab door in the wall (c11_04), The same hand (c11_08), His back, at ten past two (c11_16), I will keep the time (c11_22). Decoys answered: the tide and the bent handle rule out failed brakes and a man alone; Siew Yang saw two men on the ramp and neither was her uncle, who was at home when the driver knocked at three (c11_22).

### Key parameters

- **c11_05 tape:** `variant: 'splice'`, `line: TARMIZI_LINE`, `pieces: 5`, `label: 'MAHKAMAH KORONER · HARI 2 · 16:40'`, clue "Every word is still there. Somebody only changed the order."
- **c11_10 timeline frames** (a to h): a `09:15` Gallery: Siew Yang sits with a flask. b `09:20` Corridor camera 2: Shamir goes into the witness room; out at 9:22. c `09:28` Corridor 2: Ridzuan offers a flask at the door; Asri shakes his head. d `09:3▮` Canteen till: two teh, one "kaw, susu lebih", cash. e `09:34` Corridor camera 4, from behind: an old man in a white shirt with a tray. f `09:36` Corridor 2: Asri takes the tray at the door. g `09:40` Witness room log: Tarmizi drinks. h `10:05` Court nurse: collapse, delirium, pupils wide.
- **c11_13 dialtone:** `number: '0331876692'`, `noise: 0.2`.
- **c11_15 pursuit:** `setting: 'docks'`, `route: ['docks', 'market', 'city', 'docks']`, `legs: 4`, `skyline: 'penang'`, `vehicle: 'foot'`, `difficulty: 'hard'`, `suspect: 'Wei Liang'`. Beats: through the ferry concourse, past Madam Ong's stall (`BODY_NAMED`: one glass of teh on her table now; otherwise two); Bagan Luar market, fish and Chinese New Year oranges; the old shophouse lanes of Butterworth; out onto the Prai wharf, Komtar and the George Town shore across the channel.
- **c11_18 shredder:** title `SINAR HOLDINGS BERHAD`, text: "OFFICE OF THE CHAIRMAN\n\nTo: T.A.K.\nSunday, 22:00\n\nThe corporal first.\nThen the girl's book.\n\nYou have kept quiet\nfor forty years.\nKeep quiet for four days.\n\nNothing on the phones.", `strips: 10`, `flips: true`, `stamp: 'PRIVATE'`.
- **c11_20 logicgrid.** Person: Ah Kow, Siew Yang, Ridzuan, Shamir, Pak Itam. Location: the corridor by the toilets / the gallery / the car park / the robing room / the court surau. Holding: a tray / a flask of kopi / his father's flask / an envelope / a prayer mat. Solution: Ah Kow, corridor, tray; Siew Yang, gallery, kopi; Ridzuan, car park, his father's flask; Shamir, robing room, envelope; Pak Itam, surau, prayer mat.
- **c11_21 theory**, `need: 3`. `who` Teoh Ah Kow poisoned Tarmizi. `how` Kecubung (datura) seeds in canteen teh, carried in on a tray. `why` Tarmizi was going to say that Ah Kow paid him in 1986 (or the Office's order "The corporal first"). `1986` Ah Kow paid the corporal to write "accident" and signed the yard over, his debts forgiven.
- **c11_12 Ridzuan** (`voice_2`). Lies: "My family never took a sen from Sinar" (by *The morning after the first*); "I gave Abah his breakfast myself" (by *Nine-forty*, frame c); "Abah kept nothing from 1986" (by *Through T.A.K.*: the tin under his bed). Secret: he deleted his father's voice notes because they named the money, and he hid the phone. Evidence on solve: *Five voice notes*.
- **c11_22 Ah Kow** (`voice_3`). Persona: soft, Hokkien and Malay, beads in his fingers, calls the dead man "A-hia" (elder brother) and never names the driver; "aiya" when cornered. Lies: "I never knew the corporal" (by *Through T.A.K.* or *Including you*); "I never left the gallery" (by *A thumb on the saucer*); "There is no kecubung in my garden" (by *Stripped pods*); "My brother's brakes failed" (by *Three metres of water* or *His back, at ten past two*). Secret: as the truth above. Evidence on solve, *I will keep the time*: "At three o'clock he came to my door wet to the knees, with A-hia's watch in his hand. He said, your debts are finished; tell them it was the brakes. He gave me the watch to hold. Then he took it back. He said: I will keep the time." *Chairman beat.*

### Deduction

`lede`: "The coroner cannot charge anyone; Hamidah can. She will charge whoever you name with the attempted murder of Tarmizi Hassan. Name everyone who poisoned him, and only them."
Extra question `night`: "What happened at Jugra at 2:10 AM on 1 December 1986?" short "The coroner finds". `lede`: "The coroner will write one finding into a file that was closed in eleven minutes. It will not be opened a third time." Options:

| id | label | note |
| --- | --- | --- |
| `brakes` | The brakes failed, and Teoh Ah Chuan drowned in his own lorry | The finding of 1986. |
| `held` | The man who drove for Teoh held the cab door shut under the water, while Muthu held the torch | A girl at a window, a bent handle, a drawing. |
| `brother` | Teoh Ah Kow let the handbrake off, for his debts | He identified the body and took the money. |
| `suicide` | Teoh drove into the river himself | A man with debts, at the bottom of his own yard. |

`outcomes.correct: ['ahkow']`. Charged lines: Ah Kow "is arrested in the gallery with his beads in his hand. He asks his niece to light a joss stick for her father on the eve of the new year. She does not answer." Siew Yang "is charged; she puts her brushes on the dock rail and does not look at her uncle." Ridzuan "is charged; his tow truck is taken off the road outside the court." Shamir "is charged; Sinar's statement says he acted alone, which nobody in the court believes, including the coroner."

### Flags

- **Reads:** `NOTE_FOUND` (c11_nf, opening), `ARCHIVE_SEIZED` (c11_ar), `ARTHUR_FOUND`, `TAIL_TRACED`, `BODY_NAMED` (opening, pursuit beat, ending), `KHAIRUL_FREE` (opening), `WAS_HELD`, `DNAA` (Daniel's lines), `GOH_BOX_FOUND` (optional ending line: Henry Goh's carton has a 1986 file card for "Teoh A.C., drowning, dental: identified by brother"; only if found).
- **Sets:** `flagNames: ['AHKOW_FREE', 'YANG_WRONGED', 'RIDZUAN_WRONGED', 'SHAMIR_WRONGED', 'GATE_TRUTH', 'GATE_WRONG']`; `GATE_TRUTH: answers.night === 'held'`, `GATE_WRONG: answers.night !== 'held'`.

### Ending (panels)

1. *Shah Alam. Thursday, 5 PM.* `resolution`. Charged lines.
2. The finding. `GATE_TRUTH`: "Unlawful killing by the driver of BCK 210, a man whose name was torn out of the file in 1987, in the presence of Muthusamy a/l Perumal, deceased." The coroner reads it in eleven minutes, on purpose. If `ahkow` charged: Tarmizi, in a wheelchair, adds his evidence. `GATE_WRONG`: (wrong finding line), the file closes again.
3. *Jugra. Thursday dusk.* Siew Yang (if not `YANG_WRONGED`) at the gate with her brushes. `GATE_TRUTH`: under the pink sun she paints, in small black letters, TEOH AH CHUAN 1934–1986. Pak Itam holds the ladder and looks at the ground. `GATE_WRONG`: she paints nothing; she sits on the ramp until dark.
4. *Butterworth / Brickfields.* Daniel folds a kancil from the coroner's cause list and puts it on the exhibit table beside the watch photograph. `BODY_NAMED`: "Madam Ong sets out one glass of teh." 
5. *Brickfields. Friday 5 February, the eve of the new year, 2:10 AM.* `chairman`. Bala's phone; the shutter down. The Chairman: "You found my first night, detective. Thank you." A lid. "On the fifteenth night of the new year, come to the gate. Bring the plate."

### Chairman beats (exactly this)

The 1986 night: he drove for Teoh; he held the door; Muthu held the torch; "Jangan tengok belakang" to Muthu (narrated, never voiced). Why ten past two (c11_16). "I will keep the time" (c11_22). His statement in the same left-handed hand, the name page torn out (c11_08). From KL in 1985, four languages (c11_07 and truth lines). The sun on the gate was the girl's (c11_03). `ARCHIVE_SEIZED`: the first official he bought (c11_ar). `NOTE_FOUND`: the statement thumb and the loan thumb are one man (c11_nf). Pak Itam saw his face every day in 1986 and will not describe it (c11_07). **Sinar File threads:** *Don't look back* (c11_03), *Ten past two* (c11_16), *The same hand* (c11_08), *I will keep the time* (c11_22). The UNKNOWN "Why is it always ten past two?" closes with c11_16.

### Hook and teaser

`COMING_SOON` for Case 12: "On the fifteenth night of the new year, at ten past two, a black car with no plates will stop at a gate with a pink sun painted on it. He has asked you to come, and to bring the plate. Farah says she will be there first. Daniel says you will both be late. For forty years nobody has seen his face. By morning somebody will have to write a name on a form."

### New speakers

Teoh Siew Yang (f, 55, Penang Hokkien/English), Tarmizi Hassan (m, 66, Selangor Malay), Teoh Ah Kow (m, 74, Selangor Hokkien/Malay), Pak Itam (existing from Case 8), Hamidah Yusof (f), Shamir Kassim (m, 44) and Ridzuan (m, 38) if they speak in panels. Existing: Daniel Raj, Inspector Farah Iskandar, Madam Ong, The Chairman. Voice overrides: Malay `lang` for Tarmizi; Hokkien stays romanised (e.g. Siew Yang: "A-pa bo tng lai." with `lang: 'zh-hokkien'`).

---

## Case 12: Unknown Male (`case12`)

**Header.** `id: 'case12'`, `number: 12`, `title: 'Unknown Male'`, `place: 'Jugra and Kuala Lumpur'`, `hints: 8`.
`victim`: "A man in a white shirt, about seventy-five, no name. Found in the back seat of a burned black car at the Jugra gate at 2:25 AM on Sunday."
`question`: "Who killed the man in the back seat?"
`brief`: "He asked you to come to the gate at ten past two on the fifteenth night of the new year and to bring the plate. You were late. The black car was burning under the pink sun, and in the back seat, behind the driver, sat a man in a white shirt with a lighter in his fist. By noon Sinar's lawyers want a death certificate. By noon the papers want a name."
`mapIntro`: "Every puzzle gives up one exhibit. Two questions wait at the end: who killed the man in the back seat, and what Hamidah writes on the form. Nobody will tell you if you get either of them right. This time nobody can."
`finalLabel: 'Name them'`.

**Where and when.** Sat 20 Feb 2027 (Chap Goh Meh night) to Wed 24 Feb 2027, 2:10 AM. The Jugra gate, the yard, the oil palm around it, the lighthouse road on Bukit Jugra; the old Klang to Banting road (Jenjarom, Kanchong Darat); the forensic department, Hospital Kuala Lumpur (Dr. Lim Siew Ping); Menara Sinar, Basement 2 (Bay V1 and, behind a roller shutter, Bay V2); Leong Brothers Tailor; Bukit Aman (D9); Sungai Buloh (conditional); the public cemetery at Cheras; Restoran Bala.

**Music (`theme_case12`).** Funeral noir: low strings held like a breath, a single nadaswaram phrase very far away, Chap Goh Meh firecrackers muffled by distance, and the snap of a lighter's lid used as the only percussion. The `chairman` cue closes the season.

### Truth (writers only)

- **The plan.** The Office summoned three people to the gate for 2:10: the detective (Case 11's call: "bring the plate"), **Tan Sri Azhar** (a typed card: "Ten past two. The gate. Drive me last."), and **Nurul Ain** (a typed card under her door: "Ten past two. The gate at Jugra. Bring your camera."). It wanted a credible witness, an ambitious man and a journalist at a death.
- **The dead man.** About seventy-five; white shirt (Leong's, made in December "for a long journey"); a cravat hiding an old, healed **laryngectomy stoma**: he had no voice; he has spoken to nobody in this game. A lighter in his left fist (a silver flip-top with a small brass sun on the lid; **not** the D.R. lighter, which is in evidence since Case 6), so his left thumb survived the fire. In his breast pocket, scorched, a typed card: the nine rules from Case 8 and a tenth, typed: "10. Whoever drives me last." His mitochondrial DNA matches the grey hair from 1 December (Case 8). His left thumb matches the 1987 deed on nine points of sixteen. His teeth have never been treated by anyone who kept a record. Sedated (temazepam in his blood), then smothered with the back-seat cushion at about 1:56; dead before the fire (no soot in his airway).
- **Two cars.** There are two identical black cars and two keys. Car A left Bay V1 at **0:50** with one passenger in the back. Car B left Bay V2, behind a roller shutter on B2, at **1:20** (only `JASON_FREE` players learn who drove it and where it went).
- **The culprit: Sjn. Mohd. Asri bin Ghazali**, 38, Farah's sergeant. On Sinar's figure since 2019 (RM 3,000 a month; his folder sat in carton A of the Jugra archive). Farah ordered him to watch Bay V1 that night and report. He **drove** Car A himself: picked it up in V1 at 0:45 with the passenger already in the back, drove the old Klang to Banting road (no tolls, few cameras; Jenjarom camera at 1:34), reached the gate at **1:50** (Pak Itam, told by phone at 1:00, opened it and looked at the ground). At 1:56 he smothered the passenger. At **2:01** he keyed his police radio to tell Farah he had "lost the car at Jenjarom"; the burst of his handset's ID was recorded by the car's own recorder. At 2:05 he walked into the oil palm with a petrol can, at 2:08 lit a flare and threw it into the front footwell, walked 300 metres to his motorbike, and at 2:34 "arrived" from the Jenjarom road. Paid RM 250,000 into his wife's account on Friday 19 Feb. The printed order in his locker: "The car first. Then the certificate."
- **Red herring 1: Tan Sri Azhar Kamaruddin**, 68. Summoned to "drive him last", he believed the letter of wishes (Arthur's recital is public if `ARTHUR_FOUND`; otherwise Clarissa's copy reached him through the board) and came, in his own Mercedes, to be the last driver and the next Chairman. He asked the way at a Jenjarom petrol station at 2:12, reached the gate at 2:20, saw the fire, and fled. *Cleared by:* the passenger was dead at 1:56 and the fire lit at 2:08 while Azhar was at Jenjarom (c12_04, c12_18); no palm mud on his shoes; his summons card (c12_11).
- **Red herring 2: Pak Itam**, 74. He opened the gate; he was told; he knows 1986. *Cleared by:* he never left the gate post (Ain's frames), his hut phone called Bomba at 2:16, and his hands, swollen with arthritis, could not hold a cushion over a man's face for two minutes (Dr. Lim) (c12_02, c12_06).
- **Red herring 3: Nurul Ain**, 27. Tipped by card; hid in the palms 20 metres away; photographed the car at 1:52 (interior light on: a driver in a cap and a navy police raincoat with the reflective tape torn off, face turned away; the passenger upright) and at 2:05 (the driver walking into the palms with a can; the passenger slumped); ran when she saw the can. Her trainer prints run away from the car. Her father fell from Level 14; she has said she would expose the Chairman "if it is the last thing I do". *Cleared by:* her own photographs and their times (c12_06).
- **The second question.** What does the death certificate say? Answer: **"Unidentified male, about seventy-five."** Every other option claims more than the evidence can carry. Hamidah: "Write only what you can prove. Henry Goh wrote 'match' once."

### Suspects

| id | Name | Age | Background | Voice | revealedBy |
| --- | --- | --- | --- | --- | --- |
| `itam` | Pak Itam (Ibrahim bin Sulong) | 74 | Watchman at the Jugra yard since 1985 (§5). | Male, Kuala Langat Malay; `voice_3` | `c12_02` |
| `ain` | Nurul Ain | 27 | Freelance journalist (Case 5 and 7). Reuse `sus_ain`. | Female; existing speaker; `voice_1` | `c12_03` |
| `azhar` | Tan Sri Azhar Kamaruddin | 68 | Group MD of Sinar Holdings (or off the board if `AZHAR_WRONGED`). Reuse `sus_azhar`. | Male; existing speaker; `voice_2` | `c12_04` |
| `asri` | Sjn. Mohd. Asri bin Ghazali | 38 | Farah's sergeant, D9 (§5). New portrait `sus_asri`. | Male, Kelantan Malay, quiet, "Puan" to Farah; `voice_3` | `c12_07` |

`revealLine`s: Pak Itam, "He opened the gate at ten to two for a car he was told not to look at." Ain, "Running shoes in the palms, twenty metres from the car, running away." Azhar, "A Mercedes asked the way to Jugra at 2:12, and the man at the wheel had a white moustache." Asri, "Handset forty-one keyed its radio at 2:01, close enough for the car to hear it."

### Opening (panels)

1. *Brickfields. Saturday, Chap Goh Meh, 11:50 PM.* `office`. Oranges and firecrackers in the street; Bala Anne's shutter half down. Bala Anne: "Thambi. Poga vendaam." (reuse the exact Case 7 line). Farah on the phone to Asri: "Watch V1. Tell me when it moves." The plate BCK 210 on the back seat of Farah's car.
2. *0:52 AM.* Asri on the radio: "Kereta dah keluar dari V1. Satu penumpang. Saya ikut dengan motor." (The car has left V1. One passenger. I'm following on the bike.) You and Farah leave Brickfields at 1:40. Daniel: "You will both be late."
3. *Klang to Banting road. 2:01 AM.* Asri on the radio: "Puan, saya hilang dia di Jenjarom." (I lost him at Jenjarom.)
4. *The Jugra gate. 2:25 AM.* `fire`. The pink sun lit from below; the black car burning inside the gate; Pak Itam with a bucket he has not used; Bomba's lights coming down the road.
5. *Dawn.* `tension`. Rosli, in yesterday's uniform, at the open back door: a man in a white shirt behind the driver's seat, a lighter in his left fist. Rosli: "He was dead before the fire, Tuan. Look at his mouth. No soot."
6. *2:34 AM (a flashback inside the panel).* Asri on his motorbike from the Jenjarom road, helmet off: "Puan. Maaf. Saya hilang dia." (Sorry. I lost him.)
7. *Hamidah, 7 AM.* "Sinar's lawyers have asked for a death certificate by noon. Bursa has asked for a name. I have asked for neither."
8. Title `{ kicker: 'Case 12', name: 'Unknown Male' }`.

### Levels

| # | id | game (variant) | Evidence title | Purpose |
| --- | --- | --- | --- | --- |
| 1 | `c12_01` | wordsearch (secret) | Dead before the fire | Rosli's list of what survived. Hidden message: DEAD BEFORE THE FIRE. No soot in the mouth; the fire started in the front footwell. |
| 2 | `c12_02` | witness (statement) | The gate at one-fifty | Pak Itam: a call at 1:00, "open at ten to two, do not look at the driver"; one car, a driver in a cap, a passenger in white; he looked at the ground; at ten past two the light; he rang Bomba at 2:16; at twenty past two a big car stopped at the gate and drove away again. Reveals **Pak Itam**. |
| 3 | `c12_03` | footprint (classic) | Running shoes in the palms | Trainer prints 20 metres from the car, running away toward the lighthouse road. A woman's size; Ain's brand. Reveals **Ain**. |
| 4 | `c12_04` | lineup (single) | Asking the way to Jugra | The Jenjarom petrol station attendant picks Tan Sri Azhar: 2:12 AM, a Mercedes, "Which way to the old Sinar gate?" Reveals **Azhar**. |
| 5 | `c12_05` | nonogram | The car records itself | Under the back seat, a fireproof box: the car's own recorder (one more rule nobody wrote down: every drive is recorded; your drive of 1 December is on it). The chip survived. |
| 6 | `c12_06` | spotdiff | Two frames from the palms | Ain's photographs at 1:52 and 2:05: the driver in a cap and a navy police raincoat, reflective tape torn off, face away; the passenger upright, then slumped; Pak Itam at the gate post in both. |
| 7 | `c12_07` | tape (spectro) | Handset forty-one | The recorder's last minutes: the fire's hiss, and at 2:01, inside the car, the burst a police handset sends when its key is pressed: D9-HT-41. D9's handset 41 is issued to Sjn. Mohd. Asri. Reveals **Asri**. |
| 8 | `c12_08` | hiddenobject (silhouette, `scene: 'desk'`) | No voice | Dr. Lim's steel table: the cravat; under it an old, healed laryngectomy stoma ("He has not spoken with his own throat for ten years or more"); Leong's label in the collar; the brass-sun lighter; the scorched card with ten rules. *Chairman beat.* |
| 9 | `c12_09` | dna (mixed) | His mother's line | His nuclear DNA matches nothing anywhere. His mitochondrial DNA matches the grey hair from the back seats on 1 December: him, or a brother, or anyone born of his mother's line. *Chairman beat.* |
| 10 | `c12_10` | fingerprint | Nine points | His left thumb, kept by his fist, against the 1987 deed (and the 1986 note if `NOTE_FOUND`): nine points of sixteen. Dr. Lim: "Consistent. Not conclusive. In this country, not a name." *Chairman beat.* |
| c | `c12_dy` | morse (audio) — `when: f => !f.DESMOND_FREE` | No breath | Desmond Yap listens to the recorder in Sungai Buloh. On it, at 1:55, a ring tapped on the window glass: TOLONG (help). "That is not the man in my ear. He breathes in before every sentence. This one had no breath to speak with." |
| 11 | `c12_11` | interrogation | The summons | **Tan Sri Azhar** (red herring). |
| 12 | `c12_12` | getaway | Two cars, two keys | Menara Sinar, B2: Raja, the old car-park attendant, opens the roller shutter behind V1: Bay V2, a second sun painted on the floor, a second black car with no plates boxed in by the directors' cars. Its engine still warm on Sunday. "One went out at ten to one with a policeman's walk at the wheel. The other went at twenty past one, and I did not see who was in it." *Chairman beat.* |
| 13 | `c12_13` | witness (statement) | It fits him | Leong Kam Wah at HKL, shown the collar: "It is my shirt. I made it in December for the man I have measured in the dark for forty years. It fits this man the way it would fit him. I could not swear to a face. I could swear to a collar." *Chairman beat.* |
| c | `c12_jx` | chase (one-way) — `when: f => f.JASON_FREE` | From the lighthouse road | WXY 1408 one last time, through the one-way streets of Brickfields. Jason drove car B: at 1:20 from V2, one passenger in the back, to the lighthouse road on Bukit Jugra, window down; they watched the gate burn at ten past two, and came back. "He said thank you. He always says thank you." |
| 14 | `c12_14` | ledger | Overtime | D9's duty sheet (Asri "surveillance, B2, all night", written in after the fact) and his wife's account: RM 250,000 on Friday 19 Feb from a Sinar Cold Chain "consultancy". |
| c | `c12_ar` | kakuro — `when: f => f.ARCHIVE_SEIZED` | Carton A | The sign-out sheet for carton A at Bukit Aman: on 3 Dec 2026 one folder taken out by Sjn. M. Asri and never returned. The index card is still there: "Asri, M. RM 3,000 a month since 2019." |
| 15 | `c12_15` | shredder | The car first | The shredder by Asri's locker at Bukit Aman. Text below. |
| 16 | `c12_16` | footprint (classic) | Three hundred metres | Police-issue patrol boots in the palm-estate mud, from the car's driver's door to a motorbike stand in the palms, with petrol in the prints. Asri's boots. |
| 17 | `c12_17` | searchlight | A strip of tape | The motorbike stand among the palms at night, lit by Rosli's lamps: an empty jerry can, a spent flare case, a strip of reflective tape torn from a police raincoat. |
| 18 | `c12_18` | timeline (cctv) | Bay V1 to the gate | Frames below. |
| 19 | `c12_19` | whoslying | Five at the gate | Statements: Asri, Azhar, Ain, Pak Itam, the Bomba driver Zaki. Liars: **Asri** and **Azhar** (he lied that he was never at Jugra). Ain's `fact`: "I photographed the car at 1:52 and 2:05" (her camera's clock, checked against the Bomba log). |
| 20 | `c12_20` | logicgrid | Everyone at 2:01 | Solution below. |
| 21 | `c12_21` | theory | For the prosecutor | Points below. |
| 22 | `c12_22` | interrogation | He will not speak | **Asri** (culprit). |

Counts: 22 base, 3 conditional; `witness`, `footprint` and `interrogation` twice each. Batch D: tape, getaway, ledger, shredder, searchlight, theory, interrogation ×2. No pursuit.

**Clue chain.**
- *Asri:* Two frames from the palms (c12_06: a police raincoat) → Handset forty-one (c12_07) → Overtime (c12_14) → The car first (c12_15) → Three hundred metres (c12_16) → A strip of tape (c12_17) → Bay V1 to the gate (c12_18) → c12_19 → c12_22; conditional c12_ar.
- *Azhar cleared:* at Jenjarom at 2:12 (c12_04), after the passenger died (1:56) and the fire was lit (2:08); no palm mud; the summons (c12_11).
- *Pak Itam cleared:* at the gate post in both of Ain's frames (c12_06); his call at 2:16 (c12_02); Dr. Lim on his hands, too swollen to hold a cushion for two minutes (put it in c12_08's text).
- *Ain cleared:* her prints run away from the car (c12_03); her frames and their times (c12_06, c12_19).
- *The certificate:* No voice (c12_08), His mother's line (c12_09), Nine points (c12_10), Two cars, two keys (c12_12), It fits him (c12_13): every exhibit stops one step short of a name. Hamidah's rule, "Write only what you can prove", is the key.

### Key parameters

- **c12_07 tape:** `variant: 'spectro'`, `answer: 'D9-HT-41'`, `noise: 0.7`, `decoys: 3`, `label: 'CAR RECORDER · 21 FEB · 02:01'`, clue: "A police handset signs every press of its key with its own number. If it was close enough, the car heard it."
- **c12_15 shredder:** title `SINAR HOLDINGS BERHAD`, text: "OFFICE OF THE CHAIRMAN\n\nTo: M.A.\nFriday, 23:00\n\nBay V1 at 0:45.\nThe gate at 1:50.\n\nThe car first.\nThen the certificate.\n\nNothing on the phones.", `strips: 10`, `flips: true`, `stamp: 'PRIVATE'`.
- **c12_18 timeline frames** (a to h): a `00:45` Asri's radio: "Car still in V1." b `00:50` B2 barrier: fob V1 out. c `01:34` Jenjarom junction camera: a black car with no plates, southbound. d `01:50` Pak Itam's hut phone log: none; the gate chain off (Ain's first frame shows it open). e `01:52` Ain's camera: interior light, a driver in a raincoat, a passenger upright. f `02:01` Car recorder: handset D9-HT-41 keyed. g `02:08` Car recorder: a flare's hiss, then fire. h `02:3▮` Bomba log: "a police sergeant arrives by motorbike from the Jenjarom road".
- **c12_20 logicgrid.** Person: Asri, Azhar, Ain, Pak Itam, You. Location: beside the black car / the Jenjarom road / the oil palm, 20 m away / the gate post / the Banting road, northbound. Holding: a police handset / a summons card / a camera / the gate chain / the plate BCK 210. Solution: Asri, beside the car, handset; Azhar, Jenjarom road, summons; Ain, the palms, camera; Pak Itam, gate post, chain; You, Banting road, the plate.
- **c12_21 theory**, `need: 3`. `who` Sergeant Asri killed the passenger, smothering him in the back seat before the fire. `fire` Asri set the car on fire (petrol and a flare) to burn the body and make it look like an attack on the Chairman. `order` The Office of the Chairman ordered it and paid him ("The car first. Then the certificate." / RM 250,000). `voice` The dead man could not speak (no larynx), so he cannot be the voice on the telephone.
- **c12_11 Azhar** (`voice_2`). Persona as in Case 7: composed, a voice reading minutes, "Inspector" and "detective"; does not lean back in his chair. Lies: "I was at home in Damansara Heights all night" (by *Asking the way to Jugra*); "I have never been to that gate in my life" (by *The gate at one-fifty*: Pak Itam saw a big car stop at the gate at twenty past two and drive away); "I know nothing of any letter of wishes" (by *No voice*: the tenth rule). Secret: the summons card; he came to be the last driver and the next Chairman, saw the fire, and ran. Evidence on solve, *The summons*: the card: "Ten past two. The gate. Drive me last." "I wanted to sit in the chair," he says again. "Somebody knew that before I did."
- **c12_22 Asri** (`voice_3`). Persona: quiet, polite, Kelantanese; "Puan" to Farah, "Tuan" to the detective; dialect when cornered ("Gapo demo nok?"). Lies: "I lost the car at Jenjarom at 1:40" (by *Handset forty-one*); "I was on surveillance at B2 all night" (by *Overtime*); "I have never taken a sen from Sinar" (by *Overtime*, or *Carton A*); "I never wear the raincoat on a dry night" (by *Two frames from the palms* or *A strip of tape*). Secret: he drove car A from V1, smothered the passenger at 1:56, lit the fire at 2:08, walked to his bike; RM 250,000 and the folder; the printed order. Evidence on solve, *He will not speak*: "They told me he was the Chairman. I asked how I would know him. They said: he will not speak. He did not speak. He tapped on the window, twice, and then he stopped." He has never seen the face of the man who sends the orders either.

### Deduction

`lede`: "Farah will arrest whoever you name for the murder of the man in the back seat. She asks you, very quietly, to be sure. Name everyone who killed him, and only them."
Extra question `cert`: "What does the death certificate say?" short "Hamidah writes". `lede`: "Hamidah Yusof puts the burial permit from Hospital Kuala Lumpur on the table. Somebody must write a name in the box, or the word that means nobody knows. Whatever she writes will be on the front pages by noon, and on a grave by Friday." Options:

| id | label | note |
| --- | --- | --- |
| `chairman` | The Chairman of Sinar Holdings | The man whose thumb is on the 1987 deed, on nine points of sixteen. |
| `brother` | The Chairman's brother | His mother's line matches the hair from the back seat on 1 December. |
| `double` | Another stand-in, like Muthu | He could not speak. The voice still can. |
| `unknown` | Unidentified male, about seventy-five | Exactly what the evidence will carry, and no more. |

`outcomes.correct: ['asri']`. Charged lines: Asri "is arrested by Farah herself, in the D9 office, in front of the board where he pinned your photographs. She takes his handset off his belt and lays it on the desk. Neither of them says anything." Azhar "is arrested at his house in Damansara Heights for the second time this season, and asks for the same lawyer." Pak Itam "is charged; the gate at Jugra is chained by the police, and for the first time since 1985 nobody keeps it." Ain "is charged; she gives her camera to Farah and asks her to keep the card safe."

### Flags

- **Reads:** `DESMOND_FREE` (c12_dy), `JASON_FREE` (c12_jx), `ARCHIVE_SEIZED` (c12_ar), `NOTE_FOUND` (c12_10), `ARTHUR_FOUND` (how Azhar knew the clause; ending), `AZHAR_WRONGED` (his title), `CLARISSA_FREE` (ending: the trustee), `VOICE_TRACED` (ending: the open charge), `GATE_TRUTH` (ending: the gate's painted name), `YANG_WRONGED` (whether Siew Yang is at the burial), `ROSLAN_FREE`, `KHAIRUL_FREE` (ending lines), `WAS_HELD`, `DNAA` (Daniel), `BODY_NAMED` (the burial at Cheras, near Wei Jie's headstone).
- **Sets:** `flagNames: ['ASRI_FREE', 'AZHAR_WRONGED_12', 'ITAM_WRONGED', 'AIN_WRONGED_12', 'CERT_UNKNOWN', 'CERT_SIGNED', 'CHAIRMAN_DECLARED_DEAD']`; `ASRI_FREE: !charged.includes('asri')`, `AZHAR_WRONGED_12: charged.includes('azhar')`, `ITAM_WRONGED: charged.includes('itam')`, `AIN_WRONGED_12: charged.includes('ain')`, `CERT_UNKNOWN: answers.cert === 'unknown'`, `CERT_SIGNED: answers.cert !== 'unknown'`, `CHAIRMAN_DECLARED_DEAD: answers.cert === 'chairman'`.

### Ending (panels)

1. *Bukit Aman. Tuesday, 4:30 AM.* `resolution`. Charged lines. `ASRI_FREE`: instead, a line that Asri drives Farah home and carries her bag up the stairs.
2. *Hospital Kuala Lumpur. Tuesday.* The form, by answer. `unknown`: Hamidah writes "Tidak dikenali. Lelaki, lebih kurang 75 tahun." (Unidentified. Male, about seventy-five.) "Henry Goh wrote 'match' once. Not on my desk." `chairman`: she writes it, slowly, and initials it. `brother` / `double`: she writes it, then crosses it out and writes it again because you asked her to; she says she will regret it.
3. *Bursa Malaysia / Menara Sinar.* `CHAIRMAN_DECLARED_DEAD`: Sinar announces with deep regret the death of its Chairman; the share price rises eleven sen; Sinar's lawyers (Clarissa Seah's firm if `CLARISSA_FREE`) write to the court that, under the 1987 deed as amended, the Trust is to be directed by whoever drove him last: "on the evidence, Sergeant Asri; or, the court may find, on the first of December, you." Hamidah's charge against the user of 011-2604 1986 abates with the death (`VOICE_TRACED`). Otherwise: Sinar tells Bursa that its Chairman is well and will not take questions; the charge sheet against "a person unknown" stays open (`VOICE_TRACED`), and the line under "and abetment by" stays blank (`VOICE_LOST`).
4. *Cheras public cemetery. Tuesday, 5 PM.* The unknown man is buried in a numbered plot. Bala Anne brings a garland. Pak Itam stands at the gate (unless `ITAM_WRONGED`). Siew Yang (unless `YANG_WRONGED`) paints the plot's number on its board herself. `BODY_NAMED`: two rows away, the headstone that says Ong Wei Jie. `CERT_UNKNOWN`: Daniel folds a kancil from a copy of the burial permit and leaves it on the earth. `CERT_SIGNED`: Daniel does not fold anything. `ROSLAN_FREE`: at the cemetery gate a black Land Cruiser idles three lengths behind nobody. `KHAIRUL_FREE`: Khairul gives the press a statement about "the end of a long chapter".
5. Farah and you on the steps of Restoran Bala at midnight. `ASRI_FREE`: she says Asri has asked for leave. Otherwise: "Four years he sat in my car." Bala Anne pulls the shutter down at 1:15 and goes up to bed (keep him off screen after this).
6. *Brickfields. Wednesday 24 February, 2:10 AM.* `chairman`. A second black car with no plates stops outside Restoran Bala. The engine running. This time the **back** door is open. From the driver's seat, the voice: "Good evening, detective. Not the front. Tonight I drive." Then one line by answer: `unknown`: "You would not sign. Henry Goh would have. That is why I chose you." `chairman`: "You signed. Thank you. Now nobody is looking for me except you." `brother` / `double`: "You were nearer than the others. Not near enough." You get into the back. The car moves.
7. *The same car, Jalan Tun Sambanthan.* No new line of dialogue. He reaches up and tilts the rear-view mirror until it holds your eyes and his. The reading light comes on. "You may look in the mirror as often as you like, detective." You look. Then black. Final title panel: `{ title: { kicker: 'Floor 14', name: 'End of Season Two' } }`.

**Hard rule for panels 6 and 7:** no face, no reaction that gives one away, no word from you. Do not say whether you know him. Do not show Bala Anne, Uncle Wong, Tan Sri Azhar or Pak Itam anywhere after 1:30 AM on Wednesday. The image for panel 7 is the mirror strip only: a pair of eyes that are the detective's, the reading light, a white cuff on the wheel.

### Chairman beats (exactly this)

Three summonses to the same gate (opening, c12_11, Ain's card). The dead man: no larynx (c12_08); nine points (c12_10); his mother's line (c12_09); Leong's collar (c12_13); the tenth rule, "Whoever drives me last" (c12_08); dead before the fire. Two cars, two keys (c12_12). `JASON_FREE`: someone watched from the lighthouse road and said thank you (c12_jx). `!DESMOND_FREE`: "This one had no breath to speak with" (c12_dy). The voice on Wednesday (ending). Nothing else: not whether the dead man was him, not whose face the mirror holds. **Sinar File threads:** *No voice* (c12_08), *His mother's line* (c12_09), *Nine points* (c12_10), *Two cars* (c12_12), *Unknown male* or *Declared dead* (ending), *The mirror* (ending). New unknowns: "Who is buried in plot N at Cheras?"; "Who was the other man in the back?"; "Whose eyes were in the mirror?"

### Teaser after the season

`COMING_SOON` after Case 12: title `'Season Three'`, teaser: "He let you look. Somewhere south of the city a black car with no plates is driving with its mirror turned the wrong way, and for the first time in forty years the man at the wheel does not mind being seen. Floor 14 will return."

### New speakers

Dr. Lim Siew Ping (f, 50s, HKL pathologist, KL English) if she speaks in a panel; Raja, the B2 car-park attendant (m, 63, KL Tamil-English) if he speaks; Bomba driver Zaki (only in the whoslying level). Existing: The Chairman, Inspector Farah Iskandar, Bala Anne, Daniel Raj, Hamidah Yusof, Sjn. Asri, Pak Itam, Leong Kam Wah, Nurul Ain, Tan Sri Azhar, Fire Officer Rosli. Voice overrides: Malay `lang` for Asri's radio lines and Hamidah's form.

---

## §P Private notes (for the owner)

Writers: read this only so that you do not settle anything. Nothing in this section goes into a case file.

### What Season Two deliberately leaves open

1. **Who the Chairman is.** No name, no face, no relative, no link that pins him to anyone.
2. **Whether the voice and the man are one person.** Season Two adds evidence on both sides: the escort's "some nights there are two in the back" (Case 8), the Case 7 car "with two people in the back", two black cars and two keys (Case 12), and a dead man with no voice who has the founder's thumb on nine points and the voice's mother's line. Two readings stay open:
   - **A.** The dead man was the founder: the man who drove Teoh's lorry, borrowed the Chettiar money and signed the trust. He lost his voice years ago, and the voice everyone hears is his brother, or his heir, who goes on.
   - **B.** The voice is the founder. The dead man was a voiceless brother (or cousin of his mother's line) kept as a body for exactly this night, and the founder watched him burn from the lighthouse road.
3. **Whose face is in the mirror** at the end of Case 12. The detective sees it; the player does not; the text never says whether the detective knew it.

### Facts any final answer must fit (canon by the end of Case 12)

- Took Teoh Ah Chuan's yard on 1 Dec 1986 by drowning him; came to Jugra from Kuala Lumpur in 1985; drove the lorry BCK 210; Muthu was his attendant from November 1986 and his driver for forty years.
- Speaks Hokkien, Tamil, Malay and English (1986); writes left-handed (1986 statement, 2016 envelope, 2026 rules card); signed the 1986 note and the 1987 deed with a left thumb (nine clear points known).
- A slim man in a cap in 1986 (the shadow); about 1.70 m sitting height on a 2026 headrest; collar 15½; right cuff wider for a watch.
- Smokes; hums Getaran Jiwa; uses the street names of KL before about 1980; never crosses water (by his own word, 1987).
- Rode behind the driver's seat from 2:10 to 3:44 AM on 1 Dec 2026 and spoke live, so whoever he is, at that time he had a voice (unless reading B and the live man was the voice, not the founder).
- Shares a maternal line with the man who died at the gate on 21 Feb 2027.
- Has watched the detective since 2016; chose them as "new driver" as the one believable witness.
- At the Bay 3 fire in 2021 and at Muthu's cremation in 2026, in person.

### The candidates the season keeps alive, and what fits each

| Candidate | What fits | What has to be explained |
| --- | --- | --- |
| **Uncle Wong** (Wong Kam Fatt, 68, Menara Sinar's lift engineer since 1997) | Right age (28 in 1986). Knows Level 14 and the hand-filed "14" on Lift 7's key switch since 1997; knows there were two keys. Nobody has placed him anywhere during the Case 7 speech; he was "called in from Cheras" after midnight. He will not get out of Lift 7 on Level 14. "Sap sei. Sat sei." He is Cantonese, and the 1986 driver spoke Hokkien, which a KL Cantonese man of his age may well. Never shown with a cigarette, a pen or a watch. | Why a lift engineer: the tower opened in 1997 and he chose the one job that keeps its secrets. How he speaks Tamil (Brickfields childhood?). |
| **Bala Anne** (60s, Restoran Bala, Brickfields) | The telescope on Level 14 points at his restaurant. Table six and table seven are his tables. The BALA line is tapped (a man who listens to everyone would tap his own line to look like a victim). He keeps every docket (a ledger man). "In this town every fire has an owner." His father's stall since 1979; what Bala did in 1985 to 1987 is never told. He walked in front of Muthu's body like a son. In Case 6 he stepped back from the phone "as if the voice could see him". Tamil, and Brickfields Hokkien is plausible. | He was in the room when the voice rang his phone (Case 6) and at the front of the procession when the hand touched the detective (Case 7): he needs reading A, or a recorded or relayed voice. He let the detective rent upstairs in 2016, the year the file was opened. |
| **Tan Sri Azhar Kamaruddin** (68, Group MD since 1997) | The public face for twenty-nine years; "thanked an empty chair" every year; knew since 2019 (he says) that the shadow was Muthu; bought the "Chairman's" prognosis; wrote himself in as successor; answered "drive me last" in Case 12. A double bluff: the man everyone already suspects, cleared twice. | He sat at the head table while the voice spoke from Bay V1 (Case 7), and was at Jenjarom at 2:12 on 21 Feb: he needs reading A (the voice is someone else) or a relay. In the branch `AZHAR_WRONGED_12` he is in custody on the final night. |
| **Pak Itam** (Ibrahim bin Sulong, 74, the Jugra watchman since 1985) | "I have the gate still": he is the gate. At the yard on 1 Dec 1986 ("asleep on toddy"); says he saw the driver's face every day in 1986 and not since 1987, and refuses to describe it ("If I say, the gate goes"). Opens the car doors without looking. Answers in pantun when he does not want to answer. The perfect cover is a watchman. | Speaks only Malay on screen (never shown not speaking Hokkien or Tamil). He was at the gate post at 2:05 on 21 Feb, so he was not the watcher on the lighthouse road in the `JASON_FREE` branch (reading A, or the watcher was someone else). In `ITAM_WRONGED` he is in custody on the final night. |
| **Two men** (reading A or B) | Every "two" clue above. The dead man's thumb (founder) and voicelessness. Arthur's "a face you forget while you are looking at it". Vivian's "he dictated down a car telephone". | Pairs with any candidate: the owner picks who is the voice and who is the founder. |
| **Someone not yet met** | The in-game theory list always ends with "Someone I have not met yet". The detective's own past (the file was opened in 2016, the week the agency opened); a man on the Johor side who never crosses water. | A Season Three introduction that has to fit every fact above. |
| Long shots (kept technically possible, not pushed) | **Leong Kam Wah** ("measured in the dark", the measurements could be his own); **Old Mani** (the Klang engraver, 78, took the 2016 "Tuan" order by phone); **Jeffrey Ho** (too young to have owned the lorry, but plausible as the heir, and the man at the wheel at Chow Kit in his branch); **Lau Kim Hock** (Ken's uncle, 67; Ken asked about Port Klang); **Teoh Ah Kow** (was at the yard; but the 1986 truth makes him the paid brother). | Each needs a large new explanation. |

**Ruled out by Season Two** (do not consider): Daniel (inside the 2021 fire), Farah, Ain, Meera, Vivian, Melissa, Siew Yang (the voice is a man's), Muthu (dead), Desmond, Asri and Roslan (too young; and their own interrogations), Arthur Seah (he witnessed the deed), Khairul (the folder).

### Clues each candidate must not be given later (or the choice is made for you)

Handedness, height, smoking, watch wrist, swimming, Singapore, siblings or mother's family, throat, 1985 to 1987, and whereabouts at the "Chairman times" (§1 rule 5). If the owner decides, these are the first things to give the chosen man; until then, nobody gets them.

### Ending variants the owner can choose instead (Case 12, panel 7)

- As written: the mirror, the light, "You look", black.
- Harder: the detective says one word ("You."), which tells the player it is somebody the detective knows, and cuts out the "someone not met" reading.
- Softer: the reading light does not come on; only the voice, "Next time."
