import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    setEmail('')
    setMessage('')
  }

  return (
    <footer className="bg-blue-50 border-t border-blue-100 mt-12 hidden md:block">
      {/* Верхняя часть */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Форма */}
        <div>
          <h3 className="font-bold text-navy-900 uppercase tracking-wide text-sm mb-4">
            Задайте свой вопрос
          </h3>
          {sent ? (
            <p className="text-blue-300 font-medium animate-fade-in">Спасибо! Ответим в течение часа.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-3 py-2 rounded-lg border border-blue-100 bg-white focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-navy-900 placeholder-navy-300"
              />
              <textarea
                placeholder="Сообщение"
                aria-label="Сообщение"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                className="px-3 py-2 rounded-lg border border-blue-100 bg-white focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-navy-900 placeholder-navy-300 resize-none"
              />
              <button
                type="submit"
                className="bg-blue-200 hover:bg-blue-300 text-navy-900 font-semibold px-4 py-2 rounded-lg transition-all text-sm"
              >
                Отправить
              </button>
            </form>
          )}
          <p className="text-xs text-navy-400 mt-2">*Менеджеры интернет-магазина ответят на ваши вопросы с 9 до 20</p>
        </div>

        {/* График и рейтинг */}
        <div>
          <h3 className="font-bold text-navy-900 uppercase tracking-wide text-sm mb-4">
            График работы
          </h3>
          <div className="flex flex-col gap-0.5 text-navy-700 text-sm mb-5">
            <span>Понедельник – воскресенье</span>
            <span>Круглосуточно</span>
          </div>

          <h3 className="font-bold text-navy-900 uppercase tracking-wide text-sm mb-3">
            Наш рейтинг
          </h3>
          <div className="flex flex-col items-start gap-2">
            <a href="https://market.yandex.ru/" target="_blank" rel="noopener noreferrer">
              <img src="/yandex-market.png" alt="Яндекс Маркет" className="h-16 w-auto object-contain" />
            </a>
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Контакты */}
        <div>
          <h3 className="font-bold text-navy-900 uppercase tracking-wide text-sm mb-4">
            Контакты
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            <a href="tel:+79365050014" className="flex items-center gap-2 text-navy-700 hover:text-blue-300 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.9 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.81 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7 8.91a16 16 0 006.07 6.07l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              +7 936 505-00-14
            </a>
            <a href="mailto:info@simba.ru" className="flex items-center gap-2 text-navy-700 hover:text-blue-300 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              info@simba.ru
            </a>
            <a href="https://avito.ru" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-navy-700 hover:text-blue-300 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15,3 21,3 21,9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Мы на Avito
            </a>
            <a href="https://t.me/simbazoo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-navy-700 hover:text-blue-300 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9"/>
              </svg>
              Telegram
            </a>
          </div>
        </div>

        {/* Навигация */}
        <div>
          <h3 className="font-bold text-navy-900 uppercase tracking-wide text-sm mb-4">
            Навигация
          </h3>
          <nav className="flex flex-col gap-2">
            {[
              { label: 'О компании', href: '/about' },
              { label: 'Доставка и оплата', href: '/delivery' },
              { label: 'Обмен и возврат товара', href: '/returns' },
              { label: 'Бонусная программа', href: '/bonuses' },
              { label: 'Блог', href: '/blog' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-navy-700 hover:text-blue-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Нижняя полоска */}
      <div className="bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-white text-sm font-medium">2026 © ЗООМАГАЗИН СИМБА</span>
          <div className="flex flex-wrap gap-4 text-navy-300 text-xs">
            <Link to="/requisites" className="hover:text-white transition-colors">РЕКВИЗИТЫ</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</Link>
            <a href="https://simbazoo.ru" className="hover:text-white transition-colors">РАЗРАБОТКА САЙТА</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
