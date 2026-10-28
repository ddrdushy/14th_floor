// CASE 1: THE FALL. Residensi Seri Kiara, Mont Kiara, KL.
// Truth (writers only): Jason Ooi pushed Dr. Goh; Rizal Hamdan wiped the CCTV. Both were paid.
// Shanti Menon is innocent of murder but was stealing from the clinic.

export const CASE01 = {
  id: 'case01',
  number: 1,
  title: 'The Fall',
  place: 'Mont Kiara, Kuala Lumpur',
  victim: 'Dr. Henry Goh, 58, forensic dentist',
  question: 'Who is responsible for the death of Dr. Henry Goh?',
  brief: 'Police say Dr. Henry Goh jumped from his 14th-storey balcony at 11:52 PM. His daughter Rachel says he did not. You have until the police close the file.',
  hints: 5,
  openingScreen: 'intro',
  music: 'investigation',
  mapIntro: 'Every puzzle you solve uncovers one piece of evidence. Nobody will tell you how many pieces there are. When you have enough, you name the killer yourself.',
  finalLabel: 'Name the killer',
  deduction: {
    lede: 'Farah will make the arrests on your word alone. Charge everyone you believe is responsible, and only them. There is no one to tell you if you are right.',
    confirm: 'Farah will charge {names}. Once the file is closed, the city moves on.',
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy
  // in cases.js). Until it is solved they are not on the map, the board or the office wall.
  suspects: [
    {
      id: 'shanti', name: 'Dr. Shanti Menon', role: 'Clinic partner, 44', img: 'sus_shanti',
      revealedBy: 'l04',
      revealLine: "She told the police she never went near the balcony. The door handle remembers her.",
      look: { skin: '#8d5a3a', hair: 'bun', hairColor: '#151210', coat: 'blazer', eyewear: 'square', mark: 'none' },
      motive: 'Goh had found money missing from the clinic accounts.',
      claim: 'Visited at 9 PM to talk about the clinic. Says she left by 9:40.',
    },
    {
      id: 'rizal', name: 'Rizal Hamdan', role: 'Night security guard, 31', img: 'sus_rizal',
      revealedBy: 'l06',
      revealLine: "A young guard with a torch knocked at midnight to ask what the neighbour had heard. That night the guard was Rizal Hamdan.",
      look: { skin: '#b97f55', hair: 'short', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'moustache' },
      motive: 'None known. Earns RM 1,900 a month.',
      claim: 'Says he never left the guardhouse between 11 PM and midnight.',
    },
    {
      id: 'jason', name: 'Jason Ooi', role: 'Property agent, 36', img: 'sus_jason',
      revealedBy: 'l07',
      revealLine: "At 11:40 he was in the empty unit next door with a clipboard. He says he never met Dr. Goh.",
      look: { skin: '#f1d2b6', hair: 'side-part', hairColor: '#151210', coat: 'blazer', eyewear: 'none', mark: 'none' },
      motive: 'None known. Says he had never met Dr. Goh.',
      claim: 'Was showing Unit 15-2 to a buyer who never arrived. Says he left at 11:30.',
    },
  ],

  // Phases appear on the map only when the player reaches them. Level count is never shown.
  levels: [
    // ---------------- The balcony ----------------
    {
      id: 'l01', phase: 'The balcony', title: 'What the rain left',
      game: 'wordsearch', variant: 'secret',
      brief: 'Rachel kept everything on the balcony exactly as she found it. Search the scene. When every item is found, the letters nobody used will tell you what the police missed.',
      params: {
        size: 12,
        words: ['RAILING', 'SLIPPER', 'ORCHID', 'ASHTRAY', 'TEACUP', 'UMBRELLA', 'CURTAIN', 'KEYCARD', 'LANTERN', 'DOORMAT', 'PLANTER', 'NEWSPAPER', 'COIN', 'CHAIR'],
        extra: ['TILES', 'DRAIN', 'GLOVE', 'TOWEL', 'HOSE', 'MAT', 'POT', 'LAMP', 'CUP', 'RUG'],
        message: 'HEELSDRAGGEDTOTHERAIL',
        messageSpaced: 'HEELS DRAGGED TO THE RAIL',
      },
      evidence: {
        tag: 1, img: 'ev_balcony', hotspot: { x: 0.5, y: 0.74, r: 0.14 },
        title: 'Heel marks on the tiles',
        short: 'Two black scuffs drag toward the railing.',
        text: 'Two black rubber scuffs run across the wet tiles toward the railing. People who jump walk. Dr. Goh was dragged.',
      },
    },
    {
      id: 'l02', phase: 'The balcony', title: 'Two photographs',
      game: 'spotdiff', variant: 'classic',
      brief: 'Rachel photographed the balcony at 12:05 AM, before the police arrived. Their photo was taken at 12:40 AM. Find every change between the two.',
      params: { differences: 9, scene: 'balcony' },
      evidence: {
        tag: 2, img: 'ev_footprints', hotspot: { x: 0.38, y: 0.6, r: 0.15 },
        title: 'A second set of footprints',
        short: "Slippers and a size 10 brogue. The brogue print is gone from the police photo.",
        text: "In Rachel's photo: Dr. Goh's slipper prints, and a second set from a size 10 leather brogue. By the time police photographed the balcony, the brogue prints had been trampled away.",
      },
    },
    {
      id: 'l03', phase: 'The balcony', title: 'Under the chair',
      game: 'sudoku', variant: 'classic',
      brief: 'Something glints under the overturned rattan chair, but the photo is too dark. Work the grid while the lab brightens the image.',
      params: { difficulty: 'hard' },
      evidence: {
        tag: 3, img: 'ev_watch', hotspot: { x: 0.5, y: 0.56, r: 0.12 },
        title: 'Watch stopped at 11:52',
        short: "Dr. Goh's wristwatch, glass cracked, stopped at 11:52 PM.",
        text: "Dr. Goh's wristwatch, strap torn, glass cracked. The hands stopped at 11:52 PM. It came off on the balcony, not on the ground fourteen storeys below.",
      },
    },

    // ---------------- The forensics lab ----------------
    {
      id: 'l04', phase: 'Forensics lab', title: 'A print on the door',
      game: 'fingerprint', variant: 'classic',
      brief: 'Your old friend at the Bukit Aman lab lifted a partial print from the inside handle of the balcony door. Classify it, then find its owner among the eight people on file.',
      params: {
        candidates: [
          { id: 'goh', name: 'Dr. Henry Goh' },
          { id: 'rachel', name: 'Rachel Goh' },
          { id: 'shanti', name: 'Dr. Shanti Menon' },
          { id: 'rizal', name: 'Rizal Hamdan' },
          { id: 'jason', name: 'Jason Ooi' },
          { id: 'siti', name: 'Siti Aminah' },
          { id: 'lee', name: 'Lee Mei Fong' },
          { id: 'cleaner', name: 'Unknown courier' },
        ],
        answer: 'shanti',
      },
      evidence: {
        tag: 4, img: 'ev_doorhandle', hotspot: { x: 0.55, y: 0.36, r: 0.12 },
        title: "Shanti's print on the door",
        short: 'Partial print on the inside balcony handle: Dr. Shanti Menon.',
        text: 'The partial print on the inside of the balcony door handle belongs to Dr. Shanti Menon. She told the police she never went near the balcony.',
      },
    },
    {
      id: 'l05', phase: 'Forensics lab', title: 'The missing floor',
      game: 'series', variant: 'lift',
      brief: "The building's lift controller logs every stop as a number series. Crack the six sequences the technician flagged and the log will open.",
      params: {
        items: [
          { prompt: '2, 3, 5, 9, 17, ?', answer: 33, hint: 'Each number is double the previous, minus one.' },
          { prompt: 'Tower B skips every label that contains the digit 4. Its lift goes 1, 2, 3, 5 … What label does the 40th storey carry?', answer: 55, hint: 'Count the labels without a 4: 1–3, 5–13, 15–23, 25–33, 35–39, then 50 …' },
          { prompt: '3, 4, 7, 11, 18, 29, ?', answer: 47, hint: 'Add the two numbers before.' },
          { prompt: '1, 4, 9, 61, 52, 63, 94, ?', answer: 46, hint: 'Square numbers, written backwards.' },
          { prompt: '2, 6, 12, 20, 30, 42, ?', answer: 56, hint: 'n × (n + 1).' },
          { prompt: '7, 10, 8, 11, 9, 12, ?', answer: 10, hint: 'Two series woven together.' },
        ],
      },
      evidence: {
        tag: 5, img: 'ev_liftpanel', hotspot: { x: 0.5, y: 0.47, r: 0.1 },
        title: 'The lift stopped at "15" twice',
        short: "No Floor 14 on the panel. The lift stopped at Goh's floor at 11:38 and 11:55 PM.",
        text: "The panel jumps from 13 to 15, so the police report says the doctor fell from Floor 15. The lift log shows two stops at his floor: 11:38 PM going up, and 11:55 PM going down, three minutes after the watch stopped.",
      },
    },

    // ---------------- Brickfields ----------------
    {
      id: 'l05b', phase: 'Brickfields', title: 'Your own stairs',
      game: 'pursuit',
      brief: "On Monday morning you go home to Brickfields to sleep for an hour, and Bala Anne is waiting at the foot of your stairs with a tea towel over his shoulder. A boy has sat at table 6 since six o'clock with one teh and no money, he says, and five minutes ago he went up to your office. He is coming down as you go up. He goes past you, out through Bala's kitchen and into the back lanes behind Jalan Tun Sambanthan. He is nineteen and fast. You are neither. Run anyway.",
      params: {
        setting: 'city', vehicle: 'foot', difficulty: 'easy', suspect: 'The runner',
        route: ['city', 'market', 'rooftop', 'city'], legs: 4, skyline: 'kl',
        beats: [
          'Out of the back lanes and into the flower stalls of Little India, jasmine and wet newspaper underfoot.',
          'Up a fire stair behind the sari shops and out across the shophouse roofs, the KL Tower lit up ahead.',
          'Down a drainpipe onto Jalan Tun Sambanthan, under the monorail. He is nineteen, and he is tiring.',
        ],
        clue: 'Bala Anne: "Table 6, since six o\'clock. One teh, no money. Then up your stairs."',
      },
      evidence: {
        img: 'ev_c1_backlane', hotspot: { x: 0.40, y: 0.78, r: 0.15 },
        title: 'Before Rachel called',
        short: 'The boy on your stairs was paid RM 300 to photograph your desk and take any letter "from the dentist". The order reached his phone at 12:31 AM on Sunday: forty minutes after Goh fell, two hours before Rachel called you.',
        text: 'Selvam, nineteen, runs errands for the money changers on Jalan Tun Sambanthan, and he talks with his cheek in a puddle behind the banana-leaf kitchens. His phone holds eleven photographs of your desk: the dead fan, the drawer, the silver lighter. And one message, from a Singapore number he does not know, sent at 12:31 AM on Sunday: "PI atas kedai mamak Brickfields. Gambar meja dia. Kalau ada surat dari doktor gigi, ambil." The PI above the mamak in Brickfields. Photograph his desk. If there is a letter from the dentist, take it. RM 300, cash, left under a saucer at table 6. There was no letter. Henry Goh fell at 11:52. Rachel did not dial your number until 2:47. Somebody knew whose number he had given her before she did.',
      },
    },

    // ---------------- The witness ----------------
    {
      id: 'l06', phase: 'The neighbour', title: 'Mrs. Lee remembers',
      game: 'witness', variant: 'statement',
      brief: "Mrs. Lee Mei Fong, 71, from the unit next door, will only say it once. Read her statement carefully. Then answer from memory.",
      params: {
        readSeconds: 90,
        pass: 7,
        statement: [
          'I was watching my Hong Kong drama on TVB. My son calls me every Saturday at half past eleven, so I know the time. Tonight he called late, at 11:40.',
          "While we talked, I heard voices from Dr. Goh's side. Two men, I think. One spoke English, very politely. The other said in Malay, “Sign saja lah, doktor.” Just sign it, doctor.",
          'Dr. Goh said "No" three times. Then a door slammed. I told my son I would call him back and looked through the peephole. Nobody in the corridor. Only the lift light, going down.',
          'Maybe ten minutes later I heard a short shout and something like a chair falling. My cat Mochi ran under the sofa. I thought it was thunder.',
          'At midnight the security guard knocked. A young man in a wet raincoat, holding a torch. He asked if I heard anything. I said no. I do not know why I said no.',
        ],
        questions: [
          { q: 'What was Mrs. Lee watching?', options: ['A Hong Kong drama', 'A Korean drama', 'The late news', 'A football match'], a: 0 },
          { q: 'What time did her son call?', options: ['11:30 PM', '11:40 PM', '11:50 PM', 'Midnight'], a: 1 },
          { q: 'What did the second man say?', options: ['"Diam saja, doktor."', '"Jangan lari, doktor."', '"Sign saja lah, doktor."', '"Buka pintu, doktor."'], a: 2 },
          { q: 'How many times did Dr. Goh say "No"?', options: ['Once', 'Twice', 'Three times', 'He said nothing'], a: 2 },
          { q: 'What did she see through the peephole?', options: ['A man in a suit', 'The guard', 'Only the lift light, going down', 'Nothing, the corridor was dark'], a: 2 },
          { q: 'How long after the door slammed did she hear the shout?', options: ['About two minutes', 'About ten minutes', 'About half an hour', 'Right away'], a: 1 },
          { q: "What is her cat's name?", options: ['Mochi', 'Tofu', 'Lychee', 'Bobo'], a: 0 },
          { q: 'Who knocked on her door at midnight?', options: ['Inspector Farah', 'Rachel Goh', 'A young guard holding a torch', 'Nobody'], a: 2 },
        ],
      },
      evidence: {
        tag: 7, img: 'ev_neighbour', hotspot: { x: 0.36, y: 0.44, r: 0.13 },
        title: '"Sign saja lah, doktor."',
        short: 'Two men argued with Goh around 11:40. Ten minutes later: a shout. At midnight the guard came, torch in hand.',
        text: 'Mrs. Lee heard two men in Goh\'s unit around 11:40 PM pressuring him to sign something. About ten minutes later, a shout. At midnight a young guard with a torch knocked on her door, asking what she had heard.',
      },
    },
    {
      id: 'l07', phase: 'The neighbour', title: 'Where was everyone?',
      game: 'logicgrid', variant: 'classic',
      brief: 'Five people were near Floor 14 at 11:40 PM. Use the clues from the visitor log and statements to place each one and what they were holding.',
      params: {
        categories: [
          { name: 'Person', items: ['Shanti', 'Rizal', 'Jason', 'Mrs. Lee', 'Siti'] },
          { name: 'Location', items: ['Mamak, Bangsar', 'Stairwell, L15', 'Unit 15-2', 'Unit 15-3', 'Car park B2'] },
          { name: 'Holding', items: ['Receipt', 'Torch', 'Clipboard', 'Teacup', 'Mop bucket'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]],
        clues: [
          'Siti Aminah, the night cleaner, was below ground.',
          'The mop bucket never left the basement.',
          'Neither man in the visitor log was outside the building.',
          'Rizal was not inside any unit.',
          'The receipt was printed in Bangsar.',
          'Whoever was in Unit 15-2 was carrying paperwork.',
          'The torch was not in a unit.',
          'The teacup was in a unit, in a woman\'s hand.',
          'Dr. Shanti Menon was not holding the teacup.',
        ],
      },
      evidence: {
        tag: 8, img: 'ev_floorplan', hotspot: { x: 0.56, y: 0.4, r: 0.15 },
        title: 'Everyone at 11:40 PM',
        short: 'Shanti: mamak in Bangsar. Rizal: stairwell, L15. Jason: Unit 15-2, next door to Goh.',
        text: 'At 11:40 PM: Shanti was paying for teh tarik in Bangsar, 15 minutes away. Rizal was in the L15 stairwell with his torch. Jason was in Unit 15-2, next door to Goh, with his clipboard. Mrs. Lee was home. Siti was mopping in B2.',
      },
    },

    // ---------------- The doctor's secrets ----------------
    {
      id: 'l08', phase: "The doctor's secrets", title: 'The dental diary',
      game: 'cipher', variant: 'dental',
      brief: "Goh wrote his private notes in his own code, using the tooth symbols from his dental charts. Each tooth stands for one letter. Break it.",
      params: {
        message: 'I KEPT THE XRAY. PK ZERO EIGHT TWO ONE. THE SAFE REMEMBERS RACHEL. IF I DIE IT WAS NOT AN ACCIDENT.',
        given: ['E', 'T', 'A'],
      },
      evidence: {
        tag: 9, img: 'ev_diary', hotspot: { x: 0.42, y: 0.42, r: 0.16 },
        title: '"If I die, it was not an accident"',
        short: 'Goh kept an X-ray, PK-0821, in his safe. He expected to be killed.',
        text: 'Decoded: "I kept the X-ray. PK zero eight two one. The safe remembers Rachel. If I die it was not an accident." He knew someone wanted him dead.',
      },
    },
    {
      id: 'l09', phase: "The doctor's secrets", title: 'The safe',
      game: 'safecracker', variant: 'classic',
      brief: 'A wall safe behind the framed diploma. Four digits, no two the same. The lock marks every digit you try: right place, wrong place, or not in the code at all. Eight tries before it jams for a moment.',
      params: {
        digits: 4, tries: 8, bonus: 4, repeats: false,
        clue: 'Goh\'s diary: "The safe remembers Rachel." Tucked into the diploma frame is a photo of Rachel blowing out candles shaped like a 7.',
        contains: [7],
      },
      evidence: {
        tag: 10, img: 'ev_safe', hotspot: { x: 0.43, y: 0.62, r: 0.14 },
        title: 'X-ray, ledger, unsent letter',
        short: 'X-ray PK-0821. A ledger showing RM 180,000 missing. A letter: "On Monday I tell the police the truth."',
        text: 'Inside: a dental X-ray labelled PK-0821. The clinic ledger, with RM 180,000 moved to an account in Shanti Menon\'s name. And an unsent letter: "On Monday I will tell the police the truth about what I did in 2021."',
      },
    },

    // ---------------- The security room ----------------
    {
      id: 'l10', phase: 'The security room', title: 'Seventeen minutes',
      game: 'timeline', variant: 'cctv',
      brief: "The guardhouse recorder still holds eight frames from that night, out of order. Put them in order. The lock tells you how many are in the right place.",
      params: {
        frames: [
          { id: 'a', clock: '23:2▮', title: 'Lobby', text: 'Jason Ooi signs the visitor book. Clipboard under his arm, raincoat dripping.' },
          { id: 'b', clock: '23:3▮', title: 'Car park B2', text: 'Siti pushes her mop bucket past pillar B2-07. Behind her, the lift indicator shows the car climbing past 9.' },
          { id: 'c', clock: '▮▮:38', title: 'Inside the lift', text: 'Jason alone, still wet from the rain. The display reads 15.' },
          { id: 'd', clock: '23:40', title: 'Guardhouse', text: 'Empty chair. The torch is missing from its hook.' },
          { id: 'e', clock: '23:41', title: 'All cameras', text: 'Static. Every feed cuts out at once.' },
          { id: 'f', clock: '23:5▮', title: 'Lift lobby, L15', text: 'The feed comes back. Nobody there. Wet footprints lead to the stairwell.' },
          { id: 'g', clock: '00:0▮', title: 'Loading bay', text: 'The barrier lifts for a dark sedan. The plate is out of frame.' },
          { id: 'h', clock: '00:0▮', title: 'Guardhouse', text: 'Rizal is back in his chair, drying his torch. Behind him, the loading bay barrier on the monitor is still swinging down.' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      },
      evidence: {
        tag: 11, img: 'ev_cctv', hotspot: { x: 0.49, y: 0.55, r: 0.09 },
        title: '17 minutes deleted',
        short: 'CCTV from 11:41 to 11:58 PM was deleted from the guardhouse terminal, logged in as R.HAMDAN.',
        text: 'The recorder log: footage from 11:41 to 11:58 PM was deleted at 12:09 AM from the guardhouse terminal. User: R.HAMDAN.',
      },
    },
    {
      id: 'l11', phase: 'The security room', title: 'One frame survived',
      game: 'nonogram', variant: 'classic',
      brief: 'Ken recovered a damaged thumbnail from the recorder cache. Only the row and column counts survived. Rebuild the picture.',
      params: {
        picture: [
          '.....#####.....',
          '....##...##....',
          '...##.#.#.##...',
          '...#.......#...',
          '...#.#.#.#.#...',
          '...#.......#...',
          '....#.#.#.#....',
          '....#.....#....',
          '.....#.#.#.....',
          '.....#####.....',
          '...............',
          '....#######....',
          '....#.#.#.#....',
          '....#######....',
          '.....#####.....',
        ],
      },
      evidence: {
        tag: 12, img: 'ev_shoe', hotspot: { x: 0.6, y: 0.82, r: 0.12 },
        title: 'A brogue leaving the lift',
        short: 'The recovered frame: a size 10 brogue sole stepping out of the lift on L15 at 11:55 PM.',
        text: 'The cached thumbnail shows a leather brogue sole, perforated wingtip pattern, stepping out of the lift on L15 at 11:55 PM. The same tread as the print on the balcony.',
      },
    },

    // ---------------- Interrogation ----------------
    {
      id: 'l12', phase: 'Interrogation', title: 'Five interviews',
      game: 'whoslying', variant: 'classic',
      brief: "Farah let you sit in on the interviews. Each person either told you the whole truth or lied in everything they said. Work out who lied.",
      params: {
        people: [
          { id: 'lee', name: 'Mrs. Lee', says: [{ t: '"Siti is telling the truth."', about: 'siti', is: true }, { t: '"At least two of the others are lying."', atLeast: 2 }] },
          { id: 'siti', name: 'Siti', says: [{ t: '"I was mopping in car park B2 at 11:40."', fact: true, note: 'The CCTV frame from B2 confirms this.' }, { t: '"Rizal is lying."', about: 'rizal', is: false }] },
          { id: 'rizal', name: 'Rizal', says: [{ t: '"Jason is telling the truth."', about: 'jason', is: true }, { t: '"Mrs. Lee is lying."', about: 'lee', is: false }] },
          { id: 'jason', name: 'Jason', says: [{ t: '"Rizal is telling the truth."', about: 'rizal', is: true }, { t: '"Dr. Shanti is telling the truth."', about: 'shanti', is: true }] },
          { id: 'shanti', name: 'Dr. Shanti', says: [{ t: '"Jason is telling the truth."', about: 'jason', is: true }, { t: '"Siti is lying."', about: 'siti', is: false }] },
        ],
        liars: ['rizal', 'jason', 'shanti'],
      },
      evidence: {
        tag: 13, img: 'ev_interview', hotspot: { x: 0.48, y: 0.66, r: 0.14 },
        title: 'Three liars, two payments',
        short: 'Shanti, Rizal and Jason all lied. Next morning Rizal and Jason each received RM 5,000 from Sinar Holdings.',
        text: 'Shanti, Rizal and Jason all lied to you. Farah pulled their bank records: the morning after the death, Rizal and Jason each received RM 5,000 from a Singapore company called Sinar Holdings. Shanti received nothing.',
      },
    },

    // ---------------- Breakthrough ----------------
    {
      id: 'l13', phase: 'Breakthrough', title: 'The way out',
      game: 'maze', variant: 'cameras',
      brief: "Whoever came down from Floor 14 at 11:55 left without being filmed. Trace the only route from the stairwell door to an exit that no camera can see.",
      params: {
        map: [
          '#####################',
          '#S....#.......#....M#',
          '#.##..#..###..#..####',
          '#.#...#....#..#.....#',
          '#.#.###.##.#..####..#',
          '#...#...#..#........#',
          '###.#.###..######.###',
          '#...#...#.......#...#',
          '#.#####.#.#####.#.#.#',
          '#.......#.....#...#.B',
          '#.#######.#.#.#####.#',
          '#.........#.#.......#',
          '###########L#########',
        ],
        cameras: [
          { x: 17, y: 3, dir: 'N', range: 3 },
          { x: 19, y: 5, dir: 'W', range: 5 },
          { x: 19, y: 11, dir: 'N', range: 4 },
          { x: 9, y: 7, dir: 'E', range: 6 },
        ],
        exits: { L: 'Loading bay', M: 'Main gate', B: 'Lobby' },
        answer: 'L',
      },
      evidence: {
        tag: 14, img: 'ev_loadingbay', hotspot: { x: 0.68, y: 0.5, r: 0.1 },
        title: 'Loading bay, 12:03 AM',
        short: 'The only unseen exit. Gate log: car WXY 1408 left at 12:03 AM. Owner: Jason Ooi.',
        text: 'The only way out no camera can see is the loading bay. Its gate keeps its own log: car WXY 1408 left at 12:03 AM. Registered owner: Jason Ooi.',
      },
    },
  ],

  outcomes: {
    // per-suspect lines used to assemble the ending for any combination the player charges
    charged: {
      shanti: { en: 'Dr. Shanti Menon is charged with murder. She admits to stealing from the clinic. She swears she was in Bangsar when Henry Goh fell.' },
      rizal: { en: 'Rizal Hamdan is charged. He breaks within an hour: "They paid me five thousand to delete seventeen minutes. I never touched the doctor."' },
      jason: { en: 'Jason Ooi is charged with murder. He says nothing at all. On his way to the van, he smiles at you like he knows something you don\'t.' },
    },
    correct: ['jason', 'rizal'],
  },

  // Hidden consequences. The player is never told which of these were set.
  flagNames: ['JASON_FREE', 'RIZAL_FREE', 'SHANTI_WRONGED'],
  flags: ({ charged }) => ({
    JASON_FREE: !charged.includes('jason'),
    RIZAL_FREE: !charged.includes('rizal'),
    SHANTI_WRONGED: charged.includes('shanti'),
  }),

  // The ending, assembled from whoever was charged. v: see verdictOf() in cases.js.
  ending(v) {
    const caughtBoth = CASE01.outcomes.correct.every((id) => v.has(id));
    return [
      { img: 'out_arrest', mood: 'police', fx: ['rain', 'siren'], place: 'Bukit Aman, two days later.', music: 'resolution',
        lines: v.charged.map((id) => ({ who: null, en: CASE01.outcomes.charged[id].en })) },
      { img: 'out_rachel', mood: 'night', fx: ['rain'],
        lines: [
          { who: 'Rachel Goh', en: caughtBoth ? 'They are saying it was murder now. Not a jump. Thank you.' : 'The police say it is over. I want to believe them.' },
          { who: 'Rachel Goh', en: `My father trusted you, ${v.you}. I still do not know why.` },
        ] },
      { img: 'out_xray', mood: 'night', fx: ['dust'], music: 'memory',
        lines: [
          { who: null, en: 'One thing nobody asked about: the X-ray from the safe. PK-0821.' },
          { who: null, en: 'Port Klang. August 2021. The month of the fire.' },
          { who: null, en: 'You put it in the drawer next to the paper kancil, and you do not sleep.' },
        ] },
    ];
  },
};
