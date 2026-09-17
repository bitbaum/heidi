import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, isLocale, type Locale } from "@/lib/i18n/locales";
import { SITE_URL } from "@/lib/config/site";
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
    <html lang={LOCALE_TAGS[locale]}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
        >
          {dict.nav.skipToContent}
        </a>

        <SiteHeader locale={locale} dict={dict} account={<AccountControl locale={locale} dict={dict} />} />

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
