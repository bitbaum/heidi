"use client";

import type { Answer } from "@/lib/domain/chat/types";
import Link from "next/link";
import { moveId, moveKey, type NextMove } from "@/lib/domain/chat/moves";
import { href } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
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
  onMove,
  locale,
}: {
  answer: Answer;
  t: Dictionary["chat"];
  /** For the grammar link. Absent means grammar chips are not offered. */
  locale?: Locale;
  /** The learner's line this answers, carried onto any word they keep. */
  context?: string;
  /**
   * Send the follow-up a chip stands for. Absent where the surface cannot send
   * — a read-only transcript shows no chips rather than dead ones.
   */
  onMove?: (say: string) => void;
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
                  <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">
                    {s.label}
                    {/* Which language this line actually IS. Without it the two
                        sit side by side looking like two moods of one thing,
                        and the person cannot tell which to send to a landlord
                        and which to send to a friend — which is the entire
                        decision the pair exists to help them make. */}
                    {s.variety === "bridge" && (
                      <span className="ml-2 rounded-sm bg-surface-sunk px-1.5 py-0.5 text-fg-secondary">
                        {t.writtenStandard}
                      </span>
                    )}
                  </span>
                  <Copy text={s.text} t={t} />
                </div>
                {/* A bridge line is not dialect, so it is not coloured or
                    tagged as dialect — a screen reader reading Swiss Standard
                    German with Zurich phonology is exactly the confusion this
                    whole field exists to remove. */}
                <p
                  className={`mt-0.5 text-base leading-relaxed ${
                    s.variety === "bridge" ? "text-fg-primary" : "text-dialect"
                  }`}
                >
                  {s.text}
                </p>
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

      {onMove && a.next && a.next.length > 0 && (
        <NextMoves moves={a.next} t={t} onMove={onMove} locale={locale} />
      )}

      {/* Provenance. An answer with no model attached is a rumour. */}
      <p className="mt-3 border-t border-border-subtle pt-2 font-mono text-[10px] text-fg-muted">
        {t.checkedNote} · {a.model}
      </p>
    </>
  );
}

/**
 * The two or three things worth doing next, each one tap.
 *
 * Pressing one sends an ordinary message — the sentence the person would
 * otherwise have had to compose. It appears in the transcript as that
 * sentence, because a follow-up you cannot see is a conversation you cannot
 * re-read, and the thread is the product.
 *
 * The wording is ours, in the reader's language, looked up by id. The model
 * chooses WHICH to offer and never what they say: a label it wrote itself
 * would arrive in whatever language it felt like and could promise something
 * pressing it does not do.
 */
function NextMoves({
  moves,
  t,
  onMove,
  locale,
}: {
  moves: NextMove[];
  t: Dictionary["chat"];
  onMove: (say: string) => void;
  locale?: Locale;
}) {
  return (
    <div className="mt-4 border-t border-border-subtle pt-3">
      <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{t.moves.title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {moves.map((move) => {
          const wording = t.moves[moveKey(move) as keyof typeof t.moves];
          // A move with no wording cannot be rendered as a button — it would
          // be blank. `decodeMoves` already drops unknown ids, so this is the
          // belt to that braces rather than an expected branch.
          if (!wording || typeof wording === "string") return null;

          const style =
            "inline-flex min-h-9 items-center rounded-control border border-border-subtle px-3 text-sm text-fg-secondary transition-colors hover:border-accent hover:text-fg-primary";

          /**
           * Grammar is the one move that NAVIGATES rather than asks.
           *
           * The explanation already exists, written once and translated, and
           * it is better than anything the model would improvise for the
           * fourth time this week — which is the whole reason the page is
           * there. So it is a link, which also means it opens in a new tab if
           * the person wants to keep the conversation.
           *
           * The topic must exist in THIS locale's dictionary. `decodeMoves`
           * checked the shape; only the renderer can check that the words are
           * there, and a chip pointing at an anchor nothing renders would
           * scroll to the top of the page and look broken.
           */
          if (move.id === "grammar") {
            // `DISPLAY.grammar` rather than the dictionary: a test asserts the
            // two agree in every locale, and this component is only handed
            // `dict.chat`, which does not carry the topics.
            const known = locale && DISPLAY.grammar.some((topic) => topic.id === move.topic);
            if (!known) return null;
            return (
              <Link key={moveId(move)} href={`${href(locale, "grammar")}#${move.topic}`} className={style}>
                {wording.label}
              </Link>
            );
          }

          return (
            <button key={moveId(move)} type="button" onClick={() => onMove(wording.say)} className={style}>
              {wording.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
