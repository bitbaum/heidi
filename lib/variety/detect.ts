/**
 * Where a message comes from — read from the gate, never guessed.
 *
 * WHO THIS IS FOR. Not somebody checking their own dialect: that page was
 * removed, because Heidi's learner cannot write the dialect yet (see
 * `rule-check.tsx`). This is for the message they RECEIVED — a colleague's
 * WhatsApp, the neighbour's note on the laundry-room door — and two questions
 * they really have about it: "is this the Zurich German I am learning, or
 * something else?" and "what do these words mean?".
 *
 * NOTHING HERE IS A NEW CLAIM. Every signal is data the pack already vouches
 * for: `rules` with an `origin` (the forms the generation gate refuses because
 * they belong somewhere else) and `vocabulary` (the target forms, each with the
 * bridge word a reader knows). A reading is only as strong as those lists, so
 * the verdict is phrased as what the forms POINT TO, and a short message with
 * no telling form is "unclear" rather than a confident "Zurich".
 *
 * Pure and pack-agnostic: which origins count as dialect areas comes from
 * `pack.family.areas[].ruleOrigin`, never from a name written in this file.
 */

import type { VarietyPack } from "./pack.ts";
import { checkAgainst } from "./check.ts";
import { wordPattern } from "../text/words.ts";

/** A form the pack teaches, found in the text, with what it means. */
export type KnownForm = { form: string; bridge: string; index: number };

/** Forms that belong to one other variety, grouped. */
export type OriginEvidence = {
  origin: string;
  /** The pack area this origin is, when it is a dialect area of the family. */
  areaId?: string;
  forms: { form: string; suggest?: string; index: number }[];
};

/**
 * `area`        forms from another dialect area of the family lead
 * `outside`     forms from a variety outside the family (the roof's other
 *               national standard, say) and none from an area
 * `consistent`  nothing points away, and enough taught forms to say so
 * `unclear`     too little in the text to point anywhere
 */
export type Verdict = "area" | "outside" | "consistent" | "unclear";

export type Reading = {
  verdict: Verdict;
  /** The leading origin, for `area` and `outside`. */
  lead?: OriginEvidence;
  /** Every origin found, most forms first. */
  origins: OriginEvidence[];
  /** Taught forms, in text order, each once. */
  known: KnownForm[];
};

/**
 * How many taught forms it takes to call a message consistent with the target.
 *
 * Two, because one short word is shared by half the family — `isch` alone
 * says "Swiss German", not "Zurich". It is a floor against a confident answer
 * from a two-word text, not a statistic.
 */
export const CONSISTENT_AT = 2;

export function readDialect(text: string, pack: VarietyPack): Reading {
  const areaOf = new Map((pack.family?.areas ?? []).filter((a) => a.ruleOrigin).map((a) => [a.ruleOrigin!, a.id]));

  const byOrigin = new Map<string, OriginEvidence>();
  // The target's own gate, plus every bridge's: a bridge's rules name the
  // forms of a neighbouring standard (Germany's German, for this pack), and
  // "this reads like somebody from Germany" is as real an answer to the reader
  // as a canton. Only findings with an origin count, so the rest are inert.
  const bridgeRules = pack.bridges.flatMap((b) => b.rules ?? []);
  for (const f of checkAgainst(text, [...pack.rules, ...bridgeRules]).findings) {
    if (!f.origin) continue;
    const entry = byOrigin.get(f.origin) ?? {
      origin: f.origin,
      ...(areaOf.has(f.origin) ? { areaId: areaOf.get(f.origin) } : {}),
      forms: [],
    };
    entry.forms.push({ form: f.form, ...(f.suggest ? { suggest: f.suggest } : {}), index: f.index });
    byOrigin.set(f.origin, entry);
  }
  // Most forms first; an area outranks an outside origin at equal count,
  // because it is the more specific answer to "where is this from".
  const origins = [...byOrigin.values()].sort(
    (a, b) => b.forms.length - a.forms.length || Number(Boolean(b.areaId)) - Number(Boolean(a.areaId)),
  );

  const known = knownForms(text, pack, new Set(origins.flatMap((o) => o.forms.map((f) => f.index))));

  const area = origins.find((o) => o.areaId);
  if (area) return { verdict: "area", lead: area, origins, known };
  if (origins.length > 0) return { verdict: "outside", lead: origins[0], origins, known };
  return { verdict: known.length >= CONSISTENT_AT ? "consistent" : "unclear", origins, known };
}

/**
 * Taught forms in the text, longest first so `nöd meh` is not read as `nöd`.
 *
 * A span already claimed — by a longer taught form or by a foreign finding —
 * is not counted again: one word is one piece of evidence.
 */
function knownForms(text: string, pack: VarietyPack, foreignAt: Set<number>): KnownForm[] {
  // Headwords and their listed forms (`isch` is a form of `si`), each with its
  // own gloss. A form spelled exactly like its bridge word (`sind` = sind)
  // says nothing about where a text comes from, so it is left out.
  const entries = (pack.vocabulary ?? [])
    .flatMap((w) => [{ target: w.target, bridge: w.bridge }, ...(w.forms ?? [])])
    .filter((e) => e.target.toLocaleLowerCase() !== e.bridge.toLocaleLowerCase())
    .sort((a, b) => b.target.length - a.target.length);
  const taken: [number, number][] = [];
  const overlaps = (s: number, e: number) => taken.some(([ts, te]) => s < te && ts < e);
  const found: KnownForm[] = [];

  for (const entry of entries) {
    for (const m of text.matchAll(wordPattern(entry.target, "g"))) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      if (foreignAt.has(start) || overlaps(start, end)) continue;
      taken.push([start, end]);
      found.push({ form: m[0], bridge: entry.bridge, index: start });
    }
  }
  return found.sort((a, b) => a.index - b.index);
}
