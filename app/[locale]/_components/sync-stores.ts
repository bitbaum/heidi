import { useMemo } from "react";
import { createBrowserStore, useBrowserStore } from "@/lib/browser/store";
import { decodeHistory, type History } from "@/lib/domain/practice/history";
import { decodeModel, EMPTY_MODEL, type LearnerModel } from "@/lib/domain/practice/model";
import { decodeStreak, EMPTY_STREAK, type Streak } from "@/lib/domain/progress/streak";
import {
  combineStreaks,
  decodeOthers,
  decodeSyncSetting,
  NO_OTHERS,
  sumModels,
  unionHistory,
  type OtherDevices,
} from "@/lib/domain/progress/sync";
import { historyStore, modelStore } from "./practice-stores";
import { streakStore } from "./streak-store";

/**
 * Progress across devices, from the page's side.
 *
 * WRITES go to this device's own stores, exactly as before sync existed.
 * READS that show progress go through the `…View` functions here, which add
 * the other devices' records (see `lib/domain/progress/sync.ts` for why the
 * two are never merged into one). With sync off, `othersStore` is empty and
 * every view is this device's record unchanged.
 */

export const syncSettingStore = createBrowserStore("heidi.sync.v1", decodeSyncSetting);

export const othersStore = createBrowserStore("heidi.sync.others.v1", (raw) =>
  decodeOthers(raw, { model: decodeModel, history: decodeHistory, streak: decodeStreak }),
);

const NO_HISTORY: History = [];

export function modelView(own: LearnerModel | null, others: OtherDevices | null): LearnerModel {
  const mine = own ?? EMPTY_MODEL;
  return others && others.model.length > 0 ? sumModels([mine, ...others.model]) : mine;
}

export function historyView(own: History | null, others: OtherDevices | null): History {
  const mine = own ?? NO_HISTORY;
  return others && others.history.length > 0 ? unionHistory([mine, ...others.history]) : mine;
}

export function streakView(own: Streak | null, others: OtherDevices | null): Streak {
  const mine = own ?? EMPTY_STREAK;
  return others && others.streak.length > 0 ? combineStreaks([mine, ...others.streak]) : mine;
}

/** For code that reads once (building a session), not on every render. */
export const readModelView = () => modelView(modelStore.read(), othersStore.read());
export const readHistoryView = () => historyView(historyStore.read(), othersStore.read());

// Memoised on the two cached references, so a view is one object per change
// of either store — a fresh object every render would re-render forever.
export function useModelView(): LearnerModel {
  const own = useBrowserStore(modelStore);
  const others = useBrowserStore(othersStore);
  return useMemo(() => modelView(own, others ?? NO_OTHERS), [own, others]);
}

export function useHistoryView(): History {
  const own = useBrowserStore(historyStore);
  const others = useBrowserStore(othersStore);
  return useMemo(() => historyView(own, others ?? NO_OTHERS), [own, others]);
}

export function useStreakView(): Streak {
  const own = useBrowserStore(streakStore);
  const others = useBrowserStore(othersStore);
  return useMemo(() => streakView(own, others ?? NO_OTHERS), [own, others]);
}
