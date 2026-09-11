"use client";

import { useState } from "react";
import type { CheckResult } from "@/lib/variety/check";
import type { Dictionary } from "@/lib/i18n";
import { HighlightedText } from "./highlighted-text";

export function CheckForm({ t }: { t: Dictionary["check"] }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run() {
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
        setError(json.error ?? "…");
        setResult(null);
        return;
      }
      setResult(json as CheckResult);
    } catch {
      setError("…");
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
        rows={5}
        className="w-full resize-y rounded-control border border-border-strong bg-surface-raised p-4 text-lg leading-relaxed text-fg-primary placeholder:text-fg-muted focus:border-accent focus:outline-none"
      />

      <button
        type="button"
        onClick={() => void run()}
        disabled={pending || text.trim().length === 0}
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-6 font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {t.button}
      </button>

      {error && (
        <p role="alert" className="mt-6 max-w-measure text-base leading-relaxed text-accent">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8" aria-live="polite">
          {result.ok ? (
            <p className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] uppercase tracking-caps text-ok">{t.okShort}</span>
              <span className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.ok}</span>
            </p>
          ) : (
            <>
              <p className="max-w-measure whitespace-pre-wrap rounded-control border border-border-subtle bg-surface-raised p-4 text-lg leading-relaxed text-fg-primary">
                <HighlightedText text={text} findings={result.findings} />
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {result.findings.map((f, i) => (
                  <li key={`${f.index}-${i}`} className="font-mono text-sm leading-relaxed text-fg-secondary">
                    <span className="font-medium text-dialect">{f.form}</span>
                    {f.origin && <span className="ml-2 text-[11px] uppercase tracking-caps text-fg-muted">{f.origin}</span>}
                    <span className="mx-2 text-fg-muted">—</span>
                    {f.reason}
                    {f.suggest && (
                      <>
                        {" "}
                        <span className="text-fg-muted">·</span>{" "}
                        <span className="text-[11px] uppercase tracking-caps text-fg-muted">{t.suggests}</span>{" "}
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
