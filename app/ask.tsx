"use client";

import { useRef, useState } from "react";
import type { Answer, Intent } from "@/lib/domain/ask/types";

/**
 * The front door. One field, because the person arrives with a communication
 * problem, not with a decision about which tool they need.
 *
 * The ordering is deliberate and is the product's main UX claim: the answer
 * comes first and complete, because at 08:55 before a meeting someone needs
 * the message decoded, not a lesson. What there is to learn sits underneath,
 * one glance away, and never blocks the thing they came for.
 */

const MODES: ReadonlyArray<{ id: Intent; label: string; hint: string; placeholder: string }> = [
  {
    id: "understand",
    label: "Understand",
    hint: "Paste something you received",
    placeholder: "Im Kauz scho, hät mer nöd so gfalle. Du au?",
  },
  {
    id: "produce",
    label: "Say it",
    hint: "Write what you mean",
    placeholder: "Tell them I'm running ten minutes late, but friendly.",
  },
];

const EXAMPLES: Record<Intent, string[]> = {
  understand: [
    "Im Kauz scho, hät mer nöd so gfalle. Du au?",
    "Chunnsch au no verbi hüt Abig?",
    "Gsehd guet us, mir mached das so.",
  ],
  produce: [
    "Tell them I'm running ten minutes late, but friendly.",
    "Ask a neighbour if I can leave a parcel with them.",
    "Say no to a dinner invitation without sounding cold.",
  ],
};

export function Ask() {
  const [mode, setMode] = useState<Intent>("understand");
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const active = MODES.find((m) => m.id === mode) ?? MODES[0];

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
        body: JSON.stringify({ input: trimmed, intent: mode }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Something went wrong.");
      else setAnswer(data as Answer);
    } catch {
      setError("Could not reach Heidi. Check your connection and try again.");
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
    <section aria-label="Ask Heidi" className="w-full">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div
          role="tablist"
          aria-label="What do you need?"
          className="inline-flex rounded-control border border-border-strong bg-surface-raised p-0.5"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => switchMode(m.id)}
              className={`min-h-11 rounded-control px-4 text-sm font-medium transition-colors ${
                mode === m.id
                  ? "bg-accent text-on-accent"
                  : "text-fg-secondary hover:bg-surface-sunk hover:text-fg-primary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{active.hint}</p>
      </div>

      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(input);
        }}
      >
        <label htmlFor="heidi-input" className="sr-only">
          {active.hint}
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
          placeholder={active.placeholder}
          className="w-full resize-y rounded-control border border-border-strong bg-surface-raised px-4 py-3 text-lg leading-relaxed text-fg-primary placeholder:text-fg-muted focus:border-accent focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex min-h-11 items-center rounded-control bg-accent px-6 font-medium text-on-accent transition-opacity disabled:opacity-40"
          >
            {busy ? "Reading…" : active.label}
          </button>
          <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">⌘ + return</span>
        </div>
      </form>

      {!answer && !busy && !error && (
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">Or try one</p>
          <ul className="mt-2 flex flex-col gap-2">
            {EXAMPLES[mode].map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onClick={() => pick(ex)}
                  className="w-full rounded-control border border-border-subtle bg-surface-raised px-3 py-2 text-left text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary"
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
          Working out what it says…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 rounded-control border border-accent bg-accent-tint px-4 py-3 text-fg-primary">
          {error}
        </p>
      )}

      {answer && <Result answer={answer} />}
    </section>
  );
}

function Result({ answer }: { answer: Answer }) {
  const producing = answer.intent === "produce";
  return (
    <article className="mt-7 overflow-hidden rounded-control border border-border-strong bg-surface-raised">
      <div className="border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
          {producing ? "Send this" : "What it says"}
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
          <h2 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">Words worth keeping</h2>
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
            {producing ? "Other ways to put it" : "You could reply"}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {answer.replies.map((r) => (
              <ReplyRow key={`${r.label}-${r.text}`} label={r.label} text={r.text} english={r.english} clean={r.clean} flags={r.flags} />
            ))}
          </ul>
        </div>
      )}

      <p className="border-t border-border-subtle px-4 py-3 font-mono text-[11px] text-fg-muted sm:px-6">
        Every line above was checked against Zurich forms before you saw it · {answer.model}
      </p>
    </article>
  );
}

function ReplyRow({
  label,
  text,
  english,
  clean,
  flags,
}: {
  label: string;
  text: string;
  english: string;
  clean: boolean;
  flags: string[];
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li className="rounded-control border border-border-subtle bg-surface-page p-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{label}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="min-h-11 shrink-0 px-1 text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-1 text-lg leading-relaxed text-dialect">{text}</p>
      {english && <p className="mt-1 text-sm text-fg-secondary">{english}</p>}
      {!clean && (
        <p className="mt-2 font-mono text-[11px] text-accent">
          Flagged, not Zurich: {flags.join(", ")}
        </p>
      )}
    </li>
  );
}
