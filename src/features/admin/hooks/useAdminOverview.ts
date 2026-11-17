import { useSeo } from '@/shared/hooks/useSeo'
import { useStats } from '@/features/admin/data/queries'
import { categoryChartData, stockBreakdown } from '@/features/admin/domain/statsRules'

export function useAdminOverview() {
  useSeo({ title: 'داشبورد مدیریت', noindex: true })
  const { data, isPending, isError, error, refetch } = useStats()
  return {
    stats: data,
    isPending,
    isError,
    error,
    refetch,
    categoryData: data ? categoryChartData(data.byCategory) : [],
    stock: data ? stockBreakdown(data) : null,
  }
}
