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
  /**
   * A vocabulary entry in the pack.
   *
   * `group` rides along so a session can be SCOPED to one part of the
   * vocabulary page without the scope filter having to re-derive it from the
   * pack. An item saying where it came from is the same principle the rest of
   * `ItemSource` already keeps; this is the field that lets "practise these
   * words" mean the words the reader is looking at.
   */
  | { kind: "word"; word: string; group: string }
  /**
   * A line from a situation pack, carrying the scene id so the page can link
   * back to the moment it belongs to.
   *
   * Worth its own kind rather than reusing `grammar`: a learner who gets this
   * wrong is better served by the SCENE than by the topic — the sentence they
   * failed on is one of ten in a handover, and the other nine are the context
   * that makes it stick. The topic is one click further on from there.
   */
  | {
      kind: "situation";
      scene: string;
      /**
       * The grammar topic the line turns on, when it has one.
       *
       * This is what makes "practise this topic" worth pressing. Without it, a
       * topic session can only ask about the two or three example sentences
       * the pack wrote to ILLUSTRATE the rule — and a learner who has just met
       * `am-progressive` three times in one shift is better served by those
       * three real lines than by a fourth invented demonstration.
       */
      topic?: string;
    };

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

/**
 * Which form of the verb goes with this person.
 *
 * OBJECTIVE, and the distractors are what make it so: they are the SAME verb's
 * other forms, taken from the pack. A learner choosing between `bi`, `bisch`
 * and `isch` is doing the thing a paradigm is for — nothing is invented to
 * distract them, and no plausible-looking wrong form had to be made up, which
 * is where a generated drill would otherwise start writing the language.
 *
 * Needs at least three forms on the entry. Two would be a coin toss and one is
 * not a question, so a thinner entry produces no item.
 */
export type FormItem = {
  id: string;
  kind: "form";
  marking: "objective";
  /** The headword, so the learner knows which verb is being asked about. */
  word: string;
  bridge: string;
  /** Which person is wanted — a closed key the dictionary renders. */
  label: string;
  /** The verb's own forms, in pack order. */
  options: readonly string[];
  answer: number;
  source: ItemSource;
};

/**
 * Four dialect words, four meanings, joined up.
 *
 * WHY THIS ONE WAS WORTH ADDING, when the standing rule is that anything
 * needing a model to mark it is not an exercise type. Nothing here needs a
 * model: each pair is a row of the pack's own vocabulary, so the answer key is
 * data, and every distractor is a REAL word of the variety rather than a
 * plausible-looking form somebody made up. It is the one classic exercise
 * shape that survives this product's constraints untouched.
 *
 * AND IT IS THE ONE THAT IS ACTUALLY PLEASANT TO DO. §8 refuses streaks,
 * points and levels, and that refusal stands — but "not gamified" was never
 * the same claim as "not enjoyable", and the enjoyment has to come from the
 * design instead. A four-by-four grid that empties as you get it right is
 * satisfying for reasons that have nothing to do with a score: the board
 * visibly shrinks, each correct pair makes the next one easier, and the whole
 * thing is over in fifteen seconds.
 *
 * FOUR, NOT SIX OR EIGHT. Six pairs is a puzzle and eight is a chore; four is
 * one glance. It also keeps the last pair from being free — with four, getting
 * three right leaves one, which is a gift; the grid is therefore marked on the
 * three real decisions and the walkover is not counted against anybody.
 */
export type MatchItem = {
  id: string;
  kind: "match";
  marking: "objective";
  /** The dialect side, in a fixed order. */
  targets: readonly string[];
  /**
   * The meanings, in a DIFFERENT fixed order — shuffled at generation by a
   * stable property rather than a dice roll, so a test sees the same board
   * twice and a learner does not see the answer down the diagonal.
   */
  bridges: readonly string[];
  /** `answer[i]` is the index in `bridges` that `targets[i]` belongs to. */
  answer: readonly number[];
  source: ItemSource;
};

