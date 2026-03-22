export default function Footer() {
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">🌱 КФХ Чуряева Лариса Николаевна</div>
      <div class="footer-copy">© 2026 Все права защищены</div>
      <div class="footer-slogan">Выращено с заботой о природе и людях</div>
    </div>
  `;
  return footer;
}
