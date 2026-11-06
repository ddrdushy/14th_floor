// CASE 9: BOX 14. Melaka: the iron room of an old Chettiar firm on the river, Christmas Eve to 28 December 2026.
// Truth (writers only): BURGLARY, under the fireworks, on a printed order. "Box 14 only. Leave the gold."
// Sp.M.R.M. Muthiah Chettiar & Co. lent money from the house on Jalan Kampung Pantai from 1912 to 1994. Its
// iron room (petti arai) holds forty-two deposit boxes behind a 1938 iron door; Sinar Heritage bought the
// house in 2024 and made it The Kittangi, but Muthiah's will kept the iron room out of the sale until every
// renter has claimed or died. Keeper: his grandson Ram (Ramanathan) Chettiar, 46, RM 400,000 in his late
// father's debts. Muthiah's ledger: on 2 Dec 1986, RM 18,000 to "Sinar Pengangkutan, Jugra, the bearer",
// against a Bedford lorry BCK 210 (its registration card, still in Teoh Ah Chuan's name, deposited), 2% a
// month, guarantor M. Perumal (right thumb). Repaid 1 Dec 1987, to the day; Box 14 rented the same day for
// fifty years, paid in advance in cash. Muthiah's margin: "Not a good man. But he will repay." Every 1 December
// from 1987 to 2025 Box 14 was opened for four minutes and the visitor book signed "M.P."; on 1 Dec 2026, a
// small sun drawn in ink. Box 14 held Teoh Ah Chuan's Seiko (stopped at 2:10, Langat mud in the crown, TEOH
// A.C. 1979), BCK 210's registration card, a 1986 photograph of the Jugra gate with a sun freshly painted on
// it, a girl of about fifteen with a brush and the long shadow of the photographer (a slim man in a cap), and
// the cancelled promissory note with two thumbs: Muthu's right, the borrower's left.
// In November Ram agreed to sell the iron room's rights to Sinar Heritage for RM 3 million "with vacant
// possession by 31 December"; on 22 Dec, the day Hamidah's hearing was fixed for the 28th, he told the
// hotel's general manager the date and took a RM 50,000 advance. Vanessa Low, 38, the GM, on the Office of
// the Chairman's printed orders: in October borrowed Ram's key "for the insurer" and had Jock Sequeira cut a
// copy (receipt 14 Oct, V. Low, RM 80); at 23:50:12 on Christmas Eve bypassed the iron room's zone with her
// own user code 07 ("the fireworks set off the vibration sensors"); unlocked the river-steps gate; at 1:30
// drove the hotel van to Kampung Morten with RM 30,000 in an envelope marked "S." and brought back the drill;
// shredded the order on Christmas morning; was told to burn the visitor book and kept it in her car.
// Shamsul Bakri, 33, night pilot of the river cruise: 23:52 took boat 7 out dark with two hired men from KL
// (never named, never found), 23:56 radioed the hotel's river-steps handheld ("Tujuh, sampai."), 23:58 to 00:09
// the men opened the iron door with Jock's copy and drilled Box 14 (the copy snapped in the door on the way
// out), 00:20 back at Kampung Morten. 2:10 at Melaka Sentral bay 9 he handed a dry bag to a man in a cap
// (Roslan Daud with F-03 if ROSLAN_FREE), after photographing everything, and kept the note back. 3:05 he taped
// it in a plastic sleeve under the grille over the empty grave of St. Francis Xavier on St. Paul's Hill, the
// carollers' candles still burning; 3:20 he rang Nurul Ain's old newsroom voicemail to sell "a paper with two
// thumbprints" for RM 50,000 and keyed his callback number, 013-627 1486.
// Red herrings: Ram (debts, the deal, the only key, the leak; at Mahkota with his mother 23:30 to 1:15) and
// Jock Sequeira, 66, Kristang locksmith (the snapped copy carries his notch; at the Settlement's mass and the
// dancing after it, in a hundred photographs).
// The Chairman: NOT named, NOT seen. Only the facts listed for Case 9 in docs/arc_season2.md §3. Private note:
// his identity is still undecided; nothing here may pin it to a person. Nobody in this case says the old man
// with the umbrella (TAIL_TRACED) or the photographer's shadow was him. Sjn. Asri is only Farah's trusted
// sergeant here (he minds her desk, and he fetched carton M for her if ARCHIVE_SEIZED).

// Daniel at the start of Case 8 (shared predicates, docs/arc_season2.md §2). From Case 9 on he is free.
const HELD7 = (f) => (!!f.DANIEL_TAKEN || !f.DANIEL_FOUND) && !f.ARCHIVE_SEIZED;
const WAS_HELD = HELD7; // he rode hooded in the back seat on 1 December
const DNAA = (f) => !!f.DANIEL_CHARGED; // charge withdrawn on 22 Dec as a discharge not amounting to acquittal
// Who signs the Office of the Chairman's letters, by Case 5.
const SECRETARY = (f) => (f.VIVIAN_FREE ? 'vivian' : f.MELISSA_FREE ? 'melissa' : 'unknown');


const WHERE = [
  { id: 'sentral', label: 'Melaka Sentral: it went with the rest', note: 'Bay 9, 2:10 AM, a dry bag and a man in a cap.' },
  { id: 'xavier', label: 'St. Paul\'s Hill, in the empty grave of St. Francis Xavier', note: 'The ruined church on the hill, an iron grille over an open grave.' },
  { id: 'bukitcina', label: 'Bukit China, in the urn of an old grave', note: 'Twelve thousand graves on a hill of red earth.' },
  { id: 'river', label: 'The bottom of the Melaka river', note: 'Thrown off boat seven on the way home.' },
];

