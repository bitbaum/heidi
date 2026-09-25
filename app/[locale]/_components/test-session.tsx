"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { fill } from "@/lib/i18n/fill";
import { DISPLAY } from "@/lib/variety/display";
import type { PracticeItem } from "@/lib/domain/practice/types";
import { TEST_SIZE, TEST_MINUTES, TEST_EXTEND_MINUTES } from "@/lib/domain/practice/mode";
import { QuestionCard } from "./exercises/question-card";
import { answerOf, explainingTopic, Trace } from "./exercises/chrome";
import { Explanation } from "./exercises/explanation";

/**
 * A run of questions that says nothing until it is over.
 *
 * WHY IT IS A SEPARATE COMPONENT AND NOT A FLAG ON THE DRILL. Because almost
 * nothing about it is the same. The drill requeues what you missed, promotes
 * words that are due, feeds a learner model, and explains each answer before
 * moving on — all of which are the right behaviour for teaching and all of
 * which would corrupt a measurement. A test takes a fixed set, asks it once
 * each in a fixed order, never repeats an item, and reports at the end.
 * Expressing that as `if (flow === "test")` inside the drill would have meant
 * six such branches through one component, which is how the two quietly start
 * behaving like each other.
 *
 * WHAT IT DOES NOT DO, deliberately: no pass mark, no grade, no percentage, no
 * level. §8 refuses a score that looks like a measurement of learning. What it
 * gives back is a COUNT and then the questions themselves, each with what you
 * chose, what the pack says, one line of why, and the way to the page that
 * explains it — because the list is the part anybody actually learns from and
 * the number is just the reason to read it.
 */

type Given = {
  item: PracticeItem;
  outcome: "right" | "wrong" | "skipped";
  chose?: string;
};

