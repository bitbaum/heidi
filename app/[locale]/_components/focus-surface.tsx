"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useDismiss } from "./use-dismiss";
import { useKeyboardViewport } from "./use-keyboard-viewport";

/**
 * The home page's chat, full screen on a phone once the learner writes;
 * minimising puts it back into the page.
 *
 * WHY. A conversation that grows inside a page pushes the page around: the
 * composer drifts down with every answer and the reader scrolls past the chat
 * to the footer and back. Inside a fixed layer with its own scroll the
 * composer sits at the bottom of the screen, like a messaging app, and
 * minimising is one tap back to the site with the conversation intact — the
 * children are the same tree either way, only the frame changes.
 *
 * Exercises used to run in this too. They have their own screen now
 * (`session/frame.tsx`), because a drill has no page it needs to return into.
 *
 * BELOW `lg` ONLY. On a wide screen the page has room beside the chat.
 *
 * CONTROLLED. The chat decides when it wants the screen: a conversation
 * restored from yesterday sits in the page, and takes the screen when the
 * learner writes (`chat.tsx`).
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
  t,
  minimized,
  onMinimizedChange,
  children,
}: {
  /** There is a conversation, so on a phone it may take the screen. */
  open: boolean;
  /** In the header of the full-screen layer, and on the bar that brings it back. */
  title: string;
  t: Dictionary["focus"];
  minimized: boolean;
  onMinimizedChange: (minimized: boolean) => void;
  children: React.ReactNode;
}) {
  const compact = useCompact();
  const ref = useRef<HTMLDivElement>(null);
  const full = compact && open && !minimized;

  // Back in the page after minimising, the reader lands where the chat now
  // sits, not wherever the page happened to be scrolled.
  const wasFull = useRef(full);
  useEffect(() => {
    if (wasFull.current && !full) ref.current?.scrollIntoView({ block: "start" });
    wasFull.current = full;
  }, [full]);

  // Escape minimises, as it closes the dock. A tap outside cannot: there is
  // no page showing.
  const minimize = useCallback(() => onMinimizedChange(true), [onMinimizedChange]);
  useDismiss({ open: full, onDismiss: minimize, containerRef: ref, onPointerOutside: false, onNavigate: false });

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
          onClick={() => onMinimizedChange(false)}
          className="mb-3 flex min-h-11 w-full max-w-measure items-center justify-between gap-3 rounded-control border border-border-strong bg-surface-raised px-4 text-left text-sm"
        >
          <span className="min-w-0 truncate text-fg-secondary">{title}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-fg-primary">
            <ExpandIcon />
            {t.expand}
          </span>
        </button>
      )}

      {/* A column that fills the screen, so the chat can put its box at the
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
