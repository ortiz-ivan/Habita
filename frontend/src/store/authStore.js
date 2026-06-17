import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
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
