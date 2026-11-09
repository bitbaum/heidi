import type { PracticeItem } from "../types.ts";

/**
 * WHAT EACH KIND OF QUESTION TESTS — one table, typed against the kinds.
 *
 * A `Record` keyed by every `PracticeItem["kind"]`, so a kind added to the
 * union and missing here is a type error, not a question that tests nothing.
 * The skill is what the learner's progress is reported by ("verb forms",
 * "articles" …); the rung is the ladder in `model.ts` (recognise a line before
 * producing it). Both used to live in nobody's table; the rung was a second
 * list of kind names inside `model.ts`.
 */
export type Skill = "understand" | "words" | "forms" | "articles" | "sounds" | "produce";

/** In the order a page shows them: understanding first, as the product argues. */
export const SKILLS = ["understand", "words", "sounds", "forms", "articles", "produce"] as const satisfies readonly Skill[];

export type Rung = "recognise" | "produce";

export const KIND_META: Record<PracticeItem["kind"], { skill: Skill; rung?: Rung }> = {
  // Understanding what was said.
  verify: { skill: "understand", rung: "recognise" },
  gist: { skill: "understand", rung: "recognise" },
  reply: { skill: "understand", rung: "recognise" },
  clock: { skill: "understand" },
  // Knowing the words.
  meaning: { skill: "words", rung: "recognise" },
  pick: { skill: "words" },
  match: { skill: "words" },
  card: { skill: "words" },
  recall: { skill: "words" },
  cloze: { skill: "words" },
  gaptext: { skill: "words" },
  // The sound rules: which form is Zurich and which is German.
  pair: { skill: "sounds" },
  // Grammar a German speaker gets wrong.
  form: { skill: "forms" },
  auxiliary: { skill: "forms" },
  article: { skill: "articles" },
  // Saying it yourself.
  build: { skill: "produce", rung: "produce" },
  translate: { skill: "produce", rung: "produce" },
  transform: { skill: "produce", rung: "produce" },
};
