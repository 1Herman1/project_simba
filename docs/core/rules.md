# Правила и соглашения

Доменные правила вынесены отдельно и читаются соответствующими ревьюерами:
- `docs/core/rules/react.md` — React (хуки, рендеры, компоненты) → `react-reviewer`
- `docs/core/rules/typescript.md` — TypeScript (типы, async, безопасность) → `typescript-reviewer`

## Именование

### Файлы и папки
- Компоненты React: `PascalCase.tsx` (`UserCard.tsx`)
- Хуки: `camelCase.ts` с префиксом `use` (`useAuth.ts`)
- Утилиты: `camelCase.ts` (`formatDate.ts`)
- Страницы (React Router): `PascalCase.tsx` в `client/src/pages/` (`CartPage.tsx`)
- API роуты (Fastify): по домену в `server/src/routes/` (`orders.ts`, `auth.ts`)
- Типы: `types.ts` или `*.types.ts`

### Переменные и функции
- Переменные и функции: `camelCase`
- Константы: `UPPER_SNAKE_CASE`
- Типы и интерфейсы: `PascalCase`
- Enum: `PascalCase`, значения `UPPER_SNAKE_CASE`

### База данных (Prisma)
- Таблицы: `PascalCase` (User, Organization, Subscription)
- Поля: `camelCase` (createdAt, userId, organizationId)
- Обязательные поля на каждой таблице: `id`, `createdAt`, `updatedAt`
- Soft delete: `deletedAt DateTime?`

## Структура компонента

```tsx
// 1. Импорты (внешние → внутренние)
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

// 2. Типы
interface Props {
  userId: string
  onSuccess: () => void
}

// 3. Компонент
export function UserCard({ userId, onSuccess }: Props) {
  // 3.1 Хуки
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // 3.2 Обработчики
  async function handleSubmit() {
    setLoading(true)
    try {
      await doSomething(userId)
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  // 3.3 Рендер
  return (
    <div>
      <Button onClick={handleSubmit} disabled={loading}>
        Submit
      </Button>
    </div>
  )
}
```

## API роуты (Fastify)

```typescript
// server/src/routes/users.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function userRoutes(server: FastifyInstance) {
  // preHandler: [authenticate] — проверка JWT до входа в хендлер
  server.patch('/users/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ success: false, error: parsed.error.flatten() })
    }

    // фильтр по req.user.userId — пользователь меняет только своё (защита от IDOR)
    const { id } = req.params as { id: string }
    if (id !== req.user.userId) {
      return reply.code(403).send({ success: false, error: 'Forbidden' })
    }

    const user = await updateUser(id, parsed.data)
    return reply.send({ success: true, data: user })
  })
}
```

Стандарт ответа API: `{ success: boolean, data?, error?, pagination? }`.

## Работа с БД

```typescript
// Всегда через абстракцию в server/src/services/
// Не писать Prisma запросы прямо в хендлерах роутов или компонентах

// server/src/services/users.ts
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, name: true, email: true, bonusPoints: true },
  })
}
```

## Переменные окружения

```
# .env (никогда не коммитить)
DATABASE_URL=            # postgresql://... (локальный Docker, не Supabase)
JWT_SECRET=              # секрет для подписи JWT
MINIO_ENDPOINT=          # хост MinIO
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=            # bucket для изображений товаров
OTP_TTL_SECONDS=         # срок жизни OTP-кода
# SMTP/SMS провайдер для отправки OTP (когда подключат)

# .env.example (коммитить — без значений)
DATABASE_URL=
JWT_SECRET=
MINIO_ENDPOINT=
...
```

## Обработка ошибок

- Не оборачивать в try/catch то что не может упасть
- На уровне API (Fastify): возвращать стандартные HTTP коды + `{ success: false, error }`
- На уровне UI: показывать toast / error state пользователю (три состояния: loading / error / data)
- В продакшне: логи через process manager проекта (см. `docs/projects/<проект>/project.md`)
- Пустой `catch {}` запрещён — либо обработать, либо пробросить (см. `silent-failure-hunter`)
