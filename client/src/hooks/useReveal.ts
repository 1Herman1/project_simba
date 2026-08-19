import { useEffect, useRef } from 'react'

/**
 * Однократный scroll-reveal через IntersectionObserver.
 * Добавляет класс `is-visible`, когда элемент входит во вьюпорт, и отписывается.
 * При reduced-motion или отсутствии IO — показывает сразу, без анимации.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: { rootMargin?: string }) {
  const ref = useRef<T>(null)
  const rootMargin = options?.rootMargin ?? '0px 0px -12% 0px'

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      // threshold: 0 — старт не зависит от высоты секции. С прежними 0.15
      // порог считался от площади элемента: короткие секции вспыхивали сразу,
      // высокие — заметно позже, ритм плавал. Плюс секция выше ~6 вьюпортов
      // никогда не набирала 15% и оставалась скрытой.
      { threshold: 0, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
