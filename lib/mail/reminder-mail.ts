import { renderMail, type MailBlock } from "@bitbaum/mail-kit";
import { recapOf } from "../domain/practice/answer.ts";
import type { Memory } from "../domain/practice/memory.ts";
import { PACK_ITEMS } from "../domain/practice/published.ts";
import { MAIL_BRAND } from "../auth/mail-copy.ts";
import { ASSISTANT_NAME } from "../config/site.ts";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locales.ts";
import { plural, type Plural } from "../i18n/plural.ts";
import { MIN_GAP_MS, MIN_DUE, MAX_UNHEARD } from "./reminder-policy.ts";

/**
 * The "questions are due" reminder, in the reader's language.
 *
 * WHAT IT IS FOR. Heidi schedules each question for the moment it is best
 * kept; the reminder is that schedule speaking. HEIDI.md §3 refuses loss
 * framing and shaming reminders, so it is worded as a good moment to take, never
 * as something about to be lost — and a test fails on the words that would say so.
 * It says how many are due and roughly how long that takes, shows ONE real
 * line that is due (so there is something to recognise rather than a number to
 * resent), gives one button, and says plainly why the mail exists and how to
 * stop it. No exclamation marks, no "we miss you", nothing that pretends to be
 * a person.
 *
 * Swiss German readers get Standard German, like the account mail and the
 * account screens: the written standard is what a form is read in.
 */
type Copy = {
  subject: Plural;
  heading: Plural;
  preheader: string;
  lead: string;
  stats: { due: string; streak: string };
  recall: string;
  button: string;
  /** `{site}`; says the cadence and the off switch in numbers. */
  reason: string;
  unsubscribe: string;
  preferences: string;
};


const COPY: Partial<Record<Locale, Copy>> = {
  de: {
    subject: { one: "1 Frage wartet auf Sie", few: "{n} Fragen warten auf Sie", many: "{n} Fragen warten auf Sie", other: "{n} Fragen warten auf Sie" },
    heading: { one: "Heute ist **1 Frage** fällig", few: "Heute sind **{n} Fragen** fällig", many: "Heute sind **{n} Fragen** fällig", other: "Heute sind **{n} Fragen** fällig" },
    preheader: "Der beste Zeitpunkt zum Festigen: etwa drei Minuten.",
    lead: "Jetzt ist der richtige Moment, diese Wörter und Sätze zu festigen. Drei Minuten, und Sie behalten sie ein paar Tage länger.",
    stats: { due: "fällig", streak: "Tage in Folge" },
    recall: "Eines davon — wissen Sie noch, was es heisst?",
    button: "Jetzt üben",
    reason: "Sie bekommen diese Mail, weil Sie in {site} Erinnerungen eingeschaltet haben — höchstens alle zwei Tage und nur, wenn mindestens fünf Fragen fällig sind. Nach drei unbeantworteten hören wir von selbst auf.",
    unsubscribe: "Nicht mehr erinnern",
    preferences: "Einstellungen",
  },
  fr: {
    subject: { one: "1 question vous attend", few: "{n} questions vous attendent", many: "{n} questions vous attendent", other: "{n} questions vous attendent" },
    heading: { one: "**1 question** à revoir aujourd’hui", few: "**{n} questions** à revoir aujourd’hui", many: "**{n} questions** à revoir aujourd’hui", other: "**{n} questions** à revoir aujourd’hui" },
    preheader: "Le bon moment pour les ancrer : environ trois minutes.",
    lead: "C’est le bon moment pour ancrer ces mots et ces phrases. Trois minutes, et vous les gardez quelques jours de plus.",
    stats: { due: "à revoir", streak: "jours de suite" },
    recall: "L’un d’eux — vous souvenez-vous de ce qu’il veut dire ?",
    button: "S’exercer",
    reason: "Vous recevez ce message parce que vous avez activé les rappels dans {site} — au plus tous les deux jours, et seulement s’il y a au moins cinq questions à revoir. Après trois rappels restés sans réponse, nous nous arrêtons de nous-mêmes.",
    unsubscribe: "Ne plus me rappeler",
    preferences: "Réglages",
  },
  it: {
    subject: { one: "1 domanda ti aspetta", few: "{n} domande ti aspettano", many: "{n} domande ti aspettano", other: "{n} domande ti aspettano" },
    heading: { one: "Oggi c’è **1 domanda** da rivedere", few: "Oggi ci sono **{n} domande** da rivedere", many: "Oggi ci sono **{n} domande** da rivedere", other: "Oggi ci sono **{n} domande** da rivedere" },
    preheader: "Il momento giusto per fissarle: circa tre minuti.",
    lead: "È il momento giusto per fissare queste parole e queste frasi. Tre minuti, e le ricordi qualche giorno in più.",
    stats: { due: "da rivedere", streak: "giorni di fila" },
    recall: "Una di queste — ricordi che cosa significa?",
    button: "Esercitati ora",
    reason: "Ricevi questa e-mail perché hai attivato i promemoria in {site} — al massimo ogni due giorni e solo se ci sono almeno cinque domande da rivedere. Dopo tre promemoria senza risposta ci fermiamo da soli.",
    unsubscribe: "Non ricordarmelo più",
    preferences: "Impostazioni",
  },
  rm: {
    subject: { one: "1 dumonda spetga", few: "{n} dumondas spetgan", many: "{n} dumondas spetgan", other: "{n} dumondas spetgan" },
    heading: { one: "Oz ei **1 dumonda** da repeter", few: "Oz èn **{n} dumondas** da repeter", many: "Oz èn **{n} dumondas** da repeter", other: "Oz èn **{n} dumondas** da repeter" },
    preheader: "Il bun mument per als fixar: var trais minutas.",
    lead: "Ussa è il bun mument per fixar quests pleds e quellas frasas. Trais minutas, ed Vus als mantegnis in per dis dapli.",
    stats: { due: "da repeter", streak: "dis in suenter l’auter" },
    recall: "Ina da quellas — savais Vus anc, tge che ella vul dir?",
    button: "Exercitar ussa",
    reason: "Vus retschaivais questa e-mail perquai che Vus avais activà las regurdientschas en {site} — il pli savens mintga dus dis e mo sch’i dat almain tschintg dumondas da repeter. Suenter trais senza resposta ans fermain nus sezs.",
    unsubscribe: "Betg pli regurdar",
    preferences: "Parameters",
  },
  en: {
    subject: { one: "1 question is waiting for you", few: "{n} questions are waiting for you", many: "{n} questions are waiting for you", other: "{n} questions are waiting for you" },
    heading: { one: "**1 question** is due today", few: "**{n} questions** are due today", many: "**{n} questions** are due today", other: "**{n} questions** are due today" },
    preheader: "The right moment to lock them in: about three minutes.",
    lead: "Now is the right moment to lock these words and sentences in. Three minutes, and you keep them a few days longer.",
    stats: { due: "due", streak: "days in a row" },
    recall: "One of them — do you still know what it means?",
    button: "Practise now",
    reason: "You get this email because you switched reminders on in {site} — at most every two days, and only when at least five questions are due. After three that go unanswered, we stop on our own.",
    unsubscribe: "Stop reminding me",
    preferences: "Settings",
  },
  ru: {
    subject: { one: "Вас ждёт {n} вопрос", few: "Вас ждут {n} вопроса", many: "Вас ждут {n} вопросов", other: "Вас ждут {n} вопроса" },
    heading: { one: "Сегодня пора повторить **{n} вопрос**", few: "Сегодня пора повторить **{n} вопроса**", many: "Сегодня пора повторить **{n} вопросов**", other: "Сегодня пора повторить **{n} вопроса**" },
    preheader: "Лучший момент, чтобы закрепить: около трёх минут.",
    lead: "Сейчас самое время закрепить эти слова и фразы. Три минуты — и вы запомните их на несколько дней дольше.",
    stats: { due: "к повторению", streak: "дней подряд" },
    recall: "Одно из них — помните, что оно значит?",
    button: "Заниматься",
    reason: "Вы получаете это письмо, потому что включили напоминания в {site} — не чаще раза в два дня и только если к повторению не меньше пяти вопросов. После трёх напоминаний без ответа мы замолкаем сами.",
    unsubscribe: "Больше не напоминать",
    preferences: "Настройки",
  },
};

