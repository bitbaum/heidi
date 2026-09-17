import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n/locales";
import { NAV_ROUTES, href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";

/** A server component: nothing here needs to react to anything. */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-surface-raised">
      <div className="mx-auto w-full max-w-shell px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="font-heading text-xl font-semibold tracking-display text-fg-primary">Heidi</div>
            <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-fg-secondary">{dict.footer.tagline}</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {DISPLAY.endonym} · {DISPLAY.region}
            </p>
          </div>

          <nav aria-labelledby="footer-pages">
            <h2 id="footer-pages" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {dict.footer.sections}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {NAV_ROUTES.map((route) => (
                <li key={route.key}>
                  {/* No prefetch down here. Next prefetches every visible
                      Link, and the header already prefetched these exact six
                      routes — so the footer bought a second copy of each. On a
                      slow connection that is 6 extra round trips competing
                      with the page for a link nobody has aimed at yet. */}
                  <Link
                    href={href(locale, route.segment)}
                    prefetch={false}
                    className="text-sm text-fg-secondary hover:text-fg-primary"
                  >
                    {dict.nav[route.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-languages">
            <h2 id="footer-languages" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {dict.footer.languageTitle}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {LOCALES.map((l) => (
                <li key={l}>
                  {/* Seven languages, seven prefetched copies of the home
                      page — for a switch almost nobody touches, and never
                      before they have read anything. */}
                  <Link
                    href={href(l, "")}
                    hrefLang={l}
                    prefetch={false}
                    className={`text-sm hover:text-fg-primary ${l === locale ? "font-medium text-fg-primary" : "text-fg-secondary"}`}
                  >
                    {LOCALE_NAMES[l]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{dict.footer.projectTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-fg-secondary">
              <span className="font-medium text-fg-primary">{dict.footer.openSource}</span> —{" "}
              {dict.footer.openSourceNote}
            </p>
            <div className="flex flex-wrap items-center gap-x-5">
              <Link
                href={href(locale, "about")}
                prefetch={false}
                className="mt-3 inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
              >
                {dict.nav.about}
              </Link>
              {/*
                Settings, as a PLAIN LINK, and this is not decoration.

                Signed in, settings and sign-out moved inside the avatar menu —
                which is a client component whose trigger is a button. So for a
                reader with JavaScript off or still loading, the only route to
                their own settings disappeared the moment they signed in. A
                signed-out visitor kept the standalone gear; a signed-in one had
                nothing.

                A footer link costs one line, works with no JavaScript at all,
                and is where people look for this anyway.
              */}
              <Link
                href={href(locale, "settings")}
                prefetch={false}
                className="mt-3 inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
              >
                {dict.nav.settings}
              </Link>
              {/* The two pages an institution looks for before it takes a
                  project seriously, and the two a site of this kind most often
                  does not have. The footer is where people look for them. */}
              <Link
                href={href(locale, "privacy")}
                prefetch={false}
                className="mt-3 inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
              >
                {dict.nav.privacy}
              </Link>
              <Link
                href={href(locale, "impressum")}
                prefetch={false}
                className="mt-3 inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
              >
                {dict.nav.impressum}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border-subtle pt-6 font-mono text-[11px] text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} · {dict.footer.rights}
          </span>
          <span>{dict.footer.builtOn}</span>
        </div>
      </div>
    </footer>
  );
}
