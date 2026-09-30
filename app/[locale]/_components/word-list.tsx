"use client";

import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { fill } from "@/lib/i18n/fill";
import { plural } from "@/lib/i18n/plural";
import { askHeidi } from "@/lib/browser/ask";
import { wordsScope } from "@/lib/domain/practice/scope";
import { wordSlug } from "@/lib/domain/practice/slug";
import type { WordStatus } from "@/lib/domain/vocabulary/rank";
import { SessionLink } from "./session/links";
import { useSaved } from "./use-saved";
import { useByok } from "./use-byok";
import { useDismiss } from "./use-dismiss";
import type { VocabRow } from "./vocabulary-browser";

/** Scene links shown before "+ n more": enough to picture it, not a wall. */
const SCENES_SHOWN = 3;

/**
 * One word: a line you can scan, and everything else under it on demand.
 *
 * THE LINE carries what decides whether you know the word — the word, its
 * meaning, the trap if it has one — and the keep button, because keeping is
 * the act that puts it into review. A false friend is only dangerous while the
 * reader is certain, so its correction is on the line, not behind the toggle.
 *
 * UNDER IT, when opened: a sentence it is said in, its forms, where in the
 * scenes it comes up, and the two ways on — practise just this word, or ask
 * Heidi to use it. That is the part that used to be printed for every word at
 * once and made the page twenty-three thousand pixels long.
 *
 * THE TOGGLE IS THE WORD ITSELF, a real button with `aria-expanded`, and the
 * keep button sits beside it rather than inside it: an interactive element
 * inside another is announced as neither.
 */
