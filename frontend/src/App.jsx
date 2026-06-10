import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import { SkeletonGrid } from './components/ui/Skeleton'
import { ToastContainer } from './components/ui/Toast'

const DashboardPage    = lazy(() => import('./pages/DashboardPage'))
const HabitacionesPage = lazy(() => import('./pages/HabitacionesPage'))
const InquilinosPage   = lazy(() => import('./pages/InquilinosPage'))
const ContratosPage    = lazy(() => import('./pages/ContratosPage'))
const PagosPage        = lazy(() => import('./pages/PagosPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
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
            <Route path="/dashboard"    element={<Suspense fallback={<div className="pt-8"><SkeletonGrid /></div>}><DashboardPage /></Suspense>} />
            <Route path="/habitaciones" element={<Suspense fallback={<div className="pt-8"><SkeletonGrid /></div>}><HabitacionesPage /></Suspense>} />
            <Route path="/inquilinos"   element={<Suspense fallback={<div className="pt-8"><SkeletonGrid /></div>}><InquilinosPage /></Suspense>} />
            <Route path="/contratos"    element={<Suspense fallback={<div className="pt-8"><SkeletonGrid /></div>}><ContratosPage /></Suspense>} />
            <Route path="/pagos"        element={<Suspense fallback={<div className="pt-8"><SkeletonGrid /></div>}><PagosPage /></Suspense>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
