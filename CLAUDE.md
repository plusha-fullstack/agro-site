# КФХ Чуряева — сайт-визитка фермерского хозяйства

## Обзор

Vanilla JS SPA + Express backend. Дизайн воссоздан по скриншотам из онлайн-конструктора.

## Структура

```
frontend/           — SPA (vanilla JS, без фреймворков/сборщиков)
  index.html        — единственная HTML-точка входа
  main.js           — bootstrap: загрузка роутера при DOMContentLoaded
  router.js         — SPA-роутер (history API, data-link атрибуты), рендерит Header + Page + Footer
  store.js          — in-memory хранилище корзины (qty, add, remove, clear)
  style.css         — все стили SPA + 3 брейкпоинта (1024/768/480px) + бургер + hover-guard
  animations.css    — fade-in анимации
  images/           — локальные изображения (hero, продукты, команда)
  components/
    Header.js       — top-bar + nav-bar с бургер-меню на мобильных (☰/✕)
    Footer.js       — зелёный footer с брендом, копирайтом и слоганом
    Home.js         — герой-баннер, история, ценности, контакты
    Team.js         — 3 карточки команды с круглыми фото и бейджами
    Products.js     — 3 карточки товаров; кнопка "В корзину" → счётчик [− N кг +], макс 100
    Cart.js         — двухколоночный layout: корзина + форма заказа с валидацией телефона
    Agronom.js      — AI-агроном: загрузка фото, симптомы, диагноз, частые проблемы

backend/            — Express.js API (порт 3000)
  server.js         — точка входа, маршруты
  agronom.js        — заглушка AI-агронома (эхо-ответ)
  package.json      — зависимости: express, cors

css/                — отдельные CSS (не используются SPA-версией)
drafts/             — черновики: статичные HTML-прототипы до перехода на SPA
```

## Запуск

```bash
# Backend
cd backend && npm install && node server.js
# → http://localhost:3000

# Frontend (нужен любой статик-сервер)
cd frontend && npx serve .
# → http://localhost:3000 или 3001
```

## Архитектура frontend

- **Без сборщика** — ES modules через `<script type="module">`
- **Роутер** (`router.js`): перехватывает клики через `e.target.closest("a[data-link]")`, рендерит Header + Page + Footer в `#app`
- **Компоненты**: функции `() => HTMLElement`, создают DOM через `document.createElement` + `innerHTML`
- **Store** (`store.js`): in-memory, живёт пока открыта вкладка. API: `add(product, qty)`, `remove(name)`, `get()`, `clear()`
- **Layout**: top-bar (зелёный, #009d3e) → nav-bar (белый) → page content → footer (зелёный)

## Архитектура backend

- Express + CORS
- `POST /agronom` — принимает `{ question }`, возвращает `{ answer }` (сейчас эхо)
- `GET/POST /cart` — in-memory корзина (теряется при рестарте)

## Адаптивность

- **1024px** — планшет: карточки команды/товаров 2 колонки
- **768px** — мобильный: бургер-меню, все гриды → 1 колонка, тач-зоны ≥ 44px
- **480px** — маленький мобильный: уменьшены отступы и шрифты
- Hover-эффекты только при `@media (hover: hover)`

## Корзина и заказ

- Счётчик на карточке товара: "В корзину" → `[− N кг +]`, минус на 1 → возврат к кнопке
- Страница корзины: слева список с итогом, справа форма телефона (+7 (XXX) XXX-XX-XX)
- После отправки: номер заказа (5 знаков, рандом) + благодарность; `store.clear()`
- Состояние не персистится — при перезагрузке страницы корзина пуста

## Соглашения

- Компоненты — именованные экспорты по умолчанию (`export default function Name()`)
- Роуты в `router.js` — объект `{ path: Component }`
- Backend — CommonJS (`require`/`module.exports`), frontend — ES modules (`import`/`export`)

## Известные проблемы

- `css/` — дубликат стилей, не используется SPA-версией
- `backend/main.js` — скрипт для статичных HTML (add-to-cart), не используется в SPA
- `store.js` — нет синхронизации с backend `/cart`
- AI-Агроном — заглушка, нет реальной интеграции с LLM
- Нет `.gitignore` (node_modules не исключён)
- Изображения в `frontend/images/` нужно сохранить вручную (hero.jpg, currant.jpg, antonovka.jpg, white-apple.jpg, team1-3.jpg)
