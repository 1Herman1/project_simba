import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import WelcomeBonusPopup from '../components/WelcomeBonusPopup'

type Step = 'input' | 'code'
type Channel = 'email' | 'phone'

const CODE_LENGTH = 6
const WELCOME_BONUS = 300

function detectChannel(value: string): Channel {
  return value.includes('@') ? 'email' : 'phone'
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const d = digits.startsWith('7') ? digits : '7' + digits
  const p = d.slice(1)
  let out = '+7'
  if (p.length > 0) out += ' (' + p.slice(0, 3)
  if (p.length >= 3) out += ') ' + p.slice(3, 6)
  if (p.length >= 6) out += '-' + p.slice(6, 8)
  if (p.length >= 8) out += '-' + p.slice(8, 10)
  return out
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('input')
  const [contact, setContact] = useState('')
  const [channel, setChannel] = useState<Channel>('phone')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [welcomeBonus, setWelcomeBonus] = useState(0)

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const detected = detectChannel(raw)
    setChannel(detected)
    setContact(detected === 'phone' ? formatPhone(raw) : raw)
    setError('')
  }

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const handleSendCode = async () => {
    const isPhone = channel === 'phone'
    const isEmail = channel === 'email'
    const digits = contact.replace(/\D/g, '')

    if (isPhone && digits.length < 11) {
      setError('Введите полный номер телефона')
      return
    }
    if (isEmail && !contact.includes('.')) {
      setError('Введите корректный email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const apiContact = channel === 'phone' ? contact.replace(/\D/g, '') : contact
      await authApi.sendOtp(apiContact, channel === 'phone' ? 'sms' : 'email')
      setStep('code')
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
      const apiContact = channel === 'phone' ? contact.replace(/\D/g, '') : contact
      const res = await authApi.verifyOtp(apiContact, code)
      localStorage.setItem('token', res.data.token)

      // Приветственные бонусы начисляет сервер и сообщает об этом в ответе.
      // Имя поля читаем терпимо: пока оно устаканивается, промах не должен
      // ломать вход — в худшем случае покупатель просто не увидит попап.
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
      const apiContact = channel === 'phone' ? contact.replace(/\D/g, '') : contact
      await authApi.sendOtp(apiContact, channel === 'phone' ? 'sms' : 'email')
      startResendTimer()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Лого */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src="/logo.svg" alt="Симба" className="h-12 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">

          {step === 'input' && (
            <>
              <h1 className="text-xl font-bold text-navy-900 mb-1">Вход в аккаунт</h1>
              <p className="text-sm text-navy-400 mb-6">
                Введите телефон или email — пришлём код для входа
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-navy-700 mb-1.5">
                  Телефон или Email
                </label>
                <input
                  type="text"
                  inputMode={channel === 'phone' ? 'tel' : 'email'}
                  value={contact}
                  onChange={handleContactChange}
                  placeholder="+7 (___) ___-__-__ или email@..."
                  className={`w-full px-4 py-3 rounded-xl border text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 transition-[border-color,box-shadow] ${
                    error
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-blue-100 focus:border-blue-200 focus:ring-blue-100'
                  }`}
                />
                {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
              </div>

              {/* Как будет отправлен код */}
              {contact.length > 2 && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 mb-4">
                  <p className="text-xs text-navy-500">
                    {channel === 'phone'
                      ? 'Отправим SMS с кодом на этот номер'
                      : 'Отправим код на этот email'}
                  </p>
                </div>
              )}

              <button
                onClick={handleSendCode}
                disabled={loading || contact.length < 3}
                className="w-full btn-primary font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Отправляем...
                  </span>
                ) : 'Получить код'}
              </button>

              <p className="text-center text-xs text-navy-300 mt-4">
                Нет аккаунта? Он создастся автоматически
              </p>
            </>
          )}

          {step === 'code' && (
            <>
              <button
                onClick={() => { setStep('input'); setCode(''); setError('') }}
                className="flex items-center gap-1.5 text-navy-400 hover:text-navy-700 transition-colors text-sm mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Изменить
              </button>

              <h1 className="text-xl font-bold text-navy-900 mb-1">Введите код</h1>
              <p className="text-sm text-navy-400 mb-6">
                Код отправлен на{' '}
                <span className="font-semibold text-navy-700">{contact}</span>
              </p>

              {/* Поле кода */}
              <div className="mb-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={CODE_LENGTH}
                  value={code}
                  onChange={e => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
                    setError('')
                  }}
                  placeholder="______"
                  className={`w-full px-4 py-4 rounded-xl border text-center text-2xl font-bold tracking-[0.4em] text-navy-900 placeholder-navy-200 focus:outline-none focus:ring-2 transition-[border-color,box-shadow] ${
                    error
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-blue-100 focus:border-blue-200 focus:ring-blue-100'
                  }`}
                />
                {error && <p className="text-red-500 text-xs mt-1.5 text-center">{error}</p>}
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={loading || code.length < CODE_LENGTH}
                className="w-full btn-primary font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Проверяем...
                  </span>
                ) : 'Войти'}
              </button>

              {/* Повторная отправка */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-navy-400">
                    Отправить повторно через{' '}
                    <span className="font-semibold text-navy-700">{resendTimer} с</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-sm text-navy-700 hover:text-primary-hover transition-colors font-medium">
                    Отправить код повторно
                  </button>
                )}
              </div>

            </>
          )}

        </div>

        <p className="text-center text-xs text-navy-500 mt-6">
          Входя, вы соглашаетесь с{' '}
          <Link to="/privacy" className="text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">политикой конфиденциальности</Link>
        </p>
      </div>

      <WelcomeBonusPopup
        open={welcomeBonus > 0}
        amount={welcomeBonus}
        onClose={() => {
          setWelcomeBonus(0)
          navigate('/profile')
        }}
      />
    </div>
  )
}
