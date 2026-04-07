# КФХ Чуряева — сайт-визитка фермерского хозяйства

## Обзор

Vanilla JS SPA + Express backend. Дизайн воссоздан по скриншотам из онлайн-конструктора.

## Структура

```
frontend/           — SPA (vanilla JS, без фреймворков/сборщиков)
  index.html        — единственная HTML-точка входа
  main.js           — bootstrap: загрузка роутера при DOMContentLoaded
  router.js         — SPA-роутер (history API, data-link атрибуты), рендерит Header + Page + Footer
  store.js          — корзина на localStorage. API: add(product, qty), remove(name), get(), clear()
  toast.js          — showToast(message): уведомление в правом нижнем углу, поддерживает стек
  style.css         — все стили SPA + 3 брейкпоинта (1024/768/480px) + бургер + hover-guard
  animations.css    — fade-in анимации (.fade-in → .fade-in.visible)
  images/           — локальные изображения (hero, продукты, команда)
  components/
    Header.js       — top-bar + nav-bar с бургер-меню на мобильных (☰/✕)
    Footer.js       — зелёный footer с брендом, копирайтом и слоганом
    Home.js         — герой-баннер, история, ценности, контакты
    Team.js         — 3 карточки команды с круглыми фото и бейджами
    Products.js     — 3 карточки товаров; "В корзину" → счётчик [− N кг +], макс 100; showToast при добавлении
    Cart.js         — список товаров с фото + счётчики + удаление; модалка заказа; экран успеха
    Agronom.js      — AI-агроном: загрузка фото, симптомы, диагноз от Gemini, история в localStorage (agro_history, макс 20); showToast при запуске/результате

backend/            — Express.js API (порт 3001)
  server.js         — точка входа, маршруты
  agronom.js        — интеграция с Gemini API (multimodal: текст + изображение); промпт возвращает структурированный формат с полями Диагноз / Степень тяжести / Описание симптомов / Рекомендации по лечению
  package.json      — зависимости: express, cors

css/                — устаревшие CSS, не используются SPA-версией
drafts/             — черновики: статичные HTML-прототипы до перехода на SPA
```

## Запуск

```bash
# Backend (порт 3001)
cd backend && npm install && node server.js

# Frontend (нужен любой статик-сервер)
cd frontend && npx serve .
```

## Архитектура frontend

- **Без сборщика** — ES modules через `<script type="module">`
- **Роутер** (`router.js`): перехватывает клики `a[data-link]`, рендерит Header + Page + Footer в `#app`. После рендера добавляет `.visible` ко всем `.fade-in`.
- **Компоненты**: функции `() => HTMLElement`, DOM через `document.createElement` + `innerHTML`
- **Store** (`store.js`): персистится в `localStorage` (`agro_cart`). Корзина сохраняется между перезагрузками.
- **История агронома** (`Agronom.js`): персистится в `localStorage` (`agro_history`). `parseAnswer(text)` разбирает ответ Gemini по маркерам `**Поле:**`. Бейдж степени: Легкая (зелёный) / Средняя (жёлтый) / Высокая (красный).
- **Toast** (`toast.js`): `showToast(message)` — добавляет уведомление в `#toast-container` (создаётся автоматически). Стек снизу вверх, исчезает через 3 сек.
- **Layout**: top-bar (#009d3e) → nav-bar (белый) → page content → footer (#009d3e)

## Подводные камни

- **fade-in в динамических компонентах**: роутер добавляет `.visible` только при первом рендере страницы. Компоненты с внутренним `render()` (Cart.js) должны сами вызывать `el.classList.add("visible")` после каждой перерисовки.
- **Backend порт 3001** — не 3000. В `Agronom.js` fetch идёт на `http://localhost:3001/agronom`.

## Корзина и заказ

1. На странице товаров: "В корзину" → счётчик `[− N кг +]` + toast-уведомление
2. На странице корзины: карточки с фото, счётчиком и кнопкой удаления (SVG); блок «Итого к оплате»
3. "Оформить заказ" → модальное окно (Имя + Email + Телефон с маской +7)
4. Валидация с текстовыми подсказками под полями; email проверяется regex `/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/`
5. После подтверждения: `store.clear()` → экран с зелёной галкой «Спасибо за заказ!» на 2 сек → пустая корзина

## Адаптивность

- **1024px** — планшет: карточки команды/товаров 2 колонки
- **768px** — мобильный: бургер-меню, все гриды → 1 колонка, тач-зоны ≥ 44px
- **480px** — маленький мобильный: уменьшены отступы и шрифты
- Hover-эффекты только при `@media (hover: hover)`

## Соглашения

- Компоненты — `export default function Name()` возвращает `HTMLElement`
- Роуты в `router.js` — объект `{ path: Component }`
- Backend — CommonJS (`require`/`module.exports`), frontend — ES modules (`import`/`export`)

## Известные проблемы

- `css/` и `backend/main.js` — не используются, можно удалить
- `store.js` — нет синхронизации с backend `/cart`
- Нет `.gitignore` (node_modules не исключён)
- Изображения в `frontend/images/` нужно сохранить вручную: `hero.jpg`, `currant.jpg`, `antonovka.jpg`, `white-apple.jpg`, `team1.jpg`–`team3.jpg`
