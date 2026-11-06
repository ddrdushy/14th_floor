// CASE 10: TELOK AYER. Seah & Seah, 214 Telok Ayer Street, Singapore; Amoy Street; Tuas; Little India; the Causeway.
// Truth (writers only): ABDUCTION, from a room bolted on the inside, on a printed order.
// The Jugra Trust was settled on 1 December 1987 with Seah & Seah of Singapore as trustee (Seah & Seah Trust
// Co.). It owns Sinar Holdings Pte Ltd (1988), which owns 51% of Sinar Holdings Berhad. The deed names the
// settlor as "Muthusamy a/l Perumal, sole proprietor of Sinar Pengangkutan, Jugra"; it is signed in a Latin
// flourish and a LEFT thumb. Muthu signed everything in Tamil, and neither thumb on his MyKad matches. "Signed
// at Johor Bahru", witnessed A. Seah. Arthur Seah met the settlor once, at dusk on 1 Dec 1987, in the back of a
// car on the Johor waterfront: the driver (Muthu) stood outside with his back to the car; "I do not cross
// water"; he signed with his left hand. The sealed letter of wishes was amended on 19 Aug 2016 by one typed page
// and one handwritten line in the same left hand: "On my death the Trust is to be directed by whoever drives me
// last." Arthur told him it was not a legal sentence: "It will be, Arthur, when I am dead."
// Arthur Seah, 82, read about Box 14, wrote to the detective on 2 January, and set Friday 15 Jan, 7 AM. On
// Thursday at 22:02 he took the deed and the letter up to his room on the third floor and bolted it from inside,
// as every night since a break-in in 1994. 22:10 he sent the detective a photograph of his desk. 22:28 his
// granddaughter Clarissa Seah, 41, partner, who runs the Jugra Trust's administration (S$1.2 million a year to
// the firm), handed in his chrysanthemum tea with two of her own temazepam crushed in it; she had told the
// Office of the Chairman about the appointment and had its printed reply: "The trustee first. Then the letter."
// 05:50 Friday she let herself in by the back door, 05:52 rang Ganesan "Gary" Raju, 48, operations supervisor
// at Tuas SecureShred (Sinar Cold Chain Pte), from the partners' line ("Bin seven. Hold it."), and sent the
// 1961 file lift ("out of order since 1998", rewired by Gary's men in December, paid as "archive works") up to
// the third floor, where its hatch opens behind the bottom of Arthur's bookcase. Gary rode it up at 05:55,
// folded the sleeping old man into the cab ("Mannikkanum, aiya"), rode down, and put him in bin 7. 06:04 his
// crew wheeled seven bins instead of six to the Friday truck. The door upstairs stayed bolted. Clarissa burned
// the letter in the brass bowl on her own desk, locked the deed in her drawer, changed two cells of the trust
// ledger at 06:12, left by the back lane and came in by the front "for the first time" at 06:55. Truck 7 was not
// tipped: at 06:51 bin 7 was parked in the bale room at Tuas, a cold store at 4 degrees, BIN 7 HOLD, C.S.
// Red herrings: Lucas Seah, 55, Arthur's son, bankrupt, begged at the street door at 1 AM, was turned away,
// slept on the Amoy Street bench and saw two men lift one bin over the kerb "like it was full of wet sand".
// R. Rajendran, 67, night guard, slept at his desk 2:10 to 4:55 and lied about his rounds, nothing more.
// If ARTHUR_FOUND, SPF open the bale room at 2 PM Friday and he is alive. If ARTHUR_LOST, bin 7 has gone
// (a gap in the plant's log, 11:00 to 11:40) and he is not found. Never say he is dead.
// The Chairman: NOT named, NOT seen. This case adds only: the Jugra Trust and its chain; a settlor who is not
// Muthu's hand or thumb; "I do not cross water"; the 2016 amendment in his hand (the whole sentence only if
// Arthur is found, else "...drives me last"); Arthur's 1987 description (ending, found only); with NOTE_FOUND the
// same left thumb in 1986 and 1987; with VIVIAN_FREE, he dictates down a car telephone, never in a room.
// Private note: his identity is still undecided. Nothing here may pin it to a person.
// Sjn. Asri (the Season Two thread) is only trusted here: he drives you to the Causeway and asks the time.

// Daniel, from Case 9 on, is free in every branch (see docs/arc_season2.md, section 2).
const WAS_HELD = (f) => (!!f.DANIEL_TAKEN || !f.DANIEL_FOUND) && !f.ARCHIVE_SEIZED; // he rode hooded in the back seat on 1 December
const DNAA = (f) => !!f.DANIEL_CHARGED; // his charge was withdrawn as a discharge not amounting to acquittal


// The line the reverse tape plays: it must stay word for word the same as in the opening.
const ARTHUR_LINE = { who: 'Arthur Seah', en: 'Seven o\'clock on Friday. I met him once, in 1987, on the Johor side. He would not cross the water.' };

const ROUTES = [
  { id: 'door', label: 'Through the door: the bolt was thrown from outside with a magnet', note: 'An old bolt, a strong magnet, a careful hand.' },
  { id: 'window', label: 'Out of the window: the bars were taken off and put back', note: 'Four iron bars over Telok Ayer Street.' },
  { id: 'wall', label: 'Through the party wall into No. 216', note: 'The firm owned No. 216 until 1971.' },
  { id: 'lift', label: 'Down the old file lift, and out in a shredding bin at 6:04', note: 'Out of order since 1998, they say.' },
];

