import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { silentRefresh } from '../services/authService'

export default function ProtectedRoute({ children }) {
  const accessToken  = useAuthStore((s) => s.accessToken)
  const authStatus   = useAuthStore((s) => s.authStatus)
  const setAuthStatus = useAuthStore((s) => s.setAuthStatus)
  const attempted    = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    if (accessToken) {
      setAuthStatus('authenticated')
      return
    }

    // No token in memory — try to restore session from the httpOnly cookie
    silentRefresh().catch(() => setAuthStatus('unauthenticated'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (authStatus === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-body-bg)' }}>
        <div className="animate-spin" style={{
          width: 24, height: 24,
          border: '2.5px solid var(--color-brand)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
        }} />
      </div>
    )
  }

  if (authStatus === 'unauthenticated') return <Navigate to="/login" replace />
  return children
}
