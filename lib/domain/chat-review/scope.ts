import { LOCALES } from "../../i18n/locales.ts";
import { VARIETY } from "../../variety/active.ts";
import { systemPrompt } from "../../variety/prompt.ts";
import { MAX_IMAGES } from "../chat/image.ts";
import { MAX_BODY } from "../conversations/rules.ts";

/**
 * What this assistant can do, for the judge that reads its transcripts.
 *
 * READ FROM THE PROMPT, not written beside it. The first paragraph and the
 * three modes are lifted from `systemPrompt` — the same text the model is
 * given — so the reviewer scores Heidi against what she was actually told to
 * be, and a change to the prompt changes the scope with it. What the prompt
 * does not say, because the model does not need to know it, is the product's
 * machinery: the gate every dialect line passes, the size of a message, and
 * what Heidi has NO way to do. Those come from the constants that enforce them.
 */
export function chatScope(): string {
  const prompt = systemPrompt(VARIETY, "the reader's own language");
  const [head] = prompt.split("\nRULES");
  const [identity, modes = ""] = head.split("\nDECIDE WHAT THEY WANT");
  const who = firstSentence(oneLine(identity));
  const wanted = ["understand", "produce", "answer"]
    .map((mode) => {
      const m = new RegExp(`${mode}\\s+—\\s+(.*?)(?=\\s+(?:produce|answer)\\s+—|$)`).exec(oneLine(modes));
      return `${mode} — ${firstSentence(m?.[1] ?? "").replace(/\.$/, "")}`;
    })
    .join("; ");
  return [
    who,
    `She works out, unasked, which of three things is wanted: ${wanted}.`,
    `Every ${VARIETY.name} line she offers passes a deterministic variety gate before it is shown; a line the gate refuses is marked as not sendable, never hidden.`,
    `Explanations are written in the reader's site language (${LOCALES.join(", ")}).`,
    `A message is at most ${MAX_BODY} characters and may carry up to ${MAX_IMAGES} pictures, which are read only when a reachable model can see.`,
    `She has no web search, no lookup and no tools beyond the variety pack — ${VARIETY.correspondences.length} sound correspondences she may cite and ${VARIETY.grammar?.length ?? 0} grammar topics she may link to — so anything else she must say she does not know.`,
  ].join(" ");
}

/** Prompt text as one line: the line breaks were for the model's eyes. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function firstSentence(text: string): string {
  const end = text.search(/\.(\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
}
