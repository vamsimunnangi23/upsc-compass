"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  GS_PAPERS,
  EXTRA_BUCKETS,
  BUCKET_META,
  categorySlug,
} from "../lib/subjects.js";
import { baseSource, digestColor } from "../lib/format.js";
import { isWithinDays, isSameDay } from "../lib/dates.js";
import { quoteOfTheDay, tipOfTheDay } from "../lib/quotes.js";
import { questionOfTheDay } from "../lib/prelimsQuestions.js";
import { useBookmarks } from "./useBookmarks.js";
import { useNotes } from "./useNotes.js";
import ArticleCard from "./ArticleCard.jsx";

const POPULAR_SEARCHES = ["Budget", "India-US relations", "Climate change", "ISRO", "Supreme Court"];

function toggleInSet(set, value) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function HomeClient({ articles }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedBuckets, setSelectedBuckets] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSources, setSelectedSources] = useState(new Set());
  const [dateRange, setDateRange] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { bookmarks, toggleBookmark } = useBookmarks();
  const { notes, setNote } = useNotes();

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch("/api/refresh", { method: "POST" });
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  }

  const availableSources = useMemo(() => {
    return Array.from(new Set(articles.map((a) => baseSource(a.source)))).sort();
  }, [articles]);

  const digestItems = useMemo(() => {
    return [...articles]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      })
      .slice(0, 5);
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      if (selectedBuckets.size > 0 && !selectedBuckets.has(article.bucket)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(article.category)) return false;
      if (selectedSources.size > 0 && !selectedSources.has(baseSource(article.source))) return false;

      if (dateRange === "today" && !isSameDay(article.publishedAt, new Date())) return false;
      if (dateRange === "3" && !isWithinDays(article.publishedAt, 3)) return false;
      if (dateRange === "7" && !isWithinDays(article.publishedAt, 7)) return false;
      if (dateRange === "30" && !isWithinDays(article.publishedAt, 30)) return false;
      if (dateRange === "custom") {
        const published = new Date(article.publishedAt);
        if (customFrom && published < new Date(customFrom)) return false;
        if (customTo && published > new Date(`${customTo}T23:59:59`)) return false;
      }

      if (query.trim() !== "" && !article.title.toLowerCase().includes(query.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [articles, selectedBuckets, selectedCategories, selectedSources, dateRange, customFrom, customTo, query]);

  function selectTopTab(bucket) {
    if (bucket === "All") {
      setSelectedBuckets(new Set());
    } else {
      setSelectedBuckets(new Set([bucket]));
    }
  }

  function resetFilters() {
    setSelectedBuckets(new Set());
    setSelectedCategories(new Set());
    setSelectedSources(new Set());
    setDateRange("today");
    setCustomFrom("");
    setCustomTo("");
    setQuery("");
  }

  const activeTopTab =
    selectedBuckets.size === 0
      ? "All"
      : selectedBuckets.size === 1
      ? [...selectedBuckets][0]
      : null;

  const feedHeading =
    dateRange === "today"
      ? "Today's Current Affairs"
      : dateRange === "custom"
      ? "Current Affairs (Custom Range)"
      : dateRange === "all"
      ? "All Current Affairs"
      : `Current Affairs — Last ${dateRange} Days`;

  const quote = quoteOfTheDay();
  const tip = tipOfTheDay();
  const question = questionOfTheDay();

  return (
    <div>
      <section className="hero">
        <h1>Stay Updated. Stay Ahead.</h1>
        <p className="hero-subtitle">Daily current affairs, simplified for UPSC.</p>
        <form
          className="hero-search"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <input
            type="text"
            placeholder="Search topics, articles, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            🔍
          </button>
        </form>
        <div className="popular-searches">
          <span className="label">Popular searches:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              className="chip"
              onClick={() => setQuery(term)}
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      <div id="gs-tabs" className="gs-tabs">
        <button
          className={`gs-tab ${activeTopTab === "All" ? "active" : ""}`}
          onClick={() => selectTopTab("All")}
        >
          <strong>All</strong>
        </button>
        {[...GS_PAPERS, ...EXTRA_BUCKETS].map((bucket) => (
          <button
            key={bucket}
            className={`gs-tab ${activeTopTab === bucket ? "active" : ""}`}
            onClick={() => selectTopTab(bucket)}
          >
            <strong>{bucket}</strong>
            <span>{BUCKET_META[bucket]?.sublabel}</span>
          </button>
        ))}
      </div>

      <div className="layout">
        <aside className="filter-panel">
          <h2>
            Filter
            <span className="reset-link" onClick={resetFilters}>
              Reset
            </span>
          </h2>
          <button
            type="button"
            className="filters-toggle"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? "Hide filters ▲" : "Show filters ▼"}
          </button>

          <div className={`filter-body ${filtersOpen ? "open" : ""}`}>
          <div className="filter-group">
            <h3>GS Paper</h3>
            {GS_PAPERS.map((paper) => (
              <label className="filter-option" key={paper}>
                <input
                  type="checkbox"
                  checked={selectedBuckets.has(paper)}
                  onChange={() => setSelectedBuckets((prev) => toggleInSet(prev, paper))}
                />
                {paper}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Category</h3>
            {CATEGORIES.map((category) => (
              <label className="filter-option" key={category}>
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category)}
                  onChange={() => setSelectedCategories((prev) => toggleInSet(prev, category))}
                />
                {category}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Source</h3>
            {availableSources.map((source) => (
              <label className="filter-option" key={source}>
                <input
                  type="checkbox"
                  checked={selectedSources.has(source)}
                  onChange={() => setSelectedSources((prev) => toggleInSet(prev, source))}
                />
                {source}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Date</h3>
            {[
              ["today", "Today"],
              ["3", "Last 3 days"],
              ["7", "Last 7 days"],
              ["30", "Last 30 days"],
              ["all", "All time"],
              ["custom", "Custom range"],
            ].map(([value, label]) => (
              <label className="filter-option" key={value}>
                <input
                  type="radio"
                  name="date-range"
                  checked={dateRange === value}
                  onChange={() => setDateRange(value)}
                />
                {label}
              </label>
            ))}
            {dateRange === "custom" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.4rem" }}>
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            )}
          </div>

          <div className="tip-box">
            💡 <span>{tip}</span>
          </div>
          </div>
        </aside>

        <section id="feed">
          <div className="feed-header">
            <h2>{feedHeading}</h2>
            <div>
              <span className="feed-date">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              {" · "}
              <span className="feed-count">{filtered.length} articles</span>
              {"  "}
              <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing} style={{ marginLeft: "0.75rem" }}>
                {refreshing ? "Refreshing..." : "Refresh news"}
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No articles match these filters. Try "Refresh news" or widen the filters.</p>
            </div>
          ) : (
            <div className="article-list">
              {filtered.map((article) => (
                <ArticleCard
                  key={article.link}
                  article={article}
                  isSaved={bookmarks.has(article.link)}
                  onToggleSave={toggleBookmark}
                  note={notes[article.link]}
                  onNoteChange={setNote}
                />
              ))}
            </div>
          )}
        </section>

        <aside>
          <div className="side-widget" id="digest">
            <h2>
              📋 Daily Digest
              <a href="#feed" onClick={() => resetFilters()}>
                View all
              </a>
            </h2>
            {digestItems.map((item, i) => (
              <div className="digest-item" key={item.link}>
                <span className="digest-num" style={{ background: digestColor(i) }}>
                  {i + 1}
                </span>
                <div className="digest-body">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                  <div className="pill-row">
                    <span className="pill pill-gs">{item.bucket}</span>
                    <span className={`pill pill-cat-${categorySlug(item.category)}`}>{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
            {digestItems.length === 0 && <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>No articles yet.</p>}
          </div>

          <PrelimsWidget question={question} />

          <div className="side-widget quote-box">
            <span className="quote-mark">&ldquo;</span>
            <p>{quote.text}</p>
            <footer>— {quote.author}</footer>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PrelimsWidget({ question }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (selected !== null) setSubmitted(true);
  }

  return (
    <div className="side-widget">
      <h2>
        📝 Prelims Practice
        <a href="/prelims">View all</a>
      </h2>
      {question.statements.length > 0 && (
        <>
          <p className="prelims-question">Consider the following statements:</p>
          <ol className="prelims-statements">
            {question.statements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="prelims-question">{question.question}</p>
        </>
      )}
      {question.statements.length === 0 && <p className="prelims-question">{question.question}</p>}
      {question.options.map((option, i) => {
        let cls = "prelims-option";
        if (submitted && i === question.correctIndex) cls += " correct";
        else if (submitted && i === selected) cls += " incorrect";
        return (
          <button key={i} className={cls} onClick={() => !submitted && setSelected(i)} disabled={submitted}>
            {String.fromCharCode(65 + i)}. {option} {!submitted && selected === i ? "●" : ""}
          </button>
        );
      })}
      {!submitted ? (
        <button className="prelims-submit" onClick={submit}>
          Submit Answer
        </button>
      ) : (
        <div className="prelims-explanation">{question.explanation}</div>
      )}
    </div>
  );
}
