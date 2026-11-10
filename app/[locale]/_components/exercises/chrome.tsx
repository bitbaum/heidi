"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { wordSlug } from "@/lib/domain/practice/slug";
import type { PracticeItem } from "@/lib/domain/practice/types";
import { Explanation } from "./explanation";
import { Actions, PRIMARY } from "./actions";

/**
 * The parts every exercise view shares: the verdict, the link back to where
 * the answer is explained, and the one-line form of an answer.
 *
 * HERE RATHER THAN IN EACH VIEW, because these are about the SESSION rather
 * than about a kind — "was that right", "where does this come from", "what was
 * it" mean the same thing whichever question was asked, and four copies of a
 * verdict is four places for the wording to drift.
 */

/**
 * Right or not, and where the claim comes from.
 *
 * Only ever shown for the objective kinds, which is the whole reason the two
 * markings are separated: this product may tell a learner they are wrong when
 * a fixed rule says so, and may not when the question was about spelling a
 * language with no settled orthography.
 */
/**
 * How many answers in a row this sitting has got right BEFORE the one being
 * shown — momentum, not a score. Provided by the session; 0 outside one.
 */
export const Momentum = createContext(0);

/** A right answer moves on by itself after this long, unless the learner stops it. */
export const AUTO_ADVANCE_MS = 1300;

export function Verdict({
  right,
  t,
  grammarT,
  situationsT,
  vocabularyT,
  learnT,
  item,
  locale,
  mine,
  onNext,
}: {
  right: boolean;
  t: Dictionary["practice"];
  grammarT: Dictionary["grammar"];
  situationsT: Dictionary["situations"];
  vocabularyT: Dictionary["vocabulary"];
  learnT: Dictionary["chat"]["learn"];
  item: PracticeItem;
  locale: Locale;
  /** The option they chose, when it was not the right one. */
  mine?: string;
  onNext: () => void;
}) {
  /*
    FAST WHEN RIGHT, PATIENT WHEN WRONG.

    Every answer used to stop on "Weiter", right or not — a tap per question
    that bought nothing when the learner already knew. Now a right answer
    moves on by itself after a beat (the bar under "Weiter" shows the beat),
    and the why is one tap away instead of on screen; opening it holds the
    beat. A wrong answer never moves on: the explanation is the point of
    being wrong.
  */
  const [why, setWhy] = useState(!right);
  const next = useRef(onNext);
  useEffect(() => {
    next.current = onNext;
  }, [onNext]);
  // Opening the why holds it; nothing else has to be listened for.
  const auto = right && !why;

  useEffect(() => {
    buzz(right);
  }, [right]);

  useEffect(() => {
    if (!auto) return;
    const timer = window.setTimeout(() => next.current(), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [auto]);

  return (
    <>
      {why && (
        <div>
          {item.kind === "pair" && item.origin && (
            <p className="mt-5 text-sm leading-relaxed text-fg-secondary">{fill(t.origin, { origin: item.origin })}</p>
          )}
          <Explanation item={item} locale={locale} t={t} grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT} learnT={learnT} mine={mine} />
          <Trace item={item} t={t} locale={locale} />
        </div>
      )}

      <Actions status={<VerdictLine right={right} t={t} item={item} />}>
        {right && !why && (
          <button type="button" onClick={() => setWhy(true)} className="min-h-12 rounded-control px-4 text-sm font-medium text-fg-secondary underline underline-offset-4 hover:text-fg-primary">
            {t.whyAnswer}
          </button>
        )}
        <button type="button" onClick={onNext} className={`${PRIMARY} relative overflow-hidden`} autoFocus>
          {t.next}
          {auto && <span aria-hidden="true" className="oc-countdown absolute inset-x-0 bottom-0 h-1 bg-on-action/40" style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }} />}
        </button>
      </Actions>
    </>
  );
}

/** A short, distinct pulse a thumb can feel: one tap for right, two for wrong. */
function buzz(right: boolean) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(right ? 12 : [24, 60, 24]);
  } catch {
    // Not every browser that has it lets a page use it; silence is fine.
  }
}

