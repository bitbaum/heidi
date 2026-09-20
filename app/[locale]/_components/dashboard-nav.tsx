"use client";

import { useEffect, useState } from "react";

/**
 * A way around your own page.
 *
 * WHAT WAS WRONG. The personal space was five sections stacked down roughly
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
export type DashboardSection = {
  /** The `id` of the section it scrolls to. */
  id: string;
  label: string;
  /** Rendered beside the label when there is something to count. */
  count?: number;
};

export function DashboardNav({ sections, label }: { sections: readonly DashboardSection[]; label: string }) {
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
        sticky top-0 z-20 border-b border-border-subtle bg-surface-page/95 py-1.5 backdrop-blur
        lg:static lg:border-b-0 lg:bg-transparent lg:py-0 lg:backdrop-blur-none
      "
    >
      <ul className="flex flex-wrap gap-1 lg:flex-col lg:gap-0.5">
        {sections.map((section) => {
          const active = current === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? "true" : undefined}
                /* `min-h-11` is the tap target and is not negotiable; the
                   horizontal padding is what keeps six of them on two lines at
                   320px. Border rather than fill for the resting state, so the
                   strip reads as a row of controls instead of a paragraph of
                   links — the thing it looked like before. */
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-control border px-2.5 text-sm transition-colors lg:w-full lg:px-3 ${
                  active
                    ? "border-border-strong bg-surface-sunk font-medium text-fg-primary"
                    : "border-border-subtle text-fg-secondary hover:border-border-strong hover:text-fg-primary"
                }`}
              >
                {section.label}
                {section.count !== undefined && (
                  <span className={`font-mono text-caption ${active ? "text-accent" : "text-fg-muted"}`}>
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
