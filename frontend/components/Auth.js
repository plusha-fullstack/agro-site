import { setAuth } from "../auth.js";
import { router } from "../router.js";

const API = "http://localhost:3001";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export default function Auth() {
  const el = document.createElement("div");
  el.className = "container";

  const verifiedNotice = new URLSearchParams(location.search).get("verified") === "1"
    ? `<div class="auth-server-success" style="text-align:center;margin-bottom:16px">✓ Email подтверждён. Войдите.</div>`
    : "";

  el.innerHTML = `
    <h2 class="section-title fade-in">Личный кабинет</h2>
    <div class="auth-card fade-in">
      ${verifiedNotice}
      <div class="auth-tabs">
        <button class="auth-tab auth-tab--active" data-tab="login">Войти</button>
        <button class="auth-tab" data-tab="register">Зарегистрироваться</button>
      </div>

      <form class="auth-form" id="auth-form-login" novalidate>
        <div class="modal-field">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="example@mail.ru" autocomplete="email">
          <span class="field-error"></span>
        </div>
        <div class="modal-field">
          <label>Пароль</label>
          <input type="password" id="login-password" placeholder="Ваш пароль" autocomplete="current-password">
          <span class="field-error"></span>
        </div>
        <div class="auth-server-error" id="login-error"></div>
        <button type="submit" class="btn btn-full">Войти</button>
        <div style="text-align:center;margin-top:12px">
          <a href="#" id="forgot-link" style="color:#009d3e;font-size:0.9rem">Забыли пароль?</a>
        </div>
      </form>

      <form class="auth-form auth-form--hidden" id="auth-form-register" novalidate>
        <div class="modal-field">
          <label>Email</label>
          <input type="email" id="reg-email" placeholder="example@mail.ru" autocomplete="email">
          <span class="field-error"></span>
        </div>
        <div class="modal-field">
          <label>Пароль</label>
          <input type="password" id="reg-password" placeholder="Минимум 6 символов" autocomplete="new-password">
          <span class="field-error"></span>
        </div>
        <div class="modal-field">
          <label>Повторите пароль</label>
          <input type="password" id="reg-confirm" placeholder="Повторите пароль" autocomplete="new-password">
          <span class="field-error"></span>
        </div>
        <div class="auth-server-error" id="reg-error"></div>
        <button type="submit" class="btn btn-full">Зарегистрироваться</button>
      </form>

      <form class="auth-form auth-form--hidden" id="auth-form-forgot" novalidate>
        <p style="margin-bottom:12px;color:#555;font-size:0.9rem">Введите email — пришлём новый пароль на почту.</p>
        <div class="modal-field">
          <label>Email</label>
          <input type="email" id="forgot-email" placeholder="example@mail.ru" autocomplete="email">
          <span class="field-error"></span>
        </div>
        <div class="auth-server-error" id="forgot-error"></div>
        <div class="auth-server-success" id="forgot-success" style="margin-bottom:8px"></div>
        <button type="submit" class="btn btn-full">Отправить новый пароль</button>
        <div style="text-align:center;margin-top:12px">
          <a href="#" id="back-to-login" style="color:#009d3e;font-size:0.9rem">← Вернуться ко входу</a>
        </div>
      </form>

      <div class="auth-form auth-form--hidden" id="auth-pending">
        <div style="text-align:center;padding:8px 0">
          <div style="font-size:2.2rem;margin-bottom:8px">📬</div>
          <h3 style="margin-bottom:8px;color:#009d3e">Проверьте почту</h3>
          <p id="pending-text" style="color:#555;font-size:0.95rem"></p>
          <p style="color:#888;font-size:0.85rem;margin-top:12px">Не пришло письмо? Проверьте папку «Спам».</p>
          <button type="button" class="btn" id="pending-back" style="margin-top:16px">Назад</button>
        </div>
      </div>
    </div>
  `;

  // Табы и формы
  const tabs = el.querySelectorAll(".auth-tab");
  const formLogin   = el.querySelector("#auth-form-login");
  const formReg     = el.querySelector("#auth-form-register");
  const formForgot  = el.querySelector("#auth-form-forgot");
  const pendingBox  = el.querySelector("#auth-pending");

  function showOnly(node) {
    [formLogin, formReg, formForgot, pendingBox].forEach(f => f.classList.add("auth-form--hidden"));
    node.classList.remove("auth-form--hidden");
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("auth-tab--active"));
      tab.classList.add("auth-tab--active");
      showOnly(tab.dataset.tab === "login" ? formLogin : formReg);
    });
  });

  el.querySelector("#forgot-link").addEventListener("click", e => {
    e.preventDefault();
    showOnly(formForgot);
  });
  el.querySelector("#back-to-login").addEventListener("click", e => {
    e.preventDefault();
    tabs[0].click();
  });
  el.querySelector("#pending-back").addEventListener("click", () => {
    tabs[0].click();
  });

  function setError(input, span, msg) {
    input.classList.add("input-error");
    span.textContent = msg;
    span.classList.add("visible");
    input.addEventListener("input", () => {
      input.classList.remove("input-error");
      span.classList.remove("visible");
    }, { once: true });
  }

  // ─── Логин ───
  formLogin.addEventListener("submit", async e => {
    e.preventDefault();
    const emailEl = el.querySelector("#login-email");
    const passEl  = el.querySelector("#login-password");
    const errDiv  = el.querySelector("#login-error");
    const [eSpan, pSpan] = formLogin.querySelectorAll(".field-error");
    let valid = true;
    errDiv.innerHTML = "";

    if (!EMAIL_RE.test(emailEl.value.trim())) { setError(emailEl, eSpan, "Некорректный email"); valid = false; }
    if (!passEl.value) { setError(passEl, pSpan, "Введите пароль"); valid = false; }
    if (!valid) return;

    const btn = formLogin.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEl.value.trim(), password: passEl.value }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.token, data.user);
        router.navigate("/profile");
        return;
      }
      if (data.code === "EMAIL_NOT_VERIFIED") {
        const resendEmail = emailEl.value.trim();
        const resendPass = passEl.value;
        errDiv.innerHTML = `${data.error} <a href="#" id="resend-verify" style="color:#009d3e">Отправить письмо повторно</a>`;
        errDiv.querySelector("#resend-verify").addEventListener("click", async ev => {
          ev.preventDefault();
          try {
            const r2 = await fetch(`${API}/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: resendEmail, password: resendPass }),
            });
            const d2 = await r2.json();
            if (r2.ok) {
              el.querySelector("#pending-text").textContent = d2.message || `Письмо отправлено на ${resendEmail}`;
              showOnly(pendingBox);
            } else {
              errDiv.textContent = d2.error || "Не удалось отправить письмо";
            }
          } catch {
            errDiv.textContent = "Сервер недоступен";
          }
        });
        return;
      }
      errDiv.textContent = data.error || "Ошибка входа";
    } catch {
      errDiv.textContent = "Сервер недоступен";
    } finally {
      btn.disabled = false;
    }
  });

  // ─── Регистрация ───
  formReg.addEventListener("submit", async e => {
    e.preventDefault();
    const emailEl   = el.querySelector("#reg-email");
    const passEl    = el.querySelector("#reg-password");
    const confirmEl = el.querySelector("#reg-confirm");
    const errDiv    = el.querySelector("#reg-error");
    const [eSpan, pSpan, cSpan] = formReg.querySelectorAll(".field-error");
    let valid = true;
    errDiv.textContent = "";

    if (!EMAIL_RE.test(emailEl.value.trim())) { setError(emailEl, eSpan, "Некорректный email"); valid = false; }
    if (passEl.value.length < 6) { setError(passEl, pSpan, "Минимум 6 символов"); valid = false; }
    if (confirmEl.value !== passEl.value) { setError(confirmEl, cSpan, "Пароли не совпадают"); valid = false; }
    if (!valid) return;

    const btn = formReg.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEl.value.trim(), password: passEl.value }),
      });
      const data = await res.json();
      if (!res.ok) { errDiv.textContent = data.error || "Ошибка регистрации"; return; }
      el.querySelector("#pending-text").textContent = data.message || `Письмо отправлено на ${emailEl.value.trim()}`;
      showOnly(pendingBox);
    } catch {
      errDiv.textContent = "Сервер недоступен";
    } finally {
      btn.disabled = false;
    }
  });

  // ─── Забыли пароль ───
  formForgot.addEventListener("submit", async e => {
    e.preventDefault();
    const emailEl = el.querySelector("#forgot-email");
    const errDiv  = el.querySelector("#forgot-error");
    const okDiv   = el.querySelector("#forgot-success");
    const [eSpan] = formForgot.querySelectorAll(".field-error");
    errDiv.textContent = "";
    okDiv.textContent = "";

    if (!EMAIL_RE.test(emailEl.value.trim())) { setError(emailEl, eSpan, "Некорректный email"); return; }

    const btn = formForgot.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEl.value.trim() }),
      });
      if (res.ok) {
        okDiv.textContent = "Если такой email зарегистрирован, мы отправили на него новый пароль.";
        emailEl.value = "";
      } else {
        errDiv.textContent = "Не удалось отправить запрос";
      }
    } catch {
      errDiv.textContent = "Сервер недоступен";
    } finally {
      btn.disabled = false;
    }
  });

  return el;
}
