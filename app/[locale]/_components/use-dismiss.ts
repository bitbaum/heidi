"use client";

import { useEffect, type RefObject } from "react";
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
}: {
  open: boolean;
  onDismiss: () => void;
  containerRef: RefObject<HTMLElement | null>;
  focusRef?: RefObject<HTMLElement | null>;
  onPointerOutside?: boolean;
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
   */
  useEffect(() => {
    if (open) onDismiss();
    // Only `pathname`. Depending on `open` would close it the instant it opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}
