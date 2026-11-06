// CASE 8: TEN PAST TWO. Brickfields, Batu Road, Jalan Ampang, the Federal Highway, Pulau Indah, Banting, Jugra.
// Truth (writers only): ATTEMPTED MURDER of a police officer, on the night of the first drive.
// At 2:09 AM on Tuesday 1 December 2026 a long black saloon with no plates stopped outside Restoran Bala,
// engine running, driver's door open. A man sat directly behind the driver's seat, where the rear-view mirror
// (angled to the left half of the seat) could not see him, and spoke live in the voice until 3:44. Stops: Batu
// Road 2:24 to 2:28 (Leong Kam Wah, the tailor, hands a parcel to a hand in a white cuff through the rear left
// window); Jalan Ampang 2:38 (the car slows under the black band, the Level 14 lamp on its 2:10 to 2:40 timer);
// the gate of Warehouse 6, Pulau Indah, 3:44 to 3:48 ("Look at Bay 3"), where, while you look right, the rear
// LEFT door opens and he crosses to the escort car; he leaves an old Nokia on loudspeaker on a call to his own
// phone (from 3:43 to the end) and a cigarette burning in the rear ashtray. From there the voice is a telephone.
// At 5:40, at the Jugra gate, Pak Itam (rung at his hut at 5:30) opens the rear left door, takes the Nokia and
// walks back. The boot: THE RULES, "Terima kasih." in ink, written left-handed; RM 1,986; a driver's shirt and
// cap; the plate BCK 210 with a painted sun.
// The attack: Roslan Daud, 49, the escort ("ekor") three lengths behind the black car since 2003 in Sinar Cold
// Chain fleet car F-03 (black Land Cruiser, bull bar, WVT 3022, front plate off that night), expected Muthu's
// seat. Told to drive "three lengths behind the inspector", he rammed Farah's grey Waja (WQE 8812) into the
// divider at Batu Tiga at 3:12 so that the detective would stop and break the rules. The detective did not stop.
// At 3:44 the Chairman got into F-03 anyway, and Roslan drove him to Melaka (Ayer Keroh, 5:28; waiting in a
// Melaka lane at 6:10, old bull bar, one headlight out). F-03 was back in the Westport yard at 9:50 AM, and at 7 PM on Tuesday it went into Bengkel Seng Lee, Sentul, for "a
// cow at Kapar": a new bull bar and a new left headlight. Supt. Khairul Anuar gave Roslan
// Farah's position: 2:31, 2:49 and 3:04, live location requests under a report that does not exist (IPD Dang
// Wangi 1401/26), each phoned to F-03's prepaid. He knew she would follow because the BALA line is still
// tapped: her 11:40 PM call to Sjn. Asri went to a recorder above a sari shop, played back at 1:10 AM from
// Khairul's line (his office; his house in Bangsar and Kpl. Faridah Ismail's login if KHAIRUL_WRONGED).
// Red herrings: Murali Krishnan, 52 (prime mover 200 m ahead, drove on: licence suspended, fifteen hours at
// the wheel); Kamarul Zaman, 39 (black Prado, no bull bar, a toll at Kota Kemuning at 3:09, a karaoke lounge).
// Nizam "Jam" Jamaluddin pulled Farah out, rang 999 and took her phone, dashcam and purse.
// The Chairman: NOT named, NOT seen. Private note: his identity is still undecided. Nothing here may pin it to
// a person. Sjn. Asri is trusted and helpful in this case; the only seeds are the plan's (Farah's last words
// before the crash were to him; at 5:52 he knew it was her car though her purse and phone were gone: he says
// he ran her plate). Bala Anne is off screen from 1:50 AM on; Pak Itam is on screen only from 5:30 to 5:45.

// Daniel at the start of Case 8: exactly case07.js's rules (docs/arc_season2.md §2).
const HELD7 = (f) => (!!f.DANIEL_TAKEN || !f.DANIEL_FOUND) && !f.ARCHIVE_SEIZED; // in Sinar's hands: hooded in the back seat
const REMAND7 = (f) => !HELD7(f) && !!f.DANIEL_CHARGED; // Sungai Buloh, Block C
const FREE7 = (f) => !HELD7(f) && !f.DANIEL_CHARGED; // Farah's safe house


// The line the splice tape plays: it must stay word for word the same as in the opening.
const FARAH_LINE = { who: 'Inspector Farah Iskandar', en: 'Asri. A black four-by-four with no lights is coming up on my left. If anything happens, it was not an accident.' };

const EXIT = [
  { id: 'tailor', label: 'Batu Road, outside Leong Brothers Tailor, 2:24 AM', note: 'The window went down and a hand took a parcel.' },
  { id: 'ampang', label: 'Jalan Ampang, under the black band, 2:38 AM', note: 'The car slowed under his lamp.' },
  { id: 'bay3', label: 'The gate of Warehouse 6, Pulau Indah, 3:44 AM', note: 'He told you to look at Bay 3.' },
  { id: 'jugra', label: 'The gate with the pink sun, Jugra, 5:40 AM', note: 'You heard the door.' },
];

