"use client";

import { useEffect, useRef, useState } from "react";

import { useDismiss } from "./use-dismiss";
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
type Probe = { provider: ProviderId; key: string; n: number };
type Result = {
  state: "idle" | "checking" | "ok" | "error";
  models: string[];
  suggested: string | null;
  message: string;
  reachable: boolean;
};
const IDLE: Result = { state: "idle", models: [], suggested: null, message: "", reachable: true };
/** Long enough to finish pasting, short enough to feel immediate. */
const CHECK_AFTER_MS = 600;

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
  const [model, setModel] = useState(current?.model ?? "");
  const [result, setResult] = useState<Result>(IDLE);
  const [probe, setProbe] = useState<Probe | null>(null);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const seq = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  const provider = findProvider(providerId);

  useDismiss({ open: true, onDismiss: onClose, containerRef: dialogRef, onPointerOutside: false });

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  /**
   * Ask the server to check a key — debounced, from the event that changed
   * it. A key already saved is checked once on open, so the model list is
   * there without the reader doing anything.
   */
  function schedule(nextProvider: ProviderId, nextKey: string, delay = CHECK_AFTER_MS) {
    clearTimeout(timer.current);
    setSaved(false);
    if (nextKey.trim().length < 8) {
      setResult(IDLE);
      return;
    }
    timer.current = setTimeout(() => {
      setResult({ ...IDLE, state: "checking" });
      seq.current += 1;
      setProbe({ provider: nextProvider, key: nextKey.trim(), n: seq.current });
    }, delay);
  }

  useEffect(() => {
    if (current) {
      const id = setTimeout(() => schedule(current.provider, current.key, 0), 0);
      return () => clearTimeout(id);
    }
    // Once, on open: `current` is the saved config at the moment the sheet opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!probe) return;
    let live = true;
    fetch("/api/model/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: probe.provider, key: probe.key }),
    })
      .then((res) => res.json() as Promise<Omit<Result, "state"> & { ok: boolean }>)
      .then((data) => {
        if (!live || probe.n !== seq.current) return;
        setResult({
          state: data.ok ? "ok" : "error",
          models: data.models ?? [],
          suggested: data.suggested ?? null,
          message: data.message ?? "",
          reachable: data.reachable !== false,
        });
        // Keep the reader's saved choice when this key can still use it;
        // otherwise preselect the strongest model the key reaches.
        if (data.ok) {
          setModel((m) => ((data.models ?? []).includes(m) ? m : (data.suggested ?? data.models?.[0] ?? m)));
        }
      })
      .catch(() => live && setResult({ ...IDLE, state: "error", reachable: false }));
    return () => {
      live = false;
    };
  }, [probe]);

  function use() {
    if (!provider || !key.trim() || !model.trim()) return;
    onSave({ provider: provider.id, key: key.trim(), model: model.trim() });
    setSaved(true);
  }

  const listed = result.state === "ok" && result.models.length > 0;

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
            <span className="font-mono text-caption uppercase tracking-caps text-ok">{t.connected}</span>
            <span className="min-w-0 break-all text-fg-primary">
              {t.connectedWith} {current.model}
            </span>
          </p>
        )}

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label htmlFor="byok-provider" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
              {t.providerLabel}
            </label>
            <select
              id="byok-provider"
              value={providerId}
              onChange={(e) => {
                const next = e.target.value as ProviderId;
                setProviderId(next);
                setModel("");
                schedule(next, key);
              }}
              className="mt-1 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-3 text-base text-fg-primary"
            >
              {BYOK_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {provider && (
              <a
                href={provider.keysUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex min-h-11 items-center text-sm text-link underline underline-offset-4 hover:text-accent"
              >
                {t.getKey} ↗
              </a>
            )}
          </div>

          <div>
            <label htmlFor="byok-key" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
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
                schedule(providerId, e.target.value);
              }}
              placeholder={provider?.keyHint || t.keyPlaceholder}
              className="mt-1 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-3 font-mono text-sm text-fg-primary"
            />
            <p className="mt-1 text-sm text-fg-muted" role="status">
              {result.state === "checking" ? t.testing : result.state === "idle" ? t.pasteHint : null}
            </p>
          </div>

          {result.state === "ok" && (
            <div>
              <label htmlFor="byok-model" className="font-mono text-caption uppercase tracking-caps text-fg-muted">
                {t.modelLabel}
              </label>
              {listed ? (
                <select
                  id="byok-model"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setSaved(false);
                  }}
                  className="mt-1 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-3 font-mono text-sm text-fg-primary"
                >
                  {result.models.map((m) => (
                    <option key={m} value={m}>
                      {m === result.suggested ? `${m} — ${t.strongest}` : m}
                    </option>
                  ))}
                </select>
              ) : (
                // Only when the vendor answered but listed nothing: then the
                // reader types the id, with the vendor's own example as a hint.
                <input
                  id="byok-model"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setSaved(false);
                  }}
                  placeholder={provider?.modelExample}
                  spellCheck={false}
                  className="mt-1 min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-3 font-mono text-sm text-fg-primary"
                />
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {result.state === "ok" && (
            <button
              type="button"
              onClick={use}
              disabled={!model.trim()}
              className="inline-flex min-h-11 items-center rounded-control bg-action px-5 font-medium text-on-action disabled:opacity-40"
            >
              {t.test}
            </button>
          )}
          {current && (
            <button
              type="button"
              onClick={() => {
                onClear();
                setKey("");
                setModel("");
                setResult(IDLE);
                setSaved(false);
              }}
              className="min-h-11 text-sm text-link underline underline-offset-4 hover:text-accent"
            >
              {t.disconnect}
            </button>
          )}
        </div>

        {saved && (
          <p role="status" className="mt-3 break-all text-sm text-ok">
            {t.connected} · {model}
          </p>
        )}
        {result.state === "error" && (
          <div role="alert" className="mt-3 text-sm">
            {/* Our sentence first, in the reader's language; then the vendor's
                own words, marked as theirs — usually the part that says what
                to do ("insufficient credits"). Never our server's English. */}
            <p className="text-danger">{result.reachable ? t.failed : t.unreachable}</p>
            {result.reachable && result.message && (
              <p className="mt-1 break-words text-fg-secondary">
                {t.vendorSaid} <q className="font-mono text-caption">{result.message}</q>
              </p>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-border-subtle pt-4">
          <h3 className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.safetyTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{t.safetyBody}</p>
          <h3 className="mt-4 font-mono text-caption uppercase tracking-caps text-fg-muted">{t.whyTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{t.whyBody}</p>
        </div>
      </div>
    </div>
  );
}
