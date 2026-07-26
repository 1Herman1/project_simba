/**
 * Единственный источник контактов магазина. Раньше телефон и почта были
 * продублированы в шапке и подвале — расходились при первой же правке.
 */
export const CONTACTS = {
  phone: '+7 936 505-00-14',
  phoneHref: 'tel:+79365050014',
  email: 'info@simba.ru',
  emailHref: 'mailto:info@simba.ru',
  telegram: 'https://t.me/simbazoo',
  hours: 'Отвечаем ежедневно 9:00–21:00',
  orders: 'Заказы на сайте — круглосуточно.',
} as const

export const MARKETPLACES = [
  {
    name: 'Яндекс Маркет',
    rating: '4,9',
    stats: '13 000+ заказов · 3 000+ отзывов',
    url: 'https://market.yandex.ru/',
  },
  {
    name: 'Ozon',
    rating: '4,9',
    stats: '6 200+ заказов · 1 200+ отзывов',
    url: 'https://www.ozon.ru/',
  },
  {
    name: 'Авито',
    rating: '4,9',
    stats: '5 000+ заказов · 1 000+ отзывов',
    url: 'https://www.avito.ru/',
  },
] as const

/** Реквизиты ИП. Заполнить перед публикацией — см. чек-лист запуска. */
export const LEGAL = {
  entity: 'ИП [Фамилия И. О.]',
  inn: 'ИНН [...]',
  city: 'Москва',
} as const
