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
        { target: "Bruuched Sie es Säckli?", bridge: "Brauchen Sie ein Säcklein?", direction: "hear", grammar: "diminutive-li", source: "idiotikon" },
        { target: "Mir händ das grad nüme.", bridge: "Wir haben das gerade nicht mehr.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Das isch grad in de Aktion.", bridge: "Das ist gerade im Angebot.", direction: "hear", source: "idiotikon" },
        { target: "Wo find ich d Rüebli?", bridge: "Wo finde ich die Karotten?", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Ich gang schnäll go poschte.", bridge: "Ich gehe schnell einkaufen.", direction: "say", grammar: "go-cho-infinitive", source: "idiotikon" },
        { target: "Häts no meh devo?", bridge: "Gibt es noch mehr davon?", direction: "say", source: "idiotikon" },
        { target: "Merci vilmal, en schöne Aabig.", bridge: "Vielen Dank, einen schönen Abend.", direction: "hear", source: "idiotikon" },
        { target: "Dörf s no öppis sii?", bridge: "Darf es noch etwas sein?", direction: "hear", source: "idiotikon" },
        { target: "Es macht drüü Franke zwänzg.", bridge: "Das macht drei Franken zwanzig.", direction: "hear", source: "idiotikon" },
        { target: "Händ Sie s nöd chliiner?", bridge: "Haben Sie es nicht kleiner?", direction: "hear", source: "idiotikon" },
        { target: "D Kasse zwei isch au offe.", bridge: "Die Kasse zwei ist auch offen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Wänd Sie de Beleg?", bridge: "Möchten Sie den Beleg?", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mir händ nur no di grosse Packige.", bridge: "Wir haben nur noch die grossen Packungen.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Exgüsi, sind Sie scho dra?", bridge: "Entschuldigung, sind Sie schon an der Reihe?", direction: "hear", source: "idiotikon" },
        { target: "Ich lueg nur schnäll.", bridge: "Ich schaue nur schnell.", direction: "say", source: "idiotikon" },
        { target: "Chan ich das umtuusche?", bridge: "Kann ich das umtauschen?", direction: "say", source: "idiotikon" },
        { target: "Nei merci, ich bruuche keis Säckli.", bridge: "Nein danke, ich brauche kein Säcklein.", direction: "say", grammar: "diminutive-li", source: "idiotikon" },
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
        { target: "Grüezi, d Billett bitte.", bridge: "Guten Tag, die Billette bitte.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Das Billett gilt nur für zwei Zone.", bridge: "Dieses Billett gilt nur für zwei Zonen.", direction: "hear", source: "idiotikon" },
        { target: "Chönd Sie ächli ufrucke?", bridge: "Können Sie ein bisschen aufrücken?", direction: "hear", source: "idiotikon" },
        { target: "Wänd Sie abhocke?", bridge: "Möchten Sie sich hinsetzen?", direction: "hear", source: "idiotikon" },
        { target: "De Chinderwage chunt i d Mitti.", bridge: "Der Kinderwagen kommt in die Mitte.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Bi de nöchschte Station müend Sie usstiege.", bridge: "An der nächsten Station müssen Sie aussteigen.", direction: "hear", source: "idiotikon" },
        { target: "Es hät en Unfall gää, drum staht s Tram.", bridge: "Es gab einen Unfall, darum steht das Tram.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Exgüsi, gaht das Tram bis zum Hauptbahnhof?", bridge: "Entschuldigung, fährt dieses Tram bis zum Hauptbahnhof?", direction: "say", source: "idiotikon" },
        { target: "Ich mues da use.", bridge: "Ich muss hier aussteigen.", direction: "say", source: "idiotikon" },
        { target: "Wo mues ich umstiege?", bridge: "Wo muss ich umsteigen?", direction: "say", grammar: "question-words", source: "idiotikon" },
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
        { target: "S Velo dörf nöd im Gang staa.", bridge: "Das Velo darf nicht im Gang stehen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Chönd Sie am Aabig ächli liisliger sii?", bridge: "Könnten Sie am Abend etwas leiser sein?", direction: "hear", source: "idiotikon" },
        { target: "Ich ha Ihne s Päckli aagnoh.", bridge: "Ich habe Ihr Päckchen angenommen.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "De Hauswart chunt am Mäntig.", bridge: "Der Hauswart kommt am Montag.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mir händ am Samschtig es Fescht.", bridge: "Wir haben am Samstag ein Fest.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Kei Problem, gäll.", bridge: "Kein Problem, nicht wahr.", direction: "hear", source: "idiotikon" },
        { target: "Grüezi, ich bi de nöi Nachbar.", bridge: "Guten Tag, ich bin der neue Nachbar.", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Wänn chunt d Abfuhr?", bridge: "Wann kommt die Abfuhr?", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Chönd Sie mir churz hälfe?", bridge: "Können Sie mir kurz helfen?", direction: "say", source: "idiotikon" },
        { target: "De Güsel chunt in Gebüehresack.", bridge: "Der Abfall kommt in den Gebührensack.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "De Karton wird am Mittwuch abgholt.", bridge: "Der Karton wird am Mittwoch abgeholt.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Sind Sie nöi da?", bridge: "Sind Sie neu hier?", direction: "hear", source: "idiotikon" },
        { target: "Mir wohned im dritte Stock.", bridge: "Wir wohnen im dritten Stock.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Sie händ de Schlüssel im Schloss la stecke.", bridge: "Sie haben den Schlüssel im Schloss stecken lassen.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "D Huustüre mues znacht zue sii.", bridge: "Die Haustür muss nachts geschlossen sein.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Ab zäh isch Nachtrueh.", bridge: "Ab zehn ist Nachtruhe.", direction: "hear", source: "idiotikon" },
        { target: "Wänn Sie öppis bruuched, lüüted Sie eifach.", bridge: "Wenn Sie etwas brauchen, läuten Sie einfach.", direction: "hear", source: "idiotikon" },
        { target: "Merci, das isch nett.", bridge: "Danke, das ist nett.", direction: "say", source: "idiotikon" },
        { target: "Ich wohne im zweite Stock.", bridge: "Ich wohne im zweiten Stock.", direction: "say", source: "idiotikon" },
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
        { target: "Praxis Dokter Huber, grüezi.", bridge: "Praxis Doktor Huber, guten Tag.", direction: "hear", source: "idiotikon" },
        { target: "Um was gaht s?", bridge: "Worum geht es?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Mir sind di ganz Wuche uusbuecht.", bridge: "Wir sind die ganze Woche ausgebucht.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Chönd Sie au am Morge früe?", bridge: "Können Sie auch früh am Morgen?", direction: "hear", source: "idiotikon" },
        { target: "Ich setz Sie uf d Warteliste.", bridge: "Ich setze Sie auf die Warteliste.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Bitte säged Sie ab, wänn Sie nöd chönd.", bridge: "Bitte sagen Sie ab, wenn Sie nicht können.", direction: "hear", source: "idiotikon" },
        { target: "Blibed Sie churz dra.", bridge: "Bleiben Sie kurz dran.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Ich mues de Termin verschiebe.", bridge: "Ich muss den Termin verschieben.", direction: "say", source: "idiotikon" },
        { target: "Chönd Sie das bitte widerhole?", bridge: "Können Sie das bitte wiederholen?", direction: "say", source: "idiotikon" },
        { target: "Ich ha grad nöd verstande, wänn.", bridge: "Ich habe gerade nicht verstanden, wann.", direction: "say", grammar: "no-preterite", source: "idiotikon" },
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
        { target: "Isch alles rächt gsi?", bridge: "War alles in Ordnung?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "D Chuchi isch scho zue.", bridge: "Die Küche ist schon geschlossen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mir händ hüt es Tagesmenü.", bridge: "Wir haben heute ein Tagesmenü.", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Das chunt mit Pommes oder Salat.", bridge: "Das kommt mit Pommes frites oder Salat.", direction: "hear", source: "idiotikon" },
        { target: "Wänd Sie no es Dessert?", bridge: "Möchten Sie noch ein Dessert?", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Ich bring Ihne grad d Charte.", bridge: "Ich bringe Ihnen gleich die Karte.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "En Guete mitenand.", bridge: "Guten Appetit zusammen.", direction: "hear", source: "idiotikon" },
        { target: "Chönd mer bitte zale?", bridge: "Können wir bitte zahlen?", direction: "say", source: "idiotikon" },
        { target: "Ich hett gern s Menü.", bridge: "Ich hätte gern das Menü.", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Hät s da Nüss drin?", bridge: "Sind da Nüsse drin?", direction: "say", source: "idiotikon" },
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
        { target: "Häsch s Mail scho gläse?", bridge: "Hast du das Mail schon gelesen?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Chumm, mir mached Pause.", bridge: "Komm, wir machen Pause.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Wänn häsch Fiirabig?", bridge: "Wann hast du Feierabend?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Bis morn denn.", bridge: "Bis morgen dann.", direction: "hear", source: "idiotikon" },
        { target: "Ich bi am Namittag im Büro.", bridge: "Ich bin am Nachmittag im Büro.", direction: "say", source: "idiotikon" },
        { target: "Ich lüt em Chef grad aa.", bridge: "Ich rufe den Chef gleich an.", direction: "say", source: "idiotikon" },
        { target: "Ich mues no schnäll öppis fertig mache.", bridge: "Ich muss noch schnell etwas fertig machen.", direction: "say", source: "idiotikon" },
        { target: "Chasch das bis morn aaluege?", bridge: "Kannst du das bis morgen anschauen?", direction: "hear", source: "idiotikon" },
        { target: "De Chef isch hüt im Homeoffice.", bridge: "Der Chef ist heute im Homeoffice.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mir sind no am plane.", bridge: "Wir planen noch.", direction: "hear", grammar: "am-progressive", source: "idiotikon" },
        { target: "Chasch mer s Dokumänt schicke?", bridge: "Kannst du mir das Dokument schicken?", direction: "hear", source: "idiotikon" },
        { target: "Das händ mir scho lang abgmacht.", bridge: "Das haben wir schon lange vereinbart.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Gömmer en Kafi go neh?", bridge: "Gehen wir einen Kaffee trinken?", direction: "hear", grammar: "go-cho-infinitive", source: "idiotikon" },
        { target: "Ich bi morn nöd im Büro.", bridge: "Ich bin morgen nicht im Büro.", direction: "hear", source: "idiotikon" },
        { target: "Tschau zäme, schöne Fiirabig.", bridge: "Tschüss zusammen, schönen Feierabend.", direction: "hear", source: "idiotikon" },
        { target: "Ich lueg mer s aa.", bridge: "Ich schaue es mir an.", direction: "say", source: "idiotikon" },
        { target: "Das schaff ich hüt nüme.", bridge: "Das schaffe ich heute nicht mehr.", direction: "say", source: "idiotikon" },
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
        { target: "D Chind gönd hüt in Wald.", bridge: "Die Kinder gehen heute in den Wald.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Bitte gäbed Sie Rägechleider mit.", bridge: "Bitte geben Sie Regenkleider mit.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Si hät hüt schön mitgmacht.", bridge: "Sie hat heute schön mitgemacht.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "S Znüni sött gsund sii.", bridge: "Das Znüni sollte gesund sein.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Es hät Lüüs im Kindsgi.", bridge: "Es gibt Läuse im Kindergarten.", direction: "hear", source: "idiotikon" },
        { target: "Er isch hüt ächli müed gsi.", bridge: "Er war heute ein bisschen müde.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Chönd Sie das bis am Friitig underschriibe?", bridge: "Können Sie das bis Freitag unterschreiben?", direction: "hear", source: "idiotikon" },
        { target: "D Chind laufed elei hei.", bridge: "Die Kinder gehen allein nach Hause.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Wie gaht s ihm im Kindsgi?", bridge: "Wie geht es ihm im Kindergarten?", direction: "say", source: "idiotikon" },
        { target: "Ich hol si am zwölfi ab.", bridge: "Ich hole sie um zwölf ab.", direction: "say", source: "idiotikon" },
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
        { target: "Wo chunnsch ursprünglich här?", bridge: "Woher kommst du ursprünglich?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Wie lang bisch scho z Züri?", bridge: "Wie lange bist du schon in Zürich?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Verstahsch scho ächli Züritüütsch?", bridge: "Verstehst du schon ein bisschen Zürichdeutsch?", direction: "hear", source: "idiotikon" },
        { target: "Mir sind am Sunntig go wandere.", bridge: "Wir sind am Sonntag wandern gegangen.", direction: "hear", grammar: "go-cho-infinitive", source: "idiotikon" },
        { target: "Hüt isch es mega heiss.", bridge: "Heute ist es sehr heiss.", direction: "hear", source: "idiotikon" },
        { target: "Häsch de Match geschter gseh?", bridge: "Hast du den Match gestern gesehen?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Mir gönd no uf es Bier, chunnsch au?", bridge: "Wir gehen noch auf ein Bier, kommst du auch?", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Du redsch ja scho guet Dütsch!", bridge: "Du sprichst ja schon gut Deutsch!", direction: "hear", source: "idiotikon" },
        { target: "Ich bi sit zwei Jahr da.", bridge: "Ich bin seit zwei Jahren hier.", direction: "say", source: "idiotikon" },
        { target: "Chasch bitte ächli langsamer rede?", bridge: "Kannst du bitte etwas langsamer sprechen?", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * The practice itself, one step past `appointment`. The telephone got you
       * a time; this is the desk, the waiting room and the consulting room, and
       * the questions arrive in the order a practice needs its answers.
       *
       * The same line as `care` holds here and for the same reason: nothing in
       * this scene names a condition, a medicine or a dose. The lines are the
       * frame a consultation happens in — what is asked, what you are told to
       * do with your body, what you are handed at the end — and what any of it
       * means medically belongs to the person in the room.
       */
      id: "doctor",
      phrases: [
        { target: "Grüezi, händ Sie en Termin?", bridge: "Guten Tag, haben Sie einen Termin?", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Ja, am halbi drüü bim Dokter Huber.", bridge: "Ja, um halb drei bei Doktor Huber.", direction: "say", source: "idiotikon" },
        { target: "Isch Ihri Adrässe no di gliich?", bridge: "Ist Ihre Adresse noch dieselbe?", direction: "hear", source: "idiotikon" },
        { target: "Nämed Sie no churz Platz im Wartzimmer.", bridge: "Nehmen Sie noch kurz Platz im Wartezimmer.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "De Dokter isch no bi eme andere Patiänt.", bridge: "Der Arzt ist noch bei einem anderen Patienten.", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Frau Novak, Sie chönd cho.", bridge: "Frau Novak, Sie können kommen.", direction: "hear", source: "idiotikon" },
        { target: "Was füert Sie zu eus?", bridge: "Was führt Sie zu uns?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Ich ha sit drüü Täg Fieber.", bridge: "Ich habe seit drei Tagen Fieber.", direction: "say", source: "idiotikon" },
        { target: "Händ Sie scho öppis gno?", bridge: "Haben Sie schon etwas genommen?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Sind Sie uf öppis allergisch?", bridge: "Sind Sie auf etwas allergisch?", direction: "hear", source: "idiotikon" },
        { target: "Mached Sie bitte de Oberkörper frei.", bridge: "Machen Sie bitte den Oberkörper frei.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Atmed Sie tüüf ii.", bridge: "Atmen Sie tief ein.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Tuet s weh, wänn ich da drucke?", bridge: "Tut es weh, wenn ich hier drücke?", direction: "hear", source: "idiotikon" },
        { target: "Das isch nüüt Schlimms.", bridge: "Das ist nichts Schlimmes.", direction: "hear", source: "idiotikon" },
        { target: "Ich schriib Ihne es Rezept.", bridge: "Ich schreibe Ihnen ein Rezept.", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Sie chönd s i de Apothek abhole.", bridge: "Sie können es in der Apotheke abholen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Wänn s nöd besser wird, chömed Sie wider.", bridge: "Wenn es nicht besser wird, kommen Sie wieder.", direction: "hear", source: "idiotikon" },
        { target: "Bruuched Sie es Arztzügnis für d Arbet?", bridge: "Brauchen Sie ein Arztzeugnis für die Arbeit?", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Ja, für drüü Täg, bitte.", bridge: "Ja, für drei Tage, bitte.", direction: "say", source: "idiotikon" },
        { target: "Chönd Sie das bitte langsamer säge?", bridge: "Können Sie das bitte langsamer sagen?", direction: "say", source: "idiotikon" },
        { target: "Mues ich wider cho?", bridge: "Muss ich wieder kommen?", direction: "say", source: "idiotikon" },
        { target: "Guet Besserig!", bridge: "Gute Besserung!", direction: "hear", source: "idiotikon" },
      ],
    },

    {
      /**
       * The Gemeinde — in the city, the Kreisbüro — where everybody who moves
       * here registers, usually in the first fortnight and usually before they
       * can follow a sentence. The questions are the same every time and the
       * person behind the glass asks them a hundred times a day, at that speed.
       *
       * Nothing here is advice about what to bring or what a form requires;
       * those rules belong to the office and they change. These are the lines
       * the office says them in.
       */
      id: "municipality",
      phrases: [
        { target: "Nämed Sie bitte e Nummere.", bridge: "Nehmen Sie bitte eine Nummer.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Grüezi, was chan ich für Sie tue?", bridge: "Guten Tag, was kann ich für Sie tun?", direction: "hear", source: "idiotikon" },
        { target: "Ich möcht mich aamälde.", bridge: "Ich möchte mich anmelden.", direction: "say", source: "idiotikon" },
        { target: "Sind Sie nöi zuezoge?", bridge: "Sind Sie neu zugezogen?", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Händ Sie de Mietvertrag debii?", bridge: "Haben Sie den Mietvertrag dabei?", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mir bruuched no en Pass oder e ID.", bridge: "Wir brauchen noch einen Pass oder eine ID.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Ich ha de Mietvertrag leider nöd debii.", bridge: "Ich habe den Mietvertrag leider nicht dabei.", direction: "say", source: "idiotikon" },
        { target: "Das chönd Sie au no naaschicke.", bridge: "Das können Sie auch noch nachschicken.", direction: "hear", source: "idiotikon" },
        { target: "Sind Sie verhüratet?", bridge: "Sind Sie verheiratet?", direction: "hear", source: "idiotikon" },
        { target: "Weli Konfession händ Sie?", bridge: "Welche Konfession haben Sie?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Kei, ich bi nöd i de Chile.", bridge: "Keine, ich bin nicht in der Kirche.", direction: "say", source: "idiotikon" },
        { target: "Wie lang wohned Sie scho i de Schwiiz?", bridge: "Wie lange wohnen Sie schon in der Schweiz?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Fülled Sie bitte das Formular uus.", bridge: "Füllen Sie bitte dieses Formular aus.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Unde rächts underschriibe, bitte.", bridge: "Unten rechts unterschreiben, bitte.", direction: "hear", source: "idiotikon" },
        { target: "D Gebüür chönd Sie mit Charte zale.", bridge: "Die Gebühr können Sie mit Karte bezahlen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "De Uuswiis chunt mit de Poscht.", bridge: "Der Ausweis kommt mit der Post.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Das duuret öppe zwei bis drüü Wuche.", bridge: "Das dauert etwa zwei bis drei Wochen.", direction: "hear", source: "idiotikon" },
        { target: "Für das müend Sie a de Schalter drüü.", bridge: "Dafür müssen Sie an Schalter drei.", direction: "hear", source: "idiotikon" },
        { target: "Das chönd Sie au online mache.", bridge: "Das können Sie auch online erledigen.", direction: "hear", source: "idiotikon" },
        { target: "Chönd Sie mir säge, was ich no bruuche?", bridge: "Können Sie mir sagen, was ich noch brauche?", direction: "say", source: "idiotikon" },
        { target: "Merci für d Hilf.", bridge: "Danke für die Hilfe.", direction: "say", source: "idiotikon" },
        { target: "Schöne Tag no.", bridge: "Noch einen schönen Tag.", direction: "hear", source: "idiotikon" },
      ],
    },

    {
      /**
       * The laundry room, which `neighbours` names and this scene opens.
       *
       * A shared Waschchuchi runs on a plan pinned to the wall, and the plan is
       * a law nobody explains. What goes wrong is rarely said to your face: it
       * arrives as a note, or as a neighbour being very polite in the doorway.
       * Most of these lines are heard, because most of what happens here is
       * being told.
       */
      id: "laundry-room",
      phrases: [
        { target: "Hüt isch min Wäschtag.", bridge: "Heute ist mein Waschtag.", direction: "hear", source: "idiotikon" },
        { target: "Im Plan staht, wer wänn dra isch.", bridge: "Im Plan steht, wer wann an der Reihe ist.", direction: "hear", source: "idiotikon" },
        { target: "Ab zwei bi ich dra.", bridge: "Ab zwei bin ich an der Reihe.", direction: "hear", source: "idiotikon" },
        { target: "Mir sind no am wäsche bis am vieri.", bridge: "Wir waschen noch bis vier.", direction: "hear", grammar: "am-progressive", source: "idiotikon" },
        { target: "Exgüsi, isch die Maschine frei?", bridge: "Entschuldigung, ist diese Maschine frei?", direction: "say", source: "idiotikon" },
        { target: "Das isch no mini Maschine, gäll.", bridge: "Das ist noch meine Maschine, nicht wahr.", direction: "hear", grammar: "modal-particles", source: "idiotikon" },
        { target: "Sie händ de Tumbler nöd gleert.", bridge: "Sie haben den Tumbler nicht geleert.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "S Flusesieb mues mer jedes Mal putze.", bridge: "Das Flusensieb muss man jedes Mal reinigen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "D Wösch hanget no im Trochneruum.", bridge: "Die Wäsche hängt noch im Trocknungsraum.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mir händ Ihri Wösch usegnoh.", bridge: "Wir haben Ihre Wäsche herausgenommen.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "Sie sind geschter über d Ziit gsi.", bridge: "Sie haben gestern die Zeit überzogen.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Am Sunntig wird nöd gwäsche.", bridge: "Am Sonntag wird nicht gewaschen.", direction: "hear", source: "idiotikon" },
        { target: "Bitte d Waschchuchi suuber hinderlah.", bridge: "Bitte die Waschküche sauber hinterlassen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Es hät en Zädel a de Tür.", bridge: "Es hängt ein Zettel an der Tür.", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Chönd Sie de Schlüssel wider abgää?", bridge: "Können Sie den Schlüssel wieder abgeben?", direction: "hear", source: "idiotikon" },
        { target: "De Hauswart hät de Plan nöi gmacht.", bridge: "Der Hauswart hat den Plan neu gemacht.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Wänn isch min Tag?", bridge: "Wann ist mein Tag?", direction: "say", grammar: "question-words", source: "idiotikon" },
        { target: "Chönd mer tuusche?", bridge: "Können wir tauschen?", direction: "hear", source: "idiotikon" },
        { target: "Chan ich am Samschtig tuusche?", bridge: "Kann ich am Samstag tauschen?", direction: "say", source: "idiotikon" },
        { target: "Sorry, das han ich nöd gwüsst.", bridge: "Entschuldigung, das wusste ich nicht.", direction: "say", grammar: "no-preterite", source: "idiotikon" },
        { target: "Kei Problem, das cha passiere.", bridge: "Kein Problem, das kann passieren.", direction: "hear", source: "idiotikon" },
        { target: "Ich nimm mini Wösch grad use.", bridge: "Ich nehme meine Wäsche gleich heraus.", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * The apéro — after work, after a meeting, in a courtyard once a year —
       * which is where a Zurich acquaintance actually starts. A glass in the
       * hand, nobody obliged to stay, and everybody in dialect, because nothing
       * here is official enough for Standard German.
       *
       * One line is here for what it does NOT mean. «Mer sött emal öppis zäme
       * mache» is warm and sincere and is not an invitation; the learner who
       * takes out a diary has misread the room. `indirect-no` is the whole
       * scene about that habit.
       */
      id: "apero",
      phrases: [
        { target: "Schön, dass Sie cho sind.", bridge: "Schön, dass Sie gekommen sind.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Nämed Sie sich es Glas.", bridge: "Nehmen Sie sich ein Glas.", direction: "hear", grammar: "imperative", source: "idiotikon" },
        { target: "Wiiss oder rot?", bridge: "Weiss oder rot?", direction: "hear", source: "idiotikon" },
        { target: "Für mich lieber öppis ohni Alkohol.", bridge: "Für mich lieber etwas ohne Alkohol.", direction: "say", source: "idiotikon" },
        { target: "Proscht zäme!", bridge: "Prost zusammen!", direction: "hear", source: "idiotikon" },
        { target: "Mir händ üs no nöd kännegleert.", bridge: "Wir haben uns noch nicht kennengelernt.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Ich bi de Reto.", bridge: "Ich bin Reto.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Mich au, freut mi.", bridge: "Mich auch, freut mich.", direction: "say", source: "idiotikon" },
        { target: "Duzed mer üs?", bridge: "Duzen wir uns?", direction: "hear", source: "idiotikon" },
        { target: "Ich bi d Nachbarin vom zweite Stock.", bridge: "Ich bin die Nachbarin aus dem zweiten Stock.", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Ah, Sie sind die mit em Velo.", bridge: "Ah, Sie sind die mit dem Velo.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Was mached Sie beruflich?", bridge: "Was machen Sie beruflich?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Wie gfallt s Ihne z Züri?", bridge: "Wie gefällt es Ihnen in Zürich?", direction: "hear", grammar: "question-words", source: "idiotikon" },
        { target: "Sehr guet, nur d Sprooch isch no schwirig.", bridge: "Sehr gut, nur die Sprache ist noch schwierig.", direction: "say", source: "idiotikon" },
        { target: "Das chunt scho, gäll.", bridge: "Das kommt schon, nicht wahr.", direction: "hear", grammar: "modal-particles", source: "idiotikon" },
        { target: "Probiered Sie emal die Chüechli.", bridge: "Probieren Sie einmal diese Küchlein.", direction: "hear", grammar: "diminutive-li", source: "idiotikon" },
        { target: "Die sind sälber gmacht.", bridge: "Die sind selbst gemacht.", direction: "hear", source: "idiotikon" },
        { target: "Chunnsch nöchscht Wuche au as Quartierfescht?", bridge: "Kommst du nächste Woche auch ans Quartierfest?", direction: "hear", source: "idiotikon" },
        { target: "Mer sött emal öppis zäme mache.", bridge: "Man sollte einmal etwas zusammen machen.", direction: "hear", source: "idiotikon" },
        { target: "Gern, das wär schön.", bridge: "Gerne, das wäre schön.", direction: "say", source: "idiotikon" },
        { target: "Ich mues langsam gah.", bridge: "Ich muss langsam gehen.", direction: "say", source: "idiotikon" },
        { target: "Chumm guet hei!", bridge: "Komm gut nach Hause!", direction: "hear", grammar: "imperative", source: "idiotikon" },
      ],
    },

    {
      /**
       * When no does not sound like no.
       *
       * Every line here is grammatically transparent and still misread, which
       * is why this is a scene rather than a vocabulary entry: «Das isch ächli
       * schwierig» has no hard word in it. What a learner lacks is the
       * convention that a Zurich refusal is usually delivered as a difficulty,
       * a postponement or an intention to think — and the German reader, who
       * takes each at its word, waits for an answer that was already given.
       *
       * The bridges translate the words, not the meaning, on purpose. A gloss
       * reading "no" would teach the convention as a rule, and it is not one:
       * sometimes «mer luegt» really does mean the speaker will look. The
       * scene's own page says what the lines usually carry; the lines say what
       * was said.
       */
      id: "indirect-no",
      phrases: [
        { target: "Mer chönnt sich das überlegge.", bridge: "Man könnte sich das überlegen.", direction: "hear", source: "idiotikon" },
        { target: "Das isch ächli schwierig.", bridge: "Das ist etwas schwierig.", direction: "hear", source: "idiotikon" },
        { target: "Das müesst mer no aaluege.", bridge: "Das müsste man noch anschauen.", direction: "hear", source: "idiotikon" },
        { target: "Ich weiss nöd, öb das gaht.", bridge: "Ich weiss nicht, ob das geht.", direction: "hear", source: "idiotikon" },
        { target: "Das isch nöd ganz eifach.", bridge: "Das ist nicht ganz einfach.", direction: "hear", source: "idiotikon" },
        { target: "Das chunt drufaa.", bridge: "Das kommt darauf an.", direction: "hear", source: "idiotikon" },
        { target: "Mer luegt dänn.", bridge: "Man schaut dann.", direction: "hear", source: "idiotikon" },
        { target: "Ja, ja, mal luege.", bridge: "Ja, ja, mal schauen.", direction: "hear", source: "idiotikon" },
        { target: "Das isch sicher e gueti Idee, aber …", bridge: "Das ist sicher eine gute Idee, aber …", direction: "hear", grammar: "indefinite-article", source: "idiotikon" },
        { target: "Ich mues das no mit em Team bespräche.", bridge: "Ich muss das noch mit dem Team besprechen.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Das isch im Momänt grad nöd so günschtig.", bridge: "Das ist im Moment gerade nicht so günstig.", direction: "hear", source: "idiotikon" },
        { target: "Mir händ das früener au scho probiert.", bridge: "Wir haben das früher auch schon versucht.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Das wär dänn scho no ächli vill.", bridge: "Das wäre dann schon noch ein bisschen viel.", direction: "hear", source: "idiotikon" },
        { target: "Ich wett nöd unhöflich sii, aber …", bridge: "Ich möchte nicht unhöflich sein, aber …", direction: "hear", source: "idiotikon" },
        { target: "Villicht es anders Mal.", bridge: "Vielleicht ein andermal.", direction: "hear", source: "idiotikon" },
        { target: "Heisst das eher Nei?", bridge: "Heisst das eher Nein?", direction: "say", source: "idiotikon" },
        { target: "Ich verstah. Wänn chönnt s dänn gah?", bridge: "Ich verstehe. Wann könnte es dann gehen?", direction: "say", grammar: "question-words", source: "idiotikon" },
        { target: "Das wär mir leider ächli z vill.", bridge: "Das wäre mir leider etwas zu viel.", direction: "say", source: "idiotikon" },
        { target: "Ich überlegg mer s no.", bridge: "Ich überlege es mir noch.", direction: "say", source: "idiotikon" },
        { target: "Merci, aber ich lah s lieber.", bridge: "Danke, aber ich lasse es lieber.", direction: "say", source: "idiotikon" },
        { target: "Kei Stress, es pressiert nöd.", bridge: "Kein Stress, es eilt nicht.", direction: "hear", source: "idiotikon" },
        { target: "Mer chönd s ja emal probiere.", bridge: "Wir können es ja einmal versuchen.", direction: "hear", source: "idiotikon" },
      ],
    },
  ],
};
