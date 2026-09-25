"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { LOCALE_TAGS, type Locale } from "@/lib/i18n/locales";
import { DISPLAY } from "@/lib/variety/display";
import { deliveryNotes, recordingNotes, spokenNotes, type Note } from "@/lib/domain/speaking/feedback";
import { usable, type Delivery } from "@/lib/domain/speaking/delivery";
import { MAX_SAID_LENGTH, type Take } from "@/lib/domain/speaking/take";
import type { SpokenVarietyId } from "@/lib/domain/speaking/varieties";
import { measureSpoken, type Spoken } from "@/lib/speech/spoken";
import type { GrammarFinding } from "@/lib/speech/grammar";
import { hesitations, type Hesitation } from "@/lib/speech/hesitation";
import type { TimedWord } from "@/lib/speech/fluency";
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
  /**
   * What the server could add about a transcribed take. `undefined` = this
   * take was not transcribed, so there is nothing to say either way. `null` =
   * transcribed, but this part could not be checked, and the page SAYS so —
   * silence there would read as "no mistakes".
   */
  const [grammar, setGrammar] = useState<{ findings: GrammarFinding[]; total: number } | null | undefined>(
    undefined,
  );
  const [timedWords, setTimedWords] = useState<TimedWord[] | null | undefined>(undefined);

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

  /**
   * Where the long pauses fell, named. The signal (this device) says where the
   * silences were; the transcript's timings say which word each one preceded.
   * See `lib/speech/hesitation.ts` for why neither can do it alone.
   */
  const hesitated = useMemo<Hesitation[] | null | undefined>(() => {
    if (timedWords === undefined) return undefined;
    if (timedWords === null || !recorder.delivery?.pauseSpans) return null;
    return hesitations(recorder.delivery.pauseSpans, timedWords);
  }, [timedWords, recorder.delivery]);

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
  const delivery = recorder.delivery;

  /**
   * A take this page has already decided it cannot read.
   *
   * Derived rather than stored: `usable()` is a pure function of the delivery,
   * and the delivery is on screen — so this is the same fact the measurements
   * are drawn from, not a second record of it that can fall out of step. It
   * reads as "no transcript arrived", which is exactly what happened and is
   * already the wording for that case.
   */
  const unreadable = Boolean(transcribes && delivery && !usable(delivery));

  useEffect(() => {
    if (!audio || !takeId || !transcribes) return;

    /**
     * A RECORDING WE ALREADY KNOW IS UNUSABLE IS NOT SENT.
     *
     * Measured, not reasoned about: `scripts/audit/speaking.mjs` drives this
     * page with Chrome's synthetic microphone, which emits a tone. The tone
     * came back from the transcriber as «Bis zum nächsten Mal.» — four words
     * nobody said, printed under "this is what we heard", counted into the
     * word total, and stored on the take.
     *
     * That is what a Whisper-family model does with audio containing no
     * speech: it does not return nothing, it returns something plausible. On a
     * phone in a corridor — the care setting this product is built for — a
     * take that caught nothing but room noise is not a rare case.
     *
     * The guard needs no new judgement, because the page already makes it.
     * `usable()` asks "is there enough here to say anything at all", and
     * `spokenNotes`, `deliveryNotes` and `recordingNotes` all return nothing
     * when the answer is no. The transcript was the one thing that ignored it
     * — so the product would suppress its own honest measurements of a
     * two-second false start and then print an invented sentence about it.
     *
     * NOT SENDING beats sending and hiding: no audio leaves the device for a
     * recording we have already decided we cannot read, which is a model call
     * saved and a smaller privacy claim to defend.
     *
     * AND IT IS DERIVED, NOT SET. `unreadable` below is computed in render
     * from the delivery, so this effect only does effect work — marking the
     * take as handled and releasing the blob. Setting state here instead
     * would be a cascading render, and the lint rule that says so was right:
     * "is this recording readable" is a fact about the delivery, available at
     * render, not an event to record.
     */
    if (delivery && !usable(delivery)) {
      sentFor.current = takeId;
      dropAudio();
      return;
    }

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
        const data = (await res.json()) as {
          text?: string;
          spoke?: string;
          grammar?: { findings?: GrammarFinding[]; total?: number } | null;
          words?: TimedWord[] | null;
        };
        const text = typeof data.text === "string" ? data.text : "";
        if (!res.ok || !text) {
          // No transcript is not a failed exercise: the measurements are on
          // screen and the learner can type the sentence, which is what the
          // dialect half asks of everybody anyway.
          setHeardFailed(true);
        } else {
          saveSaid(text);
          setGrammar(
            data.grammar && Array.isArray(data.grammar.findings)
              ? { findings: data.grammar.findings, total: data.grammar.total ?? data.grammar.findings.length }
              : null,
          );
          setTimedWords(Array.isArray(data.words) ? data.words : null);
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
  }, [audio, takeId, transcribes, varietyId, saveSaid, dropAudio, delivery]);

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
    setGrammar(undefined);
    setTimedWords(undefined);
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

  /**
   * Numbers in the reader's own notation.
   *
   * Every figure and every interpolated note rendered `4.6` in all seven
   * languages, because a JS number stringifies with a dot and nothing asked.
   * Three of the seven do not write it that way — French, Romansh and Russian
   * all use a comma — so a French reader met "4.6 secondes" in a product whose
   * whole argument is that it gets the local details right.
   *
   * `LOCALE_TAGS` is already the SSOT for this: it carries the Swiss variants
   * (`de-CH`, `fr-CH`, `it-CH`) that `<html lang>` uses, and Swiss German
   * genuinely does write `4.6` — so this is not "add commas", it is "ask the
   * locale", and the two Swiss cases keep the dot for a reason rather than by
   * accident.
   *
   * Deterministic given the tag, so the server pass and the client pass agree
   * and there is no hydration mismatch. `technology/page.tsx` already formats
   * this way.
   */
  const nf = useMemo(
    () => new Intl.NumberFormat(LOCALE_TAGS[locale], { maximumFractionDigits: 2 }),
    [locale],
  );
  const num = useCallback((n: number) => nf.format(n), [nf]);

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
          a radio group with one option is a control that cannot be operated.

          NATIVE RADIOS, and `nav-panel.tsx` already argued why. This was a row
          of `<button role="radio">`, which CLAIMS the radio pattern — roving
          tabindex, arrow keys moving within the group, "1 of 2" announced —
          and implemented none of it. That is the failure that file names: a
          role you assert and do not honour is worse than no role, because a
          screen-reader user is told to expect keys that do nothing.

          The browser is the maintained implementation here. `sr-only` keeps
          each input focusable and announced while the label carries the
          styling, so arrow keys, grouping and the disabled state all come from
          the platform and none of it is mine to get wrong. */}
      {varieties.length > 1 && (
        <fieldset className="mt-5 min-w-0 border-0 p-0" disabled={recorder.state === "recording" || busy}>
          <legend className="sr-only">{t.varietyLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {varieties.map((v) => (
              <label
                key={v.id}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-control border border-border-strong bg-surface-page px-4 text-sm font-semibold text-fg-primary transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-on-accent has-[:disabled]:cursor-default has-[:disabled]:opacity-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
              >
                <input
                  type="radio"
                  name="practice-variety"
                  value={v.id}
                  checked={v.id === varietyId}
                  onChange={() => {
                    if (v.id === varietyId) return;
                    setVarietyId(v.id);
                    // The take on screen belongs to the mode that made it.
                    // Leaving it would put "we transcribed this" over a
                    // sentence the learner typed, or the reverse.
                    clearTake();
                    recorder.reset();
                  }}
                  className="sr-only"
                />
                {/* The TARGET is labelled with its endonym, which is a real
                    name and reads correctly in all seven languages — that is
                    the whole argument `display.ts` makes for letting names
                    through the projection.

                    The BRIDGE is not. `Bridge.name` in the pack is "Swiss
                    Standard German", written in English for whoever maintains
                    the pack, and putting that in front of a German or Russian
                    reader is the same leak the projection exists to stop,
                    arriving through a field that looks like a name. A
                    description translates; an endonym does not. So this one
                    comes from the dictionaries. */}
                {v.id === "bridge" ? t.varietyBridge : v.name}
              </label>
            ))}
          </div>
          <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">
            {transcribes ? t.varietyTranscribes : t.varietyMeasuresOnly}
          </p>
        </fieldset>
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
                {t.recordingNow} · {num(Math.floor(recorder.elapsedMs / 1000))} {t.seconds}
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
          {recorder.error === "denied" && <p className="text-center text-sm text-danger">{t.micDenied}</p>}
          {recorder.error === "unsupported" && <p className="text-center text-sm text-danger">{t.micUnsupported}</p>}
          {recorder.error === "failed" && <p className="text-center text-sm text-danger">{t.failed}</p>}
        </div>

        {recorder.delivery && <Measured t={t} num={num} delivery={recorder.delivery} spoken={spokenMeasures} />}

        {feedback && (feedback.recording.length > 0 || feedback.delivery.length > 0 || spokenFeedback.length > 0) && (
          <ul className="mt-5 grid grid-cols-safe gap-2">
            {[...feedback.recording, ...feedback.delivery, ...spokenFeedback].map((note, i) => (
              <li key={`${note.id}-${i}`} className="text-sm leading-relaxed text-fg-secondary">
                {renderNote(t, num, note)}
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
            {(heardFailed || unreadable) && <p className="mt-3 text-sm text-fg-muted">{t.heardFailed}</p>}

            <textarea
              id="said"
              value={said}
              onChange={(event) => saveSaid(event.target.value.slice(0, MAX_SAID_LENGTH))}
              rows={3}
              placeholder={transcribes ? t.heardPlaceholder : t.saidPlaceholder}
              className="mt-3 w-full rounded-control border border-border-subtle bg-surface-page p-3 text-base text-fg-primary"
            />

            {transcribes && (grammar !== undefined || hesitated !== undefined) && (
              <HeardAnalysis t={t} num={num} grammar={grammar} hesitated={hesitated} />
            )}

            {language.length > 0 && (
              <ul className="mt-4 grid grid-cols-safe gap-2">
                {language.map((note, i) => (
                  <li key={`${note.id}-${i}`} className="text-sm leading-relaxed text-fg-secondary">
                    {renderNote(t, num, note)}
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
                  <p className="mt-2 text-sm leading-relaxed text-danger">{t.flaggedSuggestion}</p>
                )}
              </div>
            )}
            {askedOnce && !asking && !suggestion && (
              <p className="mt-3 text-sm text-fg-muted">{t.noSuggestion}</p>
            )}
          </div>
        )}

        {/* AFTER a take, not before it.
            This paragraph is the honest one — no grade, nothing about your
            accent, here is what was actually measured — and it was rendered
            unconditionally, which put four lines of caveat directly under the
            record button on a card that was otherwise empty. The first thing a
            visitor met was a careful explanation of what they were not going
            to be told. It answers a question somebody asks when they are
            LOOKING AT NUMBERS, so it belongs next to the numbers. */}
        {recorder.delivery && usable(recorder.delivery) && (
          <p className="mt-6 border-t border-border-subtle pt-4 text-sm leading-relaxed text-fg-muted">{t.noScore}</p>
        )}
      </div>

      {/* The privacy line is a DESCRIPTION, so it has to describe the mode the
          learner is actually in. Printing the signal-only sentence over a
          take that is about to be uploaded would be the one false statement
          this product cannot afford. */}
      <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">
        {transcribes ? t.privacyTranscribed : t.privacy}
      </p>

      {ready && takes.length > 0 && <ProgressStrip t={t} num={num} takes={takes} />}
      {ready && takes.length > 0 && <History t={t} num={num} takes={takes} forget={forget} />}
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
function Measured({ t, num, delivery, spoken }: { t: T; num: Num; delivery: Delivery; spoken: Spoken | null }) {
  if (!usable(delivery)) return null;
  const s = (ms: number) => `${num(Math.round(ms / 100) / 10)} ${t.seconds}`;

  const figures: Array<{ label: string; value: string }> = [
    { label: t.recordedFor, value: s(delivery.totalMs) },
    { label: t.spokeFor, value: s(delivery.speechMs) },
    { label: t.pauseLabel, value: num(delivery.pauseCount) },
    { label: t.longestLabel, value: s(delivery.longestPauseMs) },
    { label: t.runLabel, value: s(delivery.meanRunMs) },
  ];

  if (spoken && spoken.speechRate > 0) {
    figures.push({ label: t.rateLabel, value: num(spoken.speechRate) });
  }
  if (spoken && spoken.wordCount > 0) {
    figures.push({ label: t.wordsLabel, value: num(spoken.wordCount) });
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
function ProgressStrip({ t, num, takes }: { t: T; num: Num; takes: Take[] }) {
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
        <Figure label={t.progressDays} value={num(progress.daysSpoken)} />
        <Figure label={t.progressTakes} value={num(progress.takes)} />
        {/* Seconds below a minute: "1 min" over a first thirty-second take is
            a small lie in the one number somebody might repeat out loud. */}
        <Figure
          label={t.progressSpoken}
          value={
            minutes > 0
              ? `${num(minutes)} ${t.progressMinutes}`
              : `${num(Math.round(progress.spokenMs / 1000))} ${t.progressSeconds}`
          }
        />
      </dl>
      <p className="mt-3 max-w-measure text-sm leading-relaxed text-fg-muted">{t.progressNote}</p>
    </div>
  );
}

/**
 * What the server could add about a transcribed take: grammar, and where the
 * long pauses fell.
 *
 * NOT CHECKED IS SHOWN AS NOT CHECKED. `null` renders a sentence saying so,
 * because an empty space where the grammar would be reads as "no mistakes" on
 * exactly the day the checker was down.
 *
 * Findings are shown as what was said and what to say instead, and NOT with
 * the checker's explanation: LanguageTool explains in the language it checked,
 * and a German sentence in a Russian reader's page is the leak `display.ts`
 * exists to prevent. "den Buch → das Buch" needs no translation.
 */
function HeardAnalysis({
  t,
  num,
  grammar,
  hesitated,
}: {
  t: T;
  num: (n: number) => string;
  grammar: { findings: GrammarFinding[]; total: number } | null | undefined;
  hesitated: Hesitation[] | null | undefined;
}) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {grammar !== undefined && (
        <div>
          <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.grammarTitle}</p>
          {grammar === null ? (
            <p className="mt-2 text-sm text-fg-muted">{t.grammarNotChecked}</p>
          ) : grammar.findings.length === 0 ? (
            <p className="mt-2 text-sm text-fg-secondary">{t.grammarClean}</p>
          ) : (
            <>
              <ul className="mt-2 flex flex-col gap-1.5">
                {grammar.findings.map((f) => (
                  <li key={`${f.offset}-${f.ruleId}`} className="text-base leading-snug">
                    <span className="text-fg-secondary line-through decoration-danger">{f.text}</span>
                    {f.replacements[0] && (
                      <>
                        <span aria-hidden="true" className="mx-2 text-fg-muted">
                          →
                        </span>
                        <span className="font-medium text-fg-primary">{f.replacements[0]}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {grammar.total > grammar.findings.length && (
                <p className="mt-1 text-sm text-fg-muted">
                  {t.grammarMore.replace("{shown}", num(grammar.findings.length)).replace("{total}", num(grammar.total))}
                </p>
              )}
            </>
          )}
          {/* The limit, beside the result — a clean result from a partial
              checker is only honest if the reader knows it is partial. */}
          <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.grammarLimit}</p>
        </div>
      )}

      {hesitated && hesitated.length > 0 && (
        <div>
          <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.hesitationTitle}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {hesitated.map((h) => (
              <li key={h.index} className="text-base text-fg-primary">
                {t.hesitationBefore.replace("{s}", num(Math.round(h.ms / 100) / 10)).replace("{word}", h.before)}
              </li>
            ))}
          </ul>
          <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.hesitationNote}</p>
        </div>
      )}
    </div>
  );
}

function History({ t, num, takes, forget }: { t: T; num: Num; takes: Take[]; forget: (id: string) => void }) {
  return (
    <div className="mt-8">
      <h3 className="font-heading text-lg leading-tight text-fg-primary">{t.historyTitle}</h3>
      <ul className="mt-3 grid grid-cols-safe gap-px overflow-hidden rounded-control border border-border-subtle bg-border-subtle">
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
                {num(Math.round(take.delivery.speechMs / 1000))} {t.seconds} ·{" "}
                {num(take.delivery.pauseCount)} {t.pauseLabel}
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
/** Formats a number the way the reader writes it. See `nf` above. */
type Num = (n: number) => string;

function renderNote(t: T, num: Num, note: Note): string {
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
  return note.value === undefined ? wording : wording.replace("{n}", num(note.value));
}
