/**
 * The handful of layout primitives every content page uses. Here rather than
 * repeated per page, so the measure, rhythm and heading scale are decided once.
 */

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-shell px-5 sm:px-8">{children}</div>;
}

/**
 * The top of a page: what it is, what it is called, and what it is for.
 *
 * THE SAME LESSON `Section` LEARNED, one element up. This took `eyebrow`,
 * `title` and `lead`, and three pages that needed anything else wrote the
 * whole header out by hand — `paper`, `roadmap` and `changelog`, each with
 * the same four classes copied and each free to drift from the other two.
 *
 * What they actually needed was three props:
 *
 *   `lang`     Their content is English or German on a seven-language site.
 *              Without it the title and lead sit inside `<html lang="rm-CH">`
 *              and a screen reader reads English with Romansh phonology —
 *              the defect `OtherLanguage` was written to stop, reappearing in
 *              the one element above the notice that explains it.
 *   `note`     A third, smaller paragraph. The paper calls it a standfirst
 *              and says why it must come first: "a reader who finds out on
 *              page four that this is a working note has been managed."
 *   `children` Room under the lead, which is where two of them put the
 *              `OtherLanguage` notice.
 *
 * `measure` exists because the paper's title genuinely needs more room than
 * twenty characters and that was the one difference worth keeping.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  note,
  lang,
  measure = "20ch",
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  /** A smaller line under the lead — what this document is and is not. */
  note?: string;
  /** The language of `title`, `lead` and `note`, when it is not the page's. */
  lang?: string;
  /** How wide the title may run before it wraps. */
  measure?: "20ch" | "24ch";
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-border-subtle py-12 sm:py-16">
      {/* The eyebrow is never `lang`-tagged: it comes from the navigation
          dictionary and is therefore always in the reader's own language,
          even on a page whose body is not. */}
      {eyebrow && <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{eyebrow}</p>}
      <h1
        lang={lang}
        className={`mt-3 ${
          measure === "24ch" ? "max-w-[24ch]" : "max-w-[20ch]"
        } font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary`}
      >
        {title}
      </h1>
      {lead && (
        <p lang={lang} className="mt-5 max-w-measure text-lead leading-relaxed text-fg-secondary">
          {lead}
        </p>
      )}
      {note && (
        <p lang={lang} className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">
          {note}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}

/**
 * The full-bleed band at the top of a page that is a place rather than a document.
 *
 * ELEVEN HEADERS CARRIED THIS STRING; TEN OF THEM IDENTICALLY.
 *
 *     -mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12
 *
 * The eleventh, the essay page, said `sm:py-14` — and that one turned out NOT
 * to be drift: an essay header also has a back-link, a narrower measure, a
 * tighter leading and a dateline, because it is an article byline rather than
 * a place-name. It is deliberately left alone. `investors` and
 * `dialect/[area]` are left alone for the same reason, each having one thing
 * this does not: an eyebrow above the title, and an endonym that must carry
 * `lang`.
 *
 * So this covers the eight that were the same header written eight times, and
 * the markup below is byte-for-byte what they each rendered — no page moves a
 * pixel from this change. That is the point: a refactor whose diff is visible
 * to a reader is not a refactor.
 *
 * WHY THE NEGATIVE MARGINS ARE ALLOWED HERE and forbidden in `SectionNav`.
 * That rule is about a STICKY element: one wider than its container, pinned
 * to the viewport, is indistinguishable to the responsive audit from the
 * overflow defect this site has shipped twice. This band is static, bleeds to
 * the shell's own gutter and no further, and the audit measures it at exactly
 * the viewport width. Different element, different risk.
 *
 * TWO KINDS OF SMALL PRINT, because the pages genuinely use two. `note` is
 * prose that keeps reading; `caption` is a mono uppercase line, which the
 * privacy page uses to say the German text is the binding one. A page that
 * needs both can have both.
 */
export function BandHeader({
  title,
  lead,
  note,
  caption,
  children,
}: {
  title: string;
  lead?: string;
  /** A smaller paragraph under the lead. */
  note?: string;
  /** A mono, uppercase line — a status about the page rather than more of it. */
  caption?: string;
  /** Room under the small print — the same `mt-6` slot `PageHeader` gives. */
  children?: React.ReactNode;
}) {
  return (
    <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
      <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
        {title}
      </h1>
      {lead && <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{lead}</p>}
      {note && <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{note}</p>}
      {caption && <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">{caption}</p>}
      {children && <div className="mt-6">{children}</div>}
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
      className={`scroll-mt-anchor py-10 sm:py-14 ${
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
          <span className="font-mono text-caption uppercase tracking-caps text-fg-muted sm:pt-1.5">
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
