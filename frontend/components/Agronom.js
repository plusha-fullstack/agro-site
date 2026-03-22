export default function Agronom() {
  const problems = [
    { title: "Мучнистая роса", desc: "Белый налёт на листьях. Обработка фунгицидами при первых признаках." },
    { title: "Тля на смородине", desc: "Скрученные листья, липкий налёт. Используйте инсектициды или мыльный раствор." },
    { title: "Хлороз листьев", desc: "Пожелтение листьев между жилками. Причина — дефицит железа или магния." },
    { title: "Парша яблони", desc: "Тёмные пятна на листьях и плодах. Профилактическое опрыскивание весной." },
  ];

  const div = document.createElement("div");
  div.className = "container";
  div.innerHTML = `
    <h2 class="section-title fade-in">🤖 AI-Агроном</h2>
    <p class="subtitle fade-in">Умный помощник для диагностики болезней растений</p>

    <div class="agronom-layout fade-in">
      <div class="agronom-left">
        <h3>📷 Загрузите фото растения</h3>
        <div class="upload-zone" id="upload-zone">
          <div class="upload-icon">📁</div>
          <p>Перетащите фото сюда или нажмите для выбора</p>
          <input type="file" id="photo-input" accept="image/*" hidden>
        </div>
        <div id="photo-preview" class="photo-preview"></div>
        <textarea id="symptoms" class="symptoms-input" placeholder="Опишите симптомы: что происходит с растением?" rows="3"></textarea>
        <button class="btn btn-full" id="diagnose">Получить диагноз</button>
        <div class="answer-box" id="answer"></div>
      </div>

      <div class="agronom-right">
        <div class="how-it-works">
          <h3>❓ Как это работает?</h3>
          <div class="steps">
            <div class="step"><span class="step-num">1</span> Загрузите фото больного растения</div>
            <div class="step"><span class="step-num">2</span> Опишите симптомы и условия выращивания</div>
            <div class="step"><span class="step-num">3</span> Получите диагноз и рекомендации по лечению</div>
          </div>
        </div>
        <div class="ai-info">
          <h4>🔍 Что может определить AI?</h4>
          <ul>
            <li>Грибковые заболевания</li>
            <li>Вирусные инфекции</li>
            <li>Дефицит питательных веществ</li>
            <li>Повреждения вредителями</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="fade-in">
      <h3 class="section-title problems-title">🌿 Частые проблемы и решения</h3>
      <div class="grid problems-grid">
        ${problems.map(p => `
          <div class="card problem-card">
            <h4>${p.title}</h4>
            <p>${p.desc}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  const uploadZone = div.querySelector("#upload-zone");
  const photoInput = div.querySelector("#photo-input");
  const preview = div.querySelector("#photo-preview");
  const btn = div.querySelector("#diagnose");
  const symptoms = div.querySelector("#symptoms");
  const answer = div.querySelector("#answer");
  answer.style.display = "none";

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

  btn.addEventListener("click", async () => {
    const text = symptoms.value.trim();
    if (!text) { answer.style.display = ""; answer.textContent = "Пожалуйста, опишите симптомы."; return; }
    answer.style.display = "";
    answer.textContent = "Анализирую...";
    try {
      const res = await fetch("http://localhost:3000/agronom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });
      const data = await res.json();
      answer.textContent = data.answer;
    } catch {
      answer.textContent = "Сервер недоступен. Запустите backend: cd backend && node server.js";
    }
  });

  return div;
}
