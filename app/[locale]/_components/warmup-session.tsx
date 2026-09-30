"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { fill } from "@/lib/i18n/fill";
import { href } from "@/lib/i18n/routes";
import { useBrowserStore, useStorageReady, useStoreWriter } from "@/lib/browser/store";
import type { PracticeItem } from "@/lib/domain/practice/types";
import { EMPTY_MODEL, observe } from "@/lib/domain/practice/model";
import { NO_HISTORY, remember } from "@/lib/domain/practice/history";
import { OPENER } from "@/lib/domain/warmup/ladder";
import { LENGTH, nextQuestion, portrait, sceneLookup, type WarmupAnswer, type WarmupRecord } from "@/lib/domain/warmup/run";
import { QuestionCard } from "./exercises/question-card";
import { historyStore, modelStore } from "./practice-stores";
import { recordPractice } from "./streak-store";
import { warmupStore } from "./warmup-store";
import { LanguageLink } from "./language-link";
import { SessionFrame } from "./session/frame";
import { Actions, PRIMARY } from "./exercises/actions";

/**
 * The warm-up, start to portrait. The rules live in `lib/domain/warmup/run.ts`;
 * this only asks, records and shows.
 *
 * Every answer is also practice: it goes into the learner model and the
 * seen-questions history exactly as a drill answer would, so the first real
 * session starts where the warm-up found the gaps instead of from zero.
 *
 * TWO PLACES. On `/warmup` (`surface: "page"`) it is the invitation or, once
 * done, the result — and the button opens the session screen. The eight lines
 * themselves are asked on `/warmup/session` (`surface: "session"`), full
 * screen like every other exercise, and the result closes the run there.
 */
export function WarmupSession({
  items,
  t,
  practiceT,
  grammarT,
  situationsT,
  vocabularyT,
  learnT,
  sessionT,
  locale,
  surface,
  sessionHref,
  closeHref,
}: {
  items: readonly PracticeItem[];
  t: Dictionary["warmup"];
  practiceT: Dictionary["practice"];
  grammarT: Dictionary["grammar"];
  situationsT: Dictionary["situations"];
  vocabularyT: Dictionary["vocabulary"];
  learnT: Dictionary["chat"]["learn"];
  sessionT: Dictionary["session"];
  locale: Locale;
  surface: "page" | "session";
  /** The session screen, for the page's buttons. */
  sessionHref: string;
  /** Where the session screen closes to. */
  closeHref: string;
}) {
  const ready = useStorageReady();
  const record = useBrowserStore(warmupStore);
  const writeRecord = useStoreWriter(warmupStore);
  const writeModel = useStoreWriter(modelStore);
  const writeHistory = useStoreWriter(historyStore);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const sceneOf = useMemo(() => sceneLookup(items), [items]);

  /**
   * Null when not running. The session screen opens running: it was opened
   * to play, and the first line is always the same opener, so the server and
   * the browser agree on it.
   */
  const [answers, setAnswers] = useState<WarmupAnswer[] | null>(surface === "session" ? [] : null);
  const [current, setCurrent] = useState<string | null>(surface === "session" ? OPENER : null);
  /** The result shown on the session screen is this run's, never an older one. */
  const [finishedHere, setFinishedHere] = useState(false);

  function start() {
    setAnswers([]);
    setCurrent(nextQuestion([], sceneOf));
    setFinishedHere(false);
  }

  function answer(id: string, outcome: "right" | "wrong" | "skipped") {
    const item = byId.get(id);
    if (!item || !answers) return;
    writeHistory.write(remember(historyStore.read() ?? NO_HISTORY, [id]));
    writeModel.write(observe(modelStore.read() ?? EMPTY_MODEL, item, outcome));

    const next = [...answers, { id, right: outcome === "right" }];
    const following = nextQuestion(next, sceneOf);
    if (following) {
      setAnswers(next);
      setCurrent(following);
      return;
    }
    // The dialect answer survives a second run: somebody who said no once
    // should not be asked again just for playing twice.
    writeRecord.write({
      at: new Date().toISOString(),
      answers: next,
      ...(record?.dialect ? { dialect: record.dialect } : {}),
    });
    recordPractice();
    setAnswers(null);
    setCurrent(null);
    setFinishedHere(true);
  }

  const result = record ? (
    <Result
      record={record}
      sceneOf={sceneOf}
      t={t}
      situationsT={situationsT}
      locale={locale}
      again={surface === "session" ? { onClick: start } : { href: sessionHref }}
      onDecline={() => writeRecord.write({ ...record, dialect: "declined" })}
      onAccept={() => writeRecord.write({ ...record, dialect: "accepted" })}
    />
  ) : null;

  if (surface === "page") {
    // Nothing until storage is readable, so a returning visitor does not see
    // the intro flash before their result.
    if (!ready) return <div className="min-h-64" aria-hidden="true" />;
    return (
      result ?? (
        <div className="max-w-measure rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
          <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.facts}</p>
          <Link
            href={sessionHref}
            className="mt-4 inline-flex min-h-12 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
          >
            {t.start} →
          </Link>
        </div>
      )
    );
  }

  const item = current ? byId.get(current) : undefined;
  const n = (answers?.length ?? 0) + 1;
  const progress = n > LENGTH ? t.bonus : fill(t.progress, { n: String(n), total: String(LENGTH) });

  if (answers && item) {
    return (
      <SessionFrame
        t={sessionT}
        closeHref={closeHref}
        progress={{ at: Math.min(answers.length, LENGTH - 1), total: LENGTH, label: progress }}
        scrollKey={item.id}
      >
        {/* The bar above counts to eight; the bonus line is the one it cannot say. */}
        {n > LENGTH && <p className="mb-3 font-mono text-caption uppercase tracking-caps text-fg-muted">{progress}</p>}
        <QuestionCard
          key={item.id}
          item={item}
          t={practiceT}
          grammarT={grammarT}
          situationsT={situationsT}
          vocabularyT={vocabularyT}
          learnT={learnT}
          locale={locale}
          reveal="now"
          onAnswer={answer}
          onRecall={() => {}}
        />
      </SessionFrame>
    );
  }

  return (
    <SessionFrame t={sessionT} closeHref={closeHref} scrollKey="result">
      {finishedHere && result}
      {finishedHere && result && (
        <Actions>
          <Link href={closeHref} replace className={`${PRIMARY} inline-flex items-center justify-center`}>
            {sessionT.finish}
          </Link>
        </Actions>
      )}
    </SessionFrame>
  );
}

