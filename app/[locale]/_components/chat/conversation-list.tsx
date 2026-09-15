"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { ConversationSummary } from "./transports";

/**
 * The sidebar: every conversation this person has, and the two things they can
 * do to one.
 *
 * Renaming and deleting are inline rather than behind a menu or a `confirm()`.
 * A native `confirm` is a modal the page cannot style, cannot translate, and
 * that reads out of a screen reader as a browser noise rather than as part of
 * the product — and for a destructive action in seven languages that matters
 * more than the two lines it saves.
 */
export function ConversationList({
  conversations,
  currentId,
  t,
  onOpen,
  onRename,
  onDelete,
  className,
}: {
  conversations: ConversationSummary[];
  currentId: string | null;
  t: Dictionary["chat"]["full"];
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}) {
  // One id at a time, so the sidebar can never be in two states at once.
  const [renaming, setRenaming] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  if (conversations.length === 0) {
    return <p className={`text-sm text-fg-muted ${className ?? ""}`}>{t.noChats}</p>;
  }

  return (
    <ul className={`flex flex-col gap-0.5 ${className ?? ""}`}>
      {conversations.map((c) => {
        const title = c.title || t.untitled;
        const current = c.id === currentId;

        if (renaming === c.id) {
          return (
            <li key={c.id}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = new FormData(e.currentTarget).get("title");
                  if (typeof value === "string" && value.trim()) onRename(c.id, value.trim());
                  setRenaming(null);
                }}
                className="flex flex-col gap-1.5 rounded-control border border-accent bg-surface-raised p-2"
              >
                <label className="sr-only" htmlFor={`rename-${c.id}`}>
                  {t.rename}
                </label>
                <input
                  id={`rename-${c.id}`}
                  name="title"
                  defaultValue={title}
                  autoFocus
                  maxLength={60}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="w-full rounded-control border border-border-subtle bg-surface-page px-2 py-1 text-sm text-fg-primary"
                />
                <div className="flex gap-2">
                  <button type="submit" className="min-h-9 text-xs font-medium text-link hover:text-accent">
                    {t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenaming(null)}
                    className="min-h-9 text-xs text-fg-muted hover:text-fg-primary"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </li>
          );
        }

        if (confirming === c.id) {
          return (
            <li key={c.id} className="rounded-control border border-accent bg-surface-raised p-2">
              <p className="text-xs leading-snug text-fg-secondary">{t.deleteAsk}</p>
              <div className="mt-1.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(null);
                    onDelete(c.id);
                  }}
                  className="min-h-9 text-xs font-medium text-accent hover:underline"
                >
                  {t.deleteYes}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="min-h-9 text-xs text-fg-muted hover:text-fg-primary"
                >
                  {t.cancel}
                </button>
              </div>
            </li>
          );
        }

        return (
          <li key={c.id} className="group/row relative">
            <button
              type="button"
              onClick={() => onOpen(c.id)}
              // aria-current, not just a colour: "which conversation am I in"
              // is the sidebar's whole job, and a screen reader cannot see the
              // background change.
              aria-current={current ? "true" : undefined}
              className={`w-full truncate rounded-control px-2.5 py-2 pr-16 text-left text-sm transition-colors ${
                current ? "bg-surface-raised font-medium text-fg-primary" : "text-fg-secondary hover:bg-surface-raised"
              }`}
            >
              {title}
            </button>

            {/* Visible on hover for a mouse, and always once focused — a
                keyboard user has no hover, and controls that appear only on
                hover are controls a keyboard user does not have. */}
            <span className="pointer-events-none absolute right-1.5 top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/row:opacity-100 group-focus-within/row:opacity-100">
              <button
                type="button"
                onClick={() => setRenaming(c.id)}
                title={t.rename}
                className="pointer-events-auto rounded p-1.5 text-fg-muted hover:bg-surface-page hover:text-fg-primary"
              >
                <span className="sr-only">{t.rename}</span>
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={() => setConfirming(c.id)}
                title={t.delete}
                className="pointer-events-auto rounded p-1.5 text-fg-muted hover:bg-surface-page hover:text-accent"
              >
                <span className="sr-only">{t.delete}</span>
                <TrashIcon />
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
