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
import { HeidiSignUp } from "../_components/auth-screens";
import { pageMetadata } from "@/lib/config/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  return pageMetadata(raw, "sign-up", { title: authLabels(isLocale(raw) ? raw : DEFAULT_LOCALE).createAccount, noindex: true });
}

/** A new account in one step. No real name and no other product needed. */
export default async function SignUpPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const next = safeReturn((await searchParams).next, href(locale, ""));
  if (await getSession()) redirect(next);
  const dict = getDictionary(locale);
  const labels = authLabels(locale);
  // The OrangeCat sentence promises a button; it is said only where the button is.
  const methods = signInMethods(process.env, mailConfigured());
  return (
    <Shell>
      <PageHeader title={labels.createAccount} lead={methods.signin ? `${dict.auth.whyBody} ${dict.auth.whyShared}` : dict.auth.whyBody} />
      <div className="max-w-md py-10 sm:py-14">
        {authStatus().ready ? (
          <HeidiSignUp
            labels={labels}
            methods={methods}
            next={next}
            signUpPath={href(locale, "sign-up")}
            signInPath={`${href(locale, "sign-in")}?next=${encodeURIComponent(next)}`}
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
