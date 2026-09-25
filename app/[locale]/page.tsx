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

  return (
    <Shell>
      {/* One column, because the fold has ONE job: get a real Zurich sentence
          decoded in this person's hands. It used to spend the right half on a
          figure that quoted a line AND printed its meaning underneath — a
          picture of the product, placed next to the product. It proved nothing,
          because the visitor did not do it, and it pushed the box that does the
          work below the middle of the screen.

          That line is now the first thing you can press (see Chat's examples).
          Same asset, opposite effect: it opens the gap and offers to close it
          instead of closing it for you. */}
      <section className="pb-9 pt-8 sm:pb-16 sm:pt-14">
        <h1
          id="headline"
          className="max-w-[26ch] font-heading text-title font-bold leading-[1.04] tracking-display text-fg-primary"
        >
          {t.headline}
        </h1>
        {/* The eyebrow above this said "We are starting with Zurich" — a limit,
            announced before the visitor knew what the thing does, and then said
            again as its own heading further down the page. The scope belongs
            where it is argued, not in the greeting. */}
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.sub}</p>
      </section>

      <div className="pb-12 sm:pb-16">
        <div>
          <Chat locale={locale} dict={dict} dialect={{ tag: DISPLAY.tag, showcase: DISPLAY.showcase?.line }} />
        </div>
      </div>

      <section className="border-y border-border-subtle py-10 sm:py-12" aria-labelledby="rules">
        {/* Five sections, and their headings used to alternate between an
            11px mono caption and a full title with nothing deciding which — so
            "a dozen rules open hundreds of words", one of the best lines on the
            site, was whispered underneath type three times its size. A section
            is a section; they are all titled now. */}
        <h2 id="rules" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.correspondencesTitle}
        </h2>
        <div className="mt-6">
          <CorrespondenceFigure />
        </div>
      </section>

      <section className="border-b border-border-subtle py-10 sm:py-12" aria-labelledby="trust">
        <div className="grid grid-cols-safe gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
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
                {rule.origin && <span className="text-caption uppercase tracking-caps text-fg-muted">{rule.origin}</span>}
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
        <div className="mt-6 grid grid-cols-safe gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <p className="max-w-measure text-base leading-relaxed text-fg-secondary sm:text-lg">{t.dialectBody}</p>
          {DISPLAY.family && <DialectFigure plannedLabel={t.dialectPlanned} othersLabel={t.dialectOthers} />}
        </div>
      </section>

      <section className="border-b border-border-subtle py-12 sm:py-16" aria-labelledby="pillars">
        <h2 id="pillars" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.pillarsTitle}
        </h2>
        <div className="mt-6 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {dict.pillars.map((s, i) => (
            <article key={s.title}>
              <div className="mb-3 font-mono text-caption uppercase tracking-caps text-fg-muted">
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
        <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.contributeTitle}
        </h2>
        <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.contributeBody}</p>
        <Link
          href={href(locale, "contribute")}
          className="mt-5 inline-flex min-h-11 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
        >
          {t.contributeCta}
        </Link>
      </section>
    </Shell>
  );
}
