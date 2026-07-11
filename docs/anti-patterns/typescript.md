# Anti-patterns: TypeScript / Node.js (Симба)

Негативный список — то, к чему модель тянется по умолчанию и что в Симбе
делать НЕЛЬЗЯ. Работает по принципу Impeccable: отрицательные примеры сильнее
позитивного брифа. Читается `typescript-reviewer`; сверять находки с этим файлом.

Стек: Fastify + Node.js + TypeScript (strict) + Prisma. Роуты — `server/src/routes/**`.

## Типы
- ❌ `any` в любом виде → `unknown` с сужением или конкретный тип
- ❌ `as unknown as X`, двойное приведение для «замолчать» ошибку типов
- ❌ `@ts-ignore` / `@ts-expect-error` без комментария-обоснования
- ❌ Неявный `any` в параметрах (`function f(x) {}`) — при strict это ошибка сборки
- ❌ `Object`, `Function`, `{}` как типы — использовать точные

## Async / ошибки
- ❌ `.then()`/`.catch()`-цепочки → `async/await`
- ❌ Пустой `catch {}` или `catch (e) {}` без обработки — либо обработать, либо пробросить
- ❌ `await` в цикле по независимым задачам → `Promise.all`
- ❌ Промис без `await` и без `.catch` (unhandled rejection)
- ❌ Глотание ошибки через `.catch(() => null)` без причины (см. `silent-failure-hunter`)

## Валидация и границы
- ❌ Доверять `req.body`/`req.query`/`req.params` без Zod-валидации на роуте
- ❌ Валидировать глубоко внутри сервиса вместо границы (роут — единственная граница)
- ❌ `JSON.parse` внешних данных без try/catch

## Node.js / Fastify
- ❌ Синхронные `fs.*Sync` в обработчике запроса
- ❌ Хендлер-роут без `preHandler: [authenticate]` там, где нужна авторизация
- ❌ Прямые Prisma-запросы в хендлере — только через `server/src/services/**`
- ❌ Секрет/URL/ключ строкой в коде → `process.env` (см. anti-patterns/security.md)
