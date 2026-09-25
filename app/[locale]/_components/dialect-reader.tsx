"use client";

import { useState } from "react";
import Link from "next/link";
import type { CheckResult } from "@/lib/variety/check";
import type { Reading } from "@/lib/variety/detect";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { href } from "@/lib/i18n/routes";
import { fill } from "@/lib/i18n/fill";
import { DISPLAY } from "@/lib/variety/display";
import { HighlightedText } from "./highlighted-text";

type Response = CheckResult & { reading: Reading };

/**
 * "Where is this message from?" — for text somebody RECEIVED.
 *
 * Not the rule check on the method page, which is evidence for a claim, and
 * not a place to grade your own dialect (see `rule-check.tsx` for why that
 * page was removed). The reader here has a message in hand and two questions:
 * is this the variety I am learning, and what do these words say. The answer
 * is the gate's own data read the other way round — `lib/variety/detect.ts`.
 *
 * The verdict is worded as what the forms POINT TO. A message with nothing
 * telling in it is "unclear", never a confident guess.
 */
export function DialectReader({ t, locale }: { t: Dictionary["dialect"]["reader"]; locale: Locale }) {
  const [text, setText] = useState("");
  const [shown, setShown] = useState<{ text: string; result: Response } | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    setFailed(false);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        setFailed(true);
        setShown(null);
        return;
      }
      setShown({ text, result: (await res.json()) as Response });
    } catch {
      setFailed(true);
      setShown(null);
    } finally {
      setPending(false);
    }
  }

  const areaName = (id?: string) => DISPLAY.areas.find((a) => a.id === id)?.endonym;
  const placeName = (o: Reading["origins"][number]) => areaName(o.areaId) ?? t.outsideName;

  return (
    <div>
      <label htmlFor="reader-input" className="sr-only">
        {t.title}
      </label>
      <textarea
        id="reader-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        maxLength={2000}
        rows={3}
        className="w-full resize-y rounded-control border border-border-strong bg-surface-raised p-4 text-lg leading-relaxed text-fg-primary placeholder:text-fg-muted focus:border-fg-primary focus:outline-none"
      />
      <button
        type="button"
        onClick={() => void run()}
        disabled={pending || text.trim().length === 0}
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-control bg-action px-6 font-medium text-on-action transition-colors hover:opacity-90 disabled:bg-surface-sunk disabled:text-fg-muted"
      >
        {t.button}
      </button>

      {failed && (
        <p role="alert" className="mt-6 max-w-measure text-base leading-relaxed text-fg-secondary">
          {t.failed}
        </p>
      )}

      {shown && (
        <div className="mt-8 flex flex-col gap-6" aria-live="polite">
          <Verdict reading={shown.result.reading} t={t} locale={locale} areaName={areaName} />

          {shown.result.reading.origins.length > 0 && (
            <section>
              <p className="max-w-measure whitespace-pre-wrap rounded-control border border-border-subtle bg-surface-raised p-4 text-lg leading-relaxed text-fg-primary">
                <HighlightedText text={shown.text} findings={shown.result.findings.filter((f) => f.origin)} />
              </p>
              <h3 className="mt-5 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.fromTitle}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {shown.result.reading.origins.flatMap((o) =>
                  o.forms.map((f) => (
                    <li key={`${o.origin}-${f.index}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base">
                      <span lang={DISPLAY.tag} className="font-medium text-dialect">
                        {f.form}
                      </span>
                      <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{placeName(o)}</span>
                      {f.suggest && (
                        <span className="text-fg-secondary">
                          {fill(t.zurich, { form: f.suggest })}
                        </span>
                      )}
                    </li>
                  )),
                )}
              </ul>
            </section>
          )}

          {shown.result.reading.known.length > 0 && (
            <section>
              <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.knownTitle}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {shown.result.reading.known.map((k) => (
                  <li
                    key={k.index}
                    className="rounded-control border border-border-subtle px-3 py-1.5 text-base text-fg-secondary"
                  >
                    <span lang={DISPLAY.tag} className="font-medium text-dialect">
                      {k.form}
                    </span>{" "}
                    = {k.bridge}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="max-w-measure text-sm leading-relaxed text-fg-muted">{t.note}</p>
        </div>
      )}
    </div>
  );
}

function Verdict({
  reading,
  t,
  locale,
  areaName,
}: {
  reading: Reading;
  t: Dictionary["dialect"]["reader"];
  locale: Locale;
  areaName: (id?: string) => string | undefined;
}) {
  const lead = "font-heading text-xl font-semibold leading-snug tracking-display text-fg-primary";
  if (reading.verdict === "area" && reading.lead?.areaId) {
    const name = areaName(reading.lead.areaId) ?? reading.lead.origin;
    // The area name is a link to its page: "where is this from" is usually
    // followed by "and what is that like".
    const [before, after] = t.area.split("{area}");
    return (
      <p className={lead}>
        {before}
        <Link
          href={`${href(locale, "dialect")}/${reading.lead.areaId}`}
          lang={DISPLAY.tag}
          className="text-link underline underline-offset-4 hover:text-accent"
        >
          {name}
        </Link>
        {after}
      </p>
    );
  }
  const text =
    reading.verdict === "outside" ? t.outside : reading.verdict === "consistent" ? t.consistent : t.unclear;
  return <p className={lead}>{text}</p>;
}
