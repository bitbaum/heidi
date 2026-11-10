import { syncSettingStore } from "./sync-stores";
import { savedStore } from "./use-saved";

/**
 * Switching progress-on-every-device on, from wherever it is offered — the
 * settings switch and the one question on the signed-in home say the same
 * thing and must do the same thing.
 *
 * A browser that already keeps words treats its own list as the newest, so
 * switching sync on can never replace a list with an older one.
 */
export function turnSyncOn(): void {
  const setting = syncSettingStore.read();
  const device = setting?.device ?? crypto.randomUUID();
  const hasSaved = (savedStore.read()?.words.length ?? 0) > 0;
  syncSettingStore.write({ on: true, device, savedChangedAt: hasSaved ? new Date().toISOString() : null });
}

/** "Only in this browser": a decision, written down, so the question is not asked again. */
export function keepSyncOff(): void {
  const setting = syncSettingStore.read();
  syncSettingStore.write({ on: false, device: setting?.device ?? crypto.randomUUID(), savedChangedAt: setting?.savedChangedAt ?? null });
}