function Result({
  record,
  sceneOf,
  t,
  situationsT,
  locale,
  again,
  onDecline,
  onAccept,
}: {
  record: WarmupRecord;
  sceneOf: ReturnType<typeof sceneLookup>;
  t: Dictionary["warmup"];
  situationsT: Dictionary["situations"];
  locale: Locale;
  /** Another round: in place on the session screen, or a link to it from the page. */
  again: { onClick: () => void } | { href: string };
  onDecline: () => void;
  onAccept: () => void;
}) {
  const p = portrait(record.answers, sceneOf);
  const title = (scene: string) => situationsT.scenes[scene as keyof typeof situationsT.scenes]?.title ?? scene;
  const offerDialect = p.readsDialect && locale !== "gsw" && !record.dialect;

  return (
    <div className="max-w-measure">
      <div className="rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
        <h2 className="font-heading text-2xl font-semibold leading-snug tracking-display text-fg-primary">{t.resultTitle}</h2>

        {p.followed.length > 0 ? (
          <>
            <p className="mt-4 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.followedTitle}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {p.followed.map((scene) => (
                <li key={scene}>
                  <Link
                    href={`${href(locale, "situations")}/${scene}`}
                    className="inline-flex min-h-11 items-center rounded-control border border-border-subtle px-3 text-sm text-fg-primary hover:border-border-strong"
                  >
                    ✓ {title(scene)}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-base leading-relaxed text-fg-secondary">{t.followedNone}</p>
        )}
        {p.betweenTheLines && <p className="mt-4 text-base leading-relaxed text-fg-secondary">{t.betweenTheLines}</p>}
      </div>

      {offerDialect && (
        <div className="mt-4 rounded-control border border-accent bg-surface-raised p-5 sm:p-6">
          <p className="font-heading text-xl font-semibold tracking-display text-fg-primary">{t.dialectTitle}</p>
          <p className="mt-2 text-base leading-relaxed text-fg-secondary">{t.dialectBody}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <LanguageLink
              language="gsw"
              href={href("gsw", "warmup")}
              hrefLang="gsw"
              onClick={onAccept}
              className="inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90"
            >
              {t.dialectYes}
            </LanguageLink>
            <button
              type="button"
              onClick={onDecline}
              className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-5 text-fg-primary hover:bg-surface-page"
            >
              {t.dialectNo}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-control border border-border-subtle p-5 sm:p-6">
        {p.startAt ? (
          <>
            <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.startTitle}</p>
            <p className="mt-1 font-heading text-xl font-semibold tracking-display text-fg-primary">{title(p.startAt)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`${href(locale, "practice")}?scene=${encodeURIComponent(p.startAt)}`}
                className="inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90"
              >
                {t.startPractice} →
              </Link>
              <Link
                href={`${href(locale, "situations")}/${p.startAt}`}
                className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-5 text-fg-primary hover:bg-surface-raised"
              >
                {t.startScene}
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="font-heading text-xl font-semibold tracking-display text-fg-primary">{t.noMissTitle}</p>
            <p className="mt-2 text-base leading-relaxed text-fg-secondary">{t.noMissBody}</p>
            <Link
              href={href(locale, "practice")}
              className="mt-4 inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action hover:opacity-90"
            >
              {t.practiceAll} →
            </Link>
          </>
        )}
      </div>

      {"href" in again ? (
        <Link href={again.href} className={AGAIN}>
          {t.again}
        </Link>
      ) : (
        <button type="button" onClick={again.onClick} className={AGAIN}>
          {t.again}
        </button>
      )}
    </div>
  );
}

const AGAIN = "mt-4 inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent";