export const CASE10 = {
  id: 'case10',
  number: 10,
  title: 'Telok Ayer',
  place: 'Telok Ayer Street, Singapore',
  victim: 'Arthur Seah Boon Huat, 82, solicitor. Missing from his bolted room at 214 Telok Ayer Street since the night of Thursday 14 January.',
  question: 'Who took Arthur Seah?',
  brief: 'Arthur Seah bolted his door at two minutes past ten on Thursday night with a deed from 1987 on his desk, and said he would have it all out on the table for you at seven. At seven the door was still bolted. Singapore police had to break it. The deed, the old man and the letter he kept for forty years were gone, and the window bars had not been touched since the Japanese left.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end: who took Arthur Seah, and how he left a room bolted from the inside. ASP Teo can act on one answer, once. Nobody will tell you if you get either right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. A message from Daniel: a photograph of table six with one teh on it, and under it, "Bring me back a kaya bun. Do not bring me back a passport."',
  deduction: {
    lede: 'ASP Teo will arrest whoever you name for the abduction of Arthur Seah, on your word, which in Singapore is worth exactly as much as she says it is. Name everyone who took him, and only them.',
    button: 'Tell Teo',
    confirm: 'ASP Teo will arrest {names}. Farah will hear it from you first, on the steps of Cantonment, with her stick between her knees.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Teo',
    questions: [
      {
        id: 'method', q: 'How did Arthur Seah leave the bolted room?', short: 'He left',
        lede: 'Teo can search one route, once, today. Whichever it is, the Office will know by lunch, and an old man in a cold room has until then.',
        options: ROUTES,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy
  // in cases.js). Until it is solved they are not on the map, the board or the office wall.
  suspects: [
    {
      id: 'rajendran', name: 'R. Rajendran', role: 'Night guard, 214 Telok Ayer Street. 67', img: 'sus_rajendran',
      revealedBy: 'c10_02',
      revealLine: 'He says he walked every floor twice. The stairs say nobody walked them.',
      look: { skin: '#7a4a2e', hair: 'short', hairColor: '#d8d8d8', coat: 'blazer', eyewear: 'square', mark: 'moustache' },
      motive: 'None known. Eleven years on the night desk of a firm that pays him less than it pays for its shredding. A widower who sleeps badly at home and well at work.',
      claim: 'Says he walked every floor at midnight, two, four and six, and that nobody went up to the third floor after Miss Clarissa took the old man his tea.',
    },
    {
      id: 'lucas', name: 'Lucas Seah', role: 'Arthur Seah\'s son. 55', img: 'sus_lucas',
      revealedBy: 'c10_03',
      revealLine: 'The auntie at Amoy Street knows him. He sat on her bench from one until six.',
      look: { skin: '#e8c4a0', hair: 'side-part', hairColor: '#6a6a6a', coat: 'leather', eyewear: 'none', mark: 'stubble' },
      motive: 'Bankrupt since 2019, in debt to men who do not send letters, and his father\'s only son. Whatever Arthur Seah leaves, Lucas inherits.',
      claim: 'Says he spent Thursday night in Geylang with friends, and has not been near his father\'s office in five years.',
    },
    {
      id: 'clarissa', name: 'Clarissa Seah', role: 'Partner, Seah & Seah; Arthur Seah\'s granddaughter. 41', img: 'sus_clarissa',
      revealedBy: 'c10_05',
      revealLine: 'Eighty thousand dollars to the shredding company on Thursday, approved C.S.',
      look: { skin: '#f1d2b6', hair: 'bun', hairColor: '#151210', coat: 'blazer', eyewear: 'none', mark: 'none' },
      motive: 'She runs the Jugra Trust\'s administration, which pays the firm S$1.2 million a year. Her grandfather wanted to show its deed to a Malaysian detective.',
      claim: 'Says she came in at 6:55 on Friday, the first of the family in the building, and found her grandfather\'s door bolted.',
    },
    {
      id: 'gary', name: 'Ganesan "Gary" Raju', role: 'Operations supervisor, Tuas SecureShred. 48', img: 'sus_gary',
      revealedBy: 'c10_09',
      revealLine: 'His sweat is on the handrail of a lift that has not worked since 1998.',
      look: { skin: '#6e4129', hair: 'shaved', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'scar' },
      motive: 'None known. Tuas SecureShred is a subsidiary of Sinar Cold Chain Pte, and its Friday collection from Seah & Seah is his.',
      claim: 'Says his crew collected six bins from Telok Ayer at six on Friday, as every Friday, and that he was at the plant in Tuas all morning.',
    },
  ],

  opening: [
    {
      img: 'c10_intro_01_brickfields', mood: 'night', fx: ['rain'], place: 'Brickfields. Wednesday 13 January, 6:00 AM.', music: 'office',
      lines: [
        { who: null, en: 'The shutters of Jalan Tun Sambanthan are still down. A D9 pool car idles at the kerb with its wipers going, because Farah\'s Waja is still an exhibit in a police yard in Shah Alam.' },
        { who: null, en: 'Farah sits in front with her stick between her knees and her left leg out straight. She is on leave, she says. Leave is where she chooses to be.' },
        { who: null, en: 'Sergeant Asri puts your bag in the boot and asks, as he closes it, what time you are seeing the old man on Friday. You tell him: seven.' },
        { who: 'Daniel Raj', en: 'Machan. The only passport I can use says K. Rajan, and K. Rajan is not a man I want to show to a Singapore immigration officer. Bring me back the old man\'s story. And a kaya bun.' },
        { who: 'Daniel Raj', en: 'Hamidah says the charge can come back any morning it likes. So I am not crossing anything. Not even the road.', when: DNAA },
        { who: null, en: 'Since December he does not sleep anywhere he cannot see the door. He stands on the pavement until the car turns the corner.', when: WAS_HELD },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c10_intro_02_causeway', mood: 'day', fx: [], place: 'Woodlands Checkpoint. 8:10 AM.',
      lines: [
        { who: null, en: 'The Causeway is a kilometre of road laid across the Straits of Johor. Under it the water is brown and slow and full of light. Behind you, Johor Bahru. Ahead, a country where you are nobody\'s police.' },
        { who: 'Inspector Farah Iskandar', en: 'He would not cross this. Forty years, a whole port, and he never once came over.' },
        { who: null, en: 'At the booth an officer reads your passport, reads it again, and lets you through. Behind you the pool car turns round for Kuala Lumpur.' },
      ],
      kb: { from: [1.0, 0, 2], to: [1.12, 0, -2] },
    },
    {
      img: 'c10_intro_03_street', mood: 'day', fx: ['dust'], place: 'Telok Ayer Street. Wednesday, 3:00 PM.',
      lines: [
        { who: null, en: 'Two-storey and three-storey shophouses in pastel plaster, louvred shutters, five-foot ways. Across the street the green-tiled roofs of Thian Hock Keng, where sailors once thanked the sea goddess for getting them here. Over all of it, the glass towers of the banks.' },
        { who: null, en: 'Number 214 is the narrowest house in the row: a brass plate, SEAH & SEAH, ADVOCATES & SOLICITORS, polished thin. On the third floor, behind four iron bars, a desk lamp is on in the middle of the afternoon.' },
        { who: 'Inspector Farah Iskandar', en: 'Vivian Chua lives four streets from here now. Ann Siang Hill. She sends cards.', when: (f) => f.VIVIAN_FREE },
        { who: null, en: 'Your hotel is on Club Street, round the corner and up the hill: a room the size of a lift, a window onto a wall, and an old telephone beside the bed.' },
      ],
      kb: { from: [1.08, -2, 0], to: [1.0, 2, 1] },
    },
    {
      img: 'c10_intro_04_phone', mood: 'night', fx: [], place: 'Club Street. Wednesday, 10:40 PM.',
      lines: [
        { who: null, en: 'The telephone beside the bed rings once, politely, as if it were apologising.' },
        { who: 'Arthur Seah', en: 'Arthur Seah. Forgive an old man\'s telephone manners. My granddaughter says I shout.' },
        ARTHUR_LINE,
        { who: 'Arthur Seah', en: 'Tomorrow I bring the deed up from the strongroom, and the letter that goes with it. On Friday at seven I will have it all out on the table for you. All of it. I have been tidy for forty years. I should like to be untidy once.' },
        { who: null, en: 'He hangs up before you can ask him anything, the way men of his age end telephone calls: when they have said what they rang to say.' },
      ],
      kb: { from: [1.0, 1, 0], to: [1.12, -1, 0] },
    },
    {
      img: 'c10_intro_05_door', mood: 'police', fx: [], place: '214 Telok Ayer Street. Friday, 7:00 AM.', music: 'tension',
      lines: [
        { who: null, en: 'Third floor. A corridor of old teak, a camera in its corner, and at the end a door bolted from inside. Nobody answers it.' },
        { who: null, en: 'Outside it: the granddaughter in a grey suit and pearls, who came in at five to seven; the night guard with his cap in his hands; two constables; and a woman in a trouser suit with a lanyard, who says her name is Teo and does not offer her hand.' },
        { who: 'Clarissa Seah', en: 'Ah Kong? Ah Kong! He never sleeps past six. Never.' },
        { who: null, en: 'The bigger constable puts his shoulder to the door twice. The bolt\'s keeper tears out of the frame. The room is warm and still and smells of chrysanthemum tea.' },
        { who: null, en: 'A leather chair turned a little from the desk. A walking stick hooked on its arm. Spectacles folded on the blotter. A hearing aid on the floor. An empty green deed box with its lid up, and a long envelope slit open along the top. Four iron bars over the window, painted over many times. Nobody.' },
      ],
      kb: { from: [1.12, 0, 0], to: [1.02, 0, 0] }, sfx: 'thunder',
    },
    {
      img: 'c10_intro_06_teo', mood: 'police', fx: [], place: 'The third floor. 7:12 AM.',
      lines: [
        { who: 'ASP Teo Wei Ling', en: 'Can or not, you tell me. Bolted inside, bars outside, camera on the corridor. Where did an old man go?' },
        { who: 'ASP Teo Wei Ling', en: 'Lyon, 2014. Your inspector sat next to me for six weeks and corrected my French. So. This is a courtesy. You look, you tell me, I decide. You touch nothing I have not touched first.' },
        { who: 'ASP Teo Wei Ling', en: 'Your superintendent rang Cantonment yesterday to tell us you are not police. I told him I know. That is why you are allowed in.', when: (f) => f.KHAIRUL_FREE && !f.KHAIRUL_WRONGED },
        { who: 'ASP Teo Wei Ling', en: 'A suspended superintendent rang Cantonment from his house yesterday to tell us you are not police. I told him I know. That is why you are allowed in.', when: (f) => f.KHAIRUL_FREE && f.KHAIRUL_WRONGED },
        { who: 'Inspector Farah Iskandar', en: 'He would have it all out on the table, he said. Somebody has cleared the table.' },
      ],
      kb: { from: [1.05, -1, 0], to: [1.0, 1, 0] },
    },
    { title: { kicker: 'Case 10', name: 'Telok Ayer' }, fx: ['rain'] },
  ],

  levels: [
    // ---------------- The third floor ----------------
    {
      id: 'c10_01', phase: 'The third floor', title: 'The bolted room',
      game: 'hiddenobject', variant: 'list',
      brief: 'Arthur Seah\'s room was the firm\'s strongroom until a break-in in 1994; since then he has slept in it, in his chair, with the door bolted, and worked at the desk his father worked at. Teo\'s scene officers are still in the lift lobby arguing with the building\'s one working lift. She gives you ten minutes and a pair of gloves. Find everything on your list. Some of it is on the floor.',
      params: { scene: 'desk', targets: 12, objects: 66 },
      evidence: {
        img: 'ev_c10_room', hotspot: { x: 0.18, y: 0.62, r: 0.14 },
        title: 'Amended 19.8.2016',
        short: 'The bolt was thrown from inside and carries no scratch. The window bars are painted into their sockets. Stick, spectacles, hearing aid, an empty deed box, a cold cup of chrysanthemum tea with a chalky white ring in the bottom, and a slit envelope endorsed in ink: "Letter of wishes. Amended 19.8.2016." The ink is dragged along each line by the side of the hand that wrote it: a left hand.',
        text: 'The bolt is a brass barrel bolt as long as your hand, thrown home from inside; its keeper tore out of the frame under the constable\'s shoulder and took a splinter of teak with it. There is not a scratch on the barrel, not a bright mark from pliers or a magnet anywhere on the brass. The four window bars were set into the frame in 1946, the year the firm came back to Telok Ayer Street after the war, and painted over so many times since that the paint runs unbroken over every bolt-head. On the desk: a walking stick hooked on the arm of the chair, his spectacles folded on the blotter. On the floor under the chair, his hearing aid, its little battery door open. A green steel deed box with its lid up and nothing in it. A cup of chrysanthemum tea, cold, with a chalky white ring dried in the bottom that no flower leaves. And a long envelope, slit along the top with a paper knife and empty, endorsed in ink: "Letter of wishes. Amended 19.8.2016." You have seen the hand once before, on a typed card in the boot of a car in December: every line smeared towards its end where the side of the writing hand dragged through the wet ink. A left hand. Teo reads the envelope over your shoulder. "Old man, bolted room, bars, camera," she says. "Then he evaporates. Like that, can meh?"',
      },
    },
    {
      id: 'c10_02', phase: 'The third floor', title: 'The night desk',
      game: 'witness', variant: 'statement',
      brief: 'The night guard at 214 Telok Ayer is R. Rajendran, sixty-seven, ex-Singapore Armed Forces, eleven years on the desk inside the street door. He stands to give his account because nobody has told him he may sit, and gives it once, in the order of his logbook.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Statement of R. Rajendran, 67, night guard, Seah & Seah. Recorded Friday, 7:40 AM.',
        introLine: 'He holds his cap against his chest. "Eleven years, madam. Nothing ever happened. I will say it the way I wrote it."',
        retryLine: 'He opens the logbook again and reads it out from the top, without changing a word.',
        statement: [
          'I come on at ten. Mr. Arthur went up at two minutes past ten with his green box under his arm, like every night. I heard the bolt from the bottom of the stairs. Every night I hear it. He is old, but he throws it hard.',
          'At about half past ten Miss Clarissa came back for something and went up with his tea. Chrysanthemum, every night, the same cup. He opened the door, took it, and bolted it again. She went home by the back.',
          'I do my rounds every two hours: midnight, two, four, six. All three floors and the basement, twice each. Every door was locked. Nobody was on the stairs. I wrote it in the book.',
          'At one o\'clock Mr. Lucas, his son, rang the street-door bell and shouted at the intercom. I have orders: Mr. Lucas is not to come in. I told him go home. He went across the road to the hawker centre. I did not see him again.',
          'At six the shredding men came from Tuas, like every Friday. Two men in green. They take the bins from the basement by the loading door and go. Miss Clarissa came in by the front at five to seven, the first of the family. She went up and knocked, and called me.',
        ],
        questions: [
          { q: 'How long has Rajendran guarded the building?', options: ['Six years', 'Nine years', 'Eleven years', 'Twenty years'], a: 2 },
          { q: 'What did Mr. Arthur carry upstairs at night?', options: ['A briefcase', 'A green box', 'A tea tray', 'A torch'], a: 1 },
          { q: 'Who took him his tea?', options: ['Rajendran', 'Mrs. Pang', 'Miss Clarissa', 'Mr. Lucas'], a: 2 },
          { q: 'What kind of tea?', options: ['Oolong', 'Teh tarik', 'Chrysanthemum', 'Jasmine'], a: 2 },
          { q: 'How often does Rajendran say he does his rounds?', options: ['Every hour', 'Every two hours', 'Twice a night', 'Once, at three'], a: 1 },
          { q: 'When did Mr. Lucas come to the street door?', options: ['Eleven o\'clock', 'Midnight', 'One o\'clock', 'Four o\'clock'], a: 2 },
          { q: 'Where did Mr. Lucas go after he was sent away?', options: ['Home', 'A taxi', 'The hawker centre across the road', 'The temple'], a: 2 },
          { q: 'How do the shredding men take the bins out?', options: ['By the front door', 'By the loading door', 'By the back lane gate', 'By the lift'], a: 1 },
          { q: 'When did Miss Clarissa come in on Friday morning?', options: ['5:50', '6:04', '6:30', '6:55'], a: 3 },
        ],
      },
      evidence: {
        img: 'ev_c10_logbook', hotspot: { x: 0.27, y: 0.65, r: 0.16 },
        title: 'Nobody came, he says',
        short: 'Rajendran: Arthur bolted himself in at 10:02; Clarissa brought his tea at about 10:30 and went home by the back; rounds at midnight, two, four and six, every door locked; Lucas at the street door at one, sent across the road; the Tuas shredding men at six by the loading door; Clarissa in by the front at 6:55, the first of the family.',
        text: 'The logbook is a school exercise book with a pencil on a string, and every two hours in it, in a soldier\'s capitals, the same line: ROUNDS. ALL FLOORS. ALL SECURE. R.R. Midnight, two, four, six. At one o\'clock, a different line: L. SEAH AT STREET DOOR. NOT ADMITTED (ORDERS). Lucas Seah is Arthur\'s son, fifty-five, and the order that he is not to be let in is typed on a card taped inside the desk drawer, signed A. Seah, dated 2019. At six, the Friday collection from Tuas SecureShred, two men in green overalls, basement, loading door, as every Friday since the firm stopped burning its own paper. And at five to seven, Miss Clarissa, the first of the family in the building. Farah reads the logbook with her stick across her knees and says nothing until Rajendran has gone back down. Then: "Four rounds of three floors and a basement, twice each, at sixty-seven. Look at his shoes." They have not a mark of the basement\'s dust on them.',
      },
    },
    {
      id: 'c10_03', phase: 'Amoy Street', title: 'The bench',
      game: 'lineup', variant: 'single',
      brief: 'Across the road and one street back is Amoy Street Food Centre, and at the end of it a kopi stall that opens at four in the morning for the drivers. The auntie who runs it has had the same bench outside her stall for twenty years and knows everybody who has ever slept on it. Teo\'s constable has the photographs from Lucas Seah\'s bankruptcy file mixed in with eleven others. Look at her photograph of the night, fast.',
      params: { rounds: 3, studySeconds: [10, 8, 6] },
      evidence: {
        img: 'ev_c10_bench', hotspot: { x: 0.35, y: 0.55, r: 0.18 },
        title: 'The son across the road',
        short: 'The kopi auntie picks Lucas Seah three times out of three: on her bench from five past one until ten past six, one kopi-o kosong and a second she gave him free. He told Teo he spent the night in Geylang. The hawker centre\'s camera agrees with the auntie.',
        text: 'She picks him at once, each time, with a little click of her tongue. "This one. Mr. Arthur\'s boy. Since young I know him, sit my bench, cry my bench." He came at five past one with no money and asked for a kopi-o kosong on credit, and she gave it to him, and later another one, free, because he was shivering. He lay on the bench under the fluorescent tube with his arm over his eyes and did not sleep much. "Every time a lorry pass, he sit up." At ten past six he got up and walked away towards Telok Ayer Street without paying for the second kopi, which she does not mind. The hawker centre\'s own camera, above the drinks stall, shows the same: a man in a leather jacket on the bench from 01:05 to 06:10, sitting up at intervals, and at 06:04 standing, walking to the kerb and staring across the road for a full minute before he sits down again. Lucas Seah told Teo\'s constable at eight that he had spent the night in Geylang with friends whose names he could not remember.',
      },
    },
    {
      id: 'c10_04', phase: 'The third floor', title: 'In case I oversleep',
      game: 'spotdiff', variant: 'classic',
      brief: 'At ten past ten on Thursday night your phone buzzed with a photograph from a Singapore number you did not know: a desk under a green lamp, and one line under it. "In case I oversleep, Detective. A.S." You did not understand it then. Hold it up against the room as it was at seven, and find everything that has changed.',
      params: { differences: 9 },
      evidence: {
        img: 'ev_c10_desk', hotspot: { x: 0.25, y: 0.55, r: 0.18 },
        title: 'The bookcase moved',
        short: 'Arthur\'s photograph of 22:10 against the room at 7:00: the deed and the letter gone from the blotter; the tea cup on the desk that was not there at 22:10; the chair turned to face the bookcase. And the bottom of the bookcase stands two centimetres out from the wall, with a fresh pale scrape on the floorboards in front of it.',
        text: 'In the photograph the old man sent you at 22:10, the room is ready for a meeting: the deed open on the blotter at its signing page, a sealed envelope beside it with the endorsement face up, his spectacles on top of both, the chair square to the desk. He was setting it out for seven o\'clock, and he photographed it because he was afraid of exactly what happened. At seven, the blotter is bare and the envelope is slit and empty. A cup and saucer stand on the desk that were not in the photograph, because the tea came up at 22:28. The chair has been turned a quarter round to face the bookcase. And the bookcase itself, a tall camphorwood case that has stood against the inner wall since 1998, is no longer flush at the bottom: its lowest section stands two centimetres proud of the wall, and on the floorboards in front of it there is a fresh pale scrape, a hand\'s width long, where something heavy was dragged a short way and set down. The top of the bookcase has not moved at all. Teo crouches beside it with a torch and says one word in Hokkien that Farah does not translate.',
      },
    },

    // ---------------- Seah & Seah ----------------
    {
      id: 'c10_05', phase: 'Seah & Seah', title: 'The auditors\' copy',
      game: 'ledger', variant: 'classic',
      brief: 'Mrs. Pang, the firm\'s office manager for thirty-one years, prints the trust ledger every Thursday at five for the auditors and files the printout in a binder nobody else knows the shelf of. The ledger on the partners\' terminal does not match it any more. Somebody logged in on Friday morning and changed two cells. Find them, and put back what they said.',
      params: {
        rows: 5, cols: 5, altered: 2, restore: true, currency: 'S$', magnitude: 'thousands',
        rowLabels: ['Jugra Trust: fees', 'Probate and estates', 'Conveyancing', 'Archive and shredding', 'Special disbursements'],
        colLabels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        clue: 'Mrs. Pang: "I print it Thursday at five. Every Thursday. The terminal says somebody saved it again on Friday at twelve minutes past six. I was asleep."',
      },
      evidence: {
        img: 'ev_c10_ledger', hotspot: { x: 0.45, y: 0.58, r: 0.18 },
        title: 'Eighty thousand to Tuas',
        short: 'Restored: a "special disbursement" of S$80,000 to Tuas SecureShred on Thursday 14 January, approved C.S.; and S$12,000 to the same company in December for "archive works", basement. Both were changed at 06:12 on Friday under the login C. SEAH, forty-three minutes before she says she first came in.',
        text: 'Two cells, put back to what Mrs. Pang printed at five on Thursday afternoon. Special disbursements, January: S$80,000, to Tuas SecureShred Pte Ltd, on 14 January, approved C.S. A shredding company that collects six bins a week charges the firm about nine hundred dollars a month. Archive and shredding, December: S$12,000, to the same company, for "archive works, basement", which nobody at the firm remembers being done. The terminal\'s own record says both cells were saved again at 06:12 on Friday morning under the login C. SEAH, from the partners\' room on the second floor, forty-three minutes before Clarissa Seah walked in by the front door "for the first time". Mrs. Pang turns the binder\'s pages back with one finger to show you something else, in the column of Arthur\'s own drawings, in his pencil: "L. stopped, Oct." "His son," she says. "Mr. Arthur stopped the allowance in October. He said it was the kindest thing left to do."',
      },
    },
    {
      id: 'c10_06', phase: 'The file lift', title: 'Dead since 1998',
      game: 'wiretap', variant: 'classic',
      brief: 'In the back corner of the basement, behind the archive shelves, is a steel door the height of a child and a bell panel beside it with three brass buttons: B, 2, 3. The file lift, built in 1961 to carry deed boxes between the strongroom and the archive. Mrs. Pang says it died in 1998 and Mr. Arthur had a bookcase built over its hatch upstairs so that he would not have to look at it. The junction box under the bell panel has been opened and closed again. Wire it into one working circuit.',
      params: {
        size: 7, targets: 2,
        clue: 'The old wire is cloth-covered and brown. Some of what is in the box is not.',
      },
      evidence: {
        img: 'ev_c10_liftbox', hotspot: { x: 0.43, y: 0.52, r: 0.15 },
        title: 'The file lift works',
        short: 'Rewired, the bell panel answers from the basement and from the third floor. Inside the 1961 duct, new copper beside the old cloth-covered wire; fresh grease on the cables; a new contactor on the motor. The cab is eighty centimetres by seventy by ninety, built for files. On the third floor its hatch opens directly behind the bottom of Arthur\'s bookcase.',
        text: 'The old wiring is brown cloth over copper, laid in 1961 by a firm of electricians from Penang, and most of it is as dead as Mrs. Pang says. But threaded through the same steel duct, beside it, is a run of new grey cable, and when the last tile turns the panel\'s lamps come on together: B, 2, 3. Somewhere above you a bell rings in a wall. The lift\'s motor sits in a cage at the bottom of the shaft, and its cables shine with fresh grease; the contactor that switches it is new, still with the maker\'s plastic film on its cover. The cab is a steel box eighty centimetres wide, seventy deep and ninety high, built to carry forty kilos of deed boxes and rated, on a plate nobody has read since 1961, for two hundred. On the third floor the shaft ends in a hatch in the inner wall of the old strongroom, at floor level. In 1998 a carpenter built a bookcase in front of it. Its bottom section is hinged at the back. Mrs. Pang watches the lamps come on and sits down on a box of probate files. "December," she says. "The shredding company sent men for two days in December. To clear the basement, Miss Clarissa said."',
      },
    },
    {
      id: 'c10_07', phase: 'The file lift', title: 'The pocket recorder',
      game: 'tape', variant: 'reverse',
      brief: 'Under Arthur\'s chair, beside the hearing aid, Teo\'s officer finds a pocket recorder the size of a cigarette packet. The old man dictated his notes into it for thirty years; it wakes at the sound of a voice and sleeps again in silence, and it was set to its slowest speed to last the night. On the deck in Teo\'s van it comes out wrong. Find the direction and the speed where it turns back into speech.',
      params: {
        line: ARTHUR_LINE,
        answer: 'cross the water',
        accept: ['the water', 'water', 'cross water'],
        ask: 'What would the man in 1987 not do?',
        mode: 'slow',
        label: 'DICTAPHONE · A.S. · THU-FRI',
        clue: 'It records only when somebody speaks, so the night is a handful of seconds. The first of them is him.',
      },
      evidence: {
        img: 'ev_c10_recorder', hotspot: { x: 0.38, y: 0.75, r: 0.13 },
        title: 'Ah Kong, your tea',
        short: 'Arthur rehearsing for you: "He would not cross the water. I do not cross water, he said." Then what woke the recorder in the night: at 22:28 Clarissa, "Ah Kong, your tea." At 05:56 a motor, a steel box bumping a wall, and a man\'s voice, close, in Tamil: "Mannikkanum, aiya." Sorry, sir.',
        text: 'Brought to its proper speed, the first thing on the tape is the old man himself at about ten o\'clock, rehearsing what he would say to you, the way a solicitor rehearses a witness: "Seven o\'clock on Friday. I met him once, in 1987, on the Johor side. He would not cross the water." A pause, a cough, and then, as if he had just remembered the words exactly: "I do not cross water, he said. As if it were a rule of the house." Then the recorder slept. At 22:28 it woke for a knock and a woman\'s voice through the door, in Hokkien and then English: "Ah Kong, your tea." The bolt, back and forth again. Then nothing for seven and a half hours, because a man asleep in a chair says nothing. At 05:56 it woke for a sound that is not a voice and recorded it anyway, because it was loud enough: an electric motor winding up somewhere inside the wall, a steel box knocking against brickwork, wood scraping on wood. And close to the recorder, low, a man\'s voice, out of breath, in Tamil: "Mannikkanum, aiya." Sorry, sir. Then the motor again, going away downwards, and silence until the constable\'s shoulder hit the door at seven.',
      },
    },

    // ---------------- The basement ----------------
    {
      id: 'c10_08', phase: 'The basement', title: 'The archive',
      game: 'searchlight', variant: 'classic',
      brief: 'The basement archive is a long, low room of steel shelving and deed boxes, and its own lights have not worked since 2009; Mrs. Pang goes in with a torch. Teo lends you her scene officers\' floodlights. Light every aisle, and do not let one lamp glare into another, or you will not see the floor.',
      params: {
        size: 8, walls: 'medium',
        clue: 'The numbered stacks of deed boxes say how many lamps stand right beside them. A lamp lights its row and column until a stack stops it.',
      },
      evidence: {
        img: 'ev_c10_tracks', hotspot: { x: 0.55, y: 0.72, r: 0.18 },
        title: 'Wheel tracks',
        short: 'In the dust of the archive floor: two parallel tracks of a 240-litre bin\'s wheels, from the file lift\'s basement door to the loading door, pressed deep. Beside them, a hearing-aid battery fallen from a cardigan pocket. The wall to No. 216 behind the shelving is solid brick, under a hundred years of dust that nobody has touched.',
        text: 'Lit end to end, the archive floor is a sheet of grey dust with a history written in it. Mrs. Pang\'s narrow shoes, going to one shelf and back, over and over, for years. The broad boots of two men, going everywhere, from December. And one thing that is not feet: two parallel wheel tracks, a 240-litre bin\'s width apart, from the little steel door of the file lift across the room to the loading door, pressed into the dust much deeper than the other tracks the bins have left over the years, as though this one had been very heavy. Beside the tracks, halfway across, a hearing-aid battery, size 312, the kind that goes in the aid lying on the floor upstairs; Arthur kept spares in his cardigan pocket. Along the north side of the room the shelving stands against the party wall of No. 216, which the firm owned until 1971. Teo has the shelves pulled out. Behind them is solid brick, laid in lime, under a hundred years of dust that nobody has disturbed.',
      },
    },
    {
      id: 'c10_09', phase: 'The basement', title: 'The handrail',
      game: 'dna', variant: 'mixed',
      brief: 'The file lift\'s cab has a steel handrail along its back wall, put there in 1961 for a clerk to hold while he rode with the boxes. Teo calls in a favour at the Health Sciences Authority and has the swabs run before lunch. The cab holds two people\'s traces. Read the bands.',
      params: { suspects: 7 },
      evidence: {
        img: 'ev_c10_cab', hotspot: { x: 0.42, y: 0.50, r: 0.17 },
        title: 'A man from Tuas',
        short: 'In the file lift\'s cab: Arthur Seah\'s white hair on the floor, and a second man\'s sweat on the handrail, gripped hard. He is on file since a 2015 arrest for affray: Ganesan Raju, 48, operations supervisor at Tuas SecureShred, a subsidiary of Sinar Cold Chain Pte.',
        text: 'Two people rode in a box built for paper. On the cab floor, in the corner, three white hairs and a grey wool fibre: Arthur Seah\'s, by the hair on his own comb upstairs, and his cardigan. On the steel handrail, a second profile, from sweat, laid on thick where a hand gripped the rail hard and long, as a man holds on when he is kneeling in a small box with something heavy in his lap. The second profile is on the Singapore database: Ganesan Raju, known as Gary, arrested in 2015 after a fight outside a karaoke lounge in Jurong, never charged. Operations supervisor, Tuas SecureShred Pte Ltd. Teo looks the company up on her phone while you watch. Tuas SecureShred is wholly owned by Sinar Cold Chain Pte. "Your sun," she says, and turns the phone round to show you the little logo.',
      },
    },

    // ---------------- Tuas (only if Rizal walked) ----------------
    {
      id: 'c10_rz', phase: 'Tuas', title: 'The night gate',
      game: 'fingerprint', variant: 'classic',
      when: (flags) => !!flags.RIZAL_FREE,
      brief: 'At ten a message reaches Farah\'s phone from a Singapore number: "Puan. Tuas SecureShred, night gate. Bin seven. R.H." Rizal Hamdan, who deleted seventeen minutes of camera in Mont Kiara and resigned by text in November, meets you at a kopitiam in Jurong in a grey security uniform with a new company\'s badge. He has the gate log in his pocket and a strip of sellotape stuck to a page of his notebook: a print he lifted off a padlock with printer toner, the way he once watched a forensic officer do it. Classify it, then find its owner.',
      params: {
        liftLabel: 'Lift: bale-room padlock, Tuas SecureShred (toner and tape)',
        liftAria: 'Partial fingerprint lifted with printer toner from a padlock',
        candidates: [
          { id: 'gary', name: 'Ganesan Raju (SPF, 2015)' },
          { id: 'rizal', name: 'Rizal Hamdan (security licence)' },
          { id: 'haziq', name: 'Haziq Osman (TSS driver)' },
          { id: 'clarissa', name: 'Clarissa Seah (Law Society)' },
          { id: 'lucas', name: 'Lucas Seah (bankruptcy, 2019)' },
          { id: 'rajendran', name: 'R. Rajendran (security licence)' },
          { id: 'arthur', name: 'Arthur Seah (Law Society)' },
          { id: 'you', name: 'You (agency licence, 2016)' },
        ],
        answer: 'gary',
      },
      evidence: {
        img: 'ev_c10_gatelog', hotspot: { x: 0.66, y: 0.65, r: 0.13 },
        title: 'New uniform, new company',
        short: 'Rizal\'s gate log: truck 7 in at 06:51, "BIN 7 HOLD, instructions C.S.", parked in the bale room, not tipped. The print on the bale-room padlock is Gary Raju\'s. Rizal: "I have learned not to ask. I am asking you to ask."',
        text: 'The gate log is a printed sheet with times filled in by hand, and Rizal has photocopied Friday\'s on the plant\'s own machine. Truck 7, in at 06:51. In the remarks column, in the supervisor\'s capitals: BIN 7 HOLD. INSTRUCTIONS C.S. Not to the tipping floor. To the bale room, which is a cold store at four degrees where paper waits in bales for the ship to the pulp mill. The padlock on the bale room is the supervisor\'s, and the print on its shackle is Ganesan Raju\'s right thumb. Rizal stirs his kopi and does not drink it. He took the job in December because a Sinar Cold Chain recruiter rang him the week he resigned and offered him double, in another country, with a flat. "In Mont Kiara I deleted seventeen minutes and somebody died," he says. "I have learned not to ask. I am asking you to ask." He puts on his cap. "Bin seven was heavy. Two men to lift it off the truck. Paper is not heavy, Encik. I know paper now."',
      },
    },

    // ---------------- Cantonment ----------------
    {
      id: 'c10_10', phase: 'Cantonment', title: 'The prodigal',
      game: 'interrogation', variant: 'classic',
      brief: 'Teo has Lucas Seah brought to the Police Cantonment Complex at Outram, because he is the son, he inherits, and he lied. He sits in a grey room in yesterday\'s leather jacket with his hands round a paper cup of kopi he did not pay for, and he is charming for exactly as long as it takes him to remember why he is there. One thing he tells you is not true. Find it, and put the exhibit that breaks it in front of him.',
      params: {
        setting: 'Interview room 4, Police Cantonment Complex, Outram. Friday, 10:40 AM.',
        suspect: {
          id: 'lucas', voice: 'voice_2', name: 'Lucas Seah', role: 'Arthur Seah\'s son, 55',
          persona: 'Charming, ashamed, quick Singaporean Chinese man in his mid-fifties who was once the bright son of a good family: Singlish when relaxed ("lah", "can", "aiyah", "one"), polished English when he wants to impress, and a joke for every question he does not want to answer. Calls his father "Pa" and his niece "Clarissa", with a small bitterness. Talks about money as if it were weather. Frightened underneath of the men he owes, and more frightened that his father is dead and the last thing he did was shout at an intercom. Breaks into honesty about what he saw at six, once he is cornered.',
        },
        facts: [
          { id: 'f1', topic: 'himself', claim: 'Bankrupt since 2019. You can say it, lah. Everybody else does.' },
          { id: 'f2', topic: 'his father', claim: 'Pa is eighty-two and he still bolts his door every night, since that break-in in ninety-four. Like the world is coming for his files.' },
          { id: 'f3', topic: 'the firm', claim: 'I was never going to be a lawyer. Clarissa is the lawyer. Clarissa is everything.' },
          { id: 'f4', topic: 'the will', claim: 'If Pa is dead, I inherit. I know how that looks. I am not stupid, only broke.' },
          { id: 'f5', topic: 'the kopi auntie', claim: 'Auntie at Amoy Street has known me since I was nine. She thinks I am still nine.' },
          { id: 'f6', topic: 'Tuas', claim: 'The shredding company? Every Friday, six o\'clock, green overalls, since the firm stopped burning its paper. Whole street knows the truck.' },
          { id: 'f7', topic: 'the deed', claim: 'Pa never talked about his clients. Not even to me. Especially not to me.' },
        ],
        lies: [
          { id: 'l1', topic: 'Thursday night', claim: 'I was in Geylang all night with friends. Ask anybody.', truth: 'He sat on the kopi auntie\'s bench at Amoy Street Food Centre from 1:05 until 6:10.', exposedBy: 'e1' },
          { id: 'l2', topic: 'the office', claim: 'I have not been near Pa\'s office in five years. He would not let me in anyway.', truth: 'At one in the morning he rang the street-door bell and shouted at the intercom until the guard sent him away.', exposedBy: 'e2' },
          { id: 'l3', topic: 'money', claim: 'Pa still sends me a little every month. I did not need anything from him.', truth: 'His father stopped his allowance in October; he came at 1 AM to beg for three thousand dollars and was refused.', exposedBy: 'e3' },
        ],
        evidence: [
          { id: 'e1', title: 'The son across the road', text: 'The kopi auntie and the hawker centre\'s camera: Lucas Seah on her bench from 01:05 to 06:10.' },
          { id: 'e2', title: 'Nobody came, he says', text: 'The night guard\'s logbook: 01:00, L. SEAH AT STREET DOOR. NOT ADMITTED (ORDERS).' },
          { id: 'e3', title: 'Eighty thousand to Tuas', text: 'The firm\'s ledger, Mrs. Pang\'s printout: in Arthur\'s own drawings, in pencil, "L. stopped, Oct."' },
          { id: 'e4', title: 'The bookcase moved', text: 'The bottom of Arthur\'s bookcase stands two centimetres out from the wall, with a fresh scrape on the floor in front of it.' },
          { id: 'e5', title: 'Wheel tracks', text: 'Two deep tracks of a shredding bin\'s wheels in the basement dust, from the file lift to the loading door.' },
          { id: 'e6', title: 'A man from Tuas', text: 'Ganesan Raju\'s sweat on the handrail of the 1961 file lift, beside Arthur\'s hair.' },
        ],
        secret: 'He came to beg his father for three thousand dollars to pay a man who had threatened him, was refused at the intercom, and slept on the Amoy Street bench; at 6:04 he stood up and saw two men in green lift one bin over the kerb into the Tuas truck "like it was full of wet sand", and read TSS on its door, and has been sick with it since, because he thought of his father and told himself he was being stupid.',
        suggested: [
          'Where were you on Thursday night?',
          'When did you last see your father?',
          'Did you come to the office?',
          'Does your father give you money?',
          'What did you see at six o\'clock?',
          'Who gains if your father is gone?',
          'What do you know about the shredding truck?',
        ],
        maxQuestions: 14,
        clue: 'Teo, from the door: "He keeps looking at the clock on the wall. Not at us. At six on the clock."',
      },
      evidence: {
        img: 'ev_c10_kopi', hotspot: { x: 0.66, y: 0.55, r: 0.12 },
        title: 'Too heavy for paper',
        short: 'Caught in one lie, Lucas Seah tells the rest: he came at one to beg three thousand dollars and was refused. At 6:04 he stood up from the bench and watched two men in green lift one bin over the kerb into the Tuas truck, "like it was full of wet sand". TSS on the door. Seven bins. "Every other Friday they throw them up one-handed."',
        text: 'He puts the kopi down very carefully, as if it might go off. "Three thousand," he says. "To a man in Geylang who said he would start with my fingers. I rang the bell and Pa answered the intercom himself at one in the morning, wide awake, and said: no, Lucas. Not any more. He was kind about it. That was worse." He sat on the auntie\'s bench and did not sleep. At six the Tuas truck came, as it does, and he watched it because there was nothing else to watch. "Every Friday two boys in green throw the bins up onto the tail-lift one-handed, like pillows. Paper is nothing." He looks at his hands. "On Friday one bin took both of them. They tipped it on the kerb and lifted it together and one of them said something to the other in Tamil, sharp. Like it was full of wet sand. I counted seven bins. It is always six." He had read TSS on the truck door and thought of his father, and then told himself he was being a stupid old drunk, and sat down again. "If I had crossed the road," he says. "If I had crossed the road."',
      },
    },
    {
      id: 'c10_11', phase: 'Seah & Seah', title: 'Keycards and cameras',
      game: 'timeline', variant: 'cctv',
      brief: 'The firm\'s security is old but it remembers everything: a corridor camera on the third floor, a camera on the street door, one over the guard desk and one in the basement corridor, a keycard reader on the front and the back doors, and a building meter that logs every motor that draws current. Teo has it all on one laptop in the partners\' room. Eight frames, out of order, some clocks smudged. Put the night back together.',
      params: {
        frames: [
          { id: 'a', clock: '22:02', title: 'Corridor camera, third floor', text: 'Arthur Seah goes in with a green document box under his arm. The door shuts. The bolt.' },
          { id: 'b', clock: '22:28', title: 'Corridor camera, third floor', text: 'Clarissa Seah knocks; the door opens a hand\'s width; she hands in a cup and saucer. The bolt again.' },
          { id: 'c', clock: '01:0▮', title: 'Street door camera', text: 'Lucas Seah at the bell, shouting at the intercom. Nobody opens. He crosses the road.' },
          { id: 'd', clock: '02:10', title: 'Guard desk camera', text: 'Rajendran\'s head on his folded arms beside the logbook. He does not move again until 04:55.' },
          { id: 'e', clock: '05:50', title: 'Back door keycard reader', text: 'Card C. SEAH, entry.' },
          { id: 'f', clock: '05:5▮', title: 'Building meter', text: 'Circuit 7, FILE LIFT (DISUSED), draws current for four minutes, then stops.' },
          { id: 'g', clock: '06:0▮', title: 'Basement corridor camera', text: 'Two men in green overalls wheel bins to the loading door. One, two, three, four, five, six, seven.' },
          { id: 'h', clock: '06:55', title: 'Front door keycard reader', text: 'Card C. SEAH, entry. The guard\'s logbook: "Miss Clarissa, first arrival."' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The night plays in order. The corridor camera saw nobody at his door after 22:28, and Clarissa Seah came in twice.',
      },
      evidence: {
        img: 'ev_c10_keycards', hotspot: { x: 0.62, y: 0.62, r: 0.16 },
        title: 'In at 5:50',
        short: 'The corridor camera saw nobody at Arthur\'s door after 22:28. The guard slept from 2:10 to 4:55. Clarissa Seah\'s keycard opened the back door at 5:50. Two minutes later the disused file lift drew current for four minutes. At 6:04 seven bins went to the Tuas truck. At 6:55 her keycard opened the front door, and the guard wrote "first arrival".',
        text: 'Nobody went through Arthur\'s door after half past ten: the corridor camera, which looks straight at it, shows nothing but the bulb in the corridor until the constables at seven. At one, Lucas at the street door, turned away. At ten past two, the night guard asleep at his desk with his head on his arms, and he stays asleep until five to five: his rounds at two and four were written into the logbook from his chair. At ten to six the back door\'s reader logs a card: C. SEAH. The back door opens onto the service lane behind Telok Ayer Street, where no camera looks, and its reader logs only entries. At 05:52 the building meter, which nobody reads, records circuit 7, labelled in 1998 FILE LIFT (DISUSED), drawing current for four minutes. At 06:04 the basement camera counts seven bins to the loading door. And at 06:55 the same card opens the front door, and the guard writes, as he was told, "Miss Clarissa, first arrival". Clarissa Seah came into the building twice on Friday morning, and told Teo once.',
      },
    },
    {
      id: 'c10_12', phase: 'Seah & Seah', title: 'Her own shredder',
      game: 'shredder', variant: 'classic',
      brief: 'Clarissa Seah has her own office on the second floor, with a window onto the temple and a small shredder under her desk, because a partner does not put her paper in the bins that go to Tuas. The firm\'s cleaners come on Mondays. Teo stands in the doorway and says that she has not seen you open the drawer of the shredder. Some strips went in upside down.',
      params: {
        title: 'SINAR HOLDINGS BERHAD',
        text: 'OFFICE OF THE CHAIRMAN\n\nTo: C.S., Seah & Seah\nWednesday, 23:40\n\nThe trustee first.\nThen the letter.\n\nTuas will collect\non Friday as usual.\n\nNothing on the phones.',
        strips: 10,
        flips: true,
        stamp: 'PRIVATE',
        clue: 'Two sheets went through on Thursday. One of them is a typed note to somebody; the other is the answer.',
      },
      evidence: {
        img: 'ev_c10_shred', hotspot: { x: 0.55, y: 0.45, r: 0.18 },
        title: 'The trustee first',
        short: 'Clarissa\'s typed note to the Office of the Chairman, printed for its courier: "He means to show the deed and the letter to the Malaysian at seven on Friday." And the printed reply, Wednesday 23:40: "The trustee first. Then the letter. Tuas will collect on Friday as usual. Nothing on the phones."',
        text: 'Two sheets in one shredder drawer. The first is hers, typed on the firm\'s paper and printed for a courier, because nothing goes to the Office on the phones: "Ah Kong has written to the Malaysian detective. He means to show the deed and the letter to the Malaysian at seven on Friday, in his room. He has asked me to bring both up from the strongroom on Thursday. Please advise. C." The second is the answer, on a letterhead that has come up in three countries now, printed, unsigned, delivered to the firm\'s back door at twenty to midnight on Wednesday by a courier on a Johor-registered motorcycle. The trustee first. Then the letter. Two things, in order, as always. Tuas will collect on Friday as usual. Nothing on the phones. Farah reads it twice standing up and then sits down, because her knee has had enough. "The trustee is the old man," she says. "Then the letter of wishes. He did not even bother to say the deed. He knew she would never let that out of her hands."',
      },
    },
    {
      id: 'c10_13', phase: 'Seah & Seah', title: 'The microfiche',
      game: 'nonogram', variant: 'classic',
      brief: 'In 1988 the firm put every deed it held on microfiche, and the fiche cabinet still stands in the archive under a dust sheet. The Jugra Trust\'s card is there. The frame with its signing page has a scratch across it, and the reader shows only squares of light and dark. Mrs. Pang knows how to read a bad fiche: square by square, against the counts along its edges. Rebuild the frame.',
      params: {
        solvedText: 'The frame resolves: a thumbprint, rolled in ink beside a signature.',
        picture: [
          '.....#####.....',
          '...###...###...',
          '..##..###..##..',
          '.##.##...##.##.',
          '.#.##.###.##.#.',
          '##.#.##.##.#.##',
          '#.##.#...#.##.#',
          '#.#.##.#.##.#.#',
          '#.#.#.###.#.#.#',
          '##.#.#...#.#.##',
          '.#.#..###..#.#.',
          '.##.##...##.##.',
          '..##..###..##..',
          '...###...###...',
          '.....#####.....',
        ],
      },
      evidence: {
        img: 'ev_c10_microfiche', hotspot: { x: 0.40, y: 0.40, r: 0.18 },
        title: 'The settlor who was not Muthu',
        short: 'The Jugra Trust, settled at Johor Bahru on 1 December 1987, Seah & Seah Trust Co. as trustee. It owns Sinar Holdings Pte Ltd, which owns 51% of Sinar Holdings Berhad. Settlor: "Muthusamy a/l Perumal, sole proprietor of Sinar Pengangkutan, Jugra". Signed in a Latin flourish, with a left thumb; witnessed A. Seah. Farah\'s JPN check: Muthu signed everything in Tamil, and neither of his thumbs is this one.',
        text: 'The frame comes up on the reader\'s screen like a face surfacing in water: the last page of a deed of settlement. THE JUGRA TRUST. Made at Johor Bahru on the first day of December 1987, between the Settlor and Seah & Seah Trust Company (Private) Limited of 214 Telok Ayer Street, Singapore. The schedules behind it, which Mrs. Pang knows by heart, say what the trust owns: one company, Sinar Holdings Pte Ltd, incorporated in 1988, which owns fifty-one per cent of Sinar Holdings Berhad of Kuala Lumpur, which owns everything with a sun on it. The settlor is typed as "Muthusamy a/l Perumal, sole proprietor of Sinar Pengangkutan, Jugra". Above his name, a signature in Latin letters with a long confident flourish. Beside it, rolled in ink, a left thumb. Witnessed: A. Seah. Farah sends the frame to a friend at the National Registration Department in Putrajaya and has the answer before Mrs. Pang has put the dust sheet back. Muthusamy a/l Perumal signed every form of his life in Tamil, in a careful round hand. Neither of the thumbs on his MyKad is this thumb. "Forty years he drove him," Farah says. "And all that time he was the owner of Sinar on paper. I do not think anybody ever told him."',
      },
    },
    {
      id: 'c10_nf', phase: 'Seah & Seah', title: 'Two left thumbs',
      game: 'fingerprint', variant: 'classic',
      when: (flags) => !!flags.NOTE_FOUND,
      brief: 'Hamidah sends the cancelled promissory note from Melaka by courier in a plastic sleeve: two thumbs, the guarantor\'s right and the borrower\'s left. Against the left thumb on the 1987 deed, which Teo has had printed off the fiche at full size, the lab at Cantonment sets out every thumb this case has touched. Classify the deed\'s thumb, then find its match.',
      params: {
        liftLabel: 'Left thumb: deed of settlement, the Jugra Trust, 1 December 1987 (from microfiche)',
        liftAria: 'A rolled left thumbprint enlarged from a microfiche frame',
        candidates: [
          { id: 'note', name: 'Borrower\'s left thumb, promissory note, Melaka, 2 Dec 1986' },
          { id: 'guarantor', name: 'Guarantor\'s right thumb, the same note (M. Perumal)' },
          { id: 'muthul', name: 'Muthusamy a/l Perumal, MyKad, left thumb' },
          { id: 'muthur', name: 'Muthusamy a/l Perumal, MyKad, right thumb' },
          { id: 'arthur', name: 'Arthur Seah (Law Society)' },
          { id: 'clarissa', name: 'Clarissa Seah (Law Society)' },
          { id: 'gary', name: 'Ganesan Raju (SPF, 2015)' },
          { id: 'you', name: 'You (agency licence, 2016)' },
        ],
        answer: 'note',
      },
      evidence: {
        img: 'ev_c10_thumbs', hotspot: { x: 0.37, y: 0.55, r: 0.18 },
        title: 'Two left thumbs',
        short: 'The left thumb on the 1987 deed and the borrower\'s left thumb on the Melaka note of 2 December 1986 share the same nine clear points. The man who borrowed the first money settled the trust a year later. Still nine points: the national search needs twelve.',
        text: 'The lab at Cantonment lays the two thumbs side by side on a light box, the deed\'s enlarged off a microfiche and the note\'s off forty years of a Chettiar\'s strongroom, and marks the points in red one by one. A ridge ending low on the left. A bifurcation under the core. A short island. Nine points, the same nine, on both. The fiche is too soft to give more and the note is worn where a thumb has rubbed it. The man who borrowed RM 18,000 in Melaka on the second of December 1986 against a lorry, and repaid it to the day, rolled the same left thumb a year later on the Johor shore to give away the company he had built, on paper, to his driver. Teo reads the lab sheet twice. "Nine," she says. "In Singapore also, nine is not a name." Farah photographs it anyway and sends it to Hamidah, who answers with one word: "Again."',
      },
    },
    {
      id: 'c10_14', phase: 'Seah & Seah', title: 'The brass bowl',
      game: 'safecracker', variant: 'classic',
      brief: 'Clarissa Seah\'s desk has a drawer with a four-digit brass lock, and on the desk a brass bowl that Mrs. Pang says was her grandmother\'s, for joss paper at the Hungry Ghost festival. There is ash in it, and it is January. Mrs. Pang says Miss Clarissa uses the trust\'s year for every lock in the building, and never the same way round twice.',
      params: {
        digits: 4, tries: 8, bonus: 4, repeats: false,
        contains: [1, 9, 8, 7],
        clue: 'Mrs. Pang: "The trust\'s year. She says the numbers are the trust\'s and the order is hers."',
      },
      evidence: {
        img: 'ev_c10_bowl', hotspot: { x: 0.50, y: 0.58, r: 0.17 },
        title: 'Ashes and one corner',
        short: 'In Clarissa\'s locked drawer: the original 1987 deed of the Jugra Trust, folded in its green tape. In the brass bowl on her desk, ash from good paper, and one corner that did not burn, with the end of one handwritten line in a left hand: "...drives me last."',
        text: 'The drawer opens on a stack of probate files and, under them, folded in faded green tape, the original deed of settlement of the Jugra Trust, its thumbprint brown with age. She kept the deed. Nobody would ever let that out of their hands. The bowl on the desk is old brass, for joss paper, and there is ash in it from heavy cream paper, the kind a careful man uses for a letter he means to last. Most of it went to powder when she stirred it. One corner did not: a triangle the size of a stamp, browned along its torn edge, with the end of one handwritten line on it in ink, every stroke dragged at its tail by the side of a left hand: "...drives me last." Teo bags it with tweezers and holds it up to the window. Through it, across the street, the roof of Thian Hock Keng. "Drives me last," she says. "Your Malaysian bosses all have drivers, right?" Farah does not answer. She is looking at the window, and thinking about the first of December.',
      },
    },

    // ---------------- Tuas ----------------
    {
      id: 'c10_15', phase: 'Tuas', title: 'The weighbridge',
      game: 'quickmath', variant: 'receipts',
      brief: 'Every bin that goes into Tuas SecureShred is weighed on the way in, because the plant sells its paper by the tonne to a pulp mill in Indonesia and charges its clients by the kilo. The plant\'s office faxes Friday\'s slips to Teo with a covering note about client confidentiality. Check every slip against the totals before somebody at the plant thinks better of it.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c10_weighslips', hotspot: { x: 0.48, y: 0.70, r: 0.18 },
        title: 'Sixty-one kilos',
        short: 'Friday\'s weighbridge slips for the Seah & Seah collection: six bins at 18 to 24 kilos of paper, as every Friday. Bin 7 at 79 kilos: sixty-one more than a bin of paper. Arthur Seah, by his doctor\'s last letter in his desk, weighs sixty-one kilos.',
        text: 'Fifty-two Fridays of slips for one client, and they hardly vary: six bins, each between eighteen and twenty-four kilos, because a law firm shreds about the same amount of paper every week of its life. Friday 15 January: bins 1 to 6, 21, 19, 24, 18, 22, 20. Bin 7: seventy-nine kilos. Bin 7 has no paper weight from any earlier week, because until this Friday there was no bin 7. Take off eighteen kilos for a little paper on top, and there are sixty-one kilos left in it that are not paper. In Arthur Seah\'s desk upstairs there is a letter from his doctor at Gleneagles, dated December, telling him to eat more: he weighs sixty-one kilos and should weigh sixty-five. The slip for bin 7 has a second stamp across it, in red: HOLD. And the initials of the supervisor who weighed it: G.R.',
      },
    },
    {
      id: 'c10_16', phase: 'Seah & Seah', title: 'The partners\' line',
      game: 'dialtone', variant: 'classic',
      brief: 'Since the break-in in 1994, Arthur Seah has had every call on the partners\' line recorded to a box in the strongroom, for his own protection, and then forgotten he had. Mrs. Pang has not. At 05:52 on Friday the line made one call: eight tones, then five words. Listen, and type the number.',
      params: {
        digits: 8, number: '96274013', noise: 0.2,
        clue: 'Singapore mobiles are eight digits and start with 8 or 9.',
      },
      evidence: {
        img: 'ev_c10_phone', hotspot: { x: 0.55, y: 0.50, r: 0.17 },
        title: 'Bin seven. Hold it.',
        short: 'Friday 05:52, from the partners\' line on the second floor: 9627 4013. A man answers on the first ring. A woman says five words: "Bin seven. Hold it." Then she hangs up. The number is Ganesan Raju\'s mobile.',
        text: 'Eight tones, quick and sure, from somebody who had the number written down in front of her. A man answers on the first ring, as if he had been holding the phone, and says nothing. A woman says five words in a low, clear, educated voice, the voice of somebody reading out a line she has written: "Bin seven. Hold it." The line goes dead. Two seconds later, on the same recording, faintly, an electric motor starts up inside the walls. The number is registered to Ganesan Raju, Rowell Road, Singapore. Teo listens to it three times with her eyes shut. "Nothing on the phones, the paper says," she remarks. "Somebody was in a hurry." Mrs. Pang, at the door, has gone very pale. She knows the voice. She has taken its dictation for nineteen years.',
      },
    },

    // ---------------- Little India ----------------
    {
      id: 'c10_17', phase: 'Little India', title: 'Rowell Road',
      game: 'pursuit',
      brief: 'Gary Raju lives in a walk-up flat above a hardware shop on Rowell Road, in Little India, and finished his shift at ten. Teo takes four officers and lets you come because you are faster on foot than her sergeant. Gary opens the door in a singlet, sees the lanyard, and goes out of the back window onto the roof of the kitchen below and down into the lane behind Tekka. You go after him.',
      params: {
        setting: 'market',
        route: ['market', 'city', 'city', 'rooftop'],
        legs: 4,
        beats: [
          'Out of Tekka\'s wet market onto Serangoon Road, between the sari shops and the garland stalls, jasmine and marigolds underfoot.',
          'Into the back lanes behind Rowell Road: air-conditioner drips, stacked crates, a temple cart, a man frying vadai who swears at both of you.',
          'Up the ramps of a multi-storey car park, level after level, towards the roof. There is nowhere to go from a roof.',
        ],
        difficulty: 'medium',
        vehicle: 'foot',
        suspect: 'Gary',
        skyline: 'town',
        clue: 'He runs like a man who has done it in uniform: elbows in, never looking back.',
      },
      evidence: {
        img: 'ev_c10_carpark', hotspot: { x: 0.55, y: 0.68, r: 0.15 },
        title: 'The bale-room key',
        short: 'You bring Gary Raju down on the roof of a car park off Serangoon Road. In his pocket: a padlock key with a green plastic tag, BALE RM, and a shredding-bin tag on a cable tie, written in marker: "BIN 7 HOLD C.S." He asks only one thing: "Is he cold?"',
        text: 'He stops at the parapet of the roof with the whole of Little India under him and Teo\'s sergeant coming up the last ramp, and turns round, and does not fight, and sits down on the hot concrete with his back against the wall. Teo\'s officer turns out his pockets. A wallet with forty dollars and a photograph of two little girls in school pinafores. A mobile phone that ends in 4013. A padlock key on a green plastic tag marked BALE RM. And a shredding-bin tag on a cable tie, the kind that is clipped onto a bin\'s handle at the plant, written on in black marker in capitals: BIN 7 HOLD C.S. He looks at it on the concrete as if it were somebody else\'s. Teo holds him "to assist" because she has nothing yet she can charge him with, and he goes down the ramps between two officers without a word. At the car he says one thing, to you, not to her. "Is he cold? The bale room is cold." Nobody answers him.',
      },
    },

    // ---------------- Tuas ----------------
    {
      id: 'c10_18', phase: 'Tuas', title: 'Truck seven',
      game: 'getaway', variant: 'classic',
      brief: 'Tuas SecureShred is a long grey shed at the far western end of the island, where the expressway runs out and the cranes begin. By the time Teo\'s car reaches the gate, truck 7 has been boxed into the corner of the yard by bale trailers and forklifts, and the plant manager is on the phone to a lawyer. The truck\'s tipping computer is in its cab. Get it out where you can read it.',
      params: {
        difficulty: 'hard', target: 'TRUCK 7',
        clue: 'Trailers and forklifts only roll forwards and back. The gate is on the right. The plant manager is taking his time.',
      },
      evidence: {
        img: 'ev_c10_truck', hotspot: { x: 0.50, y: 0.66, r: 0.15 },
        title: 'Truck seven never tipped',
        short: 'Truck 7\'s tipping log: no tip on Friday. In at 06:51, reversed straight into the bale room, one bin off-loaded by hand, out empty. The bale room is a cold store at four degrees, locked with the supervisor\'s padlock. The plant\'s lawyer says nobody opens it without a warrant.',
        text: 'The cab of truck 7 smells of diesel and somebody\'s breakfast, and its tipping computer keeps a little paper roll of every lift its tail ever made. Friday: in at the gate at 06:51. No tip. Reversed to door 4, the bale room. One lift, manual, one bin. Out of the yard empty at 07:12, which is twelve minutes after a constable\'s shoulder went through a door on Telok Ayer Street. Door 4 is a steel door with frost on its hinges, and the panel beside it says four degrees. The padlock on it is the supervisor\'s, and the supervisor is sitting in a police car at Cantonment. The plant manager comes out at last with a lawyer on speakerphone, and the lawyer, who acts for Sinar Cold Chain Pte, says in a pleasant voice that nobody will open a client\'s secure store without a magistrate\'s warrant, and that he will be very happy to oppose one. Teo takes the phone off the manager and says something to the lawyer in Hokkien that makes the manager laugh before he can stop himself.',
      },
    },

    // ---------------- Ann Siang Hill (only if Vivian walked) ----------------
    {
      id: 'c10_vv', phase: 'Ann Siang Hill', title: 'Shorthand',
      game: 'anagram', variant: 'phrase',
      when: (flags) => !!flags.VIVIAN_FREE,
      brief: 'Vivian Chua is on a bench at the top of Ann Siang Hill at noon with a paper bag of kueh and a view of nothing, as if she had been told where you would walk. She does not look at you. She says she typed for the Office for twenty-seven years and she is not going to tell you anything, and then she tears four pages out of her shorthand pad and puts them on the bench between you, scrambled on purpose, the way she was taught to keep a secretary\'s notes. Unscramble them.',
      params: { difficulty: 'hard' },
      evidence: {
        img: 'ev_c10_pad', hotspot: { x: 0.45, y: 0.55, r: 0.20 },
        title: 'Never in a room',
        short: 'Unscrambled, Vivian Chua\'s pad says one thing: "In twenty-seven years he dictated to me down a car telephone. I never once typed a word he said in a room."',
        text: 'Pitman shorthand, in the hand of a woman taught by nuns in Ipoh in 1974, scrambled the way she scrambles everything she has ever been afraid to keep: and put back together, it is not a secret about money or a name or a place. It is only this. "In twenty-seven years he dictated to me down a car telephone. I never once typed a word he said in a room." She has gone by the time you look up, and the kueh is still on the bench, and Farah eats one, because she has not had lunch, and says it is the best kueh she has ever had and she hopes it is not poisoned.',
      },
    },

    // ---------------- Cantonment ----------------
    {
      id: 'c10_19', phase: 'Cantonment', title: 'Five statements',
      game: 'whoslying', variant: 'classic',
      brief: 'By half past twelve Teo has five people in five rooms at Cantonment, all of them saying something about Friday morning, and a superintendent upstairs asking her why a Malaysian private detective is in her incident room. She lays the statements out on one table. Two of them are lying.',
      params: {
        solvedLine: 'Teo reads the five statements twice. "Two liars. One lies about his rounds. One lies about everything."',
        people: [
          { id: 'clarissa', name: 'Clarissa Seah', says: [
            { t: '"I came in at 6:55. Nobody from the family was in the building before me."', fact: false, note: 'The back door\'s reader: card C. SEAH, entry, 05:50.' },
            { t: '"Mrs. Pang is lying."', about: 'pang', is: false },
          ] },
          { id: 'rajendran', name: 'R. Rajendran', says: [
            { t: '"I walked every floor at two and again at four."', fact: false, note: 'The guard desk camera: his head on his arms from 02:10 to 04:55.' },
            { t: '"Mr. Lucas is lying."', about: 'lucas', is: false },
          ] },
          { id: 'lucas', name: 'Lucas Seah', says: [
            { t: '"At six the Tuas men lifted one bin over the kerb together, like it was full of wet sand."', fact: true, note: 'The weighbridge: bin 7, seventy-nine kilos.' },
            { t: '"The guard is lying about his rounds."', about: 'rajendran', is: false },
          ] },
          { id: 'pang', name: 'Mrs. Pang, office manager', says: [
            { t: '"The ledger I printed at five on Thursday has an eighty-thousand-dollar payment to Tuas in it."', fact: true, note: 'Her binder, and the terminal\'s save at 06:12.' },
            { t: '"Miss Clarissa is lying."', about: 'clarissa', is: false },
          ] },
          { id: 'haziq', name: 'Haziq Osman, TSS driver', says: [
            { t: '"We took seven bins on Friday, not six. Bin seven was on the sheet as HOLD."', fact: true, note: 'The basement camera counts seven.' },
            { t: '"At least two of the others are lying."', atLeast: 2 },
          ] },
        ],
        liars: ['clarissa', 'rajendran'],
      },
      evidence: {
        img: 'ev_c10_statements', hotspot: { x: 0.45, y: 0.52, r: 0.20 },
        title: 'Two liars at the firm',
        short: 'Clarissa Seah lied about Friday morning: her card opened the back door at 5:50. R. Rajendran lied about his rounds: he slept at his desk from 2:10 to 4:55 and wrote them in from his chair. He never went upstairs, and his card was never used. Lucas, Mrs. Pang and the driver told it straight.',
        text: 'Rajendran breaks first, because he is a soldier and the camera is a camera. He slept. He has slept at that desk every night since his wife died, from two until nearly five, and written his rounds into the book in the morning, because nothing ever happened at 214 Telok Ayer Street and the firm pays him less than its shredding. He never went upstairs. His card was never used anywhere in the building. He asks Teo to tell Mr. Arthur he is sorry, and then remembers, and puts his face in his hands. Clarissa Seah does not break. She says, very politely, that she would like a lawyer who is not her own firm, and that she has never in her life been in the building at ten to six. Haziq the driver signs his statement and asks whether he will lose his job for telling it. Teo says probably. He signs it anyway.',
      },
    },
    {
      id: 'c10_20', phase: 'Cantonment', title: 'Everyone at 6:04',
      game: 'logicgrid', variant: 'classic',
      brief: 'Before anybody sits across a table from Clarissa Seah, Teo wants the minute the seventh bin went over the kerb on one sheet of paper: 6:04 AM, Friday. Five people, five places, five things in their hands, and one of the five is you, asleep in a hotel on Club Street with a key in your pocket.',
      params: {
        categories: [
          { name: 'Person', items: ['Clarissa', 'Gary', 'Lucas', 'Rajendran', 'You'] },
          { name: 'Location', items: ['The guard desk', 'A hotel on Club Street', 'The back lane', 'The Amoy Street bench', 'The basement file-lift door'] },
          { name: 'Holding', items: ['A kopi', 'The deed', 'His cap', 'A key with a brass sun', 'A bin tag'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[2, 1], [4, 4], [3, 0], [0, 2], [1, 3]],
        clues: [
          'Whoever sat at the guard desk had taken his cap off and put it beside the logbook.',
          'You were not in Telok Ayer Street at six, and you had a key in your pocket.',
          'The bin tag was underground.',
          'Lucas never set foot inside the building all night.',
          'Clarissa was carrying something forty years old.',
          'Whoever held the deed was out of doors, but not sitting down.',
          'The kopi was bought from the auntie at Amoy Street and drunk where it was bought.',
          'Gary was nowhere near the guard desk.',
        ],
      },
      evidence: {
        img: 'ev_c10_grid', hotspot: { x: 0.70, y: 0.45, r: 0.18 },
        title: 'One sheet of paper',
        short: 'At 6:04 on Friday: Clarissa Seah in the back lane with the deed under her coat. Gary Raju at the basement file-lift door with a bin tag. Lucas on the Amoy Street bench with a kopi. Rajendran at the guard desk, his cap beside the logbook. You on Club Street, asleep, with a key with a brass sun in your pocket.',
        text: 'Six minutes past four in the morning is when the old man fell asleep in his chair, and six minutes past six is when he went over a kerb in a bin. At that minute Clarissa Seah was in the service lane behind Telok Ayer Street, where no camera looks, with a deed of settlement folded under her coat and her grandfather\'s letter already ash. Gary Raju was in the basement with a bin tag in his hand, at the door of a lift he had made work again. Lucas Seah was on a bench with a kopi he had not paid for, standing up to look across the road. Rajendran was at his desk with his cap beside the logbook and the rounds he had not walked already written in. And you were asleep four hundred metres away on Club Street, in a room the size of a lift, with a key with a brass sun on it in the pocket of the jacket on the chair. Teo puts the sheet in her folder. "Now," she says. "Now we talk to the granddaughter."',
      },
    },
    {
      id: 'c10_21', phase: 'Cantonment', title: 'For ASP Teo',
      game: 'theory', variant: 'classic',
      brief: 'Teo has twenty minutes before her superintendent comes down, one sheet of paper and a Malaysian inspector with a stick. "Not your feelings, ah. The story. Who, how, why, and what she burned. Then I can go and ask a magistrate for one thing."',
      params: {
        prompt: 'Write Friday morning for ASP Teo: who took Arthur Seah, how he left a room bolted from the inside, why, and what happened to the letter he kept.',
        context: 'Arthur Seah, 82, a Singapore solicitor, meant to show a Malaysian detective the 1987 deed of the Jugra Trust (which owns the top of Sinar Holdings) and its letter of wishes at 7 AM on Friday. His granddaughter and partner Clarissa Seah, who runs the trust\'s administration and had been told by the Office of the Chairman "The trustee first. Then the letter.", drugged his tea, came in by the back door at 5:50, rang Gary Raju of Tuas SecureShred (a Sinar Cold Chain company) and sent the disused 1961 file lift up to his bolted room, where its hatch is behind the bookcase. Gary rode up, brought the sleeping old man down, put him in shredding bin 7 and took him out with the Friday collection at 6:04 to a cold store at Tuas. The door stayed bolted. Clarissa burned the letter of wishes and kept the deed.',
        points: [
          { id: 'who', label: 'Who took him', criterion: 'Clarissa Seah (the granddaughter / partner) and Gary Raju (the shredding company / Tuas supervisor) took Arthur. Both must be named; it must not blame Lucas or the guard.', keywords: [['clarissa', 'granddaughter'], ['gary', 'raju', 'ganesan', 'shredding', 'tuas', 'tss']], hint: 'Whose card opened the back door at 5:50, and whose sweat is on the handrail?' },
          { id: 'how', label: 'How he left the bolted room', criterion: 'He was taken down the old file lift (whose hatch is behind the bookcase) and then out in a shredding bin with the Friday collection at 6:04, so the door stayed bolted.', keywords: [['lift', 'dumbwaiter', 'hatch'], ['bin', 'shred', 'collection', 'truck']], hint: 'What drew current for four minutes at 5:52, and what weighed seventy-nine kilos?' },
          { id: 'why', label: 'Why', criterion: 'To stop him showing the detective the 1987 deed and the letter of wishes, on the Office of the Chairman\'s order ("The trustee first. Then the letter.") or to protect the trust.', keywords: [['deed', 'letter', 'trust', 'chairman', 'office', 'trustee first', 'show', 'meeting', 'detective']], hint: 'What did the reply in her shredder say?' },
          { id: 'letter', label: 'The letter', criterion: 'Clarissa burned the letter of wishes (in the brass bowl); only a corner survived.', keywords: [['burn', 'burnt', 'ash', 'bowl', 'fire', 'destroy'], ['letter', 'wishes', 'corner', 'drives me last']], hint: 'What was in the brass bowl on her desk?' },
        ],
        need: 3,
        clue: 'Teo taps the sheet. "Three I can take to a magistrate. Four, and I buy you lunch. Not kaya toast. Real lunch."',
      },
      evidence: {
        img: 'ev_c10_report', hotspot: { x: 0.55, y: 0.45, r: 0.13 },
        title: 'One route, once',
        short: 'Teo reads your sheet twice and writes two names on her own. Then she stops, with her pen over the line for the warrant. "One route," she says. "One magistrate, one search, today. Sinar\'s lawyer is already in the building. Tell me which way he went."',
        text: 'ASP Teo Wei Ling reads it the way a Singapore officer reads anything from a foreigner, looking for the word that will embarrass her in front of a magistrate, and does not find it. She writes two names on her own sheet. Then she stops, and taps the pen on the line below them, where the warrant application wants one place and one reason. "In Singapore we do it properly," she says. "One application, one magistrate, one search. If I search the wrong place, the right place is gone by the time I ask again, because the lawyer from Sinar Cold Chain is already downstairs asking for coffee." Farah, beside her, says nothing at all, which is how you know what she thinks. Teo caps her pen. "So. Bolt, bars, wall, or the box that was dead since 1998. You tell me. I write."',
      },
    },
    {
      id: 'c10_22', phase: 'Cantonment', title: 'The granddaughter',
      game: 'interrogation', variant: 'classic',
      brief: 'Clarissa Seah sits in interview room 6 in her grey suit and her pearls, with her hands folded on a legal pad she has not written on, and calls you "the Malaysian" as if it were your rank. She has not asked once whether her grandfather is alive. One thing she tells you is not true. Find it, and put the exhibit that breaks it on the table.',
      params: {
        setting: 'Interview room 6, Police Cantonment Complex, Outram. Friday, 1:10 PM.',
        suspect: {
          id: 'clarissa', voice: 'voice_4', name: 'Clarissa Seah', role: 'Partner, Seah & Seah; Arthur Seah\'s granddaughter, 41',
          persona: 'Composed, precise Singaporean Chinese lawyer in her early forties, convent-school English with every consonant in place, never Singlish except one "lah" if she is truly cornered. Calls her grandfather "Ah Kong", the detective "the Malaysian", ASP Teo "Inspector" (deliberately one rank low) and her uncle Lucas "Uncle", with contempt. Answers questions as if drafting a reply to a letter before action. Touches her pearl earring when a question lands. Believes the trust is the family, and that whoever "drives him last" would take it from the trustees. Breaks, if she breaks, not over the old man but over the letter.',
        },
        facts: [
          { id: 'f1', topic: 'the firm', claim: 'Seah & Seah has been on Telok Ayer Street since 1928. My great-grandfather\'s portrait is in the boardroom. We have never lost a file.' },
          { id: 'f2', topic: 'the trust', claim: 'I administer the Jugra Trust. It is the firm\'s largest client. It is confidential, and it will remain so.' },
          { id: 'f3', topic: 'Ah Kong', claim: 'Ah Kong is eighty-two. He has bolted that door every night since 1994. He has chrysanthemum tea at half past ten. I take it up.' },
          { id: 'f4', topic: 'the Malaysian', claim: 'He wrote to you without telling the partners. That is not how this firm deals with clients\' papers.' },
          { id: 'f5', topic: 'Uncle Lucas', claim: 'Uncle Lucas owes money to people who do not send letters. Ah Kong stopped his allowance in October. Ask him where he was.' },
          { id: 'f6', topic: 'the tea', claim: 'I sleep badly. My doctor gives me something for it. I have nothing to say about my prescriptions.' },
          { id: 'f7', topic: 'Tuas', claim: 'Tuas SecureShred has collected our confidential waste every Friday since 2012. They are certified. Everybody uses them.' },
        ],
        lies: [
          { id: 'l1', topic: 'Friday morning', claim: 'I came in at 6:55. That was the first time I was in the building that morning.', truth: 'Her card opened the back door at 5:50; she sent the lift up at 5:52 and came in again by the front at 6:55.', exposedBy: 'e1' },
          { id: 'l2', topic: 'the file lift', claim: 'The file lift has not worked since 1998. Ask anybody.', truth: 'Tuas SecureShred\'s men rewired it in December, paid as "archive works"; it drew current for four minutes at 5:52.', exposedBy: 'e2' },
          { id: 'l3', topic: 'the letter', claim: 'Ah Kong burned his own letter years ago. He told me so. There is nothing to find.', truth: 'She burned the letter of wishes in the brass bowl on her desk on Friday morning; one corner survived.', exposedBy: 'e3' },
          { id: 'l4', topic: 'the ledger', claim: 'The firm has never paid Tuas a cent more than its invoice. Look at the ledger.', truth: 'She approved S$80,000 to Tuas SecureShred on Thursday and changed the ledger at 06:12 on Friday.', exposedBy: 'e4' },
        ],
        evidence: [
          { id: 'e1', title: 'In at 5:50', text: 'The back door\'s reader: card C. SEAH, entry, 05:50. The front door: card C. SEAH, 06:55, "first arrival".' },
          { id: 'e2', title: 'The file lift works', text: 'New cable in the 1961 duct, fresh grease, a new contactor. The building meter: circuit 7, FILE LIFT (DISUSED), four minutes at 05:52.' },
          { id: 'e3', title: 'Ashes and one corner', text: 'In the brass bowl on her desk: ash from heavy cream paper, and one corner in a left hand: "...drives me last."' },
          { id: 'e4', title: 'Eighty thousand to Tuas', text: 'Mrs. Pang\'s Thursday printout: S$80,000 to Tuas SecureShred, 14 January, approved C.S. The terminal: changed at 06:12 Friday, login C. SEAH.' },
          { id: 'e5', title: 'The trustee first', text: 'From her shredder: "The trustee first. Then the letter. Tuas will collect on Friday as usual. Nothing on the phones."' },
          { id: 'e6', title: 'Bin seven. Hold it.', text: 'The partners\' line, 05:52 Friday, to Ganesan Raju\'s mobile: a woman\'s voice. "Bin seven. Hold it."' },
        ],
        secret: 'On the Office of the Chairman\'s printed order she crushed two of her own temazepam into his tea at 22:28, came in by the back door at 5:50, rang Gary Raju and sent the file lift up behind the bookcase; she burned the letter of wishes because whoever "drives him last" would take the trust away from the trustees, and kept the deed; she has never seen the man who sends the orders, whose letters come by courier from Johor, and her grandfather saw him once.',
        suggested: [
          'When did you arrive on Friday?',
          'Does the file lift work?',
          'What happened to the letter of wishes?',
          'What did the firm pay Tuas?',
          'What was in your grandfather\'s tea?',
          'Who told you to do this?',
          'Is your grandfather alive?',
        ],
        maxQuestions: 14,
        clue: 'Farah, very quietly, from the corner: "She has not asked once where he is. Ask her why not."',
      },
      evidence: {
        img: 'ev_c10_pearls', hotspot: { x: 0.50, y: 0.65, r: 0.12 },
        title: 'The trustee first',
        short: 'Caught in one lie, Clarissa Seah does not ask for her lawyer. She explains, as if to a client. The letter would have given the trust to "whoever drives him last", away from the trustees, so she burned it. She has never seen him; the Office\'s letters come by courier from Johor. "Ah Kong saw him once. He said he had a face you forget while you are looking at it."',
        text: 'She takes off one pearl earring and puts it on the legal pad, and then she explains it to you, slowly, as if you were a client who had misunderstood a bill. The Jugra Trust is the firm. It is forty years of the firm. The letter of wishes, as amended in 2016 in his own hand, would give the direction of the trust on his death to "whoever drives me last", which is not a legal sentence, and which a court in some years\' time might nevertheless have to read, and then the trust would go to a driver, out of the trustees\' hands, out of the family\'s. "So yes. I burned it. It was a bad sentence and I am a good lawyer." The tea, the lift, the bin, she will not discuss. "The trustee first. Then the letter. I did them in the order I was told." She has never seen him. Nobody in the firm has, except one. The Office\'s letters come by courier from the Johor side, on a motorcycle, always at night. "Ah Kong saw him once," she says. "In 1987. He said he had a face you forget while you are looking at it." Then she asks, for the first time, whether her grandfather is alive.',
      },
    },
  ],

  outcomes: {
    charged: {
      clarissa: { en: 'Clarissa Seah is arrested in the firm\'s boardroom under her great-grandfather\'s portrait, and asks for a Singapore lawyer who has never acted for Sinar. There is not one in the Law Society\'s directory.' },
      gary: { en: 'Gary Raju is charged at Cantonment on Sunday morning, still in the overalls he ran in on Friday. He asks whether the old man was cold.' },
      lucas: { en: 'Lucas Seah is charged. He asks the magistrate to tell his father he is sorry, and the magistrate does not know where to send it.' },
      rajendran: { en: 'R. Rajendran is charged. His firm takes his uniform back the same afternoon.' },
    },
    correct: ['clarissa', 'gary'],
  },

  // Hidden consequences, for later cases. CLARISSA_FREE / GARY_FREE: not charged. LUCAS_WRONGED /
  // RAJENDRAN_WRONGED: charged with an abduction they did not commit. ARTHUR_FOUND / ARTHUR_LOST: whether Teo
  // searched the file lift and the Tuas bale room, and so whether Arthur Seah is alive and has recited the
  // letter of wishes (Case 11 makes his affidavit Exhibit P9; Case 12 reads it for who knew the clause).
  flagNames: ['CLARISSA_FREE', 'GARY_FREE', 'LUCAS_WRONGED', 'RAJENDRAN_WRONGED', 'ARTHUR_FOUND', 'ARTHUR_LOST'],
  flags: ({ charged, answers }) => ({
    CLARISSA_FREE: !charged.includes('clarissa'),
    GARY_FREE: !charged.includes('gary'),
    LUCAS_WRONGED: charged.includes('lucas'),
    RAJENDRAN_WRONGED: charged.includes('rajendran'),
    ARTHUR_FOUND: answers.method === 'lift',
    ARTHUR_LOST: answers.method !== 'lift',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  // Earlier cases' flags use `when` (the voice manifest walks every line).
  ending(v) {
    const both = v.has('clarissa') && v.has('gary');
    const wronged = v.has('lucas') || v.has('rajendran');
    const found = v.answers.method === 'lift';

    const arrests = v.charged.map((id) => ({ who: null, en: CASE10.outcomes.charged[id].en }));
    if (!v.charged.length) arrests.push({ who: null, en: 'ASP Teo files the case as a missing person, signs it, and goes home to sleep for the first time since Thursday. Nobody is charged with anything.' });
    let teoLine;
    if (both && !wronged) teoLine = 'Two names, one route, one old man. In Singapore we call that a good week.';
    else if (both) teoLine = 'You gave me the two who did it, and one more who did not. Here the court reads the whole file, ah. It will notice.';
    else if (v.has('gary')) teoLine = 'The man who rode the lift is in my cells. The woman who sent it up is still signing letters on Telok Ayer Street.';
    else if (v.has('clarissa')) teoLine = 'The granddaughter is in my cells. The man who carried him down is back at work in Tuas on Monday, weighing paper.';
    else teoLine = 'Whoever took him, I am not holding them. My superintendent says thank you for your courtesy visit.';
    arrests.push({ who: 'ASP Teo Wei Ling', en: teoLine });

    const arthur = [];
    if (found) {
      arthur.push({ who: null, en: 'Teo\'s team opens door 4 at Tuas at two o\'clock on Friday afternoon. Behind it, among the paper bales, in a shredding bin wrapped in empty shred sacks, Arthur Seah is alive and very cold, and asks for his hearing aid.' });
      arthur.push({ who: null, en: 'On Saturday, under three blankets, his hearing aid back in, he asks for his spectacles before he will speak, and then for the Malaysian. He recites the letter of wishes from memory, every word, and stops at the last line as if it were the end of a hymn.' });
      arthur.push({ who: 'Arthur Seah', en: 'On my death the Trust is to be directed by whoever drives me last.' });
      arthur.push({ who: 'Arthur Seah', en: 'I told him that is not a legal sentence. He said, it will be, Arthur, when I am dead.' });
      arthur.push({ who: 'Arthur Seah', en: 'The first of December, 1987. The Johor waterfront, at dusk. A black car, and his driver standing outside it with his back to us the whole time.' });
      arthur.push({ who: 'Arthur Seah', en: 'Younger than me and older than he looked. A face you forget while you are looking at it. He signed with his left hand.' });
      arthur.push({ who: 'Arthur Seah', en: 'I do not cross water, he said. So I crossed it, with my pen and my stamp. I have been crossing it for him for forty years.' });
    } else {
      const wrongRoute = {
        door: 'Teo\'s team spends the afternoon on the bolt with a locksmith from Jurong and three magnets. From outside, whatever they do, the bolt does not move.',
        window: 'The fire service takes the bars off the oldest window on Telok Ayer Street in front of a television crew. Under the paint the bolts have rusted into the frame since 1946.',
        wall: 'Teo\'s men take down the archive shelving and open the party wall into No. 216. Behind the brick is more brick, and a hundred years of dust.',
      }[v.answers.method] || 'Nobody tells Teo which way he went, and she searches nothing.';
      arthur.push({ who: null, en: wrongRoute });
      arthur.push({ who: null, en: 'By the time Teo\'s team reaches Tuas the bale room is empty and cold. The plant\'s log has forty minutes missing, from eleven o\'clock to twenty to twelve. Arthur Seah is not found.' });
      arthur.push({ who: null, en: 'Only the corner survives, in an evidence bag at Cantonment, with the end of one line on it in a left hand: "...drives me last."' });
      arthur.push({ who: 'Inspector Farah Iskandar', en: 'He wanted to be untidy once. He wanted to put it all out on the table. They took the table.' });
    }

    const hill = [
      { who: null, en: 'On Saturday the 1987 deed goes into the custody of the High Court of Singapore in a grey archive box, and a certified copy goes north to Hamidah Yusof by courier, across the water, the way its maker never would.' },
      { who: 'Inspector Farah Iskandar', en: 'Muthu\'s name on the deed, and not one stroke of it his. Hamidah says that is a forgery in two countries. She says she will need both of them.' },
      { who: null, en: 'On Monday Clarissa Seah is still the trustee of the Jugra Trust. The brass plate on Telok Ayer Street is polished at eight, as usual.', when: (f) => f.CLARISSA_FREE },
      { who: null, en: 'The Law Society appoints an interim trustee for the Jugra Trust on Monday morning. By Monday afternoon Sinar\'s lawyers have written to object.', when: (f) => !f.CLARISSA_FREE },
      { who: null, en: 'At your hotel a card in copperplate is waiting, with no stamp: "He will be sorry about the old man."', when: (f) => f.VIVIAN_FREE },
      { who: null, en: 'A letter from the Office of the Chairman reaches Seah & Seah by hand on Monday, asking after Mr. Arthur\'s health. It is initialled M.O.', when: (f) => !f.VIVIAN_FREE && f.MELISSA_FREE },
      { who: 'ASP Teo Wei Ling', en: 'One more thing. The trust\'s investment committee has three members. One is a Sri Lankan lady, very elegant, who flies in from Colombo every quarter. Somebody you know, I think.', when: (f) => f.SHEHANI_FREE },
      { who: null, en: 'Bin 7\'s empty frame crossed back into Johor on Saturday, on a Sinar Cold Chain flatbed. Officer: N. SALLEH.', when: (f) => f.NORHAYATI_FREE },
    ];

    const phone = [
      { who: null, en: 'Daniel rings the hotel on Sunday night, from the agency, with the radio on behind him and a teh going cold.' },
      { who: 'Daniel Raj', en: found ? 'Machan. They found the old man? Then fold him a kancil from me. A man who keeps a paper forty years has earned one.' : 'Machan. Still nothing? Then keep looking. Old men are harder to lose than people think.' },
      { who: 'Daniel Raj', en: 'Hamidah says my charge is a door that is not locked. So I stay on this side of it.', when: DNAA },
      { who: null, en: 'Since December he does not sleep anywhere he cannot see the door, and he has started leaving the radio on all night.', when: WAS_HELD },
      { who: null, en: 'Then the line clicks, and a call from Colombo cuts in on top of him.', when: (f) => f.KAMAL_FREE || f.TONY_FREE },
      { who: 'Inspector Ruwan Herath', orig: 'Ayubowan.', en: 'Long life to you.', when: (f) => f.KAMAL_FREE || f.TONY_FREE },
      { who: 'Inspector Ruwan Herath', en: 'Your fire officer and your depot manager send their regards from my side of the water. I thought you would like to know they are both still here.', when: (f) => f.KAMAL_FREE && f.TONY_FREE },
      { who: 'Inspector Ruwan Herath', en: 'Your fire officer sends his regards from my side of the water. I thought you would like to know he is still here.', when: (f) => f.KAMAL_FREE && !f.TONY_FREE },
      { who: 'Inspector Ruwan Herath', en: 'Your depot manager sends his regards from my side of the water. I thought you would like to know he is still here.', when: (f) => f.TONY_FREE && !f.KAMAL_FREE },
    ];

    return [
      { img: 'c10_out_01_cantonment', mood: 'police', fx: ['rain'], place: 'Police Cantonment Complex, Outram. Sunday, 6:00 AM.', music: 'resolution', lines: arrests },
      found
        ? { img: 'c10_out_02_ward', mood: 'day', fx: [], place: 'Singapore General Hospital. Saturday.', music: 'memory', lines: arthur }
        : { img: 'c10_out_02_coldroom', mood: 'night', fx: ['dust'], place: 'Tuas. Friday, evening.', music: 'memory', lines: arthur },
      { img: 'c10_out_03_hill', mood: 'day', fx: [], place: 'Ann Siang Hill. Monday morning.', lines: hill },
      { img: 'c10_out_04_window', mood: 'night', fx: ['rain'], place: 'Club Street. Sunday, 11:00 PM.', lines: phone },
      {
        img: 'c10_out_05_telephone', mood: 'night', fx: [], place: 'Club Street, Singapore. Monday, 2:10 AM.', music: 'chairman',
        lines: [
          { who: null, en: 'At ten past two the telephone beside the bed rings. Nobody at the desk downstairs put the call through.' },
          { who: 'The Chairman', en: 'You crossed the water for me, detective. I never have. Thank you.' },
          { who: null, en: 'A lid snaps open on the line, and shut. Then the dialling tone, and the hum of the city, and your own heart.' },
        ],
      },
    ];
  },
};
