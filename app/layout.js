import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import SignInButton from "./SignInButton.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "UPSC Compass",
  description: "Daily current affairs for UPSC aspirants, sorted by subject.",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("upsc-compass-theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <header className="site-header">
          <input type="checkbox" id="nav-toggle" className="nav-toggle-checkbox" />
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
            <a className="icon-link" href="/saved" title="Saved articles">
              🔖
            </a>
            <ThemeToggle />
            <SignInButton />
            <label htmlFor="nav-toggle" className="nav-toggle-label" aria-label="Toggle menu">
              ☰
            </label>
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
