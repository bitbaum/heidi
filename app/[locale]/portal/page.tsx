import type { Metadata } from "next";
import Link from "next/link";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PageHeader, Section, Shell } from "../_components/page-shell";
import { SignOutButton } from "../_components/account-control";

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

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.portal} title={t.portalTitle} lead={t.portalLead} />

      <Section>
        {!authEnabled ? (
          <p className="max-w-measure rounded-control border border-border-strong bg-surface-raised px-4 py-3 text-base text-fg-secondary">
            {t.unavailable}
          </p>
        ) : signedIn ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-control border border-border-strong bg-surface-raised px-4 py-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.signedInAs}</p>
              <p className="mt-1 text-lg text-fg-primary">
                {session?.user?.name || session?.user?.email || session?.actorId}
              </p>
            </div>
            <SignOutButton locale={locale} dict={dict} />
          </div>
        ) : (
          <div className="max-w-measure rounded-control border border-border-strong bg-surface-raised px-4 py-5">
            <h2 className="font-heading text-xl font-semibold leading-tight tracking-display text-fg-primary">
              {t.notSignedIn}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-fg-secondary">{t.notSignedInBody}</p>
            <form
              className="mt-5"
              action={async () => {
                "use server";
                await signIn("orangecat", { redirectTo: href(locale, "portal") });
              }}
            >
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-control bg-accent px-6 font-medium text-on-accent hover:opacity-90"
              >
                {t.signInWith}
              </button>
            </form>
          </div>
        )}
      </Section>

      <Section title={t.soonTitle}>
        <ul className="flex flex-col">
          {t.soonList.map((item) => (
            <li key={item} className="flex gap-4 border-b border-border-subtle py-3 last:border-b-0">
              <span aria-hidden="true" className="text-accent">
                ·
              </span>
              <span className="max-w-measure text-base leading-relaxed text-fg-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.whyTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.whyBody}</p>
        <Link
          href={href(locale, "")}
          className="mt-5 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
        >
          {dict.nav.home}
        </Link>
      </Section>
    </Shell>
  );
}
