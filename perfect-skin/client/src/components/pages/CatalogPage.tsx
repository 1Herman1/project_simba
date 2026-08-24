import { useParams } from 'react-router-dom'

export function CatalogPage() {
  const { slug } = useParams()

  return (
    <div className="container-app py-12 md:py-24">
      <div className="max-w-prose">
        <h1 className="text-display font-heading font-bold mb-8">
          {slug ? `Категория: ${slug}` : 'Каталог'}
        </h1>
        <p className="text-body font-sans leading-body mb-6">
          Это заглушка страницы каталога. Здесь будут фильтры, сортировка и список товаров.
        </p>
        <p className="text-body font-sans leading-body text-muted-foreground">
          Контакт API: GET /api/v1/products с параметрами фильтрации, пагинация 24 товара на странице.
        </p>
      </div>
    </div>
  )
}
