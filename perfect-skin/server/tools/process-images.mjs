#!/usr/bin/env node
/**
 * Perfect Skin — конвейер обработки изображений
 *
 * Используемые размеры:
 *   Товарные фото: card (400), card@2x (800), full (до 1600)
 *   Медиалика: w800, w1200, orig (исходная ширина)
 *
 * Правила:
 *   - Не апскейлить (пропустить размер если < цели)
 *   - Качество WebP: 82
 *   - Один браузер на весь прогон, страницы переиспользуются
 *
 * Запуск: node tools/process-images.mjs
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import pkg from '/opt/node22/lib/node_modules/playwright/index.js'

const { chromium } = pkg

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../..')
const PRODUCTS_DIR = path.join(PROJECT_ROOT, 'server/assets/products')
const MEDIA_DIR = path.join(PROJECT_ROOT, '../docs/projects/perfect-skin/media/photos')
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'server/assets/processed')

const MANIFEST_PATH = path.join(PRODUCTS_DIR, 'manifest.json')

// Конфиг размеров
const SIZES = {
  products: [
    { name: 'card', width: 400, maxWidth: null },
    { name: 'card@2x', width: 800, maxWidth: null },
    { name: 'full', width: 1600, maxWidth: null },
  ],
  photos: [
    { name: 'w800', width: 800, maxWidth: null },
    { name: 'w1200', width: 1200, maxWidth: null },
    { name: 'orig', width: null, maxWidth: null }, // без изменений
  ],
}

// Утилиты
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (e) {
    if (e.code !== 'EEXIST') throw e
  }
}

async function readImage(filePath) {
  const buffer = await fs.readFile(filePath)
  return buffer.toString('base64')
}

async function resizeImage(page, imageBase64, targetWidth, originalWidth, originalHeight) {
  // Если нет целевой ширины (orig) или исходник меньше цели — пропустить
  if (!targetWidth) {
    return { width: originalWidth, height: originalHeight, webpBase64: imageBase64 }
  }
  if (originalWidth < targetWidth) {
    return null // Апскейлирование не требуется
  }

  // Вычислить высоту с сохранением пропорций
  const ratio = originalHeight / originalWidth
  const targetHeight = Math.round(targetWidth * ratio)

  // Загрузить изображение через data-URI и ресайзить на canvas
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0;">
      <canvas id="canvas"></canvas>
      <script>
        const img = new Image()
        img.onload = function() {
          const canvas = document.getElementById('canvas')
          canvas.width = ${targetWidth}
          canvas.height = ${targetHeight}
          const ctx = canvas.getContext('2d')
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, ${targetWidth}, ${targetHeight})
          window.result = canvas.toDataURL('image/webp', 0.82)
        }
        img.src = 'data:image/jpeg;base64,${imageBase64}'
      </script>
    </body>
    </html>
  `

  await page.setContent(html)
  await page.waitForFunction(() => window.result)
  const dataUrl = await page.evaluate(() => window.result)
  const webpBase64 = dataUrl.replace('data:image/webp;base64,', '')

  return { width: targetWidth, height: targetHeight, webpBase64 }
}

async function processProducts(browser, manifest) {
  console.log(`\n=== Обработка товарных фото (${manifest.products.length} товаров) ===`)

  const page = await browser.newPage()
  const index = {}
  let processed = 0

  for (const product of manifest.products) {
    const { slug, images } = product

    if (!images || images.length === 0) {
      console.log(`  [${processed + 1}/${manifest.products.length}] ${slug}: нет изображений`)
      processed++
      continue
    }

    const imageFile = images[0].file
    const srcPath = path.join(PRODUCTS_DIR, imageFile)
    const outDir = path.join(OUTPUT_DIR, 'products', slug)

    try {
      await ensureDir(outDir)

      // Определить размеры исходного файла
      const buffer = await fs.readFile(srcPath)
      const imageBase64 = buffer.toString('base64')

      // Использовать простой способ получить размеры через Image
      const getImageDimensions = async () => {
        const html = `
          <!DOCTYPE html>
          <html>
          <body>
            <img id="img" src="data:image/${path.extname(srcPath).slice(1)};base64,${imageBase64}">
            <script>
              document.getElementById('img').onload = () => {
                window.dims = { width: img.naturalWidth, height: img.naturalHeight }
              }
            </script>
          </body>
          </html>
        `
        await page.setContent(html)
        await page.waitForFunction(() => window.dims)
        return await page.evaluate(() => window.dims)
      }

      const { width: origWidth, height: origHeight } = await getImageDimensions()

      // Обработать каждый размер
      const sizes = {}
      for (const size of SIZES.products) {
        const resized = await resizeImage(page, imageBase64, size.width, origWidth, origHeight)
        if (!resized) {
          sizes[size.name] = { skipped: true, reason: 'too small' }
          continue
        }

        const fileName = size.name === 'full' ? 'full.webp' : `${size.name}.webp`
        const filePath = path.join(outDir, fileName)
        const webpBuffer = Buffer.from(resized.webpBase64, 'base64')
        await fs.writeFile(filePath, webpBuffer)

        sizes[size.name] = {
          file: fileName,
          width: resized.width,
          height: resized.height,
          bytes: webpBuffer.length,
        }
      }

      index[slug] = {
        original: { width: origWidth, height: origHeight, bytes: buffer.length },
        sizes,
      }

      processed++
      process.stdout.write(`\r  [${processed}/${manifest.products.length}] ${slug}`)
    } catch (err) {
      console.error(`\n  ОШИБКА [${slug}]: ${err.message}`)
    }
  }

  await page.close()
  console.log(`\n  Завершено: ${processed}/${manifest.products.length}`)
  return index
}

async function processPhotos(browser) {
  console.log(`\n=== Обработка медиалики ===`)

  const page = await browser.newPage()
  const index = {}
  let processed = 0

  try {
    const files = await fs.readdir(MEDIA_DIR)
    const imageFiles = files.filter(f => /\.(jpg|png|webp)$/i.test(f))

    for (const imageFile of imageFiles) {
      const srcPath = path.join(MEDIA_DIR, imageFile)
      const outDir = path.join(OUTPUT_DIR, 'photos', imageFile.replace(/\.\w+$/, ''))

      try {
        await ensureDir(outDir)

        const buffer = await fs.readFile(srcPath)
        const imageBase64 = buffer.toString('base64')

        // Получить размеры
        const getImageDimensions = async () => {
          const ext = path.extname(imageFile).slice(1)
          const html = `
            <!DOCTYPE html>
            <html>
            <body>
              <img id="img" src="data:image/${ext};base64,${imageBase64}">
              <script>
                document.getElementById('img').onload = () => {
                  window.dims = { width: img.naturalWidth, height: img.naturalHeight }
                }
              </script>
            </body>
            </html>
          `
          await page.setContent(html)
          await page.waitForFunction(() => window.dims)
          return await page.evaluate(() => window.dims)
        }

        const { width: origWidth, height: origHeight } = await getImageDimensions()

        const sizes = {}

        // Обработать w800 и w1200
        for (const size of SIZES.photos.slice(0, 2)) {
          const resized = await resizeImage(page, imageBase64, size.width, origWidth, origHeight)
          if (!resized) {
            sizes[size.name] = { skipped: true, reason: 'too small' }
            continue
          }

          const filePath = path.join(outDir, `${size.name}.webp`)
          const webpBuffer = Buffer.from(resized.webpBase64, 'base64')
          await fs.writeFile(filePath, webpBuffer)

          sizes[size.name] = {
            file: `${size.name}.webp`,
            width: resized.width,
            height: resized.height,
            bytes: webpBuffer.length,
          }
        }

        // Сохранить оригинал в WebP без ресайза
        const origFilePath = path.join(outDir, 'orig.webp')
        const origResized = await resizeImage(page, imageBase64, origWidth, origWidth, origHeight)
        if (origResized) {
          const webpBuffer = Buffer.from(origResized.webpBase64, 'base64')
          await fs.writeFile(origFilePath, webpBuffer)
          sizes.orig = {
            file: 'orig.webp',
            width: origResized.width,
            height: origResized.height,
            bytes: webpBuffer.length,
          }
        }

        index[imageFile] = {
          original: { width: origWidth, height: origHeight, bytes: buffer.length },
          sizes,
        }

        processed++
        process.stdout.write(`\r  [${processed}/${imageFiles.length}] ${imageFile}`)
      } catch (err) {
        console.error(`\n  ОШИБКА [${imageFile}]: ${err.message}`)
      }
    }

    await page.close()
    console.log(`\n  Завершено: ${processed}/${imageFiles.length}`)
  } catch (err) {
    console.error(`  ОШИБКА при чтении папки медиалики: ${err.message}`)
  }

  return index
}

async function main() {
  console.log('Perfect Skin — конвейер обработки изображений')
  console.log('='.repeat(50))

  try {
    // Прочитать манифест
    const manifestJson = await fs.readFile(MANIFEST_PATH, 'utf8')
    const manifest = JSON.parse(manifestJson)

    console.log(`Манифест загружен: ${manifest.products.length} товаров`)

    // Создать выходную папку
    await ensureDir(OUTPUT_DIR)

    // Запустить браузер один раз
    console.log(`\nЗапуск Chromium...`)
    const browser = await chromium.launch({ headless: true })

    // Обработать товары и медиалику
    const productsIndex = await processProducts(browser, manifest)
    const photosIndex = await processPhotos(browser)

    await browser.close()
    console.log(`\nВсе браузеры закрыты`)

    // Сохранить index.json
    const fullIndex = {
      generatedAt: new Date().toISOString(),
      products: productsIndex,
      photos: photosIndex,
    }

    const indexPath = path.join(OUTPUT_DIR, 'index.json')
    await fs.writeFile(indexPath, JSON.stringify(fullIndex, null, 2))
    console.log(`\nindex.json сохранён: ${indexPath}`)

    // Вывести статистику
    const productSizes = Object.values(productsIndex)
      .flatMap(p => Object.values(p.sizes))
      .filter(s => !s.skipped)
      .reduce((sum, s) => sum + (s.bytes || 0), 0)

    const photoSizes = Object.values(photosIndex)
      .flatMap(p => Object.values(p.sizes))
      .filter(s => !s.skipped)
      .reduce((sum, s) => sum + (s.bytes || 0), 0)

    const origSizes = [
      ...Object.values(productsIndex).map(p => p.original.bytes),
      ...Object.values(photosIndex).map(p => p.original.bytes),
    ].reduce((sum, b) => sum + b, 0)

    console.log(`\n${'='.repeat(50)}`)
    console.log(`Статистика:`)
    console.log(`  Исходные файлы: ${(origSizes / 1024 / 1024).toFixed(2)} МБ`)
    console.log(`  Товарные фото (WebP): ${(productSizes / 1024 / 1024).toFixed(2)} МБ`)
    console.log(`  Медиалика (WebP): ${(photoSizes / 1024 / 1024).toFixed(2)} МБ`)
    console.log(`  Всего обработано: ${((productSizes + photoSizes) / 1024 / 1024).toFixed(2)} МБ`)
    const compression = (((1 - (productSizes + photoSizes) / origSizes) * 100).toFixed(1))
    console.log(`  Сжатие: ${compression}%`)

  } catch (err) {
    console.error('КРИТИЧЕСКАЯ ОШИБКА:', err.message)
    process.exit(1)
  }
}

main()
