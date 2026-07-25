import { describe, it, expect } from 'vitest'
import {
  transliterate,
  parseAttributes,
  mapRow,
  parseCsvLine,
  parseRows,
} from './product-import'

describe('transliterate', () => {
  it('переводит реальное название товара в латинский слаг', () => {
    expect(transliterate('Бальзам-кондиционер Muzzle для собак и кошек')).toBe(
      'balzam-kondicioner-muzzle-dlya-sobak-i-koshek'
    )
  })

  it('сохраняет латинские части в смешанном русско-латинском тексте', () => {
    expect(transliterate('Корм Royal Canin для кошек')).toBe('korm-royal-canin-dlya-koshek')
  })

  it('заменяет спецсимволы и лишние пробелы на одиночные дефисы', () => {
    expect(transliterate('  Шампунь  //  для   щенков!!!  ')).toBe('shampun-dlya-shchenkov')
  })

  it('схлопывает повторяющиеся дефисы в один', () => {
    expect(transliterate('Корм---премиум - - класс')).toBe('korm-premium-klass')
  })

  it('не оставляет дефисов по краям', () => {
    expect(transliterate('---Корм для собак---')).toBe('korm-dlya-sobak')
  })

  it('обрезает результат до 80 символов', () => {
    const long = 'Бальзам кондиционер для длинношерстных собак и кошек премиум класса с экстрактом алоэ'
    const slug = transliterate(long)
    expect(slug.length).toBeLessThanOrEqual(80)
    expect(slug.startsWith('balzam-kondicioner-dlya')).toBe(true)
  })

  it('на пустой строке возвращает пустую строку', () => {
    expect(transliterate('')).toBe('')
  })

  it('сохраняет цифры', () => {
    expect(transliterate('Корм 15 кг')).toBe('korm-15-kg')
  })
})

describe('parseAttributes', () => {
  it('отбрасывает пары с пустыми значениями (реальный файл пользователя)', () => {
    const raw: Record<string, string> = {
      'Название атрибута 1': 'вид',
      'Значение атрибута 1': '',
      'Название атрибута 2': 'вкус',
      'Значение атрибута 2': '',
      'Название атрибута 3': 'Возраст питомца',
      'Значение атрибута 3': '',
      'Название атрибута 4': 'Патология',
      'Значение атрибута 4': '',
      'Название атрибута 5': 'Страна-изготовитель',
      'Значение атрибута 5': '',
    }
    expect(parseAttributes(raw)).toEqual([])
  })

  it('распознаёт пары с заполненными значениями', () => {
    const raw: Record<string, string> = {
      'Название атрибута 1': 'вид',
      'Значение атрибута 1': 'собаки',
      'Название атрибута 2': 'вкус',
      'Значение атрибута 2': '',
      'Название атрибута 3': 'Страна-изготовитель',
      'Значение атрибута 3': 'Россия',
    }
    expect(parseAttributes(raw)).toEqual([
      { name: 'вид', value: 'собаки' },
      { name: 'Страна-изготовитель', value: 'Россия' },
    ])
  })

  it('работает с 7 атрибутами (без хардкода на 5)', () => {
    const raw: Record<string, string> = {}
    for (let i = 1; i <= 7; i++) {
      raw[`Название атрибута ${i}`] = `атрибут${i}`
      raw[`Значение атрибута ${i}`] = `значение${i}`
    }
    expect(parseAttributes(raw)).toHaveLength(7)
  })

  it('работает с 12 атрибутами (без хардкода на 5)', () => {
    const raw: Record<string, string> = {}
    for (let i = 1; i <= 12; i++) {
      raw[`Название атрибута ${i}`] = `атрибут${i}`
      raw[`Значение атрибута ${i}`] = `значение${i}`
    }
    const result = parseAttributes(raw)
    expect(result).toHaveLength(12)
    expect(result).toContainEqual({ name: 'атрибут12', value: 'значение12' })
  })

  it('отбрасывает полные дубликаты пар', () => {
    const raw: Record<string, string> = {
      'Название атрибута 1': 'вид',
      'Значение атрибута 1': 'собаки',
      'Название атрибута 2': 'вид',
      'Значение атрибута 2': 'собаки',
      'Название атрибута 3': 'вид',
      'Значение атрибута 3': 'кошки',
    }
    expect(parseAttributes(raw)).toEqual([
      { name: 'вид', value: 'собаки' },
      { name: 'вид', value: 'кошки' },
    ])
  })

  it('не ломается на пропуске в нумерации (есть 1 и 3, нет 2)', () => {
    const raw: Record<string, string> = {
      'Название атрибута 1': 'вид',
      'Значение атрибута 1': 'собаки',
      'Название атрибута 3': 'вкус',
      'Значение атрибута 3': 'курица',
    }
    expect(parseAttributes(raw)).toEqual([
      { name: 'вид', value: 'собаки' },
      { name: 'вкус', value: 'курица' },
    ])
  })

  it('игнорирует служебные колонки «Глобальный атрибут» и «Видимость атрибута»', () => {
    const raw: Record<string, string> = {
      'Название атрибута 1': 'вид',
      'Значение атрибута 1': 'собаки',
      'Глобальный атрибут 1': '1',
      'Видимость атрибута 1': '1',
      'Глобальный атрибут 2': '0',
      'Видимость атрибута 2': '0',
    }
    expect(parseAttributes(raw)).toEqual([{ name: 'вид', value: 'собаки' }])
  })

  it('обрезает пробелы вокруг названия и значения', () => {
    const raw: Record<string, string> = {
      'Название атрибута 1': '  вид  ',
      'Значение атрибута 1': '  собаки  ',
      'Название атрибута 2': 'вкус',
      'Значение атрибута 2': '   ',
    }
    expect(parseAttributes(raw)).toEqual([{ name: 'вид', value: 'собаки' }])
  })

  it('на строке без атрибутивных колонок возвращает пустой массив', () => {
    expect(parseAttributes({ 'Имя': 'Корм', 'Артикул': 'A-1' })).toEqual([])
  })
})

