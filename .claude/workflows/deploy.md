# Воркфлоу: Деплой на Timeweb VPS

Выкатка Симбы в продакшн. Стек сервера: Timeweb VPS + PM2 + Nginx + PostgreSQL (Docker) + MinIO.
НЕ Vercel, НЕ Railway. Деплой ручной через SSH.

## Перед деплоем (локально)
- [ ] Все изменения закоммичены и запушены на `claude/greeting-nnz368`
- [ ] `npm run build` проходит в `client/`, `admin/`, `server/`
- [ ] Нет секретов в коде (`security-secrets-scanner`)
- [ ] Если менялась схема БД — миграция создана и протестирована локально
- [ ] `performance-optimizer` + `silent-failure-hunter` на крупных изменениях

## Деплой (на сервере через SSH)

### 1. Забрать код
```bash
cd /path/to/project_simba
git fetch origin claude/greeting-nnz368
git reset --hard origin/claude/greeting-nnz368
```

### 2. Зависимости (если менялся package.json)
```bash
npm ci            # в корне и/или в воркспейсах
```

### 3. Миграции БД (если менялась схема)
```bash
cd server
npx prisma migrate deploy    # НЕ migrate dev в проде
npx prisma generate
```

### 4. Сборка
```bash
# Клиент и админка
cd client && npm run build
cd ../admin && npm run build
# Сервер (если компилируется)
cd ../server && npm run build
```

### 5. Перезапуск процессов
```bash
pm2 reload simba-server      # zero-downtime reload, НЕ restart
pm2 save
```

### 6. Nginx (если менялся конфиг)
```bash
nginx -t                     # проверка синтаксиса
systemctl reload nginx
```

## После деплоя — проверка
- [ ] Сайт открывается по домену (HTTPS, сертификат валиден)
- [ ] `pm2 status` — процесс `online`, без рестарт-петли
- [ ] `pm2 logs simba-server --lines 50` — нет ошибок на старте
- [ ] Ключевой сценарий работает: каталог → корзина → оформление
- [ ] Авторизация через OTP проходит
- [ ] Изображения товаров грузятся (MinIO доступен)

## Откат при проблеме
```bash
git reset --hard <предыдущий-коммит>
# при откате миграции — восстановить БД из бэкапа перед migrate
pm2 reload simba-server
```

## Правила безопасности деплоя
- Порты PostgreSQL (5432) и MinIO (9000/9001) НЕ должны быть публичными — только внутренняя сеть Docker
- `.env` на сервере не в git, права `600`
- Бэкап БД перед каждой миграцией в проде
