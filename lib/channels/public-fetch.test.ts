import { test } from "node:test";
import assert from "node:assert/strict";
import { publicFetchWith } from "./public-fetch.ts";

/** Names resolve where the test says; nothing touches the network. */
const lookup = async (host: string) => [{ address: host === "inside.test" ? "10.0.0.5" : "93.184.216.34" }];

function serving(routes: Record<string, () => Response>) {
  const asked: string[] = [];
  const base = async (input: string) => {
    asked.push(input);
    const route = routes[input];
    if (!route) throw new Error(`unexpected fetch ${input}`);
    return route();
  };
  return { base, asked };
}

test("an address inside the network is refused before any connection", async () => {
  const { base, asked } = serving({});
  const f = publicFetchWith(base, lookup);
  for (const url of ["http://127.0.0.1:5432/", "http://169.254.169.254/latest/meta-data", "http://inside.test/feed"]) {
    await assert.rejects(f(url), /refused/, url);
  }
  assert.deepEqual(asked, []);
});

test("a public feed that redirects inside is refused at the hop", async () => {
  const { base, asked } = serving({
    "https://feeds.example/show": () => new Response(null, { status: 302, headers: { location: "http://inside.test/admin" } }),
  });
  await assert.rejects(publicFetchWith(base, lookup)("https://feeds.example/show"), /refused/);
  assert.deepEqual(asked, ["https://feeds.example/show"]);
});

test("a public redirect to a public address is followed", async () => {
  const { base } = serving({
    "https://feeds.example/old": () => new Response(null, { status: 301, headers: { location: "/new" } }),
    "https://feeds.example/new": () => new Response("<rss/>", { status: 200 }),
  });
  const res = await publicFetchWith(base, lookup)("https://feeds.example/old");
  assert.equal(await res.text(), "<rss/>");
});

test("a body past the ceiling is cut off rather than held whole", async () => {
  const { base } = serving({ "https://feeds.example/huge": () => new Response("x".repeat(5000)) });
  const res = await publicFetchWith(base, lookup, 1024)("https://feeds.example/huge");
  assert.equal((await res.arrayBuffer()).byteLength, 1024);
});
