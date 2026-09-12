"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Answer, ChatMessage, Gloss } from "@/lib/domain/chat/types";
import { HEIDI_ID, LEARNER_ID } from "@/lib/domain/chat/types";
import type { Dictionary } from "@/lib/i18n";
import { LOCALE_TAGS, type Locale } from "@/lib/i18n/locales";
import { useDictation } from "./use-dictation";
import { useByok } from "./use-byok";
import { useSaved } from "./use-saved";
import { ModelSheet } from "./model-sheet";
import { downscale, imagesFromClipboard } from "./downscale";

/** How many pictures can ride along with one message. */
const MAX_IMAGES = 3;

/**
 * A conversation, not a form.
 *
 * What this replaces had two tabs — "Understand" and "Say it" — and the tabs
 * were the bug: someone arrives with a communication problem, not with a
 * decision about which of our tools to use. Asking them to classify their own
 * problem first is us pushing our internal structure onto them. The model
 * works it out now, and a follow-up ("why did they say it like that?") is just
 * the next message instead of a new query with no memory.
 */
export function Chat({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.chat;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const byok = useByok();
  const [sheetOpen, setSheetOpen] = useState(false);
  /**
   * Message ids were built from `Date.now()`, which is not unique: two messages
   * created in the same millisecond — a reply arriving as the learner sends
   * again — get the same React key, and React then reuses the wrong DOM node.
   * A counter cannot collide, and unlike a clock it is pure enough for the
   * compiler to accept inside a handler.
   */
  const lastId = useRef(0);
  const nextId = (prefix: string) => `${prefix}-${(lastId.current += 1)}`;
  /** Downscaled data URLs waiting to go with the next message. */
  const [attached, setAttached] = useState<string[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);

  const dictation = useDictation(LOCALE_TAGS[locale], (heard) => {
    setInput((v) => (v ? `${v} ${heard}` : heard));
    areaRef.current?.focus();
  });

  // Follow the conversation down, but only once it has started — an empty
  // thread scrolling itself on load would yank the page away from the reader.
  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const grow = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // Capped so a pasted conversation cannot eat the whole screen and push
    // the send button out of reach on a phone.
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(grow, [input, grow]);

  /**
   * Take pictures from a picker, a drop, or a paste — and downscale them here,
   * before they are ever uploaded. Vision models bill by image tile and the
   * person paying is the one who brought the key, so sending a 4 MB phone
   * screenshot would be charging them for detail no model needs.
   */
  const accept = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      if (!byok.canSee) {
        setSheetOpen(true);
        return;
      }
      setAttachError(null);
      // Capped at three by the updater below, not by `attached.length` read
      // here: downscaling is async, so a count captured now is already stale
      // by the time the picture is ready. Reading it from `prev` is the only
      // count that is true at the moment of the write.
      for (const file of files.slice(0, MAX_IMAGES)) {
        try {
          const prepared = await downscale(file);
          setAttached((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, prepared.dataUrl]));
        } catch {
          setAttachError(dict.model.imageTooBig);
        }
      }
    },
    [byok.canSee, dict.model.imageTooBig, setAttached],
  );

  /**
   * @param retry when true the learner's message is already on screen and the
   *   failed reply is dropped — otherwise a retry stacks a second copy of the
   *   question under the first, which is what it did before this existed.
   */
  async function send(text: string, retry = false) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    // Taken before the optimistic update so a failure can put them back.
    const images = attached;
    setAttached([]);
    setAttachError(null);

    // Everything up to and including the question being answered. On a retry
    // that means dropping the failed turn; otherwise it is the whole thread.
    const base = retry ? dropTrailingFailure(messages) : messages;
    const history = base
      .filter((m) => m.body)
      .map((m) => ({ authorId: m.authorId, body: m.body, createdAt: m.createdAt }));

    if (retry) {
      // The question is already the last thing on screen, so history must not
      // also carry it — the server appends `input` itself.
      history.pop();
      setMessages(base);
    } else {
      setMessages([
        ...base,
        { id: nextId("local"), authorId: LEARNER_ID, body: trimmed, createdAt: new Date().toISOString() },
      ]);
    }

    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: trimmed, history, locale, byok: byok.config, images }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Two rules here, both learned by watching it go wrong:
        //
        // Keyed on the STATUS, not on the route's `operator` flag — that flag
        // is set for both "no model configured" (503) and "the call failed"
        // (502), so using it told a visitor the product was unconfigured when
        // a vendor had merely blipped. Very different sentences.
        //
        // And never render the server's own string: those are written once, in
        // English, for a log. One surfaced verbatim on a German page.
        const message = res.status === 503 ? t.notConfigured : t.failed;
        setMessages((prev) => [
          ...prev,
          { id: nextId("err"), authorId: HEIDI_ID, body: "", createdAt: new Date().toISOString(), error: message },
        ]);
      } else if (!data.skipped) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId("heidi"),
            authorId: HEIDI_ID,
            body: (data as Answer).text,
            createdAt: new Date().toISOString(),
            answer: data as Answer,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId("err"), authorId: HEIDI_ID, body: "", createdAt: new Date().toISOString(), error: t.unreachable },
      ]);
    } finally {
      setBusy(false);
      areaRef.current?.focus();
    }
  }

  const started = messages.length > 0;

  return (
    <section aria-label="Heidi" className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.explanationsIn}</p>
          {byok.ready && byok.config && (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-caps text-ok hover:text-fg-primary"
            >
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
              {byok.config.model}
            </button>
          )}
        </div>
        {started && (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setInput("");
              areaRef.current?.focus();
            }}
            className="min-h-9 text-sm text-link underline underline-offset-4 hover:text-accent"
          >
            {t.newChat}
          </button>
        )}
      </div>

      {/* Before anything is said there is no transcript to show, so the panel
          is the intro; once a conversation exists it becomes the transcript
          and the intro is gone. Rendering an empty bordered box and calling it
          a conversation is what pushed the input below the fold. */}
      <div
        className="flex flex-col gap-4 rounded-control border border-border-strong bg-surface-raised p-3 sm:p-4"
        aria-live="polite"
      >
        {!started && <Intro t={t} />}

        {messages.map((m) =>
          m.authorId === LEARNER_ID ? (
            <Mine key={m.id} body={m.body} label={t.you} />
          ) : (
            <Theirs
              key={m.id}
              message={m}
              t={t}
              context={askedBefore(messages, m.id)}
              onRetry={() => void send(lastOwnMessage(messages) ?? "", true)}
            />
          ),
        )}

        {busy && (
          <p role="status" className="flex items-center gap-2 text-sm text-fg-muted">
            <span className="inline-flex gap-1" aria-hidden="true">
              <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
            </span>
            {t.thinking}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form
        // Sticky only once there IS a transcript to scroll past. In the empty
        // state there is nothing to follow, and sticking pinned the composer
        // over the intro panel — clipping its last line behind the input.
        className={`z-10 mt-3 bg-surface-page pb-1 pt-1 ${started ? "sticky bottom-0" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        {attached.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2" aria-label={dict.model.imagesLabel}>
            {attached.map((src, i) => (
              <li key={src.slice(-24)} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- a
                    client-side data URL; next/image optimises remote files and
                    would only add a round trip here. */}
                <img
                  src={src}
                  alt=""
                  className="h-16 w-16 rounded-control border border-border-strong object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAttached((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={dict.model.remove}
                  className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border-strong bg-surface-raised text-xs text-fg-secondary hover:text-accent"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {attachError && (
          <p role="alert" className="mb-2 px-1 text-sm text-accent">
            {attachError}
          </p>
        )}

        <div
          className="flex items-end gap-2 rounded-control border border-border-strong bg-surface-raised p-2 focus-within:border-accent"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const files = imagesFromClipboard(e.dataTransfer);
            if (files.length > 0) {
              e.preventDefault();
              void accept(files);
            }
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            {t.placeholder}
          </label>
          <textarea
            id="chat-input"
            ref={areaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends on a keyboard; Shift+Enter is a newline. On a phone
              // there is no Shift, so the button is the only send — which is why
              // it is always visible rather than appearing on input.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send(input);
              }
            }}
            onPaste={(e) => {
              // How a screenshot actually arrives: Cmd+V straight into the box.
              const files = imagesFromClipboard(e.clipboardData);
              if (files.length > 0) {
                e.preventDefault();
                void accept(files);
              }
            }}
            rows={1}
            maxLength={2000}
            // Short and visible; the full sentence is the accessible label
            // above and the intro copy beside it. It was all three at once,
            // which on a phone wrapped the composer into an unreadable stub.
            placeholder={t.composer}
            className="max-h-[200px] min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-base leading-relaxed text-fg-primary placeholder:text-fg-muted focus:outline-none"
          />

          {/* Always visible, never disabled. Without a vision model it opens
              the explanation instead of doing nothing — a greyed-out button
              with a tooltip teaches nobody why. */}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              void accept(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => (byok.canSee ? fileRef.current?.click() : setSheetOpen(true))}
            aria-label={byok.canSee ? dict.model.attach : dict.model.attachNeedsKey}
            title={byok.canSee ? dict.model.attach : dict.model.attachNeedsKey}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-border-strong text-fg-secondary transition-colors hover:text-fg-primary"
          >
            <ClipIcon />
          </button>

          {dictation.supported && (
            <button
              type="button"
              onClick={dictation.toggle}
              disabled={dictation.transcribing}
              aria-label={dictation.listening ? t.micStop : t.mic}
              aria-pressed={dictation.listening}
              aria-busy={dictation.transcribing}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border transition-colors disabled:opacity-50 ${
                dictation.listening
                  ? "border-accent bg-accent text-on-accent"
                  : "border-border-strong text-fg-secondary hover:text-fg-primary"
              }`}
            >
              <MicIcon />
            </button>
          )}

          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label={t.send}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-accent text-on-accent transition-colors disabled:bg-surface-sunk disabled:text-fg-muted"
          >
            <SendIcon />
          </button>
        </div>

        {(dictation.listening || dictation.transcribing) && (
          <p role="status" className="mt-1 px-1 font-mono text-[11px] uppercase tracking-caps text-accent">
            {dictation.transcribing ? t.micTranscribing : t.micListening}
          </p>
        )}
        {dictation.problem && (
          <p role="alert" className="mt-1 px-1 text-sm text-fg-muted">
            {t.micProblem[dictation.problem]}
          </p>
        )}
      </form>

      {!started && <Examples t={t} onPick={(ex) => void send(ex)} />}

      {sheetOpen && (
        <ModelSheet
          t={dict.model}
          current={byok.config}
          onSave={byok.save}
          onClear={byok.clear}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </section>
  );
}

