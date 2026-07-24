---
description: Чеклист деплоя Симбы на Timeweb VPS (PM2 + Nginx + Prisma)
---

Проведи деплой по воркфлоу `.claude/workflows/deploy.md`.

Перед деплоем убедись:
- Всё закоммичено и запушено на `claude/greeting-nnz368`
- `npm run build` проходит в `client/`, `admin/`, `server/`
- Нет секретов в коде (`security-secrets-scanner`)
- Миграции протестированы локально
- Если есть новые миграции — прогнать `migration-guard` (риск потери данных,
  блокировки, порядок выкатки). Деструктивная миграция без свежего бэкапа — блокер

На сервере (SSH): `git reset --hard origin/...` → `prisma migrate deploy` →
сборка → `pm2 reload simba-server`. Стек: Timeweb VPS + PM2 + Nginx (НЕ Vercel).

После — проверь: сайт открывается (HTTPS), `pm2 status` online, логи чистые,
каталог→корзина→оформление работает, OTP проходит, картинки из MinIO грузятся.
