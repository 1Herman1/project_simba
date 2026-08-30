#!/usr/bin/env node
// Снимает страницу браузером, чтобы агент-дизайнер видел интерфейс, а не только код.
//
// Использование:
//   node .claude/scripts/screenshot.mjs <url> [опции]
//
// Опции:
//   --out <путь>        куда положить (по умолчанию .claude/screenshots/)
//   --viewport <name>   desktop | tablet | mobile | all  (по умолчанию all)
//   --width <px>        своя ширина вместо пресета
//   --full              снять страницу целиком, а не первый экран
//   --wait <ms>         пауза после загрузки, для анимаций (по умолчанию 1200)
//   --click <selector>  кликнуть перед съёмкой (открыть корзину, меню)
//
// Примеры:
//   node .claude/scripts/screenshot.mjs http://localhost:5173
//   node .claude/scripts/screenshot.mjs http://localhost:5173/catalog --viewport mobile --full
//   node .claude/scripts/screenshot.mjs http://localhost:5173 --click "[aria-label='Корзина']"
//
// ВАЖНО: внешние сайты в этой среде недоступны — сетевая политика сбрасывает
// защищённое соединение браузера. Работает только то, что поднято локально
// (localhost / 127.0.0.1). Это ограничение среды, не скрипта.

import { chromium } from "playwright-core";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 },
};

function parseArgs(argv) {
  const url = argv[2];
  if (!url) {
    console.error("Укажи URL. Пример: node .claude/scripts/screenshot.mjs http://localhost:5173");
    process.exit(1);
  }
  const opts = { url, viewport: "all", wait: 1200, full: false };
  for (let i = 3; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--full") opts.full = true;
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--viewport") opts.viewport = argv[++i];
    else if (a === "--width") opts.width = Number(argv[++i]);
    else if (a === "--wait") opts.wait = Number(argv[++i]);
    else if (a === "--click") opts.click = argv[++i];
  }
  return opts;
}

function targets(opts) {
  if (opts.width) return [{ name: `w${opts.width}`, width: opts.width, height: 900 }];
  if (opts.viewport === "all") {
    return Object.entries(VIEWPORTS).map(([name, v]) => ({ name, ...v }));
  }
  const v = VIEWPORTS[opts.viewport];
  if (!v) {
    console.error(`Неизвестный экран "${opts.viewport}". Доступны: desktop, tablet, mobile, all.`);
    process.exit(1);
  }
  return [{ name: opts.viewport, ...v }];
}

function outPath(opts, viewportName) {
  if (opts.out) {
    return targets(opts).length > 1
      ? opts.out.replace(/(\.png)?$/, `-${viewportName}.png`)
      : opts.out.replace(/(\.png)?$/, ".png");
  }
  const slug =
    opts.url
      .replace(/^https?:\/\//, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "page";
  return resolve(".claude/screenshots", `${slug}-${viewportName}.png`);
}

const opts = parseArgs(process.argv);

if (!existsSync(CHROME)) {
  console.error(
    `Chromium не найден по пути ${CHROME}. Проверь PLAYWRIGHT_BROWSERS_PATH и что браузер установлен в образе.`,
  );
  process.exit(1);
}

const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(opts.url);
if (!isLocal) {
  console.error(
    `Похоже, это внешний адрес: ${opts.url}\n` +
      `В этой среде браузер не может открывать внешние сайты — сетевая политика сбрасывает соединение.\n` +
      `Снимать можно только локально поднятый проект (npm run dev:client → http://localhost:5173).\n` +
      `Для внешних референсов попроси у пользователя скриншот.`,
  );
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-quic"],
});

const written = [];
try {
  for (const t of targets(opts)) {
    const page = await browser.newPage({
      viewport: { width: t.width, height: t.height },
      deviceScaleFactor: 1,
    });
    try {
      await page.goto(opts.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    } catch (e) {
      console.error(
        `Не удалось открыть ${opts.url} (${t.name}): ${e.message}\n` +
          `Проверь, что dev-сервер запущен: npm run dev:client (Симба) — порт 5173.`,
      );
      process.exitCode = 1;
      await page.close();
      continue;
    }

    if (opts.click) {
      try {
        await page.click(opts.click, { timeout: 5000 });
        await page.waitForTimeout(600);
      } catch {
        console.error(`Не нашёл элемент для клика: ${opts.click} — снимаю страницу как есть.`);
      }
    }

    await page.waitForTimeout(opts.wait);

    const file = outPath(opts, t.name);
    mkdirSync(dirname(file), { recursive: true });
    await page.screenshot({ path: file, fullPage: opts.full });
    written.push(`${file}  (${t.width}×${t.height}${opts.full ? ", вся страница" : ""})`);
    await page.close();
  }
} finally {
  await browser.close();
}

if (written.length === 0) {
  console.error("Ни одного снимка сделать не удалось.");
  process.exit(1);
}

console.log("Снимки готовы:");
for (const w of written) console.log("  " + w);
console.log("\nДальше — прочитай их через Read, чтобы увидеть картинку.");
