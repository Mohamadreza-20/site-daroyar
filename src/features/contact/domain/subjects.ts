import { BRAND } from '@/shared/domain/constants'

export const SUBJECTS = ['مشاورهٔ دارویی', 'پیگیری سفارش', 'مرجوعی کالا', 'پیشنهاد و انتقاد', 'همکاری'] as const

export const contactChannels = () => [
  { key: 'phone', title: 'تلفن پشتیبانی', value: BRAND.phone, href: `tel:${BRAND.phoneRaw}` },
  { key: 'email', title: 'ایمیل', value: BRAND.email, href: `mailto:${BRAND.email}` },
  { key: 'address', title: 'نشانی', value: BRAND.address, href: undefined },
  { key: 'hours', title: 'ساعات کاری', value: BRAND.hours, href: undefined },
]
