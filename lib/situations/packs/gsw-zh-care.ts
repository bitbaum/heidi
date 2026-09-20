import type { SituationPack } from "../pack.ts";

/**
 * Care and nursing homes, in Zurich German.
 *
 * WHY THIS DOMAIN FIRST, out of the six on `/organisations`.
 *
 * Because it is the one where the gap is not an inconvenience. A resident with
 * dementia loses her second languages first, and what is left is the Zurich
 * German of her childhood; the carer on the late shift arrived two years ago
 * and learned Standard German, which is the variety nobody on that corridor is
 * speaking. Somebody who is not understood is not merely uncomfortable — they
 * are misread. Pain becomes agitation. A request becomes resistance.
 *
 * That is also why the page carrying these lines had to come before the page
 * selling them: `sectors.ts` already told a Heimleitung that Heidi "practises
 * the sentences that are actually said on your ward", and until this file
 * existed there were forty-eight words in the product and not one of them was
 * said on a ward. A claim with nothing behind it is the §8 failure, and it was
 * ours.
 *
 * WHAT IS IN HERE AND WHAT IS NOT.
 *
 * These are ordinary shift sentences, written for this product in the house
 * spelling, using the vocabulary and the structures the variety pack already
 * teaches. They are not transcribed from a ward, not lifted from a phrasebook,
 * and not a corpus. Every one of them passes the deterministic gate — the
 * contract test runs `check()` over all of them, so a Bernese vowel or an
 * Ostschweiz negation fails the build rather than reaching somebody who could
 * not detect it.
 *
 * What they have NOT had is a native speaker's eye, and `provenance` says so
 * in the data rather than in a comment, so the page says it too. Every line
 * here is defensible; "defensible" is not the same word as "checked", and the
 * one population that cannot tell the difference is the one this file is for.
 *
 * WHAT IS DELIBERATELY ABSENT. No clinical vocabulary, no medication names, no
 * symptom lists, no anything that would read as instruction about care. Heidi
 * teaches a language. The professional judgement in this room belongs to the
 * person holding it, and a language product that starts annotating what a
 * symptom means has quietly become a medical device with none of the duties.
 */
