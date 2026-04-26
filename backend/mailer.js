// Yandex SMTP через nodemailer. Требует YANDEX_USER (полный email) и
// YANDEX_APP_PASSWORD (16-символьный пароль приложения из id.yandex.ru).
// Отправитель всегда == YANDEX_USER — Yandex не даёт слать от чужого имени.

const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.YANDEX_USER;
  const pass = process.env.YANDEX_APP_PASSWORD;
  if (!user || !pass) throw new Error("Yandex SMTP не настроен (YANDEX_USER / YANDEX_APP_PASSWORD)");
  transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return transporter;
}

async function sendMail({ to, subject, html }) {
  const user = process.env.YANDEX_USER;
  const senderName = process.env.YANDEX_SENDER_NAME || "КФХ Чуряева";
  await getTransporter().sendMail({
    from: `"${senderName}" <${user}>`,
    to,
    subject,
    html,
  });
}

function sendVerifyEmail(to, token) {
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  return sendMail({
    to,
    subject: "Подтвердите регистрацию — КФХ Чуряева",
    html: `
      <p>Здравствуйте!</p>
      <p>Перейдите по ссылке, чтобы подтвердить email и завершить регистрацию:</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#009d3e;color:#fff;border-radius:8px;text-decoration:none">Подтвердить email</a></p>
      <p>Или скопируйте: ${url}</p>
      <p style="color:#888;font-size:12px">Ссылка действует 24 часа. Если вы не регистрировались — просто проигнорируйте письмо.</p>
    `,
  });
}

function sendNewPassword(to, password) {
  return sendMail({
    to,
    subject: "Новый пароль — КФХ Чуряева",
    html: `
      <p>Здравствуйте!</p>
      <p>Ваш новый пароль: <b style="font-size:1.1rem">${password}</b></p>
      <p>Войдите с ним и при необходимости смените пароль в личном кабинете.</p>
      <p style="color:#888;font-size:12px">Если вы не запрашивали сброс пароля — срочно сообщите нам и смените пароль повторно.</p>
    `,
  });
}

module.exports = { sendVerifyEmail, sendNewPassword };
