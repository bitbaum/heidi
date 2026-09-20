/**
 * The three things a sentence needs, and nothing else.
 *
 *   [label](url)   a link. Internal ones start with `/`; everything else is
 *                  external and the renderer treats it as such.
 *   **text**       emphasis, for the one word a sentence turns on.
 *   `form`         a language form — a dialect word, a Standard German one —
 *                  set in the dialect face rather than in body text.
 *
 * WHY A PARSER AT ALL, having just argued against Markdown. Because these
 * three appear INSIDE sentences, and a block model cannot express them without
 * turning every paragraph into an array of fragments that an author has to
 * assemble by hand. That is how prose stops being written.
 *
 * WHY IT IS THIS SMALL. Every rule here is one an essay actually needs and one
 * whose output the design system already has a shape for. There is no image,
 * no table, no raw HTML: a table is a `contrast` block, and raw HTML is the
 * hole through which a page stops obeying the tokens.
 *
 * Pure and exhaustively tested, because the failure mode is silent — an
 * unbalanced marker renders as literal asterisks in the middle of a published
 * sentence, which nobody notices until a reader does.
 */

export type Span =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string }
  | { kind: "strong"; text: string }
  /** A language form: a dialect word or a bridge one, set apart from prose. */
  | { kind: "form"; text: string };

/**
 * One pass, longest-match-first.
 *
 * The order matters and is the reason this is one regular expression rather
 * than three passes: run the emphasis rule first and `**[a](b)**` loses its
 * link. Alternation in a single scan means whichever marker starts earliest
 * wins, which is what a reader expects.
 */
const MARKER = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;

export function inline(text: string): Span[] {
  const spans: Span[] = [];
  let last = 0;

  for (const match of text.matchAll(MARKER)) {
    const at = match.index;
    if (at > last) spans.push({ kind: "text", text: text.slice(last, at) });

    const [, label, url, strong, form] = match;
    if (label !== undefined && url !== undefined) spans.push({ kind: "link", text: label, href: url });
    else if (strong !== undefined) spans.push({ kind: "strong", text: strong });
    else if (form !== undefined) spans.push({ kind: "form", text: form });

    last = at + match[0].length;
  }

  if (last < text.length) spans.push({ kind: "text", text: text.slice(last) });
  return spans;
}

/** True for a link that stays on this site, which is the one the router owns. */
export function isInternal(href: string): boolean {
  return href.startsWith("/");
}
