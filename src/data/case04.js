// CASE 4: SEA STREET. Pettah, Slave Island and the port, Colombo, Sri Lanka.
// Truth (writers only): HOMICIDE BY DROWNING. Ponnambalam Yogeswaran ("Yogi"), 63, gem cutter and valuer
// at 112 Sea Street, Colombo 11, certified heat-treated geuda rough as "natural, unheated" for Sinar Gems
// Lanka (Pvt) Ltd, Port City Colombo, for six years: 61 certificates. Cash from Malaysia came in by
// undiyal, bought cheap rough in Ratnapura; the stones went out in the compressor housings of Sinar Cold
// Chain reefer units and Sinar companies in Singapore "bought" them by wire, so dirty ringgit came back as
// clean dollars (that is "what he had done"). The same reefer units passed through Port Klang in 2021:
// unit RU-11 is the one Ong Wei Jie opened in Bay 3 before the fire.
// Three weeks ago a Malaysian calling himself K. Rajan (Room 14, New Sea View Lodge, Kotahena) found Yogi,
// and Yogi agreed to stop. On Tuesday he refused Lot 112 in writing ("NO MORE"), phoned the lodge at 8:52 PM
// ("eleven, at Saldin's"), left his carbon book of certificates in the left-luggage office at Colombo Fort
// station at 9:31 PM (ticket 0414, which he put in his sock), and went back to Sea Street to wait.
// Shehani Gunasekera, 44, MD of Sinar Gems Lanka, had his shop line tapped (a GSM relay whose SIM is in
// Sinar Gems' name). She heard the 8:52 call, had an email from the "Office of the Chairman" at 9:14 ("The
// valuer first. Then the book."), phoned Kasun, slipped out of a charity dinner at the Galle Face Hotel by
// the service door at 10:38 and listened from the Port City office until 11:50. She paid Kasun 5 lakhs.
// Kasun Ranaweera, 36, Sinar Cold Chain Lanka driver and "security" at the Bloemendhal depot, ex-Ports
// Authority diver (dismissed 2019, prints on file), collected Yogi at 10:15 PM in the depot van ("Mr. Rajan
// sent me, aiya"), GPS unplugged, and held him under at the Beira Lake bank below the Seema Malaka footbridge
// at 11:24 PM. The satchel was empty. "Late, thambi. You are late."
// Mohan Yogeswaran (younger brother, partner, signed some certificates too, in debt, wants to sell to Sinar)
// is innocent of the murder: he was at the Mount Lavinia Hotel bar selling three stones from the shop safe
// behind his brother's back, and he shredded the shop's files on Wednesday morning out of fear.
// K. Rajan is innocent: he waited at Uncle Saldin's tea shop, Malay Street, from 10:45 to 11:31, went towards
// the shouting, waded in, found nothing, came back at 12:15 wet to the knees, paid, and vanished at 6 AM.
// Seeds only (never confirm here): K. Rajan is Daniel Raj. His passport was issued to a man who died in
// August 2021. He turns a silver lighter over and never lights it. "Machan." The Chairman is never named;
// the email header reads Level 14, Menara Sinar, Kuala Lumpur, and the lifts there go from 13 to 15.
//
// Evidence hotspots were placed by eye on the generated ev_c4_* art (docs/image_prompts.md, Case 4).

const BOOK = [
  { id: 'safe', label: 'The safe at 112 Sea Street', note: 'Yogi\'s own safe, behind the cutting bench. Mohan has the second key.' },
  { id: 'fort', label: 'Left luggage, Colombo Fort station', note: 'Ten minutes from Sea Street by tuk-tuk. Ninety rupees a day, and nobody looks inside.' },
  { id: 'saldin', label: 'Under Uncle Saldin\'s counter, Slave Island', note: 'Where Yogi was going, and where the Malaysian waited for him.' },
  { id: 'lake', label: 'In Beira Lake, with him', note: 'The satchel was empty when CID pulled it out of the reeds.' },
];

