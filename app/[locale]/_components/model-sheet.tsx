"use client";

import { useEffect, useRef, useState } from "react";
import type { ByokConfig } from "@/lib/domain/model/byok";
import { BYOK_PROVIDERS, findProvider, type ProviderId } from "@/lib/domain/model/providers";
import type { Dictionary } from "@/lib/i18n";

/**
 * Connect your own model.
 *
 * Two things this refuses to do, both of which are how BYOK is normally built:
 *
 *  1. It does not say "saved" without proving it. Storing a credential and
 *     showing a tick is a claim made at the exact moment someone is deciding
 *     whether to trust you, and it is unverified. This makes one real call
 *     first and reports what came back — including the vendor's own words when
 *     it fails, because "model not found" and "insufficient credit" are the
 *     two things a person actually needs to hear.
 *
 *  2. It does not hide where the key goes. That is stated plainly above the
 *     field, not linked from a footer.
 */
export function ModelSheet({
  t,
  current,
  onSave,
  onClear,
  onClose,
}: {
  t: Dictionary["model"];
  current: ByokConfig | null;
  onSave: (config: ByokConfig) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [providerId, setProviderId] = useState<ProviderId>(current?.provider ?? "openrouter");
  const [key, setKey] = useState(current?.key ?? "");
  const [state, setState] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [detail, setDetail] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const provider = findProvider(providerId);

  /**
   * The model is DERIVED, not synced. Only what the person typed is state; the
   * default comes from the chosen provider — its vision model first, since
   * reading a picture is why most people are here.
   *
   * The obvious version is an effect that writes the default into state when
   * the provider changes, and it causes a cascading render for a value that
   * was always computable. Deriving it also makes "changed provider" reset the
   * choice by construction rather than by remembering to clear it.
   */
  const [typedModel, setTypedModel] = useState<string | null>(current?.model ?? null);
  const model = typedModel ?? provider?.visionModel ?? provider?.textModel ?? "";

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function test() {
    if (!provider || !key.trim() || !model.trim()) return;
    setState("testing");
    setDetail("");
    const config: ByokConfig = { provider: provider.id, key: key.trim(), model: model.trim() };
    try {
      const res = await fetch("/api/model/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ byok: config }),
      });
      const data = await res.json();
      if (data.ok) {
        setState("ok");
        setDetail(data.model ?? model);
        onSave(config);
      } else {
        setState("error");
        setDetail(String(data.reason ?? ""));
      }
    } catch {
      setState("error");
      setDetail("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-fg-primary/30 p-0 sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.connectTitle}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-control border border-border-strong bg-surface-raised p-5 shadow-lg sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-xl font-semibold leading-tight tracking-display text-fg-primary">
            {t.connectTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="×"
            className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-fg-muted hover:text-fg-primary"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-base leading-relaxed text-fg-secondary">{t.connectLead}</p>

        {current && (
          <p className="mt-4 flex flex-wrap items-center gap-2 rounded-control border border-ok bg-surface-page px-3 py-2 text-sm">
            <span className="font-mono text-[11px] uppercase tracking-caps text-ok">{t.connected}</span>
            <span className="text-fg-primary">
              {t.connectedWith} {current.model}
            </span>
          </p>
        )}

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="byok-provider" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {t.providerLabel}
            </label>
            <select
              id="byok-provider"
              value={providerId}
              onChange={(e) => {
                setProviderId(e.target.value as ProviderId);
                setTypedModel(null);
                setState("idle");
              }}
              className="mt-1 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-3 text-base text-fg-primary"
            >
              {/* Label only. The `note` on each provider is English source
                  copy for maintainers, and putting it here leaked English onto
                  a German page — the localised badge below already carries the
                  one fact that decides the choice. */}
              {BYOK_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {provider && (
              <p className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">
                  {provider.visionModel ? t.canSee : t.textOnly}
                </span>
                <a
                  href={provider.keysUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-link underline underline-offset-4 hover:text-accent"
                >
                  {t.getKey} ↗
                </a>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="byok-key" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {t.keyLabel}
            </label>
            <input
              id="byok-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setState("idle");
              }}
              placeholder={provider?.keyPrefix ? `${provider.keyPrefix}…` : t.keyPlaceholder}
              className="mt-1 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-3 font-mono text-sm text-fg-primary"
            />
          </div>

          <div>
            <label htmlFor="byok-model" className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
              {t.modelLabel}
            </label>
            <input
              id="byok-model"
              value={model}
              onChange={(e) => {
                setTypedModel(e.target.value);
                setState("idle");
              }}
              spellCheck={false}
              className="mt-1 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-3 font-mono text-sm text-fg-primary"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void test()}
            disabled={state === "testing" || !key.trim() || !model.trim()}
            className="inline-flex min-h-11 items-center rounded-control bg-accent px-5 font-medium text-on-accent disabled:opacity-40"
          >
            {state === "testing" ? t.testing : t.test}
          </button>
          {current && (
            <button
              type="button"
              onClick={() => {
                onClear();
                setKey("");
                setState("idle");
              }}
              className="min-h-11 text-sm text-link underline underline-offset-4 hover:text-accent"
            >
              {t.disconnect}
            </button>
          )}
        </div>

        {state === "ok" && (
          <p role="status" className="mt-3 text-sm text-ok">
            {t.connected} · {detail}
          </p>
        )}
        {/* The server's own `reason` used to be appended here. Those strings
            are written once, in English, for a log — and this sheet is read in
            seven languages. The localised sentence stands alone; what actually
            went wrong is in the server log, where a reader cannot act on it
            anyway. (`detail` on success is a MODEL ID, not prose.) */}
        {state === "error" && (
          <p role="alert" className="mt-3 break-words text-sm text-accent">
            {t.failed}
          </p>
        )}

        <div className="mt-6 border-t border-border-subtle pt-4">
          <h3 className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.safetyTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{t.safetyBody}</p>
          <h3 className="mt-4 font-mono text-[11px] uppercase tracking-caps text-fg-muted">{t.whyTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{t.whyBody}</p>
        </div>
      </div>
    </div>
  );
}
