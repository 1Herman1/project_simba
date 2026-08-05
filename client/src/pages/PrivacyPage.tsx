import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS, LEGAL } from '../lib/contacts'

export default function PrivacyPage() {
  useMetaTags({
    title: 'Политика конфиденциальности — Симба',
    description: 'Как зоомагазин Симба обрабатывает и защищает персональные данные покупателей.',
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-3">
        Политика конфиденциальности
      </h1>
      <p className="text-navy-500 leading-relaxed mb-8">
        Здесь будет размещён полный текст политики обработки персональных данных.
        Документ готовится и появится до запуска магазина.
      </p>

      <div className="bg-white border border-line rounded-card p-6 space-y-3">
        <p className="text-navy-700 font-semibold">Коротко о главном</p>
        <p className="text-navy-500 leading-relaxed">
          Мы собираем только те данные, которые нужны для оформления и доставки заказа
          (имя, контакты, адрес). Не передаём их третьим лицам, кроме служб доставки и
          платёжных систем, и не используем для рассылок без вашего согласия.
        </p>
        <p className="text-navy-500 leading-relaxed">
          По любым вопросам об обработке данных пишите на{' '}
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
