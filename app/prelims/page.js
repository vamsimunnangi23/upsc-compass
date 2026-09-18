import { PRELIMS_QUESTIONS } from "../../lib/prelimsQuestions.js";
import PrelimsList from "./PrelimsList.jsx";

export const metadata = {
  title: "Prelims Practice - UPSC Compass",
};

export default function PrelimsPage() {
  return (
    <div className="content-page">
      <h1>Prelims Practice</h1>
      <p>
        A small set of sample objective questions to warm up before the real
        thing. These are hand-written practice questions, not generated from
        today&apos;s news.
      </p>
      <PrelimsList questions={PRELIMS_QUESTIONS} />
    </div>
  );
}
