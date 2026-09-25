"use client";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import type { PracticeItem } from "@/lib/domain/practice/types";
import { VIEWS } from "./registry";

/**
 * One question, framed — whichever kind it is and whichever sitting it is in.
 *
 * WHY IT MOVED OUT OF THE PRACTICE SESSION. The test run asks the same
 * questions in the same frame and differs only in when the answer appears, so
 * the alternative was a second copy of "look up the view, pick the `ask` line,
 * key it by id". Three small things, all of which have already been a bug
 * once: the view lookup was a switch that silently mishandled a new kind, the
 * `ask` line was a chain that fell through, and the missing `key` made a view
 * arrive with the previous question's answer already revealed.
 *
 * So both sittings render this, and neither can drift from the other. What
 * they differ on is one prop.
 */
export function QuestionCard({
  item,
  t,
  grammarT,
  situationsT,
  vocabularyT,
  locale,
  reveal,
  onAnswer,
  onRecall,
}: {
  item: PracticeItem;
  t: Dictionary["practice"];
  grammarT: Dictionary["grammar"];
  situationsT: Dictionary["situations"];
  vocabularyT: Dictionary["vocabulary"];
  locale: Locale;
  reveal: "now" | "later";
  onAnswer: (id: string, outcome: "right" | "wrong" | "skipped", chose?: string) => void;
  onRecall: (id: string, prompt: string, knew: boolean) => void;
}) {
  const View = VIEWS[item.kind];

  const ask =
    item.kind === "pair"
      ? item.variety === "target"
        ? t.ask.pairTarget
        : t.ask.pairBridge
      : t.ask[item.kind];

  return (
    <div className="mt-3 rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{ask}</p>

      {/* Keyed by id so a view's state cannot outlive its question: without
          it, React reuses the instance when two consecutive items share a
          kind, and the second arrives with the first one's answer already
          revealed. */}
      <View
        key={item.id}
        item={item}
        t={t}
        grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT}
        locale={locale}
        reveal={reveal}
        onAnswer={(outcome, chose) => onAnswer(item.id, outcome, chose)}
        onRecall={(prompt, knew) => onRecall(item.id, prompt, knew)}
      />
    </div>
  );
}
