// The Sinar File: everything the cases have shown the player about the man at the top of Sinar Holdings.
//
// HOUSE RULE (the owner's): his identity is unrevealed and undecided. Nothing in this file may name him,
// describe his face, tie him to any person in the cases, or add a fact the cases do not already show.
// Every entry below is copied down from a specific exhibit or cinematic panel, cited in its comment.
// The guess list at the bottom is the player's theory, never the game's: it stays neutral.
//
// Every unlock takes the save (state()) and checks what this player has actually seen:
//   solvedLv(case, level)   that exhibit is solved
//   opened(case, when?)     the case's opening cinematic has played (optionally: with these flags)
//   ended(case, when?)      the case has a verdict on record, so its ending has played
import { CASES, CASE_ORDER, caseLabel, revealedSuspects } from './cases.js';

const csOf = (save, id) => save?.cases?.[id] || null;
const solvedLv = (caseId, levelId) => (save) => !!csOf(save, caseId)?.solved?.[levelId];
const opened = (caseId, when) => (save) => {
  const cs = csOf(save, caseId);
  return !!cs && (!when || !!when(cs.flags || save.flags || {}));
};
const ended = (caseId, when) => (save) => {
  const cs = csOf(save, caseId);
  return !!(cs && cs.closedAt && Array.isArray(cs.accusation)) && (!when || !!when(save.flags || {}));
};
const all = (...fns) => (save) => fns.every((f) => f(save));
const any = (...fns) => (save) => fns.some((f) => f(save));

// Daniel's whereabouts by Cases 5 and 6, as the endings show them (same rules as case06.js / case07.js)
const TAKEN = (f) => !!f.DANIEL_TAKEN || !f.DANIEL_FOUND;
const HELD = (f) => TAKEN(f) && !f.ARCHIVE_SEIZED;

// ------------------------------------------------------------------------------------------------
// Threads, in story order. `from` is the level id or 'opening' / 'ending' the entry is copied from,
// shown to the player as the citation.

