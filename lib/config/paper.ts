import type { SourceId } from "../research/sources.ts";
import type { SectorLocale } from "./sectors.ts";

/**
 * The white paper: what Heidi does, how it is built, and how to check it.
 *
 * WHAT IT IS FOR. Four readers, one question in four accents — a researcher
 * (is the linguistics defensible), a procurement officer (what does it claim
 * and who is liable for the gap), a journalist (what is actually new), an
 * investor (is the discipline real). All four are asking: should I believe
 * this. `/method` answers "why these teaching choices", `/technology` answers
 * "what can machines do with this language", `/about` says who we are. None of
 * them answers why the SOFTWARE is shaped like this.
 *
 * REWRITTEN AFTER A FLAT REVIEW, and the note is here because the first
 * version was a specific and repeatable mistake: "very poorly written and has
 * too much stuff that kills customer confidence."
 *
 * It was accurate and it read as a confession. It opened by telling the reader
 * they were in a market for lemons — which casts the person you want as a
 * customer as a dupe, in the first sentence. Every section then led with a
 * limitation: the gate section opened on a model inventing a sound law, the
 * situations section on nobody having reviewed them. Six sections, each
 * beginning with what is wrong.
 *
 * THE FACTS DID NOT CHANGE. The order and the framing did, on one rule:
 * CAPABILITY FIRST, THEN ITS EDGE. Every section now states what the product
 * does, and then where that stops — which is the same information a reader can
 * act on, in the order a reader can act on it. A limitation stated after a
 * capability is a boundary; the same sentence first is an apology.
 *
 * That is not a licence to soften. `/organisations` still says there are no
 * customers, the situations pages still say no native speaker has read them,
 * and §8's register is still published in full on the roadmap. Confidence and
 * honesty are not in tension here — leading with the weakness was never more
 * honest, only less useful.
 *
 * WHY IT IS NOT A PDF. A snapshot drifts from the product the day it is
 * posted, and the whole claim is that this can be checked. Every section ends
 * in something a reader can open.
 *
 * GERMAN AND ENGLISH, like `sectors`, `investors` and `roadmap`: writing about
 * the project rather than interface copy, and seven machine-checked
 * translations of an argument nobody here can read back would be six
 * liabilities.
 */

export type PaperSection = {
  /** Stable id: a URL fragment, so a paragraph can be cited by link. */
  id: string;
  title: string;
  /** Short label for the table of contents — the title is too long for a rail. */
  short: string;
  /** The argument. Each string is a paragraph. */
  body: readonly string[];
  /** What a reader can open to check this section, rather than take it. */
  check?: readonly { label: string; segment: string }[];
  /** Ids from `lib/research/sources.ts`. Rendered as citations at the foot. */
  sources?: readonly SourceId[];
};

export type Paper = {
  title: string;
  lead: string;
  standfirst: string;
  sections: readonly PaperSection[];
};

