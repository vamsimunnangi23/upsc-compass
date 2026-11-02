// Extracts questions from official UPSC CSE question paper PDFs into
// data/pyq/questions/{year}-{paper}.json.
//
// upsc.gov.in blocks scripted downloads, so save the PDFs from your browser
// (links are on /pyq) into data/pyq/pdfs/ using these names:
//   2024-prelims_gs1.pdf      2024-prelims_key_gs1.pdf
//   2024-prelims_csat.pdf     2024-prelims_key_csat.pdf
//   2024-essay.pdf  2024-gs1.pdf  2024-gs2.pdf  2024-gs3.pdf  2024-gs4.pdf
//
// Then run:  npm run import-pyq            (skips papers already imported)
//            npm run import-pyq -- --force (re-imports, overwriting edits)
//            npm run import-pyq -- 2024-gs1 (just the named papers)
//
// Parsing is heuristic: every question is written with `reviewed: false`.
// Proofread each file against the PDF and flip it to true when done.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDocumentProxy } from "unpdf";
import { categorize } from "../lib/subjects.js";
import { PYQ_PAPERS } from "../lib/pyqPapers.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PDF_DIR = path.join(ROOT, "data", "pyq", "pdfs");
const OUT_DIR = path.join(ROOT, "data", "pyq", "questions");

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

// ---------- PDF -> text lines ----------

function isMostlyDevanagari(str) {
  const deva = (str.match(/[\u0900-\u097F]/g) || []).length;
  const latin = (str.match(/[A-Za-z]/g) || []).length;
  return deva > 0 && deva >= latin;
}

async function pdfLines(file) {
  const pdf = await getDocumentProxy(new Uint8Array(fs.readFileSync(file)));
  const lines = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const { items } = await page.getTextContent();
    const rows = [];
    for (const it of items) {
      if (!it.str || !it.str.trim() || isMostlyDevanagari(it.str)) continue;
      const x = it.transform[4];
      const y = it.transform[5];
      let row = rows.find((r) => Math.abs(r.y - y) < 3);
      if (!row) rows.push((row = { y, parts: [] }));
      row.parts.push({ x, width: it.width || 0, str: it.str });
    }
    rows.sort((a, b) => b.y - a.y);
    for (const row of rows) {
      row.parts.sort((a, b) => a.x - b.x);
      let text = "";
      let lastEnd = null;
      for (const part of row.parts) {
        if (lastEnd !== null && part.x - lastEnd > 1) text += " ";
        text += part.str;
        lastEnd = part.x + part.width;
      }
      text = text.replace(/\s+/g, " ").trim();
      if (text) lines.push(text);
    }
  }
  return lines;
}

const NOISE = [
  /P\s*\.?\s*T\s*\.?\s*O/i,
  /SPACE FOR ROUGH WORK/i,
  /^www\./i,
  /^\[?\s*\d+\s*\]?$/, // bare page numbers
];

function cleanLines(lines, { keepBareNumbers = false } = {}) {
  return lines.filter((line) => {
    if (keepBareNumbers && /^\d{1,2}$/.test(line)) return true;
    return !NOISE.some((re) => re.test(line));
  });
}

// ---------- splitting into numbered questions ----------

const QNUM = /^(?:Q\.?\s*)?(\d{1,3})\s*[.)]\s*(.*)$/;

function hasAllOptions(text) {
  return ["(a)", "(b)", "(c)", "(d)"].every((o) => text.toLowerCase().includes(o));
}

// Walks lines from `start`, starting a new question only at the next expected
// number (and, for MCQs, only once the current one has all four options, so
// numbered statements inside a question don't split it).
function splitFrom(lines, start, { mcq }) {
  const questions = [];
  let current = null;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(QNUM);
    const expected = questions.length + 1;
    const ready = !current || !mcq || hasAllOptions(current.lines.join("\n"));
    if (m && Number(m[1]) === expected && ready) {
      current = { number: expected, lines: m[2] ? [m[2]] : [] };
      questions.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  return questions;
}

// Instruction pages are numbered too, so try every "1." as a starting point
// and keep the split that yields the most well-formed questions. Ties go to
// the later start (past the instructions), skipping a "1." that follows a
// colon, since that's a numbered statement inside a question.
function splitQuestions(lines, opts) {
  let best = [];
  let bestScore = -1;
  lines.forEach((line, i) => {
    const m = line.match(QNUM);
    if (!m || m[1] !== "1") return;
    if (i > 0 && lines[i - 1].trim().endsWith(":")) return;
    const qs = splitFrom(lines, i, opts);
    const score = qs.filter((q) => opts.isWellFormed(q.lines.join("\n"))).length;
    if (score >= bestScore) {
      best = qs;
      bestScore = score;
    }
  });
  return best;
}

// ---------- prelims ----------

const PASSAGE_START = /^(Directions for the following|Passage\s*[-–—]?\s*\d*|Read the following)/i;
const WORD_NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };

