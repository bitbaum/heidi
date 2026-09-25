"use client";

import type { Dictionary } from "@/lib/i18n";
import { DISPLAY } from "@/lib/variety/display";
import { useReview } from "./use-review";

/**
 * What keeps catching you — read off their own list, not measured about them.
 *
 * Every regularity here is one that actually separates a word they kept from
 * the form they already knew. It needs no tracking: nothing new is recorded
 * about anybody to produce this, because the evidence is the vocabulary list
 * they built themselves.
 *
 * It shows the words, and that is not decoration. "`k → ch` is in 6 of your
 * words" is a claim; printing the six is the proof, and it turns the panel
 * from a verdict about the learner into something they can check and argue
 * with. A number alone would be a score wearing a rule for a hat.
 */
export function PatternsPanel({ t }: { t: Dictionary["review"] }) {
  const { ready, patterns } = useReview();

  /**
   * WHILE STORAGE IS BEING READ, nothing — that is a frame, not a state.
   *
   * But an EMPTY result now renders an explanation rather than disappearing,
   * and the comment that used to sit here ("a panel explaining that it has
   * nothing to say is worse than no panel") was right until the dashboard
   * started advertising this section in its jump strip. Once a reader can
   * click «Patterns» and land on nothing, the argument inverts: they asked
   * what patterns even were, which is exactly the question a section that
   * renders nothing cannot answer.
   *
   * The empty state says what will appear and what produces it. The `Review`
   * section next door has said "nothing due today, come back tomorrow" from
   * the start; this is the same courtesy, arriving late.
   */
  if (!ready) return null;
  /*
   * EMPTY RENDERS NOTHING AGAIN, and the reason it stopped doing so is gone.
   * It was changed to explain itself because the jump strip advertised it and
   * clicking the link landed on nothing. The strip no longer lists it, so the
   * explanation now only told a learner with five saved words to come back
   * "once you have kept a few words" — measured against the rules this panel
   * knows, which cover 12% of the vocabulary, that was a promise, not a
   * description.
   */
  if (patterns.length === 0) return null;

  return (
    <section aria-labelledby="patterns-heading" className="mt-12 border-t border-border-subtle pt-10">
      <h2
        id="patterns-heading"
        className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
      >
        {t.patternsTitle}
      </h2>
      <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.patternsLead}</p>

      {patterns.length === 0 && (
        <p className="max-w-measure rounded-control border border-border-subtle bg-surface-raised p-4 text-base leading-relaxed text-fg-secondary">
          {t.patternsEmpty}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {patterns.map(({ correspondence, words }) => (
          <li
            key={correspondence.rule}
            className="rounded-control border border-border-subtle p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              {/* Letters, not prose — `k → ch` reads correctly in all seven
                  locales because it is in none of them. */}
              <p className="font-mono text-base font-semibold text-fg-primary">{correspondence.rule}</p>
              <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                {words.length} {t.patternsCount}
              </p>
            </div>

            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {words.map((w) => (
                <li key={w.target} className="text-sm text-fg-secondary">
                  <span lang={DISPLAY.tag} className="font-medium text-dialect">
                    {w.target}
                  </span>
                  <span aria-hidden="true" className="px-1.5 text-fg-muted">
                    ·
                  </span>
                  {/* The target was marked and the bridge was not — a
                      bare German text node beside a declared dialect one. */}
                  <span lang="de">{w.bridge}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
