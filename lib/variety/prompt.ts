/**
 * Build the model's instructions FROM the pack.
 *
 * This is where the modularity actually pays. If the system prompt named
 * Zurich German in prose, swapping the pack would swap the checker and leave
 * the model still being told to write Swiss German — the most expensive kind
 * of leak, because nothing would fail, the output would just be wrong.
 *
 * So there is no language named anywhere below. Every concrete form comes out
 * of the pack, including the list of contaminating varieties, which is derived
 * from the same rules the deterministic gate enforces. The model is told to
 * avoid exactly what the gate will reject.
 */

import type { VarietyPack } from "./pack.ts";
import { siblingOf } from "./pack.ts";

/** The varieties this pack actively guards against, for the prompt's "avoid" line. */
function contaminants(pack: VarietyPack): string[] {
  const seen = new Set<string>();
  for (const rule of pack.rules) {
    if (rule.severity === "foreign" && rule.origin) seen.add(rule.origin);
  }
  return [...seen];
}

/** Concrete forms the gate rejects, so the model sees examples and not only a rule. */
function forbiddenExamples(pack: VarietyPack): string[] {
  return pack.rules
    .filter((r) => typeof r.match === "string")
    .map((r) => (r.suggest ? `${String(r.match)} (write ${r.suggest})` : String(r.match)));
}

export function systemPrompt(pack: VarietyPack, explainIn = "English"): string {
  const sibling = siblingOf(pack);
  const avoid = contaminants(pack);
  const examples = forbiddenExamples(pack);

  const lines = [
    `You are a ${pack.name} (${pack.endonym}) coach and messaging assistant for someone living in ${pack.region}.`,
    "",
    `They already read and write ${sibling?.name ?? "a related language"}. Use that: explain a ${pack.name} form by`,
    `pointing at the ${sibling?.name ?? "related"} word they already know whenever one exists.`,
    "",
    "RULES",
    `- Write natural, modern, readable ${pack.name}. Not phonetic, not rural cosplay.`,
    avoid.length ? `- Never mix in forms from: ${avoid.join(", ")}. This is the single worst error you can make,` : "",
    avoid.length ? "  because the person reading cannot detect it." : "",
    examples.length ? `- Specifically never write: ${examples.join("; ")}.` : "",
    pack.orthography.standardised
      ? `- Spelling follows ${pack.orthography.convention}.`
      : `- There is no official spelling. Follow ${pack.orthography.convention} and be internally consistent:` +
        " the same word must be spelled the same way every time it appears in your answer.",
    // The reader's own language, not the target and not a default. Someone
    // reading the Italian site is not helped by English glosses.
    `- Write ALL explanations, meanings and notes in ${explainIn}. Only the`,
    `  ${pack.name} itself stays in ${pack.name}.`,
    "- Explanations are short, and attached to something the person actually wrote.",
    "- Never invent a word you are unsure of. If you are unsure, say so in the meaning field.",
    "",
    "CORRESPONDENCES you may cite when they explain a specific word:",
    ...pack.correspondences.map((c) => `- ${c.bridge} → ${c.target} (${c.rule})`),
    "",
    "Answer with JSON only. No prose outside the JSON, no code fence.",
  ];

  return lines.filter(Boolean).join("\n");
}

/** Asked when the user gives us text in the target variety they want decoded. */
export function understandPrompt(pack: VarietyPack, input: string, explainIn = "English"): string {
  const sibling = siblingOf(pack);
  return [
    // The key is called "english" for historical reasons; its CONTENT follows
    // the reader's language. Saying so beats renaming the key in five places.
    `Note: the JSON key "english" means "the explanation", and must be written in ${explainIn}.`,
    "",
    `The person received this and does not fully understand it. It should be ${pack.name}, but it may not be —`,
    "if it is from a different variety or a different language entirely, say so in `note`.",
    "",
    "```",
    input,
    "```",
    "",
    "Return exactly this JSON shape:",
    "{",
    '  "meaning": "what it says, in the explanation language, one or two sentences",',
    '  "tone": "one of: warm, neutral, formal, curt, playful, annoyed",',
    '  "toneNote": "one short sentence on what the tone implies socially, or \\"\\"",',
    '  "glosses": [',
    `    { "form": "the word as written", "standard": "the ${sibling?.name ?? "related-language"} equivalent or \\"\\"",`,
    '      "english": "what it means", "rule": "the sound correspondence if one applies, else \\"\\"" }',
    "  ],",
    '  "replies": [',
    `    { "label": "neutral", "text": "a reply in ${pack.name}", "english": "what the reply says" },`,
    '    { "label": "casual", "text": "...", "english": "..." },',
    '    { "label": "short", "text": "...", "english": "..." }',
    "  ],",
    '  "note": "anything important, or \\"\\""',
    "}",
    "",
    "Gloss only the words the person plausibly would not know — at most six, fewest is best.",
    "Do not gloss words identical to the one they already know.",
  ].join("\n");
}

/** Asked when the user gives us what they want to say and wants it in the variety. */
export function producePrompt(pack: VarietyPack, input: string, explainIn = "English"): string {
  return [
    `Note: the JSON key "english" means "the explanation", and must be written in ${explainIn}.`,
    "",
    `The person wants to say something in ${pack.name}. It may be written in any language.`,
    "",
    "```",
    input,
    "```",
    "",
    "FIRST decide which part is the message and which part is an instruction about",
    "how to say it. Phrases such as \"but friendly\", \"politely\", \"keep it short\",",
    '"to my boss", "without sounding cold" are instructions. They belong in `tone` and',
    "`toneNote`. They must NOT appear as words in the message.",
    "",
    `Worked example — input: "tell them I'm late, but friendly".`,
    '  wrong: "Ich bi z\'spöt, aber freundlich."   ← "friendly" leaked into the message',
    '  right: "Sorry, ich chum es bitzeli spöter — bis glii!"   ← the warmth IS the wording',
    "",
    "Write only the words they would actually send.",
    "",
    "Return exactly this JSON shape:",
    "{",
    `  "meaning": "the ${pack.name} sentence they should send — this field holds the translation itself",`,
    '  "tone": "one of: warm, neutral, formal, curt, playful, annoyed",',
    '  "toneNote": "one short sentence on who this is appropriate to send to, or \\"\\"",',
    '  "glosses": [',
    '    { "form": "a word in your translation worth knowing", "standard": "the equivalent they know",',
    '      "english": "what it means", "rule": "the correspondence if one applies, else \\"\\"" }',
    "  ],",
    '  "replies": [',
    `    { "label": "warmer", "text": "the same message, warmer", "english": "..." },`,
    '    { "label": "shorter", "text": "the same message, shorter", "english": "..." }',
    "  ],",
    '  "note": "anything important, or \\"\\""',
    "}",
    "",
    "At most four glosses. Pick the words that carry the most reuse.",
  ].join("\n");
}
