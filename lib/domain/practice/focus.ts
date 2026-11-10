import { SCENES } from "../../situations/display.ts";
import { ALL, scenesScope, type Scope } from "./scope.ts";

/**
 * "Meine Situationen": the places this learner actually goes — the doctor,
 * the Kindsgi, the lunch table at work — chosen once, and from then on what
 * every "practise" button draws from.
 *
 * WHY. Practice was never random (spaced repetition and a per-learner model
 * order every sitting), but nothing asked what somebody needs Swiss German
 * FOR, so a nurse and a parent got the same 2,545 items in the same order.
 * The choice is the cheapest personalisation there is, and the most honest:
 * the learner says it, nothing is inferred.
 *
 * Device-only, like the rest of the practice record (`privacy.ts`, "focus").
 */
export type Focus = { scenes: string[]; at: string };

const KNOWN = new Set(SCENES.map((s) => s.id));

export function decodeFocus(raw: string): Focus | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const { scenes, at } = value as Record<string, unknown>;
  if (!Array.isArray(scenes) || typeof at !== "string") return null;
  // A scene a later pack removed is dropped, not kept as a dead id.
  const known = [...new Set(scenes.filter((s): s is string => typeof s === "string" && KNOWN.has(s)))];
  return { scenes: known, at };
}

export function focusOf(scenes: readonly string[], now: Date = new Date()): Focus {
  return { scenes: [...new Set(scenes.filter((s) => KNOWN.has(s)))], at: now.toISOString() };
}

/** What a "practise" button means for this learner: their situations, else everything. */
export function focusScope(focus: Focus | null): Scope {
  return focus && focus.scenes.length > 0 ? scenesScope(focus.scenes) : ALL;
}

/**
 * The quick "practise" button: on a situation or grammar page it practises
 * that page (`quickScope`); anywhere else, this learner's situations.
 */
export function pageOrFocus(page: Scope, focus: Focus | null): Scope {
  return page.kind === "all" ? focusScope(focus) : page;
}
