import { VARIETY } from "@/lib/variety/active";

/**
 * The product's subject, drawn.
 *
 * The site had no picture at all, and the obvious fix — a stock photo of the
 * Limmat, a smiling person with a phone — would have been decoration bolted
 * onto a page that still said nothing. This is the other kind of image: a
 * figure OF the thing being taught.
 *
 * A dialect atlas draws regions and the isoglosses between them; a Swiss cow
 * is irregular black patches on white. They are the same shape, which is the
 * whole reason the identity works. So the dialect family is drawn as patches:
 * the one we teach filled, the ones we do not yet teach outlined, and the
 * isogloss cutting across all of them.
 *
 * IT IS GENERATED FROM THE PACK, not hand-drawn per dialect. The filled patch
 * is `VARIETY.endonym`, the outlines are `VARIETY.family.planned`. A Lesya
 * deployment gets its own figure from its own pack without anyone opening this
 * file — which is the same rule the rest of the product follows, applied to an
 * illustration rather than to a string.
 *
 * Deliberately NOT a map of Switzerland. A recognisable silhouette would be a
 * cartographic claim, and these patches are not where those dialects are. An
 * abstract figure says "regions and boundaries" without asserting a border it
 * would be wrong about.
 */

/** Patch outlines, in draw order. Irregular on purpose — a cow has no circles. */
const PATCHES = [
  "M14 30c10-9 24-11 34-6s14 18 6 26-24 10-34 3-14-15-6-23z",
  "M78 16c12-6 26 1 29 13s-6 22-18 24-23-4-25-15 2-16 14-22z",
  "M120 44c9-7 22-4 27 5s0 20-10 23-21-2-24-11 -2-12 7-17z",
  "M24 86c8-8 22-9 30-2s8 19 0 25-22 6-30-2-8-13 0-21z",
  "M74 78c11-5 24 2 26 13s-7 19-18 20-20-5-21-15 2-14 13-18z",
  "M126 92c7-5 17-3 21 4s-1 15-8 17-16-2-18-9 -2-8 5-12z",
];

export function DialectFigure({ plannedLabel }: { plannedLabel: string }) {
  const family = VARIETY.family;
  // The taught variety first, then the ones we say we do not cover yet.
  const labels = [VARIETY.endonym, ...(family?.planned ?? [])].slice(0, PATCHES.length);

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 160 130"
        className="w-full"
        role="img"
        aria-label={`${VARIETY.endonym} — ${plannedLabel}: ${(family?.planned ?? []).join(", ")}`}
      >
        {PATCHES.map((d, i) => {
          const taught = i === 0;
          return (
            <path
              key={d}
              d={d}
              // The one we teach is solid ink; the rest are outlines, which is
              // the honest visual for "named, not yet covered".
              className={taught ? "fill-fg-primary" : "fill-none stroke-border-strong"}
              strokeWidth={taught ? 0 : 1.25}
              strokeDasharray={taught ? undefined : "3 3"}
            />
          );
        })}

        {/* The isogloss: the line an atlas draws where one form stops. The only
            red on the page, and the reason red is reserved. */}
        <path
          d="M4 104c26-14 38-44 66-52s52 14 86 2"
          className="fill-none stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-3 w-3 bg-fg-primary" />
          <span className="font-mono text-[11px] uppercase tracking-caps text-fg-primary">{VARIETY.endonym}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 border border-dashed border-border-strong"
          />
          <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
            {plannedLabel} — {labels.slice(1).join(" · ")}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
