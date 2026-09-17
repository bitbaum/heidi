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
 * THE RULE THAT SHAPED EVERY LINE. Nothing claimed that is not true today and
 * checkable by the reader. No users, no revenue, no pilots, no team, no
 * traction — because there are none, and a founder caught inflating one number
 * has just told an investor what the other numbers are worth. What replaces
 * traction here is that every claim has a URL.
 */

/** A figure a reader can verify themselves, and where. */
export type Metric = {
  label: string;
  value: string;
  /** How to check it. A metric without this is an assertion. */
  verify: string;
};

/**
 * Counts read from the repository on 2026-09-17, not estimated.
 *
 * Deliberately unimpressive where the truth is unimpressive: one contributor,
 * no revenue, no users. A data room whose first section quietly omits those is
 * the one an investor stops believing at the second meeting.
 */
export const METRICS: readonly Metric[] = [
  { label: "Live at", value: "heidi.orangecat.ch", verify: "Open it." },
  { label: "First commit", value: "10 September 2026", verify: "git log" },
  { label: "Merged pull requests", value: "65", verify: "github.com/bitbaum/heidi/pulls" },
  { label: "Automated tests", value: "400+ across 45 files", verify: "pnpm verify" },
  { label: "Interface languages", value: "7", verify: "The language switcher." },
  { label: "Dialect areas mapped", value: "11", verify: "/dialect" },
  { label: "Paying customers", value: "none", verify: "Stated plainly." },
  { label: "Revenue", value: "none", verify: "Stated plainly." },
  { label: "Outside capital raised", value: "none", verify: "Stated plainly." },
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
      "A working assistant, in seven interface languages, that decodes a real message someone was sent, explains the words that blocked it, and writes a reply the reader can send. It reaches every page of the site, keeps a conversation without an account, and streams its explanation as it is written.",
      "Around it: a dialect atlas of eleven areas, a grammar reference, a vocabulary list wired into spaced review, study groups, and a page documenting what Swiss German language technology can and cannot currently do.",
      "All of it is MIT-licensed and public. An investor can read every line, run the tests, and check every claim on this page without asking us for anything.",
    ],
    links: [
      { label: "The assistant", href: "/de" },
      { label: "Dialect atlas", href: "/de/dialect" },
      { label: "What the field can do", href: "/de/technology" },
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
    id: "voice",
    title: "Voice: the honest position",
    body: [
      "Heidi does not speak, and the listening lab is not built. The product today reads and writes; it does not yet measure what it says it measures, which is how much of an unfamiliar Zurich speaker a learner understands.",
      "Dictation exists and goes the other way — it writes down what the learner wants to SAY, in the language they already have. It does not transcribe dialect, and no honest product currently claims to.",
      "Why this matters and why it is hard is documented publicly rather than hidden: almost every Swiss German speech corpus pairs dialect speech with STANDARD GERMAN text, because in a diglossic country writing down what was said is a translation task. Most voices sold as Swiss German are Swiss Standard German read aloud.",
      "So the bottleneck for voice is not compute. It is licensing and recordings: the public corpora are almost all research-only, the best published recogniser does not release its weights, and the one permissively licensed corpus is a cantonal parliament. Buying GPUs before solving that would be buying the wrong thing.",
    ],
    links: [{ label: "The evidence, with citations", href: "/de/technology" }],
  },
  {
    id: "limits",
    title: "What is wrong with it",
    body: [
      "The dialect checker is a blacklist, not a validator. It catches about seven known foreign markers — Bernese, Basel, Eastern Swiss forms — and confirms nothing. An English sentence passes it. It is the right tool for the failure it was built for, and it must not be sold as verification.",
      "The Zurich rules have never been reviewed by a native Zurich speaker. The project's own canonical document says a native panel is required before generated dialect reaches a learner, and that condition is not met.",
      "There is no learner model and no audio, so the core promise is currently unmeasured.",
      "There is no data-processing agreement with any model vendor, which means Heidi is not suitable today for data covered by professional confidentiality — including anything from a care setting.",
      "Reading a picture requires the reader to bring their own API key.",
    ],
    links: [{ label: "What we refuse to claim", href: "/de/privacy" }],
  },
  {
    id: "money",
    title: "What money would buy, in order",
    body: [
      "A native Zurich panel, and the before-and-after measurement the product is named for. Until that exists there is no evidence, only a plausible story.",
      "Licensed recordings and the consent to use them. This is the real gate on voice, and it is bought with contracts and speakers rather than hardware.",
      "The second and third variety packs, chosen where the need is integration rather than tourism.",
      "Only then: compute. A GPU is the cheapest item on this list and the last one that becomes the constraint.",
    ],
  },
  {
    id: "verify",
    title: "How to check all of this",
    body: [
      "Open the site and paste a real Swiss German message into it. Read the source. Run the test suite. Every number on this page has a command or a URL beside it.",
      "If something here turns out to be overstated, that is a defect and we would like to hear about it — the project keeps a written register of claims it must not make, for exactly this reason.",
    ],
    links: [{ label: "Source", href: "https://github.com/bitbaum/heidi" }],
  },
];
