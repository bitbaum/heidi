/**
 * German — the source dictionary. Every other locale is typed against this
 * one, so a missing key is a build error rather than an English word showing
 * up in the middle of an Italian page.
 *
 * Swiss Standard German: no ß, ever. The deterministic gate rejects it in
 * dialect, and it would be incoherent for the site around it to use it.
 */
import type { SourceId } from "../../research/sources.ts";

/**
 * The papers a claim rests on.
 *
 * A function rather than a bare array so that `typeof de` — which is the
 * Dictionary type every other locale is checked against — carries `SourceId`
 * instead of widening to `string[]`. That makes a typo in a citation a build
 * error in all seven languages, which is the only way a reference stays
 * attached to the claim it actually supports.
 */
const cite = (...ids: SourceId[]): readonly SourceId[] => ids;

export const de = {
  meta: {
    title: "Heidi — Schweizerdeutsch verstehen",
    description:
      "Verstehen, was um Sie herum wirklich gesprochen wird. Heidi übersetzt echte Nachrichten, erklärt die Wörter, die Sie noch nicht kennen, und prüft jede Antwort auf echte Dialektformen. Wir fangen mit Zürichdeutsch an.",
  },

  /**
   * Gesagt, wenn der Text nicht in der Sprache der Leserin ist.
   *
   * EINE Stelle für alle Seiten, auf denen das vorkommt. Vorher stand es in
   * drei Fassungen an drei Orten — und auf vier Seiten gar nicht.
   */
  language: {
    notYet: "Diesen Text gibt es noch nicht auf Deutsch. Sie lesen ihn auf",
    byDesign:
      "Dieser Text steht nur auf Deutsch und Englisch: Er richtet sich an Menschen, die hier leben. Sie lesen ihn auf",
  },

  nav: {
    home: "Start",
    chat: "Chat",
    organisations: "Für Organisationen",
    speaking: "Sprechen",
    practice: "Übungen",
    listen: "Hören",
    grammar: "Grammatik",
    dialect: "Mundarten",
    essays: "Blog",
    paper: "Whitepaper",
    roadmap: "Fahrplan",
    changelog: "Änderungen",
    vocabulary: "Wortschatz",
    situations: "Situationen",
    method: "Methode",
    technology: "Technik",
    contribute: "Mitmachen",
    about: "Über uns",
    portal: "Mein Bereich",
    settings: "Einstellungen",
    privacy: "Datenschutz",
    impressum: "Impressum",
    investors: "Investoren",
    groupUse: "Benutzen",
    groupLearn: "Lernen",
    groupPractise: "Üben",
    groupAbout: "Über Heidi",
    skipToContent: "Zum Inhalt springen",
    sections: {
      how: "Wie es funktioniert",
      record: "Was wir sagen",
      who: "Wer dahintersteht",
    },
    contents: "Inhalt",
    menu: "Menü",
    language: "Sprache wählen",
    langNational: "Landessprachen",
    langDialect: "Dialekt",
    langOther: "Weitere Sprachen",
  },

  footer: {
    tagline: "Zürichdeutsch verstehen, und dann mitreden.",
    place: "Kanton Zürich, Schweiz",
    varietyName: "Zürichdeutsch",
    builtOn: "Gemacht in Zürich.",
    sections: "Seiten",
    projectTitle: "Projekt",
    languageTitle: "Sprache",
    openSource: "Offen gebaut",
    openSourceNote: "Wir schreiben auf, was wir lernen — auch das, was nicht funktioniert hat.",
    rights: "Heidi, Zürich.",
  },

  home: {
    headline: "Schweizerdeutsch verstehen. Dann schreiben wie jemand von hier.",
    sub: "Für alle, die Deutsch können und am Mittagstisch trotzdem nichts verstehen.",
    dialectTitle: "Wir beginnen mit Zürich",
    dialectBody:
      "Schweizerdeutsch ist keine Sprache, sondern eine Familie. Heidi beherrscht heute Zürichdeutsch richtig gut und sagt Ihnen das lieber, als so zu tun, als könnte es alles. Genau darum weist die Prüfung Berner Formen zurück: nicht weil Berndeutsch falsch wäre, sondern weil wir gerade Zürich unterrichten. Weitere Dialekte kommen dazu — jeder mit eigenen Stimmen und eigener Prüfung.",
    dialectPlanned: "Geplant",
    dialectOthers: "Weitere Mundarten",
    trustTitle: "Jede Zeile wird geprüft, bevor Sie sie sehen",
    trustBody:
      "Ein Sprachmodell, das man um Schweizerdeutsch bittet, liefert bereitwillig Berndeutsch — und Sie hätten keine Möglichkeit, das zu merken. Deshalb entscheidet bei Heidi nicht das Modell, ob etwas Zürichdeutsch ist, sondern eine feste Regelprüfung, die Sie selbst aufrufen können.",
    trustLink: "Prüfung selbst ausprobieren",
    correspondencesTitle: "Ein Dutzend Regeln öffnen Hunderte Wörter",
    pillarsTitle: "Wie Heidi arbeitet",
    methodLink: "Die ganze Methode",
    researchLink: "Was die Forschung sagt",
    contributeTitle: "Wir suchen Zürcher Stimmen",
    contributeBody:
      "Jede Sekunde Dialekt, die Sie bei Heidi hören werden, stammt von einem echten Menschen aus Zürich. Wenn Sie uns beim Sprechen aufnehmen lassen würden, melden Sie sich.",
    contributeCta: "Mitmachen",
  },

  chat: {
    learn: {
      title: "Daraus lernen",
      breakdownLabel: "Wort für Wort",
      breakdown: "Erklär mir «{text}» Wort für Wort.",
      similarLabel: "Ähnlich und Gegenteil",
      similar: "Welche Wörter sagt man in Zürich ähnlich wie «{word}» — und was ist das Gegenteil?",
      storyLabel: "Kurzer Text damit",
      story: "Schreib mir einen kurzen Text auf Züritüütsch mit «{word}», mit Übersetzung.",
      otherWaysLabel: "Anders gesagt",
      otherWays: "Wie kann man «{text}» auf Züritüütsch noch sagen?",
      examplesLabel: "In anderen Sätzen",
      examples: "Gib mir drei weitere Sätze auf Züritüütsch mit «{word}», jeweils mit Übersetzung.",
      aiNote: "Diese Antworten schreibt das Sprachmodell im Chat, geprüft auf Zürcher Formen.",
    },
    /**
     * The dock — Heidi floating over every page that is not already a chat.
     *
     * `prompts` are sent VERBATIM as a message when tapped, so each one has to
     * be a complete question that stands on its own. "What does this word
     * mean?" reads well on a button and arrives at the model with no word
     * attached; these three are answerable exactly as written.
     */
    dock: {
      open: "Heidi fragen",
      close: "Schliessen",
      title: "Heidi",
      lead: "Fragen Sie, was Sie gerade lesen — oder fügen Sie eine Nachricht ein, die Sie bekommen haben.",
      prompts: [
        "Wie sage ich auf Zürichdeutsch, dass ich später komme?",
        "Was ist der Unterschied zwischen Mundart und Schriftdeutsch?",
        "Nennen Sie mir drei Wörter, die ich hier täglich höre.",
      ],
    },
    emptyTitle: "Fragen Sie Heidi",
    placeholder: "Fügen Sie ein, was Sie bekommen haben — oder schreiben Sie, was Sie sagen möchten.",
    composer: "Nachricht an Heidi",
    saveWord: "Wort merken",
    savedWord: "Gemerkt",
    send: "Senden",
    thinking: "Heidi liest mit …",
    you: "Sie",
    exampleUnderstand: "Was heisst das?",
    exampleCompose: "Für mich schreiben",
    examples: [
      { kind: "dialect", text: "Im Kauz scho, hät mer nöd so gfalle. Du au?" },
      { kind: "compose", text: "Sag ihnen, dass ich zehn Minuten später komme — freundlich." },
      { kind: "dialect", text: "Häsch du am Samschtig scho öppis vor?" },
    ],
    glossTitle: "Wörter, die bleiben sollten",
    suggestionsTitle: "Zum Ausprobieren",
    sendThis: "Das können Sie schicken",
    /**
     * The badge on a sendable line that is the WRITTEN standard rather than
     * dialect. The pair is the point: one to send a landlord, one to send a
     * friend, and no way to tell them apart without this.
     */
    writtenStandard: "Schriftdeutsch",
    copy: "Kopieren",
    copied: "Kopiert",
    flagged: "Nicht Zürichdeutsch:",
    checkedNote: "Keine fremden Dialektformen gefunden",
    mic: "Diktieren",
    micStop: "Aufnahme beenden",
    micListening: "Ich höre …",
    micTranscribing: "Wird geschrieben …",
    micProblem: {
      mic: "Kein Zugriff aufs Mikrofon. Sie können weiterhin tippen.",
      silence: "Nichts gehört. Drücken Sie nochmals aufs Mikrofon und sprechen Sie gleich los.",
      unavailable: "Diktieren funktioniert in diesem Browser nicht. Sie können weiterhin tippen.",
    },
    newChat: "Neues Gespräch",
    explanationsIn: "Erklärungen auf Deutsch",
    notConfigured: "Das Sprachmodell ist auf dieser Installation noch nicht eingerichtet.",
    unreachable: "Heidi ist nicht erreichbar. Bitte Verbindung prüfen und nochmals versuchen.",
    stop: "Anhalten",
    stopped: "Angehalten. Die halbe Antwort ist verworfen — sie war noch nicht auf Zürcher Formen geprüft.",
    failed: "Heidi konnte das gerade nicht beantworten. Bitte gleich nochmals versuchen.",
    cannotSeePicture:
      "Heidi kann gerade keine Bilder lesen. Schicken Sie den Text, oder verbinden Sie ein eigenes Modell, das Bilder liest.",
    retry: "Nochmals",
    /**
     * The full-screen chat. Its own object so the homepage box — which shares
     * every other string in here — does not have to carry strings it never
     * renders.
     */
    full: {
      expand: "Vollbild öffnen",
      title: "Chat",
      yourChats: "Ihre Gespräche",
      noChats: "Noch keine Gespräche.",
      untitled: "Ohne Titel",
      rename: "Umbenennen",
      save: "Speichern",
      cancel: "Abbrechen",
      delete: "Löschen",
      deleteAsk: "Dieses Gespräch löschen?",
      deleteYes: "Endgültig löschen",
      onThisDevice: "Dieses Gespräch liegt nur in diesem Browser.",
      signInToKeep: "Anmelden, um es zu behalten",
      adoptTitle: "Dieses Gespräch behalten?",
      adoptBody: "Sie haben geschrieben, bevor Sie sich angemeldet haben. Heidi kann das Gespräch in Ihrem Konto speichern — oder es hier im Browser lassen.",
      adoptKeep: "Ja, speichern",
      adoptDiscard: "Hier lassen",
      menuOpen: "Gespräche",
      menuClose: "Schliessen",
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
      title: "Und jetzt?",
      reply: { label: "Antwort schreiben", say: "Wie antworte ich darauf?" },
      grammar: { label: "Die Grammatik dazu", say: "Erklären Sie mir die Grammatik dahinter." },
      shorter: { label: "Kürzer", say: "Fassen Sie das kürzer." },
      warmer: { label: "Wärmer", say: "Sagen Sie das etwas herzlicher." },
      firmer: { label: "Bestimmter", say: "Sagen Sie das bestimmter — ich habe schon zweimal gefragt." },
      formal: { label: "Förmlicher", say: "Schreiben Sie das förmlicher, für eine offizielle Nachricht." },
      casual: { label: "Lockerer", say: "Sagen Sie das lockerer, unter Freunden." },
      simpler: { label: "Einfacher", say: "Sagen Sie das mit einfacheren Wörtern." },
      decline: { label: "Höflich absagen", say: "Schreiben Sie das als höfliche Absage." },
      apologise: { label: "Entschuldigen", say: "Schreiben Sie das als Entschuldigung." },
      thank: { label: "Danken", say: "Schreiben Sie das als Dank." },
      ask: { label: "Nachfragen", say: "Formulieren Sie eine Rückfrage — ich habe das nicht ganz verstanden." },
      swiss: { label: "Auf Schriftdeutsch", say: "Schreiben Sie das auf Schweizer Schriftdeutsch, nicht auf Mundart." },
    },
  },

  model: {
    attach: "Bild anhängen",
    attachNeedsKey: "Ihr verbundenes Modell kann keine Bilder lesen",
    remove: "Entfernen",
    connectTitle: "Ihr eigenes Modell verbinden",
    connectLead:
      "Heidi liest Screenshots gratis. Mit einem eigenen API-Schlüssel werden die Antworten schärfer — besonders bei einem dicht beschriebenen Bild — und die Anfragen laufen über Ihren Anbieter statt über unseren.",
    whyTitle: "Warum nicht einfach inklusive?",
    whyBody:
      "Weil Bilderkennung pro Bild kostet. Würden wir das für alle bezahlen, müssten wir Heidi kostenpflichtig machen. So bleibt alles andere gratis, und wer mehr will, bringt seinen eigenen Schlüssel mit.",
    safetyTitle: "Wohin Ihr Schlüssel geht",
    safetyBody:
      "Er bleibt in diesem Browser. Bei jeder Nachricht wird er verschlüsselt an uns geschickt, einmal beim Anbieter verwendet und sofort verworfen. Wir speichern ihn nicht, schreiben ihn in kein Log und geben ihn nie zurück.",
    providerLabel: "Anbieter",
    keyLabel: "API-Schlüssel",
    keyPlaceholder: "sk-…",
    modelLabel: "Modell",
    getKey: "Schlüssel holen",
    test: "Verbinden und testen",
    testing: "Wird geprüft …",
    connected: "Verbunden",
    connectedWith: "Verbunden mit",
    failed: "Das hat nicht geklappt",
    disconnect: "Schlüssel entfernen",
    canSee: "Kann Bilder lesen",
    textOnly: "Nur Text",
    open: "Eigenes Modell",
    imageTooBig: "Dieses Bild lässt sich nicht verwenden.",
    imagesLabel: "Angehängt",
  },

  pillars: [
    {
      title: "Verstehen kommt zuerst",
      body: "Hören vor Sprechen. In der Schweiz ist es ein vollwertiger und anerkannter Weg dazuzugehören, Dialekt zu verstehen und auf Hochdeutsch zu antworten. Es ist ausserdem der einzige Weg, den Input nicht zu verlieren: Sobald jemand merkt, dass Sie kämpfen, wird auf Hochdeutsch gewechselt.",
    },
    {
      title: "Das echte Leben ist der Lehrplan",
      body: "Keine erfundenen Übungen. Die Nachricht, die heute Morgen angekommen ist, der Satz vom Mittagstisch, die Absage, die Sie schreiben müssen — das ist das Material. Heidi hilft sofort und merkt sich dabei, was Sie noch nicht konnten.",
    },
    {
      title: "Gemessen, nicht vergoldet",
      body: "Keine Serien, keine Punkte, keine erfundenen Prozentzahlen. Die Zahl, die wir Ihnen zeigen wollen, ist, wie viel Sie von einer unbekannten Zürcher Stimme verstehen — vorher und nachher.",
    },
  ],

  method: {
    contents: "Auf dieser Seite",
    title: "Die Methode",
    lead: "Heidi ist nach dem gebaut, was die Forschung tatsächlich zeigt — und nicht nach dem, was sich als Sprachkurs gut verkauft. Das führt zu ein paar Entscheidungen, die auf den ersten Blick seltsam wirken.",
    sections: [
      {
        title: "Die Falle, aus der Heidi heraushilft",
        body: "Sie lernen Deutsch, ziehen nach Zürich und stellen fest, dass es nicht hilft. Am Tisch wird Dialekt gesprochen, Sie verstehen fast nichts, und weil man Ihnen das ansieht, wechseln alle höflich auf Hochdeutsch oder Englisch. Genau der Input, der Sie besser machen würde, wird Ihnen entzogen, weil Sie ihn nötig hätten. Heidi ist eine Quelle von Dialekt, die nicht wegschaltet.",
      },
      {
        title: "Kontakt schlägt Regeln",
        body: "In der grössten Untersuchung dazu, wie Menschen nah verwandte Sprachen verstehen, war die blosse Menge an Kontakt wichtiger als jedes Mass für sprachliche Distanz. Nicht die Grammatik entscheidet, sondern wie viel Sie gehört haben. Deshalb ist Heidi keine Lektionsreihe, sondern ein Ort, an dem ständig echter Dialekt vorbeikommt.",
      },
      {
        title: "Regeln gehören in die Übung, nicht davor",
        body: "Chind, Huus, isch, guet — die Lautregeln sind echt und sie sind nützlich. Aber der einzige saubere Test einer Regelstunde vorab zeigte keine messbare Wirkung. Was dagegen nachweislich wirkt: jemandem sagen, worauf er hören soll, genau bevor er es nochmals hört. Heidi zeigt deshalb immer nur eine Regel, immer neben einem konkreten Wort.",
      },
      {
        title: "Die Prüfung ist immer eine neue Stimme",
        body: "Sich an eine einzelne Sprecherin zu gewöhnen ist leicht und beweist nichts. Was zählt, ist, ob das Gelernte auf eine Stimme übergeht, die Sie noch nie gehört haben. Deshalb wird bei Heidi mit vielen Sprecherinnen und Sprechern geübt und immer mit einer unbekannten geprüft.",
      },
      {
        title: "Sprechen kommt zuletzt — und das ist kein Mangel",
        body: "Erwachsene erreichen im Zweitdialekt selten muttersprachliche Aussprache, und in der Schweiz ist das weniger schlimm als fast überall sonst: Dialekt verstehen und Hochdeutsch antworten ist normal und wird respektiert. Heidi verkauft Ihnen deshalb nicht, dass Hörtraining Ihr Sprechen verbessert — die Evidenz dafür ist schwach.",
      },
    ],
    loopTitle: "Die Schleife",
    loopSteps: [
      "Sie bekommen etwas, das Sie nicht verstehen.",
      "Heidi erklärt es sofort — vollständig, nicht als Rätsel.",
      "Ein oder zwei Wörter bleiben hängen, weil sie Ihnen erklärt wurden, als Sie sie brauchten.",
      "Dieselben Wörter tauchen später wieder auf, in einem anderen Satz.",
      "Irgendwann begegnen Sie ihnen draussen, und Heidi war nicht dabei.",
    ],
    loopNote:
      "Das letzte ist das Ziel. Die meisten Programme wollen, dass Sie wiederkommen. Ein Lernprodukt sollte wollen, dass Sie es immer weniger brauchen.",
  },

  research: {
    title: "Was die Forschung sagt",
    lead: "Sprachlernprodukte sammeln Pseudowissenschaft an, weil aus «es gibt eine Studie» sehr schnell «das ist bewiesen» wird und daraus ein ganzes Produkt. Wir halten drei Dinge auseinander: was belegt ist, was wir vermuten, und was einfach eine Entscheidung ist.",
    factTitle: "Belegt",
    factNote: "Darauf stützen wir uns.",
    hypothesisTitle: "Vermutung",
    hypothesisNote: "Plausibel, ungetestet — und Heidi ist das Messgerät.",
    decisionTitle: "Entscheidung",
    decisionNote: "Produktentscheide, die auch dann richtig bleiben, wenn sich die Vermutung nicht bestätigt.",
    facts: [
      {
        claim: "Kontakt schlägt sprachliche Distanz.",
        detail:
          "Über 1833 Hörerinnen und 70 Sprachpaare hinweg war Kontakt mit der Testsprache wichtiger als lexikalische, lautliche oder orthografische Distanz.",
        source: cite("gooskens-2018"),
      },
      {
        claim: "Training mit vielen Stimmen ist das, was auf unbekannte Stimmen übergeht.",
        detail:
          "Mit einer einzigen Stimme zu üben kann auf genau dieser Stimme besser abschneiden und überträgt sich nicht. Für regionale Dialekte eigens bestätigt.",
        source: cite("lively-1993", "clopper-2004"),
      },
      {
        claim: "Zu sagen, worauf man hören soll, ist ein Wirkstoff und nicht Dekoration.",
        detail:
          "Gleiches Material, gleiche Rückmeldung: gelernt hat nur die Gruppe, die auf den relevanten Kontrast hingewiesen wurde.",
        source: cite("pederson-2010"),
      },
      {
        claim: "Abrufen mit Rückmeldung schlägt Nachlesen.",
        detail: "222 Studien, 48'478 Lernende; g ≈ 0.50, mit Rückmeldung 0.54 gegenüber 0.37 ohne.",
        source: cite("yang-2021"),
      },
      {
        claim: "Verteiltes Üben schlägt geballtes, und der Vorsprung wächst mit der Zeit.",
        detail: "g ≈ 0.76 sofort, g ≈ 1.15 nach Verzögerung, über 48 Experimente und 3411 Personen.",
        source: cite("kim-webb-2022"),
      },
      {
        claim: "Untertitel helfen — nach dem Hörversuch, nicht währenddessen.",
        detail:
          "Grosser Effekt auf Wortschatz (g ≈ 0.87), offenbar weil Text hilft, den Lautstrom in Wörter zu zerlegen. Dauerhaft eingeblendeter Text wird zur Krücke.",
        source: cite("montero-perez-2013"),
      },
      {
        claim: "Hörtraining verbessert das eigene Sprechen nur schwach.",
        detail: "d ≈ 0.92 für die Wahrnehmung, d ≈ 0.54 für die Produktion, ohne Zusammenhang zwischen beiden.",
        source: cite("sakai-moorman-2018"),
      },
      {
        claim: "Dialekt zu schreiben ist in der Schweiz digital normal, nicht Slang.",
        detail: "Das ist der Grund, warum «schreiben wie jemand von hier» eine echte Kompetenz ist und keine Spielerei.",
        source: cite("whatsup-uzh"),
      },
    ],
    hypotheses: [
      {
        claim: "Konsonantenregeln könnten die Verständlichkeit besser vorhersagen als Vokalregeln.",
        detail:
          "Belegt ist, dass lautliche Distanz die Verständlichkeit besser vorhersagt als lexikalische. Die konkreten Zahlen, mit denen diese Seite früher Konsonanten gegen Vokale stellte, konnten wir in keiner zugänglichen Quelle nachprüfen — also steht die Aussage hier und nicht unter «Gesichert». Zwei unserer vier Regeln auf der Startseite sind Vokalregeln und damit die schwächere Wette.",
        source: cite("gooskens-2007"),
      },
      {
        claim: "Lautregeln wirken als Hinweis in der Übung, obwohl sie als Lektion nicht wirken.",
        detail:
          "Der einzige saubere Test der Lektionsform — 50 Minuten Niederländisch-Friesisch — zeigte keine signifikante Wirkung, und die Autoren selbst warnen davor, das zu verallgemeinern. Die gesamte europäische Interkomprehensions-Didaktik ist nach Aussage der führenden Forschenden praktisch nicht evaluiert. Unsere Variante ist also die ungetestete. Deshalb messen wir sie.",
        source: cite("bergsma-2014"),
      },
      {
        claim: "Eine kurze Eingewöhnung verbessert messbar das Verstehen einer fremden Stimme.",
        detail:
          "Was nach rund einer Minute belegt ist, ist eine höhere Verarbeitungsgeschwindigkeit — nicht mehr verstandene Wörter. Wir behaupten deshalb nicht, dass Sie nach einer Minute mehr verstehen.",
        source: cite("clarke-garrett-2004"),
      },
    ],
    decisions: [
      "Hören vor Schreiben vor Sprechen — begründet durch die Sprachsituation, nicht nur durch Evidenz.",
      "Gemessen statt vergoldet. Keine Serien, keine Punkte.",
      "Die Prüfstimme ist immer eine, die Sie nicht gehört haben.",
      "Echte Zürcher Aufnahmen, weil jedes verfügbare Zürcher Korpus nur für die Forschung lizenziert ist.",
      "Das Modell urteilt nie über den eigenen Dialekt.",
    ],
    honestyTitle: "Wo wir uns korrigiert haben",
    honestyBody:
      "Auf dieser Seite stand einmal, die Lektionsvariante der Lautregeln sei «getestet worden und habe nicht funktioniert». Das trägt eine einzelne 50-Minuten-Studie nicht, und es liess unsere eigene Variante belegt aussehen, obwohl sie die ungetestete ist. Ebenso stand hier, es gebe keine kaufbare Schweizerdeutsch-Sprachsynthese; das stimmt so heute nicht mehr.",
  },

  check: {
    title: "Dialekt-Check",
    intro: "Eine feste Regelliste — kein Sprachmodell. Sie prüft jede Zeile, die Heidi Ihnen zeigt. Hier können Sie die Liste selbst laufen lassen.",
    placeholder: "Das isch nid güet, gäu",
    button: "Prüfen",
    failed: "Die Prüfung war gerade nicht erreichbar. Bitte nochmals versuchen.",
    ok: "Keine fremden Formen gefunden. Das kann als Zürichdeutsch durchgehen.",
    okShort: "Sauber",
    failShort: "Gefunden",
    suggests: "besser",
    whyTitle: "Warum das keine Kleinigkeit ist",
    whyBody:
      "Berndeutsch, Baseldeutsch und Ostschweizer Formen sind vollkommen korrekte Wörter — einfach nicht hier. Wer Zürichdeutsch lernt, kann den Unterschied per Definition nicht hören. Genau deshalb darf diese Entscheidung nicht bei einem Sprachmodell liegen.",
    noteTitle: "Zur Rechtschreibung",
    noteBody:
      "Zürichdeutsch hat keine offizielle Rechtschreibung. Diese Prüfung sagt Ihnen nie, dass Ihre Schreibweise falsch ist — nur, dass eine Form aus einer anderen Region kommt.",
  },

  /**
   * The technology page. Prose only — every hour, speaker count, error rate
   * and licence lives in `lib/research/language-tech.ts`, because a number is
   * not translatable and seven copies of "343 hours" are seven chances for one
   * of them to become 340. Same decision as the dialect area pages.
   */
  technology: {
    title: "Was ein Computer mit Schweizerdeutsch kann",
    lead: "Und was er nicht kann. Diese Seite sammelt, was in diesem Feld wirklich gemessen wurde — mit Zahlen und Quellen, damit Sie unsere Aussagen daran prüfen können.",
    hardTitle: "Warum es schwierig ist",
    hardBody: [
      "Es gibt keine offizielle Rechtschreibung. Es gibt Empfehlungen aus dem Jahr 1938, die in der Dialektforschung benutzt werden — aber selbst geschulte Leute wenden sie unterschiedlich an, und kaum jemand schreibt so, wenn er einer Freundin schreibt.",
      "Gesprochen wird Mundart, geschrieben wird Hochdeutsch. Deshalb ist «aufschreiben, was gesagt wurde» hier keine Transkription, sondern eine Übersetzung — und genau so ist fast jedes System gebaut, das es gibt.",
      "Und es ist eine kleine Sprache im Datensinn: die grössten öffentlichen Sammlungen sind ein paar hundert Stunden, und fast alle sind nur für die Forschung lizenziert.",
    ],
    corporaTitle: "Woher die Daten kommen",
    corporaLead: "Die öffentlichen Sammlungen, auf denen dieses Feld steht. Die Spalte «Richtung» ist die wichtigste: sie zeigt, dass fast alles Mundart hört und Hochdeutsch schreibt.",
    asrTitle: "Verstehen",
    asrLead: "Wortfehlerrate auf demselben Testsatz, damit die Zahlen vergleichbar sind. Alle diese Systeme schreiben Schriftdeutsch — die Zahl sagt, wie gut übersetzt wurde, nicht wie gut Mundart geschrieben wurde.",
    speakingTitle: "Sprechen",
    speakingLead: "Hier ist der Markt irreführend. Was als «Schweizerdeutsche Stimme» verkauft wird, ist meist Schweizer Hochdeutsch — die geschriebene Sprache, vorgelesen. Echte Mundart-Synthese gibt es fast nur in der Forschung.",
    modelsTitle: "Sprachmodelle",
    modelsLead: "Ob ein Modell Mundart wirklich kann, oder ob das nur in der Medienmitteilung steht. «Geprüft» heisst: jemand hat es gemessen und veröffentlicht.",
    heidiTitle: "Was das für Heidi heisst",
    heidiBody: [
      "Das Diktieren schreibt nicht Mundart auf. Es schreibt, was Sie sagen wollen, in der Sprache, die Sie schon können — genau das, was die Forschung kann.",
      "Heidi liest vor, behauptet aber nie, Mundart zu sprechen. Ein Synthesizer, den man um Zürichdeutsch bittet, liefert bestenfalls Schweizer Hochdeutsch — also sagt die Stimme, was sie ist, und schweigt lieber, als Ihnen eine englische Stimme zu geben, die Züritüütsch vorliest.",
      "Die Dialektprüfung läuft ohne Modell. Sie ist eine feste Regelliste, kein Sprachmodell — deshalb kann sie nicht anfangen, sich Dinge auszudenken.",
    ],
    engineTitle: "Welches Modell Ihnen antwortet",
    engineLead:
      "Gelesen aus der Kette, die die Anfrage tatsächlich nimmt — nicht aus einem Satz, den jemand einmal aufgeschrieben hat. Darum kann hier kein Modell stehen, das es längst nicht mehr gibt.",
    engineNotes: [
      "Die Reihenfolge ist keine Rangliste. Die Kette ist nach Knappheit geordnet: Wer am wenigsten Kapazität hat, wird zuletzt belastet. Der erste Eintrag ist der mit Platz, nicht der beste.",
      "Keines dieser Modelle ist die Instanz für Zürichdeutsch. Das ist das Pack. Jede erzeugte Zeile läuft durch eine regelbasierte Prüfung, bevor sie jemand sieht — und diese Prüfung ist selbst kein Modell.",
      "Ohne Schlüssel oder ohne Kontingent antwortet die Route mit 503 und sagt das. Sie tut nicht so, als hätte sie eine Antwort.",
    ],
    directionLabel: "Richtung",
    directions: {
      "speech-to-standard": "Mundart gehört → Hochdeutsch geschrieben",
      "speech-to-dialect": "Mundart gehört → Mundart geschrieben",
      "dialect-text": "Mundart geschrieben",
      "text-to-speech": "Text → Mundart gesprochen",
    },
    hours: "Stunden",
    speakers: "Sprechende",
    regions: "Regionen",
    licence: "Lizenz",
    licences: { research: "nur Forschung", unpublished: "keine Lizenz veröffentlicht", textOnly: "Text; Audio auf Anfrage" },
    wer: "Wortfehlerrate",
    zeroShot: "ohne Training",
    fineTuned: "nachtrainiert",
    speakingNames: {
      swissVendors: "Schweizer Anbieter mit Mundart-Angebot",
      commercial: "Kommerzielle «de-CH»-Stimmen",
      eth: "ETH Zürich, Swiss Voice",
      vits: "T5 und VITS, Forschungspipeline",
      voiceCloning: "Stimmübertragung aus Podcasts",
    },
    weightsOpen: "Gewichte offen",
    weightsClosed: "Gewichte nicht veröffentlicht",
    isDialect: "Mundart",
    isStandard: "Schweizer Hochdeutsch",
    evaluated: "Mundart geprüft",
    notEvaluated: "Mundart nicht geprüft",
    statusResearch: "Forschung",
    statusService: "Dienst",
    statusClosed: "eingestellt",
    evalTitle: "Was Heidi misst, wenn Sie sprechen",
    evalLead:
      "Die Sprechübung nimmt Sie auf und meldet, was sich tatsächlich messen lässt — und sagt dazu, in welcher Sprache gemessen wurde. Keine Note von hundert, nirgends.",
    evalNames: {
      delivery: "Sprechfluss",
      fluency: "Tempo und Läufe",
      words: "Wörter und Formen",
      grammar: "Grammatik",
      pronunciation: "Aussprachenote",
    },
    evalWhat: {
      delivery:
        "Wo Ton war und wo nicht: Pausen, wie lang die längste war, wie viel der Aufnahme Sie wirklich gesprochen haben. Das braucht kein Transkript und funktioniert deshalb für eine Mundart, die niemand aufschreiben kann.",
      fluency:
        "Silben pro Sekunde, und wie lange Sie sprechen, bevor Sie anhalten. Flüssigkeit im Sinne der Forschung — wie ein Gedanke herauskommt, nicht wie gut er klingt.",
      words:
        "Welche Wörter Sie gewählt haben, geprüft an derselben festen Regelliste wie die Dialektprüfung. Nicht die Meinung eines Modells.",
      grammar:
        "Kongruenz, Fälle, Verbformen. Immer nur aus einem Transkript in der Sprache, die Sie wirklich gesprochen haben — sonst korrigiert man Wörter, die die Maschine erfunden hat.",
      pronunciation:
        "Wird nicht erstellt. Eine Note gegen ein muttersprachliches Ideal ist ein Urteil über einen Menschen, und keine bessere Erkennung würde sie ehrlich machen.",
    },
    evalVerdicts: {
      target: "im Dialekt",
      bridge: "auf Schweizer Hochdeutsch",
      none: "noch nicht möglich",
      refused: "bewusst nicht angeboten",
    },
    evalRefusedNote:
      "Genau damit wirbt jeder Mitbewerber. Es ist die Zeile, die wir absichtlich leer lassen.",
    evalFormLimit: "keine Formen beurteilt über",
    evalSource: "im Code",
  },

  /**
   * The privacy page. Short LABELS only — every fact it prints (where a thing
   * lives, who receives it, which storage key) comes from
   * `lib/config/privacy.ts`, because a fact is not a translation and seven
   * copies of "Falkenstein" are seven chances for one to say Zurich.
   *
   * `bindingNote` is not boilerplate. A legal text nobody on this project can
   * read is worse than one clearly marked as a courtesy translation, and the
   * repo already refuses to machine-translate claims it cannot check — the
   * dialect area pages carry no prose for the same reason.
   */
  privacy: {
    title: "Was mit Ihren Worten passiert",
    lead: "Heidi liest Nachrichten, die Menschen einander geschickt haben. Das ist heikel, deshalb steht hier genau, was wo liegt und wer es sonst noch sieht.",
    bindingNote: "Massgebend ist die deutsche Fassung.",
    flowsTitle: "Was wo liegt",
    flowsLead: "Jede Zeile nennt den Speicherort, damit Sie es selbst nachprüfen können.",
    detail: {
      pictures: "im Browser verkleinert; gespeichert wird nur die Anzahl",
      speakingTranscription: "nur wenn Sie Hochdeutsch wählen; die Aufnahme bewahren wir nicht auf, die Grammatik wird auf unserem eigenen Server geprüft",
      speakingSuggestion: "nur der Satz, den Sie bestätigt haben",
      account: "nur die Kennung, kein Name und keine Adresse",
    },
    place: { device: "Nur auf Ihrem Gerät", server: "Auf unserem Server", vendor: "Bei einem Anbieter" },
    col: { what: "Was", where: "Wo", who: "Wer es sonst sieht" },
    nobody: "niemand sonst",
    flows: {
      draftConversation: "Gespräch ohne Konto",
      savedConversation: "Gespräch mit Konto",
      savedWords: "Gemerkte Wörter",
      practiceSeen: "Bereits gestellte Fragen",
      practiceModel: "Woran Sie noch arbeiten",
      streak: "Ihre Serie und Ihr Wochenziel",
      ownKey: "Ihr eigener API-Schlüssel",
      theme: "Helle oder dunkle Darstellung",
      dictationVerdict: "Ob das Diktat in diesem Browser geht",
      dictation: "Diktieren",
      pictures: "Bilder",
      speakingTakes: "Sprechaufnahmen",
      speakingTranscription: "Aufnahme zum Mitschreiben",
      speakingSuggestion: "Satz zum Prüfen",
      account: "Konto",
      groups: "Lerngruppen",
      feedback: "Rückmelde-Fenster",
    },
    hostingTitle: "Wo der Server steht",
    hostingNote: "Nicht in der Schweiz. Das sagen wir lieber selbst, als dass Sie es herausfinden.",
    vendorsTitle: "Wer die Nachrichten beantwortet",
    vendorsNote: "Eine Nachricht wird an eines dieser Unternehmen geschickt, um beantwortet zu werden. Wir haben mit keinem davon einen Auftragsverarbeitungsvertrag. Für Personendaten aus einem Beruf mit Schweigepflicht ist Heidi darum heute nicht geeignet.",
    broughtKeyNote: "Mit eigenem Schlüssel geht die Nachricht stattdessen an den Anbieter, den Sie wählen.",
    notDoneTitle: "Was wir nicht tun",
    notDone: {
      analytics: "Keine Analyse-Werkzeuge",
      advertising: "Keine Werbung",
      profileSale: "Kein Verkauf von Daten",
      trackingCookies: "Keine Tracking-Cookies",
    },
    notDoneNote: "Nachprüfbar: Der Quelltext ist offen, und ein Test hält diese Aussage aktuell.",
    rightsTitle: "Löschen",
    rightsBody: "Was auf Ihrem Gerät liegt, entfernen Sie selbst in den Einstellungen. Gespeicherte Gespräche löschen Sie im Chat; dabei verschwindet der Text wirklich. Für alles andere schreiben Sie uns.",
    contactTitle: "Kontakt",
    updatedLabel: "Stand",
  },

  impressum: {
    title: "Impressum",
    operatorLabel: "Betrieben von",
    contactLabel: "Kontakt",
    sourceLabel: "Quelltext",
    statusLabel: "Rechtsform",
    statusNote: "Heidi ist kein eingetragenes Unternehmen. Die Seite wird privat betrieben, der Quelltext ist offen.",
    addressNote: "Eine Postadresse nennen wir, sobald es eine gibt.",
  },

  contribute: {
    title: "Wir suchen Zürcher Stimmen",
    lead: "Jede Sekunde Dialekt, die Sie bei Heidi hören werden, kommt von einem echten Menschen aus Zürich. Das ist teuer und langsam, und wir machen es trotzdem.",
    whyTitle: "Warum nicht einfach synthetische Stimmen",
    whyBody:
      "Der ehrliche Grund ist nicht, dass es keine Schweizerdeutsch-Sprachsynthese gäbe — es gibt inzwischen welche. Der Grund ist die Lizenz. Jedes Zürcher Sprachkorpus, das wir gefunden haben, ist für die Forschung freigegeben und nicht für ein Produkt. Wer echtes, sauber lizenziertes Zürichdeutsch mit Einwilligung braucht, muss es selbst aufnehmen. Dazu kommt, was synthetische Stimmen ohnehin schlecht können: Tempo, Nuscheln, Zögern, der Unterschied zwischen zwei Menschen aus demselben Quartier.",
    needTitle: "Was wir brauchen",
    needList: [
      "Menschen, die im Kanton Zürich aufgewachsen sind oder lange hier leben.",
      "Ganz gewöhnliche Sätze — kein Vorlesen von Literatur.",
      "Verschiedene Altersgruppen, Geschlechter, Quartiere, Sprechtempi.",
      "Zwanzig Minuten Ihrer Zeit, bei Ihnen oder bei uns.",
    ],
    rolesTitle: "Vier Arten mitzumachen",
    rolesLead:
      "Nach Aufwand geordnet, das Kleinste zuerst — und das Kleinste ist uns am meisten wert. Bei jeder steht, was es dafür heute im Produkt schon gibt.",
    todayLabel: "Stand heute",
    roleCta: "Schreiben Sie uns dazu",
    roleSee: "Ansehen",
    learnerTitle: "Und wenn Sie lernen",
    consentTitle: "Was mit der Aufnahme passiert",
    consentBody:
      "Sie behalten die Kontrolle. Wir sagen Ihnen vorher, wofür die Aufnahme verwendet wird, Sie können sie zurückziehen, und die Einwilligung für das Produkt ist nicht dieselbe wie eine Einwilligung für Forschung. Wir gehen davon aus, dass Sie Letzteres nicht wollen, solange Sie es nicht ausdrücklich sagen.",
    ctaTitle: "Melden Sie sich",
    ctaBody: "Eine kurze Nachricht genügt. Schreiben Sie uns, aus welchem Teil des Kantons Sie kommen.",
    ctaButton: "E-Mail schreiben",
  },

  about: {
    title: "Über Heidi",
    lead: "Heidi wird in Zürich gemacht, von Leuten, die dasselbe Problem hatten. Wir bauen offen — auch die Teile, die nicht funktioniert haben.",
    sections: [
      {
        title: "Warum es das gibt",
        body: "Weil sehr viele Menschen hier den gleichen Weg gehen: Deutsch lernen, herziehen, und dann feststellen, dass der entscheidende Teil der Sprache gar nicht geschrieben wird. Das ist kein Nischenproblem, sondern die Standarderfahrung in dieser Stadt.",
      },
      {
        title: "Wie wir arbeiten",
        body: "Wir haben zuerst gelesen, was die Forschung sagt, und erst danach gebaut. Drei Befunde haben den Plan umgeworfen, den wir sonst umgesetzt hätten. Was wir dabei gelernt haben, steht auf der Forschungsseite — samt den Stellen, an denen wir uns öffentlich korrigieren mussten.",
      },
      {
        title: "Was noch fehlt",
        body: "Heute: Verstehen und Antworten auf echten Text, eine Antwort vorgelesen bekommen, und ein Verzeichnis, wo am Radio und am Fernsehen wirklich Mundart gesprochen wird. Als Nächstes: das Hörlabor, in dem Sie eine Zürcher Stimme hören, sich eingewöhnen und wir messen, wie viel Sie von einer anderen verstehen. Das braucht Aufnahmen, und die entstehen gerade.",
      },
    ],
    stateTitle: "Stand heute",
  },

  settings: {
    /**
     * Appearance. The palette existed long before the control did: the dark
     * blocks in globals.css are guarded on `data-theme`, and nothing set it.
     *
     * "System" is named as a real option rather than implied by the absence of
     * the other two, because it is the default and the right answer for most
     * readers — a device that turns dark at dusk should take Heidi with it.
     */
    appearanceTitle: "Darstellung",
    appearanceBody: "Hell, dunkel, oder wie es Ihr Gerät gerade eingestellt hat. Die Wahl bleibt in diesem Browser.",
    theme: { label: "Darstellung", system: "Gerät", light: "Hell", dark: "Dunkel" },
    title: "Einstellungen",
    lead: "Alles, was Heidi über Sie weiss, an einem Ort — und alles davon können Sie wieder entfernen.",
    languageTitle: "Sprache der Seite",
    languageBody: "In welcher Sprache Heidi mit Ihnen spricht. Was Sie lernen, bleibt Zürichdeutsch.",
    modelTitle: "Sprachmodell",
    modelBody: "Standardmässig benutzt Heidi kostenlose Modelle, die Bilder lesen können. Ein eigener Schlüssel macht die Antworten schärfer.",
    modelNone: "Kein eigenes Modell verbunden",
    accountTitle: "Konto",
    accountBody: "Zum Speichern Ihrer Wörter und für Lerngruppen. Zum Übersetzen brauchen Sie kein Konto.",
    dataTitle: "Was auf diesem Gerät liegt",
    dataBody:
      "Ihr Gespräch bleibt in diesem Browser — auch wenn Sie den Tab schliessen — bis Sie «Neues Gespräch» drücken. Angemeldet wird es stattdessen auf unserem Server gespeichert. Um beantwortet zu werden, geht jede Nachricht an einen Modellanbieter. Ein eigener Schlüssel und gemerkte Wörter liegen nur hier.",
    dataEmpty: "In diesem Browser liegt nichts von Ihnen.",
    dataForget: "Löschen",
    dataExport: "Alles herunterladen",
  },

  auth: {
    sections: {
      focus: "Woran Sie hängen",
      mastered: "Können",
      review: "Wiederholen",
      recent: "Gespräche",
      patterns: "Muster",
      words: "Wörter",
      groups: "Gruppen",
      onward: "Weiter",
    },
    /**
     * One line under each entry of the avatar menu, saying what is behind it.
     *
     * Keyed by `AccountMenuKey`, so an entry added to the menu without a
     * description — or a description for a menu entry that no longer exists —
     * is a build error in all seven languages at once.
     */
    menu: {
      portal: "Ihre Wörter und Gespräche",
      settings: "Sprache, Modell, Konto",
    },
    signIn: "Anmelden",
    signOut: "Abmelden",
    signInWith: "Mit OrangeCat anmelden",
    account: "Konto",
    portalTitle: "Mein Bereich",
    portalLead:
      "Ihre Wörter, wenn es Zeit ist, sie wieder anzuschauen — und was Ihnen dabei immer wieder begegnet.",
    signedInAs: "Angemeldet als",
    notSignedIn: "Sie sind nicht angemeldet",
    notSignedInBody:
      "Melden Sie sich an, damit Heidi sich merken kann, was Sie noch nicht konnten. Ohne Anmeldung funktioniert alles andere weiterhin — das Übersetzen und die Dialektprüfung brauchen kein Konto.",
    whyTitle: "Warum OrangeCat",
    whyBody:
      "Heidi führt keine eigene Benutzerdatenbank. Ihre Identität liegt bei OrangeCat, wo auch Profile und Bezahlung schon zuhause sind. Das heisst: ein Konto für mehrere Produkte, kein weiteres Passwort — und bei uns liegt nichts, was gestohlen werden könnte.",
    soonTitle: "Was als Nächstes kommt",
    soonList: [
      "Tutorinnen und Tutoren — freiwillig, bezahlt, und nie Pflicht.",
    ],
    unavailable: "Die Anmeldung ist auf dieser Installation noch nicht eingerichtet.",
    errorTitle: "Die Anmeldung hat nicht geklappt",
    errorBody: "Da ist etwas schiefgelaufen. Versuchen Sie es nochmals, oder gehen Sie zurück zum Start.",
    tryAgain: "Nochmals versuchen",
  },

  vision: {
    title: "Wohin das führt",
    lead: "Schweizerdeutsch ist der Anfang, nicht das Ziel. Die Methode ist nicht auf die Schweiz zugeschnitten.",
    points: [
      {
        title: "Es gibt viele solcher Sprachen",
        body: "Überall auf der Welt gibt es Sprachen und Dialekte, die zu klein sind, als dass sich ein grosser Kursanbieter dafür interessieren würde — und gleichzeitig genau das, was man können muss, um wirklich dazuzugehören. Man kann die Amtssprache perfekt beherrschen und am Tisch trotzdem aussen vor sein.",
      },
      {
        title: "Genau dort versagen die grossen Anbieter",
        body: "Sprachkurse folgen dem Markt, und der Markt folgt der Sprecherzahl. Was übrig bleibt, sind ein paar Wörterbücher, ein paar Forschungskorpora, die man nicht kommerziell nutzen darf, und keine Aufnahmen, mit denen man üben könnte. Heidi ist für genau diese Lücke gebaut.",
      },
      {
        title: "Die Methode ist übertragbar",
        body: "Erwachsene, die eine verwandte Sprache schon können, müssen nicht neu anfangen — sie müssen umlernen, was sie bereits besitzen. Das gilt für Hochdeutsch und Zürichdeutsch genauso wie für viele andere Paare. Deshalb ist in Heidi die unterrichtete Sprache austauschbare Konfiguration und nicht in den Code geschrieben.",
      },
    ],
    closing:
      "Konkret heisst das: zuerst weitere Deutschschweizer Dialekte, danach eine Sprache ausserhalb der Schweiz — dieselbe Maschine, ein anderer Sprachsatz. Die gesprochene Hälfte reist mit: Jede dieser Sprachen wird weit öfter gehört als geschrieben, und für jede gibt es Medien, die niemand nach Mundart und Hochsprache sortiert hat. Was wir dabei lernen, schreiben wir auf.",
  },

  voice: {
    speak: "Vorlesen",
    stop: "Stopp",
    unsupported: "Dieser Browser kann nichts vorlesen.",
    claim: {
      swissStandard: "Schweizer Hochdeutsch-Stimme — nicht Zürichdeutsch.",
      german: "Eine Stimme aus Deutschland. Ihr Gerät hat keine schweizerische.",
      none: "Dieses Gerät hat gar keine deutsche Stimme. Heidi schweigt lieber, als Deutsch mit englischem Mund zu lesen.",
    },
    dialectCaveat:
      "Eine Maschine liest Dialektschreibung mit einer Hochdeutsch-Stimme. Gut, um das Wort im Satz zu finden — nie, um die Aussprache zu übernehmen.",
    settingsTitle: "Heidis Stimme",
    settingsBody:
      "Gesprochen wird nur, wenn Sie darum bitten. Kein Browser bringt eine Zürcher Stimme mit — das Nächste, was ein Gerät anbietet, ist Schweizer Hochdeutsch, und Heidi sagt jedes Mal, was Sie gerade hören.",
    speakAnswers: "Antworten vorlesen",
    rate: "Tempo",
    correctionTitle: "Korrekturen",
    correctionBody:
      "Wie viel Heidi zu den Wörtern einer Sprechübung sagt, nachdem Sie aufgeschrieben haben, was Sie gesagt haben. Nie zu Ihrer Schreibweise: Zürichdeutsch hat keine richtige Schreibung, da lässt sich nichts falsch machen — und nie zu dem, was Sie im Chat tippen, denn eine Nachricht, die Ihnen jemand geschickt hat, sieht genau aus wie eine von Ihnen.",
    correctionLevels: {
      off: "Nichts sagen",
      blocking: "Nur, was gar kein Schweizerdeutsch ist",
      all: "Auch Formen aus anderen Dialekten",
    },
    correctionHelp: {
      off: "Heidi antwortet und lässt Ihre Wörter in Ruhe.",
      blocking: "Die übliche Einstellung. Dinge, die kein Schweizer schreibt, etwa das scharfe S.",
      all: "Dazu Berndeutsch und andere Regionen — echte Wörter, am falschen Ort.",
    },
    silence: {
      off: "Korrekturen sind ausgeschaltet.",
      spoken:
        "Gesprochenes korrigiert Heidi nicht. Was die Spracherkennung zurückgibt, ist ihre Schreibung und nicht Ihre — sie schreibt Hochdeutsch, egal was Sie gesagt haben. Eine Rüge dafür würde die Maschine korrigieren und Ihnen verrechnen.",
      clean: "Nichts zu beanstanden.",
    },
    cannotHear:
      "Ob Ihre Aussprache stimmt, kann Heidi Ihnen nicht sagen. Das kann heute nichts zuverlässig. Was sie kann: Sie verstehen und antworten.",
  },

  listening: {
    title: "Wo Sie es hören",
    lead: "Die Schweiz macht sehr viel Radio, Fernsehen und Film auf Mundart, das meiste davon gratis. Nur sagt niemand einem Lernenden, was davon überhaupt Mundart ist — deshalb steht das hier bei jedem Eintrag zuerst.",
    todayTitle: "Wenn Sie zwanzig Minuten haben",
    todayBody:
      "Drei zum Anfangen, morgen andere. Von jeder Sorte eine, die sanfteste zuerst, und alle laufen auch ausserhalb der Schweiz — ein Verzeichnis sagt Ihnen, was es gibt, und das ist nicht dasselbe wie zu sagen, was Sie jetzt tun sollen.",
    diglossiaTitle: "Die Hälfte der Schweizer Medien ist nicht Mundart",
    diglossiaBody:
      "Die Tagesschau wird auf Hochdeutsch gelesen, das Magazin direkt danach läuft auf Mundart. Eine Stunde Tagesschau ist eine Stunde in dem Deutsch, das Sie schon haben.",
    basisNote:
      "Die Angaben stammen aus dem Format der jeweiligen Sendung. Niemand hier hat alle durchgehört und aufgeschrieben, was zu hören war — es sind also sorgfältige Schlüsse und keine Messungen, und das steht hier, bis jemand diese Arbeit macht.",
    spoken: { dialect: "Mundart", standard: "Schweizer Hochdeutsch", mixed: "Beides" },
    voices: { one: "Eine Stimme", few: "Wenige Stimmen", many: "Viele gleichzeitig" },
    subtitles: { standard: "Hochdeutsche Untertitel", auto: "Automatische Untertitel", none: "Keine Untertitel" },
    scripted: "Abgelesen",
    spontaneous: "Frei gesprochen",
    reachCh: "Läuft nur in der Schweiz",
    about: "Worum es geht",
    medium: {
      podcast: "Podcasts",
      radio: "Radio",
      youtube: "YouTube",
      tv: "Fernsehen",
      series: "Serien",
      film: "Filme",
    },
    filmsTitle: "Welchen Dialekt Sie hören",
    filmsBody:
      "Der Schweizer Film ist nicht ein Akzent. Bei jedem Eintrag steht, aus welchem Dialektgebiet er kommt — so können Sie zwischen dem wählen, was um Sie herum gesprochen wird, und dem, was Ihnen im Zug begegnet. Bern ist stark vertreten, weil dort der meiste Schweizer Film entsteht — und die Zürcher Filme gibt es, und sie stehen hier.",
    commentary: {
      "der-bestatter":
        "Berndeutsch, und die Serie, die hier fast alle gesehen haben — der Dialekt, den eine Schweizerin nachmacht, wenn Sie um einen Akzent bitten.",
      "wilder":
        "Krimi über mehrere Staffeln und mehrere Dialektgebiete. Gut, um zu hören, dass Schweizerdeutsch nicht eine Sache ist.",
      "tschugger":
        "Walliserdeutsch, für das andere Schweizer Untertitel brauchen. Ein Witz unter Schweizern — und wirklich kein Anfang.",
      "neumatt":
        "Berndeutsch, eine Bauernfamilie. Der Tonfall von Familienstreit, nicht von Fernsehen.",
      "die-schweizermacher":
        "Zürichdeutsch von 1978 und immer noch der Film über das Schweizerwerden. Der Akzent hat sich seither verschoben, was für sich hörenswert ist.",
      "mein-name-ist-eugen":
        "Berndeutsch, und grösstenteils sprechende Kinder — langsamer und deutlicher als Erwachsenendialog.",
      "der-goalie-bin-ig":
        "Dichtes Berndeutsch, nach einem Roman, der darin geschrieben ist. Der Titel ist eine Grammatikstunde: das Verb ist `bin`, das Pronomen kommt zuletzt.",
      "achtung-fertig-charlie":
        "Armeekomödie und die gemeinsame Referenz fast jedes Schweizers unter fünfzig.",
      "bon-schuur-ticino":
        "Eine Komödie, deren Prämisse die Sprachfrage selbst ist — was passiert, wenn das Land sich für eine entscheiden muss.",
      "die-goettliche-ordnung":
        "Appenzell 1971, Frauen kämpfen für das Stimmrecht. Ostschweizer Dialekt, und ein Stück Geschichte, nach dem Sie gefragt werden: Appenzell Innerrhoden liess Frauen erst 1990 an die Landsgemeinde, lange nach dem Filmende.",
      "zwingli":
        "Zürichs eigene Reformation, auf Zürichdeutsch. Einer der wenigen Spielfilme in genau der Sprache, die hier unterrichtet wird.",
      "wolkenbruch":
        "Zürichdeutsch mit Jiddisch daneben — eine zweite Lektion darüber, wie nah zwei Sprachen beieinander liegen und trotzdem zwei bleiben.",
      "platzspitzbaby":
        "Zürichdeutsch, die Drogenjahre der Stadt aus der Sicht eines Kindes. Schweres Thema, ungewöhnlich klare Sprache.",
      "heidi-2015":
        "Für Kinder gemacht und entsprechend langsam und deutlich gesprochen. Vermutlich der einfachste Spielfilm auf dieser Liste — und in Graubünden angesiedelt, nicht in dessen Dialekt gesprochen.",
      "seitentriebe":
        "Alltägliches Schweizerdeutsch zwischen Paaren — die halben Sätze und Unterbrechungen, die Sendesprache wegbügelt.",
    },
  },

  errors: {
    notFoundTitle: "Diese Seite gibt es nicht",
    notFoundBody: "Vielleicht ist der Link alt, vielleicht haben wir etwas verschoben.",
    backHome: "Zurück zum Start",
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
    /**
     * Two things a reader can now DO with a word, instead of only reading it.
     *
     * `askSay` is sent verbatim as a message and must contain `{word}` — see
     * `lib/i18n/fill.ts`, and the test that checks every locale kept it. The
     * placeholder sits mid-sentence because that is where it falls in most of
     * these languages, which is the whole reason a placeholder exists here.
     */
    keptTitle: "Gemerkte Wörter",
    keptNone: "Tippen Sie auf +, um ein Wort zu behalten. Heidi fragt Sie später danach.",
    keptSome: "im Wiederholen",
    practise: "Jetzt wiederholen",
    askLabel: "Im Satz zeigen",
    askSay: "Zeigen Sie mir «{word}» in zwei kurzen Sätzen aus dem Alltag.",
    title: "Die wichtigsten Wörter",
    lead: "Nicht die Wörter für Touristen, sondern die, an denen ein Satz hängen bleibt: die kurzen, ständigen, für die keine Lautregel hilft.",
    note: "Richtung: Mundart → Deutsch. Hier geht es ums Verstehen, nicht ums Schreiben — was Sie selbst schreiben sollten, steht bei den Mundarten.",
    groups: {
      function: "Kleine Wörter, grosse Wirkung",
      verbs: "Verben, die ständig vorkommen",
      everyday: "Alltag",
      greetings: "Begrüssung und Höflichkeit",
      helvetisms: "Wörter, die Sie schon zu kennen glauben",
      slang: "Umgangssprache und Derbes",
    },
    register: { casual: "umgangssprachlich", rude: "derb" },
    mistakenForLabel: "Nicht: {assumed}",
    articleLabel: "Artikel",
    formsLabel: "Formen",
    exampleLabel: "Im Satz",
    /**
     * Das Suchfeld, und warum eine Wortliste eines braucht.
     *
     * Achtundvierzig Wörter passen noch auf eine Seite; sobald es mehr werden,
     * ist Scrollen die einzige Navigation — und wer ein bestimmtes Wort sucht,
     * benutzt dann die Suchfunktion des Browsers und findet nur die eine
     * Schreibweise, die er geraten hat. Das Feld sucht Mundart UND Deutsch,
     * weil beide Richtungen vorkommen.
     */
    filterLabel: "Wörter filtern",
    filterPlaceholder: "Mundart oder Deutsch tippen …",
    noMatches: "Dazu passt kein Wort.",
    clearFilter: "Zurücksetzen",
    practiseGroup: "Diese Gruppe üben",
    jumpLabel: "Direkt zu",
    saidInTitle: "Gesagt in",
  },

  /**
   * Die Übungsseite.
   *
   * ZWEI ARTEN VON FRAGE, und die Wörter dafür dürfen nicht dieselben sein.
   * Bei einer objektiven Frage sagt die Seite «richtig» oder «nicht ganz» —
   * das darf sie, weil die Regel im Pack die Antwort festlegt. Bei einer
   * selbst bewerteten Frage fragt sie «Gewusst?», und das ist keine höfliche
   * Umschreibung: für Züritüütsch gibt es keine amtliche Rechtschreibung, und
   * wer eine getippte Antwort bewertet, sagt irgendwann jemandem, er habe
   * falsch geschrieben, was gar nicht falsch war.
   *
   * KEIN PUNKTESTAND. Am Schluss stehen drei Zahlen, die stimmen — gefragt,
   * auf Anhieb, kommt nochmals. Keine Prozente, keine Serie, kein Level.
   */
  streak: {
    title: "Ihre Serie",
    start: "Heute anfangen — ein paar Fragen genügen.",
    doneToday: "Heute schon geübt.",
    weekReached: "Wochenziel erreicht.",
    goalLabel: "Wochenziel",
    freezes: "Ein verpasster Tag wird automatisch überbrückt ({n} übrig).",
    practise: "Jetzt üben",
    days: {"one": "{n} Tag in Folge", "few": "{n} Tage in Folge", "many": "{n} Tage in Folge", "other": "{n} Tage in Folge"},
    best: {"one": "Bestwert: {n} Tag", "few": "Bestwert: {n} Tage", "many": "Bestwert: {n} Tage", "other": "Bestwert: {n} Tage"},
    goalDays: {"one": "{n} Tag pro Woche", "few": "{n} Tage pro Woche", "many": "{n} Tage pro Woche", "other": "{n} Tage pro Woche"},
    week: {"one": "Diese Woche: {n} von {goal} Tag", "few": "Diese Woche: {n} von {goal} Tagen", "many": "Diese Woche: {n} von {goal} Tagen", "other": "Diese Woche: {n} von {goal} Tagen"},
  },
  practice: {
    title: "Übungen",
    lead: "Ein kurzer Satz Fragen, in ein paar Minuten. Aus den Regeln, die Heidi selbst anwendet, aus den Sätzen, die wirklich gesagt werden — und aus den Wörtern, die Sie behalten haben.",
    note: "Was Sie gemerkt haben, bleibt in Ihrem Browser. Für die Fragen aus dem Wortschatz brauchen Sie kein Konto.",
    start: "Losgehen",
    restart: "Nochmals",
    progress: "Frage {n} von {total}",
    secondTry: "Zweiter Anlauf",
    skip: "Überspringen",
    show: "Auflösen",
    knew: "Gewusst",
    missed: "Nochmals",
    next: "Weiter",
    explain: {
      show: "Erklärung",
      ruleTitle: "Die Regel",
      watchTitle: "Wo es hakt",
      contextTitle: "Im Gespräch",
      wordTitle: "Das Wort",
      saidInTitle: "Auch gesagt in",
      askTitle: "Weiter mit Heidi",
      moreOnTopic: "Mehr zu diesem Thema",
      practiseTopic: "Genau das üben",
      openScene: "Ganze Situation",
      practiseScene: "Diese Situation üben",
      practiseWord: "Dieses Wort üben",
      alsoInPack: "Im Pack steht zusätzlich: {words}",
    },
    right: "Richtig",
    wrong: "Nicht ganz",
    ask: {
      pairTarget: "Welches davon ist Züritüütsch?",
      pairBridge: "Welches davon schreibt man in der Schweiz?",
      article: "Welcher Artikel gehört dazu?",
      form: "Welche Form passt?",
      cloze: "Welches Wort fehlt?",
      recall: "Was heisst das?",
      match: "Was gehört zusammen?",
      gaptext: "Welche Wörter fehlen?",
      pick: "Welches Wort passt hier?",
      translate: "Wie sagt man das auf Züritüütsch?",
      card: "Wissen Sie das noch?",
    },
    matchHint: "Tippen Sie ein Wort an, dann seine Bedeutung.",
    gapHint:
      "Tippen Sie ein Wort an — es rutscht in die nächste Lücke. Auf eine gefüllte Lücke tippen nimmt es zurück.",
    check: "Prüfen",
    typeLabel: "Selbst schreiben — freiwillig",
    typePlaceholder: "Tippen Sie Ihre Antwort …",
    youWrote: "Sie haben geschrieben",
    /**
     * Schreiben und Karten — die beiden Übungsarten, die es vorher nicht gab.
     *
     * `spellingNote` steht bewusst AN der Aufgabe und nicht in einer Fussnote:
     * wer seine Antwort neben der aus dem Pack sieht und einen Buchstaben
     * Unterschied findet, muss genau dort lesen, dass wir das nicht als Fehler
     * werten. §6 — diese Mundart hat keine festgelegte Rechtschreibung.
     */
    translateLabel: "Auf Züritüütsch schreiben",
    packSays: "Im Pack steht",
    spellingNote:
      "Züritüütsch hat keine festgelegte Rechtschreibung. Anders geschrieben heisst nicht falsch geschrieben — vergleichen Sie selbst und entscheiden Sie.",
    cardRecognise: "Mundart → Bedeutung",
    cardProduce: "Bedeutung → Mundart",
    cardTurn: "Umdrehen",

    /**
     * Die zwei Entscheidungen vor dem Üben — und es sind wirklich zwei: was
     * tun die Hände, und wann erfahre ich es. Beide stehen in der URL, damit
     * ein Link «Schreiben, Test» weitergeben kann.
     */
    modeTitle: "Wie üben?",
    modeMixed: "Gemischt",
    modeMixedNote: "Alles durcheinander — der normale Weg.",
    modeTap: "Antippen",
    modeTapNote: "Nur auswählen. Keine Tastatur, eine Hand reicht.",
    modeWrite: "Schreiben",
    modeWriteNote: "Ganze Sätze selbst tippen. Sie vergleichen selbst.",
    modeCard: "Karten",
    modeCardNote: "Wort vorn, Bedeutung hinten. Am schnellsten.",

    flowTitle: "Üben oder prüfen?",
    flowPractice: "Üben",
    flowPracticeNote: "Antwort und Erklärung sofort nach jeder Frage.",
    flowTest: "Test",
    flowTestNote: "Erst alle Fragen, dann alle Antworten mit Erklärung.",

    /**
     * Der Test. Währenddessen sagt die Seite NICHTS — das ist der Sinn: eine
     * Rückmeldung nach jeder Frage verändert, was die nächste misst.
     *
     * Am Schluss eine Anzahl, keine Prozente, kein Level, keine Note. §8
     * verbietet den Punktestand, nicht das Zählen; und die Anzahl steht neben
     * der Liste der Fragen, weil die Liste das ist, woraus man etwas lernt.
     */
    testLead:
      "{total} Fragen am Stück. Heidi sagt unterwegs nichts dazu — Antworten und Erklärungen kommen am Schluss, alle auf einmal.",
    testOnlyObjective:
      "Im Test kommen nur Fragen vor, die sich eindeutig prüfen lassen. Geschriebenes und Karten bewerten Sie selbst — das kann man üben, aber nicht messen.",
    testStart: "Test starten",
    testProgress: "{n} von {total}",
    testAnswer: "Antwort merken",
    testTimerOff: "Ohne Zeit",
    testTimerSet: "{n} Min.",
    testTimerAdd: "+{n} Min.",
    testTimerLabel: "Zeit nehmen?",
    testTimerLeft: "Noch {time}",
    testTimeUp: "Die Zeit ist um. Alles, was Sie beantwortet haben, steht unten.",
    testDone: "Fertig",
    testResultsTitle: "Ihre Antworten",
    testResultsCount: "{right} von {asked} auf Anhieb richtig",
    testResultsLead: "Jede Frage nochmals, mit dem, was Sie gewählt haben, und dem Weg dorthin, wo es erklärt wird.",
    testYourAnswer: "Ihre Antwort",
    testCorrectAnswer: "Richtig wäre",
    testUnanswered: "Nicht beantwortet",
    testAgain: "Neuer Test",
    /**
     * KEINE ZAHL, und das ist die ganze Regel hier. Keine Prozente, keine
     * Trefferquote, kein Level. Die Diagnose zeigt auf den STOFF, nie auf die
     * Person — alles andere wäre ein Punktestand mit anderem Namen.
     */
    focusTitle: "Daran hängen Sie gerade",
    focusEmpty:
      "Noch nichts. Sobald Sie ein paar Fragen beantwortet haben, steht hier, was Sie immer wieder erwischt — und ein Klick übt genau das.",
    focusLead: "Das kommt bei Ihnen immer wieder vor. Ein Klick übt nur das.",
    /**
     * Eine Übung, die eingegrenzt wurde, sagt das — sonst sieht ein kleiner
     * Fragenpool wie ein kaputtes Produkt aus.
     */
    scopedTo: "Nur zu: {what}",
    scopeAll: "Alles üben",
    scopeEmpty:
      "Dazu gibt es noch keine Fragen. Das heisst nicht, dass das Thema unwichtig wäre — nur, dass das Pack dafür noch keine Beispiele hat.",
    origin: "Das andere ist {origin}.",
    /**
     * Die Personen einer Verbtabelle, in der Sprache der Leserin.
     *
     * Die Schlüssel sind die des Packs und dürfen sich nicht ändern; die
     * Wörter rechts sind Beschriftung. «er» steht für alle drei Formen der
     * dritten Person, weil das Verb sie nicht unterscheidet — eine eigene
     * Zeile für jede wäre dreimal dieselbe Frage.
     */
    persons: {
      ich: "ich",
      du: "du",
      er: "er / sie / es",
      mir: "wir",
      ihr: "ihr",
      si: "sie",
      plural: "Mehrzahl",
      past: "Vergangenheit",
    },
    grammarLink: "Dazu in der Grammatik",
    wordLink: "Dazu im Wortschatz",
    ruleLink: "Die Regel dahinter",
    situationLink: "Die Situation dazu",
    doneTitle: "Fertig für jetzt.",
    doneAsked: "gefragt",
    doneRight: "auf Anhieb",
    doneAgain: "kommen nochmals",
    againTitle: "Nochmals anschauen",
    whyTitle: "Warum die Übungen so gebaut sind",
    whyLead:
      "Jede Entscheidung hier lässt sich nachlesen. Wo die Forschung eine Richtung vorgibt und keine Zahl, steht die Zahl als unser Ermessen da — nicht als Befund.",
    why: [
      {
        claim: "Gefragt werden schlägt nochmals anschauen.",
        detail:
          "Darum verrät keine Übung zuerst die Antwort. Über 222 Studien hinweg liegt der Vorteil des Abfragens gegenüber dem erneuten Lernen bei g ≈ 0,50.",
        source: cite("yang-2021"),
      },
      {
        claim: "Später ist besser als bald — und der Vorteil wächst mit der Zeit.",
        detail:
          "Deshalb kommt ein gemerktes Wort nach 1, 3, 7, 16 und 35 Tagen zurück statt jeden Tag. In einer Meta-Analyse zum Zweitsprachenlernen: g ≈ 0,76 im Soforttest, g ≈ 1,15 im verzögerten.",
        source: cite("kim-webb-2022"),
      },
      {
        claim: "Einmal richtig ist zu wenig; zweimal richtig, mit Abstand, ist der Punkt.",
        detail:
          "Deshalb kommt eine verpasste Frage noch in derselben Sitzung zurück — drei Fragen später, nicht sofort. Der Abstand von drei ist unsere Schätzung: die Studie gibt die Richtung, nicht die Zahl.",
        source: cite("rawson-dunlosky-2011"),
      },
      {
        claim: "Ankreuzen ohne Rückmeldung kann den falschen Begriff einprägen.",
        detail:
          "Deshalb zeigt jede Auswahlfrage sofort die richtige Antwort und fragt später nochmals. Rückmeldung verstärkt den Nutzen solcher Tests und verringert genau diesen Schaden.",
        source: cite("butler-roediger-2008"),
      },
      {
        claim: "Selber hervorbringen prägt sich besser ein als lesen.",
        detail:
          "Deshalb gibt es Lückensätze und offene Fragen und nicht nur Auswahl. Der Effekt ist robust, aber kleiner, als sein Ruf vermuten lässt.",
        source: cite("bertsch-2007"),
      },
      {
        claim: "Mischen hilft — aber nicht immer, und das sagen wir dazu.",
        detail:
          "Deshalb folgen keine zwei gleichen Fragetypen aufeinander. Die Meta-Analyse ist deutlich: der Nutzen hängt davon ab, wie ähnlich sich das Material ist, und bei sehr ähnlichem Material kann Mischen sogar schaden.",
        source: cite("brunmair-richter-2019"),
      },
      {
        claim: "Keine Serien, keine Punkte, keine Prozentzahl.",
        detail:
          "Eine Serie misst, wie viel Heidi Sie konsumiert haben, und sieht dabei aus wie ein Mass fürs Lernen. Was hier steht, sind Zahlen über das, was Sie getan haben.",
        source: cite("yang-2021"),
      },
    ],
    whyMore: "Die ganze Methode",
    savedHint: "Im Chat merken Sie sich Wörter mit +. Die kommen dann hier zurück, wenn es Zeit dafür ist.",
  },

  essays: {
    title: "Blog",
    lead: "Warum die Deutschschweiz so spricht, wie sie spricht. Längere Texte mit Quellen — für die Fragen, die auf eine Karte nicht passen.",
    none: "Hier steht noch nichts.",
    backToAll: "Alle Texte",
    notTranslated: "Dieser Text ist noch nicht auf Deutsch. Sie lesen ihn auf",
    sourcesTitle: "Quellen",
  },
  dialect: {
    title: "Schweizerdeutsch",
    lead: "Was es ist, warum Sie es nicht verstehen, obwohl Sie Deutsch können — und welche Mundart wo gesprochen wird.",
    spokenTitle: "Gesprochen, nicht geschrieben",
    spokenBody: "Schweizerdeutsch ist die gesprochene Sprache des Alltags — und die geschriebene unter Leuten, die sich kennen: SMS, WhatsApp, Notizen. Alles Offizielle wird auf Schweizer Hochdeutsch geschrieben. Beides gehört dazu, und wer nur das eine kann, schickt irgendwann eine Mundart-Nachricht an die Versicherung.",
    noStandardTitle: "Keine richtige Schreibweise",
    noStandardBody: "Es gibt keine offizielle Rechtschreibung. Dasselbe Wort wird von zwei Leuten unterschiedlich geschrieben, und beide haben recht. Deshalb sagt Heidi nie, Ihre Schreibweise sei falsch — nur, wie wir sie schreiben.",
    notOneTitle: "Nicht eine Sprache",
    notOneBody: "Schweizerdeutsch ist kein einzelner Dialekt, sondern viele. Die Unterschiede fallen Einheimischen sofort auf und Lernenden gar nicht. Heidi bringt Ihnen Zürichdeutsch bei und sagt es, statt so zu tun, als gäbe es nur eines.",
    areasTitle: "Die Mundarten",
    areasLead: "Mundartgrenzen folgen keinen Kantonsgrenzen — deshalb Punkte und keine Flächen. Die Kantone stehen dabei, weil Sie wissen, in welchem Sie sind.",
    cantons: "Kantone",
    marksTitle: "Woran man sie erkennt",
    marksLead: "Formen, die Heidis Prüfung tatsächlich unterscheidet. Links die dortige Form, rechts die Zürcher.",
    marksNone: "Heidi kann diese Mundart noch nicht an einzelnen Formen erkennen. Hier steht nichts, statt etwas Plausiblem.",
    taught: "Das lernen Sie hier",
    sourcesTitle: "Quellen",
    groupsTitle: "Die drei Zweige",
    groupsLead:
      "Die alemannischen Mundarten teilen sich in drei Gruppen. Die Grenzen sind keine Kantonsgrenzen, sondern Lautwandel, die an verschiedenen Stellen stehengeblieben sind.",
    groups: {
      low: {
        name: "Niederalemannisch",
        body: "Der Norden — in der Schweiz praktisch nur Basel. Hier ist das k am Wortanfang k geblieben; überall sonst in der Deutschschweiz ist ch daraus geworden. Das hört man am ersten Tag.",
      },
      high: {
        name: "Hochalemannisch",
        body: "Mittelland und Osten: Zürich, Bern, Aargau, Solothurn, St. Gallen. Die grösste Gruppe — und die, die man meint, wenn man «Schweizerdeutsch» sagt.",
      },
      highest: {
        name: "Höchstalemannisch",
        body: "Die Alpentäler: Wallis, Glarus, Uri und Unterwalden, die Walsersiedlungen. Am konservativsten und für Auswärtige am schwersten, weil hier alte Formen erhalten sind, die im Mittelland längst verschwunden sind.",
      },
    },
    groupLabel: "Zweig",
    groupSpansTitle: "Auf beiden Seiten der Linie",
    groupSpans:
      "Diese Mundartlandschaft liegt auf beiden Seiten der Linie und gehört keinem Zweig allein. Wir nennen deshalb keinen, statt einen zu wählen, der ordentlich aussieht.",
    diagnosticTitle: "Die Linie, die ihn zieht",
    diagnosticInside: "In diesem Zweig",
    diagnosticOutside: "Daneben",
    diagnosticStandard: "Hochdeutsch",
    hearTitle: "So klingt sie",
    hearLead: "Sendungen und Filme, in denen vor allem diese Mundart gesprochen wird. Geprüfte Links — Aufnahmen machen wir keine.",
    hearNone:
      "Für diese Mundart steht noch nichts Geprüftes im Verzeichnis. Lieber nichts als ein Link, den niemand angehört hat.",
    hearAll: "Alle Hörquellen",
    reader: {
      title: "Woher kommt diese Nachricht?",
      lead: "Fügen Sie eine Nachricht ein, die Sie bekommen haben — vom Chef, von der Nachbarin, aus dem Klassenchat. Heidi zeigt, welche Formen woher kommen und was die Wörter heissen.",
      placeholder: "Z. B.: Dr Giel und ds Meitschi hei Miuch gno.",
      button: "Einordnen",
      failed: "Das hat nicht geklappt. Versuchen Sie es noch einmal.",
      area: "Die Formen weisen nach {area}.",
      outside: "Das liest sich wie Hochdeutsch aus Deutschland, nicht aus der Schweiz.",
      consistent: "Nichts hier weist aus Zürich weg — die Wörter unten sagt man in Zürich so.",
      unclear: "Zu wenig, um es einzuordnen. Ein, zwei Sätze mehr helfen.",
      fromTitle: "Formen von anderswo",
      knownTitle: "Was die Wörter heissen",
      zurich: "in Zürich: {form}",
      outsideName: "Deutschland",
      note: "Heidi ordnet nur Formen ein, die sie sicher kennt, und die Liste wächst. Ihr Text wird nicht gespeichert.",
    },
    whyManyTitle: "Warum so viele?",
    whyManyBody:
      "Die Schweiz hat ihre Mundarten behalten, während Deutschland seine weitgehend verloren hat. Das ist kein Zufall und keine Frage der Berge — es hat mit Staatsbildung, Schule und Rundfunk zu tun.",
    whyManyLink: "Die ganze Geschichte",
    backToAll: "Alle Mundarten",
    aroundTitle: "Wo das hier steht",
    aroundLead:
      "Berechnet aus dem Zweig, den Kantonen und dem Bezugsort — keine neuen Aussagen über die Mundart selbst.",
    nearestTitle: "Am nächsten",
    siblingsTitle: "Gleicher Zweig",
    kmAway: "{km} km",
    marksInstead: "Fangen Sie stattdessen bei {area} an, {km} km entfernt — dort kennt Heidi Formen",
  },

  grammar: {
    /**
     * Practising a topic, rather than only reading it.
     *
     * `practiseSay` is sent verbatim and must contain `{word}` — here the
     * topic's own title — for the same reason as `vocabulary.askSay`.
     */
    practiseLabel: "Mehr Beispiele",
    practiseSay: "Geben Sie mir zwei Sätze zum Üben von «{word}» — und fragen Sie mich danach einen ab.",
    title: "Grammatik",
    /**
     * KEINE ZAHL IM LEAD. Hier stand «Vier Dinge», und das war ab dem Tag
     * falsch, an dem ein fünftes dazukam — in allen sieben Sprachen
     * gleichzeitig, weil eine Zahl in der Werbezeile eine Tatsache ist, die
     * niemand pflegt. Ein Test verbietet sie jetzt.
     */
    lead: "Was Zürichdeutsch für jemanden schwer verständlich macht, der Deutsch schon liest — zuerst das, woran ein Satz ganz scheitert, danach das, was Sie zwar verstehen, aber nie selbst sagen würden.",
    ruleLabel: "Die Regel",
    watchLabel: "Wo es hakt",
    /**
     * Die zwei Bänder — und der Grund, warum die Übersichtsseite überhaupt
     * eine Struktur hat.
     *
     * Der Lead hat diese Unterscheidung von Anfang an behauptet («zuerst das,
     * woran ein Satz ganz scheitert, danach das, was Sie zwar verstehen, aber
     * nie selbst sagen würden»), getragen hat sie aber nur die Reihenfolge der
     * Liste — also nichts, was jemand sehen konnte.
     */
    bands: {
      blocks: {
        title: "Daran scheitert der Satz",
        lead: "Ohne diese fängt das Zuhören gar nicht erst an. Sie warten auf eine Form, die nie kommt, oder lesen ein Wort als etwas ganz anderes — und der Rest des Satzes ist weg.",
      },
      marks: {
        title: "Verstehen ja — selbst sagen nie",
        lead: "Diese verstehen Sie beim Hören problemlos. Wer sie nie selbst benutzt, klingt dauerhaft nach Hochdeutsch mit Zürcher Wörtern drin.",
      },
    },
    allTopics: "Alle Themen",
    practiseTopic: "Dieses Thema üben",
    whereTitle: "Wo das wirklich vorkommt",
    whereLead: "Dieselbe Struktur, in Sätzen, die wirklich so gesagt werden.",
    prevLabel: "Vorheriges",
    nextLabel: "Nächstes",
    topics: {
      "question-words": {
        title: "Fragewörter — und die Falle darin",
        rule: "wänn, wo, was, wie, weer. Die meisten sind erkennbar; eines ist es nicht.",
        watch: "«Wänn» klingt wie das deutsche «wenn». Sie hören eine Bedingung, gestellt wurde aber eine Frage — und Ihre Antwort passt dann auf etwas, was niemand gefragt hat.",
      },
      "indefinite-article": {
        title: "en, e, es — der unbestimmte Artikel",
        rule: "«en» beim männlichen, «e» beim weiblichen, «es» beim sächlichen Wort.",
        watch: "«es» sieht aus wie das Pronomen «es». «Bruuched Sie es Säckli?» heisst nicht «brauchen Sie es», sondern «brauchen Sie ein Säckchen».",
      },
      imperative: {
        title: "Befehl und Bitte: die Sie-Form endet auf -ed",
        rule: "Beim Du steht der blosse Stamm: «Chumm». Beim Sie kommt -ed dazu: «Chömed Sie».",
        watch: "Verstehen werden Sie beides. Wer «Chömen Sie» sagt, wird auch verstanden — und sofort als Nicht-Zürcher erkannt.",
      },
      "no-preterite": {
        title: "Kein Präteritum",
        rule: "Gesprochenes Zürichdeutsch hat keine einfache Vergangenheit: alles Vergangene steht im Perfekt.",
        watch: "Sie warten auf «ging», «war», «sagte» — und es kommt nie. Wenn Sie «bi», «hät» oder «händ» plus Partizip hören, ist das die Vergangenheit.",
      },
      articles: {
        title: "de, d, s — mehr Artikel gibt es nicht",
        rule: "Drei Artikel für alles: «de» beim männlichen, «d» beim weiblichen, «s» beim sächlichen Wort. «der», «die» und «das» kommen nicht vor.",
        watch: "Die Artikel sehen aus wie verschluckte deutsche — sind aber die ganze Form, nicht eine bequeme Kurzfassung. Und das Geschlecht stimmt nicht immer mit dem deutschen überein: «s Rüebli» ist sächlich, die Karotte nicht.",
      },
      "wo-relative": {
        title: "«wo» statt der, die, das",
        rule: "Relativsätze werden fast immer mit «wo» eingeleitet, unverändert, egal welches Geschlecht oder welcher Fall.",
        watch: "Sie lesen «wo» als «wo?» und verlieren den Satz. Es heisst hier «der», «die», «das» oder «den» — nie ein Ort.",
      },
      "unified-plural": {
        title: "Eine Verbform für die ganze Mehrzahl",
        rule: "Wir, ihr und sie bekommen dieselbe Verbform: «mir händ», «ihr händ», «si händ».",
        watch: "Sie suchen das «-t» der zweiten Person Mehrzahl und finden es nie. «Chömed er?» heisst «Kommt ihr?» — die Endung sagt nichts über die Person, das tut nur das Pronomen davor.",
      },
      "possessive-dative": {
        title: "Besitz andersherum",
        rule: "Der Genitiv fehlt: Besitz wird mit Dativ plus Possessivpronomen gebildet, oder mit «vo».",
        watch: "«Em Peter sis Auto» ist nicht «dem Peter sein Auto» als Fehler, sondern die normale Form. Die Person kommt zuerst, die Sache danach.",
      },
      "diminutive-li": {
        title: "Das -li an allem",
        rule: "Die Verkleinerungsform auf -li ist sehr produktiv und bedeutet oft gar nichts Kleines.",
        watch: "«Es Bierli» ist kein kleines Bier, sondern ein freundlich gesagtes Bier. Nehmen Sie -li nicht wörtlich.",
      },
      "am-progressive": {
        title: "«am» plus Verb — gerade dabei",
        rule: "Was jetzt gerade läuft, steht als «bi/isch/sind am» plus Grundform: «Ich bi am schaffe».",
        watch: "Deutsch hat diese Form nicht und behilft sich mit «gerade». Sie verstehen den Satz auch ohne — aber wer sie nie benutzt, klingt dauerhaft nach Hochdeutsch mit Zürcher Wörtern.",
      },
      "go-cho-infinitive": {
        title: "«go» und «cho» vor dem zweiten Verb",
        rule: "Wer irgendwohin geht, um etwas zu tun, schiebt ein «go» davor; wer kommt, ein «cho»: «Ich gang go poschte».",
        watch: "Im Deutschen gibt es dieses Wörtchen nicht, also lässt man es weg — und wird verstanden und sofort erkannt. Es ist kein «gehen», sondern gehört zum zweiten Verb.",
      },
      "modal-particles": {
        title: "«gäll», «halt», «äbe» — die Haltung im Satz",
        rule: "Diese Wörtchen ändern keine Tatsache, sondern die Haltung dahinter: «gäll» sucht Zustimmung, «halt» heisst «da ist nichts zu machen», «äbe» bestätigt genau den Punkt.",
        watch: "Deutsch kennt «eben», und im Süden lebt «gell» — neu ist vor allem, wie oft sie kommen, und «dänk», für das es kein deutsches Wort gibt. Den Satz verstehen Sie auch ohne. Sie hören dann bloss nicht, ob man Ihnen zustimmt oder Sie etwas fragt.",
      },
    },
  },

  saved: {
    title: "Ihre Wörter",
    lead: "Was Sie nachgeschlagen und behalten wollten. Alles liegt in diesem Browser, auf diesem Gerät — nicht bei uns.",
    empty: "Noch keine Wörter gemerkt.",
    emptyHint: "Fragen Sie Heidi nach einem Satz. Neben jedem erklärten Wort steht ein Plus — damit merken Sie es sich.",
    countLabel: "gemerkt",
    remove: "Entfernen",
    clear: "Alle entfernen",
    clearConfirm: "Wirklich alle entfernen?",
    exportLabel: "Als Datei sichern",
    onThisDevice: "Nur auf diesem Gerät",
    savedOn: "Gemerkt",
    openChat: "Etwas nachschlagen",
  },

  /**
   * The dashboard: spaced review, and what the learner's own list says about
   * them. No streak, no score, no percentage — HEIDI.md §8 names each of those
   * as the thing this must not become.
   */
  review: {
    title: "Zum Wiederholen",
    lead: "Wörter, die Sie behalten wollten, kommen hier zurück — erst nach einem Tag, dann nach drei, dann nach einer Woche. Später zu fragen wirkt besser als öfter zu fragen.",
    due: "fällig",
    none: "Heute nichts fällig.",
    noneHint: "Kommen Sie morgen wieder — oder schlagen Sie etwas Neues nach.",
    noneFree: "Der Plan ist eingehalten. Wenn Sie jetzt weitermachen wollen, hier entlang:",
    nonePractise: "Kurz üben",
    noneCards: "Karten",
    noneAsk: "Nachricht einfügen",
    empty: "Noch keine Wörter zum Wiederholen.",
    emptyHint: "Merken Sie sich ein Wort im Gespräch, dann fragt Heidi Sie später danach.",
    tomorrow: "morgen fällig",
    settled: "sitzen",
    prompt: "Was heisst das?",
    show: "Auflösen",
    knew: "Wusste ich",
    missed: "Noch nicht",
    done: "Für heute durch.",
    patternsTitle: "Was Ihnen immer wieder begegnet",
    patternsLead: "Diese Regelmässigkeiten stecken in den Wörtern, die Sie behalten haben. Keine Note — nur das, was in Ihrer eigenen Liste steht.",
    patternsCount: "Ihrer Wörter",
    patternsEmpty:
      "Noch nichts zu zeigen. Sobald Sie ein paar Wörter behalten haben, steht hier, welche Lautentsprechungen darin immer wieder vorkommen — zum Beispiel, dass aus einem deutschen k ein ch wird. Gelesen aus Ihrer eigenen Liste; gemessen wird nichts über Sie.",
    masteredTitle: "Was Sie jetzt können",
    masteredCount: "{n} Dinge sitzen",
    masteredLead:
      "Nicht gezählt wird, wie oft Sie hier waren, sondern was Sie inzwischen richtig machen — mindestens viermal gefragt und fast immer getroffen.",
    masteredEmpty:
      "Noch nichts. Sobald Sie etwas viermal gefragt bekommen und fast immer richtig haben, steht es hier. Es zählt, was Sie können, nicht wie oft Sie da waren.",
    masteredTopics: "Grammatik",
    masteredWords: "Wörter",
    masteredGroups: "Wortgruppen",
    masteredScenes: "Situationen",
    masteredNote:
      "Das sagt etwas über dieses Pack, nicht über Schweizerdeutsch insgesamt. Was hier steht, sitzt — daraus folgt nicht, dass ein Gespräch in Zürich klappt.",
    recentTitle: "Weitermachen",
    recentEmpty: "Noch keine Gespräche.",
  },
  groups: {
    title: "Lerngruppen",
    lead: "Üben Sie mit anderen — Heidi ist dabei. Schreiben Sie ihr im Gespräch mit Namen, wenn Sie etwas wissen möchten.",
    empty: "Sie sind noch in keiner Gruppe.",
    createTitle: "Gruppe eröffnen",
    createHint: "Geben Sie ihr einen Namen. Danach bekommen Sie einen Link zum Weitergeben.",
    namePlaceholder: "z. B. Mittwoch-Znacht",
    create: "Eröffnen",
    creating: "Wird eröffnet …",
    open: "Öffnen",
    members: "Mitglieder",
    inviteTitle: "Zum Mitmachen einladen",
    inviteHint: "Wer den Link hat, kommt hinein. Geben Sie ihn nur weiter, wenn Sie das möchten.",
    copyLink: "Link kopieren",
    copied: "Kopiert",
    rotate: "Neuen Link erzeugen",
    rotateHint: "Der alte Link hört sofort auf zu funktionieren.",
    joinTitle: "Sie wurden eingeladen",
    joinBody: "Melden Sie sich an, um mitzumachen.",
    join: "Mitmachen",
    joining: "Einen Moment …",
    joinFailed: "Dieser Link funktioniert nicht mehr.",
    full: "Diese Gruppe ist voll.",
    signInFirst: "Melden Sie sich an, um Lerngruppen zu nutzen.",
    composer: "Nachricht an die Gruppe",
    send: "Senden",
    heidiHint: "Schreiben Sie «Heidi», wenn sie antworten soll.",
    notConfigured: "Lerngruppen sind auf dieser Installation noch nicht eingerichtet.",
    failed: "Das hat gerade nicht geklappt. Bitte nochmals versuchen.",
    back: "Zurück zu Mein Bereich",
  },
  speaking: {
    title: "Sprechen",
    lead: "Sprechen Sie laut, allein, jetzt — und lassen Sie messen, was sich messen lässt. Weiter unten: Webinare und Gesprächsrunden zu Themen, die Sie selbst vorschlagen.",
    signInFirst: "Melden Sie sich an, um Themen vorzuschlagen und mitzumachen.",
    roundFull: "Diese Runde ist voll.",
    notConfigured: "Sprechrunden sind auf dieser Installation noch nicht eingerichtet.",
    failed: "Das hat gerade nicht geklappt. Bitte nochmals versuchen.",

    roundsTitle: "Nächste Runden",
    roundsEmpty: "Noch keine Runde geplant. Eröffnen Sie die erste.",
    webinar: "Webinar",
    circle: "Gesprächsrunde",
    webinarHint: "Eine Person spricht, die anderen hören zu.",
    circleHint: "Alle kommen dran. Höchstens acht Personen.",
    once: "Einmalig",
    weekly: "Jede Woche",
    fortnightly: "Alle zwei Wochen",
    hostedBy: "von",
    attending: "dabei",
    full: "Voll",
    join: "Ich komme",
    leave: "Doch nicht",
    live: "Läuft jetzt",
    joinRoom: "Zum Raum",
    noRoom: "Der Link zum Raum kommt noch.",
    cancelRound: "Runde absagen",
    cancelled: "Abgesagt",

    openTitle: "Runde eröffnen",
    openHint: "Sie sind Gastgeberin oder Gastgeber und stehen als Erste in der Liste.",
    roundTitleLabel: "Worum geht es?",
    whenLabel: "Wann",
    durationLabel: "Dauer",
    minutes: "Minuten",
    formatLabel: "Form",
    cadenceLabel: "Wiederholung",
    linkLabel: "Link zum Raum",
    linkHint: "Ein https-Link zu Ihrem Meeting-Raum. Heidi überträgt selbst kein Video — sie plant die Runde und übt mit Ihnen davor und danach.",
    open: "Eröffnen",
    opening: "Wird eröffnet …",

    boardTitle: "Vorgeschlagene Themen",
    boardLead: "Worüber möchten Sie reden? Themen kommen von den Teilnehmenden, nicht von uns.",
    boardEmpty: "Noch keine Vorschläge. Schlagen Sie etwas vor, worüber Sie tatsächlich reden möchten.",
    proposeTitle: "Thema vorschlagen",
    topicTitleLabel: "Das Thema",
    topicTitlePlaceholder: "z. B. Was am Bahnhof wirklich gesagt wird",
    pitchLabel: "Warum ist das eine Stunde wert?",
    pitchPlaceholder: "Ein Satz genügt.",
    propose: "Vorschlagen",
    proposing: "Einen Moment …",
    wouldCome: "würden kommen",
    imIn: "Ich würde kommen",
    imOut: "Doch nicht",
    scheduled: "Ist geplant",
    scheduleIt: "Runde daraus machen",

    practiceTitle: "Laut üben",
    practiceLead: "Nehmen Sie sich auf, wie Sie über ein Thema sprechen. Eine Minute genügt.",
    record: "Aufnehmen",
    stop: "Fertig",
    recordingNow: "Nimmt auf",
    again: "Nochmals",
    micDenied: "Ohne Zugriff aufs Mikrofon geht es nicht. Erlauben Sie ihn in der Adressleiste Ihres Browsers.",
    micUnsupported: "Dieser Browser kann nicht aufnehmen. Versuchen Sie es auf dem Handy oder in einem anderen Browser.",
    measured: "Gemessen",

    varietyLabel: "In welcher Sprache üben Sie?",
    varietyBridge: "Schweizer Hochdeutsch",
    varietyMeasuresOnly: "Heidi misst die Aufnahme auf Ihrem Gerät. Den Satz tippen Sie selbst — kein System schreibt Zürichdeutsch zuverlässig auf.",
    varietyTranscribes: "Heidi schreibt mit und kann über Ihre Wörter reden. Dafür geht die Aufnahme einmal an einen Dienst und wird dort nicht gespeichert.",

    recordedFor: "Aufnahme",
    spokeFor: "gesprochen",
    pauseLabel: "Pausen",
    longestLabel: "längste Pause",
    runLabel: "am Stück",
    rateLabel: "Silben/Sek.",
    wordsLabel: "Wörter",
    seconds: "Sek.",

    saidTitle: "Was haben Sie gesagt?",
    saidWhy: "Kein System schreibt Zürichdeutsch zuverlässig auf. Die besten übersetzen den Dialekt ins Hochdeutsche und werfen damit genau das weg, was Sie lernen. Darum tippen Sie Ihren Satz selbst — und das Aufschreiben ist ohnehin die halbe Übung.",
    saidPlaceholder: "Schreiben Sie Ihren Satz so, wie Sie ihn gesagt haben.",
    saidCheck: "Prüfen lassen",
    checking: "Wird geprüft …",

    heardTitle: "Das haben wir gehört",
    heardWhy: "Das hat eine Maschine geschrieben, nicht Sie. Korrigieren Sie, was nicht stimmt — gemessen wird der Text, hinter dem Sie stehen.",
    heardPlaceholder: "Hier steht, was die Maschine verstanden hat.",
    hearing: "Wird abgehört …",
    heardFailed: "Das Abhören hat nicht geklappt. Schreiben Sie Ihren Satz selbst — die Messung oben steht ohnehin.",
    grammarTitle: "Grammatik",
    grammarClean: "Nichts gefunden, was einem Zuhörer auffallen würde.",
    grammarNotChecked: "Die Grammatik wurde diesmal nicht geprüft.",
    grammarAlternatives: "Mehrere Möglichkeiten — welche passt, hängt davon ab, was Sie sagen wollten.",
    grammarMore: "Die ersten {shown} von {total}.",
    grammarLimit: "Geprüft werden Übereinstimmung, Fälle und Verbformen. Nicht jeder Fehler wird gefunden — etwa die Stellung des Verbs nach «weil».",
    hesitationTitle: "Wo Sie nach einem Wort gesucht haben",
    hesitationBefore: "{s} s vor «{word}»",
    hesitationNote: "Das Wort nach einer langen Pause ist oft das, nach dem Sie gesucht haben.",

    feedbackTitle: "Rückmeldung",
    suggestionTitle: "So würde man es hier sagen",
    noSuggestion: "Heidi hat dazu gerade nichts. Die Messung oben steht trotzdem.",
    flaggedSuggestion: "Achtung: in diesem Vorschlag steckt eine Form, die unsere eigene Prüfung beanstandet.",
    foreignForm: "«{form}» ist {origin}. Hier sagt man «{suggest}».",
    foreignFormPlain: "«{form}» kommt aus einer anderen Mundart ({origin}).",
    noScore: "Heidi gibt keine Note. Was hier steht, ist gemessen: wie lange Sie gesprochen haben und wo die Pausen waren — und welche Wörter aus einer anderen Mundart stammen. Über Ihre Aussprache steht nichts, weil das niemand ehrlich messen kann.",

    notes: {
      recordingTooShort: "Die Aufnahme ist zu kurz, um etwas darüber zu sagen. Nehmen Sie ein paar Sätze auf.",
      recordingTooQuiet: "Wir haben fast nichts gehört. Prüfen Sie das Mikrofon und sprechen Sie etwas näher heran.",
      recordingClipped: "Das Signal war übersteuert. Gehen Sie etwas weiter weg vom Mikrofon — ein Geräteproblem, kein Sprechproblem.",
      longestPause: "Ihre längste Pause dauerte {n} Sekunden. Wenn Sie solche Stellen kürzen möchten: sagen Sie den Satz mit weniger Wörtern, statt nach dem richtigen zu suchen.",
      noLongPauses: "Keine langen Pausen — Sie sind durchgekommen, ohne stecken zu bleiben.",
      fewerPausesThanBefore: "{n} Pausen weniger als beim letzten Mal.",
      morePausesThanBefore: "{n} Pausen mehr als beim letzten Mal. Das kann am Thema liegen.",
      longerRunsThanBefore: "Sie sprachen {n} Sekunden länger am Stück als zuvor.",
      nothingFlagged: "Keine Formen aus einer anderen Mundart gefunden.",
      shareOfRecording: "In {n} % der Aufnahme war Sprache. Der Rest war still — das kann Nachdenken sein oder ein Mikrofon, das zu wenig gehört hat.",
      huntingForWords: "Wenn Sie sprachen, sprachen Sie zügig — die Zeit ging in den Pausen verloren. Das ist Wortsuche, nicht Langsamkeit: sagen Sie dasselbe gleich noch einmal, dann fällt die Suche weg.",
      cameStraightThrough: "Sie sind durchgekommen, ohne lange zu suchen. Nehmen Sie beim nächsten Mal ein Thema, das Sie noch nie laut gesagt haben.",
      filledPauses: "{n} gefüllte Pausen («äh», «ähm»). Das machen Muttersprachler auch — gezählt, nicht beanstandet.",
      spokeTargetInBridge: "Da waren Mundartwörter drin, obwohl Sie Hochdeutsch geübt haben. In Zürich passiert das dauernd und ist kein Fehler — nur gut zu wissen, wenn Sie am Schalter bewusst Hochdeutsch sprechen wollen.",
    },

    historyTitle: "Ihre Aufnahmen",
    historyUnwritten: "Ohne Text — nur gemessen.",
    deleteTake: "Löschen",
    progressDays: "Tage gesprochen",
    progressTakes: "Aufnahmen",
    progressSpoken: "gesprochen",
    progressSeconds: "Sek.",
    progressMinutes: "Min.",
    progressNote: "Gezählt, nicht bewertet. Diese Zahl fällt nie — eine Pause von zwei Wochen kostet nichts.",
    privacy: "Der Ton verlässt Ihr Gerät nie. Gespeichert werden nur die Messwerte und Ihr eigener Text — in diesem Browser, nicht bei uns.",
    privacyTranscribed: "In dieser Sprache geht die Aufnahme einmal an einen Dienst, der sie in Text verwandelt, und wird dort nicht gespeichert. Bei uns bleiben nur die Messwerte und der Text — in diesem Browser.",
  },

  /**
   * Das Whitepaper und die Änderungsliste.
   *
   * Nur das Gerüst steht hier in sieben Sprachen — die Argumentation selbst
   * liegt in `lib/config/paper.ts` und `lib/config/changelog.ts` auf Deutsch
   * und Englisch. Dieselbe Entscheidung wie bei den Branchen und beim
   * Investorenraum, aus demselben Grund: sieben maschinengeprüfte
   * Übersetzungen eines Textes, den hier niemand gegenlesen kann, wären sechs
   * Haftungsrisiken.
   */
  paper: {
    checkLabel: "Selbst nachprüfen",
    sourcesTitle: "Quellen",
  },

  changelog: {
    title: "Änderungen",
    lead: "Was sich geändert hat, mit Datum — und in den Worten von jemandem, der es benutzt.",
    note: "Kein Git-Protokoll. Das Repository ist öffentlich, wer jeden Commit will, findet ihn dort. Hier steht, was jemand gemerkt hätte — Fehler eingeschlossen, denn eine Änderungsliste ohne peinliche Zeilen ist der Beweis, dass das Versprechen «wir zeigen auch, was nicht ging» geschmückt ist.",
    tags: {
      feature: "Neu",
      improvement: "Besser",
      fix: "Behoben",
      platform: "Unterbau",
      breaking: "Bruch",
    },
  },

  organisations: {
    title: "Für Organisationen",
    lead: "Wo Mundart nicht Ihr Problem ist, sondern das Ihrer Leute.",
    momentLabel: "Der Moment",
    stakeLabel: "Was es kostet",
    offerLabel: "Was Heidi tut",
    unknownLabel: "Was wir Sie fragen müssten",
    chooseSector: "Ihr Bereich",
    allSectors: "Alle Bereiche",
    readMore: "Weiterlesen",
    startTitle: "Wie es anfängt, wenn Sie schreiben",
    noCustomers: "Heidi hat heute keine Kunden, keine Pilotprojekte und keine Fallstudien — und diese Seite behauptet auch keine. Was hier steht, ist eine Beschreibung Ihres Problems, so gut wir es von aussen kennen. Sagen Sie uns, wo wir falsch liegen.",
    talk: "Schreiben Sie uns",
  },

  /**
   * Die Situationsseiten.
   *
   * DER MOMENT IST DIE ORDNUNG, nicht die Wortart. Der Wortschatz ist nach
   * Wortarten sortiert und hat dafür ein gutes Argument; für eine Schicht ist
   * es die falsche Ordnung. Niemand betritt eine Übergabe und braucht «die
   * zwölf häufigsten Partikeln» — gebraucht werden vier Sätze darüber, wer
   * schlecht geschlafen hat.
   *
   * «verified» sagt, wie die Sätze geprüft sind: maschinell auf Zürcher Formen,
   * die Wörter im Idiotikon belegt. Eine Stärke, als Stärke formuliert — und
   * nichts, was nicht stimmt.
   */
  situations: {
    title: "Wo Sie es brauchen",
    lead: "Nicht nach Wortarten geordnet, sondern nach dem Moment: was in dieser Situation wirklich gesagt wird, in der Reihenfolge, in der es kommt.",
    note: "Richtung wie überall hier: zuerst verstehen. Die meisten Sätze hören Sie — die wenigen, die Sie selbst sagen, sind markiert.",
    verified: "Jeder Satz ist maschinell auf Zürcher Formen geprüft, und seine Wörter sind im Schweizerischen Idiotikon belegt.",
    hear: "Das hören Sie",
    say: "Das sagen Sie",
    linesLabel: "Sätze",
    heardLabel: "zum Verstehen",
    grammarLabel: "Was hier immer wieder vorkommt",
    practiseLabel: "Jetzt üben",
    backLabel: "Alle Situationen",
    strength: {
      title: "Wie weit Sie hier sind",
      new: "Noch nicht begonnen",
      met: "Angefangen",
      steady: "Das meiste sitzt",
      sure: "Sie verstehen diese Situation",
      claim: "Sie verstehen Zürichdeutsch in dieser Situation — geprüft an allen {total} Sätzen, die hier vorkommen.",
      progress: "{held} von {total} Sätzen sitzen",
      stuckNote: "{stuck} davon sind nach einer Pause wiedergekommen und sassen immer noch.",
      remainingTitle: "Diese fehlen noch",
      drill: "Diese Situation üben",
      drillAgain: "Weiter üben",
      noneYet: "Üben Sie diese Situation — dann steht hier, wie weit Sie sind.",
      localOnly: "Das rechnet Ihr Browser aus. Es verlässt dieses Gerät nicht.",
      boardTitle: "Wo Sie stark sind",
      boardLead: "Situation für Situation. Man kann im Pflegeheim sicher sein und im Restaurant nicht — das ist kein Widerspruch, sondern der Punkt.",
      weakest: "Hier lohnt sich das Üben gerade am meisten",
    },
    domains: {
      everyday: {
        title: "Alltag in Zürich",
        lead: "Laden, Tram, Treppenhaus, Telefon, Mittagstisch. Situationen, in denen fast alle jede Woche stehen — und in denen der Raum genau dann ins Hochdeutsche wechselt, wenn er merkt, dass Sie Mühe haben.",
      },
      care: {
        title: "Alters- und Pflegeheime",
        lead: "Eine Bewohnerin mit Demenz verliert ihre Zweitsprachen zuerst. Was bleibt, ist das Züritüütsch ihrer Kindheit — und das ist die Sprache, in der die Schicht läuft.",
      },
    },
    scenes: {
      restaurant: {
        title: "Im Restaurant",
        scene: "Vier feste Fragen und eine, die über die Rechnung entscheidet. «Zäme oder separat» wird einmal gefragt, schnell, und wer es falsch versteht, merkt es am ganzen Tisch.",
      },
      "at-work": {
        title: "Bei der Arbeit",
        scene: "Die Sitzung läuft auf Hochdeutsch oder Englisch. Der Gang, die Kaffeemaschine und der Moment, in dem wirklich etwas entschieden wird, tun das nicht.",
      },
      "school-parents": {
        title: "Im Kindsgi",
        scene: "Im Kanton Zürich ist der Kindergarten auf Mundart — das hat die Stimmbevölkerung 2011 so entschieden. Wer Hochdeutsch gelernt hat, merkt das am Elternabend, vor allen anderen.",
      },
      shopping: {
        title: "Im Laden",
        scene: "Vier Fragen, jedes Mal dieselben, an der Kasse mit einer Schlange dahinter — also genau dort, wo Nachfragen am meisten kostet.",
      },
      tram: {
        title: "Im Tram",
        scene: "Durchsagen und Fremde, beide schnell. Die eine Situation, in der Nichtverstehen nicht den Satz kostet, sondern den Nachmittag.",
      },
      neighbours: {
        title: "Im Treppenhaus",
        scene: "Waschküche, Velo im Gang, Abfuhr. Ein Zettel an der Tür ist hier keine Bitte — wer ihn als eine liest, wird zur schwierigen Nachbarin, ohne dass es ihr je jemand sagt.",
      },
      appointment: {
        title: "Am Telefon",
        scene: "Der schwierigste Kanal in jeder Fremdsprache und der, den niemand übt: kein Gesicht, kein Kontext, und jemand, der eine Liste abarbeitet.",
      },
      "small-talk": {
        title: "Am Mittagstisch",
        scene: "Die Szene, wegen der es Heidi gibt. Der Tisch wechselt ins Hochdeutsche, sobald er merkt, dass Sie kämpfen — und nimmt Ihnen damit genau das weg, was helfen würde.",
      },
      handover: {
        title: "Die Übergabe",
        scene: "Kollegin zu Kollegin, nichts wird verlangsamt, niemand wechselt Ihretwegen ins Hochdeutsche. Der schnellste Moment des Tages — und der, der über die ganze Schicht entscheidet.",
      },
      "morning-care": {
        title: "Am Morgen",
        scene: "Kurze Sätze, während beide Hände beschäftigt sind. Hier ist Hochdeutsch nicht die neutrale Variante: Wer mitten in der Pflege die Sprache wechselt, wirkt wie eine andere Person.",
      },
      pain: {
        title: "Wenn etwas weh tut",
        scene: "Schmerz spricht keine Zweitsprache. Wer ihn meldet, formuliert nicht — und wer ihn falsch versteht, hält Schmerz für Unruhe.",
      },
      meals: {
        title: "Essen und Trinken",
        scene: "Die Situation, die am häufigsten vorkommt und auf die sich niemand vorbereitet, weil sie einfach klingt.",
      },
      "evening-unrest": {
        title: "Unruhe am Abend",
        scene: "Jemand will nach Hause, in ein Zuhause, das es seit vierzig Jahren nicht mehr gibt. Was hier hilft, ist kurz, im Präsens und in der Sprache, in der die Person denkt.",
      },
      visitors: {
        title: "Besuch",
        scene: "Plötzlich sind Sie das Haus. Die Tochter am Sonntagnachmittag beurteilt den Betrieb danach, ob die Person an der Tür ihr folgen konnte.",
      },
      doctor: {
        title: "In der Arztpraxis",
        scene: "Das Telefon hat Ihnen einen Termin verschafft; jetzt kommen Empfang, Wartezimmer und Sprechzimmer. Am Empfang wird schnell gefragt, im Sprechzimmer genau — und bei beidem zählt, dass Sie die Frage verstanden haben, bevor Sie antworten.",
      },
      municipality: {
        title: "Auf der Gemeinde",
        scene: "Wer nach Zürich zieht, meldet sich an — meist in den ersten Wochen und meist, bevor er einem Satz folgen kann. Die Fragen sind jedes Mal dieselben, und die Person hinter dem Glas stellt sie hundertmal am Tag, entsprechend schnell.",
      },
      "laundry-room": {
        title: "In der Waschküche",
        scene: "Der Plan an der Wand ist ein Gesetz, das niemand erklärt. Wer das Sieb nicht putzt oder am falschen Tag wäscht, hört davon — selten direkt, meistens auf einem Zettel.",
      },
      apero: {
        title: "Am Apéro",
        scene: "Ein Glas in der Hand, niemand muss bleiben, alle reden Mundart. Hier beginnt eine Zürcher Bekanntschaft — und «Mer sött emal öppis zäme mache» ist herzlich gemeint, aber keine Einladung.",
      },
      "indirect-no": {
        title: "Wenn Nein nicht Nein heisst",
        scene: "In Zürich wird selten direkt abgelehnt. «Das isch ächli schwierig» oder «Mer chönnt sich das überlegge» ist oft schon die Antwort, höflich verpackt — wer es wörtlich nimmt, wartet auf etwas, das längst gesagt wurde.",
      },
    },
  },

};

/**
 * Deliberately NOT `as const`: the other locales are typed against this, and
 * literal types would demand that the French dictionary contain the German
 * words. Widened strings give exactly the guarantee wanted — same shape, same
 * keys, any text.
 */
export type Dictionary = typeof de;
