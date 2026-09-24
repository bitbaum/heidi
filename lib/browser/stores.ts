/**
 * What this browser is actually holding for Heidi, and how to be rid of it.
 *
 * DERIVED FROM THE PRIVACY PAGE, not listed again.
 *
 * `lib/config/privacy.ts` already enumerates every flow with the storage key
 * beside it, precisely so a reader can open their own dev tools and check. A
 * second list here would be the same claim written twice, and the copy that
 * drifts is always the one nobody is reading — a settings page that forgot a
 * key would quietly leave data behind while promising it was gone. So the keys
 * come from `FLOWS`, and the privacy page's own test already asserts that each
 * one still appears somewhere in the code.
 *
 * WHY SIZE AND NOT CONTENTS. Reporting "4 conversations, 11 saved words" would
 * need this module to know the shape of every store, which is four decoders
 * that go stale one at a time. Bytes need no shape, cannot go stale, and
 * answer the question somebody actually has when they open this: is there
 * anything of mine in here, and how much.
 *
 * Pure apart from the storage calls, which are guarded: `localStorage` throws
 * rather than returning null in a private window and in a browser set to block
 * site data, and a settings page that crashes on open is worse than one that
 * says it cannot read.
 */

import { FLOWS } from "../config/privacy.ts";

export type DeviceStore = {
  /** The flow id, so the page can reuse the privacy page's own translated label. */
  id: string;
  /** The `localStorage` key. */
  key: string;
  /** Bytes it occupies, or 0 when nothing is stored under it. */
  bytes: number;
};

/**
 * Every `heidi.*` key the privacy page declares as living on the device.
 *
 * `place === "device"` rather than `leavesDevice === false`: the learner's own
 * model key is stored here AND forwarded on the request it is for, so it is a
 * device store that leaves — and it is certainly something somebody opening
 * this page wants to be able to delete.
 */
/**
 * How a storage key is recognised inside a `where` string.
 *
 * EXPORTED, because `privacy.test.ts` needs the same pattern to check that a
 * declared key still exists in the code — and had its own copy, which is the
 * duplication this whole module is about. Two regexes for one convention drift
 * silently: adding `heidi.dictation.recogniser-dead.v1` matched one and not
 * the other, because only one of them allowed a hyphen.
 *
 * Hyphens are allowed. `v1` suffixes are allowed. Colons are NOT — a key that
 * uses them is invisible here, which is exactly how the dictation verdict
 * escaped both the privacy page and the delete-everything button.
 */
export const STORAGE_KEY_PATTERN = /heidi\.[a-z0-9.-]+/;

export function declaredKeys(): Array<{ id: string; key: string }> {
  const out: Array<{ id: string; key: string }> = [];
  for (const flow of FLOWS) {
    if (flow.place !== "device") continue;
    const key = flow.where.match(STORAGE_KEY_PATTERN)?.[0];
    if (key) out.push({ id: flow.id, key });
  }
  return out;
}

function sizeOf(key: string): number {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? new Blob([raw]).size : 0;
  } catch {
    return 0;
  }
}

/** What is on this device right now. Empty on the server, where there is none. */
export function readStores(): DeviceStore[] {
  if (typeof window === "undefined") return [];
  return declaredKeys().map(({ id, key }) => ({ id, key, bytes: sizeOf(key) }));
}

/**
 * Storage as an external store, which is what it is.
 *
 * `store.ts` next door already treats a single key this way, and for the same
 * reason: a React state mirror of something the browser owns has to be pushed
 * back into sync by hand after every write, and the sync that gets forgotten is
 * the one in another tab. Subscribing instead means a delete here and a delete
 * in a second tab both reach this list, and the component needs no effect.
 *
 * The snapshot is cached because `useSyncExternalStore` compares by identity —
 * a fresh array every call is an infinite render loop. It is dropped on any change
 * rather than diffed: four `getItem` calls are cheaper than being clever.
 */
const listeners = new Set<() => void>();
let snapshot: DeviceStore[] | null = null;

const announce = () => {
  snapshot = null;
  for (const l of listeners) l();
};

export function subscribeStores(onChange: () => void): () => void {
  listeners.add(onChange);
  // `storage` fires only for OTHER tabs, which is exactly the case a manual
  // refresh after our own write would miss.
  window.addEventListener("storage", announce);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", announce);
  };
}

export function storesSnapshot(): DeviceStore[] {
  if (snapshot === null) snapshot = readStores();
  return snapshot;
}

/**
 * The server's answer, as one frozen value.
 *
 * Module-level so its identity is stable across renders: returning a new `[]`
 * from `getServerSnapshot` is the same infinite loop as returning a new array
 * from the client one.
 */
export const NO_STORES: DeviceStore[] = [];

export function forget(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to do and nothing worth saying: a browser that refuses to delete
    // also refused to store, so the list is already right.
  }
  announce();
}

/**
 * Everything, as one object, for a person who wants to keep it.
 *
 * The counterpart to deletion and the half most products skip. Somebody who is
 * told their data is theirs should be able to walk out with it — and here that
 * is four keys and no server round trip, which is the one part of this
 * architecture that makes export trivial rather than a project.
 *
 * Values are parsed where they parse so the file is readable rather than a
 * wall of escaped JSON inside JSON.
 */
export function exportAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const { key } of declaredKeys()) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) continue;
      try {
        out[key] = JSON.parse(raw);
      } catch {
        out[key] = raw;
      }
    } catch {
      // Unreadable storage: the export simply does not contain that key.
    }
  }
  return out;
}

/** Bytes as a person reads them. */
export function humanSize(bytes: number): string {
  if (bytes <= 0) return "0";
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round((bytes / 1024) * 10) / 10} kB`;
}
