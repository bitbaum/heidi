import type { RoadmapDoc } from "bip-kit";
import type { SectorLocale } from "./sectors.ts";

/**
 * What is coming, what is stuck, and what will never be built.
 *
 * WHY THE SHAPE COMES FROM `bip-kit`. The fleet already owns a content
 * contract for exactly this — "blog, roadmap, changelog on your product site"
 * — with nine adopters, and Heidi was not one of them. The register was read,
 * the package was read, and `RoadmapDoc` is the right shape as it stands: an
 * eyebrow, a lede, buckets of items, each item a title and one line. Writing a
 * tenth version of that in this repo is the thing there is no excuse for.
 *
 * What did NOT get adopted is `bip-kit/react`. Heidi has its own tokens and
 * its own type scale, and a reference renderer would fight both; the package's
 * own README expects that and ships the contract separately for the purpose.
 * Types from `bip-kit`, markup from here.
 *
 * TWO DOCUMENTS, GERMAN AND ENGLISH, not seven. The same call `sectors.ts` and
 * `investors.ts` already made and for the same reason: this is an argument
 * about a project rather than interface copy, and seven machine-checked
 * translations of a commitment would be six liabilities. `RoadmapDoc` is a
 * single-language document by design, so two of them is the contract used as
 * intended rather than bent.
 *
 * THE HARD PART IS NOT THE SHAPE, IT IS THE HONESTY. Heidi is twelve days old
 * — first commit 2026-09-10 — and a roadmap is the single easiest page on
 * which to sound like a company with a plan it does not have. So three rules
 * hold here, and each one is visible in the buckets:
 *
 *   1. NOTHING IS DATED. No quarters, no "Q1", no "coming soon". A date is a
 *      promise, and a promise is the one thing a twelve-day-old project has no
 *      standing to make. The ordering carries the argument instead.
 *   2. A BLOCKED ITEM NAMES ITS BLOCKER, specifically enough that a reader
 *      could unblock it. "The listening lab" is not blocked on effort; it is
 *      blocked on one commercially-cleared dialect voice, and saying so is
 *      what turns a roadmap into a request.
 *   3. THE REFUSALS ARE ON THE SAME PAGE. §8 of HEIDI.md is an overclaim
 *      register, and its standing refusals — streaks, points, levels, a
 *      pronunciation score — belong where somebody deciding whether to trust
 *      this can see them next to the plans. A roadmap that lists only what we
 *      want to build is a wish list; one that lists what we will not build is
 *      a position.
 */
