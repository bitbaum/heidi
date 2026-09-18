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

export function Section({
  title,
  children,
  id,
}: {
  title?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border-subtle py-10 sm:py-14">
      {title && (
        <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {title}
        </h2>
      )}
      <div className={title ? "mt-5" : undefined}>{children}</div>
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
        <li key={item.title} className="grid gap-2 sm:grid-cols-[3rem_1fr] sm:gap-6">
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
