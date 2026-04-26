import { isLoggedIn, getCurrentUser } from "../auth.js";

export default function Header() {
  const header = document.createElement("header");
  header.className = "header";

  const currentPath = location.pathname;

  const links = [
    { href: "/", icon: '<img src="/images/chat.png" class="nav-img" alt="">', label: "О нас" },
    { href: "/articles", icon: "📰", label: "Статьи" },
    { href: "/team", icon: '<img src="/images/gardening.png" class="nav-img" alt="">', label: "Команда" },
    { href: "/products", icon: '<img src="/images/vegetable.png" class="nav-img" alt="">', label: "Товары" },
    { href: "/cart", icon: '<img src="/images/cart.png" class="nav-img" alt="">', label: "Корзина" },
    { href: "/agronom", icon: '<img src="/images/bot.png" class="nav-img" alt="">', label: "AI-Агроном" },
    isLoggedIn()
      ? { href: "/profile", icon: "👤", label: getCurrentUser()?.name?.split(" ")[0] || "Кабинет" }
      : { href: "/auth", icon: "🚪", label: "Войти" },
  ];

  header.innerHTML = `
    <div class="top-bar">
      <div class="top-bar-inner">
        <div class="top-bar-left">
          <span class="top-bar-brand"><img src="/images/farm.png" class="top-bar-brand-img" alt=""> КФХ Чуряева Лариса Николаевна</span>
          <span class="top-bar-info">с. Собурово • Качество с 2015 года</span>
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
