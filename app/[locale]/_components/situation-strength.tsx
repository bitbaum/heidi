"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { DISPLAY } from "@/lib/variety/display";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { EMPTY_MODEL } from "@/lib/domain/practice/model";
import { strengthOf, type Standing } from "@/lib/domain/practice/situation-strength";
import { modelStore } from "./practice-stores";

/**
 * "You understand Zurich German in this situation."
 *
 * THE SENTENCE THIS WHOLE FEATURE EXISTS TO LET SOMEBODY SAY. Not a level, not
 * a score out of a hundred, not a badge: a bounded claim about a moment they
 * will really be in, that they can check line by line and disagree with.
 *
 * WHY PER SITUATION AND NOT OVERALL. Because someone can be solid in a care
 * handover and lost ordering lunch, and averaging those into one number
 * destroys the only genuinely useful thing here. A learner who has done three
 * shifts in a home has heard the handover lines forty times and the restaurant
 * lines never — their strength is SHAPED, and the shape is what tells them
 * where to go next.
 *
 * IT PRINTS THE LINES THAT ARE LEFT, which is the same argument
 * `mastered-panel.tsx` makes and one step more useful: a percentage tells you
 * how far you are, and these three sentences tell you what to do about it.
 *
 * CLIENT-SIDE BECAUSE THE EVIDENCE IS, and that is a promise rather than an
 * implementation detail. The model is in this browser's storage, declared on
 * the privacy page and deletable from settings. No request is made to work any
 * of this out, and the panel says so, because a claim about someone's
 * comprehension is exactly the sort of thing they are entitled to assume is
 * being collected somewhere.
 *
 * IT RENDERS AN EMPTY STATE RATHER THAN NOTHING. A panel that appears only
 * once you are good at something is a panel nobody discovers — the same defect
 * `focus-panel.tsx` had when it returned `null` while being the first entry in
 * the dashboard's jump strip.
 */
export function SituationStrength({
  scene,
  askable,
  lines,
  t,
  locale,
}: {
  scene: string;
  /** Line indexes this build can ask about — the denominator, from the items. */
  askable: readonly number[];
  /** Every line's dialect text, by index, so the ones left can be printed. */
  lines: readonly string[];
  t: Dictionary["situations"];
  locale: Locale;
}) {
  const model = useBrowserStore(modelStore) ?? EMPTY_MODEL;
  const ready = useStorageReady();
  const s = strengthOf(scene, model, new Set(askable));
  const words = t.strength;

  const practise = `${href(locale, "practice")}?scene=${encodeURIComponent(scene)}`;

  return (
    <section
      aria-labelledby="strength-heading"
      className="mt-10 rounded-control border border-border-subtle bg-surface-raised p-5 sm:p-6"
    >
      <h2
        id="strength-heading"
        className="font-mono text-caption uppercase tracking-caps text-fg-muted"
      >
        {words.title}
      </h2>

      {ready && (
        <p className="mt-3 font-heading text-xl font-semibold leading-snug tracking-display text-fg-primary">
          {LABEL[s.standing](words)}
        </p>
      )}

      {!ready ? (
        /*
          NOTHING, UNTIL WE HAVE READ THE EVIDENCE.
          The server cannot see this browser's storage, so the first pass would
          otherwise tell a learner who has mastered this situation that they
          have not started it — and then correct itself a moment later. A
          momentary lie about somebody's own progress is worse than a
          momentary blank, and this panel's entire value is that what it says
          is true.
        */
        <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">{words.localOnly}</p>
      ) : s.standing === "new" ? (
        <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">{words.noneYet}</p>
      ) : (
        <>
          {/* The claim, in full, only where it is true. Everywhere else the
              count speaks for itself and a sentence would be padding. */}
          {s.standing === "sure" && (
            <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">
              {fill(words.claim, { total: String(s.askable) })}
            </p>
          )}

          <p className="mt-2 font-mono text-caption uppercase tracking-caps text-fg-muted">
            {fill(words.progress, { held: String(s.held), total: String(s.askable) })}
          </p>

          <Bar held={s.held} stuck={s.stuck} total={s.askable} />

          {s.stuck > 0 && (
            <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">
              {fill(words.stuckNote, { stuck: String(s.stuck) })}
            </p>
          )}

          {s.remaining.length > 0 && (
            <div className="mt-5">
              <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                {words.remainingTitle}
              </h3>
              <ul className="mt-2 flex flex-col gap-1">
                {s.remaining.map((line) => (
                  <li
                    key={line}
                    lang={DISPLAY.tag}
                    className="wrap-anywhere text-sm leading-relaxed text-fg-secondary"
                  >
                    {lines[line]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {ready && askable.length > 0 && (
        <Link
          href={practise}
          className="mt-5 inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page"
        >
          {s.standing === "new" ? words.drill : words.drillAgain}
        </Link>
      )}

      {ready && <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{words.localOnly}</p>}
    </section>
  );
}

const LABEL: Record<Standing, (w: Dictionary["situations"]["strength"]) => string> = {
  new: (w) => w.new,
  met: (w) => w.met,
  steady: (w) => w.steady,
  sure: (w) => w.sure,
};

/**
 * The count, drawn.
 *
 * NOT A PERCENTAGE AND NOT ANIMATED. It is the same number as the line above
 * it, in a shape the eye reads faster — ten cells for ten lines, filled for
 * the ones that hold and marked again for the ones that came back and held.
 * A continuous bar would invite a reading to one decimal place that the
 * underlying evidence cannot support.
 *
 * `aria-hidden`, because the sentence above already says it and a screen
 * reader counting out ten identical cells is worse than useless.
 */
function Bar({ held, stuck, total }: { held: number; stuck: number; total: number }) {
  if (total === 0) return null;
  return (
    <ul aria-hidden="true" className="mt-3 flex flex-wrap gap-1">
      {Array.from({ length: total }, (_, i) => (
        <li
          key={i}
          className={`h-2 w-6 rounded-sm ${
            i < stuck ? "bg-accent" : i < held ? "bg-fg-primary" : "bg-border-subtle"
          }`}
        />
      ))}
    </ul>
  );
}
