import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import WelcomeBonusPopup from '../components/WelcomeBonusPopup'

type Step = 'input' | 'code'

const CODE_LENGTH = 6
const WELCOME_BONUS = 300

export default function AuthPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('input')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [welcomeBonus, setWelcomeBonus] = useState(0)
  const [stepIn, setStepIn] = useState(false)
  const [logoIn, setLogoIn] = useState(false)

  // Анимация появления шага
  useEffect(() => {
    setStepIn(true)
  }, [step])

  // Анимация появления логотипа — один раз при заходе на страницу
  useEffect(() => {
    setLogoIn(true)
  }, [])

  // Валидация email
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/.test(email)

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) {
          clearInterval(interval)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Введите email')
      return
    }

    if (!isEmailValid) {
      setError('Проверьте адрес — похоже, есть опечатка')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authApi.sendOtp(email.trim())
      setStep('code')
      setStepIn(false)
      setTimeout(() => setStepIn(true), 10)
      startResendTimer()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length < CODE_LENGTH) {
      setError('Введите 6-значный код')
      return
    }

    setLoading(true)
    setError('')

    try {
      const guestToken = localStorage.getItem('guestToken')
      const res = await authApi.verifyOtp(email.trim(), code, guestToken || undefined)
      localStorage.setItem('token', res.data.token)
      localStorage.removeItem('guestToken')

      const payload = res.data as { welcomeBonusGranted?: boolean; bonusGranted?: number }
      const granted = payload.bonusGranted ?? (payload.welcomeBonusGranted ? WELCOME_BONUS : 0)

      if (granted > 0) {
        setWelcomeBonus(granted)
        return
      }

      navigate('/profile')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Неверный код. Попробуйте ещё раз')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setCode('')
    setError('')
    setLoading(true)
    try {
      await authApi.sendOtp(email.trim())
      startResendTimer()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEmail = () => {
    setStep('input')
    setStepIn(false)
    setCode('')
    setError('')
    setTimeout(() => setStepIn(true), 10)
  }

  return (
    <div className="min-h-[100dvh] bg-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Логотип */}
        <div className={`flex justify-center mt-4 mb-10 auth-logo-wrap ${logoIn ? 'is-in' : ''}`}>
          <Link to="/" aria-label="На главную" className="inline-flex rounded-xl auth-logo-link">
            <img src="/logo.png" alt="Симба — зоомагазин" width={227} height={80} className="h-20 w-auto" />
          </Link>
        </div>

        {/* Белая карточка входа */}
        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* Шаг: ввод email */}
          <div className="relative">
            <div className={`auth-step ${stepIn && step === 'input' ? 'is-in' : ''}`}>
            <h1 className="text-xl font-bold text-navy-900 mb-1">Вход в аккаунт</h1>
            <p className="text-sm text-navy-400 mb-6">
              Введите email — пришлём код для входа
            </p>

            {/* Поле email */}
            <div className="mb-4">
              <label htmlFor="auth-email" className="block text-sm font-medium text-navy-700 mb-1.5">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                spellCheck={false}
                aria-invalid={!!error && step === 'input'}
                aria-describedby={error && step === 'input' ? 'auth-email-error' : 'auth-email-hint'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                onBlur={() => {
                  if (email && !isEmailValid && step === 'input') {
                    setError('Проверьте адрес — похоже, есть опечатка')
                  }
                }}
                placeholder="name@example.ru"
                className="w-full px-4 py-3 text-base rounded-xl border bg-white text-navy-900 placeholder-navy-300 focus:outline-none transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-out)] border-line focus:border-primary-soft focus:ring-2 focus:ring-primary-soft/25 aria-[invalid=true]:border-[#C0392B] aria-[invalid=true]:focus:ring-[#C0392B]/20"
              />
              <p
                id={error && step === 'input' ? 'auth-email-error' : 'auth-email-hint'}
                role={error && step === 'input' ? 'alert' : undefined}
                className={`text-xs mt-1.5 min-h-[1.25rem] transition-colors duration-150 ${error && step === 'input' ? 'text-[#C0392B]' : 'text-navy-500'}`}>
                {error && step === 'input' ? error : 'Пришлём код для входа — пароль не нужен'}
              </p>
            </div>

            {/* Кнопка отправки */}
            <button
              onClick={handleSendCode}
              disabled={loading || !email.trim() || !isEmailValid}
              className="w-full btn-primary font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Отправляем...
                </span>
              ) : 'Получить код'}
            </button>

            {/* Плашка приветственного бонуса */}
            <div className="mt-4 flex items-start gap-2 rounded-card bg-amber-50 px-3 py-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="15" textAnchor="middle" fill="white" className="text-xs font-bold">$</text>
              </svg>
              <p className="text-xs leading-relaxed text-navy-700">
                <span className="font-bold text-amber-600">+{WELCOME_BONUS} бонусов</span> за регистрацию — это {WELCOME_BONUS} ₽ скидки на первый заказ
              </p>
            </div>
            </div>
          </div>

          {/* Шаг: ввод кода */}
          <div className="relative">
            <div className={`auth-step ${stepIn && step === 'code' ? 'is-in' : ''}`}>
            <button
              onClick={handleChangeEmail}
              aria-label="Изменить email"
              className="flex items-center gap-1.5 text-navy-400 hover:text-navy-700 transition-colors text-sm mb-4 py-2 -my-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Изменить
            </button>

            <h1 className="text-xl font-bold text-navy-900 mb-1">Введите код</h1>
            <p className="text-sm text-navy-400 mb-6">
              Код отправлен на <span className="font-semibold text-navy-700">{email}</span>
            </p>

            {/* Поле кода */}
            <div className="mb-4">
              <label htmlFor="auth-code" className="sr-only">
                Код из письма
              </label>
              <input
                id="auth-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={CODE_LENGTH}
                aria-invalid={!!error && step === 'code'}
                aria-describedby={error && step === 'code' ? 'auth-code-error' : undefined}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
                  if (error) setError('')
                }}
                placeholder="______"
                className="w-full px-4 py-4 rounded-xl border text-center text-2xl font-bold tracking-[0.4em] text-navy-900 placeholder-navy-200 focus:outline-none transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-out)] border-line focus:border-primary-soft focus:ring-2 focus:ring-primary-soft/25 aria-[invalid=true]:border-[#C0392B] aria-[invalid=true]:focus:ring-[#C0392B]/20"
              />
              <p
                id={error && step === 'code' ? 'auth-code-error' : undefined}
                role={error && step === 'code' ? 'alert' : undefined}
                className={`text-xs mt-1.5 min-h-[1.25rem] transition-colors duration-150 text-center ${error && step === 'code' ? 'text-[#C0392B]' : 'text-navy-500'}`}>
                {error && step === 'code' ? error : ''}
              </p>
            </div>

            {/* Кнопка проверки */}
            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length < CODE_LENGTH}
              className="w-full btn-primary font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Проверяем...
                </span>
              ) : 'Войти'}
            </button>

            {/* Повторная отправка */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-navy-400">
                  Отправить повторно через <span className="font-semibold text-navy-700">{resendTimer} с</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-navy-700 hover:text-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                  Отправить код повторно
                </button>
              )}
            </div>
            </div>
          </div>

        </div>

        {/* Разделитель */}
        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs font-medium uppercase tracking-wide text-navy-400">или</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {/* Гостевой сценарий */}
        <Link
          to="/checkout"
          className="btn-outline w-full rounded-xl py-3 text-sm font-bold gap-2 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4V3c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v1h5c.6 0 1 .4 1 1v2H2V5c0-.6.4-1 1-1h4zm13 6H4v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10z" />
          </svg>
          Оформить заказ без регистрации
        </Link>
        <p className="mt-2 text-center text-xs text-navy-500">
          Понадобятся только имя, телефон и адрес доставки
        </p>

        {/* Юридическая строка */}
        <p className="text-center text-xs text-navy-500 mt-6">
          Продолжая, вы соглашаетесь с{' '}
          <Link to="/privacy" className="text-primary-hover hover:underline">политикой конфиденциальности</Link>
        </p>
      </div>

      {/* Попап приветственного бонуса */}
      <WelcomeBonusPopup
        open={welcomeBonus > 0}
        amount={welcomeBonus}
        onClose={() => {
          setWelcomeBonus(0)
          navigate('/profile')
        }}
      />

      {/* CSS для анимации шагов */}
      <style>{`
        @layer components {
          .auth-step {
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 220ms var(--ease-out), transform 220ms var(--ease-out);
            position: absolute;
            width: 100%;
          }
          .auth-step.is-in {
            opacity: 1;
            transform: translateY(0);
            position: relative;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-step {
            transition: none;
            opacity: 1;
            transform: none;
            position: relative;
          }
        }
      `}</style>
    </div>
  )
}