/** The last thing the learner said, so a failed turn can be retried as-is. */
function lastOwnMessage(messages: ChatMessage[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].authorId === LEARNER_ID) return messages[i].body;
  }
  return undefined;
}

/**
 * The learner's line immediately before a given reply.
 *
 * Not `lastOwnMessage`: that walks from the end and would tag every kept word
 * in a long thread with the most recent question rather than the one it
 * actually answers.
 */
function askedBefore(messages: ChatMessage[], replyId: string): string | undefined {
  const at = messages.findIndex((m) => m.id === replyId);
  if (at < 0) return undefined;
  for (let i = at - 1; i >= 0; i--) {
    if (messages[i].authorId === LEARNER_ID) return messages[i].body;
  }
  return undefined;
}

/**
 * Keep a word, or let go of one.
 *
 * The gloss is the one thing Heidi produces that is worth carrying away — and
 * until now it was drawn once and thrown away on reload, so looking the same
 * word up on Tuesday and on Friday accumulated nothing. One tap, no account,
 * stored in this browser only.
 *
 * A toggle rather than a one-way save: the second tap on a word you did not
 * mean to keep is the only way back, and hiding it would make the list a
 * place things go in and never leave.
 */
function KeepWord({
  gloss,
  t,
  context,
}: {
  gloss: Gloss;
  t: Dictionary["chat"];
  context?: string;
}) {
  const saved = useSaved();
  // The bridge form is what makes a word reviewable. `standard` is the
  // bridge-language equivalent; `english` is the explanation in the reader's
  // language, which is the honest fallback when there is no single equivalent.
  const bridge = gloss.standard?.trim() || gloss.english?.trim() || "";
  const kept = saved.isSaved(gloss.form);

  // Before the client has read storage every word would claim to be unkept,
  // and a control that flips under the reader's finger is worse than one that
  // arrives a moment late.
  if (!saved.ready || !bridge) return null;

  return (
    <button
      type="button"
      onClick={() => (kept ? saved.forget(gloss.form) : saved.save({ target: gloss.form, bridge, context }))}
      aria-pressed={kept}
      aria-label={`${kept ? t.savedWord : t.saveWord}: ${gloss.form}`}
      title={kept ? t.savedWord : t.saveWord}
      className={`inline-flex h-6 w-6 shrink-0 translate-y-0.5 items-center justify-center rounded-control border text-xs transition-colors ${
        kept
          ? "border-accent bg-accent text-on-accent"
          : "border-border-subtle text-fg-muted hover:border-border-strong hover:text-fg-primary"
      }`}
    >
      <span aria-hidden="true">{kept ? "✓" : "+"}</span>
    </button>
  );
}

