# Telegram Digital Shop

Telegram бот-магазин цифровых товаров на Next.js (App Router), Prisma и Telegraf.

## Стек
- **Next.js 14** (App Router) — HTTP API (`/api/webhook`)
- **TypeScript**
- **Telegraf** — Telegram-бот
- **Prisma ORM** + **PostgreSQL**
- **Docker / docker-compose**

## Структура проекта
```
app/                # Next.js страницы и API
  api/webhook       # Webhook endpoint для Telegram
bot/                # Логика бота (handlers, сцены)
lib/                # Prisma client, env, i18n
prisma/             # Prisma schema + seed
public/             # Статические файлы
```

## Подготовка окружения
1. Скопируйте `.env.example` в `.env` и заполните значения:
   - `TELEGRAM_BOT_TOKEN` — токен бота
   - `DATABASE_URL` — строка подключения Postgres
   - `ADMIN_TELEGRAM_ID` — Telegram ID администратора
   - `PAYMENT_CARD_NUMBER` — номер карты для оплаты
   - `SUPPORT_USERNAME` — контакт поддержки (например, `@support`)
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Сгенерируйте Prisma client и примените схему:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Заполните тестовые данные (админ + товары):
   ```bash
   npm run prisma:seed
   ```
   > В сидере используются заглушки `BASIC_FILE_ID_PLACEHOLDER` / `PRO_FILE_ID_PLACEHOLDER`. После загрузки реальных файлов в Telegram замените `fileId` через админ-сцену или обновите значения в БД, иначе отправка документа при выдаче заказа будет недоступна.

## Запуск в режиме разработки
```bash
npm run dev
```
Сервер поднимется на `http://localhost:3000` (страница-заглушка `Bot is active 🟢`).

## Настройка Webhook
Telegram будет отправлять апдейты на `POST /api/webhook`.
После деплоя выполните:
```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://<ваш-домен>/api/webhook"}'
```
Замените `<ваш-домен>` на реальный URL приложения.

## Docker / docker-compose
1. Соберите и запустите сервисы:
   ```bash
   docker-compose up --build
   ```
2. Примените миграции/seed внутри контейнера (при первом запуске):
   ```bash
   docker-compose exec app npx prisma db push
   docker-compose exec app npm run prisma:seed
   ```
3. Убедитесь, что `DATABASE_URL` в `.env` указывает на контейнер `postgres` (пример уже добавлен в `docker-compose.yml`).

## Основные возможности бота
- `/start` — приветствие, выбор языка (RU/UZ), создание пользователя.
- Главное меню (Reply Keyboard): Каталог / Поддержка.
- Каталог показывает категории активных товаров, затем список товаров с кнопкой «Купить».
- Покупка создаёт заказ (статус `WAITING_SCREENSHOT`), бот просит перевести сумму на карту и прислать скриншот.
- После получения скриншота заказ → `PENDING_APPROVAL`, бот отправляет фото админу с кнопками ✅/❌.
- Админ-экшены:
  - ✅ подтверждает оплату, статус `COMPLETED`, бот отправляет пользователю файл (`product.fileId`).
  - ❌ отклоняет заказ, статус `REJECTED`, бот сообщает пользователю.
- `/admin` (доступ только `ADMIN_TELEGRAM_ID`) запускает панель с визардом добавления товара: название RU → название UZ → цена → категория → загрузка ZIP (бот сохраняет `file_id`).

## Дополнительно
- Вся текстовая часть вынесена в `lib/i18n.ts`.
- Prisma client создаётся в `lib/prisma.ts` с защитой от дублирования в dev.
- Seed-скрипт добавляет администратора и два товара (Basic Pack, Pro Pack).
- API работает полностью через Next.js, отдельного express-сервера не требуется.

Готово! После заполнения `.env`, запуска БД и выдачи вебхука бот готов к работе.
