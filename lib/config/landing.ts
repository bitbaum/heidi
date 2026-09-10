/**
 * Every word on the landing page, in one place. The page renders this; it
 * never carries copy of its own.
 */
export const LANDING = {
  eyebrow: "Züritüütsch · Zürich",
  brand: "Heidi",
  headline: "Understand Zurich German. Then text like a local.",
  sub: "For people who already know some German and still understand nothing at the lunch table. Listening first, texting second, speaking last — in that order, on purpose.",
  cta: { label: "Try Heidi", href: "/try" },
  secondary: { label: "Why understanding comes first", href: "#understand" },

  /** The subject's own detail: the rules that turn German you know into Zurich German you don't. */
  correspondences: [
    { de: "Kind", gsw: "Chind", rule: "k → ch" },
    { de: "Haus", gsw: "Huus", rule: "au → uu" },
    { de: "ist", gsw: "isch", rule: "st → sch" },
    { de: "gut", gsw: "guet", rule: "u → ue" },
  ],
  correspondencesNote:
    "A dozen regular rules like these unlock hundreds of words you already own. Heidi teaches them inside listening practice, not as a lecture — the lecture version was tested and did not work.",

  sections: [
    {
      id: "understand",
      title: "Understand first",
      body: "Listening comes before speaking. In Switzerland, understanding dialect and replying in Standard German is a complete, respected way to belong — and it is the only way to keep the input flowing, because the Swiss switch to Hochdeutsch the moment they notice you struggling.",
    },
    {
      id: "text",
      title: "Text like a local",
      body: "Reply to real WhatsApp and Telegram messages in dialect. Heidi glosses the few words you would miss, offers replies you can pick from, and lets you type your own — because typing it yourself is where the learning actually happens.",
    },
    {
      id: "measured",
      title: "Measured, not gamified",
      body: "Your progress is a real number: how much of an unfamiliar Zurich speaker you understand, before and after. No streaks, no gems, no fabricated scores. If it cannot be measured, Heidi does not claim it.",
    },
  ],

  state: {
    title: "Built in the open",
    body: "Today: this page. Next: the sixty-second ear-change — hear a Zurich speaker, tune in, hear another, and catch measurably more. Every second of dialect you will hear in Heidi is a real person, recorded in Zurich.",
  },

  footer: {
    line: "Built on OrangeCat, in Zürich.",
    link: { label: "orangecat.ch", href: "https://orangecat.ch" },
  },
} as const;
