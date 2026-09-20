
# Layout: the mistake this repo keeps making

Horizontal overflow has been reported from a phone three times, by a person,
after it was live: the chat transcript, `/portal`, and the header the day an
avatar was added to it. Every one of them passed review, passed the type
checker and passed every test. They are LAYOUT facts — real glyphs, real font,
real viewport — and reading the source finds none of them.

So before changing anything that affects layout, know these four:

1. **A grid track defaults to `auto`, whose automatic minimum is min-content.**
   One `truncate` line is `white-space: nowrap`, so its min-content is the
   whole sentence, and the column becomes as wide as it. Put `grid-cols-safe`
   (globals.css) on any grid whose base layout is one column.
2. **A flex item refuses to shrink below its content** unless it is told to.
   `min-w-0` on the item, or `wrap-anywhere` on a container of text nobody on
   this side wrote.
3. **`overflow-x: clip` on the body is a backstop, not a fix.** It turns a
   sideways-scrolling site into a clipped card. The card is still broken.
4. **An `absolute right-0` panel hangs from the nearest positioned ancestor.**
   That is correct only while its button is the last control in the row. Put
   the anchor on the row.

And run the check, which is the only thing here that actually finds them:

```bash
pnpm run dev                                        # in another terminal
pnpm run audit:responsive                           # every page, 3 languages
LOCALES=de,fr,ru WIDTHS=320 pnpm run audit:responsive   # narrow it down
```

It measures elements rather than the document (the backstop hides the document
symptom), and it OPENS the header's dropdowns, because measuring a page at
rest is what let the fourth one through. CI runs it against the built site on
every pull request.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
