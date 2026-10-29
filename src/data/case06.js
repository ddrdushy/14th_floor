// CASE 6: BLACK FLOOR. Warehouse 6, Bay 3, Pulau Indah, Port Klang, and Klang town.
// Truth (writers only): HOMICIDE AND ARSON, five years to the night after the first fire.
// On 13 August 2021 Kamal Ariffin, then a Bomba fireman at Balai Bomba Pulau Indah moonlighting for Sinar,
// poured petrol in an L from Bay 3's side door to the reefer socket bank and lit it (Ong Wei Jie had opened
// RU-11 the day before). The detective and Daniel Raj were inside. Penolong Penguasa Bomba Ismail Bakar, the
// officer in charge, held his crew at the door for six minutes because a man at the tape told him to: the
// Chairman, in a white shirt, smoking, with a silver flip-top lighter ("Biarkan, Tuan Ismail. Biar dua-dua
// sekali."). Ismail's breast-pocket microcassette caught it. Daniel dragged the detective out and vanished.
// Ismail wrote his first draft "PUNCA: SENGAJA" (deliberate), then signed "electrical fault" and took
// RM 200,000 from Sinar Cold Chain, Port Klang, authorised by J. Ho. He cut the tape and kept the pieces.
// Five years on, Ismail (59, retired 2023, sleepless, at the surau for every prayer since the spring) rang
// Restoran Bala on Tuesday 11 August asking for "the detective from the fire": Bay 3, Thursday, midnight,
// he would bring the photographs. He made Bala Anne promise to hand the message over only on Thursday night.
// Both lines were tapped (BALA, BRICKFIELDS and I. BAKAR, RUMAH): the Level 14 listening room had moved, with
// the 111-carton archive, to the mezzanine of Bay 2, Warehouse 6.
// Thursday 13 August 2026: 18:02 Kamal (Sinar Cold Chain fire safety officer since 2022, dismissed from Bomba
// that year) isolated Bay 3's alarm zone and at 18:10 closed sprinkler riser 3. 19:40 the Chairman came in
// person in a black car with no plates, did not get out, and handed Jeffrey Ho a silver lighter through the
// back window: a copy of Daniel's, D.R., broken R and all, ordered from Mani's in Klang in August 2016 by
// telephone, no name, and lit by the Chairman ever since ("Beside him. The detective will understand."). 21:05 RU-07
// (the third of the 2021 "write-offs") left by the back gate on a prime mover, GPS off, 200 L in its genset,
// with the archive inside (and Daniel, if Sinar took him from Kampung Baru), south to the old Sinar Pengangkutan
// yard at Jugra. 23:46 a hoax call sent Balai Bomba Pulau Indah's only night pump to an empty factory.
// 23:48 Ismail was waved in ("let the old man in"); 23:52 his son Amirul was turned away at the gate.
// 23:55 Kamal met Ismail at Bay 3's side door, killed him with one blow of a Halligan bar, took his phone and
// the envelope of photographs, laid the lighter by his right hand, poured the same L and lit it; 00:02 he
// padlocked the door and drove to the guardhouse; 00:09 he rang 994 himself. 00:20 Jeffrey, who had left the
// Klang Hokkien Association dinner at 19:20, rang the Chairman's prepaid (on the Jugra mast) from the
// mezzanine: "Dah." He was back at the dinner for the lucky draw at 00:44. Kamal was paid RM 80,000 in cash.
// Tan Kok Fook ("Ah Fook"), 29, Pandamaran diesel thief with a 2019 conviction on Ismail's evidence, was at
// the fence behind Bay 4 siphoning reefer gensets. He saw the black car, RU-07 leave, the man in the vest;
// he crawled under the roller shutter and tried to drag Ismail out by the collar (dead already), burned both
// hands, took the torch, and ran. Innocent of murder. Amirul Ismail, 31, argued with his father at dinner
// (the 2021 money paid for his house), followed him, was turned away at the gate, saw the glow and fled,
// then lied that he was home. Innocent.
// The Chairman: not named, not seen. Case 6 gives the player his VOICE only (Ismail's 2021 tape, and the
// 2:10 AM call to the BALA line at the end). Private note: his identity is still undecided; nothing in this
// case (the 2016 engraving order, the table-seven stranger, the black car) may pin it to a person.
// If DANIEL_TAKEN, Daniel was in RU-07: he is rescued exactly when ARCHIVE_SEIZED.

// Daniel's fate from Case 5: safe in Farah's house, remanded at Sungai Buloh, or taken by Sinar.
const TAKEN = (f) => !!f.DANIEL_TAKEN || !f.DANIEL_FOUND;
const SAFE = (f) => !TAKEN(f) && !f.DANIEL_CHARGED;
const PRISON = (f) => !TAKEN(f) && !!f.DANIEL_CHARGED;

const WHERE = [
  { id: 'westport', label: 'Westport, berth 9: the Singapore feeder', note: 'Its sister unit RU-19 went to Singapore this way in the spring. The feeder sails at six on Monday morning.' },
  { id: 'northport', label: 'North Port, Gate 2: a reefer stack bound for Colombo', note: 'A Sinar Cold Chain reefer was gated in at North Port at 10:12 PM on Thursday, an hour after RU-07 left Warehouse 6.' },
  { id: 'jugra', label: 'The old Sinar depot, Jugra', note: 'Sinar\'s first lorry yard, 1986, in the oil palm under Bukit Jugra. Nobody has worked there since 1999.' },
  { id: 'ketam', label: 'An ice barge off Pulau Ketam', note: 'Telok Gong fishermen saw a landing craft with a reefer on its deck heading out to the island at one in the morning.' },
];

const TAPE_LINE = { who: 'A voice', orig: 'Biarkan, Tuan Ismail. Biar dua-dua sekali.', en: 'Let it burn, Tuan Ismail. Both of them.' };

