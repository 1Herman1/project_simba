# Шрифтовые пары (проверенные, с кириллицей)

Универсальная база. Закрывает anti-reference «дефолтный/системный шрифт как
бренд-шрифт»: запрещать дефолт мало — нужна готовая замена.

## Правило №1: проверка кириллицы

Мировые каталоги font-pairing по умолчанию **латинские**. Для русскоязычного
продукта это блокирующий фильтр: часть популярных рекомендаций (Plus Jakarta
Sans, Figtree, Sora) кириллицу **не поддерживает** — текст свалится в системный
фолбэк, и вся типографика развалится.

Перед выбором шрифта:
1. Проверить наличие сабсета `cyrillic` / `cyrillic-ext` на fonts.google.com.
2. Предпочитать **variable**-шрифты — одна загрузка вместо 4 файлов весов.
3. Подключать с `display=swap`, только нужные веса.

---

## Проверенные пары

Все пары ниже поддерживают кириллицу.

| Пара | Заголовок / Текст | Настроение | Для чего |
|---|---|---|---|
| **E-commerce Clean** | Rubik / Nunito Sans | дружелюбный, чёткий | Магазины, страницы товара, конверсия |
| **Warm Retail** | Nunito / Nunito Sans | тёплый, мягкий, человечный | Товары для дома, дети, питомцы |
| **Corporate Trust** | Lexend / Source Sans 3 | спокойный, надёжный, доступный | Финансы, медицина, госуслуги |
| **Editorial** | Playfair Display / Inter | элегантный, редакционный | Люкс, лонгриды, премиум-товар |
| **Modern Neutral** | Manrope / Inter | современный, нейтральный | SaaS, дашборды, продуктовые сайты |
| **Dev Tools** | JetBrains Mono / IBM Plex Sans | технический, точный | Документация, dev-инструменты |
| **Grotesk Bold** | Montserrat / Open Sans | уверенный, широкий | Лендинги, промо, инфопродукты |
| **Compact UI** | Golos Text / Golos Text | утилитарный, плотный | Админки, таблицы, кокпиты |

**Table-цифры:** для цен, таблиц и таймеров включать `font-variant-numeric:
tabular-nums` (в Tailwind — `tabular-nums`), иначе числа «прыгают» при обновлении.

---

## Как подключать

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;600;700&family=Nunito+Sans:wght@400;600&display=swap" rel="stylesheet">
```

```ts
// tailwind.config.ts
fontFamily: {
  heading: ['Rubik', 'system-ui', 'sans-serif'],
  sans: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
}
```

Правила:
- Подключать **только через `<link>` в HTML**, не через `@import` в CSS —
  `@import` блокирует рендер и создаёт последовательный запрос.
- `preconnect` нужен к **обоим** хостам: `fonts.googleapis.com` (CSS) и
  `fonts.gstatic.com` (сами файлы шрифта).
- Не подключать больше 2 семейств и не больше 3–4 весов суммарно.