export function WordRow({
  row,
  status,
  open,
  onToggle,
  heading,
  t,
  chatT,
  persons,
  locale,
}: {
  row: VocabRow;
  /** Null until storage has been read. */
  status: WordStatus | null;
  open: boolean;
  onToggle: () => void;
  /** A section heading to print above this row, inside the same list item. */
  heading: React.ReactNode;
  t: Dictionary["vocabulary"];
  /** `saveWord` / `savedWord` live in the chat dictionary, where the gloss is. */
  chatT: Dictionary["chat"];
  persons: Dictionary["practice"]["persons"];
  locale: Locale;
}) {
  const saved = useSaved();
  // Forwarded so the example sentences are generated on the key they brought.
  const byok = useByok();
  // Before storage has been read every word would claim to be unkept, and a
  // control that flips under the reader's finger is worse than a late one.
  const kept = saved.ready && saved.isSaved(row.target);
  const slug = wordSlug(row.target);
  const panel = `${slug}-detail`;
  const itemRef = useRef<HTMLLIElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Escape folds it back; a click elsewhere does not — this is a row in a
  // list the reader is comparing against, not a menu over the page.
  useDismiss({ open, onDismiss: onToggle, containerRef: itemRef, focusRef: toggleRef, onPointerOutside: false });

  return (
    <li id={slug} ref={itemRef} className="scroll-mt-anchor">
      {heading}
      <div className="flex items-center gap-2 border-b border-border-subtle">
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? panel : undefined}
          onClick={onToggle}
          className="grid min-h-12 min-w-0 flex-1 grid-cols-[1rem_minmax(0,1fr)_minmax(0,1.3fr)] items-baseline gap-x-3 py-2.5 text-left hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="self-center">{status && <StatusMark status={status} label={t.status[status]} />}</span>
          <span lang={DISPLAY.tag} className="font-heading text-base font-semibold leading-snug tracking-display text-dialect">
            {/* The article is part of the noun, as `der` is in a German
                dictionary; muted, because the noun is still the entry. */}
            {row.article && <span className="font-normal text-fg-muted">{row.article} </span>}
            {row.target}
          </span>
          <span lang="de" className="text-base leading-snug text-fg-secondary">
            {row.bridge}
            {/* A real space, not only a margin: copied or read aloud, a margin
                stitches «Franken» and «umgangssprachlich» into one word. */}
            {row.register && " "}
            {row.register && (
              <span className="ml-1 font-mono text-caption uppercase tracking-caps text-fg-muted">
                {t.register[row.register]}
              </span>
            )}
            {row.mistakenFor && (
              <span className="mt-0.5 block text-sm text-fg-muted">{fill(t.mistakenForLabel, { assumed: row.mistakenFor })}</span>
            )}
          </span>
        </button>

        {saved.ready && (
          <button
            type="button"
            onClick={() =>
              kept ? saved.forget(row.target) : saved.save({ target: row.target, bridge: row.bridge }, byok.config)
            }
            aria-pressed={kept}
            aria-label={`${kept ? chatT.savedWord : chatT.saveWord}: ${row.target}`}
            title={kept ? chatT.savedWord : chatT.saveWord}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control border text-sm transition-colors max-sm:h-11 max-sm:w-11 ${
              kept
                ? "border-action bg-action text-on-action"
                : "border-border-subtle text-fg-muted hover:border-border-strong hover:text-fg-primary"
            }`}
          >
            <span aria-hidden="true">{kept ? "✓" : "+"}</span>
          </button>
        )}
      </div>

      {open && (
        <div id={panel} className="flex flex-col gap-3 border-b border-border-subtle py-4 pl-7">
          {row.example && (
            <p className="text-base leading-relaxed">
              <span lang={DISPLAY.tag} className="text-fg-primary">
                «{row.example.target}»
              </span>
              <span lang="de" className="mt-0.5 block text-sm text-fg-secondary">
                {row.example.bridge}
                {row.example.scene && (
                  <>
                    {" · "}
                    <a href={row.example.scene.href} className="text-link underline underline-offset-4 hover:text-accent">
                      {row.example.scene.title}
                    </a>
                  </>
                )}
              </span>
            </p>
          )}

          {row.forms && row.forms.length > 0 && (
            <p className="text-sm leading-relaxed text-fg-secondary">
              {row.forms.map((form, i) => (
                <span key={form.label}>
                  {i > 0 && <span aria-hidden="true" className="text-fg-muted"> · </span>}
                  <span className="text-fg-muted">{persons[form.label as keyof typeof persons] ?? form.label} </span>
                  <span lang={DISPLAY.tag} className="font-medium text-dialect">
                    {form.target}
                  </span>
                </span>
              ))}
            </p>
          )}

          <p className="text-sm leading-relaxed text-fg-muted">
            {row.heard > 0 ? plural(t.heardIn, row.heard, locale) : t.heardNowhere}
            {row.scenes.slice(0, SCENES_SHOWN).map((scene, i) => (
              <span key={scene.id}>
                {i === 0 ? " " : " · "}
                <a href={scene.href} className="text-link underline underline-offset-4 hover:text-accent">
                  {scene.title}
                </a>
              </span>
            ))}
            {row.scenes.length > SCENES_SHOWN && ` ${fill(t.moreScenes, { count: String(row.scenes.length - SCENES_SHOWN) })}`}
            {row.guessable && ` ${t.guessableShort}`}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {row.practisable && (
              <SessionLink
                locale={locale}
                scope={wordsScope([row.target])}
                className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary hover:bg-surface-page"
              >
                {t.practiseWord}
              </SessionLink>
            )}
            <button
              type="button"
              onClick={() => askHeidi(fill(t.askSay, { word: row.target }))}
              className="min-h-11 text-sm text-link underline underline-offset-4 hover:text-accent"
            >
              {t.askLabel}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * Where the learner stands, as a shape rather than a colour: empty ring for
 * new, half for learning, full for known — readable in both themes and by
 * somebody who does not see the difference between two greys.
 */
export function StatusMark({ status, label, decorative = false }: { status: WordStatus; label: string; decorative?: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-fg-secondary ${
        status === "known" ? "bg-fg-secondary" : status === "learning" ? "bg-[linear-gradient(90deg,var(--color-fg-secondary)_50%,transparent_50%)]" : ""
      }`}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": label, title: label })}
    />
  );
}
