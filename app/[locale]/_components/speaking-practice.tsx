"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { deliveryNotes, recordingNotes, type Note } from "@/lib/domain/speaking/feedback";
import { usable, type Delivery } from "@/lib/domain/speaking/delivery";
import { MAX_SAID_LENGTH, type Take } from "@/lib/domain/speaking/take";
import { NOTE_WORDING, type PlainNoteId } from "@/lib/i18n/speaking-notes";
import { useClientValue } from "@/lib/browser/store";
import { progressFrom, spokenMinutes } from "@/lib/domain/speaking/progress";
import { useTakes } from "./use-takes";
import { useRecorder, recordingSupported } from "./use-recorder";
import { useByok } from "./use-byok";

type T = Dictionary["speaking"];

/**
 * Record yourself, and be told what is actually knowable about it.
 *
 * The half that needs nobody else. It works signed out, alone, on a phone,
 * with an empty calendar above it — which is what makes the page useful on the
 * day before its first round exists.
 *
 * The shape of the screen is the shape of the honesty:
 *
 *   1. MEASURED — durations and counts, from the signal. No score. §8.
 *   2. WRITTEN — the learner types what they said, because no system
 *      transcribes this dialect and one that pretended to would be wrong in
 *      exactly the way they could not detect. §7.
 *   3. CHECKED — the deterministic gate on their own words, then one model
 *      suggestion on top. §6.
 *
 * Nothing in step 1 waits on the network, so the measurement is there before
 * any of it, and a failed model call costs nothing that was already earned.
 */
