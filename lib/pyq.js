// Server-side loader for PYQ data under data/pyq/. Question files are written
// by scripts/import-pyq.mjs (one file per year + paper) and proofread by hand.
import fs from "node:fs";
import path from "node:path";
import { PYQ_PAPERS } from "./pyqPapers.js";

const DATA_DIR = path.join(process.cwd(), "data", "pyq");
const QUESTIONS_DIR = path.join(DATA_DIR, "questions");

export function getPaperLinks() {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, "papers.json"), "utf8"));
}

function paperOrder(key) {
  return PYQ_PAPERS.findIndex((p) => p.key === key);
}

export function getQuestions(exam) {
  const keys = new Set(PYQ_PAPERS.filter((p) => p.exam === exam).map((p) => p.key));
  let files = [];
  try {
    files = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }

  const questions = [];
  for (const file of files) {
    const match = file.match(/^(\d{4})-([a-z0-9_]+)\.json$/);
    if (!match || !keys.has(match[2])) continue;
    const list = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, file), "utf8"));
    questions.push(...list);
  }

  return questions.sort((a, b) => b.year - a.year || paperOrder(a.paper) - paperOrder(b.paper) || a.number - b.number || (a.part || "").localeCompare(b.part || ""));
}

export function getQuestionCounts() {
  return { prelims: getQuestions("prelims").length, mains: getQuestions("mains").length };
}
