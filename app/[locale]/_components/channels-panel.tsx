import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import type { Video } from "@/lib/channels/store";
import { VideoRow } from "./video-row";

/**
 * The dashboard's slice of the channels page: the newest few videos, the new
 * ones marked, and the door to the rest. Rendered only once the person
 * follows something — a new account sees nothing here, which is the rule the
 * whole dashboard keeps.
 */
export function ChannelsPanel({ t, locale, videos }: { t: Dictionary["channels"]; locale: Locale; videos: Array<Video & { isNew: boolean }> }) {
  if (videos.length === 0) return null;
  return (
    <section aria-labelledby="channels-heading" id="channels" className="scroll-mt-anchor">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="channels-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.dashboard.title}
        </h2>
        <Link href={href(locale, "channels")} className="text-sm text-link underline underline-offset-4 hover:text-accent">
          {t.dashboard.all} →
        </Link>
      </div>
      <ul className="mt-3 flex flex-col">
        {videos.slice(0, 4).map((v) => (
          <VideoRow key={v.id} video={v} locale={locale} t={t} isNew={v.isNew} />
        ))}
      </ul>
    </section>
  );
}