const EN: Paper = {
  title: "How Heidi is built, and how to check it",
  standfirst:
    "A working document about the engineering. It lives on the site rather than as a PDF, because a snapshot drifts from the product the day it is posted — and every section here ends in something you can open.",
  lead: "Heidi teaches Zurich German to people who already speak German and still cannot follow the lunch table. This is how it works, and how to verify any of it.",
  sections: [
    {
      id: "what",
      short: "What it does",
      title: "One field, and a real message in it",
      body: [
        "Paste something a Zurich speaker actually sent you. Heidi explains it — what was said, which words did the work, and why the sentence is shaped the way it is. Then it offers the words worth keeping, and brings them back later on a schedule built from the spacing research rather than from a marketing calendar.",
        "Around that sit the things a learner needs next: a grammar section of twelve topics, a hundred and sixty-four words chosen because they block sentences rather than because they are common, nineteen scenes of what is actually said — at the Gemeinde, in the laundry room, at the doctor's and during a working shift — and 1,233 practice questions generated from that same checked material.",
        "Nothing in the product invents language. Every question, every example and every gloss is assembled from material the variety pack already vouches for, which is the constraint that makes the rest of this document possible.",
      ],
      check: [
        { label: "Open the chat and paste something", segment: "chat" },
        { label: "The grammar, as forms with sources", segment: "grammar" },
      ],
    },
    {
      id: "hard",
      short: "Why it is hard",
      title: "Swiss German is not one language, and it is not written down",
      body: [
        "Swiss German is a family, not a language. The dialect of Zurich and the dialect of Valais differ enough that Swiss television subtitles one for the other. Teaching «Swiss German» in general is therefore teaching nothing in particular — so Heidi teaches one variety properly and says which one, everywhere, in the interface and in the data.",
        "It also has no settled orthography. There is no authority to be right against, which means a product cannot mark a learner's spelling wrong without inventing a standard — and it means dialect exists mostly as speech, so the written material a model could learn from is thin and largely research-licensed.",
        "Those two facts are why the market looks the way it does. Most voices sold as Swiss German are Swiss STANDARD German: the written standard read aloud with an accent. It is a different language from the one at the lunch table, and a learner buying it has been sold the thing they already understand. The economics of that are well described — a buyer who cannot judge quality before buying degrades the whole market — and it is the reason everything below exists.",
      ],
      check: [
        { label: "Every dialect area, and what each claim rests on", segment: "dialect" },
        { label: "What the field can do, with the numbers", segment: "technology" },
      ],
      sources: ["akerlof", "ferguson-1959"],
    },
    {
      id: "variety",
      short: "The variety is data",
      title: "A dialect is data, not code",
      body: [
        "Everything Zurich-specific in this product lives in one file: the variety pack. The forms, the rules, the grammar topics, the vocabulary, the articles, the sound correspondences, and what vouches for each of them. No module elsewhere holds a Swiss fact.",
        "That is what makes the product reviewable by the people qualified to review it. A native speaker can read the whole of what Heidi asserts about Zurich German in an afternoon and mark what is wrong, without reading a line of code. A linguist can check a rule against an atlas. Neither has to take our word for anything.",
        "It is also what makes a second dialect a pack rather than a rewrite. The proof that the seam is real is that a Ukrainian pack sits in the same repository and nothing about it is Swiss.",
      ],
      check: [{ label: "The twelve grammar topics", segment: "grammar" }],
    },
    {
      id: "gate",
      short: "The gate",
      title: "Every line is checked before you see it",
      body: [
        "A deterministic gate sits between the model and the learner. Every generated line is checked against the pack's own list of forms belonging to other dialects — as code, with a severity threshold, not as a second model asked politely. A flagged line is marked rather than quietly removed, so anything drifting stays visible.",
        "Three further guards sit beside it, each added after a specific failure. A sound correspondence may only be cited if the pack vouches for it. A word glossed against itself is dropped. An answer that loops is refused and retried rather than shipped. Together they remove the failure modes that matter most here: a fluent, confident explanation that is wrong in a way the learner cannot detect.",
        "What the gate does not do is check a single fact. It governs rules and form, not whether a particular gloss is right, so a model can still be confidently wrong about one word. Closing that needs a Zurich lexicon to check against, it is the next piece of linguistic work, and it is on the roadmap rather than implied to be done.",
      ],
      check: [
        { label: "The rules the gate enforces", segment: "method" },
        { label: "What is being built next", segment: "roadmap" },
      ],
    },
    {
      id: "refuse",
      short: "What we will not claim",
      title: "A register of claims we do not make",
      body: [
        "The specification carries a list of sentences this product may not say, and it is enforced by tests rather than remembered by people. No promise to transcribe dialect. No score for pronunciation. No measurement of learning that is really a measurement of usage.",
        "Each is refused because it cannot be made honestly today. Nothing transcribes this dialect reliably, so dictation writes what you want to SAY in a language you already have, and says so. Nobody can assess pronunciation in a variety with no standard, so the speaking page reports how long you spoke and where the pauses fell — facts about a recording rather than a verdict about a person.",
        "Publishing that list is the point. It is the part of a product that is cheapest to write and most expensive to keep, so it is kept where it costs something: on the public roadmap, beside the plans.",
      ],
      check: [
        { label: "The register, in full", segment: "roadmap" },
        { label: "Record yourself and see what is measured", segment: "speaking" },
      ],
    },
    {
      id: "privacy",
      short: "Where your data is",
      title: "The device keeps what it can",
      body: [
        "Words you keep, their review schedule, your recordings and what those recordings measured all live in your browser. Not as a policy that could be revised later — as an architecture in which the server was never sent them.",
        "Where audio does leave the device it is for one named purpose, stated on the same screen rather than in a policy page, and only for the variety where transcription is honest. In Zurich German nothing is sent at all.",
        "For an institution the relevant limit is this: there is no data-processing agreement with a model vendor today, so Heidi is not suitable for material covered by professional confidentiality. That is a contract to be signed rather than a problem to be solved, and it is named here because it is the first question a procurement officer asks.",
      ],
      check: [{ label: "What is stored, and where", segment: "privacy" }],
    },
    {
      id: "check",
      short: "How to check us",
      title: "How to check all of this in an afternoon",
      body: [
        "Read the variety pack — one file, and the whole of what we assert about Zurich German. Compare the technology page against the published word error rates; the best verifiable figure in the field is 12.1 %, and those weights are not released. Run the test suite: eight hundred and twenty-two tests, and the command is in the readme.",
        "Then use it against something we do not control. Paste a message from a real Zurich speaker and see whether the explanation holds. That is the measurement that matters and the one we cannot stage.",
        "If a line is wrong, tell us. The situation packs were written for this product and machine-checked for Zurich forms; the pages say plainly which of them a native speaker has reviewed. A correction from somebody who grew up with this language is worth more to us than any feature on the roadmap.",
      ],
      check: [
        { label: "What changed, and when", segment: "changelog" },
        { label: "Send a correction", segment: "contribute" },
        { label: "For schools, clinics and employers", segment: "organisations" },
      ],
    },
  ],
};

