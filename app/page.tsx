import Link from "next/link";
import { LANDING } from "@/lib/config/landing";

export default function Home() {
  const c = LANDING;
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-shell flex-col px-5 sm:px-8">
      <header className="flex items-baseline justify-between border-b border-border-subtle py-5">
        <span className="font-heading text-2xl font-semibold tracking-display text-fg-primary">{c.brand}</span>
        <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{c.eyebrow}</span>
      </header>

      <main className="flex-1">
        <section className="py-14 sm:py-20 lg:py-24" aria-labelledby="headline">
          <h1
            id="headline"
            className="max-w-[20ch] font-heading text-4xl font-semibold leading-[1.05] tracking-display text-fg-primary sm:text-6xl"
          >
            {c.headline}
          </h1>
          <p className="mt-6 max-w-measure text-lg leading-relaxed text-fg-secondary sm:text-xl">{c.sub}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={c.cta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-6 text-base font-semibold text-on-accent transition-opacity hover:opacity-90"
            >
              {c.cta.label}
            </Link>
            <a
              href={c.secondary.href}
              className="inline-flex min-h-11 items-center justify-center px-2 text-base text-link underline underline-offset-4 decoration-1 hover:text-accent"
            >
              {c.secondary.label}
            </a>
          </div>
        </section>

        <section className="border-y border-border-subtle py-10 sm:py-12" aria-label="Sound correspondences">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {c.correspondences.map((p) => (
              <li key={p.de} className="font-mono">
                <div className="text-lg sm:text-xl">
                  <span className="text-fg-muted">{p.de}</span>
                  <span className="mx-2 text-fg-muted" aria-hidden="true">
                    →
                  </span>
                  <span className="font-medium text-dialect">{p.gsw}</span>
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-caps text-fg-muted">{p.rule}</div>
              </li>
            ))}
          </ul>
          <p className="mt-7 max-w-measure text-base leading-relaxed text-fg-secondary">{c.correspondencesNote}</p>
        </section>

        <section className="grid gap-10 py-14 sm:grid-cols-3 sm:gap-8 sm:py-20">
          {c.sections.map((s, i) => (
            <article key={s.id} id={s.id} className="scroll-mt-8">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-accent">0{i + 1}</div>
              <h2 className="font-heading text-2xl font-semibold leading-tight tracking-display text-fg-primary">{s.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-fg-secondary">{s.body}</p>
            </article>
          ))}
        </section>

        <section className="mb-14 border-l-2 border-accent bg-surface-raised px-5 py-5 sm:mb-20 sm:px-6" aria-labelledby="state">
          <h2 id="state" className="font-mono text-[11px] uppercase tracking-caps text-accent">
            {c.state.title}
          </h2>
          <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{c.state.body}</p>
        </section>
      </main>

      <footer className="flex flex-col gap-2 border-t border-border-subtle py-6 font-mono text-xs text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <span>{c.footer.line}</span>
        <a href={c.footer.link.href} className="min-h-11 inline-flex items-center text-link underline underline-offset-4 hover:text-accent">
          {c.footer.link.label}
        </a>
      </footer>
    </div>
  );
}
