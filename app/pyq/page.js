import { getQuestions } from "../../lib/pyq.js";
import { PYQ_EXAMS, papersFor } from "../../lib/pyqPapers.js";

export const metadata = {
  title: "Previous Year Questions - UPSC Compass",
};

function countBy(questions, key) {
  const counts = {};
  for (const q of questions) counts[q[key]] = (counts[q[key]] || 0) + 1;
  return counts;
}

function ExamCard({ exam, questions }) {
  const byYear = countBy(questions, "year");
  const years = Object.keys(byYear).sort((a, b) => b - a);
  return (
    <section className="side-widget pyq-exam-card">
      <h2>
        <a href={`/pyq/${exam}`}>{PYQ_EXAMS[exam].title}</a>
        <span className="pyq-count">{questions.length} questions</span>
      </h2>
      <p className="pyq-note">{papersFor(exam).map((p) => p.label).join(" · ")}</p>
      {years.length > 0 && (
        <div className="pyq-year-chips">
          {years.map((y) => (
            <a key={y} className="chip" href={`/pyq/${exam}?year=${y}`}>
              {y} <span>{byYear[y]}</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

export default function PyqPage() {
  return (
    <div className="content-page pyq-page">
      <h1>Previous Year Questions</h1>
      <p>
        Actual UPSC Civil Services questions, year by year. Filter by paper, subject or keyword;
        attempt Prelims questions against the official answer key, and draft Mains answer outlines.
      </p>
      <ExamCard exam="prelims" questions={getQuestions("prelims")} />
      <ExamCard exam="mains" questions={getQuestions("mains")} />
      <p className="pyq-note">
        Questions are transcribed from the question papers published by UPSC; Prelims answers
        follow UPSC&apos;s official answer keys.
      </p>
    </div>
  );
}
