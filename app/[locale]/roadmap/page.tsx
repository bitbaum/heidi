import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { ROADMAP } from "@/lib/config/roadmap";
import { sectorLocale } from "@/lib/config/sectors";
import { RoadmapDocument } from "bip-kit/react";
import { PageHeader, Shell } from "../_components/page-shell";
import { OtherLanguage } from "../_components/other-language";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const lang = sectorLocale(locale);
  const doc = ROADMAP[lang];
  return { title: doc.title, description: doc.lede };
}

/**
 * What is being built, what comes next, and what after.
 *
 * READ-ONLY ON PURPOSE. Having a say in it — voting on an item, proposing one —
 * goes through Solon, with an OrangeCat account and a seat in Heidi's
 * organisation there, because a voice is a right someone holds, not a button
 * anyone can press. Anyone can still point at anything on any page through the
 * Loki feedback widget.
 *
 * Content and its visual treatment remain product-owned, while the shared
 * renderer owns the accessible, responsive structure for the RoadmapDoc
 * contract. Heidi maps its own semantic palette through the renderer tokens.
 */
export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const lang = sectorLocale(locale);
  const doc = ROADMAP[lang];

  return (
    <Shell>
      <PageHeader
        eyebrow={doc.eyebrow}
        title={doc.title}
        lead={doc.lede}
        lang={lang}
      >
        <OtherLanguage
          asked={locale}
          got={lang}
          reason="byDesign"
          t={dict.language}
        />
      </PageHeader>

      <RoadmapDocument
        doc={doc}
        lang={lang}
        showHeader={false}
        essayHref={(path) =>
          /^https?:\/\//i.test(path)
            ? path
            : href(locale, path.replace(/^\/+/, ""))
        }
        essayLink={(to, label) => (
          <Link href={to} className="bp-record-link">
            {label} →
          </Link>
        )}
      />

      {/* A roadmap is a claim about the future; these two are the record of
          the past and the argument for the present. A reader who doubts the
          first should be one tap from both. */}
      <nav
        aria-label={doc.title}
        className="flex flex-wrap gap-x-6 gap-y-2 py-8"
      >
        {(["changelog", "paper", "contribute"] as const).map((key) => (
          <Link
            key={key}
            href={href(locale, key)}
            className="inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
          >
            {dict.nav[key]}
          </Link>
        ))}
      </nav>
    </Shell>
  );
}
