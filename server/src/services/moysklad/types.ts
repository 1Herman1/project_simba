export type MsAssortmentItem = {
  id: string
  meta: { type: string }
  name: string
  article?: string
  code?: string
  archived?: boolean
  salePrices?: Array<{
    value: number
    priceType?: { name?: string }
  }>
}

export type MsStockRow = {
  assortmentId: string
  stock: number
}

export type MsAssortmentResponse = {
  rows: MsAssortmentItem[]
  meta: { limit: number; offset: number; total: number }
}

export type MsStockResponse = {
  rows: MsStockRow[]
}
