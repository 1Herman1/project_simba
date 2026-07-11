# Технологический стек

Обновляй этот файл при добавлении/замене технологий в проектах.

---

## РЕАЛЬНЫЙ стек Симбы (simbazoo.ru)

> Это то, на чём написан текущий проект. Источник истины. Стек «по умолчанию»
> ниже — для НОВЫХ проектов Гермеса, а не для Симбы.

### Frontend (`client/` — магазин, `admin/` — панель)
| Категория | Технология |
|-----------|-----------|
| Framework | **React 18 + Vite** (SPA, НЕ Next.js) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router |
| State | Zustand / React Context |
| Forms | React Hook Form + Zod |

### Backend (`server/`)
| Категория | Технология |
|-----------|-----------|
| Runtime | Node.js |
| API | **Fastify** (роуты в `server/src/routes/**`) |
| ORM | Prisma |
| Validation | Zod |
| Auth | Свой **OTP** (email/SMS) + **JWT** (в localStorage) |
| Защита роутов | `preHandler: [authenticate]` |

### База данных и хранилище
| Категория | Технология |
|-----------|-----------|
| Primary | **PostgreSQL** (self-hosted в Docker) |
| Storage | **MinIO** (S3-совместимое) — изображения товаров |
| Cache/Queue | Redis НЕ подключён (нет в docker-compose) |

### Инфраструктура
| Категория | Технология |
|-----------|-----------|
| Hosting | **Timeweb VPS** |
| Process manager | **PM2** |
| Reverse proxy | **Nginx** |
| Деплой | `git pull` → `prisma migrate deploy` → сборка → `pm2 reload` |
| CI/CD | пока нет `.github/workflows/` |

### Чего в Симбе НЕТ (не предлагать без установки)
- Next.js, Vercel, Railway, Fly.io
- NextAuth.js, Clerk, Supabase, Neon
- Redis, BullMQ, Stripe (оплата пока не интегрирована)

---

## Текущий стек по умолчанию (для НОВЫХ проектов, НЕ для Симбы)

### Frontend
| Категория | Технология | Версия |
|-----------|-----------|--------|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |
| UI Kit | shadcn/ui | latest |
| State | Zustand | 4+ |
| Forms | React Hook Form + Zod | latest |
| Data fetching | TanStack Query | 5+ |

### Backend
| Категория | Технология | Версия |
|-----------|-----------|--------|
| Runtime | Node.js / Bun | 20+ / 1.0+ |
| API | Next.js API Routes | — |
| ORM | Prisma | 5+ |
| Validation | Zod | 3+ |
| Auth | NextAuth.js / Clerk | latest |
| Queue | BullMQ | 5+ |

### База данных
| Категория | Технология |
|-----------|-----------|
| Primary | PostgreSQL |
| Hosting | Supabase / Neon |
| Cache | Redis (Upstash) |
| Search | Postgres full-text / Meilisearch |

### Инфраструктура
| Категория | Технология |
|-----------|-----------|
| Frontend hosting | Vercel |
| Backend hosting | Railway / Fly.io |
| Storage | Supabase Storage |
| CDN | Vercel Edge / Cloudflare |
| CI/CD | GitHub Actions |
| Monitoring | Sentry (errors) + Vercel Analytics |
| Logging | Axiom / Logtail |

### Платежи и коммуникации
| Категория | Технология |
|-----------|-----------|
| Payments | Stripe |
| Email | Resend |
| SMS | Twilio (при необходимости) |
| Push | Telegram Bot API / OneSignal |

## Альтернативы (при необходимости)

- **Auth:** вместо NextAuth → Clerk (проще), или custom JWT
- **DB:** вместо PostgreSQL → MongoDB (если документоориентированная модель)
- **Hosting:** вместо Vercel → Coolify self-hosted
- **Queue:** вместо BullMQ → простой cron если задачи не критичны
