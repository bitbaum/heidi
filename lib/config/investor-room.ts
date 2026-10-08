/**
 * Heidi's investor room on OrangeCat, as the content OrangeCat's room takes
 * (OrangeCat ADR-0012, `PUT /api/projects/<id>/room`).
 *
 * `investors.ts` stays the one place the pitch and the numbers are written,
 * because it is the place they are CHECKED (`investors.test.ts` fails when a
 * figure overstates the repository or a sentence makes a forbidden claim). The
 * room on OrangeCat is filled from here, never typed there:
 *
 *   node --experimental-strip-types scripts/investor-room-payload.ts
 *
 * Section links become the room's documents, absolute and de-duplicated, so
 * each one is a click the founder can see.
 */

import { METRICS, METRICS_READ_ON, SECTIONS } from "./investors.ts";
import { CONTACT_EMAIL, SITE_URL } from "./site.ts";

export const ROOM_HEADLINE =
  "Understanding the language spoken around you — situation by situation, for individuals and for organisations. Open source: every claim here has a URL or a command beside it.";

/** "1 October 2026" → "2026-10-01". */
export function isoDate(readOn: string): string {
  const parsed = new Date(`${readOn} 12:00 UTC`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Unreadable date: ${readOn}`);
  return parsed.toISOString().slice(0, 10);
}

export function investorRoomContent() {
  const seen = new Set<string>();
  const documents: { title: string; url: string }[] = [];
  for (const section of SECTIONS) {
    for (const link of section.links ?? []) {
      const url = link.href.startsWith("http") ? link.href : `${SITE_URL}${link.href}`;
      if (seen.has(url)) continue;
      seen.add(url);
      documents.push({ title: link.label, url });
    }
  }

  return {
    headline: ROOM_HEADLINE,
    sections: SECTIONS.map((s) => ({ title: s.title, body: s.body.join("\n\n") })),
    metrics: METRICS.map((m) => ({ label: m.label, value: m.value, verify: m.verify })),
    metrics_as_of: isoDate(METRICS_READ_ON),
    deck_url: null,
    documents,
    contact_email: CONTACT_EMAIL,
  };
}
