// CASE 12: UNKNOWN MALE. The Season Two finale. Jugra, Hospital Kuala Lumpur, Menara Sinar, Bukit Aman, Brickfields.
// Truth (writers only): MURDER AND ARSON, on a printed order, on the fifteenth night of the new year.
// The Office of the Chairman summoned three people to the old Sinar gate at Jugra for 2:10 AM on Sunday 21 Feb
// 2027 (Chap Goh Meh night): the detective (Case 11's call, "bring the plate"), Tan Sri Azhar (a typed card:
// "Ten past two. The gate. Drive me last.") and Nurul Ain (a card under her door: "Ten past two. The gate at
// Jugra. Bring your camera."): a believable witness, an ambitious man and a journalist, at a death.
// There are two identical black cars and two keys. Car A left Bay V1 on Basement 2 of Menara Sinar at 0:50 with
// one passenger already in the back. Car B left Bay V2, behind a roller shutter, at 1:20 (only JASON_FREE players
// learn who drove it: Jason Ooi, to the lighthouse road on Bukit Jugra, one passenger in the back, window down;
// they watched the gate burn at ten past two and came back to V2 at 3:58).
// The culprit is Sjn. Mohd. Asri bin Ghazali, 38, Farah's sergeant, on Sinar's figure since 2019 (RM 3,000 a month;
// his folder in carton A of the Jugra archive, which he signed out on 3 Dec 2026 and never returned). Farah told him
// to watch V1 and report. He drove car A himself (his motorbike had been left in the palms at Jugra on Saturday
// afternoon), by the old Klang to Banting road (Jenjarom camera 1:34), to the gate at 1:50 (Pak Itam, rung at
// 1:00, opened it and looked at the ground). At 1:55 the sedated passenger tapped TOLONG on the window glass with
// a ring; at about 1:56 Asri smothered him with the small back-seat cushion. At 2:01 he keyed his police handset
// inside the car to tell Farah he had "lost the car at Jenjarom"; the car's own recorder kept the handset's ID burst,
// D9-HT-41. He poured petrol in the front, walked into the palms with the can (Ain's frame, 2:05), threw a lit
// marine flare into the front footwell at 2:08, walked 300 m to his bike and "arrived" at 2:34 from the Jenjarom
// road. RM 250,000 reached his wife's account on Friday 19 Feb. The printed order, shredded by his locker:
// "The car first. Then the certificate." (the certificate: he was to keep saying, at the hospital, that everybody
// knows who it is). He was told to burn his raincoat; he kept it, because stores counts raincoats.
// Red herrings: Tan Sri Azhar (at Jenjarom at 2:12, at the gate 2:20 to 2:22, after the death and the fire; he came
// to be the last driver and the next Chairman, saw the fire, and drove away); Pak Itam (never left the gate post;
// rang Bomba at 2:16; his arthritic hands could not hold a cushion down for two minutes); Nurul Ain (hid in the
// palms; photographed the car at 1:52 and 2:05; ran when she saw the can).
// The dead man: about seventy-five, white shirt (Leong's, made "for a long journey"), a cravat over an old, healed
// laryngectomy (no voice: he cannot have been the voice of Case 7 or Case 8), a silver flip-top lighter with a brass
// sun in his left fist, a scorched card with the nine rules and a tenth ("10. Whoever drives me last."). Left thumb
// nine points of sixteen against the 1987 deed; mitochondrial DNA matches the grey hair of 1 December; nuclear DNA in
// no file; teeth never treated by anyone who kept a record. Dead before the fire.
// The Chairman: NOT named, NOT seen. His identity is still undecided, and so is whether the dead man was him. Nothing
// here may settle either. The voice is alive on Wednesday: "Not the front. Tonight I drive." The mirror holds the
// detective's eyes and his; the player never sees his, and the text never says whether the detective knew them.
// Candidate protection (arc §1 rule 5): Bala Anne, Uncle Wong, Tan Sri Azhar and Pak Itam get no hand, height,
// smoking, watch wrist, swimming, Singapore, family, throat or 1985 to 1987 here, and no place on screen at
// 1:00 to 2:40 AM on Sun 21 Feb or 1:30 to 2:30 AM on Wed 24 Feb, except Pak Itam at the gate 1:00 to 2:40 and
// Tan Sri Azhar at Jenjarom at 2:12 and at the gate 2:20 to 2:22 on the Sunday.

// Daniel at the start of Case 8 (arc §2): from Case 9 on he is free in every branch.
const HELD7 = (f) => (!!f.DANIEL_TAKEN || !f.DANIEL_FOUND) && !f.ARCHIVE_SEIZED;
const WAS_HELD = HELD7; // he rode hooded in the back seat on 1 December
const DNAA = (f) => !!f.DANIEL_CHARGED; // his charge was withdrawn as a discharge not amounting to acquittal

// Real hotspots come after the art exists; until then every exhibit circles the middle of the photograph.
const HOT = () => ({ x: 0.5, y: 0.5, r: 0.12 });

const CERT = [
  { id: 'chairman', label: 'The Chairman of Sinar Holdings', note: 'The man whose thumb is on the 1987 deed, on nine points of sixteen.' },
  { id: 'brother', label: 'The Chairman\'s brother', note: 'His mother\'s line matches the hair from the back seat on 1 December.' },
  { id: 'double', label: 'Another stand-in, like Muthu', note: 'He could not speak. The voice still can.' },
  { id: 'unknown', label: 'Unidentified male, about seventy-five', note: 'Exactly what the evidence will carry, and no more.' },
];

