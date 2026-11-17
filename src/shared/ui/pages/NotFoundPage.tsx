import { useSeo } from '@/shared/hooks/useSeo'
import ErrorState from '@/shared/ui/feedback/ErrorState'

export default function NotFoundPage() {
  useSeo({ title: 'صفحه پیدا نشد', noindex: true })
  return <ErrorState status={404} />
}
