import { useEffect } from 'react'

type MetaTags = {
  title: string
  description: string
}

/**
 * Заголовок и описание страницы. В SPA один index.html на весь сайт, поэтому
 * теги правятся в DOM при монтировании и возвращаются к прежним при уходе.
 */
export function useMetaTags({ title, description }: MetaTags) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta')
      descriptionTag.name = 'description'
      document.head.appendChild(descriptionTag)
    }
    const previousDescription = descriptionTag.content
    descriptionTag.content = description

    return () => {
      document.title = previousTitle
      descriptionTag.content = previousDescription
    }
  }, [title, description])
}
