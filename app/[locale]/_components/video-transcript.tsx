"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { clock, type Transcript } from "@/lib/channels/transcript";

type T = Dictionary["channels"]["lesson"];

/**
 * The transcript, line by line: tap a line and the player goes there.
 *
 * Lines that answered a question the learner missed are marked, so the
 * transcript reads as "here is what you did not catch" rather than as a wall
 * of text. The source is printed above it, every time — an automatic
 * transcript is labelled as the machine's, which is §8's rule carried to the
 * one place a learner would otherwise take a recogniser's guess for a fact.
 */
export function TranscriptView({ t, transcript, missed, onSeek, lang }: { t: T; transcript: Transcript; missed: ReadonlySet<number>; onSeek: (seconds: number) => void; lang?: string }) {
  return (
    <section aria-labelledby="transcript-heading">
      <h2 id="transcript-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
        {t.transcriptTitle}
      </h2>
      <p className="mt-1 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.source[transcript.source]}</p>
      <p className="mt-2 text-sm text-fg-secondary">{t.transcriptHint}</p>
      <ol className="mt-4 flex flex-col" lang={lang}>
        {transcript.lines.map((line, i) => {
          const hit = missed.has(i);
          return (
            <li key={i} className={`border-t border-border-subtle first:border-t-0 ${hit ? "border-l-2 border-l-accent pl-3" : ""}`}>
              <button
                type="button"
                onClick={() => onSeek(line.start)}
                className="flex min-h-11 w-full items-start gap-3 py-2 text-left transition-colors hover:bg-surface-raised"
              >
                <span className="mt-0.5 shrink-0 font-mono text-caption tabular-nums text-fg-muted">{clock(line.start)}</span>
                <span className="text-base leading-relaxed text-fg-primary">{line.text}</span>
                {hit && <span className="sr-only">{t.missedMark}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * The way through when YouTube refuses the server: the learner copies the
 * platform's own transcript panel and pastes it. Three steps, printed, and a
 * box. A gate that records a refusal and shows the way forward on the same
 * screen — the fleet's rule, applied to the one step a server cannot take.
 */
export function PastePanel({ t, videoUrl, onPasted, busy }: { t: T; videoUrl: string; onPasted: (text: string) => Promise<"ok" | "bad" | "failed">; busy: boolean }) {
  const [text, setText] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim() || busy) return;
    setProblem(null);
    const result = await onPasted(text);
    if (result === "bad") setProblem(t.pasteBad);
    else if (result === "failed") setProblem(t.questionsFailed);
  }

  return (
    <section aria-labelledby="paste-heading" className="rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
      <h2 id="paste-heading" className="font-heading text-lg font-semibold leading-snug tracking-display text-fg-primary">
        {t.blockedTitle}
      </h2>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.blockedBody}</p>
      <ol className="mt-3 max-w-measure list-decimal space-y-1 pl-5 text-base leading-relaxed text-fg-secondary">
        {t.pasteSteps.map((step, i) => (
          <li key={i}>
            {i === 0 ? (
              <a href={videoUrl} target="_blank" rel="noreferrer" className="text-link underline underline-offset-4 hover:text-accent">
                {step}
              </a>
            ) : (
              step
            )}
          </li>
        ))}
      </ol>
      <form onSubmit={submit} className="mt-4">
        <label htmlFor="paste-transcript" className="block font-mono text-caption uppercase tracking-caps text-fg-muted">
          {t.pasteLabel}
        </label>
        <textarea
          id="paste-transcript"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={t.pastePlaceholder}
          className="mt-2 w-full rounded-control border border-border-strong bg-surface-page px-3 py-2 font-mono text-sm text-fg-primary placeholder:text-fg-muted focus:border-fg-primary focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action transition-colors disabled:bg-surface-sunk disabled:text-fg-muted"
          >
            {busy ? t.writing : t.pasteSubmit}
          </button>
          {problem && (
            <p role="alert" className="text-sm text-danger">
              {problem}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