export function TestSession({
  items,
  t,
  grammarT,
  situationsT,
  vocabularyT,
  locale,
}: {
  items: readonly PracticeItem[];
  t: Dictionary["practice"];
  grammarT: Dictionary["grammar"];
  situationsT: Dictionary["situations"];
  vocabularyT: Dictionary["vocabulary"];
  locale: Locale;
}) {
  const [run, setRun] = useState<readonly PracticeItem[] | null>(null);
  const [at, setAt] = useState(0);
  const [given, setGiven] = useState<readonly Given[]>([]);

  /**
   * WHEN THE TIME RUNS OUT, not how much is left — and the difference is a bug
   * avoided rather than a preference.
   *
   * Held as a countdown, the remaining milliseconds are both read and written
   * by the interval, so they belong in its dependency array, so the interval
   * is torn down and rebuilt every single second — and drifts, because each
   * rebuild restarts the second. Held as a DEADLINE, the interval only nudges
   * a clock and the remaining time is derived: the effect depends on two
   * stable values, and extending the run is one addition rather than a race
   * with the tick.
   */
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [outOfTime, setOutOfTime] = useState(false);

  const left = deadline === null ? null : Math.max(0, deadline - now);

  const total = Math.min(TEST_SIZE, items.length);

  /**
   * The questions, drawn once and never redrawn.
   *
   * SPREAD ACROSS THE KINDS RATHER THAN SAMPLED, because the pool is not
   * balanced: `pick` and `article` between them outnumber `pair` five to one,
   * so twenty items taken off the top would be a vocabulary test wearing a
   * dialect test's name. Round-robin over the kinds gives every kind a fair
   * share of twenty and is deterministic, which means a test can be reasoned
   * about and reproduced.
   *
   * NOT SHUFFLED RANDOMLY. A random order would make two runs incomparable
   * for no gain — nobody sits the same test twice in a row, and the items
   * already alternate kind by kind, which is the variety that matters.
   */
  const start = useCallback(
    (minutes: number | null) => {
      const byKind = new Map<string, PracticeItem[]>();
      for (const item of items) {
        const list = byKind.get(item.kind) ?? [];
        list.push(item);
        byKind.set(item.kind, list);
      }

      const queues = [...byKind.values()];
      const drawn: PracticeItem[] = [];
      let round = 0;
      while (drawn.length < total && queues.some((q) => q.length > round)) {
        for (const queue of queues) {
          if (drawn.length >= total) break;
          const item = queue[round];
          if (item) drawn.push(item);
        }
        round += 1;
      }

      setRun(drawn);
      setAt(0);
      setGiven([]);
      setOutOfTime(false);
      setNow(Date.now());
      setDeadline(minutes === null ? null : Date.now() + minutes * 60_000);
    },
    [items, total],
  );

  /**
   * The clock, ticking once a second.
   *
   * IT ENDS THE RUN AND MARKS NOTHING. Reaching zero stops further questions
   * being offered and shows the answers to what was already done — the
   * unanswered ones are listed as unanswered rather than counted wrong. A
   * clock that turned silence into failure would be punishing somebody for
   * choosing to put a clock on it, which is an odd way to thank them.
   */
  useEffect(() => {
    if (deadline === null || outOfTime) return;
    const tick = window.setInterval(() => {
      const at = Date.now();
      setNow(at);
      if (at >= deadline) setOutOfTime(true);
    }, 1000);
    return () => window.clearInterval(tick);
  }, [deadline, outOfTime]);

  const done = run !== null && (outOfTime || at >= run.length);

  function record(id: string, outcome: "right" | "wrong" | "skipped", chose?: string) {
    const item = run?.[at];
    if (!item || item.id !== id) return;
    setGiven((g) => [...g, { item, outcome, chose }]);
    setAt((n) => n + 1);
  }

  if (run === null) {
    return <Before total={total} t={t} onStart={start} />;
  }

  if (done) {
    return (
      <Results
        given={given}
        t={t}
        grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT}
        locale={locale}
        outOfTime={outOfTime}
        onAgain={() => setRun(null)}
      />
    );
  }

  const item = run[at];
  if (!item) return null;

  return (
    <section aria-live="off">
      {/*
        THE ONLY TWO THINGS ON THE SCREEN BESIDES THE QUESTION: where you are,
        and how long is left. No running score, and that is the point — a
        counter saying "4 right" is feedback after each item wearing a
        different hat, and it would change what the next item measures.
      */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
          {fill(t.testProgress, { n: String(at + 1), total: String(run.length) })}
        </p>
        {left !== null && (
          <div className="flex items-center gap-3">
            <p className="font-mono text-caption uppercase tracking-caps text-fg-secondary">
              {fill(t.testTimerLeft, { time: clock(left) })}
            </p>
            <button
              type="button"
              onClick={() => setDeadline((at) => (at ?? Date.now()) + TEST_EXTEND_MINUTES * 60_000)}
              className="min-h-11 rounded-control border border-border-strong px-3 text-sm text-fg-primary hover:bg-surface-raised"
            >
              {fill(t.testTimerAdd, { n: String(TEST_EXTEND_MINUTES) })}
            </button>
          </div>
        )}
      </div>

      {/* A thin bar, because twenty is long enough that a number alone does
          not tell you whether to keep going. No colour: it reports position,
          not performance. */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border-subtle">
        <div
          className="h-full bg-fg-muted transition-[width] duration-200"
          style={{ width: `${Math.round((at / run.length) * 100)}%` }}
        />
      </div>

      <QuestionCard
        key={item.id}
        item={item}
        t={t}
        grammarT={grammarT} situationsT={situationsT} vocabularyT={vocabularyT}
        locale={locale}
        reveal="later"
        onAnswer={record}
        onRecall={() => {
          /* A test contains no card and no kept word — see `mode.ts`. */
        }}
      />

      <button
        type="button"
        onClick={() => record(item.id, "skipped")}
        className="mt-4 min-h-11 rounded-control px-4 text-sm text-fg-muted hover:text-fg-primary"
      >
        {t.skip}
      </button>
    </section>
  );
}

/** mm:ss, with the seconds padded. Nothing clever; a clock people can read. */
function clock(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Before it starts: what is coming, and whether to put a clock on it.
 *
 * THE CLOCK IS A CHOICE AND ITS DEFAULT IS OFF. A timer makes a test feel like
 * a test, which some people want and some people freeze under, and this
 * product has no business deciding which of those a given person is. "No
 * clock" is listed first and is the plainest button, so the default is the one
 * that asks least of anybody.
 */
function Before({ total, t, onStart }: { total: number; t: Dictionary["practice"]; onStart: (m: number | null) => void }) {
  return (
    <section>
      <p className="max-w-measure text-base leading-relaxed text-fg-secondary">
        {fill(t.testLead, { total: String(total) })}
      </p>

      <p className="mt-6 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.testTimerLabel}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onStart(null)}
          className="min-h-11 rounded-control bg-action px-4 font-medium text-on-action hover:opacity-90"
        >
          {t.testTimerOff}
        </button>
        {TEST_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => onStart(minutes)}
            className="min-h-11 rounded-control border border-border-strong px-4 font-medium text-fg-primary hover:bg-surface-raised"
          >
            {fill(t.testTimerSet, { n: String(minutes) })}
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * Afterwards: the count, then every question again.
 *
 * THE LIST IS THE PRODUCT AND THE NUMBER IS THE HEADLINE. A test that reports
 * "13 of 20" and stops has told somebody they have a problem and not what it
 * is; this is the only screen in the product where a learner is looking at
 * seven specific mistakes at once and is motivated to read about them. So each
 * row carries what they chose, what the pack says, the topic's own rule line,
 * and the link to the page — the same explanation the drill gives after one
 * question, given for all of them at once.
 *
 * WRONG ONES FIRST. Not the order they were asked: nobody scrolls past
 * thirteen correct answers to reach the four that matter.
 */
function Results({
  given,
  t,
  grammarT,
  situationsT,
  vocabularyT,
  locale,
  outOfTime,
  onAgain,
}: {
  given: readonly Given[];
  t: Dictionary["practice"];
  grammarT: Dictionary["grammar"];
  situationsT: Dictionary["situations"];
  vocabularyT: Dictionary["vocabulary"];
  locale: Locale;
  outOfTime: boolean;
  onAgain: () => void;
}) {
  const right = given.filter((g) => g.outcome === "right").length;

  const ordered = useMemo(
    () => [...given].sort((a, b) => rank(a.outcome) - rank(b.outcome)),
    [given],
  );

  return (
    <section>
      <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
        {t.testResultsTitle}
      </h2>

      {outOfTime && <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{t.testTimeUp}</p>}

      <p className="mt-3 text-lead text-fg-primary">
        {fill(t.testResultsCount, { right: String(right), asked: String(given.length) })}
      </p>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.testResultsLead}</p>

      <ul className="mt-8 flex flex-col gap-6">
        {ordered.map(({ item, outcome, chose }) => {
          const topicId = explainingTopic(item);
          const topic = topicId ? grammarT.topics[topicId as keyof typeof grammarT.topics] : undefined;

          return (
            <li
              key={item.id}
              className={`border-l-2 pl-4 ${outcome === "right" ? "border-border-subtle" : "border-accent"}`}
            >
              <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                {outcome === "right" ? t.right : outcome === "skipped" ? t.testUnanswered : t.wrong}
              </p>

              {/* What they chose, only when it was not the answer. Printing
                  "you chose X, the answer is X" on a correct row is noise on
                  the rows nobody needs to read. */}
              {outcome === "wrong" && chose && (
                <p className="mt-1 text-base text-fg-secondary">
                  <span className="text-fg-muted">{t.testYourAnswer}: </span>
                  <span lang={DISPLAY.tag} className="line-through">
                    {chose}
                  </span>
                </p>
              )}

              <p className="mt-1 text-base text-fg-primary">
                <span className="text-fg-muted">{t.testCorrectAnswer}: </span>
                <span lang={DISPLAY.tag} className="font-heading font-semibold tracking-display">
                  {answerOf(item)}
                </span>
              </p>

              {topic && (
                <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">
                  <span className="text-fg-muted">{topic.title} — </span>
                  {topic.rule}
                </p>
              )}

              <Trace item={item} t={t} locale={locale} compact />
              {/* The full explanation, folded: this list can be twenty rows,
                  and the rule line above is the summary. The page promises
                  "alle Antworten mit Erklärung"; a link was not that. */}
              <Explanation
                item={item}
                locale={locale}
                t={t}
                grammarT={grammarT}
                situationsT={situationsT}
                vocabularyT={vocabularyT}
                compact
              />
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onAgain}
        className="mt-10 min-h-11 rounded-control bg-action px-4 font-medium text-on-action hover:opacity-90"
      >
        {t.testAgain}
      </button>
    </section>
  );
}

/** Wrong first, then unanswered, then right. See `Results`. */
function rank(outcome: Given["outcome"]): number {
  return outcome === "wrong" ? 0 : outcome === "skipped" ? 1 : 2;
}
