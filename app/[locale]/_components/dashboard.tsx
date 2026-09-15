import Link from "next/link";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { LOCALE_TAGS, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { Shell } from "./page-shell";
import { CowMark } from "./cow-mark";
import { SignOutButton } from "./account-control";
import { SavedWords } from "./saved-words";
import { GroupList } from "./group-list";
import { ReviewPanel } from "./review-panel";
import { PatternsPanel } from "./patterns-panel";
import { RecentConversations } from "./recent-conversations";
import { dbConfigured } from "@/lib/db";
import { groupsFor } from "@/lib/domain/groups/store";
import { conversationsFor } from "@/lib/domain/conversations/store";

/**
 * The learner's own page, wherever it is rendered.
 *
 * Lifted out of `/portal` so that `/` can render it too. Signed in, the locale
 * root IS this — George's framing: "once we build dashboard, start could be
 * dashboard, otherwise it is a public page."
 *
 * A COMPONENT, NOT A REWRITE. The first attempt at "different page, same
 * address" was a middleware rewrite, and it took production down for every
 * signed-in visitor: `nextUrl.clone()` inherits the external protocol behind
 * Caddy, so Next dialled TLS at an http socket. Nothing in the test suite
 * could see it, because the failure needs a real reverse proxy. Deciding in
 * the PAGE reconstructs no URL and guesses no protocol.
 */

export async function Dashboard({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.auth;
  const session = authEnabled ? await auth() : null;
  const signedIn = Boolean(session?.actorId);

  // Queried here rather than fetched on mount: the page already has the
  // session, and a signed-out visitor costs no query at all. In parallel,
  // because neither answer depends on the other and this page is now the
  // signed-in landing surface — two round trips in series would be felt.
  const [groups, conversations] = signedIn && dbConfigured()
    ? await Promise.all([groupsFor(session!.actorId!), conversationsFor(session!.actorId!)])
    : [[], []];

  return (
    <Shell>
      {/* A personal space, not a document about one.
          It read: eyebrow "MEIN BEREICH" over the title "Mein Bereich" — the
          same words twice — then four full-width sections stacked down 2,200px
          of a mostly empty column, ending in an essay about the identity
          provider. Nothing on it was anything to DO, and the only way back to
          the tool was a small link at the very bottom.
          Now: their words fill the page, because that is the part that is
          theirs and it works signed out; the two tools sit one tap away; the
          account and the roadmap are beside it, sized like the secondary
          things they are. */}
      {/* A personal space is the one page that may be warm. The pattern is
          6% black — felt, not read — and it stops at the rule, so the working
          part of the page stays plain. */}
      <header className="-mx-5 flex items-start gap-4 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <CowMark size={44} className="mt-1 shrink-0 text-fg-primary" />
        <div>
          <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
            {t.portalTitle}
          </h1>
          <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.portalLead}</p>
        </div>
      </header>

      <div className="grid gap-10 border-t border-border-subtle pt-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
        {/* SOMETHING TO DO LEADS, and everything else is underneath it.
            This page used to open with a list — their saved words — and a list
            is a thing to look at. The question a personal page has to answer
            first is "what should I do next", and for this product the honest
            answer is the one the roadmap already named: the words you did not
            know, asked again at the right moment. The list is still here; it
            is just no longer the first thing, because reading your own
            vocabulary is not practising it.

            It needs no account, which is why it can lead: review runs entirely
            in the browser, on the words already in it. */}
        <main>
          <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {dict.review.title}
          </h2>
          <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">
            {dict.review.lead}
          </p>
          <ReviewPanel t={dict.review} locale={locale} />

          {/* Only for someone signed in, because only then is there anything
              to resume — a signed-out conversation lives in their browser and
              is already on the page they left it on. */}
          {signedIn && (
            <section aria-labelledby="recent" className="mt-12 border-t border-border-subtle pt-10">
              <h2
                id="recent"
                className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
              >
                {dict.review.recentTitle}
              </h2>
              <div className="mt-3">
                <RecentConversations
                  conversations={conversations}
                  t={dict.review}
                  locale={locale}
                  untitled={dict.chat.full.untitled}
                />
              </div>
            </section>
          )}

          <PatternsPanel t={dict.review} />

          <section aria-labelledby="words" className="mt-12 border-t border-border-subtle pt-10">
            <h2
              id="words"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {dict.saved.title}
            </h2>
            <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">
              {dict.saved.lead}
            </p>
            <SavedWords t={dict.saved} locale={LOCALE_TAGS[locale]} />
          </section>

          {/* Groups sit beside the words rather than in the sidebar: they are
              the other half of what this page is FOR, and a list of rooms you
              are in is not a secondary control. */}
          <section aria-labelledby="groups" className="mt-12 border-t border-border-subtle pt-10">
            <h2
              id="groups"
              className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
            >
              {dict.groups.title}
            </h2>
            <div className="mt-3">
              <GroupList t={dict.groups} locale={locale} signedIn={signedIn} groups={groups} />
            </div>
          </section>
        </main>

        <aside className="flex flex-col gap-8 lg:border-l lg:border-border-subtle lg:pl-8">
          {/* The two tools, by name. A personal page with no way into the
              product is a dead end wearing a greeting. */}
          <nav aria-label={dict.nav.menu} className="flex flex-col gap-2">
            <Link
              href={href(locale, "")}
              className="inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-4 text-center font-medium text-on-accent hover:opacity-90"
            >
              {dict.chat.emptyTitle}
            </Link>
          </nav>

          <section aria-labelledby="account">
            <h2 id="account" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {t.account}
            </h2>
            {!authEnabled ? (
              <p className="mt-3 text-sm leading-relaxed text-fg-secondary">{t.unavailable}</p>
            ) : signedIn ? (
              <div className="mt-3">
                <p className="text-base text-fg-primary">
                  {session?.user?.name || session?.user?.email || session?.actorId}
                </p>
                <div className="mt-3">
                  <SignOutButton locale={locale} dict={dict} />
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm leading-relaxed text-fg-secondary">{t.notSignedInBody}</p>
                <form
                  className="mt-4"
                  action={async () => {
                    "use server";
                    await signIn("orangecat", { redirectTo: href(locale, "portal") });
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-raised"
                  >
                    {t.signInWith}
                  </button>
                </form>
                {/* Was a full section of its own. It answers one question —
                    why someone else's login — and that is a footnote to the
                    button, not a chapter. */}
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{t.whyBody}</p>
              </div>
            )}
          </section>

          <section aria-labelledby="soon">
            <h2 id="soon" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {t.soonTitle}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {t.soonList.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-fg-secondary">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
