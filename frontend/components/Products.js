import { store } from "../store.js";
import { showToast } from "../toast.js";

const STEP = 10;   // шаг +/- (оптовые продажи)
const MIN = 1;     // меньше — товар убирается из корзины
const MAX = 1000;  // лимит 1 тонна на товар

function clampQty(value) {
  let v = parseInt(String(value).replace(/\D/g, ""), 10);
  if (isNaN(v)) v = MIN;
  return Math.max(MIN, Math.min(v, MAX));
}

export default function Products() {
  const products = [
    {
      slug: "currant",
      name: "Черная смородина",
      tag: "Ягоды",
      desc: "Свежая ароматная ягода, богатая витамином С. Идеальна для варенья и компотов.",
      price: "250 ₽/кг",
      photo: "./images/currant.jpg",
    },
    {
      slug: "antonovka",
      name: "Яблоки «Антоновка»",
      tag: "Фрукты",
      desc: "Классический сорт с кисло-сладким вкусом. Отлично хранится всю зиму.",
      price: "120 ₽/кг",
      photo: "./images/antonovka.jpg",
    },
    {
      slug: "white-apple",
      name: "Яблоки «Белый налив»",
      tag: "Фрукты",
      desc: "Ранний летний сорт с нежной мякотью и сладким вкусом.",
      price: "100 ₽/кг",
      photo: "./images/white-apple.jpg",
    },
  ];

  const div = document.createElement("div");
  div.className = "container";
  div.innerHTML = `
    <h2 class="section-title fade-in">Наша продукция</h2>
    <p class="subtitle fade-in">Свежие ягоды и фрукты прямо с полей</p>
    <div class="grid product-grid">
      ${products.map((p, i) => `
        <div class="card product-card fade-in">
          <a data-link href="/product/${p.slug}" class="product-top-link">
            <div class="product-img-wrap">
              <img class="product-img" src="${p.photo}" alt="${p.name}">
            </div>
            <div class="product-top-body">
              <h3>${p.name}</h3>
              <span class="tag">${p.tag}</span>
              <p>${p.desc}</p>
            </div>
          </a>
          <div class="product-bottom-body">
            <strong class="price">${p.price}</strong>
            <div class="cart-action" data-index="${i}">
              <button class="btn add-to-cart">В корзину</button>
              <div class="cart-counter" style="display:none">
                <button class="btn cart-minus">−</button>
                <span class="cart-qty-wrap"><input class="cart-qty-input" type="text" inputmode="numeric" value="10"><span class="cart-qty-unit">кг</span></span>
                <button class="btn cart-plus">+</button>
              </div>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  div.querySelectorAll(".cart-action").forEach(wrap => {
    const i = wrap.dataset.index;
    const product = products[i];
    const addBtn = wrap.querySelector(".add-to-cart");
    const counter = wrap.querySelector(".cart-counter");
    const qtyInput = wrap.querySelector(".cart-qty-input");

    function setQty(qty) {
      qtyInput.value = qty;
      store.add(product, qty);
    }

    const inCart = store.get().find(item => item.name === product.name);
    if (inCart) {
      addBtn.style.display = "none";
      counter.style.display = "";
      qtyInput.value = inCart.qty;
    }

    addBtn.addEventListener("click", () => {
      store.add(product, STEP);
      addBtn.style.display = "none";
      counter.style.display = "";
      qtyInput.value = STEP;
      showToast(`${product.name} добавлен в корзину`);
    });

    wrap.querySelector(".cart-plus").addEventListener("click", () => {
      setQty(Math.min(clampQty(qtyInput.value) + STEP, MAX));
    });

    wrap.querySelector(".cart-minus").addEventListener("click", () => {
      const qty = clampQty(qtyInput.value) - STEP;
      if (qty < MIN) {
        store.remove(product.name);
        addBtn.style.display = "";
        counter.style.display = "none";
      } else {
        setQty(qty);
      }
    });

    // Клик по зелёной области (число / кг / карандаш) — фокус и выделение
    wrap.querySelector(".cart-qty-wrap").addEventListener("click", () => {
      qtyInput.focus();
      qtyInput.select();
    });

    // Прямой ввод количества
    qtyInput.addEventListener("input", () => {
      qtyInput.value = qtyInput.value.replace(/\D/g, "").slice(0, 4);
    });
    qtyInput.addEventListener("change", () => setQty(clampQty(qtyInput.value)));
  });

  return div;
}
