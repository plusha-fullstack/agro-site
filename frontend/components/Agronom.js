import { showToast } from "../toast.js";
import { isLoggedIn, authFetch, getCurrentUser } from "../auth.js";
import { router } from "../router.js";

const API = "http://localhost:3001";

function historyKey() {
  const u = getCurrentUser();
  return u?.id ? `agro_history_${u.id}` : null;
}

function isValidEntry(item) {
  return item && typeof item === "object"
    && typeof item.type === "string"
    && typeof item.title === "string"
    && Array.isArray(item.sections);
}

function loadHistory() {
  const key = historyKey();
  if (!key) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(key)) || [];
    const valid = raw.filter(isValidEntry);
    // Если в localStorage был legacy-формат, перезаписываем уже отфильтрованным
    if (valid.length !== raw.length) localStorage.setItem(key, JSON.stringify(valid));
    return valid;
  } catch {
    return [];
  }
}

function saveHistory(history) {
  const key = historyKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(history));
}

async function syncHistoryFromBackend() {
  if (loadHistory().length) return false;
  try {
    const res = await authFetch(`${API}/agronom-history`);
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.history?.length) return false;
    const items = [];
    for (const row of data.history) {
      try {
        const parsed = JSON.parse(row.answer_json);
        if (!isValidEntry(parsed)) continue;
        items.push({
          ...parsed,
          question: row.question || "",
          imageDataUrl: row.image_data_url || null,
          date: row.created_at,
        });
      } catch { /* пропускаем legacy */ }
    }
    if (!items.length) return false;
    saveHistory(items);
    return true;
  } catch { return false; }
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function typeLabel(type) {
  if (type === "identify") return { text: "📷 Растение", cls: "type-identify" };
  if (type === "qa") return { text: "💬 Вопрос", cls: "type-qa" };
  return { text: "—", cls: "type-other" };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderSections(sections) {
  if (!sections?.length) return "";
  return sections.map(s => `
    <div class="agro-section">
      <div class="agro-section-head"><span class="agro-section-icon">${escapeHtml(s.icon || "•")}</span>${escapeHtml(s.heading || "")}</div>
      <ul class="agro-section-items">
        ${(s.items || []).map(it => `<li>${escapeHtml(it)}</li>`).join("")}
      </ul>
    </div>
  `).join("");
}

export default function Agronom() {
  const el = document.createElement("div");
  el.className = "container";

  if (!isLoggedIn()) {
    el.innerHTML = `
      <h2 class="section-title fade-in">AI-Агроном</h2>
      <div class="auth-card fade-in" style="text-align:center;padding:48px 32px">
        <div style="font-size:3rem;margin-bottom:16px">🌿</div>
        <h3 style="margin-bottom:8px">Только для зарегистрированных пользователей</h3>
        <p class="agronom-hint" style="margin-bottom:24px">Войдите или создайте аккаунт, чтобы получить доступ к AI-помощнику по растениям и истории запросов</p>
        <button class="btn" id="go-login">Войти / Зарегистрироваться</button>
      </div>
    `;
    el.querySelector("#go-login").addEventListener("click", () => router.navigate("/auth"));
    return el;
  }

  el.innerHTML = `
    <h2 class="section-title fade-in">AI-Агроном</h2>
    <p class="subtitle fade-in">Определение растений и ответы на вопросы по агрономии</p>

    <div class="agronom-layout fade-in">
      <div class="agronom-left">
        <h3>📷 Фото растения <span class="field-optional">(необязательно)</span></h3>
        <p class="agronom-hint">Загрузите снимок листа, плода или растения целиком — AI определит вид и расскажет о нём</p>
        <div class="upload-zone" id="upload-zone">
          <div class="upload-icon">⬆</div>
          <p>Нажмите для выбора фото</p>
          <input type="file" id="photo-input" accept="image/*" hidden>
        </div>
        <div id="photo-preview" class="photo-preview"></div>
        <label class="symptoms-label">Ваш вопрос или описание</label>
        <textarea id="symptoms" class="symptoms-input" placeholder="Например: когда обрезать антоновку? Чем подкормить смородину весной? Что это за растение?" rows="4"></textarea>
        <button class="btn btn-full" id="ask">⚙ Спросить AI</button>
      </div>

      <div class="agronom-right">
        <div class="fun-facts">
          <h3>🌟 Знаете ли вы?</h3>
          <p class="agronom-hint">Любопытные факты о наших культурах</p>
          <div class="fun-fact">
            <span class="fun-fact-icon">🍎</span>
            <div class="fun-fact-body">
              <div class="fun-fact-num">1,849 кг</div>
              <div class="fun-fact-text">Самое большое яблоко в истории. Выращено в Японии в 2005 году и занесено в Книгу рекордов Гиннесса</div>
            </div>
          </div>
          <div class="fun-fact">
            <span class="fun-fact-icon">🌍</span>
            <div class="fun-fact-body">
              <div class="fun-fact-num">7 500+</div>
              <div class="fun-fact-text">сортов яблок известно в мире, но в промышленной торговле распространены лишь несколько десятков</div>
            </div>
          </div>
          <div class="fun-fact">
            <span class="fun-fact-icon">🍃</span>
            <div class="fun-fact-body">
              <div class="fun-fact-num">в 4 раза</div>
              <div class="fun-fact-text">больше витамина C в чёрной смородине, чем в апельсине — около 200 мг на 100 г ягод</div>
            </div>
          </div>
          <div class="fun-fact">
            <span class="fun-fact-icon">📖</span>
            <div class="fun-fact-body">
              <div class="fun-fact-num">с 1848</div>
              <div class="fun-fact-text">года Антоновка описана в каталогах русских садов; Бунин посвятил ей рассказ «Антоновские яблоки»</div>
            </div>
          </div>
          <div class="fun-fact">
            <span class="fun-fact-icon">💨</span>
            <div class="fun-fact-body">
              <div class="fun-fact-num">25%</div>
              <div class="fun-fact-text">объёма яблока составляет воздух — поэтому плоды не тонут в воде</div>
            </div>
          </div>
        </div>
        <div class="ai-info">
          <h4>🌿 Что умеет AI?</h4>
          <ul>
            <li>Определять растения по фото</li>
            <li>Рассказывать о ботанике и происхождении видов</li>
            <li>Давать советы по выращиванию и уходу</li>
            <li>Подсказывать сроки обрезки, подкормок, посадки</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="history-section fade-in">
      <h3 class="history-title">🕐 История запросов</h3>
      <p class="agronom-hint">Все ответы AI сохраняются здесь</p>
      <div id="history-list"></div>
    </div>
  `;

  const uploadZone = el.querySelector("#upload-zone");
  const photoInput = el.querySelector("#photo-input");
  const preview = el.querySelector("#photo-preview");
  const btn = el.querySelector("#ask");
  const symptoms = el.querySelector("#symptoms");
  const historyList = el.querySelector("#history-list");

  uploadZone.addEventListener("click", () => photoInput.click());
  uploadZone.addEventListener("dragover", e => { e.preventDefault(); uploadZone.classList.add("drag-over"); });
  uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
  uploadZone.addEventListener("drop", e => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) {
      photoInput.files = e.dataTransfer.files;
      showPreview(e.dataTransfer.files[0]);
    }
  });
  photoInput.addEventListener("change", () => {
    if (photoInput.files.length) showPreview(photoInput.files[0]);
  });

  function showPreview(file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Фото растения">`;
    };
    reader.readAsDataURL(file);
  }

  function renderHistory(limit = 5) {
    const history = loadHistory();
    if (!history.length) {
      historyList.innerHTML = `<p class="history-empty">Запросов пока нет. Задайте вопрос или загрузите фото растения.</p>`;
      return;
    }
    const visible = history.slice(0, limit);
    const prevLimit = limit - 5;

    historyList.innerHTML = visible.map((item, idx) => {
      const label = typeLabel(item.type);
      const isNew = idx >= prevLimit && limit > 5;
      return `
        <div class="history-card${isNew ? " history-card-new" : ""}">
          <div class="history-card-header">
            <span class="history-diagnosis">${escapeHtml(item.title || "Ответ AI")}</span>
            <span class="type-badge ${label.cls}">${label.text}</span>
          </div>
          <div class="history-date">📅 ${formatDate(item.date)}</div>
          ${item.imageDataUrl ? `<img class="history-image" src="${item.imageDataUrl}" alt="Фото">` : ""}
          ${item.question ? `<div class="history-question">«${escapeHtml(item.question)}»</div>` : ""}
          ${item.summary ? `<div class="history-summary">${escapeHtml(item.summary)}</div>` : ""}
          ${renderSections(item.sections)}
        </div>
      `;
    }).join("");

    if (history.length > limit) {
      const remaining = history.length - limit;
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.className = "btn load-more-btn";
      loadMoreBtn.textContent = `Показать ещё (${remaining})`;
      loadMoreBtn.addEventListener("click", () => renderHistory(limit + 5));
      historyList.appendChild(loadMoreBtn);
    }
  }

  btn.addEventListener("click", async () => {
    const text = symptoms.value.trim();
    const hasPhoto = photoInput.files.length > 0;
    if (!text && !hasPhoto) {
      showToast("Задайте вопрос или загрузите фото");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Думаю...";
    showToast("AI обрабатывает запрос — ожидайте");

    let imageBase64 = null;
    let mimeType = null;
    let imageDataUrl = null;
    if (hasPhoto) {
      const file = photoInput.files[0];
      mimeType = file.type;
      imageDataUrl = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      imageBase64 = imageDataUrl.split(",")[1];
    }

    try {
      const res = await fetch(`${API}/agronom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, imageBase64, mimeType }),
      });
      if (!res.ok) {
        showToast("Сервер вернул ошибку");
        return;
      }
      const data = await res.json();
      const answer = data.answer;
      if (!isValidEntry(answer)) {
        showToast("AI вернул неверный формат");
        return;
      }

      // Off-topic: показываем toast с summary, не сохраняем в историю
      if (answer.type === "off_topic") {
        showToast(answer.summary || "Я отвечаю только про растения");
        return;
      }

      const entry = {
        ...answer,
        question: text,
        imageDataUrl,
        date: new Date().toISOString(),
      };
      const history = loadHistory();
      history.unshift(entry);
      if (history.length > 20) history.pop();
      saveHistory(history);

      authFetch(`${API}/agronom-history`, {
        method: "POST",
        body: JSON.stringify({
          question: text,
          answer_json: JSON.stringify(answer),
          image_data_url: imageDataUrl || "",
        }),
      }).catch(() => {});

      renderHistory();
      symptoms.value = "";
      preview.innerHTML = "";
      photoInput.value = "";
      showToast(answer.title ? answer.title : "Ответ получен");
    } catch {
      showToast("Сервер недоступен");
    } finally {
      btn.disabled = false;
      btn.textContent = "⚙ Спросить AI";
    }
  });

  renderHistory();
  syncHistoryFromBackend().then(loaded => { if (loaded) renderHistory(); });
  return el;
}
