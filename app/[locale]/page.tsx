import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";
import { Chat } from "./_components/chat";
import { DialectFigure } from "./_components/dialect-figure";
import { CorrespondenceFigure } from "./_components/correspondence-figure";
import { Shell } from "./_components/page-shell";
import { Dashboard } from "./_components/dashboard";
import { SwissScene } from "./_components/swiss-scene";
import { auth, authEnabled } from "@/lib/auth";

/**
 * Dynamic, and EXPLICITLY so rather than by consequence.
 *
 * This page reads the session, which would normally opt it out of static
 * rendering on its own — except that `authEnabled` is false when no OIDC
 * secrets are present, so `auth()` is never called and Next sees no dynamic
 * API. The build output then depends on whether a secret happened to be set
 * when the build ran: static locally, dynamic on the box, or the reverse.
 *
 * A page that is static in one environment and dynamic in another is the same
 * shape of bug as the middleware rewrite that took production down — green
 * everywhere it was checked, wrong where it ran. So it is declared.
 */
export const dynamic = "force-dynamic";

/**
 * The tool is the page. Not a marketing page with the product behind a button:
 * someone arriving with a message they cannot read should be able to paste it
 * without signing up, clicking through, or reading anything first.
 *
 * The argument for the product sits underneath, for the visit where they are
 * deciding whether to trust it rather than trying to get through a Tuesday.
 *
 * SIGNED IN, THIS IS THE DASHBOARD — and it was the chat for a while, which
 * was a mistake reported by a reader in four words: "start and chat show the
 * same thing."
 *
 * They did. The bar named both, and pressing either rendered the identical
 * `ChatWorkspace`. Two doors onto one room is worse than one door, because a
 * reader reasonably concludes one of them must do something else and goes
 * looking for the difference.
 *
 * The argument for chat-at-root was that "a conversation beats a summary of
 * conversations", and it is a good argument that answered the wrong question.
 * The chat is not hard to reach — it is the second item on the bar, always
 * visible, never inside a panel. What the root should do is the thing no other
 * page does: say where this learner is and what is worth doing next. That is
 * the dashboard, which already existed and was one redirect away.
 *
 * `/portal` now redirects here rather than rendering the same dashboard at a
 * second address, because the duplicate pair was the whole complaint.
 *
 * THE COST, STATED: reading the session here opts this route into dynamic
 * rendering for everyone, and it is the `priority: 1` page a search engine
 * fetches. Paid deliberately. The alternative was a middleware rewrite, which
 * is what took production down for every signed-in visitor — `nextUrl.clone()`
 * inherits the external protocol behind Caddy and Next dialled TLS at an http
 * socket. A correct dynamic page beats a statically rendered 500, and crawlers
 * are always signed out so the HTML they get is unchanged.
 */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.home;

  // `auth()` rather than a cookie check: this decides what somebody SEES, and
  // the chat reads their conversations. A forged cookie must get the marketing
  // page, not somebody else's page shaped like theirs.
  // `auth()` rather than a cookie check: this decides what somebody SEES, and
  // the dashboard reads their words and their conversations. A forged cookie
  // must get the public page, not somebody else's page shaped like theirs.
  const session = authEnabled ? await auth() : null;
  if (session?.actorId) return <Dashboard locale={locale} />;

  const steps = [
    { ...t.steps[0], href: href(locale, "situations"), n: "01" },
    { ...t.steps[1], href: href(locale, "practice"), n: "02" },
    { ...t.steps[2], href: href(locale, "chat"), n: "03" },
  ];

  return (
    <Shell>
      {/* THE FOLD, in two columns: what Heidi is and the two ways in on the
          left, a picture on the right. It used to be a headline over a
          full-width chat box and then 440 words of argument; the argument now
          lives on /method, where a reader who wants it goes looking. */}
      <section className="grid grid-cols-safe items-center gap-8 pb-10 pt-8 sm:pb-14 sm:pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div>
          <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.eyebrow}</p>
          <h1
            id="headline"
            className="mt-3 max-w-[22ch] font-heading text-title font-bold leading-[1.04] tracking-display text-fg-primary"
          >
            {t.headline}
          </h1>
          <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.sub}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#try"
              className="inline-flex min-h-12 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
            >
              {t.ctaTry} ↓
            </a>
            <Link
              href={href(locale, "situations")}
              className="inline-flex min-h-12 items-center rounded-control border border-border-strong px-6 font-medium text-fg-primary hover:bg-surface-raised"
            >
              {t.ctaSituations} →
            </Link>
          </div>
          <p className="mt-5 text-sm text-fg-muted">{t.trustLine}</p>
        </div>
        <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
          <SwissScene label={t.illustration} bubble={t.bubble} />
        </div>
      </section>

      <section id="try" aria-labelledby="try-title" className="scroll-mt-24 border-t border-border-subtle pb-12 pt-10 sm:pb-16">
        <h2 id="try-title" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.tryTitle}
        </h2>
        <div className="mt-4" />
        <Chat locale={locale} dict={dict} dialect={{ tag: DISPLAY.tag, showcase: DISPLAY.showcase?.line }} />
      </section>

      <section className="border-t border-border-subtle py-10 sm:py-14" aria-labelledby="steps">
        <h2 id="steps" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.stepsTitle}
        </h2>
        <ol className="mt-6 grid grid-cols-safe gap-3 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n}>
              <Link
                href={step.href}
                className="group flex h-full flex-col rounded-control border border-border-subtle p-5 transition-colors hover:border-border-strong"
              >
                <span className="font-mono text-caption uppercase tracking-caps text-accent">{step.n}</span>
                <span className="mt-2 font-heading text-xl font-semibold tracking-display text-fg-primary">{step.title}</span>
                <span className="mt-2 flex-1 text-base leading-relaxed text-fg-secondary">{step.body}</span>
                <span className="mt-4 text-sm font-medium text-fg-primary underline underline-offset-4 group-hover:text-accent">
                  {step.cta} →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border-subtle py-10 sm:py-12" aria-labelledby="rules">
        <h2 id="rules" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.correspondencesTitle}
        </h2>
        <div className="mt-6">
          <CorrespondenceFigure />
        </div>
      </section>

      <section className="border-t border-border-subtle py-10 sm:py-12" aria-labelledby="dialect">
        <div className="grid grid-cols-safe gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <h2
              id="dialect"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {t.dialectTitle}
            </h2>
            <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary sm:text-lg">{t.dialectLead}</p>
            <Link
              href={href(locale, "dialect")}
              className="mt-4 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
            >
              {dict.nav.dialect} →
            </Link>
          </div>
          {DISPLAY.family && <DialectFigure plannedLabel={t.dialectPlanned} othersLabel={t.dialectOthers} />}
        </div>
      </section>

      <section className="my-10 flex flex-col gap-4 rounded-control bg-surface-raised p-6 sm:my-14 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-display text-fg-primary">{t.orgTitle}</h2>
          <p className="mt-1 max-w-measure text-base leading-relaxed text-fg-secondary">{t.orgBody}</p>
        </div>
        <Link
          href={href(locale, "organisations")}
          className="inline-flex min-h-11 shrink-0 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
        >
          {t.orgCta} →
        </Link>
      </section>
    </Shell>
  );
}
