import type { Dictionary } from "./de.ts";

/**
 * Züritüütsch — the site speaking the language it teaches.
 *
 * This is the one locale that closes the loop. Everywhere else the UI language
 * and the taught variety are separate axes on purpose; here they touch, and a
 * learner far enough along can switch the whole product into the thing they
 * came for.
 *
 * It also puts us under our own rule. Every line below is Zurich German, so it
 * faces the same deterministic gate that judges the model's output — no `nid`,
 * no `güet`, no `gäu`, no `öu`, no ß, and `tüütsch` only inside Züritüütsch.
 * A test runs this dictionary through `check()`, which means the product's own
 * copy is held to the standard it sells. If we cannot pass it, the gate is
 * wrong or the copy is, and either way we want to know.
 *
 * Spelling follows the house convention in `gsw-zh.ts`: readable, modern, not
 * phonetic transcription. Züritüütsch has no official orthography, so this is
 * a choice rather than a correctness claim.
 *
 * Formal `Si`, matching the German original's `Sie`. Dialect does take the
 * polite form, and a site that switches to `du` the moment you pick dialect
 * would be making a familiarity decision on the reader's behalf.
 */
export const gsw: Dictionary = {
  meta: {
    title: "Heidi — Schwiizerdütsch verstaa",
    description:
      "Verstaa, was um Si ume würklich gredt wird. Heidi übersetzt echti Nachrichte, erklärt d Wörter wo Si na nöd kenned, und prüeft jedi Antwort uf echti Dialektforme. Mir foönd a mit Züritüütsch.",
  },

  language: {
    notYet: "Dä Text git s no nöd uf Schwiizerdütsch. Sie läsed en uf",
    byDesign:
      "Dä Text git s nu uf Dütsch und Änglisch: Er richtet sich a Lüt, wo da läbed. Sie läsed en uf",
  },

  nav: {
    home: "Afang",
    chat: "Chat",
    organisations: "Für Organisatione",
    speaking: "Schwätze",
    practice: "Üebige",
    listen: "Ghöre",
    grammar: "Grammatik",
    dialect: "Mundarte",
    essays: "Blog",
    paper: "Whitepaper",
    roadmap: "Fahrplan",
    changelog: "Änderige",
    vocabulary: "Wortschatz",
    situations: "Situatione",
    method: "Methode",
    technology: "Technik",
    contribute: "Mitmache",
    about: "Über öis",
    portal: "Min Bereich",
    settings: "Iistellige",
    privacy: "Datenschutz",
    impressum: "Impressum",
    investors: "Investore",
    groupUse: "Bruuche",
    groupLearn: "Lerne",
    groupPractise: "Üebe",
    groupAbout: "Über d Heidi",
    skipToContent: "Zum Inhalt",
    sections: {
      how: "Wie s funktioniert",
      record: "Was mir säged",
      who: "Wer dehinder staht",
    },
    contents: "Inhalt",
    menu: "Menü",
    language: "Sprach uuswähle",
    langNational: "Landessprache",
    langDialect: "Dialäkt",
    langOther: "Wiiteri Sprache",
  },

  footer: {
    tagline: "Züritüütsch verstaa, und denn mitrede.",
    place: "Kanton Züri, Schwiiz",
    varietyName: "Züritüütsch",
    builtOn: "Gmacht i Züri.",
    sections: "Siite",
    projectTitle: "Projekt",
    languageTitle: "Sprach",
    openSource: "Offe baut",
    openSourceNote: "Mir schriibed uf, was mir lerned — au das, wo nöd funktioniert het.",
    rights: "Heidi, Züri.",
  },

  home: {
    headline: "Schwiizerdütsch verstaa. Dänn schriibe wie öpper vo do.",
    sub: "Für alli wo Dütsch chönd und am Mittagstisch trotzdem nüüt verstönd.",
    dialectTitle: "Mir foönd a mit Züri",
    dialectBody:
      "Schwiizerdütsch isch kei Sprach, sondern e Familie. Heidi cha hüt Züritüütsch würklich guet und seit Ihne das lieber, als so z tue, als ob si alles chönnti. Grad drum wiist d Prüefig Berner Forme zrugg: nöd wil Bärndütsch falsch wär, sondern wil mir grad Züri unterrichted. Wiiteri Dialekt chömed dezue — jede mit eigene Stimme und eigener Prüefig.",
    dialectPlanned: "Planet",
    dialectOthers: "Anderi Mundarte",
    trustTitle: "Jedi Zile wird prüeft, bevor Si si gsehnd",
    trustBody:
      "E Sprachmodell wo mer um Schwiizerdütsch bittet, liferet bereitwillig Bärndütsch — und Si hättet kei Möglichkeit, das z merke. Drum entscheidet bi Heidi nöd s Modell, öb öppis Züritüütsch isch, sondern e feschti Regelprüefig, wo Si sälber chönd ufrüefe.",
    trustLink: "Prüefig sälber probiere",
    correspondencesTitle: "E Dotzed Regle öffned Hunderti Wörter",
    pillarsTitle: "Wie Heidi schaffet",
    methodLink: "Di ganz Methode",
    researchLink: "Was d Forschig seit",
    contributeTitle: "Mir suechet Zürcher Stimme",
    contributeBody:
      "Jedi Sekunde Dialekt, wo Si bi Heidi ghöred, chunt vo mene echte Mensch us Züri. Wänn Si öis bim Rede würded ufnäh la, mälded Si sich.",
    contributeCta: "Mitmache",
  },

  chat: {
    dock: {
      open: "D Heidi frage",
      close: "Zuemache",
      title: "Heidi",
      lead: "Fraged eifach, was Si grad läsed — oder füeged ii, was Si becho händ.",
      prompts: [
        "Wie sägi uf Züritüütsch, dass i spöter chume?",
        "Was isch de Unterschied zwüsched Mundart und Schriftdüütsch?",
        "Säged mer drü Wörter, wo n i da jede Tag ghöre.",
      ],
    },
    emptyTitle: "Frag d Heidi",
    placeholder: "Füged ii, was Si becho händ — oder schriibed, was Si wänd säge.",
    composer: "Nachricht a Heidi",
    saveWord: "Wort merke",
    savedWord: "Gmerkt",
    send: "Schicke",
    thinking: "Heidi liist mit …",
    you: "Si",
    exampleUnderstand: "Was heisst das?",
    exampleCompose: "Für mi schriibe",
    examples: [
      { kind: "dialect", text: "Im Kauz scho, hät mer nöd so gfalle. Du au?" },
      { kind: "compose", text: "Säg ihne, dass i zäh Minute spöter chum — fründlich." },
      { kind: "dialect", text: "Häsch du am Samschtig scho öppis vor?" },
    ],
    glossTitle: "Wörter wo sölled bliibe",
    suggestionsTitle: "Zum Uusprobiere",
    sendThis: "Das chönd Si schicke",
    /**
     * The badge on a sendable line that is the WRITTEN standard rather than
     * dialect. The pair is the point: one to send a landlord, one to send a
     * friend, and no way to tell them apart without this.
     */
    writtenStandard: "Schriftdütsch",
    copy: "Kopiere",
    copied: "Kopiert",
    flagged: "Nöd Züritüütsch:",
    checkedNote: "Kei fremdi Dialektforme gfunde",
    mic: "Diktiere",
    micStop: "Ufnahm beände",
    micListening: "Ich lose …",
    micTranscribing: "Wird gschribe …",
    micProblem: {
      mic: "Kein Zuegriff ufs Mikrofon. Si chönd wiiterhin tippe.",
      silence: "Nüüt ghört. Drucked Si nomal ufs Mikrofon und redet Si grad los.",
      unavailable: "Diktiere funktioniert i dem Browser nöd. Si chönd wiiterhin tippe.",
    },
    newChat: "Neus Gspröch",
    explanationsIn: "Erklärige uf Züritüütsch",
    notConfigured: "S Sprachmodell isch uf dere Installation na nöd iigrichtet.",
    unreachable: "Heidi isch nöd erreichbar. Bitte d Verbindig prüefe und nomal probiere.",
    failed: "Heidi het das grad nöd chönne beantworte. Bitte glii nomal probiere.",
    retry: "Nomal",
    /**
     * The full-screen chat. Its own object so the homepage box — which shares
     * every other string in here — does not have to carry strings it never
     * renders.
     */
    full: {
      expand: "Uf ganze Bildschirm",
      title: "Chat",
      yourChats: "Ihri Gspräch",
      noChats: "Na kei Gspräch.",
      untitled: "Ohni Titel",
      rename: "Umbenenne",
      save: "Spichere",
      cancel: "Abbräche",
      delete: "Lösche",
      deleteAsk: "Das Gspräch lösche?",
      deleteYes: "Ändgültig lösche",
      onThisDevice: "Das Gspräch isch nur i dem Browser da.",
      signInToKeep: "Aamälde, zum s bhalte",
      adoptTitle: "Das Gspräch bhalte?",
      adoptBody: "Si händ gschribe, bevor Si sich aagmäldet händ. D Heidi cha s Gspräch i Ihrem Konto spichere — oder s da im Browser la.",
      adoptKeep: "Ja, spichere",
      adoptDiscard: "Da la",
      menuOpen: "Gspräch",
      menuClose: "Zuemache",
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
      title: "Und jetz?",
      reply: { label: "Antwort schriibe", say: "Wie antworte ich da druf?" },
      grammar: { label: "D Grammatik dezue", say: "Erkläred Si mir d Grammatik dehinder." },
      shorter: { label: "Chürzer", say: "Fasseds chürzer." },
      warmer: { label: "Wärmer", say: "Sageds echli herzlicher." },
      firmer: { label: "Bestimmter", say: "Sageds bestimmter — ich han scho zweimal gfragt." },
      formal: { label: "Förmlicher", say: "Schriibeds förmlicher, für e offizielli Nachricht." },
      casual: { label: "Lockerer", say: "Sageds lockerer, under Fründe." },
      simpler: { label: "Eifacher", say: "Sageds mit eifachere Wörter." },
      decline: { label: "Höflich absäge", say: "Schriebed Si das als höflichi Absag." },
      apologise: { label: "Entschuldige", say: "Schriebed Si das als Entschuldigung." },
      thank: { label: "Danke", say: "Schriebed Si das als Dank." },
      ask: { label: "Nachefrage", say: "Formuliered Si e Rückfrag — i ha das nöd ganz verstande." },
      swiss: { label: "Uf Schriftdütsch", say: "Schriibeds das uf Schwiizer Schriftdütsch, nöd uf Mundart." },
    },
  },

  model: {
    attach: "Bild aahänke",
    attachNeedsKey: "Bilder läse bruucht Ihres eigene Modell",
    remove: "Ewägnäh",
    connectTitle: "Ihres eigene Modell verbinde",
    connectLead:
      "Heidi isch gratis, und di gratis Modell chönd kei Bilder läse. Wänn Si en eigene API-Schlüssel hinterlegged, cha Heidi Screenshots verstaa — und antwortet im Ganze besser.",
    whyTitle: "Werum nöd eifach debii?",
    whyBody:
      "Wil Bilder läse pro Bild chostet. Wänn mir das für alli würded zahle, müesstet mir Heidi chostepflichtig mache. So bliibt alles andere gratis, und wer meh wott, bringt sin eigene Schlüssel mit.",
    safetyTitle: "Wo Ihre Schlüssel ane gaht",
    safetyBody:
      "Er bliibt i dem Browser. Bi jeder Nachricht wird er verschlüsselt zu öis gschickt, eimal bim Aabieter bruucht und grad wieder verworfe. Mir speichered en nöd, schriibed en i kei Log und gänd en nie zrugg.",
    providerLabel: "Aabieter",
    keyLabel: "API-Schlüssel",
    keyPlaceholder: "sk-…",
    modelLabel: "Modell",
    getKey: "Schlüssel hole",
    test: "Verbinde und teste",
    testing: "Wird prüeft …",
    connected: "Verbunde",
    connectedWith: "Verbunde mit",
    failed: "Das het nöd klappet",
    disconnect: "Schlüssel ewägnäh",
    canSee: "Cha Bilder läse",
    textOnly: "Nur Text",
    open: "Eigens Modell",
    imageTooBig: "Das Bild laht sich nöd bruuche.",
    imagesLabel: "Aaghänkt",
  },

  settings: {
    appearanceTitle: "Darstellig",
    appearanceBody: "Hell, dunkel, oder eso wie s Ihres Grät grad iigstellt hät. D Wahl bliibt i dem Browser.",
    theme: { label: "Darstellig", system: "Grät", light: "Hell", dark: "Dunkel" },
    title: "Iistellige",
    lead: "Alles, was Heidi über Si weiss, a eim Ort — und alles dervo chönd Si wieder ewägnäh.",
    languageTitle: "Sprach vo de Siite",
    languageBody: "I welere Sprach Heidi mit Ihne redt. Was Si lerned, bliibt Züritüütsch.",
    modelTitle: "Sprachmodell",
    modelBody:
      "Standardmässig bruucht Heidi gratis Modell. En eigene Schlüssel schaltet Bilder frei und verbesseret d Antworte.",
    modelNone: "Kei eigens Modell verbunde",
    accountTitle: "Konto",
    accountBody: "Zum Spichere vo Ihrne Wörter und für Lerngruppe. Zum Übersetze bruuched Si kei Konto.",
    dataTitle: "Was uf dem Grät liit",
    dataBody:
      "Ihres Gspräch bliibt i dem Browser — au wenn Si de Tab zuemached — bis Si «Neus Gspräch» drücked. Aagmäldet wird s statt dem uf eusem Server gspeicheret. Zum beantwortet wärde, gaht jedi Nachricht an en Modällaabieter. En eigne Schlüssel und gmerkti Wörter liged nur da.",
    dataEmpty: "I dem Browser liit nüt vo Ihne.",
    dataForget: "Lösche",
    dataExport: "Alles abelade",
  },

  auth: {
    sections: {
      focus: "Wo Sie hanged",
      mastered: "Chönne",
      review: "Widerhole",
      recent: "Gspröch",
      patterns: "Muschter",
      words: "Wörter",
      groups: "Gruppe",
      onward: "Wiiter",
    },
    menu: {
      portal: "Ihri Wörter und Gspräch",
      settings: "Sprach, Modäll, Konto",
    },
    signIn: "Aamälde",
    signOut: "Abmälde",
    signInWith: "Mit OrangeCat aamälde",
    account: "Konto",
    portalTitle: "Min Bereich",
    portalLead:
      "Ihri Wörter, wänns Ziit isch für si wieder aazluege — und was Ihne debii immer wieder begegnet.",
    signedInAs: "Aagmäldet als",
    notSignedIn: "Si sind nöd aagmäldet",
    notSignedInBody:
      "Mälded Si sich a, damit Heidi sich cha merke, was Si na nöd chönnt händ. Ohni Aamäldig funktioniert alles andere wiiterhin — s Übersetze und d Dialektprüefig bruuched kei Konto.",
    whyTitle: "Werum OrangeCat",
    whyBody:
      "Heidi füehrt kei eigeni Benutzerdatebank. Ihri Identität liit bi OrangeCat, wo au Profil und Zahlig scho dihei sind. Das heisst: es Konto für mehreri Produkt, kei wiiters Passwort — und bi öis liit nüüt, wo mer chönnti stähle.",
    soonTitle: "Was als nächts chunt",
    soonList: [
      "Tutorinne und Tutore — freiwillig, zahlt, und nie Pflicht.",
    ],
    unavailable: "D Aamäldig isch uf dere Installation na nöd iigrichtet.",
    errorTitle: "D Aamäldig het nöd klappet",
    errorBody: "Do isch öppis schief gange. Probiered Si s nomal, oder gönd Si zrugg zum Afang.",
    tryAgain: "Nomal probiere",
  },

  pillars: [
    {
      title: "Verstaa chunt zerscht",
      body: "Lose vor Rede. I de Schwiiz isch es en vollwertige und aakannte Wäg dezuezghöre, Dialekt z verstaa und uf Hochdütsch z antworte. Es isch ussedem de einzig Wäg, de Input nöd z verlüüre: Sobald öpper merkt, dass Si kämpfed, wird uf Hochdütsch gwächslet.",
    },
    {
      title: "S echte Läbe isch de Lehrplan",
      body: "Kei erfundene Üebige. D Nachricht wo hüt am Morge cho isch, de Satz vom Mittagstisch, d Absag wo Si müend schriibe — das isch s Material. Heidi hilft sofort und merkt sich debii, was Si na nöd chönnt händ.",
    },
    {
      title: "Gmässe, nöd vergoldet",
      body: "Kei Serie, kei Pünkt, kei erfundeni Prozäntzahle. D Zahl wo mir Ihne wänd zeige isch, wie vill Si vo ere unbekannte Zürcher Stimm verstönd — vorher und nachher.",
    },
  ],

  method: {
    contents: "Uf dere Site",
    title: "D Methode",
    lead: "Heidi isch nach dem baut, was d Forschig tatsächlich zeigt — und nöd nach dem, was sich als Sprachkurs guet verchauft. Das füehrt zu es paar Entscheidige, wo uf de erst Blick komisch wirked.",
    sections: [
      {
        title: "D Falle, us dere Heidi ushilft",
        body: "Si lerned Dütsch, zügled uf Züri und stelled fescht, dass es nöd hilft. Am Tisch wird Dialekt gredt, Si verstönd fascht nüüt, und wil mer Ihne das aagseht, wächsled alli höflich uf Hochdütsch oder Änglisch. Grad de Input wo Si besser machti, wird Ihne entzoge, wil Si en nötig hättet. Heidi isch e Quelle vo Dialekt wo nöd wägschaltet.",
      },
      {
        title: "Kontakt schlaht Regle",
        body: "I de gröschte Untersuechig dezue, wie Mensche nah verwandti Sprache verstönd, isch di blossi Mängi a Kontakt wichtiger gsi als jedes Mass für sprachlichi Distanz. Nöd d Grammatik entscheidet, sondern wie vill Si ghört händ. Drum isch Heidi kei Lektionsreihe, sondern en Ort woständig echte Dialekt verbi chunt.",
      },
      {
        title: "Regle ghöred i d Üebig, nöd dervor",
        body: "Chind, Huus, isch, guet — d Lautregle sind echt und si sind nützlich. Aber de einzig suber Tescht vo ere Regelstund vorewäg het kei mässbari Wirkig zeigt. Was degäge naachwiisbar wirkt: öpperem säge, uf was er söll lose, grad bevor er s nomal ghört. Heidi zeigt drum immer nur ei Regel, immer näbet eme konkrete Wort.",
      },
      {
        title: "D Prüefig isch immer e neui Stimm",
        body: "Sich a ei einzelni Sprecheri z gwöhne isch liicht und bewiist nüüt. Was zellt isch, öb s Glernte uf e Stimm übergaht wo Si na nie ghört händ. Drum wird bi Heidi mit vill Sprecherinne und Sprecher güebt und immer mit ere unbekannte prüeft.",
      },
      {
        title: "Rede chunt zletscht — und das isch kei Mangel",
        body: "Erwachseni erreiched im Zweitdialekt sälte muettersprachlichi Uusspraach, und i de Schwiiz isch das weniger schlimm als fascht überall süscht: Dialekt verstaa und Hochdütsch antworte isch normal und wird respektiert. Heidi verchauft Ihne drum nöd, dass Hörtraining Ihres Rede verbesseret — d Evidenz defür isch schwach.",
      },
    ],
    loopTitle: "D Schleife",
    loopSteps: [
      "Si überchömed öppis, wo Si nöd verstönd.",
      "Heidi erklärt s sofort — vollständig, nöd als Rätsel.",
      "Es oder zwei Wörter bliibed hange, wil si Ihne erklärt worde sind, wo Si si bruucht händ.",
      "Diselbe Wörter tauched spöter wieder uf, i mene andere Satz.",
      "Irgendwänn begägned Si ne dusse, und Heidi isch nöd debii gsi.",
    ],
    loopNote:
      "S letschte isch s Ziel. Di meischte Programm wänd, dass Si wieder chömed. Es Lernprodukt söll wänd, dass Si s immer weniger bruuched.",
  },

  research: {
    title: "Was d Forschig seit",
    lead: "Sprachlernprodukt sammled Pseudowüsseschaft a, wil us «es git e Studie» sehr schnell «das isch bewise» wird und drus es ganzes Produkt. Mir haltet drei Sache useinand: was beleit isch, was mir vermuetet, und was eifach en Entscheid isch.",
    factTitle: "Beleit",
    factNote: "Druf stützed mir öis.",
    hypothesisTitle: "Vermuetig",
    hypothesisNote: "Plausibel, ungeteschtet — und Heidi isch s Messgrät.",
    decisionTitle: "Entscheid",
    decisionNote: "Produktentscheid wo au denn richtig bliibed, wänn sich d Vermuetig nöd bestätiget.",
    facts: [
      {
        claim: "Kontakt schlaht sprachlichi Distanz.",
        detail:
          "Über 1833 Hörerinne und 70 Sprachpaar häre isch de Kontakt mit de Teschtsprach wichtiger gsi als lexikalischi, lautlichi oder orthografischi Distanz.",
        source: ["gooskens-2018"],
      },
      {
        claim: "Training mit vill Stimme isch das, wo uf unbekannti Stimme übergaht.",
        detail:
          "Mit ere einzige Stimm z üebe cha uf grad dere Stimm besser abschniide und übertreit sich nöd. Für regionali Dialekt eigens bestätiget.",
        source: ["lively-1993", "clopper-2004"],
      },
      {
        claim: "Z säge, uf was mer söll lose, isch en Wirkstoff und kei Dekoration.",
        detail:
          "Gliichs Material, gliichi Rückmäldig: glernt het nur d Gruppe, wo uf de relevant Kontrascht hingwise worde isch.",
        source: ["pederson-2010"],
      },
      {
        claim: "Abrüefe mit Rückmäldig schlaht Nachläse.",
        detail: "222 Studie, 48'478 Lernendi; g ≈ 0.50, mit Rückmäldig 0.54 gägenüber 0.37 ohni.",
        source: ["yang-2021"],
      },
      {
        claim: "Verteilts Üebe schlaht gballts, und de Vorsprung wachst mit de Ziit.",
        detail: "g ≈ 0.76 sofort, g ≈ 1.15 nach Verzögerig, über 48 Experimänt und 3411 Persone.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "Untertitel hälfed — nach em Hörversuech, nöd während dem.",
        detail:
          "Grosse Effekt uf de Wortschatz (g ≈ 0.87), offebar wil Text hilft, de Lutstrom i Wörter z zerlege. Dauerhaft iigblendete Text wird zur Chrucke.",
        source: ["montero-perez-2013"],
      },
      {
        claim: "Hörtraining verbesseret s eigene Rede nur schwach.",
        detail: "d ≈ 0.92 für d Wahrnähmig, d ≈ 0.54 für d Produktion, ohni Zämehang zwüsche beidne.",
        source: ["sakai-moorman-2018"],
      },
      {
        claim: "Dialekt schriibe isch i de Schwiiz digital normal, nöd Slang.",
        detail: "Das isch de Grund, werum «schriibe wie öpper vo do» e echti Kompetänz isch und kei Spielerei.",
        source: ["whatsup-uzh"],
      },
    ],
    hypotheses: [
      {
        claim: "Konsonante-Regle säged d Verständlichkeit villicht besser vorus als Vokal-Regle.",
        detail:
          "Bewise isch, dass lautlichi Distanz d Verständlichkeit besser vorussäit als lexikalischi. D konkrete Zahle, wo die Site früener für Konsonante gäge Vokal aagfüehrt hät, händ mer i kerner zuegänglichi Quelle chönne nachprüefe — drum staht s da und nöd under «Gsicheret». Zwei vo eusne vier Regle uf de Startsite sind Vokal-Regle und somit di schwächeri Wette.",
        source: ["gooskens-2007"],
      },
      {
        claim: "Lautregle wirked als Hiiwiis i de Üebig, obwohl si als Lektion nöd wirked.",
        detail:
          "De einzig suber Tescht vo de Lektionsform — 50 Minute Niderländisch-Friesisch — het kei signifikanti Wirkig zeigt, und d Autore sälber warned dervor, das z verallgemeinere. Di ganz europäisch Interkomprehensions-Didaktik isch nach Uussag vo de füehrende Forschende praktisch nöd evaluiert. Öisi Variante isch also di ungeteschteti. Drum mässed mir si.",
        source: ["bergsma-2014"],
      },
      {
        claim: "E churzi Igwöhnig verbesseret mässbar s Verstaa vo ere fremde Stimm.",
        detail:
          "Was nach öppe ere Minute beleit isch, isch e höcheri Verarbeitigsgschwindigkeit — nöd meh verstandeni Wörter. Mir behauptet drum nöd, dass Si nach ere Minute meh verstönd.",
        source: ["clarke-garrett-2004"],
      },
    ],
    decisions: [
      "Lose vor Schriibe vor Rede — begründet dur d Sprachsituation, nöd nur dur Evidenz.",
      "Gmässe statt vergoldet. Kei Serie, kei Pünkt.",
      "D Prüefstimm isch immer eini wo Si nöd ghört händ.",
      "Echti Zürcher Ufnahme, wil jedes verfüegbare Zürcher Korpus nur für d Forschig lizenziert isch.",
      "S Modell urteilt nie über de eigene Dialekt.",
    ],
    honestyTitle: "Wo mir öis korrigiert händ",
    honestyBody:
      "Uf dere Siite isch emal gstande, d Lektionsvariante vo de Lautregle sig «teschtet worde und heig nöd funktioniert». Das treit e einzelni 50-Minute-Studie nöd, und es het öisi eigeni Variante beleit uusgseh la, obwohl si di ungeteschteti isch. Ebeso isch do gstande, es gäb kei chaufbari Schwiizerdütsch-Sprachsynthese; das stimmt so hüt nümme.",
  },

  check: {
    title: "Dialekt-Prüefig",
    intro: "En feschti Regelliste — kes Sprachmodäll. Si prüeft jedi Zile, wo d Heidi der zeigt. Da chasch d Liste sälber laa laufe.",
    placeholder: "Das isch nid güet, gäu",
    button: "Prüefe",
    failed: "D Prüefig isch grad nöd erreichbar gsi. Bitte nomal probiere.",
    ok: "Kei fremdi Forme gfunde. Das cha als Züritüütsch duregah.",
    okShort: "Suuber",
    failShort: "Gfunde",
    suggests: "besser",
    whyTitle: "Werum das kei Chliinigkeit isch",
    whyBody:
      "Bärndütschi, Baseldütschi und Ostschwiizer Forme sind vollkomme korrekti Wörter — eifach nöd do. Wer Züritüütsch lernt, cha de Unterschied per Definition nöd ghöre. Grad drum dörf de Entscheid nöd bimene Sprachmodell liege.",
    noteTitle: "Zur Rächtschriibig",
    noteBody:
      "Züritüütsch het kei offizielli Rächtschriibig. Die Prüefig seit Ihne nie, dass Ihri Schriibwiis falsch sig — nur, dass e Form us ere andere Region chunt.",
  },

  technology: {
    title: "Was en Computer mit Schwiizerdütsch cha",
    lead: "Und was er nöd cha. Da staht, was i dem Feld würklich gmässe worde isch — mit Zahle und Quelle, damit Si eusi Uussage chönd nachepüefe.",
    hardTitle: "Warum s schwierig isch",
    hardBody: [
      "Es git kei offiziälli Rächtschriibig. Es git Empfählige vo 1938, wo i de Dialektforschig brucht wärded — aber sogar gschuelti Lüüt bruuched si unterschiedlich, und fascht niemert schriibt so, wenn er ere Fründin schriibt.",
      "Gredt wird Mundart, gschriebe wird Hochdütsch. Drum isch «uufschriibe, was gseit worde isch» da kei Transkription, sondern e Übersetzig — und genau eso isch fascht jedes System baut, wo s git.",
      "Und es isch e chliini Sprach, was Date aagaht: di grösste öffentliche Sammlige sind es paar hundert Stund, und fascht alli sind nur für d Forschig lizenziert.",
    ],
    corporaTitle: "Woher d Date chömed",
    corporaLead: "Di öffentliche Sammlige, wo das Feld druff staht. D Spalte «Richtig» isch di wichtigscht: si zeigt, dass fascht alles Mundart ghört und Hochdütsch schriibt.",
    asrTitle: "Verstah",
    asrLead: "Wortfählerrate uf em gliiche Teschtsatz, damit d Zahle vergliichbar sind. All die Systeem schriibed Schriftdütsch — d Zahl seit, wie guet übersetzt worde isch, nöd wie guet Mundart gschriebe worde isch.",
    speakingTitle: "Rede",
    speakingLead: "Da isch de Märt irreführend. Was als «Schwiizerdütschi Stimm» verchauft wird, isch meischtens Schwiizer Hochdütsch — di gschriebeni Sprach, vorgläse. Echti Mundart-Synthese git s fascht nur i de Forschig.",
    modelsTitle: "Sprachmodäll",
    modelsLead: "Öb es Modäll würklich Mundart cha, oder öb das nur i de Medieamitteilig staht. «Prüeft» heisst: öpper hät s gmässe und veröffentlicht.",
    heidiTitle: "Was das für d Heidi heisst",
    heidiBody: [
      "S Diktiere schriibt kei Mundart uf. Es schriibt, was Si wänd säge, i de Sprach wo Si scho chönd — genau das, was d Forschig cha.",
      "D Heidi liist vor, behauptet aber nie, si redi Mundart. En Synthesizer, wo mer um Züritüütsch bittet, git im beschte Fall Schwiizer Hochdütsch — drum seit d Stimm, was si isch, und schwiigt lieber, als Ihne e englischi Stimm z gä, wo Züritüütsch vorliist.",
      "D Dialektprüefig lauft ohni Modäll. Si isch e feschti Regelischte, kei Sprachmodäll — drum cha si nöd afange, sich öppis uusdänke.",
    ],
    engineTitle: "Welles Modäll Ihne antwortet",
    engineLead:
      "Uselääse us de Chetti, wo d Aafrog würklich nimmt — nöd us eme Satz, wo öpper eimal ufgschriebe hät. Drum cha da kei Modäll stah, wos scho lang nüme git.",
    engineNotes: [
      "D Reiefolg isch kei Rangliste. D Chetti isch nach Chnappheit gordnet: Wer am wenigste Kapazität hät, wird zletscht belaschtet. De erscht Iitrag isch dä mit Platz, nöd dä bescht.",
      "Keis vo dene Modäll isch d Instanz für Züritüütsch. Das isch s Pack. Jedi erzügti Zeile lauft dur e regelbasierti Prüefig, bevor sie öpper gseht — und die Prüefig isch sälber kei Modäll.",
      "Ohni Schlüssel oder ohni Kontingänt antwortet d Route mit 503 und seit das. Sie tuet nöd so, als hät sie e Antwort.",
    ],
    directionLabel: "Richtig",
    directions: {
      "speech-to-standard": "Mundart ghört → Hochdütsch gschriebe",
      "speech-to-dialect": "Mundart ghört → Mundart gschriebe",
      "dialect-text": "Mundart gschriebe",
      "text-to-speech": "Text → Mundart gredt",
    },
    hours: "Stund",
    speakers: "Redendi",
    regions: "Regione",
    licence: "Lizänz",
    licences: { research: "nur Forschig", unpublished: "kei Lizänz veröffentlicht", textOnly: "Text; Audio uf Aafrag" },
    wer: "Wortfählerrate",
    zeroShot: "ohni Training",
    fineTuned: "nachetrainiert",
    speakingNames: {
      swissVendors: "Schwiizer Aabieter mit Mundart-Aagebot",
      commercial: "Kommerziälli «de-CH»-Stimme",
      eth: "ETH Züri, Swiss Voice",
      vits: "T5 und VITS, Forschigspipeline",
      voiceCloning: "Stimmübertragig us Podcasts",
    },
    weightsOpen: "Gwicht offe",
    weightsClosed: "Gwicht nöd veröffentlicht",
    isDialect: "Mundart",
    isStandard: "Schwiizer Hochdütsch",
    evaluated: "Mundart prüeft",
    notEvaluated: "Mundart nöd prüeft",
    statusResearch: "Forschig",
    statusService: "Dienscht",
    statusClosed: "iigstellt",
    evalTitle: "Was d Heidi misst, wenn Si redet",
    evalLead:
      "D Sprächüebig nimmt Si uf und meldet, was sich würkli mässe laat — und seit derzue, i welere Sprach gmässe worde isch. Nienert e Note vo hundert.",
    evalNames: {
      delivery: "Sprächfluss",
      fluency: "Tempo und Läuf",
      words: "Wörter und Forme",
      grammar: "Grammatik",
      pronunciation: "Uusspraachnote",
    },
    evalWhat: {
      delivery:
        "Wo Ton gsi isch und wo nöd: Pause, wie lang die längscht gsi isch, wie vill vo de Ufnahm Si würkli gredt hend. Das bruucht kes Transkript und funktioniert drum au für e Mundart, wo niemer cha ufschriibe.",
      fluency:
        "Silbe pro Sekunde, und wie lang Si redet, bevor Si aahaltet. Flüssigkeit im Sinn vo de Forschig — wie en Gedanke uusechunnt, nöd wie guet er tönt.",
      words:
        "Weli Wörter Si gwählt hend, prüeft a dere gliiche feschte Regellischte wie d Dialektprüefig. Nöd d Meinig vomene Modäll.",
      grammar:
        "Kongruänz, Fäll, Verbforme. Immer nur us eme Transkript i de Sprach, wo Si würkli gredt hend — susch korrigiert mer Wörter, wo d Maschine erfunde hät.",
      pronunciation:
        "Wird nöd gmacht. E Note gäg es muettersprachlichs Ideal isch es Urteil über en Mänsch, und kei bessri Erkennig würd si ehrlich mache.",
    },
    evalVerdicts: {
      target: "im Dialekt",
      bridge: "uf Schwiizer Hochdütsch",
      none: "nonig möglich",
      refused: "mit Absicht nöd aabote",
    },
    evalRefusedNote: "Genau demit wirbt jede Mitbewärber. Das isch d Zile, wo mir absichtlich leer laand.",
    evalFormLimit: "kei Forme beurteilt über",
    evalSource: "im Code",
  },

  privacy: {
    title: "Was mit Ihrne Wörter passiert",
    lead: "D Heidi liist Nachrichte, wo Lüüt enand gschickt händ. Das isch heikel, drum staht da genau, was wo liit und wer s susch no gseht.",
    bindingNote: "Massgebend isch di tüütschi Fassig.",
    flowsTitle: "Was wo liit",
    flowsLead: "Jedi Ziile nennt de Speicherort, damit Si s sälber chönd nachepüefe.",
    detail: {
      pictures: "im Browser chlyner gmacht; gspeicheret wird nu d Aazahl",
      speakingSuggestion: "nu de Satz, wo Sie bestätigt händ",
      account: "nu d Kennig, kein Name und kei Adrässe",
    },
    place: { device: "Nur uf Ihrem Grät", server: "Uf eusem Server", vendor: "Bi eme Aabieter" },
    col: { what: "Was", where: "Wo", who: "Wer s susch gseht" },
    nobody: "niemert susch",
    flows: {
      draftConversation: "Gspräch ohni Konto",
      savedConversation: "Gspräch mit Konto",
      savedWords: "Gmerkti Wörter",
      practiceSeen: "Scho gstellti Frage",
      practiceModel: "Wo Sie no dra schaffed",
      ownKey: "Ihre eigne API-Schlüssel",
      theme: "Helli oder dunkli Darstellig",
      dictation: "Diktiere",
      pictures: "Bilder",
      speakingTakes: "Schwätz-Ufnaame",
      speakingSuggestion: "Satz zum Prüefe",
      account: "Konto",
      groups: "Lerngruppe",
      feedback: "Rückmälde-Fänschter",
    },
    hostingTitle: "Wo de Server staht",
    hostingNote: "Nöd i de Schwiiz. Das säged mer lieber sälber, als dass Si s uusefinded.",
    vendorsTitle: "Wer d Nachrichte beantwortet",
    vendorsNote: "E Nachricht wird a eis vo dene Unternehme gschickt, zum si z beantworte. Mir händ mit keim devo en Uftragsverarbeitigsvertrag. Für Persone-Date us eme Bruef mit Schwiigepflicht isch d Heidi drum hüt nöd geeignet.",
    broughtKeyNote: "Mit eigenem Schlüssel gaht d Nachricht statt dem a de Aabieter, wo Si uuswähled.",
    notDoneTitle: "Was mer nöd mached",
    notDone: {
      analytics: "Kei Analyse-Werchzüüg",
      advertising: "Kei Wärbig",
      profileSale: "Kei Verchauf vo Date",
      trackingCookies: "Kei Tracking-Cookies",
    },
    notDoneNote: "Nachprüefbar: De Quälltext isch offe, und en Test hebt die Uussag aktuell.",
    rightsTitle: "Lösche",
    rightsBody: "Was uf Ihrem Grät liit, entfernded Si sälber i de Iistellige. Gspeicherti Gspräch löschid Si im Chat; debii verschwindt de Text würklich. Für alles andere schriibed Si eus.",
    contactTitle: "Kontakt",
    updatedLabel: "Stand",
  },

  impressum: {
    title: "Impressum",
    operatorLabel: "Betriebe vo",
    contactLabel: "Kontakt",
    sourceLabel: "Quälltext",
    statusLabel: "Rächtsform",
    statusNote: "D Heidi isch kes iidreits Unternehme. D Siite wird privat betriebe, de Quälltext isch offe.",
    addressNote: "E Poschtadrässe nenned mer, sobald s eini git.",
  },

  contribute: {
    title: "Mir suechet Zürcher Stimme",
    lead: "Jedi Sekunde Dialekt, wo Si bi Heidi ghöred, chunt vo mene echte Mensch us Züri. Das isch tüür und langsam, und mir mached s trotzdem.",
    whyTitle: "Werum nöd eifach synthetischi Stimme",
    whyBody:
      "De ehrlich Grund isch nöd, dass es kei Schwiizerdütsch-Sprachsynthese gäbti — es git inzwüsche weli. De Grund isch d Lizänz. Jedes Zürcher Sprachkorpus wo mir gfunde händ, isch für d Forschig freigäh und nöd für es Produkt. Wer echts, suuber lizenzierts Züritüütsch mit Iiwilligung bruucht, mues es sälber ufnäh. Dezue chunt, was synthetischi Stimme sowieso schlächt chönd: Tempo, Nuschle, Zögere, de Unterschied zwüsche zwei Mensche us em gliiche Quartier.",
    needTitle: "Was mir bruuched",
    needList: [
      "Lüüt wo im Kanton Züri ufgwachse sind oder lang do läbed.",
      "Ganz gwöhnlichi Sätz — kei Vorläse vo Literatur.",
      "Verschideni Altersgruppe, Gschlächter, Quartier, Redetempi.",
      "Zwänzg Minute vo Ihrer Ziit, bi Ihne oder bi öis.",
    ],
    rolesTitle: "Vier Arte mitzmache",
    rolesLead:
      "Nach Ufwand gordnet, s Chlyschte zerscht — und s Chlyschte isch is am meischte wert. Bi jedere staht, was es derfür hüt scho git.",
    todayLabel: "Stand hüt",
    roleCta: "Schriibed Sie is drzue",
    roleSee: "Aaluege",
    learnerTitle: "Und wänn Sie lerned",
    consentTitle: "Was mit de Ufnahm passiert",
    consentBody:
      "Si behaltet d Kontrolle. Mir säged Ihne vorher, wofür d Ufnahm bruucht wird, Si chönd si zrugzieh, und d Iiwilligung fürs Produkt isch nöd diselb wie eini für d Forschig. Mir gönd dervo us, dass Si s Letschte nöd wänd, solang Si s nöd uusdrücklich säged.",
    ctaTitle: "Mälded Si sich",
    ctaBody: "E churzi Nachricht längt. Schriibed Si öis, us welem Teil vom Kanton Si chömed.",
    ctaButton: "E-Mail schriibe",
  },

  about: {
    title: "Über Heidi",
    lead: "Heidi wird i Züri gmacht, vo Lüüt wo s gliiche Problem gha händ. Mir baued offe — au di Teil wo nöd funktioniert händ.",
    sections: [
      {
        title: "Werum es das git",
        body: "Wil sehr vill Mensche do de gliich Wäg gönd: Dütsch lerne, häre zügle, und denn feschtstelle, dass de entscheidend Teil vo de Sprach gar nöd gschribe wird. Das isch kei Nischeproblem, sondern d Standarderfahrig i dere Stadt.",
      },
      {
        title: "Wie mir schaffed",
        body: "Mir händ zerscht gläse, was d Forschig seit, und erscht nachher baut. Drei Befund händ de Plan umgworfe, wo mir süscht umgsetzt hättet. Was mir debii glernt händ, staht uf de Forschigssiite — samt de Stelle, wo mir öis öffentlich händ müesse korrigiere.",
      },
      {
        title: "Was na fählt",
        body: "Hüt: Verstaa und Antworte uf echte Text, e Antwort vorgläse übercho, und es Verzeichnis, wo am Radio und am Färnseh würklich Mundart gredt wird. Als nächts: s Hörlabor, wo Si e Zürcher Stimm ghöred, sich iigwöhned und mir mässed, wie vill Si vo ere andere verstönd. Das bruucht Ufnahme, und die entstönd grad.",
      },
    ],
    stateTitle: "Stand hüt",
  },

  vision: {
    title: "Wohäre das füehrt",
    lead: "Schwiizerdütsch isch de Aafang, nöd s Ziel. D Methode isch nöd uf d Schwiiz zuegschnitte.",
    points: [
      {
        title: "Es git vill settigi Sprache",
        body: "Überall uf de Wält git es Sprache und Dialekt, wo z chli sind, als dass sich en grosse Kursaabieter defür würd interessiere — und gliichziitig grad das, wo mer mues chönne, zum würklich dezueghöre. Mer cha d Amtssprach perfekt beherrsche und am Tisch trotzdem ussevor sii.",
      },
      {
        title: "Grad det versaged di grosse Aabieter",
        body: "Sprachkurs folged em Markt, und de Markt folgt de Sprecherzahl. Was übrig bliibt, sind es paar Wörterbüecher, es paar Forschigskorpora wo mer nöd kommerziell dörf bruuche, und kei Ufnahme zum Üebe. Heidi isch für grad die Lücke baut.",
      },
      {
        title: "D Methode isch übertragbar",
        body: "Erwachseni wo e verwandti Sprach scho chönd, müend nöd neu aafange — si müend umlerne, was si scho händ. Das gilt für Hochdütsch und Züritüütsch grad so wie für vill anderi Paar. Drum isch bi Heidi di unterrichteti Sprach uustuuschbari Konfiguration und nöd i de Code gschribe.",
      },
    ],
    closing:
      "Konkret heisst das: zerscht wiiteri Dütschschwiizer Dialekt, denn e Sprach usserhalb vo de Schwiiz — diselb Maschine, en andere Sprachsatz. D gredti Helfti reist mit: Jedi vo dene Sprache wird viel öfter ghört als gschribe, und für jedi gits Medie, wo niemert na Mundart und Hochsprach sortiert hät. Was mir debii lerned, schriibed mir uf.",
  },

  voice: {
    speak: "Vorläse",
    stop: "Stopp",
    unsupported: "Dä Browser cha nüt vorläse.",
    claim: {
      swissStandard: "Schwiizer Hochdütsch-Stimm — nöd Züritüütsch.",
      german: "E Stimm us Dütschland. Din Apparat hät kei schwiizerischi.",
      none: "Dä Apparat hät gar kei dütschi Stimm. D Heidi seit lieber nüt, als dass si Dütsch mit eme änglische Muul list.",
    },
    dialectCaveat:
      "E Maschine list Mundart-Schrift mit ere Hochdütsch-Stimm. Guet, zum s Wort im Satz finde — nie, zum d Uussprach übernäh.",
    settingsTitle: "D Heidi ihri Stimm",
    settingsBody:
      "Gredt wird nur, wänn Sie drum bitted. Kein Browser bringt e Zürcher Stimm mit — s Nächschte, wo en Apparat cha, isch Schwiizer Hochdütsch, und d Heidi seit jedes Mal, was Sie grad ghöred.",
    speakAnswers: "Antworte vorläse",
    rate: "Tempo",
    correctionTitle: "Korrekture",
    correctionBody:
      "Wie viel d Heidi zu de Wörter vonere Sprächübig seit, nachdem Sie ufgschribe händ, was Sie gseit händ. Nie zu Ihrer Schriibwiis: Züritüütsch hät kei richtigi Schriibig, da cha me nüt falsch mache — und nie zu dem, wo Sie im Chat tippet, well e Nachricht, wo Ihne öpper gschickt hät, gnau so uusgseht wie eini vo Ihne.",
    correctionLevels: {
      off: "Nüt säge",
      blocking: "Nur, was gar kein Schwiizerdütsch isch",
      all: "Au Forme us andere Dialäkt",
    },
    correctionHelp: {
      off: "D Heidi antwortet und lat Ihri Wörter i Rueh.",
      blocking: "S normale. Sache, wo kein Schwiizer schribt, zum Bispil s scharfe S.",
      all: "Dezue Bärndütsch und anderi Regione — echti Wörter, am falsche Ort.",
    },
    silence: {
      off: "D Korrekture sind abgstellt.",
      spoken:
        "Gredts korrigiert d Heidi nöd. Was d Spracherkennig zruggäh, isch ihri Schriibig und nöd Ihri — si schribt Hochdütsch, egal was Sie gseit händ. Es Zeiche derfür würd d Maschine korrigiere und Ihne verrächne.",
      clean: "Nüt z beanstande.",
    },
    cannotHear:
      "Ob Ihri Uussprach stimmt, cha Ihne d Heidi nöd säge. Das cha hüt nüt zuverlässig. Was si cha: Sie verstah und antworte.",
  },

  listening: {
    title: "Wo Sie s ghöred",
    lead: "D Schwiiz macht sehr viel Radio, Färnseh und Film uf Mundart, s meischte gratis. Nur seit niemert eim, was devo überhaupt Mundart isch — drum staht das da bi jedem Iitrag zerscht.",
    todayTitle: "Wänn Sie zwänzg Minute händ",
    todayBody:
      "Drü zum Aafange, morn anderi. Vo jedere Sorte eis, s sanfteschte zerscht, und alli laufed au usserhalb vo de Schwiiz — es Verzeichnis seit Ihne, was es git, und das isch nöd s gliiche wie z säge, was Sie jetzt sölled mache.",
    diglossiaTitle: "D Helfti vo de Schwiizer Medie isch nöd Mundart",
    diglossiaBody:
      "D Tagesschau wird uf Hochdütsch gläse, s Magazin grad dernah lauft uf Mundart. E Stund Tagesschau isch e Stund i dem Dütsch, wo Sie scho händ.",
    basisNote:
      "D Aagabe chömed us em Format vo de jewilige Sändig. Niemert hät si alli dureghört und ufgschribe, was z ghöre gsi isch — es sind also sorgfältigi Schlüss und kei Mässige, und das staht da, bis öpper die Arbet macht.",
    spoken: { dialect: "Mundart", standard: "Schwiizer Hochdütsch", mixed: "Beides" },
    voices: { one: "Ei Stimm", few: "Weni Stimme", many: "Vieli zäme" },
    subtitles: { standard: "Hochdütschi Untertitel", auto: "Automatischi Untertitel", none: "Kei Untertitel" },
    scripted: "Abgläse",
    spontaneous: "Frei gredt",
    reachCh: "Lauft nur i de Schwiiz",
    about: "Worum s gaht",
    medium: {
      podcast: "Podcasts",
      radio: "Radio",
      youtube: "YouTube",
      tv: "Färnseh",
      series: "Serie",
      film: "Film",
    },
    filmsTitle: "Wele Dialäkt Sie ghöred",
    filmsBody:
      "De Schwiizer Film isch nöd ein Akzänt. Bi jedem Iitrag staht, us welem Dialäktgebiet er chunt — so chönd Sie zwüsche dem uswähle, was um Sie ume gredt wird, und dem, was Ihne im Zug begägnet. Bärn isch stark vertrete, wil dete de meischt Schwiizer Film entstaht — und d Zürcher Film gits, und si stönd da.",
    commentary: {
      "der-bestatter":
        "Bärndütsch, und d Serie, wo da fascht alli gseh händ — de Dialäkt, wo e Schwiizerin nachmacht, wänn Sie um en Akzänt bitted.",
      "wilder":
        "Krimi über mehreri Staffle und mehreri Dialäktgebiet. Guet, zum ghöre, dass Schwiizerdütsch nöd ei Sach isch.",
      "tschugger":
        "Wallisertitsch, wofür anderi Schwiizer Untertitel bruuched. En Witz under Schwiizer — und würklich kein Aafang.",
      "neumatt":
        "Bärndütsch, e Buurefamilie. De Tonfall vo Familiestriit, nöd vom Färnseh.",
      "die-schweizermacher":
        "Züritüütsch vo 1978 und immer na de Film übers Schwiizerwärde. De Akzänt hät sich sithär verschobe, was für sich ghörenswert isch.",
      "mein-name-ist-eugen":
        "Bärndütsch, und grösstenteils redendi Chind — langsamer und dütlicher als Erwachsenedialog.",
      "der-goalie-bin-ig":
        "Dichts Bärndütsch, nach eme Roman, wo dadrin gschribe isch. De Titel isch e Grammatikstund: s Verb isch `bin`, s Pronome chunt zletscht.",
      "achtung-fertig-charlie":
        "Armeekomödie und d gmeinsam Referänz vo fascht jedem Schwiizer under füfzg.",
      "bon-schuur-ticino":
        "E Komödie, wo d Sprachfrag sälber d Prämisse isch — was passiert, wänn s Land sich für eini entscheide muess.",
      "die-goettliche-ordnung":
        "Appezäll 1971, Fraue kämpfed fürs Stimmrächt. Ostschwiizer Dialäkt, und es Stück Gschicht, wo Sie druf aagsproche werded: Appezäll Innerrhode hät d Fraue erscht 1990 a d Landsgmeind glah, lang nach em Filmänd.",
      "zwingli":
        "Züri sini eigeni Reformation, uf Züritüütsch. Eine vo de wenige Spielfilm i genau dere Sprach, wo da unterrichtet wird.",
      "wolkenbruch":
        "Züritüütsch mit Jiddisch dernäbe — e zwöiti Lektion drüber, wie nach zwei Sprache binenand ligged und trotzdem zwei bliibed.",
      "platzspitzbaby":
        "Züritüütsch, d Drogejahr vo de Stadt us de Sicht vomene Chind. Schwers Thema, ungwöhnlich klari Sprach.",
      "heidi-2015":
        "Für Chind gmacht und drum langsam und dütlich gredt. Vermuetlich de eifachscht Spielfilm uf dere Lischte — und z Graubünde aagsidlet, nöd i dessen Dialäkt gredt.",
      "seitentriebe":
        "Alltäglichs Schwiizerdütsch zwüsche Paar — die halbe Sätz und Unterbrüch, wo Sändesprach wegbüglet.",
    },
  },

  errors: {
    notFoundTitle: "Die Siite git es nöd",
    notFoundBody: "Villicht isch de Link alt, villicht händ mir öppis verschobe.",
    backHome: "Zrugg zum Afang",
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
    keptTitle: "Gmerkti Wörter",
    keptNone: "Tipped uf +, zum es Wort behalte. D Heidi fragt Si spöter dernah.",
    keptSome: "am Wiederhole",
    practise: "Jetz wiederhole",
    askLabel: "Im Satz zeige",
    askSay: "Zeiged mer «{word}» i zwei churze Sätz us em Alltag.",
    title: "D wichtigschte Wörter",
    lead: "Nöd d Wörter für Tourischte, sondern die, wo en Satz dra hänge bliibt: di churze, ständige, wo kei Lutregel hilft.",
    note: "Richtig: Mundart → Dütsch. Da gaht's ums Verstah, nöd ums Schriibe — was Si sälber schriibe söttet, staht bi de Mundarte.",
    groups: {
      function: "Chliini Wörter, grossi Wirkig",
      verbs: "Verbe wo ständig vorchömed",
      everyday: "Alltag",
      greetings: "Begrüessig und Höflichkeit",
    },
    articleLabel: "Artikel",
    formsLabel: "Forme",
    exampleLabel: "Im Satz",
    filterLabel: "Wörter filtere",
    filterPlaceholder: "Mundart oder Düütsch tippe …",
    noMatches: "Dezue passt kei Wort.",
    clearFilter: "Zrugg setze",
    practiseGroup: "Die Gruppe üebe",
    jumpLabel: "Direkt zu",
    saidInTitle: "Gseit i",
  },

  practice: {
    title: "Üebige",
    lead: "En churze Satz Frage, i es paar Minute. Us de Regle wo d Heidi sälber aawendet, us de Sätz wo würkli gseit werded — und us de Wörter wo Si behalte händ.",
    note: "Was Si sich gmerkt händ, bliibt i Ihrem Browser. Für d Frage us em Wortschatz bruuchts kes Konto.",
    start: "Loslege",
    restart: "Nomal",
    progress: "Frag {n} vo {total}",
    secondTry: "Zwöite Aalauf",
    skip: "Überspringe",
    show: "Uflöse",
    knew: "Gwüsst",
    missed: "Nomal",
    next: "Wiiter",
    right: "Richtig",
    wrong: "Nöd ganz",
    ask: {
      pairTarget: "Weles dervo isch Züritüütsch?",
      pairBridge: "Weles dervo schriibt mer i de Schwiiz?",
      article: "Wele Artikel ghört dezue?",
      form: "Weli Form passt?",
      cloze: "Wele Wort fählt?",
      recall: "Was heisst das?",
      match: "Was ghört zäme?",
      gaptext: "Weli Wörter fähled?",
      pick: "Welles Wort ghört da ane?",
      translate: "Wie seit mer das uf Züritüütsch?",
      card: "Weisch das no?",
    },
    matchHint: "Tippet es Wort aa, dänn si Bedütig.",
    gapHint: "Tippet es Wort aa — es rutscht i di nächscht Lugge. Uf e gfülti Lugge tippe nimmt s zrugg.",
    check: "Prüefe",
    typeLabel: "Sälber schriibe — friiwillig",
    typePlaceholder: "Tippet Iri Antwort …",
    youWrote: "Si händ gschriebe",
    translateLabel: "Uf Züritüütsch schriibe",
    packSays: "Im Pack staht",
    spellingNote:
      "Züritüütsch hät kei fescht Rächtschriibig. Anders gschriibe heisst nöd falsch gschriibe — vergliichet sälber und entscheidet.",
    cardRecognise: "Mundart → Bedütig",
    cardProduce: "Bedütig → Mundart",
    cardTurn: "Umtue",

    modeTitle: "Wie wänd Sie üebe?",
    modeMixed: "Gmischt",
    modeMixedNote: "Vo allem öppis — de normal Wäg.",
    modeTap: "Aatippe",
    modeTapNote: "Nu uswähle. Kei Taschtatur, ei Hand längt.",
    modeWrite: "Schriibe",
    modeWriteNote: "Ganzi Sätz sälber tippe. Sie vergliichet sälber.",
    modeCard: "Charte",
    modeCardNote: "S Wort vorne, d Bedütig hinde. S schnellschte.",

    flowTitle: "Üebe oder prüefe?",
    flowPractice: "Üebe",
    flowPracticeNote: "Antwort und Erkläärig grad nach jedere Frag.",
    flowTest: "Test",
    flowTestNote: "Zerscht alli Fräge, dänn alli Antworte mit Erkläärig.",

    testLead:
      "{total} Fräge am Stück. D Heidi seit unterwägs nüt derzue — d Antworte und d Erkläärige chömed am Schluss, alli uf ei Mal.",
    testOnlyObjective:
      "Im Test chömed nu Fräge, wo mer eidütig cha prüefe. S Gschriibene und d Charte bewertet Sie sälber — das cha mer üebe, aber nöd mässe.",
    testStart: "Test aafange",
    testProgress: "{n} vo {total}",
    testAnswer: "Antwort merke",
    testTimerOff: "Ohni Ziit",
    testTimerSet: "{n} Min.",
    testTimerAdd: "+{n} Min.",
    testTimerLabel: "Ziit näh?",
    testTimerLeft: "No {time}",
    testTimeUp: "D Ziit isch ume. Alles, wo Sie beantwortet händ, staht unde.",
    testDone: "Fertig",
    testResultsTitle: "Ihri Antworte",
    testResultsCount: "{right} vo {asked} uf Aahieb richtig",
    testResultsLead: "Jedi Frag nomal, mit dem wo Sie gwählt händ und em Wäg dörthi, wos erklärt wird.",
    testYourAnswer: "Sie händ gwählt",
    testCorrectAnswer: "Richtig wär",
    testUnanswered: "Nöd beantwortet",
    testAgain: "Nöie Test",
    focusTitle: "Da hänged Sie grad",
    focusLead: "Das chunt bi Ihne immer wider. Ei Klick üebt nur das.",
    scopedTo: "Nur zu: {what}",
    scopeAll: "Alles üebe",
    scopeEmpty:
      "Dezue git s no kei Frage. Das heisst nöd, s Thema seg unwichtig — nur, das Pack hät defür no kei Bispil.",
    origin: "S andere isch {origin}.",
    persons: {
      ich: "ich",
      du: "du",
      er: "er / si / es",
      mir: "mir",
      ihr: "ihr",
      si: "si",
      plural: "Mehrzahl",
      past: "Vergangeheit",
    },
    grammarLink: "Dezue i de Grammatik",
    wordLink: "Das Wort im Wortschatz",
    ruleLink: "D Regel dehinter",
    situationLink: "D Situation dezue",
    doneTitle: "Für jetz gnueg.",
    doneAsked: "gfragt",
    doneRight: "grad gwüsst",
    doneAgain: "chömed nomal",
    againTitle: "Nomal aaluege",
    whyTitle: "Warum d Übige so bout sind",
    whyLead:
      "Jedi Entscheidig da chame nochelääse. Wo d Forschig e Richtig git und kei Zahl, stoht d Zahl als öises Ermässe da — nöd als Befund.",
    why: [
      {
        claim: "Gfrogt werde schloht nomal aaluege.",
        detail:
          "Drum verrot kei Übig zerscht d Antwort. Über 222 Studie hinweg liit de Vorteil vom Abfroge gegenüber em nomal Lerne bi g ≈ 0,50.",
        source: ["yang-2021"],
      },
      {
        claim: "Spöter isch besser als bald — und de Vorteil wachst mit de Ziit.",
        detail:
          "Drum chunnt es gmerkts Wort nach 1, 3, 7, 16 und 35 Täg zrugg statt jede Tag. I ere Meta-Analyse zum Zweitsprochelerne: g ≈ 0,76 im Soforttest, g ≈ 1,15 im verzögerte.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "Eimol richtig isch z wenig; zweimol richtig, mit Abstand, isch de Punkt.",
        detail:
          "Drum chunnt e verpassti Frog no i de gliiche Sitzig zrugg — drei Froge spöter, nöd sofort. De Abstand vo drei isch öisi Schätzig: d Studie git d Richtig, nöd d Zahl.",
        source: ["rawson-dunlosky-2011"],
      },
      {
        claim: "Aachrüzle ohni Rückmeldig cha de falsch Begriff iipräge.",
        detail:
          "Drum zeigt jedi Uswahlfrog sofort di richtig Antwort und frogt spöter nomal. Rückmeldig verstärkt de Nutze und verchlinerets grad de Schade.",
        source: ["butler-roediger-2008"],
      },
      {
        claim: "Sälber härebringe prägt sich besser ii als läse.",
        detail:
          "Drum gits Lückesätz und offni Froge und nöd nur Uswahl. De Effekt isch robust, aber chliner, als sin Ruef vermuete loht.",
        source: ["bertsch-2007"],
      },
      {
        claim: "Mische hilft — aber nöd immer, und das säged mer dezue.",
        detail:
          "Drum chömed kei zwe gliiche Fragetype nachenand. D Meta-Analyse isch dütlich: de Nutze hanget dervo ab, wie ähnlich sich s Material isch, und bi sehr ähnlichem cha Mische sogar schade.",
        source: ["brunmair-richter-2019"],
      },
      {
        claim: "Kei Serie, kei Pünkt, kei Prozentzahl.",
        detail:
          "E Serie misst, wie viel Heidi Si konsumiert händ, und gseht dobii us wie es Mass fürs Lerne. Was da stoht, sind Zahle über das, wo Si gmacht händ.",
        source: ["yang-2021"],
      },
    ],
    whyMore: "Di ganz Methode",
    savedHint: "Im Chat mörked Si sich es Wort mit +. Das chunnt denn da zrugg, wenn's so wiit isch.",
  },

  essays: {
    title: "Blog",
    lead: "Warum d Dütschschwiiz so redt, wie si redt. Längeri Täxt mit Quelle — für d Frooge, wo uf e Charte nöd passed.",
    none: "Da stoht no nüt.",
    backToAll: "Alli Täxt",
    notTranslated: "De Täxt gits no nöd uf Schwiizerdütsch. Si läsed en uf",
    sourcesTitle: "Quelle",
  },
  dialect: {
    title: "Schwiizerdütsch",
    lead: "Was es isch, werum Si's nöd verstönd, obwohl Si Dütsch chönd — und weli Mundart wo gschwätzt wird.",
    spokenTitle: "Gschwätzt, nöd gschribe",
    spokenBody: "Schwiizerdütsch isch d Sprach vom Alltag — und di gschribni under Lüt wo sich kenned: SMS, WhatsApp, Notize. Alles Offizielle wird uf Schwiizer Hochdütsch gschribe. Bedes ghört dezue, und wer nur eis cha, schickt irgendwenn e Mundart-Nachricht a d Versicherig.",
    noStandardTitle: "Kei richtigi Schriibwiis",
    noStandardBody: "Es gits kei offizielli Rächtschriibig. S glich Wort wird vo zwei Lüt andersch gschribe, und bedi händ rächt. Drum seit d Heidi nie, Ihri Schriibwiis seig falsch — nur, wie mir si schriibed.",
    notOneTitle: "Nöd ei Sprach",
    notOneBody: "Schwiizerdütsch isch kein einzige Dialäkt, sondern vili. D Underschied fallet Einheimische sofort uf und Lernende gar nöd. D Heidi bringt Ihne Züritüütsch bii und seits, statt z tue als gäbs nur eis.",
    areasTitle: "D Mundarte",
    areasLead: "Mundartgränze folged kei Kantonsgränze — drum Pünkt und kei Flächene. D Kantön stönd debii, will Si wüssed i welem Si sind.",
    cantons: "Kantön",
    marksTitle: "Wora mer si erkennt",
    marksLead: "Forme wo d Heidi ihri Prüefig würkli underscheidet. Links di dörtig Form, rächts di Züritüütsch.",
    marksNone: "D Heidi cha die Mundart na nöd a einzelne Forme erkenne. Da staht nüüt, statt öppis Plausibels.",
    taught: "Das lernet Si da",
    sourcesTitle: "Quelle",
    groupsTitle: "Di drei Zwiig",
    groupsLead:
      "D alemannische Mundarte teiled sich i drei Gruppe. D Gränze sind kei Kantonsgränze, sondern Lutwandel, wo a verschidene Ort stoh blibe sind.",
    groups: {
      low: {
        name: "Niederalemannisch",
        body: "De Norde — i de Schwiiz praktisch nur Basel. Da isch s k am Wortaafang k blibe; suscht isch i de ganze Dütschschwiiz ch drus worde. Das ghört mer am erschte Tag.",
      },
      high: {
        name: "Hochalemannisch",
        body: "Mittelland und Oste: Züri, Bärn, Aargau, Solothurn, St. Galle. Di gröschti Gruppe — und die, wo mer meint, wenn mer «Schwiizerdütsch» seit.",
      },
      highest: {
        name: "Höchstalemannisch",
        body: "D Alpetäler: Wallis, Glarus, Uri und Unterwalde, d Walsersiedlige. Am konservativschte und für Uswärtigi am schwierigschte, wil da alti Forme erhalte sind, wo im Mittelland scho lang verschwunde sind.",
      },
    },
    groupLabel: "Zwiig",
    groupSpansTitle: "Uf beide Site vo de Linie",
    groupSpans:
      "Die Mundartlandschaft liit uf beide Site vo de Linie und ghört kem Zwiig ellei. Drum nänned mer kein, statt eine z wähle, wo ornlich uusgseht.",
    diagnosticTitle: "D Linie, wo ne zieht",
    diagnosticInside: "I dem Zwiig",
    diagnosticOutside: "Dernäbed",
    diagnosticStandard: "Hochdütsch",
    hearTitle: "So tönt si",
    hearLead: "Sändige und Film, wo vor allem die Mundart gredt wird. Prüefti Links — Ufnahme mached mer kei.",
    hearNone:
      "Für die Mundart stoht no nüt Prüefts im Verzeichnis. Lieber nüt als en Link, wo no niemert aaghört het.",
    hearAll: "Alli Hörquelle",
    whyManyTitle: "Warum so viili?",
    whyManyBody:
      "D Schwiiz het ihri Mundarte bhalte, während Dütschland sini grösstenteils verlore het. Das isch kein Zuefall und kei Frog vo de Bärge — es het mit Staatsbildig, Schuel und Radio z tue.",
    whyManyLink: "Di ganz Gschicht",
    backToAll: "Alli Mundarte",
    aroundTitle: "Wo das da staht",
    aroundLead:
      "Usgrächnet us em Zwyg, de Kantön und em Bezugsort — kei nöie Uussage über d Mundart sälber.",
    nearestTitle: "Am nöchschte",
    siblingsTitle: "Gliiche Zwyg",
    kmAway: "{km} km",
    marksInstead: "Fanged Sie stattdesse bi {area} aa, {km} km wyt — dört kennt d Heidi Forme",
  },

  grammar: {
    practiseLabel: "Meh Bispil",
    practiseSay: "Gäbed mer zwei Sätz zum Üebe vo «{word}» — und fraged mi dänn eine ab.",
    title: "Grammatik",
    lead: "Was Züritüütsch schwer verständlich macht für öpper, wo scho Dütsch liest — zerscht das, wo en Satz ganz dra scheiteret, denn das, wo Si zwar verstönd, aber nie sälber sege würded.",
    ruleLabel: "D Regle",
    watchLabel: "Wo's hakt",
    bands: {
      blocks: {
        title: "Dra gaht de Satz kaputt",
        lead: "Ohni die fangt s Zuelose gar nöd aa. Si warted uf e Form, wo nie chunt, oder läsed es Wort als öppis ganz anders — und de Rescht vom Satz isch furt.",
      },
      marks: {
        title: "Verstah scho — sälber säge nie",
        lead: "Die verstönd Si bim Lose problemlos. Wer si nie sälber bruucht, tönt daurhaft nach Hochdüütsch mit Züri-Wörter drin.",
      },
    },
    allTopics: "Alli Theme",
    practiseTopic: "Das Thema üebe",
    whereTitle: "Wo das würkli vorchunt",
    whereLead: "Di gliich Struktur, i Sätz, wo würkli so gseit werded.",
    prevLabel: "Zrugg",
    nextLabel: "Wiiter",
    topics: {
      "question-words": {
        title: "Fragewörter — und d Falle dinn",
        rule: "wänn, wo, was, wie, weer. Di meiste erkennt mer; eis nöd.",
        watch: "«Wänn» tönt wie s düütsche «wenn». Si höred e Bedingig, gfrooget worde isch aber öppis anders — und Iri Antwort passt dänn uf öppis, wo niemert gfrooget hät.",
      },
      "indefinite-article": {
        title: "en, e, es — de unbestimmt Artikel",
        rule: "«en» bim männliche, «e» bim wibliche, «es» bim sächliche Wort.",
        watch: "«es» gseht uus wie s Pronome «es». «Bruuched Sie es Säckli?» heisst nöd «bruuched Sie s», sondern «bruuched Sie es Säckli».",
      },
      imperative: {
        title: "Befähl und Bitt: d Sie-Form ändet uf -ed",
        rule: "Bim Du staht de blossi Stamm: «Chumm». Bim Sie chunt -ed dezue: «Chömed Sie».",
        watch: "Verstah werded Si beides. Wer «Chömen Sie» seit, wird au verstande — und sofort als Nöd-Züricher erkennt.",
      },
      "no-preterite": {
        title: "Kei Präteritum",
        rule: "Gschwätzts Züritüütsch hät kei eifachi Vergangeheit: alles Vergangene staht im Perfekt.",
        watch: "Si warted uf «ging», «war», «sagte» — und es chunnt nie. Wänn Si «bi», «hät» oder «händ» plus Partizip ghöred, isch das d Vergangeheit.",
      },
      articles: {
        title: "de, d, s — meh Artikel git's nöd",
        rule: "Drei Artikel für alles: «de» bim männliche, «d» bim wibliche, «s» bim sächliche Wort. «der», «die» und «das» chömed nöd vor.",
        watch: "Si gsehnd us wie verschluckti dütschi — sind aber di ganz Form, nöd e bequemi Churzfassig. Und s Gschlächt stimmt nöd immer mit em dütsche überii: «s Rüebli» isch sächlich, d Karotte nöd.",
      },
      "wo-relative": {
        title: "«wo» statt der, die, das",
        rule: "Relativsätz fanged fascht immer mit «wo» aa, unveränderet, egal weles Gschlächt oder wele Fall.",
        watch: "Si läsed «wo» als «wo?» und verlüüred de Satz. Es heisst da «der», «die», «das» oder «den» — nie en Ort.",
      },
      "unified-plural": {
        title: "Ei Verbform für di ganz Mehrzahl",
        rule: "Mir, ihr und si überchömed di glich Verbform: «mir händ», «ihr händ», «si händ».",
        watch: "Si sueched s «-t» vo de zweite Person Mehrzahl und findeds nie. «Chömed er?» heisst «Kommt ihr?» — d Endig seit nüüt über d Person, das macht nur s Pronome dervor.",
      },
      "possessive-dative": {
        title: "Bsitz andersume",
        rule: "De Genitiv fählt: Bsitz wird mit Dativ plus Possessivpronome bildet, oder mit «vo».",
        watch: "«Em Peter sis Auto» isch kein Fähler, sondern di normali Form. D Person chunnt zerscht, d Sach dernah.",
      },
      "diminutive-li": {
        title: "S -li a allem",
        rule: "D Verchlinerigsform uf -li isch sehr produktiv und bedüüted oft gar nüüt Chliises.",
        watch: "«Es Bierli» isch kei chlises Bier, sondern es fründlich gseits Bier. Nämed Si s -li nöd wörtlich.",
      },
      "am-progressive": {
        title: "«am» plus Verb — grad dra",
        rule: "Was grad lauft, staht als «bi/isch/sind am» plus Grundform: «Ich bi am schaffe».",
        watch: "Dütsch hät die Form nöd und behilft sich mit «gerade». Si verstönd de Satz au ohni — aber wer si nie bruucht, tönt duurend nach Hochdütsch mit Züritüütsche Wörter.",
      },
      "go-cho-infinitive": {
        title: "«go» und «cho» vor em zweite Verb",
        rule: "Wer öppenwohi gaht zum öppis mache, schiebt es «go» dervor; wer chunt, es «cho»: «Ich gang go poschte».",
        watch: "Im Dütsche git's das Wörtli nöd, also laht mer's wäg — und wird verstande und grad erkennt. Es isch kei zweits «gah», es ghört zum Verb dernah.",
      },
    },
  },

  saved: {
    title: "Dini Wörter",
    lead: "Was du naagschlage und bhalte wottsch. Alles liit i dem Browser, uf dem Grät — und nöd bi eus.",
    empty: "No kei Wörter gmerkt.",
    emptyHint: "Frag d Heidi nach eme Satz. Näbet jedem erklärte Wort staat es Plus — so merksch der s.",
    countLabel: "gmerkt",
    remove: "Lösche",
    clear: "Alli lösche",
    clearConfirm: "Wirkli alli lösche?",
    exportLabel: "Als Datei sichere",
    onThisDevice: "Nume uf dem Grät",
    savedOn: "Gmerkt",
    openChat: "Öppis naaschlaa",
  },

  /**
   * The dashboard: spaced review, and what the learner's own list says about
   * them. No streak, no score, no percentage — HEIDI.md §8 names each of those
   * as the thing this must not become.
   */
  review: {
    title: "Zum Wiederhole",
    lead: "Wörter, wo Si händ wele bhalte, chömed da zrugg — zerscht nach eim Tag, denn nach drü, denn nach ere Wuche. Spöter frage bringt meh als öfters frage.",
    due: "fällig",
    none: "Hüt isch nüt fällig.",
    noneHint: "Chömed morn wieder — oder schlaged öppis Neus nache.",
    noneFree: "De Plan isch iighalte. Wänn Sie jetz wiitermache wänd, da düre:",
    nonePractise: "Churz üebe",
    noneCards: "Charte",
    noneAsk: "Nachricht iifüege",
    empty: "Na kei Wörter zum Wiederhole.",
    emptyHint: "Merked Ihne es Wort im Gspräch, denn fragt Si d Heidi spöter dernach.",
    tomorrow: "morn fällig",
    settled: "sitzed",
    prompt: "Was heisst das?",
    show: "Uflöse",
    knew: "Han i gwüsst",
    missed: "Na nöd",
    done: "Für hüt duruus.",
    patternsTitle: "Was Ihne immer wieder begegnet",
    patternsLead: "Die Regelmässigkeite stecked i de Wörter, wo Si bhalte händ. Kei Note — nur das, wo i Ihrer eigene Liste staht.",
    patternsCount: "vo Ihrne Wörter",
    patternsEmpty:
      "No nüt z zeige. Sobald Sie es paar Wörter bhalte händ, staht da, weli Lutentsprechige immer wieder vorchömed — zum Bischpil, dass us eme tütsche k es ch wird. Uselääse us Ihrer eigene Liste; über Sie wird nüt gmässe.",
    masteredTitle: "Was Sie jetz chönd",
    masteredCount: "{n} Sache sitzed",
    masteredLead:
      "Zellt wird nöd, wie oft Sie da gsi sind, sondern was Sie inzwüsche richtig mached — mindeschtens viermal gfragt und fascht immer troffe.",
    masteredEmpty:
      "No nüt. Sobald öppis viermal gfragt worde isch und Sie s fascht immer richtig ghaa händ, staht s da. Zellt wird, was Sie chönd, nöd wie oft Sie da gsi sind.",
    masteredTopics: "Grammatik",
    masteredWords: "Wörter",
    masteredGroups: "Wortgruppe",
    masteredScenes: "Situatione",
    masteredNote:
      "Das seit öppis über das Pack, nöd über Schwiizerdütsch überhaupt. Das da sitzt — drus folgt nöd, dass es Gspröch z Züri sitzt.",
    recentTitle: "Wiitermache",
    recentEmpty: "Na kei Gspräch.",
  },
  groups: {
    title: "Lerngruppe",
    lead: "Üeb mit andere — d Heidi isch debii. Schriib ere im Gspräch mit Name, wenn du öppis wüsse wottsch.",
    empty: "Du bisch no i kerne Gruppe.",
    createTitle: "Gruppe uftue",
    createHint: "Gib ere en Name. Nachher überchunnsch en Link zum Wiitergäh.",
    namePlaceholder: "z. B. Mittwuch-Znacht",
    create: "Uftue",
    creating: "Wird uftaa …",
    open: "Ufmache",
    members: "Mitglieder",
    inviteTitle: "Zum Mitmache iilade",
    inviteHint: "Wer de Link hät, chunt ine. Gib en nume wiiter, wenn du das wottsch.",
    copyLink: "Link kopiere",
    copied: "Kopiert",
    rotate: "Nöie Link mache",
    rotateHint: "De alt Link hört sofort uf z funktioniere.",
    joinTitle: "Du bisch iiglade",
    joinBody: "Mäld di aa, zum mitmache.",
    join: "Mitmache",
    joining: "En Momänt …",
    joinFailed: "De Link funktioniert nümme.",
    full: "Die Gruppe isch voll.",
    signInFirst: "Mäld di aa, zum Lerngruppe bruuche.",
    composer: "Nachricht a d Gruppe",
    send: "Schicke",
    heidiHint: "Schriib «Heidi», wenn si antworte söll.",
    notConfigured: "Lerngruppe sind uf dere Installation no nöd iigrichtet.",
    failed: "Das hät grad nöd klappet. Bitte nomal probiere.",
    back: "Zrugg zu Mim Bereich",
  },
  speaking: {
    title: "Schwätze",
    lead: "Redet luut, elei, jetzt — und lönd mässe, was sich mässe laat. Wiiter unde: Webinare und Gsprächsrunde zu Theme, wo Sie sälber vorschlönd.",
    signInFirst: "Mälded Si sich a, zum es Thema vorschlaa und debii sii.",
    notConfigured: "Schwätzrunde sind uf dere Installation na nöd iigrichtet.",
    failed: "Das hät grad nöd klappet. Bitte nomal probiere.",

    roundsTitle: "Nächsti Runde",
    roundsEmpty: "Na kei Rundi plant. Eröffned Si di erst.",
    webinar: "Webinar",
    circle: "Gsprächsrundi",
    webinarHint: "Ei Person schwätzt, di andere losed zue.",
    circleHint: "Alli chömed dra. Höchstens acht Lüt.",
    once: "Eimalig",
    weekly: "Jedi Wuche",
    fortnightly: "Alli zwei Wuche",
    hostedBy: "vo",
    attending: "debii",
    full: "Voll",
    join: "Ich chume",
    leave: "Doch nöd",
    live: "Lauft jetzt",
    joinRoom: "In Ruum",
    noRoom: "De Link zum Ruum chunnt na.",
    cancelRound: "Rundi absäge",
    cancelled: "Abgseit",

    openTitle: "Rundi eröffne",
    openHint: "Si sind de Gastgäber und stönd als Erst i de Liste.",
    roundTitleLabel: "Um was gaats?",
    whenLabel: "Wänn",
    durationLabel: "Wie lang",
    minutes: "Minute",
    formatLabel: "Form",
    cadenceLabel: "Wiederholig",
    linkLabel: "Link zum Ruum",
    linkHint: "En https-Link zu Ihrem Ruum. D Heidi überträgt sälber kes Video — si plant d Rundi und üebt mit Ihne vorher und nachher.",
    open: "Eröffne",
    opening: "Wird eröffnet …",

    boardTitle: "Vorgschlageni Thema",
    boardLead: "Über was wänd Si rede? D Thema chömed vo de Lüt wo debii sind, nöd vo öis.",
    boardEmpty: "Na kei Vorschläg. Schlönd Si öppis vor wo Si wükli drüber rede wänd.",
    proposeTitle: "Thema vorschlaa",
    topicTitleLabel: "S Thema",
    topicTitlePlaceholder: "z. B. Was am Bahnhof wükli gseit wird",
    pitchLabel: "Werum isch das e Stund wert?",
    pitchPlaceholder: "Ei Satz längt.",
    propose: "Vorschlaa",
    proposing: "En Moment …",
    wouldCome: "würded cho",
    imIn: "Ich würd cho",
    imOut: "Doch nöd",
    scheduled: "Isch plant",
    scheduleIt: "E Rundi drus mache",

    practiceTitle: "Luut üebe",
    practiceLead: "Nämed uf, wie Sie über es Thema redet. Ei Minute längt.",
    record: "Ufnee",
    stop: "Fertig",
    recordingNow: "Nimmt uf",
    again: "Nomal",
    micDenied: "Ohni Zuegriff ufs Mikrofon gaats nöd. Erlaubed Si en i de Adressziile vo Ihrem Browser.",
    micUnsupported: "De Browser cha nöd ufnee. Probiered Si s uf em Händi oder i mene andere Browser.",
    measured: "Gmässe",
    varietyLabel: "I welere Sprach üebed Sie?",
    varietyBridge: "Schwiizer Hochtüütsch",
    varietyMeasuresOnly: "D Heidi mässt d Ufnahm uf Ihrem Grät. De Satz tippet Sie sälber — kes System schribt Züritüütsch zuverlässig uf.",
    varietyTranscribes: "D Heidi schribt mit und cha über Ihri Wörter rede. Drum gaat d Ufnahm eimal a en Dienscht, und wird det nöd gspeicheret.",

    recordedFor: "Ufnahm",

    spokeFor: "gredt",
    pauseLabel: "Pause",
    longestLabel: "längsti Pause",
    runLabel: "am Stuck",
    rateLabel: "Silbe/Sek.",
    wordsLabel: "Wörter",
    seconds: "Sek.",

    saidTitle: "Was händ Si gseit?",
    saidWhy: "Kes System schriibt Züritüütsch zuverlässig uf. Di beste übersetzed d Mundart is Hochdütsch und schmeissed grad das wäg wo Si lernid. Drum tippet Si Ihre Satz sälber — und s Ufschriibe isch sowieso di halb Üebig.",
    saidPlaceholder: "Schriibed Si Ihre Satz so wie Si en gseit händ.",
    saidCheck: "Prüefe laa",
    checking: "Wird prüeft …",

    heardTitle: "Das händ mer ghört",
    heardWhy: "Das hät e Maschine gschribe, nöd Sie. Korrigiered, was nöd stimmt — gmässe wird de Text, wo Sie dehinter staand.",
    heardPlaceholder: "Da staat, was d Maschine verstande hät.",
    hearing: "Wird abghört …",
    heardFailed: "S Abhöre hät nöd klappet. Schribed Ihre Satz sälber — d Mässig obe staat sowiso.",

    feedbackTitle: "Rückmäldig",
    suggestionTitle: "So würd mes da säge",
    noSuggestion: "D Heidi hät grad nüt derzue. D Mässig obe gilt trotzdem.",
    flaggedSuggestion: "Achtung: i dem Vorschlag staht e Form wo öisi eigeni Prüefig beanstandet.",
    foreignForm: "«{form}» isch {origin}. Da seit mer «{suggest}».",
    foreignFormPlain: "«{form}» chunnt us ere andere Mundart ({origin}).",
    noScore: "D Heidi git kei Note. Was da staht isch gmässe: wie lang Si gredt händ und wo d Pause gsii sind — und weli Wörter us ere andere Mundart chömed. Über Ihri Uusschprach staht nüt, will das niemert ehrlich cha mässe.",

    notes: {
      recordingTooShort: "D Ufnaam isch z churz zum öppis drüber säge. Nämed Si es paar Sätz uf.",
      recordingTooQuiet: "Mir händ fascht nüt ghört. Lueged Si s Mikrofon aa und redet Si echli neecher dra.",
      recordingClipped: "S Signal isch übersteuert gsii. Gönd Si echli wiiter wäg vom Mikrofon — es Grät-Problem, kes Schwätz-Problem.",
      longestPause: "Ihri längsti Pause hät {n} Sekunde duuret. Wänn Si die wänd churzer mache: säged Si de Satz mit weniger Wörter, statt s richtig Wort z sueche.",
      noLongPauses: "Kei langi Pause — Si sind duregcho ohni stecke z bliibe.",
      fewerPausesThanBefore: "{n} Pause weniger als s letscht Mal.",
      morePausesThanBefore: "{n} Pause meh als s letscht Mal. Das cha am Thema ligge.",
      longerRunsThanBefore: "Si händ {n} Sekunde länger am Stuck gredt als vorher.",
      nothingFlagged: "Kei Forme us ere andere Mundart gfunde.",
      shareOfRecording: "I {n} % vo de Ufnahm isch Sprach gsi. De Rest isch still gsi — das cha Nachdänke si oder es Mikrofon, wo z wenig ghört hät.",
      huntingForWords: "Wänn Sie gredt händ, händ Sie zügig gredt — d Ziit isch i d Pause gange. Das isch Wortsuechi, nöd Langsamkeit: säged s glich nomal, dänn fallt d Suechi wäg.",
      cameStraightThrough: "Sie sind durechoo, ohni lang z sueche. Nämed s nächscht Mal es Thema, wo Sie no nie luut gseit händ.",
      filledPauses: "{n} gfüllti Pause («äh», «ähm»). Das mached Muettersprachler au — zellt, nöd bemängelet.",
      spokeTargetInBridge: "Da sind Mundartwörter dringsi, obwohl Sie Hochtüütsch güebt händ. I Züri passiert das dauernd und isch kein Fähler — nur guet z wüsse, wänn Sie am Schalter bewusst Hochtüütsch rede wänd.",
    },

    historyTitle: "Ihri Ufnaame",
    historyUnwritten: "Ohni Text — nur gmässe.",
    deleteTake: "Lösche",
    progressDays: "Täg gredt",
    progressTakes: "Ufnahme",
    progressSpoken: "gredt",
    progressSeconds: "Sek.",
    progressMinutes: "Min.",
    progressNote: "Zellt, nöd bewertet. Die Zahl gaat nie abe — zwei Wuche Pause choschtet nüt.",
    privacy: "De Ton verlaat Ihres Grät nie. Gspeicheret wird nu was gmässe worde isch und Ihre eigen Text — i dem Browser, nöd bii öis.",
    privacyTranscribed: "I dere Sprach gaat d Ufnahm eimal a en Dienscht, wo si i Text verwandlet, und wird det nöd gspeicheret. Bi öis bliibed nur d Mässwert und de Text — i dem Browser.",
  },

  paper: {
    checkLabel: "Sälber nachepräfe",
    sourcesTitle: "Quelle",
  },

  changelog: {
    title: "Änderige",
    lead: "Was sich gänderet hät, mit Datum — und wie s eine seit, wo s bruucht.",
    note: "Kei Git-Protokoll. S Repository isch öffentlich, wer jede Commit wott, findt en dört. Da staht, was öpper gmerkt hätt — Fähler inbegriffe, wil e Änderigsliste ohni pinlichi Zeile de Beweis isch, dass s Versprächen «mir zeiged au, was nöd gange isch» nur Dekoration isch.",
    tags: {
      feature: "Nöi",
      improvement: "Besser",
      fix: "Bhobe",
      platform: "Unterbau",
      breaking: "Bruch",
    },
  },

  organisations: {
    title: "Für Organisatione",
    lead: "Wo Mundart nöd Ihres Problem isch, sondern das vo Ihrne Lüt.",
    momentLabel: "De Moment",
    stakeLabel: "Was es choschtet",
    offerLabel: "Was d Heidi macht",
    unknownLabel: "Was mir Si fraage müessted",
    chooseSector: "Ihre Bereich",
    allSectors: "Alli Bereich",
    readMore: "Wiiterläse",
    startTitle: "Wies aafangt, wänn Sie schriibed",
    noCustomers: "D Heidi hät hüt kei Kunde, kei Pilotprojekt und kei Fallstudie — und die Siite behauptet au keini. Was da staht, isch e Beschriibig vo Ihrem Problem, so guet wie mir s vo usse kenned. Säged Si is, wo mir falsch ligged.",
    talk: "Schriibed Si is",
  },

  situations: {
    title: "Wo Sie s bruuched",
    lead: "Nöd nach Wortarte sortiert, sondern nach em Moment: was i dere Situation würkli gseit wird, i de Reiefolg, wo s chunt.",
    note: "D Richtig isch wie überall da: zerscht verstah. Di meiste Sätz höred Sie — die weenige, wo Sie sälber säged, sind markiert.",
    unreviewed: "Jede Satz da isch maschinell uf Züri-Forme prüeft, aber no vo kener Muettersproochlere gläse worde. Das staht da, wil Sie s eus nöd aagseend.",
    hear: "Das höred Sie",
    say: "Das säged Sie",
    linesLabel: "Sätz",
    heardLabel: "zum Verstah",
    grammarLabel: "Was da immer wider vorchunt",
    practiseLabel: "Jetz üebe",
    backLabel: "Alli Situatione",
    domains: {
      everyday: {
        title: "Alltag i Züri",
        lead: "Lade, Tram, Treppehuus, Telifon, Mittagstisch. Situatione, wo fascht alli jedi Wuche drin stönd — und wo de Ruum grad dänn is Hochdüütsche wächslet, wänn er merkt, das Sie Müe händ.",
      },
      care: {
        title: "Alters- und Pflegeheim",
        lead: "En Bewohnere mit Demänz verliert d Zweitsprooche zerscht. Was bliibt, isch s Züritüütsch vo ihrere Chindheit — und das isch d Sprooch, wo d Schicht drin lauft.",
      },
    },
    scenes: {
      restaurant: {
        title: "Im Restaurant",
        scene: "Vier feschti Frage und eini, wo über d Rächnig entscheidet. «Zäme oder separat» wird eimal gfrooget, schnell, und wer s falsch verstaht, merkt s am ganze Tisch.",
      },
      "at-work": {
        title: "Bi de Arbet",
        scene: "D Sitzig lauft uf Hochdüütsch oder Änglisch. De Gang, d Kafimaschine und de Moment, wo würkli öppis entschide wird, tüend das nöd.",
      },
      "school-parents": {
        title: "Im Kindsgi",
        scene: "Im Kanton Züri isch de Kindsgi uf Mundart — das hät s Stimmvolk 2011 so entschide. Wer Hochdüütsch glernt hät, merkt das am Elterenaabig, vor allne andere.",
      },
      shopping: {
        title: "Im Lade",
        scene: "Vier Frage, jedes Mal di gliiche, a de Kasse mit ere Schlange dehinter — also grad det, wo Nachefrage am meischte choschtet.",
      },
      tram: {
        title: "Im Tram",
        scene: "Durchsage und Frömdi, beidi schnell. Di ei Situation, wo Nöd-Verstah nöd de Satz choschtet, sondern de Namittag.",
      },
      neighbours: {
        title: "Im Treppehuus",
        scene: "Waschchuchi, Velo im Gang, Abfuhr. En Zädel a de Tür isch da kei Bitt — wer en so liist, wird zur schwirige Nachbere, ohni das es em je öpper seit.",
      },
      appointment: {
        title: "Am Telifon",
        scene: "De schwirigscht Kanal i jedere Frömdsprooch und dää, wo niemert üebt: kei Gsicht, kei Kontext, und öpper, wo e Lischte abschaffet.",
      },
      "small-talk": {
        title: "Am Mittagstisch",
        scene: "D Szene, wägen ere s Heidi git. De Tisch wächslet is Hochdüütsche, sobald er merkt, das Sie kämpfed — und nimmt Ihne grad das wäg, wo hulfe.",
      },
      handover: {
        title: "D Übergab",
        scene: "Kollegin zu Kollegin, nüüt wird langsamer gmacht, niemert wächslet Ihretwege is Hochdüütsche. De schnellscht Moment vom Tag — und dää, wo über di ganz Schicht entscheidet.",
      },
      "morning-care": {
        title: "Am Morge",
        scene: "Churzi Sätz, während beidi Händ bschäftigt sind. Da isch Hochdüütsch nöd di neutrali Variante: Wer mitten i de Pflege d Sprooch wächslet, wirkt wie en anderi Person.",
      },
      pain: {
        title: "Wenn öppis weh tuet",
        scene: "Schmerz redt kei Zweitsprooch. Wer en meldet, formuliert nöd — und wer en falsch verstaht, haltet Schmerz für Unruä.",
      },
      meals: {
        title: "Ässe und Trinke",
        scene: "D Situation, wo am hüüfigschte vorchunt und uf wo sich niemert vorbereitet, wil si eifach tönt.",
      },
      "evening-unrest": {
        title: "Unruä am Aabig",
        scene: "Öpper wott hei, i es Dihei, wo s sit vierzg Jahr nüme git. Was da hilft, isch churz, im Präsens und i de Sprooch, wo d Person drin dänkt.",
      },
      visitors: {
        title: "Bsuech",
        scene: "Uf eimal sind Sie s Huus. D Tochter am Sunntignamittag beurteilt de Betrib dernaa, öb d Person a de Tür ere hät chöne folge.",
      },
    },
  },

};
