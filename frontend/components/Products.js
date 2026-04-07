import { store } from "../store.js";
import { showToast } from "../toast.js";

export default function Products() {
  const products = [
    {
      name: "Черная смородина",
      tag: "Ягоды",
      desc: "Свежая ароматная ягода, богатая витамином С. Идеальна для варенья и компотов.",
      price: "250 ₽/кг",
      photo: "./images/currant.jpg",
    },
    {
      name: "Яблоки «Антоновка»",
      tag: "Фрукты",
      desc: "Классический сорт с кисло-сладким вкусом. Отлично хранится всю зиму.",
      price: "120 ₽/кг",
      photo: "./images/antonovka.jpg",
    },
    {
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
          <div class="product-img-wrap">
            <img class="product-img" src="${p.photo}" alt="${p.name}">
          </div>
          <div class="product-body">
            <h3>${p.name}</h3>
            <span class="tag">${p.tag}</span>
            <p>${p.desc}</p>
            <strong class="price">${p.price}</strong>
            <div class="cart-action" data-index="${i}">
              <button class="btn add-to-cart">В корзину</button>
              <div class="cart-counter" style="display:none">
                <button class="btn cart-minus">−</button>
                <span class="cart-qty-wrap"><span class="cart-qty">1</span> кг</span>
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
    const qtySpan = wrap.querySelector(".cart-qty");

    // Восстановить состояние из store
    const inCart = store.get().find(item => item.name === product.name);
    if (inCart) {
      addBtn.style.display = "none";
      counter.style.display = "";
      qtySpan.textContent = inCart.qty;
    }

    addBtn.addEventListener("click", () => {
      store.add(product, 1);
      addBtn.style.display = "none";
      counter.style.display = "";
      qtySpan.textContent = "1";
      showToast(`${product.name} добавлен в корзину`);
    });

    wrap.querySelector(".cart-plus").addEventListener("click", () => {
      let qty = parseInt(qtySpan.textContent) + 1;
      if (qty > 100) qty = 100;
      qtySpan.textContent = qty;
      store.add(product, qty);
    });

    wrap.querySelector(".cart-minus").addEventListener("click", () => {
      let qty = parseInt(qtySpan.textContent) - 1;
      if (qty < 1) {
        store.remove(product.name);
        addBtn.style.display = "";
        counter.style.display = "none";
      } else {
        qtySpan.textContent = qty;
        store.add(product, qty);
      }
    });
  });

  return div;
}
