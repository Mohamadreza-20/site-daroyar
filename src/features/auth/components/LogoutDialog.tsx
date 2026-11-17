import { memo } from 'react'
import { ConfirmDialog } from '@/shared/ui/common/Modal'
import { useLogoutFlow } from '@/features/auth/hooks/useLogoutFlow'

interface LogoutDialogProps {
  open: boolean
  onClose: () => void
}

const LogoutDialog = memo(function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const onConfirm = useLogoutFlow(onClose)

  return (
    <ConfirmDialog
      open={open}
      title="خروج از حساب کاربری"
      text="آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟"
      confirmLabel="خروج از حساب"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
})

export default LogoutDialog
