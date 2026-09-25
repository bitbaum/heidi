"use client";

import { useCallback, useId, useRef, useState } from "react";

import { useDismiss } from "./use-dismiss";

/**
 * A nav item that opens a panel.
 *
 * WHY THIS IS NOT A LIBRARY. The fleet has no menu package — checked in
 * `fleet/registers/packages.json`, which lists nine and none of them is one —
 * and Heidi has no UI component dependencies at all. Adding the first one is a
 * commitment worth making for a hard problem and not for this one.
 *
 * The hard problem would be a MENUBAR: roving tabindex, type-ahead, arrow keys
 * moving between sibling menus, `role="menu"` semantics. Hand-rolling that is
 * how you ship something a keyboard user cannot operate, and a maintained
 * implementation beats mine every time.
 *
 * This is not that. It is a DISCLOSURE — one button, one region, `aria-expanded`
 * pointing at `aria-controls` — which is a short, well-specified pattern that
 * this header already implements correctly for its mobile menu. Links inside a
 * panel are links, and Tab through them is the behaviour people expect from a
 * site nav; `role="menu"` would actually make it WORSE by trapping arrow keys
 * and telling a screen reader these are commands rather than destinations.
 *
 * The three behaviours that are the whole job — Escape closes and returns
 * focus, a pointer outside closes, a navigation closes — now live in
 * `useDismiss`, because this file had them right and the language switcher
 * next door had them subtly wrong. One copy, and it is this one.
 */
export function NavPanel({
  label,
  current,
  children,
}: {
  label: string;
  /** True when the open page lives inside this group, so the trigger marks it. */
  current: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(() => setOpen(false), []);
  useDismiss({ open, onDismiss: dismiss, containerRef: wrapRef, focusRef: buttonRef });

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm transition-colors ${
          current
            ? "font-semibold text-fg-primary underline decoration-accent decoration-2 underline-offset-8"
            : "text-fg-secondary hover:text-fg-primary"
        }`}
      >
        {label}
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4.5 6 8.5 10 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Rendered only when open rather than hidden with CSS: the links inside
          are real links, and a hidden one still takes a Tab stop. */}
      {open && (
        <div
          id={id}
          onClick={() => setOpen(false)}
          className="absolute left-1/2 top-full z-40 mt-3 w-max max-w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-control border border-border-strong bg-surface-page p-5 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}
