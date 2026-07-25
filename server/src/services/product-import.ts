import * as XLSX from 'xlsx'

export type ImportRow = {
  name: string
  slug?: string
  description: string
  brandSlug?: string
  brandName?: string
  price?: number
  oldPrice?: number
  stock: number
  weight?: number
  sku?: string
  categories: string[]
  images: string[]
  attributes: { name: string; value: string }[]
}

/**
 * Парсит одну строку CSV, обрабатывая кавычки
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let insideQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      // Удвоенная кавычка внутри поля — экранированная: "он сказал ""да"""
      if (insideQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (ch === ',' && !insideQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

/**
 * Парсит файл (CSV или Excel) в массив объектов
 */
export function parseRows(buffer: Buffer, filename: string): Record<string, string>[] {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
  }

  const text = buffer.toString('utf-8')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })
    return row
  })
}

/**
 * Транслитерация кириллицы в латиницу
 * Возвращает слаг: нижний регистр, не-буквы→дефис, max 80 символов
 */
export function transliterate(text: string): string {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  }

  let result = text.toLowerCase()

  // Замена кириллицы на латиницу
  for (const [cyrillic, latin] of Object.entries(map)) {
    result = result.replaceAll(cyrillic, latin)
  }

  // Всё кроме [a-z0-9] → дефис
  result = result.replace(/[^a-z0-9]+/g, '-')

  // Обрезаем дефисы по краям
  result = result.replace(/^-+|-+$/g, '')

  // Сокращаем до 80 символов; срез может попасть на дефис — убираем его снова
  result = result.substring(0, 80).replace(/-+$/, '')

  return result
}

/**
 * Парсит атрибуты из сырой строки
 * Ищет колонки вида "Название атрибута N" и берёт "Значение атрибута N"
 */
export function parseAttributes(raw: Record<string, string>): { name: string; value: string }[] {
  const attributes: { name: string; value: string }[] = []
  const seen = new Set<string>()

  // Ищем все "Название атрибута N"
  const attrRegex = /^Название атрибута (\d+)$/

  for (const key of Object.keys(raw)) {
    const match = key.match(attrRegex)
    if (!match) continue

    const n = match[1]
    const attrName = raw[key]?.trim() ?? ''
    const attrValue = raw[`Значение атрибута ${n}`]?.trim() ?? ''

    // Отбрасываем пустые пары или дубли
    if (!attrName || !attrValue) continue

    const pairKey = `${attrName}|${attrValue}`
    if (seen.has(pairKey)) continue

    seen.add(pairKey)
    attributes.push({ name: attrName, value: attrValue })
  }

  return attributes
}

/**
 * Маппит сырую строку в структурированный ImportRow
 * Определяет формат по наличию "Имя" (русский) или "name" (английский)
 */
export function mapRow(raw: Record<string, string>): ImportRow {
  // Определяем формат
  const isRussian = 'Имя' in raw

  if (isRussian) {
    // Русский WooCommerce формат
    const name = (raw['Имя'] ?? '').trim()
    const sku = (raw['Артикул'] ?? '').trim() || undefined
    const description = (raw['Наименование'] ?? '').trim() || name || ''

    // Цены
    let price: number | undefined
    let oldPrice: number | undefined

    const basePrice = parseFloat((raw['Базовая цена'] ?? raw['Цена'] ?? '').toString().replace(',', '.'))
    const salePrice = parseFloat((raw['Акционная цена'] ?? '').toString().replace(',', '.'))

    const prices = [basePrice, salePrice].filter(p => !isNaN(p))
    if (prices.length === 2) {
      // Две цены: меньшая → price, большая → зачёркнутая oldPrice.
      // Равные цены — не скидка, зачёркивать нечего.
      price = Math.min(basePrice, salePrice)
      if (basePrice !== salePrice) {
        oldPrice = Math.max(basePrice, salePrice)
      }
    } else if (prices.length === 1) {
      // Одна цена
      price = prices[0]
    }

    // Вес
    const weight = parseFloat((raw['Вес (kg)'] ?? raw['Вес'] ?? '').toString().replace(',', '.'))

    // Остаток
    const stock = parseInt((raw['Запасы'] ?? raw['Остаток'] ?? '0').toString()) || 0

    // Категории
    const categories = (raw['Категории'] ?? '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    // Изображения
    const images = (raw['Изображения'] ?? '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    // Бренд
    const brandName = (raw['Бренд'] ?? raw['Производитель'] ?? '').trim() || undefined

    // Атрибуты
    const attributes = parseAttributes(raw)

    return {
      name,
      description,
      brandName,
      price: isNaN(price ?? NaN) ? undefined : price,
      oldPrice: isNaN(oldPrice ?? NaN) ? undefined : oldPrice,
      stock,
      weight: isNaN(weight) ? undefined : weight,
      sku,
      categories,
      images,
      attributes,
    }
  } else {
    // Английский формат
    const name = (raw['name'] ?? '').trim()
    const slug = (raw['slug'] ?? '').trim() || undefined
    const description = (raw['description'] ?? '').trim() || name || ''
    const brandSlug = (raw['brandSlug'] ?? '').trim() || undefined

    const price = parseFloat((raw['price'] ?? '').toString().replace(',', '.'))
    const oldPrice = parseFloat((raw['oldPrice'] ?? '').toString().replace(',', '.'))
    const stock = parseInt((raw['stock'] ?? '0').toString()) || 0
    const weight = parseFloat((raw['weight'] ?? '').toString().replace(',', '.'))
    const sku = (raw['sku'] ?? '').trim() || undefined

    return {
      name,
      slug,
      description,
      brandSlug,
      price: isNaN(price) ? undefined : price,
      oldPrice: isNaN(oldPrice) ? undefined : oldPrice,
      stock,
      weight: isNaN(weight) ? undefined : weight,
      sku,
      categories: [],
      images: [],
      attributes: [],
    }
  }
}
