require("dotenv").config();
require("./db"); // инициализация схемы при старте

const express = require("express");
const cors = require("cors");
const agronom = require("./agronom");
const authRouter = require("./auth");
const historyRouter = require("./routes/history");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = 3001;

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
    res.status(500).json({ answer: "Ошибка AI: " + e.message });
  }
});

app.listen(PORT, () => console.log(`✅ Backend запущен на http://localhost:${PORT}`));
