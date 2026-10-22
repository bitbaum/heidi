import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { formatDate } from "@/lib/i18n/dates";
import type { Video } from "@/lib/channels/store";

/**
 * One video, wherever it is listed: the channels page and the dashboard.
 * Thumbnail, title, channel, date, and whether it is new to this person.
 * One anatomy, so the two pages cannot describe the same video differently.
 */
export function VideoRow({ video, locale, t, isNew = false }: { video: Video; locale: Locale; t: Dictionary["channels"]; isNew?: boolean }) {
  return (
    <li className="border-t border-border-subtle first:border-t-0">
      <Link
        href={href(locale, `channels/${video.id}`)}
        className="flex min-h-16 items-center gap-4 py-3 transition-colors hover:bg-surface-raised"
      >
        {/* The platform's own thumbnail, as an <img>: it is a remote host
            Next's image loader is not configured for, and a 480px JPEG that
            renders at 112px needs no optimisation to be cheap. */}
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailUrl} alt="" width={112} height={63} loading="lazy" className="h-16 w-28 shrink-0 rounded-control bg-surface-sunk object-cover" />
        ) : (
          <span aria-hidden="true" className="h-16 w-28 shrink-0 rounded-control bg-surface-sunk" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-base font-semibold leading-snug tracking-display text-fg-primary">{video.title}</span>
          <span className="mt-1 block font-mono text-caption uppercase tracking-caps text-fg-muted">
            {isNew && <span className="mr-2 text-accent">{t.newBadge}</span>}
            {video.channelName} · {formatDate(video.publishedAt, locale, "short")}
            {video.transcriptState === "ready" && <> · {t.withTranscript}</>}
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-fg-muted">
          →
        </span>
      </Link>
    </li>
  );
}
