import type { Metadata } from "next";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { dbConfigured } from "@/lib/db";
import { looksLikeToken } from "@/lib/domain/groups/invite";
import { PageHeader, Section, Shell } from "../../_components/page-shell";
import { JoinButton } from "../../_components/join-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.groups.joinTitle, robots: { index: false, follow: false } };
}

/**
 * Following an invite link.
 *
 * The page deliberately does NOT look the token up and show the group's name
 * before you sign in. It would be friendlier, and it would turn the link into
 * an oracle: anyone who found one in a forwarded message could confirm it was
 * live, and a script could tell a valid token from an invalid one without ever
 * holding an account. Joining is the only thing that resolves it.
 *
 * The token stays in the URL across the sign-in round trip because
 * `redirectTo` brings the visitor back to this same page — so following a
 * link while signed out works, which is the normal case for an invitation.
 */
export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale: raw, token } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.groups;

  const usable = dbConfigured() && authEnabled && looksLikeToken(token);

  if (!usable) {
    return (
      <Shell>
        <PageHeader eyebrow={t.title} title={t.joinTitle} />
        <Section>
          <p className="max-w-measure text-base text-fg-secondary">
            {dbConfigured() && authEnabled ? t.joinFailed : t.notConfigured}
          </p>
        </Section>
      </Shell>
    );
  }

  const session = await auth();

  return (
    <Shell>
      <PageHeader eyebrow={t.title} title={t.joinTitle} lead={t.lead} />
      <Section>
        {session?.actorId ? (
          <JoinButton token={token} t={t} locale={locale} />
        ) : (
          <div className="max-w-measure rounded-control border border-border-strong bg-surface-raised px-4 py-5">
            <p className="text-base leading-relaxed text-fg-secondary">{t.joinBody}</p>
            <form
              className="mt-4"
              action={async () => {
                "use server";
                // Back to this page, token intact, so the invitation survives
                // the round trip through OrangeCat.
                await signIn("orangecat", { redirectTo: href(locale, `join/${token}`) });
              }}
            >
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
              >
                {dict.auth.signInWith}
              </button>
            </form>
          </div>
        )}
      </Section>
    </Shell>
  );
}
