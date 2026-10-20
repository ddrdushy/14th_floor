// Player detective portraits. The player picks one of eight photographs (public/assets/img/det_01..08.jpg);
// each has a matching procedural SVG look that stands in while (or if) the photo is missing, and that
// old saves without a photo still use.

export const AVATAR_OPTIONS = {
  skin: ['#f1d2b6', '#d9a77f', '#b97f55', '#8d5a3a', '#5e3b26'],
  hair: ['short', 'side-part', 'long', 'bun', 'curly', 'tudung', 'shaved'],
  hairColor: ['#151210', '#3b2a1f', '#6e4a2c', '#9a9a9a'],
  coat: ['trench', 'leather', 'blazer', 'batik'],
  eyewear: ['none', 'round', 'square'],
  mark: ['none', 'stubble', 'moustache', 'scar'],
};

export const COAT_LABELS = { trench: 'Trench coat', leather: 'Leather jacket', blazer: 'Navy blazer', batik: 'Batik shirt' };
export const HAIR_LABELS = { short: 'Short', 'side-part': 'Side part', long: 'Long', bun: 'Bun', curly: 'Curly', tudung: 'Tudung', shaved: 'Shaved' };

/** The eight file photos, each with an SVG stand-in look that roughly matches it. */
export const PORTRAITS = [
  { id: 'det_01', look: { skin: '#8d5a3a', hair: 'side-part', hairColor: '#151210', coat: 'trench', eyewear: 'none', mark: 'stubble' } },
  { id: 'det_02', look: { skin: '#d9a77f', hair: 'tudung', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'none' } },
  { id: 'det_03', look: { skin: '#f1d2b6', hair: 'short', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'scar' } },
  { id: 'det_04', look: { skin: '#b97f55', hair: 'long', hairColor: '#151210', coat: 'blazer', eyewear: 'none', mark: 'none' } },
  { id: 'det_05', look: { skin: '#b97f55', hair: 'short', hairColor: '#151210', coat: 'batik', eyewear: 'none', mark: 'moustache' } },
  { id: 'det_06', look: { skin: '#f1d2b6', hair: 'side-part', hairColor: '#151210', coat: 'trench', eyewear: 'round', mark: 'none' } },
  { id: 'det_07', look: { skin: '#d9a77f', hair: 'curly', hairColor: '#3b2a1f', coat: 'blazer', eyewear: 'none', mark: 'stubble' } },
  { id: 'det_08', look: { skin: '#d9a77f', hair: 'long', hairColor: '#151210', coat: 'leather', eyewear: 'none', mark: 'none' } },
];

export const portraitUrl = (id) => `assets/img/${id}.jpg`;

/** Portrait markup for the player: the photo over its SVG stand-in (old saves: SVG only). */
export function playerPortraitSvg(profile, opts) {
  const look = { ...(profile?.look || defaultLook()) };
  if (profile?.portrait) look.portrait = profile.portrait;
  return avatarSvg(look, opts);
}

export function defaultLook() {
  return { skin: '#b97f55', hair: 'side-part', hairColor: '#151210', coat: 'trench', eyewear: 'none', mark: 'stubble' };
}

