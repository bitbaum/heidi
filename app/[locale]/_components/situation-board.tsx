"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { EMPTY_MODEL } from "@/lib/domain/practice/model";
import { strengthAcross, weakestStarted, type Standing } from "@/lib/domain/practice/situation-strength";
import { modelStore } from "./practice-stores";

/**
 * Where this learner is strong, situation by situation.
 *
 * THE SHAPE IS THE POINT. One number for "your Swiss German" would be the
 * least informative thing we could compute: somebody who has worked three
 * shifts in a care home has heard a handover forty times and a restaurant
 * order never, and averaging those produces a figure that describes nobody and
 * suggests nothing. Laid out per situation it becomes a map — this is solid,
 * this is not, go here next.
 *
 * IT NAMES THE WEAKEST STARTED ONE, not the weakest overall. The weakest
 * overall is always something never opened, which is no recommendation at
 * all; the weakest one they have actually begun is the situation they are
 * half-way into and would otherwise abandon.
 *
 * NO TOTAL, NO AVERAGE, NO RANK. There is nothing here to compare with another
 * person, and nothing that can be reported as having fallen — the product
 * stores no previous value, so "down from nine" cannot be rendered from this
 * data by anybody, including us.
 */
export function SituationBoard({
  scenes,
  askable,
  t,
  locale,
}: {
  /** Every scene this build teaches, in the order the page lists them. */
  scenes: readonly { id: string; title: string }[];
  /** Askable line indexes per scene id — the denominators, from the items. */
  askable: Readonly<Record<string, readonly number[]>>;
  t: Dictionary["situations"];
  locale: Locale;
}) {
  const model = useBrowserStore(modelStore) ?? EMPTY_MODEL;
  const ready = useStorageReady();
  const words = t.strength;

  const map = new Map(scenes.map((s) => [s.id, new Set(askable[s.id] ?? [])]));
  const all = strengthAcross(
    scenes.map((s) => s.id),
    model,
    map,
  );
  const titles = new Map(scenes.map((s) => [s.id, s.title]));
  const suggestion = weakestStarted(all);

  // Nothing practised at all: the board would be fourteen identical "not
  // started" rows, which is a wall rather than an orientation. The page's own
  // cards already invite someone in, so this stays out of the way until there
  // is something true to say.
  // Also before hydration: the board would render fourteen "not started"
  // rows and then rewrite them, which is the same momentary lie.
  if (!ready || all.every((s) => s.standing === "new")) return null;

  return (
    <section
      aria-labelledby="board-heading"
      className="mt-12 rounded-control border border-border-subtle bg-surface-raised p-5 sm:p-6"
    >
      <h2
        id="board-heading"
        className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
      >
        {words.boardTitle}
      </h2>
      <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{words.boardLead}</p>

      <ul className="mt-6 flex flex-col divide-y divide-border-subtle border-y border-border-subtle">
        {all.map((s) => (
          <li key={s.scene} className="min-w-0 py-3">
            <Link
              href={`${href(locale, "situations")}/${s.scene}`}
              className="group grid grid-cols-safe items-baseline gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <span className="min-w-0 wrap-anywhere text-base leading-snug text-fg-primary group-hover:text-accent">
                {titles.get(s.scene)}
              </span>
              <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                {s.standing === "new" ? words.new : `${s.held}/${s.askable}`}
                {s.standing === "sure" && <span className="ml-2 font-medium text-fg-primary">{words.sure}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {suggestion && (
        <p className="mt-5 max-w-measure text-sm leading-relaxed text-fg-secondary">
          {words.weakest}:{" "}
          <Link
            href={`${href(locale, "situations")}/${suggestion.scene}`}
            className="text-link underline underline-offset-4 hover:text-accent"
          >
            {titles.get(suggestion.scene)}
          </Link>
        </p>
      )}

      <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{words.localOnly}</p>
    </section>
  );
}

/** Kept so a future badge cannot invent a fifth state the model does not have. */
export type { Standing };
