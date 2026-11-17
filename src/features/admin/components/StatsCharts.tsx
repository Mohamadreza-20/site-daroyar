import { memo } from 'react'
import { Bar, BarChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/shared/domain/format'

const CHART_BOX =
  'h-[280px] w-full [&_.recharts-legend-item-text]:font-sans [&_.recharts-legend-item-text]:text-[12px] [&_.recharts-text]:font-sans [&_.recharts-text]:text-[12px]'

const COLORS = { available: '#0f9d8a', low: '#f2a93b', out: '#e5604d' } as const
const fmt = (value: unknown) => formatNumber(Number(value))

interface CategoryChartProps {
  data: { label: string; value: number }[]
}

export const CategoryChart = memo(function CategoryChart({ data }: CategoryChartProps) {
  return (
    <div className={CHART_BOX} dir="ltr" role="img" aria-label="نمودار تعداد محصولات هر دسته">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis type="number" allowDecimals={false} tickFormatter={fmt} />
          <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 12 }} tickLine={false} />
          <Tooltip formatter={(value) => [fmt(value), 'محصول']} cursor={{ fill: 'rgb(15 157 138 / .08)' }} />
          <Bar dataKey="value" fill="#0f9d8a" radius={[0, 6, 6, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})

interface StockChartProps {
  available: number
  low: number
  out: number
}

export const StockChart = memo(function StockChart({ available, low, out }: StockChartProps) {
  const data = [
    { name: 'موجود', value: available, fill: COLORS.available },
    { name: 'کم‌موجودی', value: low, fill: COLORS.low },
    { name: 'ناموجود', value: out, fill: COLORS.out },
  ].filter((item) => item.value > 0)
  return (
    <div className={CHART_BOX} role="img" aria-label="نمودار وضعیت موجودی محصولات">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            isAnimationActive={false}
          ></Pie>
          <Tooltip formatter={(value, name) => [fmt(value), name]} />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(value) => <span className="ms-1 me-3 text-[13px]">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
})
