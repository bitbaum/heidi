"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useSaved } from "./use-saved";
import { CowMark } from "./cow-mark";

/**
 * The words a learner kept, on the page that promised them.
 *
 * Set in the same language as the correspondence figure on the home page: the
 * form being learned is LOUD and in the accent, the form they already have is
 * quiet. That is not decoration — it is the direction of the work. A list that
 * gave both halves equal weight would read like a dictionary, which is the
 * thing that did not teach anyone anything.
 *
 * No account is involved. This reads the same browser storage the chat writes
 * to, so it works signed out, and it says so rather than letting someone
 * assume their words are following them to a second device.
 */
export function SavedWords({ t, locale }: { t: Dictionary["saved"]; locale: string }) {
  const saved = useSaved();
  const [confirming, setConfirming] = useState(false);

  // The server pass cannot read storage and would render "nothing kept" to a
  // learner who has kept fifty words. Better to render nothing for one frame.
  if (!saved.ready) return null;

  if (saved.count === 0) {
    return (
      <div className="rounded-control border border-border-subtle bg-surface-raised px-4 py-5">
        {/* An empty box with two lines of grey text reads as something that
            failed to load. The mark makes it read as a place waiting to be
            filled, which is what it is. */}
        <div className="flex items-start gap-3">
          <CowMark size={24} className="mt-0.5 shrink-0 text-border-subtle" />
          <div>
            <p className="text-base text-fg-primary">{t.empty}</p>
            <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">{t.emptyHint}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
          {saved.count} {t.countLabel} · {t.onThisDevice}
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => download(saved.words, t.title)}
            className="min-h-9 font-mono text-[11px] uppercase tracking-caps text-link underline underline-offset-4 hover:text-accent"
          >
            {t.exportLabel}
          </button>
          {/* Two taps, not a browser confirm(): a modal dialog blocks the page
              and reads as an error. The button becoming the question is the
              same safety with none of the interruption. */}
          <button
            type="button"
            onClick={() => {
              if (confirming) {
                saved.clear();
                setConfirming(false);
              } else {
                setConfirming(true);
              }
            }}
            onBlur={() => setConfirming(false)}
            className={`min-h-9 font-mono text-[11px] uppercase tracking-caps underline underline-offset-4 ${
              confirming ? "text-accent" : "text-fg-muted hover:text-fg-primary"
            }`}
          >
            {confirming ? t.clearConfirm : t.clear}
          </button>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle sm:grid-cols-2">
        {saved.words.map((w) => (
          <li key={w.target} className="flex min-w-0 items-start justify-between gap-3 bg-surface-page px-4 py-3">
            <div className="min-w-0">
              <p className="break-words font-heading text-xl leading-tight tracking-display text-dialect">{w.target}</p>
              <p className="mt-0.5 break-words text-base leading-snug text-fg-secondary">{w.bridge}</p>
              {/* CLAMPED, NOT TRUNCATED, and the difference is the whole bug.
                  `truncate` is `white-space: nowrap`, and a line that cannot
                  break reports the full sentence as its minimum width. That
                  minimum travelled up every auto-sized grid track above it
                  until the portal was 481px wide on a 360px phone and the
                  remove button sat off the right edge of the screen.
                  `line-clamp-2` hides the overflow the same way while leaving
                  the text breakable, so the row can be as narrow as the screen.
                  It also reads better here: the sentence is why the word was
                  worth keeping, and on a touch screen there is no hover to
                  reveal what one clipped line left out. */}
              {w.context && (
                <p className="mt-1.5 line-clamp-2 break-words font-mono text-[11px] leading-relaxed text-fg-muted" title={w.context}>
                  {w.context}
                </p>
              )}
              <p className="mt-1 font-mono text-[10px] uppercase tracking-caps text-fg-muted">
                {t.savedOn} {formatDate(w.savedAt, locale)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => saved.forget(w.target)}
              aria-label={`${t.remove}: ${w.target}`}
              title={t.remove}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-border-subtle text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The reader's own date format — never a hardcoded one. */
function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/**
 * Hand the list back as a file.
 *
 * Because it is only in this browser, "we hold nothing about you" and "you
 * could lose this by clearing site data" are the same fact. Offering the file
 * is what makes the first half honest.
 */
function download(words: ReadonlyArray<{ target: string; bridge: string }>, title: string) {
  const body = JSON.stringify(words, null, 2);
  const url = URL.createObjectURL(new Blob([body], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
