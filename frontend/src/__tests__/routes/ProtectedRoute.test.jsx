import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../routes/ProtectedRoute'
import { useAuthStore } from '../../store/authStore'

vi.mock('../../services/authService', () => ({
  silentRefresh: vi.fn(),
}))

import { silentRefresh } from '../../services/authService'

function renderRoute(children) {
  return render(
    <MemoryRouter>
      <ProtectedRoute>{children}</ProtectedRoute>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ accessToken: null, user: null, authStatus: 'loading' })
  })

  it('shows a loading spinner while authStatus is loading', () => {
    silentRefresh.mockReturnValue(new Promise(() => {})) // never resolves
    const { container } = renderRoute(<div>Protected</div>)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('renders children when authStatus is authenticated', () => {
    useAuthStore.setState({ authStatus: 'authenticated', accessToken: 'tok' })
    renderRoute(<div>Protected Content</div>)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('does not render children when authStatus is unauthenticated', () => {
    useAuthStore.setState({ authStatus: 'unauthenticated', accessToken: null })
    renderRoute(<div>Protected Content</div>)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('calls silentRefresh when no access token is in memory', () => {
    silentRefresh.mockResolvedValue({ username: 'admin' })
    useAuthStore.setState({ authStatus: 'loading', accessToken: null })
    renderRoute(<div>Protected</div>)
    expect(silentRefresh).toHaveBeenCalledOnce()
  })

  it('does not call silentRefresh when an access token already exists', () => {
    useAuthStore.setState({ authStatus: 'authenticated', accessToken: 'existing-token' })
    renderRoute(<div>Protected</div>)
    expect(silentRefresh).not.toHaveBeenCalled()
  })

  it('marks authStatus as unauthenticated when silentRefresh rejects', async () => {
    silentRefresh.mockRejectedValue(new Error('No refresh cookie'))
    useAuthStore.setState({ authStatus: 'loading', accessToken: null })
    renderRoute(<div>Protected</div>)
    await waitFor(() => {
      expect(useAuthStore.getState().authStatus).toBe('unauthenticated')
    })
  })
})
