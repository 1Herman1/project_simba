import { useState, useRef, useEffect } from 'react'
import type { QuizQuestion, QuizAnswers } from '../../lib/quiz-config'

interface QuizQuestionProps {
  question: QuizQuestion
  currentAnswers: Partial<QuizAnswers>
  onAnswer: (value: string | string[], fieldId: string) => void
  onNext?: () => void
  onPrev?: () => void
  showPrevButton: boolean
  isLastQuestion: boolean
}

export default function QuizQuestionComponent({
  question,
  currentAnswers,
  onAnswer,
  onNext,
  onPrev,
  showPrevButton,
  isLastQuestion,
}: QuizQuestionProps) {
  const fieldValue = currentAnswers[question.id as keyof QuizAnswers]
  const isMultiple = question.multiple ?? false
  const selectedValues = isMultiple ? (fieldValue as string[] | undefined) || [] : []
  const selectedSingle = !isMultiple ? (fieldValue as string | undefined) : null
  const titleRef = useRef<HTMLHeadingElement>(null)

  const [showReduceMotion] = useState(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  })

  useEffect(() => {
    titleRef.current?.focus()
  }, [question.id])

  const handleOptionClick = (value: string) => {
    if (isMultiple) {
      let newValues = [...selectedValues]

      if (value === 'none') {
        newValues = ['none']
      } else if (selectedValues.includes('none')) {
        newValues = [value]
      } else if (newValues.includes(value)) {
        newValues = newValues.filter((v) => v !== value)
      } else {
        newValues.push(value)
      }

      onAnswer(newValues, question.id)
    } else {
      onAnswer(value, question.id)

      // Auto-transition after 350ms (подтверждение выбора, не анимация)
      // Остаётся 300мс даже при prefers-reduced-motion
      if (onNext) {
        const delay = showReduceMotion ? 300 : 350
        setTimeout(() => onNext(), delay)
      }
    }
  }

  const isAnswered = isMultiple
    ? selectedValues.length > 0
    : selectedSingle !== null && selectedSingle !== undefined

  return (
    <div className="min-h-[100dvh] flex flex-col bg-blue-50">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
        {/* Question title */}
        <h2
          ref={titleRef}
          id="quiz-q"
          tabIndex={-1}
          className="text-2xl md:text-3xl font-bold text-navy-900 mb-8 md:mb-12 focus:outline-none"
        >
          {question.question}
        </h2>

        {/* Options grid */}
        <div
          role={isMultiple ? 'group' : 'radiogroup'}
          aria-labelledby="quiz-q"
          className="space-y-3 mb-12"
          aria-live="polite"
        >
          {question.options.map((option) => {
            const isSelected = isMultiple
              ? selectedValues.includes(option.value)
              : selectedSingle === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                role={isMultiple ? 'checkbox' : 'radio'}
                aria-checked={isSelected}
                className={`w-full p-4 rounded-xl border-2 text-left transition-[transform,border-color,background-color] duration-100 ease active:scale-[0.98] ${
                  isSelected
                    ? 'border-primary-soft bg-white text-navy-900'
                    : 'border-line text-navy-700 bg-white hover:border-primary-soft hover:bg-blue-50'
                } ${
                  'min-h-[44px] flex items-center'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-base">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-navy-500 mt-1">{option.description}</div>
                  )}
                </div>
                {isMultiple && (
                  <div
                    className={`ml-4 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-primary-soft bg-primary' : 'border-navy-300'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 justify-between">
          {showPrevButton && (
            <button
              onClick={onPrev}
              className="px-6 py-3 rounded-xl border border-line text-navy-700 font-medium hover:bg-white transition-colors duration-100 ease flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Назад
            </button>
          )}

          <div className="flex-1" />

          {(isMultiple || isLastQuestion) && (
            <button
              onClick={onNext}
              disabled={!isAnswered}
              className="px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed btn-primary transition-colors duration-100 ease flex items-center gap-2"
            >
              {isLastQuestion ? (
                <>
                  Готово
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </>
              ) : (
                <>
                  Далее
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
