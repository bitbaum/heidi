/**
 * Where a learner can hear Zurich German today, as data.
 *
 * WHY A REGISTER AND NOT A BLOG POST. §2 of HEIDI.md says the product exists
 * because the environment withdraws exposure precisely when it detects that
 * you need it. Heidi is a source of exposure that does not withdraw — and the
 * cheapest, largest source of exposure in existence is the media the Swiss
 * already make for themselves. Pointing at it is not a stopgap until the
 * recordings exist; it is the part of the problem that needs no recordings.
 *
 * WHY EVERY ROW CARRIES A VARIETY. This is the whole reason the file is not
 * "a list of Swiss channels". Switzerland is diglossic, and Swiss media splits
 * along that seam in a way nobody tells a learner: the evening news bulletin
 * is read in Standard German, and the magazine that follows it is in dialect.
 * A beginner sent to Tagesschau to "practise Swiss German" gets an hour of
 * exactly the German they already have, concludes that Swiss German is easy,
 * and is no closer to the lunch table. The same mistake in the other
 * direction — a first week spent on Arena, four people interrupting each other
 * in four dialects — teaches them that it is hopeless.
 *
 * That split is the same lemons problem §6 built the variety gate for. The
 * learner cannot audit the label, because they are here precisely because they
 * cannot yet tell the two apart by ear.
 *
 * WHAT IS NOT CLAIMED. Nobody here has listened to every programme in this
 * register and written down what they heard. `basis` says, per row, where the
 * label came from, and `"format"` is a well-founded inference and not a
 * measurement. No row claims otherwise, and the page that renders this says so
 * in the reader's language. Flipping a row to `"listened"` is somebody's
 * afternoon, and until they spend it the honest word is the one printed.
 *
 * WHAT IS DELIBERATELY NOT HERE: a difficulty score. "Level B1, 3 out of 5
 * chillis" is the false precision §8 forbids — there is no scale, nobody
 * calibrated one, and the number would be ours rather than the language's.
 * What is here instead is the handful of OBSERVABLE properties that actually
 * predict how hard a recording is to follow — how many people talk at once,
 * whether it is read or spontaneous, whether Standard German subtitles exist —
 * and `demand()` in `flow.ts` derives an ordering from those. Derived, not
 * asserted, for the same reason `what keeps catching you` is derived from kept
 * words rather than tracked.
 *
 * EVERY URL BELOW WAS FETCHED AND ITS PAGE TITLE CHECKED against the name in
 * the row — see `scripts/check-listening-links.mjs`, which is how `checked`
 * gets its date and the only thing allowed to set it. A 200 is not enough on
 * its own: `youtube.com/@srf3` answers 200 and is called SRF Unterhaltung.
 */

/** Where the sound comes from. Not a topic — a way of getting at it. */
export type Medium =
  /** A YouTube channel. Free, no account, works outside Switzerland. */
  | "youtube"
  /** An on-demand audio series with an RSS feed behind it. */
  | "podcast"
  /** A station you can have on in the background — the cheapest exposure there is. */
  | "radio"
  /** A television programme, on demand. */
  | "tv"
  /** Scripted drama in several episodes. */
  | "series"
  /** A feature film. */
  | "film";

/**
 * What you actually HEAR. The single most useful fact in the row, and the one
 * a learner cannot check for themselves.
 */
export type Spoken =
  /** Swiss German dialect — the thing this product is about. */
  | "dialect"
  /** Swiss Standard German — written German, read aloud, in a Swiss accent. */
  | "standard"
  /** Both, reliably and by design: a dialect presenter over Standard German narration. */
  | "mixed";

/**
 * How we know what is spoken. Required on every row, because a variety label
 * with no provenance is the thing §8 exists to stop.
 */
export type Basis =
  /**
   * The programme is ABOUT Swiss German and is made in it; the publisher's own
   * page says as much. The strongest basis short of listening.
   */
  | "subject"
  /**
   * Inferred from the format, under a rule that holds across Swiss public
   * broadcasting: national news bulletins and the weather are read in Standard
   * German, while live magazines, talk and sport are in dialect. Documented in
   * SRG Deutschschweiz's own ombudsman ruling on the weather, which states the
   * rule while applying it.
   *
   * A well-founded inference. NOT a measurement, and never printed as one.
   */
  | "format"
  /** Somebody here listened and wrote down what they heard. Nothing yet. */
  | "listened";

