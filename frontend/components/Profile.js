import { isLoggedIn, getCurrentUser, clearAuth, authFetch, setAuth } from "../auth.js";
import { router } from "../router.js";

const API = "http://localhost:3001";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function initials(name, email) {
  const src = (name || "").trim() || (email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function greeting(user) {
  const firstName = (user?.name || "").trim().split(/\s+/)[0];
  return firstName ? `Здравствуйте, ${firstName}!` : "Здравствуйте!";
}

const ICON_USER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>`;
const ICON_CART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>`;
const ICON_LOGOUT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h12"/></svg>`;

function openChangePasswordModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" title="Закрыть">×</button>
      <div class="modal-body">
        <h3 class="modal-title">Смена пароля</h3>
        <p class="modal-subtitle">Введите новый пароль</p>
        <div class="modal-field">
          <label>Новый пароль</label>
          <input type="password" id="cp-new" placeholder="Минимум 6 символов" autocomplete="new-password">
          <span class="field-error"></span>
        </div>
        <div class="modal-field">
          <label>Повторите пароль</label>
          <input type="password" id="cp-confirm" placeholder="Повторите пароль" autocomplete="new-password">
          <span class="field-error"></span>
        </div>
        <div class="auth-server-error" id="cp-error"></div>
        <button class="btn btn-full" id="cp-submit" style="margin-top:8px">Сохранить пароль</button>
      </div>
      <div class="modal-success" hidden>
        <div class="cart-success-check">✓</div>
        <h2 style="margin-top:16px;color:#009d3e">Пароль изменён</h2>
      </div>
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

  const newEl     = overlay.querySelector("#cp-new");
  const confirmEl = overlay.querySelector("#cp-confirm");
  const errDiv    = overlay.querySelector("#cp-error");
  const [nSpan, cSpan] = overlay.querySelectorAll(".field-error");

  function setErr(input, span, msg) {
    input.classList.add("input-error");
    span.textContent = msg;
    span.classList.add("visible");
    input.addEventListener("input", () => {
      input.classList.remove("input-error");
      span.classList.remove("visible");
    }, { once: true });
  }

  overlay.querySelector("#cp-submit").addEventListener("click", async () => {
    errDiv.textContent = "";
    let valid = true;
    if (newEl.value.length < 6) { setErr(newEl, nSpan, "Минимум 6 символов"); valid = false; }
    if (confirmEl.value !== newEl.value) { setErr(confirmEl, cSpan, "Пароли не совпадают"); valid = false; }
    if (!valid) return;

    const btn = overlay.querySelector("#cp-submit");
    btn.disabled = true;
    try {
      const res = await authFetch(`http://localhost:3001/auth/change-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword: newEl.value }),
      });
      const data = await res.json();
      if (!res.ok) { errDiv.textContent = data.error || "Ошибка"; btn.disabled = false; return; }
      overlay.querySelector(".modal-body").hidden = true;
      overlay.querySelector(".modal-success").hidden = false;
      setTimeout(close, 1500);
    } catch {
      errDiv.textContent = "Сервер недоступен";
      btn.disabled = false;
    }
  });
}

export default function Profile() {
  const el = document.createElement("div");
  el.className = "container";

  if (!isLoggedIn()) {
    router.navigate("/auth");
    return el;
  }

  const user = getCurrentUser();

  el.innerHTML = `
    <div class="profile-hero fade-in">
      <div class="profile-avatar">${initials(user?.name, user?.email)}</div>
      <div class="profile-hero-info">
        <h2 class="profile-greeting">${greeting(user)}</h2>
        <p class="profile-email">${user?.email || ""}</p>
      </div>
      <button class="btn-logout" id="logout-btn">
        <span class="btn-logout-icon">${ICON_LOGOUT}</span>
        <span>Выйти</span>
      </button>
    </div>

    <div class="profile-sections fade-in">
      <!-- Личные данные -->
      <section class="profile-section profile-section--full">
        <div class="profile-section-head">
          <span class="profile-section-icon">${ICON_USER}</span>
          <h3 class="profile-section-title">Личные данные</h3>
        </div>
        <form id="profile-form" novalidate>
          <div class="profile-grid">
            <div class="modal-field">
              <label>Имя</label>
              <input type="text" id="pf-name" placeholder="Иван Иванов" value="${user?.name || ""}">
              <span class="field-error"></span>
            </div>
            <div class="modal-field">
              <label>Телефон</label>
              <input type="tel" id="pf-phone" placeholder="+7 (___) ___-__-__" value="${user?.phone || ""}">
              <span class="field-error"></span>
            </div>
            <div class="modal-field">
              <label>Email</label>
              <input type="email" value="${user?.email || ""}" disabled>
            </div>
            <div class="modal-field">
              <label>Регион</label>
              <input type="text" id="pf-region" placeholder="Орловская область" value="${user?.region || ""}">
              <span class="field-error"></span>
            </div>
            <div class="modal-field" style="grid-column:1/-1">
              <label>Адрес</label>
              <input type="text" id="pf-address" placeholder="Улица, дом" value="${user?.address || ""}">
              <span class="field-error"></span>
            </div>
          </div>
          <div class="auth-server-error" id="pf-error"></div>
          <div class="auth-server-error auth-server-success" id="pf-success"></div>
          <div class="profile-actions">
            <button type="submit" class="btn" id="pf-save">Сохранить</button>
            <button type="button" class="btn btn-secondary" id="pf-change-password">Сменить пароль</button>
          </div>
        </form>
      </section>

      <!-- История заказов -->
      <section class="profile-section profile-section--full">
        <div class="profile-section-head">
          <span class="profile-section-icon">${ICON_CART}</span>
          <h3 class="profile-section-title">История заказов</h3>
          <span class="profile-section-count" id="orders-count" hidden>0</span>
        </div>
        <div id="orders-list"><p class="profile-empty">Загрузка...</p></div>
      </section>
    </div>
  `;

  // Выход
  el.querySelector("#logout-btn").addEventListener("click", () => {
    clearAuth();
    router.navigate("/");
  });

  // Форматирование телефона на ввод (как в Cart)
  const phoneInput = el.querySelector("#pf-phone");
  const phoneErr = phoneInput.parentElement.querySelector(".field-error");

  function formatPhoneFromValue(val) {
    let d = (val || "").replace(/\D/g, "");
    if (d[0] === "7" || d[0] === "8") d = d.slice(1);
    d = d.slice(0, 10);
    if (!d.length) return "";
    let f = "+7";
    if (d.length > 0) f += " (" + d.slice(0, 3);
    if (d.length >= 3) f += ") " + d.slice(3, 6);
    if (d.length >= 6) f += "-" + d.slice(6, 8);
    if (d.length >= 8) f += "-" + d.slice(8, 10);
    return f;
  }

  // Предзаполнение в едином формате
  if (phoneInput.value) phoneInput.value = formatPhoneFromValue(phoneInput.value);

  phoneInput.addEventListener("input", () => {
    phoneInput.classList.remove("input-error");
    phoneErr.classList.remove("visible");
    phoneInput.value = formatPhoneFromValue(phoneInput.value);
  });

  // Сохранение профиля
  el.querySelector("#profile-form").addEventListener("submit", async e => {
    e.preventDefault();
    const errDiv = el.querySelector("#pf-error");
    const okDiv  = el.querySelector("#pf-success");
    errDiv.textContent = "";
    okDiv.textContent = "";

    // Валидация телефона: либо пусто, либо 10 цифр
    const phoneDigits = phoneInput.value.replace(/\D/g, "").replace(/^7/, "");
    if (phoneInput.value.trim() && phoneDigits.length < 10) {
      phoneInput.classList.add("input-error");
      phoneErr.textContent = "Введите полный номер телефона";
      phoneErr.classList.add("visible");
      return;
    }

    const btn = el.querySelector("#pf-save");
    btn.disabled = true;
    try {
      const res = await authFetch(`${API}/auth/me`, {
        method: "PATCH",
        body: JSON.stringify({
          name:    el.querySelector("#pf-name").value.trim(),
          phone:   phoneInput.value.trim(),
          region:  el.querySelector("#pf-region").value.trim(),
          address: el.querySelector("#pf-address").value.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { errDiv.textContent = data.error || "Ошибка сохранения"; return; }
      setAuth(localStorage.getItem("agro_token"), data.user);
      okDiv.textContent = "Данные сохранены";
      // Обновим аватар и приветствие, если изменилось имя
      el.querySelector(".profile-avatar").textContent = initials(data.user?.name, data.user?.email);
      el.querySelector(".profile-greeting").textContent = greeting(data.user);
    } catch {
      errDiv.textContent = "Сервер недоступен";
    } finally {
      btn.disabled = false;
    }
  });

  // Смена пароля
  el.querySelector("#pf-change-password").addEventListener("click", openChangePasswordModal);

  // Загрузка заказов
  authFetch(`${API}/orders`).then(r => r.json()).then(data => {
    const container = el.querySelector("#orders-list");
    const count = el.querySelector("#orders-count");
    if (!data.orders?.length) {
      container.innerHTML = `<p class="profile-empty">Заказов пока нет</p>`;
      return;
    }
    count.textContent = data.orders.length;
    count.hidden = false;
    container.innerHTML = data.orders.map(o => `
      <div class="order-card">
        <div class="order-card-header">
          <span class="order-date">${formatDate(o.created_at)}</span>
          <span class="order-total">${o.total} ₽</span>
        </div>
        <ul class="order-items">
          ${o.items.map(i => `<li><span class="order-item-name">${i.name}</span><span class="order-item-qty">${i.qty} кг</span></li>`).join("")}
        </ul>
      </div>
    `).join("");
  }).catch(() => {
    el.querySelector("#orders-list").innerHTML = `<p class="profile-empty">Не удалось загрузить заказы</p>`;
  });

  return el;
}
