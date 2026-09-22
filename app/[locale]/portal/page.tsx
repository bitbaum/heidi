import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";

/**
 * The old address of the dashboard, which is now the locale root.
 *
 * WHY A REDIRECT AND NOT A SECOND COPY. It rendered `<Dashboard />`, and so
 * did `/` — which is the same duplication that made "start and chat show the
 * same thing" a fair complaint, one pair further along. Two addresses for one
 * page teach a reader that the menu is unreliable.
 *
 * The route stays because people have bookmarked it, the sign-in flow has sent
 * visitors back to it, and a 404 on a personal page is the worst possible
 * answer to "where did my words go".
 *
 * `redirect()` here rather than a rewrite in middleware, for the reason the
 * middleware file states at length: `nextUrl.clone()` inherits the external
 * protocol behind Caddy, and the last rewrite took production down for every
 * signed-in visitor by dialling TLS at an http socket. A redirect sends a
 * Location header and guesses nothing.
 */
export default async function PortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  redirect(href(locale, ""));
}
