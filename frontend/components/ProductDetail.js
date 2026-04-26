const products = {
  currant: {
    name: "Черная смородина",
    tag: "Ягоды",
    photo: "/images/currant.jpg",
    price: "250 ₽/кг",
    priceNum: 250,
    desc: "Свежая ароматная ягода, богатая витамином С. Идеальна для варенья и компотов.",
    taste: "Кисло-сладкий, насыщенный, с лёгкой терпкостью. Ягоды сочные, с тонкой кожицей и ярким ароматом.",
    season: "Июль — август",
    storage: "3–5 дней в свежем виде в холодильнике. До 12 месяцев в замороженном виде без потери полезных свойств.",
    benefits: "Рекордное содержание витамина C — более 200 мг на 100 г. Богата антиоксидантами, калием, железом и витаминами группы B. Укрепляет иммунитет, улучшает зрение.",
    size: "Крупная ягода диаметром 10–14 мм, вес одной ягоды 2–3 г.",
  },
  antonovka: {
    name: "Яблоки «Антоновка»",
    tag: "Фрукты",
    photo: "/images/antonovka.jpg",
    price: "120 ₽/кг",
    priceNum: 120,
    desc: "Классический сорт с кисло-сладким вкусом. Отлично хранится всю зиму.",
    taste: "Кисло-сладкий классический вкус с выраженной кислинкой. Мякоть плотная, сочная, с пряным ароматом.",
    season: "Сентябрь — октябрь",
    storage: "До 4–6 месяцев в прохладном тёмном месте при +2…+4 °C. Один из самых лёжких осенних сортов.",
    benefits: "Богаты пектином, органическими кислотами, витаминами C и P. Улучшают пищеварение, нормализуют уровень холестерина.",
    size: "Крупные плоды, средний вес 150–250 г, диаметр 7–9 см. Кожица жёлто-зелёная.",
  },
  "white-apple": {
    name: "Яблоки «Белый налив»",
    tag: "Фрукты",
    photo: "/images/white-apple.jpg",
    price: "100 ₽/кг",
    priceNum: 100,
    desc: "Ранний летний сорт с нежной мякотью и сладким вкусом.",
    taste: "Нежно-сладкий с лёгкой кислинкой. Мякоть рыхлая, очень сочная, тает во рту. Тонкий приятный аромат.",
    season: "Июль",
    storage: "2–3 недели в прохладном месте. Ранний сорт, не предназначен для длительного хранения — лучше употреблять свежим.",
    benefits: "Богаты витамином C, железом и клетчаткой. Легко усваиваются, подходят для детского и диетического питания.",
    size: "Средние плоды, вес 80–130 г. Кожица зеленовато-белая с мраморным румянцем.",
  },
};

const infoItems = [
  { key: "taste",    icon: "🍃", label: "Вкус" },
  { key: "season",   icon: "📅", label: "Сезон сбора" },
  { key: "storage",  icon: "❄️", label: "Хранение" },
  { key: "benefits", icon: "💚", label: "Полезные свойства" },
  { key: "size",     icon: "📏", label: "Размер" },
];

export default function ProductDetail(slug) {
  const product = products[slug];
  const el = document.createElement("div");
  el.className = "container";

  if (!product) {
    el.innerHTML = `
      <p style="color:#888;margin-bottom:16px">Товар не найден.</p>
      <a data-link href="/products" class="btn" style="display:inline-block">← Все товары</a>
    `;
    return el;
  }

  el.innerHTML = `
    <a data-link href="/products" class="back-link fade-in">← Все товары</a>
    <div class="product-detail fade-in">
      <div class="product-detail-left">
        <div class="product-detail-img-wrap">
          <img class="product-detail-img" src="${product.photo}" alt="${product.name}">
        </div>
      </div>
      <div class="product-detail-right">
        <span class="tag">${product.tag}</span>
        <h2 class="product-detail-name">${product.name}</h2>
        <p class="product-detail-desc">${product.desc}</p>
        <div class="product-detail-info">
          ${infoItems.map(it => `
            <div class="product-info-row">
              <span class="product-info-icon">${it.icon}</span>
              <div>
                <div class="product-info-label">${it.label}</div>
                <div class="product-info-value">${product[it.key]}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  return el;
}
