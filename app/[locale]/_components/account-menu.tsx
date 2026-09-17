"use client";

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";

import { useDismiss } from "./use-dismiss";
import { ThemeRow } from "./theme-control";

/**
 * The signed-in learner, as one control.
 *
 * WHAT IT REPLACES. The header carried two separate boxes — a gear icon and a
 * pill reading "Mein Bereich" with a green dot — sitting beside the language
 * switcher and, on a phone, a "MENÜ" button. Four bordered controls in a row,
 * none of which said whose account it was, and the green dot claimed a status
 * nothing measured. It read as leftover chrome rather than as a person's
 * account, which is exactly how it was described: it looks weird.
 *
 * One avatar that opens a menu is the convention every reader already knows,
 * and it buys the room back: two boxes become one, and the things that were
 * competing for space in the bar (settings, the portal, signing out) become a
 * list where each one can have a full-width label.
 *
 * A DISCLOSURE, NOT A `role="menu"`. The contents are links to pages and one
 * form that submits — destinations, not commands. `role="menu"` would tell a
 * screen reader otherwise and capture the arrow keys, which is a downgrade for
 * a list of four links. Escape, outside-pointer and navigation-closes all come
 * from `useDismiss`, which is the same primitive the nav panel and the
 * language switcher now use.
 *
 * NO AVATAR IMAGE BY DEFAULT, and that is deliberate rather than unfinished.
 * OrangeCat's `profile` scope may carry a picture URL, and rendering it would
 * make every page load fetch a third-party image before the header settles.
 * Initials in a box are instant, always available, and — in a palette that is
 * two colours and a hard edge — look like they belong. The image is used when
 * OrangeCat sent one, because a person who set a picture expects to see it.
 */
export function AccountMenu({
  name,
  email,
  image,
  items,
  t,
  themeT,
  /**
   * The sign-out form, rendered on the SERVER and passed in.
   *
   * It is a server action, so signing out costs no client JavaScript — which
   * matters for the same reason the sign-in button is a form: this is the one
   * control that has to work on a bad connection on a tram.
   */
  signOutSlot,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  items: ReadonlyArray<{ key: string; href: string; label: string; description?: string }>;
  t: { account: string; signedInAs: string };
  /** Appearance wording, from `settings.theme` — the same strings the settings page uses. */
  themeT: { label: string; system: string; light: string; dark: string };
  signOutSlot: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(() => setOpen(false), []);
  useDismiss({ open, onDismiss: dismiss, containerRef: wrap, focusRef: button });

  const label = name?.trim() || email?.trim() || t.account;

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        // The name is the accessible name. "User menu" would be the same four
        // words on every account, and the one thing a screen reader user
        // cannot see here is WHOSE account it is.
        aria-label={`${t.account}: ${label}`}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-control border border-border-strong px-1.5 text-fg-secondary transition-colors hover:text-fg-primary"
      >
        <Avatar name={label} image={image} />
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

      {/* Mounted only when open. A hidden link still takes a Tab stop, so a
          CSS-hidden menu would put four invisible stops in the header. */}
      {open && (
        <div
          id={id}
          className="absolute right-0 top-full z-40 mt-1 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-control border border-border-strong bg-surface-raised shadow-lg"
        >
          {/* Who this is. First, because it is the question the control asks. */}
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{t.signedInAs}</p>
            <p className="mt-1 truncate text-sm font-medium text-fg-primary">{label}</p>
            {/* Only when it adds something. With no display name the label IS
                the email, and printing it twice is noise. */}
            {email && email !== label && <p className="truncate text-xs text-fg-muted">{email}</p>}
          </div>

          <ul>
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  prefetch={false}
                  onClick={dismiss}
                  className="flex min-h-12 flex-col justify-center gap-0.5 border-b border-border-subtle px-4 py-2.5 transition-colors hover:bg-surface-sunk"
                >
                  <span className="text-sm font-medium text-fg-primary">{item.label}</span>
                  {item.description && <span className="text-xs text-fg-muted">{item.description}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* Appearance IN the menu, not only in settings.

              This is the pattern both of the products next door settle on, and
              the reason is the phone: there the header is a wordmark, a
              language button and this menu, so the menu is the only chrome a
              reader can reach without navigating away from what they were
              doing. It changes the page in place and never closes the menu —
              you pick a theme by looking at the result. */}
          <div className="border-b border-border-subtle px-4 py-3">
            <ThemeRow t={themeT} />
          </div>

          <div className="px-4 py-3">{signOutSlot}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Initials in a box, or the picture OrangeCat holds.
 *
 * A square with the product's own 2px radius rather than a circle: the whole
 * palette is a cow — two values and hard edges — and a circular avatar is the
 * one shape that would announce it came from somewhere else.
 */
function Avatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return (
      // A plain <img>, not next/image. This is a third-party URL of unknown
      // dimensions; routing it through the optimiser means our server fetches
      // an arbitrary host on render, which is the same request-forgery shape
      // the BYOK provider allowlist exists to avoid.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 rounded-control object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-7 w-7 items-center justify-center rounded-control bg-fg-primary font-mono text-[11px] font-semibold uppercase text-surface-page"
    >
      {initials(name)}
    </span>
  );
}

/**
 * At most two letters, from the start of the first two words.
 *
 * `Array.from` rather than `[0]`: a name beginning with an emoji or any
 * astral-plane character would otherwise be sliced through the middle of a
 * surrogate pair and render as a replacement box.
 */
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2);
  if (words.length === 0) return "?";
  return words.map((w) => Array.from(w)[0] ?? "").join("");
}
