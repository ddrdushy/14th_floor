// CASE 7: THE SCREEN. Level 15, Menara Sinar, Jalan Ampang; Basement 2; Brickfields; Chow Kit; Dang Wangi.
// Truth (writers only): HOMICIDE, in forty seconds of darkness, on a live order.
// Muthusamy a/l Perumal ("Muthu"), 71, of Jalan Thambapillay, Brickfields, drove the Chairman from November
// 1986. From 1997 he sat in the high-backed chair behind every screen at every AGM and dinner, a silhouette
// for guests who needed to believe the Chairman was in the room; the voice always came from somewhere else
// (the glass room on Level 14 until Bomba sealed it after Rashid Osman's death, then a telephone). From 2014
// he went to "the Chairman's" quarterly medical checks with Dr. Meera Rajaratnam as the patient "Tuan", so
// that no doctor has ever had the Chairman's blood. In August 2016 he collected the third D.R. lighter from
// Mani's in Klang, and sat at table seven in Restoran Bala and paid for two teh, on instructions (he is the
// "old man in a white shirt" Daniel remembers). Every Friday for ten years he ate thosai at Bala Anne's
// counter and looked up at the detective's window. In September Dr. Meera found pancreatic cancer.
// On Friday 13 November 2026 Muthu told the Chairman, to his face in the car, that he was dying, would not
// lie in front of God, and would show the detective the trick after the dinner. "Of course, Muthu. After the
// forty seconds." Muthu understood it was a sentence and went anyway; he told Bala Anne only "I told Tuan
// myself", and left a kolam of three shapes (a chair, a key, a boot) on his doorstep, and a letter in the
// boot of his old Mercedes. The same Friday Sinar paid "technical services" RM 300,000 to its Head of Events.
// Saturday 14 November, Sinar's fortieth dinner on Level 15: 20:40 Muthu brought the detective a teh at
// table six ("When the lights go out, look behind the screen"). 21:15 Dr. Meera, let in by Desmond, gave him
// 5 mg of morphine for the pain. 21:20 the black car with no plates came down to Bay V1 on Basement 2 (the one
// bay Sinar's cameras were installed to leave blind). 21:28 Desmond Yap, 54, Head of Events and AV since 1997,
// dialled the car from the telephone hybrid on the AV rack (Line 2; the prepaid 011-2604 1986 sat on the B2
// in-building cell) and at 21:32 put the voice on air. 21:44:12 Nurul Ain photographed the chair through the
// gap between panels 11 and 12: Muthu's mouth shut while the voice spoke, Desmond behind him with a hand to
// his headset. 21:45 Desmond sent his assistant to the back booth; camera 9 went to "privacy". 21:51:06
// Desmond fired cue 40 by hand, four seconds early; the talkback said "Sekarang." He took the cable of the
// prop microphone (never connected, in 29 years) and strangled Muthu from behind the chair. The detective was
// two metres from the silk when Bishnu Thapa turned them back. Lights up at 21:51:46; the backlight stayed
// off; Desmond held on behind the dark silk until 21:54, put the cable back on the stand (on the wrong side),
// lit a fresh cigarette with his heat-shrink torch and put it between the dead fingers, and at 21:54:50 said
// "Dah, Tuan" into his headset. The old archive cassette deck on the rack, recording the CHAIRMAN bus in
// long-play since 1997, kept all of it, with the hum of B2 behind the voice. 21:58:20 the call dropped; the
// car went up the loading-bay ramp at 21:58:31. 22:14 Tan Sri Azhar found the body. After midnight Desmond
// re-patched the CHAIRMAN feed to the dead ARAS 14 cable so that anyone looking would look at Level 14.
// At 4:40 AM he ran for the pickup he had been promised ("Chow Kit, the Jalan Raja Bot side, at five"). The
// black car came, saw the detective's knee in his back, and left.
// Red herrings: Tan Sri Azhar Kamaruddin, 68, Group MD since 1997, bought "the Chairman's" prognosis from
// Dr. Meera for RM 100,000 in October and drafted himself in as Executive Chairman "after the 40th"; he knew
// since 2019 that the man in the chair was Muthu and said nothing; he never left the head table in the dark.
// Nurul Ain, 27, crept to the screen at 21:44, took one frame, hid the card in table six's sugar bowl for the
// detective, and lied about all of it. Dr. Meera Rajaratnam, 58, sold the file and gave the injection, and
// lied that she never went behind the screen; her 5 mg was a kindness, not a cause.
// The Chairman: NOT named, NOT seen. Case 7 brings the player to his car's empty bay, his voice live (the
// speech, the talkback order on tape) and, at Muthu's cremation, his hand on the detective's shoulder and his
// voice in their ear ("I need a new driver"). Private note: his identity is still undecided. Nothing here (the
// medical file, which is Muthu's; the car; the prepaid ending in 1986; Jeffrey Ho or Kasun at the wheel in some
// branches) may pin it to a person, and nobody in this case has seen his face except Muthu.
// Daniel, by Cases 5 and 6: free in Farah's safe house, remanded at Sungai Buloh, or still held by Sinar
// (taken in Case 5 and not rescued from RU-07 in Case 6), in which case he was in the car on B2 tonight.

// Daniel's state after Case 6: still Sinar's (taken in Case 5, RU-07 not found), remanded, or free.
const HELD = (f) => (!!f.DANIEL_TAKEN || !f.DANIEL_FOUND) && !f.ARCHIVE_SEIZED;
const REMAND = (f) => !HELD(f) && !!f.DANIEL_CHARGED;
const FREE = (f) => !HELD(f) && !f.DANIEL_CHARGED;

// The line the reverse tape plays: it must stay word for word the same as in the opening.
const TABLE_LINE = { who: 'The Chairman', en: 'And at table six, a detective I have watched for ten years. Good evening, detective. You came. I knew you would be listening.' };

const WHERE = [
  { id: 'screen', label: 'Behind the screen, Level 15', note: 'Three hundred guests watched his shadow speak from the chair for nineteen minutes, with a cigarette in its hand.' },
  { id: 'glass', label: 'The glass room, Level 14', note: 'The feed marked CHAIRMAN on the AV rack runs down through the floor to a microphone in the room directly under the screen. He has spoken from there since 1997.' },
  { id: 'car', label: 'A car on Basement 2', note: 'A black car with no plates came down the ramp to Bay V1 at 9:20 PM and went up again at 9:58.' },
  { id: 'tape', label: 'A recording, made in advance', note: 'Sinar\'s events office says the Chairman has recorded his speech a week early every year since 2021, at a studio in Damansara.' },
];

