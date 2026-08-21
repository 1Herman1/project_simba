# icon-mcp-server

MCP-сервер для поиска и получения иконок. Только легитимные бесплатные
официальные API — без скрейпинга, без Flaticon (их ToS прямо запрещает
автоматический доступ).

- **Статичные SVG** — [Iconify](https://iconify.design/docs/api/), публичный
  API без ключа, 300k+ иконок из 200+ открытых наборов (Lucide, Heroicons,
  Feather, Tabler и др.), лицензии MIT/Apache. Проверено рабочим.
- **Анимации** — [LottieFiles](https://developers.lottiefiles.com/),
  бесплатные публичные анимации под Lottie Simple License (коммерческое
  использование без атрибуции). ⚠️ Не проверено на живом API из-за сетевых
  ограничений сборочной среды — см. предупреждение в `src/clients/lottiefiles.ts`.

## Установка

```bash
cd tools/icon-mcp-server
npm install
cp .env.example .env   # заполнить LOTTIEFILES_API_KEY, если нужны анимации
```

## Запуск (руками, для проверки)

```bash
npm start
```

Обычно сервер не запускают руками — Claude Code сам поднимает его по
`.mcp.json` в корне репозитория как stdio-процесс.

## Если `search_animated_icon`/`get_animated_icon_json` падают

Это ожидаемо при первом реальном использовании — эндпоинты в
`src/clients/lottiefiles.ts` не были проверены вживую. Сверься с
https://developers.lottiefiles.com/docs, поправь `BASE_URL` и/или
`authHeaders()` в этом файле — больше нигде трогать не нужно.

## Инструменты

| Инструмент | Источник | Что делает |
|---|---|---|
| `search_static_icon` | Iconify | Поиск SVG-иконок по смыслу |
| `get_static_icon_svg` | Iconify | Сырой SVG конкретной иконки |
| `list_icon_sets` | Iconify | Наборы иконок с лицензиями |
| `search_animated_icon` | LottieFiles | Поиск Lottie-анимаций |
| `get_animated_icon_json` | LottieFiles | Сырой Lottie JSON |
