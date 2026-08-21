import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { searchStaticIcon, getStaticIconSvg, listIconSets } from "./iconify.js";

const realFetch = globalThis.fetch;

type Call = { url: string };
let calls: Call[] = [];

function mockFetch(response: Partial<Response> & { jsonBody?: unknown; textBody?: string }) {
  globalThis.fetch = (async (input: string | URL | Request) => {
    calls.push({ url: String(input) });
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
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("searchStaticIcon", () => {
  test("разбирает 'prefix:name' и подтягивает лицензию из collections", async () => {
    mockFetch({
      jsonBody: {
        icons: ["lucide:shopping-cart", "mdi:cart"],
        collections: {
          lucide: { name: "Lucide", license: { title: "ISC" } },
          mdi: { name: "Material Design Icons", license: { title: "Apache 2.0" } },
        },
      },
    });

    const res = await searchStaticIcon("cart");

    assert.deepEqual(res, [
      { prefix: "lucide", name: "shopping-cart", set: "Lucide", license: "ISC" },
      { prefix: "mdi", name: "cart", set: "Material Design Icons", license: "Apache 2.0" },
    ]);
  });

  test("не выдаёт лицензию за известную, если её нет в ответе", async () => {
    mockFetch({ jsonBody: { icons: ["foo:bar"] } });

    const [icon] = await searchStaticIcon("bar");

    assert.equal(icon.set, "foo");
    assert.match(icon.license, /неизвестна/);
  });

  test("фильтр по набору уходит в параметр prefix", async () => {
    mockFetch({ jsonBody: { icons: [] } });

    await searchStaticIcon("cart", "lucide", 30);

    const url = new URL(calls[0].url);
    assert.equal(url.pathname, "/search");
    assert.equal(url.searchParams.get("query"), "cart");
    assert.equal(url.searchParams.get("prefix"), "lucide");
    assert.equal(url.searchParams.get("limit"), "30");
  });

  test("без набора параметр prefix не отправляется", async () => {
    mockFetch({ jsonBody: { icons: [] } });

    await searchStaticIcon("cart");

    assert.equal(new URL(calls[0].url).searchParams.has("prefix"), false);
  });

  test("не падает, когда ответ без поля icons", async () => {
    mockFetch({ jsonBody: {} });

    const res = await searchStaticIcon("cart");

    assert.deepEqual(res, []);
  });

  test("HTTP-ошибка превращается в понятную ошибку со статусом", async () => {
    mockFetch({ ok: false, status: 403, statusText: "Forbidden" });

    await assert.rejects(() => searchStaticIcon("cart"), /403/);
  });
});

describe("getStaticIconSvg", () => {
  test("возвращает сырой SVG-текст", async () => {
    mockFetch({ textBody: "<svg viewBox=\"0 0 24 24\"></svg>" });

    const svg = await getStaticIconSvg("lucide", "shopping-cart");

    assert.match(svg, /^<svg/);
    assert.ok(calls[0].url.endsWith("/lucide/shopping-cart.svg"));
  });

  test("404 сообщает имя иконки и подсказывает следующий шаг", async () => {
    mockFetch({ ok: false, status: 404, statusText: "Not Found" });

    await assert.rejects(
      () => getStaticIconSvg("lucide", "nope"),
      /lucide:nope[\s\S]*search_static_icon/,
    );
  });
});

describe("listIconSets", () => {
  test("предпочитает spdx, иначе title, иначе явное 'не указана'", async () => {
    mockFetch({
      jsonBody: {
        lucide: { name: "Lucide", license: { title: "ISC License", spdx: "ISC" } },
        foo: { name: "Foo", license: { title: "Custom" } },
        bar: {},
      },
    });

    const sets = await listIconSets();

    assert.deepEqual(sets, [
      { prefix: "lucide", name: "Lucide", license: "ISC" },
      { prefix: "foo", name: "Foo", license: "Custom" },
      { prefix: "bar", name: "bar", license: "не указана" },
    ]);
  });

  test("категория уходит в query-параметр в закодированном виде", async () => {
    mockFetch({ jsonBody: {} });

    await listIconSets("General / UI");

    assert.equal(new URL(calls[0].url).searchParams.get("category"), "General / UI");
  });
});
