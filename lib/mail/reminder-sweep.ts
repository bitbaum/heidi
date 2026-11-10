import { isMailConfigured, listUnsubscribeHeaders, sendMail } from "@bitbaum/mail-kit";
import { SITE_URL } from "../config/site.ts";
import { href } from "../i18n/routes.ts";
import { decideReminder } from "./reminder-policy.ts";
import { renderReminder } from "./reminder-mail.ts";
import { markReminded, reminderCandidates } from "./store.ts";
import { oneClickUrl, unsubscribeToken } from "./unsubscribe.ts";

export type SweepReport = {
  mail: "configured" | "unconfigured";
  candidates: number;
  sent: number;
  failed: number;
  skipped: Record<string, number>;
};

/**
 * Hourly: write to everyone whose evening it is, who asked, and who the
 * policy says is worth interrupting. `lib/mail/reminder-policy.ts` decides;
 * this only carries the decision out.
 *
 * Idempotent by construction: the idempotency key is the person and the local
 * day, so a retried sweep, or two overlapping ones, cannot send twice, and
 * `last_reminder_at` is written only once the mail was accepted.
 */
export async function sweepReminders(now = new Date()): Promise<SweepReport> {
  const report: SweepReport = { mail: "configured", candidates: 0, sent: 0, failed: 0, skipped: {} };
  if (!isMailConfigured()) return { ...report, mail: "unconfigured" };

  const candidates = await reminderCandidates(now);
  report.candidates = candidates.length;

  for (const person of candidates) {
    try {
      const verdict = decideReminder({
        reminders: true,
        emailVerified: person.emailVerified,
        deliverable: person.deliverable,
        tz: person.tz,
        accountCreatedAt: person.createdAt,
        due: person.due,
        lastActiveAt: person.lastActiveAt,
        lastReminderAt: person.lastReminderAt,
        unheard: person.ignored,
        now,
      });
      if (!verdict.send) {
        report.skipped[verdict.why] = (report.skipped[verdict.why] ?? 0) + 1;
        continue;
      }

      const token = unsubscribeToken(person.actorId);
      const mail = renderReminder({
        locale: person.locale,
        due: person.due,
        streak: person.streak,
        memory: person.memory,
        now,
        practiceUrl: `${SITE_URL}${href(person.locale, "practice")}`,
        unsubscribeUrl: `${SITE_URL}${href(person.locale, "unsubscribe")}?t=${encodeURIComponent(token)}`,
        settingsUrl: `${SITE_URL}${href(person.locale, "settings")}#reminders`,
      });
      const result = await sendMail(
        { to: person.email, subject: mail.subject, html: mail.html, text: mail.text, headers: listUnsubscribeHeaders(oneClickUrl(token)) },
        { idempotencyKey: `reminder:${person.actorId}:${now.toISOString().slice(0, 13)}` },
      );
      if (!result.sent) {
        report.failed++;
        console.error("[heidi/reminders] not sent", { actorId: person.actorId, error: result.error, retryable: result.retryable });
        continue;
      }
      await markReminded(person.actorId, now, verdict.unheard);
      report.sent++;
    } catch (error) {
      report.failed++;
      console.error("[heidi/reminders] person failed", { actorId: person.actorId, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return report;
}
