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

  nav: {
    home: "Afang",
    chat: "Chat",
    grammar: "Grammatik",
    dialect: "Mundarte",
    vocabulary: "Wortschatz",
    method: "Methode",
    contribute: "Mitmache",
    about: "Über öis",
    portal: "Min Bereich",
    settings: "Iistellige",
    groupUse: "Bruuche",
    groupWhy: "Werum so",
    groupProject: "Projekt",
    skipToContent: "Zum Inhalt",
    menu: "Menü",
    language: "Sprach uuswähle",
    langNational: "Landessprache",
    langDialect: "Dialäkt",
    langOther: "Wiiteri Sprache",
  },

  footer: {
    tagline: "Züritüütsch verstaa, und denn mitrede.",
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
    checkedNote: "Gäge Zürcher Forme prüeft",
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
      "Ihres Gspröch bliibt i dem Tab und verschwindet, wänn Si en zue mached. En eigene Schlüssel liit im Spicher vo dem Browser, bis Si en ewägnämed. Uf öisne Server liit nüüt dervo. Gmerkti Wörter ligend au da, bis du si lösche tuesch.",
  },

  auth: {
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
        body: "Hüt: Verstaa und Antworte uf echte Text. Als nächts: s Hörlabor, wo Si e Zürcher Stimm ghöred, sich iigwöhned und mir mässed, wie vill Si vo ere andere verstönd. Das bruucht Ufnahme, und die entstönd grad.",
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
      "Konkret heisst das: zerscht wiiteri Dütschschwiizer Dialekt, denn e Sprach usserhalb vo de Schwiiz — diselb Maschine, en andere Sprachsatz. Was mir debii lerned, schriibed mir uf.",
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
    title: "D wichtigschte Wörter",
    lead: "Nöd d Wörter für Tourischte, sondern die, wo en Satz dra hänge bliibt: di churze, ständige, wo kei Lutregel hilft.",
    note: "Richtig: Mundart → Dütsch. Da gaht's ums Verstah, nöd ums Schriibe — was Si sälber schriibe söttet, staht bi de Mundarte.",
    groups: {
      function: "Chliini Wörter, grossi Wirkig",
      verbs: "Verbe wo ständig vorchömed",
      everyday: "Alltag",
      greetings: "Begrüessig und Höflichkeit",
    },
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
    backToAll: "Alli Mundarte",
  },

  grammar: {
    title: "Grammatik",
    lead: "Vier Sache, wo Züritüütsch schwer verständlich mached für öpper, wo scho Dütsch liest. Kei Lektione — nur das, wo Si ghöred, und wo's hakt.",
    ruleLabel: "D Regle",
    watchLabel: "Wo's hakt",
    topics: {
      "no-preterite": {
        title: "Kei Präteritum",
        rule: "Gschwätzts Züritüütsch hät kei eifachi Vergangeheit: alles Vergangene staht im Perfekt.",
        watch: "Si warted uf «ging», «war», «sagte» — und es chunnt nie. Wänn Si «bi», «hät» oder «händ» plus Partizip ghöred, isch das d Vergangeheit.",
      },
      "wo-relative": {
        title: "«wo» statt der, die, das",
        rule: "Relativsätz fanged fascht immer mit «wo» aa, unveränderet, egal weles Gschlächt oder wele Fall.",
        watch: "Si läsed «wo» als «wo?» und verlüüred de Satz. Es heisst da «der», «die», «das» oder «den» — nie en Ort.",
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
};
