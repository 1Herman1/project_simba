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

// "lucide" установлен локально (@iconify-json/lucide) — запросы по нему
// решаются офлайн и в сеть не ходят. Тесты на сетевой путь используют запросы/
// наборы, которых заведомо нет в локальном пакете, чтобы гарантированно
// дойти до мока `fetch`.

describe("searchStaticIcon — офлайн-путь (локальный npm-пакет)", () => {
  test("находит реальную иконку в lucide без единого сетевого запроса", async () => {
    const res = await searchStaticIcon("shopping-cart");

    assert.ok(res.length > 0);
    assert.equal(res[0].prefix, "lucide");
    assert.equal(res[0].license, "ISC");
    assert.equal(calls.length, 0);
  });
});

describe("searchStaticIcon — сетевой путь (расширение сверх локального)", () => {
  test("пустой локальный результат уходит в сеть", async () => {
    mockFetch({
      jsonBody: {
        icons: ["mdi:totally-unmatched-xyz"],
        collections: { mdi: { name: "Material Design Icons", license: { title: "Apache 2.0" } } },
      },
    });

    const res = await searchStaticIcon("totally-unmatched-xyz-network-only");

    assert.equal(calls.length, 1);
    assert.deepEqual(res, [
      { prefix: "mdi", name: "totally-unmatched-xyz", set: "Material Design Icons", license: "Apache 2.0" },
    ]);
  });

  test("не выдаёт лицензию за известную, если её нет в ответе", async () => {
    mockFetch({ jsonBody: { icons: ["foo:totally-unmatched-xyz-network-only"] } });

    const [icon] = await searchStaticIcon("totally-unmatched-xyz-network-only");

    assert.equal(icon.set, "foo");
    assert.match(icon.license, /неизвестна/);
  });

  test("фильтр по набору, которого нет локально, уходит в параметр prefix сети", async () => {
    mockFetch({ jsonBody: { icons: [] } });

    await searchStaticIcon("cart", "heroicons", 30);

    const url = new URL(calls[0].url);
    assert.equal(url.pathname, "/search");
    assert.equal(url.searchParams.get("query"), "cart");
    assert.equal(url.searchParams.get("prefix"), "heroicons");
    assert.equal(url.searchParams.get("limit"), "30");
  });

  test("не падает, когда сетевой ответ без поля icons", async () => {
    mockFetch({ jsonBody: {} });

    const res = await searchStaticIcon("totally-unmatched-xyz-network-only");

    assert.deepEqual(res, []);
  });

  test("HTTP-ошибка превращается в понятную ошибку со статусом", async () => {
    mockFetch({ ok: false, status: 403, statusText: "Forbidden" });

    await assert.rejects(
      () => searchStaticIcon("totally-unmatched-xyz-network-only"),
      /403/,
    );
  });
});

describe("getStaticIconSvg — офлайн-путь", () => {
  test("собирает реальный SVG из локального пакета, в сеть не ходит", async () => {
    const svg = await getStaticIconSvg("lucide", "shopping-cart");

    assert.match(svg, /^<svg/);
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.equal(calls.length, 0);
  });

  test("несуществующее имя в локальном наборе — понятная ошибка, без сети", async () => {
    await assert.rejects(
      () => getStaticIconSvg("lucide", "definitely-not-a-real-icon"),
      /definitely-not-a-real-icon[\s\S]*lucide[\s\S]*search_static_icon/,
    );
    assert.equal(calls.length, 0);
  });
});

describe("getStaticIconSvg — сетевой путь (набор не установлен локально)", () => {
  test("возвращает сырой SVG-текст", async () => {
    mockFetch({ textBody: "<svg viewBox=\"0 0 24 24\"></svg>" });

    const svg = await getStaticIconSvg("heroicons", "shopping-cart");

    assert.match(svg, /^<svg/);
    assert.ok(calls[0].url.endsWith("/heroicons/shopping-cart.svg"));
  });

  test("404 сообщает имя иконки и подсказывает следующий шаг", async () => {
    mockFetch({ ok: false, status: 404, statusText: "Not Found" });

    await assert.rejects(
      () => getStaticIconSvg("heroicons", "nope"),
      /heroicons:nope[\s\S]*search_static_icon/,
    );
  });
});

describe("listIconSets", () => {
  test("всегда включает локальные наборы (lucide) первыми", async () => {
    mockFetch({ jsonBody: {} });

    const sets = await listIconSets();

    assert.ok(sets.some((s) => s.prefix === "lucide" && s.license === "ISC"));
  });

  test("дополняет сетевыми наборами, не дублируя уже локальный prefix", async () => {
    mockFetch({
      jsonBody: {
        lucide: { name: "Lucide (сетевая версия)", license: { title: "должна быть отброшена" } },
        foo: { name: "Foo", license: { title: "Custom" } },
        bar: {},
      },
    });

    const sets = await listIconSets();

    const lucideEntries = sets.filter((s) => s.prefix === "lucide");
    assert.equal(lucideEntries.length, 1);
    assert.equal(lucideEntries[0].license, "ISC"); // локальная, не сетевая
    assert.ok(sets.some((s) => s.prefix === "foo" && s.license === "Custom"));
    assert.ok(sets.some((s) => s.prefix === "bar" && s.license === "не указана"));
  });

  test("сеть недоступна — возвращает хотя бы локальные наборы, не падает", async () => {
    globalThis.fetch = (async () => {
      throw new Error("сеть недоступна");
    }) as typeof fetch;

    const sets = await listIconSets();

    assert.ok(sets.some((s) => s.prefix === "lucide"));
  });

  test("категория уходит в query-параметр в закодированном виде", async () => {
    mockFetch({ jsonBody: {} });

    await listIconSets("General / UI");

    assert.equal(new URL(calls[0].url).searchParams.get("category"), "General / UI");
  });
});
