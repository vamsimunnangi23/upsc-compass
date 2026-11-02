import { notFound } from "next/navigation";
import { getPaperLinks, getQuestions } from "../../../lib/pyq.js";
import { PYQ_EXAMS, papersFor } from "../../../lib/pyqPapers.js";
import PyqBank from "./PyqBank.jsx";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PYQ_EXAMS).map((exam) => ({ exam }));
}

export async function generateMetadata({ params }) {
  const { exam } = await params;
  return { title: `${PYQ_EXAMS[exam]?.title ?? "PYQs"} - UPSC Compass` };
}

export default async function PyqExamPage({ params }) {
  const { exam } = await params;
  if (!PYQ_EXAMS[exam]) notFound();

  const questions = getQuestions(exam);

  return (
    <div className="content-page pyq-page">
      <p className="pyq-crumb">
        <a href="/pyq">&larr; All previous year questions</a>
      </p>
      <h1>{PYQ_EXAMS[exam].title}</h1>
      {questions.length === 0 ? (
        <div className="empty-state">
          No {PYQ_EXAMS[exam].label} questions have been added yet.
        </div>
      ) : (
        <PyqBank exam={exam} questions={questions} papers={papersFor(exam)} sources={getPaperLinks()} />
      )}
    </div>
  );
}
