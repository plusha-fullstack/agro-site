import { store } from "../store.js";

export default function Cart() {
  const div = document.createElement("div");
  div.className = "container";
  const items = store.get();

  if (items.length === 0) {
    div.innerHTML = `
      <h2 class="section-title fade-in">Корзина</h2>
      <p class="cart-empty fade-in">Корзина пуста. Перейдите в <a href="/products" data-link>Товары</a>, чтобы добавить продукцию.</p>
    `;
    return div;
  }

  div.innerHTML = `
    <h2 class="section-title fade-in">Корзина</h2>
    <div class="cart-layout fade-in">
      <div class="cart-items">
        <ul class="cart-list">
          ${items.map(item => {
            const unitPrice = parseInt(item.price);
            return `<li>
              <span>${item.name} × ${item.qty} кг</span>
              <span>${unitPrice * item.qty} ₽</span>
            </li>`;
          }).join("")}
        </ul>
        <div class="cart-total">
          Итого: <strong>${items.reduce((s, i) => s + parseInt(i.price) * i.qty, 0)} ₽</strong>
        </div>
      </div>
      <div class="cart-order">
        <div class="order-form">
          <p class="order-prompt">Чтобы сделать заказ, введите свой номер телефона для связи. Наш специалист по продажам свяжется с вами в течение 10–20 минут.</p>
          <input type="tel" class="order-phone" placeholder="+7 (___) ___-__-__">
          <button class="btn btn-full order-submit" disabled>Сделать заказ</button>
        </div>
        <div class="order-success" style="display:none">
          <div class="order-check">✔</div>
          <p class="order-number">Заказ №<span class="order-id"></span></p>
          <p class="order-thanks">Спасибо, что выбрали нас! Наш специалист скоро свяжется с вами!</p>
        </div>
      </div>
    </div>
  `;

  const phoneInput = div.querySelector(".order-phone");
  const submitBtn = div.querySelector(".order-submit");
  const form = div.querySelector(".order-form");
  const success = div.querySelector(".order-success");

  phoneInput.addEventListener("input", () => {
    // Оставляем только цифры, убираем ведущие 7/8
    let d = phoneInput.value.replace(/\D/g, "");
    if (d[0] === "7" || d[0] === "8") d = d.slice(1);
    d = d.slice(0, 10);

    // Формат: +7 (XXX) XXX-XX-XX
    let f = "+7";
    if (d.length > 0) f += " (" + d.slice(0, 3);
    if (d.length >= 3) f += ") " + d.slice(3, 6);
    if (d.length >= 6) f += "-" + d.slice(6, 8);
    if (d.length >= 8) f += "-" + d.slice(8, 10);
    phoneInput.value = d.length ? f : "";

    submitBtn.disabled = d.length < 10;
  });

  submitBtn.addEventListener("click", () => {
    const orderId = Math.floor(10000 + Math.random() * 90000);
    div.querySelector(".order-id").textContent = orderId;
    form.style.display = "none";
    success.style.display = "";
    store.clear();
  });

  return div;
}
