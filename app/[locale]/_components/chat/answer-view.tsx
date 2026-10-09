"use client";

import type { Answer } from "@/lib/domain/chat/types";
import Link from "next/link";
import { moveKey, suggestionLabel } from "@/lib/domain/chat/moves";
import { answerRow, type RowItem } from "@/lib/domain/chat/row";
import { href } from "@/lib/i18n/routes";
import { LOCALE_TAGS, type Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import type { Dictionary } from "@/lib/i18n";
import { Copy } from "./copy-button";
import { Speak } from "./speak-button";
import { KeepWord } from "./keep-word";
import { sentenceWith } from "@/lib/domain/saved/context";
import { ChatMarkdown } from "./chat-markdown";
import { fill } from "@/lib/i18n/fill";
import { learnMoves } from "@/lib/domain/chat/learn";

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
  onReply,
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
  /**
   * The learner's line this answers. A kept word takes it as its sentence only
   * if the word is in it; otherwise Heidi's line or a suggestion that has it.
   */
  context?: string;
  /**
   * Send the follow-up a chip stands for. Absent where the surface cannot send
   * — a read-only transcript shows no chips rather than dead ones.
   */
  onMove?: (say: string) => void;
  /**
   * Send one of the answer's suggested replies as the reader's message. Given
   * only to the LATEST answer, and only while no turn is running — a reply to
   * an answer three turns up would arrive as a non sequitur.
   */
  onReply?: (say: string) => void;
}) {
  const a = answer;
  // The explanations are written in the reader's language, whatever the
  // field is called.
  const readerLang = locale ? LOCALE_TAGS[locale] : undefined;
  /**
   * A reader on the variety's own site reads a dialect suggestion directly, so
   * its translation is noise — `forReader` strips it when the answer is made.
   * But a stored answer keeps whatever language it was made in: a conversation
   * started on /en and continued on /gsw showed English under some lines and
   * German under others. Applied again here, by the page being read.
   */
  const readsVariety = locale !== undefined && DISPLAY.tag.split("-")[0] === locale;
  /** The footer may say "checked" only when everything it checked passed. */
  const allClean =
    a.dialectClean !== false && a.textClean !== false && a.suggestions.every((s) => s.variety === "bridge" || s.clean);

  return (
    <>
      <ChatMarkdown text={a.text} className="text-base leading-relaxed text-fg-primary" />
      {a.textClean === false && (
        <p className="mt-1 font-mono text-caption text-danger">
          {t.flagged} {a.textFlags?.join(", ")}
        </p>
      )}

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
            {/* A line the gate refused is shown — drift stays visible — but it
                is never offered as the thing to send, and it gets no Copy. */}
            <span
              className={`min-w-0 font-mono text-caption uppercase leading-[1.9] tracking-caps ${
                a.dialectClean === false ? "text-danger" : "text-fg-muted"
              }`}
            >
              {a.dialectClean === false ? t.notSendable : t.sendThis}
            </span>
            <span className="flex min-w-0 items-start gap-3">
              <Speak text={a.dialect} t={voiceT} dialect />
              {a.dialectClean !== false && <Copy text={a.dialect} t={t} />}
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
          {a.tone && <span className="font-medium text-fg-primary">{t.tones[a.tone]}</span>}
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
                <KeepWord gloss={g} t={t} context={sentenceWith(g.form, [context, a.dialect, ...a.suggestions.map((s) => s.text)])} />
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
                <span lang={readerLang} className="text-sm text-fg-secondary">
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
                    {suggestionLabelText(s.label, t)}
                    {/* Which language this line actually IS. Without it the two
                        sit side by side looking like two moods of one thing,
                        and the person cannot tell which to send to a landlord
                        and which to send to a friend — which is the entire
                        decision the pair exists to help them make. */}
                    {s.variety === "bridge" && (
                      <span
                        className={`${suggestionLabelText(s.label, t) ? "ml-2 " : ""}rounded-sm bg-surface-sunk px-1.5 py-0.5 text-fg-secondary`}
                      >
                        {t.writtenStandard}
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 items-start gap-3">
                    <Speak text={s.text} t={voiceT} dialect={s.variety !== "bridge"} />
                    {s.clean && <Copy text={s.text} t={t} />}
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
                {s.english && !(readsVariety && s.variety !== "bridge") && (
                  <p lang={readerLang} className="text-sm text-fg-secondary">
                    {s.english}
                  </p>
                )}
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

      {/* ONE row of one-tap buttons: the model's suggested replies first
          (latest answer only), then what to DO with the answer, then what to
          LEARN from it — de-duplicated and capped by `answerRow`. */}
      {onMove && (
        <AnswerRow answer={a} t={t} onMove={onMove} replies={onReply ? a.replies : undefined} onReply={onReply} locale={locale} />
      )}

      {/* Provenance. An answer with no model attached is a rumour. */}
      <p className="mt-3 border-t border-border-subtle pt-2 font-mono text-caption text-fg-muted">
        {allClean ? t.checkedNote : t.checkedFlagged} · {a.model}
      </p>
    </>
  );
}

/** A suggestion's label in the reader's language — see `suggestionLabel`. */
function suggestionLabelText(raw: string, t: Dictionary["chat"]): string {
  const label = suggestionLabel(raw);
  switch (label.kind) {
    case "axis":
      return t.moves[label.axis].label;
    case "tone":
      return t.tones[label.tone];
    case "hidden":
      return "";
    case "raw":
      return label.text;
  }
}

/**
 * Everything worth one tap under an answer, as ONE row.
 *
 * It used to be three: chatkit's suggested replies, "What now?" and "Learn
 * from this", each under its own caption — up to ten buttons on the latest
 * answer. Now replies come first, then the moves, then the learn chips, and
 * `answerRow` (lib/domain/chat/row.ts) removes repeats and caps the row.
 *
 * Every button but one sends an ordinary visible message — the sentence the
 * person would otherwise have had to compose — through the same `send` the
 * composer uses. It appears in the transcript as that sentence, because a
 * follow-up you cannot see is a conversation you cannot re-read.
 *
 * The move and learn wording is ours, in the reader's language, looked up by
 * id. The model chooses WHICH to offer and never what they say: a label it
 * wrote itself would arrive in whatever language it felt like and could
 * promise something pressing it does not do. The replies are the exception by
 * design — they are the reader's own next line, and the model writes them in
 * the reader's language.
 *
 * Styled as chatkit's reply buttons (`ck-replies` / `ck-reply`, themed by the
 * `--ck-*` tokens in globals.css), so the row looks as it does in every
 * product of the fleet. Not `<ChatReplies>` itself, because one button here
 * NAVIGATES: grammar opens the explanation page, a link that can open in a new
 * tab, and chatkit's row only sends text.
 */
function AnswerRow({
  answer,
  t,
  onMove,
  replies,
  onReply,
  locale,
}: {
  answer: Answer;
  t: Dictionary["chat"];
  onMove: (say: string) => void;
  /** Present only under the latest answer while the reader could send. */
  replies?: string[];
  onReply?: (say: string) => void;
  locale?: Locale;
}) {
  const own: RowItem[] = [];

  for (const move of answer.next ?? []) {
    const wording = t.moves[moveKey(move) as keyof typeof t.moves];
    // A move with no wording cannot be rendered as a button — it would be
    // blank. `decodeMoves` already drops unknown ids, so this is the belt to
    // that braces rather than an expected branch.
    if (!wording || typeof wording === "string") continue;
    if (move.id === "grammar") {
      /**
       * Grammar is the one move that NAVIGATES rather than asks. The
       * explanation already exists, written once and translated, and it is
       * better than anything the model would improvise for the fourth time
       * this week.
       *
       * The topic must exist: `decodeMoves` checked the shape; only here can
       * the words be checked, and a chip pointing at an anchor nothing
       * renders would scroll to the top of the page and look broken.
       * `DISPLAY.grammar` rather than the dictionary: a test asserts the two
       * agree in every locale.
       */
      const known = locale && DISPLAY.grammar.some((topic) => topic.id === move.topic);
      if (known) own.push({ kind: "link", label: wording.label, href: `${href(locale, "grammar")}/${move.topic}` });
      continue;
    }
    own.push({ kind: "send", label: wording.label, say: wording.say });
  }

  // What to LEARN from this answer, decided from its structure — `learn.ts`.
  const l = t.learn;
  for (const m of learnMoves(answer)) {
    switch (m.id) {
      case "breakdown":
        own.push({ kind: "send", label: l.breakdownLabel, say: fill(l.breakdown, { text: m.text }) });
        break;
      case "similar":
        own.push({ kind: "send", label: l.similarLabel, say: fill(l.similar, { word: m.word }) });
        break;
      case "story":
        own.push({ kind: "send", label: l.storyLabel, say: fill(l.story, { word: m.word }) });
        break;
      case "examples":
        own.push({ kind: "send", label: l.examplesLabel, say: fill(l.examples, { word: m.word }) });
        break;
    }
  }

  const replyItems = onReply ? (replies ?? []) : [];
  const fromReplies = new Set(replyItems);
  const row = answerRow(replyItems, own);
  if (row.length === 0) return null;

  return (
    <div className="ck-replies" role="group" aria-label={t.moves.title}>
      {row.map((item, i) =>
        item.kind === "link" ? (
          <Link key={`link:${item.href}`} href={item.href} className="ck-reply inline-flex items-center no-underline">
            {item.label}
          </Link>
        ) : (
          <button
            key={`${i}:${item.say}`}
            type="button"
            className="ck-reply"
            // A reply goes through `onReply`, a move or learn chip through
            // `onMove`. Today both are the conversation's own `send`; kept
            // apart so a surface may treat them differently.
            onClick={() => (fromReplies.has(item.say) && onReply ? onReply(item.say) : onMove(item.say))}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
