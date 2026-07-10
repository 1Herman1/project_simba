# Правила TypeScript — проект Симба

Стек: Fastify + Node.js + TypeScript + Prisma

## Обязательные правила

### Типы
- Никакого `any` — использовать `unknown` с сужением типов или конкретный тип
- `interface` для расширяемых объектов (модели, пропсы)
- `type` для union/intersection: `type Status = 'active' | 'inactive'`
- Zod для runtime-валидации входящих данных на роутах

### Async/Await
- Никогда не использовать `await` внутри цикла — заменять на `Promise.all()`
- Каждый async вызов должен быть обёрнут в try/catch или иметь `.catch()`
- Не создавать `async` функции без `await` внутри

### Безопасность
- `process.env` для всех конфигурационных значений — никаких хардкодов
- Никогда не передавать пользовательский ввод напрямую в SQL или shell-команды
- `JSON.parse` всегда в try/catch

### Качество
- `console.log` и `console.error` запрещены в продакшн коде — только логгер
- Неиспользуемые импорты удалять
- Экспортировать только то что реально используется снаружи

## Паттерны для Fastify

### Стандартный формат API-ответа
Все роуты возвращают единый формат:
```typescript
// Успех
{ success: true, data: T }

// Список с пагинацией
{ success: true, data: T[], pagination: { total: number, page: number, limit: number } }

// Ошибка
{ success: false, error: string }
```

### Валидация входных данных
```typescript
// Всегда использовать Zod-схему в начале роута
const schema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})
const body = schema.parse(req.body)
```

## Чеклист перед коммитом TypeScript-файлов
- [ ] Нет `any` в коде
- [ ] Нет `console.log` вне dev-режима
- [ ] Все async вызовы обработаны
- [ ] Пользовательский ввод провалидирован через Zod
- [ ] Нет хардкодов паролей/ключей/URL окружения