export const THREADS = [
  // ---------------- Case 1: The Fall ----------------
  {
    // case01 l12 "Five interviews": evidence text (Sinar Holdings payments)
    id: 'c1_paid', caseId: 'case01', from: 'l12', img: 'ev_interview',
    title: 'Two payments, the morning after',
    text: 'The morning after Dr. Henry Goh fell, the guard who wiped the cameras and the agent who was in the flat next door each received RM 5,000. The money came from a Singapore company called Sinar Holdings. It is the first time you read the name.',
    unlock: solvedLv('case01', 'l12'),
  },
  {
    // case01 l05b "Your own stairs": the 12:31 AM message from a Singapore number
    id: 'c1_desk', caseId: 'case01', from: 'l05b', img: 'ev_c1_backlane',
    title: 'Before Rachel called',
    text: 'At 12:31 AM, forty minutes after Goh fell, a Singapore number paid a boy RM 300 to photograph your desk and take any letter "from the dentist". Rachel did not ring you until 2:47. Somebody knew whose number Goh had given her before she did.',
    unlock: solvedLv('case01', 'l05b'),
  },
  {
    // case01 l10 "The safe" (the unsent letter) and the ending panel out_xray ("Port Klang. August 2021.")
    id: 'c1_xray', caseId: 'case01', from: 'ending', img: 'out_xray',
    title: 'PK-0821',
    text: 'In Goh\'s safe: an X-ray labelled PK-0821, and a letter he never sent, promising to tell the police "what I did in 2021". PK is Port Klang. August 2021 is the month of the fire you still dream about.',
    unlock: ended('case01'),
  },

  // ---------------- Case 2: Container 47 ----------------
  {
    // case02 c2_10 "The manifest"
    id: 'c2_manifest', caseId: 'case02', from: 'c2_10', img: 'ev_c2_manifest',
    title: 'Consignee: Sinar Cold Chain',
    text: 'Container 47 was declared as frozen fish and carried twenty-three people. The consignee was Sinar Cold Chain, Singapore, and the box was to go to Warehouse 6, Bay 3: the bay whose roof came down in August 2021.',
    unlock: solvedLv('case02', 'c2_10'),
  },
  {
    // case02 c2_05 "Tony's office": the Restoran Bala receipt, table 6
    id: 'c2_table6', caseId: 'case02', from: 'c2_05', img: 'ev_c2_kancil',
    title: 'Table 6',
    text: 'In the shift supervisor\'s drawer, beside a second phone: a paper kancil folded from a Restoran Bala receipt. Table 6, the table by the stairs to your office, dated the day before Salmah found your number.',
    unlock: solvedLv('case02', 'c2_05'),
  },
  {
    // case02 ending, panel c2_out_04_bay3 (Farah: "Tuesday, 2:41 AM, at this door. I cannot see his face.")
    id: 'c2_lighter', caseId: 'case02', from: 'ending', img: 'c2_out_04_bay3',
    title: 'A lighter at Bay 3',
    text: 'At 2:41 AM on the night Azman ran, a port camera at Bay 3\'s door caught a man in a dark jacket lighting a cigarette. Farah could not see his face. The flame came from a silver flip-top lighter, like Daniel\'s.',
    unlock: ended('case02'),
  },

  // ---------------- Case 3: The Unclaimed ----------------
  {
    // case03 opening, panel c3_intro_05_chulia (the THE CHULIA hoarding)
    id: 'c3_hoarding', caseId: 'case03', from: 'opening', img: 'c3_intro_05_chulia',
    title: 'A hotel that does not exist yet',
    text: 'Beside Uncle Lim\'s burnt shophouse, a hoarding: THE CHULIA, a Sinar Heritage Hotel. Sinar again, three hundred kilometres from the port. You read it twice.',
    unlock: opened('case03'),
  },
  {
    // case03 c3_15 "Uncle Lim's order book"
    id: 'c3_notsame', caseId: 'case03', from: 'c3_15', img: 'ev_c3_orderbook',
    title: '"Not the same man"',
    text: 'Uncle Lim wrote it in Goh\'s tooth code: the jaw on PK-0821 did not match Daniel Raj\'s dental record, and "Doctor says write match." Henry Goh signed the match on 24 August 2021.',
    unlock: solvedLv('case03', 'c3_15'),
  },
  {
    // case03 c3_14 "Petty cash": the email scanned with voucher 0417
    id: 'c3_office', caseId: 'case03', from: 'c3_14', img: 'ev_c3_voucher',
    title: 'An address with no name',
    text: 'Scanned beside RM 8,000 for "one night" of site security: an email from an address with no name, only "Office of the Chairman". One line. "The 2021 box first. Then the building." The box was Uncle Lim\'s carton of Goh\'s 2021 casts.',
    unlock: solvedLv('case03', 'c3_14'),
  },

  // ---------------- Case 4: Sea Street ----------------
  {
    // case04 c4_06 "The third handset": the GSM relay, SIM in Sinar Gems' name
    id: 'c4_tap', caseId: 'case04', from: 'c4_06', img: 'ev_c4_tap',
    title: 'A third pair of ears',
    text: 'A relay taped into Yogi\'s junction box rang a Sinar Gems phone every time his line was used. For a month somebody heard every word he said on it, including the call that set up his last meeting.',
    unlock: solvedLv('case04', 'c4_06'),
  },
  {
    // case04 c4_14 "The valuer first"
    id: 'c4_valuer', caseId: 'case04', from: 'c4_14', img: 'ev_c4_email',
    title: 'The valuer first',
    text: 'Twenty-two minutes after that call, the Office of the Chairman emailed Colombo: "The valuer first. Then the book. Nothing on the phones." Yogi went into Beira Lake at 11:24 that night.',
    unlock: solvedLv('case04', 'c4_14'),
  },
  {
    // case04 c4_15 "Undiyal": the "Port Klang account" heading
    id: 'c4_account', caseId: 'case04', from: 'c4_15', img: 'ev_c4_undiyal',
    title: 'The Port Klang account',
    text: 'Cash crossed from Malaysia hand to hand, bought cheap heated stones in Ratnapura, and came back through Singapore as clean dollars. In Sinar Gems\' ledger that cash has its own heading: "Port Klang account".',
    unlock: solvedLv('case04', 'c4_15'),
  },
  {
    // case04 ending, panel c4_out_05_call (Herath's photograph of the shredded header)
    id: 'c4_level14', caseId: 'case04', from: 'ending', img: 'c4_out_05_call',
    title: 'Level 14, Menara Sinar',
    text: 'The strip the shredder chewed, pieced back together in Colombo: Office of the Chairman. Level 14, Menara Sinar, Kuala Lumpur. The lifts in Menara Sinar go from 13 to 15.',
    unlock: ended('case04'),
  },

  // ---------------- Case 5: Menara Sinar ----------------
  {
    // case05 c5_07 "Fire inspection"
    id: 'c5_floor', caseId: 'case05', from: 'c5_07', img: 'ev_c5_floor14',
    title: 'The floor that is not there',
    text: 'Behind the black glass: archive shelves stripped in the night, a glass room full of cables, and at the far end an office with one desk and one chair turned to face the window. One box was missed. It was empty, and labelled PORT KLANG 2021.',
    unlock: solvedLv('case05', 'c5_07'),
  },
  {
    // case05 c5_08 "The listening room"
    id: 'c5_listening', caseId: 'case05', from: 'c5_08', img: 'ev_c5_listening',
    title: 'Every word',
    text: 'Every tapped line landed in the glass room: Yogi\'s shop, Henry Goh\'s flat, Uncle Lim\'s workshop, the finance director\'s mobile. One relay was still live. Its tag said BALA, BRICKFIELDS: the telephone by Bala Anne\'s till.',
    unlock: solvedLv('case05', 'c5_08'),
  },
  {
    // case05 c5_10 "The director first"
    id: 'c5_order', caseId: 'case05', from: 'c5_10', img: 'ev_c5_order',
    title: 'The director first',
    text: 'Orders from his office are printed on Level 14 and collected by hand. The last one before Dato\' Rashid fell: "The director first. Then the kancil." It reads like the email to Colombo.',
    unlock: solvedLv('case05', 'c5_10'),
  },
  {
    // case05 c5_11 "Lights across the river": the brass telescope beside the chair
    id: 'c5_telescope', caseId: 'case05', from: 'c5_11', img: 'ev_c5_window',
    title: 'The view from his chair',
    text: 'Sit in the one chair on Level 14 and you face Kampung Baru across the river. Beside it a brass telescope is bolted to the floor. It points south-west, at your office window above Restoran Bala.',
    unlock: solvedLv('case05', 'c5_11'),
  },
  {
    // case05 c5_bk "Ticket 0414" (only when Yogi's book was lost in Case 4)
    id: 'c5_book', caseId: 'case05', from: 'c5_bk', img: 'ev_c5_carbonbook',
    title: 'The book in his drawer',
    text: 'Yogi\'s carbon book, collected from Colombo Fort by a man with a sun on his shirt, was the one thing left in the drawer of the desk on Level 14. Every page was there except the last, where Yogi wrote for whom every valuation was made. It had been torn out.',
    unlock: solvedLv('case05', 'c5_bk'),
  },
  {
    // case05 c5_18 "Cold room, Jalan Raja Bot": the PDRM folders
    id: 'c5_payroll', caseId: 'case05', from: 'c5_18', img: 'ev_c5_coldroom',
    title: 'One folder to an officer',
    text: 'The archive of Level 14 went to a cold room behind Chow Kit, then on to Warehouse 6. One carton froze to the floor and stayed: police officers, one to a folder, each with a name, a rank and a monthly figure.',
    unlock: solvedLv('case05', 'c5_18'),
  },
  {
    // case05 c5_22 "The Chairman's secretary"
    id: 'c5_secretary', caseId: 'case05', from: 'c5_22', img: 'ev_c5_interviews',
    title: 'Twenty-seven years',
    text: 'His secretary of twenty-seven years asked for nothing: not a lawyer, not water. She told Farah one true thing about the night. About him she said what she had said all night, which was nothing at all.',
    unlock: solvedLv('case05', 'c5_22'),
  },
  {
    // case05 ending, panel c5_out_05_folder ("Brickfields. Friday, 2:10 AM.")
    id: 'c5_folder', caseId: 'case05', from: 'ending', img: 'c5_out_05_folder',
    title: 'Opened 2016',
    text: 'At 2:10 AM, behind your locked door: a grey folder with a small embossed sun, your name on the tab, "Opened 2016". Inside, a photograph of you and Daniel at table 6, and a typed list of names struck through in blue ink. Two were not struck yet: Daniel\'s, and yours.',
    unlock: ended('case05'),
  },

  // ---------------- Case 6: Black Floor ----------------
  {
    // case06 c6_07 "Both of them": Ismail's 2021 microcassette
    id: 'c6_voice', caseId: 'case06', from: 'c6_07', img: 'ev_c6_microcassette',
    title: 'Let it burn',
    text: 'Ismail Bakar\'s pocket recorder caught a voice at the edge of the Bay 3 fire in 2021, close and unhurried: "Biarkan, Tuan Ismail. Biar dua-dua sekali." Let it burn, both of them. Twice, the snap of a flip-top lid, while Ismail held his crew at the door for six minutes.',
    unlock: solvedLv('case06', 'c6_07'),
  },
  {
    // case06 c6_01 "The black floor": the third D.R. lighter
    id: 'c6_wick', caseId: 'case06', from: 'c6_01', img: 'ev_c6_lighter',
    title: 'Lit a thousand times',
    text: 'Beside Ismail\'s body, a silver lighter engraved D.R., broken R and all. Yours has a white wick. This one is burnt black, its wheel worn smooth by a thumb. Neither you nor Daniel has ever smoked.',
    unlock: solvedLv('case06', 'c6_01'),
  },
  {
    // case06 c6_08 "Three, not two": Mani's order book, 19 August 2016
    id: 'c6_mani', caseId: 'case06', from: 'c6_08', img: 'ev_c6_orderbook',
    title: 'Customer: Tuan',
    text: 'Mani\'s order book, 19 August 2016, a week after Daniel bought two: one lighter, "same as Mr. Raj\'s, exact". Customer: Tuan. No name, a telephone order, cash, collected by driver. He asked for the chip in the R on purpose.',
    unlock: solvedLv('case06', 'c6_08'),
  },
  {
    // case06 c6_12 "The fire safety officer's pickup": Ismail's sixth photograph, "Dia"
    id: 'c6_cuff', caseId: 'case06', from: 'c6_12', img: 'ev_c6_pickup',
    title: 'Dia',
    text: 'Ismail\'s sixth photograph, taken from behind the tape in 2021, has one word on the back: Dia. Him. A black car with its back window half down, and a hand in a white cuff holding a silver lighter, flame up: no face, no plate.',
    unlock: solvedLv('case06', 'c6_12'),
  },
  {
    // case06 c6_16 "Nothing on the phones": "Tuan. Bay 2. Window only." (and c6_11, the car at 7:40)
    id: 'c6_window', caseId: 'case06', from: 'c6_16', img: 'ev_c6_checklist',
    title: 'Window only',
    text: 'Thursday\'s list for Warehouse 6 began: "Tuan. Bay 2. Window only." At 7:40 that evening a black car with no plates stood by Bay 2 for twenty minutes with its back window down, and somebody in the back seat smoked without getting out.',
    unlock: solvedLv('case06', 'c6_16'),
  },
  {
    // case06 c6_15 "Dah": the prepaid on the Bukit Jugra mast
    id: 'c6_jugra', caseId: 'case06', from: 'c6_15', img: 'ev_c6_recorder',
    title: 'One word',
    text: 'At 12:20 one word went out from the room above Bay 2: "Dah." Done. Nobody answered, but somebody breathed out smoke. The number is a prepaid that has only ever received calls, and that night it sat on one mast, in the oil palm under the lighthouse on Bukit Jugra.',
    unlock: solvedLv('case06', 'c6_15'),
  },
  {
    // case06 c6_21 "Thirty-nine years": through the car window
    id: 'c6_tablesix', caseId: 'case06', from: 'c6_21', img: 'ev_c6_window',
    title: 'Does the detective still sit at table six?',
    text: 'A man who has worked for him for thirty-nine years has never heard his name said aloud. "In 1987 he was the man who owned the lorry. Now he is the man who owns the port." Through the car window he asked one more thing: whether the detective still sits at table six.',
    unlock: solvedLv('case06', 'c6_21'),
  },
  {
    // case06 ending, panel c6_out_03_jugra (ARCHIVE_SEIZED): "There is no photograph of the Chairman anywhere in his memory."
    id: 'c6_memory', caseId: 'case06', from: 'ending', img: 'c6_out_03_jugra',
    title: 'His memory',
    text: 'Under Bukit Jugra, behind a gate with a sun painted on it long ago, RU-07 held one hundred and eleven cartons: every official Sinar has bought since 1986, a file to each. There is no photograph of him anywhere in it.',
    unlock: ended('case06', (f) => f.ARCHIVE_SEIZED),
  },
  {
    // case06 ending, panel c6_out_03_empty (ARCHIVE_LOST)
    id: 'c6_lost', caseId: 'case06', from: 'ending', img: 'c6_out_03_empty',
    title: 'A road that is not on any map',
    text: 'By the time anybody thought of the old Sinar yard under Bukit Jugra, the gate with the pink sun stood open on red mud and a diesel stain. His memory, one hundred and eleven cartons, is on a road that is not on any map of his.',
    unlock: ended('case06', (f) => f.ARCHIVE_LOST),
  },
  {
    // case06 ending, panel c6_out_06_phone ("Brickfields. Tuesday, 2:10 AM.")
    id: 'c6_call', caseId: 'case06', from: 'ending', img: 'c6_out_06_phone',
    title: 'Ten past two',
    text: 'At 2:10 AM the telephone by Bala Anne\'s till rang, and the voice from Ismail\'s tape said: "Five years ago I let you go into the fire. This year I let you come out of it. Keep the lighter." Then a lid, open and shut, and the dialling tone.',
    unlock: ended('case06'),
  },

  // ---------------- Case 7: The Screen ----------------
  {
    // case07 opening, panel c7_intro_05_silhouette (the speech)
    id: 'c7_speech', caseId: 'case07', from: 'opening', img: 'c7_intro_02_tower',
    title: 'The voice in the room',
    text: 'At Sinar\'s fortieth dinner the voice spoke from behind a silk screen: one lorry, a yard in the oil palm under Bukit Jugra, a sun painted on the gate. "I have the gate still." Then, to three hundred guests: a detective at table six he has watched for ten years.',
    unlock: opened('case07'),
  },
  {
    // case07 c7_07 "A perfect pressure": the TUAN file
    id: 'c7_doctor', caseId: 'case07', from: 'c7_07', img: 'ev_c7_bag',
    title: 'Patient: Tuan',
    text: 'For twelve years the patient called Tuan at a suite on Jalan Kia Peng was the man who died in the chair. The red file matches the body scar for scar. No doctor has ever had the real patient\'s blood.',
    unlock: solvedLv('case07', 'c7_07'),
  },
  {
    // case07 c7_11 "Eleven tones": 011-2604 1986 on the Basement 2 aerial
    id: 'c7_line', caseId: 'case07', from: 'c7_11', img: 'ev_c7_hybrid',
    title: '011-2604 1986',
    text: 'Since the glass room was sealed, the voice has come into the ballroom down a telephone. The prepaid takes one call a year. Tonight it sat on the aerial in Basement 2, and its last four digits are the year Sinar was founded.',
    unlock: solvedLv('case07', 'c7_11'),
  },
  {
    // case07 c7_12 "Bay V1"
    id: 'c7_bay', caseId: 'case07', from: 'c7_12', img: 'ev_c7_bay',
    title: 'Bay V1',
    text: 'Twenty-two cameras on Basement 2, all installed in 1997 looking away from one bay. A black car comes to Bay V1 four or five nights a year, and the attendant is told to look at his feet. Tonight it came down at 9:20 with two people in the back.',
    unlock: solvedLv('case07', 'c7_12'),
  },
  {
    // case07 c7_18 "Side B": "Sekarang", "Dah, Tuan", "Terima kasih"
    id: 'c7_sekarang', caseId: 'case07', from: 'c7_18', img: 'ev_c7_cassette',
    title: 'Sekarang',
    text: 'The old deck caught the voice before the delay, with car air-conditioning and basement fans under every word. One second after "Forty seconds", on the talkback only, it said: "Sekarang." Now. Three minutes and forty-four seconds later a headset answered "Dah, Tuan", and the voice said "Terima kasih".',
    unlock: solvedLv('case07', 'c7_18'),
  },
  {
    // case07 c7_16 "Technical services": RM 300,000, and the driver's allowance marked "Final"
    id: 'c7_paid', caseId: 'case07', from: 'c7_16', img: 'ev_c7_events',
    title: 'Final',
    text: 'On the Friday his driver told him he was dying and would not lie in front of God, his office paid the man at the AV desk RM 300,000. The same day the driver\'s monthly allowance stopped, with one word in the margin: "Final."',
    unlock: solvedLv('case07', 'c7_16'),
  },
  {
    // case07 c7_14 "The doorstep": Muthu's letter
    id: 'c7_standin', caseId: 'case07', from: 'c7_14', img: 'ev_c7_kolam',
    title: 'Somebody else in the chair',
    text: 'Muthu\'s letter: forty years he drove him, and for twenty-nine he sat in the chair behind the screen so that people would think he was in the room. "He is never in the room. He sits in the car under the building and talks into a telephone." In 2016 Muthu fetched the third lighter, and paid for your teh at table seven, because he was told to.',
    unlock: solvedLv('case07', 'c7_14'),
  },
  {
    // case07 c7_19 "Before Subuh": the car at Chow Kit
    id: 'c7_chowkit', caseId: 'case07', from: 'c7_19', img: 'ev_c7_market',
    title: 'The car that came',
    text: 'At five in the morning a black car with no plates idled at the end of a Chow Kit lane, back window down the width of a hand. It had come for the man you were kneeling on. A hand in a white cuff turned the cigarette over once, and the window went up.',
    unlock: solvedLv('case07', 'c7_19'),
  },
  {
    // case07 ending, panel c7_out_06_cremation (the hand on your shoulder, "I need a new driver")
    id: 'c7_driver', caseId: 'case07', from: 'ending', img: 'ev_c7_door',
    title: 'I need a new driver',
    text: 'At Muthu\'s cremation a hand in a white cuff settled on your shoulder: "Muthu drove me for forty years and never once looked in the mirror. I need a new driver." The first of December, ten past two, outside Restoran Bala. When you turned there were two hundred men in white shirts, and in your pocket a car key on a ring with a small brass sun.',
    unlock: ended('case07'),
  },
];

