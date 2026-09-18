export const metadata = {
  title: "About - UPSC Compass",
};

export default function AboutPage() {
  return (
    <div className="content-page">
      <h1>About UPSC Compass</h1>
      <p>
        UPSC Compass pulls headlines from public RSS feeds published by The
        Hindu and Indian Express, tags each one with a likely GS paper and
        subject using keyword matching, and lists them here so aspirants can
        scan the day&apos;s current affairs by topic instead of by publication.
      </p>
      <p>
        The subject and GS-paper tags are generated automatically from
        keywords in each headline and summary — they are a starting point for
        your own reading, not a substitute for it. Articles that don&apos;t
        match any keyword list are left uncategorised rather than force-fit
        into a subject.
      </p>
      <p>
        The Prelims Practice questions are a small hand-written sample set,
        not generated from the news feed. For Mains answer-writing practice,
        see the{" "}
        <a href="/toppers">Topper&apos;s Answers</a> page, which links to the
        independent{" "}
        <a href="https://topperscopy.hashin.me/" target="_blank" rel="noopener noreferrer">
          topperscopy.hashin.me
        </a>{" "}
        archive.
      </p>
    </div>
  );
}
