import type { Metadata } from "next";
import Link from "next/link";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PageHeader, Section, Shell } from "../_components/page-shell";
import { SignOutButton } from "../_components/account-control";
import { ModelSection } from "./model-section";
import { ThemeControl } from "../_components/theme-control";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.settings.title, robots: { index: false, follow: false } };
}

/**
 * Settings — which did not exist until now.
 *
 * Language was only in the header switcher, the model only behind the attach
 * button, the account only on the portal, and what is stored on the device
 * nowhere at all. Four things a person might want to change, in four
 * unrelated places, none of them called settings.
 *
 * The order is deliberate: what you can change first, what is merely true
 * about your device last.
 */
export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.settings;
  const session = authEnabled ? await auth() : null;

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.settings} title={t.title} lead={t.lead} />

      <Section id="language" title={t.languageTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.languageBody}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {LOCALES.map((l) => (
            <li key={l}>
              <Link
                href={href(l, "settings")}
                hrefLang={l}
                aria-current={l === locale ? "true" : undefined}
                className={`inline-flex min-h-11 items-center border px-4 text-sm transition-colors ${
                  l === locale
                    ? "border-border-strong bg-fg-primary font-medium text-surface-page"
                    : "border-border-subtle text-fg-secondary hover:border-border-strong hover:text-fg-primary"
                }`}
              >
                {LOCALE_NAMES[l]}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* `id` on every section, so an answer or a link can point at the one
          setting it is about rather than at the top of the page. */}
      <Section id="appearance" title={t.appearanceTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.appearanceBody}</p>
        <div className="mt-4">
          <ThemeControl t={t.theme} />
        </div>
      </Section>

      <Section id="model" title={t.modelTitle}>
        <ModelSection t={t} model={dict.model} />
      </Section>

      <Section id="account" title={t.accountTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.accountBody}</p>
        <div className="mt-4">
          {!authEnabled ? (
            <p className="font-mono text-sm text-fg-muted">{dict.auth.unavailable}</p>
          ) : session?.actorId ? (
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-mono text-sm text-fg-primary">
                {session.user?.name || session.user?.email || session.actorId}
              </span>
              <SignOutButton locale={locale} dict={dict} />
            </div>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("orangecat", { redirectTo: href(locale, "settings") });
              }}
            >
              <button
                type="submit"
                className="inline-flex min-h-11 items-center border border-border-strong px-5 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page"
              >
                {dict.auth.signInWith}
              </button>
            </form>
          )}
        </div>
      </Section>

      <Section id="data" title={t.dataTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.dataBody}</p>
        <Link
          href={href(locale, "portal")}
          className="mt-4 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
        >
          {dict.nav.portal}
        </Link>
      </Section>
    </Shell>
  );
}
