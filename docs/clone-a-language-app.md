# Cloning Heidi into a sibling language app

How to make a second app from this one that teaches a different language or
variety: French for people arriving in Romandie, say, under its own name.
The steps are in the order they have to happen. Every path below exists in
this repository; none of the facts about hosts, ports or the org is repeated
here (they live in `bitbaum/fleet` and in Loki's serve file, and this doc
points at them).

## The three layers

A clone changes two of them and none of the third.

| Layer | What it is | Where it lives | A clone |
| --- | --- | --- | --- |
| **Packages** | behaviour every bitbaum app shares | `@bitbaum/*` in `package.json`; `package-plan.json` says which file binds which | changes nothing |
| **Config** | small typed values that name this product | `lib/config/`, `lib/variety/active.ts`, `lib/situations/active.ts`, `lib/i18n/locales.ts`, the environment | edits a handful of lines |
| **Content** | the language itself and the words on the pages | `lib/variety/packs/`, `lib/situations/packs/`, `lib/domain/practice/templates/authored/`, `lib/i18n/dictionaries/`, `content/essays/`, `lib/listening/`, `lib/research/` | is written new |

The engine between config and content (`lib/variety/`, `lib/domain/`,
`app/`) reads a pack through a typed contract and does not know which
language it is teaching. That is tested: `lib/variety/packs/uk.ts` is a
second, deliberately small pack, and the contract suites
(`lib/variety/check.test.ts`, `lib/situations/contract.test.ts`) run over
every pack, so a Zurich assumption in the engine fails there.

## What stays in packages

Do not copy or re-implement any of this in the clone. If one of them cannot do
what the new language needs, extend the package and release it.

| Need | Package |
| --- | --- |
| accounts, sign-in screens, account mail | `@bitbaum/accountkit`, `@bitbaum/mail-kit` |
| chat window, composer, dictation field, layout audit helpers | `@bitbaum/chatkit` |
| model calls and streaming | `@bitbaum/ai-kit` |
| search box | `@bitbaum/searchkit` |
| speech in and out | `@bitbaum/speechkit` |
| dates and times | `@bitbaum/whenkit` |
| roadmap and changelog documents | `@bitbaum/bip-kit` |
| rate limits | `@bitbaum/limitkit` |

`package-plan.json` is the list to keep true: review it before building
anything, and keep its bindings pointing at real files.

## Steps

### 1. Name it and create the repository

1. Pick the name and check it is free (the org's naming procedure, in
   `bitbaum/fleet`).
2. Create the repository from this one, keeping history out: copy the tree,
   start a fresh `git init`. Keep `AGENTS.md`'s generated block; the fleet
   re-syncs it.
3. Register the app where the fleet reads it (the registers named in
   `bitbaum/fleet` `AGENTS.md`). Until it is registered it has no host.

### 2. Brand: four values

All config. After this the product has its new name everywhere the code
writes one.

