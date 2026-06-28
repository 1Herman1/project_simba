import { Link } from 'react-router-dom'

export default function QuestionnaireTeaser() {
  return (
    <section className="mx-4 my-6 rounded-2xl bg-gradient-to-r from-blue-200 to-blue-300 p-8 text-center">
      <div className="text-4xl mb-3">🐾</div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Не знаете какой корм выбрать?
      </h2>
      <p className="text-navy-700 mb-6 max-w-md mx-auto">
        Пройдите короткую анкету — подберём оптимальное питание для вашего питомца за 2 минуты
      </p>
      <Link
        to="/questionnaire"
        className="inline-block bg-navy-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-navy-700 transition-colors"
      >
        Подобрать корм →
      </Link>
    </section>
  )
}
