// CASE 3: THE UNCLAIMED. Lebuh Chulia, George Town, Penang.
// Truth (writers only): ARSON. Lim Chee Keong ("Uncle Lim"), 71, cast Dr. Henry Goh's plaster models for
// thirty years and kept every one. In August 2021 Goh sent him impressions of the jaw of the body from
// Warehouse 6, Bay 3 (PK-0821) and the "dental record of Daniel Raj" to compare. They did not match, and
// Lim wrote so in his order book in Goh's tooth code. Goh certified a match anyway (that is "what I did in
// 2021"). Lim poured a duplicate of PK-0821 and gave it to a dental technology school in Butterworth.
// Melissa Ong, 41, project director of Sinar Heritage Hotels (a Sinar Holdings company), planned the fire:
// she had two copies cut of the back-door key Kenny lent "for the surveyors", had Rizal (if free) sign the
// night guard off, paid him RM 8,000 as "overtime", and sent Bomba and the press a fake survey of "old
// wiring" at 7:12 AM. Her orders came from "the Office of the Chairman": the 2021 box first, then the
// building. Shahrul Nizam, 29, Kawalan Sentosa night guard on the hotel site next door, took the GOH 2021
// carton at about 3:45 AM and left a doctored charger on a plug-in timer set for 4:00. Kenny had told
// Melissa his uncle slept at Jo's now; Lim had gone home that Wednesday. Nobody meant him to be upstairs.
// Kenny Lim (nephew, gambling debts, signed to sell his half to Sinar, lied about where he was: a gaming
// den in Air Itam) is innocent of the fire. Cheah Siew Lan (No. 94, joss paper and coffins, a seven-year
// party-wall feud) is innocent but was awake, saw the man with the carton, and said nothing for nine minutes.
// The body in Bay 3 is Ong Wei Jie, 26, ferry engineer from Butterworth, hired in cash by Sinar Cold Chain
// to service reefer units at Port Klang. It was buried at Cheras under Daniel Raj's name.
// Seeds only (never confirm here): Daniel is alive. The tall polite man who leaves a paper kancil in Madam
// Ong's tin every 20 August and orders two teh. The Chairman is never named.

const XRAY = [
  { id: 'daniel', label: 'Daniel Raj', note: 'Your partner. The name on Henry Goh\'s 2021 certificate, and on the grave in Cheras.' },
  { id: 'weijie', label: 'Ong Wei Jie', note: '26, a ferry engineer from Butterworth. Missing since August 2021.' },
  { id: 'worker', label: 'An undocumented worker', note: 'Someone sleeping rough in Bay 3 the night it burned. No name, no record, nobody looking.' },
  { id: 'forged', label: 'Nobody. The X-ray is a fake', note: 'Made in 2021 to stand in for a jaw that never existed.' },
];

