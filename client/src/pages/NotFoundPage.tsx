import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'

export default function NotFoundPage() {
  useMetaTags({
    title: 'Страница не найдена — Зоомагазин Симба',
    description: 'Такой страницы нет. Вернитесь в каталог кормов и товаров для животных.',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
      <h1 className="text-2xl md:text-[32px] font-bold text-navy-900">Такой страницы нет</h1>
      <p className="mt-3 text-navy-500 max-w-prose">
        Возможно, ссылка устарела или в адресе опечатка. Загляните в каталог — там всё, что есть в
        наличии.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          to="/catalog"
          className="inline-flex items-center justify-center min-h-11 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors duration-100 ease"
        >
          В каталог
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center min-h-11 px-6 rounded-xl border border-line text-navy-900 font-semibold hover:bg-primary-tint transition-colors duration-100 ease"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
