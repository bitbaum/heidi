"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { DISPLAY } from "@/lib/variety/display";
import { useBrowserStore, useStoreWriter } from "@/lib/browser/store";
import { recallItems } from "@/lib/domain/practice/generate";
import { NO_HISTORY, remember } from "@/lib/domain/practice/history";
import { historyStore, modelStore } from "./practice-stores";
import { orderSession, requeue, summarise } from "@/lib/domain/practice/session";
import { EMPTY_MODEL, decodeModel, observe } from "@/lib/domain/practice/model";
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
/**
 * Item ids only, and only the recent ones — see `history.ts`. Nothing about
 * how the learner did, which keeps it the same kind of thing as their saved
 * words: theirs, in their browser, and worthless to anybody else.
 */
// Both stores live in `practice-stores.ts`, created once: two modules each
// creating one for the same key get two subscriber lists over one piece of
// storage, and a write through one notifies nobody watching the other.

export function PracticeSession({
  packItems,
  t,
  locale,
  includeSaved = true,
}: {
  /**
   * What the pack can ask, generated on the server — already NARROWED to the
   * scope, if there is one. The filtering happens up there because that is
   * where the items and the URL both are, and because a component that took a
   * scope would have to be told what the scope means.
   */
  packItems: readonly PracticeItem[];
  t: Dictionary["practice"];
  locale: Locale;
  /**
   * Whether the learner's own kept words join this sitting.
   *
   * False for a scoped session. See `scope.ts`: a session opened from one
   * grammar topic that quietly mixed in four unrelated words somebody kept
   * last week is not a session about that topic, it is the general drill
   * wearing the topic's name.
   */
  includeSaved?: boolean;
}) {
  const saved = useSaved();
  const grade = useGrade();

  const [session, setSession] = useState<PracticeItem[] | null>(null);
  const [at, setAt] = useState(0);
  const [outcomes, setOutcomes] = useState<{ id: string; outcome: string }[]>([]);

  /**
   * What this browser has already been asked — STORED, not held in a ref.
   *
   * It was a ref, and that made `session.ts`'s promise of "a different session
   * tomorrow" false: the list died with the page, so every visit re-served the
   * identical eight questions in the identical order. The ordering that
   * delivers variety already existed and was being fed nothing.
   */
  const history = useBrowserStore(historyStore) ?? NO_HISTORY;
  const writeHistory = useStoreWriter(historyStore);

  /**
   * Read once per round rather than subscribed-to while answering.
   *
   * Writing an id mid-session updates the store, which would otherwise rebuild
   * the session under the learner's hands — the same reason the session is
   * state and not a memo.
   */
  const historyAtBuild = useRef(history);

  const writeModel = useStoreWriter(modelStore);

  const build = useCallback(() => {
    historyAtBuild.current = historyStore.read() ?? NO_HISTORY;
    const own = includeSaved ? recallItems(saved.words) : [];
    setSession(
      orderSession({
        // Read at build rather than subscribed to, for the same reason the
        // history is: writing to it mid-session would rebuild the session
        // under the learner's hands, one question at a time.
        model: modelStore.read() ?? EMPTY_MODEL,
        items: [...packItems, ...own],
        // Empty in a scoped sitting, so the due-words-first rule has nothing
        // to promote. Passing the full list while withholding the items would
        // make `orderSession` reserve places for questions that do not exist.
        saved: includeSaved ? saved.words : [],
        now: new Date(),
        seen: historyAtBuild.current,
      }),
    );
    setAt(0);
    setOutcomes([]);
  }, [packItems, saved.words, includeSaved]);

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
  /** Answered earlier in this sitting, and requeued because it was missed. */
  const isRepeat = Boolean(item) && outcomes.some((o) => o.id === item.id);

  function record(id: string, outcome: "right" | "wrong" | "skipped") {
    // Written as it happens rather than at the end, so a session abandoned
    // half way still counts as asked — otherwise leaving after four questions
    // means meeting the same four first thing next time.
    writeHistory.write(remember(historyStore.read() ?? NO_HISTORY, [id]));

    /**
     * And the model hears the FIRST answer only, for the same reason the
     * review schedule does.
     *
     * A question requeued three later because it was missed is being relearned,
     * and getting it right a minute after seeing the answer is not the clean
     * retrieval either mechanism is built on. Counting the second attempt would
     * let a learner talk their weakest topic out of the model by being shown
     * the answer and repeating it back.
     */
    const answered = session?.[at];
    if (answered && !outcomes.some((o) => o.id === id)) {
      writeModel.write(observe(modelStore.read() ?? EMPTY_MODEL, answered, outcome));
    }

    setOutcomes((previous) => [...previous, { id, outcome }]);

    /**
     * A missed item comes back before the sitting ends.
     *
     * Revealing the answer and moving on makes the session a test with
     * feedback and never a second chance to produce the thing — and for the
     * multiple-choice kinds, Butler & Roediger (2008) is the sharper problem:
     * choosing a wrong option can leave the learner holding it. Feedback plus
     * one more attempt is strictly more than feedback. `requeue` decides where;
     * this only decides when. A skip is not a miss, and does not come back:
     * the learner said "not now", which is an answer.
     */
    if (outcome === "wrong") {
      setSession((previous) => {
        if (!previous) return previous;
        const missed = previous[at];
        if (!missed) return previous;
        return [
          ...previous.slice(0, at + 1),
          ...requeue({
            remaining: previous.slice(at + 1),
            item: missed,
            // What has been answered BEFORE this one: `outcomes` has not been
            // updated yet in this pass, which is exactly the list `requeue`
            // wants — an item already in it is on its second attempt.
            asked: outcomes.map((o) => o.id),
          }),
        ];
      });
    }

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
    /**
     * THE SCHEDULE HEARS THE FIRST ANSWER ONLY.
     *
     * A word that came back three questions later because it was missed is
     * being relearned, and getting it right a minute after seeing the answer is
     * not the clean retrieval the spacing schedule is built on. Grading it
     * again would move the word forward a step on the strength of short-term
     * memory, which is precisely the inflation `review.ts` refuses when it
     * sends a missed word back to the start rather than back one step.
     *
     * So the first answer sets the schedule and the second attempt is practice.
     */
    const firstAnswer = !outcomes.some((o) => o.id === id);
    const word = saved.words.find((w) => w.target.trim().toLocaleLowerCase() === prompt.trim().toLocaleLowerCase());
    if (word && firstAnswer) grade(word, knew);
    record(id, knew ? "right" : "wrong");
  }

  if (!item) {
    return (
      <div className="max-w-measure">
        <Done t={t} outcomes={outcomes} session={session} locale={locale} onRestart={build} />
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
        {/* Said, not hidden. A question the learner already answered arriving
            again with no explanation reads as a bug; saying it is the second
            attempt is also the honest reason the total just went up by one. */}
        {isRepeat && <span className="text-accent"> · {t.secondTry}</span>}
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

  const choosing = item.kind === "pair" || item.kind === "article" || item.kind === "form";

  /**
   * THE WHOLE SESSION FROM THE KEYBOARD.
   *
   * Eight questions is about two minutes of work and roughly twenty round
   * trips to the mouse, which is what makes a short drill feel long. A digit
   * picks an option, Enter reveals and then moves on — so the hand never
   * leaves the keys.
   *
   * The digits are PRINTED on the buttons. A shortcut nobody can see is not a
   * feature, it is a thing the person who wrote it enjoys.
   *
   * Nothing is bound that a person could be typing into: this page has no text
   * field, but the chat dock floats above it on every page and taking its
   * digits would be the kind of bug that looks like a broken keyboard.
   */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      /**
       * `instanceof Element` first, and it is not defensive padding.
       *
       * A keydown's target is not always an element — it is the Window when
       * the event is dispatched there directly, and `Window.closest` does not
       * exist. The cast alone typechecked and then threw
       * `target?.closest is not a function` on the first keypress, which took
       * the whole handler down: every key after it did nothing and the page
       * looked frozen rather than broken.
       */
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable=true]")) return;

      /**
       * A grid is neither of the two shapes this handler knows.
       *
       * Without this guard it falls through to the self-marked branch, where
       * Enter means "I knew it" — so a single Enter would answer a matching
       * item nobody had touched, correctly, and move on. The grid has its own
       * buttons and they are already reachable by Tab.
       */
      if (item.kind === "match" || item.kind === "gaptext") return;

      const digit = Number.parseInt(event.key, 10);

      if (choosing) {
        if (chose === null && digit >= 1 && digit <= item.options.length) {
          event.preventDefault();
          setChose(digit - 1);
          return;
        }
        if (chose !== null && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onAnswer(item.id, chose === item.answer ? "right" : "wrong");
        }
        return;
      }

      if (!shown) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setShown(true);
        }
        return;
      }

      // Revealed, and self-marked: 1 knew it, 2 ask again. Enter takes the
      // common case so the rhythm of the objective items carries over.
      if (event.key === "Enter" || digit === 1) {
        event.preventDefault();
        onRecallOrSelf(item, true, onAnswer, onRecall);
      } else if (digit === 2) {
        event.preventDefault();
        onRecallOrSelf(item, false, onAnswer, onRecall);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, chose, shown, choosing, onAnswer, onRecall]);

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

      {item.kind === "match" ? (
        <MatchGrid
          item={item}
          t={t}
          locale={locale}
          onDone={(clean) => onAnswer(item.id, clean ? "right" : "wrong")}
        />
      ) : item.kind === "gaptext" ? (
        <GapText
          item={item}
          t={t}
          locale={locale}
          onDone={(clean) => onAnswer(item.id, clean ? "right" : "wrong")}
        />
      ) : item.kind === "pair" || item.kind === "article" || item.kind === "form" ? (
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
                  className={optionClass(index, chose, item.answer)}
                >
                  {/* The key that picks it. Muted, and gone once answered —
                      at which point it is a label for something you can no
                      longer do. */}
                  {chose === null && (
                    <span aria-hidden="true" className="mr-2 font-mono text-caption font-normal text-fg-muted">
                      {index + 1}
                    </span>
                  )}
                  <span lang={DISPLAY.tag}>{option}</span>
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
 * Four words, four meanings, joined up — the one exercise here that is
 * actually a pleasure to do.
 *
 * WHY IT IS BUILT THIS WAY. §8 refuses streaks, points and levels and that
 * refusal is not being softened here. What makes this satisfying is structural
 * rather than awarded: the board visibly EMPTIES as pairs are solved, each
 * correct answer makes the remaining ones easier, and the whole thing is over
 * in about fifteen seconds. Nobody is told they are on a roll.
 *
 * TWO TAPS, NOT DRAG AND DROP. Dragging is the obvious implementation and it
 * is wrong for this product: it is unusable from a keyboard without a great
 * deal of ARIA that would then have to be maintained, it is fiddly on the
 * phone this is mostly read on, and it fails badly for anyone with a motor
 * impairment. Tap a word, tap its meaning, and both are ordinary buttons.
 *
 * A WRONG PAIR IS NOT PUNISHED, IT IS SHOWN. The two buttons flash and clear,
 * and the grid stays open — `Butler & Roediger (2008)` is the reason the whole
 * session requeues missed items rather than moving on, and a grid that ejected
 * you on the first mistake would be the version that teaches nothing. What the
 * mistake costs is the item's outcome: one wrong pair and the grid is recorded
 * as missed, so it comes back later in the sitting.
 *
 * THE LAST PAIR IS FREE AND IS NOT COUNTED. With four pairs, solving three
 * leaves one, and marking somebody right for a walkover would make the outcome
 * a little bit false. Only the first three decisions can go wrong, which is
 * also why four is the size: it is the smallest grid where the free one is a
 * quarter rather than a half.
 */
function MatchGrid({
  item,
  t,
  locale,
  onDone,
}: {
  item: Extract<PracticeItem, { kind: "match" }>;
  t: Dictionary["practice"];
  locale: Locale;
  onDone: (clean: boolean) => void;
}) {
  /** Index into `targets` that is waiting for a meaning. */
  const [picked, setPicked] = useState<number | null>(null);
  /** Indices into `targets` that are solved. */
  const [solved, setSolved] = useState<number[]>([]);
  /** The bridge index most recently got wrong, for the flash. */
  const [wrong, setWrong] = useState<number | null>(null);
  const [missed, setMissed] = useState(false);

  const done = solved.length === item.targets.length;

  function choose(bridgeIndex: number) {
    if (picked === null || done) return;

    if (item.answer[picked] === bridgeIndex) {
      setSolved((previous) => [...previous, picked]);
      setPicked(null);
      setWrong(null);
      return;
    }

    // Recorded once. A second wrong pair does not make the item more missed
    // than it already is, and a counter here would be a score by another name.
    setMissed(true);
    setWrong(bridgeIndex);
    setPicked(null);
  }

  const solvedBridges = new Set(solved.map((targetIndex) => item.answer[targetIndex]));

  return (
    <div className="mt-5">
      <p className="text-sm leading-relaxed text-fg-secondary">{t.matchHint}</p>

      {/* `grid-cols-safe` at the base per AGENTS.md — two columns of buttons
          whose content is somebody else's words, which is exactly the case
          where an `auto` track takes its min-content from the longest one. */}
      <div className="mt-4 grid grid-cols-safe gap-3 sm:grid-cols-2">
        <ul className="flex flex-col gap-2">
          {item.targets.map((target, index) => {
            const isSolved = solved.includes(index);
            return (
              <li key={target} className="min-w-0">
                <button
                  type="button"
                  disabled={isSolved || done}
                  aria-pressed={picked === index}
                  onClick={() => setPicked(index)}
                  className={matchClass(isSolved, picked === index, false)}
                >
                  <span lang={DISPLAY.tag}>{target}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="flex flex-col gap-2">
          {item.bridges.map((bridge, index) => {
            const isSolved = solvedBridges.has(index);
            return (
              <li key={bridge} className="min-w-0">
                <button
                  type="button"
                  disabled={isSolved || done || picked === null}
                  onClick={() => choose(index)}
                  className={matchClass(isSolved, false, wrong === index)}
                >
                  <span lang="de">{bridge}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {done && (
        <Verdict right={!missed} t={t} item={item} locale={locale} onNext={() => onDone(!missed)} />
      )}
    </div>
  );
}

/**
 * A passage with its words taken out, and the words offered back.
 *
 * THE FIRST EXERCISE HERE THAT ASKS FOR MORE THAN ONE SENTENCE. A handover is
 * four lines that refer to each other, and the word filling a gap is often
 * decidable only from the line before it — which is the actual skill this
 * product exists for and which no single-sentence item can rehearse.
 *
 * TAP A WORD, IT GOES IN THE NEXT EMPTY GAP. The alternative — select a gap,
 * then select a word — is one more decision per placement for no gain, since
 * the gaps are filled in reading order anyway. Tapping a filled gap takes its
 * word back, so a mistake costs one tap and not a restart.
 *
 * NOTHING IS MARKED UNTIL EVERY GAP IS FULL. Checking each placement as it
 * lands would turn the passage into three separate questions and destroy the
 * whole point: the third gap is supposed to be informed by the first two.
 */
function GapText({
  item,
  t,
  locale,
  onDone,
}: {
  item: Extract<PracticeItem, { kind: "gaptext" }>;
  t: Dictionary["practice"];
  locale: Locale;
  onDone: (clean: boolean) => void;
}) {
  /** `filled[gap]` is the index in `bank` placed there, or null. */
  const [filled, setFilled] = useState<(number | null)[]>(() => item.answer.map(() => null));
  const [checked, setChecked] = useState(false);

  const placed = new Set(filled.filter((v): v is number => v !== null));
  const complete = filled.every((v) => v !== null);
  const right = complete && filled.every((v, gap) => v === item.answer[gap]);

  function place(bankIndex: number) {
    if (checked || placed.has(bankIndex)) return;
    const next = filled.indexOf(null);
    if (next === -1) return;
    setFilled((previous) => previous.map((v, i) => (i === next ? bankIndex : v)));
  }

  function clear(gap: number) {
    if (checked) return;
    setFilled((previous) => previous.map((v, i) => (i === gap ? null : v)));
  }

  return (
    <div className="mt-5">
      <p className="text-sm leading-relaxed text-fg-secondary">{t.gapHint}</p>

      <ol className="mt-4 flex flex-col gap-4">
        {item.lines.map((line, index) => {
          const gap = line.gap;
          const chosen = gap === undefined ? null : filled[gap];
          const parts = line.prompt.split("____");

          return (
            <li key={`${index}-${line.prompt}`} className="min-w-0">
              <p lang={DISPLAY.tag} className="wrap-anywhere text-base leading-relaxed text-dialect">
                {gap === undefined ? (
                  line.prompt
                ) : (
                  <>
                    {parts[0]}
                    <button
                      type="button"
                      disabled={checked || chosen === null}
                      onClick={() => clear(gap)}
                      className={gapClass(chosen !== null, checked, checked && chosen === item.answer[gap])}
                    >
                      {chosen === null ? "    " : item.bank[chosen]}
                    </button>
                    {parts[1] ?? ""}
                  </>
                )}
              </p>
              <p lang="de" className="wrap-anywhere text-sm leading-snug text-fg-muted">
                {line.bridge}
              </p>
            </li>
          );
        })}
      </ol>

      {!checked && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {item.bank.map((word, index) => (
            <li key={word}>
              <button
                type="button"
                disabled={placed.has(index)}
                onClick={() => place(index)}
                className={
                  placed.has(index)
                    ? "min-h-11 rounded-control border border-border-subtle px-4 text-base text-fg-muted line-through"
                    : "min-h-11 rounded-control border border-border-strong px-4 text-base text-fg-primary hover:bg-surface-page"
                }
              >
                <span lang={DISPLAY.tag}>{word}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {complete && !checked && (
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="mt-5 min-h-11 rounded-control bg-accent px-5 font-semibold text-on-accent hover:opacity-90"
        >
          {t.check}
        </button>
      )}

      {checked && <Verdict right={right} t={t} item={item} locale={locale} onNext={() => onDone(right)} />}
    </div>
  );
}

/** A gap's states: empty, filled, and — once checked — right or wrong. */
function gapClass(filled: boolean, checked: boolean, correct: boolean): string {
  const base = "mx-1 inline-flex min-h-8 items-baseline rounded-control border px-2 align-baseline";
  if (checked) {
    return correct
      ? `${base} border-accent bg-accent text-on-accent`
      : `${base} border-border-strong text-fg-muted line-through`;
  }
  if (filled) return `${base} border-accent bg-accent-tint text-fg-primary`;
  return `${base} border-dashed border-border-strong`;
}

/**
 * A tile's three states: waiting, picked, solved — plus the flash for a pair
 * that did not go together.
 *
 * Solved tiles stay on screen rather than disappearing. A board that removes
 * what you got right leaves the hardest pairs alone on an empty page, which
 * looks like a punishment; keeping them dimmed shows the work.
 */
function matchClass(solved: boolean, picked: boolean, wrong: boolean): string {
  const base =
    "min-h-11 w-full rounded-control border px-4 text-left text-base transition-colors disabled:cursor-default";

  if (solved) return `${base} border-border-subtle bg-surface-page text-fg-muted line-through`;
  if (wrong) return `${base} border-fg-muted text-fg-muted`;
  if (picked) return `${base} border-accent bg-accent text-on-accent`;
  return `${base} border-border-strong text-fg-primary hover:bg-surface-page`;
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

  // A matching grid and a gapped passage ARE their own prompt — the words are
  // the question. A line of instruction above them would be read once and then
  // be in the way forever.
  if (item.kind === "match" || item.kind === "gaptext") return null;

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

/** The same link in a list, where a 44px block per row would be a wall. */
const TRACE_LINK_COMPACT = "text-sm text-link underline underline-offset-4 hover:text-accent";

function Trace({
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
  session,
  locale,
  onRestart,
}: {
  t: Dictionary["practice"];
  outcomes: { id: string; outcome: string }[];
  /** The items just asked, so the misses can be named rather than counted. */
  session: readonly PracticeItem[];
  locale: Locale;
  onRestart: () => void;
}) {
  const summary = summarise(outcomes);

  /**
   * WHICH ones to come back to, not just how many.
   *
   * "2 kommen nochmals" is true and almost useless: the learner has just been
   * told a number about eight things they can no longer see. Naming them costs
   * two lines and turns the end of a session into somewhere to look, with each
   * one still carrying the link to where its answer is explained.
   *
   * This is not a score creeping back in. A score ranks the person; this is a
   * list of the specific things that went wrong, which is the opposite —
   * §8 objects to measuring consumption and dressing it as learning, not to
   * telling somebody what they missed.
   */
  const missed = outcomes
    .filter((o) => o.outcome === "wrong")
    .map((o) => session.find((item) => item.id === o.id))
    .filter((item): item is PracticeItem => Boolean(item));

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

      {missed.length > 0 && (
        <div className="mt-5 border-t border-border-subtle pt-4">
          <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.againTitle}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {missed.map((item) => (
              <li key={item.id} className="flex flex-wrap items-baseline gap-x-3">
                <span lang={DISPLAY.tag} className="font-heading text-base font-semibold text-dialect">
                  {answerOf(item)}
                </span>
                <Trace item={item} t={t} locale={locale} compact />
              </li>
            ))}
          </ul>
        </div>
      )}

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

/**
 * The right answer, as one printable string, whatever kind of item it was.
 *
 * Used only in the end-of-session list, where the question is gone and the
 * answer is the thing worth carrying away. Every branch returns something the
 * variety actually says — never a paraphrase and never a label — because this
 * line is the last dialect a learner reads before closing the page.
 */
function answerOf(item: PracticeItem): string {
  switch (item.kind) {
    case "pair":
    case "article":
    case "form":
      return item.options[item.answer] ?? "";
    /**
     * A grid's answer is four answers, so it prints as the pairs themselves.
     *
     * The alternative was to print the first one, or a count, and both are the
     * same mistake: the end-of-session list exists so a learner can carry away
     * what they missed, and "1 of 4" is not something anybody can carry.
     */
    case "match":
      return item.targets.map((target, i) => `${target} — ${item.bridges[item.answer[i]] ?? ""}`).join(" · ");
    /**
     * A passage prints as the words that went into it, in gap order.
     *
     * Not the filled-in passage: four lines in the end-of-session list would
     * push everything else off the screen, and what the learner got wrong was
     * a placement, not a sentence.
     */
    case "gaptext":
      return item.answer.map((bankIndex) => item.bank[bankIndex] ?? "").join(" · ");
    default:
      return item.answer;
  }
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
