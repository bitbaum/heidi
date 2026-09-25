import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { check, checkAgainst } from "../variety/check.ts";
import { bridgeRules } from "../variety/bridge.ts";
import { VARIETY } from "../variety/active.ts";
import { SOURCES } from "../research/sources.ts";
import { getDictionary } from "../i18n/index.ts";
import { LOCALES } from "../i18n/locales.ts";
import { CARE } from "./packs/gsw-zh-care.ts";
import { EVERYDAY } from "./packs/gsw-zh-everyday.ts";
import { SITUATIONS } from "./active.ts";
import { DOMAINS, SCENES } from "./display.ts";
import { phrasesOf, resolvesTo, type SituationPack } from "./pack.ts";

/**
 * The contract every situation pack keeps, run over every pack there is.
 *
 * WHY A CONTRACT SUITE RATHER THAN TESTS PER PACK. The variety layer made this
 * argument first and it holds harder here: a half-finished pack should turn
 * the build red rather than ship, because the failure mode is not a missing
 * page. It is a page of plausible sentences in a language the reader cannot
 * audit — and the reader here is somebody about to say one of them to a
 * frightened person at six in the morning.
 *
 * Every pack added to `active.ts` is tested by this file without anybody
 * writing a new test, which is the only version of this that survives a second
 * domain.
 */

/** Written as a list so a second pack is one edit, not a new describe block. */
const PACKS: readonly SituationPack[] = [EVERYDAY, CARE];

describe("every situation pack", () => {
  for (const pack of PACKS) {
    describe(pack.id, () => {
      test("is written in a variety some pack actually teaches", () => {
        // Not `=== VARIETY.tag`: a repo may legitimately carry a pack for a
        // variety this BUILD does not serve, which is what `active.ts`
        // filters. What it must never carry is a tag belonging to nothing.
        assert.ok(pack.variety.trim(), "a pack with no variety tag cannot be filtered by one");
      });

      test("has situations, and each has lines", () => {
        assert.ok(pack.situations.length > 0, "a domain with no scenes is a heading");
        for (const situation of pack.situations) {
          assert.ok(
            situation.phrases.length >= 4,
            `${situation.id} has ${situation.phrases.length} lines; fewer than four is an anecdote, not a scene`,
          );
        }
      });

      test("every line passes the deterministic variety gate", () => {
        /**
         * THE ONE THAT MATTERS MOST.
         *
         * §2: the learner is buying this variety precisely because they do not
         * have it, so they cannot tell a Zurich sentence from a Bernese one.
         * A human reviewer cannot reliably tell either, at sixty lines, on the
         * fourth read. The gate can, every time, for nothing — and it is the
         * same gate the product already runs over the model's output, so a
         * phrase file held to a lower standard than a chat reply would be the
         * inversion of the whole argument.
         *
         * `foreign` is the generation threshold: never ship another variety's
         * forms.
         */
        for (const phrase of phrasesOf(pack)) {
          const result = check(phrase.target, VARIETY, "foreign");
          assert.ok(
            result.ok,
            `"${phrase.target}" — ${result.findings.map((f) => `${f.form} (${f.origin ?? f.reason})`).join(", ")}`,
          );
        }
      });

      test("every bridge is Swiss Standard German, not Germany's", () => {
        /**
         * The target gate, one variety over.
         *
         * The bridge is what a learner anchors the line to and what they will
         * write back to a landlord or a doctor, and it is the half nobody
         * checked: `neighbours` glossed «S Velo» as "Das Fahrrad" and `meals`
         * glossed «Poulet» as "Hähnchen" — fluent German, marking the reader
         * as foreign in exactly the way `bridgeRules` exists to catch. Same
         * gate, same `foreign` threshold as the target.
         */
        const rules = bridgeRules(VARIETY);
        for (const phrase of phrasesOf(pack)) {
          const result = checkAgainst(phrase.bridge, rules, "foreign");
          assert.ok(
            result.ok,
            `"${phrase.bridge}" — ${result.findings.map((f) => `${f.form} → ${f.suggest ?? "?"}`).join(", ")}`,
          );
        }
      });

      test("every line names a source that exists", () => {
        for (const phrase of phrasesOf(pack)) {
          assert.ok(phrase.source in SOURCES, `"${phrase.target}" cites "${phrase.source}", which is not a source`);
        }
      });

      test("every grammar link resolves to a topic the variety pack has", () => {
        // A dead id is not a broken link here — it is a scene silently
        // offering no way into the grammar section, which is the one thing
        // situations were supposed to add over a phrase list.
        const topics = VARIETY.grammar ?? [];
        for (const phrase of phrasesOf(pack)) {
          if (!phrase.grammar) continue;
          assert.ok(
            resolvesTo(phrase.grammar, topics),
            `"${phrase.target}" points at grammar topic "${phrase.grammar}", which the pack does not have`,
          );
        }
      });

      test("no line is identical in both varieties", () => {
        // A row whose two halves are the same string teaches nothing — the
        // vocabulary test refuses exactly this, and a whole sentence that
        // survives the bridge unchanged is a sentence nobody needed us for.
        for (const phrase of phrasesOf(pack)) {
          assert.notEqual(
            phrase.target.toLowerCase(),
            phrase.bridge.toLowerCase(),
            `"${phrase.target}" is the same in both varieties`,
          );
        }
      });

      test("is mostly things the learner HEARS", () => {
        /**
         * The pack staying inside the product's own thesis, as a number.
         *
         * §1 puts listening first and speaking last on purpose: understanding
         * dialect and replying in Standard German is a complete way to take
         * part. A domain pack is the easiest place in this codebase to forget
         * that, because a phrasebook is the obvious shape and a phrasebook is
         * all `say`.
         *
         * A third is the floor rather than a half, because `care` legitimately
         * leans on production — the reply to somebody frightened at six in the
         * morning is not a sentence you get to compose in another language
         * first — and a rule that made the honest pack fail would be a rule
         * nobody keeps.
         */
        const phrases = phrasesOf(pack);
        const heard = phrases.filter((p) => p.direction === "hear").length;
        assert.ok(
          heard >= phrases.length / 3,
          `${pack.id} is ${heard}/${phrases.length} heard; a pack that is nearly all "say" has become a phrasebook`,
        );
      });
    });
  }

  test("no two scenes share an id", () => {
    // Scene ids are the URL, flat across domains. A clash would serve one
    // domain's scene at the other's address, and the loser would be whichever
    // pack `active.ts` lists second — a bug that depends on array order.
    const ids = PACKS.flatMap((p) => p.situations.map((s) => s.id));
    assert.deepEqual([...new Set(ids)], ids, "two scenes claim the same URL");
  });

  test("no two domains share an id", () => {
    const ids = PACKS.map((p) => p.id);
    assert.deepEqual([...new Set(ids)], ids, "two domains claim the same key");
  });
});

