import { LOCALE_NAMES, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n";

/**
 * "You asked for Romansh; this is in English, and here is why."
 *
 * WHY THIS EXISTS AS ONE COMPONENT — because it existed as three, which is the
 * complaint that produced it. `/rm/paper` was Romansh chrome («Controllai Vus
 * svess», «Funtaunas») wrapped around an English argument, with nothing saying
 * why and no `lang` on the English, so a screen reader read it with Romansh
 * phonology.
 *
 * The site had already solved this. `/essays/[slug]` has done it properly
 * since it shipped: name the language the reader is actually getting, and put
 * `lang` on the text. Then `/paper`, `/roadmap`, `/changelog` and
 * `/organisations` were built without it, and `/contribute` invented a THIRD
 * variant — a fixed sentence that did not even name the language.
 *
 * One concept, three implementations and four omissions. That is what "no
 * SSOT" means in practice, and the fix is not another sentence in another
 * file: every surface whose content is not in the reader's language renders
 * this, and takes its `lang` from the same value.
 *
 * TWO REASONS, BECAUSE THEY ARE HONESTLY DIFFERENT and a reader can act on the
 * difference:
 *
 *   `untranslated` — nobody has written it in your language YET. An essay. It
 *                    may change, and "yet" is a small promise we can keep.
 *   `byDesign`     — German and English on purpose, because the reader it
 *                    addresses lives here and seven machine-checked
 *                    translations of an unreviewed argument would be six
 *                    liabilities. It will not change, and implying it might
 *                    would be the friendlier lie.
 *
 * It renders NOTHING when the reader is getting their own language, which is
 * most readers most of the time. A notice telling a German reader they are
 * reading German is noise with a badge on.
 */
export function OtherLanguage({
  asked,
  got,
  reason,
  t,
}: {
  /** The locale the reader chose. */
  asked: Locale;
  /** The locale the content is actually in. */
  got: Locale;
  reason: "untranslated" | "byDesign";
  t: Dictionary["language"];
}) {
  if (asked === got) return null;

  return (
    <p className="max-w-measure rounded-control border border-border-subtle bg-surface-raised p-4 text-sm leading-relaxed text-fg-secondary">
      {reason === "byDesign" ? t.byDesign : t.notYet}{" "}
      {/* The language's own name, marked as being in it — the same rule the
          footer's switcher follows. «Deutsch» is not an English word and
          should not be read aloud as one. */}
      <span lang={got} className="font-medium text-fg-primary">
        {LOCALE_NAMES[got]}
      </span>
      .
    </p>
  );
}
