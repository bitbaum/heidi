import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ADVERTISED_TEST_FILES, METRICS, METRICS_READ_ON, SECTIONS } from "./investors.ts";
import { FORBIDDEN_CLAIMS } from "./sectors.ts";
import { SITUATIONS } from "../situations/active.ts";
import { PACK_ITEMS } from "../domain/practice/published.ts";

/**
 * The data room may understate the repository. It may never overstate it.
 *
 * WHAT WENT WRONG. The metrics said "65 merged pull requests" and "400+ tests
 * across 45 files", read on 2026-09-17 — a date that appeared in a source
 * comment and nowhere a reader could see it. Five days later the true figures
 * were 92 and 814 across 91. Nobody was misled in the dangerous direction that
 * time, and that is luck rather than design: the same mechanism that let a
 * number go stale downward lets one go stale upward the first time a file is
 * deleted.
 *
 * THE ASYMMETRY IS THE WHOLE TEST. A claim that undersells the repository is
 * merely out of date, and the "counted on" line now on the page says so. A
 * claim that oversells it is a false statement in a document whose entire
 * argument is that every number has a command beside it — and an investor who
 * catches one inflated figure has just learned what the others are worth.
 *
 * So: stated ≤ actual, and nothing else. Adding tests never fails this;
 * deleting them does, which is exactly the moment the sentence stops being
 * true.
 */
describe("the data room", () => {
  const testFiles = (dir: string, found: string[] = []): string[] => {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry === ".next") continue;
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) testFiles(path, found);
      else if (entry.endsWith(".test.ts")) found.push(path);
    }
    return found;
  };

  test("the advertised test count does not overstate the repository", () => {
    const actual = [...testFiles("app"), ...testFiles("lib")].length;
    assert.ok(
      ADVERTISED_TEST_FILES <= actual,
      `the data room claims ${ADVERTISED_TEST_FILES} test files and the repository has ${actual}`,
    );
  });

  test("the advertised situation and question counts do not overstate the product", () => {
    // The same asymmetry as the test count, for the two figures the content
    // decides. Both are read from the modules the pages render, so deleting a
    // scene or a line that fed a question turns this red the day the claim
    // stops being true.
    const stated = (label: string) => Number(METRICS.find((m) => m.label === label)?.value);
    const scenes = SITUATIONS.flatMap((pack) => pack.situations).length;

    assert.ok(
      stated("Situations, with per-situation mastery") <= scenes,
      `the data room claims ${stated("Situations, with per-situation mastery")} situations and the product has ${scenes}`,
    );
    assert.ok(
      stated("Practice questions") <= PACK_ITEMS.length,
      `the data room claims ${stated("Practice questions")} practice questions and the product has ${PACK_ITEMS.length}`,
    );
  });

  test("the numbers say when they were counted", () => {
    // The fix for the stale figures was not better numbers, it was a date. A
    // page of counts with no date is the defect; this asserts the date exists
    // and is rendered from the same module the counts come from.
    assert.match(METRICS_READ_ON, /\d{4}$/, "the read-on date should end in a year");
  });

  test("every metric says how to check it", () => {
    // `Metric.verify` is the whole discipline of the page — a figure without
    // one is an assertion, and this room replaces traction with checkability.
    for (const metric of METRICS) {
      assert.ok(metric.verify.trim().length > 0, `${metric.label} has no way to check it`);
    }
  });

  test("the room does not make the claims the sector page forbids", () => {
    /**
     * `FORBIDDEN_CLAIMS` was written for `/organisations` — customers, case
     * study, trusted by, proven — and every word of it applies here with more
     * force, because this is the document where inflating one number is most
     * tempting and most expensive.
     *
     * Reusing that list rather than copying it: two registers of forbidden
     * claims would drift, and the one that drifts is the one nobody is
     * reading when they write the sentence.
     */
    const prose = [
      ...METRICS.map((m) => `${m.label} ${m.value} ${m.verify}`),
      ...SECTIONS.flatMap((s) => [s.title, ...s.body]),
    ]
      .join(" ")
      .toLowerCase();

    for (const claim of FORBIDDEN_CLAIMS) {
      // "Paying customers: none" is the row that states there are none, and a
      // naive substring match would flag it for containing the word. The
      // register's phrases are possessive or collective ("our customers",
      // "clients") precisely so that stating an absence stays legal.
      assert.ok(!prose.includes(claim.toLowerCase()), `the data room says "${claim}"`);
    }
  });
});
