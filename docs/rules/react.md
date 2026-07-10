# Правила React — проект Симба

Стек: React 18 + Vite + TypeScript + Tailwind CSS + React Router

## Обязательные правила

### Хуки
- `useEffect` всегда с массивом зависимостей — никогда без второго аргумента
- Не использовать индексы массива как `key` в списках — только уникальные id
- `useCallback`/`useMemo` только там где есть реальная проблема производительности
- Для фетчинга данных — не `useEffect`, а выделенные функции в `api.ts`

### Компоненты
- Один компонент = один файл
- Компонент не должен делать fetch и рендеринг одновременно — разделять на контейнер и представление
- Не использовать `dangerouslySetInnerHTML` с пользовательскими данными

### Состояние
- Не мутировать state напрямую — всегда spread: `{ ...prev, field: value }`
- Локальный state — `useState`, глобальный — Zustand или Context
- Не хранить в state то что можно вычислить из других данных

### Безопасность
- `dangerouslySetInnerHTML` запрещён без санитизации
- Не хранить токены в `localStorage` если можно избежать (XSS-риск)
- Открытые редиректы через `window.location = userInput` запрещены

## Паттерны

### Загрузка и ошибки
Каждый компонент с данными из API должен иметь три состояния:
```tsx
if (loading) return <Spinner />
if (error) return <ErrorMessage error={error} />
return <Content data={data} />
```

### Формы
```tsx
// Всегда обрабатывать ошибку отправки
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await api.submit(data)
  } catch (err) {
    setError('Ошибка отправки. Попробуйте снова.')
  }
}
```

## Чеклист перед коммитом .tsx файлов
- [ ] Все `useEffect` имеют массив зависимостей
- [ ] Нет индексов как ключей в списках
- [ ] Компонент показывает loading и error состояния
- [ ] Нет `dangerouslySetInnerHTML` с непроверенными данными
- [ ] Нет прямой мутации state