export const CASE04 = {
  id: 'case04',
  number: 4,
  title: 'Sea Street',
  place: 'Pettah, Colombo, Sri Lanka',
  victim: 'Ponnambalam Yogeswaran, 63, gem cutter and valuer. Found in Beira Lake at 5:40 AM on Wednesday.',
  question: 'Who drowned Ponnambalam Yogeswaran?',
  brief: 'Yogi Yogeswaran cut and valued stones at 112 Sea Street for thirty-eight years. On Wednesday morning a swan-boat man found him in Beira Lake, under the footbridge to Seema Malaka. Slave Island police say he drank and slipped. His daughter Tharshini says he never drank, and could not swim, so he never went near the water after dark. You have an uncut sapphire in your pocket, wrapped in his gem paper.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end of this one: who drowned Yogi, and where he put the book he was carrying. Nobody will tell you if you get either of them right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Tharshini sent a photo of her father\'s loupe on the cutting bench, beside a cup of tea nobody drank.',
  deduction: {
    lede: 'Colombo CID will arrest whoever you name, on your word and Inspector Herath\'s signature. Name everyone who planned Yogi\'s death or carried it out, and only them.',
    button: 'Tell Herath',
    confirm: 'CID will arrest {names}. Tharshini will hear it from you, at the shop, tonight.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Herath',
    questions: [
      {
        id: 'book', q: 'Where is Yogi\'s carbon book?', short: 'CID searches',
        lede: 'Yogi left Sea Street with a book and reached the lake with an empty satchel. Herath can get one warrant before Sinar\'s lawyers wake up. Whatever he searches, Port City will hear about it by lunch.',
        options: BOOK,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy
  // in cases.js). Until it is solved they are not on the map, the board or the office wall.
  suspects: [
    {
      id: 'shehani', name: 'Shehani Gunasekera', role: 'Managing director, Sinar Gems Lanka. 44', img: 'sus_shehani',
      revealedBy: 'c4_01',
      revealLine: 'She asked Yogi to certify forty heated stones as natural. He wrote NO MORE across her letter.',
      look: { skin: '#b97f55', hair: 'short', hairColor: '#151210', coat: 'blazer', eyewear: 'none', mark: 'none' },
      motive: 'Sinar Gems Lanka was Yogi\'s biggest client: sixty-one certificates in six years. On Tuesday he refused the sixty-second.',
      claim: 'Says she was at a charity dinner at the Galle Face Hotel from eight until after midnight, in front of two hundred people.',
    },
    {
      id: 'mohan', name: 'Mohan Yogeswaran', role: 'Yogi\'s younger brother and partner. 58', img: 'sus_mohan',
      revealedBy: 'c4_02',
      revealLine: 'He wrote over one figure in his brother\'s day book. Three stones left the safe last week, and nobody sold them.',
      look: { skin: '#8d5a3a', hair: 'shaved', hairColor: '#9a9a9a', coat: 'batik', eyewear: 'square', mark: 'moustache' },
      motive: 'Owes Rs 4 million to a lender in Wellawatte. Sinar has offered to buy his half of the gem house, and wanted his brother\'s half too.',
      claim: 'Says he was at home in Wellawatte all Tuesday evening, asleep by ten, and heard the news from the police.',
    },
    {
      id: 'rajan', name: 'K. Rajan', role: 'Malaysian guest, Room 14, Kotahena. Age not given', img: 'sus_rajan',
      revealedBy: 'c4_04',
      revealLine: 'The man Yogi was going to meet: a Malaysian in Room 14, paid in cash, gone at six the next morning.',
      look: { skin: '#8d5a3a', hair: 'short', hairColor: '#151210', coat: 'trench', eyewear: 'none', mark: 'stubble' },
      motive: 'None known. Nobody in Colombo knows who he is or what he wanted with Yogi.',
      claim: 'Nobody has asked him. He checked out of the lodge at 6 AM on Wednesday and has not been seen since.',
    },
    {
      id: 'kasun', name: 'Kasun Ranaweera', role: 'Driver and security, Sinar Cold Chain Lanka. 36', img: 'sus_kasun',
      revealedBy: 'c4_09',
      revealLine: 'His thumb is on Yogi\'s spectacles. He used to dive for the Ports Authority, until they caught him stealing cargo.',
      look: { skin: '#8d5a3a', hair: 'short', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'scar' },
      motive: 'None known. Rs 95,000 a month to drive the depot van and watch the gate.',
      claim: 'Says he locked the Bloemendhal depot at ten on Tuesday and went home to Wattala, and that the van never left the yard.',
    },
  ],

  opening: [
    {
      img: 'c4_intro_01_parcel', mood: 'warm', fx: ['rain', 'dust'], place: 'Brickfields. Sunday, 10:40 PM.', music: 'office',
      lines: [
        { who: 'Bala Anne', orig: 'Thambi, unakku oru parcel vandhirukku. Colombo-la irundhu.', en: 'Boy, a parcel came for you. From Colombo.' },
        { who: 'Bala Anne', en: 'No name on the back. I kept it under the till for three days. It felt too small to be anything good.' },
        { who: null, en: 'On the television over the counter, the verdict in Dr. Shanti Menon\'s trial is due on Friday. Bala Anne turns the sound down without being asked.', when: (f) => f.SHANTI_WRONGED },
        { who: 'Bala Anne', en: 'That durian man Ravi came again. He asked if you were well. I told him you are never well.', when: (f) => f.RAVI_WRONGED },
        { who: null, en: 'A message from Jo Lim, the first since Penang: Kenny\'s trial is set for March. Nothing else.', when: (f) => f.KENNY_WRONGED },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c4_intro_02_stone', mood: 'night', fx: ['dust'], place: 'Upstairs.',
      lines: [
        { who: null, en: 'Inside, in a fold of white gem paper: one uncut blue sapphire, the size of a fingertip. Rough and cloudy, and blue all the way down.' },
        { who: null, en: 'Around it, a mamak receipt folded into a kancil. You know the paper before you open it. Restoran Bala, Brickfields. Two teh tarik, table 6, by the stairs. August 2021, the week before the fire.' },
        { who: null, en: 'On the gem paper, a rubber stamp in Tamil and English. Yogeswaran Gem House, 112 Sea Street, Colombo 11. A telephone number.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.16, 0, 1] },
    },
    {
      img: 'c4_intro_03_call', mood: 'night', fx: ['rain'], sfx: 'buzz',
      lines: [
        { who: 'Woman', orig: 'Appa poyittaar.', en: 'My father is gone.' },
        { who: 'Woman', en: 'Sorry. You are calling from Malaysia? I am Tharshini. Yogeswaran is my father. Was my father.' },
        { who: 'Tharshini Yogeswaran', en: 'They found him in Beira Lake this morning. The police say he drank arrack and fell in.' },
        { who: 'Tharshini Yogeswaran', en: 'Appa did not drink. And he could not swim, so he never went near the water after dark. Never.' },
        { who: 'You', en: 'Did he ever talk about a Malaysian?' },
        { who: 'Tharshini Yogeswaran', en: 'Last week. He said a Malaysian had come to help him undo what he had done. He said it like a prayer.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.1, 0, 0] },
    },
    {
      img: 'c4_intro_04_tuktuk', mood: 'night', fx: ['rain'], place: 'Galle Road, Colombo. Tuesday, 6:15 PM.', music: 'tension',
      lines: [
        { who: null, en: 'The monsoon got to Colombo before you did. It comes off the Indian Ocean in sheets, and the tuk-tuk takes it side-on.' },
        { who: null, en: 'At Katunayake, among the drivers holding names at arrivals, one card says only J. The man holding it is looking at you. When you look back, he folds it in half and walks away.', when: (f) => f.JASON_FREE },
        { who: 'Tuk-tuk driver', orig: 'Malli, koheda yanne?', en: 'Where to, little brother?' },
        { who: 'You', en: 'Sea Street. Pettah.' },
        { who: 'Tuk-tuk driver', en: 'Sea Street! Gold street. Rain is no problem, sir. In Colombo the rain is free.' },
      ],
      kb: { from: [1.0, -3, 0], to: [1.08, 3, 0] },
    },
    {
      img: 'c4_intro_05_seastreet', mood: 'day', fx: ['rain'], place: '112 Sea Street, Colombo 11.',
      lines: [
        { who: null, en: 'Sea Street smells of jasmine, diesel and hot oil. Every shopfront is a lit glass counter full of gold, and every shopkeeper is watching the one in the middle, where the shutter is half down and a white cloth is tied over the door.' },
        { who: null, en: 'Round the corner a kottu stall chops roti on the griddle, two steel blades going like a train over points. It does not stop for the rain. It does not stop for anything.' },
      ],
      kb: { from: [1.0, 2, 0], to: [1.12, -2, 0] },
    },
    {
      img: 'c4_intro_06_tharshini', mood: 'day', fx: [],
      lines: [
        { who: 'Tharshini Yogeswaran', en: 'He sat at that bench for thirty-eight years. He could tell you where a stone was born just by holding it to the window.' },
        { who: 'Tharshini Yogeswaran', en: 'Six years ago he started coming home late, and quiet. Last month he started sleeping again. Then this.' },
        { who: null, en: 'His loupe hangs on a cord around her neck. She has not taken it off since the morning they found him.' },
      ],
      kb: { from: [1.08, 1, 0], to: [1.0, -1, 0] },
    },
    {
      img: 'c4_intro_07_herath', mood: 'police', fx: ['rain'], place: 'Beira Lake, Slave Island.',
      lines: [
        { who: 'Inspector Ruwan Herath', en: 'Inspector Iskandar telephoned me. She said you would come whether I liked it or not.' },
        { who: 'Inspector Ruwan Herath', en: 'The file at Slave Island station says an old man drank and slipped. I have asked for it. They were surprised anybody wanted it.' },
        { who: 'Inspector Ruwan Herath', en: 'She also asked me to check one name. A Malaysian, Tony Kwan, came on a work visa in the spring. Sinar Cold Chain Lanka. He runs their reefer depot at Bloemendhal, by the port.', when: (f) => f.TONY_FREE },
        { who: 'Inspector Ruwan Herath', en: 'And she sent a photograph from a crane driver in Port Klang. A reefer unit going into Bay 3 in 2021, serial RU-11. She thinks I will find it here.', when: (f) => f.AZMAN_ALIVE },
        { who: 'Inspector Ruwan Herath', orig: 'Hari. Api balamu.', en: 'All right. Let us see.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.1, 0, 1] },
    },
    { title: { kicker: 'Case 4', name: 'Sea Street' }, fx: ['rain'] },
  ],

  levels: [
    // ---------------- Sea Street ----------------
    {
      id: 'c4_01', phase: 'Sea Street', title: 'The shredder bin',
      game: 'shredder', variant: 'classic',
      brief: 'Yogi\'s office is a cupboard behind the cutting bench, with a desk, a safe and a cheap shredder. Tharshini says the bin was full when she came in on Wednesday, and her father emptied it every night. Somebody fed the shop\'s papers through it after he died. One sheet went in last, on top. Put it back together.',
      params: {
        title: 'SINAR GEMS LANKA (PVT) LTD',
        text: 'Level 9, Port City Colombo\n\nTo: P. Yogeswaran, Valuer\nRe: Lot 112. Rough blue\nsapphire, Ratnapura. 40 pcs.\n\nPlease certify: natural,\nunheated. USD 2,400,000.\nCourier collects Wed 9 AM.\n\nS. Gunasekera, MD\n\nNO MORE. HEATED GEUDA. - Y.',
        strips: 6,
        flips: false,
        stamp: 'URGENT',
        clue: 'The top sheet in the bin, cut into six. The last line is in Yogi\'s handwriting, pressed so hard the pen went through.',
      },
      evidence: {
        img: 'ev_c4_shredbin', hotspot: { x: 0.48, y: 0.31, r: 0.16 },
        title: 'NO MORE',
        short: 'Sinar Gems Lanka asked Yogi to certify forty rough sapphires, Lot 112, as natural and unheated: USD 2.4 million. Across the letter, in his hand: "NO MORE. HEATED GEUDA." Signed by the managing director, S. Gunasekera.',
        text: 'A letter from Sinar Gems Lanka (Pvt) Ltd, Level 9, Port City Colombo, dated Monday: forty pieces of rough blue sapphire from Ratnapura, Lot 112, to be certified "natural, unheated", value USD 2.4 million, courier to collect on Wednesday at nine. Signed S. Gunasekera, Managing Director. Across the bottom, in Yogi\'s handwriting, the pen pressed through the paper: "NO MORE. HEATED GEUDA. Y." Geuda is the milky corundum that Ratnapura sells by the kilo; put it in a furnace and it comes out blue. Tharshini reads it twice. "Appa never wrote no to anybody. Not once in his life."',
      },
    },
    {
      id: 'c4_02', phase: 'Sea Street', title: 'The day book',
      game: 'ledger', variant: 'classic',
      brief: 'Yogi kept the shop\'s day book in green ink and totalled every row and every column on Saturday, before he went home. Tharshini can read the figures but not the hands. Somebody has written over one figure since, in blue. The totals still remember what was there.',
      params: {
        rows: 4, cols: 4, altered: 1, restore: false, currency: 'LKR', magnitude: 'thousands',
        rowLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        colLabels: ['Cutting', 'Valuations', 'Sales', 'Safe out'],
        clue: 'Green ink is Yogi. Blue ink is somebody who wanted last week to look smaller.',
      },
      evidence: {
        img: 'ev_c4_daybook', hotspot: { x: 0.51, y: 0.46, r: 0.12 },
        title: 'Three stones out',
        short: 'In week 4 three stones left the safe, worth Rs 1.8 million, and the figure was written down in blue to hide it. Only two people have a key to the safe: Yogi, and his brother and partner, Mohan.',
        text: 'Week 4, "Safe out", written over in blue biro: the totals say Rs 1.8 million more went out of the safe than the cell now admits. Three cut stones, by the weights in the margin, and no sale anywhere to match them. Only two men had a key to that safe. One of them is in the mortuary at the National Hospital. The other is Mohan Yogeswaran, 58, Yogi\'s younger brother and partner, who owes Rs 4 million to a lender in Wellawatte and has an offer from Sinar for his half of the gem house. Tharshini: "Chithappa says he was asleep at home by ten. Chithappa has never been asleep by ten in his life."',
      },
    },
    {
      id: 'c4_03', phase: 'Sea Street', title: 'The cutting bench',
      game: 'hiddenobject', variant: 'list',
      brief: 'Yogi\'s bench faces the street so he could cut in daylight: a lapidary wheel, a hundred little papers of stones, tweezers, loupes, tea glasses, thirty-eight years of things put down and never picked up. Slave Island police did not come here at all. Find everything on Tharshini\'s list. The thing she does not know to look for will be there too.',
      params: { scene: 'desk', targets: 10, objects: 60 },
      evidence: {
        img: 'ev_c4_bench', hotspot: { x: 0.72, y: 0.60, r: 0.13 },
        title: 'Eleven, at Saldin\'s',
        short: 'Yogi\'s pocket diary, Tuesday: "11 PM. R. Saldin\'s, Malay Street. Bring the book." Under it, a railway timetable folded open at Colombo Fort. He never took the train anywhere.',
        text: 'Yogi\'s pocket diary, open at Tuesday, in Tamil and then again in English, as if he wanted to be sure: "11 PM. R. Saldin\'s tea shop, Malay Street. Bring the book." Tucked under the diary, a Sri Lanka Railways timetable folded open at the page for Colombo Fort. Tharshini turns it over in her hands. "He never took a train. He hated trains. He said they shake the stones." In the drawer underneath, the shelf where he kept his carbon book of certificates is empty.',
      },
    },
    {
      id: 'c4_04', phase: 'Sea Street', title: 'The last call',
      game: 'dialtone', variant: 'classic',
      brief: 'The shop telephone is old enough to have a cassette in it, and Yogi never learned to switch the recording off. The last outgoing call, Tuesday at 8:52 PM, is on the tape as ten tones and a few seconds of an old man speaking softly. The exchange will need a week to give Herath a call record. You have the tape now.',
      params: {
        digits: 10, number: '0112438614', noise: 0.15,
        clue: 'Colombo numbers start 011. Yogi dialled slowly, the way men do who learned on a rotary phone.',
      },
      evidence: {
        img: 'ev_c4_lodge', hotspot: { x: 0.32, y: 0.66, r: 0.13 },
        title: 'Room 14',
        short: 'Yogi called the New Sea View Lodge in Kotahena: "Tell Mr. Rajan: eleven, at Saldin\'s." K. Rajan, Malaysian passport, Room 14, paid three weeks in cash. He checked out at six the next morning.',
        text: 'The number is the New Sea View Lodge, Kotahena, a staircase above a hardware shop four streets from the harbour. The night clerk remembers the call: "An old Tamil gentleman. Very polite. He said, tell Mr. Rajan, eleven o\'clock, at Saldin\'s." The register: K. RAJAN, Malaysian passport, Room 14, three weeks paid in advance in cash. He checked out at 6:05 AM on Wednesday, an hour before anybody found Yogi, and left the key on the desk. The passport photocopy clipped to the page is too dark to show a face. The clerk says he was tall, and polite, and tipped like a man who did not expect to come back.',
      },
    },
    {
      id: 'c4_05', phase: 'Sea Street', title: 'The spectroscope',
      game: 'mirrors', variant: 'classic',
      brief: 'Tharshini knows her father\'s instruments by name, not by use. His handheld spectroscope sits on a little optical bench: a fibre lamp at one end, the eyepiece at the other, and the stone has to sit in the light between them. The beam goes where the little mirrors send it. Send it through the sapphire from your parcel.',
      params: {
        size: 6, mirrors: 3, relays: 0, obstacles: 4,
        clue: 'The lamp, the stone, the eyepiece. Yogi set the mirrors by eye every morning with his tea in the other hand.',
      },
      evidence: {
        img: 'ev_c4_spectro', hotspot: { x: 0.50, y: 0.47, r: 0.08 },
        title: 'Heated, and certified unheated',
        short: 'Your sapphire is heated geuda: the silk inside it has melted into dots, the way it does in a furnace. Yogi certified this stone himself eight months ago as Lot 97-07, "natural, unheated", USD 64,000. It is worth about 1,500.',
        text: 'Under the lamp the stone is alive, and wrong. The fine needles of rutile that every unheated Ceylon sapphire carries, the silk, have melted into rows of tiny dots, the way they do at sixteen hundred degrees. Tharshini finds the matching certificate in her father\'s files by its weight, 11.2 carats: Lot 97, stone 7, "natural, unheated, origin Ratnapura", valued at USD 64,000. Exported by Sinar Gems Lanka eight months ago. A heated geuda stone that size sells in Ratnapura for about 1,500. The signature on the certificate is Yogi\'s. Somebody kept one stone back, and sent it to you, so that you would know what he had signed.',
      },
    },
    {
      id: 'c4_06', phase: 'Sea Street', title: 'The third handset',
      game: 'wiretap', variant: 'classic',
      brief: 'Behind 112 Sea Street the telephone pairs for four shops run through one grey junction box on the back wall, and the box has been opened more recently than the paint. Tharshini remembers a phone repairman a month ago who fixed nothing. Rotate the wiring back into a working circuit and see where the shop\'s line really goes: two handsets should ring.',
      params: {
        size: 5, targets: 2,
        clue: 'Two handsets: the shop counter and Yogi\'s desk. If a third thing lights up, it was never Telecom\'s.',
      },
      evidence: {
        img: 'ev_c4_tap', hotspot: { x: 0.55, y: 0.50, r: 0.12 },
        title: 'A third pair of ears',
        short: 'Spliced into the shop\'s line: a GSM relay that sends every call on to a mobile. Its SIM is registered to Sinar Gems Lanka, Port City. Whoever held that phone heard Yogi call the lodge at 8:52.',
        text: 'Taped into the shop\'s pair inside the junction box: a black GSM relay the size of a matchbox, the kind sold to parents to listen to babies. Every call on the line, in or out, rings a mobile somewhere as well, silently. The SIM card inside it is registered to Sinar Gems Lanka (Pvt) Ltd, Level 9, Port City Colombo, a company account with forty numbers on it. Herath turns it over in a handkerchief. "One month. So for one month somebody heard every word your old man said on this telephone. Including at 8:52 on Tuesday."',
      },
    },
    {
      id: 'c4_rv', phase: 'Sea Street', title: 'Side B',
      game: 'tape', variant: 'reverse',
      brief: 'Herath\'s words sit in your stomach all afternoon. Every word on that telephone, for a month. Yours too. Yogi\'s phone recorder takes a microcassette and runs at its own speed to save tape, and when side A ran out on Wednesday afternoon it flipped itself and kept recording the other way. Herath\'s deck plays one way, at one speed, so side B comes out as mush. Tharshini sits on the cutting stool with her hands in her lap. Find the direction and the speed where it turns back into a voice.',
      params: {
        line: { who: 'Tharshini Yogeswaran', en: 'Last week. He said a Malaysian had come to help him undo what he had done. He said it like a prayer.' },
        answer: 'undo what he had done',
        accept: ['undo what he did', 'undo what he done', 'undo'],
        ask: 'What had the Malaysian come to help Yogi do?',
        label: 'SHOP TELEPHONE · SIDE B · WED',
        clue: 'Side B begins on Wednesday afternoon. Only one call came in after that.',
      },
      evidence: {
        img: 'ev_c4_cassette', hotspot: { x: 0.38, y: 0.42, r: 0.20 },
        title: 'Three clicks',
        short: 'Side B holds one call: yours, from Malaysia, on Wednesday evening. Three soft clicks just after Tharshini picks up: the relay ringing its mobile, and somebody answering. Port City heard her tell you about the Malaysian.',
        text: 'Turned the right way round and brought to its proper speed, side B is Tharshini in the shop on Wednesday evening, small and tired, answering a call from Malaysia. Yours. "He said a Malaysian had come to help him undo what he had done." Just after she lifts the receiver there are three soft clicks on the line, the sound the relay in the junction box makes when it rings its mobile and somebody picks up. Whoever held that phone at Port City heard Yogi\'s daughter talk about the Malaysian, and heard you ask about him. K. Rajan had checked out of Room 14 twelve hours earlier. After Wednesday evening, the Malaysian still asking questions about Yogi was you. Tharshini stops the tape before her own voice says "prayer", and does not play it again.',
      },
    },

    // ---------------- Kompannavidiya ----------------
    {
      id: 'c4_07', phase: 'Kompannavidiya', title: 'Uncle Saldin',
      game: 'witness', variant: 'statement',
      brief: 'Saldin\'s tea shop is four tables and a glass case of patties on Malay Street, Slave Island, two hundred metres from the lake. Tuan Burhanudeen Saldin has run it for fifty years. He hears your Malaysian Malay at the door, and puts a glass of tea in front of you before you have asked for anything. He will tell it once, slowly.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Statement of Tuan Burhanudeen Saldin, 74. Saldin Tea Room, Malay Street, Slave Island. Recorded Thursday, 4:15 PM.',
        introLine: 'Uncle Saldin straightens his songkok. "One time only. After this I must make the patties."',
        retryLine: 'Uncle Saldin pours you another tea, sighs, and starts again from the beginning.',
        statement: [
          'My grandfather\'s grandfather came from Java with the Dutch, to be a soldier. We have been on this street ever since. Kita juga orang Melayu. We are Malay too, only we have been away a long time.',
          'Your Malaysian came at a quarter to eleven on Tuesday. Tall, very polite, a cap. He asked for two plain tea, one with no sugar. He sat facing the door. He said an old friend was coming, an old man with a book.',
          'At twenty past eleven there was shouting from the lake side. Here you always hear shouting at night, so I did not look. At half past eleven by my clock he put fifty rupees under the full glass and went out quickly, towards the lake.',
          'He came back at a quarter past twelve. Wet to the knees, mud on his trousers. He did not say one word. He drank the cold tea, the one he had kept for his friend. He paid for both again. Then he went.',
          'All the time he was waiting, he had a lighter in his hand. Silver, the kind with a lid. He turned it over and over. He never lit it. He did not smoke.',
        ],
        questions: [
          { q: 'When did the Malaysian arrive?', options: ['A quarter past ten', 'Half past ten', 'A quarter to eleven', 'Eleven o\'clock'], a: 2 },
          { q: 'What did he order?', options: ['Two plain tea, one with no sugar', 'Two milk tea', 'One plain tea and a patty', 'Coffee'], a: 0 },
          { q: 'Who did he say was coming?', options: ['A woman from the hotel', 'An old man with a book', 'His brother', 'Nobody'], a: 1 },
          { q: 'When was the shouting from the lake?', options: ['Eleven o\'clock', 'Twenty past eleven', 'Half past eleven', 'Midnight'], a: 1 },
          { q: 'When did he go out?', options: ['Twenty past eleven', 'Half past eleven', 'A quarter to twelve', 'A quarter past twelve'], a: 1 },
          { q: 'What did he leave under the full glass?', options: ['A note', 'His room key', 'Fifty rupees', 'A paper kancil'], a: 2 },
          { q: 'How did he come back?', options: ['Running', 'Wet to the knees, with mud on his trousers', 'With an old man', 'Bleeding'], a: 1 },
          { q: 'What did he drink when he came back?', options: ['Nothing', 'A fresh tea', 'Arrack', 'The cold tea he had kept for his friend'], a: 3 },
          { q: 'What did he hold all evening?', options: ['A book', 'A silver lighter he never lit', 'His phone', 'A cigarette'], a: 1 },
        ],
      },
      evidence: {
        img: 'ev_c4_teashop', hotspot: { x: 0.47, y: 0.57, r: 0.15 },
        title: 'Wet to the knees',
        short: 'K. Rajan waited at Saldin\'s from 10:45, went out towards the lake at 11:31, ten minutes after the shouting, and came back at 12:15 wet to the knees. He drank the tea he had kept for Yogi, paid for both and left. He turned a silver lighter over all night and never lit it.',
        text: 'The Malaysian sat facing the door from 10:45 with two glasses of plain tea, one for an old man with a book. Shouting from the lake side at about 11:20. At 11:31 by Saldin\'s clock he left fifty rupees under the full glass and went out fast, towards the water. At 12:15 he came back wet to the knees, with lake mud on his trousers, drank the cold tea he had been keeping, paid for both again and went without a word. All night he turned a silver flip-top lighter over in his fingers and never lit it. Your hand goes to your own pocket. Daniel\'s lighter is there. Of course it is.',
      },
    },
    {
      id: 'c4_08', phase: 'Kompannavidiya', title: 'Under the footbridge',
      game: 'searchlight', variant: 'classic',
      brief: 'Slave Island police pulled Yogi out by the swan-boat jetty and never looked at the bank. Herath has borrowed six police lamps and a constable who is afraid of the water. The bank under the Seema Malaka footbridge is cut up by mooring posts, chained swan boats and reeds. Light every square of it. No lamp may shine into another, or the constable will refuse to stand there.',
      params: {
        size: 7, walls: 'medium',
        clue: 'The numbered posts say how many lamps stand right beside them. A lamp shines along its row and column until something stops it.',
      },
      evidence: {
        img: 'ev_c4_spectacles', hotspot: { x: 0.41, y: 0.60, r: 0.10 },
        title: 'Twenty metres from where they found him',
        short: 'In the reeds twenty metres from the swan-boat jetty: Yogi\'s spectacles, one lens cracked, and his leather satchel, empty. Two sets of prints in the mud: his leather sandals, dragged, and a rubber deck boot, UK 10.',
        text: 'Twenty metres along the bank from where the swan-boat man found him, pressed into the reeds: Yogi\'s wire-rimmed spectacles, the right lens cracked across, and his leather satchel, flap open, empty except for three folded gem papers with nothing in them. The mud keeps two sets of prints. One is a pair of leather sandals, heels dragging, toes towards the water. The other is a ribbed rubber deck boot, UK size 10, the kind worn on boats and in cold stores, planted wide and deep. Nobody slips like that. Herath says nothing for a long time, and then he says it in Sinhala, quietly, to the constable, who writes it down.',
      },
    },
    {
      id: 'c4_09', phase: 'Kompannavidiya', title: 'A thumb on the lens',
      game: 'fingerprint', variant: 'classic',
      brief: 'The spectacles go to the CID fingerprint bureau in Colombo Fort, and Herath goes with them, and so do you. On the inside of the cracked lens, where a hand would cover a face, there is one clear thumb. Classify it, then find its owner among the people on file.',
      params: {
        liftLabel: 'Lift: right lens, inside, P. Yogeswaran\'s spectacles',
        liftAria: 'Partial thumbprint lifted from the inside of a cracked spectacle lens',
        candidates: [
          { id: 'yogi', name: 'P. Yogeswaran' },
          { id: 'tharshini', name: 'Tharshini Yogeswaran' },
          { id: 'mohan', name: 'Mohan Yogeswaran' },
          { id: 'chaminda', name: 'Chaminda Silva' },
          { id: 'saldin', name: 'Tuan B. Saldin' },
          { id: 'shehani', name: 'Shehani Gunasekera' },
          { id: 'kasun', name: 'Kasun Ranaweera' },
          { id: 'rajan', name: 'K. Rajan (lodge water glass)' },
        ],
        answer: 'kasun',
      },
      evidence: {
        img: 'ev_c4_lensprint', hotspot: { x: 0.48, y: 0.48, r: 0.16 },
        title: 'A hand over his face',
        short: 'The thumb is Kasun Ranaweera\'s: on file since the Ports Authority dismissed him from its dive team in 2019 for stealing cargo. He now drives the van and minds the gate at Sinar Cold Chain Lanka\'s depot in Bloemendhal.',
        text: 'The thumb on the inside of the lens belongs to Kasun Ranaweera, 36, of Wattala, on file since 2019, when the Sri Lanka Ports Authority dismissed him from its dive team for lifting cargo off a sunken barge. Eight years under the harbour; he can hold his breath for three minutes. He now drives the depot van and minds the gate for Sinar Cold Chain Lanka at Bloemendhal, beside the port. A thumb on the inside of a man\'s spectacles is a hand pressed over his face. The prints the lodge gave Herath, from Rajan\'s water glass, are not on the spectacles anywhere.',
      },
    },
    {
      id: 'c4_10', phase: 'Kompannavidiya', title: 'Under his nails',
      game: 'dna', variant: 'mixed',
      brief: 'The Judicial Medical Officer at the National Hospital took scrapings from under Yogi\'s fingernails because she always does, and nobody at Slave Island station asked her for them. She runs them against everyone CID can get a swab from by Friday, including the water glass from Room 14. Read the bands.',
      params: { suspects: 7 },
      evidence: {
        img: 'ev_c4_nails', hotspot: { x: 0.58, y: 0.55, r: 0.11 },
        title: 'He fought',
        short: 'The skin under Yogi\'s fingernails is Kasun Ranaweera\'s. Not Mohan\'s, not the Malaysian\'s from the lodge glass. Kasun\'s forearms are scratched; he says a reefer door did it.',
        text: 'The JMO\'s report is two pages and she has underlined one line: "Defence injuries. Tissue under nails of both hands." The tissue is Kasun Ranaweera\'s. It is not Mohan Yogeswaran\'s, and it is not the man\'s who drank from the glass in Room 14. When Herath\'s sergeant asks Kasun to roll up his sleeves at the depot gate, both forearms are scored with four long scratches, healing. Kasun says a reefer door closed on him on Monday. Yogi was sixty-three and could not swim. He fought anyway.',
      },
    },
    {
      id: 'c4_11', phase: 'Kompannavidiya', title: 'Eleven twenty-four',
      game: 'timeline', variant: 'log',
      brief: 'Herath pins the night to the corkboard in his office: a tape from a telephone, a tuk-tuk meter, a junction camera, a temple watchman, a tea-shop clock. Eight entries, out of order, some clocks smudged. Put them in the order they happened.',
      params: {
        frames: [
          { id: 'a', clock: '20:5▮', title: 'Shop telephone, 112 Sea Street', text: 'Yogi rings the New Sea View Lodge: "Tell Mr. Rajan, eleven o\'clock, at Saldin\'s." The relay in the junction box rings a Sinar Gems Lanka mobile at the same time.' },
          { id: 'b', clock: '21:1▮', title: 'Chaminda Silva\'s tuk-tuk meter', text: 'A fare starts outside 112 Sea Street, heading south towards Fort. Waiting time, ten minutes, is logged at the station.' },
          { id: 'c', clock: '22:0▮', title: 'Sinar Cold Chain gate log, Bloemendhal', text: 'Depot van WP LH-4471 out. Driver: K. Ranaweera. The van\'s GPS stops reporting one minute later.' },
          { id: 'd', clock: '22:1▮', title: 'Gold shop camera, Sea Street', text: 'A white van stops outside No. 112. The driver leans across and says something. An old man with a satchel gets in.' },
          { id: 'e', clock: '22:4▮', title: 'Saldin Tea Room', text: 'A tall man in a cap sits down facing the door and orders two plain tea.' },
          { id: 'f', clock: '23:18', title: 'Junction camera, Sir James Peiris Mawatha', text: 'A white van with no lights on turns off the road onto the lake bank by the Seema Malaka footbridge.' },
          { id: 'g', clock: '23:2▮', title: 'Seema Malaka night watchman', text: 'Shouting from the bank, then a splash, then nothing. He writes the time in his book, because he writes everything in his book.' },
          { id: 'h', clock: '23:31', title: 'Saldin\'s clock', text: 'The tall man puts fifty rupees under the full glass and goes out fast towards the lake.' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The night plays in order, and the Malaysian is sitting in a tea shop when the water closes over Yogi.',
      },
      evidence: {
        img: 'ev_c4_timeline', hotspot: { x: 0.50, y: 0.48, r: 0.20 },
        title: 'Seven minutes too late',
        short: 'Yogi went into the water at 11:24. The Malaysian was in Saldin\'s tea shop until 11:31, and only then ran to the lake. The van that collected Yogi at 10:15 left the Sinar Cold Chain depot at 10:02 with Kasun at the wheel and its GPS unplugged.',
        text: 'At 8:52 Yogi rang the lodge, and a Sinar Gems Lanka mobile heard him do it. At about 9:15 he took a tuk-tuk towards Fort and came back. At 10:02 the depot van left Bloemendhal with Kasun Ranaweera driving, and its GPS went dark a minute later. At 10:15 a white van collected an old man with a satchel outside No. 112. At 11:18 a van with no lights turned onto the lake bank; at 11:24 the temple watchman wrote down a splash. At 11:31 the Malaysian left Saldin\'s and ran towards the water. He was seven minutes late, and he waded in anyway.',
      },
    },

    // ---------------- Pettah by night ----------------
    {
      id: 'c4_ch', phase: 'Pettah by night', title: 'The repairman',
      game: 'pursuit',
      brief: 'Tharshini remembers the telephone repairman who came a month ago and fixed nothing: young, a cap, a canvas tool bag with a Telecom sticker that was not Telecom\'s. Herath\'s constable finds a man like that selling second-hand phones off a mat on Fifth Cross Street, where Pettah\'s wholesale stalls trade all night under bare bulbs. You say "112 Sea Street" and he is gone, into the onion sacks and handcarts and chilli stalls, with half the market shouting after him and the other half shouting after you.',
      params: {
        setting: 'market', vehicle: 'foot', difficulty: 'hard', suspect: 'The repairman',
        route: ['market', 'city', 'rooftop', 'market', 'docks'], legs: 5, skyline: 'colombo',
        beats: [
          'Out of Fifth Cross Street onto Main Street, buses and three-wheelers nose to tail.',
          'Up a warehouse stair and across the Pettah roofs, the Lotus Tower glowing over the lagoon.',
          'Down into the Second Cross Street wholesale lanes: onion sacks, handcarts, porters shouting.',
          'Out past the old Dutch hospital towards the harbour fence, cranes against the sky. He is out of street.',
        ],
        clue: 'A month ago he opened the junction box behind 112 Sea Street and fixed nothing.',
      },
      evidence: {
        img: 'ev_c4_toolbag', hotspot: { x: 0.47, y: 0.57, r: 0.20 },
        title: 'He fixed nothing',
        short: 'The repairman\'s bag holds four more GSM relays and a job card on Sinar Gems Lanka\'s account: "112 Sea Street, line maintenance". He delivered the listening phone to Level 9, Port City. A Sinar Cold Chain van drove him to Sea Street and waited in the lane.',
        text: 'Nuwan, 24, has never worked for Telecom. He mends phones at a stall in Maradana and does "special jobs" for anybody who pays cash. In his canvas bag, among onion skins: four more GSM relays still in their baby-monitor boxes, a Telecom identity card with his own photo glued over somebody else\'s, and a carbon job card on Sinar Gems Lanka\'s account, dated a month ago: "112 Sea Street. Line maintenance. Rs 40,000." He set the relay to ring one mobile, and he delivered that mobile himself, boxed, to the managing director\'s office on Level 9 at Port City. He did not go to Sea Street alone. A white Sinar Cold Chain van took him there and waited in the back lane with its engine running; the driver was a big man with a swimmer\'s shoulders who never got out. The plate began WP LH. Herath writes WP LH-4471 on the back of the job card, and goes to wake a magistrate.',
      },
    },

    // ---------------- The port ----------------
    {
      id: 'c4_12', phase: 'The port', title: 'The van in the yard',
      game: 'getaway', variant: 'classic',
      brief: 'Herath gets a warrant for one van at the Sinar Cold Chain depot in Bloemendhal and arrives with it at six in the morning. The van is parked deep in the yard, boxed in by reefer trucks, a forklift and a container chassis, and the night gate man has suddenly lost every key but one. You have ten minutes before somebody telephones Port City. Get the van to the gate.',
      params: {
        difficulty: 'medium', target: 'WP LH-4471',
        clue: 'Trucks only go forwards and back. So does the van. The gate is on the right.',
      },
      evidence: {
        img: 'ev_c4_van', hotspot: { x: 0.51, y: 0.74, r: 0.08 },
        title: 'Lake weed on a cold-store floor',
        short: 'In the back of depot van WP LH-4471: strands of green lake weed, Beira Lake mud in the floor ribs, and the brass buckle of a leather sandal. The GPS box under the dashboard has been unplugged and taped back up.',
        text: 'The van has been hosed, but not well. In the ribs of the refrigerated floor: strands of green weed and grey mud that the Government Analyst will match to the Beira Lake bank by Monday. Wedged under the door seal, the brass buckle of a man\'s leather sandal; Tharshini will know it the moment she sees it. Under the dashboard, the GPS unit\'s plug has been pulled and taped back so that it looks connected. The depot logbook in the cab: "Tue. Out 22:02, in 23:58. K.R. Purpose: blank."',
      },
    },
    {
      id: 'c4_tk', phase: 'The port', title: 'Tony\'s drawer',
      game: 'safecracker', variant: 'classic',
      when: (flags) => !!flags.TONY_FREE,
      brief: 'The depot manager\'s office at Bloemendhal has a window onto the reefer rows and a nameplate you have read before. Tony Kwan is not in. His desk drawer has a four-digit padlock, and Herath\'s warrant covers "the premises", which he decides includes drawers.',
      params: {
        digits: 4, tries: 8, bonus: 4, repeats: false,
        clue: 'Herath: "Men who run away keep one number from the place they ran from." What did Tony leave hanging over the wharf at Port Klang?',
        contains: [4, 7],
      },
      evidence: {
        img: 'ev_c4_tonydrawer', hotspot: { x: 0.29, y: 0.38, r: 0.13 },
        title: 'Written off in Port Klang',
        short: 'In Tony\'s drawer: a list of reefer serials. Three are struck through, "PK Bay 3, Aug 2021, fire, written off": RU-07, RU-11, RU-19. The same three units are on the Bloemendhal register, re-imported in 2022. And a photograph of Tony shaking hands with Shehani Gunasekera.',
        text: 'A clipboard of reefer unit serials, in Tony Kwan\'s square capitals. Three are struck through and annotated "PK Bay 3, Aug 2021, fire. Written off": RU-07, RU-11 and RU-19. The depot\'s own register, on the wall above the desk, shows all three in Bloemendhal, re-imported in 2022, in service. Under the clipboard, a second phone, switched off, and a photograph of the depot\'s opening: Tony Kwan shaking hands with Shehani Gunasekera under a banner with a small sunburst on it. Tony left for the airport, the gate man says, an hour after the warrant arrived.',
      },
    },
    {
      id: 'c4_13', phase: 'The port', title: 'Reefer bank 9',
      game: 'fusebox', variant: 'classic',
      brief: 'Reefer bank 9 is a row of refrigerated units plugged into one breaker board, and the board has been rigged so that one trip cuts every unit at once and resets them in a tangle. Unit RU-11 will only open its controller housing with the power on. Every breaker you throw flips its neighbours. Turn them all on.',
      params: {
        size: 5, pattern: 'plus', presses: 8,
        clue: 'An electrician rigged this board so that nobody could open RU-11 in a hurry. Nobody is in a hurry now.',
      },
      evidence: {
        img: 'ev_c4_reefer', hotspot: { x: 0.50, y: 0.42, r: 0.12 },
        title: 'Forty papers in the cold',
        short: 'Behind a false panel in RU-11\'s compressor housing: forty gem papers of rough blue sapphire, Lot 112, with new certificates signed by a valuer in Ratnapura on Thursday, the day after Yogi died. Natural, unheated, USD 2.4 million.',
        text: 'With the power on, RU-11\'s controller housing opens, and behind it a steel panel that no reefer needs comes away with four screws. Packed into the space, in a plastic sleeve: forty folded gem papers, each with a rough blue stone. Lot 112. Clipped to the sleeve, forty fresh certificates from a valuer in Ratnapura, all dated Thursday, the day after Yogi died, all saying what he would not: "natural, unheated". USD 2.4 million, ready for the Singapore ship on Monday. Herath photographs every paper and puts them back exactly as they were. "Let them load it," he says. "I want to see who comes to sign for it."',
      },
    },
    {
      id: 'c4_wj', phase: 'The port', title: 'Ma, look, I fixed it',
      game: 'spotdiff', variant: 'classic',
      when: (flags) => !!flags.BODY_NAMED,
      brief: 'Madam Ong sends Farah the photographs her son WhatsApped her from Port Klang in August 2021, the way he always did when he had fixed something: "Ma, look." One is the open compressor housing of a reefer unit. Farah forwards it to you at Bloemendhal, standing in front of RU-11. Find what has changed between the two.',
      params: { differences: 8 },
      evidence: {
        img: 'ev_c4_housing', hotspot: { x: 0.72, y: 0.56, r: 0.10 },
        title: 'WJ 12.8.21',
        short: 'RU-11 is the unit in Wei Jie\'s photograph from Port Klang, the day before he disappeared. Inside the housing, scratched with a screwdriver tip where only a technician would look: "WJ 12.8.21". The false panel is new. The space behind it is not.',
        text: 'Same serial plate, same dent in the fan guard, same frost line. The housing in Wei Jie\'s photograph of 12 August 2021 already has the space behind it; only the panel over it is new. And on the inside of the casing, scratched with a screwdriver tip where only another technician would ever look, the initials of a young man from Butterworth who was proud of his work: "WJ 12.8.21". He opened this unit in Bay 3 and saw what was in it. The next night Bay 3 burned. You send the photograph to Farah. She does not reply for an hour, and then she sends: "His mother says thank you. She says he always signed his work."',
      },
    },

    // ---------------- Port City ----------------
    {
      id: 'c4_14', phase: 'Port City', title: 'The valuer first',
      game: 'shredder', variant: 'classic',
      brief: 'Sinar Gems Lanka\'s office is on Level 9 of a glass tower on land that was sea ten years ago. Herath\'s warrant gets you through the door, and Shehani Gunasekera\'s lawyer gets you no further than the reception shredder, which nobody thought to empty. One printed email has been cut into a dozen strips, and some went into the bin face down.',
      params: {
        title: 'SINAR HOLDINGS BERHAD',
        text: 'OFFICE OF THE CHAIRMAN\n\nTo: S. Gunasekera, Colombo\nTuesday, 21:14\n\nThe valuer is talking to\nthe Malaysian. Tonight.\n\nThe valuer first.\nThen the book.\n\nNothing on the phones.',
        strips: 10,
        flips: true,
        stamp: 'PRIVATE',
        clue: 'Printed at 9:15 PM on the reception printer, and shredded at 7:40 the next morning. Some strips went in the wrong way up.',
      },
      evidence: {
        img: 'ev_c4_email', hotspot: { x: 0.56, y: 0.64, r: 0.18 },
        title: 'The valuer first',
        short: 'An email to Shehani Gunasekera at 9:14 PM on Tuesday, twenty-two minutes after the tap heard Yogi\'s call, from "Office of the Chairman", Sinar Holdings: "The valuer is talking to the Malaysian. Tonight. The valuer first. Then the book."',
        text: 'From: Office of the Chairman, Sinar Holdings Berhad. To: S. Gunasekera, Colombo. Tuesday, 21:14, twenty-two minutes after Yogi rang the lodge and the relay in his junction box rang a Sinar Gems mobile. "The valuer is talking to the Malaysian. Tonight. The valuer first. Then the book. Nothing on the phones." Printed at 21:15 on the reception printer, so that somebody could hold it while they made a call. The top of the page, the header with the sender\'s address, is in the strips the shredder chewed. Herath bags them anyway.',
      },
    },
    {
      id: 'c4_15', phase: 'Port City', title: 'Undiyal',
      game: 'ledger', variant: 'classic',
      brief: 'In the same office, a cash book that was never meant for auditors: the money that came in by undiyal, hand to hand from Malaysia with no bank in between, and where it went that week. The weekly totals were printed and couriered to head office on Saturday, before anybody touched the cells. Three cells have been changed since. Find them, and put back what they said.',
      params: {
        rows: 6, cols: 5, altered: 3, restore: true, currency: 'LKR', magnitude: 'lakhs',
        rowLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        colLabels: ['Undiyal in', 'Ratnapura rough', 'Valuations', 'Security', 'Singapore'],
        clue: 'One lakh is a hundred thousand rupees. The printed totals went to Kuala Lumpur on Saturday. The cells were changed on Sunday.',
      },
      evidence: {
        img: 'ev_c4_undiyal', hotspot: { x: 0.47, y: 0.54, r: 0.10 },
        title: 'Five lakhs for security',
        short: 'Restored: Tuesday, "Security", Rs 5 lakhs cash, initialled K.R. Thursday, "Valuations", Rs 2 lakhs to the Ratnapura valuer who signed Lot 112. And the week\'s undiyal in from Kuala Lumpur, entered against "Port Klang account".',
        text: 'Put back, the three cells tell the week the way it happened. Tuesday, "Security": Rs 5 lakhs, half a million rupees in cash, initialled K.R. and countersigned S.G. Kasun Ranaweera earns Rs 95,000 a month. Thursday, "Valuations": Rs 2 lakhs to the valuer in Ratnapura who signed forty certificates in one afternoon. And Monday\'s undiyal in, the cash that came across from Malaysia hand to hand, is entered against a ledger heading you know too well: "Port Klang account". Sinar\'s Malaysian money, washed in Ceylon blue.',
      },
    },
    {
      id: 'c4_16', phase: 'Port City', title: 'The service door',
      game: 'maze', variant: 'cameras',
      brief: 'Shehani Gunasekera\'s alibi is two hundred people at a charity dinner in the ballroom of the Galle Face Hotel. The hotel\'s security office lends you the plan of the back of the house and the angles of its cameras. If she left that ballroom, she left it unseen. Find the only way out that no camera sees.',
      params: {
        map: [
          '##########F##########',
          '#.......#.......#...#',
          '#.#.#####.#####.###.#',
          '#.#.......#...#.....#',
          '#.#.#####.#.#.#####.#',
          '#.#.#...#.S.#...#...#',
          '#...#.#.#####.#.#.###',
          '#.##..#.......#.#...#',
          '#....##.#####.###.#.#',
          '##.#....#...#.....#.#',
          '#..######.#.#######.#',
          '#H........#........C#',
          '#####################',
        ],
        cameras: [
          { x: 19, y: 9, dir: 'S', range: 2 },
          { x: 11, y: 1, dir: 'W', range: 3 },
          { x: 7, y: 1, dir: 'E', range: 3 },
          { x: 1, y: 5, dir: 'S', range: 4 },
          { x: 9, y: 11, dir: 'W', range: 4 },
        ],
        exits: { H: 'Service door to the sea-wall car park', C: 'Main lobby, Galle Road', F: 'Verandah over Galle Face Green' },
        startLabel: 'B',
        startName: 'the ballroom\'s side door',
        aria: 'Plan of the back of house behind the hotel ballroom',
        answer: 'H',
      },
      evidence: {
        img: 'ev_c4_servicedoor', hotspot: { x: 0.50, y: 0.50, r: 0.10 },
        title: 'Out at 10:38, back at 11:57',
        short: 'The only unseen way out of the ballroom ends at the service door to the sea-wall car park. A waiter saw it propped with a napkin at 10:38 and closed it at 11:57. Shehani\'s phone spent those eighty minutes in her office tower at Port City, five minutes away.',
        text: 'The only route no camera sees runs from the ballroom\'s side door through the banqueting kitchen to the service door onto the sea-wall car park. A banquet waiter found that door propped open with a folded napkin at 10:38 and closed it at 11:57, when a woman in a grey dress came back in through it and thanked him. Between those times Shehani Gunasekera\'s phone was connected to a mast on the Port City tower, five minutes\' drive away across the mouth of Galle Face Green, from where a person on Level 9 could listen to a phone line and make two calls. She was back at her table for the dessert.',
      },
    },

    // ---------------- Galle Road ----------------
    {
      id: 'c4_17', phase: 'Galle Road', title: 'Mount Lavinia, 11 PM',
      game: 'lineup', variant: 'single',
      brief: 'Mohan says he was asleep in Wellawatte. His phone says he was in Mount Lavinia, twelve kilometres south along Galle Road, where the old governor\'s mansion is a hotel with a bar on the sand. The barman has worked the night shift for twenty years and remembers faces that tip badly. He will look at faces for you, fast.',
      params: { rounds: 3, studySeconds: [9, 7, 5] },
      evidence: {
        img: 'ev_c4_lavinia', hotspot: { x: 0.45, y: 0.66, r: 0.14 },
        title: 'Three stones, behind his back',
        short: 'The barman picks Mohan every time: at the Mount Lavinia bar from 10:10 PM to 1:20 AM, with a gem buyer from Bangkok, a velvet pouch and a loupe. Twelve kilometres from Beira Lake. He sold his brother\'s three stones for Rs 1.8 million.',
        text: 'The barman picks Mohan three times out of three. 10:10 PM to 1:20 AM, at the end of the bar by the arches over the sand, with a buyer from Bangkok, a velvet pouch, a loupe and two whisky sodas he did not finish. Twelve kilometres from Beira Lake, and the Galle Road at night does not do twelve kilometres in less than half an hour. He sold three of his brother\'s stones for Rs 1.8 million cash, to pay the lender in Wellawatte. When you tell him what you know he sits down on the hotel steps. "My brother would have forgiven me. He forgave everybody. Tharshi will not."',
      },
    },
    {
      id: 'c4_18', phase: 'Galle Road', title: 'The ten-minute stop',
      game: 'series', variant: 'classic',
      brief: 'Chaminda Silva has driven Yogi home from Sea Street every evening for eleven years, and on Tuesday he drove him somewhere else first. He is frightened, and he only talks in numbers: fares, meter minutes, bus routes, the tickets he watched being torn. He keeps them all. Find what comes next in each.',
      params: {
        items: [
          { prompt: 'The waiting charge on Chaminda\'s meter outside Fort station, in rupees, minute by minute: 10, 20, 35, 55, 80, ?', answer: 110, hint: 'The gaps grow by five each time: 10, 15, 20, 25 …' },
          { prompt: 'Buses he squeezed past on Main Street, Pettah, by route number: 100, 101, 103, 106, 110, ?', answer: 115, hint: 'Add 1, then 2, then 3 …' },
          { prompt: 'Cloakroom tickets the clerk tore for the four passengers ahead of Yogi in the queue: 398, 402, 406, 410, ?', answer: 414, hint: 'Each ticket is four on from the last.' },
          { prompt: 'His fares that week, in hundreds of rupees, each the sum of the two before: 2, 3, 5, 8, 13, ?', answer: 21, hint: 'Add the two numbers before.' },
          { prompt: 'Missed calls from his wife on Tuesday night, by the hour: 1, 2, 4, 8, ?', answer: 16, hint: 'She doubles them every hour.' },
          { prompt: 'His odometer at each stop, in kilometres past 48,000: 112, 115, 121, 130, 142, ?', answer: 157, hint: 'The gaps grow by three: 3, 6, 9, 12 …' },
        ],
      },
      evidence: {
        img: 'ev_c4_tuktuk', hotspot: { x: 0.85, y: 0.48, r: 0.10 },
        title: 'Ticket 0414',
        short: 'At 9:24 PM Yogi went into Colombo Fort station with a parcel wrapped in a Tamil newspaper and came out at 9:34 without it. Herath reads the mortuary\'s effects list again: "one pink paper ticket, no. 0414, wet, printing illegible", found in his sock.',
        text: 'Chaminda drove Yogi from Sea Street to Colombo Fort station at 9:15. Yogi went in at 9:24 with a parcel the size of a brick, wrapped in a page of Thinakkural and tied with string, and came out at 9:34 with his hands empty. He paid Chaminda ninety rupees extra for the wait and told him: "Come back to the shop at half past ten. We are going to Slave Island." At 10:30 the shutter was down and the shop next door said a van had come. Chaminda went home and told nobody, because the van driver had looked at him. Herath takes out the mortuary\'s effects list and reads the line everybody skipped: "One pink paper ticket, no. 0414, wet, printing illegible. Found in left sock."',
      },
    },

    // ---------------- The interview room ----------------
    {
      id: 'c4_19', phase: 'The interview room', title: 'Everyone at 11:24',
      game: 'logicgrid', variant: 'classic',
      brief: 'CID headquarters in Colombo Fort is a colonial building with fans that turn and a canteen that serves the best plain tea in the city. Herath borrows a room on the third floor and a pad of squared paper. Before anybody comes in, he wants the night on one page. Five people, five places, five things in their hands at 11:24.',
      params: {
        categories: [
          { name: 'Person', items: ['Kasun', 'Shehani', 'Mohan', 'Rajan', 'Tharshini'] },
          { name: 'Location', items: ['Saldin\'s tea shop', 'Kotahena', 'Beira Lake bank', 'Mount Lavinia', 'Port City, Level 9'] },
          { name: 'Holding', items: ['Silver lighter', 'Velvet pouch', 'String hoppers', 'Leather satchel', 'Second phone'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[2, 3], [4, 4], [3, 1], [0, 0], [1, 2]],
        clues: [
          'The silver lighter was turned over and over at a tea-shop table.',
          'Neither Mohan nor Tharshini was anywhere near Slave Island.',
          'Tharshini was at home, keeping something warm for her father.',
          'The second phone was on the ninth floor of a tower.',
          'Whoever stood on the lake bank was holding something that was not theirs.',
          'The second phone was in a woman\'s hand.',
          'Kasun was not drinking tea.',
        ],
      },
      evidence: {
        img: 'ev_c4_onepage', hotspot: { x: 0.48, y: 0.52, r: 0.20 },
        title: 'Everyone at 11:24 PM',
        short: 'Kasun: the Beira Lake bank, with Yogi\'s satchel. Shehani: Port City, Level 9, with a second phone. Mohan: Mount Lavinia, a velvet pouch. Rajan: Saldin\'s tea shop, a silver lighter. Tharshini: at home in Kotahena, keeping her father\'s string hoppers warm.',
        text: 'At 11:24 PM: Kasun Ranaweera was on the Beira Lake bank under the footbridge, with an old man\'s satchel in his hand and nothing in it. Shehani Gunasekera was on Level 9 at Port City with a second phone, which called one number at 9:16 and again at 11:31. Mohan Yogeswaran was in Mount Lavinia with a velvet pouch that was not his. The Malaysian was at Saldin\'s, turning a silver lighter over and waiting for a friend. Tharshini was at home in Kotahena with a plate of string hoppers under a cloth, keeping them warm for her father, who always came home by eleven.',
      },
    },
    {
      id: 'c4_20', phase: 'The interview room', title: 'Five interviews',
      game: 'whoslying', variant: 'classic',
      brief: 'Herath lets you sit in on five interviews. Each person either told the whole truth or lied in everything they said. Work out who lied.',
      params: {
        solvedLine: 'Herath folds his glasses. "Two liars. One pays for the van, one drives it."',
        people: [
          { id: 'mohan', name: 'Mohan', says: [{ t: '"I was at Mount Lavinia from ten until one."', fact: true, note: 'The barman picked him out three times.' }, { t: '"Shehani is lying."', about: 'shehani', is: false }] },
          { id: 'saldin', name: 'Uncle Saldin', says: [{ t: '"Mohan is telling the truth."', about: 'mohan', is: true }, { t: '"Kasun is lying."', about: 'kasun', is: false }] },
          { id: 'chaminda', name: 'Chaminda', says: [{ t: '"Uncle Saldin is telling the truth."', about: 'saldin', is: true }, { t: '"At least two of the others are lying."', atLeast: 2 }] },
          { id: 'shehani', name: 'Shehani', says: [{ t: '"Kasun is telling the truth."', about: 'kasun', is: true }, { t: '"Chaminda is lying."', about: 'chaminda', is: false }] },
          { id: 'kasun', name: 'Kasun', says: [{ t: '"Shehani is telling the truth."', about: 'shehani', is: true }, { t: '"Mohan is lying."', about: 'mohan', is: false }] },
        ],
        liars: ['shehani', 'kasun'],
      },
      evidence: {
        img: 'ev_c4_interviews', hotspot: { x: 0.47, y: 0.50, r: 0.18 },
        title: '"Late, thambi"',
        short: 'Shehani and Kasun lied. Mohan, Saldin and Chaminda told it straight. Kasun says one true thing to the table: the satchel was empty when he opened it in the van, and the old man laughed and said, in Tamil, "Late, thambi. You are late."',
        text: 'Shehani Gunasekera and Kasun Ranaweera lied in every word. Mohan, Uncle Saldin and Chaminda Silva told the truth, frightened or ashamed or both. At the end Kasun says one true thing, to the table and not to anybody in the room. When he opened the old man\'s satchel in the back of the van, it was empty, and the old man laughed at him. "He said, in Tamil, so I would understand: late, thambi. You are late." Kasun looks at his scratched forearms. "He was still laughing at the lake."',
      },
    },
  ],

  outcomes: {
    charged: {
      shehani: { en: 'Shehani Gunasekera is arrested at the Port City showroom at six in the morning, still in the grey dress from the charity dinner. Sinar Gems Lanka\'s lawyers arrive before the police jeep has left the car park.' },
      kasun: { en: 'Kasun Ranaweera is arrested at the Bloemendhal depot gate, his forearms still scored pink. In the jeep he asks only one thing: whether the old man had children.' },
      mohan: { en: 'Mohan Yogeswaran is charged with his brother\'s murder. He tells the magistrate he was in Mount Lavinia, selling his brother\'s stones behind his back. The Bangkok buyer has already flown home.' },
      rajan: { en: 'A warrant goes out for a Malaysian national, K. Rajan. The passport number on the lodge register was issued in Kuala Lumpur in 2019, to a man who died in August 2021.' },
    },
    correct: ['shehani', 'kasun'],
  },

  flagNames: ['SHEHANI_FREE', 'KASUN_FREE', 'MOHAN_WRONGED', 'RAJAN_HUNTED', 'BOOK_FOUND', 'BOOK_LOST'],
  flags: ({ charged, answers }) => ({
    SHEHANI_FREE: !charged.includes('shehani'),
    KASUN_FREE: !charged.includes('kasun'),
    MOHAN_WRONGED: charged.includes('mohan'),
    // a warrant in K. Rajan's name: the man who calls himself that goes further underground
    RAJAN_HUNTED: charged.includes('rajan'),
    BOOK_FOUND: answers.book === 'fort',
    BOOK_LOST: answers.book !== 'fort',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  ending(v) {
    const right = CASE04.outcomes.correct.every((id) => v.has(id));
    const found = v.answers.book === 'fort';
    let tharLine;
    if (right && !v.has('mohan') && !v.has('rajan')) tharLine = 'Appa used to say a stone tells the truth to anybody who holds it to the light long enough. You held it long enough.';
    else if (v.has('mohan')) tharLine = 'They took Chithappa. He sold Appa\'s stones and lied to me, and now he is in Welikada for the one thing he did not do. I do not know which part to be angry about.';
    else if (v.has('rajan')) tharLine = 'They say it was the Malaysian. Appa trusted him. Appa trusted him more than he trusted himself.';
    else tharLine = 'They say it is finished. Appa would have held it to the light a little longer.';

    const panels = [
      { img: 'c4_out_01_arrest', mood: 'police', fx: ['rain', 'siren'], place: 'Police headquarters, Colombo Fort. Friday, 4:50 AM.', music: 'resolution',
        lines: v.charged.map((id) => ({ who: null, en: CASE04.outcomes.charged[id].en })) },
      { img: 'c4_out_02_kanatte', mood: 'day', fx: ['dust'], place: 'Kanatte, Borella. Friday, 10:00 AM.',
        lines: [
          { who: null, en: 'Slave Island station amends its file on the morning of the cremation. Not misadventure. Drowning, by another hand.' },
          { who: 'Tharshini Yogeswaran', en: tharLine },
          { who: null, en: 'Mohan\'s half of 112 Sea Street goes to his lender, and his lender sells it to Sinar Gems Lanka before the month is out.', when: (f) => f.MOHAN_WRONGED },
          { who: null, en: 'Shehani Gunasekera flies to Singapore on Saturday "for a conference". The Port City showroom does not open again. Within a week a new name is painted on the director\'s door: Melissa Ong.', when: (f) => f.SHEHANI_FREE && f.MELISSA_FREE },
          { who: null, en: 'Shehani Gunasekera flies to Singapore on Saturday "for a conference". The Port City showroom does not open again.', when: (f) => f.SHEHANI_FREE && !f.MELISSA_FREE },
          { who: null, en: 'Kasun Ranaweera signs on as a reefer technician aboard a Sinar Cold Chain feeder ship. Its next port of call is Port Klang.', when: (f) => f.KASUN_FREE },
          { who: null, en: 'Tony Kwan is not at the depot on Friday. His desk is clear, and his second phone has gone with him.', when: (f) => f.TONY_FREE },
        ] },
    ];

    if (found) {
      panels.push({ img: 'c4_out_03_fort', mood: 'day', fx: [], place: 'Colombo Fort railway station. Friday, 8:10 AM.',
        lines: [
          { who: null, en: 'Ticket 0414 is still in the cloakroom ledger. One parcel, newspaper and string, left on Tuesday at 9:31 PM, three days paid in advance.' },
          { who: 'Inspector Ruwan Herath', en: 'Ninety rupees a day, and nobody looks inside. Every crook in Colombo knows it. So did one honest man.' },
          { who: null, en: 'Inside, Yogi\'s carbon book. Sixty-one certificates in six years, and beside every one, in his small careful Tamil, what the stone was really worth.' },
          { who: null, en: 'On the last page, in English, dated Tuesday: "Every valuation above was made on the instruction of S. Gunasekera, for the Office of the Chairman. I am sorry. P. Yogeswaran."' },
          { who: null, en: 'Clipped inside the back cover, a Malaysian customs release for three reefer units, Port Klang to Colombo, 2022. Officer: N. SALLEH.', when: (f) => f.NORHAYATI_FREE },
        ] });
    } else {
      const wrongLine = {
        safe: 'CID open the safe at 112 Sea Street with Mohan\'s key. It holds the shop\'s gold, a bundle of school reports with Tharshini\'s name on them, and nothing else.',
        saldin: 'CID take Uncle Saldin\'s counter apart board by board while he watches from the doorway with his hands behind his back. There is nothing under it but fifty years of dust.',
        lake: 'Navy divers spend two days in Beira Lake. They bring up a bicycle, a temple bell and a great deal of mud.',
      }[v.answers.book] || 'Nobody goes looking for the book.';
      panels.push({ img: 'c4_out_03_lost', mood: 'night', fx: ['dust'], place: 'Colombo Fort railway station. Friday, 6:30 PM.',
        lines: [
          { who: null, en: wrongLine },
          { who: null, en: 'On Friday evening Herath reads the mortuary\'s effects list again, and finds the line everybody skipped. One pink ticket, no. 0414. Found in left sock.' },
          { who: null, en: 'The cloakroom clerk remembers 0414. It was collected on Thursday morning by a man in a work polo with a little sun on the pocket. He had the ticket. He paid for the three days.' },
        ] });
    }

    if (v.has('rajan')) {
      panels.push({ img: 'c4_out_04_room14', mood: 'day', fx: [], place: 'New Sea View Lodge, Kotahena. Friday, 7:00 AM.', music: 'memory',
        lines: [
          { who: null, en: 'CID break the door of Room 14 at seven. The bed is made. The bin is empty. The window is open onto the harbour.' },
          { who: null, en: 'On the pillow, a paper kancil, folded from a Sri Lankan Airlines boarding pass. Colombo to Kuala Lumpur. The name has been torn off.' },
          { who: null, en: 'Herath puts it in an evidence bag and hands it to you without a word, as if it were yours.' },
        ] });
    } else {
      panels.push({ img: 'c4_out_04_green', mood: 'day', fx: [], place: 'Galle Face Green. Saturday, 6:20 PM.', music: 'memory',
        lines: [
          { who: null, en: 'On your last evening you go back to Malay Street to pay Uncle Saldin for the tea.' },
          { who: 'Uncle Saldin', orig: 'Orang Malaysia tu datang lagi semalam. Dua teh. Minum satu.', en: 'Your Malaysian came again last night. Two teh. He drank one.' },
          { who: null, en: 'He left a message, Saldin says. Galle Face Green, the bench by the old cannon, at sunset.' },
          { who: null, en: 'You wait until the kites come down. Nobody comes. On the bench, under a cup of tea gone cold, a paper kancil folded from a kottu receipt.' },
        ] });
    }

    const call = v.has('rajan')
      ? [
        { who: null, en: 'At midnight your phone rings. A Colombo number. Nobody speaks. Waves, and one long breath, and then the line goes dead.' },
      ]
      : [
        { who: null, en: 'At midnight your phone rings. A Colombo number you have never seen.' },
        { who: '???', en: 'Machan.' },
        { who: null, en: 'One word. Behind it, the sea, and somewhere the clatter of kottu blades.' },
        { who: '???', en: 'Not yet. Go home. Look at the lifts.' },
        { who: null, en: 'The line goes dead. Your hand has gone to the lighter in your pocket, and stays there.' },
      ];
    panels.push({
      img: 'c4_out_05_call', mood: 'night', fx: ['rain'], place: 'Galle Face Green. Saturday, 11:58 PM.', music: 'chairman',
      lines: [
        ...call,
        { who: null, en: 'Before you board, Herath sends one more photograph: the top of the Port City email, the strip the shredder chewed. Sender: Office of the Chairman. Level 14, Menara Sinar, Kuala Lumpur.' },
        { who: null, en: 'The lifts in Menara Sinar go from 13 to 15.' },
      ],
    });
    return panels;
  },
};