function coatSvg(coat) {
  switch (coat) {
    case 'leather':
      return `<path d="M20 240 Q30 178 100 168 Q170 178 180 240Z" fill="#1d1c1e"/>
        <path d="M100 172 L78 240 M100 172 L122 240" stroke="#3a383c" stroke-width="3"/>
        <path d="M76 168 L100 196 L124 168 L112 162 L100 178 L88 162Z" fill="#2c2b2f"/>`;
    case 'blazer':
      return `<path d="M20 240 Q30 178 100 168 Q170 178 180 240Z" fill="#1f2c45"/>
        <path d="M86 168 L100 222 L114 168Z" fill="#e9e4d8"/>
        <path d="M96 176 L100 214 L104 176Z" fill="#7a1b22"/>
        <path d="M82 166 L100 210 L92 240 M118 166 L100 210 L108 240" stroke="#15203a" stroke-width="4" fill="none"/>`;
    case 'batik':
      return `<path d="M20 240 Q30 178 100 168 Q170 178 180 240Z" fill="#7b3f1d"/>
        <g fill="none" stroke="#e8a33d" stroke-width="2.5" opacity=".8">
          <circle cx="55" cy="210" r="10"/><circle cx="145" cy="210" r="10"/><circle cx="100" cy="230" r="9"/>
          <path d="M40 232 q15 -14 30 0 M130 232 q15 -14 30 0"/>
        </g>
        <path d="M88 168 L100 186 L112 168Z" fill="#5e2e14"/>`;
    default:
      return `<path d="M18 240 Q28 176 100 166 Q172 176 182 240Z" fill="#a8895e"/>
        <path d="M70 168 L100 214 L82 240 M130 168 L100 214 L118 240" stroke="#7d6441" stroke-width="5" fill="none"/>
        <path d="M86 168 L100 200 L114 168Z" fill="#ede6d6"/>
        <circle cx="86" cy="226" r="3" fill="#5c4a30"/><circle cx="114" cy="226" r="3" fill="#5c4a30"/>`;
  }
}

function hairBack(hair, c) {
  if (hair === 'long') return `<path d="M52 92 Q48 160 64 182 L136 182 Q152 160 148 92Z" fill="${c}"/>`;
  if (hair === 'tudung') return `<path d="M44 100 Q44 40 100 36 Q156 40 156 100 L166 200 Q100 214 34 200Z" fill="#2e3a4a"/>`;
  return '';
}

function hairFront(hair, c) {
  switch (hair) {
    case 'short':
      return `<path d="M58 88 Q60 48 100 46 Q140 48 142 88 Q134 66 100 64 Q66 66 58 88Z" fill="${c}"/>`;
    case 'side-part':
      return `<path d="M56 92 Q54 44 102 44 Q146 46 144 90 Q140 70 118 62 Q90 76 62 74 Q58 82 56 92Z" fill="${c}"/>`;
    case 'long':
      return `<path d="M56 100 Q52 44 100 42 Q148 44 144 100 Q136 66 112 60 Q86 74 64 70Z" fill="${c}"/>`;
    case 'bun':
      return `<circle cx="100" cy="36" r="18" fill="${c}"/><path d="M58 90 Q58 46 100 46 Q142 46 142 90 Q132 64 100 62 Q68 64 58 90Z" fill="${c}"/>`;
    case 'curly':
      return `<g fill="${c}">${[60, 74, 88, 102, 116, 130, 142].map((x, i) => `<circle cx="${x}" cy="${58 + (i % 2) * 6}" r="14"/>`).join('')}<circle cx="56" cy="80" r="11"/><circle cx="144" cy="80" r="11"/></g>`;
    case 'tudung':
      return `<path d="M50 104 Q50 44 100 42 Q150 44 150 104 Q146 70 100 66 Q54 70 50 104Z" fill="#3a4a5e"/>
        <path d="M60 140 Q100 172 140 140 L150 176 Q100 196 50 176Z" fill="#2e3a4a"/>`;
    default:
      return `<path d="M60 84 Q62 52 100 50 Q138 52 140 84 Q120 66 100 66 Q80 66 60 84Z" fill="${c}" opacity=".45"/>`;
  }
}

