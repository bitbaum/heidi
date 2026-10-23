"use client";

import { useCallback, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { fill } from "@/lib/i18n/fill";
import { plural } from "@/lib/i18n/plural";
import type { Question, QuestionSet } from "@/lib/channels/questions";
import type { Transcript } from "@/lib/channels/transcript";
import type { TranscriptState, VideoDetail } from "@/lib/channels/store";
import { useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { recordPractice } from "./streak-store";
import { useByok } from "./use-byok";
import { optionClass } from "./exercises/chrome";
import { PRIMARY, SECONDARY } from "./exercises/actions";
import { PastePanel, TranscriptView } from "./video-transcript";
import { videoStore, writeRecord } from "./video-store";
import { useYouTubePlayer } from "./youtube-player";
import { useAudioPlayer } from "./audio-player";

type T = Dictionary["channels"]["lesson"];

type Phase = "before" | "loading" | "gist" | "detail" | "done";

const NONE: (number | null)[] = [];

/**
 * One video, in the order HEIDI.md's listening lab lays out: context, a
 * gist question BEFORE the first listen, then the detail questions, each
 * wrong answer answered with the line that was said and a button that plays
 * it, then the transcript. The player stays in view while the questions
 * scroll, so replaying never means scrolling back up.
 *
 * NO SCORE. The summary is a count with a denominator — four questions about
 * this video — and the lines to replay, which is the part that teaches.
 *
 * The transcript and the questions are fetched the first time anybody opens
 * the video and kept for everyone after; what THIS person answered stays in
 * this browser (`video-store.ts`), and the screen is DERIVED from that
 * record rather than copied into state: open the video on the same phone
 * tomorrow and it is where it was left.
 */
export function VideoLesson({ video, t, locale, videoUrl }: { video: VideoDetail; t: T; locale: Locale; videoUrl: string }) {
  const storageReady = useStorageReady();
  const { config: byok } = useByok();
  const isEpisode = video.kind === "podcast";
  const [mountRef, youtube] = useYouTubePlayer(video.id, locale, !isEpisode);
  const [audioRef, audio] = useAudioPlayer();
  const player = isEpisode ? audio : youtube;
  const progress = useBrowserStore(videoStore);

  const [transcript, setTranscript] = useState<Transcript | null>(video.transcript);
  const [tstate, setTstate] = useState<TranscriptState>(video.transcript ? "ready" : video.transcriptState);
  const [questions, setQuestions] = useState<QuestionSet | null>(video.questions);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [noneReason, setNoneReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const record = storageReady ? progress?.[video.id] : undefined;
  const chosen = record?.chosen ?? NONE;
  const all: Question[] = useMemo(() => (questions ? [questions.gist, ...questions.detail] : []), [questions]);

  const phase: Phase = (() => {
    if (loading) return "loading";
    if (!questions) return "before";
    if (record?.done) return "done";
    if (!started && chosen.length === 0) return "before";
    if (chosen[0] === null || chosen[0] === undefined) return "gist";
    if (detailOpen || chosen.slice(1).some((c) => c !== null)) return "detail";
    return "gist";
  })();
  const showTranscript = transcriptOpen || phase === "done";

  const missed = useMemo(() => {
    const set = new Set<number>();
    all.forEach((q, i) => {
      const c = chosen[i];
      if (c !== null && c !== undefined && c !== q.answer) for (const line of q.evidence) set.add(line);
    });
    return set;
  }, [all, chosen]);

  const fetchQuestions = useCallback(async (): Promise<boolean> => {
    const res = await fetch(`/api/videos/${video.id}/questions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ byok }),
    });
    if (res.ok) {
      const { questions: set } = (await res.json()) as { questions: QuestionSet };
      setQuestions(set);
      return true;
    }
    setProblem(res.status === 503 ? t.questionsUnconfigured : t.questionsFailed);
    return false;
  }, [video.id, byok, t.questionsUnconfigured, t.questionsFailed]);

  /** The button: get a transcript if there is none, then questions, then begin. */
  async function start() {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    setLoading(true);
    try {
      let text = transcript;
      if (!text) {
        const res = await fetch(`/api/videos/${video.id}/transcript`, { method: "POST" });
        const data = (await res.json().catch(() => ({}))) as { state?: TranscriptState; transcript?: Transcript; reason?: string };
        if (data.state === "ready" && data.transcript) {
          text = data.transcript;
          setTranscript(text);
          setTstate("ready");
        } else {
          setTstate(data.state ?? (isEpisode ? "none" : "blocked"));
          setNoneReason(data.reason ?? null);
          return;
        }
      }
      if (!questions && !(await fetchQuestions())) {
        setTranscriptOpen(true);
        return;
      }
      begin();
    } catch {
      setProblem(t.questionsFailed);
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }

  function begin() {
    writeRecord(video.id, { chosen: [], done: false, at: new Date().toISOString() });
    setDetailOpen(false);
    setTranscriptOpen(false);
    setStarted(true);
  }

  async function pasted(text: string): Promise<"ok" | "bad" | "failed"> {
    setBusy(true);
    try {
      const res = await fetch(`/api/videos/${video.id}/transcript`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pasted: text }),
      });
      if (res.status === 422) return "bad";
      if (!res.ok) return "failed";
      const data = (await res.json()) as { transcript: Transcript };
      setTranscript(data.transcript);
      setTstate("ready");
      setQuestions(null);
      setLoading(true);
      const ok = await fetchQuestions();
      setLoading(false);
      if (!ok) {
        setTranscriptOpen(true);
        return "failed";
      }
      begin();
      return "ok";
    } catch {
      return "failed";
    } finally {
      setBusy(false);
    }
  }

  function pick(index: number, option: number) {
    if (chosen[index] !== null && chosen[index] !== undefined) return;
    const next = [...chosen];
    while (next.length < all.length) next.push(null);
    next[index] = option;
    const done = next.every((c) => c !== null);
    writeRecord(video.id, { chosen: next, done, at: new Date().toISOString() });
    if (done) recordPractice();
  }

  const right = all.filter((q, i) => chosen[i] === q.answer).length;
  const lines = transcript?.lines ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* The player keeps its place at the top of the screen on a phone while
          the questions scroll under it. */}
      <div className="sticky top-0 z-10 -mx-5 bg-surface-page sm:static sm:mx-0">
        {isEpisode ? (
          <div className="flex items-center gap-4 px-5 pt-3 sm:px-0">
            {(video.thumbnailUrl ?? video.channelImageUrl) && (
              // The show's artwork, from its feed; a remote host the image
              // loader is not configured for, at thumbnail size.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.thumbnailUrl ?? video.channelImageUrl ?? ""} alt="" width={96} height={96} className="size-24 shrink-0 rounded-control bg-surface-sunk object-cover" />
            )}
            {/* The browser's own player: it already has play, pause, a
                scrubber and a time. Below it, the two controls a learner
                uses most, at thumb size. */}
            <audio ref={audioRef} controls preload="metadata" src={video.mediaUrl ?? undefined} onCanPlay={audio.onCanPlay} onLoadedMetadata={audio.onCanPlay} className="w-full min-w-0" />
          </div>
        ) : (
          <div ref={mountRef} className="aspect-video w-full bg-surface-sunk [&_iframe]:h-full [&_iframe]:w-full" />
        )}
        <div className="flex flex-wrap items-center gap-2 px-5 py-2 sm:px-0">
          <button type="button" disabled={!player.ready} onClick={() => player.back(5)} className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-4 text-sm font-medium text-fg-primary disabled:opacity-40">
            ↺ {t.back5}
          </button>
          <button type="button" disabled={!player.ready} onClick={player.toggleSlow} aria-pressed={player.slow} className="inline-flex min-h-11 items-center rounded-control border border-border-subtle px-4 text-sm text-fg-secondary disabled:opacity-40 aria-pressed:border-border-strong aria-pressed:text-fg-primary">
            {player.slow ? t.normalSpeed : t.slower}
          </button>
          {!player.ready && <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.playerLoading}</span>}
        </div>
      </div>

      {phase === "before" && (
        <div className="flex flex-col gap-6">
          {tstate === "blocked" && !isEpisode && <PastePanel t={t} videoUrl={videoUrl} onPasted={pasted} busy={busy} />}
          {tstate === "none" && (
            <p className="max-w-measure text-base leading-relaxed text-fg-secondary">
              {noneReason === "dialect" ? t.noTranscriptDialect : isEpisode ? t.noTranscriptEpisode : t.noTranscript}
            </p>
          )}
          {problem && (
            <p role="alert" className="max-w-measure text-base leading-relaxed text-fg-secondary">
              {problem}
            </p>
          )}
          {tstate !== "none" && !problem && (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void start()} disabled={busy} className={PRIMARY}>
                {t.start}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "loading" && (
        <p role="status" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
          {transcript ? t.writing : isEpisode ? t.transcribing : t.preparing}
        </p>
      )}

      {questions && phase === "gist" && (
        <Stage title={t.gistTitle} hint={t.gistHint}>
          <QuestionBlock q={questions.gist} chosen={chosen[0] ?? null} onPick={(o) => pick(0, o)} t={t} lines={lines} onSeek={player.seekTo} />
          {chosen[0] !== null && chosen[0] !== undefined && (
            <button type="button" onClick={() => setDetailOpen(true)} className={`${PRIMARY} mt-4`}>
              {t.detailTitle} →
            </button>
          )}
        </Stage>
      )}

      {questions && phase === "detail" && (
        <Stage title={t.detailTitle} hint={t.detailHint}>
          <ol className="flex flex-col gap-6">
            {questions.detail.map((q, i) => (
              <li key={i}>
                <QuestionBlock q={q} number={i + 1} chosen={chosen[i + 1] ?? null} onPick={(o) => pick(i + 1, o)} t={t} lines={lines} onSeek={player.seekTo} />
              </li>
            ))}
          </ol>
        </Stage>
      )}

      {questions && phase === "done" && (
        <section aria-labelledby="summary-heading" className="rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
          <h2 id="summary-heading" className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {t.summaryTitle}
          </h2>
          <p className="mt-2 text-base text-fg-primary">{plural(t.summary, right, locale, { total: String(all.length) })}</p>
          {missed.size > 0 && (
            <>
              <p className="mt-4 text-sm text-fg-secondary">{t.replayMissed}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {[...missed].sort((a, b) => a - b).map((i) => (
                  <li key={i}>
                    <ReplayLine line={lines[i]} onSeek={player.seekTo} label={t.replay} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {questions.truncated && <p className="mt-4 text-sm text-fg-muted">{t.truncatedNote}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={begin} className={SECONDARY}>
              {t.again}
            </button>
          </div>
        </section>
      )}

      {transcript && (
        <div>
          {phase !== "done" && (
            <button type="button" onClick={() => setTranscriptOpen((s) => !s)} aria-pressed={showTranscript} className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent">
              {showTranscript ? t.hideTranscript : t.showTranscript}
            </button>
          )}
          {showTranscript && (
            <div className={phase !== "done" ? "mt-4" : ""}>
              <TranscriptView t={t} transcript={transcript} missed={missed} onSeek={player.seekTo} lang={transcript.lang || undefined} />
            </div>
          )}
        </div>
      )}

      {questions?.model && phase !== "before" && (
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{fill(t.writtenBy, { model: questions.model })}</p>
      )}
    </div>
  );
}

function Stage({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{title}</p>
      <p className="mt-1 max-w-measure text-sm leading-relaxed text-fg-secondary">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function QuestionBlock({
  q,
  number,
  chosen,
  onPick,
  t,
  lines,
  onSeek,
}: {
  q: Question;
  number?: number;
  chosen: number | null;
  onPick: (option: number) => void;
  t: T;
  lines: Transcript["lines"];
  onSeek: (seconds: number) => void;
}) {
  return (
    <div className="rounded-control border border-border-strong bg-surface-raised p-5 sm:p-6">
      <p className="font-heading text-xl font-semibold leading-snug tracking-display text-fg-primary">
        {number !== undefined && <span className="mr-2 font-mono text-caption font-normal text-fg-muted">{number}</span>}
        {q.prompt}
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {q.options.map((option, i) => (
          <li key={option}>
            <button type="button" disabled={chosen !== null} onClick={() => onPick(i)} className={optionClass(i, chosen, q.answer, true)}>
              {option}
            </button>
          </li>
        ))}
      </ul>
      {chosen !== null && (
        <div className="mt-4 border-t border-border-subtle pt-4">
          <p role="status" className={`text-base font-semibold ${chosen === q.answer ? "text-ok" : "text-fg-primary"}`}>
            {chosen === q.answer ? t.right : t.wrong}
          </p>
          {q.evidence.length > 0 && (
            <>
              <p className="mt-2 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.saidHere}</p>
              <ul className="mt-1 flex flex-col gap-1">
                {q.evidence.map((i) => (
                  <li key={i}>
                    <ReplayLine line={lines[i]} onSeek={onSeek} label={t.replay} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReplayLine({ line, onSeek, label }: { line: Transcript["lines"][number] | undefined; onSeek: (seconds: number) => void; label: string }) {
  if (!line) return null;
  return (
    <button type="button" onClick={() => onSeek(line.start)} aria-label={`${label}: ${line.text}`} className="flex min-h-11 w-full items-start gap-3 rounded-control px-2 py-1 text-left transition-colors hover:bg-surface-page">
      <span aria-hidden="true" className="mt-1 shrink-0 text-fg-muted">
        ▶
      </span>
      <span className="text-base leading-relaxed text-fg-primary">{line.text}</span>
    </button>
  );
}
