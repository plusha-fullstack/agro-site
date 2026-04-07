import { showToast } from "../toast.js";

const HISTORY_KEY = "agro_history";

function parseAnswer(text) {
  const get = (key) => {
    const regex = new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+?)(?=\\n\\*\\*|$)`, "s");
    const m = text.match(regex);
    return m ? m[1].trim() : "";
  };
  return {
    diagnosis: get("Диагноз"),
    severity: get("Степень тяжести"),
    symptoms: get("Описание симптомов"),
    treatment: get("Рекомендации по лечению"),
  };
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function severityClass(severity) {
  if (severity === "Высокая") return "severity-high";
  if (severity === "Средняя") return "severity-medium";
  return "severity-low";
}

export default function Agronom() {
  const el = document.createElement("div");
  el.className = "container";

  el.innerHTML = `
    <h2 class="section-title fade-in">AI-Агроном</h2>
    <p class="subtitle fade-in">Диагностика болезней и вредителей растений</p>

    <div class="agronom-layout fade-in">
      <div class="agronom-left">
        <h3>📷 Загрузите фото растения</h3>
        <p class="agronom-hint">Сфотографируйте поражённые листья или плоды для точной диагностики</p>
        <div class="upload-zone" id="upload-zone">
          <div class="upload-icon">⬆</div>
          <p>Нажмите для выбора фото</p>
          <input type="file" id="photo-input" accept="image/*" hidden>
        </div>
        <div id="photo-preview" class="photo-preview"></div>
        <label class="symptoms-label">Опишите симптомы</label>
        <textarea id="symptoms" class="symptoms-input" placeholder="Например: жёлтые пятна на листьях, скручивание, вредители..." rows="4"></textarea>
        <button class="btn btn-full" id="diagnose">⚙ Получить диагноз</button>
      </div>

      <div class="agronom-right">
        <div class="how-it-works">
          <h3>📖 Как это работает?</h3>
          <div class="steps">
            <div class="step">
              <span class="step-num">1</span>
              <div>
                <div class="step-title">Загрузите фото</div>
                <div class="step-desc">Чёткий снимок поражённого участка растения</div>
              </div>
            </div>
            <div class="step">
              <span class="step-num">2</span>
              <div>
                <div class="step-title">Опишите проблему</div>
                <div class="step-desc">Когда заметили, какие изменения произошли</div>
              </div>
            </div>
            <div class="step">
              <span class="step-num">3</span>
              <div>
                <div class="step-title">Получите рекомендации</div>
                <div class="step-desc">AI определит болезнь и даст советы по лечению</div>
              </div>
            </div>
          </div>
        </div>
        <div class="ai-info">
          <h4>🔍 Что может определить AI?</h4>
          <ul>
            <li>Грибковые заболевания</li>
            <li>Бактериальные инфекции</li>
            <li>Вредителей (тля, клещи, и др.)</li>
            <li>Дефицит питательных веществ</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="history-section fade-in">
      <h3 class="history-title">🕐 История диагностики</h3>
      <p class="agronom-hint">Все результаты анализов сохраняются здесь</p>
      <div id="history-list"></div>
    </div>
  `;

  const uploadZone = el.querySelector("#upload-zone");
  const photoInput = el.querySelector("#photo-input");
  const preview = el.querySelector("#photo-preview");
  const btn = el.querySelector("#diagnose");
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

  function renderHistory() {
    const history = loadHistory();
    if (!history.length) {
      historyList.innerHTML = `<p class="history-empty">Диагнозов пока нет. Загрузите фото и опишите симптомы.</p>`;
      return;
    }
    historyList.innerHTML = history.map(item => `
      <div class="history-card">
        <div class="history-card-header">
          <span class="history-diagnosis">${item.diagnosis || "Диагноз"}</span>
          ${item.severity ? `<span class="severity-badge ${severityClass(item.severity)}">${item.severity} степень</span>` : ""}
        </div>
        <div class="history-date">📅 ${formatDate(item.date)}</div>
        ${item.imageDataUrl ? `<img class="history-image" src="${item.imageDataUrl}" alt="Фото">` : ""}
        ${item.symptoms ? `
          <div class="history-field">
            <div class="history-field-label">📋 Описание симптомов:</div>
            <div>${item.symptoms}</div>
          </div>` : ""}
        ${item.treatment ? `
          <div class="history-field">
            <div class="history-field-label">💊 Рекомендации по лечению:</div>
            <div>${item.treatment}</div>
          </div>` : ""}
      </div>
    `).join("");
  }

  btn.addEventListener("click", async () => {
    const text = symptoms.value.trim();
    if (!text) { showToast("Пожалуйста, опишите симптомы"); return; }

    btn.disabled = true;
    btn.textContent = "Анализирую...";
    showToast("Анализ начат — ожидайте результат");

    let imageBase64 = null;
    let mimeType = null;
    let imageDataUrl = null;
    if (photoInput.files.length) {
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
      const res = await fetch("http://localhost:3001/agronom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, imageBase64, mimeType })
      });
      const data = await res.json();
      const parsed = parseAnswer(data.answer);

      const history = loadHistory();
      history.unshift({ ...parsed, imageDataUrl, date: new Date().toISOString() });
      if (history.length > 20) history.pop();
      saveHistory(history);

      renderHistory();
      symptoms.value = "";
      preview.innerHTML = "";
      photoInput.value = "";
      showToast(parsed.diagnosis ? `Диагноз: ${parsed.diagnosis}` : "Диагноз получен");
    } catch {
      showToast("Сервер недоступен");
    } finally {
      btn.disabled = false;
      btn.textContent = "⚙ Получить диагноз";
    }
  });

  renderHistory();
  return el;
}
