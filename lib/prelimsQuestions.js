// Static sample prelims-style practice questions. These are generic GS
// questions for practice, not auto-generated from the day's news -- reliably
// generating fact-checked MCQs from headlines needs more than keyword
// matching, so this bank is hand-written instead.
export const PRELIMS_QUESTIONS = [
  {
    gsPaper: "GS II",
    category: "Polity",
    question: "Consider the following statements regarding the Election Commission of India:",
    statements: [
      "It is a constitutional body established under Article 324.",
      "It supervises elections to the offices of President and Vice-President.",
    ],
    options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
    correctIndex: 2,
    explanation:
      "The Election Commission is a constitutional body under Article 324 and conducts elections to Parliament, State Legislatures, and the offices of President and Vice-President.",
  },
  {
    gsPaper: "GS III",
    category: "Economy",
    question: "Which of the following best describes 'repo rate'?",
    statements: [
      "The rate at which RBI lends short-term funds to commercial banks.",
      "The rate at which commercial banks lend to the public.",
    ],
    options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
    correctIndex: 0,
    explanation:
      "Repo rate is the rate at which the RBI lends money to commercial banks against government securities, used as a key monetary policy tool.",
  },
  {
    gsPaper: "GS III",
    category: "Environment",
    question: "The Wetlands (Conservation and Management) Rules in India are notified under which Act?",
    statements: [],
    options: [
      "Wildlife Protection Act, 1972",
      "Environment (Protection) Act, 1986",
      "Forest (Conservation) Act, 1980",
      "Biological Diversity Act, 2002",
    ],
    correctIndex: 1,
    explanation:
      "Wetland Rules are notified under the Environment (Protection) Act, 1986, which empowers the central government to protect and conserve wetlands.",
  },
  {
    gsPaper: "GS I",
    category: "Geography",
    question: "The Tropic of Cancer passes through how many Indian states?",
    statements: [],
    options: ["6", "7", "8", "9"],
    correctIndex: 2,
    explanation:
      "The Tropic of Cancer passes through 8 Indian states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, and Mizoram.",
  },
  {
    gsPaper: "GS III",
    category: "Science & Technology",
    question: "GSLV Mark III (LVM3) is primarily used by ISRO for launching:",
    statements: [],
    options: [
      "Only communication satellites",
      "Heavier payloads into geostationary and other orbits",
      "Only lunar missions",
      "Sounding rockets for atmospheric studies",
    ],
    correctIndex: 1,
    explanation:
      "LVM3 is ISRO's heaviest launch vehicle, designed to carry heavier payloads (including Chandrayaan-2/3) to various orbits.",
  },
  {
    gsPaper: "GS II",
    category: "International Relations",
    question: "The Quad grouping consists of India, the United States, Japan, and:",
    statements: [],
    options: ["South Korea", "Australia", "Indonesia", "United Kingdom"],
    correctIndex: 1,
    explanation:
      "The Quadrilateral Security Dialogue (Quad) comprises India, the United States, Japan, and Australia.",
  },
];

function dayIndex(length) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return day % length;
}

export function questionOfTheDay() {
  return PRELIMS_QUESTIONS[dayIndex(PRELIMS_QUESTIONS.length)];
}
