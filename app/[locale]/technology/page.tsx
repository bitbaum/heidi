import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { SOURCES, citation } from "@/lib/research/sources";
import { ASR_RESULTS, CORPORA, SPEAKING, TEXT_MODELS, techSources } from "@/lib/research/language-tech";
import { MEASURES, sourceUrl } from "@/lib/speech/capability";
import { DISPLAY } from "@/lib/variety/display";
import { engineChain } from "@/lib/research/engine";
import { BandHeader, Section, Shell } from "../_components/page-shell";
import { SourceList } from "../_components/source-list";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.technology.title, description: dict.technology.lead };
}

/**
 * What a computer can and cannot do with this language.
 *
 * WHY IT EXISTS. §8 of HEIDI.md is an overclaim register — a list of things
 * this product must not say, the largest of which is that it transcribes
 * dialect. The strongest form of that discipline is not a promise to be
 * careful; it is publishing what the field can actually do, with the numbers,
 * so a reader can hold our claims against it. A page that says "dictation
 * writes Standard German" is a marketing choice. A page that shows every
 * public corpus pairing dialect speech with Standard German text, and names
 * the papers, is evidence.
 *
 * WHY IT IS ITS OWN PAGE. `/method` argues how Heidi teaches and rests on
 * acquisition research; this rests on language-technology research and argues
 * nothing about teaching at all. Folding it into `/method` would put two kinds
 * of claim under one heading, which is the thing the nav grouping was built to
 * stop. It sits beside it under "why it works this way".
 *
 * NO PER-ROW COMMENTARY. `language-tech.ts` carries an English `note` on every
 * row for maintainers, and it is not rendered: this site is read in seven
 * languages and `providers.ts` already records what happens when an English
 * source-copy field reaches a component. The badges say what a reader needs —
 * direction, licence, whether the weights are published, whether dialect was
 * actually evaluated — and each one is localised.
 *
 * NO PROSE AROUND THE NUMBERS. Every figure comes from
 * `lib/research/language-tech.ts` and every row names a source, for the same
 * reason the dialect area pages carry data and no description: seven
 * translations of "343 hours" are seven chances for one of them to be wrong,
 * and a number nobody here can check is exactly what this page exists to
 * argue against.
 */
