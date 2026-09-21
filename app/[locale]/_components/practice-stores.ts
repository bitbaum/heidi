import { createBrowserStore } from "@/lib/browser/store";
import { decodeHistory } from "@/lib/domain/practice/history";
import { decodeModel } from "@/lib/domain/practice/model";

/**
 * The two practice stores, created ONCE.
 *
 * WHY THEY LEFT THE SESSION COMPONENT. `createBrowserStore` returns an object
 * carrying its own subscriber list, so two modules that each create one for
 * the same key get two stores over one piece of storage — and a write through
 * the first notifies nobody subscribed to the second. The symptom would be the
 * focus panel showing yesterday's weak topics until a reload, which looks like
 * a caching bug and is actually two objects.
 *
 * So they are module-level here and imported, which is the one arrangement
 * that cannot go wrong.
 */
export const historyStore = createBrowserStore("heidi.practice.seen.v1", decodeHistory);

/**
 * What this learner keeps getting wrong.
 *
 * Declared on the privacy page and deletable from settings, because it is the
 * most personal thing the product holds: a record of what a particular person
 * cannot yet understand. It never leaves the browser.
 */
export const modelStore = createBrowserStore("heidi.practice.model.v1", decodeModel);
