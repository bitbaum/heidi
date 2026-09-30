"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useDismiss } from "./use-dismiss";
import { useKeyboardViewport } from "./use-keyboard-viewport";

/**
 * Doing something on a phone gets the whole screen; minimising puts it back
 * into the page.
 *
 * WHY. Answering a question on a phone moved the page under the learner's
 * thumb. Above the question sit the streak card and the "what to work on"
 * panel, and both change height as answers come in; iOS Safari has no scroll
 * anchoring, so every change above pushed the question down. A shorter next
 * question made the page snap up instead. The learner scrolled back and forth
 * after every answer.
 *
 * Full screen fixes that by construction: inside a fixed layer with its own
 * scroll, nothing on the page can move what you are working on, and each new
 * question (`scrollKey`) starts at the top. It is also what an app does, and
 * minimising is one tap back to the site with the session intact — the
 * children are the same tree either way, only the frame changes.
 *
 * BELOW `lg` ONLY. On a wide screen the page has room beside the task and the
 * browser anchors scrolling itself; there a new question that begins above
 * the viewport is simply scrolled to, which is the part of the fix that
 * applies everywhere.
 *
 * The keyboard: the layer is sized by `--app-height`/`--app-top`, kept equal
 * to what the on-screen keyboard leaves visible — the same as the open dock,
 * and without its `pin`, so the page behind keeps its place for minimising.
 */

const COMPACT = "(max-width: 1023.98px)";

function subscribeCompact(onChange: () => void) {
  const media = window.matchMedia(COMPACT);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** True on a phone or a portrait tablet. False on the server. */
export function useCompact(): boolean {
  return useSyncExternalStore(subscribeCompact, () => window.matchMedia(COMPACT).matches, () => false);
}

export function FocusSurface({
  open,
  title,
  progress,
  t,
  scrollKey,
  gate,
  minimized: controlledMinimized,
  onMinimizedChange,
  children,
}: {
  /** The task is under way, so on a phone it takes the screen. */
  open: boolean;
  /** What is being done, in the header of the full-screen layer. */
  title: string;
  /** "Question 3 of 8": on the bar that brings a minimised task back. */
  progress?: string;
  t: Dictionary["focus"];
  /** Changes when a new question appears; the layer goes back to its top. */
  scrollKey?: string;
  /**
   * For a task that is ready before anyone asked for it (practice builds its
   * session on load): on a phone, a button that starts it full screen instead
   * of a question sitting half way down the page.
   */
  gate?: { label: string; onStart: () => void };
  /**
   * Held by the caller instead, for a task that decides for itself when it
   * wants the screen: a chat restored from yesterday sits in the page, and
   * takes the screen when the learner writes.
   */
  minimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
  children: React.ReactNode;
}) {
  const compact = useCompact();
  const [ownMinimized, setOwnMinimized] = useState(false);
  const minimized = controlledMinimized ?? ownMinimized;
  const setMinimized = onMinimizedChange ?? setOwnMinimized;
  const ref = useRef<HTMLDivElement>(null);

  // A task that opens again (another round) opens full screen again.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOwnMinimized(false);
  }

  const full = compact && open && !minimized;

  // A new question starts at its top, full screen or not.
  const lastKey = useRef(scrollKey);
  useEffect(() => {
    if (scrollKey === lastKey.current) return;
    lastKey.current = scrollKey;
    const el = ref.current;
    if (!el) return;
    if (full) {
      el.scrollTo({ top: 0 });
    } else if (el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ block: "start" });
    }
  }, [scrollKey, full]);

  // Back in the page — after minimising, or when the task ends — the reader
  // lands where it now sits, not wherever the page happened to be scrolled.
  const wasFull = useRef(full);
  useEffect(() => {
    if (wasFull.current && !full) ref.current?.scrollIntoView({ block: "start" });
    wasFull.current = full;
  }, [full]);

  // Escape minimises, as it closes the dock. A tap on the page cannot: there
  // is no page showing, and a tap inside is an answer.
  const minimize = useCallback(() => setMinimized(true), [setMinimized]);
  useDismiss({ open: full, onDismiss: minimize, containerRef: ref, onPointerOutside: false, onNavigate: false });

  if (compact && !open && gate) {
    return (
      <div className="max-w-measure rounded-control border border-border-strong bg-surface-raised p-5">
        <button
          type="button"
          onClick={gate.onStart}
          className="inline-flex min-h-12 items-center rounded-control bg-action px-6 font-medium text-on-action hover:opacity-90"
        >
          {gate.label} →
        </button>
      </div>
    );
  }

  const heading = progress ? `${title} · ${progress}` : title;

  return (
    <div
      ref={ref}
      data-focus={full ? "open" : undefined}
      className={
        full
          ? "fixed inset-x-0 top-[var(--app-top,0px)] z-50 flex h-[var(--app-height,100dvh)] flex-col overflow-y-auto overscroll-contain bg-surface-page"
          : "scroll-mt-anchor"
      }
    >
      {full && <KeyboardViewport />}
      {full && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border-subtle bg-surface-page px-4 py-1.5">
          {/* The title alone: the task shows its own progress right below. */}
          <p className="min-w-0 truncate font-mono text-caption uppercase tracking-caps text-fg-muted">{title}</p>
          <button
            type="button"
            onClick={minimize}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-control px-3 text-sm font-medium text-fg-primary transition-colors hover:bg-surface-raised"
          >
            <MinimizeIcon />
            {t.minimize}
          </button>
        </div>
      )}

      {compact && open && minimized && (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="mb-3 flex min-h-11 w-full max-w-measure items-center justify-between gap-3 rounded-control border border-border-strong bg-surface-raised px-4 text-left text-sm"
        >
          <span className="min-w-0 truncate text-fg-secondary">{heading}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-fg-primary">
            <ExpandIcon />
            {t.expand}
          </span>
        </button>
      )}

      {/* A column that fills the screen, so a chat can put its box at the
          bottom (`mt-auto`) the way a messaging app does. */}
      <div className={full ? "flex flex-1 flex-col px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" : undefined}>
        {children}
      </div>
    </div>
  );
}

/** The hook, mounted only while the layer is full screen. */
function KeyboardViewport() {
  useKeyboardViewport();
  return null;
}

function MinimizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