export const CASE09 = {
  id: 'case09',
  number: 9,
  title: 'Box 14',
  place: 'Melaka',
  victim: 'The iron room of Sp.M.R.M. Muthiah Chettiar & Co., Melaka (1912). Box 14 emptied on Christmas Eve; the other forty-one boxes, and their gold, left untouched.',
  question: 'Who emptied Box 14?',
  brief: 'Box 14 was rented in December 1987 by a lorry company from Jugra, for fifty years, paid in advance. On the twenty-second Hamidah asked a court to open it. On Christmas Eve, while the whole of Melaka watched the fireworks, somebody opened it first, by drilling one lock in a room full of gold, and took nothing else.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end: who emptied Box 14, and where the one thing they kept back is now. Nobody will tell you if you get either of them right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Bala Anne sent a photograph of the counter: two teh, one drunk, and a paper kancil folded from a Melaka toll receipt.',
  deduction: {
    lede: 'Melaka Tengah will charge whoever you name with the burglary of Box 14, on your word and Hamidah\'s fax. Name everyone who planned it or did it, and only them.',
    button: 'Tell Hamidah',
    confirm: 'Melaka Tengah will charge {names}. Hamidah\'s fax goes through at six, before the hotel\'s breakfast.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Hamidah',
    questions: [
      {
        id: 'note', q: 'Where is the promissory note?', short: 'The note is',
        lede: 'One paper from Box 14 never reached the courier: the note with two thumbprints. Melaka Tengah can search one place, once, today. Sinar will hear where by evening.',
        options: WHERE,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy
  // in cases.js). Until it is solved they are not on the map, the board or the office wall.
  suspects: [
    {
      id: 'jock', name: 'Joaquim "Jock" Sequeira', role: 'Locksmith, Portuguese Settlement, Ujong Pasir. 66', img: 'sus_jock',
      revealedBy: 'c9_02',
      revealLine: 'The key snapped in the iron door has a little notch filed into its bow. Only one man in Melaka files that notch.',
      look: { skin: '#b97f55', hair: 'short', hairColor: '#9a9a9a', coat: 'batik', eyewear: 'round', mark: 'moustache' },
      motive: 'None known. Forty years cutting keys for every old house in Melaka, and he has never once been asked what the keys were for.',
      claim: 'Says he cuts keys for whoever pays, files his notch in every one, and was at the Christmas Eve mass in the Settlement at midnight.',
    },
    {
      id: 'ram', name: 'Ramanathan "Ram" Chettiar', role: 'Keeper of the iron room, grandson of Muthiah Chettiar. 46', img: 'sus_ram',
      revealedBy: 'c9_03',
      revealLine: 'He agreed to give up the iron room by the thirty-first, for three million. Box 14 was the last thing in it.',
      look: { skin: '#8d5a3a', hair: 'short', hairColor: '#3a3a3a', coat: 'batik', eyewear: 'round', mark: 'none' },
      motive: 'RM 400,000 of his late father\'s debts, and a buyer who wanted the iron room empty by New Year\'s Eve.',
      claim: 'Says the only key to the iron door lives on his own ring, and that Sinar has never asked him to give the room up.',
    },
    {
      id: 'vanessa', name: 'Vanessa Low Pei Shan', role: 'General manager, The Kittangi (Sinar Heritage Hotels). 38', img: 'sus_vanessa',
      revealedBy: 'c9_06',
      revealLine: 'User 07 switched the iron room off at ten to midnight.',
      look: { skin: '#f1d2b6', hair: 'bun', hairColor: '#151210', coat: 'blazer', eyewear: 'none', mark: 'none' },
      motive: 'Sinar Heritage Singapore needs a general manager in the new year. Every GM in the group has applied.',
      claim: 'Says she was on her feet in the courtyard with a hundred and forty guests from six until two, and that the iron room is Mr. Chettiar\'s business, not the hotel\'s.',
    },
    {
      id: 'shamsul', name: 'Shamsul Bakri', role: 'Night pilot, Melaka river cruise, Kampung Morten. 33', img: 'sus_shamsul',
      revealedBy: 'c9_08',
      revealLine: 'Boat seven moved in the night. Its pilot lives two houses from the jetty.',
      look: { skin: '#b97f55', hair: 'short', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'stubble' },
      motive: 'He owes a Jonker Street tontine more than a river pilot earns in two years.',
      claim: 'Says he tied up boat seven after the last cruise at half past eleven and watched the fireworks from his mother\'s steps.',
    },
  ],

  opening: [
    {
      img: 'c9_intro_01_christmas', mood: 'warm', fx: [], place: 'Restoran Bala, Brickfields. Christmas morning, 7:05 AM.', music: 'office',
      lines: [
        { who: null, en: 'Christmas morning in Brickfields: the shutters down along Jalan Tun Sambanthan, a church bell somewhere behind the temple, and Bala Anne\'s wall phone ringing before the stove is lit.' },
        { who: null, en: 'Bala Anne holds the receiver out across the counter without a word. It is Hamidah Yusof, and she has not slept.' },
        { who: 'Hamidah Yusof', en: 'Box 14 is empty. They drilled one lock in a room full of gold.' },
        { who: 'Hamidah Yusof', en: 'The court was going to open it on Monday. Somebody could not wait for Monday.' },
        { who: null, en: 'Daniel is already at your door with two teh in a plastic bag. Farah is waiting downstairs in a borrowed car that she cannot drive with that knee.' },
        { who: null, en: 'He sleeps with the light on now, since the back seat of the black car. He says it is for the mosquitoes.', when: WAS_HELD },
        { who: 'Daniel Raj', en: 'They can bring the charge back any morning they like, machan. So this morning I am going to Melaka.', when: DNAA },
        { who: 'Daniel Raj', en: 'A box that has waited thirty-nine years. I want to see it before the lawyers do.' },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c9_intro_02_highway', mood: 'day', fx: [], place: 'North-South Expressway, southbound. 9:00 AM.',
      lines: [
        { who: null, en: 'You drive the borrowed car. Daniel folds a kancil out of the toll receipt in the passenger seat, and Farah sits in the back with her left knee in a brace, three ribs strapped and a walking stick across her lap.' },
        { who: 'Inspector Farah Iskandar', en: 'I am on medical leave. I am not here.' },
        { who: 'Inspector Farah Iskandar', en: 'Asri is minding my desk at Bukit Aman. He rings every hour to ask whether I have taken my tablets. I have not.' },
        { who: 'Inspector Farah Iskandar', en: 'Ayer Keroh, 5:28 AM, on the first. Now we know why Melaka.', when: (f) => f.TAIL_TRACED },
        { who: 'Inspector Farah Iskandar', en: 'Khairul rang Melaka Tengah last night. A Kuala Lumpur detective has no standing in Melaka, he told them, and an inspector on leave has less.', when: (f) => f.KHAIRUL_FREE && !f.KHAIRUL_WRONGED },
        { who: null, en: 'Supt. Khairul Anuar is in Sungai Buloh on Hamidah\'s charge. For once, nobody has rung ahead to warn Melaka about you.', when: (f) => !f.KHAIRUL_FREE },
      ],
      kb: { from: [1.0, 0, 2], to: [1.1, 0, -2] },
    },
    {
      img: 'c9_intro_03_kittangi', mood: 'warm', fx: ['dust'], place: 'The Kittangi, Jalan Kampung Pantai, Melaka. 11:30 AM.',
      lines: [
        { who: null, en: 'A Chettiar firm house a hundred and fifty years old: whitewash, teak pillars, brass lamps, a long hall running back from the street to the river. Sinar Heritage has put a Christmas tree in the courtyard where the moneylenders\' clerks once sat cross-legged over their ledgers.' },
        { who: null, en: 'The general manager meets you at the door in a grey suit with a gold sunburst pin on the lapel, and greets you by name before Farah has shown anybody anything.' },
        { who: 'Vanessa Low', en: 'Welcome to The Kittangi. We have kept the iron room exactly as the police found it. Sinar Heritage will help in every way it can.' },
        { who: 'Vanessa Low', en: 'Puan Melissa sends her regards.', when: (f) => SECRETARY(f) === 'melissa' },
        { who: null, en: 'On the reception desk, waiting for you, a card in copperplate from Singapore: "With the compliments of the season." No name.', when: (f) => SECRETARY(f) === 'vivian' },
      ],
      kb: { from: [1.08, -2, 0], to: [1.0, 2, 1] },
    },
    {
      img: 'c9_intro_04_ironroom', mood: 'night', fx: ['dust'], place: 'The iron room. Noon.',
      lines: [
        { who: null, en: 'At the back of the house, behind a 1938 iron door as thick as your hand, a room the size of a lorry\'s cab, and in its walls forty-two small iron doors. Forty-one are shut. One hangs open, its lock drilled out, iron filings on the floor under it like black sugar.' },
        { who: null, en: 'Through the slots of the box beside it, Box 15, you can see gold: chains, bangles, a wedding thali on a red thread. Nobody has touched it.' },
        { who: null, en: 'Ram Chettiar stands at the iron door in a white veshti with a shirt over it, a ring of old iron keys turning in his fingers, and does not come in.' },
        { who: 'Ram Chettiar', orig: 'Thaathaa sonnaar: mugatha paakkaadhe, saaviya paaru.', en: 'Grandfather said: don\'t look at the face, look at the key.' },
        { who: 'Ram Chettiar', en: 'Forty-two boxes. In my grandfather\'s time a thief would have taken everything. This one took one box, and nobody alive knows what was in it.' },
      ],
      kb: { from: [1.0, 1, 0], to: [1.14, -1, 0] },
    },
    {
      img: 'c9_intro_05_harmony', mood: 'day', fx: ['dust'], place: 'Jalan Tukang Emas, Harmony Street. 12:40 PM.',
      lines: [
        { who: null, en: 'One short street: the bells of the Vinayagar temple, the call to prayer from the Kampung Kling mosque with its pagoda roof, and joss smoke drifting out of Cheng Hoon Teng, all at once, as they have for three hundred years.' },
        { who: 'Daniel Raj', en: 'Machan. He kept a box for forty years, in a street where every god in Melaka lives next door.' },
        { who: 'Inspector Farah Iskandar', en: 'Then he chose the one street where nobody looks twice at a man who comes once a year.' },
      ],
      kb: { from: [1.06, 0, 1], to: [1.0, 0, -1] },
    },
    { title: { kicker: 'Case 9', name: 'Box 14' }, fx: ['dust'] },
  ],

  levels: [
    // ---------------- The iron room ----------------
    {
      id: 'c9_01', phase: 'The iron room', title: 'Forty-two boxes',
      game: 'wordsearch', variant: 'secret',
      brief: 'Ram Chettiar keeps an inventory of the iron room in his grandfather\'s style: one line per box, what the renter declared, in capitals, on a sheet of foolscap kept in the drawer of the counting room. Melaka Tengah has checked every box against it by torchlight and found every one as declared, but one. Ram copies the sheet out for you on the counting-room desk. Find every item. The letters nobody used will tell you what the list leaves out.',
      params: {
        size: 12,
        words: ['BANGLE', 'SOVEREIGN', 'THALI', 'CHAIN', 'ANKLET', 'RUBY', 'PEARL', 'DEED', 'GRANT', 'BROOCH', 'KASU', 'EMERALD', 'LOCKET'],
        extra: ['IRON', 'BRASS', 'TEAK', 'LAMP', 'SEAL', 'WAX', 'RING', 'COIN', 'TIN', 'SILK', 'BOND', 'VAULT', 'BOLT', 'LOCK', 'NOTE'],
        message: 'ONLYFOURTEENOPENED',
        messageSpaced: 'ONLY FOURTEEN OPENED',
      },
      evidence: {
        img: 'ev_c9_boxes', hotspot: { x: 0.47, y: 0.42, r: 0.13 },
        title: 'They left the gold',
        short: 'Forty-one boxes as declared, gold and all: bangles, sovereigns, a thali in Box 15 on the other side of a thin iron wall. Only Box 14 was opened. The iron door itself was not forced: it was opened with a key, and one lock was drilled.',
        text: 'Thirteen kinds of thing that the families of Melaka have trusted to an iron wall for a hundred years, and every one of them is where its renter left it. Sovereigns in a tin in Box 3. A grant to a rubber smallholding in Box 22. In Box 15, separated from the empty one by a sheet of iron the thickness of a coin, a wedding thali on a red thread and two kilos of chain, and the dust on the gold has not been disturbed. The 1938 iron door has no mark on it, inside or out, except a fresh scratch beside the keyhole and a bright stub of broken brass deep in the lock. Box 14\'s own small door was opened with a drill: a clean core through the lock, the filings fallen in a cone on the floor. Ram reads the line for Box 14 off his grandfather\'s sheet. Renter: Sinar Pengangkutan, Jugra. Declared contents: one blank. "Fifty years, paid in advance, in 1987," he says. "My grandfather never asked what was in it. One does not." Daniel crouches by the cone of filings. "Somebody walked through a room full of gold," he says, "and opened the one box with nothing written on it."',
      },
    },
    {
      id: 'c9_02', phase: 'The iron room', title: 'The notch',
      game: 'rotation', variant: '2d',
      brief: 'Melaka Tengah\'s fingerprint man draws the broken stub out of the iron door\'s lock with a dentist\'s pick: the bit and part of the bow of a brass copy key, snapped off on the way out. A copy is a copy of something, and somebody cut it. In the Portuguese Settlement there is a workshop with a board of every bow pattern its owner has cut in forty years, and Ram knows it. Lay the stub against the board. The patterns are turned, and some are mirrored.',
      params: { trials: 12, target: 10, options: 4 },
      evidence: {
        img: 'ev_c9_key', hotspot: { x: 0.40, y: 0.38, r: 0.15 },
        title: 'The notch',
        short: 'The snapped copy in the iron door was cut from the iron room\'s own key, on a blank of old-fashioned brass, and on the edge of its bow there is a tiny V filed by hand. Every key Joaquim Sequeira of the Portuguese Settlement has cut in forty years carries that notch.',
        text: 'A brass blank of a pattern nobody has made since the 1970s, cut by hand on an old duplicating machine to the bitting of the iron room\'s own key, and broken at the shoulder where a nervous hand twisted it the wrong way in a stiff lock. On the edge of what is left of the bow, so small you need the fingerprint man\'s loupe to see it, a V-shaped notch filed by hand. Ram knows it at once. "Jock\'s mark," he says. "Every key in every old house on this river has it. Jock says it is so that when he is dead people will know which keys were honest." Joaquim "Jock" Sequeira, sixty-six, locksmith, of the Portuguese Settlement, has cut keys for the Chettiar house for forty years. He has never been asked to cut this one. Ram says he has never let it off his ring.',
      },
    },
    {
      id: 'c9_03', phase: 'The iron room', title: 'Vacant by the thirty-first',
      game: 'ledger', variant: 'classic',
      brief: 'Ram keeps his family\'s accounts the way his grandfather taught him, in a bound book, and his accountant in Jonker Street keeps a copy on a laptop and prints it every Friday for the bank. On Christmas morning, before the police came, somebody changed two cells in the laptop copy. The accountant\'s Friday printout is in a drawer. Find the two cells and put back what they said.',
      params: {
        rows: 6, cols: 5, altered: 2, restore: true, currency: 'RM', magnitude: 'thousands',
        rowLabels: ['Father\'s creditors', 'Iron room rents', 'Sinar Heritage (sale)', 'Sinar Heritage (advance)', 'Mahkota Medical', 'Temple and family'],
        colLabels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        clue: 'The accountant\'s printout is from Friday the eighteenth. The laptop was opened at 6:40 on Christmas morning, an hour before Melaka Tengah arrived.',
      },
      evidence: {
        img: 'ev_c9_offer', hotspot: { x: 0.55, y: 0.55, r: 0.20 },
        title: 'Vacant by the thirty-first',
        short: 'Restored: Ram owes RM 400,000 of his late father\'s debts. In November he agreed to sell the iron room\'s rights to Sinar Heritage for RM 3 million "with vacant possession of the iron room by 31 December". And on 22 December, the day the court fixed the hearing to open Box 14, Sinar Heritage paid him an advance of RM 50,000.',
        text: 'Two cells, put back to what the accountant printed on Friday the eighteenth. Sinar Heritage, sale: RM 3,000,000, agreed 19 November, the rights of the Muthiah Chettiar iron room, "with vacant possession of the iron room by 31 December 2026". Vacant: every box claimed, opened and emptied, or every renter dead, by New Year\'s Eve. The row above it, which nobody changed, is the reason: his late father\'s creditors, RM 400,000, at the rates his grandfather would have spat at. And Sinar Heritage, advance: RM 50,000, paid into Ram\'s account on Tuesday 22 December, the same afternoon the High Court fixed Monday the 28th to open Box 14 on the prosecutor\'s application. Ram sits down on the iron room\'s step with his keys in his lap. "Thirty-eight boxes have been claimed since November," he says. "Three renters are dead. Box 14 was the last thing in the room. And on Monday a court was going to open it, and the sale would have waited a year."',
      },
    },
    {
      id: 'c9_04', phase: 'The iron room', title: 'Not a good man',
      game: 'kakuro', variant: 'classic',
      brief: 'In the counting room, under a dust sheet, the firm\'s ledgers stand in a teak press: one fat cloth-bound book for every year from 1912 to 1994, written in Tamil by three generations of one family. Ram takes down 1986. The monsoon of 1987 got into the press, and the figures in the December pages have run, but Muthiah Chettiar checked every page by cross-sums in the margins, down and across, in the old Tamil numerals. Rebuild the sums, and the page comes back.',
      params: { difficulty: 'expert' },
      evidence: {
        img: 'ev_c9_ledger', hotspot: { x: 0.65, y: 0.42, r: 0.20 },
        title: 'Not a good man',
        short: 'Muthiah Chettiar\'s ledger, 2 December 1986: RM 18,000 to "Sinar Pengangkutan, Jugra, the bearer", against a Bedford lorry, BCK 210, at 2% a month, guarantor M. Perumal, his right thumb. Repaid on 1 December 1987, to the day; Box 14 rented the same day for fifty years, paid in advance. In the margin: "Not a good man. But he will repay."',
        text: 'Second of December 1986, in a careful Tamil hand. Eighteen thousand ringgit, to "Sinar Pengangkutan, Jugra, the bearer": no name, only a company that did not yet own a lorry and a word that means whoever holds the paper. Security: a Bedford lorry, BCK 210, its registration card deposited in the firm\'s keeping, the card still made out to a Teoh Ah Chuan of Jugra. Interest at two per cent a month. Guarantor: M. Perumal, of Jugra, his right thumb, as the firm took it from every guarantor. Repaid in full on the first of December 1987, to the day, in cash. On the same line, the same day: Box 14, rented to Sinar Pengangkutan for fifty years, the whole rent paid in advance. And in the margin beside the loan, in Muthiah Chettiar\'s own hand, the only remark on the page: நல்ல மனுஷன் இல்லை. ஆனால் கடனைத் திருப்பித் தருவான். Ram reads it aloud and then in English, slowly, as if his grandfather were in the room. "Not a good man. But he will repay." Farah writes down "M. Perumal" and stops. Muthusamy a/l Perumal drove the black car for forty years. In 1986 he was already standing next to the man who borrowed.',
      },
    },
    {
      id: 'c9_tl', phase: 'The iron room', title: 'Four minutes',
      game: 'safecracker', variant: 'classic',
      when: (f) => !!f.TAIL_TRACED,
      brief: 'Ayer Keroh at 5:28 AM on the first of December is twenty minutes from this house. Farah asks Ram one question about that morning, and he goes grey and opens the drawer of the counting-room desk that has a four-digit brass lock, and then cannot remember the numbers, or will not.',
      params: {
        digits: 4, tries: 8, bonus: 4, repeats: true,
        contains: [9, 2],
        clue: 'Ram: "My father set it. He said it had the nine and the two of the firm\'s year in it, and the rest was his own business."',
      },
      evidence: {
        img: 'ev_c9_drawer', hotspot: { x: 0.45, y: 0.55, r: 0.18 },
        title: 'Four minutes',
        short: 'Ram\'s private log: Tuesday 1 December, 6:10 AM, the iron room opened for "the bearer of Box 14". Four minutes. An old man with a black umbrella, a white cuff at the wrist. Ram looked at the key, not the face, as his grandfather taught him. A black Land Cruiser with one headlight out waited in the lane with its engine running.',
        text: 'In the drawer, a school exercise book in Ram\'s own hand, one line for every time the iron room has been opened out of hours, which his grandfather called "for the bearer" and never wrote in the visitor book\'s columns. The last line: Tuesday 1 December 2026, 6:10 AM, Box 14, four minutes. Ram tells it looking at the floor. A telephone call to the house at half past five, a man\'s voice he did not know: the bearer of Box 14 will come at ten past six. At ten past six an old man under a black umbrella in the drizzle, a white cuff at the wrist, the key held out in front of him so that Ram would look at it, and Ram looked at it. Four minutes in the iron room with the door pulled to. Something written in the visitor book. Then the umbrella went back down the lane to a black Land Cruiser with a bull bar and one headlight out, its engine running, and was gone. "Thaathaa said look at the key," Ram says. "So I looked at the key. I do not know who he was. I did not want to know." Nobody in the room says who they think he was.',
      },
    },

    // ---------------- The Kittangi ----------------
    {
      id: 'c9_05', phase: 'The Kittangi', title: 'Zone fourteen',
      game: 'fusebox', variant: 'classic',
      brief: 'Since 2024 the iron room\'s alarm has run through the hotel\'s own panel, in a cupboard behind reception. At midnight on Christmas Eve the Settlement\'s fireworks set the vibration sensors off all over the house, and somebody tried to silence them and tripped the whole board. It will not show its memory until every breaker is back on.',
      params: {
        size: 5, pattern: 'plus', presses: 8,
        clue: 'Kumar, the night porter: "Every year the fireworks set off the sensors. Every year Madam Vanessa says leave it to her."',
      },
      evidence: {
        img: 'ev_c9_panel', hotspot: { x: 0.65, y: 0.35, r: 0.15 },
        title: 'Zone fourteen',
        short: 'The panel\'s memory: zone 14, IRON ROOM, bypassed at 23:50:12 on Christmas Eve, by a user code; restored at 00:31:40. In those forty-one minutes the iron door and the river gate behind the godown could open without a sound. The user field is corrupted.',
        text: 'The board comes back row by row and the panel\'s little screen scrolls the night. 23:41, zone 6, courtyard, vibration: the Settlement\'s first rockets, two kilometres away, shaking a house that has stood on teak piles in river mud since the 1870s. 23:44, zones 2 and 3. And at 23:50:12, zone 14, IRON ROOM, not tripped but bypassed: switched out of the alarm by somebody standing at this panel with a user code. Restored at 00:31:40. For forty-one minutes the iron door, its vibration sensor, and the contact on the old gate where the godown passage meets the river steps all reported nothing to anybody. In the user field, where the panel writes the code that did it, a row of corrupted blocks. Farah taps the screen with the end of her stick. "Somebody knew which zone," she says. "There are twenty-two. They switched off one."',
      },
    },
    {
      id: 'c9_06', phase: 'The Kittangi', title: 'User 07',
      game: 'tape', variant: 'spectro',
      brief: 'The alarm company records the panel\'s telephone line, as every panel in Malaysia must by law, onto a server in Bangsar that nobody has listened to since it was installed. Every change of state goes down the line as a short burst under the hiss, the panel reporting itself and the user who touched it. Ken has sent you the program again. Find the burst at 23:50 and read what it says.',
      params: {
        answer: 'USER-07', noise: 0.6, decoys: 2,
        label: 'ALARM LINE · KITTANGI · 24 DEC 23:50',
        clue: 'A panel that changes state reports it down the phone line, under the noise. Look at the sound.',
      },
      evidence: {
        img: 'ev_c9_spectro', hotspot: { x: 0.50, y: 0.35, r: 0.15 },
        title: 'USER-07',
        short: 'Drawn as a picture, the burst on the alarm line at 23:50:12 reads USER-07. The hotel\'s user list has one name against code 07: the general manager, Vanessa Low.',
        text: 'Under the hiss of the line at 23:50:12, a burst a third of a second long, and drawn as a picture it holds clean bright blocks: ZONE 14, BYPASS, USER-07. At 00:31:40 the same blocks again: RESTORE, USER-07. The hotel\'s panel has twenty-two users, one code each, on a list kept by the security contractor in Bangsar. 01 is the contractor. 02 to 06 are the duty managers. 07 is the general manager. Vanessa Low Pei Shan, who told Melaka Tengah on Christmas morning that the iron room\'s alarm "must have been beaten somehow, it was on all night", and who met you at the door by name.',
      },
    },
    {
      id: 'c9_07', phase: 'The Kittangi', title: 'The river steps',
      game: 'maze', variant: 'cameras',
      brief: 'The Kittangi has twenty cameras, put in by Sinar Heritage in 2024 to watch the guests, the bar and the till. Behind the iron room the old house runs down to the river through what was the firm\'s godown, a passage of storerooms the hotel uses for linen and broken chairs. Melaka Tengah says nobody could have reached the iron room unseen. Trace it backwards: from the iron room, find the one way out that no camera sees.',
      params: {
        map: [
          '#########L###########',
          '#...#.......#.......#',
          '#.#.#.#####.#.#####.#',
          '#.#...#...#...#...#.#',
          '#.#####.#.#####.#.#.#',
          '#.....#.#.......#.#.K',
          '###.#.#.#########.###',
          '#...#...#.S.#.....#.#',
          '#.#######.#.#.###.#.#',
          '#.#.....#.#.#...#...#',
          '#.#.###.#.#####.###.#',
          '#...#.....#.........#',
          '###########R#########',
        ],
        cameras: [
          { x: 15, y: 10, dir: 'N', range: 1 },
          { x: 14, y: 9, dir: 'S', range: 2 },
          { x: 6, y: 1, dir: 'E', range: 3 },
          { x: 19, y: 4, dir: 'E', range: 1 },
          { x: 13, y: 2, dir: 'S', range: 1 },
          { x: 8, y: 1, dir: 'S', range: 3 },
        ],
        exits: { L: 'The lobby and reception, Jalan Kampung Pantai', K: 'The kitchen yard and the service lane', R: 'The river steps, through the old godown passage' },
        startLabel: 'IR',
        startName: 'The iron room',
        aria: 'Plan of The Kittangi, from the iron room to the street, the service lane and the river, with its cameras',
        answer: 'R',
      },
      evidence: {
        img: 'ev_c9_passage', hotspot: { x: 0.70, y: 0.55, r: 0.18 },
        title: 'The river steps',
        short: 'One way from the iron room is out of sight of every camera in the hotel: back through the old godown passage to the river steps. On its tiles, dried river mud in the shape of rubber soles, coming and going. The padlock on the river gate was opened with its own key, not cut, and hung back on the hasp.',
        text: 'Twenty cameras, and every one of them looks at something a guest might steal or complain about: the bar, the till, the courtyard, the pool, the lobby. Not one looks down the godown passage, because nobody stays there and nothing is kept there but linen. At its far end, an iron gate onto a flight of stone steps going down into the Melaka river, where the firm\'s boats tied up a century ago, and the hotel\'s river-steps handheld radio hangs on a hook beside it so that the cruise can call when it brings guests to dinner. On the passage tiles, under a dust of lint from the linen shelves, dried grey river mud printed by rubber soles: two men, perhaps three, coming in and going out. The padlock on the gate is a good one. It was not cut. It was opened with its own key and hung back on the hasp, unlocked, and the key to it lives in the general manager\'s office.',
      },
    },

    // ---------------- The river ----------------
    {
      id: 'c9_08', phase: 'The river', title: 'Boat seven',
      game: 'spotdiff', variant: 'classic',
      brief: 'The river cruise ties up its boats for the night at a jetty below Kampung Morten, under a camera the cruise company put up after somebody stole a boat for a joyride in 2019. It takes one still every half hour. Daniel finds the 11:30 PM still and the 6 AM still from Christmas Eve on the jetty office\'s computer. Nobody is supposed to touch the boats between them.',
      params: { differences: 10 },
      evidence: {
        img: 'ev_c9_boat', hotspot: { x: 0.42, y: 0.55, r: 0.13 },
        title: 'Boat seven',
        short: 'Between 11:30 PM and 6 AM, boat 7 moved: tied up on the other side of the pontoon, its fenders wet, its cover off, and on its bow a fresh scrape of white paint, the white of The Kittangi\'s river steps. The night pilot who had its key: Shamsul Bakri, of Kampung Morten.',
        text: 'Two stills, six and a half hours apart, and nothing is supposed to happen between them. At 11:30 PM eight boats tied stern to the pontoon in a row, covers on, the last cruise\'s pilot walking away up the gangway. At 6 AM, seven of them exactly so. Boat 7 is tied bow-on at the far end of the pontoon, its canvas cover folded on the seats, its fenders dark with water that has not had time to dry. Low on its bow, above the waterline, a scrape of white paint the length of a hand, and Daniel has already been back to The Kittangi to look at the bottom step of the river stairs, where the whitewash is scuffed off in a matching curve. The jetty office\'s key board has seven keys on it. Boat 7\'s key goes home every night with the night pilot, who lives two houses up from the jetty with his mother: Shamsul Bakri, thirty-three, who told Melaka Tengah he tied up at half past eleven and watched the fireworks from her steps.',
      },
    },
    {
      id: 'c9_09', phase: 'The Kittangi', title: 'He told her the date',
      game: 'interrogation', variant: 'classic',
      brief: 'Ram Chettiar asks to be interviewed in the counting room, at his grandfather\'s teak desk, under a calendar from 1994 that nobody has taken down. Farah sits by the door with her stick across her knees. Daniel stands at the window over the river and does not look round. One thing Ram tells you is not true. Find it, and put the exhibit that breaks it on his grandfather\'s desk.',
      params: {
        setting: 'The counting room, The Kittangi, Jalan Kampung Pantai. Saturday 26 December, 9:00 AM.',
        suspect: {
          id: 'ram', voice: 'voice_2', name: 'Ramanathan "Ram" Chettiar', role: 'Keeper of the iron room, grandson of Muthiah Chettiar, 46',
          persona: 'Courteous, precise Melaka Chettiar in his mid-forties: careful, formal Malaysian English, the odd Tamil word ("Ayyo", "Thaathaa" for his grandfather, "Appa" for his father). Keeps a ring of old iron keys turning in his fingers and never looks at the person he is talking to, only at the keys. Ashamed of his late father\'s debts and more ashamed that they show. Answers exactly the question asked and not one word more. Warm only about his grandfather and the old firm; cold, almost rude, about Sinar.',
        },
        facts: [
          { id: 'f1', topic: 'the firm', claim: 'My great-grandfather came from Karaikudi. The firm lent money from this house from 1912 until my father closed the books in 1994.' },
          { id: 'f2', topic: 'the iron room', claim: 'Forty-two boxes behind a 1938 door. My grandfather\'s will keeps the room ours until every renter has claimed or died.' },
          { id: 'f3', topic: 'his mother', claim: 'My mother is eighty-one and her heart is bad. On Christmas Eve it was very bad.' },
          { id: 'f4', topic: 'Box 14', claim: 'Box 14 was rented by a lorry company from Jugra in 1987, for fifty years, paid in advance. I have never seen inside it. One does not.' },
          { id: 'f5', topic: 'the hotel', claim: 'Sinar Heritage bought the house in 2024. The iron room was not in the sale. My grandfather saw to that.' },
          { id: 'f6', topic: 'his grandfather', claim: 'Thaathaa said: do not look at the face, look at the key. A banker who looks at faces lends to the wrong men.' },
          { id: 'f7', topic: 'his father\'s debts', claim: 'My father borrowed from people my grandfather would not have let through the front door. I am paying them back. Slowly.' },
        ],
        lies: [
          { id: 'l1', topic: 'Sinar', claim: 'Sinar has never asked me to give up the iron room. They are my landlord in the front of the house, nothing more.', truth: 'In November he agreed to sell the iron room\'s rights to Sinar Heritage for RM 3 million, with vacant possession by 31 December.', exposedBy: 'e1' },
          { id: 'l2', topic: 'the key', claim: 'Nobody else has ever had a key to the iron door. It has not been off my ring for one hour since my father died.', truth: 'In October he lent the iron-room key to the hotel\'s general manager for "the insurer\'s inspection", and it came back the next morning.', exposedBy: 'e2' },
          { id: 'l3', topic: 'the court', claim: 'I told nobody that the court would open Box 14. Why would I tell anybody?', truth: 'On 22 December, the day the hearing was fixed, he told Vanessa Low the date, and Sinar Heritage paid him an advance of RM 50,000 the same afternoon.', exposedBy: 'e1' },
        ],
        evidence: [
          { id: 'e1', title: 'Vacant by the thirty-first', text: 'His accounts, restored: RM 3 million from Sinar Heritage for the iron room "with vacant possession by 31 December", and an advance of RM 50,000 paid on 22 December, the day the court fixed the hearing.' },
          { id: 'e2', title: 'The notch', text: 'The snapped key in the iron door is a copy cut from the iron room\'s own key, with Jock Sequeira\'s notch filed in its bow.' },
          { id: 'e3', title: 'They left the gold', text: 'Forty-one boxes untouched, gold and all. The iron door opened with a key; one lock drilled: Box 14\'s.' },
          { id: 'e4', title: 'Not a good man', text: 'His grandfather\'s 1986 ledger: RM 18,000 to "Sinar Pengangkutan, Jugra, the bearer", guarantor M. Perumal; Box 14 rented on the day it was repaid.' },
          { id: 'e5', title: 'Zone fourteen', text: 'The hotel\'s alarm panel: the iron room\'s zone bypassed by a user code at 23:50:12 on Christmas Eve, restored at 00:31:40.' },
          { id: 'e6', title: 'Boat seven', text: 'The cruise jetty camera: boat 7 moved in the night, with the white paint of the hotel\'s river steps on its bow.' },
        ],
        secret: 'He told Vanessa Low on 22 December that the court would open Box 14 on the 28th, because the sale and its RM 50,000 advance depended on the iron room being empty, and in October he lent her his key for an "insurer\'s inspection"; he stole nothing, and from 23:30 to 1:15 on Christmas Eve he was at Mahkota Medical Centre with his mother.',
        suggested: [
          'Has Sinar asked you to give up the iron room?',
          'Who else has ever had your key?',
          'Who did you tell about the court?',
          'Where were you at midnight on Christmas Eve?',
          'What was in Box 14?',
          'Who comes to Box 14?',
          'How much do you owe?',
        ],
        maxQuestions: 14,
        clue: 'Farah, from the door: "He is not lying to protect himself. He is lying to protect his grandfather\'s name. Find the thing he is ashamed of."',
      },
      evidence: {
        img: 'ev_c9_keys', hotspot: { x: 0.47, y: 0.65, r: 0.15 },
        title: 'He told her the date',
        short: 'Caught, Ram tells it: on 22 December he told Vanessa Low the court would open Box 14 on Monday, and took Sinar\'s advance the same afternoon; in October he lent her his key for one night "for the insurer". Then, unasked: every 1 December since 1987 Box 14 has been opened before dawn for four minutes, and the visitor book signed "M.P." And the visitor book went missing from its shelf this month.',
        text: 'He puts the keys down on his grandfather\'s desk for the first time, and leaves his hand on them. "Ayyo. Yes. I told her. On Tuesday the twenty-second, at four o\'clock, in her office, because she asked when the box would be empty and I was ashamed to say a court was going to open it first. Sinar paid the fifty thousand at five." In October she had asked for the key for one night, for the insurer\'s man, who would come early; it came back the next morning on a velvet cushion, with a box of dodol for his mother. "I thought, a hotel. A hotel is careful." Then, while Farah is still writing, he says the thing nobody asked him. "You should know about Box 14. Every first of December since 1987, before dawn, the iron room was opened for the bearer of Box 14. My grandfather opened it, then my father, then I. Four minutes, never five. He signed the visitor book M.P., every year." He looks at the shelf by the iron door, where a long gap stands between two account books. "The visitor book has been on that shelf since 1938. In December it went. I did not report it. Who would I report it to? The hotel?" At midnight on Christmas Eve, Mahkota Medical Centre has him on its A&E camera, holding his mother\'s handbag.',
      },
    },

    // ---------------- The Settlement ----------------
    {
      id: 'c9_10', phase: 'The Settlement', title: 'A spare for the insurer',
      game: 'witness', variant: 'statement',
      brief: 'Jock Sequeira\'s workshop is a lean-to at the side of his house in the Portuguese Settlement, three streets from the sea, and on Boxing Day afternoon the Christmas lights are still on along every gutter and a banner over the street says BONG NATAL. He has heard that a key with his notch was found in the Chettiar iron door. He has his receipt book on the bench before you sit down. He will tell it once.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Statement of Joaquim Sequeira, 66, locksmith, Portuguese Settlement. Recorded Saturday 26 December, 3:20 PM.',
        introLine: 'Jock lays his receipt book open on the bench and puts his reading glasses on the page to hold it. "Forty years I have written down every key. My wife says I am a fool. Today I am not a fool."',
        retryLine: 'He takes the glasses off, cleans them on his shirt, and tells it again from the beginning, the same words.',
        statement: [
          'Fourteenth of October, a Wednesday, half past four. The lady from the new hotel came herself, in her grey suit, with a big old key in a velvet bag. The Chettiar iron room key. I know it. I have seen it on Mr. Ram\'s ring since he was a boy, and on his father\'s before him.',
          'She said, the insurer needs a spare, for the inspection, Mr. Chettiar knows. She paid cash, eighty ringgit, and she did not want a receipt. I gave her a receipt. I write: Kittangi, spare, iron room, insurance, V. Low, eighty ringgit. She took the receipt and the two keys and went.',
          'I cut it on my old machine on a brass blank from 1972, because the new blanks are too thin for those locks. And I filed my notch in the bow, as I do in every key. My father did it, and his father. So that when I am dead people will know which keys were honest.',
          'Christmas Eve, I was at the midnight mass at the Settlement chapel, in the second row, because my wife sings. Then the dancing in the square until two. Then home. Everybody in the Settlement has a photograph of me dancing badly. Ask anybody.',
          'A copy key is not a bad key, sir. A copy key is a key. It is what you do with it. If the lady gave my key to thieves, then my notch is on the thieves, and I would like it back.',
        ],
        questions: [
          { q: 'What date did the hotel lady come?', options: ['4 October', '14 October', '24 October', '14 November'], a: 1 },
          { q: 'What time did she come?', options: ['Ten in the morning', 'Noon', 'Half past four', 'Eight at night'], a: 2 },
          { q: 'What did she carry the key in?', options: ['Her handbag', 'An envelope', 'A velvet bag', 'A tin'], a: 2 },
          { q: 'Who did she say needed the spare?', options: ['Mr. Chettiar', 'The police', 'The insurer', 'The bank'], a: 2 },
          { q: 'How much did she pay?', options: ['RM 40', 'RM 80', 'RM 180', 'Nothing'], a: 1 },
          { q: 'What did she not want?', options: ['A copy', 'A receipt', 'The old key back', 'Change'], a: 1 },
          { q: 'What was the blank made of?', options: ['Steel', 'Nickel', 'Brass', 'Iron'], a: 2 },
          { q: 'Where was Jock at midnight on Christmas Eve?', options: ['In his workshop', 'At the mass, second row', 'At the dancing', 'At home'], a: 1 },
          { q: 'Until when was there dancing?', options: ['Midnight', 'One', 'Two', 'Dawn'], a: 2 },
        ],
      },
      evidence: {
        img: 'ev_c9_receipt', hotspot: { x: 0.42, y: 0.58, r: 0.15 },
        title: 'A spare for the insurer',
        short: 'Jock\'s receipt book, 14 October: "Kittangi, spare, iron room, insurance. V. Low. RM 80." The hotel\'s general manager brought the iron-room key herself, paid cash and took the copy. At midnight on Christmas Eve Jock was in the second row at the Settlement\'s mass, then in the square, in a hundred photographs.',
        text: 'A cheap receipt book with a carbon, forty years of them on a shelf over the bench in elastic bands, and on the carbon for Wednesday 14 October, in a locksmith\'s square capitals: KITTANGI. SPARE. IRON ROOM. INSURANCE. V. LOW. RM 80. "She did not want the receipt," Jock says. "So I gave her two." The insurer the Kittangi uses is a company in Kuala Lumpur, and Farah rings it from the workshop step: nobody there has ever inspected an iron room in Melaka, or asked for a key to one. On Christmas Eve, the Settlement\'s photographs, sent to Farah\'s phone within the hour by half the street: Jock in the second row of the chapel at 11:58 PM with his eyes shut; Jock at 12:20 AM in the square under the lights, dancing the branyo very badly with his wife; Jock at 1:40 AM, asleep on a plastic chair with a paper crown on. "My notch is on the thieves," he says. "I want it back."',
      },
    },

    // ---------------- The river ----------------
    {
      id: 'c9_11', phase: 'The river', title: 'Under the fireworks',
      game: 'timeline', variant: 'cctv',
      brief: 'Farah lays Christmas Eve out on the counting-room desk from every camera and log Melaka Tengah could get on a public holiday: the cruise jetty, the hotel\'s panel and radios, a hospital, the Settlement\'s fireworks, a bus station. Eight frames, shuffled. Put them in order. The lock tells you how many are in the right place.',
      params: {
        frames: [
          { id: 'a', clock: '23:30', title: 'Cruise jetty', text: 'The last cruise ties up. Its pilot walks up the gangway. Boat 7 dark at the end of the row, cover on.' },
          { id: 'b', clock: '23:3▮', title: 'Mahkota Medical Centre, A&E', text: 'Ram Chettiar signs in at the counter, his mother on his arm, her handbag over his shoulder.' },
          { id: 'c', clock: '23:50', title: 'The Kittangi, alarm panel', text: 'Zone 14, IRON ROOM: bypassed. User 07.' },
          { id: 'd', clock: '23:52', title: 'Cruise jetty', text: 'Boat 7 slips away from the pontoon with no lights. Three figures aboard, one at the wheel.' },
          { id: 'e', clock: '23:56', title: 'The Kittangi, river-steps handheld', text: 'A man\'s voice, quick and low: "Tujuh, sampai." Nobody answers.' },
          { id: 'f', clock: '00:0▮', title: 'The Kittangi, courtyard', text: 'A hundred and forty guests counting down under the tree. Over their heads the Settlement\'s fireworks fill the sky.' },
          { id: 'g', clock: '00:2▮', title: 'Cruise jetty', text: 'Boat 7 noses back in at the wrong end of the pontoon. One man walks up toward Kampung Morten with a dry bag.' },
          { id: 'h', clock: '02:1▮', title: 'Melaka Sentral, bay 9', text: 'A man with a dry bag on his shoulder stands under the lights of an empty bay, waiting.' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      },
      evidence: {
        img: 'ev_c9_fireworks', hotspot: { x: 0.50, y: 0.45, r: 0.20 },
        title: 'Under the fireworks',
        short: 'Christmas Eve in order: Ram at Mahkota with his mother from 23:34; the iron room switched off at 23:50 by user 07; boat 7 out dark at 23:52 with three aboard; "Tujuh, sampai" on the hotel\'s river-steps radio at 23:56; the fireworks from midnight; boat 7 back by 00:20; a man with a dry bag at Melaka Sentral, bay 9, after two.',
        text: 'Laid in order, the night stops being a mystery and becomes a timetable. 23:30, the last cruise in, boat 7 dark. 23:34, Ram Chettiar at the A&E counter at Mahkota Medical Centre, three kilometres away, with his mother\'s handbag over his shoulder; the hospital\'s camera keeps him in its waiting room until 1:15. 23:50, the iron room switched off at the hotel\'s panel by user 07. 23:52, boat 7 slides out into the river with no lights and three people aboard. 23:56, on the radio that hangs by the hotel\'s river gate, a man\'s voice: "Tujuh, sampai." Seven, here. 23:58 to 00:09, while a hundred and forty guests in the courtyard count down and the sky over the Straits goes white and red, two men in the iron room with a copy key and a drill, under the noise. 00:20, boat 7 back, and one man walking up into Kampung Morten with a dry bag. Then, after two, the same bag, or one like it, at Melaka Sentral.',
      },
    },

    // ---------------- The Kittangi ----------------
    {
      id: 'c9_12', phase: 'The Kittangi', title: 'An insurer that does not exist',
      game: 'hiddenobject', variant: 'list',
      brief: 'Farah\'s friend at Melaka Tengah gets a magistrate out of his Boxing Day lunch for a warrant covering the general manager\'s office, and only the office. Vanessa Low stands in the doorway with her arms folded and watches you. Her desk is very tidy and her drawers are not. Find everything on the list.',
      params: { scene: 'desk', targets: 14, objects: 78 },
      evidence: {
        img: 'ev_c9_office', hotspot: { x: 0.50, y: 0.55, r: 0.18 },
        title: 'An insurer that does not exist',
        short: 'In Vanessa Low\'s desk: a letter in October from an "insurer" with no address and no telephone, asking for a spare iron-room key; the top copy of Jock\'s receipt; a second phone with no contacts; and a Christmas card from the Office of the Chairman with no name in it, only "Thank you" in print. And the key to the river gate\'s padlock, on her own ring.',
        text: 'A tidy desk, a fountain pen, a framed photograph of Vanessa shaking hands with Sinar Heritage\'s board, and in the drawers everything a careful woman keeps because throwing it away would be a decision. A letter dated 9 October on the letterhead of an insurer that, Farah confirms in two calls, does not exist: no address, no telephone, a request for "a duplicate of the iron room key, for our inspector, at the hotel\'s convenience". The top copy of Jock Sequeira\'s receipt, the one she did not want. A second phone, switched off, with no contacts in it and one number in its call log, a prepaid that answers nobody. On her keys, the brass key to the river gate\'s padlock. And standing on the shelf among the guests\' cards, a heavy cream Christmas card with a small brass sun pressed into it, from the Office of the Chairman: no name, no greeting, only two printed words inside, "Thank you", and the date it came, the twenty-third, written on the back in her own hand. Vanessa watches you hold it. "Every manager in the group gets one," she says. It is the first thing she has said that is not true in a way you can prove.',
      },
    },
    {
      id: 'c9_13', phase: 'The Kittangi', title: 'Box 14 only',
      game: 'shredder', variant: 'classic',
      brief: 'The shredder under Vanessa Low\'s desk has a bin, and the hotel\'s cleaners do not come into the general manager\'s office on public holidays. One sheet went in on Christmas morning, and some of the strips went in upside down.',
      params: {
        title: 'SINAR HOLDINGS BERHAD',
        text: 'OFFICE OF THE CHAIRMAN\n\nTo: V.L.\nChristmas Eve\n\nBox 14 only.\nLeave the gold.\n\nThe river at midnight.\nMelaka Sentral at ten past two.\n\nNothing on the phones.',
        strips: 10,
        flips: true,
        stamp: 'PRIVATE',
        clue: 'The shredder\'s little counter says one sheet, at 07:12 on Christmas morning.',
      },
      evidence: {
        img: 'ev_c9_order', hotspot: { x: 0.42, y: 0.45, r: 0.18 },
        title: 'Box 14 only',
        short: 'The shredded order, from the Office of the Chairman to "V.L.", for Christmas Eve: "Box 14 only. Leave the gold. The river at midnight. Melaka Sentral at ten past two. Nothing on the phones." She shredded it at 7:12 on Christmas morning, an hour before she told Melaka Tengah the alarm had been on all night.',
        text: 'Printed, as they always are, on Sinar Holdings paper, and folded twice to fit something: a card, an envelope, a hamper. OFFICE OF THE CHAIRMAN. To: V.L. Christmas Eve. Then the orders, in pairs, the way they always come. Box 14 only. Leave the gold. The river at midnight. Melaka Sentral at ten past two. Nothing on the phones. No signature, only the office. Nine words to empty one box in a room of forty-two and walk past the rest, and somebody who was told exactly where the river came in and exactly when Melaka would be looking at the sky. At 7:12 on Christmas morning it went into the shredder under her desk. At 8:15 she told Melaka Tengah that the iron room must have been beaten somehow, because the alarm had been on all night. Daniel reads "Leave the gold" twice. "He is not a thief, machan," he says. "He is a man taking back his own thing before the court sees it."',
      },
    },
    {
      id: 'c9_14', phase: 'The Kittangi', title: 'Iron filings',
      game: 'getaway', variant: 'classic',
      brief: 'The Kittangi\'s basement car park has room for twelve cars, and on Boxing Day night it holds fifteen, because every Christmas guest who came for dinner has stayed for the bar. At the back, boxed in, the hotel\'s grey van, which Vanessa Low says has not moved since the twenty-third. Melaka Tengah\'s warrant covers the van. Get it out to the ramp.',
      params: {
        difficulty: 'hard', target: 'HOTEL VAN',
        clue: 'Cars only go forwards and back. The ramp is on the right. The valet has gone to the bar with every key but one.',
      },
      evidence: {
        img: 'ev_c9_van', hotspot: { x: 0.55, y: 0.58, r: 0.15 },
        title: 'Iron filings',
        short: 'In the hotel van, under a pile of linen: a cordless drill with a core bit still packed with iron filings, and an empty envelope marked "S." with a bank band for RM 30,000. The van\'s logbook and the basement barrier agree: out at 1:30 AM on Christmas morning, back at 2:20.',
        text: 'Under a pile of clean tablecloths in the back of the van, a cordless drill in a canvas bag, the kind a builder buys, and in its chuck a core bit with its throat packed solid with grey-black filings, which Melaka Tengah\'s fingerprint man matches to the cone under Box 14 by the end of the evening. Under the passenger seat, an empty brown envelope with one letter on it in a woman\'s hand, "S.", and a paper bank band printed RM 30,000, the kind a bank puts round sixty notes of five hundred. The van\'s logbook, in the driver\'s hand, says nothing for the twenty-fourth. The barrier at the top of the ramp says the van went out at 1:30 AM on Christmas morning and came back at 2:20, with its dashcam unplugged. Kampung Morten is six minutes away by van. Vanessa Low says that she did not drive it, and that she does not know who did, and that the drill must belong to the maintenance man, who is in Ipoh for Christmas and has never owned a core bit in his life.',
      },
    },

    // ---------------- Melaka Sentral ----------------
    {
      id: 'c9_15', phase: 'Melaka Sentral', title: 'He kept one sleeve',
      game: 'lineup', variant: 'single',
      brief: 'Melaka Sentral at two in the morning on Christmas Day had one ticket window open and one clerk in it, a young man from Alor Gajah who was bored enough to watch everybody. He remembers a man with a dry bag at bay 9, where no bus leaves after midnight. Show him the faces, fast.',
      params: { rounds: 3, studySeconds: [9, 7, 5] },
      evidence: {
        img: 'ev_c9_sleeve', hotspot: { x: 0.55, y: 0.62, r: 0.15 },
        title: 'He kept one sleeve',
        short: 'The night clerk picks Shamsul Bakri three times out of three: bay 9, ten past two on Christmas morning, a dry bag handed to a man in a cap who walked away to the car park. Before he handed it over, Shamsul took one clear plastic sleeve out of the bag and put it inside his jacket.',
        text: 'Three times out of three, the same face, and the clerk does not need the third time. A man of about thirty in a cruise company polo shirt under a windbreaker, at bay 9 from 2:04, where nothing leaves after midnight, with a yellow dry bag on his shoulder of the kind the river boats carry. At 2:10 a man in a cap came across from the car park side, did not speak, held out his hand. Before he gave the bag up, the man in the polo shirt crouched, opened it, took out one thing, a clear plastic sleeve with a paper in it, and zipped it inside his windbreaker. Then he handed the bag over. "He was scared of the other one," the clerk says. "But not so scared he did not keep something." The man in the cap walked back toward the car park with the bag, without hurrying. The clerk did not see his face, and did not want to.',
      },
    },
    {
      id: 'c9_rs', phase: 'Melaka Sentral', title: 'The courier',
      game: 'chase', variant: 'one-way',
      when: (f) => !!f.ROSLAN_FREE,
      brief: 'On Saturday night, at ten past two, Daniel comes in from the hotel steps, where he has been sitting with a teh because he cannot sleep, and says, quietly, that there is a black Land Cruiser idling at the end of Jalan Kampung Pantai with a new bull bar and its lights off. When you walk toward it, it goes. Melaka\'s old town is a knot of one-way lanes. He obeys the arrows. You do not have to.',
      params: { rounds: 3 },
      evidence: {
        img: 'ev_c9_tollbooth', hotspot: { x: 0.55, y: 0.45, r: 0.18 },
        title: 'The courier',
        short: 'The Land Cruiser is F-03, with a new bull bar. You lose it at the Ayer Keroh toll at half past two. But the toll\'s night clerk has kept a photograph from Christmas morning, 2:41 AM: the same car, Roslan Daud at the wheel, a yellow dry bag on the passenger seat.',
        text: 'Through Jonker Street with its stalls shuttered, down Jalan Hang Jebat against the arrows, round the red Stadthuys square where the trishaws sleep under their plastic flowers, and out onto the highway north, and there you lose it, because a Land Cruiser on an empty highway is faster than anything you have. At the Ayer Keroh toll the night clerk, a woman in a pink tudung who has had a very long Christmas, knows the car before you have described it. "Bull bar. Black. Two nights I have seen it." The toll\'s plate camera keeps a still for every car it cannot read, and on Christmas morning at 2:41 AM it could not read this one, because its front plate was off. In the still, through the windscreen: a broad man with a grey crew cut and a heavy moustache in a sun-faded cap, and on the passenger seat beside him a yellow dry bag of the kind the river boats carry. Roslan Daud, three lengths behind the black car since 2003, driving north with Box 14 on the seat beside him.',
      },
    },

    // ---------------- Kampung Morten ----------------
    {
      id: 'c9_16', phase: 'Kampung Morten', title: 'Four thumbnails',
      game: 'nonogram', variant: 'classic',
      brief: 'Melaka Tengah holds Shamsul Bakri for one night on the clerk\'s word and takes his phone. He has deleted everything. Ken, on a video call from his shop in Low Yat in a Santa hat, pulls the phone\'s thumbnail cache apart over the internet and finds one tiny picture so corrupted that only the counts of dark squares in each row and column survive. Rebuild it.',
      params: {
        picture: [
          '.....#####.....',
          '.....#.#.#.....',
          '....#######....',
          '...##.....##...',
          '..#.........#..',
          '.#........##.#.',
          '.#......##...#.',
          '.#.....###...##',
          '.#...........#.',
          '.#...........#.',
          '..#.........#..',
          '...##.....##...',
          '....#######....',
          '.....#.#.#.....',
          '.....#####.....',
        ],
        solvedText: 'The thumbnail resolves: an old wristwatch on a yellow dry bag, both its hands at ten past two.',
      },
      evidence: {
        img: 'ev_c9_watch', hotspot: { x: 0.48, y: 0.42, r: 0.15 },
        title: 'What he photographed',
        short: 'Ken rebuilds four of Shamsul\'s photographs of Box 14: an old Seiko stopped at 2:10, river mud in its crown, TEOH A.C. 1979 on the back; the registration card of a lorry, BCK 210; a 1986 photograph of the Jugra gate with a sun freshly painted on it, a girl of about fifteen with a brush, and across the red earth the long shadow of whoever held the camera, a slim man in a cap; and a cancelled note with two thumbprints.',
        text: 'One thumbnail rebuilt by hand, and once Ken knows what it is he finds three more behind it in the cache. One: a 1970s Seiko on its back on the yellow dry bag, its hands both at ten past two, grey mud dried in the crown, and on the caseback, engraved, TEOH A.C. 1979. Two: the registration card of a Bedford lorry, BCK 210, owner Teoh Ah Chuan of Jugra, with a stamp across it, transferred 3 December 1986 to Sinar Pengangkutan. Three: an old colour print, faded to orange, of a gate in a fence in the oil palm, a sun freshly painted on it in pink with the paint still wet, and in front of it a girl of about fifteen in a school pinafore holding a brush and not smiling; and across the red laterite in the foreground, reaching almost to her feet, the long afternoon shadow of whoever was holding the camera: a slim man in a cap, the camera held at his chest. Four: a promissory note on old ruled paper, stamped CANCELLED, with two thumbprints in brown ink at the bottom, one on each side. Shamsul photographed all of it before he gave the bag up. Like every frightened man Sinar has ever paid, he kept something.',
      },
    },
    {
      id: 'c9_17', phase: 'Kampung Morten', title: 'A paper with two thumbs',
      game: 'dialtone', variant: 'classic',
      brief: 'Nurul Ain rings you on Sunday morning. The newspaper let her go in October, but her old extension still forwards its voicemail to her phone, because nobody there knows how to stop it. At 3:20 AM on Christmas morning a man left a message on it. He spoke for twenty seconds, and then, instead of saying his number, he keyed it. Listen to the tones and type the number.',
      params: {
        digits: 10, number: '0136271486', noise: 0.25,
        clue: 'Malaysian mobiles start 01. Ain: "He did not want to say it out loud. Frightened people think tones are safer than words."',
      },
      evidence: {
        img: 'ev_c9_voicemail', hotspot: { x: 0.48, y: 0.60, r: 0.13 },
        title: 'A paper with two thumbs',
        short: 'Ain\'s voicemail, 3:20 AM on Christmas morning: a young man, out of breath, offering "a paper with two thumbprints, from box fourteen" for RM 50,000, then keying his callback number: 013-627 1486, Shamsul Bakri\'s prepaid. An hour after the dry bag left Melaka Sentral, he still had the note, and he was selling it.',
        text: 'Twenty seconds of a man breathing hard, as if he has been climbing, in quick Melaka Malay: "Cik Ain. You write about Sinar. I have a paper with two thumbprints, from box fourteen. Old. Somebody will pay. Fifty thousand. Call this." Then ten tones, fast. Farah reads them down the phone to Asri at Bukit Aman, and he has the subscriber back in twenty minutes on a Sunday: a prepaid registered in October to Shamsul Bakri of Kampung Morten. 013-627 1486. At 3:20 AM, an hour and ten minutes after the dry bag went into the car park at Melaka Sentral with the man in the cap, Shamsul still had the note, and he was trying to sell it to the one journalist in Malaysia who would want it most. He had not thrown it in the river. He had not given it up. He kept it, and he did not throw it away. Ain does not say whether she would have paid. "I do not have fifty thousand," she says. "I would have found it."',
      },
    },
    {
      id: 'c9_18', phase: 'Kampung Morten', title: 'Wax, not ash',
      game: 'footprint', variant: 'classic',
      brief: 'Melaka Tengah took Shamsul\'s sandals with his phone. Somewhere between 2:10 and 3:20 on Christmas morning he climbed somewhere, and the soles remember where. Rosli is not here, so Farah lays her torch flat on the interview-room table the way he does. Name the tread, then find what is in it.',
      params: { shoes: 10 },
      evidence: {
        img: 'ev_c9_sandals', hotspot: { x: 0.52, y: 0.58, r: 0.17 },
        title: 'Wax, not ash',
        short: 'In the tread of Shamsul\'s sandals: red laterite, and drips of white candle wax pressed in on top of it. Bukit China\'s paths are red too, but its graves take joss sticks and leave grey ash. On Christmas Eve, after midnight mass, the carollers climb St. Paul\'s Hill with candles.',
        text: 'Cheap rubber sandals with a cross-hatched tread worn almost smooth at the heel, and in every groove the same red earth, the laterite that Melaka\'s two old hills are made of. Bukit China and St. Paul\'s, a kilometre apart, the same colour underfoot. But pressed into the red, on top of it, so that it was stepped on after the climbing started, white wax: a dozen drips, hard, with the little crater a falling drop makes. Bukit China is twelve thousand Chinese graves, and the people who climb it at night bring joss sticks, which leave grey ash and red paper, not wax. On Christmas Eve, Farah\'s friend at Melaka Tengah says, after the midnight mass, the carollers of the old town climb St. Paul\'s Hill to the ruined church with candles in paper cups and sing on the top, and leave the candles burning on the old Dutch gravestones until they gutter. At three in the morning, they would still be burning.',
      },
    },

    // ---------------- IPD Melaka Tengah ----------------
    {
      id: 'c9_ar', phase: 'IPD Melaka Tengah', title: 'No river patrol',
      game: 'iqmatrix', variant: 'columns',
      when: (f) => !!f.ARCHIVE_SEIZED,
      brief: 'The cartons from Jugra are still at Bukit Aman, and one of them, carton M, is every Malacca file. Farah asked for it on Christmas Eve, and Asri signed it out and drove it down to Melaka himself on Christmas night; he knows the archive store better than its clerks by now, she says, he has been in and out of it for her all month. Its index is coded by pattern, the way the archive\'s keeper liked it. Read the patterns, and the folder comes out.',
      params: { count: 7, startLevel: 2 },
      evidence: {
        img: 'ev_c9_carton', hotspot: { x: 0.78, y: 0.55, r: 0.16 },
        title: 'No river patrol',
        short: 'Carton M of the Jugra archive: a folder for a sergeant of Melaka Tengah\'s marine unit, on a monthly figure from Sinar since 2020. The marine log for Christmas Eve: the river patrol boat "in for repairs" from 6 PM. There was nobody on the water.',
        text: 'One folder among a hundred in carton M, with a typed label and a monthly figure: a sergeant of Melaka Tengah\'s marine police unit, RM 1,500 a month since March 2020, "river". Farah asks the duty inspector for the marine log for the twenty-fourth and he brings it himself, reading it on the way. The river patrol boat, which runs the Melaka river from the estuary to Kampung Morten every night of the year, went into the boatyard at six on Christmas Eve "for repairs" on the sergeant\'s signature, and came out on the twenty-sixth with nothing repaired. From six until dawn, with the whole town on its rooftops, there was nobody on the water but the cruise boats. The duty inspector closes the log. "Sergeants are cheap," he says, to nobody. Farah thanks Asri on the phone for bringing the carton down. He says it was nothing, and asks after her ribs.',
      },
    },
    {
      id: 'c9_19', phase: 'IPD Melaka Tengah', title: 'Two of the five',
      game: 'whoslying', variant: 'classic',
      brief: 'On Christmas Day, before anybody had a reason to lie carefully, Melaka Tengah took statements from five people about midnight. Farah reads them now, on Sunday, with the exhibits beside her. Two of the five are lying.',
      params: {
        solvedLine: 'Farah reads the five statements twice. "Two liars, and both of them were near the water."',
        people: [
          { id: 'vanessa', name: 'Vanessa Low', says: [
            { t: '"The iron room\'s alarm was on all night. Whoever got in, beat it."', fact: false, note: 'The panel\'s memory: zone 14 bypassed at 23:50:12 by user 07, her own code.' },
            { t: '"Kumar is lying."', about: 'kumar', is: false },
          ] },
          { id: 'shamsul', name: 'Shamsul Bakri', says: [
            { t: '"Madam Vanessa is telling the truth."', about: 'vanessa', is: true },
            { t: '"The locksmith is lying."', about: 'jock', is: false },
          ] },
          { id: 'ram', name: 'Ram Chettiar', says: [
            { t: '"I was at Mahkota with my mother from half past eleven."', fact: true, note: 'Mahkota\'s A&E camera has him at the counter at 23:34 with her handbag over his shoulder, and in the waiting room until 1:15.' },
            { t: '"Madam Vanessa is lying."', about: 'vanessa', is: false },
          ] },
          { id: 'jock', name: 'Jock Sequeira', says: [
            { t: '"Mr. Ram is telling the truth."', about: 'ram', is: true },
            { t: '"The boat boy is lying."', about: 'shamsul', is: false },
          ] },
          { id: 'kumar', name: 'Kumar, night porter', says: [
            { t: '"Madam Vanessa is lying."', about: 'vanessa', is: false },
            { t: '"At least two of the others are lying."', atLeast: 2 },
          ] },
        ],
        liars: ['vanessa', 'shamsul'],
      },
      evidence: {
        img: 'ev_c9_statements', hotspot: { x: 0.50, y: 0.65, r: 0.20 },
        title: 'Five on Christmas Day',
        short: 'On Christmas Day Vanessa Low swore the alarm was on all night, and Shamsul Bakri swore she was telling the truth. Both lied. Ram was at Mahkota from 23:34; Jock was at mass; and Kumar the night porter, who was in the courtyard with a sparkler, says he saw Madam Vanessa at the panel cupboard at ten to midnight.',
        text: 'Five statements on Melaka Tengah\'s thin grey forms, taken on Christmas Day by a constable who wanted to go home. Vanessa Low: the alarm was on all night; Kumar is lying. Shamsul Bakri, who was asked only about the boats and volunteered the rest: Madam Vanessa is telling the truth, and the locksmith is lying. Why a river pilot should vouch for a hotel manager he says he has never spoken to, nobody asked him. Ram Chettiar: Mahkota with his mother from half past eleven, true by the hospital\'s own camera. Jock: Mr. Ram is telling the truth, and the boat boy is lying. And Kumar, the night porter, nineteen years at the house under three owners, who had a sparkler in his hand at midnight because a guest\'s child gave it to him: Madam Vanessa is lying; he saw her at the panel cupboard behind reception at ten to twelve, and she told him the fireworks would set the sensors off, and to go out and watch them.',
      },
    },
    {
      id: 'c9_20', phase: 'IPD Melaka Tengah', title: 'Midnight on one page',
      game: 'logicgrid', variant: 'classic',
      brief: 'IPD Melaka Tengah on Sunday evening: the Christmas decorations still up in the charge room, a plate of kuih bangkit from the station clerk, and Farah\'s leg up on a second chair. Before Hamidah rings, Farah wants midnight on one page. Five people, five places, five things in their hands.',
      params: {
        categories: [
          { name: 'Person', items: ['Vanessa', 'Shamsul', 'Ram', 'Jock', 'Kumar'] },
          { name: 'Location', items: ['Lobby, by the alarm panel', 'The river steps', 'Mahkota Medical Centre', 'The Portuguese Settlement', 'The courtyard countdown'] },
          { name: 'Holding', items: ['User card 07', 'A drill', 'His mother\'s handbag', 'A rosary', 'A sparkler'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]],
        clues: [
          'Vanessa never let go of her own user card.',
          'User card 07 was used at the alarm panel, and nowhere else.',
          'The handbag spent midnight in a hospital.',
          'The rosary went to mass in the Settlement.',
          'The drill came up the river steps.',
          'Ram was not in the hotel that night, not even on its steps.',
          'Jock was nowhere near the river steps or a hospital, and he held nothing that burns.',
          'Shamsul was never where a guest could see him: not in the courtyard, not in the lobby.',
        ],
      },
      evidence: {
        img: 'ev_c9_grid', hotspot: { x: 0.33, y: 0.48, r: 0.17 },
        title: 'Everyone at midnight',
        short: 'At midnight on Christmas Eve: Vanessa Low at the alarm panel with user card 07. Shamsul Bakri on the hotel\'s river steps with the drill. Ram at Mahkota with his mother\'s handbag. Jock at mass in the Settlement with a rosary. Kumar in the courtyard with a sparkler.',
        text: 'From 23:50 to 00:20 on Christmas Eve, while Melaka looked at the sky. Vanessa Low at the panel cupboard behind reception with her user card, then back in the courtyard by the countdown with her clipboard, smiling. Shamsul Bakri on the bottom step of the river stairs with the boat\'s line round his wrist and the drill bag at his feet, holding the boat in for two men from Kuala Lumpur with no names. Ram Chettiar in the A&E waiting room at Mahkota, three kilometres away, with his mother\'s handbag on his knees. Jock Sequeira in the second row of the Settlement chapel with his wife\'s rosary, because she was singing. And Kumar in the courtyard, nineteen years at the house, with a child\'s sparkler fizzing in his hand, counting down to Christmas with a hundred and forty strangers, and looking at the panel cupboard.',
      },
    },
    {
      id: 'c9_21', phase: 'IPD Melaka Tengah', title: 'Hamidah\'s fax',
      game: 'theory', variant: 'classic',
      brief: 'Hamidah Yusof rings the duty office at nine on Sunday night from her kitchen in Kuala Lumpur, and the station\'s fax machine, which nobody has used since the Covid years, starts warming up on its own. "Fifth time, detective. The story, not the evidence. One page. And tell me what they kept."',
      params: {
        prompt: 'Write Christmas Eve in Melaka for the prosecutor: who got the thieves into the iron room and how, who brought them and opened Box 14, why only Box 14, and what was kept back.',
        context: 'On Christmas Eve 2026 Box 14 in the iron room of the old Chettiar firm house in Melaka (now The Kittangi, a Sinar Heritage hotel) was drilled and emptied, while the gold in the other 41 boxes was left. Vanessa Low, the hotel\'s general manager, on printed orders from the Office of the Chairman ("Box 14 only. Leave the gold."), had a copy of the iron-room key cut by the locksmith Jock Sequeira in October for a fake insurer, switched off the iron room\'s alarm zone with her own user code 07 at 23:50, and unlocked the river gate. Shamsul Bakri, night pilot of the river cruise, brought two hired men by cruise boat 7 to the hotel\'s river steps at 23:56; under the midnight fireworks they opened the iron door with the copy key and drilled Box 14. The court was to open Box 14 on 28 December on the prosecutor\'s application; the keeper, Ram Chettiar, had told Vanessa the date. At 2:10 AM Shamsul handed a dry bag to a courier at Melaka Sentral, but first took out the cancelled promissory note with two thumbprints, kept it, and at 3:20 AM tried to sell it to a journalist for RM 50,000. Vanessa paid Shamsul RM 30,000 at 1:30 AM.',
        points: [
          { id: 'inside', label: 'The inside woman', criterion: 'Vanessa Low (the general manager / the hotel GM) let them in: she switched off (bypassed) the iron room\'s alarm, or opened the river gate, or had the key copied.', keywords: [['vanessa', 'low', 'general manager', 'manager', 'gm'], ['alarm', 'bypass', 'switch', 'code', '07', 'gate', 'key', 'copy', 'copied', 'panel']], hint: 'Whose code is 07, and who took the key to the Settlement in October?' },
          { id: 'crew', label: 'The crew', criterion: 'Shamsul Bakri (the river pilot) brought the thieves by boat (cruise boat 7, by the river) and they drilled / opened Box 14.', keywords: [['shamsul', 'bakri', 'pilot', 'boatman', 'boat'], ['boat', 'river', 'drill', 'brought', 'steps', 'seven', '7']], hint: 'What moved at the jetty between 11:30 and six?' },
          { id: 'why', label: 'Why only Box 14', criterion: 'To empty Box 14 before the court opened it on the 28th, on the Office of the Chairman\'s orders (and to leave the gold).', keywords: [['court', 'hearing', '28', 'twenty-eighth', 'monday', 'prosecutor', 'order', 'chairman', 'office', 'leave the gold', 'before']], hint: 'What did the shredded page say, and what was going to happen on Monday?' },
          { id: 'kept', label: 'What was kept back', criterion: 'Shamsul kept the promissory note (the paper with two thumbprints) back from the courier and tried to sell it.', keywords: [['note', 'paper', 'thumb', 'promissory', 'sleeve'], ['kept', 'keep', 'sell', 'sold', 'held', 'back', 'hid']], hint: 'What did the clerk at Melaka Sentral see him put inside his jacket?' },
        ],
        need: 3,
        clue: 'Hamidah, down the line: "Three I can prove. Four, and I will drive down myself and buy you all breakfast."',
      },
      evidence: {
        img: 'ev_c9_report', hotspot: { x: 0.38, y: 0.50, r: 0.15 },
        title: 'For the prosecutor',
        short: 'Hamidah reads your page twice over the phone and writes the burglary charge herself, on the fax. Then she asks the question you have been asking since Christmas morning. "A man who leaves two kilos of gold in the next box is not a thief. He wanted his own things back before my court saw them. One of them did not reach him. Where is it?"',
        text: 'The fax goes through at a quarter to ten, one page, in your hand, and comes back at ten past in hers: a charge of burglary under Section 457, with a blank for the names. "Fifth time," she says down the line. "You are getting better at stories." Then she is quiet, and you can hear her kettle. "A man who leaves two kilos of gold in the next box is not a thief, detective. He is the owner, taking his own things back before a court can look at them, and paying a hotel manager and a boatman to do it in the dark so that nobody can say he came himself. He has his watch, his card, his photograph. He does not have the paper with his thumb on it. A frightened boatman has it, or had it at three o\'clock on Christmas morning. If Melaka Tengah finds it before Sinar does, I will have a thumb. If Sinar finds it first, I will have a boatman, and he will be very sorry, and very quiet." She tells you to sleep. You do not.',
      },
    },
    {
      id: 'c9_22', phase: 'IPD Melaka Tengah', title: 'The general manager',
      game: 'interrogation', variant: 'classic',
      brief: 'Vanessa Low comes to IPD Melaka Tengah at eleven on Sunday night of her own accord, in the grey suit, with a Sinar lawyer whom she leaves on the bench in the corridor. She sits very straight in interview room 2 with her hands folded on a leather folder she does not open, and she apologises to the constable for the hour. One thing she tells you is not true. Find it, and put the exhibit that breaks it on the table.',
      params: {
        setting: 'Interview room 2, IPD Melaka Tengah. Sunday 27 December, 11:20 PM.',
        suspect: {
          id: 'vanessa', voice: 'voice_4', name: 'Vanessa Low Pei Shan', role: 'General manager, The Kittangi, Sinar Heritage Hotels, 38',
          persona: 'Immaculate, very correct Kuala Lumpur Cantonese hotel general manager of thirty-eight: polished hospitality English ("of course", "I completely understand", "let me look into that for you"), handles the interview like a guest complaint she intends to resolve. Calls the detective by name, Farah "Inspector". Says "aiyah" only when angry, and then apologises for it. Ambitious, and frightened of the Office of the Chairman in a way she will not name; proud, oddly, that she left the gold. Breaks, if she breaks, over the visitor book in the boot of her car.',
        },
        facts: [
          { id: 'f1', topic: 'her career', claim: 'I have run The Kittangi since it opened in 2024. Before that, eleven years with Sinar Heritage in Penang and Kuala Lumpur.' },
          { id: 'f2', topic: 'the iron room', claim: 'The iron room was never ours. Mr. Chettiar\'s grandfather saw to that. We built a hotel around a locked door.' },
          { id: 'f3', topic: 'Christmas Eve', claim: 'A hundred and forty guests in the courtyard for the countdown. I was on my feet from six in the evening until two.' },
          { id: 'f4', topic: 'the fireworks', claim: 'The Settlement\'s fireworks shake the whole house. The vibration sensors go off every Christmas and every New Year.' },
          { id: 'f5', topic: 'Singapore', claim: 'Sinar Heritage Singapore is looking for a general manager in the new year. Every GM in the group has applied. So have I.' },
          { id: 'f6', topic: 'Kumar', claim: 'Kumar has been on that door for nineteen years. He is the best night porter in Melaka, and he does not like me.' },
          { id: 'f7', topic: 'Mr. Chettiar', claim: 'Mr. Chettiar is selling the iron room to us. He told me himself when the court would open his box. I did not ask.' },
        ],
        lies: [
          { id: 'l1', topic: 'the alarm', claim: 'The iron room\'s alarm was never touched. If somebody got in, they got past a live alarm.', truth: 'At 23:50:12 she bypassed the iron room\'s zone with her own user code, 07, and restored it at 00:31:40.', exposedBy: 'e1' },
          { id: 'l2', topic: 'the key', claim: 'I have never had a key to that room. Only Mr. Chettiar has a key.', truth: 'In October she borrowed Ram\'s key "for the insurer" and had Jock Sequeira cut a copy, and kept it.', exposedBy: 'e2' },
          { id: 'l3', topic: 'Box 14', claim: 'Nobody from Sinar ever told me anything about Box 14. I did not even know which box was which.', truth: 'A printed order from the Office of the Chairman told her: Box 14 only, leave the gold, the river at midnight.', exposedBy: 'e3' },
          { id: 'l4', topic: 'the van', claim: 'The hotel van never left the basement on Christmas Eve. There were guests\' cars in every bay.', truth: 'She drove it out at 1:30 AM to Kampung Morten with RM 30,000 for Shamsul and brought the drill back at 2:20.', exposedBy: 'e4' },
        ],
        evidence: [
          { id: 'e1', title: 'USER-07', text: 'The alarm line at 23:50:12: ZONE 14, BYPASS, USER-07. Code 07 is the general manager\'s.' },
          { id: 'e2', title: 'A spare for the insurer', text: 'Jock Sequeira\'s receipt, 14 October: "Kittangi, spare, iron room, insurance. V. Low. RM 80."' },
          { id: 'e3', title: 'Box 14 only', text: 'The page from her shredder: "To: V.L. Box 14 only. Leave the gold. The river at midnight. Melaka Sentral at ten past two."' },
          { id: 'e4', title: 'Iron filings', text: 'In the hotel van: a drill with iron filings in its bit, an envelope marked "S." and a RM 30,000 band. Out 1:30 AM, back 2:20.' },
          { id: 'e5', title: 'An insurer that does not exist', text: 'In her desk: a letter from an insurer with no address, and a Christmas card from the Office of the Chairman that says only "Thank you".' },
          { id: 'e6', title: 'He kept one sleeve', text: 'The Melaka Sentral clerk: at 2:10 AM Shamsul Bakri handed a dry bag to a man in a cap, after taking one plastic sleeve out of it.' },
        ],
        secret: 'On the Office of the Chairman\'s printed orders (the first in October with the false insurer\'s letter, the second in her Christmas hamper on the twenty-third), she had Ram\'s key copied, bypassed the iron room with her own code at 23:50, unlocked the river gate, and at 1:30 drove the van to Kampung Morten to pay Shamsul RM 30,000 and take the drill; she did it for the general managership of Sinar Heritage Singapore; she has never met anyone above a signature; the Office also told her to burn the iron room\'s visitor book, and she did not, because she could not burn a book that old, and it is in the boot of her car.',
        suggested: [
          'Was the iron room\'s alarm on all night?',
          'Have you ever had a key to the iron room?',
          'What did Sinar tell you about Box 14?',
          'Where did the hotel van go on Christmas morning?',
          'Who gives you your orders?',
          'Why leave the gold?',
          'What is in your car?',
        ],
        maxQuestions: 14,
        clue: 'Farah, low, with her stick between her knees: "She keeps looking at the clock. Not because she is late. Because she has been told what time it all stops."',
      },
      evidence: {
        img: 'ev_c9_visitorbook', hotspot: { x: 0.42, y: 0.58, r: 0.20 },
        title: 'Leave the gold',
        short: 'Caught, Vanessa Low does not ask for the lawyer in the corridor. The orders came printed, the last one in her Christmas hamper; she has never met anyone above a signature. The Office asked one more thing: burn the iron room\'s visitor book. She did not. It is in her car: "M.P." on every 1 December from 1987 to 2025, four minutes each time, and for 2026 no signature, only a small sun drawn in ink.',
        text: 'She unfolds her hands and lays them flat on the leather folder, and for the first time she does not sound like a hotel. "Of course I did it. Singapore. Do you know what it is to be a GM in Melaka for a group that owns a port?" The orders came printed. The first in October, folded inside an insurer\'s letter, with the line about the key. The second on the twenty-third, in the Christmas hamper every manager in the group receives, under the dodol and the wine: Box 14 only. Leave the gold. She has never met anybody above a secretary\'s signature, and she does not want to. "There was one more thing. They asked me to burn the visitor book from the iron room. I took it off Mr. Chettiar\'s shelf on the twenty-third, while he was at the temple. And then I could not. It is from 1938. I run a heritage hotel." It is in the boot of her car under the spare tyre, and Farah sends a constable for it. A long cloth-bound book with a brass clasp. Every first of December from 1987 to 2025, one line: Box 14, in at a time before dawn, out four minutes later, and a signature: M.P. On the line for Tuesday 1 December 2026: the same four minutes. No signature. Only a small sun, drawn in ink.',
      },
    },
  ],

  outcomes: {
    charged: {
      vanessa: { en: 'Vanessa Low is arrested in the courtyard of The Kittangi under the Christmas tree. She asks whether the hotel will be told before the guests wake.' },
      shamsul: { en: 'Shamsul Bakri is arrested on the cruise jetty in his pilot\'s shirt, and asks the constable to tell his mother he was not in a fight.' },
      ram: { en: 'Ram Chettiar is charged. The iron room is sealed, and Sinar Heritage\'s lawyers write to the court the same afternoon to buy it.' },
      jock: { en: 'Jock Sequeira is charged. The Settlement holds a collection for his lawyer that evening, and raises it in an hour.' },
    },
    correct: ['vanessa', 'shamsul'],
  },

  // Hidden consequences, for later cases. VANESSA_FREE / SHAMSUL_FREE: not charged (Case 10: if free, at
  // work). RAM_WRONGED / JOCK_WRONGED: charged with a burglary they did not commit (Case 10: remanded).
  // NOTE_FOUND / NOTE_LOST: whether Melaka Tengah searched the empty grave on St. Paul's Hill, so that the
  // borrower's left thumb (nine clear points) is in evidence (Case 10's c10_nf reads NOTE_FOUND).
  flagNames: ['VANESSA_FREE', 'SHAMSUL_FREE', 'RAM_WRONGED', 'JOCK_WRONGED', 'NOTE_FOUND', 'NOTE_LOST'],
  flags: ({ charged, answers }) => ({
    VANESSA_FREE: !charged.includes('vanessa'),
    SHAMSUL_FREE: !charged.includes('shamsul'),
    RAM_WRONGED: charged.includes('ram'),
    JOCK_WRONGED: charged.includes('jock'),
    NOTE_FOUND: answers.note === 'xavier',
    NOTE_LOST: answers.note !== 'xavier',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  // Earlier cases' flags are read through `when` (the voice manifest walks every line).
  ending(v) {
    const right = CASE09.outcomes.correct.every((id) => v.has(id));
    const wronged = v.has('ram') || v.has('jock');
    const found = v.answers.note === 'xavier';

    const charged = v.charged.map((id) => ({ who: null, en: CASE09.outcomes.charged[id].en }));
    if (!charged.length) charged.push({ who: null, en: 'Nobody is charged. Melaka Tengah writes "person or persons unknown" across the file, and the hotel puts its Christmas tree away.' });

    const room = [];
    if (!v.has('ram')) room.push({ who: null, en: 'Ram Chettiar closes the 1938 iron door on forty-one boxes and one empty one, and turns his grandfather\'s key twice.' });
    else room.push({ who: null, en: 'A constable closes the iron door, because the keeper is in a cell at Melaka Tengah. Without a keeper the will cannot hold the room, and Sinar Heritage buys the iron room before the year is out.' });
    let verdictLine;
    if (right && !wronged) verdictLine = { who: 'Ram Chettiar', en: 'My grandfather lent that man eighteen thousand ringgit and wrote that he was not a good man. You caught the ones who opened his box. I am the one who told them when. Write that down also.' };
    else if (!v.has('vanessa')) verdictLine = { who: 'Inspector Farah Iskandar', en: 'The woman who switched the iron room off is laying out breakfast for a hundred and forty guests this morning, and she has asked whether we would like a table.' };
    else if (!v.has('shamsul')) verdictLine = { who: 'Inspector Farah Iskandar', en: 'Boat seven takes the river cruise out tonight with the same pilot at the wheel. He waved at me from the jetty.' };
    else verdictLine = { who: 'Inspector Farah Iskandar', en: 'You got the woman at the panel and the boy on the river. You also charged a man who was never in the room. Sinar will not mind at all.' };
    room.push(verdictLine);
    if (v.has('jock')) room.push({ who: null, en: 'On New Year\'s Eve the Settlement dances without its locksmith. The band plays the branyo twice, once for him.' });
    room.push({ who: null, en: 'A letter for Ram comes from Menara Sinar on Monday afternoon, signed M. Ong for the Office of the Chairman: Sinar Heritage still wishes to buy the iron room, as it stands.', when: (f) => SECRETARY(f) === 'melissa' });
    room.push({ who: null, en: 'A card in copperplate from Singapore comes to the iron room for Ram: the Office of the Chairman regrets the damage to Box 14, and will pay for a new lock.', when: (f) => SECRETARY(f) === 'vivian' });

    const panels = [
      { img: 'c9_out_01_arrest', mood: 'police', fx: ['rain'], place: 'IPD Melaka Tengah. Monday 28 December, 6:00 AM.', music: 'resolution', lines: charged },
      { img: 'c9_out_02_ironroom', mood: 'night', fx: ['dust'], place: 'The iron room, The Kittangi. Monday, 9:00 AM.', lines: room },
    ];

    if (found) {
      panels.push({
        img: 'c9_out_03_grave', mood: 'day', fx: ['dust'], place: 'St. Paul\'s Hill. Monday, 6:40 AM.', music: 'memory',
        lines: [
          { who: null, en: 'The ruined church on the top of St. Paul\'s Hill at first light: no roof, old Dutch gravestones standing against the walls, guttered candles in paper cups on every one, and in the floor of the nave an open grave behind an iron grille, where a saint lay for nine months and left.' },
          { who: null, en: 'Under the rim of the grille, taped to the iron, a plastic sleeve with candle wax on it. Inside, a promissory note for eighteen thousand ringgit, stamped CANCELLED, and two thumbprints in old brown ink.' },
          { who: null, en: 'JPN matches the right thumb within the hour: Muthusamy a/l Perumal, the guarantor. The left thumb has nine clear points. The national search needs twelve.' },
          { who: 'Hamidah Yusof', en: 'Nine points is a man. It is not yet a name.' },
        ],
      });
    } else {
      const wrongLine = {
        sentral: 'Melaka Tengah turns Melaka Sentral inside out: bay 9, the lost and found, every bin. The dry bag went north on Christmas morning. The note never went with it.',
        bukitcina: 'Melaka Tengah walks Bukit China all Monday with two dogs and a clerk from the Chinese associations, and opens no urn without permission. Joss ash on every grave. No paper.',
        river: 'Marine police divers go down off the Kampung Morten jetty into water you cannot see your hand in, and come up with a bicycle, a shopping trolley and last year\'s Christmas tree.',
      }[v.answers.note] || 'Nobody tells Melaka Tengah where to look.';
      panels.push({
        img: 'c9_out_03_empty', mood: 'day', fx: ['dust'], place: 'Melaka. Monday and Tuesday.', music: 'memory',
        lines: [
          { who: null, en: wrongLine },
          { who: null, en: 'On Tuesday the grille over the empty grave on St. Paul\'s Hill is found with a strip of tape on it, and nothing under the tape.' },
        ],
      });
    }

    panels.push({
      img: 'c9_out_04_photos', mood: 'police', fx: [], place: 'IPD Melaka Tengah. Monday, 11:00 AM.',
      lines: [
        { who: null, en: 'Ken has printed Shamsul\'s four photographs of Box 14 on paper from the pharmacy across the road: a watch, a lorry\'s registration card, an old photograph of a gate, and a note with two thumbs.' },
        { who: null, en: 'The watch is a 1970s Seiko, stopped at ten past two, river mud dried in its crown. On the back: TEOH A.C. 1979.' },
        { who: 'Inspector Farah Iskandar', en: 'Teoh Ah Chuan, of Jugra. Died on the first of December, 1986. Drowned. The file says kemalangan. Accident.' },
        { who: null, en: 'Daniel looks at the third photograph for a long time: the gate, the sun still wet on it, the girl with the brush, and across the red earth the long shadow of whoever held the camera. A slim man in a cap.' },
        { who: 'Daniel Raj', en: 'Forty years he kept this in a box, machan. Not the girl. The shadow.' },
        { who: null, en: 'The dry bag went north from Ayer Keroh with Roslan Daud at 2:41 on Christmas morning, and nobody has seen it since.', when: (f) => f.ROSLAN_FREE },
        { who: null, en: 'A Sinar parcel left Port Klang for Singapore on Boxing Day. Officer: N. SALLEH.', when: (f) => f.NORHAYATI_FREE },
        { who: 'Nurul Ain', en: 'They let me go on the ninth, on a discharge that is not an acquittal. I kept the newsroom\'s voicemail anyway. Somebody still thinks I buy papers.', when: (f) => f.AIN_WRONGED },
        { who: 'Nurul Ain', en: 'The paper let me go in October, and I kept its voicemail. Fifty thousand for a paper with two thumbs. I would have found it somehow.', when: (f) => !f.AIN_WRONGED },
      ],
    });

    panels.push({
      img: 'c9_out_05_newyear', mood: 'night', fx: [], place: 'Brickfields. New Year\'s Day, 2:10 AM.', music: 'chairman',
      lines: [
        { who: null, en: 'The last fireworks of the year go up late and ragged over the towers on Jalan Ampang. Bala Anne\'s shutter is down, and he does not come down.' },
        { who: null, en: 'A courier on a motorbike at the shutter, engine running, an envelope held out. He says only, "Tuan says terima kasih," and is gone before you have it open.' },
        { who: null, en: 'Inside, the original of the photograph from Box 14: the gate, the sun, the girl with the brush, the long shadow on the laterite.' },
        { who: null, en: 'On the back, in ink, in the left-handed hand that wrote "Terima kasih" on the rules card, two lines.' },
        { who: null, en: '"Selamat Tahun Baru, detektif. She is fifty-five now."' },
      ],
    });
    return panels;
  },
};
