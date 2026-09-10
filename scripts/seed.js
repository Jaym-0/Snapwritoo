// ---------------------------------------------------------------------------
// scripts/seed.js
//
// Run once with: npm run db:seed
//
// Populates data/snapwritoo.sqlite with everything that used to live in
// content/poems/*.js and content/photographs/*.js. Safe to re-run — it
// skips a table if it already has rows, so it won't create duplicates.
//
// Note: the old content/poems/index.js only listed 8 of the 10 poem files
// that actually existed on disk, and two of those (a-long-way and
// the-light-you-carry) were imported twice — so "A Love That Stands" and
// "Meaningless Mindset" were never actually showing up on the site. This
// seed includes all 10, once each.
// ---------------------------------------------------------------------------

const path = require("node:path");
const fs = require("node:fs");

// `next dev`/`next build` auto-load .env* files, but this script runs under
// plain `node`, which does not. Load them manually — and do this BEFORE
// requiring lib/db.js, since that module reads TURSO_DATABASE_URL /
// TURSO_AUTH_TOKEN at import time to decide whether to talk to a local
// file or your hosted Turso database. Without this, `npm run db:seed`
// would silently seed the local file even when you've set up Turso.
//
// Checked in the same priority order Next.js itself uses, so it doesn't
// matter which of these files you actually put your real values in.
(function loadEnvFiles() {
  const candidates = [".env.local", ".env.development.local", ".env"];
  for (const filename of candidates) {
    const envPath = path.join(__dirname, "..", filename);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
})();

const { getPoems, createPoem, getPhotographs, createPhotograph, getPitchStats, createPitchStat, getPitchLedger, createPitchLedgerItem, usingHosted } = require("../lib/db");

console.log(usingHosted ? "Seeding your hosted Turso database…" : "Seeding the local data/snapwritoo.db file…");

const poems = [
  {
    slug: "a-long-way",
    title: "A Long Way",
    lines: [
      "From chasing kites which",
      "Separated with her thread,",
      "To chasing people",
      "Who ruled in our breath...",
      "From falling asleep",
      "Within seconds,",
      "To dreaming in night",
      "For hours...",
      "From being best comedian",
      "In entire circle,",
      "To waiting for that one smile which",
      "Feels like miracle...",
      "From waiting for morning to",
      "Meet our friends,",
      "To distancing from them to",
      "Hide ourselves...",
      "From hunting all those",
      "Impossible tasks,",
      "To searching peace to",
      "Rewire our soul...",
      "Ya we came a long way ♡",
    ],
  },
  {
    slug: "a-love-that-stands",
    title: "A Love That Stands",
    lines: [
      "In towering heights,",
      "love's spark ignites,",
      "Echoing depths that",
      "only a few know tonight.",
      "Ancient stones stand strong,",
      "a testament to time,",
      "A love that weathers storms,",
      "forever divine.",
      "In mountain stillness, peace",
      "is found,",
      "A love that stands, a heart",
      "it's perfect ground.",
    ],
  },
  {
    slug: "bekhabar",
    title: "Bekhabar",
    lines: [
      "Bekhabar hain baat se",
      "Anjaani raahon me chal diye",
      "Fir mile ya na mile",
      "Ye marzi uski kya kahein",
      "Khaaf ki in ranjishon me",
      "Khoobsurat kashishon me",
      "Raahon ki aarzoo bhi",
      "Lagti hai befikri si",
      "Un khushiyon ko bhoole ho kya",
      "Bachpan me neendein udaati thi jo",
      "Nasamajh dil kitna sahi tha",
      "Sabka bhala socha to tha",
      "Kaash bekhabar hote duniyaavi se",
      "Shayad hum kuch aur hi hote",
      "Bekhabar hain raat se",
      "Un saberon ki aas me",
      "Duniya ko chhod diye",
      "Anjaani si raahon me",
      "Manzilein mile na mile ye waqt ke haath me",
    ],
  },
  {
    slug: "dear-october",
    title: "Dear October",
    lines: [
      "Dear October, you ended with",
      "storms, rain and cyclone",
      "A lot changes, emotions still",
      "linger on",
      "Some farmers rejoice, while",
      "some are left to mourn",
      "Some learnt to survive alone,",
      "trusting in God's plan",
      "Some are still suffering,",
      "memories of past linger",
      "Dear October, you were a",
      "month so strange",
      "Some found themselves,",
      "some lost their way",
      "Some still hope for the best,",
      "while some lost faith..",
    ],
  },
  {
    slug: "dekho-na-nazare-me",
    title: "देखो ना नज़ारे में",
    lines: [
      "देखो ना नज़ारे में",
      "जहाँ में जो बनाए हैं।",
      "सुनो ना उन गीतों को",
      "जो कायनात ने गुनगुनाए हैं।",
      "भीगो ना उन बूंदों में",
      "जो बादलों ने बरसाए हैं।",
      "खोओ ना उन ख्वाबों में",
      "जो सितारों ने दिखाए हैं।",
      "है कितना कुछ उड़ने के लिए",
      "फिर भी अंधेरों में",
      "क्यों गिरते, संभलते नहीं।",
      "तोड़ो न उन जंजीरों को",
      "बाँधे हैं जो तुम्हारे पंखों को।",
      "भर लो उड़ान आसमाँ के लिए",
      "देखो ना कितना हसीन",
      "कुदरत का नज़ारा है।",
      "जो तुमने कभी देखा ही नहीं",
      "कर लो यकीन ये सारा तुम्हारा है।",
    ],
  },
  {
    slug: "har-pal-jeet-hai",
    title: "हर पल जीत है!",
    lines: [
      "क्या जीत है, क्या हार है,",
      "असली तो कुछ बनाया नहीं।",
      "तो तो हमें सीखता रहा,",
      "मैं परिणामों को हमने ही",
      "युद्ध की उम्मीद को समझ के,",
      "मगर मैंने कुछ किया ही नहीं।",
      "हर वो दिन जीत है,",
      "जब तुमने उगता सूरज देखा।",
      "हर वो शाम जीत है,",
      "जब तुमने चमकते तारों को देखा।",
      "हर वो क्षण जीत है,",
      "जब तुमने मेरी को लड़ते देखा।",
      "हर वो पल जीत है,",
      "जिसमें तुमने साँसे भरी।",
      "फिर क्यों जिंदगी में कठिन पड़े",
      "सीखने को हर बार भाग दिया।",
      "बचपन में गिर कर उठते थे,",
      "अब क्यों गिरने से डरते लगते हो।",
      "जब प्रयास भी नहीं किया जीतने का,",
      "फिर क्यों जीत की आस करते रहें।",
      "हर पल मुस्कुराने का साथ रखो,",
      "बच्चों सा स्वभाव रखो।",
      "जीवन सीखने का हुनर है,",
      "इसको हार का नाम न दो।",
      "हर पल में जीत तो वास्तविक है,",
      "बस मुस्कुरा के जी लो जरा।",
    ],
  },
  {
    slug: "ineffable-beauty",
    title: "Ineffable Beauty",
    lines: [
      "When I was passing through",
      "renmess streets",
      "Feels very chaotic and boring",
      "When I looked up",
      "My eyes got stuck",
      "And my mind lost in ineffable",
      "beauty",
      "Holding coolness like blue ocean",
      "Pretty pinkish light like your",
      "glossy lips",
      "Relaxing like your arms",
      "And the way you staring at me",
      "Feels like a warm hug",
      "And at that moment distance",
      "feels like nothing",
    ],
  },
  {
    slug: "kabhi-sadkon-par-rehne-walon-se-milkar-to-dekho",
    title: "कभी सड़कों पर रहने वालों से मिलकर तो देखो",
    lines: [
      "कुछ न आता न जाता हमें",
      "हमने सीखा कहाँ कोई",
      "सीखने का चाहा हमने मगर",
      "हालात हमारे जैसे तो नहीं।",
      "आसमान की ऊँचाई हमें भी है",
      "कितनी दूर हैं मालूम नहीं",
      "ख्वाबों में देखी है ऐसी दुनिया",
      "असल में कैसी है पता भी नहीं",
      "सीखना तो चाहा हमने मगर",
      "हमको सीखना कहाँ कोई।",
      "लोगों की सुन लें अगर मैं",
      "क्या भरोसा जिंदगी रहे भी न",
      "जिन्होंने खुद के पंख काट लिए",
      "उनकी बातें कैसे मान लें",
      "सीखने की चाह हमको भी है",
      "पर अपना सुख कैसे मान लें।",
      "ये कहानी रही उनकी जनाब",
      "सड़कों पे रह के भी जो",
      "सजाते हैं ख्वाब।",
      "छोड़ दिया देव के भरोसा मन लगाना",
      "मगर हालातों पर भरोसा करना कोई नहीं।",
      "जिंदगीली देवी से तो उनको देखो",
      "शाम के खाने का ठिकाना नहीं",
      "पर मुस्कुराते ऐसी जो जीना सिखा दें।",
    ],
  },
  {
    slug: "meaningless-mindset",
    title: "Meaningless Mindset",
    lines: [
      "In this everlasting universe",
      "We are as tiny as atoms",
      "And expect everyone's attentions",
      "To just show off how special we are",
      "Making our own sensibility",
      "And someone who is not ready",
      "To give you such importance",
      "why you feel ignorance",
      "why we are habitual to these",
      "Always seeking for virtuals",
      "And we forget that",
      "Life is beyond our imagination",
      "People are fighting their own battle",
      "And just for your selfishness",
      "we blame others",
      "That why they are not backing you",
      "Making our own expectations",
      "And crushing with your own thoughts",
      "And then",
      "They change their perspective",
      "Start hating for what",
      "Doesn't even exist",
      "This how we are granted to",
      "meaningless mindset",
    ],
  },
  {
    slug: "the-light-you-carry",
    title: "The Light You Carry",
    author: "Priyanshi Dwivedi",
    lines: [
      "Sitting under the peepal tree,",
      "Witnessing December's winter chill.",
      "Feeling cold inside my heart,",
      "Suddenly feel warmth through my thoughts.",
      "The dark of night looks scary,",
      "But the moon's dazzling light makes it beautiful.",
      "A firefly approaches me,",
      'And asks, "Are you shiny like me?"',
      "I feel jealous of her power,",
      "To light herself up in the dark hour.",
      "But she teaches me in a gentle way,",
      '"You are brighter than me, come what may.',
      "You may not know who you are,",
      "But one day you'll realize",
      "Maybe today you're upset with what you have,",
      "But one day you'll see that you have more light than I have.",
      "You can conquer all your worries and fears,",
      'With the sparkle you hold through all your tears."',
    ],
  },
];

const photographs = [
  { slug: "frame-1", image: "/photo-1.webp", caption: "Parrot", tint: "linear-gradient(140deg,#e8a35b,#7a3b2a 70%)" },
  { slug: "photo-2", image: "/photo-2.webp", caption: "Parrot", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-3", image: "/photo-3.webp", caption: "Parrot", tint: "linear-gradient(140deg,#2a2320,#5a1f16 80%)" },
  { slug: "photo-4", image: "/photo-4.webp", caption: "Parrot", tint: "linear-gradient(140deg,#d8b566,#1c2436 75%)" },
  { slug: "photo-5", image: "/photo-5.webp", caption: "Nature & Vehicles", tint: "linear-gradient(140deg,#a13d2c,#1b1512 78%)" },
  { slug: "photo-6", image: "/photo-6.webp", caption: "Parrot", tint: "linear-gradient(140deg,#eee4cf,#5a5540 70%)" },
  { slug: "photo-7", image: "/photo-7.webp", caption: "Nature & Vehicles", tint: "linear-gradient(140deg,#eee4cf,#5a5540 70%)" },
  { slug: "photo-8", image: "/photo-8.webp", caption: "Nature - autum", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-9", image: "/photo-9.webp", caption: "A View From Train", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-10", image: "/photo-10.webp", caption: "Fire", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-11", image: "/photo-11.webp", caption: "Kerela", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-12", image: "/photo-12.webp", caption: "Kerela", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-13", image: "/photo-13.webp", caption: "Sunset", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-14", image: "/photo-14.webp", caption: "The Kerela Cafe", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-15", image: "/photo-15.webp", caption: "Favourite Place,Cricket Ground", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
  { slug: "photo-16", image: "/photo-16.webp", caption: "Nature", tint: "linear-gradient(140deg,#3c5148,#0f1713 75%)" },
];

const pitchStats = [
  { label: "Matches", value: "146" },
  { label: "Runs", value: "5,812" },
  { label: "Highest score", value: "178*" },
  { label: "Hundreds", value: "11" },
];

const pitchLedger = [
  {
    tag: "District final, 2019",
    body: "Walked in at 34 for 4, left at 187 for 4. Kept the strike for eleven overs and didn't think about it until afterward.",
  },
  {
    tag: "Under lights, trial match",
    body: "Missed a straight one at 96. The photograph of the bails is better than the innings.",
  },
  {
    tag: "Club nets, monsoon week",
    body: "Rain won. Wrote three poems instead.",
  },
];

async function seed() {
  const existingPoems = await getPoems();
  if (existingPoems.length === 0) {
    for (let i = 0; i < poems.length; i++) {
      await createPoem({ ...poems[i], sortOrder: i });
    }
    console.log(`Seeded ${poems.length} poems.`);
  } else {
    console.log(`Poems table already has ${existingPoems.length} row(s) — skipping seed.`);
  }

  const existingPhotos = await getPhotographs();
  if (existingPhotos.length === 0) {
    for (let i = 0; i < photographs.length; i++) {
      await createPhotograph({ ...photographs[i], sortOrder: i });
    }
    console.log(`Seeded ${photographs.length} photographs.`);
  } else {
    console.log(`Photographs table already has ${existingPhotos.length} row(s) — skipping seed.`);
  }

  const existingStats = await getPitchStats();
  if (existingStats.length === 0) {
    for (let i = 0; i < pitchStats.length; i++) {
      await createPitchStat({ ...pitchStats[i], sortOrder: i });
    }
    console.log(`Seeded ${pitchStats.length} pitch stats.`);
  } else {
    console.log(`Pitch stats table already has ${existingStats.length} row(s) — skipping seed.`);
  }

  const existingLedger = await getPitchLedger();
  if (existingLedger.length === 0) {
    for (let i = 0; i < pitchLedger.length; i++) {
      await createPitchLedgerItem({ ...pitchLedger[i], sortOrder: i });
    }
    console.log(`Seeded ${pitchLedger.length} pitch ledger entries.`);
  } else {
    console.log(`Pitch ledger table already has ${existingLedger.length} row(s) — skipping seed.`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
