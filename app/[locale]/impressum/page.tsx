import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { CONTACT_EMAIL, OPERATOR, POSTAL_ADDRESS, SOURCE_URL } from "@/lib/config/site";
import { BandHeader, Shell } from "../_components/page-shell";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return { title: dict.impressum.title };
}

/**
 * Who is behind this.
 *
 * SHORT, AND HONEST ABOUT WHAT IS MISSING. A legal notice is the first page an
 * institution opens to decide whether a project is a real counterparty, and the
 * tempting move is to sound more established than you are. There is no company
 * here yet, so the page says so in one line rather than implying otherwise with
 * careful phrasing — which is also the more useful answer, because the question
 * is going to be asked.
 *
 * The postal address renders only when there is one. A line that says "address:
 * —" is worse than no line, and inventing one would be the exact failure this
 * whole page exists to avoid.
 */
export default async function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.impressum;

  return (
    <Shell>
      <BandHeader title={t.title} />

      <dl className="flex flex-col gap-6 border-t border-border-subtle py-10">
        <Row label={t.operatorLabel}>{OPERATOR}</Row>

        <Row label={t.contactLabel}>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {CONTACT_EMAIL}
          </a>
        </Row>

        {POSTAL_ADDRESS ? (
          <Row label={t.operatorLabel}>{POSTAL_ADDRESS}</Row>
        ) : (
          <Row label={t.statusLabel}>
            <span className="text-fg-secondary">{t.statusNote}</span>
            <span className="mt-1 block text-sm text-fg-muted">{t.addressNote}</span>
          </Row>
        )}

        <Row label={t.sourceLabel}>
          <a
            href={SOURCE_URL}
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-link underline underline-offset-4 hover:text-accent"
          >
            {SOURCE_URL.replace("https://", "")}
          </a>
        </Row>
      </dl>
    </Shell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-safe gap-1 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="font-mono text-caption uppercase tracking-caps text-fg-muted sm:pt-1">{label}</dt>
      <dd className="text-base leading-relaxed text-fg-primary">{children}</dd>
    </div>
  );
}
