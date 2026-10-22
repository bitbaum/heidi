"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { plural } from "@/lib/i18n/plural";
import { formatDate } from "@/lib/i18n/dates";
import type { FollowedChannel, Video } from "@/lib/channels/store";
import { VideoRow } from "./video-row";

export type Suggestion = { id: string; name: string; publisher: string; url: string; spoken: string; medium: string };

/**
 * The channels page, signed in: what is new, what you follow, how to follow
 * more, and the register's suggestions.
 *
 * The lists are rendered on the server and passed in; after a follow or an
 * unfollow, `router.refresh()` re-runs the page rather than this file keeping
 * a second copy in sync — the same arrangement as the group list.
 *
 * On mount it tells the server "seen", so next time "new" means newer than
 * now. The markers on screen stay until the next visit: clearing them while
 * the person is reading them is the obvious bug.
 */
export function ChannelsBoard({
  t,
  listeningT,
  locale,
  channels,
  videos,
  suggestions,
  maxFollows,
}: {
  t: Dictionary["channels"];
  listeningT: Dictionary["listening"];
  locale: Locale;
  channels: FollowedChannel[];
  videos: Array<Video & { isNew: boolean }>;
  suggestions: Suggestion[];
  maxFollows: number;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channels.length === 0) return;
    void fetch("/api/channels/seen", { method: "POST" }).catch(() => undefined);
  }, [channels.length]);

  async function follow(value: string, key: string, register?: string) {
    if (!value.trim() || busy) return;
    setBusy(key);
    setError(null);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: value, register }),
      });
      if (!res.ok) {
        // A code, mapped to the reader's language here; never the server's words.
        const { reason } = (await res.json().catch(() => ({}))) as { reason?: string };
        setError(
          reason === "invalid"
            ? t.errors.invalid
            : reason === "not-found"
              ? t.errors.notFound
              : reason === "unreachable"
                ? t.errors.unreachable
                : reason === "too-many"
                  ? fill(t.errors.tooMany, { n: String(maxFollows) })
                  : reason === "spotify"
                    ? t.errors.spotify
                    : t.errors.failed,
        );
        return;
      }
      setInput("");
      router.refresh();
    } catch {
      setError(t.errors.failed);
    } finally {
      setBusy(null);
    }
  }

  async function unfollow(id: string) {
    if (busy) return;
    setBusy(id);
    try {
      await fetch(`/api/channels/${encodeURIComponent(id)}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const followedIds = new Set(channels.map((c) => c.id));
  const followedUrls = new Set(channels.map((c) => c.url.toLowerCase()));
  const fresh = videos.filter((v) => v.isNew);
  const rest = videos.filter((v) => !v.isNew);

  return (
    <div className="flex flex-col gap-12">
      {channels.length === 0 && <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.noneYet}</p>}

      {fresh.length > 0 && (
        <section aria-labelledby="channels-new-heading">
          <h2 id="channels-new-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {t.newTitle}
          </h2>
          <ul className="mt-4 flex flex-col">
            {fresh.map((v) => (
              <VideoRow key={v.id} video={v} locale={locale} t={t} isNew />
            ))}
          </ul>
        </section>
      )}

      {channels.length > 0 && (
        <section aria-labelledby="channels-latest-heading">
          <h2 id="channels-latest-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {t.latestTitle}
          </h2>
          {rest.length === 0 && fresh.length === 0 && <p className="mt-3 font-mono text-sm text-fg-muted">{t.noVideos}</p>}
          <ul className="mt-4 flex flex-col">
            {rest.slice(0, 20).map((v) => (
              <VideoRow key={v.id} video={v} locale={locale} t={t} />
            ))}
          </ul>
        </section>
      )}

      {channels.length > 0 && (
        <section aria-labelledby="channels-yours-heading">
          <h2 id="channels-yours-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {t.yoursTitle}
          </h2>
          <ul className="mt-4 flex flex-col">
            {channels.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle py-4 first:border-t-0">
                <div className="min-w-0 flex-1">
                  <a href={c.url} rel="noreferrer" className="inline-flex min-h-11 items-center text-base font-medium leading-snug text-link underline underline-offset-4 hover:text-accent">
                    {c.name}
                  </a>
                  <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                    {plural(c.kind === "podcast" ? t.episodes : t.videos, c.videoCount, locale)}
                    {c.newCount > 0 && <> · {plural(t.newCount, c.newCount, locale)}</>}
                    {c.checkedAt && <> · {formatDate(c.checkedAt, locale, "short")}</>}
                  </p>
                  {c.lastError && <p className="mt-1 text-sm text-fg-muted">{t.readFailed}</p>}
                </div>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void unfollow(c.id)}
                  className="inline-flex min-h-11 items-center rounded-control border border-border-subtle px-4 text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary disabled:opacity-60"
                >
                  {t.unfollow}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="channels-follow-heading" className="border-t border-border-subtle pt-8">
        <h2 id="channels-follow-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {t.followTitle}
        </h2>
        <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.followHint}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void follow(input, "form");
          }}
          className="mt-4 flex flex-wrap gap-2"
        >
          <label htmlFor="channel-input" className="sr-only">
            {t.followTitle}
          </label>
          <input
            id="channel-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            inputMode="url"
            autoComplete="off"
            placeholder={t.placeholder}
            className="min-h-11 min-w-0 flex-1 rounded-control border border-border-strong bg-surface-raised px-3 text-base text-fg-primary placeholder:text-fg-muted focus:border-fg-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy !== null || !input.trim()}
            className="inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action transition-colors disabled:bg-surface-sunk disabled:text-fg-muted"
          >
            {busy === "form" ? t.following : t.follow}
          </button>
        </form>
        {error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
      </section>

      {suggestions.length > 0 && (
        <section aria-labelledby="channels-suggested-heading">
          <h2 id="channels-suggested-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {t.suggestedTitle}
          </h2>
          <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.suggestedBody}</p>
          <ul className="mt-4 flex flex-col">
            {suggestions.map((s) => {
              const followed = followedIds.has(s.id) || followedUrls.has(s.url.toLowerCase());
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle py-4 first:border-t-0">
                  <div className="min-w-0 flex-1">
                    <a href={s.url} rel="noreferrer" className="inline-flex min-h-11 items-center text-base font-medium leading-snug text-link underline underline-offset-4 hover:text-accent">
                      {s.name}
                    </a>
                    <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                      {(listeningT.medium as Record<string, string>)[s.medium] ?? s.medium} · {s.publisher} · {(listeningT.spoken as Record<string, string>)[s.spoken] ?? s.spoken}
                    </p>
                  </div>
                  {followed ? (
                    <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.followedAlready}</span>
                  ) : (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => void follow(s.url, s.id, s.id)}
                      className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page disabled:opacity-60"
                    >
                      {busy === s.id ? t.following : t.follow}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-sm text-fg-muted">
        <Link href={href(locale, "listen")} className="text-link underline underline-offset-4 hover:text-accent">
          {listeningT.title} →
        </Link>
      </p>
    </div>
  );
}