describe('mapRow — русский формат', () => {
  const base = () => ({
    'Имя': 'Бальзам-кондиционер Muzzle',
    'Артикул': 'MZ-001',
  }) as Record<string, string>

  it('читает Имя, Артикул и Наименование', () => {
    const row = mapRow({ ...base(), 'Наименование': 'Описание товара' })
    expect(row.name).toBe('Бальзам-кондиционер Muzzle')
    expect(row.sku).toBe('MZ-001')
    expect(row.description).toBe('Описание товара')
  })

  it('подставляет имя в описание, если Наименование пустое', () => {
    const row = mapRow({ ...base(), 'Наименование': '   ' })
    expect(row.description).toBe('Бальзам-кондиционер Muzzle')
  })

  it('понимает запятую как десятичный разделитель в цене', () => {
    const row = mapRow({ ...base(), 'Базовая цена': '1299,50' })
    expect(row.price).toBe(1299.5)
    expect(row.oldPrice).toBeUndefined()
  })

  it('при двух ценах меньшая становится price, большая — oldPrice', () => {
    const row = mapRow({ ...base(), 'Базовая цена': '1299,50', 'Акционная цена': '999' })
    expect(row.price).toBe(999)
    expect(row.oldPrice).toBe(1299.5)
  })

  it('правило двух цен не зависит от того, в какой колонке большее значение', () => {
    const row = mapRow({ ...base(), 'Базовая цена': '500', 'Акционная цена': '1500' })
    expect(row.price).toBe(500)
    expect(row.oldPrice).toBe(1500)
  })

  it('поддерживает колонку «Цена» как запасную для базовой цены', () => {
    const row = mapRow({ ...base(), 'Цена': '350,25' })
    expect(row.price).toBe(350.25)
  })

  it('разбирает Категории по запятой с тримом', () => {
    const row = mapRow({ ...base(), 'Категории': ' Собаки, Уход за шерстью ,Шампуни, ' })
    expect(row.categories).toEqual(['Собаки', 'Уход за шерстью', 'Шампуни'])
  })

  it('разбирает Изображения по запятой с тримом', () => {
    const row = mapRow({
      ...base(),
      'Изображения': 'https://cdn.ru/a.jpg , https://cdn.ru/b.jpg',
    })
    expect(row.images).toEqual(['https://cdn.ru/a.jpg', 'https://cdn.ru/b.jpg'])
  })

  it('без категорий и изображений отдаёт пустые массивы', () => {
    const row = mapRow(base())
    expect(row.categories).toEqual([])
    expect(row.images).toEqual([])
  })

  it('без цены и веса отдаёт undefined, а не 0 и не NaN', () => {
    const row = mapRow(base())
    expect(row.price).toBeUndefined()
    expect(row.oldPrice).toBeUndefined()
    expect(row.weight).toBeUndefined()
  })

  it('читает вес с запятой в качестве разделителя', () => {
    const row = mapRow({ ...base(), 'Вес (kg)': '0,45' })
    expect(row.weight).toBe(0.45)
  })

  it('на пустой строке остатка отдаёт stock = 0', () => {
    expect(mapRow(base()).stock).toBe(0)
    expect(mapRow({ ...base(), 'Запасы': '' }).stock).toBe(0)
  })

  it('читает остаток из «Запасы»', () => {
    expect(mapRow({ ...base(), 'Запасы': '17' }).stock).toBe(17)
  })

  it('читает бренд из «Бренд» или «Производитель»', () => {
    expect(mapRow({ ...base(), 'Бренд': 'Muzzle' }).brandName).toBe('Muzzle')
    expect(mapRow({ ...base(), 'Производитель': 'Мужжл' }).brandName).toBe('Мужжл')
    expect(mapRow(base()).brandName).toBeUndefined()
  })

  it('пустой артикул превращается в undefined, а не в пустую строку', () => {
    expect(mapRow({ 'Имя': 'Корм', 'Артикул': '  ' }).sku).toBeUndefined()
  })

  it('подтягивает атрибуты из той же строки', () => {
    const row = mapRow({
      ...base(),
      'Название атрибута 1': 'вид',
      'Значение атрибута 1': 'собаки',
      'Название атрибута 2': 'вкус',
      'Значение атрибута 2': '',
    })
    expect(row.attributes).toEqual([{ name: 'вид', value: 'собаки' }])
  })
})

