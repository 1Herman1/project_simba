import { useParams } from 'react-router-dom'

export default function ProductPage() {
  const { slug } = useParams()
  return <div className="p-8 text-xl text-navy-900">Товар: {slug} — в разработке</div>
}
