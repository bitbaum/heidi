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
import { pageMetadata } from "@/lib/config/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; token?: string; method?: string; error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  return pageMetadata(raw, "sign-in", { title: authLabels(isLocale(raw) ? raw : DEFAULT_LOCALE).signIn, noindex: true });
}

/** Every way in, on one screen. No OrangeCat account needed. */
export default async function SignInPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const query = await searchParams;
  const next = safeReturn(query.next, href(locale, ""));
  if ((await getSession()) && !query.token && (query.error !== "INVALID_TOKEN" || query.method === "magic-link"))
    redirect(next);
  const dict = getDictionary(locale);
  const labels = authLabels(locale);
  // The OrangeCat sentence promises a button; it is said only where the button is.
  const methods = signInMethods(process.env, mailConfigured());
  const ready = authStatus().ready;
  return (
    <Shell>
      <PageHeader
        title={
          query.token || (query.error === "INVALID_TOKEN" && query.method !== "magic-link")
            ? (labels.recovery?.reset ?? labels.signIn)
            : labels.signIn
        }
      />
      {/*
        THE FORM FIRST, the reasons under it. At 390px the explanation sat
        between the title and the form, and the submit button ended at
        y=855, under the fold of a phone (QA, 12 Nov). Somebody on this page
        came to sign in; the sentence about what an account needs is still
        here, one screen down, for whoever wants it.
      */}
      <div className="max-w-md pt-6 pb-10 sm:py-14">
        {ready ? (
          <HeidiSignIn
            labels={labels}
            methods={methods}
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
        <p className="mt-10 max-w-measure text-sm leading-relaxed text-fg-secondary">
          {methods.signin ? `${dict.auth.whyBody} ${dict.auth.whyShared}` : dict.auth.whyBody}
        </p>
      </div>
    </Shell>
  );
}
