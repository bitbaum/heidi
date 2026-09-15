import type { Dictionary } from "./de.ts";

export const en: Dictionary = {
  meta: {
    title: "Heidi — understand Swiss German",
    description:
      "Understand what is actually spoken around you. Heidi decodes real messages, explains the words you do not know yet, and checks every reply against real dialect forms. Starting with Zurich German.",
  },

  nav: {
    home: "Start",
    chat: "Chat",
    grammar: "Grammar",
    dialect: "Dialects",
    vocabulary: "Vocabulary",
    method: "Method",
    contribute: "Contribute",
    about: "About",
    portal: "My space",
    settings: "Settings",
    groupUse: "Use it",
    groupWhy: "Why this way",
    groupProject: "Project",
    skipToContent: "Skip to content",
    menu: "Menu",
    language: "Choose language",
    langNational: "National languages",
    langDialect: "Dialect",
    langOther: "Other languages",
  },

  footer: {
    tagline: "Understand Zurich German, then take part.",
    builtOn: "Made in Zürich.",
    sections: "Pages",
    projectTitle: "Project",
    languageTitle: "Language",
    openSource: "Built in the open",
    openSourceNote: "We write down what we learn — including what did not work.",
    rights: "Heidi, Zürich.",
  },

  home: {
    headline: "Understand Swiss German. Then write like someone from here.",
    sub: "For people who already know German and still understand nothing at the lunch table.",
    dialectTitle: "We start with Zurich",
    dialectBody:
      "Swiss German is not one language but a family. Today Heidi is genuinely good at Zurich German, and would rather tell you that than pretend to cover everything. It is also exactly why the check rejects Bernese forms: not because Bernese is wrong, but because Zurich is what we are teaching right now. More dialects follow — each with its own voices and its own check.",
    dialectPlanned: "Planned",
    dialectOthers: "Other dialects",
    trustTitle: "Every line is checked before you see it",
    trustBody:
      "A language model asked for Swiss German will happily hand you Bernese, and you would have no way to tell. So at Heidi the model does not decide what counts as Zurich German. A fixed rule check does, and you can run it yourself.",
    trustLink: "Try the check",
    correspondencesTitle: "A dozen rules unlock hundreds of words",
    pillarsTitle: "How Heidi works",
    methodLink: "The full method",
    researchLink: "What the research says",
    contributeTitle: "We are looking for Zurich voices",
    contributeBody:
      "Every second of dialect you will hear in Heidi comes from a real person in Zurich. If you would let us record you speaking, get in touch.",
    contributeCta: "Take part",
  },

  chat: {
    emptyTitle: "Ask Heidi",
    placeholder: "Paste what you received — or write what you want to say.",
    composer: "Message Heidi",
    saveWord: "Keep this word",
    savedWord: "Kept",
    send: "Send",
    thinking: "Heidi is reading …",
    you: "You",
    exampleUnderstand: "What does it mean?",
    exampleCompose: "Write it for me",
    examples: [
      { kind: "dialect", text: "Im Kauz scho, hät mer nöd so gfalle. Du au?" },
      { kind: "compose", text: "Tell them I am running ten minutes late — friendly." },
      { kind: "dialect", text: "Häsch du am Samschtig scho öppis vor?" },
    ],
    glossTitle: "Words worth keeping",
    suggestionsTitle: "Try one of these",
    sendThis: "Send this",
    /**
     * The badge on a sendable line that is the WRITTEN standard rather than
     * dialect. The pair is the point: one to send a landlord, one to send a
     * friend, and no way to tell them apart without this.
     */
    writtenStandard: "written standard",
    copy: "Copy",
    copied: "Copied",
    flagged: "Not Zurich German:",
    checkedNote: "Checked against Zurich forms",
    mic: "Dictate",
    micStop: "Stop recording",
    micListening: "Listening …",
    micTranscribing: "Transcribing …",
    micProblem: {
      mic: "No access to the microphone. You can still type.",
      silence: "Nothing heard. Press the microphone again and start speaking right away.",
      unavailable: "Dictation does not work in this browser. You can still type.",
    },
    newChat: "New conversation",
    explanationsIn: "Explanations in English",
    notConfigured: "The language model is not configured on this deployment yet.",
    unreachable: "Could not reach Heidi. Check your connection and try again.",
    failed: "Heidi could not answer that just now. Try again in a moment.",
    retry: "Again",
    /**
     * The full-screen chat. Its own object so the homepage box — which shares
     * every other string in here — does not have to carry strings it never
     * renders.
     */
    full: {
      expand: "Open full screen",
      title: "Chat",
      yourChats: "Your conversations",
      noChats: "No conversations yet.",
      untitled: "Untitled",
      rename: "Rename",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      deleteAsk: "Delete this conversation?",
      deleteYes: "Delete for good",
      onThisDevice: "This conversation is only in this browser.",
      signInToKeep: "Sign in to keep it",
      adoptTitle: "Keep this conversation?",
      adoptBody: "You were writing before you signed in. Heidi can save that conversation to your account, or leave it here in the browser.",
      adoptKeep: "Yes, save it",
      adoptDiscard: "Leave it here",
      menuOpen: "Conversations",
      menuClose: "Close",
    },
    /**
     * The one-tap follow-ups. `label` is what the chip says; `say` is the
     * message it sends, which lands in the transcript as an ordinary turn —
     * a follow-up you cannot see is a conversation you cannot re-read.
     *
     * The ids come from `lib/domain/chat/moves.ts` and are a CLOSED set. The
     * model chooses which to offer; it never writes these words, because a
     * label the model invented arrives in whatever language it felt like and
     * can promise something pressing it does not do.
     */
    moves: {
      title: "What now?",
      reply: { label: "Write a reply", say: "How do I reply to this?" },
      grammar: { label: "The grammar behind it", say: "Explain the grammar behind that." },
      shorter: { label: "Shorter", say: "Say that more briefly." },
      warmer: { label: "Warmer", say: "Say that a bit more warmly." },
      firmer: { label: "Firmer", say: "Say that more firmly — I have already asked twice." },
      formal: { label: "More formal", say: "Write that more formally, for an official message." },
      casual: { label: "More casual", say: "Say that more casually, between friends." },
      simpler: { label: "Simpler", say: "Say that with simpler words." },
      swiss: { label: "In written German", say: "Write that in Swiss Standard German, not dialect." },
    },
  },

  model: {
    attach: "Attach a picture",
    attachNeedsKey: "Reading pictures needs your own model",
    remove: "Remove",
    connectTitle: "Connect your own model",
    connectLead:
      "Heidi is free, and the free models cannot read pictures. Add your own API key and Heidi can understand a screenshot — and answers better across the board.",
    whyTitle: "Why is that not just included?",
    whyBody:
      "Because reading a picture costs money per picture. Paying that for everyone would mean charging for Heidi. This way everything else stays free, and whoever wants more brings their own key.",
    safetyTitle: "Where your key goes",
    safetyBody:
      "It stays in this browser. With each message it is sent to us over an encrypted connection, used once at the provider, and dropped. We do not store it, never write it to a log, and never send it back.",
    providerLabel: "Provider",
    keyLabel: "API key",
    keyPlaceholder: "sk-…",
    modelLabel: "Model",
    getKey: "Get a key",
    test: "Connect and test",
    testing: "Checking …",
    connected: "Connected",
    connectedWith: "Connected with",
    failed: "That did not work",
    disconnect: "Remove key",
    canSee: "Can read pictures",
    textOnly: "Text only",
    open: "Your own model",
    imageTooBig: "That picture cannot be used.",
    imagesLabel: "Attached",
  },

  pillars: [
    {
      title: "Understanding comes first",
      body: "Listening before speaking. In Switzerland, understanding dialect and replying in Standard German is a complete and respected way to belong. It is also the only way to keep the input coming: the moment people notice you struggling, they switch to Hochdeutsch.",
    },
    {
      title: "Real life is the curriculum",
      body: "No invented exercises. The message that arrived this morning, the sentence from the lunch table, the refusal you have to write — that is the material. Heidi helps immediately, and notes what you did not know.",
    },
    {
      title: "Measured, not gamified",
      body: "No streaks, no points, no invented percentages. The number we want to show you is how much of an unfamiliar Zurich speaker you understand — before and after.",
    },
  ],

  method: {
    contents: "On this page",
    title: "The method",
    lead: "Heidi is built on what the research actually shows, rather than on what sells well as a language course. That leads to a few decisions that look strange at first.",
    sections: [
      {
        title: "The trap Heidi gets you out of",
        body: "You learn German, move to Zurich, and find it does not help. Dialect is spoken at the table, you understand almost none of it, and because it shows, everyone politely switches to Hochdeutsch or English. The very input that would make you better is withdrawn because you need it. Heidi is a source of dialect that does not switch away.",
      },
      {
        title: "Exposure beats rules",
        body: "In the largest study of how people understand closely related languages, sheer amount of exposure mattered more than any measure of linguistic distance. Grammar is not what decides it; how much you have heard is. So Heidi is not a course of lessons but a place where real dialect keeps arriving.",
      },
      {
        title: "Rules belong inside practice, not before it",
        body: "Chind, Huus, isch, guet — the sound rules are real and useful. But the only clean test of teaching them as a lesson up front showed no measurable effect. What does demonstrably work: telling someone what to listen for, right before they hear it again. So Heidi shows one rule at a time, always next to a concrete word.",
      },
      {
        title: "The test is always a new voice",
        body: "Getting used to one speaker is easy and proves nothing. What counts is whether it carries over to a voice you have never heard. So Heidi trains with many speakers and always tests with an unfamiliar one.",
      },
      {
        title: "Speaking comes last, and that is not a gap",
        body: "Adults rarely reach native pronunciation in a second dialect, and in Switzerland that matters less than almost anywhere: understanding dialect and replying in Standard German is normal and respected. So Heidi does not sell you listening practice as a fix for your speaking — the evidence for that is weak.",
      },
    ],
    loopTitle: "The loop",
    loopSteps: [
      "You receive something you do not understand.",
      "Heidi explains it immediately — completely, not as a puzzle.",
      "A word or two sticks, because it was explained when you needed it.",
      "The same words come back later, in a different sentence.",
      "Eventually you meet them out in the world, and Heidi is not there.",
    ],
    loopNote:
      "The last one is the goal. Most programmes want you to come back. A learning product should want you to need it less.",
  },

  research: {
    title: "What the research says",
    lead: "Language-learning products accumulate pseudoscience because “there is a study” turns very quickly into “this is proven” and then into a whole product. We keep three things apart: what is established, what we suspect, and what is simply a decision.",
    factTitle: "Established",
    factNote: "We rely on these.",
    hypothesisTitle: "Hypothesis",
    hypothesisNote: "Plausible, untested — and Heidi is the instrument.",
    decisionTitle: "Decision",
    decisionNote: "Product choices that stay right even if the hypothesis does not hold.",
    facts: [
      {
        claim: "Exposure beats linguistic distance.",
        detail:
          "Across 1,833 listeners and 70 language pairs, exposure to the test language mattered more than lexical, phonological or orthographic distance.",
        source: ["gooskens-2018"],
      },
      {
        claim: "Training with many voices is what carries over to unfamiliar ones.",
        detail:
          "Practising with a single voice can score better on that voice and fails to transfer. Confirmed specifically for regional dialects.",
        source: ["lively-1993", "clopper-2004"],
      },
      {
        claim: "Saying what to listen for is an active ingredient, not decoration.",
        detail: "Same material, same feedback: only the group cued to the relevant contrast learned it.",
        source: ["pederson-2010"],
      },
      {
        claim: "Retrieval with feedback beats rereading.",
        detail: "222 studies, 48,478 learners; g ≈ 0.50, and 0.54 with feedback against 0.37 without.",
        source: ["yang-2021"],
      },
      {
        claim: "Spaced practice beats massed, and the lead grows over time.",
        detail: "g ≈ 0.76 immediately, g ≈ 1.15 after a delay, across 48 experiments and 3,411 people.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "Captions help — after the listening attempt, not during it.",
        detail:
          "Large effect on vocabulary (g ≈ 0.87), apparently because text helps cut the stream of sound into words. Permanently visible text becomes a crutch.",
        source: ["montero-perez-2013"],
      },
      {
        claim: "Listening training improves your own speaking only weakly.",
        detail: "d ≈ 0.92 for perception, d ≈ 0.54 for production, with no correlation between the two.",
        source: ["sakai-moorman-2018"],
      },
      {
        claim: "Writing dialect is digitally normal in Switzerland, not slang.",
        detail: "That is why “write like someone from here” is a real competence and not a gimmick.",
        source: ["whatsup-uzh"],
      },
    ],
    hypotheses: [
      {
        claim: "Consonant rules may predict intelligibility better than vowel rules.",
        detail:
          "What is established is that phonetic distance predicts intelligibility better than lexical distance. The precise figures this page once used to set consonants against vowels are in no source we could open — so the claim sits here rather than under Established. Two of our four front-page rules are vowel rules, and so the weaker bet either way.",
        source: ["gooskens-2007"],
      },
      {
        claim: "Sound rules work as a cue inside practice even though they fail as a lesson.",
        detail:
          "The only clean test of the lesson form — 50 minutes of Dutch–Frisian — showed no significant effect, and the authors themselves warn against generalising it. The entire European intercomprehension tradition is, in the words of the leading researchers, essentially unevaluated. Our version is therefore the untested one. So we measure it.",
        source: ["bergsma-2014"],
      },
      {
        claim: "A short tuning session measurably improves comprehension of an unfamiliar voice.",
        detail:
          "What is established after about a minute is faster processing — not more words understood. So we do not claim that a minute makes you understand more.",
        source: ["clarke-garrett-2004"],
      },
    ],
    decisions: [
      "Listening before writing before speaking — justified by the language situation, not only by evidence.",
      "Measured rather than gamified. No streaks, no points.",
      "The test voice is always one you have not heard.",
      "Real Zurich recordings, because every available Zurich corpus is licensed for research only.",
      "The model never judges its own dialect.",
    ],
    honestyTitle: "Where we corrected ourselves",
    honestyBody:
      "This site once said the lesson form of the sound rules had been “tested and did not work”. A single 50-minute study does not carry that weight, and it made our own version look evidenced when it is the untested one. It also said there was no purchasable Swiss German speech synthesis; that is no longer true.",
  },

  check: {
    title: "Dialect check",
    intro: "A fixed list of rules — not a language model. It checks every line Heidi shows you. You can run the list yourself here.",
    placeholder: "Das isch nid güet, gäu",
    button: "Check",
    failed: "The check could not be reached. Please try again.",
    ok: "No foreign forms found. This can pass as Zurich German.",
    okShort: "Clean",
    failShort: "Found",
    suggests: "better",
    whyTitle: "Why this is not a detail",
    whyBody:
      "Bernese, Basel and Eastern Swiss forms are perfectly correct words — just not here. Someone learning Zurich German cannot, by definition, hear the difference. Which is exactly why that decision must not sit with a language model.",
    noteTitle: "About spelling",
    noteBody:
      "Zurich German has no official spelling. This check never tells you your spelling is wrong — only that a form comes from another region.",
  },

  contribute: {
    title: "We are looking for Zurich voices",
    lead: "Every second of dialect you will hear in Heidi comes from a real person in Zurich. That is expensive and slow, and we are doing it anyway.",
    whyTitle: "Why not just synthetic voices",
    whyBody:
      "The honest reason is not that Swiss German speech synthesis does not exist — by now it does. The reason is licensing. Every Zurich speech corpus we found is released for research and not for a product. Anyone who needs real, cleanly licensed, consented Zurich German has to record it themselves. On top of that there is what synthetic voices are bad at anyway: pace, mumbling, hesitation, the difference between two people from the same neighbourhood.",
    needTitle: "What we need",
    needList: [
      "People who grew up in the canton of Zurich, or have lived here a long time.",
      "Completely ordinary sentences — not reading literature aloud.",
      "Different ages, genders, neighbourhoods and speaking speeds.",
      "Twenty minutes of your time, at your place or ours.",
    ],
    consentTitle: "What happens to the recording",
    consentBody:
      "You stay in control. We tell you in advance what the recording will be used for, you can withdraw it, and consent for the product is not the same as consent for research. We assume you do not want the second unless you say so explicitly.",
    ctaTitle: "Get in touch",
    ctaBody: "A short message is enough. Tell us which part of the canton you are from.",
    ctaButton: "Write an email",
  },

  about: {
    title: "About Heidi",
    lead: "Heidi is made in Zürich, by people who had the same problem. We build in the open — including the parts that did not work.",
    sections: [
      {
        title: "Why it exists",
        body: "Because a great many people here take the same path: learn German, move over, and then find that the decisive part of the language is not written down anywhere. That is not a niche problem but the standard experience in this city.",
      },
      {
        title: "How we work",
        body: "We read what the research says first, and only then built. Three findings overturned the plan we would otherwise have shipped. What we learned is on the research page — including the places where we had to correct ourselves in public.",
      },
      {
        title: "What is still missing",
        body: "Today: understanding and replying to real text. Next: the listening lab, where you hear one Zurich voice, tune in, and we measure how much you catch of another. That needs recordings, and they are being made.",
      },
    ],
    stateTitle: "Where things stand",
  },

  settings: {
    title: "Settings",
    lead: "Everything Heidi knows about you, in one place — and all of it removable.",
    languageTitle: "Site language",
    languageBody: "Which language Heidi speaks to you in. What you are learning stays Zurich German.",
    modelTitle: "Language model",
    modelBody: "By default Heidi uses free models. Your own key unlocks pictures and improves the answers.",
    modelNone: "No model of your own connected",
    accountTitle: "Account",
    accountBody: "For saving your words and for study groups. Translating needs no account.",
    dataTitle: "What is held on this device",
    dataBody:
      "Your conversation stays in this tab and goes when you close it. A key of your own lives in this browser's storage until you remove it. None of it is on our servers. The words you keep live here too, until you remove them.",
  },

  auth: {
    signIn: "Sign in",
    signOut: "Sign out",
    signInWith: "Sign in with OrangeCat",
    account: "Account",
    portalTitle: "My space",
    portalLead:
      "Your words, when it is time to see them again — and what keeps catching you.",
    signedInAs: "Signed in as",
    notSignedIn: "You are not signed in",
    notSignedInBody:
      "Sign in so Heidi can remember what you did not know yet. Everything else keeps working without it — translating and the dialect check need no account.",
    whyTitle: "Why OrangeCat",
    whyBody:
      "Heidi keeps no user database of its own. Your identity lives at OrangeCat, where profiles and payment are already at home. That means one account across several products, no further password — and nothing here that could be stolen.",
    soonTitle: "What comes next",
    soonList: [
      "Tutors — voluntary, paid, and never required.",
    ],
    unavailable: "Signing in is not configured on this deployment yet.",
    errorTitle: "Signing in did not work",
    errorBody: "Something went wrong. Try again, or go back to the start.",
    tryAgain: "Try again",
  },

  vision: {
    title: "Where this goes",
    lead: "Swiss German is the beginning, not the destination. The method is not specific to Switzerland.",
    points: [
      {
        title: "There are many languages like this",
        body: "All over the world there are languages and dialects too small for a large course provider to care about — and which are at the same time exactly what you need in order to actually belong. You can have perfect command of the official language and still be on the outside at the table.",
      },
      {
        title: "This is precisely where the big providers fail",
        body: "Language courses follow the market, and the market follows speaker numbers. What is left behind is a few dictionaries, a few research corpora you are not allowed to use commercially, and no recordings to practise with. Heidi is built for that gap.",
      },
      {
        title: "The method transfers",
        body: "Adults who already command a related language do not have to start over — they have to relearn what they already own. That holds for Standard German and Zurich German as it does for many other pairs. Which is why in Heidi the language being taught is swappable configuration rather than something written into the code.",
      },
    ],
    closing:
      "Concretely: more Swiss German dialects first, then a language outside Switzerland — the same machine, a different language pack. What we learn on the way, we write down.",
  },

  errors: {
    notFoundTitle: "This page does not exist",
    notFoundBody: "Maybe the link is old, maybe we moved something.",
    backHome: "Back to the start",
  },
  /**
   * The grammar area. The FORMS live in the variety pack — `Ich bi gange` is
   * Zurich German whoever is reading — and the words that explain them live
   * here, keyed by the pack's topic id, because an explanation has to be
   * translated and a pack is English-source.
   *
   * A topic is small on purpose: one sentence of rule and the thing that
   * actually trips somebody who already reads German. The evidence this repo
   * cites is that these work as cues beside something you are about to meet
   * again, and fail as a lecture you sit through first.
   */
  /**
   * The dialect section. The INDEX explains what Swiss German is, which is
   * worth writing properly and is one page.
   *
   * The AREA pages carry no prose at all — an endonym, the cantons, a town,
   * the forms the gate knows and a source, all of it data. Eleven areas of
   * translated description would be seventy-seven blocks nobody can check, and
   * machine-translated linguistic claims are exactly how a reference page ends
   * up confidently wrong. Forms need no translation; the frame around them is
   * what is written here.
   */
  /**
   * The vocabulary page. The WORDS are in the variety pack — a form and its
   * German equivalent are not in any language — and only the frame is here:
   * a title, the note about which direction the page runs in, and a label per
   * group.
   */
  vocabulary: {
    title: "The words worth knowing first",
    lead: "Not the words for tourists, but the ones a sentence snags on: the short, constant ones no sound rule rescues.",
    note: "Direction: dialect → German. This is for understanding what was said, not for writing — what you should write yourself is over in the dialects section.",
    groups: {
      function: "Small words, large effect",
      verbs: "Verbs that turn up constantly",
      everyday: "Everyday things",
      greetings: "Greetings and politeness",
    },
  },

  dialect: {
    title: "Swiss German",
    lead: "What it is, why you cannot follow it even though you read German — and which dialect is spoken where.",
    spokenTitle: "Spoken, not written",
    spokenBody: "Swiss German is the spoken language of everyday life — and the written one between people who know each other: texts, WhatsApp, notes. Anything official is written in Swiss Standard German. Both are part of it, and somebody who has only one of them eventually sends a dialect message to their insurance company.",
    noStandardTitle: "No correct spelling",
    noStandardBody: "There is no official orthography. Two people write the same word differently and both are right. That is why Heidi never tells you your spelling is wrong — only how we write it.",
    notOneTitle: "Not one language",
    notOneBody: "Swiss German is not a single dialect but many. The differences are obvious to a local and completely invisible to a learner. Heidi teaches you Zurich German and says so, rather than pretending there is only one.",
    areasTitle: "The dialects",
    areasLead: "Dialect boundaries do not follow cantonal ones — hence points rather than areas. The cantons are listed because you know which one you are in.",
    cantons: "Cantons",
    marksTitle: "How to recognise them",
    marksLead: "Forms Heidi's own check actually tells apart. On the left the local form, on the right the Zurich one.",
    marksNone: "Heidi cannot yet recognise this dialect by specific forms. Nothing here, rather than something plausible.",
    taught: "This is the one you learn here",
    sourcesTitle: "Sources",
    backToAll: "All dialects",
  },

  grammar: {
    title: "Grammar",
    lead: "Four things that make Zurich German hard to follow for somebody who already reads German. Not lessons — just what you will hear, and where it catches you.",
    ruleLabel: "The rule",
    watchLabel: "Where it catches you",
    topics: {
      "no-preterite": {
        title: "No simple past",
        rule: "Spoken Zurich German has no preterite at all: everything past is said with the perfect.",
        watch: "You are waiting for ging, war, sagte — and it never comes. When you hear bi, hät or händ plus a participle, that IS the past.",
      },
      "wo-relative": {
        title: "wo instead of der, die, das",
        rule: "Relative clauses almost always start with wo, unchanging, whatever the gender or case.",
        watch: "You read wo as where? and lose the sentence. Here it means who, which or that — never a place.",
      },
      "possessive-dative": {
        title: "Possession the other way round",
        rule: "There is no genitive: possession is built from the dative plus a possessive, or with vo.",
        watch: "Em Peter sis Auto is not a mistake, it is the normal form. The person comes first, the thing after.",
      },
      "diminutive-li": {
        title: "The -li on everything",
        rule: "The -li diminutive is highly productive and often means nothing small at all.",
        watch: "Es Bierli is not a small beer, it is a beer said kindly. Do not take -li literally.",
      },
    },
  },

  saved: {
    title: "Your words",
    lead: "What you looked up and wanted to keep. It all lives in this browser, on this device — not with us.",
    empty: "Nothing kept yet.",
    emptyHint: "Ask Heidi about a sentence. Next to every explained word there is a plus that keeps it.",
    countLabel: "kept",
    remove: "Remove",
    clear: "Remove all",
    clearConfirm: "Really remove all?",
    exportLabel: "Save to a file",
    onThisDevice: "On this device only",
    savedOn: "Kept",
    openChat: "Look something up",
  },

  /**
   * The dashboard: spaced review, and what the learner's own list says about
   * them. No streak, no score, no percentage — HEIDI.md §8 names each of those
   * as the thing this must not become.
   */
  review: {
    title: "Due for review",
    lead: "Words you kept come back here — after a day, then three, then a week. Asking later works better than asking more often.",
    due: "due",
    none: "Nothing due today.",
    noneHint: "Come back tomorrow — or go and look something up.",
    empty: "No words to review yet.",
    emptyHint: "Keep a word during a conversation and Heidi will ask you about it later.",
    tomorrow: "due tomorrow",
    settled: "settled",
    prompt: "What does this mean?",
    show: "Show me",
    knew: "I knew it",
    missed: "Not yet",
    done: "That's today done.",
    patternsTitle: "What keeps catching you",
    patternsLead: "These regularities are in the words you kept. Not a score — just what is in your own list.",
    patternsCount: "of your words",
    recentTitle: "Pick up where you left off",
    recentEmpty: "No conversations yet.",
  },
  groups: {
    title: "Study groups",
    lead: "Practise with other people — Heidi is in the group. Write her name in the conversation when you want her to answer.",
    empty: "You are not in any group yet.",
    createTitle: "Open a group",
    createHint: "Give it a name. You will get a link to pass on.",
    namePlaceholder: "e.g. Wednesday supper",
    create: "Open",
    creating: "Opening …",
    open: "Open",
    members: "Members",
    inviteTitle: "Invite someone",
    inviteHint: "Whoever has the link can join. Only pass it on if you mean to.",
    copyLink: "Copy link",
    copied: "Copied",
    rotate: "Make a new link",
    rotateHint: "The old link stops working immediately.",
    joinTitle: "You have been invited",
    joinBody: "Sign in to join.",
    join: "Join",
    joining: "One moment …",
    joinFailed: "That link no longer works.",
    full: "That group is full.",
    signInFirst: "Sign in to use study groups.",
    composer: "Message the group",
    send: "Send",
    heidiHint: "Write “Heidi” when you want her to answer.",
    notConfigured: "Study groups are not configured on this deployment yet.",
    failed: "That did not work. Please try again.",
    back: "Back to your space",
  },
};
