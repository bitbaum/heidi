"use client";

import { downloadJson, fileSlug } from "@/lib/browser/download";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useSaved } from "./use-saved";
import { CowMark } from "./cow-mark";
import { DISPLAY } from "@/lib/variety/display";

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
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
          {saved.count} {t.countLabel} · {t.onThisDevice}
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => download(saved.words, t.title)}
            className="min-h-9 font-mono text-caption uppercase tracking-caps text-link underline underline-offset-4 hover:text-accent"
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
            className={`min-h-9 font-mono text-caption uppercase tracking-caps underline underline-offset-4 ${
              confirming ? "text-accent" : "text-fg-muted hover:text-fg-primary"
            }`}
          >
            {confirming ? t.clearConfirm : t.clear}
          </button>
        </div>
      </div>

      {/* `hyphens-auto wrap-anywhere`: a kept word can be a German compound
          longer than a phone column, and one of them is the whole reason this
          product exists. Hyphenate where the language allows it, break
          anywhere rather than run off the card. */}
      <ul className="mt-4 grid grid-cols-safe gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle hyphens-auto wrap-anywhere sm:grid-cols-2">
        {saved.words.map((w) => (
          <li key={w.target} className="flex items-start justify-between gap-3 bg-surface-page px-4 py-3">
            <div className="min-w-0">
              {/* The near-identical `word-list.tsx` marks both sides; this
                  file rendered the same pair with neither. */}
              <p lang={DISPLAY.tag} className="font-heading text-xl leading-tight tracking-display text-dialect">
                {w.target}
              </p>
              <p lang="de" className="mt-0.5 text-base leading-snug text-fg-secondary">
                {w.bridge}
              </p>
              {/* CLAMPED, NOT TRUNCATED. `truncate` is one line and an
                  ellipsis, with the rest of the sentence behind `title` — and
                  `title` needs a pointer to hover. On the phone this list is
                  read on, the reason the word was worth keeping was simply
                  gone. Two lines is enough for the sentences these actually
                  are, and `wrap-anywhere` on the list above already handles
                  the pasted link that has nowhere to break. */}
              {w.context && (
                <p className="mt-1.5 line-clamp-2 font-mono text-caption leading-relaxed text-fg-muted" title={w.context}>
                  {w.context}
                </p>
              )}
              <p className="mt-1 font-mono text-caption uppercase tracking-caps text-fg-muted">
                {t.savedOn} {formatDate(w.savedAt, locale)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => saved.forget(w.target)}
              aria-label={`${t.remove}: ${w.target}`}
              title={t.remove}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-border-subtle text-fg-muted transition-colors hover:border-accent hover:text-accent max-sm:h-11 max-sm:w-11"
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
  // `downloadJson` holds the object URL for a tick before releasing it. This
  // function used to revoke it synchronously — the exact Safari race the
  // settings page had already learned about and written a comment about.
  downloadJson(`${fileSlug(title)}.json`, words);
}
