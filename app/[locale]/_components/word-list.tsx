"use client";

import type { Dictionary } from "@/lib/i18n";
import { DISPLAY } from "@/lib/variety/display";
import { fill } from "@/lib/i18n/fill";
import { askHeidi } from "@/lib/browser/ask";
import { wordSlug } from "@/lib/domain/practice/slug";
import { useSaved } from "./use-saved";
import { useByok } from "./use-byok";

/**
 * The vocabulary list, as something you can act on.
 *
 * WHAT IT REPLACES. Two columns of text: the dialect word, the German word,
 * sixty times. Everything the product knows how to do with a word — keep it,
 * ask it back at the right moment, meet it in a new sentence — already existed
 * and was reachable only from inside a chat answer. A learner who came to the
 * vocabulary page to learn vocabulary could read it and nothing else. That is
 * the "not developed yet" in the brief, and the fix is not more words: it is
 * connecting this page to the review machinery that was already built.
 *
 * TWO ACTIONS, NOT FIVE. Keep it, or ask to see it used. A row of buttons per
 * word would make a reference page look like a toolbar and would bury the one
 * that matters — the `+`, which is what puts the word into review.
 *
 * ONE CLIENT COMPONENT FOR THE WHOLE GROUP, not one per row. Sixty islands
 * would each carry their own storage subscription; this way the list reads
 * storage once and every row in it re-renders from the same answer.
 */
