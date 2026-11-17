import { useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'
import type { Product } from '@/shared/domain/types'
import { parseStockInput } from '@/features/admin/domain/productRules'

export function useStockEditor(product: Product, onSave: (id: number, stock: number) => void) {
  const [value, setValue] = useState(String(product.stock))
  const changed = parseStockInput(value) !== product.stock
  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const stock = parseStockInput(value)
    if (stock === null) {
      toast.error('موجودی باید عدد صحیح و نامنفی باشد')
      return
    }
    onSave(product.id, stock)
  }
  return { value, setValue, changed, submit }
}
