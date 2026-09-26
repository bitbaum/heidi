/**
 * The data room, as data.
 *
 * WHY THIS FILE IS IN A PUBLIC REPOSITORY, AND WHAT THAT MEANS. `bitbaum/heidi`
 * is MIT and public. Everything here is world-readable whether or not the page
 * asks for a password, so nothing goes in that would harm anyone if read by a
 * stranger: no financials, no cap table, no personal circumstances, no names of
 * people who have not agreed to be named. The password keeps the page from
 * being stumbled upon and indexed. It is not a secret store, and treating it as
 * one would be the most expensive mistake available here.
 *
 * WHY IT IS IN ENGLISH ONLY. The rest of the site is seven languages because
 * its readers are learners in Switzerland. This is one document for one kind of
 * conversation, and a pitch translated seven ways by a machine is seven
 * documents nobody has checked. The chrome around it stays localised.
 *
 * THE RULE THAT SHAPES EVERY LINE, revised 2026-09-25. Nothing is claimed that
 * is not true today and checkable by the reader, and nothing is inflated — a
 * founder caught inflating one number has told an investor what the others
 * are worth. Within that, the page leads with what EXISTS and where it is
 * GOING. It used to lead with absences ("customers: none", "what is wrong
 * with it", "what money would buy"); George's direction is that this is a
 * company building something, and it reads as one. Omitting a figure is not
 * claiming it — revenue, users and capital simply are not metrics here yet.
 */

/** A figure a reader can verify themselves, and where. */
export type Metric = {
  label: string;
  value: string;
  /** How to check it. A metric without this is an assertion. */
  verify: string;
};

/**
 * WHEN THESE WERE COUNTED — and it belongs on the page, not in this comment.
 *
 * It used to live only here. So a reader saw "65 merged pull requests" with
 * nothing saying when, and five days later the true figure was 92. An undated
 * number on a page whose entire argument is "every claim has a URL" is the
 * worst kind of wrong: quietly stale, in a document asking to be trusted
 * specifically about numbers.
 *
 * Dated, a stale figure is merely old. Undated, it is false.
 */
export const METRICS_READ_ON = "25 September 2026";

/**
 * The advertised test-file count, as a number the build can check.
 *
 * Parsing it back out of the string below would be a regex over prose. Said
 * once here and rendered into that string, it is the same fact in the place a
 * test can reach — see `investors.test.ts`, which fails when the claim starts
 * OVERSTATING what is in the repository.
 *
 * Declared ABOVE `METRICS` so the string can actually use it. It used to sit
 * below, where a reference would hit the temporal dead zone — so the string
 * carried its own literal copy of the number, and "said once" was false.
 */
export const ADVERTISED_TEST_FILES = 103;

/** Counts read from the repository, not estimated — each with how to check it. */
export const METRICS: readonly Metric[] = [
  { label: "Live at", value: "heidi.orangecat.ch", verify: "Open it." },
  { label: "Built since", value: "10 September 2026", verify: "git log" },
  { label: "Merged pull requests", value: "119", verify: "github.com/bitbaum/heidi/pulls" },
  { label: "Automated tests", value: `842 across ${ADVERTISED_TEST_FILES} files`, verify: "pnpm verify" },
  // The speech engine moved into its own open-source package, and its tests
  // went with it — counted there rather than quietly dropped from this page.
  {
    label: "Speech engine, open source",
    value: "@bitbaum/speechkit — 94 tests",
    verify: "github.com/bitbaum/speechkit",
  },
  { label: "Interface languages", value: "7", verify: "The language switcher." },
  { label: "Situations, with per-situation mastery", value: "19", verify: "/situations" },
  { label: "Vocabulary entries", value: "164", verify: "/vocabulary" },
  { label: "Practice questions", value: "1533", verify: "/practice" },
  { label: "Dialect areas mapped", value: "11", verify: "/dialect" },
];


export type Section = {
  id: string;
  title: string;
  body: readonly string[];
  /** Pages on this site that demonstrate the claim rather than describe it. */
  links?: readonly { label: string; href: string }[];
};

