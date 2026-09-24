/**
 * The handful of layout primitives every content page uses. Here rather than
 * repeated per page, so the measure, rhythm and heading scale are decided once.
 */

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-shell px-5 sm:px-8">{children}</div>;
}

export function PageHeader({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <header className="border-b border-border-subtle py-12 sm:py-16">
      {eyebrow && <p className="font-mono text-caption uppercase tracking-caps text-accent">{eyebrow}</p>}
      <h1 className="mt-3 max-w-[20ch] font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
        {title}
      </h1>
      {lead && <p className="mt-5 max-w-measure text-lead leading-relaxed text-fg-secondary">{lead}</p>}
    </header>
  );
}

/**
 * A section of a page: a rule, a heading, and the room underneath it.
 *
 * WHAT WAS MISSING, AND WHAT IT COST. This took only `title`, `id` and
 * children, and an audit found roughly twenty-two sections across the site
 * hand-rolled with the same three classes — plus a local clone in
 * `technology/page.tsx` called `Panel`, and one in `privacy/page.tsx` called
 * `Section`, which shadowed this import and made the page look compliant to
 * anybody grepping.
 *
 * Every one of those hand-rolls traces to a missing prop rather than to a
 * designer wanting something different:
 *
 *   `lead`    — a sentence under the heading. Wanted by privacy, technology,
 *               organisations and investors; each wrote the same
 *               `mt-3 max-w-measure text-base …` paragraph.
 *   a NAME    — this rendered a bare `<h2>` with no id, so `aria-labelledby`
 *               was impossible and every page that wanted a named landmark
 *               had to build the section itself. That single omission is the
 *               largest cause of divergence in the audit.
 *   `border`  — `border-b` was hard-coded, and fifteen hand-rolled sections
 *               wanted `border-t`. Both are correct in a stack; a page that
 *               needed the other one had no way to ask.
 *
 * The heading now carries `id="<id>-heading"` and the section points at it, so
 * a screen reader announces "Privacy, section" instead of "section".
 */
export function Section({
  title,
  lead,
  children,
  id,
  border = "bottom",
}: {
  title?: string;
  /** One sentence under the heading. */
  lead?: string;
  children: React.ReactNode;
  id?: string;
  /** Which side carries the rule. Both are used on this site. */
  border?: "top" | "bottom";
}) {
  const headingId = id && title ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-20 py-10 sm:py-14 ${
        border === "top" ? "border-t border-border-subtle" : "border-b border-border-subtle"
      }`}
    >
      {title && (
        <h2
          id={headingId}
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {title}
        </h2>
      )}
      {lead && <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{lead}</p>}
      <div className={title || lead ? "mt-5" : undefined}>{children}</div>
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <p className="max-w-measure text-base leading-relaxed text-fg-secondary sm:text-lg">{children}</p>;
}

/** A numbered list of substantial points — used by the method and about pages. */
export function NumberedList({ items }: { items: ReadonlyArray<{ title: string; body: string }> }) {
  return (
    <ol className="mt-2 flex flex-col gap-8">
      {items.map((item, i) => (
        <li key={item.title} className="grid grid-cols-safe gap-2 sm:grid-cols-[3rem_1fr] sm:gap-6">
          <span className="font-mono text-caption uppercase tracking-caps text-accent sm:pt-1.5">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-heading text-xl font-semibold leading-snug tracking-display text-fg-primary">
              {item.title}
            </h3>
            <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
