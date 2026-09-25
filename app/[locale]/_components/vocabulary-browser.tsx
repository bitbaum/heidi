"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { WordList } from "./word-list";

export type BrowserWord = {
  target: string;
  bridge: string;
  group: string;
  /** The meaning a German reader would wrongly assume. See `VocabularyEntry`. */
  mistakenFor?: string;
  register?: "casual" | "rude";
  article?: string;
  forms?: ReadonlyArray<{ label: string; target: string; bridge: string }>;
  example?: { target: string; bridge: string };
};

export type SceneLink = { id: string; title: string; href: string };

/**
 * The vocabulary page, as something you can find a word in.
 *
 * WHAT WAS WRONG. Forty-eight words in four headed groups, top to bottom, and
 * no way to get at one of them except the browser's own find — which searches
 * the one spelling you guessed, in a variety with no settled spelling, on a
 * page that also contains every German gloss. It was a list that happened to
 * be printed on a web page. At a hundred and fifty words it would have been
 * unusable, and the situation packs are going to take it there.
 *
 * THREE THINGS, AND THE FIRST IS THE WHOLE POINT.
 *
 *   FILTER. One field, matching BOTH sides. A learner looking for "carrot"
 *   and a learner looking for `Rüebli` are the same learner at different
 *   moments, and a filter that only searched the dialect would fail the more
 *   common of the two — you meet the German word in your head first.
 *
 *   JUMP. Links straight to each group, so the page has a top-level shape
 *   somebody can use without scrolling through it. Hidden while filtering,
 *   because jumping to a heading that has been emptied by the query is a
 *   broken link that looks like a broken page.
 *
 *   PRACTISE THIS GROUP. The reason the groups exist is that they are
 *   different KINDS of word, which makes each one a sensible sitting on its
 *   own. Twelve verbs is a session; twelve words drawn from across the list is
 *   a shuffle.
 *
 * NO RESULT COUNT, and that is deliberate rather than an omission. A number
 * that goes up as you type is a score, and this product does not keep score
 * anywhere else either. The list itself shows how much matched.
 *
 * THE FILTER IS LOCAL AND UNSTORED. It is a way of looking at a page, not a
 * preference — nobody wants yesterday's search still applied when they come
 * back, and `localStorage` here would be the product remembering something the
 * reader did not ask it to remember.
 */
export function VocabularyBrowser({
  words,
  groups,
  saidIn,
  t,
  chatT,
  persons,
  practiceHref,
}: {
  words: readonly BrowserWord[];
  /** Group ids in the order they are worth learning, with their headings. */
  groups: ReadonlyArray<{ id: string; title: string }>;
  /** Scenes each word is actually said in, keyed by the dialect form. */
  saidIn: Record<string, readonly SceneLink[]>;
  t: Dictionary["vocabulary"];
  chatT: Dictionary["chat"];
  persons: Dictionary["practice"]["persons"];
  /** `/xx/practice`, so the group links can append their own scope. */
  practiceHref: string;
}) {
  const [query, setQuery] = useState("");
  const fieldId = useId();
  const needle = query.trim().toLocaleLowerCase();

  /**
   * Substring, case-folded, on either side — and NOT the whole-word match the
   * scene join uses.
   *
   * The two are different jobs. That join answers "is this word said here",
   * where `si` inside `isch` is a false positive. This answers "show me what I
   * am typing", where somebody three letters into `schwö` expects
   * `Schwöschter` to be on screen. A prefix-only match would fail the same
   * person searching for the German half of a compound.
   */
  const matches = useMemo(() => {
    if (!needle) return words;
    return words.filter(
      (word) =>
        word.target.toLocaleLowerCase().includes(needle) || word.bridge.toLocaleLowerCase().includes(needle),
    );
  }, [words, needle]);

  const filtering = needle.length > 0;
  const empty = matches.length === 0;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <label htmlFor={fieldId} className="font-mono text-caption uppercase tracking-caps text-fg-muted">
            {t.filterLabel}
          </label>
          <input
            id={fieldId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.filterPlaceholder}
            autoComplete="off"
            className="mt-2 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-4 text-base text-fg-primary placeholder:text-fg-muted focus-visible:border-accent focus-visible:outline-none"
          />
        </div>
        {filtering && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="min-h-11 rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary hover:bg-surface-page"
          >
            {t.clearFilter}
          </button>
        )}
      </div>

      {/* Hidden while filtering: an anchor to a heading the query has emptied
          is a link that does nothing, which reads as a bug rather than as a
          consequence of what the reader typed. */}
      {!filtering && (
        <nav aria-label={t.jumpLabel} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.jumpLabel}</span>
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-control border border-border-subtle px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary"
            >
              {group.title}
            </a>
          ))}
        </nav>
      )}

      {empty ? (
        <p className="mt-10 max-w-measure text-base leading-relaxed text-fg-secondary">{t.noMatches}</p>
      ) : (
        <div className="mt-10 flex flex-col gap-12">
          {groups.map((group) => {
            const inGroup = matches.filter((word) => word.group === group.id);
            // A group the query emptied is gone, not an empty heading.
            if (inGroup.length === 0) return null;

            return (
              <section key={group.id} id={group.id} className="scroll-mt-anchor">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
                    {group.title}
                  </h2>
                  <Link
                    href={`${practiceHref}?group=${encodeURIComponent(group.id)}`}
                    className="text-sm text-link underline underline-offset-4 hover:text-accent"
                  >
                    {t.practiseGroup}
                  </Link>
                </div>

                <WordList words={inGroup} t={t} chatT={chatT} persons={persons} saidIn={saidIn} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