function copyFor(locale: Locale): Copy {
  const copy = COPY[locale] ?? COPY[DEFAULT_LOCALE];
  if (!copy) throw new Error("reminder mail has no copy in the default locale");
  return copy;
}

/** One real due line, so the mail holds something to recognise. Only pack items: never invented. */
function lineFrom(memory: Memory, at: Date): string | null {
  const due = Object.entries(memory)
    .filter(([, card]) => card.due <= at.getTime())
    .sort(([, a], [, b]) => a.due - b.due)
    .map(([id]) => id);
  const byId = new Map(PACK_ITEMS.map((item) => [item.id, item]));
  for (const id of due) {
    const item = byId.get(id);
    if (!item) continue;
    const { dialect } = recapOf(item);
    if (dialect && dialect.length <= 60) return dialect;
  }
  return null;
}

export type ReminderInput = {
  locale: Locale;
  due: number;
  streak: number;
  memory: Memory;
  now: Date;
  /** Opens practice, in the reader's language. */
  practiceUrl: string;
  /** The page a person lands on to stop these (needs one tap). */
  unsubscribeUrl: string;
  settingsUrl: string;
};

export function renderReminder(input: ReminderInput): { subject: string; html: string; text: string } {
  const c = copyFor(input.locale);
  const named = (s: string) => s.replaceAll("{site}", ASSISTANT_NAME);
  const n = { n: String(input.due) };
  const line = lineFrom(input.memory, input.now);

  const blocks: MailBlock[] = [
    { type: "paragraph", text: c.lead },
    {
      type: "stats",
      items: [
        { value: String(input.due), label: c.stats.due },
        ...(input.streak >= 2 ? [{ value: String(input.streak), label: c.stats.streak }] : []),
      ],
    },
    ...(line ? [{ type: "quote" as const, text: line, cite: c.recall }] : []),
    { type: "button", label: c.button, url: input.practiceUrl },
  ];

  const mail = renderMail(MAIL_BRAND, {
    lang: input.locale,
    preheader: c.preheader,
    heading: plural(c.heading, input.due, input.locale, n),
    blocks,
    footer: {
      reason: named(c.reason),
      unsubscribe: { label: c.unsubscribe, url: input.unsubscribeUrl },
      preferences: { label: c.preferences, url: input.settingsUrl },
    },
  });
  return { subject: plural(c.subject, input.due, input.locale, n), ...mail };
}

/** The numbers the footer promises, in one place with the policy that enforces them. */
export const PROMISE = { everyDays: Math.round(MIN_GAP_MS / 86_400_000), minDue: MIN_DUE, stopAfter: MAX_UNHEARD } as const;
