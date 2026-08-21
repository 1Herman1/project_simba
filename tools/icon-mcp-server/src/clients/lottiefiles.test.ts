import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { searchAnimatedIcon, getAnimatedIconJson } from "./lottiefiles.js";

const realFetch = globalThis.fetch;
const realKey = process.env.LOTTIEFILES_API_KEY;

let calls: { url: string; headers: Record<string, string> }[] = [];

function mockFetch(response: { ok?: boolean; status?: number; statusText?: string; jsonBody?: unknown; textBody?: string }) {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), headers: (init?.headers ?? {}) as Record<string, string> });
    return {
      ok: response.ok ?? true,
      status: response.status ?? 200,
      statusText: response.statusText ?? "OK",
      json: async () => response.jsonBody,
      text: async () => response.textBody ?? "",
    } as unknown as Response;
  }) as typeof fetch;
}

beforeEach(() => {
  calls = [];
  process.env.LOTTIEFILES_API_KEY = "test-key";
});

afterEach(() => {
  globalThis.fetch = realFetch;
  if (realKey === undefined) delete process.env.LOTTIEFILES_API_KEY;
  else process.env.LOTTIEFILES_API_KEY = realKey;
});

describe("авторизация", () => {
  test("без ключа не ходит в сеть и объясняет, где взять ключ", async () => {
    delete process.env.LOTTIEFILES_API_KEY;
    mockFetch({ jsonBody: { results: [] } });

    await assert.rejects(() => searchAnimatedIcon("checkmark"), /LOTTIEFILES_API_KEY/);
    assert.equal(calls.length, 0);
  });

  test("ключ уходит Bearer-заголовком", async () => {
    mockFetch({ jsonBody: { results: [] } });

    await searchAnimatedIcon("checkmark");

    assert.equal(calls[0].headers.Authorization, "Bearer test-key");
  });
});

describe("searchAnimatedIcon", () => {
  test("нормализует результаты и подставляет лицензию по умолчанию", async () => {
    mockFetch({
      jsonBody: {
        results: [
          { id: "1", name: "Check", previewUrl: "https://x/1.gif" },
          { id: "2", name: "Loader", previewUrl: "https://x/2.gif", license: "MIT" },
        ],
      },
    });

    const res = await searchAnimatedIcon("check");

    assert.equal(res.length, 2);
    assert.match(res[0].license, /Lottie Simple License/);
    assert.equal(res[1].license, "MIT");
  });

  test("не падает, когда в ответе нет results", async () => {
    mockFetch({ jsonBody: {} });

    assert.deepEqual(await searchAnimatedIcon("check"), []);
  });

  test("HTTP-ошибка указывает, какой файл править", async () => {
    mockFetch({ ok: false, status: 401, statusText: "Unauthorized" });

    await assert.rejects(() => searchAnimatedIcon("check"), /clients\/lottiefiles\.ts/);
  });
});

describe("getAnimatedIconJson", () => {
  test("экранирует id в пути", async () => {
    mockFetch({ textBody: "{}" });

    await getAnimatedIconJson("a b/c");

    assert.ok(calls[0].url.endsWith("/animations/a%20b%2Fc/download"));
  });

  test("HTTP-ошибка называет запрошенный id", async () => {
    mockFetch({ ok: false, status: 404, statusText: "Not Found" });

    await assert.rejects(() => getAnimatedIconJson("zzz"), /zzz/);
  });
});
