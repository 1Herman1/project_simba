import { useEffect, useState } from 'react'
import { categoriesApi, type Category } from '../../lib/api'

const empty = (): Partial<Category> => ({ name: '', slug: '', description: '', sortOrder: 0 })

function autoSlug(n: string) {
  return n.toLowerCase().replace(/[а-яё]/g, (c: string) => ({
    а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',
    к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',
    х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'
  }[c] ?? c)).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<Category> | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    categoriesApi.list().then(r => setCategories(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditId(null); setForm(empty()); setError('') }
  const openEdit = (cat: Category) => { setEditId(cat.id); setForm({ ...cat }); setError('') }
  const closeForm = () => { setForm(null); setEditId(null) }

  const handleSave = async () => {
    if (!form?.name) { setError('Введите название'); return }
    if (!form?.slug) { setError('Введите slug'); return }
    setSaving(true); setError('')
    try {
      if (editId) {
        const res = await categoriesApi.update(editId, form)
        setCategories(prev => prev.map(c => c.id === editId ? res.data : c))
      } else {
        const res = await categoriesApi.create(form)
        setCategories(prev => [...prev, res.data])
      }
      closeForm()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить категорию "${name}"?`)) return
    await categoriesApi.delete(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const setField = (field: keyof Category, value: unknown) =>
    setForm(prev => prev ? { ...prev, [field]: value } : prev)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Категории</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
          + Добавить
        </button>
      </div>

      {/* Form */}
      {form !== null && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">{editId ? 'Редактировать' : 'Новая категория'}</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Название *</label>
              <input value={form.name ?? ''} onChange={e => {
                setField('name', e.target.value)
                if (!editId) setField('slug', autoSlug(e.target.value))
              }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug *</label>
              <input value={form.slug ?? ''} onChange={e => setField('slug', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Описание</label>
              <input value={form.description ?? ''} onChange={e => setField('description', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Порядок</label>
              <input type="number" value={form.sortOrder ?? 0} onChange={e => setField('sortOrder', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <button onClick={closeForm} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl hover:bg-gray-200">Отмена</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">Название</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Порядок</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-5 py-3 text-gray-500">{cat.sortOrder}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Активна' : 'Скрыта'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(cat)} className="text-blue-600 hover:underline text-xs font-medium">Изменить</button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="text-red-500 hover:underline text-xs">Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Категорий пока нет</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