export function SpeakingPractice({
  t,
  locale,
  about,
  roundId,
  topicId,
}: {
  t: T;
  locale: Locale;
  /** What this take is practice FOR, when it is for something. */
  about?: string;
  roundId?: string | null;
  topicId?: string | null;
}) {
  const recorder = useRecorder();
  const { takes, ready, keep, forget, before } = useTakes();
  const byok = useByok();

  const [said, setSaid] = useState("");
  const [asking, setAsking] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  /** What the deterministic gate found, computed server-side. See `ask`. */
  const [language, setLanguage] = useState<Note[]>([]);
  const [askedOnce, setAskedOnce] = useState(false);

  const takeId = recorder.takeId;
  const previous = takeId ? before(takeId) : undefined;

  /**
   * The half that needs no pack, no model and no network.
   *
   * `feedbackFor` composes all three sources and takes a pack, which a
   * component may not import — the pack carries English prose that must never
   * reach a reader in another language, and `lib/variety/display.test.ts`
   * fails the build over it. So the page assembles the two pure halves here
   * and the gate half arrives from the route, already reduced to ids.
   */
  const feedback = useMemo(() => {
    if (!recorder.delivery) return null;
    return {
      recording: recordingNotes(recorder.delivery),
      delivery: deliveryNotes(recorder.delivery, previous?.delivery),
    };
  }, [recorder.delivery, previous]);

  /** Read back out of the store, so the effect below needs no state of its own. */
  const kept = takeId !== null && takes.some((take) => take.id === takeId);

  /**
   * Keep the take as soon as it is measured, before a word is written.
   *
   * The comparison with last time is the reason: a learner who records, reads
   * the numbers and closes the tab has still produced the datum that makes
   * tomorrow's take mean something. Waiting for them to finish the whole
   * exercise would throw most of those away.
   *
   * An effect, because writing to storage mid-render re-enters React from
   * inside its own render. It sets no React state at all — the id comes from
   * the recorder and "have I kept this one" is read back out of the store —
   * so there is no cascading render to guard against. `said` and the
   * suggestion are cleared in the handler that starts a new take instead,
   * which is also when a person expects the previous one to go.
   */
  useEffect(() => {
    if (recorder.state !== "done" || !recorder.delivery || !takeId || kept) return;
    keep({
      id: takeId,
      at: new Date().toISOString(),
      delivery: recorder.delivery,
      said: "",
      roundId: roundId ?? null,
      topicId: topicId ?? null,
      ...(about ? { about } : {}),
    });
  }, [recorder.state, recorder.delivery, takeId, kept, keep, roundId, topicId, about]);

  const saveSaid = useCallback(
    (text: string) => {
      setSaid(text);
      if (!takeId || !recorder.delivery) return;
      keep({
        id: takeId,
        at: new Date().toISOString(),
        delivery: recorder.delivery,
        said: text.slice(0, MAX_SAID_LENGTH),
        roundId: roundId ?? null,
        topicId: topicId ?? null,
        ...(about ? { about } : {}),
      });
    },
    [takeId, recorder.delivery, keep, roundId, topicId, about],
  );

  const ask = useCallback(async () => {
    const text = said.trim();
    if (!text || asking) return;
    setAsking(true);
    setAskedOnce(true);
    try {
      const res = await fetch("/api/speaking/take", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ said: text, locale, byok: byok.config }),
      });
      const data = (await res.json()) as { language?: Note[]; suggestion?: Suggestion | null };
      setLanguage(Array.isArray(data.language) ? data.language : []);
      setSuggestion(data.suggestion ?? null);
    } catch {
      // The measurements are already on screen and were computed on this
      // device. One missing opinion is not a failure of the exercise.
      setSuggestion(null);
    } finally {
      setAsking(false);
    }
  }, [said, asking, locale, byok.config]);

  /**
   * Start a take, clearing whatever the last one left on screen.
   *
   * One press, not two: "Again" used to reset to idle and wait for a second
   * press on the same button, which reads as the button having failed. The
   * previous take is already kept by the time this runs, so nothing is lost by
   * clearing the text here.
   */
  const beginTake = useCallback(() => {
    setSaid("");
    setSuggestion(null);
    setLanguage([]);
    setAskedOnce(false);
    void recorder.start();
  }, [recorder]);

  /**
   * Can this browser record?
   *
   * `recordingSupported()` reads `window`, so calling it directly makes this a
   * server/client branch: the server renders the button disabled with "this
   * browser cannot record" underneath, the client renders it enabled, and
   * React throws the server HTML away with a hydration error. Measured on the
   * real page before this was wrapped.
   *
   * `useClientValue` is the house answer, already used by `useStorageReady`.
   * The server value is `true` — optimistic on purpose, because assuming
   * support and withdrawing it on a browser that lacks it shows the working
   * control to everybody who has one, while assuming the opposite would flash
   * a refusal at every visitor for one frame.
   */
  const supported = useClientValue(recordingSupported, true);

  return (
    <section aria-labelledby="practice-heading" className="mt-10">
      <h2
        id="practice-heading"
        className="font-heading text-section leading-tight tracking-display text-fg-primary"
      >
        {t.practiceTitle}
      </h2>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.practiceLead}</p>
      {about && <p className="mt-2 font-mono text-caption uppercase tracking-caps text-fg-muted">{about}</p>}

      <div className="mt-5 rounded-control border border-border-subtle bg-surface-raised p-4 sm:p-6">
        {/* The control. One big target, centred, reachable with a thumb. */}
        <div className="flex flex-col items-center gap-4">
          {recorder.state !== "recording" && (
            <button
              type="button"
              onClick={beginTake}
              disabled={!supported || recorder.state === "asking" || recorder.state === "measuring"}
              className="flex min-h-20 min-w-20 items-center justify-center rounded-full bg-accent px-6 text-base font-semibold text-on-accent transition-opacity disabled:opacity-50"
            >
              {recorder.state === "measuring"
                ? "…"
                : recorder.state === "done" || recorder.state === "error"
                  ? t.again
                  : t.record}
            </button>
          )}

          {recorder.state === "recording" && (
            <>
              {/* The level is the point of this element: a dead microphone has
                  to be visible in the first second, not after the take. */}
              <div
                aria-hidden="true"
                className="flex min-h-20 min-w-20 items-center justify-center rounded-full border-2 border-accent"
                style={{ transform: `scale(${1 + recorder.level * 0.25})`, transition: "transform 80ms linear" }}
              >
                <span className="h-3 w-3 rounded-full bg-accent" />
              </div>
              <p className="font-mono text-sm text-fg-muted" aria-live="polite">
                {t.recordingNow} · {Math.floor(recorder.elapsedMs / 1000)}
                {t.seconds}
              </p>
              <button
                type="button"
                onClick={recorder.stop}
                className="min-h-12 rounded-control border border-border-strong px-6 text-base font-semibold text-fg-primary"
              >
                {t.stop}
              </button>
            </>
          )}

          {!supported && <p className="text-center text-sm text-fg-muted">{t.micUnsupported}</p>}
          {recorder.error === "denied" && <p className="text-center text-sm text-accent">{t.micDenied}</p>}
          {recorder.error === "unsupported" && <p className="text-center text-sm text-accent">{t.micUnsupported}</p>}
          {recorder.error === "failed" && <p className="text-center text-sm text-accent">{t.failed}</p>}
        </div>

        {recorder.delivery && <Measured t={t} delivery={recorder.delivery} />}

        {feedback && (feedback.recording.length > 0 || feedback.delivery.length > 0) && (
          <ul className="mt-5 grid gap-2">
            {[...feedback.recording, ...feedback.delivery].map((note, i) => (
              <li key={`${note.id}-${i}`} className="text-sm leading-relaxed text-fg-secondary">
                {renderNote(t, note)}
              </li>
            ))}
          </ul>
        )}

        {/* Step 2: the learner transcribes. Only once there is something to
            transcribe, and only when the recording was worth keeping. */}
        {recorder.delivery && usable(recorder.delivery) && (
          <div className="mt-6 border-t border-border-subtle pt-5">
            <label htmlFor="said" className="block font-heading text-lg leading-tight text-fg-primary">
              {t.saidTitle}
            </label>
            {/* READ FROM THE PACK, not assumed. `saidWhy` explains that
                nothing transcribes this variety reliably, which is true of
                Zurich German and false of Ukrainian — printing it on a pack
                that HAS usable ASR would be the engine asserting a fact about
                a language it is not teaching. §4's rule, applied to a
                sentence rather than to a surface. */}
            {!DISPLAY.capabilities.asr && (
              <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.saidWhy}</p>
            )}
            <textarea
              id="said"
              value={said}
              onChange={(event) => saveSaid(event.target.value.slice(0, MAX_SAID_LENGTH))}
              rows={3}
              placeholder={t.saidPlaceholder}
              className="mt-3 w-full rounded-control border border-border-subtle bg-surface-page p-3 text-base text-fg-primary"
            />

            {language.length > 0 && (
              <ul className="mt-4 grid gap-2">
                {language.map((note, i) => (
                  <li key={`${note.id}-${i}`} className="text-sm leading-relaxed text-fg-secondary">
                    {renderNote(t, note)}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => void ask()}
              disabled={!said.trim() || asking}
              className="mt-4 min-h-12 rounded-control border border-border-strong px-5 text-base font-semibold text-fg-primary disabled:opacity-50"
            >
              {asking ? t.checking : t.saidCheck}
            </button>

            {suggestion && (
              <div className="mt-4 rounded-control border border-border-subtle bg-surface-page p-3">
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.suggestionTitle}</p>
                <p className="mt-2 text-base leading-relaxed text-fg-primary">{suggestion.better}</p>
                {suggestion.why && <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{suggestion.why}</p>}
                {suggestion.flagged && suggestion.flagged.length > 0 && (
                  <p className="mt-2 text-sm leading-relaxed text-accent">{t.flaggedSuggestion}</p>
                )}
              </div>
            )}
            {askedOnce && !asking && !suggestion && (
              <p className="mt-3 text-sm text-fg-muted">{t.noSuggestion}</p>
            )}
          </div>
        )}

        <p className="mt-6 border-t border-border-subtle pt-4 text-sm leading-relaxed text-fg-muted">{t.noScore}</p>
      </div>

      <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">{t.privacy}</p>

      {ready && takes.length > 0 && <ProgressStrip t={t} takes={takes} />}
      {ready && takes.length > 0 && <History t={t} takes={takes} forget={forget} />}
    </section>
  );
}

