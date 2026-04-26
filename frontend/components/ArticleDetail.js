import articles from "./articles-data.js";

export default function ArticleDetail(slug) {
  const el = document.createElement("div");
  el.className = "container";

  const article = articles.find(a => a.slug === slug);

  if (!article) {
    el.innerHTML = `<p style="padding:40px 0;color:#666;">Статья не найдена.</p>`;
    return el;
  }

  el.innerHTML = `
    <div class="article-detail fade-in">
      <a href="/articles" data-link class="article-back">← Все статьи</a>
      <h2 class="article-detail-title">${article.title}</h2>
      <img src="${article.image}" alt="${article.title}" class="article-detail-img">
      <div class="article-detail-body">${article.body}</div>
    </div>
  `;

  return el;
}
