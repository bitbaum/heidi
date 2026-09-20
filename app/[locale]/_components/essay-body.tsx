import Link from "next/link";
import type { Block } from "@/lib/essays/types";
import { inline, isInternal } from "@/lib/essays/inline";
import { DISPLAY } from "@/lib/variety/display";

/**
 * An essay, rendered through the design system rather than around it.
 *
 * Every block kind maps to a shape the rest of the site already uses — the
 * measure, the heading scale, the mono caption, the one accent — so a piece of
 * writing cannot quietly introduce a fourth type size. That is the trade the
 * typed-block model buys: an author writes sentences, and the page decides how
 * a sentence looks, once, here.
 *
 * `lang` is set on forms and nowhere else. A dialect word inside a German
 * paragraph is the one place a screen reader genuinely needs telling, and
 * marking whole paragraphs would tell it something false.
 */
export function EssayBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <Fragment key={i} block={block} />
      ))}
    </div>
  );
}

function Fragment({ block }: { block: Block }) {
  switch (block.kind) {
    case "h":
      return (
        <h2 className="mt-6 font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
          {block.text}
        </h2>
      );

    case "p":
      return (
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary sm:text-lg">
          <Inline text={block.text} />
        </p>
      );

    case "list":
      return (
        <ul className="flex max-w-measure flex-col gap-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-base leading-relaxed text-fg-secondary sm:text-lg">
              <span aria-hidden="true" className="text-accent">
                —
              </span>
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    /* The one line the piece turns on. Set against the accent rule rather than
       in a larger face, because an essay with two type scales has no hierarchy,
       it has two essays. */
    case "pull":
      return (
        <blockquote className="my-2 max-w-measure border-l-2 border-accent pl-5">
          <p className="font-heading text-xl leading-snug tracking-display text-fg-primary sm:text-2xl">
            <Inline text={block.text} />
          </p>
        </blockquote>
      );

    case "contrast":
      return (
        <figure className="my-2">
          {block.caption && (
            <figcaption className="mb-3 max-w-measure text-base leading-relaxed text-fg-secondary">
              <Inline text={block.caption} />
            </figcaption>
          )}
          <ul className="flex flex-col gap-2">
            {block.rows.map((row) => (
              <li
                key={`${row.left}-${row.right}`}
                className="grid grid-cols-safe items-baseline gap-x-4 gap-y-1 rounded-control border border-border-subtle p-3 sm:grid-cols-[1fr_1fr_1.4fr]"
              >
                <span lang={DISPLAY.tag} className="font-heading text-lg leading-snug tracking-display text-fg-primary">
                  {row.left}
                </span>
                <span lang={DISPLAY.tag} className="font-heading text-lg leading-snug tracking-display text-dialect">
                  {row.right}
                </span>
                {row.note && (
                  <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{row.note}</span>
                )}
              </li>
            ))}
          </ul>
        </figure>
      );
  }
}

/** The three inline rules. See `lib/essays/inline.ts` for why there are three. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {inline(text).map((span, i) => {
        if (span.kind === "text") return <span key={i}>{span.text}</span>;

        if (span.kind === "strong")
          return (
            <strong key={i} className="font-semibold text-fg-primary">
              {span.text}
            </strong>
          );

        if (span.kind === "form")
          return (
            <span key={i} lang={DISPLAY.tag} className="font-heading tracking-display text-dialect">
              {span.text}
            </span>
          );

        const className = "text-link underline underline-offset-4 hover:text-accent";
        // `Link` for our own pages so a reader stays inside the app; a plain
        // anchor for everything else, because prefetching somebody's server is
        // not ours to do.
        return isInternal(span.href) ? (
          <Link key={i} href={span.href} className={className}>
            {span.text}
          </Link>
        ) : (
          <a key={i} href={span.href} rel="noreferrer" className={className}>
            {span.text}
          </a>
        );
      })}
    </>
  );
}
