import type { ChangelogEntry } from "bip-kit";
import type { SectorLocale } from "./sectors.ts";

/**
 * What changed, dated, in the words of somebody using it.
 *
 * `ChangelogEntry` comes from `bip-kit`, whose own comment on the type says
 * what this page had to get right: "user-facing product changelog entry (NOT a
 * git log)". Ninety-three merges in twelve days is a git log; anybody who
 * wants that can read it, and the repository is public. A changelog is the
 * curation — which of those ninety-three a person would have noticed, said in
 * terms of what they can now do.
 *
 * THE RULES THAT KEEP IT FROM BECOMING MARKETING:
 *
 *   1. EVERY ENTRY POINTS AT SOMETHING A READER CAN OPEN. A line saying
 *      "improved the exercises" is a press release. "The practice pool went
 *      from 221 questions to 553, and typing is now its own mode" is a claim
 *      somebody can go and check in ninety seconds, which is the only kind
 *      worth publishing.
 *   2. FIXES ARE LISTED WITH THE SAME WEIGHT AS FEATURES, and they say what
 *      was wrong rather than that something was "improved". `/about` already
 *      promises we publish the parts that did not work; a changelog with no
 *      embarrassing rows in it is evidence that promise is decorative.
 *   3. NOTHING HERE IS ROUNDED UP. The numbers are the ones in the commits.
 *
 * GERMAN AND ENGLISH, not seven — the same call `sectors.ts`, `investors.ts`
 * and `roadmap.ts` make, for the same reason: this is writing about the
 * project rather than interface copy, and seven machine-checked translations
 * of it would be six liabilities.
 *
 * NEWEST FIRST, and a test asserts it: a changelog in the wrong order is read
 * as the wrong order rather than as an error, so nothing about it looks broken
 * while it tells everybody the opposite of the truth.
 */
