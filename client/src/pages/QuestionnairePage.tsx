import { useEffect, useState, useRef } from 'react'
import { useMetaTags } from '../hooks/useMetaTags'
import { quizApi, type QuizMatchResponse } from '../lib/api'
import { allQuestions, getVisibleQuestions, type QuizAnswers } from '../lib/quiz-config'
import QuizIntro from '../components/quiz/QuizIntro'
import QuizProgress from '../components/quiz/QuizProgress'
import QuizQuestion from '../components/quiz/QuizQuestion'
import QuizResult from '../components/quiz/QuizResult'

type Phase = 'intro' | 'quiz' | 'loading' | 'result' | 'error'

export default function QuestionnairePage() {
  useMetaTags({
    title: 'Подбор корма для кошки и собаки — Симба',
    description:
      'Ответьте на несколько вопросов о питомце и получите рекомендацию: линейку и вкус корма, а не просто бренд.',
  })

  const [phase, setPhase] = useState<Phase>('intro')
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [result, setResult] = useState<QuizMatchResponse | null>(null)
  const [error, setError] = useState<string>('')
  const bonusClaimedRef = useRef(false)

  // Get visible questions based on current answers
  const visibleQuestions = getVisibleQuestions(answers)
  const currentQuestion = visibleQuestions[currentQuestionIndex]
  // Пока species не выбран, видим только Q0 (длина списка = 1), и без этой
  // проверки Q0 ошибочно считался бы «последним вопросом» — сработал бы
  // автосабмит квиза сразу после выбора вида животного, с пустыми ответами.
  const isLastQuestion = !!answers.species && currentQuestionIndex === visibleQuestions.length - 1
  const showPrevButton = currentQuestionIndex > 0

  // Handle answer
  const handleAnswer = (value: string | string[], fieldId: string) => {
    // Special handling for sterilized (cat-only boolean field)
    if (fieldId === 'sterilized') {
      const isTrue = value === 'true' || value === 'planned'
      setAnswers((prev) => ({
        ...prev,
        [fieldId]: isTrue,
      }))
    } else {
      setAnswers((prev) => ({
        ...prev,
        [fieldId]: value,
      }))
    }

    // Clear conditional fields if condition no longer applies
    if (fieldId === 'health' && !Array.isArray(value)) {
      // health should always be an array, but just in case
    }
    if (fieldId === 'health' && Array.isArray(value) && !value.includes('allergy')) {
      // Clear avoid when allergy is deselected
      setAnswers((prev) => ({
        ...prev,
        avoid: [],
      }))
    }
  }

  // Handle next question
  const handleNext = () => {
    if (isLastQuestion) {
      // Last question answered - submit quiz
      submitQuiz()
    } else {
      // Move to next visible question
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  // Handle previous question
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  // Submit quiz
  const submitQuiz = async () => {
    setPhase('loading')
    setError('')

    try {
      // Build request body matching backend contract
      const requestBody: any = {
        species: answers.species,
        // Common fields
        age: answers.age,
        weight: answers.weight,
        health: answers.health || [],
        avoid: answers.avoid || [],
        format: answers.format,
        flavor: answers.flavor,
        philosophy: answers.philosophy,
        brand: answers.brand,
      }

      // Dog-specific fields
      if (answers.species === 'dog') {
        requestBody.size = answers.size
        requestBody.activity = answers.activity
      }

      // Cat-specific fields
      if (answers.species === 'cat') {
        requestBody.sterilized = answers.sterilized ?? false
        requestBody.lifestyle = answers.lifestyle
      }

      const res = await quizApi.match(requestBody)
      setResult(res.data)

      // Store session ID for bonus claim
      localStorage.setItem('quizSessionId', res.data.sessionId)

      setPhase('result')
    } catch (err: any) {
      console.error('Quiz submission error:', err)
      setError(
        err?.response?.data?.error || 'Не получилось подобрать корм. Попробуйте ещё раз'
      )
      setPhase('error')
    }
  }

  // Handle retry after error
  const handleRetry = async () => {
    await submitQuiz()
  }

  // Start quiz
  const handleStart = () => {
    setPhase('quiz')
    setAnswers({})
    setCurrentQuestionIndex(0)
  }

  // Claim bonus after login
  useEffect(() => {
    const claimBonusIfNeeded = async () => {
      const token = localStorage.getItem('token')
      const sessionId = localStorage.getItem('quizSessionId')

      if (token && sessionId && result?.bonus?.status === 'guest') {
        // Prevent double-claim by setting ref synchronously before API call
        if (bonusClaimedRef.current) return
        bonusClaimedRef.current = true

        try {
          await quizApi.claimBonus(sessionId)
          localStorage.removeItem('quizSessionId')
          // Update result to reflect claimed bonus
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  bonus: { ...prev.bonus, status: 'already_granted' },
                }
              : prev
          )
        } catch (err) {
          console.error('Failed to claim bonus:', err)
          bonusClaimedRef.current = false
        }
      }
    }

    if (phase === 'result') {
      claimBonusIfNeeded()
    }
  }, [phase, result?.sessionId, result?.bonus?.status])

  // Render based on phase
  if (phase === 'intro') {
    return <QuizIntro onStart={handleStart} />
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
          <p className="text-navy-600">Подбираем идеальный корм...</p>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">
            Что-то пошло не так
          </h1>
          <p className="text-navy-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="btn-primary px-8 py-3 rounded-xl font-medium"
          >
            Попробовать ещё раз
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return <QuizResult result={result} />
  }

  // Quiz phase
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-navy-600">Загрузка вопроса...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <QuizProgress current={currentQuestionIndex + 1} total={visibleQuestions.length} />

      <QuizQuestion
        question={currentQuestion}
        currentAnswers={answers}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={handlePrev}
        showPrevButton={showPrevButton}
        isLastQuestion={isLastQuestion}
      />
    </div>
  )
}
