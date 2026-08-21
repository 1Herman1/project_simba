import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { searchStaticIconSchema, searchStaticIconHandler } from "./tools/searchStaticIcon.js";
import { getStaticIconSvgSchema, getStaticIconSvgHandler } from "./tools/getStaticIconSvg.js";
import { listIconSetsSchema, listIconSetsHandler } from "./tools/listIconSets.js";
import { searchAnimatedIconSchema, searchAnimatedIconHandler } from "./tools/searchAnimatedIcon.js";
import { getAnimatedIconJsonSchema, getAnimatedIconJsonHandler } from "./tools/getAnimatedIconJson.js";

const server = new McpServer({
  name: "icon-library",
  version: "0.1.0",
});

server.registerTool(
  "search_static_icon",
  {
    title: "Поиск статичной иконки",
    description:
      "Ищет SVG-иконки по смыслу через Iconify (300k+ иконок, 200+ открытых наборов, MIT/Apache). " +
      "Возвращает список кандидатов с набором и лицензией — дальше get_static_icon_svg за конкретной.",
    inputSchema: searchStaticIconSchema,
  },
  searchStaticIconHandler,
);

server.registerTool(
  "get_static_icon_svg",
  {
    title: "Получить SVG иконки",
    description: "Отдаёт сырой SVG-текст конкретной иконки по prefix/name из Iconify.",
    inputSchema: getStaticIconSvgSchema,
  },
  getStaticIconSvgHandler,
);

server.registerTool(
  "list_icon_sets",
  {
    title: "Список наборов иконок",
    description:
      "Доступные наборы Iconify с лицензиями — для фильтрации на MIT/Apache-совместимые " +
      "или чтобы найти набор, совпадающий по стилю с уже используемым в проекте.",
    inputSchema: listIconSetsSchema,
  },
  listIconSetsHandler,
);

server.registerTool(
  "search_animated_icon",
  {
    title: "Поиск анимированной иконки (Lottie)",
    description:
      "Ищет анимации через LottieFiles (бесплатные публичные, Lottie Simple License — коммерческое " +
      "использование без атрибуции). ВНИМАНИЕ: интеграция не проверена на живом API, см. clients/lottiefiles.ts.",
    inputSchema: searchAnimatedIconSchema,
  },
  searchAnimatedIconHandler,
);

server.registerTool(
  "get_animated_icon_json",
  {
    title: "Получить Lottie JSON",
    description:
      "Отдаёт сырой Lottie JSON анимации по id из search_animated_icon. " +
      "ВНИМАНИЕ: интеграция не проверена на живом API, см. clients/lottiefiles.ts.",
    inputSchema: getAnimatedIconJsonSchema,
  },
  getAnimatedIconJsonHandler,
);

const transport = new StdioServerTransport();
await server.connect(transport);
