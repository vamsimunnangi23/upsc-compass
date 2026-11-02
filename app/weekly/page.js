import { getArticles } from "../../lib/articles.js";
import { GS_PAPERS, EXTRA_BUCKETS, BUCKET_META, categorySlug } from "../../lib/subjects.js";
import { isWithinDays } from "../../lib/dates.js";
import { baseSource } from "../../lib/format.js";
import PrintButton from "./PrintButton.jsx";

export const metadata = {
  title: "Weekly Compilation - UPSC Compass",
};

const SECTIONS = [...GS_PAPERS, ...EXTRA_BUCKETS];

function formatShort(date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function WeeklyPage() {
  const articles = await getArticles();
  const weekArticles = articles.filter((a) => isWithinDays(a.publishedAt, 7));

  const grouped = {};
  for (const bucket of SECTIONS) grouped[bucket] = [];
  for (const article of weekArticles) {
    if (grouped[article.bucket]) grouped[article.bucket].push(article);
  }
  for (const bucket of SECTIONS) {
    grouped[bucket].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
  }

  const shownCount = SECTIONS.reduce((sum, bucket) => sum + grouped[bucket].length, 0);
  const activeSections = SECTIONS.filter((bucket) => grouped[bucket].length > 0);

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  return (
    <div className="content-page weekly-page">
      <div className="weekly-header">
        <div>
          <h1>Weekly Compilation</h1>
          <p className="weekly-note">
            {formatShort(weekAgo)} &ndash; {formatShort(today)} &middot; {shownCount} articles across{" "}
            {activeSections.length} sections
          </p>
        </div>
        <PrintButton />
      </div>
      <p className="weekly-note">
        Grouped by GS paper from the last 7 days of the same keyword-tagged
        feed as the home page. Uncategorised ("Others") articles are left out
        here since they don't map to a specific GS paper.
      </p>

      {shownCount === 0 ? (
        <div className="empty-state">
          <p>Nothing tagged in the last 7 days yet. Check back after a few days of fetching.</p>
        </div>
      ) : (
        activeSections.map((bucket) => (
          <section key={bucket} className="weekly-section">
            <h2>
              {bucket} <span className="weekly-section-sub">{BUCKET_META[bucket]?.sublabel}</span>
            </h2>
            <ol className="weekly-list">
              {grouped[bucket].map((article) => (
                <li key={article.link}>
                  <a href={article.link} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </a>{" "}
                  <span className={`pill pill-cat-${categorySlug(article.category)}`}>
                    {article.category}
                  </span>
                  {article.highPriority && <span className="pill pill-priority">High Priority</span>}
                  <span className="weekly-meta">
                    {baseSource(article.source)} &middot;{" "}
                    {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