export const CHANGELOG: Record<SectorLocale, readonly ChangelogEntry[]> = {
  de: [
    {
      date: "2026-09-22",
      tag: "feature",
      title: "Üben ist jetzt etwas, das Sie wählen",
      summary:
        "Tippen war überall und Karten gab es nicht. Beides ist jetzt eine eigene Übungsart, und dazu kam ein Test, der erst am Schluss etwas sagt.",
      items: [
        "Vier Arten zu üben: Gemischt, Antippen, Schreiben, Karten. Die Wahl steht in der URL, ist also teilbar.",
        "Zwei neue Aufgabentypen: ganze Sätze auf Züritüütsch schreiben, und echte Lernkarten über den ganzen Wortschatz.",
        "Der Fragenpool wuchs von 221 auf 553 Aufgaben.",
        "Ein Test: zwanzig Fragen am Stück, unterwegs sagt Heidi nichts, am Schluss alle Antworten mit Erklärung — die falschen zuerst. Zeit nehmen ist freiwillig und lässt sich verlängern.",
        "Das Tippfeld ist aus den Karten- und Lückenaufgaben verschwunden. Es tauchte vorher bei jeder zweiten oder dritten Frage auf.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "fix",
      title: "Eine Konjugationsfrage übersetzte genau das, was sie lehrt",
      summary:
        "Auf Russisch stand «мы ___» über der Frage, welche Zürcher Verbform passt. Wer sie richtig beantwortete, hatte `mir chömed` nie gesehen — und das war die einzige Zeichenfolge, um die es ging.",
      items: [
        "Das Pronomen kommt jetzt aus dem Varietäten-Pack und steht in Mundart da; das Wort der Leserin rutscht in die Zeile darunter.",
        "Im Englischen hiess ein Menü «Practise» und sein erster Eintrag ebenfalls «Practise». Dasselbe in fünf von sieben Sprachen. Ein Test beendet diese Fehlerklasse.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "fix",
      title: "Eine Aufnahme ohne Sprache bekam Wörter untergeschoben",
      summary:
        "Eine 1,5-Sekunden-Aufnahme — die das Produkt selbst als zu kurz für jede Aussage einstuft — ging an die Transkription und kam als «Bis zum nächsten Mal.» zurück. Vier Wörter, die niemand gesagt hatte.",
      items: [
        "Aufnahmen unterhalb der eigenen Schwelle verlassen das Gerät jetzt gar nicht mehr.",
        "Gefunden von einem neuen Prüfwerkzeug, das die Seite mit einem künstlichen Mikrofon durchspielt — nicht durch Lesen des Quelltexts.",
      ],
    },
    {
      date: "2026-09-21",
      tag: "feature",
      title: "Die Nachschlageseiten tun jetzt etwas",
      summary:
        "Grammatik, Wortschatz und Situationen waren zum Lesen da. Jetzt führt jede Seite in Übungen, die genau bei ihrem Thema bleiben.",
      items: [
        "Jedes Grammatikthema hat eine eigene Seite und einen Knopf, der nur dieses Thema übt.",
        "Heidi merkt sich, welche Themen und Wörter Ihnen Mühe machen, und zieht sie vor.",
        "Der Stoff wuchs deutlich: 11 Grammatikthemen, 83 Wörter, 14 Szenen.",
      ],
    },
    {
      date: "2026-09-20",
      tag: "feature",
      title: "Wo Sie es brauchen: sechs Szenen aus einer Schicht",
      summary:
        "Übergabe, Morgen, Schmerz, Essen, Abend, Besuch — Sätze, wie sie in der Pflege wirklich fallen, maschinell auf Zürcher Formen geprüft.",
      items: [
        "Jede Zeile nennt ihre Quelle und jede hat das Varietäten-Gate passiert.",
        "Die Seite schreibt selbst hin, dass noch keine Muttersprachlerin sie gegengelesen hat.",
      ],
    },
    {
      date: "2026-09-18",
      tag: "feature",
      title: "Ein Ort, um den Mund aufzumachen",
      summary:
        "Nehmen Sie sich auf und sehen Sie, was die Aufnahme tatsächlich zeigt: Sprechzeit, Pausen, und welche Wörter aus einer anderen Mundart stammen.",
      items: [
        "Keine Note für die Aussprache. Das kann heute niemand ehrlich messen, und eine Zahl wäre eine Behauptung über einen Menschen.",
        "Auf Züritüütsch wird bewusst nicht transkribiert: kein System schreibt diese Mundart zuverlässig auf.",
      ],
    },
    {
      date: "2026-09-17",
      tag: "feature",
      title: "Was ein Computer mit Schweizerdeutsch kann — mit Zahlen",
      summary:
        "Korpora, Worterkennungsraten, Sprachsynthese und Sprachmodelle, jedes mit Quelle. Damit Sie unsere Behauptungen dagegen prüfen können.",
      items: [
        "Die beste nachprüfbare Wortfehlerrate liegt bei 12,1 % — und diese Gewichte sind nicht veröffentlicht.",
        "Fast jedes Zürcher Korpus ist forschungslizenziert oder hat eine strittige Lizenz.",
      ],
    },
    {
      date: "2026-09-15",
      tag: "feature",
      title: "Ein Nachschlagewerk, das auf Daten steht",
      summary:
        "Jedes Dialektgebiet der Deutschschweiz, eine Karte, die sagt, welche Behauptung sie macht, und Wörter, die einen Satz wirklich blockieren.",
      items: [
        "Behauptungen sind Daten, geprüft und mit Quelle — keine übersetzte Prosa, die niemand hier nachlesen kann.",
      ],
    },
    {
      date: "2026-09-10",
      tag: "platform",
      title: "Heidi fängt an",
      summary: "Ein Feld auf einer Seite: fügen Sie eine echte Nachricht ein und bekommen Sie sie erklärt.",
      items: [
        "Vier deterministische Wächter zwischen Modell und Lernender, weil genau diese Person die Arbeit nicht prüfen kann.",
        "Jede erzeugte Zeile geht durch das Varietäten-Gate, bevor sie jemand sieht.",
      ],
    },
  ],

  en: [
    {
      date: "2026-09-22",
      tag: "feature",
      title: "Practice is now something you choose",
      summary:
        "Typing was everywhere and cards did not exist. Both are their own mode now, and there is a test that says nothing until the end.",
      items: [
        "Four ways to practise: mixed, tapping, writing, cards. The choice lives in the URL, so it is shareable.",
        "Two new question types: write whole sentences in Zurich German, and real flashcards over the whole vocabulary.",
        "The question pool grew from 221 to 553.",
        "A test: twenty questions in a row, silence as you go, every answer with its explanation at the end — the wrong ones first. The clock is optional and can be extended.",
        "The typing field is gone from the card and gap questions. It used to appear every second or third question.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "fix",
      title: "A conjugation question was translating the thing it teaches",
      summary:
        "In Russian the prompt read «мы ___» above a question about which Zurich verb form fits. Answering it correctly left you having never seen `mir chömed` — the only string it was ever about.",
      items: [
        "The pronoun now comes from the variety pack and is printed in dialect; the reader's own word moves to the line underneath.",
        "In English a menu was called «Practise» and its first entry was also «Practise». The same in five of seven languages. A test ends that class of bug.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "fix",
      title: "A recording with no speech in it was given words",
      summary:
        "A 1.5-second take — which the product itself calls too short to say anything about — was sent to be transcribed and came back as «Bis zum nächsten Mal.» Four words nobody had said.",
      items: [
        "Recordings below our own threshold no longer leave the device at all.",
        "Found by a new harness that drives the page with a fake microphone — not by reading the source.",
      ],
    },
    {
      date: "2026-09-21",
      tag: "feature",
      title: "The reference pages do something now",
      summary:
        "Grammar, vocabulary and situations were there to read. Each one now leads into practice that stays on its subject.",
      items: [
        "Every grammar topic has its own page and a button that drills only that topic.",
        "Heidi keeps track of which topics and words are giving you trouble, and brings them forward.",
        "The material grew considerably: 11 grammar topics, 83 words, 14 scenes.",
      ],
    },
    {
      date: "2026-09-20",
      tag: "feature",
      title: "Where you need it: six scenes from a shift",
      summary:
        "Handover, the morning, pain, meals, the evening, visitors — lines as they are actually said in care work, machine-checked for Zurich forms.",
      items: [
        "Every line names its source and every line passed the variety gate.",
        "The page says for itself that no native speaker has read them yet.",
      ],
    },
    {
      date: "2026-09-18",
      tag: "feature",
      title: "Somewhere to open your mouth",
      summary:
        "Record yourself and see what the recording actually shows: time spent speaking, where the pauses were, and which words came from another dialect.",
      items: [
        "No score for pronunciation. Nobody can measure that honestly today, and a number would be a claim about a person.",
        "In Zurich German nothing is transcribed, on purpose: no system writes this dialect down reliably.",
      ],
    },
    {
      date: "2026-09-17",
      tag: "feature",
      title: "What a computer can do with Swiss German — with the numbers",
      summary:
        "Corpora, word error rates, speech synthesis and language models, each with its source, so you can check our claims against the field.",
      items: [
        "The best verifiable word error rate is 12.1 % — and those weights are not published.",
        "Almost every Zurich corpus is research-licensed or has a contested licence.",
      ],
    },
    {
      date: "2026-09-15",
      tag: "feature",
      title: "A reference section built on data",
      summary:
        "Every German-speaking dialect area of Switzerland, a map that says which claim it is making, and the words that actually block a sentence.",
      items: ["A claim is data, gated and cited — not translated prose nobody here can check."],
    },
    {
      date: "2026-09-10",
      tag: "platform",
      title: "Heidi starts",
      summary: "One field on one page: paste a real message and have it explained.",
      items: [
        "Four deterministic guards between the model and the learner, because that learner is exactly the person who cannot check the work.",
        "Every generated line goes through the variety gate before anybody sees it.",
      ],
    },
  ],
};

/** The date of the most recent entry, for the page and for the roadmap eyebrow. */
export function lastChanged(locale: SectorLocale): string {
  return CHANGELOG[locale][0]?.date ?? "";
}
