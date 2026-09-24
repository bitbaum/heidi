import { SOURCES, citation, type SourceId } from "@/lib/research/sources";

/**
 * The references at the foot of a page that makes claims.
 *
 * SIX COPIES, AND ONE HAD ALREADY DRIFTED. The essays, the white paper, a
 * situation, a dialect area, the vocabulary and the technology page each
 * carried the same eighteen lines — the mono caption, the column, the
 * `lang="en"` anchor, `citation(id)`. The paper's copy had lost `text-link`,
 * so on one page in six the references rendered a different colour from every
 * other page, and nobody could have noticed without opening two tabs.
 *
 * That is the argument for the component. Citations are the part of this site
 * that is doing the most work — the whole claim is "check us" — and six
 * separately-maintained renderings of them is six chances for the least
 * important-looking detail to rot.
 *
 * `lang="en"` IS NOT OPTIONAL. A reference is English wherever it is printed:
 * translating a paper title would make it unfindable, and a screen reader on
 * the German page needs to be told to switch. `audit:language` also reads the
 * attribute, so a bibliography without it registers as an English leak.
 *
 * The HEADING is the caller's, because the three dictionaries spell it in
 * three namespaces (`essays`, `dialect`, `paper`) and unifying twenty-one
 * strings across seven locales is a separate change from unifying the markup.
 */
export function SourceList({
  title,
  ids,
  className = "",
}: {
  title: string;
  ids: readonly SourceId[];
  /** Spacing, which genuinely differs: some pages close with it, some bury it. */
  className?: string;
}) {
  if (ids.length === 0) return null;

  return (
    <section aria-labelledby="sources" className={className}>
      <h2 id="sources" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
        {title}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {ids.map((id) => (
          <li key={id} className="max-w-measure text-sm leading-relaxed text-fg-secondary">
            <a
              lang="en"
              href={SOURCES[id].url}
              rel="noreferrer"
              className="wrap-anywhere text-link underline underline-offset-4 hover:text-accent"
            >
              {citation(id)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
