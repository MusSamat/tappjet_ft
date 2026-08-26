# CLAUDE.md — Terme v2.2
# Коротко. Только то что нужно знать перед каждой задачей.

---

## Стоп перед кодом
Неясно → спроси **один** вопрос. Два варианта → назови оба, жди выбора.
Показывай только изменённые строки, не весь файл.

---

## Стек

| Клиент | Стек |
|---|---|
| Backend | Node 20 + Express + TypeScript + Prisma + PostgreSQL 16 + Socket.IO + Zod + Pino |
| Mini App | React 18 + Vite + Zustand + TanStack Query + react-hook-form + i18next + Tailwind |
| Web | Next.js 14 (App Router) + TanStack Query + Zustand + next-intl + react-leaflet + shadcn/ui |
| Flutter | Flutter 3 + Riverpod + go_router + dio + Hive + flutter_secure_storage + easy_localization |
| Admin | Next.js 14 + Recharts + shadcn/ui |

**Запрещено без явного запроса:** Redis, BullMQ, MinIO, Kafka, любой новый npm пакет.

---

## Архитектура

```
Route → Controller → Service → Repository

/backend/src/
  routes/       — HTTP только
  controllers/  — парсинг req, вызов сервиса
  services/     — вся бизнес-логика
  repositories/ — только Prisma, без логики
  middleware/   — auth, rateLimit, validate
  jobs/         — cron задачи
  socket/       — Socket.IO (отдельный процесс)
```

---

## БД — правила

```sql
id         UUID DEFAULT gen_random_uuid() PRIMARY KEY
created_at TIMESTAMPTZ DEFAULT NOW()
deleted_at TIMESTAMPTZ NULL   -- soft delete
```

- Только Prisma, без raw SQL
- N+1 запрещён — используй include
- seats_available → всегда SELECT FOR UPDATE в транзакции

---

## Auth

```
Access token:  15 мин, в памяти (не localStorage)
Refresh token: продлевается при активности, разлогин через 30 дней
OTP:           bcrypt(code) — никогда plain text
SMS:           только при регистрации / смене номера
Провайдеры:    Telegram · Google · Apple · Phone+Password
```

Token Reuse Detection: повторный refresh → revoke все токены → уведомить.
Deferred Action: terme_deferred_action в sessionStorage, TTL 15 мин.
Телефон скрыт до booking.status = accepted.

---

## Design System

```
Шрифт:   Nunito (кириллица ✓, Google Fonts, бесплатно)
Primary: Teal   #0D9488  — навигация, primary кнопки
Accent:  Amber  #F59E0B  — Submit: "Найти", "Забронировать"
Icons:   lucide-react (Web/Mini App) · lucide_flutter (Flutter)
Input:   Card Field — белый блок, uppercase label, bold value
Button:  Amber = главное действие · Teal = операционное
```

Breakpoints: less than 768 mobile · 768-1024 tablet · more than 1024 desktop (split view).

---

## API

```
Base:    /api/v1
Auth:    Authorization: Bearer <token>
Errors:  { error: { code: "UPPER_SNAKE", message, message_ky } }
Pages:   cursor-based ?cursor=xxx&limit=20
Idem:    Idempotency-Key на POST /trips, POST /bookings
Dates:   ISO 8601 UTC
```

---

## Локализация

```
t('trips.create.title')   ✅
"Создать поездку"         ❌ хардкод запрещён
```

Новый текст → добавь в ru.json + ky.json (заглушка = ru текст).
Структура ключей макс 3 уровня: common.buttons.submit

---

## Чеклист перед сдачей

```
[ ] TypeScript strict, нет any
[ ] Zod валидация в Controller
[ ] AppError вместо throw new Error
[ ] Pino вместо console.log
[ ] ru.json + ky.json обновлены
[ ] Нет Prisma в Controller
[ ] Транзакция там где нужна
[ ] Тест на happy path написан
```

---

## Никогда

```
❌ findMany() без WHERE
❌ OTP в plain text
❌ JWT секрет в коде
❌ any без объяснения
❌ schema.prisma без миграции
❌ SMS при повторном входе
❌ Новый пакет без запроса
```

---

## Команды

```bash
# Backend
npx prisma migrate dev --name "name"
npx prisma studio
npm run dev
npm test

# Mini App / Web / Admin
npm run dev
npm run build

# Flutter
flutter run -d chrome
flutter pub get
```