/** What a case's group says when no thread in it leads to Sinar (the side case). */
export const NO_THREAD = {
  side01: 'Nothing in this file has led to Sinar. A paper boat is not a kancil.',
};

// ------------------------------------------------------------------------------------------------
// What we know: short facts, grouped. Each is drawn from the cited exhibit or panel.

export const KNOWN_GROUPS = [
  { id: 'voice', label: 'Voice' },
  { id: 'money', label: 'Money' },
  { id: 'people', label: 'People' },
  { id: 'places', label: 'Places' },
  { id: 'objects', label: 'Objects' },
  { id: 'habits', label: 'Habits' },
];

export const KNOWN = [
  // voice
  { id: 'v_calm', group: 'voice', text: 'Calm and close, like a man ordering tea. You have heard it every night for five years.', unlock: opened('case06') }, // case06 opening panel 3
  { id: 'v_lid', group: 'voice', text: 'Between sentences, the snap of a flip-top lid.', unlock: solvedLv('case06', 'c6_07') }, // c6_07
  { id: 'v_detective', group: 'voice', text: 'He calls you "detective".', unlock: ended('case06') }, // case06 ending, the 2:10 AM call
  { id: 'v_rooms', group: 'voice', text: 'He speaks to rooms without being in them: from a glass room on Level 14, then down a telephone.', unlock: solvedLv('case07', 'c7_11') }, // c7_03, c7_11
  { id: 'v_thanks', group: 'voice', text: 'He says thank you.', unlock: solvedLv('case07', 'c7_18') }, // c7_18 "Terima kasih"

  // money
  { id: 'm_paid', group: 'money', text: 'Sinar Holdings pays the people who lie for it, the morning after.', unlock: solvedLv('case01', 'l12') }, // l12
  { id: 'm_account', group: 'money', text: 'A ledger heading called the "Port Klang account": Malaysian cash, washed through Ceylon sapphires.', unlock: solvedLv('case04', 'c4_15') }, // c4_15
  { id: 'm_police', group: 'money', text: 'Police officers on a monthly figure, one folder each.', unlock: solvedLv('case05', 'c5_18') }, // c5_18
  { id: 'm_ismail', group: 'money', text: 'RM 200,000 bought a fire investigator\'s signature in 2021.', unlock: solvedLv('case06', 'c6_06') }, // c6_06
  { id: 'm_lorry', group: 'money', text: 'Forty years ago, one lorry and a yard under Bukit Jugra. Now, the port.', unlock: all(solvedLv('case06', 'c6_21'), opened('case07')) }, // c6_21, case07 opening
  { id: 'm_cheque', group: 'money', text: 'His name is on no cheque. Even his doctor was paid through the events budget.', unlock: solvedLv('case07', 'c7_16') }, // c7_16

  // people (roles only)
  { id: 'p_companies', group: 'people', text: 'Companies under the sun: Sinar Cold Chain, Sinar Heritage Hotels, Sinar Gems Lanka.', unlock: solvedLv('case04', 'c4_01') }, // c2_10, case03 opening, c4_01
  { id: 'p_office', group: 'people', text: 'His orders are signed by an office, never a person: "Office of the Chairman".', unlock: solvedLv('case03', 'c3_14') }, // c3_14
  { id: 'p_secretary', group: 'people', text: 'A secretary of twenty-seven years who will not discuss him.', unlock: solvedLv('case05', 'c5_22') }, // c5_22
  { id: 'p_gm', group: 'people', text: 'A man who has worked for him for thirty-nine years and has never heard his name spoken.', unlock: solvedLv('case06', 'c6_21') }, // c6_21
  { id: 'p_av', group: 'people', text: 'A man who had his voice in his ear for twenty-nine years and never saw his face.', unlock: solvedLv('case07', 'c7_22') }, // c7_22
  { id: 'p_driver', group: 'people', text: 'A driver of forty years who sat in his chair at every dinner and went to his doctor for him.', unlock: solvedLv('case07', 'c7_14') }, // c7_14

  // places
  { id: 'pl_level14', group: 'places', text: 'Level 14 of Menara Sinar, the floor that is not there. One desk, one chair facing the window.', unlock: solvedLv('case05', 'c5_07') }, // c5_07
  { id: 'pl_telescope', group: 'places', text: 'A telescope beside that chair, pointed at your office.', unlock: solvedLv('case05', 'c5_11') }, // c5_11
  { id: 'pl_bay3', group: 'places', text: 'Warehouse 6, Bay 3, Pulau Indah. He was at the tape while it burned in 2021.', unlock: solvedLv('case06', 'c6_07') }, // c6_07
  { id: 'pl_jugra', group: 'places', text: 'The old Sinar yard under Bukit Jugra, a sun painted on the gate.', unlock: any(ended('case06'), opened('case07')) }, // case06 ending, case07 opening
  { id: 'pl_table6', group: 'places', text: 'Table six, Restoran Bala. He asks about it.', unlock: any(solvedLv('case06', 'c6_21'), opened('case07')) }, // c6_21, case07 opening
  { id: 'pl_v1', group: 'places', text: 'Bay V1, Basement 2: the one bay no camera sees.', unlock: solvedLv('case07', 'c7_12') }, // c7_12

  // objects
  { id: 'o_sun', group: 'objects', text: 'A brass sun: on the crown of Menara Sinar, and set in its lobby floor.', unlock: opened('case05') }, // case05 opening
  { id: 'o_folder', group: 'objects', text: 'A grey archive folder with your name on it. Opened 2016.', unlock: ended('case05') }, // case05 ending
  { id: 'o_lighter', group: 'objects', text: 'A silver flip-top lighter, a copy of Daniel\'s, ordered by telephone for "Tuan" in August 2016.', unlock: solvedLv('case06', 'c6_08') }, // c6_08
  { id: 'o_car', group: 'objects', text: 'A black car with no number plates.', unlock: any(solvedLv('case06', 'c6_11'), solvedLv('case06', 'c6_12'), solvedLv('case06', 'c6_16')) }, // c6_11, c6_12, c6_16
  { id: 'o_cuff', group: 'objects', text: 'A white cuff.', unlock: solvedLv('case06', 'c6_12') }, // c6_12
  { id: 'o_prepaid', group: 'objects', text: 'Prepaid numbers that only ever receive calls.', unlock: solvedLv('case06', 'c6_15') }, // c6_15
  { id: 'o_1986', group: 'objects', text: 'One of them ends in 1986.', unlock: solvedLv('case07', 'c7_11') }, // c7_11

  // habits
  { id: 'h_phones', group: 'habits', text: 'Nothing on the phones. Orders are printed, fetched by hand and shredded.', unlock: solvedLv('case05', 'c5_10') }, // c5_10
  { id: 'h_pairs', group: 'habits', text: 'His orders come in pairs: the box, then the building. The valuer, then the book. The director, then the kancil.', unlock: all(solvedLv('case03', 'c3_14'), solvedLv('case04', 'c4_14'), solvedLv('case05', 'c5_10')) }, // c3_14, c4_14, c5_10
  { id: 'h_listens', group: 'habits', text: 'He listens. Every line that mattered had a relay on it, Bala Anne\'s included.', unlock: solvedLv('case05', 'c5_08') }, // c5_08
  { id: 'h_list', group: 'habits', text: 'He strikes names off a typed list in blue ink.', unlock: ended('case05') }, // case05 ending; case06 ending adds I. Bakar
  { id: 'h_smokes', group: 'habits', text: 'He smokes, and has lit the third lighter thousands of times.', unlock: solvedLv('case06', 'c6_01') }, // c6_01
  { id: 'h_car', group: 'habits', text: 'He comes himself only to watch, and never gets out of the car.', unlock: solvedLv('case06', 'c6_21') }, // c6_21 "He never gets out."
  { id: 'h_standin', group: 'habits', text: 'He sends somebody else: to his doctor, and to sit in his chair.', unlock: solvedLv('case07', 'c7_14') }, // c7_14
];

