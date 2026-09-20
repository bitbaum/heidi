import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DOMAINS } from "@/lib/situations/display";
import { PageHeader, Shell } from "../_components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.situations.title, description: dict.situations.lead };
}

/**
 * Where you need it — the index.
 *
 * THE ARGUMENT THIS PAGE MAKES, and it is an argument rather than a list.
 *
 * `/vocabulary` sorts words by what kind of word they are, and that sort is
 * right for its own claim: function words and the handful of constant verbs
 * are what no sound correspondence rescues, so they are the words that buy the
 * most comprehension. What that organisation cannot do is answer the question
 * somebody with a shift tomorrow actually has, which is not "what are the
 * commonest particles" but "what will be said to me at the handover".
 *
 * So this page is the same language, cut along the other axis. A scene, and
 * the lines that occur in it, in the order the moment unfolds.
 *
 * EVERY CARD SAYS HOW MUCH OF IT IS LISTENING, which looks like a detail and
 * is the product's own thesis rendered as a number. §1 puts comprehension
 * first; a domain pack is the easiest place in this codebase to drift into a
 * phrasebook, and a count a reader can see is harder to drift past than a
 * principle in a document.
 *
 * AND THE UNREVIEWED NOTICE IS NOT IN A FOOTER. A learner buying this variety
 * cannot audit it — that is §2, and it is the whole reason the deterministic
 * gate exists. The gate is what we can prove; a native speaker's eye is what
 * we have not had yet. Burying the second under the first would be exactly the
 * shape of dishonesty the gate was built to prevent.
 */
export default async function SituationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.situations;

  return (
    <Shell>
      <PageHeader title={t.title} lead={t.lead} />
      <p className="mt-6 max-w-measure text-sm leading-relaxed text-fg-muted">{t.note}</p>

      <div className="mt-12 flex flex-col gap-16">
        {DOMAINS.map((domain) => {
          const words = t.domains[domain.id as keyof typeof t.domains];
          if (!words) return null;

          return (
            <section key={domain.id} id={domain.id} className="scroll-mt-24">
              <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
                {words.title}
              </h2>
              <p className="mt-4 max-w-measure text-base leading-relaxed text-fg-secondary">{words.lead}</p>

              {!domain.nativeReviewed && (
                <p className="mt-5 max-w-measure border-l-2 border-accent pl-4 text-sm leading-relaxed text-fg-muted">
                  {t.unreviewed}
                </p>
              )}

              {/* `grid-cols-safe` on the single-column base, per AGENTS.md: an
                  auto track's automatic minimum is min-content, and one long
                  unbroken dialect word in a card title is enough to make the
                  whole page scroll sideways on a phone. */}
              <ul className="mt-8 grid grid-cols-safe gap-4 sm:grid-cols-2">
                {domain.scenes.map((scene) => {
                  const sceneWords = t.scenes[scene.id as keyof typeof t.scenes];
                  if (!sceneWords) return null;

                  return (
                    <li key={scene.id} className="min-w-0">
                      <Link
                        href={`${href(locale, "situations")}/${scene.id}`}
                        className="group flex h-full flex-col rounded-control border border-border-subtle p-5 transition-colors hover:border-border-strong focus-visible:border-border-strong"
                      >
                        <h3 className="font-heading text-xl font-semibold leading-snug tracking-display text-fg-primary group-hover:text-accent">
                          {sceneWords.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-secondary">{sceneWords.scene}</p>
                        <p className="mt-4 font-mono text-caption uppercase tracking-caps text-fg-muted">
                          {scene.phrases.length} {t.linesLabel}
                          <span aria-hidden="true"> · </span>
                          {scene.heard} {t.heardLabel}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
