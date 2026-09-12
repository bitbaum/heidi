import { check } from "../../../lib/variety/check.ts";
import { VARIETY } from "../../../lib/variety/active.ts";
import { callerKey, dialectCheck, tooMany } from "../../../lib/domain/limits.ts";

// Relative `.ts` imports, not the `@/*` alias: node's test runner exercises
// this handler directly, and the alias only resolves inside Next's build.

const MAX_LENGTH = 2000;

export async function POST(request: Request) {
  // Pure and local, so this is only about one client not monopolising the box.
  const allowed = dialectCheck.check(callerKey(request, "dialect-check"));
  if (!allowed.allowed) return tooMany(allowed);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  const text = body !== null && typeof body === "object" && "text" in body ? (body as { text: unknown }).text : undefined;

  if (typeof text !== "string" || text.trim().length === 0 || text.length > MAX_LENGTH) {
    return Response.json({ error: `"text" must be a non-empty string of at most ${MAX_LENGTH} characters` }, { status: 400 });
  }

  // The variety is the pack's, not this route's — /check works unchanged for
  // whichever variety the deployment teaches.
  return Response.json(check(text, VARIETY));
}
