import type { SourceId } from "../research/sources.ts";
import type { SectorLocale } from "./sectors.ts";

/**
 * The white paper: why this product is built the way it is, and how to check.
 *
 * WHAT IT IS FOR, stated before it was written, because a page without a
 * stated reader becomes a page about everything. Four readers, and the same
 * question in four accents:
 *
 *   a researcher      — is the linguistics defensible, and what is it built on
 *   a procurement     — what does it claim, what does it refuse, what is the
 *     officer           evidence, and who is liable for the difference
 *   a journalist      — what is actually new here versus the market's noise
 *   an investor       — is the discipline real or is it a slide
 *
 * All four are asking: SHOULD I BELIEVE THIS. That question has no home on the
 * site today. `/method` answers "why these teaching choices" with the
 * research. `/technology` answers "what can machines do with this language"
 * with the numbers. `/about` says who we are. None of them answers "why is the
 * SOFTWARE shaped like this", which is where the actual argument lives — the
 * gate, the variety as data, the guards, the overclaim register.
 *
 * WHY IT IS NOT A PDF. A PDF is a snapshot that starts drifting from the
 * product the day it is posted, and the whole claim here is that the product
 * can be checked. Every section below ends in something a reader can OPEN —
 * a page, a number, a source — rather than in a paragraph asking to be
 * trusted. Print it if you want; the page is styled for that.
 *
 * WHY IT IS DATA AND NOT PROSE IN A COMPONENT. Same reason as everything else
 * in this repo: the claims are checkable individually. Each section names the
 * sources it rests on, and `sources.test.ts` already refuses a source id that
 * does not exist. An argument whose citations cannot rot is worth more than a
 * better-written one whose can.
 *
 * GERMAN AND ENGLISH. The fourth time this repo has made that call
 * (`sectors`, `investors`, `roadmap`, here) and the reasoning has not changed:
 * this is writing about the project, and seven machine-checked translations of
 * an argument nobody here can read back would be six liabilities.
 */

export type PaperSection = {
  /** Stable id: a URL fragment, so a paragraph can be cited by link. */
  id: string;
  title: string;
  /** The argument. Each string is a paragraph. */
  body: readonly string[];
  /**
   * What a reader can open to check this section, rather than take it.
   *
   * A section with no way to check it is an assertion, and this document is
   * specifically about not making those. Route segments below the locale, so
   * the link is built the same way every other internal link is.
   */
  check?: readonly { label: string; segment: string }[];
  /** Ids from `lib/research/sources.ts`. Rendered as citations at the foot. */
  sources?: readonly SourceId[];
};

export type Paper = {
  title: string;
  lead: string;
  /** One line under the title: what this document is and is not. */
  standfirst: string;
  sections: readonly PaperSection[];
};

