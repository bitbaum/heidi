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
 * WHAT THIS PAGE IS FOR, revised 2026-09-25. It is where a learner, an
 * organisation and an investor see where Heidi is going. It says so with
 * confidence, because the direction is decided. Two rules hold:
 *
 *   1. NOTHING IS DATED. No quarters, no "coming soon". The ORDER carries the
 *      argument, and an order does not age the way a missed quarter does.
 *   2. NOTHING HERE CLAIMS WHAT IS NOT TRUE. Planned things are written as
 *      plans; nothing is presented as shipped before it is. Internal
 *      constraints and how the work gets done are not this page's subject —
 *      HEIDI.md §9 holds the reasoning, and the internal notes live there.
 *
 * This is the ONE list. HEIDI.md §9 used to keep a second, numbered copy that
 * went stale twice; it now links here, and a test refuses it growing back.
 */
export const ROADMAP: Record<SectorLocale, RoadmapDoc> = {
  de: {
    eyebrow: "Stand 25. September 2026",
    title: "Was als Nächstes kommt",
    lede:
      "Heidi macht Zürichdeutsch verständlich — Situation für Situation, für Einzelne und für Organisationen, deren Leute hier leben und arbeiten. Hier steht, in welcher Reihenfolge wir das ausbauen, und warum.",
    buckets: [
      {
        title: "Jetzt in Arbeit",
        summary: "Wird gerade gebaut.",
        items: [
          {
            title: "Serien und Wochenziele — ohne schlechtes Gewissen",
            line: "Sichtbar machen, was Sie aufgebaut haben: Tage in Folge oder ein Wochenziel, das zu Ihrem Leben passt.",
            details: [
              "Eine Serie zeigt, was Sie geschafft haben — nie, was Sie gleich verlieren.",
              "Ein freier Aussetzer ist eingebaut. Keine Mahnungen, kein Bezahlen für eine gerissene Serie.",
            ],
          },
          {
            title: "Der Dialekt-Detektor",
            line: "Einen Satz einfügen — Heidi sagt, aus welcher Gegend er stammt, und woran man das erkennt.",
            details: [
              "«nid» klingt nach Ostschweiz, «gäu» nach Bern: Heidi kennt die Formen und zeigt die Spur.",
              "Für alle in der Schweiz, nicht nur für Lernende.",
            ],
          },
          {
            title: "Mehr Situationen, und jede tiefer",
            line: "Beim Arzt, auf der Gemeinde, in der Waschküche, am Apéro — und wenn «nein» nicht «nein» heisst.",
            details: [
              "Jede Situation wächst auf rund 25 Sätze, genug, um sie wirklich zu beherrschen.",
              "Alles maschinell auf Zürcher Formen geprüft, bevor es erscheint.",
            ],
          },
          {
            title: "Ein Zürcher Lexikon gegen erfundene Fakten",
            line: "Heidi prüft heute Formen und Regeln. Als Nächstes prüft sie auch einzelne Bedeutungen gegen eine Wortliste.",
          },
        ],
      },
      {
        title: "Als Nächstes",
        summary: "Entschieden und geplant.",
        items: [
          {
            title: "Heidi für Teams",
            line: "Für Pflegeheime, Spitäler, Relocation-Firmen und alle, deren Leute hier neu anfangen.",
            details: [
              "Plätze für ein ganzes Team, ein Überblick pro Situation, und Situationspakete für den eigenen Arbeitsplatz — Visite, Übergabe, Patientengespräch.",
              "Die Lernenden bestimmen, was geteilt wird.",
            ],
          },
          {
            title: "Zertifikate pro Situation",
            line: "Nicht «Schweizerdeutsch B1», sondern: «kann einer Übergabe im Pflegeheim folgen» — mit einem Link, den jede Arbeitgeberin prüfen kann.",
          },
          {
            title: "Ihr Fortschritt auf allen Geräten",
            line: "Angemeldet, auf Wunsch: was Sie am Telefon üben, zählt auch am Laptop.",
          },
          {
            title: "Mitreden beim Fahrplan",
            line: "Abstimmen, was gebraucht wird, eigene Vorschläge machen und Änderungen kommentieren — direkt auf dieser Seite.",
          },
        ],
      },
      {
        title: "Danach",
        summary: "Die Richtung steht.",
        items: [
          {
            title: "Das Hörlabor",
            line: "Viele verschiedene Zürcher Stimmen, denn wer mehrere Sprecher hört, versteht auch den nächsten.",
          },
          {
            title: "Mehr Mundarten",
            line: "Bern, Basel, die Ostschweiz und weitere — mit Kontrasten, die zeigen, was sich von Ort zu Ort ändert.",
          },
          {
            title: "Selbst sagen",
            line: "Von der Bedeutung zur Mundart: für Wörter, die Sie schon sicher verstehen.",
          },
          {
            title: "Heidi Pro",
            line: "Unbegrenzter Chat, Zertifikate und mehr für alle, die schneller vorankommen wollen.",
          },
          {
            title: "Gemeinsam lernen",
            line: "Sehen, wie Sie im Vergleich vorankommen, und mit anderen ins Gespräch kommen, die dieselben Situationen üben.",
          },
        ],
      },
    ],
  },
  en: {
    eyebrow: "As of 25 September 2026",
    title: "What comes next",
    lede:
      "Heidi makes Zurich German understandable — situation by situation, for individuals and for organisations whose people live and work here. This is the order we are building it in, and why.",
    buckets: [
      {
        title: "In progress",
        summary: "Being built now.",
        items: [
          {
            title: "Streaks and weekly goals — without the guilt",
            line: "See what you have built: days in a row, or a weekly goal that fits your life.",
            details: [
              "A streak shows what you achieved — never what you are about to lose.",
              "A free skip is built in. No nagging, no paying to repair a broken streak.",
            ],
          },
          {
            title: "The dialect detector",
            line: "Paste a sentence — Heidi tells you which region it comes from, and how you can tell.",
            details: [
              "«nid» sounds like eastern Switzerland, «gäu» like Bern: Heidi knows the forms and shows the trail.",
              "For everyone in Switzerland, not only learners.",
            ],
          },
          {
            title: "More situations, each one deeper",
            line: "At the doctor's, at the Gemeinde, in the laundry room, at an apéro — and when «no» does not sound like no.",
            details: [
              "Each situation grows to around 25 lines, enough to genuinely master it.",
              "Everything machine-verified against Zurich forms before it appears.",
            ],
          },
          {
            title: "A Zurich lexicon against invented facts",
            line: "Heidi checks forms and rules today. Next it also checks individual meanings against a word list.",
          },
        ],
      },
      {
        title: "Next",
        summary: "Decided and planned.",
        items: [
          {
            title: "Heidi for Teams",
            line: "For care homes, hospitals, relocation firms and anyone whose people are starting out here.",
            details: [
              "Seats for a whole team, an overview per situation, and situation packs for your own workplace — ward rounds, handovers, patient conversations.",
              "Learners decide what is shared.",
            ],
          },
          {
            title: "Certificates per situation",
            line: "Not «Swiss German B1» but «can follow a care-home handover» — with a link any employer can verify.",
          },
          {
            title: "Your progress on every device",
            line: "Signed in, if you choose: what you practise on your phone counts on your laptop too.",
          },
          {
            title: "Have your say on the roadmap",
            line: "Vote on what is needed, suggest features and comment on changes — right on this page.",
          },
        ],
      },
      {
        title: "After that",
        summary: "The direction is set.",
        items: [
          {
            title: "The listening lab",
            line: "Many different Zurich voices — people who hear several speakers understand the next one better.",
          },
          {
            title: "More dialects",
            line: "Bern, Basel, eastern Switzerland and more — with contrasts that show what changes from place to place.",
          },
          {
            title: "Saying it yourself",
            line: "From meaning to dialect, for words you already understand with confidence.",
          },
          {
            title: "Heidi Pro",
            line: "Unlimited chat, certificates and more, for anyone who wants to move faster.",
          },
          {
            title: "Learning together",
            line: "See how your progress compares, and talk with others practising the same situations.",
          },
        ],
      },
    ],
  },
};