// ------------------------------------------------------------------------------------------------
// What we don't know: questions the story has raised. Questions only, never answers.
// `until` hides a question once a later case answers it (about someone else, never about him).

export const UNKNOWN = [
  { id: 'u_name', q: 'What is his name?', unlock: () => true },
  { id: 'u_face', q: 'What does he look like?', unlock: () => true },
  { id: 'u_boy', q: 'Who sent a boy up your stairs at 12:31 AM, two hours before Rachel called you?', unlock: solvedLv('case01', 'l05b') }, // l05b
  { id: 'u_bay3', q: 'Whose silver lighter was lit at Bay 3\'s door at 2:41 AM, the night Azman ran?', unlock: ended('case02') }, // case02 ending
  { id: 'u_ru11', q: 'What was behind RU-11\'s hidden panel in August 2021, the week Bay 3 burned?', unlock: all(solvedLv('case04', 'c4_13'), any(solvedLv('case04', 'c4_tk'), solvedLv('case04', 'c4_wj'), opened('case04', (f) => f.AZMAN_ALIVE))) }, // c4_13 with c4_tk / c4_wj / the case04 opening line about RU-11
  { id: 'u_2016', q: 'Why did he open a file on you in 2016, five years before the fire?', unlock: ended('case05') }, // case05 ending
  { id: 'u_alive', q: 'Five years ago he let you go into the fire. Why let you come out?', unlock: ended('case06') }, // case06 ending call
  { id: 'u_table7', q: 'Who was the old man in the white shirt at table seven, in August 2016?', unlock: ended('case06', (f) => !TAKEN(f)), until: any(solvedLv('case07', 'c7_14'), ended('case07', (f) => !HELD(f))) }, // case06 ending (safehouse / prison panel); answered by c7_14
  { id: 'u_archive', q: 'Where is RU-07 now, with his memory inside it?', unlock: ended('case06', (f) => f.ARCHIVE_LOST) }, // case06 ending
  { id: 'u_210', q: 'Why is it always ten past two?', unlock: all(ended('case05'), ended('case06')) }, // case05 ending (2:10 folder), case06 ending (2:10 call)
  { id: 'u_lamp', q: 'Who set a lamp on sealed Level 14 to come on at 2:10 every night?', unlock: solvedLv('case07', 'c7_10') }, // c7_10
  { id: 'u_seen', q: 'Has anybody alive seen his face?', unlock: solvedLv('case07', 'c7_22') }, // c7_22
  { id: 'u_v1', q: 'Where does the black car go when it leaves Bay V1?', unlock: solvedLv('case07', 'c7_12') }, // c7_12
  { id: 'u_daniel', q: 'Daniel has sat beside him in the dark. Has he seen his face?', unlock: ended('case07', HELD) }, // case07 ending, held branch
  { id: 'u_dec1', q: 'What does he want with you on the first of December, at ten past two?', unlock: ended('case07') }, // case07 ending
];

