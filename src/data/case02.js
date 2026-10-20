// CASE 2: CONTAINER 47. Klang Bay Terminal, Pulau Indah, Port Klang.
// Truth (writers only): crane operator Azman Yusof lifted Container 47 at 2:05 AM on Tuesday, heard
// knocking, set it down and opened it: twenty-three trafficked people, shipped by Rahman Marine
// Logistics. Shift supervisor Tony Kwan and customs officer Norhayati Salleh came for him; he ran,
// went down the wharf ladder, took his late father's sampan from Telok Gong and is hiding on the
// old family kelong in the strait. Tony and Norhayati are hunting him for Rahman Marine.
// Faizal (Salmah's brother) is innocent: loud, in debt, and looking for Azman for his own reasons.
// Seeds only (never reveal here): Warehouse 6, Bay 3 is the bay that burned in 2021; a man with a
// silver lighter at Bay 3. Daniel Raj is alive. Nobody in this case knows it.

const HIDEOUTS = [
  { id: 'flat', label: "Faizal's flat, Pandamaran", note: 'Shared with three other lorry drivers, inland, behind the Pandamaran market.' },
  { id: 'ketam', label: "Rosnah's house, Pulau Ketam", note: "Salmah's cousin, in the stilt houses by the island jetty." },
  { id: 'shed', label: 'The fish-landing shed, Telok Gong', note: "Pak Dollah's shed on the jetty where the old sampan was kept." },
  { id: 'kelong', label: 'Kelong Haji Yusof, in the strait', note: "His late father's fishing platform. Nobody has been out there since 2015." },
];

