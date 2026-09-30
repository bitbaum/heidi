"use client";

import { createContext, useContext, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Flow, Mode } from "@/lib/domain/practice/mode";
import { parseScope, scopeQuery, type Scope } from "@/lib/domain/practice/scope";
import { sessionPath } from "@/lib/domain/practice/sitting";
import { openedFrom, rememberOrigin, stepBack, takeReturn } from "./origin";

/**
 * Where the open session screen closes to. Null outside one.
 *
 * A "practise this topic" link under an explanation is INSIDE a session: it
 * changes what is being practised and must keep the way back to the page the
 * learner started from, not make the session its own way back.
 */
export const SessionBack = createContext<string | null>(null);

/**
 * Into a session, in one tap, from wherever the learner is.
 *
 * Every "practise" on the site is this, not a link to `/practice`: that page
 * asked for a second tap on a button below the fold. The page it is pressed
 * on is the one the session closes back to. Inside a session it replaces the
 * sitting instead, so closing still goes to where the learner began.
 */
export function SessionLink({
  locale,
  scope,
  mode,
  flow,
  className,
  onClick,
  children,
}: {
  locale: string;
  scope: Scope;
  mode?: Mode;
  flow?: Flow;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const within = useContext(SessionBack);
  const link = (
    <Link
      href={sessionPath(locale, { scope, mode, flow }, within ?? pathname)}
      replace={within !== null}
      prefetch={false}
      onClick={() => {
        if (within === null) rememberOrigin();
        onClick?.();
      }}
      className={className}
    >
      {children}
    </Link>
  );
  if (within !== null && pathname.endsWith("/practice/session")) {
    return <UnlessPractising scope={scope}>{link}</UnlessPractising>;
  }
  return link;
}

/**
 * Nothing, when the sitting open right now is already about `scope`: under
 * an explanation, "practise this topic" in a sitting on that topic would be a
 * tap that does nothing. Only rendered on the session route, which is
 * dynamic, so reading the query here costs no static rendering.
 */
function UnlessPractising({ scope, children }: { scope: Scope; children: React.ReactNode }) {
  const current = parseScope(Object.fromEntries(useSearchParams()));
  return scopeQuery(current) === scopeQuery(scope) ? null : children;
}

/**
 * Out of a session: back to the page and the place it was opened from.
 *
 * When this tab opened the session from that page, the close is a step back
 * in history (`origin.ts`), so the page returns as it was left. Otherwise —
 * a reload, a shared link — it is a plain link to the page.
 */
export function CloseLink({
  href,
  className,
  children,
  ...aria
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const router = useRouter();
  return (
    <Link
      href={href}
      replace
      className={className}
      onClick={(event) => {
        if (!openedFrom(href)) return;
        event.preventDefault();
        stepBack(() => router.back());
      }}
      {...aria}
    >
      {children}
    </Link>
  );
}

/**
 * Puts the page back where it was after a session closed onto it. Mounted
 * once, in the layout, because the page it restores is not the one that
 * closed.
 *
 * Twice, a frame apart: the session screen's body lock is lifted when it
 * unmounts, and until the page below has its full height the browser clamps
 * the offset to whatever fits.
 */
export function ReturnScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const y = takeReturn(pathname);
    if (y === null) return;
    requestAnimationFrame(() => {
      window.scrollTo(0, y);
      requestAnimationFrame(() => window.scrollTo(0, y));
    });
  }, [pathname]);
  return null;
}
