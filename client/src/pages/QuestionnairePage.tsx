import { useEffect, useState, useRef } from 'react'
import { useMetaTags } from '../hooks/useMetaTags'
import { quizApi, type QuizMatchResponse } from '../lib/api'
import { allQuestions, getVisibleQuestions, type QuizAnswers } from '../lib/quiz-config'
import QuizIntro from '../components/quiz/QuizIntro'
import QuizProgress from '../components/quiz/QuizProgress'
import QuizQuestion from '../components/quiz/QuizQuestion'
import QuizResult from '../components/quiz/QuizResult'
import QuizLoading from '../components/quiz/QuizLoading'

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
  // Переход к следующему вопросу планируется через setTimeout, и его колбэк
  // держит ответы того рендера, в котором был клик. На последнем вопросе это
  // означало отправку без только что выбранного значения — сервер отвечал
  // «Required», а повторная попытка уже проходила. Читаем ответы из ref.
  const answersRef = useRef<Partial<QuizAnswers>>({})
  // Индикатор не показываем первые 250мс: если сервер ответил быстро, вспышка
  // «загрузки» читается как глюк. Показали — держим минимум 700мс, иначе то же
  // мигание, просто сдвинутое.
  const [showLoader, setShowLoader] = useState(false)
  const loaderShownAt = useRef(0)

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
    answersRef.current = { ...answersRef.current, [fieldId]: value }
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }))

    // Clear conditional fields if condition no longer applies
    if (fieldId === 'health' && Array.isArray(value) && !value.includes('allergy')) {
      // Clear avoid when allergy is deselected
      answersRef.current = { ...answersRef.current, avoid: [] }
      setAnswers((prev) => ({
        ...prev,
        avoid: [],
      }))
    }
  }

  // Handle next question
  const handleNext = () => {
    // Тот же стилевой момент, что и с отправкой: отложенный колбэк видит ответы
    // предыдущего рендера, поэтому «последний ли это вопрос» считаем по ref.
    const current = answersRef.current
    const isLast =
      !!current.species &&
      currentQuestionIndex === getVisibleQuestions(current).length - 1

    if (isLast) {
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
    setShowLoader(false)

    const showTimer = window.setTimeout(() => {
      loaderShownAt.current = Date.now()
      setShowLoader(true)
    }, 250)

    const settle = async (next: () => void) => {
      window.clearTimeout(showTimer)
      if (loaderShownAt.current) {
        const left = 700 - (Date.now() - loaderShownAt.current)
        if (left > 0) await new Promise((r) => setTimeout(r, left))
      }
      loaderShownAt.current = 0
      next()
    }

    try {
      const answers = answersRef.current

      // Prepare health array - filter out weight/sterilized values that shouldn't be sent to server
      let cleanHealth = (answers.health || []).filter((v) =>
        v !== 'overweight' && v !== 'underweight' && v !== 'sterilized'
      )

      // Extract weight from health (can be set by user choosing overweight/underweight)
      let weight = answers.weight || 'normal'
      if (answers.health?.includes('overweight')) {
        weight = 'overweight'
      } else if (answers.health?.includes('underweight')) {
        weight = 'underweight'
      }

      // If health is empty after filtering, send 'none' (server requires min(1))
      if (cleanHealth.length === 0) {
        cleanHealth = ['none']
      }

      // Build request body matching backend contract
      const requestBody: any = {
        species: answers.species,
        // Common fields
        age: answers.age,
        weight: weight,
        health: cleanHealth,
        avoid: answers.avoid || [],
        format: answers.format,
        flavor: answers.flavor,
        philosophy: answers.philosophy,
        brand: answers.brand,
      }

      // Dog-specific fields
      if (answers.species === 'dog') {
        requestBody.size = answers.size
        requestBody.activity = answers.activity || 'normal'
      }

      // Cat-specific fields
      if (answers.species === 'cat') {
        // Extract sterilized status from health array
        requestBody.sterilized = answers.health?.includes('sterilized') ?? false
        requestBody.lifestyle = answers.lifestyle
      }

      const res = await quizApi.match(requestBody)

      // Store session ID for bonus claim
      localStorage.setItem('quizSessionId', res.data.sessionId)

      await settle(() => {
        setResult(res.data)
        setPhase('result')
      })
    } catch (err: any) {
      console.error('Quiz submission error:', err)
      await settle(() => {
        setError(
          err?.response?.data?.error || 'Не получилось подобрать корм. Попробуйте ещё раз'
        )
        setPhase('error')
      })
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
    answersRef.current = {}
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
    // Пустая подложка вместо null — чтобы страница не схлопывалась и не дёргала скролл.
    return showLoader ? <QuizLoading /> : <div className="min-h-[100dvh] bg-blue-50" />
  }

  if (phase === 'error') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-blue-50 px-4">
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
      <div className="min-h-[100dvh] flex items-center justify-center bg-blue-50">
        <p className="text-navy-600">Загрузка вопроса...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-white">
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