| File | What to change |
| --- | --- |
| `lib/config/site.ts` | `ASSISTANT_NAME` (the product's name: page titles, share cards, the manifest, account mail and the name the assistant answers to in a group all read it), the default of `SITE_URL`, `CONTACT_EMAIL`, `SOURCE_URL` |
| `lib/config/landing.ts` | `headline`, the one line on the share image |
| `app/icon.svg` | the mark; then `node scripts/build-icons.mjs` regenerates `app/favicon.ico`, `app/apple-icon.png` and `public/apple-touch-icon.png` |
| `lib/config/og-image.ts`, `app/globals.css` | colours, if the clone has its own palette |

`NEXT_PUBLIC_SITE_URL` in the environment overrides `SITE_URL` per
deployment.

### 3. Which language is taught: one line each

| File | What to change |
| --- | --- |
| `lib/variety/active.ts` | export the new pack as `VARIETY` |
| `lib/situations/active.ts` | list the new situation packs in `ALL` (they are filtered by `VARIETY.tag`) |

### 4. Which languages the site speaks

`lib/i18n/locales.ts`: `LOCALES`, `DEFAULT_LOCALE`, `LOCALE_NAMES`,
`LOCALE_TAGS` and the menu order. The site's languages and the language it
teaches are separate axes: a French app for German speakers keeps `de` and
drops `gsw`.

Every language in `LOCALES` needs a file in `lib/i18n/dictionaries/`. They are
typed against `de.ts`, so a missing key is a build error and not a silent
fallback. Dropping a locale means deleting its file and its line in
`lib/i18n/index.ts`.

### 5. Write the variety pack (content, the real work)

`lib/variety/packs/<tag>.ts`, typed by `VarietyPack` in `lib/variety/pack.ts`.
Start from `uk.ts` (small) and read `gsw-zh.ts` (complete). In the order the
product leans on them:

| Field | What it carries |
| --- | --- |
| `tag`, `name`, `endonym`, `region`, `family` | identity; `tag` is a BCP 47 tag and ends up in `lang` attributes |
| `bridges` | the language the learner already knows, and how it relates |
| `learner` | who this is for and which skill comes first; the front door reads `priority[0]` |
| `correspondences` | the sound and spelling shifts worth showing on the share card and the home page |
| `rules`, `leaks` | what makes a form wrong for this variety; this is what "every answer is checked" means, so an empty list is an unchecked product |
| `orthography` | whether there is a standard spelling (decides if a variant is an error) |
| `grammar`, `vocabulary`, `explains` | the reference pages and most of the exercises |
| `capabilities`, `speech` | what a computer can honestly do with this language: transcription, synthesis, and what the page must refuse to claim |

Every entry that is a claim about the language needs a source in
`lib/research/sources.ts`; the vocabulary's sources are named in the pack
(`vocabularySources`).

### 6. Situations and exercises (content)

- `lib/situations/packs/<tag>-<domain>.ts`, typed by `SituationPack`: the
  scenes and the lines said in them, each with its provenance.
- `lib/domain/practice/templates/authored/`: hand-written questions.
  `lib/domain/practice/templates/README.md` explains the format. Questions
  generated from the pack (articles, forms, vocabulary) need nothing written.

### 7. The words on the pages (content)

- `lib/i18n/dictionaries/*.ts`: interface copy. The product name and the name
  of the language appear inside sentences here; they are prose, not
  placeholders, so this is a rewrite per language and not a search and
  replace.
- `lib/config/`: `paper.ts`, `roadmap.ts`, `changelog.ts`, `sectors.ts`,
  `investors.ts`, `economics.ts`, `problems.ts`, `roles.ts`. These are about
  this project. Start the changelog and roadmap empty (`ROADMAP.md` and
  `CHANGELOG.md` at the root are the copies the fleet reads, and
  `lib/config/records.test.ts` keeps them equal); rewrite or remove the rest.
- `content/essays/`, registered in `content/essays/index.ts`.
- `lib/listening/sources.ts`: where the language can be heard.
- `lib/research/`: `sources.ts` (the bibliography) and `language-tech.ts`
  (the evidence behind `/technology`).
- `lib/config/privacy.ts`: the data flows and vendors. They are facts about
  the deployment, so re-check each one; `lib/config/privacy.test.ts` compares
  the declared storage keys with the ones the code uses.

### 8. Storage names

Browser storage keys and the locale cookie carry this product's name
(`heidi.*` in `lib/browser/stores.ts`, and the `heidi_locale` cookie set where a
bare path is redirected to a language).
Two apps on different hosts do not collide, so renaming is optional; if you
do, change them in one commit with the privacy page's `where` values.

### 9. Environment and database

`.env.example` lists every variable with what it switches on; the app runs
with none of them and hides what is not configured. A clone needs its own
`DATABASE_URL` and `BETTER_AUTH_SECRET`, and applies the migrations in
`drizzle/` unchanged.

### 10. Prove it, then ship

```bash
pnpm install
pnpm run verify            # type-check, lint, every test incl. the pack contracts
pnpm run build
pnpm run dev               # in another terminal, for the audits below
pnpm run audit:responsive  # every page, every language, phone widths
pnpm run audit:overlays
pnpm run audit:language    # lang attributes match the language on the page
pnpm run audit:speaking    # a real microphone, a real upload
```

A new language changes word lengths, so the layout audit finds things review
does not. Then open a pull request; the fleet's sweep merges and deploys it.

## What is not cheap yet

Stated so nobody discovers it on the day:

- **The product name inside dictionary sentences.** About a hundred sentences
  per language name the product or the taught language in running text.
  Turning them into placeholders would need grammatical case in seven
  languages, so they are rewritten, not configured.
- **Pages whose prose is about Zurich.** `/method`, `/paper`, `/about` and the
  organisations page argue for this product in this city. They are content to
  write, not strings to translate.
- **Two test files assert Zurich facts** (`lib/variety/zurich-name.test.ts`,
  `lib/variety/neighbours.test.ts`). They belong to the Zurich pack; a clone
  replaces them with the equivalents for its own variety.
