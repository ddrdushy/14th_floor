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

  // ---------------- case05 ----------------
  // Narrator: On the television over Bala Anne's counter: a glass tower on Jalan Ampang, blue lights, and a white sheet on a wet pavement. A director of Sinar Holdings has fallen.
  '2cj06yd35tl': { say: '[low, weary, morning-after] On the television over Bala Anne\'s counter: a glass tower on Jalan Ampang, blue lights, and a white sheet on a wet pavement. [break] [quiet, ominous] A director of Sinar Holdings has fallen.', speed: 0.95 },
  // Bala Anne: Thambi. Idhu andha Sinar dhaane?  /  Boy. Isn't that your Sinar?
  '0oqsekepbk2': { say: '[low, uneasy, not looking away from the screen] தம்பி. [break] இது அந்த சினார் தானே?', speed: 0.92 },
  // Bala Anne: You say that name in your sleep. I can hear it through the floor.
  '0gakzt7h9u9': { say: '[gruff, worried, half scolding] You say that name in your sleep. [break] [softer] I can hear it through the floor.' },
  // Narrator: Under the picture, smaller: Dr. Shanti Menon's appeal will be heard in March. This time Bala Anne does not turn the sound down. He turns it off.
  '0d17oggjh6o': { say: '[flat, guilty] Under the picture, smaller: Dr. Shanti Menon\'s appeal will be heard in March. [break] This time Bala Anne does not turn the sound down. [quiet, heavy] He turns it off.', speed: 0.93 },
  // Bala Anne: That durian man Ravi sent a box of fruit for you. I put it on the five-foot way. I am not having durian in my kitchen.
  '1itqidt9axs': { say: '[grumbling, wry] That durian man Ravi sent a box of fruit for you. I put it on the five-foot way. [break] [indignant, comic] I am not having durian in my kitchen.' },
  // Narrator: Under the till, a letter with a Sri Lankan stamp. Tharshini, three lines: Chithappa's trial is in January. The shop is sold. Appa's loupe is still around my neck.
  '0ufi2obxlf7': { say: '[quiet, heavy, guilty] Under the till, a letter with a Sri Lankan stamp. Tharshini, three lines: [break] Chithappa\'s trial is in January. [break] The shop is sold. [long-break] [tender, aching] Appa\'s loupe is still around my neck.', speed: 0.9 },
  // Narrator: You take them out of the drawer and stand them in a row: the paper kancils, one from every city they have sent you to. Mont Kiara. Penang. Colombo.
  '0aaokfiu8bp': { say: '[low, intimate, slow] You take them out of the drawer and stand them in a row: the paper kancils, one from every city they have sent you to. [break] Mont Kiara. [break] Penang. [break] Colombo.', speed: 0.92 },
  // Narrator: And a voice on a Colombo line, the last night there. Not yet. Go home. Look at the lifts.
  '2g3unqg4fid': { say: '[hushed, remembering] And a voice on a Colombo line, the last night there. [long-break] [whispering] Not yet. Go home. Look at the lifts.', speed: 0.88 },
  // Narrator: And a call from Colombo on the last night there, with nobody on the line but the sea and one long breath.
  '14602kbr5br': { cue: '[hushed, haunted, slow]', speed: 0.88 },
  // Narrator: The lifts in Menara Sinar go from 13 to 15. Last night a man came down past all of them.
  '07loa1knthf': { say: '[low, ominous] The lifts in Menara Sinar go from thirteen to fifteen. [long-break] [cold, quiet] Last night a man came down past all of them.', speed: 0.9 },
  // Inspector Farah Iskandar: Yang ini, aku punya.  /  This one is mine.
  '08upg5xlexc': { say: '[low, fierce, possessive] Yang ini, [break] aku punya.', speed: 0.95 },
  // Inspector Farah Iskandar: Dato' Rashid Osman. Group Finance Director, Sinar Holdings. He lay on that pavement through the whole storm before anybody called it in. His fist was closed. This was in it.
  '1ib57wuzdn7': { say: '[clipped, professional, tired] Dato\' Rashid Osman. Group Finance Director, Sinar Holdings. [break] [angry, controlled] He lay on that pavement through the whole storm before anybody called it in. [break] [quieter] His fist was closed. [break] This was in it.' },
  // Inspector Farah Iskandar: You know whose this is. Do not tell me. Not yet.
  '1gxkfk7qfo6': { say: '[low, urgent, almost pleading] You know whose this is. [break] Do not tell me. [break] [softer] Not yet.', speed: 0.92 },
  // Inspector Farah Iskandar: Colombo put out a red notice for a K. Rajan, on your word. Immigration says he landed at KLIA nine days ago. My superintendent read it before I did.
  '2dz0vzlnob3': { say: '[dry, pointed] Colombo put out a red notice for a K. Rajan, on your word. Immigration says he landed at K L I A nine days ago. [break] [bitter, low] My superintendent read it before I did.' },
  // Inspector Farah Iskandar: Herath sent me the last page of a gem cutter's book. Every valuation for the Office of the Chairman. That page is the only reason I am allowed to stand on this pavement.
  '0gdj72cq286': { say: '[measured, grim] Herath sent me the last page of a gem cutter\'s book. Every valuation for the Office of the Chairman. [break] [low, firm] That page is the only reason I am allowed to stand on this pavement.' },
  // Inspector Farah Iskandar: Herath says the gem cutter's book was collected from Fort station by a man with a sun on his shirt. So I have nothing that gets me past that lobby. Except you.
  '20daoledmxx': { say: '[flat, frustrated] Herath says the gem cutter\'s book was collected from Fort station by a man with a sun on his shirt. [break] So I have nothing that gets me past that lobby. [long-break] [dry, reluctant] Except you.' },
  // Inspector Farah Iskandar: And Westport says a Sri Lankan reefer technician walked off a Sinar Cold Chain feeder on Friday night and never walked back on. Scratches on both arms.
  '069zujougj5': { say: '[businesslike, uneasy] And Westport says a Sri Lankan reefer technician walked off a Sinar Cold Chain feeder on Friday night and never walked back on. [break] [cold] Scratches on both arms.' },
  // Narrator: Menara Sinar is thirty-eight storeys of green glass on Jalan Ampang, four hundred metres from the twin towers, with a brass sun on its crown that catches the morning before anything else on the street.
  '121i45dt8ms': { cue: '[atmospheric, measured, faintly bitter]', speed: 0.95 },
  // Narrator: Count the floors from the pavement and you run out of numbers. A third of the way up there is one storey of black glass with no light behind it. Above it, Level 15. Below it, Level 13.
  '22x7o8r1bs5': { say: '[slow, observant] Count the floors from the pavement and you run out of numbers. [break] A third of the way up there is one storey of black glass with no light behind it. [break] Above it, Level fifteen. [break] Below it, Level thirteen.', speed: 0.93 },
  // Narrator: He landed under the black glass.
  '23e8fj7my1m': { say: '[long-break][quiet, grave] He landed under the black glass.', speed: 0.88 },
  // Narrator: At the tape, a young woman with a press lanyard that nobody will let her use. Nurul Ain. His daughter.
  '0lbbm3iaw8t': { say: '[gentle, sober] At the tape, a young woman with a press lanyard that nobody will let her use. [break] Nurul Ain. [break] [soft] His daughter.', speed: 0.93 },
  // Nurul Ain: Everybody keeps telling me he jumped. Maybe he did. He stopped sleeping in September. He said he had signed things he could not unsign.
  '16zb18lq0rr': { say: '[numb, brittle, holding it together] Everybody keeps telling me he jumped. [break] Maybe he did. [break] He stopped sleeping in September. [voice catching] He said he had signed things he could not unsign.', speed: 0.92 },
  // Nurul Ain: At 11:43 he sent me two words.
  '0owxnz8253e': { say: '[quiet, shaking] At eleven forty-three he sent me two words.', speed: 0.9 },
  // Nurul Ain: Maafkan Abah.  /  Forgive your father.
  '01mktgdhxja': { say: '[long-break][barely holding back tears, whispering] Maafkan Abah.', speed: 0.82 },
  // Nurul Ain: And last week he said a strange thing. If a man who folds paper animals ever comes to you, Ain, help him.
  '13gtsmkdy4g': { say: '[sniffing, puzzled, searching your face] And last week he said a strange thing. [break] [softer, quoting her father] If a man who folds paper animals ever comes to you, Ain, help him.', speed: 0.92 },
  // Supt. Khairul Anuar: Tekanan kerja. Dia terjun.  /  Pressure at work. He jumped.
  '28y6b2bkqmr': { say: '[brusque, dismissive, loud] Tekanan kerja. [break] Dia terjun.' },
  // Supt. Khairul Anuar: By Wednesday this file is closed, Farah. And your friend from Brickfields is not police.
  '1d87031v768': { say: '[condescending, warning] By Wednesday this file is closed, Farah. [break] [cold, contemptuous] And your friend from Brickfields is not police.' },
  // Narrator: When he has gone, Farah says one word, Wednesday, the way you say the name of a river you have to cross.
  '1wij22p4ixh': { cue: '[dry, quiet, resolute]', speed: 0.93 },
  // Narrator: The lobby is black marble with a brass sun set in the floor, so that everybody who comes in has to walk across it.
  '1zchgvi0xje': { cue: '[low, wary, observant]' },
  // Zulkifli Hamid: Welcome to Menara Sinar. Anything you need, you ask me first. Inspector. Long time.
  '0vv8ydpfgxy': { say: '[smooth, polite, quietly controlling] Welcome to Menara Sinar. Anything you need, you ask me first. [break] [warmer, knowing] Inspector. [break] Long time.' },
  // Narrator: Behind him an old man in grey overalls has a lift panel open. 12, 13, 15. He catches you counting.
  '0o5r4w2ciy5': { say: '[low, wry] Behind him an old man in grey overalls has a lift panel open. [break] Twelve, thirteen, fifteen. [break] He catches you counting.' },
  // Uncle Wong: Sap sei lau? Mou sap sei lau gaa.  /  Fourteen? There is no fourteen.
  '0f0il7yv0bh': { say: '[old man, gruff, amused] 十四樓？[break] 冇十四樓㗎。' },
  // Uncle Wong: Sap sei. Sat sei.  /  Fourteen sounds like "sure to die".
  '1iinz3lgf4k': { say: '[low, superstitious, serious] 十四。[break] 實死。', speed: 0.9 },

  // ---------------- case05:ending ----------------
  // Narrator: Dang Wangi amends its file on the morning of the third night's tahlil. Not a fall. Pushed, from the fourteenth floor of a building with no fourteenth floor.
  '22nez3tem8x': { say: '[measured, sober] Dang Wangi amends its file on the morning of the third night\'s tahlil. [break] Not a fall. [quiet, grave] Pushed, from the fourteenth floor of a building with no fourteenth floor.', speed: 0.93 },
  // Nurul Ain: They say it is finished. My editor says it is finished. Everybody is very sure about everything except what happened.
  '2b0xj7u9oxu': { say: '[hollow, bitter] They say it is finished. My editor says it is finished. [break] [quiet, weary] Everybody is very sure about everything except what happened.', speed: 0.9 },
  // Narrator: Vivian Chua flies to Singapore on Thursday morning on a Sinar jet. At Seletar a woman in a grey dress is waiting for her on the tarmac. Sinar Holdings thanks its Company Secretary for twenty-seven years of service.
  '0d1q031mkmw': { say: '[dry, sardonic] Vivian Chua flies to Singapore on Thursday morning on a Sinar jet. [break] [low, ominous] At Seletar a woman in a grey dress is waiting for her on the tarmac. [break] [flat, bitter] Sinar Holdings thanks its Company Secretary for twenty-seven years of service.' },
  // Narrator: Vivian Chua flies to Singapore on Thursday morning on a Sinar jet. Sinar Holdings thanks its Company Secretary for twenty-seven years of service.
  '2brqif9djq6': { say: '[dry, sardonic] Vivian Chua flies to Singapore on Thursday morning on a Sinar jet. [break] [flat, bitter] Sinar Holdings thanks its Company Secretary for twenty-seven years of service.' },
  // Narrator: By Friday the Office of the Chairman has a new secretary. Her name is at the bottom of the letter Sinar's lawyers send to Bukit Aman: Melissa Ong.
  '0n36s4xj54w': { say: '[low, ominous] By Friday the Office of the Chairman has a new secretary. Her name is at the bottom of the letter Sinar\'s lawyers send to Bukit Aman: [break] [emphasis] Melissa Ong.' },
  // Narrator: Zulkifli Hamid is made Head of Security at Sinar Cold Chain, Westport. He leaves Menara Sinar on Wednesday with a cake from the night guards.
  '1ocvxin7etj': { say: '[flat, bitter] Zulkifli Hamid is made Head of Security at Sinar Cold Chain, Westport. [break] [dry, sour] He leaves Menara Sinar on Wednesday with a cake from the night guards.' },
  // Narrator: Superintendent Khairul Anuar is suspended. The murder charge is dropped on Friday. The envelope is not. On Monday somebody at Bukit Aman starts returning Farah's calls.
  '2e5f11uqxr3': { say: '[measured, dry] Superintendent Khairul Anuar is suspended. The murder charge is dropped on Friday. [break] The envelope is not. [break] [faintly hopeful] On Monday somebody at Bukit Aman starts returning Farah\'s calls.' },
  // Narrator: Superintendent Khairul Anuar gives the press conference himself, thanks his officers, and does not look at Farah once.
  '2fuv6q0tssx': { cue: '[dry, bitter, contemptuous]' },
  // Narrator: Bomba seals the fourteenth floor for fire-safety breaches. It is the only charge in Kuala Lumpur that Sinar's lawyers cannot argue away by lunch.
  '14typxmppw2': { say: '[measured, faintly wry] Bomba seals the fourteenth floor for fire-safety breaches. [break] [dry] It is the only charge in Kuala Lumpur that Sinar\'s lawyers cannot argue away by lunch.' },
  // Narrator: DBKL's file says what it has said since 1997. Level 14 of Menara Sinar is a plant floor: pumps, ducts, transformers. Nobody at DBKL can find who signed the plans.
  '1nmero4zpi3': { say: '[flat, sardonic] D B K L\'s file says what it has said since 1997. Level fourteen of Menara Sinar is a plant floor: pumps, ducts, transformers. [break] [low, uneasy] Nobody at D B K L can find who signed the plans.' },
  // Narrator: The shelves are bare. The chair still faces the window, and the telescope beside it still points south-west, at Brickfields.
  '117nvjo7mp2': { say: '[hushed, uneasy] The shelves are bare. [break] The chair still faces the window, [break] [cold, quiet] and the telescope beside it still points south-west, at Brickfields.', speed: 0.9 },
  // Vivian Chua: You think Floor 14 was his office. It was his memory. You have only seen the part he chose to forget.
  '1mw05yfzhty': { say: '[calm, precise, faintly pitying] You think Floor fourteen was his office. [break] It was his memory. [break] [cool, quiet] You have only seen the part he chose to forget.', speed: 0.92 },
  // Narrator: Azman sends Farah a photograph from the cab of a crane at Westport, 4 AM on Thursday: a reefer unit going aboard a Singapore feeder. Serial RU-19.
  '22xt8w2unon': { say: '[low, tense] Azman sends Farah a photograph from the cab of a crane at Westport, four in the morning on Thursday: a reefer unit going aboard a Singapore feeder. [break] [ominous] Serial R U nineteen.' },
  // Narrator: The export permit for RU-19 is stamped at Westport. Officer: N. SALLEH.
  '2gdb4aai5pi': { say: '[flat, cold] The export permit for R U nineteen is stamped at Westport. [break] Officer: [emphasis] N. Salleh.' },
  // Narrator: The man who drove the reefer van down to the loading bay at three on Monday morning had a Sri Lankan seaman's pass, and four healing scratches on each forearm.
  '1w1f0gpw0ad': { say: '[low, ominous] The man who drove the reefer van down to the loading bay at three on Monday morning had a Sri Lankan seaman\'s pass, [break] [cold] and four healing scratches on each forearm.' },
  // Narrator: Farah sends one car and no radio. Mak Teh rolls up the warung shutter before anybody knocks, and points up the stairs without a word.
  '120ptioibj6': { say: '[hushed, tense, dawn] Farah sends one car and no radio. [break] Mak Teh rolls up the warung shutter before anybody knocks, and points up the stairs without a word.', speed: 0.93 },
  // Narrator: He is at the window with two glasses of teh. He has drunk one. He looks older than five years, and exactly the same.
  '19l1fzxaevq': { say: '[slow, overwhelmed, tender] He is at the window with two glasses of teh. [break] He has drunk one. [long-break] [voice thick] He looks older than five years, and exactly the same.', speed: 0.85 },
  // Daniel Raj: You are late, machan. Five years late. I am not complaining.
  '2duubb8sas0': { say: '[warm, tired, a crooked smile in the voice] You are late, machan. [break] Five years late. [break] [soft laugh] I am not complaining.', speed: 0.9 },
  // Daniel Raj: In 2021 they gave me a choice. Stay dead, and the detective lives. Come back, and the detective burns next. So I stayed dead.
  '0c0c96oli88': { say: '[low, quiet, confessing] In 2021 they gave me a choice. [break] Stay dead, and the detective lives. [break] Come back, and the detective burns next. [long-break] [aching, simple] So I stayed dead.', speed: 0.88 },
  // Daniel Raj: You gave the boy in Bay 3 his name back. Wei Jie. I watched them bury him as me, and I said nothing.
  '06nibxeog87': { say: '[grieving, ashamed] You gave the boy in Bay three his name back. [break] Wei Jie. [break] [voice breaking] I watched them bury him as me, and I said nothing.', speed: 0.87 },
  // Daniel Raj: Mannichidu, machan.  /  Forgive me, machan.
  '0qajuibormc': { say: '[long-break][close to tears, very quiet] மன்னிச்சிடு, [break] மச்சான்.', speed: 0.82 },
  // Narrator: You put the silver lighter on the sill between the glasses. He pushes it back. Its twin is in his pocket. He bought two in 2016, one each, for two people who never smoked.
  '0kzjs91clpm': { say: '[tender, quiet] You put the silver lighter on the sill between the glasses. [break] He pushes it back. [break] Its twin is in his pocket. [long-break] [wistful, almost smiling] He bought two in 2016, one each, for two people who never smoked.', speed: 0.88 },
  // Narrator: Farah takes him to a house whose address she gives nobody, not even you. He goes down the wooden stairs with his hands in his pockets, like a man going to buy bread.
  '240o14w3rec': { say: '[quiet, relieved, bittersweet] Farah takes him to a house whose address she gives nobody, not even you. [break] [gentle] He goes down the wooden stairs with his hands in his pockets, like a man going to buy bread.', speed: 0.9 },
  // Narrator: Your office door is locked, the way you left it. The folder on your desk is not the way you left anything.
  '1aqxr8nxpq8': { say: '[tense, hushed] Your office door is locked, the way you left it. [break] [cold, slow] The folder on your desk is not the way you left anything.', speed: 0.92 },
  // Narrator: Grey archive board, a small embossed sun on the cover. On the tab, typed, your name. Opened 2016.
  '1qqlu4921sa': { say: '[slow, dread] Grey archive board, a small embossed sun on the cover. [break] On the tab, typed, your name. [long-break] [whispering] Opened 2016.', speed: 0.88 },
  // Narrator: Inside, one photograph: you and Daniel at table 6 in Restoran Bala, taken from across Jalan Tun Sambanthan. August 2021, the week before the fire.
  '02c36nue1x4': { say: '[low, shaken] Inside, one photograph: you and Daniel at table six in Restoran Bala, taken from across Jalan Tun Sambanthan. [long-break] [aching, quiet] August 2021, the week before the fire.', speed: 0.88 },
  // Narrator: And one typed list. H. Goh. Lim Chee Keong. P. Yogeswaran. Rashid Osman. Every name struck through by hand, in blue ink.
  '0kfwmjqqgei': { say: '[slow, grave, a roll call] And one typed list. [break] H. Goh. [break] Lim Chee Keong. [break] P. Yogeswaran. [break] Rashid Osman. [long-break] [cold] Every name struck through by hand, in blue ink.', speed: 0.86 },
  // Narrator: Under them, two names nobody has struck through yet. The first is Daniel's. The second is yours.
  '0hsq723ts3c': { say: '[whispering, afraid] Under them, two names nobody has struck through yet. [break] The first is Daniel\'s. [long-break] [very quiet] The second is yours.', speed: 0.84 },
  // Narrator: Across the city, on Jalan Ampang, one storey of black glass that Bomba sealed this morning has a light on in it.
  '0x5ndmvtmz8': { say: '[long-break][hushed, ominous, slow] Across the city, on Jalan Ampang, one storey of black glass that Bomba sealed this morning [break] has a light on in it.', speed: 0.84 },
  // Narrator: Farah's team searches your office while Bala Anne watches from the stairs with a ladle in his hand. They find your kettle, your files, and nobody.
  '0ks1y6c6s9p': { say: '[flat, rueful] Farah\'s team searches your office while Bala Anne watches from the stairs with a ladle in his hand. [break] [quiet, hollow] They find your kettle, your files, and nobody.' },
  // Narrator: By the time anybody thinks of Kampung Baru it is evening. Mak Teh is sitting on the warung steps. At noon, she says, two men in polo shirts with a little sun on the pocket went up, and came down with a third man between them. A van was waiting at the end of the Saloma bridge.
  '22h0k3dx6js': { say: '[heavy, slow] By the time anybody thinks of Kampung Baru it is evening. Mak Teh is sitting on the warung steps. [break] [low, dread] At noon, she says, two men in polo shirts with a little sun on the pocket went up, and came down with a third man between them. [break] [quiet, sick] A van was waiting at the end of the Saloma bridge.', speed: 0.92 },
  // Mak Teh: Dia suruh saya jangan menangis. Saya menangis juga.  /  He told me not to cry. I cried anyway.
  '0iyvlzdtam6': { say: '[old woman, crying softly] Dia suruh saya jangan menangis. [break] [sobbing] Saya menangis juga.', speed: 0.85 },
  // Narrator: Upstairs, a chair on its side, two glasses of teh across the floorboards, and in the tea a silver flip-top lighter, the twin of the one in your pocket. Engraved inside the lid: D.R.
  '298imfraqhd': { say: '[hushed, stricken] Upstairs, a chair on its side, two glasses of teh across the floorboards, [break] and in the tea a silver flip-top lighter, the twin of the one in your pocket. [long-break] [whispering] Engraved inside the lid: D. R.', speed: 0.87 },
  // Narrator: The warrant in his name stays open. Whether he ran or was taken, he is a wanted man now, and nobody looks hard for a wanted man who has disappeared.
  '04ppanp04tb': { say: '[bitter, low] The warrant in his name stays open. [break] Whether he ran or was taken, he is a wanted man now, [break] [quiet, guilty] and nobody looks hard for a wanted man who has disappeared.', speed: 0.92 },
  // Narrator: Farah's people walk the length of the morning flight to Colombo at KLIA. Seat 14A is empty. It was booked from a Sinar travel account at four on Monday morning.
  '1uo4kurcjqo': { say: '[tense, flat] Farah\'s people walk the length of the morning flight to Colombo at K L I A. [break] Seat fourteen A is empty. [break] [cold, realizing] It was booked from a Sinar travel account at four on Monday morning.' },
  // Narrator: Bomba opens the fourteenth floor for Farah a second time. There is nobody on it but the two of you, and a chair facing the window.
  '1ap0pxa5w3z': { say: '[flat, hollow] Bomba opens the fourteenth floor for Farah a second time. [break] [quiet, uneasy] There is nobody on it but the two of you, and a chair facing the window.' },
  // Narrator: Farah does not send anybody anywhere.
  '0ilwb3o75xm': { cue: '[flat, final]', speed: 0.9 },
  // Narrator: A warrant for murder goes out in the name of K. Rajan. Under it, in pencil, where only she will see it, Farah writes the other name.
  '0g8vsq1rvha': { say: '[clipped, formal] A warrant for murder goes out in the name of K. Rajan. [long-break] [quiet, aching] Under it, in pencil, where only she will see it, Farah writes the other name.', speed: 0.9 },
  // Nurul Ain: They say it was the man with the paper animals. Abah told me to help him. I do not know which one of them was lying to me.
  '1hps9upsofg': { say: '[hurt, confused] They say it was the man with the paper animals. [break] Abah told me to help him. [break] [bitter, breaking] I do not know which one of them was lying to me.', speed: 0.9 },
  // Narrator: Farah sends four cars, because the warrant says murder. Mak Teh stands in the warung doorway with her hand over her mouth.
  '25ii5q3yqi1': { say: '[heavy, clipped] Farah sends four cars, because the warrant says murder. [break] [sorrowful] Mak Teh stands in the warung doorway with her hand over her mouth.', speed: 0.93 },
  // Narrator: He comes down the wooden steps with his hands held out in front of him before anybody asks. He looks older than five years, and exactly the same.
  '1cmmeeggu7b': { say: '[slow, stricken] He comes down the wooden steps with his hands held out in front of him before anybody asks. [long-break] [voice thick] He looks older than five years, and exactly the same.', speed: 0.87 },
  // Daniel Raj: Machan. You did right, with what they gave you.
  '17c5mco4k83': { say: '[calm, gentle, forgiving] Machan. [break] You did right, with what they gave you.', speed: 0.88 },
  // Narrator: He is remanded at Sungai Buloh, in a block where Sinar's lawyers already have three clients.
  '1l13j6cbvb9': { say: '[flat, low, dread] He is remanded at Sungai Buloh, [break] in a block where Sinar\'s lawyers already have three clients.', speed: 0.92 },
  // Narrator: Superintendent Khairul Anuar signs the remand order himself.
  '14wtmlb7k93': { cue: '[cold, quiet, ominous]', speed: 0.9 },
  // Narrator: Zulkifli Hamid is arrested in the control room on B1, in front of his own monitors. He takes the earpiece out himself, coils the wire, and puts it in Farah's hand. "You still drop your left shoulder when you shoot," he tells her.
  '23efd1082au': { say: '[clipped, formal] Zulkifli Hamid is arrested in the control room on B one, in front of his own monitors. [break] [slower, sad] He takes the earpiece out himself, coils the wire, and puts it in Farah\'s hand. [break] [quiet, bitter] "You still drop your left shoulder when you shoot," he tells her.' },
  // Narrator: Superintendent Khairul Anuar is arrested at Bukit Aman in front of his own officers. The murder charge will not last the week. The envelope in his glovebox, RM 8,000 in fifties, will.
  '1pecmomnc1t': { say: '[clipped, formal] Superintendent Khairul Anuar is arrested at Bukit Aman in front of his own officers. [break] The murder charge will not last the week. [break] [dry, pointed] The envelope in his glovebox, eight thousand ringgit in fifties, will.' },
  // Nurul Ain: You arrested a superintendent. My editor cleared the whole front page for it. Abah would have read it twice and asked who was still upstairs.
  '0ziizqyzuk2': { say: '[dry, tired, sceptical] You arrested a superintendent. My editor cleared the whole front page for it. [break] [sad, knowing] Abah would have read it twice and asked who was still upstairs.', speed: 0.92 },
  // Narrator: Vivian Chua is arrested at her house in Bukit Tunku at five in the morning. She is dressed, with her handbag on her knee, as if she has been waiting for a car. She asks for one telephone call, and does not make it.
  '0tj6oku1s49': { say: '[clipped, formal] Vivian Chua is arrested at her house in Bukit Tunku at five in the morning. [break] [uneasy] She is dressed, with her handbag on her knee, as if she has been waiting for a car. [break] [quiet, cold] She asks for one telephone call, and does not make it.' },
  // Nurul Ain: He did not jump. He was pushed while he was trying to undo something. I can write that now. I can write both of those.
  '149rdips4t8': { say: '[tearful, steadying] He did not jump. [break] He was pushed while he was trying to undo something. [break] [quiet, fierce, grateful] I can write that now. I can write both of those.', speed: 0.9 },
  // ---------------- case06 ----------------
  // Narrator: Bala Anne comes up the stairs himself, which he never does after closing, with a page torn from his order pad.
  '2czgavzhvxy': { say: '[low, late-night, uneasy] Bala Anne comes up the stairs himself, [break] which he never does after closing, [break] with a page torn from his order pad.', speed: 0.94 },
  // Bala Anne: Thambi. Unakku oru phone vandhuchu. Rendu naal munnaadi.  /  Boy. A phone call came for you. Two days ago.
  '26ryfuwogb5': { say: '[out of breath from the stairs, sheepish] தம்பி. [break] உனக்கு ஒரு ஃபோன் வந்துச்சு. [break] [guilty, quieter] ரெண்டு நாள் முன்னாடி.', speed: 0.92 },
  // Bala Anne: An old Malay man, very polite. He asked for the detective from the fire. He made me promise to give it to you tonight and not before. I promised. Do not look at me like that.
  '2fv73j8mh7u': { say: '[defensive, gruff, uneasy] An old Malay man, very polite. He asked for the detective from the fire. [break] He made me promise to give it to you tonight and not before. [break] I promised. [long-break] [bristling, embarrassed] Do not look at me like that.' },
  // Narrator: On the page, in his capitals: BAY 3. KHAMIS. 12 MALAM. 5 TAHUN. SAYA BAWA GAMBAR. I.B. Bay 3, Thursday, midnight, five years. I will bring photographs.
  '1kjnr2ey1zj': { say: '[slow, reading aloud, cold dread rising] On the page, in his capitals: [break] Bay three. Khamis. Dua belas malam. Lima tahun. Saya bawa gambar. I. B. [long-break] [quiet] Bay three, Thursday, midnight, five years. [break] I will bring photographs.', speed: 0.88 },
  // Narrator: Across Jalan Tun Sambanthan a grey sedan is parked where nobody parks after eleven. WXY 1408. By the time you come down with your keys, it has gone.
  '0bazpo5c003': { say: '[low, wary] Across Jalan Tun Sambanthan a grey sedan is parked where nobody parks after eleven. [break] W X Y, one four oh eight. [break] [flat] By the time you come down with your keys, it has gone.', speed: 0.93 },
  // Narrator: You make Port Klang in thirty-five minutes, which is not possible, and see the glow from the Pulau Indah bridge, which is.
  '1q9nd8blbsz': { say: '[tense, driving, clipped] You make Port Klang in thirty-five minutes, which is not possible, [break] [dread] and see the glow from the Pulau Indah bridge, which is.' },
  // Narrator: The sky over the port is orange. You know which bay it is before you can see it.
  '0u80fw0xhxl': { say: '[hushed, sick with certainty] The sky over the port is orange. [break] You know which bay it is before you can see it.', speed: 0.92 },
  // Narrator: Five years to the night, you watch Bay 3 burn again. This time you are on the right side of the tape.
  '1fncjbqg25z': { say: '[low, shaken, bitter] Five years to the night, you watch Bay three burn again. [break] This time you are on the right side of the tape.', speed: 0.9 },
  // Narrator: The new roof goes the way the old one went: all at once, with a sound like a long breath let out.
  '1d2jr2rmqq3': { cue: '[slow, haunted, almost a whisper at the end]', speed: 0.9 },
  // Narrator: Your chest is a fist. Count the cranes. One. Two. Three.
  '28uih9uvcjl': { say: '[breathing hard, panicking, forcing calm] Your chest is a fist. [break] Count the cranes. [break] One. [break] Two. [break] Three.', speed: 0.86 },
  // Narrator: And under the roar, something you have never let yourself remember: a voice outside the smoke, calm as a man ordering tea, saying a name you did not know then.
  '1w5uy1plk2v': { say: '[hushed, dreamlike, afraid of the memory] And under the roar, something you have never let yourself remember: [break] a voice outside the smoke, calm as a man ordering tea, [break] saying a name you did not know then.', speed: 0.88 },
  // The Chairman: Biarkan, Tuan Ismail. Biar dua-dua sekali.  /  Let it burn, Tuan Ismail. Both of them.
  '0qbwdnyr5j8': { say: '[calm, unhurried, quietly courteous, utterly cold] Biarkan, Tuan Ismail. [break] Biar dua-dua sekali.', speed: 0.86 },
  // Narrator: At first light Bomba walk in on the black floor. One body, on its side by the old reefer sockets, where the other one lay in 2021.
  '0encacbvans': { say: '[grey, quiet, sombre] At first light Bomba walk in on the black floor. [break] One body, on its side by the old reefer sockets, [break] where the other one lay in twenty twenty-one.', speed: 0.92 },
  // Narrator: Beside its right hand, a silver flip-top lighter.
  '0sng748vff9': { say: '[long-break][very quiet, ominous] Beside its right hand, a silver flip-top lighter.', speed: 0.86 },
  // Inspector Farah Iskandar: Engraved inside the lid. D.R. Klang Selatan read it before I did.
  '04w8yirrxur': { say: '[tight, controlled, angry underneath] Engraved inside the lid. [break] D. R. [break] [bitter] Klang Selatan read it before I did.', speed: 0.94 },
  // Inspector Farah Iskandar: Mana kau punya?  /  Where is yours?
  '01yaxe1r9jj': { say: '[low, reluctant, she hates asking] Mana kau punya?', speed: 0.9 },
  // Narrator: Your hand is already in your pocket. You put Daniel's lighter on the bonnet of her car, and she looks at the two of them side by side for a long time.
  '1h9sr3qbvcq': { say: '[quiet, steady] Your hand is already in your pocket. [break] You put Daniel\'s lighter on the bonnet of her car, [break] and she looks at the two of them side by side for a long time.', speed: 0.92 },
  // Inspector Farah Iskandar: Daniel's twin is in his pocket, in a house I have not told you about. My man watched him take it out at five this morning. He was there all night.
  '1hrrsaqsksk': { say: '[low, measured, reassuring despite herself] Daniel\'s twin is in his pocket, in a house I have not told you about. [break] My man watched him take it out at five this morning. [break] He was there all night.' },
  // Inspector Farah Iskandar: Daniel's twin is in a property bag at Sungai Buloh, sealed, with his belt and his shoelaces. I rang the prison at five.
  '08shfxlkz0s': { say: '[flat, tired, faintly guilty] Daniel\'s twin is in a property bag at Sungai Buloh, sealed, with his belt and his shoelaces. [break] I rang the prison at five.' },
  // Inspector Farah Iskandar: Daniel's twin is in my evidence locker at Bukit Aman. I took it out of a glass of tea in Kampung Baru with my own hands.
  '20e656daj72': { say: '[quiet, raw, steadying her voice] Daniel\'s twin is in my evidence locker at Bukit Aman. [break] I took it out of a glass of tea in Kampung Baru [break] with my own hands.', speed: 0.92 },
  // Inspector Farah Iskandar: So that makes three.
  '0ssinex6i9j': { say: '[long-break][very quiet, chilled] So that makes three.', speed: 0.88 },
  // Inspector Farah Iskandar: Klang Selatan have a superintendent at Bukit Aman telling them you were here at twelve forty. You were. They want you for twenty-four hours. They are not getting you.
  '1lc2p2jztn0': { say: '[brisk, angry, protective] Klang Selatan have a superintendent at Bukit Aman telling them you were here at twelve forty. [break] You were. [break] They want you for twenty-four hours. [break] [hard, final] They are not getting you.' },
  // Inspector Farah Iskandar: Khairul is suspended, so for once nobody is ringing Klang about me. I have a week. After that they will want you for twenty-four hours.
  '0do7583wm6b': { say: '[dry, a flicker of grim satisfaction] Khairul is suspended, so for once nobody is ringing Klang about me. [break] I have a week. [break] [serious] After that they will want you for twenty-four hours.' },
  // Inspector Farah Iskandar: And Azman rang me from his crane. He says the reefer that went aboard the Singapore feeder in the spring, RU-19, swung like an empty box. He has lifted ten thousand. He knows the swing.
  '2b66uswkhyd': { say: '[thoughtful, matter-of-fact] And Azman rang me from his crane. [break] He says the reefer that went aboard the Singapore feeder in the spring, R U nineteen, swung like an empty box. [break] He has lifted ten thousand. [break] He knows the swing.' },
  // Narrator: Penolong Penguasa Bomba Rosli drives down from Kuala Lumpur without being asked, still in yesterday's uniform.
  '1bd2rporg35': { cue: '[warm, respectful, tired]' },
  // Fire Officer Rosli: I know whose watch that is. Tuan Ismail Bakar. Thirty-seven years in Bomba. He taught me to read a floor.
  '0gibxxqp1n2': { say: '[hoarse, grief held down hard] I know whose watch that is. [break] Tuan Ismail Bakar. [break] Thirty-seven years in Bomba. [long-break] [voice catching] He taught me to read a floor.', speed: 0.9 },
  // Fire Officer Rosli: In 2021 he wrote this bay up as an electrical fault. He was the best fire investigator in Selangor. The best do not get that wrong by accident.
  '0esw796g96l': { say: '[low, troubled, loyal and angry] In twenty twenty-one he wrote this bay up as an electrical fault. [break] He was the best fire investigator in Selangor. [break] [hard] The best do not get that wrong by accident.', speed: 0.93 },
  // Fire Officer Rosli: When the coroner gave your boy in Cheras his real name back, Tuan Ismail stopped coming to the station on Fridays. He said he could not pray in a row with honest men.
  '25784giqtnx': { say: '[quiet, pained] When the coroner gave your boy in Cheras his real name back, Tuan Ismail stopped coming to the station on Fridays. [break] [softer] He said he could not pray in a row with honest men.', speed: 0.9 },
  // Fire Officer Rosli: He retired in 2023 and never set foot in the station again. Not once. Not even for the Hari Raya open house.
  '2f1sbhd0d4i': { say: '[puzzled, sad] He retired in twenty twenty-three and never set foot in the station again. [break] Not once. [break] Not even for the Hari Raya open house.', speed: 0.92 },
  // ---------------- case06:ending ----------------
  // Narrator: Bomba amend two reports in one week. Bay 3, 2026: deliberate. Bay 3, 2021: deliberate, in Ismail Bakar's own words from his carbon copy, countersigned by Rosli.
  '1497aydkj8q': { say: '[measured, grave, quietly vindicated] Bomba amend two reports in one week. [break] Bay three, twenty twenty-six: deliberate. [break] Bay three, twenty twenty-one: deliberate, [break] in Ismail Bakar\'s own words from his carbon copy, countersigned by Rosli.', speed: 0.93 },
  // Puan Rohana: They say it is finished. Ismail always said a fire is never finished until you have found where it started.
  '2dln225u85i': { say: '[weary, numb, gentle] They say it is finished. [break] Ismail always said a fire is never finished until you have found where it started.', speed: 0.9 },
  // Narrator: Kamal Ariffin is moved to Sinar Cold Chain's depot at Bloemendhal, Colombo, as fire safety officer. Herath sends you a photograph of him at the depot gate, with no message.
  '0kprg4kqpks': { say: '[flat, bitter] Kamal Ariffin is moved to Sinar Cold Chain\'s depot at Bloemendhal, Colombo, as fire safety officer. [break] [quiet] Herath sends you a photograph of him at the depot gate, with no message.' },
  // Narrator: Jeffrey Ho takes early retirement after thirty-nine years. On his last day a black car with no plates waits for him at the Warehouse 6 gate, and the guards stand up.
  '0yt7esge2at': { say: '[dry, uneasy] Jeffrey Ho takes early retirement after thirty-nine years. [break] [low, ominous] On his last day a black car with no plates waits for him at the Warehouse six gate, and the guards stand up.' },
  // Narrator: Klang Selatan close the file on a diesel thief with a grudge. Ah Fook's mother stops selling kuih at Pandamaran market. People look at her too long.
  '234f3o06tx2': { say: '[flat, guilty] Klang Selatan close the file on a diesel thief with a grudge. [break] Ah Fook\'s mother stops selling kuih at Pandamaran market. [break] [quiet] People look at her too long.', speed: 0.92 },
  // Narrator: Ah Fook stands outside the cemetery gate with his bandaged hands in his pockets and will not come in.
  '1k14cx7vqtd': { cue: '[gentle, quiet]', speed: 0.93 },
  // Ah Fook: Go go lou baak… ngo laai m zyu keoi.  /  The old man… I could not pull him out.
  '1ukmyken59g': { say: '[choked, ashamed, barely audible] 嗰個老伯…… [break] 我拉唔住佢。', speed: 0.88 },
  // Narrator: Amirul stands at the back with the Bomba men, on bail, and his mother does not turn round.
  '15p61yujwyc': { cue: '[sad, quiet]', speed: 0.92 },
  // Narrator: Rizal Hamdan sends Farah Thursday's gate roster for Warehouse 6 without being asked. "Let the old man in. Turn the son away. Instruction of FSO."
  '2g7y8qwvjhc': { say: '[dry, slightly surprised] Rizal Hamdan sends Farah Thursday\'s gate roster for Warehouse six without being asked. [break] [reading, cold] Let the old man in. Turn the son away. Instruction of F S O.' },
  // Narrator: A wreath arrives from the Office of the Chairman with no name on the card. The envelope is addressed in Vivian Chua's hand, posted in Singapore.
  '1x5xe1ol1sg': { say: '[cold, quiet] A wreath arrives from the Office of the Chairman with no name on the card. [break] The envelope is addressed in Vivian Chua\'s hand, posted in Singapore.' },
  // Narrator: A wreath arrives from the Office of the Chairman with no name on the card. The florist's invoice is signed Melissa Ong.
  '068ehs2u99u': { say: '[cold, quiet] A wreath arrives from the Office of the Chairman with no name on the card. [break] The florist\'s invoice is signed Melissa Ong.' },
  // Narrator: At Westport, Zulkifli Hamid signs the Singapore feeder out at six and does not look at the reefer stack once.
  '23o2wa9mzyd': { cue: '[low, bitter]' },
  // Narrator: Farah's team boards the Singapore feeder at Westport at five. The only Sinar reefer on it is empty, plugged in, and colder than anything in Port Klang.
  '1fyqz24eosu': { say: '[flat, deflated] Farah\'s team boards the Singapore feeder at Westport at five. [break] The only Sinar reefer on it is empty, plugged in, [break] [wry, bitter] and colder than anything in Port Klang.' },
  // Narrator: By the time anybody thinks of the old Sinar yard under Bukit Jugra it is evening. The gate with the pink sun is open. Tyre tracks in red mud, a diesel stain on the concrete, and nothing else.
  '28ztm3iohup': { say: '[slow, heavy, regretful] By the time anybody thinks of the old Sinar yard under Bukit Jugra it is evening. [break] The gate with the pink sun is open. [break] Tyre tracks in red mud, a diesel stain on the concrete, [break] and nothing else.', speed: 0.9 },
  // Narrator: Somewhere a prime mover is pulling the Chairman's memory down a road that is not on any map of his.
  '2dim659vscp': { cue: '[quiet, ominous]', speed: 0.92 },
  // Narrator: At Westport, a permit for one reefer unit, Port Klang to Colombo, was stamped at noon. Officer: N. SALLEH.
  '10ys2qoci0g': { say: '[dry, pointed] At Westport, a permit for one reefer unit, Port Klang to Colombo, was stamped at noon. [break] Officer: N. Salleh.' },
  // Narrator: Farah drives you there with a scarf over your eyes for the last ten minutes, and apologises for it twice.
  '1nbmjo1ru0z': { cue: '[warm, faintly amused]' },
  // Narrator: Daniel holds Ismail's photograph under the kitchen bulb for a long time, the way he used to hold a receipt he did not believe.
  '17qbxpz8he6': { cue: '[quiet, tender, remembering]', speed: 0.92 },
  // Daniel Raj: Table seven. August 2016, the week we opened. An old man in a white shirt sat behind us for an hour, paid for our teh, and left before we could thank him.
  '0ykzlk8r40i': { say: '[slow, dawning, uneasy] Table seven. [break] August twenty sixteen, the week we opened. [break] An old man in a white shirt sat behind us for an hour, paid for our teh, [break] and left before we could thank him.', speed: 0.9 },
  // Daniel Raj: I said, machan, rich uncles like detectives. You laughed. I bought the lighters the next day.
  '0oc4oqycsq4': { say: '[rueful, a hollow half-laugh] I said, machan, rich uncles like detectives. [break] You laughed. [break] [quiet] I bought the lighters the next day.', speed: 0.92 },
  // Daniel Raj: He has been sitting behind us for ten years.
  '0mtbbym3xds': { say: '[long-break][very quiet, cold realisation] He has been sitting behind us for ten years.', speed: 0.86 },
  // Narrator: Through the glass Daniel looks thinner, and calmer than you. You press Ismail's photograph flat against your side of the partition.
  '2fl4wsp38rm': { cue: '[quiet, aching]', speed: 0.92 },
  // Daniel Raj: Get me out of here, machan. Not for me. He knows exactly which block I am in.
  '0iouzn6yfxy': { say: '[low, urgent, steady] Get me out of here, machan. [break] Not for me. [break] [cold] He knows exactly which block I am in.', speed: 0.92 },
  // Narrator: Superintendent Khairul's signature is still on the remand order. Nobody has thought to take it off.
  '00ecw5v1rjk': { cue: '[dry, bitter]' },
  // Narrator: Wherever RU-07 went, it went with everything that was in it.
  '1u4k23cafq4': { say: '[low, heavy, grieving] Wherever R U oh seven went, [break] it went with everything that was in it.', speed: 0.88 },
  // Narrator: At midnight something slides under your office door: a paper kancil folded from an orange cargo tag. RU-07. Set point, eighteen degrees.
  '0189jgfms8j': { say: '[hushed, tense] At midnight something slides under your office door: [break] a paper kancil folded from an orange cargo tag. [break] R U oh seven. [break] Set point, eighteen degrees.', speed: 0.9 },
  // Narrator: Nobody else alive folds a kancil that way. He is alive. He is still theirs. They wanted you to know both.
  '00898x3qxwf': { say: '[relief and dread together, quiet] Nobody else alive folds a kancil that way. [break] He is alive. [break] He is still theirs. [long-break] [cold] They wanted you to know both.', speed: 0.88 },
  // Narrator: Upstairs, the grey folder is where you locked it. Under Rashid Osman, in fresh blue ink, somebody has typed one more name and struck it through by hand: I. Bakar.
  '1w6p1rx37vf': { say: '[hushed, cold dread] Upstairs, the grey folder is where you locked it. [break] Under Rashid Osman, in fresh blue ink, somebody has typed one more name and struck it through by hand: [break] I. Bakar.', speed: 0.9 },
  // Narrator: At ten past two the old telephone on the wall by the till rings: the line with the paper tag in Port Klang.
  '01dw2kjeolb': { cue: '[low, tense, very quiet]', speed: 0.92 },
  // Narrator: Farah's team opens the Sinar reefer at North Port, Gate 2. It is full of frozen prawns for Colombo, and its paperwork is perfect.
  '16a80sttr1l': { say: '[flat, deflated, dry] Farah\'s team opens the Sinar reefer at North Port, Gate two. [break] It is full of frozen prawns for Colombo, [break] and its paperwork is perfect.' },
  // Narrator: Farah goes in at first light with two cars and Rosli's fire tender, because a fire tender carries bolt cutters and nobody asks it for a warrant.
  '0azo8vx7fgp': { say: '[tense, low, with a grim smile] Farah goes in at first light with two cars and Rosli\'s fire tender, [break] because a fire tender carries bolt cutters and nobody asks it for a warrant.' },
  // Narrator: Under the palms below the Bukit Jugra lighthouse, behind a gate with a sun painted on it so long ago that it has gone pink: RU-07, its generator coughing on the last of two hundred litres.
  '25cgx1bpdug': { say: '[hushed, breathless] Under the palms below the Bukit Jugra lighthouse, behind a gate with a sun painted on it so long ago that it has gone pink: [break] R U oh seven, [break] its generator coughing on the last of two hundred litres.', speed: 0.92 },
  // Narrator: Inside, one hundred and eleven cartons. The archive of Level 14: every official Sinar has bought since 1986, a file to each, in alphabetical order. The police drawer from A to J.
  '2b7ah9grufo': { say: '[low, awed, grim] Inside, one hundred and eleven cartons. [break] The archive of Level fourteen: every official Sinar has bought since nineteen eighty-six, a file to each, in alphabetical order. [break] The police drawer from A to J.', speed: 0.92 },
  // Narrator: There is no photograph of the Chairman anywhere in his memory.
  '12hr7armx05': { say: '[long-break][quiet, unsettled] There is no photograph of the Chairman anywhere in his memory.', speed: 0.88 },
  // Narrator: The prime mover is parked behind the depot office with its plates off. In the cab, a Sri Lankan seaman's pass: Kasun Ranaweera.
  '0hwkartaei4': { say: '[businesslike, pointed] The prime mover is parked behind the depot office with its plates off. [break] In the cab, a Sri Lankan seaman\'s pass: [break] Kasun Ranaweera.' },
  // Narrator: Taped inside RU-07's door, an export permit for Monday night, Port Klang to Colombo. Officer: N. SALLEH.
  '22ag31fmkdp': { say: '[dry, pointed] Taped inside R U oh seven\'s door, an export permit for Monday night, Port Klang to Colombo. [break] Officer: N. Salleh.' },
  // Narrator: At the back of RU-07, behind the last pallet of cartons, Farah's torch found a man sitting on the floor with his knees up and a carton of water, blinking. Three days in the dark at eighteen degrees, with the Chairman's memory for company.
  '07kp0h5wkfh': { say: '[soft, overwhelmed, holding it together] At the back of R U oh seven, behind the last pallet of cartons, Farah\'s torch found a man sitting on the floor with his knees up and a carton of water, blinking. [break] Three days in the dark at eighteen degrees, [break] with the Chairman\'s memory for company.', speed: 0.9 },
  // Daniel Raj: You are late again, machan. I am still not complaining.
  '2b1op4d7jda': { say: '[weak, hoarse, a tired smile] You are late again, machan. [break] I am still not complaining.', speed: 0.88 },
  // Daniel Raj: He came to the cold room once, on the first night. He did not come in. He stood in the doorway and smoked, and asked me if I still had my lighter.
  '0ej06hpd2cn': { say: '[quiet, haunted] He came to the cold room once, on the first night. [break] He did not come in. [break] He stood in the doorway and smoked, [break] [cold] and asked me if I still had my lighter.', speed: 0.88 },
  // Narrator: You put Farah's evidence bag on the blanket, with the twin from Kampung Baru inside it. She pretends not to see him take it out.
  '29rqm2w9f4l': { cue: '[warm, quiet, a small kindness]', speed: 0.93 },
  // Narrator: The warrant from Menara Sinar is still open. Farah lays her own jacket over his wrists so that nobody photographs the cuffs.
  '09n3fa91nxv': { cue: '[quiet, rueful, tender]', speed: 0.92 },
  // Narrator: The marine police stop Ah Seng's ice barge off Pulau Ketam at one in the morning. It is carrying ice, and Ah Seng, and a great deal of language.
  '0hc5c7rn3fk': { say: '[dry, deflated, a trace of dark humour] The marine police stop Ah Seng\'s ice barge off Pulau Ketam at one in the morning. [break] It is carrying ice, and Ah Seng, [break] and a great deal of language.' },
  // Narrator: Tan Kok Fook is charged with murder in the Klang sessions court with both hands still in bandages. His mother brings him a flask of herbal tea and is not allowed to give it to him.
  '1ld6zjft4ux': { say: '[clipped, formal, then sad] Tan Kok Fook is charged with murder in the Klang sessions court with both hands still in bandages. [break] [quiet] His mother brings him a flask of herbal tea and is not allowed to give it to him.' },
  // Puan Rohana: They say it was a diesel thief with a grudge. Ismail put out fires for thirty-seven years. He would have laughed at that, a little.
  '1j0m2puddje': { say: '[tired, faintly wry, grieving] They say it was a diesel thief with a grudge. [break] Ismail put out fires for thirty-seven years. [break] [soft] He would have laughed at that, a little.', speed: 0.9 },
  // Narrator: Kamal Ariffin is arrested at the Warehouse 6 guardhouse in his reflective vest. He asks Rosli, who has come to watch, whether they are going to take his old Bomba boots as well. Rosli says yes.
  '0vb5z52oz23': { say: '[clipped, formal] Kamal Ariffin is arrested at the Warehouse six guardhouse in his reflective vest. [break] He asks Rosli, who has come to watch, whether they are going to take his old Bomba boots as well. [break] [quiet, hard] Rosli says yes.' },
  // Narrator: Amirul Ismail is arrested at his office in Bukit Tinggi in front of the show-flat brochures. His mother does not come to the station. She is at the mortuary, waiting to take his father home.
  '0ikg4grmoyr': { say: '[clipped, then heavy] Amirul Ismail is arrested at his office in Bukit Tinggi in front of the show-flat brochures. [break] His mother does not come to the station. [break] [quiet, sad] She is at the mortuary, waiting to take his father home.', speed: 0.93 },
  // Puan Rohana: My husband is in the ground and my son is in a cell. Tell me which one of them I should pray for first.
  '15sqexjg8ao': { say: '[broken, accusing, very quiet] My husband is in the ground and my son is in a cell. [break] [voice cracking] Tell me which one of them I should pray for first.', speed: 0.88 },
  // Narrator: Jeffrey Ho is arrested at his house in Klang at five in the morning, in a pressed shirt, with a packed bag by the door. He has been ready for thirty-nine years.
  '1ii480916px': { say: '[clipped, formal] Jeffrey Ho is arrested at his house in Klang at five in the morning, in a pressed shirt, with a packed bag by the door. [break] [quiet, uneasy] He has been ready for thirty-nine years.' },
  // Puan Rohana: He went there to give back what he took. You made them write that down. That is all I wanted on his stone.
  '0klip05bj7b': { say: '[tearful, steadying, grateful] He went there to give back what he took. [break] You made them write that down. [break] [soft] That is all I wanted on his stone.', speed: 0.88 },
  // Narrator: After closing you tell Bala Anne about the tape, because there is nobody else awake to tell.
  '1skve32ezi4': { cue: '[quiet, late night, weary]', speed: 0.93 },
  // Narrator: He listens with the old photograph of his father's stall in his hands, the one that has hung over the till since 1979, and does not put it back on its nail.
  '06jwm17r1yr': { say: '[slow, tender, watchful] He listens with the old photograph of his father\'s stall in his hands, the one that has hung over the till since nineteen seventy-nine, [break] and does not put it back on its nail.', speed: 0.9 },
  // Bala Anne: My father used to say, in this town every fire has an owner. Do not look for the match, thambi. Look for the owner.
  '1slkeoi5ouq': { say: '[low, grave, fatherly] My father used to say, in this town every fire has an owner. [break] Do not look for the match, thambi. [break] [firm] Look for the owner.', speed: 0.9 },
  // Bala Anne: Saapittiya, thambi?  /  Have you eaten, boy?
  '25pu6e9snvw': { say: '[long-break][gentle, gruff, changing the subject out of love] சாப்பிட்டியா, தம்பி?', speed: 0.9 },
  // Narrator: Five years you called it a dream. Now it is on a tape in Farah's locker: a calm voice at the edge of a fire, saying both of them.
  '0ejwqtl9vmn': { say: '[quiet, cold, certain] Five years you called it a dream. [break] Now it is on a tape in Farah\'s locker: [break] a calm voice at the edge of a fire, saying both of them.', speed: 0.88 },
  // Narrator: Bala Anne answers it in his singlet, listens, and puts the receiver down on the counter in front of you. Then he steps back into the dark, as if the voice on it could see him.
  '0lybg386x4f': { say: '[hushed, tense, slow] Bala Anne answers it in his singlet, listens, and puts the receiver down on the counter in front of you. [break] Then he steps back into the dark, [break] as if the voice on it could see him.', speed: 0.9 },
  // A voice: Good evening, detective. Five years ago I let you go into the fire. This year I let you come out of it. Keep the lighter.
  '1aseo6etuct': { say: '[calm, unhurried, warm and courteous, utterly cold underneath] Good evening, detective. [break] Five years ago I let you go into the fire. [break] This year I let you come out of it. [long-break] [softly] Keep the lighter.', speed: 0.86 },
  // Narrator: You know the voice. You have known it every night for five years. Before you can say anything, you hear a silver lid flick open, and shut, and open. Then the dialling tone.
  '06e3hih6p5o': { say: '[whispering, shaken] You know the voice. [break] You have known it every night for five years. [break] Before you can say anything, you hear a silver lid flick open, [break] and shut, [break] and open. [long-break] [flat] Then the dialling tone.', speed: 0.85 },

  // ---------------- case07 ----------------
  // Narrator: The courier will not come in out of the rain. He hands Bala Anne a black envelope across the counter, a small brass sun pressed into its flap, and waits to watch it opened.
  '1jh2fr0tp58': { cue: '[low, weary, intimate][rain outside]', speed: 0.94 },
  // Narrator: Sinar Holdings Berhad, forty years. Saturday, 14 November, Level 15, Menara Sinar. The Chairman will address his guests. Table 6. For two.
  '2cuhi62erk6': { say: '[reading aloud, flat, faintly ironic] Sinar Holdings Berhad, forty years. [break] Saturday, fourteen November, Level fifteen, Menara Sinar. [break] The Chairman will address his guests. [long-break] [quiet] Table six. [break] For two.', speed: 0.92 },
  // Bala Anne: Thambi. Poga vendaam.  /  Boy. Don't go.
  '2d2llrm4s5b': { say: '[gruff, worried, almost pleading] தம்பி. [break] போக வேண்டாம்.', speed: 0.9 },
  // Bala Anne: Table six. That is my table. Now he is taking my tables also.
  '12mqx2rqunm': { cue: '[grumbling, wounded pride, half joking]', speed: 0.95 },
  // Narrator: On the television over the counter, Dr. Shanti Menon's appeal has been put off again, to next year. Bala Anne does not even look up.
  '1opb8s2w0f7': { cue: '[quiet, tired, matter of fact]', speed: 0.94 },
  // Bala Anne: That durian man Ravi says if you go to the big party, bring him back a piece of cake. I told him come and eat here like a human being.
  '1sd10pop503': { cue: '[exasperated, affectionate, dry humour]' },
  // Narrator: Pinned by the till, a postcard from Pandamaran with no message, only a drawing of two hands in bandages. Ah Fook's trial is in January.
  '0hwdn0nhrv8': { cue: '[quiet, uneasy, guilty]', speed: 0.92 },
  // Narrator: Pinned by the till, three lines from Puan Rohana in Klang: Amirul is out on bail. He sleeps in his old room and does not speak.
  '19e5b34ol02': { cue: '[quiet, heavy, sad]', speed: 0.92 },
  // Narrator: Tonight Menara Sinar is lit amber from the pavement to the brass sun on its crown, all but one storey, a third of the way up, that stays black.
  '2f9tll9zk7d': { cue: '[slow, ominous, watchful]', speed: 0.92 },
  // Narrator: In the drop-off lane, a grey sedan with its engine running. WXY 1408. The driver wears a white shirt and does not look at you, which is how you know he has been looking.
  '09qs4dinu6z': { say: '[low, tense] In the drop-off lane, a grey sedan with its engine running. [break] WXY one four zero eight. [break] The driver wears a white shirt and does not look at you, [break] [cold] which is how you know he has been looking.', speed: 0.93 },
  // Inspector Farah Iskandar: Table six, for two. He knew I would come. Officially I am here for the deputy minister. Unofficially I am your plus one, and I am not dancing.
  '13p789g9s1z': { say: '[dry, clipped, guarded] Table six, for two. He knew I would come. [break] Officially I am here for the deputy minister. [break] [deadpan] Unofficially I am your plus one, and I am not dancing.' },
  // Inspector Farah Iskandar: My superintendent is at table two with the deputy minister. Khairul has a new watch. I have not asked him where from.
  '2gbkzc3llbv': { cue: '[low, contemptuous, sidelong]' },
  // Inspector Farah Iskandar: Khairul is suspended, and he is still invited. Table thirty, by the kitchen door. Sinar never forgets a friend.
  '2bpckmeuyut': { cue: '[bitter, sardonic]' },
  // Inspector Farah Iskandar: Ninety officers at Bukit Aman are still reading the cartons from Jugra. Half the names on tonight's guest list are in them.
  '1ukmipsdnw0': { cue: '[quiet, grim satisfaction]' },
  // Inspector Farah Iskandar: Every name on tonight's guest list was in a carton I never got to open. They will all shake my hand.
  '25dile91u10': { cue: '[quiet, bitter, resigned]', speed: 0.97 },
  // Inspector Farah Iskandar: Daniel is in a house I have not told you about, with two of my men and the television on. He asked me to tell you one thing. Do not drink anything you did not order.
  '0gyn9j5b8ua': { say: '[low, careful, protective] Daniel is in a house I have not told you about, with two of my men and the television on. [break] He asked me to tell you one thing. [break] [serious] Do not drink anything you did not order.', speed: 0.97 },
  // Inspector Farah Iskandar: Daniel is in Sungai Buloh, Block C, with the radio on. His lawyer says February. He asked me to tell you one thing. Do not drink anything you did not order.
  '229mt0bua3l': { say: '[low, tired, careful] Daniel is in Sungai Buloh, Block C, with the radio on. His lawyer says February. [break] He asked me to tell you one thing. [break] [serious] Do not drink anything you did not order.', speed: 0.97 },
  // Narrator: Nobody has seen Daniel since August. Every few weeks a paper kancil comes under your office door, folded from something of theirs. You keep them in the drawer, and Farah does not ask.
  '1ewb27zqsoe': { cue: '[soft, aching, controlled]', speed: 0.9 },
  // Narrator: At the lift doors, a man in a dinner jacket with an earpiece and a policeman's stillness: Zulkifli Hamid, up from Westport for the night. As Farah passes him he says, very quietly, "Left shoulder, Inspector."
  '107w3adn3gk': { say: '[low, tense, watchful] At the lift doors, a man in a dinner jacket with an earpiece and a policeman\'s stillness: [break] Zulkifli Hamid, up from Westport for the night. [break] As Farah passes him he says, very quietly, [whispering] "Left shoulder, Inspector."', speed: 0.93 },
  // Narrator: Level 15 has been emptied of its directors for one night and turned into a ballroom: three hundred guests at round tables, a band playing P. Ramlee, and at the far end, a screen.
  '0jsrcboye1w': { cue: '[measured, a trace of wonder, wary]', speed: 0.94 },
  // Narrator: Twelve panels of white silk, five metres high, with Sinar's sun painted across them in gold. Behind it the light is off. Everybody looks at it anyway.
  '29oh7g0f8nc': { cue: '[hushed, uneasy, slow]', speed: 0.92 },
  // Narrator: Under your feet is the floor that is not there. Rosli stands at the fire exit in his dress uniform, because Bomba sealed Level 14 after Dato' Rashid fell, and somebody has to stand on top of the seal.
  '07ewpklq16g': { cue: '[low, dry, uneasy]', speed: 0.93 },
  // Narrator: At the door the Office of the Chairman's new secretary greets every guest by name. Melissa Ong. She greets you by yours, and does not offer her hand.
  '2333wh77ttv': { cue: '[cool, wary, quiet]', speed: 0.94 },
  // Narrator: On every table, a card from the Office of the Chairman in a secretary's copperplate. Vivian Chua writes them from Singapore now, Farah says, and they come up by courier.
  '18419s81kyc': { cue: '[quiet, wary, faintly bitter]', speed: 0.94 },
  // Narrator: In the press pen, behind a velvet rope, a young woman with a camera she has been told not to raise: Nurul Ain, whose father fell from the floor below.
  '0rbndan9atb': { cue: '[soft, sad, protective]', speed: 0.93 },
  // Narrator: An old man in a white shirt, with a staff badge that has no name on it, sets a glass of teh tarik in front of you. Nobody at table six ordered it. It is made exactly the way Bala Anne makes it.
  '1evlgfqf45w': { cue: '[quiet, puzzled, warm turning uneasy]', speed: 0.93 },
  // Muthu: Thambi. Vilakku anainjadhum, thiraikku pinnaadi paaru.  /  Boy. When the lights go out, look behind the screen.
  '1fh7eajft3t': { say: '[very soft, an old man\'s whisper, urgent and kind] தம்பி. [break] விளக்கு அணைஞ்சதும், [break] திரைக்குப் பின்னாடி பாரு.', speed: 0.85 },
  // Muthu: Bala-kitta sollu, Muthu vandhaan-nu.  /  Tell Bala that Muthu came.
  '011vwjwxeza': { say: '[gentle, tired, a small sad smile] பாலா கிட்ட சொல்லு, [break] முத்து வந்தான்னு.', speed: 0.86 },
  // Narrator: Then he is gone through a service door beside the screen, hands behind his back, like a man who has walked through it all his life.
  '1mte2157sqy': { cue: '[quiet, watchful]', speed: 0.93 },
  // Tan Sri Azhar: Ladies and gentlemen. For the fortieth time: the man who made Sinar.
  '1c4wx78mwhs': { say: '[polished, grand, a practised master of ceremonies] Ladies and gentlemen. [break] [reverent] For the fortieth time: [break] the man who made Sinar.', speed: 0.95 },
  // Narrator: The room goes dark, and the screen lights from behind. On the silk, the shadow of a man in a high-backed chair, a cigarette in his hand.
  '1nddubix2wx': { cue: '[hushed, slow, ominous]', speed: 0.9 },
  // The Chairman: Forty years ago I had one lorry, a yard in the oil palm under Bukit Jugra, and a sun painted on the gate. I have the gate still.
  '2adf70r1syw': { say: '[calm, unhurried, warm and courteous, utterly cold underneath] Forty years ago I had one lorry, [break] a yard in the oil palm under Bukit Jugra, [break] and a sun painted on the gate. [long-break] [softly] I have the gate still.', speed: 0.86 },
  // The Chairman: And at table six, a detective I have watched for ten years. Good evening, detective. You came. I knew you would be listening.
  '1rvys934ki4': { say: '[calm, intimate, amused, speaking to one person in a crowded room] And at table six, a detective I have watched for ten years. [break] Good evening, detective. [break] You came. [long-break] [softly] I knew you would be listening.', speed: 0.86 },
  // Narrator: Three hundred people turn to look at you. On the silk the shadow lifts a lighter, and the flame comes up a beat after the snap, as if the hand were waiting to hear it.
  '0i2wsoeynay': { cue: '[tense, low, noticing something wrong]', speed: 0.92 },
  // The Chairman: Empat puluh tahun. Empat puluh saat.  /  Forty years. Forty seconds.
  '06zooufhvmp': { say: '[slow, ceremonial, quiet finality] Empat puluh tahun. [long-break] Empat puluh saat.', speed: 0.84 },
  // Narrator: Every light on Level 15 goes out at once: forty seconds of dark, one for each year. Three hundred people hold their breath, because that is what they were told to do.
  '0r90bqqg58o': { cue: '[hushed, tense, breath held]', speed: 0.9 },
  // Narrator: You are already walking, the way the old man asked, between the tables, toward the edge of the screen.
  '25riblnit60': { cue: '[low, urgent, quiet]', speed: 0.95 },
  // Narrator: Two metres from the silk you hear a chair creak, and a sound like somebody breathing through a straw. Then a hand closes on your arm.
  '2day707jhy6': { say: '[whispering, frightened] Two metres from the silk you hear a chair creak, [break] and a sound like somebody breathing through a straw. [long-break] [sharp] Then a hand closes on your arm.', speed: 0.88 },
  // Bishnu Thapa: Sorry, boss. Nobody goes behind the screen. Nobody.
  '1bnk3z3ujex': { cue: '[urgent whisper, frightened, apologetic, Nepali-accented]' },
  // Narrator: The lights come up. The screen is white and empty. Three hundred people applaud. You go back to table six, and your teh has gone cold.
  '2g8rwndkvru': { cue: '[flat, deflated, uneasy]', speed: 0.93 },
  // Narrator: At fourteen minutes past ten Tan Sri Azhar Kamaruddin goes behind the screen, as he has every year since 1997, to thank an empty chair.
  '0o05kupzadi': { cue: '[measured, slow, ominous]', speed: 0.93 },
  // Tan Sri Azhar: Tuan dah tak ada.  /  The Chairman is gone.
  '0qu7d967bpw': { cue: '[shocked, shaking, almost a sob]', speed: 0.88 },
  // Narrator: Three hundred telephones say it before he has finished: the Chairman of Sinar Holdings is dead.
  '0med27l7cma': { cue: '[fast, rising, chaotic]' },
  // Inspector Farah Iskandar: Lifts off. Stairs shut. Nobody leaves this floor until I say so, Tan Sri. Not even you.
  '2evivs3ykrh': { cue: '[commanding, sharp, steel in it]', speed: 1.05 },
  // Narrator: In the high-backed chair behind the silk, his head fallen to one side and a cigarette burnt down to the filter between his fingers, sits the old man who brought you your teh.
  '2gazget7udz': { cue: '[quiet, cold, grieving]', speed: 0.88 },
  // Inspector Farah Iskandar: Three hundred people watched this man give a speech. He has no microphone. He has no earpiece. He has a staff badge with no name on it.
  '04c8xesjo1l': { cue: '[low, hard, thinking aloud]', speed: 0.97 },
  // Inspector Farah Iskandar: Whoever was talking to us tonight, it was not him.
  '15spcc4x0ux': { cue: '[quiet, certain, chilled]', speed: 0.92 },
  // Narrator: His wallet says Muthusamy a/l Perumal, seventy-one, Jalan Thambapillay, Brickfields. Two streets from your office.
  '23wt13hm72z': { cue: '[quiet, heavy, close to home]', speed: 0.9 },
  // Narrator: At two minutes past eleven Sinar Holdings tells the press that the Chairman is well, and thanks his guests for a memorable evening.
  '000mxoc4tr3': { cue: '[dry, cold, bitter irony]', speed: 0.92 },

  // ---------------- case07:ending ----------------
  // Narrator: Hamidah Yusof reads the file twice and writes no charge against the man at the desk. "Bring me the man at the desk," she says, "and I will bring you the man on the telephone."
  '111ytbozlfs': { cue: '[flat, disappointed, quiet]', speed: 0.94 },
  // Narrator: She reads "behind the screen", and crosses it out. "The man behind the screen is in the mortuary, detective."
  '0nhp0gi2atj': { cue: '[dry, weary, cutting]', speed: 0.95 },
  // Narrator: Under "and abetment by", the line stays blank, as it has stayed blank for three cases.
  '0kj0fqw6xqf': { cue: '[quiet, bleak, final]', speed: 0.9 },
  // Narrator: At Subang, customs clears a Sinar jet to Seletar at 7:15 on Sunday morning. One passenger, name withheld. Officer: N. SALLEH.
  '1qrhbzk0u10': { cue: '[clipped, cold, knowing]', speed: 0.95 },
  // Narrator: Farah's constable at Chow Kit saw the driver of the black car for two seconds: an older Chinese man in a white shirt, with a jade bangle on his wrist.
  '1fpsy15m6g0': { cue: '[low, tense, recognition]', speed: 0.93 },
  // Narrator: Farah's constable at Chow Kit saw the driver of the black car for two seconds: a Sri Lankan face, and four old scratches on his forearm.
  '1jc7t1xfkip': { cue: '[low, tense, recognition]', speed: 0.93 },
  // Narrator: Rizal Hamdan resigns from Kawalan Sentosa on Monday by text message, and his telephone is switched off by lunchtime.
  '20iarmf76qb': { cue: '[dry, contemptuous]', speed: 0.95 },
  // Narrator: Workmen take the screen down panel by panel and roll the silk round cardboard tubes. The high-backed chair stays where it is, because nobody has been told what to do with it.
  '1qow0j9diei': { cue: '[quiet, melancholy, slow]', speed: 0.92 },
  // Narrator: Sinar Holdings tells Bursa Malaysia that its Chairman is in good health and will not be taking questions. The share price closes up four sen.
  '1zuzebimb1x': { cue: '[dry, bitter irony]', speed: 0.95 },
  // Narrator: Tan Sri Azhar's office on Level 15 is empty by noon. His succession memo is on the board's agenda on Thursday, under somebody else's initials.
  '03lw9dvg4s0': { cue: '[clipped, wry]', speed: 0.95 },
  // Narrator: Tan Sri Azhar Kamaruddin chairs Monday's board meeting from the chair at the head of the table. It is noticed that he does not lean back in it.
  '1zfqd5oauuo': { cue: '[quiet, wry, uneasy]', speed: 0.94 },
  // Narrator: Dr. Meera Rajaratnam hands Farah the file marked TUAN herself, and closes her clinic for a week. She says she will never again examine a patient whose name she does not know.
  '0qfzluj4ggl': { cue: '[quiet, sober, a little hopeful]', speed: 0.93 },
  // Narrator: The Malaysian Medical Council suspends Dr. Meera Rajaratnam. Her patients receive a letter. The old man with the bad heart keeps taking his tablets.
  '1vwl67svoc2': { cue: '[flat, then gently sad]', speed: 0.93 },
  // Narrator: Desmond Yap goes back to work on Monday. On Wednesday morning the attendants find his car in Bay V1 on Basement 2 with the engine running and a hose from the exhaust. Dang Wangi call it a suicide. His headset is round his neck.
  '1011kvlmn6l': { say: '[flat, cold] Desmond Yap goes back to work on Monday. [break] On Wednesday morning the attendants find his car in Bay V one on Basement two, with the engine running and a hose from the exhaust. [break] Dang Wangi call it a suicide. [long-break] [quiet] His headset is round his neck.', speed: 0.9 },
  // Narrator: Kamal Ariffin flies in from Colombo for the dinner and is seen at table twenty-eight in a borrowed suit. He flies back on Sunday before anybody thinks to ask him why.
  '225z0by42bz': { cue: '[dry, uneasy]', speed: 0.95 },
  // Narrator: You tell Daniel about the old man with the teh, and the chair, and the forty seconds, and the dockets in Bala Anne's shoebox.
  '0zvs1akunjd': { cue: '[quiet, late night, tired]', speed: 0.93 },
  // Daniel Raj: Table seven. August 2016. The old man in the white shirt who paid for our teh. That was Muthu?
  '2b3be3dr21c': { say: '[slow, stunned, remembering] Table seven. [break] August 2016. [break] The old man in the white shirt who paid for our teh. [long-break] [disbelieving] That was Muthu?', speed: 0.88 },
  // Daniel Raj: Ten years I have been sure of one thing, machan: that I had seen him once. I never saw him at all.
  '05ysbkew37e': { say: '[quiet, shaken, rueful] Ten years I have been sure of one thing, machan: [break] that I had seen him once. [long-break] [whispering] I never saw him at all.', speed: 0.86 },
  // Narrator: He folds a kancil out of the gala's menu card while he talks, and does not seem to know he is doing it.
  '24ef3tqzm3x': { cue: '[soft, tender, sad]', speed: 0.92 },
  // Narrator: Through the glass you tell Daniel about the old man with the teh, and the chair, and the forty seconds.
  '1ncmbghd1vf': { cue: '[quiet, heavy]', speed: 0.93 },
  // Daniel Raj: Then I have never seen him, machan. Not once. And he has seen me every day for ten years.
  '1nxz7uiodv9': { say: '[quiet, cold dawning fear] Then I have never seen him, machan. [break] Not once. [long-break] And he has seen me every day for ten years.', speed: 0.87 },
  // Narrator: His trial has been moved to March, on an application signed by a superintendent at Bukit Aman.
  '19irf3wz3rw': { cue: '[dry, bitter]', speed: 0.95 },
  // Narrator: Wherever the black car went after Chow Kit, it went with Daniel in the back of it.
  '1w2asyqtngw': { cue: '[quiet, aching]', speed: 0.9 },
  // Narrator: At midnight something slides under your office door: a kancil folded from a gala menu card, its gold border on the outside. Pricked along one fold with a pin: MASIH HIDUP. Still alive.
  '1bfqfiia387': { say: '[hushed, tense, then a breath of relief] At midnight something slides under your office door: [break] a kancil folded from a gala menu card, its gold border on the outside. [break] Pricked along one fold with a pin: [long-break] masih hidup. [break] [soft] Still alive.', speed: 0.88 },
  // Narrator: He has been in the same car as the man. He has sat beside him in the dark. Whether he has seen his face, the kancil does not say.
  '0qx3fn5ct9c': { cue: '[low, haunted]', speed: 0.88 },
  // Narrator: Ain lays her photograph on Mak Teh's table between two glasses of teh: an old man in a white shirt, lit from below, his mouth shut, while three hundred people heard him speak.
  '0ljedlnjryu': { cue: '[quiet, morning, tender]', speed: 0.93 },
  // Nurul Ain: You let the man at the desk walk out of that building. He was three metres from my lens with his hand on his headset, and his lips were moving.
  '25jqj0zmb1u': { cue: '[bitter, accusing, controlled]' },
  // Narrator: Muthu has no family left, so Bala Anne walks in front with the fire pot, barefoot, in a white veshti, the way a son would.
  '1cfv9o1okx7': { cue: '[slow, tender, grave]', speed: 0.9 },
  // Narrator: Two hundred men in white shirts stand in the heat. Drivers, mostly. Half of Brickfields knew him, and not one of them knew who he drove for.
  '1bu2ut5zmt2': { cue: '[quiet, heavy heat, reflective]', speed: 0.92 },
  // Bala Anne: Muthu nalla manushan.  /  Muthu was a good man.
  '0c64vkjer5s': { say: '[low, grieving, steady] முத்து [break] நல்ல மனுஷன்.', speed: 0.85 },
  // Narrator: Across the road in the Cheras cemetery, a headstone that said Daniel Raj for five years says Ong Wei Jie now.
  '1frj1jprhz0': { cue: '[quiet, bittersweet]', speed: 0.92 },
  // Narrator: You smell the cigarette before you feel the hand. It settles on your right shoulder, light, in a white cuff, the way a man rests his hand on an old friend.
  '02dkzitczd8': { say: '[whispering, very still, dread] You smell the cigarette before you feel the hand. [break] It settles on your right shoulder, light, in a white cuff, [break] the way a man rests his hand on an old friend.', speed: 0.86 },
  // The Chairman: Jangan tengok belakang, detektif.  /  Don't look back, detective.
  '0zf8k2enplc': { say: '[close to the ear, calm, almost tender, utterly cold underneath] Jangan tengok belakang, [break] detektif.', speed: 0.84 },
  // The Chairman: That is what your partner said to you in the fire. I was close enough to hear it.
  '1hkpbusjrv2': { say: '[close, quiet, courteous, amused] That is what your partner said to you in the fire. [break] [softly] I was close enough to hear it.', speed: 0.86 },
  // The Chairman: Muthu drove me for forty years and never once looked in the mirror. I need a new driver.
  '1uateshm825': { say: '[close, unhurried, warm and courteous, utterly cold underneath] Muthu drove me for forty years and never once looked in the mirror. [long-break] I need a new driver.', speed: 0.85 },
  // The Chairman: The first of December. Ten past two. Outside Restoran Bala. You may look in the mirror as often as you like.
  '1hzqkxrbny1': { say: '[quiet, precise, an invitation that is an order] The first of December. [break] Ten past two. [break] Outside Restoran Bala. [long-break] [softly, amused] You may look in the mirror as often as you like.', speed: 0.85 },
  // Narrator: A lid snaps open by your ear, and shut. The hand lifts. When you turn round there are two hundred men in white shirts, and one of them is walking away, and you will never know which.
  '18ljz2rwqvf': { say: '[whispering, shaken] A lid snaps open by your ear, [break] and shut. [break] The hand lifts. [long-break] When you turn round there are two hundred men in white shirts, [break] and one of them is walking away, [break] [flat] and you will never know which.', speed: 0.85 },
  // Narrator: In your jacket pocket, where his hand was, a car key on a ring with a small brass sun.
  '143do682873': { cue: '[very quiet, cold, final]', speed: 0.86 },
  // Narrator: Rosli breaks his own Bomba seal on Level 14 for a second look, and finds his own dust again. By noon Sinar's lawyers have the broken seal in a letter to DBKL.
  '0er11ml1fty': { cue: '[dry, rueful]', speed: 0.95 },
  // Narrator: Under it, "and abetment by", and for the first time in three cases she writes something after it: a person unknown, the user of prepaid line 011-2604 1986, in a vehicle without registration plates, in Bay V1, Basement 2, Menara Sinar, at 9:51 PM.
  '0fryg4wwztg': { say: '[slow, deliberate, quiet triumph held down] Under it, "and abetment by", and for the first time in three cases she writes something after it: [break] a person unknown, the user of prepaid line zero one one, two six zero four, one nine eight six, [break] in a vehicle without registration plates, in Bay V one, Basement two, Menara Sinar, [break] at nine fifty-one PM.', speed: 0.9 },
  // Inspector Farah Iskandar: It is not a name. It is a place, a time and a telephone. In this country men have gone to prison on less. Not men like him. Not yet.
  '0ly2vvct271': { say: '[low, hard, tired] It is not a name. [break] It is a place, a time and a telephone. [break] In this country men have gone to prison on less. [long-break] [quiet] Not men like him. [break] Not yet.', speed: 0.95 },
  // Narrator: Sinar's studio in Damansara hands over its recordings of every Chairman's speech, very politely. None of them has last night on it, and none of them says "sekarang".
  '1dabjzdf4bb': { cue: '[dry, weary irony]', speed: 0.95 },
  // Narrator: Nobody tells her where he was sitting.
  '0q0rjh6dxq6': { cue: '[flat, quiet]', speed: 0.93 },
  // Narrator: Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights in front of two photographers who were told exactly where to stand. By noon Sinar Holdings has a new Group Managing Director, and its share price has gone up.
  '1lxo4ghabm8': { cue: '[clipped, formal, sour irony]', speed: 0.97 },
  // Narrator: Dr. Meera Rajaratnam is arrested at her clinic on Jalan Kia Peng between two patients. She asks Farah to tell the second one, an old man with a bad heart, that she is sorry, and that he must keep taking his tablets.
  '1enlyy7de90': { cue: '[clipped, then gentle and sad]', speed: 0.94 },
  // Narrator: Desmond Yap is charged on Monday morning in the magistrates' court on Jalan Duta. He asks for his headset back, and when they say no, he holds one hand over his right ear for the whole hearing, as if somebody might still speak into it.
  '17ifz8pj6cb': { say: '[clipped, formal, then uneasy] Desmond Yap is charged on Monday morning in the magistrates\' court on Jalan Duta. [break] He asks for his headset back, and when they say no, [break] [quiet] he holds one hand over his right ear for the whole hearing, as if somebody might still speak into it.', speed: 0.93 },
  // Narrator: Hamidah Yusof writes the charge against Desmond Yap herself: Section 302, murder.
  '2gn6jo3pnq9': { cue: '[clipped, firm, satisfied]', speed: 0.95 },
  // Nurul Ain: The first photograph of the man behind the screen since 1997, and it is the wrong man. My editor wants it on the front page as the Chairman. I am going to put his real name under it. Muthusamy Perumal. Somebody should.
  '1i1npmzj8mn': { say: '[tired, fierce, grief steadied into purpose] The first photograph of the man behind the screen since 1997, [break] and it is the wrong man. [break] My editor wants it on the front page as the Chairman. [break] I am going to put his real name under it. [long-break] [firm] Muthusamy Perumal. [break] Somebody should.', speed: 0.93 },
  // Narrator: Nurul Ain is charged with murder in the same courthouse that heard her father's inquest. She has no camera. She asks the press on the steps to take her photograph, so that somebody does.
  '0t35gz6dtoa': { cue: '[clipped, then quiet and sad]', speed: 0.93 },
  // Narrator: Ain's photograph is in a Dang Wangi evidence bag. Mak Teh has a print of it pinned behind her counter, where the calendar used to be, and tells anybody who asks that it is her uncle.
  '28saf1tppjv': { cue: '[quiet, wry, tender]', speed: 0.93 },
  // Nurul Ain: You got the man at the desk. You also got somebody who was never behind that screen in the dark. Abah would have asked which one of those the Chairman wanted.
  '0k81yq81t1u': { cue: '[bitter, measured, grieving]', speed: 0.97 },

  // ---------------- case08 ----------------
  // Narrator: Bala Anne will not pull the shutter. He has wiped the same table four times, and he has not looked at the clock once, which is how you know he has been looking at it all night.
  '25pphat3rwd': { cue: '[low, weary, fond]', speed: 0.93 },
  // Bala Anne: Thambi. Andha car-la ēra vendaam.  /  Boy. Don't get into that car.
  '1j0r2h7l1t7': { say: '[low, grave, pleading] தம்பி. [break] அந்த கார்ல ஏற வேண்டாம்.', speed: 0.9 },
  // Narrator: Farah is at the counter in her jacket with her phone dead in her hand. It charges in the car, she says. She borrows Bala Anne's wall phone and rings her sergeant.
  '06itk5ng897': { cue: '[dry, observant]', speed: 0.95 },
  // Inspector Farah Iskandar: Asri. Three cars behind, in my Waja. If he turns, I turn.
  '00szusgpgj9': { say: '[brisk, low, all business] Asri. [break] Three cars behind, in my Waja. [break] If he turns, I turn.', speed: 0.98 },
  // Narrator: On the television over the counter, Dr. Shanti Menon's appeal is listed for March. Bala Anne turns the sound down and leaves the picture on.
  '236sndo7e9a': { cue: '[quiet, rueful]', speed: 0.95 },
  // Bala Anne: That Ravi says if you are going for a drive, take him also. He wants to see a car with no number plate. I told him go and sell his durian.
  '0j4zur6ztz5': { cue: '[grumbling, affectionate, covering worry]', speed: 1 },
  // Narrator: A second postcard from Pandamaran beside the till, from Ah Fook: the bandages are off. His trial is in January.
  '0vrybknwyzx': { cue: '[quiet, rueful]', speed: 0.95 },
  // Narrator: Puan Rohana has written again from Klang. Amirul has started to speak, she says, but only to the cat.
  '1arhqj2tp6v': { cue: '[soft, sad, a little wry]', speed: 0.93 },
  // Narrator: Ken Lim rang at ten to tell you Bobby Tan is selling phones on the third floor of Low Yat now, three shops from his, and waves at him every morning.
  '11ccjg38mga': { cue: '[dry, wry]', speed: 0.97 },
  // Daniel Raj: Machan. Do not drink anything you did not order. And count his stops.
  '19qwnqop6ky': { say: '[on the phone, low, serious] Machan. [break] Do not drink anything you did not order. [break] [emphasis] And count his stops.', speed: 0.95 },
  // Narrator: Under the sugar jar, a letter from Sungai Buloh in Daniel's hand, folded into a kancil. Unfolded, it says only: Count his stops. Do not look back.
  '158f1wrt6at': { cue: '[quiet, tender]', speed: 0.92 },
  // Narrator: Nothing from Daniel. Upstairs, in your drawer, the paper kancils that came under your door since August, one for every few weeks they have kept him.
  '23x05baebb4': { cue: '[low, aching]', speed: 0.9 },
  // Narrator: At ten to two Bala Anne pulls the shutter down to the pavement, and the light goes out behind it, and he does not come out again.
  '23ui2ish6s3': { cue: '[slow, ominous, quiet]', speed: 0.9 },
  // Narrator: Brickfields Road, the old men still call it. Tonight it is empty from the temple to the monorail: rain, a cat, and three shops down, a grey Proton Waja with its lights off and somebody sitting very still behind the wheel.
  '2fb36qx4q2e': { cue: '[low, noir, watchful]', speed: 0.93 },
  // Narrator: A long black saloon comes up the street without a sound and stops at the kerb outside Restoran Bala. No plates. Engine running. The driver's door stands open, and the driver's seat is empty.
  '26hdvp2z98a': { say: '[hushed, tense] A long black saloon comes up the street without a sound and stops at the kerb outside Restoran Bala. [break] No plates. [break] Engine running. [break] The driver\'s door stands open, [break] and the driver\'s seat is empty.', speed: 0.9 },
  // Narrator: The back seat is not. Through the rain on the rear window, a shape: a man sitting very straight behind the driver's seat.
  '0ejsv1qtp3a': { cue: '[hushed, uneasy]', speed: 0.9 },
  // Narrator: In the rear-view mirror, on the left half of the back seat, a man with a cloth hood over his head and his hands tied in his lap. You know the shoulders.
  '0c5cyl8e9a4': { say: '[hushed, shaken] In the rear-view mirror, on the left half of the back seat, a man with a cloth hood over his head and his hands tied in his lap. [long-break] [barely a whisper] You know the shoulders.', speed: 0.88 },
  // Narrator: You get in. The seat is warm, as if somebody has only just got out of it, or as if it has been kept warm for you.
  '14syahcffkm': { cue: '[quiet, uneasy]', speed: 0.92 },
  // Narrator: The rear-view mirror has been turned until it shows only the left half of the back seat. Whoever is behind you is sitting where it cannot see.
  '1fxkqao86w2': { cue: '[low, tense, precise]', speed: 0.92 },
  // Narrator: A hand in a white cuff settles on your shoulder, light, the way it did at Cheras. Tobacco, and old hair oil.
  '0glyzumoqqk': { cue: '[whispering, cold dread]', speed: 0.88 },
  // The Chairman: Drive. Brickfields Road, then Birch Road. You will not need the mirror.
  '0lmxnbeix0l': { say: '[calm, close, unhurried] Drive. [break] Brickfields Road, then Birch Road. [break] You will not need the mirror.', speed: 0.92 },
  // Narrator: He calls Jalan Tuanku Abdul Rahman Batu Road, as if nobody had told him. Outside a shuttered shophouse with LEONG BROS. painted over the five-foot way, an old man stands at his door in a singlet, holding a parcel in brown paper.
  '27l8jhzrxhc': { cue: '[low, noir, curious]', speed: 0.94 },
  // Narrator: The rear left window goes down. A hand in a white cuff comes out of the dark of the car, takes the parcel, and goes back in. The old man does not bend to look.
  '0y3hg9pcext': { cue: '[hushed, slow]', speed: 0.9 },
  // Leong Kam Wah: Tuan. Gin saam zou hou zo.  /  Tuan. The shirt is ready.
  '1q9ft87i88m': { say: '[old, quiet, respectful] Tuan。[break] 件衫做好咗。', speed: 0.85 },
  // The Chairman: Mr. Leong has measured me in the dark since 1986. He has never asked for a light.
  '0b8v9kfupxy': { say: '[calm, close, faintly amused] Mr. Leong has measured me in the dark since 1986. [break] He has never asked for a light.', speed: 0.92 },
  // Narrator: Four minutes, by the clock on the dashboard. Then: Mountbatten Road. Foch Avenue. Treacher Road. Streets that have not had those names since before you were at school.
  '1y902f6ji8r': { cue: '[low, uneasy, wondering]', speed: 0.93 },
  // Narrator: The car slows, but does not stop, under Menara Sinar. A third of the way up, in the black band where a storey is not, one small lamp is burning.
  '00krjsh6ywd': { cue: '[hushed, cold]', speed: 0.9 },
  // The Chairman: My lamp.
  '0v1sz2zjxdi': { cue: '[soft, possessive, almost tender]', speed: 0.85 },
  // The Chairman: Your prosecutor wrote my telephone number on a charge sheet. I have had it framed.
  '2852alg9cr8': { say: '[calm, dry, amused] Your prosecutor wrote my telephone number on a charge sheet. [break] I have had it framed.', speed: 0.93 },
  // Narrator: You are not here. Three cars back, Farah drives with her phone on its cable and one eye on the tail lights of a car with no plates.
  '2cxgqsgzvz9': { cue: '[low, quiet, foreboding]', speed: 0.93 },
  // Inspector Farah Iskandar: Asri. A black four-by-four with no lights is coming up on my left. If anything happens, it was not an accident.
  '15cb04iowh6': { say: '[on the phone, tense but steady] Asri. [break] A black four-by-four with no lights is coming up on my left. [break] [firm] If anything happens, it was not an accident.', speed: 0.97 },
  // Narrator: In her left mirror, coming up fast out of the dark of the slow lane, a shape with no lights at all.
  '15qrm12jfba': { cue: '[tense, quickening]', speed: 1 },
  // Narrator: In your side mirror: headlights swerving, a shower of sparks, a car turning sideways into the concrete divider and spinning back across two lanes.
  '0hzk3z4xy1v': { cue: '[urgent, breathless]', speed: 1.05 },
  // Narrator: Your foot comes off the pedal by itself.
  '05f6caqppd9': { cue: '[stunned, quiet]', speed: 0.9 },
  // The Chairman: Do not stop. She will live. That was not mine.
  '26vlcbxp1kx': { say: '[calm, close, utterly unhurried] Do not stop. [break] She will live. [break] [quiet] That was not mine.', speed: 0.9 },
  // Narrator: You drive on. You will think about that for the rest of your life.
  '0taaedu4eqn': { say: '[hollow, quiet] You drive on. [long-break] [bitter, low] You will think about that for the rest of your life.', speed: 0.88 },
  // Narrator: The gate of Warehouse 6, the barrier down, the guard cabin dark. Behind you the lid snaps open and shut, and fresh smoke fills the car.
  '21ter0483a5': { cue: '[low, tense, watchful]', speed: 0.93 },
  // The Chairman: Open your window. Look at Bay 3. I watched it burn twice.
  '1gqdd5bmtv3': { say: '[calm, close, a little wistful] Open your window. [break] Look at Bay 3. [break] I watched it burn twice.', speed: 0.9 },
  // Narrator: You look. Bay 3 is a black shape against the cranes, roofless, the rain going straight in. Behind you, soft, the sound of a door, opened and shut again, the way it was at Batu Road when something was handed in.
  '0c2kxurpe2d': { cue: '[hushed, slow, uneasy]', speed: 0.9 },
  // The Chairman: Banting. Then Jugra.
  '051dg438ugd': { say: '[calm, slightly distant, as if over a telephone] Banting. [break] Then Jugra.', speed: 0.9 },
  // Narrator: Oil palm on both sides, black, and the road straight through it. The voice is a little thinner now, as if it were further away, though it has not moved.
  '07x6zvdr1bg': { cue: '[low, weary, uneasy]', speed: 0.92 },
  // The Chairman: Forty years ago tonight I drove this road the other way, in a lorry with no lights.
  '0dmz2o8pjbj': { say: '[quiet, distant, remembering] Forty years ago tonight I drove this road the other way, [break] in a lorry with no lights.', speed: 0.86 },
  // Narrator: Then he hums. It takes you until Banting to place it: P. Ramlee, Getaran Jiwa. He hums it through twice, and stops in the same place both times.
  '1wies26t421': { cue: '[low, haunted, wondering]', speed: 0.9 },
  // Narrator: A gate in the oil palm under Bukit Jugra, and on the gate, faded almost to nothing, a sun painted in pink.
  '050v4qg5s8t': { cue: '[quiet, grey dawn, weary]', speed: 0.9 },
  // The Chairman: Thank you, detective. Wait until you hear the door. Then open the boot.
  '0uvj9uw9izx': { say: '[calm, courteous, final] Thank you, detective. [break] Wait until you hear the door. [break] Then open the boot.', speed: 0.9 },
  // Narrator: The rear left door opens. A small sound of something taken off the seat.
  '0cgi9xl3a6j': { cue: '[hushed, tense]', speed: 0.9 },
  // Pak Itam: Selamat pagi, Tuan.  /  Good morning, Tuan.
  '0d20ghxbfjf': { cue: '[old man, soft, respectful, half asleep]', speed: 0.85 },
  // Narrator: The door shuts. Flip-flops, slow, on laterite, going away. You count to ten, and then you look. The back seat is empty. In the rear ashtray, a cigarette burnt to the filter, cold.
  '0qeqcnvu7vj': { say: '[hushed] The door shuts. [break] Flip-flops, slow, on laterite, going away. [break] You count to ten, and then you look. [long-break] [flat] The back seat is empty. [break] In the rear ashtray, a cigarette burnt to the filter, cold.', speed: 0.88 },
  // Narrator: On the left of the seat Daniel sits with the hood in his lap and a cut cord beside him, blinking at the light.
  '20shreejtgh': { cue: '[soft, relieved, shaken]', speed: 0.9 },
  // Daniel Raj: Machan. You can look now.
  '171wh3sy5y5': { cue: '[hoarse, exhausted, a ghost of a smile]', speed: 0.88 },
  // Narrator: Your phone, at 5:52. Sergeant Asri.
  '2azjhnzwz3l': { cue: '[flat, tired]', speed: 0.95 },
  // Sjn. Asri: Puan Farah. Batu Tiga. The divider. She is alive.
  '1vigz3sbokj': { say: '[quiet, careful, tired] Puan Farah. [break] Batu Tiga. [break] The divider. [long-break] [relieved] She is alive.', speed: 0.92 },

  // ---------------- case08:ending ----------------
  // Narrator: Hamidah Yusof waits at Bukit Aman until six with her flask and her pencil, and charges nobody. "A police officer in intensive care," she says, "and a blank sheet. I will remember this sheet."
  '02pab42vpp1': { cue: '[dry, weary, disappointed]', speed: 0.95 },
  // Narrator: Nobody at Bukit Aman mentions Desmond Yap, found in Bay V1 a fortnight ago with a hose from his exhaust. Everybody thinks of him.
  '028599pcolc': { cue: '[quiet, grave]', speed: 0.92 },
  // Narrator: Farah is awake on Wednesday afternoon, propped up in a ward on the fourth floor with a brace on her left knee and three ribs taped, and the first thing she asks for is her warrant card.
  '256lpadf2j1': { cue: '[warm, relieved, wry]', speed: 0.95 },
  // Inspector Farah Iskandar: Somebody put me into that wall, and he is still out there driving. Three lengths behind somebody.
  '0dw4lrqd1q3': { say: '[hoarse, angry, low] Somebody put me into that wall, and he is still out there driving. [break] [bitter] Three lengths behind somebody.', speed: 0.95 },
  // Narrator: On the locker, flowers with a card and no name: "Left shoulder, Inspector."
  '00cxlz8opp4': { cue: '[quiet, wry]', speed: 0.95 },
  // Narrator: A basket of fruit from the Office of the Chairman, with a card in copperplate, posted in Singapore: with every good wish for the Inspector's recovery. Farah has it taken out of the room.
  '142vql42sx5': { cue: '[dry, cold irony]', speed: 0.95 },
  // Narrator: A basket of fruit from the Office of the Chairman, the card initialled M.O. in Melissa Ong's small careful hand. Farah has it taken out of the room.
  '1iqvxeep4oq': { cue: '[dry, cold irony]', speed: 0.95 },
  // Narrator: At the door, as every day since Tuesday, Sergeant Asri, with two teh in a plastic bag and the newspapers under his arm.
  '1v07oycxltg': { cue: '[warm, quiet]', speed: 0.95 },
  // Narrator: Hamidah Yusof stands up in a courtroom she has stood up in a hundred times and withdraws the murder charges from Case 7: a discharge not amounting to acquittal, which means they can come back any morning she likes.
  '27j5wjg9gez': { cue: '[clipped, formal, weary]', speed: 0.96 },
  // Narrator: Tan Sri Azhar Kamaruddin leaves by the side door, where a car is waiting with its engine running, and does not look at the photographers.
  '29dc74tu3nw': { cue: '[dry, quiet]', speed: 0.95 },
  // Narrator: Nurul Ain walks out of the front door and asks the press on the steps to photograph her, so that somebody does.
  '0hcp6jusb8k': { cue: '[quiet, admiring, sad]', speed: 0.93 },
  // Narrator: Dr. Meera Rajaratnam is free to go. Her suspension by the Medical Council stays.
  '1uwifz6mcy1': { cue: '[flat, quiet]', speed: 0.95 },
  // Narrator: Farah's men take Daniel to her safe house from Jugra, and he sleeps for nineteen hours in his clothes with every light in the house on.
  '0774dir52oh': { cue: '[soft, tender, tired]', speed: 0.92 },
  // Narrator: When he wakes he asks for a teh and a pen, and writes down every road the car took, in order, from memory, with his eyes shut. He was hooded the whole way. He gets every one right.
  '12tg5313yot': { say: '[soft, wondering] When he wakes he asks for a teh and a pen, and writes down every road the car took, in order, from memory, with his eyes shut. [break] He was hooded the whole way. [break] [quiet pride] He gets every one right.', speed: 0.92 },
  // Narrator: The warrant for Dato' Rashid's murder is still open, and Farah cannot close it from a hospital bed. Her men drive Daniel from Jugra to Sungai Buloh with her jacket folded over his wrists, so nobody at the gate sees the cuffs.
  '05gk35rivza': { cue: '[quiet, sad, controlled]', speed: 0.92 },
  // Narrator: Hamidah has applied to withdraw the charge. The hearing is on the twenty-second.
  '0g4gspj6zdz': { cue: '[quiet, matter-of-fact]', speed: 0.95 },
  // Narrator: Daniel makes you count the stops again, on the back of a calendar, with his finger on each one: Batu Road, four minutes; Jalan Ampang, none; the gate of Warehouse 6, four minutes; Jugra.
  '1rr55lwf0fh': { cue: '[low, fond, careful]', speed: 0.93 },
  // Daniel Raj: Four minutes at Batu Road for a parcel, machan. Four minutes at a gate for nothing. Nobody waits four minutes for nothing.
  '1lz3mdmkxu3': { say: '[thoughtful, insistent] Four minutes at Batu Road for a parcel, machan. [break] Four minutes at a gate for nothing. [break] [emphasis] Nobody waits four minutes for nothing.', speed: 0.95 },
  // Narrator: Through the glass you tell Daniel about the hand on your shoulder, and the tailor, and the lamp, and the wall.
  '198tmi0hw4d': { cue: '[quiet, tired]', speed: 0.93 },
  // Daniel Raj: You did not look back. Good. One of us never has to.
  '0rwlg55uwpm': { say: '[soft, steady, sad] You did not look back. [break] Good. [long-break] One of us never has to.', speed: 0.9 },
  // Narrator: The records Hamidah asked for come back on Monday, stamped and empty: nothing at that place, at that minute, that anybody can find.
  '1judm1vubxx': { cue: '[flat, weary]', speed: 0.95 },
  // Narrator: At Jugra the watchman's hut is padlocked, and the rice tin is gone.
  '1eu1d33tdcp': { cue: '[quiet, ominous]', speed: 0.92 },
  // Narrator: The plate goes to JPJ. BCK 210 was a Bedford lorry, registered in 1984 to one Teoh Ah Chuan of Jugra, and transferred on 3 December 1986 to Sinar Pengangkutan. The same week, a lien: "Sp.M.R.M. Chettiar, Melaka".
  '1gx441fo1e9': { say: '[measured, quietly intent] The plate goes to JPJ. [break] B C K two one zero was a Bedford lorry, registered in 1984 to one Teoh Ah Chuan of Jugra, and transferred on the third of December 1986 to Sinar Pengangkutan. [break] The same week, a lien: [break] "Sp. M. R. M. Chettiar, Melaka".', speed: 0.92 },
  // Narrator: On the twenty-second Hamidah applies for an order to open whatever Sinar Pengangkutan keeps with that firm. The hearing is set for the twenty-eighth.
  '0cd3iofc1p6': { cue: '[measured, quiet resolve]', speed: 0.95 },
  // Narrator: JPJ sends the plate back. It hangs on your office wall above the desk, with its small pink sun in the corner.
  '1c2cst6y6uz': { cue: '[quiet, rueful]', speed: 0.92 },
  // Narrator: On Friday morning Jason Ooi's grey sedan is back in the drop-off lane at Menara Sinar, washed by hand.
  '0qgzpy0pz2j': { cue: '[dry, quiet]', speed: 0.95 },
  // Narrator: The wall phone in Restoran Bala rings in the dark behind the shutter, and goes on ringing until you come down the back stairs. Bala Anne's shutter is down. Nobody else is downstairs.
  '19tq0rl1amo': { cue: '[hushed, uneasy, low]', speed: 0.9 },
  // The Chairman: You did not stop. Muthu would not have stopped either. Thank you, detective.
  '1cdowk8cqnm': { say: '[calm, close, almost warm] You did not stop. [break] Muthu would not have stopped either. [long-break] Thank you, detective.', speed: 0.88 },
  // Narrator: A lid, open and shut.
  '0la9q95983s': { cue: '[very quiet]', speed: 0.9 },
  // The Chairman: Keep the plate.
  '0bhr30sntb4': { cue: '[soft, final, courteous]', speed: 0.85 },
  // Narrator: The dialling tone. Across the road, in the room above the sari shop, the chair is still turned to face the window.
  '0eujjdpwkdt': { cue: '[very quiet, cold, final]', speed: 0.86 },
  // Narrator: Hamidah's records for the gate of Warehouse 6 at 3:44 lead to one toll card, F-03's: Pulau Indah, the Kesas, the ELITE, the North-South Expressway south, and at 5:28 AM, Ayer Keroh, Melaka. Nobody knows why Melaka.
  '01j1ot1otrc': { say: '[measured, quietly triumphant] Hamidah\'s records for the gate of Warehouse 6 at 3:44 lead to one toll card, F-zero-three\'s: [break] Pulau Indah, the Kesas, the ELITE, the North-South Expressway south, [break] and at 5:28 AM, Ayer Keroh, Melaka. [long-break] [puzzled] Nobody knows why Melaka.', speed: 0.93 },
  // Narrator: Melaka twice, now.
  '0qw2pgr5wz1': { cue: '[quiet, pointed]', speed: 0.9 },
  // Narrator: Murali Krishnan is charged. His prime mover is impounded, and his wife sells their thosai stall's second tawa to pay the lawyer.
  '2cw4bhdbqaq': { cue: '[clipped, then quiet and sad]', speed: 0.93 },
  // Inspector Farah Iskandar: You charged a man for what he saw in his mirror. Go and find what he did not see.
  '2e15e51m3xy': { say: '[tired, disappointed, cutting] You charged a man for what he saw in his mirror. [break] Go and find what he did not see.', speed: 0.95 },
  // Narrator: Kamarul Zaman is charged. The deputy minister's office says it has never heard of him.
  '0ei2u3m9ox4': { cue: '[clipped, dry irony]', speed: 0.96 },
  // Inspector Farah Iskandar: You charged Kamarul for lying about where he slept. In this town that is not a crime. It is a career.
  '2492jqzwfh8': { say: '[dry, tired] You charged Kamarul for lying about where he slept. [break] In this town that is not a crime. [break] [wry] It is a career.', speed: 0.96 },
  // Narrator: Superintendent Khairul Anuar is arrested at Bukit Aman by officers he trained. He asks whether Farah is awake, and does not seem to know which answer he wants.
  '2fs5j3ic3lh': { cue: '[clipped, formal, then quietly uneasy]', speed: 0.94 },
  // Narrator: Khairul Anuar, still suspended, is arrested at his house in Bangsar by officers he trained. He asks whether Farah is awake, and does not seem to know which answer he wants.
  '1d2t0jbjv7s': { cue: '[clipped, formal, then quietly uneasy]', speed: 0.94 },
  // Narrator: The three requests went out under his own login. It never crossed his mind that anybody reads the telco's bill.
  '2a9d0gtj4fq': { cue: '[dry, quiet contempt]', speed: 0.95 },
  // Narrator: The three requests went out under Kpl. Faridah Ismail's login, borrowed in October "for overtime claims". She reads about it in the Star, at her desk, and goes home sick.
  '0dfcchs5h1x': { cue: '[dry, then sympathetic]', speed: 0.95 },
  // Narrator: Roslan Daud is arrested at Bengkel Seng Lee with grease to the elbows. He asks whether the Tuan has a new escort yet.
  '06i9rrr4lmm': { cue: '[clipped, dry, a little sour]', speed: 0.95 },
  // Inspector Farah Iskandar: Khairul sent flowers. I gave them to the nurse with the worst cough.
  '14tz5xgfat0': { say: '[dry, deadpan, tired] Khairul sent flowers. [break] I gave them to the nurse with the worst cough.', speed: 0.97 },
  // Inspector Farah Iskandar: You did not stop. Good. If you had stopped, you would be his.
  '1qya57x7qj2': { say: '[hoarse, quiet, fierce approval] You did not stop. [break] Good. [long-break] If you had stopped, you would be his.', speed: 0.9 },

  // ---------------- case09 ----------------
  // Narrator: Christmas morning in Brickfields: the shutters down along Jalan Tun Sambanthan, a church bell somewhere behind the temple, and Bala Anne's wall phone ringing before the stove is lit.
  '1lkimkyklu2': { cue: '[low, weary, intimate][a quiet holiday morning]', speed: 0.94 },
  // Narrator: Bala Anne holds the receiver out across the counter without a word. It is Hamidah Yusof, and she has not slept.
  '1xkwv27qs4g': { cue: '[quiet, dry, a little ominous]', speed: 0.94 },
  // Hamidah Yusof: Box 14 is empty. They drilled one lock in a room full of gold.
  '0tghpohzdm4': { say: '[tired, crisp, controlled anger] Box 14 is empty. [break] They drilled one lock [emphasis] in a room full of gold.', speed: 0.95 },
  // Hamidah Yusof: The court was going to open it on Monday. Somebody could not wait for Monday.
  '19372g11hxm': { cue: '[dry, bitter, sleepless]', speed: 0.95 },
  // Narrator: Daniel is already at your door with two teh in a plastic bag. Farah is waiting downstairs in a borrowed car that she cannot drive with that knee.
  '0pokhokxu6t': { cue: '[warm, wry, low]', speed: 0.95 },
  // Narrator: He sleeps with the light on now, since the back seat of the black car. He says it is for the mosquitoes.
  '1c6un911bcz': { say: '[soft, careful] He sleeps with the light on now, since the back seat of the black car. [break] [faintly wry] He says it is for the mosquitoes.', speed: 0.92 },
  // Daniel Raj: They can bring the charge back any morning they like, machan. So this morning I am going to Melaka.
  '0xxnxheiw1e': { say: '[light, brave, a joke with an edge] They can bring the charge back any morning they like, machan. [break] So this morning I am going to Melaka.', speed: 0.98 },
  // Daniel Raj: A box that has waited thirty-nine years. I want to see it before the lawyers do.
  '1rchgvka61p': { cue: '[quiet, curious, almost tender]', speed: 0.95 },
  // Narrator: You drive the borrowed car. Daniel folds a kancil out of the toll receipt in the passenger seat, and Farah sits in the back with her left knee in a brace, three ribs strapped and a walking stick across her lap.
  '22w4su3c2o2': { cue: '[easy, observant, road rhythm]', speed: 0.96 },
  // Inspector Farah Iskandar: I am on medical leave. I am not here.
  '04f32ci9ct0': { say: '[deadpan, sore, stubborn] I am on medical leave. [break] I am not here.', speed: 0.95 },
  // Inspector Farah Iskandar: Asri is minding my desk at Bukit Aman. He rings every hour to ask whether I have taken my tablets. I have not.
  '1m073dv577p': { say: '[fond, dry] Asri is minding my desk at Bukit Aman. He rings every hour to ask whether I have taken my tablets. [break] [deadpan] I have not.' },
  // Inspector Farah Iskandar: Ayer Keroh, 5:28 AM, on the first. Now we know why Melaka.
  '0wsibhiqy1j': { say: '[sharp, quiet satisfaction] Ayer Keroh, five twenty-eight AM, on the first. [break] Now we know why Melaka.', speed: 0.96 },
  // Inspector Farah Iskandar: Khairul rang Melaka Tengah last night. A Kuala Lumpur detective has no standing in Melaka, he told them, and an inspector on leave has less.
  '1huwryplc7u': { cue: '[contemptuous, dry, unbothered]' },
  // Narrator: Supt. Khairul Anuar is in Sungai Buloh on Hamidah's charge. For once, nobody has rung ahead to warn Melaka about you.
  '0nvq8qp4p35': { cue: '[dry, quietly satisfied]', speed: 0.95 },
  // Narrator: A Chettiar firm house a hundred and fifty years old: whitewash, teak pillars, brass lamps, a long hall running back from the street to the river. Sinar Heritage has put a Christmas tree in the courtyard where the moneylenders' clerks once sat cross-legged over their ledgers.
  '0czzu51rhnl': { cue: '[slow, appreciative, faintly uneasy]', speed: 0.93 },
  // Narrator: The general manager meets you at the door in a grey suit with a gold sunburst pin on the lapel, and greets you by name before Farah has shown anybody anything.
  '16ivh5pg77s': { cue: '[cool, watchful, wary]', speed: 0.94 },
  // Vanessa Low: Welcome to The Kittangi. We have kept the iron room exactly as the police found it. Sinar Heritage will help in every way it can.
  '02w4l8tb2wc': { cue: '[polished, warm hospitality voice, a little too smooth]' },
  // Vanessa Low: Puan Melissa sends her regards.
  '13gf2d11yms': { cue: '[light, pleasant, pointed]' },
  // Narrator: On the reception desk, waiting for you, a card in copperplate from Singapore: "With the compliments of the season." No name.
  '1a232finqc4': { cue: '[quiet, uneasy, noting it]', speed: 0.94 },
  // Narrator: At the back of the house, behind a 1938 iron door as thick as your hand, a room the size of a lorry's cab, and in its walls forty-two small iron doors. Forty-one are shut. One hangs open, its lock drilled out, iron filings on the floor under it like black sugar.
  '0ggmiecvt34': { cue: '[low, hushed, careful]', speed: 0.92 },
  // Narrator: Through the slots of the box beside it, Box 15, you can see gold: chains, bangles, a wedding thali on a red thread. Nobody has touched it.
  '21gz6uwnpfh': { cue: '[hushed, wondering]', speed: 0.93 },
  // Narrator: Ram Chettiar stands at the iron door in a white veshti with a shirt over it, a ring of old iron keys turning in his fingers, and does not come in.
  '14a7hde71va': { cue: '[quiet, observant, gentle]', speed: 0.94 },
  // Ram Chettiar: Thaathaa sonnaar: mugatha paakkaadhe, saaviya paaru.  /  Grandfather said: don't look at the face, look at the key.
  '1d5ybracsdi': { say: '[soft, reverent, remembering] தாத்தா சொன்னார்: [break] முகத்தைப் பாக்காதே, [break] சாவியைப் பாரு.', speed: 0.9 },
  // Ram Chettiar: Forty-two boxes. In my grandfather's time a thief would have taken everything. This one took one box, and nobody alive knows what was in it.
  '0ivi8cmrp92': { cue: '[courteous, precise, ashamed under it]', speed: 0.95 },
  // Narrator: One short street: the bells of the Vinayagar temple, the call to prayer from the Kampung Kling mosque with its pagoda roof, and joss smoke drifting out of Cheng Hoon Teng, all at once, as they have for three hundred years.
  '0u0qnj0rprc': { cue: '[warm, unhurried, a street full of bells]', speed: 0.93 },
  // Daniel Raj: Machan. He kept a box for forty years, in a street where every god in Melaka lives next door.
  '2420p3gziuj': { cue: '[thoughtful, wry, low]', speed: 0.95 },
  // Inspector Farah Iskandar: Then he chose the one street where nobody looks twice at a man who comes once a year.
  '0yax04jnr3g': { cue: '[dry, sharp, thinking aloud]' },

  // ---------------- case09:ending ----------------
  // Narrator: Nobody is charged. Melaka Tengah writes "person or persons unknown" across the file, and the hotel puts its Christmas tree away.
  '1tex809e356': { cue: '[flat, tired, final]', speed: 0.94 },
  // Narrator: Ram Chettiar closes the 1938 iron door on forty-one boxes and one empty one, and turns his grandfather's key twice.
  '00ljswgujf2': { cue: '[quiet, solemn, careful]', speed: 0.92 },
  // Inspector Farah Iskandar: The woman who switched the iron room off is laying out breakfast for a hundred and forty guests this morning, and she has asked whether we would like a table.
  '0ixqo7wimz3': { cue: '[bitter, deadpan, disgusted]' },
  // Narrator: A letter for Ram comes from Menara Sinar on Monday afternoon, signed M. Ong for the Office of the Chairman: Sinar Heritage still wishes to buy the iron room, as it stands.
  '0u15493j8vn': { cue: '[cold, clipped, knowing]', speed: 0.95 },
  // Narrator: A card in copperplate from Singapore comes to the iron room for Ram: the Office of the Chairman regrets the damage to Box 14, and will pay for a new lock.
  '0su4jpchi6y': { cue: '[dry, unsettled, ironic]', speed: 0.94 },
  // Narrator: Melaka Tengah turns Melaka Sentral inside out: bay 9, the lost and found, every bin. The dry bag went north on Christmas morning. The note never went with it.
  '19l2f7fysqq': { cue: '[flat, weary, regretful]', speed: 0.95 },
  // Narrator: On Tuesday the grille over the empty grave on St. Paul's Hill is found with a strip of tape on it, and nothing under the tape.
  '22ohavpyl0d': { say: '[quiet, bleak] On Tuesday the grille over the empty grave on St. Paul\'s Hill is found with a strip of tape on it, [break] and nothing under the tape.', speed: 0.9 },
  // Narrator: Ken has printed Shamsul's four photographs of Box 14 on paper from the pharmacy across the road: a watch, a lorry's registration card, an old photograph of a gate, and a note with two thumbs.
  '1caytykbpsr': { cue: '[low, intent, careful]', speed: 0.94 },
  // Narrator: The watch is a 1970s Seiko, stopped at ten past two, river mud dried in its crown. On the back: TEOH A.C. 1979.
  '226r4766ric': { say: '[slow, quiet, chilled] The watch is a nineteen-seventies Seiko, stopped at ten past two, river mud dried in its crown. [break] On the back: [emphasis] TEOH A. C. nineteen seventy-nine.', speed: 0.9 },
  // Inspector Farah Iskandar: Teoh Ah Chuan, of Jugra. Died on the first of December, 1986. Drowned. The file says kemalangan. Accident.
  '2av6ig3ec3z': { say: '[reading off a screen, flat, then hard] Teoh Ah Chuan, of Jugra. Died on the first of December, nineteen eighty-six. [break] Drowned. [break] The file says kemalangan. [long-break] Accident.', speed: 0.93 },
  // Narrator: Daniel looks at the third photograph for a long time: the gate, the sun still wet on it, the girl with the brush, and across the red earth the long shadow of whoever held the camera. A slim man in a cap.
  '0ixyr9kvdrq': { cue: '[slow, hushed, haunted]', speed: 0.9 },
  // Daniel Raj: Forty years he kept this in a box, machan. Not the girl. The shadow.
  '0fea7ugt4rb': { say: '[quiet, unsettled] Forty years he kept this in a box, machan. [break] Not the girl. [long-break] The shadow.', speed: 0.9 },
  // Narrator: The dry bag went north from Ayer Keroh with Roslan Daud at 2:41 on Christmas morning, and nobody has seen it since.
  '28n3if67e24': { cue: '[clipped, cold, final]', speed: 0.95 },
  // Narrator: A Sinar parcel left Port Klang for Singapore on Boxing Day. Officer: N. SALLEH.
  '0bj7uwwh4mt': { cue: '[clipped, cold, knowing]', speed: 0.95 },
  // Nurul Ain: They let me go on the ninth, on a discharge that is not an acquittal. I kept the newsroom's voicemail anyway. Somebody still thinks I buy papers.
  '1ghxrrc6juh': { cue: '[sardonic, tired, defiant]' },
  // Nurul Ain: The paper let me go in October, and I kept its voicemail. Fifty thousand for a paper with two thumbs. I would have found it somehow.
  '00hza6nrqur': { say: '[wry, rueful] The paper let me go in October, and I kept its voicemail. [break] Fifty thousand for a paper with two thumbs. [break] [quietly fierce] I would have found it somehow.' },
  // Narrator: The last fireworks of the year go up late and ragged over the towers on Jalan Ampang. Bala Anne's shutter is down, and he does not come down.
  '1lv9z0ta2vb': { cue: '[low, still, late night]', speed: 0.92 },
  // Narrator: A courier on a motorbike at the shutter, engine running, an envelope held out. He says only, "Tuan says terima kasih," and is gone before you have it open.
  '1k2lvaksjuk': { cue: '[tense, quiet, unsettled]', speed: 0.94 },
  // Narrator: Inside, the original of the photograph from Box 14: the gate, the sun, the girl with the brush, the long shadow on the laterite.
  '01m6xcn630z': { cue: '[hushed, slow]', speed: 0.9 },
  // Narrator: On the back, in ink, in the left-handed hand that wrote "Terima kasih" on the rules card, two lines.
  '1olal2c7u7j': { cue: '[quiet, cold recognition]', speed: 0.9 },
  // Narrator: "Selamat Tahun Baru, detektif. She is fifty-five now."
  '1pyimbvly2k': { say: '[almost a whisper, reading] Selamat Tahun Baru, detektif. [long-break] She is fifty-five now.', speed: 0.86 },
  // Narrator: The ruined church on the top of St. Paul's Hill at first light: no roof, old Dutch gravestones standing against the walls, guttered candles in paper cups on every one, and in the floor of the nave an open grave behind an iron grille, where a saint lay for nine months and left.
  '1l2q6bqkba0': { cue: '[slow, hushed, dawn stillness]', speed: 0.92 },
  // Narrator: Under the rim of the grille, taped to the iron, a plastic sleeve with candle wax on it. Inside, a promissory note for eighteen thousand ringgit, stamped CANCELLED, and two thumbprints in old brown ink.
  '2ej2oq8p2jm': { cue: '[quiet, tense, discovering]', speed: 0.93 },
  // Narrator: JPN matches the right thumb within the hour: Muthusamy a/l Perumal, the guarantor. The left thumb has nine clear points. The national search needs twelve.
  '0s6berywozs': { say: '[measured, careful] JPN matches the right thumb within the hour: Muthusamy a/l Perumal, the guarantor. [break] The left thumb has nine clear points. [break] [quiet] The national search needs twelve.', speed: 0.93 },
  // Hamidah Yusof: Nine points is a man. It is not yet a name.
  '0ei1oqusf03': { say: '[dry, precise, a held breath] Nine points is a man. [break] It is not yet a name.', speed: 0.92 },
  // Narrator: Melaka Tengah walks Bukit China all Monday with two dogs and a clerk from the Chinese associations, and opens no urn without permission. Joss ash on every grave. No paper.
  '01mz8rq1m51': { cue: '[dry, weary]', speed: 0.95 },
  // Narrator: Marine police divers go down off the Kampung Morten jetty into water you cannot see your hand in, and come up with a bicycle, a shopping trolley and last year's Christmas tree.
  '10ck2hbq8ne': { cue: '[dry, deadpan, faintly absurd]', speed: 0.96 },
  // Narrator: Nobody tells Melaka Tengah where to look.
  '07wv85kek8o': { cue: '[flat, quiet]', speed: 0.94 },
  // Narrator: Jock Sequeira is charged. The Settlement holds a collection for his lawyer that evening, and raises it in an hour.
  '18xfvmbdhhi': { cue: '[warm, wry, a little sad]', speed: 0.95 },
  // Narrator: On New Year's Eve the Settlement dances without its locksmith. The band plays the branyo twice, once for him.
  '0zgru7mq21i': { cue: '[soft, rueful, guilty]', speed: 0.93 },
  // Narrator: Ram Chettiar is charged. The iron room is sealed, and Sinar Heritage's lawyers write to the court the same afternoon to buy it.
  '1m7ajbvzh8d': { cue: '[flat, heavy, regretful]', speed: 0.94 },
  // Narrator: A constable closes the iron door, because the keeper is in a cell at Melaka Tengah. Without a keeper the will cannot hold the room, and Sinar Heritage buys the iron room before the year is out.
  '12tiegk4s8j': { cue: '[quiet, bleak, guilty]', speed: 0.93 },
  // Narrator: Vanessa Low is arrested in the courtyard of The Kittangi under the Christmas tree. She asks whether the hotel will be told before the guests wake.
  '1q5v3pcnjeb': { cue: '[cool, measured, faintly ironic]', speed: 0.95 },
  // Inspector Farah Iskandar: Boat seven takes the river cruise out tonight with the same pilot at the wheel. He waved at me from the jetty.
  '1ho7kixjgmi': { cue: '[bitter, deadpan]' },
  // Narrator: Shamsul Bakri is arrested on the cruise jetty in his pilot's shirt, and asks the constable to tell his mother he was not in a fight.
  '1g92njh25fc': { cue: '[quiet, sad, measured]', speed: 0.94 },
  // Ram Chettiar: My grandfather lent that man eighteen thousand ringgit and wrote that he was not a good man. You caught the ones who opened his box. I am the one who told them when. Write that down also.
  '1pk7mwgffej': { say: '[grave, courteous, ashamed] My grandfather lent that man eighteen thousand ringgit and wrote that he was not a good man. [break] You caught the ones who opened his box. [break] [quiet] I am the one who told them when. [break] Write that down also.', speed: 0.93 },
  // Inspector Farah Iskandar: You got the woman at the panel and the boy on the river. You also charged a man who was never in the room. Sinar will not mind at all.
  '1ubdn52f4xa': { cue: '[tired, sharp, reproachful]' },

  // ---------------- case10 ----------------
  // Narrator: The shutters of Jalan Tun Sambanthan are still down. A D9 pool car idles at the kerb with its wipers going, because Farah's Waja is still an exhibit in a police yard in Shah Alam.
  '0muxvvh8f8k': { cue: '[low, weary, intimate]', speed: 0.94 },
  // Narrator: Farah sits in front with her stick between her knees and her left leg out straight. She is on leave, she says. Leave is where she chooses to be.
  '19gshlgk4b4': { cue: '[dry, fond, quiet]', speed: 0.95 },
  // Narrator: Sergeant Asri puts your bag in the boot and asks, as he closes it, what time you are seeing the old man on Friday. You tell him: seven.
  '1ymbv00jts4': { cue: '[flat, ordinary, matter-of-fact]', speed: 0.97 },
  // Daniel Raj: Machan. The only passport I can use says K. Rajan, and K. Rajan is not a man I want to show to a Singapore immigration officer. Bring me back the old man's story. And a kaya bun.
  '1tx43696n70': { say: '[warm, wry, a little rueful] Machan. [break] The only passport I can use says K. Rajan, and K. Rajan is not a man I want to show to a Singapore immigration officer. [break] [lighter] Bring me back the old man\'s story. [break] And a kaya bun.', speed: 0.97 },
  // Daniel Raj: Hamidah says the charge can come back any morning it likes. So I am not crossing anything. Not even the road.
  '123jce0qcw0': { say: '[dry, tired, half joking] Hamidah says the charge can come back any morning it likes. [break] So I am not crossing anything. [break] [quietly] Not even the road.', speed: 0.96 },
  // Narrator: Since December he does not sleep anywhere he cannot see the door. He stands on the pavement until the car turns the corner.
  '27v8h98ts2d': { cue: '[quiet, tender, uneasy]', speed: 0.92 },
  // Narrator: The Causeway is a kilometre of road laid across the Straits of Johor. Under it the water is brown and slow and full of light. Behind you, Johor Bahru. Ahead, a country where you are nobody's police.
  '15tedftkqy8': { say: '[measured, a little awed] The Causeway is a kilometre of road laid across the Straits of Johor. [break] Under it the water is brown and slow and full of light. [break] Behind you, Johor Bahru. [break] [low] Ahead, a country where you are nobody\'s police.', speed: 0.94 },
  // Inspector Farah Iskandar: He would not cross this. Forty years, a whole port, and he never once came over.
  '26sifa9onve': { say: '[quiet, looking at the water, hard] He would not cross this. [break] Forty years, a whole port, [break] and he never once came over.', speed: 0.94 },
  // Narrator: At the booth an officer reads your passport, reads it again, and lets you through. Behind you the pool car turns round for Kuala Lumpur.
  '1bn0yebqlhx': { cue: '[dry, understated]', speed: 0.96 },
  // Narrator: Two-storey and three-storey shophouses in pastel plaster, louvred shutters, five-foot ways. Across the street the green-tiled roofs of Thian Hock Keng, where sailors once thanked the sea goddess for getting them here. Over all of it, the glass towers of the banks.
  '0o82vqncjes': { cue: '[unhurried, observant, warm]', speed: 0.95 },
  // Narrator: Number 214 is the narrowest house in the row: a brass plate, SEAH & SEAH, ADVOCATES & SOLICITORS, polished thin. On the third floor, behind four iron bars, a desk lamp is on in the middle of the afternoon.
  '276xvajix9r': { say: '[observant, then uneasy] Number 214 is the narrowest house in the row: [break] a brass plate, Seah and Seah, Advocates and Solicitors, polished thin. [break] [quieter] On the third floor, behind four iron bars, a desk lamp is on in the middle of the afternoon.', speed: 0.94 },
  // Inspector Farah Iskandar: Vivian Chua lives four streets from here now. Ann Siang Hill. She sends cards.
  '21obmfdvomo': { cue: '[dry, wary]', speed: 0.96 },
  // Narrator: Your hotel is on Club Street, round the corner and up the hill: a room the size of a lift, a window onto a wall, and an old telephone beside the bed.
  '0fq22bukb05': { cue: '[wry, weary]', speed: 0.96 },
  // Narrator: The telephone beside the bed rings once, politely, as if it were apologising.
  '19mfrxccn3q': { cue: '[quiet, faintly amused]', speed: 0.94 },
  // Arthur Seah: Arthur Seah. Forgive an old man's telephone manners. My granddaughter says I shout.
  '16shr2veiri': { say: '[old, courteous, a little too loud on the telephone] Arthur Seah. [break] Forgive an old man\'s telephone manners. [break] [wry] My granddaughter says I shout.', speed: 0.9 },
  // Arthur Seah: Seven o'clock on Friday. I met him once, in 1987, on the Johor side. He would not cross the water.
  '2a4wt9u929q': { say: '[old, careful, lowering his voice as if someone might hear] Seven o\'clock on Friday. [break] I met him once, in 1987, on the Johor side. [long-break] He would not cross the water.', speed: 0.88 },
  // Arthur Seah: Tomorrow I bring the deed up from the strongroom, and the letter that goes with it. On Friday at seven I will have it all out on the table for you. All of it. I have been tidy for forty years. I should like to be untidy once.
  '2cuf3xcjk3c': { say: '[old, precise, with a quiet eagerness] Tomorrow I bring the deed up from the strongroom, and the letter that goes with it. [break] On Friday at seven I will have it all out on the table for you. [break] All of it. [break] [wry, almost a smile] I have been tidy for forty years. [break] I should like to be untidy once.', speed: 0.9 },
  // Narrator: He hangs up before you can ask him anything, the way men of his age end telephone calls: when they have said what they rang to say.
  '0y8xdc6m2ps': { cue: '[dry, gentle]', speed: 0.95 },
  // Narrator: Third floor. A corridor of old teak, a camera in its corner, and at the end a door bolted from inside. Nobody answers it.
  '1u0pls88e1c': { cue: '[low, tense, slow]', speed: 0.93 },
  // Narrator: Outside it: the granddaughter in a grey suit and pearls, who came in at five to seven; the night guard with his cap in his hands; two constables; and a woman in a trouser suit with a lanyard, who says her name is Teo and does not offer her hand.
  '01eouzo6qjw': { cue: '[clipped, observant, tense]', speed: 0.96 },
  // Clarissa Seah: Ah Kong? Ah Kong! He never sleeps past six. Never.
  '26iv38jwxm4': { say: '[knocking, controlled, rising] Ah Kong? [break] [louder, sharp] Ah Kong! [break] [composed again, too quickly] He never sleeps past six. [break] Never.' },
  // Narrator: The bigger constable puts his shoulder to the door twice. The bolt's keeper tears out of the frame. The room is warm and still and smells of chrysanthemum tea.
  '0l7huut08i2': { cue: '[tense, then hushed]', speed: 0.94 },
  // Narrator: A leather chair turned a little from the desk. A walking stick hooked on its arm. Spectacles folded on the blotter. A hearing aid on the floor. An empty green deed box with its lid up, and a long envelope slit open along the top. Four iron bars over the window, painted over many times. Nobody.
  '1u9bjp1sztm': { say: '[hushed, slow, each item placed down] A leather chair turned a little from the desk. [break] A walking stick hooked on its arm. [break] Spectacles folded on the blotter. [break] A hearing aid on the floor. [break] An empty green deed box with its lid up, and a long envelope slit open along the top. [break] Four iron bars over the window, painted over many times. [long-break] [flat] Nobody.', speed: 0.9 },
  // ASP Teo Wei Ling: Can or not, you tell me. Bolted inside, bars outside, camera on the corridor. Where did an old man go?
  '2a88gpcp6ti': { say: '[brisk, dry, Singaporean, challenging] Can or not, you tell me. [break] Bolted inside, bars outside, camera on the corridor. [break] [pointed] Where did an old man go?' },
  // ASP Teo Wei Ling: Lyon, 2014. Your inspector sat next to me for six weeks and corrected my French. So. This is a courtesy. You look, you tell me, I decide. You touch nothing I have not touched first.
  '07xpkbcu4ct': { say: '[brisk, dry, amused despite herself] Lyon, 2014. [break] Your inspector sat next to me for six weeks and corrected my French. [break] [firm] So. This is a courtesy. [break] You look, you tell me, I decide. [break] You touch nothing I have not touched first.' },
  // ASP Teo Wei Ling: Your superintendent rang Cantonment yesterday to tell us you are not police. I told him I know. That is why you are allowed in.
  '1yzlh0s1oyk': { cue: '[dry, deadpan]' },
  // ASP Teo Wei Ling: A suspended superintendent rang Cantonment from his house yesterday to tell us you are not police. I told him I know. That is why you are allowed in.
  '0ynwqm72lcp': { cue: '[dry, deadpan, faintly scornful]' },
  // Inspector Farah Iskandar: He would have it all out on the table, he said. Somebody has cleared the table.
  '0zpexegk98p': { cue: '[low, bitter, tired]', speed: 0.95 },

  // ---------------- case10:ending ----------------
  // Narrator: ASP Teo files the case as a missing person, signs it, and goes home to sleep for the first time since Thursday. Nobody is charged with anything.
  '24btthbmrld': { cue: '[flat, weary]', speed: 0.95 },
  // ASP Teo Wei Ling: Whoever took him, I am not holding them. My superintendent says thank you for your courtesy visit.
  '0bdyzbr5uf6': { cue: '[flat, cold, formal]' },
  // Narrator: Teo's team spends the afternoon on the bolt with a locksmith from Jurong and three magnets. From outside, whatever they do, the bolt does not move.
  '0dpqahphjrn': { cue: '[dry, rueful]', speed: 0.95 },
  // Narrator: By the time Teo's team reaches Tuas the bale room is empty and cold. The plant's log has forty minutes missing, from eleven o'clock to twenty to twelve. Arthur Seah is not found.
  '00rm2oy9lrx': { say: '[low, heavy, slow] By the time Teo\'s team reaches Tuas the bale room is empty and cold. [break] The plant\'s log has forty minutes missing, from eleven o\'clock to twenty to twelve. [long-break] [flat, final] Arthur Seah is not found.', speed: 0.9 },
  // Narrator: Only the corner survives, in an evidence bag at Cantonment, with the end of one line on it in a left hand: "...drives me last."
  '0wlbx2mzr13': { cue: '[quiet, bleak]', speed: 0.92 },
  // Inspector Farah Iskandar: He wanted to be untidy once. He wanted to put it all out on the table. They took the table.
  '1cscy8kamtn': { say: '[low, bitter, grieving] He wanted to be untidy once. [break] He wanted to put it all out on the table. [long-break] They took the table.', speed: 0.92 },
  // Narrator: On Saturday the 1987 deed goes into the custody of the High Court of Singapore in a grey archive box, and a certified copy goes north to Hamidah Yusof by courier, across the water, the way its maker never would.
  '0gokva2e0w2': { cue: '[measured, quietly ironic]', speed: 0.95 },
  // Inspector Farah Iskandar: Muthu's name on the deed, and not one stroke of it his. Hamidah says that is a forgery in two countries. She says she will need both of them.
  '02qp7g0mgmh': { say: '[low, hard, a little sad] Muthu\'s name on the deed, and not one stroke of it his. [break] Hamidah says that is a forgery in two countries. [break] [dry] She says she will need both of them.', speed: 0.95 },
  // Narrator: On Monday Clarissa Seah is still the trustee of the Jugra Trust. The brass plate on Telok Ayer Street is polished at eight, as usual.
  '084s04x5aln': { cue: '[dry, sour irony]', speed: 0.95 },
  // Narrator: The Law Society appoints an interim trustee for the Jugra Trust on Monday morning. By Monday afternoon Sinar's lawyers have written to object.
  '225b0ds3nt7': { cue: '[dry, weary irony]', speed: 0.96 },
  // Narrator: At your hotel a card in copperplate is waiting, with no stamp: "He will be sorry about the old man."
  '1c6jzvaqem6': { cue: '[quiet, uneasy]', speed: 0.93 },
  // Narrator: A letter from the Office of the Chairman reaches Seah & Seah by hand on Monday, asking after Mr. Arthur's health. It is initialled M.O.
  '0oodbh7uryv': { cue: '[quiet, cold irony]', speed: 0.94 },
  // ASP Teo Wei Ling: One more thing. The trust's investment committee has three members. One is a Sri Lankan lady, very elegant, who flies in from Colombo every quarter. Somebody you know, I think.
  '1l4s61e3zce': { cue: '[casual, sly, watching your face]' },
  // Narrator: Bin 7's empty frame crossed back into Johor on Saturday, on a Sinar Cold Chain flatbed. Officer: N. SALLEH.
  '293q1mmghvz': { cue: '[dry, deadpan]', speed: 0.96 },
  // Narrator: Daniel rings the hotel on Sunday night, from the agency, with the radio on behind him and a teh going cold.
  '0pnjll286yf': { cue: '[warm, tired, quiet]', speed: 0.94 },
  // Daniel Raj: Machan. Still nothing? Then keep looking. Old men are harder to lose than people think.
  '11s8qgovg19': { say: '[gentle, steady, stubborn] Machan. Still nothing? [break] Then keep looking. [break] Old men are harder to lose than people think.', speed: 0.96 },
  // Daniel Raj: Hamidah says my charge is a door that is not locked. So I stay on this side of it.
  '1nbpgre7bub': { cue: '[dry, quiet, rueful]', speed: 0.96 },
  // Narrator: Since December he does not sleep anywhere he cannot see the door, and he has started leaving the radio on all night.
  '0risz8xswxz': { cue: '[quiet, tender, uneasy]', speed: 0.92 },
  // Narrator: Then the line clicks, and a call from Colombo cuts in on top of him.
  '17qeevwwsut': { cue: '[brisk, faintly amused]', speed: 0.97 },
  // Inspector Ruwan Herath: Ayubowan.  /  Long life to you.
  '012lv5y5p23': { cue: '[warm, formal, a smile in the voice]' },
  // Inspector Ruwan Herath: Your fire officer and your depot manager send their regards from my side of the water. I thought you would like to know they are both still here.
  '1gnz0bgpw12': { cue: '[courteous, dry, quietly pointed]' },
  // Inspector Ruwan Herath: Your fire officer sends his regards from my side of the water. I thought you would like to know he is still here.
  '085ikoecugl': { cue: '[courteous, dry, quietly pointed]' },
  // Inspector Ruwan Herath: Your depot manager sends his regards from my side of the water. I thought you would like to know he is still here.
  '24g76hn1ums': { cue: '[courteous, dry, quietly pointed]' },
  // Narrator: At ten past two the telephone beside the bed rings. Nobody at the desk downstairs put the call through.
  '2d8jvv2mgvd': { say: '[whispering, very still, dread] At ten past two the telephone beside the bed rings. [break] Nobody at the desk downstairs put the call through.', speed: 0.86 },
  // The Chairman: You crossed the water for me, detective. I never have. Thank you.
  '1lf0bc3mx06': { say: '[close, calm, courteous, faintly amused, utterly cold underneath] You crossed the water for me, detective. [break] I never have. [long-break] [softly] Thank you.', speed: 0.85 },
  // Narrator: A lid snaps open on the line, and shut. Then the dialling tone, and the hum of the city, and your own heart.
  '17oln9yjwyl': { say: '[whispering, shaken] A lid snaps open on the line, [break] and shut. [break] Then the dialling tone, [break] and the hum of the city, [break] [flat] and your own heart.', speed: 0.86 },
  // Narrator: The fire service takes the bars off the oldest window on Telok Ayer Street in front of a television crew. Under the paint the bolts have rusted into the frame since 1946.
  '1891hjgi2qp': { cue: '[dry, rueful]', speed: 0.95 },
  // Narrator: Teo's men take down the archive shelving and open the party wall into No. 216. Behind the brick is more brick, and a hundred years of dust.
  '1ahc5n7asf5': { cue: '[dry, rueful]', speed: 0.95 },
  // Narrator: Teo's team opens door 4 at Tuas at two o'clock on Friday afternoon. Behind it, among the paper bales, in a shredding bin wrapped in empty shred sacks, Arthur Seah is alive and very cold, and asks for his hearing aid.
  '189q0zawkbt': { say: '[low, building, then relief] Teo\'s team opens door four at Tuas at two o\'clock on Friday afternoon. [break] Behind it, among the paper bales, in a shredding bin wrapped in empty shred sacks, [break] [softer] Arthur Seah is alive and very cold, [break] and asks for his hearing aid.', speed: 0.92 },
  // Narrator: On Saturday, under three blankets, his hearing aid back in, he asks for his spectacles before he will speak, and then for the Malaysian. He recites the letter of wishes from memory, every word, and stops at the last line as if it were the end of a hymn.
  '29zaz2zj2fy': { cue: '[gentle, quiet, tender]', speed: 0.92 },
  // Arthur Seah: On my death the Trust is to be directed by whoever drives me last.
  '1dtsdn32huy': { say: '[old, slow, reciting from memory like scripture] On my death [break] the Trust is to be directed [break] by whoever [emphasis] drives me last.', speed: 0.84 },
  // Arthur Seah: I told him that is not a legal sentence. He said, it will be, Arthur, when I am dead.
  '10hfza4fmk0': { say: '[old, dry, a lawyer\'s distaste] I told him that is not a legal sentence. [long-break] [quieter, uneasy] He said, it will be, Arthur, [break] when I am dead.', speed: 0.86 },
  // Arthur Seah: The first of December, 1987. The Johor waterfront, at dusk. A black car, and his driver standing outside it with his back to us the whole time.
  '2cgjyig98e0': { say: '[old, remembering, slow] The first of December, 1987. [break] The Johor waterfront, at dusk. [break] A black car, [break] and his driver standing outside it with his back to us the whole time.', speed: 0.86 },
  // Arthur Seah: Younger than me and older than he looked. A face you forget while you are looking at it. He signed with his left hand.
  '0zseb5e0hti': { say: '[old, careful, slightly troubled] Younger than me and older than he looked. [break] A face you forget while you are looking at it. [long-break] He signed with his left hand.', speed: 0.85 },
  // Arthur Seah: I do not cross water, he said. So I crossed it, with my pen and my stamp. I have been crossing it for him for forty years.
  '223rgdhs8ko': { say: '[old, quiet, rueful] I do not cross water, he said. [break] So I crossed it, with my pen and my stamp. [break] [heavier] I have been crossing it for him for forty years.', speed: 0.86 },
  // Daniel Raj: Machan. They found the old man? Then fold him a kancil from me. A man who keeps a paper forty years has earned one.
  '17986r2cck9': { say: '[warm, relieved, gentle] Machan. They found the old man? [break] Then fold him a kancil from me. [break] A man who keeps a paper forty years has earned one.', speed: 0.96 },
  // Narrator: Nobody tells Teo which way he went, and she searches nothing.
  '1tp6y3zruan': { cue: '[flat, quiet]', speed: 0.93 },
  // Narrator: R. Rajendran is charged. His firm takes his uniform back the same afternoon.
  '1vjwx5wxngo': { cue: '[flat, quiet, a little sad]', speed: 0.95 },
  // Narrator: Lucas Seah is charged. He asks the magistrate to tell his father he is sorry, and the magistrate does not know where to send it.
  '0hat3co3yhu': { cue: '[clipped, then quiet and sad]', speed: 0.94 },
  // Narrator: Clarissa Seah is arrested in the firm's boardroom under her great-grandfather's portrait, and asks for a Singapore lawyer who has never acted for Sinar. There is not one in the Law Society's directory.
  '092a6sr2v8a': { cue: '[clipped, formal, sour irony]', speed: 0.96 },
  // ASP Teo Wei Ling: The granddaughter is in my cells. The man who carried him down is back at work in Tuas on Monday, weighing paper.
  '0wjldk9voc2': { cue: '[dry, cold, pointed]' },
  // Narrator: Gary Raju is charged at Cantonment on Sunday morning, still in the overalls he ran in on Friday. He asks whether the old man was cold.
  '1lso4xigt09': { say: '[clipped, formal] Gary Raju is charged at Cantonment on Sunday morning, still in the overalls he ran in on Friday. [break] [quiet] He asks whether the old man was cold.', speed: 0.95 },
  // ASP Teo Wei Ling: The man who rode the lift is in my cells. The woman who sent it up is still signing letters on Telok Ayer Street.
  '1e73a2edtcx': { cue: '[dry, cold, pointed]' },
  // ASP Teo Wei Ling: Two names, one route, one old man. In Singapore we call that a good week.
  '0rhwgptvptu': { cue: '[dry, satisfied, nearly warm]' },
  // ASP Teo Wei Ling: You gave me the two who did it, and one more who did not. Here the court reads the whole file, ah. It will notice.
  '10ejja14v2x': { cue: '[dry, pointed, disapproving]' },

  // ---------------- case11 ----------------
  // Narrator: Twenty to nine on a Monday at the Shah Alam courts: lawyers in black, families on the steps with plastic bags of food, and at the top of them, Hamidah Yusof with her flask of teh and her hair still wet.
  '0kyjh3rrehw': { cue: '[low, weary, observant][morning heat]', speed: 0.95 },
  // Hamidah Yusof: Third court this season, detective. This one is forty years old.
  '2gjk787ohbs': { say: '[dry, brisk, faintly amused] Third court this season, detective. [break] [quieter] This one is forty years old.', speed: 0.98 },
  // Narrator: The coroner sits in Court 3 for four days, on an application Hamidah signed herself. The death of Teoh Ah Chuan, lorry owner, of Jugra, on 1 December 1986. Cause on the file: kemalangan. Accident. Time taken to decide it: eleven minutes.
  '1e2g6o3m19w': { say: '[measured, flat, reading a record] The coroner sits in Court 3 for four days, on an application Hamidah signed herself. [break] The death of Teoh Ah Chuan, lorry owner, of Jugra, on 1 December 1986. [break] Cause on the file: kemalangan. [break] Accident. [long-break] [quiet, bitter] Time taken to decide it: eleven minutes.', speed: 0.92 },
  // Narrator: A police car stops at the foot of the steps. Out of it, between two constables, comes a thin old man in a pressed shirt, holding a folder to his chest like a schoolboy: retired Corporal Tarmizi Hassan, who wrote the word. Farah's sergeant, Asri, walks at his elbow.
  '08yt3hxy3ib': { cue: '[quiet, watchful, a little sad]', speed: 0.94 },
  // Inspector Farah Iskandar: No stick. Back on duty, back on my feet. I asked for Asri on the witness room. In four years he has never once been late.
  '0w0d9pp1hfj': { say: '[brisk, pleased with herself, dry] No stick. Back on duty, back on my feet. [break] [matter of fact, warm] I asked for Asri on the witness room. In four years he has never once been late.', speed: 1 },
  // Narrator: In the corridor outside Court 3 the old corporal stops in front of you, as if he has waited a long time to say it to somebody who is not from Jugra.
  '198ikgti91a': { cue: '[low, hushed, intimate]', speed: 0.93 },
  // Tarmizi Hassan: Saya tulis kemalangan. Empat puluh tahun saya tulis kemalangan.  /  I wrote "accident". For forty years I have been writing "accident".
  '1cf7otsda7r': { say: '[old man, thin voice, trembling, a confession held in too long] Saya tulis kemalangan. [break] [breaking] Empat puluh tahun saya tulis kemalangan.', speed: 0.85 },
  // Narrator: In the front row of the gallery a woman of fifty-five sits with paint dried on her forearms and a tin of brushes on her knee, as if she might be asked to paint something: Teoh Siew Yang, the applicant, the dead man's daughter, down from Butterworth.
  '037ujy5upi2': { cue: '[quiet, observant, respectful]', speed: 0.94 },
  // Narrator: When the clerk reads her father's name she says something to nobody, in Hokkien.
  '03f0ro3i0s7': { cue: '[soft, hushed]', speed: 0.93 },
  // Teoh Siew Yang: A-pa bo tng lai.  /  Father didn't come home.
  '1ztza8gqtjz': { cue: '[barely a whisper, to herself, grief worn smooth]', speed: 0.85 },
  // Narrator: Beside her, an old man in a white shirt turns a string of prayer beads: her uncle, Teoh Ah Kow, the dead man's younger brother, who identified the body in 1986 and has come to sit beside her every day.
  '0y8t0k71ulc': { cue: '[quiet, measured, faintly uneasy]', speed: 0.94 },
  // Teoh Ah Kow: Sit, Siew Yang. Forty years you waited. You can wait one more minute.
  '00ibw5so0v6': { cue: '[soft, gentle old man, soothing, a little too smooth]', speed: 0.9 },
  // Narrator: Daniel sits in the row behind them with the coroner's cause list in his hands, and folds nothing.
  '0lrqv0duxe0': { cue: '[quiet, tender, wry]', speed: 0.94 },
  // Narrator: He sleeps with the light on now, since the back seat of the car. In court he sits where he can see the door.
  '145d9dw5mkw': { cue: '[soft, sad, protective]', speed: 0.92 },
  // Daniel Raj: They kept this file shut for forty years, machan. Mine they only closed in December, and they can open it again any morning they like.
  '1ku1t31mv8v': { say: '[low, wry, tired] They kept this file shut for forty years, machan. [break] [bitter, quiet] Mine they only closed in December, and they can open it again any morning they like.', speed: 0.95 },
  // Narrator: A girl of fifteen asleep on a camp bed in her father's yard office wakes to a lorry engine at ten past two in the morning, and goes to the window.
  '1bvp4u61lph': { cue: '[hushed, dreamlike, slow][memory]', speed: 0.88 },
  // Narrator: A torch on the bank of the river, held up high. The tail lights of a lorry going down the washing ramp into black water, and under.
  '043acs945hp': { say: '[hushed, dreamlike] A torch on the bank of the river, held up high. [break] [slow, dread] The tail lights of a lorry going down the washing ramp into black water, [long-break] and under.', speed: 0.86 },
  // Narrator: Two figures. One on the bank, holding the light. One in the water at the cab door, with his back to her.
  '040ufrlse56': { say: '[whispering, slow] Two figures. [break] One on the bank, holding the light. [break] One in the water at the cab door, [break] with his back to her.', speed: 0.85 },
  // Narrator: Across the yard a man's voice said: "Jangan tengok belakang."
  '2dk065kpwx3': { say: '[whispering, very still, chilled] Across the yard a man\'s voice said: [long-break] "Jangan tengok belakang."', speed: 0.82 },
  // Narrator: In the morning her uncle told her she had dreamed it. She was fifteen. She believed him for forty years, nearly.
  '0qrnc2uv6vp': { say: '[quiet, aching] In the morning her uncle told her she had dreamed it. [break] She was fifteen. [long-break] [softly] She believed him for forty years, nearly.', speed: 0.88 },
  // Narrator: The coroner's site visit: three cars on a laterite track under Bukit Jugra, the lighthouse on the hill above, oil palm on both sides, and at the end of the track a gate with a sun painted on it. Pink, faded, forty-one years old.
  '0j9iibjzghw': { cue: '[low, measured, heat and stillness]', speed: 0.94 },
  // Narrator: Pak Itam, the watchman, opens the gate for the coroner without a word, his keys on their string, and stands aside looking at the ground.
  '0cpl0fbyvft': { cue: '[quiet, watchful]', speed: 0.94 },
  // Narrator: Inside: laterite and weeds, a lorry shed with no lorry in it, a hut by the gate, and at the bottom of the yard the concrete washing ramp running down into the brown Langat. Still there. Still wet.
  '02mslqhne0w': { say: '[low, uneasy] Inside: laterite and weeds, a lorry shed with no lorry in it, a hut by the gate, [break] and at the bottom of the yard the concrete washing ramp running down into the brown Langat. [long-break] Still there. [break] Still wet.', speed: 0.92 },
  // Pak Itam: Air tengah pasang, tuan. Jangan dekat.  /  The tide is coming in, sir. Don't go near.
  '1fjrpbjnqh0': { cue: '[old village man, quiet, flat, a warning without emphasis]', speed: 0.9 },
  // Narrator: Siew Yang puts her hand flat on the painted sun, the way you would put a hand on a horse.
  '1casefkrlgj': { cue: '[soft, tender]', speed: 0.92 },
  // Narrator: On the exhibit table the clerk lays out what forty years have left: a police file of four typed pages, a lorry's registration card, and a photograph of a wristwatch stopped at ten past two, from a thief's telephone in Melaka.
  '2fil1r0br4p': { cue: '[measured, quiet, wry]', speed: 0.94 },
  // Hamidah Yusof: Every exhibit on that table came from somebody who was told to burn it.
  '0oswsosqzde': { cue: '[dry, quiet, approving]', speed: 0.97 },
  // Narrator: In Cheras a headstone says Ong Wei Jie now. Siew Yang knew the family: a ferry engineer's boy from Bagan Luar, three streets from her shop.
  '0m58fmx8dfi': { cue: '[soft, quiet, tender]', speed: 0.93 },
  // Narrator: Exhibit P7: a cancelled promissory note from Melaka, 2 December 1986, with two thumbprints on it, in the plastic sleeve that was taped under an iron grille on St. Paul's Hill.
  '19cxa3ri6o5': { cue: '[measured, quiet satisfaction]', speed: 0.94 },
  // Narrator: Exhibit P9: an affidavit sworn in Singapore General Hospital by Arthur Seah, eighty-two, about a man in the back of a car who would not cross the water.
  '0ydcgrfgptc': { cue: '[measured, quiet, a trace of wonder]', speed: 0.94 },
  // Narrator: Leaning against the leg of the exhibit table, a rusted lorry plate: BCK 210, with a small sun painted in its corner.
  '1wv6iefplko': { cue: '[low, ominous, quiet]', speed: 0.93 },
  // Narrator: The plate BCK 210 is still on your office wall in Brickfields. The coroner has asked for a photograph of it, and has it.
  '0cn3sx11d5j': { cue: '[dry, rueful]', speed: 0.95 },
  // Narrator: In the back row, in plain clothes and without a notebook: Superintendent Khairul, "observing".
  '2d3zlilguuv': { cue: '[dry, cold irony]', speed: 0.95 },

  // ---------------- case11:ending ----------------
  // Narrator: Teoh Ah Kow is not charged. He takes the evening bus home to Banting with his beads, and waters his garden in the dark.
  '0hqivyvbqj6': { say: '[flat, uneasy] Teoh Ah Kow is not charged. [break] He takes the evening bus home to Banting with his beads, [break] [quiet, ominous] and waters his garden in the dark.', speed: 0.92 },
  // Narrator: Shamir Kassim is not charged with the tea. Hamidah reports him to the Bar Council for the cut recording and the envelope, and he is in a Sinar car before the letter is typed.
  '296qatnh3y7': { cue: '[dry, weary irony]', speed: 0.96 },
  // Narrator: The coroner finds what the corporal found: the brakes failed. The finding of 1986 is written again in 2027, in a better hand.
  '0qnei5qz1p5': { cue: '[dry, bitter, quiet]', speed: 0.94 },
  // Narrator: The file of 1986 is closed again, for the second time, and this time in a coroner's hand.
  '273tqtq6wtj': { cue: '[flat, weary, bitter]', speed: 0.93 },
  // Narrator: In the GOH 2021 carton, among Henry Goh's old index cards, Farah finds one from 1986 in his young handwriting: "Teoh A.C., drowning, dental: identified by brother."
  '105ihpjt1rx': { say: '[quiet, slow, uneasy] In the GOH 2021 carton, among Henry Goh\'s old index cards, Farah finds one from 1986 in his young handwriting: [break] [reading, flat] "Teoh A.C., drowning, dental: [break] identified by brother."', speed: 0.92 },
  // Narrator: Siew Yang drives down to Jugra in the last of the light with her tin of brushes, and paints nothing.
  '23osqpw1wzq': { cue: '[quiet, heavy]', speed: 0.9 },
  // Narrator: She sits on the washing ramp with her shoes off until the tide comes up to her feet and it is dark, and Pak Itam waits at the gate with his keys and does not ask her to go.
  '1cx4bdmkkyi': { cue: '[soft, slow, melancholy]', speed: 0.88 },
  // Narrator: Daniel folds a kancil out of the coroner's cause list, slowly, and sets it on the exhibit table beside the photograph of the watch at ten past two.
  '0xyxw3rrty0': { cue: '[quiet, tender, slow]', speed: 0.9 },
  // Daniel Raj: All this time I thought it was a time, machan. It was a minute.
  '20o1h9xux9y': { say: '[low, quiet, a realisation] All this time I thought it was a time, machan. [long-break] It was a minute.', speed: 0.9 },
  // Inspector Farah Iskandar: Asri carried that cup in himself. He has not slept since. I told him it is not his fault.
  '18qoyv48vbu': { cue: '[low, tired, protective]', speed: 0.95 },
  // Narrator: Since the back seat on the first of December Daniel has slept with the light on. Tonight, he says, he might try it off.
  '1xpzptyoex3': { cue: '[soft, wry, hopeful]', speed: 0.93 },
  // Daniel Raj: They closed a drowning in eleven minutes, machan. Mine took a year, and it is still not shut.
  '2ckge364gp2': { cue: '[wry, tired, bitter underneath]', speed: 0.95 },
  // Narrator: In Butterworth, at the ferry terminal, Madam Ong closes her stall and sets out one glass of teh.
  '0ekhpgxqs8d': { cue: '[soft, tender, quiet]', speed: 0.9 },
  // Narrator: In Butterworth, at the ferry terminal, Madam Ong closes her stall and sets out two glasses of teh, as she has every night since 2021.
  '1hydhovrn0f': { cue: '[soft, sad, quiet]', speed: 0.9 },
  // Narrator: Restoran Bala's shutter is down, and the street is red with lanterns for the morning. Behind the shutter the wall phone rings, and keeps ringing, until you come down the stairs in the dark and lift it.
  '1iiiad0ski0': { say: '[low, hushed, night] Restoran Bala\'s shutter is down, and the street is red with lanterns for the morning. [break] Behind the shutter the wall phone rings, [break] and keeps ringing, [break] [whispering] until you come down the stairs in the dark and lift it.', speed: 0.9 },
  // The Chairman: You found my first night, detective. Thank you.
  '0xbz1bjv8tf': { say: '[close, calm, warm and courteous, utterly cold underneath] You found my first night, detective. [long-break] [softly] Thank you.', speed: 0.85 },
  // Narrator: A lid snaps open on the line, and shut.
  '1n6ndl8lw8j': { cue: '[whispering, very still]', speed: 0.88 },
  // The Chairman: On the fifteenth night of the new year, come to the gate. Bring the plate.
  '0u7dgfyljy0': { say: '[quiet, precise, an invitation that is an order] On the fifteenth night of the new year, [break] come to the gate. [long-break] [softly] Bring the plate.', speed: 0.84 },
  // Narrator: The line goes dead. Across the street a firecracker goes off early, and somebody's grandmother shouts at it.
  '23ftil3khad': { say: '[flat, quiet] The line goes dead. [long-break] [dry, faintly wry] Across the street a firecracker goes off early, and somebody\'s grandmother shouts at it.', speed: 0.94 },
  // Narrator: At four o'clock the coroner reads her finding into a file that was closed in eleven minutes, and she takes eleven minutes over it, on purpose.
  '27d57bvuxpd': { cue: '[slow, deliberate, quiet satisfaction]', speed: 0.92 },
  // Narrator: Unlawful killing by the driver of BCK 210, a man whose name was torn out of the file in 1987, in the presence of Muthusamy a/l Perumal, deceased.
  '251wbvbws26': { say: '[slow, formal, solemn, every word weighed] Unlawful killing by the driver of BCK two one zero, [break] a man whose name was torn out of the file in 1987, [break] in the presence of Muthusamy a/l Perumal, [break] deceased.', speed: 0.86 },
  // Hamidah Yusof: Eleven minutes. She timed it. Forty years late, and exactly on time.
  '0y4b8s0kpvm': { say: '[quiet, dry, moved and hiding it] Eleven minutes. [break] She timed it. [long-break] Forty years late, and exactly on time.', speed: 0.95 },
  // Narrator: Tarmizi Hassan does not come back to court. From his hospital bed he sends word that he remembers nothing after Tuesday.
  '0l7jajfjhlo': { cue: '[flat, quiet, regretful]', speed: 0.93 },
  // Narrator: Siew Yang drives down to Jugra in the last of the light with her tin of brushes and a ladder on the roof of her car.
  '1tvqfau5ymk': { cue: '[quiet, warm, dusk]', speed: 0.93 },
  // Narrator: Under the pink sun, in small black letters, careful as a sign for a shop that will be open a long time, she paints: TEOH AH CHUAN 1934–1986.
  '28gnktlur8y': { say: '[soft, slow, reverent] Under the pink sun, in small black letters, careful as a sign for a shop that will be open a long time, [break] she paints: [long-break] TEOH AH CHUAN, nineteen thirty-four to nineteen eighty-six.', speed: 0.86 },
  // Narrator: Pak Itam holds the ladder, and looks at the ground.
  '0lvyyvecnb1': { cue: '[very quiet, still]', speed: 0.88 },
  // Narrator: The coroner finds that Teoh Ah Kow let the handbrake off for his debts. On the steps Siew Yang tells the press that her uncle was at home in Banting when the engine started, and that she should know, because she was there and he was not.
  '29b7r37vxam': { cue: '[measured, then sharp and bitter]', speed: 0.95 },
  // Narrator: The coroner finds that Teoh Ah Chuan drove into the river himself. In the front row of the gallery Siew Yang stands up, and then sits down again.
  '1m0ub97n7zq': { cue: '[quiet, heavy, sad]', speed: 0.93 },
  // Narrator: The coroner writes no new finding, and the old one stands.
  '06rcu5jd8xy': { cue: '[flat, quiet]', speed: 0.93 },
  // Narrator: Teoh Siew Yang is charged. She puts her brushes on the dock rail and does not look at her uncle.
  '0bzr8t8e84h': { cue: '[clipped, then quiet and heavy]', speed: 0.93 },
  // Narrator: Siew Yang is on remand in Kajang, and her brushes are in a police evidence bag in Shah Alam.
  '0zwq6lgaln5': { cue: '[quiet, regretful]', speed: 0.93 },
  // Narrator: At dusk Pak Itam chains the gate, and stands for a while looking at the pink sun, and then at the ground.
  '0tkbva3bf1w': { cue: '[quiet, slow, melancholy]', speed: 0.9 },
  // Narrator: Shamir Kassim is charged. Sinar's statement says he acted alone, which nobody in the court believes, including the coroner.
  '02kl8lim3bz': { cue: '[clipped, sour irony]', speed: 0.96 },
  // Narrator: Teoh Ah Kow is arrested in the gallery with his beads in his hand. He asks his niece to light a joss stick for her father on the eve of the new year. She does not answer.
  '0xovjkxcsk8': { say: '[clipped, formal, then quiet and sad] Teoh Ah Kow is arrested in the gallery with his beads in his hand. [break] He asks his niece to light a joss stick for her father on the eve of the new year. [long-break] She does not answer.', speed: 0.92 },
  // Narrator: Tarmizi Hassan comes back in a wheelchair and says, in front of the court, what he was paid and who paid it. The coroner thanks him, and writes her finding anyway.
  '1lebyd44ata': { cue: '[quiet, rueful]', speed: 0.94 },
  // Narrator: Before she rises, Tarmizi Hassan is wheeled in from the hospital with a drip on a pole and his wife at his elbow, and asks to add one thing to his evidence.
  '2dnzoatt48p': { cue: '[quiet, solemn]', speed: 0.93 },
  // Tarmizi Hassan: Empat puluh tahun saya tulis. Hari ini saya cakap.  /  Forty years I wrote. Today I speak.
  '0gsmznybkzo': { say: '[old man, weak but steady, from a wheelchair, quiet dignity] Empat puluh tahun saya tulis. [long-break] Hari ini saya cakap.', speed: 0.82 },
  // Narrator: Ridzuan Tarmizi is charged. His tow truck is taken off the road outside the court, by another tow truck.
  '01m8qlxwabt': { cue: '[clipped, dry, bleak irony]', speed: 0.96 },

  // ---------------- case12 ----------------
  // Narrator: The fifteenth night of the new year. Somebody on Jalan Tun Sambanthan has hung oranges in a net over a shop door, and somebody in a back lane is letting off firecrackers one string at a time, as if they were rationed.
  '25c0xrxuuod': { say: '[low, weary, intimate] The fifteenth night of the new year. [break] [dry, quietly amused] Somebody on Jalan Tun Sambanthan has hung oranges in a net over a shop door, and somebody in a back lane is letting off firecrackers one string at a time, [break] as if they were rationed.', speed: 0.94 },
  // Narrator: Bala Anne has his shutter half down. He has not pulled it the rest of the way, and he has not opened it either.
  '0pa8pa337ws': { say: '[quiet, uneasy] Bala Anne has his shutter half down. [break] He has not pulled it the rest of the way, [break] and he has not opened it either.', speed: 0.94 },
  // Narrator: At the counter Farah rings her sergeant on her own telephone, which is charged tonight.
  '0zvwrmbqtnm': { say: '[flat, low] At the counter Farah rings her sergeant on her own telephone, [break] [wry] which is charged tonight.', speed: 0.95 },
  // Inspector Farah Iskandar: Watch V1. Tell me when it moves.
  '1s1gox97fep': { cue: '[quiet, clipped, all business]' },
  // Narrator: On the back seat of her car, wrapped in a Bomba blanket, the rusted plate BCK 210 with its small painted sun. He asked you to bring it.
  '14p8kj1c8jn': { say: '[low, measured] On the back seat of her car, wrapped in a Bomba blanket, the rusted plate B C K two one oh, with its small painted sun. [long-break] [quietly ominous] He asked you to bring it.', speed: 0.93 },
  // Narrator: Daniel sits on the step under the half shutter with every light in the shop on behind him. Since December he has slept with the light on.
  '1ddl4xw0cy0': { say: '[soft, tender] Daniel sits on the step under the half shutter with every light in the shop on behind him. [break] [quiet, aching] Since December he has slept with the light on.', speed: 0.92 },
  // Narrator: Daniel sits on the step under the half shutter folding a kancil out of a red packet, and does not look up when the firecrackers go.
  '20gck9ndazj': { cue: '[soft, warm, low]', speed: 0.94 },
  // Daniel Raj: A man whose charge can come back any morning does not go to a fire, machan. I will mind the telephone.
  '1awdyv16yto': { say: '[wry, tired, gentle] A man whose charge can come back any morning does not go to a fire, machan. [break] [quiet] I will mind the telephone.', speed: 0.95 },
  // Daniel Raj: Somebody has to mind the telephone, machan. He likes to ring it.
  '0udkvc7lbu8': { say: '[dry, half a smile] Somebody has to mind the telephone, machan. [break] [darker] He likes to ring it.', speed: 0.95 },
  // Narrator: Farah's radio, on the counter between two glasses of teh, clicks once.
  '05vw2jw1o6s': { cue: '[low, tense, hushed]', speed: 0.94 },
  // Sjn. Asri: Kereta dah keluar dari V1. Satu penumpang. Saya ikut dengan motor.  /  The car has left V1. One passenger. I'm following on the bike.
  '0iro8kuov0h': { say: '[over a police radio, calm, quiet, slightly breathless] Kereta dah keluar dari V1. [break] Satu penumpang. [break] Saya ikut dengan motor.' },
  // Narrator: Farah wants to reach the gate at ten past two and not a minute before. She has timed the road twice. At twenty to two you leave Brickfields in her car, with the plate on the back seat.
  '0ygtb4dnpq9': { say: '[measured, low] Farah wants to reach the gate at ten past two and not a minute before. [break] She has timed the road twice. [break] At twenty to two you leave Brickfields in her car, with the plate on the back seat.', speed: 0.95 },
  // Daniel Raj: You will both be late.
  '1d5pjm58jgs': { cue: '[quiet, certain, a little sad]', speed: 0.92 },
  // Narrator: No tolls on the old road, and few cameras: oil palm on both sides, a lorry stop shuttered for the holiday, a temple with every lamp lit for the full moon.
  '1oy07ok1y7c': { say: '[low, hypnotic, night-drive calm] No tolls on the old road, and few cameras. [break] Oil palm on both sides, a lorry stop shuttered for the holiday, [break] a temple with every lamp lit for the full moon.', speed: 0.93 },
  // Sjn. Asri: Puan, saya hilang dia di Jenjarom.  /  Ma'am, I lost him at Jenjarom.
  '1nwyxzohshy': { say: '[over a police radio, apologetic, low, steady] Puan, [break] saya hilang dia di Jenjarom.' },
  // Narrator: Farah asks him where he is. The radio gives her the hiss of an open channel, and then not even that. She puts her foot down.
  '02rhckulakn': { say: '[tense, low] Farah asks him where he is. [break] The radio gives her the hiss of an open channel, [break] and then not even that. [break] [sharp] She puts her foot down.', speed: 0.97 },
  // Narrator: You are late. The pink sun on the gate is lit from below, by a fire.
  '25hykigcg7c': { say: '[grim, low] You are late. [long-break] [awed, hushed] The pink sun on the gate is lit from below, [break] by a fire.', speed: 0.92 },
  // Narrator: Inside the gate, on the laterite where Sinar's first lorry stood, a long black car with no plates is burning from the front seats back.
  '2bs0uzt92tm': { cue: '[low, grim, steady]', speed: 0.94 },
  // Narrator: Under the sun, in small black letters three weeks old, the firelight finds a name: TEOH AH CHUAN 1934–1986.
  '0j6ceh3w8d9': { say: '[quiet, solemn] Under the sun, in small black letters three weeks old, the firelight finds a name. [break] Teoh Ah Chuan. [break] Nineteen thirty-four to nineteen eighty-six.', speed: 0.9 },
  // Narrator: Pak Itam stands at the gate post with a bucket of water he has not used, and looks at the ground. Bomba's lights are coming down the road from Banting.
  '1rxitz496xd': { say: '[low, weary] Pak Itam stands at the gate post with a bucket of water he has not used, [break] and looks at the ground. [break] Bomba\'s lights are coming down the road from Banting.', speed: 0.94 },
  // Inspector Farah Iskandar: Asri. Asri, where are you?
  '0zzxhy5uznc': { say: '[urgent, into a radio, rising worry] Asri. [break] Asri, where are you?', speed: 1.05 },
  // Narrator: Rosli, in yesterday's uniform, opens the back door with a crowbar when the metal will let him.
  '1u9n996dy1e': { cue: '[tired, grey, flat]', speed: 0.94 },
  // Narrator: Behind the driver's seat sits a man in a white shirt, upright against the door, his collar buttoned and a cravat at his throat. In his left fist, so tight that Rosli does not try to open it, a silver lighter.
  '25u1bye0lpl': { say: '[hushed, careful] Behind the driver\'s seat sits a man in a white shirt, upright against the door, [break] his collar buttoned and a cravat at his throat. [long-break] [very quiet] In his left fist, so tight that Rosli does not try to open it, [break] a silver lighter.', speed: 0.9 },
  // Fire Officer Rosli: He was dead before the fire, Tuan. Look at his mouth. No soot.
  '1r52p4ujvt1': { say: '[low, certain, grave] He was dead before the fire, Tuan. [break] Look at his mouth. [break] No soot.', speed: 0.93 },
  // Narrator: Nobody at the gate says who he is. Everybody at the gate is thinking it.
  '23s9t987w3q': { say: '[low, loaded] Nobody at the gate says who he is. [break] [almost a whisper] Everybody at the gate is thinking it.', speed: 0.9 },
  // Narrator: Before the dawn and before the crowbar: a motorbike coming fast from the Jenjarom road, and a police sergeant in a navy windbreaker with his helmet already off.
  '0r0td5ytbfj': { say: '[flat, quiet, a flashback] Before the dawn and before the crowbar. [break] A motorbike coming fast from the Jenjarom road, [break] and a police sergeant in a navy windbreaker with his helmet already off.', speed: 0.95 },
  // Sjn. Asri: Puan. Maaf. Saya hilang dia.  /  Ma'am. Sorry. I lost him.
  '1vnoxlpo4k3': { say: '[out of breath, ashamed, soft] Puan. [break] Maaf. [break] Saya hilang dia.', speed: 0.92 },
  // Narrator: Farah puts her hand on his shoulder, the way she would for anybody who had ridden through the night for her.
  '1qi4uhh0bjv': { say: '[gentle, with a hidden ache] Farah puts her hand on his shoulder, [break] the way she would for anybody who had ridden through the night for her.', speed: 0.92 },
  // Narrator: Deputy Public Prosecutor Hamidah Yusof, hair still wet, a flask of teh, at the door of the forensic department.
  '1kuwc3ovpwv': { cue: '[dry, low, morning-weary]', speed: 0.95 },
  // Hamidah Yusof: Sinar's lawyers have asked for a death certificate by noon. Bursa has asked for a name. I have asked for neither.
  '1ywyzvxkc71': { say: '[crisp, dry, unimpressed] Sinar\'s lawyers have asked for a death certificate by noon. [break] Bursa has asked for a name. [break] [cool, firm] I have asked for neither.', speed: 0.97 },
  // Narrator: Two newspapers already have the headline set. They are waiting for somebody to tell them which word goes in it.
  '1cn50cxfjlf': { say: '[wry, bitter, low] Two newspapers already have the headline set. [break] They are waiting for somebody to tell them which word goes in it.', speed: 0.95 },

  // ---------------- case12:ending ----------------
  // Narrator: At half past four Sjn. Asri drives Farah home, as he has every night for four years, and carries her bag up the stairs.
  '1joi36kyrf8': { say: '[quiet, uneasy, almost tender] At half past four Sergeant Asri drives Farah home, [break] as he has every night for four years, [break] and carries her bag up the stairs.', speed: 0.92 },
  // Narrator: Hamidah Yusof writes it slowly, in capitals: the Chairman of Sinar Holdings Berhad. She initials it, and does not look up.
  '0jhwsgx2uc6': { say: '[slow, heavy] Hamidah Yusof writes it slowly, in capitals. [break] The Chairman of Sinar Holdings Berhad. [break] She initials it, and does not look up.', speed: 0.9 },
  // Hamidah Yusof: It is on the form now, detective. By Friday it will be on a grave.
  '2a5cw09z3vs': { say: '[cold, quiet] It is on the form now, detective. [break] By Friday it will be on a grave.', speed: 0.93 },
  // Narrator: Exhibit P7 from the coroner's court, the cancelled note from Melaka, goes under Dr. Lim's glass beside the deed. The borrower's left thumb shows the same nine points as the man on her table. Still nine.
  '00nd0ega4mj': { say: '[measured, clinical, low] Exhibit P7 from the coroner\'s court, the cancelled note from Melaka, goes under Doctor Lim\'s glass beside the deed. [break] The borrower\'s left thumb shows the same nine points as the man on her table. [long-break] [quiet] Still nine.', speed: 0.93 },
  // Narrator: Sinar Holdings Berhad announces to Bursa Malaysia, with deep regret, the death of its Chairman. The share price rises eleven sen before lunch.
  '1qakg4gu1b0': { say: '[cool, corporate irony] Sinar Holdings Berhad announces to Bursa Malaysia, with deep regret, the death of its Chairman. [break] [bitter] The share price rises eleven sen before lunch.', speed: 0.95 },
  // Narrator: By three o'clock Seah & Seah of Singapore, Clarissa Seah writing, have told the High Court that under the deed of 1987 as amended, the Jugra Trust is to be directed by whoever drove him last.
  '036z2mw2yn4': { say: '[dry, precise] By three o\'clock Seah and Seah of Singapore, Clarissa Seah writing, have told the High Court [break] that under the deed of nineteen eighty-seven as amended, [break] the Jugra Trust is to be directed by [emphasis] whoever drove him last.', speed: 0.95 },
  // Narrator: By three o'clock Sinar's lawyers have told the High Court that under the deed of 1987 as amended, the Jugra Trust is to be directed by whoever drove him last.
  '0modg90ksoy': { say: '[dry, precise] By three o\'clock Sinar\'s lawyers have told the High Court [break] that under the deed of nineteen eighty-seven as amended, [break] the Jugra Trust is to be directed by [emphasis] whoever drove him last.', speed: 0.95 },
  // Narrator: "On the evidence," the letter says, "whoever drove the car to the gate. Or, the court may find, on the first of December, the detective."
  '1e6nu80umjo': { say: '[cold, reading a letter] On the evidence, the letter says, whoever drove the car to the gate. [long-break] [quiet, ominous] Or, the court may find, on the first of December, [break] the detective.', speed: 0.92 },
  // Narrator: Hamidah's charge against the user of prepaid line 011-2604 1986 abates with the death she has just certified. She tears nothing up. She files it.
  '0v3sgcir47r': { say: '[low, dry] Hamidah\'s charge against the user of prepaid line oh one one, two six oh four, one nine eight six, abates with the death she has just certified. [break] She tears nothing up. [break] [quiet, stubborn] She files it.', speed: 0.95 },
  // Narrator: Tan Sri Azhar knew the sentence because every newspaper had printed it: Arthur Seah recited the letter of wishes into an affidavit from a hospital bed, every word.
  '1e47t8f4p2y': { say: '[measured, low] Tan Sri Azhar knew the sentence because every newspaper had printed it. [break] Arthur Seah recited the letter of wishes into an affidavit from a hospital bed, [break] every word.', speed: 0.95 },
  // Narrator: Tan Sri Azhar knew the sentence from the board: a copy of the letter of wishes, made at Seah & Seah before the original burned, had reached every director by January.
  '1konuy7ttui': { say: '[measured, low] Tan Sri Azhar knew the sentence from the board. [break] A copy of the letter of wishes, made at Seah and Seah before the original burned, [break] had reached every director by January.', speed: 0.95 },
  // Narrator: The man from the back seat is buried in plot 2741, at the far end of the public cemetery under a rain tree, in a row of numbered boards. Nobody claims him. Everybody comes.
  '1aanjd31s1s': { say: '[soft, elegiac] The man from the back seat is buried in plot twenty-seven forty-one, at the far end of the public cemetery under a rain tree, [break] in a row of numbered boards. [long-break] Nobody claims him. [break] [quiet wonder] Everybody comes.', speed: 0.9 },
  // Narrator: Bala Anne brings a garland of jasmine and marigold from the shop on Jalan Thambapillay, and lays it down without a word.
  '1h8akyfpiyy': { cue: '[soft, tender, slow]', speed: 0.91 },
  // Narrator: Pak Itam stands at the cemetery gate with his keys on their string, as if somebody had told him to keep it.
  '1fbajxd8wqx': { say: '[quiet, wistful] Pak Itam stands at the cemetery gate with his keys on their string, [break] as if somebody had told him to keep it.', speed: 0.92 },
  // Narrator: Teoh Siew Yang paints the plot's number on its board herself, in black, with her smallest brush.
  '0g50cuilmrv': { cue: '[soft, careful, tender]', speed: 0.92 },
  // Narrator: Two rows away, a headstone that says Ong Wei Jie.
  '1h12j5eppvj': { say: '[very quiet] Two rows away, [break] a headstone that says Ong Wei Jie.', speed: 0.9 },
  // Narrator: Daniel does not fold anything. He stands with his hands in his pockets until the diggers have gone.
  '27q3jshrlm0': { say: '[quiet, heavy] Daniel does not fold anything. [break] He stands with his hands in his pockets until the diggers have gone.', speed: 0.91 },
  // Narrator: Nurul Ain photographs the board with the number on it, and nothing else.
  '1to4lyh4pu5': { cue: '[quiet, respectful]', speed: 0.93 },
  // Narrator: At the cemetery gate a black Land Cruiser with a new bull bar idles three lengths behind nobody.
  '2gl7yhsh08a': { say: '[low, uneasy] At the cemetery gate a black Land Cruiser with a new bull bar idles [break] three lengths behind nobody.', speed: 0.93 },
  // Narrator: At Bukit Aman, Superintendent Khairul gives the press a statement about "the end of a long chapter".
  '1pw4srdxpy5': { say: '[dry contempt] At Bukit Aman, Superintendent Khairul gives the press a statement about [emphasis] the end of a long chapter.', speed: 0.95 },
  // Narrator: From his gate in Bangsar, Khairul, still suspended, gives the press a statement about "the end of a long chapter".
  '0ojqcp8uzmq': { say: '[dry contempt] From his gate in Bangsar, Khairul, still suspended, gives the press a statement about [emphasis] the end of a long chapter.', speed: 0.95 },
  // Narrator: Farah and you sit on the steps of Restoran Bala with a glass of teh each, going cold.
  '1f5yyalhmyh': { cue: '[quiet, intimate, late night]', speed: 0.92 },
  // Inspector Farah Iskandar: Asri has asked for leave. Two weeks, Kota Bharu. I signed it.
  '06v9z2jip4c': { say: '[tired, matter-of-fact, fond] Asri has asked for leave. [break] Two weeks, Kota Bharu. [break] I signed it.', speed: 0.94 },
  // Narrator: At a quarter past one Bala Anne pulls the shutter down behind you and goes up to bed. A few minutes later Farah drives home.
  '2055htgrtmv': { say: '[low, still, the street emptying] At a quarter past one Bala Anne pulls the shutter down behind you and goes up to bed. [break] A few minutes later Farah drives home.', speed: 0.92 },
  // Narrator: At ten past two a black car with no plates stops outside Restoran Bala, the second of its kind. The engine is running.
  '1ignli09knt': { say: '[hushed, dread building] At ten past two a black car with no plates stops outside Restoran Bala, [break] the second of its kind. [long-break] The engine is running.', speed: 0.88 },
  // Narrator: This time the back door is open. From the driver's seat, the voice.
  '0fbasklchc8': { say: '[almost a whisper] This time the back door is open. [long-break] From the driver\'s seat, [break] the voice.', speed: 0.86 },
  // The Chairman: Good evening, detective. Not the front. Tonight I drive.
  '203thuiwq2h': { say: '[calm, close, intimate, like a man ordering tea] Good evening, detective. [break] Not the front. [long-break] [quietly pleased] Tonight I drive.', speed: 0.9 },
  // The Chairman: You signed. Thank you. Now nobody is looking for me except you.
  '0xwjn4iayiz': { say: '[calm, faintly amused] You signed. [break] Thank you. [long-break] [soft, intimate] Now nobody is looking for me except you.', speed: 0.9 },
  // Narrator: You get into the back. The car moves.
  '2g5hjy8oty8': { say: '[low, slow, resigned] You get into the back. [long-break] The car moves.', speed: 0.88 },
  // Narrator: A hand in a white cuff reaches up and tilts the rear-view mirror until it holds your eyes, and his. The reading light comes on.
  '1ov0ioex8oq': { say: '[hushed, slow, suspended] A hand in a white cuff reaches up and tilts the rear-view mirror [break] until it holds your eyes, [break] and his. [long-break] The reading light comes on.', speed: 0.85 },
  // The Chairman: You may look in the mirror as often as you like, detective.
  '23m6dokwgw5': { say: '[soft, close, an old promise kept] You may look in the mirror [break] as often as you like, detective.', speed: 0.88 },
  // Narrator: You look.
  '2aqvp25k0ph': { say: '[barely a breath, final] You look.', speed: 0.8 },
  // Narrator: Hamidah Yusof writes "brother of the Chairman of Sinar Holdings Berhad", crosses it out, and writes it again, because you asked her to.
  '2cqzbn4jj3e': { say: '[uneasy, low] Hamidah Yusof writes, brother of the Chairman of Sinar Holdings Berhad, [break] crosses it out, [break] and writes it again, because you asked her to.', speed: 0.93 },
  // Hamidah Yusof: I will regret this, detective. Not today. But I will.
  '20s5626v31o': { say: '[tired, reluctant] I will regret this, detective. [break] Not today. [break] [quiet certainty] But I will.', speed: 0.93 },
  // Narrator: Sinar Holdings tells Bursa Malaysia that its Chairman is well and will not be taking questions. The share price closes where it opened.
  '0denm93hk7z': { say: '[dry, weary irony] Sinar Holdings tells Bursa Malaysia that its Chairman is well and will not be taking questions. [break] The share price closes where it opened.', speed: 0.95 },
  // Narrator: Hamidah's charge sheet against a person unknown, the user of prepaid line 011-2604 1986, stays open on her desk.
  '021bvp2110f': { say: '[low, steady] Hamidah\'s charge sheet against a person unknown, the user of prepaid line oh one one, two six oh four, one nine eight six, [break] stays open on her desk.', speed: 0.95 },
  // Narrator: On Hamidah's charge sheet the line under "and abetment by" stays blank.
  '1aliig8v6mq': { say: '[flat, resigned] On Hamidah\'s charge sheet the line under [emphasis] and abetment by [break] stays blank.', speed: 0.94 },
  // The Chairman: You were nearer than the others. Not near enough.
  '1fyjaqc105z': { say: '[calm, gently disappointed] You were nearer than the others. [break] Not near enough.', speed: 0.9 },
  // Narrator: Hamidah Yusof writes "a person employed to stand in for the Chairman of Sinar Holdings Berhad", crosses it out, and writes it again, because you asked her to.
  '1legvnssnzc': { say: '[uneasy, low] Hamidah Yusof writes, a person employed to stand in for the Chairman of Sinar Holdings Berhad, [break] crosses it out, [break] and writes it again, because you asked her to.', speed: 0.93 },
  // Narrator: Hamidah Yusof uncaps a pen she does use, and writes in the box for a name, in capitals, saying it aloud as she writes.
  '0z4zv5telpu': { say: '[quiet, deliberate] Hamidah Yusof uncaps a pen she does use, [break] and writes in the box for a name, in capitals, [break] saying it aloud as she writes.', speed: 0.93 },
  // Hamidah Yusof: Tidak dikenali. Lelaki, lebih kurang tujuh puluh lima tahun.  /  Unidentified. Male, about seventy-five.
  '0ny4ms96t7q': { say: '[slow, steady, reading aloud as she writes] Tidak dikenali. [break] Lelaki, [break] lebih kurang tujuh puluh lima tahun.', speed: 0.88 },
  // Hamidah Yusof: Henry Goh wrote "match" once. Not on my desk.
  '159lwdwg4ua': { say: '[quiet, steel underneath] Henry Goh wrote [emphasis] match once. [break] [firm, final] Not on my desk.', speed: 0.93 },
  // Narrator: Daniel folds a kancil from a copy of the burial permit and leaves it on the turned earth.
  '0i024y8kjgj': { say: '[soft, warm, aching] Daniel folds a kancil from a copy of the burial permit, [break] and leaves it on the turned earth.', speed: 0.9 },
  // The Chairman: You would not sign. Henry Goh would have. That is why I chose you.
  '23akz2ry8mn': { say: '[calm, approving, quiet] You would not sign. [break] Henry Goh would have. [break] [warm, almost fond] That is why I chose you.', speed: 0.9 },
  // Narrator: Hamidah Yusof leaves the box empty, and the permit goes back into its plastic sleeve.
  '1cut06ti73w': { cue: '[flat, quiet]', speed: 0.94 },
  // Narrator: Pak Itam is charged. The gate at Jugra is chained by the police, and for the first time since 1985 nobody keeps it.
  '04gc243rr2p': { say: '[heavy, regretful] Pak Itam is charged. [break] The gate at Jugra is chained by the police, [break] and for the first time since nineteen eighty-five, nobody keeps it.', speed: 0.92 },
  // Narrator: Nurul Ain is charged. She gives her camera to Farah and asks her to keep the card safe.
  '0sxzuduxevt': { say: '[low, regretful] Nurul Ain is charged. [break] She gives her camera to Farah and asks her to keep the card safe.', speed: 0.93 },
  // Narrator: Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights for the second time in three months, and asks for the same lawyer.
  '0alnv753bok': { say: '[dry, weary irony] Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights for the second time in three months, [break] and asks for the same lawyer.', speed: 0.95 },
  // Narrator: Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights in front of two photographers who were told where to stand, and asks for his lawyer by his first name.
  '1zpu9y2g689': { say: '[dry, cool] Tan Sri Azhar Kamaruddin is arrested at his house in Damansara Heights, [break] in front of two photographers who were told where to stand, [break] and asks for his lawyer by his first name.', speed: 0.95 },
  // Narrator: Sjn. Mohd. Asri bin Ghazali is arrested by Farah herself, in the D9 office, in front of the board where he pinned your photographs. She takes his handset off his belt and lays it on the desk. Neither of them says anything.
  '28apfo9yu1f': { say: '[grave, low, slow] Sergeant Mohd. Asri bin Ghazali is arrested by Farah herself, in the D9 office, [break] in front of the board where he pinned your photographs. [break] She takes his handset off his belt and lays it on the desk. [long-break] [very quiet] Neither of them says anything.', speed: 0.9 },
  // Narrator: "On the evidence," the letter says, "Sergeant Asri. Or, the court may find, on the first of December, the detective."
  '0q4y4ic91aj': { say: '[cold, reading a letter] On the evidence, the letter says, Sergeant Asri. [long-break] [quiet, ominous] Or, the court may find, on the first of December, [break] the detective.', speed: 0.92 },
  // Inspector Farah Iskandar: Four years he sat in my car.
  '153asjmijn1': { say: '[quiet, hollow, holding it together] Four years [break] he sat in my car.', speed: 0.88 },
  // Narrator: She counts it off without looking at her fingers. The last voice she heard before the divider. Her car named at 5:52, before anybody had found her purse. A question about what time an old man in Singapore would see you. A tray carried through a door.
  '06sch0j97xa': { say: '[low, slow, each item a weight] She counts it off without looking at her fingers. [break] The last voice she heard before the divider. [break] Her car named at five fifty-two, before anybody had found her purse. [break] A question about what time an old man in Singapore would see you. [break] A tray carried through a door.', speed: 0.9 },
  // Inspector Farah Iskandar: I called all of it loyalty.
  '0ogz8r5r1vq': { say: '[bitter, very quiet, almost breaking] I called all of it [emphasis] loyalty.', speed: 0.88 },
};
