# Правила и соглашения

## Именование

### Файлы и папки
- Компоненты React: `PascalCase.tsx` (`UserCard.tsx`)
- Хуки: `camelCase.ts` с префиксом `use` (`useAuth.ts`)
- Утилиты: `camelCase.ts` (`formatDate.ts`)
- Страницы (App Router): `page.tsx`, `layout.tsx`, `loading.tsx`
- API роуты: `route.ts` в папке с именем эндпоинта
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

## API роуты (Next.js)

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = schema.safeParse(body)
  if (!data.success) return NextResponse.json({ error: data.error }, { status: 400 })

  const user = await updateUser(params.id, data.data)
  return NextResponse.json(user)
}
```

## Работа с БД

```typescript
// Всегда через абстракцию в lib/db/
// Не писать Prisma запросы прямо в компонентах или API роутах

// lib/db/users.ts
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, name: true, email: true },
  })
}
```

## Переменные окружения

```
# .env.local (никогда не коммитить)
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=

# .env.example (коммитить — без значений)
DATABASE_URL=
NEXTAUTH_SECRET=
...
```

## Обработка ошибок

- Не оборачивать в try/catch то что не может упасть
- На уровне API: возвращать стандартные HTTP коды
- На уровне UI: показывать toast / error state пользователю
- В продакшне: логировать в Sentry
- В фоновых задачах: retry + алерт при исчерпании попыток
