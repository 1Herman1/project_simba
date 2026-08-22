// Клиент Iconify — публичный REST API, без ключа, официально предназначен
// для программного доступа. https://iconify.design/docs/api/
import { fetchWithTimeout } from "./net.js";

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

export async function searchStaticIcon(
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

export async function getStaticIconSvg(
  prefix: string,
  name: string,
): Promise<string> {
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
  const data = await fetchJson<IconifyCollectionsResponse>(
    `${BASE_URL}/collections${category ? `?category=${encodeURIComponent(category)}` : ""}`,
  );
  return Object.entries(data).map(([prefix, meta]) => ({
    prefix,
    name: meta.name ?? prefix,
    license: meta.license?.spdx ?? meta.license?.title ?? "не указана",
  }));
}
