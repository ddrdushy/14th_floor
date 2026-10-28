// What the voice actually reads, when that should differ from the line's own text.
// Keyed by the spoken text exactly as it appears in the case files (orig, or en when there is no orig).
// The subtitle on screen and the line's voice id never change; only the text sent to Fish Audio does.
// (Changing an entry here changes the cache key on the server, so that line is generated again.)
//
//   say:  text for the voice. Romanised Tamil and Cantonese read far better in their own script.
//         Penang Hokkien stays romanised: written in Han characters a TTS voice reads it as Mandarin.
//   lang: overrides the guessed language label.
//
// A line in a case file may also carry its own `say` field, which wins over this table.

export const VOICE_OVERRIDES = {
  // Tamil (Bala Anne)
  'Port Klang-aa? Neenga anga poga vendaam, thambi.': { say: 'போர்ட் கிள்ளான்-ஆ? நீங்க அங்க போக வேண்டாம், தம்பி.' },
  'Andha oor-la ellaame missing dhaan.': { say: 'அந்த ஊர்ல எல்லாமே missing தான்.' },
  'Penang-aa? Anga mazhai inga vida mosam.': { say: 'பினாங்-ஆ? அங்க மழை இங்க விட மோசம்.' },
  'Saapittu poonga.': { say: 'சாப்பிட்டு போங்க.' },
  'Thambi! Andha durian-a mela kondu poga koodaadhu!': { say: 'தம்பி! அந்த டுரியனை மேல கொண்டு போகக் கூடாது!' },
  'Thambi, unakku oru parcel vandhirukku. Colombo-la irundhu.': { say: 'தம்பி, உனக்கு ஒரு பார்சல் வந்திருக்கு. கொழும்புல இருந்து.', lang: 'ta' },

  // Sri Lankan Tamil (Tharshini Yogeswaran, Case 4)
  'Appa poyittaar.': { say: 'அப்பா போயிட்டார்.', lang: 'ta' },

  // Sinhala (Case 4: the tuk-tuk driver, Inspector Ruwan Herath)
  'Malli, koheda yanne?': { say: 'මල්ලි, කොහෙද යන්නේ?', lang: 'si' },
  'Hari. Api balamu.': { say: 'හරි. අපි බලමු.', lang: 'si' },

  // Sri Lankan Malay (Uncle Saldin, Case 4): Latin script, only the label
  'Orang Malaysia tu datang lagi semalam. Dua teh. Minum satu.': { lang: 'ms' },

  // Case 5: Tamil (Bala Anne, Daniel Raj), Cantonese (Uncle Wong), Malay (labels only, Latin script)
  'Thambi. Idhu andha Sinar dhaane?': { say: 'தம்பி. இது அந்த சினார் தானே?', lang: 'ta' },
  'Mannichidu, machan.': { say: 'மன்னிச்சிடு, மச்சான்.', lang: 'ta' },
  'Sap sei lau? Mou sap sei lau gaa.': { say: '十四樓？冇十四樓㗎。', lang: 'yue' },
  'Sap sei. Sat sei.': { say: '十四。實死。', lang: 'yue' },
  'Yang ini, aku punya.': { lang: 'ms' },
  'Maafkan Abah.': { lang: 'ms' },
  'Tekanan kerja. Dia terjun.': { lang: 'ms' },
  'Dia suruh saya jangan menangis. Saya menangis juga.': { lang: 'ms' },

  // Case 6: Tamil (Bala Anne), Cantonese (Ah Fook), Malay (labels only, Latin script)
  'Thambi. Unakku oru phone vandhuchu. Rendu naal munnaadi.': { say: 'தம்பி. உனக்கு ஒரு ஃபோன் வந்துச்சு. ரெண்டு நாள் முன்னாடி.', lang: 'ta' },
  'Saapittiya, thambi?': { say: 'சாப்பிட்டியா, தம்பி?', lang: 'ta' },
  'Go go lou baak… ngo laai m zyu keoi.': { say: '嗰個老伯……我拉唔住佢。', lang: 'yue' },
  'Biarkan, Tuan Ismail. Biar dua-dua sekali.': { lang: 'ms' },
  'Mana kau punya?': { lang: 'ms' },

  // Cantonese (Ken Lim, Lau Kim Hock)
  'Ah Hock Suk hai ngo suk fu ah. Bong ngo yat ci. Ngo kau neih.': { say: '阿Hock叔係我叔父啊。幫我一次。我求你。' },
  'Go bui kopi… hou fu. Hou fu.': { say: '嗰杯kopi……好苦。好苦。' },
  'Ho sam ge sai lou. Ngo mou zaak keoi.': { say: '好心嘅細路。我冇怪佢。' },
  'Di cin fan lai zau dak lah.': { say: '啲錢返嚟就得啦。' },
};

// Who voices a caption speaker, when the caption hides it ("Woman" on the phone is a different person
// in each case; "???" in the intro's dream is Daniel). Keys: "<where>|<who>" or just "<who>", where
// <where> is "intro", "<caseId>:opening" or "<caseId>:ending". The voice map in /admin is keyed by
// these cast names, so Rachel's phone call and Rachel on screen share one voice.
export const VOICE_CAST = {
  'intro|Woman': 'Rachel Goh',
  'case02:opening|Woman': 'Salmah',
  'case03:opening|Woman': 'Jo Lim',
  'case04:opening|Woman': 'Tharshini Yogeswaran',
  '???': 'Daniel Raj',
  // Case 6: the voice at the tape line in 2021 and on Bala Anne's telephone is the Chairman
  'case06:opening|A voice': 'The Chairman',
  'case06:ending|A voice': 'The Chairman',
};
