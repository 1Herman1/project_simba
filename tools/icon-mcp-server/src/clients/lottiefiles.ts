// Клиент LottieFiles — официальный Developer Portal, бесплатные публичные
// анимации под Lottie Simple License (коммерческое использование без
// атрибуции). https://developers.lottiefiles.com/
//
// ⚠️ НЕ ПРОВЕРЕНО НА ЖИВОМ API. Эта сборка писалась в песочнице, которой
// организационная политика запрещает исходящие соединения на
// developers.lottiefiles.com (403 policy denial на уровне egress-прокси) —
// проверить точный путь эндпоинтов и формат авторизации напрямую было
// невозможно. Ниже — эндпоинты по документированной структуре их публичного
// API на момент написания. Если при первом реальном вызове получишь 404/401 —
// свериться с https://developers.lottiefiles.com/docs и поправить BASE_URL /
// заголовок авторизации здесь, это единственное место, которое это трогает.

import { fetchWithTimeout } from "./net.js";

const BASE_URL = "https://api.lottiefiles.com/v1";

export type LottieSearchResult = {
  id: string;
  name: string;
  previewUrl: string;
  license: string;
};

function authHeaders(): Record<string, string> {
  const key = process.env.LOTTIEFILES_API_KEY;
  if (!key) {
    throw new Error(
      "LOTTIEFILES_API_KEY не задан. Бесплатный ключ — на developers.lottiefiles.com. " +
        "Положи его в tools/icon-mcp-server/.env (см. .env.example).",
    );
  }
  return { Authorization: `Bearer ${key}` };
}

export async function searchAnimatedIcon(
  query: string,
  limit = 20,
): Promise<LottieSearchResult[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  const res = await fetchWithTimeout(`${BASE_URL}/search?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(
      `LottieFiles API ${res.status} ${res.statusText} — эндпоинт/авторизация не подтверждены из этой сборки, ` +
        `сверься с developers.lottiefiles.com/docs и поправь clients/lottiefiles.ts`,
    );
  }
  const data = (await res.json()) as {
    results?: { id: string; name: string; previewUrl: string; license?: string }[];
  };
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    previewUrl: r.previewUrl,
    license: r.license ?? "Lottie Simple License (бесплатные публичные анимации)",
  }));
}

export async function getAnimatedIconJson(id: string): Promise<string> {
  const res = await fetchWithTimeout(`${BASE_URL}/animations/${encodeURIComponent(id)}/download`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(
      `LottieFiles API ${res.status} ${res.statusText} для id="${id}" — эндпоинт не подтверждён из этой сборки, ` +
        `сверься с developers.lottiefiles.com/docs`,
    );
  }
  return res.text();
}
