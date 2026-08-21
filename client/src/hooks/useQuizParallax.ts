import { useEffect, type RefObject } from 'react'

/** Ширина декора (--decor-w) — курсор считается по сцене, расширенной на животных. */
const DECOR_W = 240
const AMP_X = 6
const AMP_Y = 3
/** Класс снимаем после возврата на место — самый долгий переход 260мс + запас. */
const SETTLE_MS = 320

const clamp = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v)

/**
 * Параллакс дальнего плана (кот и пёс) по курсору — главный признак глубины,
 * которого сцене не хватало. Пишет --quiz-px/--quiz-py в .quiz-scene, CSS
 * применяет их через `translate` (не transform: тот занят reveal-ом и зеркалом лапы).
 *
 * Гейт как у button-spotlight: только мышь на устройстве с точным указателем и
 * без prefers-reduced-motion. Пропы (лапа/нос) не двигаются — лапа лежит НА
 * карточке, нос стыкуется с мордой пса за карточкой, движение разорвало бы стык.
 */
export function useQuizParallax(sceneRef: RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const scene = sceneRef.current
    if (!scene || typeof window === 'undefined' || !window.matchMedia) return

    // Слушаем секцию, а не сцену: у декора pointer-events: none, и события
    // над животными до .quiz-scene не долетают.
    const zone = scene.closest('section') ?? scene

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

    let frame = 0
    let settleTimer = 0
    let pending: { x: number; y: number } | null = null
    let listening = false

    const paint = () => {
      frame = 0
      const p = pending
      pending = null
      if (!p) return

      const r = scene.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return

      const nx = clamp(((p.x - (r.left - DECOR_W)) / (r.width + DECOR_W * 2)) * 2 - 1)
      const ny = clamp(((p.y - r.top) / r.height) * 2 - 1)

      scene.style.setProperty('--quiz-px', `${(nx * AMP_X).toFixed(2)}px`)
      scene.style.setProperty('--quiz-py', `${(ny * AMP_Y).toFixed(2)}px`)

      if (settleTimer !== 0) {
        clearTimeout(settleTimer)
        settleTimer = 0
      }
      scene.classList.add('is-parallax')
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pending = { x: e.clientX, y: e.clientY }
      if (frame === 0) frame = requestAnimationFrame(paint)
    }

    const rest = () => {
      pending = null
      if (frame !== 0) {
        cancelAnimationFrame(frame)
        frame = 0
      }
      // Не removeProperty: нужен именно плавный возврат в 0, а не скачок.
      scene.style.setProperty('--quiz-px', '0px')
      scene.style.setProperty('--quiz-py', '0px')
      if (settleTimer !== 0) clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        settleTimer = 0
        scene.classList.remove('is-parallax')
      }, SETTLE_MS)
    }

    const start = () => {
      if (listening) return
      listening = true
      zone.addEventListener('pointermove', onPointerMove, { passive: true })
      zone.addEventListener('pointerleave', rest, { passive: true })
    }

    const stop = () => {
      if (!listening) return
      listening = false
      zone.removeEventListener('pointermove', onPointerMove)
      zone.removeEventListener('pointerleave', rest)
      pending = null
      if (frame !== 0) {
        cancelAnimationFrame(frame)
        frame = 0
      }
      if (settleTimer !== 0) {
        clearTimeout(settleTimer)
        settleTimer = 0
      }
      scene.style.removeProperty('--quiz-px')
      scene.style.removeProperty('--quiz-py')
      scene.classList.remove('is-parallax')
    }

    const sync = () => {
      if (finePointer.matches && !reduced.matches) start()
      else stop()
    }

    reduced.addEventListener('change', sync)
    finePointer.addEventListener('change', sync)
    sync()

    return () => {
      reduced.removeEventListener('change', sync)
      finePointer.removeEventListener('change', sync)
      stop()
    }
  }, [enabled, sceneRef])
}
