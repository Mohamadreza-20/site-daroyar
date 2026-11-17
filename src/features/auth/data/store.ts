import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User } from '@/shared/domain/types'

interface AuthState {
  user: User | null
  token: string | null
  expiresAt: string | null
  sessionExpired: boolean
  setSession: (session: Session) => void
  updateUser: (user: User) => void
  logout: () => void
  expireSession: () => void
  clearExpiredNotice: () => void
}

const EMPTY_SESSION = { user: null, token: null, expiresAt: null }

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...EMPTY_SESSION,
      sessionExpired: false,
      setSession: ({ user, token, expiresAt }) => set({ user, token, expiresAt, sessionExpired: false }),
      updateUser: (user) => set({ user }),
      logout: () => set({ ...EMPTY_SESSION, sessionExpired: false }),
      expireSession: () => {
        if (get().token) set({ ...EMPTY_SESSION, sessionExpired: true })
      },
      clearExpiredNotice: () => set({ sessionExpired: false }),
    }),
    {
      name: 'daroyar-auth',
      version: 4,
      partialize: ({ user, token, expiresAt }) => ({ user, token, expiresAt }),
      migrate: () => EMPTY_SESSION,
      onRehydrateStorage: () => (state) => {
        if (state?.expiresAt && new Date(state.expiresAt) <= new Date()) state.expireSession()
      },
    },
  ),
)

export const ownerKeyOf = (user: Pick<User, 'id'> | null | undefined): string => String(user?.id ?? 'guest')
