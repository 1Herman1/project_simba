/**
 * Нормализация артикула для сопоставления.
 * Правила:
 * 1. trim() — убрать пробелы в начале/конце
 * 2. Убрать ВСЕ пробелы внутри (включая неразрывные U+00A0)
 * 3. toLowerCase()
 * 4. Если строка целиком из цифр — убрать ведущие нули
 * 5. Пустая строка → ключа нет (признак отсутствия артикула)
 */
export function normalizeArticle(value: string | null | undefined): string {
  if (!value) return ''

  // trim + убрать все пробелы (включая неразрывные)
  let result = value.trim().replace(/\s/g, '')

  // toLowerCase
  result = result.toLowerCase()

  // Если строка целиком из цифр, убрать ведущие нули
  if (/^\d+$/.test(result)) {
    result = result.replace(/^0+/, '') || '0'
  }

  return result
}
