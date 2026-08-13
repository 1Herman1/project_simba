import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cartApi, type QuizMatchResponse } from '../../lib/api'
import QuizProductCard from './QuizProductCard'
import { pluralize } from '../../lib/format'

interface QuizResultProps {
  result: QuizMatchResponse
  onClaimBonus?: () => void
}

export default function QuizResult({ result, onClaimBonus }: QuizResultProps) {
  const [addedMain, setAddedMain] = useState(false)
  const [addedBoth, setAddedBoth] = useState(false)
  const [isAddingMain, setIsAddingMain] = useState(false)
  const [isAddingBoth, setIsAddingBoth] = useState(false)

  const handleAddMainToCart = async () => {
    if (!result.main.variant || isAddingMain) return
    setIsAddingMain(true)
    try {
      await cartApi.addItem(result.main.variant.id, 1)
      setAddedMain(true)
      setTimeout(() => setAddedMain(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingMain(false)
    }
  }

  const handleAddBothToCart = async () => {
    if (!result.main.variant || !result.pair?.variant || isAddingBoth) return
    setIsAddingBoth(true)
    try {
      await Promise.all([
        cartApi.addItem(result.main.variant.id, 1),
        cartApi.addItem(result.pair.variant.id, 1),
      ])
      setAddedBoth(true)
      setTimeout(() => setAddedBoth(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingBoth(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-navy-900 mb-2">
          🎉 Мы подобрали корм для вашего питомца
        </h1>

        {/* Fallback note */}
        {result.fallbackNote && (
          <p className="text-navy-600 text-sm mb-8 italic">{result.fallbackNote}</p>
        )}

        {result.shortfall && (
          <p className="text-navy-600 text-sm mb-8">
            Под ваши условия подошло только{' '}
            {pluralize(result.shortfall.found, 'вариант', 'варианта', 'вариантов')}.{' '}
            <Link to="/catalog" className="underline">
              Посмотреть весь каталог
            </Link>
          </p>
        )}

        {/* Main product */}
        <div className="mb-8">
          <QuizProductCard product={result.main} variant="main" onAddToCart={handleAddMainToCart} />
        </div>

        {/* Reasons */}
        <div className="bg-blue-50 rounded-xl p-6 md:p-8 mb-8">
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Почему именно этот корм:</h3>
          <ul className="space-y-3">
            {result.reasons.map((reason, idx) => (
              <li key={idx} className="flex gap-3 text-navy-700">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pair product (if mixed format) */}
        {result.pair && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Рекомендуем добавить влажный корм:</h3>
            <QuizProductCard product={result.pair} variant="alt" />
            <button
              onClick={handleAddBothToCart}
              disabled={isAddingBoth}
              className={`w-full mt-4 py-3 rounded-xl font-medium transition-colors ${
                addedBoth
                  ? 'bg-green-100 text-green-700'
                  : 'btn-primary'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addedBoth ? '✓ Оба добавлены в корзину' : 'Добавить оба в корзину'}
            </button>
          </div>
        )}

        {/* Bonus section */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">🎁</span>
            <div className="flex-1">
              {result.bonus.status === 'granted' && (
                <>
                  <h4 className="font-semibold text-navy-900 mb-2">
                    Вам начислено {result.bonus.amount} бонусов за прохождение подбора!
                  </h4>
                  <p className="text-navy-600">
                    Спишите их при оформлении первого заказа.
                  </p>
                </>
              )}

              {result.bonus.status === 'already_granted' && (
                <>
                  <h4 className="font-semibold text-navy-900 mb-2">
                    {result.bonus.amount} бонусов уже на вашем счету
                  </h4>
                  <p className="text-navy-600">
                    Спишите их при оформлении заказа
                  </p>
                </>
              )}

              {result.bonus.status === 'guest' && (
                <>
                  <h4 className="font-semibold text-navy-900 mb-2">
                    {result.bonus.amount} бонусов ждут вас!
                  </h4>
                  <p className="text-navy-600 mb-4">
                    Войдите или зарегистрируйтесь, чтобы забрать бонусы и применить их к заказу.
                  </p>
                  <Link
                    to="/auth"
                    className="inline-block btn-primary px-6 py-2 rounded-lg text-sm font-medium"
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
          <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-8">
            <p className="text-xs text-navy-600">
              {result.disclaimers.join(' ')}
            </p>
          </div>
        )}

        {/* Alternatives */}
        {result.alternatives.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Также подойдёт:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.alternatives.map((alt) => (
                <QuizProductCard key={alt.id} product={alt} variant="alt" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
