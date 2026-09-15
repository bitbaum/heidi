import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { Dashboard } from "../_components/dashboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // Nobody should find a personal space through a search engine.
  return { title: dict.auth.portalTitle, robots: { index: false, follow: false } };
}

/**
 * The dashboard at its own address.
 *
 * Kept even though `/` renders the same thing when signed in: it is where the
 * account control points, it is what a signed-out visitor is sent back to
 * after signing in, and it is a link people will have bookmarked. The page
 * itself is one line, because the dashboard is a component now.
 */
export default async function PortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return <Dashboard locale={locale} />;
}
