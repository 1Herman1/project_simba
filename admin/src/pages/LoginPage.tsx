import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'

type Step = 'input' | 'code'

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

export default function LoginPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('input')
  const [contact, setContact] = useState('')
  const [isEmail, setIsEmail] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const email = raw.includes('@')
    setIsEmail(email)
    setContact(email ? raw : formatPhone(raw))
    setError('')
  }

  const startTimer = () => {
    setResendTimer(60)
    const t = setInterval(() => {
      setResendTimer(v => {
        if (v <= 1) { clearInterval(t); return 0 }
        return v - 1
      })
    }, 1000)
  }

  const handleSend = async () => {
    setLoading(true); setError('')
    try {
      const c = isEmail ? contact : contact.replace(/\D/g, '')
      await authApi.sendOtp(c, isEmail ? 'email' : 'sms')
      setStep('code')
      startTimer()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Ошибка отправки кода')
    } finally { setLoading(false) }
  }

  const handleVerify = async () => {
    if (code.length < 6) { setError('Введите 6-значный код'); return }
    setLoading(true); setError('')
    try {
      const c = isEmail ? contact : contact.replace(/\D/g, '')
      const res = await authApi.verifyOtp(c, code)
      const { role } = res.data.user
      if (!['super_admin', 'orders_manager', 'products_manager'].includes(role)) {
        setError('Доступ запрещён. Только для администраторов.')
        setLoading(false)
        return
      }
      localStorage.setItem('admin_token', res.data.token)
      navigate('/')
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Неверный код')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">S</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {step === 'input' ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Вход в панель</h1>
              <p className="text-sm text-gray-500 mb-6">Только для администраторов Simba</p>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон или Email</label>
              <input
                type="text"
                value={contact}
                onChange={handleContactChange}
                placeholder="+7 (___) ___-__-__ или email"
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 mb-1 ${
                  error ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
              />
              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

              <button
                onClick={handleSend}
                disabled={loading || contact.length < 3}
                className="w-full mt-3 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Отправляем...' : 'Получить код'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('input'); setCode(''); setError('') }}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-4"
              >
                Назад
              </button>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Введите код</h1>
              <p className="text-sm text-gray-500 mb-6">Отправлен на <span className="font-medium text-gray-700">{contact}</span></p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                placeholder="______"
                className={`w-full px-4 py-4 rounded-xl border text-center text-2xl font-bold tracking-[0.4em] text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 mb-1 ${
                  error ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
              />
              {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={loading || code.length < 6}
                className="w-full mt-3 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Проверяем...' : 'Войти'}
              </button>

              <div className="text-center mt-4">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-400">Повторно через <span className="font-medium text-gray-600">{resendTimer} с</span></p>
                ) : (
                  <button onClick={handleSend} className="text-sm text-blue-600 hover:underline">
                    Отправить повторно
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
