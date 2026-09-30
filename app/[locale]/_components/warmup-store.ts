import { createBrowserStore } from "@/lib/browser/store";
import { decodeWarmup } from "@/lib/domain/warmup/run";

/**
 * The warm-up's record, created ONCE — see `practice-stores.ts` for why two
 * stores over one key is a bug. Declared on the privacy page; never leaves the
 * browser.
 */
export const warmupStore = createBrowserStore("heidi.warmup.v1", decodeWarmup);
