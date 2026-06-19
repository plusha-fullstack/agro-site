export default function Team() {
  const team = [
    {
      slug: "shinkarev",
      name: "Шинкарев Вячеслав Дмитриевич",
      role: "Заместитель управляющего",
      exp: "2 года в агробизнесе",
      photo: "./images/team1.jpg",
    },
    {
      slug: "kuznetsova",
      name: "Кузнецова Елена Николаевна",
      role: "Главный агроном",
      exp: "18 лет работы с плодово-ягодными культурами",
      photo: "./images/team2.jpg",
    },
    {
      slug: "morozov",
      name: "Морозов Дмитрий Александрович",
      role: "Специалист по защите растений",
      exp: "12 лет в области фитопатологии",
      photo: "./images/team3.jpg",
    },
    {
      slug: "shelmenkov-nikita",
      name: "Шельменков Никита Николаевич",
      role: "Главный механик",
      exp: "11 лет занимается ремонтом всей техники",
      photo: "./images/team4.jpg",
    },
    {
      slug: "shelmenkov-nikolay",
      name: "Шельменков Николай Михайлович",
      role: "Механизатор",
      exp: "Управляет всем, что управляется",
      photo: "./images/team5.jpg",
    },
  ];

  const div = document.createElement("div");
  div.className = "container";
  div.innerHTML = `
    <h2 class="section-title fade-in">Наша команда</h2>
    <p class="subtitle fade-in">Профессионалы с многолетним опытом</p>
    <div class="grid team-grid">
      ${team.map(m => `
        <a data-link href="/team/${m.slug}" class="card team-card fade-in">
          <div class="team-photo-wrap">
            <img class="team-photo" src="${m.photo}" alt="${m.name}">
          </div>
          <h3>${m.name}</h3>
          <span class="badge">${m.role}</span>
          <p class="team-exp">${m.exp}</p>
          <span class="team-card-hint">Подробнее →</span>
        </a>
      `).join("")}
    </div>
  `;
  return div;
}
