import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { METRICS, SECTIONS } from "@/lib/config/investors";
import { INVESTOR_COOKIE, investorPasswordConfigured, isInvestorPassword } from "@/lib/config/investor-gate";
import { Shell } from "../_components/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  // Never indexed. A gated room in a sitemap is a gated room with a sign on it.
  return { title: "Investors", robots: { index: false, follow: false } };
}

export const dynamic = "force-dynamic";

/**
 * The data room.
 *
 * IN ENGLISH, ON A SEVEN-LANGUAGE SITE, ON PURPOSE. The rest of the site is
 * translated because its readers are learners in Switzerland. This is one
 * document for one kind of conversation, and a pitch machine-translated seven
 * ways is seven documents nobody has checked. Only the chrome is localised.
 *
 * THE LOCK IS REAL BUT THE ROOM IS NOT A SAFE. The repository is public, so
 * everything below is readable by anyone who looks; the password stops the page
 * being wandered into, linked onward and indexed. `investors.ts` was written on
 * that assumption and contains nothing that would hurt if read by a stranger.
 */
export default async function InvestorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const jar = await cookies();
  const open = jar.get(INVESTOR_COOKIE)?.value === "1";

  if (!open) {
    return (
      <Shell>
        <div className="mx-auto max-w-md py-20">
          <h1 className="font-heading text-section font-semibold tracking-display text-fg-primary">
            {dict.nav.investors}
          </h1>

          {investorPasswordConfigured() ? (
            <form action={unlock} className="mt-6 flex flex-col gap-3">
              <input type="hidden" name="locale" value={locale} />
              <label htmlFor="investor-password" className="text-sm text-fg-secondary">
                Password
              </label>
              <input
                id="investor-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="min-h-11 rounded-control border border-border-strong bg-surface-raised px-3 text-base text-fg-primary focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-fg-primary px-5 text-sm font-medium text-surface-page transition-colors hover:bg-accent hover:text-on-accent"
              >
                Open
              </button>
            </form>
          ) : (
            /* No password set on this deployment. Closed, rather than open with
               a default — a default in a public repository is not a lock. */
            <p className="mt-6 text-base leading-relaxed text-fg-secondary">
              This room is not configured on this deployment. Write to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-link underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          )}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <p className="font-mono text-[11px] uppercase tracking-caps text-accent">Heidi</p>
        <h1 className="mt-3 max-w-[22ch] font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          Understanding the language spoken around you
        </h1>
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">
          Pre-revenue, open source, and honest about what is not built yet. Every claim on this page has a URL or a
          command beside it.
        </p>
      </header>

      {/* THE NUMBERS FIRST, INCLUDING THE EMPTY ONES. An investor finds out
          there are no customers either way; the only question is whether they
          hear it from us on the first screen or discover it on the third. */}
      <section className="border-t border-border-subtle py-10">
        <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((metric) => (
            <li key={metric.label}>
              <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">{metric.label}</p>
              <p className="mt-0.5 font-heading text-lg font-semibold tracking-display text-fg-primary">
                {metric.value}
              </p>
              <p className="text-xs text-fg-muted">{metric.verify}</p>
            </li>
          ))}
        </ul>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-20 border-t border-border-subtle py-10 sm:py-12">
          <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {section.title}
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="max-w-measure text-base leading-relaxed text-fg-secondary">
                {paragraph}
              </p>
            ))}
          </div>
          {section.links && (
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="text-sm text-link underline underline-offset-4 hover:text-accent"
                  >
                    {link.label} →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="border-t border-border-subtle py-10">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex min-h-11 items-center rounded-control border border-border-strong px-5 text-base font-medium text-fg-primary transition-colors hover:border-accent hover:text-accent"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="mt-4 text-sm text-fg-muted">
          <a href={href(locale, "")} className="underline underline-offset-4 hover:text-accent">
            Back to Heidi
          </a>
        </p>
      </section>
    </Shell>
  );
}

/**
 * Check the password and let them in.
 *
 * A server action, so the password is compared on the server and never reaches
 * the client bundle. The cookie is `httpOnly` for the same reason — a room a
 * script can unlock itself is not gated.
 */
async function unlock(formData: FormData) {
  "use server";

  const locale = String(formData.get("locale") ?? DEFAULT_LOCALE);
  const target = isLocale(locale) ? locale : DEFAULT_LOCALE;

  if (!isInvestorPassword(formData.get("password"))) {
    redirect(href(target, "investors"));
  }

  const jar = await cookies();
  jar.set(INVESTOR_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // A week. Long enough for a conversation, short enough that a laptop left
    // at a conference does not stay open indefinitely.
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(href(target, "investors"));
}
