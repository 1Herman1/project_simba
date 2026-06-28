import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-2xl font-bold text-terra-600">Simba — скоро здесь будет магазин 🐾</div>} />
    </Routes>
  )
}
