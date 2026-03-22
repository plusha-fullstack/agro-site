const express = require("express");
const cors = require("cors");
const agronom = require("./agronom"); // ✅ правильный путь

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// AI-Агроном API
app.post("/agronom", (req, res) => {
  const { question } = req.body;
  const answer = agronom.getAnswer(question);
  res.json({ answer });
});

// Корзина
let cart = [];
app.get("/cart", (req, res) => res.json(cart));
app.post("/cart", (req, res) => {
  const { item } = req.body;
  cart.push(item);
  res.json({ success: true, cart });
});

// Запуск сервера
app.listen(PORT, () => console.log(`✅ Backend запущен на http://localhost:${PORT}`));
