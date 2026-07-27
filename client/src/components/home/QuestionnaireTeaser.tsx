import { Link } from 'react-router-dom'

export default function QuestionnaireTeaser() {
  return (
    <section className="max-w-4xl mx-auto px-4 my-12 rounded-card bg-primary-tint p-8 text-center">
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Не знаете, какой корм выбрать?
      </h2>
      <p className="text-navy-500 mb-6 max-w-md mx-auto">
        Пройдите короткую анкету — подберём оптимальное питание для вашего питомца за 2 минуты
      </p>
      <Link
        to="/questionnaire"
        className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
      >
        Подобрать корм
      </Link>
    </section>
  )
}
