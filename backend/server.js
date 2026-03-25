require("dotenv").config();
const express = require("express");
const cors = require("cors");
const agronom = require("./agronom"); // ✅ правильный путь

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// AI-Агроном API
app.post("/agronom", async (req, res) => {
  const { question, imageBase64, mimeType } = req.body;
  try {
    const answer = await agronom.getAnswer(question, imageBase64, mimeType);
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ answer: "Ошибка AI: " + e.message });
  }
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
