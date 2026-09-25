import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { formatDate } from "@/lib/i18n/dates";
import { dbConfigured } from "@/lib/db";
import { certificateById } from "@/lib/domain/progress/store";
import { Shell } from "../../../../_components/page-shell";
import { CertificatePrint } from "../../../../_components/certificate-print";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; id: string; cid: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : DEFAULT_LOCALE);
  // A certificate is somebody's; it is reachable by its link and nothing lists it.
  return { title: dict.certificate.title, robots: { index: false, follow: false } };
}

/**
 * A certificate, as anyone with its link sees it — an employer, a care home,
 * an integration office. It shows what Heidi measured, when, and how Heidi
 * measures; never who it belongs to (see the table's note in `schema.ts`).
 *
 * The scope line is not modesty, it is the claim's edge: this certifies
 * understanding one situation by ear, and a reader should not be able to
 * mistake it for a language diploma.
 */
export default async function CertificatePage({ params }: { params: Params }) {
  const { locale: raw, id, cid } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.certificate;

  const cert = dbConfigured() ? await certificateById(cid) : null;
  if (!cert || cert.sceneId !== id) notFound();

  const scene = dict.situations.scenes[cert.sceneId as keyof typeof dict.situations.scenes];
  const sceneTitle = scene?.title ?? cert.sceneId;
  const total = String(cert.askable);

  return (
    <Shell>
      <article className="mx-auto my-10 max-w-2xl rounded-control border border-border-strong bg-surface-page p-6 sm:p-10 print:my-0 print:border-0">
        <p className="font-mono text-caption uppercase tracking-caps text-fg-muted">Heidi · {t.title}</p>

        <CertificatePrint t={t} />

        <p className="mt-2 font-heading text-2xl font-semibold leading-snug tracking-display text-fg-primary sm:text-3xl">
          {t.holder} {fill(t.statement, { scene: sceneTitle, total })}
        </p>

        <p className="mt-6 text-base leading-relaxed text-fg-secondary">
          {fill(t.measured, { held: String(cert.held), total, stuck: String(cert.stuck) })}
        </p>
        <p className="mt-2 text-base leading-relaxed text-fg-secondary">{t.scope}</p>

        <dl className="mt-8 grid grid-cols-safe gap-x-8 gap-y-2 font-mono text-sm sm:grid-cols-2">
          <div>
            <dt className="text-caption uppercase tracking-caps text-fg-muted">
              {fill(t.issued, { date: "" }).replace(/\s+$/, "")}
            </dt>
            <dd className="text-fg-primary">{formatDate(cert.issuedAt.toISOString().slice(0, 10), locale, "long")}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-caption uppercase tracking-caps text-fg-muted">{t.idLabel}</dt>
            <dd className="wrap-anywhere text-fg-primary">{cert.id}</dd>
          </div>
        </dl>

        <Link
          href={href(locale, "method")}
          className="mt-8 inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent print:hidden"
        >
          {t.method} →
        </Link>
      </article>
    </Shell>
  );
}
