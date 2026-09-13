import Link from "next/link";
import { auth, authEnabled, signIn, signOut } from "@/lib/auth";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";

/**
 * Sign in, or a way back to your own space.
 *
 * A server component using server actions, so signing in and out need no
 * client JavaScript at all — which matters here because this is the one
 * control that must work on a bad phone connection on a tram.
 *
 * When OrangeCat is not configured the control renders nothing rather than a
 * button that dead-ends at the code exchange.
 */
export async function AccountControl({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  if (!authEnabled) return null;

  const session = await auth();

  if (!session?.actorId) {
    return (
      <div className="flex items-center gap-2">
        {/* Settings is reachable WITHOUT an account: language and the model key
            are device settings, not account settings, and hiding them behind a
            sign-in would gate the two things anyone can actually change. */}
        <Link
      prefetch={false}
          href={href(locale, "settings")}
          aria-label={dict.nav.settings}
          title={dict.nav.settings}
          className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-border-strong text-fg-secondary transition-colors hover:text-fg-primary"
        >
          <GearIcon />
        </Link>
        <form
        action={async () => {
          "use server";
          await signIn("orangecat", { redirectTo: href(locale, "portal") });
        }}
      >
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-3 text-sm text-fg-secondary transition-colors hover:border-accent hover:text-fg-primary"
        >
          {dict.auth.signIn}
        </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
      prefetch={false}
        href={href(locale, "settings")}
        aria-label={dict.nav.settings}
        title={dict.nav.settings}
        className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-border-strong text-fg-secondary transition-colors hover:text-fg-primary"
      >
        <GearIcon />
      </Link>
    <Link
      prefetch={false}
      href={href(locale, "portal")}
      className="inline-flex min-h-11 items-center gap-2 rounded-control border border-border-strong px-3 text-sm text-fg-secondary transition-colors hover:border-accent hover:text-fg-primary"
    >
      <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-ok" />
      {dict.nav.portal}
    </Link>
    </div>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11.5 4a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9 2 2 0 1 1 0 4z" />
    </svg>
  );
}

/** The sign-out button, used on the portal page itself rather than the header. */
export async function SignOutButton({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  if (!authEnabled) return null;
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: href(locale, "") });
      }}
    >
      <button
        type="submit"
        className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
      >
        {dict.auth.signOut}
      </button>
    </form>
  );
}
