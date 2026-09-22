import type { Metadata } from "next";
import Link from "next/link";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PageHeader, Section, Shell } from "../_components/page-shell";
import { SignOutButton } from "../_components/account-control";
import { DataSection } from "./data-section";
import { ModelSection } from "./model-section";
import { VoiceSection } from "./voice-section";
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

  /**
   * The sections, once — used to build the index AND to title each one.
   *
   * WHY THE PAIR LIVES IN ONE PLACE. The page is six sections and 3,200 pixels
   * on a phone, one of which (the voice settings) is a third of it on its own.
   * Somebody who came to turn speech off had to scroll past language,
   * appearance and a paragraph about orthography to find it. Every section
   * already had an `id` — for links that point at one setting — and nothing
   * used them.
   *
   * Written as an object rather than two lists because the obvious version of
   * this is an index that lists six headings and a page that renders six
   * headings, which is the same information twice and drifts the first time a
   * heading is renamed. Its key order is the page order.
   */
  const sections = {
    language: t.languageTitle,
    appearance: t.appearanceTitle,
    voice: dict.voice.settingsTitle,
    model: t.modelTitle,
    account: t.accountTitle,
    data: t.dataTitle,
  } as const;

  return (
    <Shell>
      <PageHeader eyebrow={dict.nav.settings} title={t.title} lead={t.lead} />

      {/* Plain anchors: they work with no JavaScript, they are in the tab
          order, and the browser handles the scroll. */}
      <nav aria-label={t.title} className="border-b border-border-subtle pb-6">
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {Object.entries(sections).map(([id, title]) => (
            <li key={id} className="min-w-0">
              <a
                href={`#${id}`}
                className="inline-flex min-h-11 items-center wrap-anywhere text-sm text-link underline underline-offset-4 hover:text-accent"
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="language" title={sections.language}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.languageBody}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {LOCALES.map((l) => (
            <li key={l}>
              <Link
                href={href(l, "settings")}
                hrefLang={l}
                lang={l}
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
      <Section id="appearance" title={sections.appearance}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.appearanceBody}</p>
        <div className="mt-4">
          <ThemeControl t={t.theme} />
        </div>
      </Section>

      {/* Above the model and below appearance: this is the setting most
          likely to be looked for, because it is the one that changes what the
          product DOES rather than how it looks. */}
      <Section id="voice" title={sections.voice}>
        <VoiceSection t={dict.voice} />
      </Section>

      <Section id="model" title={sections.model}>
        <ModelSection t={t} model={dict.model} />
      </Section>

      <Section id="account" title={sections.account}>
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

      <Section id="data" title={sections.data}>
        {/* What is actually here, and how to be rid of it — rather than a
            paragraph about it and a link somewhere else. The labels come from
            the privacy page's own translations, so both pages name the same
            stores the same way in all seven languages. */}
        <DataSection t={t} labels={dict.privacy.flows} />
        {/* The locale root, not `/portal`. The dashboard moved back to `/`
            when `/` and `/portal` were found to be rendering the identical
            page; the old route still answers, with a redirect, so this link
            worked and cost every reader who pressed it an extra round trip to
            a Location header. A link that is one hop from correct is the kind
            of thing that stays wrong for a year. */}
        <Link
          href={href(locale, "")}
          className="mt-6 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
        >
          {dict.nav.portal}
        </Link>
      </Section>
    </Shell>
  );
}