/** What the file calls him, as the cases have shown it. */
export const ALIASES = [
  { text: '"Office of the Chairman"', unlock: solvedLv('case03', 'c3_14') }, // c3_14
  { text: '"The voice"', unlock: opened('case06') }, // case06 opening
  { text: '"Tuan"', unlock: any(solvedLv('case06', 'c6_08'), solvedLv('case06', 'c6_16')) }, // c6_08, c6_16
];

// ------------------------------------------------------------------------------------------------
// Unlock helpers for the screen.

const isOn = (x, save) => { try { return !!x.unlock(save); } catch { return false; } };

export const threadsFor = (save) => THREADS.map((t) => ({ ...t, open: isOn(t, save) }));
export const knownFor = (save) => KNOWN.filter((k) => isOn(k, save));
export const unknownFor = (save) => UNKNOWN.filter((u) => isOn(u, save) && !(u.until && u.until(save)));
export const aliasesFor = (save) => ALIASES.filter((a) => isOn(a, save));

/** True once the player has read the name Sinar anywhere in a thread: the file exists for them. */
export const fileOpen = (save) => THREADS.some((t) => isOn(t, save));

// ------------------------------------------------------------------------------------------------
// The player's theory: who they think he is. Candidates are only the named people this player has
// met in the cases they have reached, plus one way out. The list never suggests an answer: there is
// none yet. Order is story order, the order the player met them.

