import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, authEnabled, signIn } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { formatDate } from "@/lib/i18n/dates";
import { afterSignIn } from "@/lib/domain/preferences/language";
import { isFollowing, videoById } from "@/lib/channels/store";
import { watchUrl } from "@/lib/channels/youtube";
import { isItemId } from "@/lib/channels/rss";
import { Section, Shell } from "../../_components/page-shell";
import { VideoLesson } from "../../_components/video-lesson";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; video: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.channels.title, robots: { index: false, follow: false } };
}

/**
 * One video from a followed channel: watch it, answer about it, read it.
 *
 * Only a follower of the channel may open it — the page is where the
 * transcript is fetched and the questions are written, both shared with the
 * other followers, so somebody who follows nothing cannot spend those calls.
 */
export default async function VideoPage({ params }: { params: Promise<{ locale: string; video: string }> }) {
  const { locale: raw, video: videoId } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.channels;
  if (!isItemId(videoId)) notFound();

  if (!dbConfigured() || !authEnabled) {
    return (
      <Shell>
        <Section>
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
        <Section>
          <div className="max-w-measure rounded-control border border-border-strong bg-surface-raised px-4 py-5">
            <p className="text-base leading-relaxed text-fg-secondary">{t.signInFirst}</p>
            <form
              className="mt-4"
              action={async () => {
                "use server";
                await signIn("orangecat", { redirectTo: afterSignIn(href(locale, `channels/${videoId}`)) });
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

  const video = await videoById(videoId);
  if (!video || !(await isFollowing(actorId, video.channelId))) notFound();
  // Where "open it there" goes: the video on YouTube, or the show's page at
  // its publisher — never the bare audio file, which a browser would download.
  const url = video.kind === "podcast" ? video.channelUrl : watchUrl(video.id);

  return (
    <Shell>
      <header className="border-b border-border-subtle py-8 sm:py-10">
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{video.kind === "podcast" ? t.lesson.eyebrowEpisode : t.lesson.eyebrow}</p>
        <h1 className="mt-2 font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">{video.title}</h1>
        <p className="mt-3 text-base text-fg-secondary">
          {fill(t.lesson.from, { channel: video.channelName })} · {formatDate(video.publishedAt, locale, "long")}
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Link href={href(locale, "channels")} className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent">
            ← {t.lesson.back}
          </Link>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent">
            {video.kind === "podcast" ? t.lesson.openAtPublisher : t.lesson.openOnYoutube}
          </a>
        </p>
      </header>
      <div className="py-8">
        <VideoLesson video={video} t={t.lesson} locale={locale} videoUrl={url} />
      </div>
    </Shell>
  );
}
