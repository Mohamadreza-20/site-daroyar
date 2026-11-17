import { memo } from 'react'
import { Input, Select, Textarea } from '@/shared/ui/common/Fields'
import Button from '@/shared/ui/common/Button'
import { FORM_ACTIONS, FORM_GRID } from '@/shared/ui/common/styles'
import { formatToman } from '@/shared/domain/format'
import type { Product } from '@/shared/domain/types'
import type { ProductForm as ProductFormValues } from '@/features/admin/domain/schemas'
import { useProductForm } from '@/features/admin/hooks/useProductForm'

interface Props {
  product: Product | null
  loading: boolean
  serverError: unknown
  onSubmit: (form: ProductFormValues) => void
  onCancel: () => void
}

const ProductForm = memo(function ProductForm({ product, loading, serverError, onSubmit, onCancel }: Props) {
  const { register, errors, categories, finalPrice, submit } = useProductForm(product, serverError, onSubmit)

  return (
    <form onSubmit={submit} noValidate>
      <div className={FORM_GRID}>
        <Input className="col-span-full" label="نام محصول" error={errors.title?.message} {...register('title')} />
        <Input label="برند" error={errors.brand?.message} {...register('brand')} />
        <Select label="دسته‌بندی" error={errors.category?.message} {...register('category')}>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </Select>
        <Input
          label="قیمت پایه (تومان)"
          type="number"
          inputMode="numeric"
          ltr
          error={errors.basePrice?.message}
          {...register('basePrice')}
        />
        <Input
          label="تخفیف (٪)"
          type="number"
          inputMode="numeric"
          ltr
          error={errors.discount?.message}
          {...register('discount')}
        />
        {finalPrice !== null && (
          <p className="col-span-full text-[13px] text-muted">قیمت نهایی پس از تخفیف: {formatToman(finalPrice)}</p>
        )}
        <Input
          label="موجودی"
          type="number"
          inputMode="numeric"
          ltr
          error={errors.stock?.message}
          {...register('stock')}
        />
        <Input
          label="آدرس تصویر"
          ltr
          placeholder="/images/placeholder.svg"
          error={errors.thumbnail?.message}
          {...register('thumbnail')}
        />
        <Textarea
          className="col-span-full"
          label="توضیحات"
          error={errors.description?.message}
          {...register('description')}
        />
      </div>
      <div className={FORM_ACTIONS}>
        <Button variant="ghost" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" loading={loading}>
          {product ? 'ذخیرهٔ تغییرات' : 'افزودن محصول'}
        </Button>
      </div>
    </form>
  )
})

export default ProductForm
