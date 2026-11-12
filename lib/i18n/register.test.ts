import { test } from "node:test";
import assert from "node:assert/strict";
import { getDictionary } from "./index.ts";

/**
 * Italian addresses the reader as Lei, on every page.
 *
 * QA (12 Nov) found /it/pass switching from «tu» to «Lei» between one line
 * and the next: the sign-in sentence it links to said «Se hai già OrangeCat»,
 * the checkout's way back said «Torna». The possessives and the commonest
 * second-person verbs are what such a line gives itself away by.
 */
const INFORMAL = /\b(tuo|tua|tuoi|tue|puoi|vuoi|hai)\b/i;

function strings(value: unknown, path: string, out: [string, string][]) {
  if (typeof value === "string") out.push([path, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) strings(v, path ? `${path}.${k}` : k, out);
  return out;
}

test("the Italian dictionary never says «tu» to the reader", () => {
  const informal = strings(getDictionary("it"), "", []).filter(([, text]) => INFORMAL.test(text));
  assert.deepEqual(informal, []);
});
