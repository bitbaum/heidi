"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { fill } from "@/lib/i18n/fill";
import { plural } from "@/lib/i18n/plural";
import { wordsScope } from "@/lib/domain/practice/scope";
import { wordSlug } from "@/lib/domain/practice/slug";
import { NEXT_BATCH, nextWords, wordStatus, type WordStatus } from "@/lib/domain/vocabulary/rank";
import { matchesQuery } from "@/lib/domain/vocabulary/search";
import { DISPLAY } from "@/lib/variety/display";
import { SessionLink } from "./session/links";
import { useModelView } from "./sync-stores";
import { useSaved } from "./use-saved";
import { StatusMark, WordRow } from "./word-list";

export type SceneLink = { id: string; title: string; href: string };

/** One word as the page shows it, already ranked and joined on the server. */
export interface VocabRow {
  target: string;
  bridge: string;
  group: string;
  article?: string;
  /** The meaning a German reader would wrongly assume. See `VocabularyEntry`. */
  mistakenFor?: string;
  register?: "casual" | "rude";
  forms?: ReadonlyArray<{ label: string; target: string; bridge: string }>;
  /** The pack's example, or the shortest scene line that says the word. */
  example?: { target: string; bridge: string; scene?: SceneLink };
  /** Lines of the scenes that say it. */
  heard: number;
  /** The scenes those lines are in, each once, in scene order. */
  scenes: readonly SceneLink[];
  guessable: boolean;
  /** Whether the practice pool has a question about it. */
  practisable: boolean;
}

/** Rows shown before "show more". A phone screen is about twelve. */
const PAGE = 40;

const STATUSES: readonly WordStatus[] = ["new", "learning", "known"];

/**
 * The vocabulary page's working part: what to learn next, and the list.
 *
 * STATUS IS READ, NEVER STORED. Where a learner stands on a word comes from
 * the learner model and the kept words (`wordStatus`), the same evidence the
 * personal page uses — so practising anywhere moves the marks here, and there
 * is no second record to drift.
 *
 * THE FILTERS ARE LOCAL AND UNSTORED. They are a way of looking at the page,
 * not a preference: nobody wants yesterday's search still applied when they
 * come back.
 */
export function VocabularyBrowser({
  rows,
  groups,
  t,
  chatT,
  persons,
  locale,
  portalHref,
}: {
  rows: readonly VocabRow[];
  groups: ReadonlyArray<{ id: string; title: string }>;
  t: Dictionary["vocabulary"];
  chatT: Dictionary["chat"];
  persons: Dictionary["practice"]["persons"];
  locale: Locale;
  portalHref: string;
}) {
  const model = useModelView();
  const saved = useSaved();
  const ready = saved.ready;

  const status = useCallback((target: string) => wordStatus(target, model, saved.words), [model, saved.words]);

  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [only, setOnly] = useState<WordStatus | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);
  const fieldId = useId();

  const filtering = query.trim().length > 0 || group !== null || only !== null;

  const shown = useMemo(
    () =>
      rows.filter(
        (row) =>
          matchesQuery(row, query) &&
          (group === null || row.group === group) &&
          (only === null || (ready && status(row.target) === only)),
      ),
    [rows, query, group, only, ready, status],
  );

  /**
   * A link to one word (`#w-nöd`, from an answer's explanation) has to land on
   * it even though the list shows only the first rows: clear the filters, show
   * far enough down, open it, and scroll to it.
   */
  useEffect(() => {
    const land = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const index = rows.findIndex((row) => wordSlug(row.target) === slug);
      if (index === -1) return;
      setQuery("");
      setGroup(null);
      setOnly(null);
      setLimit((l) => Math.max(l, index + 1));
      setOpen(rows[index].target);
      requestAnimationFrame(() => document.getElementById(slug)?.scrollIntoView({ block: "center" }));
    };
    land();
    window.addEventListener("hashchange", land);
    return () => window.removeEventListener("hashchange", land);
  }, [rows]);

  const visible = shown.slice(0, filtering ? Math.max(limit, PAGE) : limit);
  const firstGuessable = visible.findIndex((row) => row.guessable);

  return (
    <div className="flex flex-col gap-12">
      <NextWords rows={rows} status={ready ? status : null} t={t} locale={locale} portalHref={portalHref} keptCount={saved.count} />

      <section aria-labelledby={`${fieldId}-list`} className="border-t border-border-subtle pt-10">
        <h2 id={`${fieldId}-list`} className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {fill(t.allTitle, { count: String(rows.length) })}
        </h2>
        <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.orderNote}</p>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
            <div className="min-w-0 flex-1">
              <label htmlFor={fieldId} className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                {t.filterLabel}
              </label>
              <input
                id={fieldId}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setLimit(PAGE);
                }}
                placeholder={t.filterPlaceholder}
                autoComplete="off"
                className="mt-2 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-4 text-base text-fg-primary placeholder:text-fg-muted focus-visible:border-accent focus-visible:outline-none"
              />
            </div>
            {filtering && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setGroup(null);
                  setOnly(null);
                  setLimit(PAGE);
                }}
                className="min-h-11 rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary hover:bg-surface-page"
              >
                {t.clearFilter}
              </button>
            )}
          </div>

          <Chips label={t.groupLabel}>
            <Chip pressed={group === null} onClick={() => setGroup(null)}>
              {t.filterAll}
            </Chip>
            {groups.map((g) => (
              <Chip key={g.id} pressed={group === g.id} onClick={() => setGroup(group === g.id ? null : g.id)}>
                {g.title}
              </Chip>
            ))}
          </Chips>

          {/* Only once storage has been read: before that every word is "new",
              and a filter that empties the list a moment later is a flicker. */}
          {ready && (
            <Chips label={t.statusLabel}>
              <Chip pressed={only === null} onClick={() => setOnly(null)}>
                {t.filterAll}
              </Chip>
              {STATUSES.map((s) => (
                <Chip key={s} pressed={only === s} onClick={() => setOnly(only === s ? null : s)}>
                  <StatusMark status={s} label={t.status[s]} decorative />
                  {t.status[s]}
                </Chip>
              ))}
            </Chips>
          )}

          {group !== null && (
            <p>
              <SessionLink
                locale={locale}
                scope={{ kind: "group", id: group }}
                className="text-sm text-link underline underline-offset-4 hover:text-accent"
              >
                {t.practiseGroup}
              </SessionLink>
            </p>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 max-w-measure text-base leading-relaxed text-fg-secondary">{t.noMatches}</p>
        ) : (
          <ul className="mt-6 hyphens-auto wrap-anywhere">
            {visible.map((row, i) => (
              <WordRow
                key={row.target}
                row={row}
                status={ready ? status(row.target) : null}
                open={open === row.target}
                onToggle={() => setOpen(open === row.target ? null : row.target)}
                heading={
                  i === firstGuessable ? (
                    <div className="mt-10 border-b border-border-subtle pb-3">
                      <h3 className="font-heading text-lg font-semibold text-fg-primary">{t.guessableTitle}</h3>
                      <p className="mt-1 max-w-measure text-sm leading-relaxed text-fg-muted">{t.guessableNote}</p>
                    </div>
                  ) : null
                }
                t={t}
                chatT={chatT}
                persons={persons}
                locale={locale}
              />
            ))}
          </ul>
        )}

        {shown.length > visible.length && (
          <button
            type="button"
            onClick={() => setLimit(visible.length + PAGE * 2)}
            className="mt-6 min-h-11 rounded-control border border-border-strong px-5 text-sm font-medium text-fg-primary hover:bg-surface-page"
          >
            {fill(t.showMore, { count: String(shown.length - visible.length) })}
          </button>
        )}
      </section>
    </div>
  );
}

