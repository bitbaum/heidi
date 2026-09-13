import { DISPLAY } from "@/lib/variety/display";

/**
 * The sound correspondences, shown rather than tabulated.
 *
 * They were a four-column grid of small mono text: Kind → Chind, and a caption
 * underneath. Accurate, and it taught nothing, because the one thing a learner
 * needs to SEE is which part of the word moved — and that was exactly what the
 * grid left them to work out.
 *
 * So the changed letters are marked, in the only colour on the site. The word
 * they know is quiet; the word they are learning is loud; the isogloss red
 * lands precisely on the difference.
 *
 * Read from `DISPLAY.correspondences`, like everything else. Nothing here
 * names German or Zurich, so a different pack draws a different figure.
 */

/**
 * Split a word around the part a rule changes.
 *
 * `rule` is a pack-vouched string like `k → ch`, so the two sides are the
 * literal letters to find. Falling back to "no highlight" is deliberate: a
 * wrong emphasis would teach a sound law that is not there, which is the same
 * failure the gloss guard exists to prevent.
 */
function mark(word: string, fragment: string): [string, string, string] | null {
  if (!fragment) return null;
  const at = word.toLowerCase().indexOf(fragment.toLowerCase());
  if (at === -1) return null;
  return [word.slice(0, at), word.slice(at, at + fragment.length), word.slice(at + fragment.length)];
}

/** `k → ch` becomes `["k", "ch"]`; anything else yields nothing to mark. */
function sides(rule: string): [string, string] | null {
  const parts = rule.split(/→|->/).map((p) => p.trim());
  return parts.length === 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : null;
}

function Word({ word, fragment, loud }: { word: string; fragment: string; loud: boolean }) {
  const split = mark(word, fragment);
  const tone = loud ? "text-fg-primary" : "text-fg-muted";
  if (!split) return <span className={tone}>{word}</span>;
  const [before, hit, after] = split;
  return (
    <span className={tone}>
      {before}
      <span className={loud ? "text-accent" : "text-accent/60"}>{hit}</span>
      {after}
    </span>
  );
}

export function CorrespondenceFigure() {
  return (
    <ul className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
      {DISPLAY.correspondences.map((c) => {
        const pair = sides(c.rule);
        return (
          <li key={c.bridge} className="border-t border-border-subtle pt-4">
            <p className="font-heading text-3xl leading-none tracking-display sm:text-4xl">
              <Word word={c.bridge} fragment={pair?.[0] ?? ""} loud={false} />
              <span aria-hidden="true" className="mx-3 text-fg-muted">
                →
              </span>
              <Word word={c.target} fragment={pair?.[1] ?? ""} loud />
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-caps text-fg-muted">{c.rule}</p>
          </li>
        );
      })}
    </ul>
  );
}