export const CASE03 = {
  id: 'case03',
  number: 3,
  title: 'The Unclaimed',
  place: 'George Town, Penang',
  victim: 'Lim Chee Keong, 71, retired dental technician. Died in the fire at 96 Lebuh Chulia, 4:10 AM on Thursday.',
  question: 'Who burned No. 96 Lebuh Chulia?',
  brief: 'Uncle Lim made Dr. Henry Goh\'s casts for thirty years and kept every one in the back of his shophouse on Lebuh Chulia. On Thursday morning the shophouse burned with him upstairs. Bomba says old wiring. His granddaughter Jo says he unplugged everything every night. You have an X-ray in your pocket that says PK-0821.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end of this one: who burned No. 96, and whose jaw Uncle Lim cast in August 2021. Nobody will tell you if you get either of them right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Jo sent a photo of her grandfather\'s reading glasses on her drawing board, folded, the way he always left them.',
  deduction: {
    lede: 'George Town police will charge whoever you name, on your word and one phone call from Farah. Name everyone who planned the fire or set it, and only them.',
    button: 'Make the call',
    confirm: 'George Town police will charge {names}. Jo will hear it from you tonight.',
    confirmTitle: 'Name them?',
    confirmButton: 'Make the call',
    questions: [
      {
        id: 'xray', q: 'Whose teeth are on X-ray PK-0821?', short: 'PK-0821 is',
        lede: 'Henry Goh signed one name in 2021. Uncle Lim wrote something else, in a code only the two of them could read. Whatever you tell Farah goes into a coroner\'s file that was closed in August 2021. It will not be opened twice.',
        options: XRAY,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy
  // in cases.js). Until it is solved they are not on the map, the board or the office wall.
  suspects: [
    {
      id: 'kenny', name: 'Kenny Lim', role: 'Uncle Lim\'s nephew, 45', img: 'sus_kenny',
      revealedBy: 'c3_06',
      revealLine: "He has signed away his half of No. 96. The deal dies unless his uncle's half sells too.",
      look: { skin: '#f1d2b6', hair: 'side-part', hairColor: '#3b2a1f', coat: 'batik', eyewear: 'none', mark: 'none' },
      motive: 'Owes RM 60,000 to a moneylender in Jelutong. Signed to sell his half of No. 96 to Sinar Heritage; the deal needed his uncle\'s half too.',
      claim: 'Says he was asleep at home in Jelutong from midnight, and that his key to No. 96 has never left his hands.',
    },
    {
      id: 'cheah', name: 'Cheah Siew Lan', role: 'Joss paper and coffins, No. 94. 58', img: 'sus_cheah',
      revealedBy: 'c3_05',
      revealLine: "She burned paper three metres from Lim's back door at midnight. She lost two court cases to him.",
      look: { skin: '#f1d2b6', hair: 'short', hairColor: '#9a9a9a', coat: 'batik', eyewear: 'round', mark: 'none' },
      motive: 'Seven years of quarrelling with Lim over the party wall and his gutter. Two court cases, both lost.',
      claim: 'Says she burned joss paper at midnight, slept from half past twelve and smelled nothing until the sirens.',
    },
    {
      id: 'melissa', name: 'Melissa Ong', role: 'Project director, Sinar Heritage Hotels. 41', img: 'sus_melissa',
      revealedBy: 'c3_07',
      revealLine: "M. Ong signed for two copies of the back-door key. Melissa Ong has told the papers nobody at Sinar ever had one.",
      look: { skin: '#f1d2b6', hair: 'bun', hairColor: '#151210', coat: 'blazer', eyewear: 'none', mark: 'none' },
      motive: 'Her hotel needs the whole row. No. 96 was the only owner on it who would not sell.',
      claim: 'Says she was asleep in her Gurney Drive condo by eleven, and that nobody from Sinar has ever had a key to No. 96.',
    },
    {
      id: 'shahrul', name: 'Shahrul Nizam', role: 'Night guard, Kawalan Sentosa. 29', img: 'sus_shahrul',
      revealedBy: 'c3_04',
      revealLine: "The boot is the one issued to the guards on the hotel site next door. Its night guard says he never left his cabin.",
      look: { skin: '#b97f55', hair: 'short', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'stubble' },
      motive: 'None known. RM 1,700 a month. A daughter born in June.',
      claim: 'Says he never left the guard cabin on the hotel site next door between midnight and dawn, and saw nobody in the lane.',
    },
  ],

  opening: [
    {
      img: 'c3_intro_01_call', mood: 'night', fx: ['rain', 'buzz'], place: 'Brickfields. Thursday, 7:15 AM.', sfx: 'buzz', music: 'office',
      lines: [
        { who: 'Unknown number', en: '[Incoming call]' },
        { who: 'Woman', orig: 'Wa Ah Kong si liao.', en: 'My grandfather is dead.' },
        { who: 'Woman', en: 'Sorry. I am Jo. Jo Lim. Rachel Goh gave me your number. My grandfather made Dr. Goh\'s dentures for thirty years.' },
        { who: 'Jo Lim', en: 'Our shophouse in Penang burned at ten past four this morning. He was upstairs. Bomba says old wiring.' },
        { who: 'Jo Lim', en: 'He unplugged everything every night. Every night. The kettle, the radio, the lathe. He said electricity is a thief that comes in while you sleep.' },
        { who: 'You', en: 'Why call me, Jo?' },
        { who: 'Jo Lim', en: 'Last week he said: if a detective comes asking about Dr. Goh, the moulds are in the back.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.1, 0, 0] },
    },
    {
      img: 'c3_intro_02_xray', mood: 'night', fx: ['dust'], place: 'Your desk.',
      lines: [
        { who: null, en: 'The X-ray from Henry Goh\'s safe has been in your drawer since Mont Kiara, beside the paper kancil. PK-0821. Port Klang, August 2021.' },
        { who: null, en: 'A dentist read that X-ray, and a technician in Penang cast his models. One of them fell from Floor 14. The other died in the smoke above his own workshop.' },
        { who: null, en: 'You put it in your inside pocket, next to Daniel\'s lighter.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.14, 0, 1] },
    },
    {
      img: 'c3_intro_03_bala', mood: 'warm', fx: ['dust'], place: 'Downstairs.',
      lines: [
        { who: 'Bala Anne', orig: 'Penang-aa? Anga mazhai inga vida mosam.', en: 'Penang? The rain there is worse than here.' },
        { who: 'Bala Anne', orig: 'Saapittu poonga.', en: 'Eat before you go.' },
        { who: null, en: 'He puts a three-tier tiffin carrier on the passenger seat and does not ask when you will be back.' },
        { who: null, en: 'On the television over the counter, Dr. Shanti Menon\'s murder trial goes into its second week. Her lawyer tells the cameras the prosecution has a balcony, a print on a door handle, and no motive.', when: (f) => f.SHANTI_WRONGED },
        { who: 'Bala Anne', en: 'That durian man Ravi came to eat yesterday. He paid for his own teh. He looked at your stairs a long time.', when: (f) => f.RAVI_WRONGED },
        { who: null, en: 'A message from Salmah, the first in weeks: a photo of Faizal\'s lorry with a repossession notice under the wiper. No words.', when: (f) => f.FAIZAL_WRONGED },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c3_intro_04_bridge', mood: 'night', fx: ['rain'], place: 'Penang Bridge. Thursday, 12:40 PM.', music: 'tension',
      lines: [
        { who: null, en: 'Thirteen and a half kilometres of bridge, and the rain comes across the strait sideways.' },
        { who: null, en: 'Since Ipoh, a grey sedan has held four cars behind you. WXY 1408. It takes the bridge with you and does not overtake. On the island it turns off at Jelutong, and is back in your mirror by Lebuh Pantai.', when: (f) => f.JASON_FREE },
        { who: null, en: 'George Town comes up out of the rain in clan-house roofs and hotel cranes, the old and the new leaning on each other.' },
      ],
      kb: { from: [1.0, -3, 0], to: [1.08, 3, 0] },
    },
    {
      img: 'c3_intro_05_chulia', mood: 'day', fx: ['dust'], place: '96 Lebuh Chulia. 2:10 PM.',
      lines: [
        { who: null, en: 'No. 96 is a black mouth in a row of pastel shophouses. The five-foot way is wet with hose water, and the air tastes of plaster and burnt wax.' },
        { who: null, en: 'On one side, the joss-paper and coffin shop at No. 94, shutters half down. On the other, a hoarding printed with a hotel that does not exist yet. THE CHULIA. A Sinar Heritage Hotel.' },
        { who: null, en: 'Sinar. You read it twice.' },
      ],
      kb: { from: [1.0, 2, 0], to: [1.12, -2, 0] },
    },
    {
      img: 'c3_intro_06_jo', mood: 'day', fx: [],
      lines: [
        { who: 'Jo Lim', en: 'He had been sleeping at my flat since he fell in September. On Wednesday he went home. He said somebody had to be there, in case the detective came.' },
        { who: 'Jo Lim', en: 'You are one day late. I am not saying it to be cruel. I am just saying it.' },
        { who: null, en: 'His reading glasses are in her shirt pocket. He left them on her bedside table, and meant to come back for them.' },
      ],
      kb: { from: [1.08, 1, 0], to: [1.0, -1, 0] },
    },
    {
      img: 'c3_intro_07_farah', mood: 'police', fx: ['rain'],
      lines: [
        { who: 'Inspector Farah Iskandar', en: 'Penang is not mine either. With you that is becoming a habit.' },
        { who: 'Inspector Farah Iskandar', en: 'Azman sends his salam. He gave me his photos from the port. One is a reefer van backing into Bay 3, with a small sunburst on the door. Sinar Cold Chain. I am sending it to you.', when: (f) => f.AZMAN_ALIVE },
        { who: 'Inspector Farah Iskandar', orig: 'Tulis semua. Hantar pada saya setiap malam.', en: 'Write everything down. Send it to me every night. I am not losing another witness.', when: (f) => f.AZMAN_DEAD },
        { who: 'Inspector Farah Iskandar', en: 'Something you will enjoy. Kawalan Sentosa has a new regional supervisor in Penang. Rizal Hamdan. He has done well for a man who deleted seventeen minutes.', when: (f) => f.RIZAL_FREE },
        { who: 'Inspector Farah Iskandar', en: 'Call me when you have something I can write down.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.1, 0, 1] },
    },
    {
      img: 'c3_intro_08_colombo', mood: 'night', fx: [], place: 'A guesthouse on Love Lane. 11:50 PM.',
      when: (f) => f.TONY_FREE,
      lines: [
        { who: null, en: 'Your phone buzzes on the pillow. WhatsApp, from a +94 number. Sri Lanka.' },
        { who: null, en: 'No text. One photograph: Colombo port at night, the cranes lit orange, taken from the deck of a ship.' },
        { who: null, en: 'You do not reply. You do not delete it either.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.12, 0, 0] },
    },
    { title: { kicker: 'Case 3', name: 'The Unclaimed' }, fx: ['rain'] },
  ],

  levels: [
    // ---------------- No. 96 ----------------
    {
      id: 'c3_01', phase: 'No. 96', title: 'What the fire left',
      game: 'wordsearch', variant: 'secret',
      brief: 'Bomba has released the back workshop for one hour. It smells of wet plaster and burnt wax, and Jo will not come past the doorway. Penolong Penguasa Bomba Aishah has listed everything that survived on her clipboard, and she lets you copy it. Find every item. The letters nobody used will tell you what her clipboard says and her report does not.',
      params: {
        size: 12,
        words: ['LATHE', 'KETTLE', 'RADIO', 'FLASK', 'WAXPOT', 'PLASTER', 'BURNER', 'DENTURE', 'CRUCIBLE', 'MOULD', 'SOCKET', 'SHELF', 'TWEEZERS', 'ARTICULATOR'],
        extra: ['FAN', 'TIN', 'CUP', 'MUG', 'RAG', 'BRUSH', 'CLAMP', 'SPIRIT', 'JAR', 'WIRE', 'LAMP', 'HOOK', 'APRON'],
        message: 'ONEPLUGSTILLIN',
        messageSpaced: 'ONE PLUG STILL IN',
      },
      evidence: {
        img: 'ev_c3_socket', hotspot: { x: 0.49, y: 0.62, r: 0.13 },
        title: 'One plug still in',
        short: 'Every plug in the workshop hangs loose beside its socket, the way Uncle Lim left them each night. One socket, under the plaster shelf, still holds a melted lump. The burn spreads up the wall from there.',
        text: 'The wax pot, the polishing lathe, the kettle, the radio: every plug in the workshop hangs on its own nail beside its socket, the way Uncle Lim left them every night for forty years. One socket, low on the wall under the plaster shelf, still has something in it, fused to the faceplate: a lump of black plastic the size of a fist. The burn pattern climbs the wall in a V from exactly there.',
      },
    },
    {
      id: 'c3_02', phase: 'No. 96', title: 'The lump in the socket',
      game: 'nonogram', variant: 'classic',
      brief: 'Aishah has been a fire investigator for nineteen years and does not like the words "old wiring" before anyone has opened the wiring. She X-rays the lump at the Lebuh Pantai fire station. The scan file corrupts on its way to her laptop, and only the row and column counts survive. Rebuild it.',
      params: {
        solvedText: 'The picture resolves: a round dial ringed with pins, one of them pushed in, and two prongs underneath.',
        picture: [
          '....#######....',
          '..##.......##..',
          '.#..#.#.#.#..#.',
          '.#.#.......#.#.',
          '#.#.........#.#',
          '#......#......#',
          '#.#....#....#.#',
          '#......###..###',
          '#.#.........###',
          '.#.#.......#.#.',
          '.#..#.#.#.#..#.',
          '..##.......##..',
          '....#######....',
          '.....#...#.....',
          '.....#...#.....',
        ],
      },
      evidence: {
        img: 'ev_c3_timer', hotspot: { x: 0.45, y: 0.48, r: 0.2 },
        title: 'A timer nobody owned',
        short: 'Inside the lump: a plug-in timer with one pin pushed down, 4:00 to 4:15 AM, and a phone charger with its fuse bridged by foil from a cigarette packet. The foil smells of cloves. Uncle Lim owned no timer and never smoked.',
        text: 'Inside the plastic: a cheap 24-hour segment timer, the kind sold for aquarium lights, with a single pin pushed down for 4:00 to 4:15 AM. Plugged into it, a phone charger with its casing split and its fuse bridged with a strip of gold foil, the lining of a cigarette packet. The foil still smells faintly of cloves. Jo, from the doorway: "Ah Kong never owned a timer. He said anything that switches itself on is a thief. And he never smoked one day in his life."',
      },
    },
    {
      id: 'c3_tp', phase: 'No. 96', title: 'Statement 03',
      game: 'tape', variant: 'splice',
      brief: 'Bomba records every statement taken at a fire. Jo gave hers at 5:31 on Thursday morning on the five-foot way, wrapped in a Bomba blanket, while the hoses were still running. Aishah pulls it up for you at the Lebuh Pantai station and frowns. The station\'s copy has been cut into five pieces and saved back out of order, and the first report calls it "audio rosak, tidak digunakan": audio damaged, not used. "Sound does not damage itself into five neat pieces," Aishah says. Put them back in order.',
      params: {
        line: { who: 'Jo Lim', en: 'He unplugged everything every night. Every night. The kettle, the radio, the lathe. He said electricity is a thief that comes in while you sleep.' },
        pieces: 5,
        label: 'BOMBA LEBUH PANTAI · KENYATAAN 03 · 05:31',
        clue: 'Every word is still on the tape. Somebody only changed the order.',
      },
      evidence: {
        img: 'ev_c3_statement', hotspot: { x: 0.44, y: 0.40, r: 0.14 },
        title: 'Audio damaged, not used',
        short: 'Restored, Jo\'s statement to Bomba says he unplugged everything every night. The station copy was cut and re-saved at 7:20 AM on Thursday under the duty officer\'s login, ten minutes before he signed "old wiring" into the first report.',
        text: 'In order, it is Jo\'s voice at 5:31 AM, hoarse from the smoke, saying word for word what she said to you on the phone two hours later, because she has said it to everyone who would listen: he unplugged everything, every night. The first Bomba report quotes none of it. "Family statement: audio damaged, not used." The station log says the recording was opened, cut into five pieces and saved again at 7:20 AM on Thursday, under the login of the duty officer, ten minutes before he signed the report that says "old wiring". Nobody had been inside No. 96 yet. Aishah closes the laptop. "He is not a bad man. He is a man who was told what happened before anybody looked, and wanted his file to agree."',
      },
    },
    {
      id: 'c3_03', phase: 'No. 96', title: 'The archive',
      game: 'sudoku', variant: 'classic',
      brief: 'Behind the workshop Uncle Lim kept his archive: a wall of steel pigeonholes, nine across and nine down, holding every plaster jaw he ever cast for Dr. Goh. The soot has blacked out the labels. He numbered them the way he did everything, so that no number repeats in a row, a column or a block. While Jo\'s colleague cleans the photographs, rebuild his numbers.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c3_shelf', hotspot: { x: 0.5, y: 0.42, r: 0.14 },
        title: 'GOH 2021, gone before the smoke',
        short: 'One pigeonhole is empty: GOH 2021. Under the soot, a clean rectangle in the plaster dust: the carton was lifted out before the fire. Lim\'s index card: "PK-0821, duplicate poured, sent to the school in Butterworth."',
        text: 'Eighty pigeonholes still hold their cartons, cooked but whole. One is empty: GOH 2021. Under the soot, the plaster dust on its shelf has a clean rectangle pressed into it, sharp at the edges. The soot settled on bare steel and dust alike, so the carton was gone before the smoke came. Clipped to the shelf, Uncle Lim\'s index card in blue biro: "14 models. PK-0821: duplicate poured, given to the school in Butterworth for teaching. 16.8.21."',
      },
    },
    {
      id: 'c3_04', phase: 'No. 96', title: 'The back step',
      game: 'footprint', variant: 'size',
      brief: 'The back door of No. 96 opens onto a lane two metres wide, shared with the joss-paper shop on one side and the hotel hoarding on the other. On the step, in a skin of white plaster dust the hoses never reached, one clear print points out into the lane. The tread is common. The size will not be.',
      params: { shoes: 10 },
      evidence: {
        img: 'ev_c3_bootprint', hotspot: { x: 0.52, y: 0.55, r: 0.16 },
        title: 'A safety boot, size 8, going out',
        short: 'A black safety boot, UK size 8, with dental stone packed in the tread, stepping out of the workshop. It is the boot issued to the guards on the hotel site next door, and sold on every hardware counter on Lebuh Pantai.',
        text: 'A black steel-toe safety boot, UK size 8, worn at the inner heel. Its grooves are packed with dental stone, the fine white gypsum only Uncle Lim used, so whoever wore it had walked through the workshop, and the print points out into the lane, not in. The model is standard issue for the Kawalan Sentosa guards on the hotel site next door. It is also sold on every hardware counter on Lebuh Pantai, to half the construction workers in George Town.',
      },
    },

    // ---------------- The five-foot way ----------------
    {
      id: 'c3_05', phase: 'The five-foot way', title: 'Madam Cheah',
      game: 'riddles', variant: 'mixed',
      brief: 'Cheah Siew Lan has sold joss paper and coffins at No. 94 for thirty-one years, and she does not answer questions. She asks them: the old riddles her father used on coffin buyers, so nobody ever left his shop without laughing once. Answer hers and she will tell you about her night. Whether it is true is another matter.',
      params: { riddles: 4, situations: 2, reveals: 5 },
      evidence: {
        img: 'ev_c3_jossbin', hotspot: { x: 0.55, y: 0.6, r: 0.16 },
        title: 'Ash in the back lane',
        short: 'Madam Cheah burned joss paper in an iron bin in the back lane at midnight, three metres from Uncle Lim\'s door. She says she slept from 12:30 and smelled nothing until the sirens. She and Lim fought over the party wall for seven years.',
        text: '"Wa khun liao. Wa boh phinn tioh mih-kiann." I was asleep. I smelled nothing. Madam Cheah burned joss paper for her late husband at midnight, as she does every night, in an iron bin in the back lane three metres from Uncle Lim\'s back door. She says she was in bed by half past twelve and woke to the sirens. She and Lim fought for seven years over the party wall and his gutter: two cases in the Magistrate\'s Court, both lost by her. "If his wiring killed him," she says, "then his wiring killed him."',
      },
    },
    {
      id: 'c3_06', phase: 'The five-foot way', title: 'Kenny\'s car',
      game: 'hiddenobject', variant: 'list',
      brief: 'Kenny Lim meets you at the Lim clan jetty on Weld Quay, where he grew up, because he says he cannot face Lebuh Chulia. He talks for twenty minutes about his uncle and does not once look at you. His car is parked on the quay with the boot open to air it out. Farah, on the phone, says nothing about a warrant, which is how she says yes.',
      params: { scene: 'boot', targets: 13, objects: 74 },
      evidence: {
        img: 'ev_c3_carboot', hotspot: { x: 0.5, y: 0.58, r: 0.2 },
        title: 'Kenny\'s half',
        short: 'In Kenny\'s boot: an agreement to sell his half of No. 96 to Sinar Heritage for RM 900,000, void unless his uncle\'s half sells too; a moneylender\'s final notice for RM 60,000; his key to No. 96; a black chip with a gold dragon.',
        text: 'Under a gym bag: a provisional agreement, six weeks old, selling Kenny\'s inherited half-share of No. 96 to Sinar Heritage Hotels for RM 900,000, void unless the other half, his uncle\'s, is sold within ninety days. A moneylender\'s final notice from Jelutong for RM 60,000, with a photograph of Kenny\'s own front gate. His key ring, with a back-door key stamped 96. And a black plastic chip with a gold dragon on it and no casino name. Kenny says he was asleep in Jelutong by midnight, and that his key has never left his hands.',
      },
    },
    {
      id: 'c3_07', phase: 'The five-foot way', title: 'The key cutter',
      game: 'iqmatrix', variant: 'columns',
      brief: 'One man in George Town still cuts keys for the old shophouse locks: Tan Ah Seng, under the five-foot way on Lebuh Campbell, since 1979. He does not remember customers. He remembers keys, by their cuts, the way other men remember faces, and he keeps a book of every pattern he has ever copied. He will open it for someone who reads patterns the way he does.',
      params: { count: 7, startLevel: 1 },
      evidence: {
        img: 'ev_c3_keybook', hotspot: { x: 0.35, y: 0.6, r: 0.18 },
        title: 'Two copies, on account',
        short: 'Three weeks ago Ah Seng cut two copies of the No. 96 back-door key on Sinar Heritage\'s account, signed M. Ong. The original was Kenny\'s, lent "for the surveyors" and returned the same day. The copies were not.',
        text: 'Ah Seng\'s book, three weeks back, in pencil: "96 Chulia, back door, old Yale. 2 copies. Sinar Heritage, on account." Signed M. ONG. He remembers the key, not the man who brought it in: gold watch, too much cologne, in a hurry. Kenny lent his key to Sinar "for the surveyors" and had it back the same afternoon. Melissa Ong has told two newspapers that nobody from Sinar has ever had a key to No. 96.',
      },
    },
    {
      id: 'c3_08', phase: 'The five-foot way', title: 'Air Itam',
      game: 'lineup', variant: 'single',
      brief: 'The dragon chip belongs to a room above a joss-stick shop behind the Air Itam market, open from midnight to dawn, where nobody has a name and everybody has a tab. The doorman, Ah Boon, never forgets a face that owes money. He will look at faces for you, fast, once. Then he will forget you too.',
      params: { rounds: 3, studySeconds: [10, 8, 6] },
      evidence: {
        img: 'ev_c3_den', hotspot: { x: 0.5, y: 0.55, r: 0.12 },
        title: 'Down RM 3,400 in Air Itam',
        short: 'Ah Boon puts Kenny in the Air Itam den from 2:10 to 5:05 AM, eleven kilometres from Lebuh Chulia, losing RM 3,400. He was not asleep in Jelutong.',
        text: 'Ah Boon picks Kenny every time. In at 2:10, out at 5:05, down RM 3,400 at the baccarat table, and he borrowed his taxi fare home. Air Itam is eleven kilometres from Lebuh Chulia, up the hill. Kenny lied about where he slept. When you tell him what you know he sits down on the kerb with his gold watch in his hand. "Don\'t tell Jo. Anything, but don\'t tell Jo."',
      },
    },

    // ---------------- The hoarding ----------------
    {
      id: 'c3_09', phase: 'The hoarding', title: 'Out the back',
      game: 'maze', variant: 'cameras',
      brief: 'Whoever lifted the GOH 2021 carton went out of No. 96\'s back door with something heavy in both arms. Lebuh Chulia never fully sleeps: a backpacker hostel\'s camera watches the five-foot way, a café films its own kitchen door, and Madam Cheah\'s doorbell camera watches her end of the lane. Trace the only way from the workshop door to an exit that no camera sees.',
      params: {
        map: [
          '#####################',
          '#C........#........H#',
          '#.#######.#.######..#',
          '#.#.....#...#....#.##',
          '#.#.###.#####.##....#',
          '#...#.#.......#..##.#',
          '###.#.#.#####.#.#...#',
          '#...#...#.S.#...#.#.#',
          '#.#####.#.#.#####.#.#',
          '#.....#...#.......#.#',
          '#.###.#####.#####.#.#',
          '#...#.......#.......#',
          '##########F##########',
        ],
        cameras: [
          { x: 1, y: 3, dir: 'N', range: 2 },
          { x: 9, y: 11, dir: 'E', range: 3 },
          { x: 13, y: 11, dir: 'W', range: 3 },
          { x: 19, y: 7, dir: 'N', range: 4 },
          { x: 11, y: 1, dir: 'E', range: 4 },
        ],
        exits: { H: 'Hoarding back gate', C: 'Lebuh Campbell end of the lane', F: 'Five-foot way, Lebuh Chulia' },
        startLabel: '96',
        startName: 'the back door of No. 96',
        aria: 'Plan of the back lane behind No. 96 and the hotel site',
        answer: 'H',
      },
      evidence: {
        img: 'ev_c3_hoardinggate', hotspot: { x: 0.6, y: 0.5, r: 0.18 },
        title: 'Into the hotel site',
        short: 'The only unseen way out of No. 96 ends at the back gate of the Sinar Heritage hoarding. Its padlock has one key, on one ring: the night guard\'s. The night guard is Shahrul Nizam.',
        text: 'The only route no camera sees doubles back through the old lanes and comes out at the back gate of the Sinar Heritage hoarding. The gate is chained on the inside. Its padlock has one key, and the key hangs on one ring: the night guard\'s. The Kawalan Sentosa night guard on the hotel site is Shahrul Nizam, 29. He told Bomba he never left his cabin at the front, and saw nobody in the lane.',
      },
    },
    {
      id: 'c3_10', phase: 'The hoarding', title: 'Forty-six minutes',
      game: 'timeline', variant: 'log',
      brief: 'Four things kept time on Lebuh Chulia that night: the hostel camera across the street, Madam Cheah\'s doorbell, Kawalan Sentosa\'s radio, and the guard-tour app that makes a guard tap his phone on a tag at every checkpoint. Eight entries survive, out of order, some clocks smudged. Put them in the order they happened.',
      params: {
        frames: [
          { id: 'a', clock: '00:1▮', title: 'Doorbell camera, back door of No. 94', text: 'Madam Cheah tips a kettle of water into her iron joss-paper bin. Steam. She puts the lid on and goes in.' },
          { id: 'b', clock: '01:1▮', title: 'Hostel camera, across Lebuh Chulia', text: 'A white Volvo with a Sinar Heritage parking permit stops at the hoarding gate. A woman in a dark blazer hands the guard a paper bag through the window. Seventy seconds.' },
          { id: 'c', clock: '02:4▮', title: 'Kawalan Sentosa radio, channel 2', text: 'Shahrul Nizam: "Site 98, semua okay. No movement." The last time anyone hears him on the radio that night.' },
          { id: 'd', clock: '0▮:05', title: 'Guard-tour app', text: 'Checkpoint C, the hoarding\'s back gate, tapped by S. NIZAM. The gate onto the lane.' },
          { id: 'e', clock: '03:2▮', title: 'Hostel camera', text: 'The guard cabin light is on. The chair is empty. A cigarette burns down on the cabin rail, untouched.' },
          { id: 'f', clock: '03:51', title: 'Guard-tour app', text: 'Checkpoint A, the front gate beside the cabin, tapped by S. NIZAM. Forty-six minutes after the back gate. The round takes six.' },
          { id: 'g', clock: '03:5▮', title: 'Hostel camera', text: 'Two minutes after the front-gate tap, a motorbike leaves the hoarding toward Lebuh Pantai, a carton roped to the pillion. The rider wears a reflective vest.' },
          { id: 'h', clock: '04:1▮', title: 'Bomba 999 log', text: 'A caller from the hostel, in Dutch-accented English: "The shop across the road. Smoke from the back. A lot of smoke." Engines leave Lebuh Pantai station two minutes later.' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The night plays in order, and the site\'s own guard is missing from the middle of it.',
      },
      evidence: {
        img: 'ev_c3_guardtour', hotspot: { x: 0.5, y: 0.55, r: 0.16 },
        title: 'Forty-six minutes',
        short: 'Shahrul\'s six-minute round took forty-six: back gate 3:05, front gate 3:51. At 1:1x a Sinar Heritage car passed him a paper bag. At 3:53 a motorbike left the site with a carton. Bomba found his cabin empty.',
        text: 'At 1:1x a white Volvo stopped at the hoarding and a woman handed the guard a paper bag through the window. The parking permit on its windscreen is issued to Sinar Heritage\'s project director, Melissa Ong, who says she was asleep by eleven. At 3:05 Shahrul tapped the back gate onto the lane, and did not tap anything else for forty-six minutes; the round takes six. At 3:53 a motorbike left the site with a carton roped behind the rider. When the engines arrived at 4:18 the guard cabin was empty. Shahrul came back at 4:40 and told Bomba he had been patrolling the far side of the site.',
      },
    },
    {
      id: 'c3_rz', phase: 'The hoarding', title: 'The duty roster',
      game: 'kakuro', variant: 'classic',
      when: (flags) => !!flags.RIZAL_FREE,
      brief: 'Kawalan Sentosa\'s Penang office is two rooms above a car showroom in Bayan Lepas, and its supervisor for the whole island is Rizal Hamdan. He knows you in the doorway and does not stand up. The duty roster is a paper grid of hours summed across and down, and somebody has gone over Thursday night in a different pen. Rebuild the sums, and the roster will tell you what he signed.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c3_roster', hotspot: { x: 0.46, y: 0.58, r: 0.2 },
        title: 'Signed off at 2:45',
        short: 'Rizal signed Shahrul off duty "sick" at 2:45 AM, in his own hand, with no relief guard. On paper the site was empty. Rizal: "Puan Melissa called me at 2:40. She said the boy was sick. I let him go."',
        text: 'Thursday, in Rizal\'s handwriting: "S. Nizam, Site 98, off duty sick 0245. Relief: nil." On paper, nobody was guarding the hotel site when No. 96 burned, and nobody would be blamed for it. A sick man, off duty, who tapped the back gate at 3:05. Rizal does not look up from the roster. "Puan Melissa called me at 2:40. She said the boy looked sick, let him go home, the site does not need a guard for two hours." He turns his pen over and over. "I did not ask. I have learned not to ask."',
      },
    },
    {
      id: 'c3_11', phase: 'The hoarding', title: 'The skip',
      game: 'fingerprint', variant: 'classic',
      brief: 'The hoarding has a rubbish skip just inside the front gate, and nobody searches the skip a guard is paid to guard. Under the cement bags: a torn blister pack for a 24-hour plug-in timer, and a hardware-shop receipt. Aishah lifts a partial print from the inside of the pack. Classify it, then find its owner among the people on file.',
      params: {
        liftLabel: 'Lift: timer blister pack, hotel site skip',
        liftAria: 'Partial print lifted from the inside of a torn blister pack',
        candidates: [
          { id: 'lim', name: 'Lim Chee Keong' },
          { id: 'jo', name: 'Jo Lim' },
          { id: 'kenny', name: 'Kenny Lim' },
          { id: 'cheah', name: 'Cheah Siew Lan' },
          { id: 'shahrul', name: 'Shahrul Nizam' },
          { id: 'melissa', name: 'Melissa Ong' },
          { id: 'rizal', name: 'Rizal Hamdan' },
          { id: 'ahseng', name: 'Tan Ah Seng' },
        ],
        answer: 'shahrul',
      },
      evidence: {
        img: 'ev_c3_blister', hotspot: { x: 0.38, y: 0.45, r: 0.2 },
        title: 'His thumb, inside the pack',
        short: 'The print inside the timer\'s blister pack is Shahrul Nizam\'s. The receipt: one segment timer, one phone charger, RM 31.80, a hardware shop on Lebuh Pantai, Tuesday 6:12 PM, cash.',
        text: 'The print is Shahrul Nizam\'s, from the inside of the pack, where a thumb goes to push the timer out. The receipt is from a hardware shop on Lebuh Pantai: one 24-hour segment timer, one phone charger, RM 31.80, cash, Tuesday at 6:12 PM, two days before the fire. The shopkeeper remembers a young guard in a Kawalan Sentosa shirt who smelled of clove cigarettes and asked which timer was the most simple.',
      },
    },
    {
      id: 'c3_12', phase: 'The hoarding', title: 'Paper for the dead',
      game: 'tangram', variant: 'classic',
      brief: 'Madam Cheah cannot sleep, so she folds: paper houses for the dead to live in, paper boats for the crossing, paper shoes so they do not walk barefoot. At night she sits on a stool in her five-foot way with a stack of joss paper and a tin of glue, and she will talk if your hands are busy too. She cuts the shapes. You fit them.',
      params: { rounds: 3, shapes: ['house', 'boat', 'boot'] },
      evidence: {
        img: 'ev_c3_voicenote', hotspot: { x: 0.52, y: 0.5, r: 0.17 },
        title: 'Nine minutes',
        short: 'At 3:48 Madam Cheah saw a man in a reflective vest come out of Lim\'s back door with a heavy carton, smelling of cloves. At 4:03 she sent her sister a voice note: "That old man is burning plastic again. Let him." She called no one.',
        text: 'Her sister in Ipoh still has the voice note, 4:03 AM, in Hokkien: "Hit e lau ah pek koh teh sio plastic. Ho i sio." That old man is burning plastic again. Let him burn it. She was awake. At 3:48, from her back window, she had seen a man in a reflective vest come out of Lim\'s back door with a carton he carried like bricks, and smelled clove cigarettes in the lane. She called no one. "Seven years he never said sorry for the wall," she says, folding a paper boat smaller and smaller. "So I said nothing. Nine minutes. I said nothing for nine minutes."',
      },
    },

    // ---------------- Sinar Heritage ----------------
    {
      id: 'c3_13', phase: 'Sinar Heritage', title: 'The survey',
      game: 'series', variant: 'classic',
      brief: 'Jo draws for a conservation studio on Lebuh Armenian. Two months ago her studio was hired to write the heritage report for The Chulia, and the whole project folder is on her laptop. She has not slept. In it is the electrical survey Sinar sent to Bomba and the newspapers, the one that says No. 96 was a fire waiting to happen. Its numbers are too neat. Find what comes next in each.',
      params: {
        items: [
          { prompt: 'Circuit labels on the survey\'s fuse board: 1, 3, 7, 15, 31, ?', answer: 63, hint: 'Double the previous number and add one.' },
          { prompt: 'Monthly meter readings for No. 96, in kWh, as the survey records them: 112, 118, 130, 148, 172, ?', answer: 202, hint: 'The gaps grow by six each time: 6, 12, 18, 24 …' },
          { prompt: 'Earth readings the engineer says he took at each socket, in ohms: 0, 2, 6, 12, 20, 30, ?', answer: 42, hint: 'Each reading is n × (n − 1).' },
          { prompt: 'Page numbers, where two reports have been stapled into one and shuffled: 4, 19, 8, 17, 12, 15, ?', answer: 16, hint: 'Two series woven together: 4, 8, 12 … and 19, 17, 15 …' },
          { prompt: 'Uncle Lim\'s 2019 rewiring certificate, numbered in his electrician\'s style, each number the sum of the two before: 2, 3, 5, 8, 13, 21, ?', answer: 34, hint: 'Add the two numbers before.' },
          { prompt: 'The survey\'s photographs are numbered 3, 6, 11, 18, 27, 38, ?', answer: 51, hint: 'Square numbers, plus two.' },
        ],
      },
      evidence: {
        img: 'ev_c3_survey', hotspot: { x: 0.5, y: 0.55, r: 0.2 },
        title: '"Old wiring", sent at 7:12 AM',
        short: 'Sinar\'s survey condemns wiring Uncle Lim had replaced in 2019, photographs the back room of No. 98 instead of No. 96, and was emailed to Bomba and the press by Melissa Ong at 7:12 AM, three hours after the fire.',
        text: 'The survey, dated January, calls the wiring at No. 96 "original 1960s, dangerous, beyond repair". Uncle Lim had the shop rewired in 2019 by a registered wireman on Lebuh Kimberley; the certificate is in Jo\'s drawer. The survey\'s photographs show a back room with the staircase on the wrong side: it is No. 98, next door, which Sinar already owns. And the PDF went to Bomba and to two newspapers from Melissa Ong\'s email at 7:12 AM on Thursday, three hours after the fire, before anyone had been allowed inside.',
      },
    },
    {
      id: 'c3_14', phase: 'Sinar Heritage', title: 'Petty cash',
      game: 'quickmath', variant: 'receipts',
      brief: 'Also in the project folder: the site\'s petty-cash scans, every voucher Sinar Heritage\'s Penang office has paid since the hoarding went up. Hundreds of them: tolls, teh, padlocks, overtime. Check them the way auditors never bother to, fast, against the clock.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c3_voucher', hotspot: { x: 0.42, y: 0.58, r: 0.17 },
        title: 'RM 8,000 for one night',
        short: 'Voucher 0417: "site security overtime, one night", RM 8,000 cash to S. Nizam, signed M. Ong, the day before the fire. Scanned with it, an email from "Office of the Chairman": "The 2021 box first. Then the building."',
        text: 'Voucher 0417, dated Wednesday: "Site security, overtime, one night." RM 8,000 in cash to S. Nizam, approved and signed M. Ong. A Kawalan Sentosa guard earns RM 1,700 a month. Voucher 0388, three weeks earlier: "Key duplication x2, Lebuh Campbell", RM 24. Scanned on the same page as 0417, as if someone had printed it to show to someone else: an email to Melissa Ong from an address with no name, only "Office of the Chairman". One line. "The 2021 box first. Then the building."',
      },
    },

    // ---------------- Across the water ----------------
    {
      id: 'c3_jx', phase: 'Across the water', title: 'The rider',
      game: 'pursuit',
      when: (flags) => !!flags.JASON_FREE,
      brief: 'The grey sedan has not been far from you since the bridge. Today it is a boy on a red Honda instead, in a food-delivery jacket with no food, who has been behind you on every street since breakfast. Before you cross to Butterworth you need him off your back. You double back on him on Lebuh Armenian and he guns the Honda into the old town: clan-house lanes, five-foot ways, trishaws parked across the tiles, lanterns low enough to take your head off. He knows these lanes. Keep him in sight until they run out.',
      params: {
        setting: 'heritage', vehicle: 'scooter', difficulty: 'medium', suspect: 'The rider',
        route: ['heritage', 'market', 'heritage', 'kampung'], legs: 4, skyline: 'penang',
        beats: [
          'Down Lebuh Chulia and through the hawker stalls, woks flaring on both sides.',
          'Back into the clan-house lanes: lanterns low, trishaws parked across the tiles.',
          'Out onto the clan jetties at Weld Quay: planks, stilts, and the sea under you. The lanes end here.',
        ],
        clue: 'Food-delivery jacket, no food. Behind you on every street since breakfast.',
      },
      evidence: {
        img: 'ev_c3_riderphone', hotspot: { x: 0.52, y: 0.65, r: 0.14 },
        title: 'Photographs for J',
        short: 'The rider\'s phone: three days of photos of you, sent to a contact saved as "J". J answered once: "Ikut saja. Jangan sentuh." The last photo, taken at seven this morning: a drinks stall at the Butterworth ferry terminal.',
        text: 'His phone holds three days of you: Lebuh Chulia, Ah Seng\'s key stall on Lebuh Campbell, the stairs behind the Air Itam market. Every photo went to a contact saved as "J", and J has answered once: "Ikut saja. Jangan sentuh." Just follow. Do not touch. The last photo was taken at seven this morning, before you had heard her name: a drinks stall at the Butterworth ferry terminal, and an old woman wiping a table.',
      },
    },
    {
      id: 'c3_15', phase: 'Across the water', title: 'Uncle Lim\'s order book',
      game: 'cipher', variant: 'dental',
      brief: 'On Saturday Bomba releases the steel cabinet from the workshop. Inside, wrapped in a rice sack against the hoses: Uncle Lim\'s order books, 1979 to last week. Every job Dr. Goh ever sent him is there, and every private remark he made about them is written in the tooth symbols Goh taught him in 1994, so the clinic nurses could not read the gossip. The page for August 2021 is almost all symbols.',
      params: {
        message: 'PK ZERO EIGHT TWO ONE. WIRE BEHIND LOWER FRONT TEETH. TOP FRONT TOOTH CHIPPED. YOUNG, WISDOM TEETH JUST IN. RECORD HAS NONE OF THIS. NOT THE SAME MAN. DOCTOR SAYS WRITE MATCH.',
        given: ['E', 'T', 'O'],
      },
      evidence: {
        img: 'ev_c3_orderbook', hotspot: { x: 0.48, y: 0.55, r: 0.2 },
        title: '"Not the same man"',
        short: 'Lim, August 2021: the PK-0821 jaw has a wire behind the lower front teeth, a chipped top front tooth and wisdom teeth just coming in. The record it was matched to, RAJ, DANIEL, born 1983, has none of it. "Not the same man. Doctor says write match."',
        text: 'Decoded, in Uncle Lim\'s careful capitals: "PK-0821. Wire behind lower front teeth. Top front tooth chipped. Young, wisdom teeth just in. Record has none of this. Not the same man. Doctor says write match." Pinned behind the page, a photocopy of the record Goh was given to compare against, typed and headed RAJ, DANIEL, born 1983: two silver fillings at the back, no wire, no chip. Henry Goh signed the match on 24 August 2021. Uncle Lim wrote the truth in a code only two men could read. Now neither of them can.',
      },
    },
    {
      id: 'c3_16', phase: 'Across the water', title: 'The teaching cabinet',
      game: 'rotation', variant: '3d',
      brief: 'The dental technology school in Butterworth keeps a glass cabinet of plaster jaws for its students to learn on, each labelled with a donor\'s initials. One is labelled C.K.L. You have the X-ray from Dr. Goh\'s safe in your pocket. A film can be mounted the wrong way round, and a jaw turned is not a jaw reflected. Learn to tell them apart, and the two will meet.',
      params: { trials: 12, target: 10, options: 4 },
      evidence: {
        img: 'ev_c3_duplicate', hotspot: { x: 0.5, y: 0.45, r: 0.2 },
        title: 'The jaw on your X-ray',
        short: 'The school\'s duplicate of PK-0821 matches your X-ray tooth for tooth: a wire bonded behind the lower front teeth, a chipped upper left incisor, wisdom teeth half through. The teaching card says "probably foreign worker: no fillings, no dental history."',
        text: 'Turned to face the same way, the plaster jaw and Goh\'s X-ray are one mouth: a fine wire bonded behind the six lower front teeth, the upper left front tooth chipped at its corner, the wisdom teeth half through the gum. Someone in his twenties. No fillings at all. A lecturer\'s card in the cabinet, typed in 2022: "Unidentified adult male, Port Klang. Probably foreign worker: no fillings, no dental history." Under it, in a student\'s pencil, a question mark and one word: "retainer?"',
      },
    },
    {
      id: 'c3_17', phase: 'Across the water', title: 'The noticeboard',
      game: 'anagram', variant: 'words',
      brief: 'On the noticeboard at the Butterworth ferry terminal, under timetables that have changed three times since, one poster has never been taken down. The monsoons have run its ink. The words are all still there; the letters have only slid. Put them back.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c3_poster', hotspot: { x: 0.52, y: 0.4, r: 0.18 },
        title: 'HILANG: Ong Wei Jie',
        short: 'Missing since August 2021: Ong Wei Jie, 26, of Butterworth, ferry engine-room crew, "went to Port Klang for work". In the photo he is laughing, and one upper front tooth is chipped at the corner. "Ask at the drinks stall downstairs."',
        text: 'HILANG. MISSING. 失踪. Ong Wei Jie, 26, of Butterworth. Engine-room crew on the car ferries until the old ferries stopped. "Pergi Port Klang untuk kerja, Ogos 2021." Went to Port Klang for work, August 2021. Last heard from on 12 August. In the photograph he is laughing at whoever holds the camera, and his upper front tooth is chipped at one corner. At the bottom, a phone number and a line in a mother\'s handwriting: "Ask at the drinks stall downstairs." Ong is the commonest name on this side of the water. Jo checks anyway: no relation to Melissa.',
      },
    },
    {
      id: 'c3_18', phase: 'Across the water', title: 'Madam Ong',
      game: 'witness', variant: 'statement',
      brief: 'The drinks stall at the Butterworth terminal is a cart, two tables and a donation tin for the temple, run by the same woman since the ferries carried cars. She does not need persuading to talk about her son. She has been waiting for someone to ask. She will tell it once.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Statement of Khoo Siew Hong, 61, known as Madam Ong. Drinks stall, Butterworth ferry terminal. Recorded Saturday, 4:30 PM.',
        introLine: 'Madam Ong wipes the table, then wipes it again. "One time only. After that I must open the stall."',
        retryLine: 'Madam Ong pours two teh, pushes one across to you, and starts again from the beginning.',
        statement: [
          'My son is Ong Wei Jie. Born the twentieth of August. He worked in the engine room of the car ferries for eight years, since he was eighteen. He could fix anything with a motor. When they stopped the old ferries, there was no more job for him.',
          'In July 2021 a man phoned from a company in Singapore. Cold storage. They needed someone to repair the refrigeration on containers at Port Klang. Six thousand ringgit a month, cash. He went down on the second of August, very happy.',
          'He phoned me every night at nine o\'clock. The last time was Thursday, the twelfth of August. He said, "Ma, the job finishes Friday. I come back for my birthday." Then nothing. The police said he is a grown man, maybe he went to Singapore.',
          'His teeth, you ask? At sixteen he had braces. When they took the braces off, the dentist glued a wire behind his bottom teeth so they do not move back. Three thousand eight hundred ringgit; I paid it in instalments. In 2019 he slipped on the ferry deck in the rain and chipped his top front tooth, on the left. He never fixed it. He said it made him look like a pirate.',
          'Every year on his birthday, somebody puts a paper kancil in my donation tin, folded from a receipt. A tall Indian man, very polite. He orders two teh and drinks one. The other one he leaves. I never asked him. Some things, if you ask, they stop coming.',
        ],
        questions: [
          { q: 'When is Wei Jie\'s birthday?', options: ['2 August', '12 August', '13 August', '20 August'], a: 3 },
          { q: 'Where did he work on the ferries?', options: ['On deck', 'In the engine room', 'In the ticket office', 'In the canteen'], a: 1 },
          { q: 'What was the Singapore job?', options: ['Driving reefer lorries', 'Repairing refrigeration on containers', 'Security at a cold store', 'Welding ship hulls'], a: 1 },
          { q: 'What did they pay him?', options: ['RM 3,800 a month', 'RM 6,000 a month, cash', 'RM 8,000 a month', 'SGD 2,000 a month'], a: 1 },
          { q: 'When did he last phone?', options: ['Monday, 2 August', 'Thursday, 12 August', 'Friday, 13 August', 'Friday, 20 August'], a: 1 },
          { q: 'What was glued behind his teeth?', options: ['A plate, behind the top teeth', 'A wire, behind the bottom teeth', 'A gold cap', 'Nothing; the braces came off'], a: 1 },
          { q: 'Which tooth was chipped?', options: ['Top front, on the left', 'Top front, on the right', 'Bottom front', 'A back tooth'], a: 0 },
          { q: 'How did he chip it?', options: ['In a fight', 'Biting a bottle cap', 'Slipping on the ferry deck in the rain', 'Falling off a motorbike'], a: 2 },
          { q: 'What does the visitor do?', options: ['Orders one teh and leaves a tip', 'Orders two teh and drinks one', 'Orders kopi O and asks about Wei Jie', 'Never orders anything'], a: 1 },
        ],
      },
      evidence: {
        img: 'ev_c3_tin', hotspot: { x: 0.45, y: 0.52, r: 0.14 },
        title: 'Two teh, drinks one',
        short: 'Wei Jie had a wire glued behind his bottom teeth at sixteen and chipped his top left front tooth on the ferry in 2019. In August 2021 he went to repair container refrigeration in Port Klang for a Singapore cold-storage company. Every birthday since, a tall polite man leaves a paper kancil in her tin.',
        text: 'Braces at sixteen, then a wire glued behind the bottom teeth: RM 3,800, paid in instalments. A top front tooth chipped on the left, on the ferry deck in 2019, never fixed. In August 2021, a cash job repairing the refrigeration on containers in Port Klang, for a cold-storage company from Singapore. The last call on Thursday, 12 August, at nine. And on his birthday every year since, a paper mousedeer folded from a receipt in her donation tin, left by a tall Indian man, very polite, who orders two teh and drinks one. "Some things," she says, "if you ask, they stop coming."',
      },
    },

    // ---------------- The interview room ----------------
    {
      id: 'c3_19', phase: 'The interview room', title: 'Everyone at 3:45',
      game: 'logicgrid', variant: 'classic',
      brief: 'Farah drives up from KL on Sunday on her own time and borrows a room at IPD Timur Laut that smells of floor polish and old rain. Before she lets anyone in, she wants the night on one page. Five people, five places, five things in their hands at a quarter to four.',
      params: {
        categories: [
          { name: 'Person', items: ['Shahrul', 'Kenny', 'Madam Cheah', 'Melissa', 'Jo'] },
          { name: 'Location', items: ['Gurney Drive', 'Tanjung Tokong', 'No. 96, back room', 'No. 94, upstairs', 'Air Itam'] },
          { name: 'Holding', items: ['Dragon chip', 'Reading glasses', 'Carton', 'Paper ingot', 'Second phone'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[2, 2], [4, 0], [3, 3], [0, 4], [1, 1]],
        clues: [
          'The dragon chip never left the gaming den in Air Itam.',
          'Neither Kenny nor Jo was anywhere near Lebuh Chulia.',
          'Madam Cheah did not leave her own house all night.',
          'The second phone was in a condo on Gurney Drive.',
          'Whoever stood in the back room of No. 96 was carrying something heavy.',
          'Jo was holding something her grandfather had left at her flat.',
          'The second phone was in a woman\'s hand.',
        ],
      },
      evidence: {
        img: 'ev_c3_onepage', hotspot: { x: 0.5, y: 0.55, r: 0.2 },
        title: 'Everyone at 3:45 AM',
        short: 'Shahrul: back room of No. 96, with the carton. Kenny: Air Itam, a dragon chip. Madam Cheah: upstairs at No. 94, folding. Melissa: Gurney Drive, a second phone. Jo: Tanjung Tokong, her grandfather\'s reading glasses.',
        text: 'At 3:45 AM: Shahrul Nizam was in the back room of No. 96 with the GOH 2021 carton in his arms. Kenny was in Air Itam with a dragon chip and a debt. Madam Cheah was upstairs at No. 94, awake, folding paper ingots. Melissa Ong was in her condo on Gurney Drive with a second phone that called one number twice that night, at 1:02 and at 4:21. Jo was asleep in Tanjung Tokong, with her grandfather\'s reading glasses on the bedside table. He had left them there on Wednesday. He had meant to come back for them.',
      },
    },
    {
      id: 'c3_20', phase: 'The interview room', title: 'Five interviews',
      game: 'whoslying', variant: 'classic',
      brief: 'Farah lets you sit in on five interviews. Each person either told the whole truth or lied in everything they said. Work out who lied.',
      params: {
        solvedLine: 'Farah caps her pen. "Two liars. One signs the vouchers, one carries the boxes."',
        people: [
          { id: 'kenny', name: 'Kenny', says: [{ t: '"I was at the den in Air Itam from two until five."', fact: true, note: 'Ah Boon picked him out three times.' }, { t: '"Melissa is lying."', about: 'melissa', is: false }] },
          { id: 'cheah', name: 'Madam Cheah', says: [{ t: '"Kenny is telling the truth."', about: 'kenny', is: true }, { t: '"Shahrul is lying."', about: 'shahrul', is: false }] },
          { id: 'jo', name: 'Jo', says: [{ t: '"Madam Cheah is telling the truth."', about: 'cheah', is: true }, { t: '"At least two of the others are lying."', atLeast: 2 }] },
          { id: 'melissa', name: 'Melissa', says: [{ t: '"Shahrul is telling the truth."', about: 'shahrul', is: true }, { t: '"Jo is lying."', about: 'jo', is: false }] },
          { id: 'shahrul', name: 'Shahrul', says: [{ t: '"Melissa is telling the truth."', about: 'melissa', is: true }, { t: '"Kenny is lying."', about: 'kenny', is: false }] },
        ],
        liars: ['melissa', 'shahrul'],
      },
      evidence: {
        img: 'ev_c3_interviews', hotspot: { x: 0.45, y: 0.45, r: 0.18 },
        title: 'Two liars, and one old lie',
        short: 'Melissa and Shahrul lied. Kenny and Madam Cheah, caught once already, told it straight. Six weeks ago Kenny told Melissa his uncle no longer slept at No. 96.',
        text: 'Melissa Ong and Shahrul Nizam lied in every word. Kenny and Madam Cheah, caught once already, tell it straight this time. And Kenny tells one thing more, to the table and not to you: six weeks ago, to hurry the sale, he told Melissa his uncle had moved in with Jo after his fall and never slept at No. 96 any more. It was true for three weeks. On Wednesday evening Uncle Lim went home.',
      },
    },
  ],

  outcomes: {
    charged: {
      kenny: { en: 'Kenny Lim is charged with arson and culpable homicide. He tells the magistrate he was in Air Itam losing three thousand four hundred ringgit. Nobody at the den will say so on paper.' },
      cheah: { en: 'Cheah Siew Lan is charged with arson. She closes No. 94 for the first time in thirty-one years. Her paper houses sit unsold in the window, fading in the sun.' },
      melissa: { en: 'Melissa Ong is charged with abetting arson and culpable homicide. Sinar Heritage issues a statement before she reaches the lock-up: she acted alone, and has been dismissed.' },
      shahrul: { en: 'Shahrul Nizam is charged with arson and culpable homicide. In the van he asks, in the soft Malay of Kedah, whether the old man suffered. "Orang tua tu tak patut ada kat situ." The old man was not supposed to be there.' },
    },
    correct: ['melissa', 'shahrul'],
  },

  flagNames: ['MELISSA_FREE', 'SHAHRUL_FREE', 'KENNY_WRONGED', 'CHEAH_WRONGED', 'BODY_NAMED', 'BODY_WRONG', 'GOH_BOX_FOUND'],
  flags: ({ charged, answers }) => ({
    MELISSA_FREE: !charged.includes('melissa'),
    SHAHRUL_FREE: !charged.includes('shahrul'),
    KENNY_WRONGED: charged.includes('kenny'),
    CHEAH_WRONGED: charged.includes('cheah'),
    BODY_NAMED: answers.xray === 'weijie',
    BODY_WRONG: answers.xray !== 'weijie',
    // the GOH 2021 carton turns up only if the man who carried it is arrested before it can be collected
    GOH_BOX_FOUND: charged.includes('shahrul'),
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  ending(v) {
    const right = CASE03.outcomes.correct.every((id) => v.has(id));
    const named = v.answers.xray === 'weijie';
    let joLine;
    if (right && !v.has('kenny') && !v.has('cheah')) joLine = 'He unplugged everything. Every night. Now somebody has written it down.';
    else if (v.has('kenny')) joLine = 'They took Kenny. He used to carry me on his shoulders down Lebuh Chulia at Chap Goh Meh. I keep waiting to feel something more than tired.';
    else if (v.has('cheah')) joLine = 'Auntie Cheah gave Ah Kong a discount on a coffin in 2015, as a joke, when he turned sixty-five. They laughed for a week. That was before the wall.';
    else joLine = 'They say it is finished. It does not feel finished.';

    const panels = [
      { img: 'c3_out_01_arrest', mood: 'police', fx: ['rain', 'siren'], place: 'IPD Timur Laut, George Town. Monday, 5:10 AM.', music: 'resolution',
        lines: v.charged.map((id) => ({ who: null, en: CASE03.outcomes.charged[id].en })) },
      { img: 'c3_out_02_jo', mood: 'day', fx: ['dust'], place: '96 Lebuh Chulia. Monday afternoon.',
        lines: [
          { who: null, en: 'Bomba amends its report before lunch. Deliberate ignition at the rear of the premises. The words "old wiring" are taken out.' },
          { who: 'Jo Lim', en: joLine },
          { who: null, en: 'Kenny\'s half of No. 96 goes to his creditors. His creditors sell it to Sinar Heritage within the month.', when: (f) => f.KENNY_WRONGED },
          { who: null, en: 'The shutters of No. 94 stay down. A leasing agent from Gurney Drive pins a card to them.', when: (f) => f.CHEAH_WRONGED },
          { who: null, en: 'A Sinar Heritage envelope arrives for the estate: a condolence card and a better offer. Jo leaves both on her drawing board, unopened. By Friday the hoarding has been moved, so that it wraps around No. 96 on both sides.', when: (f) => f.MELISSA_FREE },
          { who: null, en: 'The hoarding stays where it is. Work on The Chulia is suspended "pending a review". Nobody from Sinar Heritage comes to Uncle Lim\'s funeral.', when: (f) => !f.MELISSA_FREE },
          { who: null, en: 'In the project folder, one more scan Jo had not opened: a customs clearance for The Chulia\'s imported "fittings", forty crates, stamped in Sandakan. Officer: N. SALLEH.', when: (f) => f.NORHAYATI_FREE },
        ] },
    ];

    if (v.has('shahrul')) {
      panels.push({ img: 'c3_out_03_box', mood: 'day', fx: [], place: 'Bagan Luar, Butterworth. Monday, 7:30 AM.',
        lines: [
          { who: null, en: 'Under the bed in Shahrul\'s rented room: a carton marked GOH 2021 in Uncle Lim\'s capitals. Fourteen plaster jaws, each wrapped in a page of the Kwong Wah Yit Poh.' },
          { who: null, en: 'He was told a man would collect it at the ferry terminal on Monday morning. Nobody came. Somebody heard about the arrests first.' },
          { who: null, en: 'Farah drives it to Kuala Lumpur herself, the carton on the passenger seat with the seatbelt across it.' },
        ] });
    } else {
      panels.push({ img: 'c3_out_03_skip', mood: 'day', fx: ['dust'], place: 'Lebuh Chulia. Saturday, 6:00 AM.',
        lines: [
          { who: null, en: 'At dawn the hotel site\'s skip is lifted onto a lorry and driven across the bridge.' },
          { who: null, en: 'Whatever was in Uncle Lim\'s carton went with it, or went somewhere else first. Nobody will ever say which.' },
          { who: null, en: 'Rizal Hamdan transfers Shahrul Nizam to a site in Johor Bahru, with a week\'s notice and a good reference.', when: (f) => f.RIZAL_FREE },
        ] });
    }

    if (named) {
      panels.push({ img: 'c3_out_04_grave', mood: 'day', fx: [], place: 'Cheras, then Butterworth. Three weeks later.', music: 'memory',
        lines: [
          { who: null, en: 'The coroner\'s court amends a 2021 finding in eleven minutes. Henry Goh\'s certificate is struck out. Uncle Lim\'s order book is entered in its place.' },
          { who: null, en: 'At Cheras, the grave with Daniel\'s name on it is opened at dawn. You stand at the back. Farah stands beside you and says nothing, which is the kindest thing she has ever done for you.' },
          { who: null, en: 'Ong Wei Jie crosses to Butterworth on the morning ferry, the way he crossed to work for eight years.' },
          { who: 'Madam Ong', orig: 'Wa e kiann tng lai liao.', en: 'My son has come home.' },
          { who: null, en: 'At closing she sets out one glass of teh, not two.' },
          { who: null, en: 'In Cheras there is now a grave with Daniel\'s name on it and nobody in it. Nobody asks you what that means. You do not ask yourself.' },
        ] });
    } else {
      const wrongLine = {
        daniel: 'Farah files your answer. It changes nothing. It was already the answer.',
        worker: 'Farah writes "possibly an unidentified foreign national" in the margin of a closed file. Nobody reads margins.',
        forged: 'Farah asks who would forge an X-ray of a jaw that was never there, and then cast it in plaster. You do not have an answer.',
      }[v.answers.xray] || 'The 2021 file stays closed.';
      panels.push({ img: 'c3_out_04_stall', mood: 'day', fx: [], place: 'Butterworth ferry terminal. Three weeks later.', music: 'memory',
        lines: [
          { who: null, en: 'The X-ray goes back in your drawer. The 2021 file says what it has always said.' },
          { who: null, en: wrongLine },
          { who: null, en: 'At closing, Madam Ong wipes the same table and sets out two glasses of teh. One for her. One for whoever comes.' },
          { who: null, en: 'The poster stays on the noticeboard for another monsoon.' },
        ] });
    }

    panels.push({
      img: 'c3_out_05_kancil', mood: 'night', fx: ['rain'], place: 'Brickfields. Friday, 11:40 PM.', music: 'memory',
      lines: [
        { who: null, en: 'Under your office door, on the mat: a paper kancil.' },
        { who: null, en: 'It is folded from a Penang ferry ticket. Butterworth to George Town, one adult, dated the morning you left.' },
        { who: null, en: 'Nothing else.' },
      ],
    });
    return panels;
  },
};
