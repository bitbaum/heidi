import { checkZurichPurity } from "../../../lib/domain/dialect/purity.ts";

const MAX_LENGTH = 2000;

export async function POST(request: Request) {
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

  return Response.json(checkZurichPurity(text));
}
