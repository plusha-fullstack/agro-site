# КФХ Чуряева — сайт-визитка фермерского хозяйства

## Обзор

Vanilla JS SPA + Express backend. Дизайн воссоздан по скриншотам из онлайн-конструктора.

## Запуск

```bash
# Backend (порт 3001)
cd backend && npm install && node server.js

# Frontend (нужен любой статик-сервер)
cd frontend && npx serve .
```

Переменные окружения в `backend/.env`:
- `GEMINI_API_KEY` — Google AI Studio (для AI-агронома)
- `JWT_SECRET` — любая случайная строка
- `YANDEX_USER` — полный адрес ящика на Яндексе (например, `noreply@yandex.ru`); отправитель писем
- `YANDEX_APP_PASSWORD` — 16-символьный пароль приложения из id.yandex.ru → Пароли приложений
- `YANDEX_SENDER_NAME` — подпись в письмах (по умолчанию `КФХ Чуряева`)
- `FRONTEND_URL` — база для verify-ссылок в письмах (например, `http://localhost:3000`)

## Структура frontend

```
frontend/
  index.html        — единственная HTML-точка входа; <base href="/"> обязателен для deep-URL
  main.js           — bootstrap: router.init() + router.load() при DOMContentLoaded
  router.js         — SPA-роутер (history API, data-link атрибуты), рендерит Header + Page + Footer
  store.js          — корзина: localStorage key agro_cart. API: add(product, qty), remove(name), get(), clear()
  auth.js           — JWT-сессия: getToken, isLoggedIn, getCurrentUser, setAuth, clearAuth, authFetch
  toast.js          — showToast(message): уведомление в правом нижнем углу, стек, исчезает через 3 сек
  style.css         — все стили SPA + брейкпоинты (1024/768/480px)
  animations.css    — fade-in анимации (.fade-in → .fade-in.visible)
  components/
    Header.js       — top-bar + nav-bar + бургер. Иконка 🚪/👤 зависит от isLoggedIn()
    Auth.js         — /auth: табы «Войти»/«Зарегистрироваться» + форма «Забыли пароль» + экран «Проверьте почту».
                      Регистрация теперь не выдаёт JWT — пользователь жмёт ссылку из письма (/verify-email?token=...).
                      Логин при `email_verified=0` возвращает 403 → показывается ссылка «Отправить письмо повторно».
    VerifyEmail.js  — /verify-email?token=...: бьёт GET /auth/verify, через 1.5с редиректит на /auth?verified=1
    Profile.js      — /profile: hero (аватар-инициалы + приветствие + «Выйти» на зелёном градиенте);
                      «Личные данные» (с кнопками «Сохранить» + «Сменить пароль») сверху + «История заказов» снизу.
                      Кнопка «Сменить пароль» открывает модалку (поля «Новый пароль» + «Повторите»);
                      при успехе — зелёная галка ✓ как при оформлении заказа, авто-закрытие через 1.5 сек.
                      Телефон форматируется и валидируется так же, как в Cart. Истории агронома здесь больше нет.
    Cart.js         — корзина + модалка заказа. Оформление — только авторизованным; поля предзаполняются из профиля
    Agronom.js      — AI-агроном. Только для авторизованных; показывает заглушку иначе.
                      История: localStorage `agro_history_<userId>` (per-user) + синхронизация с backend POST /agronom-history
    Articles.js / ArticleDetail.js / articles-data.js — каталог статей (6 шт.); данные в articles-data.js
    Team.js / TeamMember.js    — команда (3 человека); данные захардкожены в TeamMember.js
    Products.js / ProductDetail.js — товары (3 шт.); счётчик [− N кг +], макс 100 кг
    Home.js / Footer.js        — главная и подвал
```

## Структура backend

```
backend/
  server.js              — точка входа; монтирует все роутеры
  agronom.js             — Gemini API (multimodal: текст + изображение)
  auth.js                — Router: POST /auth/register (email-confirm), POST /auth/login,
                           GET /auth/verify?token=, POST /auth/forgot-password,
                           POST /auth/change-password (JWT), GET/PATCH /auth/me
  mailer.js              — Yandex SMTP через nodemailer: sendVerifyEmail, sendNewPassword. Отправитель == YANDEX_USER
  db.js                  — SQLite (better-sqlite3); создаёт backend/data/agro.db + миграция users (email_verified)
  middleware/
    authMiddleware.js    — JWT-верификация; пишет req.userId или возвращает 401
  routes/
    history.js           — POST/GET /agronom-history (JWT required)
    orders.js            — POST/GET /orders (JWT required)
  data/agro.db           — SQLite файл (создаётся автоматически, не коммитить)
```

### Схема БД

```sql
users (id, email, password_hash, name, phone, region, address, created_at,
       email_verified INTEGER DEFAULT 0, verify_token TEXT, verify_expires INTEGER)
orders (id, user_id, items TEXT/JSON, total, created_at)
agronom_history (id, user_id, question, answer_json, image_data_url, created_at)
```

## Роутер

