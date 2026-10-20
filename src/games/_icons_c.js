// Small procedural icon library shared by the hidden object and rebus games.
// Every icon is an SVG fragment centred on 0,0 inside roughly a 40 x 40 box.
// icon(name, fill) returns markup; the optional fill recolours the main surface.

const K = '#1d1a16';
const ST = `stroke="${K}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
const TH = `stroke="${K}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"`;

function star(r1, r2, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const r = i % 2 ? r2 : r1;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

const DRAW = {
  key: (f = '#c9a43a') => `<path d="M-2 -2.2 H17 V2.2 H15 V6 H11.5 V2.2 H9 V5 H6 V2.2 H-2Z" fill="${f}" ${ST}/><circle cx="-9" r="7.5" fill="${f}" ${ST}/><circle cx="-11" r="2.5" fill="#efe7d4" ${ST}/>`,
  coin: (f = '#c9a43a') => `<circle r="8" fill="${f}" ${ST}/><circle r="5.6" fill="none" stroke="${K}" stroke-width=".7" opacity=".6"/><text y="2.4" font-size="6.5" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="${K}" opacity=".7">50</text>`,
  pen: (f = '#2a2d33') => `<g transform="rotate(-30)"><rect x="-17" y="-2.6" width="27" height="5.2" rx="2" fill="${f}" ${ST}/><path d="M10 -2.6 L17 0 L10 2.6Z" fill="#d9cdb0" ${ST}/><rect x="-14" y="-4.6" width="10" height="2" rx=".8" fill="#c9a43a" ${TH}/></g>`,
  pencil: (f = '#e8b830') => `<g transform="rotate(25)"><rect x="-16" y="-2.6" width="24" height="5.2" fill="${f}" ${ST}/><path d="M8 -2.6 L16 0 L8 2.6Z" fill="#e8d2a8" ${ST}/><path d="M13.6 -.9 L16 0 L13.6 .9Z" fill="${K}"/><rect x="-19.5" y="-2.6" width="3.5" height="5.2" fill="#d8808a" ${ST}/></g>`,
  phone: (f = '#2a2d33') => `<rect x="-7.5" y="-14" width="15" height="28" rx="3" fill="${f}" ${ST}/><rect x="-5.5" y="-10.5" width="11" height="19" fill="#5a7a8a"/><circle cy="11.2" r="1.2" fill="#9aa4a8"/>`,
  lighter: (f = '#c8312c') => `<rect x="-5" y="-12" width="10" height="7" fill="#b8bcc0" ${ST}/><circle cx="1.5" cy="-8.5" r="2" fill="#555"/><rect x="-5" y="-5" width="10" height="17" rx="2" fill="${f}" ${ST}/>`,
  matchbox: (f = '#e8a33d') => `<rect x="-12" y="-8" width="24" height="16" rx="1" fill="${f}" ${ST}/><rect x="-12" y="-8" width="24" height="3.5" fill="#6a3a20"/><circle cy="2" r="3.5" fill="#c8312c"/><g transform="rotate(-10)"><rect x="-6" y="9.5" width="16" height="1.8" fill="#e8d2a8" ${TH}/><circle cx="-6" cy="10.4" r="1.8" fill="#b3202a"/></g>`,
  glasses: (f = '#9fc3d0') => `<path d="M-2 -1 Q0 -3.5 2 -1 M-14 -1 L-18 -5 M14 -1 L18 -5" fill="none" ${ST}/><circle cx="-8" r="6" fill="${f}" fill-opacity=".55" ${ST} stroke-width="2.2"/><circle cx="8" r="6" fill="${f}" fill-opacity=".55" ${ST} stroke-width="2.2"/>`,
  watch: (f = '#d8d4c8') => `<rect x="-4.5" y="-15" width="9" height="30" rx="2" fill="#5a3a24" ${ST}/><circle r="7.5" fill="${f}" ${ST}/><path d="M0 0 V-5 M0 0 L3.5 1.5" stroke="${K}" stroke-width="1.3" stroke-linecap="round"/>`,
  ring: (f = '#d8b040') => `<circle cy="2" r="7" fill="none" stroke="${K}" stroke-width="4.8"/><circle cy="2" r="7" fill="none" stroke="${f}" stroke-width="2.8"/><path d="M-3.5 -5.5 L0 -11 L3.5 -5.5 L0 -3.5Z" fill="#bfe6f0" ${ST}/>`,
  paperclip: (f = '#b8bcc0') => {
    const d = 'M-3 11 V-8 A4 4 0 0 1 5 -8 V8 A2.6 2.6 0 0 1 -0.2 8 V-5';
    return `<g transform="rotate(20)"><path d="${d}" fill="none" stroke="${K}" stroke-width="3.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${f}" stroke-width="1.6" stroke-linecap="round"/></g>`;
  },
  scissors: (f = '#c8312c') => `<path d="M-6 -3.5 L17 3 L-5 -.5Z" fill="#b8bcc0" ${ST}/><path d="M-6 3.5 L17 -3 L-5 .5Z" fill="#b8bcc0" ${ST}/><circle cx="-10" cy="-5" r="4" fill="none" stroke="${K}" stroke-width="4"/><circle cx="-10" cy="-5" r="4" fill="none" stroke="${f}" stroke-width="2.2"/><circle cx="-10" cy="5" r="4" fill="none" stroke="${K}" stroke-width="4"/><circle cx="-10" cy="5" r="4" fill="none" stroke="${f}" stroke-width="2.2"/><circle cx="1" r="1" fill="${K}"/>`,
  knife: (f = '#3a2a20') => `<path d="M-2 -3 L16 -3 Q17 1 11 3 L-2 3Z" fill="#c8ccd0" ${ST}/><rect x="-16" y="-3.5" width="14" height="7" rx="2" fill="${f}" ${ST}/><circle cx="-12" r=".9" fill="#ddd"/><circle cx="-6" r=".9" fill="#ddd"/>`,
  bullet: (f = '#d8b040') => `<rect x="-3.5" y="-2" width="7" height="13" fill="${f}" ${ST}/><path d="M-3.5 -2 V-6 Q0 -15 3.5 -6 V-2Z" fill="#b87a40" ${ST}/><rect x="-4.2" y="10" width="8.4" height="2.4" fill="#c09030" ${TH}/>`,
  cassette: (f = '#2a2d33') => `<rect x="-15" y="-10" width="30" height="20" rx="2" fill="${f}" ${ST}/><rect x="-11" y="-6.5" width="22" height="8" rx="1" fill="#e8dcc0"/><circle cx="-6" cy="-2.5" r="2.6" fill="${f}"/><circle cx="6" cy="-2.5" r="2.6" fill="${f}"/><path d="M-8 10 L-6 5 H6 L8 10" fill="none" ${TH} stroke="#9aa4a8"/>`,
  usb: (f = '#3d6b9a') => `<rect x="-3.5" y="-14" width="7" height="6" fill="#c8ccd0" ${ST}/><rect x="-2" y="-12.4" width="1.4" height="1.4" fill="${K}"/><rect x=".6" y="-12.4" width="1.4" height="1.4" fill="${K}"/><rect x="-5" y="-8" width="10" height="17" rx="2" fill="${f}" ${ST}/>`,
  envelope: (f = '#f3ecda') => `<rect x="-15" y="-10" width="30" height="20" fill="${f}" ${ST}/><path d="M-15 -10 L0 2 L15 -10" fill="none" ${ST}/>`,
  stamp: (f = '#3f7d5a') => `<rect x="-9" y="-11" width="18" height="22" fill="#f8f4ea" stroke="${K}" stroke-width="1.4" stroke-dasharray="1.6 1.2"/><rect x="-6" y="-8" width="12" height="12" fill="${f}"/><circle cy="-2" r="3" fill="#f3ecda" opacity=".7"/><text y="9" font-size="4" text-anchor="middle" font-family="sans-serif" fill="${K}">50 SEN</text>`,
  button: (f = '#7a3a7a') => `<circle r="6.5" fill="${f}" ${ST}/><g fill="${K}"><circle cx="-1.8" cy="-1.8" r="1"/><circle cx="1.8" cy="-1.8" r="1"/><circle cx="-1.8" cy="1.8" r="1"/><circle cx="1.8" cy="1.8" r="1"/></g>`,
  battery: (f = '#2a2d33') => `<rect x="-12" y="-5.5" width="22" height="11" rx="1.5" fill="${f}" ${ST}/><rect x="10" y="-2.5" width="3" height="5" fill="#b8bcc0" ${TH}/><rect x="-12" y="-5.5" width="8" height="11" rx="1.5" fill="#e8a33d" ${ST}/>`,
  lock: (f = '#c9a43a') => `<path d="M-6 -2 V-7 A6 6 0 0 1 6 -7 V-2" fill="none" stroke="${K}" stroke-width="4.2"/><path d="M-6 -2 V-7 A6 6 0 0 1 6 -7 V-2" fill="none" stroke="#b8bcc0" stroke-width="2.2"/><rect x="-9" y="-2" width="18" height="15" rx="2" fill="${f}" ${ST}/><circle cy="4" r="1.8" fill="${K}"/><rect x="-.7" y="4" width="1.4" height="4.5" fill="${K}"/>`,
  teacup: (f = '#ede6d6') => `<ellipse cy="9" rx="15" ry="3.5" fill="#f3ecda" ${ST}/><path d="M10 -2 Q17 -1 9 5" fill="none" stroke="${K}" stroke-width="2.6"/><path d="M-10 -5 H10 L8 6 Q0 10 -8 6Z" fill="${f}" ${ST}/><ellipse cy="-5" rx="10" ry="2.4" fill="#b87a40" ${ST}/>`,
  spoon: (f = '#c8ccd0') => `<g transform="rotate(30)"><rect x="-1.3" y="-5" width="2.6" height="19" rx="1.3" fill="${f}" ${ST}/><ellipse cy="-10" rx="4.5" ry="6" fill="${f}" ${ST}/></g>`,
  fork: (f = '#c8ccd0') => `<g transform="rotate(-25)"><path d="M-4.5 -16 V-8 Q-4.5 -4 0 -4 Q4.5 -4 4.5 -8 V-16 M-1.5 -16 V-7 M1.5 -16 V-7" fill="none" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/><rect x="-1.3" y="-4.5" width="2.6" height="19" rx="1.3" fill="${f}" ${ST}/></g>`,
  chili: (f = '#c8312c') => `<path d="M-12 -6 Q-2 -6 6 2 Q12 9 14 14 Q4 12 -4 4 Q-10 -1 -12 -6Z" fill="${f}" ${ST}/><path d="M-12 -6 Q-15 -9 -14 -13" fill="none" stroke="#3f7d5a" stroke-width="2.8" stroke-linecap="round"/>`,
  egg: (f = '#ecdcc0') => `<path d="M0 -11 C7 -11 9 2 8 5 C6 11 -6 11 -8 5 C-9 2 -7 -11 0 -11Z" fill="${f}" ${ST}/><path d="M-4 -5 Q-3 -8 -1 -8.5" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`,
  bottle: (f = '#3f7d5a') => `<path d="M-3 -15 H3 V-9 Q7 -6 7 -1 V14 H-7 V-1 Q-7 -6 -3 -9Z" fill="${f}" ${ST}/><rect x="-7" y="0" width="14" height="7" fill="#f3ecda" ${TH}/><rect x="-3.4" y="-18" width="6.8" height="3.4" fill="#c9a43a" ${ST}/>`,
  can: (f = '#b3202a') => `<rect x="-7" y="-11" width="14" height="22" rx="1.5" fill="${f}" ${ST}/><path d="M-7 -1 H7" stroke="#f3ecda" stroke-width="3"/><ellipse cy="-11" rx="7" ry="2" fill="#c8ccd0" ${ST}/>`,
  card: (f = '#b3202a') => `<rect x="-9" y="-13" width="18" height="26" rx="2" fill="#f8f4ea" ${ST}/><path d="M0 -6 L5 0 L0 6 L-5 0Z" fill="${f}"/><text x="-5.5" y="-7" font-size="5.5" text-anchor="middle" font-family="serif" font-weight="700" fill="${f}">A</text>`,
  dice: (f = '#f8f4ea') => `<rect x="-9" y="-9" width="18" height="18" rx="3" fill="${f}" ${ST}/><g fill="${K}"><circle cx="-4.5" cy="-4.5" r="1.7"/><circle r="1.7"/><circle cx="4.5" cy="4.5" r="1.7"/></g>`,
  comb: (f = '#2a2d33') => `<path d="${Array.from({ length: 12 }, (_, i) => `M${-13 + i * 2.4} -1 V6`).join(' ')}" stroke="${f}" stroke-width="1.5"/><rect x="-15" y="-6" width="30" height="5.5" rx="1.5" fill="${f}" ${ST}/>`,
  lipstick: (f = '#c8312c') => `<path d="M-2.8 -5 V-12 L2.8 -15 V-5Z" fill="${f}" ${ST}/><rect x="-3.6" y="-5" width="7.2" height="5" fill="#c9a43a" ${ST}/><rect x="-4.5" y="0" width="9" height="13" rx="1" fill="#2a2d33" ${ST}/>`,
  badge: (f = '#c9a43a') => `<path d="M0 -14 L11 -9 V1 Q11 10 0 14 Q-11 10 -11 1 V-9Z" fill="${f}" ${ST}/><polygon points="${star(6.5, 2.8)}" fill="#8a6a1a"/>`,
  magnifier: (f = '#5a3a24') => `<line x1="5" y1="5" x2="15" y2="15" stroke="${K}" stroke-width="5.4" stroke-linecap="round"/><line x1="5" y1="5" x2="15" y2="15" stroke="${f}" stroke-width="3" stroke-linecap="round"/><circle cx="-3" cy="-3" r="9" fill="#bfe6f0" fill-opacity=".45" stroke="${K}" stroke-width="3"/>`,
  torch: (f = '#2a2d33') => `<rect x="-14" y="-3.5" width="20" height="7" rx="1.5" fill="${f}" ${ST}/><path d="M6 -3.5 L13 -7 V7 L6 3.5Z" fill="#b8bcc0" ${ST}/><rect x="-6" y="-5.2" width="3.4" height="1.8" fill="#c8312c"/>`,
  screwdriver: (f = '#e8a33d') => `<g transform="rotate(-20)"><rect x="-4" y="-1.2" width="18" height="2.4" fill="#b8bcc0" ${TH}/><rect x="13" y="-2" width="3" height="4" fill="#8a9096"/><rect x="-16" y="-3.6" width="12" height="7.2" rx="3" fill="${f}" ${ST}/></g>`,
  tape: (f = '#9a9ea2') => `<circle r="10" fill="${f}" ${ST}/><circle r="5" fill="#ede6d6" ${ST}/><path d="M9 4 L16 9 L14 12 L7 8" fill="${f}" ${TH}/>`,
  candle: (f = '#f3ecda') => `<path d="M0 -16 Q3.5 -11 0 -8 Q-3.5 -11 0 -16Z" fill="#e8a33d" ${ST}/><rect x="-4" y="-7" width="8" height="19" fill="${f}" ${ST}/>`,
  simcard: (f = '#f3ecda') => `<path d="M-6 -9 H3 L7 -5 V9 H-6Z" fill="${f}" ${ST}/><rect x="-3.5" y="-2" width="7" height="6" rx="1" fill="#c9a43a" ${TH}/>`,
  ticket: (f = '#e8a33d') => `<path d="M-15 -7 H15 V-2 A2 2 0 0 0 15 2 V7 H-15 V2 A2 2 0 0 0 -15 -2Z" fill="${f}" ${ST}/><path d="M-8 -7 V7" stroke="${K}" stroke-dasharray="1.5 1.5"/><text x="3.5" y="2" font-size="5" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="${K}">ADMIT</text>`,
  photo: (f = '#5a7a8a') => `<rect x="-11" y="-13" width="22" height="26" fill="#f8f4ea" ${ST}/><rect x="-8.5" y="-10.5" width="17" height="16" fill="${f}"/><circle cy="-4" r="3" fill="#2a2d33"/><path d="M-6 5.5 Q0 -3 6 5.5Z" fill="#2a2d33"/>`,
  notebook: (f = '#3d6b9a') => `<rect x="-10" y="-13" width="20" height="26" rx="1" fill="${f}" ${ST}/><path d="M-12.5 -9 h4 M-12.5 -4 h4 M-12.5 1 h4 M-12.5 6 h4 M-12.5 11 h4" stroke="${K}" stroke-width="1.6"/><rect x="-4" y="-7" width="10" height="5" fill="#f3ecda"/>`,
  calculator: (f = '#3a3d42') => `<rect x="-10" y="-14" width="20" height="28" rx="2" fill="${f}" ${ST}/><rect x="-7.5" y="-11.5" width="15" height="6" fill="#a8c0a0"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${-7.5 + (i % 3) * 5.5}" y="${-3 + Math.floor(i / 3) * 4.2}" width="4" height="3" rx=".6" fill="#c8ccd0"/>`).join('')}`,
  whistle: (f = '#b8bcc0') => `<path d="M-15 -6 H3 A8 8 0 1 1 -5 4 H-15Z" fill="${f}" ${ST}/><circle cx="3" cy="2" r="3" fill="#6a7076"/><rect x="-11" y="-6" width="3" height="3" fill="${K}"/>`,
  syringe: (f = '#c8312c') => `<g transform="rotate(-30)"><line x1="8" y1="0" x2="18" y2="0" stroke="${K}" stroke-width="1.1"/><rect x="-10" y="-3" width="18" height="6" fill="#e8eef0" ${ST}/><rect x="-5" y="-2.2" width="12" height="4.4" fill="${f}" opacity=".65"/><rect x="-14" y="-1" width="4" height="2" fill="#8a9096"/><rect x="-15.5" y="-4.5" width="1.8" height="9" fill="#8a9096" ${TH}/></g>`,
  pills: (f = '#e8a33d') => `<rect x="-7" y="-8" width="14" height="19" rx="2" fill="${f}" ${ST}/><rect x="-7" y="-2" width="14" height="7" fill="#f8f4ea" ${TH}/><rect x="-8" y="-13" width="16" height="5" rx="1" fill="#f3ecda" ${ST}/>`,
  mahjong: (f = '#3f7d5a') => `<rect x="-8" y="-11" width="16" height="22" rx="2" fill="#f3ecda" ${ST}/><rect x="-8" y="7" width="16" height="4" rx="1" fill="${f}"/><circle cy="-5.5" r="2.4" fill="#3d6b9a"/><circle cy="1" r="2.4" fill="#c8312c"/><circle cx="-4" cy="-2.2" r="1.4" fill="${f}"/><circle cx="4" cy="-2.2" r="1.4" fill="${f}"/>`,
  gun: (f = '#2a2d33') => `<path d="M-16 -9 H15 V-3 H-1 Q-1 3 -5 3 L-7 12 H-15 L-12 -3 H-16Z" fill="${f}" ${ST}/><path d="M-1 -3 Q2 5 -5 5" fill="none" stroke="${K}" stroke-width="1.6"/><path d="M-12 -7 H12" stroke="#6a7076" stroke-width="1"/>`,
  clock: (f = '#f3ecda') => `<circle r="12.5" fill="${f}" ${ST} stroke-width="2.4"/>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<line x1="${(Math.sin(a) * 9.5).toFixed(2)}" y1="${(-Math.cos(a) * 9.5).toFixed(2)}" x2="${(Math.sin(a) * 11).toFixed(2)}" y2="${(-Math.cos(a) * 11).toFixed(2)}" stroke="${K}" stroke-width="1"/>`; }).join('')}<path d="M0 0 V-8 M0 0 L6 3" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>`,
  bell: (f = '#d8b040') => `<rect x="-1.6" y="-14.5" width="3.2" height="4" fill="${f}" ${ST}/><circle cy="10" r="2.8" fill="${f}" ${ST}/><path d="M-11.5 8 Q-9 6 -8 -2 Q-7 -11 0 -11 Q7 -11 8 -2 Q9 6 11.5 8Z" fill="${f}" ${ST}/>`,
  tie: (f = '#b3202a') => `<path d="M-3.5 -15 H3.5 L2 -10 L6.5 9 L0 15 L-6.5 9 L-2 -10Z" fill="${f}" ${ST}/><path d="M-4 -3 L4.5 -6 M-5 4 L5.5 1" stroke="#f3ecda" stroke-width="1.4" opacity=".7"/>`,
  cup: (f = '#3d6b9a') => `<path d="M6 -5 Q13 -5 13 0 Q13 5 6 5" fill="none" stroke="${K}" stroke-width="2.8"/><rect x="-9" y="-10" width="15" height="20" rx="2" fill="${f}" ${ST}/>`,
  sun: (f = '#e8b830') => `${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<line x1="${(Math.cos(a) * 11).toFixed(2)}" y1="${(Math.sin(a) * 11).toFixed(2)}" x2="${(Math.cos(a) * 17).toFixed(2)}" y2="${(Math.sin(a) * 17).toFixed(2)}" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>`; }).join('')}<circle r="8.5" fill="${f}" ${ST}/>`,
  bee: (f = '#e8b830') => `<ellipse cx="-4" cy="-8" rx="4.5" ry="7" transform="rotate(-25 -4 -8)" fill="#e8eef0" ${ST}/><ellipse cx="5" cy="-8" rx="4.5" ry="7" transform="rotate(25 5 -8)" fill="#e8eef0" ${ST}/><path d="M-11 0 L-16 0" stroke="${K}" stroke-width="1.6"/><ellipse rx="11" ry="7.5" fill="${f}" ${ST}/><path d="M-3 -7 V7 M3 -7 V7" stroke="${K}" stroke-width="2.6"/><circle cx="8" cy="-1.5" r="1.2" fill="${K}"/>`,
  eye: (f = '#5a7a4a') => `<path d="M-17 0 Q0 -13 17 0 Q0 13 -17 0Z" fill="#f8f4ea" ${ST}/><circle r="5.5" fill="${f}" ${ST}/><circle r="2.4" fill="${K}"/><circle cx="1.6" cy="-1.6" r="1" fill="#fff"/>`,
  car: (f = '#c8312c') => `<path d="M-17 5 V-1 Q-16 -3.5 -12 -3.5 L-8 -10 H6 L11 -3.5 Q16 -3.5 17 0 V5Z" fill="${f}" ${ST}/><path d="M-6.5 -8 H-1 V-3.5 H-9.5Z M1 -8 H5 L8.5 -3.5 H1Z" fill="#bfe6f0" ${TH}/><circle cx="-9" cy="5" r="3.8" fill="#2a2d33" ${ST}/><circle cx="9" cy="5" r="3.8" fill="#2a2d33" ${ST}/>`,
  hand: (f = '#d8a878') => `<path d="M-6 15 L-8 4 L-14 -4 Q-13 -8 -9.5 -5.5 L-6 -1 V-12 Q-4.5 -14.5 -3 -12 V-3 V-15 Q-1.5 -17.5 0 -15 V-3 V-13.5 Q1.5 -16 3 -13.5 V-2 V-9.5 Q4.5 -12 6 -9.5 V4 Q6 11 3 15Z" fill="${f}" ${ST}/>`,
  foot: (f = '#d8a878') => `<path d="M-6 -4 Q-8 6 -5 12 Q-1 17 3 13 Q5 8 4 3 Q6 -3 5 -7 Q1 -10 -6 -4Z" fill="${f}" ${ST}/><circle cx="-5" cy="-9" r="2.6" fill="${f}" ${ST}/><circle cx="-0.6" cy="-11.4" r="2.2" fill="${f}" ${ST}/><circle cx="3.4" cy="-11.2" r="1.9" fill="${f}" ${ST}/><circle cx="6.6" cy="-9.4" r="1.6" fill="${f}" ${ST}/><circle cx="8.6" cy="-6.6" r="1.4" fill="${f}" ${ST}/>`,
  door: (f = '#7a5030') => `<rect x="-9" y="-16" width="18" height="32" fill="${f}" ${ST}/><rect x="-6" y="-13" width="12" height="11" fill="none" stroke="${K}" stroke-width=".9"/><rect x="-6" y="1" width="12" height="12" fill="none" stroke="${K}" stroke-width=".9"/><circle cx="5.6" cy="-.5" r="1.5" fill="#c9a43a" ${TH}/>`,
  star: (f = '#e8b830') => `<polygon points="${star(15, 6.5)}" fill="${f}" ${ST}/>`,
  fish: (f = '#5a7a8a') => `<path d="M7 0 L15 -7 V7Z" fill="${f}" ${ST}/><path d="M-14 0 Q-3 -11 8 0 Q-3 11 -14 0Z" fill="${f}" ${ST}/><circle cx="-8" cy="-1.5" r="1.3" fill="${K}"/><path d="M-3 -5 Q0 0 -3 5" fill="none" stroke="${K}" stroke-width="1"/>`,
  hook: (f = '#8a9096') => `<path d="M3 -12 V5 Q3 12 -3.5 12 Q-10 12 -10 5 L-6.5 2" fill="none" stroke="${K}" stroke-width="3.6" stroke-linecap="round"/><path d="M3 -12 V5 Q3 12 -3.5 12 Q-10 12 -10 5 L-6.5 2" fill="none" stroke="${f}" stroke-width="1.6" stroke-linecap="round"/><circle cx="3" cy="-14" r="2.4" fill="none" stroke="${K}" stroke-width="1.8"/>`,
  ear: (f = '#d8a878') => `<path d="M-6 9 Q-9 15 -2 15 Q2 15 3 10 Q4 6 7 3 Q11 -2 9 -8 Q6 -15 -2 -14.5 Q-9 -14 -9.5 -6 Q-9.5 -3 -8 -1" fill="${f}" ${ST}/><path d="M-4.5 -6 Q-3 -10.5 1.5 -9 Q5 -7 3.5 -2.5 Q2 1 -1 2 Q-3 3 -3 6" fill="none" stroke="${K}" stroke-width="1.4" stroke-linecap="round"/>`,
  cloud: (f = '#9aa6b0') => `<path d="M-9 8 L-11 13 M-2 8 L-4 13 M5 8 L3 13 M12 8 L10 13" stroke="#3d6b9a" stroke-width="1.8" stroke-linecap="round"/><path d="M-12 5 Q-18 5 -17 -1 Q-16 -6 -10 -5 Q-8 -12 0 -11 Q7 -12 9 -5 Q16 -6 16 0 Q16 5 10 5Z" fill="${f}" ${ST}/>`,
  bow: (f = '#c8312c') => `<path d="M-1 1 L-5 13 L-2 12 L0 14 M1 1 L5 13 L2 12 L0 14" fill="none" stroke="${K}" stroke-width="1.4"/><path d="M0 0 L-14 -8 Q-16 0 -14 8Z M0 0 L14 -8 Q16 0 14 8Z" fill="${f}" ${ST}/><circle r="3" fill="${f}" ${ST}/>`,
  pan: (f = '#2a2d33') => `<rect x="5" y="-2.2" width="13" height="4.4" rx="2" fill="#5a3a24" ${ST}/><circle cx="-4" r="10.5" fill="${f}" ${ST}/><circle cx="-4" r="7.2" fill="#4a4e55"/>`,
  bat: (f = '#2a2d33') => `<path d="M0 -3 Q-4 -8 -8 -5 Q-12 -10 -17 -6 Q-14 -2 -15 4 Q-11 1 -8 4 Q-5 1 -3 5 Q0 7 3 5 Q5 1 8 4 Q11 1 15 4 Q14 -2 17 -6 Q12 -10 8 -5 Q4 -8 0 -3Z" fill="${f}" ${ST}/><path d="M-2.5 -4 L-2 -8 L0 -5 L2 -8 L2.5 -4" fill="${f}" ${ST}/>`,
  pot: (f = '#8a9096') => `<path d="M-15 -1 H-18 M15 -1 H18" stroke="${K}" stroke-width="2.8" stroke-linecap="round"/><path d="M-12 -4 H12 V8 Q12 12 8 12 H-8 Q-12 12 -12 8Z" fill="${f}" ${ST}/><rect x="-14" y="-7" width="28" height="3.4" rx="1.5" fill="${f}" ${ST}/><rect x="-2.6" y="-10" width="5.2" height="3" rx="1" fill="${K}"/>`,
  moon: (f = '#e8dca0') => `<path d="M4 -13 A13 13 0 1 0 4 13 A15 15 0 0 1 4 -13Z" fill="${f}" ${ST}/>`,
  boat: (f = '#7a5030') => `<path d="M0 2 V-15 L11 -1 H0" fill="#f3ecda" ${ST}/><path d="M-16 2 H16 L11 10 H-11Z" fill="${f}" ${ST}/>`,
  pin: (f = '#c8312c') => `<path d="M0 -15 Q4 -15 4 -10 Q4 -7 2.5 -5 Q7 2 6 9 Q5 15 0 15 Q-5 15 -6 9 Q-7 2 -2.5 -5 Q-4 -7 -4 -10 Q-4 -15 0 -15Z" fill="#f8f4ea" ${ST}/><path d="M-2.8 -6.5 H2.8 M-3.2 -4.3 H3.2" stroke="${f}" stroke-width="1.3"/>`,
  glass: (f = '#8a1f2a') => `<path d="M0 1 V12 M-6 13 H6" stroke="${K}" stroke-width="2" stroke-linecap="round"/><path d="M-7.6 -6 H7.6 Q7 -1 0 1 Q-7 -1 -7.6 -6Z" fill="${f}"/><path d="M-7 -14 H7 Q8.5 -3 0 1 Q-8.5 -3 -7 -14Z" fill="#bfe6f0" fill-opacity=".35" ${ST}/>`,
  cat: (f = '#2a2d33') => `<path d="M7 12 Q17 10 14 1" fill="none" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/><path d="M-8 14 Q-11 4 -6 -2 L-8 -13 L-3 -7.5 Q0 -8.5 3 -7.5 L8 -13 L6 -2 Q11 4 8 14Z" fill="${f}" ${ST}/><circle cx="-2.5" cy="-3.5" r="1" fill="#e8b830"/><circle cx="2.5" cy="-3.5" r="1" fill="#e8b830"/>`,
};

export const ICON_NAMES = Object.keys(DRAW);

/** SVG markup for one icon, centred on 0,0. */
export function icon(name, fill) {
  const f = DRAW[name];
  return f ? f(fill || undefined) : '';
}

/** A standalone <svg> string for an icon at a given pixel size. */
export function iconSvg(name, { size = 48, fill, cls = '', label = '' } = {}) {
  return `<svg class="${cls}" viewBox="-20 -20 40 40" width="${size}" height="${size}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${icon(name, fill)}</svg>`;
}
