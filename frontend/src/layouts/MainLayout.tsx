import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { FC } from 'react'
import type { User } from '../types/api'
import { useAuthStore } from '../store/authStore'
import { logout } from '../services/authService'
import { Modal } from '../components/ui/Modal'
import PagoForm from '../components/pagos/PagoForm'
import { Button } from '../components/ui/Button'
import { usePagosVencidosCount } from '../hooks/queries/usePagos'
import { useQuickPago } from '../hooks/ui/useQuickPago'
import {
  IconDashboard,
  IconHabitaciones,
  IconInquilinos,
  IconContratos,
  IconPagos,
  IconPlus,
  IconBell,
  IconSearch,
  IconChevronLeft,
  IconLogout,
} from '../components/ui/icons'

interface NavItem {
  to: string
  label: string
  Icon: FC
}

const navSections: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Operaciones',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { to: '/habitaciones', label: 'Habitaciones', Icon: IconHabitaciones },
      { to: '/inquilinos',   label: 'Inquilinos',   Icon: IconInquilinos },
      { to: '/contratos',    label: 'Contratos',    Icon: IconContratos },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/pagos', label: 'Pagos', Icon: IconPagos },
    ],
  },
]

const pageInfo: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/habitaciones': 'Habitaciones',
  '/inquilinos':   'Inquilinos',
  '/contratos':    'Contratos',
  '/pagos':        'Pagos',
}

function getUserInitials(user: User | null): string {
  const f = user?.first_name?.[0] ?? ''
  const l = user?.last_name?.[0] ?? ''
  if (f || l) return (f + l).toUpperCase()
  return user?.username?.[0]?.toUpperCase() ?? '?'
}

