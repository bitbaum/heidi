import type { ExampleRef, LineRef, TransformTemplate, Written } from "../template.ts";

/**
 * "Which sentence says exactly this?" — German shown, four Zurich sentences
 * offered, one of which means it.
 *
 * THE GRAMMAR QUESTION A GERMAN READER ACTUALLY NEEDS. Not "conjugate this",
 * which a reader of German never has to do in order to understand, but "hear
 * the difference": `Mir warted` against `Si warted`, `wo mich gsee hät`
 * against `wo ich gsee ha`, `go` against `cho`. Each wrong option is correct
 * Zurich German that says something else — so nothing here asks anybody to
 * spot an invented error, and nothing wrong is ever printed as Zurich German.
 *
 * WHAT MAKES IT MARKABLE: every option carries its own German, and the
 * validator refuses a record where a wrong option's German equals the right
 * one's. Four sentences, four different meanings, one of them the prompt.
 */

const L = (scene: string, line: number): LineRef => ({ scene, line });
const X = (topic: string, example: number): ExampleRef => ({ topic, example });
const W = (target: string, bridge: string): Written => ({ target, bridge, cite: "idiotikon" });

export const TRANSFORM: readonly TransformTemplate[] = [
  {
    id: "went-home",
    about: { topic: "no-preterite" },
    right: X("no-preterite", 0),
    wrong: [
      W("Ich gang hüt hei.", "Ich gehe heute nach Hause."),
      W("Mir sind geschter hei gange.", "Wir gingen gestern nach Hause."),
      W("Ich bi geschter nöd hei gange.", "Ich ging gestern nicht nach Hause."),
    ],
    lesson: "past",
    listen: { word: "bi … gange", means: "ging (bin gegangen)" },
  },
  {
    id: "said-nothing",
    about: { topic: "no-preterite" },
    right: X("no-preterite", 1),
    wrong: [
      W("Si seit nüüt.", "Sie sagt nichts."),
      W("Er hät nüüt gseit.", "Er sagte nichts."),
      W("Si hät öppis gseit.", "Sie sagte etwas."),
    ],
    lesson: "past",
    listen: { word: "hät … gseit", means: "sagte (hat gesagt)" },
  },
  {
    id: "mountains",
    about: { topic: "no-preterite" },
    right: L("small-talk", 1),
    wrong: [
      W("Ganz guet, mir gönd i d Bärge.", "Ganz gut, wir gehen in die Berge."),
      W("Ganz guet, ich bi i de Bärge gsi.", "Ganz gut, ich war in den Bergen."),
      W("Ganz guet, mir sind i de Stadt gsi.", "Ganz gut, wir waren in der Stadt."),
    ],
    lesson: "past",
    listen: { word: "sind … gsi", means: "waren" },
  },
  {
    id: "waiting-ten",
    about: { topic: "unified-plural" },
    right: L("tram", 4),
    wrong: [
      W("Ich warte scho zäh Minute.", "Ich warte schon zehn Minuten."),
      W("Si warted scho zäh Minute.", "Sie warten schon zehn Minuten."),
      W("Mir warted scho zwei Minute.", "Wir warten schon zwei Minuten."),
    ],
    lesson: "person",
    listen: { word: "Mir warted", means: "Wir warten" },
  },
  {
    id: "children-forest",
    about: { topic: "unified-plural" },
    right: L("school-parents", 10),
    wrong: [
      W("S Chind gaht hüt in Wald.", "Das Kind geht heute in den Wald."),
      W("D Chind sind hüt im Wald gsi.", "Die Kinder waren heute im Wald."),
      W("D Chind gönd morn in Wald.", "Die Kinder gehen morgen in den Wald."),
    ],
    lesson: "person",
    listen: { word: "D Chind gönd", means: "Die Kinder gehen" },
  },
  {
    id: "coming-tonight",
    about: { topic: "unified-plural" },
    right: X("unified-plural", 1),
    wrong: [
      W("Chunnsch du hüt no?", "Kommst du heute noch?"),
      W("Chömed Sie hüt no?", "Kommen Sie heute noch?"),
      W("Chömed er morn?", "Kommt ihr morgen?"),
    ],
    lesson: "person",
    listen: { word: "Chömed er", means: "Kommt ihr" },
  },
  {
    id: "man-standing",
    about: { topic: "wo-relative" },
    right: X("wo-relative", 0),
    wrong: [
      W("De Maa, wo dört gstande isch.", "Der Mann, der dort stand."),
      W("D Frau, wo dört staht.", "Die Frau, die dort steht."),
      W("De Maa staht dört.", "Der Mann steht dort."),
    ],
    lesson: "whose",
    listen: { word: "wo", means: "der, die, das (Relativpronomen)" },
  },
  {
    id: "woman-seen",
    about: { topic: "wo-relative" },
    right: X("wo-relative", 1),
    wrong: [
      W("D Frau, wo mich gsee hät.", "Die Frau, die mich gesehen hat."),
      W("De Maa, wo ich gsee ha.", "Der Mann, den ich gesehen habe."),
      W("D Frau hät mich gsee.", "Die Frau hat mich gesehen."),
    ],
    lesson: "whose",
    listen: { word: "wo ich gsee ha", means: "die ich gesehen habe" },
  },
  {
    id: "doctor-on-phone",
    about: { topic: "am-progressive" },
    right: L("appointment", 2),
    wrong: [
      W("De Dokter hät grad telefoniert.", "Der Arzt hat gerade telefoniert."),
      W("De Dokter isch grad am schriibe.", "Der Arzt schreibt gerade."),
      W("De Dokter chunt spööter.", "Der Arzt kommt später."),
    ],
    lesson: "verb-frame",
    listen: { word: "isch … am telefoniere", means: "telefoniert gerade" },
  },
  {
    id: "still-planning",
    about: { topic: "am-progressive" },
    right: L("at-work", 12),
    wrong: [
      W("Mir händ scho plant.", "Wir haben schon geplant."),
      W("Ich bi no am plane.", "Ich plane noch."),
      W("Mir sind no am schaffe.", "Wir arbeiten noch."),
    ],
    lesson: "verb-frame",
    listen: { word: "sind no am plane", means: "planen noch" },
  },
  {
    id: "working-now",
    about: { topic: "am-progressive" },
    right: X("am-progressive", 0),
    wrong: [
      W("Ich ha gschaffet.", "Ich habe gearbeitet."),
      W("Er isch am schaffe.", "Er arbeitet gerade."),
      W("Ich gang go schaffe.", "Ich gehe arbeiten."),
    ],
    lesson: "verb-frame",
    listen: { word: "bi am schaffe", means: "arbeite gerade" },
  },
  {
    id: "going-shopping",
    about: { topic: "go-cho-infinitive" },
    right: L("shopping", 7),
    wrong: [
      W("Ich bi schnäll go poschte.", "Ich war schnell einkaufen."),
      W("Mir gönd schnäll go poschte.", "Wir gehen schnell einkaufen."),
      W("Ich gang schnäll hei.", "Ich gehe schnell nach Hause."),
    ],
    lesson: "verb-frame",
    listen: { word: "gang … go poschte", means: "gehe einkaufen" },
  },
  {
    id: "come-eat",
    about: { topic: "go-cho-infinitive" },
    right: L("meals", 9),
    wrong: [
      W("Gönd Sie go ässe.", "Gehen Sie essen."),
      W("Händ Sie scho gesse?", "Haben Sie schon gegessen?"),
      W("Chömed Sie cho hälfe.", "Kommen Sie helfen."),
    ],
    lesson: "verb-frame",
    listen: { word: "Chömed … cho", means: "Kommen … (her)" },
  },
  {
    id: "come-help",
    about: { topic: "go-cho-infinitive" },
    right: X("go-cho-infinitive", 1),
    wrong: [
      W("Gaasch go hälfe?", "Gehst du helfen?"),
      W("Chunnsch morn cho hälfe?", "Kommst du morgen helfen?"),
      W("Chunnsch cho ässe?", "Kommst du essen?"),
    ],
    lesson: "verb-frame",
    listen: { word: "Chunnsch cho", means: "Kommst du … (her)" },
  },
  {
    id: "child-cried",
    about: { topic: "articles" },
    right: L("school-parents", 3),
    wrong: [
      W("D Chind händ hüt ächli gweint.", "Die Kinder haben heute ein bisschen geweint."),
      W("S Chind hät hüt vill gweint.", "Das Kind hat heute viel geweint."),
      W("S Chind hät hüt ächli glachet.", "Das Kind hat heute ein bisschen gelacht."),
    ],
    lesson: "person",
    listen: { word: "S Chind hät", means: "Das Kind hat" },
  },
  {
    id: "meiers-room",
    about: { topic: "possessive-dative" },
    right: L("visitors", 2),
    wrong: [
      W("De Frau Meier ihres Zimmer isch dört äne.", "Frau Meiers Zimmer ist dort drüben."),
      W("Em Herr Meier sis Zimmer isch da vorne.", "Herrn Meiers Zimmer ist hier vorne."),
      W("De Herr Meier isch i sim Zimmer.", "Herr Meier ist in seinem Zimmer."),
    ],
    lesson: "whose",
    listen: { word: "Em Herr Meier sis", means: "Herrn Meiers" },
  },
  {
    id: "annas-sister",
    about: { topic: "possessive-dative" },
    right: L("visitors", 7),
    wrong: [
      W("Em Reto sini Schwöschter chunt au no.", "Retos Schwester kommt auch noch."),
      W("D Anna chunt au no.", "Anna kommt auch noch."),
      W("De Anna ihri Schwöschter chunt nöd.", "Annas Schwester kommt nicht."),
    ],
    lesson: "whose",
    listen: { word: "De Anna ihri", means: "Annas" },
  },
  {
    id: "stay-on-line",
    about: { topic: "imperative" },
    right: L("appointment", 16),
    wrong: [
      W("Blib churz dra.", "Bleib kurz dran."),
      W("Ich blibe churz dra.", "Ich bleibe kurz dran."),
      W("Lüüted Sie spööter aa.", "Rufen Sie später an."),
    ],
    lesson: "person",
    listen: { word: "Blibed Sie", means: "Bleiben Sie" },
  },
  {
    id: "breathe-in",
    about: { topic: "imperative" },
    right: L("doctor", 11),
    wrong: [
      W("Atme tüüf ii.", "Atme tief ein."),
      W("Atmed Sie tüüf uus.", "Atmen Sie tief aus."),
      W("Ich atme tüüf ii.", "Ich atme tief ein."),
    ],
    lesson: "person",
    listen: { word: "Atmed Sie", means: "Atmen Sie" },
  },
  {
    id: "spoonfuls",
    about: { topic: "diminutive-li" },
    right: L("meals", 14),
    wrong: [
      W("Nur en Löffel?", "Nur einen Löffel?"),
      W("Nur es paar Stückli?", "Nur ein paar Stückchen?"),
      W("Nur ächli Brot?", "Nur ein bisschen Brot?"),
    ],
    lesson: "small-word",
    listen: { word: "Löffeli", means: "Löffelchen" },
  },
  {
    id: "where-change",
    about: { topic: "question-words" },
    right: L("tram", 19),
    wrong: [
      W("Wänn mues ich umstiege?", "Wann muss ich umsteigen?"),
      W("Mues ich umstiege?", "Muss ich umsteigen?"),
      W("Wo mues ich usstiege?", "Wo muss ich aussteigen?"),
    ],
    lesson: "question-word",
    listen: { word: "Wo", means: "Wo" },
  },
  {
    id: "when-rubbish",
    about: { topic: "question-words" },
    right: X("question-words", 0),
    wrong: [
      W("Wer holt de Güsel?", "Wer holt den Abfall?"),
      W("Wänn isch d Abfuhr gsi?", "Wann war die Abfuhr?"),
      W("Chunt d Abfuhr hüt?", "Kommt die Abfuhr heute?"),
    ],
    lesson: "question-word",
    listen: { word: "Wänn", means: "Wann" },
  },
  {
    id: "another-coffee",
    about: { topic: "indefinite-article" },
    right: L("restaurant", 4),
    wrong: [
      L("restaurant", 14),
      W("Händ Sie no Kafi?", "Haben Sie noch Kaffee?"),
      W("Wänd Sie kei Kafi?", "Möchten Sie keinen Kaffee?"),
    ],
    lesson: "offer",
    listen: { word: "en Kafi", means: "einen Kaffee" },
  },
  {
    id: "not-any-more",
    about: { word: "nüme" },
    right: L("at-work", 19),
    wrong: [
      W("Das schaff ich hüt nöd.", "Das schaffe ich heute nicht."),
      W("Das schaff ich hüt no.", "Das schaffe ich heute noch."),
      W("Das schaff ich morn.", "Das schaffe ich morgen."),
    ],
    lesson: "small-word",
    listen: { word: "nüme", means: "nicht mehr" },
  },
  {
    id: "still-open",
    about: { word: "nüme" },
    right: L("shopping", 4),
    wrong: [
      W("Mir händ das grad no.", "Wir haben das gerade noch."),
      W("Mir händ das nie ghaa.", "Wir hatten das nie."),
      W("Ich ha das grad nüme.", "Ich habe das gerade nicht mehr."),
    ],
    lesson: "small-word",
    listen: { word: "nüme", means: "nicht mehr" },
  },
];
