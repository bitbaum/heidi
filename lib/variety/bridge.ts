import type { Bridge, VarietyPack, VarietyRule } from "./pack.ts";

/**
 * The bridge Heidi can also WRITE in, as opposed to merely translate from.
 *
 * A pack's bridges are ranked, and the first `sibling` is the one close enough
 * that correspondences are computed from it. For Zurich that is Swiss Standard
 * German, and it is not a coincidence that the same variety is the one worth
 * producing: it is the written half of a diglossic pair. Dialect is what is
 * spoken and written informally; Swiss Standard German is what an email to a
 * landlord, a doctor or an employer is written in.
 *
 * Kept as its own module rather than inlined at the call sites so that "which
 * bridge do we claim to produce, and what are the rules for it" is answered in
 * exactly one place. A second pack picks its own sibling and gets the same
 * behaviour with no code change — the same discipline the rest of `lib/variety`
 * already enforces.
 */

/** The first `sibling` bridge, or undefined for a pack that has none. */
export function siblingOf(pack: VarietyPack): Bridge | undefined {
  return pack.bridges.find((b) => b.relation === "sibling");
}

/**
 * The gate for that bridge, or nothing.
 *
 * An empty list means "we make no checkable claim about this variety", and the
 * callers treat that as a reason NOT to offer it rather than a reason to offer
 * it unchecked. Shipping a line labelled Swiss Standard German that nothing
 * verified is exactly the overclaim the target gate exists to prevent.
 */
export function bridgeRules(pack: VarietyPack): readonly VarietyRule[] {
  return siblingOf(pack)?.rules ?? [];
}

/** Whether this pack can offer its sibling as an output at all. */
export function canWriteBridge(pack: VarietyPack): boolean {
  return bridgeRules(pack).length > 0;
}
