/** Every word on /check, in one place. The page renders this; it never carries copy of its own. */
export const CHECK = {
  title: "Is this Züritüütsch?",
  intro: "Paste or type a text. A deterministic check judges it against Zurich forms — not a model.",
  placeholder: "Hoi zäme, mer gönd hüt go Znacht ässe — chunsch au?",
  buttonLabel: "Check",
  okLine: "That reads as Zurich German. No violations found.",
  headerLink: { label: "Check a text", href: "/check" },
} as const;
