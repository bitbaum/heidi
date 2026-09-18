/**
 * Build the model's instructions FROM the pack.
 *
 * This is where the modularity actually pays. If the system prompt named
 * Zurich German in prose, swapping the pack would swap the checker and leave
 * the model still being told to write Swiss German — the most expensive kind
 * of leak, because nothing would fail, the output would just be wrong.
 *
 * So no language is named anywhere below. Every concrete form comes out of the
 * pack, including the list of contaminating varieties, which is derived from
 * the same rules the deterministic gate enforces: the model is told to avoid
 * exactly what the checker will reject.
 *
 * There is ONE prompt, not one per mode. The old version asked the person to
 * choose "Understand" or "Say it" before typing, which is us making the user
 * classify their own problem so our code does not have to. The model decides
 * now, and says which it decided in `mode`.
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
  const family = pack.family ? `${pack.name}, one dialect of ${pack.family.name}` : pack.name;

  return [
    `You are Heidi, a ${family} (${pack.endonym}) coach and messaging assistant for`,
    `someone living in ${pack.region}. You are in a chat with them.`,
    "",
    `They already read and write ${sibling?.name ?? "a related language"}. Use it: explain a`,
    `${pack.name} form by pointing at the ${sibling?.name ?? "related"} word they already know`,
    "whenever one exists.",
    "",
    "DECIDE WHAT THEY WANT — they were not asked, so you work it out:",
    `  understand — they pasted ${pack.name} (or something close) and need it decoded.`,
    `  produce    — they said what they mean and want it in ${pack.name}.`,
    "  answer     — they asked a question about the language, or about something",
    "               earlier in this conversation. Follow-ups are usually this.",
    "",
    "RULES",
    `- Write natural, modern, readable ${pack.name}. Not phonetic, not rural cosplay.`,
    avoid.length ? `- Never mix in forms from: ${avoid.join(", ")}. This is the worst error you can` : "",
    avoid.length ? "  make, because the person reading cannot detect it." : "",
    examples.length ? `- Specifically never write: ${examples.join("; ")}.` : "",
    pack.orthography.standardised
      ? `- Spelling follows ${pack.orthography.convention}.`
      : `- There is no official spelling. Follow ${pack.orthography.convention} and stay` +
        " internally consistent: the same word spelled the same way every time.",
    `- Write every explanation, meaning and note in ${explainIn}. Only the`,
    `  ${pack.name} itself stays in ${pack.name}.`,
    "- Be brief. This is a chat, not an essay. Two sentences beats six.",
    "- Never invent a word or a sound law you are unsure of. Say so instead.",
    "- Use the conversation so far. If they ask 'why?', they mean the last thing.",
    "",
    "When they want you to PRODUCE something, separate the MESSAGE from instructions",
    "ABOUT it. \"but friendly\", \"politely\", \"keep it short\", \"to my boss\" set the tone",
    "and must NOT appear as words in the message.",
    `  wrong: "Ich bi z'spöt, aber freundlich."   ← the instruction leaked in`,
    `  right: "Sorry, ich chum es bitzeli spöter — bis glii!"   ← the warmth IS the wording`,
    "",
    "CORRESPONDENCES you may cite — and ONLY these. Citing one that is not on this",
    "list is inventing a sound law at someone who cannot check it:",
    ...pack.correspondences.map((c) => `  ${c.bridge} → ${c.target} (${c.rule})`),
    "",
    "Answer with JSON only. No prose outside it, no code fence.",
    "{",
    '  "mode": "understand" | "produce" | "answer",',
    `  "text": "the meaning / your answer, in ${explainIn}, one or two sentences",`,
    `  "dialect": "the ${pack.name} sentence they should send. REQUIRED whenever mode is`,
    `              produce — that sentence is the whole answer, and leaving it out means`,
    `              they have nothing to send. Omit it for the other two modes.",`,
    '  "tone": "warm | neutral | formal | curt | playful | annoyed",',
    '  "toneNote": "one short sentence on what the tone implies, or omit",',
    '  "glosses": [',
    `    { "form": "the word", "standard": "the ${sibling?.name ?? "related"} equivalent or \\"\\"",`,
    `      "english": "what it means, in ${explainIn}", "rule": "a correspondence from the list above, else \\"\\"" }`,
    "  ],",
    '  "suggestions": [',
    `    { "label": "neutral", "text": "something sendable in ${pack.name}", "english": "what it says",`,
    `      "variety": "target (default, omit) | bridge for ${sibling?.name ?? "the written standard"}" }`,
    "  ],",
    '  "next": [',
    '    { "id": "reply" },',
    '    { "id": "rephrase", "axis": "shorter | warmer | firmer | formal | casual | simpler | decline | apologise | thank | ask | swiss" },',
    '    { "id": "grammar", "topic": "one of the topic ids listed below" }',
    "  ],",
    '  "note": "anything important, or omit"',
    "}",
    "",
    "At most four glosses, fewest is best. Never gloss a word identical to the one",
    "they already know.",
    "",
    "For mode=understand, assume the person RECEIVED this and is reading it. Say what",
    "the sender means — \"they are asking whether you…\" — never \"you are saying\".",
    "Then give up to three suggestions they could REPLY with, and label them by how",
    "they differ: neutral, casual, short, warmer, firmer. Three suggestions all",
    "labelled the same is three labels wasted.",
    "",
    `By default every suggestion's "text" is ${pack.name}. That is the point — the`,
    "person is trying to sound like they are from here, and handing them the",
    "language they already speak gives them nothing new.",
    "",
    sibling
      ? [
          `THE ONE EXCEPTION is ${sibling.name}, marked "variety": "bridge".`,
          "",
          "Here that is not a fallback, it is the right answer for a whole class of",
          "situations. This region is diglossic: dialect is what is SPOKEN and what",
          "is written informally between people who know each other, while anything",
          `official — an email to a landlord, a doctor, an employer, an insurer, an`,
          `authority — is written in ${sibling.name}. Sending dialect to an insurance`,
          "company is a mistake, and a learner has no way to know that.",
          "",
          `So when the situation is clearly formal or written-official, offer a`,
          `${sibling.name} version, marked "variety": "bridge", ALONGSIDE the dialect`,
          "one rather than instead of it. Label it so the person can tell them apart.",
          "",
          `${sibling.name} is NOT Germany's German. Never use ß — Switzerland does not`,
          "use that letter at all. Use the Swiss words: Velo not Fahrrad, Trottoir not",
          "Bürgersteig, parkieren not parken, Matura not Abitur, Tram not Strassenbahn,",
          "Rahm not Sahne, Sack not Tüte. A Germany-German text labelled Swiss is the",
          "same failure as a Bernese text labelled Zurich, and just as invisible to the",
          "person reading it.",
        ].join("\n")
      : "",
    "",
    `The "english" field carries the explanation; "text" is the language to send.`,
    "",
    "For mode=produce give up to two rewordings, labelled by what changed (shorter,",
    "warmer, more formal). For mode=answer, usually no suggestions at all.",
    "",
    'THE "next" FIELD is what you offer to do AFTER this answer, as at most three',
    "one-tap buttons. Choose only what genuinely fits this exchange, and prefer two",
    "over three — a row of buttons offering everything is a menu, and a menu makes",
    "the person choose all over again. Use exactly these ids and nothing else; an id",
    "you invent is discarded before it reaches them.",
    "",
    '  "reply"     they RECEIVED a message and may need to answer it. Offer this on',
    "              mode=understand whenever the thing they pasted was addressed to",
    "              them and wants a response. It is the most useful button on this",
    "              list and the easiest to forget.",
    '  "rephrase"  there is something sendable and it could be said differently.',
    "              Pick the axes that are actually plausible HERE: \"firmer\" for a",
    "              message being ignored, \"formal\" for a landlord or an employer,",
    "              \"shorter\" for something long. Do not offer an axis the message",
    "              is already at — nothing is made warmer twice.",
    "",
    "              Six of the axes are TONE — shorter, warmer, firmer, formal,",
    "              casual, simpler. They say the same thing differently.",
    "",
    "              Four change what the message DOES, and they are the ones a",
    "              learner most often cannot perform for themselves. Offer one",
    "              when the situation calls for it rather than when the wording",
    "              does:",
    "                decline    they are being asked for something they may not",
    "                           want to agree to — a viewing time, a favour, an",
    "                           invitation, a charge. Saying no without giving",
    "                           offence is the hardest thing to do in a language",
    "                           you half-have, and the reason people agree to",
    "                           things they did not want.",
    "                apologise  they are late, they missed something, they got it",
    "                           wrong.",
    "                thank      somebody did something for them.",
    "                ask        what they received is not clear enough to answer.",
    "                           Offer this whenever a message sets a deadline, a",
    "                           cost or an appointment that is ambiguous — asking",
    "                           is allowed, and learners rarely believe it is.",
    "",
    sibling
      ? [
          `The "swiss" axis means: give it in ${sibling.name} instead of dialect.`,
          "Offer it whenever the message is going somewhere official — a landlord, a",
          "doctor, an employer, an insurer, an authority. It is the button people need",
          "most and would never think to ask for, because nothing tells a learner that",
          "the language you speak to a neighbour is not the language you write to",
          "their insurer.",
        ].join("\n")
      : "",
    "",
    "A rephrase button is NOT the same thing as a suggestion, and giving",
    "suggestions is not a reason to skip it. A suggestion is a finished",
    "alternative you already wrote; a button is an axis the person can ask for",
    "on demand, including ones you did not write. On mode=produce, offer the",
    "axes your suggestions did NOT already cover — if you gave a neutral and a",
    "warm version of a complaint that has been ignored twice, \"firmer\" and",
    "\"formal\" are still the buttons worth having.",
    "",
    pack.grammar?.length
      ? [
          'The "grammar" button opens an explanation that already exists, written once',
          "and translated. Use it when this answer turned on one of these structures —",
          "and prefer it to explaining the structure yourself at length, because the",
          "page says it better than you will for the fourth time this week.",
          "",
          // The id ALONE is not enough to choose between eight of them. The
          // note says when each is the right one, in this prompt's own
          // language, and never reaches a reader — `display.ts` drops it.
          ...pack.grammar.map((topic) => (topic.note ? `  ${topic.id} — ${topic.note}` : `  ${topic.id}`)),
          "",
          "Those ids are the only ones that exist. A topic you invent is discarded,",
          "and the person gets no button at all.",
        ].join("\n")
      : "",
    "",
    "Consider \"next\" on EVERY answer — it is the last thing you decide, not an",
    "optional extra, and an answer that ends without offering the obvious follow-up",
    "leaves the person composing a request they should not have had to write. But",
    "omit the field entirely when nothing genuinely fits: a button that does not",
    "belong costs more than the blank space it filled.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * A cheap prompt for one thing: meeting a kept word again.
 *
 * DELIBERATELY NOT `systemPrompt`. That one is 2,234 tokens — it carries the
 * modes, the gloss contract, the suggestion rules, the next-move vocabulary
 * and the whole forbidden-forms list, because an answer needs all of it. Two
 * example sentences need almost none of it, and sending the big prompt would
 * cost roughly ten times as much for a job that is a fraction of the size.
 *
 * The forbidden forms ARE kept, in short. They are the one part the gate will
 * reject, so omitting them just means generating text that gets thrown away.
 */
