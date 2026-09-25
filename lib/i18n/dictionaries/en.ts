import type { Dictionary } from "./de.ts";

export const en: Dictionary = {
  meta: {
    title: "Heidi — understand Swiss German",
    description:
      "Understand what is actually spoken around you. Heidi decodes real messages, explains the words you do not know yet, and checks every reply against real dialect forms. Starting with Zurich German.",
  },

  language: {
    notYet: "This text does not exist in English yet. You are reading it in",
    byDesign:
      "This text is in German and English only: it addresses people who live here. You are reading it in",
  },

  nav: {
    home: "Start",
    chat: "Chat",
    organisations: "For organisations",
    speaking: "Speaking",
    practice: "Exercises",
    listen: "Listen",
    grammar: "Grammar",
    dialect: "Dialects",
    essays: "Blog",
    paper: "White paper",
    roadmap: "Roadmap",
    changelog: "Changelog",
    vocabulary: "Vocabulary",
    situations: "Situations",
    method: "Method",
    technology: "Technology",
    contribute: "Contribute",
    about: "About",
    portal: "My space",
    settings: "Settings",
    privacy: "Privacy",
    impressum: "Legal notice",
    investors: "Investors",
    groupUse: "Use it",
    groupLearn: "Learn",
    groupPractise: "Practise",
    groupAbout: "About Heidi",
    skipToContent: "Skip to content",
    sections: {
      how: "How it works",
      record: "What we say",
      who: "Who is behind it",
    },
    contents: "Contents",
    menu: "Menu",
    language: "Choose language",
    langNational: "National languages",
    langDialect: "Dialect",
    langOther: "Other languages",
  },

  footer: {
    tagline: "Understand Zurich German, then take part.",
    place: "Canton of Zürich, Switzerland",
    varietyName: "Zurich German",
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
    learn: {
      title: "Learn from this",
      breakdownLabel: "Word by word",
      breakdown: "Explain «{text}» to me word by word.",
      similarLabel: "Similar and opposite",
      similar: "Which words mean something similar to «{word}» in Zurich — and what is the opposite?",
      storyLabel: "Short text with it",
      story: "Write me a short text in Zurich German using «{word}», with a translation.",
      otherWaysLabel: "Said differently",
      otherWays: "How else can «{text}» be said in Zurich German?",
      examplesLabel: "In other sentences",
      examples: "Give me three more sentences in Zurich German using «{word}», each with a translation.",
      aiNote: "The language model writes these answers in the chat, checked for Zurich forms.",
    },
    dock: {
      open: "Ask Heidi",
      close: "Close",
      title: "Heidi",
      lead: "Ask about whatever you are reading — or paste a message someone sent you.",
      prompts: [
        "How do I say in Zurich German that I will be late?",
        "What is the difference between dialect and written German here?",
        "Give me three words I will hear here every day.",
      ],
    },
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
    checkedNote: "No foreign dialect forms found",
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
    stop: "Stop",
    stopped: "Stopped. The half-finished answer was discarded — it had not been checked for Zurich forms yet.",
    failed: "Heidi could not answer that just now. Try again in a moment.",
    cannotSeePicture:
      "Heidi cannot read pictures right now. Send the text instead, or connect a model of your own that reads images.",
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
      decline: { label: "Say no politely", say: "Write that as a polite refusal." },
      apologise: { label: "Apologise", say: "Write that as an apology." },
      thank: { label: "Say thank you", say: "Write that as a thank-you." },
      ask: { label: "Ask back", say: "Turn that into a question back — I did not quite understand it." },
      swiss: { label: "In written German", say: "Write that in Swiss Standard German, not dialect." },
    },
  },

  model: {
    attach: "Attach a picture",
    attachNeedsKey: "Your connected model cannot read pictures",
    remove: "Remove",
    connectTitle: "Connect your own model",
    connectLead:
      "Heidi reads screenshots for free. Add your own API key and the answers get sharper — especially on a dense picture — and the calls run on your vendor rather than ours.",
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

  technology: {
    title: "What a computer can do with Swiss German",
    lead: "And what it cannot. This page collects what has actually been measured in the field — with the numbers and the sources, so you can check our claims against them.",
    hardTitle: "Why it is hard",
    hardBody: [
      "There is no official spelling. There are recommendations from 1938 that dialectology uses — but even trained transcribers apply them differently, and almost nobody writes that way to a friend.",
      "Dialect is spoken; the standard is written. So writing down what was said is not transcription here, it is translation — and that is how nearly every system that exists is built.",
      "And it is a small language in the sense that matters for data: the largest public collections are a few hundred hours, and almost all of them are licensed for research only.",
    ],
    corporaTitle: "Where the data comes from",
    corporaLead: "The public collections this field rests on. The direction column is the one to read: it shows that almost everything hears dialect and writes the standard.",
    asrTitle: "Understanding",
    asrLead: "Word error rate on the same test set, so the numbers can be compared. All of these produce Standard German — the figure says how well it translated, not how well it wrote dialect.",
    speakingTitle: "Speaking",
    speakingLead: "Here the marketplace misleads. What is sold as a Swiss German voice is usually Swiss Standard German — the written language, read aloud. Real dialect synthesis exists almost only in research.",
    modelsTitle: "Language models",
    modelsLead: "Whether a model really handles dialect, or whether that is only in the press release. Evaluated means somebody measured it and published the result.",
    heidiTitle: "What this means for Heidi",
    heidiBody: [
      "Dictation does not write dialect down. It writes what you want to say, in the language you already have — which is exactly what the research can do.",
      "Heidi reads aloud, but never claims to be speaking dialect. A synthesiser asked for Zurich German returns Swiss Standard German at best — so the voice says which it is, and stays silent rather than hand you an English voice reading Züritüütsch.",
      "The dialect check runs without a model. It is a fixed list of rules, not a language model, which is why it cannot start inventing things.",
    ],
    engineTitle: "Which model answers you",
    engineLead:
      "Read from the chain that actually takes the request, not from a sentence somebody wrote down once. Which is why nothing here can be a model that was retired months ago.",
    engineNotes: [
      "The order is not a ranking. The chain is ordered by scarcity: whoever has the least capacity is drained last. The first entry is the one with room today, not the best one.",
      "None of these models is the authority on Zurich German. The pack is. Every generated line passes a rule-based check before anybody sees it — and that check is not itself a model.",
      "With no key or no quota the route answers 503 and says so. It does not pretend to have an answer.",
    ],
    directionLabel: "Direction",
    directions: {
      "speech-to-standard": "dialect heard → standard written",
      "speech-to-dialect": "dialect heard → dialect written",
      "dialect-text": "dialect, written",
      "text-to-speech": "text → dialect spoken",
    },
    hours: "hours",
    speakers: "speakers",
    regions: "regions",
    licence: "licence",
    licences: { research: "research only", unpublished: "no licence published", textOnly: "text; audio on request" },
    wer: "word error rate",
    zeroShot: "no training",
    fineTuned: "fine-tuned",
    speakingNames: {
      swissVendors: "Swiss vendors offering dialect",
      commercial: "Commercial de-CH voices",
      eth: "ETH Zurich, Swiss Voice",
      vits: "T5 and VITS research pipeline",
      voiceCloning: "Voice cloning from podcasts",
    },
    weightsOpen: "weights published",
    weightsClosed: "weights not published",
    isDialect: "dialect",
    isStandard: "Swiss Standard German",
    evaluated: "dialect evaluated",
    notEvaluated: "dialect not evaluated",
    statusResearch: "research",
    statusService: "service",
    statusClosed: "closed down",
    evalTitle: "What Heidi measures when you speak",
    evalLead:
      "Speaking practice records you and reports what can actually be measured — and says which language it measured. There is no score out of a hundred anywhere.",
    evalNames: {
      delivery: "Delivery",
      fluency: "Speed and runs",
      words: "Words and forms",
      grammar: "Grammar",
      pronunciation: "Pronunciation score",
    },
    evalWhat: {
      delivery:
        "Where the sound was and where it was not: pauses, how long the longest one was, how much of the take you were actually speaking. This needs no transcript, which is why it works for a dialect nothing can write down.",
      fluency:
        "Syllables per second, and how long you go before stopping. Fluency in the research sense — how a thought comes out, not how good it sounds.",
      words:
        "Which words you chose, checked against the same fixed rule list the dialect check uses. Not a model's opinion.",
      grammar:
        "Agreement, cases, verb forms. Only ever from a transcript in the language you actually spoke — otherwise the correction is about words the machine invented.",
      pronunciation:
        "Not produced. A score against a native ideal is a judgement about a person, and no improvement in recognition would make it honest.",
    },
    evalVerdicts: {
      target: "on the dialect",
      bridge: "on Swiss Standard German",
      none: "not possible yet",
      refused: "deliberately not offered",
    },
    evalRefusedNote: "This is the one every competitor advertises. It is the row we leave empty on purpose.",
    evalFormLimit: "no forms judged above",
    evalSource: "in the code",
  },

  privacy: {
    title: "What happens to your words",
    lead: "Heidi reads messages people sent each other. That is sensitive, so this page says exactly what is kept where, and who else sees it.",
    bindingNote: "The German version is the binding one.",
    flowsTitle: "What is kept where",
    flowsLead: "Every row names the storage location, so you can check it yourself.",
    detail: {
      pictures: "downscaled in the browser; only a count is stored",
      speakingTranscription: "only when you choose Standard German; we do not keep the audio, and grammar is checked on our own server",
      speakingSuggestion: "only the sentence you confirmed",
      account: "only the identifier — no name and no address",
    },
    place: { device: "Your device only", server: "On our server", vendor: "At a vendor" },
    col: { what: "What", where: "Where", who: "Who else sees it" },
    nobody: "nobody else",
    flows: {
      draftConversation: "Conversation without an account",
      savedConversation: "Conversation with an account",
      savedWords: "Saved words",
      practiceSeen: "Questions already asked",
      practiceModel: "What you are still working on",
      streak: "Your streak and weekly goal",
      ownKey: "Your own API key",
      theme: "Light or dark appearance",
      dictationVerdict: "Whether dictation works in this browser",
      dictation: "Dictation",
      pictures: "Pictures",
      speakingTakes: "Speaking recordings",
      speakingTranscription: "Recording sent to be written down",
      speakingSuggestion: "Sentence sent to be checked",
      account: "Account",
      groups: "Study groups",
      feedback: "Feedback widget",
    },
    hostingTitle: "Where the server is",
    hostingNote: "Not in Switzerland. We would rather say so than have you find out.",
    vendorsTitle: "Who answers the messages",
    vendorsNote: "A message is sent to one of these companies to be answered. We hold no data-processing agreement with any of them. Heidi is therefore not suitable today for personal data from a profession bound by confidentiality.",
    broughtKeyNote: "With your own key the message goes to the vendor you choose instead.",
    notDoneTitle: "What we do not do",
    notDone: {
      analytics: "No analytics",
      advertising: "No advertising",
      profileSale: "No selling of data",
      trackingCookies: "No tracking cookies",
    },
    notDoneNote: "Checkable: the source is open, and a test keeps this claim current.",
    rightsTitle: "Deleting",
    rightsBody: "What is on your device you remove yourself, in settings. Saved conversations you delete in the chat, and the text really goes. For anything else, write to us.",
    contactTitle: "Contact",
    updatedLabel: "As of",
  },

  impressum: {
    title: "Legal notice",
    operatorLabel: "Operated by",
    contactLabel: "Contact",
    sourceLabel: "Source code",
    statusLabel: "Legal form",
    statusNote: "Heidi is not a registered company. The site is run privately and the source is open.",
    addressNote: "We will give a postal address as soon as there is one.",
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
    rolesTitle: "Four ways to take part",
    rolesLead:
      "Ordered by commitment, smallest first — and the smallest is worth the most to us. Each one says what already exists in the product for it today.",
    todayLabel: "As it stands",
    roleCta: "Write to us about this",
    roleSee: "Take a look",
    learnerTitle: "And if you are learning",
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
        body: "Today: understanding and replying to real text, hearing an answer read aloud, and a register of where dialect is actually spoken on air. Next: the listening lab, where you hear one Zurich voice, tune in, and we measure how much you catch of another. That needs recordings, and they are being made.",
      },
    ],
    stateTitle: "Where things stand",
  },

  settings: {
    appearanceTitle: "Appearance",
    appearanceBody: "Light, dark, or whatever your device is set to. The choice stays in this browser.",
    theme: { label: "Appearance", system: "Device", light: "Light", dark: "Dark" },
    title: "Settings",
    lead: "Everything Heidi knows about you, in one place — and all of it removable.",
    languageTitle: "Site language",
    languageBody: "Which language Heidi speaks to you in. What you are learning stays Zurich German.",
    modelTitle: "Language model",
    modelBody: "By default Heidi uses free models, which can read pictures. Your own key makes the answers sharper.",
    modelNone: "No model of your own connected",
    accountTitle: "Account",
    accountBody: "For saving your words and for study groups. Translating needs no account.",
    dataTitle: "What is held on this device",
    dataBody:
      "Your conversation stays in this browser — including after you close the tab — until you press New chat. Signed in, it is stored on our server instead. To be answered, every message goes to a model vendor. Your own key and saved words stay here only.",
    dataEmpty: "This browser holds nothing of yours.",
    dataForget: "Delete",
    dataExport: "Download everything",
  },

  auth: {
    sections: {
      focus: "What catches you out",
      mastered: "What you can do",
      review: "Review",
      recent: "Conversations",
      patterns: "Patterns",
      words: "Words",
      groups: "Groups",
      onward: "Onward",
    },
    menu: {
      portal: "Your words and conversations",
      settings: "Language, model, account",
    },
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
      "Concretely: more Swiss German dialects first, then a language outside Switzerland — the same machine, a different language pack. The spoken half travels with it: every one of these languages is heard far more often than it is written, and for every one of them there is media nobody has sorted into dialect and standard. What we learn on the way, we write down.",
  },

  voice: {
    speak: "Read aloud",
    stop: "Stop",
    unsupported: "This browser cannot read anything aloud.",
    claim: {
      swissStandard: "Swiss Standard German voice — not Zurich dialect.",
      german: "A voice from Germany. Your device has no Swiss one.",
      none: "This device has no German voice at all, so Heidi stays quiet rather than reading German with an English mouth.",
    },
    dialectCaveat:
      "A machine reading dialect spelling with a Standard German voice. Use it to find the word in the sentence, never to copy how it sounds.",
    settingsTitle: "Heidi's voice",
    settingsBody:
      "Nothing is ever spoken until you ask for it. No browser anywhere ships a Zurich voice — the closest any device offers is Swiss Standard German, and Heidi says which one you are hearing every time she speaks.",
    speakAnswers: "Read answers aloud",
    rate: "Speed",
    correctionTitle: "Corrections",
    correctionBody:
      "How much Heidi says about the words in a speaking take, after you have written down what you said. Never your spelling: Zurich German has no correct spelling, so there is nothing there to be wrong about — and never what you type in the chat, because a message somebody else sent you looks exactly like one you wrote.",
    correctionLevels: {
      off: "Say nothing",
      blocking: "Only what is not Swiss German at all",
      all: "Also forms from another dialect",
    },
    correctionHelp: {
      off: "Heidi answers and leaves your words alone.",
      blocking: "The usual setting. Things no Swiss German writes, such as ß.",
      all: "Adds Bernese and other regions — real words, in the wrong place.",
    },
    silence: {
      off: "Corrections are switched off.",
      spoken:
        "Heidi does not correct spoken words. What comes back from speech recognition is its spelling and not yours — it writes Standard German whatever you said — so flagging it would correct the machine and charge it to you.",
      clean: "Nothing to flag.",
    },
    cannotHear:
      "Heidi cannot tell you whether your accent is right. Nothing can, reliably, today. What she can do is understand you and answer.",
  },

  listening: {
    title: "Where to hear it",
    lead: "The Swiss make a great deal of radio, television and film in dialect, most of it free. Nobody tells a learner which of it is dialect at all — so that is the first thing every entry here says.",
    todayTitle: "If you have twenty minutes",
    todayBody:
      "Three to start with, different tomorrow. One of each kind, gentlest first, and all of them play outside Switzerland — a catalogue tells you what exists, which is not the same as telling you what to do now.",
    diglossiaTitle: "Half of Swiss media is not in dialect",
    diglossiaBody:
      "The evening bulletin is read in Standard German; the magazine straight after it is in dialect. An hour practised on the Tagesschau is an hour of the German you already have.",
    basisNote:
      "The labels come from the format of each programme. Nobody here has listened to all of them and written down what they heard, so these are careful inferences rather than measurements — and they will say so until somebody does that work.",
    spoken: { dialect: "Dialect", standard: "Swiss Standard German", mixed: "Both" },
    voices: { one: "One voice", few: "A few voices", many: "Many at once" },
    subtitles: { standard: "Standard German subtitles", auto: "Machine subtitles", none: "No subtitles" },
    scripted: "Read from a script",
    spontaneous: "Spoken on the spot",
    reachCh: "Plays only in Switzerland",
    about: "About this",
    medium: {
      podcast: "Podcasts",
      radio: "Radio",
      youtube: "YouTube",
      tv: "Television",
      series: "Series",
      film: "Films",
    },
    filmsTitle: "Which dialect you will hear",
    filmsBody:
      "Swiss film is not one accent. Every entry says which dialect area it comes from, so you can choose between the one spoken around you and the ones you will meet on a train. Bern is heavily represented because that is where most Swiss drama is made — and the Zurich features exist, and are here.",
    commentary: {
      "der-bestatter":
        "Bernese, and the series most people here have seen — the dialect a Swiss person will imitate if you ask them to do an accent.",
      "wilder":
        "Crime across several seasons and several dialect areas. Good for hearing that Swiss German is not one thing.",
      "tschugger":
        "Wallis German, which other Swiss people need subtitles for. A joke among Swiss people, and genuinely not where to start.",
      "neumatt":
        "Bernese, a farming family. The register of family arguments rather than of broadcasting.",
      "die-schweizermacher":
        "Zurich German from 1978 and still the film about becoming Swiss. The accent has moved since, which is itself worth hearing.",
      "mein-name-ist-eugen":
        "Bernese, and largely children speaking — slower and more clearly articulated than adult dialogue.",
      "der-goalie-bin-ig":
        "Dense Bernese, from a novel written in it. The title is a grammar lesson: the verb is `bin` and the pronoun comes last.",
      "achtung-fertig-charlie":
        "Army comedy, and the shared reference nearly every Swiss man under fifty has.",
      "bon-schuur-ticino":
        "A comedy whose premise is the language question itself — what happens when the country has to pick one.",
      "die-goettliche-ordnung":
        "Appenzell in 1971, women campaigning for the federal vote. Eastern Swiss dialect, and a piece of history you will be asked about: Appenzell Innerrhoden did not admit women to its Landsgemeinde until 1990, long after the film ends.",
      "zwingli":
        "Zurich's own reformation, in Zurich German. One of the few feature films in the variety this deployment actually teaches.",
      "wolkenbruch":
        "Zurich German with Yiddish beside it — a second lesson, about how close two languages can sit and still be two.",
      "platzspitzbaby":
        "Zurich German, the city's heroin years seen by a child. A hard subject and unusually clear speech.",
      "heidi-2015":
        "Made for children, so spoken slowly and plainly. Probably the easiest feature on this list, and set in Graubünden rather than spoken in its dialect.",
      "seitentriebe":
        "Everyday Swiss German between couples — the half-sentences and interruptions that broadcast speech irons out.",
    },
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
    keptTitle: "Words you kept",
    keptNone: "Tap + to keep a word. Heidi will ask you about it later.",
    keptSome: "in review",
    practise: "Review now",
    askLabel: "Show it in a sentence",
    askSay: "Show me «{word}» in two short everyday sentences.",
    title: "The words worth knowing first",
    lead: "Not the words for tourists, but the ones a sentence snags on: the short, constant ones no sound rule rescues.",
    note: "Direction: dialect → German. This is for understanding what was said, not for writing — what you should write yourself is over in the dialects section.",
    groups: {
      function: "Small words, large effect",
      verbs: "Verbs that turn up constantly",
      everyday: "Everyday things",
      greetings: "Greetings and politeness",
      helvetisms: "Words you think you already know",
      slang: "Slang, casual and rude",
    },
    register: { casual: "casual", rude: "rude" },
    mistakenForLabel: "Not: {assumed}",
    articleLabel: "Article",
    formsLabel: "Forms",
    exampleLabel: "In a sentence",
    filterLabel: "Filter the words",
    filterPlaceholder: "Type dialect or German …",
    noMatches: "No word matches that.",
    clearFilter: "Clear",
    practiseGroup: "Practise this group",
    jumpLabel: "Jump to",
    saidInTitle: "Said in",
  },

  streak: {
    title: "Your streak",
    start: "Start today — a few questions is enough.",
    doneToday: "Practised today.",
    weekReached: "Weekly goal reached.",
    goalLabel: "Weekly goal",
    freezes: "A missed day is bridged automatically ({n} left).",
    practise: "Practise now",
    days: {"one": "{n} day in a row", "few": "{n} days in a row", "many": "{n} days in a row", "other": "{n} days in a row"},
    best: {"one": "Best: {n} day", "few": "Best: {n} days", "many": "Best: {n} days", "other": "Best: {n} days"},
    goalDays: {"one": "{n} day a week", "few": "{n} days a week", "many": "{n} days a week", "other": "{n} days a week"},
    week: {"one": "This week: {n} of {goal} day", "few": "This week: {n} of {goal} days", "many": "This week: {n} of {goal} days", "other": "This week: {n} of {goal} days"},
  },
  practice: {
    title: "Exercises",
    lead: "A short set of questions, a few minutes. Built from the rules Heidi applies herself, from the lines people actually say — and from the words you kept.",
    note: "What you keep stays in your browser. The questions from the vocabulary need no account.",
    start: "Start",
    restart: "Again",
    progress: "Question {n} of {total}",
    secondTry: "Second attempt",
    skip: "Skip",
    show: "Show me",
    knew: "Knew it",
    missed: "Ask again",
    next: "Next",
    explain: {
      show: "Explanation",
      ruleTitle: "The rule",
      watchTitle: "Where it catches",
      contextTitle: "In the conversation",
      wordTitle: "The word",
      saidInTitle: "Also said in",
      askTitle: "Carry on with Heidi",
      moreOnTopic: "More on this topic",
      practiseTopic: "Practise exactly this",
      openScene: "Whole situation",
      practiseScene: "Practise this situation",
      practiseWord: "Practise this word",
      alsoInPack: "The pack also has: {words}",
    },
    right: "Right",
    wrong: "Not quite",
    ask: {
      pairTarget: "Which one is Zurich German?",
      pairBridge: "Which one would you write in Switzerland?",
      article: "Which article does it take?",
      form: "Which form fits?",
      cloze: "Which word is missing?",
      recall: "What does this mean?",
      match: "Which go together?",
      gaptext: "Which words are missing?",
      pick: "Which word belongs here?",
      translate: "How do you say that in Zurich German?",
      card: "Do you still know this one?",
    },
    matchHint: "Tap a word, then its meaning.",
    gapHint: "Tap a word — it drops into the next gap. Tap a filled gap to take it back.",
    check: "Check",
    typeLabel: "Write it yourself — optional",
    typePlaceholder: "Type your answer …",
    youWrote: "You wrote",
    translateLabel: "Write it in Zurich German",
    packSays: "The pack says",
    spellingNote:
      "Zurich German has no settled spelling. Written differently is not written wrongly — compare the two yourself and decide.",
    cardRecognise: "Dialect → meaning",
    cardProduce: "Meaning → dialect",
    cardTurn: "Turn over",

    modeTitle: "How do you want to practise?",
    modeMixed: "Mixed",
    modeMixedNote: "All of it, shuffled — the ordinary way.",
    modeTap: "Tapping",
    modeTapNote: "Choosing only. No keyboard, one hand is enough.",
    modeWrite: "Writing",
    modeWriteNote: "Type whole sentences yourself. You do the comparing.",
    modeCard: "Cards",
    modeCardNote: "Word on the front, meaning on the back. The fastest.",

    flowTitle: "Practise or test?",
    flowPractice: "Practise",
    flowPracticeNote: "The answer and the explanation right after each question.",
    flowTest: "Test",
    flowTestNote: "Every question first, then every answer with its explanation.",

    testLead:
      "{total} questions in a row. Heidi says nothing as you go — the answers and the explanations all arrive at the end.",
    testOnlyObjective:
      "A test only asks questions that can be marked outright. Writing and cards are marked by you, which you can practise but nobody can measure.",
    testStart: "Start the test",
    testProgress: "{n} of {total}",
    testAnswer: "Record answer",
    testTimerOff: "No clock",
    testTimerSet: "{n} min",
    testTimerAdd: "+{n} min",
    testTimerLabel: "Put a clock on it?",
    testTimerLeft: "{time} left",
    testTimeUp: "Time is up. Everything you answered is below.",
    testDone: "Finish",
    testResultsTitle: "Your answers",
    testResultsCount: "{right} of {asked} right first time",
    testResultsLead: "Every question again, with what you chose and the way to where it is explained.",
    testYourAnswer: "You chose",
    testCorrectAnswer: "The answer is",
    testUnanswered: "Not answered",
    testAgain: "Another test",
    focusTitle: "What is catching you out",
    focusEmpty:
      "Nothing yet. Once you have answered a few questions, this is where what keeps catching you out appears — and one tap practises exactly that.",
    focusLead: "These keep coming back wrong for you. One tap practises only those.",
    scopedTo: "Just: {what}",
    scopeAll: "Practise everything",
    scopeEmpty:
      "There are no questions for this yet. That does not mean the topic is unimportant — only that the pack has no examples for it so far.",
    origin: "The other one is {origin}.",
    persons: {
      ich: "I",
      du: "you",
      er: "he / she / it",
      mir: "we",
      ihr: "you (plural)",
      si: "they",
      plural: "plural",
      past: "past",
    },
    grammarLink: "The grammar behind this",
    wordLink: "This word in the vocabulary",
    ruleLink: "The rule behind it",
    situationLink: "The situation it comes from",
    doneTitle: "That is the set.",
    doneAsked: "asked",
    doneRight: "first time",
    doneAgain: "coming back",
    againTitle: "Worth another look",
    whyTitle: "Why the exercises are built this way",
    whyLead:
      "Every decision here can be checked. Where the research gives a direction and not a number, the number is marked as our judgement — not as a finding.",
    why: [
      {
        claim: "Being asked beats looking again.",
        detail:
          "So no exercise shows the answer first. Across 222 studies the advantage of quizzing over restudying is g ≈ 0.50.",
        source: ["yang-2021"],
      },
      {
        claim: "Later beats sooner — and the advantage grows with time.",
        detail:
          "So a kept word comes back after 1, 3, 7, 16 and 35 days rather than daily. In a second-language meta-analysis: g ≈ 0.76 on immediate tests, g ≈ 1.15 on delayed ones.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "Right once is not enough; right twice, spaced, is the point.",
        detail:
          "So a missed question comes back before the sitting ends — three questions later, not immediately. The gap of three is our estimate: the study gives the direction, not the number.",
        source: ["rawson-dunlosky-2011"],
      },
      {
        claim: "Choosing without feedback can fix the wrong form in place.",
        detail:
          "So every multiple-choice question shows the right answer at once and asks again later. Feedback increases what such tests are worth and reduces exactly that harm.",
        source: ["butler-roediger-2008"],
      },
      {
        claim: "Producing it yourself sticks better than reading it.",
        detail:
          "So there are gapped sentences and open questions, not only choices. The effect is robust but smaller than its reputation suggests.",
        source: ["bertsch-2007"],
      },
      {
        claim: "Mixing helps — but not always, and we say so.",
        detail:
          "So no two questions of the same kind follow each other. The meta-analysis is clear: the benefit depends on how similar the material is, and on very similar material mixing can hurt.",
        source: ["brunmair-richter-2019"],
      },
      {
        claim: "No streaks, no points, no percentage.",
        detail:
          "A streak measures how much Heidi you consumed while looking like a measure of learning. What is here are counts of what you did.",
        source: ["yang-2021"],
      },
    ],
    whyMore: "The whole method",
    savedHint: "In the chat, keep a word with +. It comes back here when it is due.",
  },

  essays: {
    title: "Blog",
    lead: "Why German-speaking Switzerland sounds the way it does. Longer pieces, with their sources — for the questions that do not fit on a map.",
    none: "Nothing here yet.",
    backToAll: "All pieces",
    notTranslated: "This piece is not in English yet. You are reading it in",
    sourcesTitle: "Sources",
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
    groupsTitle: "The three branches",
    groupsLead:
      "The Alemannic dialects fall into three groups. The boundaries are not cantonal: they are sound changes that stopped in different places.",
    groups: {
      low: {
        name: "Low Alemannic",
        body: "The north — in Switzerland, essentially Basel alone. Here initial k stayed k; everywhere else in German-speaking Switzerland it became ch. You hear it on your first day.",
      },
      high: {
        name: "High Alemannic",
        body: "The Mittelland and the east: Zurich, Bern, Aargau, Solothurn, St. Gallen. The largest group — and the one people mean when they say “Swiss German”.",
      },
      highest: {
        name: "Highest Alemannic",
        body: "The alpine valleys: Valais, Glarus, Uri and Unterwalden, the Walser settlements. The most conservative and the hardest for an outsider, because old forms survive here that vanished from the Mittelland long ago.",
      },
    },
    groupLabel: "Branch",
    groupSpansTitle: "On both sides of the line",
    groupSpans:
      "This area sits on both sides of the line and belongs to no single branch. So we name none, rather than pick one that would look tidy.",
    diagnosticTitle: "The line that draws it",
    diagnosticInside: "In this branch",
    diagnosticOutside: "Next door",
    diagnosticStandard: "Standard German",
    hearTitle: "What it sounds like",
    hearLead: "Programmes and films in which this dialect is mostly what you hear. Checked links — we record nothing ourselves.",
    hearNone:
      "Nothing checked in the register for this dialect yet. Better nothing than a link nobody has listened to.",
    hearAll: "Every listening source",
    whyManyTitle: "Why so many?",
    whyManyBody:
      "Switzerland kept its dialects where Germany largely lost its own. That is neither an accident nor a matter of mountains: it has to do with how a state was built, with school, and with broadcasting.",
    whyManyLink: "The whole story",
    backToAll: "All dialects",
    aroundTitle: "Where this one sits",
    aroundLead:
      "Computed from the branch, the cantons and the reference town — no new claims about the dialect itself.",
    nearestTitle: "Closest",
    siblingsTitle: "Same branch",
    kmAway: "{km} km",
    marksInstead: "Start with {area} instead, {km} km away — Heidi knows forms from there",
  },

  grammar: {
    practiseLabel: "More examples",
    practiseSay: "Give me two sentences to practise «{word}» — then test me on one.",
    title: "Grammar",
    lead: "What makes Zurich German hard to follow for somebody who already reads German — first the things a sentence fails on outright, then the things you will understand but would never say yourself.",
    ruleLabel: "The rule",
    watchLabel: "Where it catches you",
    bands: {
      blocks: {
        title: "The sentence does not survive these",
        lead: "Without them the listening does not start. You wait for a form that never comes, or read a word as something else entirely — and the rest of the sentence is gone.",
      },
      marks: {
        title: "You follow these — you would never say them",
        lead: "These give you no trouble when listening. Never using them yourself is what keeps somebody sounding like Standard German with Zurich words in it.",
      },
    },
    allTopics: "All topics",
    practiseTopic: "Practise this topic",
    whereTitle: "Where this actually comes up",
    whereLead: "The same structure, in sentences people actually say.",
    prevLabel: "Previous",
    nextLabel: "Next",
    topics: {
      "question-words": {
        title: "Question words — and the trap among them",
        rule: "wänn, wo, was, wie, weer. Most are recognisable; one is not.",
        watch: "«Wänn» sounds like German «wenn». You hear a condition where a question was asked — and your answer then fits something nobody asked.",
      },
      "indefinite-article": {
        title: "en, e, es — the indefinite article",
        rule: "«en» with a masculine word, «e» with a feminine one, «es» with a neuter one.",
        watch: "«es» looks like the pronoun «es». «Bruuched Sie es Säckli?» is not «do you need it», it is «do you need a little bag».",
      },
      imperative: {
        title: "Commands and requests: the polite form ends in -ed",
        rule: "With du it is the bare stem: «Chumm». With Sie it takes -ed: «Chömed Sie».",
        watch: "You will follow both. Somebody who says «Chömen Sie» is also understood — and placed as not from here at once.",
      },
      "no-preterite": {
        title: "No simple past",
        rule: "Spoken Zurich German has no preterite at all: everything past is said with the perfect.",
        watch: "You are waiting for ging, war, sagte — and it never comes. When you hear bi, hät or händ plus a participle, that IS the past.",
      },
      articles: {
        title: "de, d, s — that is the whole set",
        rule: "Three articles and no others: «de» for masculine, «d» for feminine, «s» for neuter. «der», «die» and «das» do not occur.",
        watch: "They look like swallowed German articles but they are the full form, not a lazy contraction. And the gender does not always match the German one: «s Rüebli» is neuter where the German carrot is feminine.",
      },
      "wo-relative": {
        title: "wo instead of der, die, das",
        rule: "Relative clauses almost always start with wo, unchanging, whatever the gender or case.",
        watch: "You read wo as where? and lose the sentence. Here it means who, which or that — never a place.",
      },
      "unified-plural": {
        title: "One verb form for the whole plural",
        rule: "We, you and they all take the same form of the verb: «mir händ», «ihr händ», «si händ».",
        watch: "You look for the ending that marks the second person plural and it is never there. «Chömed er?» is «are you coming?» — the ending tells you nothing about who, only the pronoun does.",
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
      "am-progressive": {
        title: "«am» plus the verb — in the middle of it",
        rule: "What is happening right now is said as «bi/isch/sind am» plus the plain verb: «Ich bi am schaffe».",
        watch: "German has no such form and reaches for «gerade» instead. You will follow the sentence without it — but never using it is what keeps you sounding like standard German with Zurich words in it.",
      },
      "go-cho-infinitive": {
        title: "«go» and «cho» before the second verb",
        rule: "Going somewhere to do something puts a «go» in front of it, coming puts a «cho»: «Ich gang go poschte».",
        watch: "There is no such word in German, so people leave it out — and are understood and placed as foreign in the same breath. It is not a second «go», it belongs to the verb after it.",
      },
      "modal-particles": {
        title: "«gäll», «halt», «äbe» — where the speaker stands",
        rule: "These small words change no fact, only the position behind it: «gäll» asks you to agree, «halt» means nothing can be done, «äbe» says that is exactly the point.",
        watch: "German has «eben», and «gell» is alive in the south — what is new is mostly how often they come, and «dänk», which has no German equivalent. You will follow the sentence without them. You just will not hear whether you were agreed with or asked something.",
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
    noneFree: "The schedule is up to date. If you want to keep going now, this way:",
    nonePractise: "A short sitting",
    noneCards: "Cards",
    noneAsk: "Paste a message",
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
    patternsEmpty:
      "Nothing to show yet. Once you have kept a few words, this is where the sound correspondences that keep turning up in them appear — that a German k becomes ch, for instance. Read off your own list; nothing is measured about you.",
    masteredTitle: "What you can do now",
    masteredCount: "{n} things hold",
    masteredLead:
      "Not a count of how often you have been here — a count of what you now get right. Asked at least four times, and almost always answered.",
    masteredEmpty:
      "Nothing yet. Once something has been asked four times and you have almost always had it, it appears here. It counts what you can do, not how often you turned up.",
    masteredTopics: "Grammar",
    masteredWords: "Words",
    masteredGroups: "Word groups",
    masteredScenes: "Situations",
    masteredNote:
      "This says something about this pack, not about Swiss German as a whole. These hold — it does not follow that a conversation in Zurich will.",
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
  speaking: {
    title: "Speaking",
    lead: "Speak out loud, alone, now — and have what can be measured, measured. Below that: webinars and conversation circles on topics you propose.",
    signInFirst: "Sign in to propose a topic and join a round.",
    roundFull: "This round is full.",
    notConfigured: "Speaking rounds are not set up on this deployment.",
    failed: "That did not work just now. Please try again.",

    roundsTitle: "Coming up",
    roundsEmpty: "No rounds scheduled yet. Open the first one.",
    webinar: "Webinar",
    circle: "Circle",
    webinarHint: "One person speaks, the others listen.",
    circleHint: "Everyone gets the floor. Eight people at most.",
    once: "Once",
    weekly: "Every week",
    fortnightly: "Every two weeks",
    hostedBy: "by",
    attending: "coming",
    full: "Full",
    join: "I will come",
    leave: "Cannot make it",
    live: "On now",
    joinRoom: "Join the room",
    noRoom: "The room link is still to come.",
    cancelRound: "Call it off",
    cancelled: "Called off",

    openTitle: "Open a round",
    openHint: "You are the host, and the first name on the list.",
    roundTitleLabel: "What is it about?",
    whenLabel: "When",
    durationLabel: "Length",
    minutes: "minutes",
    formatLabel: "Shape",
    cadenceLabel: "Repeat",
    linkLabel: "Room link",
    linkHint: "An https link to your meeting room. Heidi carries no video of its own — it schedules the round and practises with you before and after.",
    open: "Open it",
    opening: "Opening …",

    boardTitle: "Proposed topics",
    boardLead: "What do you want to talk about? Topics come from the people in the room, not from us.",
    boardEmpty: "No proposals yet. Suggest something you actually want to talk about.",
    proposeTitle: "Propose a topic",
    topicTitleLabel: "The topic",
    topicTitlePlaceholder: "e.g. What people really say at the station",
    pitchLabel: "Why is this worth an hour?",
    pitchPlaceholder: "One line is enough.",
    propose: "Propose it",
    proposing: "One moment …",
    wouldCome: "would come",
    imIn: "I would come",
    imOut: "Changed my mind",
    scheduled: "Scheduled",
    scheduleIt: "Turn it into a round",

    practiceTitle: "Practise out loud",
    practiceLead: "Record yourself talking about something. A minute is enough.",
    record: "Record",
    stop: "Done",
    recordingNow: "Recording",
    again: "Again",
    micDenied: "This needs the microphone. Allow it from your browser address bar.",
    micUnsupported: "This browser cannot record. Try it on your phone, or in another browser.",
    measured: "Measured",
    varietyLabel: "Which language are you practising?",
    varietyBridge: "Swiss Standard German",
    varietyMeasuresOnly: "Heidi measures the recording on your device. You type the sentence yourself — no system writes Zurich German down reliably.",
    varietyTranscribes: "Heidi writes it down and can talk about your words. The recording goes once to a service for that, and is not kept there.",

    recordedFor: "recording",

    spokeFor: "speaking",
    pauseLabel: "pauses",
    longestLabel: "longest pause",
    runLabel: "at a stretch",
    rateLabel: "syll./sec.",
    wordsLabel: "words",
    seconds: "s",

    saidTitle: "What did you say?",
    saidWhy: "No system writes down Swiss German reliably. The best of them translate the dialect into Standard German and throw away exactly what you are learning. So you type your own line — and writing it out is half the exercise anyway.",
    saidPlaceholder: "Write your sentence the way you said it.",
    saidCheck: "Check it",
    checking: "Checking …",

    heardTitle: "This is what we heard",
    heardWhy: "A machine wrote that, not you. Correct whatever is wrong — what gets measured is the text you stand behind.",
    heardPlaceholder: "What the machine made of it goes here.",
    hearing: "Listening back …",
    heardFailed: "Listening back did not work. Type your sentence instead — the measurement above stands either way.",
    grammarTitle: "Grammar",
    grammarClean: "Nothing a listener would notice.",
    grammarNotChecked: "Grammar was not checked this time.",
    grammarAlternatives: "Several possibilities — which one fits depends on what you meant to say.",
    grammarMore: "The first {shown} of {total}.",
    grammarLimit: "Checks agreement, case and verb forms. It does not catch everything — word order after «weil», for one.",
    hesitationTitle: "Where you searched for a word",
    hesitationBefore: "{s} s before «{word}»",
    hesitationNote: "The word after a long pause is often the one you were reaching for.",

    feedbackTitle: "What came back",
    suggestionTitle: "How it would be said here",
    noSuggestion: "Heidi has nothing to add right now. The measurements above still stand.",
    flaggedSuggestion: "Careful: this suggestion contains a form our own check flags.",
    foreignForm: "“{form}” is {origin}. Here people say “{suggest}”.",
    foreignFormPlain: "“{form}” comes from another dialect ({origin}).",
    noScore: "Heidi gives no mark. What you see is measured: how long you spoke and where the pauses fell — and which words come from another dialect. There is nothing here about your pronunciation, because nobody can measure that honestly.",

    notes: {
      recordingTooShort: "Too short to say anything about. Record a few sentences.",
      recordingTooQuiet: "We heard almost nothing. Check the microphone and speak a little closer to it.",
      recordingClipped: "The signal was clipping. Move back from the microphone a little — an equipment problem, not a speaking one.",
      longestPause: "Your longest silence ran {n} seconds. If you want to shorten those: say the sentence in fewer words rather than hunting for the right one.",
      noLongPauses: "No long silences — you got through without getting stuck.",
      fewerPausesThanBefore: "{n} fewer pauses than last time.",
      morePausesThanBefore: "{n} more pauses than last time. That may be the topic.",
      longerRunsThanBefore: "You spoke {n} seconds longer at a stretch than before.",
      nothingFlagged: "No forms from another dialect found.",
      shareOfRecording: "{n}% of the recording had speech in it. The rest was silent — that can be thinking, or a microphone that heard too little.",
      huntingForWords: "When you were speaking, you were speaking briskly — the time went into the pauses. That is word-hunting rather than slowness: say the same thing again straight away and the hunting drops out.",
      cameStraightThrough: "You came through without hunting for words. Next time take a topic you have never said out loud.",
      filledPauses: "{n} filled pauses (“uh”, “um”). Native speakers do it constantly — counted, not corrected.",
      spokeTargetInBridge: "There were dialect words in there, although you were practising Standard German. In Zurich that happens all the time and it is not a mistake — just worth knowing if you mean to speak Standard German at a counter.",
    },

    historyTitle: "Your recordings",
    historyUnwritten: "No text — measured only.",
    deleteTake: "Delete",
    progressDays: "days spoken",
    progressTakes: "recordings",
    progressSpoken: "spoken",
    progressSeconds: "sec",
    progressMinutes: "min",
    progressNote: "Counted, not graded. This number never falls — a fortnight away costs nothing.",
    privacy: "The sound never leaves your device. What is kept is the measurements and your own text — in this browser, not with us.",
    privacyTranscribed: "In this language the recording goes once to a service that turns it into text, and is not kept there. What stays with us is the measurements and the text — in this browser.",
  },

  paper: {
    checkLabel: "Check this yourself",
    sourcesTitle: "Sources",
  },

  changelog: {
    title: "Changelog",
    lead: "What changed, dated — and in the words of somebody using it.",
    note: "Not a git log. The repository is public and anybody who wants every commit can read them there. This is what a person would have noticed — mistakes included, because a changelog with no embarrassing rows in it is proof that «we publish the parts that did not work» is decorative.",
    tags: {
      feature: "New",
      improvement: "Better",
      fix: "Fixed",
      platform: "Platform",
      breaking: "Breaking",
    },
  },

  organisations: {
    title: "For organisations",
    lead: "Where dialect is not your problem but your people's.",
    momentLabel: "The moment",
    stakeLabel: "What it costs",
    offerLabel: "What Heidi does",
    unknownLabel: "What we would have to ask you",
    chooseSector: "Your sector",
    allSectors: "All sectors",
    readMore: "Read on",
    startTitle: "What happens if you write",
    noCustomers: "Heidi has no customers today, no pilots and no case studies — and this page claims none. What is here is a description of your problem as well as we know it from outside. Tell us where we have it wrong.",
    talk: "Write to us",
  },

  situations: {
    title: "Where you need it",
    lead: "Not sorted by part of speech but by the moment: what is actually said in that situation, in the order it arrives.",
    note: "The direction is the same as everywhere here — understanding first. Most of these lines are said to you; the few you would say yourself are marked.",
    verified: "Every line is machine-verified against Zurich forms, and its words are attested in the Schweizerisches Idiotikon.",
    hear: "You hear this",
    say: "You say this",
    linesLabel: "lines",
    heardLabel: "to understand",
    grammarLabel: "What keeps coming up here",
    practiseLabel: "Practise now",
    backLabel: "All situations",
    strength: {
      title: "How far you are here",
      new: "Not started",
      met: "Started",
      steady: "Most of it holds",
      sure: "You can follow this situation",
      claim: "You understand Zurich German in this situation — checked against all {total} lines that come up here.",
      progress: "{held} of {total} lines hold",
      stuckNote: "{stuck} of them came back after a gap and still held.",
      remainingTitle: "Still to go",
      drill: "Practise this situation",
      drillAgain: "Keep practising",
      noneYet: "Practise this situation and this will say how far you are.",
      localOnly: "Your browser works this out. It does not leave this device.",
      boardTitle: "Where you are strong",
      boardLead: "Situation by situation. You can be sure in a care home and lost in a restaurant — that is not a contradiction, it is the point.",
      weakest: "This is where practice pays most right now",
    },
    domains: {
      everyday: {
        title: "Everyday Zurich",
        lead: "The shop, the tram, the stairwell, the telephone, the lunch table. Situations almost everybody is in every week — and where the room switches to Standard German the moment it notices you are struggling.",
      },
      care: {
        title: "Care and nursing homes",
        lead: "A resident with dementia loses her second languages first. What is left is the Zurich German of her childhood — and that is the language the shift runs in.",
      },
    },
    scenes: {
      restaurant: {
        title: "At the restaurant",
        scene: "Four fixed questions and one that decides the bill. «Zäme oder separat» is asked once, quickly, and getting it wrong is noticed by the whole table.",
      },
      "at-work": {
        title: "At work",
        scene: "The meeting runs in Standard German or English. The corridor, the coffee machine and the moment something is actually decided do not.",
      },
      "school-parents": {
        title: "At the kindergarten",
        scene: "Kindergarten in the canton of Zurich is conducted in dialect — the electorate decided that in 2011. A parent who learned Standard German finds out at the parents' evening, in front of everybody.",
      },
      shopping: {
        title: "At the shop",
        scene: "Four questions, the same ones every time, at a till with a queue behind you — which is exactly where asking somebody to repeat themselves costs the most.",
      },
      tram: {
        title: "On the tram",
        scene: "Announcements and strangers, both of them fast. The one situation where not following costs you the afternoon rather than the sentence.",
      },
      neighbours: {
        title: "In the stairwell",
        scene: "The laundry room, the bike in the hallway, the rubbish. A note on the door is not a request here — somebody who reads it as one becomes the difficult neighbour without ever being told.",
      },
      appointment: {
        title: "On the telephone",
        scene: "The hardest channel in any second language and the one nobody practises: no face, no context, and a stranger working through a list.",
      },
      "small-talk": {
        title: "At the lunch table",
        scene: "The scene this product exists for. The table switches to Standard German the moment it notices you are struggling — withdrawing exactly the thing that would have helped.",
      },
      handover: {
        title: "The handover",
        scene: "Colleague to colleague, nothing slowed down, nobody switching to Standard German on your account. The fastest speech of the day, and the part that decides the whole shift.",
      },
      "morning-care": {
        title: "The morning",
        scene: "Short sentences said while both hands are busy. Standard German is not the neutral option here: switching language mid-care reads as a switch of person.",
      },
      pain: {
        title: "When something hurts",
        scene: "Pain does not speak a second language. Somebody reporting it is not composing — and somebody who misreads it takes pain for agitation.",
      },
      meals: {
        title: "Meals",
        scene: "The situation that comes round most often and that nobody prepares for, because it sounds like the easy one.",
      },
      "evening-unrest": {
        title: "Restlessness in the evening",
        scene: "Somebody wants to go home, to a home that has not existed for forty years. What helps is short, in the present tense, and in the language the person is thinking in.",
      },
      visitors: {
        title: "Visitors",
        scene: "Suddenly you are the institution. The daughter arriving on a Sunday afternoon judges the home by whether the person at the door could follow her.",
      },
    },
  },

};
