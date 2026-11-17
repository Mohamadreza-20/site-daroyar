import { BookOpen } from 'lucide-react'
import { Breadcrumb, EmptyState } from '@/shared/ui/common/Primitives'
import { CHIP_SM, PAGEHEAD, chipClass } from '@/shared/ui/common/styles'
import ErrorState from '@/shared/ui/feedback/ErrorState'
import { ArticlesSkeleton } from '@/shared/ui/loaders/PublicSkeletons'
import { cn } from '@/shared/ui/lib/cn'
import { useArticlesPage } from '@/features/articles/hooks/useArticlesPage'
import ArticleCard from '@/features/articles/components/ArticleCard'

export default function ArticlesPage() {
  const { isPending, isError, error, refetch, category, setCategory, categories, featured, rest } = useArticlesPage()

  if (isPending) return <ArticlesSkeleton />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  return (
    <div className="site-container animate-page-in">
      <Breadcrumb items={[{ label: 'خانه', to: '/' }, { label: 'مقالات سلامت' }]} />
      <header className={cn(PAGEHEAD, 'flex-col items-start gap-1.5')}>
        <h1>مجلهٔ سلامت دارویار</h1>
        <p className="text-muted">مقالات آموزشی دربارهٔ مراقبت پوست، مصرف صحیح دارو، تغذیه و سبک زندگی سالم.</p>
      </header>
      <div className="mb-7 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} type="button" className={chipClass(category === c, CHIP_SM)} onClick={() => setCategory(c)}>
            {c === 'all' ? 'همه' : c}
          </button>
        ))}
      </div>
      {featured ? (
        <>
          <ArticleCard article={featured} featured />
          {rest.length > 0 && (
            <div className="mt-7 grid grid-cols-3 gap-[22px] max-[1025px]:grid-cols-2 max-[641px]:grid-cols-1">
              {rest.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyState icon={BookOpen} title="مقاله‌ای پیدا نشد" />
      )}
    </div>
  )
}
