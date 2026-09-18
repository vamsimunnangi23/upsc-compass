export const metadata = {
  title: "Mains - Topper's Answers - UPSC Compass",
};

export default function ToppersPage() {
  return (
    <div className="content-page">
      <h1>Topper's Answer Copies</h1>
      <p>
        Topper&apos;s Copy is a free, community-maintained archive of UPSC
        Civil Services Mains answer copies from top-ranked candidates,
        covering General Studies papers, optional subjects, and Personality
        Test (interview) transcripts. It is hosted and maintained
        independently at{" "}
        <a href="https://topperscopy.hashin.me/" target="_blank" rel="noopener noreferrer">
          topperscopy.hashin.me
        </a>.
      </p>
      <p>
        Use it alongside the current affairs on this site to see how toppers
        structured answers on similar themes.
      </p>
      <a
        className="toppers-cta"
        href="https://topperscopy.hashin.me/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Topper&apos;s Copy &rarr;
      </a>
    </div>
  );
}
