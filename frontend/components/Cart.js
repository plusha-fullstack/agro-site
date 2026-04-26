import { store } from "../store.js";
import { isLoggedIn, getCurrentUser, authFetch } from "../auth.js";
import { router } from "../router.js";

const API = "http://localhost:3001";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function setFieldError(input, errorEl, message) {
  input.classList.add("input-error");
  errorEl.textContent = message;
  errorEl.classList.add("visible");
}

function clearFieldError(input, errorEl) {
  input.classList.remove("input-error");
  errorEl.classList.remove("visible");
}

function openOrderModal(onSuccess) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" title="Закрыть">×</button>
      <h3 class="modal-title">Оформление заказа</h3>
      <p class="modal-subtitle">Заполните поля — наш специалист свяжется с вами</p>
      <div class="modal-field">
        <label>Имя</label>
        <input type="text" id="order-name" placeholder="Иван Иванов" autocomplete="name">
        <span class="field-error"></span>
      </div>
      <div class="modal-field">
        <label>Email</label>
        <input type="email" id="order-email" placeholder="example@mail.ru" autocomplete="email">
        <span class="field-error"></span>
      </div>
      <div class="modal-field">
        <label>Телефон</label>
        <input type="tel" id="order-phone" placeholder="+7 (___) ___-__-__" autocomplete="tel">
        <span class="field-error"></span>
      </div>
      <button class="btn btn-full" id="order-submit" style="margin-top:8px">Оформить заказ</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("modal-visible"));

  function close() {
    overlay.classList.remove("modal-visible");
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
  }

  overlay.querySelector(".modal-close").addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

  const nameInput  = overlay.querySelector("#order-name");
  const emailInput = overlay.querySelector("#order-email");
  const phoneInput = overlay.querySelector("#order-phone");

  // Предзаполнение из профиля
  const user = getCurrentUser();
  if (user) {
    if (user.name)  nameInput.value  = user.name;
    if (user.email) emailInput.value = user.email;
    if (user.phone) phoneInput.value = user.phone;
  }
  const [nameErr, emailErr, phoneErr] = overlay.querySelectorAll(".field-error");

  // Сброс ошибки при вводе
  nameInput.addEventListener("input",  () => clearFieldError(nameInput, nameErr));
  emailInput.addEventListener("input", () => clearFieldError(emailInput, emailErr));
  phoneInput.addEventListener("input", () => {
    clearFieldError(phoneInput, phoneErr);
    let d = phoneInput.value.replace(/\D/g, "");
    if (d[0] === "7" || d[0] === "8") d = d.slice(1);
    d = d.slice(0, 10);
    let f = "+7";
    if (d.length > 0) f += " (" + d.slice(0, 3);
    if (d.length >= 3) f += ") " + d.slice(3, 6);
    if (d.length >= 6) f += "-" + d.slice(6, 8);
    if (d.length >= 8) f += "-" + d.slice(8, 10);
    phoneInput.value = d.length ? f : "";
  });

  overlay.querySelector("#order-submit").addEventListener("click", () => {
    const phoneDigits = phoneInput.value.replace(/\D/g, "").replace(/^7/, "");
    let valid = true;

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, nameErr, "Введите ваше имя");
      valid = false;
    }
    if (!EMAIL_RE.test(emailInput.value.trim())) {
      setFieldError(emailInput, emailErr, "Введите корректный email, например: ivan@mail.ru");
      valid = false;
    }
    if (phoneDigits.length < 10) {
      setFieldError(phoneInput, phoneErr, "Введите полный номер телефона");
      valid = false;
    }

    if (!valid) return;
    close();
    onSuccess();
  });
}

export default function Cart() {
  const div = document.createElement("div");
  div.className = "container";

  function showSuccess() {
    div.innerHTML = `
      <div class="cart-success-screen fade-in">
        <div class="cart-success-check">✓</div>
        <h2>Спасибо за заказ!</h2>
      </div>
    `;
    div.querySelectorAll(".fade-in").forEach(el => el.classList.add("visible"));
    setTimeout(() => render(), 2000);
  }

  function render() {
    const items = store.get();

    if (items.length === 0) {
      div.innerHTML = `
        <h2 class="section-title fade-in">Корзина заказов</h2>
        <p class="cart-empty fade-in">Корзина пуста. Перейдите в <a href="/products" data-link>Товары</a>, чтобы добавить продукцию.</p>
      `;
      div.querySelectorAll(".fade-in").forEach(el => el.classList.add("visible"));
      return;
    }

    const total    = items.reduce((s, i) => s + parseInt(i.price) * i.qty, 0);
    const totalQty = items.reduce((s, i) => s + i.qty, 0);

    div.innerHTML = `
      <h2 class="section-title fade-in">Корзина заказов</h2>
      <p class="cart-subtitle fade-in">Оформите заказ на нашу продукцию</p>

      <div class="cart-items-list fade-in">
        ${items.map(item => `
          <div class="cart-item-card" data-name="${item.name}">
            <img class="cart-item-img" src="${item.photo}" alt="${item.name}">
            <div class="cart-item-info">
              <span class="cart-item-name">${item.name}</span>
              <span class="cart-item-price-per">${item.price}</span>
            </div>
            <div class="cart-item-controls">
              <button class="cart-item-btn cart-item-minus">−</button>
              <span class="cart-item-qty">${item.qty}</span>
              <button class="cart-item-btn cart-item-plus">+</button>
            </div>
            <span class="cart-item-total">${parseInt(item.price) * item.qty} ₽</span>
            <button class="cart-item-delete" title="Удалить">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        `).join("")}
      </div>

      <div class="cart-summary fade-in">
        <h3 class="cart-summary-title">Итого к оплате</h3>
        <div class="cart-summary-row">
          <span class="cart-summary-count">Товаров: ${totalQty} шт.</span>
          <span class="cart-summary-total">${total} ₽</span>
        </div>
        <button class="btn btn-full cart-checkout">✓&nbsp; Оформить заказ</button>
      </div>
    `;

    div.querySelectorAll(".fade-in").forEach(el => el.classList.add("visible"));

    div.querySelectorAll(".cart-item-card").forEach(card => {
      const name = card.dataset.name;
      const item = store.get().find(i => i.name === name);

      card.querySelector(".cart-item-minus").addEventListener("click", () => {
        const newQty = item.qty - 1;
        if (newQty < 1) store.remove(name);
        else store.add(item, newQty);
        render();
      });

      card.querySelector(".cart-item-plus").addEventListener("click", () => {
        store.add(item, Math.min(item.qty + 1, 100));
        render();
      });

      card.querySelector(".cart-item-delete").addEventListener("click", () => {
        store.remove(name);
        render();
      });
    });

    div.querySelector(".cart-checkout").addEventListener("click", () => {
      if (!isLoggedIn()) {
        router.navigate("/auth");
        return;
      }
      const cartItems = store.get().map(i => ({ name: i.name, qty: i.qty, price: i.price }));
      const total = cartItems.reduce((s, i) => s + parseInt(i.price) * i.qty, 0);
      openOrderModal(() => {
        authFetch(`${API}/orders`, {
          method: "POST",
          body: JSON.stringify({ items: cartItems, total }),
        }).catch(() => {});
        store.clear();
        showSuccess();
      });
    });
  }

  render();
  return div;
}
