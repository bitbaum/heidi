/**
 * The organisations that have this problem on somebody else's behalf.
 *
 * WHY A PAGE AT ALL. Every learner Heidi has is one person solving their own
 * problem. These are the places where the SAME problem is somebody's operating
 * risk, training budget or legal duty — and where the person who suffers it is
 * usually not the person who can buy the fix. A care assistant does not
 * procure software; a Heimleitung does.
 *
 * THE RULE THIS FILE INHERITS, from `investors.ts`, and it matters more here
 * because sales copy is where it is hardest to keep: NOTHING CLAIMED THAT IS
 * NOT TRUE TODAY. There are no customers, no pilots, no case studies and no
 * testimonials, because there are none of those things. `no-clients` is a
 * standing rule of this studio: what exists publicly is Pilots and Concepts,
 * and calling anything else a client is a lie.
 *
 * So the page does the one honest thing available to a product with no
 * customers, which is also the thing that actually opens a conversation with
 * an institution: describe the MOMENT their problem happens, in enough detail
 * that a reader who lives it recognises it, and then ask whether we have it
 * right. `unknown` on every row is not modesty — it is the question that turns
 * a page into a meeting.
 *
 * WHY THIS ONE PAGE IS NOT IN SEVEN LANGUAGES. The site is seven because its
 * readers are learners from everywhere. The reader here is a Swiss institution,
 * and Swiss institutions run in German — with English as the second language of
 * every HR department in Zurich. Seven machine-checked translations of a sales
 * argument nobody has reviewed would be six liabilities. The chrome around it
 * stays localised, exactly as the data room does.
 */

export type SectorId =
  | "care"
  | "hospitals"
  | "schools"
  | "languageSchools"
  | "relocation"
  | "employers";

export type Copy = { de: string; en: string };

export type Sector = {
  id: SectorId;
  name: Copy;
  /**
   * The specific moment the problem happens.
   *
   * A scene, not a benefit. "Improve communication" is what every vendor says
   * and describes nothing; a reader who has stood in the room recognises the
   * room. This is the only field that has to be vivid, and it is the one that
   * decides whether the rest gets read.
   */
  moment: Copy;
  /** What it costs them — the reason it is a budget line and not a wish. */
  stake: Copy;
  /** What Heidi actually does about it today. Present tense, no roadmap. */
  offer: Copy;
  /**
   * What we would have to learn from them before promising anything.
   *
   * Every row has one, and they are real questions rather than rhetorical
   * ones. A product with no customers that writes as though it has them is
   * making the single most expensive mistake available to it.
   */
  unknown: Copy;
  /** A verifiable fact, where one exists. Not every sector has one. */
  fact?: { text: Copy; source: string };
  /**
   * A page on this site where the offer above can be READ before anybody
   * talks to us. A route segment below the locale, or absent.
   *
   * WHY IT EXISTS. This file's own rule is that nothing is claimed that is not
   * true today, and the `care` row broke it for months: it said Heidi
   * "practises the sentences that are actually said on your ward" when the
   * product held forty-eight words, none of which was said on a ward. The
   * claim was not corrected by softening the sentence — it was corrected by
   * building the thing and pointing at it.
   *
   * So a row with proof links to it, and a row without one simply has no link.
   * That asymmetry is the most useful thing on the page: a reader can see
   * exactly which of the six we have built for and which are still a
   * description of their problem.
   */
  proof?: { segment: string; label: Copy };
};

