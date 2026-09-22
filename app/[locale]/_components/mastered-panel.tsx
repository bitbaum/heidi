"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { DISPLAY } from "@/lib/variety/display";
import { useBrowserStore } from "@/lib/browser/store";
import { EMPTY_MODEL } from "@/lib/domain/practice/model";
import { masteredCount, masteredIn } from "@/lib/domain/practice/mastered";
import { modelStore } from "./practice-stores";

/**
 * What you can do now that you could not before.
 *
 * THE FEATURE THE SPECIFICATION USED TO FORBID, and §3 now explains why it was
 * wrong to. The old rule refused "streaks, points, levels, percentages" as one
 * undifferentiated thing; the challenge — *why are we so hateful towards
 * streaks, percentages, gamification?* — was fair, and the answer is that two
 * independent questions had been collapsed into one:
 *
 *   WHAT IS COUNTED   consumption (days opened) or capability (forms you now
 *                     get right that you used to miss)
 *   HOW IS IT FRAMED  gain (here is what you can do) or loss (don't break
 *                     your streak)
 *
 * The dishonest quadrant is consumption counted and loss framed. That one is
 * still refused. This is the other corner, and withholding it was never
 * integrity — it was just a worse product.
 *
 * NOTHING HERE CAN GO DOWN IN FRONT OF THE READER. An area that slips below
 * the bar stops being listed; it is never reported as lost. `Mastered` carries
 * no previous count and no delta, so "down from 14" cannot be rendered from
 * this data without somebody adding the number first — which would be a
 * visible change to a tested module rather than a quiet one in a template.
 *
 * AND IT PRINTS THE THINGS, not just the number. Eleven grammar topics, named,
 * each a link. A bare count is a score; the same count beside what it is about
 * is a claim the reader can disagree with, which is the only kind this product
 * publishes.
 */
export function MasteredPanel({
  t,
  grammarT,
  vocabularyT,
  locale,
}: {
  t: Dictionary["review"];
  grammarT: Dictionary["grammar"];
  vocabularyT: Dictionary["vocabulary"];
  locale: Locale;
}) {
  const model = useBrowserStore(modelStore) ?? EMPTY_MODEL;
  const mastered = masteredIn(model);
  const total = masteredCount(mastered);

  /**
   * Nothing yet is the common case on day one, and it says so rather than
   * disappearing — the same lesson the patterns panel had to learn when the
   * dashboard started advertising it in a jump strip.
   */
  if (total === 0) {
    return (
      <section aria-labelledby="mastered" className="mt-12 border-t border-border-subtle pt-10">
        <Heading t={t} />
        <p className="max-w-measure rounded-control border border-border-subtle bg-surface-raised p-4 text-base leading-relaxed text-fg-secondary">
          {t.masteredEmpty}
        </p>
      </section>
    );
  }

  const topicName = (id: string) => grammarT.topics[id as keyof typeof grammarT.topics]?.title ?? id;
  const groupName = (id: string) => vocabularyT.groups[id as keyof typeof vocabularyT.groups] ?? id;

  return (
    <section aria-labelledby="mastered" className="mt-12 border-t border-border-subtle pt-10">
      <Heading t={t} />

      {/* ONE NUMBER, AND IT IS A COUNT OF THINGS — not a percentage, because
          there is no denominator that means anything. The pack is not the
          language. */}
      <p className="text-lead text-fg-primary">{fill(t.masteredCount, { n: String(total) })}</p>
      <p className="mb-6 mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.masteredLead}</p>

      <div className="grid grid-cols-safe gap-x-10 gap-y-8 sm:grid-cols-2">
        {mastered.topics.length > 0 && (
          <Group title={t.masteredTopics}>
            {mastered.topics.map((id) => (
              <li key={id}>
                <Link
                  href={`${href(locale, "grammar")}/${id}`}
                  className="inline-flex min-h-11 items-center wrap-anywhere text-sm text-link underline underline-offset-4 hover:text-accent"
                >
                  {topicName(id)}
                </Link>
              </li>
            ))}
          </Group>
        )}

        {mastered.words.length > 0 && (
          <Group title={t.masteredWords}>
            {mastered.words.map((word) => (
              <li key={word}>
                <span lang={DISPLAY.tag} className="inline-flex min-h-11 items-center wrap-anywhere text-sm text-dialect">
                  {word}
                </span>
              </li>
            ))}
          </Group>
        )}

        {mastered.groups.length > 0 && (
          <Group title={t.masteredGroups}>
            {mastered.groups.map((id) => (
              <li key={id}>
                <Link
                  href={`${href(locale, "practice")}?group=${encodeURIComponent(id)}`}
                  className="inline-flex min-h-11 items-center wrap-anywhere text-sm text-link underline underline-offset-4 hover:text-accent"
                >
                  {groupName(id)}
                </Link>
              </li>
            ))}
          </Group>
        )}

        {mastered.scenes.length > 0 && (
          <Group title={t.masteredScenes}>
            {mastered.scenes.map((id) => (
              <li key={id}>
                <Link
                  href={`${href(locale, "situations")}/${id}`}
                  className="inline-flex min-h-11 items-center wrap-anywhere text-sm text-link underline underline-offset-4 hover:text-accent"
                >
                  {id}
                </Link>
              </li>
            ))}
          </Group>
        )}
      </div>

      {/* The caveat, said once and plainly: this is about the pack, not about
          Swiss German. A learner who read it as the latter would have been
          given exactly the false confidence §8 exists to prevent. */}
      <p className="mt-6 max-w-measure text-sm leading-relaxed text-fg-muted">{t.masteredNote}</p>
    </section>
  );
}

function Heading({ t }: { t: Dictionary["review"] }) {
  return (
    <h2
      id="mastered"
      className="mb-3 font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
    >
      {t.masteredTitle}
    </h2>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{title}</h3>
      <ul className="mt-2 flex flex-col">{children}</ul>
    </div>
  );
}
