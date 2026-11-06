// Words for the case file reader and "Previously on Floor 14".
//
// CHOICES: each hidden story flag a case sets, written as a consequence in plain words. Only flags
//          that were set for this player are shown.
// RECAPS:  per case, a short recap of how it went for this player: recap(v) -> sentences, where v is
//          the verdict (see verdictFor in core/casebook.js: v.has(id), v.flags, v.right).
// SETUPS:  per case, how it began (its opening cinematic, nothing past it): setup(flags) -> sentences.
// Nothing here may name or describe the man at the top of Sinar (see data/chairman.js).

export const CHOICES = {
  case01: {
    JASON_FREE: 'You let Jason Ooi walk.',
    RIZAL_FREE: 'Rizal Hamdan, who deleted seventeen minutes of camera, was never charged.',
    SHANTI_WRONGED: 'You charged Dr. Shanti Menon with murder. She was paying for teh tarik in Bangsar when he fell.',
  },
  side01: {
    BOBBY_FREE: 'You let Bobby Tan walk.',
    AHLAN_WRONGED: 'You had Wong Siew Lan charged for the tin. She skimmed small change, but she never touched it.',
    RAVI_WRONGED: 'You had Ravi Chandran charged, though his own camera cleared him.',
  },
  case02: {
    TONY_FREE: 'You let Tony Kwan walk.',
    NORHAYATI_FREE: 'You let Norhayati Salleh walk.',
    FAIZAL_WRONGED: 'You charged Faizal Ahmad, Salmah\'s brother, for a hunt he was never part of.',
    AZMAN_ALIVE: 'Farah\'s boat went to the right place. Azman Yusof came home.',
    AZMAN_DEAD: 'Azman Yusof did not come home.',
  },
  case03: {
    MELISSA_FREE: 'You let Melissa Ong walk.',
    SHAHRUL_FREE: 'You let Shahrul Nizam walk, and the GOH 2021 carton went with the skip.',
    KENNY_WRONGED: 'You charged Kenny Lim with his uncle\'s fire.',
    CHEAH_WRONGED: 'You charged Madam Cheah with the fire next door.',
    BODY_NAMED: 'You gave the man on X-ray PK-0821 his name back: Ong Wei Jie.',
    BODY_WRONG: 'The man on X-ray PK-0821 stayed without a name.',
    GOH_BOX_FOUND: 'The GOH 2021 carton came back to Kuala Lumpur on Farah\'s passenger seat.',
  },
  case04: {
    SHEHANI_FREE: 'You let Shehani Gunasekera walk.',
    KASUN_FREE: 'You let Kasun Ranaweera walk.',
    MOHAN_WRONGED: 'You charged Mohan Yogeswaran with his brother\'s murder.',
    RAJAN_HUNTED: 'You put a warrant on the man who calls himself K. Rajan.',
    BOOK_FOUND: 'You sent CID to Colombo Fort, and Yogi\'s book was waiting.',
    BOOK_LOST: 'Yogi\'s carbon book went to a man with a sun on his shirt.',
  },
  case05: {
    VIVIAN_FREE: 'You let Vivian Chua walk.',
    ZUL_FREE: 'You let Zulkifli Hamid walk.',
    KHAIRUL_WRONGED: 'You charged Superintendent Khairul with murder. He was in his car, counting an envelope.',
    DANIEL_CHARGED: 'You charged Daniel Raj with Dato\' Rashid\'s murder.',
    DANIEL_FOUND: 'Farah\'s team found Daniel in Kampung Baru.',
    DANIEL_TAKEN: 'Farah went to the wrong place. Sinar got to Daniel first.',
  },
  case06: {
    KAMAL_FREE: 'You let Kamal Ariffin walk.',
    JEFFREY_FREE: 'You let Jeffrey Ho walk.',
    AHFOOK_WRONGED: 'You charged Ah Fook, who burned his hands trying to pull Ismail out.',
    AMIRUL_WRONGED: 'You charged Amirul with his father\'s murder.',
    ARCHIVE_SEIZED: 'You sent Farah to Jugra, and the archive of Level 14 was there.',
    ARCHIVE_LOST: 'The archive of Level 14 got away.',
  },
  case07: {
    DESMOND_FREE: 'You let Desmond Yap walk.',
    AZHAR_WRONGED: 'You charged Tan Sri Azhar, who never left his table in the dark.',
    AIN_WRONGED: 'You charged Nurul Ain, who only took a photograph.',
    MEERA_WRONGED: 'You charged Dr. Meera, whose morphine was a kindness.',
    VOICE_TRACED: 'You told Hamidah where the voice came from, and she wrote it on the charge sheet.',
    VOICE_LOST: 'The line under "and abetment by" stayed blank.',
  },
  case08: {
    ROSLAN_FREE: 'You let Roslan Daud walk. He still drives three lengths behind the car.',
    KHAIRUL_FREE: 'Superintendent Khairul, who told the escort where Farah was, was never charged.',
    MURALI_WRONGED: 'You charged Murali Krishnan, who only saw it in his mirror and drove on.',
    KAMARUL_WRONGED: 'You charged Encik Kamarul, who was at a karaoke lounge in Klang at 3:12.',
    TAIL_TRACED: 'You said he got out at the gate of Warehouse 6, and the escort\'s toll card went south to Melaka.',
    TAIL_LOST: 'Hamidah\'s records came back empty. Nobody knows where he got out of the car.',
  },
  case09: {
    VANESSA_FREE: 'You let Vanessa Low, the hotel manager who switched the iron room off, walk.',
    SHAMSUL_FREE: 'You let Shamsul Bakri, the river pilot who brought the thieves, walk.',
    RAM_WRONGED: 'You had Ram Chettiar charged. He told them the date, but he was at the hospital with his mother when the box was drilled.',
    JOCK_WRONGED: 'You had Jock Sequeira charged for a key he wrote a receipt for.',
    NOTE_FOUND: 'Melaka Tengah found the promissory note under the grille of the empty grave on St. Paul\'s Hill: the borrower\'s left thumb, nine clear points.',
    NOTE_LOST: 'The note with two thumbprints was gone from St. Paul\'s Hill before anybody looked there.',
  },
  case10: {
    CLARISSA_FREE: 'You let Clarissa Seah walk, and she is still the Jugra Trust\'s trustee.',
    GARY_FREE: 'You let Gary Raju walk, back to the plant in Tuas.',
    LUCAS_WRONGED: 'You charged Lucas Seah, who only slept on a bench across the road.',
    RAJENDRAN_WRONGED: 'You charged the night guard Rajendran, who only slept at his desk.',
    ARTHUR_FOUND: 'You told Teo it was the file lift. Arthur Seah came out of the cold alive, and recited the letter of wishes.',
    ARTHUR_LOST: 'Teo searched the wrong way. Arthur Seah was not found.',
  },
  case11: {
    AHKOW_FREE: 'You let Teoh Ah Kow walk.',
    YANG_WRONGED: 'You charged Teoh Siew Yang, who never left the gallery.',
    RIDZUAN_WRONGED: 'You charged Ridzuan, whose flask never got past the door.',
    SHAMIR_WRONGED: 'You charged Shamir Kassim with the tea. He only cut a tape and offered money.',
    GATE_TRUTH: 'The coroner found that the man who drove for Teoh held the cab door shut while Muthu held the torch.',
    GATE_WRONG: 'The file of 1986 was closed again, on the wrong finding.',
  },
  case12: {
    ASRI_FREE: 'You let Sergeant Asri walk, and he went on driving Farah home.',
    AZHAR_WRONGED_12: 'You charged Tan Sri Azhar with a murder done before he found the gate.',
    ITAM_WRONGED: 'You charged Pak Itam, whose hands could not have held the cushion.',
    AIN_WRONGED_12: 'You charged Nurul Ain, who took two photographs and ran.',
    CERT_UNKNOWN: 'The man in the back seat was buried as "Unidentified male, about seventy-five".',
    CERT_SIGNED: 'You had Hamidah write more on the burial permit than the evidence could carry.',
    CHAIRMAN_DECLARED_DEAD: 'You had the man in the back seat certified as the Chairman of Sinar Holdings.',
  },
};

