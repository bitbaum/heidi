"use client";

import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n/fill";
import { SKILLS } from "@/lib/domain/practice/kinds/meta";
import { LEVEL_HOLDS, frontierOf, type Trace } from "@/lib/domain/practice/model";
import { useModelView } from "./sync-stores";

/**
 * "Was sitzt": the learner's answers counted two ways — by what was tested
 * (verb forms, articles, words, understanding …; `kinds/meta.ts`) and by how
 * far the Zurich German is from German (`vocabulary/distance.ts`), with the
 * level they are working at named.
 *
 * Counts and one word, never a percentage: the product refuses a score
 * (`mastered.ts`), and "12 right · 3 missed · building" is what is true.
 * "Holds" uses the same bar as the level frontier, so the two cannot
 * disagree. Renders nothing until something has been answered.
 */
export function ProgressBy({ t }: { t: Dictionary["progressBy"] }) {
  const model = useModelView();
  const skills = SKILLS.map((id) => ({ id, label: t.skills[id], trace: model.skills[id] })).filter((row) => row.trace?.asked);
  const levels = (["1", "2", "3"] as const)
    .map((id) => ({ id, label: t.levels[id], trace: model.levels[id] }))
    .filter((row) => row.trace?.asked);
  if (skills.length === 0 && levels.length === 0) return null;
  const frontier = String(frontierOf(model)) as "1" | "2" | "3";

  return (
    <section aria-labelledby="progress-by">
      <h2 id="progress-by" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
        {t.title}
      </h2>
      <p className="mb-0 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.lead}</p>
      <div className="mt-6 grid grid-cols-safe gap-8 lg:grid-cols-2">
        <Rows title={t.bySkill} rows={skills} t={t} />
        <div>
          <Rows title={t.byLevel} rows={levels} t={t} current={frontier} />
          <p className="mb-0 mt-3 text-sm text-fg-secondary">{fill(t.frontier, { level: t.levels[frontier] })}</p>
        </div>
      </div>
    </section>
  );
}

function holds(trace: Trace): boolean {
  return trace.asked >= LEVEL_HOLDS.asked && trace.missed / trace.asked <= LEVEL_HOLDS.missRate;
}

function Rows({
  title,
  rows,
  t,
  current,
}: {
  title: string;
  rows: { id: string; label: string; trace?: Trace }[];
  t: Dictionary["progressBy"];
  current?: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{title}</h3>
      {/* Rows of one list, one anatomy: name, the counts under it, the state on the right. */}
      <ul className="mt-3 divide-y divide-border-subtle border-y border-border-subtle">
        {rows.map(({ id, label, trace }) => {
          const asked = trace?.asked ?? 0;
          const missed = trace?.missed ?? 0;
          const steady = trace ? holds(trace) : false;
          return (
            <li key={id} className="flex min-h-14 items-center justify-between gap-4 py-2">
              <div className="min-w-0">
                <p className={`mb-0 text-base text-fg-primary ${id === current ? "font-semibold" : ""}`}>{label}</p>
                <p className="mb-0 text-sm text-fg-secondary">
                  {fill(t.counts, { right: String(asked - missed), missed: String(missed) })}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-caption uppercase tracking-caps ${
                  steady ? "bg-action text-on-action" : "border border-border-strong text-fg-primary"
                }`}
              >
                {steady ? t.holds : t.building}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