export default async function TechnologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.technology;

  const sources = techSources();

  return (
    <Shell>
      <BandHeader title={t.title} lead={t.lead} />

      {/* WHY IT IS HARD leads, because every number below is only legible once
          you know that the spoken and the written language are different
          languages here. */}
      <section aria-labelledby="hard" className="border-t border-border-subtle py-10 sm:py-14">
        <h2
          id="hard"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.hardTitle}
        </h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          {t.hardBody.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed text-fg-secondary">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <Section border="top" id="corpora" title={t.corporaTitle} lead={t.corporaLead}>
        <ul className="mt-5 flex flex-col gap-3">
          {CORPORA.map((corpus) => (
            <li key={corpus.id} className="rounded-control border border-border-subtle p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-heading text-lg font-semibold tracking-display text-fg-primary">
                  {corpus.name} <span className="font-mono text-sm font-normal text-fg-muted">{corpus.year}</span>
                </h3>
                {/* The direction is the point of the whole table, so it is the
                    one thing set in the accent rather than in grey. */}
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                  {t.directions[corpus.direction]}
                </p>
              </div>

              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-caption uppercase tracking-caps text-fg-muted">
                {corpus.hours !== undefined && <Fact label={t.hours} value={String(corpus.hours)} />}
                {corpus.speakers !== undefined && (
                  <Fact label={t.speakers} value={corpus.speakers.toLocaleString(locale)} />
                )}
                {corpus.regions !== undefined && <Fact label={t.regions} value={String(corpus.regions)} />}
                <Fact
                  label={t.licence}
                  value={[corpus.licence, corpus.licenceKey && t.licences[corpus.licenceKey]]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </dl>

              <Cite id={corpus.source} />
            </li>
          ))}
        </ul>
      </Section>

      <Section border="top" id="asr" title={t.asrTitle} lead={t.asrLead}>
        <ul className="mt-5 flex flex-col gap-3">
          {ASR_RESULTS.map((result) => (
            <li
              key={result.system}
              className="grid grid-cols-safe gap-2 rounded-control border border-border-subtle p-4 sm:grid-cols-[8rem_1fr] sm:gap-5"
            >
              {/* The number first and large: this is the one table where the
                  figure IS the content. */}
              <div>
                <p className="font-heading text-2xl font-semibold tracking-display text-dialect">{result.wer}%</p>
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.wer}</p>
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold tracking-display text-fg-primary">
                  {result.system}{" "}
                  <span className="font-mono text-sm font-normal text-fg-muted">{result.year}</span>
                </h3>
                <p className="mt-0.5 flex flex-wrap gap-x-3 font-mono text-caption uppercase tracking-caps text-fg-muted">
                  <span>{result.tuned ? t.fineTuned : t.zeroShot}</span>
                  <span>{result.open ? t.weightsOpen : t.weightsClosed}</span>
                </p>
                <Cite id={result.source} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section border="top" id="speaking" title={t.speakingTitle} lead={t.speakingLead}>
        <ul className="mt-5 flex flex-col gap-3">
          {SPEAKING.map((system) => (
            <li key={system.id} className="rounded-control border border-border-subtle p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-heading text-base font-semibold tracking-display text-fg-primary">
                  {t.speakingNames[system.id]}
                  {system.year && <span className="font-mono text-sm font-normal text-fg-muted"> {system.year}</span>}
                </h3>
                <p className="flex flex-wrap gap-x-3 font-mono text-caption uppercase tracking-caps">
                  {/* Dialect or standard is the distinction a buyer is being
                      denied elsewhere, so it is the loud one. */}
                  <span className={system.dialect ? "text-accent" : "text-fg-muted"}>
                    {system.dialect ? t.isDialect : t.isStandard}
                  </span>
                  <span className="text-fg-muted">
                    {system.status === "research"
                      ? t.statusResearch
                      : system.status === "service"
                        ? t.statusService
                        : t.statusClosed}
                  </span>
                </p>
              </div>
              {system.source && <Cite id={system.source} />}
            </li>
          ))}
        </ul>
      </Section>

      <Section border="top" id="models" title={t.modelsTitle} lead={t.modelsLead}>
        <ul className="mt-5 flex flex-col gap-3">
          {TEXT_MODELS.map((model) => (
            <li key={model.name} className="rounded-control border border-border-subtle p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-heading text-base font-semibold tracking-display text-fg-primary">
                  {model.name} <span className="font-mono text-sm font-normal text-fg-muted">{model.year}</span>
                </h3>
                <p className="flex flex-wrap gap-x-3 font-mono text-caption uppercase tracking-caps">
                  {/* Measured, or merely announced. The whole reason this
                      column exists. */}
                  <span className={model.evaluated ? "text-accent" : "text-fg-muted"}>
                    {model.evaluated ? t.evaluated : t.notEvaluated}
                  </span>
                  <span className="text-fg-muted">{model.licence}</span>
                </p>
              </div>
              <Cite id={model.source} />
            </li>
          ))}
        </ul>
      </Section>

      {/* Our own system, after the field and before the summary: the reader has
          just seen what recognition can and cannot do, which is the only
          context in which these verdicts mean anything. Every one of them is
          COMPUTED from the pack — see `lib/speech/capability.ts`. No copy here
          claims a capability; the page renders whichever verdict it is handed,
          so it cannot drift from the engine and cannot be talked up. */}
      <Section border="top" id="evaluation" title={t.evalTitle} lead={t.evalLead}>
        <ul className="mt-5 flex flex-col gap-3">
          {MEASURES.map((measure) => {
            const verdict = DISPLAY.speech.measures.find((m) => m.id === measure.id)?.verdict ?? "none";
            return (
              <li
                key={measure.id}
                className={`rounded-control border p-4 ${
                  verdict === "refused" ? "border-border-strong" : "border-border-subtle"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-heading text-base font-semibold tracking-display text-fg-primary">
                    {t.evalNames[measure.id]}
                  </h3>
                  <p className="font-mono text-caption uppercase tracking-caps">
                    {/* The refusal is the loud one. It is the row a buyer came
                        to find, and the only one that is a decision rather
                        than a limit. */}
                    <span
                      className={
                        verdict === "target"
                          ? "text-accent"
                          : verdict === "bridge"
                            ? "text-fg-primary"
                            : "text-fg-muted"
                      }
                    >
                      {t.evalVerdicts[verdict]}
                    </span>
                  </p>
                </div>
                <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">
                  {t.evalWhat[measure.id]}
                </p>
                {measure.refused ? (
                  <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.evalRefusedNote}</p>
                ) : (
                  /* Where to go and check, rather than a request to believe. */
                  <p className="mt-2 font-mono text-caption text-fg-muted">
                    {t.evalSource} ·{" "}
                    <a
                      href={sourceUrl(measure.module)}
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center break-all underline underline-offset-4 hover:text-accent"
                    >
                      {measure.module}
                    </a>
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {/* The numbers the verdicts were computed FROM. A verdict on its own is
            the unfalsifiable marketing §8 exists to prevent; with the rates
            beside it a reader can disagree with our threshold. */}
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 font-mono text-caption uppercase tracking-caps text-fg-muted">
          {DISPLAY.speech.wer.target !== undefined && (
            <div className="flex gap-2">
              <dt>{DISPLAY.endonym}</dt>
              <dd className="text-fg-primary">
                {DISPLAY.speech.wer.target}% {t.wer}
              </dd>
            </div>
          )}
          {DISPLAY.speech.wer.bridge !== undefined && (
            <div className="flex gap-2">
              <dt>{t.isStandard}</dt>
              <dd className="text-fg-primary">
                {DISPLAY.speech.wer.bridge}% {t.wer}
              </dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt>{t.evalFormLimit}</dt>
            <dd className="text-fg-primary">{DISPLAY.speech.formMaxWer}%</dd>
          </div>
        </dl>
      </Section>

      {/* LAST, and deliberately so: the reader should reach our own claims
          having already seen what the field can do, so they can check them. */}
      <section aria-labelledby="heidi" className="border-t border-border-subtle py-10 sm:py-14">
        <h2
          id="heidi"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.heidiTitle}
        </h2>
        <ul className="mt-5 flex flex-col gap-4">
          {t.heidiBody.map((line) => (
            <li key={line} className="border-l-2 border-accent pl-4">
              <p className="max-w-measure text-base leading-relaxed text-fg-primary">{line}</p>
            </li>
          ))}
        </ul>
      </section>

      {/*
        WHICH MODEL ANSWERS YOU, read from the chain rather than written down.

        The page above is about what the FIELD can do. A reader who has just
        been told that machines cannot write this dialect down reasonably asks
        what is answering them — and a product that asks to be checked and then
        will not say what is behind the curtain has answered the easy half.

        The list comes from `@bitbaum/ai-kit`'s own chain at render time, so it
        cannot name a model that was retired months ago. Env names are dropped
        by the projection and a test enforces that.
      */}
      <section aria-labelledby="engine" className="border-t border-border-subtle py-10 sm:py-12">
        <h2
          id="engine"
          className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary"
        >
          {t.engineTitle}
        </h2>
        <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.engineLead}</p>

        <ol className="mt-6 flex flex-col gap-5">
          {engineChain().map((link, index) => (
            <li key={link.provider} className="min-w-0 border-l-2 border-border-subtle pl-4">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <span aria-hidden="true" className="font-mono text-caption text-fg-muted">
                  {index + 1}
                </span>
                <span className="font-heading text-lg font-semibold tracking-display text-fg-primary">
                  {link.provider}
                </span>
                <span className="font-mono text-caption text-fg-muted">{link.host}</span>
              </p>
              <p className="mt-1 max-w-measure wrap-anywhere font-mono text-caption text-fg-secondary">
                {link.models.join(" · ")}
              </p>
            </li>
          ))}
        </ol>

        {/* The two sentences that stop this list from being read as a ranking
            or as a capability claim. Both are mistakes a reader would make
            unprompted, and both would be ours for having invited them. */}
        <ul className="mt-6 flex flex-col gap-4">
          {t.engineNotes.map((note) => (
            <li key={note} className="border-l-2 border-accent pl-4">
              <p className="max-w-measure text-base leading-relaxed text-fg-primary">{note}</p>
            </li>
          ))}
        </ul>
      </section>
      <SourceList title={dict.dialect.sourcesTitle} ids={sources} className="border-t border-border-subtle py-8" />
</Shell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt>{label}</dt>
      <dd className="text-fg-primary">{value}</dd>
    </div>
  );
}

/**
 * The reference under a row, as a link.
 *
 * Every figure on this page carries one. A page whose subject is other
 * people's measurements and which cited nothing would be exactly the thing it
 * is warning the reader about.
 */
function Cite({ id }: { id: Parameters<typeof citation>[0] }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-fg-muted">
      <a href={SOURCES[id].url} rel="noreferrer" className="underline underline-offset-4 hover:text-accent">
        {SOURCES[id].authors} {SOURCES[id].year}
      </a>
    </p>
  );
}
