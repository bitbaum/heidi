"use client";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { EarlierRow } from "./earlier-row";
import { Examples } from "./examples";

/**
 * What an empty conversation shows — ONE component, for the three places a
 * conversation can be empty: the full-screen chat, the home page's card and the
 * dock that floats over every other page.
 *
 * They used to be three different things. The full-screen chat had a heading
 * and a sentence and the four examples; the home card had the sentence and the
 * examples; the dock had its own lead and its own three canned questions. Same
 * moment — a person has just opened Heidi — three answers, which is how the
 * dock came to offer different things from the chat it is a window onto.
 *
 * The order is the order of what someone opening Heidi most likely wants:
 *
 *   1. a question that names the two things Heidi does — understand a line
 *      someone sent, or say one — instead of repeating the button's own words
 *      ("Ask Heidi" under a button that said "Ask Heidi");
 *   2. the thread from last time, if there is one, as a single quiet row —
 *      never in the way, never lost;
 *   3. something to press, for the person who has nothing to paste yet.
 *
 * The box itself is below, already visible.
 */
export function EmptyChat({
  t,
  locale,
  dialect,
  onPick,
  earlier,
  heading,
  compact = false,
}: {
  t: Dictionary["chat"];
  locale: Locale;
  dialect: { tag: string; showcase?: string };
  onPick: (s: string) => void;
  /** The thread you had before — a row to continue it. Null: nothing to offer. */
  earlier: { line: string; when: string; resume: () => void } | null;
  /**
   * Which heading to draw, or `null` for none. The home card has a header of
   * its own that already says "Heidi", so it shows the sentence under it
   * instead of a second title.
   */
  heading: "h1" | "h2" | null;
  /** One column of examples, for a narrow panel. */
  compact?: boolean;
}) {
  const Heading = heading;

  return (
    <div>
      {Heading ? (
        <Heading className="font-heading text-2xl font-semibold tracking-display text-fg-primary">{t.emptyTitle}</Heading>
      ) : (
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.placeholder}</p>
      )}

      {earlier && (
        <div className="mt-4">
          <EarlierRow t={t.earlier} locale={locale} line={earlier.line} when={earlier.when} onResume={earlier.resume} />
        </div>
      )}

      <Examples t={t} dialect={dialect} onPick={onPick} compact={compact} />
    </div>
  );
}
