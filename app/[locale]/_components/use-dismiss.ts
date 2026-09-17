"use client";

import { useEffect, useRef, type RefObject } from "react";
import { usePathname } from "next/navigation";

/**
 * Closing a thing that opened over the page.
 *
 * WHY THIS EXISTS. It was written twice, and the two copies disagreed — which
 * is the whole argument for a third file rather than a third copy.
 *
 *   `nav-panel.tsx`       Escape closed it AND returned focus to the trigger;
 *                         the outside-click listener ran in the CAPTURE phase.
 *   `language-switcher.tsx`  Escape closed it and dropped focus to the top of
 *                         the document; the listener ran on `mousedown` in the
 *                         bubble phase.
 *
 * Both looked right in review. Only one of them is: a keyboard user who
 * dismisses the language menu with Escape loses their place in the page, and
 * their next Tab starts from the skip link. Nothing failed, nothing was
 * reported, and the defect was invisible to everyone who used a mouse.
 *
 * Two more surfaces were about to want the same three behaviours — the account
 * menu and the chat dock — so this is the point where copying stops. The
 * correct version is the one that survived contact with a keyboard, and it is
 * now the only version.
 *
 * THE THREE BEHAVIOURS, and why each is a bug when missing:
 *
 *   Escape closes and RESTORES FOCUS to the trigger. Without the restore, the
 *     panel is unmounted from under the focused element and focus falls to
 *     `document.body`.
 *   A pointer outside closes it, because every other menu on the web does.
 *   A navigation closes it. A panel that survives a route change reads as the
 *     new page having rendered wrongly — and `nav-panel`'s own doc comment
 *     claimed this behaviour while implementing only a click handler on the
 *     panel, so a browser Back left it open.
 *
 * Deliberately NOT here: focus trapping, `role="menu"`, roving tabindex and
 * type-ahead. Those belong to a MENUBAR, they are long and easy to get wrong,
 * and a maintained library beats a hand-rolled one every time. Everything
 * using this hook is a DISCLOSURE — one trigger, one region, `aria-expanded`
 * pointing at `aria-controls` — where the contents are ordinary links and
 * buttons and Tab is exactly the behaviour people expect.
 */
export function useDismiss({
  open,
  onDismiss,
  /** The region plus its trigger. A pointer inside this does not dismiss. */
  containerRef,
  /** Where focus goes when Escape closes it. Usually the trigger. */
  focusRef,
  /**
   * Whether a pointer outside dismisses it. True for a menu, and FALSE for the
   * chat dock: a panel you are mid-sentence in must not vanish because you
   * clicked the page to read the word you were asking about.
   */
  onPointerOutside = true,
  /**
   * Whether a navigation dismisses it. True for a menu — a panel that survives
   * a route change reads as the new page having rendered wrongly.
   *
   * FALSE for the chat dock, which lives in the root layout and is meant to
   * outlive the page under it. Closing it on navigation also threw away an
   * answer that was still in flight: `useConversation` has no abort handling,
   * so a reply arriving after the panel unmounted was never written to the
   * draft store, and reopening showed the question with no answer.
   */
  onNavigate = true,
}: {
  open: boolean;
  onDismiss: () => void;
  containerRef: RefObject<HTMLElement | null>;
  focusRef?: RefObject<HTMLElement | null>;
  onPointerOutside?: boolean;
  onNavigate?: boolean;
}): void {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      onDismiss();
      focusRef?.current?.focus();
    }

    function onPointer(event: Event) {
      if (!containerRef.current?.contains(event.target as Node)) onDismiss();
    }

    document.addEventListener("keydown", onKey);
    /**
     * `pointerdown`, in the CAPTURE phase, and both halves are load-bearing.
     *
     * `pointerdown` rather than `mousedown` so a touch dismisses it too —
     * mobile Safari synthesises a delayed `mousedown`, and in the gap the menu
     * is still open under the finger.
     *
     * Capture, because a link inside a panel navigates on click: a bubbling
     * listener races the navigation to decide whether the press was outside,
     * and loses on a slow frame.
     */
    if (onPointerOutside) document.addEventListener("pointerdown", onPointer, true);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, [open, onDismiss, containerRef, focusRef, onPointerOutside]);

  /**
   * Separate from the listeners on purpose: this one fires on the RENDER that
   * followed a navigation, not on an event. Folding it into the effect above
   * would re-register both listeners every time the path changed.
   *
   * No focus restore here — the page underneath has changed, and pulling focus
   * back to a trigger the reader has navigated away from would be worse than
   * leaving it where the router put it.
   *
   * IT COMPARES THE PATH, rather than counting runs, and that distinction was
   * paid for twice.
   *
   * React runs an effect with a dependency array on the INITIAL commit as well
   * as on changes. So the naive version fires once on mount — and for a caller
   * that is already open when it mounts, that means dismissing itself
   * immediately. The model sheet is exactly that caller: it exists only while
   * open, so it passes `open: true`. Pressing "connect your own model" opened
   * a sheet that closed in the same tick, which made BYOK — and with it every
   * picture — unreachable. No test caught it, because it needs a browser.
   *
   * The obvious repair is a "skip the first run" ref, and it is WRONG HERE:
   * `reactStrictMode` is on, so in development React invokes every effect
   * twice while the ref persists across both. The guard is spent on the first
   * invocation and the second closes the sheet anyway. Measured in the
   * browser — the sheet still refused to open after that "fix".
   *
   * Storing the path and comparing it asks the question this effect actually
   * means: not "is this the first run?" but "have we navigated?". Mount and
   * StrictMode's replay both see the same path and do nothing; a real
   * navigation differs and dismisses.
   */
  const seenPath = useRef(pathname);
  useEffect(() => {
    if (seenPath.current === pathname) return;
    seenPath.current = pathname;
    if (open && onNavigate) onDismiss();
    // Only `pathname`. Depending on `open` would close it the instant it opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}
