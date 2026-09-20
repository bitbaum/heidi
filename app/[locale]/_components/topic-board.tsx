"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import { INTEREST_TO_SCHEDULE, MAX_PITCH_LENGTH, MAX_TITLE_LENGTH, type Topic } from "@/lib/domain/speaking/types";

type T = Dictionary["speaking"];

/**
 * What people want to talk about.
 *
 * Readable signed out on purpose — the board is the evidence that there is
 * something here worth making an account for, and a wall in front of it hides
 * exactly that. The buttons are what needs an identity, so they are what is
 * absent.
 *
 * Interest is a row per person rather than a counter, so the board can answer
 * the question a counter cannot: whether YOU already said yes. A number that
 * can only go up is also a number nobody believes.
 */
export function TopicBoard({
  t,
  signedIn,
  topics,
}: {
  t: T;
  signedIn: boolean;
  topics: Topic[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(
    async (topic: Topic) => {
      if (busy) return;
      setBusy(topic.id);
      setError(null);
      try {
        const res = await fetch(`/api/speaking/topics/${topic.id}/interest`, {
          method: topic.mine ? "DELETE" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          setError(t.failed);
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
    <section aria-labelledby="board-heading" className="mt-12">
      <h2 id="board-heading" className="font-heading text-section leading-tight tracking-display text-fg-primary">
        {t.boardTitle}
      </h2>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.boardLead}</p>

      {topics.length === 0 && <p className="mt-4 font-mono text-sm text-fg-muted">{t.boardEmpty}</p>}

      {topics.length > 0 && (
        <ul className="mt-4 grid gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.id} className="flex flex-col bg-surface-page p-4">
              <h3 className="font-heading text-lg leading-tight tracking-display text-fg-primary">{topic.title}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-fg-secondary">{topic.pitch}</p>

              <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">
                {topic.interest} {t.wouldCome}
                {topic.roundId && ` · ${t.scheduled}`}
                {/*
                  A signal, never a gate: a host may schedule anything, and a
                  new instance with three users has to be able to hold its first
                  round. In the accent colour because it is addressed at a
                  reader who could act on it — "Runde eröffnen" is on this same
                  page, with a selector carrying exactly these topics — and
                  flat grey next to the count read as one more dead caption.
                */}
                {!topic.roundId && topic.interest >= INTEREST_TO_SCHEDULE && (
                  <span className="text-accent"> · {t.scheduleIt}</span>
                )}
              </p>

              {signedIn && (
                <button
                  type="button"
                  onClick={() => void toggle(topic)}
                  disabled={busy === topic.id}
                  className={
                    topic.mine
                      ? "mt-3 min-h-11 self-start px-2 font-mono text-caption uppercase tracking-caps text-fg-muted disabled:opacity-50"
                      : "mt-3 min-h-11 self-start rounded-control border border-border-strong px-4 text-sm font-semibold text-fg-primary disabled:opacity-50"
                  }
                >
                  {topic.mine ? t.imOut : t.imIn}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-3 text-sm text-accent">{error}</p>}

      {signedIn ? <ProposeTopic t={t} onDone={() => router.refresh()} /> : null}
    </section>
  );
}

function ProposeTopic({ t, onDone }: { t: T; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (busy || !title.trim() || !pitch.trim()) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/speaking/topics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, pitch }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? t.failed);
          return;
        }
        setTitle("");
        setPitch("");
        onDone();
      } catch {
        setError(t.failed);
      } finally {
        setBusy(false);
      }
    },
    [busy, title, pitch, onDone, t.failed],
  );

  const field = "mt-1 w-full rounded-control border border-border-subtle bg-surface-page p-3 text-base text-fg-primary";
  const label = "block font-mono text-caption uppercase tracking-caps text-fg-muted";

  return (
    <details className="group mt-6 rounded-control border border-border-subtle bg-surface-raised p-4">
      {/* `list-none` + the explicit `::-webkit-details-marker` reset: without
          both, the browser draws its own triangle, hard against the first
          letter, in whatever colour and size it likes. On the live site that
          was a black ▼ glued to the heading — the only glyph on the page
          drawn by the user agent rather than by us. The chevron below is ours:
          it is `aria-hidden` because `<summary>` already announces its own
          expanded state, and a second announcement would be a duplicate. */}
      <summary className="flex cursor-pointer list-none items-center gap-2 font-heading text-lg leading-tight text-fg-primary [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="text-fg-muted transition-transform group-open:rotate-90">
          &rsaquo;
        </span>{t.proposeTitle}</summary>
      <form onSubmit={submit} className="mt-4 grid gap-4">
        <div>
          <label className={label} htmlFor="topic-title">
            {t.topicTitleLabel}
          </label>
          <input
            id="topic-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.topicTitlePlaceholder}
            required
            maxLength={MAX_TITLE_LENGTH}
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="topic-pitch">
            {t.pitchLabel}
          </label>
          <input
            id="topic-pitch"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder={t.pitchPlaceholder}
            required
            maxLength={MAX_PITCH_LENGTH}
            className={field}
          />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-control bg-accent px-5 text-base font-semibold text-on-accent disabled:opacity-50"
        >
          {busy ? t.proposing : t.propose}
        </button>
      </form>
    </details>
  );
}
