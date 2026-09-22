import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { CONTACT_EMAIL } from "@/lib/config/site";
import {
  BROUGHT_KEY_VENDORS,
  FLOWS,
  HOSTING,
  MODEL_VENDORS,
  NOT_DONE,
  type Flow,
} from "@/lib/config/privacy";
import { Shell } from "../_components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.privacy.title, description: dict.privacy.lead };
}

/**
 * What happens to a person's words.
 *
 * WHY IT IS A TABLE OF FACTS AND NOT A POLICY. The usual privacy page is prose
 * written once, by somebody who was right at the time, and never true again.
 * This site already produced that exact failure: the settings page told readers
 * their conversation "disappears when you close the tab" — it is in
 * `localStorage` and survives — and that nothing of it was on our servers,
 * which stops being true the moment they sign in.
 *
 * So every fact here is read from `lib/config/privacy.ts`, which is derived in
 * turn from the modules the product actually calls, and a test keeps the
 * unusual claims honest. What the dictionary holds is labels.
 *
 * WHAT IT DELIBERATELY DOES NOT CLAIM. No data-processing agreement, no
 * certification, no "compliant" badge. There is no DPA with any model vendor,
 * so the page says that instead — including the consequence, which is that
 * Heidi is not suitable today for data covered by professional confidentiality.
 * An institution finds that out in its first review either way; the only
 * question is whether it hears it from us.
 */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.privacy;

  /**
   * The translated qualification for a flow, where it has one.
   *
   * Only three flows do — the rest are fully described by an identifier. A
   * lookup rather than a field on `Flow`, for the reason the whole config
   * exists: `privacy.ts` holds what is TRUE and cannot go stale, and a
   * sentence is exactly the thing that goes stale in six languages at once.
   */
  const detail = (id: string): string | undefined =>
    (t.detail as Record<string, string | undefined>)[id];

  return (
    <Shell>
      <header className="-mx-5 bg-hide px-5 py-10 sm:-mx-8 sm:px-8 sm:py-12">
        <h1 className="font-heading text-title font-semibold leading-[1.1] tracking-display text-fg-primary">
          {t.title}
        </h1>
        <p className="mt-4 max-w-measure text-lead leading-relaxed text-fg-secondary">{t.lead}</p>
        <p className="mt-3 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.bindingNote}</p>
      </header>

      <Section title={t.flowsTitle} lead={t.flowsLead}>
        <ul className="mt-5 flex flex-col gap-2">
          {FLOWS.map((flow) => (
            <li
              key={flow.id}
              className="grid gap-1 rounded-control border border-border-subtle p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] sm:gap-4"
            >
              <div>
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted sm:hidden">{t.col.what}</p>
                <p className="text-base font-medium leading-snug text-fg-primary">
                  {t.flows[flow.id as keyof typeof t.flows]}
                </p>
              </div>

              <div>
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted sm:hidden">{t.col.where}</p>
                <p className="text-sm leading-snug text-fg-secondary">{t.place[flow.place]}</p>
                {/* The literal key or table, so the claim can be checked in a
                    browser's dev tools rather than taken on trust. */}
                <p className="font-mono text-caption leading-snug text-fg-muted">{flow.where}</p>
                {/* The qualification, translated. It used to be appended to
                    `where` in English and printed as such to every reader who
                    is not English — found by `audit:language`. */}
                {detail(flow.id) && (
                  <p className="mt-0.5 text-caption leading-snug text-fg-secondary">{detail(flow.id)}</p>
                )}
              </div>

              <div>
                <p className="font-mono text-caption uppercase tracking-caps text-fg-muted sm:hidden">{t.col.who}</p>
                <p
                  className={`text-sm leading-snug ${
                    flow.recipients.length > 0 ? "text-accent" : "text-fg-muted"
                  }`}
                >
                  {recipients(flow, t.nobody)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.vendorsTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.vendorsNote}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {MODEL_VENDORS.map((vendor) => (
            <li
              key={vendor}
              className="rounded-control border border-border-strong px-3 py-1 font-mono text-caption uppercase tracking-caps text-fg-primary"
            >
              {vendor}
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">
          {t.broughtKeyNote} {BROUGHT_KEY_VENDORS.join(" · ")}
        </p>
      </Section>

      <Section title={t.hostingTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">
          {HOSTING.provider} · {HOSTING.city} · {HOSTING.country}
        </p>
        <p className="mt-2 max-w-measure text-sm leading-relaxed text-fg-muted">{t.hostingNote}</p>
      </Section>

      <Section title={t.notDoneTitle}>
        <ul className="flex flex-col gap-1.5">
          {NOT_DONE.map((item) => (
            <li key={item} className="flex items-baseline gap-2 text-base leading-relaxed text-fg-primary">
              <span aria-hidden="true" className="text-accent">
                —
              </span>
              {t.notDone[item]}
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{t.notDoneNote}</p>
      </Section>

      <Section title={t.rightsTitle}>
        <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.rightsBody}</p>
        <p className="mt-4">
          <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.contactTitle}</span>{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-link underline underline-offset-4 hover:text-accent"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>
    </Shell>
  );
}

/** Who else sees it, or the honest "nobody". */
function recipients(flow: Flow, nobody: string): string {
  return flow.recipients.length > 0 ? flow.recipients.join(" · ") : nobody;
}

function Section({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border-subtle py-10 sm:py-12">
      <h2 className="font-heading text-section font-semibold leading-tight tracking-display text-fg-primary">
        {title}
      </h2>
      {lead && <p className="mt-3 max-w-measure text-base leading-relaxed text-fg-secondary">{lead}</p>}
      <div className={lead ? undefined : "mt-4"}>{children}</div>
    </section>
  );
}
