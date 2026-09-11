# Heidi

The canonical definition. If product behaviour is decided anywhere else — a
ChatGPT prompt, a Claude transcript, a blog post, a landing-page config — it is
not decided. It is written here or it is not real.

One file, not four. A product this small does not need a documentation set; it
needs one page that cannot drift from itself.

---

## 1. What it is

> Heidi helps an adult who already has German understand the Zurich German
> actually spoken around them, deal with the messages and speech they meet in
> real life, and turn those encounters into learning — measured by how much of
> an unfamiliar Zurich speaker they understand, not by how much Heidi they have
> consumed.

Live at `heidi.orangecat.ch`. An OrangeCat property, built and dispatched
through FleetCrown.

---

## 2. The problem, from first principles

An adult lives in an environment where communication happens in a target
variety **T**. They already command a related bridge variety **B**. They cannot
understand T.

The mechanism that would fix this is exposure. And the environment withdraws
exposure precisely when it detects that they need it: the Swiss switch to
Hochdeutsch or English the moment they notice you struggling. The learner is
denied the input *because* they are a learner.

**That trap is the reason a product is justified at all.** Heidi is a source of
exposure that does not withdraw. Everything else is downstream of that sentence.

Two consequences follow immediately:

1. **Raw exposure is not input.** Speech you understand 0% of is noise. The job
   is calibrated exposure at the learner's frontier — which means the frontier
   has to be measured, per learner, continuously. That measurement is the thing
   software can do that a podcast cannot, and it is the whole justification for
   building this rather than recommending a radio station.

2. **The learner cannot audit what we sell them.** They are buying Zurich German
   *because* they do not know Zurich German. If we hand them Bernese forms, they
   will never find out. This is a lemons market, and it is why the deterministic
   variety gate (§6) is not a quality nicety but the thing that makes the
   product honest at all. The same logic forces real recorded speakers.

---

## 3. Fact, hypothesis, decision

Language-learning products accumulate pseudoscience by letting "there is a
study" become "this is proven" become "the product is built on it". These three
headings are kept separate on purpose, and every claim below is filed under one.

### FACT — established, and we rely on it

- **Exposure dominates every linguistic distance measure.** Across 1,833
  listeners and 70 language pairs, exposure to the test language overrode
  lexical, phonological and orthographic distance as a predictor of
  intelligibility. *(Gooskens, van Heuven, Golubović, Schüppert, Swarte & Voigt
  2017/18, Int. J. Multilingualism.)*
- **Consonant correspondences predict intelligibility far better than vowel
  ones** — r ≈ −.74 vs −.29. *(Gooskens & Heeringa.)* Two of Heidi's current
  four correspondences are vowel rules, which is the weaker bet; note recorded
  in the pack.
- **Multi-talker training is what buys generalisation to unheard talkers.**
  Single-talker training can match or beat it on the trained voice and fails to
  transfer. Demonstrated for phonetic training *(Logan, Lively & Pisoni 1991;
  Lively et al. 1993)* and replicated specifically for regional **dialects**
  *(Clopper & Pisoni 2004)* — the closest precedent to our exact case.
- **Generalisation is graded by acoustic similarity, not a switch.** Adapting to
  one talker transfers partially to a new talker of the same variety, and less
  as the voices diverge. *(Bradlow & Bent 2008; Xie & Weatherholtz et al. 2017.)*
- **Telling the listener what to attend to is an active ingredient.** Identical
  stimuli and identical feedback; only the group cued to the relevant contrast
  learned it. *(Pederson & Guion-Anderson 2010.)*
- **Retrieval with corrective feedback beats restudy.** 222 studies, 48,478
  students; g ≈ 0.50 overall, and feedback matters — g ≈ 0.54 with, 0.37
  without. *(Yang, Luo, Vadillo, Yu & Shanks 2021, Psychological Bulletin.)*
- **Spacing beats massing in L2**, and the advantage grows at delay: g ≈ 0.76
  immediate, g ≈ 1.15 delayed, over 48 experiments and 3,411 participants.
  *(Kim & Webb 2022, Language Learning.)*
- **Captions help, after the listening attempt.** Large effect on vocabulary
  (g ≈ 0.87) and on comprehension, apparently by helping segment the speech
  stream. *(Montero-Perez, Van Den Noortgate & Desmet 2013.)* The crutch risk is
  real and is specifically about text shown *during* listening.
- **Perception training transfers weakly to production** — d ≈ 0.92 perception,
  d ≈ 0.54 production, uncorrelated across studies. *(Sakai & Moorman 2018.)*
  So comprehension training must not be sold as a speaking fix.