/** A closed list, so a filter is a join and not a string match. */
export type Topic =
  | "news"
  | "politics"
  | "sport"
  | "everyday"
  | "science"
  | "tech"
  | "culture"
  | "music"
  | "comedy"
  | "kids"
  | "language"
  | "consumer"
  | "health"
  | "documentary"
  | "drama";

/**
 * How many voices at once — the property that most changes how hard a
 * recording is, and the one a learner most underestimates. One person telling
 * a story is a different task from four politicians interrupting each other.
 */
export type Voices = "one" | "few" | "many";

/**
 * Whether Standard German subtitles exist. For a diglossic language this is
 * not an accessibility footnote: subtitled dialect is the single most
 * effective listening material there is, because the bridge variety the
 * learner already commands is on screen while the target goes past their ear.
 */
export type Subtitles =
  /** None. */
  | "none"
  /** Standard German subtitles, made by the publisher. */
  | "standard"
  /** Machine subtitles. Present, and wrong often enough to mislead. */
  | "auto";

/** Whether it plays outside Switzerland. Rights, not politics. */
export type Reach = "open" | "ch";

/** What the link actually does when pressed. */
export type LinkKind =
  /** Press it and you are listening or watching. */
  | "play"
  /**
   * A reference page ABOUT the thing. Used for films and series, whose
   * streaming rights move between platforms every few months: a `play` link to
   * a film is a link that will be wrong by spring, and a register that rots is
   * worse than one that admits what it can promise.
   */
  | "about";

export type ListeningSource = {
  id: string;
  /** As the publisher writes it, including the Swiss spelling. */
  name: string;
  publisher: string;
  medium: Medium;
  url: string;
  linkKind: LinkKind;
  spoken: Spoken;
  basis: Basis;
  /**
   * The dialect area you mostly hear, where one dominates. A `DialectArea` id
   * from the variety pack, joined by a test so this cannot name a region the
   * atlas does not have — the same join `family.test.ts` already enforces on
   * the map. Absent means several areas, or not established.
   */
  area?: string;
  topics: readonly Topic[];
  voices: Voices;
  /** Read from a script, rather than spoken on the spot. */
  scripted: boolean;
  subtitles: Subtitles;
  reach: Reach;
  /** ISO date the URL was last fetched and its title matched. */
  checked: string;
  /**
   * Maintainer copy, in English, DELIBERATELY NOT RENDERED — the decision
   * `providers.ts` and `language-tech.ts` both record having made the hard
   * way, after an English source-copy field leaked into a German page.
   */
  note?: string;
};

/** The date every row in this file was last verified by the link sweep. */
const CHECKED = "2026-09-17";

