# UPSC Compass

A simple current-affairs site for UPSC aspirants. It pulls headlines from
public RSS feeds (The Hindu, Indian Express, LiveMint, Business Standard, PIB),
tags each one with a likely GS paper and subject using keyword matching, and
lists them with search/filter tools. It also links out to
[topperscopy.hashin.me](https://topperscopy.hashin.me/) for Mains topper
answer copies.

## Stack

- Next.js (App Router, plain JavaScript, no TypeScript/Tailwind)
- No database and no server-side file storage — articles are fetched live
  from RSS on each request and cached in memory via Next.js's built-in fetch
  cache. This is what makes it deployable on a free serverless host (Vercel
  Hobby, etc.), which doesn't allow writing files to disk.
- `rss-parser` to parse the RSS feeds
- Saved articles live in the browser's `localStorage` — no account needed,
  no server-side storage

## Setup

```
npm install
npm run dev
```

Open http://localhost:3000. The first load fetches all RSS sources (a couple
of seconds); after that, each source is cached for 30 minutes
(`REVALIDATE_SECONDS` in `lib/articles.js`) so repeat visits are instant.
Clicking "Refresh news" busts that cache immediately via `/api/refresh`.

## Previous year questions (PYQs)

`/pyq` has a year × paper grid of the official UPSC CSE question papers and
answer keys (2011–2025, links in `data/pyq/papers.json`), plus filterable
Prelims and Mains question banks at `/pyq/prelims` and `/pyq/mains`. The
banks read `data/pyq/questions/{year}-{paper}.json` at build time, so they
stay static and need no server storage.

To add questions from an official paper:

1. Download the PDF from upsc.gov.in in your browser (the site blocks
   scripted downloads) and save it as e.g. `data/pyq/pdfs/2024-gs1.pdf`.
   For Prelims, also save the answer key as `2024-prelims_key_gs1.pdf` /
   `2024-prelims_key_csat.pdf`. File names are listed at the top of
   `scripts/import-pyq.mjs`.
2. Run `npm run import-pyq`. Existing files are skipped unless you pass
   `--force`.
3. Proofread the generated JSON against the PDF. Parsing is heuristic, so
   every question starts as `"reviewed": false` and shows an "unverified"
   badge until you set it to `true`.

Missing links in the grid fall back to UPSC's previous question papers page;
fill them in `papers.json` as you find them.

## Deploying for free

This app has no database and no persistent files, so it deploys to any
Node-compatible host with zero extra setup — most simply:

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), sign up free (no card required),
   "Add New Project", import the repo. It auto-detects Next.js — just click
   Deploy.

Or from the CLI: `npx vercel` (it'll prompt you to log in, then deploy).

The 30-minute RSS cache means the live site refetches automatically without
any cron job. If you want news to update even when nobody is visiting, add a
free [Vercel Cron Job](https://vercel.com/docs/cron-jobs) that hits
`/api/refresh` on a schedule (Hobby plan allows daily cron for free; more
frequent schedules need a paid plan — the on-visit 30-minute cache already
covers most of that need without it).

## Adding/changing news sources

Edit `lib/sources.js` — each entry is `{ name, url }` pointing at a public RSS
feed. Most Indian news sites publish these under `/feed/` or
`/feeder/default.rss` on section pages.

## Adjusting subject tagging

Edit the keyword lists in `lib/subjects.js`. Each article is scored against
every category's keyword list and assigned the best match (or "Others" if
nothing matches); a separate set of rules then buckets it into a GS paper
(I–IV) or one of Schemes/Reports/Persons/Places. This is intentionally
simple — no AI/API calls, so it's free to run — and easy to tune by
adding/removing keywords. A more accurate (but not free) alternative would be
classifying each article with an LLM call instead of keyword matching.

## Project structure

```
app/
  page.js              Home page (server component, calls lib/articles.js)
  HomeClient.jsx        Client component: hero search, GS tabs, filters, feed, digest, prelims widget, quote
  ArticleCard.jsx        Shared article card (used on home + saved pages)
  useBookmarks.js         Hook for localStorage-backed saved articles
  saved/                 Saved-articles page
  prelims/                Full Prelims practice question list
  toppers/                Link-out page for topperscopy.hashin.me (Mains)
  about/                  About/disclaimer page
  api/refresh/route.js    POST endpoint that busts the RSS cache (revalidateTag)
lib/
  sources.js              List of RSS feeds
  subjects.js              Category/GS-paper/keyword classifier
  articles.js               Fetches + parses + categorizes all sources, cached via Next.js fetch cache
  quotes.js                 Daily quote/tip (static, rotates by day of year)
  prelimsQuestions.js        Static sample Prelims MCQ bank
  format.js                  Small display helpers (source name, digest colors)
```
