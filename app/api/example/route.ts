import { complete } from "@bitbaum/ai-kit";
import { VARIETY } from "@/lib/variety/active";
import { examplePrompt } from "@/lib/variety/prompt";
import { usableExamples } from "@/lib/domain/saved/example";
import { isKeepable } from "@/lib/domain/saved/collection";
import { byokChain, readByok, redact } from "@/lib/domain/model/byok";
import { extractJson } from "@/lib/domain/chat/parse";
import { llmHealth } from "../chat/route";
import { callerKey, example as exampleLimit, tooMany } from "@/lib/domain/limits";

export const dynamic = "force-dynamic";

/** Short work. A model that has not answered by now is not going to. */
const TIMEOUT_MS = 15_000;

/**
 * Two short sentences using a word the learner just kept.
 *
 * Its own route rather than a mode of `/api/chat`, because it is a different
 * SHAPE of request: ~174 tokens of prompt instead of 2,234, no history, no
 * pictures, no thread, and an answer that is two strings rather than a turn in
 * a conversation. Folding it into the chat route would mean sending the entire
 * mode/gloss/suggestion contract to ask for a sentence — roughly ten times the
 * cost for a fraction of the work.
 *
 * FAILING IS FINE, and the client is built to expect it. The word is already
 * saved before this is called; examples are an improvement on a thing that
 * already works, so every failure path here returns an empty list with a 200
 * rather than an error the browser has to handle. Nothing the learner did is
 * lost by this route doing nothing.
 */
export async function POST(request: Request) {
  const allowed = exampleLimit.check(callerKey(request, "example"));
  if (!allowed.allowed) return tooMany(allowed);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ examples: [] });
  }

  const { target, bridge, byok } = (body ?? {}) as { target?: unknown; bridge?: unknown; byok?: unknown };
  const word = {
    target: typeof target === "string" ? target.trim() : "",
    bridge: typeof bridge === "string" ? bridge.trim() : "",
  };

  // The same test the saved list applies before keeping anything. A word it
  // would refuse to store is not a word worth spending a model call on.
  if (!isKeepable(word)) return Response.json({ examples: [] });

  // The learner's OWN key only. Nobody asked for this call: they tapped keep,
  // and the example is fired after the save as a side effect. A side effect
  // must not spend the free tier every app on the box shares, so without a
  // key there are no examples and the review card shows the sentence the word
  // came from — which is what it did before this route existed.
  const own = readByok(byok);
  const byokLinks = own.ok ? byokChain(own.config) : null;
  if (!byokLinks || byokLinks.chain.length === 0) return Response.json({ examples: [] });
  const { chain } = byokLinks;
  const env = { ...process.env, ...byokLinks.env };

  try {
    const { text: raw } = await complete({
      chain,
      env,
      health: llmHealth,
      // Low, but not zero. Two sentences about the same word at temperature 0
      // tend to be the same sentence twice, which is one example.
      temperature: 0.7,
      maxTokens: 200,
      timeoutMs: TIMEOUT_MS,
      signal: request.signal,
      messages: [{ role: "user", content: examplePrompt(VARIETY, word) }],
    });

    const parsed = extractJson(raw);
    const { examples, rejected } = usableExamples(parsed, word.target, VARIETY);

    // Logged because a gate that drops everything looks exactly like a model
    // that returned nothing, and the two need different fixes.
    if (examples.length === 0 && rejected.length > 0) {
      console.warn("[heidi/example] all rejected:", rejected.map((r) => r.reason).join("; "));
    }

    return Response.json({ examples });
  } catch (error) {
    // redact(): a vendor error can echo the request, and the request may have
    // carried somebody's key.
    console.error("[heidi/example]", redact(error instanceof Error ? error.message : String(error)));
    return Response.json({ examples: [] });
  }
}
