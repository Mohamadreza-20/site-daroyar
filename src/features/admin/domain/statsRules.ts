interface StockStats {
  products: number
  lowStock: number
  outOfStock: number
}

export const stockBreakdown = ({ products, lowStock, outOfStock }: StockStats) => ({
  available: Math.max(0, products - lowStock - outOfStock),
  low: lowStock,
  out: outOfStock,
})

export const categoryChartData = (byCategory: { label: string; count: number }[]) =>
  byCategory.map((c) => ({ label: c.label, value: c.count }))
