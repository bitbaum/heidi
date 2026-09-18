"use client";

import { useState } from "react";
import type { CheckResult } from "@/lib/variety/check";
import type { Dictionary } from "@/lib/i18n";
import { HighlightedText } from "./highlighted-text";

/**
 * Run the rule list yourself.
 *
 * This was a page of its own, second in the navigation, headed "paste text
 * that is supposed to be Zurich German". Nobody we build for could use it:
 * Heidi's learner is someone who cannot yet produce the dialect — the pack
 * says so in as many words, and puts speaking last on purpose — so the page
 * asked for the one artefact its visitor does not have. On the Russian
 * locale, whose reader is by definition a newcomer, it was at its worst.
 *
 * The page even argued this against itself: "someone learning Zurich German
 * by definition cannot hear the difference." That is a perfect case for the
 * gate running inside the chat, where it already checks every line Heidi
 * shows, and no case at all for a page where the visitor supplies the text
 * and grades the answer.
 *
 * So it lives here, on the method page, as what it always really was: the
 * evidence behind a claim. "A fixed list of rules decides, not the model" is
 * a sentence anyone can write. Being able to run the list is the part that
 * makes it checkable.
 *
 * Findings show the FORM, the PLACE it comes from, and the form this variety
 * uses instead — never the rule's `reason`, which is English prose written
 * for whoever maintains the pack and used to be rendered verbatim to French
 * and Russian readers.
 */
export function RuleCheck({ t }: { t: Dictionary["check"] }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    setFailed(false);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        // Never the server's own string: those are written once, in English,
        // for a log. This client speaks the reader's language or nothing.
        setFailed(true);
        setResult(null);
        return;
      }
      setResult((await res.json()) as CheckResult);
    } catch {
      setFailed(true);
      setResult(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <label htmlFor="check-input" className="sr-only">
        {t.title}
      </label>
      <textarea
        id="check-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        maxLength={2000}
        rows={3}
        className="w-full resize-y rounded-control border border-border-strong bg-surface-raised p-4 text-lg leading-relaxed text-fg-primary placeholder:text-fg-muted focus:border-accent focus:outline-none"
      />

      <button
        type="button"
        onClick={() => void run()}
        disabled={pending || text.trim().length === 0}
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-6 font-medium text-on-accent transition-colors hover:opacity-90 disabled:bg-surface-sunk disabled:text-fg-muted"
      >
        {t.button}
      </button>

      {failed && (
        <p role="alert" className="mt-6 max-w-measure text-base leading-relaxed text-accent">
          {t.failed}
        </p>
      )}

      {result && (
        <div className="mt-8" aria-live="polite">
          {result.ok ? (
            <p className="flex items-baseline gap-3">
              <span className="font-mono text-caption uppercase tracking-caps text-ok">{t.okShort}</span>
              <span className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.ok}</span>
            </p>
          ) : (
            <>
              <p className="max-w-measure whitespace-pre-wrap rounded-control border border-border-subtle bg-surface-raised p-4 text-lg leading-relaxed text-fg-primary">
                <HighlightedText text={text} findings={result.findings} />
              </p>
              <ul className="mt-5 flex flex-col gap-2">
                {result.findings.map((f, i) => (
                  <li key={`${f.index}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm">
                    <span className="font-medium text-dialect">{f.form}</span>
                    {f.origin && (
                      <span className="text-caption uppercase tracking-caps text-fg-muted">{f.origin}</span>
                    )}
                    {f.suggest && (
                      <>
                        <span className="text-fg-muted">→</span>
                        <span className="font-medium text-ok">{f.suggest}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
