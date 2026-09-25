import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "./route.ts";

function request(body: unknown) {
  return new Request("http://localhost/api/check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("rejects empty input with 400", async () => {
  const res = await POST(request({ text: "" }));
  assert.equal(res.status, 400);
});

test("rejects over-long input with 400", async () => {
  const res = await POST(request({ text: "a".repeat(2001) }));
  assert.equal(res.status, 400);
});

test('returns violations for "Das isch nid güet"', async () => {
  const res = await POST(request({ text: "Das isch nid güet" }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, false);
  assert.ok(json.findings.length >= 2);
});

test('returns ok for "Das isch nöd guet"', async () => {
  const res = await POST(request({ text: "Das isch nöd guet" }));
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(json.findings, []);
  // Two taught forms (`isch`, a form of `si`, and `nöd`), nothing from elsewhere.
  assert.equal(json.reading.verdict, "consistent");
});

test("the reading names the area a received message points to", async () => {
  const res = await POST(request({ text: "Das isch nid güet" }));
  const json = await res.json();
  assert.equal(json.reading.verdict, "area");
  assert.ok(["Bern", "Ostschweiz"].includes(json.reading.lead.origin));
});
