"use client";

import { useState } from "react";
import Link from "next/link";
import { LANDING } from "@/lib/config/landing";
import { CHECK } from "@/lib/config/check";
import type { CheckResult } from "@/lib/variety/check";
import { HighlightedText } from "./highlighted-text";

export default function CheckPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onCheck() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        setResult(null);
        return;
      }
      setResult(json as CheckResult);
    } catch {
      setError("Could not reach the check. Try again.");
      setResult(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-shell flex-col px-5 sm:px-8">
      <header className="flex items-baseline justify-between border-b border-border-subtle py-5">
        <Link href="/" className="font-heading text-2xl font-semibold tracking-display text-fg-primary">
          {LANDING.brand}
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{LANDING.eyebrow}</span>
      </header>

      <main className="flex-1 py-14 sm:py-20">
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-display text-fg-primary sm:text-5xl">
          {CHECK.title}
        </h1>
        <p className="mt-4 max-w-measure text-lg leading-relaxed text-fg-secondary">{CHECK.intro}</p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={CHECK.placeholder}
          maxLength={2000}
          rows={5}
          className="mt-8 w-full rounded-control border border-border-subtle bg-surface-raised p-4 text-base leading-relaxed text-fg-primary placeholder:text-fg-muted focus:border-accent focus:outline-none"
        />

        <button
          type="button"
          onClick={onCheck}
          disabled={pending || text.trim().length === 0}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-6 text-base font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {CHECK.buttonLabel}
        </button>

        {error && <p className="mt-6 max-w-measure text-base leading-relaxed text-accent">{error}</p>}

        {result && (
          <div className="mt-8" aria-live="polite">
            {result.ok ? (
              <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{CHECK.okLine}</p>
            ) : (
              <>
                <p className="max-w-measure whitespace-pre-wrap rounded-control border border-border-subtle bg-surface-raised p-4 text-base leading-relaxed text-fg-primary">
                  <HighlightedText text={text} findings={result.findings} />
                </p>
                <ul className="mt-5 flex flex-col gap-3">
                  {result.findings.map((f, i) => (
                    <li key={`${f.index}-${i}`} className="font-mono text-sm leading-relaxed text-fg-secondary">
                      <span className="font-medium text-dialect">{f.form}</span> — {f.reason}
                      {f.suggest && (
                        <>
                          {" "}
                          <span className="text-fg-muted">→</span>{" "}
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
      </main>
    </div>
  );
}
