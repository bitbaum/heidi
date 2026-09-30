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

**This file is the copy the fleet map reads.** `loki.orangecat.ch/api/fleet/map`
ingests it (one `## YYYY-MM-DD` heading per entry, bullets under it); the
bilingual `lib/config/changelog.ts` the site renders from changes in the same
PR. Prose under a heading is for the human reader; only the bullets travel.

---

## 2026-09-30

- **Heidi answers what you wrote last.** After three answers about «Le Bilan», someone asked «Pire» and got a fourth «Le Bilan» sentence, twice: the model was handed the whole conversation as one list with nothing marking the question. The newest message now stands apart from the history, a lone word is a question about that word, and Heidi's past turns carry the sentence she actually wrote. Against the live model: 4 of 6 runs wrong before, none after.
  - The model sees the last 20 messages on every surface; saved conversations used to send all of them.
  - A stored answer in mode «answer» no longer comes back as «understand» after a reload.
- **«New conversation» where you need it.** On a phone it sits in a toolbar right above the chat instead of only inside the side menu; in the floating chat it is an icon beside expand and close instead of an underlined link that wrapped. The side menu now closes with Escape.
- **Fixed: the phone keyboard pushed the chat's header off the screen.** Both chats now size themselves to what the keyboard leaves visible, and the full-screen chat no longer opens the keyboard by itself on a phone.
- **Swiss German, all the way through.** Schwiizerdütsch is now first in the language menu, the footer and settings. With the site in Swiss German, Heidi explains in Züridütsch in saved conversations too. They used to keep the language they were started in, so a thread begun in German kept German explanations under «Erklärige uf Züridütsch». Suggestion labels («Wärmer», «Chürzer») and tones now come from the dictionary instead of appearing as the model's English («warmer», «shorter», «bridge»). The translation under a suggestion is in the reader's language, and a Swiss German reader gets none under a dialect line. Against the live model: English translations in 2 of 2 answers that carried translations before, in none of 4 after.
  - Signed in, the chosen language follows you to every device: picking one saves it to the account, and signing in opens the page in the language you last picked. German stays the default for everyone else; signed out, nothing is stored.
- **Fixed: «Chat» showed the conversation you had just left.** Signed in, the first message moves the address to the saved conversation without reloading, and the menu's «Chat» link then re-rendered that same page — the next message went into the old conversation. «Chat» now always opens an empty one.

## 2026-09-26