export const ROADMAP: Record<SectorLocale, RoadmapDoc> = {
  de: {
    eyebrow: "Stand 22. September 2026",
    title: "Was als Nächstes kommt",
    lede:
      "Heidi ist zwölf Tage alt. Darum stehen hier keine Quartale und keine Termine — ein Datum wäre ein Versprechen, und dafür ist es zu früh. Was hier steht, ist die Reihenfolge und der Grund dafür. Was blockiert ist, sagt woran.",
    buckets: [
      {
        title: "Als Nächstes",
        summary: "Entschieden, und das Material dafür liegt bereits im Repository.",
        items: [
          {
            title: "Ein Zürcher Lexikon gegen erfundene Fakten",
            line: "Die vier Wächter zwischen Modell und Lernender fangen erfundene REGELN und leere Schleifen ab — aber keinen erfundenen einzelnen Fakt.",
            details: [
              "Nach «Im Kauz» gefragt — eine Zürcher Bar — erklärte das Modell, «Kauz» sei ein Tippfehler für «Huus», und lieferte das Lautgesetz k → h gleich mit. Selbstsicher, plausibel, erfunden.",
              "Die Regel wird heute verworfen, weil das Pack sie nicht kennt. Die falsche Bedeutung steht weiterhin da.",
              "Das ist die nächste linguistische Arbeit und sie braucht eine prüfbare Wortliste, keine zweite Modellrunde.",
            ],
          },
          {
            title: "Kontrastdaten pro Dialektgebiet",
            line: "Die Dialektseiten erzählen; fragen können sie noch nicht.",
            details: [
              "Der Behälter steht seit den Alemannischen Zweigen. Es fehlen Zeilen, die jemand zitieren kann.",
              "Sie zu erfinden ist das Einzige, was dieses Produkt nicht tun darf — §2: Die Lernende kann genau das nicht prüfen.",
            ],
          },
          {
            title: "Eine zweite Mundart",
            line: "Berndeutsch ist die erste auf der Liste, und die Architektur wartet schon darauf.",
            details: [
              "Eine Varietät ist Daten: ein Pack, ein Tag, ein Gate. Kein Modul kennt eine Schweizer Tatsache ausserhalb von lib/variety.",
              "Der Beweis dafür ist, dass das Ukrainisch-Pack im Repository liegt und nichts an ihm Schweizerisch ist.",
              "Zuerst muss Zürich stimmen. Eine zweite halb geprüfte Mundart ist schlechter als eine geprüfte.",
            ],
          },
        ],
      },
      {
        title: "Blockiert — und woran genau",
        summary: "Nicht am Aufwand. An einer einzelnen Sache, die jemand anderes freigeben müsste.",
        items: [
          {
            title: "Das Hörlabor",
            line: "Blockiert an genau einer kommerziell freigegebenen Dialektstimme.",
            details: [
              "Training mit vielen Sprechenden ist die am besten belegte Methode, die uns zur Verfügung steht (Lively 1993; Clopper & Pisoni 2004).",
              "Es lässt sich nicht aus einer hochdeutschen Stimme bauen, die Dialektschreibung vorliest — §7.2 und §8 verbieten beide genau das.",
              "Fast jedes Zürcher Korpus ist CC BY-NC oder hat eine strittige Lizenz. Eine geprüfte Stimme löst das; sonst nichts.",
            ],
            essay: { label: "Was die Technik heute kann", href: "technology" },
          },
          {
            title: "Muttersprachliche Durchsicht der Situationen",
            line: "Hundertvierzig Zeilen, die noch niemand aus Zürich gelesen hat.",
            details: [
              "Jede Zeile hat das deterministische Gate passiert, das ist eine Aussage über Formen und keine über den Ton.",
              "Die Seiten schreiben heute selbst hin, dass niemand sie gegengelesen hat. Das ist die ehrliche Zwischenlösung, nicht die Lösung.",
              "Es geht um Sätze, die jemand um halb sieben morgens zu einer verängstigten Person sagt.",
            ],
            essay: { label: "Die Situationen ansehen", href: "situations" },
          },
        ],
      },
      {
        title: "Absichtlich nicht gebaut",
        summary: "Stehende Entscheidungen aus §8, kein Rückstand. Sie kommen nicht später.",
        items: [
          {
            title: "Serien, Punkte, Level, Prozente, Tagesziel",
            line: "Eine Serie misst, wie viel Heidi jemand konsumiert hat, und sieht dabei aus wie ein Mass für Gelerntes.",
            details: [
              "Das Mass dieses Produkts ist, wie viel von einer unbekannten Zürcher Sprecherin jemand versteht.",
              "Sollte uns das je Nutzerbindung gegen ein Produkt mit einem Flammen-Symbol kosten, verlieren wir diesen Vergleich absichtlich.",
            ],
          },
          {
            title: "Eine Note für die Aussprache",
            line: "Niemand kann das heute ehrlich messen, und eine Zahl zu zeigen wäre eine Behauptung über einen Menschen.",
            details: [
              "Gemessen wird, wie lange gesprochen wurde und wo die Pausen lagen. Das sind Tatsachen über die Aufnahme.",
              "Die Sprechübung endet in einem Raum mit anderen Leuten. Eine Punktzahl ist das, was ein Produkt stattdessen anbietet.",
            ],
          },
          {
            title: "Dialekt-Transkription versprechen",
            line: "Was heute als «Schweizerdeutsch erkennen» verkauft wird, gibt Hochdeutsch zurück.",
            details: [
              "Damit wird genau die Information weggeworfen, die eine Lernende braucht.",
              "Heidi schreibt darum das mit, was Sie SAGEN wollen — in einer Sprache, die Sie schon haben. Nicht den Dialekt.",
            ],
            essay: { label: "Die Zahlen dazu", href: "technology" },
          },
        ],
      },
    ],
  },

  en: {
    eyebrow: "As of 22 September 2026",
    title: "What comes next",
    lede:
      "Heidi is twelve days old. So there are no quarters and no dates here — a date is a promise, and it is too early to make one. What is here is the order and the reason for it. Anything blocked says what on.",
    buckets: [
      {
        title: "Next",
        summary: "Decided, and the material for it is already in the repository.",
        items: [
          {
            title: "A Zurich lexicon, against invented facts",
            line: "The four guards between the model and the learner catch invented RULES and empty loops — but not one invented fact.",
            details: [
              "Asked about «Im Kauz» — a Zurich bar — the model decided Kauz was a typo for Huus and supplied the sound law k → h to go with it. Confident, plausible, invented.",
              "The rule is stripped today, because the pack does not list it. The wrong gloss still stands.",
              "This is the next piece of linguistic work and it needs a checkable word list, not a second model.",
            ],
          },
          {
            title: "Per-area contrast data",
            line: "The dialect pages tell; they cannot yet ask.",
            details: [
              "The container shipped with the Alemannic branches. What it needs is rows somebody can cite.",
              "Inventing them is the one thing this product must not do — §2: this is precisely what the learner cannot check.",
            ],
          },
          {
            title: "A second dialect",
            line: "Bernese is first on the list, and the architecture is already waiting for it.",
            details: [
              "A variety is data: one pack, one tag, one gate. No module holds a Swiss fact outside lib/variety.",
              "The proof is that a Ukrainian pack sits in the repository and nothing about it is Swiss.",
              "Zurich has to be right first. A second half-checked dialect is worse than one checked one.",
            ],
          },
        ],
      },
      {
        title: "Blocked — and on exactly what",
        summary: "Not on effort. On one specific thing somebody else would have to release.",
        items: [
          {
            title: "The listening lab",
            line: "Blocked on exactly one commercially-cleared dialect voice.",
            details: [
              "Multi-talker training is the best-evidenced method available to us (Lively 1993; Clopper & Pisoni 2004).",
              "It cannot be built out of a Standard German voice reading dialect spelling — §7.2 and §8 both forbid that.",
              "Almost every Zurich corpus is CC BY-NC or has a contested licence. One cleared voice unblocks this; nothing else does.",
            ],
            essay: { label: "What the technology can do today", href: "technology" },
          },
          {
            title: "Native review of the situations",
            line: "A hundred and forty lines nobody from Zurich has read.",
            details: [
              "Every line passed the deterministic gate, which is a claim about forms and not about how it lands.",
              "The pages say so themselves today. That is the honest stopgap, not the fix.",
              "These are sentences somebody says to a frightened person at half past six in the morning.",
            ],
            essay: { label: "Read the situations", href: "situations" },
          },
        ],
      },
      {
        title: "Deliberately not built",
        summary: "Standing decisions from §8, not a backlog. They are not coming later.",
        items: [
          {
            title: "Streaks, points, levels, percentages, a daily goal",
            line: "A streak measures how much Heidi somebody consumed while looking exactly like a measure of learning.",
            details: [
              "This product's metric is how much of an unfamiliar Zurich speaker somebody understands.",
              "If that ever costs us retention against a product with a flame icon, we lose that comparison on purpose.",
            ],
          },
          {
            title: "A score for pronunciation",
            line: "Nobody can measure that honestly today, and printing a number would be a claim about a person.",
            details: [
              "What is measured is how long you spoke and where the pauses were. Those are facts about the recording.",
              "The speaking loop ends in a room with other people. A score is what a product offers instead of that.",
            ],
          },
          {
            title: "Promising dialect transcription",
            line: "What is sold today as «Swiss German recognition» returns Standard German.",
            details: [
              "That throws away exactly the information a learner needs.",
              "So Heidi transcribes what you want to SAY, in a language you already have. Not the dialect.",
            ],
            essay: { label: "The numbers behind this", href: "technology" },
          },
        ],
      },
    ],
  },
};
