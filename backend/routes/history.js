const router = require("express").Router();
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/agronom-history", authMiddleware, (req, res) => {
  const { question, answer_json, image_data_url } = req.body || {};
  db.prepare("INSERT INTO agronom_history (user_id, question, answer_json, image_data_url) VALUES (?, ?, ?, ?)")
    .run(req.userId, question || "", answer_json || "", image_data_url || "");
  res.json({ ok: true });
});

router.get("/agronom-history", authMiddleware, (req, res) => {
  const rows = db.prepare(
    "SELECT id, question, answer_json, image_data_url, created_at FROM agronom_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
  ).all(req.userId);
  res.json({ history: rows });
});

module.exports = router;
