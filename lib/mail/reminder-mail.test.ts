import { test } from "node:test";
import assert from "node:assert/strict";
import { LOCALES } from "../i18n/locales.ts";
import { PROMISE, renderReminder, type ReminderInput } from "./reminder-mail.ts";
import { MAX_UNHEARD, MIN_DUE, MIN_GAP_MS } from "./reminder-policy.ts";

const NOW = new Date("2026-11-10T17:00:00Z");
const input = (over: Partial<ReminderInput> = {}): ReminderInput => ({
  locale: "de",
  due: 8,
  streak: 3,
  memory: {},
  now: NOW,
  practiceUrl: "https://heidi.orangecat.ch/de/practice",
  unsubscribeUrl: "https://heidi.orangecat.ch/de/unsubscribe?t=abc",
  settingsUrl: "https://heidi.orangecat.ch/de/settings#reminders",
  ...over,
});

test("every language says how many are due, has one way to practise and one way to stop", () => {
  for (const locale of LOCALES) {
    for (const due of [5, 8, 21]) {
      const mail = renderReminder(input({ locale, due }));
      assert.match(mail.subject, new RegExp(String(due)), `${locale} ${due}: subject carries the number`);
      assert.ok(mail.html.includes('href="https://heidi.orangecat.ch/de/practice"'), `${locale}: practice button`);
      assert.ok(mail.html.includes("unsubscribe?t=abc"), `${locale}: unsubscribe link`);
      assert.ok(mail.text.includes("unsubscribe?t=abc"), `${locale}: unsubscribe in the text twin`);
      assert.doesNotMatch(mail.subject + mail.html + mail.text, /\{(n|site)\}/, `${locale}: no unfilled placeholder`);
      assert.match(mail.html, /Heidi/, `${locale}: names the product`);
    }
  }
});

test("Russian counts correctly: 21 вопрос, 22 вопроса, 25 вопросов", () => {
  assert.match(renderReminder(input({ locale: "ru", due: 21 })).subject, /21 вопрос$/);
  assert.match(renderReminder(input({ locale: "ru", due: 22 })).subject, /22 вопроса/);
  assert.match(renderReminder(input({ locale: "ru", due: 25 })).subject, /25 вопросов/);
});

test("the streak is mentioned only when it is worth a number", () => {
  assert.doesNotMatch(renderReminder(input({ streak: 1 })).html, /Tage in Folge/);
  assert.match(renderReminder(input({ streak: 4 })).html, /Tage in Folge/);
});

test("it quotes one line that is really due, from the pack, and invents nothing", () => {
  const due = new Date("2026-11-09T00:00:00Z").getTime();
  const quoted = renderReminder(
    input({ memory: { "meaning:chind": { step: 1, due, seen: due - 1000, lapses: 0 }, "no-such-item": { step: 0, due: due - 5, seen: due - 9, lapses: 0 } } }),
  );
  assert.match(quoted.html, /Chind/, "a due pack item is quoted");
  assert.doesNotMatch(quoted.html, /no-such-item/);
  assert.ok(!renderReminder(input({ memory: {} })).html.includes("<blockquote"), "nothing due in memory: no quote, no error");
});

test("the footer's promises are the policy's numbers", () => {
  // The copy says «alle zwei Tage», «fünf», «drei». If the policy moves, the
  // words in six languages must be looked at; this is what makes that happen.
  assert.deepEqual(PROMISE, { everyDays: 2, minDue: 5, stopAfter: 3 });
  assert.equal(PROMISE.everyDays, Math.round(MIN_GAP_MS / 86_400_000));
  assert.equal(PROMISE.minDue, MIN_DUE);
  assert.equal(PROMISE.stopAfter, MAX_UNHEARD);
});

test("no loss framing, no guilt: the words that would say «you are about to lose it» are not there", () => {
  // HEIDI.md §3: counts of capability, framed as gain, never loss; no shaming reminder.
  const LOSS = /verlier|verpass|verschwind|vergess|versäum|perdre|perdu|oubli|effac|persa|perdi|dimentic|svan|emblid|perdai|lose|lost|miss(ed|ing)?\b|forget|fade|expire|ends tonight|потер|забы|забуд|пропуст/i;
  for (const locale of LOCALES) {
    const mail = renderReminder(input({ locale, streak: 5 }));
    const prose = (mail.subject + " " + mail.html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
    assert.doesNotMatch(prose, LOSS, `${locale}: ${prose.match(LOSS)?.[0]}`);
  }
});
