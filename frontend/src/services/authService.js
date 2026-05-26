import axios from 'axios'
import api from './api'
import { useAuthStore } from '../store/authStore'

export const login = async (username, password) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/auth/token/`,
    { username, password }
  )
  const { setTokens, setUser } = useAuthStore.getState()
  setTokens(data.access, data.refresh)

  const me = await api.get('/api/usuarios/me/')
  setUser(me.data)

  return me.data
}

export const logout = () => {
  useAuthStore.getState().logout()
}
