// Relative `.ts` imports, not the `@/*` alias, and not extensionless: node's
// test runner reads this file directly to check that every essay names a
// source, and the alias only resolves inside Next's build. Same reason the
// API routes import their domain modules this way.
import type { Essay } from "../../lib/essays/types.ts";
import { de } from "./warum-die-schweiz-ihre-mundarten-behalten-hat/de.ts";
import { en } from "./warum-die-schweiz-ihre-mundarten-behalten-hat/en.ts";

/**
 * Everything published, newest first.
 *
 * ONE FILE PER ESSAY PER LANGUAGE, and this list is the only place they are
 * wired up — adding a piece is a folder, a file and a line here. It is
 * deliberately not a glob over the directory: a glob makes "what is published"
 * depend on what happens to be on disk, and a half-finished draft would go
 * live by existing.
 *
 * `text` is PARTIAL over the locales. That is the whole reason essays are not
 * dictionary entries: a dictionary must have every key in all seven languages
 * or the build fails, which is right for interface copy and impossible for two
 * thousand words of argued history. An essay exists in the languages somebody
 * actually wrote it in, and a reader in one it has not reached is told so and
 * handed the version that does exist.
 */
export const ESSAYS: readonly Essay[] = [
  {
    slug: "warum-die-schweiz-ihre-mundarten-behalten-hat",
    published: "2026-09-20",
    // The essay's strong claims, in the order it makes them. The causal story
    // in the middle is marked as a conjecture in the text itself, because
    // these sources describe the language situation and not why it arose.
    sources: ["ferguson-1959", "hls-landesverteidigung", "hls-mehrsprachigkeit", "sds-atlas"],
    text: { de, en },
  },
];
