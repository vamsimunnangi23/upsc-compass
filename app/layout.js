import "./globals.css";
import SignInButton from "./SignInButton.jsx";

export const metadata = {
  title: "UPSC Compass",
  description: "Daily current affairs for UPSC aspirants, sorted by subject.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a className="brand" href="/">
            <span className="brand-icon">📘</span>
            <span>
              <span className="brand-name">UPSC Compass</span>
              <br />
              <span className="brand-tagline">Read. Learn. Crack.</span>
            </span>
          </a>
          <nav className="site-nav">
            <a href="/">Home</a>
            <a href="/#feed">Current Affairs</a>
            <a href="/#gs-tabs">Topics</a>
            <a href="/#digest">Daily Digest</a>
            <a href="/prelims">Prelims</a>
            <a href="/toppers">Mains</a>
            <a href="/about">About</a>
          </nav>
          <div className="header-actions">
            <a href="/saved" title="Saved articles" style={{ fontSize: "1.1rem", textDecoration: "none" }}>
              🔖
            </a>
            <SignInButton />
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            News summaries link back to the original publisher. Built for UPSC
            preparation only.
          </p>
        </footer>
      </body>
    </html>
  );
}
