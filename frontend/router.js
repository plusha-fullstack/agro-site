import Header from "./components/Header.js";
import Home from "./components/Home.js";
import Team from "./components/Team.js";
import Products from "./components/Products.js";
import Cart from "./components/Cart.js";
import Agronom from "./components/Agronom.js";
import Footer from "./components/Footer.js";

const routes = {
  "/": Home,
  "/team": Team,
  "/products": Products,
  "/cart": Cart,
  "/agronom": Agronom,
};

export const router = {
  load() {
    this.render(location.pathname);
  },
  init() {
    window.onpopstate = () => this.render(location.pathname);
    document.body.addEventListener("click", e => {
      const link = e.target.closest("a[data-link]");
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute("href"));
      }
    });
  },
  navigate(path) {
    history.pushState(null, null, path);
    this.render(path);
  },
  render(path) {
    const app = document.getElementById("app");
    app.innerHTML = "";
    const header = Header();
    app.appendChild(header);
    const page = routes[path] ? routes[path]() : Home();
    app.appendChild(page);
    app.appendChild(Footer());

    // Запуск анимаций
    const elements = document.querySelectorAll(".fade-in");
    elements.forEach(el => el.classList.add("visible"));
  }
};