export const CASE06 = {
  id: 'case06',
  number: 6,
  title: 'Black Floor',
  place: 'Warehouse 6, Pulau Indah, Port Klang',
  victim: 'Ismail bin Bakar, 59, retired Bomba fire investigator. Found on the floor of Warehouse 6, Bay 3, at 6:10 AM on Friday.',
  question: 'Who killed Ismail Bakar?',
  brief: 'Five years to the night after the fire, the new roof of Warehouse 6, Bay 3 catches. At dawn Bomba find one body on the black floor and, beside it, a silver flip-top lighter engraved D.R. A retired fire investigator had asked to meet you there at midnight. You were forty minutes late. Klang Selatan would like to know why, and Farah has had to ask you where your own lighter is.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end of this one: who killed Ismail Bakar and burned Bay 3, and where RU-07 went with everything that was in it. Farah gets one team and one dawn. Nobody will tell you if you get either of them right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Rosli sent a photograph of Ismail Bakar\'s old locker at the Pulau Indah station, emptied, with his name still on the door.',
  deduction: {
    lede: 'Farah will arrest whoever you name for the death of Ismail Bakar and the fire in Bay 3, on your word and her own signature. Name everyone who planned it or carried it out, and only them.',
    button: 'Tell Farah',
    confirm: 'Farah will arrest {names}. Puan Rohana will hear it from you, at the graveside, after Zohor.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Farah',
    questions: [
      {
        id: 'ru07', q: 'Where is RU-07?', short: 'Farah\'s team goes to',
        lede: 'Since Thursday night a reefer unit with the Chairman\'s memory inside, and whatever else was in Bay 2, has been running on two hundred litres of diesel. Farah can send one team, once, at dawn on Monday. Whatever she raids, the people who moved it will hear about within the hour.',
        options: WHERE,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy
  // in cases.js). Until it is solved they are not on the map, the board or the office wall.
  suspects: [
    {
      id: 'ahfook', name: 'Tan Kok Fook', role: '"Ah Fook". Lorry driver and diesel thief, Pandamaran. 29', img: 'sus_ahfook',
      revealedBy: 'c6_03',
      revealLine: 'His print is on a diesel can by a fresh hole in the fence behind Bay 4, and his blood is on the wire. Klang Selatan already have his name on their board.',
      look: { skin: '#f1d2b6', hair: 'short', hairColor: '#6e4a2c', coat: 'leather', eyewear: 'none', mark: 'stubble' },
      motive: 'In 2019 Ismail Bakar gave the evidence that put him away for a diesel fire at a Pandamaran depot. Half of Pandamaran heard him swear he would pay the old man back.',
      claim: 'Says he was at home in Pandamaran with his mother all Thursday night.',
    },
    {
      id: 'kamal', name: 'Kamal Ariffin', role: 'Fire safety officer, Sinar Cold Chain. Ex-Bomba. 46', img: 'sus_kamal',
      revealedBy: 'c6_04',
      revealLine: 'Bay 3\'s alarm zone was isolated "for maintenance" at 6:02 on Thursday evening by Sinar\'s fire safety officer. Until 2022 he was a fireman at Balai Bomba Pulau Indah, on Ismail Bakar\'s watch.',
      look: { skin: '#b97f55', hair: 'shaved', hairColor: '#9a9a9a', coat: 'leather', eyewear: 'none', mark: 'scar' },
      motive: 'None known. Twenty years in Bomba at Pulau Indah, on Ismail\'s watch the night Bay 3 burned in 2021. Dismissed in 2022; hired by Sinar Cold Chain the same month.',
      claim: 'Says he isolated Zone 3 for a faulty sensor, sat in the guardhouse from eleven, and rang Bomba the moment he saw smoke.',
    },
    {
      id: 'amirul', name: 'Amirul Ismail', role: 'Ismail\'s son. Property negotiator, Klang. 31', img: 'sus_amirul',
      revealedBy: 'c6_05',
      revealLine: 'He shouted at his father over Thursday dinner, left ten minutes after him, and rang his mother at one in the morning to say the warehouse was burning.',
      look: { skin: '#d9a77f', hair: 'side-part', hairColor: '#151210', coat: 'blazer', eyewear: 'none', mark: 'none' },
      motive: 'His father was going to confess. The money from 2021 paid for the house Amirul lives in, and a confession would take the house, the pension and the family name with it.',
      claim: 'Says he drove straight home to Bukit Tinggi after dinner and was asleep by midnight.',
    },
    {
      id: 'jeffrey', name: 'Jeffrey Ho', role: 'General Manager, Sinar Cold Chain, Port Klang. 57', img: 'sus_jeffrey',
      revealedBy: 'c6_06',
      revealLine: 'The RM 200,000 that bought Ismail\'s signature in 2021 came from Sinar Cold Chain, Port Klang, and one man authorised it: J. Ho.',
      look: { skin: '#f1d2b6', hair: 'side-part', hairColor: '#9a9a9a', coat: 'blazer', eyewear: 'none', mark: 'none' },
      motive: 'None known. Thirty-nine years with Sinar, from one lorry in 1987 to Warehouse 6. In 2021 his signature is on the cheque that closed Bay 3\'s file.',
      claim: 'Says he was at the Klang Hokkien Association dinner on Jalan Meru from seven until half past twelve, in front of two hundred people.',
    },
  ],

  opening: [
    {
      img: 'c6_intro_01_docket', mood: 'warm', fx: ['rain'], place: 'Brickfields. Thursday, 11:15 PM.', music: 'office',
      lines: [
        { who: null, en: 'Bala Anne comes up the stairs himself, which he never does after closing, with a page torn from his order pad.' },
        { who: 'Bala Anne', orig: 'Thambi. Unakku oru phone vandhuchu. Rendu naal munnaadi.', en: 'Boy. A phone call came for you. Two days ago.' },
        { who: 'Bala Anne', en: 'An old Malay man, very polite. He asked for the detective from the fire. He made me promise to give it to you tonight and not before. I promised. Do not look at me like that.' },
        { who: null, en: 'On the page, in his capitals: BAY 3. KHAMIS. 12 MALAM. 5 TAHUN. SAYA BAWA GAMBAR. I.B. Bay 3, Thursday, midnight, five years. I will bring photographs.' },
        { who: null, en: 'Across Jalan Tun Sambanthan a grey sedan is parked where nobody parks after eleven. WXY 1408. By the time you come down with your keys, it has gone.', when: (f) => f.JASON_FREE },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c6_intro_02_bridge', mood: 'night', fx: ['rain'], place: 'Lebuhraya Shapadu. 12:30 AM.',
      lines: [
        { who: null, en: 'You make Port Klang in thirty-five minutes, which is not possible, and see the glow from the Pulau Indah bridge, which is.' },
        { who: null, en: 'The sky over the port is orange. You know which bay it is before you can see it.' },
      ],
      kb: { from: [1.0, -3, 0], to: [1.08, 3, 0] },
    },
    {
      img: 'c6_intro_03_burning', mood: 'fire', fx: ['fire', 'rain'], place: 'Warehouse 6, Pulau Indah. 12:40 AM.', sfx: 'fire', music: 'panic',
      lines: [
        { who: null, en: 'Five years to the night, you watch Bay 3 burn again. This time you are on the right side of the tape.' },
        { who: null, en: 'The new roof goes the way the old one went: all at once, with a sound like a long breath let out.' },
        { who: null, en: 'Your chest is a fist. Count the cranes. One. Two. Three.' },
      ],
      kb: { from: [1.12, 0, 0], to: [1.02, 0, 0] },
    },
    {
      img: 'intro_03_fire', mood: 'fire', fx: ['fire', 'shake'], place: 'Port Klang. August 2021.', music: 'memory',
      lines: [
        { who: null, en: 'And under the roar, something you have never let yourself remember: a voice outside the smoke, calm as a man ordering tea, saying a name you did not know then.' },
        TAPE_LINE,
        { who: 'Daniel Raj', orig: 'Jangan tengok belakang.', en: 'Don\'t look back.' },
      ],
      kb: { from: [1.18, 0, 0], to: [1.04, 0, 0] },
    },
    {
      img: 'c6_intro_04_floor', mood: 'day', fx: ['dust'], place: 'Bay 3. Friday, 6:10 AM.', music: 'tension',
      lines: [
        { who: null, en: 'At first light Bomba walk in on the black floor. One body, on its side by the old reefer sockets, where the other one lay in 2021.' },
        { who: null, en: 'Beside its right hand, a silver flip-top lighter.' },
      ],
      kb: { from: [1.0, 0, 2], to: [1.14, 0, -2] },
    },
    {
      img: 'c6_intro_05_farah', mood: 'police', fx: ['rain', 'siren'],
      lines: [
        { who: 'Inspector Farah Iskandar', en: 'Engraved inside the lid. D.R. Klang Selatan read it before I did.' },
        { who: 'Inspector Farah Iskandar', orig: 'Mana kau punya?', en: 'Where is yours?' },
        { who: null, en: 'Your hand is already in your pocket. You put Daniel\'s lighter on the bonnet of her car, and she looks at the two of them side by side for a long time.' },
        { who: 'Inspector Farah Iskandar', en: 'Daniel\'s twin is in his pocket, in a house I have not told you about. My man watched him take it out at five this morning. He was there all night.', when: SAFE },
        { who: 'Inspector Farah Iskandar', en: 'Daniel\'s twin is in a property bag at Sungai Buloh, sealed, with his belt and his shoelaces. I rang the prison at five.', when: PRISON },
        { who: 'Inspector Farah Iskandar', en: 'Daniel\'s twin is in my evidence locker at Bukit Aman. I took it out of a glass of tea in Kampung Baru with my own hands.', when: TAKEN },
        { who: 'Inspector Farah Iskandar', en: 'So that makes three.' },
        { who: 'Inspector Farah Iskandar', en: 'Klang Selatan have a superintendent at Bukit Aman telling them you were here at twelve forty. You were. They want you for twenty-four hours. They are not getting you.', when: (f) => !f.KHAIRUL_WRONGED },
        { who: 'Inspector Farah Iskandar', en: 'Khairul is suspended, so for once nobody is ringing Klang about me. I have a week. After that they will want you for twenty-four hours.', when: (f) => f.KHAIRUL_WRONGED },
        { who: 'Inspector Farah Iskandar', en: 'And Azman rang me from his crane. He says the reefer that went aboard the Singapore feeder in the spring, RU-19, swung like an empty box. He has lifted ten thousand. He knows the swing.', when: (f) => f.AZMAN_ALIVE },
      ],
      kb: { from: [1.05, 0, 0], to: [1.12, 0, -2] },
    },
    {
      img: 'c6_intro_06_rosli', mood: 'day', fx: ['dust'],
      lines: [
        { who: null, en: 'Penolong Penguasa Bomba Rosli drives down from Kuala Lumpur without being asked, still in yesterday\'s uniform.' },
        { who: 'Fire Officer Rosli', en: 'I know whose watch that is. Tuan Ismail Bakar. Thirty-seven years in Bomba. He taught me to read a floor.' },
        { who: 'Fire Officer Rosli', en: 'In 2021 he wrote this bay up as an electrical fault. He was the best fire investigator in Selangor. The best do not get that wrong by accident.' },
        { who: 'Fire Officer Rosli', en: 'When the coroner gave your boy in Cheras his real name back, Tuan Ismail stopped coming to the station on Fridays. He said he could not pray in a row with honest men.', when: (f) => f.BODY_NAMED },
        { who: 'Fire Officer Rosli', en: 'He retired in 2023 and never set foot in the station again. Not once. Not even for the Hari Raya open house.', when: (f) => !f.BODY_NAMED },
      ],
      kb: { from: [1.08, 1, 0], to: [1.0, -1, 0] },
    },
    { title: { kicker: 'Case 6', name: 'Black Floor' }, fx: ['rain'] },
  ],

  levels: [
    // ---------------- Bay 3 ----------------
    {
      id: 'c6_01', phase: 'Bay 3', title: 'The black floor',
      game: 'wordsearch', variant: 'secret',
      brief: 'Bomba\'s officer-in-charge listed everything on the floor of Bay 3 before the body was moved, in capitals, on a clipboard that is now grey with ash. Rosli copies it out for you on the bonnet of his car. Find every item. The letters nobody used will tell you what the list leaves out.',
      params: {
        size: 12,
        words: ['LIGHTER', 'WATCH', 'GLASSES', 'KEYS', 'BELT', 'SANDAL', 'SONGKOK', 'CABLE', 'SOCKET', 'PADLOCK', 'RING', 'PEN', 'WALLET', 'BUTTON'],
        extra: ['ASH', 'SOOT', 'HOSE', 'FOAM', 'TRUSS', 'BEAM', 'DRAIN', 'CHAIN', 'SMOKE', 'EMBER', 'TARP', 'VALVE', 'TILE', 'GRATE'],
        message: 'SPRINKLERSOFF',
        messageSpaced: 'SPRINKLERS OFF',
      },
      evidence: {
        img: 'ev_c6_lighter', hotspot: { x: 0.44, y: 0.46, r: 0.13 },
        title: 'Lit a thousand times',
        short: 'Beside the body\'s right hand: a silver flip-top lighter engraved D.R. inside the lid, its wick burnt black and its flint wheel worn bright from years of use. Yours and Daniel\'s have never been lit. On the wrist, a Bomba long-service watch: I. BAKAR. And Bay 3\'s sprinklers never came on.',
        text: 'Wallet, keys, spectacles, a songkok burnt down to its wire frame, one sandal, a belt buckle, a pen. No phone, and no envelope. A steel watch with the Bomba crest on the dial and an engraving on the back that Rosli reads without needing to: I. BAKAR, 30 TAHUN BERKHIDMAT, 2016. Beside the right hand, a silver flip-top lighter with D.R. engraved inside the lid in the same hand as yours, down to the broken tail on the R. You open both lids side by side on Farah\'s bonnet. Yours has a white wick and a flint wheel with the factory edges still on it. This one has a wick burnt black and a wheel worn smooth by a thumb, thousands of times. Neither you nor Daniel has ever smoked. Somebody has, for years, with your lighter. And at the bottom of the clipboard, the line nobody copied: the sprinkler heads over Bay 3 are dry. They never came on.',
      },
    },
    {
      id: 'c6_02', phase: 'Bay 3', title: 'Reading the floor',
      game: 'series', variant: 'classic',
      brief: 'Rosli has walked fire scenes for eighteen years, and Ismail Bakar taught him the first five. He kneels on the black floor with a depth gauge and a notebook and talks to you the way Ismail talked to him: in numbers, because numbers do not lie to make you feel better. Finish his runs.',
      params: {
        items: [
          { prompt: 'Char depth along the darkest trail from the side door, millimetres, one reading a metre: 3, 6, 12, 24, ?', answer: 48, hint: 'It doubles every metre. The petrol pooled deeper as the floor fell away.' },
          { prompt: 'Litres poured, read off the width of the stain every two metres: 20, 17, 14, 11, ?', answer: 8, hint: 'Three litres less every two metres.' },
          { prompt: 'Roof purlins down, counted from the door every two minutes once the roof caught: 1, 2, 4, 7, 11, ?', answer: 16, hint: 'One more each time than the time before: +1, +2, +3, +4 …' },
          { prompt: 'The tide at Telok Gong, centimetres above datum, every hour from midnight: 90, 150, 210, 270, ?', answer: 330, hint: 'Sixty more every hour.' },
          { prompt: 'Ismail Bakar\'s promotions, by year, from the day he joined: 1986, 1993, 2000, 2007, ?', answer: 2014, hint: 'Seven years each time.' },
          { prompt: 'Balai Bomba Pulau Indah\'s night turnouts this year, minutes from call to scene: 4, 6, 5, 7, 6, ? (the next call, by the pattern)', answer: 8, hint: 'Up two, down one, up two, down one. On Thursday it took twenty-two.' },
        ],
      },
      evidence: {
        img: 'ev_c6_trail', hotspot: { x: 0.47, y: 0.45, r: 0.15 },
        title: 'The same L',
        short: 'The deepest char runs in an L from Bay 3\'s side door to the old reefer socket bank: a pour trail of petrol, not a fault. Rosli lays the 2021 Bomba floor sketch over it from the coroner\'s file. The same L, to the metre. Five years ago Ismail Bakar signed this floor off as an electrical fault.',
        text: 'A fire that starts in a socket burns up the wall and out. This one ran along the floor first, low and fast, in a line that bends once, like a man walking from a door to a wall and turning left. Rosli takes the 2021 file out of his car, the one the coroner keeps, and unfolds Ismail Bakar\'s own floor sketch of Bay 3 on the black concrete. In 2021 Ismail drew the same L and wrote beside it "kesan kabel cair": melted cable. Rosli puts his hand flat on the floor where the two lines meet. "Same door, same turn, same wall. He knew it was petrol in 2021, and he wrote cable. Whoever lit Thursday\'s fire knew exactly where the first one ran, because they ran it."',
      },
    },
    {
      id: 'c6_03', phase: 'Bay 3', title: 'Behind Bay 4',
      game: 'fingerprint', variant: 'classic',
      brief: 'Behind Bay 4 the chain-link fence has a fresh cut in it at knee height, and in the wet grass there is a jerry can, a siphon hose and the tracks of a small motorbike. The can smells of diesel, not petrol. There is blood on the cut wire. Klang Selatan\'s lifter got one clean print off the handle before the rain came back. Classify it, then find its owner.',
      params: {
        liftLabel: 'Lift: handle of a diesel jerry can, fence behind Bay 4, Warehouse 6',
        liftAria: 'Partial fingerprint lifted from the plastic handle of a jerry can',
        candidates: [
          { id: 'ahfook', name: 'Tan Kok Fook (diesel theft, 2019)' },
          { id: 'ismail', name: 'Ismail Bakar (Bomba service record)' },
          { id: 'guard', name: 'Dil Bahadur Gurung (night guard)' },
          { id: 'selvam', name: 'Selvam Muniandy (reefer technician)' },
          { id: 'hafiz', name: 'Hafiz Ramli (forklift driver)' },
          { id: 'seng', name: 'Lim Ah Seng (ice barge, Telok Gong)' },
          { id: 'daniel', name: 'Daniel Raj (agency licence, 2016)' },
          { id: 'you', name: 'You (agency licence, 2016)' },
        ],
        answer: 'ahfook',
      },
      evidence: {
        img: 'ev_c6_fence', hotspot: { x: 0.30, y: 0.73, r: 0.13 },
        title: 'A diesel man',
        short: 'The print on the diesel can is Tan Kok Fook\'s, "Ah Fook", 29, of Pandamaran: eighteen months in 2019 for siphoning diesel, on the evidence of a Bomba investigator called Ismail Bakar. His blood is on the cut wire. Klang Selatan have already written his name on their board, under yours.',
        text: 'Tan Kok Fook, known to every lorry park between Pandamaran and Telok Gong as Ah Fook. In Malay they call what he does kencing minyak: he siphons diesel out of parked lorries and reefer generators at night and sells it by the jerry can to fishing boats. In 2019 a fire at a Pandamaran fuel depot was traced to a siphon he left running, and the investigator who stood up in the Klang sessions court and said so was Ismail Bakar. Ah Fook got eighteen months. When he came out he told a kopitiam full of people that he would pay the old man back. The blood on the wire is fresh and it is his. On Klang Selatan\'s whiteboard his name has been written under yours, with an arrow from one to the other that nobody has bothered to rub out.',
      },
    },

    // ---------------- Balai Bomba Pulau Indah ----------------
    {
      id: 'c6_04', phase: 'Balai Bomba Pulau Indah', title: 'Twenty-two minutes',
      game: 'fusebox', variant: 'classic',
      brief: 'Balai Bomba dan Penyelamat Pulau Indah is four kilometres from Warehouse 6, and on Thursday night it took twenty-two minutes to get there. The station\'s alarm board, which watches every big warehouse on the island, tripped out in the small hours and came back with every breaker scrambled. The watch commander lets you try, because Ismail Bakar\'s photograph is still on his wall. Turn every breaker on.',
      params: {
        size: 5, pattern: 'plus', presses: 7,
        clue: 'The watch commander: "Tuan Ismail wired this board himself in 1998. He labelled every breaker. Somebody has peeled the labels off."',
      },
      evidence: {
        img: 'ev_c6_alarmboard', hotspot: { x: 0.45, y: 0.30, r: 0.14 },
        title: 'Isolated for maintenance',
        short: 'The board\'s memory: Warehouse 6, Zone 3 (Bay 3) isolated at 18:02 on Thursday by user FSO K. ARIFFIN, "maintenance". Sprinkler riser 3 closed at 18:10, its alarm silenced. At 23:46 a hoax call sent the station\'s only night pump to an empty factory. The real call came at 00:09.',
        text: 'The lamps come back one row at a time and the thermal printer starts talking. Thursday, 18:02: Warehouse 6, Zone 3, Bay 3, isolated. User: FSO K. ARIFFIN. Reason: maintenance. 18:10: sprinkler riser 3, valve tamper, acknowledged and silenced by the same user. 23:46: a 994 call from a prepaid number, a fire at a factory in the Pulau Indah industrial park; the station\'s one night pump turns out and finds a locked gate and nothing burning. 00:09: a call from the Warehouse 6 guardhouse, Bay 3 well alight, the caller giving his name and title. The pump reaches Bay 3 at 00:31. Kamal Ariffin is Sinar Cold Chain\'s fire safety officer. Before that he was twenty years a fireman at this station, and in August 2021 he was on Ismail Bakar\'s watch. "He knew this board," the watch commander says. "And he knew we only have one pump at night."',
      },
    },

    // ---------------- Taman Sri Andalas ----------------
    {
      id: 'c6_05', phase: 'Taman Sri Andalas', title: 'Thursday dinner',
      game: 'witness', variant: 'statement',
      brief: 'Ismail Bakar lived in a corner terrace house in Taman Sri Andalas, Klang, with a mango tree he was always threatening to cut down. His widow has had people in her kitchen since Subuh: neighbours, Bomba men, a policeman who wanted to know whether her husband smoked. She will tell you Thursday once.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Statement of Rohana binti Hashim, 57. Taman Sri Andalas, Klang. Recorded Friday, 3:10 PM.',
        introLine: 'Puan Rohana folds her hands on the kitchen table, next to the plate nobody has cleared. "Sekali saja. Once. I can say it once."',
        retryLine: 'She closes her eyes and starts again from the beginning, in exactly the same words.',
        statement: [
          'Ismail was in Bomba for thirty-seven years, most of it at Pulau Indah. He retired in 2023, and since then he sleeps three hours a night. In April he started going to the surau for every prayer, even Subuh, which he never did for anybody.',
          'On Tuesday night, after Isyak, he rang a restaurant in Brickfields from the house phone and asked for the detective from the fire. He made the man promise to give the message only on Thursday night, not before. He told me: by Thursday it will be too late for me to change my mind.',
          'On Thursday our son Amirul came for dinner. Ismail told him he was going to give back what he took in 2021. Amirul stood up so fast his chair fell over. He shouted, Abah nak hancurkan kita semua? Do you want to destroy all of us? Ismail did not shout back.',
          'At ten past eleven Ismail put on his old Bomba jacket, took his big torch and a brown envelope, and drove off in the Saga. Amirul left ten minutes after him in his silver Honda. He told me he was going home to Bukit Tinggi.',
          'At one in the morning Amirul rang me, crying so much I could not understand him. He said only: Mak, the warehouse is burning. Then he said he was at home. I have known that boy thirty-one years. He was not at home.',
        ],
        questions: [
          { q: 'How long was Ismail in Bomba?', options: ['Twenty years', 'Thirty years', 'Thirty-seven years', 'Forty years'], a: 2 },
          { q: 'When did he ring the restaurant in Brickfields?', options: ['Monday morning', 'Tuesday night', 'Wednesday night', 'Thursday evening'], a: 1 },
          { q: 'When did he want the message given?', options: ['At once', 'Only on Thursday night', 'Only on Friday', 'Only if he died'], a: 1 },
          { q: 'Who came to dinner on Thursday?', options: ['Rosli', 'Their son Amirul', 'A man from Sinar', 'Nobody'], a: 1 },
          { q: 'What did Ismail say he was going to do?', options: ['Go to the police', 'Leave the country', 'Give back what he took in 2021', 'Sell the house'], a: 2 },
          { q: 'What did he take with him?', options: ['His phone and his wallet', 'His Bomba jacket, his torch and a brown envelope', 'A jerry can', 'Only his car keys'], a: 1 },
          { q: 'When did he leave?', options: ['Half past ten', 'Ten past eleven', 'Half past eleven', 'Midnight'], a: 1 },
          { q: 'What did Amirul drive?', options: ['A white Myvi', 'A black Mercedes', 'A silver Honda', 'A Sinar pickup'], a: 2 },
          { q: 'What did Amirul say when he rang at one?', options: ['Nothing at all', 'Mak, the warehouse is burning', 'Abah is safe', 'Call the police'], a: 1 },
        ],
      },
      evidence: {
        img: 'ev_c6_kitchen', hotspot: { x: 0.73, y: 0.55, r: 0.15 },
        title: 'Abah nak hancurkan kita semua?',
        short: 'On Thursday Ismail told his son he was going to give back what he took in 2021. Amirul knocked his chair over shouting, left ten minutes after his father in a silver Honda, said he was going home to Bukit Tinggi, and rang his mother at one in the morning to say the warehouse was burning.',
        text: 'The chair is still on its back by the kitchen table; Puan Rohana has not been able to pick it up. Thirty-seven years in Bomba, a man who slept three hours a night after he retired, and who on Tuesday rang a restaurant in Brickfields and made its owner promise to hold the message for two days, so that he could not take it back. On Thursday his son learned what "give back what I took in 2021" would mean for a house in Bukit Tinggi bought the year after the fire, and shouted the question every family in Klang would have shouted. Ismail left at 11:10 with his torch and an envelope. Amirul left at 11:20. At one o\'clock Amirul knew the warehouse was burning, which was not yet on the radio, and said he was at home. His mother does not believe him, and she does not want you to see that she does not.',
      },
    },
    {
      id: 'c6_06', phase: 'Taman Sri Andalas', title: 'One drawer',
      game: 'safecracker', variant: 'classic',
      brief: 'In the small room Ismail called his office there is a grey steel filing cabinet with a four-digit lock that Puan Rohana has never opened. "Thirty-four years married," she says, "and he had one drawer." She knows how he chose numbers.',
      params: {
        digits: 4, tries: 8, bonus: 4, repeats: true,
        fixed: { 1: 1, 2: 9 },
        clue: 'Puan Rohana: "The year he joined Bomba. He always told it the same way: the year the comet came back, and he went up on the station roof at night to see it, and the clouds came over."',
      },
      evidence: {
        img: 'ev_c6_cabinet', hotspot: { x: 0.50, y: 0.56, r: 0.13 },
        title: 'Punca: sengaja',
        short: 'In the drawer: Ismail\'s carbon of his first draft on Bay 3, August 2021: "Punca: SENGAJA. Bahan pecut: petrol." Cause: deliberate. A bank slip, September 2021: RM 200,000 from Sinar Cold Chain, Port Klang, "consultancy", authorised J. Ho. And a matchbox full of cut microcassette tape.',
        text: 'One thousand nine hundred and eighty-six, the year of Halley\'s comet, and the lock gives. Inside, three things, in the order a man puts things he means somebody to find. First, a carbon copy in Ismail\'s own hand, dated 14 August 2021, on a Bomba report form: "Punca kebakaran: SENGAJA. Bahan pecut: petrol. Corak curahan berbentuk L, dari pintu sisi ke soket." Cause of fire: deliberate. Accelerant: petrol, poured in an L from the side door to the sockets. The report the coroner has says electrical fault. Second, a Maybank deposit slip for RM 200,000, 20 September 2021, from Sinar Cold Chain (M) Sdn Bhd, Port Klang, "professional consultancy", authorised by J. Ho, General Manager. Third, a Bomba-issue matchbox, and inside it a nest of thin brown tape cut into short lengths with a pair of scissors. Puan Rohana looks at the slip and sits down on the floor. "The house," she says. "Amirul\'s house."',
      },
    },
    {
      id: 'c6_07', phase: 'Taman Sri Andalas', title: 'Both of them',
      game: 'tape', variant: 'splice',
      brief: 'For thirty years Ismail Bakar dictated his notes at every fire into a recorder in his breast pocket. The matchbox holds the tape from the night of 13 August 2021, cut into pieces with his wife\'s sewing scissors. He cut it, and then he could not throw it away. Rosli finds an old microcassette deck at the station. Put the pieces back in order.',
      params: {
        line: TAPE_LINE,
        pieces: 5,
        label: 'BBP PULAU INDAH · W6 BAY 3 · 14.8.21 · 00:41',
        clue: 'Behind the voice, twice, the snap of a flip-top lid.',
      },
      evidence: {
        img: 'ev_c6_microcassette', hotspot: { x: 0.50, y: 0.52, r: 0.18 },
        title: 'Let it burn',
        short: 'Spliced back: a man\'s voice at the tape line at 12:41 AM on 14 August 2021, close to Ismail\'s pocket, calm as a man ordering tea: "Biarkan, Tuan Ismail. Biar dua-dua sekali." Let it burn. Both of them. You and Daniel were inside Bay 3. It is the voice from your dream.',
        text: 'The tape hisses, and then there is a fire on it: the roar, a hose coupling, men shouting in Malay. Then a voice very close to the microphone, as if its owner has stepped up to Ismail and put a hand on his shoulder. Not loud. Not hurried. "Biarkan, Tuan Ismail. Biar dua-dua sekali." Let it burn. Both of them. Behind it, twice, the snap of a flip-top lid opening and closing. Then Ismail\'s own voice, low, dictating into his pocket out of thirty years\' habit: "Kru ditahan di pintu. Enam minit." Crew held at the door. Six minutes. Then nothing but fire until the tape runs out. You were inside Bay 3 in those six minutes, and so was Daniel. You have heard this voice every night for five years and told yourself you made it up. Rosli stops the deck and does not look at you, which is a kindness.',
      },
    },

    // ---------------- Klang ----------------
    {
      id: 'c6_08', phase: 'Klang', title: 'Three, not two',
      game: 'rotation', variant: '2d',
      brief: 'Kedai Ukiran Mani has engraved trophies, watches and wedding rings on Jalan Tengku Kelana, in the middle of Klang\'s Little India, since 1971. Old Mani is seventy-eight and keeps every order book he ever filled. His son Vasu cuts the letters now, and will not let a stranger touch the books until you show him you can tell a punch from its mirror image. Every letter punch is cut backwards.',
      params: { trials: 12, target: 10, options: 4 },
      evidence: {
        img: 'ev_c6_orderbook', hotspot: { x: 0.21, y: 0.63, r: 0.17 },
        title: 'Three, not two',
        short: 'Mani\'s 2016 book: 12 August, two silver flip-top lighters engraved D.R. for Mr. Daniel Raj of Brickfields. 19 August, a third, "same as Mr. Raj\'s, exactly, the broken R also", paid in cash and collected by a driver. There is no customer\'s name. Only one word: Tuan.',
        text: 'Old Mani remembers Daniel before he finds the page. "Tall boy. Polite. He wanted two the same. I said, two D.R.? The other one is not D.R. He said, it is now. Partners." The page says 12 August 2016: two lighters, silver, flip-top, engraved D.R., Mr. Daniel Raj, Brickfields, paid. A week later, in the same book, in Mani\'s careful English: 19 August 2016, one lighter, same as Mr. Raj\'s, exact. Customer: Tuan. No name. Telephone order. Cash. Collected by driver. Vasu shows you the old punch Mani used for the R, with the chip in its tail that he never replaced. "Nobody asks for a mistake," old Mani says. "The man on the telephone asked for the mistake. He wanted it to be the same lighter. Not like it. The same." Daniel\'s licence and yours were issued in the first week of August 2016. The grey folder on your desk says Opened 2016.',
      },
    },
    {
      id: 'c6_09', phase: 'Klang', title: 'Before the fire',
      game: 'dna', variant: 'mixed',
      brief: 'Dr. Harjit Kaur, forensic pathologist at Hospital Tengku Ampuan Rahimah in Klang, does the post-mortem on Friday night with Klang Selatan waiting outside for a cause of death they have already written down. She identifies him against a cheek swab from his son, and then she keeps going. Read her bands.',
      params: { suspects: 7 },
      evidence: {
        img: 'ev_c6_collar', hotspot: { x: 0.48, y: 0.60, r: 0.14 },
        title: 'Dead before the fire',
        short: 'Ismail Bakar, identified by DNA against his son. No soot below his vocal cords: he was dead before the fire reached him, from one blow above the left ear with something narrow and forked. On his shirt collar, two people\'s blood: his own, and Tan Kok Fook\'s.',
        text: 'Dr. Kaur writes it in the order she found it. The body is Ismail bin Bakar; his son\'s swab settles it in an hour. There is no soot in the airway below the vocal cords and no carbon monoxide to speak of in the blood: he was not breathing when the fire reached him. The cause of death is one blow above the left ear with something narrow and heavy, with two prongs two centimetres apart. She draws the wound for Rosli on the back of a form. "Halligan bar," Rosli says at once. "Fork end. Every fire engine in Malaysia carries one." Then the collar. Two people\'s blood on it, soaked into the cotton where a hand would grab to drag a man: Ismail\'s, and a second profile already on the national database for diesel theft. Tan Kok Fook. Somebody with bleeding hands held Ismail Bakar by the collar after he was dead.',
      },
    },

    // ---------------- Telok Gong ----------------
    {
      id: 'c6_10', phase: 'Telok Gong', title: 'Kencing minyak',
      game: 'pursuit',
      brief: 'Pandamaran says Ah Fook drinks his kopi at the same kopitiam by the fish market every morning at six, with his hands in his lap so that nobody sees the bandages. On Saturday he sees you before you see him, and goes out through the kitchen.',
      params: {
        setting: 'docks',
        route: ['docks', 'docks', 'estate', 'estate', 'kampung', 'kampung'],
        legs: 6,
        beats: [
          'He goes over a stack of empty reefers on Pandamaran wharf like a cat, bandages and all.',
          'Off the wharf road and into the oil palm. Wet fronds, red mud, and the smell of fruit gone to rot.',
          'Between the palms, fresh tyre tracks from a prime mover that had no business here, heading south.',
          'Telok Gong: stilt houses, nets drying on the rails, and an auntie shouting at him in Hokkien from a doorway.',
          'He is making for the fish jetty, and the tide is out.',
        ],
        difficulty: 'medium',
        vehicle: 'foot',
        suspect: 'Ah Fook',
        clue: 'Both hands bandaged, and he still runs like a man who has done it all his life.',
      },
      evidence: {
        img: 'ev_c6_jetty', hotspot: { x: 0.40, y: 0.53, r: 0.10 },
        title: 'Bandaged hands',
        short: 'You bring Ah Fook down on the planks of the Telok Gong fish jetty. Both palms blistered under a sinseh\'s bandages. In his jacket: a heavy Bomba torch engraved I. BAKAR, BBP PULAU INDAH, with soot packed into the ring around its lens. Ismail took his big torch with him on Thursday night.',
        text: 'You bring him down on the planks with the tide out and half the village watching from the stilt houses. He screams when Farah\'s constable takes his wrists: both palms are blistered raw under bandages a Chinese medicine shop put on at two in the morning on Friday. In his jacket, heavy enough to have knocked the wind out of you both, a black rubber torch with the Bomba crest, engraved along the barrel: I. BAKAR, BBP PULAU INDAH. Soot is packed into the ring around the lens, and the switch is still on, the batteries flat. Puan Rohana said her husband took his big torch on Thursday night. Klang Selatan want Ah Fook in a cell in Klang by lunchtime. Farah gets him for one hour in the back room of the Telok Gong police post first.',
      },
    },
    {
      id: 'c6_11', phase: 'Telok Gong', title: 'Ah Fook',
      game: 'interrogation', variant: 'classic',
      brief: 'The police post at Telok Gong has one back room, a ceiling fan and a calendar from a fish wholesaler. Ah Fook sits with his bandaged hands on the table in front of him like something he has borrowed. Klang Selatan have already typed the charge: a record, a grudge, a dead man\'s torch and burnt hands. One thing he tells you is not true. Find it, and put the exhibit that breaks it in front of him.',
      params: {
        setting: 'The back room of the police post at Telok Gong. Saturday, 11:20 AM.',
        suspect: {
          id: 'ahfook', voice: 'voice_3', name: 'Tan Kok Fook ("Ah Fook")', role: 'Lorry driver and diesel thief, Pandamaran, 29',
          persona: 'Fast, cocky Pandamaran Malaysian English with "lah", "wei", "aiyo" and the odd Hokkien swear; calls Farah "madam" and the player "boss". Brags to cover fear, and goes quiet and sulky when his mother is mentioned. Terrified of Sinar and of being burned again: when the fire comes up he looks at his bandaged hands and stops joking.',
        },
        facts: [
          { id: 'f1', topic: 'his work', claim: 'I drive a fish lorry for a wholesaler in Pandamaran. Nights. Ice and fish, Telok Gong to the market.' },
          { id: 'f2', topic: 'his record', claim: 'Ya, I got record. Diesel, 2019. Eighteen months. I paid already, okay?' },
          { id: 'f3', topic: 'Ismail Bakar', claim: 'That old Bomba man gave evidence against me in 2019, the depot fire. Everybody in Pandamaran knows I hated him.' },
          { id: 'f4', topic: 'his mother', claim: 'My mother sells kuih at Pandamaran market. She is sixty-eight. Leave her out of this.' },
          { id: 'f5', topic: 'running', claim: 'I ran because a stranger was chasing me. In Pandamaran a stranger chasing you is never good news.' },
          { id: 'f6', topic: 'Sinar', claim: 'Everybody knows Warehouse 6 is Sinar. Sinar is not people you steal from twice.' },
          { id: 'f7', topic: 'the ice barge', claim: 'Ah Seng takes his ice barge out to Pulau Ketam every night at one, with the ice reefer on the deck. Every night, same time, since his father.' },
        ],
        lies: [
          { id: 'l1', topic: 'Thursday night', claim: 'Thursday night I was at home in Pandamaran the whole night. My mother can tell you.', truth: 'From half past eleven he was at the fence behind Bay 4 at Warehouse 6, siphoning diesel from the reefer generators.', exposedBy: 'e1' },
          { id: 'l2', topic: 'his hands', claim: 'My hands? Exhaust pipe on the lorry, Wednesday. Stupid accident.', truth: 'He burned both hands in Bay 3 on Thursday night, trying to drag Ismail Bakar out of the fire by his collar.', exposedBy: 'e2' },
          { id: 'l3', topic: 'Bay 3', claim: 'I never went inside that warehouse. Never. I do not go near fire, boss.', truth: 'He crawled under the roller shutter into the burning bay and came out with Ismail\'s torch.', exposedBy: 'e3' },
        ],
        evidence: [
          { id: 'e1', title: 'A diesel man', text: 'His print on the handle of a diesel jerry can by a fresh cut in the fence behind Bay 4, with his blood on the wire and his kapchai\'s tracks in the mud.' },
          { id: 'e2', title: 'Dead before the fire', text: 'Hospital Tengku Ampuan Rahimah: two people\'s blood on the collar of Ismail Bakar\'s shirt, where a hand grabs to drag a man. His own, and Tan Kok Fook\'s.' },
          { id: 'e3', title: 'Bandaged hands', text: 'In his jacket on the Telok Gong jetty: a Bomba torch engraved I. BAKAR, BBP PULAU INDAH, with soot packed inside its lens ring.' },
          { id: 'e4', title: 'The same L', text: 'Thursday\'s pour trail in Bay 3 follows the 2021 trail to the metre. Whoever lit it knew where the first one ran.' },
          { id: 'e5', title: 'Isolated for maintenance', text: 'Bay 3\'s alarm zone was isolated at 6:02 PM on Thursday, and its sprinklers shut at 6:10, by Sinar\'s fire safety officer.' },
          { id: 'e6', title: 'Lit a thousand times', text: 'The lighter beside the body is a smoker\'s lighter, used for years. Ah Fook smokes, but he buys his lighters at the petrol station, three for a ringgit.' },
        ],
        secret: 'He crawled into the burning bay and tried to drag Ismail out by the collar, burned both hands and ran; he saw the man in the reflective vest who started the fire and is more afraid of Sinar than of a murder charge.',
        suggested: [
          'Where were you on Thursday night?',
          'What happened to your hands?',
          'Did you go into Bay 3?',
          'Why did you hate Ismail Bakar?',
          'Why did you run from me?',
          'Who else did you see at Warehouse 6?',
          'Where does the ice barge go at night?',
        ],
        maxQuestions: 14,
        clue: 'Farah, by the door: "Klang Selatan have the charge typed and the photographer booked. If he is lying about something small, find out what it is before they do."',
      },
      evidence: {
        img: 'ev_c6_statement', hotspot: { x: 0.82, y: 0.64, r: 0.15 },
        title: 'What the fence saw',
        short: 'Caught in one lie, Ah Fook tells it all. 7:40 PM: a black car with no plates by Bay 2, a man smoking in the back. 9:05: a prime mover with a reefer out of the back gate with no lights, away from Westport. 11:55: the old man and a man in a reflective vest with a long steel bar. 12:02: the vest came out alone with a jerry can. Ah Fook went in under the shutter. The old man was already dead.',
        text: 'He tells it to his bandages. He went through the fence at half past eleven, as most nights, for the reefer generators in row D. At 7:40, when he was waiting in the palms for the yard to go quiet, a black car with no number plates had parked beside Bay 2 for twenty minutes with its back window down, and a man in the back seat smoked, and a man in a blue shirt stood at the window with his hands folded. At 9:05 a prime mover pulled a white reefer out of the back gate onto the estate road with its lights off, and turned away from Westport. At 11:55 an old man with a big torch met a man in a reflective vest at Bay 3\'s side door; the vest had a long steel bar; there was shouting, once. At 12:02 the vest came out alone with a jerry can, padlocked the door and drove off in a pickup. Then light under the roller shutter. "I went under. Forty centimetres. The old man\'s eyes were open, boss. He was not blinking at the fire." He pulled him two metres by the collar before the roof lining came down, grabbed the torch to find the way out, and ran. "Sinar. You understand? Sinar." He never saw the vest\'s face. And the landing craft the fishermen saw at one is Ah Seng\'s ice barge, which goes to Pulau Ketam every night at one with the ice reefer on deck, as it has since his father.',
      },
    },

    // ---------------- Warehouse 6 ----------------
    {
      id: 'c6_12', phase: 'Warehouse 6', title: 'The fire safety officer\'s pickup',
      game: 'getaway', variant: 'classic',
      brief: 'Rosli comes back to Warehouse 6 on Saturday night with a fire-safety inspection order for every bay that did not burn; Sinar\'s lawyers cannot stop a fire inspection. In the yard, Kamal Ariffin\'s company pickup is parked hard against the back of Bay 3, and since Friday somebody has boxed it in with reefer trailers, a forklift and two container chassis. The order covers the vehicle. It does not cover moving it nicely.',
      params: {
        difficulty: 'hard', target: 'SINAR PICKUP',
        clue: 'Rosli: "Nobody parks a pickup right by a side door unless they mean to need it in a hurry."',
      },
      evidence: {
        img: 'ev_c6_pickup', hotspot: { x: 0.50, y: 0.65, r: 0.13 },
        title: 'A Halligan bar',
        short: 'In the tray of Kamal Ariffin\'s pickup, under a tarpaulin: a Halligan bar wiped clean except inside the fork, a petrol jerry can and his old Bomba-issue boots. In the glovebox, a brown envelope he was told to burn: Ismail\'s photographs from 2021. On the last, a hand at a black car\'s back window, holding up a lit silver flip-top lighter. No face.',
        text: 'The bar is a metre of forged steel with a claw at one end and a fork at the other, the tool a fireman uses to open a door that does not want to open. It has been wiped with diesel and a rag, and Rosli\'s swab finds blood and hair packed into the root of the fork anyway. Beside it, a petrol can with an inch left in it, and a pair of black Bomba boots of the pattern withdrawn in 2022, soles grey with ash. In the glovebox, a brown envelope with Ismail\'s capitals on it, UNTUK DETEKTIF, and six prints from August 2021: the bay, the L on the floor, the socket bank, a body under a blanket. The sixth was taken from behind the tape at 1:40 AM, and Ismail has written on the back of it one word: Dia. Him. A black car with its back window half down, and out of the dark inside it a hand in a white cuff, holding a silver flip-top lighter with the flame up. No face. No plate. Kamal was told to burn the envelope. Like every frightened man Sinar has ever paid, he kept something back. Farah blows up the print until it is all grain. A hand, a cuff, a lighter, the dark. In five years Ismail never managed to take a better one. Perhaps he never dared.',
      },
    },
    {
      id: 'c6_13', phase: 'Warehouse 6', title: 'Bay 2',
      game: 'searchlight', variant: 'classic',
      brief: 'Bay 2, next to the burnt one, is a cold room the size of a badminton hall, kept at eighteen degrees, which is warm for fish and perfect for paper. Its lights are on a circuit Bomba cut on Friday. Rosli\'s crew lend you their portable floodlights. Light every aisle, and do not let one lamp shine into another, or the glare will hide the floor.',
      params: {
        size: 8, walls: 'medium',
        clue: 'The numbered pallets say how many lamps stand right beside them. A lamp lights its row and its column until a pallet stops it.',
      },
      evidence: {
        img: 'ev_c6_coldroom', hotspot: { x: 0.42, y: 0.55, r: 0.18 },
        title: 'One hundred and eleven',
        short: 'Bay 2 is kept at eighteen degrees, for paper. On its floor, 111 clean rectangles in the dust and a torn carton label: MS-14. The archive of Level 14 was here until Thursday. Nothing in Bay 2 burned. It left by the big door three hours before the fire next door.',
        text: 'One hundred and eleven rectangles in the dust, in rows, the size of archive cartons, and the dust between them older than the fire. A torn label under a pallet: MS-14. The cold room log from Chow Kit said 111 cartons went to Gudang 6, Pulau Indah, and here is where they sat, cool and dry, while Bomba sealed an empty floor in Kuala Lumpur. The big door\'s own sensor log says it opened at 21:02 on Thursday and closed at 21:07. The roof next door caught at 00:05. Whoever planned Thursday night took the archive out first, carefully, and only then lit the bay beside it. The Chairman did not burn his memory. He burned the man who remembered.',
      },
    },
    {
      id: 'c6_dn', phase: 'Warehouse 6', title: 'Small animal',
      game: 'nonogram', variant: 'classic',
      when: (flags) => !!flags.DANIEL_TAKEN,
      brief: 'At the back of Bay 2, behind a stack of empty pallets, is a second, smaller cold room with a bolt on the outside of its door. Inside: a camp bed, a carton of bottled water, and a chain bolted to the wall. On the inside of the door, in the grey paint between the rivets, somebody has scratched a picture with a fingernail, square by square, so that only a person who knew what to look for would see a picture at all. Fill in the squares.',
      params: {
        solvedText: 'The picture resolves: a mousedeer. Small animal, big brain.',
        picture: [
          '...#...........',
          '..###..........',
          '.####..........',
          '#####..........',
          '..###########..',
          '...###########.',
          '...###########.',
          '....##....##...',
          '....#.#...#.#..',
          '...##.##.##.##.',
        ],
      },
      evidence: {
        img: 'ev_c6_rivets', hotspot: { x: 0.53, y: 0.33, r: 0.08 },
        title: 'He was here',
        short: 'Behind Bay 2, a locked cold room with a camp bed, a water carton and a chain on the wall. Scratched between the rivets on the inside of the door: a kancil. Daniel was kept here after Kampung Baru. He is not here now. Wherever RU-07 went on Thursday night, he went with it.',
        text: 'The camp bed has been slept on for weeks; the blanket is folded the way a man folds a blanket when folding is the only thing left he can decide. Empty water bottles in a neat row, labels picked off. A chain bolted to the wall with nothing on the end of it. And on the door, at the height of a sitting man\'s hand, the kancil, scratched into the paint with a fingernail between the rivets, in squares, because squares were all the door gave him. Small animal, big brain. The bolt is on the outside. The cold room\'s own sensor shows the door opened at 20:58 on Thursday, four minutes before the big door of Bay 2. Wherever the archive went, Daniel went with it, at eighteen degrees, in the dark.',
      },
    },
    {
      id: 'c6_14', phase: 'Warehouse 6', title: 'The mezzanine',
      game: 'wiretap', variant: 'classic',
      brief: 'Above Bay 2, up a steel stair, is a mezzanine office with a window onto the cold room and a telecom rack that has no business in a warehouse. Somebody ripped half the pairs out of it on Friday morning in a hurry. Wire it back into one working circuit. Three handsets should ring.',
      params: {
        size: 6, targets: 3,
        clue: 'The paper tags on the pairs are in the same tidy hand as the tags on Level 14.',
      },
      evidence: {
        img: 'ev_c6_mezzanine', hotspot: { x: 0.38, y: 0.35, r: 0.14 },
        title: 'They heard him',
        short: 'The listening room from Level 14 came to Port Klang with the archive. Three relays still live: BALA, BRICKFIELDS. I. BAKAR, RUMAH, Ismail\'s house line, tapped since April. And F. ISKANDAR, HP. Ismail\'s call to Restoran Bala on Tuesday night landed in this room two days before it landed on your door.',
        text: 'Three green lights, three paper tags in the tidy hand you last saw on Level 14. BALA, BRICKFIELDS: the telephone on the wall by Bala Anne\'s till, the line that Bomba cut on Jalan Ampang and somebody patched straight back in, forty kilometres away. I. BAKAR, RUMAH: the house phone in Taman Sri Andalas, its tag dated April, the month Ismail started going to the surau for Subuh. And F. ISKANDAR, HP. Farah reads her own name and does not say anything for a long time. Then she takes her phone out of her pocket, switches it off, and puts it in the Bay 2 cold room on a pallet. On Tuesday night an old fireman rang a restaurant in Brickfields and asked for the detective from the fire, and the first people to hear him were sitting in this chair.',
      },
    },
    {
      id: 'c6_15', phase: 'Warehouse 6', title: '"Dah"',
      game: 'dialtone', variant: 'classic',
      brief: 'Under the mezzanine desk a call recorder, older than everything else in the room, logs every call from the room\'s own phone. Its last is Friday, 12:20 AM: eleven tones dialled fast, and one word. The phone is a desk phone. Whoever dialled it was standing at a window above a cold room, watching the light from next door.',
      params: {
        digits: 11, number: '01159072238', noise: 0.3,
        clue: 'Malaysian mobiles start 01. Whoever dialled it had done it often, without looking.',
      },
      evidence: {
        img: 'ev_c6_recorder', hotspot: { x: 0.48, y: 0.47, r: 0.09 },
        title: 'One word',
        short: 'At 12:20 AM on Friday, from the mezzanine phone: 011-5907 2238, and one word in a man\'s voice. "Dah." Done. The number is a prepaid bought for cash in Klang. From 10:20 PM on Thursday until it went dark at dawn it answered from one mast only, in the oil palm south of Banting, under Bukit Jugra.',
        text: 'Eleven tones, a ring and a half, a click, and a man\'s voice, a little out of breath, that says one word and hangs up: "Dah." Done. Nobody on the other end says anything at all, but the recorder keeps the sound of the line for two seconds before it closes, and in those two seconds somebody breathes out smoke. Farah\'s friend at the telco works on a Saturday night for a promise of nasi kandar. The number is a prepaid, bought for cash at a phone shop on Jalan Tengku Kelana. It has only ever been used to receive calls. On Thursday it was on the Pulau Indah mast from 7:30 to 8:05 PM, on the move down the Klang to Banting road until ten, and from 10:20 PM until it switched off at dawn it sat on a single mast in the oil palm under the lighthouse on Bukit Jugra.',
      },
    },
    {
      id: 'c6_16', phase: 'Warehouse 6', title: 'Nothing on the phones',
      game: 'shredder', variant: 'classic',
      brief: 'Jeffrey Ho\'s office is at the top of the Warehouse 6 admin block, with a window on the yard and one photograph on the wall: a single lorry, SINAR PENGANGKUTAN, JUGRA, 1987, and a boy of eighteen at the wheel. Sinar does not put its orders on telephones. It prints them, and shreds them, and on Friday morning somebody shredded one page and went home without emptying the bin. Some strips went in the wrong way up.',
      params: {
        title: 'SINAR COLD CHAIN (M) SDN BHD',
        text: 'PORT KLANG · WAREHOUSE 6\nThursday\n\n19:40  Tuan. Bay 2. Window only.\n21:00  RU-07 out by the back gate.\n       No GPS. No paper.\n23:45  Gate: let the old man in.\n       Turn the son away.\n24:00  K.A. Bay 3. (80, cash)\n00:20  Ring. One word.\n\nNothing on the phones.',
        strips: 10,
        flips: true,
        stamp: 'PRIVATE',
        clue: 'The printer in the corner keeps its last job on a little screen: Thursday, 17:58. User: JHO.',
      },
      evidence: {
        img: 'ev_c6_checklist', hotspot: { x: 0.47, y: 0.47, r: 0.17 },
        title: 'Window only',
        short: 'Jeffrey Ho\'s Thursday, printed at 17:58 and shredded on Friday: "19:40 Tuan. Bay 2. Window only. 21:00 RU-07 out by the back gate. No GPS. No paper. 23:45 Gate: let the old man in. Turn the son away. 24:00 K.A. Bay 3. (80, cash). 00:20 Ring. One word. Nothing on the phones."',
        text: 'A night written out as a list, by a man who has done lists for thirty-nine years: arrivals, departures, payments. "Tuan. Bay 2. Window only." Somebody came to Warehouse 6 at 7:40 who does not get out of his car. "RU-07 out by the back gate. No GPS. No paper." The archive went out of the back of the yard with nothing to say where. "Gate: let the old man in. Turn the son away." They knew Ismail was coming, and they knew Amirul would follow him, because they had been listening to the house in Taman Sri Andalas since April. "K.A. Bay 3. (80, cash)." At midnight, in Bay 3, Kamal Ariffin was paid eighty thousand ringgit. "Ring. One word." And under it all, the rule from Level 14, typed by a man who has never once broken it: nothing on the phones. The printer\'s screen says the page was sent at 17:58 on Thursday by user JHO.',
      },
    },
    {
      id: 'c6_17', phase: 'Warehouse 6', title: 'The Port Klang account',
      game: 'ledger', variant: 'classic',
      brief: 'Jeffrey Ho keeps Warehouse 6\'s own corner of the Port Klang account on a laptop in his desk drawer, and his assistant prints the weekly totals every Thursday at five, for a file Jeffrey does not know she keeps. At 5:12 AM on Friday somebody logged in and changed three cells. Find them, and put back what they said.',
      params: {
        rows: 6, cols: 5, altered: 3, restore: true, currency: 'RM', magnitude: 'thousands',
        rowLabels: ['Consultancy', 'Fuel & gensets', 'Logistics', 'Security', 'Hospitality', 'Office of the Chairman'],
        colLabels: ['Wk 29', 'Wk 30', 'Wk 31', 'Wk 32', 'Wk 33'],
        clue: 'The printed totals are from Thursday at five, in the assistant\'s file. The cells were changed on Friday before dawn, while Bay 3 was still smoking.',
      },
      evidence: {
        img: 'ev_c6_account', hotspot: { x: 0.36, y: 0.45, r: 0.15 },
        title: 'Paid on Thursday',
        short: 'Restored: "Consultancy", Thursday, RM 80,000 cash to K.A. "Fuel & gensets", Thursday 21:00, 200 litres for RU-07\'s generator, enough to run three days off the grid. "Logistics", one prime mover, one way, Thursday night, down the Klang to Banting road. All approved J.H.',
        text: 'Three cells, put back to what Jeffrey\'s assistant printed at five on Thursday afternoon. Consultancy: RM 80,000, cash, to K.A., Thursday. Fuel and gensets: two hundred litres of diesel for RU-07\'s generator, Thursday 21:00. A reefer plugged into a ship or a container stack needs no diesel at all; two hundred litres is three days in a place with no power socket. Logistics: one prime mover with a driver, one way only, Thursday night, Klang to Banting road. Every line approved J.H. Further down the same sheet, in a row nobody changed because nobody thought it mattered: "Office of the Chairman: Thursday, Bay 2, refreshments, RM 0." Somebody came, and was offered nothing, and was not charged for it.',
      },
    },


    // ---------------- Westport (only if Zul went free in Case 5) ----------------
    {
      id: 'c6_zw', phase: 'Westport', title: 'Zul\'s stack',
      game: 'whoslying', variant: 'classic',
      when: (flags) => !!flags.ZUL_FREE,
      brief: 'Zulkifli Hamid has been Head of Security at Sinar Cold Chain, Westport, since the spring, and on Saturday he rings Farah himself, as a courtesy, to tell her RU-07 went aboard the Singapore feeder on Friday morning and is out of her reach. Farah drives to Westport and puts five people round one table in the gatehouse. Two of them are lying.',
      params: {
        solvedLine: 'Farah reads the gate log twice. "Two liars. One of them taught me to shoot."',
        people: [
          { id: 'zul', name: 'Zul', says: [
            { t: '"RU-07 came through the gate at 10:40 on Thursday night. I signed it in myself."', fact: false, note: 'Westport\'s gate terminal has no record of RU-07 since 2021.' },
            { t: '"Selvam is lying."', about: 'selvam', is: false },
          ] },
          { id: 'mei', name: 'Mei Ling, gate clerk', says: [
            { t: '"Zul is telling the truth."', about: 'zul', is: true },
            { t: '"Hafiz is lying."', about: 'hafiz', is: false },
          ] },
          { id: 'cruz', name: 'Chief Officer Dela Cruz', says: [
            { t: '"The only Sinar reefer I loaded on Friday was empty, and plugged in."', fact: true, note: 'The feeder\'s stowage plan agrees: one Sinar unit, at tare weight.' },
            { t: '"Zul is lying."', about: 'zul', is: false },
          ] },
          { id: 'selvam', name: 'Selvam, reefer technician', says: [
            { t: '"Chief Officer Dela Cruz is telling the truth."', about: 'cruz', is: true },
            { t: '"Mei Ling is lying."', about: 'mei', is: false },
          ] },
          { id: 'hafiz', name: 'Hafiz, straddle carrier driver', says: [
            { t: '"Selvam is telling the truth."', about: 'selvam', is: true },
            { t: '"At least two of the others are lying."', atLeast: 2 },
          ] },
        ],
        liars: ['zul', 'mei'],
      },
      evidence: {
        img: 'ev_c6_westport', hotspot: { x: 0.20, y: 0.62, r: 0.15 },
        title: 'Never came in',
        short: 'Westport\'s gate has no record of RU-07 since 2021. The Singapore feeder\'s chief officer loaded one Sinar reefer on Friday, empty and plugged in. Zul told Farah it was RU-07. The gate clerk who backed him has a new car.',
        text: 'The gate terminal does not lie, because nobody at Westport has thought to make it. RU-07 has not come through the gate since August 2021, when it was "written off" with RU-11 and RU-19. The only Sinar reefer that went aboard the Singapore feeder on Friday was empty, at tare weight, plugged into the ship\'s power, carrying cold air to Singapore for a company that pays for it. Mei Ling, who swore she saw Zul sign RU-07 in, drives a Honda that is four days old. Zulkifli Hamid listens to it all with his hands folded, and when Farah stands up to go he says, quite gently, "You still drop your left shoulder, Inspector." She does not answer. In the car she says: "He wanted me at Westport. Which means it was never coming to Westport."',
      },
    },
    // ---------------- IPD Klang Selatan ----------------
    {
      id: 'c6_18', phase: 'IPD Klang Selatan', title: 'Twelve-oh-two',
      game: 'timeline', variant: 'cctv',
      brief: 'Farah borrows the incident room at IPD Klang Selatan on Sunday afternoon, while the officer whose room it is goes to a wedding, and pins Thursday night to his wall: a gate log, a back-gate sensor, a fire station\'s call book, a guardhouse camera, a thief at a fence and a recorder above a cold room. Eight frames, out of order, some clocks smudged with ash. Put them in order.',
      params: {
        frames: [
          { id: 'a', clock: '19:40', title: 'Gate log, Warehouse 6', text: 'A black car with no number plate, entered as "VIP". It parks beside Bay 2 for twenty minutes with its back window down.' },
          { id: 'b', clock: '21:0▮', title: 'Back gate sensor, estate road', text: 'A prime mover pulling a white reefer goes out with its lights off. The reefer\'s GPS stopped reporting a minute earlier.' },
          { id: 'c', clock: '23:4▮', title: 'Balai Bomba Pulau Indah, call book', text: 'A 994 call from a prepaid: a factory on fire in the industrial park. The night pump turns out. Nothing is burning.' },
          { id: 'd', clock: '23:48', title: 'Gate log, Warehouse 6', text: 'A Proton Saga, I. Bakar. Waved in by the guard: "instruction of FSO".' },
          { id: 'e', clock: '23:5▮', title: 'Guardhouse camera', text: 'A silver Honda City turned away at the barrier. The driver argues, then parks on the verge of Jalan Pulau Indah.' },
          { id: 'f', clock: '▮▮:02', title: 'Ah Fook, at the fence', text: 'A man in a reflective vest comes out of Bay 3\'s side door with a jerry can, padlocks it and drives off in a pickup.' },
          { id: 'g', clock: '00:09', title: 'Balai Bomba Pulau Indah, call book', text: '994 from the Warehouse 6 guardhouse: Bay 3 on fire. The caller gives his name and title. The pump is still in the industrial park.' },
          { id: 'h', clock: '00:2▮', title: 'Mezzanine recorder, Bay 2', text: 'Eleven tones, then one word: "Dah."' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The night plays in order. The pump was sent away before the old man was let in, and the fire was reported by the man who lit it.',
      },
      evidence: {
        img: 'ev_c6_nightboard', hotspot: { x: 0.50, y: 0.42, r: 0.12 },
        title: 'Twenty-two minutes',
        short: 'A black car came at 7:40 and the archive left at 9:05. The pump was sent away at 11:46, two minutes before Ismail was waved in. Amirul was turned away at 11:52. At 12:02 the vest padlocked Bay 3. At 12:09 the fire safety officer reported his own fire, with the pump on the wrong side of the island. At 12:20, "Dah."',
        text: 'At 7:40 a car with no plates, which does not get out. At 9:05 the archive, out of the back of the yard with its GPS dead. At 11:46 a hoax call that takes the only pump on Pulau Indah to an empty factory, and at 11:48 an old fireman waved through a gate on the instruction of the fire safety officer. At 11:52 his son, turned back at the barrier, sitting in his car on the verge. At 12:02 a man in a reflective vest padlocks a side door behind him. At 12:09 the fire safety officer rings Bomba himself, as a fire safety officer should, with the pump twenty minutes away. At 12:20, from the room above Bay 2, one word to the oil palm under Bukit Jugra. At 12:40 you come over the bridge. Klang Selatan\'s officer comes back from his wedding, reads the wall, and rubs your name off his whiteboard himself.',
      },
    },
    {
      id: 'c6_19', phase: 'IPD Klang Selatan', title: 'Everyone at 12:02',
      game: 'logicgrid', variant: 'classic',
      brief: 'Before anybody sits in an interview room, Farah wants the minute that matters on one page: 12:02 AM, when the man in the reflective vest came out of Bay 3\'s side door. Five people, five places, five things in their hands, and one of the five is you. She draws the grid with a ruler, because Klang Selatan still want to know where you were.',
      params: {
        categories: [
          { name: 'Person', items: ['Kamal', 'Jeffrey', 'Ah Fook', 'Amirul', 'You'] },
          { name: 'Location', items: ['Fence behind Bay 4', 'Outside the gate', 'Bay 3, side door', 'Lebuhraya Shapadu', 'Bay 2 mezzanine'] },
          { name: 'Holding', items: ['Siphon hose', 'Bala\'s docket', 'Halligan bar', 'Headphones', 'Car keys'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[2, 2], [4, 3], [0, 0], [1, 4], [3, 1]],
        clues: [
          'You were still on the highway, with Bala Anne\'s handwriting in your pocket.',
          'Whoever wore the headphones was upstairs.',
          'Amirul was sitting in his car.',
          'The man at the fence had come to steal, and had brought what he needed.',
          'Jeffrey was nowhere near Bay 3.',
          'The car keys were in the hand of a man who had been turned away.',
          'Ah Fook was not upstairs.',
          'Kamal was holding steel.',
        ],
      },
      evidence: {
        img: 'ev_c6_onepage', hotspot: { x: 0.45, y: 0.55, r: 0.18 },
        title: 'Everyone at 12:02 AM',
        short: 'Kamal: Bay 3\'s side door, with the Halligan bar. Jeffrey: the Bay 2 mezzanine, with the headphones on. Ah Fook: the fence behind Bay 4, with his siphon hose. Amirul: in his car outside the gate, with his keys. You: on Lebuhraya Shapadu, with Bala Anne\'s docket in your pocket.',
        text: 'At 12:02 AM on Friday: Kamal Ariffin at the side door of Bay 3 with a Halligan bar and a padlock. Jeffrey Ho in the mezzanine above Bay 2 with a pair of headphones on, listening to the yard radio and a fireman\'s house that nobody was home in. Tan Kok Fook at the fence behind Bay 4 with a siphon hose in his teeth, watching a man come out of a door. Amirul Ismail in a silver Honda on the verge of Jalan Pulau Indah with his car keys in his fist, deciding whether to drive away. And you on the Shapadu highway with a page from Bala Anne\'s order pad in your pocket, forty minutes late for a man who had already been dead for seven.',
      },
    },
    {
      id: 'c6_20', phase: 'IPD Klang Selatan', title: 'For the prosecutor',
      game: 'theory', variant: 'classic',
      brief: 'Deputy Public Prosecutor Hamidah Yusof drives down from Putrajaya on a Sunday, which she says she never does, with one sheet of paper and twenty minutes before Jeffrey Ho\'s lawyer arrives from Kuala Lumpur. "You again. Same rules. Not the evidence, detective. The story."',
      params: {
        prompt: 'Write Thursday night at Warehouse 6 for the prosecutor: who killed Ismail Bakar and burned Bay 3, who gave the order and paid for it, why Ismail had to die, and why there was a lighter beside him.',
        context: 'Ismail Bakar, a retired Bomba fire investigator, was killed in Warehouse 6, Bay 3, Pulau Indah, at about 11:55 PM on Thursday, five years after he falsely signed off the 2021 Bay 3 fire as electrical in exchange for RM 200,000 from Sinar Cold Chain. He had arranged to meet the detective there to hand over his 2021 photographs and confess. Kamal Ariffin, Sinar\'s fire safety officer and an ex-Bomba fireman, isolated the alarm, shut the sprinklers, killed Ismail with a Halligan bar and set the fire with petrol in the same pattern as 2021. Jeffrey Ho, General Manager of Sinar Cold Chain, Port Klang, planned the night, paid Kamal RM 80,000, moved the archive out in reefer RU-07, and left beside the body a silver lighter engraved D.R. that the Chairman had handed him: a 2016 copy of Daniel Raj\'s lighter, put there to point at Daniel and the detective.',
        points: [
          { id: 'killer', label: 'Who killed Ismail and lit the fire', criterion: 'Kamal Ariffin (the fire safety officer, ex-Bomba) killed Ismail (struck him with the Halligan bar) and/or set the fire with petrol. It must not say someone else killed him.', keywords: [['kamal', 'ariffin', 'fire safety'], ['kill', 'struck', 'hit', 'bar', 'halligan', 'murder', 'fire', 'petrol', 'pour', 'burn', 'lit', 'set']], hint: 'Who isolated the alarm at 6:02, and whose pickup held the Halligan bar?' },
          { id: 'order', label: 'Who planned it and paid', criterion: 'Jeffrey Ho (General Manager of Sinar Cold Chain, Port Klang) planned it, gave the order or paid Kamal (RM 80,000).', keywords: [['jeffrey', 'ho', 'general manager', 'manager'], ['order', 'paid', 'pay', 'plan', 'arrang', 'told', 'sent', 'checklist', 'list']], hint: 'Whose checklist says "K.A. Bay 3. (80, cash)"?' },
          { id: 'why', label: 'Why Ismail had to die', criterion: 'Ismail was killed because he was going to confess or tell the truth about the 2021 fire (that it was arson, that he was paid), or to hand his 2021 photographs or tape to the detective.', keywords: [['2021', 'photograph', 'photo', 'confess', 'truth', 'tape', 'report', 'arson', 'paid'], ['tell', 'talk', 'give', 'meet', 'bring', 'hand', 'confess', 'detective', 'expose', 'back']], hint: 'What was in the brown envelope, and who was he bringing it to?' },
          { id: 'lighter', label: 'Why there was a lighter beside him', criterion: 'The D.R. lighter was planted beside the body (a copy made in 2016, from the Chairman or Sinar) to frame or point at Daniel Raj or the detective.', keywords: [['lighter'], ['plant', 'frame', 'left', 'put', 'placed', 'copy', 'third', 'blame', 'point', 'message']], hint: 'Mani made three lighters in 2016. Who smokes?' },
        ],
        need: 3,
        clue: 'Hamidah taps the sheet. "Three things I can prove in court. Four, and I will let you buy me a teh tarik."',
      },
      evidence: {
        img: 'ev_c6_report', hotspot: { x: 0.49, y: 0.56, r: 0.16 },
        title: 'The blank line again',
        short: 'The prosecutor reads your report twice, signs a charge against Kamal Ariffin for murder, and leaves the abetment line blank, as she did for Zul. "Last time it was a secretary. This time it is a man who has driven for him since 1987. Bring me his own words."',
        text: 'Hamidah Yusof reads it twice with the pencil she never uses. Then a charge sheet: Kamal bin Ariffin, Section 302, murder; Section 435, mischief by fire. Under it, "and abetment by", and nothing. "Last time it was a secretary who never said his name," she says. "This time it is a man who has worked for him since he was eighteen. Men like that do not say the name either. But they say everything else, if you ask them about the right night." She looks at the lighter in its evidence bag on the corner of your sheet, and then at you. "Somebody has had a copy of your partner\'s lighter for ten years, detective, and used it every day. That is not evidence. That is a man telling you he is patient."',
      },
    },
    {
      id: 'c6_21', phase: 'IPD Klang Selatan', title: 'Thirty-nine years',
      game: 'interrogation', variant: 'classic',
      brief: 'Jeffrey Ho comes to IPD Klang Selatan on Sunday night by appointment, in a pressed shirt, with a jade bangle on his wrist and a Sinar lawyer somewhere on the Federal Highway. He has worked for one man since he was eighteen, and in thirty-nine years he has never missed a day. One thing he tells you is not true. Find it, and put the exhibit that breaks it on the table.',
      params: {
        setting: 'Interview room 2, IPD Klang Selatan. Sunday, 11:10 PM.',
        suspect: {
          id: 'jeffrey', voice: 'voice_2', name: 'Jeffrey Ho', role: 'General Manager, Sinar Cold Chain, Port Klang, 57',
          persona: 'Klang Hokkien who came up from driving lorries and still talks like a lorry driver at a kopitiam: plain Malaysian English, "ya", "betul", "aiya", calls the player "boss" and Farah "Inspector". Proud of thirty-nine years with Sinar and of never having missed a day. Never says "the Chairman": he says "the company", or "Tuan", and stops himself. When a question lands close he turns the jade bangle on his wrist and looks anywhere except at the lighter on the table.',
        },
        facts: [
          { id: 'f1', topic: 'his job', claim: 'I am General Manager, Sinar Cold Chain, Port Klang. Warehouse 6 is mine. Every bay, every unit.' },
          { id: 'f2', topic: 'his start', claim: 'I started in 1987 driving one lorry for Sinar Pengangkutan. Palm oil, from the old yard at Jugra to the port. Eighteen years old.' },
          { id: 'f3', topic: 'Ismail Bakar', claim: 'Tuan Ismail investigated our fire in 2021. A careful officer. I am sorry about what happened to him.' },
          { id: 'f4', topic: 'Kamal', claim: 'Kamal is our fire safety officer since 2022. Ex-Bomba, twenty years. Very qualified.' },
          { id: 'f5', topic: 'Bay 2', claim: 'Bay 2 is a cold room. We store for clients. Paper, medicine, durian. Whatever pays.' },
          { id: 'f6', topic: 'the 2021 fire', claim: 'In 2021 Bay 3 burned because of an old reefer socket. Bomba said so. It is in the report.' },
          { id: 'f7', topic: 'thirty-nine years', claim: 'Thirty-nine years and I never missed one day. Not one.' },
        ],
        lies: [
          { id: 'l1', topic: 'Thursday night', claim: 'Thursday I was at the Klang Hokkien Association dinner on Jalan Meru from seven until half past twelve. Two hundred people saw me.', truth: 'He left the dinner at 7:20 and spent the night in the Bay 2 mezzanine; at 12:20 he rang one number from the mezzanine phone and said "Dah", and he was back at the dinner for the lucky draw at 12:44.', exposedBy: 'e1' },
          { id: 'l2', topic: 'RU-07', claim: 'RU-07 was written off after 2021 and went for scrap. That unit does not exist any more, boss.', truth: 'RU-07 left Warehouse 6 by the back gate at 9:05 PM on Thursday with 111 cartons inside and 200 litres of diesel in its generator.', exposedBy: 'e2' },
          { id: 'l3', topic: 'Kamal\'s pay', claim: 'Kamal gets his salary like everybody. Six thousand five hundred a month. Nothing extra.', truth: 'Jeffrey paid Kamal RM 80,000 in cash at midnight on Thursday.', exposedBy: 'e3' },
          { id: 'l4', topic: 'visitors', claim: 'Nobody came to Warehouse 6 on Thursday evening except my own staff. It is a warehouse, boss, not a hotel.', truth: 'At 7:40 PM a black car with no plates parked by Bay 2 for twenty minutes, and Jeffrey stood at its back window.', exposedBy: 'e4' },
        ],
        evidence: [
          { id: 'e1', title: 'One word', text: 'The mezzanine recorder: at 12:20 AM on Friday, from the Bay 2 phone, eleven tones and one word, "Dah". The Hokkien Association\'s lucky-draw photographs show Jeffrey Ho arriving at 12:44 with ash on his cuff.' },
          { id: 'e2', title: 'Paid on Thursday', text: 'The Port Klang account, restored: 200 litres of diesel for RU-07\'s generator on Thursday at 21:00, and one prime mover hired one way down the Klang to Banting road.' },
          { id: 'e3', title: 'Window only', text: 'His own Thursday checklist, shredded on Friday: "24:00 K.A. Bay 3. (80, cash)." Printed at 17:58 by user JHO.' },
          { id: 'e4', title: 'What the fence saw', text: 'Ah Fook: at 7:40 PM a black car with no plates by Bay 2, a man smoking in the back seat, and a man in a blue shirt standing at the back window with his hands folded.' },
          { id: 'e5', title: 'Three, not two', text: 'Mani\'s order book: two lighters engraved D.R. for Daniel Raj in August 2016, and a third the next week for a customer with no name, "Tuan", collected by a driver.' },
          { id: 'e6', title: 'The same L', text: 'Thursday\'s pour trail in Bay 3 follows the 2021 trail to the metre.' },
        ],
        secret: 'At 7:40 PM on Thursday the Chairman came to Warehouse 6 himself, gave Jeffrey the silver lighter through the car window and told him to leave it beside Ismail; Jeffrey paid Kamal to kill Ismail and burn Bay 3, sent the archive away in RU-07, and in thirty-nine years has never once heard the Chairman\'s name spoken.',
        suggested: [
          'Where were you on Thursday night?',
          'Who came to Warehouse 6 on Thursday evening?',
          'What happened to RU-07?',
          'What do you pay Kamal?',
          'Why did Sinar pay Ismail in 2021?',
          'Who do you answer to?',
          'How did you start with Sinar?',
        ],
        maxQuestions: 14,
        clue: 'Farah puts the lighter in its evidence bag on the table between you and leaves it there. "He has not looked at it once," she says. "Watch him not look at it."',
      },
      evidence: {
        img: 'ev_c6_window', hotspot: { x: 0.47, y: 0.58, r: 0.13 },
        title: 'Through the window',
        short: 'Caught in one lie, Jeffrey Ho asks for his lawyer and then, before the lawyer comes, says one true thing. On Thursday at 7:40 the man he has driven for since 1987 came to Warehouse 6 himself, did not get out of the car, and handed him the lighter through the window. "Beside him. The detective will understand."',
        text: 'He turns the jade bangle round his wrist three times and asks for his lawyer, and then, because the lawyer is still on the Federal Highway and Jeffrey Ho has never in his life sat still for long, he talks to the lighter. "He came himself. First time since 2021. He did not get out. He never gets out. He gave me this through the window, from his own pocket, still warm. He said, beside him. The detective will understand." He looks at you for the first time. "Thirty-nine years, boss, and I have never heard anybody say his name. Not once. In 1987 he was the man who owned the lorry. Now he is the man who owns the port." Then the strangest thing, which Farah writes down word for word. "He asked me one more thing through the window. He asked if the detective still sits at table six."',
      },
    },
  ],

  outcomes: {
    charged: {
      kamal: { en: 'Kamal Ariffin is arrested at the Warehouse 6 guardhouse in his reflective vest. He asks Rosli, who has come to watch, whether they are going to take his old Bomba boots as well. Rosli says yes.' },
      jeffrey: { en: 'Jeffrey Ho is arrested at his house in Klang at five in the morning, in a pressed shirt, with a packed bag by the door. He has been ready for thirty-nine years.' },
      ahfook: { en: 'Tan Kok Fook is charged with murder in the Klang sessions court with both hands still in bandages. His mother brings him a flask of herbal tea and is not allowed to give it to him.' },
      amirul: { en: 'Amirul Ismail is arrested at his office in Bukit Tinggi in front of the show-flat brochures. His mother does not come to the station. She is at the mortuary, waiting to take his father home.' },
    },
    correct: ['kamal', 'jeffrey'],
  },

  // Hidden consequences, for later cases. AHFOOK_WRONGED / AMIRUL_WRONGED: charged with a murder they did not
  // commit. ARCHIVE_SEIZED / ARCHIVE_LOST: whether Farah's team reached RU-07 at the old Jugra depot. If
  // DANIEL_TAKEN (Case 5), Daniel was inside RU-07: he is free exactly when ARCHIVE_SEIZED.
  flagNames: ['KAMAL_FREE', 'JEFFREY_FREE', 'AHFOOK_WRONGED', 'AMIRUL_WRONGED', 'ARCHIVE_SEIZED', 'ARCHIVE_LOST'],
  flags: ({ charged, answers }) => ({
    KAMAL_FREE: !charged.includes('kamal'),
    JEFFREY_FREE: !charged.includes('jeffrey'),
    AHFOOK_WRONGED: charged.includes('ahfook'),
    AMIRUL_WRONGED: charged.includes('amirul'),
    ARCHIVE_SEIZED: answers.ru07 === 'jugra',
    ARCHIVE_LOST: answers.ru07 !== 'jugra',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  // Daniel's branches hang on Case 5's flags, so they use `when` (the voice manifest walks every line).
  ending(v) {
    const right = CASE06.outcomes.correct.every((id) => v.has(id));
    const seized = v.answers.ru07 === 'jugra';
    let rohanaLine;
    if (right && !v.has('ahfook') && !v.has('amirul')) rohanaLine = 'He went there to give back what he took. You made them write that down. That is all I wanted on his stone.';
    else if (v.has('amirul')) rohanaLine = 'My husband is in the ground and my son is in a cell. Tell me which one of them I should pray for first.';
    else if (v.has('ahfook')) rohanaLine = 'They say it was a diesel thief with a grudge. Ismail put out fires for thirty-seven years. He would have laughed at that, a little.';
    else rohanaLine = 'They say it is finished. Ismail always said a fire is never finished until you have found where it started.';

    const panels = [
      { img: 'c6_out_01_arrest', mood: 'police', fx: ['rain', 'siren'], place: 'IPD Klang Selatan. Monday, 4:30 AM.', music: 'resolution',
        lines: v.charged.map((id) => ({ who: null, en: CASE06.outcomes.charged[id].en })) },
      { img: 'c6_out_02_funeral', mood: 'day', fx: ['rain'], place: 'The Muslim cemetery, Klang. Monday, after Zohor.',
        lines: [
          { who: null, en: 'Bomba amend two reports in one week. Bay 3, 2026: deliberate. Bay 3, 2021: deliberate, in Ismail Bakar\'s own words from his carbon copy, countersigned by Rosli.' },
          { who: 'Puan Rohana', en: rohanaLine },
          { who: null, en: 'Kamal Ariffin is moved to Sinar Cold Chain\'s depot at Bloemendhal, Colombo, as fire safety officer. Herath sends you a photograph of him at the depot gate, with no message.', when: (f) => f.KAMAL_FREE },
          { who: null, en: 'Jeffrey Ho takes early retirement after thirty-nine years. On his last day a black car with no plates waits for him at the Warehouse 6 gate, and the guards stand up.', when: (f) => f.JEFFREY_FREE },
          { who: null, en: 'Klang Selatan close the file on a diesel thief with a grudge. Ah Fook\'s mother stops selling kuih at Pandamaran market. People look at her too long.', when: (f) => f.AHFOOK_WRONGED },
          { who: null, en: 'Ah Fook stands outside the cemetery gate with his bandaged hands in his pockets and will not come in.', when: (f) => !f.AHFOOK_WRONGED },
          { who: 'Ah Fook', orig: 'Go go lou baak… ngo laai m zyu keoi.', en: 'The old man… I could not pull him out.', when: (f) => !f.AHFOOK_WRONGED },
          { who: null, en: 'Amirul stands at the back with the Bomba men, on bail, and his mother does not turn round.', when: (f) => f.AMIRUL_WRONGED },
          { who: null, en: 'Rizal Hamdan sends Farah Thursday\'s gate roster for Warehouse 6 without being asked. "Let the old man in. Turn the son away. Instruction of FSO."', when: (f) => f.RIZAL_FREE },
          { who: null, en: 'A wreath arrives from the Office of the Chairman with no name on the card. The envelope is addressed in Vivian Chua\'s hand, posted in Singapore.', when: (f) => f.VIVIAN_FREE },
          { who: null, en: 'A wreath arrives from the Office of the Chairman with no name on the card. The florist\'s invoice is signed Melissa Ong.', when: (f) => !f.VIVIAN_FREE && f.MELISSA_FREE },
          { who: null, en: 'At Westport, Zulkifli Hamid signs the Singapore feeder out at six and does not look at the reefer stack once.', when: (f) => f.ZUL_FREE },
        ] },
    ];

    if (seized) {
      panels.push({ img: 'c6_out_03_jugra', mood: 'day', fx: ['dust'], place: 'The old Sinar depot, Jugra. Monday, 5:50 AM.',
        lines: [
          { who: null, en: 'Farah goes in at first light with two cars and Rosli\'s fire tender, because a fire tender carries bolt cutters and nobody asks it for a warrant.' },
          { who: null, en: 'Under the palms below the Bukit Jugra lighthouse, behind a gate with a sun painted on it so long ago that it has gone pink: RU-07, its generator coughing on the last of two hundred litres.' },
          { who: null, en: 'Inside, one hundred and eleven cartons. The archive of Level 14: every official Sinar has bought since 1986, a file to each, in alphabetical order. The police drawer from A to J.' },
          { who: null, en: 'There is no photograph of the Chairman anywhere in his memory.' },
          { who: null, en: 'The prime mover is parked behind the depot office with its plates off. In the cab, a Sri Lankan seaman\'s pass: Kasun Ranaweera.', when: (f) => f.KASUN_FREE },
          { who: null, en: 'Taped inside RU-07\'s door, an export permit for Monday night, Port Klang to Colombo. Officer: N. SALLEH.', when: (f) => f.NORHAYATI_FREE },
        ] });
    } else {
      const wrongLine = {
        westport: 'Farah\'s team boards the Singapore feeder at Westport at five. The only Sinar reefer on it is empty, plugged in, and colder than anything in Port Klang.',
        northport: 'Farah\'s team opens the Sinar reefer at North Port, Gate 2. It is full of frozen prawns for Colombo, and its paperwork is perfect.',
        ketam: 'The marine police stop Ah Seng\'s ice barge off Pulau Ketam at one in the morning. It is carrying ice, and Ah Seng, and a great deal of language.',
      }[v.answers.ru07] || 'Farah does not send anybody anywhere.';
      panels.push({ img: 'c6_out_03_empty', mood: 'night', fx: ['dust'], place: 'The old Sinar depot, Jugra. Monday, 6:40 PM.',
        lines: [
          { who: null, en: wrongLine },
          { who: null, en: 'By the time anybody thinks of the old Sinar yard under Bukit Jugra it is evening. The gate with the pink sun is open. Tyre tracks in red mud, a diesel stain on the concrete, and nothing else.' },
          { who: null, en: 'Somewhere a prime mover is pulling the Chairman\'s memory down a road that is not on any map of his.' },
          { who: null, en: 'At Westport, a permit for one reefer unit, Port Klang to Colombo, was stamped at noon. Officer: N. SALLEH.', when: (f) => f.NORHAYATI_FREE },
        ] });
    }

    // Daniel, by Case 5's flags.
    panels.push({ img: 'c6_out_04_safehouse', mood: 'night', fx: [], place: 'A house Farah has not told you about. Monday, 9:30 PM.', music: 'memory', when: SAFE,
      lines: [
        { who: null, en: 'Farah drives you there with a scarf over your eyes for the last ten minutes, and apologises for it twice.' },
        { who: null, en: 'Daniel holds Ismail\'s photograph under the kitchen bulb for a long time, the way he used to hold a receipt he did not believe.' },
        { who: 'Daniel Raj', en: 'Table seven. August 2016, the week we opened. An old man in a white shirt sat behind us for an hour, paid for our teh, and left before we could thank him.' },
        { who: 'Daniel Raj', en: 'I said, machan, rich uncles like detectives. You laughed. I bought the lighters the next day.' },
        { who: 'Daniel Raj', en: 'He has been sitting behind us for ten years.' },
      ] });
    panels.push({ img: 'c6_out_04_glass', mood: 'night', fx: [], place: 'Sungai Buloh prison, visiting room 4. Monday, 2:00 PM.', music: 'memory', when: PRISON,
      lines: [
        { who: null, en: 'Through the glass Daniel looks thinner, and calmer than you. You press Ismail\'s photograph flat against your side of the partition.' },
        { who: 'Daniel Raj', en: 'Table seven. August 2016, the week we opened. An old man in a white shirt sat behind us for an hour, paid for our teh, and left before we could thank him.' },
        { who: 'Daniel Raj', en: 'Get me out of here, machan. Not for me. He knows exactly which block I am in.' },
        { who: null, en: 'Superintendent Khairul\'s signature is still on the remand order. Nobody has thought to take it off.', when: (f) => !f.KHAIRUL_WRONGED },
      ] });
    if (seized) {
      panels.push({ img: 'c6_out_04_ward', mood: 'day', fx: [], place: 'Hospital Tengku Ampuan Rahimah, Klang. Monday, 10:00 AM.', music: 'memory', when: TAKEN,
        lines: [
          { who: null, en: 'At the back of RU-07, behind the last pallet of cartons, Farah\'s torch found a man sitting on the floor with his knees up and a carton of water, blinking. Three days in the dark at eighteen degrees, with the Chairman\'s memory for company.' },
          { who: 'Daniel Raj', en: 'You are late again, machan. I am still not complaining.' },
          { who: 'Daniel Raj', en: 'He came to the cold room once, on the first night. He did not come in. He stood in the doorway and smoked, and asked me if I still had my lighter.' },
          { who: null, en: 'You put Farah\'s evidence bag on the blanket, with the twin from Kampung Baru inside it. She pretends not to see him take it out.' },
          { who: null, en: 'The warrant from Menara Sinar is still open. Farah lays her own jacket over his wrists so that nobody photographs the cuffs.', when: (f) => f.DANIEL_CHARGED },
          { who: 'Daniel Raj', orig: 'Mannichidu, machan.', en: 'Forgive me, machan.' },
        ] });
    } else {
      panels.push({ img: 'c6_out_04_mat', mood: 'night', fx: ['rain'], place: 'Brickfields. Monday, 11:50 PM.', music: 'memory', when: TAKEN,
        lines: [
          { who: null, en: 'Wherever RU-07 went, it went with everything that was in it.' },
          { who: null, en: 'At midnight something slides under your office door: a paper kancil folded from an orange cargo tag. RU-07. Set point, eighteen degrees.' },
          { who: null, en: 'Nobody else alive folds a kancil that way. He is alive. He is still theirs. They wanted you to know both.' },
        ] });
    }

    panels.push({
      img: 'c6_out_05_bala', mood: 'warm', fx: ['dust'], place: 'Restoran Bala, Brickfields. Monday, 11:40 PM.', music: 'memory',
      lines: [
        { who: null, en: 'After closing you tell Bala Anne about the tape, because there is nobody else awake to tell.' },
        { who: null, en: 'He listens with the old photograph of his father\'s stall in his hands, the one that has hung over the till since 1979, and does not put it back on its nail.' },
        { who: 'Bala Anne', en: 'My father used to say, in this town every fire has an owner. Do not look for the match, thambi. Look for the owner.' },
        { who: 'Bala Anne', orig: 'Saapittiya, thambi?', en: 'Have you eaten, boy?' },
        { who: null, en: 'Five years you called it a dream. Now it is on a tape in Farah\'s locker: a calm voice at the edge of a fire, saying both of them.' },
      ],
    });
    panels.push({
      img: 'c6_out_06_phone', mood: 'night', fx: ['rain'], place: 'Brickfields. Tuesday, 2:10 AM.', music: 'chairman',
      lines: [
        { who: null, en: 'Upstairs, the grey folder is where you locked it. Under Rashid Osman, in fresh blue ink, somebody has typed one more name and struck it through by hand: I. Bakar.' },
        { who: null, en: 'At ten past two the old telephone on the wall by the till rings: the line with the paper tag in Port Klang.' },
        { who: null, en: 'Bala Anne answers it in his singlet, listens, and puts the receiver down on the counter in front of you. Then he steps back into the dark, as if the voice on it could see him.' },
        { who: 'A voice', en: 'Good evening, detective. Five years ago I let you go into the fire. This year I let you come out of it. Keep the lighter.' },
        { who: null, en: 'You know the voice. You have known it every night for five years. Before you can say anything, you hear a silver lid flick open, and shut, and open. Then the dialling tone.' },
      ],
    });
    return panels;
  },
};
