// Простой in-memory rate-limiter (fixed window) без внешних зависимостей.
// Хватает, чтобы отсечь спам/брутфорс на одиночном сервере.
// За reverse-proxy потребуется app.set("trust proxy", 1), чтобы req.ip был реальным.
module.exports = function rateLimit({ windowMs, max, message }) {
  const hits = new Map(); // ip -> { count, resetAt }

  return function (req, res, next) {
    const now = Date.now();

    // ленивая чистка протухших записей, чтобы Map не рос бесконечно
    if (hits.size > 2500) {
      for (const [ip, rec] of hits) if (now > rec.resetAt) hits.delete(ip);
    }

    let rec = hits.get(req.ip);
    if (!rec || now > rec.resetAt) {
      rec = { count: 0, resetAt: now + windowMs };
      hits.set(req.ip, rec);
    }
    rec.count++;

    if (rec.count > max) {
      res.set("Retry-After", String(Math.ceil((rec.resetAt - now) / 1000)));
      return res.status(429).json({ error: message || "Слишком много запросов, попробуйте позже." });
    }
    next();
  };
};