function parseOptions(body) {
  const lower = body.toLowerCase();
  const d = lower.lastIndexOf("(d)");
  const c = lower.lastIndexOf("(c)", d);
  const b = lower.lastIndexOf("(b)", c);
  const a = lower.lastIndexOf("(a)", b);
  if (a < 0 || b < 0 || c < 0 || d < 0) return null;
  const clean = (s) => s.replace(/\s+/g, " ").trim();
  return {
    stem: body.slice(0, a).trim(),
    options: [body.slice(a + 3, b), body.slice(b + 3, c), body.slice(c + 3, d), body.slice(d + 3)].map(clean),
  };
}

function parsePrelims(lines, year, paper) {
  const raw = splitQuestions(cleanLines(lines), { mcq: true, isWellFormed: hasAllOptions });
  const out = [];
  let passage = null;
  let passageLeft = 0;

  for (const q of raw) {
    // Text after option (d) that opens a comprehension passage belongs to the
    // questions that follow, not to this one.
    let bodyLines = q.lines;
    let nextPassage = null;
    const cut = bodyLines.findIndex((l, i) => i > 0 && PASSAGE_START.test(l) && hasAllOptions(bodyLines.slice(0, i).join("\n")));
    if (cut > 0) {
      nextPassage = bodyLines.slice(cut);
      bodyLines = bodyLines.slice(0, cut);
    }

    const parsed = parseOptions(bodyLines.join("\n"));
    const entry = {
      id: `${year}-${paper}-${q.number}`,
      year,
      paper,
      exam: "prelims",
      number: q.number,
      question: (parsed ? parsed.stem : bodyLines.join("\n")).trim(),
      options: parsed ? parsed.options : [],
      answer: null,
    };
    if (passage && passageLeft > 0) {
      entry.passage = passage;
      passageLeft -= 1;
    }
    entry.subject = paper === "prelims_csat" ? "CSAT" : categorize(entry.question, entry.options.join(" ")).category;
    entry.reviewed = false;
    out.push(entry);

    if (nextPassage) {
      const text = nextPassage.join("\n");
      const count = text.match(/following\s+(\d+|one|two|three|four|five|six|seven|eight)\s*(?:\(\w+\)\s*)?items?/i);
      passageLeft = count ? Number(count[1]) || WORD_NUMBERS[count[1].toLowerCase()] : 1;
      passage = text.trim();
    }
  }
  return out;
}

// Reads the official answer key. Keys list one column per booklet series
// (A, B, C, D); we take the column matching the series of the uploaded paper.
function parseAnswerKey(lines, seriesIndex) {
  const answers = {};
  for (const line of lines) {
    const m = line.match(/^(\d{1,3})\s+((?:[A-D*X]|Dropped)(?:\s+(?:[A-D*X]|Dropped)){0,3})\b/i);
    if (!m) continue;
    const cols = m[2].split(/\s+/);
    const value = (cols[seriesIndex] ?? cols[0]).toUpperCase();
    const n = Number(m[1]);
    // Anything other than A-D (X, *, "Dropped") marks a question UPSC dropped.
    if (answers[n] === undefined) answers[n] = value.length === 1 && "ABCD".includes(value) ? "ABCD".indexOf(value) : "dropped";
  }
  return answers;
}

function detectSeries(lines) {
  for (const line of lines.slice(0, 80)) {
    const m = line.match(/(?:Test\s+Booklet\s+)?Series\s*[:\-]?\s*([A-D])\b/i);
    if (m) return m[1].toUpperCase();
  }
  return "A";
}

// ---------- mains ----------

