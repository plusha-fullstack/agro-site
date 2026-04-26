import articles from "./articles-data.js";

export default function Articles() {
  const el = document.createElement("div");
  el.className = "container";

  el.innerHTML = `
    <h2 class="section-title fade-in">Советы агронома</h2>
    <div class="articles-features fade-in">
      <div class="articles-feature">
        <div class="articles-feature-icon">🌱</div>
        <h3 class="articles-feature-title">Опыт</h3>
        <p class="articles-feature-text">Делимся секретами урожайного сада, накопленными за годы работы в поле</p>
      </div>
      <div class="articles-feature">
        <div class="articles-feature-icon">📋</div>
        <h3 class="articles-feature-title">Советы</h3>
        <p class="articles-feature-text">Агроном регулярно публикует новые материалы по уходу за садом и огородом</p>
      </div>
      <div class="articles-feature">
        <div class="articles-feature-icon">✉️</div>
        <h3 class="articles-feature-title">Вопросы</h3>
        <p class="articles-feature-text">Задавайте вопросы на нашу почту — агроном ответит лично</p>
      </div>
    </div>
    <div class="articles-divider fade-in">
      <span class="articles-divider-label">Читать статьи</span>
    </div>
    <div class="articles-grid">
      ${articles.map(a => `
        <a href="/articles/${a.slug}" data-link class="article-tile fade-in">
          <div class="article-tile-img-wrap">
            <img src="${a.image}" alt="${a.title}" class="article-tile-img">
          </div>
          <p class="article-tile-title">${a.title}</p>
        </a>
      `).join("")}
    </div>
  `;

  return el;
}
