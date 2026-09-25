import type { LearnerModel } from "../practice/model.ts";
import { strengthOf, type SituationStrength } from "../practice/situation-strength.ts";
import { sumModels } from "./sync.ts";

/**
 * Whether a learner has earned a certificate for a situation — decided on the
 * server, from every device's synced record, by the same `strengthOf` the
 * situation page shows. One rule, two places it is read; never two rules.
 *
 * ONLY AT "sure": every line Heidi can ask about holds, and most have come
 * back and held again. "Steady" is real progress and says so on the page; a
 * certificate is a claim made to somebody else, and it is only made where the
 * page would make it in full.
 */
export function evidenceFor(
  scene: string,
  deviceModels: readonly LearnerModel[],
  askable: ReadonlySet<number>,
): SituationStrength {
  return strengthOf(scene, sumModels(deviceModels), askable);
}

export function qualifies(s: SituationStrength): boolean {
  return s.askable > 0 && s.standing === "sure";
}