- **Written dialect is normal in Swiss digital communication**, not slang —
  which is what makes "text like a local" a real competence and not a gimmick.
  *(Uni Bern, Texting in Time; UZH What's Up corpus.)*

### HYPOTHESIS — plausible, untested, and Heidi is the instrument

- **Correspondences work as in-practice attentional cues even though they fail
  as a lecture.** The one rigorous test of the lecture form — 50 minutes of
  Dutch↔Frisian correspondence instruction — produced no significant gain
  *(Bergsma, Swarte & Gooskens 2014)*, and the authors themselves decline to
  generalise it. The whole European intercomprehension pedagogy tradition
  (EuroCom, Galanet, Galapro) is, in Gooskens & van Heuven's own words,
  essentially unevaluated. The nearest positive evidence is indirect: Slavic
  learners recognised non-words far better when the change followed a regular
  correspondence, amplified by sentence context. **Status: our design is the
  untested one. Test it — condition A audio→answer→replay, condition B
  audio→one correspondence cue→replay→answer, outcome = delayed generalisation
  to unseen words from an unheard speaker.**
- **A short tuning session measurably improves cross-speaker comprehension.**
  See the overclaim register (§8) — what is established at ~60 seconds is
  processing speed, not accuracy.

### DECISION — product choices, valid whether or not the hypotheses hold

- **Listening before texting before speaking** for Zurich German. Justified by
  the sociolinguistics, not only the evidence: understanding dialect and
  replying in Standard German is a complete, respected way to take part.
- **Measured, not gamified.** The reported number is comprehension of an
  unfamiliar Zurich speaker, before and after. No streaks, no gems.
- **The test speaker is always one the learner has not heard.** Forced by the
  generalisation research; without it we would be measuring memory.
- **Real recorded Zurich speakers.** Note the reason has changed — see §7.
- **The model never judges its own variety.** §6.

---

## 4. Architecture: the variety is data

George's requirement: *"if tomorrow I tell you to make the same kind of Heidi
but for Ukrainian, and call it Lesya, we should be able to do that."*

Taken as a **now** constraint, not a later one — because it decides the shape of
everything, and retrofitting it costs more than building it.

The wrong answer is i18n. Translating the UI is not the problem; the subject
matter is the problem. The right answer falls out of §2: if the product is
"comprehension of a related variety across a bridge you already have", then the
*variety* is a parameter and the *engine* is general.

```
lib/variety/
  pack.ts        the contract — what any variety must declare
  check.ts       the deterministic gate, generic over packs
  active.ts      THE SEAM — one line saying which variety this build teaches
  packs/gsw-zh.ts  Zurich German   (Heidi)
  packs/uk.ts      Ukrainian       (Lesya)
```

**The house rule that keeps it honest:** nothing outside `lib/variety/packs/`
may name a Zurich form, a German word or a Swiss fact. If swapping the pack
would not swap the product, something has leaked.

A pack declares identity, bridges, the learner profile, correspondences,
contamination rules, orthography policy, and capabilities. It is enforced by a
contract test suite that runs over *every* pack, so a half-finished Lesya turns
the build red rather than shipping.

### What writing the second pack actually proved

Writing `uk.ts` was the point — an abstraction with one instance is a guess.
It held, and it cost two fields:

| | Heidi (Zurich German) | Lesya (Ukrainian) |
|---|---|---|
| Contamination threat | Bernese / Basel / Ostschweiz forms | Russian calques, surzhyk |
| Orthography | **none** — spelling is convention | **state standard** — spelling can be wrong |
| Learner's broken skill | **comprehension** | **production** |
| ASR / TTS | none usable | both, off the shelf |
| Licensed audio | none (all NC) | abundant |

Three things generalised cleanly: the bridge mechanism, the contamination gate,
and the pipeline shape. Two broke the contract and forced new fields:

1. **`orthography.standardised`.** Identical checker behaviour would be wrong in
   one direction or the other — nagging Swiss users about spelling that has no
   standard, or waving through genuine Ukrainian errors.

2. **`learner.priority` — and this is the one that would have sunk a naive
   port.** A Russian-speaking Ukrainian has understood Ukrainian since school;
   they receive it fluently. Their gap is confident, interference-free
   *production*. Shipping Heidi's listening-first front door to that population
   drills a skill they already have and skips the one they came for. So the
   engine never hardcodes the front door — it reads `priority[0]`.

`capabilities` earns its place for the same reason: it declares which surfaces
can exist at all, so the engine degrades rather than assumes. Heidi cannot offer
pronunciation feedback; Lesya could on day one.

**Extraction:** this stays inside Heidi until a second instance exists. Per the
fleet's own rule, the shared package is created at the second consumer, not the
first. The seam is drawn now so the extraction is mechanical then.

---

## 5. What is true of the repo today

645 lines: a landing page, a `/try` placeholder, a health route, and the
variety layer. No accounts, no database, no model calls, no audio, no learner
model. Answering the obvious questions plainly:

- **Linguistic knowledge is data**, in the packs — not embedded in prompts.
- **There is no user model, no auth, no persistence.** Nothing has been decided
  and nothing is hard to reverse.
- **Nothing is difficult to undo.** This is a good moment to make structural
  choices and a bad moment to claim any exist.

---

## 6. The variety gate

A deterministic, model-free check over any text claiming to be the target
variety. Findings carry a severity, ranked by *how certainly wrong*:

| severity | meaning | example |
|---|---|---|
| `unattested` | not a form of the language at all | `ß` in Swiss; `ы` in Ukrainian |
| `foreign` | a real form, of another variety | Bernese `güet`; Russian `кофе` |
| `dispreferred` | real here, but house style differs | — |
| `variant` | legitimate spelling variation — never shown as an error | — |

`unattested` outranks `foreign` deliberately: a Bernese form is a real word that
a real person says and the judgement is regional and arguable; a `ß` in Swiss
text is not a form of the language and no reviewer will overturn it. Ranking
these the other way round let both through the gate — caught by a test, which is
the argument for the tests.

One rule set, two thresholds. The generation gate rejects at `foreign` and
above. House style is checked at `dispreferred` for our own copy. **A learner's
own writing is checked at `foreign` too** — telling someone their spelling is
wrong in a variety with no standard spelling is the one thing this product must
never do.

Known limit: the regional judgements in `gsw-zh.ts` are inherited and have not
been reviewed by a native Zurich speaker. An LLM must not be the sole grader of
another LLM's dialect. A native panel is required before any generated dialect
reaches a learner.

---

## 7. Corrections to the record

Findings that contradict what is currently published or assumed. These are here
because being wrong in public is expensive and quiet correction is cheap.

1. **SwissDial is CC BY-NC 4.0 — non-commercial.** So is SDS-200, ArchiMob,
   SwissCrawl, the What's Up WhatsApp corpus and the sms4science corpus.
   STT4SG-350's licence is *contested across primary sources* (META-SHARE
   NonCommercial in one catalogue, CC BY 4.0 in another). **No Zurich-region
   speech corpus has been confirmed usable commercially.** Any plan that leans
   on one needs a licence in writing first.

