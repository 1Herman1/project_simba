import { chromium } from 'playwright-core';
import * as fs from 'fs';
import * as path from 'path';

const browserPath = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const outputDir = '/tmp/cart-screenshots';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function screenshotCart() {
  const browser = await chromium.launch({
    executablePath: browserPath,
  });

  try {
    const page = await browser.newPage();

    // Посетим каталог, добавим товар, откроем корзину
    await page.goto('http://localhost:5173/catalog', { waitUntil: 'networkidle' });

    // Ждём загрузки товаров
    await page.waitForTimeout(2000);

    // Найдём первый товар и добавим его в корзину
    // Кнопка обычно в карточке товара
    const addButtons = await page.locator('button:has-text("В корзину")').first();
    if (await addButtons.isVisible()) {
      await addButtons.click();
      await page.waitForTimeout(500);
    }

    // Откроем корзину — обычно иконка корзины в хедере
    const cartButton = page.locator('button[aria-label*="Корзина"], button:has-text("Корзина"), [data-testid="cart-button"]').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await page.waitForTimeout(800);
    }

    // Скрины разных размеров
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 },
    ];

    for (const { name, width, height } of viewports) {
      await page.setViewportSize({ width, height });
      const screenshotPath = path.join(outputDir, `cart-${name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`✓ Saved ${screenshotPath}`);
    }

  } finally {
    await browser.close();
  }
}

screenshotCart().catch(console.error);
