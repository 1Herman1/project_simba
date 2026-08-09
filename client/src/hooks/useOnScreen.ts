import { useEffect, useRef } from 'react'

/** Наблюдатель для бесконечных idle-петель: ставит/снимает `is-onscreen`
    на контейнере, не отписывается (в отличие от useReveal). */
export function useOnScreen<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle('is-onscreen', entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
