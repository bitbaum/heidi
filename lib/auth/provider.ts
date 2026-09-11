/**
 * The OrangeCat OIDC provider config — deliberately free of any next-auth
 * import so it can be asserted by `node --test`, which has no Next runtime.
 *
 * Its two settings are load-bearing and were both paid for once already, by
 * FleetCrown's debugging:
 *
 *  - OrangeCat's token endpoint accepts ONLY `client_secret_post`. Auth.js
 *    defaults to `client_secret_basic`, which OC rejects at the code exchange
 *    with a 400 that unhelpfully reads "client_id is required" — a message
 *    that points at the wrong problem entirely.
 *  - PKCE is required even for a confidential client that holds a secret.
 *
 * A silent revert of either would surface as an opaque failure at the code
 * exchange, which is the least debuggable place for it to appear. Hence the
 * tests next door.
 */
export function orangecatProvider(id: string, secret: string) {
  return {
    id: "orangecat",
    name: "OrangeCat",
    type: "oidc" as const,
    issuer: process.env.ORANGECAT_OAUTH_ISSUER ?? "https://orangecat.ch",
    clientId: id,
    clientSecret: secret,
    client: { token_endpoint_auth_method: "client_secret_post" as const },
    checks: ["pkce" as const, "state" as const],
    // Identity only. Heidi never acts on OrangeCat's behalf, so it asks for no
    // capability scopes — and the registered ceiling in OrangeCat's
    // CLIENT_SPECS is these same three, so a wider request could not be
    // granted even if this drifted.
    authorization: { params: { scope: "openid profile email" } },
  };
}