export default function MainLayout() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)

  const { data: unreadCount = 0 } = usePagosVencidosCount()
  const quickPago = useQuickPago()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials     = getUserInitials(user)
  const currentTitle = pageInfo[location.pathname] ?? 'Habita'
  const currentMonth = new Date().toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })
  const monthLabel   = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-body-bg)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
        style={{
          width: collapsed ? '56px' : '176px',
          backgroundColor: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-sidebar-border)',
          boxShadow: '4px 0 16px rgba(0,0,0,0.25)',
        }}
      >
        {/* Brand */}
        <div className="shrink-0" style={{ height: '64px', borderBottom: '1px solid var(--color-sidebar-border)' }}>
          {!collapsed ? (
            <div className="flex items-center h-full px-3 gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-extrabold shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(224,97,58,0.40)',
                  letterSpacing: '-0.02em',
                }}
              >
                H
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold leading-tight" style={{ color: 'var(--color-sidebar-heading)', letterSpacing: '-0.01em' }}>Habita</p>
                <p className="text-[11px] leading-tight mt-[1px]" style={{ color: 'var(--color-sidebar-subtext)' }}>Gestión de alquileres</p>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded transition-colors cursor-pointer shrink-0"
                style={{ color: 'var(--color-sidebar-text)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover-alt)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                aria-label="Colapsar menú"
              >
                <IconChevronLeft />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full h-full flex items-center justify-center cursor-pointer"
              aria-label="Expandir menú"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-extrabold"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(224,97,58,0.40)',
                }}
              >
                H
              </div>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto">
          {navSections.map((section, sectionIndex) => (
            <div key={section.label}>
              {sectionIndex > 0 && (
                <div className="px-1 py-2">
                  <div className="h-px bg-sidebar-border" />
                </div>
              )}

              {!collapsed && (
                <p
                  className="text-[10px] font-medium tracking-[0.07em] uppercase px-2 pb-1"
                  style={{ color: 'var(--color-sidebar-text)', paddingTop: sectionIndex === 0 ? '4px' : '0' }}
                >
                  {section.label}
                </p>
              )}
              {collapsed && sectionIndex === 0 && <div className="pt-1" />}

              {section.items.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={collapsed ? label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: collapsed ? 0 : '9px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingRight: collapsed ? '9px' : '10px',
                    paddingLeft: collapsed ? '9px' : '8px',
                    borderRadius: '6px',
                    borderLeft: collapsed ? 'none' : `2px solid ${isActive ? 'var(--color-brand)' : 'transparent'}`,
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    textDecoration: 'none',
                    transition: 'background-color 150ms ease, color 150ms ease',
                    whiteSpace: 'nowrap',
                    marginBottom: '2px',
                    backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                    color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text)',
                  })}
                  onMouseEnter={(e) => {
                    if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                      e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <span style={{ display: 'flex', color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text)' }}>
                        <Icon />
                      </span>
                      {!collapsed && <span>{label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer usuario */}
        <div className="p-2" style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="w-full flex justify-center p-2 rounded transition-colors cursor-pointer"
              style={{ color: 'var(--color-sidebar-text)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.10)'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-sidebar-text)' }}
            >
              <IconLogout />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--color-brand) 0%, #FAC775 100%)', color: '#fff' }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-tight truncate" style={{ color: 'var(--color-sidebar-heading)' }}>
                    {user?.username}
                  </p>
                  <p className="text-[11px] capitalize leading-tight" style={{ color: 'var(--color-sidebar-subtext)' }}>
                    {user?.rol}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[12px] transition-colors cursor-pointer"
                style={{ color: 'var(--color-sidebar-text)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.10)'; e.currentTarget.style.color = '#f87171' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-sidebar-text)' }}
              >
                <IconLogout />
                <span>Cerrar sesión</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="shrink-0"
          style={{
            height: '64px',
            backgroundColor: 'var(--color-surface-1)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center h-full max-w-[1280px] mx-auto px-8">
            <div className="flex items-center gap-3 min-w-0">
              <div>
                <h1 className="text-[15px] font-semibold leading-none" style={{ color: 'var(--color-fg)' }}>
                  {currentTitle}
                </h1>
                {location.pathname === '/dashboard' && (
                  <p className="text-[11px] mt-[3px]" style={{ color: 'var(--color-stone-text)' }}>
                    {monthLabel}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1.5">
              <div className="w-px h-5 mr-2" style={{ backgroundColor: 'var(--color-border-strong)' }} />

              <button
                aria-label="Ver notificaciones"
                onClick={() => navigate('/pagos?estado=vencido')}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--color-stone-text)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-fg)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-stone-text)' }}
              >
                <IconBell />
                {unreadCount > 0 && (
                  <span
                    className="absolute flex items-center justify-center rounded-full font-bold"
                    style={{
                      top: '5px',
                      right: '5px',
                      minWidth: '16px',
                      height: '16px',
                      fontSize: '10px',
                      padding: '0 3px',
                      backgroundColor: 'var(--color-red-text)',
                      color: '#fff',
                      boxShadow: '0 0 0 2px var(--color-surface-1)',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                aria-label="Buscar"
                onClick={() => navigate('/pagos')}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--color-stone-text)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-fg)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-stone-text)' }}
              >
                <IconSearch />
              </button>

              <div className="w-px h-5 mx-2" style={{ backgroundColor: 'var(--color-border-strong)' }} />

              <Button onClick={quickPago.open} size="sm" className="text-[13px] font-medium px-3">
                <IconPlus />
                Registrar pago
              </Button>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-body-bg)' }}>
          <div key={location.pathname} className="page-enter max-w-[1280px] mx-auto px-8 pt-10 pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modal — Registrar pago rápido */}
      <Modal
        isOpen={quickPago.isOpen}
        onClose={quickPago.close}
        title="Registrar pago"
      >
        <PagoForm
          onSubmit={(data) => quickPago.mutation.mutate(data)}
          onCancel={quickPago.close}
          isLoading={quickPago.mutation.isPending}
          apiError={quickPago.apiError}
        />
      </Modal>
    </div>
  )
}
