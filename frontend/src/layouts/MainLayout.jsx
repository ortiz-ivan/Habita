import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { logout } from '../services/authService'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/habitaciones', label: 'Habitaciones' },
  { to: '/inquilinos',   label: 'Inquilinos' },
  { to: '/contratos',    label: 'Contratos' },
  { to: '/pagos',        label: 'Pagos' },
]

export default function MainLayout() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <span className="text-lg font-bold text-blue-600">Habita</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate">{user?.username}</p>
          <p className="text-xs text-gray-400 capitalize mb-2">{user?.rol}</p>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-red-500 hover:text-red-700 text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
