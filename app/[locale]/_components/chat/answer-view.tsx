"use client";

import type { Answer } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import { Copy } from "./copy-button";
import { KeepWord } from "./keep-word";

/**
 * Everything Heidi found, rendered.
 *
 * This was 120 lines inside `chat.tsx`, reachable only from the home page. The
 * cost was invisible and real: the group chat stores the same `Answer` object
 * in `group_messages.answer` and rendered `m.body` as a plain paragraph, so
 * study groups have never shown a gloss, a suggestion, a copy button or a
 * keep-word control since the day they shipped. The data was there the whole
 * time; only the renderer was missing.
 *
 * It knows nothing about who sent the message, whether the turn failed, or
 * which surface it is on — a sender and an error are the bubble's business
 * (`bubble.tsx`), and chrome is the caller's.
 *
 * The order is deliberate and is the product's whole posture: the ANSWER
 * first, because at 08:55 before a meeting someone needs the message decoded
 * rather than a lesson; then the thing they can send; then the words worth
 * keeping. Teaching never blocks the thing they came for.
 */
export function AnswerView({
  answer,
  t,
  context,
}: {
  answer: Answer;
  t: Dictionary["chat"];
  /** The learner's line this answers, carried onto any word they keep. */
  context?: string;
}) {
  const a = answer;

  return (
    <>
      <p className="text-base leading-relaxed text-fg-primary">{a.text}</p>

      {a.dialect && (
        <div className="mt-3 rounded-control border border-border-subtle bg-surface-raised p-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{t.sendThis}</span>
            <Copy text={a.dialect} t={t} />
          </div>
          <p className="mt-1 text-lg leading-relaxed text-dialect">{a.dialect}</p>
          {/* A flagged line is MARKED, never dropped. The learner cannot audit
              this work, so drift has to stay visible rather than be tidied. */}
          {a.dialectClean === false && (
            <p className="mt-1 font-mono text-[11px] text-accent">
              {t.flagged} {a.dialectFlags?.join(", ")}
            </p>
          )}
        </div>
      )}

      {a.toneNote && (
        <p className="mt-2 text-sm text-fg-secondary">
          {a.tone && <span className="font-medium text-fg-primary">{a.tone}</span>}
          {a.tone ? " — " : ""}
          {a.toneNote}
        </p>
      )}

      {a.glosses.length > 0 && (
        <div className="mt-3 border-t border-border-subtle pt-3">
          <h3 className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{t.glossTitle}</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {a.glosses.map((g) => (
              <li key={g.form} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <KeepWord gloss={g} t={t} context={context} />
                <span className="font-mono text-sm font-medium text-dialect">{g.form}</span>
                {g.standard && <span className="font-mono text-xs text-fg-muted">{g.standard}</span>}
                <span className="text-sm text-fg-secondary">{g.english}</span>
                {g.rule && (
                  <span className="rounded-control bg-surface-sunk px-1.5 font-mono text-[10px] text-fg-muted">
                    {g.rule}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.suggestions.length > 0 && (
        <div className="mt-3 border-t border-border-subtle pt-3">
          <h3 className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{t.suggestionsTitle}</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {a.suggestions.map((s) => (
              <li key={`${s.label}-${s.text}`} className="rounded-control border border-border-subtle p-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{s.label}</span>
                  <Copy text={s.text} t={t} />
                </div>
                <p className="mt-0.5 text-base leading-relaxed text-dialect">{s.text}</p>
                {s.english && <p className="text-sm text-fg-secondary">{s.english}</p>}
                {!s.clean && (
                  <p className="mt-1 font-mono text-[11px] text-accent">
                    {t.flagged} {s.flags.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.note && <p className="mt-3 text-sm text-fg-muted">{a.note}</p>}

      {/* Provenance. An answer with no model attached is a rumour. */}
      <p className="mt-3 border-t border-border-subtle pt-2 font-mono text-[10px] text-fg-muted">
        {t.checkedNote} · {a.model}
      </p>
    </>
  );
}
