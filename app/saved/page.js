import { getArticles } from "../../lib/articles.js";
import SavedClient from "./SavedClient.jsx";

export const metadata = {
  title: "Saved Articles - UPSC Compass",
};

export default async function SavedPage() {
  const articles = await getArticles();
  return <SavedClient articles={articles} />;
}
