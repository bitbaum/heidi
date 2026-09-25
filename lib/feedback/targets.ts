import { changelogEntryId, roadmapItemId, type ChangelogEntry } from "bip-kit";
import { ROADMAP } from "../config/roadmap.ts";
import { CHANGELOG } from "../config/changelog.ts";

/**
 * What a reader may vote or comment on: exactly the items this product
 * publishes, and nothing else — the feedback route refuses any other id, so a
 * script cannot invent tallies.
 *
 * ONE ID PER THING, WHATEVER THE LANGUAGE. The roadmap items carry explicit
 * `id`s, shared by the German and English versions. The changelog entries are
 * numbered within their date, counting from the OLDEST, because new entries go
 * on top: counting from the top would renumber every entry of the day each
 * time one was added, and move its comments to a different entry.
 */
export function withChangelogIds(entries: readonly ChangelogEntry[]): ChangelogEntry[] {
  return entries.map((e, i) => ({
    ...e,
    id: e.id ?? `${e.date}:${entries.slice(i + 1).filter((x) => x.date === e.date).length}`,
  }));
}

export const ROADMAP_TARGETS: readonly string[] = ROADMAP.de.buckets.flatMap((b) => b.items.map(roadmapItemId));

export const CHANGELOG_TARGETS: readonly string[] = withChangelogIds(CHANGELOG.de).map(changelogEntryId);

const ALL = new Set([...ROADMAP_TARGETS, ...CHANGELOG_TARGETS]);

export function isFeedbackTarget(id: string): boolean {
  return ALL.has(id);
}
