"use client";

import { useCallback, useEffect } from "react";
import { createBrowserStore, useBrowserStore, useStorageReady } from "@/lib/browser/store";
import { DEFAULT_THEME, THEMES, applyTheme, decodeTheme, type Theme } from "@/lib/browser/theme";

/**
 * Choosing light or dark, or letting the device decide.
 *
 * The same store every other device setting uses, so the reasoning about
 * caching snapshots, announcing local writes and surviving a browser that
 * blocks storage lives in one place and not here. See `lib/browser/store.ts`.
 */
const store = createBrowserStore<Theme>(
  "heidi.theme.v1",
  // The store hands back the raw string; `decodeTheme` is the same validator
  // the rest of the code uses, so a hand-edited value cannot mean one thing
  // here and another in the no-flash script.
  (raw) => decodeTheme(raw.replace(/^"|"$/g, "")),
);

export function useTheme() {
  const stored = useBrowserStore(store);
  const ready = useStorageReady();
  const theme = stored ?? DEFAULT_THEME;

  /**
   * Keep the document in step with the choice.
   *
   * The inline script already stamped the root before first paint; this is
   * what makes a CHANGE take effect without a reload, and what keeps a second
   * tab in step, since the store announces `storage` events from other tabs.
   */
  useEffect(() => {
    if (!ready) return;
    applyTheme(theme, document.documentElement);
  }, [theme, ready]);

  const set = useCallback((next: Theme) => store.write(next), []);

  return { theme, ready, set };
}

/**
 * Three buttons, not a cycling toggle.
 *
 * A cycle hides its own state: pressing it tells you nothing about what the
 * other two options were, and "system" in a two-state toggle is unreachable.
 * Three labelled options in a group say what is on offer and which one is
 * chosen — and `aria-pressed` makes that true for a screen reader as well as
 * for the eye.
 */
export function ThemeControl({
  t,
}: {
  t: { system: string; light: string; dark: string; label: string };
}) {
  const { theme, ready, set } = useTheme();

  // Nothing during the server pass. Rendering "system" as chosen and then
  // flipping to the reader's real setting is the same flash this feature
  // exists to remove, moved into one control.
  if (!ready) return <div className="min-h-11" aria-hidden="true" />;

  const label = (value: Theme) => (value === "system" ? t.system : value === "light" ? t.light : t.dark);

  return (
    <div role="group" aria-label={t.label} className="flex flex-wrap gap-2">
      {THEMES.map((value) => {
        const chosen = value === theme;
        return (
          <button
            key={value}
            type="button"
            onClick={() => set(value)}
            aria-pressed={chosen}
            className={`inline-flex min-h-11 items-center rounded-control border px-4 text-sm transition-colors ${
              chosen
                ? "border-border-strong bg-fg-primary font-medium text-surface-page"
                : "border-border-subtle text-fg-secondary hover:border-border-strong hover:text-fg-primary"
            }`}
          >
            {label(value)}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The compact form, for inside the account menu.
 *
 * Same state, different shape: a menu row cannot afford three full-width
 * buttons, and the reason theme belongs in the menu at all is that on a phone
 * the menu is the only chrome a reader can reach without going to settings.
 */
export function ThemeRow({
  t,
}: {
  t: { system: string; light: string; dark: string; label: string };
}) {
  const { theme, ready, set } = useTheme();
  if (!ready) return null;

  return (
    /*
      `flex-wrap`, because the label and three buttons do not fit on one line
      in every language. In Russian "Оформление · Устройство Светлое Тёмное"
      is 328px inside a 302px dropdown, and the row was cut off at the edge of
      the panel — found by the responsive audit once it started opening
      disclosures instead of measuring shut ones. Wrapping costs one line in
      two languages and cannot cut anything off in any of them.
    */
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <span className="font-mono text-caption uppercase tracking-caps text-fg-muted">{t.label}</span>
      <div role="group" aria-label={t.label} className="flex flex-wrap gap-1">
        {THEMES.map((value) => {
          const chosen = value === theme;
          return (
            <button
              key={value}
              type="button"
              onClick={() => set(value)}
              aria-pressed={chosen}
              // Short labels, but real ones: an icon-only sun and moon leaves
              // "system" with no glyph anybody recognises.
              className={`inline-flex min-h-9 items-center rounded-control border px-2 text-xs transition-colors ${
                chosen
                  ? "border-border-strong bg-fg-primary text-surface-page"
                  : "border-border-subtle text-fg-secondary hover:border-border-strong hover:text-fg-primary"
              }`}
            >
              {value === "system" ? t.system : value === "light" ? t.light : t.dark}
            </button>
          );
        })}
      </div>
    </div>
  );
}
