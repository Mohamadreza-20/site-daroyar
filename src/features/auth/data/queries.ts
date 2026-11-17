import { useMutation, useQuery } from '@tanstack/react-query'
import { keys } from '@/shared/data/queryKeys'
import * as authApi from '@/features/auth/data/api'
import { useAuthStore } from '@/features/auth/data/store'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({ mutationFn: authApi.login, onSuccess: setSession })
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)
  return useMutation({ mutationFn: authApi.register, onSuccess: setSession })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  return useMutation({
    mutationFn: () => authApi.logout().catch(() => null),
    onSettled: logout,
  })
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser)
  return useMutation({ mutationFn: authApi.updateProfile, onSuccess: updateUser })
}

export const useMe = (enabled: boolean) =>
  useQuery({
    queryKey: keys.me,
    queryFn: ({ signal }) => authApi.fetchMe(signal),
    enabled,
    retry: false,
  })
