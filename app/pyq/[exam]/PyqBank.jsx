"use client";

import { useEffect, useMemo, useState } from "react";
import { paperLabel } from "../../../lib/pyqPapers.js";
import { useNotes } from "../../useNotes.js";

const PAGE_SIZE = 20;

// Question text is plain text with "\n" breaks; runs of "| a | b |" lines are
// tables (first row is the header).
function RichText({ text, className }) {
  const blocks = [];
  for (const line of text.split("\n")) {
    const isRow = /^\s*\|.*\|\s*$/.test(line);
    const last = blocks[blocks.length - 1];
    if (isRow) {
      const cells = line.trim().slice(1, -1).split("|").map((c) => c.trim());
      if (last?.type === "table") last.rows.push(cells);
      else blocks.push({ type: "table", rows: [cells] });
    } else if (last?.type === "text") {
      last.lines.push(line);
    } else {
      blocks.push({ type: "text", lines: [line] });
    }
  }

  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.type === "table" ? (
          <div className="pyq-qtable-wrap" key={i}>
            <table className="pyq-qtable">
              <thead>
                <tr>
                  {b.rows[0].map((c, j) => (
                    <th key={j}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.slice(1).map((r, j) => (
                  <tr key={j}>
                    {r.map((c, k) => (
                      <td key={k}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p key={i}>{b.lines.join("\n")}</p>
        )
      )}
    </div>
  );
}

function QuestionMeta({ q }) {
  return (
    <div className="pill-row">
      <span className="pill pill-gs">{q.year}</span>
      <span className="pill pill-cat-others">
        {paperLabel(q.paper)}
        {q.section ? ` · Section ${q.section}` : ""} · Q{q.number}
        {q.part ? `(${q.part})` : ""}
      </span>
      {q.subject && q.subject !== "Others" && <span className="pill pill-cat-polity">{q.subject}</span>}
      {q.marks && <span className="pill pill-cat-economy">{q.marks} marks</span>}
      {q.words && <span className="pill pill-cat-environment">{q.words} words</span>}
      {q.reviewed === false && (
        <span className="pill pyq-unreviewed" title="Imported automatically and not proofread yet">
          unverified
        </span>
      )}
    </div>
  );
}

function FigureNote({ q, sources }) {
  if (!q.figure) return null;
  const url = sources[q.year]?.[q.paper];
  return (
    <p className="pyq-figure-note">
      This question relies on a figure.{" "}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          See it in the original paper
        </a>
      )}
    </p>
  );
}

function PrelimsQuestion({ q, sources }) {
  const [selected, setSelected] = useState(null);
  const hasAnswer = q.answer !== null && q.answer !== undefined;

  return (
    <div className="side-widget pyq-question">
      <QuestionMeta q={q} />
      {q.passage && (
        <details className="pyq-passage">
          <summary>Passage</summary>
          <RichText text={q.passage} />
        </details>
      )}
      <RichText text={q.question} className="prelims-question pyq-text" />
      <FigureNote q={q} sources={sources} />
      {q.options.map((option, i) => {
        let cls = "prelims-option";
        if (selected !== null && hasAnswer && i === q.answer) cls += " correct";
        else if (selected !== null && hasAnswer && i === selected) cls += " incorrect";
        return (
          <button key={i} className={cls} onClick={() => selected === null && setSelected(i)} disabled={selected !== null}>
            ({String.fromCharCode(97 + i)}) {option}
          </button>
        );
      })}
      {selected !== null && (
        <div className="prelims-explanation">
          {hasAnswer
            ? `${selected === q.answer ? "Correct! " : ""}Official answer: (${String.fromCharCode(97 + q.answer)})`
            : q.dropped
              ? "UPSC dropped this question in its official answer key."
              : "UPSC hasn't published an official answer for this question."}{" "}
          <button className="pyq-link-btn" onClick={() => setSelected(null)}>Try again</button>
        </div>
      )}
    </div>
  );
}

function MainsQuestion({ q, note, onNote }) {
  const [open, setOpen] = useState(false);
  const showBox = open || Boolean(note);
  return (
    <div className="side-widget pyq-question">
      <QuestionMeta q={q} />
      <RichText text={q.question} className="prelims-question pyq-text" />
      {showBox ? (
        <textarea
          className="note-box"
          placeholder="Your answer outline (saved on this device)"
          defaultValue={note}
          onBlur={(e) => onNote(e.target.value)}
          rows={4}
        />
      ) : (
        <button className="pyq-link-btn" onClick={() => setOpen(true)}>✍️ Write answer outline</button>
      )}
    </div>
  );
}

export default function PyqBank({ exam, questions, papers, sources }) {
  const { notes, setNote } = useNotes();
  const [year, setYear] = useState("");
  const [paper, setPaper] = useState("");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Year links from the /pyq landing page arrive as ?year=2024.
  useEffect(() => {
    const y = new URLSearchParams(window.location.search).get("year");
    if (y) setYear(y);
  }, []);

  const years = useMemo(() => [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a), [questions]);
  const subjects = useMemo(
    () =>
      [...new Set(questions.filter((q) => !paper || q.paper === paper).map((q) => q.subject).filter(Boolean))].sort(),
    [questions, paper]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return questions.filter(
      (q) =>
        (!year || q.year === Number(year)) &&
        (!paper || q.paper === paper) &&
        (!subject || q.subject === subject) &&
        (!needle ||
          q.question.toLowerCase().includes(needle) ||
          (q.options || []).some((o) => o.toLowerCase().includes(needle)))
    );
  }, [questions, year, paper, subject, query]);

  function update(setter) {
    return (e) => {
      setter(e.target.value);
      setLimit(PAGE_SIZE);
    };
  }

  return (
    <div>
      <div className="pyq-filters">
        <select value={year} onChange={update(setYear)} aria-label="Year">
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={paper}
          onChange={(e) => {
            update(setPaper)(e);
            setSubject("");
          }}
          aria-label="Paper"
        >
          <option value="">All papers</option>
          {papers.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
        <select value={subject} onChange={update(setSubject)} aria-label="Subject">
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input type="search" placeholder="Search questions…" value={query} onChange={update(setQuery)} aria-label="Search questions" />
      </div>
      <p className="pyq-note">
        {filtered.length} of {questions.length} questions
      </p>

      {filtered.slice(0, limit).map((q) =>
        exam === "prelims" ? (
          <PrelimsQuestion key={q.id} q={q} sources={sources} />
        ) : (
          <MainsQuestion key={q.id} q={q} note={notes[`pyq:${q.id}`] || ""} onNote={(text) => setNote(`pyq:${q.id}`, text)} />
        )
      )}

      {filtered.length > limit && (
        <button className="prelims-submit" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
          Show more ({filtered.length - limit} left)
        </button>
      )}
      {filtered.length === 0 && <div className="empty-state">No questions match these filters.</div>}
    </div>
  );
}
