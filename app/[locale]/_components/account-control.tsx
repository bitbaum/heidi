import Link from "next/link";
import { auth, authEnabled, signIn, signOut } from "@/lib/auth";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { accountMenu, href } from "@/lib/i18n/routes";
import { AccountMenu } from "./account-menu";

/**
 * Sign in, or a way into your own space.
 *
 * A server component using server actions, so signing in and out need no
 * client JavaScript at all — which matters here because this is the one
 * control that must work on a bad phone connection on a tram. Signed in, the
 * menu around it is a client component and the sign-out form is passed into it
 * as a slot: a client component cannot render a server component as a child,
 * but it can render one it was handed.
 *
 * When OrangeCat is not configured the control renders nothing rather than a
 * button that dead-ends at the code exchange.
 *
 * WHERE IT RENDERS, AND WHY THAT IS A PROP.
 *
 * Signed in, the avatar menu belongs in the top-right of the bar at EVERY
 * width. It used to appear there only from `lg` up and hide inside the mobile
 * menu sheet below that, which is defensible on a crowded bar and was wrong
 * anyway: "log out" is the one control people look for without being told
 * where it is, and on a phone there was nothing in the corner at all.
 *
 * Signed out it stays in the sheet on a phone, and that is not inconsistency.
 * A signed-out bar would have to carry a gear AND a full-width "sign in with
 * OrangeCat" button beside the wordmark, the language switcher and the menu —
 * five controls that do not fit in 320px, which is the measurement the old
 * comment here was made from. An avatar is 44px and fits.
 *
 * So the caller says which slot this is, and each state answers for itself:
 * exactly one of the two renders anything, and there is never a second copy of
 * the dropdown in the document.
 */
export async function AccountControl({
  locale,
  dict,
  placement,
}: {
  locale: Locale;
  dict: Dictionary;
  /** `bar` is the top-right corner; `sheet` is the mobile menu panel. */
  placement: "bar" | "sheet";
}) {
  if (!authEnabled) return null;

  const session = await auth();

  if (!session?.actorId) {
    // Signed out: the sheet owns it on a phone, the bar from `lg` up. Two
    // slots, one visible at a time, decided in CSS because the server cannot
    // know the viewport.
    // Sign-in is in the BAR at every width now — see `SignInCorner`. The sheet
    // keeps only what does not fit in a phone's bar: the settings link.
    if (placement === "bar") return <SignInCorner locale={locale} dict={dict} />;
    return <SettingsInSheet locale={locale} dict={dict} />;
  }

  // Signed in: the bar, always. Nothing in the sheet, so there is no second
  // dropdown sharing this one's ids.
  if (placement === "sheet") return null;

  return (
    <AccountMenu
      name={session.user?.name}
      email={session.user?.email}
      image={session.user?.image}
      t={{ account: dict.auth.account, signedInAs: dict.auth.signedInAs }}
      themeT={dict.settings.theme}
      items={accountMenu().map((entry) => ({
        key: entry.key,
        href: href(locale, entry.segment),
        label: dict.nav[entry.key],
        description: dict.auth.menu[entry.key],
      }))}
      signOutSlot={<SignOutButton locale={locale} dict={dict} />}
    />
  );
}

/**
 * Sign-in, in the corner, at every width.
 *
 * IT USED TO VANISH BELOW 1024px. Signed out, the bar showed sign-in only from
 * `lg` up; on every phone AND every tablet it lived inside the menu sheet, one
 * tap and a scroll away from anyone looking for it — while a signed-in reader
 * had their avatar in the corner at every width. Reported from a phone: "log in
 * log out should be easier on the mobile version".
 *
 * The old reason was a real measurement — a gear plus a labelled button plus
 * the wordmark, the language switcher and the menu do not fit in 320px — and
 * the answer was a SMALLER control, not a hidden one. Below `lg` this is a
 * 44px person icon in exactly the slot the avatar takes once you are signed in:
 * the universal account affordance, and the same place either way. From `lg`
 * it is the labelled button beside the settings gear, as before.
 *
 * The icon carries its name (`aria-label`, and `title` for a pointer), so it is
 * never announced as just "button".
 */
function SignInCorner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        prefetch={false}
        href={href(locale, "settings")}
        aria-label={dict.nav.settings}
        title={dict.nav.settings}
        className="hidden h-11 w-11 items-center justify-center rounded-control border border-border-strong text-fg-secondary transition-colors hover:text-fg-primary lg:inline-flex"
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
          aria-label={dict.auth.signIn}
          title={dict.auth.signIn}
          className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-control border border-border-strong text-sm text-fg-primary transition-colors hover:bg-surface-sunk lg:px-3"
        >
          <PersonIcon />
          <span className="sr-only lg:not-sr-only">{dict.auth.signIn}</span>
        </button>
      </form>
    </div>
  );
}

/**
 * Settings, in the phone menu.
 *
 * Settings is reachable WITHOUT an account: language and the model key are
 * device settings, not account settings, and hiding them behind a sign-in
 * would gate the two things anyone can actually change. Below `lg` there is no
 * room for the gear in the bar beside the sign-in icon, so it lives here —
 * labelled, which the gear alone never was.
 */
function SettingsInSheet({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <Link
      prefetch={false}
      href={href(locale, "settings")}
      className="inline-flex min-h-11 items-center gap-2 text-base text-fg-primary lg:hidden"
    >
      <GearIcon />
      {dict.nav.settings}
    </Link>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
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

/** The sign-out button. In the account menu, and on the portal page itself. */
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
