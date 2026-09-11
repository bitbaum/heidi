"use client";

import { useRef, useState } from "react";
import type { Answer, Intent } from "@/lib/domain/ask/types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

/**
 * The front door. One field, because the person arrives with a communication
 * problem, not with a decision about which tool they need.
 *
 * The ordering is the product's main UX claim: the answer comes first and
 * complete, because at 08:55 before a meeting someone needs the message
 * decoded, not a lesson. What there is to learn sits underneath, one glance
 * away, and never blocks the thing they came for.
 */
export function Ask({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.ask;
  const [mode, setMode] = useState<Intent>("understand");
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const understanding = mode === "understand";
  const hint = understanding ? t.understandHint : t.produceHint;
  const placeholder = understanding ? t.understandPlaceholder : t.producePlaceholder;
  const examples = understanding ? t.examplesUnderstand : t.examplesProduce;

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: trimmed, intent: mode, locale }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.operator ? t.notConfigured : (data.error ?? t.failed));
      else setAnswer(data as Answer);
    } catch {
      setError(t.unreachable);
    } finally {
      setBusy(false);
    }
  }

  function pick(example: string) {
    setInput(example);
    areaRef.current?.focus();
    void submit(example);
  }

  function switchMode(next: Intent) {
    setMode(next);
    setAnswer(null);
    setError(null);
    areaRef.current?.focus();
  }

  return (
    <section aria-label="Heidi" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div
          role="tablist"
          aria-label={hint}
          className="inline-flex rounded-control border border-border-strong bg-surface-raised p-0.5"
        >
          {(["understand", "produce"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => switchMode(id)}
              className={`min-h-11 rounded-control px-5 text-sm font-medium transition-colors ${
                mode === id
                  ? "bg-accent text-on-accent"
                  : "text-fg-secondary hover:bg-surface-sunk hover:text-fg-primary"
              }`}
            >
              {id === "understand" ? t.understand : t.produce}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.explanationsIn}</p>
      </div>

      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(input);
        }}
      >
        <label htmlFor="heidi-input" className="sr-only">
          {hint}
        </label>
        <textarea
          id="heidi-input"
          ref={areaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void submit(input);
            }
          }}
          rows={3}
          maxLength={2000}
          placeholder={placeholder}
          className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-4 py-3 text-lg leading-relaxed text-fg-primary placeholder:text-fg-muted focus:border-accent focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex min-h-11 items-center rounded-control bg-accent px-6 font-medium text-on-accent transition-opacity disabled:opacity-40"
          >
            {busy ? t.working : t.submit}
          </button>
          <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.shortcut}</span>
        </div>
      </form>

      {!answer && !busy && !error && (
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.tryOne}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {examples.map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onClick={() => pick(ex)}
                  className="w-full rounded-control border border-border-subtle bg-surface-raised px-3 py-2.5 text-left text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary"
                >
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {busy && (
        <p role="status" className="mt-6 text-fg-secondary">
          {t.working}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 rounded-control border border-accent bg-accent-tint px-4 py-3 text-fg-primary">
          {error}
        </p>
      )}

      {answer && <Result answer={answer} t={t} />}
    </section>
  );
}

function Result({ answer, t }: { answer: Answer; t: Dictionary["ask"] }) {
  const producing = answer.intent === "produce";
  return (
    <article className="mt-7 overflow-hidden rounded-control border border-border-strong bg-surface-raised">
      <div className="border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
          {producing ? t.sendTitle : t.meaningTitle}
        </h2>
        <p
          className={`mt-2 text-xl leading-relaxed sm:text-2xl ${
            producing ? "font-medium text-dialect" : "text-fg-primary"
          }`}
        >
          {answer.meaning}
        </p>
        {answer.toneNote && (
          <p className="mt-3 text-sm text-fg-secondary">
            <span className="font-medium text-fg-primary">{answer.tone}</span> — {answer.toneNote}
          </p>
        )}
        {answer.note && <p className="mt-3 text-sm text-fg-muted">{answer.note}</p>}
      </div>

      {answer.glosses.length > 0 && (
        <div className="border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.glossTitle}</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {answer.glosses.map((g) => (
              <li key={g.form} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-base font-medium text-dialect">{g.form}</span>
                {g.standard && <span className="font-mono text-sm text-fg-muted">{g.standard}</span>}
                <span className="text-sm text-fg-secondary">{g.english}</span>
                {g.rule && (
                  <span className="rounded-control bg-surface-sunk px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">
                    {g.rule}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.replies.length > 0 && (
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
            {producing ? t.alternativesTitle : t.repliesTitle}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {answer.replies.map((r) => (
              <ReplyRow key={`${r.label}-${r.text}`} reply={r} t={t} />
            ))}
          </ul>
        </div>
      )}

      <p className="border-t border-border-subtle px-4 py-3 font-mono text-[11px] text-fg-muted sm:px-6">
        {t.checkedNote} · {answer.model}
      </p>
    </article>
  );
}

function ReplyRow({ reply, t }: { reply: Answer["replies"][number]; t: Dictionary["ask"] }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(reply.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li className="rounded-control border border-border-subtle bg-surface-page p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{reply.label}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="min-h-11 shrink-0 px-1 text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {copied ? t.copied : t.copy}
        </button>
      </div>
      <p className="mt-1 text-lg leading-relaxed text-dialect">{reply.text}</p>
      {reply.english && <p className="mt-1 text-sm text-fg-secondary">{reply.english}</p>}
      {!reply.clean && (
        <p className="mt-2 font-mono text-[11px] text-accent">
          {t.flagged} {reply.flags.join(", ")}
        </p>
      )}
    </li>
  );
}
