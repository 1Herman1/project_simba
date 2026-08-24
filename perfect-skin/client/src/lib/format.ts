export function formatPrice(kopecks: number): string {
  const rubles = (kopecks / 100).toFixed(0)
  const parts = rubles.split('')
  const result = []

  for (let i = parts.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      result.unshift(' ')
    }
    result.unshift(parts[i])
  }

  return result.join('') + ' ₽'
}
