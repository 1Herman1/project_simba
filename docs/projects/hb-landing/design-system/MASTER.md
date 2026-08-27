# Дизайн-система: hb-landing (H&B team)

Источник истины по палитре, типографике и шкалам для `hb-landing/`.
Проверяется `design-lint.mjs`. Переопределения страниц — `pages/*.md` (приоритетнее).

## Mood

`личное, но собранное` · `крупный чистый гротеск` · `светлый воздух` ·
`инженерная точность` · `дружелюбный эксперт` · `тёплый терракотовый акцент`

## Палитра

| Токен | HEX | on-цвет | Контраст | Назначение |
|---|---|---|---|---|
| `background` | `#FAFAF8` | `foreground` | ~15.9:1 | Фон страницы, тёплый почти-белый |
| `foreground` | `#191B1F` | — | — | Основной текст (НЕ чистый #000) |
| `surface` | `#FFFFFF` | `foreground` | ~16.5:1 | Карточки кейсов/услуг |
| `muted` | `#F1EFEA` | `muted-foreground` | ≥5:1 | Теги-чипы, вторичные плашки |
| `muted-foreground` | `#545962` | — | ~6.3:1 на background | Подписи, вторичный текст |
| `accent` | `#C2410C` | `#FFFFFF` (5.2:1) | 5.0:1 на background | Кнопки, ссылки, слэш в слогане |
| `accent-hover` | `#9A3412` | `#FFFFFF` | — | Hover кнопок |
| `dark` | `#14161A` | `#F4F4F1` (~15:1) | — | Оверлей видео-баннера, футер |
| `on-dark` | `#F4F4F1` | — | — | Текст на тёмной зоне |
| `line` | `#E8E6E1` | — | — | 1px разделители, бордеры карточек |

Запрещено: purple-blue градиенты, чистый `#000`, серый текст с контрастом < 4.5:1,
тёмные «глоу»-свечения.

## Типографика

Пара «Grotesk Bold» из `docs/core/typography-pairs.md` (кириллица подтверждена):

- **Заголовки:** Montserrat Variable, веса 700/800 — `@fontsource-variable/montserrat`
- **Текст:** Open Sans Variable, веса 400/600 — `@fontsource-variable/open-sans`
- Подключение локально через fontsource (без внешних запросов); проверить, что
  cyrillic-сабсет попал в бандл
- Fallback-стек: `system-ui, -apple-system, "Segoe UI", sans-serif` — слово
  «Inter» не должно встречаться нигде, даже в fallback

Шкала:
- h1 (hero): `clamp(2.75rem, 7vw, 5.5rem)`, Montserrat 800
- Слоган баннера: Montserrat 800, uppercase, `clamp(3rem, 10vw, 9rem)`
- h2 секций: `clamp(2rem, 4vw, 3.25rem)`, Montserrat 700
- h3 карточек: `1.375rem`, Montserrat 700
- body: `1.125rem / 1.7`, Open Sans 400
- подписи/теги: `0.875rem`, Open Sans 600
- Строки текста ≤ 70 символов (`max-w-[65ch]`)
- Цифры метрик: `tabular-nums`

## Отступы и сетка

- Секции: `py-24` мобайл → `py-32` десктоп (VISUAL_DENSITY=3)
- Контейнер: `max-w-6xl mx-auto px-5 md:px-8`
- Нумерация секций «01 / Услуги» — редакционный приём, Montserrat 700,
  `muted-foreground`

## Форма и глубина

- Радиусы: карточки 16px, кнопки 12px (не full)
- Тени почти нет: глубина через `border: 1px solid line` + hover-подъём
  `translateY(-2px)` 200ms ease-out
- Никаких карточек-в-карточках, никаких боковых полосок-бордеров как декора

## Motion

- Hover: 200ms ease-out
- Появление секций: fade + translateY(8px), stagger 60ms, только CSS
- `prefers-reduced-motion: reduce` глушит всё, включая автоплей видео-баннера
  (показывается постер)
- Запрещено: bounce/elastic easing, scroll-driven анимации

## Компоненты

- **Button**: primary (accent, on-accent #FFF) / ghost (border line, foreground)
- **Tag**: чип `muted` + `muted-foreground`, radius 8px
- **SectionTitle**: номер «0N /» + заголовок h2
- **CaseCard**: обложка 16:10 → заголовок → теги → `<details>`-раскрытие
  «Задача / Решение / Результат»
- **ContactDialog**: нативный `<dialog>`, 3 строки-ссылки ≥ 44px
- Тач-таргеты везде ≥ 44×44px

## Медиа-стиль (для media-generator)

- Обложки кейсов: 1600×1000 (16:10), единая серия — абстрактная
  предметно-графическая композиция на светлом фоне `#FAFAF8` в палитре проекта,
  без людей крупным планом, без стоковых 3D-рендеров, без текста
- Видео баннера: 1920×1080, 10–15 с бесшовный луп, тёмное, малоконтрастное
  (поверх крупная белая типографика), без текста/людей/логотипов
