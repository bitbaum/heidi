import { mailConfigured } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDeliverable, signInMethods } from "@bitbaum/accountkit/auth";
import { getAuth, getSession } from "@/lib/auth";
import { signInPath } from "@/lib/auth/paths";
import { getDictionary } from "@/lib/i18n";
import { authLabels } from "@/lib/i18n/auth-labels";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PageHeader, Shell } from "../_components/page-shell";
import { HeidiAccount } from "../_components/auth-screens";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  return {
    title: getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE).auth.account,
    robots: { index: false, follow: false },
  };
}

/** Everything about one's own account: name, ways in, passkeys, two-step codes, leaving. */
export default async function AccountPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const session = await getSession();
  if (!session) redirect(signInPath(href(locale, "account")));
  const dict = getDictionary(locale);
  const accounts = await getAuth()
    .api.listUserAccounts({ headers: await headers() })
    .catch(() => [] as { providerId: string }[]);
  const user = session.user;
  return (
    <Shell>
      <PageHeader title={dict.auth.account} />
      <div className="max-w-xl py-10 sm:py-14">
        <HeidiAccount
          labels={authLabels(locale)}
          methods={signInMethods(process.env, mailConfigured())}
          user={{
            name: user.name ?? "",
            email: isDeliverable(user.email) ? user.email : null,
            emailVerified: Boolean(user.emailVerified),
            role: user.role ?? "customer",
            twoFactorEnabled: Boolean(user.twoFactorEnabled),
          }}
          linked={(accounts as { providerId: string }[]).map(
            (a) => a.providerId,
          )}
          accountPath={href(locale, "account")}
          homePath={href(locale, "")}
        />
      </div>
    </Shell>
  );
}
