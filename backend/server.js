require("dotenv").config();
require("./db"); // инициализация схемы при старте

const express = require("express");
const cors = require("cors");
const path = require("path");
const agronom = require("./agronom");
const authRouter = require("./auth");
const historyRouter = require("./routes/history");
const ordersRouter = require("./routes/orders");
const authMiddleware = require("./middleware/authMiddleware");
const rateLimit = require("./middleware/rateLimit");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Лимиты против спама/брутфорса (по IP)
const emailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: "Слишком много писем. Подождите час." });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: "Слишком много попыток входа. Подождите." });
const agronomLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: "Лимит запросов к агроному исчерпан. Попробуйте позже." });

// Эндпоинты, шлющие письма и принимающие пароли, — до монтирования роутера
app.use("/auth/register", emailLimiter);
app.use("/auth/forgot-password", emailLimiter);
app.use("/auth/login", loginLimiter);

app.use(authRouter);
app.use(historyRouter);
app.use(ordersRouter);

// /agronom: только для авторизованных + лимит (прямой расход на Gemini)
app.post("/agronom", agronomLimiter, authMiddleware, async (req, res) => {
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
