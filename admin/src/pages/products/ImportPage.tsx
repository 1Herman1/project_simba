import { useState, useRef } from 'react'
import { productsApi } from '../../lib/api'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
    setResult(null)
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const res = await productsApi.importCsv(file)
      setResult(res.data)
    } catch (e: any) {
      setResult({ created: 0, errors: [e?.response?.data?.error || 'Ошибка загрузки'] })
    } finally { setLoading(false) }
  }

  const csvExample = `name,slug,description,brandSlug,price,oldPrice,stock,weight,sku
Корм для собак Premium,korm-premium,Сухой корм,royal-canin,499,599,50,1.5,RC-001
Корм для кошек Light,korm-light-cat,Диетический корм,,399,,30,0.4,`

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Импорт товаров из CSV</h1>

      {/* Format description */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-blue-900 mb-2 text-sm">Формат файла CSV</h2>
        <p className="text-sm text-blue-700 mb-3">
          Первая строка — заголовки. Обязательные поля: <code className="bg-blue-100 px-1 rounded">name, slug, price, weight</code>
        </p>
        <div className="bg-white rounded-lg border border-blue-100 p-3 overflow-x-auto">
          <pre className="text-xs text-gray-700 font-mono whitespace-pre">{csvExample}</pre>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Цены указываются в рублях (не в копейках). brandSlug — slug бренда, если бренд существует в системе.
        </p>
      </div>

      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors mb-4"
      >
        <input ref={inputRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
        <div className="text-3xl mb-2">📂</div>
        {file ? (
          <>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} КБ</p>
          </>
        ) : (
          <>
            <p className="font-medium text-gray-700">Нажмите для выбора файла</p>
            <p className="text-sm text-gray-400">CSV или TXT, до 10 МБ</p>
          </>
        )}
      </div>

      <button
        onClick={handleImport}
        disabled={!file || loading}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 mb-6"
      >
        {loading ? 'Загружаем...' : 'Импортировать товары'}
      </button>

      {result && (
        <div className={`rounded-xl border p-5 ${result.created > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`font-semibold mb-2 ${result.created > 0 ? 'text-green-800' : 'text-red-800'}`}>
            {result.created > 0
              ? `✓ Успешно импортировано: ${result.created} товаров`
              : 'Импорт не удался'}
          </p>
          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Ошибки ({result.errors.length}):</p>
              <ul className="text-sm text-red-600 space-y-0.5">
                {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
