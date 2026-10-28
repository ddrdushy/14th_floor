// CASE 5: MENARA SINAR. Jalan Ampang, Kuala Lumpur, and Kampung Baru across the river.
// Truth (writers only): HOMICIDE. Dato' Rashid Osman, 61, Group Finance Director of Sinar Holdings Berhad
// since 1997, kept the "Port Klang account" (the Chairman's real books) on Level 14 of Menara Sinar, a full
// storey that exists between 13 and 15 but has no lift button: the plans filed with DBKL call it a plant
// floor. It is the Office of the Chairman: an archive of every official Sinar has bought, a listening room
// where every tapped line lands (Sea Street, Seri Kiara 14, Lebuh Chulia, Restoran Bala), and a desk with a
// chair facing the window and a telescope pointed at Brickfields. Orders are never sent to phones: they are
// printed on Floor 14, collected by hand and shredded ("Nothing on the phones").
// After Henry Goh, Uncle Lim and Yogi, Rashid knew everyone who had signed something in 2021 was being
// crossed off. Nine days ago a man calling himself K. Rajan (Daniel Raj) came back from Colombo and left a
// paper kancil, folded from a Colombo three-wheeler receipt, on Rashid's car seat. Rashid agreed to take him
// up to 14 on Sunday at 11 PM through the loading bay. Rashid's mobile was tapped; the listening room heard
// him set it up on Saturday at 9:12 PM.
// Vivian Chua, 56, Secretary to the Chairman for twenty-seven years (every "Office of the Chairman" email in
// Cases 3 and 4 came from her desk), sent the order to the Floor 14 printer from home at 21:40 ("The director
// first. Then the kancil."), paid Zul RM 50,000 in advance on Saturday and booked a Cold Chain van for 3 AM.
// She came in at 11:25 PM (Rashid's dashcam), paid Supt. Khairul his monthly envelope on 15, and listened to
// Rashid's phone live from the listening room. She left at 12:40.
// Zulkifli "Zul" Hamid, 47, Head of Security (ex-PDRM, left 2018, taught Farah to shoot at PULAPOL), had the
// night guard moved off the loading bay at 10 PM so the kancil man could come in, signed out the cradle (BMU)
// key at 23:35 ("storm check, roof"), and met Rashid on 14. At 11:43 Rashid sent Ain "Maafkan Abah"; at 11:44
// he phoned Daniel, who was on the stair landing between 13 and 14: "Dia dah sampai. Jangan naik. Pergi."
// Rashid fought (Zul's skin under his nails, a cufflink on the sill) and went out of the cradle door at 11:47
// (a taxi dashcam on Jalan Ampang). Zul took his phone, his keycard and the kancil from his breast pocket.
// After the storm stopped (1:10 AM) Zul "found" him at 1:20, closed the dead fingers over the dry kancil to
// point at the kancil man, and called 999 at 1:34. From 3:05 to 5:10 AM a Sinar Cold Chain reefer van and the
// firefighting lift (Lift 7, Bomba key switch with a hand-filed 14) emptied the floor into a cold room behind
// Chow Kit market; on Tuesday night it went on to Warehouse 6, Pulau Indah, and out as reefer unit RU-19.
// Supt. Khairul Anuar, 52, Farah's superior, is innocent of the murder but on Sinar's payroll (RM 8,000 a
// month, collected in person the last Sunday of every month): he was in the tower from 10:40 to 11:52 and lied
// about it, and he was counting his envelope in his car on B2 when Rashid fell.
// K. Rajan is Daniel Raj (confirmed here: his 2016 private-agency licence prints are on the stair rail). He
// never reached 14. He ran down at 11:46, out by the loading bay at 11:53, across the Saloma bridge, and sat
// at Mak Teh's upstairs window in Kampung Baru until dawn. Mak Teh says he left; he did not.
// Not caught: the Chairman. The Chairman is still never named or seen.
//
// Evidence hotspots were placed by eye on the generated ev_c5_* art (docs/image_prompts.md, Case 5).

const WHERE = [
  { id: 'kgbaru', label: 'Mak Teh\'s upstairs room, Kampung Baru', note: 'Above a warung on Jalan Raja Muda Musa, across the Saloma bridge from Menara Sinar. Mak Teh says he left at dawn on Monday and is not coming back.' },
  { id: 'brickfields', label: 'Your office, above Restoran Bala', note: 'Bala Anne says a tall man in a cap stood across Jalan Tun Sambanthan at six on Monday morning and looked up at your window for a long time.' },
  { id: 'klia', label: 'KLIA, on the morning flight to Colombo', note: 'Immigration has a K. Rajan booked on Tuesday\'s 9:50 flight to Colombo. One way.' },
  { id: 'floor14', label: 'Menara Sinar, Floor 14', note: 'The one floor in Kuala Lumpur nobody can search without Bomba. He climbed towards it once already.' },
];