export const SECTIONS: readonly Section[] = [
  {
    id: "problem",
    title: "The trap",
    body: [
      "An adult moves to Zurich with good German and cannot follow a lunch table. The mechanism that would fix that is exposure — and the environment withdraws exposure precisely when it detects they need it. The Swiss switch to Hochdeutsch or English the moment they notice you struggling.",
      "So the learner is denied the input because they are a learner. That sentence is the entire reason a product is justified here rather than a recommendation to watch local television.",
      "The second consequence is commercially the interesting one: the learner cannot audit what they are sold. They are buying Zurich German because they do not know Zurich German. Hand them Bernese forms and they will never find out. That is a lemons market, and it is why the deterministic checks in this product exist at all.",
    ],
  },
  {
    id: "built",
    title: "What exists today",
    body: [
      "A working assistant, in seven interface languages, that decodes a real message someone was sent, explains the words that blocked it, and writes a reply the reader can send — then offers, in one tap, what to learn from it next. It reaches every page, streams its answer, and can be stopped mid-sentence.",
      "A learning system built on situations: nineteen of them, from the tram and the Gemeinde to a care-home handover, each measured line by line, so a learner can say — and check — \"I understand Swiss German at the doctor's\". Practice in fifteen kinds of question, a test mode, spaced review of the learner's own words, and an explanation after every answer.",
      "Around it: a dialect atlas of eleven areas, a grammar reference, a vocabulary of 164 entries including the false friends a German reader gets wrong and slang marked by register, and study groups.",
      "All of it is MIT-licensed and public. An investor can read every line, run the tests, and check every claim on this page without asking us for anything.",
    ],
    links: [
      { label: "The assistant", href: "/de" },
      { label: "Situations", href: "/de/situations" },
      { label: "Dialect atlas", href: "/de/dialect" },
      { label: "Source", href: "https://github.com/bitbaum/heidi" },
    ],
  },
  {
    id: "engine",
    title: "The part that is not about Swiss German",
    body: [
      "The language being taught is DATA, not code. A variety pack carries the forms, the correspondences, the grammar topics, the vocabulary and the rules a checker enforces; the engine names no language anywhere, and the model's instructions are generated from the pack.",
      "This is not a claim about a future refactor. There is a second pack in the repository — Ukrainian — and it exists precisely to keep the abstraction honest: a contract with one implementation is a guess. It has already broken the contract twice and forced two fields that Swiss German alone would never have revealed.",
      "One of those fields is the interesting one for anybody thinking about the next market. A Russian-speaking Ukrainian has understood Ukrainian since school; their gap is production, not comprehension — so a listening-first product is the wrong shape for them, and the engine now reads the learner's priority from the pack instead of assuming Zurich's answer.",
      "That is the difference between a Swiss German app and a platform for languages people need in order to belong somewhere: Romansh, Ukrainian, Catalan, Basque, Welsh, Irish. The engine is already shaped for it; the packs are the work.",
    ],
    links: [{ label: "How the variety layer works", href: "/de/method" }],
  },
  {
    id: "market",
    title: "Two kinds of customer, one product",
    body: [
      "Individuals: people who moved here and want to follow the conversation around them. Free to start; Heidi Pro adds unlimited chat, certificates and progress on every device.",
      "Organisations: care homes and home-care services, hospitals recruiting doctors and nurses from Germany, relocation firms, employers of international staff, and cantonal integration programmes. They buy seats, situation packs for their own workplace, and per-situation certificates.",
      "Why situations sell: an employer cannot judge a language level, but it can judge whether someone can follow a ward round. Heidi's unit of learning — the situation — is the unit an employer already thinks in. The first workplace pack, six care-home situations, is already in the product.",
    ],
    links: [
      { label: "For organisations", href: "/de/organisations" },
      { label: "The care-home situations", href: "/de/situations" },
    ],
  },
  {
    id: "speech",
    title: "Speech and the technology position",
    body: [
      "Dictation is live: a learner says what they want to say and Heidi writes it down. The listening lab — many different Zurich voices, the best-evidenced way to learn to understand a new dialect — is next, built on the newest speech models.",
      "Swiss German speech data is scarce, and most of it is licensed for research only. Heidi keeps a public, cited map of which corpora and models can be used commercially — which is exactly the knowledge a competitor would have to rebuild before shipping anything with a voice.",
    ],
    links: [{ label: "What the field can do, with citations", href: "/de/technology" }],
  },
  {
    id: "direction",
    title: "Where it goes",
    body: [
      "Next: streaks and weekly goals, a dialect detector that tells anyone where a sentence comes from, deeper situations and new ones, Heidi for Teams, per-situation certificates, and progress that follows a learner across devices.",
      "The public roadmap carries the order and the reasoning, and learners can weigh in on it directly.",
    ],
    links: [{ label: "The roadmap", href: "/de/roadmap" }],
  },
  {
    id: "verify",
    title: "How to check all of this",
    body: [
      "Open the site and paste a real Swiss German message into it. Read the source. Run the test suite. Every number on this page has a command or a URL beside it.",
      "If something here turns out to be overstated, that is a defect and we would like to hear about it — the project keeps a written register of claims it must not make, for exactly this reason.",
    ],
    links: [
      { label: "Source", href: "https://github.com/bitbaum/heidi" },
      { label: "How it is built, and how to check it", href: "/de/paper" },
      { label: "What changed, including what was broken", href: "/de/changelog" },
    ],
  },
];
