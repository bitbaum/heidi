"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { DISPLAY } from "@/lib/variety/display";
import { recallItems } from "@/lib/domain/practice/generate";
import { orderSession, summarise } from "@/lib/domain/practice/session";
import type { PracticeItem } from "@/lib/domain/practice/types";
import { wordSlug } from "@/lib/domain/practice/slug";
import { useSaved } from "./use-saved";
import { useGrade } from "./use-review";

/**
 * The exercise page, which is the first place in this product where the
 * learner is asked eight things in a row.
 *
 * WHY THE PACK'S ITEMS ARRIVE AS A PROP.
 *
 * They are generated on the server, from the pack, and handed down. The
 * alternative — importing `VARIETY` here — would ship every rule's prose and
 * every grammar topic's explanation to the browser to build eight questions
 * out of them. The learner's own words go the other way and never leave the
 * browser at all: `recallItems` runs on this side, on what is in storage, and
 * `orderSession` puts the two halves in one order.
 *
 * WHY THE SESSION IS HELD IN STATE RATHER THAN DERIVED.
 *
 * Answering a recall item writes the word back with a new review date, which
 * changes the list the session was built from. Derived with `useMemo`, the
 * session would rebuild underneath the learner the moment they graded
 * something — the remaining questions would reshuffle mid-sitting. It is
 * built once per round, deliberately, and the next round is the next build.
 */
export function PracticeSession({
  packItems,
  t,
  locale,
}: {
  /** Everything the pack can ask, generated on the server. */
  packItems: readonly PracticeItem[];
  t: Dictionary["practice"];
  locale: Locale;
}) {
  const saved = useSaved();
  const grade = useGrade();

  const [session, setSession] = useState<PracticeItem[] | null>(null);
  const [at, setAt] = useState(0);
  const [outcomes, setOutcomes] = useState<{ id: string; outcome: string }[]>([]);

  /** What this browser has already been asked, so a second round differs. */
  const seen = useRef<string[]>([]);

  const build = useCallback(() => {
    setSession(
      orderSession({
        items: [...packItems, ...recallItems(saved.words)],
        saved: saved.words,
        now: new Date(),
        seen: seen.current,
      }),
    );
    setAt(0);
    setOutcomes([]);
  }, [packItems, saved.words]);

  // Once storage has been read, and not before: a session built on an empty
  // word list would leave out every word that was actually due.
  useEffect(() => {
    if (saved.ready && session === null) build();
  }, [saved.ready, session, build]);

  if (!saved.ready || session === null) {
    // Nothing rather than a flash of the signed-out shape at somebody who has
    // forty words waiting.
    return <div className="min-h-64" aria-hidden="true" />;
  }

  const item = session[at];

  function record(id: string, outcome: "right" | "wrong" | "skipped") {
    seen.current = [...seen.current.filter((s) => s !== id), id];
    setOutcomes((previous) => [...previous, { id, outcome }]);
    setAt((previous) => previous + 1);
  }

  /**
   * A recall answer is also a review answer.
   *
   * The word carries its own schedule (`review.ts`), and practising a word
   * without telling the schedule would mean the same word is due again
   * tomorrow however well it went — the spacing effect spent and not banked.
   */
  function recordRecall(id: string, prompt: string, knew: boolean) {
    const word = saved.words.find((w) => w.target.trim().toLocaleLowerCase() === prompt.trim().toLocaleLowerCase());
    if (word) grade(word, knew);
    record(id, knew ? "right" : "wrong");
  }

  if (!item) {
    return (
      <div className="max-w-measure">
        <Done t={t} outcomes={outcomes} onRestart={build} />
      </div>
    );
  }

  return (
    /*
      Held to a reading measure rather than the page width. A question set in a
      1100px box has its prompt at the far left and its options a hand-span
      away, and the eye has to travel the whole line between asking and
      answering — which is the one journey this page exists to make short.
    */
    <div className="max-w-measure">
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
        {fill(t.progress, { n: String(at + 1), total: String(session.length) })}
      </p>

      {/* Keyed on the item so every answer starts a genuinely new card:
          without it, React keeps the previous question's revealed state and
          the next one arrives already answered. */}
      <Card key={item.id} item={item} t={t} locale={locale} onAnswer={record} onRecall={recordRecall} />
    </div>
  );
}