const DE: Paper = {
  title: "Wie Heidi gebaut ist, und wie man das prüft",
  standfirst:
    "Ein Arbeitsdokument über die Technik. Es steht auf der Website und nicht als PDF, weil eine Momentaufnahme ab dem Tag der Veröffentlichung vom Produkt abdriftet — und jeder Abschnitt hier endet in etwas, das Sie öffnen können.",
  lead: "Heidi bringt Zürichdeutsch Menschen bei, die bereits Deutsch können und am Mittagstisch trotzdem nichts verstehen. Hier steht, wie das funktioniert und wie Sie jede einzelne Aussage nachprüfen.",
  sections: [
    {
      id: "what",
      short: "Was es tut",
      title: "Ein Feld, und eine echte Nachricht darin",
      body: [
        "Fügen Sie ein, was Ihnen jemand aus Zürich wirklich geschrieben hat. Heidi erklärt es — was gesagt wurde, welche Wörter die Arbeit tun und warum der Satz so gebaut ist. Danach bietet sie die Wörter an, die zu behalten sich lohnt, und bringt sie später zurück, nach einem Plan aus der Forschung zum verteilten Lernen und nicht aus einem Marketingkalender.",
        "Darum herum steht, was eine Lernende als Nächstes braucht: zwölf Grammatikthemen, hundertvierundsechzig Wörter — ausgewählt, weil sie Sätze blockieren, nicht weil sie häufig sind —, neunzehn Szenen aus dem Alltag und aus einer echten Schicht und 1233 Übungsfragen, erzeugt aus genau diesem geprüften Material.",
        "Nichts in diesem Produkt erfindet Sprache. Jede Frage, jedes Beispiel und jede Bedeutung wird aus Material zusammengesetzt, für das das Varietäten-Pack bereits geradesteht. Diese Einschränkung ist es, die den Rest dieses Dokuments überhaupt möglich macht.",
      ],
      check: [
        { label: "Den Chat öffnen und etwas einfügen", segment: "chat" },
        { label: "Die Grammatik, als Formen mit Quellen", segment: "grammar" },
      ],
    },
    {
      id: "hard",
      short: "Warum es schwierig ist",
      title: "Schweizerdeutsch ist nicht eine Sprache, und es ist nicht verschriftet",
      body: [
        "Schweizerdeutsch ist eine Familie, keine Sprache. Zürichdeutsch und Walliserdeutsch unterscheiden sich so weit, dass das Schweizer Fernsehen das eine für das andere untertitelt. «Schweizerdeutsch» im Allgemeinen zu unterrichten heisst deshalb, nichts Bestimmtes zu unterrichten — Heidi unterrichtet eine Varietät richtig und sagt überall, welche.",
        "Dazu kommt: Es gibt keine festgelegte Rechtschreibung. Es existiert keine Instanz, gegen die man recht haben könnte — ein Produkt kann eine Schreibweise also nicht als falsch markieren, ohne eine Norm zu erfinden. Und die Mundart lebt vor allem als gesprochene Sprache, weshalb das geschriebene Material, aus dem ein Modell lernen könnte, dünn und meist forschungslizenziert ist.",
        "Diese beiden Tatsachen erklären, wie der Markt aussieht. Die meisten Stimmen, die als Schweizerdeutsch verkauft werden, sind Schweizer HOCHDEUTSCH: die geschriebene Norm, mit Akzent vorgelesen. Das ist eine andere Sprache als die am Mittagstisch, und wer sie kauft, hat gekauft, was er ohnehin versteht. Die Ökonomie dahinter ist gut beschrieben — wer Qualität vor dem Kauf nicht beurteilen kann, verdirbt den ganzen Markt — und sie ist der Grund für alles Weitere.",
      ],
      check: [
        { label: "Jedes Dialektgebiet, und worauf jede Aussage beruht", segment: "dialect" },
        { label: "Was die Technik kann, mit Zahlen", segment: "technology" },
      ],
      sources: ["akerlof", "ferguson-1959"],
    },
    {
      id: "variety",
      short: "Die Varietät ist Daten",
      title: "Eine Mundart ist Daten, nicht Code",
      body: [
        "Alles Zürcher an diesem Produkt steht in einer Datei: im Varietäten-Pack. Die Formen, die Regeln, die Grammatikthemen, der Wortschatz, die Artikel, die Lautentsprechungen — und wer für jede Angabe geradesteht. Kein anderes Modul kennt eine Schweizer Tatsache.",
        "Genau das macht das Produkt für die Leute prüfbar, die es prüfen können. Eine Muttersprachlerin liest an einem Nachmittag alles, was Heidi über Zürichdeutsch behauptet, und streicht an, was nicht stimmt — ohne eine Zeile Code zu lesen. Eine Linguistin hält eine Regel gegen einen Atlas. Keine von beiden muss uns etwas glauben.",
        "Und es macht eine zweite Mundart zu einem Pack statt zu einem Umbau. Der Beweis, dass die Naht echt ist: Im selben Repository liegt ein ukrainisches Pack, und nichts daran ist schweizerisch.",
      ],
      check: [{ label: "Die zwölf Grammatikthemen", segment: "grammar" }],
    },
    {
      id: "gate",
      short: "Das Gate",
      title: "Jede Zeile wird geprüft, bevor Sie sie sehen",
      body: [
        "Zwischen Modell und Lernender steht ein deterministisches Gate. Jede erzeugte Zeile wird gegen die Liste der Formen anderer Mundarten aus dem Pack geprüft — als Code, mit einer Schwelle, nicht als zweites Modell, das man höflich fragt. Eine auffällige Zeile wird markiert und nicht stillschweigend entfernt, damit Abdrift sichtbar bleibt.",
        "Drei weitere Wächter stehen daneben, jeder nach einem konkreten Vorfall entstanden. Eine Lautentsprechung darf nur zitiert werden, wenn das Pack sie kennt. Ein Wort, das mit sich selbst erklärt wird, fällt weg. Eine kreisende Antwort wird verworfen und neu geholt statt ausgeliefert. Zusammen entfernen sie die Fehler, auf die es hier ankommt: eine flüssige, selbstsichere Erklärung, die auf eine Weise falsch ist, die die Lernende nicht bemerken kann.",
        "Was das Gate nicht prüft, ist ein einzelner Fakt. Es regelt Regeln und Form, nicht ob eine bestimmte Bedeutung stimmt — ein Modell kann also bei einem einzelnen Wort weiterhin selbstsicher falsch liegen. Das zu schliessen braucht ein Zürcher Lexikon, es ist die nächste linguistische Arbeit, und es steht auf dem Fahrplan, statt als erledigt angedeutet zu werden.",
      ],
      check: [
        { label: "Die Regeln, die das Gate durchsetzt", segment: "method" },
        { label: "Was als Nächstes gebaut wird", segment: "roadmap" },
      ],
    },
    {
      id: "refuse",
      short: "Was wir nicht behaupten",
      title: "Ein Register der Aussagen, die wir nicht machen",
      body: [
        "Die Spezifikation führt eine Liste von Sätzen, die dieses Produkt nicht sagen darf, und Tests setzen sie durch, statt dass Menschen sich an sie erinnern. Kein Versprechen, Mundart zu transkribieren. Keine Note für die Aussprache. Kein Mass für Gelerntes, das in Wahrheit ein Mass für Nutzung ist.",
        "Jede Ablehnung steht da, weil sich die Sache heute nicht ehrlich machen lässt. Nichts schreibt diese Mundart zuverlässig auf — also schreibt die Diktierfunktion das mit, was Sie SAGEN wollen, in einer Sprache, die Sie schon haben, und sagt das auch. Niemand kann Aussprache in einer Varietät ohne Norm beurteilen — also zeigt die Sprechseite, wie lange Sie gesprochen haben und wo die Pausen lagen. Tatsachen über eine Aufnahme statt eines Urteils über einen Menschen.",
        "Diese Liste zu veröffentlichen ist der Punkt. Sie ist der Teil eines Produkts, der am billigsten zu schreiben und am teuersten zu halten ist — darum steht sie dort, wo sie etwas kostet: auf dem öffentlichen Fahrplan, neben den Plänen.",
      ],
      check: [
        { label: "Das Register, vollständig", segment: "roadmap" },
        { label: "Sich aufnehmen und sehen, was gemessen wird", segment: "speaking" },
      ],
    },
    {
      id: "privacy",
      short: "Wo Ihre Daten sind",
      title: "Das Gerät behält, was es behalten kann",
      body: [
        "Gemerkte Wörter, ihr Wiederholungsplan, Ihre Aufnahmen und deren Messwerte liegen in Ihrem Browser. Nicht als Richtlinie, die man später ändern könnte — als Architektur, in der der Server sie nie bekommen hat.",
        "Wo Ton das Gerät doch verlässt, geschieht das zu einem genannten Zweck, gesagt auf demselben Bildschirm statt in einer Datenschutzseite, und nur für die Varietät, bei der Transkription ehrlich ist. Auf Züridütsch wird gar nichts gesendet.",
        "Für eine Institution ist die entscheidende Grenze diese: Es gibt heute keinen Auftragsverarbeitungsvertrag mit einem Modellanbieter, Heidi eignet sich also nicht für Material unter Berufsgeheimnis. Das ist ein Vertrag, den man unterschreibt, kein Problem, das man löst — und es steht hier, weil es die erste Frage einer Beschaffungsstelle ist.",
      ],
      check: [{ label: "Was gespeichert wird, und wo", segment: "privacy" }],
    },
    {
      id: "check",
      short: "Wie Sie uns prüfen",
      title: "Wie man das alles an einem Nachmittag prüft",
      body: [
        "Lesen Sie das Varietäten-Pack — eine Datei, und darin alles, was wir über Zürichdeutsch behaupten. Halten Sie die Technikseite gegen die veröffentlichten Wortfehlerraten; die beste nachprüfbare Zahl im Feld liegt bei 12,1 %, und diese Gewichte sind nicht veröffentlicht. Lassen Sie die Testsuite laufen: 822 Tests, der Befehl steht im Readme.",
        "Und dann benutzen Sie es an etwas, das wir nicht kontrollieren. Fügen Sie eine Nachricht einer echten Zürcher Sprecherin ein und sehen Sie, ob die Erklärung trägt. Das ist die Messung, auf die es ankommt, und die einzige, die wir nicht inszenieren können.",
        "Wenn eine Zeile falsch ist, sagen Sie es uns. Die Situationspacks wurden für dieses Produkt geschrieben und maschinell auf Zürcher Formen geprüft; die Seiten schreiben klar hin, welche davon eine Muttersprachlerin durchgesehen hat. Eine Korrektur von jemandem, der mit dieser Sprache aufgewachsen ist, ist uns mehr wert als jede Funktion auf dem Fahrplan.",
      ],
      check: [
        { label: "Was sich geändert hat, und wann", segment: "changelog" },
        { label: "Eine Korrektur schicken", segment: "contribute" },
        { label: "Für Schulen, Kliniken und Arbeitgeber", segment: "organisations" },
      ],
    },
  ],
};

export const PAPER: Record<SectorLocale, Paper> = { de: DE, en: EN };

/** Every source the paper cites, for the orphan check in `sources.test.ts`. */
export function paperSources(): SourceId[] {
  const ids = new Set<SourceId>();
  for (const paper of Object.values(PAPER)) {
    for (const section of paper.sections) {
      for (const id of section.sources ?? []) ids.add(id);
    }
  }
  return [...ids];
}
