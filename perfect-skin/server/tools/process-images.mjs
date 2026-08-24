#!/usr/bin/env node
/**
 * Perfect Skin — конвейер обработки изображений (исправленный)
 *
 * Использует отдельную страницу для каждого товара, чтобы избежать
 * проблем с переиспользованием состояния browser page.
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
    { name: 'card', width: 400 },
    { name: 'card@2x', width: 800 },
    { name: 'full', width: 1600 },
  ],
  photos: [
    { name: 'w800', width: 800 },
    { name: 'w1200', width: 1200 },
    { name: 'orig', width: null }, // без изменений
  ],
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (e) {
    if (e.code !== 'EEXIST') throw e
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function resizeImage(page, imageBase64, targetWidth, originalWidth, originalHeight, mimeType = 'jpeg') {
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

  // Очистить состояние страницы перед новым контентом
  await page.evaluate(() => { window.result = undefined; window.error = undefined })

  // Загрузить изображение через data-URI и ресайзить на canvas
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
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
        img.onerror = function() {
          window.error = 'Failed to load image'
        }
        img.src = 'data:image/${mimeType};base64,${imageBase64}'
      </script>
    </body>
    </html>
  `

  try {
    await page.setContent(html, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => typeof window.result !== 'undefined', { timeout: 5000 })
    const result = await page.evaluate(() => window.result)
    if (!result) throw new Error('Canvas rendering failed')
    const webpBase64 = result.replace('data:image/webp;base64,', '')
    return { width: targetWidth, height: targetHeight, webpBase64 }
  } catch (err) {
    throw new Error(`Resize failed: ${err.message}`)
  }
}

async function getImageDimensions(page, imageBase64, mimeType = 'jpeg') {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body>
      <img id="img" src="data:image/${mimeType};base64,${imageBase64}">
      <script>
        document.getElementById('img').onload = () => {
          window.dims = { width: img.naturalWidth, height: img.naturalHeight }
        }
        document.getElementById('img').onerror = () => {
          window.dims = null
        }
      </script>
    </body>
    </html>
  `
  try {
    await page.setContent(html, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => typeof window.dims !== 'undefined', { timeout: 5000 })
    const dims = await page.evaluate(() => window.dims)
    if (!dims) throw new Error('Could not load image')
    return dims
  } catch (err) {
    throw new Error(`Get dimensions failed: ${err.message}`)
  }
}

async function processProducts(browser, manifest) {
  console.log(`\n=== Обработка товарных фото (${manifest.products.length} товаров) ===`)

  const index = {}
  let processed = 0
  let skipped = 0
  const fullWebpSlugs = []

  for (const product of manifest.products) {
    const { slug, images } = product

    if (!images || images.length === 0) {
      processed++
      continue
    }

    const imageFile = images[0].file
    const srcPath = path.join(PRODUCTS_DIR, imageFile)
    const outDir = path.join(OUTPUT_DIR, 'products', slug)

    try {
      // Проверить кэш
      const allExist = await Promise.all(
        SIZES.products.map(size => {
          const fileName = size.name === 'full' ? 'full.webp' : `${size.name}.webp`
          return fileExists(path.join(outDir, fileName))
        })
      )

      if (allExist.every(e => e)) {
        skipped++
        processed++
        continue
      }

      await ensureDir(outDir)

      const srcExists = await fileExists(srcPath)
      if (!srcExists) {
        console.log(`\n  ⚠️  [${slug}]: исходный файл не найден`)
        processed++
        continue
      }

      // Прочитать исходник один раз
      const buffer = await fs.readFile(srcPath)
      const imageBase64 = buffer.toString('base64')
      const mimeType = path.extname(srcPath).slice(1).toLowerCase().replace('jpg', 'jpeg')

      // Создать отдельную страницу для этого товара (избежать проблем с состоянием)
      const page = await browser.newPage()
      try {
        // Получить размеры
        const { width: origWidth, height: origHeight } = await getImageDimensions(page, imageBase64, mimeType)

        const sizes = {}

        // Обработать каждый размер
        for (const size of SIZES.products) {
          const fileName = size.name === 'full' ? 'full.webp' : `${size.name}.webp`
          const filePath = path.join(outDir, fileName)

          // Пропустить если уже существует
          if (await fileExists(filePath)) {
            sizes[size.name] = { file: fileName, cached: true }
            continue
          }

          const resized = await resizeImage(page, imageBase64, size.width, origWidth, origHeight, mimeType)
          if (!resized) {
            sizes[size.name] = { skipped: true, reason: 'too small' }
            continue
          }

          const webpBuffer = Buffer.from(resized.webpBase64, 'base64')
          await fs.writeFile(filePath, webpBuffer)

          sizes[size.name] = {
            file: fileName,
            width: resized.width,
            height: resized.height,
            bytes: webpBuffer.length,
          }

          // Трекер для full.webp
          if (size.name === 'full') {
            fullWebpSlugs.push(slug)
          }
        }

        index[slug] = {
          original: { width: origWidth, height: origHeight, bytes: buffer.length },
          sizes,
        }
      } finally {
        await page.close()
      }

      processed++
      process.stdout.write(`\r  [${processed}/${manifest.products.length}] ${slug}`)
    } catch (err) {
      console.error(`\n  ❌ [${slug}]: ${err.message}`)
      processed++
    }
  }

  console.log(`\n  Завершено: ${processed}/${manifest.products.length} (кэш: ${skipped}, full.webp: ${fullWebpSlugs.length})`)
  return { index, fullWebpSlugs }
}

async function processPhotos(browser) {
  console.log(`\n=== Обработка медиалики ===`)

  const index = {}
  let processed = 0
  let skipped = 0

  try {
    const files = await fs.readdir(MEDIA_DIR)
    const imageFiles = files.filter(f => /\.(jpg|png|webp)$/i.test(f))

    for (const imageFile of imageFiles) {
      const srcPath = path.join(MEDIA_DIR, imageFile)
      const outDir = path.join(OUTPUT_DIR, 'photos', imageFile.replace(/\.\w+$/, ''))

      try {
        // Проверить кэш
        const allExist = await Promise.all(
          SIZES.photos.map(size => {
            const fileName = `${size.name}.webp`
            return fileExists(path.join(outDir, fileName))
          })
        )

        if (allExist.every(e => e)) {
          skipped++
          processed++
          continue
        }

        await ensureDir(outDir)

        const buffer = await fs.readFile(srcPath)
        const imageBase64 = buffer.toString('base64')
        const mimeType = path.extname(imageFile).slice(1).toLowerCase().replace('jpg', 'jpeg')

        // Создать отдельную страницу для этого файла
        const page = await browser.newPage()
        try {
          const { width: origWidth, height: origHeight } = await getImageDimensions(page, imageBase64, mimeType)

          const sizes = {}

          // Обработать w800 и w1200
          for (const size of SIZES.photos.slice(0, 2)) {
            const filePath = path.join(outDir, `${size.name}.webp`)

            if (await fileExists(filePath)) {
              sizes[size.name] = { cached: true }
              continue
            }

            const resized = await resizeImage(page, imageBase64, size.width, origWidth, origHeight, mimeType)
            if (!resized) {
              sizes[size.name] = { skipped: true, reason: 'too small' }
              continue
            }

            const webpBuffer = Buffer.from(resized.webpBase64, 'base64')
            await fs.writeFile(filePath, webpBuffer)

            sizes[size.name] = {
              file: `${size.name}.webp`,
              width: resized.width,
              height: resized.height,
              bytes: webpBuffer.length,
            }
          }

          // Сохранить оригинал в WebP
          const origFilePath = path.join(outDir, 'orig.webp')
          if (!(await fileExists(origFilePath))) {
            const origResized = await resizeImage(page, imageBase64, origWidth, origWidth, origHeight, mimeType)
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
          } else {
            sizes.orig = { cached: true }
          }

          index[imageFile] = {
            original: { width: origWidth, height: origHeight, bytes: buffer.length },
            sizes,
          }
        } finally {
          await page.close()
        }

        processed++
        process.stdout.write(`\r  [${processed}/${imageFiles.length}] ${imageFile}`)
      } catch (err) {
        console.error(`\n  ❌ [${imageFile}]: ${err.message}`)
        processed++
      }
    }

    console.log(`\n  Завершено: ${processed} (кэш: ${skipped})`)
  } catch (err) {
    console.error(`  ❌ Ошибка: ${err.message}`)
  }

  return index
}

async function main() {
  console.log('Perfect Skin — конвейер обработки изображений (исправленный)')
  console.log('='.repeat(60))

  try {
    // Прочитать манифест
    const manifestJson = await fs.readFile(MANIFEST_PATH, 'utf8')
    const manifest = JSON.parse(manifestJson)

    console.log(`Манифест загружен: ${manifest.products.length} товаров`)

    // Создать выходную папку
    await ensureDir(OUTPUT_DIR)

    // Запустить браузер один раз
    console.log(`Запуск Chromium...`)
    const browser = await chromium.launch({ headless: true })

    // Обработать товары и медиалику
    const { index: productsIndex, fullWebpSlugs } = await processProducts(browser, manifest)
    const photosIndex = await processPhotos(browser)

    await browser.close()
    console.log(`\nВсе браузеры закрыты`)

    // Сохранить index.json
    const fullIndex = {
      generatedAt: new Date().toISOString(),
      products: productsIndex,
      photos: photosIndex,
      fullWebpCount: fullWebpSlugs.length,
    }

    const indexPath = path.join(OUTPUT_DIR, 'index.json')
    await fs.writeFile(indexPath, JSON.stringify(fullIndex, null, 2))
    console.log(`index.json сохранён`)

    console.log(`\n${'='.repeat(60)}`)
    console.log(`✓ Обработка завершена`)
    console.log(`  Товарные фото: ${Object.keys(productsIndex).length}`)
    console.log(`  Медиалика: ${Object.keys(photosIndex).length}`)
    console.log(`  full.webp создано: ${fullWebpSlugs.length}`)

  } catch (err) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', err.message)
    process.exit(1)
  }
}

main()
