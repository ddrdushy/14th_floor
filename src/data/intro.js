// Opening motion comic, "2:47 AM". Dialogue may be in Malay or Tamil; captions are always English.
// line: { who, en, orig? }  orig = the line as spoken, shown small above the English subtitle.

export const INTRO = [
  {
    img: 'intro_01_rain', music: 'intro', mood: 'night', fx: ['rain'], place: 'Brickfields, Kuala Lumpur. 2:47 AM.',
    lines: [{ who: null, en: 'The monsoon had been falling for three days. It never washes anything clean.' }],
    kb: { from: [1.08, 0, 0], to: [1.0, 0, -2] }, sfx: 'thunder',
  },
  {
    img: 'intro_02_office', mood: 'warm', fx: ['rain', 'dust'],
    lines: [
      { who: null, en: 'A one-room agency above a mamak stall. A fan that stopped turning in July.' },
      { who: null, en: "And a silver lighter that belonged to the only partner you ever trusted." },
    ],
    kb: { from: [1.0, -2, 0], to: [1.1, 2, 1] },
  },
  {
    img: 'intro_03_fire', music: 'fire', mood: 'fire', fx: ['fire', 'shake'], place: 'Port Klang. August 2021.',
    lines: [
      { who: null, en: 'The same dream. Always the same dream.' },
      { who: '???', orig: 'Jangan tengok belakang.', en: "Don't look back." },
    ],
    kb: { from: [1.15, 0, 0], to: [1.02, 0, 0] }, sfx: 'fire',
  },
  {
    img: 'intro_04_phone', music: 'intro', mood: 'night', fx: ['rain', 'buzz'],
    lines: [
      { who: 'Unknown number', en: '[Incoming call]' },
      { who: 'Woman', en: 'Are you the detective from the Port Klang fire?' },
      { who: 'You', en: 'Who gave you this number?' },
    ],
    kb: { from: [1.0, 0, 0], to: [1.12, 0, 0] }, sfx: 'buzz',
  },
  {
    img: 'intro_05_rachel', mood: 'police', fx: ['rain'],
    lines: [
      { who: 'Rachel Goh', en: 'My father. Tonight at eleven, he said: if anything happens to me, do not trust the police. Call this person.' },
      { who: 'Rachel Goh', en: "An hour ago he fell from our balcony. They're saying he jumped." },
      { who: 'Rachel Goh', en: "He didn't jump." },
    ],
    kb: { from: [1.1, 1, 0], to: [1.0, -1, 0] },
  },
  {
    img: 'intro_06_taxi', mood: 'night', fx: ['rain'], place: 'Jalan Duta, 3:20 AM.',
    lines: [
      { who: 'Driver', orig: 'Boss, Mont Kiara ah? Hujan lebat ni, slow sikit ya.', en: 'Mont Kiara, boss? Heavy rain, so we go slow, okay?' },
      { who: null, en: 'Why would a dentist you have never met know your name?' },
    ],
    kb: { from: [1.0, -3, 0], to: [1.08, 3, 0] },
  },
  {
    img: 'intro_07_farah', mood: 'police', fx: ['rain', 'siren'], place: 'Residensi Seri Kiara, Mont Kiara.',
    lines: [
      { who: 'Inspector Farah Iskandar', orig: 'Kau. Of all people.', en: 'You. Of all people.' },
      { who: 'Inspector Farah Iskandar', en: 'Five minutes. Touch nothing. And this never happened.' },
    ],
    kb: { from: [1.05, 0, 0], to: [1.12, 0, -2] },
  },
  {
    img: 'intro_08_lift', mood: 'night', fx: [],
    lines: [
      { who: null, en: 'The lift panel reads 12, 13, 15. Like most towers in this city, it pretends Floor 14 does not exist.' },
      { who: null, en: 'Dr. Henry Goh lived on it anyway.' },
    ],
    kb: { from: [1.0, 0, 2], to: [1.15, 0, -2] }, sfx: 'lift',
  },
  {
    img: 'intro_09_kancil', mood: 'night', fx: ['rain'],
    lines: [
      { who: null, en: 'On the balcony railing, held down by a coin: a tiny mousedeer folded from a mamak receipt.' },
    ],
    kb: { from: [1.0, 0, 0], to: [1.25, 0, 0] },
  },
  {
    img: 'intro_10_memory', mood: 'warm', fx: ['dust'], place: 'Five years ago.',
    lines: [
      { who: 'Daniel Raj', orig: 'Kancil. Small animal, big brain.', en: 'Kancil. Small animal, big brain.' },
      { who: 'Daniel Raj', en: 'Outsmarts the crocodiles every time, machan.' },
    ],
    kb: { from: [1.1, 0, 0], to: [1.0, 0, 0] },
  },
  {
    img: 'intro_09_kancil', mood: 'night', fx: ['rain'],
    lines: [{ who: null, en: 'You slip the paper kancil into your pocket before Farah turns around.' }],
    kb: { from: [1.25, 0, 0], to: [1.3, 0, 0] },
  },
  { title: true, fx: ['rain'] },
];
