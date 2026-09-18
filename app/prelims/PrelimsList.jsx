"use client";

import { useState } from "react";

function Question({ q, index }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="side-widget" style={{ marginTop: "1.25rem" }}>
      <h2 style={{ fontSize: "0.95rem" }}>
        Q{index + 1}. {q.gsPaper} &middot; {q.category}
      </h2>
      {q.statements.length > 0 && (
        <>
          <p className="prelims-question">Consider the following statements:</p>
          <ol className="prelims-statements">
            {q.statements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </>
      )}
      <p className="prelims-question">{q.question}</p>
      {q.options.map((option, i) => {
        let cls = "prelims-option";
        if (submitted && i === q.correctIndex) cls += " correct";
        else if (submitted && i === selected) cls += " incorrect";
        return (
          <button
            key={i}
            className={cls}
            onClick={() => !submitted && setSelected(i)}
            disabled={submitted}
          >
            {String.fromCharCode(65 + i)}. {option}
          </button>
        );
      })}
      {!submitted ? (
        <button
          className="prelims-submit"
          onClick={() => selected !== null && setSubmitted(true)}
        >
          Submit Answer
        </button>
      ) : (
        <div className="prelims-explanation">{q.explanation}</div>
      )}
    </div>
  );
}

export default function PrelimsList({ questions }) {
  return (
    <div>
      {questions.map((q, i) => (
        <Question q={q} index={i} key={i} />
      ))}
    </div>
  );
}
