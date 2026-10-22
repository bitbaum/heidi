import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import type { ListeningSource } from "@/lib/listening/sources";
import { DISPLAY } from "@/lib/variety/display";
import { FollowButton } from "./follow-button";

type T = Dictionary["listening"];

/**
 * One listening source, wherever it is listed.
 *
 * EXTRACTED because the dialect area pages needed it. "Where can I hear this
 * one?" is the question those pages could not answer, and the register that
 * answers it has carried an `area` id on every row since the first commit —
 * the data was joined to the atlas and no page ever followed the join.
 *
 * Copying the markup would have been three lines of work and the usual
 * consequence: `/listen` grows a field, the dialect page does not, and within
 * a release the same source is described two different ways on two pages.
 * Same reason `Transcript` is one component for four chats.
 */
/**
 * One row: what it is, and the facts that decide whether it is for you today.
 *
 * The variety chip is FIRST and is the only one that gets the accent colour,
 * because it is the single fact this page exists to supply. Everything else —
 * how many voices, read or spontaneous, subtitles — is the observable detail
 * that `demand()` orders by, shown so the ordering can be argued with rather
 * than trusted.
 *
 * NO DIFFICULTY NUMBER IS PRINTED, deliberately. The ordering carries it; a
 * number would turn a derivation into a claim, and there is no scale behind it
 * to defend. A test in `sources.test.ts` keeps the data side of that promise.
 */
export function ListeningRow({
  source,
  t,
  areaNames,
  follow,
}: {
  source: ListeningSource;
  t: T;
  areaNames: Map<string, string>;
  /**
   * The «Folgen» button, for a row with a feed of episodes (a podcast or a
   * YouTube channel). Absent on the dialect pages, which list by area and
   * are not where somebody decides what to keep up with.
   */
  follow?: { t: Dictionary["channels"]; locale: Locale };
}) {
  const chips = [
    t.voices[source.voices],
    source.scripted ? t.scripted : t.spontaneous,
    source.subtitles === "none" ? null : t.subtitles[source.subtitles],
    source.reach === "ch" ? t.reachCh : null,
  ].filter(Boolean) as string[];

  // The ENDONYM, from the atlas, and therefore not translated: Bärndütsch is
  // called Bärndütsch in every language, the same decision the dialect area
  // pages already made. It is the fact a reader most wants from a film row and
  // the register has carried it since the first commit without showing it.
  const area = source.area ? areaNames.get(source.area) : undefined;
  const commentary = (t.commentary as Record<string, string | undefined>)[source.id];

  return (
    <li className="border-t border-border-subtle py-4 first:border-t-0">
      {/* The publisher sits beside the name rather than pushed to the far
          right of the page. Right-aligned, it drifted an inch of empty space
          away from the thing it names at desktop width, and read as belonging
          to nothing. */}
      {/* Two columns, not one wrapping row: the name and publisher take
          what is left and wrap inside it, the button keeps the right edge —
          so a long title never pushes «Folgen» onto a line of its own. The
          name may break inside a word, but only when the word alone is wider
          than the column («Wissenschaftsmagazin» beside «Подписаться» at
          320px): `break-words` leaves a flex item's minimum at the whole
          word and the word runs under the button. */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
          <a
            href={source.url}
            rel="noreferrer"
            className="inline-flex min-h-11 min-w-0 items-center text-base font-medium leading-snug wrap-anywhere text-link underline underline-offset-4 hover:text-accent"
          >
            {source.name}
          </a>
          <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{source.publisher}</span>
        </div>
        {/* The one action, at the end of the row: only where there is a feed
            to follow, so «Folgen» never promises what a film cannot keep. */}
        {follow && (source.medium === "podcast" || source.medium === "youtube") && source.linkKind === "play" && (
          <span className="shrink-0">
            <FollowButton input={source.url} register={source.id} t={follow.t} locale={follow.locale} />
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className={`font-mono text-caption uppercase tracking-caps ${
            source.spoken === "standard" ? "text-fg-muted" : "text-fg-muted"
          }`}
        >
          {t.spoken[source.spoken]}
        </span>
        {/* Beside the variety and before the mechanics: "which dialect" is the
            second question a reader has, and for a film it is often the first. */}
        {area && (
          <span lang={DISPLAY.tag} className="font-mono text-caption uppercase tracking-caps text-dialect">
            {area}
          </span>
        )}
        {chips.map((chip) => (
          <span key={chip} className="text-sm leading-snug text-fg-muted">
            {chip}
          </span>
        ))}
        {source.linkKind === "about" && <span className="text-sm leading-snug text-fg-muted">{t.about}</span>}
      </div>

      {/* Heidi's own reason for the row. Only where there is something to say
          that the fields cannot say themselves — an empty paragraph under
          forty rows would be a page of grey noise. */}
      {commentary && <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-secondary">{commentary}</p>}
    </li>
  );
}

