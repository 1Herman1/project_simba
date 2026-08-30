/**
 * Кодогенерация набора иконок из Iconoir.
 *
 * Почему генерация, а не рантайм-библиотека: набор попадает в бандл готовыми
 * React-компонентами, без лишней зависимости и без загрузки JSON в браузере.
 * Иконки видны в диффе — правку геометрии можно отревьюить как обычный код.
 *
 * Запуск: node scripts/gen-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const PACK = JSON.parse(
  readFileSync(new URL('../node_modules/@iconify-json/iconoir/icons.json', import.meta.url), 'utf8')
)

/** Толщина линии Iconoir — 1.5. Меняется здесь одним числом для всего набора. */
const STROKE = '1.75'

/** Имя экспорта -> имя иконки в Iconoir. Порядок = порядок в файле. */
const MAP = {
  SearchIcon: 'search',
  CartIcon: 'cart',
  HeartIcon: 'heart',
  HeartSolidIcon: 'heart-solid',
  UserIcon: 'user',
  PhoneIcon: 'phone',
  MenuIcon: 'menu',
  CloseIcon: 'xmark',
  ArrowRightIcon: 'arrow-right',
  ArrowLeftIcon: 'arrow-left',
  TrashIcon: 'trash',
  StarIcon: 'star',
  StarSolidIcon: 'star-solid',
  GiftIcon: 'gift',
  ShieldIcon: 'shield',
  TruckIcon: 'delivery-truck',
  ShopIcon: 'shop',
  ClockIcon: 'clock',
  MailIcon: 'mail',
  WalletIcon: 'wallet',
  CoinsIcon: 'coins',
  PercentIcon: 'percentage-circle',
  BoxIcon: 'box',
  PackageIcon: 'package',
  CheckCircleIcon: 'check-circle',
  CheckCircleSolidIcon: 'check-circle-solid',
  InfoIcon: 'info-circle',
  WarningIcon: 'warning-circle',
  ExternalLinkIcon: 'open-new-window',
  ImagePlaceholderIcon: 'media-image',
  CreditCardIcon: 'credit-card',
  PlusIcon: 'plus',
  MinusIcon: 'minus',
  RefreshIcon: 'refresh',
  BagIcon: 'bag',
  ChatIcon: 'chat-bubble',
  CalendarIcon: 'calendar',
  HomeIcon: 'home-simple',
  TelegramIcon: 'telegram',
}

const KEBAB = {
  'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin', 'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset',
  'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity', 'clip-path': 'clipPath',
}

function toJsx(body) {
  let out = body
  for (const [k, v] of Object.entries(KEBAB)) out = out.replaceAll(`${k}="`, `${v}="`)
  out = out.replaceAll('strokeWidth="1.5"', `strokeWidth="${STROKE}"`)
  return out.replace(/\/>/g, ' />')
}

const missing = Object.entries(MAP).filter(([, n]) => !PACK.icons[n])
if (missing.length) {
  console.error('НЕТ В НАБОРЕ:', missing.map(([e, n]) => `${e} -> ${n}`).join(', '))
  process.exit(1)
}

/** Компоненты, которых в Iconoir нет или чья форма важнее совместимости. */
const CUSTOM = `
/** Текущий шаг: залитая точка в кольце — видно даже в чёрно-белой печати. */
export function StepCurrentIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={\`\${base} \${className}\`}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="${STROKE}" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  )
}

/** Будущий шаг: пустое кольцо. */
export function StepPendingIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={\`\${base} \${className}\`}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="${STROKE}" />
    </svg>
  )
}

/** Отпечаток лапы — заглушка на месте отсутствующего фото товара. Рисована под
    бренд, в наборе аналога нет. Атрибуты transform обязаны иметь CSS-guard в
    reduced-motion (см. .paw-toe--* в index.css), иначе лапа разваливается. */
export function PawIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <g fill="currentColor">
        <ellipse cx="32" cy="42" rx="15" ry="12" />
        <ellipse cx="15" cy="27" rx="6.5" ry="8.5" transform="rotate(-18 15 27)" className="paw-toe--fl" />
        <ellipse cx="49" cy="27" rx="6.5" ry="8.5" transform="rotate(18 49 27)" className="paw-toe--fr" />
        <ellipse cx="24" cy="15" rx="6" ry="8" transform="rotate(-8 24 15)" className="paw-toe--tl" />
        <ellipse cx="40" cy="15" rx="6" ry="8" transform="rotate(8 40 15)" className="paw-toe--tr" />
      </g>
    </svg>
  )
}

/** Галочка. Класс icon-check-path на линии — её прочерчивание при появлении. */
export function CheckIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      className={\`\${base} \${className}\`}>
      <path d="M5 13l4.5 4.5L19 7" className="icon-check-path" />
    </svg>
  )
}

/** Шеврон аккордеона. Поворот на 180° даёт .ico-chevron, а не Tailwind-утилита:
    утилита transition-* на том же элементе перетирает transition-property целиком. */
export function ChevronDownIcon({ className = '', open = false }: IconProps & { open?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="${STROKE}"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      className={\`ico-chevron \${open ? 'is-open' : ''} \${base} \${className}\`}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
`

const parts = Object.entries(MAP).map(([name, icon]) => {
  const ic = PACK.icons[icon]
  const w = ic.width ?? PACK.width ?? 24
  const h = ic.height ?? PACK.height ?? 24
  return `export function ${name}({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false" className={\`\${base} \${className}\`}>
      ${toJsx(ic.body)}
    </svg>
  )
}`
})

const header = `/**
 * Иконки интерфейса — набор Iconoir (MIT), сгенерирован scripts/gen-icons.mjs.
 * РУКАМИ НЕ ПРАВИТЬ: правь карту в скрипте и перегенерируй.
 *
 * Единая манера: сетка 24, обводка ${STROKE}, currentColor, размер задаётся
 * классом снаружи. Раньше эту роль играли эмодзи и символы («✓ Добавлено»,
 * «●○» в статусе заказа) — они рисуются по-разному в разных системах и
 * читаются скринридером вслух как слова.
 */

type IconProps = {
  className?: string
}

const base = 'w-5 h-5 flex-shrink-0'
`

writeFileSync(
  new URL('../client/src/components/icons.tsx', import.meta.url),
  [header, CUSTOM.trim(), ...parts].join('\n\n') + '\n'
)
console.log(`сгенерировано: ${Object.keys(MAP).length} из набора + 5 своих`)
