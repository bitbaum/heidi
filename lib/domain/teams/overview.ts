import type { LearnerModel } from "../practice/model.ts";
import { strengthOf, type Standing } from "../practice/situation-strength.ts";
import { sumModels } from "../progress/sync.ts";

/**
 * What a team lead sees — and, as importantly, what they do not.
 *
 * A TEAM is a study group whose members may each choose to show the lead how
 * far they are in each situation of the team's focus (the care situations, for
 * a care home). The choice is per member and per team, off until they make it,
 * and revocable; see `group_members.shares_progress`.
 *
 * WHAT IS SHOWN: per situation, the same standing the member sees on their own
 * page (new / met / steady / sure) and how many lines hold. WHAT IS NOT: which
 * lines, which answers, anything they got wrong. A lead needs to know who is
 * ready for the night shift's handover, not what somebody misheard on Tuesday.
 *
 * A member who shares but has not switched sync on has nothing on the server
 * to show, and is listed as such rather than as "new" everywhere — "we cannot
 * see it" and "they have not started" are different facts.
 */

export type MemberInput = {
  actorId: string;
  displayName: string;
  shares: boolean;
  /** Every synced device's model; empty when sync is off. */
  models: readonly LearnerModel[];
  certificates: number;
};

export type MemberRow =
  | { actorId: string; displayName: string; state: "private" }
  | { actorId: string; displayName: string; state: "no-sync" }
  | {
      actorId: string;
      displayName: string;
      state: "shared";
      scenes: { scene: string; standing: Standing; held: number; askable: number }[];
      /** Situations at "sure" in the focus. */
      ready: number;
      certificates: number;
    };

export function teamOverview(
  members: readonly MemberInput[],
  focus: readonly string[],
  askable: ReadonlyMap<string, ReadonlySet<number>>,
): MemberRow[] {
  return members.map((m): MemberRow => {
    if (!m.shares) return { actorId: m.actorId, displayName: m.displayName, state: "private" };
    if (m.models.length === 0) return { actorId: m.actorId, displayName: m.displayName, state: "no-sync" };
    const model = sumModels(m.models);
    const scenes = focus.map((scene) => {
      const s = strengthOf(scene, model, askable.get(scene) ?? new Set());
      return { scene, standing: s.standing, held: s.held, askable: s.askable };
    });
    return {
      actorId: m.actorId,
      displayName: m.displayName,
      state: "shared",
      scenes,
      ready: scenes.filter((s) => s.standing === "sure").length,
      certificates: m.certificates,
    };
  });
}
