import { mailConfigured } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signInMethods } from "@bitbaum/accountkit/auth";
import { authStatus, getSession } from "@/lib/auth";
import { safeReturn } from "@/lib/auth/paths";
import { getDictionary } from "@/lib/i18n";
import { authLabels } from "@/lib/i18n/auth-labels";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PageHeader, Shell } from "../_components/page-shell";
import { HeidiSignIn } from "../_components/auth-screens";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; token?: string; error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  return {
    title: authLabels(isLocale(raw) ? raw : DEFAULT_LOCALE).signIn,
    robots: { index: false, follow: false },
  };
}

/** Every way in, on one screen. No OrangeCat account needed. */
export default async function SignInPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const query = await searchParams;
  const next = safeReturn(query.next, href(locale, ""));
  if ((await getSession()) && !query.token && query.error !== "INVALID_TOKEN")
    redirect(next);
  const dict = getDictionary(locale);
  const labels = authLabels(locale);
  const ready = authStatus().ready;
  return (
    <Shell>
      <PageHeader
        title={
          query.token || query.error === "INVALID_TOKEN"
            ? (labels.recovery?.reset ?? labels.signIn)
            : labels.signIn
        }
        lead={dict.auth.whyBody}
      />
      <div className="max-w-md py-10 sm:py-14">
        {ready ? (
          <HeidiSignIn
            labels={labels}
            methods={signInMethods(process.env, mailConfigured())}
            next={next}
            signInPath={href(locale, "sign-in")}
            signUpPath={`${href(locale, "sign-up")}?next=${encodeURIComponent(next)}`}
            initialError={Boolean(query.error)}
          />
        ) : (
          <p className="font-mono text-sm text-fg-muted">
            {dict.auth.unavailable}
          </p>
        )}
      </div>
    </Shell>
  );
}
