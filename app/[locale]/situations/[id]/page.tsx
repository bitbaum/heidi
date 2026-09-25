import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { DISPLAY } from "@/lib/variety/display";
import { SCENES, domainOf, sceneById } from "@/lib/situations/display";
import { SOURCES, type SourceId } from "@/lib/research/sources";
import { PACK_ITEMS } from "@/lib/domain/practice/published";
import { itemsInScope } from "@/lib/domain/practice/scope";
import { askableLines as askableLinesOf } from "@/lib/domain/practice/situation-strength";
import { SituationStrength } from "../../_components/situation-strength";
import { PageHeader, Shell } from "../../_components/page-shell";
import { SourceList } from "../../_components/source-list";

/**
 * Every scene, in every language, at build time. There are six of them and
 * they change when a pack changes, which is to say rarely.
 */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => SCENES.map((scene) => ({ locale, id: scene.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: raw, id } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  const words = dict.situations.scenes[id as keyof typeof dict.situations.scenes];
  if (!words) return { title: dict.situations.title };

  return { title: `${words.title} — ${dict.situations.title}`, description: words.scene };
}

/**
 * One scene, and the lines that occur in it.
 *
 * THE ORDER ON THE PAGE IS THE ORDER IN THE PACK, which is the order the
 * moment unfolds — a handover starts with who slept and ends with what you are
 * being asked to do. Sorting these alphabetically, or grouping the `hear` lines
 * away from the `say` ones, would throw away the only structure a scene has and
 * turn it back into the vocabulary list this page exists to not be.
 *
 * WHICH WAY EACH LINE TRAVELS IS MARKED, AND THAT IS THE WHOLE DESIGN.
 * A learner skimming this before a shift needs to know instantly whether a
 * sentence is one they must recognise or one they might have to produce, and
 * those are different kinds of work. The marker is a word rather than a colour,
 * because a colour is unreadable to some readers and meaningless to the rest
 * without a legend nobody reads.
 *
 * THE GRAMMAR LINKS ARE THE POINT OF THE WHOLE MODULE. A reference section
 * cannot manufacture a reason to read it; a learner who has just failed to
 * follow «Si isch am warte» has one. So every line that turns on a topic says
 * so and links there, and the scene collects them at the end as "what keeps
 * coming up here" — which is a syllabus derived from the material rather than
 * imposed on it.
 */
export default async function ScenePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.situations;

  const scene = sceneById(id);
  const words = scene ? t.scenes[scene.id as keyof typeof t.scenes] : undefined;
  // Both halves of the join, because either one missing is a page with a
  // heading and nothing under it — the failure the contract test also catches,
  // but a build-time test cannot help a request for a scene that never existed.
  if (!scene || !words) notFound();

  const domain = domainOf(scene);
  const domainWords = domain ? t.domains[domain.id as keyof typeof t.domains] : undefined;

  // Cited per scene rather than per line: every line in a pack currently names
  // the same dictionary, and six identical citations under six sentences is
  // noise rather than rigour. The id lives on each phrase so this stays true
  // by construction when a second source appears.
  const sources = [...new Set(scene.phrases.map((p) => p.source))].filter((s): s is SourceId => s in SOURCES);

  /**
   * Whether a scoped sitting on this scene would have anything in it.
   *
   * Only `hear` lines become practice items — see `situationItems` — so a
   * scene written mostly as replies can legitimately produce none, and a
   * button leading to an empty session is worse than no button.
   */
  const askable = itemsInScope(PACK_ITEMS, { kind: "scene", id: scene.id }).length > 0;

  /**
   * WHICH lines can be asked, for the strength panel's denominator.
   *
   * Read off the generated items rather than off `phrases.length`, so the
   * figure a learner is measured against is exactly the set of questions this
   * build can put to them. Counting lines that never become a question would
   * put a ceiling under 100% on every scene and silently call it their fault.
   */
  const askableLines = [...(askableLinesOf(PACK_ITEMS).get(scene.id) ?? [])].sort((a, b) => a - b);

  return (
    <Shell>
      <PageHeader eyebrow={domainWords?.title} title={words.title} lead={words.scene} />

      {domain && !domain.nativeReviewed && (
        <p className="mt-6 max-w-measure text-sm leading-relaxed text-fg-muted">
          {t.verified}
        </p>
      )}

      <ul className="mt-10 flex flex-col divide-y divide-border-subtle border-y border-border-subtle">
        {scene.phrases.map((phrase) => {
          const topic = phrase.grammar
            ? dict.grammar.topics[phrase.grammar as keyof typeof dict.grammar.topics]
            : undefined;

          return (
            <li key={phrase.target} className="min-w-0 py-5">
              {/* One column on a phone, two from `sm`. The label column is
                  fixed and the text column is `minmax(0,1fr)` via
                  `grid-cols-safe` at the base — a flex item refuses to shrink
                  below its content unless told to, and these are long
                  sentences nobody on this side wrote the line breaks for. */}
              <div className="grid grid-cols-safe gap-x-6 gap-y-2 sm:grid-cols-[8rem_minmax(0,1fr)]">
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted sm:pt-1">
                  {phrase.direction === "hear" ? t.hear : t.say}
                </p>

                <div className="min-w-0">
                  <p
                    lang={DISPLAY.tag}
                    className="wrap-anywhere font-heading text-lg font-semibold leading-snug tracking-display text-dialect"
                  >
                    {phrase.target}
                  </p>
                  <p lang="de" className="mt-1 wrap-anywhere text-base leading-snug text-fg-secondary">
                    {phrase.bridge}
                  </p>

                  {phrase.grammar && topic && (
                    <p className="mt-2 text-sm leading-relaxed">
                      <Link
                        href={`${href(locale, "grammar")}/${phrase.grammar}`}
                        className="text-link underline underline-offset-4 hover:text-accent"
                      >
                        {topic.title}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <SituationStrength
        scene={scene.id}
        askable={askableLines}
        lines={scene.phrases.map((p) => p.target)}
        certificate={dict.certificate}
        t={t}
        locale={locale}
      />

      {scene.topics.length > 0 && (
        <section aria-labelledby="topics" className="mt-12">
          <h2
            id="topics"
            className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
          >
            {t.grammarLabel}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {scene.topics.map((topicId) => {
              const topic = dict.grammar.topics[topicId as keyof typeof dict.grammar.topics];
              if (!topic) return null;
              return (
                <li key={topicId}>
                  <Link
                    href={`${href(locale, "grammar")}/${topicId}`}
                    className="inline-flex rounded-control border border-border-subtle px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:border-border-strong hover:text-fg-primary"
                  >
                    {topic.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* The way out of a reference page and into being asked, which is the
          half of the product that decides whether anybody comes back. The
          practice session already draws on the pack's rules, grammar examples
          and vocabulary — and now on these lines too. */}
      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-subtle pt-8">
        {/* Scoped to THIS scene, which is what the button always implied and
            did not do: it used to open the general drill, where eight
            questions from the whole pack might include one of these ten lines.
            A reader who has just worked through a handover and presses
            "practise" means the handover. */}
        {askable && (
          <Link
            href={`${href(locale, "practice")}?scene=${encodeURIComponent(scene.id)}`}
            className="inline-flex items-center rounded-control bg-action px-5 py-2.5 text-sm font-semibold text-on-action transition-opacity hover:opacity-90"
          >
            {t.practiseLabel}
          </Link>
        )}
        <Link
          href={href(locale, "situations")}
          className="text-sm text-link underline underline-offset-4 hover:text-accent"
        >
          {t.backLabel}
        </Link>
      </div>
      <SourceList title={dict.dialect.sourcesTitle} ids={sources} className="mt-14 border-t border-border-subtle pt-8" />
</Shell>
  );
}
