const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("./db");
const authMiddleware = require("./middleware/authMiddleware");
const { sendVerifyEmail, sendNewPassword } = require("./mailer");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function safeUser(row) {
  const { password_hash, verify_token, verify_expires, ...user } = row;
  return user;
}

function newVerifyToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generatePassword() {
  // 10 символов из base64url-алфавита
  return crypto.randomBytes(8).toString("base64").replace(/[+/=]/g, "").slice(0, 10);
}

router.post("/auth/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Некорректный email" });
  if (!password || password.length < 6) return res.status(400).json({ error: "Пароль минимум 6 символов" });

  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (existing && existing.email_verified) {
    return res.status(409).json({ error: "Email уже зарегистрирован" });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const token = newVerifyToken();
  const expires = Date.now() + VERIFY_TTL_MS;

  if (existing) {
    // Неподтверждённая регистрация — перевыпускаем токен и обновляем пароль
    db.prepare("UPDATE users SET password_hash=?, verify_token=?, verify_expires=? WHERE id=?")
      .run(password_hash, token, expires, existing.id);
  } else {
    db.prepare("INSERT INTO users (email, password_hash, verify_token, verify_expires) VALUES (?, ?, ?, ?)")
      .run(email, password_hash, token, expires);
  }

  try {
    await sendVerifyEmail(email, token);
  } catch (e) {
    console.error("[mailer] sendVerifyEmail:", e.message);
    return res.status(500).json({ error: "Не удалось отправить письмо. Попробуйте позже." });
  }

  res.json({ ok: true, message: "Письмо с подтверждением отправлено на " + email });
});

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Неверный email или пароль" });
  }
  if (!user.email_verified) {
    return res.status(403).json({ error: "Email не подтверждён. Проверьте почту.", code: "EMAIL_NOT_VERIFIED" });
  }
  res.json({ token: makeToken(user.id), user: safeUser(user) });
});

router.get("/auth/verify", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Нет токена" });

  const user = db.prepare("SELECT * FROM users WHERE verify_token = ?").get(token);
  if (!user) return res.status(400).json({ error: "Ссылка недействительна" });
  if (!user.verify_expires || user.verify_expires < Date.now()) {
    return res.status(400).json({ error: "Ссылка устарела. Запросите письмо повторно." });
  }

  db.prepare("UPDATE users SET email_verified=1, verify_token=NULL, verify_expires=NULL WHERE id=?")
    .run(user.id);
  res.json({ ok: true });
});

router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  // Всегда отвечаем ok — не палим существование email
  if (!EMAIL_RE.test(email || "")) return res.json({ ok: true });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (user && user.email_verified) {
    const newPass = generatePassword();
    const hash = bcrypt.hashSync(newPass, 10);
    db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(hash, user.id);
    try {
      await sendNewPassword(email, newPass);
    } catch (e) {
      console.error("[mailer] sendNewPassword:", e.message);
      // Молча — пользователь увидит ok-ответ; в логах есть деталь
    }
  }
  res.json({ ok: true });
});

router.post("/auth/change-password", authMiddleware, (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Пароль минимум 6 символов" });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(hash, req.userId);
  res.json({ ok: true });
});

router.get("/auth/me", authMiddleware, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  res.json({ user: safeUser(user) });
});

router.patch("/auth/me", authMiddleware, (req, res) => {
  const { name = "", phone = "", region = "", address = "" } = req.body || {};
  db.prepare("UPDATE users SET name=?, phone=?, region=?, address=? WHERE id=?")
    .run(name, phone, region, address, req.userId);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  res.json({ user: safeUser(user) });
});

module.exports = router;
