import type { Metadata } from "next";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { afterSignIn } from "@/lib/domain/preferences/language";
import { LISTENING_SOURCES } from "@/lib/listening/sources";
import { sweepFor } from "@/lib/channels/service";
import { followsFor, recentVideosFor } from "@/lib/channels/store";
import { MAX_FOLLOWS } from "@/app/api/channels/route";
import { BandHeader, Section, Shell } from "../_components/page-shell";
import { ChannelsBoard, type Suggestion } from "../_components/channels-board";
import { PushCard } from "../_components/push-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.channels.title, description: dict.channels.lead, robots: { index: false, follow: false } };
}

/**
 * The channels a person follows: what is new, the list, how to add one, and
 * the register's suggestions. Personal, like the dashboard, and reached from
 * `/listen`, the dashboard and a notification rather than the menu.
 *
 * Stale feeds are read here, inline and bounded, before the lists are
 * queried — so the page is right on a box where the hourly timer was never
 * installed. On one where it was, nothing is stale and this costs nothing.
 */
export default async function ChannelsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.channels;

  if (!dbConfigured() || !authEnabled) {
    return (
      <Shell>
        <BandHeader title={t.title} lead={t.lead} />
        <Section border="top">
          <p className="max-w-measure text-base text-fg-secondary">{t.notConfigured}</p>
        </Section>
      </Shell>
    );
  }

  const session = await auth();
  const actorId = session?.actorId;
  if (!actorId) {
    return (
      <Shell>
        <BandHeader title={t.title} lead={t.lead} />
        <Section border="top">
          <div className="max-w-measure rounded-control border border-border-strong bg-surface-raised px-4 py-5">
            <p className="text-base leading-relaxed text-fg-secondary">{t.signInFirst}</p>
            <form
              className="mt-4"
              action={async () => {
                "use server";
                await signIn("orangecat", { redirectTo: afterSignIn(href(locale, "channels")) });
              }}
            >
              <button type="submit" className="inline-flex min-h-11 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90">
                {dict.auth.signInWith}
              </button>
            </form>
          </div>
        </Section>
      </Shell>
    );
  }

  try {
    await sweepFor(actorId);
  } catch (error) {
    console.warn("[heidi/channels] refresh failed:", error instanceof Error ? error.message : String(error));
  }
  const [channels, videos] = await Promise.all([followsFor(actorId), recentVideosFor(actorId)]);

  // The register's YouTube rows, as suggestions — each with what is spoken,
  // which is the one fact a learner cannot check for themselves.
  const suggestions: Suggestion[] = LISTENING_SOURCES.filter((s) => s.medium === "youtube" && s.linkKind === "play").map((s) => ({
    id: s.id,
    name: s.name,
    publisher: s.publisher,
    url: s.url,
    spoken: s.spoken,
  }));

  return (
    <Shell>
      <BandHeader title={t.title} lead={t.lead} />
      <div className="border-t border-border-subtle pt-8 lg:pt-10">
        <ChannelsBoard t={t} listeningT={dict.listening} locale={locale} channels={channels} videos={videos} suggestions={suggestions} maxFollows={MAX_FOLLOWS} />
      </div>
      <Section id="notifications" title={t.notifications.title} border="top">
        <PushCard t={t.notifications} locale={locale} signedIn hasChannels={channels.length > 0} />
      </Section>
    </Shell>
  );
}
