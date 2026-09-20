"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { deliveryNotes, recordingNotes, spokenNotes, type Note } from "@/lib/domain/speaking/feedback";
import { usable, type Delivery } from "@/lib/domain/speaking/delivery";
import { MAX_SAID_LENGTH, type Take } from "@/lib/domain/speaking/take";
import type { SpokenVarietyId } from "@/lib/domain/speaking/varieties";
import { measureSpoken, type Spoken } from "@/lib/speech/spoken";
import { NOTE_WORDING, type PlainNoteId } from "@/lib/i18n/speaking-notes";
import { useClientValue } from "@/lib/browser/store";
import { progressFrom, spokenMinutes } from "@/lib/domain/speaking/progress";
import { useTakes } from "./use-takes";
import { useRecorder, recordingSupported } from "./use-recorder";
import { useByok } from "./use-byok";
import { useVoiceSettings } from "./use-voice-settings";

type T = Dictionary["speaking"];

/**
 * Record yourself, and be told what is actually knowable about it.
 *
 * The half that needs nobody else. It works signed out, alone, on a phone,
 * with an empty calendar above it — which is what makes the page useful on the
 * day before its first round exists.
 *
 * THE SHAPE OF THE SCREEN IS THE SHAPE OF WHAT CAN BE KNOWN, and that shape
 * now has two columns rather than one, because the pack always said it did:
 *
 *   1. WHICH VARIETY. Züritüütsch, or the Standard German that the same
 *      learner needs at a doctor's desk. Read from `DISPLAY.practice`, which
 *      reads `varieties.ts`, which reads the pack. Nothing here names a
 *      language, and a pack with one answer renders no switch at all.
 *   2. MEASURED. Durations, counts, and — this is the fix — the LENGTH OF THE
 *      RECORDING beside the time spent speaking. "You spoke for 16 seconds"
 *      is unreadable alone: it is a complete answer or a microphone that gave
 *      up, and only the pair says which. §8 still: no score, anywhere.
 *   3. THE WORDS. On the dialect the learner types them, because §7 says no
 *      recogniser returns this variety and one that pretended to would be
 *      wrong in exactly the way they could not detect. On the bridge Heidi
 *      transcribes, because there the transcript IS their own words — and
 *      then the rate pair, the filled pauses and the gate all have something
 *      to work on.
 *   4. CHECKED. The deterministic gate on those words, then one model
 *      suggestion on top. §6.
 *
 * Nothing in steps 1–2 waits on the network, in either mode, so the
 * measurement is on screen before any of it and a failed transcription costs
 * nothing that was already earned.
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
  /**
   * The varieties this pack can actually be practised in, target first.
   *
   * A projection, not the pack: `display.test.ts` fails the build if a
   * component imports `variety/active`, because the pack carries English prose
   * that must never reach a reader in another language. Names and booleans are
   * what survive, and names are what a switch needs.
   */
  const varieties = DISPLAY.practice;
  const [varietyId, setVarietyId] = useState<SpokenVarietyId>(varieties[0]?.id ?? "target");
  const variety = varieties.find((v) => v.id === varietyId) ?? varieties[0];

  /**
   * Does THIS mode send the recording anywhere?
   *
   * The single fact the rest of the screen hangs off, and it is a property of
   * the variety rather than a setting: a variety Heidi cannot faithfully
   * transcribe has nothing to send audio for. Passed into the recorder before
   * the microphone opens — see the note on `retainAudio`.
   */
  const transcribes = Boolean(variety?.transcribable);

  const recorder = useRecorder({ retainAudio: transcribes });
  const { takes, ready, keep, forget, before } = useTakes();
  const byok = useByok();
  // The learner's own answer to "how much should Heidi say about my words".
  // Device-local, so it travels on the request rather than living in a table.
  const voice = useVoiceSettings();

  const [said, setSaid] = useState("");
  const [asking, setAsking] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  /** What the deterministic gate found, computed server-side. See `ask`. */
  const [language, setLanguage] = useState<Note[]>([]);
  const [askedOnce, setAskedOnce] = useState(false);
  /** Transcription state, for the bridge half only. */
  const [hearing, setHearing] = useState(false);
  const [heardFailed, setHeardFailed] = useState(false);
  /** What the marker check made of the transcript. See `dialect-marker.ts`. */
  const [spoke, setSpoke] = useState<"target" | "bridge" | "unclear" | undefined>(undefined);

  const takeId = recorder.takeId;
  const previous = takeId ? before(takeId) : undefined;

  /**
   * The half that needs no pack, no model and no network.
   *
   * `feedbackFor` composes all sources and takes a pack, which a component may
   * not import — the pack carries English prose that must never reach a reader
   * in another language, and `lib/variety/display.test.ts` fails the build over
   * it. So the page assembles the pure halves here and the gate half arrives
   * from the route, already reduced to ids.
   */
  const feedback = useMemo(() => {
    if (!recorder.delivery) return null;
    return {
      recording: recordingNotes(recorder.delivery),
      delivery: deliveryNotes(recorder.delivery, previous?.delivery),
    };
  }, [recorder.delivery, previous]);

  /**
   * The transcript half, recomputed as the learner edits the text.
   *
   * IT RUNS IN BOTH MODES, on whatever words are on screen — typed on the
   * dialect, transcribed-then-editable on the bridge. The rate it produces is
   * honest either way, because syllables come from the text the learner stands
   * behind and every duration comes from the signal this device measured.
   *
   * What differs between the modes is not this computation, it is who wrote
   * the text; §7 is about that and nothing else.
   */
  const spokenMeasures = useMemo(() => {
    if (!recorder.delivery || !said.trim()) return null;
    return measureSpoken(recorder.delivery, said, DISPLAY.speechRule, DISPLAY.fillers);
  }, [recorder.delivery, said]);

  const spokenFeedback = useMemo(() => {
    if (!recorder.delivery || !spokenMeasures) return [];
    return spokenNotes(recorder.delivery, spokenMeasures, spoke);
  }, [recorder.delivery, spokenMeasures, spoke]);

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

  /**
   * Send the recording to be transcribed, once, for the take that produced it.
   *
   * Guarded by a ref rather than by a piece of state because the guard must
   * hold WITHIN a render pass: two effects firing on the same commit would
   * both see `hearing === false` and both upload. The id of the take that was
   * last sent is the honest key — it survives a re-render and resets itself
   * when a new take starts.
   */
  const sentFor = useRef<string | null>(null);
  const audio = recorder.audio;
  const dropAudio = recorder.dropAudio;

  useEffect(() => {
    if (!audio || !takeId || !transcribes) return;
    if (sentFor.current === takeId) return;
    sentFor.current = takeId;

    const body = new FormData();
    body.set("audio", audio);
    body.set("variety", varietyId);

    setHearing(true);
    setHeardFailed(false);

    void (async () => {
      try {
        const res = await fetch("/api/speaking/transcribe", { method: "POST", body });
        const data = (await res.json()) as { text?: string; spoke?: string };
        const text = typeof data.text === "string" ? data.text : "";
        if (!res.ok || !text) {
          // No transcript is not a failed exercise: the measurements are on
          // screen and the learner can type the sentence, which is what the
          // dialect half asks of everybody anyway.
          setHeardFailed(true);
        } else {
          saveSaid(text);
          setSpoke(
            data.spoke === "target" || data.spoke === "bridge" || data.spoke === "unclear"
              ? data.spoke
              : undefined,
          );
        }
      } catch {
        setHeardFailed(true);
      } finally {
        setHearing(false);
        // The blob has done its one job. Dropping it here rather than leaving
        // it in state means a tab left open does not hold somebody's voice.
        dropAudio();
      }
    })();
  }, [audio, takeId, transcribes, varietyId, saveSaid, dropAudio]);

  const ask = useCallback(async () => {
    const text = said.trim();
    if (!text || asking) return;
    setAsking(true);
    setAskedOnce(true);
    try {
      const res = await fetch("/api/speaking/take", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ said: text, locale, byok: byok.config, correction: voice.settings.correction }),
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
  }, [said, asking, locale, byok.config, voice.settings.correction]);

  /** Everything the last take put on screen, cleared in one place. */
  const clearTake = useCallback(() => {
    setSaid("");
    setSuggestion(null);
    setLanguage([]);
    setAskedOnce(false);
    setHeardFailed(false);
    setSpoke(undefined);
  }, []);

  /**
   * Start a take, clearing whatever the last one left on screen.
   *
   * One press, not two: "Again" used to reset to idle and wait for a second
   * press on the same button, which reads as the button having failed. The
   * previous take is already kept by the time this runs, so nothing is lost by
   * clearing the text here.
   */
  const beginTake = useCallback(() => {
    clearTake();
    void recorder.start();
  }, [recorder, clearTake]);

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

  const busy = recorder.state === "asking" || recorder.state === "measuring";

  return (
    <section aria-labelledby="practice-heading">
      <h2
        id="practice-heading"
        className="font-heading text-section leading-tight tracking-display text-fg-primary"
      >
        {t.practiceTitle}
      </h2>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.practiceLead}</p>
      {about && <p className="mt-2 font-mono text-caption uppercase tracking-caps text-fg-muted">{about}</p>}

      {/* WHICH VARIETY, and what choosing it costs — stated on the same
          screen, not in a policy page. A single-entry list renders nothing:
          a radio group with one option is a control that cannot be operated. */}
      {varieties.length > 1 && (
        <div className="mt-5">
          <div
            role="radiogroup"
            aria-label={t.varietyLabel}
            className="flex flex-wrap gap-2"
          >
            {varieties.map((v) => {
              const active = v.id === varietyId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    if (v.id === varietyId) return;
                    setVarietyId(v.id);
                    // The take on screen belongs to the mode that made it.
                    // Leaving it would put "we transcribed this" over a
                    // sentence the learner typed, or the reverse.
                    clearTake();
                    recorder.reset();
                  }}
                  disabled={recorder.state === "recording" || busy}
                  className={`min-h-11 rounded-control border px-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
                    active
                      ? "border-accent bg-accent text-on-accent"
                      : "border-border-strong bg-surface-page text-fg-primary"
                  }`}
                >
                  {/* The TARGET is labelled with its endonym, which is a real
                      name and reads correctly in all seven languages — that is
                      the whole argument `display.ts` makes for letting names
                      through the projection.

                      The BRIDGE is not. `Bridge.name` in the pack is "Swiss
                      Standard German", written in English for whoever
                      maintains the pack, and putting that in front of a German
                      or Russian reader is the same leak the projection exists
                      to stop, arriving through a field that looks like a name.
                      A description translates; an endonym does not. So this
                      one comes from the dictionaries. */}
                  {v.id === "bridge" ? t.varietyBridge : v.name}
                </button>
              );
            })}
          </div>
          <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">
            {transcribes ? t.varietyTranscribes : t.varietyMeasuresOnly}
          </p>
        </div>
      )}

      <div className="mt-5 rounded-control border border-border-subtle bg-surface-raised p-4 sm:p-6">
        {/* The control. One big target, centred, reachable with a thumb. */}
        <div className="flex flex-col items-center gap-4">
          {recorder.state !== "recording" && (
            <button
              type="button"
              onClick={beginTake}
              disabled={!supported || busy}
              /* h-24 w-24, not `min-h-20 min-w-20 px-6`. The old pair gave the
                 padding the last word, so a circle with "Nochmals" in it came
                 out as a lozenge — the one control on the page, misshapen.
                 Fixed dimensions and a wrapped label keep it round at every
                 word length in all seven languages. */
              className="flex h-24 w-24 items-center justify-center rounded-full bg-accent px-2 text-center text-base font-semibold leading-tight text-on-accent transition-opacity disabled:opacity-50"
            >
              {busy ? "…" : recorder.state === "done" || recorder.state === "error" ? t.again : t.record}
            </button>
          )}

          {recorder.state === "recording" && (
            <>
              {/* The level is the point of this element: a dead microphone has
                  to be visible in the first second, not after the take. */}
              <div
                aria-hidden="true"
                className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent"
                style={{ transform: `scale(${1 + recorder.level * 0.25})`, transition: "transform 80ms linear" }}
              >
                <span className="h-3 w-3 rounded-full bg-accent" />
              </div>
              <p className="font-mono text-sm text-fg-muted" aria-live="polite">
                {t.recordingNow} · {Math.floor(recorder.elapsedMs / 1000)} {t.seconds}
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

        {recorder.delivery && <Measured t={t} delivery={recorder.delivery} spoken={spokenMeasures} />}

        {feedback && (feedback.recording.length > 0 || feedback.delivery.length > 0 || spokenFeedback.length > 0) && (
          <ul className="mt-5 grid gap-2">
            {[...feedback.recording, ...feedback.delivery, ...spokenFeedback].map((note, i) => (
              <li key={`${note.id}-${i}`} className="text-sm leading-relaxed text-fg-secondary">
                {renderNote(t, note)}
              </li>
            ))}
          </ul>
        )}

        {/* The words. Only once there is something to transcribe, and only
            when the recording was worth keeping. */}
        {recorder.delivery && usable(recorder.delivery) && (
          <div className="mt-6 border-t border-border-subtle pt-5">
            <label htmlFor="said" className="block font-heading text-lg leading-tight text-fg-primary">
              {transcribes ? t.heardTitle : t.saidTitle}
            </label>
            {/* READ FROM THE PACK, not assumed. `saidWhy` explains that
                nothing transcribes this variety reliably, which is true of
                Zurich German and false of Ukrainian — printing it on a pack
                that HAS usable ASR would be the engine asserting a fact about
                a language it is not teaching. §4's rule, applied to a
                sentence rather than to a surface.

                In the transcribing mode the opposite sentence is the true one,
                and it says the thing a learner must be able to act on: the
                text is a machine's and they are the one who decides. */}
            {transcribes ? (
              <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.heardWhy}</p>
            ) : (
              !DISPLAY.capabilities.asr && (
                <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.saidWhy}</p>
              )
            )}

            {hearing && <p className="mt-3 font-mono text-sm text-fg-muted">{t.hearing}</p>}
            {heardFailed && <p className="mt-3 text-sm text-fg-muted">{t.heardFailed}</p>}

            <textarea
              id="said"
              value={said}
              onChange={(event) => saveSaid(event.target.value.slice(0, MAX_SAID_LENGTH))}
              rows={3}
              placeholder={transcribes ? t.heardPlaceholder : t.saidPlaceholder}
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

      {/* The privacy line is a DESCRIPTION, so it has to describe the mode the
          learner is actually in. Printing the signal-only sentence over a
          take that is about to be uploaded would be the one false statement
          this product cannot afford. */}
      <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">
        {transcribes ? t.privacyTranscribed : t.privacy}
      </p>

      {ready && takes.length > 0 && <ProgressStrip t={t} takes={takes} />}
      {ready && takes.length > 0 && <History t={t} takes={takes} forget={forget} />}
    </section>
  );
}

