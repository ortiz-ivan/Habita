import axios from 'axios'
import api from './api'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types/api'

const BASE = import.meta.env.VITE_API_URL

export const login = async (username: string, password: string): Promise<User> => {
  const { data } = await axios.post<{ access: string }>(
    `${BASE}/api/v1/auth/token/`,
    { username, password },
    { withCredentials: true }
  )
  const { setAccessToken, setUser } = useAuthStore.getState()
  setAccessToken(data.access)

  const me = await api.get<User>('/api/v1/usuarios/me/')
  setUser(me.data)

  return me.data
}

// Restaura la sesión desde la httpOnly refresh cookie al recargar la página
export const silentRefresh = async (): Promise<User> => {
  const { data } = await axios.post<{ access: string }>(
    `${BASE}/api/v1/auth/token/refresh/`,
    {},
    { withCredentials: true }
  )
  const { setAccessToken, setUser } = useAuthStore.getState()
  setAccessToken(data.access)

  const me = await api.get<User>('/api/v1/usuarios/me/')
  setUser(me.data)

  return me.data
}

export const logout = async (): Promise<void> => {
  try {
    await axios.post(
      `${BASE}/api/v1/auth/logout/`,
      {},
      { withCredentials: true }
    )
  } catch {
    // El error de logout en el servidor no es fatal; se limpia el estado del cliente igual
  }
  useAuthStore.getState().logout()
}