export const CASE12 = {
  id: 'case12',
  number: 12,
  title: 'Unknown Male',
  place: 'Jugra and Kuala Lumpur',
  victim: 'A man in a white shirt, about seventy-five, no name. Found in the back seat of a burned black car at the Jugra gate at 2:25 AM on Sunday.',
  question: 'Who killed the man in the back seat?',
  brief: 'He asked you to come to the gate at ten past two on the fifteenth night of the new year and to bring the plate. You were late. The black car was burning under the pink sun, and in the back seat, behind the driver, sat a man in a white shirt with a lighter in his fist. By noon Sinar\'s lawyers want a death certificate. By noon the papers want a name.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end: who killed the man in the back seat, and what Hamidah writes on the form. Nobody will tell you if you get either of them right. This time nobody can.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Rosli sent a photograph of the gate at Jugra in the rain: the pink sun scorched black along its lower edge, the chain back on its post.',
  deduction: {
    lede: 'Farah will arrest whoever you name for the murder of the man in the back seat. She asks you, very quietly, to be sure. Name everyone who killed him, and only them.',
    button: 'Tell Farah',
    confirm: 'Farah will arrest {names}. She will do it herself, and she will not ask you to come.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Farah',
    questions: [
      {
        id: 'cert', q: 'What does the death certificate say?', short: 'Hamidah writes',
        lede: 'Hamidah Yusof puts the burial permit from Hospital Kuala Lumpur on the table. Somebody must write a name in the box, or the word that means nobody knows. Whatever she writes will be on the front pages by noon, and on a grave by Friday.',
        options: CERT,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest.
  suspects: [
    {
      id: 'itam', name: 'Pak Itam (Ibrahim bin Sulong)', role: 'Watchman at the old Sinar yard, Jugra, since 1985. 74', img: 'sus_itam',
      revealedBy: 'c12_02',
      revealLine: 'He opened the gate at ten to two for a car he was told not to look at.',
      look: { skin: '#5a3a26', hair: 'short', hairColor: '#e6e6e6', coat: 'batik', eyewear: 'none', mark: 'stubble' },
      motive: 'He has kept the gate for forty years and answers to whoever rings his hut. He knows more about the yard than he has ever said, and says it in pantun.',
      claim: 'Says he opened the gate, looked at the ground, stood at the gate post, and rang Bomba when the car burned.',
    },
    {
      id: 'ain', name: 'Nurul Ain', role: 'Freelance journalist. Dato\' Rashid Osman\'s daughter. 27', img: 'sus_ain',
      revealedBy: 'c12_03',
      revealLine: 'Running shoes in the palms, twenty metres from the car, running away.',
      look: { skin: '#d9a77f', hair: 'tudung', hairColor: '#151210', coat: 'trench', eyewear: 'none', mark: 'none' },
      motive: 'Her father fell from Level 14. She has said in print that she will show the world the Chairman\'s face if it is the last thing she does.',
      claim: 'Says a card under her door told her to come and bring her camera, and that she took two photographs and ran.',
    },
    {
      id: 'azhar', name: 'Tan Sri Azhar Kamaruddin', role: 'Twenty-nine years the face of Sinar Holdings. 68', img: 'sus_azhar',
      revealedBy: 'c12_04',
      revealLine: 'A Mercedes asked the way to Jugra at 2:12, and the man at the wheel had a white moustache.',
      look: { skin: '#c48b62', hair: 'side-part', hairColor: '#b8b8b8', coat: 'blazer', eyewear: 'none', mark: 'moustache' },
      motive: 'He has wanted the chair since October. A letter of wishes says the Trust goes to whoever drives the Chairman last.',
      claim: 'Says he was at home in Damansara Heights all night and has never been to the gate at Jugra in his life.',
    },
    {
      id: 'asri', name: 'Sjn. Mohd. Asri bin Ghazali', role: 'Sergeant, D9, Bukit Aman. Farah\'s sergeant. 38', img: 'sus_asri',
      revealedBy: 'c12_07',
      revealLine: 'Handset forty-one keyed its radio at 2:01, close enough for the car to hear it.',
      look: { skin: '#a8714a', hair: 'short', hairColor: '#141210', coat: 'leather', eyewear: 'none', mark: 'moustache' },
      motive: 'None known. Four years Farah\'s sergeant. He was the eyes on Bay V1 that night, and the only one who saw the car leave.',
      claim: 'Says he followed the car on his motorbike, lost it at Jenjarom, and reached the gate at 2:34 from the Jenjarom road.',
    },
  ],

  opening: [
    {
      img: 'c12_intro_01_chapgohmeh', mood: 'warm', fx: [], place: 'Restoran Bala, Brickfields. Saturday, Chap Goh Meh, 11:50 PM.', music: 'office',
      lines: [
        { who: null, en: 'The fifteenth night of the new year. Somebody on Jalan Tun Sambanthan has hung oranges in a net over a shop door, and somebody in a back lane is letting off firecrackers one string at a time, as if they were rationed.' },
        { who: null, en: 'Bala Anne has his shutter half down. He has not pulled it the rest of the way, and he has not opened it either.' },
        { who: 'Bala Anne', orig: 'Thambi. Poga vendaam.', en: 'Boy. Don\'t go.' },
        { who: null, en: 'At the counter Farah rings her sergeant on her own telephone, which is charged tonight.' },
        { who: 'Inspector Farah Iskandar', en: 'Watch V1. Tell me when it moves.' },
        { who: null, en: 'On the back seat of her car, wrapped in a Bomba blanket, the rusted plate BCK 210 with its small painted sun. He asked you to bring it.' },
        { who: null, en: 'Daniel sits on the step under the half shutter with every light in the shop on behind him. Since December he has slept with the light on.', when: WAS_HELD },
        { who: null, en: 'Daniel sits on the step under the half shutter folding a kancil out of a red packet, and does not look up when the firecrackers go.', when: (f) => !WAS_HELD(f) },
        { who: 'Daniel Raj', en: 'A man whose charge can come back any morning does not go to a fire, machan. I will mind the telephone.', when: DNAA },
        { who: 'Daniel Raj', en: 'Somebody has to mind the telephone, machan. He likes to ring it.', when: (f) => !DNAA(f) },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c12_intro_02_radio', mood: 'night', fx: [], place: 'Brickfields. Sunday, 12:52 AM.', music: 'tension',
      lines: [
        { who: null, en: 'Farah\'s radio, on the counter between two glasses of teh, clicks once.' },
        { who: 'Sjn. Asri', orig: 'Kereta dah keluar dari V1. Satu penumpang. Saya ikut dengan motor.', en: 'The car has left V1. One passenger. I\'m following on the bike.' },
        { who: null, en: 'Farah wants to reach the gate at ten past two and not a minute before. She has timed the road twice. At twenty to two you leave Brickfields in her car, with the plate on the back seat.' },
        { who: 'Daniel Raj', en: 'You will both be late.' },
      ],
      kb: { from: [1.0, 0, 1], to: [1.1, 0, -1] },
    },
    {
      img: 'c12_intro_03_banting', mood: 'night', fx: [], place: 'The old Klang to Banting road. 2:01 AM.',
      lines: [
        { who: null, en: 'No tolls on the old road, and few cameras: oil palm on both sides, a lorry stop shuttered for the holiday, a temple with every lamp lit for the full moon.' },
        { who: 'Sjn. Asri', orig: 'Puan, saya hilang dia di Jenjarom.', en: 'Ma\'am, I lost him at Jenjarom.' },
        { who: null, en: 'Farah asks him where he is. The radio gives her the hiss of an open channel, and then not even that. She puts her foot down.' },
      ],
      kb: { from: [1.12, 0, 0], to: [1.0, 0, 0] },
    },
    {
      img: 'c12_intro_04_gate', mood: 'fire', fx: ['siren'], place: 'The Jugra gate. 2:25 AM.', music: 'fire',
      lines: [
        { who: null, en: 'You are late. The pink sun on the gate is lit from below, by a fire.' },
        { who: null, en: 'Inside the gate, on the laterite where Sinar\'s first lorry stood, a long black car with no plates is burning from the front seats back.' },
        { who: null, en: 'Under the sun, in small black letters three weeks old, the firelight finds a name: TEOH AH CHUAN 1934–1986.', when: (f) => f.GATE_TRUTH && !f.YANG_WRONGED },
        { who: null, en: 'Pak Itam stands at the gate post with a bucket of water he has not used, and looks at the ground. Bomba\'s lights are coming down the road from Banting.' },
        { who: 'Inspector Farah Iskandar', en: 'Asri. Asri, where are you?' },
      ],
      kb: { from: [1.0, 0, 2], to: [1.14, 0, -2] },
    },
    {
      img: 'c12_intro_05_backseat', mood: 'police', fx: ['dust'], place: 'The Jugra gate. Dawn.', music: 'tension',
      lines: [
        { who: null, en: 'Rosli, in yesterday\'s uniform, opens the back door with a crowbar when the metal will let him.' },
        { who: null, en: 'Behind the driver\'s seat sits a man in a white shirt, upright against the door, his collar buttoned and a cravat at his throat. In his left fist, so tight that Rosli does not try to open it, a silver lighter.' },
        { who: 'Fire Officer Rosli', en: 'He was dead before the fire, Tuan. Look at his mouth. No soot.' },
        { who: null, en: 'Nobody at the gate says who he is. Everybody at the gate is thinking it.' },
      ],
      kb: { from: [1.05, -1, 0], to: [1.0, 1, 0] },
    },
    {
      img: 'c12_intro_06_motorbike', mood: 'night', fx: [], place: 'The Jugra gate. 2:34 AM.',
      lines: [
        { who: null, en: 'Before the dawn and before the crowbar: a motorbike coming fast from the Jenjarom road, and a police sergeant in a navy windbreaker with his helmet already off.' },
        { who: 'Sjn. Asri', orig: 'Puan. Maaf. Saya hilang dia.', en: 'Ma\'am. Sorry. I lost him.' },
        { who: null, en: 'Farah puts her hand on his shoulder, the way she would for anybody who had ridden through the night for her.' },
      ],
      kb: { from: [1.0, 1, 0], to: [1.12, -1, 0] },
    },
    {
      img: 'c12_intro_07_hamidah', mood: 'day', fx: [], place: 'Hospital Kuala Lumpur. Sunday, 7:00 AM.',
      lines: [
        { who: null, en: 'Deputy Public Prosecutor Hamidah Yusof, hair still wet, a flask of teh, at the door of the forensic department.' },
        { who: 'Hamidah Yusof', en: 'Sinar\'s lawyers have asked for a death certificate by noon. Bursa has asked for a name. I have asked for neither.' },
        { who: null, en: 'Two newspapers already have the headline set. They are waiting for somebody to tell them which word goes in it.' },
      ],
      kb: { from: [1.08, -2, 0], to: [1.0, 2, 1] },
    },
    { title: { kicker: 'Case 12', name: 'Unknown Male' }, fx: [] },
  ],

  levels: [
    // ---------------- The gate ----------------
    {
      id: 'c12_01', phase: 'The gate', title: 'What did not burn',
      game: 'wordsearch', variant: 'secret',
      brief: 'Bomba Banting had the fire out at 2:51. At first light Rosli walks round what is left of the black car with a clipboard, as he has walked round every burnt thing in this story, and writes down everything that did not burn. Find every word on his list. The letters nobody used are his note to you.',
      params: {
        size: 12,
        words: ['LIGHTER', 'CRAVAT', 'CUSHION', 'HEADREST', 'ASHTRAY', 'SEATBELT', 'HANDBRAKE', 'MIRROR', 'BUCKLE', 'COLLAR', 'HINGES', 'SPRINGS', 'CHROME'],
        extra: ['RIMS', 'AXLE', 'BOOT', 'LATCH', 'VENT', 'BOLTS', 'GLASS', 'STEEL', 'WHEEL', 'PEDAL', 'KNOB', 'BONNET'],
        message: 'DEADBEFORETHEFIRE',
        messageSpaced: 'DEAD BEFORE THE FIRE',
      },
      evidence: {
        img: 'ev_c12_survived', hotspot: HOT(),
        title: 'Dead before the fire',
        short: 'Rosli\'s list, and under it his note: DEAD BEFORE THE FIRE. No soot in the dead man\'s nose or mouth. The fire began in the front footwell on the driver\'s side, with petrol, and ran backwards; the man behind the driver\'s seat was already dead when it reached him.',
        text: 'Rosli writes the way he talks, in short lines. The steel of the doors. The springs of the seats. The chrome of the handles, gone brown. The headrest behind the driver, its cover gone, its foam a black sponge. The small cushion that lives on the back seat, half burnt, lying on the floor at the dead man\'s feet instead of behind his back. A silver flip-top lighter, in a fist. A white collar, a cravat, a card in a breast pocket. And where it began: the front footwell on the driver\'s side, a puddle-shaped burn that only petrol leaves, and a char line that runs low and fast from the front of the car to the back, the way fire runs when somebody has given it a road. Under the list, in capitals, the thing Rosli wanted you to read first. There is no soot in the dead man\'s nose or mouth, and his skin is not the colour smoke leaves. "He did not breathe the fire, Tuan," Rosli says. "He was sitting in it. Somebody sat him there."',
      },
    },
    {
      id: 'c12_02', phase: 'The gate', title: 'The watchman',
      game: 'witness', variant: 'statement',
      brief: 'Pak Itam has kept this gate for forty years and has never once been asked to sit down to give a statement. Farah asks him in his hut, with the door open so that he can see the gate. He answers her first question with a pantun about a well in a field and a long life, and then he gives it once, plainly, looking at the floor.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Statement of Ibrahim bin Sulong ("Pak Itam"), 74, watchman, the old Sinar yard, Jugra. Recorded Sunday, 6:40 AM.',
        introLine: '"Kalau ada sumur di ladang, boleh kita menumpang mandi." Farah waits. "Baik," he says. "Once."',
        retryLine: 'He gives it again in exactly the same words, as if he had learned it long ago.',
        statement: [
          'At one o\'clock the telephone in my hut rang. I do not ask a voice its name. It said: open the gate at ten to two, do not look at the driver, then go back to your post. I said baik.',
          'At ten to two I took the chain off. One car came, black, no number, lights low. It drove in past me and stopped on the laterite where the old lorry used to stand. A driver in a cap. In the back, behind him, a passenger in white. I looked at the ground. That is what I was told.',
          'I stood at the gate post. The car stood with its engine off. Once the light inside it came on and went off again. I did not look, but I am not blind. Nobody came out for a long time. Then the driver\'s door. Then I heard a man walking in the palms.',
          'At ten past two there was a light, like a flare at sea, and then the whole car was burning. I went into the hut and rang Bomba at Banting. Sixteen minutes past two, by the clock on my wall. Then I took the bucket. A bucket is nothing to a car.',
          'At twenty past two a big car came down the road fast, stopped at the gate with its lights on me, and stayed there one minute, maybe two. Nobody got out. Then it turned round in the road and went back the way it came. Then Bomba. Then you.',
        ],
        questions: [
          { q: 'Who rang Pak Itam\'s hut at one o\'clock?', options: ['Inspector Farah', 'A voice that gave no name', 'Tan Sri Azhar', 'Bomba'], a: 1 },
          { q: 'When was he told to open the gate?', options: ['Half past one', 'A quarter to two', 'Ten to two', 'Ten past two'], a: 2 },
          { q: 'What was he told not to do?', options: ['Close the gate', 'Look at the driver', 'Answer the telephone', 'Leave the hut'], a: 1 },
          { q: 'Where did the passenger sit?', options: ['In front, beside the driver', 'In the back, behind the driver', 'In the back, on the left', 'There was no passenger'], a: 1 },
          { q: 'What did the driver wear on his head?', options: ['Nothing', 'A helmet', 'A cap', 'A songkok'], a: 2 },
          { q: 'Where did Pak Itam stand?', options: ['In his hut', 'At the gate post', 'In the palms', 'Beside the car'], a: 1 },
          { q: 'When did he ring Bomba?', options: ['2:10', '2:12', '2:16', '2:20'], a: 2 },
          { q: 'What came to the gate at twenty past two?', options: ['A motorbike', 'A big car, which turned round and left', 'A lorry', 'A police car'], a: 1 },
          { q: 'How long did it stay?', options: ['A few seconds', 'One or two minutes', 'Ten minutes', 'Until Bomba came'], a: 1 },
        ],
      },
      evidence: {
        img: 'ev_c12_hut', hotspot: HOT(),
        title: 'The gate at one-fifty',
        short: 'Pak Itam: a call to his hut at 1:00, "open the gate at ten to two, do not look at the driver". One black car, a driver in a cap, a passenger in white behind him. At ten past two a light, then fire; he rang Bomba at 2:16. At twenty past two a big car stopped at the gate for a minute or two, and went back the way it came.',
        text: 'The hut is a box of planks with a telephone on the wall, a clock beside it, a rice tin, a mat and a hurricane lamp. The log of its line, which Farah has from the telco by eight: one incoming call at 1:00:14, forty seconds, from a number the telco cannot put a name to; one outgoing call at 2:16:03, to Balai Bomba Banting. Pak Itam opened the gate for a car he was told not to look at, and he did not look at it, and he says so as if not looking were a trade he had learned. A driver in a cap; a passenger in white, behind the driver; a light inside the car that went on once and off; a door, and a man walking in the palms; at ten past two a flare, and fire. At twenty past two, a big car with its headlights full on him for a minute or two, nobody getting out, and then a three-point turn in the road and gone. The chain hangs on its nail in the hut with its padlock open. "Forty years I keep the gate," he says. "This is the first car that did not leave."',
      },
    },
    {
      id: 'c12_03', phase: 'The gate', title: 'The first row of palms',
      game: 'footprint', variant: 'classic',
      brief: 'The oil palm comes right up to the yard on the lighthouse side: rows of trunks, a floor of cut fronds and wet black earth. Rosli lays his lamp flat in the first row, twenty metres from the car, and the mud stands up in relief. Somebody stood here a long time in the dark, facing the gate, and then ran. Name the tread, then find the shoe.',
      params: { shoes: 9 },
      evidence: {
        img: 'ev_c12_trainers', hotspot: HOT(),
        title: 'Running shoes in the palms',
        short: 'A woman\'s trainers, size 5, twenty metres from the car in the first row of palms: a flattened patch where somebody knelt and stood for a long time facing the gate, then long running strides away from the car, toward the lighthouse road on Bukit Jugra. The tread is the brand Nurul Ain has worn to every crime scene since her father\'s.',
        text: 'Under the raking lamp the mud gives up a story in two halves. First, stillness: two knee marks, the square print of a bag set down, a pair of small trainers turned toward the gate and shifting their weight from heel to heel over a long time, the way a person stands who is waiting for something to happen and is afraid it will. Then flight: the same trainers, toe-deep, strides a metre and a half long, away from the car and never toward it, through four rows of palms and up the slope toward the lighthouse road on Bukit Jugra, until the earth turns to gravel and the trail ends. Nowhere in the first row do the prints come closer to the car than twenty metres. A woman\'s size 5, a running shoe with a chevron tread worn smooth at the outside of the heel. Farah knows the brand before Rosli says it. "Ain," she says. "She wears them to every scene. She wore them to her father\'s."',
      },
    },

    // ---------------- Jenjarom ----------------
    {
      id: 'c12_04', phase: 'Jenjarom', title: 'Pump four',
      game: 'lineup', variant: 'single',
      brief: 'There is one petrol station open all night between Jenjarom and Banting, and on the fifteenth night of the new year its attendant, a boy called Hafiz with a phone in his hand, had exactly one customer who bought nothing. A man pulled in at pump four, asked him the way to the old Sinar gate, and drove off south before Hafiz had finished pointing. Hafiz saw him in the forecourt light. Look at the frame, fast, and pick the face.',
      params: { rounds: 3, studySeconds: [10, 8, 6] },
      evidence: {
        img: 'ev_c12_petrol', hotspot: HOT(),
        title: 'Asking the way to Jugra',
        short: 'Three times out of three Hafiz picks the same face: Tan Sri Azhar Kamaruddin, at 2:12 AM at pump four of the Jenjarom petrol station, at the wheel of a dark Mercedes, asking "Which way to the old Sinar gate?" He drove south before Hafiz had finished pointing.',
        text: 'The forecourt camera keeps the minute: 02:12:31. A dark Mercedes saloon at pump four with its engine running and the driver\'s window down, and nobody else in the car. Hafiz goes to the window because a car like that at two in the morning is either lost or trouble. A man with silver hair and a white moustache, in a jacket and no tie, asks him the way to the old Sinar gate, "the yard, under the hill", and Hafiz starts to tell him and gets as far as the second left before the window goes up and the car pulls out south toward Banting. Three times Hafiz picks the face out of the row, and the third time he does not look at the others. "Tan Sri," he says. "From the television. The one from the dinner." He did not buy anything. Hafiz wrote the time on his hand, because his mother told him to write down anything strange that happens on a holiday.',
      },
    },

    // ---------------- The gate ----------------
    {
      id: 'c12_05', phase: 'The gate', title: 'Under the back seat',
      game: 'nonogram', variant: 'classic',
      brief: 'Under the back seat, down among the springs, Rosli finds a steel box the size of a hardback book, bolted to the floor and still warm at seven in the morning. Fireproof, the kind long-haul lorries carry. Inside it, a recorder\'s memory chip in a ceramic sleeve. Bukit Aman\'s lab can read what is left on it, but the chip\'s map has been scorched. Rebuild it square by square.',
      params: {
        solvedText: 'The picture resolves: a memory chip in its sleeve, its contacts whole.',
        picture: [
          '..###########..',
          '.#...........#.',
          '#..#########..#',
          '#..#.#.#.#.#..#',
          '#..#########..#',
          '#.............#',
          '#....#####....#',
          '#.............#',
          '.#...........#.',
          '..###########..',
        ],
      },
      evidence: {
        img: 'ev_c12_recorder', hotspot: HOT(),
        title: 'The car records itself',
        short: 'A fireproof recorder under the back seat: a rule nobody wrote down. Every drive of this car is recorded, sound only, from the moment the engine starts. The fire took the middle of the chip. What survives is the oldest drive on it, yours of 1 December, and the last fifteen minutes of the last one, from 1:53 to the fire.',
        text: 'The technician at Bukit Aman\'s audio lab has never seen a box like it in a car, only in lorries, where owners want to know what their drivers say. It starts recording when the engine starts and does not stop until the engine does, and it has been in this car a long time: the oldest drive on the chip is from the first of December. He plays you thirty seconds of it to show you it works. Wipers. An indicator ticking. A voice you know saying "Brickfields Road, then Birch Road." You ask him to stop it. The nine rules on the card in the boot that night never mentioned that the car listens. The fire reached the middle of the chip and took everything from the second drive to the last one; what is left of the last is fifteen minutes, from 1:53 on Sunday morning until the heat killed it. An engine ticking as it cools. A fan. A small sound like a ring on glass. A long nothing. At 2:01 a burst of something electronic. At 2:08, a hiss.',
      },
    },
    {
      id: 'c12_06', phase: 'The gate', title: 'Nurul Ain',
      game: 'spotdiff', variant: 'classic',
      brief: 'Farah finds Nurul Ain at nine in the morning in the surau at Kampung Jugra, asleep against the wall with her camera bag in her arms. She will not give up the bag. She will show you two frames on its screen, side by side, taken thirteen minutes apart from the first row of the palms, and let you look as long as you like. Find what changed.',
      params: { differences: 10 },
      evidence: {
        img: 'ev_c12_frames', hotspot: HOT(),
        title: 'Two frames from the palms',
        short: 'Ain\'s camera, 1:52 and 2:05. At 1:52 the car\'s interior light is on: a driver in a cap and a navy police raincoat with the reflective tape torn off its back, his face turned away; behind him, upright, a passenger in white. At 2:05 the passenger is slumped against the door and the driver is walking into the palms with a jerry can. Pak Itam stands at the gate post in both. In her bag, a typed card: "Ten past two. The gate at Jugra. Bring your camera."',
        text: 'A typed card came under her door on Friday, with no name and no envelope: "Ten past two. The gate at Jugra. Bring your camera." She did what her father\'s daughter does with an invitation from the Office of the Chairman: she came early, on a borrowed motorbike, and hid. 1:52:40. The interior light is on, and the car is a lantern in the dark. At the wheel, a man in a cap and a navy raincoat of the kind Bukit Aman issues, a pale stripe across its back where the reflective tape has been torn away, his face turned from the lens toward the back seat. Behind him, upright, a passenger in a white shirt, collar buttoned. 2:05:12. The light is off. The passenger has slumped against the rear door. The driver\'s door is open and the driver is walking away from the car into the palms on the other side, a red jerry can in his hand. In both frames, at the edge, Pak Itam at the gate post with his face to the ground. "I ran when I saw the can," Ain says. "I thought he was going to burn the palms with me in them. I am not brave. I am early."',
      },
    },

    // ---------------- Bukit Aman ----------------
    {
      id: 'c12_07', phase: 'Bukit Aman', title: 'A quarter of a second',
      game: 'tape', variant: 'spectro',
      brief: 'Bukit Aman\'s audio lab plays the last fifteen minutes from the car\'s recorder through a spectrogram, because what is left is mostly hiss: an engine cooling, a fan, the fire. At 2:01, for a quarter of a second, something else. Every police handset in the country signs each press of its key with a short data burst that carries its own number. Look at the sound.',
      params: {
        answer: 'D9-HT-41',
        noise: 0.7,
        decoys: 3,
        label: 'CAR RECORDER · 21 FEB · 02:01',
        clue: 'A police handset signs every press of its key with its own number. If it was close enough, the car heard it.',
      },
      evidence: {
        img: 'ev_c12_handset', hotspot: HOT(),
        title: 'Handset forty-one',
        short: 'At 2:01:12, inside the car, the burst a police handset sends when its key is pressed: D9-HT-41. D9\'s handset 41 is issued to Sjn. Mohd. Asri. At 2:01, on Farah\'s channel, Asri said he had lost the car at Jenjarom. The car had been standing at the gate for eleven minutes, and his handset was close enough for the car to hear it.',
        text: 'The burst is a smear of tones a quarter of a second long, and on the spectrogram it writes its own name in the noise: D9-HT-41. The stores register at D9 has handset 41 signed out since 2023 to one man, Sjn. Mohd. Asri bin Ghazali, Farah\'s sergeant. Farah\'s own radio log has the transmission it signed, to the second: 2:01:12, "Puan, saya hilang dia di Jenjarom." At 2:01 the car had been standing on the laterite inside the Jugra gate for eleven minutes, twenty kilometres south of Jenjarom, and the man who said he had lost it was close enough for its recorder to hear him press his key. Farah listens to the burst four times. She does not say anything. Then she unclips her own handset and lays it face down on the bench, as if it might hear her.',
      },
    },

    // ---------------- Hospital Kuala Lumpur ----------------
    {
      id: 'c12_08', phase: 'Hospital Kuala Lumpur', title: 'The steel table',
      game: 'hiddenobject', variant: 'silhouette',
      brief: 'Dr. Lim Siew Ping does the post-mortem herself at two on Sunday afternoon, with a Sinar lawyer outside her door asking every half hour for a name. On her steel table, under a sheet, the man from the back seat; on the bench beside him, everything that came off him and out of the car. Find everything she laid out. The list shows only outlines.',
      params: { scene: 'desk', targets: 14, objects: 76 },
      evidence: {
        img: 'ev_c12_table', hotspot: HOT(),
        title: 'No voice',
        short: 'Under the cravat, an old, healed laryngectomy: "He has not spoken with his own throat for ten years or more." Temazepam in his blood; smothered with the back-seat cushion at about 1:56; no soot. Leong Brothers\' label in his collar. In his fist, a silver flip-top lighter with a small brass sun on the lid. In his breast pocket, a typed card: the nine rules, and a tenth. "10. Whoever drives me last."',
        text: 'Dr. Lim says it in the order she found it. A silk cravat, knotted high; under it, at the base of the throat, a neat round opening, long healed: a laryngectomy stoma. "His voice box came out a long time ago. Ten years, more. He breathed through this. He has not said a word to anybody with his own throat since." Temazepam in his blood, enough to make an old man sleep. Rosli looked at his mouth, she says, which was the right instinct and the wrong place: a man like this does not breathe through his mouth at all. He breathes through the throat. Cotton fibres from the small back-seat cushion are packed into the stoma, and the skin round it is marked by something pressed down hard for about two minutes: smothered, at about four minutes to two. Below the stoma, his airway is clean. No soot. His teeth have never been treated by anyone who kept a record. A white shirt with Leong Brothers\' label in the collar. The lighter his left hand would not give up: silver, flip-top, a small brass sun set into the lid, and nothing engraved; not the D.R. lighter, which has been in a Bukit Aman evidence bag since November. The card from his breast pocket, scorched at the edges: the nine rules from your boot on the first of December, typed the same, and under them a tenth. "10. Whoever drives me last." Farah asks one more thing, for the file: the watchman. Dr. Lim has looked at Pak Itam\'s hands. "Somebody held that cushion down for two minutes, with both hands and his weight. That old man\'s knuckles are like walnuts. He cannot close his fist round a cup."',
      },
    },
    {
      id: 'c12_09', phase: 'Hospital Kuala Lumpur', title: 'Two kinds of test',
      game: 'dna', variant: 'mixed',
      brief: 'Dr. Lim sends two kinds of test. The ordinary one comes back by evening and matches nobody in any file in the country. The second takes a night: mitochondrial DNA, which a man gets only from his mother, and which is all anybody can read from a grey hair with no root. Read the bands with her at six on Monday morning.',
      params: { suspects: 7 },
      evidence: {
        img: 'ev_c12_hair', hotspot: HOT(),
        title: 'His mother\'s line',
        short: 'His nuclear DNA matches nothing, anywhere. His mitochondrial DNA matches the grey rootless hair from the black car\'s headrest and from the escort\'s back seat on 1 December. That is him, or a brother, or anyone born of his mother\'s line. "Mitochondria give you a family," Dr. Lim says. "They do not give you a man."',
        text: 'Nothing in the national index, nothing in the immigration files, nothing in the prisons, nothing in the army. A man of about seventy-five with no record of his body anywhere in Malaysia, which Dr. Lim says is harder to arrange than a record. Then the second test, the slow one. Mitochondrial DNA comes down the mother\'s side only, unchanged, from a mother to all her children; a rootless hair has nothing else in it. On the first of December two such hairs were swabbed, one from the headrest behind the driver of the black car and one from the back seat of the escort\'s Land Cruiser, and they matched each other and nobody. They match the man on her table. "Him," Dr. Lim says, writing it down as she says it. "Or his brother. Or his sister\'s son, or his mother\'s sister\'s grandson. Anybody born of his mother\'s line. Mitochondria give you a family. They do not give you a man."',
      },
    },
    {
      id: 'c12_10', phase: 'Hospital Kuala Lumpur', title: 'The left fist',
      game: 'fingerprint', variant: 'classic',
      brief: 'His left fist kept its thumb from the fire. Dr. Lim rolls it at midnight on Sunday with the fingers still curled round the lighter, and Bukit Aman\'s print room lays it against every reference print in the file of this whole affair. Find the one it matches, if it matches any.',
      params: {
        liftLabel: 'Rolled print: left thumb, the man from the back seat, HKL, Sunday night',
        liftAria: 'Rolled print of the left thumb of the dead man from the back seat',
        candidates: [
          { id: 'deed', name: 'Settlor, Jugra Trust deed, Johor Bahru, 1987 (left thumb)' },
          { id: 'muthul', name: 'Muthusamy a/l Perumal, MyKad (left thumb)' },
          { id: 'muthur', name: 'Muthusamy a/l Perumal, MyKad (right thumb)' },
          { id: 'ahkow', name: 'Teoh Ah Kow, MyKad' },
          { id: 'tarmizi', name: 'Tarmizi bin Hassan (police service record)' },
          { id: 'desmond', name: 'Desmond Yap (Sinar staff pass, 1997)' },
          { id: 'daniel', name: 'Daniel Raj (agency licence, 2016)' },
          { id: 'you', name: 'You (agency licence, 2016)' },
        ],
        answer: 'deed',
      },
      evidence: {
        img: 'ev_c12_thumb', hotspot: HOT(),
        title: 'Nine points',
        short: 'The dead man\'s left thumb against the left thumb on the 1987 Jugra Trust deed: nine matching points of sixteen, and nothing that disagrees. Dr. Lim: "Consistent. Not conclusive. In this country, not a name." A court wants twelve.',
        text: 'The deed is a certified copy from the High Court in Singapore, and its thumbprint is forty years old, rolled in a car at dusk on the Johor shore by a man who would not cross the water. The thumb on Dr. Lim\'s card was rolled on Sunday night from a hand that would not open. The print room\'s examiner works for three hours under a lamp with a pointer and a pencil, and stops at nine: nine ridge endings and forks in the same places, in the same order, and not one that disagrees. The rest of the old print is smudged where the settlor pressed too hard, and the rest of the new one is blistered where the fire came close. Nine is a lot. Twelve is a name. "Consistent," Dr. Lim says. "Not conclusive. In this country, not a name." Sinar\'s lawyer, outside the door, is told the number by somebody before she has finished saying it.',
      },
    },
    {
      id: 'c12_dy', phase: 'Sungai Buloh', title: 'Clean ears',
      game: 'morse', variant: 'audio',
      when: (flags) => !flags.DESMOND_FREE,
      brief: 'Desmond Yap has been in Sungai Buloh since November waiting for a trial in May, and for twenty-nine years before that he had one man\'s voice in his ear. Farah takes him the recorder\'s last fifteen minutes on Monday morning, and a pair of headphones. Before he will listen to anything, he makes you copy a reel of old practice code from his RTM days, "so your ears are clean". Copy it with him.',
      params: { difficulty: 'medium' },
      evidence: {
        img: 'ev_c12_ring', hotspot: HOT(),
        title: 'No breath',
        short: 'At 1:55, a ring tapped on the inside of the rear window glass, slow and then fast: TOLONG. Help. Desmond listens three times. "That is not the man in my ear. He breathes in before every sentence. This one had no breath to speak with."',
        text: 'With his ears clean, Desmond listens to the last fifteen minutes with his eyes shut and his hand over his right ear, as if the headset were still on it. At 1:55, under the ticking of the engine, a small hard sound on glass, the sound a ring makes, slow and then fast and then slow: T-O-L-O-N-G. Help. Then a minute of nothing, and then a sound he will not describe. He plays the minute before it three times. Then he asks to hear thirty seconds of the first of December, the oldest drive on the chip, and when the voice from the back seat says "Brickfields Road, then Birch Road" he nods as if somebody had said his own name. "That is the man in my ear. He breathes in before every sentence. I would know it in a stadium." He takes the headphones off. "The one tapping on the window is not him. That one had no breath to speak with."',
      },
    },

    // ---------------- Bukit Aman ----------------
    {
      id: 'c12_11', phase: 'Bukit Aman', title: 'Interview room 2',
      game: 'interrogation', variant: 'classic',
      brief: 'Tan Sri Azhar Kamaruddin comes to Bukit Aman at four on Sunday afternoon, with a lawyer, because Hafiz\'s forecourt frame has been on the television since one. He sits in interview room 2 with his hands folded and does not lean back in the chair. He has done this before, with you, and you have both learned something since. One thing he tells you is not true. Find it, and put the exhibit that breaks it in front of him.',
      params: {
        setting: 'Interview room 2, D9, Bukit Aman. Sunday, 4:00 PM.',
        suspect: {
          id: 'azhar', voice: 'voice_2', name: 'Tan Sri Azhar Kamaruddin', role: 'Twenty-nine years the face of Sinar Holdings, 68',
          persona: 'Composed Kuala Lumpur Malay corporate grandee of sixty-eight, the public face of Sinar Holdings since 1997: formal, measured Malaysian English with the cadence of a man reading minutes aloud; calls Farah "Inspector" and the detective "detective"; never raises his voice and never leans back in his chair. Proud, and ashamed of being seen to want things, and quietly wounded that the detective has now seen him want the same thing twice. Answers questions about the Chairman with the board\'s own phrases until he is cornered, then speaks plainly and briefly, as if dictating his resignation.',
        },
        facts: [
          { id: 'f1', topic: 'his position', claim: 'I have been the face of Sinar Holdings for twenty-nine years. Whatever the board calls me this month, that has not changed.' },
          { id: 'f2', topic: 'the screen', claim: 'Every year I thanked an empty chair. In November there was a man in it, and I was the one who found him.' },
          { id: 'f3', topic: 'Muthu', claim: 'I knew from 2019 that the shadow behind the screen was a driver. I told nobody. I have said so before.' },
          { id: 'f4', topic: 'his ambition', claim: 'I drafted a succession memo. I am not ashamed of it. Somebody has to chair a board.' },
          { id: 'f5', topic: 'the trust', claim: 'Sinar Holdings Berhad answers to a company in Singapore, which answers to a trust. The board has never been shown the deed.' },
          { id: 'f6', topic: 'the dead man', claim: 'I have no idea who the man in that car was, detective. Neither has anybody else. That seems to be the point of him.' },
          { id: 'f7', topic: 'the press', claim: 'There were two photographers at my gate this morning. Somebody always tells them where to stand.' },
        ],
        lies: [
          { id: 'l1', topic: 'Saturday night', claim: 'I was at home in Damansara Heights all night, asleep. I did not leave the house.', truth: 'At 2:12 he asked the way to the old Sinar gate at pump four of the Jenjarom petrol station.', exposedBy: 'e1' },
          { id: 'l2', topic: 'the gate', claim: 'I have never been to that gate in my life. I have never been to Jugra at all.', truth: 'At 2:20 his car stopped at the gate with its lights on the watchman for a minute or two, then turned and went back.', exposedBy: 'e2' },
          { id: 'l3', topic: 'the letter of wishes', claim: 'I know nothing about any letter of wishes. Trusts are for lawyers.', truth: 'He came because a typed card told him to "drive me last", and he knew exactly what that sentence in the letter of wishes meant.', exposedBy: 'e3' },
        ],
        evidence: [
          { id: 'e1', title: 'Asking the way to Jugra', text: 'The Jenjarom petrol station attendant, three times out of three: Tan Sri Azhar at 2:12 AM in a dark Mercedes, asking "Which way to the old Sinar gate?"' },
          { id: 'e2', title: 'The gate at one-fifty', text: 'Pak Itam: at twenty past two a big car came down the road fast, stopped at the gate with its lights on him for a minute or two, and went back the way it came.' },
          { id: 'e3', title: 'No voice', text: 'In the dead man\'s breast pocket, a typed card: the nine rules, and a tenth. "10. Whoever drives me last."' },
          { id: 'e4', title: 'Dead before the fire', text: 'Rosli: no soot in the dead man\'s mouth. He was dead before the fire was lit in the front footwell.' },
          { id: 'e5', title: 'Running shoes in the palms', text: 'A woman\'s trainer prints, twenty metres from the car, running away toward the lighthouse road.' },
          { id: 'e6', title: 'Nine points', text: 'The dead man\'s left thumb against the 1987 trust deed: nine points of sixteen. Consistent, not conclusive.' },
        ],
        secret: 'A typed card with no signature came under his door on Friday: "Ten past two. The gate. Drive me last." He knew the sentence in the letter of wishes, that the Trust is to be directed by whoever drives the Chairman last, and he went to Jugra alone in his own car to be the last driver and the next Chairman. He lost his way, asked it at the Jenjarom petrol station at 2:12, reached the gate at 2:20, saw the car burning under the sun, understood that somebody had been driven last already, and drove away.',
        suggested: [
          'Where were you on Saturday night?',
          'Have you ever been to the Jugra gate?',
          'Why would you go to Jugra at two in the morning?',
          'What do you know about the letter of wishes?',
          'Who sent for you?',
          'Who was the man in the back seat?',
          'What did you see at the gate?',
        ],
        maxQuestions: 14,
        clue: 'Farah, from the door: "He came in a hurry and he left in a hurry. Ask him why he was in a hurry."',
      },
      evidence: {
        img: 'ev_c12_summons', hotspot: HOT(),
        title: 'The summons',
        short: 'Caught in one lie, Tan Sri Azhar takes a card from his breast pocket and lays it on the table: typed, unsigned, under his door on Friday. "Ten past two. The gate. Drive me last." He went to be the last driver, and the next Chairman. He was late, he saw the fire, and he drove away. "I wanted to sit in the chair. Somebody knew that before I did."',
        text: 'He does not ask his lawyer anything. He takes a white card out of his breast pocket, the size of a place card at a dinner, and lays it on the table squarely, the way he lays papers in front of a board. Typed, unsigned, no envelope, under his door on Friday night: "Ten past two. The gate. Drive me last." "Everyone on the board knows the sentence by now," he says. "The Trust is to be directed by whoever drives him last. It is not a legal sentence. I thought it might become one." He went alone, in his own car, because a man who means to be the last driver does not bring one. He did not know the old road. He asked a boy at a petrol station, who started to tell him, and he did not wait. He reached the gate and the car was already burning under the sun, and an old man at the gate post had a bucket in his hand and his face to the ground. "I sat there with my lights on that old man for a minute," he says. "Then I understood that whoever was in the back seat had been driven last already, and not by me." He turned round in the road. "I wanted to sit in the chair," he says, as he said it in November. "Somebody knew that before I did."',
      },
    },

    // ---------------- Menara Sinar ----------------
    {
      id: 'c12_12', phase: 'Menara Sinar', title: 'Behind the roller shutter',
      game: 'getaway', variant: 'classic',
      brief: 'Basement 2 of Menara Sinar on Sunday night. Bay V1 is empty, its painted sun scrubbed. Raja, the attendant who has been told for twenty years to look at his feet, walks you past it to a roller shutter in the wall that you took for a fire door, and lifts it with a key from his own ring. Behind it, a second bay with a second sun painted on the floor, and a second black car with no plates, boxed in by the directors\' cars. Get it out.',
      params: {
        difficulty: 'hard', target: 'NO PLATES',
        clue: 'Raja: "Twenty years I look at my feet. My feet are very well known to me."',
      },
      evidence: {
        img: 'ev_c12_v2', hotspot: HOT(),
        title: 'Two cars, two keys',
        short: 'Bay V2, behind a roller shutter on Basement 2: a second sun on the floor and a second black car with no plates, the twin of the one that burned, its engine still warm on Sunday night. Raja: "One went out at ten to one with a policeman\'s walk at the wheel. The other went at twenty past one, and I did not see who was in it." Two cars. Two keys.',
        text: 'With the directors\' cars rolled back, the second car stands alone on its sun: the same long black saloon, the same black glass, no plates front or back, a fine red dust of laterite along its sills, and its bonnet still warm under your palm at nine on Sunday night. In its ignition, a key on a ring with a small brass sun, the twin of the one in your pocket. The barrier log at the foot of the ramp has a fob for each bay. V1: out at 00:50:07, and never back. V2: out at 01:20:41, in at 03:58:12. Raja tells it looking at his feet, out of habit. "One went out at ten to one. The driver walked to it with his hands behind his back and a cap on, like a policeman at a funeral. A policeman\'s walk. Somebody was in the back already. The other one went at twenty past one, and I did not see who was in it. I did not see who brought it back." He looks up, once. "Nobody told me there were two. Twenty years, I thought there was one car."',
      },
    },

    // ---------------- Hospital Kuala Lumpur ----------------
    {
      id: 'c12_13', phase: 'Hospital Kuala Lumpur', title: 'The collar',
      game: 'witness', variant: 'statement',
      brief: 'Leong Kam Wah is eighty-one and has never been inside a mortuary. Farah sends a car to Batu Road on Monday morning, and he comes in a pressed white shirt of his own with his tape measure round his neck, "in case". Dr. Lim does not show him the man. She shows him the collar. He looks at it for a long time, and then he tells you once.',
      params: {
        readSeconds: 95,
        pass: 7,
        header: 'Statement of Leong Kam Wah, 81, tailor, Leong Brothers, Jalan Tuanku Abdul Rahman. Recorded Monday, 10:15 AM, Hospital Kuala Lumpur.',
        introLine: 'He takes off his half-moon glasses, polishes them on his singlet under the shirt, and puts them back on. "Sei sap nin." Forty years.',
        retryLine: 'He tells it again, slowly, the way he reads a measurement out to an apprentice.',
        statement: [
          'This is my label. Leong Brothers, Batu Road. My father sewed it, my brother sewed it, now I sew it, and it is always inside the collar on the left, so it does not scratch the neck.',
          'Collar fifteen and a half. Sleeve thirty-three. The right cuff three-quarters of an inch wider than the left, for a watch. These are the measurements of one customer. I have made his shirts since December 1986, three a year, measured in the dark, in the back of his car, with the light off.',
          'In November the order came for one more, "for a long journey". I sewed it at night. I finished it at two o\'clock in the morning on the first of December, and at twenty-four minutes past two a hand took it through the window of the car outside my shop.',
          'It is my shirt. I made it in December for the man I have measured in the dark for forty years. It fits this man the way it would fit him. The shoulders. The length of the arm. I measured the arm on this table with my own tape while the doctor watched.',
          'I could not swear to a face. I have never seen his face. I could swear to a collar. Two men with the same neck and the same arms would wear this shirt the same way. In sixty years I have made shirts for a great many brothers.',
        ],
        questions: [
          { q: 'Where is Leong\'s label sewn?', options: ['On the cuff', 'Inside the collar, on the left', 'On the pocket', 'Inside the hem'], a: 1 },
          { q: 'What is the collar size?', options: ['Fourteen and a half', 'Fifteen', 'Fifteen and a half', 'Sixteen'], a: 2 },
          { q: 'Which cuff is cut wider?', options: ['The left', 'The right', 'Both', 'Neither'], a: 1 },
          { q: 'Why is it wider?', options: ['For a cufflink', 'For a watch', 'For a bandage', 'For a bracelet'], a: 1 },
          { q: 'Since when has he made this customer\'s shirts?', options: ['1979', 'December 1986', '1997', '2016'], a: 1 },
          { q: 'How was the customer measured?', options: ['At the shop', 'In the dark, in the back of his car', 'From an old shirt', 'By his secretary'], a: 1 },
          { q: 'What was the last order for?', options: ['A wedding', 'A funeral', 'A long journey', 'A dinner'], a: 2 },
          { q: 'When did a hand take the shirt?', options: ['Midnight, 30 November', '2:24 AM, 1 December', '10 AM, 1 December', 'Christmas Eve'], a: 1 },
          { q: 'What can he swear to?', options: ['A face', 'A voice', 'A collar', 'A name'], a: 2 },
        ],
      },
      evidence: {
        img: 'ev_c12_collar', hotspot: HOT(),
        title: 'It fits him',
        short: 'Leong Kam Wah, shown only the collar: "It is my shirt. I made it in December for the man I have measured in the dark for forty years. It fits this man the way it would fit him. I could not swear to a face. I could swear to a collar."',
        text: 'He holds the collar between finger and thumb and turns it to the light, and finds his own label inside it on the left, where his father put the first one. Collar fifteen and a half; sleeve thirty-three; the right cuff three-quarters of an inch wider than the left. The shirt he finished at two in the morning on the first of December, "for a long journey", and handed through a car window at 2:24. Dr. Lim lets him measure the arm on the table under the sheet, and he does it without looking at anything but the tape, and writes the figure in his order book in pencil, under December, as if it were a fitting. Then he closes the book. "It is my shirt. I made it in December for the man I have measured in the dark for forty years. It fits this man the way it would fit him." He puts his glasses in his pocket. "I could not swear to a face. I have never seen his face. I could swear to a collar." At the door he turns round. "Two men with the same neck would wear it the same way," he says. "A tailor knows that. A tailor makes shirts for brothers."',
      },
    },

    // ---------------- Brickfields (only if Jason Ooi walked in Case 1) ----------------
    {
      id: 'c12_jx', phase: 'Brickfields', title: 'WXY 1408',
      game: 'chase', variant: 'one-way',
      when: (flags) => !!flags.JASON_FREE,
      brief: 'On Monday at noon a grey sedan stops across the road from Restoran Bala with its engine running. WXY 1408. Jason Ooi sees you see him and goes, into the one-way streets of Brickfields between the sari shops and the temple, obeying every arrow, one last time. You do not have to.',
      params: { rounds: 2 },
      evidence: {
        img: 'ev_c12_lighthouse', hotspot: HOT(),
        title: 'From the lighthouse road',
        short: 'Jason Ooi drove the second car. At 1:20 from Bay V2, one passenger in the back, by the expressways to the lighthouse road on Bukit Jugra, and he wound the back window down. At ten past two they watched the gate burn from the hill, and came back. "He said thank you. He always says thank you."',
        text: 'You box the sedan in behind a lorry of marigolds on Jalan Scott, and Jason does not run this time. He sits with both hands on the wheel and talks to the windscreen. At twenty past one on Sunday he took the second car out of V2 with one passenger already in the back, as he was told, the fast way, by the expressways to Banting and round by the coast, to the lighthouse road on Bukit Jugra, where the trees open and you can see the yard below. He stopped where he was told to stop and wound the back window down, as he was told. At ten past two a light came up at the gate, and then fire, and the man in the back watched it, and Jason watched the fire and not the mirror. "I did not look," he says. "Nobody looks. I drive." At twenty to three he was told to go home, and he did, and he put the car back in V2 at two minutes to four. "Before I got out he said thank you." Jason looks at you for the first time. "He always says thank you."',
      },
    },

    // ---------------- Bukit Aman ----------------
    {
      id: 'c12_14', phase: 'Bukit Aman', title: 'The duty sheet',
      game: 'ledger', variant: 'classic',
      brief: 'D9 prints its duty sheets and overtime claims every Monday for the auditors, and Farah keeps her own copy, because she has been audited before. Beside them, by Hamidah\'s order, the statements of Sjn. Asri\'s household account. On the system, somebody has changed three cells since Farah\'s last printout. Find them, and put back what they said.',
      params: {
        rows: 6, cols: 5, altered: 3, restore: true, currency: 'RM', magnitude: 'thousands',
        rowLabels: ['Salary, PDRM', 'Overtime claims, D9', 'House loan, Kota Bharu', 'Motorbike and car', 'Transfers in, "consultancy"', 'Cash withdrawn'],
        colLabels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        clue: 'Farah\'s printout is from last Monday. The duty system was opened under Asri\'s own login on Sunday at 3:40 PM, while he was at the hospital with you.',
      },
      evidence: {
        img: 'ev_c12_overtime', hotspot: HOT(),
        title: 'Overtime',
        short: 'Restored: Asri\'s duty for Saturday night, "surveillance, B2, all night", was typed in on Sunday at 3:40 PM, after the fire. His household account: RM 3,000 a month since 2019 from a Sinar Cold Chain "consultancy", and on Friday 19 February, the day before the fire, RM 250,000.',
        text: 'Three cells, put back to what Farah printed a week ago. Overtime, February: twelve hours for Saturday night, "surveillance, Menara Sinar B2, all night, then pursuit", typed into the system on Sunday at 3:40 PM under his own login, while he stood beside you at HKL telling Sinar\'s lawyer to be patient. The B2 barrier log and Raja\'s ramp have no sergeant on Basement 2 after ten to one. Transfers in: RM 3,000 on the first of every month since March 2019, into his wife\'s account at a bank in Kota Bharu, from Sinar Cold Chain Sdn Bhd, "consultancy retainer"; somebody had changed February\'s figure to nothing. And Friday 19 February, the day before the fire: RM 250,000, from the same account, "consultancy, special". Farah reads the restored sheet without sitting down. "Four years," she says. "I signed every one of his overtime claims. I thought the house in Kota Bharu was his father\'s."',
      },
    },
    {
      id: 'c12_ar', phase: 'Bukit Aman', title: 'The sign-out sheet',
      game: 'kakuro', variant: 'classic',
      when: (flags) => !!flags.ARCHIVE_SEIZED,
      brief: 'The archive of Level 14 has sat in a Bukit Aman store room since November, ninety officers reading it a carton at a time, and every carton has a sign-out sheet. Carton A is the police: one folder per officer, with a monthly figure. The clerk who keeps the sheets checks every row and column by its sum, in pencil, in the margin. One row has stopped adding up. Fill the grid and find it.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c12_cartona', hotspot: HOT(),
        title: 'Carton A',
        short: 'Carton A\'s sign-out sheet: on 3 December 2026, two days after the drive, one folder was taken out by Sjn. M. Asri and never returned. The folder is gone. Its index card is still in the drawer: "Asri, M. RM 3,000 a month since 2019."',
        text: 'Asri knows the archive store better than its clerks; he has signed out cartons for Farah all season and driven them wherever she needed them. On 3 December 2026, two days after the first of December, he signed out one folder from carton A "for Insp. F. Iskandar", and the column where a folder comes back is empty. Farah never asked for it. The folder is gone. Its card in the index drawer, typed on the same machine as every card in the archive, is still there: "Asri, M. Sjn., D9. RM 3,000 a month since 2019. Car." The last word is the Office\'s note of what he is for. The clerk who keeps the sheets tells Farah he wondered about it in December. "He is your sergeant, Puan," he says. "I thought you knew."',
      },
    },
    {
      id: 'c12_15', phase: 'Bukit Aman', title: 'The locker room',
      game: 'shredder', variant: 'classic',
      brief: 'The locker room at D9 has one shredder by the door, and the cleaner empties it on Wednesdays. Asri\'s locker is the third from it. On Monday night, with Hamidah\'s order in her hand and nobody else in the room, Farah opens the shredder\'s bin, and then the locker. Some strips went in upside down.',
      params: {
        title: 'SINAR HOLDINGS BERHAD',
        text: 'OFFICE OF THE CHAIRMAN\n\nTo: M.A.\nFriday, 23:00\n\nBay V1 at 0:45.\nThe gate at 1:50.\n\nThe car first.\nThen the certificate.\n\nNothing on the phones.',
        strips: 10,
        flips: true,
        stamp: 'PRIVATE',
        clue: 'The shredder\'s little counter says one sheet, on Saturday at 11:42 PM.',
      },
      evidence: {
        img: 'ev_c12_order', hotspot: HOT(),
        title: 'The car first',
        short: 'Reassembled: "OFFICE OF THE CHAIRMAN. To: M.A. Friday, 23:00. Bay V1 at 0:45. The gate at 1:50. The car first. Then the certificate. Nothing on the phones." In the locker, folded on the top shelf, a navy police raincoat with a strip of reflective tape torn off its back, smelling of petrol. He was told to burn it. He kept it.',
        text: 'The Office\'s pairs, as always. Bay V1 at a quarter to one; the gate at ten to two. The car first: the car, and whoever is in the back of it. Then the certificate: a man who is in the room when the form is filled in, and says every day, quietly, to everybody, that everybody knows who it is. Shredded at 11:42 on Saturday night, eight minutes before Farah rang him from Bala\'s counter and told him to watch V1, which is exactly what the order had told him to do. In the locker, behind his spare uniform, folded small on the top shelf: a navy police raincoat, Bukit Aman stores issue, with a strip of the silver reflective tape torn off across its back and the stitching holes left behind. It smells of petrol. Farah holds it up by the shoulders. "Stores counts raincoats," she says. "He would have had to sign for a new one."',
      },
    },

    // ---------------- The palms ----------------
    {
      id: 'c12_16', phase: 'The palms', title: 'The driver\'s side',
      game: 'footprint', variant: 'classic',
      brief: 'Back at Jugra on Monday night, with the yard taped off and the gate chained by the police, Rosli walks the palms on the other side of the car from Ain\'s prints: the driver\'s side, where nobody has thought to look because nobody got out of the car. Name the tread, then find the boot.',
      params: { shoes: 10 },
      evidence: {
        img: 'ev_c12_boots', hotspot: HOT(),
        title: 'Three hundred metres',
        short: 'Police-issue patrol boots, size 8, from the car\'s driver\'s door into the palms and back to it, then three hundred metres through the estate to a cleared patch where a motorbike stood on its stand. Petrol in the first prints. The boots are on Asri\'s feet at Bukit Aman, the left heel worn on the outside exactly as the mud has it.',
        text: 'Rosli\'s lamp finds them at the driver\'s door, under the ash: the deep square heel and bar tread of a police patrol boot, the kind every constable in the country signs for. They go from the driver\'s door to the front wing and back, twice, the way a man walks who is pouring something; into the first row of palms on the driver\'s side, and back to the edge, where they stand still; then away, at a walk, not a run, three hundred metres through the estate in a straight line to a clearing where a motorbike stood long enough on its side stand to sink it into the earth. The first prints by the car smell of petrol when Rosli puts his nose to the cast. Size 8, the outside of the left heel worn down by a man who walks with his weight on that edge. At Bukit Aman, the boots are on Asri\'s feet. He has stood in them all day beside Farah\'s desk.',
      },
    },
    {
      id: 'c12_17', phase: 'The palms', title: 'The clearing',
      game: 'searchlight', variant: 'classic',
      brief: 'The clearing where the motorbike stood is a patch of old palms gone wild, ringed with stacked fronds and fallen trunks. Rosli brings his lamps. Each lamp lights its row and its column until a trunk stops it; the numbered stumps say how many lamps stand right beside them. Light the clearing without lighting a lamp with another.',
      params: {
        size: 8, walls: 'medium',
        clue: 'Rosli: "Whoever left from here did it in the dark, in a hurry. He will have dropped something. They always drop something."',
      },
      evidence: {
        img: 'ev_c12_tape', hotspot: HOT(),
        title: 'A strip of tape',
        short: 'In the clearing: an empty twenty-litre jerry can, a spent marine flare case, and, caught on a frond, a strip of silver reflective tape torn from a police raincoat. It matches the tear across the back of the raincoat in Asri\'s locker, stitch hole for stitch hole.',
        text: 'Lit from eight sides at once the clearing has nowhere left to hide anything. A red twenty-litre jerry can, empty, its cap gone, its handle wiped. The cardboard case of a hand-held marine flare, the kind fishing boats at Kuala Langat carry, fired and dropped. The side stand\'s hole in the earth, and the tyre\'s crescent where the bike was swung round to face the estate track that runs out to the Jenjarom road. And on a dry frond at the height of a man\'s back, snagged and fluttering, a strip of silver reflective tape a hand\'s width long, its edge ragged where it was torn. At Bukit Aman Farah lays it on the raincoat from Asri\'s locker. It fits the tear across the back stitch hole for stitch hole, like the last piece of a jigsaw. Rosli looks at it for a long time. "He tore it off so the fire would not light him up," he says. "And then he walked under a frond."',
      },
    },

    // ---------------- Bukit Aman ----------------
    {
      id: 'c12_18', phase: 'Bukit Aman', title: 'The incident room',
      game: 'timeline', variant: 'cctv',
      brief: 'Farah pins the night up on the board in D9\'s incident room at eleven on Monday night, on the same board where Asri pinned your photographs in December. Eight things that happened between a quarter to one and a sergeant\'s motorbike. Put them in order.',
      params: {
        frames: [
          { id: 'a', clock: '00:45', title: 'Farah\'s channel, D9 control', text: 'Sjn. Asri, on the radio: "Car still in V1."' },
          { id: 'b', clock: '00:50', title: 'B2 barrier, Menara Sinar', text: 'Fob V1, out. The ramp camera has faced the other way since 1997.' },
          { id: 'c', clock: '01:3▮', title: 'Jenjarom junction camera', text: 'A long black car with no plates, southbound on the old Klang to Banting road. No motorbike behind it for the next six minutes.' },
          { id: 'd', clock: '01:50', title: 'Pak Itam\'s hut', text: 'The hut telephone: no call. The gate chain is off its post.' },
          { id: 'e', clock: '01:52', title: 'Ain\'s camera, the palms', text: 'The interior light on: a driver in a cap and a navy raincoat, face turned away; a passenger in white, upright.' },
          { id: 'f', clock: '02:01', title: 'Car recorder', text: 'A police handset keyed inside the car: D9-HT-41. On Farah\'s channel: "Puan, saya hilang dia di Jenjarom."' },
          { id: 'g', clock: '02:08', title: 'Car recorder', text: 'The hiss of a flare, and then fire.' },
          { id: 'h', clock: '02:3▮', title: 'Bomba log, Balai Bomba Banting', text: '"A police sergeant arrives by motorbike from the Jenjarom road."' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The night plays in order. The car left V1 with one man at the wheel and no motorbike behind it, and the sergeant who lost it at Jenjarom was close enough to it at 2:01 for it to hear him.',
      },
      evidence: {
        img: 'ev_c12_route', hotspot: HOT(),
        title: 'Bay V1 to the gate',
        short: 'In order: "Car still in V1" at 0:45; V1 out at 0:50; the black car through Jenjarom at 1:34 with no motorbike behind it; at the gate by 1:50; the passenger upright at 1:52; handset 41 keyed inside the car at 2:01; fire at 2:08; and at 2:34 a police sergeant arriving by motorbike "from the Jenjarom road".',
        text: 'Pinned in a line across the board, with red thread, the night has only one driver in it. A sergeant reports the car still in its bay at a quarter to one; five minutes later its fob goes out of the barrier, and nobody has seen the sergeant on Basement 2 since. The car passes Jenjarom at 1:34 alone: the junction camera has six clear minutes behind it and nothing on two wheels. At ten to two the watchman takes the chain off for it, as he was told on the telephone at one. At 1:52 a driver in a police raincoat turns round in his seat toward the passenger. At 2:01 a police handset is keyed inside the car, and the sergeant\'s voice tells his inspector he has lost the car twenty kilometres away. At 2:08 a flare. At 2:34 the sergeant arrives at the gate on a motorbike, from the north, on a road the car used an hour before. Farah stands in front of the board with her arms folded. "One car," she says. "One driver. And he told me where he was every half hour."',
      },
    },
    {
      id: 'c12_19', phase: 'Bukit Aman', title: 'Five statements',
      game: 'whoslying', variant: 'classic',
      brief: 'On Monday night Hamidah has five statements read back to her in D9\'s incident room, from the five people who were at the gate or near it when the man in the back seat died, or who say they were not. Two of them are lying.',
      params: {
        solvedLine: 'Hamidah reads the five statements twice. "Two liars. One of them made the teh in this room this afternoon."',
        people: [
          { id: 'asri', name: 'Sjn. Asri', says: [
            { t: '"I lost the car at Jenjarom. I never reached the gate before Bomba."', fact: false, note: 'His handset was keyed inside the car at the gate at 2:01, and his boots go from the driver\'s door into the palms.' },
            { t: '"Pak Itam is lying."', about: 'itam', is: false },
          ] },
          { id: 'azhar', name: 'Tan Sri Azhar', says: [
            { t: '"I have never been to Jugra in my life."', fact: false, note: 'The Jenjarom attendant picked him three times; Pak Itam saw a big car stop at the gate at 2:20.' },
            { t: '"The Bomba driver is lying."', about: 'zaki', is: false },
          ] },
          { id: 'ain', name: 'Nurul Ain', says: [
            { t: '"I photographed the car at 1:52 and at 2:05."', fact: true, note: 'Her camera\'s clock, checked against the Bomba log and the hut telephone, is right to the second.' },
            { t: '"Sergeant Asri is lying."', about: 'asri', is: false },
          ] },
          { id: 'itam', name: 'Pak Itam', says: [
            { t: '"I never left the gate post."', fact: true, note: 'He is at the gate post in both of Ain\'s frames, and his hut is three steps from it.' },
            { t: '"The man in the big car is lying."', about: 'azhar', is: false },
          ] },
          { id: 'zaki', name: 'Zaki, Bomba driver', says: [
            { t: '"The watchman\'s call reached Balai Bomba Banting at 2:16. We were there at 2:27."', fact: true, note: 'The station\'s call book and the pump\'s log say the same.' },
            { t: '"At least two of the others are lying."', atLeast: 2 },
          ] },
        ],
        liars: ['asri', 'azhar'],
      },
      evidence: {
        img: 'ev_c12_five', hotspot: HOT(),
        title: 'Five at the gate',
        short: 'Two liars: Sjn. Asri, who says he never reached the gate before Bomba, and Tan Sri Azhar, who says he has never been to Jugra. Ain\'s frames at 1:52 and 2:05 are true to the second: her camera\'s clock agrees with the Bomba log. Pak Itam never left the gate post.',
        text: 'Read back to back, the five statements sort themselves. Zaki, who drove the Banting pump, has the call book: Pak Itam\'s call at 2:16, the pump at the gate at 2:27, and a police sergeant on a motorbike at 2:34. Ain\'s camera clock is right to the second against the call book and the hut telephone, so her two frames are where she says they are, and Pak Itam is at the gate post in both of them, as he says. Tan Sri Azhar has never been to Jugra, he says, in a statement his own lawyer has already withdrawn. And Sjn. Asri, who typed his own statement on Sunday afternoon at the desk beside Farah\'s, says he lost the car at Jenjarom and never reached the gate before Bomba. Hamidah puts his statement face down on the table, on top of the others.',
      },
    },
    {
      id: 'c12_20', phase: 'Bukit Aman', title: 'Five people, one night',
      game: 'logicgrid', variant: 'classic',
      brief: 'Before anybody sits in interview room 1, Farah wants the night on one page: five people, where each of them stood when the man in the back seat died or when they came closest to him, and what was in their hands. One of the five is you.',
      params: {
        categories: [
          { name: 'Person', items: ['Asri', 'Azhar', 'Ain', 'Pak Itam', 'You'] },
          { name: 'Location', items: ['The gate post', 'The palms, 20 m away', 'Beside the black car', 'The Banting road', 'The Jenjarom petrol station'] },
          { name: 'Holding', items: ['A camera', 'The plate BCK 210', 'A summons card', 'A police handset', 'The gate chain'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[2, 3], [4, 2], [1, 0], [0, 4], [3, 1]],
        clues: [
          'Whoever held the gate chain never moved from the gate post.',
          'The camera was in the palms, twenty metres from the car.',
          'Whoever stood beside the black car had something on his belt that talks.',
          'Tan Sri Azhar was asking a stranger the way.',
          'The plate was on the back seat of a car still on the road.',
          'You had not reached the gate, or the palms beside it.',
          'Ain was nowhere near the gate post, and she carries no radio.',
          'Pak Itam was not the one with the handset.',
        ],
      },
      evidence: {
        img: 'ev_c12_grid', hotspot: HOT(),
        title: 'Five people, one night',
        short: 'Sjn. Asri beside the black car with his handset. Tan Sri Azhar at the Jenjarom petrol station with his summons card, asking the way. Ain in the palms with her camera. Pak Itam at the gate post with the chain. You on the Banting road, late, with the plate on the back seat.',
        text: 'One page. Sjn. Mohd. Asri bin Ghazali beside the black car from ten to two until eight minutes past, his handset on his belt, a cushion and a jerry can within reach. Tan Sri Azhar Kamaruddin at pump four in Jenjarom at 2:12 with a typed card in his breast pocket, asking a boy the way to a gate he says he has never seen. Nurul Ain in the first row of palms, twenty metres off, with her camera up. Pak Itam at the gate post with the chain he took off at ten to two, looking at the ground. And you, on the Banting road with Farah, with a rusted plate on the back seat because a voice asked you to bring it, late, as Daniel said you would be.',
      },
    },
    {
      id: 'c12_21', phase: 'Bukit Aman', title: 'For the prosecutor',
      game: 'theory', variant: 'classic',
      brief: 'Hamidah Yusof comes to D9 at one on Tuesday morning with wet hair, a flask of teh, a pencil she will not use, and the burial permit from HKL in a plastic sleeve. "Last time this season, detective. You know the rules. The story, not the evidence. And this time tell me who he could not have been."',
      params: {
        prompt: 'Write the night at the Jugra gate for the prosecutor: who killed the man in the back seat and how, who set the fire and why, who ordered it, and who the dead man could not have been.',
        context: 'On the night of Saturday 20 to Sunday 21 February 2027 (Chap Goh Meh) a black car with no plates left Bay V1 under Menara Sinar at 0:50 with one passenger in the back, and reached the old Sinar gate at Jugra at 1:50. The passenger, a sedated man of about seventy-five in a white shirt, was smothered with the back-seat cushion at about 1:56; the car was set alight with petrol and a flare at 2:08, so he was dead before the fire. The driver was Sergeant Mohd. Asri, Inspector Farah\'s own sergeant, who was meant to be watching the bay: his police handset was keyed inside the car at 2:01 while he told Farah by radio that he had lost the car at Jenjarom, his boots go from the driver\'s door to his motorbike in the palms, and the torn reflective tape of his raincoat was in the clearing. A printed order from the Office of the Chairman in his locker said "The car first. Then the certificate."; Sinar paid RM 250,000 into his wife\'s account the day before, and RM 3,000 a month since 2019. The dead man had an old laryngectomy: he had no voice and could not have spoken for ten years or more.',
        points: [
          { id: 'who', label: 'Who killed him, and how', criterion: 'Sergeant Asri killed the passenger by smothering or suffocating him (with the cushion) in the back seat, before the fire. It must not say someone else killed him.', keywords: [['asri', 'sergeant', 'sjn'], ['smother', 'suffocat', 'cushion', 'pillow', 'kill', 'murder']], hint: 'Whose handset did the car hear at 2:01, and what was on the floor at the dead man\'s feet?' },
          { id: 'fire', label: 'The fire', criterion: 'Asri set the car on fire (petrol and a flare) after the man was dead, to burn the body or the evidence, or to make it look like an attack on the Chairman.', keywords: [['fire', 'burn', 'petrol', 'flare', 'set alight', 'arson', 'lit']] , hint: 'What was in the clearing where the motorbike stood?' },
          { id: 'order', label: 'Who ordered it', criterion: 'The Office of the Chairman (Sinar) ordered and paid for it: the printed order "The car first. Then the certificate." or the RM 250,000 / monthly payments.', keywords: [['office', 'chairman', 'sinar', 'order', 'paid', 'payment', '250', 'certificate', 'car first']], hint: 'What did the shredder by his locker say, and who paid his wife on Friday?' },
          { id: 'voice', label: 'Who he could not have been', criterion: 'The dead man had no larynx (a laryngectomy, no voice), so he could not have been the voice on the telephone / the voice that spoke in the car on 1 December or at the dinner.', keywords: [['voice', 'speak', 'spoke', 'larynx', 'laryng', 'throat', 'stoma', 'talk']], hint: 'What was under the cravat?' },
        ],
        need: 3,
        clue: 'Hamidah taps the sheet. "Three I can prove. Four, and I will sleep tonight."',
      },
      evidence: {
        img: 'ev_c12_report', hotspot: HOT(),
        title: 'Write only what you can prove',
        short: 'Hamidah reads your report twice and writes the charge against Sjn. Mohd. Asri bin Ghazali herself: murder, and arson. Then she lays the burial permit from HKL on top of it, with its empty box for a name. "Write only what you can prove," she says. "Henry Goh wrote \'match\' once."',
        text: 'She reads it with the pencil she never uses held in her teeth, then takes it out and draws a line under one sentence of yours: he could not speak. "That sentence is the only thing in this file that tells me who a man was not," she says. "Everything else tells me who he might be." She writes the charge herself, against Sjn. Mohd. Asri bin Ghazali, Section 302 and Section 435, and does not look at Farah while she writes it. Then she takes the burial permit out of its plastic sleeve and lays it on top. Name of deceased: an empty box. "Sinar\'s lawyers want a name in that box by noon. So do the papers. So, if I am honest, do I." She caps her flask. "Write only what you can prove, detective. Henry Goh wrote \'match\' once, on an X-ray, and a man lay under the wrong name in Cheras for five years. Not on my desk."',
      },
    },
    {
      id: 'c12_22', phase: 'Bukit Aman', title: 'Interview room 1',
      game: 'interrogation', variant: 'classic',
      brief: 'Interview room 1 at twenty to three on Tuesday morning. Asri sits where he has sat a hundred times, but on the other side of the table, with his handset still on his belt because nobody has yet asked him for it. Farah stands at the door and does not sit. One thing he tells you is not true. Find it, and put the exhibit that breaks it on the table.',
      params: {
        setting: 'Interview room 1, D9, Bukit Aman. Tuesday, 2:40 AM.',
        suspect: {
          id: 'asri', voice: 'voice_3', name: 'Sjn. Mohd. Asri bin Ghazali', role: 'Sergeant, D9, Bukit Aman. Inspector Farah\'s sergeant, 38',
          persona: 'Quiet, polite Kelantanese Malay police sergeant of thirty-eight: soft Malaysian English for work, short careful sentences, slipping into Kelantan dialect when tired or cornered ("Gapo demo nok?", what do you want; "ambo" for I, "demo" for you). Calls Farah "Puan" and the detective "Tuan", always, even now. Never raises his voice; folds his hands on the table like a man waiting for a bus. Sounds loyal and sorry, and is almost relieved when he is caught. Will not describe the dead man\'s face. Has never seen the face of whoever sends the orders, and says so as a plain fact.',
        },
        facts: [
          { id: 'f1', topic: 'his job', claim: 'Four years I am Puan Farah\'s sergeant. Before that, traffic, Kota Bharu. I drive her, I carry her bag, I make the teh.' },
          { id: 'f2', topic: 'Saturday night', claim: 'Puan told me: watch V1, tell me when it moves. I told her when it moved.' },
          { id: 'f3', topic: 'the first of December', claim: 'On the first of December I was the last one she spoke to before the divider. I heard it on the phone. I still hear it.' },
          { id: 'f4', topic: 'Singapore', claim: 'In January I drove Puan and the Tuan to the Causeway. I asked what time you would see the old man. I ask everything, Tuan. It is my job.' },
          { id: 'f5', topic: 'Shah Alam', claim: 'At the coroner\'s court I guarded the witness room. I carried the corporal\'s tray in. I did not look at it. It was a tray.' },
          { id: 'f6', topic: 'his family', claim: 'My wife keeps the accounts. Two children. A house loan in Kota Bharu that finishes when I am sixty.' },
          { id: 'f7', topic: 'the dead man', claim: 'Everybody knows who it is, Tuan. You know. Puan knows. Only the form does not know.' },
        ],
        lies: [
          { id: 'l1', topic: 'Jenjarom', claim: 'I lost the car at Jenjarom at twenty to two. I radioed Puan. Then I rode up and down that road looking for it.', truth: 'He was driving the car. At 2:01 he keyed his handset inside it, at the gate, eleven minutes after he had driven it there.', exposedBy: 'e1' },
          { id: 'l2', topic: 'the palms', claim: 'I never set foot in those palms. I came up the road at 2:34 like everybody else.', truth: 'His boots go from the driver\'s door into the palms and three hundred metres to where his motorbike stood.', exposedBy: 'e2' },
          { id: 'l3', topic: 'money', claim: 'I am paid my salary and my overtime, nothing else. Saturday is on the duty sheet: surveillance, B2, all night. I have never taken a sen from Sinar.', truth: 'The duty entry was typed in on Sunday afternoon; Sinar Cold Chain has paid his wife RM 3,000 a month since 2019, and RM 250,000 on Friday.', exposedBy: 'e3' },
          { id: 'l4', topic: 'his raincoat', claim: 'I never wear the raincoat on a dry night. Mine is in stores.', truth: 'At 1:52 he wore it with the reflective tape torn off; the tape was in the clearing and the raincoat in his locker.', exposedBy: 'e4' },
        ],
        evidence: [
          { id: 'e1', title: 'Handset forty-one', text: 'The car\'s recorder, 2:01:12: the ID burst of police handset D9-HT-41, keyed inside the car at the gate, as "Puan, saya hilang dia di Jenjarom" went out on Farah\'s channel.' },
          { id: 'e2', title: 'Three hundred metres', text: 'Police patrol boots, size 8, left heel worn on the outside: from the car\'s driver\'s door into the palms, then three hundred metres to a motorbike stand. Petrol in the first prints.' },
          { id: 'e3', title: 'Overtime', text: 'Saturday\'s duty entry typed on Sunday at 3:40 PM. His wife\'s account: RM 3,000 a month from Sinar Cold Chain since 2019, and RM 250,000 on Friday 19 February.' },
          { id: 'e4', title: 'A strip of tape', text: 'In the clearing where the motorbike stood, a strip of reflective tape torn from a police raincoat. It fits the raincoat in his locker stitch hole for stitch hole.' },
          { id: 'e5', title: 'The car first', text: 'From the shredder by his locker: "To: M.A. Bay V1 at 0:45. The gate at 1:50. The car first. Then the certificate. Nothing on the phones."' },
          { id: 'e6', title: 'No voice', text: 'Dr. Lim: an old laryngectomy under the cravat. The dead man had not spoken with his own throat for ten years or more.' },
          { id: 'e7', title: 'Bay V1 to the gate', text: 'The Jenjarom junction camera, 1:34: the black car southbound, and no motorbike behind it for six minutes.' },
        ],
        secret: 'He drove the car out of Bay V1 at 0:50 with the passenger already in the back and reached the gate at 1:50; he had left his motorbike in the palms on Saturday afternoon. At about 1:56 he smothered the passenger with the back-seat cushion; at 2:01 he radioed Farah from inside the car that he had lost it at Jenjarom; he poured petrol in the front, walked into the palms with the can, threw a lit flare into the footwell at 2:08, walked 300 metres to his bike and came to the gate at 2:34 from the Jenjarom road. Sinar has paid him RM 3,000 a month since 2019 for what is said in Farah\'s car, and RM 250,000 on Friday; the order came printed, "The car first. Then the certificate." He was told the passenger was the Chairman and would not speak. He has never seen the face of whoever sends the orders.',
        suggested: [
          'Where did you lose the car?',
          'Where were you at two o\'clock?',
          'What does Sinar pay you?',
          'Where is your raincoat?',
          'Who was the man in the back seat?',
          'Who gives you your orders?',
          'Why did you do it?',
        ],
        maxQuestions: 14,
        clue: 'Farah, from the door, very quietly: "He will tell you he is sorry before he tells you anything else. Let him. Then show him the radio."',
      },
      evidence: {
        img: 'ev_c12_silence', hotspot: HOT(),
        title: 'He will not speak',
        short: 'Caught in one lie, Asri unclips his handset and lays it on the table himself. "They told me he was the Chairman. I asked how I would know him. They said: he will not speak. He did not speak. He tapped on the window, twice, and then he stopped." He has never seen the face of the man who sends the orders either.',
        text: 'He unclips the handset from his belt and lays it on the table between you, square to the edge, the way he lays down Farah\'s teh. "Since 2019, three thousand a month," he says. "For what is said in Puan\'s car. Nothing on the phones. Printed, in an envelope, in my locker." He does not look at the door, where Farah is. "In January they asked me what time the Tuan would see the old man in Singapore. I told them. They said they knew already. They only wanted to see if I would tell." On Friday the order said the car first, then the certificate, and the money came to his wife the same afternoon. He took the bike down to the palms on Saturday and came back on the Banting bus. At a quarter to one he walked into V1 and the car was waiting with its key in it and a man in the back in a white shirt, sitting very straight. "They told me he was the Chairman. I asked how I would know him. They said: he will not speak." He folds his hands. "He did not speak. Not on the road, not at the gate. He tapped on the window with his ring, twice, and then he stopped." Who sends the orders? He shakes his head. "Gapo demo nok, Tuan? I have never seen his face. I have never seen anybody\'s face. Only paper." The certificate was his too: he was to stand at the hospital every day and say to everybody, quietly, that everybody knows who it is. "I said it to you," he says. "On Sunday. Twice."',
      },
    },
  ],

  outcomes: {
    charged: {
      asri: { en: 'Sjn. Mohd. Asri bin Ghazali is arrested by Farah herself, in the D9 office, in front of the board where he pinned your photographs. She takes his handset off his belt and lays it on the desk. Neither of them says anything.' },
      azhar: { en: 'Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights, and asks for his lawyer by his first name.' },
      itam: { en: 'Pak Itam is charged. The gate at Jugra is chained by the police, and for the first time since 1985 nobody keeps it.' },
      ain: { en: 'Nurul Ain is charged. She gives her camera to Farah and asks her to keep the card safe.' },
    },
    correct: ['asri'],
  },

  // Hidden consequences, for Season Three. ASRI_FREE: Farah's sergeant went on driving her. AZHAR_WRONGED_12 /
  // ITAM_WRONGED / AIN_WRONGED_12: charged with a murder they did not commit (new names: judge() clears every flag a
  // case owns, so Case 7's AZHAR_WRONGED / AIN_WRONGED must not be reused). CERT_UNKNOWN / CERT_SIGNED: whether the
  // burial permit says only what the evidence carries. CHAIRMAN_DECLARED_DEAD: the form names the Chairman.
  flagNames: ['ASRI_FREE', 'AZHAR_WRONGED_12', 'ITAM_WRONGED', 'AIN_WRONGED_12', 'CERT_UNKNOWN', 'CERT_SIGNED', 'CHAIRMAN_DECLARED_DEAD'],
  flags: ({ charged, answers }) => ({
    ASRI_FREE: !charged.includes('asri'),
    AZHAR_WRONGED_12: charged.includes('azhar'),
    ITAM_WRONGED: charged.includes('itam'),
    AIN_WRONGED_12: charged.includes('ain'),
    CERT_UNKNOWN: answers.cert === 'unknown',
    CERT_SIGNED: answers.cert !== 'unknown',
    CHAIRMAN_DECLARED_DEAD: answers.cert === 'chairman',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  // Flags from earlier cases are read with `when` (the voice manifest walks every line); this case's own
  // verdict is read from v.has / v.answers.
  ending(v) {
    const cert = v.answers.cert;
    const asri = v.has('asri');
    const declared = cert === 'chairman';

    // 1. Bukit Aman: the arrests
    const arrests = [];
    if (asri) arrests.push({ who: null, en: CASE12.outcomes.charged.asri.en });
    if (v.has('azhar')) {
      arrests.push({ who: null, en: 'Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights for the second time in three months, and asks for the same lawyer.', when: (f) => f.AZHAR_WRONGED });
      arrests.push({ who: null, en: 'Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights in front of two photographers who were told where to stand, and asks for his lawyer by his first name.', when: (f) => !f.AZHAR_WRONGED });
    }
    if (v.has('itam')) arrests.push({ who: null, en: CASE12.outcomes.charged.itam.en });
    if (v.has('ain')) arrests.push({ who: null, en: CASE12.outcomes.charged.ain.en });
    if (!asri) arrests.push({ who: null, en: 'At half past four Sjn. Asri drives Farah home, as he has every night for four years, and carries her bag up the stairs.' });

    // 2. HKL: the form
    const form = [];
    if (cert === 'unknown') {
      form.push({ who: null, en: 'Hamidah Yusof uncaps a pen she does use, and writes in the box for a name, in capitals, saying it aloud as she writes.' });
      form.push({ who: 'Hamidah Yusof', orig: 'Tidak dikenali. Lelaki, lebih kurang tujuh puluh lima tahun.', en: 'Unidentified. Male, about seventy-five.' });
      form.push({ who: 'Hamidah Yusof', en: 'Henry Goh wrote "match" once. Not on my desk.' });
    } else if (cert === 'chairman') {
      form.push({ who: null, en: 'Hamidah Yusof writes it slowly, in capitals: the Chairman of Sinar Holdings Berhad. She initials it, and does not look up.' });
      form.push({ who: 'Hamidah Yusof', en: 'It is on the form now, detective. By Friday it will be on a grave.' });
    } else if (cert === 'brother' || cert === 'double') {
      form.push({ who: null, en: cert === 'brother'
        ? 'Hamidah Yusof writes "brother of the Chairman of Sinar Holdings Berhad", crosses it out, and writes it again, because you asked her to.'
        : 'Hamidah Yusof writes "a person employed to stand in for the Chairman of Sinar Holdings Berhad", crosses it out, and writes it again, because you asked her to.' });
      form.push({ who: 'Hamidah Yusof', en: 'I will regret this, detective. Not today. But I will.' });
    } else {
      form.push({ who: null, en: 'Hamidah Yusof leaves the box empty, and the permit goes back into its plastic sleeve.' });
    }
    form.push({ who: null, en: 'Exhibit P7 from the coroner\'s court, the cancelled note from Melaka, goes under Dr. Lim\'s glass beside the deed. The borrower\'s left thumb shows the same nine points as the man on her table. Still nine.', when: (f) => f.NOTE_FOUND });

    // 3. Menara Sinar and Bursa
    const tower = [];
    if (declared) {
      tower.push({ who: null, en: 'Sinar Holdings Berhad announces to Bursa Malaysia, with deep regret, the death of its Chairman. The share price rises eleven sen before lunch.' });
      tower.push({ who: null, en: 'By three o\'clock Seah & Seah of Singapore, Clarissa Seah writing, have told the High Court that under the deed of 1987 as amended, the Jugra Trust is to be directed by whoever drove him last.', when: (f) => f.CLARISSA_FREE });
      tower.push({ who: null, en: 'By three o\'clock Sinar\'s lawyers have told the High Court that under the deed of 1987 as amended, the Jugra Trust is to be directed by whoever drove him last.', when: (f) => !f.CLARISSA_FREE });
      tower.push({ who: null, en: asri
        ? '"On the evidence," the letter says, "Sergeant Asri. Or, the court may find, on the first of December, the detective."'
        : '"On the evidence," the letter says, "whoever drove the car to the gate. Or, the court may find, on the first of December, the detective."' });
      tower.push({ who: null, en: 'Hamidah\'s charge against the user of prepaid line 011-2604 1986 abates with the death she has just certified. She tears nothing up. She files it.', when: (f) => f.VOICE_TRACED });
    } else {
      tower.push({ who: null, en: 'Sinar Holdings tells Bursa Malaysia that its Chairman is well and will not be taking questions. The share price closes where it opened.' });
      tower.push({ who: null, en: 'Hamidah\'s charge sheet against a person unknown, the user of prepaid line 011-2604 1986, stays open on her desk.', when: (f) => f.VOICE_TRACED });
      tower.push({ who: null, en: 'On Hamidah\'s charge sheet the line under "and abetment by" stays blank.', when: (f) => f.VOICE_LOST });
    }
    tower.push({ who: null, en: 'Tan Sri Azhar knew the sentence because every newspaper had printed it: Arthur Seah recited the letter of wishes into an affidavit from a hospital bed, every word.', when: (f) => f.ARTHUR_FOUND });
    tower.push({ who: null, en: 'Tan Sri Azhar knew the sentence from the board: a copy of the letter of wishes, made at Seah & Seah before the original burned, had reached every director by January.', when: (f) => !f.ARTHUR_FOUND });

    // 4. Cheras: the burial
    const burial = [
      { who: null, en: 'The man from the back seat is buried in plot 2741, at the far end of the public cemetery under a rain tree, in a row of numbered boards. Nobody claims him. Everybody comes.' },
      { who: null, en: 'Bala Anne brings a garland of jasmine and marigold from the shop on Jalan Thambapillay, and lays it down without a word.' },
    ];
    if (!v.has('itam')) burial.push({ who: null, en: 'Pak Itam stands at the cemetery gate with his keys on their string, as if somebody had told him to keep it.' });
    burial.push({ who: null, en: 'Teoh Siew Yang paints the plot\'s number on its board herself, in black, with her smallest brush.', when: (f) => !f.YANG_WRONGED });
    burial.push({ who: null, en: 'Two rows away, a headstone that says Ong Wei Jie.', when: (f) => f.BODY_NAMED });
    burial.push(cert === 'unknown'
      ? { who: null, en: 'Daniel folds a kancil from a copy of the burial permit and leaves it on the turned earth.' }
      : { who: null, en: 'Daniel does not fold anything. He stands with his hands in his pockets until the diggers have gone.' });
    if (!v.has('ain')) burial.push({ who: null, en: 'Nurul Ain photographs the board with the number on it, and nothing else.' });
    burial.push({ who: null, en: 'At the cemetery gate a black Land Cruiser with a new bull bar idles three lengths behind nobody.', when: (f) => f.ROSLAN_FREE });
    burial.push({ who: null, en: 'At Bukit Aman, Superintendent Khairul gives the press a statement about "the end of a long chapter".', when: (f) => f.KHAIRUL_FREE && !f.KHAIRUL_WRONGED });
    burial.push({ who: null, en: 'From his gate in Bangsar, Khairul, still suspended, gives the press a statement about "the end of a long chapter".', when: (f) => f.KHAIRUL_FREE && f.KHAIRUL_WRONGED });

    // 5. The steps
    const steps = [
      { who: null, en: 'Farah and you sit on the steps of Restoran Bala with a glass of teh each, going cold.' },
    ];
    if (asri) {
      steps.push({ who: 'Inspector Farah Iskandar', en: 'Four years he sat in my car.' });
      steps.push({ who: null, en: 'She counts it off without looking at her fingers. The last voice she heard before the divider. Her car named at 5:52, before anybody had found her purse. A question about what time an old man in Singapore would see you. A tray carried through a door.' });
      steps.push({ who: 'Inspector Farah Iskandar', en: 'I called all of it loyalty.' });
    } else {
      steps.push({ who: 'Inspector Farah Iskandar', en: 'Asri has asked for leave. Two weeks, Kota Bharu. I signed it.' });
    }
    steps.push({ who: null, en: 'At a quarter past one Bala Anne pulls the shutter down behind you and goes up to bed. A few minutes later Farah drives home.' });

    const panels = [
      { img: 'c12_out_01_arrest', mood: 'police', fx: ['rain', 'siren'], place: 'Bukit Aman. Tuesday, 4:30 AM.', music: 'resolution', lines: arrests },
      { img: 'c12_out_02_form', mood: 'day', fx: [], place: 'Hospital Kuala Lumpur. Tuesday, 9:00 AM.', lines: form },
      { img: 'c12_out_03_bursa', mood: 'day', fx: [], place: 'Menara Sinar, Jalan Ampang. Tuesday, noon.', lines: tower },
      { img: 'c12_out_04_cemetery', mood: 'day', fx: ['dust'], place: 'Cheras public cemetery. Tuesday, 5:00 PM.', music: 'memory', lines: burial },
      { img: 'c12_out_05_steps', mood: 'night', fx: [], place: 'Restoran Bala, Brickfields. Tuesday, midnight.', lines: steps },
    ];

    // 6 and 7. Wednesday, ten past two. No face, no name, no word from you, no reaction.
    const reply = {
      unknown: 'You would not sign. Henry Goh would have. That is why I chose you.',
      chairman: 'You signed. Thank you. Now nobody is looking for me except you.',
      brother: 'You were nearer than the others. Not near enough.',
      double: 'You were nearer than the others. Not near enough.',
    }[cert];
    const car = [
      { who: null, en: 'At ten past two a black car with no plates stops outside Restoran Bala, the second of its kind. The engine is running.' },
      { who: null, en: 'This time the back door is open. From the driver\'s seat, the voice.' },
      { who: 'The Chairman', en: 'Good evening, detective. Not the front. Tonight I drive.' },
    ];
    if (reply) car.push({ who: 'The Chairman', en: reply });
    car.push({ who: null, en: 'You get into the back. The car moves.' });
    panels.push({ img: 'c12_out_06_backdoor', mood: 'night', fx: ['rain'], place: 'Brickfields. Wednesday, 2:10 AM.', music: 'chairman', lines: car });
    panels.push({
      img: 'c12_out_07_mirror', mood: 'night', fx: [], place: 'Jalan Tun Sambanthan.',
      lines: [
        { who: null, en: 'A hand in a white cuff reaches up and tilts the rear-view mirror until it holds your eyes, and his. The reading light comes on.' },
        { who: 'The Chairman', en: 'You may look in the mirror as often as you like, detective.' },
        { who: null, en: 'You look.' },
      ],
    });
    panels.push({ title: { kicker: 'Floor 14', name: 'End of Season Two' }, fx: [] });
    return panels;
  },
};
