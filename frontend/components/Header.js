export default function Header() {
  const header = document.createElement("header");
  header.className = "header";

  const currentPath = location.pathname;

  const links = [
    { href: "/", icon: "⌂", label: "О нас" },
    { href: "/team", icon: "👥", label: "Команда" },
    { href: "/products", icon: "🧺", label: "Товары" },
    { href: "/cart", icon: "🛒", label: "Корзина" },
    { href: "/agronom", icon: "🤖", label: "AI-Агроном" },
  ];

  header.innerHTML = `
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="top-bar-left">
          <span class="top-bar-brand">🌱 КФХ Чуряева Лариса Николаевна</span>
          <span class="top-bar-info">с. Собурово • Качество с 2015 года</span>
        </div>
        <div class="top-bar-right">
          <a href="/cart" data-link class="top-bar-cart">🛒</a>
        </div>
      </div>
    </div>
    <nav class="nav-bar">
      <div class="nav-bar-inner">
        <button class="burger-btn" aria-label="Меню">☰</button>
        ${links.map(l => `
          <a href="${l.href}" data-link class="nav-link${currentPath === l.href ? " active" : ""}">
            <span class="nav-icon">${l.icon}</span> ${l.label}
          </a>
        `).join("")}
      </div>
    </nav>
  `;

  const navInner = header.querySelector(".nav-bar-inner");
  const burger = header.querySelector(".burger-btn");

  burger.addEventListener("click", () => {
    navInner.classList.toggle("nav-open");
    burger.textContent = navInner.classList.contains("nav-open") ? "✕" : "☰";
  });

  header.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navInner.classList.remove("nav-open");
      burger.textContent = "☰";
    });
  });

  return header;
}
