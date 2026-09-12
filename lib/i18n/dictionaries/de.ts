/**
 * German — the source dictionary. Every other locale is typed against this
 * one, so a missing key is a build error rather than an English word showing
 * up in the middle of an Italian page.
 *
 * Swiss Standard German: no ß, ever. The deterministic gate rejects it in
 * dialect, and it would be incoherent for the site around it to use it.
 */
export const de = {
  meta: {
    title: "Heidi — Schweizerdeutsch verstehen",
    description:
      "Verstehen, was um Sie herum wirklich gesprochen wird. Heidi übersetzt echte Nachrichten, erklärt die Wörter, die Sie noch nicht kennen, und prüft jede Antwort auf echte Dialektformen. Start: Zürichdeutsch.",
  },

  nav: {
    home: "Start",
    method: "Methode",
    research: "Forschung",
    check: "Dialekt-Check",
    contribute: "Mitmachen",
    about: "Über uns",
    portal: "Mein Bereich",
    settings: "Einstellungen",
    groupUse: "Benutzen",
    groupWhy: "Warum so",
    groupProject: "Projekt",
    skipToContent: "Zum Inhalt springen",
    menu: "Menü",
    language: "Sprache wählen",
    langNational: "Landessprachen",
    langOther: "Weitere Sprachen",
  },

  footer: {
    tagline: "Zürichdeutsch verstehen, und dann mitreden.",
    builtOn: "Gemacht in Zürich.",
    sections: "Seiten",
    projectTitle: "Projekt",
    languageTitle: "Sprache",
    openSource: "Offen gebaut",
    openSourceNote: "Wir schreiben auf, was wir lernen — auch das, was nicht funktioniert hat.",
    rights: "Heidi, Zürich.",
  },

  home: {
    eyebrow: "Schwiizerdütsch · Start: Züritüütsch",
    headline: "Schweizerdeutsch verstehen. Und schreiben wie jemand von hier.",
    sub: "Für alle, die Deutsch können und am Mittagstisch trotzdem nichts verstehen. Fügen Sie ein, was Sie bekommen haben — oder schreiben Sie, was Sie sagen möchten.",
    dialectTitle: "Wir beginnen mit Zürich",
    dialectBody:
      "Schweizerdeutsch ist keine Sprache, sondern eine Familie. Heidi beherrscht heute Zürichdeutsch richtig gut und sagt Ihnen das lieber, als so zu tun, als könnte es alles. Genau darum weist die Prüfung Berner Formen zurück: nicht weil Berndeutsch falsch wäre, sondern weil wir gerade Zürich unterrichten. Weitere Dialekte kommen dazu — jeder mit eigenen Stimmen und eigener Prüfung.",
    dialectPlanned: "Geplant",
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
    placeholder: "Fügen Sie ein, was Sie bekommen haben — oder schreiben Sie, was Sie sagen möchten.",
    composer: "Nachricht an Heidi",
    send: "Senden",
    thinking: "Heidi liest mit …",
    you: "Sie",
    emptyTitle: "Fragen Sie Heidi",
    emptyBody:
      "Eine Nachricht, ein Satz, ein einzelnes Wort. Heidi merkt selbst, ob Sie etwas verstehen oder etwas sagen möchten — und Sie können einfach weiterfragen.",
    examples: [
      "Im Kauz scho, hät mer nöd so gfalle. Du au?",
      "Sag ihnen, dass ich zehn Minuten später komme — freundlich.",
      "Chunnsch au no verbi hüt Abig?",
    ],
    glossTitle: "Wörter, die bleiben sollten",
    suggestionsTitle: "Das können Sie schicken",
    sendThis: "Das können Sie schicken",
    copy: "Kopieren",
    copied: "Kopiert",
    flagged: "Nicht Zürichdeutsch:",
    checkedNote: "Gegen Zürcher Formen geprüft",
    mic: "Diktieren",
    micStop: "Aufnahme beenden",
    micListening: "Ich höre …",
    micTranscribing: "Wird übertragen …",
    micProblem: {
      mic: "Kein Zugriff aufs Mikrofon. Sie können weiterhin tippen.",
      silence: "Nichts gehört. Drücken Sie nochmals aufs Mikrofon und sprechen Sie gleich los.",
      unavailable: "Diktieren funktioniert in diesem Browser nicht. Sie können weiterhin tippen.",
    },
    newChat: "Neues Gespräch",
    explanationsIn: "Erklärungen auf Deutsch",
    notConfigured: "Das Sprachmodell ist auf dieser Installation noch nicht eingerichtet.",
    unreachable: "Heidi ist nicht erreichbar. Bitte Verbindung prüfen und nochmals versuchen.",
    failed: "Heidi konnte das gerade nicht beantworten. Bitte gleich nochmals versuchen.",
    retry: "Nochmals",
  },

  model: {
    attach: "Bild anhängen",
    attachNeedsKey: "Bilder lesen braucht Ihr eigenes Modell",
    remove: "Entfernen",
    connectTitle: "Ihr eigenes Modell verbinden",
    connectLead:
      "Heidi ist gratis, und die kostenlosen Modelle können keine Bilder lesen. Wenn Sie einen eigenen API-Schlüssel hinterlegen, kann Heidi Screenshots verstehen — und antwortet insgesamt besser.",
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
        source: "Gooskens, van Heuven, Golubović, Schüppert, Swarte & Voigt, 2017/18",
      },
      {
        claim: "Konsonantenregeln sagen Verständlichkeit deutlich besser voraus als Vokalregeln.",
        detail: "r ≈ −.74 gegenüber −.29. Zwei unserer vier Regeln auf der Startseite sind Vokalregeln und damit die schwächere Wette.",
        source: "Gooskens & Heeringa",
      },
      {
        claim: "Training mit vielen Stimmen ist das, was auf unbekannte Stimmen übergeht.",
        detail:
          "Mit einer einzigen Stimme zu üben kann auf genau dieser Stimme besser abschneiden und überträgt sich nicht. Für regionale Dialekte eigens bestätigt.",
        source: "Logan, Lively & Pisoni 1991; Clopper & Pisoni 2004",
      },
      {
        claim: "Zu sagen, worauf man hören soll, ist ein Wirkstoff und nicht Dekoration.",
        detail:
          "Gleiches Material, gleiche Rückmeldung: gelernt hat nur die Gruppe, die auf den relevanten Kontrast hingewiesen wurde.",
        source: "Pederson & Guion-Anderson, 2010",
      },
      {
        claim: "Abrufen mit Rückmeldung schlägt Nachlesen.",
        detail: "222 Studien, 48'478 Lernende; g ≈ 0.50, mit Rückmeldung 0.54 gegenüber 0.37 ohne.",
        source: "Yang, Luo, Vadillo, Yu & Shanks, 2021",
      },
      {
        claim: "Verteiltes Üben schlägt geballtes, und der Vorsprung wächst mit der Zeit.",
        detail: "g ≈ 0.76 sofort, g ≈ 1.15 nach Verzögerung, über 48 Experimente und 3411 Personen.",
        source: "Kim & Webb, 2022",
      },
      {
        claim: "Untertitel helfen — nach dem Hörversuch, nicht währenddessen.",
        detail:
          "Grosser Effekt auf Wortschatz (g ≈ 0.87), offenbar weil Text hilft, den Lautstrom in Wörter zu zerlegen. Dauerhaft eingeblendeter Text wird zur Krücke.",
        source: "Montero-Perez, Van Den Noortgate & Desmet, 2013",
      },
      {
        claim: "Hörtraining verbessert das eigene Sprechen nur schwach.",
        detail: "d ≈ 0.92 für die Wahrnehmung, d ≈ 0.54 für die Produktion, ohne Zusammenhang zwischen beiden.",
        source: "Sakai & Moorman, 2018",
      },
      {
        claim: "Dialekt zu schreiben ist in der Schweiz digital normal, nicht Slang.",
        detail: "Das ist der Grund, warum «schreiben wie jemand von hier» eine echte Kompetenz ist und keine Spielerei.",
        source: "Universität Bern, Texting in Time; UZH, What's Up",
      },
    ],
    hypotheses: [
      {
        claim: "Lautregeln wirken als Hinweis in der Übung, obwohl sie als Lektion nicht wirken.",
        detail:
          "Der einzige saubere Test der Lektionsform — 50 Minuten Niederländisch-Friesisch — zeigte keine signifikante Wirkung, und die Autoren selbst warnen davor, das zu verallgemeinern. Die gesamte europäische Interkomprehensions-Didaktik ist nach Aussage der führenden Forschenden praktisch nicht evaluiert. Unsere Variante ist also die ungetestete. Deshalb messen wir sie.",
        source: "Bergsma, Swarte & Gooskens, 2014",
      },
      {
        claim: "Eine kurze Eingewöhnung verbessert messbar das Verstehen einer fremden Stimme.",
        detail:
          "Was nach rund einer Minute belegt ist, ist eine höhere Verarbeitungsgeschwindigkeit — nicht mehr verstandene Wörter. Wir behaupten deshalb nicht, dass Sie nach einer Minute mehr verstehen.",
        source: "Clarke & Garrett, 2004",
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
    intro:
      "Fügen Sie Text ein, der Zürichdeutsch sein soll. Diese Prüfung ist eine feste Regelliste — kein Sprachmodell — und markiert Formen, die aus einer anderen Deutschschweizer Region stammen oder in der Schweiz gar nicht vorkommen.",
    placeholder: "Das isch nid güet, gäu",
    button: "Prüfen",
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
        body: "Heute: Verstehen und Antworten auf echten Text. Als Nächstes: das Hörlabor, in dem Sie eine Zürcher Stimme hören, sich eingewöhnen und wir messen, wie viel Sie von einer anderen verstehen. Das braucht Aufnahmen, und die entstehen gerade.",
      },
    ],
    stateTitle: "Stand heute",
  },

  settings: {
    title: "Einstellungen",
    lead: "Alles, was Heidi über Sie weiss, an einem Ort — und alles davon können Sie wieder entfernen.",
    languageTitle: "Sprache der Seite",
    languageBody: "In welcher Sprache Heidi mit Ihnen spricht. Was Sie lernen, bleibt Zürichdeutsch.",
    modelTitle: "Sprachmodell",
    modelBody: "Standardmässig benutzt Heidi kostenlose Modelle. Ein eigener Schlüssel schaltet Bilder frei und verbessert die Antworten.",
    modelNone: "Kein eigenes Modell verbunden",
    accountTitle: "Konto",
    accountBody: "Zum Speichern Ihrer Wörter und für Lerngruppen. Zum Übersetzen brauchen Sie kein Konto.",
    dataTitle: "Was auf diesem Gerät liegt",
    dataBody:
      "Ihr Gespräch bleibt in diesem Tab und verschwindet, wenn Sie ihn schliessen. Ein eigener Schlüssel liegt im Speicher dieses Browsers, bis Sie ihn entfernen. Auf unseren Servern liegt nichts davon.",
  },

  auth: {
    signIn: "Anmelden",
    signOut: "Abmelden",
    signInWith: "Mit OrangeCat anmelden",
    account: "Konto",
    portalTitle: "Mein Bereich",
    portalLead:
      "Hier entsteht Ihr persönlicher Teil von Heidi: die Wörter, die Sie nachgeschlagen haben, Menschen zum Üben, und Tutorinnen und Tutoren, wenn Sie welche möchten.",
    signedInAs: "Angemeldet als",
    notSignedIn: "Sie sind nicht angemeldet",
    notSignedInBody:
      "Melden Sie sich an, damit Heidi sich merken kann, was Sie noch nicht konnten. Ohne Anmeldung funktioniert alles andere weiterhin — das Übersetzen und die Dialektprüfung brauchen kein Konto.",
    whyTitle: "Warum OrangeCat",
    whyBody:
      "Heidi führt keine eigene Benutzerdatenbank. Ihre Identität liegt bei OrangeCat, wo auch Profile und Bezahlung schon zuhause sind. Das heisst: ein Konto für mehrere Produkte, kein weiteres Passwort — und bei uns liegt nichts, was gestohlen werden könnte.",
    soonTitle: "Was als Nächstes kommt",
    soonList: [
      "Ihre Wörter — was Sie nachgeschlagen haben, kommt später wieder.",
      "Lerngruppen — selbst organisiert, mit Heidi als Teilnehmerin.",
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
      "Konkret heisst das: zuerst weitere Deutschschweizer Dialekte, danach eine Sprache ausserhalb der Schweiz — dieselbe Maschine, ein anderer Sprachsatz. Was wir dabei lernen, schreiben wir auf.",
  },

  errors: {
    notFoundTitle: "Diese Seite gibt es nicht",
    notFoundBody: "Vielleicht ist der Link alt, vielleicht haben wir etwas verschoben.",
    backHome: "Zurück zum Start",
  },
};

/**
 * Deliberately NOT `as const`: the other locales are typed against this, and
 * literal types would demand that the French dictionary contain the German
 * words. Widened strings give exactly the guarantee wanted — same shape, same
 * keys, any text.
 */
export type Dictionary = typeof de;
