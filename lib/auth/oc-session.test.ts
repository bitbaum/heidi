import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  applyOcRefresh,
  bindOcTokens,
  ocRefreshDue,
  refreshOcTokens,
} from "./oc-session.ts";

/**
 * A Heidi session must not outlive what OrangeCat allows. Pinned so the
 * JWT-only session never silently goes back to "signed in until the cookie
 * expires" — the state Solon showed on production 2026-09-29 after the
 * person clicked Disconnect on OrangeCat.
 */
const NOW = 1_800_000_000;
const deps = (fetch: typeof globalThis.fetch) => ({
  issuer: "https://orangecat.ch/",
  clientId: "heidi",
  clientSecret: "s3cret",
  fetch,
  nowSeconds: NOW,
});
const reply = (
  status: number,
  body: unknown,
  seen: Array<[string, RequestInit]> = [],
) =>
  (async (url: string | URL | Request, init?: RequestInit) => {
    seen.push([String(url), init ?? {}]);
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;

describe("oc-session", () => {
  test("binds the refresh token and expiry OrangeCat handed over at sign-in", () => {
    const t = bindOcTokens(
      { actorId: "a1", ocRetryAt: 5 },
      { refresh_token: "r1", expires_at: NOW + 3600 },
    );
    assert.deepEqual(t, {
      actorId: "a1",
      ocRefreshToken: "r1",
      ocExpiresAt: NOW + 3600,
    });
  });

  test("trusts the session while the access token is valid, refreshes once it is not", () => {
    const t = { actorId: "a1", ocRefreshToken: "r1", ocExpiresAt: NOW + 3600 };
    assert.equal(ocRefreshDue(t, NOW), false);
    assert.equal(ocRefreshDue(t, NOW + 3600 - 60), true);
    assert.equal(ocRefreshDue(t, NOW + 4000), true);
  });

  test("never refreshes a session that has nothing to refresh with", () => {
    assert.equal(ocRefreshDue({ actorId: "a1" }, NOW), false);
    assert.equal(
      ocRefreshDue({ ocRefreshToken: "r1", ocExpiresAt: 0 }, NOW),
      false,
    );
  });

  test("holds the retry after a transient failure", () => {
    const t = {
      actorId: "a1",
      ocRefreshToken: "r1",
      ocExpiresAt: 0,
      ocRetryAt: NOW + 30,
    };
    assert.equal(ocRefreshDue(t, NOW), false);
    assert.equal(ocRefreshDue(t, NOW + 30), true);
  });

  test("sends a refresh_token grant with client_secret_post and rotates the token", async () => {
    const seen: Array<[string, RequestInit]> = [];
    const fetch = reply(
      200,
      { access_token: "x", refresh_token: "r2", expires_in: 3600 },
      seen,
    );
    const r = await refreshOcTokens("r1", deps(fetch));
    assert.deepEqual(r, {
      ok: true,
      refreshToken: "r2",
      expiresAt: NOW + 3600,
    });
    const [url, init] = seen[0];
    assert.equal(url, "https://orangecat.ch/oauth/token");
    assert.equal(init.method, "POST");
    assert.equal(
      String(init.body),
      "grant_type=refresh_token&refresh_token=r1&client_id=heidi&client_secret=s3cret",
    );
  });

  test("keeps the old refresh token when OrangeCat sends none back", async () => {
    const r = await refreshOcTokens(
      "r1",
      deps(reply(200, { access_token: "x", expires_in: 60 })),
    );
    assert.deepEqual(r, { ok: true, refreshToken: "r1", expiresAt: NOW + 60 });
  });

  test("reads invalid_grant as the person taking the access back", async () => {
    const r = await refreshOcTokens(
      "r1",
      deps(reply(400, { error: "invalid_grant" })),
    );
    assert.deepEqual(r, { ok: false, revoked: true });
  });

  test("treats every other failure as transient", async () => {
    const a = await refreshOcTokens("r1", deps(reply(503, {})));
    assert.equal(a.ok, false);
    assert.equal(a.ok === false && a.revoked, false);
    const down = (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;
    assert.deepEqual(await refreshOcTokens("r1", deps(down)), {
      ok: false,
      revoked: false,
      reason: "ECONNREFUSED",
    });
  });

  test("ends the session on revocation and only the session", () => {
    const t = applyOcRefresh(
      { actorId: "a1", ocRefreshToken: "r1", ocExpiresAt: 0, email: "g@x" },
      { ok: false, revoked: true },
      NOW,
    );
    assert.deepEqual(t, { email: "g@x" });
  });

  test("keeps the session and backs off on a transient failure", () => {
    const t = applyOcRefresh(
      { actorId: "a1", ocRefreshToken: "r1", ocExpiresAt: 0 },
      { ok: false, revoked: false, reason: "503" },
      NOW,
    );
    assert.deepEqual(t, {
      actorId: "a1",
      ocRefreshToken: "r1",
      ocExpiresAt: 0,
      ocRetryAt: NOW + 60,
    });
  });

  test("stores the rotated token on success and clears any hold", () => {
    const t = applyOcRefresh(
      { actorId: "a1", ocRefreshToken: "r1", ocExpiresAt: 0, ocRetryAt: NOW },
      { ok: true, refreshToken: "r2", expiresAt: NOW + 3600 },
      NOW,
    );
    assert.deepEqual(t, {
      actorId: "a1",
      ocRefreshToken: "r2",
      ocExpiresAt: NOW + 3600,
    });
  });
});
