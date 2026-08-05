import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS, LEGAL } from '../lib/contacts'

export default function OfferPage() {
  useMetaTags({
    title: 'Публичная оферта — Симба',
    description: 'Условия продажи товаров в зоомагазине Симба: оформление, оплата, доставка и возврат.',
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-3">
        Публичная оферта
      </h1>
      <p className="text-navy-500 leading-relaxed mb-8">
        Здесь будет размещён полный текст публичной оферты — договора купли-продажи.
        Документ готовится и появится до запуска магазина.
      </p>

      <div className="bg-white border border-line rounded-card p-6 space-y-3">
        <p className="text-navy-700 font-semibold">Коротко о главном</p>
        <p className="text-navy-500 leading-relaxed">
          Оформляя заказ на сайте, вы соглашаетесь с условиями продажи. Цены указаны в рублях,
          оплата — при получении или онлайн. Условия доставки и возврата описаны на страницах
          «Доставка и оплата» и «Обмен и возврат».
        </p>
        <p className="text-navy-500 leading-relaxed">
          Вопросы по условиям заказа — на{' '}
          <a
            href={CONTACTS.emailHref}
            className="font-medium text-navy-700 hover:text-primary-hover transition-colors duration-100 ease"
          >
            {CONTACTS.email}
          </a>
          .
        </p>
      </div>

      <p className="mt-8 pt-6 border-t border-line text-sm text-navy-500">
        {LEGAL.entity} · {LEGAL.inn} · {LEGAL.ogrnip} · {LEGAL.address}
      </p>
    </div>
  )
}
