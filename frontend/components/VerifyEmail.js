import { router } from "../router.js";

const API = "http://localhost:3001";

export default function VerifyEmail() {
  const el = document.createElement("div");
  el.className = "container";
  el.innerHTML = `
    <h2 class="section-title fade-in">Подтверждение email</h2>
    <div class="auth-card fade-in" style="text-align:center">
      <p id="verify-status">Проверяем ссылку…</p>
    </div>
  `;

  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const status = el.querySelector("#verify-status");

  if (!token) {
    status.textContent = "Ссылка некорректна.";
    return el;
  }

  fetch(`${API}/auth/verify?token=${encodeURIComponent(token)}`)
    .then(async r => {
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        status.innerHTML = `<span style="color:#009d3e;font-size:1.1rem">✓ Email подтверждён.</span><br><br>Сейчас перенесём на вход…`;
        setTimeout(() => router.navigate("/auth?verified=1"), 1500);
      } else {
        status.innerHTML = `<span style="color:#e05555">${data.error || "Ссылка недействительна."}</span><br><br><a href="/auth" data-link style="color:#009d3e">Вернуться на страницу входа</a>`;
      }
    })
    .catch(() => {
      status.textContent = "Сервер недоступен. Попробуйте позже.";
    });

  return el;
}
