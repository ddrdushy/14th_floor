// SIDE CASE: THE DURIAN STALL. SS2, Petaling Jaya.
// Truth (writers only): Bobby Tan drugged Ah Hock's kopi with his mother's sleeping pills, took the
// biscuit-tin cash box (RM 41,600) and sent it out in a durian export carton with a despatch rider.
// Ah Lan Wong was skimming small change all season but did not take the tin. Ravi is innocent.
// The paper boat in the tin is Bobby's nervous habit. It is not connected to the kancil. Nobody says so.

export const SIDE01 = {
  id: 'side01',
  label: 'Side case',
  title: 'The Durian Stall',
  place: 'SS2, Petaling Jaya',
  victim: 'Lau Kim Hock, 67, durian seller. Drugged and robbed of RM 41,600.',
  question: 'Who robbed Ah Hock?',
  brief: "Ken Lim's uncle sells durian on the SS2 row. On Saturday night someone put him to sleep with his own kopi and walked off with the season's takings in a biscuit tin. PJ police have it as a theft. Ken has it as family.",
  hints: 4,
  music: 'investigation',
  mapIntro: 'A small case, Ken says. Small money for the police, all the money in the world for his uncle. Every puzzle gives up one exhibit. When you know who carried the tin away, say so.',
  finalLabel: 'Name the thief',
  phoneIdle: 'No missed calls. Ken sent a photo of a durian with a thumbs up. You do not reply.',
  deduction: {
    lede: 'PJ police will act on what you hand them, and nothing else. Name everyone who took part in the robbery, and only them.',
    button: 'Hand it to PJ police',
    confirm: 'PJ police will charge {names}. Ken will tell the whole family you did it.',
    confirmTitle: 'Hand over the names?',
    confirmButton: 'Hand them over',
  },

  suspects: [
    {
      id: 'ahlan', name: 'Wong Siew Lan', role: 'Stall cashier, 34. Ah Hock\'s niece', img: 'sus_ahlan',
      look: { skin: '#f1d2b6', hair: 'long', hairColor: '#3b2a1f', coat: 'batik', eyewear: 'round', mark: 'none' },
      motive: 'Owes RM 22,000 to an online betting site. Counts the money every night.',
      claim: 'Says she counted RM 41,600 at 11 PM, went home at 11:30 and never touched a sen.',
    },
    {
      id: 'ravi', name: 'Ravi Chandran', role: 'Rival durian seller, 41', img: 'sus_ravi',
      look: { skin: '#8d5a3a', hair: 'short', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'moustache' },
      motive: 'Wants Ah Hock\'s corner pitch. Shouted at him at 10 PM in front of customers.',
      claim: 'Says he was at his scale the whole night and his own camera will prove it.',
    },
    {
      id: 'bobby', name: 'Bobby Tan', role: 'Stall helper, 23', img: 'sus_bobby',
      look: { skin: '#f1d2b6', hair: 'side-part', hairColor: '#c9a24a', coat: 'leather', eyewear: 'none', mark: 'none' },
      motive: 'None known. Ah Hock calls him the son he never had.',
      claim: 'Says he was opening durians at the front table until 1 AM, when he found Ah Hock asleep in his chair.',
    },
  ],

  opening: [
    {
      img: 'sd_intro_01_ken', mood: 'warm', fx: ['dust'], place: 'Brickfields. Sunday, 4:10 PM.', music: 'office',
      lines: [
        { who: 'Bala Anne', orig: 'Thambi! Andha durian-a mela kondu poga koodaadhu!', en: 'Boy! You cannot take that durian upstairs!' },
        { who: null, en: 'Ken Lim takes it upstairs anyway. He has been ignoring Bala Anne since Form Three.' },
        { who: 'Ken Lim', orig: 'Ah Hock Suk hai ngo suk fu ah. Bong ngo yat ci. Ngo kau neih.', en: 'Uncle Hock is my uncle. Help me this once. I am begging you.' },
      ],
      kb: { from: [1.06, -2, 0], to: [1.0, 2, 0] },
    },
    {
      img: 'sd_intro_02_ss2', mood: 'night', fx: ['dust'], place: 'SS2, Petaling Jaya. Saturday, 11:40 PM.',
      lines: [
        { who: null, en: 'Durian season. Every stall on the row lit up like a shrine, every table sticky, every one of them cash only.' },
        { who: null, en: 'By midnight Ah Hock was asleep in his plastic chair, and the takings were gone.' },
      ],
      kb: { from: [1.0, 3, 0], to: [1.1, -3, 0] },
    },
    {
      img: 'sd_intro_03_hospital', mood: 'day', fx: [], place: 'University Malaya Medical Centre. Sunday.',
      lines: [
        { who: 'Lau Kim Hock', orig: 'Go bui kopi… hou fu. Hou fu.', en: 'That kopi… so bitter. So bitter.' },
        { who: null, en: 'The doctors found enough sleeping pill in his blood to drop a man half his age.' },
      ],
      kb: { from: [1.1, 0, 0], to: [1.02, 0, 1] },
    },
    {
      img: 'sd_intro_04_tin', mood: 'night', fx: [],
      lines: [
        { who: 'Ken Lim', en: 'Forty-one thousand six hundred. The whole season. Auntie\'s knee operation is in that tin.' },
        { who: null, en: 'A red Khong Guan biscuit tin, lid off, licked clean. Except for one thing at the bottom.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.16, 0, 2] },
    },
    {
      img: 'sd_intro_05_boat', mood: 'night', fx: [],
      lines: [
        { who: null, en: 'A stall receipt, folded small and neat. Into a boat.' },
        { who: null, en: 'Not a kancil. A boat. You tell yourself that is different, and you put it in your pocket.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.22, 0, 0] }, music: 'tension',
    },
    {
      img: 'sd_intro_06_farah', mood: 'police', fx: [],
      lines: [
        { who: 'Inspector Farah Iskandar', orig: 'Jangan pandang aku macam tu. Aku off duty.', en: 'Do not look at me like that. I am off duty.' },
        { who: 'Inspector Farah Iskandar', en: 'Best D24 in PJ, this row. PJ police will file it and forget it. I will eat and not interfere. Probably.' },
        { who: null, en: 'Behind you, Ken\'s phone buzzes. He turns it face down on the table before you can see the name.' },
      ],
      kb: { from: [1.05, 2, 0], to: [1.0, -2, 0] },
    },
    { title: { kicker: 'Side case', name: 'The Durian Stall' }, fx: [] },
  ],

  levels: [
    // ---------------- The stall ----------------
    {
      id: 'sd01', phase: 'The stall', title: 'The table at 1 AM',
      game: 'hiddenobject', variant: 'list',
      brief: 'Ah Hock\'s folding table is still exactly as Ken found it: husks, rubber gloves, plastic bags, an ashtray, his reading glasses. The thief cleared one thing off it. Search everything that is left.',
      params: { scene: 'mamak', targets: 14, objects: 76 },
      evidence: {
        img: 'ev_sd_cup', hotspot: { x: 0.53, y: 0.45, r: 0.18 },
        title: 'The bitter cup',
        short: 'Chalky ring in Ah Hock\'s kopi cup. Under it, a torn pharmacy label: "...EI LING. Zolpidem 10 mg."',
        text: 'Ah Hock\'s kopi cup has a chalky white ring at the bottom. Stuck to its wet base, a torn corner of a pharmacy label: "...EI LING. Zolpidem 10 mg. One tablet at night." Someone brought sleeping pills from home, and they were not his.',
      },
    },
    {
      id: 'sd02', phase: 'The stall', title: 'Ah Hock\'s riddle book',
      game: 'riddles', variant: 'mixed',
      brief: 'The doctors will not let Ah Hock talk for long. But for thirty years he has kept a school exercise book of teka-teki to tease his regulars, and the stall\'s day book is in the back of it. Ken says he only lets people who can answer his riddles read the back pages.',
      params: { riddles: 5, situations: 2, reveals: 4 },
      evidence: {
        img: 'ev_sd_notebook', hotspot: { x: 0.5, y: 0.5, r: 0.2 },
        title: 'The last page',
        short: 'Saturday 9 PM: Bobby asked for RM 3,000 for his mother Mei Ling\'s hospital bill. Ravi wants the corner. Ah Lan\'s count is short again.',
        text: 'Ah Hock\'s last entry, Saturday 9 PM, in pencil: "Bobby ask advance RM 3,000 again. Mother Mei Ling hospital bill. Cannot, the tin is for Ah Soh\'s knee. Ravi say corner his, again. Ah Lan count short again, talk to her Sunday." Three worries, three names.',
      },
    },
    {
      id: 'sd03', phase: 'The stall', title: 'The till',
      game: 'quickmath', variant: 'currency',
      brief: 'Ah Lan keeps the cash book and makes the change, in her head, at speed, with a queue of hungry uncles. Do what she does, against her own figures. If the book does not balance, you will feel it.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_sd_cashbook', hotspot: { x: 0.42, y: 0.54, r: 0.17 },
        title: 'Short every night, but not that night',
        short: 'Ah Lan skimmed about RM 1,380 over three weeks. Her 11:02 PM photo shows all RM 41,600 still in the tin.',
        text: 'The cash book is short by RM 20 to RM 60 every night for three weeks: about RM 1,380, always in Ah Lan\'s handwriting. She has been skimming. But at 11:02 PM on Saturday she sent Ah Hock a photo of the count, as she does every night. All RM 41,600 is in the tin.',
      },
    },

    // ---------------- The row ----------------
    {
      id: 'sd04', phase: 'The row', title: 'Ravi\'s camera',
      game: 'rotation', variant: '2d',
      brief: 'Ravi swears his own camera clears him. He mounted it upside down on the lamp post, and the cheap app flips the picture as well. To read anything off it, you have to tell a thing turned round from a thing reflected.',
      params: { trials: 12, target: 10, options: 4 },
      evidence: {
        img: 'ev_sd_camera', hotspot: { x: 0.75, y: 0.48, r: 0.15 },
        title: 'A green apron at 12:25',
        short: 'Ravi stays at his scale from 10:50 PM to 1:40 AM. At 12:25 AM someone in a green apron carries a carton toward the road.',
        text: 'Turned the right way round, the footage clears Ravi: he is at his scale, weighing and arguing, from 10:50 PM until 1:40 AM. At the edge of the frame at 12:25 AM, someone in a green apron carries a durian carton toward the road. Ravi\'s helpers wear orange. Ah Hock\'s wear green.',
      },
    },
    {
      id: 'sd05', phase: 'The row', title: 'Everyone at 12:15',
      game: 'logicgrid', variant: 'classic',
      brief: 'Five people were near the row when the tin went. Ko Aung, who unloads lorries for stall 9, came from Mandalay six years ago. Ah Lan and Bobby wear Ah Hock\'s green apron. Use what the row told you to place each one, and what they were holding.',
      params: {
        categories: [
          { name: 'Person', items: ['Ah Lan', 'Ravi', 'Bobby', 'Ko Aung', 'Murugan'] },
          { name: 'Location', items: ['Kelana Jaya flat', 'Ravi\'s scale', 'Behind Ah Hock\'s', 'Lorry, stall 9', 'Kopi stall'] },
          { name: 'Holding', items: ['Grab receipt', 'Calculator', 'Export carton', 'Crate of D24', 'Kopi sock'] },
        ],
        solution: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]],
        clues: [
          'Whoever stood behind Ah Hock\'s stall wears his green apron.',
          'The man at the lorry is the only one of the five not born in Malaysia.',
          'The kopi sock never left the kopi stall, and it was in a man\'s hand.',
          'The receipt was printed by an app at 11:41 PM, for a ride to Kelana Jaya.',
          'Ravi was holding the only thing that runs on batteries.',
          'The export carton was nowhere that Ravi, Ko Aung or Murugan works.',
          'Murugan was not in a car that night, and nobody booked him one.',
          'Bobby\'s phone never left the row. It pinged the SS2 tower all night.',
        ],
      },
      evidence: {
        img: 'ev_sd_row', hotspot: { x: 0.5, y: 0.5, r: 0.18 },
        title: 'Everyone at 12:15 AM',
        short: 'Ah Lan: home in Kelana Jaya. Ravi: at his scale. Bobby: behind Ah Hock\'s stall with an export carton.',
        text: 'At 12:15 AM: Ah Lan was home in Kelana Jaya, her Grab receipt in her purse. Ravi was at his scale with his calculator. Ko Aung was unloading a crate of D24 at stall 9. Murugan was at the kopi stall. Bobby was behind Ah Hock\'s stall, alone, with a durian carton stamped SG EXPORT.',
      },
    },
    {
      id: 'sd06', phase: 'The row', title: 'The husk pile',
      game: 'footprint', variant: 'classic',
      brief: 'Behind the stall the husks are piled waist high and the ground is soft with pulp. One clear print sits in it, pointing at the road. The staff keep their work shoes in a crate by the generator. PJ police let you borrow the crate.',
      params: { shoes: 9 },
      evidence: {
        img: 'ev_sd_bootprint', hotspot: { x: 0.46, y: 0.52, r: 0.2 },
        title: 'White rubber, size 8, marked B',
        short: 'The print in the pulp is a white rubber kampung shoe, size 8, cut across the heel. Inside the tongue: the letter B.',
        text: 'The print in the durian pulp is a white rubber kampung shoe, UK size 8, with a cut across the heel. The pair in the crate that matches has a single letter written inside the tongue in marker pen: B.',
      },
    },

    // ---------------- The money ----------------
    {
      id: 'sd07', phase: 'The money', title: 'Bala Anne\'s crossword',
      game: 'crossword', variant: 'classic',
      brief: 'Bala Anne\'s cousin Murugan runs the kopi stall on the row. Bala will phone him for you, but not until his Sunday crossword is finished, and he has been stuck on it since breakfast. "You are the detective," he says. "Detect."',
      params: { size: 13 },
      evidence: {
        img: 'ev_sd_kopi', hotspot: { x: 0.4, y: 0.62, r: 0.14 },
        title: '"Kopi O kau, kurang manis"',
        short: 'Murugan: Bobby fetched Ah Hock\'s kopi at 11:20 and asked for it strong and almost unsweetened. Ah Hock always takes it extra sweet.',
        text: 'Murugan, on Bala\'s phone, in Tamil: "Kopi O kau, kurainja sakkarai. Andha paiyan dhaan ketaan." Kopi O, strong, hardly any sugar. "That boy asked for it himself, at 11:20." Bobby. For twenty years Ah Hock has taken his kopi with three spoons of sugar. Bitter hides bitter.',
      },
    },
    {
      id: 'sd08', phase: 'The money', title: 'The despatch rider',
      game: 'chase', variant: 'one-way',
      brief: 'A despatch rider was booked for 12:25 AM to collect "one carton durian, for Singapore" from the row. You find him on Sunday night doing the same run, and he does not want to talk. SS2 is a knot of one-way streets. He knows them. Now so must you.',
      params: { rounds: 2 },
      evidence: {
        img: 'ev_sd_carton', hotspot: { x: 0.5, y: 0.45, r: 0.18 },
        title: 'Forty-one thousand in the husks',
        short: 'The carton held RM 41,600 in hollowed husks. The sender folded paper boats while he waited. The booking came from a prepaid SIM sold in Low Yat.',
        text: 'He was paid RM 100 to drop the carton at a bus station locker. Inside: three hollowed husks stuffed with RM 50 notes. RM 41,600. The sender was "young, gold hair, kept folding paper boats while he waited". The booking came from a prepaid SIM sold at a phone shop on the third floor of Low Yat Plaza. Ken\'s floor.',
      },
    },
    {
      id: 'sd09', phase: 'The money', title: 'What Ko Aung saw',
      game: 'rebus', variant: 'mixed',
      brief: 'Ko Aung\'s Malay runs to about forty words, and none of them are for the police. So he draws, on the back of stall 9\'s shopping list, the way he talks to his daughter in Mandalay on video calls: pictures, plus signs, and arrows.',
      params: { count: 10 },
      evidence: {
        img: 'ev_sd_drawing', hotspot: { x: 0.5, y: 0.45, r: 0.2 },
        title: 'A woman in a car, a boy with a box',
        short: 'Ko Aung drew Ah Lan getting into a car at 11:30 with only her handbag, and a boy with yellow hair carrying a box at midnight.',
        text: 'Two drawings. A woman in glasses getting into a car at half past eleven, carrying nothing but her handbag. And at twelve, a boy with yellow hair in a green apron, carrying a box to the back of the stall, folding something small in his other hand.',
      },
    },

    // ---------------- The statements ----------------
    {
      id: 'sd10', phase: 'The statements', title: 'Five statements',
      game: 'whoslying', variant: 'classic',
      brief: 'Farah, off duty and on her second durian, agrees to sit in while PJ police take statements. Each person either told the whole truth or lied in everything they said. Work out who lied.',
      params: {
        solvedLine: 'Farah wipes her fingers. "Two liars. One for small money, one for big money."',
        people: [
          { id: 'murugan', name: 'Murugan', says: [{ t: '"Bobby collected the kopi at 11:20."', fact: true, note: 'Murugan\'s order slip, timed 11:20 PM.' }, { t: '"Ko Aung is telling the truth."', about: 'aung', is: true }] },
          { id: 'aung', name: 'Ko Aung', says: [{ t: '"Ravi is telling the truth."', about: 'ravi', is: true }, { t: '"Bobby is lying."', about: 'bobby', is: false }] },
          { id: 'ravi', name: 'Ravi', says: [{ t: '"Ah Lan is lying."', about: 'ahlan', is: false }, { t: '"At least two of the others are lying."', atLeast: 2 }] },
          { id: 'ahlan', name: 'Ah Lan', says: [{ t: '"I never took a single sen from that tin."', fact: false, note: 'The cash book says otherwise.' }, { t: '"Bobby is telling the truth."', about: 'bobby', is: true }] },
          { id: 'bobby', name: 'Bobby', says: [{ t: '"Ah Lan is telling the truth."', about: 'ahlan', is: true }, { t: '"Murugan is lying."', about: 'murugan', is: false }] },
        ],
        liars: ['ahlan', 'bobby'],
      },
      evidence: {
        img: 'ev_sd_statements', hotspot: { x: 0.42, y: 0.5, r: 0.2 },
        title: 'Two liars at the stall',
        short: 'Ah Lan and Bobby lied. Ravi, Ko Aung and Murugan told the truth.',
        text: 'Ah Lan and Bobby lied in every word. Ravi, Ko Aung and Murugan told the truth. Ah Lan cries before Farah finishes the question: she took small notes, all season, for the betting site. She swears she never touched the tin. Bobby says nothing. He is folding the corner of his statement into a point.',
      },
    },
  ],

  outcomes: {
    charged: {
      ahlan: { en: 'Wong Siew Lan is charged with theft. She admits to three weeks of skimming, every ringgit of it written down. She swears on her son she never touched the tin.' },
      ravi: { en: 'Ravi Chandran is charged. His camera footage is entered as evidence for the defence. The corner pitch stays empty for the rest of the season.' },
      bobby: { en: 'Bobby Tan is charged with theft and with poisoning. He tells PJ police the pills were for his mother, and the money was for his mother, and he never meant Ah Hock to fall.' },
    },
    correct: ['bobby'],
  },

  flagNames: ['BOBBY_FREE', 'AHLAN_WRONGED', 'RAVI_WRONGED'],
  flags: ({ charged }) => ({
    BOBBY_FREE: !charged.includes('bobby'),
    AHLAN_WRONGED: charged.includes('ahlan'),
    RAVI_WRONGED: charged.includes('ravi'),
  }),

  ending(v) {
    const right = v.has('bobby');
    return [
      { img: 'sd_out_01_arrest', mood: 'police', fx: ['siren'], place: 'IPD Petaling Jaya, Tuesday.', music: 'resolution',
        lines: v.charged.map((id) => ({ who: null, en: SIDE01.outcomes.charged[id].en })) },
      { img: 'sd_out_02_kenhock', mood: 'day', fx: [], place: 'SS2. The following Saturday.',
        lines: [
          { who: 'Lau Kim Hock', orig: right ? 'Ho sam ge sai lou. Ngo mou zaak keoi.' : 'Di cin fan lai zau dak lah.', en: right ? 'A good-hearted boy. I do not blame him.' : 'The money came back. That is enough.' },
          { who: 'Ken Lim', en: 'He wants to pay you in durian for the rest of your life. I told him you would prefer cash. He did not listen.' },
          { who: 'Ken Lim', en: 'By the way. You been back to Port Klang lately? Just asking.' },
        ] },
      { img: 'sd_out_03_boat', mood: 'night', fx: ['dust'], music: 'memory',
        lines: [
          { who: null, en: right ? 'Bobby folded boats when he was nervous. Everyone on the row knew it.' : 'Nobody on the row will say who folded the boat.' },
          { who: null, en: 'Ken asked about Port Klang the way people ask about the weather. He did not look at you while he asked.' },
          { who: null, en: 'The paper boat sits in your drawer beside the paper kancil. A boat is not a kancil. You tell yourself that twice.' },
        ] },
    ];
  },
};
