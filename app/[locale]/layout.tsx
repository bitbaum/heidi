import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, isLocale, type Locale } from "@/lib/i18n/locales";
import { SITE_URL } from "@/lib/config/site";
import { THEME_SCRIPT } from "@/lib/browser/theme";
import { SiteHeader } from "./_components/site-header";
import { AccountControl } from "./_components/account-control";
import { SiteFooter } from "./_components/site-footer";
import { ChatDock } from "./_components/chat/dock";

/**
 * This is the root layout. There is deliberately no `app/layout.tsx`: `<html
 * lang>` has to carry the actual language of the page, and a layout above the
 * locale segment cannot know it. Middleware sends every non-localised path
 * here, so nothing renders outside a locale.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  // hreflang for every locale, so Google serves the Italian page to an Italian
  // reader instead of picking one and treating the rest as duplicates.
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_TAGS[l], `${SITE_URL}/${l}`]));

  return {
    title: { default: dict.meta.title, template: `%s · Heidi` },
    description: dict.meta.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: { ...languages, "x-default": `${SITE_URL}/${DEFAULT_LOCALE}` },
    },
    openGraph: {
      siteName: "Heidi",
      type: "website",
      locale: LOCALE_TAGS[locale],
      title: dict.meta.title,
      description: dict.meta.description,
      url: `${SITE_URL}/${locale}`,
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description: dict.meta.description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  return (
    <html
      lang={LOCALE_TAGS[locale]}
      /**
       * Because the script below deliberately changes this element before
       * React ever sees it.
       *
       * The server cannot know the reader's theme — it is in their browser —
       * so the server renders `<html>` bare and the pre-paint script stamps
       * `data-theme` on it. React then hydrates, finds an attribute it did not
       * write, and reports a mismatch. The attribute is correct; React's
       * expectation is what is wrong.
       *
       * This is NOT a blanket silencer. React applies it to THIS element's own
       * attributes and one level deep, not to the tree — so a real mismatch
       * inside the page still fails loudly. It is the documented way to do
       * exactly this, and the alternative is to render nothing until an effect
       * runs, which is the flash the script exists to prevent.
       */
      suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/*
          The reader's theme, stamped BEFORE anything is painted.

          `globals.css` has carried a full dark palette since the retheme,
          guarded on `data-theme` — and nothing ever set that attribute, so the
          palette was unreachable. This is what makes it reachable.

          An inline script rather than an effect, and first in the body rather
          than anywhere else, because an effect runs after the first paint: a
          reader who chose dark would watch a white page flash to black on
          every single navigation. That defect is worse than having no toggle.

          `dangerouslySetInnerHTML` is the only way to emit an inline script
          from React, and what goes in is generated from constants in
          `lib/browser/theme.ts` — no interpolated user input, nothing that
          could come from a request.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          {dict.nav.skipToContent}
        </a>

        <SiteHeader
          locale={locale}
          dict={dict}
          // Two slots, and exactly one of them renders anything for a given
          // session — see the note in `account-control.tsx`. Signed in the
          // avatar is in the corner at every width; signed out the sheet keeps
          // it on a phone, because five controls do not fit in 320px.
          account={<AccountControl locale={locale} dict={dict} placement="bar" />}
          accountSheet={<AccountControl locale={locale} dict={dict} placement="sheet" />}
        />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter locale={locale} dict={dict} />

        {/* Heidi, reachable from every page. It hides itself on the pages that
            already hold a conversation — see the note in the component and the
            `data-chat="surface"` rule in globals.css. */}
        <ChatDock locale={locale} dict={dict} />

        {/* The Loki feedback widget. The owner looks at their own site,
            points at what they do not like, and an agent changes it. Env-gated,
            so a local run and a fork carry no widget at all. */}
        {process.env.NEXT_PUBLIC_FC_WIDGET_TOKEN && (
          <Script
            src="https://loki.orangecat.ch/widget.js"
            // lazyOnload, not afterInteractive. This is a THIRD-PARTY origin:
            // it costs its own DNS, TCP and TLS handshake before it sends a
            // byte, and measured on a real (slow) connection it was the single
            // slowest request on the page at 4,766ms — while the page itself
            // was still fetching what it needs. Nothing about a feedback
            // launcher is urgent; it belongs after the page is idle.
            strategy="lazyOnload"
            data-fc-project={process.env.NEXT_PUBLIC_FC_WIDGET_TOKEN}
          />
        )}
      </body>
    </html>
  );
}
