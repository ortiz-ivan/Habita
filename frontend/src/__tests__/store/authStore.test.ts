import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../../store/authStore'
import type { User } from '../../types/api'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      authStatus: 'loading',
    })
    localStorage.clear()
  })

  it('starts with null token, null user and loading status', () => {
    const { accessToken, user, authStatus } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(user).toBeNull()
    expect(authStatus).toBe('loading')
  })

  it('setAccessToken stores the token and marks authenticated', () => {
    useAuthStore.getState().setAccessToken('eyJ0eXAiOiJKV1QifQ.payload.sig')
    const { accessToken, authStatus } = useAuthStore.getState()
    expect(accessToken).toBe('eyJ0eXAiOiJKV1QifQ.payload.sig')
    expect(authStatus).toBe('authenticated')
  })

  it('setUser stores user data without affecting token', () => {
    useAuthStore.getState().setAccessToken('tok')
    const user = { id: 1, username: 'admin', rol: 'administrador' } as User
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().user).toEqual(user)
    expect(useAuthStore.getState().accessToken).toBe('tok')
  })

  it('setAuthStatus updates only authStatus', () => {
    useAuthStore.getState().setAuthStatus('unauthenticated')
    expect(useAuthStore.getState().authStatus).toBe('unauthenticated')
  })

  it('logout clears token and user, marks unauthenticated', () => {
    useAuthStore.getState().setAccessToken('tok')
    useAuthStore.getState().setUser({ username: 'admin' } as User)
    useAuthStore.getState().logout()
    const { accessToken, user, authStatus } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(user).toBeNull()
    expect(authStatus).toBe('unauthenticated')
  })

  it('persists only user to localStorage, never accessToken', () => {
    useAuthStore.getState().setAccessToken('super-secret-token')
    useAuthStore.getState().setUser({ username: 'admin', rol: 'administrador' } as User)

    const raw = localStorage.getItem('habita-auth')
    expect(raw).not.toBeNull()

    const stored = JSON.parse(raw!)
    expect(stored.state).not.toHaveProperty('accessToken')
    expect(stored.state.user).toEqual({ username: 'admin', rol: 'administrador' })
  })
})