type Suggestion = { better: string; why?: string; flagged?: unknown[] };

/** The numbers, plainly. Four of them, because a wall of figures is a report. */
function Measured({ t, delivery }: { t: T; delivery: Delivery }) {
  if (!usable(delivery)) return null;
  const s = (ms: number) => `${Math.round(ms / 100) / 10}${t.seconds}`;
  return (
    <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle sm:grid-cols-4">
      <Figure label={t.spokeFor} value={s(delivery.speechMs)} />
      <Figure label={t.pauseLabel} value={String(delivery.pauseCount)} />
      <Figure label={t.longestLabel} value={s(delivery.longestPauseMs)} />
      <Figure label={t.runLabel} value={s(delivery.meanRunMs)} />
    </dl>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-page px-3 py-3">
      <dt className="font-mono text-caption uppercase tracking-caps text-fg-muted">{label}</dt>
      <dd className="mt-1 font-heading text-xl leading-none tracking-display text-fg-primary">{value}</dd>
    </div>
  );
}

/**
 * What this person has actually done, from their own takes.
 *
 * THE COUNT IS NOT A STREAK, and `lib/domain/speaking/progress.ts` is where
 * that distinction is argued rather than asserted. The short version: nothing
 * here resets, so there is no chain to break and a fortnight away costs
 * nothing — which is the property that separates a measurement from a
 * retention mechanic.
 *
 * Rendered only after storage is ready, because the zone comes from the
 * browser and the count is computed from device-local takes: a server pass
 * would have neither, and would render a confident zero.
 */
