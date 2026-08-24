import { useParams } from 'react-router-dom'

export function ProductPage() {
  const { slug } = useParams()

  return (
    <div className="container-app py-12 md:py-24">
      <div className="max-w-prose">
        <h1 className="text-display font-heading font-bold mb-8">
          Товар: {slug}
        </h1>
        <p className="text-body font-sans leading-body mb-6">
          Это заглушка карточки товара. Здесь будут изображения, описание, варианты расфасовки, ингредиенты и отзывы.
        </p>
        <p className="text-body font-sans leading-body text-muted-foreground">
          Контакт API: GET /api/v1/products/:slug
        </p>
      </div>
    </div>
  )
}
