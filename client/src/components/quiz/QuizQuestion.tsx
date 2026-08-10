import { useState } from 'react'
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

  const [showReduceMotion] = useState(() => {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  })

  const handleOptionClick = (value: string) => {
    if (isMultiple) {
      // Multiple selection logic
      let newValues = [...selectedValues]

      if (value === 'none') {
        // Clicking "none" clears all other selections
        newValues = ['none']
      } else if (selectedValues.includes('none')) {
        // If "none" was selected, clicking anything else deselects it
        newValues = [value]
      } else if (newValues.includes(value)) {
        // Deselect if already selected
        newValues = newValues.filter((v) => v !== value)
      } else {
        // Add to selection
        newValues.push(value)
      }

      onAnswer(newValues, question.id)
    } else {
      // Single selection - just answer and prepare for auto-transition
      onAnswer(value, question.id)

      // Auto-transition to next question after 250-300ms (respecting prefers-reduced-motion)
      // On last question, trigger submit instead
      if (onNext) {
        const delay = showReduceMotion ? 0 : 250
        setTimeout(() => onNext(), delay)
      }
    }
  }

  const isAnswered = isMultiple
    ? selectedValues.length > 0
    : selectedSingle !== null && selectedSingle !== undefined

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
        {/* Question title */}
        <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-8 md:mb-12">
          {question.question}
        </h2>

        {/* Options grid */}
        <div className="space-y-3 mb-12">
          {question.options.map((option) => {
            const isSelected = isMultiple
              ? selectedValues.includes(option.value)
              : selectedSingle === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                role={isMultiple ? 'checkbox' : undefined}
                aria-pressed={!isMultiple ? isSelected : undefined}
                aria-checked={isMultiple ? isSelected : undefined}
                className={`w-full p-4 rounded-xl border-2 text-left transition-colors duration-100 ease ${
                  isSelected
                    ? 'border-primary-soft bg-blue-50 text-navy-900'
                    : 'border-line text-navy-700 hover:border-primary-soft hover:bg-blue-50'
                } ${
                  // Minimum 44px touch target
                  'min-h-[44px] flex items-center'
                }`}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
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
              className="px-6 py-3 rounded-xl border border-line text-navy-700 font-medium hover:bg-blue-50 transition-colors duration-100 ease"
            >
              ← Назад
            </button>
          )}

          <div className="flex-1" />

          {(isMultiple || isLastQuestion) && (
            <button
              onClick={onNext}
              disabled={!isAnswered}
              className="px-6 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed btn-primary transition-colors duration-100 ease"
              aria-label={isLastQuestion ? 'Завершить опрос' : 'Перейти к следующему вопросу'}
            >
              {isLastQuestion ? 'Готово ✓' : 'Далее →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