export function WordList({
  words,
  t,
  chatT,
  persons,
  saidIn,
}: {
  words: ReadonlyArray<{
    target: string;
    bridge: string;
    article?: string;
    forms?: ReadonlyArray<{ label: string; target: string; bridge: string }>;
    example?: { target: string; bridge: string };
  }>;
  t: Dictionary["vocabulary"];
  /** `saveWord` / `savedWord` live in the chat dictionary, where the gloss is. */
  chatT: Dictionary["chat"];
  /** Person labels for a paradigm, from the practice dictionary that owns them. */
  persons: Dictionary["practice"]["persons"];
  /**
   * The scenes each word is actually said in, keyed by the dialect form.
   *
   * Computed on the server by a whole-word match, because `si` lives inside
   * `isch` and a substring join would tell a reader this word appears in nine
   * scenes when it appears in none of them. Absent for most words and that is
   * the normal case: the pack's function words are general, and a care shift
   * is one domain. A word with no scenes shows nothing rather than an empty
   * heading, which is the join declining to pad itself.
   */
  saidIn?: Record<string, readonly { id: string; title: string; href: string }[]>;
}) {
  const saved = useSaved();
  // Forwarded so the example sentences are generated on the key they brought,
  // when they brought one — same model, same quality, their bill.
  const byok = useByok();

  return (
    <ul className="mt-5 grid grid-cols-safe gap-x-8 gap-y-px hyphens-auto wrap-anywhere sm:grid-cols-2">
      {words.map((word) => {
        // Before storage has been read every word would claim to be unkept, and
        // a control that flips under the reader's finger is worse than one that
        // arrives a moment late.
        const kept = saved.ready && saved.isSaved(word.target);

        return (
          <li
            key={word.target}
            id={wordSlug(word.target)}
            className="group grid scroll-mt-anchor grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] items-baseline gap-x-3 border-b border-border-subtle py-2.5"
          >
            <span
              lang={DISPLAY.tag}
              className="font-heading text-base font-semibold leading-snug tracking-display text-dialect"
            >
              {/*
                THE ARTICLE IS PART OF THE WORD, and printed with it for the
                same reason a German dictionary prints `der`: a noun learned
                without its gender has to be learned again the first time it
                needs one. Muted, because the noun is still the entry.

                Absent where nobody has checked — the pack keeps `article`
                optional precisely so that gap stays visible rather than being
                filled with a plausible guess.
              */}
              {word.article && (
                <span className="font-normal text-fg-muted">
                  {word.article}{" "}
                </span>
              )}
              {word.target}
            </span>
            <span lang="de" className="text-base leading-snug text-fg-secondary">
              {word.bridge}
            </span>

            <span className="flex shrink-0 items-center gap-1">
              {/*
                Shown on hover and focus on a pointer device, always on a
                phone — where there is no hover and a control that only
                appears on one does not exist at all.

                `focus-within` on the row is what keeps it reachable by
                keyboard: without it the button is invisible at the moment it
                receives focus, which is the standard way this pattern is
                shipped broken.
              */}
              <button
                type="button"
                onClick={() => askHeidi(fill(t.askSay, { word: word.target }))}
                aria-label={`${t.askLabel}: ${word.target}`}
                title={t.askLabel}
                /* 28px for a mouse, 44 for a thumb. The two sizes are not a
                   compromise between devices — on a phone these buttons are
                   always visible (no hover to reveal them) and are the only
                   way to act on a word, so they are the target; on a desktop
                   they appear on hover beside a pointer that can hit 28px. */
                className="inline-flex h-7 w-7 items-center justify-center rounded-control border border-transparent text-fg-muted transition-colors hover:border-border-strong hover:text-fg-primary focus-visible:border-border-strong max-sm:h-11 max-sm:w-11 max-sm:border-border-subtle sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
              >
                <SpeechIcon />
              </button>

              {saved.ready && (
                <button
                  type="button"
                  onClick={() =>
                    kept
                      ? saved.forget(word.target)
                      : saved.save({ target: word.target, bridge: word.bridge }, byok.config)
                  }
                  aria-pressed={kept}
                  aria-label={`${kept ? chatT.savedWord : chatT.saveWord}: ${word.target}`}
                  title={kept ? chatT.savedWord : chatT.saveWord}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-control border text-xs transition-colors max-sm:h-11 max-sm:w-11 ${
                    kept
                      ? "border-accent bg-accent text-on-accent"
                      : "border-border-subtle text-fg-muted hover:border-border-strong hover:text-fg-primary"
                  }`}
                >
                  <span aria-hidden="true">{kept ? "✓" : "+"}</span>
                </button>
              )}
            </span>

            {/*
              WHAT THE WORD DOES, on its own line across the whole row.

              Only for entries that have it, which is currently a handful —
              and that is the honest state rather than a layout problem. A row
              with nothing to add stays exactly as tight as it was, so the list
              does not pay a line of height per word for a feature four words
              use.

              The paradigm is one line of `du häsch · er hät`, not a table:
              three forms do not need axes, and a table in the second column of
              a two-column list is a layout that breaks on a phone for the sake
              of looking thorough.
            */}
            {(word.forms?.length || word.example || saidIn?.[word.target]?.length) && (
              <div className="col-span-3 mt-1 flex flex-col gap-0.5">
                {word.forms && word.forms.length > 0 && (
                  <p className="text-sm leading-relaxed text-fg-secondary">
                    {word.forms.map((form, i) => (
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

                {word.example && (
                  <p className="text-sm leading-relaxed text-fg-muted">
                    <span lang={DISPLAY.tag} className="italic">
                      «{word.example.target}»
                    </span>{" "}
                    <span lang="de">{word.example.bridge}</span>
                  </p>
                )}

                {/* Where the word is actually said, when it is.

                    This is the difference between a gloss and a memory: `nöd`
                    means `nicht` is a fact you read, and `nöd` in four
                    sentences from a shift is a thing you can picture. The
                    links are to scenes the reader can open, so the list stops
                    being a terminus. */}
                {saidIn?.[word.target]?.length ? (
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm leading-relaxed">
                    <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                      {t.saidInTitle}
                    </span>
                    {saidIn[word.target].map((scene, i) => (
                      <span key={scene.id}>
                        {i > 0 && <span aria-hidden="true" className="text-fg-muted">· </span>}
                        <a
                          href={scene.href}
                          className="text-link underline underline-offset-4 hover:text-accent"
                        >
                          {scene.title}
                        </a>
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SpeechIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * How many of these the reader is carrying, and a way into reviewing them.
 *
 * A COUNT OF THEIR OWN WORDS, NEVER A SCORE. "12 in review" is a true,
 * checkable fact about what they chose to keep. A streak or a percentage would
 * measure how much Heidi they have consumed while pretending to measure what
 * they have learned, which §8 of HEIDI.md names as the thing this product does
 * not do.
 */
export function KeptCount({ t, portalHref }: { t: Dictionary["vocabulary"]; portalHref: string }) {
  const saved = useSaved();

  // Nothing at all during the server pass, rather than "0 kept" flashing at
  // somebody who has forty.
  if (!saved.ready) return <div className="min-h-11" aria-hidden="true" />;

  if (saved.count === 0) {
    return <p className="max-w-measure text-sm leading-relaxed text-fg-muted">{t.keptNone}</p>;
  }

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-secondary">
      <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">
        {saved.count} {t.keptSome}
      </span>
      <a href={portalHref} className="text-link underline underline-offset-4 hover:text-accent">
        {t.practise}
      </a>
    </p>
  );
}
