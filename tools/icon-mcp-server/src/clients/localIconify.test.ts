import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  searchLocalIcon,
  getLocalIconSvg,
  listLocalIconSets,
  isSetInstalledLocally,
} from "./localIconify.js";

// Работает на реально установленном @iconify-json/lucide — не мок,
// это и есть весь смысл: доказать, что офлайн-путь реально работает.

describe("searchLocalIcon", () => {
  test("находит иконку по подстроке имени", () => {
    const results = searchLocalIcon("shopping-cart");
    assert.ok(results.length > 0);
    assert.equal(results[0].prefix, "lucide");
    assert.equal(results[0].name, "shopping-cart");
    assert.equal(results[0].license, "ISC");
  });

  test("ничего не находит на бессмысленный запрос", () => {
    const results = searchLocalIcon("zzz-not-a-real-icon-name-zzz");
    assert.equal(results.length, 0);
  });

  test("уважает лимит", () => {
    const results = searchLocalIcon("a", undefined, 3);
    assert.ok(results.length <= 3);
  });

  test("фильтр по набору, которого нет локально, даёт пустой список", () => {
    const results = searchLocalIcon("cart", "heroicons");
    assert.equal(results.length, 0);
  });
});

describe("getLocalIconSvg", () => {
  test("возвращает валидный SVG с viewBox", () => {
    const svg = getLocalIconSvg("lucide", "shopping-cart");
    assert.ok(svg);
    assert.match(svg, /^<svg /);
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.match(svg, /<\/svg>$/);
  });

  test("null для несуществующей иконки", () => {
    assert.equal(getLocalIconSvg("lucide", "definitely-not-real"), null);
  });

  test("null для неустановленного набора", () => {
    assert.equal(getLocalIconSvg("heroicons", "cart"), null);
  });
});

describe("listLocalIconSets", () => {
  test("включает lucide с лицензией", () => {
    const sets = listLocalIconSets();
    const lucide = sets.find((s) => s.prefix === "lucide");
    assert.ok(lucide);
    assert.equal(lucide.license, "ISC");
  });
});

describe("isSetInstalledLocally", () => {
  test("lucide — да, heroicons — нет", () => {
    assert.equal(isSetInstalledLocally("lucide"), true);
    assert.equal(isSetInstalledLocally("heroicons"), false);
  });
});
