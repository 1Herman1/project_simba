import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import type { QuizMatchResponse } from '../../lib/api'
import QuizProductCard from './QuizProductCard'
import GiftIcon from './GiftIcon'
import { pluralize } from '../../lib/format'

interface QuizResultProps {
  result: QuizMatchResponse
}

export default function QuizResult({ result }: QuizResultProps) {
  const [addedMain, setAddedMain] = useState(false)
  const [addedBoth, setAddedBoth] = useState(false)
  const [errorMain, setErrorMain] = useState(false)
  const [errorBoth, setErrorBoth] = useState(false)
  const [isAddingMain, setIsAddingMain] = useState(false)
  const [isAddingBoth, setIsAddingBoth] = useState(false)
  const { addItem } = useCart()

  const handleAddMainToCart = async () => {
    if (!result.main.variant || isAddingMain) return
    setIsAddingMain(true)
    setErrorMain(false)
    try {
      await addItem(result.main.variant.id, 1)
      setAddedMain(true)
      setTimeout(() => setAddedMain(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setErrorMain(true)
    } finally {
      setIsAddingMain(false)
    }
  }

  const handleAddBothToCart = async () => {
    if (!result.main.variant || !result.pair?.variant || isAddingBoth) return
    setIsAddingBoth(true)
    setErrorBoth(false)
    try {
      await addItem(result.main.variant.id, 1)
      await addItem(result.pair.variant.id, 1)
      setAddedBoth(true)
      setTimeout(() => setAddedBoth(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setErrorBoth(true)
    } finally {
      setIsAddingBoth(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
          Мы подобрали корм для вашего питомца
        </h1>

        {/* Fallback note */}
        {result.fallbackNote && (
          <div className="flex items-start gap-3 bg-white border border-line rounded-card p-4 mb-8">
            <svg className="w-5 h-5 text-navy-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-navy-700">{result.fallbackNote}</p>
          </div>
        )}

        {result.shortfall && (
          <p className="text-navy-600 text-sm mb-8">
            По вашим условиям в каталоге нашлось{' '}
            {pluralize(result.shortfall.found, 'вариант', 'варианта', 'вариантов')}.{' '}
            <Link to="/catalog" className="text-primary-hover font-medium underline underline-offset-2">
              Посмотреть похожие в каталоге
            </Link>
          </p>
        )}

        {/* Main product */}
        <div className="mb-8">
          <div className="relative">
            <QuizProductCard product={result.main} variant="main" onAddToCart={handleAddMainToCart} added={addedMain} />
            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              Основная рекомендация
            </span>
          </div>
          {errorMain && (
            <div role="alert" className="text-sm text-red-600 mt-2">
              Не получилось добавить. Попробуйте ещё раз.
            </div>
          )}
        </div>

        {/* Reasons */}
        <div className="bg-white border border-line rounded-card p-6 md:p-8 mb-8">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Почему именно этот корм:</h2>
          <ul className="space-y-3">
            {result.reasons.map((reason, idx) => (
              <li key={idx} className="flex gap-3 text-navy-700">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pair product (if mixed format) */}
        {result.pair && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Рекомендуем добавить влажный корм:</h2>
            <QuizProductCard product={result.pair} variant="alt" added={addedBoth} />
            {errorBoth && (
              <div role="alert" className="text-sm text-red-600 mt-2">
                Не получилось добавить. Попробуйте ещё раз.
              </div>
            )}
            <button
              onClick={handleAddBothToCart}
              disabled={isAddingBoth}
              className={`w-full mt-4 py-3 rounded-xl font-medium transition-colors ${
                addedBoth
                  ? 'bg-white border border-line text-navy-900'
                  : 'btn-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addedBoth ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Оба добавлены в корзину
                </span>
              ) : (
                'Добавить оба в корзину'
              )}
            </button>
          </div>
        )}

        {/* Alternatives */}
        {result.alternatives.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Также подойдёт:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.alternatives.map((alt) => (
                <QuizProductCard key={alt.id} product={alt} variant="alt" />
              ))}
            </div>
          </div>
        )}

        {/* Bonus section */}
        <div className="bg-amber-50 rounded-card p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-amber-500 flex-shrink-0">
              <GiftIcon />
            </span>
            <div className="flex-1">
              {result.bonus.status === 'granted' && (
                <>
                  <h3 className="font-semibold text-navy-900 mb-2">
                    Вам начислено {result.bonus.amount} бонусов за подбор корма
                  </h3>
                  <p className="text-navy-600">
                    Спишите их при оформлении первого заказа.
                  </p>
                </>
              )}

              {result.bonus.status === 'already_granted' && (
                <>
                  <h3 className="font-semibold text-navy-900 mb-2">
                    {result.bonus.amount} бонусов уже на вашем счету
                  </h3>
                  <p className="text-navy-600">
                    Спишите их при оформлении заказа
                  </p>
                </>
              )}

              {result.bonus.status === 'guest' && (
                <>
                  <h3 className="font-semibold text-navy-900 mb-2">
                    {result.bonus.amount} бонусов ждут вас
                  </h3>
                  <p className="text-navy-600 mb-4">
                    Войдите или зарегистрируйтесь, чтобы забрать бонусы и применить их к заказу.
                  </p>
                  <Link
                    to="/auth"
                    className="inline-block btn-outline px-6 py-2 rounded-lg text-sm font-medium"
                  >
                    Войти в аккаунт
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        {result.disclaimers.length > 0 && (
          <div className="bg-white border border-line rounded-card p-4 md:p-6">
            <p className="text-sm text-navy-500">
              {result.disclaimers.join(' ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
