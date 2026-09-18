import Parser from "rss-parser";
import { SOURCES } from "./sources.js";
import { categorize } from "./subjects.js";

const REVALIDATE_SECONDS = 1800; // 30 minutes
const MAX_ARTICLES = 500;

const parser = new Parser({
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail"],
      ["media:content", "mediaContent"],
    ],
  },
});

function extractImage(item) {
  const thumb = item.mediaThumbnail?.$?.url;
  if (thumb) return thumb;
  const content = item.mediaContent?.$?.url;
  if (content) return content;
  if (item.enclosure?.url) return item.enclosure.url;
  return null;
}

async function fetchSource(source) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["news"] },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const feed = await parser.parseString(xml);
    return (feed.items || []).map((item) => {
      const { category, score, bucket, highPriority } = categorize(
        item.title,
        item.contentSnippet
      );
      return {
        title: item.title?.trim() || "Untitled",
        link: item.link,
        source: source.name,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        summary: (item.contentSnippet || item.summary || "").trim().slice(0, 300),
        image: extractImage(item),
        category,
        bucket,
        score,
        highPriority,
      };
    });
  } catch (err) {
    console.error(`Failed to fetch ${source.name}: ${err.message}`);
    return [];
  }
}

// Fetches all RSS sources on every call, but each source URL is cached by
// Next.js's fetch cache (tag "news") for REVALIDATE_SECONDS. No filesystem
// writes, so this works unchanged on serverless/free hosting -- a manual
// refresh just calls revalidateTag("news") to force the next fetch through.
export async function getArticles() {
  const results = await Promise.all(SOURCES.map(fetchSource));

  const seen = new Map();
  for (const item of results.flat()) {
    if (item.link && !seen.has(item.link)) seen.set(item.link, item);
  }

  return Array.from(seen.values())
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, MAX_ARTICLES);
}
