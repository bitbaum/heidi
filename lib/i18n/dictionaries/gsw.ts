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
    method: "Methode",
    research: "Forschig",
    check: "Dialekt-Prüefig",
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
    eyebrow: "Schwiizerdütsch · mir foönd a mit Züritüütsch",
    headline: "Schwiizerdütsch verstaa. Und schriibe wie öpper vo do.",
    sub: "Für alli wo Dütsch chönd und am Mittagstisch trotzdem nüüt verstönd. Füged ii, was Si becho händ — oder schriibed, was Si wänd säge.",
    dialectTitle: "Mir foönd a mit Züri",
    dialectBody:
      "Schwiizerdütsch isch kei Sprach, sondern e Familie. Heidi cha hüt Züritüütsch würklich guet und seit Ihne das lieber, als so z tue, als ob si alles chönnti. Grad drum wiist d Prüefig Berner Forme zrugg: nöd wil Bärndütsch falsch wär, sondern wil mir grad Züri unterrichted. Wiiteri Dialekt chömed dezue — jede mit eigene Stimme und eigener Prüefig.",
    dialectPlanned: "Planet",
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
    placeholder: "Füged ii, was Si becho händ — oder schriibed, was Si wänd säge.",
    send: "Schicke",
    thinking: "Heidi liist mit …",
    you: "Si",
    emptyTitle: "Fröged Heidi",
    emptyBody:
      "E Nachricht, en Satz, es einzelns Wort. Heidi merkt sälber, öb Si öppis wänd verstaa oder öppis wänd säge — und Si chönd eifach wiiterfröge.",
    examples: [
      "Im Kauz scho, hät mer nöd so gfalle. Du au?",
      "Säg ihne, dass i zäh Minute spöter chum — fründlich.",
      "Chunnsch au no verbi hüt Abig?",
    ],
    glossTitle: "Wörter wo sölled bliibe",
    suggestionsTitle: "Das chönd Si schicke",
    sendThis: "Das chönd Si schicke",
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
      "Ihres Gspröch bliibt i dem Tab und verschwindet, wänn Si en zue mached. En eigene Schlüssel liit im Spicher vo dem Browser, bis Si en ewägnämed. Uf öisne Server liit nüüt dervo.",
  },

  auth: {
    signIn: "Aamälde",
    signOut: "Abmälde",
    signInWith: "Mit OrangeCat aamälde",
    account: "Konto",
    portalTitle: "Min Bereich",
    portalLead:
      "Do entstaht Ihre persönlich Teil vo Heidi: d Wörter wo Si nachegschlage händ, Lüüt zum Üebe, und Tutorinne und Tutore, wänn Si weli wänd.",
    signedInAs: "Aagmäldet als",
    notSignedIn: "Si sind nöd aagmäldet",
    notSignedInBody:
      "Mälded Si sich a, damit Heidi sich cha merke, was Si na nöd chönnt händ. Ohni Aamäldig funktioniert alles andere wiiterhin — s Übersetze und d Dialektprüefig bruuched kei Konto.",
    whyTitle: "Werum OrangeCat",
    whyBody:
      "Heidi füehrt kei eigeni Benutzerdatebank. Ihri Identität liit bi OrangeCat, wo au Profil und Zahlig scho dihei sind. Das heisst: es Konto für mehreri Produkt, kei wiiters Passwort — und bi öis liit nüüt, wo mer chönnti stähle.",
    soonTitle: "Was als nächts chunt",
    soonList: [
      "Ihri Wörter — was Si nachegschlage händ, chunt spöter wieder.",
      "Lerngruppe — sälber organisiert, mit Heidi als Teilnähmere.",
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
        source: "Gooskens, van Heuven, Golubović, Schüppert, Swarte & Voigt, 2017/18",
      },
      {
        claim: "Konsonanteregle säged Verständlichkeit dütlich besser vorus als Vokalregle.",
        detail:
          "r ≈ −.74 gägenüber −.29. Zwei vo öisne vier Regle uf de Startsiite sind Vokalregle und demit di schwächeri Wett.",
        source: "Gooskens & Heeringa",
      },
      {
        claim: "Training mit vill Stimme isch das, wo uf unbekannti Stimme übergaht.",
        detail:
          "Mit ere einzige Stimm z üebe cha uf grad dere Stimm besser abschniide und übertreit sich nöd. Für regionali Dialekt eigens bestätiget.",
        source: "Logan, Lively & Pisoni 1991; Clopper & Pisoni 2004",
      },
      {
        claim: "Z säge, uf was mer söll lose, isch en Wirkstoff und kei Dekoration.",
        detail:
          "Gliichs Material, gliichi Rückmäldig: glernt het nur d Gruppe, wo uf de relevant Kontrascht hingwise worde isch.",
        source: "Pederson & Guion-Anderson, 2010",
      },
      {
        claim: "Abrüefe mit Rückmäldig schlaht Nachläse.",
        detail: "222 Studie, 48'478 Lernendi; g ≈ 0.50, mit Rückmäldig 0.54 gägenüber 0.37 ohni.",
        source: "Yang, Luo, Vadillo, Yu & Shanks, 2021",
      },
      {
        claim: "Verteilts Üebe schlaht gballts, und de Vorsprung wachst mit de Ziit.",
        detail: "g ≈ 0.76 sofort, g ≈ 1.15 nach Verzögerig, über 48 Experimänt und 3411 Persone.",
        source: "Kim & Webb, 2022",
      },
      {
        claim: "Untertitel hälfed — nach em Hörversuech, nöd während dem.",
        detail:
          "Grosse Effekt uf de Wortschatz (g ≈ 0.87), offebar wil Text hilft, de Lutstrom i Wörter z zerlege. Dauerhaft iigblendete Text wird zur Chrucke.",
        source: "Montero-Perez, Van Den Noortgate & Desmet, 2013",
      },
      {
        claim: "Hörtraining verbesseret s eigene Rede nur schwach.",
        detail: "d ≈ 0.92 für d Wahrnähmig, d ≈ 0.54 für d Produktion, ohni Zämehang zwüsche beidne.",
        source: "Sakai & Moorman, 2018",
      },
      {
        claim: "Dialekt schriibe isch i de Schwiiz digital normal, nöd Slang.",
        detail: "Das isch de Grund, werum «schriibe wie öpper vo do» e echti Kompetänz isch und kei Spielerei.",
        source: "Universität Bern, Texting in Time; UZH, What's Up",
      },
    ],
    hypotheses: [
      {
        claim: "Lautregle wirked als Hiiwiis i de Üebig, obwohl si als Lektion nöd wirked.",
        detail:
          "De einzig suber Tescht vo de Lektionsform — 50 Minute Niderländisch-Friesisch — het kei signifikanti Wirkig zeigt, und d Autore sälber warned dervor, das z verallgemeinere. Di ganz europäisch Interkomprehensions-Didaktik isch nach Uussag vo de füehrende Forschende praktisch nöd evaluiert. Öisi Variante isch also di ungeteschteti. Drum mässed mir si.",
        source: "Bergsma, Swarte & Gooskens, 2014",
      },
      {
        claim: "E churzi Igwöhnig verbesseret mässbar s Verstaa vo ere fremde Stimm.",
        detail:
          "Was nach öppe ere Minute beleit isch, isch e höcheri Verarbeitigsgschwindigkeit — nöd meh verstandeni Wörter. Mir behauptet drum nöd, dass Si nach ere Minute meh verstönd.",
        source: "Clarke & Garrett, 2004",
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
    intro:
      "Füged Text ii, wo söll Züritüütsch sii. Die Prüefig isch e feschti Regellischte — kei Sprachmodell — und markiert Forme, wo us ere andere Dütschschwiizer Region chömed oder i de Schwiiz gar nöd vorchömed.",
    placeholder: "Das isch nid güet, gäu",
    button: "Prüefe",
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
};
