"use client";

import { useEffect, useState } from "react";

/**
 * A table of contents that stays on screen while a long page scrolls.
 *
 * WHY. Reported three times in one message, about three different pages —
 * `/listen`, the white paper, the dialect pages: "if there is a long text
 * divided into sections, having a content table on the left floating helps
 * users navigate". It is the same defect each time. These pages are four to
 * six thousand pixels tall, every one of them is already cut into sections
 * with ids, and a reader four screens down had no idea what else was on the
 * page or how to get back.
 *
 * ONE COMPONENT, NOT ONE PER PAGE, because the alternative is five sticky
 * columns that disagree about their offset, their breakpoint and whether the
 * current section is marked — and the fifth one is written by somebody who
 * has not read the other four.
 *
 * WHAT IT DOES ON A PHONE, which is where most of these are read. Not a
 * floating anything: a `<details>` folded shut at the top of the content. A
 * sticky sidebar at 390px is either a column two words wide or a bar eating a
 * third of the screen, and the honest version of "help me navigate" on a phone
 * is a list you can open, jump from, and never see again.
 *
 * THE CURRENT SECTION IS MARKED, and that is the part that makes it a map
 * rather than a menu. `IntersectionObserver` rather than scroll maths: it is
 * the API built for this question, it costs nothing per frame, and the
 * alternative is a scroll handler that recomputes offsets on a page whose
 * images have not finished loading.
 */

export type TocEntry = {
  /** The element id to jump to. Must exist on the page. */
  id: string;
  label: string;
};

export function PageToc({ entries, label }: { entries: readonly TocEntry[]; label: string }) {
  const [current, setCurrent] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const targets = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    /**
     * `rootMargin` pulls the detection band up to just under the header.
     *
     * Without it the "current" section is whatever happens to touch the bottom
     * of the viewport, which on a tall page is two sections ahead of what the
     * reader is looking at — a map that points somewhere they have not got to
     * yet is worse than no map.
     */
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [entries]);

  return (
    <>
      {/* PHONE: folded, out of the way, one tap to open. */}
      <details className="group mb-8 border-b border-border-subtle pb-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2">
          <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{label}</span>
          <span
            aria-hidden="true"
            className="font-mono text-caption text-fg-muted transition-transform group-open:rotate-90"
          >
            →
          </span>
        </summary>
        <ol className="mt-2 flex flex-col">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="flex min-h-11 items-center gap-3 wrap-anywhere text-sm text-link underline underline-offset-4"
              >
                <span aria-hidden="true" className="font-mono text-caption text-fg-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {entry.label}
              </a>
            </li>
          ))}
        </ol>
      </details>

      {/*
        DESKTOP: sticky, left, and it does not scroll with the page.

        `top-24` clears the sticky header. `max-h` plus `overflow-y-auto` so a
        page with twenty sections gets a scrollable rail instead of a list
        running off the bottom of the screen — which is the failure mode of
        every hand-rolled version of this.
      */}
      <nav
        aria-label={label}
        className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block"
      >
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{label}</p>
        <ol className="mt-3 flex flex-col gap-0.5">
          {entries.map((entry) => {
            const here = entry.id === current;
            return (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  aria-current={here ? "true" : undefined}
                  /* The current section is marked with a rule and weight, not
                     with colour alone — the same reason the changelog tags
                     carry a word beside their colour. */
                  className={`block border-l-2 py-1.5 pl-3 text-sm leading-snug transition-colors ${
                    here
                      ? "border-accent font-medium text-fg-primary"
                      : "border-border-subtle text-fg-secondary hover:border-border-strong hover:text-fg-primary"
                  }`}
                >
                  {entry.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * The two-column frame a sticky contents list needs.
 *
 * The rail is a fixed 13rem so the prose column keeps a stable measure — a
 * fractional rail makes the body text reflow at every breakpoint, and the
 * measure is the one thing on a long reading page that must not move.
 *
 * `min-w-0` on the content column because everything in it is text nobody on
 * this side wrote, in seven languages. See AGENTS.md: a grid track defaults to
 * a min-content minimum, and one long unbroken word in Romansh widens the
 * whole page.
 */
export function TocLayout({ toc, children }: { toc: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid-cols-safe grid gap-x-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <div className="lg:order-first">{toc}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
