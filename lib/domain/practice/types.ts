/**
 * Practice — the part where the learner is asked rather than shown.
 *
 * WHY THIS IS NOT A GAME, AND WHY IT IS STILL MEANT TO BE ENJOYABLE.
 *
 * `review.ts` already refuses streaks, points and days-active, and it is right
 * to: §8's rule is that the product measures how much of an unfamiliar Zurich
 * speaker you understand, and a streak measures how much Heidi you consumed
 * while looking like it measures learning. Nothing here adds a score.
 *
 * But "not gamified" was never the same claim as "not enjoyable". What makes
 * this worth opening is meant to come from the design rather than from points:
 * sessions short enough to finish, items that vary so the next one is not the
 * last one again, material that is the learner's OWN — words they kept from
 * their own messages — and an answer that arrives immediately. Those are the
 * things the evidence in `review.ts` already supports; a leaderboard is not.
 *
 * THE TWO KINDS OF MARKING, AND WHY THE SPLIT IS PRINCIPLED.
 *
 * `objective` — the item has a right answer that this product can prove. Only
 *   one kind qualifies: choosing between a Zurich form and a form from another
 *   dialect, because the deterministic gate already defines which is which and
 *   the rule that generated the item is the same rule the checker enforces. No
 *   model is asked, so no model can be wrong.
 *
 * `self` — the learner says whether they knew it. Everything involving
 *   spelling or production is marked this way, and that is not laziness. Zurich
 *   German has no standard orthography (§6), so marking a typed answer means
 *   deciding whether a near-miss counts — and getting that wrong tells a
 *   learner they were wrong when they were not, in a variety where nobody can
 *   tell them otherwise. `ReviewPanel` already made this argument for words;
 *   it holds identically for a grammar form.
 *
 * Anything that would need a model to mark it is simply not an exercise type.
 */

/** Where an item came from, so a wrong one can be traced to its source. */
export type ItemSource =
  /** A rule in the variety pack — the same list the gate enforces. */
  | { kind: "rule"; rule: string }
  /** A grammar topic in the pack. Carries the id so the page can link to it. */
  | { kind: "grammar"; topic: string }
  /** A word the learner kept themselves. */
  | { kind: "saved" }
  /** A vocabulary entry in the pack, with the source that vouches for it. */
  | { kind: "word"; word: string };

/**
 * Which one is the Zurich form?
 *
 * The flagship item, and the only objective one. Generated from a pack rule
 * that names both a foreign form and the Zurich form it should have been —
 * `nid` → `nöd`, `güet` → `guet` — so the answer is defined by the checker
 * rather than by anybody's opinion.
 *
 * It also happens to train the exact discrimination the product exists for: a
 * learner who cannot tell Bernese from Zurich German is the person §2
 * describes, and this is the only exercise that measures it directly.
 */
export type PairItem = {
  id: string;
  kind: "pair";
  marking: "objective";
  /**
   * WHICH question this pair asks, because they are two different questions
   * and conflating them would teach something false.
   *
   * `target` — which of these is ZURICH German, the other being Bernese or
   *   Basel. Judged by the dialect gate.
   * `bridge` — which of these is SWISS written German, the other being
   *   Germany's. Judged by the sibling's rules.
   *
   * `Velo` is not Zurich German as opposed to Swiss German; it is the Swiss
   * word, used in both. Labelling it `target` would tell a learner it belongs
   * to the dialect, which is exactly the kind of quiet falsehood this product
   * refuses elsewhere.
   */
  variety: "target" | "bridge";
  /** Both forms, in a fixed order decided at generation. */
  options: readonly [string, string];
  /** Index into `options`. */
  answer: 0 | 1;
  /** Where the wrong one is from — "Bern", "Basel" — when the rule says. */
  origin?: string;
  source: ItemSource;
};

/**
 * A kept word, asked in the direction the learner will meet it.
 *
 * Dialect form first, meaning revealed second — recognition before production,
 * which is the order §1 argues and the direction a message actually arrives in.
 */
export type RecallItem = {
  id: string;
  kind: "recall";
  marking: "self";
  prompt: string;
  answer: string;
  /** A sentence it was seen in, when there is one. */
  context?: string;
  source: ItemSource;
};

/**
 * One word missing from a sentence, with the German beside it.
 *
 * Self-marked, for the orthography reason above: there is no correct spelling
 * to check a typed answer against.
 */
export type ClozeItem = {
  id: string;
  kind: "cloze";
  marking: "self";
  /** The target sentence with the blank already cut into it. */
  prompt: string;
  /** The word that was removed. */
  answer: string;
  /** The same sentence in the bridge variety — the clue, not the answer. */
  bridge: string;
  source: ItemSource;
};

/**
 * Which article the noun takes.
 *
 * OBJECTIVE, and the second kind that can be: the answer set is closed at three
 * and the answer itself is a field in the pack, so nothing is inferred and no
 * model is asked. It is also the error a German reader is least able to avoid —
 * gender is carried by a word they never had to learn, so *der Velo* survives a
 * hundred correct readings of the noun.
 *
 * All three articles are always offered, in a fixed order. Offering only the
 * plausible two would leak the answer, and shuffling would make the session
 * irreproducible for no gain.
 */
export type ArticleItem = {
  id: string;
  kind: "article";
  marking: "objective";
  /** The noun, bare. */
  noun: string;
  bridge: string;
  /** Always all three, same order every time. */
  options: readonly [string, string, string];
  /** Index into `options`. */
  answer: 0 | 1 | 2;
  source: ItemSource;
};

export type PracticeItem = PairItem | RecallItem | ClozeItem | ArticleItem;

/**
 * The three articles, in the order they are always shown.
 *
 * Mirrors `Article` in the pack rather than redefining it — the pack is the
 * authority on what articles the variety has, and a second list here would be
 * the copy that goes stale. A test asserts the two agree.
 */
export const ARTICLES = ["de", "d", "s"] as const;

/** How an answer came back. `skipped` is a real outcome, not a failure. */
export type Outcome = "right" | "wrong" | "skipped";

/**
 * How many items one sitting holds.
 *
 * Small on purpose. A session you can finish in a tram stop is one you open
 * again tomorrow; twenty items is a lesson, and a lesson is the thing people
 * mean to do later. There is no setting for it — an option here would be the
 * product asking the learner to design their own practice.
 */
export const SESSION_SIZE = 8;