export const CARE: SituationPack = {
  id: "care",
  variety: "gsw-u-sd-chzh",

  /**
   * Not yet read by a speaker of this variety, and the page prints that.
   *
   * The honest sequence is: write it, gate it, ship it saying what it is, and
   * flip this the day a named person has read every line. Shipping it silent
   * would be the cheaper order and it would make the product's central promise
   * — that you can trust the variety because you cannot check it yourself —
   * into something we say rather than something we do.
   */
  provenance: { nativeReviewed: false },

  situations: [
    {
      /**
       * The handover, which is the only one of these a learner can prepare for
       * and the one that decides the whole shift. It is also the fastest
       * speech on the ward: colleague to colleague, nothing slowed down for
       * anybody, and no resident present whose presence would make somebody
       * switch to Standard German. §2's trap, in its purest form.
       */
      id: "handover",
      phrases: [
        { target: "Si hät d Nacht guet gschlaafe.", bridge: "Sie hat die Nacht gut geschlafen.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Er isch am Morge scho wach gsi.", bridge: "Er war am Morgen schon wach.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Mir händ em Herr Meier s Zmorge scho brocht.", bridge: "Wir haben Herrn Meier das Frühstück schon gebracht.", direction: "hear", grammar: "unified-plural", source: "idiotikon" },
        { target: "D Frau Keller hät geschter fascht nüüt gesse.", bridge: "Frau Keller hat gestern fast nichts gegessen.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Si isch am warte uf d Tochter.", bridge: "Sie wartet auf die Tochter.", direction: "hear", grammar: "am-progressive", source: "idiotikon" },
        { target: "De Dokter chunt am zäh.", bridge: "Der Arzt kommt um zehn.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Chasch du hüt Namittag bi ere verbiiluege?", bridge: "Kannst du heute Nachmittag bei ihr vorbeischauen?", direction: "hear", source: "idiotikon" },
        // `geschter`, not `gschtern`: the pack's own grammar examples spell it
        // that way («Ich bi geschter hei gange»), and the orthography note
        // promises a learner meets the same word the same way twice. There is
        // no standard to be wrong against here, which is exactly why the house
        // spelling has to be kept by hand.
        { target: "S Zimmer, wo mir geschter gruumt händ, isch parat.", bridge: "Das Zimmer, das wir gestern geräumt haben, ist bereit.", direction: "hear", grammar: "wo-relative", source: "idiotikon" },
        { target: "Häsch das scho ufgschriebe?", bridge: "Hast du das schon aufgeschrieben?", direction: "hear", source: "idiotikon" },
        { target: "Ich gang go luege.", bridge: "Ich gehe nachschauen.", direction: "say", grammar: "go-cho-infinitive", source: "idiotikon" },
      ],
    },

    {
      /**
       * The morning. Short sentences said while both hands are busy, which is
       * why so many of them are `say`: this is the scene where replying in
       * Standard German is not the neutral option §1 describes, because the
       * person being washed is frightened and a switch of language reads as a
       * switch of person.
       */
      id: "morning-care",
      phrases: [
        { target: "Guete Morge, sind Sie scho wach?", bridge: "Guten Morgen, sind Sie schon wach?", direction: "say", source: "idiotikon" },
        { target: "Chömed Sie, ich hilf Ihne uf.", bridge: "Kommen Sie, ich helfe Ihnen auf.", direction: "say", source: "idiotikon" },
        { target: "Wänd Sie hüt dusche oder lieber nume wäsche?", bridge: "Möchten Sie heute duschen oder lieber nur waschen?", direction: "say", source: "idiotikon" },
        { target: "Langsam, mir händ Ziit.", bridge: "Langsam, wir haben Zeit.", direction: "say", grammar: "unified-plural", source: "idiotikon" },
        { target: "Ich bi grad am Bett mache.", bridge: "Ich mache gerade das Bett.", direction: "say", grammar: "am-progressive", source: "idiotikon" },
        { target: "Tuet das weh?", bridge: "Tut das weh?", direction: "say", source: "idiotikon" },
        { target: "Ich mag hüt nöd ufstah.", bridge: "Ich mag heute nicht aufstehen.", direction: "hear", source: "idiotikon" },
        { target: "S Wasser isch z chalt.", bridge: "Das Wasser ist zu kalt.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Wo isch mis Chleidli?", bridge: "Wo ist mein Kleidchen?", direction: "hear", grammar: "diminutive-li", source: "idiotikon" },
        { target: "Ich chume grad zrugg.", bridge: "Ich komme gleich zurück.", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * Pain, which is the situation with the highest cost of being
       * misunderstood and the one where dialect is least avoidable: pain does
       * not speak a second language, and somebody reporting it is not
       * composing.
       *
       * Note what these lines do NOT do. None of them names a body part in
       * order to teach anatomy, and none suggests what any of it means. They
       * are the sentences in which the subject arrives.
       */
      id: "pain",
      phrases: [
        { target: "Wo tuet s weh?", bridge: "Wo tut es weh?", direction: "say", source: "idiotikon" },
        { target: "Mir tuet de Chopf weh.", bridge: "Mir tut der Kopf weh.", direction: "hear", grammar: "articles", source: "idiotikon" },
        { target: "Es zieht mer im Rugge.", bridge: "Es zieht mir im Rücken.", direction: "hear", source: "idiotikon" },
        { target: "Ich mag nüme.", bridge: "Ich kann nicht mehr.", direction: "hear", source: "idiotikon" },
        { target: "Isch Ihne schwindlig?", bridge: "Ist Ihnen schwindlig?", direction: "say", source: "idiotikon" },
        { target: "Sit wenn isch das so?", bridge: "Seit wann ist das so?", direction: "say", source: "idiotikon" },
        { target: "Sit geschter Aabig scho.", bridge: "Seit gestern Abend schon.", direction: "hear", source: "idiotikon" },
        { target: "Ich hol Ihne öppis degege.", bridge: "Ich hole Ihnen etwas dagegen.", direction: "say", source: "idiotikon" },
        { target: "Jetz isch es nüme so schlimm.", bridge: "Jetzt ist es nicht mehr so schlimm.", direction: "hear", source: "idiotikon" },
        { target: "Ich säge em Dokter Bscheid.", bridge: "Ich sage dem Arzt Bescheid.", direction: "say", source: "idiotikon" },
      ],
    },

    {
      /**
       * Meals — the scene a learner meets most often and prepares for least,
       * because it sounds like the easy one. It is where the pack's own
       * everyday nouns finally do some work: `Zmorge`, `Zvieri`, `Rüebli` and
       * `Poulet` are on the vocabulary page as words, and this is the sentence
       * they arrive in.
       */
      id: "meals",
      phrases: [
        { target: "Händ Sie Hunger?", bridge: "Haben Sie Hunger?", direction: "say", source: "idiotikon" },
        { target: "Hüt git s Poulet mit Rüebli.", bridge: "Heute gibt es Hähnchen mit Karotten.", direction: "say", source: "idiotikon" },
        { target: "S Zmorge chunt grad.", bridge: "Das Frühstück kommt gleich.", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Ich mag hüt nüüt.", bridge: "Ich möchte heute nichts.", direction: "hear", source: "idiotikon" },
        { target: "Nur ächli, bitte.", bridge: "Nur ein bisschen, bitte.", direction: "hear", source: "idiotikon" },
        { target: "Wänd Sie no es Glas Wasser?", bridge: "Möchten Sie noch ein Glas Wasser?", direction: "say", source: "idiotikon" },
        { target: "Hät s gschmöckt?", bridge: "Hat es geschmeckt?", direction: "say", grammar: "no-preterite", source: "idiotikon" },
        { target: "Z Mittag han i scho gesse.", bridge: "Zu Mittag habe ich schon gegessen.", direction: "hear", grammar: "no-preterite", source: "idiotikon" },
        { target: "Am Zvieri git s es Güetzi.", bridge: "Zum Nachmittagssnack gibt es einen Keks.", direction: "say", grammar: "diminutive-li", source: "idiotikon" },
        { target: "Chömed Sie cho ässe.", bridge: "Kommen Sie essen.", direction: "say", grammar: "go-cho-infinitive", source: "idiotikon" },
      ],
    },

    {
      /**
       * The evening, and the hardest one to be new for. These are the lines a
       * carer hears when somebody is trying to leave for a home that has not
       * existed for forty years — and the reply that works is short, present
       * tense and in the language the person is thinking in. That is the whole
       * argument for this domain existing in a comprehension-first product:
       * here, comprehension alone is not enough, and the pack says so by
       * marking the replies `say`.
       */
      id: "evening-unrest",
      phrases: [
        { target: "Ich wott hei.", bridge: "Ich will nach Hause.", direction: "hear", source: "idiotikon" },
        { target: "Wo isch mini Mueter?", bridge: "Wo ist meine Mutter?", direction: "hear", source: "idiotikon" },
        { target: "Ich mues no öppis mache.", bridge: "Ich muss noch etwas erledigen.", direction: "hear", source: "idiotikon" },
        { target: "Es isch scho spaat.", bridge: "Es ist schon spät.", direction: "say", source: "idiotikon" },
        { target: "Ich bi da.", bridge: "Ich bin da.", direction: "say", source: "idiotikon" },
        { target: "Blibed Sie no ächli da.", bridge: "Bleiben Sie noch ein bisschen da.", direction: "say", source: "idiotikon" },
        { target: "Chömed Sie, mir gönd zäme zrugg is Zimmer.", bridge: "Kommen Sie, wir gehen zusammen zurück ins Zimmer.", direction: "say", grammar: "unified-plural", source: "idiotikon" },
        { target: "Sind Sie öppis am sueche?", bridge: "Suchen Sie etwas?", direction: "say", grammar: "am-progressive", source: "idiotikon" },
        { target: "De Maa, wo dört gsi isch, isch scho hei.", bridge: "Der Mann, der dort war, ist schon zu Hause.", direction: "hear", grammar: "wo-relative", source: "idiotikon" },
        { target: "Mir lueged morn wiiter.", bridge: "Wir schauen morgen weiter.", direction: "say", grammar: "unified-plural", source: "idiotikon" },
      ],
    },

    {
      /**
       * Visitors, which is where the learner is suddenly the institution. A
       * daughter arriving at four on a Sunday is judging the home by whether
       * the person at the door followed her, and she will not switch to
       * Standard German for long — she is not there to accommodate staff.
       */
      id: "visitors",
      phrases: [
        { target: "Grüezi, chömed Sie doch ine.", bridge: "Guten Tag, kommen Sie doch herein.", direction: "say", source: "idiotikon" },
        { target: "Sind Sie d Tochter vom Herr Meier?", bridge: "Sind Sie die Tochter von Herrn Meier?", direction: "say", grammar: "articles", source: "idiotikon" },
        { target: "Em Herr Meier sis Zimmer isch dört äne.", bridge: "Herrn Meiers Zimmer ist dort drüben.", direction: "say", grammar: "possessive-dative", source: "idiotikon" },
        { target: "Si hät hüt en guete Tag.", bridge: "Sie hat heute einen guten Tag.", direction: "say", source: "idiotikon" },
        { target: "Mir händ hüt am Morge mit ere gredt.", bridge: "Wir haben heute Morgen mit ihr gesprochen.", direction: "say", grammar: "unified-plural", source: "idiotikon" },
        { target: "Wie gaht s ere hüt?", bridge: "Wie geht es ihr heute?", direction: "hear", source: "idiotikon" },
        { target: "Sie chönd gern no bliibe.", bridge: "Sie können gerne noch bleiben.", direction: "say", source: "idiotikon" },
        { target: "De Anna ihri Schwöschter chunt au no.", bridge: "Annas Schwester kommt auch noch.", direction: "hear", grammar: "possessive-dative", source: "idiotikon" },
        { target: "Ich chan ere s säge.", bridge: "Ich kann es ihr sagen.", direction: "say", source: "idiotikon" },
        { target: "Merci vilmal, ade.", bridge: "Vielen Dank, auf Wiedersehen.", direction: "hear", source: "idiotikon" },
      ],
    },
  ],
};
