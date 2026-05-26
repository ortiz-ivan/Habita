import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import MainLayout from './layouts/MainLayout'
import DashboardPage from './pages/DashboardPage'
import HabitacionesPage from './pages/HabitacionesPage'
import InquilinosPage from './pages/InquilinosPage'
import ContratosPage from './pages/ContratosPage'
import PagosPage from './pages/PagosPage'
import ProtectedRoute from './routes/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/habitaciones" element={<HabitacionesPage />} />
            <Route path="/inquilinos"   element={<InquilinosPage />} />
            <Route path="/contratos"    element={<ContratosPage />} />
            <Route path="/pagos"        element={<PagosPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
