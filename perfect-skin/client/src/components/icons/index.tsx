/**
 * Иконки витрины Perfect Skin.
 * Набор: Iconify — lucide (версия ~0.400, MIT License).
 * https://icon-sets.iconify.design/lucide/
 * Единый стиль: сетка 24×24, stroke=currentColor, strokeWidth=1.75,
 * скруглённые концы и соединения — под гуманистический, но сдержанный
 * характер бренда (аптечная точность без резких углов).
 * Цвет не хардкодится — наследуется от родителя через currentColor.
 */

import type { SVGProps } from 'react'

export type IconProps = {
  className?: string
  size?: number
} & Omit<SVGProps<SVGSVGElement>, 'className' | 'width' | 'height'>

const defaults = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/**
 * Корзина: source: iconify/lucide "shopping-bag", license: MIT
 * https://icon-sets.iconify.design/lucide/shopping-bag/
 *
 * Выбор shopping-bag, а не shopping-cart: у Perfect Skin нет тележки по
 * физическому магазину — это витрина премиум-косметики, где метафора
 * «сумка/пакет из бутика» ближе к опыту покупки, чем супермаркетная тележка.
 * Cart читается как масс-маркет/грокери, bag — как аптека/парфюмерия.
 */
export function IconCart({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

/** source: iconify/lucide "heart", license: MIT — https://icon-sets.iconify.design/lucide/heart/ */
export function IconHeart({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

/** source: iconify/lucide "menu", license: MIT — https://icon-sets.iconify.design/lucide/menu/ */
export function IconMenu({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

/** source: iconify/lucide "x", license: MIT — https://icon-sets.iconify.design/lucide/x/ */
export function IconClose({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

/** source: iconify/lucide "search", license: MIT — https://icon-sets.iconify.design/lucide/search/ */
export function IconSearch({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/** source: iconify/lucide "arrow-right", license: MIT — https://icon-sets.iconify.design/lucide/arrow-right/ */
export function IconArrowRight({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

/** source: iconify/lucide "chevron-down", license: MIT — https://icon-sets.iconify.design/lucide/chevron-down/ */
export function IconChevronDown({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/** source: iconify/lucide "phone", license: MIT — https://icon-sets.iconify.design/lucide/phone/ */
export function IconPhone({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.598 1.767l-.464.354a1 1 0 0 0-.302 1.212 12.35 12.35 0 0 0 6.196 6.196Z" />
    </svg>
  )
}

/** source: iconify/lucide "minus", license: MIT — https://icon-sets.iconify.design/lucide/minus/ */
export function IconMinus({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="M5 12h14" />
    </svg>
  )
}

/** source: iconify/lucide "plus", license: MIT — https://icon-sets.iconify.design/lucide/plus/ */
export function IconPlus({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

/** source: iconify/lucide "check", license: MIT — https://icon-sets.iconify.design/lucide/check/ */
export function IconCheck({ className, size = 24, 'aria-hidden': ariaHidden = true, ...rest }: IconProps) {
  return (
    <svg {...defaults} width={size} height={size} className={className} aria-hidden={ariaHidden} {...rest}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