export const CASE05 = {
  id: 'case05',
  number: 5,
  title: 'Menara Sinar',
  place: 'Jalan Ampang, Kuala Lumpur',
  victim: 'Dato\' Rashid Osman, 61, Group Finance Director of Sinar Holdings. Found on the pavement of Jalan Ampang at 1:20 AM on Monday.',
  question: 'Who killed Dato\' Rashid Osman?',
  brief: 'Menara Sinar\'s lifts go from 13 to 15. On Monday morning its Group Finance Director was found on the pavement of Jalan Ampang, under a band of black glass where a floor should be. Dang Wangi says he jumped. Farah\'s superintendent wants the file closed by Wednesday. In his fist was a paper kancil folded from a Colombo three-wheeler receipt, and Farah has put it in your hand.',
  hints: 8,
  music: 'investigation',
  mapIntro: 'Every puzzle gives up one exhibit. Two questions wait at the end of this one: who killed Rashid Osman, and where Daniel is now. Farah gets one team and one door, once. Nobody will tell you if you get either of them right.',
  finalLabel: 'Name them',
  phoneIdle: 'No missed calls. Ain sent a photo of her father\'s reading glasses on the newsroom desk, on top of Monday\'s front page.',
  deduction: {
    lede: 'Farah will arrest whoever you name, on your word and her own signature, before Superintendent Khairul can close the file. Name everyone who planned Rashid Osman\'s death or carried it out, and only them.',
    button: 'Tell Farah',
    confirm: 'Farah will arrest {names}. Ain will hear it from you, at the cemetery, in the morning.',
    confirmTitle: 'Name them?',
    confirmButton: 'Tell Farah',
    questions: [
      {
        id: 'daniel', q: 'Where is Daniel?', short: 'Farah\'s team goes to',
        lede: 'Daniel has been alive for five years, and since Sunday everybody in Sinar knows he is in Kuala Lumpur. Farah can send one team, once, without a radio. Whatever she raids, the people who emptied Floor 14 will hear about within the hour.',
        options: WHERE,
      },
    ],
  },

  // revealedBy: the level whose exhibit first makes this person a person of interest (see suspectsRevealedBy
  // in cases.js). Until it is solved they are not on the map, the board or the office wall.
  suspects: [
    {
      id: 'rajan', name: 'K. Rajan', role: 'The kancil man. Malaysian, on a dead man\'s passport', img: 'sus_rajan',
      revealedBy: 'c5_01',
      revealLine: 'The kancil in the dead man\'s fist was folded from a Colombo three-wheeler receipt. The man who folds them flew in from Colombo nine days ago.',
      look: { skin: '#8d5a3a', hair: 'short', hairColor: '#151210', coat: 'trench', eyewear: 'none', mark: 'stubble' },
      motive: 'None known. In Colombo the last man he went to see was found in Beira Lake. In Kuala Lumpur he folds his paper for a director of Sinar.',
      claim: 'Nobody has found him to ask.',
    },
    {
      id: 'zul', name: 'Zulkifli Hamid', role: 'Head of Security, Menara Sinar. 47', img: 'sus_zul',
      revealedBy: 'c5_03',
      revealLine: 'He found the body at 1:20 AM and called the police at 1:34. Fourteen minutes, alone on the pavement with a dead man.',
      look: { skin: '#b97f55', hair: 'short', hairColor: '#3a3a3a', coat: 'blazer', eyewear: 'none', mark: 'moustache' },
      motive: 'None known. Left the police in 2018 "by mutual agreement" and has run Menara Sinar\'s security ever since. Farah says he taught her to shoot.',
      claim: 'Says he sat out the storm in the control room on B1, went out on his rounds when the rain stopped, and found Dato\' Rashid at 1:20.',
    },
    {
      id: 'khairul', name: 'Khairul Anuar', role: 'Superintendent, Bukit Aman. Farah\'s superior. 52', img: 'sus_khairul',
      revealedBy: 'c5_05',
      revealLine: 'The night guard picked his face three times. A visitor for the Office of the Chairman, the last Sunday of every month. On Sunday he came at 10:40 PM.',
      look: { skin: '#b97f55', hair: 'side-part', hairColor: '#151210', coat: 'batik', eyewear: 'none', mark: 'moustache' },
      motive: 'Wants the fall closed as a suicide by Wednesday, and has not said why.',
      claim: 'Says he was at home in Bangsar all Sunday evening and heard the news from the duty officer at two in the morning.',
    },
    {
      id: 'vivian', name: 'Vivian Chua', role: 'Secretary to the Chairman, Sinar Holdings. 56', img: 'sus_vivian',
      revealedBy: 'c5_06',
      revealLine: 'Only two people may enter Level 14: the Chairman, and the Chairman\'s secretary. Dato\' Rashid was about to take a stranger up there.',
      look: { skin: '#f1d2b6', hair: 'bun', hairColor: '#7a7a7a', coat: 'blazer', eyewear: 'round', mark: 'none' },
      motive: 'Twenty-seven years as the Chairman\'s secretary. The keys to Level 14 are on her list, and Dato\' Rashid was not supposed to be bringing guests.',
      claim: 'Says she was at home in Bukit Tunku from nine on Sunday night, and that her housekeeper will say so.',
    },
  ],

  opening: [
    {
      img: 'c5_intro_01_news', mood: 'warm', fx: ['rain'], place: 'Brickfields. Monday, 6:40 AM.', music: 'office',
      lines: [
        { who: null, en: 'On the television over Bala Anne\'s counter: a glass tower on Jalan Ampang, blue lights, and a white sheet on a wet pavement. A director of Sinar Holdings has fallen.' },
        { who: 'Bala Anne', orig: 'Thambi. Idhu andha Sinar dhaane?', en: 'Boy. Isn\'t that your Sinar?' },
        { who: 'Bala Anne', en: 'You say that name in your sleep. I can hear it through the floor.' },
        { who: null, en: 'Under the picture, smaller: Dr. Shanti Menon\'s appeal will be heard in March. This time Bala Anne does not turn the sound down. He turns it off.', when: (f) => f.SHANTI_WRONGED },
        { who: 'Bala Anne', en: 'That durian man Ravi sent a box of fruit for you. I put it on the five-foot way. I am not having durian in my kitchen.', when: (f) => f.RAVI_WRONGED },
        { who: null, en: 'Under the till, a letter with a Sri Lankan stamp. Tharshini, three lines: Chithappa\'s trial is in January. The shop is sold. Appa\'s loupe is still around my neck.', when: (f) => f.MOHAN_WRONGED },
      ],
      kb: { from: [1.06, 2, 0], to: [1.0, -2, 0] },
    },
    {
      img: 'c5_intro_02_kancils', mood: 'night', fx: ['rain', 'dust'], place: 'Upstairs.',
      lines: [
        { who: null, en: 'You take them out of the drawer and stand them in a row: the paper kancils, one from every city they have sent you to. Mont Kiara. Penang. Colombo.' },
        { who: null, en: 'And a voice on a Colombo line, the last night there. Not yet. Go home. Look at the lifts.', when: (f) => !f.RAJAN_HUNTED },
        { who: null, en: 'And a call from Colombo on the last night there, with nobody on the line but the sea and one long breath.', when: (f) => f.RAJAN_HUNTED },
        { who: null, en: 'The lifts in Menara Sinar go from 13 to 15. Last night a man came down past all of them.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.16, 0, 1] },
    },
    {
      img: 'c5_intro_03_farah', mood: 'police', fx: ['rain', 'siren'], place: 'Jalan Ampang. 7:30 AM.', music: 'tension',
      lines: [
        { who: 'Inspector Farah Iskandar', orig: 'Yang ini, aku punya.', en: 'This one is mine.' },
        { who: 'Inspector Farah Iskandar', en: 'Dato\' Rashid Osman. Group Finance Director, Sinar Holdings. He lay on that pavement through the whole storm before anybody called it in. His fist was closed. This was in it.' },
        { who: 'Inspector Farah Iskandar', en: 'You know whose this is. Do not tell me. Not yet.' },
        { who: 'Inspector Farah Iskandar', en: 'Colombo put out a red notice for a K. Rajan, on your word. Immigration says he landed at KLIA nine days ago. My superintendent read it before I did.', when: (f) => f.RAJAN_HUNTED },
        { who: 'Inspector Farah Iskandar', en: 'Herath sent me the last page of a gem cutter\'s book. Every valuation for the Office of the Chairman. That page is the only reason I am allowed to stand on this pavement.', when: (f) => f.BOOK_FOUND },
        { who: 'Inspector Farah Iskandar', en: 'Herath says the gem cutter\'s book was collected from Fort station by a man with a sun on his shirt. So I have nothing that gets me past that lobby. Except you.', when: (f) => f.BOOK_LOST },
        { who: 'Inspector Farah Iskandar', en: 'And Westport says a Sri Lankan reefer technician walked off a Sinar Cold Chain feeder on Friday night and never walked back on. Scratches on both arms.', when: (f) => f.KASUN_FREE },
      ],
      kb: { from: [1.05, 0, 0], to: [1.12, 0, -2] },
    },
    {
      img: 'c5_intro_04_tower', mood: 'night', fx: ['rain'], place: 'Menara Sinar, Jalan Ampang.',
      lines: [
        { who: null, en: 'Menara Sinar is thirty-eight storeys of green glass on Jalan Ampang, four hundred metres from the twin towers, with a brass sun on its crown that catches the morning before anything else on the street.' },
        { who: null, en: 'Count the floors from the pavement and you run out of numbers. A third of the way up there is one storey of black glass with no light behind it. Above it, Level 15. Below it, Level 13.' },
        { who: null, en: 'He landed under the black glass.' },
      ],
      kb: { from: [1.0, 0, 2], to: [1.15, 0, -2] }, sfx: 'thunder',
    },
    {
      img: 'c5_intro_05_ain', mood: 'day', fx: ['rain'],
      lines: [
        { who: null, en: 'At the tape, a young woman with a press lanyard that nobody will let her use. Nurul Ain. His daughter.' },
        { who: 'Nurul Ain', en: 'Everybody keeps telling me he jumped. Maybe he did. He stopped sleeping in September. He said he had signed things he could not unsign.' },
        { who: 'Nurul Ain', en: 'At 11:43 he sent me two words.' },
        { who: 'Nurul Ain', orig: 'Maafkan Abah.', en: 'Forgive your father.' },
        { who: 'Nurul Ain', en: 'And last week he said a strange thing. If a man who folds paper animals ever comes to you, Ain, help him.' },
      ],
      kb: { from: [1.08, 1, 0], to: [1.0, -1, 0] },
    },
    {
      img: 'c5_intro_06_khairul', mood: 'police', fx: [], place: 'The lobby, Menara Sinar.',
      lines: [
        { who: 'Supt. Khairul Anuar', orig: 'Tekanan kerja. Dia terjun.', en: 'Pressure at work. He jumped.' },
        { who: 'Supt. Khairul Anuar', en: 'By Wednesday this file is closed, Farah. And your friend from Brickfields is not police.' },
        { who: null, en: 'When he has gone, Farah says one word, Wednesday, the way you say the name of a river you have to cross.' },
      ],
      kb: { from: [1.0, 0, 0], to: [1.1, 0, 1] },
    },
    {
      img: 'c5_intro_07_lobby', mood: 'night', fx: ['dust'], place: 'Menara Sinar. Monday, 9:10 AM.', sfx: 'lift',
      lines: [
        { who: null, en: 'The lobby is black marble with a brass sun set in the floor, so that everybody who comes in has to walk across it.' },
        { who: 'Zulkifli Hamid', en: 'Welcome to Menara Sinar. Anything you need, you ask me first. Inspector. Long time.' },
        { who: null, en: 'Behind him an old man in grey overalls has a lift panel open. 12, 13, 15. He catches you counting.' },
        { who: 'Uncle Wong', orig: 'Sap sei lau? Mou sap sei lau gaa.', en: 'Fourteen? There is no fourteen.' },
        { who: 'Uncle Wong', orig: 'Sap sei. Sat sei.', en: 'Fourteen sounds like "sure to die".' },
      ],
      kb: { from: [1.0, -2, 0], to: [1.1, 2, 1] },
    },
    { title: { kicker: 'Case 5', name: 'Menara Sinar' }, fx: ['rain'] },
  ],

  levels: [
    // ---------------- Jalan Ampang ----------------
    {
      id: 'c5_01', phase: 'Jalan Ampang', title: 'In his fist',
      game: 'wordsearch', variant: 'secret',
      brief: 'Dang Wangi\'s crime-scene officer listed everything on and around the body before the van came, in capitals, on a clipboard that got wet. Farah lets you copy the list. Find every item. The letters nobody used will tell you what the list does not say.',
      params: {
        size: 12,
        words: ['WALLET', 'WATCH', 'CUFFLINK', 'TIE', 'LOAFER', 'UMBRELLA', 'PEN', 'TASBIH', 'GLASSES', 'RECEIPT', 'KANCIL', 'BELT', 'RING', 'KEYS'],
        extra: ['RAIN', 'TAPE', 'CHALK', 'SHEET', 'CONE', 'TORCH', 'DRAIN', 'KERB', 'TAXI', 'LAMP', 'SIREN', 'GRATE'],
        message: 'NOPHONENOKEYCARD',
        messageSpaced: 'NO PHONE NO KEYCARD',
      },
      evidence: {
        img: 'ev_c5_fist', hotspot: { x: 0.46, y: 0.50, r: 0.10 },
        title: 'In his fist',
        short: 'In Dato\' Rashid\'s right fist: a paper kancil folded from a Colombo three-wheeler receipt, Kotahena to the airport, nine days ago. His pockets hold everything a director carries except two things: his phone and his Menara Sinar keycard.',
        text: 'Wallet, watch, tasbih, a fountain pen, one loafer still on and one in the gutter, an umbrella he never opened, one gold cufflink on his right cuff and none on his left. No phone. No keycard, in a building where a director cannot open a door without one. And in his right fist, which Dang Wangi had to open finger by finger: a paper kancil. Farah unfolds one corner for you inside the evidence bag. A three-wheeler meter receipt in Sinhala and English, Kotahena to Bandaranaike International Airport, the Saturday night you left Colombo. Immigration has a K. Rajan landing at KLIA the next morning.',
      },
    },
    {
      id: 'c5_02', phase: 'Jalan Ampang', title: 'The black band',
      game: 'series', variant: 'classic',
      brief: 'Dang Wangi\'s photographer took his pictures and went home. He left his notebook with Farah: rain, chalk marks, storeys counted off the facade, the things a careful man writes down when nobody will read them. Six of his lists are number runs. Finish each one.',
      params: {
        items: [
          { prompt: 'Tower B across Jalan Ampang skips every label with a 4 in it. Its lift panel reads 21, 22, 23, ? (the next button up)', answer: 25, hint: 'No 24. It has a 4 in it.' },
          { prompt: 'Rain on Menara Sinar\'s roof gauge, millimetres every ten minutes from 11:10 PM: 1, 3, 9, 27, ?', answer: 81, hint: 'Three times as much each time.' },
          { prompt: 'Chalk marks on the pavement, centimetres out from the wall: 20, 40, 80, 160, 320, ?', answer: 640, hint: 'Each mark is twice as far out as the last.' },
          { prompt: 'The window-cleaning cradle\'s stops on its way down the east face, by storey: 37, 33, 29, 25, 21, ?', answer: 17, hint: 'Four storeys at a time.' },
          { prompt: 'Lit windows on the facade, counted from the Saloma bridge as the cleaners switch floors off: 38, 37, 35, 32, 28, ?', answer: 23, hint: 'Take away 1, then 2, then 3 …' },
          { prompt: 'His daughter\'s calls to his phone after midnight, a running count by the hour: 1, 3, 6, 10, ?', answer: 15, hint: 'One more call each hour than the hour before.' },
        ],
      },
      evidence: {
        img: 'ev_c5_facade', hotspot: { x: 0.54, y: 0.43, r: 0.09 },
        title: 'A real storey',
        short: 'Menara Sinar has thirty-eight storeys of glass and thirty-seven buttons in its lifts. The fourteenth storey is real: a band of black glass with no lights. He landed 6.4 metres out, under its third bay, where one panel of black glass stands open a hand\'s width.',
        text: 'Count the storeys of glass from the pavement and you get thirty-eight. Count the buttons in the lifts and you get thirty-seven. In most towers in this city, 15 is just 14 with a luckier name. In Menara Sinar, 15 is the fifteenth storey, and the fourteenth is a band of black glass with no light behind it. The chalk puts Dato\' Rashid 6.4 metres out from the wall, under the third bay of the band. Through the photographer\'s long lens, one panel of black glass in that bay stands open by a hand\'s width. Nothing on 15 opens. The roof is set back eight metres. If he fell from anywhere, he fell from the floor that is not there.',
      },
    },
    {
      id: 'c5_03', phase: 'Jalan Ampang', title: 'One-twenty',
      game: 'hiddenobject', variant: 'list',
      brief: 'Menara Sinar\'s security control room is on B1: forty monitors, a logbook, a key cabinet and a desk that the Head of Security keeps very tidy for a man who was up all night. He lets you look, because Farah asks him to and because he wants to see what you look at. Find everything on your list. The thing he hoped you would not see will be there too.',
      params: { scene: 'desk', targets: 10, objects: 60 },
      evidence: {
        img: 'ev_c5_control', hotspot: { x: 0.58, y: 0.62, r: 0.13 },
        title: 'Fourteen minutes',
        short: 'The control-room log, in Zulkifli Hamid\'s hand: "01:20 Found Dato\' R. on pavement, Jalan Ampang side. 01:34 Called 999." Fourteen minutes alone with the body. And in the key cabinet, the hook marked BOMBA is empty.',
        text: 'The logbook is in the neat capitals of a man trained to write statements: "01:20. Rounds, Jalan Ampang side. Found Dato\' R. on pavement. No pulse. 01:34. Called 999. Z.H." Fourteen minutes between finding a director of the company dead and telling anyone. Under the desk a towel, still damp, and an umbrella still wet on Monday morning, though he says he never went out in the storm. In the key cabinet beside the monitors, one hook is empty. The label under it says BOMBA. Zulkifli Hamid, Head of Security, ex-Inspector, PDRM, says the fire brigade took their key back in March. Farah watches him say it. "He taught me to shoot," she tells you on the stairs. "At PULAPOL. He was the best I ever saw."',
      },
    },

    // ---------------- Menara Sinar ----------------
    {
      id: 'c5_04', phase: 'Menara Sinar', title: 'Sap sei',
      game: 'nonogram', variant: 'classic',
      brief: 'Wong Kam Fatt, 68, has serviced Menara Sinar\'s lifts since the tower opened in 1997, and he does not like it. In the motor room on the roof he draws on the back of a service sheet for you, in pencil squares, the thing he says he has never seen anybody use. Fill in his squares.',
      params: {
        solvedText: 'The picture resolves: an old brass key with a round head, the kind the fire brigade carries for lifts.',
        picture: [
          '..#####........',
          '.#######.......',
          '###...###......',
          '##.....########',
          '##.....########',
          '###...###..#.##',
          '.#######...#.##',
          '..#####....#...',
        ],
      },
      evidence: {
        img: 'ev_c5_bombakey', hotspot: { x: 0.48, y: 0.55, r: 0.10 },
        title: 'A third position',
        short: 'Lift 7, the firefighting lift, has a Bomba key switch with a third position filed in by hand: 14. Two keys were cut in 1997. One hung in the control room. The other belongs to the Office of the Chairman.',
        text: 'Uncle Wong unscrews the car panel in Lift 7, the firefighting lift. Behind it, the fire brigade\'s key switch has the usual two positions, and a third that somebody filed into the brass by hand: 14. "Two keys," he says. "Nineteen ninety-seven. One in the Bomba box in the control room. One for the Office of the Chairman. I have never turned it. I have never seen anybody turn it." He shows you Lift 7\'s log on his old laptop. On Sunday it stopped at 14 at 11:38 PM. Between 3:05 and 5:10 on Monday morning it ran between 14 and the loading bay twenty-three times.',
      },
    },
    {
      id: 'c5_05', phase: 'Menara Sinar', title: 'Last Sunday of the month',
      game: 'lineup', variant: 'single',
      brief: 'The lobby\'s visitor tablet lost Sunday night "in a software update". Bishnu Thapa, 41, has stood a night post for Kawalan Sentosa at Menara Sinar for six years and has never lost anything. He says he remembers faces, because faces are the only thing in the lobby that change. Show him faces, fast.',
      params: { rounds: 3, studySeconds: [10, 8, 6] },
      evidence: {
        img: 'ev_c5_visitor', hotspot: { x: 0.43, y: 0.33, r: 0.12 },
        title: 'A visitor for the Office of the Chairman',
        short: 'Bishnu picks the same face three times: a visitor for the Office of the Chairman at 10:40 PM on Sunday, who comes the last Sunday of every month. Superintendent Khairul Anuar, Farah\'s superior. He left by the car park at 11:52. Bishnu was moved off the loading bay at ten.',
        text: 'Bishnu picks him three times out of three, and the third time he does not need the full six seconds. "Last Sunday every month. Ten, half past ten. He says Office of the Chairman, I give him a badge, he goes up to fifteen. One hour, he goes down to the car park." On Sunday he came at 10:40 PM and badged out of B2 at 11:52. The face is Superintendent Khairul Anuar of Bukit Aman, who told Farah he spent Sunday night at home in Bangsar. And one more thing Bishnu wants written down: at ten o\'clock on Sunday he was moved off the loading bay post, which he has stood every Sunday for six years, and told to watch the lobby instead. Nobody watched the loading bay.',
      },
    },
    {
      id: 'c5_06', phase: 'Menara Sinar', title: 'Level 15',
      game: 'safecracker', variant: 'classic',
      brief: 'Dato\' Rashid\'s office is on Level 15, the directors\' floor, with a view of the twin towers and a desk drawer with a four-digit lock that Sinar\'s lawyers say contains company property. Ain has come up with you because nobody thought to stop her. She knows how her father chose numbers.',
      params: {
        digits: 4, tries: 8, bonus: 4, repeats: true,
        fixed: { 1: 1, 2: 9 },
        clue: 'Ain: "Abah used one number for every lock he ever owned. A year. He said it was the year he stopped being afraid. Nineteen something. He never told me which."',
      },
      evidence: {
        img: 'ev_c5_drawer', hotspot: { x: 0.41, y: 0.61, r: 0.13 },
        title: 'Two names for Level 14',
        short: 'In the drawer: a card in Dato\' Rashid\'s hand, "K.R. Sunday 11 PM. Loading bay. Stairs to 14. Bring nothing on paper." And an internal memo: Level 14 access is restricted to the Office of the Chairman and one keyholder, V. Chua, Secretary to the Chairman.',
        text: 'A tasbih, a photograph of Ain at her convocation, and two pieces of paper. The first is a card in her father\'s small upright hand: "K.R. Sunday 11 PM. Loading bay. Stairs to 14. Bring nothing on paper." The second is a one-page memo on Sinar letterhead, dated 1997 and re-issued every year since: "Aras 14 is a plant floor. Access is restricted to the Office of the Chairman. Keyholder: V. Chua, Secretary to the Chairman." Vivian Chua has been the Chairman\'s secretary for twenty-seven years. Ain reads the card twice. "K.R.," she says. "The man with the paper animals. He was taking him up."',
      },
    },
    {
      id: 'c5_jx', phase: 'Menara Sinar', title: 'WXY 1408',
      game: 'chase', variant: 'one-way',
      when: (flags) => !!flags.JASON_FREE,
      brief: 'On Monday afternoon a grey sedan comes up the ramp out of Menara Sinar\'s car park while you are standing at the top of it. WXY 1408. Jason Ooi is at the wheel in a driver\'s grey suit, and he sees you a second after you see him. He goes north into Chow Kit, where every lane is one way and every lane is full. He obeys the arrows. You do not have to.',
      params: { rounds: 2 },
      evidence: {
        img: 'ev_c5_sedan', hotspot: { x: 0.49, y: 0.60, r: 0.10 },
        title: 'The driver keeps things',
        short: 'Jason Ooi left WXY 1408 in a back lane off Jalan Raja Bot and ran. In the boot, in a clear bag: Dato\' Rashid\'s phone and his Menara Sinar keycard. Jason drives for the Office of the Chairman. He was told to drop the bag in the river. He did not.',
        text: 'You find the sedan with its engine still ticking in a back lane behind the Chow Kit market, between a fish lorry and a stack of durian crates. Jason Ooi is gone over the wall. In the boot, beside a driver\'s suit bag, a clear plastic bag holding a phone and a Menara Sinar keycard on a lanyard: Dato\' Rashid Osman\'s. The phone\'s call log has been wiped. Its last WhatsApp has not: 11:43 PM, to Ain, two words. Farah finds the sedan\'s registration on a list of Sinar company cars, under "Office of the Chairman: driver". Jason was told to drop the bag in the Klang river at Masjid Jamek. Jason keeps things. It is how he has stayed alive.',
      },
    },

    // ---------------- Level 14 ----------------
    {
      id: 'c5_07', phase: 'Level 14', title: 'Fire inspection',
      game: 'fusebox', variant: 'classic',
      brief: 'Farah cannot get a warrant for a floor that is not on the strata plan. Bomba can inspect any floor of any building in Kuala Lumpur for fire safety, at any hour. Penolong Penguasa Bomba Rosli arrives at 11 PM on Monday with his own key for Lift 7, and the lift stops at 14 with a sigh. The floor is black. Its breaker board has been tripped and scrambled so that every breaker you throw flips its neighbours. Turn them all on.',
      params: {
        size: 4, pattern: 'plus', presses: 6,
        clue: 'Uncle Wong, on the phone from the motor room: "Somebody did that on purpose. Nobody wants the lights on up there."',
      },
      evidence: {
        img: 'ev_c5_floor14', hotspot: { x: 0.53, y: 0.67, r: 0.11 },
        title: 'The floor that is not there',
        short: 'Level 14 is a whole floor: rows of steel archive shelving, every shelf empty, the dust still marked where boxes stood until Monday morning. A glass room in the middle. An office at the far end with one chair facing the window. On a bottom shelf, one box they missed: empty, labelled PORT KLANG 2021.',
        text: 'The tubes come on one row at a time, and the floor that is not there goes back further than the light. Steel archive shelving, row after row, every shelf bare, the dust marked in clean rectangles where boxes stood until somebody took them away in the small hours. Twenty-three trips of Lift 7. In the middle, a glass room full of cables. At the far end, an office with one desk, one chair turned to face the window, and nothing on the desk at all. On the bottom shelf of the last row, one box they missed, because it had been pushed to the back: empty, its label typed in capitals. PORT KLANG 2021. Rosli checks his station\'s key register while you look: the building\'s own Bomba key for Lift 7 was issued in 1997 and has never been handed back. Then he writes "storage of combustible material, no sprinklers" on his clipboard, very slowly, so that he has a reason to stay.',
      },
    },
    {
      id: 'c5_08', phase: 'Level 14', title: 'The listening room',
      game: 'wiretap', variant: 'classic',
      brief: 'The glass room in the middle of Level 14 is a telephone exchange in miniature: a patch panel of copper pairs, most of them cut on Monday morning, and three handsets on a bench. Whoever cut it was in a hurry. Turn the wiring back into one working circuit and see which lines still come in. Three handsets should ring.',
      params: {
        size: 6, targets: 3,
        clue: 'Every pair on the panel has a paper tag. The tags are older than the cuts.',
      },
      evidence: {
        img: 'ev_c5_listening', hotspot: { x: 0.50, y: 0.52, r: 0.12 },
        title: 'Every word',
        short: 'The paper tags on the cut pairs: 112 SEA ST, CMB. SERI KIARA 14. 96 LEB CHULIA. R. OSMAN, HP. Every line Sinar ever tapped lands here. One relay is still live, with a tag in the same hand: BALA, BRICKFIELDS.',
        text: 'The tags on the dead pairs read like a map of the last year of your life. 112 SEA ST, CMB: Yogi\'s shop line, cut in Colombo when Herath found the relay. SERI KIARA 14: Henry Goh\'s flat in Mont Kiara. 96 LEB CHULIA: Uncle Lim\'s workshop. R. OSMAN, HP: Dato\' Rashid\'s mobile, so whoever sat in this room on Saturday night heard him say "Sunday, eleven, loading bay" to the kancil man. One relay on the panel is still connected, its green light still on, and its tag is in the same tidy hand: BALA, BRICKFIELDS. The telephone on the wall by Bala Anne\'s till. The one you use when your own is off. Under the bench, forgotten because it is older than everything else on the floor, an old desk call recorder is still recording.',
      },
    },
    {
      id: 'c5_09', phase: 'Level 14', title: 'The cradle door',
      game: 'mirrors', variant: 'classic',
      brief: 'A corridor runs along the inside of the black glass behind the shelving, for the men who service the window-cleaning cradle. It is the only thing on Level 14 still on its own battery: a laser alarm across the corridor that locks every door on the floor if the beam leaves its sensor. Rosli has the small mirrors from his torch kit. Keep the beam on its sensor while you walk through.',
      params: {
        size: 6, mirrors: 4, relays: 1, obstacles: 6,
        clue: 'The beam must cross the relay by the cradle door. Whoever went through here on Sunday knew where to stand.',
      },
      evidence: {
        img: 'ev_c5_cradle', hotspot: { x: 0.46, y: 0.72, r: 0.09 },
        title: 'A cufflink on the sill',
        short: 'The only glass on Level 14 that opens is the cradle door, a tall panel that swings out for the window cleaners and is opened with the cradle key. Blood on its frame at waist height. On the sill, a broken gold cufflink, the twin of the one on Dato\' Rashid\'s right cuff. The cradle key was signed out at 23:35 on Sunday by Z.H.',
        text: 'The cradle door is a full-height panel of black glass that swings outward so that the window cleaners\' cradle can be serviced from inside. It opens only with the cradle key, and it is open now by a hand\'s width, the gap the photographer saw from the street. On the aluminium frame at waist height, a smear of dried blood. On the sill, a gold cufflink with its post snapped, the twin of the one Dang Wangi bagged from Dato\' Rashid\'s right wrist. You go down to B1 and read the key cabinet log yourself. Cradle key, out 23:35 Sunday, in 01:12 Monday. Signed Z.H. Purpose: "Storm check, roof." The cradle on the roof has its own key. Nobody needs this one unless they are on 14.',
      },
    },
    {
      id: 'c5_10', phase: 'Level 14', title: 'The director first',
      game: 'shredder', variant: 'classic',
      brief: 'Somebody emptied a whole floor of files in two hours and did not think to empty a bin. Beside the printer in the glass room, the shredder\'s basket is full of one night\'s strips. The Office of the Chairman does not send orders to telephones; it prints them up here, and somebody comes for them. One printed page went through last. Some strips went in the wrong way up.',
      params: {
        title: 'SINAR HOLDINGS BERHAD',
        text: 'OFFICE OF THE CHAIRMAN\n\nTo: Z.H., Security\nSunday, 21:40\n\nThe director meets the\nMalaysian at eleven.\nLoading bay. Floor 14.\n\nLet them both come up.\nThe director first.\nThen the kancil.\n\nNothing on the phones.',
        strips: 10,
        flips: true,
        stamp: 'PRIVATE',
        clue: 'The printer\'s job log is still on its little screen. Sunday, 21:40, sent from outside the building.',
      },
      evidence: {
        img: 'ev_c5_order', hotspot: { x: 0.47, y: 0.48, r: 0.17 },
        title: 'Then the kancil',
        short: 'An order from the Office of the Chairman to "Z.H., Security", Sunday 21:40: "The director meets the Malaysian at eleven. Loading bay. Floor 14. Let them both come up. The director first. Then the kancil." The printer log: sent by user VCHUA from outside the building, collected at 22:02 with Z. Hamid\'s badge.',
        text: '"Let them both come up. The director first. Then the kancil. Nothing on the phones." The same voice as the email that went to Colombo before Yogi drowned: the valuer first, then the book. The printer\'s job log keeps the rest. Sent at 21:40 on Sunday by user VCHUA, from a connection outside the building. Released at the printer at 22:02 by badge Z. HAMID. The shredder ran at 22:05. Vivian Chua has told Farah she was at home in Bukit Tunku from nine. Perhaps she was, at 21:40. The order was waiting for the man who came to collect it.',
      },
    },
    {
      id: 'c5_zi', phase: 'Level 14', title: 'Your floor, Zul',
      game: 'interrogation', variant: 'classic',
      brief: 'At a quarter to one Farah sends for the Head of Security, and Zulkifli Hamid comes up in Lift 7 as if he has done it a hundred times. She sits him in the only chair on Level 14, the one that faces the window, and stands behind him. He was a police officer for twenty years. He knows how this goes, and he knows you have exhibits. One thing he tells you is not true. Find it, and put the exhibit that breaks it in front of him.',
      params: {
        setting: 'The office with one chair, Level 14, Menara Sinar. Tuesday, 12:50 AM.',
        suspect: {
          id: 'zul', voice: 'voice_2', name: 'Zulkifli Hamid', role: 'Head of Security, Menara Sinar, 47',
          persona: 'Ex-police: short, polite, procedural sentences, as if dictating a statement. Calls Farah "Inspector" and never her name, says "betul" and "tak ada" and "Tuan" out of habit, and tells times to the minute. Gets stiff and quiet when anybody suggests he left the force in disgrace or that he would lie to the woman he taught to shoot; when pressed, he touches the side of his neck above the collar.',
        },
        facts: [
          { id: 'f1', topic: 'his job', claim: 'I have run security at Menara Sinar since 2018. Before that, twenty years in PDRM.' },
          { id: 'f2', topic: 'Inspector Farah', claim: 'I taught the Inspector to shoot at PULAPOL. She was the best of her intake.' },
          { id: 'f3', topic: 'finding the body', claim: 'I found Dato\' Rashid at 1:20 on the Jalan Ampang side, after the rain stopped, and I logged it.' },
          { id: 'f4', topic: 'the 999 call', claim: 'I called 999 at 1:34. I wrote the time in the log myself.' },
          { id: 'f5', topic: 'the night guards', claim: 'The night guards are Kawalan Sentosa. Bishnu has stood posts here for six years. A good man.' },
          { id: 'f6', topic: 'Dato\' Rashid', claim: 'Dato\' Rashid parked on B2 just before eleven. He often came in on Sunday nights to work alone.' },
          { id: 'f7', topic: 'the plans', claim: 'On every plan this building has, fourteen is a plant floor. I do not draw the plans.' },
        ],
        lies: [
          { id: 'l1', topic: 'the Bomba key', claim: 'Bomba took their key for Lift 7 back in March. That hook has been empty since then.', truth: 'Bomba never took the building\'s key back. Zul kept it and used it to run Lift 7 to fourteen on Sunday night.', exposedBy: 'e2' },
          { id: 'l2', topic: 'the cradle key', claim: 'I signed out the cradle key for a storm check on the roof. The cradle was swinging in the wind.', truth: 'The roof cradle has its own key. The key he signed out opens only the cradle door on Level 14.', exposedBy: 'e3' },
          { id: 'l3', topic: 'the loading bay', claim: 'Nobody moved Bishnu. He asked for the lobby on Sunday because of his knee.', truth: 'Zul had Bishnu taken off the loading bay post at ten so that the kancil man could walk in.', exposedBy: 'e4' },
          { id: 'l4', topic: 'Level 14', claim: 'I have never been up to fourteen. My card does not open it, and I have no business there.', truth: 'He collected the Chairman\'s printed order from the Level 14 printer at 22:02 with his own badge, and went back up before 11:47.', exposedBy: 'e5' },
        ],
        evidence: [
          { id: 'e1', title: 'Fourteen minutes', text: 'The control-room log in his own hand: found Dato\' Rashid at 01:20, called 999 at 01:34.' },
          { id: 'e2', title: 'Bomba\'s register', text: 'Penolong Penguasa Rosli\'s key register: the building\'s own Bomba key for Lift 7 was issued in 1997 and has never been handed back.' },
          { id: 'e3', title: 'The cradle door', text: 'The cradle on the roof has its own key. The cradle key signed out at 23:35 opens only the cradle door on Level 14.' },
          { id: 'e4', title: 'Off the loading bay', text: 'Bishnu Thapa was moved off the loading bay post at ten on Sunday and told to watch the lobby. He had stood that post every Sunday for six years.' },
          { id: 'e5', title: 'Released with his badge', text: 'The Level 14 printer\'s job log: the Office of the Chairman\'s order, sent at 21:40, was released at the printer at 22:02 by badge Z. HAMID.' },
          { id: 'e6', title: 'A real storey', text: 'Menara Sinar has thirty-eight storeys of glass and thirty-seven buttons in its lifts. The fourteenth storey is real.' },
        ],
        secret: 'He pushed Dato\' Rashid out of the cradle door at 11:47 on the Office of the Chairman\'s order, and at 1:20 he closed the dead man\'s fingers over the paper kancil.',
        suggested: [
          'How do you know Inspector Farah?',
          'When did you find Dato\' Rashid, and why wait to call?',
          'What happened to the Bomba key?',
          'Why did you sign out the cradle key?',
          'Who moved Bishnu off the loading bay?',
          'Have you ever been up to fourteen?',
          'Why was Dato\' Rashid here on a Sunday?',
        ],
        maxQuestions: 14,
        clue: 'Farah, behind the chair: "Your floor, Zul. You have never seen it. Tell us about it anyway."',
      },
      evidence: {
        img: 'ev_c5_locker', hotspot: { x: 0.49, y: 0.43, r: 0.10 },
        title: 'A jacket in the rain',
        short: 'Caught in one lie, Zul asks for a lawyer, and Farah asks for his locker. Inside: the building\'s Bomba key for Lift 7 on its red tag, black leather gloves, and his suit jacket, still damp across the shoulders a day later. He wore it somewhere on Sunday night that the storm could reach him.',
        text: 'Zul stops answering in the middle of a sentence and asks, very politely, for a lawyer, and Farah, just as politely, asks for the key to his locker on B1. Inside it, on a hook on the door, the brass Bomba key for Lift 7 on a red tag: the key the fire brigade "took back in March". On the shelf, a pair of black leather gloves, the kind that leave smears instead of prints on an aluminium latch. And on a hanger, the dark suit jacket he wore on Sunday, still damp across the shoulders and down the right sleeve more than a day later. He says he never went out in the storm. Something on Sunday night held him in the rain long enough to soak through. The cradle door on Level 14 opens outward into the weather.',
      },
    },
    {
      id: 'c5_11', phase: 'Level 14', title: 'Lights across the river',
      game: 'morse', variant: 'visual',
      brief: 'The office at the end of Level 14 has one chair, turned to face the window. Sit in it, as the Chairman must have, and you are looking north-west across the river at the low roofs of Kampung Baru. In an upstairs window over there, a small flame is going on and off. Somebody saw the lights come on in the floor that is not there. Copy down what the flame says.',
      params: { difficulty: 'medium' },
      evidence: {
        img: 'ev_c5_window', hotspot: { x: 0.44, y: 0.25, r: 0.08 },
        title: 'Late',
        short: 'The flame is a lighter in the third window of a wooden house above a warung on Jalan Raja Muda Musa, Kampung Baru, and it spells LATE, then SORRY, and goes out. Beside the Chairman\'s chair a brass telescope is bolted to the floor. It points south-west, at your office window in Brickfields.',
        text: 'Short, long, a lid snapping open and shut: the flame is a flip-top lighter, held in the third upstairs window of a wooden house above a warung on Jalan Raja Muda Musa, across the Saloma bridge. It spells L-A-T-E, and then S-O-R-R-Y, and then the window is dark. He saw the lights come on and knew who would be sitting in that chair. Beside the chair a brass telescope on a tripod is bolted to the floor, too heavy to carry out with the files. It is not pointed at Kampung Baru. It is pointed south-west. When you put your eye to it, your own office window above Restoran Bala fills the lens, with your desk lamp still on.',
      },
    },
    {
      id: 'c5_bk', phase: 'Level 14', title: 'Ticket 0414',
      game: 'kakuro', variant: 'classic',
      when: (flags) => !!flags.BOOK_LOST,
      brief: 'The Chairman\'s desk has one drawer, and the drawer has one thing in it, left where somebody who knew what it was would find it: a carbon book of gem certificates from 112 Sea Street. Yogi checked every page of his own figures with little cross-sums in the margins, rows and columns, the way his father taught him. Somebody has inked over the figures. The sums in the margins survive. Put the figures back.',
      params: { difficulty: 'medium' },
      evidence: {
        img: 'ev_c5_carbonbook', hotspot: { x: 0.54, y: 0.61, r: 0.10 },
        title: 'The last page, torn out',
        short: 'Yogi\'s carbon book, collected from Colombo Fort with ticket 0414 by a man with a sun on his shirt, ended up in the Chairman\'s desk. Sixty-one certificates, every true value restored. The last page, his confession naming the Office of the Chairman, has been torn out.',
        text: 'Sixty-one certificates in six years, and beside every one, in Yogi\'s small careful Tamil, what the stone was really worth: now legible again, row by row, from his own cross-sums. The pink cloakroom ticket, no. 0414, is still tucked in the spine where the man from Bloemendhal left it when he collected the parcel. Only one page is missing. The stub of the last page is torn close to the binding, the page where Yogi wrote, in English, for whom every valuation was made. The Chairman kept the book and threw away the one sentence that named his office. Farah photographs every page anyway and sends them to Herath, who replies in one line: "He would be glad somebody can read his hand."',
      },
    },
    {
      id: 'c5_12', phase: 'Level 14', title: 'Eleven forty-four',
      game: 'dialtone', variant: 'classic',
      brief: 'The old desk recorder under the patch panel has kept the last of Dato\' Rashid\'s mobile on its little hard disk: Sunday, 11:44 PM, an outgoing call. Eleven tones, typed fast, and a few seconds of a man whispering. His phone is gone. The telco will need a court order. You have the tape.',
      params: {
        digits: 11, number: '01127403916', noise: 0.25,
        clue: 'Malaysian mobiles start 01. He dialled it from memory, fast, the way you dial a number you have been told never to save.',
      },
      evidence: {
        img: 'ev_c5_recorder', hotspot: { x: 0.41, y: 0.29, r: 0.12 },
        title: '"Jangan naik"',
        short: 'At 11:44 PM, three minutes before he fell, Dato\' Rashid rang a prepaid number bought in Chow Kit and last seen on a mast in Kampung Baru, and whispered: "Dia dah sampai. Jangan naik. Pergi." He is here. Do not come up. Go.',
        text: '011-2740 3916: a prepaid SIM sold for cash at a phone stall on Jalan Tuanku Abdul Rahman, used for nine days, always from the same mast in Kampung Baru. The call lasts nine seconds. A door, somewhere close to the phone, and Dato\' Rashid\'s voice, very low: "Dia dah sampai. Jangan naik. Pergi." He is here. Do not come up. Go. Then the line closes. The recorder\'s index holds the same number once more, Saturday at 9:12 PM: "Sunday, eleven. Loading bay." Whoever sat in the glass room knew the time and the place a day before. And at the end, with three minutes left, the man they were waiting for told the other one to run.',
      },
    },

    // ---------------- Kampung Baru ----------------
    {
      id: 'c5_13', phase: 'Kampung Baru', title: 'Two teh',
      game: 'witness', variant: 'statement',
      brief: 'Across the Saloma bridge, Kampung Baru is wooden houses on stilts, mango trees, a mosque and the smell of coconut rice, with the towers of KLCC standing over it like visitors who never leave. The house with the third window is above Mak Teh\'s warung on Jalan Raja Muda Musa. Mak Teh has fed Kampung Baru since 1979. She will tell it once.',
      params: {
        readSeconds: 100,
        pass: 7,
        header: 'Statement of Fatimah binti Daud ("Mak Teh"), 64. Warung Mak Teh, Jalan Raja Muda Musa, Kampung Baru. Recorded Tuesday, 3:30 PM.',
        introLine: 'Mak Teh wipes her hands on her kain and sits down across the table from you. "Sekali saja. The rice will not cook itself."',
        retryLine: 'Mak Teh tuts, pushes a fresh glass of teh at you, and starts again from the top.',
        statement: [
          'I have sold nasi lemak on this street since 1979. From my steps you can see all their towers, the twin ones and the one with the sun. They built them in my lifetime and they will knock them down in yours. Kampung Baru will still be here.',
          'He took the room upstairs nine days ago. Tall, very polite, a cap. Indian, but his Malay is better than my grandson\'s. He paid two weeks in cash and asked me never to write his name down. So I did not.',
          'On Sunday night he went out at half past ten, towards the bridge. He came back at ten past twelve, wet through, like a man who had walked into the river. I gave him a towel. He asked for two teh. One for him and one for a friend who was not coming.',
          'He sat at the window upstairs until Subuh, looking at the sun tower. All night he had a silver lighter in his hand, the kind with a lid. Open, shut. Open, shut. He never lit it. He does not smoke.',
          'At Subuh he came down with his bag and said, Mak, if men in shirts with a little sun on them come asking, you have never seen me. Then he went. He is not coming back. That is all I know.',
        ],
        questions: [
          { q: 'When did he take the room?', options: ['Two days ago', 'Nine days ago', 'A month ago', 'On Sunday'], a: 1 },
          { q: 'How did he pay?', options: ['By card', 'He did not pay', 'Two weeks in cash', 'By the night'], a: 2 },
          { q: 'When did he go out on Sunday night?', options: ['Ten o\'clock', 'Half past ten', 'Eleven o\'clock', 'Midnight'], a: 1 },
          { q: 'Which way did he go?', options: ['Towards Chow Kit', 'Towards the mosque', 'Towards the bridge', 'Towards the station'], a: 2 },
          { q: 'When did he come back?', options: ['Half past eleven', 'A quarter to twelve', 'Ten past twelve', 'Half past one'], a: 2 },
          { q: 'What did he ask for?', options: ['Nasi lemak', 'Two teh', 'Kopi O', 'Only a towel'], a: 1 },
          { q: 'Where did he sit until Subuh?', options: ['On the steps', 'At the warung table', 'At the window upstairs', 'On the bridge'], a: 2 },
          { q: 'What did he hold all night?', options: ['A phone', 'A paper kancil', 'A silver lighter he never lit', 'A prayer mat'], a: 2 },
          { q: 'Who did he tell her to look out for?', options: ['The police', 'Men in shirts with a little sun on them', 'A woman with a press card', 'Nobody'], a: 1 },
        ],
      },
      evidence: {
        img: 'ev_c5_warung', hotspot: { x: 0.53, y: 0.63, r: 0.17 },
        title: 'Ten past twelve',
        short: 'K. Rajan rented the room over Mak Teh\'s warung, across the Saloma bridge from Menara Sinar. On Sunday he went out at 10:30, came back at 12:10 soaked through, asked for two teh, and sat at the window with a silver lighter until dawn. Mak Teh says he left at Subuh on Monday and is not coming back.',
        text: 'He went out at 10:30 towards the Saloma bridge and came back at 12:10, wet through, twenty-three minutes after Dato\' Rashid went out of the cradle door. Two glasses of teh, one for a friend who was not coming. Then the window, and the tower, and a silver lighter opening and shutting until the call to Subuh, at a quarter to six. At 1:20, when Zulkifli Hamid was "finding" a body on Jalan Ampang, the kancil man was at a window in Kampung Baru, two kilometres away across a river, in front of a woman who had given him a towel. Mak Teh says he left at dawn on Monday and will not be back. She says it looking at her hands.',
      },
    },
    {
      id: 'c5_14', phase: 'Kampung Baru', title: 'Mak Teh\'s book',
      game: 'quickmath', variant: 'receipts',
      brief: 'Mak Teh\'s granddaughter Mira, fifteen, does the warung\'s accounts on carbon order pads after school, and she is proud of them and does not lie as well as her grandmother. She shows you the week. Check her slips against the till before the dinner crowd comes.',
      params: { difficulty: 'medium' },
      evidence: {
        img: 'ev_c5_receipts', hotspot: { x: 0.56, y: 0.66, r: 0.12 },
        title: 'Two teh, upstairs',
        short: 'Mira\'s order pad: "2 teh tarik bungkus. Naik atas." Two teh to take upstairs, every night at eleven since Sunday, Monday and Tuesday included. Somebody is still in the room above the warung, and Mak Teh is still carrying his tea.',
        text: 'Every slip adds up, to the sen, and every night has the same line in Mira\'s round schoolgirl hand: "2 teh tarik bungkus. Naik atas. 11.00." Two teh in plastic bags with string handles, to take upstairs. Sunday. Monday. Tuesday. Mira looks at the line and then at her grandmother in the kitchen doorway, and goes red to the ears. Mak Teh does not move. "He asked me," she says. "Orang baik. A good man asked me. I am sixty-four, I know what a good man looks like." She does not say which way the stairs go, and you do not go up them. Wherever you go, they go.',
      },
    },

    // ---------------- Jalan Pahang ----------------
    {
      id: 'c5_15', phase: 'Jalan Pahang', title: 'A dead man\'s thumb',
      game: 'fingerprint', variant: 'classic',
      brief: 'The service stairs of Menara Sinar run from the loading bay to the roof in a concrete shaft that nobody cleans above the fifth floor. On the steel handrail at the landing between 13 and 14, under the dust, there is one clear thumb. The forensic lab at Hospital Kuala Lumpur, on Jalan Pahang, runs it for Farah overnight. Classify it, then find its owner.',
      params: {
        liftLabel: 'Lift: steel handrail, service stair B, landing between 13 and 14',
        liftAria: 'Partial thumbprint lifted from a dusty steel stair rail',
        candidates: [
          { id: 'rashid', name: 'Rashid Osman' },
          { id: 'zul', name: 'Zulkifli Hamid' },
          { id: 'bishnu', name: 'Bishnu Thapa' },
          { id: 'wong', name: 'Wong Kam Fatt' },
          { id: 'khairul', name: 'Khairul Anuar' },
          { id: 'vivian', name: 'Vivian Chua' },
          { id: 'siti', name: 'Siti Aminah (night cleaner)' },
          { id: 'daniel', name: 'Daniel Raj (agency licence, 2016)' },
        ],
        answer: 'daniel',
      },
      evidence: {
        img: 'ev_c5_railprint', hotspot: { x: 0.55, y: 0.39, r: 0.10 },
        title: 'As high as he got',
        short: 'The thumb on the stair rail is in the Home Ministry\'s file for a private agency licence issued in 2016 to two partners in Brickfields: Daniel Raj. The same thumb Herath lifted from a water glass in Room 14, Kotahena. It is on the landing between 13 and 14, and no higher.',
        text: 'The match comes back from the Home Ministry\'s licensing file, the one every private investigator in the country gives ten fingers to: a private agency licence, issued 2016, two partners, Brickfields. One of the two cards is yours. The other is Daniel Raj\'s, buried in Cheras in August 2021. It is the same thumb Herath lifted from a water glass in Room 14 at the New Sea View Lodge. Farah reads the printout twice and then folds it into her pocket instead of the file. The thumb is on the landing between 13 and 14, pressed hard, the way a man grips a rail when he stops climbing suddenly. There is nothing of him on the flight above. It is as high as he got.',
      },
    },
    {
      id: 'c5_16', phase: 'Jalan Pahang', title: 'Dry paper',
      game: 'dna', variant: 'mixed',
      brief: 'Dr. Leela Nair, forensic pathologist at Hospital Kuala Lumpur, did the post-mortem on Monday afternoon with Superintendent Khairul\'s note on her desk asking her to be quick. She was not quick. She scraped under the fingernails, and she photographed the hand before Dang Wangi opened it. Read her bands.',
      params: { suspects: 7 },
      evidence: {
        img: 'ev_c5_nails', hotspot: { x: 0.48, y: 0.60, r: 0.12 },
        title: 'Dry paper',
        short: 'The skin under Dato\' Rashid\'s nails is Zulkifli Hamid\'s; Zul has a fresh scratch down his neck that he says is his cat. And the kancil in the dead man\'s fist is dry. He lay in the storm for an hour and a half. The paper was put into his hand after the rain stopped.',
        text: 'Defence injuries, Dr. Nair writes, and underlines it: tissue under the nails of the right hand. The tissue is Zulkifli Hamid\'s. When Farah asks him to loosen his collar in the control room there is a scratch from his ear to his collarbone, four days old; he says his cat does not like the rain. Then the hand. The shirt cuff around it was soaked through, the skin wrinkled with water, and the paper kancil inside the fingers was dry and crisp, its folds still sharp. "He lay in that storm for ninety minutes," Dr. Nair says. "Nothing in his hand stayed dry. Somebody closed his fingers over that paper after the rain stopped, hard enough to leave the marks of their own fingers on the backs of his." The rain stopped at 1:10. Zul found him at 1:20.',
      },
    },

    // ---------------- Back at Menara Sinar ----------------
    {
      id: 'c5_17', phase: 'Back at Menara Sinar', title: 'Parking mode',
      game: 'getaway', variant: 'classic',
      brief: 'Dato\' Rashid\'s Mercedes is still in its bay on B2, and Farah\'s warrant covers the car but not the car park. By Tuesday night the directors have boxed it in with their own cars, the valet has gone home with every key but one, and Zul\'s men are watching from the lift lobby. Get it to the ramp before somebody telephones Level 15.',
      params: {
        difficulty: 'hard', target: 'RASHID\'S CAR',
        clue: 'Cars only go forwards and back. The exit ramp is on the right. Zul has told the valet to take his time.',
      },
      evidence: {
        img: 'ev_c5_dashcam', hotspot: { x: 0.53, y: 0.58, r: 0.10 },
        title: 'Two cars on B2',
        short: 'The Mercedes\' dashcam records in parking mode. 11:25 PM: Vivian Chua walks from her car to the lift lobby with an unopened umbrella. 11:41 to 11:52: Superintendent Khairul sits in his car under the interior light, counting fifties from an envelope, then drives out. 12:40: Vivian is driven away. 3:05 AM: a Sinar Cold Chain reefer van backs down to the loading bay.',
        text: 'The dashcam wakes for anything that moves. 10:58 PM: Dato\' Rashid parks and sits in the dark for six minutes before he gets out. 11:25: a woman with silver in her hair walks from the car in bay V-01, reserved for the Office of the Chairman, to the lift lobby, carrying an umbrella she has no need to open. Vivian Chua, at home in Bukit Tunku. 11:41: a heavyset man in a batik shirt gets into a police-pool Perdana, switches on the interior light and counts a stack of fifties out of a brown envelope, twice. At 11:47, when Dato\' Rashid goes out of the cradle door sixteen floors above him, Superintendent Khairul is licking his thumb. He drives out at 11:52. At 12:40 the woman comes back and is driven away in the back of a grey car. At 3:05 AM a white reefer van with a small sunburst on the door backs down the ramp to the loading bay and stays until ten past five.',
      },
    },

    // ---------------- Chow Kit ----------------
    {
      id: 'c5_18', phase: 'Chow Kit', title: 'Cold room, Jalan Raja Bot',
      game: 'searchlight', variant: 'classic',
      brief: 'The reefer van\'s GPS was not unplugged this time, because nobody thought anybody would ask. On Monday morning it went eight minutes up Jalan Tuanku Abdul Rahman to a Sinar Cold Chain cold room behind the Chow Kit market, among the fish and the flowers. The cold room\'s lights are cut. The night traders lend you their lamps. Light every aisle, and do not let one lamp shine into another, or the fish man will complain.',
      params: {
        size: 8, walls: 'low',
        clue: 'The numbered pallets say how many lamps stand right beside them. A lamp lights its row and its column until a pallet stops it.',
      },
      evidence: {
        img: 'ev_c5_coldroom', hotspot: { x: 0.50, y: 0.68, r: 0.12 },
        title: 'Gudang 6',
        short: 'Floor 14\'s archive spent thirty hours in a fish cold room in Chow Kit and went on by lorry on Tuesday night. The delivery log: "MS-14 to Gudang 6, Pulau Indah". One carton fell behind a pallet: the files of the police officers Sinar pays, a photograph and a monthly figure each. The top file is Khairul Anuar\'s.',
        text: 'Frost on the steel, bare pallets, and the dust from Level 14 drying on the cold-room floor in the same clean rectangles. The delivery log on its hook by the door, in a driver\'s capitals: "Mon 03:40 in, 112 ctn, MS-14. Tue 23:00 out, 111 ctn, to Gudang 6, Pulau Indah." Warehouse 6. Port Klang. One carton slid behind a pallet and froze to the floor. Inside, a drawer\'s worth of files from the archive: PDRM. A name, a rank, a photograph and a monthly figure, one officer to a folder, in alphabetical order. The top folder, because his name begins with K and the A to J folders went with the lorry, is Superintendent Khairul Anuar. RM 8,000 a month since 2019, collected in person.',
      },
    },
    {
      id: 'c5_rz', phase: 'Chow Kit', title: 'The roster',
      game: 'alibi', variant: 'classic',
      when: (flags) => !!flags.RIZAL_FREE,
      brief: 'Kawalan Sentosa, the guard company that stands the night posts at Menara Sinar, has its Kuala Lumpur office above a shoe shop on Jalan Raja Bot. Its regional manager is Rizal Hamdan, the night guard from Mont Kiara, in a better shirt. He will hand over Sunday\'s roster if you clear the alibis of three of his guards first. Every one of them has a receipt, and every receipt is lying about something.',
      params: { rounds: 3 },
      evidence: {
        img: 'ev_c5_roster', hotspot: { x: 0.45, y: 0.58, r: 0.15 },
        title: 'Countersigned R. Hamdan',
        short: 'Sunday\'s roster: the loading bay post struck through at 10 PM, "guard to lobby, instruction of Head of Security", countersigned R. Hamdan. The loading bay was left empty on purpose. They wanted the kancil man to come in.',
        text: 'The roster for Menara Sinar, Sunday night, in Kawalan Sentosa\'s blue ink. Loading bay, 22:00 to 06:00, B. Thapa: struck through in red at 22:00, "guard to lobby, instruction of Head of Security", countersigned R. Hamdan. Nobody has ever moved that post before. Somebody wanted the loading bay empty for exactly the hour a man in a cap would come in out of the rain. Rizal reads the line upside down across his desk and does not try to explain it. "Seventeen minutes, last time," he says, to nobody. "This time it was eight hours."',
      },
    },

    // ---------------- Bukit Aman ----------------
    {
      id: 'c5_19', phase: 'Bukit Aman', title: 'The Port Klang account',
      game: 'ledger', variant: 'classic',
      brief: 'Ain brings her father\'s old laptop to Bukit Aman in a supermarket bag. On it, synced to a sheet that lives somewhere on Level 14, is the Port Klang account: the money Sinar spends where auditors cannot see. Every Saturday he printed the totals and put them in a drawer at home. At 4:12 AM on Monday somebody logged in from inside Menara Sinar and changed three cells. Find them, and put back what they said.',
      params: {
        rows: 6, cols: 5, altered: 3, restore: true, currency: 'RM', magnitude: 'thousands',
        rowLabels: ['Undiyal, Colombo', 'Heritage, Penang', 'Logistics', 'Consultancy', 'Security', 'Hospitality'],
        colLabels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'],
        clue: 'The printed totals are from Saturday, in his hand. The cells were changed on Monday, before dawn, after he was dead.',
      },
      evidence: {
        img: 'ev_c5_account', hotspot: { x: 0.37, y: 0.42, r: 0.12 },
        title: 'Paid in advance',
        short: 'Restored: "Security", Saturday, RM 50,000 to Z.H., approved V.C. "Logistics", Saturday, a Cold Chain van booked for 3 AM Monday. "Consultancy", RM 8,000 to K.A., as every month. The killing, and the emptying of the floor, were paid for the day before.',
        text: 'Put back, the three cells tell the week the way Dato\' Rashid wrote it down on Saturday afternoon, the last time he ever did. "Security": RM 50,000 cash to Z.H., approved V.C. "Logistics": one Sinar Cold Chain reefer van, Menara Sinar loading bay, 03:00 Monday, approved V.C. Both booked a day before anything happened. And "Consultancy": RM 8,000 to K.A., as in every month since 2019. Ain reads her father\'s columns standing up. "He wrote down everything," she says. "Even this. Even his own murder, in advance, in the right column." Then she sits down, and Farah brings her a teh tarik from the canteen, and nobody says anything for a while.',
      },
    },
    {
      id: 'c5_20', phase: 'Bukit Aman', title: 'Eleven forty-seven',
      game: 'timeline', variant: 'cctv',
      brief: 'Farah borrows an empty incident room on the fourth floor of Bukit Aman, two floors below her superintendent, and pins Sunday night to the wall: a visitor tablet, a car park barrier, a door sensor, a dashcam, a key cabinet, a call recorder, a stair camera and a taxi driver who did not stop. Eight frames, out of order, some clocks smudged. Put them in order.',
      params: {
        frames: [
          { id: 'a', clock: '22:40', title: 'Lobby visitor tablet', text: 'A heavyset man in a batik shirt, for the Office of the Chairman. Badge V-07. He goes up to fifteen.' },
          { id: 'b', clock: '22:5▮', title: 'B2 barrier, bay D-03', text: 'Dato\' Rashid\'s Mercedes in. He sits in the dark for six minutes before he gets out.' },
          { id: 'c', clock: '23:2▮', title: 'Loading bay door sensor', text: 'Door held open with a wedge. A man in a cap comes in out of the rain and takes service stair B.' },
          { id: 'd', clock: '23:25', title: 'Dashcam, bay D-03', text: 'A woman with silver hair walks from bay V-01 to the lift lobby, carrying an umbrella she does not open.' },
          { id: 'e', clock: '23:3▮', title: 'Key cabinet, B1', text: 'Cradle key out. Z.H. "Storm check, roof."' },
          { id: 'f', clock: '23:44', title: 'Call recorder, Level 14', text: 'Eleven tones, then a whisper: "Dia dah sampai. Jangan naik. Pergi."' },
          { id: 'g', clock: '▮▮:46', title: 'Stair B camera, Level 9', text: 'A man in a cap going down three steps at a time, one hand on the rail, a minute before anybody falls.' },
          { id: 'h', clock: '23:4▮', title: 'Taxi dashcam, Jalan Ampang', text: 'Through the rain on the windscreen, something comes down past the black glass. The driver brakes, and then drives on.' },
        ],
        order: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        solvedText: 'The night plays in order. The man in the cap is running down the stairs when Dato\' Rashid goes out of the window above him.',
      },
      evidence: {
        img: 'ev_c5_nightboard', hotspot: { x: 0.51, y: 0.50, r: 0.12 },
        title: 'Running down',
        short: 'Khairul went up at 10:40. Rashid parked at 10:58. The kancil man came in by the loading bay at about 11:20; Vivian Chua at 11:25. Zul took the cradle key at 11:35. At 11:44 Rashid told the kancil man to run, and at 11:46 he was running down past Level 9. At 11:47 Rashid fell.',
        text: 'At 10:40 the superintendent went up to fifteen for his envelope. At 10:58 Dato\' Rashid parked and sat in the dark. At about 11:20 a man in a cap came in by the loading bay that nobody was guarding and started climbing. At 11:25 the Chairman\'s secretary walked to the lifts. At 11:35 the Head of Security took a key nobody needs except on 14. At 11:44 the director whispered into his phone: do not come up, go. At 11:46 the man in the cap was going down past Level 9 three steps at a time. At 11:47 a taxi driver on Jalan Ampang saw something come down past the black glass, and was frightened, and drove on.',
      },
    },
    {
      id: 'c5_21', phase: 'Bukit Aman', title: 'Everyone at 11:47',
      game: 'logicgrid', variant: 'classic',
      brief: 'Before anybody is brought into an interview room, Farah wants the minute on one page: five people, five places, five things in their hands at 11:47 PM on Sunday. She draws the grid with a ruler, because Superintendent Khairul is one of the five and she wants nobody to say she guessed.',
      params: {
        categories: [
          { name: 'Person', items: ['Zul', 'Vivian', 'Khairul', 'Rajan', 'Ain'] },
          { name: 'Location', items: ['Car park B2', 'Newsroom, Bangsar South', 'Level 14, cradle door', 'Stair B, Level 9', 'Level 14, glass room'] },
          { name: 'Holding', items: ['Silver lighter', 'Brown envelope', 'Headphones', 'Front-page proof', 'Cradle key'] },
        ],
        // solution[i] = [locationIndex, itemIndex] for person i
        solution: [[2, 4], [4, 2], [0, 1], [3, 0], [1, 3]],
        clues: [
          'Khairul was counting what he had been given, in his car.',
          'The front-page proof was nowhere near Menara Sinar.',
          'Ain was at work.',
          'The man on the stairs had something silver in his hand.',
          'Nobody on Level 14 was holding paper.',
          'The headphones never left the glass room.',
          'Zul was not on the stairs.',
          'The cradle key was in a man\'s hand.',
        ],
      },
      evidence: {
        img: 'ev_c5_onepage', hotspot: { x: 0.47, y: 0.50, r: 0.17 },
        title: 'Everyone at 11:47 PM',
        short: 'Zul: Level 14, at the cradle door, with the cradle key. Vivian: Level 14, the glass room, with headphones on. Khairul: in his car on B2, with a brown envelope. Rajan: stair B at Level 9, going down, with a silver lighter. Ain: the newsroom in Bangsar South, with Monday\'s front page.',
        text: 'At 11:47 PM: Zulkifli Hamid stood at the cradle door on Level 14 with the cradle key in his hand. Vivian Chua sat in the glass room with a pair of headphones on, listening to a director\'s phone. Superintendent Khairul Anuar sat in his car on B2 with a brown envelope, counting. The kancil man was on service stair B at Level 9, going down, with a silver lighter in his fist. And Nurul Ain was at her desk in the newsroom in Bangsar South, holding the proof of Monday\'s front page, on which there was nothing yet about her father.',
      },
    },
    {
      id: 'c5_th', phase: 'Bukit Aman', title: 'For the prosecutor',
      game: 'theory', variant: 'classic',
      brief: 'Deputy Public Prosecutor Hamidah Yusof gives you one sheet of paper and twenty minutes before Vivian Chua\'s lawyer lands. "Not the evidence, detective. The story. Who did what, and why. If you cannot tell it, I cannot charge it."',
      params: {
        prompt: 'Write the Sunday night at Menara Sinar for the prosecutor: who sent Dato\' Rashid out of the building, who gave the order, why he had to die, and how the kancil got into his hand.',
        context: 'Dato\' Rashid Osman, Group Finance Director of Sinar Holdings, fell from the hidden Level 14 of Menara Sinar at 11:47 PM on Sunday. He had agreed to take K. Rajan (Daniel Raj) up to Level 14 that night. Vivian Chua, Secretary to the Chairman, sent a printed order ("The director first. Then the kancil.") from home at 21:40; Zulkifli "Zul" Hamid, Head of Security, collected it, met Rashid on 14, pushed him out of the window-cleaning cradle door, and at 1:20 AM "found" the body and closed the dead fingers over a dry paper kancil to blame the kancil man.',
        points: [
          { id: 'push', label: 'Who sent him out of the building', criterion: 'Zulkifli Hamid (Zul, Head of Security) pushed or threw Rashid out of the Level 14 window / cradle door. It must not say someone else pushed him.', keywords: [['zul', 'zulkifli', 'head of security'], ['push', 'shove', 'threw', 'throw', 'out of the', 'cradle']], hint: 'Whose skin was under Rashid\'s nails, and who signed out the cradle key at 23:35?' },
          { id: 'order', label: 'Who gave the order', criterion: 'Vivian Chua (the Chairman\'s secretary / the Office of the Chairman) ordered or arranged the killing, for example by sending the printed order "The director first. Then the kancil."', keywords: [['vivian', 'chua', 'secretary', 'office of the chairman'], ['order', 'sent', 'printed', 'told', 'paid', 'arranged']], hint: 'The printer log: user VCHUA, 21:40, from outside the building.' },
          { id: 'why', label: 'Why Rashid had to die', criterion: 'Rashid was killed because he was going to take K. Rajan / Daniel Raj up to Level 14 (to expose the hidden floor), or because he was going to talk.', keywords: [['rajan', 'daniel', 'kancil man', 'talk', 'expose', 'tell'], ['14', 'fourteen', 'floor', 'up', 'police', 'everything']], hint: 'Who was waiting on the stairs between 13 and 14, and what had Rashid promised him?' },
          { id: 'kancil', label: 'How the kancil got into his hand', criterion: 'The paper kancil was put into Rashid\'s hand after he was dead (it was dry after the rain), by Zul when he "found" the body, to frame the kancil man.', keywords: [['kancil'], ['dry', 'after', 'planted', 'put', 'placed', 'pressed', 'closed']], hint: 'It rained until 1:10. The paper in his fist was dry.' },
        ],
        need: 3,
        clue: 'Hamidah taps the sheet. "Three things I can prove in court. Four if you want me to enjoy it."',
      },
      evidence: {
        img: 'ev_c5_report', hotspot: { x: 0.67, y: 0.37, r: 0.1 },
        title: 'One sheet of paper',
        short: 'The prosecutor reads your report twice, signs the charge sheet against Zulkifli Hamid for murder, and leaves the second name blank. "Bring me Vivian Chua\'s own words, and I will fill it in."',
        text: 'Deputy Public Prosecutor Hamidah Yusof reads your report twice with a pencil she never uses. Then she signs a charge sheet: Zulkifli bin Hamid, Section 302, murder. Under it, a second line, "and abetment by", and nothing after it. "The printer log is a machine," she says. "Machines do not go to prison. Bring me Vivian Chua\'s own words, in a room, on tape, and I will write her name on this line myself." She slides the sheet back to you. Your handwriting, her signature, one empty line.',
      },
    },
    {
      id: 'c5_22', phase: 'Bukit Aman', title: 'The Chairman\'s secretary',
      game: 'interrogation', variant: 'classic',
      brief: 'Vivian Chua comes to Bukit Aman on Wednesday night by appointment, in her own car, with a lawyer on a flight from Singapore and a handbag she keeps on her knee. Superintendent Khairul\'s deadline runs out at midnight. She has given statements to better detectives than you, she says, and none of them ever needed a second one. One thing she tells you is not true. Find it, and put the exhibit that breaks it on the table.',
      params: {
        setting: 'Interview room 3, Bukit Aman. Wednesday, 11:40 PM.',
        suspect: {
          id: 'vivian', voice: 'voice_4', name: 'Vivian Chua', role: 'Secretary to the Chairman, Sinar Holdings, 56',
          persona: 'Precise convent-school English, never raises her voice, often answers a question with a question. Calls the player "Detective" and Farah "Inspector Iskandar", in full, every time. Lets slip a Cantonese "aiyah" or "mou man tai" only when irritated. Defensive about the Chairman\'s privacy and her twenty-seven years of loyalty; straightens her sleeves when a question lands close.',
        },
        facts: [
          { id: 'f1', topic: 'her job', claim: 'I have been Secretary to the Chairman since 1998. I keep his diary, his correspondence and his confidence.' },
          { id: 'f2', topic: 'the Chairman', claim: 'I do not discuss the Chairman. Not with you, not with anybody, not ever.' },
          { id: 'f3', topic: 'Dato\' Rashid', claim: 'Rashid joined the group a year before I did. He was a careful man with figures, and a frightened one this year.' },
          { id: 'f4', topic: 'Superintendent Khairul', claim: 'Superintendent Khairul is a consultant to the group. He is paid every month, like every consultant.' },
          { id: 'f5', topic: 'Zul', claim: 'Zulkifli Hamid reports to me on matters of security. He has never once failed me.' },
          { id: 'f6', topic: 'Level 14', claim: 'On every plan DBKL has ever approved, Level 14 of Menara Sinar is a plant floor.' },
        ],
        lies: [
          { id: 'l1', topic: 'Sunday night', claim: 'I was at home in Bukit Tunku from nine on Sunday night. My housekeeper will tell you so.', truth: 'She drove into Menara Sinar\'s car park at 11:25 PM and was driven out at 12:40.', exposedBy: 'e1' },
          { id: 'l2', topic: 'the Chairman\'s orders', claim: 'The Office of the Chairman sent no instructions to anybody on Sunday. Nothing was printed.', truth: 'At 21:40 she sent the order to the Level 14 printer as user VCHUA: the director first, then the kancil.', exposedBy: 'e2' },
          { id: 'l3', topic: 'the Port Klang account', claim: 'I approve nothing from any Port Klang account. I do not know what you mean by it.', truth: 'She approved RM 50,000 to Zul and a reefer van for 3 AM on Monday, on Saturday, a day before Rashid died.', exposedBy: 'e3' },
        ],
        evidence: [
          { id: 'e1', title: 'Parking mode', text: 'Dato\' Rashid\'s dashcam: at 11:25 PM on Sunday a woman with silver hair walks from bay V-01, the Office of the Chairman\'s, to the lifts. At 12:40 she is driven out.' },
          { id: 'e2', title: 'Then the kancil', text: 'The shredded order to "Z.H., Security", rebuilt: sent to the Level 14 printer on Sunday at 21:40 by user VCHUA.' },
          { id: 'e3', title: 'Paid in advance', text: 'The Port Klang account, restored from Saturday\'s totals: RM 50,000 to Z.H. and a reefer van for 3 AM Monday, both approved V.C.' },
          { id: 'e4', title: 'Two names for Level 14', text: 'A 1997 memo, re-issued every year: Level 14 is a plant floor, access restricted to the Office of the Chairman, keyholder V. Chua.' },
          { id: 'e5', title: 'As high as he got', text: 'Daniel Raj\'s thumb is on the stair rail between 13 and 14, and nowhere higher.' },
          { id: 'e6', title: 'Fourteen minutes', text: 'Zul\'s log: found the body at 01:20, called 999 at 01:34.' },
        ],
        secret: 'She sent the order that killed Rashid Osman and listened to it happen through headphones in the glass room on Level 14, and she will never say who the Chairman is.',
        suggested: [
          'Where were you on Sunday night?',
          'Did the Office of the Chairman send any orders on Sunday?',
          'Who signs off the Port Klang account?',
          'Who is the Chairman, and how long have you served him?',
          'What was Dato\' Rashid to you?',
          'What do Zul and Superintendent Khairul do for Sinar?',
          'What is on Level 14?',
        ],
        maxQuestions: 14,
        clue: 'Twenty minutes to midnight, and Khairul\'s deadline. She checks her watch before you do.',
      },
      evidence: {
        img: 'ev_c5_interviews', hotspot: { x: 0.57, y: 0.42, r: 0.13 },
        title: '"Satu saja"',
        short: 'Caught in one lie, Vivian Chua will not name the Chairman, and does not try to save Zul. She says one true thing: at 11:48 the intercom from the cradle corridor rang the glass room on Level 14, and Zul said two words. "Satu saja." Only one.',
        text: 'She straightens her sleeves, looks at the exhibit for a long time, and asks for nothing: not her lawyer, not water, not a telephone. About the Chairman she says what she has said all night, which is nothing at all. Then, to the picture of the King on the wall and not to anybody at the table, she says one true thing. "At eleven forty-eight the intercom from the cradle corridor rang the glass room. Zul said two words. Satu saja. Only one." She looks at Farah. "Rashid told the other one to run. Twenty-seven years, and he chose the last three minutes to be brave." Farah turns the recorder off and sits for a while with her hand on it.',
      },
    },
  ],

  outcomes: {
    charged: {
      vivian: { en: 'Vivian Chua is arrested at her house in Bukit Tunku at five in the morning. She is dressed, with her handbag on her knee, as if she has been waiting for a car. She asks for one telephone call, and does not make it.' },
      zul: { en: 'Zulkifli Hamid is arrested in the control room on B1, in front of his own monitors. He takes the earpiece out himself, coils the wire, and puts it in Farah\'s hand. "You still drop your left shoulder when you shoot," he tells her.' },
      khairul: { en: 'Superintendent Khairul Anuar is arrested at Bukit Aman in front of his own officers. The murder charge will not last the week. The envelope in his glovebox, RM 8,000 in fifties, will.' },
      rajan: { en: 'A warrant for murder goes out in the name of K. Rajan. Under it, in pencil, where only she will see it, Farah writes the other name.' },
    },
    correct: ['vivian', 'zul'],
  },

  // Hidden consequences, for later cases. KHAIRUL_WRONGED: charged with a murder he did not commit (he is
  // still corrupt). DANIEL_CHARGED: the player named K. Rajan. DANIEL_FOUND / DANIEL_TAKEN: whether Farah's
  // one team reached Kampung Baru before Sinar did.
  flagNames: ['VIVIAN_FREE', 'ZUL_FREE', 'KHAIRUL_WRONGED', 'DANIEL_CHARGED', 'DANIEL_FOUND', 'DANIEL_TAKEN'],
  flags: ({ charged, answers }) => ({
    VIVIAN_FREE: !charged.includes('vivian'),
    ZUL_FREE: !charged.includes('zul'),
    KHAIRUL_WRONGED: charged.includes('khairul'),
    DANIEL_CHARGED: charged.includes('rajan'),
    DANIEL_FOUND: answers.daniel === 'kgbaru',
    DANIEL_TAKEN: answers.daniel !== 'kgbaru',
  }),

  // The ending. A wrong move must read as a closed case, not as a failure screen.
  ending(v) {
    const right = CASE05.outcomes.correct.every((id) => v.has(id));
    const found = v.answers.daniel === 'kgbaru';
    let ainLine;
    if (right && !v.has('khairul') && !v.has('rajan')) ainLine = 'He did not jump. He was pushed while he was trying to undo something. I can write that now. I can write both of those.';
    else if (v.has('rajan')) ainLine = 'They say it was the man with the paper animals. Abah told me to help him. I do not know which one of them was lying to me.';
    else if (v.has('khairul')) ainLine = 'You arrested a superintendent. My editor cleared the whole front page for it. Abah would have read it twice and asked who was still upstairs.';
    else ainLine = 'They say it is finished. My editor says it is finished. Everybody is very sure about everything except what happened.';

    const panels = [
      { img: 'c5_out_01_arrest', mood: 'police', fx: ['rain', 'siren'], place: 'Bukit Aman. Thursday, 4:40 AM.', music: 'resolution',
        lines: v.charged.map((id) => ({ who: null, en: CASE05.outcomes.charged[id].en })) },
      { img: 'c5_out_02_kiara', mood: 'day', fx: ['rain'], place: 'Bukit Kiara Muslim cemetery. Thursday, 8:00 AM.',
        lines: [
          { who: null, en: 'Dang Wangi amends its file on the morning of the third night\'s tahlil. Not a fall. Pushed, from the fourteenth floor of a building with no fourteenth floor.' },
          { who: 'Nurul Ain', en: ainLine },
          { who: null, en: 'Vivian Chua flies to Singapore on Thursday morning on a Sinar jet. At Seletar a woman in a grey dress is waiting for her on the tarmac. Sinar Holdings thanks its Company Secretary for twenty-seven years of service.', when: (f) => f.VIVIAN_FREE && f.SHEHANI_FREE },
          { who: null, en: 'Vivian Chua flies to Singapore on Thursday morning on a Sinar jet. Sinar Holdings thanks its Company Secretary for twenty-seven years of service.', when: (f) => f.VIVIAN_FREE && !f.SHEHANI_FREE },
          { who: null, en: 'By Friday the Office of the Chairman has a new secretary. Her name is at the bottom of the letter Sinar\'s lawyers send to Bukit Aman: Melissa Ong.', when: (f) => !f.VIVIAN_FREE && f.MELISSA_FREE },
          { who: null, en: 'Zulkifli Hamid is made Head of Security at Sinar Cold Chain, Westport. He leaves Menara Sinar on Wednesday with a cake from the night guards.', when: (f) => f.ZUL_FREE },
          { who: null, en: 'Superintendent Khairul Anuar is suspended. The murder charge is dropped on Friday. The envelope is not. On Monday somebody at Bukit Aman starts returning Farah\'s calls.', when: (f) => f.KHAIRUL_WRONGED },
          { who: null, en: 'Superintendent Khairul Anuar gives the press conference himself, thanks his officers, and does not look at Farah once.', when: (f) => !f.KHAIRUL_WRONGED },
        ] },
      { img: 'c5_out_03_sealed', mood: 'night', fx: ['dust'], place: 'Menara Sinar, Level 14. Thursday, 11:00 PM.',
        lines: [
          { who: null, en: 'Bomba seals the fourteenth floor for fire-safety breaches. It is the only charge in Kuala Lumpur that Sinar\'s lawyers cannot argue away by lunch.' },
          { who: null, en: 'DBKL\'s file says what it has said since 1997. Level 14 of Menara Sinar is a plant floor: pumps, ducts, transformers. Nobody at DBKL can find who signed the plans.' },
          { who: null, en: 'The shelves are bare. The chair still faces the window, and the telescope beside it still points south-west, at Brickfields.' },
          { who: 'Vivian Chua', en: 'You think Floor 14 was his office. It was his memory. You have only seen the part he chose to forget.', when: (f) => !f.VIVIAN_FREE },
          { who: null, en: 'Azman sends Farah a photograph from the cab of a crane at Westport, 4 AM on Thursday: a reefer unit going aboard a Singapore feeder. Serial RU-19.', when: (f) => f.AZMAN_ALIVE },
          { who: null, en: 'The export permit for RU-19 is stamped at Westport. Officer: N. SALLEH.', when: (f) => f.NORHAYATI_FREE },
          { who: null, en: 'The man who drove the reefer van down to the loading bay at three on Monday morning had a Sri Lankan seaman\'s pass, and four healing scratches on each forearm.', when: (f) => f.KASUN_FREE },
        ] },
    ];

    if (found && !v.has('rajan')) {
      panels.push({ img: 'c5_out_04_daniel', mood: 'day', fx: [], place: 'Jalan Raja Muda Musa, Kampung Baru. Thursday, 6:10 AM.', music: 'memory',
        lines: [
          { who: null, en: 'Farah sends one car and no radio. Mak Teh rolls up the warung shutter before anybody knocks, and points up the stairs without a word.' },
          { who: null, en: 'He is at the window with two glasses of teh. He has drunk one. He looks older than five years, and exactly the same.' },
          { who: 'Daniel Raj', en: 'You are late, machan. Five years late. I am not complaining.' },
          { who: 'Daniel Raj', en: 'In 2021 they gave me a choice. Stay dead, and the detective lives. Come back, and the detective burns next. So I stayed dead.' },
          { who: 'Daniel Raj', en: 'You gave the boy in Bay 3 his name back. Wei Jie. I watched them bury him as me, and I said nothing.', when: (f) => f.BODY_NAMED },
          { who: 'Daniel Raj', orig: 'Mannichidu, machan.', en: 'Forgive me, machan.' },
          { who: null, en: 'You put the silver lighter on the sill between the glasses. He pushes it back. Its twin is in his pocket. He bought two in 2016, one each, for two people who never smoked.' },
          { who: null, en: 'Farah takes him to a house whose address she gives nobody, not even you. He goes down the wooden stairs with his hands in his pockets, like a man going to buy bread.' },
        ] });
    } else if (found) {
      panels.push({ img: 'c5_out_04_cuffs', mood: 'day', fx: [], place: 'Jalan Raja Muda Musa, Kampung Baru. Thursday, 6:10 AM.', music: 'memory',
        lines: [
          { who: null, en: 'Farah sends four cars, because the warrant says murder. Mak Teh stands in the warung doorway with her hand over her mouth.' },
          { who: null, en: 'He comes down the wooden steps with his hands held out in front of him before anybody asks. He looks older than five years, and exactly the same.' },
          { who: 'Daniel Raj', en: 'Machan. You did right, with what they gave you.' },
          { who: 'Daniel Raj', orig: 'Mannichidu, machan.', en: 'Forgive me, machan.' },
          { who: null, en: 'He is remanded at Sungai Buloh, in a block where Sinar\'s lawyers already have three clients.' },
          { who: null, en: 'Superintendent Khairul Anuar signs the remand order himself.', when: (f) => !f.KHAIRUL_WRONGED },
        ] });
    } else {
      const wrongLine = {
        brickfields: 'Farah\'s team searches your office while Bala Anne watches from the stairs with a ladle in his hand. They find your kettle, your files, and nobody.',
        klia: 'Farah\'s people walk the length of the morning flight to Colombo at KLIA. Seat 14A is empty. It was booked from a Sinar travel account at four on Monday morning.',
        floor14: 'Bomba opens the fourteenth floor for Farah a second time. There is nobody on it but the two of you, and a chair facing the window.',
      }[v.answers.daniel] || 'Farah does not send anybody anywhere.';
      panels.push({ img: 'c5_out_04_empty', mood: 'night', fx: ['rain'], place: 'Jalan Raja Muda Musa, Kampung Baru. Thursday, 7:30 PM.', music: 'memory',
        lines: [
          { who: null, en: wrongLine },
          { who: null, en: 'By the time anybody thinks of Kampung Baru it is evening. Mak Teh is sitting on the warung steps. At noon, she says, two men in polo shirts with a little sun on the pocket went up, and came down with a third man between them. A van was waiting at the end of the Saloma bridge.' },
          { who: 'Mak Teh', orig: 'Dia suruh saya jangan menangis. Saya menangis juga.', en: 'He told me not to cry. I cried anyway.' },
          { who: null, en: 'Upstairs, a chair on its side, two glasses of teh across the floorboards, and in the tea a silver flip-top lighter, the twin of the one in your pocket. Engraved inside the lid: D.R.' },
          { who: null, en: 'The warrant in his name stays open. Whether he ran or was taken, he is a wanted man now, and nobody looks hard for a wanted man who has disappeared.', when: (f) => f.DANIEL_CHARGED },
        ] });
    }

    panels.push({
      img: 'c5_out_05_folder', mood: 'night', fx: ['rain'], place: 'Brickfields. Friday, 2:10 AM.', music: 'chairman',
      lines: [
        { who: null, en: 'Your office door is locked, the way you left it. The folder on your desk is not the way you left anything.' },
        { who: null, en: 'Grey archive board, a small embossed sun on the cover. On the tab, typed, your name. Opened 2016.' },
        { who: null, en: 'Inside, one photograph: you and Daniel at table 6 in Restoran Bala, taken from across Jalan Tun Sambanthan. August 2021, the week before the fire.' },
        { who: null, en: 'And one typed list. H. Goh. Lim Chee Keong. P. Yogeswaran. Rashid Osman. Every name struck through by hand, in blue ink.' },
        { who: null, en: 'Under them, two names nobody has struck through yet. The first is Daniel\'s. The second is yours.' },
        { who: null, en: 'Across the city, on Jalan Ampang, one storey of black glass that Bomba sealed this morning has a light on in it.' },
      ],
    });
    return panels;
  },
};
