// Локальный источник Iconify-иконок — читает данные из установленных
// npm-пакетов @iconify-json/<набор>, без единого сетевого запроса.
//
// Зачем: api.iconify.design бывает недоступен из-за сетевой политики среды
// (см. ADR-003). registry.npmjs.org почти всегда доступен — Iconify публикует
// свои наборы как обычные npm-пакеты (IconifyJSON: тела SVG + метаданные),
// поэтому это надёжный путь по умолчанию. Живой API (iconify.ts) остаётся
// как расширение покрытия сверх установленных локально наборов.
import { createRequire } from "node:module";
import { getIconData, iconToSVG, iconToHTML } from "@iconify/utils";
import type { IconifyJSON } from "@iconify/types";
import type { IconSearchResult } from "./iconify.js";

const require = createRequire(import.meta.url);

// Наборы, установленные как зависимости этого пакета. Добавить ещё один —
// npm install @iconify-json/<name> сюда же и дописать его prefix в список.
const INSTALLED_SETS = ["lucide"] as const;

function loadSet(prefix: string): IconifyJSON | null {
  try {
    return require(`@iconify-json/${prefix}/icons.json`) as IconifyJSON;
  } catch {
    return null;
  }
}

function loadLicense(prefix: string): string {
  try {
    const pkg = require(`@iconify-json/${prefix}/package.json`) as { license?: string };
    return pkg.license ?? "не указана";
  } catch {
    return "не указана";
  }
}

// Разбиваем запрос на слова, а не ищем его как единую подстроку — иначе
// "shopping cart" (с пробелом) не совпадёт с именем иконки "shopping-cart"
// (с дефисом), хотя по смыслу это тот же запрос.
function matchesQuery(name: string, tokens: string[]): boolean {
  const haystack = name.toLowerCase().replace(/-/g, " ");
  return tokens.every((t) => haystack.includes(t));
}

export function searchLocalIcon(
  query: string,
  set?: string,
  limit = 20,
): IconSearchResult[] {
  const tokens = query.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean);
  const sets = set ? INSTALLED_SETS.filter((s) => s === set) : INSTALLED_SETS;
  const results: IconSearchResult[] = [];

  for (const prefix of sets) {
    const data = loadSet(prefix);
    if (!data) continue;
    const license = loadLicense(prefix);
    for (const name of Object.keys(data.icons)) {
      if (results.length >= limit) break;
      if (matchesQuery(name, tokens)) {
        results.push({ prefix, name, set: prefix, license });
      }
    }
    if (results.length >= limit) break;
  }

  return results;
}

export function getLocalIconSvg(prefix: string, name: string): string | null {
  const data = loadSet(prefix);
  if (!data) return null;
  const iconData = getIconData(data, name);
  if (!iconData) return null;
  const rendered = iconToSVG(iconData, { height: "auto" });
  return iconToHTML(rendered.body, rendered.attributes);
}

export function listLocalIconSets(): { prefix: string; name: string; license: string }[] {
  return INSTALLED_SETS.map((prefix) => {
    const pkg = require(`@iconify-json/${prefix}/package.json`) as {
      description?: string;
      license?: string;
    };
    return {
      prefix,
      name: pkg.description ?? prefix,
      license: pkg.license ?? "не указана",
    };
  });
}

export function isSetInstalledLocally(prefix: string): boolean {
  return (INSTALLED_SETS as readonly string[]).includes(prefix);
}