const EN: Paper = {
  title: "How Heidi is built, and how to check it",
  standfirst:
    "A working document about the engineering, not a brochure. It is kept on the site rather than issued as a PDF, because a snapshot starts drifting from the product the day it is posted — and every section here ends in something you can open.",
  lead: "Heidi teaches Zurich German to people who already speak German and still cannot follow the lunch table. This is the argument for why the software is shaped the way it is.",
  sections: [
    {
      id: "market",
      title: "The buyer cannot inspect the goods",
      body: [
        "A learner buying Swiss German is in the position Akerlof described for used cars: the thing that makes them a buyer is the thing that stops them judging what they bought. Somebody who could tell Zurich German from Bernese, or a real dialect form from a plausible invention, would not need the product.",
        "This is not a general worry about quality. It is specific and it is measurable in the market: search for Swiss German voices and most of what is sold is Swiss STANDARD German — the written standard read aloud with a Swiss accent. That is a different language from the one spoken at the lunch table, and a learner buying it has been sold the thing they already understand.",
        "Every design decision below follows from taking that seriously. If the learner cannot audit the work, then the product has to be built so that a machine can, and so that a third party can check the machine.",
      ],
      check: [{ label: "What the field can actually do, with numbers", segment: "technology" }],
      sources: ["akerlof"],
    },
    {
      id: "variety",
      title: "A dialect is data, not code",
      body: [
        "Everything Zurich-specific in this product lives in one file: the variety pack. The forms, the rules, the grammar topics, the vocabulary, the articles, the sound correspondences, what a source vouches for each of them. No module elsewhere holds a Swiss fact.",
        "That sounds like tidiness and it is a claim about honesty. When the language lives in one checkable file, a reviewer can read the whole of what the product asserts about Zurich German in an afternoon — and a native speaker can mark the parts that are wrong without reading any code.",
        "The proof that the seam is real is that a Ukrainian pack sits in the same repository and nothing about it is Swiss. Adding Bernese is a pack and a tag, not a rewrite.",
      ],
      check: [
        { label: "Every dialect area, and what each claim rests on", segment: "dialect" },
        { label: "The grammar, as forms with sources", segment: "grammar" },
      ],
    },
    {
      id: "gate",
      title: "A deterministic gate, in front of the model",
      body: [
        "Every line a model generates passes a rule-based check before anybody sees it. The check is not a model: it is the pack's own list of forms belonging to other dialects, applied as code, with a severity threshold. A flagged line is marked rather than silently dropped, so drift stays visible instead of becoming invisible curation.",
        "Three more guards sit beside it, and each exists because something specific went wrong. A correspondence may only be cited if the pack vouches for it — asked about a Zurich bar called «Im Kauz», a model decided Kauz was a typo and supplied an invented sound law to justify it. A word glossed against itself is dropped, because the model kept explaining that freundlich means freundlich. A looping answer is refused, after a free model answered a vocabulary question with «verbi» is short for «verbi» = «verbi» — fluent, well-punctuated and empty.",
        "The limit is stated rather than hidden: the guards catch invented RULES and empty form, not one invented fact. The wrong gloss for Kauz still gets through. Closing that needs a Zurich lexicon to check against, and it is the next piece of linguistic work rather than a thing we imply is already done.",
      ],
      check: [{ label: "The rules the gate enforces", segment: "method" }],
    },
    {
      id: "refuse",
      title: "An overclaim register, kept in public",
      body: [
        "The specification carries a list of sentences this product may not say, and the list is enforced rather than remembered. No streaks, no points, no levels, no percentage complete, no daily goal, no score for pronunciation, no promise to transcribe dialect.",
        "Each of those is refused for a reason that survives being argued with. A streak measures how much Heidi somebody consumed while looking exactly like a measure of learning, and the metric that matters is how much of an unfamiliar Zurich speaker they understand. A pronunciation score would be a claim about a person that nobody can currently make honestly — so the speaking page reports how long you spoke and where the pauses were, which are facts about a recording.",
        "Refusals are cheap to write and expensive to keep, so they are kept where they cost something: on the roadmap, next to the plans, where anybody deciding whether to trust this can see both at once.",
      ],
      check: [
        { label: "What will never be built, and why", segment: "roadmap" },
        { label: "Record yourself and see what is measured", segment: "speaking" },
      ],
    },
    {
      id: "privacy",
      title: "The device keeps what it can",
      body: [
        "Words somebody keeps, their review schedule, their recordings and what those recordings measured all live in the browser. Not as a policy that could be revised — as an architecture in which the server was never sent them.",
        "Where audio does leave the device it is for one named purpose, said on the same screen rather than in a policy page, and only for the variety where transcription is honest. In Zurich German nothing is sent at all, because no system writes this dialect down reliably and pretending otherwise would be the exact overclaim the register forbids.",
        "A recording the product itself judges too short or too quiet to measure is not uploaded either. That guard exists because a transcription model given audio with no speech in it does not return nothing — it returns something plausible.",
      ],
      check: [{ label: "What is stored, and where", segment: "privacy" }],
    },
    {
      id: "check",
      title: "How to check all of this in an afternoon",
      body: [
        "Read the variety pack; it is one file and it is the whole of what we assert about Zurich German. Read the technology page and compare our claims against the published word error rates — the best verifiable figure is 12.1 %, and those weights are not released.",
        "Then use the product against something we do not control: paste a message from a real Zurich speaker and see whether the explanation holds. That is the measurement that matters, and it is the one we cannot stage.",
        "What we ask in return is the correction. The situations were written for this product and machine-checked for Zurich forms, and no native speaker has read them yet — the pages say so themselves. If you are from here and a line is wrong, that is the most valuable thing anybody can send us.",
      ],
      check: [
        { label: "The changelog, including what was broken", segment: "changelog" },
        { label: "Send a correction", segment: "contribute" },
      ],
    },
  ],
};