export const LISTENING_SOURCES: readonly ListeningSource[] = [
  // ─── Dialect as the subject ────────────────────────────────────────────
  // The strongest basis in the register: these programmes are made in dialect
  // ABOUT dialect, so the label needs no inference.
  {
    id: "dini-mundart",
    name: "Dini Mundart",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/dini-mundart",
    linkKind: "play",
    spoken: "dialect",
    basis: "subject",
    topics: ["language", "culture"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "SRF's dialect strand. Episodes are short and the subject is the thing the learner is stuck on.",
  },
  {
    id: "schnabelweid",
    name: "Dini Mundart – Schnabelweid",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/dini-mundart-schnabelweid",
    linkKind: "play",
    spoken: "dialect",
    basis: "subject",
    topics: ["language", "culture"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "The long-running dialect programme on Radio SRF 1; readings, songs, listener questions.",
  },
  {
    id: "mundartrubrik",
    name: "Mundartrubrik",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/mundartrubrik",
    linkKind: "play",
    spoken: "dialect",
    basis: "subject",
    topics: ["language"],
    voices: "one",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "A few minutes, every weekday. The shortest real dialect item anywhere — the one to put in front of a beginner.",
  },
  {
    id: "schwiiz-und-duetlich",
    name: "Schwiiz und dütlich",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/schwiiz-und-duetlich",
    linkKind: "play",
    spoken: "dialect",
    basis: "subject",
    topics: ["language"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "Where Swiss surnames and dialect expressions come from.",
  },
  {
    id: "schweizerdeutsch-mit-naira",
    name: "Schweizerdeutsch mit Naira",
    publisher: "Naira",
    medium: "youtube",
    url: "https://www.youtube.com/channel/UCFXFGuYh-edaA6QDuxgOYmA",
    linkKind: "play",
    spoken: "dialect",
    basis: "subject",
    topics: ["language"],
    voices: "one",
    scripted: false,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "Made for exactly this learner. Not affiliated with Heidi; listed because it is the job being done well.",
  },

  // ─── Zurich, specifically ──────────────────────────────────────────────
  // The scarce thing in this register. Most Swiss media a learner finds is
  // Bernese or pan-Swiss; a Zurich learner wants the sound of Zurich.
  {
    id: "telezueri",
    name: "TeleZüri",
    publisher: "CH Media",
    medium: "youtube",
    url: "https://www.youtube.com/@telezueri",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    area: "zueritueuetsch",
    topics: ["news", "everyday", "politics"],
    voices: "few",
    scripted: false,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "Zurich's own television, in Zurich German, about streets the learner walks down. The closest thing to the target in the register.",
  },
  {
    id: "radio24",
    name: "Radio 24",
    publisher: "Radio 24",
    medium: "radio",
    url: "https://www.radio24.ch/",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    area: "zueritueuetsch",
    topics: ["music", "everyday", "news"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "Zurich private radio. Background listening, which is the cheapest exposure there is.",
  },
  {
    id: "radio1",
    name: "Radio 1",
    publisher: "Radio 1",
    medium: "radio",
    url: "https://www.radio1.ch/",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    area: "zueritueuetsch",
    topics: ["news", "everyday", "politics"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "Zurich talk radio — more speech per hour than a music station, which is what a learner is actually after.",
  },
  {
    id: "stadt-zuerich",
    name: "Stadt Zürich",
    publisher: "Stadt Zürich",
    medium: "youtube",
    url: "https://www.youtube.com/@stadtzuerich",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    area: "zueritueuetsch",
    topics: ["everyday", "politics"],
    voices: "few",
    scripted: true,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "The city talking to its residents — the register of the letters they will actually receive.",
  },

  // ─── News, and the diglossia trap ──────────────────────────────────────
  // These rows are in the register BECAUSE they are Standard German. A
  // learner will find them first and mistake them for practice.
  {
    id: "tagesschau",
    name: "Tagesschau",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/tagesschau?id=ff969c14-c5a7-44ab-ab72-14d4c9e427a9",
    linkKind: "play",
    spoken: "standard",
    basis: "format",
    topics: ["news"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
    note: "The classic false friend: the national bulletin is read in Standard German. Excellent Swiss Standard German practice, no dialect exposure at all.",
  },
  {
    id: "10vor10",
    name: "10 vor 10",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/10-vor-10?id=c38cc259-b5cd-4ac1-b901-e3fddd901a3d",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    topics: ["news", "politics"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
    note: "Read in Standard German; interviewees answer in dialect. The seam is visible within one item.",
  },
  {
    id: "echo-der-zeit",
    name: "Echo der Zeit",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/echo-der-zeit",
    linkKind: "play",
    spoken: "standard",
    basis: "format",
    topics: ["news", "politics"],
    voices: "few",
    scripted: true,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "Radio's flagship bulletin, Standard German. Listed so nobody practises dialect on it by mistake.",
  },
  {
    id: "news-plus",
    name: "News Plus",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/news-plus",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["news"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "One story a day, about fifteen minutes, in dialect. The dialect answer to a news habit.",
  },
  {
    id: "schweiz-aktuell",
    name: "Schweiz aktuell",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/schweiz-aktuell?id=cb28dd84-f0c8-4024-8f20-1a29f5a4ceb7",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["news", "everyday"],
    voices: "few",
    scripted: false,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
    note: "Regional news in dialect with Standard German subtitles — the combination that teaches fastest.",
  },
  {
    id: "srf-news-youtube",
    name: "SRF News & Hintergründe",
    publisher: "SRF",
    medium: "youtube",
    url: "https://www.youtube.com/@srfnews",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    topics: ["news", "politics"],
    voices: "few",
    scripted: true,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "Reachable from outside Switzerland, unlike most of Play SRF.",
  },

  // ─── Talk, argument and everyday life ──────────────────────────────────
  {
    id: "persoenlich",
    name: "Persönlich",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/persoenlich",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["culture", "everyday"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "An hour of two people talking slowly in dialect. Structurally the best listening material SRF makes.",
  },
  {
    id: "input",
    name: "Input",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/input",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["everyday", "culture"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
  },
  {
    id: "focus",
    name: "Focus",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/focus",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["culture", "music"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
  },
  {
    id: "zivadiliring",
    name: "Zivadiliring",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/zivadiliring",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["comedy", "everyday"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "Young, fast, full of the slang no course teaches. Hard, and the reward for getting there.",
  },
  {
    id: "tagesgespraech",
    name: "Tagesgespräch",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/tagesgespraech",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    topics: ["news", "politics"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "One interview a day. Which variety depends on the guest, which is itself the lesson.",
  },
  {
    id: "arena",
    name: "Arena",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/arena?id=09784065-687b-4b60-bd23-9ed0d2d43cdc",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["politics"],
    voices: "many",
    scripted: false,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
    note: "Four dialects interrupting each other. The hardest listening in the register and the reason `voices` is a field.",
  },
  {
    id: "club",
    name: "Club",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/club?id=0f532a74-d501-4470-be25-527a4fbb82fa",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["politics", "everyday"],
    voices: "many",
    scripted: false,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
  },
  {
    id: "mona-mittendrin",
    name: "Mona mittendrin",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/mona-mittendrin?id=c4cc1736-da30-4563-ab01-42a3b07231d1",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["everyday", "documentary"],
    voices: "few",
    scripted: false,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
    note: "A reporter inside an ordinary workplace — the dialect of people at work, not of broadcasters.",
  },
  {
    id: "donnschtig-jass",
    name: "Donnschtig-Jass",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/donnschtig-jass?id=8f1e1624-4753-474d-88f6-59b15541bd2b",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["everyday", "culture"],
    voices: "many",
    scripted: false,
    subtitles: "none",
    reach: "ch",
    checked: CHECKED,
    note: "The card game, the village, and whichever dialect that village speaks. As unmediated as broadcast dialect gets.",
  },

  // ─── Consumer, health, science ─────────────────────────────────────────
  {
    id: "kassensturz",
    name: "Kassensturz",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/kassensturz?id=78a6014e-8058-4bdd-88aa-824f846ca6f0",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["consumer", "everyday"],
    voices: "few",
    scripted: false,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
    note: "Insurance, rent, contracts — the vocabulary of the letters this product exists to decode.",
  },
  {
    id: "puls",
    name: "Puls",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/puls?id=709898cb-2dba-45da-8e21-b1f416c39dc9",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["health", "everyday"],
    voices: "few",
    scripted: false,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
    note: "The words you need at the doctor, spoken the way the doctor will say them.",
  },
  {
    id: "einstein",
    name: "Einstein",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/einstein?id=f005a0da-25ea-43a5-b3f8-4c5c23b190b3",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    topics: ["science"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
  },
  {
    id: "digital-podcast",
    name: "Digital Podcast",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/digital-podcast",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["tech", "science"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "Technical subject matter in dialect — useful because the nouns are English and only the grammar is new.",
  },
  {
    id: "wissenschaftsmagazin",
    name: "Wissenschaftsmagazin",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/wissenschaftsmagazin",
    linkKind: "play",
    spoken: "standard",
    basis: "format",
    topics: ["science"],
    voices: "few",
    scripted: true,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
  },
  {
    id: "kontext",
    name: "Kontext",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/audio/kontext",
    linkKind: "play",
    spoken: "standard",
    basis: "format",
    topics: ["culture"],
    voices: "few",
    scripted: true,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
  },
  {
    id: "srf-wissen",
    name: "SRF Wissen",
    publisher: "SRF",
    medium: "youtube",
    url: "https://www.youtube.com/@srfwissen",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    topics: ["science", "language"],
    voices: "few",
    scripted: true,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "Where the Dini Mundart videos live, and reachable from outside Switzerland.",
  },
  {
    id: "srf-dok",
    name: "SRF Dokus & Reportagen",
    publisher: "SRF",
    medium: "youtube",
    url: "https://www.youtube.com/@srfdok",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    topics: ["documentary", "everyday"],
    voices: "few",
    scripted: true,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "Standard German narration over people speaking dialect — the seam, in one programme.",
  },
  {
    id: "reporter",
    name: "Reporter",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/reporter?id=18477e06-560d-4305-85f0-fd397d43ad1c",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    topics: ["documentary", "everyday"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "ch",
    checked: CHECKED,
  },

  // ─── Sport ─────────────────────────────────────────────────────────────
  {
    id: "srf-sport",
    name: "SRF Sport",
    publisher: "SRF",
    medium: "youtube",
    url: "https://www.youtube.com/@srfsport",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["sport"],
    voices: "few",
    scripted: false,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "Commentary and post-match interviews: fast, emotional, and about something the viewer just watched, which is what carries the meaning.",
  },
  {
    id: "sportpanorama",
    name: "Sportpanorama",
    publisher: "SRF",
    medium: "tv",
    url: "https://www.srf.ch/play/tv/sendung/sportpanorama?id=d57ed483-2724-46b7-b1ac-7a2aa7603f59",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["sport"],
    voices: "few",
    scripted: false,
    subtitles: "none",
    reach: "ch",
    checked: CHECKED,
  },

  // ─── Comedy and entertainment ──────────────────────────────────────────
  {
    id: "srf-comedy",
    name: "SRF Comedy",
    publisher: "SRF",
    medium: "youtube",
    url: "https://www.youtube.com/@srfcomedy",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["comedy"],
    voices: "few",
    scripted: true,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "Comedy is the last thing a learner understands, because the joke lives in the exact word. A good measure of where you are.",
  },
  {
    id: "srf-unterhaltung",
    name: "SRF Unterhaltung",
    publisher: "SRF",
    medium: "youtube",
    url: "https://www.youtube.com/@srf3",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["comedy", "music", "everyday"],
    voices: "few",
    scripted: false,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
    note: "The handle still says srf3; the channel is called SRF Unterhaltung. Checked by title, not by status code.",
  },
  {
    id: "srf",
    name: "Schweizer Radio und Fernsehen",
    publisher: "SRF",
    medium: "youtube",
    url: "https://www.youtube.com/@srf",
    linkKind: "play",
    spoken: "mixed",
    basis: "format",
    topics: ["news", "culture", "everyday"],
    voices: "few",
    scripted: true,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
  },

  // ─── Children's material, which is the beginner's shortcut ─────────────
  // Slow, repetitive, high-context and unembarrassing. The fastest dialect
  // input an adult can get, and the one they are least likely to try.
  {
    id: "zambo",
    name: "SRF Kids – Zambo",
    publisher: "SRF",
    medium: "podcast",
    url: "https://www.srf.ch/kids/zambo",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["kids", "drama"],
    voices: "few",
    scripted: true,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "Radio plays in dialect, written to be followed by someone who does not know all the words. That is the learner.",
  },
  {
    id: "srf-kids",
    name: "SRF Kids",
    publisher: "SRF",
    medium: "youtube",
    url: "https://www.youtube.com/@srfkids",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["kids"],
    voices: "few",
    scripted: true,
    subtitles: "auto",
    reach: "open",
    checked: CHECKED,
  },
  {
    id: "chindermusigwaelt",
    name: "ChinderMusigWält",
    publisher: "ChinderMusigWält",
    medium: "youtube",
    url: "https://www.youtube.com/channel/UCWBAIC8DZZkkUKuf0R0zF9g",
    linkKind: "play",
    spoken: "dialect",
    basis: "format",
    topics: ["kids", "music"],
    voices: "one",
    scripted: true,
    subtitles: "none",
    reach: "open",
    checked: CHECKED,
    note: "Children's songs in dialect, with the words on screen. Repetition without shame.",
  },

  // ─── Films and series ──────────────────────────────────────────────────
  // `about` links, on purpose. Streaming rights to Swiss films move between
  // platforms every few months, so a `play` link here is a link that will be
  // wrong by spring. The row says what it is and where it is from; where to
  // watch it is a question with a different answer every year.
  //
  // Worth noticing as a group: the famous Swiss films and series are mostly
  // BERNESE. A Zurich learner who works through this list will end up with an
  // ear for the wrong dialect — which is a genuinely useful thing to know, and
  // is why `area` is on the row.
  {
    id: "der-bestatter",
    name: "Der Bestatter",
    publisher: "SRF",
    medium: "series",
    url: "https://de.wikipedia.org/wiki/Der_Bestatter",
    linkKind: "about",
    spoken: "dialect",
    basis: "format",
    area: "baerndueuetsch",
    topics: ["drama"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
    note: "The Swiss series everyone has seen. Bernese.",
  },
  {
    id: "wilder",
    name: "Wilder",
    publisher: "SRF",
    medium: "series",
    url: "https://de.wikipedia.org/wiki/Wilder_(Fernsehserie)",
    linkKind: "about",
    spoken: "dialect",
    basis: "format",
    topics: ["drama"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
    note: "Crime, several dialect areas across the seasons.",
  },
  {
    id: "tschugger",
    name: "Tschugger",
    publisher: "SRF",
    medium: "series",
    url: "https://de.wikipedia.org/wiki/Tschugger",
    linkKind: "about",
    spoken: "dialect",
    basis: "format",
    area: "wallisertitsch",
    topics: ["comedy", "drama"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
    note: "Wallis German, which other Swiss people need subtitles for. Do not start here.",
  },
  {
    id: "neumatt",
    name: "Neumatt",
    publisher: "SRF",
    medium: "series",
    url: "https://de.wikipedia.org/wiki/Neumatt",
    linkKind: "about",
    spoken: "dialect",
    basis: "format",
    area: "baerndueuetsch",
    topics: ["drama"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
  },
  {
    id: "die-schweizermacher",
    name: "Die Schweizermacher",
    publisher: "Rex-Film",
    medium: "film",
    url: "https://de.wikipedia.org/wiki/Die_Schweizermacher",
    linkKind: "about",
    spoken: "dialect",
    basis: "format",
    area: "zueritueuetsch",
    topics: ["comedy", "culture"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
    note: "1978, and still the film about becoming Swiss. Zurich-set, which makes it the rare feature in the target dialect.",
  },
  {
    id: "mein-name-ist-eugen",
    name: "Mein Name ist Eugen",
    publisher: "C-Films",
    medium: "film",
    url: "https://de.wikipedia.org/wiki/Mein_Name_ist_Eugen",
    linkKind: "about",
    spoken: "dialect",
    basis: "format",
    area: "baerndueuetsch",
    topics: ["comedy", "drama"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
  },
  {
    id: "der-goalie-bin-ig",
    name: "Der Goalie bin ig",
    publisher: "Zodiac Pictures",
    medium: "film",
    url: "https://de.wikipedia.org/wiki/Der_Goalie_bin_ig",
    linkKind: "about",
    spoken: "dialect",
    basis: "format",
    area: "baerndueuetsch",
    topics: ["drama"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
    note: "Dense Bernese, from a novel written in it. The title is a grammar lesson: the verb is `bin`, the pronoun comes last.",
  },
  {
    id: "achtung-fertig-charlie",
    name: "Achtung, fertig, Charlie!",
    publisher: "T&C Film",
    medium: "film",
    url: "https://de.wikipedia.org/wiki/Achtung,_fertig,_Charlie!",
    linkKind: "about",
    spoken: "dialect",
    basis: "format",
    topics: ["comedy"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
    note: "Army comedy — the shared reference every Swiss man under fifty has.",
  },
  {
    id: "bon-schuur-ticino",
    name: "Bon Schuur Ticino",
    publisher: "Hugofilm",
    medium: "film",
    url: "https://de.wikipedia.org/wiki/Bon_Schuur_Ticino",
    linkKind: "about",
    spoken: "mixed",
    basis: "format",
    topics: ["comedy", "politics"],
    voices: "few",
    scripted: true,
    subtitles: "standard",
    reach: "open",
    checked: CHECKED,
    note: "A comedy whose premise is the language question itself.",
  },
];
