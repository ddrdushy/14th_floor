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
  '???': 'Daniel Raj',
};
