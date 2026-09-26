import { test, before, mock } from "node:test";
import assert from "node:assert/strict";

/**
 * The key check, without a vendor: ai-kit's `probeByokKey` is replaced so the
 * test pins what THIS route does with its answer — refuse bad input before any
 * call, pass the key's models and the suggestion through, keep "could not
 * reach" apart from "wrong key", and never let a credential out.
 */
let lastCall: { vendor: string; key: string } | null = null;
let answer: { ok: boolean; status: number | null; message: string; models: string[]; suggested: string | null };

let POST: (r: Request) => Promise<Response>;

before(async () => {
  mock.module("@bitbaum/ai-kit/byok-probe", {
    namedExports: {
      probeByokKey: async (vendor: string, key: string) => {
        lastCall = { vendor, key };
        return answer;
      },
    },
  });
  ({ POST } = await import("./route.ts"));
});

const req = (body: unknown) =>
  new Request("https://heidi.test/api/model/check", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 200)}` },
    body: JSON.stringify(body),
  });

test("an unknown vendor or a malformed key is refused before any call", async () => {
  lastCall = null;
  assert.equal((await POST(req({ provider: "localhost", key: "sk-EXAMPLENOTREAL" }))).status, 400);
  assert.equal((await POST(req({ provider: "openai", key: "sk-EXAMPLE\nNOTREAL" }))).status, 400);
  assert.equal((await POST(req({ provider: "openai", key: "" }))).status, 400);
  assert.equal(lastCall, null, "no vendor was asked");
});

test("a working key returns its models, best first, and the suggestion", async () => {
  answer = { ok: true, status: 200, message: "ok", models: ["claude-opus-5", "claude-haiku-4-5"], suggested: "claude-opus-5" };
  const body = await (await POST(req({ provider: "anthropic", key: "sk-ant-EXAMPLENOTREAL" }))).json();
  assert.deepEqual(lastCall, { vendor: "anthropic", key: "sk-ant-EXAMPLENOTREAL" });
  assert.equal(body.ok, true);
  assert.deepEqual(body.models, ["claude-opus-5", "claude-haiku-4-5"]);
  assert.equal(body.suggested, "claude-opus-5");
});

test("a refused key carries the vendor's words, with any key removed", async () => {
  answer = { ok: false, status: 401, message: "Incorrect API key provided: sk-EXAMPLENOTAREALKEY", models: [], suggested: null };
  const body = await (await POST(req({ provider: "openai", key: "sk-EXAMPLENOTAREALKEY" }))).json();
  assert.equal(body.ok, false);
  assert.equal(body.reachable, true);
  assert.match(body.message, /Incorrect API key/);
  assert.doesNotMatch(JSON.stringify(body), /EXAMPLENOTAREALKEY/);
});

test("a vendor that could not be reached is not reported as a wrong key", async () => {
  answer = { ok: false, status: null, message: "could not reach", models: [], suggested: null };
  const body = await (await POST(req({ provider: "groq", key: "gsk_EXAMPLENOTREAL" }))).json();
  assert.equal(body.ok, false);
  assert.equal(body.reachable, false);
});
