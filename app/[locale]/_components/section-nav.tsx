"use client";

import { useEffect, useState } from "react";

/**
 * A way around a long page. THE ONE OF THESE THERE IS.
 *
 * IT WAS TWO, and that is the reason this file is not called `dashboard-nav`
 * any more. This component existed, doing exactly this job, and a second one
 * (`page-toc`) was written for the white paper a few days later without
 * checking — so the site had two vertical section rails that behaved
 * differently on the same viewport. Reported, correctly and not for the first
 * time: "we shouldn't be reinventing the fucking wheel."
 *
 * The older one won on merits rather than seniority: it marks the current
 * section, carries counts, and wraps instead of scrolling sideways. The newer
 * one contributed only the two-column frame, which is `SectionNavLayout`
 * below. Everything now uses this — the personal space, the white paper, the
 * listening catalogue — so the three cannot disagree about what a section rail
 * does.
 *
 * NO FLEET PACKAGE OWNS THIS SHAPE, which was checked before merging rather
 * than assumed: the register's nine packages are AI, mail, rate limiting,
 * forms, lists, threads, tokens, sites and `bip-kit`. `bip-kit` has a
 * `TocEntry`, but it is a MARKDOWN HEADING — it carries a `level` of 2, 3 or
 * 4 — and the sections here are arbitrary page regions, some of them counted.
 * Forcing `level: 2` onto "Groups · 1" would be bending a contract to look
 * compliant. If a third product wants this, it is the extraction candidate.
 *
 * WHAT WAS WRONG ORIGINALLY. The personal space was five sections stacked down
 * roughly
 * two thousand pixels of phone with nothing to steer by: no index, no counts,
 * no indication that anything existed below the fold. A reader who wanted
 * their groups scrolled past everything else to find out whether they had any.
 * "There is nothing for me to navigate that area effectively" — and there was
 * not.
 *
 * ONE COMPONENT, TWO SHAPES, because a phone and a laptop want different
 * things from the same list. Below `lg` it is a strip that sticks under the
 * site header, so the index is always one tap away however far down you are.
 * At `lg` it becomes the sidebar the page has always needed, sticky beside the
 * content. A second component for the second shape would be two lists that
 * disagree about what sections exist.
 *
 * IT WRAPS RATHER THAN SCROLLS SIDEWAYS. A horizontally scrolling chip row is
 * the conventional answer and it is the wrong one here: a strip that scrolls
 * sideways hides its own last item, on the exact class of page this product
 * has repeatedly shipped scrolling sideways by accident. Wrapping is uglier by
 * one line and cannot hide anything.
 *
 * THE COUNTS ARE THE POINT, not decoration. "Groups" tells you a section
 * exists; "Groups · 1" tells you whether it is worth the tap, which is the
 * question a personal page is being asked.
 */
export type NavSection = {
  /** The `id` of the section it scrolls to. */
  id: string;
  label: string;
  /** Rendered beside the label when there is something to count. */
  count?: number;
};

