/**
 * Light, dark, or whatever the device says.
 *
 * WHY THIS WAS MISSING AND WHY IT IS ODD THAT IT WAS. `globals.css` has
 * carried a complete dark palette since the cow retheme, in three blocks:
 * `prefers-color-scheme: dark` guarded by `:root:not([data-theme="light"])`,
 * and `:root[data-theme="dark"]`. Those guards only mean something if
 * something stamps `data-theme` on the root — and nothing ever did. The CSS
 * was written for a control that was never built, so a reader whose device is
 * light had no way to ask for dark and a reader whose device is dark had no
 * way to ask for light.
 *
 * THREE STATES, NOT TWO. "System" is a real choice and the right default: it
 * follows the reader's device, including when the device changes at dusk. A
 * two-state toggle has to pick a side at first paint and is then wrong for
 * half the world until somebody touches it.
 */

export const THEME_KEY = "heidi.theme.v1";

export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "system";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/** What a stored string means. Anything unrecognised is "system". */
export function decodeTheme(raw: string | null): Theme {
  return isTheme(raw) ? raw : DEFAULT_THEME;
}

/**
 * Stamp the choice on the root element.
 *
 * "system" REMOVES the attribute rather than setting it to "system", because
 * the stylesheet's dark block is guarded by `:not([data-theme="light"])` — an
 * attribute with an unexpected value would still satisfy that guard, but it
 * would also be a value the CSS never mentions, which is the kind of thing
 * that silently stops matching when somebody tightens a selector.
 */
export function applyTheme(theme: Theme, root: HTMLElement): void {
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

/**
 * The script that runs before the page is painted.
 *
 * WHY AN INLINE SCRIPT AND NOT A REACT EFFECT. An effect runs after the first
 * paint, so a reader who chose dark would see a white page flash to black on
 * every navigation — the defect is called FOUC and it is worse than having no
 * toggle at all, because it happens on every single load.
 *
 * Kept to one statement and wrapped in try/catch: `localStorage` THROWS rather
 * than returning null in a private window and in a browser set to block site
 * data, and an uncaught throw here would run before React and take the whole
 * page down. A reader who blocks storage gets the system theme, which is the
 * correct fallback anyway.
 *
 * It is generated from the constants above rather than written out as a
 * string, so the key and the attribute cannot drift from the module that reads
 * them back.
 *
 * THE QUOTES ARE LOAD-BEARING. `createBrowserStore` writes every value through
 * `JSON.stringify`, so the stored string is `"dark"` — five characters, quotes
 * included. Comparing it to `dark` fails, silently, and the only symptom is
 * the flash this script exists to prevent. Stripping them here is the one
 * place the two encodings meet, and `decodeTheme` does the same on the React
 * side.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t){t=t.replace(/^"|"$/g,"")}if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`;
