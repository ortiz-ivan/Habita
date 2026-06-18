import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/api'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  accessToken: string | null
  user: User | null
  authStatus: AuthStatus
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  setAuthStatus: (status: AuthStatus) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      // 'loading' while attempting silent refresh on page load
      // 'authenticated' once we have a valid access token
      // 'unauthenticated' when no session exists or refresh failed
      authStatus: 'loading',

      setAccessToken: (token) => set({ accessToken: token, authStatus: 'authenticated' }),
      setUser: (user) => set({ user }),
      setAuthStatus: (status) => set({ authStatus: status }),
      logout: () => set({ accessToken: null, user: null, authStatus: 'unauthenticated' }),
    }),
    {
      name: 'habita-auth',
      // Only persist non-sensitive user display data; tokens stay in memory only
      partialize: (state) => ({ user: state.user }),
    }
  )
)