describe('mapRow — старый английский формат (защита от регресса)', () => {
  it('читает те же поля, что и раньше', () => {
    const row = mapRow({
      name: 'Muzzle Balm',
      slug: 'muzzle-balm',
      description: 'Conditioner for dogs',
      brandSlug: 'muzzle',
      price: '1299.50',
      oldPrice: '1599',
      stock: '12',
      weight: '0.45',
      sku: 'MZ-001',
    })
    expect(row).toEqual({
      name: 'Muzzle Balm',
      slug: 'muzzle-balm',
      description: 'Conditioner for dogs',
      brandSlug: 'muzzle',
      price: 1299.5,
      oldPrice: 1599,
      stock: 12,
      weight: 0.45,
      sku: 'MZ-001',
      categories: [],
      images: [],
      attributes: [],
    })
  })

  it('не переставляет price и oldPrice местами (правило двух цен — только для русского формата)', () => {
    const row = mapRow({ name: 'X', price: '1599', oldPrice: '999' })
    expect(row.price).toBe(1599)
    expect(row.oldPrice).toBe(999)
  })

  it('подставляет name в description, если description пустой', () => {
    expect(mapRow({ name: 'Muzzle Balm', description: '' }).description).toBe('Muzzle Balm')
  })

  it('без цены, старой цены и веса отдаёт undefined', () => {
    const row = mapRow({ name: 'X' })
    expect(row.price).toBeUndefined()
    expect(row.oldPrice).toBeUndefined()
    expect(row.weight).toBeUndefined()
    expect(row.stock).toBe(0)
    expect(row.sku).toBeUndefined()
    expect(row.slug).toBeUndefined()
  })
})

describe('parseCsvLine', () => {
  it('разбирает простую строку без кавычек', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('снимает кавычки со значений', () => {
    expect(parseCsvLine('"Корм","Muzzle"')).toEqual(['Корм', 'Muzzle'])
  })

  it('не разбивает по запятой внутри кавычек', () => {
    expect(parseCsvLine('"Собаки, Кошки",Muzzle')).toEqual(['Собаки, Кошки', 'Muzzle'])
  })

  it('сохраняет пустые поля', () => {
    expect(parseCsvLine('a,,c')).toEqual(['a', '', 'c'])
    expect(parseCsvLine(',,')).toEqual(['', '', ''])
  })

  it('обрезает пробелы вокруг значений', () => {
    expect(parseCsvLine(' a , b ')).toEqual(['a', 'b'])
  })
})

describe('parseRows (CSV)', () => {
  it('собирает объекты по заголовкам', () => {
    const csv = 'Имя,Артикул,Категории\nКорм,A-1,"Собаки, Кошки"\n'
    expect(parseRows(Buffer.from(csv, 'utf-8'), 'import.csv')).toEqual([
      { 'Имя': 'Корм', 'Артикул': 'A-1', 'Категории': 'Собаки, Кошки' },
    ])
  })

  it('добивает пустой строкой недостающие в конце колонки', () => {
    const csv = 'Имя,Артикул\nКорм\n'
    expect(parseRows(Buffer.from(csv, 'utf-8'), 'import.csv')).toEqual([
      { 'Имя': 'Корм', 'Артикул': '' },
    ])
  })

  it('на файле только с заголовками возвращает пустой массив', () => {
    expect(parseRows(Buffer.from('Имя,Артикул\n', 'utf-8'), 'import.csv')).toEqual([])
  })
})
