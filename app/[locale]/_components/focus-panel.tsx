"use client";

import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { useBrowserStore } from "@/lib/browser/store";
import { EMPTY_MODEL, weakest } from "@/lib/domain/practice/model";
import { modelStore } from "./practice-stores";

/**
 * What keeps catching this learner out, and a way straight at it.
 *
 * THE SMALLEST HONEST VERSION OF "THE SYSTEM SHOULD BE SMARTER". The model
 * behind it already reorders every session; this is the part that says so out
 * loud, because a product that silently adapts is indistinguishable from one
 * that does not.
 *
 * WHAT IT IS NOT, and the line is §8's. It shows NO number: not a percentage,
 * not a count of misses, not a level, not "you are 62% on the dative". A miss
 * rate rendered at a person is a score whatever it is called, and the rule
 * here is that the product measures how much of an unfamiliar Zurich speaker
 * you understand — not how well you did at Heidi. So this names the MATERIAL
 * and offers to practise it. The diagnosis points at the topic, never at the
 * learner.
 *
 * IT SAYS NOTHING UNTIL IT HAS SOMETHING TO SAY. `weakest` refuses to name an
 * area on fewer than two answers, so a first session produces an empty panel
 * and the panel renders nothing at all — no placeholder, no "start practising
 * to see your weak spots", which is a promise made to somebody who has not
 * asked for it yet.
 */
export function FocusPanel({
  t,
  grammarT,
  situationsT,
  locale,
}: {
  t: Dictionary["practice"];
  /** Topic titles come from the grammar dictionary — one name per thing. */
  grammarT: Dictionary["grammar"];
  situationsT: Dictionary["situations"];
  locale: Locale;
}) {
  const model = useBrowserStore(modelStore) ?? EMPTY_MODEL;

  const topics = weakest(model, "topics", { limit: 3 }).flatMap((area) => {
    const words = grammarT.topics[area.id as keyof typeof grammarT.topics];
    return words ? [{ id: area.id, title: words.title, scope: "topic" as const }] : [];
  });

  const scenes = weakest(model, "scenes", { limit: 2 }).flatMap((area) => {
    const words = situationsT.scenes[area.id as keyof typeof situationsT.scenes];
    return words ? [{ id: area.id, title: words.title, scope: "scene" as const }] : [];
  });

  const areas = [...topics, ...scenes];
  if (areas.length === 0) return null;

  return (
    <section
      aria-labelledby="focus"
      className="mb-8 rounded-control border border-border-subtle bg-surface-raised p-5"
    >
      <h2 id="focus" className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
        {t.focusTitle}
      </h2>
      <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">{t.focusLead}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {areas.map((area) => (
          <li key={`${area.scope}:${area.id}`}>
            <Link
              href={`${href(locale, "practice")}?${area.scope}=${encodeURIComponent(area.id)}`}
              className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary transition-colors hover:bg-surface-page"
            >
              {area.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