const WORDS_RE = /\(?\s*(?:Answer\s+in|in\s+about|in)\s+(\d{2,4})\s+words\s*\)?/i;
const MARKS_RE = /(?:^|[\s).])(\d{1,3})\s*$/;

function parseMains(lines, year, paper) {
  const cleaned = cleanLines(lines, { keepBareNumbers: true });
  const isWellFormed = (text) => WORDS_RE.test(text) || MARKS_RE.test(text.trim());
  const raw = splitQuestions(cleaned, { mcq: false, isWellFormed });

  // Record essay sections (A/B) by where each question starts.
  const sectionAt = new Map();
  if (paper === "essay") {
    let section = null;
    for (const line of cleaned) {
      const s = line.match(/^SECTION\s*[-–]?\s*([AB])\b/i);
      if (s) section = s[1].toUpperCase();
      const m = line.match(QNUM);
      if (m && !sectionAt.has(Number(m[1]))) sectionAt.set(Number(m[1]), section);
    }
  }

  return raw.map((q) => {
    let text = q.lines.filter((l) => !/^SECTION\s*[-–]?\s*[AB]\b/i.test(l)).join("\n").trim();
    const entry = { id: `${year}-${paper}-${q.number}`, year, paper, exam: "mains", number: q.number };

    const words = text.match(WORDS_RE);
    if (words) {
      entry.words = Number(words[1]);
      text = text.replace(WORDS_RE, " ");
    }
    if (paper !== "essay") {
      const marks = text.trim().match(MARKS_RE);
      if (marks && Number(marks[1]) <= 250) {
        entry.marks = Number(marks[1]);
        text = text.trim().slice(0, -marks[1].length);
      }
    } else if (sectionAt.get(q.number)) {
      entry.section = sectionAt.get(q.number);
    }

    entry.question = text.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
    entry.subject = paper === "essay" ? "Essay" : paper === "gs4" ? "Ethics" : categorize(entry.question).category;
    entry.reviewed = false;
    return entry;
  });
}

// ---------- main ----------

async function run() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`No ${path.relative(ROOT, PDF_DIR)} folder. Save PDFs there first (see header of this script).`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const paperKeys = new Set(PYQ_PAPERS.map((p) => p.key));
  const files = fs.readdirSync(PDF_DIR).filter((f) => /^\d{4}-[a-z0-9_]+\.pdf$/i.test(f));
  let imported = 0;

  for (const file of files.sort()) {
    const [, yearStr, paper] = file.match(/^(\d{4})-([a-z0-9_]+)\.pdf$/i);
    const name = `${yearStr}-${paper}`;
    if (!paperKeys.has(paper)) continue; // answer keys are read alongside their paper
    if (only.length && !only.includes(name)) continue;

    const outFile = path.join(OUT_DIR, `${name}.json`);
    if (fs.existsSync(outFile) && !force) {
      console.log(`skip  ${name} (already imported; --force to overwrite)`);
      continue;
    }

    const year = Number(yearStr);
    const lines = await pdfLines(path.join(PDF_DIR, file));
    const meta = PYQ_PAPERS.find((p) => p.key === paper);
    let questions;

    if (meta.exam === "prelims") {
      questions = parsePrelims(lines, year, paper);
      const keyFile = path.join(PDF_DIR, `${yearStr}-${meta.keyOf}.pdf`);
      if (fs.existsSync(keyFile)) {
        const series = detectSeries(lines);
        const answers = parseAnswerKey(await pdfLines(keyFile), "ABCD".indexOf(series));
        for (const q of questions) {
          if (answers[q.number] === "dropped") q.dropped = true;
          else if (answers[q.number] !== undefined) q.answer = answers[q.number];
        }
        console.log(`      ${name}: answer key applied (series ${series}, ${Object.keys(answers).length} entries)`);
      }
    } else {
      questions = parseMains(lines, year, paper);
    }

    fs.writeFileSync(outFile, JSON.stringify(questions, null, 2) + "\n");
    const incomplete = meta.exam === "prelims" ? questions.filter((q) => q.options.length !== 4).length : 0;
    console.log(
      `wrote ${name}: ${questions.length} questions` + (incomplete ? `, ${incomplete} without 4 options -- check these` : "")
    );
    imported += 1;
  }

  console.log(imported ? `\nDone. Proofread the new files and set "reviewed": true.` : "\nNothing imported.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
