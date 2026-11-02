// Downloads the official UPSC papers listed in data/pyq/papers.json into
// data/pyq/pdfs/{year}-{paper}.pdf, skipping files already present.
// Note: only www.upsc.gov.in serves files; the bare domain redirects every
// request to the home page.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PDF_DIR = path.join(ROOT, "data", "pyq", "pdfs");
const papers = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "pyq", "papers.json"), "utf8"));
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36";

fs.mkdirSync(PDF_DIR, { recursive: true });

for (const [year, links] of Object.entries(papers)) {
  for (const [key, url] of Object.entries(links)) {
    if (!url) continue;
    const file = path.join(PDF_DIR, `${year}-${key}.pdf`);
    if (fs.existsSync(file)) continue;
    const res = await fetch(url.replace("://upsc.gov.in", "://www.upsc.gov.in"), { headers: { "User-Agent": UA } });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.includes("pdf")) {
      console.log(`fail  ${year}-${key}: HTTP ${res.status} ${type}`);
      continue;
    }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log(`saved ${year}-${key} (${(fs.statSync(file).size / 1e6).toFixed(1)} MB)`);
  }
}
