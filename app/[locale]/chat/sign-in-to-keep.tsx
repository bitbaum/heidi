import { signIn } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";

/**
 * Sign in, and come back here.
 *
 * `redirectTo` is the chat rather than the portal, which is where the header's
 * control sends people. The difference matters: someone pressing this has a
 * conversation open and is being asked whether to keep it, so landing them on
 * a different page would answer the question by losing sight of it. Coming
 * back to `/chat` is what lets the adoption prompt appear over the very thread
 * they were reading.
 *
 * A server action, so it works with no client JavaScript.
 */
export function SignInToKeep({ locale, label }: { locale: Locale; label: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("orangecat", { redirectTo: href(locale, "chat") });
      }}
    >
      <button type="submit" className="text-sm text-link underline underline-offset-4 hover:text-accent">
        {label}
      </button>
    </form>
  );
}
