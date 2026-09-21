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
  locale: Locale;
  /** Done with this question. `skipped` is a real outcome, not a failure. */
  onAnswer: (outcome: "right" | "wrong" | "skipped") => void;
  /**
   * A recall answer is also a REVIEW answer: the word carries its own
   * schedule, and practising it without telling the schedule would spend the
   * spacing effect the schedule exists to produce. Only `recall` calls this;
   * every other kind reports through `onAnswer` alone.
   */
  onRecall: (prompt: string, knew: boolean) => void;
};

export type ExerciseView = (props: ExerciseViewProps) => React.ReactNode;
