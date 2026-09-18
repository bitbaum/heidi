import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredKeys, humanSize } from "./stores.ts";
import { FLOWS } from "../config/privacy.ts";

/**
 * The settings page acts on the list the privacy page publishes. These assert
 * the join, because the failure mode is silent: a key added to one and not the
 * other leaves data behind while a page promises it is gone.
 */

test("every device key the privacy page declares is one settings can delete", () => {
  const declared = declaredKeys();
  const onDevice = FLOWS.filter((f) => f.place === "device");

  assert.equal(
    declared.length,
    onDevice.length,
    "a device flow whose key settings cannot find is data nobody can delete from the page that offers to",
  );
  for (const { key } of declared) {
    assert.match(key, /^heidi\./, `${key} is not one of ours`);
  }
});

test("the ids match the privacy page's, so its translated labels can be reused", () => {
  // The alternative is a second set of names for the same four things, in
  // seven languages.
  const ids = new Set(declaredKeys().map((d) => d.id));
  for (const flow of FLOWS) {
    if (flow.place !== "device") continue;
    assert.ok(ids.has(flow.id), `${flow.id} has no entry settings can label`);
  }
});

test("the speaking takes are among them", () => {
  // The most private thing the product touches, and the one a person is most
  // likely to open this page to remove.
  const keys = declaredKeys().map((d) => d.key);
  assert.ok(
    keys.includes("heidi.takes.v1"),
    `takes missing from ${JSON.stringify(keys)}`,
  );
});

test("sizes read the way a person reads them", () => {
  assert.equal(humanSize(0), "0");
  assert.equal(
    humanSize(-5),
    "0",
    "a negative size is nothing, not a minus sign",
  );
  assert.equal(humanSize(400), "400 B");
  assert.equal(humanSize(1024), "1 kB");
  assert.equal(humanSize(1536), "1.5 kB");
});

test("reading storage on the server yields nothing rather than throwing", async () => {
  // This module is imported by a client component, which Next renders once on
  // the server where `window` does not exist.
  const { readStores, exportAll } = await import("./stores.ts");
  assert.deepEqual(readStores(), [], "no window, no stores");
  assert.doesNotThrow(() => exportAll());
});

/**
 * The snapshot cache, which `useSyncExternalStore` requires and which is the
 * one piece of this module that can fail silently.
 *
 * A cache that never invalidates looks exactly like a working page until
 * somebody deletes something: storage is emptied, the row stays, and the
 * product has told them their data is gone while showing it to them. So the
 * invalidation is asserted directly rather than trusted to a comment.
 */
function withFakeWindow(): { restore: () => void; store: Map<string, string> } {
  const store = new Map<string, string>();
  const handlers = new Set<() => void>();
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      removeItem: (k: string) => void store.delete(k),
    },
    addEventListener: (_: string, h: () => void) => void handlers.add(h),
    removeEventListener: (_: string, h: () => void) => void handlers.delete(h),
  };
  return { restore: () => void delete (globalThis as { window?: unknown }).window, store };
}

test("the snapshot is stable by identity, or useSyncExternalStore loops forever", async () => {
  const { restore, store } = withFakeWindow();
  try {
    const { storesSnapshot, declaredKeys } = await import("./stores.ts");
    store.set(declaredKeys()[0].key, '"x"');

    const first = storesSnapshot();
    assert.equal(storesSnapshot(), first, "an unchanged store must return the SAME array, not an equal one");
  } finally {
    restore();
  }
});

test("forgetting a key invalidates the snapshot and tells the subscribers", async () => {
  const { restore, store } = withFakeWindow();
  try {
    const { storesSnapshot, subscribeStores, forget, declaredKeys } = await import("./stores.ts");
    const key = declaredKeys()[0].key;
    store.set(key, JSON.stringify("something of yours"));

    let announced = 0;
    const unsubscribe = subscribeStores(() => announced++);

    const before = storesSnapshot().find((s) => s.key === key);
    assert.ok(before && before.bytes > 0, "the fixture should be visible before it is deleted");

    forget(key);

    assert.equal(announced, 1, "a delete nobody hears about is a row that never disappears");
    const after = storesSnapshot().find((s) => s.key === key);
    assert.equal(after?.bytes, 0, "the cached snapshot survived a delete");

    unsubscribe();
    forget(key);
    assert.equal(announced, 1, "an unsubscribed listener must stop hearing");
  } finally {
    restore();
  }
});
