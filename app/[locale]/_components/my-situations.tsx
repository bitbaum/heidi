"use client";

import { useState } from "react";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { focusOf, focusScope } from "@/lib/domain/practice/focus";
import { ALL } from "@/lib/domain/practice/scope";
import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n/fill";
import type { Locale } from "@/lib/i18n/locales";
import { focusStore } from "./focus-store";
import { SessionLink } from "./session/links";

export type SituationDomain = { id: string; title: string; scenes: { id: string; title: string }[] };

const PRIMARY =
  "inline-flex min-h-12 items-center justify-center rounded-control bg-action px-3 text-center font-medium text-on-action transition-opacity hover:opacity-90";
const SECONDARY =
  "inline-flex min-h-12 items-center justify-center rounded-control border border-border-strong px-3 text-center font-medium text-fg-primary transition-colors hover:bg-surface-raised";

/**
 * "Meine Situationen" — the first thing a new learner is asked, and from then
 * on the one obvious next step.
 *
 * Nobody asked what somebody needs Swiss German FOR, so a nurse, a parent and
 * a new colleague all met the same items. Asked once, here, the answer decides
 * what every "practise" button draws from (`focusScope`). It is never a wall:
 * "practise everything" sits beside the choice, and the choice changes in one
 * tap.
 */
export function MySituations({
  locale,
  t,
  domains,
}: {
  locale: Locale;
  t: Dictionary["mySituations"];
  domains: SituationDomain[];
}) {
  const ready = useStorageReady();
  const focus = useBrowserStore(focusStore);
  const [editing, setEditing] = useState(false);
  const [picked, setPicked] = useState<string[] | null>(null);

  // Nothing is drawn until the browser's record is read: a learner who has
  // chosen must not watch the question flash up and vanish.
  if (!ready) return <div aria-hidden="true" className="min-h-48 rounded-control bg-surface-raised" />;

  const titles = new Map(domains.flatMap((d) => d.scenes.map((s) => [s.id, s.title] as const)));
  const chosen = focus?.scenes ?? [];

  if (chosen.length > 0 && !editing) {
    return (
      <section aria-labelledby="my-situations" className="rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
        <h2 id="my-situations" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.chosenTitle}
        </h2>
        <p className="mb-0 mt-2 text-base leading-relaxed text-fg-secondary">{t.chosenLead}</p>
        {/* Many of one kind: one line that scrolls sideways, never a wrapping heap. */}
        <ul className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6">
          {chosen.map((id) => (
            <li key={id} className="shrink-0 rounded-control border border-border-subtle bg-surface-page px-3 py-2 text-sm text-fg-primary">
              {titles.get(id) ?? id}
            </li>
          ))}
        </ul>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <SessionLink locale={locale} scope={focusScope(focus)} className={PRIMARY}>
            {t.cont}
          </SessionLink>
          <button
            type="button"
            onClick={() => {
              setPicked(chosen);
              setEditing(true);
            }}
            className={SECONDARY}
          >
            {t.change}
          </button>
        </div>
      </section>
    );
  }

  const selection = picked ?? [];
  const toggle = (id: string) =>
    setPicked((current) => {
      const now = current ?? [];
      return now.includes(id) ? now.filter((s) => s !== id) : [...now, id];
    });
  const save = () => {
    focusStore.write(focusOf(selection));
    setEditing(false);
  };

  return (
    <section aria-labelledby="my-situations" className="rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
      <h2 id="my-situations" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
        {t.title}
      </h2>
      <p className="mb-0 mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.lead}</p>

      {domains.map((domain) => (
        <fieldset key={domain.id} className="mt-6">
          <legend className="font-mono text-caption uppercase tracking-caps text-fg-muted">{domain.title}</legend>
          <div className="mt-3 grid grid-cols-safe gap-2 xs:grid-cols-2 lg:grid-cols-3">
            {domain.scenes.map((scene) => {
              const on = selection.includes(scene.id);
              return (
                <button
                  key={scene.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(scene.id)}
                  className={`flex min-h-12 min-w-0 items-center gap-2.5 rounded-control border px-3 py-2 text-left text-base transition-colors ${
                    on
                      ? "border-action bg-action text-on-action"
                      : "border-border-subtle bg-surface-page text-fg-primary hover:border-border-strong"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-5 shrink-0 place-items-center rounded-sm border text-xs ${
                      on ? "border-on-action" : "border-border-strong"
                    }`}
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span className="min-w-0">{scene.title}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <p aria-live="polite" className="mb-0 mt-5 font-mono text-caption uppercase tracking-caps text-fg-muted">
        {fill(t.picked, { n: String(selection.length) })}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {editing ? (
          <>
            <button type="button" onClick={save} disabled={selection.length === 0} className={`${PRIMARY} disabled:opacity-40`}>
              {t.save}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={SECONDARY}>
              {t.cancel}
            </button>
          </>
        ) : (
          <>
            {selection.length > 0 ? (
              <SessionLink
                locale={locale}
                scope={focusScope(focusOf(selection))}
                onClick={() => focusStore.write(focusOf(selection))}
                className={PRIMARY}
              >
                {t.start}
              </SessionLink>
            ) : (
              <span aria-disabled="true" className={`${PRIMARY} cursor-not-allowed opacity-40`}>
                {t.start}
              </span>
            )}
            <SessionLink locale={locale} scope={ALL} className={SECONDARY}>
              {t.skip}
            </SessionLink>
          </>
        )}
      </div>
    </section>
  );
}
