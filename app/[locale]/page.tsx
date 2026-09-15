import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";
import { Chat } from "./_components/chat";
import { DialectFigure } from "./_components/dialect-figure";
import { CorrespondenceFigure } from "./_components/correspondence-figure";
import { Shell } from "./_components/page-shell";

/**
 * The tool is the page. Not a marketing page with the product behind a button:
 * someone arriving with a message they cannot read should be able to paste it
 * without signing up, clicking through, or reading anything first.
 *
 * The argument for the product sits underneath, for the visit where they are
 * deciding whether to trust it rather than trying to get through a Tuesday.
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.home;

  return (
    <Shell>
      {/* The hero DEMONSTRATES rather than claims.
          It used to say "Schweizerdeutsch verstehen" and leave it there — a
          benefit stated, which every language site states. But the whole
          product is the gap between what arrives on your phone and what you
          understand, so the fastest way to be believed is to open that gap and
          close it in one glance, before anyone has read a word of persuasion.
          The line is real Züritüütsch a German speaker cannot parse; the
          answer sits directly under it.

          Two columns, because the argument was in a narrow left column with
          the right half of a 1440 screen empty, and because the demonstration
          earns its own space rather than pushing the input further down. */}
      <section className="grid gap-5 pb-6 pt-6 sm:pb-8 sm:pt-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-caps text-accent">{t.eyebrow}</p>
          <h1
            id="headline"
            className="mt-2 max-w-[18ch] font-heading text-title font-bold leading-[1.02] tracking-display text-fg-primary"
          >
            {t.headline}
          </h1>
          <p className="mt-3 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.sub}</p>
        </div>

        {DISPLAY.showcase && (
          <figure className="rounded-control border border-border-strong bg-surface-raised p-4 sm:p-6">
            <blockquote
              lang={DISPLAY.tag}
              className="font-heading text-section font-semibold leading-tight tracking-display text-dialect"
            >
              {`«${DISPLAY.showcase.line}»`}
            </blockquote>
            <figcaption className="mt-3 border-t border-border-subtle pt-3">
              <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">
                {t.showcaseLabel}
              </span>
              <p className="mt-1 text-lead leading-relaxed text-fg-primary">{t.showcaseMeaning}</p>
            </figcaption>
          </figure>
        )}
      </section>

      <div className="pb-12 sm:pb-16">
        <Chat locale={locale} dict={dict} />
      </div>

      <section className="border-y border-border-subtle py-10 sm:py-12" aria-labelledby="rules">
        <h2 id="rules" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
          {t.correspondencesTitle}
        </h2>
        <div className="mt-6">
          <CorrespondenceFigure />
        </div>
      </section>

      <section className="border-b border-border-subtle py-10 sm:py-12" aria-labelledby="trust">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <h2
              id="trust"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {t.trustTitle}
            </h2>
            <p className="mt-4 max-w-measure text-base leading-relaxed text-fg-secondary">{t.trustBody}</p>
            {/* The claim's evidence moved to the method page with the rule
                list it belongs to, so this points there rather than at a
                page that asked the reader for Zurich German they cannot write. */}
            <Link
              href={href(locale, "method")}
              className="mt-5 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
            >
              {t.trustLink}
            </Link>
          </div>
          <ul className="flex flex-col gap-2 self-start rounded-control border border-border-subtle bg-surface-raised p-4 font-mono text-sm">
            {DISPLAY.rules.slice(0, 5).map((rule) => (
              <li key={rule.label} className="flex flex-wrap items-baseline gap-2">
                <span className="text-accent">✕</span>
                <span className="text-fg-primary">{rule.label}</span>
                {rule.origin && <span className="text-[11px] uppercase tracking-caps text-fg-muted">{rule.origin}</span>}
                {rule.suggest && <span className="text-ok">→ {rule.suggest}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border-subtle py-10 sm:py-12" aria-labelledby="dialect">
        <h2
          id="dialect"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.dialectTitle}
        </h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <p className="max-w-measure text-base leading-relaxed text-fg-secondary sm:text-lg">{t.dialectBody}</p>
          {DISPLAY.family && <DialectFigure plannedLabel={t.dialectPlanned} />}
        </div>
      </section>

      <section className="border-b border-border-subtle py-12 sm:py-16" aria-labelledby="pillars">
        <h2 id="pillars" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
          {t.pillarsTitle}
        </h2>
        <div className="mt-6 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {dict.pillars.map((s, i) => (
            <article key={s.title}>
              <div className="mb-3 font-mono text-[11px] uppercase tracking-caps text-accent">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-heading text-xl font-semibold leading-tight tracking-display text-fg-primary">
                {s.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-fg-secondary">{s.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={href(locale, "method")}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {t.methodLink}
          </Link>
          <Link
            // Research merged into Method: the evidence is the argument FOR
            // the method, not a peer of it. The anchor keeps the link honest.
            href={`${href(locale, "method")}#facts`}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {t.researchLink}
          </Link>
        </div>
      </section>

      <section className="my-12 border-l-2 border-accent bg-surface-raised px-5 py-6 sm:my-16 sm:px-6">
        <h2 className="font-heading text-xl font-semibold leading-tight tracking-display text-fg-primary">
          {t.contributeTitle}
        </h2>
        <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.contributeBody}</p>
        <Link
          href={href(locale, "contribute")}
          className="mt-5 inline-flex min-h-11 items-center rounded-control bg-accent px-6 font-medium text-on-accent hover:opacity-90"
        >
          {t.contributeCta}
        </Link>
      </section>
    </Shell>
  );
}