// Recurring people (not suspects). `met` says when the player has met them by name.
const PEOPLE = [
  { id: 'farah', at: 'case01', name: 'Inspector Farah Iskandar', where: 'Bukit Aman. She was at Mont Kiara the night Henry Goh fell.', met: opened('case01') },
  { id: 'rachel', at: 'case01', name: 'Rachel Goh', where: 'Henry Goh\'s daughter. She called you at 2:47 AM.', met: opened('case01') },
  { id: 'daniel', at: 'case01', name: 'Daniel Raj', where: 'Your partner at the agency in Brickfields.', met: opened('case01') },
  { id: 'bala', at: 'case01', name: 'Bala Anne', where: 'Restoran Bala, downstairs from your office.', met: any(solvedLv('case01', 'l05b'), opened('side01')) },
  { id: 'ken', at: 'side01', name: 'Ken Lim', where: 'Your friend since school. Ah Hock\'s nephew, from SS2.', met: opened('side01') },
  { id: 'azman', at: 'case02', name: 'Azman Yusof', where: 'Case 2. The crane driver who opened Container 47.', met: opened('case02') },
  { id: 'jo', at: 'case03', name: 'Jo Lim', where: 'Case 3. Uncle Lim\'s granddaughter, in George Town.', met: opened('case03') },
  { id: 'herath', at: 'case04', name: 'Inspector Ruwan Herath', where: 'Case 4. Colombo police, a friend of Farah\'s.', met: opened('case04') },
  { id: 'tharshini', at: 'case04', name: 'Tharshini Yogeswaran', where: 'Case 4. Yogi\'s daughter, at 112 Sea Street.', met: opened('case04') },
  { id: 'wong', at: 'case05', name: 'Uncle Wong', where: 'Case 5. The lift engineer at Menara Sinar.', met: opened('case05') },
  { id: 'hamidah', at: 'case05', name: 'Hamidah Yusof', where: 'Case 5. The deputy public prosecutor.', met: solvedLv('case05', 'c5_th') },
  { id: 'rosli', at: 'case05', name: 'Fire Officer Rosli', where: 'Bomba. He sealed Level 14.', met: any(solvedLv('case05', 'c5_07'), opened('case06')) },
  { id: 'makteh', at: 'case05', name: 'Mak Teh', where: 'Case 5. The warung on Jalan Raja Muda Musa, Kampung Baru.', met: solvedLv('case05', 'c5_13') },
  { id: 'bishnu', at: 'case05', name: 'Bishnu Thapa', where: 'Case 5. Night guard at Menara Sinar.', met: solvedLv('case05', 'c5_05') },
  { id: 'muthu', at: 'case07', name: 'Muthu', where: 'Case 7. The old man who brought you a teh at table six.', met: opened('case07') },
];