/**
 * The one decision the page makes for the learner: these ten, now.
 *
 * NAMED BEFORE THE BUTTON, because a button that says "learn 10 words" and
 * does not say which is asking for trust it has not earned, and because
 * seeing `nöd · mir · grad` is already the first exposure.
 *
 * A COUNT OF WHAT HOLDS, NEVER A PERCENTAGE. "31 of 226 sit" is a checkable
 * fact about words the learner can see marked in the list below; a progress
 * bar would be a score for consuming the list.
 */
function NextWords({
  rows,
  status,
  t,
  locale,
  portalHref,
  keptCount,
}: {
  rows: readonly VocabRow[];
  status: ((target: string) => WordStatus) | null;
  t: Dictionary["vocabulary"];
  locale: Locale;
  portalHref: string;
  keptCount: number;
}) {
  // Before storage is read, the ten a newcomer would get — the same list, so
  // nothing reorders under the reader's eyes for somebody who has not started.
  const next = nextWords(
    rows.map((row) => ({ word: row, practisable: row.practisable })),
    status ?? (() => "new"),
    NEXT_BATCH,
  );
  const byTarget = new Map(rows.map((row) => [row.target, row]));
  const counts = { known: 0, learning: 0 };
  if (status) for (const row of rows) {
    const s = status(row.target);
    if (s !== "new") counts[s] += 1;
  }

  return (
    <section aria-labelledby="next-words" className="rounded-control border border-border-strong bg-surface-raised p-5 sm:p-8">
      <h2 id="next-words" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
        {t.nextTitle}
      </h2>
      <p className="mt-2 min-h-6 max-w-measure text-sm leading-relaxed text-fg-secondary">
        {status &&
          (counts.known + counts.learning === 0
            ? t.progressNone
            : fill(t.progress, {
                known: String(counts.known),
                learning: String(counts.learning),
                total: String(rows.length),
              }))}
      </p>

      {next.length === 0 ? (
        <p className="mt-6 max-w-measure text-base leading-relaxed text-fg-primary">{t.allKnown}</p>
      ) : (
        <>
          <ol className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {next.map((target) => {
              const row = byTarget.get(target)!;
              return (
                <li key={target} className="flex items-baseline gap-3">
                  <span lang={DISPLAY.tag} className="font-heading text-lg font-semibold text-dialect">
                    {row.article && <span className="font-normal text-fg-muted">{row.article} </span>}
                    {row.target}
                  </span>
                  <span lang="de" className="min-w-0 text-sm text-fg-secondary">
                    {row.bridge}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <SessionLink
              locale={locale}
              scope={wordsScope(next)}
              className="inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90"
            >
              {plural(t.learnNext, next.length, locale)}
            </SessionLink>
            {keptCount > 0 && (
              <a href={portalHref} className="text-sm text-link underline underline-offset-4 hover:text-accent">
                {fill(t.reviewKept, { count: String(keptCount) })}
              </a>
            )}
          </div>
          <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{t.learnNextHint}</p>
        </>
      )}
    </section>
  );
}

function Chips({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-caption uppercase tracking-caps text-fg-muted">{label}</span>
      {children}
    </div>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-2 rounded-control border px-3 text-sm transition-colors max-sm:min-h-11 ${
        pressed
          ? "border-fg-primary text-fg-primary"
          : "border-border-subtle text-fg-secondary hover:border-border-strong hover:text-fg-primary"
      }`}
    >
      {children}
    </button>
  );
}
