export const QUOTES = [
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

export const TIPS = [
  "Consistency today, success tomorrow.",
  "Revise yesterday's current affairs before reading today's.",
  "Link every news item to a GS paper while reading.",
  "Note down one static fact from every current affair.",
  "Answer writing practice beats passive reading.",
];

function dayIndex(length) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return day % length;
}

export function quoteOfTheDay() {
  return QUOTES[dayIndex(QUOTES.length)];
}

export function tipOfTheDay() {
  return TIPS[dayIndex(TIPS.length)];
}
