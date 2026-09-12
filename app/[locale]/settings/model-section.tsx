"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { useByok } from "../_components/use-byok";
import { ModelSheet } from "../_components/model-sheet";

/**
 * The model, from the settings page rather than from the attach button.
 *
 * Before this existed the only way to connect a key was to click the paperclip
 * — so anyone who wanted better answers rather than picture-reading had no
 * path at all, and anyone who had connected one had no way to see or change it
 * except by going back through an attachment they did not want to make.
 */
export function ModelSection({ t, model }: { t: Dictionary["settings"]; model: Dictionary["model"] }) {
  const byok = useByok();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.modelBody}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {byok.config ? (
          <span className="inline-flex items-center gap-2 border border-border-strong px-3 py-1.5 font-mono text-sm">
            <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-accent" />
            {byok.config.model}
          </span>
        ) : (
          <span className="font-mono text-sm text-fg-muted">{t.modelNone}</span>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 items-center border border-border-strong px-5 text-sm font-medium text-fg-primary transition-colors hover:bg-fg-primary hover:text-surface-page"
        >
          {byok.config ? model.connectTitle : model.open}
        </button>
      </div>

      {open && (
        <ModelSheet
          t={model}
          current={byok.config}
          onSave={byok.save}
          onClear={byok.clear}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
