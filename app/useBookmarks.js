"use client";

import { useEffect, useState } from "react";

const BOOKMARK_KEY = "upsc-compass-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BOOKMARK_KEY);
      if (raw) setBookmarks(new Set(JSON.parse(raw)));
    } catch {
      // ignore unavailable storage
    }
  }, []);

  function toggleBookmark(link) {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(link)) next.delete(link);
      else next.add(link);
      try {
        window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...next]));
      } catch {
        // ignore unavailable storage
      }
      return next;
    });
  }

  return { bookmarks, toggleBookmark };
}
