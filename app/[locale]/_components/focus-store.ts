import { createBrowserStore } from "@/lib/browser/store";
import { decodeFocus } from "@/lib/domain/practice/focus";

/** "Meine Situationen", created ONCE (see `practice-stores.ts`). Device-only; on the privacy page. */
export const focusStore = createBrowserStore("heidi.focus.v1", decodeFocus);
