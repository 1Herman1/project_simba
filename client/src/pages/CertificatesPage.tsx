import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS } from '../lib/contacts'

function DocumentIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

/**
 * Сертификаты и декларации. Массив данных ниже готов принять реальные файлы.
 * Когда понадобится добавить документ:
 * 1. Скопировать сканированный PDF в client/public/ (например: public/certificates/farmina-nd-declaration.pdf)
 * 2. Заполнить поле file: '/certificates/farmina-nd-declaration.pdf'
 * 3. Кликабельная карточка автоматически соберётся с ссылкой и aria-label
 */
type Certificate = {
  brand: string
  doc: string
  file: string | null
}

const certificates: Certificate[] = [
  { brand: 'Farmina N&D', doc: 'Декларация ЕАЭС', file: null },
  { brand: 'Farmina Vet Life', doc: 'Декларация ЕАЭС', file: null },
  { brand: 'Monge', doc: 'Декларация ЕАЭС', file: null },
  { brand: 'Monge VetSolution', doc: 'Декларация ЕАЭС', file: null },
]

export default function CertificatesPage() {
  useMetaTags({
    title: 'Сертификаты и декларации на корма — Симба',
    description:
      'Декларации соответствия ЕАЭС на корма Farmina и Monge из нашего ассортимента. Документы на конкретную партию пришлём по запросу.',
  })

  // Проверяем, есть ли хотя бы один файл в декларациях
  const hasFiles = certificates.some(c => c.file)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-3">Документы на продукцию</h1>

      <p className="text-navy-500 max-w-prose mb-10 leading-relaxed">
        Мы работаем напрямую с официальными дистрибьюторами Farmina и Monge. Здесь опубликованы декларации соответствия на
        продукцию из нашего ассортимента. Если вы хотите увидеть документы на конкретную партию из вашего заказа — напишите
        нам в Telegram, пришлём.
      </p>

      {/* Если нет файлов — показываем инфо-блок */}
      {!hasFiles && (
        <div className="bg-primary-tint rounded-card p-5 mb-10">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">Какие документы у нас есть</h2>
          <div className="mb-6">
            <p className="text-navy-500 mb-2">Farmina N&D</p>
            <p className="text-navy-500 mb-2">Farmina Vet Life</p>
            <p className="text-navy-500 mb-2">Monge</p>
            <p className="text-navy-500">Monge VetSolution</p>
          </div>
          <p className="text-navy-500">
            Декларации соответствия ЕАЭС есть на всю продукцию из ассортимента. Пришлём скан на конкретную партию — напишите в Telegram.
          </p>
        </div>
      )}

      {/* Сетка сертификатов — только если есть файлы */}
      {hasFiles && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {certificates.map((cert) => (
            <div key={`${cert.brand}-${cert.doc}`}>
              {cert.file ? (
                <a
                  href={cert.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-line rounded-card p-4 flex flex-col items-center h-full hover:border-primary-soft transition-colors duration-100 ease"
                  aria-label={`${cert.doc} ${cert.brand}, откроется в новой вкладке`}
                >
                  <div className="bg-primary-tint rounded-xl aspect-[3/4] flex items-center justify-center mb-3 w-full">
                    <div className="text-primary-soft">
                      <DocumentIcon />
                    </div>
                  </div>
                  <h3 className="font-bold text-navy-900 text-center text-sm">{cert.brand}</h3>
                  <p className="text-xs text-navy-500 text-center">{cert.doc}</p>
                </a>
              ) : (
                <div className="bg-white border border-line rounded-card p-4 flex flex-col items-center h-full">
                  <div className="bg-primary-tint rounded-xl aspect-[3/4] flex items-center justify-center mb-3 w-full">
                    <div className="text-primary-soft">
                      <DocumentIcon />
                    </div>
                  </div>
                  <h3 className="font-bold text-navy-900 text-center text-sm">{cert.brand}</h3>
                  <p className="text-xs text-navy-500 text-center">{cert.doc}</p>
                  <p className="text-xs text-navy-500 mt-auto pt-3">Скоро</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-10 pt-6 border-t border-line flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-navy-500">Нужны документы на партию из вашего заказа</p>
        <a
          href={CONTACTS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-white rounded-xl px-6 font-bold hover:bg-primary-hover transition-colors duration-100 ease inline-flex items-center justify-center min-h-11"
        >
          Написать в Telegram
        </a>
      </div>
    </div>
  )
}
