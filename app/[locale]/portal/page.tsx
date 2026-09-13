import type { Metadata } from "next";
import Link from "next/link";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALE_TAGS, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { Shell } from "../_components/page-shell";
import { CowMark } from "../_components/cow-mark";
import { SignOutButton } from "../_components/account-control";
import { SavedWords } from "../_components/saved-words";
import { GroupList } from "../_components/group-list";
import { dbConfigured } from "@/lib/db";
import { groupsFor } from "@/lib/domain/groups/store";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // Nobody should find a personal space through a search engine.
  return { title: dict.auth.portalTitle, robots: { index: false, follow: false } };
}

/**
 * The portal — today it holds an identity and an honest list of what it will
 * hold next. Shipping it at this size is deliberate: the account is the part
 * that has to exist before any of the rest can, and a page that says so is
 * better than one that pretends to be finished.
 */
export default async function PortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.auth;
  const session = authEnabled ? await auth() : null;
  const signedIn = Boolean(session?.actorId);

  // Queried here rather than fetched on mount: the page already has the
  // session, and a signed-out visitor costs no query at all.
  const groups = signedIn && dbConfigured() ? await groupsFor(session!.actorId!) : [];

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
      <header className="flex items-start gap-4 py-10 sm:py-12">
        <CowMark size={44} className="mt-1 shrink-0 text-fg-primary" />
        <div>
          <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
            {t.portalTitle}
          </h1>
          <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.portalLead}</p>
        </div>
      </header>

      <div className="grid gap-10 border-t border-border-subtle pt-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
        {/* Theirs, and it needs no account — so it leads. */}
        <main>
          <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {dict.saved.title}
          </h2>
          <p className="mb-5 mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">
            {dict.saved.lead}
          </p>
          <SavedWords t={dict.saved} locale={LOCALE_TAGS[locale]} />

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
            <Link
              href={href(locale, "check")}
              className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-strong px-4 text-center font-medium text-fg-primary hover:bg-surface-raised"
            >
              {dict.nav.check}
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