export const CASE07 = {
  id: 'case07',
  number: 7,
  title: 'The Screen',
  place: 'Level 15, Menara Sinar, Jalan Ampang',
  victim: 'Muthusamy a/l Perumal, 71, driver, of Jalan Thambapillay, Brickfields. Found in the chair behind the screen on Level 15 at 10:14 PM on Saturday.',
  question: 'Who killed Muthusamy Perumal?',
  brief: 'Sinar Holdings turns forty, and its Chairman speaks to three hundred guests from behind a silk screen on Level 15, in the voice you have heard every night for five years. He greets you at table six by name. Then the lights go out for forty seconds, one for each year. When they come back, the shadow in the chair is an old man from Brickfields who brought you a glass of teh, and he is dead. Nobody leaves the floor until dawn, and you have until dawn.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end of this one: who killed Muthu in the dark, and where the voice was really speaking from. Hamidah Yusof will write one place on a charge sheet, once. Nobody will tell you if you get either of them right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Bala Anne sent a photograph of table six, wiped clean, with one glass of teh on it that nobody has touched.',
  deduction: {
    lede: 'Farah will arrest whoever you name for the murder of Muthusamy Perumal, on your word and her own signature, before Sinar\'s lawyers reach Dang Wangi. Name everyone who killed him or helped, and only them.',
    button: 'Tell Farah',
    confirm: 'Farah will arrest {names}. Bala Anne will hear it from you, at the counter, before he opens.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Farah',
    questions: [
      {
        id: 'voice', q: 'Where did the voice come from?', short: 'Hamidah writes',
        lede: 'Hamidah Yusof has the Chairman\'s own words on tape now. To put them on a charge sheet she needs the place he said them from. She will write one place under "and abetment by", once, and Sinar\'s lawyers will spend a year attacking whatever she writes.',
        options: WHERE,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy
  // in cases.js). Until it is solved they are not on the map, the board or the office wall.
  suspects: [
    {
      id: 'azhar', name: 'Tan Sri Azhar Kamaruddin', role: 'Group Managing Director, Sinar Holdings. 68', img: 'sus_azhar',
      revealedBy: 'c7_01',
      revealLine: 'He went behind the screen at 10:14 PM, as he has every year since 1997, to thank an empty chair. This year it was not empty, and he was the first to say the Chairman was dead.',
      look: { skin: '#c48b62', hair: 'side-part', hairColor: '#b8b8b8', coat: 'blazer', eyewear: 'none', mark: 'moustache' },
      motive: 'Twenty-nine years as the public face of a company whose Chairman nobody has seen. If the Chairman were dead, somebody would have to chair the board.',
      claim: 'Says he sat at the head table through the speech and the forty seconds, and went behind the screen only at 10:14.',
    },
    {
      id: 'meera', name: 'Dr. Meera Rajaratnam', role: 'Consultant physician, Jalan Kia Peng. 58', img: 'sus_meera',
      revealedBy: 'c7_02',
      revealLine: 'She was not on the guard\'s list, but at 9:15 PM she went behind the screen with a small black bag and came out seven minutes later with her hands shaking.',
      look: { skin: '#8d5a3a', hair: 'bun', hairColor: '#7a7a7a', coat: 'blazer', eyewear: 'round', mark: 'none' },
      motive: 'None known. A guest at table nine. Sinar\'s Office of the Chairman has paid her a retainer since 2014, and nobody at her clinic knows for what.',
      claim: 'Says she never left table nine all evening, and has never met the dead man.',
    },
    {
      id: 'desmond', name: 'Desmond Yap', role: 'Head of Events and AV, Sinar Holdings. 54', img: 'sus_desmond',
      revealedBy: 'c7_03',
      revealLine: 'He has run the screen at every Sinar dinner since 1997, from a desk three metres behind the chair. He says he never left that desk.',
      look: { skin: '#f1d2b6', hair: 'short', hairColor: '#9a9a9a', coat: 'leather', eyewear: 'square', mark: 'none' },
      motive: 'None known. Twenty-nine years putting the Chairman\'s voice into rooms. He says he has never seen the Chairman\'s face.',
      claim: 'Says he stood at the AV desk with his hands on the faders for the whole forty seconds, and that the Chairman spoke, as always, from the glass room on Level 14.',
    },
    {
      id: 'ain', name: 'Nurul Ain', role: 'Journalist. Dato\' Rashid Osman\'s daughter. 27', img: 'sus_ain',
      revealedBy: 'c7_04',
      revealLine: 'Sinar\'s own photographer caught her outside the press rope at 9:44 PM, crouched at the edge of the screen with her camera up. She told Sinar\'s security she never left the press pen.',
      look: { skin: '#d9a77f', hair: 'tudung', hairColor: '#151210', coat: 'trench', eyewear: 'none', mark: 'none' },
      motive: 'Her father fell from the floor below this one. She has said in print that she will show the world the Chairman\'s face if it is the last thing she does.',
      claim: 'Says she was behind the press rope all night and that Sinar took her camera, card and all.',
    },
  ],

  opening: [
    {
      img: 'c7_intro_01_invite', mood: 'warm', fx: ['rain'], place: 'Restoran Bala, Brickfields. Wednesday, 11:20 PM.', music: 'office',
      lines: [
        { who: null, en: 'The courier will not come in out of the rain. He hands Bala Anne a black envelope across the counter, a small brass sun pressed into its flap, and waits to watch it opened.' },
        { who: null, en: 'Sinar Holdings Berhad, forty years. Saturday, 14 November, Level 15, Menara Sinar. The Chairman will address his guests. Table 6. For two.' },
        { who: 'Bala Anne', orig: 'Thambi. Poga vendaam.', en: 'Boy. Don\'t go.' },
        { who: 'Bala Anne', en: 'Table six. That is my table. Now he is taking my tables also.' },
        { who: null, en: 'On the television over the counter, Dr. Shanti Menon\'s appeal has been put off again, to next year. Bala Anne does not even look up.', when: (f) => f.SHANTI_WRONGED },
        { who: 'Bala Anne', en: 'That durian man Ravi says if you go to the big party, bring him back a piece of cake. I told him come and eat here like a human being.', when: (f) => f.RAVI_WRONGED },
        { who: null, en: 'Pinned by the till, a postcard from Pandamaran with no message, only a drawing of two hands in bandages. Ah Fook\'s trial is in January.', when: (f) => f.AHFOOK_WRONGED },
        { who: null, en: 'Pinned by the till, three lines from Puan Rohana in Klang: Amirul is out on bail. He sleeps in his old room and does not speak.', when: (f) => f.AMIRUL_WRONGED },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c7_intro_02_tower', mood: 'night', fx: ['rain'], place: 'Jalan Ampang. Saturday, 7:40 PM.', music: 'tension',
      lines: [
        { who: null, en: 'Tonight Menara Sinar is lit amber from the pavement to the brass sun on its crown, all but one storey, a third of the way up, that stays black.' },
        { who: null, en: 'In the drop-off lane, a grey sedan with its engine running. WXY 1408. The driver wears a white shirt and does not look at you, which is how you know he has been looking.', when: (f) => f.JASON_FREE },
        { who: 'Inspector Farah Iskandar', en: 'Table six, for two. He knew I would come. Officially I am here for the deputy minister. Unofficially I am your plus one, and I am not dancing.' },
        { who: 'Inspector Farah Iskandar', en: 'My superintendent is at table two with the deputy minister. Khairul has a new watch. I have not asked him where from.', when: (f) => !f.KHAIRUL_WRONGED },
        { who: 'Inspector Farah Iskandar', en: 'Khairul is suspended, and he is still invited. Table thirty, by the kitchen door. Sinar never forgets a friend.', when: (f) => f.KHAIRUL_WRONGED },
        { who: 'Inspector Farah Iskandar', en: 'Ninety officers at Bukit Aman are still reading the cartons from Jugra. Half the names on tonight\'s guest list are in them.', when: (f) => f.ARCHIVE_SEIZED },
        { who: 'Inspector Farah Iskandar', en: 'Every name on tonight\'s guest list was in a carton I never got to open. They will all shake my hand.', when: (f) => f.ARCHIVE_LOST },
        { who: 'Inspector Farah Iskandar', en: 'Daniel is in a house I have not told you about, with two of my men and the television on. He asked me to tell you one thing. Do not drink anything you did not order.', when: FREE },
        { who: 'Inspector Farah Iskandar', en: 'Daniel is in Sungai Buloh, Block C, with the radio on. His lawyer says February. He asked me to tell you one thing. Do not drink anything you did not order.', when: REMAND },
        { who: null, en: 'Nobody has seen Daniel since August. Every few weeks a paper kancil comes under your office door, folded from something of theirs. You keep them in the drawer, and Farah does not ask.', when: HELD },
        { who: null, en: 'At the lift doors, a man in a dinner jacket with an earpiece and a policeman\'s stillness: Zulkifli Hamid, up from Westport for the night. As Farah passes him he says, very quietly, "Left shoulder, Inspector."', when: (f) => f.ZUL_FREE },
      ],
      kb: { from: [1.0, 0, 2], to: [1.12, 0, -2] }, sfx: 'thunder',
    },
    {
      img: 'c7_intro_03_sunroom', mood: 'warm', fx: ['dust'], place: 'Level 15, Menara Sinar. 8:20 PM.',
      lines: [
        { who: null, en: 'Level 15 has been emptied of its directors for one night and turned into a ballroom: three hundred guests at round tables, a band playing P. Ramlee, and at the far end, a screen.' },
        { who: null, en: 'Twelve panels of white silk, five metres high, with Sinar\'s sun painted across them in gold. Behind it the light is off. Everybody looks at it anyway.' },
        { who: null, en: 'Under your feet is the floor that is not there. Rosli stands at the fire exit in his dress uniform, because Bomba sealed Level 14 after Dato\' Rashid fell, and somebody has to stand on top of the seal.' },
        { who: null, en: 'At the door the Office of the Chairman\'s new secretary greets every guest by name. Melissa Ong. She greets you by yours, and does not offer her hand.', when: (f) => !f.VIVIAN_FREE && f.MELISSA_FREE },
        { who: null, en: 'On every table, a card from the Office of the Chairman in a secretary\'s copperplate. Vivian Chua writes them from Singapore now, Farah says, and they come up by courier.', when: (f) => f.VIVIAN_FREE },
        { who: null, en: 'In the press pen, behind a velvet rope, a young woman with a camera she has been told not to raise: Nurul Ain, whose father fell from the floor below.' },
      ],
      kb: { from: [1.08, -2, 0], to: [1.0, 2, 1] },
    },
    {
      img: 'c7_intro_04_teh', mood: 'warm', fx: [], place: 'Table six. 8:40 PM.',
      lines: [
        { who: null, en: 'An old man in a white shirt, with a staff badge that has no name on it, sets a glass of teh tarik in front of you. Nobody at table six ordered it. It is made exactly the way Bala Anne makes it.' },
        { who: 'Muthu', orig: 'Thambi. Vilakku anainjadhum, thiraikku pinnaadi paaru.', en: 'Boy. When the lights go out, look behind the screen.' },
        { who: 'Muthu', orig: 'Bala-kitta sollu, Muthu vandhaan-nu.', en: 'Tell Bala that Muthu came.' },
        { who: null, en: 'Then he is gone through a service door beside the screen, hands behind his back, like a man who has walked through it all his life.' },
      ],
      kb: { from: [1.0, 1, 0], to: [1.12, -1, 0] },
    },
    {
      img: 'c7_intro_05_silhouette', mood: 'night', fx: ['dust'], place: '9:32 PM.', music: 'chairman',
      lines: [
        { who: 'Tan Sri Azhar', en: 'Ladies and gentlemen. For the fortieth time: the man who made Sinar.' },
        { who: null, en: 'The room goes dark, and the screen lights from behind. On the silk, the shadow of a man in a high-backed chair, a cigarette in his hand.' },
        { who: 'The Chairman', en: 'Forty years ago I had one lorry, a yard in the oil palm under Bukit Jugra, and a sun painted on the gate. I have the gate still.' },
        TABLE_LINE,
        { who: null, en: 'Three hundred people turn to look at you. On the silk the shadow lifts a lighter, and the flame comes up a beat after the snap, as if the hand were waiting to hear it.' },
        { who: 'The Chairman', orig: 'Empat puluh tahun. Empat puluh saat.', en: 'Forty years. Forty seconds.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.16, 0, 1] },
    },
    {
      img: 'c7_intro_06_dark', mood: 'night', fx: [], place: '9:51 PM.', music: 'tension',
      lines: [
        { who: null, en: 'Every light on Level 15 goes out at once: forty seconds of dark, one for each year. Three hundred people hold their breath, because that is what they were told to do.' },
        { who: null, en: 'You are already walking, the way the old man asked, between the tables, toward the edge of the screen.' },
        { who: null, en: 'Two metres from the silk you hear a chair creak, and a sound like somebody breathing through a straw. Then a hand closes on your arm.' },
        { who: 'Bishnu Thapa', en: 'Sorry, boss. Nobody goes behind the screen. Nobody.' },
        { who: null, en: 'The lights come up. The screen is white and empty. Three hundred people applaud. You go back to table six, and your teh has gone cold.' },
      ],
      kb: { from: [1.12, 0, 0], to: [1.02, 0, 0] },
    },
    {
      img: 'c7_intro_07_scream', mood: 'night', fx: ['siren'], place: '10:14 PM.',
      lines: [
        { who: null, en: 'At fourteen minutes past ten Tan Sri Azhar Kamaruddin goes behind the screen, as he has every year since 1997, to thank an empty chair.' },
        { who: 'Tan Sri Azhar', orig: 'Tuan dah tak ada.', en: 'The Chairman is gone.' },
        { who: null, en: 'Three hundred telephones say it before he has finished: the Chairman of Sinar Holdings is dead.' },
        { who: 'Inspector Farah Iskandar', en: 'Lifts off. Stairs shut. Nobody leaves this floor until I say so, Tan Sri. Not even you.' },
      ],
      kb: { from: [1.05, -1, 0], to: [1.0, 1, 0] },
    },
    {
      img: 'c7_intro_08_chair', mood: 'police', fx: [], place: 'Behind the screen.',
      lines: [
        { who: null, en: 'In the high-backed chair behind the silk, his head fallen to one side and a cigarette burnt down to the filter between his fingers, sits the old man who brought you your teh.' },
        { who: 'Inspector Farah Iskandar', en: 'Three hundred people watched this man give a speech. He has no microphone. He has no earpiece. He has a staff badge with no name on it.' },
        { who: 'Inspector Farah Iskandar', en: 'Whoever was talking to us tonight, it was not him.' },
        { who: null, en: 'His wallet says Muthusamy a/l Perumal, seventy-one, Jalan Thambapillay, Brickfields. Two streets from your office.' },
        { who: null, en: 'At two minutes past eleven Sinar Holdings tells the press that the Chairman is well, and thanks his guests for a memorable evening.' },
      ],
      kb: { from: [1.0, 0, 2], to: [1.14, 0, -2] },
    },
    { title: { kicker: 'Case 7', name: 'The Screen' }, fx: ['rain'] },
  ],

  levels: [
    // ---------------- The Sun Room, Level 15 ----------------
    {
      id: 'c7_01', phase: 'The Sun Room', title: 'Behind the screen',
      game: 'hiddenobject', variant: 'silhouette',
      brief: 'Between the silk and the service corridor there is a space the width of a lorry, and Sinar has kept it the same for twenty-nine years: a high-backed chair, a side table, a microphone on a stand, a two-kilowatt lamp at the chair\'s feet aimed up through the silk, and, three metres back, the AV desk. Dang Wangi\'s photographer is still stuck in the lift lobby. Find everything that was there. The list shows only outlines.',
      params: { scene: 'desk', targets: 14, objects: 78 },
      evidence: {
        img: 'ev_c7_chair', hotspot: { x: 0.6, y: 0.68, r: 0.12 },
        title: 'The wrong man',
        short: 'The man in the chair had no microphone, no earpiece and no telephone: only a cigarette, a cheap plastic lighter, a staff badge marked M. and a sticking plaster inside his left elbow. The microphone on the stand has never been connected to anything. And the cigarette between his fingers burnt down with its ash in one piece: nobody ever lifted it to his lips.',
        text: 'A wallet with forty ringgit and a photograph of a woman in a 1980s sari. A plastic lighter from a petrol station, red, three for a ringgit. A staff badge on a lanyard, OFFICE OF THE CHAIRMAN, and under it one letter: M. A sticking plaster on the inside of his left elbow, over a fresh needle mark. No earpiece, no microphone on his collar, no telephone in any pocket. The microphone on the stand beside the chair is a beautiful old ribbon microphone, and the black cable that runs from it coils on the floor and ends in a plug that goes into nothing. The lamp at his feet is aimed up through the silk, so that the chair throws its shadow, and so that from anywhere in the gap between two panels the man in the chair is lit face-on, bright as day. And the cigarette: burnt down between two dead fingers to the filter, with the whole column of ash still standing on it like a little grey finger of its own. Rosli looks at it a long time. "Nobody smoked that," he says. "Somebody lit it and gave it to him." Tan Sri Azhar, who found him at 10:14, sits in the corridor with his head in his hands and says he has never seen this man in his life.',
      },
    },
    {
      id: 'c7_02', phase: 'The Sun Room', title: 'The small door',
      game: 'witness', variant: 'statement',
      brief: 'There is one way behind the screen from the ballroom: a narrow service door in the panelling to its left, and on it, from seven o\'clock, a Kawalan Sentosa guard you have met before. Bishnu Thapa, who remembers faces, was moved off the loading bay at Menara Sinar once already this year. Tonight they gave him a door. He will tell it once.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Statement of Bishnu Thapa, 41, Kawalan Sentosa. Service door, Level 15. Recorded Saturday, 10:50 PM.',
        introLine: 'Bishnu stands to give it, cap under his arm, though Farah has pulled out a chair for him. "I remember faces, madam. Doors also."',
        retryLine: 'He closes his eyes and gives it again, door by door, in exactly the same order.',
        statement: [
          'Six years I stood the loading bay at Menara Sinar. Tonight they put me on the small door beside the screen, from seven o\'clock. One instruction: nobody goes behind the screen except the three names on my list. The Events manager, Mr. Desmond. His assistant, the boy Faiz. And one with no name, only "M., Office of the Chairman": an old uncle in a white shirt, who smiled at me like my father and went in at twenty past nine.',
          'At a quarter past nine a lady doctor came with a small black bag and said the Chairman needed her. She was not on my list. Mr. Desmond came to the door and said let her in. She came out at twenty-two minutes past, and her hands were shaking.',
          'At a quarter to ten Mr. Desmond sent the boy Faiz out to the sound booth at the back of the hall. After that, behind the screen, there was only Mr. Desmond at his desk and the old uncle in the chair. Nobody else went in. I was at the door every second.',
          'When the lights went out, somebody came walking out of the tables toward the screen. I took the arm. It was you, boss. I am sorry. I said nobody goes behind the screen, and I said it two times because I was frightened.',
          'At fourteen minutes past ten Tan Sri came. He is not on my list, but he is Tan Sri. He went in alone. Then he shouted. At twenty past ten madam told me to collect the press cameras in a box. The young lady with the black tudung gave me hers with a smile. Its little card door was open. There was no card inside.',
        ],
        questions: [
          { q: 'Where does Bishnu usually stand at Menara Sinar?', options: ['The lobby', 'The loading bay', 'Basement 2', 'Level 14'], a: 1 },
          { q: 'How many names were on his list?', options: ['One', 'Two', 'Three', 'Four'], a: 2 },
          { q: 'When did the lady doctor come?', options: ['Nine o\'clock', 'A quarter past nine', 'Half past nine', 'A quarter to ten'], a: 1 },
          { q: 'Who let her in?', options: ['Bishnu himself', 'Tan Sri Azhar', 'Mr. Desmond', 'The old uncle'], a: 2 },
          { q: 'When did she come out?', options: ['9:18', '9:22', '9:30', '9:51'], a: 1 },
          { q: 'Where was the boy Faiz sent at a quarter to ten?', options: ['Home', 'The kitchen', 'The sound booth at the back of the hall', 'Basement 2'], a: 2 },
          { q: 'Who was behind the screen after that?', options: ['Nobody', 'Only Mr. Desmond and the old uncle', 'The doctor and the old uncle', 'Tan Sri and Mr. Desmond'], a: 1 },
          { q: 'When did Tan Sri go behind the screen?', options: ['9:51', '10:00', '10:14', '10:20'], a: 2 },
          { q: 'What was missing from the young lady\'s camera?', options: ['Its lens', 'Its battery', 'Its memory card', 'Its strap'], a: 2 },
        ],
      },
      evidence: {
        img: 'ev_c7_door', hotspot: { x: 0.39, y: 0.84, r: 0.11 },
        title: 'Three names on a list',
        short: 'Bishnu\'s door: the old man went in at 9:20. A lady doctor with a black bag, not on the list, was let in by Desmond Yap at 9:15 and came out at 9:22 shaking. At 9:45 Desmond sent his assistant away. From then until Tan Sri Azhar at 10:14, behind the screen there was only Desmond at his desk and the old man in the chair.',
        text: 'Bishnu Thapa has stood one door or another at Menara Sinar for six years and has never once been asked what he saw through it. Three names on his list, one of them only a letter. A doctor with a black bag who was not on it, let in by the Events manager himself, who came out seven minutes later with her hands shaking. An assistant sent to the back of the hall at a quarter to ten, which is six minutes before the dark. After that, for twenty-nine minutes, two men behind the silk: one at a desk and one in a chair. And at 10:20, a box of press cameras, and one camera with its card door open and a young woman smiling as she handed it over. The doctor is Dr. Meera Rajaratnam of Jalan Kia Peng, seated at table nine, who has told Dang Wangi that she never left her table all evening.',
      },
    },
    {
      id: 'c7_03', phase: 'The Sun Room', title: 'Line 2',
      game: 'wiretap', variant: 'classic',
      brief: 'The AV rack stands in the service corridor three metres behind the chair: amplifiers, a broadcast delay, a patch bay of black cables with paper tags. Some time after the body was found, somebody pulled half the cables out in a hurry and pushed them back wrong. Desmond Yap, Head of Events and AV, says it was Dang Wangi. Wire it back into one working circuit, with every feed live.',
      params: {
        size: 7, targets: 3,
        clue: 'The tags are in one tidy hand. The thickest cable on the rack goes down through a hole in the floor.',
      },
      evidence: {
        img: 'ev_c7_patch', hotspot: { x: 0.57, y: 0.72, r: 0.12 },
        title: 'ARAS 14',
        short: 'Rewired, the rack has three feeds into the ballroom: the band, the MC, and one tagged CHAIRMAN, which runs down through the floor on a thick grey cable tagged ARAS 14, GLASS ROOM. Desmond Yap: "He speaks from the glass room on 14, directly under the chair. Since 1997. I put him on air and I never leave my desk."',
        text: 'Seven tags, one tidy hand. BAND. MC. HOUSE. DELAY 1.2 S. And on the input that feeds the ballroom\'s speakers through a broadcast delay, so that a man at this desk could cut anything said in the room before the room heard it: CHAIRMAN. The cable from it is older than everything else on the rack, thick and grey, and it goes down through a hole cut in the floor of Level 15, tagged ARAS 14, GLASS ROOM. Desmond Yap stands beside you with his arms folded and a headset round his neck. He has run the screen at every Sinar dinner since the tower opened. "He has spoken from the glass room since 1997," he says. "Directly under the chair. I put him on air, I watch the delay, and I never leave this desk. Not in twenty-nine years." Farah asks him whether he has ever seen the Chairman. "Nobody has," he says, and smiles as if she has asked whether he has ever seen God.',
      },
    },
    {
      id: 'c7_04', phase: 'The Sun Room', title: 'The press pen',
      game: 'lineup', variant: 'single',
      brief: 'Sinar\'s event photographer, Encik Lee, shoots every dinner from the back of the hall on a long lens, and at 9:44 PM, between two frames of the screen, he caught somebody crouched at its edge, outside the press rope, with a camera up. He did not know the face. He knows the twelve press accreditation photographs Sinar issued tonight. Look at his frame, fast, and pick the face.',
      params: { rounds: 3, studySeconds: [10, 8, 6] },
      evidence: {
        img: 'ev_c7_press', hotspot: { x: 0.5, y: 0.5, r: 0.18 },
        title: 'Along the wall',
        short: 'Frame 212, 9:44 PM: Nurul Ain, outside the press rope, crouched at the gap between panels eleven and twelve of the screen with her camera raised. At 10:20 she told Sinar\'s security she had never left the press pen, and that Sinar had taken her card with her camera.',
        text: 'Encik Lee shoots on a long lens with the shutter set to silent, because the Chairman\'s office has always asked for no clicks during the speech. Frame 211, 9:43:58: the silk lit gold, the shadow in the chair, the cigarette up. Frame 212, 9:44:09: the same, and at the bottom left of the frame, where the screen meets the panelled wall, a small dark shape crouched beside the gap between panels eleven and twelve, one arm up, a camera at its eye. Frame 213, 9:47: nothing there. Three times out of three it is the same face from Sinar\'s press accreditation: Nurul Ain, freelance, whose pass was issued by the Office of the Chairman itself. Dato\' Rashid Osman\'s daughter. Encik Lee rubs his eyes. "Twenty years I have photographed that screen," he says. "Nobody ever went to look round the side. Nobody even thought of it."',
      },
    },
    {
      id: 'c7_05', phase: 'The Sun Room', title: 'Six millimetres',
      game: 'dna', variant: 'mixed',
      brief: 'Dr. Lim Siew Ping, forensic pathologist at Hospital Kuala Lumpur, comes up the fire stairs at a quarter to midnight because the lifts are off, fifteen floors in flat shoes and a bad temper. She kneels behind the chair with a torch in her teeth, and then she sends her swabs down to her bench at HKL by motorcycle and reads the bands off her phone at two in the morning. Read them with her.',
      params: { suspects: 7 },
      evidence: {
        img: 'ev_c7_cable', hotspot: { x: 0.4, y: 0.5, r: 0.18 },
        title: 'Six millimetres',
        short: 'Ligature strangulation, from behind, with a smooth cord six millimetres wide; just under the right ear, the imprint of a small latch. The cable of the microphone beside the chair is six millimetres wide, its plug has that latch, and Muthu\'s skin is on the middle of it. A woven camera strap is twenty-five. The needle mark held five milligrams of morphine: enough for pain, nowhere near enough to kill.',
        text: 'Dr. Lim says it in the order she found it, the torch still in her hand. Pinpoint bleeding in the whites of his eyes. A thin pale groove round the front and sides of his neck, horizontal, crossing at the back: something smooth, six millimetres wide, pulled from behind the chair by a person standing. Just under his right ear, pressed into the skin and still sharp at midnight, the imprint of a small square latch with a tooth. Time of death between 9:52 and 9:56, by his temperature and the lamp. She asks to see every cord behind the screen. The cable of the microphone on the stand is six millimetres, black, smooth, and its plug is a round metal connector with exactly that latch. Her bench at HKL finds Muthu\'s skin cells packed into the middle third of it, a metre from either end. On the inside of his elbow, the needle mark: five milligrams of morphine, in his blood at the level a doctor would give a man in pain. "Somebody made him comfortable," Dr. Lim says, "and then somebody else stood behind his chair." Ain\'s camera strap, which Sinar\'s security took at the door, is woven, and twenty-five millimetres wide.',
      },
    },
    {
      id: 'c7_06', phase: 'The Sun Room', title: 'Forty seconds',
      game: 'fusebox', variant: 'classic',
      brief: 'Behind the service corridor is the dimmer room, a cupboard of breakers that runs every light on Level 15. At 10:20 Farah ordered the house lights full up and somebody tried, and tripped the whole board. The lighting desk will not show its memory until every breaker is back on. Turn them all on.',
      params: {
        size: 5, pattern: 'x', presses: 6,
        clue: 'Rosli: "Every one of these breakers is labelled except the one for the lamp behind the chair. That one has a strip of black tape."',
      },
      evidence: {
        img: 'ev_c7_dimmer', hotspot: { x: 0.79, y: 0.56, r: 0.1 },
        title: 'Cue forty, by hand',
        short: 'The lighting desk\'s memory: cue 40, every light to black, was set to fire by timecode at 21:51:10. It fired at 21:51:06, four seconds early, from the GO button on the corridor desk: by hand. Cue 41, the house lights up, fired by timecode at 21:51:46. The lamp behind the chair was switched off by hand at the same desk and not switched on again until 10:20.',
        text: 'The board comes back row by row and the lighting desk in the corridor wakes up and tells you what it did tonight, in the flat way machines confess. Cue 39, the screen up and the house down, at 21:32:00, on timecode. Cue 40, every light on Level 15 to black, programmed to fire on timecode at 21:51:10. It fired at 21:51:06, four seconds early, because somebody pressed GO on the corridor desk with his own hand. Cue 41, the house lights up, fired on timecode at 21:51:46, because nobody stopped it. The lamp at the chair\'s feet, the one with black tape on its breaker, was switched off by hand at the same desk at 21:51:06 and stayed off until Farah\'s order at 10:20, so that when the lights came up the silk stayed blank and nobody could see what was behind it. And the sound desk beside it: during the forty seconds its faders moved by themselves, on a recorded move it calls automation playback. Nobody\'s hands needed to be on them.',
      },
    },
    {
      id: 'c7_rz', phase: 'The Sun Room', title: 'Privacy mode',
      game: 'alibi', variant: 'classic',
      when: (flags) => !!flags.RIZAL_FREE,
      brief: 'Tonight\'s guard force on Level 15 belongs to Kawalan Sentosa, and Kawalan Sentosa\'s regional supervisor for Kuala Lumpur came up himself to run it from the control room: Rizal Hamdan, who once deleted seventeen minutes from a lift camera in Mont Kiara and has done well ever since. He hands over every guard\'s night, in writing, with a smile. One of the accounts cannot be true.',
      params: { rounds: 3 },
      evidence: {
        img: 'ev_c7_roster', hotspot: { x: 0.24, y: 0.78, r: 0.17 },
        title: 'Privacy mode',
        short: 'Camera 9, the only camera in the service corridor behind the screen, went to privacy mode at 9:45 PM on a typed instruction from Events, signed D.Y., countersigned R. Hamdan. "The Chairman\'s corridor is always private," Rizal says. "Every year." It came back at 10:21.',
        text: 'The control room is a cupboard of monitors on B1, and one of them has been black since 9:45 PM. Camera 9: SERVICE CORRIDOR, L15. The log says privacy mode, on a typed instruction from Events, D.Y., at 9:44, countersigned R. Hamdan, Kawalan Sentosa, at 9:45. The camera came back at 10:21, a minute after Farah\'s order, and its first frame is Dang Wangi\'s constable looking straight into it. Rizal Hamdan leans in the doorway with his arms folded. "The Chairman\'s corridor is always private," he says. "Every year. Nobody looks behind the screen, Inspector. That is the whole point of a screen." Farah asks him who he thinks sits in the chair. He laughs, and then he stops laughing, because he has never once thought about it.',
      },
    },
    {
      id: 'c7_07', phase: 'The Sun Room', title: 'A perfect pressure',
      game: 'safecracker', variant: 'classic',
      brief: 'Under the chair, pushed back where nobody would kick it, is a black leather doctor\'s bag with a four-digit brass lock. Dr. Meera Rajaratnam of table nine says it is not hers, then that she will not open it without her lawyer, then, to Farah, twice, that she uses the same numbers for everything, like every doctor she knows.',
      params: {
        digits: 4, tries: 8, bonus: 4, repeats: false,
        fixed: { 1: 1 },
        clue: 'Dr. Meera: "A perfect blood pressure. Every houseman knows it. Every doctor uses it for something."',
      },
      evidence: {
        img: 'ev_c7_bag', hotspot: { x: 0.53, y: 0.5, r: 0.2 },
        title: 'Patient: Tuan',
        short: 'In Dr. Meera\'s bag: a used syringe, an empty morphine ampoule, and her notebook: "Tuan. 21:15. Morfin 5 mg IV. Selesa." And a patient file with a red tab: TUAN, quarterly checks since 2014, male, 71, blood group B positive, appendix scar, pancreatic cancer found in September. Every line of it describes the dead man in the chair. The Chairman\'s medical file belongs to his driver.',
        text: 'One, two, oh, eight: a hundred and twenty over eighty, and the lock opens. Stethoscope, a blood pressure cuff, a yellow sharps tin with one used syringe and one empty ampoule of morphine, ten milligrams a millilitre. A pocket notebook in a doctor\'s hand: "Tuan. 21:15. Morfin 5 mg IV. Selesa." Comfortable. And a slim file with a red tab and one word on it, TUAN, which Dr. Meera tries to take back off the chair and Farah does not let her. Quarterly examinations since March 2014 at a private suite on Jalan Kia Peng, booked by the Office of the Chairman. Male. Age seventy-one. Blood group B positive. An old appendix scar, a healed fracture of the left wrist, a gold crown on a lower molar. September 2026: carcinoma of the pancreas, three to six months. Dr. Lim reads it standing over the body and checks it against him line by line. The scar. The wrist. The crown. For twelve years the most careful man in Malaysia has sent his driver to his doctor, so that no doctor anywhere has ever taken his blood. Dr. Meera sits down on the floor of the corridor. "I thought I was keeping him alive," she says. "I thought I was keeping the Chairman alive."',
      },
    },
    {
      id: 'c7_08', phase: 'The Sun Room', title: 'After the fortieth',
      game: 'shredder', variant: 'classic',
      brief: 'Tan Sri Azhar\'s office is at the end of the directors\' corridor on Level 15, two doors from the one that was Dato\' Rashid\'s. At 10:40 PM, while Farah\'s constables took statements in the ballroom, Tan Sri went in "to rest" and shut the door. The shredder by his desk was still warm at midnight, and Sinar\'s cleaners do not come until six. Some strips went in upside down.',
      params: {
        title: 'SINAR HOLDINGS BERHAD',
        text: 'Office of the Group Managing Director\nSTRICTLY PRIVATE\n\nSuccession, draft 3\n\nOn the death or incapacity of\nthe Chairman, the Board shall\nappoint A.K. Executive Chairman\nwith immediate effect.\n\nMedical (M.R., 9 Oct):\n3 to 6 months. RM 100,000 paid.\n\nAfter the 40th. Not before.',
        strips: 10,
        flips: true,
        stamp: 'PRIVATE',
        sign: 'A.K.',
        clue: 'The shredder\'s little counter says one sheet, at 22:41.',
      },
      evidence: {
        img: 'ev_c7_memo', hotspot: { x: 0.44, y: 0.6, r: 0.16 },
        title: 'Upon the death of the Chairman',
        short: 'Tan Sri Azhar\'s shredded memo: "On the death or incapacity of the Chairman, the Board shall appoint A.K. Executive Chairman with immediate effect. Medical (M.R., 9 Oct): 3 to 6 months. RM 100,000 paid. After the 40th. Not before." He bought the Chairman\'s prognosis from Dr. Meera, and he was getting ready.',
        text: 'Draft 3 of a page Tan Sri Azhar Kamaruddin has been writing since October, by the look of the strike-throughs under the tape. On the death or incapacity of the Chairman, the Board shall appoint A.K., Executive Chairman, with immediate effect. Then the line that explains the timing: Medical, M.R., 9 October, three to six months, RM 100,000 paid. Dr. Meera Rajaratnam sold the prognosis in her red file to the Group Managing Director for a hundred thousand ringgit, and he has been quietly counting the board ever since. "After the 40th. Not before." A man waiting for another man to die, politely, after the dinner. He shredded it forty minutes after he came out from behind the screen shouting that the Chairman was dead. What he does not seem to know, even now, is that the prognosis was never the Chairman\'s. It was the driver\'s.',
      },
    },
    {
      id: 'c7_09', phase: 'The Sun Room', title: 'Nurul Ain',
      game: 'interrogation', variant: 'classic',
      brief: 'Farah borrows the directors\' boardroom at twenty past midnight, because it has a door that locks and a table long enough to keep two people apart. Ain sits at the far end with her hands flat on the wood and her camera strap folded in front of her, and looks at you the way she looked at the police the morning her father fell. One thing she tells you is not true. Find it, and put the exhibit that breaks it in front of her.',
      params: {
        setting: 'The directors\' boardroom, Level 15, Menara Sinar. Sunday, 12:20 AM.',
        suspect: {
          id: 'ain', voice: 'voice_1', name: 'Nurul Ain', role: 'Journalist, Dato\' Rashid Osman\'s daughter, 27',
          persona: 'Sharp, fast, grieving Kuala Lumpur Malay journalist in her late twenties: educated Malaysian English with the odd Malay word ("Abah", "kan", and "lah" only when she is tired). Treats every question like a press conference she is losing, and answers questions with questions. Angry at Sinar, at the police, and at the detective for being late in her father\'s case; softens only when her father is mentioned. Protects her photograph like a child and will not say where it is until she is cornered.',
        },
        facts: [
          { id: 'f1', topic: 'her work', claim: 'I freelance now. The paper let me go in October. Nobody wants Rashid Osman\'s daughter on the Sinar story.' },
          { id: 'f2', topic: 'her father', claim: 'My father fell from the floor under this one. You were there. You know what they said about him.' },
          { id: 'f3', topic: 'her pass', claim: 'My pass came by courier from the Office of the Chairman. Press pen, row two. Like your table six.' },
          { id: 'f4', topic: 'why she came', claim: 'I wanted to see who my father worked for. Once. Just once.' },
          { id: 'f5', topic: 'the old man', claim: 'I had never seen that old man before tonight. Never. I would remember.' },
          { id: 'f6', topic: 'her strap', claim: 'Sinar security took my camera strap at the door with everything else. It is a woven strap, two fingers wide.' },
          { id: 'f7', topic: 'the kancil', claim: 'Abah told me: if a man who folds paper animals comes to you, help him. Nobody told me what to do about a voice.' },
        ],
        lies: [
          { id: 'l1', topic: 'the speech', claim: 'I was in the press pen the whole speech. Behind the rope, like a good girl.', truth: 'At 9:44 she crept along the wall to the gap between panels eleven and twelve and took one photograph.', exposedBy: 'e1' },
          { id: 'l2', topic: 'her memory card', claim: 'Sinar took my camera and my card. Ask the guard.', truth: 'She took the card out at 9:47 and hid it in the sugar bowl at table six before the guard collected the cameras.', exposedBy: 'e2' },
          { id: 'l3', topic: 'what she saw', claim: 'It was dark back there. I saw a shadow. That is all anybody saw.', truth: 'Through the gap she saw the old man\'s face lit from below, his mouth shut while the voice spoke, and the AV man behind him talking into his headset.', exposedBy: 'e3' },
        ],
        evidence: [
          { id: 'e1', title: 'Along the wall', text: 'Sinar\'s event photographer, frame 212, 9:44 PM: a woman in a black tudung crouched at the edge of the screen, outside the press rope, camera raised.' },
          { id: 'e2', title: 'Three names on a list', text: 'Bishnu Thapa: at 10:20 PM the young lady in the black tudung handed him her camera with its card door open and no card inside.' },
          { id: 'e3', title: 'The wrong man', text: 'Behind the screen a two-kilowatt lamp stands at the chair\'s feet, aimed up through the silk: from the gap between two panels the man in the chair is lit face-on, bright as day.' },
          { id: 'e4', title: 'Six millimetres', text: 'Dr. Lim: the ligature was smooth and six millimetres wide. A woven camera strap is twenty-five.' },
          { id: 'e5', title: 'Patient: Tuan', text: 'Dr. Meera\'s notebook: "Tuan. 21:15. Morfin 5 mg IV." Her file on "the Chairman" describes the dead man exactly.' },
          { id: 'e6', title: 'Upon the death of the Chairman', text: 'Tan Sri Azhar\'s shredded succession memo, dated October: "After the 40th. Not before."' },
        ],
        secret: 'She photographed the man in the chair through the gap at 9:44 and hid the memory card in the sugar bowl at table six, for the detective, because she trusts nobody else with the first photograph of the man behind the screen since 1997, and she is afraid it is the wrong man.',
        suggested: [
          'Where were you during the speech?',
          'What happened to your memory card?',
          'What did you see behind the screen?',
          'Why did you come tonight?',
          'Who sent you your pass?',
          'Did you know the old man?',
          'What do you want from me?',
        ],
        maxQuestions: 14,
        clue: 'Farah, from the door: "She is lying to protect something, not someone. Find out what."',
      },
      evidence: {
        img: 'ev_c7_photo', hotspot: { x: 0.45, y: 0.5, r: 0.13 },
        title: 'The first photograph since 1997',
        short: 'Caught in one lie, Ain tips the sugar bowl from table six out onto the boardroom table: her memory card. One frame, 9:44:12 PM, through the gap: the old man in the chair lit from below, mouth shut, while the voice was mid-word. The microphone stand at his left hand. Three metres behind him, Desmond Yap, not at his faders, one hand pressed to his headset, talking.',
        text: 'She does not cry. She stands up, walks the length of the boardroom to the door, asks Farah\'s constable to bring her the sugar bowl from table six, and when it comes she tips it out onto the polished wood and picks a memory card the size of a fingernail out of the sugar. "For you," she says. "Not for them. Not for the police. For you." One frame. 9:44:12 PM, silent shutter, through a gap the width of two fingers between panels eleven and twelve. The old man from table six in the high-backed chair, lit gold from below by the lamp at his feet, the cigarette raised, his mouth shut. Farah lays the photograph against the archive recording of the speech: at 9:44:12 the voice is in the middle of the word "forty". The ribbon microphone on its stand stands at his left hand. Three metres behind him, at the edge of the frame, Desmond Yap, who never leaves his desk, standing away from his faders with one hand pressed flat to the cup of his headset and his lips open on a word. "The first photograph of the man behind the screen since 1997," Ain says. "And it is the wrong man." At 10:14, when Tan Sri found the body, the microphone stand was at the old man\'s right hand.',
      },
    },

    // ---------------- Level 14 ----------------
    {
      id: 'c7_10', phase: 'Level 14', title: 'The floor below',
      game: 'mirrors', variant: 'classic',
      brief: 'If the voice came from the glass room, somebody was on Level 14 tonight. Rosli has the building\'s Bomba key, and Uncle Wong, called in from Cheras in his pyjama top, turns Lift 7\'s switch to the third position for the first time in his life with his eyes shut. On 14 the laser alarm across the cradle corridor is still live on the emergency circuit, and it locks every door on the floor if its beam leaves the sensor. Rosli has the mirrors from his torch kit again.',
      params: {
        size: 7, mirrors: 4, relays: 1, obstacles: 7,
        clue: 'Rosli: "Last time I was here, this beam was the only thing on the floor still awake. It still is."',
      },
      evidence: {
        img: 'ev_c7_glassroom', hotspot: { x: 0.74, y: 0.42, r: 0.12 },
        title: 'His own dust',
        short: 'Rosli\'s Bomba seals on Level 14 are unbroken, dated in his own hand. In the glass room, directly under the screen, the old microphone tagged CHAIRMAN is grey with months of dust, and its cable is coiled in the floor riser and taped off under Bomba\'s own tape. Nobody spoke from Level 14 tonight. On the desk, a lamp on a plug-in timer comes on at 2:10 every morning.',
        text: 'Every seal Rosli put on Level 14 is where he put it, red and white tape, his signature, his date. On the floor of the corridor the dust lies in one unbroken sheet, and the only footprints in it are the ones you are making. The glass room is as you left it: the chair facing the window, the brass telescope beside it still pointed south-west at Brickfields. On a stand by the chair, an old microphone with a brass grille, tagged CHAIRMAN in the same tidy hand as the rack upstairs, so grey with dust that Rosli draws a line through it with one finger to show you. Its cable runs into a floor riser, and there, coiled, is the end of it, wrapped in Bomba\'s own red tape on the day the floor was sealed. Whatever was on the line marked ARAS 14 tonight, it was not this microphone. On the desk, plugged into the emergency circuit, a reading lamp on a cheap timer from a hardware shop, set to switch on at 2:10 AM and off at 2:40. Every night since the floor was sealed, somebody has wanted a light to show in the black band where a storey is not. Uncle Wong will not get out of the lift.',
      },
    },

    // ---------------- Line 2 ----------------
    {
      id: 'c7_11', phase: 'Line 2', title: 'Eleven tones',
      game: 'dialtone', variant: 'classic',
      brief: 'Back at the rack. Under the patch bay, with no tag at all, sits a grey box the size of a hardback book with a telephone handset wired into it: a telephone hybrid, the thing radio stations use to put callers on air. It keeps the tones of the last number it dialled, as a recording, for the engineer who will not remember. Listen, and type the number.',
      params: {
        digits: 11, number: '01126041986', noise: 0.35,
        clue: 'Malaysian mobiles start 01. Whoever dialled this had dialled it every year, and did not need to look.',
      },
      evidence: {
        img: 'ev_c7_hybrid', hotspot: { x: 0.27, y: 0.42, r: 0.14 },
        title: 'Line 2 is a telephone',
        short: 'At 9:28 PM the hybrid under the rack dialled 011-2604 1986, and from 9:32 until the call dropped at 9:58:20 it fed the ballroom through the CHAIRMAN input. The number is a prepaid. From 9:20 to 9:58 it sat on a single cell: Menara Sinar\'s own in-building aerial on Basement 2. Its last four digits are the year Sinar was founded.',
        text: 'Eleven tones, fast, from a hand that has done it before. The hybrid\'s little display keeps the rest: outgoing, 21:28:14; connected; routed to input 3, CHAIRMAN, through the 1.2-second delay, from 21:32:00; dropped at 21:58:20, from the far end. Every year since the glass room was sealed, the voice has come into the Sun Room down a telephone. Farah\'s friend at the telco, who works Saturday nights for a promise of nasi kandar, has the number in eleven minutes. A prepaid, bought for cash, used only to receive one call a year. Tonight it was on one cell only, from 9:20 PM until it vanished at 9:58: the in-building aerial that Menara Sinar installed on Basement 2 so that the drivers waiting in the car park could watch football on their phones. 011-2604 1986. Farah reads the last four digits twice. "He could not help it," she says. "Forty years, and he still could not help it."',
      },
    },

    // ---------------- Basement 2 (only if Daniel is still Sinar's) ----------------
    {
      id: 'c7_dn', phase: 'Basement 2', title: 'Table six, after midnight',
      game: 'wordsearch', variant: 'secret',
      when: HELD,
      brief: 'At half past one a waiter finds you in the corridor with something cupped in his hands. A young man in a white shirt came up from the car park at 9:30, he says, gave him fifty ringgit and told him: for table six, after midnight, not before. A paper kancil, folded from tonight\'s menu card. Nobody alive folds them that way but one man. Unfolded, the menu is pricked all over with a pin, one tiny hole under one letter here and there. Find every dish. The letters nobody used are his.',
      params: {
        size: 12,
        words: ['SATAY', 'RENDANG', 'KERABU', 'GULAI', 'SAMBAL', 'KETUPAT', 'LEMANG', 'CENDOL', 'KUIH', 'SERUNDING', 'ACAR', 'PAJERI', 'ROJAK'],
        extra: ['NASI', 'SAGU', 'PANDAN', 'KELAPA', 'GULA', 'MANGGA', 'DURIAN', 'LIMAU', 'BIHUN', 'TERUNG', 'BAWANG', 'HALIA'],
        message: 'INTHECARONBTWO',
        messageSpaced: 'IN THE CAR ON B TWO',
      },
      evidence: {
        img: 'ev_c7_menu', hotspot: { x: 0.45, y: 0.48, r: 0.2 },
        title: 'In the car on B2',
        short: 'Pricked under the letters of tonight\'s menu, in a pin\'s holes: IN THE CAR ON B TWO. Daniel was on Basement 2 during the speech, in the back of the car the voice came from. They let him fold you a kancil, and sent it up after the car had gone.',
        text: 'Thirteen dishes and a pin. Under some of the letters, holes so small you need the lamp at the chair\'s feet to see them, and the pricked letters, read in order, say: IN THE CAR ON B TWO. You know the hand. He did this in Colombo with the backs of three-wheeler receipts and in Kampung Baru with a toothpick and a tea bill. He was on Basement 2 tonight, while three hundred people listened to a shadow, in the back of a car with somebody beside him who wanted him to hear it. They gave him the menu. They let him fold it. And then they sent it up for table six after midnight, when the car was long gone, because a man who has kept your partner since August wanted you to know exactly how close you were. The waiter says the young man in the white shirt who brought it up did not wait for an answer.',
      },
    },

    // ---------------- Basement 2 ----------------
    {
      id: 'c7_12', phase: 'Basement 2', title: 'Bay V1',
      game: 'maze', variant: 'cameras',
      brief: 'Basement 2 is a concrete box of four hundred bays, twenty-two cameras and one in-building aerial, and at the far end, by the loading bay ramp, a reserved bay with a faded sun painted in it: V1. The car park\'s barrier log says a fob for V1 came in at 9:20 PM and went out at 9:58. Rosli\'s friend in Bomba fire safety has the camera plan for the whole floor. Trace the way a car could leave V1 without one camera seeing it.',
      params: {
        map: [
          '#####################',
          '#R....#.......#....P#',
          '#.###.#.#####.#.###.#',
          '#.#...#.#...#...#...#',
          '#.#.###.#.#.#####.###',
          '#.#.....#.#.......#.#',
          '#.#######.#######.#.#',
          '#.......#.S.#.....#.#',
          '#######.#.#.#.#####.#',
          '#.....#...#...#.....#',
          '#.###.#.###.###.###.#',
          '#...#.......#.....#.#',
          '##########L##########',
        ],
        cameras: [
          { x: 1, y: 3, dir: 'N', range: 2 },
          { x: 19, y: 3, dir: 'N', range: 2 },
          { x: 11, y: 9, dir: 'S', range: 1 },
          { x: 3, y: 9, dir: 'W', range: 2 },
          { x: 15, y: 7, dir: 'E', range: 3 },
          { x: 13, y: 3, dir: 'S', range: 3 },
        ],
        exits: { R: 'Main exit ramp to Jalan Ampang', P: 'Lift lobby, Lifts 1 to 6', L: 'Loading bay ramp, the service lane' },
        startLabel: 'V1',
        startName: 'Bay V1, the bay with the sun painted in it',
        aria: 'Plan of Basement 2, Menara Sinar, with its cameras',
        answer: 'L',
      },
      evidence: {
        img: 'ev_c7_bay', hotspot: { x: 0.53, y: 0.62, r: 0.13 },
        title: 'A blind bay',
        short: 'Of four hundred bays on Basement 2, one is out of sight of every camera, and so is the one way out of it: Bay V1, by the loading bay ramp. Its fob came in at 9:20 PM and went out at 9:58:31, eleven seconds after the call on Line 2 dropped. A fresh drip of oil on the sun. Nothing else: no ash, no cigarette ends. Whoever sat there has an ashtray, and somebody to empty it.',
        text: 'Twenty-two cameras, and not one of them sees Bay V1 or the lane from it to the loading bay ramp. They were not knocked aside or covered. They were installed in 1997 looking the other way, every one, and nobody has moved them since. The barrier log at the foot of the ramp: fob V1, in 21:20:14, out 21:58:31. The call on Line 2 dropped at 21:58:20, which is about how long it takes a car to pull out of a bay and reach a barrier with a man in the back seat putting his telephone away. On the faded sun painted in the bay, a fresh drip of engine oil the size of a coin, still soft. No ash. No cigarette ends. No tyre marks worth the name. The car park attendant on the ramp says a black car comes to V1 four or five nights a year and he has been told, every time, to look at his own feet. Tonight he looked at his feet. He did see one thing, he says: the car came down at 9:20 with two people in the back.',
      },
    },

    // ---------------- Brickfields ----------------
    {
      id: 'c7_13', phase: 'Brickfields', title: 'Every Friday',
      game: 'quickmath', variant: 'receipts',
      brief: 'Farah lets you go to Brickfields at half past two with a constable and a promise to be back by four. Bala Anne is sitting at table six in the dark, as if he had been told, with a shoebox of old order-pad dockets on the steel in front of him. He keeps every docket. He has never told you that, because you never asked. Add them up with him.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c7_dockets', hotspot: { x: 0.42, y: 0.5, r: 0.16 },
        title: 'Two teh for table six',
        short: 'Every Friday since August 2016: one thosai and one teh at the counter, and two teh sent to table six, paid in cash by Muthu Anne, a driver from Jalan Thambapillay. Ten years. On Friday night, the last docket, and the last thing he said to Bala: "I told Tuan myself. Forty years, I owed him that. Tomorrow I will tell the boy."',
        text: 'Five hundred and eleven dockets in a rubber band, in Bala Anne\'s capitals. Every Friday since the second week of August 2016, the week you and Daniel opened the agency upstairs: one thosai, one teh, at the counter, and two teh for table six, paid in cash by the same man. Muthu Anne. A driver. Jalan Thambapillay, two streets away. A widower who came to the Kandaswamy temple every Tuesday and sat at the counter every Friday with his back to the room and his face to the stairs. "He never said who he drove for," Bala Anne says. "In Brickfields you do not ask a man who he drives for." On Friday night, the last docket. Muthu ate half his thosai, paid for your two teh, and said a thing Bala did not understand and wrote down on the back of the docket because it frightened him. "I told Tuan myself. Forty years, I owed him that. Tomorrow I will tell the boy. On Sunday I will come and eat." Bala Anne turns the docket over and over. "He meant you," he says. "The boy is you."',
      },
    },
    {
      id: 'c7_14', phase: 'Brickfields', title: 'The doorstep',
      game: 'tangram', variant: 'classic',
      brief: 'Muthu\'s house on Jalan Thambapillay is one storey of old terrace with a tulsi plant in a pot by the door. Every morning since his wife died he has drawn a kolam on the doorstep himself, in rice flour, the way she did. This morning he drew three small shapes beside it, and then it rained. Bala Anne holds the torch. Build the shapes back out of what the rain left.',
      params: { rounds: 3, shapes: ['chair', 'key', 'boot'] },
      evidence: {
        img: 'ev_c7_kolam', hotspot: { x: 0.27, y: 0.53, r: 0.13 },
        title: 'A chair, a key, a boot',
        short: 'Beside the kolam: a chair, a key, a boot. Under the tulsi pot, the key to Muthu\'s old Mercedes. In its boot, twenty-nine identical white shirts and a letter in Tamil for the detective: "He is never in the room. He sits in the car under the building and talks into a telephone, and Mr. Desmond puts his voice into the room. On Friday I told him I am dying. He said, of course, Muthu. After the forty seconds."',
        text: 'A chair: the man in the chair. A key: under the tulsi pot, on a ring with a small brass sun, the key to the 1997 Mercedes under a cover at the kerb, which Muthu was given when the black car came and has polished every Sunday since. A boot. Inside it, folded in tissue, twenty-nine white shirts, all the same, one for every dinner, and on top of them an envelope addressed in Tamil to "the boy upstairs at Bala\'s". Bala Anne reads it to you under the streetlight in a voice you have never heard him use. Forty years I drove him. Twenty-nine years I sat in his chair so that people would think he was in the room. He is never in the room. He sits in the car under the building and talks into a telephone, and Mr. Desmond puts his voice into the room. Since 2014 I go to his doctor for him, so that no doctor has his blood. In 2016 I fetched the third lighter from Klang. In 2016 I paid for your teh at table seven, because he told me to. On Friday I told him I am dying and that I will not lie in front of God. I owed him that. He said: of course, Muthu. After the forty seconds. Forgive me. Muthu. Bala Anne folds the letter along its old creases and gives it to you, and then he goes and stands with his back to you for a while, looking at the kolam.',
      },
    },

    // ---------------- Back at Menara Sinar ----------------
    {
      id: 'c7_15', phase: 'Back at Menara Sinar', title: 'Table one',
      game: 'whoslying', variant: 'classic',
      brief: 'While you were in Brickfields, Farah\'s constables took a statement from everybody at the head table about the forty seconds of dark, because Tan Sri Azhar has a memo in his shredder and a body in his chair. Five people round one table. Two of them are lying.',
      params: {
        solvedLine: 'Farah reads the five statements twice. "Two liars and one cigarette. Tan Sri never left his chair."',
        people: [
          { id: 'azhar', name: 'Tan Sri Azhar', says: [
            { t: '"I never left my chair in the dark. My wife had my arm the whole time."', fact: true, note: 'The head table\'s own waiter, standing behind Tan Sri with the coffee, says the same.' },
            { t: '"Mr. Loh is lying."', about: 'loh', is: false },
          ] },
          { id: 'rosnah', name: 'Puan Sri Rosnah', says: [
            { t: '"My husband is telling the truth."', about: 'azhar', is: true },
            { t: '"Encik Kamarul is lying."', about: 'kamarul', is: false },
          ] },
          { id: 'loh', name: 'Mr. Loh, banker', says: [
            { t: '"Tan Sri left the table in the dark. I felt his chair move."', fact: false, note: 'Tan Sri\'s chair has his wife\'s handbag hooked on its back. It never moved.' },
            { t: '"Joyce is lying."', about: 'joyce', is: false },
          ] },
          { id: 'kamarul', name: 'Encik Kamarul, the deputy minister\'s aide', says: [
            { t: '"I was at the table for the whole forty seconds."', fact: false, note: 'The balcony door\'s alarm log shows it opened at 21:51:09 and again at 21:51:44.' },
            { t: '"Puan Sri is lying."', about: 'rosnah', is: false },
          ] },
          { id: 'joyce', name: 'Joyce Tan, Sinar press office', says: [
            { t: '"Mr. Loh and Encik Kamarul came back from the balcony when the lights came up, smelling of cigarettes."', fact: true, note: 'Two cigarette ends on the balcony, both the brand Mr. Loh smokes.' },
            { t: '"At least two of the others are lying."', atLeast: 2 },
          ] },
        ],
        liars: ['loh', 'kamarul'],
      },
      evidence: {
        img: 'ev_c7_tableone', hotspot: { x: 0.32, y: 0.67, r: 0.11 },
        title: 'He never left his chair',
        short: 'Tan Sri Azhar never left the head table in the forty seconds: his wife had his arm and his waiter stood behind him. The two men who swore otherwise were on the balcony smoking. He went behind the screen only at 10:14. He knew since 2019 who sat in the chair, he says now, and told nobody. Waiting for the Chairman to die is not a crime.',
        text: 'Mr. Loh and Encik Kamarul went out to the balcony for a cigarette the moment the lights went down, as two men who have been told not to smoke for three hours will, and came back in the applause, and each told the constable that Tan Sri left the table, because each needed somebody else to have been missing too. Tan Sri Azhar sat in the dark with his wife\'s hand on his arm and his speech cards in his fist, in case he was asked to say a few words, which in twenty-nine years he has never been. Faced with his memo, he tells Farah the rest in the voice of a man reading minutes. He has known since a dinner in 2019, when he saw the old man leave by the service door with his jacket over his arm, that the shadow in the chair was a driver. He told nobody. He paid for a prognosis that was not the Chairman\'s and planned to be Chairman after the fortieth. "I wanted to sit in the chair," he says. "I did not want to kill anybody in it. In this company, Inspector, those are not the same thing."',
      },
    },
    {
      id: 'c7_16', phase: 'Back at Menara Sinar', title: 'Technical services',
      game: 'ledger', variant: 'classic',
      brief: 'Sinar\'s Events and AV department keeps its own budget on a laptop in the corridor, and Desmond Yap\'s assistant Faiz, nineteen and frightened, prints the totals every Friday for a file Desmond does not know he keeps. At 3:50 AM somebody logged in and changed three cells. Find them, and put back what they said.',
      params: {
        rows: 6, cols: 5, altered: 3, restore: true, currency: 'RM', magnitude: 'thousands',
        rowLabels: ['Staging', 'Lighting', 'Sound', 'Technical services', 'Driver and car', 'Office of the Chairman'],
        colLabels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        clue: 'Faiz\'s printout is from Friday at five. The laptop was opened at 3:50 this morning, while Dang Wangi were still taking statements.',
      },
      evidence: {
        img: 'ev_c7_events', hotspot: { x: 0.37, y: 0.35, r: 0.15 },
        title: 'Paid on Friday',
        short: 'Restored: "Technical services", Friday 13 November, RM 300,000 to D. Yap, approved by the Office of the Chairman: the day Muthu told the Chairman he would talk. "Driver and car": M. Perumal\'s allowance stopped on the same Friday. "Office of the Chairman": medical retainer, M.R., paid through Events since 2014.',
        text: 'Three cells, put back to what Faiz printed at five on Friday afternoon. Technical services, November: RM 300,000, to D. Yap, approved by the Office of the Chairman, Friday 13 November. In twenty-nine years the line has never held more than eight thousand. Driver and car: the monthly allowance for M. Perumal, paid every month since the column began, stopped on Friday 13 November, with a note in the margin that nobody has to explain: "Final." Office of the Chairman: a medical retainer, M.R., paid quarterly through the Events budget since March 2014, so that a doctor on Jalan Kia Peng could examine the Chairman without the Chairman\'s name ever appearing on a Sinar cheque. On Friday afternoon the Chairman heard from his driver of forty years that he was dying and would not lie in front of God. On Friday afternoon he paid the man who runs his screen three hundred thousand ringgit, and stopped paying his driver.',
      },
    },
    {
      id: 'c7_17', phase: 'Back at Menara Sinar', title: 'Four metres',
      game: 'footprint', variant: 'classic',
      brief: 'The floor behind the screen is black stage vinyl, and for the first half hour of the speech the haze machine under the AV desk breathed a thin fog into the backlight so that the beam would glow through the silk. It stopped at 9:30. Since then everything that walked behind the screen has left a print in the film it laid down. Rosli lays his torch flat on the floor. Name the tread, then find the shoe.',
      params: { shoes: 10 },
      evidence: {
        img: 'ev_c7_floor', hotspot: { x: 0.5, y: 0.62, r: 0.2 },
        title: 'From the desk to the chair',
        short: 'Since the haze stopped at 9:30, two sets of prints behind the screen. Tan Sri Azhar\'s leather soles, at 10:14, to the chair and back. And one rubber sole, cross-hatched, with a cut across the heel, from the AV desk round to the back of the chair, standing, and back to the desk: Desmond Yap\'s black canvas shoes.',
        text: 'Under the raking torch the black floor turns into a map. Muthu\'s own scuffs end at the chair at 9:20; Dr. Meera\'s small heels come and go before the haze settled. After 9:30, two people. Tan Sri Azhar\'s leather soles, long and smooth, from the service door to the side of the chair and back at a run, exactly as he says. And one rubber sole, cross-hatched, with a clean cut across the heel: from the AV desk, four metres round behind the high-backed chair, two prints side by side where a man stood still with his weight on his heels for a long time, a smear where he shifted, and back to the desk. The shoes are on Desmond Yap\'s feet. Black canvas, the kind every AV crew in Malaysia wears so as not to squeak, and the cut across the left heel lines up with the print to the millimetre. Rosli measures the two prints behind the chair. "Standing," he says. "Not walking. A long time."',
      },
    },
    {
      id: 'c7_18', phase: 'Back at Menara Sinar', title: 'Side B',
      game: 'tape', variant: 'reverse',
      brief: 'At the bottom of the rack, under a dust cover, is the oldest thing on it: a cassette deck that has recorded the CHAIRMAN feed at every Sinar dinner since 1997, straight off the input, before the delay and before anything can be cut. Desmond says it is broken. It is not. It runs in long-play, at half speed, and it turned itself over when side A ran out at half past eight, so on the deck Faiz finds you, side B comes out wrong. Find the direction and the speed where it turns back into a voice.',
      params: {
        line: TABLE_LINE,
        answer: 'table six',
        accept: ['table 6', 'six', '6', 'tablesix'],
        ask: 'Where does the voice say the detective is sitting?',
        label: 'CHAIRMAN FEED · SINAR 40 · SIDE B · LP',
        clue: 'Side B begins at 8:30 PM. The feed comes straight off the input: whatever reached the rack, the tape heard.',
      },
      evidence: {
        img: 'ev_c7_cassette', hotspot: { x: 0.48, y: 0.5, r: 0.15 },
        title: '"Sekarang"',
        short: 'Side B holds the speech, and what came after it. Under the voice the whole time, the hum of a car\'s air-conditioning and the drone of a car park\'s fans. At 21:51:05, after "forty seconds", the voice again, on the talkback only: "Sekarang." Now. Three minutes and forty-four seconds of fans. Then a man, close to a headset microphone, out of breath: "Dah, Tuan." Done, sir. Only one headset on Level 15 can talk back on that line.',
        text: 'Brought to its proper speed, side B is the speech the room heard, a second and a fifth early: the lorry, the yard under Bukit Jugra, the gate, table six. Under every word, if you listen with Faiz\'s closed headphones, a soft steady hiss that is not tape: a car\'s air-conditioning, and behind it the low drone of big fans in a concrete room, and once, at 9:40, a car alarm chirping two bays away. Then "Forty years. Forty seconds." The ballroom went dark four seconds early. On the tape, one second after the last word, the same voice, nearer, quieter, on the talkback circuit that never reaches the speakers: "Sekarang." Now. Then three minutes and forty-four seconds of fans. Then a man close to a headset microphone, breathing as if he has carried something up stairs: "Dah, Tuan." Done, sir. "Terima kasih." At 9:58:20 a car door\'s chime, an engine, and the line goes dead. The talkback on Line 2 goes to one headset on Level 15. Faiz says it without being asked: the boss\'s. Only the boss\'s. When Farah goes to the corridor to find Desmond Yap, his chair is empty, and the fire stair door is swinging shut.',
      },
    },
    {
      id: 'c7_19', phase: 'Kuala Lumpur', title: 'Before Subuh',
      game: 'pursuit',
      brief: 'Desmond Yap goes down fifteen floors of fire stairs faster than a man of fifty-four should, out through the loading bay and into Jalan Ampang at twenty to five, in the rain, with his headset still round his neck. You go after him on foot. Behind you Farah is shouting into her radio for cars that will take nine minutes to come.',
      params: {
        setting: 'city',
        route: ['city', 'city', 'kampung', 'kampung', 'market', 'market'],
        legs: 6,
        beats: [
          'Down Jalan Ampang under the twin towers, past drivers asleep in their cars with the seats tipped back.',
          'Through the dark of the park and up onto the Saloma bridge, its lights rippling along it like the back of a fish.',
          'Kampung Baru: wooden houses on stilts, a cat on a step, the smell of the first nasi lemak of the day.',
          'Past Mak Teh\'s warung, shutter half up, and north toward the lights of Chow Kit.',
          'Chow Kit market at five: lorries of cabbages and ice, and he goes through the stalls toward Jalan Raja Bot, as if somebody is waiting for him.',
        ],
        difficulty: 'medium',
        vehicle: 'foot',
        suspect: 'Desmond',
        skyline: 'kl',
        clue: 'He runs like a man who has been told where to run to.',
      },
      evidence: {
        img: 'ev_c7_market', hotspot: { x: 0.48, y: 0.62, r: 0.12 },
        title: 'The car that came',
        short: 'You bring Desmond down in the back lane of Chow Kit market, on the Jalan Raja Bot side, at nine minutes past five. Thirty metres away, at the end of the lane, a black car with no plates is waiting with its engine running. Its back window is down a hand\'s width. It stays until he looks up and sees it. Then the window goes up, and the car goes.',
        text: 'Cabbage leaves, ice, and the cold wet concrete of a market lane at five in the morning. You bring him down beside a fish stall and he does not fight; he lies with his cheek on the ground and looks along the lane, and so you look too. At the end of it, where the lane meets Jalan Raja Bot, two doors from the cold room that once held the whole of Floor 14, a black car with no number plates is idling with its lights off. Its back window is down the width of a hand. Inside, in the dark, the small orange point of a cigarette. Nobody gets out. The car waits while Desmond lifts his head off the concrete and sees it, and while he understands what it came to see. Then a hand in a white cuff turns the cigarette over once, the window slides up, and the car pulls out into Jalan Raja Bot without hurrying and is gone before Farah\'s first siren reaches the market. Desmond Yap puts his face back down on the wet concrete. His headset has come off in the puddle beside him. He does not reach for it.',
      },
    },

    // ---------------- Dang Wangi ----------------
    {
      id: 'c7_20', phase: 'Dang Wangi', title: 'Everyone in the dark',
      game: 'logicgrid', variant: 'classic',
      brief: 'IPD Dang Wangi at six on a Sunday morning: one tea lady, a dozen tired constables, and a lawyer from Sinar on his way down from Bukit Tunku. Before anybody sits in an interview room, Farah wants the forty seconds on one page. Five people, five places, five things in their hands, and one of the five is you.',
      params: {
        categories: [
          { name: 'Person', items: ['Desmond', 'Azhar', 'Ain', 'Meera', 'You'] },
          { name: 'Location', items: ['Press pen', 'Edge of the screen', 'Table nine', 'Behind the chair', 'Head table'] },
          { name: 'Holding', items: ['Phone', 'Silver lighter', 'Microphone cable', 'Camera', 'Speech cards'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[3, 2], [4, 4], [0, 3], [2, 0], [1, 1]],
        clues: [
          'Tan Sri had his speech cards in his hand, in case the Chairman wanted a few words when the lights came up.',
          'Whoever held the camera was behind the press rope.',
          'Whoever stood behind the chair was holding something long.',
          'You were on your feet, and so was whoever had the microphone cable.',
          'Ain was not sitting at a table.',
          'Your partner\'s lighter was in your fist.',
          'Table nine was a woman\'s seat.',
          'Ain never went near the screen in the dark.',
        ],
      },
      evidence: {
        img: 'ev_c7_grid', hotspot: { x: 0.53, y: 0.45, r: 0.15 },
        title: 'Forty seconds on one page',
        short: 'In the dark: Desmond Yap behind the chair with the microphone cable. Tan Sri Azhar at the head table with his speech cards. Ain back behind the press rope with her camera. Dr. Meera at table nine with her phone. You at the edge of the screen, with Daniel\'s lighter in your fist.',
        text: 'From 9:51:06 to 9:51:46 on Saturday night. Desmond Yap behind the high-backed chair, standing, with the cable of a microphone that had never been plugged into anything, while his faders moved on their own. Tan Sri Azhar at the head table with his speech cards and his wife\'s hand on his arm. Nurul Ain behind the press rope with her camera in her lap and her memory card already in the sugar bowl at table six. Dr. Meera Rajaratnam at table nine with her phone lit under the tablecloth, texting a Group Managing Director one word: "Selesa." Comfortable. And you, two metres from the silk, on your feet, with a silver lighter in your fist, listening to an old man die and thinking it was a chair.',
      },
    },
    {
      id: 'c7_21', phase: 'Dang Wangi', title: 'For the prosecutor',
      game: 'theory', variant: 'classic',
      brief: 'Deputy Public Prosecutor Hamidah Yusof arrives at half past six with her hair still wet, a flask of teh and one sheet of paper. Sinar\'s lawyer is in the car park. "Third time, detective. You know the rules. Not the evidence. The story. And this time I want the man on the telephone in it."',
      params: {
        prompt: 'Write Saturday night on Level 15 for the prosecutor: who killed Muthu and how, who gave the order and how it reached him, and why Muthu had to die.',
        context: 'Muthusamy Perumal ("Muthu"), 71, the Chairman of Sinar Holdings\' driver since 1986, had sat in the chair behind the screen at every Sinar dinner since 1997 as a silhouette while the Chairman\'s voice came from elsewhere. Dying of cancer, he told the Chairman he would show the detective the trick. At Sinar\'s 40th dinner on Level 15 of Menara Sinar, during a forty-second blackout at 9:51 PM, Desmond Yap, Sinar\'s Head of Events and AV, fired the blackout early by hand, left his desk and strangled Muthu from behind the chair with the cable of the prop microphone. The order came live from the Chairman, who spoke the whole speech by telephone from a car in Bay V1 on Basement 2, over Line 2 and its talkback into Desmond\'s headset: "Sekarang" (now); Desmond answered "Dah, Tuan" (done). Desmond was paid RM 300,000 the day before.',
        points: [
          { id: 'killer', label: 'Who killed Muthu, and how', criterion: 'Desmond Yap (the Head of Events / AV man) killed Muthu, by strangling him (with the microphone cable) from behind the chair. It must not say someone else killed him.', keywords: [['desmond', 'yap', 'av man', 'events'], ['strangl', 'cable', 'choke', 'kill', 'murder', 'garrot', 'cord']], hint: 'Whose prints run from the desk to the back of the chair, and what is six millimetres wide?' },
          { id: 'dark', label: 'When', criterion: 'It happened in the forty seconds of darkness (the blackout at 9:51) after the speech, which Desmond started early by hand, or while the lights were off behind the screen.', keywords: [['dark', 'blackout', 'forty seconds', '40 seconds', 'lights went out', 'lights out', 'cue 40', '9:51']], hint: 'Who pressed GO four seconds early?' },
          { id: 'order', label: 'Who gave the order', criterion: 'The Chairman (the voice) ordered it, live, over the telephone line / talkback / headset ("Sekarang"), or paid Desmond for it.', keywords: [['chairman', 'voice', 'tuan', 'telephone', 'talkback', 'headset', 'sekarang', 'phone'], ['order', 'told', 'said', 'paid', 'instruct', 'command', 'sekarang', 'now']], hint: 'What did the tape hear one second after "forty seconds"?' },
          { id: 'why', label: 'Why Muthu had to die', criterion: 'Muthu was killed because he was going to tell or show the detective the truth: that he was a stand-in in the chair / the voice came from elsewhere / the Chairman\'s secrets; he had told the Chairman he would.', keywords: [['tell', 'show', 'talk', 'confess', 'reveal', 'expose', 'truth'], ['detective', 'you', 'stand-in', 'standin', 'double', 'chair', 'trick', 'secret', 'chairman']], hint: 'What did Muthu tell Bala Anne on Friday night?' },
        ],
        need: 3,
        clue: 'Hamidah taps the sheet. "Three I can prove. Four, and the teh in this flask is yours."',
      },
      evidence: {
        img: 'ev_c7_report', hotspot: { x: 0.44, y: 0.55, r: 0.16 },
        title: 'His own words',
        short: 'Hamidah reads your report twice and writes a murder charge against Desmond Yap. Then she puts her pencil on the line under it, "and abetment by", which has been blank for three cases. "I have his own words now. Sekarang. Now I need to know where he was sitting when he said them."',
        text: 'Hamidah Yusof reads it twice with the pencil she never uses, then draws a line under one word on your sheet, the only word in it that is not English. "Sekarang." She writes the charge herself: Desmond Yap, Section 302, murder. Under it, "and abetment by", the line that stayed blank for Zul and blank for Kamal. She holds the pencil over it for a long time. "Last time I asked you for his own words," she says. "You have brought me his own words. One of them. On a cassette that a boy of nineteen found under a dust cover." She taps the line. "A voice is not a name. But a voice comes from somewhere. Tell me where he was sitting when he said it, and I will write that down, and for the first time Sinar\'s lawyers will have to stand up in court and say where their Chairman was."',
      },
    },
    {
      id: 'c7_22', phase: 'Dang Wangi', title: 'Twenty-nine years in my ear',
      game: 'interrogation', variant: 'classic',
      brief: 'Desmond Yap sits in interview room 3 with a towel round his shoulders and Chow Kit in his hair, and keeps touching his right ear as if the headset were still on it. He has put one man\'s voice into rooms for twenty-nine years and never once seen his face, and two hours ago that man watched him go down on a wet market floor and drove away. One thing he tells you is not true. Find it, and put the exhibit that breaks it on the table.',
      params: {
        setting: 'Interview room 3, IPD Dang Wangi. Sunday, 7:10 AM.',
        suspect: {
          id: 'desmond', voice: 'voice_3', name: 'Desmond Yap', role: 'Head of Events and AV, Sinar Holdings, 54',
          persona: 'Quiet, precise Kuala Lumpur Hakka Chinese technician who came up through RTM\'s sound department: soft Malaysian English, short sentences, technical words he uses to hide in ("feed", "delay", "cue", "line level"), "lah" only when frightened. Calls the Chairman "him" or "the voice", never "Tuan" unless he forgets. Speaks of the voice the way a devout man speaks of God. Keeps touching his right ear where the headset was. Breaks, if he breaks, not over the murder but over the car that drove away.',
        },
        facts: [
          { id: 'f1', topic: 'his job', claim: 'Head of Events and AV, Sinar Holdings. I came from RTM in 1996. I have run the screen at every dinner since the tower opened.' },
          { id: 'f2', topic: 'the screen', claim: 'Twelve panels, one lamp, one chair. The shadow must never move more than the voice. That is the whole art of it.' },
          { id: 'f3', topic: 'the microphone', claim: 'The microphone by the chair has never been connected. Not once in twenty-nine years. It is there for the shadow.' },
          { id: 'f4', topic: 'Muthu', claim: 'Uncle Muthu sat in the chair. I set his chair, I set his lamp, I gave him his cigarette. Twenty-nine years.' },
          { id: 'f5', topic: 'the face', claim: 'I have never seen his face. Nobody has. You do not need to see a face to know a voice.' },
          { id: 'f6', topic: 'the blackout', claim: 'Forty seconds of dark, one for each year. It used to be twenty-nine. Every year I add one second.' },
          { id: 'f7', topic: 'his lighter', claim: 'I carry a gas torch for heat-shrink on the cables. Every AV man does. I do not smoke.' },
        ],
        lies: [
          { id: 'l1', topic: 'the forty seconds', claim: 'I stood at my desk with my hands on the faders the whole forty seconds. Ask the desk.', truth: 'The faders moved on automation; he walked four metres round behind the chair and strangled Muthu with the microphone cable.', exposedBy: 'e1' },
          { id: 'l2', topic: 'Line 2', claim: 'He speaks from the glass room on Level 14, on the old cable. He always has.', truth: 'Since the floor was sealed the voice comes by telephone: at 9:28 he dialled the car in Bay V1 on Basement 2 from the hybrid on his rack.', exposedBy: 'e2' },
          { id: 'l3', topic: 'his headset', claim: 'My headset only hears the room. Nobody can speak to me on it.', truth: 'Line 2\'s talkback goes to his headset alone: at 9:51 it said "Sekarang" and at 9:54 he answered "Dah, Tuan".', exposedBy: 'e3' },
          { id: 'l4', topic: 'his pay', claim: 'I am on salary. Eleven thousand a month. No bonus this year, they said times are hard.', truth: 'On Friday 13 November Sinar paid him RM 300,000 for "technical services".', exposedBy: 'e4' },
        ],
        evidence: [
          { id: 'e1', title: 'From the desk to the chair', text: 'Behind the screen, his cut-heeled canvas soles in the haze film: from the AV desk round to the back of the chair, standing a long time, and back.' },
          { id: 'e2', title: 'Line 2 is a telephone', text: 'The hybrid under his rack dialled 011-2604 1986 at 9:28 PM. That prepaid sat on Menara Sinar\'s own aerial on Basement 2 until 9:58.' },
          { id: 'e3', title: '"Sekarang"', text: 'The old cassette deck on the CHAIRMAN feed: after the speech, on the talkback, "Sekarang." Three minutes and forty-four seconds later a man at a headset: "Dah, Tuan."' },
          { id: 'e4', title: 'Paid on Friday', text: 'The Events budget, restored: "Technical services", Friday 13 November, RM 300,000 to D. Yap, approved by the Office of the Chairman.' },
          { id: 'e5', title: 'His own dust', text: 'Level 14: Bomba\'s seals unbroken, and the old CHAIRMAN microphone in the glass room grey with months of dust.' },
          { id: 'e6', title: 'Patient: Tuan', text: 'Dr. Meera\'s file on "the Chairman" describes the dead driver, scar for scar.' },
        ],
        secret: 'On the voice\'s order "Sekarang", given live over the talkback from the car on Basement 2, he strangled Muthu in the blackout with the prop microphone\'s cable because Muthu had told the Chairman he would show the detective the trick; he was paid RM 300,000 the day before; he has had the voice in his ear for twenty-nine years and has never seen the face, and at Chow Kit the car came, watched, and left him.',
        suggested: [
          'Where were you during the forty seconds?',
          'Where does the Chairman speak from?',
          'Who can talk to you on your headset?',
          'What does Sinar pay you?',
          'What happened to Uncle Muthu?',
          'Have you ever seen his face?',
          'Who was in the car at Chow Kit?',
        ],
        maxQuestions: 14,
        clue: 'Farah puts his wet headset in an evidence bag on the table between you. "He keeps looking at it," she says. "Not at us. At it."',
      },
      evidence: {
        img: 'ev_c7_talkback', hotspot: { x: 0.58, y: 0.63, r: 0.15 },
        title: 'He came to watch',
        short: 'Caught in one lie, Desmond Yap does not ask for his lawyer. He asks for his headset, and when Farah says no, he tells the headset. "Sekarang, he said. So I did. He always says thank you." At Chow Kit the car was meant to take him to Johor. "He came. He saw you. He wound up the window." He has never seen the face. "I know his breathing better than my wife\'s."',
        text: 'He does not ask for the Sinar lawyer in the car park. He asks for his headset, and when Farah says no, he talks to it where it lies in its bag. "Twenty-nine years he has been in my ear. Every dinner. Every AGM. I know his breathing better than my wife\'s. I know when he is going to stop a sentence from the way he breathes in." He touches his right ear. "On Friday he said, Uncle Muthu wants to stop. After the forty seconds, Desmond. And he paid me, so I would know he meant it. Last night, after forty seconds, he said sekarang. So I did. It took longer than forty seconds. Afterwards he said thank you. He always says thank you." Then the only thing he says with any feeling in it. "If it went wrong I was to walk to Chow Kit, the Raja Bot side, at five, and a car would take me to Johor. It came. He saw you on top of me. He wound up the window." He looks at you for the first time. "You know what I wanted? Not the money. When the car came, I thought, now he will open the door, and I will see him. Once."',
      },
    },
  ],

  outcomes: {
    charged: {
      desmond: { en: 'Desmond Yap is charged on Monday morning in the magistrates\' court on Jalan Duta. He asks for his headset back, and when they say no, he holds one hand over his right ear for the whole hearing, as if somebody might still speak into it.' },
      azhar: { en: 'Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights in front of two photographers who were told exactly where to stand. By noon Sinar Holdings has a new Group Managing Director, and its share price has gone up.' },
      ain: { en: 'Nurul Ain is charged with murder in the same courthouse that heard her father\'s inquest. She has no camera. She asks the press on the steps to take her photograph, so that somebody does.' },
      meera: { en: 'Dr. Meera Rajaratnam is arrested at her clinic on Jalan Kia Peng between two patients. She asks Farah to tell the second one, an old man with a bad heart, that she is sorry, and that he must keep taking his tablets.' },
    },
    correct: ['desmond'],
  },

  // Hidden consequences, for later cases. AZHAR_WRONGED / AIN_WRONGED / MEERA_WRONGED: charged with a murder
  // they did not commit. VOICE_TRACED / VOICE_LOST: whether Hamidah's charge sheet names the car in Bay V1 on
  // Basement 2 (and the prepaid 011-2604 1986) as where the order came from. If DESMOND_FREE, Desmond is found
  // dead in Bay V1 on the Wednesday (the ending says so).
  flagNames: ['DESMOND_FREE', 'AZHAR_WRONGED', 'AIN_WRONGED', 'MEERA_WRONGED', 'VOICE_TRACED', 'VOICE_LOST'],
  flags: ({ charged, answers }) => ({
    DESMOND_FREE: !charged.includes('desmond'),
    AZHAR_WRONGED: charged.includes('azhar'),
    AIN_WRONGED: charged.includes('ain'),
    MEERA_WRONGED: charged.includes('meera'),
    VOICE_TRACED: answers.voice === 'car',
    VOICE_LOST: answers.voice !== 'car',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  // Daniel's branches hang on Cases 5 and 6's flags, so they use `when` (the voice manifest walks every line).
  ending(v) {
    const right = CASE07.outcomes.correct.every((id) => v.has(id));
    const wronged = v.has('azhar') || v.has('ain') || v.has('meera');
    const traced = v.answers.voice === 'car';

    const sheet = [];
    if (v.has('desmond')) sheet.push({ who: null, en: 'Hamidah Yusof writes the charge against Desmond Yap herself: Section 302, murder.' });
    else sheet.push({ who: null, en: 'Hamidah Yusof reads the file twice and writes no charge against the man at the desk. "Bring me the man at the desk," she says, "and I will bring you the man on the telephone."' });
    if (traced) {
      sheet.push({ who: null, en: 'Under it, "and abetment by", and for the first time in three cases she writes something after it: a person unknown, the user of prepaid line 011-2604 1986, in a vehicle without registration plates, in Bay V1, Basement 2, Menara Sinar, at 9:51 PM.' });
      sheet.push({ who: 'Inspector Farah Iskandar', en: 'It is not a name. It is a place, a time and a telephone. In this country men have gone to prison on less. Not men like him. Not yet.' });
    } else {
      const wrongLine = {
        screen: 'She reads "behind the screen", and crosses it out. "The man behind the screen is in the mortuary, detective."',
        glass: 'Rosli breaks his own Bomba seal on Level 14 for a second look, and finds his own dust again. By noon Sinar\'s lawyers have the broken seal in a letter to DBKL.',
        tape: 'Sinar\'s studio in Damansara hands over its recordings of every Chairman\'s speech, very politely. None of them has last night on it, and none of them says "sekarang".',
      }[v.answers.voice] || 'Nobody tells her where he was sitting.';
      sheet.push({ who: null, en: wrongLine });
      sheet.push({ who: null, en: 'Under "and abetment by", the line stays blank, as it has stayed blank for three cases.' });
    }
    sheet.push({ who: null, en: 'At Subang, customs clears a Sinar jet to Seletar at 7:15 on Sunday morning. One passenger, name withheld. Officer: N. SALLEH.', when: (f) => f.NORHAYATI_FREE });
    sheet.push({ who: null, en: 'Farah\'s constable at Chow Kit saw the driver of the black car for two seconds: an older Chinese man in a white shirt, with a jade bangle on his wrist.', when: (f) => f.JEFFREY_FREE });
    sheet.push({ who: null, en: 'Farah\'s constable at Chow Kit saw the driver of the black car for two seconds: a Sri Lankan face, and four old scratches on his forearm.', when: (f) => f.KASUN_FREE && !f.JEFFREY_FREE });
    sheet.push({ who: null, en: 'Rizal Hamdan resigns from Kawalan Sentosa on Monday by text message, and his telephone is switched off by lunchtime.', when: (f) => f.RIZAL_FREE });

    let ainLine;
    if (right && !wronged) ainLine = 'The first photograph of the man behind the screen since 1997, and it is the wrong man. My editor wants it on the front page as the Chairman. I am going to put his real name under it. Muthusamy Perumal. Somebody should.';
    else if (!v.has('desmond')) ainLine = 'You let the man at the desk walk out of that building. He was three metres from my lens with his hand on his headset, and his lips were moving.';
    else ainLine = 'You got the man at the desk. You also got somebody who was never behind that screen in the dark. Abah would have asked which one of those the Chairman wanted.';

    const panels = [
      { img: 'c7_out_01_arrest', mood: 'police', fx: ['rain', 'siren'], place: 'IPD Dang Wangi. Sunday, 8:30 AM.', music: 'resolution',
        lines: v.charged.map((id) => ({ who: null, en: CASE07.outcomes.charged[id].en })) },
      { img: 'c7_out_02_sheet', mood: 'day', fx: [], place: 'IPD Dang Wangi. Sunday, 9:00 AM.', lines: sheet },
      { img: 'c7_out_03_screen', mood: 'day', fx: ['dust'], place: 'Level 15, Menara Sinar. Monday, 10:00 AM.',
        lines: [
          { who: null, en: 'Workmen take the screen down panel by panel and roll the silk round cardboard tubes. The high-backed chair stays where it is, because nobody has been told what to do with it.' },
          { who: null, en: 'Sinar Holdings tells Bursa Malaysia that its Chairman is in good health and will not be taking questions. The share price closes up four sen.' },
          { who: null, en: 'Tan Sri Azhar\'s office on Level 15 is empty by noon. His succession memo is on the board\'s agenda on Thursday, under somebody else\'s initials.', when: (f) => f.AZHAR_WRONGED },
          { who: null, en: 'Tan Sri Azhar Kamaruddin chairs Monday\'s board meeting from the chair at the head of the table. It is noticed that he does not lean back in it.', when: (f) => !f.AZHAR_WRONGED },
          { who: null, en: 'Dr. Meera Rajaratnam hands Farah the file marked TUAN herself, and closes her clinic for a week. She says she will never again examine a patient whose name she does not know.', when: (f) => !f.MEERA_WRONGED },
          { who: null, en: 'The Malaysian Medical Council suspends Dr. Meera Rajaratnam. Her patients receive a letter. The old man with the bad heart keeps taking his tablets.', when: (f) => f.MEERA_WRONGED },
          { who: null, en: 'Desmond Yap goes back to work on Monday. On Wednesday morning the attendants find his car in Bay V1 on Basement 2 with the engine running and a hose from the exhaust. Dang Wangi call it a suicide. His headset is round his neck.', when: (f) => f.DESMOND_FREE },
          { who: null, en: 'Kamal Ariffin flies in from Colombo for the dinner and is seen at table twenty-eight in a borrowed suit. He flies back on Sunday before anybody thinks to ask him why.', when: (f) => f.KAMAL_FREE },
        ] },
    ];

    // Daniel, by Cases 5 and 6.
    panels.push({ img: 'c7_out_04_free', mood: 'night', fx: [], place: 'A house Farah has not told you about. Sunday, 10:30 PM.', music: 'memory', when: FREE,
      lines: [
        { who: null, en: 'You tell Daniel about the old man with the teh, and the chair, and the forty seconds, and the dockets in Bala Anne\'s shoebox.' },
        { who: 'Daniel Raj', en: 'Table seven. August 2016. The old man in the white shirt who paid for our teh. That was Muthu?' },
        { who: 'Daniel Raj', en: 'Ten years I have been sure of one thing, machan: that I had seen him once. I never saw him at all.' },
        { who: null, en: 'He folds a kancil out of the gala\'s menu card while he talks, and does not seem to know he is doing it.' },
      ] });
    panels.push({ img: 'c7_out_04_remand', mood: 'night', fx: [], place: 'Sungai Buloh prison, visiting room 4. Monday, 2:00 PM.', music: 'memory', when: REMAND,
      lines: [
        { who: null, en: 'Through the glass you tell Daniel about the old man with the teh, and the chair, and the forty seconds.' },
        { who: 'Daniel Raj', en: 'Table seven. August 2016. The old man in the white shirt who paid for our teh. That was Muthu?' },
        { who: 'Daniel Raj', en: 'Then I have never seen him, machan. Not once. And he has seen me every day for ten years.' },
        { who: null, en: 'His trial has been moved to March, on an application signed by a superintendent at Bukit Aman.', when: (f) => !f.KHAIRUL_WRONGED },
      ] });
    panels.push({ img: 'c7_out_04_held', mood: 'night', fx: ['rain'], place: 'Brickfields. Sunday, 11:50 PM.', music: 'memory', when: HELD,
      lines: [
        { who: null, en: 'Wherever the black car went after Chow Kit, it went with Daniel in the back of it.' },
        { who: null, en: 'At midnight something slides under your office door: a kancil folded from a gala menu card, its gold border on the outside. Pricked along one fold with a pin: MASIH HIDUP. Still alive.' },
        { who: null, en: 'He has been in the same car as the man. He has sat beside him in the dark. Whether he has seen his face, the kancil does not say.' },
      ] });

    const warung = [];
    if (v.has('ain')) {
      warung.push({ who: null, en: 'Ain\'s photograph is in a Dang Wangi evidence bag. Mak Teh has a print of it pinned behind her counter, where the calendar used to be, and tells anybody who asks that it is her uncle.' });
    } else {
      warung.push({ who: null, en: 'Ain lays her photograph on Mak Teh\'s table between two glasses of teh: an old man in a white shirt, lit from below, his mouth shut, while three hundred people heard him speak.' });
      warung.push({ who: 'Nurul Ain', en: ainLine });
    }
    panels.push({ img: 'c7_out_05_warung', mood: 'day', fx: [], place: 'Mak Teh\'s warung, Kampung Baru. Monday, 7:00 AM.', lines: warung });

    panels.push({
      img: 'c7_out_06_cremation', mood: 'day', fx: ['dust'], place: 'The Hindu crematorium, Cheras. Monday, 4:00 PM.', music: 'chairman',
      lines: [
        { who: null, en: 'Muthu has no family left, so Bala Anne walks in front with the fire pot, barefoot, in a white veshti, the way a son would.' },
        { who: null, en: 'Two hundred men in white shirts stand in the heat. Drivers, mostly. Half of Brickfields knew him, and not one of them knew who he drove for.' },
        { who: 'Bala Anne', orig: 'Muthu nalla manushan.', en: 'Muthu was a good man.' },
        { who: null, en: 'Across the road in the Cheras cemetery, a headstone that said Daniel Raj for five years says Ong Wei Jie now.', when: (f) => f.BODY_NAMED },
        { who: null, en: 'You smell the cigarette before you feel the hand. It settles on your right shoulder, light, in a white cuff, the way a man rests his hand on an old friend.' },
        { who: 'The Chairman', orig: 'Jangan tengok belakang, detektif.', en: 'Don\'t look back, detective.' },
        { who: 'The Chairman', en: 'That is what your partner said to you in the fire. I was close enough to hear it.' },
        { who: 'The Chairman', en: 'Muthu drove me for forty years and never once looked in the mirror. I need a new driver.' },
        { who: 'The Chairman', en: 'The first of December. Ten past two. Outside Restoran Bala. You may look in the mirror as often as you like.' },
        { who: null, en: 'A lid snaps open by your ear, and shut. The hand lifts. When you turn round there are two hundred men in white shirts, and one of them is walking away, and you will never know which.' },
        { who: null, en: 'In your jacket pocket, where his hand was, a car key on a ring with a small brass sun.' },
      ],
    });
    return panels;
  },
};