function Card({
  item,
  t,
  locale,
  onAnswer,
  onRecall,
}: {
  item: PracticeItem;
  t: Dictionary["practice"];
  locale: Locale;
  onAnswer: (id: string, outcome: "right" | "wrong" | "skipped") => void;
  onRecall: (id: string, prompt: string, knew: boolean) => void;
}) {
  /** Which option was chosen, for the objective kinds. */
  const [chose, setChose] = useState<number | null>(null);
  /** Whether the answer is on screen, for the self-marked kinds. */
  const [shown, setShown] = useState(false);

  const ask =
    item.kind === "pair"
      ? item.variety === "target"
        ? t.ask.pairTarget
        : t.ask.pairBridge
      : t.ask[item.kind];

  return (
    <div className="mt-3 rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{ask}</p>

      <Prompt item={item} t={t} shown={shown} />

      {item.kind === "pair" || item.kind === "article" || item.kind === "form" ? (
        <>
          <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {item.options.map((option, index) => (
              <li key={option}>
                {/*
                  Pressing an option MARKS; it does not advance. The learner
                  moves on from the verdict below, once they have read why —
                  advancing on the answer is how a quiz gets through eight
                  questions without anybody learning from the six they missed.
                */}
                <button
                  type="button"
                  disabled={chose !== null}
                  onClick={() => setChose(index)}
                  lang={DISPLAY.tag}
                  className={optionClass(index, chose, item.answer)}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>

          {chose !== null && (
            <Verdict
              right={chose === item.answer}
              t={t}
              item={item}
              locale={locale}
              onNext={() => onAnswer(item.id, chose === item.answer ? "right" : "wrong")}
            />
          )}
        </>
      ) : shown ? (
        <div className="mt-5 border-t border-border-subtle pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onRecallOrSelf(item, true, onAnswer, onRecall)}
              className="min-h-11 rounded-control bg-accent px-4 font-medium text-on-accent hover:opacity-90"
            >
              {t.knew}
            </button>
            <button
              type="button"
              onClick={() => onRecallOrSelf(item, false, onAnswer, onRecall)}
              className="min-h-11 rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-page"
            >
              {t.missed}
            </button>
          </div>
          <Trace item={item} t={t} locale={locale} />
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShown(true)}
            className="min-h-11 rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-page"
          >
            {t.show}
          </button>
          <button
            type="button"
            onClick={() => onAnswer(item.id, "skipped")}
            className="min-h-11 rounded-control px-4 text-sm text-fg-muted hover:text-fg-primary"
          >
            {t.skip}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The question itself, which is a different shape for every kind.
 *
 * The dialect always carries `lang` — a screen reader given Zurich German
 * without it reads it with German phonology, which is the audio equivalent of
 * showing the wrong dialect.
 */
function Prompt({ item, t, shown }: { item: PracticeItem; t: Dictionary["practice"]; shown: boolean }) {
  const big = "mt-2 font-heading text-2xl font-semibold leading-snug tracking-display text-dialect sm:text-3xl";

  if (item.kind === "pair") {
    // The options ARE the question here — nothing to print above them.
    return null;
  }

  if (item.kind === "article") {
    return (
      <>
        <p lang={DISPLAY.tag} className={big}>
          <span aria-hidden="true" className="text-fg-muted">
            ___{" "}
          </span>
          {item.noun}
        </p>
        <p lang="de" className="mt-1 text-base text-fg-secondary">
          {item.bridge}
        </p>
      </>
    );
  }

  if (item.kind === "form") {
    return (
      <>
        <p className={big}>
          <span className="text-fg-primary">{person(t, item.label)} </span>
          <span aria-hidden="true" className="text-fg-muted">
            ___
          </span>
        </p>
        <p className="mt-1 text-base text-fg-secondary">
          <span lang={DISPLAY.tag}>{item.word}</span>
          <span aria-hidden="true"> · </span>
          <span lang="de">{item.bridge}</span>
        </p>
      </>
    );
  }

  if (item.kind === "cloze") {
    return (
      <>
        <p lang={DISPLAY.tag} className={big}>
          {item.prompt}
        </p>
        <p lang="de" className="mt-2 text-base leading-relaxed text-fg-secondary">
          {item.bridge}
        </p>
        {shown && <p className={`${big} text-accent`}>{item.answer}</p>}
      </>
    );
  }

  return (
    <>
      <p lang={DISPLAY.tag} className={big}>
        {item.prompt}
      </p>
      {item.context && (
        <p lang={DISPLAY.tag} className="mt-2 text-sm italic leading-relaxed text-fg-muted">
          «{item.context}»
        </p>
      )}
      {shown && <p className="mt-4 text-lg leading-snug text-fg-primary">{item.answer}</p>}
    </>
  );
}

/**
 * Right or not, and where the claim comes from.
 *
 * The verdict is only ever shown for the objective kinds, which is the whole
 * reason the two markings are separated: this product may tell a learner they
 * are wrong when a fixed rule says so, and may not when the question was about
 * spelling a language with no settled orthography.
 */
function Verdict({
  right,
  t,
  item,
  locale,
  onNext,
}: {
  right: boolean;
  t: Dictionary["practice"];
  item: PracticeItem;
  locale: Locale;
  onNext: () => void;
}) {
  return (
    <div className="mt-5 border-t border-border-subtle pt-4">
      <p className={`text-base font-medium ${right ? "text-accent" : "text-fg-primary"}`}>
        {right ? t.right : t.wrong}
      </p>

      {item.kind === "pair" && item.origin && (
        <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{fill(t.origin, { origin: item.origin })}</p>
      )}

      <Trace item={item} t={t} locale={locale} />

      <button
        type="button"
        onClick={onNext}
        className="mt-4 min-h-11 rounded-control bg-accent px-4 font-medium text-on-accent hover:opacity-90"
      >
        {t.next}
      </button>
    </div>
  );
}

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

function Trace({ item, t, locale }: { item: PracticeItem; t: Dictionary["practice"]; locale: Locale }) {
  if (item.source.kind === "grammar") {
    return (
      <Link
        href={`${href(locale, "grammar")}#${item.source.topic}`}
        className={TRACE_LINK}
      >
        {t.grammarLink}
      </Link>
    );
  }

  if (item.source.kind === "word") {
    return (
      <Link
        href={`${href(locale, "vocabulary")}#${wordSlug(item.source.word)}`}
        className={TRACE_LINK}
      >
        {t.wordLink}
      </Link>
    );
  }

  return null;
}

/**
 * What happened, in three true numbers.
 *
 * No percentage — eight items cannot support one. No streak, no level: §8's
 * rule is that this product measures how much of an unfamiliar Zurich speaker
 * you understand, and a number derived from eight questions it wrote itself is
 * not that, however satisfying it would be to show.
 */
function Done({
  t,
  outcomes,
  onRestart,
}: {
  t: Dictionary["practice"];
  outcomes: { id: string; outcome: string }[];
  onRestart: () => void;
}) {
  const summary = summarise(outcomes);

  return (
    <div className="mt-3 rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
      <p className="font-heading text-2xl font-semibold leading-snug tracking-display text-fg-primary">{t.doneTitle}</p>

      <ul className="mt-4 flex flex-col gap-1 text-base text-fg-secondary">
        <li>
          <span className="font-heading text-lg font-semibold text-fg-primary">{summary.asked}</span> {t.doneAsked}
        </li>
        <li>
          <span className="font-heading text-lg font-semibold text-fg-primary">{summary.right}</span> {t.doneRight}
        </li>
        {summary.again > 0 && (
          <li>
            <span className="font-heading text-lg font-semibold text-fg-primary">{summary.again}</span> {t.doneAgain}
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={onRestart}
        className="mt-5 min-h-11 rounded-control bg-accent px-4 font-medium text-on-accent hover:opacity-90"
      >
        {t.restart}
      </button>

      <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{t.savedHint}</p>
    </div>
  );
}

/** The person label in the reader's language, falling back to the pack's key. */
function person(t: Dictionary["practice"], label: string): string {
  const persons: Record<string, string> = t.persons;
  return persons[label] ?? label;
}

/**
 * The option button's colours, which say three different things.
 *
 * Unanswered, chosen-and-right, chosen-and-wrong — and, once answered, the
 * correct one is marked even if it was not the one pressed. A drill that only
 * says "no" teaches the learner that they were wrong and not what was right.
 */
function optionClass(index: number, chose: number | null, answer: number): string {
  const base =
    "min-h-11 w-full rounded-control border px-4 font-heading text-base font-semibold tracking-display sm:w-auto";

  if (chose === null) {
    return `${base} border-border-strong text-fg-primary hover:bg-surface-page`;
  }
  if (index === answer) return `${base} border-accent bg-accent text-on-accent`;
  if (index === chose) return `${base} border-border-strong text-fg-muted line-through`;
  return `${base} border-border-subtle text-fg-muted`;
}

/** Self-marked kinds: a recall also grades the word, a cloze only records. */
function onRecallOrSelf(
  item: PracticeItem,
  knew: boolean,
  onAnswer: (id: string, outcome: "right" | "wrong" | "skipped") => void,
  onRecall: (id: string, prompt: string, knew: boolean) => void,
): void {
  if (item.kind === "recall") {
    onRecall(item.id, item.prompt, knew);
    return;
  }
  onAnswer(item.id, knew ? "right" : "wrong");
}
