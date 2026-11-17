import { memo } from 'react'
import type { Article } from '@/shared/domain/types'
import { SectionHeading } from '@/shared/ui/common/Primitives'
import ArticleCard from '@/features/articles/components/ArticleCard'

const HomeArticles = memo(function HomeArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null
  return (
    <section className="section-y site-container">
      <SectionHeading
        eyebrow="مجلهٔ سلامت"
        title="تازه‌ترین مقالات"
        text="مقالات نمونه دربارهٔ سلامت، تغذیه و مراقبت روزانه."
        to="/articles"
        linkLabel="همهٔ مقالات"
      />
      <div className="grid grid-cols-3 gap-[22px] max-[1025px]:grid-cols-2 max-[641px]:grid-cols-1">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  )
})

export default HomeArticles
