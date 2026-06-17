import axios from 'axios'
import api from './api'
import { useAuthStore } from '../store/authStore'

const BASE = import.meta.env.VITE_API_URL

export const login = async (username, password) => {
  const { data } = await axios.post(
    `${BASE}/api/v1/auth/token/`,
    { username, password },
    { withCredentials: true }
  )
  const { setAccessToken, setUser } = useAuthStore.getState()
  setAccessToken(data.access)

  const me = await api.get('/api/v1/usuarios/me/')
  setUser(me.data)

  return me.data
}

// Called on page load to restore session from the httpOnly refresh cookie
export const silentRefresh = async () => {
  const { data } = await axios.post(
    `${BASE}/api/v1/auth/token/refresh/`,
    {},
    { withCredentials: true }
  )
  const { setAccessToken, setUser } = useAuthStore.getState()
  setAccessToken(data.access)

  const me = await api.get('/api/v1/usuarios/me/')
  setUser(me.data)

  return me.data
}

export const logout = async () => {
  try {
    await axios.post(
      `${BASE}/api/v1/auth/logout/`,
      {},
      { withCredentials: true }
    )
  } catch {
    // Server error on logout is non-fatal; clear client state regardless
  }
  useAuthStore.getState().logout()
}
