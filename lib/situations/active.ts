import { VARIETY } from "../variety/active.ts";
import type { DomainId, SituationPack } from "./pack.ts";
import { CARE } from "./packs/gsw-zh-care.ts";

/**
 * The domain packs this build carries — the situations seam.
 *
 * `variety/active.ts` says WHICH LANGUAGE this deployment teaches and there is
 * exactly one. This says WHICH SITUATIONS it has lines for, and there may be
 * several: one Heidi serves a care assistant, a relocating doctor and somebody
 * who just moved into a shared flat, and they are not three deployments.
 *
 * THE FILTER IS THE POINT. A pack declares the variety it is written in, and
 * only packs matching the taught variety are served. Without it, a Lesya build
 * that inherited this folder would offer a Ukrainian learner ten sentences of
 * Zurich German under a heading saying "at work" — fluent, plausible, and in
 * the wrong language, which is §2's failure mode with the packaging changed.
 *
 * The filter runs at module load rather than at each call, so the cost is paid
 * once and the answer cannot differ between two callers.
 */
const ALL: readonly SituationPack[] = [CARE];

export const SITUATIONS: readonly SituationPack[] = ALL.filter((pack) => pack.variety === VARIETY.tag);

/** A domain by id, or undefined — the shape a route needs for its 404. */
export function domain(id: DomainId): SituationPack | undefined {
  return SITUATIONS.find((pack) => pack.id === id);
}

/** One situation, by domain and id. Undefined when either half is unknown. */
export function situation(domainId: DomainId, situationId: string) {
  return domain(domainId)?.situations.find((s) => s.id === situationId);
}