```js
// Точные маршруты
const routes = { "/": Home, "/team": Team, "/products": Products,
                 "/cart": Cart, "/agronom": Agronom, "/articles": Articles,
                 "/auth": Auth, "/profile": Profile, "/verify-email": VerifyEmail };

// Динамические
const dynamicRoutes = [
  { pattern: /^\/team\/(.+)$/,     component: (slug) => TeamMember(slug) },
  { pattern: /^\/product\/(.+)$/,  component: (slug) => ProductDetail(slug) },
  { pattern: /^\/articles\/(.+)$/, component: (slug) => ArticleDetail(slug) },
];
```

Для добавления статьи — только объект в массив `articles` в `articles-data.js`.

## Архитектура frontend

- **Без сборщика** — ES modules через `<script type="module">`
- **Компоненты**: функции `() => HTMLElement`, DOM через `document.createElement` + `innerHTML`
- **Auth** (`auth.js`): токен в `localStorage` (`agro_token`), профиль в `agro_user`. `authFetch` — обёртка fetch с `Authorization: Bearer`. `clearAuth()` чистит и `agro_history_*` (чтобы данные одного пользователя не утекали следующему на том же устройстве).
- **Валидация форм** (Auth, Profile, Cart): на формах стоит `novalidate`, валидация только в JS — иначе браузер показывает свои англоязычные тултипы (`Please include an '@'…`). `EMAIL_RE` и форматтер телефона `+7 (xxx) xxx-xx-xx` — общий паттерн (см. Cart.js, продублирован в Profile.js).
- **Store** (`store.js`): корзина в `localStorage` (`agro_cart`).
- **История агронома**: `parseAnswer(text)` разбирает ответ Gemini по маркерам `**Поле:**`. Бейдж степени: Лёгкая (зелёный) / Средняя (жёлтый) / Высокая (красный). Ключ localStorage — `agro_history_<userId>`, не глобальный, чтобы не показывать чужие диагнозы при смене аккаунта на одном устройстве.
- **Layout**: top-bar (#009d3e) → nav-bar (белый) → page content → footer (#009d3e)

## Auth-флоу

1. **Регистрация:** `POST /auth/register` создаёт юзера с `email_verified=0`, шлёт письмо со ссылкой `${FRONTEND_URL}/verify-email?token=...`. JWT не выдаётся — фронт показывает экран «📬 Проверьте почту». Повторная регистрация на тот же неподтверждённый email перевыпускает токен и пароль.
2. **Подтверждение:** `GET /auth/verify?token=...` → флаг `email_verified=1`, токен зануляется. Срок жизни токена — 24 часа.
3. **Логин:** при `email_verified=0` → 403 + `code: "EMAIL_NOT_VERIFIED"`. Фронт показывает inline-ссылку «Отправить письмо повторно» (бьёт `/auth/register` тем же email/паролем).
4. **Забыли пароль:** `POST /auth/forgot-password` всегда отвечает `ok` (privacy); если юзер найден и подтверждён — генерит новый пароль (10 символов из base64), хэширует, шлёт письмом.
5. **Смена пароля:** `POST /auth/change-password` (JWT) принимает `{ newPassword }` — текущий пароль не запрашиваем, JWT и есть гейт.

## Корзина и заказ

1. Добавление — только на `/products`: счётчик `[− N кг +]` + toast
2. Оформление — только для авторизованных; иначе редирект на `/auth`
3. Модалка предзаполняется из профиля (`getCurrentUser()`)
4. При подтверждении: `POST /orders` → `store.clear()` → экран «Спасибо» 2 сек → пустая корзина

## Подводные камни

- **Deep URL**: `<base href="/">` обязателен; `serve.json` делает rewrite `** → /index.html`.
- **fade-in в Cart.js**: компонент сам вызывает `.classList.add("visible")` после каждого `render()` — роутер этого не делает повторно.
- **Все fetch к backend**: порт 3001, не 3000. Защищённые запросы — через `authFetch` из `auth.js`.
- **Пути к изображениям**: абсолютные `/images/...`, не относительные.
- **Circular import** `router.js ↔ Auth.js/Profile.js`: допустим, т.к. `router.navigate()` вызывается только внутри event-хендлеров (после инициализации модулей).

## Адаптивность

- **1024px** — 2 колонки для карточек, detail-страницы перестраиваются
- **768px** — бургер-меню, большинство гридов → 1 колонка
- **480px** — статьи 1 колонка, уменьшены отступы
- Hover-эффекты только при `@media (hover: hover)`

## Соглашения

- Компоненты — `export default function Name()` возвращает `HTMLElement`
- Детальные — `export default function Name(slug)` возвращает `HTMLElement`
- Backend — CommonJS, frontend — ES modules

## Известные проблемы

- `css/` и `backend/main.js` — не используются, можно удалить
- Нет `.gitignore` (node_modules и `backend/data/` не исключены)
- Изображения в `frontend/images/` нужно сохранить вручную: `hero.jpg`, `currant.jpg`, `antonovka.jpg`, `white-apple.jpg`, `team1.jpg`–`team3.jpg`