export const CASE08 = {
  id: 'case08',
  number: 8,
  title: 'Ten Past Two',
  place: 'Brickfields to Jugra, Selangor',
  victim: 'Inspector Farah Iskandar. Pushed into the divider of the Federal Highway at Batu Tiga at 3:12 AM on Tuesday. Alive, in intensive care.',
  question: 'Who tried to kill Farah?',
  brief: 'At ten past two you got into the front of a black car with no plates, and a man behind you said don\'t look back. Three cars behind, Farah followed. At 3:12, on the Federal Highway, somebody put her car into the divider, and the voice behind you said do not stop. You did not stop. Klang wants to know why. So do you.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end: who put Farah into the divider, and where the man behind you got out of the car. Nobody will tell you if you get either of them right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Sergeant Asri sent a photograph from Hospital Shah Alam: a glass of teh on a hospital locker, untouched, and a hand with a drip in it.',
  deduction: {
    lede: 'Hamidah Yusof will charge whoever you name with the attempted murder of a police officer, on your word, while Farah is still in intensive care. Name everyone who did it or made it possible, and only them.',
    button: 'Tell Hamidah',
    confirm: 'Hamidah will charge {names} with the attempted murder of Inspector Farah Iskandar. Asri will take the news to the ward before the nurses change shift.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Hamidah',
    questions: [
      {
        id: 'exit', q: 'Where did he get out of the car?', short: 'He got out at',
        lede: 'Hamidah can ask a magistrate for one set of records: one place, one minute. Whichever you choose, the Office of the Chairman will know by lunch.',
        options: EXIT,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest.
  suspects: [
    {
      id: 'murali', name: 'Murali Krishnan', role: 'Owner-driver, red prime mover, Teluk Gadong, Klang. 52', img: 'sus_murali',
      revealedBy: 'c8_04',
      revealLine: 'His prime mover was two hundred metres ahead of her at 3:11, and it did not stop.',
      look: { skin: '#7a4a2e', hair: 'short', hairColor: '#3a3632', coat: 'batik', eyewear: 'none', mark: 'moustache' },
      motive: 'None known. He hauls reefers for Sinar Cold Chain and anybody else who pays, and his trailer has a fresh scrape down its left side.',
      claim: 'Says he was already at the depot in Klang by three, and that the scrape on his trailer is from the divider at Kapar.',
    },
    {
      id: 'kamarul', name: 'Kamarul Zaman bin Hashim', role: 'Aide to a deputy minister. 39', img: 'sus_kamarul',
      revealedBy: 'c8_06',
      revealLine: 'A black Land Cruiser at a Kota Kemuning petrol station at 2:58, and the man from the head table at the wheel.',
      look: { skin: '#c48b62', hair: 'side-part', hairColor: '#151210', coat: 'blazer', eyewear: 'square', mark: 'none' },
      motive: 'Farah\'s report on the night of Sinar\'s dinner named him as a man who lied to her about a balcony. It went to his minister.',
      claim: 'Told Klang police he was at home in Ampang from eleven o\'clock, asleep.',
    },
    {
      id: 'khairul', name: 'Supt. Khairul Anuar', role: 'Superintendent, D9, Bukit Aman. Farah\'s superior. 52', img: 'sus_khairul',
      revealedBy: 'c8_09',
      revealLine: 'Farah\'s call from Bala\'s phone was played back at 1:10 AM, from a line you know.',
      look: { skin: '#b97f55', hair: 'side-part', hairColor: '#151210', coat: 'batik', eyewear: 'none', mark: 'moustache' },
      motive: 'For a year Farah has been the end of his career, one report at a time.',
      claim: 'Says he was asleep at home in Bangsar when Shah Alam rang about his inspector, and that he has not spoken to her since the dinner.',
    },
    {
      id: 'roslan', name: 'Roslan Daud', role: 'Driver, Sinar Cold Chain fleet car F-03. 49', img: 'sus_roslan',
      revealedBy: 'c8_11',
      revealLine: 'Fleet car F-03 has had one driver for twenty-three years.',
      look: { skin: '#a8714a', hair: 'short', hairColor: '#8a8a8a', coat: 'leather', eyewear: 'none', mark: 'moustache' },
      motive: 'Twenty-three years three lengths behind the black car, waiting for the front seat. On the first of December it went to you.',
      claim: 'Says F-03 never left the Sinar Cold Chain yard on Monday night, because he hit a cow at Kapar on Sunday and it has been in the workshop since.',
    },
  ],

  opening: [
    {
      img: 'c8_intro_01_wallphone', mood: 'warm', fx: ['rain'], place: 'Restoran Bala, Brickfields. Monday, 11:40 PM.', music: 'office',
      lines: [
        { who: null, en: 'Bala Anne will not pull the shutter. He has wiped the same table four times, and he has not looked at the clock once, which is how you know he has been looking at it all night.' },
        { who: 'Bala Anne', orig: 'Thambi. Andha car-la ēra vendaam.', en: 'Boy. Don\'t get into that car.' },
        { who: null, en: 'Farah is at the counter in her jacket with her phone dead in her hand. It charges in the car, she says. She borrows Bala Anne\'s wall phone and rings her sergeant.' },
        { who: 'Inspector Farah Iskandar', en: 'Asri. Three cars behind, in my Waja. If he turns, I turn.' },
        { who: null, en: 'On the television over the counter, Dr. Shanti Menon\'s appeal is listed for March. Bala Anne turns the sound down and leaves the picture on.', when: (f) => f.SHANTI_WRONGED },
        { who: 'Bala Anne', en: 'That Ravi says if you are going for a drive, take him also. He wants to see a car with no number plate. I told him go and sell his durian.', when: (f) => f.RAVI_WRONGED },
        { who: null, en: 'A second postcard from Pandamaran beside the till, from Ah Fook: the bandages are off. His trial is in January.', when: (f) => f.AHFOOK_WRONGED },
        { who: null, en: 'Puan Rohana has written again from Klang. Amirul has started to speak, she says, but only to the cat.', when: (f) => f.AMIRUL_WRONGED },
        { who: null, en: 'Ken Lim rang at ten to tell you Bobby Tan is selling phones on the third floor of Low Yat now, three shops from his, and waves at him every morning.', when: (f) => f.BOBBY_FREE },
        { who: 'Daniel Raj', en: 'Machan. Do not drink anything you did not order. And count his stops.', when: FREE7 },
        { who: null, en: 'Under the sugar jar, a letter from Sungai Buloh in Daniel\'s hand, folded into a kancil. Unfolded, it says only: Count his stops. Do not look back.', when: REMAND7 },
        { who: null, en: 'Nothing from Daniel. Upstairs, in your drawer, the paper kancils that came under your door since August, one for every few weeks they have kept him.', when: HELD7 },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c8_intro_02_shutter', mood: 'night', fx: ['rain'], place: 'Jalan Tun Sambanthan. 1:50 AM.', music: 'tension',
      lines: [
        { who: null, en: 'At ten to two Bala Anne pulls the shutter down to the pavement, and the light goes out behind it, and he does not come out again.' },
        { who: null, en: 'Brickfields Road, the old men still call it. Tonight it is empty from the temple to the monorail: rain, a cat, and three shops down, a grey Proton Waja with its lights off and somebody sitting very still behind the wheel.' },
      ],
      kb: { from: [1.0, 0, 2], to: [1.1, 0, -2] },
    },
    {
      img: 'c8_intro_03_car', mood: 'night', fx: ['rain'], place: '2:09 AM.',
      lines: [
        { who: null, en: 'A long black saloon comes up the street without a sound and stops at the kerb outside Restoran Bala. No plates. Engine running. The driver\'s door stands open, and the driver\'s seat is empty.' },
        { who: null, en: 'The back seat is not. Through the rain on the rear window, a shape: a man sitting very straight behind the driver\'s seat.' },
        { who: null, en: 'In the rear-view mirror, on the left half of the back seat, a man with a cloth hood over his head and his hands tied in his lap. You know the shoulders.', when: HELD7 },
      ],
      kb: { from: [1.12, 0, 0], to: [1.02, 0, 0] },
    },
    {
      img: 'c8_intro_04_shoulder', mood: 'night', fx: [], place: '2:10 AM.', music: 'chairman',
      lines: [
        { who: null, en: 'You get in. The seat is warm, as if somebody has only just got out of it, or as if it has been kept warm for you.' },
        { who: null, en: 'The rear-view mirror has been turned until it shows only the left half of the back seat. Whoever is behind you is sitting where it cannot see.' },
        { who: null, en: 'A hand in a white cuff settles on your shoulder, light, the way it did at Cheras. Tobacco, and old hair oil.' },
        { who: 'The Chairman', orig: 'Jangan tengok belakang, detektif.', en: 'Don\'t look back, detective.' },
        { who: 'The Chairman', en: 'Drive. Brickfields Road, then Birch Road. You will not need the mirror.' },
      ],
      kb: { from: [1.0, 1, 0], to: [1.14, -1, 0] },
    },
    {
      img: 'c8_intro_05_tailor', mood: 'night', fx: ['rain'], place: 'Batu Road. 2:24 AM.',
      lines: [
        { who: null, en: 'He calls Jalan Tuanku Abdul Rahman Batu Road, as if nobody had told him. Outside a shuttered shophouse with LEONG BROS. painted over the five-foot way, an old man stands at his door in a singlet, holding a parcel in brown paper.' },
        { who: null, en: 'The rear left window goes down. A hand in a white cuff comes out of the dark of the car, takes the parcel, and goes back in. The old man does not bend to look.' },
        { who: 'Leong Kam Wah', orig: 'Tuan. Gin saam zou hou zo.', en: 'Tuan. The shirt is ready.' },
        { who: 'The Chairman', en: 'Mr. Leong has measured me in the dark since 1986. He has never asked for a light.' },
        { who: null, en: 'Four minutes, by the clock on the dashboard. Then: Mountbatten Road. Foch Avenue. Treacher Road. Streets that have not had those names since before you were at school.' },
      ],
      kb: { from: [1.08, -2, 0], to: [1.0, 2, 1] },
    },
    {
      img: 'c8_intro_06_lamp', mood: 'night', fx: ['rain'], place: 'Jalan Ampang. 2:38 AM.',
      lines: [
        { who: null, en: 'The car slows, but does not stop, under Menara Sinar. A third of the way up, in the black band where a storey is not, one small lamp is burning.' },
        { who: 'The Chairman', en: 'My lamp.' },
        { who: 'The Chairman', en: 'Your prosecutor wrote my telephone number on a charge sheet. I have had it framed.', when: (f) => f.VOICE_TRACED },
      ],
      kb: { from: [1.0, 0, 2], to: [1.12, 0, -2] },
    },
    {
      img: 'c8_intro_07_waja', mood: 'night', fx: ['rain'], place: 'Federal Highway, westbound, three cars behind. 3:11 AM.',
      lines: [
        { who: null, en: 'You are not here. Three cars back, Farah drives with her phone on its cable and one eye on the tail lights of a car with no plates.' },
        FARAH_LINE,
        { who: null, en: 'In her left mirror, coming up fast out of the dark of the slow lane, a shape with no lights at all.' },
      ],
      kb: { from: [1.06, 0, 0], to: [1.0, 0, 0] },
    },
    {
      img: 'c8_intro_08_mirror', mood: 'night', fx: ['rain'], place: '3:12 AM.', music: 'panic', sfx: 'thunder',
      lines: [
        { who: null, en: 'In your side mirror: headlights swerving, a shower of sparks, a car turning sideways into the concrete divider and spinning back across two lanes.' },
        { who: null, en: 'Your foot comes off the pedal by itself.' },
        { who: 'The Chairman', en: 'Do not stop. She will live. That was not mine.' },
        { who: null, en: 'You drive on. You will think about that for the rest of your life.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.16, 0, 1] },
    },
    {
      img: 'c8_intro_09_bay3', mood: 'night', fx: [], place: 'Pulau Indah. 3:44 AM.',
      lines: [
        { who: null, en: 'The gate of Warehouse 6, the barrier down, the guard cabin dark. Behind you the lid snaps open and shut, and fresh smoke fills the car.' },
        { who: 'The Chairman', en: 'Open your window. Look at Bay 3. I watched it burn twice.' },
        { who: null, en: 'You look. Bay 3 is a black shape against the cranes, roofless, the rain going straight in. Behind you, soft, the sound of a door, opened and shut again, the way it was at Batu Road when something was handed in.' },
        { who: 'The Chairman', en: 'Banting. Then Jugra.' },
      ],
      kb: { from: [1.05, -1, 0], to: [1.0, 1, 0] },
    },
    {
      img: 'c8_intro_10_banting', mood: 'night', fx: [], place: 'The Banting road. 4:30 AM.', music: 'memory',
      lines: [
        { who: null, en: 'Oil palm on both sides, black, and the road straight through it. The voice is a little thinner now, as if it were further away, though it has not moved.' },
        { who: 'The Chairman', en: 'Forty years ago tonight I drove this road the other way, in a lorry with no lights.' },
        { who: null, en: 'Then he hums. It takes you until Banting to place it: P. Ramlee, Getaran Jiwa. He hums it through twice, and stops in the same place both times.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.12, 0, 0] },
    },
    {
      img: 'c8_intro_11_gate', mood: 'day', fx: ['dust'], place: 'Jugra. 5:40 AM.', music: 'chairman',
      lines: [
        { who: null, en: 'A gate in the oil palm under Bukit Jugra, and on the gate, faded almost to nothing, a sun painted in pink.' },
        { who: 'The Chairman', en: 'Thank you, detective. Wait until you hear the door. Then open the boot.' },
        { who: null, en: 'The rear left door opens. A small sound of something taken off the seat.' },
        { who: 'Pak Itam', orig: 'Selamat pagi, Tuan.', en: 'Good morning, Tuan.' },
        { who: null, en: 'The door shuts. Flip-flops, slow, on laterite, going away. You count to ten, and then you look. The back seat is empty. In the rear ashtray, a cigarette burnt to the filter, cold.' },
        { who: null, en: 'On the left of the seat Daniel sits with the hood in his lap and a cut cord beside him, blinking at the light.', when: HELD7 },
        { who: 'Daniel Raj', en: 'Machan. You can look now.', when: HELD7 },
        { who: null, en: 'Your phone, at 5:52. Sergeant Asri.' },
        { who: 'Sjn. Asri', en: 'Puan Farah. Batu Tiga. The divider. She is alive.' },
      ],
      kb: { from: [1.12, 0, 1], to: [1.0, 0, -1] },
    },
    { title: { kicker: 'Case 8', name: 'Ten Past Two' }, fx: ['rain'] },
  ],

  levels: [
    // ---------------- Jugra ----------------
    {
      id: 'c8_01', phase: 'Jugra', title: 'The boot',
      game: 'hiddenobject', variant: 'list',
      brief: 'The key with the brass sun opens the boot. Inside, on grey felt, an archive box with a small sun embossed on its lid, and a car\'s worth of things somebody put there for you, carefully, a long time before tonight. Rosli is forty minutes away with his lamps. The light at the gate is coming up grey through the palms. Find everything on the list before you touch any of it.',
      params: { scene: 'boot', targets: 13, objects: 72 },
      evidence: {
        img: 'ev_c8_rules', hotspot: { x: 0.52, y: 0.62, r: 0.12 },
        title: 'Nine rules',
        short: 'In the boot: a white driver\'s shirt in your size and a peaked cap; RM 1,986 in old fifty-ringgit notes; a rusted lorry number plate, BCK 210, with a small sun painted in its corner; and a typed card, THE RULES, nine of them. Under the typing, in ink, two words: "Terima kasih." The ink is dragged along the line by the side of the hand that wrote it. It was written left-handed.',
        text: 'A white driver\'s shirt, ironed, folded in tissue, your collar size, and a black peaked cap with no badge. An envelope of old RM 50 notes, the green ones nobody has used for years: one thousand nine hundred and eighty-six ringgit, counted twice. A lorry\'s number plate, black with white letters, rusted through at two corners: BCK 210, and in its corner a small sun, painted by hand in pink. And a card, typed, headed THE RULES. One. Nothing on the phones. Two. The driver does not look in the mirror. Three. The car does not wait more than four minutes. Four. Never the same road twice in one night. Five. Nobody gets out on the right. Six. The car is washed by hand, never at a garage. Seven. Pay in cash, the morning after. Eight. Say thank you. Nine. At ten past two, the lamp. Under the typing, in blue-black ink, two words: Terima kasih. The pen has dragged a faint smear along the line after every letter, where the side of the hand followed the ink across the card. Rosli turns it to the light and says what you are thinking. "Left hand. Whoever wrote this pushes the pen. I sign like that. My whole school called me kidal."',
      },
    },
    {
      id: 'c8_02', phase: 'Jugra', title: 'At the rear left door',
      game: 'footprint', variant: 'classic',
      brief: 'The rain stopped at four, and the laterite at the Jugra gate is red mud that keeps everything. The car is where it stopped. Rosli lays his torch flat on the ground beside the rear left door, the door you heard, and the prints come up out of the mud like a photograph in a tray. Name the tread. Then find the shoe.',
      params: { shoes: 9 },
      evidence: {
        img: 'ev_c8_laterite', hotspot: { x: 0.42, y: 0.52, r: 0.18 },
        title: 'Nobody got out here',
        short: 'At the rear left door, one set of prints only: a pair of old rubber flip-flops, worn through at the right heel, from the watchman\'s hut to the door and back the same way. No leather sole ever stepped out of the car at Jugra. Whoever opened the door at 5:40 walked up to it and walked away. Nobody got out.',
        text: 'Rosli works outwards from the door in a half circle, the way Bomba does after a fire, and sets aside every print made after the sun came up, yours among them. Before those, at the rear left door, one pair of prints, deep and flat: rubber flip-flops, the cheap kind sold in bundles at every pasar malam, the right heel worn through to a hole the size of a coin. They come from the watchman\'s hut by the gate, forty metres of laterite, stop at the door with the toes square to it, stand there a moment, and go back to the hut in their own tracks. The flip-flops are on the step of the hut, side by side, with the mud still wet on them. Nothing else came to the door, and nothing left it. No leather sole, no shoe of any kind, stepped down from the back seat of that car this morning. Rosli stands up and looks at the long empty laterite all round the car. "If he got out here," he says, "he flew."',
      },
    },
    {
      id: 'c8_03', phase: 'Jugra', title: 'Cold ash',
      game: 'searchlight', variant: 'classic',
      brief: 'There is an old lorry shed inside the gate, open on one side, and you push the car into it before the sun comes up so that nobody can photograph it from the road. Inside it is black as a cellar, stacked with drums and old tyres. Rosli has brought six portable floodlights and a generator that hates him. Light every corner of the shed, and the car, before he goes over the back seat.',
      params: { size: 8, walls: 'medium', clue: 'The numbered drums say how many lamps stand right beside them. A lamp lights its row and its column until a drum stops it.' },
      evidence: {
        img: 'ev_c8_ashtray', hotspot: { x: 0.30, y: 0.47, r: 0.14 },
        title: 'Cold ash',
        short: 'In the rear ashtray, one cigarette burnt to the filter, unsmoked, its ash fallen. Lit and left, it would burn out in ten minutes; the last time you heard the lid snap was at the Warehouse 6 gate. A Hacks sweet wrapper. Hair oil on the headrest behind the driver, at the height of a man of about 1.70 m sitting straight. One grey hair with no root.',
        text: 'Under six floodlights the back seat looks like what it is: a sofa in a room nobody else is allowed into. Rosli goes over it with a torch and tweezers and talks to himself. The rear ashtray holds one cigarette, burnt down to the filter. The filter is dry and white: nobody\'s lips ever touched it. Its ash has fallen in a little grey drift, shaken off by the road. "Lit and put down," Rosli says. "Ten minutes, maybe twelve, and it is finished." You last heard the lid snap at the gate of Warehouse 6, at a quarter to four, and smelled fresh smoke. After that, all the way to Jugra, nothing. In the seat pocket, a wrapper from a Hacks sweet, the old black and white kind. On the headrest behind the driver\'s seat, a faint dark sheen of hair oil, and Rosli measures it from the seat cushion with his steel tape: a man about one metre seventy, sitting very straight. Caught in the stitching of the headrest, one hair, grey, short, no root on it. Rosli puts it in an envelope by itself. "Hair that falls out on its own has no root," he says. "No root, no proper DNA. Only the mother\'s kind."',
      },
    },
    {
      id: 'c8_dn', phase: 'Jugra', title: 'Knocks on the seat',
      game: 'morse', variant: 'tapcode',
      when: HELD7,
      brief: 'Your phone was in your breast pocket the whole drive, recording, because you are a detective and nobody told you not to. On the recording, under the engine and the wipers, something taps on the back of your seat: Daniel, gagged, with his knuckles, in the prison tap code the two of you learned off a poster on the agency wall, for a joke. He tapped for most of the night to keep his hands from shaking, the old practice lines first, the way you both always did. Decode what he tapped.',
      params: { difficulty: 'medium' },
      evidence: {
        img: 'ev_c8_phone', hotspot: { x: 0.48, y: 0.52, r: 0.15 },
        title: 'HE IS GONE',
        short: 'For an hour and a half Daniel tapped the old practice lines on the back of your seat, steady as a clock. At 3:46, two minutes after the soft sound of the door at Warehouse 6, he stopped the drill and tapped three words, fast: HE IS GONE. The voice went on talking for two more hours.',
        text: 'Two knocks, three knocks; one knock, five. The practice lines off the poster, over and over, the way you both did in the agency when the phone did not ring: nonsense about meetings and keys and the tailor at midnight, tapped on the back of a leather seat by a man with a hood over his head and his wrists tied. It is the most steady you have ever known him. Then, at 3:46 on the phone\'s clock, two minutes after the barrier at Warehouse 6 and the soft sound you took for a parcel, the drill stops dead in the middle of a word. A pause. And three words, fast and hard, his knuckles nearly through the leather: HE IS GONE. Then nothing more from Daniel until Jugra. And all the way to Jugra, the voice went on, beside him and in front of you, thanking you, humming, telling you which road.',
      },
    },

    // ---------------- Shah Alam ----------------
    {
      id: 'c8_04', phase: 'Shah Alam', title: 'The night on one wall',
      game: 'timeline', variant: 'log',
      brief: 'IPD Shah Alam has the crash, and the officer who has it wants to know, politely and then not politely, why a private investigator in the front of a car with no plates did not stop when a police officer was put into a wall behind him. Sergeant Asri gets you a room and a wall anyway. Eight records of the night, some with their clocks smudged. Put them in the order they happened.',
      params: {
        frames: [
          { id: 'a', clock: '02:1▮', title: 'Shop camera, Jalan Tun Sambanthan', text: 'The black car pulls away from the kerb outside Restoran Bala. Three cars later a grey Waja pulls out after it, its lights off until the corner.' },
          { id: 'b', clock: '02:31', title: 'Telco location portal', text: 'A live location request for Farah\'s number. Reference: IPD Dang Wangi report 1401/26, kidnapping.' },
          { id: 'c', clock: '02:3▮', title: 'Hotel driveway camera, Jalan Ampang', text: 'The black car slows under the black band of Menara Sinar and does not stop. On Level 14, one lamp.' },
          { id: 'd', clock: '03:04', title: 'Telco location portal', text: 'A third request for the same number, under the same report.' },
          { id: 'e', clock: '03:1▮', title: 'Prime mover GPS, Murali Transport', text: 'Federal Highway, Batu Tiga, westbound, 88 km/h, two hundred metres ahead of the Waja. It does not slow down.' },
          { id: 'f', clock: '03:12', title: 'Farah\'s phone', text: 'Stops moving, at the divider.' },
          { id: 'g', clock: '03:14', title: '999 call', text: '"A car in the divider. A black jeep drove off, west."' },
          { id: 'h', clock: '03:4▮', title: 'Warehouse 6 gate camera', text: 'The black car stops at the barrier. A 4x4 with one headlight comes alongside on its left.' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The night plays in order. Somebody knew where Farah was before she did, and the highway camera at Batu Tiga was under maintenance from three to half past.',
      },
      evidence: {
        img: 'ev_c8_wall', hotspot: { x: 0.50, y: 0.42, r: 0.20 },
        title: 'Pushed, at 3:12',
        short: 'Somebody asked the telco where Farah\'s phone was three times, from 2:31. At 3:11 a red prime mover was two hundred metres ahead of her and did not slow down. At 3:12 her phone stopped at the divider. At 3:14 a passer-by saw a black jeep leave west. The prime mover belongs to Murali Krishnan of Teluk Gadong, whose driving licence, says JPJ, has been suspended since October.',
        text: 'The highway camera over Batu Tiga, the one that would have settled everything, was "under maintenance" from 3:00 to 3:30, on a work order nobody at the concession can find. Everything else is on Asri\'s wall. The car with no plates leaving Brickfields, and three cars behind it a grey Waja with its lights off until the corner, which is Farah all over. Three live location requests for her phone on the telco\'s police portal, at 2:31, 2:49 and 3:04, all under IPD Dang Wangi report 1401/26, "kidnapping". The car slowing under Menara Sinar at 2:38 with the lamp burning above it. At 3:11 a red prime mover, its GPS reporting 88 km/h in the left lane two hundred metres ahead of her, and at 3:12 her phone stops moving and never moves again. At 3:14 a man rings 999 from beside the wreck: a black jeep drove off, west. The prime mover is registered to Murali Transport, Teluk Gadong, Klang, a company of one. Asri runs the owner through JPJ on his own phone, standing at the wall: Murali Krishnan, 52, licence suspended since October for points. The GPS says he did not slow down at all. His trailer, Shah Alam reports, has a fresh scrape down its left side.',
      },
    },
    {
      id: 'c8_05', phase: 'Shah Alam', title: 'Before and after',
      game: 'spotdiff', variant: 'classic',
      brief: 'Bomba photographed Farah\'s Waja at 3:40, in the divider with its hazard lights still blinking. The tow truck put it in the police yard behind IPD Shah Alam, and at nine o\'clock a constable photographed it again for the file. Asri lays the two prints side by side on the bonnet of a patrol car. Somebody went through the car in between. Find every change.',
      params: { differences: 9 },
      evidence: {
        img: 'ev_c8_waja', hotspot: { x: 0.62, y: 0.57, r: 0.18 },
        title: 'Knee height',
        short: 'Between Bomba\'s photo and the yard\'s, Farah\'s dashcam, phone and purse were gone: taken before the tow, by whoever reached her first. On her left rear door, a long dent with black paint in it, seventy to ninety centimetres off the road: the height of a bull bar on a 4x4. A trailer\'s side rail is at a metre twenty, and it would have left red. Murali\'s scrape is at trailer height, and yellow: the Kapar weighbridge.',
        text: 'In Bomba\'s photo at 3:40 the Waja sits nose into the divider with the driver\'s door hanging open and the airbag slumped over the wheel like washing. On the dashboard, a dashcam on its suction mount. On the passenger seat, a phone on its cable and a black purse. By nine in the police yard all three are gone, and the cable hangs down into the footwell with nothing on it. Shah Alam had her in the hospital as an unknown woman until after five, because there was nothing in the car to say who she was; Asri says he ran the plate when the crash came over the radio, and drove straight there. Down the left rear door, a long crease pushed in from behind, and in the crease, scraped deep into the grey, black paint. Asri holds his tape measure against it: seventy centimetres off the ground at the bottom, ninety at the top. "Bull bar," he says. "Big four-by-four. Not a lorry." The side rail of a prime mover\'s trailer sits at a metre twenty, and the only prime mover on the road was red. Its fresh scrape, when Asri drives out to Teluk Gadong to look, is a metre twenty up and full of yellow paint: the colour of the rails at the Kapar weighbridge.',
      },
    },
    {
      id: 'c8_06', phase: 'Shah Alam', title: 'A black Prado',
      game: 'lineup', variant: 'single',
      brief: 'A black 4x4 drove off west. Shah Alam has already found one: a black Toyota Land Cruiser Prado that filled up at a petrol station in Kota Kemuning, seven kilometres from Batu Tiga, at 2:58. The night attendant, a student from Sabah working his way through a diploma, saw the driver\'s face across the counter for as long as it takes to pay for petrol and a can of coffee. Show him faces, fast.',
      params: { rounds: 3, studySeconds: [10, 8, 6] },
      evidence: {
        img: 'ev_c8_petrol', hotspot: { x: 0.22, y: 0.50, r: 0.15 },
        title: 'A black Prado',
        short: 'Three times out of three the attendant picks the same face: Encik Kamarul, the deputy minister\'s aide from the head table at Sinar\'s dinner, buying petrol and a can of coffee at 2:58 AM in Kota Kemuning in a black Land Cruiser Prado. He has told Klang police he was at home in Ampang, asleep, from eleven.',
        text: 'The attendant is nineteen and has a very good memory for faces, because he is studying hospitality and they told him it matters. Three rounds, three times the same man: early forties at most, side-parted hair, square glasses, a good shirt with the sleeves rolled. He paid for ninety ringgit of petrol and a can of iced coffee in cash and asked for no receipt, at 2:58 by the till. The car outside pump four on the forecourt camera is a black Toyota Land Cruiser Prado, smaller than a Land Cruiser and smoother, with a chrome grille and nothing on its front at all. Asri knows the face before you do. Kamarul Zaman bin Hashim, special aide to a deputy minister, who sat at the head table at Sinar\'s dinner a fortnight ago and lied to Farah about a balcony; Farah wrote it in her report, and the report went to his minister. To Klang police, yesterday morning, he said he was at home in Ampang from eleven o\'clock and asleep.',
      },
    },
    {
      id: 'c8_jx', phase: 'Shah Alam', title: 'Three cars behind her',
      game: 'lineup', variant: 'single',
      when: (f) => !!f.JASON_FREE,
      brief: 'Jason Ooi drives for the Office of the Chairman now, a grey sedan, WXY 1408, and on Monday night he was told to follow the car that followed the car. He rings you from a payphone in Klang because he says he does not trust his own. He saw the face at the wheel of the 4x4 for a second, when its interior light came on. He has never been good with faces. Help him.',
      params: { rounds: 3, studySeconds: [9, 7, 5] },
      evidence: {
        img: 'ev_c8_sticker', hotspot: { x: 0.50, y: 0.50, r: 0.15 },
        title: 'Three cars behind her',
        short: 'Jason was behind Farah, on orders. At 3:11 the 4x4\'s interior light came on and he saw a moustached man in a cap with a phone to his ear: he picks Roslan Daud three times. At 3:44, from the Westport road, he saw the black car and the 4x4 side by side at the Warehouse 6 gate. And he kept something: a photograph of the 4x4\'s rear window, with a fleet sticker, F-03.',
        text: 'The Office told him: follow the inspector, three cars back, do nothing, report nothing, wash the car in the morning. He did all of it except the last. At 3:11 the black 4x4 overtook him on the left with no lights, and for one second its interior light came on: a broad man, a heavy moustache, a cap, a phone at his ear. Three times Jason picks the same face from the fleet photographs Asri pulls up, and the third time he does not hesitate: Roslan Daud. After the crash he did what frightened men do and kept driving, west, behind nothing, and at a quarter to four, from the Westport road, he saw the gate of Warehouse 6 lit up like a stage: the black car at the barrier, and a 4x4 with one headlight pulled up beside it, on the left, touching. Then he did the other thing frightened men do, the thing you have come to rely on. He kept something. On his phone, from earlier, at a red light in Klang: the back of the 4x4, its rear window, and on the glass a small white fleet sticker, F-03.',
      },
    },

    // ---------------- Batu Road ----------------
    {
      id: 'c8_07', phase: 'Batu Road', title: 'Leong Brothers',
      game: 'witness', variant: 'statement',
      brief: 'Leong Brothers Tailor has been on Jalan Tuanku Abdul Rahman since 1958 and there is only one brother left. Mr. Leong Kam Wah is eighty-one, sits in his singlet behind a counter of bolts of cloth, and has been expecting you since Tuesday morning, because, he says, somebody always comes in the end. He will tell it once, slowly, in English, and then he will go back to his machine.',
      params: {
        readSeconds: 110,
        pass: 7,
        header: 'Statement of Leong Kam Wah, 81, Leong Brothers Tailor, Jalan Tuanku Abdul Rahman. Recorded Tuesday, 4:15 PM.',
        introLine: 'He takes off his half-moon glasses, folds them, and puts them in his singlet. "I will say it once. I am old, but I am not stupid."',
        retryLine: 'He sighs, unfolds his glasses again, and tells it the same way, word for word, like a man reading a measurement off a card.',
        statement: [
          'My brother and I opened this shop in 1958. My brother died in 1999. Since then it is only me, and the machine, and the boy who comes on Saturdays to sweep.',
          'The first time was December 1986. A car stopped outside after midnight, and a man I did not know came to the door and said, my Tuan needs a shirt. I took my tape and went out to the car. The light inside was off. He said, keep it off. So I measured him in the dark, in the back of the car, by touch. I have done it that way ever since.',
          'Three white shirts a year, every year, for forty years. Collar fifteen and a half. Sleeve thirty-three. The right cuff three-quarters of an inch wider than the left, for the watch. Always the same. He has not grown fat, and he has not grown thin.',
          'The car comes, I go out with my tape, I measure in the dark, I come back in. The money comes the morning after, in cash, in an envelope under my door. Never late. Never one ringgit wrong.',
          'Last night they told me to have one more shirt ready. Not for the usual time. A shirt for a long journey, he said, when I measured him in November. I had it ready at two o\'clock. The window came down, a hand took it, and the window went up.',
          'Forty years, and I have never seen his face. I know his collar better than my own son\'s. Sei sap nin. I have never seen his face.',
        ],
        questions: [
          { q: 'When did Leong Brothers open?', options: ['1948', '1958', '1968', '1986'], a: 1 },
          { q: 'When did Mr. Leong first measure the man in the car?', options: ['November 1985', 'December 1986', 'January 1987', 'December 1997'], a: 1 },
          { q: 'How did he measure him?', options: ['In the shop, with the shutter down', 'In the back of the car, in the dark, by touch', 'From an old shirt', 'From a photograph'], a: 1 },
          { q: 'How many shirts a year?', options: ['One', 'Two', 'Three', 'Six'], a: 2 },
          { q: 'What is the collar size?', options: ['14½', '15', '15½', '16'], a: 2 },
          { q: 'Which cuff is cut wider?', options: ['The left', 'The right', 'Both', 'Neither'], a: 1 },
          { q: 'Why is it wider?', options: ['For a bracelet', 'For a watch', 'For a bandage', 'For cufflinks'], a: 1 },
          { q: 'How is Mr. Leong paid?', options: ['By cheque, every month', 'In cash, the morning after, under his door', 'By bank transfer', 'In cash, in the car'], a: 1 },
          { q: 'What did the man call last night\'s shirt?', options: ['A shirt for a wedding', 'A shirt for a funeral', 'A shirt for a long journey', 'A shirt for the dinner'], a: 2 },
        ],
      },
      evidence: {
        img: 'ev_c8_tape', hotspot: { x: 0.35, y: 0.40, r: 0.16 },
        title: 'Measured in the dark',
        short: 'Since December 1986 Mr. Leong has made three white shirts a year for a man he measures by touch in the back of a car with the light off: collar 15½, sleeve 33, the right cuff three-quarters of an inch wider "for the watch". Last night\'s parcel was "a shirt for a long journey". "Forty years, and I have never seen his face."',
        text: 'He measures you, while he talks, without asking, out of habit: a tape round your neck, cold, and his old fingers reading it like braille. Collar fifteen and a half, sleeve thirty-three, the right cuff three-quarters of an inch wider than the left, "for the watch", written on a card in a drawer that has held the same card since 1986. Three white shirts a year, for forty years, always the same, never fatter, never thinner. A car after midnight, a voice that says keep the light off, the back seat in the dark, and an old man with a tape measure who has learned a body by touch and never once seen the face on top of it. Money the morning after, under the door. And last night, out of season, a fourth shirt: the man asked for it in November, "a shirt for a long journey", and Mr. Leong did not ask where to. When you ask him whether he was ever afraid, he looks at you over his half-moon glasses for a long time. "Of a collar fifteen and a half?" he says. "No. Of the car, yes. Forty years. Every time."',
      },
    },
    {
      id: 'c8_08', phase: 'Batu Road', title: 'Old names',
      game: 'crossword', variant: 'classic',
      brief: 'Brickfields Road, Birch Road, Batu Road, Mountbatten Road, Foch Avenue, Treacher Road. Every street he named in the car had another name by the time you were born. Mr. Leong sends you two doors down to the kopitiam, where Uncle Chong, who drew the city\'s road plans for DBKL for thirty-four years, keeps the old street directory in his head and will not open it until his Sunday crossword is finished. It is Tuesday. He is still stuck.',
      params: { size: 13 },
      evidence: {
        img: 'ev_c8_directory', hotspot: { x: 0.82, y: 0.48, r: 0.15 },
        title: 'A city that is not there any more',
        short: 'Every street he named had been renamed by the early 1980s: Batu Road is Jalan Tuanku Abdul Rahman, Birch Road is Jalan Maharajalela, Brickfields Road is Jalan Tun Sambanthan, Mountbatten Road is Jalan Tun Perak, Treacher Road is Jalan Sultan Ismail, Foch Avenue is Jalan Tun Tan Cheng Lock. He learned Kuala Lumpur before then, and he never learned it again.',
        text: 'Uncle Chong fills in the last word with a flourish, takes off his reading glasses, and recites the city for you as it was. Batu Road, Jalan Tuanku Abdul Rahman. Birch Road, Jalan Maharajalela. Brickfields Road, Jalan Tun Sambanthan. Mountbatten Road, Jalan Tun Perak. Treacher Road, Jalan Sultan Ismail. Foch Avenue, Jalan Tun Tan Cheng Lock. "All changed," he says, "most of them by eighty-one, eighty-two. I drew the new signs myself." Nobody your age uses the old names. Taxi drivers stopped using them before they died. A man who says Batu Road without thinking about it learned the city before the signs came down, and never once in forty years had a reason to learn it again. Uncle Chong taps the crossword. "Your friend in the car," he says. "He drives in a town that is not there any more. Like me."',
      },
    },
    {
      id: 'c8_09', phase: 'Batu Road', title: 'The room above the sari shop',
      game: 'wiretap', variant: 'classic',
      brief: 'Farah rang Asri from Bala Anne\'s wall phone at 11:40 PM, and somebody knew by two o\'clock that she would be three cars behind. In August you found a relay on Bala Anne\'s line. It is still there, only now it goes across the road: the copper pair runs over Jalan Tun Sambanthan on the old telephone poles to a room above a sari shop, rented for cash "for the Office". Somebody tore the box out in a hurry this morning. Wire it back up, every line live.',
      params: { size: 6, targets: 3, clue: 'Asri: "Whoever rented this room only cared about one window. The chair is facing Bala\'s."' },
      evidence: {
        img: 'ev_c8_recorder', hotspot: { x: 0.48, y: 0.76, r: 0.12 },
        title: 'Played back at 1:10',
        short: 'The BALA relay is live, rerouted to a voice recorder in a rented room above a sari shop across the road, a chair facing Bala Anne\'s window. It recorded Farah\'s 11:40 PM call to Asri: "Three cars behind, in my Waja." At 1:10 AM somebody dialled in and played it back. The call came from a number Farah has known for eleven years: Superintendent Khairul\'s.',
        text: 'The room above the sari shop is three metres square and smells of mothballs and incense from the shop below. One plastic chair, turned to face the window, and through the window, across the road, the steel counter and the wall phone of Restoran Bala. The landlady says the rent is paid in cash on the first of every month, "for the Office", by a young man she would not know again. Wired back up, the grey box under the window is a voice-activated recorder with a dial-in line, the kind that lets a man listen to his tapes from anywhere. Its log is plain. 23:40:12, recording, BALA, three minutes: Farah, tired, to her sergeant. "Asri. Three cars behind, in my Waja. If he turns, I turn." And at 01:10:44, an incoming call, PIN entered, playback of that one message, then hang-up. Asri reads the calling number off the display twice before he says it aloud, and when he does, he says it to the floor. It is a number Farah has known for eleven years, and so does every officer in D9. Superintendent Khairul Anuar\'s.',
      },
    },

    // ---------------- Bukit Bintang ----------------
    {
      id: 'c8_10', phase: 'Bukit Bintang', title: 'A hero with her purse',
      game: 'pursuit',
      brief: 'On Tuesday afternoon Ken Lim rings from his shop on the third floor of Low Yat Plaza. A boy is going from counter to counter trying to sell a phone with a cracked screen and a sticker of a cat on the back: Farah\'s phone. Ken keeps him talking about the price while you come up the escalators. The boy sees your face, and Ken\'s face looking at your face, and runs.',
      params: {
        setting: 'city',
        route: ['city', 'market', 'rooftop', 'city'],
        legs: 4,
        beats: [
          'Out of Low Yat\'s side doors into Bukit Bintang, through the crowds at the crossing and the touts with their laminated menus.',
          'Into Jalan Alor as the hawkers light their woks: plastic stools, ice boxes, a waiter with six plates of satay up one arm.',
          'Up a fire stair behind a massage parlour and across the old shophouse roofs toward Pudu, KL Tower lit up ahead of you.',
          'Down a drainpipe into the back lanes off Jalan Pudu, among the kitchen doors and the cats.',
        ],
        difficulty: 'medium',
        vehicle: 'foot',
        suspect: 'Jam',
        skyline: 'kl',
        clue: 'He runs like a boy who has done nothing worse than this, and is not sure yet.',
      },
      evidence: {
        img: 'ev_c8_purse', hotspot: { x: 0.50, y: 0.58, r: 0.20 },
        title: 'A hero with her purse',
        short: 'Nizam "Jam" Jamaluddin, 24, e-hailing driver. At 3:13 he stopped, pulled Farah out of the car and rang 999 at 3:14. Then he took her phone, her dashcam and her purse. He sold the dashcam\'s card to a stall that wiped it before he remembered what was on it. Ken: "Give me a night."',
        text: 'You bring him down behind a dim sum kitchen with a tray of steamer baskets still rolling. He is twenty-four, an e-hailing driver with a rented Myvi and a mother in Kuantan, and he cries before you ask him anything. At 3:13 on Tuesday he came round the bend at Batu Tiga and found a car in the divider with its hazards going. He stopped. He pulled the driver out through the passenger side because her door was crushed, and laid her on the verge, and rang 999 at 3:14, and held her hand until he heard sirens. Then, he does not know why, he took her phone from the seat and the dashcam from the windscreen and her purse, and drove away. He has been sick about it since. The purse is in his car, every ringgit still in it, and her warrant card. The phone he was trying to sell. The dashcam\'s memory card he sold on Tuesday morning to a stall on the second floor, which wipes every card it buys before it sells it again. Ken holds up the little card in its plastic case. "Wiped is not gone," he says. "Give me a night."',
      },
    },
    {
      id: 'c8_11', phase: 'Bukit Bintang', title: 'Five pieces',
      game: 'tape', variant: 'splice',
      brief: 'Ken works all night in the back of his shop with the shutter down and three fans going, and at six in the morning he has carved five fragments of video and sound off the wiped card: what was left in the parts of it the stall\'s machine did not bother to overwrite. They are out of order. One of them is Farah\'s voice. Put them back the way they happened.',
      params: {
        line: FARAH_LINE,
        pieces: 5,
        label: 'DASHCAM · WQE 8812 · RECOVERED',
        clue: 'Ken: "The camera records sound from inside the car. She was on the phone."',
      },
      evidence: {
        img: 'ev_c8_dashcam', hotspot: { x: 0.53, y: 0.31, r: 0.15 },
        title: 'F-03',
        short: 'In order, Farah\'s last words on the phone to Asri: "A black four-by-four with no lights is coming up on my left. If anything happens, it was not an accident." The video: a black Land Cruiser with a bull bar and no front plate, its interior light on, a moustached man in a cap with a phone to his ear. On its rear side window, a fleet sticker: F-03.',
        text: 'Spliced, it is eleven seconds. Farah\'s voice, close, level, the voice she uses at a door before she kicks it: "Asri. A black four-by-four with no lights is coming up on my left. If anything happens, it was not an accident." On the video, in the dashcam\'s wide fisheye, a black Land Cruiser fills the left side of the frame, close enough to touch, a heavy steel bull bar across its front and no plate under it. Its interior light is on. At the wheel, a broad man in a sun-faded cap with a heavy moustache and a phone pressed to his ear, looking not at the road but at her. Then the frame jerks, and the bull bar comes in, and the card ends. Ken freezes the one frame where the 4x4 has drawn level and zooms on its rear side window: a white fleet sticker, F-03. Asri listens to the sound three times with his eyes shut. "That is what she said to me," he says. "Word for word." Sinar Cold Chain\'s fleet register has one black Land Cruiser with a bull bar, F-03, plate WVT 3022, and one driver for it since 2003.',
      },
    },

    // ---------------- Batu Road, again ----------------
    {
      id: 'c8_12', phase: 'Batu Road', title: 'The order book',
      game: 'kakuro', variant: 'classic',
      brief: 'Mr. Leong\'s order books go back to 1958, one a year, and the book for 1986 lived for twenty years under a leaking window, so the figures have run into blotches. The old man checked every order across and down, as tailors of his generation did, and wrote the sums in the margins. Put the figures back from the sums.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c8_orderbook', hotspot: { x: 0.55, y: 0.45, r: 0.20 },
        title: 'A black band, 2 December 1986',
        short: 'The first order for "Tuan" in Mr. Leong\'s book, Tuesday 2 December 1986: one white shirt, collar 15½, and one black mourning band. Paid in cash, the morning after. Every order since, three a year, forty years: paid in cash the morning after, without fail.',
        text: 'Under the blotches, in a young man\'s neat figures, the page for Tuesday 2 December 1986. Between a school uniform for a boy in Sentul and a wedding suit for a man from Kajang: one line, no address, no telephone, the customer\'s name written as one word, Tuan. One white shirt, cotton, collar fifteen and a half, sleeve thirty-three, right cuff three-quarters wider. And one black mourning band, the kind a man wears on his sleeve for forty days. Paid: cash, 3/12. Mr. Leong reads it over your shoulder and shakes his head slowly. He does not remember the band, he says. He remembers only that it was raining, and that he was told to keep the light off. After that, three lines a year in every book, forty years, the same measurements to the eighth of an inch, every one marked paid in cash the next morning. Rule seven, on a card in the boot of a car: pay in cash, the morning after. He has kept that rule since the week he first wore black for somebody.',
      },
    },

    // ---------------- Sentul ----------------
    {
      id: 'c8_13', phase: 'Sentul', title: 'Bengkel Seng Lee',
      game: 'getaway', variant: 'classic',
      brief: 'Sinar Cold Chain says F-03 has been in its own workshop since Saturday. It is not there. Asri finds it the old way, by ringing every panel beater between Kepong and Sentul who owes him a favour: Bengkel Seng Lee, Jalan Sentul, booked in at seven on Tuesday evening for "a cow at Kapar", a new bull bar and a new left headlight. By the time Hamidah\'s warrant arrives the yard has boxed it in with wrecks and gone to lunch. Drive it out.',
      params: { difficulty: 'hard', target: 'F-03', clue: 'Asri: "Cars only go forwards and back. So does a Land Cruiser, whatever the owner thinks."' },
      evidence: {
        img: 'ev_c8_bullbar', hotspot: { x: 0.40, y: 0.60, r: 0.15 },
        title: 'The old bull bar',
        short: 'F-03 has a new bull bar and a new left headlight. The old bull bar is in the scrap pile, with grey paint from Farah\'s door packed into its tubes. In the glovebox, the car\'s logbook: "Ekor. 2003 to. R. Daud." Monday night: out 01:40, back to the yard at 09:50; into the workshop at 19:00 on Tuesday. Behind the sun visor, folded small, a printed order he should have shredded.',
        text: 'In daylight F-03 is a black Land Cruiser with a fresh bull bar so new its welds are still blue, a new left headlight, and the mud of three districts in its wheel arches. Its front plate is in the glovebox. The old bull bar is behind the shed in the scrap pile, bent at the left end, and when Asri shines his torch into its tubes they are packed with flakes of grey paint, Proton\'s Armour Silver, the colour of Farah\'s Waja. No hair, no hide, no cow. In the glovebox, a fleet logbook in one man\'s handwriting for twenty-three years, every page headed the same way: "Ekor. 2003 to. R. Daud." The tail, from 2003 to nobody has written when. Monday night: out 01:40, in 09:50, and in the kilometres column a number that is Kuala Lumpur to Pulau Indah to somewhere a long way south and back. Behind the driver\'s sun visor, folded into a square the size of a matchbox, a sheet he was meant to shred. OFFICE OF THE CHAIRMAN. 1 December. Three lengths behind the inspector first. Then the Tuan. Nothing on the phones.',
      },
    },

    // ---------------- Pulau Indah ----------------
    {
      id: 'c8_14', phase: 'Pulau Indah', title: 'The gate at 3:44',
      game: 'maze', variant: 'cameras',
      brief: 'Back at the gate of Warehouse 6 in daylight, where you sat with your window down looking at Bay 3. Sinar\'s security plan of the gate is on Rosli\'s tablet: the barrier, the guard cabin, the drain and its service road, the Westport road, and six cameras. If a man left the black car while you were looking the other way, he had to walk somewhere no camera sees. Trace the way.',
      params: {
        map: [
          '#####################',
          '#G.....#.......#...W#',
          '#.###..#.#####.#.#..#',
          '#...#....#...#...#..#',
          '###.######.#.#####.##',
          '#.........#.#.......#',
          '#.#######.#.#######.#',
          '#.#.....#.S.#.....#.#',
          '#.#.###.#####.###.#.#',
          '#...#.........#.....#',
          '#####.#######.#######',
          '#.........#.........#',
          '###########D#########',
        ],
        cameras: [
          { x: 1, y: 3, dir: 'N', range: 2 },
          { x: 18, y: 3, dir: 'N', range: 2 },
          { x: 19, y: 6, dir: 'S', range: 3 },
          { x: 11, y: 3, dir: 'S', range: 2 },
          { x: 5, y: 11, dir: 'E', range: 3 },
          { x: 17, y: 9, dir: 'W', range: 2 },
        ],
        exits: { G: 'The guard cabin and the barrier', W: 'The Westport road', D: 'The service road along the drain' },
        startLabel: 'CAR',
        startName: 'The black car at the barrier, its rear left door',
        aria: 'Plan of the gate of Warehouse 6, Pulau Indah, with its cameras',
        answer: 'D',
      },
      evidence: {
        img: 'ev_c8_reflection', hotspot: { x: 0.56, y: 0.40, r: 0.15 },
        title: 'A door at 3:45',
        short: 'The only way from the black car that no camera sees is the service road along the drain, onto the car\'s left side, where a 4x4 can wait in the dark. The gate cabin camera never looked at it, but it caught the black car\'s rear window, and in the glass, reflected: one broken headlight at 3:44, and at 3:45 the rear left door opening.',
        text: 'Six cameras, and every one of them watches what a guard would want watched: the barrier, the cabin, the Westport road, the yard. Nobody ever pointed one at the drain. Along it runs a service road of broken concrete, unlit, used by the men who clear the grilles in the monsoon, and it comes up to the gate on the left of the barrier, the left side of a car waiting there, the side you were not looking at. The gate cabin\'s own camera, aimed at the barrier arm, has the black car\'s back end in the bottom of its frame all night, and the back window of a long black saloon at night is a mirror. At 3:44:10, in the glass, a single headlight comes up on the left and stops: the right one, the left one dark and broken. At 3:45:02 the reflection of the rear left door swings out, and a pale shape crosses the glass, and the door swings shut. At 3:48 the black car moves off south. The 4x4 sits a minute longer with its one light off, and goes north up the drain road toward the Kesas. You were looking at Bay 3. You were told to.',
      },
    },
    {
      id: 'c8_az', phase: 'Pulau Indah', title: 'Crane 12',
      game: 'rotation', variant: '3d',
      when: (f) => !!f.AZMAN_ALIVE,
      brief: 'Azman Yusof drives a quay crane at Westport now, on nights, and the spreader camera on Crane 12 looks straight down on the Pulau Indah road where it passes the gate of Warehouse 6. Its recorder still writes every frame mirrored, because nobody in the port has fixed one in thirty years. He brings you the clip on a thumb drive in a sweet tin. Read it the right way round.',
      params: { trials: 12, target: 10, options: 4 },
      evidence: {
        img: 'ev_c8_crane', hotspot: { x: 0.42, y: 0.42, r: 0.13 },
        title: 'Crane 12',
        short: 'From forty metres up, the right way round: at 3:45 a black car at the barrier, and on its left side a 4x4 with one headlight. A man in a white shirt gets out of the back of the car, walks the six steps to the 4x4 and gets in. He does not look up. Then the car drives on south.',
        text: 'From forty metres above, a gate is a toy. The barrier, the cabin, the dark strip of the drain. At 3:44 a long black saloon stops at the barrier and sits there. A black 4x4 comes down the drain road with one headlight and pulls up on its left, touching. At 3:45 the saloon\'s rear left door opens and a man gets out: all you can see of him from forty metres is the top of a head and a white shirt, very white in the floodlights, and the shadow it throws on the concrete. He walks the six steps to the 4x4 without hurrying and gets into the back of it. He does not look up at the crane. Nobody ever looks up at the crane, Azman says; that is why he likes it there. The saloon\'s door shuts. At 3:48 the saloon goes south with you in the front of it. Azman closes the sweet tin. "I did not know it was you driving," he says. "I would not have let you go."',
      },
    },
    {
      id: 'c8_15', phase: 'Pulau Indah', title: 'Two back seats',
      game: 'dna', variant: 'mixed',
      brief: 'Dr. Harjit Kaur at Hospital Tengku Ampuan Rahimah in Klang owes Rosli for a fire she does not talk about. She takes swabs from the back seat of F-03 on Wednesday morning, and the grey hair from the black car\'s headrest, and reads her bands at her bench with the door locked. Some of what she finds belongs to people in the police database. Some of it does not.',
      params: { suspects: 7 },
      evidence: {
        img: 'ev_c8_hair', hotspot: { x: 0.52, y: 0.62, r: 0.13 },
        title: 'A man in no file',
        short: 'On F-03\'s seat belt, Roslan\'s sweat. On its back seat, grey hairs with no root. Rootless hair gives only mitochondrial DNA, the kind passed down from a mother. It matches the hair from the black car\'s headrest exactly. It matches nobody in any database in Malaysia. Behind your seat, and in the back of F-03 an hour later: the same mother\'s line.',
        text: 'Dr. Harjit Kaur explains it twice, because the second time she can see you understand it. The driver\'s seat belt of F-03: sweat, a full profile, which matches the coffee mug Asri took from Roslan Daud\'s locker at Westport. The back seat: four grey hairs, short, none with a root, the kind that fall out on their own. A hair without its root has no nucleus worth the name, so it cannot give a man\'s full DNA, only the small kind that lives in the cell\'s machinery and is handed down unchanged from a mother to all her children. She reads it against the hair from the black car\'s headrest. Identical, letter for letter. Then she runs it against everything she is allowed to run it against and a few things she is not: the police database, the prisons, the national mitochondrial reference, the unknown dead. Nothing. "It is a man who has never been arrested, never been in a mass grave, never given blood to a hospital that kept it," she says. "Or it is his brother, or his mother\'s sister\'s son. That is all a hair like this will ever say." Somebody of one mother\'s line sat behind your seat at 2:10, and in the back of F-03 at 3:45.',
      },
    },

    // ---------------- Jugra ----------------
    {
      id: 'c8_16', phase: 'Jugra', title: 'Pak Itam',
      game: 'riddles', variant: 'mixed',
      brief: 'The watchman at the Jugra gate is a thin old man in a faded batik shirt and a kain pelekat with a bunch of keys on a string round his neck, and everybody in Jugra calls him Pak Itam. He will not answer a question. He answers in pantun: "Pulau Pandan jauh ke tengah, Gunung Daik bercabang tiga; hancur badan dikandung tanah, budi yang baik dikenang juga." Then he sets you riddles of his own, and he will tell you nothing until you have answered them.',
      params: { riddles: 4, situations: 2, reveals: 4 },
      evidence: {
        img: 'ev_c8_ricetin', hotspot: { x: 0.44, y: 0.58, r: 0.15 },
        title: 'The telephone in the rice tin',
        short: 'A call came to Pak Itam\'s hut at 5:30: open the door when the car stops, take the telephone, close the door, do not look at the driver. He kept the Nokia in his rice tin. Its log: one incoming call at 3:43, lasting 1 hour 57 minutes. "Forty years I keep the gate. He never gets out at the gate."',
        text: 'Answered, he laughs, and pours you kopi from a flask into two glasses that have never been washed with soap, and tells it plainly, in the Malay of the Kuala Langat coast. At half past five the old telephone in his hut rang, and a voice told him what to do. Open the back door when the car stops. Take the telephone off the seat. Close the door. Do not look at the driver. So he did not look at you. He put the telephone in the place he puts everything that matters, the rice tin, and went back to bed. The Nokia is an old grey one with a cracked antenna, on loudspeaker, its battery nearly flat. Its call log has one line: incoming, 03:43, duration 1:57:12. A call made from somewhere else to a telephone lying on a back seat, from a minute before the gate of Warehouse 6 until the car stopped at Jugra. When you ask him whether Tuan was in the car, Pak Itam shrugs. "Forty years I keep the gate," he says. "He never gets out at the gate." And when you ask him whether he has ever seen Tuan\'s face, he answers you with another pantun, and you never find out what it meant.',
      },
    },

    // ---------------- Klang ----------------
    {
      id: 'c8_17', phase: 'Klang', title: 'Two hundred metres ahead',
      game: 'interrogation', variant: 'classic',
      brief: 'Murali Krishnan sits in the cab of his red prime mover in his own yard at Teluk Gadong, because he says it is the only place he can think, with a thermos bag at his feet that he keeps touching with his heel. His wife watches from the kitchen door. He was two hundred metres ahead of Farah when she went into the wall. One thing he tells you is not true. Find it, and put the exhibit that breaks it in front of him.',
      params: {
        setting: 'The cab of a red prime mover, Murali Transport yard, Teluk Gadong, Klang. Wednesday, 7:20 PM.',
        suspect: {
          id: 'murali', voice: 'voice_3', name: 'Murali Krishnan', role: 'Owner-driver, red prime mover, Teluk Gadong, 52',
          persona: 'Tired, warm, frightened Klang Tamil lorry driver in his fifties: Malaysian English full of "aiyo", "anne" and "lah", the odd Tamil word to himself ("kadavule"). Talks too much when afraid and goes quiet when he is about to lie. Proud of his lorry and ashamed of his licence. Keeps touching the thermos bag at his feet with his heel. Breaks, if he breaks, over his wife and his daughter\'s school fees, not over the police.',
        },
        facts: [
          { id: 'f1', topic: 'his lorry', claim: 'This is my lorry, anne. Mine. Twenty-two years I paid for it. Murali Transport, one man, one lorry.' },
          { id: 'f2', topic: 'Sinar', claim: 'I haul reefers for Sinar Cold Chain and anybody who pays. Sinar pays on time. That is all I know about Sinar.' },
          { id: 'f3', topic: 'that night', claim: 'Monday I took fish up from Westport to Shah Alam and came back empty on the Federal.' },
          { id: 'f4', topic: 'his hours', claim: 'Fifteen hours I was driving. You know what that is? Your eyes are open but nobody is home.' },
          { id: 'f5', topic: 'his family', claim: 'My wife has a thosai stall in Teluk Gadong. My daughter is in Form Five. Somebody has to pay.' },
          { id: 'f6', topic: 'the inspector', claim: 'I am sorry about the lady inspector. Truly. I heard on the radio. Aiyo.' },
          { id: 'f7', topic: 'his trailer', claim: 'My trailer is red. Everybody in Klang knows my red trailer.' },
        ],
        lies: [
          { id: 'l1', topic: 'where he was at three', claim: 'By three o\'clock I was already in the depot in Klang, anne. Sleeping in the cab.', truth: 'At 3:11 his GPS put him on the Federal Highway at Batu Tiga, two hundred metres ahead of Farah, at 88 km/h.', exposedBy: 'e1' },
          { id: 'l2', topic: 'the scrape', claim: 'That scrape on my trailer? The divider at Kapar, last week. Nothing to do with anything.', truth: 'The scrape is from the Kapar weighbridge, yellow paint at trailer height; the paint on Farah\'s car is black, at bull-bar height. It proves nothing against him, but he lied about where it came from because he was frightened.', exposedBy: 'e2' },
          { id: 'l3', topic: 'his licence', claim: 'My licence is in order. Twenty-five years, clean.', truth: 'JPJ suspended his licence in October; he has been driving anyway because he cannot afford to stop.', exposedBy: 'e1' },
        ],
        evidence: [
          { id: 'e1', title: 'Pushed, at 3:12', text: 'His prime mover\'s GPS: 3:11, Federal Highway, Batu Tiga, 88 km/h, two hundred metres ahead of Farah, and it never slowed. JPJ: Murali Krishnan, licence suspended since October.' },
          { id: 'e2', title: 'Knee height', text: 'The paint in the dent on Farah\'s door is black, seventy to ninety centimetres off the road: a bull bar. His trailer is red, its rail is at a metre twenty, and its fresh scrape is full of yellow paint from the Kapar weighbridge.' },
          { id: 'e3', title: 'A black Prado', text: 'Encik Kamarul\'s black Land Cruiser Prado at a Kota Kemuning petrol station at 2:58. It has no bull bar.' },
          { id: 'e4', title: 'Nobody got out here', text: 'At the Jugra gate only one pair of flip-flops came to the car\'s rear left door, and went away again.' },
          { id: 'e5', title: 'F-03', text: 'Farah\'s dashcam: a black Land Cruiser with a bull bar and its interior light on, a moustached man in a cap at the wheel, fleet sticker F-03.' },
        ],
        secret: 'He saw it all in his mirror: a black Land Cruiser with its interior light on overtook Farah on the left and put her into the divider. He drove on because his licence is suspended and he had been driving for fifteen hours, and if he stopped he would lose the lorry. His dashcam saw it too, and the card is hidden in his thermos bag. At 3:44, queueing for Westport, the same camera caught the black car and the 4x4 side by side at the Warehouse 6 gate.',
        suggested: [
          'Where were you at three o\'clock?',
          'How did your trailer get scraped?',
          'Is your licence in order?',
          'What did you see in your mirror?',
          'Why didn\'t you stop?',
          'Do you have a dashcam?',
          'Who do you haul for?',
        ],
        maxQuestions: 14,
        clue: 'Asri, from the step of the cab: "He keeps kicking that thermos bag. A man does not kick his own dinner."',
      },
      evidence: {
        img: 'ev_c8_thermos', hotspot: { x: 0.50, y: 0.55, r: 0.15 },
        title: 'What his mirror saw',
        short: 'Caught in one lie, Murali unzips the thermos bag: his dashcam\'s card, hidden since Tuesday. At 3:13, the black Land Cruiser passes him on the right with its interior light on, a man in a cap on the phone. At 3:44, queueing for Westport, his camera caught the black car and the 4x4 side by side at the Warehouse 6 gate. He drove on because his licence is suspended and he had been driving for fifteen hours.',
        text: 'He does not argue. He looks at his wife in the kitchen doorway for a long time, and then he bends down and unzips the thermos bag at his feet and takes out, from under a tiffin carrier of cold rice, a dashcam memory card in a plastic sleeve. "I saw in the mirror," he says. "Everything. The jeep with its light on, coming up on her left. Then bang. Then her car going round and round in my mirror like a toy. Aiyo, anne. My foot wanted to stop. My licence is finished since October. Fifteen hours I was driving. If I stop, the police come, the lorry goes, my daughter does not finish school." On the card, at 3:13, the black Land Cruiser comes past his cab on the right at speed, its interior light still on, the man in the cap still with a phone to his ear. And at 3:44, while Murali queues in the dark on the Pulau Indah road for the Westport gate, the camera on his dashboard looks straight across at the gate of Warehouse 6: a black car at the barrier, and a 4x4 with one headlight pulled in on its left, side by side.',
      },
    },

    // ---------------- Bukit Aman ----------------
    {
      id: 'c8_18', phase: 'Bukit Aman', title: 'Three pings',
      game: 'ledger', variant: 'classic',
      brief: 'The telco bills the police for every live location request, and once a week it prints D9\'s charges by login for Bukit Aman\'s audit office, which files them unread. Asri gets the printout from a clerk who owes him lunch, and the telco\'s own sheet from Farah\'s friend there. Somebody edited the sheet on Tuesday at 7 AM, three cells, so that it no longer matches the paper. Find them, and put back what they said.',
      params: {
        rows: 6, cols: 5, altered: 3, restore: true, currency: 'RM', magnitude: 'hundreds',
        rowLabels: ['Insp. R. Tan', 'ASP N. Hakim', 'Kpl. F. Ismail', 'Supt. K. Anuar', 'D9 duty desk', 'Insp. F. Iskandar'],
        colLabels: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue'],
        clue: 'The audit office\'s printout is from Tuesday at midnight. The telco\'s sheet was edited at 7 AM the same morning, while Farah was in surgery.',
      },
      evidence: {
        img: 'ev_c8_portal', hotspot: { x: 0.25, y: 0.32, r: 0.15 },
        title: 'Three pings',
        short: 'Restored: three live location requests for Farah\'s number early on Tuesday, at 2:31, 2:49 and 3:04, each under IPD Dang Wangi report 1401/26, "kidnapping". There is no report 1401/26. All three came from one laptop on a home line in Bangsar: Superintendent Khairul\'s house.',
        text: 'Put back as the audit office printed them, the three cells are three requests, each charged at the telco\'s police rate, each for one number: Farah\'s. 02:31. 02:49. 03:04. Each one sent her phone\'s position, live, to the screen that asked, and each one cites the same authority, IPD Dang Wangi report 1401/26, kidnapping. Dang Wangi\'s register for this year ends at 1388. There is no report 1401/26, and there never was. The telco\'s log gives the address the requests came from: a home broadband line in Bangsar, a terrace house on a quiet street off Jalan Maarof, registered to Khairul Anuar. Three positions, eighteen minutes apart and then fifteen, each one closer to the place where a black 4x4 caught up with her. And somebody went into the sheet at seven o\'clock on Tuesday morning, while she was on the table at Hospital Shah Alam, to make the three requests look like three ordinary ones on somebody else\'s line. Asri folds the printout into his notebook very carefully, like something that could still go off.',
      },
    },
    {
      id: 'c8_19', phase: 'Bukit Aman', title: 'The fleet room',
      game: 'whoslying', variant: 'classic',
      brief: 'Sinar Cold Chain\'s fleet room at Westport keeps the keys and the books for forty vehicles, and on Wednesday night Asri takes five statements there about one of them: from Roslan Daud, from Hashim the fleet clerk, from Devi the night dispatcher, from Wan the mechanic, and, by telephone, because he refuses to come, from Encik Kamarul. Each one is either wholly true or wholly false. Work out who is lying.',
      params: {
        solvedLine: 'Asri reads the five statements twice. "Two liars and one Land Cruiser. And a deputy minister\'s aide who will be very sorry he told Klang he was asleep."',
        people: [
          { id: 'roslan', name: 'Roslan Daud, driver', says: [
            { t: '"F-03 never left the yard on Monday night. Ask anybody."', fact: false, note: 'The yard\'s gate log shows F-03 out at 01:40 and back at 09:50 on Tuesday.' },
            { t: '"Devi is lying."', about: 'devi', is: false },
          ] },
          { id: 'hashim', name: 'Hashim, fleet clerk', says: [
            { t: '"F-03 has been in the workshop since Saturday. It is in my book."', fact: false, note: 'The workshop\'s job cards have nothing for F-03 since October.' },
            { t: '"Wan is lying."', about: 'wan', is: false },
          ] },
          { id: 'devi', name: 'Devi, night dispatcher', says: [
            { t: '"F-03 left the yard at 1:40 on Tuesday morning. I opened the gate myself."', fact: true, note: 'The gate log, in her hand, and the barrier camera.' },
            { t: '"Hashim is lying."', about: 'hashim', is: false },
          ] },
          { id: 'wan', name: 'Wan, mechanic', says: [
            { t: '"Hashim is lying."', about: 'hashim', is: false },
            { t: '"Encik Kamarul is telling the truth."', about: 'kamarul', is: true },
          ] },
          { id: 'kamarul', name: 'Encik Kamarul, by phone', says: [
            { t: '"I paid the Kota Kemuning toll at 3:09. Check my card."', fact: true, note: 'His Touch \'n Go card: Kesas, Kota Kemuning, 03:09:41, seven kilometres from Batu Tiga.' },
            { t: '"At least two of the others are lying."', atLeast: 2 },
          ] },
        ],
        liars: ['roslan', 'hashim'],
      },
      evidence: {
        img: 'ev_c8_keys', hotspot: { x: 0.66, y: 0.27, r: 0.15 },
        title: 'Two liars, one Land Cruiser',
        short: 'Roslan and Hashim lied: F-03 left the yard at 1:40 on Tuesday morning and came back at 9:50, and Hashim was paid to write "in workshop since Saturday" in his book. Kamarul tells the truth now: a karaoke lounge in Klang, a woman who is not his wife, the Kota Kemuning toll at 3:09, and a Prado with no bull bar.',
        text: 'Hashim the fleet clerk breaks first, because he is the one with the least to lose: an envelope with RM 2,000 in it, left on his desk on Tuesday morning, and a note to write F-03 into the workshop from Saturday. He wrote it. Devi the night dispatcher opened the gate for F-03 at 1:40 on Tuesday morning and wrote it down, as she writes everything down, and Roslan has told the whole fleet room she is a liar ever since. Wan the mechanic has not seen F-03 in his workshop since its service in October, and says so with grease on his hands. And Encik Kamarul, on speakerphone from a car somewhere, in the voice of a man whose minister is in the room with him, tells the truth at last. He was not asleep in Ampang. He was at a karaoke lounge in Klang with a woman who is not his wife, and he drove her home and himself back up the Kesas, and his toll card paid at Kota Kemuning at 3:09, seven kilometres from Batu Tiga, in a Prado with a chrome grille and no bull bar. "I lie for a living," he says. "I do not push women into walls."',
      },
    },
    {
      id: 'c8_20', phase: 'Bukit Aman', title: 'Everyone at 3:12',
      game: 'logicgrid', variant: 'classic',
      brief: 'Hamidah wants the night by half past four. Asri borrows an empty room on the fourth floor of Bukit Aman, two floors below a superintendent\'s office whose door is shut, and draws the grid with a ruler for Farah, who is not there to draw it. Five people at 3:12 on Tuesday morning, five places, five things in their hands, and one of them is you.',
      params: {
        categories: [
          { name: 'Person', items: ['Roslan', 'Khairul', 'Murali', 'Kamarul', 'You'] },
          { name: 'Location', items: ['Beside Farah\'s car', 'Bangsar, at home', '200 m ahead, left lane', 'Kota Kemuning toll', 'Three cars ahead of Farah'] },
          { name: 'Holding', items: ['Prepaid phone', 'Laptop', 'Logbook', 'Toll card', 'Key with a brass sun'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]],
        clues: [
          'The prepaid phone was at Batu Tiga, beside the divider.',
          'Whoever was three cars ahead of Farah had something brass in a pocket.',
          'The man with the laptop never left his house.',
          'The toll card was never on the Federal Highway.',
          'Murali was on the Federal Highway at 3:12, but he never got out of his cab, and he never had the key.',
          'You did not stop for anything that night: not for a toll, not for Farah, and not to go home.',
          'Kamarul was nowhere near Batu Tiga, and he was not at home, whatever he told Klang.',
          'Roslan did not spend the night at home.',
        ],
      },
      evidence: {
        img: 'ev_c8_grid', hotspot: { x: 0.38, y: 0.58, r: 0.18 },
        title: 'Everyone at 3:12',
        short: 'At 3:12: Roslan beside Farah\'s car at Batu Tiga, with a prepaid phone. Khairul at home in Bangsar with a laptop. Murali two hundred metres ahead in the left lane, with his logbook. Kamarul at the Kota Kemuning toll with his card. You, three cars ahead of her, with a key with a brass sun in your pocket.',
        text: 'At 3:12 on Tuesday morning. Roslan Daud at the wheel of F-03, its bull bar in Farah\'s door, a prepaid phone at his ear that had rung three times since half past two. Superintendent Khairul Anuar in a terrace house in Bangsar with a laptop on his knees and a location portal open on it, eighteen kilometres from the wall. Murali Krishnan two hundred metres ahead in the left lane with fifteen hours in his eyes and a logbook on the dashboard that says he stopped to rest at midnight. Kamarul Zaman at the Kota Kemuning toll, three minutes earlier, with his card on the reader and a woman\'s lipstick on his collar. And you, three cars ahead of her, with a car key on a ring with a brass sun in your pocket, your foot coming off the pedal, and a voice behind your head telling you not to stop.',
      },
    },
    {
      id: 'c8_21', phase: 'Bukit Aman', title: 'For the prosecutor',
      game: 'theory', variant: 'classic',
      brief: 'Hamidah Yusof comes up the stairs at Bukit Aman at half past four on Thursday morning with her hair wet, her flask and her pencil, and sits where Farah would sit. "Fourth time, detective. A police officer this time. Not the evidence. The story. Who put her into the wall, who told him where she was, and why anybody would want you to stop."',
      params: {
        prompt: 'Write the night for the prosecutor: who pushed Farah\'s car into the divider and with what, who told him where she was and how, why he did it, and who was paying whom.',
        context: 'At 3:12 AM on Tuesday 1 December 2026 Inspector Farah Iskandar, tailing the Chairman\'s black car three cars behind the detective who was driving it, was pushed into the Federal Highway divider at Batu Tiga by a black Land Cruiser with a bull bar: Sinar Cold Chain fleet car F-03, driven by Roslan Daud, the escort driver who had followed the Chairman\'s car since 2003 and expected to be its driver after Muthu. Superintendent Khairul Anuar of D9 told him where she was: he heard her plan from a tapped call played back at 1:10 AM, made three live location requests for her phone under a false report number (1401/26) at 2:31, 2:49 and 3:04, and phoned each position to F-03\'s prepaid. Roslan wanted the detective to stop and break the Chairman\'s rules, so that he, not the detective, would be the driver. Khairul has collected an envelope from the escort car for years and is on Sinar\'s payroll.',
        points: [
          { id: 'push', label: 'Who pushed her, and with what', criterion: 'Roslan Daud (the escort driver) pushed / rammed Farah\'s car into the divider with the Land Cruiser F-03 (its bull bar). It must not say someone else did it.', keywords: [['roslan', 'daud', 'escort', 'f-03', 'f03'], ['push', 'ram', 'rammed', 'hit', 'bull bar', 'land cruiser', 'divider', 'shunt']], hint: 'Whose face was at the wheel when the interior light came on, and what does the sticker on the window say?' },
          { id: 'where', label: 'Who told him where she was', criterion: 'Superintendent Khairul told Roslan where Farah was: by live location requests on her phone under a false report number, phoning her position to the 4x4, or by the tapped call from Bala\'s phone.', keywords: [['khairul', 'superintendent', 'supt'], ['location', 'ping', 'portal', 'report', 'phone', 'tap', 'told', 'position', 'where']], hint: 'Who asked the telco where her phone was, three times, and whose line played back her call?' },
          { id: 'why', label: 'Why', criterion: 'To make the detective stop and break the rules, so that Roslan, not the detective, would become the Chairman\'s driver (jealousy over Muthu\'s seat).', keywords: [['stop', 'rule', 'seat', 'driver', 'replace', 'jealous', 'muthu'], ['you', 'detective', 'driver', 'seat', 'rules', 'stop']], hint: 'Twenty-three years three lengths behind. Who was in the front seat on the first of December?' },
          { id: 'paid', label: 'The money', criterion: 'Khairul is on Sinar\'s payroll / takes money (an envelope) from Sinar or from the escort car.', keywords: [['khairul', 'superintendent'], ['paid', 'payroll', 'envelope', 'money', 'bribe', 'sinar', 'figure']], hint: 'What has Khairul collected from the escort car since Level 14 was sealed?' },
        ],
        need: 3,
        clue: 'Hamidah unscrews her flask. "Three I can prove. Four, and I charge the superintendent before his lawyer wakes up."',
      },
      evidence: {
        img: 'ev_c8_report', hotspot: { x: 0.42, y: 0.50, r: 0.15 },
        title: 'For the prosecutor',
        short: 'Hamidah reads it twice and writes two charges: attempted murder of a police officer, Section 307, and under it, abetment. "A superintendent," she says. "In thirty years I have charged two. They both retired on full pension." Then she taps the line where you wrote "do not stop". "And this one I cannot charge at all."',
        text: 'Hamidah Yusof reads it twice with the pencil she never uses held flat against the page, and then she writes. Section 307, attempted murder, Roslan Daud, the driver of F-03. Under it, Section 109, abetment, a superintendent of police, and she writes his name out in full the way a careful woman writes a name she expects to be shouted at about. "In thirty years I have charged two superintendents," she says. "They both retired on full pension. I would like this one to be different." She does not write the third name she is thinking of. She taps the line in your report where you wrote what the voice behind you said, at 3:12, as her inspector went into the wall: do not stop, she will live, that was not mine. "That," she says, "I cannot charge at all. A man in the back of a car who tells his driver to drive on is not a crime in this country. He knows that. He has read the Penal Code more carefully than I have." She screws the lid back on her flask. "Bring me the man at the wheel. Tell me where the other one got out."',
      },
    },
    {
      id: 'c8_22', phase: 'Sentul', title: 'Three lengths behind',
      game: 'interrogation', variant: 'classic',
      brief: 'At a quarter to five on Thursday morning Roslan Daud comes to Bengkel Seng Lee in a borrowed van to fetch F-03 before daylight, and finds you sitting on its new bull bar and Asri standing in the workshop door. He does not run. He sits on an oil drum, takes off his cap, and smooths his moustache, and waits to be asked. One thing he tells you is not true. Find it, and put the exhibit that breaks it in front of him.',
      params: {
        setting: 'The office of Bengkel Seng Lee, Jalan Sentul. Thursday, 4:50 AM.',
        suspect: {
          id: 'roslan', voice: 'voice_2', name: 'Roslan Daud', role: 'Driver, Sinar Cold Chain fleet car F-03, 49',
          persona: 'Ex-army Perak Malay man of forty-nine, a lance corporal in the Royal Malay Regiment until 2002: clipped, short sentences, clipped army English with Perak Malay underneath ("tak", "dah", "Tuan" with great respect). Calls the detective "driver", with contempt, and Farah "the Inspector", never her name. Proud of twenty-three years of discipline: never late, never the same road twice. Touches his moustache when cornered. Jealous, though he would never use the word, of the detective in the front seat.',
        },
        facts: [
          { id: 'f1', topic: 'his job', claim: 'Escort. Ekor. Three lengths behind the car, every night it goes out, since 2003.' },
          { id: 'f2', topic: 'the army', claim: 'Royal Malay Regiment, 1995 to 2002. Lance corporal. I know how to drive behind a man.' },
          { id: 'f3', topic: 'Muthu', claim: 'Abang Muthu drove the car for forty years. A good driver. He never looked in the mirror. Not once.' },
          { id: 'f4', topic: 'the rules', claim: 'Never the same road twice. Four minutes at any stop. Nobody gets out on the right. I know the rules better than you, driver.' },
          { id: 'f5', topic: 'the Tuan', claim: 'I have never seen his face. Twenty-three years. You do not look. That is the job.' },
          { id: 'f6', topic: 'the detective', claim: 'You. One drive. One. And they give you the front seat.' },
          { id: 'f7', topic: 'his car', claim: 'F-03 is the best car in the fleet. I wash it by hand. Every morning.' },
        ],
        lies: [
          { id: 'l1', topic: 'Monday night', claim: 'F-03 never left the yard on Monday night. It was in the workshop since Saturday.', truth: 'F-03 left the Westport yard at 1:40 on Tuesday morning and came back at 9:50; Hashim was paid to write "in workshop since Saturday".', exposedBy: 'e1' },
          { id: 'l2', topic: 'the bull bar', claim: 'I hit a cow at Kapar on Sunday. That is why the bull bar is new.', truth: 'The old bull bar is in the scrap pile with grey paint from Farah\'s door in its tubes; there was no cow.', exposedBy: 'e2' },
          { id: 'l3', topic: 'the Inspector', claim: 'Nobody tells me where anybody is. I drive behind the car. That is all.', truth: 'Superintendent Khairul phoned Farah\'s position to his prepaid three times, at 2:31, 2:49 and 3:04.', exposedBy: 'e3' },
          { id: 'l4', topic: 'the Tuan', claim: 'Tuan was in the car the whole night. I never came near it.', truth: 'At 3:44 the Tuan got out of the black car\'s rear left door at the Warehouse 6 gate and into the back of F-03.', exposedBy: 'e4' },
        ],
        evidence: [
          { id: 'e1', title: 'Two liars, one Land Cruiser', text: 'The fleet room: F-03 out of the Westport yard at 1:40 on Tuesday morning, back at 9:50. The clerk was paid RM 2,000 to write "in workshop since Saturday".' },
          { id: 'e2', title: 'The old bull bar', text: 'Bengkel Seng Lee\'s scrap pile: F-03\'s old bull bar, bent at the left end, its tubes packed with grey paint from Farah\'s Waja.' },
          { id: 'e3', title: 'Three pings', text: 'Three live location requests for Farah\'s phone at 2:31, 2:49 and 3:04, under a report number that does not exist, from a laptop in Superintendent Khairul\'s house.' },
          { id: 'e4', title: 'A door at 3:45', text: 'In the black car\'s rear window at the Warehouse 6 gate: one broken headlight at 3:44, and at 3:45 the rear left door opening.' },
          { id: 'e5', title: 'Measured in the dark', text: 'A tailor on Batu Road has measured a man in the back of the car, in the dark, three times a year since 1986, and never seen his face.' },
          { id: 'e6', title: 'Nine rules', text: 'THE RULES, typed, in the boot of the car: "Two. The driver does not look in the mirror."' },
        ],
        secret: 'He rammed Farah\'s car into the divider to make the detective stop and break the rules, so that the Tuan would throw the detective out of the front seat and give it to him, as he had expected since Muthu died; Superintendent Khairul phoned him her position three times; at 3:44 the Tuan got into his car anyway, without a word about the Inspector, and he drove him south. He will never say where.',
        suggested: [
          'Where was F-03 on Monday night?',
          'What happened to the bull bar?',
          'Who told you where Farah was?',
          'Where was the Tuan at 3:44?',
          'Why did you want me to stop?',
          'Have you ever seen his face?',
          'Where did you take him?',
        ],
        maxQuestions: 14,
        clue: 'Asri, quietly, from the door: "He keeps looking at the car. Not at you. At the front seat."',
      },
      evidence: {
        img: 'ev_c8_cap', hotspot: { x: 0.50, y: 0.48, r: 0.12 },
        title: 'Two in the back',
        short: 'Caught in one lie, Roslan puts his cap back on. He rammed her to make you stop: "Muthu, then me. Forty years Muthu, then me." Khairul rang him her position three times. At 3:44 the Tuan got into F-03 anyway. He will not say where he drove him: "Rule four, driver." But he says one true thing. "Twenty-three years three lengths behind him, and I never saw his face. Some nights there are two in the back. I have never known which one is him."',
        text: 'He does not ask for a lawyer. He puts his cap back on, square, the way a soldier does before he is marched somewhere, and talks to the front seat of F-03 through the office window. "Forty years Muthu. Then me. That was the order of things. Muthu, then me." Abang Muthu was cremated on a Monday, and on the Wednesday a printed sheet told him to drive three lengths behind the inspector, behind a private investigator who had been in the car once. Khairul rang the prepaid three times with her position, and he does not care what happens to Khairul. He wanted you to stop. One stop, one look back, one broken rule, and the Tuan would put you out on the road and the front seat would be his. You did not stop. At the gate of Warehouse 6 the Tuan got into his car without a word about the Inspector, not one, and he drove him away, and that silence is what he cannot forgive. Where to, he will not say. "Rule four, driver. Never the same road twice. You will not drive it once." Then, as Asri takes his arm, he says one thing nobody asked him, and you believe it. "Twenty-three years three lengths behind him, and I never saw his face. Some nights there are two in the back. I have never known which one is him."',
      },
    },
  ],

  outcomes: {
    charged: {
      roslan: { en: 'Roslan Daud is arrested at Bengkel Seng Lee with grease to the elbows. He asks whether the Tuan has a new escort yet.' },
      khairul: { en: 'Superintendent Khairul Anuar is arrested at Bukit Aman by officers he trained. He asks whether Farah is awake, and does not seem to know which answer he wants.' },
      murali: { en: 'Murali Krishnan is charged. His prime mover is impounded, and his wife sells their thosai stall\'s second tawa to pay the lawyer.' },
      kamarul: { en: 'Kamarul Zaman is charged. The deputy minister\'s office says it has never heard of him.' },
    },
    correct: ['roslan', 'khairul'],
  },

  // Hidden consequences, for later cases. ROSLAN_FREE: still the escort (Case 9's courier). KHAIRUL_FREE:
  // still at D9 (or suspended, if KHAIRUL_WRONGED), and hostile. MURALI_WRONGED / KAMARUL_WRONGED: remanded
  // for a crime they did not commit. TAIL_TRACED / TAIL_LOST: whether Hamidah's records for the Warehouse 6
  // gate at 3:44 led to F-03's toll card and Ayer Keroh, Melaka (Case 9 reads it).
  flagNames: ['ROSLAN_FREE', 'KHAIRUL_FREE', 'MURALI_WRONGED', 'KAMARUL_WRONGED', 'TAIL_TRACED', 'TAIL_LOST'],
  flags: ({ charged, answers }) => ({
    ROSLAN_FREE: !charged.includes('roslan'),
    KHAIRUL_FREE: !charged.includes('khairul'),
    MURALI_WRONGED: charged.includes('murali'),
    KAMARUL_WRONGED: charged.includes('kamarul'),
    TAIL_TRACED: answers.exit === 'bay3',
    TAIL_LOST: answers.exit !== 'bay3',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  // Daniel's branches hang on Cases 5 to 7's flags, so they use `when` (the voice manifest walks every line).
  ending(v) {
    const traced = v.answers.exit === 'bay3';

    // Bukit Aman, Thursday morning: one line per charged suspect.
    const arrests = [];
    if (v.has('roslan')) arrests.push({ who: null, en: CASE08.outcomes.charged.roslan.en });
    if (v.has('khairul')) {
      arrests.push({ who: null, en: CASE08.outcomes.charged.khairul.en, when: (f) => !f.KHAIRUL_WRONGED });
      arrests.push({ who: null, en: 'Khairul Anuar, still suspended, is arrested at his house in Bangsar by officers he trained. He asks whether Farah is awake, and does not seem to know which answer he wants.', when: (f) => !!f.KHAIRUL_WRONGED });
      arrests.push({ who: null, en: 'The three requests went out under his own login. It never crossed his mind that anybody reads the telco\'s bill.', when: (f) => !f.KHAIRUL_WRONGED });
      arrests.push({ who: null, en: 'The three requests went out under Kpl. Faridah Ismail\'s login, borrowed in October "for overtime claims". She reads about it in the Star, at her desk, and goes home sick.', when: (f) => !!f.KHAIRUL_WRONGED });
    }
    if (v.has('murali')) arrests.push({ who: null, en: CASE08.outcomes.charged.murali.en });
    if (v.has('kamarul')) arrests.push({ who: null, en: CASE08.outcomes.charged.kamarul.en });
    if (!v.charged.length) arrests.push({ who: null, en: 'Hamidah Yusof waits at Bukit Aman until six with her flask and her pencil, and charges nobody. "A police officer in intensive care," she says, "and a blank sheet. I will remember this sheet."' });
    arrests.push({ who: null, en: 'Nobody at Bukit Aman mentions Desmond Yap, found in Bay V1 a fortnight ago with a hose from his exhaust. Everybody thinks of him.', when: (f) => !!f.DESMOND_FREE });

    // Hospital Shah Alam: Farah's line, by the verdict.
    let farahLine;
    if (v.has('murali')) farahLine = 'You charged a man for what he saw in his mirror. Go and find what he did not see.';
    else if (v.has('kamarul')) farahLine = 'You charged Kamarul for lying about where he slept. In this town that is not a crime. It is a career.';
    else if (!v.has('roslan')) farahLine = 'Somebody put me into that wall, and he is still out there driving. Three lengths behind somebody.';
    else if (!v.has('khairul')) farahLine = 'Khairul sent flowers. I gave them to the nurse with the worst cough.';
    else farahLine = 'You did not stop. Good. If you had stopped, you would be his.';

    const panels = [
      { img: 'c8_out_01_bukitaman', mood: 'police', fx: ['rain', 'siren'], place: 'Bukit Aman. Thursday, 5:00 AM.', music: 'resolution', lines: arrests },
      {
        img: 'c8_out_02_ward', mood: 'day', fx: [], place: 'Hospital Shah Alam. Wednesday.', music: 'memory',
        lines: [
          { who: null, en: 'Farah is awake on Wednesday afternoon, propped up in a ward on the fourth floor with a brace on her left knee and three ribs taped, and the first thing she asks for is her warrant card.' },
          { who: 'Inspector Farah Iskandar', en: farahLine },
          { who: null, en: 'On the locker, flowers with a card and no name: "Left shoulder, Inspector."', when: (f) => !!f.ZUL_FREE },
          { who: null, en: 'A basket of fruit from the Office of the Chairman, with a card in copperplate, posted in Singapore: with every good wish for the Inspector\'s recovery. Farah has it taken out of the room.', when: (f) => !!f.VIVIAN_FREE },
          { who: null, en: 'A basket of fruit from the Office of the Chairman, the card initialled M.O. in Melissa Ong\'s small careful hand. Farah has it taken out of the room.', when: (f) => !f.VIVIAN_FREE && !!f.MELISSA_FREE },
          { who: null, en: 'At the door, as every day since Tuesday, Sergeant Asri, with two teh in a plastic bag and the newspapers under his arm.' },
        ],
      },
      {
        img: 'c8_out_03_court', mood: 'day', fx: [], place: 'The magistrates\' court, Jalan Duta. Wednesday 9 December.',
        when: (f) => !!(f.AZHAR_WRONGED || f.AIN_WRONGED || f.MEERA_WRONGED),
        lines: [
          { who: null, en: 'Hamidah Yusof stands up in a courtroom she has stood up in a hundred times and withdraws the murder charges from Case 7: a discharge not amounting to acquittal, which means they can come back any morning she likes.' },
          { who: null, en: 'Tan Sri Azhar Kamaruddin leaves by the side door, where a car is waiting with its engine running, and does not look at the photographers.', when: (f) => !!f.AZHAR_WRONGED },
          { who: null, en: 'Nurul Ain walks out of the front door and asks the press on the steps to photograph her, so that somebody does.', when: (f) => !!f.AIN_WRONGED },
          { who: null, en: 'Dr. Meera Rajaratnam is free to go. Her suspension by the Medical Council stays.', when: (f) => !!f.MEERA_WRONGED },
        ],
      },
    ];

    // Daniel, by Cases 5 to 7.
    panels.push({ img: 'c8_out_04_asleep', mood: 'night', fx: [], place: 'A house Farah has not told you about. Tuesday night.', music: 'memory',
      when: (f) => HELD7(f) && !f.DANIEL_CHARGED,
      lines: [
        { who: null, en: 'Farah\'s men take Daniel to her safe house from Jugra, and he sleeps for nineteen hours in his clothes with every light in the house on.' },
        { who: null, en: 'When he wakes he asks for a teh and a pen, and writes down every road the car took, in order, from memory, with his eyes shut. He was hooded the whole way. He gets every one right.' },
      ] });
    panels.push({ img: 'c8_out_04_jacket', mood: 'night', fx: ['rain'], place: 'Sungai Buloh. Tuesday night.', music: 'memory',
      when: (f) => HELD7(f) && !!f.DANIEL_CHARGED,
      lines: [
        { who: null, en: 'The warrant for Dato\' Rashid\'s murder is still open, and Farah cannot close it from a hospital bed. Her men drive Daniel from Jugra to Sungai Buloh with her jacket folded over his wrists, so nobody at the gate sees the cuffs.' },
        { who: null, en: 'Hamidah has applied to withdraw the charge. The hearing is on the twenty-second.' },
      ] });
    panels.push({ img: 'c8_out_04_stops', mood: 'night', fx: [], place: 'A house Farah has not told you about. Wednesday night.', music: 'memory',
      when: FREE7,
      lines: [
        { who: null, en: 'Daniel makes you count the stops again, on the back of a calendar, with his finger on each one: Batu Road, four minutes; Jalan Ampang, none; the gate of Warehouse 6, four minutes; Jugra.' },
        { who: 'Daniel Raj', en: 'Four minutes at Batu Road for a parcel, machan. Four minutes at a gate for nothing. Nobody waits four minutes for nothing.' },
      ] });
    panels.push({ img: 'c7_out_04_remand', mood: 'night', fx: [], place: 'Sungai Buloh prison, visiting room 4. Wednesday, 2:00 PM.', music: 'memory',
      when: REMAND7,
      lines: [
        { who: null, en: 'Through the glass you tell Daniel about the hand on your shoulder, and the tailor, and the lamp, and the wall.' },
        { who: 'Daniel Raj', en: 'You did not look back. Good. One of us never has to.' },
        { who: null, en: 'Hamidah has applied to withdraw the charge. The hearing is on the twenty-second.' },
      ] });

    // The tail, and the plate.
    const tail = [];
    if (traced) {
      tail.push({ who: null, en: 'Hamidah\'s records for the gate of Warehouse 6 at 3:44 lead to one toll card, F-03\'s: Pulau Indah, the Kesas, the ELITE, the North-South Expressway south, and at 5:28 AM, Ayer Keroh, Melaka. Nobody knows why Melaka.' });
    } else {
      tail.push({ who: null, en: 'The records Hamidah asked for come back on Monday, stamped and empty: nothing at that place, at that minute, that anybody can find.' });
      tail.push({ who: null, en: 'At Jugra the watchman\'s hut is padlocked, and the rice tin is gone.' });
    }
    tail.push({ who: null, en: 'The plate goes to JPJ. BCK 210 was a Bedford lorry, registered in 1984 to one Teoh Ah Chuan of Jugra, and transferred on 3 December 1986 to Sinar Pengangkutan. The same week, a lien: "Sp.M.R.M. Chettiar, Melaka".' });
    if (traced) tail.push({ who: null, en: 'Melaka twice, now.' });
    tail.push({ who: null, en: 'On the twenty-second Hamidah applies for an order to open whatever Sinar Pengangkutan keeps with that firm. The hearing is set for the twenty-eighth.' });
    if (!traced) tail.push({ who: null, en: 'JPJ sends the plate back. It hangs on your office wall above the desk, with its small pink sun in the corner.' });
    tail.push({ who: null, en: 'On Friday morning Jason Ooi\'s grey sedan is back in the drop-off lane at Menara Sinar, washed by hand.', when: (f) => !!f.JASON_FREE });
    panels.push({ img: traced ? 'c8_out_05_toll' : 'c8_out_05_plate', mood: 'day', fx: [], place: 'Brickfields. The second week of December.', lines: tail });

    panels.push({
      img: 'c8_out_06_phone', mood: 'night', fx: ['rain'], place: 'Brickfields. Friday, 2:10 AM.', music: 'chairman',
      lines: [
        { who: null, en: 'The wall phone in Restoran Bala rings in the dark behind the shutter, and goes on ringing until you come down the back stairs. Bala Anne\'s shutter is down. Nobody else is downstairs.' },
        { who: 'The Chairman', en: 'You did not stop. Muthu would not have stopped either. Thank you, detective.' },
        { who: null, en: 'A lid, open and shut.' },
        { who: 'The Chairman', en: 'Keep the plate.' },
        { who: null, en: 'The dialling tone. Across the road, in the room above the sari shop, the chair is still turned to face the window.' },
      ],
    });
    return panels;
  },
};