/** Drop the failed reply so a retry replaces it rather than stacking under it. */
function dropTrailingFailure(messages: ChatMessage[]): ChatMessage[] {
  const last = messages[messages.length - 1];
  return last?.error ? messages.slice(0, -1) : messages;
}

/** What the panel says before there is a conversation in it. */
function Intro({ t }: { t: Dictionary["chat"] }) {
  return (
    <div className="py-2">
      <h2 className="font-heading text-xl font-semibold leading-tight tracking-display text-fg-primary">
        {t.emptyTitle}
      </h2>
      <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.emptyBody}</p>
    </div>
  );
}

/**
 * Three things worth pasting, BELOW the input rather than above it.
 *
 * They used to sit inside the empty panel, between the intro and the
 * composer, which put the one control the whole page exists for about 700px
 * down a phone screen — you had to scroll past three examples of the problem
 * to reach the thing that solves it. Examples are a prompt for someone who
 * has nothing to paste; someone who does should meet the box first.
 */
function Examples({ t, onPick }: { t: Dictionary["chat"]; onPick: (s: string) => void }) {
  return (
    <div className="mt-3">
      <h2 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.suggestionsTitle}</h2>
      <ul className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {t.examples.map((ex) => (
          <li key={ex} className="sm:max-w-[22rem]">
            <button
              type="button"
              onClick={() => onPick(ex)}
              className="h-full w-full rounded-control border border-border-subtle bg-surface-page px-3 py-2.5 text-left text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary"
            >
              {ex}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Mine({ body, label }: { body: string; label: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="mb-1 font-mono text-[10px] uppercase tracking-caps text-fg-muted">{label}</span>
      <p className="max-w-[85%] whitespace-pre-wrap rounded-control bg-surface-sunk px-3 py-2 text-base leading-relaxed text-fg-primary">
        {body}
      </p>
    </div>
  );
}

function Theirs({
  message,
  t,
  onRetry,
  context,
}: {
  message: ChatMessage;
  t: Dictionary["chat"];
  onRetry: () => void;
  /** The learner's line this answers — kept alongside a word, because a word
   *  remembered with its sentence is remembered, and one on a flashcard is a
   *  word you can recognise on a flashcard. */
  context?: string;
}) {
  if (message.error) {
    return (
      <div className="rounded-control border border-accent bg-accent-tint px-3 py-2">
        <p role="alert" className="text-base text-fg-primary">
          {message.error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 min-h-9 text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  const a = message.answer;
  if (!a) return null;

  return (
    <article className="flex flex-col items-start">
      <span className="mb-1 font-mono text-[10px] uppercase tracking-caps text-accent">Heidi</span>
      <div className="w-full max-w-[92%] rounded-control border border-border-subtle bg-surface-page p-3">
        <p className="text-base leading-relaxed text-fg-primary">{a.text}</p>

        {a.dialect && (
          <div className="mt-3 rounded-control border border-border-subtle bg-surface-raised p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{t.sendThis}</span>
              <Copy text={a.dialect} t={t} />
            </div>
            <p className="mt-1 text-lg leading-relaxed text-dialect">{a.dialect}</p>
            {a.dialectClean === false && (
              <p className="mt-1 font-mono text-[11px] text-accent">
                {t.flagged} {a.dialectFlags?.join(", ")}
              </p>
            )}
          </div>
        )}

        {a.toneNote && (
          <p className="mt-2 text-sm text-fg-secondary">
            {a.tone && <span className="font-medium text-fg-primary">{a.tone}</span>}
            {a.tone ? " — " : ""}
            {a.toneNote}
          </p>
        )}

        {a.glosses.length > 0 && (
          <div className="mt-3 border-t border-border-subtle pt-3">
            <h3 className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{t.glossTitle}</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {a.glosses.map((g) => (
                <li key={g.form} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <KeepWord gloss={g} t={t} context={context} />
                  <span className="font-mono text-sm font-medium text-dialect">{g.form}</span>
                  {g.standard && <span className="font-mono text-xs text-fg-muted">{g.standard}</span>}
                  <span className="text-sm text-fg-secondary">{g.english}</span>
                  {g.rule && (
                    <span className="rounded-control bg-surface-sunk px-1.5 font-mono text-[10px] text-fg-muted">
                      {g.rule}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {a.suggestions.length > 0 && (
          <div className="mt-3 border-t border-border-subtle pt-3">
            <h3 className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{t.suggestionsTitle}</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {a.suggestions.map((s) => (
                <li key={`${s.label}-${s.text}`} className="rounded-control border border-border-subtle p-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{s.label}</span>
                    <Copy text={s.text} t={t} />
                  </div>
                  <p className="mt-0.5 text-base leading-relaxed text-dialect">{s.text}</p>
                  {s.english && <p className="text-sm text-fg-secondary">{s.english}</p>}
                  {!s.clean && (
                    <p className="mt-1 font-mono text-[11px] text-accent">
                      {t.flagged} {s.flags.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {a.note && <p className="mt-3 text-sm text-fg-muted">{a.note}</p>}

        <p className="mt-3 border-t border-border-subtle pt-2 font-mono text-[10px] text-fg-muted">
          {t.checkedNote} · {a.model}
        </p>
      </div>
    </article>
  );
}

function Copy({ text, t }: { text: string; t: Dictionary["chat"] }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          setDone(false);
        }
      }}
      className="min-h-9 shrink-0 text-sm text-link underline underline-offset-4 hover:text-accent"
    >
      {done ? t.copied : t.copy}
    </button>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-fg-muted"
      style={{ animationDelay: delay }}
    />
  );
}

function ClipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8-8a3.5 3.5 0 1 1 5 5l-8 8a2 2 0 1 1-3-3l7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
