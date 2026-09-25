import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import type { PracticeItem } from "@/lib/domain/practice/types";

/**
 * What every exercise view is handed, and the only thing it may report back.
 *
 * WHY THE RENDERER SPLIT FOLLOWED THE GENERATOR SPLIT. `kinds/` made adding a
 * kind one module on the generation side, and the rendering side stayed a
 * 1,100-line component with three `item.kind ===` chains through it: one to
 * choose the prompt, one to choose the answering controls, one in the keyboard
 * handler. The third was the dangerous one — a kind nobody had thought about
 * fell through to the self-marked branch, where Enter means "I knew it", so a
 * single keypress answered a matching grid correctly. That bug shipped in the
 * same commit as the feature.
 *
 * A view now owns its whole question: the prompt, the controls, the keyboard,
 * and the verdict. The session owns what is the same for all of them — which
 * question you are on, what happens when you answer, and the summary at the
 * end. That is the actual seam, and it is why `Card` is now nine lines.
 *
 * THE VIEW NEVER SEES THE ITEM'S ID. It reports an outcome and the session
 * decides what that means — recording it, feeding the learner model, requeuing
 * a missed item. A view that could write history would be a view that could
 * write it twice.
 */
export type ExerciseViewProps<T extends PracticeItem = PracticeItem> = {
  item: T;
  t: Dictionary["practice"];
  /**
   * The grammar section's own words, so a verdict can say WHY.
   *
   * A link to the topic was all there was, and a link is a promise to explain
   * rather than an explanation: somebody who has just got `isch gsi` wrong is
   * told they were wrong, offered a page, and left to decide whether they care
   * enough to leave the drill. One sentence at the moment of the mistake is
   * worth more than a page they will not open.
   *
   * IT IS THE TOPIC'S OWN `rule` LINE, not a second explanation written for
   * this panel. The grammar page and the drill then cannot drift, and a topic
   * whose wording improves improves here too. Same discipline as `scopeName`
   * on the practice page, which reads the topic's own title rather than a set
   * of names invented for a banner.
   */
  grammarT: Dictionary["grammar"];
  situationsT: Dictionary["situations"];
  vocabularyT: Dictionary["vocabulary"];
  locale: Locale;
  /**
   * WHEN THE LEARNER FINDS OUT — and it is the view's business because the
   * view owns its verdict.
   *
   * `now` — the ordinary drill: mark, explain, offer the way on.
   * `later` — a test run. The view shows NO verdict, no colour and no
   *   explanation; choosing an option reports it and the session moves on at
   *   once. The silence is the measurement: feedback after each item changes
   *   what the next item is measuring.
   *
   * Only the single-decision tap kinds are ever asked to honour `later`,
   * because those are the only kinds a test contains — see `mode.ts`. A view
   * that ignores it is therefore not a latent bug, it is a kind that cannot
   * appear in a test.
   */
  reveal: "now" | "later";
  /**
   * Done with this question. `skipped` is a real outcome, not a failure.
   *
   * `chose` is what the learner actually picked, as the string they saw. It
   * exists for the end of a test, where the question is long gone and "you
   * chose `chunnsch`, the answer is `chömed`" is the whole of what makes the
   * results worth reading. Optional because most kinds have nothing single to
   * report — a filled-in grid is not a string.
   */
  onAnswer: (outcome: "right" | "wrong" | "skipped", chose?: string) => void;
  /**
   * A recall answer is also a REVIEW answer: the word carries its own
   * schedule, and practising it without telling the schedule would spend the
   * spacing effect the schedule exists to produce. Only `recall` calls this;
   * every other kind reports through `onAnswer` alone.
   */
  onRecall: (prompt: string, knew: boolean) => void;
};

export type ExerciseView = (props: ExerciseViewProps) => React.ReactNode;
