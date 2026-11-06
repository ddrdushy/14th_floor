// CASE 11: THE GATE. The coroner's court, Shah Alam; the old Sinar yard under Bukit Jugra; Banting; FRIM, Kepong;
// Butterworth. Monday 1 to Thursday 4 February 2027; ending panel Friday 5 February (the eve of the new year), 2:10 AM.
// Truth (writers only): ATTEMPTED MURDER BY POISON, during an inquest into a 1986 drowning.
// 1 Dec 1986, 2:10 AM: Teoh Ah Chuan, 52, drowned in his own Bedford lorry, BCK 210, at the washing ramp of his yard on
// the Sungai Langat, at high spring tide. The man who drove for him (from Kuala Lumpur in 1985; nameless, "the driver")
// held the cab door shut under the water while Muthu, his kelindan since November, held the torch on the bank. Across the
// yard he said "Jangan tengok belakang" to Muthu (NARRATED, never voiced). Siew Yang, 15, saw two figures from the office
// window and heard the words. The watch stopped at 2:10. At 3 AM the driver, wet to the knees, came to Teoh Ah Kow's door
// with the watch: "Your debts are finished. Tell them it was the brakes." He gave Ah Kow the watch to hold, and took it
// back: "I will keep the time." Ah Kow identified the body, said brakes, signed the yard and the lorry to "Sinar
// Pengangkutan", and on the driver's behalf paid Corporal Tarmizi of Balai Jugra RM 2,000 to write "kemalangan" (paid
// again in 1987). In 1987 Tarmizi tore out the page of the driver's handwritten statement that carried his name and IC
// number and gave it to Ah Kow to burn; he kept his carbon of the rest in a police document tin. The district's own file
// was retyped in 1987 (3:00 AM, attendant asleep, brakes failed) and lost the name page too.
// 2027: Hamidah's inquest, Mon 1 to Thu 4 Feb. Mon night Wei Liang (Ah Kow's grandson, 22) steals Siew Yang's 1986
// sketchbook from her shop in Butterworth (told to burn it; kept it to sell). Tue: Pak Itam; Tarmizi ("I wrote
// 'accident'..."); 4:40 PM the court recording cut into five by the recording clerk, paid by Sinar's counsel Shamir Kassim;
// 9:10 PM Tarmizi rings Ah Kow: "Esok saya cakap semua. Termasuk awak." Wed: 9:20 Shamir in the witness room with money;
// 9:28 Asri refuses Ridzuan's flask; 9:3x Ah Kow buys two teh at the canteen, stirs crushed kecubung seeds (datura, from
// the shrub behind his terrace in Banting) into one; 9:34 carries the tray; 9:36 Sjn. Asri takes it in without looking
// (his only part; he is not a suspect here); 9:40 Tarmizi drinks; 10:05 collapse, delirium. He lives.
// The culprit: Teoh Ah Kow, on the Office of the Chairman's printed order ("The corporal first. Then the girl's book.")
// and for himself. Red herrings: Ridzuan Tarmizi (the money, the deleted voice notes, a flask), Teoh Siew Yang (hatred, a
// flask), Shamir Kassim (in the room at 9:20, the cut recording; guilty of tampering and offering money, not of poison).
// The second question: what happened at Jugra at 2:10 AM on 1 December 1986? The man who drove for Teoh held the cab door
// shut under the water, while Muthu held the torch.
// The Chairman: NOT named, NOT seen. Private note: his identity is still undecided. Only the Case 11 facts of the season
// plan's section 3 are told here. Whether the 1986 driver and the voice on the telephone are one man is not settled.
// Candidate protection (plan section 1, rule 5): nothing here gives Bala Anne, Uncle Wong, Tan Sri Azhar or Pak Itam a
// hand, a height, a habit, a family, a throat, or anything they did in 1985 to 1987 beyond what the plan writes for Pak
// Itam (watchman since 1985; asleep on toddy that night; saw the driver's face every day in 1986 and not since 1987).

// Daniel by Case 7's rules (plan section 2). From Case 9 on he is free in every branch.
const WAS_HELD = (f) => (!!f.DANIEL_TAKEN || !f.DANIEL_FOUND) && !f.ARCHIVE_SEIZED; // he rode hooded in the back seat on 1 Dec
const DNAA = (f) => !!f.DANIEL_CHARGED; // his charge was withdrawn as a discharge not amounting to acquittal

// Every evidence photo uses the placeholder hotspot until the art exists; real hotspots come after the art.
const HOT = () => ({ x: 0.5, y: 0.5, r: 0.12 });

// The line the splice tape restores: it must stay word for word the same as in the opening.
const TARMIZI_LINE = { who: 'Tarmizi Hassan', orig: 'Saya tulis kemalangan. Empat puluh tahun saya tulis kemalangan.', en: 'I wrote "accident". For forty years I have been writing "accident".' };

const NIGHT = [
  { id: 'brakes', label: 'The brakes failed, and Teoh Ah Chuan drowned in his own lorry', note: 'The finding of 1986.' },
  { id: 'held', label: 'The man who drove for Teoh held the cab door shut under the water, while Muthu held the torch', note: 'A girl at a window, a bent handle, a drawing.' },
  { id: 'brother', label: 'Teoh Ah Kow let the handbrake off, for his debts', note: 'He identified the body and took the money.' },
  { id: 'suicide', label: 'Teoh drove into the river himself', note: 'A man with debts, at the bottom of his own yard.' },
];

