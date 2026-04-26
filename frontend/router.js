import Header from "./components/Header.js";
import Home from "./components/Home.js";
import Team from "./components/Team.js";
import Products from "./components/Products.js";
import Cart from "./components/Cart.js";
import Agronom from "./components/Agronom.js";
import Articles from "./components/Articles.js";
import ArticleDetail from "./components/ArticleDetail.js";
import TeamMember from "./components/TeamMember.js";
import ProductDetail from "./components/ProductDetail.js";
import Footer from "./components/Footer.js";
import Auth from "./components/Auth.js";
import Profile from "./components/Profile.js";
import VerifyEmail from "./components/VerifyEmail.js";

const routes = {
  "/": Home,
  "/team": Team,
  "/products": Products,
  "/cart": Cart,
  "/agronom": Agronom,
  "/articles": Articles,
  "/auth": Auth,
  "/profile": Profile,
  "/verify-email": VerifyEmail,
};

const dynamicRoutes = [
  { pattern: /^\/team\/(.+)$/, component: (slug) => TeamMember(slug) },
  { pattern: /^\/product\/(.+)$/, component: (slug) => ProductDetail(slug) },
  { pattern: /^\/articles\/(.+)$/, component: (slug) => ArticleDetail(slug) },
];

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
    app.appendChild(Header());

    let page;
    if (routes[path]) {
      page = routes[path]();
    } else {
      let matched = false;
      for (const r of dynamicRoutes) {
        const m = r.pattern.exec(path);
        if (m) {
          page = r.component(m[1]);
          matched = true;
          break;
        }
      }
      if (!matched) page = Home();
    }

    app.appendChild(page);
    app.appendChild(Footer());

    document.querySelectorAll(".fade-in").forEach(el => el.classList.add("visible"));
  }
};
