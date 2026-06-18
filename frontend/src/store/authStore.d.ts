import type { User } from '../types/api'
import type { UseBoundStore, StoreApi } from 'zustand'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  accessToken: string | null
  user: User | null
  authStatus: AuthStatus
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  setAuthStatus: (status: AuthStatus) => void
  logout: () => void
}

export declare const useAuthStore: UseBoundStore<StoreApi<AuthState>>
