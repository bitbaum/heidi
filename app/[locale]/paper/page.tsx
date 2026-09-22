import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { PAPER } from "@/lib/config/paper";
import { sectorLocale } from "@/lib/config/sectors";
import { SOURCES, citation } from "@/lib/research/sources";
import { Shell } from "../_components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const paper = PAPER[sectorLocale(locale)];
  return { title: paper.title, description: paper.lead };
}

/**
 * The white paper — the argument for why the software is shaped like this.
 *
 * WHAT IT IS NOT. It is not a summary of the site. `/method` already answers
 * "why these teaching choices" with the research; `/technology` answers "what
 * can a machine do with this language" with the numbers; `/about` says who
 * made it. The question none of them answers is "why is the SOFTWARE built
 * like this", and that is where the actual argument lives — the gate, the
 * variety as data, the four guards, the overclaim register.
 *
 * WHY THE TABLE OF CONTENTS IS AT THE TOP AND NOT IN A SIDEBAR. A sidebar is a
 * desktop affordation that becomes a wall on a phone, and this is a long
 * document read by somebody deciding whether to keep reading. Six links,
 * once, then the argument.
 *
 * EVERY SECTION ENDS IN A DOOR. That is the one structural rule here, enforced
 * by the shape of `PaperSection` rather than by memory: `check` is where a
 * reader goes to verify the section instead of believing it. A section with no
 * door is an assertion, and this document is specifically about not making
 * those.
 */
export default async function PaperPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const paper = PAPER[sectorLocale(locale)];

  /** Cited once at the foot, in the order the sections use them. */
  const cited = [...new Set(paper.sections.flatMap((section) => section.sources ?? []))];

  return (
    <Shell>
      <header className="border-b border-border-subtle py-12 sm:py-16">
        <p className="font-mono text-caption uppercase tracking-caps text-accent">{dict.nav.paper}</p>
        <h1 className="mt-3 max-w-[24ch] font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          {paper.title}
        </h1>
        <p className="mt-5 max-w-measure text-lead leading-relaxed text-fg-secondary">{paper.lead}</p>
        {/* What this document is and is not, before the argument rather than
            after it. A reader who finds out on page four that this is a
            working note has been managed. */}
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{paper.standfirst}</p>
      </header>

      <nav aria-label={paper.title} className="border-b border-border-subtle py-6">
        <ol className="flex flex-col gap-1">
          {paper.sections.map((section, index) => (
            <li key={section.id} className="min-w-0">
              <a
                href={`#${section.id}`}
                className="inline-flex min-h-11 items-center gap-3 wrap-anywhere text-base text-link underline underline-offset-4 hover:text-accent"
              >
                <span aria-hidden="true" className="font-mono text-caption text-fg-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {paper.sections.map((section, index) => (
        <section key={section.id} id={section.id} className="border-b border-border-subtle py-10 sm:py-12">
          <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-2 max-w-[26ch] font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
            {section.title}
          </h2>

          <div className="mt-5 flex flex-col gap-4">
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="max-w-measure text-base leading-relaxed text-fg-secondary">
                {paragraph}
              </p>
            ))}
          </div>

          {/* The door out of the section: where to go and check it. Set apart
              and in the accent, because it is the only part of a paragraph of
              prose that the reader is being asked to ACT on. */}
          {section.check && section.check.length > 0 && (
            <div className="mt-6 border-l-2 border-accent pl-4">
              <p className="font-mono text-caption uppercase tracking-caps text-accent">{dict.paper.checkLabel}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {section.check.map((door) => (
                  <li key={door.segment + door.label}>
                    <Link
                      href={href(locale, door.segment)}
                      className="inline-flex min-h-11 items-center wrap-anywhere text-sm text-link underline underline-offset-4 hover:text-accent"
                    >
                      {door.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.sources && section.sources.length > 0 && (
            <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
              {section.sources.map((id) => (
                <a
                  key={id}
                  href={SOURCES[id].url}
                  rel="noreferrer"
                  className="font-mono text-caption text-link underline underline-offset-4 hover:text-accent"
                >
                  {SOURCES[id].authors} {SOURCES[id].year}
                </a>
              ))}
            </p>
          )}
        </section>
      ))}

      {cited.length > 0 && (
        <section aria-labelledby="paper-sources" className="py-10">
          <h2
            id="paper-sources"
            className="font-mono text-caption uppercase tracking-caps text-fg-muted"
          >
            {dict.paper.sourcesTitle}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {cited.map((id) => (
              <li key={id} className="max-w-measure text-sm leading-relaxed text-fg-secondary">
                <a
                  href={SOURCES[id].url}
                  rel="noreferrer"
                  className="wrap-anywhere underline underline-offset-4 hover:text-accent"
                >
                  {citation(id)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Where the argument continues, for a reader who got to the end. The
          three pages this one deliberately does not repeat. */}
      <nav aria-label={dict.nav.groupAbout} className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border-subtle pt-6">
        {(["method", "technology", "roadmap", "changelog"] as const).map((key) => (
          <Link
            key={key}
            href={href(locale, key)}
            className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.nav[key]}
          </Link>
        ))}
      </nav>
    </Shell>
  );
}
