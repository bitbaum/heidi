import type { SituationPack } from "../pack.ts";

/**
 * Ordinary life in Zurich, in Zurich German.
 *
 * WHY THIS IS THE SECOND DOMAIN AND NOT A THIRD VERTICAL. `care` was built
 * first because it is the sharpest case — a resident who has lost her second
 * languages, and a carer who learned the wrong variety. But it serves one
 * occupation, and most people who open this product are not in it. They are in
 * a shop, on a tram, in a stairwell, on the phone to a practice, and at a
 * lunch table where the language switches the moment it turns informal.
 *
 * It is also what makes the exercises stop repeating. Practice is a
 * rearrangement of checked material, so the pool grows exactly as fast as the
 * material does and no shuffle can fake it. Fifty more lines is fifty more
 * gapped sentences and a dozen more passages, drawn from situations a learner
 * is in every week rather than one they may never be in.
 *
 * SAME THREE GUARANTEES as `care`, and they are not weaker for being ordinary:
 * every line passes the deterministic gate at the generation threshold, every
 * line names the source vouching for its lexis, and `provenance` says plainly
 * that no native speaker has read them yet.
 *
 * WHAT IS DELIBERATELY ABSENT: brand names. `Cumulus`, `Migros`, `Bellevue`
 * are what is actually said, and a phrasebook would include them. They are
 * left out because they date, because they are not language, and because a
 * learner who can follow "Händ Sie e Charte?" can follow it with any shop's
 * word in front of it.
 */
