import BrandLoader from '@/shared/ui/loaders/BrandLoader'

export default function ModalFallback() {
  return (
    <div className="grid min-h-40 place-items-center">
      <BrandLoader variant="pulse" label="در حال بارگذاری…" />
    </div>
  )
}
