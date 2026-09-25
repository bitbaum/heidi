import { parseContentBlocks, type Inline } from "bip-kit";
import { safeHref } from "bip-kit/react";

/**
 * A model's free-text answer, with its markdown rendered rather than printed.
 *
 * THE STANDARD'S ITEM 7, AND ONE OF HEIDI'S TWO LISTED GAPS. `fleet/SHARED.md`
 * ("Chat — the standard") records Heidi's chat as missing "stop, markdown".
 * Free-text answers — the ones a learner gets for "explain this word by word"
 * — were printed as one raw paragraph, so a model's `**äbe**` arrived as four
 * asterisks around a word and its list arrived as one run-on line.
 *
 * NOT A NEW TOKENIZER. The fleet has measured 454 lines of bespoke markdown
 * tokenizers and wants one parser; Heidi already depends on bip-kit, whose
 * `parseContentBlocks` is that parser, zero-dependency. What stays here is the
 * MARKUP, which the fleet keeps per app ("behaviour is shareable, markup is
 * not") because the tokens are Heidi's.
 *
 * TWO THINGS DELIBERATELY NOT RENDERED:
 *   - Headings become bold lines, not `<h2>`s. A chat answer is not part of
 *     the page's outline, and a model that writes `## Summary` should not
 *     insert a section into the document a screen reader navigates by.
 *   - Images, embeds, charts, figures and diagrams are shown as their text or
 *     not at all. Rendering an image a model wrote is letting model output
 *     load an arbitrary URL in the reader's browser.
 *
 * Links go through bip-kit's `safeHref` (http, https and mailto only) and open
 * in a new tab with no referrer, so a link a model invents cannot run script
 * or learn which page it was clicked from.
 */
export function ChatMarkdown({ text, className = "" }: { text: string; className?: string }) {
  const blocks = parseContentBlocks(text);
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}>{inline(b.spans ?? [{ t: "text", text: b.text }])}</p>;
          case "h2":
          case "h3":
          case "h4":
            return (
              <p key={i} className="font-semibold text-fg-primary">
                {inline(b.spans ?? [{ t: "text", text: b.text }])}
              </p>
            );
          case "ul":
          case "ol": {
            const Tag = b.type;
            return (
              <Tag key={i} className={`flex flex-col gap-1 pl-5 ${b.type === "ul" ? "list-disc" : "list-decimal"}`}>
                {b.items.map((item, j) => (
                  <li key={j}>{inline(b.itemSpans?.[j] ?? [{ t: "text", text: item }])}</li>
                ))}
              </Tag>
            );
          }
          case "blockquote":
            return (
              <blockquote key={i} className="border-l-2 border-border-strong pl-3 text-fg-secondary">
                {b.text.map((line, j) => (
                  <p key={j}>{inline(b.spans?.[j] ?? [{ t: "text", text: line }])}</p>
                ))}
              </blockquote>
            );
          case "code":
            return (
              <pre key={i} className="overflow-x-auto rounded-control bg-surface-sunk p-2 font-mono text-sm">
                {b.text}
              </pre>
            );
          case "hr":
            return <hr key={i} className="border-border-subtle" />;
          default:
            // Figures, images, embeds, charts, diagrams, tables: never from a
            // model. See above.
            return null;
        }
      })}
    </div>
  );
}

function inline(spans: readonly Inline[]): React.ReactNode {
  return spans.map((s, i) => {
    switch (s.t) {
      case "text":
        return s.text;
      case "strong":
        return (
          <strong key={i} className="font-semibold">
            {inline(s.children)}
          </strong>
        );
      case "em":
        return <em key={i}>{inline(s.children)}</em>;
      case "code":
        return (
          <code key={i} className="rounded-sm bg-surface-sunk px-1 font-mono">
            {s.text}
          </code>
        );
      case "link": {
        const href = safeHref(s.href);
        if (!href) return <span key={i}>{inline(s.children)}</span>;
        return (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-link underline underline-offset-4 hover:text-accent">
            {inline(s.children)}
          </a>
        );
      }
      default:
        return null;
    }
  });
}