export const EVERYDAY: SituationPack = {
  id: "everyday",
  variety: "gsw-u-sd-chzh",
  provenance: { nativeReviewed: false },

  situations: [
    {
      /**
       * Shopping, which is the first place most people fail. The exchange is
       * short, it is the same four questions every time, and it happens at a
       * till with a queue behind you — the one setting where asking somebody
       * to repeat themselves feels most expensive.
       */
      id: "shopping",
      phrases: [
        { target: "Grüezi mitenand.", bridge: "Guten Tag zusammen.", direction: "hear", source: "idiotikon" },
        { target: "Händ Sie e Charte?", bridge: "Haben Sie eine Karte?", direction: "hear", source: "idiotikon" },
        { target: "Zahled Sie mit Charte oder bar?", bridge: "Zahlen Sie mit Karte oder bar?", direction: "hear", source: "idiotikon" },
        { target: "Bruuched Sie es Säckli?", bridge: "Brauchen Sie ein Tütchen?", direction: "hear", grammar: "diminutive-li", source: "idiotikon" },
        { target: "Mir händ das grad nüme.", bridge: "Wir haben das gerade nicht mehr.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Das isch grad in de Aktion.", bridge: "Das ist gerade im Angebot.", direction: "hear", source: "idiotikon" },
        { target: "Wo find ich d Rüebli?", bridge: "Wo finde ich die Karotten?", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Ich gang schnäll go poschte.", bridge: "Ich gehe schnell einkaufen.", direction: "say", grammar: "go-cho-infinitive", source: "idiotikon" },
        { target: "Häts no meh devo?", bridge: "Gibt es noch mehr davon?", direction: "say", source: "idiotikon" },
        { target: "Merci vilmal, en schöne Aabig.", bridge: "Vielen Dank, einen schönen Abend.", direction: "hear", source: "idiotikon" },
      ],
    },

    {
      /**
       * The tram. Announcements and strangers, both of them fast, and the one
       * situation where not following costs you the afternoon rather than the
       * sentence.
       */
      id: "tram",
      phrases: [
        { target: "S Tram fahrt hüt nöd bis zum Bahnhof.", bridge: "Das Tram fährt heute nicht bis zum Bahnhof.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Sie müend do umstiege.", bridge: "Sie müssen hier umsteigen.", direction: "hear", source: "idiotikon" },
        { target: "D nöchscht Haltstell chunt grad.", bridge: "Die nächste Haltestelle kommt gleich.", direction: "hear", source: "idiotikon" },
        { target: "Es hät en Umleitig.", bridge: "Es gibt eine Umleitung.", direction: "hear", source: "idiotikon" },
        { target: "Mir warted scho zäh Minute.", bridge: "Wir warten schon zehn Minuten.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Häsch es Billett?", bridge: "Hast du ein Ticket?", direction: "hear", source: "idiotikon" },
        { target: "Chumm, mir lauffed.", bridge: "Komm, wir gehen zu Fuss.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Isch dä Platz no frei?", bridge: "Ist dieser Platz noch frei?", direction: "say", source: "idiotikon" },
        { target: "Ich ha s Tram verpasst.", bridge: "Ich habe das Tram verpasst.", direction: "say", grammar: "no-preterite", source: "idiotikon" },
        { target: "Weisch du, wänn s nöchscht chunt?", bridge: "Weisst du, wann das nächste kommt?", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * Neighbours — the stairwell, the laundry room, the rubbish. This is the
       * domain where misunderstanding is most expensive in a way nobody warns
       * you about: a note on the door about the Waschküche is not a request,
       * and somebody who reads it as one becomes the difficult neighbour
       * without ever being told.
       */
      id: "neighbours",
      phrases: [
        { target: "D Waschchuchi isch am Zischtig frei.", bridge: "Die Waschküche ist am Dienstag frei.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "S Velo dörf nöd im Gang staa.", bridge: "Das Fahrrad darf nicht im Gang stehen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Chönd Sie am Aabig ächli liisliger sii?", bridge: "Könnten Sie am Abend etwas leiser sein?", direction: "hear", source: "idiotikon" },
        { target: "Ich ha Ihne s Päckli aagnoh.", bridge: "Ich habe Ihr Päckchen angenommen.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "De Hauswart chunt am Mäntig.", bridge: "Der Hauswart kommt am Montag.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mir händ am Samschtig es Fescht.", bridge: "Wir haben am Samstag ein Fest.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Kei Problem, gäll.", bridge: "Kein Problem, nicht wahr.", direction: "hear", source: "idiotikon" },
        { target: "Grüezi, ich bi de nöi Nachbar.", bridge: "Guten Tag, ich bin der neue Nachbar.", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Wänn chunt d Abfuhr?", bridge: "Wann kommt die Abfuhr?", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Chönd Sie mir churz hälfe?", bridge: "Können Sie mir kurz helfen?", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * The telephone, which is the hardest channel in any second language and
       * the one nobody practises: no face, no context, and a stranger who is
       * working through a list. `aalüte` is on the vocabulary page for exactly
       * this scene.
       */
      id: "appointment",
      phrases: [
        { target: "Sind Sie scho bi eus gsi?", bridge: "Waren Sie schon bei uns?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Händ Sie d Versicherteecharte debii?", bridge: "Haben Sie die Versichertenkarte dabei?", direction: "hear", source: "idiotikon" },
        { target: "De Dokter isch grad am telefoniere.", bridge: "Der Arzt telefoniert gerade.", direction: "hear", grammar: "am-progressive", source: "idiotikon" },
        { target: "Mir gänd Ihne en Termin am Donnschtig.", bridge: "Wir geben Ihnen einen Termin am Donnerstag.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Ich lüt Ihne spööter no aa.", bridge: "Ich rufe Sie später noch an.", direction: "hear", source: "idiotikon" },
        { target: "Sit wenn händ Sie das?", bridge: "Seit wann haben Sie das?", direction: "hear", source: "idiotikon" },
        { target: "Ich möcht en Termin abmache.", bridge: "Ich möchte einen Termin vereinbaren.", direction: "say", source: "idiotikon" },
        { target: "Chönd Sie mir das ufschriibe?", bridge: "Können Sie mir das aufschreiben?", direction: "say", source: "idiotikon" },
        { target: "Ich mues det no aalüte.", bridge: "Ich muss dort noch anrufen.", direction: "say", source: "idiotikon" },
        { target: "Guet, bis Donnschtig denn.", bridge: "Gut, bis Donnerstag dann.", direction: "hear", source: "idiotikon" },
      ],
    },

    {
      /**
       * Eating out. Four fixed questions and one that decides the bill —
       * «zäme oder separat» is asked once, quickly, and getting it wrong is
       * remembered by everybody at the table.
       */
      id: "restaurant",
      phrases: [
        { target: "Händ Sie reserviert?", bridge: "Haben Sie reserviert?", direction: "hear", source: "idiotikon" },
        { target: "Was dörf s sii?", bridge: "Was darf es sein?", direction: "hear", source: "idiotikon" },
        { target: "De Tisch dört äne isch frei.", bridge: "Der Tisch dort drüben ist frei.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Znacht git s ab sächsi.", bridge: "Abendessen gibt es ab sechs.", direction: "hear", source: "idiotikon" },
        { target: "Wänd Sie no en Kafi?", bridge: "Möchten Sie noch einen Kaffee?", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Zäme oder separat?", bridge: "Zusammen oder getrennt?", direction: "hear", source: "idiotikon" },
        { target: "Für mich es Mineral, bitte.", bridge: "Für mich ein Mineralwasser, bitte.", direction: "say", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Häts no öppis Vegetarischs?", bridge: "Gibt es noch etwas Vegetarisches?", direction: "say", source: "idiotikon" },
        { target: "Ich zale mit Charte.", bridge: "Ich zahle mit Karte.", direction: "say", source: "idiotikon" },
        { target: "Stimmt so, merci.", bridge: "Stimmt so, danke.", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * Work, and the half of it that is not the work.
       *
       * The meeting runs in Standard German or English; the corridor, the
       * coffee machine and the moment something is actually decided do not.
       * That gap is the `employers` row on `/organisations`, and these are the
       * lines it is made of.
       */
      id: "at-work",
      phrases: [
        { target: "Chasch mer schnäll hälfe?", bridge: "Kannst du mir kurz helfen?", direction: "hear", source: "idiotikon" },
        { target: "Mir händ am zäh e Sitzig.", bridge: "Wir haben um zehn eine Sitzung.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Das isch bis Friitig pressant.", bridge: "Das ist bis Freitag dringend.", direction: "hear", source: "idiotikon" },
        { target: "Häsch s Mail scho gläse?", bridge: "Hast du die Mail schon gelesen?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Chumm, mir mached Pause.", bridge: "Komm, wir machen Pause.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Wänn häsch Fiirabig?", bridge: "Wann hast du Feierabend?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Bis morn denn.", bridge: "Bis morgen dann.", direction: "hear", source: "idiotikon" },
        { target: "Ich bi am Namittag im Büro.", bridge: "Ich bin am Nachmittag im Büro.", direction: "say", source: "idiotikon" },
        { target: "Ich lüt em Chef grad aa.", bridge: "Ich rufe den Chef gleich an.", direction: "say", source: "idiotikon" },
        { target: "Ich mues no schnäll öppis fertig mache.", bridge: "Ich muss noch schnell etwas fertig machen.", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * The kindergarten, and the reason it is on this list rather than on a
       * roadmap.
       *
       * Kindergarten in the canton of Zurich is conducted in DIALECT — the
       * electorate decided that in 2011 — so a parent who learned Standard
       * German cannot follow their own child's school language, and discovers
       * it at the parents' evening in front of everybody. That is the
       * `schools` row on `/organisations`, and it aims at the parents rather
       * than the children for the same reason.
       */
      id: "school-parents",
      phrases: [
        { target: "De Kindsgi fangt am achti aa.", bridge: "Der Kindergarten fängt um acht an.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mir händ am Zischtig en Elterenaabig.", bridge: "Wir haben am Dienstag einen Elternabend.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Bringed Sie bitte Finkeli mit.", bridge: "Bringen Sie bitte Hausschuhe mit.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "S Chind hät hüt ächli gweint.", bridge: "Das Kind hat heute ein bisschen geweint.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Im Kindsgi redet mer Mundart.", bridge: "Im Kindergarten spricht man Mundart.", direction: "hear", source: "idiotikon" },
        { target: "Häsch d Znüni-Box debii?", bridge: "Hast du die Znüni-Box dabei?", direction: "hear", source: "idiotikon" },
        { target: "Mir gsehnd üs am Elterenaabig.", bridge: "Wir sehen uns am Elternabend.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Chan s Chind hüt früener hei?", bridge: "Kann das Kind heute früher nach Hause?", direction: "say", source: "idiotikon" },
        { target: "Wänn isch de Uusflug?", bridge: "Wann ist der Ausflug?", direction: "say", grammar: "question-words", source: "idiotikon" },
        { target: "Merci für d Rückmäldig.", bridge: "Danke für die Rückmeldung.", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * The lunch table — the scene that prompted this product.
       *
       * It is last because it is hardest, and it is here because it is the one
       * §2 describes: the room switches to Standard German the moment it
       * notices you are struggling, which withdraws the exposure precisely
       * when it would help. Every line is what gets said before that switch.
       */
      id: "small-talk",
      phrases: [
        { target: "Wie isch s Wuchenend gsi?", bridge: "Wie war das Wochenende?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Ganz guet, mir sind i de Bärge gsi.", bridge: "Ganz gut, wir waren in den Bergen.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Was machsch am Wuchenend?", bridge: "Was machst du am Wochenende?", direction: "hear", source: "idiotikon" },
        { target: "Chunnsch mit go Zmittag ässe?", bridge: "Kommst du mit zum Mittagessen?", direction: "hear", grammar: "go-cho-infinitive", source: "idiotikon" },
        { target: "Mir gönd ame am zwölfi.", bridge: "Wir gehen normalerweise um zwölf.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Es hät hüt schöns Wätter.", bridge: "Es hat heute schönes Wetter.", direction: "hear", source: "idiotikon" },
        { target: "Häsch es schön ghaa?", bridge: "Hattest du es schön?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Ich weiss no nöd.", bridge: "Ich weiss noch nicht.", direction: "say", source: "idiotikon" },
        { target: "Ich ha scho gesse, merci.", bridge: "Ich habe schon gegessen, danke.", direction: "say", grammar: "no-preterite", source: "idiotikon" },
        { target: "Schöne Aabig no.", bridge: "Noch einen schönen Abend.", direction: "hear", source: "idiotikon" },
      ],
    },
  ],
};