export const UNMET_ID = 'char:unmet';

/**
 * Every named person this player has met in the cases they have reached, in story order, then the
 * way out. { id, name, where, img?, look? }
 */
export function candidates(save) {
  const out = [];
  const seen = new Set();
  const push = (cand) => {
    const key = cand.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(cand);
  };
  for (const p of PEOPLE) if (p.met(save)) push({ id: `char:${p.id}`, name: p.name, where: p.where, img: null });
  for (const caseId of CASE_ORDER) {
    const c = CASES[caseId];
    const cs = csOf(save, caseId);
    if (!c || !cs) continue;
    let known = [];
    try { known = revealedSuspects(c, cs); } catch { known = []; }
    for (const s of known) {
      push({ id: `${caseId}:${s.id}`, name: s.name, where: `${caseLabel(c)}, ${c.title}. ${s.role}.`, img: s.img, look: s.look });
    }
  }
  // story order: the case each person belongs to, then the order met inside it
  const order = (cand) => {
    const p = PEOPLE.find((x) => `char:${x.id}` === cand.id);
    return CASE_ORDER.indexOf(p ? p.at : cand.id.split(':')[0]);
  };
  const ranked = out.map((cand, i) => ({ cand, i, o: order(cand) })).sort((a, b) => a.o - b.o || a.i - b.i).map((x) => x.cand);
  ranked.push({ id: UNMET_ID, name: 'Someone I have not met yet', where: 'Nobody in the files so far.', img: null });
  return ranked;
}

/** The id of the last case closed, in story order (null before the first verdict). */
export function lastClosedCase(save) {
  let last = null;
  for (const id of CASE_ORDER) if (csOf(save, id)?.closedAt) last = id;
  return last;
}
