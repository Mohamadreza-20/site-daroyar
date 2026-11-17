import { toast } from 'sonner'
import type { Notice } from '@/features/cart/domain/cartRules'

export function notify({ level, text, description }: Notice): void {
  toast[level](text, description ? { description } : undefined)
}
