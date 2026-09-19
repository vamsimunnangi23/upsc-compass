"use client";

import { useEffect, useState } from "react";

const NOTES_KEY = "upsc-compass-notes";

export function useNotes() {
  const [notes, setNotes] = useState({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NOTES_KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      // ignore unavailable storage
    }
  }, []);

  function setNote(link, text) {
    setNotes((prev) => {
      const next = { ...prev };
      if (text.trim() === "") delete next[link];
      else next[link] = text;
      try {
        window.localStorage.setItem(NOTES_KEY, JSON.stringify(next));
      } catch {
        // ignore unavailable storage
      }
      return next;
    });
  }

  return { notes, setNote };
}