/** Returns an SVG string (viewBox 200x240). */
export function avatarSvg(look = defaultLook(), { bg = '#c9bfa8', lineup = true } = {}) {
  const { skin, hair, hairColor, coat, eyewear, mark, portrait } = { ...defaultLook(), ...look };
  // a chosen photo sits on top, cropped to head and shoulders; if the file is missing the browser draws nothing and the SVG shows through
  const photo = portrait && /^det_\d\d$/.test(portrait)
    ? `<image href="${portraitUrl(portrait)}" x="-100" y="-96" width="400" height="533" preserveAspectRatio="xMidYMid slice"/>`
    : '';
  const lines = lineup
    ? Array.from({ length: 8 }, (_, i) => `<line x1="0" x2="200" y1="${30 + i * 26}" y2="${30 + i * 26}" stroke="#000" stroke-opacity=".12"/>`).join('')
    : '';
  const glasses = eyewear === 'round'
    ? `<g fill="none" stroke="#1a1a1a" stroke-width="2.5"><circle cx="84" cy="104" r="11"/><circle cx="116" cy="104" r="11"/><path d="M95 104 h10"/></g>`
    : eyewear === 'square'
      ? `<g fill="none" stroke="#1a1a1a" stroke-width="2.5"><rect x="71" y="95" width="25" height="18" rx="3"/><rect x="104" y="95" width="25" height="18" rx="3"/><path d="M96 103 h8"/></g>`
      : '';
  const marks = {
    stubble: `<path d="M74 128 Q100 160 126 128 Q122 150 100 156 Q78 150 74 128Z" fill="#000" opacity=".16"/>`,
    moustache: `<path d="M84 128 Q100 120 116 128 Q108 133 100 130 Q92 133 84 128Z" fill="${hairColor}"/>`,
    scar: `<path d="M120 86 L112 118" stroke="#7a3a2e" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`,
    none: '',
  };
  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Portrait">
    <rect width="200" height="240" fill="${bg}"/>${lines}
    ${hairBack(hair, hairColor)}
    <rect x="86" y="140" width="28" height="34" fill="${skin}"/>
    <path d="M86 156 Q100 166 114 156 L114 170 L86 170Z" fill="#000" opacity=".18"/>
    ${coatSvg(coat)}
    <ellipse cx="100" cy="104" rx="42" ry="50" fill="${skin}"/>
    <ellipse cx="58" cy="108" rx="7" ry="11" fill="${skin}"/><ellipse cx="142" cy="108" rx="7" ry="11" fill="${skin}"/>
    <path d="M100 56 Q142 60 142 104 Q140 144 100 154 Q128 130 128 100 Q126 70 100 56Z" fill="#000" opacity=".12"/>
    <path d="M76 92 q8 -5 16 0 M108 92 q8 -5 16 0" stroke="#1a1410" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="84" cy="104" rx="4" ry="3.2" fill="#1a1410"/><ellipse cx="116" cy="104" rx="4" ry="3.2" fill="#1a1410"/>
    <path d="M100 106 Q96 120 100 122 Q104 122 106 120" stroke="#000" stroke-opacity=".3" stroke-width="2" fill="none"/>
    <path d="M88 134 Q100 139 112 134" stroke="#5a2e22" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${marks[mark] || ''}${glasses}
    ${hairFront(hair, hairColor)}${photo}
  </svg>`;
}

// ---------------------------------------------------------------------------------------------
// Detective background: the choices on the profile screen beyond photo, name, pronouns and drink.
// The save stores ids only (see PROFILE_DEFAULTS in state.js); labels live here so other screens can
// show them, e.g. specialtyOf(state().profile).tag in a header.

export const HOMETOWNS = [
  { id: 'kl', label: 'Kuala Lumpur', licence: 'Kuala Lumpur' },
  { id: 'penang', label: 'Penang', licence: 'George Town, Pulau Pinang' },
  { id: 'ipoh', label: 'Ipoh', licence: 'Ipoh, Perak' },
  { id: 'jb', label: 'Johor Bahru', licence: 'Johor Bahru, Johor' },
  { id: 'kb', label: 'Kota Bharu', licence: 'Kota Bharu, Kelantan' },
  { id: 'kuching', label: 'Kuching', licence: 'Kuching, Sarawak' },
  { id: 'kk', label: 'Kota Kinabalu', licence: 'Kota Kinabalu, Sabah' },
  { id: 'melaka', label: 'Melaka', licence: 'Bandar Melaka, Melaka' },
  { id: 'seremban', label: 'Seremban', licence: 'Seremban, Negeri Sembilan' },
  { id: 'sg', label: 'Singapore-born', licence: 'Born in Singapore' },
  { id: 'jaffna', label: 'Jaffna-born', licence: 'Born in Jaffna, Sri Lanka' },
];

export const LANGUAGES = [
  { id: 'ms', label: 'Bahasa Melayu', code: 'BM' },
  { id: 'en', label: 'English', code: 'EN' },
  { id: 'ta', label: 'Tamil', code: 'TAM' },
  { id: 'yue', label: 'Cantonese', code: 'CAN' },
  { id: 'zh', label: 'Mandarin', code: 'MAN' },
  { id: 'hok', label: 'Hokkien', code: 'HOK' },
  { id: 'hak', label: 'Hakka', code: 'HAK' },
  { id: 'iba', label: 'Iban', code: 'IBA' },
  { id: 'kdz', label: 'Kadazandusun', code: 'KDZ' },
  { id: 'pa', label: 'Punjabi', code: 'PUN' },
  { id: 'te', label: 'Telugu', code: 'TEL' },
];

/** The CID unit you served in before you resigned in 2021. */
export const UNITS = [
  { id: 'd9', label: 'D9 Serious Crimes', licence: 'PDRM CID, D9 (Serious Crimes)', code: 'D9' },
  { id: 'ccid', label: 'Commercial Crime (CCID)', licence: 'PDRM, Commercial Crime (CCID)', code: 'CCID' },
  { id: 'ncid', label: 'Narcotics (NCID)', licence: 'PDRM, Narcotics (NCID)', code: 'NCID' },
  { id: 'd10', label: 'Forensics (D10)', licence: 'PDRM CID, Forensics (D10)', code: 'D10' },
  { id: 'sb', label: 'Special Branch (rumoured)', licence: 'PDRM, [redacted]', code: 'XX', redacted: true },
];

/** Specialty: flavour only. `tag` is short enough for a header chip; `perk` is one line of character. */
export const SPECIALTIES = [
  { id: 'interrogation', label: 'Interrogation', tag: 'Reads people', perk: 'Liars blink first. You are the one who notices.' },
  { id: 'forensics', label: 'Forensics', tag: 'Trace evidence', perk: 'You see the smudge before you see the fingerprint.' },
  { id: 'ciphers', label: 'Codes & ciphers', tag: 'Codebreaker', perk: 'Every pattern is a confession waiting to be read.' },
  { id: 'street', label: 'Street network', tag: 'Knows a guy', perk: 'Mamak boys, Grab uncles, and the jaga at every condo.' },
  { id: 'numbers', label: 'Numbers', tag: 'Follows the money', perk: "Ledgers don't lie. Accountants do." },
];

export const RIDES = [
  { id: 'saga', label: "Proton Saga '98", licence: 'Proton Saga, 1998. Grey. Dented.' },
  { id: 'kancil', label: 'Perodua Kancil', licence: 'Perodua Kancil. Small, but it gets there.' },
  { id: 'ex5', label: 'Honda EX5 kapcai', licence: 'Honda EX5 kapcai, 110 cc' },
  { id: 'grab', label: 'Grab driver uncle', licence: 'Grab. Same uncle, most nights.' },
  { id: 'lrt', label: 'LRT + kaki', licence: 'LRT, and two good legs' },
];

/** The thing you always have on you. Daniel's lighter is canon and the default. */
export const ITEMS = [
  { id: 'lighter', label: "Daniel's silver lighter" },
  { id: 'nokia', label: 'Cracked Nokia 3310' },
  { id: 'thread', label: 'Prayer thread (kaapu)' },
  { id: 'tasbih', label: 'Tasbih beads' },
  { id: 'suntzu', label: 'Sun Tzu paperback' },
  { id: 'pelikan', label: 'Pelikan fountain pen' },
];

const pick = (list, id) => list.find((x) => x.id === id) || list[0];

export const hometownOf = (profile) => pick(HOMETOWNS, profile?.hometown);
export const unitOf = (profile) => pick(UNITS, profile?.unit);
export const specialtyOf = (profile) => pick(SPECIALTIES, profile?.specialty);
export const rideOf = (profile) => pick(RIDES, profile?.ride);
export const itemOf = (profile) => pick(ITEMS, profile?.item);
export function languagesOf(profile) {
  const ids = Array.isArray(profile?.languages) && profile.languages.length ? profile.languages : ['ms', 'en'];
  return LANGUAGES.filter((l) => ids.includes(l.id));
}