export const SECTORS: readonly Sector[] = [
  {
    id: "care",
    name: { de: "Alters- und Pflegeheime", en: "Care and nursing homes" },
    moment: {
      de: "Eine Bewohnerin mit Demenz verliert ihre Zweitsprachen zuerst. Am Ende bleibt das Züritüütsch ihrer Kindheit. Die Pflegefachfrau im Spätdienst ist vor zwei Jahren aus Lissabon gekommen und hat Hochdeutsch gelernt — nicht dieses.",
      en: "A resident with dementia loses her second languages first. What is left is the Zurich German of her childhood. The carer on the late shift arrived from Lisbon two years ago and learned Standard German — not that.",
    },
    stake: {
      de: "Das ist keine Komfortfrage. Wer nicht verstanden wird, wird falsch eingeschätzt: Schmerz wird zu Unruhe, ein Wunsch wird zu Widerstand.",
      en: "This is not a comfort question. Somebody who is not understood is misread: pain becomes agitation, a request becomes resistance.",
    },
    /**
     * REWRITTEN THE DAY THE CONTENT EXISTED, and the old sentence is worth
     * recording: "sie übt genau die Sätze, die auf Ihrer Abteilung wirklich
     * fallen" — practises the sentences actually said on your ward. That was
     * false in two ways at once. There were no ward sentences in the product
     * at all, and even now that there are sixty, they are lines we WROTE for
     * six scenes of a shift, checked by the dialect gate, not lines anybody
     * recorded on your corridor.
     *
     * What replaces it says what is there, names the number, and sends the
     * reader to read it. A Heimleitung can judge the content herself in two
     * minutes, which is a better argument than any sentence here could be.
     */
    offer: {
      de: "Heidi übersetzt und erklärt Mundart — auf dem Handy, im Gang, in Sekunden. Dazu sechs Szenen aus einer Schicht — Übergabe, Morgen, Schmerz, Essen, Abend, Besuch — mit rund sechzig Sätzen, maschinell auf Zürcher Formen geprüft. Lesen Sie sie, bevor Sie mit uns reden.",
      en: "Heidi translates and explains dialect — on a phone, in the corridor, in seconds. Plus six scenes from a shift — handover, the morning, pain, meals, the evening, visitors — around sixty lines, machine-checked for Zurich forms. Read them before you talk to us.",
    },
    proof: {
      segment: "situations",
      label: { de: "Die sechs Szenen ansehen", en: "Read the six scenes" },
    },
    unknown: {
      de: "Wir wissen nicht, ob Ihr Personal in diesem Moment ein Handy in der Hand haben darf. Das entscheidet alles am Ablauf. Und keine dieser Zeilen ist bisher von einer Muttersprachlerin gegengelesen — das steht auch auf der Seite selbst.",
      en: "We do not know whether your staff may hold a phone at that moment. That decides everything about how this would work. And no native speaker has yet read those lines — which the page itself also says.",
    },
  },
  {
    id: "hospitals",
    name: { de: "Spitäler und Notaufnahmen", en: "Hospitals and emergency care" },
    moment: {
      de: "Bei der Triage antwortet eine Patientin auf die Schmerzfrage — im Dialekt, weil Schmerz keine Fremdsprache spricht. Der Assistenzarzt hat in Heidelberg studiert.",
      en: "At triage a patient answers the question about her pain — in dialect, because pain does not speak a second language. The junior doctor trained in Heidelberg.",
    },
    stake: {
      de: "Missverständnisse in der Anamnese sind ein dokumentiertes klinisches Risiko, kein Servicethema.",
      en: "Misunderstanding a patient history is a documented clinical risk, not a service issue.",
    },
    offer: {
      de: "Verstehen zuerst: was gesagt wurde, sofort und nachlesbar. Kein Ersatz für professionelles Dolmetschen — der Fall davor, der heute gar nicht abgedeckt ist.",
      en: "Understanding first: what was said, immediately and re-readable. Not a substitute for professional interpreting — the case before that, which today is covered by nothing.",
    },
    unknown: {
      de: "Ob so etwas in Ihrem Setting überhaupt zulässig ist, bevor es nützlich wäre. Das ist Ihre Frage, nicht unsere.",
      en: "Whether this is permissible in your setting at all, before it could be useful. That is your question, not ours.",
    },
  },
  {
    id: "schools",
    name: { de: "Schulen und Kindergärten", en: "Schools and kindergartens" },
    moment: {
      de: "Der Kindergarten im Kanton Zürich wird auf Mundart geführt — so hat es die Stimmbevölkerung 2011 beschlossen. Am Elternabend merken die Eltern, dass sie nicht der Sprache ihres Kindes folgen können, sondern der ihres Lehrplans.",
      en: "Kindergarten in the canton of Zurich is conducted in dialect — the electorate decided that in 2011. At the parents' evening the parents discover they cannot follow their own child's school language.",
    },
    stake: {
      de: "Eltern, die den Elternabend nicht verstehen, erscheinen als Eltern, die sich nicht interessieren. Das ist derselbe Irrtum wie in der Pflege, nur mit anderen Folgen.",
      en: "Parents who cannot follow the parents' evening look like parents who are not interested. That is the same misreading as in care, with different consequences.",
    },
    offer: {
      de: "Mundart verstehen für Eltern — und für neu zugezogene Lehrpersonen, die in derselben Lage sind und es seltener sagen.",
      en: "Dialect comprehension for parents — and for newly arrived teachers, who are in the same position and say so less often.",
    },
    unknown: {
      de: "Ob so etwas von der Schule kommen sollte oder von der Gemeinde. Wir vermuten Letzteres und haben es nie geprüft.",
      en: "Whether this should come from the school or from the municipality. We suspect the latter and have never checked.",
    },
    fact: {
      text: {
        de: "2011 nahm die Zürcher Stimmbevölkerung die Initiative «JA zur Mundart im Kindergarten» mit rund 54 Prozent an; seit August 2012 ist Mundart dort grundsätzlich Unterrichtssprache.",
        en: "In 2011 Zurich voters passed the initiative «YES to dialect in kindergarten» with about 54 per cent; since August 2012 dialect has been the kindergarten language of instruction.",
      },
      source: "https://www.zh.ch/de/news-uebersicht/medienmitteilungen/2011/11/311_unterrichtssprache.html",
    },
  },
  {
    id: "languageSchools",
    name: { de: "Sprachschulen", en: "Language schools" },
    moment: {
      de: "Ihre Kursteilnehmerin besteht B2 und versteht am Mittagstisch trotzdem nichts. Sie glaubt, das liege an ihr.",
      en: "Your student passes B2 and still understands nothing at the lunch table. She concludes it is her fault.",
    },
    stake: {
      de: "Es liegt nicht an ihr und nicht an Ihrem Unterricht — sie hat die andere Sprache gelernt. Aber erklärt hat es ihr niemand, und der Frust landet bei Ihnen.",
      en: "It is not her fault and not your teaching — she learned the other language. But nobody told her that, and the disappointment lands with you.",
    },
    offer: {
      de: "Der Dialektteil, den kein Hochdeutsch-Lehrmittel abdeckt, als Ergänzung statt als Konkurrenz. Wir unterrichten kein Hochdeutsch und haben es nicht vor.",
      en: "The dialect half no Standard German course covers, as a complement rather than a competitor. We do not teach Standard German and do not intend to.",
    },
    unknown: {
      de: "Ob Sie so etwas lieber weiterverkaufen oder empfehlen. Das ändert das ganze Modell.",
      en: "Whether you would rather resell this or recommend it. That changes the entire model.",
    },
  },
  {
    id: "relocation",
    name: { de: "Relocation-Firmen", en: "Relocation firms" },
    moment: {
      de: "Sie übergeben Schlüssel, Versicherung und Steuererklärung. Was als Erstes bricht, ist das Gespräch mit der Hauswartin.",
      en: "You hand over the keys, the insurance and the tax form. The first thing that breaks is the conversation with the caretaker.",
    },
    stake: {
      de: "Sie haben den Kunden im Moment der höchsten Aufmerksamkeit — und genau dann endet Ihr Leistungskatalog, wo das eigentliche Problem beginnt.",
      en: "You have the client at the moment of highest attention — and that is exactly where your service catalogue ends and the real problem starts.",
    },
    offer: {
      de: "Etwas, das Sie am ersten Tag mitgeben können und das in Woche drei noch benutzt wird.",
      en: "Something you can hand over on day one that is still being used in week three.",
    },
    unknown: {
      de: "Was Sie heute stattdessen mitgeben. Wenn es funktioniert, ist diese Seite falsch.",
      en: "What you hand over instead today. If it works, this page is wrong.",
    },
  },
  {
    id: "employers",
    name: { de: "Arbeitgeber mit internationalen Teams", en: "Employers with international teams" },
    moment: {
      de: "Die Sitzung läuft auf Englisch. Sobald sie informell wird, kippt sie in den Dialekt — und informell ist der Moment, in dem entschieden wird.",
      en: "The meeting runs in English. The moment it turns informal it switches to dialect — and informal is when things get decided.",
    },
    stake: {
      de: "Wer den Teil nicht hört, sitzt dabei und ist nicht dabei. Das ist eine Frage von Beförderung und Verbleib, nicht von Wohlbefinden.",
      en: "Somebody who cannot follow that part is present without taking part. That is a question of promotion and retention, not of wellbeing.",
    },
    offer: {
      de: "Verstehen, ohne dass der Raum auf Hochdeutsch wechseln muss — genau die Rücksicht, die §2 als Falle beschreibt.",
      en: "Understanding without the room having to switch to Standard German — the very courtesy §2 describes as the trap.",
    },
    unknown: {
      de: "Ob das HR kauft oder ein Team. Wir haben beides noch nie gefragt.",
      en: "Whether HR buys this or a team does. We have never asked either.",
    },
  },
];

/** The two languages this page is written in. See the header for why. */
export type SectorLocale = "de" | "en";

/**
 * Which of the two to show a reader.
 *
 * German for the German-speaking locales including the dialect one, English for
 * everyone else — a French-speaking reader in Zurich is far likelier to want
 * the English sales argument than a machine-translated French one.
 */
export function sectorLocale(locale: string): SectorLocale {
  return locale === "de" || locale === "gsw" ? "de" : "en";
}

/**
 * What this page must never say, kept as data so a test can enforce it.
 *
 * Sales copy is where "nothing untrue" is hardest to hold — every one of these
 * is a phrase that would write itself into a B2B page and every one would be
 * false today.
 */
export const FORBIDDEN_CLAIMS: readonly string[] = [
  "our customers",
  "unsere Kunden",
  "case study",
  "Fallstudie",
  "trusted by",
  "vertrauen auf",
  "proven",
  "bewährt",
  "clients",
  "Referenzen",
];
