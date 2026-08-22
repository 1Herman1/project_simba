// Клиент Iconify — сначала локальные npm-пакеты @iconify-json/<набор> (см.
// localIconify.ts, не требуют сети), сеть на api.iconify.design — как
// расширение покрытия сверх установленных локально наборов. См. ADR-003.
import { fetchWithTimeout } from "./net.js";
import {
  searchLocalIcon,
  getLocalIconSvg,
  listLocalIconSets,
  isSetInstalledLocally,
} from "./localIconify.js";

const BASE_URL = "https://api.iconify.design";

export type IconSearchResult = {
  prefix: string;
  name: string;
  set: string;
  license: string;
};

type IconifySearchResponse = {
  icons: string[]; // формат "prefix:name"
  collections?: Record<string, { name?: string; license?: { title?: string } }>;
};

type IconifyCollectionsResponse = Record<
  string,
  { name?: string; license?: { title?: string; spdx?: string } }
>;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    // Iconify — публичный API без ключа: у него почти нет легитимных причин
    // отдать 403/407. На практике это почти всегда сетевая блокировка между
    // нами и Iconify (прокси/файрвол/песочница), а не отказ самого сервиса.
    const hint =
      res.status === 403 || res.status === 407
        ? " У Iconify нет ключа доступа, поэтому такой статус обычно означает " +
          "блокировку сети, а не отказ Iconify — проверь доступность api.iconify.design из этой среды."
        : "";
    throw new Error(`Iconify API ${res.status} ${res.statusText} — ${url}.${hint}`);
  }
  return res.json() as Promise<T>;
}

async function searchStaticIconNetwork(
  query: string,
  set?: string,
  limit = 20,
): Promise<IconSearchResult[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  if (set) params.set("prefix", set);

  const data = await fetchJson<IconifySearchResponse>(
    `${BASE_URL}/search?${params.toString()}`,
  );

  const collections = data.collections ?? {};
  return (data.icons ?? []).map((full) => {
    const [prefix, name] = full.split(":");
    const meta = collections[prefix];
    return {
      prefix,
      name,
      set: meta?.name ?? prefix,
      license: meta?.license?.title ?? "неизвестна — проверить в list_icon_sets",
    };
  });
}

export async function searchStaticIcon(
  query: string,
  set?: string,
  limit = 20,
): Promise<IconSearchResult[]> {
  const local = searchLocalIcon(query, set, limit);
  if (local.length > 0) return local;

  // Локально либо нет совпадений, либо запрошенный набор не установлен —
  // расширяем поиск на живой API. Если сеть недоступна, честная ошибка сети
  // долетит до вызывающего — это ожидаемо для наборов вне локального покрытия.
  return searchStaticIconNetwork(query, set, limit);
}

export async function getStaticIconSvg(prefix: string, name: string): Promise<string> {
  if (isSetInstalledLocally(prefix)) {
    const svg = getLocalIconSvg(prefix, name);
    if (svg) return svg;
    throw new Error(
      `Иконка "${name}" не найдена в локально установленном наборе "${prefix}". ` +
        `Проверь имя через search_static_icon — набор точно установлен, значит имя просто другое.`,
    );
  }

  const res = await fetchWithTimeout(`${BASE_URL}/${prefix}/${name}.svg`);
  if (!res.ok) {
    throw new Error(
      `Иконка не найдена: ${prefix}:${name} (Iconify ${res.status}). Проверь имя через search_static_icon.`,
    );
  }
  return res.text();
}

export async function listIconSets(
  category?: string,
): Promise<{ prefix: string; name: string; license: string }[]> {
  const local = listLocalIconSets();
  try {
    const data = await fetchJson<IconifyCollectionsResponse>(
      `${BASE_URL}/collections${category ? `?category=${encodeURIComponent(category)}` : ""}`,
    );
    const network = Object.entries(data).map(([prefix, meta]) => ({
      prefix,
      name: meta.name ?? prefix,
      license: meta.license?.spdx ?? meta.license?.title ?? "не указана",
    }));
    const localPrefixes = new Set(local.map((s) => s.prefix));
    return [...local, ...network.filter((s) => !localPrefixes.has(s.prefix))];
  } catch {
    // Сеть недоступна — у нас всё равно есть реальные локальные наборы,
    // отдать их, а не падать целиком.
    return local;
  }
}