function ProgressStrip({ t, takes }: { t: T; takes: Take[] }) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const progress = progressFrom(takes, zone);
  const minutes = spokenMinutes(progress);

  return (
    <div className="mt-8">
      {/* The same grid as the per-take figures above, on purpose: these are
          the same kind of thing — counted facts about recordings — and giving
          them a louder treatment would be the visual version of the claim
          `progress.ts` refuses to make. */}
      {/* Three columns at every width, unlike the four-figure grid above: three
          items in a two-column grid leaves a dead cell, and these three
          numbers are short enough to sit side by side on a phone. */}
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle">
        <Figure label={t.progressDays} value={String(progress.daysSpoken)} />
        <Figure label={t.progressTakes} value={String(progress.takes)} />
        {/* Seconds below a minute: "1 min" over a first thirty-second take is
            a small lie in the one number somebody might repeat out loud. */}
        <Figure
          label={t.progressSpoken}
          value={
            minutes > 0
              ? `${minutes} ${t.progressMinutes}`
              : `${Math.round(progress.spokenMs / 1000)} ${t.progressSeconds}`
          }
        />
      </dl>
      <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">{t.progressNote}</p>
    </div>
  );
}

function History({ t, takes, forget }: { t: T; takes: Take[]; forget: (id: string) => void }) {
  return (
    <div className="mt-8">
      <h3 className="font-heading text-lg leading-tight text-fg-primary">{t.historyTitle}</h3>
      <ul className="mt-3 grid gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle">
        {takes.slice(0, 10).map((take) => (
          <li key={take.id} className="flex items-center justify-between gap-3 bg-surface-page px-3 py-3">
            <span className="min-w-0">
              <span className="block truncate text-sm text-fg-primary">
                {take.said || take.about || t.historyEmpty}
              </span>
              <span className="mt-0.5 block font-mono text-caption uppercase tracking-caps text-fg-muted">
                {Math.round(take.delivery.speechMs / 1000)}
                {t.seconds} · {take.delivery.pauseCount} {t.pauseLabel}
              </span>
            </span>
            <button
              type="button"
              onClick={() => forget(take.id)}
              className="min-h-10 shrink-0 px-2 font-mono text-caption uppercase tracking-caps text-fg-muted"
            >
              {t.deleteTake}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A note id becomes a sentence in the reader's language.
 *
 * The map lives in `lib/i18n/speaking-notes` rather than here, so a test can
 * assert that every id has wording in all seven languages — a join nobody can
 * assert on is how a feature ends up rendering a blank line in six of them.
 */
function renderNote(t: T, note: Note): string {
  if (note.id === "nothing-flagged") return t.notes.nothingFlagged;
  if (note.id === "foreign-form") {
    const origin = note.origin ?? "";
    const template = note.suggest ? t.foreignForm : t.foreignFormPlain;
    return template
      .replace("{form}", note.form ?? "")
      .replace("{origin}", origin)
      .replace("{suggest}", note.suggest ?? "");
  }
  const wording = t.notes[NOTE_WORDING[note.id as PlainNoteId]];
  return note.value === undefined ? wording : wording.replace("{n}", String(note.value));
}