/**
 * The join between the packs and the seven dictionaries — same shape, same
 * failure and same fix as the grammar topics: a key on one side and not the
 * other renders a heading with nothing under it, in six languages, because
 * whoever added it checked German.
 */
describe("situations and their words", () => {
  test("every scene has its words in every language", () => {
    for (const locale of LOCALES) {
      const t = getDictionary(locale).situations;
      for (const scene of SCENES) {
        const words = t.scenes[scene.id as keyof typeof t.scenes];
        assert.ok(words, `${locale} has no words for the "${scene.id}" scene`);
        assert.ok(words.title.trim(), `${locale}.${scene.id} has no title`);
        assert.ok(words.scene.trim(), `${locale}.${scene.id} does not say what the moment is`);
      }
      for (const domain of DOMAINS) {
        const words = t.domains[domain.id as keyof typeof t.domains];
        assert.ok(words, `${locale} has no words for the "${domain.id}" domain`);
        assert.ok(words.title.trim() && words.lead.trim(), `${locale}.${domain.id} is missing its heading`);
      }
      assert.ok(t.title.trim() && t.lead.trim(), `${locale} is missing the index page's own words`);
      assert.ok(t.hear.trim() && t.say.trim(), `${locale} cannot label which way a line travels`);
      assert.ok(t.verified.trim(), `${locale} cannot say how the pack is verified — which it must`);
    }
  });

  test("no dictionary describes a scene no pack has", () => {
    const known = new Set(SCENES.map((s) => s.id));
    for (const locale of LOCALES) {
      for (const id of Object.keys(getDictionary(locale).situations.scenes)) {
        assert.ok(known.has(id), `${locale} describes the "${id}" scene, which is in no pack`);
      }
    }
  });
});

/**
 * The projection guard.
 *
 * `lib/variety/display.test.ts` makes this argument at length: English written
 * for maintainers reached readers three times, and the fix that ended it was a
 * projection plus a walk asserting the forbidden keys are gone.
 *
 * Nothing in a situation pack carries those keys TODAY, so this test passes
 * trivially — and that is exactly when it is worth writing. The pull request
 * that adds a `note` to `Situation`, explaining in English when a scene
 * applies, is an entirely reasonable pull request. This is what stops it
 * rendering in Russian.
 */
describe("the situations projection", () => {
  const SOURCE_ONLY = ["reason", "cue", "note", "who", "because"] as const;

  test("carries no source-language field", () => {
    const seen: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
      if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) {
          if ((SOURCE_ONLY as readonly string[]).includes(k)) seen.push(`${path}.${k}`);
          walk(v, `${path}.${k}`);
        }
      }
    };
    walk(DOMAINS, "DOMAINS");

    assert.deepEqual(seen, [], `source-language fields leaked into the situations projection: ${seen.join(", ")}`);
  });

  test("serves only packs written in the variety this build teaches", () => {
    for (const pack of SITUATIONS) {
      assert.equal(pack.variety, VARIETY.tag, `${pack.id} is in ${pack.variety} but this build teaches ${VARIETY.tag}`);
    }
  });

  test("says whether a native speaker has read each domain", () => {
    // Not "is reviewed" — `false` is a legitimate and expected answer. What is
    // refused is a domain that claims a review without naming who did it.
    for (const domain of DOMAINS) {
      if (domain.nativeReviewed) {
        assert.ok(domain.reviewedBy?.trim(), `${domain.id} claims a native review but names nobody`);
      }
    }
  });
});
