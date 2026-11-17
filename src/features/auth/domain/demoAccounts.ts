export interface DemoAccount {
  label: string
  username: string
  password: string
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { label: 'مشتری نمونه', username: 'customer', password: 'customer123' },
  { label: 'مدیر سایت', username: 'admin', password: 'admin1234' },
]
