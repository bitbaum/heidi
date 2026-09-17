# Changelog

What changed, and when. `HEIDI.md` is the present tense — what the product IS,
and it must never contradict itself. This file is the past tense, which is a
different job: it is the only place that can say a thing used to be otherwise.

One file, still. §"One file, not four" in `HEIDI.md` is about the DEFINITION
not being spread across four documents that drift; a dated log of changes
cannot drift from a definition because it is not making claims about the
present.

**Derived from the merge history, not written from memory.** Every entry below
corresponds to a merged pull request, and the numbers are those PRs. Where an
entry says something did not work, that is because a later entry fixed it — the
record of being wrong is the part worth keeping.

---

## 2026-09-17

**The spoken channel.** Heidi reads an answer aloud, and says what she is
speaking with every time: no browser anywhere ships a Zurich voice, `de-CH` is
Swiss Standard German, and `lib/voice/variety.ts` refuses to report any
synthesiser as dialect at all. The variety gate, which has judged generated
text since #52, now judges sound.

**Corrections became a setting**, with three rules above it that no setting can
switch on: never spelling (Zurich German has no correct one), never
pronunciation (the correction path receives no audio, so a score would be
invented), and never the forms in a transcript — recognition writes Standard
German whatever was said, so flagging them corrects the machine and bills it to
the learner.

**Where to hear it** (`/listen`): fifty Swiss podcasts, stations, channels,
programmes, series and films, each labelled with what is actually spoken and
what that label rests on. Half of Swiss broadcasting is Standard German by
format, which is the trap a learner cannot see. Kept alive by a link sweep with
three verdicts, because a Cloudflare challenge is not a dead link.

**The explanation arrives as it is written** (#67) — the answer streams rather
than appearing whole.

## 2026-09-15

- Heidi is on every page, with an account menu; the reference pages became
  places that hand work to the assistant rather than pages to read; `/technology`
  published what the field can actually do with this language, with the numbers
  (#66)
- The chat box got one accessible name, and a test that checks (#65)
- Dictation moved onto a chain through `transcribe()` in `@bitbaum/ai-kit`
  rather than one `fetch` at one vendor with one key (#63, #64)
- Signed in, the locale root IS the dashboard (#61); the reference pages folded
  into one panel (#60)
- The vocabulary that actually blocks a sentence (#59); what Swiss German is,
  and a page per dialect area (#58); every dialect area on a map that says
  which claim it is making (#57)
- A kept word comes back in a sentence it was not found in (#56)
- A middleware rewrite behind Caddy dialled TLS at an http socket and took the
  site down for signed-in visitors with every test green (#55)
- Grammar got a place an answer can link to (#54); any word became askable, not
  just the ones Heidi chose to gloss (#53)
- **Swiss Standard German became an output with its own gate** (#52) — the
  product had only ever produced the spoken half, which quietly set people up
  to send a chat message to an insurance company
- The answer proposes what to do next (#51); the dashboard asks you something
  rather than showing you a list (#50)
- Start means start (#49); the chat got a room of its own (#48)
- A shared group link can be opened by the person it was sent to (#47)

## 2026-09-14

- One renderer for every surface — groups had been storing full answers and
  rendering them as plain paragraphs since the day they shipped (#45)
- One label per control, not a visible one and a hidden twin (#46)
- The home fold became the tool rather than a picture of it (#44)
- ai-kit `^0.15.0` → `^1.8.0`, and the cast that was waiting on it deleted (#42)
- The evidence became the argument rather than a page beside it (#40);
  citations you can follow (#39)
- The headline promises an order in every language, not just four (#38)
- MIT licence (#37); five things the site said that a person would not (#36)

## 2026-09-13

- FleetCrown renamed to Loki (#35)
- A hero that demonstrates instead of claiming (#34)
- The checker was a page nobody could use, and stopped being one (#33)
- Prefetch on intent rather than on arrival (#32); the page stopped competing
  with itself on a slow connection (#31)
- Groups: humans and Heidi in one thread, on a real database (#29)
- A personal space, rather than a document about one (#28)

## 2026-09-12

- Heidi got a face, and the tool got the first screen (#27)
- **Dictation, five times.** It never started and said "listening" forever
  (#15); it did not actually dictate (#17); silence came back as a sentence
  somebody never said (#21); it fell back only when the recogniser went quiet
  and not when it errored (#24); and a browser that cannot dictate now says so
  once rather than every time (#26)
- Every public endpoint had been running with no rate limit (#16)
- Bring your own model, and Heidi can read a screenshot (#14)
- A produce turn with no dialect line left nothing to send (#13)
- **A conversation, not a form with a mode switch** (#12) — the switch was the
  bug: people arrive with a problem, not with a decision about which of our
  tools to use
- The seventh dictionary was missing a key and main was red (#19)

## 2026-09-11

- Sign in with OrangeCat; Heidi keeps no users table of its own (#11)
- Russian, a grouped language menu, and a stated scope for Swiss German (#9)
- A real multilingual portal, German first (#7)
- A truncated model answer is salvaged rather than thrown away (#6)
- **The taught language became data, not code** (#5) — the variety pack, which
  is why everything since has been a pack edit rather than a rewrite
- CI is never cancelled on main, because the deploy gate reads it (#10)

## 2026-09-10

- Scaffolded; the scaffold could not install as shipped, and was fixed (#1)
- Landing page, bespoke design tokens, the Zurich purity validator, a health
  route (#2)
- Sitemap, robots, OG image, full metadata (#3)
- An interactive Zurich-purity check page (#4)
