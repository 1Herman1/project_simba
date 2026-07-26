# Деплой Simba на VPS (тест-версия на IP 147.45.157.11)

Разворачиваем закрытую тест-версию: магазин `/`, админка `/admin` (под паролем),
API `/api`. Всё закрыто от поисковиков. HTTPS и домен добавим позже.

Стек: Ubuntu 26.04, Docker (Postgres + MinIO), Fastify под PM2, Nginx.

Все команды выполняешь по SSH на сервере под root (или через `sudo`).
Копируй блоки по одному и присылай мне вывод, если где-то ошибка.

---

## 0. Подключение
```bash
ssh root@147.45.157.11
```

## 1. Базовые пакеты (Node 20, Docker, Nginx, PM2, утилиты)
```bash
apt update && apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Docker + compose plugin
apt install -y docker.io docker-compose-v2
systemctl enable --now docker

# Nginx + утилита для пароля админки (htpasswd) + git
apt install -y nginx apache2-utils git

# PM2 глобально
npm install -g pm2

# Проверка версий
node -v && docker --version && nginx -v && pm2 -v
```

## 2. Забрать код
```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/1Herman1/project_simba.git simba-src
cd simba-src
git checkout claude/greeting-nnz368
```

## 3. Секреты и .env сервера
```bash
# Сгенерировать два случайных пароля/секрета — СОХРАНИ их себе:
openssl rand -hex 32   # это JWT_SECRET
openssl rand -hex 16   # это пароль БД (POSTGRES_PASSWORD)
openssl rand -hex 16   # это пароль MinIO (MINIO_PASSWORD)

# Создать server/.env из шаблона и отредактировать
cp deploy/env.production.example server/.env
nano server/.env
# Впиши: DATABASE_URL с паролем БД, JWT_SECRET, MINIO_SECRET_KEY,
# и (когда будет почта) SMTP_*. Сохрани Ctrl+O, выход Ctrl+X.
```

## 4. Поднять базу и хранилище (Docker)
```bash
# Экспортировать пароли для compose (те же, что в server/.env)
export POSTGRES_PASSWORD='ПАРОЛЬ_БД'
export MINIO_PASSWORD='ПАРОЛЬ_MINIO'

docker compose -f deploy/docker-compose.prod.yml up -d
docker ps   # должны крутиться simba-src-postgres-1 и simba-src-minio-1
```

## 5. Установить зависимости и собрать
```bash
# Зависимости всех воркспейсов
npm install

# Prisma: сгенерировать клиент и применить схему к БД
cd server
npx prisma generate
npx prisma migrate deploy || npx prisma db push
cd ..

# Сборка сервера
npm run build --workspace=server

# Сборка фронтов с адресом API (наш IP)
VITE_API_URL=http://147.45.157.11 npm run build --workspace=client
VITE_API_URL=http://147.45.157.11 npm run build --workspace=admin
```

## 6. Разложить статику для Nginx
```bash
mkdir -p /var/www/simba/client /var/www/simba/admin
cp -r client/dist/* /var/www/simba/client/
cp -r admin/dist/*  /var/www/simba/admin/
```

## 7. Запустить сервер под PM2
```bash
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup   # выполни команду, которую он выведет, чтобы автозапуск после ребута
pm2 logs simba-server --lines 20   # проверить что стартовал без ошибок
```

## 8. Настроить Nginx
```bash
# Пароль на админку (замени admin на свой логин, задаст пароль интерактивно)
htpasswd -c /etc/nginx/.htpasswd-simba admin

# Подключить наш конфиг
cp deploy/nginx-simba.conf /etc/nginx/sites-available/simba
ln -sf /etc/nginx/sites-available/simba /etc/nginx/sites-enabled/simba
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
```

## 9. Firewall (закрыть всё лишнее)
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable
ufw status   # 5432/9000 наружу быть НЕ должно (они на 127.0.0.1)
```

## 10. Проверка
```bash
curl -I http://127.0.0.1:3000/api/products/list   # сервер отвечает
curl -I http://147.45.157.11/                      # магазин (200)
curl -I http://147.45.157.11/robots.txt            # Disallow /
```
В браузере:
- `http://147.45.157.11/` — магазин
- `http://147.45.157.11/admin` — спросит логин/пароль (из шага 8)
- Заголовок ответа должен содержать `X-Robots-Tag: noindex` — сайт закрыт от поиска.

---

## Обновление (при новых изменениях в ветке)
```bash
cd /var/www/simba-src
git pull origin claude/greeting-nnz368
npm install                                   # линкует воркспейсы, в т.ч. shared
cd server && npx prisma migrate deploy        # применяет новые миграции
npx prisma generate                           # обязательно: иначе tsc не увидит новые модели
npm run build && cd ..
npm run build --workspace=client
npm run build --workspace=admin
rm -rf /var/www/simba/client/* /var/www/simba/admin/*   # старая сборка остаётся, если не удалить
cp -r client/dist/* /var/www/simba/client/
cp -r admin/dist/*  /var/www/simba/admin/
pm2 reload simba-server
```

Порядок обязателен: **схема → prisma generate → сборка → рестарт**. Наоборот нельзя —
код с новым клиентом на старой базе падает на каждом запросе.

Проверка после обновления:
```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/products/list   # 200
pm2 logs simba-server --lines 20 --nostream                                          # без ошибок запуска
grep -rl "localhost:3000" /var/www/simba/client /var/www/simba/admin                 # пусто
```

### Адрес API вшивается в сборку
`VITE_API_URL` читается на этапе сборки, не в рантайме. Он лежит в `client/.env` и
`admin/.env` на сервере. Если файла нет, подставится `http://localhost:3000`, сайт
соберётся без ошибок и будет выглядеть рабочим — но браузер посетителя будет стучаться
сам в себя, и вход в админку отвалится с «Ошибка входа». Проверять командой с `grep` выше.

### Резервная копия перед изменениями схемы
```bash
docker exec deploy-postgres-1 pg_dump -U simba simba > ~/simba-backup-$(date +%F-%H%M).sql
ls -lh ~/simba-backup-*.sql        # размер не должен быть нулевым
```
`pg_dump` в системе не установлен — работать только через контейнер `deploy-postgres-1`.

### Миграции: только migrate deploy, никогда db push
`prisma db push` на проде запрещён: он сравнивает схему целиком, решает сам и может
сделать больше, чем вы ожидаете, без предварительного показа. Если база и схема разошлись
— сначала посмотреть разницу, потом применять:
```bash
cd /var/www/simba-src/server
set -a; . ./.env; set +a
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script > /tmp/drift.sql
cat /tmp/drift.sql                # прочитать глазами: нет ли DROP
docker exec -i deploy-postgres-1 psql -U simba -d simba -v ON_ERROR_STOP=1 -1 < /tmp/drift.sql
```
Флаг `-1` выполняет всё одной транзакцией: при любой ошибке откатится целиком.

## Когда купишь домен simbazoo.ru
1. A-запись домена → 147.45.157.11.
2. В `nginx-simba.conf` добавить `server_name simbazoo.ru;`.
3. `apt install certbot python3-certbot-nginx && certbot --nginx -d simbazoo.ru` — бесплатный HTTPS.
4. Пересобрать фронты с `VITE_API_URL=https://simbazoo.ru`.
5. Снять noindex: убрать `add_header X-Robots-Tag ...` из Nginx, `<meta name="robots">` из client/index.html, и заменить robots.txt на разрешающий + sitemap.
6. Тогда же — подключить Google Search Console и Яндекс.Вебмастер (см. рекомендации SEO).
