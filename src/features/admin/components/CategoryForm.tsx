import { memo } from 'react'
import type { Category } from '@/shared/domain/types'
import type { CategoryForm as CategoryFormValues } from '@/features/admin/domain/schemas'
import { useCategoryForm } from '@/features/admin/hooks/useCategoryForm'
import Button from '@/shared/ui/common/Button'
import { FORM_ACTIONS, FORM_GRID } from '@/shared/ui/common/styles'
import { Input, Select } from '@/shared/ui/common/Fields'
import { CATEGORY_ICON_NAMES, CATEGORY_TONES } from '@/shared/domain/constants'

interface CategoryFormProps {
  category: Category | null
  loading: boolean
  serverError: unknown
  onSubmit: (form: CategoryFormValues) => void
  onCancel: () => void
}

const CategoryForm = memo(function CategoryForm({
  category,
  loading,
  serverError,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const { register, errors, submit } = useCategoryForm(category, serverError, onSubmit)
  return (
    <form onSubmit={submit} noValidate>
      <div className={FORM_GRID}>
        <Input label="نام دسته" error={errors.label?.message} {...register('label')} />
        <Input
          label="شناسه (انگلیسی)"
          ltr
          disabled={Boolean(category)}
          hint={category ? 'شناسه پس از ساخت قابل تغییر نیست' : 'مثلاً vitamins'}
          error={errors.slug?.message}
          {...register('slug')}
        />
        <Input className="col-span-full" label="توضیح کوتاه" error={errors.blurb?.message} {...register('blurb')} />
        <Select label="آیکن" error={errors.icon?.message} {...register('icon')}>
          {CATEGORY_ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Select label="رنگ" error={errors.tone?.message} {...register('tone')}>
          {CATEGORY_TONES.map((tone) => (
            <option key={tone.value} value={tone.value}>
              {tone.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={FORM_ACTIONS}>
        <Button variant="ghost" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" loading={loading}>
          {category ? 'ذخیرهٔ تغییرات' : 'افزودن دسته'}
        </Button>
      </div>
    </form>
  )
})

export default CategoryForm
