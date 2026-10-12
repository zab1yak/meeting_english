# Meeting English

Платформа онлайн-уроков английского: конструктор уроков, плеер, виртуальный класс
в реальном времени и домашние задания. Название продукта задаётся в
`packages/shared/src/brand.ts`.

## Запуск одной командой (Docker)

Нужен [Docker Desktop](https://www.docker.com/products/docker-desktop/) (на Windows — с WSL2).

```bash
docker compose up --build
```

После запуска:

- веб-приложение — http://localhost:3000 (проверка: http://localhost:3000/api/health);
- realtime-сервер — http://localhost:3001/health;
- PostgreSQL — `localhost:5432`, Redis — `localhost:6379` (только с этого компьютера).

Пароль БД по умолчанию `change-me` (используйте только латиницу и цифры: пароль
подставляется в `DATABASE_URL` без URL-кодирования). Чтобы поменять, скопируйте `.env.example` в `.env`
и отредактируйте значения — compose подхватит их автоматически.

Остановить: `Ctrl+C`, затем `docker compose down` (данные сохраняются в томах;
`docker compose down -v` удалит и их).

## Разработка без Docker для приложений

Нужны Node.js 22.12+ и pnpm (через corepack: `corepack enable pnpm`).
PostgreSQL и Redis удобно поднять из того же compose:

```bash
cp .env.example .env
docker compose up -d postgres redis
pnpm install
pnpm dev
```

`pnpm dev` запускает web (порт 3000) и realtime (порт 3001) с перезагрузкой при изменениях.

## Команды

| Команда            | Что делает                         |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | web и realtime в режиме разработки |
| `pnpm build`       | сборка всех приложений             |
| `pnpm lint`        | ESLint во всех пакетах             |
| `pnpm typecheck`   | проверка типов TypeScript          |
| `pnpm test`        | юнит-тесты (Vitest)                |
| `pnpm format`      | форматирование Prettier            |
| `pnpm db:generate` | генерация Prisma Client            |
| `pnpm db:migrate`  | создать и применить миграцию (dev) |

## Структура

```
apps/
  web/        Next.js (App Router): страницы, REST API, авторизация
  realtime/   Node.js + Socket.IO: виртуальный класс в реальном времени
packages/
  shared/     общие типы, Zod-схемы, протокол событий, название продукта
  db/         Prisma: схема, миграции, клиент
  config/     общие настройки TypeScript, ESLint, Prettier
```

## Переменные окружения

Все переменные описаны в [`.env.example`](.env.example).

| Переменная                  | Где используется  | Назначение                                                            |
| --------------------------- | ----------------- | --------------------------------------------------------------------- |
| `POSTGRES_USER/PASSWORD/DB` | compose           | учётные данные PostgreSQL                                             |
| `DATABASE_URL`              | web, realtime, db | строка подключения к PostgreSQL                                       |
| `REDIS_URL`                 | web, realtime     | Redis (pub/sub, presence); без неё realtime работает в одном процессе |
| `NEXT_PUBLIC_REALTIME_URL`  | web (браузер)     | адрес realtime-сервера                                                |
| `REALTIME_PORT`             | realtime          | порт (по умолчанию 3001)                                              |
| `WEB_ORIGIN`                | realtime          | разрешённый Origin для Socket.IO                                      |

## CI

GitHub Actions (`.github/workflows/ci.yml`) на каждый push и PR: Prettier, ESLint,
TypeScript, тесты, сборка, затем сборка Docker-образов и smoke-тест всего стека.
