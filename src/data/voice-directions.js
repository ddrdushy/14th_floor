// How each voiced line is performed: Fish Audio S2 delivery cues, written per line by reading it in its scene.
// Keyed by voice id (src/data/voice-manifest.json); the comment above each entry is the line as captioned.
//
//   cue:   bracket cues put in front of the line, e.g. '[sobbing][trembling voice]'
//   say:   the whole text the voice reads, with cues where they belong: '[break]' between sentences,
//          '[long-break]' for a longer pause, '[emphasis]' right before a word. Use the line's own words
//          (for Tamil / Cantonese lines, the script in voice-overrides.js) and {you} for the player's name.
//          When both are given, say wins.
//   speed: multiplies the speaker's speed for this line (0.85 for grief, 1.1 for panic).
//
// Cues are natural language, best at the start of a sentence, at most 3 ideas per sentence
// (docs.fish.audio/developer-guide/core-features/emotions). They only reach the voice: captions never show them.
// Changing an entry changes that line's cache key, so it is generated again on the next play
// (players' browsers pick the new take up too). /admin > Voices > Lines can override any entry live (KV).
// The narrator is noir: low, measured, weary and close, with the beat changing line by line.
// A line missing here is spoken plainly; `npm run voices:manifest` lists missing and stale ids.

