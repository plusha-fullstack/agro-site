require("dotenv").config();
require("./db"); // инициализация схемы при старте

const express = require("express");
const cors = require("cors");
const path = require("path");
const agronom = require("./agronom");
const authRouter = require("./auth");
const historyRouter = require("./routes/history");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use(authRouter);
app.use(historyRouter);
app.use(ordersRouter);

app.post("/agronom", async (req, res) => {
  const { question, imageBase64, mimeType } = req.body;
  try {
    const answer = await agronom.getAnswer(question, imageBase64, mimeType);
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Статика фронтенда + SPA-фоллбэк для deep-ссылок (/profile, /product/...).
// Идёт после API-роутеров, чтобы их не перекрыть.
const FRONTEND_DIR = path.join(__dirname, "../frontend");
app.use(express.static(FRONTEND_DIR));
app.get("*", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));

app.listen(PORT, () => console.log(`✅ Сайт запущен на http://localhost:${PORT}`));
