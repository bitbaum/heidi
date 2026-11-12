"use client";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { useState } from "react";
import type { PracticeItem } from "@/lib/domain/practice/types";
import { presented } from "@/lib/domain/practice/present";
import { seeded } from "@/lib/domain/practice/random";
import { VIEWS } from "./registry";
import { readModelView } from "../sync-stores";

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
  learnT,
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
  learnT: Dictionary["chat"]["learn"];
  locale: Locale;
  reveal: "now" | "later";
  onAnswer: (id: string, outcome: "right" | "wrong" | "skipped", chose?: string) => void;
  onRecall: (id: string, prompt: string, knew: boolean) => void;
}) {
  const View = VIEWS[item.kind];
  // A fresh layout each time this question is shown (`present.ts`): options,
  // banks and matching columns move, so a returning question is answered by
  // what it says, not where the answer sat last time.
  const [shown] = useState(() => presented(item, seeded(Math.floor(Math.random() * 2 ** 32))));

  // Read once, when the card is first shown: marking it writes the word's
  // trace, and the line above the card must not change under the answer.
  const [newWord] = useState(
    () =>
      item.kind === "card" &&
      item.source.kind === "word" &&
      (readModelView().words[item.source.word]?.asked ?? 0) === 0,
  );

  const ask =
    item.kind === "pair"
      ? item.variety === "target"
        ? t.ask.pairTarget
        : t.ask.pairBridge
      : // «Do you still know this one?» is a question about a word met before.
        newWord
        ? t.ask.cardNew
        : // A word shown without a sentence has no "here" to mean something in.
          item.kind === "meaning" && item.said === item.focus
          ? t.ask.meaningAlone
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
        item={shown}
        t={t}
        grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} learnT={learnT}
        locale={locale}
        reveal={reveal}
        onAnswer={(outcome, chose) => onAnswer(item.id, outcome, chose)}
        onRecall={(prompt, knew) => onRecall(item.id, prompt, knew)}
      />
    </div>
  );
}