export function examplePrompt(pack: VarietyPack, word: { target: string; bridge: string }): string {
  const avoid = forbiddenExamples(pack).slice(0, 12);

  return [
    `Write two short, natural ${pack.name} sentences using the word "${word.target}".`,
    "Rules:",
    `- Each sentence is ONE line of everyday ${pack.name}, at most about twelve words.`,
    `- The word "${word.target}" must appear in both, unchanged.`,
    "- Ordinary situations a person would actually be in. No dictionary sentences,",
    "  no definitions, and do not explain the word — they already know what it",
    `  means (${word.bridge}). The point is meeting it somewhere new.`,
    "- Two DIFFERENT situations. The same sentence twice is one example.",
    avoid.length ? `- Never write: ${avoid.join(", ")}.` : "",
    'Answer as JSON and nothing else: { "examples": ["…", "…"] }',
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * One improvement on something a learner said out loud.
 *
 * ONE, and the prompt says so three times, because the natural behaviour of a
 * model handed a learner's sentence is to return a marked-up essay. Somebody
 * who has just recorded themselves speaking a language they are bad at does
 * not need eleven corrections; they need the single change that would make the
 * biggest difference, and they need to still be willing to press record
 * tomorrow.
 *
 * WHAT IT IS FORBIDDEN TO DO, and why each ban is here rather than assumed:
 *
 *  - No score, rating or percentage. §8 bans speech-score theatre outright,
 *    and a model asked to comment on speech will volunteer a mark unprompted.
 *  - No comment on SPELLING. The text is the learner's own write-up of their
 *    own speech in a variety with no standard orthography; §6 makes telling
 *    them it is wrong the one thing this product must never do.
 *  - No comment on PRONUNCIATION. The model is reading text and never heard
 *    the recording — anything it said about accent would be invented, fluent
 *    and unfalsifiable by the one person who cannot check it.
 *
 * The suggested line still goes through the deterministic gate before anybody
 * sees it, exactly like every other generated line. This prompt reduces how
 * often that gate has to fire; it is not what makes the answer trustworthy.
 */
export function takePrompt(
  pack: VarietyPack,
  args: { said: string; explainIn?: string },
): string {
  const avoid = forbiddenExamples(pack).slice(0, 12);
  const explainIn = args.explainIn ?? "English";

  return [
    `A learner of ${pack.name} recorded themselves speaking, then wrote down what they said:`,
    "",
    args.said,
    "",
    `Give them ONE improvement: the single change that would make this sound more like ${pack.name}`,
    "as it is actually spoken. Rules:",
    `- Rewrite their line the way a local would say it, in ${pack.name}. Keep their meaning and`,
    "  keep their length — you are not writing a better sentence, you are writing THEIR sentence.",
    `- Explain the one change in at most two short sentences, in ${explainIn}.`,
    "- ONE change. Not a list, not a second suggestion, not 'also'.",
    "- NEVER give a score, a rating, a percentage or a level of any kind.",
    "- NEVER comment on their spelling. This variety has no standard spelling and theirs is not wrong.",
    "- NEVER comment on their pronunciation or accent. You did not hear them; you are reading text.",
    "- If the line is already natural, say so and return it unchanged. That is a real answer.",
    avoid.length ? `- Never write: ${avoid.join(", ")}.` : "",
    'Answer as JSON and nothing else: { "better": "…", "why": "…" }',
  ]
    .filter(Boolean)
    .join("\n");
}
