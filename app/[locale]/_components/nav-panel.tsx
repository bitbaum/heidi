"use client";

import { useEffect, useId, useRef, useState } from "react";

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
 * Three behaviours are the whole job, and each is a bug if missing:
 *
 *   Escape closes it and returns focus to the button, or a keyboard user is
 *     stranded inside a panel they cannot dismiss.
 *   A click outside closes it, because every other menu on the web does.
 *   Moving to another page closes it — a panel surviving a navigation looks
 *     like the new page rendered wrongly.
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

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Back to the button. Leaving focus on a removed panel drops it to the
      // top of the document, and the next Tab starts the page over.
      buttonRef.current?.focus();
    }

    function onPointer(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    // Capture: a link inside the panel navigates on click, and the listener
    // must not race the navigation to decide whether it was outside.
    document.addEventListener("pointerdown", onPointer, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm transition-colors ${
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
