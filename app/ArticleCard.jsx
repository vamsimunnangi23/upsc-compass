"use client";

import { useState } from "react";
import { categorySlug } from "../lib/subjects.js";
import { baseSource } from "../lib/format.js";

export default function ArticleCard({ article, isSaved, onToggleSave }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: article.link });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore unavailable clipboard
    }
  }

  return (
    <article className="article-card">
      {article.image ? (
        <img className="article-thumb" src={article.image} alt="" />
      ) : (
        <div className="article-thumb-fallback">{article.category.charAt(0)}</div>
      )}
      <div className="article-body">
        <div className="pill-row">
          <span className="pill pill-gs">{article.bucket}</span>
          <span className={`pill pill-cat-${categorySlug(article.category)}`}>
            {article.category}
          </span>
          {article.highPriority && <span className="pill pill-priority">High Priority</span>}
        </div>
        <h3>
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>
        <div className="article-meta">
          {baseSource(article.source)} &middot;{" "}
          {new Date(article.publishedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        {article.summary && <p className="article-summary">{article.summary}</p>}
        <div className="article-actions">
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            📖 Read more
          </a>
          <button className={isSaved ? "saved" : ""} onClick={() => onToggleSave(article.link)}>
            {isSaved ? "🔖 Saved" : "🔖 Save"}
          </button>
          <button onClick={handleShare}>{copied ? "✅ Copied!" : "📤 Share"}</button>
        </div>
      </div>
    </article>
  );
}