const DE: Paper = {
  title: "Wie Heidi gebaut ist, und wie man das prüft",
  standfirst:
    "Ein Arbeitsdokument über die Technik, kein Prospekt. Es steht auf der Website statt als PDF, weil eine Momentaufnahme ab dem Tag der Veröffentlichung vom Produkt abzudriften beginnt — und jeder Abschnitt hier endet in etwas, das Sie öffnen können.",
  lead: "Heidi bringt Zürichdeutsch Menschen bei, die bereits Deutsch können und am Mittagstisch trotzdem nichts verstehen. Dies ist die Begründung dafür, warum die Software so aussieht, wie sie aussieht.",
  sections: [
    {
      id: "market",
      title: "Die Käuferin kann die Ware nicht prüfen",
      body: [
        "Wer Schweizerdeutsch lernt, steht in genau der Lage, die Akerlof für Gebrauchtwagen beschrieben hat: Was jemanden zur Käuferin macht, ist dasselbe, was sie daran hindert, das Gekaufte zu beurteilen. Wer Zürichdeutsch von Berndeutsch unterscheiden könnte oder eine echte Mundartform von einer plausiblen Erfindung, bräuchte dieses Produkt nicht.",
        "Das ist keine allgemeine Sorge um Qualität, sondern am Markt nachweisbar: Wer nach Schweizer Stimmen sucht, bekommt meist Schweizer HOCHDEUTSCH — die geschriebene Norm, mit Schweizer Akzent vorgelesen. Das ist eine andere Sprache als die am Mittagstisch, und wer sie kauft, hat das gekauft, was er ohnehin versteht.",
        "Jede Entscheidung unten folgt daraus, das ernst zu nehmen. Wenn die Lernende die Arbeit nicht prüfen kann, muss das Produkt so gebaut sein, dass eine Maschine es kann — und dass Dritte die Maschine prüfen können.",
      ],
      check: [{ label: "Was die Technik heute kann, mit Zahlen", segment: "technology" }],
      sources: ["akerlof"],
    },
    {
      id: "variety",
      title: "Eine Mundart ist Daten, nicht Code",
      body: [
        "Alles Zürcher an diesem Produkt steht in einer Datei: im Varietäten-Pack. Die Formen, die Regeln, die Grammatikthemen, der Wortschatz, die Artikel, die Lautentsprechungen — und wer für jede Angabe geradesteht. Kein anderes Modul kennt eine Schweizer Tatsache.",
        "Das klingt nach Ordnungsliebe und ist eine Aussage über Ehrlichkeit. Wenn die Sprache in einer prüfbaren Datei liegt, kann eine Gutachterin an einem Nachmittag alles lesen, was das Produkt über Zürichdeutsch behauptet — und eine Muttersprachlerin kann anstreichen, was falsch ist, ohne eine Zeile Code zu lesen.",
        "Der Beweis, dass die Naht echt ist: Im selben Repository liegt ein ukrainisches Pack, und nichts daran ist schweizerisch. Berndeutsch dazuzunehmen ist ein Pack und ein Tag, kein Umbau.",
      ],
      check: [
        { label: "Jedes Dialektgebiet, und worauf jede Aussage beruht", segment: "dialect" },
        { label: "Die Grammatik, als Formen mit Quellen", segment: "grammar" },
      ],
    },
    {
      id: "gate",
      title: "Ein deterministisches Gate, vor dem Modell",
      body: [
        "Jede Zeile, die ein Modell erzeugt, läuft durch eine regelbasierte Prüfung, bevor sie jemand sieht. Die Prüfung ist kein Modell: Sie ist die Liste der Formen anderer Mundarten aus dem Pack, als Code angewendet, mit einer Schwelle. Eine auffällige Zeile wird markiert und nicht stillschweigend entfernt — so bleibt Abdrift sichtbar, statt zu unsichtbarer Kuratierung zu werden.",
        "Drei weitere Wächter stehen daneben, und jeden gibt es wegen eines konkreten Vorfalls. Eine Lautentsprechung darf nur zitiert werden, wenn das Pack sie kennt — nach der Zürcher Bar «Im Kauz» gefragt, erklärte ein Modell, «Kauz» sei ein Tippfehler, und lieferte ein erfundenes Lautgesetz zur Begründung mit. Ein Wort, das mit sich selbst erklärt wird, fällt weg, weil das Modell wiederholt erklärte, «freundlich» heisse «freundlich». Und eine kreisende Antwort wird verworfen, nachdem ein Gratismodell auf eine Wortfrage antwortete: «verbi» ist ein Kurzwort für «verbi» = «verbi» — flüssig, sauber interpunktiert und leer.",
        "Die Grenze steht da, statt verschwiegen zu werden: Die Wächter fangen erfundene REGELN und leere Form, aber keinen einzelnen erfundenen Fakt. Die falsche Bedeutung von «Kauz» kommt weiterhin durch. Das zu schliessen braucht ein Zürcher Lexikon zum Abgleichen und ist die nächste linguistische Arbeit — nicht etwas, das wir als erledigt andeuten.",
      ],
      check: [{ label: "Die Regeln, die das Gate durchsetzt", segment: "method" }],
    },
    {
      id: "refuse",
      title: "Ein Register der Überbehauptungen, öffentlich geführt",
      body: [
        "Die Spezifikation führt eine Liste von Sätzen, die dieses Produkt nicht sagen darf, und die Liste wird durchgesetzt statt erinnert. Keine Serien, keine Punkte, keine Level, kein Fortschritt in Prozent, kein Tagesziel, keine Note für die Aussprache, kein Versprechen, Mundart zu transkribieren.",
        "Jede dieser Ablehnungen hat einen Grund, der eine Diskussion übersteht. Eine Serie misst, wie viel Heidi jemand konsumiert hat, und sieht dabei genau aus wie ein Mass für Gelerntes — das Mass, auf das es ankommt, ist, wie viel von einer unbekannten Zürcher Sprecherin jemand versteht. Eine Aussprachenote wäre eine Behauptung über einen Menschen, die heute niemand ehrlich aufstellen kann; deshalb zeigt die Sprechseite, wie lange gesprochen wurde und wo die Pausen lagen. Das sind Tatsachen über eine Aufnahme.",
        "Ablehnungen sind billig zu schreiben und teuer zu halten. Darum stehen sie dort, wo sie etwas kosten: auf dem Fahrplan, neben den Plänen, wo beides zugleich zu sehen ist.",
      ],
      check: [
        { label: "Was nie gebaut wird, und warum", segment: "roadmap" },
        { label: "Sich aufnehmen und sehen, was gemessen wird", segment: "speaking" },
      ],
    },
    {
      id: "privacy",
      title: "Das Gerät behält, was es behalten kann",
      body: [
        "Gemerkte Wörter, ihr Wiederholungsplan, die Aufnahmen und deren Messwerte liegen im Browser. Nicht als Richtlinie, die man ändern könnte — als Architektur, in der der Server sie nie bekommen hat.",
        "Wo Ton das Gerät doch verlässt, geschieht das zu einem genannten Zweck, gesagt auf demselben Bildschirm statt in einer Datenschutzseite, und nur für die Varietät, bei der Transkription ehrlich ist. Auf Züritüütsch wird gar nichts gesendet, weil kein System diese Mundart zuverlässig aufschreibt und alles andere genau die Überbehauptung wäre, die das Register verbietet.",
        "Eine Aufnahme, die das Produkt selbst als zu kurz oder zu leise einstuft, wird ebenfalls nicht hochgeladen. Diesen Wächter gibt es, weil ein Transkriptionsmodell bei Ton ohne Sprache nicht nichts zurückgibt, sondern etwas Plausibles.",
      ],
      check: [{ label: "Was gespeichert wird, und wo", segment: "privacy" }],
    },
    {
      id: "check",
      title: "Wie man das alles an einem Nachmittag prüft",
      body: [
        "Lesen Sie das Varietäten-Pack; es ist eine Datei und enthält alles, was wir über Zürichdeutsch behaupten. Lesen Sie die Technikseite und halten Sie unsere Aussagen gegen die veröffentlichten Wortfehlerraten — die beste nachprüfbare Zahl liegt bei 12,1 %, und diese Gewichte sind nicht veröffentlicht.",
        "Und dann benutzen Sie das Produkt an etwas, das wir nicht kontrollieren: Fügen Sie eine Nachricht einer echten Zürcher Sprecherin ein und sehen Sie, ob die Erklärung trägt. Das ist die Messung, auf die es ankommt, und die einzige, die wir nicht inszenieren können.",
        "Was wir dafür erbitten, ist die Korrektur. Die Situationen wurden für dieses Produkt geschrieben und maschinell auf Zürcher Formen geprüft; gegengelesen hat sie noch keine Muttersprachlerin — die Seiten schreiben das selbst hin. Wenn Sie von hier sind und eine Zeile stimmt nicht, ist das das Wertvollste, was uns jemand schicken kann.",
      ],
      check: [
        { label: "Die Änderungen, samt dem, was kaputt war", segment: "changelog" },
        { label: "Eine Korrektur schicken", segment: "contribute" },
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