export const VOICE_DIRECTIONS = {

  // ---------------- intro ----------------
  // Narrator: The monsoon had been falling for three days. It never washes anything clean.
  '08ikl0tjd87': { say: '[low, weary, intimate] The monsoon had been falling for three days. [break] [quietly bitter] It never washes anything clean.', speed: 0.93 },
  // Narrator: A one-room agency above a mamak stall. A fan that stopped turning in July.
  '2fb683z4q0k': { say: '[dry, tired] A one-room agency above a mamak stall. [break] [wry] A fan that stopped turning in July.', speed: 0.95 },
  // Narrator: And a silver lighter that belonged to the only partner you ever trusted.
  '0cshpyppy6w': { say: '[soft, aching, nostalgic] And a silver lighter that belonged to the only partner you ever [emphasis] trusted.', speed: 0.92 },
  // Narrator: The same dream. Always the same dream.
  '17qubmykpwi': { say: '[haunted, almost a whisper] The same dream. [long-break] Always the same dream.', speed: 0.9 },
  // ??? (voiced as Daniel Raj): Jangan tengok belakang.  /  Don't look back.
  '1kma00zy0cp': { cue: '[urgent whisper over roaring fire][breathless]' },
  // Woman (voiced as Rachel Goh): Are you the detective from the Port Klang fire?
  '2f23yo5u24h': { cue: '[shaky, breathless, frightened]' },
  // You: Who gave you this number?
  '2g76r5jt85p': { cue: '[wary, low, guarded]' },
  // Rachel Goh: My father. Tonight at eleven, he said: if anything happens to me, do not trust the police. Call this person.
  '1ylyhf5lx2n': { say: '[trembling voice, fighting tears] My father. [break] Tonight at eleven, he said: if anything happens to me, [emphasis] do not trust the police. [break] [whispering] Call this person.', speed: 0.93 },
  // Rachel Goh: An hour ago he fell from our balcony. They're saying he jumped.
  '0d63ldpq2wa': { say: '[holding back tears] An hour ago he fell from our balcony. [break] [bitter, voice cracking] They\'re saying he jumped.', speed: 0.92 },
  // Rachel Goh: He didn't jump.
  '16b3o3lkpw8': { cue: '[break][sobbing][trembling voice]', speed: 0.85 },
  // Driver: Boss, Mont Kiara ah? Hujan lebat ni, slow sikit ya.  /  Mont Kiara, boss? Heavy rain, so we go slow, okay?
  '03bih9rpz1v': { cue: '[friendly, chatty, easygoing]' },
  // Narrator: Why would a dentist you have never met know your name?
  '1yc7uk6u0zp': { cue: '[low, uneasy, thoughtful]', speed: 0.95 },
  // Inspector Farah Iskandar: Kau. Of all people.  /  You. Of all people.
  '06nh9lf74vy': { say: '[cold, surprised] Kau. [break] [quiet contempt] Of all people.', speed: 0.95 },
  // Inspector Farah Iskandar: Five minutes. Touch nothing. And this never happened.
  '1mnmw3b47k7': { say: '[clipped, low, commanding] Five minutes. [break] Touch nothing. [break] [hard, quiet warning] And this never happened.' },
  // Narrator: The lift panel reads 12, 13, 15. Like most towers in this city, it pretends Floor 14 does not exist.
  '1vy9itrf8ri': { cue: '[low, dry, faintly ironic]', speed: 0.95 },
  // Narrator: Dr. Henry Goh lived on it anyway.
  '0vrzsx8tpas': { cue: '[quiet, ominous]', speed: 0.9 },
  // Narrator: On the balcony railing, held down by a coin: a tiny mousedeer folded from a mamak receipt.
  '10y8vibtpyq': { cue: '[hushed, intimate]', speed: 0.9 },
  // Daniel Raj: Kancil. Small animal, big brain.
  '1n1jerb9zjp': { cue: '[warm, playful, smiling]' },
  // Daniel Raj: Outsmarts the crocodiles every time, machan.
  '11tgsidlpc7': { cue: '[chuckling, warm, teasing]' },
  // Narrator: You slip the paper kancil into your pocket before Farah turns around.
  '0rhkqbw547o': { cue: '[quiet, conspiratorial]', speed: 0.95 },

  // ---------------- case01:ending ----------------
  // Rachel Goh: The police say it is over. I want to believe them.
  '1vl6rpkjwqe': { say: '[subdued, unconvinced] The police say it is over. [break] [sighing] I want to believe them.', speed: 0.92 },
  // Rachel Goh: My father trusted you, {you}. I still do not know why.
  '14hfikysqvr': { say: '[soft, sincere, puzzled] My father trusted you, {you}. [break] I still do not know why.', speed: 0.93 },
  // Narrator: One thing nobody asked about: the X-ray from the safe. PK-0821.
  '2d0581bfed0': { say: '[low, slow, ominous] One thing nobody asked about: the X-ray from the safe. [break] PK-0821.', speed: 0.93 },
  // Narrator: Port Klang. August 2021. The month of the fire.
  '0karv1h7hcq': { say: '[quiet, heavy] Port Klang. [break] August 2021. [break] [haunted] The month of the fire.', speed: 0.9 },
  // Narrator: You put it in the drawer next to the paper kancil, and you do not sleep.
  '0b1xvyecc2x': { cue: '[weary, hollow]', speed: 0.9 },
  // Narrator: Dr. Shanti Menon is charged with murder. She admits to stealing from the clinic. She swears she was in Bangsar when Henry Goh fell.
  '29pb273oztq': { cue: '[clipped, formal, detached]' },
  // Narrator: Rizal Hamdan is charged. He breaks within an hour: "They paid me five thousand to delete seventeen minutes. I never touched the doctor."
  '1y0nvdqmuex': { say: '[clipped, formal] Rizal Hamdan is charged. He breaks within an hour: [desperate, pleading] "They paid me five thousand to delete seventeen minutes. I never touched the doctor."' },
  // Narrator: Jason Ooi is charged with murder. He says nothing at all. On his way to the van, he smiles at you like he knows something you don't.
  '2fz6gwwgmfc': { say: '[clipped, formal] Jason Ooi is charged with murder. He says nothing at all. [break] [low, uneasy] On his way to the van, he smiles at you like he knows something you don\'t.' },
  // Rachel Goh: They are saying it was murder now. Not a jump. Thank you.
  '0fsqo5uomqi': { say: '[relieved, voice breaking] They are saying it was murder now. Not a jump. [break] [crying softly, grateful] Thank you.', speed: 0.9 },

  // ---------------- side01:opening ----------------
  // Bala Anne: Thambi! Andha durian-a mela kondu poga koodaadhu!  /  Boy! You cannot take that durian upstairs!
  '2c51jprm6n1': { cue: '[shouting, scolding, warm uncle]' },
  // Narrator: Ken Lim takes it upstairs anyway. He has been ignoring Bala Anne since Form Three.
  '0pgqs3ks3z7': { cue: '[dry, amused]' },
  // Ken Lim: Ah Hock Suk hai ngo suk fu ah. Bong ngo yat ci. Ngo kau neih.  /  Uncle Hock is my uncle. Help me this once. I am begging you.
  '0yxkzpmcwfg': { cue: '[desperate, pleading, voice tight]' },
  // Narrator: Durian season. Every stall on the row lit up like a shrine, every table sticky, every one of them cash only.
  '0clsf5h1bae': { cue: '[warm, nostalgic, savouring]' },
  // Narrator: By midnight Ah Hock was asleep in his plastic chair, and the takings were gone.
  '1u25kwnocft': { cue: '[quiet, ominous]', speed: 0.93 },
  // Lau Kim Hock: Go bui kopi… hou fu. Hou fu.  /  That kopi… so bitter. So bitter.
  '1b4i5ypd4ee': { cue: '[weak, groggy, slurred]', speed: 0.85 },
  // Narrator: The doctors found enough sleeping pill in his blood to drop a man half his age.
  '0h7k9691tca': { cue: '[flat, grim]' },
  // Ken Lim: Forty-one thousand six hundred. The whole season. Auntie's knee operation is in that tin.
  '05z3rjeq1ta': { say: '[angry, distraught] Forty-one thousand six hundred. [break] The whole season. [break] [voice cracking] Auntie\'s knee operation is in that tin.' },
  // Narrator: A red Khong Guan biscuit tin, lid off, licked clean. Except for one thing at the bottom.
  '0ei3zr3pk0t': { say: '[measured, observant] A red Khong Guan biscuit tin, lid off, licked clean. [break] [intrigued, quieter] Except for one thing at the bottom.' },
  // Narrator: A stall receipt, folded small and neat. Into a boat.
  '2203eyh9ucu': { say: '[hushed] A stall receipt, folded small and neat. [break] Into a boat.', speed: 0.92 },
  // Narrator: Not a kancil. A boat. You tell yourself that is different, and you put it in your pocket.
  '0u31pafkjfs': { say: '[uneasy, quiet] Not a kancil. [break] A boat. [break] [self-deceiving] You tell yourself that is different, and you put it in your pocket.', speed: 0.92 },
  // Inspector Farah Iskandar: Jangan pandang aku macam tu. Aku off duty.  /  Do not look at me like that. I am off duty.
  '13uddvmdtrh': { cue: '[dry, defensive, a little embarrassed]' },
  // Inspector Farah Iskandar: Best D24 in PJ, this row. PJ police will file it and forget it. I will eat and not interfere. Probably.
  '247lgadin5w': { say: '[relaxed, wry] Best D24 in PJ, this row. [break] PJ police will file it and forget it. I will eat and not interfere. [break] [teasing] Probably.' },
  // Narrator: Behind you, Ken's phone buzzes. He turns it face down on the table before you can see the name.
  '0k6a1wzbug0': { cue: '[low, suspicious]' },

  // ---------------- side01:ending ----------------
  // Lau Kim Hock: Di cin fan lai zau dak lah.  /  The money came back. That is enough.
  '213547vg1v4': { cue: '[tired, resigned, gentle]', speed: 0.9 },
  // Ken Lim: He wants to pay you in durian for the rest of your life. I told him you would prefer cash. He did not listen.
  '19as28toltm': { cue: '[warm, amused, exasperated]' },
  // Ken Lim: By the way. You been back to Port Klang lately? Just asking.
  '24t019qp96a': { say: '[casual, too casual] By the way. [break] [carefully light] You been back to Port Klang lately? [break] Just asking.' },
  // Narrator: Nobody on the row will say who folded the boat.
  '1n5nnqgb1d4': { cue: '[flat, quiet]' },
  // Narrator: Ken asked about Port Klang the way people ask about the weather. He did not look at you while he asked.
  '1fq4n6hd32g': { cue: '[low, uneasy, suspicious]' },
  // Narrator: The paper boat sits in your drawer beside the paper kancil. A boat is not a kancil. You tell yourself that twice.
  '26hf7enxwkb': { say: '[low, weary] The paper boat sits in your drawer beside the paper kancil. [break] [quiet, self-deceiving] A boat is not a kancil. [break] You tell yourself that twice.', speed: 0.92 },
  // Narrator: Wong Siew Lan is charged with theft. She admits to three weeks of skimming, every ringgit of it written down. She swears on her son she never touched the tin.
  '1yvjtlhz1g7': { cue: '[clipped, formal, sober]' },
  // Narrator: Ravi Chandran is charged. His camera footage is entered as evidence for the defence. The corner pitch stays empty for the rest of the season.
  '2erxgaoz7mv': { cue: '[clipped, formal, faint regret]' },
  // Narrator: Bobby Tan is charged with theft and with poisoning. He tells PJ police the pills were for his mother, and the money was for his mother, and he never meant Ah Hock to fall.
  '1b667etk8wh': { say: '[clipped, formal] Bobby Tan is charged with theft and with poisoning. [break] [softer, sorrowful] He tells PJ police the pills were for his mother, and the money was for his mother, and he never meant Ah Hock to fall.' },
  // Lau Kim Hock: Ho sam ge sai lou. Ngo mou zaak keoi.  /  A good-hearted boy. I do not blame him.
  '1xtvh90lzj3': { cue: '[gentle, forgiving, sad]', speed: 0.88 },
  // Narrator: Bobby folded boats when he was nervous. Everyone on the row knew it.
  '2cb1bj1es6k': { cue: '[quiet, wistful]' },

  // ---------------- case02:opening ----------------
  // Woman (voiced as Salmah): Encik… suami saya tak balik dari kerja. Dah dua malam.  /  Sir… my husband has not come home from work. Two nights now.
  '23k272woa5t': { cue: '[exhausted, frightened, holding back tears]', speed: 0.92 },
  // You: Then you need the police, puan.
  '0ppb90faoy3': { cue: '[tired, reluctant]' },
  // Woman (voiced as Salmah): Polis kata dia lari ikut perempuan lain. Azman takkan tinggalkan anak dia.  /  The police say he ran off with another woman. Azman would never leave his son.
  '23yaopyd0j5': { say: '[bitter, hurt] Polis kata dia lari ikut perempuan lain. [break] [fierce, close to tears] Azman takkan tinggalkan anak dia.', speed: 0.95 },
  // Woman (voiced as Salmah): Seorang lelaki dekat pintu pagar pelabuhan. Dia kata encik orang dari kebakaran tu.  /  A man at the port gate. He said you were the one from the fire.
  '1174wk1lw3t': { cue: '[quiet, hesitant, exhausted]' },
  // Bala Anne: Port Klang-aa? Neenga anga poga vendaam, thambi.  /  Port Klang? You should not go there, boy.
  '19rq77trs92': { cue: '[alarmed, stern, protective]' },
  // You: It is a missing person, Anne. People go missing every day.
  '09rzv2j0rya': { cue: '[dismissive, tired]' },
  // Bala Anne: Andha oor-la ellaame missing dhaan.  /  In that town, everything goes missing.
  '1s2kkom0liv': { cue: '[dark, knowing, low]' },
  // Narrator: On the television over the counter, the morning news: the murder trial of a Mont Kiara dentist, Dr. Shanti Menon, begins next month.
  '25c4od7gokk': { cue: '[flat, detached, like a newsreader]' },
  // Bala Anne: Your friend Ken's uncle got his money back, but that Bobby boy is riding a new motorbike now. Funny, no?
  '23frxq46zlj': { say: '[gossiping, sly, warm] Your friend Ken\'s uncle got his money back, but that Bobby boy is riding a new motorbike now. [break] [teasing] Funny, no?' },
  // Bala Anne: And Ken says the durian cashier girl lost her job. A record follows you, he says.
  '00ig1dvv2x5': { cue: '[gossiping, half-teasing, half-serious]' },
  // Narrator: Forty kilometres to the sea. You have not driven them since August 2021.
  '2dmw5p1jtof': { say: '[low, tense] Forty kilometres to the sea. [break] [haunted] You have not driven them since August 2021.', speed: 0.92 },
  // Narrator: In your mirror, a grey sedan holds three cars back from Shah Alam to the Klang toll. WXY 1408. A common plate, you tell yourself. You remember it anyway.
  '0q67lm1zdza': { cue: '[tense, watchful]' },
  // Narrator: The cranes come up out of the haze one at a time, like they are counting you.
  '1fqctyuow2c': { cue: '[uneasy, slow, menacing]', speed: 0.92 },
  // Narrator: The gate barrier is striped red and white. So was the tape around Warehouse 6.
  '25mk9dysarj': { say: '[low, tightening] The gate barrier is striped red and white. [break] [haunted] So was the tape around Warehouse 6.', speed: 0.92 },
  // Narrator: Your hands will not let go of the wheel.
  '0n3eviy89mh': { cue: '[tight, panicked, breathless]', speed: 0.9 },
  // Narrator: Your chest is a fist. The car is full of smoke that is not there.
  '0id02un2bob': { cue: '[panting, choked, panicking]', speed: 0.9 },
  // Narrator: Breathe. Count the cranes. One. Two. Three…
  '1kdzjv99k71': { say: '[breathless, forcing calm] Breathe. [break] Count the cranes. [break] One. [break] Two. [break] Three…', speed: 0.82 },
  // Daniel Raj: Jangan tengok belakang.  /  Don't look back.
  '1pr79ntb776': { cue: '[very calm, low, close whisper]', speed: 0.9 },
  // Narrator: The roof of Bay 3 coming down. Daniel's voice, very calm. Then nothing at all for eleven days.
  '12fbcdlla7k': { say: '[haunted, quiet] The roof of Bay 3 coming down. [break] Daniel\'s voice, very calm. [long-break] [hollow] Then nothing at all for eleven days.', speed: 0.88 },
  // Narrator: …Seven. The seventh crane is not moving. You breathe out, and you open the door.
  '0ii6xi5no6w': { say: '[exhaling, steadier] …Seven. [break] The seventh crane is not moving. [sighing] You breathe out, and you open the door.', speed: 0.92 },
  // Salmah: Encik datang juga.  /  You came after all.
  '1fzeg728fyf': { cue: '[relieved, exhausted, near tears]', speed: 0.92 },
  // Salmah: Dia operator Crane 7. Isnin malam dia masuk kerja. Sampai sekarang tak keluar.  /  He drives Crane 7. On Monday night he went in to work. He has not come out.
  '0t0xtkk30w5': { say: '[exhausted, holding back tears] Dia operator Crane 7. Isnin malam dia masuk kerja. [break] [voice breaking] Sampai sekarang tak keluar.', speed: 0.9 },
  // Narrator: Her son stands behind her, turning a small wooden triangle over and over in his fingers.
  '1rx5iyid7ic': { cue: '[soft, tender, observant]' },
  // Inspector Farah Iskandar: Port Klang is not your jurisdiction. It is not even mine.
  '0wzqajxbfb2': { cue: '[cool, dry, warning]' },
  // Inspector Farah Iskandar: Orang dewasa hilang, dua hari, tiada unsur jenayah. Fail ditutup sebelum dibuka.  /  Missing adult, two days, no sign of foul play. The file was closed before it was opened.
  '19308ft7q7b': { cue: '[bitter, flat, quoting the paperwork]' },
  // Inspector Farah Iskandar: One more thing. Rizal Hamdan left Mont Kiara last month. New uniform, new company. Somewhere with a sea view.
  '2efge9qggrm': { say: '[low] One more thing. [break] [pointed] Rizal Hamdan left Mont Kiara last month. New uniform, new company. [dry, sardonic] Somewhere with a sea view.' },
  // Inspector Farah Iskandar: Call me if you find something I can write down.
  '0dzua7qprkc': { cue: '[curt, but not unkind]' },
  // Narrator: Container 47 came in from Sandakan on Monday night. At 2:14 on Tuesday morning, with the box hanging six metres in the air, Crane 7 stopped.
  '1td4lvqga9r': { cue: '[measured, factual, building tension]' },
  // Narrator: Azman Yusof climbed down, and the port forgot his name.
  '00d34jaxydx': { cue: '[quiet, bitter, final]', speed: 0.92 },

  // ---------------- case02:ending ----------------
  // Narrator: Fishermen find him at low tide, in the mangroves below the jetty.
  '19777b3pfi6': { cue: '[hushed, grave]', speed: 0.9 },
  // Inspector Farah Iskandar: The coroner will say drowning. Misadventure. He fell from a boat in the dark.
  '11h4mcbhk4v': { cue: '[flat, bitter, contained anger]' },
  // Inspector Farah Iskandar: Fail ditutup.  /  The file is closed.
  '0y0k2a9teqn': { cue: '[quiet, defeated, bitter]', speed: 0.9 },
  // Salmah: Sekurang-kurangnya saya boleh kebumikan dia.  /  At least I can bury him.
  '1h8foxk1svq': { cue: '[sobbing quietly, grief-stricken]', speed: 0.85 },
  // Narrator: Amir stands at the graveside with a wooden triangle in his fist. He does not cry. He looks at you the whole time.
  '2fs5zd529jx': { cue: '[quiet, heavy, guilty]', speed: 0.9 },
  // Narrator: His phone was never found. Neither was the van, or anyone who rode in it.
  '0l2nsg8cs7s': { cue: '[flat, grim]' },
  // Narrator: Tony Kwan resigns by text message and boards the evening flight to Colombo.
  '1icuhpgre4u': { cue: '[dry, bitter]' },
  // Narrator: Norhayati Salleh is transferred to Sandakan, at her own request.
  '1u4ogrf9dja': { cue: '[dry, sardonic]' },
  // Narrator: Bay 3 has a new roof and new paint. The floor under the paint is still black.
  '12vofuaciyl': { say: '[low, quiet] Bay 3 has a new roof and new paint. [break] [heavy] The floor under the paint is still black.', speed: 0.92 },
  // Inspector Farah Iskandar: One more thing from the port cameras. Tuesday, 2:41 AM, at this door. I cannot see his face.
  '1qjoo41u05b': { cue: '[low, serious, careful]' },
  // Narrator: A man in a dark jacket, lighting a cigarette. The flame comes from a silver flip-top lighter.
  '0nsl44xhkcg': { say: '[low, slow, tense] A man in a dark jacket, lighting a cigarette. [break] The flame comes from a [emphasis] silver flip-top lighter.', speed: 0.92 },
  // Narrator: Your hand goes to your pocket. Daniel's lighter is still there. Of course it is.
  '0oyc3qtv9nc': { say: '[hushed] Your hand goes to your pocket. [break] Daniel\'s lighter is still there. [long-break] [shaken, whispering] Of course it is.', speed: 0.9 },
  // Narrator: The marine police boat finds the kelong at first light. A sampan is tied under it. A man is asleep on the planks with a phone held against his chest.
  '1ib45o1c9u6': { cue: '[quiet, hopeful, gentle]' },
  // Azman Yusof: Saya buka pintu tu. Saya tak boleh tutup balik.  /  I opened that door. I could not close it again.
  '26u8q9qb4q6': { cue: '[exhausted, shaken, whispering]', speed: 0.9 },
  // Narrator: Amir reaches him first. He is holding the wooden triangle.
  '184qo9v5wen': { cue: '[tender, moved]' },
  // Salmah: Terima kasih. Saya tak tahu nak cakap apa lagi.  /  Thank you. I do not know what else to say.
  '1axl81w579g': { cue: '[crying, overwhelmed with gratitude]', speed: 0.88 },
  // Narrator: On Azman's phone: forty-one photographs of the inside of Container 47. Farah finds the van in a Shah Alam cold store by noon. Twenty-three people. All of them alive.
  '1j3qlgiahkn': { say: '[steady, quietly triumphant] On Azman\'s phone: forty-one photographs of the inside of Container 47. Farah finds the van in a Shah Alam cold store by noon. [break] Twenty-three people. [break] [moved] All of them [emphasis] alive.' },
  // Narrator: Tony Kwan is charged. He asks for a lawyer from Kuala Lumpur, and a lawyer from Singapore arrives instead, before lunch.
  '0rh3xwgg8g8': { cue: '[clipped, formal, wry]' },
  // Narrator: Norhayati Salleh is charged. She removes her Customs badge herself and lays it on the table, face down.
  '0zjt1ap7ejh': { cue: '[clipped, formal, sober]' },
  // Narrator: Faizal Ahmad is charged. He says nothing in the van. At the station he asks only whether anyone has told his sister.
  '1bsetz92i90': { say: '[clipped, formal] Faizal Ahmad is charged. He says nothing in the van. [break] [softer, sorrowful] At the station he asks only whether anyone has told his sister.' },

  // ---------------- case03:opening ----------------
  // Woman (voiced as Jo Lim): Wa Ah Kong si liao.  /  My grandfather is dead.
  '0k82icn9ohu': { cue: '[crying, numb with shock]', speed: 0.88 },
  // Woman (voiced as Jo Lim): Sorry. I am Jo. Jo Lim. Rachel Goh gave me your number. My grandfather made Dr. Goh's dentures for thirty years.
  '1r8692v4cqq': { say: '[sniffing, composing herself] Sorry. [break] I am Jo. Jo Lim. Rachel Goh gave me your number. [shaky] My grandfather made Dr. Goh\'s dentures for thirty years.' },
  // Jo Lim: Our shophouse in Penang burned at ten past four this morning. He was upstairs. Bomba says old wiring.
  '0warahb9qxt': { cue: '[numb, flat, in shock]', speed: 0.93 },
  // Jo Lim: He unplugged everything every night. Every night. The kettle, the radio, the lathe. He said electricity is a thief that comes in while you sleep.
  '1xup23tq0c2': { say: '[insistent, grieving] He unplugged everything every night. [emphasis] Every night. The kettle, the radio, the lathe. [break] [fond, voice breaking] He said electricity is a thief that comes in while you sleep.', speed: 0.92 },
  // You: Why call me, Jo?
  '2fxda4g571i': { cue: '[gentle, careful]' },
  // Jo Lim: Last week he said: if a detective comes asking about Dr. Goh, the moulds are in the back.
  '0sdby4haas3': { cue: '[quiet, puzzled, earnest]' },
  // Narrator: The X-ray from Henry Goh's safe has been in your drawer since Mont Kiara, beside the paper kancil. PK-0821. Port Klang, August 2021.
  '1eduldua9zv': { cue: '[low, measured]' },
  // Narrator: A dentist read that X-ray, and a technician in Penang cast his models. One of them fell from Floor 14. The other died in the smoke above his own workshop.
  '1am8g58vvf6': { say: '[low, slow, growing dread] A dentist read that X-ray, and a technician in Penang cast his models. [break] One of them fell from Floor 14. [break] The other died in the smoke above his own workshop.', speed: 0.92 },
  // Narrator: You put it in your inside pocket, next to Daniel's lighter.
  '0cod0nvm3u6': { cue: '[quiet, resolute]' },
  // Bala Anne: Penang-aa? Anga mazhai inga vida mosam.  /  Penang? The rain there is worse than here.
  '1vhqnbcpeke': { cue: '[grumbling, worried]' },
  // Bala Anne: Saapittu poonga.  /  Eat before you go.
  '13ssxe8co7l': { cue: '[warm, gentle, insistent]' },
  // Narrator: He puts a three-tier tiffin carrier on the passenger seat and does not ask when you will be back.
  '0pbivtwarc2': { cue: '[warm, quietly moved]' },
  // Narrator: On the television over the counter, Dr. Shanti Menon's murder trial goes into its second week. Her lawyer tells the cameras the prosecution has a balcony, a print on a door handle, and no motive.
  '1povkqqdo9j': { cue: '[flat, detached, like a newsreader]' },
  // Bala Anne: That durian man Ravi came to eat yesterday. He paid for his own teh. He looked at your stairs a long time.
  '0rn0n88vvuk': { cue: '[conspiratorial, low, uneasy]' },
  // Narrator: A message from Salmah, the first in weeks: a photo of Faizal's lorry with a repossession notice under the wiper. No words.
  '2a7qvwx1r5j': { cue: '[quiet, guilty]' },
  // Narrator: Thirteen and a half kilometres of bridge, and the rain comes across the strait sideways.
  '1zq6x182dmq': { cue: '[weary, atmospheric]' },
  // Narrator: Since Ipoh, a grey sedan has held four cars behind you. WXY 1408. It takes the bridge with you and does not overtake. On the island it turns off at Jelutong, and is back in your mirror by Lebuh Pantai.
  '0sdnd42fj3s': { cue: '[tense, watchful, low]' },
  // Narrator: George Town comes up out of the rain in clan-house roofs and hotel cranes, the old and the new leaning on each other.
  '1ubwnvagtuh': { cue: '[atmospheric, quietly admiring]' },
  // Narrator: No. 96 is a black mouth in a row of pastel shophouses. The five-foot way is wet with hose water, and the air tastes of plaster and burnt wax.
  '08esqun2yf3': { cue: '[grim, sensory, slow]', speed: 0.93 },
  // Narrator: On one side, the joss-paper and coffin shop at No. 94, shutters half down. On the other, a hoarding printed with a hotel that does not exist yet. THE CHULIA. A Sinar Heritage Hotel.
  '0evmz4rjt1g': { say: '[observant, measured] On one side, the joss-paper and coffin shop at No. 94, shutters half down. On the other, a hoarding printed with a hotel that does not exist yet. [break] [dry] The Chulia. A [emphasis] Sinar Heritage Hotel.' },
  // Narrator: Sinar. You read it twice.
  '0asxk4bwku5': { say: '[cold realization] Sinar. [break] [quiet] You read it twice.', speed: 0.9 },
  // Jo Lim: He had been sleeping at my flat since he fell in September. On Wednesday he went home. He said somebody had to be there, in case the detective came.
  '226syswxvku': { cue: '[tired, sad, matter-of-fact]' },
  // Jo Lim: You are one day late. I am not saying it to be cruel. I am just saying it.
  '0omrp6kp70w': { say: '[quiet, raw] You are one day late. [break] [tired, honest] I am not saying it to be cruel. I am just saying it.', speed: 0.93 },
  // Narrator: His reading glasses are in her shirt pocket. He left them on her bedside table, and meant to come back for them.
  '0sj7fhd1oqh': { cue: '[tender, sorrowful, hushed]', speed: 0.9 },
  // Inspector Farah Iskandar: Penang is not mine either. With you that is becoming a habit.
  '1ofrw4y6bx5': { cue: '[dry, sardonic]' },
  // Inspector Farah Iskandar: Azman sends his salam. He gave me his photos from the port. One is a reefer van backing into Bay 3, with a small sunburst on the door. Sinar Cold Chain. I am sending it to you.
  '0dd9ek5np0t': { say: '[warmer] Azman sends his salam. [break] [businesslike] He gave me his photos from the port. One is a reefer van backing into Bay 3, with a small sunburst on the door. [pointed] Sinar Cold Chain. I am sending it to you.' },
  // Inspector Farah Iskandar: Tulis semua. Hantar pada saya setiap malam.  /  Write everything down. Send it to me every night. I am not losing another witness.
  '1r4j05wjzso': { cue: '[firm, protective, serious]' },
  // Inspector Farah Iskandar: Something you will enjoy. Kawalan Sentosa has a new regional supervisor in Penang. Rizal Hamdan. He has done well for a man who deleted seventeen minutes.
  '15pdnww3owt': { say: '[sardonic] Something you will enjoy. [break] Kawalan Sentosa has a new regional supervisor in Penang. Rizal Hamdan. [cold, contemptuous] He has done well for a man who deleted seventeen minutes.' },
  // Inspector Farah Iskandar: Call me when you have something I can write down.
  '08jlreshhli': { cue: '[curt, dry]' },
  // Narrator: Your phone buzzes on the pillow. WhatsApp, from a +94 number. Sri Lanka.
  '0rmg9mhztdm': { cue: '[low, alert, uneasy]' },
  // Narrator: No text. One photograph: Colombo port at night, the cranes lit orange, taken from the deck of a ship.
  '0b64zahfxy3': { cue: '[hushed, ominous]', speed: 0.92 },
  // Narrator: You do not reply. You do not delete it either.
  '14q37exkrwk': { cue: '[quiet, troubled]', speed: 0.9 },

  // ---------------- case03:ending ----------------
  // Narrator: Bomba amends its report before lunch. Deliberate ignition at the rear of the premises. The words "old wiring" are taken out.
  '0yvs59po1yr': { cue: '[measured, quietly satisfied]' },
  // Jo Lim: They say it is finished. It does not feel finished.
  '1old4iluomg': { cue: '[hollow, tired, sad]', speed: 0.92 },
  // Narrator: Kenny's half of No. 96 goes to his creditors. His creditors sell it to Sinar Heritage within the month.
  '16gs2i2moyw': { cue: '[dry, bitter]' },
  // Narrator: The shutters of No. 94 stay down. A leasing agent from Gurney Drive pins a card to them.
  '19eotryz7t9': { cue: '[quiet, regretful]' },
  // Narrator: A Sinar Heritage envelope arrives for the estate: a condolence card and a better offer. Jo leaves both on her drawing board, unopened. By Friday the hoarding has been moved, so that it wraps around No. 96 on both sides.
  '0n8dwutj2mn': { cue: '[measured, ominous]' },
  // Narrator: The hoarding stays where it is. Work on The Chulia is suspended "pending a review". Nobody from Sinar Heritage comes to Uncle Lim's funeral.
  '0jodjd1rmug': { cue: '[quietly satisfied, dry]' },
  // Narrator: In the project folder, one more scan Jo had not opened: a customs clearance for The Chulia's imported "fittings", forty crates, stamped in Sandakan. Officer: N. SALLEH.
  '25bqq6gcp4g': { say: '[low, ominous] In the project folder, one more scan Jo had not opened: a customs clearance for The Chulia\'s imported "fittings", forty crates, stamped in Sandakan. [break] Officer: [emphasis] N. Salleh.' },
  // Narrator: At dawn the hotel site's skip is lifted onto a lorry and driven across the bridge.
  '0yw86nkg6f5': { cue: '[flat, resigned]' },
  // Narrator: Whatever was in Uncle Lim's carton went with it, or went somewhere else first. Nobody will ever say which.
  '20phnshot2w': { cue: '[bitter, resigned]' },
  // Narrator: Rizal Hamdan transfers Shahrul Nizam to a site in Johor Bahru, with a week's notice and a good reference.
  '0k8hop2p7qm': { cue: '[dry, bitter]' },
  // Narrator: The X-ray goes back in your drawer. The 2021 file says what it has always said.
  '06tfzpe927h': { cue: '[heavy, resigned]', speed: 0.92 },
  // Narrator: Farah files your answer. It changes nothing. It was already the answer.
  '02vw4bhleyy': { cue: '[flat, weary]' },
  // Narrator: At closing, Madam Ong wipes the same table and sets out two glasses of teh. One for her. One for whoever comes.
  '1fen05gipth': { cue: '[tender, melancholy]', speed: 0.9 },
  // Narrator: The poster stays on the noticeboard for another monsoon.
  '0riujtri0y5': { cue: '[quiet, melancholy]', speed: 0.9 },
  // Narrator: Under your office door, on the mat: a paper kancil.
  '29titt60elr': { cue: '[tense, hushed]', speed: 0.9 },
  // Narrator: It is folded from a Penang ferry ticket. Butterworth to George Town, one adult, dated the morning you left.
  '1vx1orhiwmi': { cue: '[slow, chilling realization]', speed: 0.9 },
  // Narrator: Nothing else.
  '10br8z1us3j': { cue: '[long-break][whispering, ominous]', speed: 0.85 },
  // Narrator: The coroner's court amends a 2021 finding in eleven minutes. Henry Goh's certificate is struck out. Uncle Lim's order book is entered in its place.
  '251qhjrmb3l': { cue: '[measured, quietly vindicated]' },
  // Narrator: At Cheras, the grave with Daniel's name on it is opened at dawn. You stand at the back. Farah stands beside you and says nothing, which is the kindest thing she has ever done for you.
  '1cmpxo0uo2c': { cue: '[hushed, grieving, intimate]', speed: 0.88 },
  // Narrator: Ong Wei Jie crosses to Butterworth on the morning ferry, the way he crossed to work for eight years.
  '06vsunld5iu': { cue: '[gentle, hopeful, moved]', speed: 0.92 },
  // Madam Ong: Wa e kiann tng lai liao.  /  My son has come home.
  '1g17eameapu': { cue: '[crying softly, relieved]', speed: 0.85 },
  // Narrator: At closing she sets out one glass of teh, not two.
  '1km6iscup45': { cue: '[tender, moved, quiet]', speed: 0.88 },
  // Narrator: In Cheras there is now a grave with Daniel's name on it and nobody in it. Nobody asks you what that means. You do not ask yourself.
  '1ijw5ukx2a1': { cue: '[low, unsettled, quiet]', speed: 0.9 },
  // Narrator: Farah writes "possibly an unidentified foreign national" in the margin of a closed file. Nobody reads margins.
  '16zlxoz3s3a': { cue: '[dry, bitter]' },
  // Narrator: Farah asks who would forge an X-ray of a jaw that was never there, and then cast it in plaster. You do not have an answer.
  '290pem94hq8': { cue: '[uneasy, quiet]' },
  // Narrator: The 2021 file stays closed.
  '2b88is0jnlf': { cue: '[flat, final]', speed: 0.9 },
  // Narrator: Kenny Lim is charged with arson and culpable homicide. He tells the magistrate he was in Air Itam losing three thousand four hundred ringgit. Nobody at the den will say so on paper.
  '0a2exp2tkaw': { cue: '[clipped, formal]' },
  // Jo Lim: They took Kenny. He used to carry me on his shoulders down Lebuh Chulia at Chap Goh Meh. I keep waiting to feel something more than tired.
  '0sxmedultyn': { say: '[numb, bitter] They took Kenny. [break] [wistful, voice breaking] He used to carry me on his shoulders down Lebuh Chulia at Chap Goh Meh. [break] [exhausted] I keep waiting to feel something more than tired.', speed: 0.9 },
  // Narrator: Cheah Siew Lan is charged with arson. She closes No. 94 for the first time in thirty-one years. Her paper houses sit unsold in the window, fading in the sun.
  '01zstlbjyoq': { say: '[clipped, formal] Cheah Siew Lan is charged with arson. [break] [melancholy] She closes No. 94 for the first time in thirty-one years. Her paper houses sit unsold in the window, fading in the sun.' },
  // Jo Lim: Auntie Cheah gave Ah Kong a discount on a coffin in 2015, as a joke, when he turned sixty-five. They laughed for a week. That was before the wall.
  '2523x2mh7ph': { say: '[fond, faintly amused] Auntie Cheah gave Ah Kong a discount on a coffin in 2015, as a joke, when he turned sixty-five. They laughed for a week. [break] [sad, quiet] That was before the wall.' },
  // Narrator: Melissa Ong is charged with abetting arson and culpable homicide. Sinar Heritage issues a statement before she reaches the lock-up: she acted alone, and has been dismissed.
  '1f122kgwk9u': { cue: '[clipped, formal, sardonic]' },
  // Narrator: Shahrul Nizam is charged with arson and culpable homicide. In the van he asks, in the soft Malay of Kedah, whether the old man suffered. "Orang tua tu tak patut ada kat situ." The old man was not supposed to be there.
  '1a6r1y4rj08': { say: '[clipped, formal] Shahrul Nizam is charged with arson and culpable homicide. [softer, troubled] In the van he asks, in the soft Malay of Kedah, whether the old man suffered. [whispering] "Orang tua tu tak patut ada kat situ." [break] The old man was not supposed to be there.' },
  // Narrator: Under the bed in Shahrul's rented room: a carton marked GOH 2021 in Uncle Lim's capitals. Fourteen plaster jaws, each wrapped in a page of the Kwong Wah Yit Poh.
  '0yvud35lzkv': { cue: '[low, revealing, measured]' },
  // Narrator: He was told a man would collect it at the ferry terminal on Monday morning. Nobody came. Somebody heard about the arrests first.
  '21ezqsvf9j8': { cue: '[low, ominous]' },
  // Narrator: Farah drives it to Kuala Lumpur herself, the carton on the passenger seat with the seatbelt across it.
  '1rxwwq57e4z': { cue: '[warm, quietly moved]' },
  // Jo Lim: He unplugged everything. Every night. Now somebody has written it down.
  '0ce9qsy1x2h': { say: '[tearful, grateful] He unplugged everything. [break] Every night. [break] [quiet pride] Now somebody has written it down.', speed: 0.9 },

  // ---------------- case04 ----------------
  // Bala Anne: Thambi, unakku oru parcel vandhirukku. Colombo-la irundhu.  /  Boy, a parcel came for you. From Colombo.
  '2bx4lr1vlfs': { say: '[warm, curious, a little wary] தம்பி, உனக்கு ஒரு பார்சல் வந்திருக்கு. [break] கொழும்புல இருந்து.' },
  // Bala Anne: No name on the back. I kept it under the till for three days. It felt too small to be anything good.
  '17uhvs750dr': { say: '[gruff, uneasy] No name on the back. I kept it under the till for three days. [break] [low, superstitious] It felt too small to be anything good.' },
  // Narrator: On the television over the counter, the verdict in Dr. Shanti Menon's trial is due on Friday. Bala Anne turns the sound down without being asked.
  '0fwru3dkjvl': { cue: '[flat, quiet, guilty]' },
  // Bala Anne: That durian man Ravi came again. He asked if you were well. I told him you are never well.
  '0ms9k4bvsoe': { say: '[conspiratorial, low] That durian man Ravi came again. He asked if you were well. [break] [dry, affectionate] I told him you are never well.' },
  // Narrator: A message from Jo Lim, the first since Penang: Kenny's trial is set for March. Nothing else.
  '0fvkmh9tcvo': { cue: '[quiet, heavy, guilty]', speed: 0.93 },
  // Narrator: Inside, in a fold of white gem paper: one uncut blue sapphire, the size of a fingertip. Rough and cloudy, and blue all the way down.
  '0yk4xbsrrzb': { say: '[hushed, intimate] Inside, in a fold of white gem paper: one uncut blue sapphire, the size of a fingertip. [break] [quietly awed] Rough and cloudy, and blue all the way down.', speed: 0.93 },
  // Narrator: Around it, a mamak receipt folded into a kancil. You know the paper before you open it. Restoran Bala, Brickfields. Two teh tarik, table 6, by the stairs. August 2021, the week before the fire.
  '06v16eoop8u': { say: '[low, slow, recognition dawning] Around it, a mamak receipt folded into a kancil. You know the paper before you open it. [break] Restoran Bala, Brickfields. Two teh tarik, table 6, by the stairs. [long-break] [aching, quiet] August 2021, the week before the fire.', speed: 0.9 },
  // Narrator: On the gem paper, a rubber stamp in Tamil and English. Yogeswaran Gem House, 112 Sea Street, Colombo 11. A telephone number.
  '0ln7zxqzyy9': { cue: '[measured, observant]' },
  // Woman (voiced as Tharshini Yogeswaran): Appa poyittaar.  /  My father is gone.
  '1v7zl4gbe4p': { say: '[crying, numb with shock] அப்பா போயிட்டார்.', speed: 0.85 },
  // Woman (voiced as Tharshini Yogeswaran): Sorry. You are calling from Malaysia? I am Tharshini. Yogeswaran is my father. Was my father.
  '17vqjunn7gl': { say: '[sniffing, composing herself] Sorry. You are calling from Malaysia? [break] I am Tharshini. Yogeswaran is my father. [long-break] [voice breaking] Was my father.', speed: 0.92 },
  // Tharshini Yogeswaran: They found him in Beira Lake this morning. The police say he drank arrack and fell in.
  '28s1ypf664u': { cue: '[numb, flat, holding back tears]', speed: 0.93 },
  // Tharshini Yogeswaran: Appa did not drink. And he could not swim, so he never went near the water after dark. Never.
  '09rnjql0t52': { say: '[insistent, grieving] Appa did not drink. [break] And he could not swim, so he never went near the water after dark. [emphasis] Never.', speed: 0.92 },
  // You: Did he ever talk about a Malaysian?
  '0yu16qrd0r3': { cue: '[gentle, careful, low]' },
  // Tharshini Yogeswaran: Last week. He said a Malaysian had come to help him undo what he had done. He said it like a prayer.
  '2apuzr12q97': { say: '[quiet, remembering] Last week. He said a Malaysian had come to help him undo what he had done. [break] [soft, wondering, sad] He said it like a prayer.', speed: 0.92 },
  // Narrator: The monsoon got to Colombo before you did. It comes off the Indian Ocean in sheets, and the tuk-tuk takes it side-on.
  '0kujysicy9b': { cue: '[weary, atmospheric, low]' },
  // Narrator: At Katunayake, among the drivers holding names at arrivals, one card says only J. The man holding it is looking at you. When you look back, he folds it in half and walks away.
  '0l79iniz39w': { say: '[tense, watchful, low] At Katunayake, among the drivers holding names at arrivals, one card says only J. [break] The man holding it is looking at you. [break] [cold, uneasy] When you look back, he folds it in half and walks away.' },
  // Tuk-tuk driver: Malli, koheda yanne?  /  Where to, little brother?
  '16d6modvv85': { say: '[cheerful, shouting over the rain] මල්ලි, කොහෙද යන්නේ?' },
  // You: Sea Street. Pettah.
  '0o43fp410oj': { cue: '[tired, curt]' },
  // Tuk-tuk driver: Sea Street! Gold street. Rain is no problem, sir. In Colombo the rain is free.
  '13ro368dar3': { say: '[delighted, chatty] Sea Street! Gold street. [break] [laughing] Rain is no problem, sir. In Colombo the rain is free.', speed: 1.05 },
  // Narrator: Sea Street smells of jasmine, diesel and hot oil. Every shopfront is a lit glass counter full of gold, and every shopkeeper is watching the one in the middle, where the shutter is half down and a white cloth is tied over the door.
  '24jg9wvc15e': { cue: '[sensory, slow, observant]', speed: 0.95 },
  // Narrator: Round the corner a kottu stall chops roti on the griddle, two steel blades going like a train over points. It does not stop for the rain. It does not stop for anything.
  '0ub50sw57pl': { say: '[atmospheric, quietly admiring] Round the corner a kottu stall chops roti on the griddle, two steel blades going like a train over points. [break] [dry] It does not stop for the rain. [low] It does not stop for anything.' },
  // Tharshini Yogeswaran: He sat at that bench for thirty-eight years. He could tell you where a stone was born just by holding it to the window.
  '16gvy624jws': { say: '[fond, grieving] He sat at that bench for thirty-eight years. [break] [proud, voice catching] He could tell you where a stone was born just by holding it to the window.', speed: 0.93 },
  // Tharshini Yogeswaran: Six years ago he started coming home late, and quiet. Last month he started sleeping again. Then this.
  '229a7wq1kt3': { say: '[quiet, troubled] Six years ago he started coming home late, and quiet. [break] [softer] Last month he started sleeping again. [long-break] [bitter, breaking] Then this.', speed: 0.92 },
  // Narrator: His loupe hangs on a cord around her neck. She has not taken it off since the morning they found him.
  '113orfib4g5': { cue: '[tender, sorrowful, hushed]', speed: 0.9 },
  // Inspector Ruwan Herath: Inspector Iskandar telephoned me. She said you would come whether I liked it or not.
  '1oa3ut5cqsj': { cue: '[dry, polite, faintly amused]' },
  // Inspector Ruwan Herath: The file at Slave Island station says an old man drank and slipped. I have asked for it. They were surprised anybody wanted it.
  '0wwm9fg7jin': { say: '[measured, weary] The file at Slave Island station says an old man drank and slipped. [break] I have asked for it. [dry, sardonic] They were surprised anybody wanted it.' },
  // Inspector Ruwan Herath: She also asked me to check one name. A Malaysian, Tony Kwan, came on a work visa in the spring. Sinar Cold Chain Lanka. He runs their reefer depot at Bloemendhal, by the port.
  '1376a3chgqf': { say: '[businesslike, lower] She also asked me to check one name. A Malaysian, Tony Kwan, came on a work visa in the spring. [break] [pointed] Sinar Cold Chain Lanka. He runs their reefer depot at Bloemendhal, by the port.' },
  // Inspector Ruwan Herath: And she sent a photograph from a crane driver in Port Klang. A reefer unit going into Bay 3 in 2021, serial RU-11. She thinks I will find it here.
  '1khbpvojr6f': { say: '[thoughtful, measured] And she sent a photograph from a crane driver in Port Klang. A reefer unit going into Bay 3 in 2021, serial R U eleven. [break] [quiet, grim] She thinks I will find it here.' },
  // Inspector Ruwan Herath: Hari. Api balamu.  /  All right. Let us see.
  '2dj552y0dh6': { say: '[calm, resolved, quiet] හරි. [break] අපි බලමු.', speed: 0.95 },

  // ---------------- case04:ending ----------------
  // Narrator: Slave Island station amends its file on the morning of the cremation. Not misadventure. Drowning, by another hand.
  '2dqj1hxolu9': { say: '[measured, sober] Slave Island station amends its file on the morning of the cremation. [break] Not misadventure. [quiet, grave] Drowning, by another hand.', speed: 0.95 },
  // Tharshini Yogeswaran: They say it is finished. Appa would have held it to the light a little longer.
  '0qdy1y9x5tj': { say: '[hollow, tired] They say it is finished. [break] [sad, wistful] Appa would have held it to the light a little longer.', speed: 0.9 },
  // Narrator: Mohan's half of 112 Sea Street goes to his lender, and his lender sells it to Sinar Gems Lanka before the month is out.
  '0e5pymow31p': { cue: '[dry, bitter]' },
  // Narrator: Shehani Gunasekera flies to Singapore on Saturday "for a conference". The Port City showroom does not open again. Within a week a new name is painted on the director's door: Melissa Ong.
  '1jhubayqfby': { say: '[dry, sardonic] Shehani Gunasekera flies to Singapore on Saturday "for a conference". The Port City showroom does not open again. [break] [low, ominous] Within a week a new name is painted on the director\'s door: [emphasis] Melissa Ong.' },
  // Narrator: Shehani Gunasekera flies to Singapore on Saturday "for a conference". The Port City showroom does not open again.
  '1nskh21cnzv': { cue: '[dry, bitter, resigned]' },
  // Narrator: Kasun Ranaweera signs on as a reefer technician aboard a Sinar Cold Chain feeder ship. Its next port of call is Port Klang.
  '0jqj73dt4g3': { say: '[flat, bitter] Kasun Ranaweera signs on as a reefer technician aboard a Sinar Cold Chain feeder ship. [break] [low, ominous] Its next port of call is Port Klang.' },
  // Narrator: Tony Kwan is not at the depot on Friday. His desk is clear, and his second phone has gone with him.
  '0zk3fpsbeix': { cue: '[dry, wry, unsurprised]' },
  // Narrator: CID open the safe at 112 Sea Street with Mohan's key. It holds the shop's gold, a bundle of school reports with Tharshini's name on them, and nothing else.
  '197mj5qrcwi': { say: '[flat, matter-of-fact] CID open the safe at 112 Sea Street with Mohan\'s key. [break] [softer, rueful] It holds the shop\'s gold, a bundle of school reports with Tharshini\'s name on them, and nothing else.' },
  // Narrator: On Friday evening Herath reads the mortuary's effects list again, and finds the line everybody skipped. One pink ticket, no. 0414. Found in left sock.
  '1oaxw6c11j9': { say: '[low, slow realization] On Friday evening Herath reads the mortuary\'s effects list again, and finds the line everybody skipped. [break] One pink ticket, number oh four one four. [quiet] Found in left sock.', speed: 0.93 },
  // Narrator: The cloakroom clerk remembers 0414. It was collected on Thursday morning by a man in a work polo with a little sun on the pocket. He had the ticket. He paid for the three days.
  '0tn22nd496m': { say: '[low, bitter] The cloakroom clerk remembers oh four one four. It was collected on Thursday morning by a man in a work polo with a little sun on the pocket. [break] [cold] He had the ticket. He paid for the three days.' },
  // Narrator: On your last evening you go back to Malay Street to pay Uncle Saldin for the tea.
  '15xye15jh8k': { cue: '[quiet, warm, a little tired]' },
  // Uncle Saldin: Orang Malaysia tu datang lagi semalam. Dua teh. Minum satu.  /  Your Malaysian came again last night. Two teh. He drank one.
  '10pkowwp20j': { say: '[warm, old man, knowing] Orang Malaysia tu datang lagi semalam. [break] Dua teh. [break] Minum satu.', speed: 0.9 },
  // Narrator: He left a message, Saldin says. Galle Face Green, the bench by the old cannon, at sunset.
  '04nfz7og0rv': { cue: '[hushed, expectant]' },
  // Narrator: You wait until the kites come down. Nobody comes. On the bench, under a cup of tea gone cold, a paper kancil folded from a kottu receipt.
  '0dibfkfzdy0': { say: '[quiet, melancholy] You wait until the kites come down. [break] Nobody comes. [long-break] [tender, aching] On the bench, under a cup of tea gone cold, a paper kancil folded from a kottu receipt.', speed: 0.9 },
  // Narrator: At midnight your phone rings. A Colombo number you have never seen.
  '1j6ugwtcst6': { cue: '[tense, hushed]', speed: 0.93 },
  // ??? (voiced as Daniel Raj): Machan.
  '05ig8ri9b2g': { say: '[long-break][low, warm, tired, close to the phone] Machan.', speed: 0.85 },
  // Narrator: One word. Behind it, the sea, and somewhere the clatter of kottu blades.
  '168za7mmba9': { cue: '[shaken, hushed, slow]', speed: 0.9 },
  // ??? (voiced as Daniel Raj): Not yet. Go home. Look at the lifts.
  '1q5y7fg18k5': { say: '[quiet, urgent, gentle] Not yet. [break] Go home. [break] [low, meaningful] Look at the lifts.', speed: 0.9 },
  // Narrator: The line goes dead. Your hand has gone to the lighter in your pocket, and stays there.
  '01863adldlw': { cue: '[quiet, unsteady, moved]', speed: 0.88 },
  // Narrator: Before you board, Herath sends one more photograph: the top of the Port City email, the strip the shredder chewed. Sender: Office of the Chairman. Level 14, Menara Sinar, Kuala Lumpur.
  '10f9q2gq0uh': { say: '[low, measured, growing dread] Before you board, Herath sends one more photograph: the top of the Port City email, the strip the shredder chewed. [break] Sender: Office of the Chairman. [long-break] [cold, quiet] Level fourteen, Menara Sinar, Kuala Lumpur.', speed: 0.92 },
  // Narrator: The lifts in Menara Sinar go from 13 to 15.
  '1p2iahm8vvh': { say: '[long-break][whispering, ominous] The lifts in Menara Sinar go from thirteen to fifteen.', speed: 0.85 },
  // Narrator: Ticket 0414 is still in the cloakroom ledger. One parcel, newspaper and string, left on Tuesday at 9:31 PM, three days paid in advance.
  '0p9jxq5tamp': { say: '[measured, rising hope] Ticket oh four one four is still in the cloakroom ledger. [break] One parcel, newspaper and string, left on Tuesday at nine thirty-one, three days paid in advance.' },
  // Inspector Ruwan Herath: Ninety rupees a day, and nobody looks inside. Every crook in Colombo knows it. So did one honest man.
  '205ms43wn1d': { say: '[dry, wry] Ninety rupees a day, and nobody looks inside. Every crook in Colombo knows it. [break] [softer, respectful] So did one honest man.' },
  // Narrator: Inside, Yogi's carbon book. Sixty-one certificates in six years, and beside every one, in his small careful Tamil, what the stone was really worth.
  '0hx0h5u71bw': { cue: '[hushed, reverent, measured]', speed: 0.93 },
  // Narrator: On the last page, in English, dated Tuesday: "Every valuation above was made on the instruction of S. Gunasekera, for the Office of the Chairman. I am sorry. P. Yogeswaran."
  '0wyrjka34bu': { say: '[slow, grave] On the last page, in English, dated Tuesday: [break] "Every valuation above was made on the instruction of S. Gunasekera, for the Office of the Chairman. [long-break] [quiet, sorrowful] I am sorry. P. Yogeswaran."', speed: 0.9 },
  // Narrator: Clipped inside the back cover, a Malaysian customs release for three reefer units, Port Klang to Colombo, 2022. Officer: N. SALLEH.
  '1vjwagggndq': { say: '[low, ominous] Clipped inside the back cover, a Malaysian customs release for three reefer units, Port Klang to Colombo, 2022. [break] Officer: [emphasis] N. Salleh.' },
  // Narrator: CID take Uncle Saldin's counter apart board by board while he watches from the doorway with his hands behind his back. There is nothing under it but fifty years of dust.
  '05p4bmruwlb': { say: '[flat, regretful] CID take Uncle Saldin\'s counter apart board by board while he watches from the doorway with his hands behind his back. [break] [quiet, ashamed] There is nothing under it but fifty years of dust.' },
  // Narrator: Navy divers spend two days in Beira Lake. They bring up a bicycle, a temple bell and a great deal of mud.
  '09ob7hpihs9': { say: '[flat, weary] Navy divers spend two days in Beira Lake. [break] [dry, bitter] They bring up a bicycle, a temple bell and a great deal of mud.' },
  // Narrator: Nobody goes looking for the book.
  '0cx5lb8eage': { cue: '[flat, final]', speed: 0.9 },
  // Narrator: Shehani Gunasekera is arrested at the Port City showroom at six in the morning, still in the grey dress from the charity dinner. Sinar Gems Lanka's lawyers arrive before the police jeep has left the car park.
  '0hb70tnyrzw': { say: '[clipped, formal] Shehani Gunasekera is arrested at the Port City showroom at six in the morning, still in the grey dress from the charity dinner. [break] [sardonic] Sinar Gems Lanka\'s lawyers arrive before the police jeep has left the car park.' },
  // Narrator: Mohan Yogeswaran is charged with his brother's murder. He tells the magistrate he was in Mount Lavinia, selling his brother's stones behind his back. The Bangkok buyer has already flown home.
  '0pa3bmapsf4': { say: '[clipped, formal] Mohan Yogeswaran is charged with his brother\'s murder. [break] [softer, uneasy] He tells the magistrate he was in Mount Lavinia, selling his brother\'s stones behind his back. [flat] The Bangkok buyer has already flown home.' },
  // Tharshini Yogeswaran: They took Chithappa. He sold Appa's stones and lied to me, and now he is in Welikada for the one thing he did not do. I do not know which part to be angry about.
  '0d1rm9whwbz': { say: '[numb, bitter] They took Chithappa. [break] He sold Appa\'s stones and lied to me, and now he is in Welikada for the one thing he did not do. [break] [exhausted, confused] I do not know which part to be angry about.', speed: 0.9 },
  // Narrator: A warrant goes out for a Malaysian national, K. Rajan. The passport number on the lodge register was issued in Kuala Lumpur in 2019, to a man who died in August 2021.
  '0lk9ybdlyur': { say: '[clipped, formal] A warrant goes out for a Malaysian national, K. Rajan. [break] [low, unsettled] The passport number on the lodge register was issued in Kuala Lumpur in 2019, [long-break] to a man who died in August 2021.', speed: 0.92 },
  // Tharshini Yogeswaran: They say it was the Malaysian. Appa trusted him. Appa trusted him more than he trusted himself.
  '1899tpwly4h': { say: '[hurt, confused] They say it was the Malaysian. [break] Appa trusted him. [quiet, bitter] Appa trusted him more than he trusted himself.', speed: 0.92 },
  // Narrator: CID break the door of Room 14 at seven. The bed is made. The bin is empty. The window is open onto the harbour.
  '0ywfuwxoab0': { say: '[tense, clipped] CID break the door of Room 14 at seven. [break] The bed is made. The bin is empty. [quiet, hollow] The window is open onto the harbour.', speed: 0.95 },
  // Narrator: On the pillow, a paper kancil, folded from a Sri Lankan Airlines boarding pass. Colombo to Kuala Lumpur. The name has been torn off.
  '07lc9amtu99': { say: '[hushed, aching] On the pillow, a paper kancil, folded from a Sri Lankan Airlines boarding pass. [break] Colombo to Kuala Lumpur. [long-break] [quiet] The name has been torn off.', speed: 0.9 },
  // Narrator: Herath puts it in an evidence bag and hands it to you without a word, as if it were yours.
  '1ehcqftv1d8': { cue: '[quiet, heavy, intimate]', speed: 0.9 },
  // Narrator: At midnight your phone rings. A Colombo number. Nobody speaks. Waves, and one long breath, and then the line goes dead.
  '08n0jdyboob': { say: '[tense, hushed] At midnight your phone rings. A Colombo number. [break] Nobody speaks. [long-break] [whispering] Waves, and one long breath, and then the line goes dead.', speed: 0.88 },
  // Narrator: Kasun Ranaweera is arrested at the Bloemendhal depot gate, his forearms still scored pink. In the jeep he asks only one thing: whether the old man had children.
  '012woax46tf': { say: '[clipped, formal] Kasun Ranaweera is arrested at the Bloemendhal depot gate, his forearms still scored pink. [break] [softer, troubled] In the jeep he asks only one thing: whether the old man had children.' },
  // Tharshini Yogeswaran: Appa used to say a stone tells the truth to anybody who holds it to the light long enough. You held it long enough.
  '05r2p0i6eth': { say: '[tearful, grateful] Appa used to say a stone tells the truth to anybody who holds it to the light long enough. [break] [quiet, warm] You held it long enough.', speed: 0.9 },
};