/**
 * A short passage with several words taken out, and the words offered back.
 *
 * WHY A PASSAGE AND NOT A SENTENCE, when `cloze` already exists. Because a
 * sentence in isolation is the one thing a learner never meets. A handover is
 * four sentences that refer to each other — who slept, who ate, who is
 * waiting, who you should look in on — and the word that fills a gap is often
 * decidable only from the line before it. This is the first exercise here that
 * asks somebody to follow more than one sentence at a time, which is the
 * actual skill the product exists for.
 *
 * WHY A WORD BANK, AND WHY THAT MAKES IT OBJECTIVE. `cloze` is self-marked
 * because Zurich German has no settled spelling and grading a typed answer
 * means deciding whether a near-miss counts. Handing back the exact words that
 * were removed dissolves that problem completely: the learner chooses rather
 * than spells, every option is a real form from the passage, and the answer
 * key is which hole each one came out of. No model, no orthography, no
 * judgement call — and a harder question than the same gap with the answer
 * typed, because the distractors are all plausible and all present.
 *
 * THE BANK IS EXACTLY THE REMOVED WORDS. Not padded with extras: a decoy would
 * be a word this product asserted belongs nowhere in the passage, which is a
 * claim about the language made to make an exercise harder. With three gaps
 * and three words, getting two right settles the third — the same walkover the
 * matching grid has, handled the same way, by only counting the decisions that
 * were real.
 */
export type GapTextItem = {
  id: string;
  kind: "gaptext";
  marking: "objective";
  /**
   * The passage, in the order it is said. A line with `gap` has one blank in
   * it; the number is which gap it is, counting from the top.
   */
  lines: readonly { prompt: string; bridge: string; gap?: number }[];
  /** The removed words, in a stable shuffled order. */
  bank: readonly string[];
  /** `answer[g]` is the index in `bank` belonging to gap `g`. */
  answer: readonly number[];
  source: ItemSource;
};

/**
 * A real sentence with one word taken out, and four real words offered.
 *
 * THE KIND THE MATERIAL WAS ASKING FOR. Measured before it existed: the pack's
 * twenty-six function words produced SIX questions between them, because they
 * carry no article and no paradigm, so the only thing that could touch them
 * was a matching grid. They are the words the vocabulary page argues buy the
 * most comprehension, and they were the least practised thing in the product.
 *
 * WHY IT IS OBJECTIVE, WHICH IS THE WHOLE DESIGN. Several of the options will
 * make a grammatical sentence — «Ich mag hüt au ufstah» is perfectly good
 * Zurich German. What makes exactly ONE of them correct is the bridge sentence
 * printed underneath: the question is not "which word fits" but "which word
 * makes this mean THAT". A learner can check the answer against the German
 * themselves, which is the property that lets this be marked at all.
 *
 * THE DISTRACTORS ARE CHOSEN, NOT SAMPLED. Every one is a real word of the
 * variety — nothing is invented — and each is filtered so its own gloss does
 * NOT appear in the bridge sentence. Without that rule the generator will
 * eventually offer `nüme` («nicht mehr») against a German line containing
 * "nicht mehr", and mark a defensible answer wrong. See `pick.ts`.
 */
export type PickItem = {
  id: string;
  kind: "pick";
  marking: "objective";
  /** The sentence, with the word already cut out of it. */
  prompt: string;
  /** The German. This is what makes exactly one option right. */
  bridge: string;
  options: readonly string[];
  answer: number;
  source: ItemSource;
};

export type PracticeItem =
  | PairItem
  | RecallItem
  | ClozeItem
  | ArticleItem
  | FormItem
  | MatchItem
  | GapTextItem
  | PickItem;

/**
 * How many words a `pick` offers, and how many sentences one word may claim.
 *
 * FOUR options: three is a coin toss with a spare and five is a reading
 * exercise. TWO sentences per word, because `nöd` occurs in dozens of pack
 * lines and without a cap it would own the whole exercise pool — the same
 * balance problem the session's round-robin exists to prevent, one level
 * further up.
 */
export const PICK_OPTIONS = 4;
export const PICK_PER_WORD = 2;

/**
 * How many lines of a scene make a passage, and how many gaps go in it.
 *
 * FOUR LINES because that is where a handover stops being a list and starts
 * being an exchange, and it still fits a phone without scrolling mid-question.
 * THREE GAPS because two is not a passage exercise and four in four lines is a
 * sieve — the reader loses the thread they are supposed to be using.
 */
export const PASSAGE_LINES = 4;
export const PASSAGE_GAPS = 3;

/**
 * How many pairs a matching grid holds. See `MatchItem` — four is one glance.
 */
export const MATCH_SIZE = 4;

/**
 * The three articles, in the order they are always shown.
 *
 * Mirrors `Article` in the pack rather than redefining it — the pack is the
 * authority on what articles the variety has, and a second list here would be
 * the copy that goes stale. A test asserts the two agree.
 */
export const ARTICLES = ["de", "d", "s"] as const;

/**
 * How many forms an entry needs before its paradigm is worth asking about.
 *
 * Three: two options is a coin toss, and the distractors have to be the verb's
 * own forms rather than invented ones.
 */
export const MIN_FORMS_TO_ASK = 3;

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
