import { getArticles } from "../lib/articles.js";
import HomeClient from "./HomeClient.jsx";

export default async function HomePage() {
  const articles = await getArticles();
  return <HomeClient articles={articles} />;
}
