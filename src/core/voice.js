// Voice line ids. Pure functions, no DOM: shared by the game (cinema.js via voice-player.js), the
// build script (scripts/build-voice-manifest.mjs) and the Pages Functions (functions/api/voice/*).
//
// A line's id is a stable hash of its speaker and the text as actually spoken (orig || en), so the
// same sentence said by the same person is generated once, wherever it appears. Narration lines
// (who: null) belong to the speaker "Narrator".
//
// Lines that contain the player's name (endings use `${v.you}`) are stored in the manifest with the
// placeholder {you}; the game tries the literal text first, then the text with the player's name
// swapped back to {you}. The voice says "Detective" in its place.

export const NARRATOR = 'Narrator';
export const YOU_TOKEN = '{you}';
export const YOU_SPOKEN = 'Detective';

const clean = (s) => String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();

/** The speaker a line is voiced by. */
export const speakerOf = (line) => (line && line.who ? clean(line.who) : NARRATOR);

/** The text as spoken on screen (the original language when there is one). */
export const spokenOf = (line) => clean(line?.orig || line?.en || '');

/** Text with stage cues like "[Incoming call]" removed. Empty means there is nothing to say. */
export const withoutCues = (s) => clean(String(s ?? '').replace(/\[[^\]]*\]/g, ' '));

/** Does this line have anything to say out loud? Sound cues alone ("[Incoming call]") do not. */
export const isVoiceable = (line) => /[\p{L}\p{N}]/u.test(withoutCues(spokenOf(line)));

/** cyrb53: a small, well-spread 53-bit string hash. Same result in browsers, Node and Workers. */
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** Short hash of any string: 11 base-36 characters. */
export const hashText = (s) => cyrb53(String(s)).toString(36).padStart(11, '0');

/** The id for a speaker + spoken text. */
export const voiceId = (speaker, text) => hashText(`${clean(speaker).toLowerCase()}␟${clean(text)}`);

/** The manifest id of a line, ignoring the player's name. */
export const lineId = (line) => voiceId(speakerOf(line), spokenOf(line));

/**
 * Ids to try for a line on screen, most specific first: the literal text, then (when the player's
 * name appears in it) the text with the name put back as {you}.
 */
export function lineIdCandidates(line, { you } = {}) {
  const speaker = speakerOf(line);
  const text = spokenOf(line);
  const out = [voiceId(speaker, text)];
  const name = clean(you);
  if (name.length >= 2 && text.includes(name)) out.push(voiceId(speaker, text.split(name).join(YOU_TOKEN)));
  return out;
}

/** Slug used in KV keys: "Inspector Farah Iskandar" -> "inspector-farah-iskandar". */
export const speakerSlug = (name) => clean(name).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'x';

// ---------- language guess ----------
// Captions are always English; `orig` is Malay, Tamil (romanised), Cantonese (romanised), Penang
// Hokkien (romanised) or Manglish. This is a guess from a few common words, good enough to label
// lines in /admin and to pick the TTS `language` hint.
const WORDS = {
  ms: 'saya aku kau dia kita kami encik cik tak takkan tidak tiada bukan jangan tengok pandang belakang balik dari kerja dah sudah belum dua malam polis kata lari ikut perempuan lain tinggalkan anak seorang lelaki dekat pintu pagar pelabuhan orang kebakaran tu ni ini itu datang juga masuk sampai sekarang keluar dewasa hilang hari unsur jenayah fail ditutup sebelum dibuka buka tutup boleh terima kasih tahu nak cakap apa lagi sekurang-kurangnya kebumikan tulis semua hantar pada setiap hujan lebat sikit ya macam duty mana sini sana dengan yang untuk tua patut ada kat situ',
  ta: 'neenga nee naan anga inga poga ponga poonga vendaam vendam thambi anne anna akka amma appa andha indha oor oor-la ellaame ellam dhaan thaan mazhai vida mosam saapittu kondu koodaadhu mela enna illa romba nalla seri vaa po machan da di',
  yue: 'ngo nei neih keoi hai ge gam dak zau di cin fan lai sam sai lou zaak mou suk fu bong yat ci kau hou go bui m goi laa me gwo zo sik',
  'zh-hokkien': 'wa lu i e kiann kong si liao tng bo beh tsiah chiak lang boh sim kua ah',
};
const WORDSETS = Object.fromEntries(Object.entries(WORDS).map(([k, v]) => [k, new Set(v.split(' '))]));

/** 'ms' | 'ta' | 'yue' | 'zh-hokkien' | 'zh' | 'en' */
export function guessLang(line) {
  const text = spokenOf(line);
  if (/[஀-௿]/.test(text)) return 'ta';
  if (/[㐀-鿿]/.test(text)) return 'zh';
  if (!line?.orig || clean(line.orig) === clean(line.en)) return 'en';
  const words = text.toLowerCase().replace(/[^\p{L}\s-]/gu, ' ').split(/\s+/).filter(Boolean);
  let best = 'en', bestScore = 0;
  for (const [lang, set] of Object.entries(WORDSETS)) {
    const score = words.filter((w) => set.has(w)).length / Math.max(1, words.length);
    if (score > bestScore) { best = lang; bestScore = score; }
  }
  return bestScore >= 0.25 ? best : 'en';
}

export const LANG_LABELS = { en: 'English', ms: 'Malay', ta: 'Tamil', yue: 'Cantonese', 'zh-hokkien': 'Penang Hokkien', zh: 'Chinese' };

// ---------- the player's voice ----------
// "You" lines are spoken by the player's detective, so they can have a voice per portrait
// (src/core/avatar.js PORTRAITS; the profile stores the choice as profile.portrait).
export const PLAYER = 'You';
export const DET_RE = /^det_0[1-8]$/;
export const DETECTIVES = [
  { id: 'det_01', label: 'Indian man, 50s' },
  { id: 'det_02', label: 'Malay woman in a tudung, 30s' },
  { id: 'det_03', label: 'Chinese man, 30s' },
  { id: 'det_04', label: 'Indian woman, 30s' },
  { id: 'det_05', label: 'Malay man, 50s' },
  { id: 'det_06', label: 'Chinese woman, 30s' },
  { id: 'det_07', label: 'Malay / Eurasian man, 30s' },
  { id: 'det_08', label: 'Malay / Sabahan woman, 40s' },
];
/** The portrait id of a profile, or null. */
export function portraitOf(profile) {
  const d = profile?.portrait || profile?.look?.portrait;
  return typeof d === 'string' && DET_RE.test(d) ? d : null;
}
