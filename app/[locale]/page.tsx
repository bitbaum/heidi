import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { VARIETY } from "@/lib/variety/active";
import { ruleLabel } from "@/lib/variety/pack";
import { Chat } from "./_components/chat";
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
      <section className="py-10 sm:py-14" aria-labelledby="headline">
        <p className="font-mono text-[11px] uppercase tracking-caps text-accent">{t.eyebrow}</p>
        <h1
          id="headline"
          className="mt-3 max-w-[18ch] font-heading text-3xl font-semibold leading-[1.08] tracking-display text-fg-primary sm:text-5xl"
        >
          {t.headline}
        </h1>
        <p className="mt-4 max-w-measure text-base leading-relaxed text-fg-secondary sm:text-lg">{t.sub}</p>
      </section>

      <div className="pb-12 sm:pb-16">
        <Chat locale={locale} dict={dict} />
      </div>

      <section className="border-y border-border-subtle py-10 sm:py-12" aria-labelledby="trust">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div>
            <h2
              id="trust"
              className="font-heading text-2xl font-semibold leading-tight tracking-display text-fg-primary sm:text-3xl"
            >
              {t.trustTitle}
            </h2>
            <p className="mt-4 max-w-measure text-base leading-relaxed text-fg-secondary">{t.trustBody}</p>
            <Link
              href={href(locale, "check")}
              className="mt-5 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
            >
              {t.trustLink}
            </Link>
          </div>
          <ul className="flex flex-col gap-2 self-start rounded-control border border-border-subtle bg-surface-raised p-4 font-mono text-sm">
            {VARIETY.rules.slice(0, 5).map((rule, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2">
                <span className="text-accent">✕</span>
                <span className="text-fg-primary">
                  {ruleLabel(rule)}
                </span>
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
          className="font-heading text-2xl font-semibold leading-tight tracking-display text-fg-primary sm:text-3xl"
        >
          {t.dialectTitle}
        </h2>
        <p className="mt-4 max-w-measure text-base leading-relaxed text-fg-secondary">{t.dialectBody}</p>
        {VARIETY.family && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-control bg-accent px-2.5 py-1 font-mono text-[11px] uppercase tracking-caps text-on-accent">
              {VARIETY.endonym}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {t.dialectPlanned}
            </span>
            {VARIETY.family.planned.map((d) => (
              <span
                key={d}
                className="rounded-control border border-border-strong px-2.5 py-1 font-mono text-[11px] uppercase tracking-caps text-fg-muted"
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="border-b border-border-subtle py-10 sm:py-12" aria-labelledby="rules">
        <h2 id="rules" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
          {t.correspondencesTitle}
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {VARIETY.correspondences.map((p) => (
            <li key={p.bridge} className="font-mono">
              <div className="text-lg sm:text-xl">
                <span className="text-fg-muted">{p.bridge}</span>
                <span className="mx-2 text-fg-muted" aria-hidden="true">
                  →
                </span>
                <span className="font-medium text-dialect">{p.target}</span>
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-caps text-fg-muted">{p.rule}</div>
            </li>
          ))}
        </ul>
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
            href={href(locale, "research")}
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
