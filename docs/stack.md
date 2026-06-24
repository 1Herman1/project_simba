# Технологический стек

Обновляй этот файл при добавлении/замене технологий в проектах.

## Текущий стек по умолчанию

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