type Suggestion = { better: string; why?: string; flagged?: unknown[] };

/**
 * The numbers, plainly — and with their denominators.
 *
 * THE RECORDING LENGTH IS FIRST because it is what every other figure here is
 * measured against, and it was the one the screen did not print. A learner who
 * talked for most of a minute and read "spoke for 16 s" had no way to tell a
 * short answer from a microphone that stopped listening; the pair settles it
 * in one glance, and the share below spells it out.
 *
 * The rate figures appear only once there are words to divide by, which is
 * after transcription on the bridge and after typing on the dialect. Absent
 * rather than zero: a `0.0 Silben/Sek.` under a take nobody has written out
 * yet is a measurement of nothing, printed in the same type as the real ones.
 */
function Measured({ t, delivery, spoken }: { t: T; delivery: Delivery; spoken: Spoken | null }) {
  if (!usable(delivery)) return null;
  const s = (ms: number) => `${Math.round(ms / 100) / 10} ${t.seconds}`;

  const figures: Array<{ label: string; value: string }> = [
    { label: t.recordedFor, value: s(delivery.totalMs) },
    { label: t.spokeFor, value: s(delivery.speechMs) },
    { label: t.pauseLabel, value: String(delivery.pauseCount) },
    { label: t.longestLabel, value: s(delivery.longestPauseMs) },
    { label: t.runLabel, value: s(delivery.meanRunMs) },
  ];

  if (spoken && spoken.speechRate > 0) {
    figures.push({ label: t.rateLabel, value: `${spoken.speechRate}` });
  }
  if (spoken && spoken.wordCount > 0) {
    figures.push({ label: t.wordsLabel, value: String(spoken.wordCount) });
  }

  return (
    <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle sm:grid-cols-3">
      {figures.map((figure) => (
        <Figure key={figure.label} label={figure.label} value={figure.value} />
      ))}
      {/* The grid shows the border colour through any cell a row is short of,
          so an odd number of figures ends in a grey rectangle that reads as a
          tile whose contents failed to load. The count is genuinely variable —
          five figures before there are words, seven after — so padding is the
          fix rather than choosing a count that happens to divide. */}
      {Array.from({ length: (COLUMNS - (figures.length % COLUMNS)) % COLUMNS }).map((_, i) => (
        <div key={`pad-${i}`} aria-hidden="true" className="hidden bg-surface-page sm:block" />
      ))}
      {figures.length % 2 === 1 && <div aria-hidden="true" className="bg-surface-page sm:hidden" />}
    </dl>
  );
}

/** The widest the figure grid gets. Matches `sm:grid-cols-3` above. */
const COLUMNS = 3;

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
      {/* Three columns at every width, unlike the figure grid above: three
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
              {/* `historyUnwritten`, NOT `historyEmpty`. A take in this list is
                  by definition a recording that happened — it has a duration
                  and a pause count printed under it — and labelling it
                  "nothing recorded yet" was the row calling itself absent
                  while showing its own measurements. */}
              <span className="block truncate text-sm text-fg-primary">
                {take.said || take.about || t.historyUnwritten}
              </span>
              <span className="mt-0.5 block font-mono text-caption uppercase tracking-caps text-fg-muted">
                {Math.round(take.delivery.speechMs / 1000)} {t.seconds} · {take.delivery.pauseCount}{" "}
                {t.pauseLabel}
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
