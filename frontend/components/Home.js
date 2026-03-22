export default function Home() {
  const div = document.createElement("div");
  div.innerHTML = `
    <section class="hero fade-in">
      <div class="hero-overlay">
        <h1>Добро пожаловать!</h1>
        <p>Выращиваем с любовью, делимся с радостью</p>
      </div>
    </section>

    <div class="container fade-in">
      <div class="two-col">
        <div class="card info-card">
          <h3>🌾 Наша история</h3>
          <p>
            Крестьянско-фермерское хозяйство Чуряевой Ларисы Николаевны было основано в 2015 году
            в селе Собурово. За эти годы мы выросли с 15 до 300 гектаров плантаций чёрной смородины.
            В 2020 году заложили яблоневые сады площадью более 150 гектаров.
          </p>
          <p>
            Сегодня наше хозяйство — это современное предприятие, сочетающее традиционные методы
            выращивания с инновационными технологиями.
          </p>
        </div>
        <div class="card info-card">
          <h3>💚 Наши ценности</h3>
          <ul class="values-list">
            <li><span class="check">✓</span> 100% натуральность — никаких химических добавок и ГМО</li>
            <li><span class="check">✓</span> Традиционные методы — проверенные поколениями технологии выращивания</li>
            <li><span class="check">✓</span> Забота о природе — устойчивое земледелие и бережное отношение к почве</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="container fade-in">
      <h2 class="section-title">📞 Свяжитесь с нами</h2>
      <div class="contacts-grid">
        <div class="contact-item">
          <div class="contact-icon">📱</div>
          <div class="contact-label">Телефон</div>
          <div class="contact-value">+7 (927) 854-32-19</div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">✉️</div>
          <div class="contact-label">Email</div>
          <div class="contact-value">info@kolhoz-urozhay.ru</div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">📍</div>
          <div class="contact-label">Адрес</div>
          <div class="contact-value">с. Собурово</div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">🕐</div>
          <div class="contact-label">Режим работы</div>
          <div class="contact-value">Пн-Пт 8:00-18:00</div>
        </div>
      </div>
    </div>
  `;
  return div;
}