export function SectionNav({ sections, label }: { sections: readonly NavSection[]; label: string }) {
  const current = useCurrentSection(sections.map((s) => s.id));

  return (
    <nav
      aria-label={label}
      /*
        NO NEGATIVE MARGIN. Bleeding the strip to the screen edges looks a
        little better and makes the element wider than the box it sits in,
        which is indistinguishable — to the responsive audit and to a reader —
        from the overflow defect this page has shipped twice. A rule that stops
        at the gutter is the honest version, and the check stays free of
        exceptions that would have to be maintained.
      */
      className="
        sticky top-[var(--header-height)] z-20 border-b border-border-subtle bg-surface-page/95 py-1.5 backdrop-blur
        lg:static lg:border-b-0 lg:bg-transparent lg:py-0 lg:backdrop-blur-none
      "
    >
      {/*
        ONE ROW ON A PHONE, SCROLLED SIDEWAYS — not four rows that wrap.

        This page has seven sections, and wrapped they stood 153px tall: a
        fifth of an 800px phone screen, permanently, to show a table of
        contents nobody asked to keep looking at. A single row that scrolls is
        the shape every documentation site converged on for the same reason.

        `overflow-x-auto` here is a SCROLLER, not the overflow defect the
        responsive audit hunts. The audit draws that line explicitly — it
        reports content wider than its box only when `overflow-x` computes to
        `visible` or `clip`, because "a real scroller is a deliberate choice"
        — so `auto` is the declaration that says this one is meant. Nothing
        extends past the viewport either way; `min-w-0` is what lets the row
        shrink and scroll rather than push the grid wider.
      */}
      <ul className="flex min-w-0 gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
        {sections.map((section) => {
          const active = current === section.id;
          return (
            <li key={section.id} className="shrink-0 lg:shrink">
              <a
                href={`#${section.id}`}
                aria-current={active ? "true" : undefined}
                /* `min-h-11` is the tap target and is not negotiable. On a
                   phone the row scrolls sideways rather than wrapping, so the
                   label must not break: `whitespace-nowrap` is what makes a
                   scroller out of what would otherwise be a squeezed column
                   of one-word-per-line links. Border rather than fill for the
                   resting state, so the strip reads as a row of controls
                   instead of a paragraph of links. */
                className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-control border px-2.5 text-sm transition-colors lg:w-full lg:whitespace-normal lg:px-3 ${
                  active
                    ? "border-border-strong bg-surface-sunk font-medium text-fg-primary"
                    : "border-border-subtle text-fg-secondary hover:border-border-strong hover:text-fg-primary"
                }`}
              >
                {section.label}
                {section.count !== undefined && (
                  <span className={`font-mono text-caption ${active ? "text-fg-primary" : "text-fg-muted"}`}>
                    {section.count}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Which section the reader is actually looking at.
 *
 * `IntersectionObserver` rather than scroll maths: the browser already knows,
 * and a scroll handler recomputing offsets on every frame is the version that
 * janks on the phone this is for.
 *
 * The top margin is what makes it feel right. Without it a section counts as
 * "current" while it is still at the bottom of the screen, so the marker runs
 * ahead of the reader. `-45% 0px -50%` narrows the trigger to a band across the
 * middle of the viewport: whatever is under the reader's eye is what is marked.
 */
function useCurrentSection(ids: readonly string[]): string | null {
  const [current, setCurrent] = useState<string | null>(null);
  // A stable dependency: the array identity changes on every render, the
  // joined string does not.
  const key = ids.join(",");

  useEffect(() => {
    const sectionIds = key.split(",").filter(Boolean);
    if (typeof IntersectionObserver !== "function") return;

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        }
        // The first in DOM order that is in the band, so scrolling up and
        // scrolling down agree about where you are.
        setCurrent(sectionIds.find((id) => seen.has(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [key]);

  return current;
}

/**
 * The two-column frame a sticky rail needs. The one thing the duplicate had
 * that this did not.
 *
 * The rail is a fixed 13rem so the prose column keeps a stable measure — a
 * fractional rail reflows the body text at every breakpoint, and the measure
 * is the one thing on a long reading page that must not move.
 *
 * `min-w-0` on the content column because everything in it is text nobody on
 * this side wrote, in seven languages. See AGENTS.md: a grid track defaults to
 * a min-content minimum, and one long unbroken word in Romansh widens the
 * whole page.
 */
export function SectionNavLayout({ nav, children }: { nav: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid-cols-safe grid gap-x-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
      {/*
        `contents` BELOW lg, AND THAT IS THE WHOLE FIX. A sticky element can
        only travel inside its containing block, and this wrapper was exactly
        as tall as the nav — so on a phone the rail did not stick, it scrolled
        away like any other block, and the sticky styling on `SectionNav` was
        decoration for a state that never occurred. `display: contents` takes
        the wrapper out of layout so the nav becomes the grid item itself and
        inherits the grid's full height to travel in.

        From lg it is a real box again: a column that scrolls with the page
        until it reaches the header, then holds.
      */}
      <div className="contents lg:block lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
        {nav}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