export const CASE11 = {
  id: 'case11',
  number: 11,
  title: 'The Gate',
  place: 'Shah Alam, Jugra and Butterworth',
  victim: 'Tarmizi bin Hassan, 66, retired police corporal. Poisoned in the witness room of the Shah Alam coroner\'s court at 9:40 AM on Wednesday, before he could give evidence. Alive.',
  question: 'Who poisoned Corporal Tarmizi?',
  brief: 'In December 1986 a lorry owner called Teoh Ah Chuan drowned in his own lorry at the bottom of his own yard, and a corporal called it an accident in eleven minutes. Forty years later the coroner has opened the file again. On the second day the corporal said, in the witness box, that he had written \'accident\' for forty years. On the third day, before he could say why, somebody put something in his tea.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end: who poisoned the corporal, and what happened at the Jugra yard at ten past two on 1 December 1986. The coroner will write one finding, once. Nobody will tell you if you get either right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Siew Yang sent a photograph of the gate at Jugra, the pink sun in the rain, and no message.',
  deduction: {
    lede: 'The coroner cannot charge anyone; Hamidah can. She will charge whoever you name with the attempted murder of Tarmizi Hassan. Name everyone who poisoned him, and only them.',
    button: 'Tell Hamidah',
    confirm: 'Hamidah will charge {names}. Siew Yang will hear it from the gallery, before you can tell her yourself.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Hamidah',
    questions: [
      {
        id: 'night', q: 'What happened at Jugra at 2:10 AM on 1 December 1986?', short: 'The coroner finds',
        lede: 'The coroner will write one finding into a file that was closed in eleven minutes. It will not be opened a third time.',
        options: NIGHT,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy in cases.js).
  suspects: [
    {
      id: 'yang', name: 'Teoh Siew Yang', role: 'Sign painter, Bagan Luar, Butterworth. Teoh Ah Chuan\'s daughter, the applicant. 55', img: 'sus_yang',
      revealedBy: 'c11_03',
      revealLine: 'She brought a flask to court, and she has hated the word \'accident\' for forty years.',
      look: { skin: '#e3bf9c', hair: 'short', hairColor: '#8f8f8f', coat: 'batik', eyewear: 'none', mark: 'none' },
      motive: 'Forty years of being told she dreamed it. The man who wrote "accident" on her father\'s file was three doors from her in the corridor all week.',
      claim: 'Says she sat in the front row of the gallery with her flask of kopi from 9:15 on Wednesday and never left her seat.',
    },
    {
      id: 'shamir', name: 'Shamir Kassim', role: 'Advocate & solicitor, Kuala Lumpur. Sinar\'s counsel on a watching brief. 44', img: 'sus_shamir',
      revealedBy: 'c11_05',
      revealLine: 'The court\'s recording was cut into five at 4:40 on Tuesday. The clerk says he was paid by a lawyer.',
      look: { skin: '#c48b62', hair: 'side-part', hairColor: '#151210', coat: 'blazer', eyewear: 'square', mark: 'none' },
      motive: 'Sinar pays him to sit at the bar table and make sure the inquest finds nothing. A corporal who had started to remember was the worst thing that could happen to his week.',
      claim: 'Says he looked into the witness room at 9:20 only to tell the corporal the court would sit late, and was robing by 9:22.',
    },
    {
      id: 'ahkow', name: 'Teoh Ah Kow', role: 'Teoh Ah Chuan\'s younger brother. Retired, Banting. 74', img: 'sus_ahkow',
      revealedBy: 'c11_06',
      revealLine: '\'Paid RM 2,000. Through T.A.K.\' Three initials in a corporal\'s tin.',
      look: { skin: '#e6c4a2', hair: 'short', hairColor: '#d6d6d6', coat: 'batik', eyewear: 'round', mark: 'none' },
      motive: 'None known. He identified his brother\'s body in 1986, and he has sat beside his niece every day of the inquest with his prayer beads.',
      claim: 'Says he never left the gallery on Wednesday morning, and had never met the corporal before Tuesday.',
    },
    {
      id: 'ridzuan', name: 'Ridzuan Tarmizi', role: 'Tow-truck operator, Banting. The corporal\'s son. 38', img: 'sus_ridzuan',
      revealedBy: 'c11_09',
      revealLine: 'A thousand ringgit a month from Sinar since 1987, and the house it built is in his name.',
      look: { skin: '#b07a52', hair: 'short', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'stubble' },
      motive: 'If his father tells the court where the family\'s money came from, the house it built may not stay in his name.',
      claim: 'Says he gave his father his breakfast himself on Wednesday morning, the family\'s own teh from the family flask.',
    },
  ],

  opening: [
    {
      img: 'c11_intro_01_steps', mood: 'day', fx: [], place: 'Shah Alam court complex. Monday 1 February, 8:40 AM.', music: 'office',
      lines: [
        { who: null, en: 'Twenty to nine on a Monday at the Shah Alam courts: lawyers in black, families on the steps with plastic bags of food, and at the top of them, Hamidah Yusof with her flask of teh and her hair still wet.' },
        { who: 'Hamidah Yusof', en: 'Third court this season, detective. This one is forty years old.' },
        { who: null, en: 'The coroner sits in Court 3 for four days, on an application Hamidah signed herself. The death of Teoh Ah Chuan, lorry owner, of Jugra, on 1 December 1986. Cause on the file: kemalangan. Accident. Time taken to decide it: eleven minutes.' },
        { who: null, en: 'A police car stops at the foot of the steps. Out of it, between two constables, comes a thin old man in a pressed shirt, holding a folder to his chest like a schoolboy: retired Corporal Tarmizi Hassan, who wrote the word. Farah\'s sergeant, Asri, walks at his elbow.' },
        { who: 'Inspector Farah Iskandar', en: 'No stick. Back on duty, back on my feet. I asked for Asri on the witness room. In four years he has never once been late.' },
        { who: null, en: 'In the corridor outside Court 3 the old corporal stops in front of you, as if he has waited a long time to say it to somebody who is not from Jugra.' },
        TARMIZI_LINE,
      ],
      kb: { from: [1.06, 0, 2], to: [1.0, 0, -1] },
    },
    {
      img: 'c11_intro_02_gallery', mood: 'day', fx: ['dust'], place: 'Court 3, the public gallery. 9:30 AM.',
      lines: [
        { who: null, en: 'In the front row of the gallery a woman of fifty-five sits with paint dried on her forearms and a tin of brushes on her knee, as if she might be asked to paint something: Teoh Siew Yang, the applicant, the dead man\'s daughter, down from Butterworth.' },
        { who: null, en: 'When the clerk reads her father\'s name she says something to nobody, in Hokkien.' },
        { who: 'Teoh Siew Yang', orig: 'A-pa bo tng lai.', en: 'Father didn\'t come home.', lang: 'zh-hokkien' },
        { who: null, en: 'Beside her, an old man in a white shirt turns a string of prayer beads: her uncle, Teoh Ah Kow, the dead man\'s younger brother, who identified the body in 1986 and has come to sit beside her every day.' },
        { who: 'Teoh Ah Kow', en: 'Sit, Siew Yang. Forty years you waited. You can wait one more minute.' },
        { who: null, en: 'Daniel sits in the row behind them with the coroner\'s cause list in his hands, and folds nothing.' },
        { who: null, en: 'He sleeps with the light on now, since the back seat of the car. In court he sits where he can see the door.', when: WAS_HELD },
        { who: 'Daniel Raj', en: 'They kept this file shut for forty years, machan. Mine they only closed in December, and they can open it again any morning they like.', when: DNAA },
      ],
      kb: { from: [1.0, -1, 0], to: [1.1, 1, 0] },
    },
    {
      img: 'c11_intro_03_ramp', mood: 'night', fx: ['rain'], place: 'The Jugra yard. 1 December 1986, 2:10 AM.', music: 'memory',
      lines: [
        { who: null, en: 'A girl of fifteen asleep on a camp bed in her father\'s yard office wakes to a lorry engine at ten past two in the morning, and goes to the window.' },
        { who: null, en: 'A torch on the bank of the river, held up high. The tail lights of a lorry going down the washing ramp into black water, and under.' },
        { who: null, en: 'Two figures. One on the bank, holding the light. One in the water at the cab door, with his back to her.' },
        { who: null, en: 'Across the yard a man\'s voice said: "Jangan tengok belakang."' },
        { who: null, en: 'In the morning her uncle told her she had dreamed it. She was fifteen. She believed him for forty years, nearly.' },
      ],
      kb: { from: [1.12, 0, -1], to: [1.0, 0, 1] },
    },
    {
      img: 'c11_intro_04_gate', mood: 'day', fx: ['dust'], place: 'Jugra. Monday, 3:30 PM.', music: 'tension',
      lines: [
        { who: null, en: 'The coroner\'s site visit: three cars on a laterite track under Bukit Jugra, the lighthouse on the hill above, oil palm on both sides, and at the end of the track a gate with a sun painted on it. Pink, faded, forty-one years old.' },
        { who: null, en: 'Pak Itam, the watchman, opens the gate for the coroner without a word, his keys on their string, and stands aside looking at the ground.' },
        { who: null, en: 'Inside: laterite and weeds, a lorry shed with no lorry in it, a hut by the gate, and at the bottom of the yard the concrete washing ramp running down into the brown Langat. Still there. Still wet.' },
        { who: 'Pak Itam', orig: 'Air tengah pasang, tuan. Jangan dekat.', en: 'The tide is coming in, sir. Don\'t go near.' },
        { who: null, en: 'Siew Yang puts her hand flat on the painted sun, the way you would put a hand on a horse.' },
      ],
      kb: { from: [1.0, 2, 0], to: [1.12, -1, 0] },
    },
    {
      img: 'c11_intro_05_exhibits', mood: 'day', fx: [], place: 'Court 3, the exhibit table.',
      lines: [
        { who: null, en: 'On the exhibit table the clerk lays out what forty years have left: a police file of four typed pages, a lorry\'s registration card, and a photograph of a wristwatch stopped at ten past two, from a thief\'s telephone in Melaka.' },
        { who: 'Hamidah Yusof', en: 'Every exhibit on that table came from somebody who was told to burn it.' },
        { who: null, en: 'In Cheras a headstone says Ong Wei Jie now. Siew Yang knew the family: a ferry engineer\'s boy from Bagan Luar, three streets from her shop.', when: (f) => f.BODY_NAMED },
        { who: null, en: 'Exhibit P7: a cancelled promissory note from Melaka, 2 December 1986, with two thumbprints on it, in the plastic sleeve that was taped under an iron grille on St. Paul\'s Hill.', when: (f) => f.NOTE_FOUND },
        { who: null, en: 'Exhibit P9: an affidavit sworn in Singapore General Hospital by Arthur Seah, eighty-two, about a man in the back of a car who would not cross the water.', when: (f) => f.ARTHUR_FOUND },
        { who: null, en: 'Leaning against the leg of the exhibit table, a rusted lorry plate: BCK 210, with a small sun painted in its corner.', when: (f) => f.TAIL_TRACED },
        { who: null, en: 'The plate BCK 210 is still on your office wall in Brickfields. The coroner has asked for a photograph of it, and has it.', when: (f) => f.TAIL_LOST },
        { who: null, en: 'In the back row, in plain clothes and without a notebook: Superintendent Khairul, "observing".', when: (f) => f.KHAIRUL_FREE },
      ],
      kb: { from: [1.0, 0, 0], to: [1.14, 0, 1] },
    },
    { title: { kicker: 'Case 11', name: 'The Gate' }, fx: ['dust'] },
  ],

  levels: [
    // ---------------- Day one ----------------
    {
      id: 'c11_01', phase: 'Day one', title: 'The file of 1986',
      game: 'wordsearch', variant: 'secret',
      brief: 'Exhibit P1 is the police file of 1986 as the district kept it: four typed pages and an index sheet, in Malay, retyped in 1987 by a clerk who used a ruler for everything. While counsel argue about chairs, the coroner\'s clerk lets you sit with it at the end of the bar table. Find every word the index lists. The letters nobody used are what the index forgot to say.',
      params: {
        size: 12,
        words: ['KEMALANGAN', 'KELINDAN', 'KOPERAL', 'LAPORAN', 'LANGAT', 'SUNGAI', 'PASANG', 'JUGRA', 'BALAI', 'MAYAT', 'SAKSI', 'LORI', 'BREK'],
        extra: ['SIASAT', 'TAPAK', 'MALAM', 'PINTU', 'LAMPU', 'TANAH', 'TUBUH', 'BUKIT', 'SULUH', 'RODA', 'AIR', 'JAM'],
        message: 'NAMEPAGEMISSING',
        messageSpaced: 'NAME PAGE MISSING',
      },
      evidence: {
        img: 'ev_c11_index', hotspot: HOT(),
        title: 'Name torn out',
        short: 'Report 41/86, Balai Polis Jugra: Corporal T. Hassan at the yard at 6:02 AM, "kemalangan" entered at 6:13. Eleven minutes. The index lists a statement by "pemandu", the driver, pages 1 to 3. Page 1, the one a statement form keeps a name and an identity card number on, has been gone since 1987.',
        text: 'Four typed pages and one index sheet, everything in the same flat 1987 typewriter, ruled with a pencil. Report 41/86, Balai Polis Jugra. Death of Teoh Ah Chuan, 52, lorry owner, by drowning, at his yard, Jugra. The corporal of the day, T. Hassan, arrived at 6:02 AM and wrote "kemalangan" at 6:13: an accident, in eleven minutes, while the lorry was still in the river. Body identified by the brother, Teoh Ah Kow. Attendant asleep. Brakes failed. Then the index, item by item, and item 4: "Kenyataan pemandu, 3 muka surat." A statement by the driver, three pages. Pages 2 and 3 are in the file. Page 1, the page on which a 1986 statement form asks for the man\'s full name and identity card number, is not, and in the margin a clerk has pencilled one word with a date: "tiada, 1987". None. Hamidah reads it over your shoulder. "They did not lose his name," she says. "Somebody took it out with a ruler."',
      },
    },
    {
      id: 'c11_02', phase: 'Day one', title: 'Rolled back into shallow water',
      game: 'series', variant: 'classic',
      brief: 'The file says the lorry\'s brakes failed and it "rolled back into shallow water". Hamidah has brought the coroner three things the corporal never asked for in 1986: the Port Klang tide tables for that week, the lorry\'s own logbook, and a surveyor\'s drawing of the ramp made for the site visit. The coroner\'s assessor, a retired marine engineer, reads numbers the way other men read faces. Finish his runs.',
      params: {
        items: [
          { prompt: 'Highest spring tide at Kuala Langat each night, the last week of November 1986, centimetres above datum: 265, 277, 289, ?', answer: 301, hint: 'Twelve more each night, up to the top of the springs on 1 December.' },
          { prompt: 'The same tide every ten minutes from 1:30 AM on 1 December 1986: 291, 295, 298, 300, ? (the reading at 2:10)', answer: 301, hint: 'It rises four, then three, then two: the next rise is one. High water.' },
          { prompt: 'Depth of water over the ramp at that tide, centimetres, every metre down from the edge: 50, 100, 150, 200, 250, ? (the foot of the ramp)', answer: 300, hint: 'Half a metre deeper with every metre down. Three metres at the foot.' },
          { prompt: 'BCK 210\'s odometer at the end of each night\'s run, the last week of November: 61204, 61300, 61396, 61492, ?', answer: 61588, hint: 'Ninety-six kilometres a night: Jugra to Port Klang and back.' },
          { prompt: 'BCK 210\'s JPJ brake test, November 1986, stopping distance in metres at 20, 30, 40 and 50 km/h: 6, 11, 18, 27, ? (at 60)', answer: 38, hint: 'The gaps grow by two: five, seven, nine, eleven.' },
          { prompt: 'Tyre marks on the ramp in the 1986 Bomba photograph, measured from the shed, metres: 4, 9, 14, 19, ? (where they go into the water)', answer: 24, hint: 'Five metres between each mark. The marks run downhill, front wheels first.' },
        ],
      },
      evidence: {
        img: 'ev_c11_tide', hotspot: HOT(),
        title: 'Three metres of water',
        short: 'At 2:10 AM on 1 December 1986 the Langat stood at the highest spring tide of the year: three metres over the foot of the ramp. BCK 210 had passed its brake test in November. Its last night\'s run ended at 61,588 km, and the Bomba photograph shows tyre marks running front first from the shed into the river. It did not roll back into shallow water. It was driven into deep water.',
        text: 'The marine engineer lays his numbers out for the coroner like a man laying out a body. The highest tide of the year at Kuala Langat came on the night of 30 November to 1 December 1986, and it stood at its top at ten past two: three metres and a centimetre over the datum, three metres of brown water over the foot of the ramp. The brakes passed JPJ in November with distances a new lorry would be proud of. The odometer says the lorry came home from Port Klang that night as it did every night, and the Bomba photograph of 6 AM shows the rest: tyre marks in the wet laterite from the shed door to the top of the ramp, front wheels first, pressing in harder where somebody put his foot down. "Shallow water," the engineer reads from the file, and takes his glasses off. "There is no shallow water at that ramp at two in the morning on a spring tide, Puan Coroner. And a lorry that rolls back goes in backwards. This one went in nose first, under its own engine."',
      },
    },
    {
      id: 'c11_03', phase: 'Day one', title: 'The applicant',
      game: 'witness', variant: 'statement',
      brief: 'Teoh Siew Yang gives her evidence on Monday afternoon with a flask of kopi on the bench beside her, because the canteen is too sweet, she says, and she is not going anywhere until the coroner writes it down. You are in the second row. You get it once, as the court does.',
      params: {
        readSeconds: 110,
        pass: 7,
        header: 'Evidence of Teoh Siew Yang, 55, sign painter, Bagan Luar, Butterworth. Court 3, Shah Alam. Day one, Monday, 2:30 PM.',
        introLine: 'Siew Yang puts her tin of brushes on the ledge of the witness box, where she can see it. "One time. I have waited forty years to say it one time."',
        retryLine: 'She closes her eyes and says it again, the same words in the same order, like a sign she has painted a hundred times.',
        statement: [
          'My father was Teoh Ah Chuan. He had one lorry, a Bedford, BCK 210, and a yard under Bukit Jugra, and he hauled palm oil to Port Klang and up to Butterworth. In 1985 a man came from Kuala Lumpur to drive for him. He spoke Hokkien to my father, better than my uncle does. In November 1986 my father took on a Tamil man of about thirty called Muthu to ride with them, as the kelindan.',
          'The year before, when I was fourteen, I painted a sun on the gate. Pink, because pink was the paint left over from a sign for a kopitiam. My father was angry for one day. The driver stood and looked at it for a long time, and said that would be the name of the company. Later it was.',
          'On the last night of November I slept in the yard office on the camp bed, because my father was taking the lorry out at two for the morning ship at Port Klang, and I wanted to ride with him as far as Banting. At ten past two the engine woke me. I know it was ten past two because the office clock was over my bed, and it had a light in it.',
          'I went to the window. There was a torch on the bank by the washing ramp, held up high. The lorry was going down the ramp into the river, front first, and the water was very high, it was a big tide. It went under. A man was in the water at the cab door, only his head and shoulders out, with his back to me. The torch did not move. Then across the yard a man\'s voice said: jangan tengok belakang. Don\'t look back. I do not know which of them said it. I did not see a face. I saw a back and a light.',
          'In the morning my uncle came. He said my father\'s brakes had failed and the lorry rolled back into the river, and that I had slept the whole time and dreamed it. I was fifteen. I believed him for forty years, nearly.',
        ],
        questions: [
          { q: 'What was her father\'s lorry?', options: ['A Bedford, BCK 210', 'A Mercedes, BCK 120', 'A Nissan, BCK 210', 'A Bedford, BKC 201'], a: 0 },
          { q: 'Where did the driver come from?', options: ['Melaka', 'Kuala Lumpur', 'Penang', 'Klang'], a: 1 },
          { q: 'What colour did she paint the sun?', options: ['Yellow', 'Red', 'Pink', 'Gold'], a: 2 },
          { q: 'How old was she when she painted it?', options: ['Twelve', 'Fourteen', 'Fifteen', 'Sixteen'], a: 1 },
          { q: 'Why was she sleeping in the yard office?', options: ['She had run away from home', 'Her father was taking the lorry out at two', 'The house had flooded', 'She was minding the gate'], a: 1 },
          { q: 'How does she know it was ten past two?', options: ['Her father\'s watch', 'The office clock over her bed', 'The radio', 'The temple bell'], a: 1 },
          { q: 'Which way did the lorry go into the river?', options: ['Backwards', 'Front first', 'Sideways', 'It stopped on the ramp'], a: 1 },
          { q: 'What did she see in the water?', options: ['Her father climbing out', 'A man at the cab door, with his back to her', 'Two men swimming', 'Nothing; it was too dark'], a: 1 },
          { q: 'What did her uncle tell her in the morning?', options: ['To go back to school', 'That she had dreamed it', 'That the driver had run away', 'To say nothing to the police'], a: 1 },
        ],
      },
      evidence: {
        img: 'ev_c11_window', hotspot: HOT(),
        title: 'Two men on the ramp',
        short: 'Siew Yang, fifteen, at the yard office window at ten past two: the lorry going front first into a high tide, a torch held up on the bank, and a man in the water at the cab door with his back to her. Across the yard, a man\'s voice: "Jangan tengok belakang." Her uncle told her she dreamed it. She painted the sun on the gate in 1985, and the driver named the company after it.',
        text: 'She tells it without once looking at the gallery, where her uncle sits with his beads. Two men, and neither of them her father, who was in the cab. One on the bank with the torch up and steady, the way you hold a light for somebody who is working. One in the water at the driver\'s door, his head and shoulders out, his back to the window, not swimming, not moving, holding on. Then the words, across the whole yard, in a voice that was not shouting: don\'t look back. The coroner asks her which of the two men said it, and she says she has asked herself that every night since she was fifteen. The sun on the gate was hers before it was anybody\'s; the driver looked at it a long time and said that would be the name of the company, and a year later it was. Sinar. A ray of the sun. When she steps down she picks up her brushes, and her flask of kopi, and walks back to the front row, and sits two seats further from her uncle than she did in the morning.',
      },
    },

    // ---------------- Jugra ----------------
    {
      id: 'c11_04', phase: 'Jugra', title: 'The hut by the gate',
      game: 'hiddenobject', variant: 'silhouette',
      brief: 'While the coroner walks the ramp with her clerk and an umbrella, Pak Itam gives you the shade of his hut, a glass of water, and his back: he goes and stands by the gate. One room of planks and zinc, a table, a bed, a calendar, forty years of keys and tins and string. Farah says that a watchman\'s hut is where everything a yard ever lost ends up. Find everything. The list shows only outlines.',
      params: { scene: 'desk', targets: 13, objects: 74 },
      evidence: {
        img: 'ev_c11_cabdoor', hotspot: HOT(),
        title: 'A cab door in the wall',
        short: 'The back wall of the hut is not a wall: under six or seven coats of green paint it is the driver\'s door of a Bedford lorry cab, window wound up and painted over. Its inside handle is bent outward, the steel stretched, as if somebody outside held the door shut against somebody inside pulling to open it. Under the green, the cab\'s old cream. On a nail beside it, an old gate key.',
        text: 'You only see it because the afternoon sun comes through a gap in the zinc and lies along a seam that is too straight for planks. The hut\'s back wall is a door. Under the green paint, six or seven coats of it, is the driver\'s door of a Bedford cab, hinges and all, set into the planks as if it had always been there, its window wound up and painted over. Farah scrapes a thumbnail at the bottom edge and finds the cream that old Bedfords were sprayed in the factory, and the JPJ card for BCK 210 on the exhibit table says cream. Then she opens the door the wrong way, from inside the hut, and you both look at the handle. The inside handle is bent outward, the steel stretched thin at the root, the way a handle bends when a man inside pulls on it with everything he has and a man outside holds the door shut against him. On a nail beside it hangs an old gate key, heavier than the ones on Pak Itam\'s string, rusted the colour of laterite. Asked where his wall came from, Pak Itam answers in a pantun: "Kalau ada sumur di ladang, boleh kita menumpang mandi; kalau ada umur yang panjang, boleh kita berjumpa lagi." If there is a well in the field we may bathe there; if there is a long life left, we may meet again. Then he goes back to the gate.',
      },
    },

    // ---------------- Day two ----------------
    {
      id: 'c11_05', phase: 'Day two', title: 'Every word still there',
      game: 'tape', variant: 'splice',
      brief: 'On Tuesday afternoon the corporal said it in the box, and the gallery heard it. At half past five Hamidah asks the court for the afternoon\'s recording, to prepare her questions for the morning, and the file the recording clerk sends her plays like a man talking in his sleep. It was saved again at 4:40 PM, under the clerk\'s own login. Put the pieces back in order.',
      params: {
        line: TARMIZI_LINE,
        pieces: 5,
        label: 'MAHKAMAH KORONER · HARI 2 · 16:40',
        clue: 'Every word is still there. Somebody only changed the order.',
      },
      evidence: {
        img: 'ev_c11_recording', hotspot: HOT(),
        title: 'Cut at 4:40',
        short: 'Spliced back: Tarmizi in the box on Tuesday, "Saya tulis kemalangan. Empat puluh tahun saya tulis kemalangan." Then: "In 1987 I tore out the page with his name on it. The rest I kept." The recording was cut into five and re-saved at 4:40 PM under the recording clerk\'s login. He says a lawyer paid him to tidy the afternoon. On his desk, a business card: Shamir Kassim, watching brief for Sinar.',
        text: 'Put back in order, the afternoon plays as the gallery heard it. The old corporal\'s voice, thin, in Malay, louder than he means it: "I wrote accident. For forty years I have been writing accident." A pause long enough for the coroner\'s pen to stop. Then the part nobody had expected, and which the cut file had scattered into five places so that it said nothing: "Pada tahun 1987 saya koyak muka surat yang ada nama dia. Yang lain saya simpan." In 1987 I tore out the page with his name on it. The rest I kept. The recording clerk, Encik Norman, twenty-six, gives up after the second question. A lawyer came to the recording room at four, he says, with RM 5,000, and asked him to tidy the afternoon so that it would be hard to quote. He does not know the lawyer\'s name. On his desk, under his keyboard, is the lawyer\'s business card: Shamir Kassim, Advocate & Solicitor, the man who has sat at the end of the bar table all week on a watching brief for Sinar Holdings. Hamidah puts the card in an envelope. "Interfering with a record of the court," she says. "I can charge that before dinner."',
      },
    },

    // ---------------- Day three ----------------
    {
      id: 'c11_06', phase: 'Day three', title: 'A tin under the bed',
      game: 'safecracker', variant: 'classic',
      brief: 'On Wednesday at one o\'clock Tarmizi Hassan is in Hospital Shah Alam, talking to people who are not in the room. His son says his father kept nothing from 1986. Hamidah has a warrant for the house in Banting by noon, and under the corporal\'s bed, behind a carton of old uniforms, is a grey police-issue document tin with a four-digit lock. His wife, Puan Khadijah, sits on the bed while you kneel beside it.',
      params: {
        digits: 4, tries: 8, bonus: 4, repeats: false,
        fixed: { 1: 1, 2: 9 },
        contains: [8, 6],
        clue: 'Puan Khadijah: "He chose it himself. He said it was the year he started telling lies. He said it every night this week, in his sleep."',
      },
      evidence: {
        img: 'ev_c11_tin', hotspot: HOT(),
        title: 'Through T.A.K.',
        short: 'In the tin: the corporal\'s carbon of the driver\'s handwritten statement of 1 December 1986, pages 2 and 3, the name page torn away at the staple; Muthu\'s statement in Tamil, two lines; and in pencil, in the corporal\'s own hand, on the back of a charge sheet: "Dibayar RM 2,000. 2.12.86. Melalui T.A.K." Paid RM 2,000, through T.A.K.',
        text: 'One, nine, eight, six, and the lid comes up with a sigh of old rubber. Inside, in a police envelope gone soft as cloth, three things a corporal of Balai Jugra kept for forty years under his bed. A carbon copy, blue on onion-skin, of a statement written by hand in Malay on the morning of 1 December 1986: pages 2 and 3, and at the staple the torn stub of page 1, the page with the name. Two lines in Tamil in a careful hand, signed with a thumb: Muthusamy a/l Perumal, kelindan, who says he was asleep and woke to shouting. And on the back of an old charge sheet, in the corporal\'s pencil, a note he wrote for nobody: "Dibayar RM 2,000. 2.12.86. Melalui T.A.K." Paid RM 2,000. 2 December 1986. Through T.A.K. Under it, in another pencil, years later: "1.12.87. Sama." The same. Puan Khadijah reads the initials over your shoulder and puts her hand to her mouth. "Teoh Ah Kow," she says. "The brother. He came to the house once, in 1987. He stood at the gate and would not come in."',
      },
    },
    {
      id: 'c11_07', phase: 'Day three', title: 'The watchman',
      game: 'witness', variant: 'statement',
      brief: 'With the corporal in hospital, the coroner leans on what was said on Tuesday, and the most important thing said on Tuesday morning was said by Pak Itam, who spoke for nine minutes and then would not speak again. The recording clerk lends you the transcript for two minutes, no more, and stands over you while you read it. Pak Itam does not like his words copied. He said so in the box.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Transcript, Court 3. Evidence of Ibrahim bin Sulong, known as Pak Itam, 74, watchman, Jugra. Day two, Tuesday, 10:15 AM. Translated from Malay.',
        introLine: 'Encik Norman holds the transcript by its corner. "Two minutes. He did not want it written down at all."',
        retryLine: 'The clerk sighs and puts the transcript back in front of you. "Two minutes. Again."',
        statement: [
          'I have kept that gate since 1985. Towkay Teoh\'s yard: one lorry, one shed, the office, the hut by the gate, the ramp down to the river. The sun on the gate the towkay\'s girl painted. Nobody has painted it again. Nobody is allowed.',
          'In 1985 a driver came from Kuala Lumpur, with one bag and a white shirt for Sundays. He drove for the towkay. He spoke Hokkien to the towkay, Tamil to the boy Muthu when Muthu came in November, Malay to the police, and English to the bank in Klang. Four tongues in one mouth, the old people in the kampung said.',
          'That night I had toddy, and I slept. I heard nothing. That is what I told the corporal, and that is what I tell the coroner.',
          'The coroner asked me about the driver\'s face. I said: I saw his face every day in 1986. I have not seen it since 1987. She asked me what it was like. I said: biasa. Ordinary. Like anybody. She asked me again. I said: if I say, the gate goes. She asked me if I was afraid. I answered her with a pantun, the one about the golden bananas and the debt you carry to the grave, and I did not explain it.',
          'The lawyer for the company asked one question: whether the sun on the gate belongs to the company. I said the sun belongs to the girl. The company only borrowed it.',
        ],
        questions: [
          { q: 'Since when has Pak Itam kept the gate?', options: ['1979', '1985', '1986', '1987'], a: 1 },
          { q: 'Who painted the sun on the gate?', options: ['The driver', 'The towkay', 'The towkay\'s girl', 'Pak Itam'], a: 2 },
          { q: 'What did the driver bring from Kuala Lumpur?', options: ['A lorry', 'One bag and a white shirt for Sundays', 'A wife and a child', 'Nothing at all'], a: 1 },
          { q: 'What did the driver speak to the bank?', options: ['Hokkien', 'Tamil', 'Malay', 'English'], a: 3 },
          { q: 'When did Muthu come to the yard?', options: ['In 1985', 'In November', 'In December', 'In 1987'], a: 1 },
          { q: 'What did Pak Itam drink that night?', options: ['Teh', 'Kopi', 'Toddy', 'Nothing'], a: 2 },
          { q: 'Since when has he not seen the driver\'s face?', options: ['1986', '1987', '2016', 'Since Tuesday'], a: 1 },
          { q: 'How did he describe the face?', options: ['Thin and dark', 'Scarred', 'Ordinary, like anybody', 'He said he never saw it'], a: 2 },
          { q: 'Who does the sun on the gate belong to, he says?', options: ['The company', 'The driver', 'The girl', 'The gate'], a: 2 },
        ],
      },
      evidence: {
        img: 'ev_c11_transcript', hotspot: HOT(),
        title: 'Every day in 1986',
        short: 'Pak Itam, on Tuesday: the driver came from Kuala Lumpur in 1985 with one bag and a white shirt for Sundays, and spoke Hokkien to the towkay, Tamil to Muthu, Malay to the police and English to the bank. "I saw his face every day in 1986. I have not seen it since 1987." Asked to describe it: "Biasa. Ordinary. Like anybody. If I say, the gate goes."',
        text: 'Nine minutes in the box, and the transcript reads like a man walking along the edge of a ramp. He kept the gate from 1985; he keeps it still. The driver came from the city with one bag, and wore the white shirt only on Sundays, and had four languages for four kinds of people: Hokkien for the man who paid him, Tamil for the man who rode beside him, Malay for the police, English for the bank. On the night itself, toddy and sleep and nothing heard, which is what he told the corporal in 1986 and what he tells the coroner now, in the same words. Then the only answer in the transcript that sounds like it cost him something: he saw the driver\'s face every day in 1986, and he has not seen it since 1987. He will not say what it looked like. Ordinary, like anybody, and if he says, the gate goes. When the coroner asked whether he was afraid, he gave her the old pantun, "Pisang emas dibawa belayar, masak sebiji di atas peti; hutang emas boleh dibayar, hutang budi dibawa mati": a debt of gold can be paid back, a debt of kindness you carry to the grave. The transcript does not say whose debt, or to whom.',
      },
    },
    {
      id: 'c11_08', phase: 'Day three', title: 'Two versions',
      game: 'spotdiff', variant: 'classic',
      brief: 'After the court rises on Wednesday, Hamidah lays two documents side by side on the coroner\'s bench under the reading lamp: the district\'s own file, retyped in 1987 by the clerk with the ruler, and the corporal\'s carbon of what the driver wrote with his own hand on the morning of 1 December 1986. They are meant to say the same thing. Find where they do not.',
      params: { differences: 9 },
      evidence: {
        img: 'ev_c11_twopages', hotspot: HOT(),
        title: 'The same hand',
        short: 'The typed file of 1987 against the 1986 carbon: "2.10 pagi" became "3.00 pagi"; "kelindan memegang lampu suluh", the attendant holding the torch, became "kelindan tidur", asleep; "pintu tidak boleh dibuka", the door would not open, became "brek gagal", the brakes failed. And the handwriting, letter for letter: the closed loop of the k, the crossed 7, the ink dragged along each line by a left hand. The hand of "Terima kasih", and of "Amended 19.8.2016".',
        text: 'Nine places where a clerk in 1987 made a carbon of 1986 say something else. The time: ten past two became three o\'clock, an hour when an attendant might reasonably be asleep. The attendant: in the driver\'s own words he was on the bank "memegang lampu suluh", holding the torch; typed, he is asleep in the shed. The cause: in the driver\'s own words "pintu tidak boleh dibuka", the door would not open, which is what a man writes who wants it understood that he tried; typed, the brakes failed, which needs nobody to have tried anything. The man on the bank with the torch, in the driver\'s own hand, was the kelindan: Muthu, who held a light for him at ten past two, was told across the yard not to look back, and drove him for forty years without once looking in the mirror. Then Hamidah moves the lamp, and you stop reading the words and look at the hand. A small, quick, slanting hand in Malay, the k with its loop closed like a knot, the 7 crossed through the stem, and on every line the ink smeared a little to the right where the side of the writing hand dragged through it before it dried. Farah lays two photographs beside the carbon from the exhibits of this season: the rules card from the boot on 1 December, with two words in ink, "Terima kasih"; and the envelope from Telok Ayer Street, "Amended 19.8.2016". The same k. The same 7. The same drag of a left hand. Nobody in the room says anything for a while.',
      },
    },
    {
      id: 'c11_09', phase: 'Day three', title: 'Two passbooks',
      game: 'ledger', variant: 'classic',
      brief: 'On Monday Ridzuan Tarmizi gave the coroner photocopies of his family\'s passbook, to show, he said, that nobody had paid his father anything. On Wednesday afternoon Hamidah\'s order brings the bank\'s own statements for two accounts: the Tarmizi family\'s, and the account of a T.A.K. in Banting. Two cells on Ridzuan\'s copies do not match the bank. Find them, and put back what they said.',
      params: {
        rows: 6, cols: 5, altered: 2, restore: true, currency: 'RM', magnitude: 'hundreds',
        rowLabels: ['T.A.K.: credit on the 2nd', 'T.A.K.: withdrawals', 'Tarmizi family: credit', 'Tarmizi family: house loan', 'Ridzuan: tow truck hire purchase', 'Tarmizi family: pension'],
        colLabels: ['Sep 26', 'Oct 26', 'Nov 26', 'Dec 26', 'Jan 27'],
        clue: 'The bank printed its statements on Wednesday at two. Ridzuan\'s photocopies were handed in on Monday morning.',
      },
      evidence: {
        img: 'ev_c11_passbooks', hotspot: HOT(),
        title: 'The morning after the first',
        short: 'Teoh Ah Kow\'s account: RM 300 credited on the 2nd of every month since January 1987, from "S.P. Jugra", later Sinar Holdings: the morning after the first. The Tarmizi family\'s: RM 1,000 a month since 1987 from the same payer, and a house in Banting built on it, in Ridzuan\'s name. The two cells Ridzuan changed are the two that named the payer.',
        text: 'Two columns of money that arrive like clockwork and have done since the year Sinar began. Teoh Ah Kow, Banting: RM 300 on the second day of every month since January 1987, four hundred and eighty-one times, from a payer the bank first wrote as S.P. Jugra, then as Sinar Pengangkutan, then as Sinar Holdings Berhad. Never on the first. Always the morning after. The Tarmizi family: RM 1,000 a month since 1987, from the same payer, into an account opened in the corporal\'s name and moved into his son\'s in 2015, when the son needed a house loan and the bank needed an income. The house in Banting, two storeys, a tow truck in the drive, is in Ridzuan\'s name. On the photocopies Ridzuan handed the coroner on Monday, two cells have been changed with correction fluid and a careful pen: the payer\'s name, twice, became "Pencen". Pension. Hamidah holds the photocopy up to the window and the white shows through. "His father wrote accident for forty years," she says, "and the son learned to write pension."',
      },
    },
    {
      id: 'c11_ar', phase: 'Day three', title: 'Carton T',
      game: 'kakuro', variant: 'classic',
      when: (flags) => !!flags.ARCHIVE_SEIZED,
      brief: 'At Bukit Aman ninety officers are still reading the cartons that came out of the reefer under Bukit Jugra: every official Sinar has paid since it began. Farah asks for carton T, and the officer who has it says there is one folder in it older than all the others, the figures inked over in blue, as if somebody had meant to forget them and could not throw them away. The cross-sums in the margins survive. Put the figures back.',
      params: { difficulty: 'medium' },
      evidence: {
        img: 'ev_c11_cartont', hotspot: HOT(),
        title: 'The first page',
        short: 'The oldest folder in the whole archive of Level 14, in carton T: "Kpl. Tarmizi Hassan, Balai Jugra. RM 2,000 (2.12.86). RM 2,000 (1.12.87)." Then RM 1,000 a month, every month, to this one. Before the port, before the tower, before any of them: the first official Sinar ever bought was a corporal, for two thousand ringgit.',
        text: 'Every folder in the archive has the same shape: a name, a post, a figure, a date, and the figure again every month until the name is struck through. This one is soft at the corners and the cardboard has gone the colour of tea. Kpl. Tarmizi Hassan, Balai Jugra. RM 2,000, 2.12.86. RM 2,000, 1.12.87. Then a thousand a month, every month, in figures that change hands three times across forty years and never once miss. It is the first page of the whole archive: older than the superintendents, older than the customs officers, older than the fire investigator, older than the tower. Farah stands with it in her hands in the basement at Bukit Aman for a long time. "Two thousand ringgit," she says. "Everything since started at two thousand ringgit and an old man who was afraid of losing his stripes."',
      },
    },
    {
      id: 'c11_10', phase: 'Day three', title: 'The corridor',
      game: 'timeline', variant: 'cctv',
      brief: 'Court security keeps four cameras in the corridors of the court complex and a till roll in the canteen, and nobody has ever asked them for anything but car-park disputes. Farah borrows the security office at three on Wednesday and pins the morning to its wall: eight frames, out of order, two clocks smudged. Put them in order.',
      params: {
        frames: [
          { id: 'a', clock: '09:15', title: 'Gallery camera, Court 3', text: 'Siew Yang sits down in the front row with a flask and her tin of brushes. Her uncle sits beside her, turning his beads.' },
          { id: 'b', clock: '09:20', title: 'Corridor camera 2', text: 'Shamir Kassim goes into the witness room holding a fat brown envelope. Out at 9:22, holding it.' },
          { id: 'c', clock: '09:28', title: 'Corridor camera 2', text: 'Ridzuan holds out a flask at the witness room door. Sjn. Asri shakes his head. Ridzuan walks away toward the car park.' },
          { id: 'd', clock: '09:3▮', title: 'Canteen till roll', text: 'Two teh, one "kaw, susu lebih". Cash.' },
          { id: 'e', clock: '09:34', title: 'Corridor camera 4, from behind', text: 'An old man in a white shirt carries a tray with two cups down the corridor toward the witness rooms.' },
          { id: 'f', clock: '09:36', title: 'Corridor camera 2', text: 'Asri takes the tray at the witness room door and carries it in. A minute later he hands it back out, one cup on it.' },
          { id: 'g', clock: '09:40', title: 'Witness room log', text: '"Saksi minum teh." The witness drinks his tea.' },
          { id: 'h', clock: '1▮:05', title: 'Court nurse\'s notes', text: 'Collapse in the witness room. Delirium, pupils wide, skin hot and dry, pulse racing.' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The morning plays in order. The lawyer was gone eleven minutes before the tray came, the son\'s flask never went in, and the tea came from the canteen.',
      },
      evidence: {
        img: 'ev_c11_corridor', hotspot: HOT(),
        title: 'Nine-forty',
        short: 'Siew Yang never left the gallery. Shamir was in the witness room from 9:20 to 9:22, eleven minutes before the tray. Asri refused Ridzuan\'s flask at the door at 9:28. At 9:3x the canteen sold two teh, one kaw with extra condensed milk; at 9:34 an old man in a white shirt carried them down the corridor; at 9:36 Asri took the tray in. At 9:40 Tarmizi drank. At 10:05 he collapsed.',
        text: 'Pinned in order, Wednesday morning is very short. At 9:15 the applicant and her uncle sit down in the front row, and the gallery camera keeps Siew Yang there, flask and brushes and all, until the nurse runs past at 10:06; her uncle\'s seat is empty from about half past nine. At 9:20 Sinar\'s counsel goes into the witness room with an envelope and comes out two minutes later with the same envelope. At 9:28 the corporal\'s son is turned away at the door with the family flask, because Farah\'s order was nothing from outside. At some minute after half past, the canteen sells two teh, one of them kaw, with extra condensed milk, for cash. At 9:34 corridor camera 4 catches, from behind only, an old man in a white shirt with a tray. At 9:36 Asri takes the tray at the door without looking at it, as he would a tray from the canteen, carries it in, and hands it back out with one cup still on it. At 9:40 the witness drinks. Farah looks at the 9:34 frame for a long time. "From behind," she says. "Half the old men in this building are wearing a white shirt."',
      },
    },
    {
      id: 'c11_11', phase: 'Day three', title: 'The cup and saucer',
      game: 'fingerprint', variant: 'classic',
      brief: 'The court nurse, Sister Kalai, put the corporal\'s cup and saucer into a clean plastic bag at 10:06, before anybody told her to, because she nursed in Kelantan for ten years and she has seen datura before. Shah Alam\'s lifter has prints from the cup and one clean thumb from the underside of the saucer, where you hold a saucer to carry it. Classify it, then find its owner.',
      params: {
        liftLabel: 'Lift: underside of a canteen saucer, witness room, Court 3',
        liftAria: 'A thumbprint lifted from the underside of a white canteen saucer',
        candidates: [
          { id: 'ahkow', name: 'Teoh Ah Kow (visitor\'s pass, Day one)' },
          { id: 'tarmizi', name: 'Tarmizi Hassan (PDRM service record)' },
          { id: 'asri', name: 'Sjn. Mohd. Asri (PDRM service record)' },
          { id: 'yang', name: 'Teoh Siew Yang (applicant\'s affidavit)' },
          { id: 'ridzuan', name: 'Ridzuan Tarmizi (driving licence)' },
          { id: 'shamir', name: 'Shamir Kassim (Bar Council record)' },
          { id: 'ros', name: 'Rosnah Ali, "Kak Ros" (canteen licence)' },
          { id: 'kalai', name: 'Sister Kalai (court nurse)' },
        ],
        answer: 'ahkow',
      },
      evidence: {
        img: 'ev_c11_saucer', hotspot: HOT(),
        title: 'A thumb on the saucer',
        short: 'On the cup: Tarmizi\'s prints, and Asri\'s, who carried the tray in. On the underside of the saucer, where you hold a saucer to carry it: Teoh Ah Kow\'s thumb. Siew Yang\'s prints are nowhere on cup or saucer, and her flask holds kopi and nothing else.',
        text: 'The cup tells you who drank and who served: Tarmizi\'s fingers round the body and the handle, and on the rim of the saucer where a man lifts it off a tray, Sjn. Asri\'s, who took the tray at the door and set the cup down in front of the witness without looking at it. The underside of a saucer is where it is carried from, by somebody who has carried a great many saucers: one clean thumb in the middle, pressed into a smear of condensed milk. Teoh Ah Kow\'s, from the visitor\'s pass he signed on Monday. Siew Yang\'s prints are on her own flask and on her brushes and nowhere on the canteen\'s china, and the flask, which she hands over without being asked, holds black kopi and nothing else. Sister Kalai, told, nods as though she had expected it. "In Kelantan the old men grind the seeds for their joints," she says. "A little, in coconut oil, on the skin. Never in a drink. In a drink it makes a man see his whole life standing in the room with him."',
      },
    },
    {
      id: 'c11_nf', phase: 'Day three', title: 'The left thumb of 1986',
      game: 'fingerprint', variant: 'classic',
      when: (flags) => !!flags.NOTE_FOUND,
      brief: 'The last page of the corporal\'s carbon has no signature, only an inked thumb rolled below the last line: in 1986 Balai Jugra took thumbs, not signatures, from men who had written their names on page one. Hamidah has Exhibit P7 on the table, the cancelled note from Melaka, with its two thumbs. Compare.',
      params: {
        liftLabel: 'Inked left thumb, last page of the driver\'s statement, Balai Jugra, 1 December 1986 (carbon copy)',
        liftAria: 'An old inked thumbprint at the foot of a carbon-copy statement page',
        candidates: [
          { id: 'note_left', name: 'Borrower\'s left thumb, promissory note, Melaka, 2 December 1986 (Exhibit P7)' },
          { id: 'note_right', name: 'Guarantor\'s right thumb, the same note (M. Perumal)' },
          { id: 'muthu_left', name: 'Muthusamy a/l Perumal, identity card record, left thumb' },
          { id: 'ahkow', name: 'Teoh Ah Kow, mortuary identification form, 1 December 1986' },
          { id: 'ahchuan', name: 'Teoh Ah Chuan, identity card record (deceased 1986)' },
          { id: 'tarmizi', name: 'Tarmizi Hassan, PDRM service record' },
          { id: 'yang', name: 'Teoh Siew Yang, the applicant\'s affidavit' },
        ],
        answer: 'note_left',
      },
      evidence: {
        img: 'ev_c11_twothumbs', hotspot: HOT(),
        title: 'The morning after',
        short: 'The thumb the driver rolled at Balai Jugra on the morning of 1 December 1986 is the borrower\'s left thumb on the Melaka note of 2 December 1986: the same nine clear points. Not Muthu\'s, not the brother\'s. He gave his statement on the first, and borrowed the money on the second.',
        text: 'Nine points, the same nine that the national search said were not enough in December, and still not enough: twelve to search, nine to be sure of only one thing. The thumb at the foot of a statement about a drowning at Jugra on the first of December 1986 and the borrower\'s thumb on a loan of eighteen thousand ringgit in Melaka on the second are the same left thumb. Not Muthu\'s, whose thumbs are both on file. Not the brother\'s, who rolled his at the mortuary that morning. Hamidah writes the two dates one under the other on her pad. "He gave the police his statement on the Monday," she says, "and on the Tuesday he drove to Melaka and borrowed against a dead man\'s lorry. Nine points is a man. It is still not a name."',
      },
    },
    {
      id: 'c11_12', phase: 'Day three', title: 'The corporal\'s son',
      game: 'interrogation', variant: 'classic',
      brief: 'Ridzuan Tarmizi sits in the witness room where his father drank his tea, because Farah chose it, with oil under his nails and his big hands on his knees, and looks at the chair his father sat in. He has driven a tow truck for fifteen years and he has never once been the one being towed. One thing he tells you is not true. Find it, and put the exhibit that breaks it on the table.',
      params: {
        setting: 'The witness room, Court 3, Shah Alam court complex. Wednesday, 4:10 PM.',
        suspect: {
          id: 'ridzuan', voice: 'voice_2', name: 'Ridzuan Tarmizi', role: 'Tow-truck operator, Banting. The corporal\'s son, 38',
          persona: 'Short-tempered Selangor Malay tow-truck operator of thirty-eight from Banting: rough Malaysian English mixed with Malay ("Abah", "Mak", "apa ni", "tak payah", "kau"), a big man who sits forward on the chair as if he might have to stand up and fight. Proud of the house he built, ashamed of where the money came from, frightened for his father and angry at everyone who made his father talk. Softens only when his father\'s health is mentioned. He knows nothing about 1986 beyond what his father said this week, and he never names or describes the man his father wrote about.',
        },
        facts: [
          { id: 'f1', topic: 'his work', claim: 'Tow trucks. Three of them. Banting, Morib, Kuala Langat. If your car goes in a drain at night, I am the one who pulls it out.' },
          { id: 'f2', topic: 'his father', claim: 'Abah was a corporal at Balai Jugra for twenty years. Then he retired and grew chillies. That is all he was.' },
          { id: 'f3', topic: 'the inquest', claim: 'I told him not to go to this court. Forty years nobody asked him anything. Why must he answer now?' },
          { id: 'f4', topic: 'the drive in', claim: 'I drove him in every morning. Monday, Tuesday, Wednesday. Half past seven from Banting.' },
          { id: 'f5', topic: 'his father\'s teh', claim: 'Mak makes his teh at home, in his old flask. He likes it kaw and very sweet. The doctor says no. He says yes.' },
          { id: 'f6', topic: 'the house', claim: 'The house is in my name because the bank would not lend to a pensioner. I pay the loan. Every month.' },
          { id: 'f7', topic: 'Tuesday night', claim: 'Tuesday night Abah could not sleep. He sat on the front step with his phone until midnight, talking into it.' },
        ],
        lies: [
          { id: 'l1', topic: 'the money', claim: 'My family never took one sen from Sinar. Abah\'s pension and my trucks. That is all.', truth: 'Since 1987 the family has had RM 1,000 a month from Sinar; the house was built on it, and he changed the payer to "pension" on the photocopies.', exposedBy: 'e1' },
          { id: 'l2', topic: 'Wednesday morning', claim: 'I gave Abah his breakfast myself on Wednesday. His own teh, from his own flask, in that room.', truth: 'At 9:28 the sergeant at the door refused his flask; he never went in, and he was in the car park when his father drank.', exposedBy: 'e2' },
          { id: 'l3', topic: 'what his father kept', claim: 'Abah kept nothing from 1986. No papers, nothing. He was a corporal, not a clerk.', truth: 'A police document tin under his father\'s bed held the carbon of the 1986 statement and his note of the payment.', exposedBy: 'e3' },
        ],
        evidence: [
          { id: 'e1', title: 'The morning after the first', text: 'The bank\'s statements: RM 1,000 a month to the Tarmizi family from Sinar since 1987. On Ridzuan\'s photocopies the payer\'s name was changed to "Pencen".' },
          { id: 'e2', title: 'Nine-forty', text: 'Corridor camera 2, 9:28 AM: Ridzuan holds out a flask at the witness room door, the sergeant shakes his head, and Ridzuan walks away to the car park.' },
          { id: 'e3', title: 'Through T.A.K.', text: 'Under the corporal\'s bed, a police document tin: the carbon of the driver\'s 1986 statement, and a pencil note, "Dibayar RM 2,000. 2.12.86."' },
          { id: 'e4', title: 'Cut at 4:40', text: 'Tuesday\'s recording, cut into five at 4:40 PM by the recording clerk, who says a lawyer paid him.' },
          { id: 'e5', title: 'Two men on the ramp', text: 'Siew Yang\'s evidence: at ten past two, a torch on the bank and a man in the water at the cab door.' },
          { id: 'e6', title: 'Three metres of water', text: 'At 2:10 AM on 1 December 1986 the tide stood three metres over the foot of the ramp, and the lorry went in nose first.' },
        ],
        secret: 'On Monday night he deleted the five voice notes his father had sent to the family group, because they named the Sinar money and the house, and he hid his father\'s phone in the toolbox of his tow truck; he never touched the tea, and was in the car park when his father drank it.',
        suggested: [
          'Where were you at nine-forty on Wednesday?',
          'Did your family ever take money from Sinar?',
          'Whose name is the house in?',
          'Did your father keep anything from 1986?',
          'What did your father do on Tuesday night?',
          'Where is your father\'s phone?',
          'Who do you think did this to him?',
        ],
        maxQuestions: 14,
        clue: 'Farah, from the door: "He keeps his hands flat on his knees. He is not hiding a weapon. He is hiding a phone."',
      },
      evidence: {
        img: 'ev_c11_voicenotes', hotspot: HOT(),
        title: 'Five voice notes',
        short: 'Caught in one lie, Ridzuan goes out to his tow truck and comes back with his father\'s phone from the toolbox. On Monday night he deleted five voice notes his father had sent to the family group, about the money, the house, and 1986. "He said he would tell them everything. I thought: then they take the house." On Wednesday he never got in. The sergeant sent him away at the door: nothing from outside.',
        text: 'He does not cry and he does not shout. He goes out to the car park with Farah\'s constable, opens the toolbox on the back of his tow truck, and comes back with an old phone in a plastic bag, which he puts on the table in front of his father\'s empty chair. Five voice notes, he says, sent to the family group between Sunday and Monday night, his father talking to his phone the way old men do: the thousand a month, the house, the corporal\'s stripes in 1986 and what they cost. He deleted them from his own phone and from his mother\'s, and hid the phone they came from, because a man who tells a court where his money came from can lose the house it built. On Wednesday morning he brought the family flask, as he did on Monday and Tuesday, and the sergeant at the door said, politely, "Encik, nothing from outside. Inspector\'s orders," and he went and sat in his truck. "I was angry," he says. "I thought, they will give him canteen teh. Too sweet. Bad for his sugar." Then he hears what he has said, and puts his face in his hands.',
      },
    },
    {
      id: 'c11_13', phase: 'Day three', title: 'Termasuk awak',
      game: 'dialtone', variant: 'classic',
      brief: 'On his father\'s phone, after the five that Ridzuan deleted, there is a sixth voice note that never got sent: Tuesday, 9:10 PM, four minutes long. The corporal was sitting on the front step talking into it for his son when he picked up the house telephone beside him and dialled, and forgot the mobile was still listening. Ten tones, and a few words. Listen, and type the number.',
      params: {
        number: '0331876692', noise: 0.2,
        clue: 'Selangor landlines start 03 and have ten digits. He dialled it slowly, like a number he had kept on paper for a long time.',
      },
      evidence: {
        img: 'ev_c11_phone', hotspot: HOT(),
        title: 'Including you',
        short: 'Tuesday, 9:10 PM, picked up by his own phone: the corporal dials 03-3187 6692 on the house line and says, "Esok saya cakap semua. Termasuk awak." Tomorrow I tell everything. Including you. The number is a landline in Banting, behind the wet market: Teoh Ah Kow\'s.',
        text: 'The tones are slow and careful, a man reading a number off a scrap of paper by the light of a front step. A ring. Somebody picks up and says nothing. Then the corporal, quietly, in Malay, not angry, almost kind: "Esok saya cakap semua. Termasuk awak." Tomorrow I will tell everything. Including you. A long silence on the line, and the click of it being put down at the other end without a word. Then, for three more minutes, the sound of an old man breathing on his step, and a motorbike passing, and his wife calling him in. The number is a Telekom landline at a terrace house behind the Banting wet market, in the name of Teoh Ah Kow. Telekom\'s record has the call answered at 9:10 PM and lasting forty-one seconds. On Wednesday morning at 9:15 the man who answered it was sitting in the front row of the gallery beside his niece, turning his beads.',
      },
    },

    // ---------------- Kepong ----------------
    {
      id: 'c11_14', phase: 'Kepong', title: 'The plant lab',
      game: 'dna', variant: 'mixed',
      brief: 'Sister Kalai was right: Hospital Shah Alam finds scopolamine in the corporal\'s blood by lunchtime. The sediment from his cup goes to the Forest Research Institute at Kepong, where Dr. Nadia Rahim\'s plant lab can tell one kecubung shrub from another by its DNA. At noon Hamidah\'s botanist took cuttings from every datura within reach of the case: by Pak Itam\'s hut at Jugra, behind the terraces at the Banting wet market, and along the fence of a tow-truck yard. It is half past five, and FRIM closes at six. Read the bands with her.',
      params: { suspects: 7 },
      evidence: {
        img: 'ev_c11_frim', hotspot: HOT(),
        title: 'From the shrub behind the market',
        short: 'The sediment in the corporal\'s cup is ground datura seed, kecubung, from two plants: a mother shrub and a cutting taken from it, growing together at the back fence of a terrace behind the Banting wet market. Teoh Ah Kow\'s. Not the shrub by Pak Itam\'s hut at Jugra, and not the one along the tow-truck yard.',
        text: 'Dr. Nadia lays the gel on the light box and reads it the way a doctor reads an X-ray to a family. The grey grit at the bottom of the cup is seed coat, ground, from Datura metel, the kecubung that every kampung grows somewhere for the old men\'s joints and the young men\'s dares: scopolamine and atropine, a man seeing his whole life in the room, pupils wide, skin hot and dry. Two plants in the paste, not one, and the two are mother and child: kecubung grows from cuttings, and somebody took a cutting years ago and planted it beside the first. The pair matches the cuttings from the back fence of the third terrace behind the Banting wet market, where the botanist reached over a wall at noon. The shrub by the watchman\'s hut at Jugra is a different plant, and so is the one that grows wild along the tow-truck yard. Dr. Nadia writes the address on the report herself. The house behind the wet market belongs to Teoh Ah Kow.',
      },
    },

    // ---------------- Butterworth ----------------
    {
      id: 'c11_15', phase: 'Butterworth', title: 'The ferry terminal',
      game: 'pursuit',
      brief: 'On Tuesday morning Siew Yang\'s neighbour rang her in Shah Alam: her shop in Bagan Luar had been broken into on Monday night, and nothing was taken but a box of old school books. On Wednesday evening the same neighbour rings again. A young man is offering a 1986 sketchbook "of the old Sinar yard" to the man who buys old photographs by the ferry terminal, at nine tonight. You and Daniel drive north from Kepong without stopping. At three minutes past nine the young man sees Daniel, and runs.',
      params: {
        setting: 'docks',
        route: ['docks', 'market', 'city', 'docks'],
        legs: 4,
        beats: [
          'Out through the ferry concourse at a run, under the departure boards, past Madam Ong\'s drinks stall and the glasses set out on her table.',
          'Into Bagan Luar market: fish on ice, crates of Chinese New Year oranges, red lanterns already up for Friday.',
          'The old shophouse lanes of Butterworth, five-foot ways and shutters, past a sign painter\'s shop with its door forced. He does not look at it.',
          'Out onto the Prai wharf in the dark, Komtar and the lights of George Town across the black channel, and nowhere left to run.',
        ],
        difficulty: 'hard',
        vehicle: 'foot',
        suspect: 'Wei Liang',
        skyline: 'penang',
        clue: 'He is twenty-two, and he will not drop the bag. Whatever is in it, somebody told him to burn.',
      },
      evidence: {
        img: 'ev_c11_sketchbook', hotspot: HOT(),
        title: 'The sketchbook',
        short: 'You bring him down on the Prai wharf: Teoh Wei Liang, 22, Ah Kow\'s grandson. In his bag, wrapped in a Chinese New Year newspaper, a 1986 school sketchbook with T.S.Y. on the cover, water-stained. He broke into Siew Yang\'s shop on Monday night. "Ah Kong asked me. He said burn it. A man at the terminal said a drawing of the Sinar yard is worth money."',
        text: 'He goes down on the wet planks of the Prai wharf with George Town lit up across the channel behind him like a party he was not invited to, and he holds the bag against his chest with both arms even with your knee in his back. Teoh Wei Liang, twenty-two, a delivery rider from Banting, Teoh Ah Kow\'s grandson. In the bag, wrapped in a newspaper full of Chinese New Year adverts, a school sketchbook from 1986, the cover soft as felt and lettered T.S.Y. in a girl\'s capitals, the bottom third of every page stained brown where water got into a box under a shop counter years ago. He broke into his aunt\'s shop in Bagan Luar on Monday night with a screwdriver. "Ah Kong asked me," he says into the planks. "On Sunday. He said, take the old school books from under her counter and burn them, all of them, do not open them. I opened them." A man who buys old photographs at the ferry terminal had told him that anything about the Sinar yard from the eighties was worth money now. "I was going to burn it after," he says. "After I sold it." Like every frightened man in this, he kept something back.',
      },
    },
    {
      id: 'c11_16', phase: 'Butterworth', title: 'One page under water',
      game: 'nonogram', variant: 'classic',
      brief: 'Madam Ong lets you have her table at the back of the stall after she closes, and her strip light, and two teh you did not order. Most of the sketchbook is a girl drawing her father\'s lorry, the gate, the river, a cat. One page near the end has been under water so long that only the darkest strokes survive, as if the pencil was pressed so hard it went into the paper. Rebuild it, square by square.',
      params: {
        solvedText: 'The picture resolves: a ramp into black water, a man at the cab door with his back to you, a light held up on the bank, and in the corner a clock at ten past two.',
        picture: [
          '...........###.',
          '.#........#..##',
          '####......#.#.#',
          '.#.####...#...#',
          '.#....####.###.',
          '#.#..##########',
          '#####.#########',
          '.....#.##....##',
          '......###.##.##',
          '......###....##',
          '......#########',
          '......#########',
        ],
      },
      evidence: {
        img: 'ev_c11_page', hotspot: HOT(),
        title: 'His back, at ten past two',
        short: 'Siew Yang\'s pencil, the week after: the ramp; the cab under the water; a man in the water at the door, from behind, in a white singlet, his hair wet; a figure on the bank with a torch; and in the corner a clock with its hands at ten past two, pressed so hard the pencil went through the paper. Her father\'s watch stopped at ten past two. The man in the water kept it. It is always ten past two because of this minute.',
        text: 'Square by square, under Madam Ong\'s light, a fifteen-year-old\'s drawing comes back out of the stain. The ramp running down from the left into a straight black line of water. Under the line, the box of the cab. At the cab door, in the water to his shoulders, a man drawn from behind, a white singlet, the back of a head of wet hair, no face, because she never saw one. On the bank, a stick figure holding something up, and a cone of light from it laid across the water to the man\'s head. In the top corner, a clock, the hands at ten past two, gone over and over until the pencil cut through. On the phone from Shah Alam Siew Yang says she drew it on 2 December 1986, in the morning, because her uncle had told her she dreamed it and she wanted to keep the dream where nobody could take it. The watch in the photograph from Box 14, TEOH A.C. 1979, stopped at ten past two with river mud in its crown. A lamp on Level 14 that comes on at ten past two. A telephone at Restoran Bala at ten past two. A black car outside it at ten past two. Daniel looks at the drawing for a long time, and for once does not say anything at all.',
      },
    },

    // ---------------- Banting ----------------
    {
      id: 'c11_17', phase: 'Banting', title: 'Behind the wet market',
      game: 'searchlight', variant: 'classic',
      brief: 'Three in the morning on Thursday, behind the Banting wet market, with a warrant Hamidah signed in the car park at Shah Alam and the Kuala Langat police\'s portable floodlights. Teoh Ah Kow\'s back garden is a long strip between his kitchen and the lane: chillies, pandan, a small altar to Kuan Yin, and at the fence the plants that FRIM named. Light every bed, and do not let one lamp shine into another, or the glare will hide the ground.',
      params: {
        size: 8, walls: 'medium',
        clue: 'The numbered flowerpots say how many lamps stand right beside them. A lamp lights its row and its column until a pot or a wall stops it.',
      },
      evidence: {
        img: 'ev_c11_garden', hotspot: HOT(),
        title: 'Stripped pods',
        short: 'At the back fence, a kecubung shrub and the cutting beside it, both stripped: a dozen stalks where the spiny pods were twisted off. In the outdoor kitchen, a granite mortar with a grey paste dried in its bowl. In the drain, split husks. On the Kuan Yin altar, a fresh joss stick, lit tonight.',
        text: 'Lit bed by bed, the garden is a careful old man\'s garden: chillies staked with chopsticks, pandan in a tyre, the altar to Kuan Yin swept and a joss stick on it lit some time tonight. At the back fence the two datura stand together, the big one and the one grown from its cutting, white trumpets hanging open in the floodlight, and on both, a dozen green stalks with nothing on them where somebody twisted off the spiny pods, the breaks still pale. In the drain along the lane, split husks and the flat brown seeds that fell out of them. In the outdoor kitchen under the zinc, a granite lesung, the stone mortar every Malaysian kitchen has, and in its bowl a grey paste dried hard round the pestle, which somebody washed and did not wash well enough. The Kuala Langat constable with the lamp will not go near the shrubs. "My nenek says you sleep under kecubung, you dream," he says. "You drink it, you do not wake up the same."',
      },
    },
    {
      id: 'c11_18', phase: 'Banting', title: 'For privacy',
      game: 'shredder', variant: 'classic',
      brief: 'The copy shop on Jalan Sultan Abdul Samad opens at eight, and its owner remembers an old Chinese uncle in a white shirt who came in on Monday morning with one sheet of paper and paid two ringgit to have it shredded "for privacy". The shop bags its shredding for the recycling lorry on Fridays. Today is Thursday. Some strips went in face down.',
      params: {
        title: 'SINAR HOLDINGS BERHAD',
        text: 'OFFICE OF THE CHAIRMAN\n\nTo: T.A.K.\nSunday, 22:00\n\nThe corporal first.\nThen the girl\'s book.\n\nYou have kept quiet\nfor forty years.\nKeep quiet for four days.\n\nNothing on the phones.',
        strips: 10,
        flips: true,
        stamp: 'PRIVATE',
        clue: 'The owner: "One sheet only. He watched it go in. He said it came in a red packet, like for the new year."',
      },
      evidence: {
        img: 'ev_c11_order', hotspot: HOT(),
        title: 'The corporal first',
        short: 'The order, taped back together: "OFFICE OF THE CHAIRMAN. To: T.A.K. Sunday, 22:00. The corporal first. Then the girl\'s book. You have kept quiet for forty years. Keep quiet for four days. Nothing on the phones." Left at Ah Kow\'s gate on Sunday night in a red packet, and shredded on Monday morning "for privacy".',
        text: 'Ten strips and a roll of tape on the copy shop\'s counter, and the page comes back in the flat printed type that every order of the Office has come in since Lebuh Chulia. To T.A.K., Sunday, ten at night, the night before the inquest opened. Two things, in the order he did them: the corporal first, on Wednesday morning, with a tray; then the girl\'s book, which he sent his grandson to steal on Monday night and burn, and which his grandson did not burn. Then the line that is not an order at all, but a reminder of what he had already been paid for: forty years of quiet, and four days more. The copy shop owner says the uncle brought it in a red packet, the kind you give children at the new year, and stood at the shredder until the last strip went through, and paid two ringgit, and said, "For privacy." Hamidah looks at the strips for a long time. "He could have burned it in his kitchen in ten seconds," she says. "He wanted to watch somebody else\'s machine do it."',
      },
    },

    // ---------------- Day four ----------------
    {
      id: 'c11_19', phase: 'Day four', title: 'Five statements',
      game: 'whoslying', variant: 'classic',
      brief: 'On Thursday morning, with the corporal still in hospital, Hamidah asks the coroner to have five people\'s statements about Tuesday night and Wednesday morning read back to them in open court, one by one, under oath. Five people. Two of them are lying.',
      params: {
        solvedLine: 'Hamidah reads the five statements twice and underlines two. "A lawyer with an envelope, and an uncle with a telephone."',
        people: [
          { id: 'ahkow', name: 'Teoh Ah Kow', says: [
            { t: '"On Tuesday night I spoke to nobody. I went to bed at nine."', fact: false, note: 'Telekom\'s record for his landline: an incoming call at 9:10 PM on Tuesday, answered, forty-one seconds.' },
            { t: '"Encik Shamir is telling the truth."', about: 'shamir', is: true },
          ] },
          { id: 'shamir', name: 'Encik Shamir Kassim', says: [
            { t: '"I went into the witness room at 9:20 only to tell the corporal that the court would sit late."', fact: false, note: 'Corridor camera 2: he went in holding a fat brown envelope and came out holding it. At 9:40 the court interpreter saw him in the robing room counting it back into his briefcase.' },
            { t: '"Kak Ros is lying."', about: 'ros', is: false },
          ] },
          { id: 'yang', name: 'Teoh Siew Yang', says: [
            { t: '"From a quarter past nine I sat in the gallery, and I did not leave my seat until the nurse ran past."', fact: true, note: 'The gallery camera has her in the front row from 9:15 to 10:10, her flask beside her.' },
            { t: '"My uncle is lying."', about: 'ahkow', is: false },
          ] },
          { id: 'itam', name: 'Pak Itam', says: [
            { t: '"Budak perempuan itu cakap benar." The girl is telling the truth.', about: 'yang', is: true },
            { t: '"Peguam itu bohong." The lawyer is lying.', about: 'shamir', is: false },
          ] },
          { id: 'ros', name: 'Kak Ros, the canteen', says: [
            { t: '"At about half past nine an old Chinese uncle in a white shirt bought two teh from me, one kaw with extra susu, and paid cash."', fact: true, note: 'Her till roll: 09:3▮, two teh, one kaw susu lebih, cash.' },
            { t: '"At least two of the others are lying."', atLeast: 2 },
          ] },
        ],
        liars: ['ahkow', 'shamir'],
      },
      evidence: {
        img: 'ev_c11_statements', hotspot: HOT(),
        title: 'Day two, again',
        short: 'Two liars under oath. Teoh Ah Kow says he spoke to nobody on Tuesday night; his telephone says he listened to the corporal for forty-one seconds. Shamir Kassim says he went into the witness room to say the court would sit late; he went in with an envelope. Siew Yang never left the gallery. Kak Ros sold two teh to an old uncle in a white shirt.',
        text: 'Read back to them in open court, under oath, the five statements sort themselves. Siew Yang\'s is true to the minute, and she says it to the coroner without turning her head toward the man beside her. Pak Itam\'s two sentences are about other people, as all his sentences are, and both are true. Kak Ros, who has run the canteen for nineteen years and has been asked nothing in all of them, describes the uncle and his two teh and his cash with the pleasure of a woman finally consulted. Shamir Kassim\'s is a lawyer\'s lie, which is to say mostly true: he did tell the corporal the court would sit late, and he also put RM 50,000 on the table and said "think of your son\'s house", and took it back when the old man pushed it away. And Teoh Ah Kow\'s is an old man\'s lie, which is to say very simple: he spoke to nobody. When the clerk reads out the forty-one seconds from Telekom\'s record, he puts his beads down on the bench beside him, for the first time in four days.',
      },
    },
    {
      id: 'c11_20', phase: 'Day four', title: 'Everyone at 9:40',
      game: 'logicgrid', variant: 'classic',
      brief: 'Before anybody is asked anything else, Farah wants the minute the corporal drank on one page: 9:40 on Wednesday morning. Five people, five places in the court complex, five things in their hands. She draws the grid on the back of the cause list, with a ruler she borrowed from the clerk.',
      params: {
        categories: [
          { name: 'Person', items: ['Ah Kow', 'Siew Yang', 'Ridzuan', 'Shamir', 'Pak Itam'] },
          { name: 'Location', items: ['The gallery', 'The court surau', 'The robing room', 'The car park', 'The corridor by the toilets'] },
          { name: 'Holding', items: ['A prayer mat', 'An envelope', 'A tray', 'A flask of kopi', 'His father\'s flask'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[4, 2], [0, 3], [3, 4], [2, 1], [1, 0]],
        clues: [
          'Siew Yang was where she could see the witness box.',
          'Whoever sat in the gallery had a flask of kopi.',
          'Ridzuan never got back inside the building after the sergeant turned him away.',
          'Ridzuan was holding something that belonged to his father.',
          'The lawyer had his gown on, and nothing in his hands to drink from or to pray on.',
          'Pak Itam had taken his shoes off.',
          'The old man with the tray was not where anybody prays.',
          'The prayer mat was nowhere near the toilets.',
        ],
      },
      evidence: {
        img: 'ev_c11_grid', hotspot: HOT(),
        title: 'Nine-forty on one page',
        short: 'At 9:40 on Wednesday: Teoh Ah Kow in the corridor by the toilets with a tray and one cup. Siew Yang in the gallery with her flask of kopi. Ridzuan in the car park with his father\'s flask. Shamir in the robing room with his envelope. Pak Itam in the court surau with a prayer mat.',
        text: 'From 9:36, when the tray went in at the witness room door, to 9:40, when the old man inside it drank. Teoh Ah Kow in the corridor by the toilets, holding a tray with his own teh still on it, which he poured down the sink of the men\'s toilet at 9:41; the cleaner found the cup in the bin. Siew Yang in the front row of the gallery with her kopi. Ridzuan in the cab of his tow truck in the car park, with his mother\'s teh in his father\'s flask going cold on the seat beside him. Shamir Kassim in the robing room with his gown on and his envelope open, counting. Pak Itam in the surau on the ground floor with his shoes at the door, on a prayer mat, where the imam says he sat from nine until the ambulance came, and did not pray, and did not move.',
      },
    },
    {
      id: 'c11_21', phase: 'Day four', title: 'For the prosecutor',
      game: 'theory', variant: 'classic',
      brief: 'Hamidah Yusof takes the robing room at one o\'clock with a flask of teh, one sheet of paper and twenty minutes before the court sits. "The coroner finds facts, detective. I charge people. Not the evidence. The story. And I want 1986 in it, because he did not do this on Wednesday. He started it forty years ago."',
      params: {
        prompt: 'Write Wednesday morning for the prosecutor: who poisoned Corporal Tarmizi and how, why he had to be stopped before he spoke, and what the poisoner did in 1986.',
        context: 'At an inquest in Shah Alam into the 1986 drowning of the lorry owner Teoh Ah Chuan at his yard at Jugra, retired Corporal Tarmizi Hassan, who wrote "accident" in 1986, said in the witness box that he had written "accident" for forty years and had kept the driver\'s statement. On Tuesday night he rang Teoh Ah Kow, the dead man\'s brother: "Tomorrow I tell everything. Including you." On Wednesday morning Teoh Ah Kow bought two teh at the court canteen, stirred crushed kecubung (datura) seeds from the shrub behind his house in Banting into one, and carried them on a tray to the witness room door, where the guarding sergeant took the tray in. Tarmizi drank at 9:40 and collapsed. In 1986 Ah Kow, in debt to his brother, said it was the brakes, signed the yard over to Sinar Pengangkutan, and on the driver\'s behalf paid Tarmizi RM 2,000 to write "accident". The Office of the Chairman\'s printed order to T.A.K. said: "The corporal first. Then the girl\'s book."',
        points: [
          { id: 'who', label: 'Who poisoned him', criterion: 'Teoh Ah Kow (the dead man\'s brother, Siew Yang\'s uncle) poisoned Tarmizi. It must not say somebody else did it.', keywords: [['ah kow', 'ahkow', 'uncle', 'brother', 'teoh a']], hint: 'Whose thumb is on the underside of the saucer?' },
          { id: 'how', label: 'How', criterion: 'Crushed kecubung / datura seeds in a teh from the court canteen, carried to the witness room on a tray (which the sergeant took in).', keywords: [['kecubung', 'datura', 'seed', 'pod', 'poison', 'scopolamine'], ['teh', 'tea', 'cup', 'canteen', 'tray', 'drink']], hint: 'What did FRIM find at the bottom of the cup, and where did the cup come from?' },
          { id: 'why', label: 'Why the corporal had to be stopped', criterion: 'Tarmizi was going to tell the court that Ah Kow paid him in 1986 ("Termasuk awak" / including you), or the Office of the Chairman ordered it ("The corporal first").', keywords: [['paid', 'bribe', '2,000', '2000', 'termasuk', 'including', 'tell', 'talk', 'testify', 'order', 'office', 'chairman', 'corporal first', 'expose', 'reveal']], hint: 'What did the corporal say into the telephone on Tuesday night?' },
          { id: 'past', label: 'What he did in 1986', criterion: 'In 1986 Ah Kow paid the corporal to write "accident" and/or said it was the brakes and signed the yard over to Sinar, his debts forgiven.', keywords: [['1986', 'yard', 'brake', 'accident', 'kemalangan', 'debt', 'sinar'], ['paid', 'pay', 'sign', 'debt', 'brake', 'lie', 'lied', 'bribe', 'said']], hint: 'What three initials were in the corporal\'s tin, and what does his passbook show since 1987?' },
        ],
        need: 3,
        clue: 'Hamidah taps the sheet. "Three I can prove. Four, and you can have the flask."',
      },
      evidence: {
        img: 'ev_c11_report', hotspot: HOT(),
        title: 'Forty years and four days',
        short: 'Hamidah reads your report twice and writes the charge against Teoh Ah Kow: attempted murder of a witness. Under it, "and abetment by", the line she has left blank all season, and she leaves it blank again. "He started this in 1986, detective. I cannot charge a man for a page that was torn out. Yet."',
        text: 'Hamidah Yusof reads it twice with the pencil she never uses, and then for the first time this season she uses it, to underline two dates one above the other: 2.12.86, and 3.2.27. "Forty years and four days," she says. She writes the charge herself, Section 307, attempted murder, against an old man in a white shirt who has been paid three hundred ringgit on the morning after the first of every month since 1987 to keep a door shut that somebody else held shut first. Then she puts the pencil on the line under it, "and abetment by", and holds it there. "An order in a red packet, signed by an office. A page torn out with a ruler in 1987. A left thumb on a deed in Singapore. A hand that writes thank you." She lifts the pencil. "I can charge a man for a cup of tea. I cannot charge a man for a page that is not there. Yet."',
      },
    },
    {
      id: 'c11_22', phase: 'Day four', title: 'A-hia',
      game: 'interrogation', variant: 'classic',
      brief: 'Teoh Ah Kow sits in the witness room where the corporal drank his tea, in his white shirt, with his beads moving through his fingers one at a time, and does not once look toward the door to the gallery where his niece is sitting. He has said very little for forty years, and he was paid every month to say it. One thing he tells you is not true. Find it, and put the exhibit that breaks it on the table.',
      params: {
        setting: 'The witness room, Court 3, Shah Alam court complex. Thursday, 2:00 PM.',
        suspect: {
          id: 'ahkow', voice: 'voice_3', name: 'Teoh Ah Kow', role: 'Teoh Ah Chuan\'s younger brother, retired, Banting, 74',
          persona: 'Soft-spoken retired Hokkien man of seventy-four from Banting, in a pressed white shirt, prayer beads always moving in his fingers. Speaks gentle Malaysian English with Selangor Hokkien and Malay ("lu", "wa", "aiya", "boleh", "tak tahu"), politely, like a man at a funeral. Calls his dead brother "A-hia" (elder brother) and his niece "Siew Yang"; calls the detective "detective". Never names the man who drove for his brother and never describes him in any way: no name, no face, no size, no hands, nothing about where he went; asked, he says only "a driver from KL" and turns a bead. Says "aiya" when cornered. He is ashamed, tired, and frightened of two things: his niece, and a printed letter.',
        },
        facts: [
          { id: 'f1', topic: 'his brother', claim: 'A-hia had one lorry and a yard under Bukit Jugra. Palm oil to Port Klang, to Butterworth. He worked like three men.' },
          { id: 'f2', topic: 'his niece', claim: 'Siew Yang painted that sun on the gate when she was fourteen. A-hia let her keep it, because she cried when he said no.' },
          { id: 'f3', topic: 'the driver', claim: 'A driver came from KL in 1985 to drive for A-hia. Spoke Hokkien better than me. English to the bank in Klang. That is all I know.' },
          { id: 'f4', topic: 'the yard', claim: 'After A-hia, the yard went to the company, Sinar Pengangkutan. I signed. What could I do with a yard and a lorry in the river?' },
          { id: 'f5', topic: 'his money', claim: 'Three hundred ringgit a month from the company. For the yard, they said. Since 1987. Every month, the morning after the first.' },
          { id: 'f6', topic: 'his garden', claim: 'Behind my house there is a small garden. Chillies, pandan, a little Kuan Yin. I water it every morning before the market.' },
          { id: 'f7', topic: 'his beads', claim: 'Every morning I pray for A-hia. One hundred and eight beads. Forty years.' },
        ],
        lies: [
          { id: 'l1', topic: 'the corporal', claim: 'I never knew the corporal. I saw him for the first time on Tuesday, in the box.', truth: 'In December 1986 he paid Corporal Tarmizi RM 2,000 to write "accident", and on Tuesday night the corporal rang him.', exposedBy: 'e1' },
          { id: 'l2', topic: 'Wednesday morning', claim: 'I never left the gallery on Wednesday morning. I sat beside my niece the whole time.', truth: 'At about half past nine he bought two teh at the canteen and carried the tray to the witness room door; his thumb is on the saucer.', exposedBy: 'e2' },
          { id: 'l3', topic: 'what grows in his garden', claim: 'There is no kecubung in my garden. Who keeps a poison plant behind his kitchen?', truth: 'A kecubung and its cutting grow at his back fence; the pods were stripped and the seeds ground in his stone mortar.', exposedBy: 'e3' },
          { id: 'l4', topic: '1986', claim: 'My brother\'s brakes failed. The lorry rolled back into the river. An accident. Everybody knows.', truth: 'He has known since three in the morning on 1 December 1986 that it was not the brakes.', exposedBy: 'e4' },
        ],
        evidence: [
          { id: 'e1', title: 'Through T.A.K.', text: 'The corporal\'s pencil note in his document tin: "Dibayar RM 2,000. 2.12.86. Melalui T.A.K." Paid through T.A.K.' },
          { id: 'e2', title: 'A thumb on the saucer', text: 'On the underside of the corporal\'s saucer, where you hold a saucer to carry it: Teoh Ah Kow\'s thumb.' },
          { id: 'e3', title: 'Stripped pods', text: 'At the back fence of his garden, a kecubung shrub and its cutting, the pods twisted off; in his outdoor kitchen, a stone mortar with grey paste in it.' },
          { id: 'e4', title: 'Three metres of water', text: 'The brakes passed their test in November 1986, the tide stood three metres over the ramp, and the lorry went in nose first, under its own engine.' },
          { id: 'e5', title: 'Including you', text: 'Tuesday, 9:10 PM: the corporal rings Ah Kow\'s landline and says, "Esok saya cakap semua. Termasuk awak."' },
          { id: 'e6', title: 'The corporal first', text: 'A printed order to T.A.K., Sunday night: "The corporal first. Then the girl\'s book."' },
        ],
        secret: 'He poisoned Tarmizi with crushed kecubung seeds in canteen teh, on the Office of the Chairman\'s printed order and for himself, because Tarmizi had rung him on Tuesday night to say he would tell the court everything, including who paid him in 1986. At three in the morning on 1 December 1986 the man who drove for his brother came to his door wet to the knees with his brother\'s watch and told him what to say.',
        suggested: [
          'Did you know Corporal Tarmizi?',
          'Where were you at half past nine on Wednesday?',
          'What grows in your garden?',
          'What happened to your brother in 1986?',
          'Who pays you three hundred ringgit a month?',
          'Who told you to do this?',
          'What did your niece see that night?',
        ],
        maxQuestions: 14,
        clue: 'Hamidah, from the door: "He has not looked at his niece once in four days. Ask him why."',
      },
      evidence: {
        img: 'ev_c11_watch', hotspot: HOT(),
        title: 'I will keep the time',
        short: '"At three o\'clock he came to my door wet to the knees, with A-hia\'s watch in his hand. He said, your debts are finished; tell them it was the brakes. He gave me the watch to hold. Then he took it back. He said: I will keep the time." Ah Kow said brakes, signed the yard to Sinar Pengangkutan, and paid the corporal. On Sunday a red packet came to his gate.',
        text: 'He does not ask for a lawyer. He puts his beads on the table, in a circle, and talks to them. "I owed A-hia nine thousand ringgit. Mahjong. In 1986 nine thousand was a house. At three o\'clock that night somebody knocked. He was wet to the knees. He had A-hia\'s watch in his hand, still wet, and he said, your debts are finished, tell them it was the brakes. He gave me the watch to hold. Then he took it back from me. He said: I will keep the time." In the morning Ah Kow went to the yard, and looked at his brother on the ramp, and said the word he had been given, and told his niece she had dreamed it. On the third he signed the yard and the lorry to a company called Sinar Pengangkutan, named for a sun a girl had painted, and he paid the corporal two thousand ringgit out of an envelope he had been handed, and paid him again a year later. In 1987 the corporal gave him a page to burn. "I burned it in the kitchen fire. I did not read it. I did not want to know a name I would have to forget." Since then, three hundred ringgit, every month, the morning after the first. On Sunday night a red packet at his gate. On Tuesday night the corporal on the telephone. "Forty years I was quiet. He was going to stop being quiet, and say my name with his." Asked for the driver\'s name, he turns one bead, and says nothing at all.',
      },
    },
  ],

  outcomes: {
    charged: {
      ahkow: { en: 'Teoh Ah Kow is arrested in the gallery with his beads in his hand. He asks his niece to light a joss stick for her father on the eve of the new year. She does not answer.' },
      yang: { en: 'Teoh Siew Yang is charged. She puts her brushes on the dock rail and does not look at her uncle.' },
      ridzuan: { en: 'Ridzuan Tarmizi is charged. His tow truck is taken off the road outside the court, by another tow truck.' },
      shamir: { en: 'Shamir Kassim is charged. Sinar\'s statement says he acted alone, which nobody in the court believes, including the coroner.' },
    },
    correct: ['ahkow'],
  },

  // Hidden consequences, for later cases. AHKOW_FREE: Teoh Ah Kow is not charged. YANG_WRONGED / RIDZUAN_WRONGED /
  // SHAMIR_WRONGED: charged with a poisoning they did not commit (Shamir is guilty of tampering and offering money, not of
  // the tea). GATE_TRUTH / GATE_WRONG: whether the coroner finds that the driver held the cab door shut while Muthu held
  // the torch (Case 12 paints the name on the gate in the GATE_TRUTH branch).
  flagNames: ['AHKOW_FREE', 'YANG_WRONGED', 'RIDZUAN_WRONGED', 'SHAMIR_WRONGED', 'GATE_TRUTH', 'GATE_WRONG'],
  flags: ({ charged, answers }) => ({
    AHKOW_FREE: !charged.includes('ahkow'),
    YANG_WRONGED: charged.includes('yang'),
    RIDZUAN_WRONGED: charged.includes('ridzuan'),
    SHAMIR_WRONGED: charged.includes('shamir'),
    GATE_TRUTH: answers.night === 'held',
    GATE_WRONG: answers.night !== 'held',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  // Earlier cases' flags (BODY_NAMED, GOH_BOX_FOUND, Daniel's) use `when`, so the voice manifest walks every line.
  ending(v) {
    const truth = v.answers.night === 'held';
    const yangHeld = v.has('yang');

    const charges = v.charged.map((id) => ({ who: null, en: CASE11.outcomes.charged[id].en }));
    if (!v.has('ahkow')) charges.push({ who: null, en: 'Teoh Ah Kow is not charged. He takes the evening bus home to Banting with his beads, and waters his garden in the dark.' });
    if (!v.has('shamir')) charges.push({ who: null, en: 'Shamir Kassim is not charged with the tea. Hamidah reports him to the Bar Council for the cut recording and the envelope, and he is in a Sinar car before the letter is typed.' });

    const finding = [];
    if (truth) {
      finding.push({ who: null, en: 'At four o\'clock the coroner reads her finding into a file that was closed in eleven minutes, and she takes eleven minutes over it, on purpose.' });
      finding.push({ who: null, en: 'Unlawful killing by the driver of BCK 210, a man whose name was torn out of the file in 1987, in the presence of Muthusamy a/l Perumal, deceased.' });
      finding.push({ who: 'Hamidah Yusof', en: 'Eleven minutes. She timed it. Forty years late, and exactly on time.' });
      if (v.has('ahkow')) {
        finding.push({ who: null, en: 'Before she rises, Tarmizi Hassan is wheeled in from the hospital with a drip on a pole and his wife at his elbow, and asks to add one thing to his evidence.' });
        finding.push({ who: 'Tarmizi Hassan', orig: 'Empat puluh tahun saya tulis. Hari ini saya cakap.', en: 'Forty years I wrote. Today I speak.' });
      } else {
        finding.push({ who: null, en: 'Tarmizi Hassan does not come back to court. From his hospital bed he sends word that he remembers nothing after Tuesday.' });
      }
    } else {
      const wrongLine = {
        brakes: 'The coroner finds what the corporal found: the brakes failed. The finding of 1986 is written again in 2027, in a better hand.',
        brother: 'The coroner finds that Teoh Ah Kow let the handbrake off for his debts. On the steps Siew Yang tells the press that her uncle was at home in Banting when the engine started, and that she should know, because she was there and he was not.',
        suicide: 'The coroner finds that Teoh Ah Chuan drove into the river himself. In the front row of the gallery Siew Yang stands up, and then sits down again.',
      }[v.answers.night] || 'The coroner writes no new finding, and the old one stands.';
      finding.push({ who: null, en: wrongLine });
      finding.push({ who: null, en: 'The file of 1986 is closed again, for the second time, and this time in a coroner\'s hand.' });
      if (v.has('ahkow')) finding.push({ who: null, en: 'Tarmizi Hassan comes back in a wheelchair and says, in front of the court, what he was paid and who paid it. The coroner thanks him, and writes her finding anyway.' });
    }
    finding.push({ who: null, en: 'In the GOH 2021 carton, among Henry Goh\'s old index cards, Farah finds one from 1986 in his young handwriting: "Teoh A.C., drowning, dental: identified by brother."', when: (f) => f.GOH_BOX_FOUND });

    const panels = [
      { img: 'c11_out_01_charge', mood: 'police', fx: [], place: 'Shah Alam court complex. Thursday, 5:00 PM.', music: 'resolution', lines: charges },
      { img: 'c11_out_02_finding', mood: 'day', fx: ['dust'], place: 'Court 3. The finding.', lines: finding },
    ];

    // Jugra at dusk: the gate, by the finding and by whether Siew Yang is free.
    if (yangHeld) {
      panels.push({ img: 'c11_out_03_chain', mood: 'day', fx: [], place: 'Jugra. Thursday, dusk.', lines: [
        { who: null, en: 'Siew Yang is on remand in Kajang, and her brushes are in a police evidence bag in Shah Alam.' },
        { who: null, en: 'At dusk Pak Itam chains the gate, and stands for a while looking at the pink sun, and then at the ground.' },
      ] });
    } else if (truth) {
      panels.push({ img: 'c11_out_03_name', mood: 'warm', fx: ['dust'], place: 'Jugra. Thursday, dusk.', lines: [
        { who: null, en: 'Siew Yang drives down to Jugra in the last of the light with her tin of brushes and a ladder on the roof of her car.' },
        { who: null, en: 'Under the pink sun, in small black letters, careful as a sign for a shop that will be open a long time, she paints: TEOH AH CHUAN 1934–1986.' },
        { who: null, en: 'Pak Itam holds the ladder, and looks at the ground.' },
      ] });
    } else {
      panels.push({ img: 'c11_out_03_ramp', mood: 'night', fx: [], place: 'Jugra. Thursday, dusk.', lines: [
        { who: null, en: 'Siew Yang drives down to Jugra in the last of the light with her tin of brushes, and paints nothing.' },
        { who: null, en: 'She sits on the washing ramp with her shoes off until the tide comes up to her feet and it is dark, and Pak Itam waits at the gate with his keys and does not ask her to go.' },
      ] });
    }

    panels.push({
      img: 'c11_out_04_kancil', mood: 'night', fx: [], place: 'Court 3, after the court has risen. Thursday, 6:00 PM.', music: 'memory',
      lines: [
        { who: null, en: 'Daniel folds a kancil out of the coroner\'s cause list, slowly, and sets it on the exhibit table beside the photograph of the watch at ten past two.' },
        { who: 'Daniel Raj', en: 'All this time I thought it was a time, machan. It was a minute.' },
        { who: 'Inspector Farah Iskandar', en: 'Asri carried that cup in himself. He has not slept since. I told him it is not his fault.' },
        { who: null, en: 'Since the back seat on the first of December Daniel has slept with the light on. Tonight, he says, he might try it off.', when: WAS_HELD },
        { who: 'Daniel Raj', en: 'They closed a drowning in eleven minutes, machan. Mine took a year, and it is still not shut.', when: DNAA },
        { who: null, en: 'In Butterworth, at the ferry terminal, Madam Ong closes her stall and sets out one glass of teh.', when: (f) => f.BODY_NAMED },
        { who: null, en: 'In Butterworth, at the ferry terminal, Madam Ong closes her stall and sets out two glasses of teh, as she has every night since 2021.', when: (f) => !f.BODY_NAMED },
      ],
    });

    panels.push({
      img: 'c11_out_05_phone', mood: 'night', fx: ['rain'], place: 'Brickfields. Friday 5 February, the eve of the new year, 2:10 AM.', music: 'chairman',
      lines: [
        { who: null, en: 'Restoran Bala\'s shutter is down, and the street is red with lanterns for the morning. Behind the shutter the wall phone rings, and keeps ringing, until you come down the stairs in the dark and lift it.' },
        { who: 'The Chairman', en: 'You found my first night, detective. Thank you.' },
        { who: null, en: 'A lid snaps open on the line, and shut.' },
        { who: 'The Chairman', en: 'On the fifteenth night of the new year, come to the gate. Bring the plate.' },
        { who: null, en: 'The line goes dead. Across the street a firecracker goes off early, and somebody\'s grandmother shouts at it.' },
      ],
    });
    return panels;
  },
};
