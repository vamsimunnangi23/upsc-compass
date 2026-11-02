// Paper definitions for the PYQ (previous year questions) section. Kept free
// of Node imports so client components can use it too.
export const PYQ_FIRST_YEAR = 2011;
export const PYQ_LAST_YEAR = 2025;

export const PYQ_YEARS = Array.from(
  { length: PYQ_LAST_YEAR - PYQ_FIRST_YEAR + 1 },
  (_, i) => PYQ_LAST_YEAR - i
);

export const PYQ_EXAMS = {
  prelims: { label: "Prelims", title: "Prelims PYQs" },
  mains: { label: "Mains", title: "Mains PYQs" },
};

// `keyOf` names the official answer-key entry in papers.json, if any.
export const PYQ_PAPERS = [
  { key: "prelims_gs1", exam: "prelims", label: "GS Paper I", keyOf: "prelims_key_gs1" },
  { key: "prelims_csat", exam: "prelims", label: "CSAT (Paper II)", keyOf: "prelims_key_csat" },
  { key: "essay", exam: "mains", label: "Essay" },
  { key: "gs1", exam: "mains", label: "GS I" },
  { key: "gs2", exam: "mains", label: "GS II" },
  { key: "gs3", exam: "mains", label: "GS III" },
  { key: "gs4", exam: "mains", label: "GS IV" },
];

export function paperLabel(key) {
  return PYQ_PAPERS.find((p) => p.key === key)?.label ?? key;
}

export function papersFor(exam) {
  return PYQ_PAPERS.filter((p) => p.exam === exam);
}