2. **"There is no purchasable Swiss German TTS" is probably no longer true.**
   At least one vendor advertises commercially-cleared Züridütsch voices, and
   ZHAW/FHNW academic pipelines are close behind. Unverified independently —
   but it is published on the OrangeCat blog as fact and should be softened.
   Separately: most "Swiss German" TTS on the market is Standard German in a
   Swiss accent. Listen before believing a label.

   **The moat argument survives the correction, and is stronger for it.** It was
   never really "TTS doesn't exist" — synthetic speech will keep improving. It
   is that every Zurich corpus is research-licensed, so a *consented,
   commercially clean, richly annotated* corpus built around perceptual learning
   is an asset nobody can download. That is a licensing and consent moat, not a
   technology gap.

3. **Common Voice `gsw` is not safely "Swiss German"** — the ISO code is shared
   with Alsatian. Filter by provenance, never by label.

4. **Swiss German ASR is an unsolved problem**, and the honest published figure
   is ~25.6% WER after fine-tuning on 1,367 h; earlier, better-looking numbers
   are inflated by benchmark contamination and convention mismatch. The state of
   the art still transcribes dialect *into Standard German* — it translates away
   exactly the information a learner needs.

5. **The landing copy overclaimed the Frisian result.** "The lecture version was
   tested and did not work" implied more than one 50-minute study supports, and
   implied our alternative is the evidence-backed one when it is the untested
   one. Corrected in `lib/config/landing.ts`.

---

## 8. Overclaim register — what we must not say

- ❌ "Sixty seconds and you will understand more." What is replicated at that
  timescale is **processing speed** (reaction time, single talker, lab measure),
  not comprehension accuracy, and it is not reliably durable past a week without
  further exposure. ✅ "In under a minute your brain starts adjusting to the
  sound, and here is that effect measured."
- ❌ "Learn to speak like a local." Perception training transfers weakly to
  production.
- ❌ "93% native pronunciation." Speech-score theatre; false precision.
- ❌ Any claim that correspondence rules are proven to help. They are our
  hypothesis, and we say so.
- ❌ Presenting a Zurich spelling as the correct one. There is no correct one.

---

## 9. What to build next

The smallest increment that is useful on day one *and* produces the proprietary
asset. Not the listening lab — that needs recordings that do not exist yet.

**The universal input plus evidence capture.** One field: *what do you want to
understand or say?* It takes a word, a sentence, a pasted chat, a screenshot.
It answers immediately — because at 08:55 before a meeting the learner needs the
message decoded, not a lesson — and it records what they did not know.

The reason to build this first is not that it is easy. It is that **the existing
Heidi GPT is already generating that evidence stream and throwing all of it
away.** Every question asked of it is a labelled datapoint about what one real
learner could not understand. That is the corpus the rest of the product is
built on, and it is currently being discarded daily.

Then, in order: the learner model that evidence feeds; spaced reuse of what was
hard; and only then the listening lab, once there are recordings to put in it.

Two loops explain Heidi better than any feature list:

> Upload a real message → understand it → reply naturally → learn one thing from
> it → meet that thing again later.

> Hear a real Zurich speaker → half-fail → get one cue → understand a
> *different* speaker better.

---

## 10. Privacy

Screenshots, chats and voice notes are among the most private things a person
owns. Raw media is deleted unless the user saves it; consent to operate the
product and consent to contribute to a research corpus are **separate**, and the
second is never assumed from the first. A user's conversations do not silently
become a linguistic corpus.