const list = (names) => (names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

export const RECAPS = {
  case01: (v) => {
    const f = v.flags;
    const out = ['Dr. Henry Goh fell from Floor 14 of Residensi Seri Kiara, the floor the lift pretends is not there. He did not jump: he was dragged to the rail.'];
    if (v.has('jason') && v.has('rizal') && !v.has('shanti')) out.push('On your word Farah charged the property agent Jason Ooi, who was in the flat next door, and the guard Rizal Hamdan, who wiped seventeen minutes of camera.');
    else {
      const lost = [];
      if (f.JASON_FREE) lost.push('Jason Ooi, the man in the brogues, walked away');
      if (f.RIZAL_FREE) lost.push('Rizal Hamdan, who wiped the cameras, kept his job');
      if (lost.length) out.push(`${lost.join(', and ')}.`);
      if (f.SHANTI_WRONGED) out.push('Dr. Shanti Menon, who was in Bangsar when he fell, was charged with his murder.');
    }
    out.push('Both men had been paid RM 5,000 by a Singapore company called Sinar Holdings.');
    out.push('In Goh\'s safe was an X-ray marked PK-0821: Port Klang, August 2021, the month of the fire.');
    return out;
  },
  side01: (v) => {
    const f = v.flags;
    const out = ['In SS2, somebody put Ah Hock to sleep with his own kopi and walked off with the season\'s takings in a biscuit tin.'];
    if (!f.BOBBY_FREE) out.push('You named his helper Bobby Tan, who folded paper boats when he was nervous, and the money came back.');
    else out.push('Bobby Tan, who drugged the kopi and carried the tin away, was never charged.');
    if (f.AHLAN_WRONGED) out.push('Wong Siew Lan, who skimmed small change but never touched the tin, was charged anyway.');
    if (f.RAVI_WRONGED) out.push('Ravi Chandran, whose own camera cleared him, was charged.');
    out.push('Ken asked whether you had been back to Port Klang lately. He did not look at you when he asked.');
    return out;
  },
  case02: (v) => {
    const f = v.flags;
    const out = ['Crane driver Azman Yusof opened Container 47 at Port Klang and found twenty-three people inside. Then he ran.'];
    if (!f.TONY_FREE && !f.NORHAYATI_FREE) out.push('You named the two people hunting him: shift supervisor Tony Kwan and customs officer Norhayati Salleh.');
    else {
      const free = [];
      if (f.TONY_FREE) free.push('Tony Kwan');
      if (f.NORHAYATI_FREE) free.push('Norhayati Salleh');
      out.push(`${list(free)}, who hunted him, went free.`);
    }
    if (f.FAIZAL_WRONGED) out.push('Faizal, Salmah\'s brother, was charged for a hunt he was never part of.');
    out.push(f.AZMAN_ALIVE
      ? 'Farah\'s boat found Azman alive on his father\'s kelong, with forty-one photographs of the inside of the box.'
      : 'Fishermen found Azman in the mangroves below Telok Gong. His phone was never found.');
    out.push('The box was bound for Sinar Cold Chain, by way of Warehouse 6, Bay 3: the bay that burned in 2021.');
    return out;
  },
  case03: (v) => {
    const f = v.flags;
    const out = ['Uncle Lim, who cast Henry Goh\'s dental models for thirty years, died when his shophouse on Lebuh Chulia burned.'];
    if (!f.MELISSA_FREE && !f.SHAHRUL_FREE) out.push('You named the arsonists: Melissa Ong of Sinar Heritage, who planned it, and the night guard Shahrul Nizam, who set the timer.');
    else {
      if (f.MELISSA_FREE) out.push('Melissa Ong of Sinar Heritage, who planned the fire, was never charged.');
      if (f.SHAHRUL_FREE) out.push('Shahrul Nizam, who carried out the GOH 2021 carton, was never charged.');
    }
    if (f.KENNY_WRONGED) out.push('Kenny Lim was charged with his uncle\'s fire.');
    if (f.CHEAH_WRONGED) out.push('Madam Cheah next door was charged with the fire.');
    out.push(f.BODY_NAMED
      ? 'Uncle Lim\'s order book proved the body buried as Daniel Raj in 2021 was Ong Wei Jie, a ferry engineer from Butterworth.'
      : 'The man on X-ray PK-0821 still has no name, and the 2021 file still says what it always said.');
    out.push('The order to burn came from an address that signs itself only "Office of the Chairman".');
    return out;
  },
  case04: (v) => {
    const f = v.flags;
    const out = ['In Colombo, the gem valuer Yogi Yogeswaran was drowned in Beira Lake the night he refused to certify one more lot of heated stones for Sinar Gems.'];
    if (!f.SHEHANI_FREE && !f.KASUN_FREE) out.push('You named Shehani Gunasekera, who gave the order, and Kasun Ranaweera, who held him under.');
    else {
      const free = [];
      if (f.SHEHANI_FREE) free.push('Shehani Gunasekera');
      if (f.KASUN_FREE) free.push('Kasun Ranaweera');
      out.push(`${list(free)} went free.`);
    }
    if (f.MOHAN_WRONGED) out.push('Yogi\'s brother Mohan was charged with his murder.');
    if (f.RAJAN_HUNTED) out.push('A warrant now follows the Malaysian who calls himself K. Rajan.');
    out.push(f.BOOK_FOUND
      ? 'Yogi\'s carbon book was waiting at Colombo Fort. Its last page named the Office of the Chairman.'
      : 'Yogi\'s carbon book was collected from Colombo Fort by a man with a little sun on his shirt.');
    out.push('The email that ordered his death came from Level 14 of Menara Sinar, where the lifts go from 13 to 15.');
    return out;
  },
  case05: (v) => {
    const f = v.flags;
    const out = ['Sinar\'s finance director, Dato\' Rashid Osman, went out of a window on the floor that is not there: Level 14 of Menara Sinar.'];
    if (!f.VIVIAN_FREE && !f.ZUL_FREE) out.push('You named Zulkifli Hamid, who pushed him, and Vivian Chua, who printed the order.');
    else {
      if (f.ZUL_FREE) out.push('Zulkifli Hamid, who pushed him, went free.');
      if (f.VIVIAN_FREE) out.push('Vivian Chua, who printed the order, flew to Singapore on a Sinar jet.');
    }
    if (f.KHAIRUL_WRONGED) out.push('Superintendent Khairul, who was only counting his envelope, was charged with the murder.');
    if (f.DANIEL_TAKEN) out.push('Daniel Raj is alive, but men with a little sun on their shirts took him from Kampung Baru before Farah got there.');
    else if (f.DANIEL_CHARGED) out.push('Daniel Raj is alive, and remanded at Sungai Buloh on your charge.');
    else out.push('Daniel Raj is alive. You found him at a window in Kampung Baru, and Farah hid him.');
    out.push('On your desk, a grey folder: your name, "Opened 2016", and a list of struck-out names with two left, Daniel\'s and yours.');
    return out;
  },
  case06: (v) => {
    const f = v.flags;
    const out = ['Ismail Bakar, who wrote up the 2021 Bay 3 fire as electrical, was killed in Bay 3 five years to the night later, before he could give you his photographs.'];
    if (!f.KAMAL_FREE && !f.JEFFREY_FREE) out.push('You named Kamal Ariffin, who killed him and lit the fire, and Jeffrey Ho, who paid for it.');
    else {
      const free = [];
      if (f.KAMAL_FREE) free.push('Kamal Ariffin');
      if (f.JEFFREY_FREE) free.push('Jeffrey Ho');
      out.push(`${list(free)} went free.`);
    }
    if (f.AHFOOK_WRONGED) out.push('Ah Fook, who tried to drag Ismail out, was charged.');
    if (f.AMIRUL_WRONGED) out.push('Ismail\'s son Amirul was charged.');
    out.push(f.ARCHIVE_SEIZED
      ? 'Farah found the archive of Level 14 under Bukit Jugra: every official Sinar has bought since 1986.'
      : 'The archive of Level 14 went down a road that is not on any map.');
    if ((f.DANIEL_TAKEN || !f.DANIEL_FOUND) && f.ARCHIVE_SEIZED) out.push('Daniel was in the back of RU-07, and you got him out.');
    else if (f.DANIEL_TAKEN || !f.DANIEL_FOUND) out.push('Daniel is still theirs.');
    out.push('Ismail\'s 2021 tape held a voice: "Let it burn. Both of them." At ten past two the same voice rang Bala Anne\'s telephone and told you to keep the lighter.');
    return out;
  },
  case07: (v) => {
    const f = v.flags;
    const out = ['At Sinar\'s fortieth dinner a voice behind the screen greeted you at table six. In forty seconds of dark, the old man in the chair was strangled.'];
    out.push('He was Muthu, a driver from Brickfields, and the voice had never been his.');
    if (!f.DESMOND_FREE) out.push('You named Desmond Yap, the man at the AV desk.');
    else out.push('Desmond Yap, the man at the AV desk, walked out of the building.');
    const wronged = [];
    if (f.AZHAR_WRONGED) wronged.push('Tan Sri Azhar');
    if (f.AIN_WRONGED) wronged.push('Nurul Ain');
    if (f.MEERA_WRONGED) wronged.push('Dr. Meera');
    if (wronged.length) out.push(`${list(wronged)} ${wronged.length === 1 ? 'was' : 'were'} charged as well.`);
    out.push(f.VOICE_TRACED
      ? 'You told Hamidah where the voice came from: a car in Bay V1, Basement 2.'
      : 'Nobody told Hamidah where the voice came from.');
    out.push('At Muthu\'s cremation a hand in a white cuff rested on your shoulder: the first of December, ten past two, outside Restoran Bala.');
    return out;
  },
  case08: (v) => {
    const f = v.flags;
    const out = ['At ten past two on the first of December you drove the black car from Brickfields to Jugra with a voice behind you. At 3:12 Farah, three cars behind, was pushed into the divider, and you did not stop.'];
    if (!f.ROSLAN_FREE && !f.KHAIRUL_FREE) out.push('You named Roslan Daud, the escort who rammed her, and Superintendent Khairul, who told him where she was.');
    else {
      if (!f.ROSLAN_FREE) out.push('You named Roslan Daud, the escort who rammed her.');
      if (!f.KHAIRUL_FREE) out.push('You named Superintendent Khairul, who told the escort where she was.');
      const free = [];
      if (f.ROSLAN_FREE) free.push('Roslan Daud');
      if (f.KHAIRUL_FREE) free.push('Superintendent Khairul');
      out.push(`${list(free)} went free.`);
    }
    const wronged = [];
    if (f.MURALI_WRONGED) wronged.push('Murali Krishnan');
    if (f.KAMARUL_WRONGED) wronged.push('Encik Kamarul');
    if (wronged.length) out.push(`${list(wronged)} ${wronged.length === 1 ? 'was' : 'were'} charged as well.`);
    out.push(f.TAIL_TRACED
      ? 'You said he got out at the gate of Warehouse 6. The escort\'s toll card went south, to Melaka.'
      : 'Nobody told Hamidah where he got out of the car.');
    out.push('In the boot: nine rules, "Terima kasih" in ink, and a lorry\'s number plate, BCK 210. At ten past two on Friday: "Keep the plate."');
    return out;
  },
  case09: (v) => {
    const f = v.flags;
    const out = ['On Christmas Eve, under the fireworks, somebody drilled Box 14 in a Chettiar iron room in Melaka and left the gold in every other box.'];
    if (!f.VANESSA_FREE && !f.SHAMSUL_FREE) out.push('You named Vanessa Low, the hotel manager who switched off the alarm, and Shamsul Bakri, who brought the thieves up the river.');
    else {
      const free = [];
      if (f.VANESSA_FREE) free.push('Vanessa Low');
      if (f.SHAMSUL_FREE) free.push('Shamsul Bakri');
      out.push(`${list(free)} went free.`);
    }
    if (f.RAM_WRONGED) out.push('Ram Chettiar, the keeper of the iron room, was charged.');
    if (f.JOCK_WRONGED) out.push('Jock Sequeira, the locksmith, was charged.');
    out.push(f.NOTE_FOUND
      ? 'The promissory note was under the grille of the empty grave on St. Paul\'s Hill: Muthu\'s right thumb, and a left thumb with nine clear points.'
      : 'The note with two thumbprints was gone before anybody looked in the right place.');
    out.push('Box 14 had held a watch stopped at ten past two. On New Year\'s Day a courier brought you the photograph from the box: "She is fifty-five now."');
    return out;
  },
  case10: (v) => {
    const f = v.flags;
    const out = ['In Singapore, the old solicitor Arthur Seah, who witnessed the 1987 deed of the trust at the top of Sinar, vanished from a room bolted on the inside, hours before he was to show it to you.'];
    if (!f.CLARISSA_FREE && !f.GARY_FREE) out.push('You named his granddaughter Clarissa Seah, who drugged his tea and sent the old file lift up, and Gary Raju of Tuas SecureShred, who carried him out in a shredding bin.');
    else {
      const free = [];
      if (f.CLARISSA_FREE) free.push('Clarissa Seah');
      if (f.GARY_FREE) free.push('Gary Raju');
      out.push(`${list(free)} went free.`);
    }
    const wronged = [];
    if (f.LUCAS_WRONGED) wronged.push('his son Lucas');
    if (f.RAJENDRAN_WRONGED) wronged.push('the night guard Rajendran');
    if (wronged.length) out.push(`${list(wronged)} ${wronged.length === 1 ? 'was' : 'were'} charged as well.`);
    out.push('The deed names Muthu as the man who settled the trust, but neither the signature nor the left thumb is his.');
    out.push(f.ARTHUR_FOUND
      ? 'Arthur was found alive in a cold store at Tuas, and recited the letter of wishes: "On my death the Trust is to be directed by whoever drives me last."'
      : 'Arthur Seah was not found. Of the letter of wishes only a burnt corner survived: "...drives me last."');
    out.push('At ten past two the telephone in your hotel rang: "You crossed the water for me, detective. I never have."');
    return out;
  },
  case11: (v) => {
    const f = v.flags;
    const out = ['The coroner reopened the 1986 drowning of Teoh Ah Chuan at his yard under Bukit Jugra. On the third day of the inquest, Corporal Tarmizi, who wrote "accident" in 1986, was poisoned in the witness room before he could say who paid him.'];
    if (!f.AHKOW_FREE) out.push('You named Teoh Ah Kow, the dead man\'s brother: kecubung seeds in a canteen teh.');
    else out.push('Teoh Ah Kow, the dead man\'s brother, who put kecubung seeds in the corporal\'s teh, went home to Banting.');
    const wronged = [];
    if (f.YANG_WRONGED) wronged.push('Siew Yang');
    if (f.RIDZUAN_WRONGED) wronged.push('the corporal\'s son Ridzuan');
    if (f.SHAMIR_WRONGED) wronged.push('Sinar\'s lawyer Shamir Kassim');
    if (wronged.length) out.push(`${list(wronged)} ${wronged.length === 1 ? 'was' : 'were'} charged as well.`);
    out.push(f.GATE_TRUTH
      ? 'The coroner found that the man who drove for Teoh held the cab door shut under the water while Muthu held the torch. Siew Yang painted her father\'s name on the gate.'
      : 'The coroner\'s finding left the night of 1986 where the corporal had left it.');
    out.push('At ten past two on the eve of the new year, the voice on Bala Anne\'s telephone said thank you, and asked you to come to the gate on the fifteenth night, and to bring the plate.');
    return out;
  },
  case12: (v) => {
    const f = v.flags;
    const out = ['On the fifteenth night of the new year the black car burned at the Jugra gate. Behind the driver\'s seat sat a man of about seventy-five with no voice and a lighter in his fist, dead before the fire.'];
    out.push(f.ASRI_FREE
      ? 'Sergeant Asri, who drove the car to the gate, went on driving Farah home.'
      : 'You named Sergeant Asri, Farah\'s own, who drove the car to the gate and lit it.');
    const wronged = [];
    if (f.AZHAR_WRONGED_12) wronged.push('Tan Sri Azhar');
    if (f.ITAM_WRONGED) wronged.push('Pak Itam');
    if (f.AIN_WRONGED_12) wronged.push('Nurul Ain');
    if (wronged.length) out.push(`${list(wronged)} ${wronged.length === 1 ? 'was' : 'were'} charged as well.`);
    if (f.CERT_UNKNOWN) out.push('Hamidah wrote only what could be proved: unidentified male, about seventy-five.');
    else if (f.CHAIRMAN_DECLARED_DEAD) out.push('Hamidah wrote that he was the Chairman of Sinar Holdings, and Sinar agreed.');
    else out.push('Hamidah wrote more on the form than nine points and a grey hair could carry.');
    out.push('At ten past two on Wednesday a second black car stopped outside Restoran Bala with its back door open. "Tonight I drive."');
    return out;
  },
};

export const SETUPS = {
  case01: () => [
    'At 2:47 AM a stranger rang you: Rachel Goh. Her father, Dr. Henry Goh, had fallen from his balcony on Floor 14, and the police say he jumped. She says he did not.',
    'On the railing, held down by a coin, somebody had left a paper kancil.',
  ],
  side01: () => [
    'Ken Lim\'s uncle, Ah Hock, was drugged with his own kopi at his durian stall in SS2, and the season\'s takings went with a red biscuit tin.',
    'At the bottom of the empty tin: a stall receipt folded into a paper boat.',
  ],
  case02: () => [
    'Azman Yusof climbed down from Crane 7 at Port Klang with a container hanging in the air, and nobody has seen him since. His wife Salmah says he would never leave their son.',
    'For the first time since the fire, you drove back to the port.',
  ],
  case03: () => [
    'Jo Lim\'s grandfather, Uncle Lim, who cast Henry Goh\'s dental models for thirty years, died when his shophouse on Lebuh Chulia burned. Bomba says old wiring. Jo says he unplugged everything, every night.',
    'Next door, a hoarding for a hotel that does not exist yet.',
  ],
  case04: () => [
    'A parcel came from Colombo: one uncut sapphire in a gem cutter\'s paper, wrapped in a paper kancil from a Restoran Bala receipt.',
    'The cutter, Yogi Yogeswaran, was found in Beira Lake. His daughter Tharshini says he never drank, and could not swim.',
  ],
  case05: () => [
    'Sinar\'s Group Finance Director, Dato\' Rashid Osman, was found on the pavement of Jalan Ampang, under a band of black glass where a floor should be.',
    'In his fist was a paper kancil folded from a Colombo three-wheeler receipt. Farah\'s superintendent wants the file closed by Wednesday.',
  ],
  case06: () => [
    'An old Bomba officer left you a message with Bala Anne: Bay 3, Thursday, midnight, five years. I will bring photographs.',
    'When you reached Port Klang, Bay 3 was burning again. At dawn Bomba found his body, and beside it a silver lighter engraved D.R.',
  ],
  case07: () => [
    'A black envelope with a brass sun: Sinar Holdings turns forty. Table 6, for two.',
    'An old man in a white shirt brought you a teh and told you to look behind the screen when the lights went out. When they came back, he was dead in the chair. Nobody leaves the floor until dawn.',
  ],
  case08: () => [
    'At ten past two on the first of December a black car with no plates stopped outside Restoran Bala, and you got into the front of it. A hand in a white cuff touched your shoulder: don\'t look back.',
    'Farah followed three cars behind. At 3:12 on the Federal Highway somebody put her car into the divider, and the voice behind you said do not stop.',
  ],
  case09: () => [
    'Box 14, in a Chettiar iron room in Melaka, was rented in 1987 for fifty years by a lorry company from Jugra. On Christmas Eve, three days before a court could open it, somebody drilled it open.',
    'The thieves took nothing else. On Christmas morning the gold in the other forty-one boxes was still there.',
  ],
  case10: () => [
    'A solicitor of eighty-two on Telok Ayer Street, Singapore, wrote to you: in 1987 he watched a man sign a trust deed on the Johor shore. Come on Friday at seven, he said; he would have it all out on the table.',
    'At seven on Friday his door was bolted from the inside. When the police broke it, the room was empty, and so was the deed box.',
  ],
  case11: () => [
    'The coroner at Shah Alam reopened a file closed in eleven minutes in December 1986: Teoh Ah Chuan, drowned in his own lorry at his yard at Jugra. Cause: accident.',
    'The man who wrote "accident", retired Corporal Tarmizi Hassan, told you in the corridor that he had been writing it for forty years. The girl who painted the sun on the gate sat in the front row with her brushes.',
  ],
  case12: () => [
    'He asked you to come to the gate at Jugra at ten past two on the fifteenth night of the new year, and to bring the plate.',
    'You were late. The black car was burning under the pink sun, and in the back seat sat a man in a white shirt with a lighter in his fist.',
  ],
};
