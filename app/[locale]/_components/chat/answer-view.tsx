"use client";

import type { Answer } from "@/lib/domain/chat/types";
import Link from "next/link";
import { moveId, moveKey, type NextMove } from "@/lib/domain/chat/moves";
import { href } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import type { Dictionary } from "@/lib/i18n";
import { Copy } from "./copy-button";
import { Speak } from "./speak-button";
import { KeepWord } from "./keep-word";
import { ChatMarkdown } from "./chat-markdown";
import { fill } from "@/lib/i18n/fill";
import { learnMoves, type LearnMove } from "@/lib/domain/chat/learn";

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
  voiceT,
  context,
  onMove,
  locale,
}: {
  answer: Answer;
  t: Dictionary["chat"];
  /**
   * The voice copy, passed rather than looked up: this is a client component
   * and `getDictionary` here would ship all seven dictionaries to the browser.
   */
  voiceT: Dictionary["voice"];
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
      <ChatMarkdown text={a.text} className="text-base leading-relaxed text-fg-primary" />

      {/*
        The explanation itself can be heard, and that is not a nicety — it is
        the difference between a product that speaks and one that speaks only
        sometimes.

        Found by using the live site rather than by reading the code: speaking
        was attached to the dialect line and to each suggestion, which exist
        only on a PRODUCE turn. An UNDERSTAND turn — someone pasting a message
        they cannot read, which §9 calls the thing the product leads with — has
        neither, so the whole feature was invisible on the commoner half of the
        product. Four speak controls on "how do I say I'll be late", none at
        all on "what does nöd mean".

        It reads the prose, in the reader's own language. That is a smaller
        claim than the dialect line beside it and needs no caveat: nobody
        mistakes Heidi's German explanation for a model of Zurich phonology.
      */}
      <div className="mt-2">
        <Speak text={a.text} t={voiceT} />
      </div>

      {a.dialect && (
        <div className="mt-3 rounded-control border border-border-subtle bg-surface-raised p-3">
          {/*
            `flex-wrap` and no `shrink-0`, which together are the whole fix for
            a row that used to break in two different ways.

            It was `items-baseline justify-between` with a rigid control
            cluster: the label could only get narrower, so in Russian it
            wrapped to four lines beside two buttons, and the moment Speak
            opened its caveat the cluster — being `shrink-0` — pushed the card
            off the screen instead. Allowed to wrap, the controls simply take
            their own line when the label needs the width, which is what a
            phone wants anyway. `items-start` aligns the two 44px controls by
            their tops, and they now agree about being 44px.
          */}
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <span className="min-w-0 font-mono text-caption uppercase leading-[1.9] tracking-caps text-fg-muted">
              {t.sendThis}
            </span>
            <span className="flex min-w-0 items-start gap-3">
              <Speak text={a.dialect} t={voiceT} dialect />
              <Copy text={a.dialect} t={t} />
            </span>
          </div>
          {/* `lang` on the dialect line. This is the most-read surface in
              the product and it declared nothing: the line was distinguished
              from the explanation above it ONLY by colour, so a screen
              reader had no way to know it had changed language — and read
              Zurich German with the phonology of the interface locale. */}
          <p lang={DISPLAY.tag} className="mt-1 text-lg leading-relaxed text-dialect">
            {a.dialect}
          </p>
          {/* A flagged line is MARKED, never dropped. The learner cannot audit
              this work, so drift has to stay visible rather than be tidied. */}
          {a.dialectClean === false && (
            <p className="mt-1 font-mono text-caption text-danger">
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
          <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.glossTitle}</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {a.glosses.map((g) => (
              <li key={g.form} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <KeepWord gloss={g} t={t} context={context} />
                {/* Three languages on one row — dialect, German, English —
                    and none of them used to say so. */}
                <span lang={DISPLAY.tag} className="font-mono text-sm font-medium text-dialect">
                  {g.form}
                </span>
                {g.standard && (
                  <span lang="de" className="font-mono text-xs text-fg-muted">
                    {g.standard}
                  </span>
                )}
                <span lang="en" className="text-sm text-fg-secondary">
                  {g.english}
                </span>
                {g.rule && (
                  <span className="rounded-control bg-surface-sunk px-1.5 font-mono text-caption text-fg-muted">
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
          <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.suggestionsTitle}</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {a.suggestions.map((s) => (
              <li key={`${s.label}-${s.text}`} className="rounded-control border border-border-subtle p-2">
                {/* The same row as the dialect block's, for the same reasons. */}
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <span className="min-w-0 font-mono text-caption uppercase leading-[1.9] tracking-caps text-fg-muted">
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
                  <span className="flex min-w-0 items-start gap-3">
                    <Speak text={s.text} t={voiceT} dialect={s.variety !== "bridge"} />
                    <Copy text={s.text} t={t} />
                  </span>
                </div>
                {/* A bridge line is not dialect, so it is not coloured or
                    tagged as dialect — a screen reader reading Swiss Standard
                    German with Zurich phonology is exactly the confusion this
                    whole field exists to remove. */}
                <p
                  /* The comment above is the whole rule, and this element did
                     not implement it: it set the COLOUR conditionally and the
                     language never, so a dialect line was coloured as dialect
                     and still read aloud as the page's language. */
                  {...(s.variety === "bridge" ? { lang: "de" } : { lang: DISPLAY.tag })}
                  className={`mt-0.5 text-base leading-relaxed ${
                    s.variety === "bridge" ? "text-fg-primary" : "text-dialect"
                  }`}
                >
                  {s.text}
                </p>
                {s.english && <p className="text-sm text-fg-secondary">{s.english}</p>}
                {!s.clean && (
                  <p className="mt-1 font-mono text-caption text-danger">
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

      {/* What to LEARN from this answer, beside what to DO with it. Decided
          from the answer's structure, not by the model — see `learn.ts`. */}
      {onMove && <LearnRow answer={a} t={t} onMove={onMove} />}

      {/* Provenance. An answer with no model attached is a rumour. */}
      <p className="mt-3 border-t border-border-subtle pt-2 font-mono text-caption text-fg-muted">
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
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.moves.title}</p>
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
              <Link key={moveId(move)} href={`${href(locale, "grammar")}/${move.topic}`} className={style}>
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

/**
 * One tap on what a learner most likely asks next about THIS answer.
 *
 * The same chips, the same send path (`onMove` is the conversation's own
 * `send`), the same visible-message rule as the move row above — only the
 * question is different: not "what do I do with this message" but "what do I
 * learn from it". Renders nothing when the answer holds no Zurich line and no
 * word worth asking about.
 */
function LearnRow({ answer, t, onMove }: { answer: Answer; t: Dictionary["chat"]; onMove: (say: string) => void }) {
  const moves = learnMoves(answer);
  if (moves.length === 0) return null;
  const l = t.learn;
  const say = (m: LearnMove): { label: string; text: string } => {
    switch (m.id) {
      case "breakdown":
        return { label: l.breakdownLabel, text: fill(l.breakdown, { text: m.text }) };
      case "similar":
        return { label: l.similarLabel, text: fill(l.similar, { word: m.word }) };
      case "story":
        return { label: l.storyLabel, text: fill(l.story, { word: m.word }) };
      case "examples":
        return { label: l.examplesLabel, text: fill(l.examples, { word: m.word }) };
    }
  };
  return (
    <div className="mt-3 border-t border-border-subtle pt-3">
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{l.title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {moves.map((m) => {
          const { label, text } = say(m);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onMove(text)}
              className="inline-flex min-h-9 items-center rounded-control border border-border-subtle px-3 text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
