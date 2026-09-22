"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { fill } from "@/lib/i18n/fill";
import { DISPLAY } from "@/lib/variety/display";
import { useBrowserStore, useStoreWriter } from "@/lib/browser/store";
import { recallItems } from "@/lib/domain/practice/generate";
import { inMode, type Mode } from "@/lib/domain/practice/mode";
import { QuestionCard } from "./exercises/question-card";
import { NO_HISTORY, remember } from "@/lib/domain/practice/history";
import { historyStore, modelStore } from "./practice-stores";
import { Trace, answerOf } from "./exercises/chrome";
import { orderSession, requeue, summarise } from "@/lib/domain/practice/session";
import { EMPTY_MODEL, observe } from "@/lib/domain/practice/model";
import type { PracticeItem } from "@/lib/domain/practice/types";
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
  grammarT,
  locale,
  mode,
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
  /** The grammar section's own words, so a verdict can explain rather than link. */
  grammarT: Dictionary["grammar"];
  locale: Locale;
  /**
   * Which answering style this sitting is for.
   *
   * IT REACHES HERE BECAUSE OF THE ONE POOL THE SERVER CANNOT FILTER. The
   * page narrows `packItems` by mode before sending them, but a learner's own
   * kept words never go through the server at all — they are turned into
   * items on this side, from storage. Without this, choosing "tapping" would
   * still deal out reveal-and-self-mark cards from the learner's own words,
   * which is precisely the "I asked for no typing and got a text box"
   * complaint in its other form.
   */
  mode: Mode;
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
    const own = includeSaved ? recallItems(saved.words).filter((item) => inMode(item, mode)) : [];
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
  }, [packItems, saved.words, includeSaved, mode]);

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
      <QuestionCard
        key={item.id}
        item={item}
        t={t}
        grammarT={grammarT}
        locale={locale}
        reveal="now"
        onAnswer={record}
        onRecall={recordRecall}
      />
    </div>
  );
}

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




