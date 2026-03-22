document.querySelectorAll(".add-to-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.textContent = "Добавлено ✔";
    btn.disabled = true;
  });
});