/** A word of encouragement that is not the same every time: picked from the item, so it is stable on re-render. */
function cheerFor(t: Dictionary["practice"], id: string): string {
  const list = t.cheers;
  if (!list?.length) return t.right;
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

/**
 * The verdict as a strip with a mark in it: an ink tick, or a red cross on
 * the theme's pale red. Seen before it is read — which is the whole job.
 */
export function VerdictLine({ right, t, item }: { right: boolean; t: Dictionary["practice"]; item?: PracticeItem }) {
  const run = useContext(Momentum);
  return (
    <div
      role="status"
      className={`oc-verdict flex items-center gap-3 rounded-control px-4 py-3 ${right ? "bg-correct-tint" : "bg-incorrect-tint"}`}
    >
      <span
        aria-hidden="true"
        className={`grid size-8 shrink-0 place-items-center rounded-full ${right ? "bg-correct text-on-correct" : "bg-incorrect text-on-incorrect"}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {right ? <path d="M5 12.5l4.5 4.5L19 7" /> : <path d="M6 6l12 12M18 6L6 18" />}
        </svg>
      </span>
      <p className={`mb-0 text-lg font-semibold ${right ? "text-fg-primary" : "text-incorrect"}`}>
        {right ? cheerFor(t, item?.id ?? "") : t.wrong}
      </p>
      {right && run + 1 >= 3 && (
        <span className="oc-pop ml-auto rounded-full bg-correct px-2.5 py-1 font-mono text-caption font-semibold uppercase tracking-caps text-on-correct">
          {t.inARow.other.replace("{n}", String(run + 1))}
        </span>
      )}
    </div>
  );
}

/**
 * Which grammar topic explains this item — now `topicOf` in
 * `lib/domain/practice/explanation.ts`, which every explanation reads. Kept as
 * a name here only because the test review imports it; the precedence lives
 * in one place and is pinned by `explanation.test.ts`.
 */
export { topicOf as explainingTopic } from "@/lib/domain/practice/explanation";

/**
 * `flex w-fit`, not `inline-flex`.
 *
 * Inline, it shared a line with the button that follows it and the two
 * overlapped — a 44px tap target on top of another one, where the link was
 * unreachable and the button looked like it had a label glued to its left.
 * Found by looking at the page; no test would have said a word.
 */
const TRACE_LINK =
  "mt-3 flex min-h-11 w-fit items-center text-sm text-link underline underline-offset-4 hover:text-accent";

/** The same link in a list, where a 44px block per row would be a wall. */
const TRACE_LINK_COMPACT = "text-sm text-link underline underline-offset-4 hover:text-accent";

/**
 * The link back to where the answer is explained.
 *
 * This is the part that makes the page more than a quiz. A learner who just
 * got `s Huus` wrong has a specific gap, and the product already has a page
 * about it — sending them there is the difference between being tested and
 * being taught. The link is built from the item's own provenance, so a
 * question that cannot say where it came from silently offers nothing rather
 * than guessing.
 */
export function Trace({
  item,
  t,
  locale,
  compact = false,
}: {
  item: PracticeItem;
  t: Dictionary["practice"];
  locale: Locale;
  /** In the end-of-session list these sit on one line each, not stacked. */
  compact?: boolean;
}) {
  const className = compact ? TRACE_LINK_COMPACT : TRACE_LINK;

  if (item.source.kind === "grammar") {
    return (
      <Link href={`${href(locale, "grammar")}/${item.source.topic}`} className={className}>
        {t.grammarLink}
      </Link>
    );
  }

  /**
   * A line from a scene goes back to the SCENE, not to the grammar topic.
   *
   * The sentence they just missed is one of ten in a handover, and the other
   * nine are the context that makes it stick — sending them to
   * `am-progressive` instead would be technically the same information and a
   * worse answer to "why did I not get that". The topic is one click further
   * on from the scene, where the scene itself links to it.
   */
  if (item.source.kind === "situation") {
    return (
      <Link href={`${href(locale, "situations")}/${item.source.scene}`} className={className}>
        {t.situationLink}
      </Link>
    );
  }

  if (item.source.kind === "word") {
    return (
      <Link href={`${href(locale, "vocabulary")}#${wordSlug(item.source.word)}`} className={className}>
        {t.wordLink}
      </Link>
    );
  }

  /**
   * A pair comes from a gate rule, and the gate's own rule list is published
   * at `/method#gate`.
   *
   * This was the one provenance with nowhere to go, which showed at the end of
   * a session: two of seven missed items were bare words with no way to find
   * out why they were wrong. The rule that judged them is a page the product
   * already publishes — not linking to it was an omission rather than a
   * decision.
   */
  if (item.source.kind === "rule") {
    return (
      <Link href={`${href(locale, "method")}#gate`} className={className}>
        {t.ruleLink}
      </Link>
    );
  }

  return null;
}

/** The person label in the reader's language, falling back to the pack's key. */
export function person(t: Dictionary["practice"], label: string): string {
  const persons: Record<string, string> = t.persons;
  return persons[label] ?? label;
}

export { answerOf } from "@/lib/domain/practice/answer";

/**
 * The option button's colours, which say three different things.
 *
 * Unanswered, chosen-and-right, chosen-and-wrong — and, once answered, the
 * correct one is marked even if it was not the one pressed. A drill that only
 * says "no" teaches the learner that they were wrong and not what was right.
 */
export function optionClass(index: number, chose: number | null, answer: number, sentence = false): string {
  /**
   * A sentence option is a full-width, left-aligned row that may wrap; a word
   * or a number is a button as wide as itself. Two classes, not one class with
   * an override appended, because two width utilities on one element resolve
   * by emission order — the trap `PROMPT_TEXT` documents for colour.
   */
  const base = sentence
    ? "min-h-12 w-full rounded-control border-2 px-4 py-2.5 text-left font-heading text-base font-semibold leading-snug tracking-display transition-colors"
    : "min-h-12 w-full rounded-control border-2 px-4 font-heading text-base font-semibold tracking-display transition-colors sm:w-auto";

  if (chose === null) {
    return `${base} border-border-strong text-fg-primary hover:bg-surface-page active:scale-[0.98]`;
  }
  /*
    The answer the learner TOUCHED carries the verdict: filled with ink and a
    tick if it was right; a red outline and a cross if not — and the right one
    is then outlined in ink with its tick, so the eye goes there next. It used
    to fill the right answer black whether or not they had picked it, which
    looked identical to being right. Heidi's two colours only (globals.css).
  */
  if (index === answer && chose === answer) return `${base} oc-pop border-correct bg-correct text-on-correct`;
  if (index === answer) return `${base} border-correct bg-surface-page text-fg-primary`;
  if (index === chose) return `${base} oc-shake border-incorrect bg-incorrect-tint text-incorrect`;
  return `${base} border-border-subtle text-fg-muted opacity-60`;
}

/** The tick or cross inside an answered option, so the verdict does not rely on colour alone. */
export function OptionMark({ index, chose, answer }: { index: number; chose: number | null; answer: number }) {
  if (chose === null || (index !== answer && index !== chose)) return null;
  const right = index === answer;
  return (
    <span aria-hidden="true" className="mr-2 inline-block font-sans">
      {right ? "✓" : "✕"}
    </span>
  );
}

/** The dialect prompt, set large. One definition, so the four views agree. */
/**
 * The prompt's size and weight — and deliberately NOT its colour.
 *
 * It used to carry `text-dialect`, which painted a translate item's GERMAN
 * prompt in the dialect ink. Adding a second colour at the call site does not
 * override it reliably: two colour utilities on one element resolve by the
 * order Tailwind emits them, not the order they are written. So each caller
 * states its colour, next to the `lang` that says what the text is.
 */
export const PROMPT_TEXT = "mt-2 font-heading text-2xl font-semibold leading-snug tracking-display sm:text-3xl";

/**
 * A keydown this page should ignore.
 *
 * `instanceof Element` first, and it is not defensive padding: a keydown's
 * target is not always an element — it is the Window when the event is
 * dispatched there directly, and `Window.closest` does not exist. The cast
 * alone typechecked and then threw `target?.closest is not a function` on the
 * first keypress, which took the whole handler down: every key after it did
 * nothing and the page looked frozen rather than broken.
 *
 * Nothing is bound that a person could be typing into. This page has no text
 * field, but the chat dock floats above it on every page and taking its digits
 * would be the kind of bug that looks like a broken keyboard.
 */
export function ignoreKey(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return true;
  const target = event.target;
  return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable=true]"));
}