export const CASE02 = {
  id: 'case02',
  number: 2,
  title: 'Container 47',
  place: 'Port Klang, Selangor',
  victim: 'Azman Yusof, 38, crane operator. Missing since 2:14 AM on Tuesday.',
  question: 'Who is hunting Azman Yusof?',
  brief: 'Azman Yusof climbed down from Crane 7 at 2:14 on Tuesday morning with a container hanging in the air, and the port has not seen him since. The port police say he ran off. His wife Salmah says he would never leave his son. You have not set foot in Port Klang since the fire.',
  hints: 7,
  music: 'port',
  mapIntro: 'Every puzzle gives up one exhibit. Somewhere in them are the people hunting Azman, and the place he went. When you are ready, you get one move, and so do they.',
  finalLabel: 'Make your move',
  phoneIdle: 'No missed calls. Salmah sent a photo of Amir asleep with the tablet on his chest, waiting for shapes.',
  deduction: {
    lede: 'Farah will charge whoever you name, on your word alone. Name everyone who is hunting Azman, and only them.',
    button: 'Send Farah',
    confirm: 'Farah will charge {names}.',
    confirmTitle: 'Make your move?',
    confirmButton: 'Send her',
    questions: [
      {
        id: 'hideout', q: 'Where is Azman hiding?', short: 'Farah\'s boat goes to',
        lede: 'Farah can send one team, once. Whatever she raids, the people hunting him will hear about within the hour. You cannot go and look first: they are following you.',
        options: HIDEOUTS,
      },
    ],
  },

  suspects: [
    {
      id: 'tony', name: 'Tony Kwan', role: 'Shift supervisor, 46', img: 'sus_tony',
      look: { skin: '#f1d2b6', hair: 'short', hairColor: '#9a9a9a', coat: 'leather', eyewear: 'square', mark: 'none' },
      motive: 'None known. Twenty-two years at the terminal, two weeks from a promotion.',
      claim: 'Says Azman abandoned Crane 7 in the middle of a lift, and that the crane log and the camera both failed the same night.',
    },
    {
      id: 'norhayati', name: 'Norhayati Salleh', role: 'Customs officer, 39', img: 'sus_norhayati',
      look: { skin: '#d9a77f', hair: 'tudung', hairColor: '#151210', coat: 'blazer', eyewear: 'none', mark: 'none' },
      motive: 'None known. Twelve years with the Royal Customs, a spotless file.',
      claim: 'Says her shift ended at midnight, she cleared her last box by the book and was home in Klang by half past twelve.',
    },
    {
      id: 'faizal', name: 'Faizal Ahmad', role: 'Lorry driver, 33. Salmah\'s brother', img: 'sus_faizal',
      look: { skin: '#b97f55', hair: 'short', hairColor: '#151210', coat: 'batik', eyewear: 'none', mark: 'stubble' },
      motive: 'Owes RM 8,000 to a loan shark. Azman refused to lend it on Monday night, and Faizal walked out shouting.',
      claim: 'Says he was hauling vegetables to Chow Kit when Azman vanished, and has been looking for him ever since.',
    },
  ],

  opening: [
    {
      img: 'c2_intro_01_call', mood: 'night', fx: ['rain', 'buzz'], place: 'Brickfields. Wednesday, 6:05 AM.', sfx: 'buzz', music: 'office',
      lines: [
        { who: 'Unknown number', en: '[Incoming call]' },
        { who: 'Woman', orig: 'Encik… suami saya tak balik dari kerja. Dah dua malam.', en: 'Sir… my husband has not come home from work. Two nights now.' },
        { who: 'You', en: 'Then you need the police, puan.' },
        { who: 'Woman', orig: 'Polis kata dia lari ikut perempuan lain. Azman takkan tinggalkan anak dia.', en: 'The police say he ran off with another woman. Azman would never leave his son.' },
        { who: 'You', en: 'Who gave you this number?' },
        { who: 'Woman', orig: 'Seorang lelaki dekat pintu pagar pelabuhan. Dia kata encik orang dari kebakaran tu.', en: 'A man at the port gate. He said you were the one from the fire.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.1, 0, 0] },
    },
    {
      img: 'c2_intro_02_bala', mood: 'warm', fx: ['dust'], place: 'Downstairs.',
      lines: [
        { who: 'Bala Anne', orig: 'Port Klang-aa? Neenga anga poga vendaam, thambi.', en: 'Port Klang? You should not go there, boy.' },
        { who: 'You', en: 'It is a missing person, Anne. People go missing every day.' },
        { who: 'Bala Anne', orig: 'Andha oor-la ellaame missing dhaan.', en: 'In that town, everything goes missing.' },
        { who: null, en: 'On the television over the counter, the morning news: the murder trial of a Mont Kiara dentist, Dr. Shanti Menon, begins next month.', when: (f) => f.SHANTI_WRONGED },
        { who: 'Bala Anne', en: "Your friend Ken's uncle got his money back, but that Bobby boy is riding a new motorbike now. Funny, no?", when: (f) => f.BOBBY_FREE },
        { who: 'Bala Anne', en: 'And Ken says the durian cashier girl lost her job. A record follows you, he says.', when: (f) => f.AHLAN_WRONGED },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c2_intro_03_highway', mood: 'night', fx: ['rain'], place: 'KESAS Highway, westbound. 6:50 AM.',
      lines: [
        { who: null, en: 'Forty kilometres to the sea. You have not driven them since August 2021.' },
        { who: null, en: 'In your mirror, a grey sedan holds three cars back from Shah Alam to the Klang toll. WXY 1408. A common plate, you tell yourself. You remember it anyway.', when: (f) => f.JASON_FREE },
        { who: null, en: 'The cranes come up out of the haze one at a time, like they are counting you.' },
      ],
      kb: { from: [1.0, -3, 0], to: [1.08, 3, 0] },
    },
    {
      img: 'c2_intro_04_gate', mood: 'day', fx: [], place: 'Klang Bay Terminal, Pulau Indah. 7:20 AM.', music: 'panic',
      lines: [
        { who: null, en: 'The gate barrier is striped red and white. So was the tape around Warehouse 6.' },
        { who: null, en: 'Your hands will not let go of the wheel.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.12, 0, -1] },
    },
    {
      img: 'c2_intro_05_panic', mood: 'night', fx: ['shake'],
      lines: [
        { who: null, en: 'Your chest is a fist. The car is full of smoke that is not there.' },
        { who: null, en: 'Breathe. Count the cranes. One. Two. Three…' },
      ],
      kb: { from: [1.2, 0, 0], to: [1.05, 0, 0] },
    },
    {
      img: 'intro_03_fire', mood: 'fire', fx: ['fire', 'shake'], place: 'Port Klang. August 2021.', sfx: 'fire', music: 'memory',
      lines: [
        { who: 'Daniel Raj', orig: 'Jangan tengok belakang.', en: "Don't look back." },
        { who: null, en: 'The roof of Bay 3 coming down. Daniel\'s voice, very calm. Then nothing at all for eleven days.' },
      ],
      kb: { from: [1.18, 0, 0], to: [1.04, 0, 0] },
    },
    {
      img: 'c2_intro_05_panic', mood: 'night', fx: [],
      lines: [{ who: null, en: '…Seven. The seventh crane is not moving. You breathe out, and you open the door.' }],
      kb: { from: [1.05, 0, 0], to: [1.0, 0, 0] },
    },
    {
      img: 'c2_intro_06_salmah', mood: 'day', fx: [], music: 'tension',
      lines: [
        { who: 'Salmah', orig: 'Encik datang juga.', en: 'You came after all.' },
        { who: 'Salmah', orig: 'Dia operator Crane 7. Isnin malam dia masuk kerja. Sampai sekarang tak keluar.', en: 'He drives Crane 7. On Monday night he went in to work. He has not come out.' },
        { who: null, en: 'Her son stands behind her, turning a small wooden triangle over and over in his fingers.' },
      ],
      kb: { from: [1.08, 1, 0], to: [1.0, -1, 0] },
    },
    {
      img: 'c2_intro_07_farah', mood: 'police', fx: ['rain'],
      lines: [
        { who: 'Inspector Farah Iskandar', en: 'Port Klang is not your jurisdiction. It is not even mine.' },
        { who: 'Inspector Farah Iskandar', orig: 'Orang dewasa hilang, dua hari, tiada unsur jenayah. Fail ditutup sebelum dibuka.', en: 'Missing adult, two days, no sign of foul play. The file was closed before it was opened.' },
        { who: 'Inspector Farah Iskandar', en: 'One more thing. Rizal Hamdan left Mont Kiara last month. New uniform, new company. Somewhere with a sea view.', when: (f) => f.RIZAL_FREE },
        { who: 'Inspector Farah Iskandar', en: 'Call me if you find something I can write down.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.1, 0, 1] },
    },
    {
      img: 'c2_intro_08_crane', mood: 'day', fx: [],
      lines: [
        { who: null, en: 'Container 47 came in from Sandakan on Monday night. At 2:14 on Tuesday morning, with the box hanging six metres in the air, Crane 7 stopped.' },
        { who: null, en: 'Azman Yusof climbed down, and the port forgot his name.' },
      ],
      kb: { from: [1.0, 0, 2], to: [1.14, 0, -2] },
    },
    { title: { kicker: 'Case 2', name: 'Container 47' }, fx: ['rain'] },
  ],

  levels: [
    // ---------------- Port gate ----------------
    {
      id: 'c2_01', phase: 'Port gate', title: 'Locker 31',
      game: 'safecracker', variant: 'classic',
      brief: 'The crane operators\' rest room behind Gate 3 smells of Milo and diesel. Azman\'s locker has a five-digit padlock, and Tony Kwan says the master key went missing on Tuesday. Ten tries before the lock jams and the guard comes to see who is rattling it.',
      params: { digits: 5, tries: 10 },
      evidence: {
        img: 'ev_c2_locker', hotspot: { x: 0.52, y: 0.55, r: 0.15 },
        title: 'He meant to come back',
        short: 'Wallet, IC, car keys and his son\'s tangram set, all left in the locker. Gate log: in at 10:52 PM Monday, never out.',
        text: 'Wallet with RM 212, identity card, car keys, a pencil case holding a child\'s wooden tangram set. Taped inside the door, a faded photo: an old man on a fishing platform on stilts, "Ayah, Kelong Haji Yusof, 1994". The gate log says Azman swiped in at 10:52 PM on Monday and never swiped out. His car is still in the staff car park.',
      },
    },
    {
      id: 'c2_02', phase: 'Port gate', title: 'Gate 3, 3:10 AM',
      game: 'lineup', variant: 'single',
      brief: 'Encik Ramli has worked Gate 3 for nineteen years and forgets nothing, except, suddenly, Tuesday. Farah\'s trick for a witness who has been told to forget: show him faces fast, before his mouth catches up with his eyes. One vehicle left Gate 3 between two and four that morning.',
      params: { rounds: 3, studySeconds: [10, 8, 6] },
      evidence: {
        img: 'ev_c2_van', hotspot: { x: 0.5, y: 0.5, r: 0.17 },
        title: 'A reefer van at 3:10 AM',
        short: 'Ramli picks out Tony Kwan as the driver of a white refrigerated van that left Gate 3 at 3:10 AM. The passenger kept a cap down.',
        text: 'Ramli\'s eyes go to the same face every time: Tony Kwan, driving a white refrigerated van marked "Ikan Segar Sandakan" out of Gate 3 at 3:10 AM. A passenger sat beside him, cap pulled low. "Small. Quiet. I did not see the face, Encik. I did not want to."',
      },
    },

    // ---------------- Crane 7 ----------------
    {
      id: 'c2_03', phase: 'Crane 7', title: 'Crane 7, 2:14 AM',
      game: 'timeline', variant: 'log',
      brief: 'The crane keeps its own log, the radio room keeps another, and somebody has been at both. Eight entries survive from Monday night, out of order and some with their clocks smudged. Put them in the order they happened.',
      params: {
        frames: [
          { id: 'a', clock: '01:1▮', title: 'Inspection bay', text: 'Container 47 is stamped "Inspected. X-ray clear." Badge number on the stamp: 4471.' },
          { id: 'b', clock: '01:4▮', title: 'Radio, channel 3', text: 'Tony Kwan: "Crane 7, ambil 47 dulu. Terus ke Gudang 6." Take 47 first. Straight to Warehouse 6. It was due at four.' },
          { id: 'c', clock: '02:0▮', title: 'Crane 7 controller', text: 'Spreader locked on 47. Load cell: 9.8 tonnes. Declared on the manifest: 4.2 tonnes.' },
          { id: 'd', clock: '02:▮9', title: 'Cab microphone', text: 'Hoist paused with the box six metres up. Under the motor: knocking. Three, then three, then three.' },
          { id: 'e', clock: '0▮:14', title: 'Crane 7 controller', text: 'Emergency stop pressed in the cab. The box is set down on the apron, crooked.' },
          { id: 'f', clock: '02:1▮', title: 'Ladder sensor', text: 'Cab door open. One person climbing down. Below, the box still sits crooked on the apron.' },
          { id: 'g', clock: '▮▮:22', title: 'Supervisor terminal', text: 'User T.KWAN logs in to the Crane 7 controller. Every entry from the lift onward is marked "sensor fault".' },
          { id: 'h', clock: '02:3▮', title: 'Radio, channel 3', text: 'Tony Kwan, out of breath: "Dia lari. Ke arah wharf." He is running. Toward the wharf.' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The night plays back in order. And someone went back afterwards to call it a sensor fault.',
      },
      evidence: {
        img: 'ev_c2_cranelog', hotspot: { x: 0.62, y: 0.42, r: 0.15 },
        title: 'Nine tonnes of frozen fish',
        short: '47 weighed 9.8 t against a declared 4.2 t. Knocking from inside at 2:09. At 2:22 T.KWAN marked the log "sensor fault".',
        text: 'Container 47 weighed 9.8 tonnes against a declared 4.2 tonnes of frozen fish, and its refrigeration unit had been switched off since Sandakan. At 2:09 the cab microphone picked up knocking from inside the box. At 2:22 someone logged in as T.KWAN and marked the whole lift a sensor fault.',
      },
    },
    {
      id: 'c2_04', phase: 'Crane 7', title: 'The spreader camera',
      game: 'rotation', variant: '3d',
      brief: 'Every quay crane has a camera in its spreader, looking down at whatever it grips. Crane 7\'s recorder writes its frames mirrored, and nobody ever fixed it. Tony told the port police the camera was broken. It was not broken. It was backwards. Learn to tell turned from reflected, and the footage reads again.',
      params: { trials: 12, target: 10, options: 4 },
      evidence: {
        img: 'ev_c2_spreadercam', hotspot: { x: 0.52, y: 0.52, r: 0.2 },
        title: 'What Azman saw',
        short: '2:17 AM: 47\'s doors open on twenty-three people, two of them children. At 2:20 two figures come round the stack: a white helmet and a dark uniform with a cap.',
        text: '2:17 AM. The doors of 47 swing open and the light falls on faces: twenty-three people, two of them children, among water bottles and a single bucket. A man in an operator\'s vest stands frozen in front of them. At 2:20 two figures come round the stack, one in a white supervisor\'s helmet, one in a dark uniform and cap. The man in the vest runs.',
      },
    },
    {
      id: 'c2_05', phase: 'Crane 7', title: 'Tony\'s office',
      game: 'hiddenobject', variant: 'silhouette',
      brief: 'Tony Kwan\'s office looks down on Crane 7 through a window nobody has cleaned since the last royal visit. He is at lunch for forty minutes. The things on a man\'s desk tell you what he cannot afford to lose. This time you only have their outlines.',
      params: { scene: 'desk', targets: 14, objects: 78 },
      evidence: {
        img: 'ev_c2_kancil', hotspot: { x: 0.45, y: 0.55, r: 0.12 },
        title: 'A kancil in the drawer',
        short: 'In Tony\'s drawer: a second phone, switched off, and a paper kancil folded from a Restoran Bala receipt dated the day before Salmah called you.',
        text: 'Under the shift rosters: a second phone, switched off. Beside it, a tiny mousedeer folded from a mamak receipt. You unfold one corner. Restoran Bala, Brickfields. One teh tarik, one roti kosong, table 6, the table by the stairs to your office. Dated Tuesday afternoon, the day before Salmah found your number.',
      },
    },

    // ---------------- Container yard ----------------
    {
      id: 'c2_06', phase: 'Container yard', title: 'The way he ran',
      game: 'maze', variant: 'cameras',
      brief: 'From the foot of Crane 7, a running man has three ways out of the yard: Gate 3, the reefer stacks, or the wharf. The yard is full of cameras and the port police say none of them saw Azman leave. Trace the only route from the crane to an exit that no camera can see.',
      params: {
        map: [
          '#####################',
          '#S.......#.........W#',
          '#.##.###.#.#####.#.##',
          '#.##.###.#.#...#.#..#',
          '#....###...#.#.#.##.#',
          '####.#####.#.#...#..#',
          '#....#.....#.#####.##',
          '#.####.###.#........#',
          '#......#...#####.#..#',
          '#.####.#.#.....#.##.#',
          '#....#...#.###.#....#',
          '#.##...#.....#...#..R',
          '##########G##########',
        ],
        cameras: [
          { x: 10, y: 1, dir: 'E', range: 7 },
          { x: 4, y: 4, dir: 'S', range: 3 },
          { x: 19, y: 11, dir: 'E', range: 1 },
          { x: 8, y: 11, dir: 'E', range: 5 },
          { x: 12, y: 7, dir: 'E', range: 4 },
        ],
        exits: { W: 'Wharf ladder', G: 'Gate 3', R: 'Reefer stacks' },
        startLabel: 'C7',
        startName: 'the foot of Crane 7',
        aria: 'Plan of the container yard around Crane 7',
        answer: 'W',
      },
      evidence: {
        img: 'ev_c2_ladder', hotspot: { x: 0.5, y: 0.48, r: 0.2 },
        title: 'Down the wharf ladder',
        short: 'The only unseen route ends at a rusted ladder down the quay wall. Blood on the third rung. Low tide at 2:30 AM.',
        text: 'The only route no camera sees ends at a rusted ladder bolted down the quay wall, at the far end of the berth. Dried blood on the third rung. At 2:30 on Tuesday morning the tide was at its lowest, and at low tide the foot of that ladder is a strip of mud where the Telok Gong fishermen tie up.',
      },
    },
    {
      id: 'c2_07', phase: 'Container yard', title: 'Inside Container 47',
      game: 'footprint', variant: 'size',
      brief: 'Container 47 is back in the stack, scrubbed with bleach and re-declared "empty, returned to Sandakan". Whoever scrubbed it missed the groove under the door gasket, where the condensation dried around one boot print. Read the tread, and read the size. Here the size matters as much as the tread.',
      params: { shoes: 10 },
      evidence: {
        img: 'ev_c2_bootprint', hotspot: { x: 0.5, y: 0.5, r: 0.15 },
        title: 'A customs boot, size 5',
        short: 'The print inside 47 is a standard-issue Customs field boot, UK size 5. On the terminal\'s Customs roster, two officers wear that size. One is on leave in Kota Bharu.',
        text: 'The print inside the container is a standard-issue Royal Customs field boot, UK size 5, worn at the outer heel. Only two officers on the terminal\'s Customs roster wear that size. One has been on leave in Kota Bharu since Friday. The other is Norhayati Salleh.',
      },
    },
    {
      id: 'c2_08', phase: 'Container yard', title: 'Two people bled here',
      game: 'dna', variant: 'mixed',
      brief: 'The locking bar on 47\'s door has a smear of dried blood along the cam, where a hand would slip if one person dragged the door shut against another. Farah sends a swab to the Bukit Aman lab on a favour she says you now owe her twice. The sample holds two people.',
      params: { suspects: 8 },
      evidence: {
        img: 'ev_c2_doorbar', hotspot: { x: 0.6, y: 0.55, r: 0.18 },
        title: 'Azman and Tony at the door',
        short: 'The blood on 47\'s locking bar is a mixture of two people: Azman Yusof and Tony Kwan.',
        text: 'The blood on the locking bar is a mixture of two people: Azman Yusof and Tony Kwan. Somebody fought over that door. Tony Kwan came to work on Tuesday with his right hand bandaged.',
      },
    },
    {
      id: 'c2_rz1', phase: 'Container yard', title: 'A badge in the dark',
      game: 'nonogram', variant: 'classic',
      when: (flags) => !!flags.RIZAL_FREE,
      brief: 'Muthu lashes containers in the stack beside Crane 7. He gave the port police a statement at 6 AM on Tuesday. By Wednesday he had taken it back. His grandson filmed the man who came to the house on Tuesday night, but the phone kept one corrupted frame. Only the row and column counts survived. Rebuild it.',
      params: {
        solvedText: 'The picture resolves: a shield-shaped badge, with two letters on it.',
        picture: [
          '...............',
          '.#############.',
          '.#...........#.',
          '.#.#.##.####.#.',
          '.#.#.#..#....#.',
          '.#.##...####.#.',
          '.#.#.#.....#.#.',
          '.#.#..######.#.',
          '.#...........#.',
          '.#############.',
          '..###########..',
          '...####.####...',
          '....###.###....',
          '.....##.##.....',
          '.......#.......',
        ],
      },
      evidence: {
        img: 'ev_c2_badge', hotspot: { x: 0.42, y: 0.54, r: 0.13 },
        title: 'Kawalan Sentosa',
        short: 'The visitor wore the shield badge of Kawalan Sentosa Security, the firm that took over the terminal gates three weeks ago.',
        text: 'K and S on a shield: Kawalan Sentosa Security. The firm took over the terminal\'s gates and yard patrols three weeks ago, the same week Container 47\'s arrivals moved from Thursdays to the third Monday of the month. Muthu will not say the visitor\'s name. He says the man was polite, not much older than his own son, and knew which school his grandson goes to.',
      },
    },
    {
      id: 'c2_rz2', phase: 'Container yard', title: 'The envelope',
      game: 'fingerprint', variant: 'classic',
      when: (flags) => !!flags.RIZAL_FREE,
      brief: 'On Muthu\'s kitchen table, under the temple calendar: a brown envelope with RM 3,000 in fifties. Muthu says it is a loan from a cousin. Farah\'s friend at the lab lifts a clean partial from the flap. Classify it, then find its owner among the people on file.',
      params: {
        liftLabel: 'Lift: envelope flap, Muthu\'s kitchen',
        liftAria: 'Partial print lifted from the flap of an envelope',
        candidates: [
          { id: 'muthu', name: 'S. Muthusamy' },
          { id: 'letchumi', name: 'Letchumi Muthusamy' },
          { id: 'tony', name: 'Tony Kwan' },
          { id: 'ramli', name: 'Ramli Osman' },
          { id: 'rizal', name: 'Rizal Hamdan' },
          { id: 'faizal', name: 'Faizal Ahmad' },
          { id: 'norhayati', name: 'Norhayati Salleh' },
          { id: 'cousin', name: 'K. Ganesan' },
        ],
        answer: 'rizal',
      },
      evidence: {
        img: 'ev_c2_envelope', hotspot: { x: 0.45, y: 0.55, r: 0.22 },
        title: 'Rizal Hamdan, again',
        short: 'The print on the cash envelope is Rizal Hamdan\'s, now a Kawalan Sentosa guard. Muthu\'s first statement: knocking from inside 47, and a white helmet.',
        text: 'The print belongs to Rizal Hamdan, the night guard from Residensi Seri Kiara. New job, new uniform, same price. Muthu\'s first statement, the one he took back, said he heard knocking from inside Container 47 and saw a white supervisor\'s helmet running toward the wharf. His second statement says he saw nothing at all.',
      },
    },

    // ---------------- Customs office ----------------
    {
      id: 'c2_09', phase: 'Customs office', title: 'The scanner test',
      game: 'iqmatrix', variant: 'rows',
      brief: 'The X-ray scanner log is open only to officers who passed the scanner aptitude test. Norhayati\'s supervisor, who does not like her, slides a blank copy of her own test across the desk. "Pass what she passed, and I will let you read what she scanned." The panels get harder as you go.',
      params: { count: 6, startLevel: 2 },
      evidence: {
        img: 'ev_c2_scanner', hotspot: { x: 0.45, y: 0.62, r: 0.18 },
        title: 'Cleared without a scan',
        short: '47 was stamped "X-ray clear" at 1:15 AM under Norhayati\'s badge, an hour after her shift ended. The scanner was in maintenance mode, keyed by her badge.',
        text: 'Container 47 was stamped "X-ray clear" at 1:15 AM under badge 4471: Norhayati Salleh, an hour after her shift ended. The scanner has no image of 47 at all. Between 1:02 and 1:31 AM it was switched to maintenance mode, keyed in with the same badge.',
      },
    },
    {
      id: 'c2_10', phase: 'Customs office', title: 'The manifest',
      game: 'kakuro', variant: 'classic',
      brief: 'Customs keeps the paper manifest for 47, or what is left of it after a wet night on a lorry dashboard. The checkers balance weights the old way, across and down, every run summed. The weights column has bled into a grid of blurred sums. Rebuild them and the manifest reads again.',
      params: { difficulty: 'expert' },
      evidence: {
        img: 'ev_c2_manifest', hotspot: { x: 0.58, y: 0.53, r: 0.2 },
        title: 'Rahman Marine Logistics',
        short: 'Shipper: Rahman Marine Logistics, Sandakan. Consignee: Sinar Cold Chain, Singapore. Transfer to Warehouse 6, Bay 3: the bay that burned in 2021.',
        text: 'Shipper: Rahman Marine Logistics Sdn. Bhd., Sandakan. Cargo: frozen fish, 4,200 kg. Consignee: Sinar Cold Chain Pte. Ltd., Singapore. Transfer on arrival to Warehouse 6, Bay 3. You know Bay 3. In August 2021 its roof came down, and Daniel Raj was under it.',
      },
    },
    {
      id: 'c2_11', phase: 'Customs office', title: 'Norhayati\'s night',
      game: 'alibi', variant: 'classic',
      brief: 'Farah can run Norhayati\'s plate through every toll gantry in the Klang valley, but D9\'s analysts are buried in old alibi checks from KL. "Clear three of mine," she says, "and I will clear one of yours." Every one of them is a liar with a receipt.',
      params: { rounds: 3 },
      evidence: {
        img: 'ev_c2_toll', hotspot: { x: 0.5, y: 0.45, r: 0.22 },
        title: 'Back over the bridge',
        short: 'Norhayati\'s car left Pulau Indah at 12:05 AM, came back over the bridge at 12:58 AM, and left again at 3:31 AM.',
        text: 'Norhayati did go home. Her Myvi crossed the Pulau Indah bridge toll outbound at 12:05 AM, just as she said. Then it came back inbound at 12:58 AM, and went out again at 3:31 AM, twenty-one minutes after a refrigerated van left Gate 3.',
      },
    },

    // ---------------- Azman's home ----------------
    {
      id: 'c2_12', phase: 'Azman\'s home', title: 'What Salmah remembers',
      game: 'witness', variant: 'statement',
      brief: 'Salmah makes teh O and will not sit down. She tells it once, fast, in Malay and English at the same time, the way people talk when they have been holding a story in for two days. Read her statement carefully. Then answer from memory.',
      params: {
        readSeconds: 100,
        pass: 8,
        header: 'Statement of Salmah binti Ahmad, 36, Taman Pendamar Indah. Recorded Wednesday, 9:40 AM.',
        introLine: 'Salmah wipes her hands on her baju. "Sekali saja, ya. Once only. I cannot say it twice."',
        retryLine: 'Salmah closes her eyes and starts again, slower.',
        statement: [
          'On Monday my brother Faizal came at seven, before maghrib. He wanted Azman to lend him eight thousand ringgit for an Ah Long in Klang. Azman said no. Faizal shouted, "Abang ingat abang siapa?" Who do you think you are? And he left without eating.',
          'Azman was quiet the whole evening. For weeks he has been quiet, since what he called "the box that comes every third Monday". He would not say what was in it. Only that it was heavier than the paper said.',
          'At a quarter past ten he took his helmet and his thermos of Milo. At the door he said, "Kalau apa-apa jadi, jangan percaya orang pelabuhan." If anything happens, do not trust the port people. Then he laughed, like it was a joke.',
          'His father, Haji Yusof, had a kelong out in the strait. Nobody has gone out there since Haji Yusof died in 2015. Azman still keeps the old sampan at the Telok Gong jetty. Pak Dollah looks after it, and gets paid in cigarettes.',
          'My cousin Rosnah lives on Pulau Ketam, in the stilt houses by the jetty. Faizal said he would phone her. Faizal shares a flat in Pandamaran with three other drivers. Amir is nine. Every night he waits for his father\'s shapes on the tablet.',
        ],
        questions: [
          { q: 'How much did Faizal want to borrow?', options: ['RM 800', 'RM 8,000', 'RM 18,000', 'RM 80,000'], a: 1 },
          { q: 'What did Azman take to work?', options: ['A thermos of Milo', 'A thermos of kopi', 'A packet of nasi lemak', "His son's tablet"], a: 0 },
          { q: 'When does "the box" come?', options: ['Every Monday', 'Every third Monday', 'On the first of the month', 'Every Friday'], a: 1 },
          { q: 'What did Azman say at the door?', options: ['"Jangan tunggu saya."', '"Jangan percaya orang pelabuhan."', '"Jaga Amir baik-baik."', '"Saya balik pagi."'], a: 1 },
          { q: 'When did Haji Yusof die?', options: ['2005', '2012', '2015', '2019'], a: 2 },
          { q: 'Who looks after the sampan?', options: ['Faizal', 'Pak Dollah', 'Rosnah', 'Tony Kwan'], a: 1 },
          { q: 'Where does Rosnah live?', options: ['Pandamaran', 'Telok Gong', 'Pulau Ketam', 'Pulau Indah'], a: 2 },
          { q: 'How old is Amir?', options: ['Seven', 'Eight', 'Nine', 'Eleven'], a: 2 },
          { q: 'What time did Azman leave home?', options: ['9:45 PM', '10:15 PM', '10:52 PM', '11:30 PM'], a: 1 },
        ],
      },
      evidence: {
        img: 'ev_c2_salmah', hotspot: { x: 0.35, y: 0.55, r: 0.22 },
        title: '"Jangan percaya orang pelabuhan"',
        short: 'Faizal demanded RM 8,000 and stormed out on Monday. Azman: "Don\'t trust the port people." Four places he knows: Faizal\'s flat, Rosnah on Pulau Ketam, the Telok Gong jetty, his father\'s kelong.',
        text: 'Monday, 7 PM: Faizal demanded RM 8,000 for a loan shark and stormed out when Azman refused. At 10:15 PM Azman left for his shift saying, "If anything happens, do not trust the port people." He had been uneasy for weeks about "the box that comes every third Monday". Salmah names the places he knows: Faizal\'s flat in Pandamaran, cousin Rosnah\'s house on Pulau Ketam, the Telok Gong jetty where Pak Dollah minds the old sampan, and his father\'s kelong in the strait.',
      },
    },
    {
      id: 'c2_13', phase: 'Azman\'s home', title: 'Boat, fish, house',
      game: 'tangram', variant: 'classic',
      brief: 'Amir and his father play a game: one makes a shape from the seven tangram pieces, sends a photo of its outline, and the other has to build it back. At 4:10 AM on Tuesday Amir\'s tablet received three outlines from his father\'s phone, and nothing since. Amir cannot build them. His hands shake too much. Build them for him.',
      params: { rounds: 3, shapes: ['boat', 'fish', 'house'] },
      evidence: {
        img: 'ev_c2_tablet', hotspot: { x: 0.52, y: 0.48, r: 0.17 },
        title: 'A message from the water',
        short: '4:10 AM: boat, fish, house. Sent through tower PKT-07\'s west sector, which covers the strait, south Pulau Ketam and the Telok Gong shore. Not Pandamaran.',
        text: 'A boat, a fish, a house. Amir says it is his father telling him he is safe "somewhere with fish". Ken pulls the message\'s metadata for you and does not ask why: it went out at 4:10 AM through tower PKT-07 at Pulau Indah, west sector. That sector covers the strait, the south end of Pulau Ketam and the Telok Gong shore. It does not reach Pandamaran, where Faizal\'s flat is.',
      },
    },
    {
      id: 'c2_14', phase: 'Azman\'s home', title: 'Faizal\'s receipts',
      game: 'quickmath', variant: 'receipts',
      brief: 'Faizal drives a prime mover for a haulage firm that hauls for half the port, Rahman Marine included. Farah had his cab searched and found a glovebox full of crumpled receipts: tolls, diesel, a mamak, a market docket. Check every one against the clock, fast, the way his company\'s auditors never bother to.',
      params: { difficulty: 'expert' },
      evidence: {
        img: 'ev_c2_receipts', hotspot: { x: 0.5, y: 0.42, r: 0.17 },
        title: 'Chow Kit, 2:06 AM',
        short: 'Faizal\'s market docket puts him in Chow Kit at 2:06 AM, forty-five kilometres from Crane 7. His phone called Rosnah on Pulau Ketam twice on Tuesday morning.',
        text: 'A market docket from Chow Kit, stamped 2:06 AM, for eleven crates of cabbage, and a toll receipt from Batu Tiga at 1:22 AM, heading inland. Faizal was forty-five kilometres from Crane 7 when Azman ran. His phone log shows two calls on Tuesday morning to Rosnah on Pulau Ketam, at 7:02 and 7:40. Looking for Azman. Or looking for him first.',
      },
    },

    // ---------------- The hideout trail ----------------
    {
      id: 'c2_15', phase: 'The hideout trail', title: 'The man on the Yamaha',
      game: 'chase', variant: 'one-way',
      brief: 'Since Wednesday a man on a blue Yamaha has followed you from the port to Pandamaran and back. On Thursday morning you double back on him in Klang\'s old town and he runs. The old town is all one-way streets and traffic lights, and he obeys every one of them. You do not have to.',
      params: { rounds: 3 },
      evidence: {
        img: 'ev_c2_phone', hotspot: { x: 0.52, y: 0.62, r: 0.14 },
        title: 'Their list',
        short: 'The rider\'s phone holds a list: Faizal\'s flat, Rosnah\'s house on Pulau Ketam, the Telok Gong shed, the kelong. "Wait for the PI to lead us there."',
        text: 'His phone, unlocked by his own panic. A message from an unsaved number, sent Wednesday: four places, the same four Salmah named. Rumah Faizal, Pandamaran. Rumah Rosnah, Pulau Ketam. Bangsal ikan, Telok Gong. Kelong Haji Yusof. And underneath: "Tunggu PI tu bawa kita ke sana." Wait for the PI to lead us there. You cannot go and look. Wherever you go, they go.',
      },
    },
    {
      id: 'c2_16', phase: 'The hideout trail', title: 'Pak Dollah\'s tape',
      game: 'morse', variant: 'visual',
      brief: 'Pak Dollah has kept the Telok Gong jetty since before the port was a port. He does not talk to men from KL and he does not trust telephones. For forty years he signalled the fishing boats with the lamp on his shed, and he still copies down what the boats flash back, on a roll of paper tape. On Tuesday night a boat with no lights flashed all night long. Read his tape, and he will decide whose side you are on.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c2_tape', hotspot: { x: 0.52, y: 0.48, r: 0.17 },
        title: 'The shed at Telok Gong',
        short: 'Nobody came to the Telok Gong shed. At 3 AM on Tuesday the old sampan went out dark toward the strait. A Rahman Marine tug has searched the water every night since.',
        text: 'The traffic on the tape is a tug talking to someone ashore in code. Pak Dollah knows the tug: Penyu 3, out of Rahman Marine\'s jetty, running without lights every night since Tuesday, searching. He sleeps in the fish-landing shed every night and nobody has come to it, not Monday, not since. But at about 3 AM on Tuesday he heard an outboard he knew: Haji Yusof\'s old sampan, going out with no lights, toward the strait.',
      },
    },

    // ---------------- Interrogation ----------------
    {
      id: 'c2_17', phase: 'Interrogation', title: 'The machine',
      game: 'colorword', variant: 'switch',
      brief: 'Farah gets Tony Kwan and Norhayati Salleh into the D9 interview rooms for one hour each, voluntarily, on the strength of nothing she can write down. The polygraph is older than both of them and has to be calibrated by whoever runs it. Today that is you.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c2_polygraph', hotspot: { x: 0.58, y: 0.5, r: 0.2 },
        title: 'Bay 3',
        short: 'Tony\'s needle stays flat for Azman\'s name and jumps at "Bay 3". He says he cut his hand on Wednesday; the blood on the door bar says Tuesday.',
        text: 'Tony\'s needle lies flat through Azman\'s name, the crane, the van. It jumps twice, both times at the words "Bay 3". He says he cut his hand on a lashing rod on Wednesday afternoon. The lab dated the blood on the door bar to Tuesday morning. Norhayati\'s chart is a flat line from start to finish. Farah says that is what practice looks like.',
      },
    },
    {
      id: 'c2_18', phase: 'Interrogation', title: 'Five interviews',
      game: 'whoslying', variant: 'classic',
      brief: 'Farah lets you sit in on five interviews. Each person either told you the whole truth or lied in everything they said. Work out who lied.',
      params: {
        solvedLine: 'Farah closes the file. "Two liars, and both of them wear a uniform. Of course."',
        people: [
          { id: 'ramli', name: 'Ramli', says: [{ t: '"Faizal is telling the truth."', about: 'faizal', is: true }, { t: '"At least two of the others are lying."', atLeast: 2 }] },
          { id: 'faizal', name: 'Faizal', says: [{ t: '"Tony is lying."', about: 'tony', is: false }, { t: '"Muthu is telling the truth."', about: 'muthu', is: true }] },
          { id: 'muthu', name: 'Muthu', says: [{ t: '"A refrigerated van went out through Gate 3 at 3:10."', fact: true, note: 'The barrier log shows a van at 03:10.' }, { t: '"Norhayati is lying."', about: 'norhayati', is: false }] },
          { id: 'tony', name: 'Tony', says: [{ t: '"Ramli is lying."', about: 'ramli', is: false }, { t: '"Norhayati is telling the truth."', about: 'norhayati', is: true }] },
          { id: 'norhayati', name: 'Norhayati', says: [{ t: '"Tony is telling the truth."', about: 'tony', is: true }, { t: '"Faizal is lying."', about: 'faizal', is: false }] },
        ],
        liars: ['tony', 'norhayati'],
      },
      evidence: {
        img: 'ev_c2_interviews', hotspot: { x: 0.42, y: 0.45, r: 0.17 },
        title: 'Two liars in uniform',
        short: 'Tony and Norhayati lied. Faizal told the truth: he phoned Rosnah twice, and Azman never reached Pulau Ketam.',
        text: 'Tony Kwan and Norhayati Salleh lied in every word. Ramli, Muthu and Faizal told the truth. So Faizal\'s story stands, all of it: he phoned Rosnah twice on Tuesday morning to ask if Azman had come, and he never had. "On Ketam you cannot buy cigarettes without the whole island knowing by breakfast," Faizal says. "He is not there. I wish he was."',
      },
    },
  ],

  outcomes: {
    charged: {
      tony: { en: 'Tony Kwan is charged. He asks for a lawyer from Kuala Lumpur, and a lawyer from Singapore arrives instead, before lunch.' },
      norhayati: { en: 'Norhayati Salleh is charged. She removes her Customs badge herself and lays it on the table, face down.' },
      faizal: { en: 'Faizal Ahmad is charged. He says nothing in the van. At the station he asks only whether anyone has told his sister.' },
    },
    correct: ['tony', 'norhayati'],
  },

  flagNames: ['TONY_FREE', 'NORHAYATI_FREE', 'FAIZAL_WRONGED', 'AZMAN_DEAD', 'AZMAN_ALIVE'],
  flags: ({ charged, answers }) => {
    const dead = charged.includes('faizal') || answers.hideout !== 'kelong';
    return {
      TONY_FREE: !charged.includes('tony'),
      NORHAYATI_FREE: !charged.includes('norhayati'),
      FAIZAL_WRONGED: charged.includes('faizal'),
      AZMAN_DEAD: dead,
      AZMAN_ALIVE: !dead,
    };
  },

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  ending(v) {
    const alive = !v.flags.AZMAN_DEAD;
    const panels = [
      { img: 'c2_out_01_arrest', mood: 'police', fx: ['rain', 'siren'], place: 'Bukit Aman. Friday, 4:30 AM.', music: 'resolution',
        lines: v.charged.map((id) => ({ who: null, en: CASE02.outcomes.charged[id].en })) },
    ];
    if (alive) {
      panels.push(
        { img: 'c2_out_02_kelong', mood: 'day', fx: [], place: 'The strait. Friday, 5:50 AM.',
          lines: [
            { who: null, en: 'The marine police boat finds the kelong at first light. A sampan is tied under it. A man is asleep on the planks with a phone held against his chest.' },
            { who: 'Azman Yusof', orig: 'Saya buka pintu tu. Saya tak boleh tutup balik.', en: 'I opened that door. I could not close it again.' },
          ] },
        { img: 'c2_out_03_reunion', mood: 'day', fx: [], place: 'Telok Gong jetty.',
          lines: [
            { who: null, en: 'Amir reaches him first. He is holding the wooden triangle.' },
            { who: 'Salmah', orig: 'Terima kasih. Saya tak tahu nak cakap apa lagi.', en: 'Thank you. I do not know what else to say.' },
            { who: null, en: 'On Azman\'s phone: forty-one photographs of the inside of Container 47. Farah finds the van in a Shah Alam cold store by noon. Twenty-three people. All of them alive.' },
          ] },
      );
    } else {
      panels.push(
        { img: 'c2_out_02_mudflat', mood: 'day', fx: [], place: 'Telok Gong. Friday, 6:40 AM.',
          lines: [
            { who: null, en: 'Fishermen find him at low tide, in the mangroves below the jetty.' },
            { who: 'Inspector Farah Iskandar', en: 'The coroner will say drowning. Misadventure. He fell from a boat in the dark.' },
            { who: 'Inspector Farah Iskandar', orig: 'Fail ditutup.', en: 'The file is closed.' },
          ] },
        { img: 'c2_out_03_funeral', mood: 'day', fx: [], place: 'Pandamaran. Friday, after Asar.',
          lines: [
            { who: 'Salmah', orig: 'Sekurang-kurangnya saya boleh kebumikan dia.', en: 'At least I can bury him.' },
            { who: null, en: 'Amir stands at the graveside with a wooden triangle in his fist. He does not cry. He looks at you the whole time.' },
            { who: null, en: 'His phone was never found. Neither was the van, or anyone who rode in it.' },
          ] },
      );
    }
    panels.push({
      img: 'c2_out_04_bay3', mood: 'night', fx: ['dust'], place: 'Warehouse 6, Bay 3. That night.', music: 'memory',
      lines: [
        { who: null, en: 'Tony Kwan resigns by text message and boards the evening flight to Colombo.', when: (f) => f.TONY_FREE },
        { who: null, en: 'Norhayati Salleh is transferred to Sandakan, at her own request.', when: (f) => f.NORHAYATI_FREE },
        { who: null, en: 'Bay 3 has a new roof and new paint. The floor under the paint is still black.' },
        { who: 'Inspector Farah Iskandar', en: 'One more thing from the port cameras. Tuesday, 2:41 AM, at this door. I cannot see his face.' },
        { who: null, en: 'A man in a dark jacket, lighting a cigarette. The flame comes from a silver flip-top lighter.' },
        { who: null, en: 'Your hand goes to your pocket. Daniel\'s lighter is still there. Of course it is.' },
      ],
    });
    return panels;
  },
};
