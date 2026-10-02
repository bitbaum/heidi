import type { Metadata } from "next";
import { SignInError } from "@bitbaum/accountkit";
import { signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { Shell } from "../../_components/page-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Where Auth.js sends a failed sign-in. "Try again" starts the sign-in again
 * — it used to go to the home page, which is not trying again. The screen is
 * @bitbaum/accountkit's SignInError, shared by every app; it never prints the
 * provider's error code (useless to a visitor, a gift to anyone probing).
 */
export default async function AuthErrorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  // Auth.js's ?error= code: classified by SignInError, never shown.
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const home = href(locale, "");

  async function retry() {
    "use server";
    await signIn("orangecat", { redirectTo: home });
  }

  return (
    <Shell>
      <SignInError
        error={(await searchParams).error}
        retry={retry}
        home={home}
        labels={{
          kicker: dict.auth.signIn,
          failedTitle: dict.auth.errorTitle,
          failedBody: dict.auth.errorBody,
          deniedTitle: dict.auth.errorTitle,
          deniedBody: dict.auth.errorBody,
          configurationTitle: dict.auth.errorTitle,
          configurationBody: dict.auth.errorBody,
          tryAgain: dict.auth.tryAgain,
          home: dict.errors.backHome,
        }}
      />
    </Shell>
  );
}
