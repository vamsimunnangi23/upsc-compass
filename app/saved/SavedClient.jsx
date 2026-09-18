"use client";

import { useMemo } from "react";
import { useBookmarks } from "../useBookmarks.js";
import ArticleCard from "../ArticleCard.jsx";

export default function SavedClient({ articles }) {
  const { bookmarks, toggleBookmark } = useBookmarks();

  const saved = useMemo(
    () => articles.filter((a) => bookmarks.has(a.link)),
    [articles, bookmarks]
  );

  return (
    <div className="content-page" style={{ maxWidth: "780px" }}>
      <h1>Saved Articles</h1>
      <p>
        Articles you save are kept in this browser only (no account needed),
        so they won&apos;t show up on another device. A saved article will
        also drop off this list once it scrolls out of the most recent 500
        fetched articles.
      </p>
      {saved.length === 0 ? (
        <div className="empty-state">
          <p>Nothing saved yet. Use the 🔖 Save button on any article from the home page.</p>
        </div>
      ) : (
        <div className="article-list">
          {saved.map((article) => (
            <ArticleCard
              key={article.link}
              article={article}
              isSaved={bookmarks.has(article.link)}
              onToggleSave={toggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