- **Five new kinds of question — and a reason after every answer.** Practice now also asks what somebody means, which reply fits, which sentence says exactly the German, what time or price was said, and what a word means in its sentence. The pool grew from 1,451 questions to 1,793, the objectively marked ones from 246 to 588. After each of these: the word the answer turned on, and one sentence on why — in all seven languages. (#143)
  - "Which reply fits?" — 40 questions from the situations. "What is meant?" — 34 heard lines with four readings. "Which sentence says exactly this?" — 25 questions where every wrong answer is correct Zurich German that says something else. Times and prices — 30 questions. "What does the word mean here?" — 213 words in their own sentence.
  - Fixed: a mixed session over everything drew question types in alphabetical order, and with more types than seats, writing in Zurich German was never asked at all. Now the type asked least recently goes first.
- **A home page you can read in a minute.** The home page now says what Heidi is in two columns — with a cow in front of the Alps beside it — and leads in through three steps: situations, practice, chat. About 250 words instead of 440. The menu opens on a click, shows every page with one line about it, and closes with Escape or a click outside; on a phone it opens as a full page with large tiles and the chat at the top. (#141)
- **More grammar, more words — and a real rule for the -li.** Seven new grammar topics, 62 new words (164 → 226 entries), and the -li topic now says how the form is built instead of that it "often means nothing small". Every new example passes the same Zurich check as the rest; practice has 1451 questions instead of 1233. (#142)
- **The strongest model your key can use.** Bring your own API key: paste it, Heidi checks it at once and lists the models it can reach, with the strongest preselected. Ten providers instead of five; the check no longer costs anything; when it fails you see what the provider says. The key stays only in your browser, as before.
- **The dialects, documented from the literature.** Every dialect page now shows forms that identify the region — each with its source — and links the region's grammars and dictionaries. Corrected: «het», «nid», «goht» and «stoht» are not markers of other regions; the atlas records them inside the canton of Zurich too. The «Which one is Zurich?» exercise now only asks about forms that are certainly not Zurich German.

## 2026-09-25

- **A say belongs to Solon.** The open votes and comments on the roadmap and changelog are gone again. A voice is a right someone holds — it comes through Solon, with an account and a seat in Heidi's organisation. The roadmap and the changelog are for reading again; pointing at anything on any page still goes through the feedback widget. What was submitted so far stays stored and is listed on the privacy page.
- **Heidi for Teams.** A group can now be a team: whoever created it chooses the focus and sees who is secure in which situations. Every member decides for themselves whether to show their progress, and can take it back at any time; what is shown is the standing per situation and the number of certificates — never which lines, or what anyone got wrong.
- **Your progress on every device, and a certificate per situation.** Signed in, you can switch on «Progress on every device» in settings: practice, streak and saved words are then the same on phone and laptop. Switched off — the default — everything stays in your browser. Whoever understands a situation securely can have a certificate issued for it, on its own page anyone with the link can check — without your name.
- **Five new situations, and every one deeper.** At the doctor's, at the municipal office, in the laundry room, at an apéro — and when «no» does not mean no. 19 situations with 390 lines in all, up from 14 with 140. Every translation is now also checked for Swiss Standard German: «das Velo», not «das Fahrrad».
- **Have your say on the roadmap and on every change.** Every roadmap item could be marked as needed or not and commented on, with no account needed; only what you wrote was stored, with a random key your browser kept. Withdrawn the same day — see «A say belongs to Solon» above.
- **Where is this message from?** On the dialect page you can paste a message you received. Heidi shows which forms come from where, what Zurich says instead, and what the words mean. Too little text says so — Heidi does not guess. Corrected: «nid» was labelled an eastern Swiss form; it is Bernese and central Swiss.
- **Streaks and a weekly goal.** Your area now shows how many days in a row you have practised, your best run, and a weekly goal you choose (1 to 7 days, 3 by default). One missed day is bridged automatically. All of it stays in your browser.

## 2026-09-22

- **Two new exercise kinds, and typing that is deliberately not marked.**

`pick` — a real pack sentence with one word cut out and four real words
offered. It exists because of a measurement rather than a hunch: the
twenty-six function words produced six questions between them, since they
carry no article and no paradigm and only the matching grid could see them.
They are the words the vocabulary page argues buy the most comprehension.
Function-word questions went 6 → 32; the pool went 195 → 221.

What makes it markable is the German printed underneath: several options
produce a grammatical sentence, and exactly one makes it mean that. The
distractors are filtered so no candidate's own gloss appears in the bridge —
without that rule the generator offers `nüme` against a line containing "nicht
mehr" and marks a defensible answer wrong.

- **Typing, in the two self-marked kinds.** The reveal button used to be the only control, so the retrieval could be skipped entirely. There is now an optional field to write the answer in first, and nothing compares it to the pack's — the two are shown one above the other with no verdict. Grading typed dialect would mean judging spelling in a variety that has none.

A bug found by the new tests rather than by looking: `pick` located its word
case-insensitively and then asked `blank()` to remove it, which matched
case-sensitively — so `mir` was found in «Mir händ …», reported present, and
left standing in an item that claimed to have a gap. Blanking now folds case,
which is also right on its own terms: a word at the start of a sentence is the
same word.


- **The reference section became navigable, and practice became addressable.** `/grammar` was one document four screens long with every topic expanded; it is now an index grouped into two bands — the topics a sentence does not survive, and the ones it survives while you do not — with a page per topic at `/grammar/<topic>`. Each topic page carries what a section could not: a practice session about that topic alone, the scene lines where it actually occurs, and previous/next within its band. `/vocabulary` gained a filter over both languages, jump links, a scoped session per group, and the scenes each word is said in. Every scene now practises itself.

The mechanism under all three is one thing: `?topic=`, `?scene=` and `?group=`
on `/practice`, filtering the existing pool. Nothing new is generated. It works
because `ItemSource` already recorded where each question came from — the field
built to make a wrong answer traceable turned out to make a pool addressable.

- **Two new exercise kinds.** `match` (four words, four meanings) and `gaptext` (a four-line passage from a scene with three words lifted out and offered back). The word bank is what makes a passage objectively markable in a variety with no settled spelling: the learner chooses rather than spells. A word-order exercise was considered and refused — this variety tolerates more than one order, and calling a valid alternative wrong would be the §6 failure in a new place.

- **The system now knows what you keep getting wrong.** A learner model in the browser, beside the kept words: a miss rate per topic, scene, word group and rule, which reorders every sitting so the weak half leads and names the two or three areas worth going back to. No number is ever shown — no percentage, no level, no streak. The diagnosis points at the material, never at the person. It is declared on `/privacy` and deletable from `/settings`, along with the seen-history, which had been undeclared since the exercises shipped.

The first smoothing was wrong and a test caught it: `missed/(asked+1)` let one
wrong answer out of one outrank a topic missed nine times out of twenty. The
rate is now shrunk by sample size instead.

- **Exercise kinds became modules.** `lib/domain/practice/kinds/`, one file per kind plus a registry. Adding `match` had touched five places, one of which was a bug shipped in the same commit as the feature. The registry's contract test immediately found a second: two cloze items generated from one topic could share an id, so answering one marked the other asked and one of the two was never served again.

- **And enough material that the questions stop repeating**, which was the complaint and was arithmetic rather than scheduling. A second situations domain (`everyday`), the short words no correspondence rescues, and paradigms for `si`, `gah` and `cho` — each built only from forms the packs already publish. Practice items 67 → 195, scenes 6 → 14, lines 60 → 140, vocabulary 48 → 83, grammar topics 8 → 11. Article questions went 3 → 24.

Two smaller corrections found on the way: the pack spelled `Chunnsch` in its
showcase and `Chunsch` in a grammar example, which is exactly what the
orthography note promises not to do; and four places still linked
`/grammar#<topic>` after topics became pages — including the chat's own grammar
button, the product's main loop.

## 2026-09-21

- **Situations, and the sales claim that had nothing behind it.** `/situations` is a third axis beside the variety and the locale: domain — where you need this. The first pack is care and nursing homes, six scenes from a shift (handover, the morning, pain, meals, the evening, visitors) with sixty lines, each carrying its Standard German, a direction (`hear` or `say`) and the grammar topic it turns on. Twenty-seven of them became practice items and the pack's question count went from forty to sixty-seven.

The reason it was built now is a fault rather than a plan. `/organisations` had
been telling care homes that Heidi "practises the sentences that are actually
said on your ward" since the page shipped, while the product held forty-eight
words and none of them was said on a ward. That is a claim with nothing behind
it, on a live page, which is the one thing `sectors.ts` says in its own header
it must never do. The sentence has been replaced with what is actually there,
and the row now links to the scenes so a reader can judge them directly — a
sector with proof links to it, one without shows no link, and the asymmetry is
deliberate.

Three things hold the content honest. Every line passes the deterministic
variety gate at the generation threshold, so a Bernese form fails the build
rather than reaching a learner who could not detect it — and that gate was
proven by mutating a line to `güet` and watching it fail, not by the suite
being green. Every line names the source that vouches for its lexis, while the
arrangement stays ours, because example sentences have to be written for this
product rather than lifted from resources that are non-commercial. And a pack
declares whether a native speaker has read it: `care` says **no**, and the
pages print that above the lines rather than below them. It flips when a named
person has read every line.

`lib/situations/display.ts` is very nearly the identity function and exists
anyway, for the reason `lib/variety/display.ts` exists: the pull request that
adds an English `note` to a scene is a reasonable pull request, and this is
what stops it rendering in Russian.

## 2026-09-20

- **Practice got a second attempt, and the page now argues for itself.** A missed question used to reveal its answer and move on — a test with feedback, and never a second chance to produce the thing. It now comes back three questions later, once, labelled as the second attempt. Rawson & Dunlosky (2011) is the reason: the durable gain comes from retrieving something correctly more than once, not from having seen it; Butler & Roediger (2008) is the sharper case for the three multiple-choice item kinds, where choosing a lure can leave the learner holding it unless something corrects them. The gap of three questions is ours, and is written down as a judgement rather than a finding.

The schedule hears the FIRST answer only. A word got right a minute after
being revealed has not been retrieved, and grading it twice would advance the
very interval the spacing exists to protect.

The first version of the guard was wrong in a way reading it did not show: it
refused to requeue an item already in the QUEUE, but a requeued item leaves
the queue to become the current question, so a second miss put it back again.
Found by driving a whole session wrong on purpose — eight questions became
thirteen and would have kept going. The rule is now stated on what decides it,
and a test pins the worst case at exactly twice the session size.

- **`/practice` explains its own design, with the papers.** Seven claims, each linking to the study behind it, on the page the design belongs to rather than on `/method` — the person reading has just been told they got something wrong and is entitled to know whether the thing telling them knows anything. The interleaving row states the meta-analysis's moderator instead of suppressing it, and the row about the three-question gap says the number is ours. Every citation carries the same guarantee the research page already had: a test refuses a row that cites nothing, and refuses a locale that cites something different for the same sentence.

- **The dialect pages gained the structure they were describing.** Three branches of Alemannic, each carrying the pair of forms that draws its line — `Kind` inside Low Alemannic, `Chind` outside — with the two areas that genuinely straddle a line carrying no branch at all rather than a tidier falsehood. The area pages also list where each dialect can be heard, from a register whose rows have carried an atlas id since the first commit without any page following the join.

- **Essays**, because the question people actually arrive with — why a country this small has this many dialects, and why the big neighbour lost its own — is an argument with sources rather than a form or a map. Typed blocks rather than Markdown, so a page cannot render a type size the design system does not have, and translation is explicitly not required: an essay exists in the languages somebody wrote it in, a reader in another is told which one they are getting, and the sitemap's hreflang names only real translations.

- **Every page is now measured for overflow rather than screenshotted.** `pnpm run audit:responsive` drives every route in every language at four phone widths in both themes, with a browser that has been used, and fails on an element that leaves the viewport or whose content is wider than itself. It was written after the third report of a page scrolling sideways on a phone, each of which had been fixed one page at a time. `/portal` with eleven ordinary kept words measured 516px wide in a 360px viewport.

---

## 2026-09-18

- **Somewhere to open your mouth.** Record yourself and see what the recording actually shows: time spent speaking, where the pauses were, and which words came from another dialect. No score for pronunciation — nobody can measure that honestly today, and a number would be a claim about a person. In Zurich German nothing is transcribed, on purpose: no system writes this dialect down reliably.

## 2026-09-17

- **The spoken channel.** Heidi reads an answer aloud, and says what she is speaking with every time: no browser anywhere ships a Zurich voice, `de-CH` is Swiss Standard German, and `lib/voice/variety.ts` refuses to report any synthesiser as dialect at all. The variety gate, which has judged generated text since #52, now judges sound.

- **Corrections became a setting**, with three rules above it that no setting can switch on: never spelling (Zurich German has no correct one), never pronunciation (the correction path receives no audio, so a score would be invented), and never the forms in a transcript — recognition writes Standard German whatever was said, so flagging them corrects the machine and bills it to the learner.

- **Where to hear it** (`/listen`): fifty Swiss podcasts, stations, channels, programmes, series and films, each labelled with what is actually spoken and what that label rests on. Half of Swiss broadcasting is Standard German by format, which is the trap a learner cannot see. Kept alive by a link sweep with three verdicts, because a Cloudflare challenge is not a dead link.

- **The explanation arrives as it is written** (#67) — the answer streams rather than appearing whole.

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
