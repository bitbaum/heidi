"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { DURATIONS, type Cadence, type Round, type RoundFormat } from "@/lib/domain/speaking/types";
import { DEFAULT_TIME_ZONE } from "@/lib/domain/speaking/schedule";

type T = Dictionary["speaking"];

/**
 * What is coming up, and a way to open one.
 *
 * The list is rendered on the SERVER and passed in, like `group-list`: a
 * signed-in visitor should not watch an empty box while a round trip finishes
 * for data the server already had the session to query. `router.refresh()`
 * after a write re-runs the server component rather than this file keeping a
 * second copy of the list in sync by hand.
 *
 * Dates are formatted in the round's OWN zone and say so. A round held at
 * 19:00 in Zurich shown as 18:00 to somebody whose laptop is on London time is
 * not wrong, but it is the wrong thing to be right about: everybody in the
 * room will say "seven".
 */
export function RoundList({
  t,
  locale,
  signedIn,
  actorId,
  rounds,
  topics,
}: {
  t: T;
  locale: Locale;
  signedIn: boolean;
  /**
   * Who is looking, so the host sees the controls only a host has.
   *
   * `round.mine` is about ATTENDING and is a different question — the host is
   * an attendee too, and conflating the two would offer "call it off" to
   * everybody who said they were coming.
   */
  actorId: string | null;
  rounds: Round[];
  /** To open a round straight from a proposal on the board. */
  topics: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  const act = useCallback(
    async (round: Round, next: "join" | "leave" | "cancel") => {
      if (busy) return;
      setBusy(round.id);
      setError(null);
      try {
        const res = await fetch(`/api/speaking/rounds/${round.id}`, {
          method: next === "join" ? "POST" : "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(next === "cancel" ? { cancel: true } : {}),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? t.failed);
          return;
        }
        router.refresh();
      } catch {
        setError(t.failed);
      } finally {
        setBusy(null);
      }
    },
    [busy, router, t.failed],
  );

  return (
    <section aria-labelledby="rounds-heading" className="mt-12">
      <h2 id="rounds-heading" className="font-heading text-section leading-tight tracking-display text-fg-primary">
        {t.roundsTitle}
      </h2>

      {rounds.length === 0 && <p className="mt-3 font-mono text-sm text-fg-muted">{t.roundsEmpty}</p>}

      {rounds.length > 0 && (
        <ul className="mt-4 grid gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle">
          {rounds.map((round) => (
            <li key={round.id} className="bg-surface-page p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-heading text-lg leading-tight tracking-display text-fg-primary">{round.title}</h3>
                <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
                  {/* Computed on the server — see `Round.live`. */}
                  {round.live && <span className="text-accent">{t.live} · </span>}
                  {round.format === "webinar" ? t.webinar : t.circle}
                  {round.cadence !== "once" && ` · ${round.cadence === "weekly" ? t.weekly : t.fortnightly}`}
                </span>
              </div>

              <p className="mt-1 text-sm text-fg-secondary">
                <When locale={locale} round={round} />
                {" · "}
                {round.durationMinutes} {t.minutes}
              </p>

              <p className="mt-1 font-mono text-[11px] uppercase tracking-caps text-fg-muted">
                {t.hostedBy} {round.hostName} · {round.attending}/{round.capacity} {t.attending}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {round.meetingUrl ? (
                  <a
                    href={round.meetingUrl}
                    target="_blank"
                    // noopener AND noreferrer: the link is supplied by whoever
                    // opened the round, so the tab it opens is not ours to
                    // trust with `window.opener` or with a referrer.
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-semibold text-fg-primary"
                  >
                    {t.joinRoom}
                  </a>
                ) : (
                  <span className="text-sm text-fg-muted">{t.noRoom}</span>
                )}

                {signedIn && !round.mine && round.attending < round.capacity && (
                  <button
                    type="button"
                    onClick={() => void act(round, "join")}
                    disabled={busy === round.id}
                    className="min-h-11 rounded-control bg-accent px-4 text-sm font-semibold text-on-accent disabled:opacity-50"
                  >
                    {t.join}
                  </button>
                )}
                {signedIn && !round.mine && round.attending >= round.capacity && (
                  <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.full}</span>
                )}
                {signedIn && round.mine && round.hostId !== actorId && (
                  <button
                    type="button"
                    onClick={() => void act(round, "leave")}
                    disabled={busy === round.id}
                    className="min-h-11 px-2 font-mono text-[11px] uppercase tracking-caps text-fg-muted disabled:opacity-50"
                  >
                    {t.leave}
                  </button>
                )}

                {/* The host does not "leave" their own round — they call it
                    off, which is a different act with a different consequence
                    for everybody holding it in a calendar. */}
                {signedIn && round.hostId === actorId && (
                  <button
                    type="button"
                    onClick={() => void act(round, "cancel")}
                    disabled={busy === round.id}
                    className="min-h-11 px-2 font-mono text-[11px] uppercase tracking-caps text-accent disabled:opacity-50"
                  >
                    {t.cancelRound}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-3 text-sm text-accent">{error}</p>}

      {signedIn ? (
        <OpenRound t={t} topics={topics} busy={opening} setBusy={setOpening} onDone={() => router.refresh()} />
      ) : (
        <p className="mt-4 max-w-measure text-base leading-relaxed text-fg-secondary">{t.signInFirst}</p>
      )}
    </section>
  );
}

/**
 * The next sitting, in the round's own zone.
 *
 * `timeZoneName: "short"` is not decoration — without it a time rendered in a
 * zone the reader is not in is a time they will get wrong by an hour and never
 * know why.
 */
function When({ locale, round }: { locale: Locale; round: Round }) {
  const label = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: round.timeZone,
        timeZoneName: "short",
      }).format(new Date(round.startsAt));
    } catch {
      return round.startsAt;
    }
  }, [locale, round.startsAt, round.timeZone]);
  return <span>{label}</span>;
}

/** Open a round. Collapsed behind a summary: most visitors are joining, not hosting. */
function OpenRound({
  t,
  topics,
  busy,
  setBusy,
  onDone,
}: {
  t: T;
  topics: Array<{ id: string; title: string }>;
  busy: boolean;
  setBusy: (value: boolean) => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [topicId, setTopicId] = useState("");
  const [format, setFormat] = useState<RoundFormat>("circle");
  const [cadence, setCadence] = useState<Cadence>("weekly");
  const [durationMinutes, setDuration] = useState<number>(45);
  const [when, setWhen] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (busy || !title.trim() || !when) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/speaking/rounds", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title,
            format,
            cadence,
            durationMinutes,
            // `datetime-local` gives a wall clock with no zone. It is read as
            // the HOST's local time, which is what they meant by typing it,
            // and converted to an instant here.
            startsAt: new Date(when).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE,
            meetingUrl,
            ...(topicId ? { topicId } : {}),
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? t.failed);
          return;
        }
        setTitle("");
        setWhen("");
        setMeetingUrl("");
        setTopicId("");
        onDone();
      } catch {
        setError(t.failed);
      } finally {
        setBusy(false);
      }
    },
    [busy, title, when, format, cadence, durationMinutes, meetingUrl, topicId, setBusy, onDone, t.failed],
  );

  const field = "mt-1 w-full rounded-control border border-border-subtle bg-surface-page p-3 text-base text-fg-primary";
  const label = "block font-mono text-[11px] uppercase tracking-caps text-fg-muted";

  return (
    <details className="mt-6 rounded-control border border-border-subtle bg-surface-raised p-4">
      <summary className="cursor-pointer font-heading text-lg leading-tight text-fg-primary">{t.openTitle}</summary>
      <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.openHint}</p>

      <form onSubmit={submit} className="mt-4 grid gap-4">
        <div>
          <label className={label} htmlFor="round-title">
            {t.roundTitleLabel}
          </label>
          <input
            id="round-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={80}
            className={field}
          />
        </div>

        {topics.length > 0 && (
          <div>
            <label className={label} htmlFor="round-topic">
              {t.boardTitle}
            </label>
            <select id="round-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)} className={field}>
              <option value="">—</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* One column on a phone, two from `sm`. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="round-when">
              {t.whenLabel}
            </label>
            <input
              id="round-when"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              required
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="round-duration">
              {t.durationLabel}
            </label>
            <select
              id="round-duration"
              value={durationMinutes}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={field}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} {t.minutes}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="round-format">
              {t.formatLabel}
            </label>
            <select
              id="round-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as RoundFormat)}
              className={field}
            >
              <option value="circle">{t.circle}</option>
              <option value="webinar">{t.webinar}</option>
            </select>
            <p className="mt-1 text-sm text-fg-muted">{format === "circle" ? t.circleHint : t.webinarHint}</p>
          </div>
          <div>
            <label className={label} htmlFor="round-cadence">
              {t.cadenceLabel}
            </label>
            <select
              id="round-cadence"
              value={cadence}
              onChange={(e) => setCadence(e.target.value as Cadence)}
              className={field}
            >
              <option value="once">{t.once}</option>
              <option value="weekly">{t.weekly}</option>
              <option value="fortnightly">{t.fortnightly}</option>
            </select>
          </div>
        </div>

        <div>
          <label className={label} htmlFor="round-link">
            {t.linkLabel}
          </label>
          <input
            id="round-link"
            type="url"
            inputMode="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://"
            className={field}
          />
          <p className="mt-1 max-w-measure text-sm leading-relaxed text-fg-muted">{t.linkHint}</p>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-control bg-accent px-5 text-base font-semibold text-on-accent disabled:opacity-50"
        >
          {busy ? t.opening : t.open}
        </button>
      </form>
    </details>
  );
}
