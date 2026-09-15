"use client";

import type { Gloss } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import { useSaved } from "../use-saved";
import { useByok } from "../use-byok";

/**
 * Keep a word, or let go of one.
 *
 * The gloss is the one thing Heidi produces that is worth carrying away — and
 * it used to be drawn once and thrown away on reload, so looking the same word
 * up on Tuesday and on Friday accumulated nothing. One tap, no account, stored
 * in this browser only.
 *
 * A toggle rather than a one-way save: the second tap on a word you did not
 * mean to keep is the only way back, and hiding it would make the list a place
 * things go in and never leave.
 */
export function KeepWord({
  gloss,
  t,
  context,
}: {
  gloss: Gloss;
  t: Dictionary["chat"];
  /** The learner's line this answered — a word remembered with its sentence is
   *  remembered; one on a flashcard is a word you can recognise on a flashcard. */
  context?: string;
}) {
  const saved = useSaved();
  // Forwarded so the example sentences are generated on the model they
  // brought, when they brought one — same key, same quality, their bill.
  const byok = useByok();
  // The bridge form is what makes a word reviewable. `standard` is the
  // bridge-language equivalent; `english` is the explanation in the reader's
  // language, which is the honest fallback when there is no single equivalent.
  const bridge = gloss.standard?.trim() || gloss.english?.trim() || "";
  const kept = saved.isSaved(gloss.form);

  // Before the client has read storage every word would claim to be unkept,
  // and a control that flips under the reader's finger is worse than one that
  // arrives a moment late.
  if (!saved.ready || !bridge) return null;

  return (
    <button
      type="button"
      onClick={() =>
        kept ? saved.forget(gloss.form) : saved.save({ target: gloss.form, bridge, context }, byok.config)
      }
      aria-pressed={kept}
      aria-label={`${kept ? t.savedWord : t.saveWord}: ${gloss.form}`}
      title={kept ? t.savedWord : t.saveWord}
      className={`inline-flex h-6 w-6 shrink-0 translate-y-0.5 items-center justify-center rounded-control border text-xs transition-colors ${
        kept
          ? "border-accent bg-accent text-on-accent"
          : "border-border-subtle text-fg-muted hover:border-border-strong hover:text-fg-primary"
      }`}
    >
      <span aria-hidden="true">{kept ? "✓" : "+"}</span>
    </button>
  );
}
