const router = require("express").Router();
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/orders", authMiddleware, (req, res) => {
  const { items, total } = req.body || {};
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: "items обязателен" });
  db.prepare("INSERT INTO orders (user_id, items, total) VALUES (?, ?, ?)")
    .run(req.userId, JSON.stringify(items), total || 0);
  res.json({ ok: true });
});

router.get("/orders", authMiddleware, (req, res) => {
  const rows = db.prepare(
    "SELECT id, items, total, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC"
  ).all(req.userId);
  res.json({ orders: rows.map(r => ({ ...r, items: JSON.parse(r.items) })) });
});

module.exports = router;
