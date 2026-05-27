import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { logout } from '../services/authService'
import api from '../services/api'
import { parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import PagoForm from '../components/pagos/PagoForm'

const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
)

const IconHabitaciones = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
)

const IconInquilinos = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
)

const IconContratos = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)

const IconPagos = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
)

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
)

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
)

const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
)

const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
  </svg>
)

const navSections = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard',    label: 'Dashboard',    Icon: IconDashboard },
      { to: '/habitaciones', label: 'Habitaciones', Icon: IconHabitaciones },
      { to: '/inquilinos',   label: 'Inquilinos',   Icon: IconInquilinos },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/pagos',     label: 'Pagos',     Icon: IconPagos },
      { to: '/contratos', label: 'Contratos', Icon: IconContratos },
    ],
  },
]

const pageInfo = {
  '/dashboard':    'Dashboard',
  '/habitaciones': 'Habitaciones',
  '/inquilinos':   'Inquilinos',
  '/contratos':    'Contratos',
  '/pagos':        'Pagos',
}

function getUserInitials(user) {
  const f = user?.first_name?.[0] ?? ''
  const l = user?.last_name?.[0] ?? ''
  if (f || l) return (f + l).toUpperCase()
  return user?.username?.[0]?.toUpperCase() ?? '?'
}

export default function MainLayout() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()

  const [collapsed, setCollapsed] = useState(false)
  const [payModal, setPayModal]   = useState(false)
  const [apiError, setApiError]   = useState('')

  const { data: vencidosData } = useQuery({
    queryKey: ['pagos-vencidos-count'],
    queryFn:  () => api.get('/api/pagos/?estado=vencido&page_size=1').then((r) => r.data),
    refetchInterval: 60_000,
  })
  const unreadCount = vencidosData?.count ?? 0

  const createPago = useMutation({
    mutationFn: (data) => api.post('/api/pagos/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagos'] })
      qc.invalidateQueries({ queryKey: ['pagos-pendientes'] })
      qc.invalidateQueries({ queryKey: ['pagos-vencidos'] })
      qc.invalidateQueries({ queryKey: ['pagos-vencidos-count'] })
      setPayModal(false)
      setApiError('')
    },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openPayModal = () => { setApiError(''); setPayModal(true) }

  const initials = getUserInitials(user)
  const currentTitle = pageInfo[location.pathname] ?? 'Habita'
  const currentMonth = new Date().toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })
  const monthLabel = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F5F0E8' }}>
      {/* Sidebar cálido */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
        style={{
          width: collapsed ? '56px' : '200px',
          backgroundColor: '#F5F0E8',
          borderRight: '1px solid #E0D8CC',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center shrink-0 px-3"
          style={{ height: '56px', borderBottom: '1px solid #E0D8CC' }}
        >
          {!collapsed ? (
            <>
              <div className="flex-1 pl-1">
                <p className="text-[15px] font-semibold leading-tight" style={{ color: '#412402' }}>Habita</p>
                <p className="text-[11px] leading-tight mt-[1px]" style={{ color: '#633806' }}>Gestión de alquileres</p>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{ color: '#5F5E5A' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EDE8DE'; e.currentTarget.style.color = '#5F5E5A' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
                aria-label="Colapsar menú"
              >
                <IconChevronLeft />
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="mx-auto p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: '#5F5E5A' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EDE8DE'; e.currentTarget.style.color = '#5F5E5A' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
              aria-label="Expandir menú"
            >
              <IconChevronRight />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-[10px] py-3 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p
                  className="text-[10px] tracking-[0.06em] uppercase px-[6px] mt-3 mb-1"
                  style={{ color: '#5F5E5A' }}
                >
                  {section.label}
                </p>
              )}
              {collapsed && <div className="mt-3 mb-1 border-t" style={{ borderColor: '#E0D8CC' }} />}
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
                    padding: collapsed ? '9px' : '8px 10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: 'none',
                    transition: 'background-color 120ms ease, color 120ms ease',
                    whiteSpace: 'nowrap',
                    marginBottom: '2px',
                    backgroundColor: isActive ? '#FAEEDA' : 'transparent',
                    color: isActive ? '#633806' : '#5F5E5A',
                  })}
                  onMouseEnter={(e) => {
                    if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                      e.currentTarget.style.backgroundColor = '#EDE8DE'
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
                      <span style={{ display: 'flex', color: isActive ? '#633806' : '#5F5E5A' }}>
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
        <div className="px-[10px] py-3" style={{ borderTop: '1px solid #E0D8CC' }}>
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="w-full flex justify-center p-2 rounded-lg transition-colors cursor-pointer"
              style={{ color: '#5F5E5A' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FCEBEB'; e.currentTarget.style.color = '#A32D2D' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
            >
              <IconLogout />
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-[9px] px-[10px] py-2 rounded-lg">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                  style={{ backgroundColor: '#D85A30', color: '#FAECE7' }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-tight truncate" style={{ color: '#412402' }}>
                    {user?.username}
                  </p>
                  <p className="text-[11px] capitalize leading-tight" style={{ color: '#633806' }}>
                    {user?.rol}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-[10px] py-1.5 rounded-lg text-[12px] transition-colors cursor-pointer mt-0.5"
                style={{ color: '#5F5E5A' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FCEBEB'; e.currentTarget.style.color = '#A32D2D' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
              >
                <IconLogout />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="shrink-0 flex items-center px-5 gap-3"
          style={{
            height: '56px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E0D8CC',
          }}
        >
          <div>
            <h1 className="text-[15px] font-semibold leading-none" style={{ color: '#1C1917' }}>
              {currentTitle}
            </h1>
            <p className="text-[12px] mt-[2px]" style={{ color: '#5F5E5A' }}>
              {monthLabel}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Registrar pago */}
            <button
              onClick={openPayModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#D85A30', color: '#FAECE7' }}
            >
              <IconPlus />
              Registrar pago
            </button>

            {/* Notificaciones */}
            <button
              aria-label="Ver notificaciones"
              onClick={() => navigate('/pagos?estado=vencido')}
              className="relative w-[30px] h-[30px] flex items-center justify-center rounded-lg transition-colors cursor-pointer"
              style={{ color: '#5F5E5A' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0EDE7'; e.currentTarget.style.color = '#1C1917' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
            >
              <IconBell />
              {unreadCount > 0 && (
                <span
                  className="absolute top-[5px] right-[5px] w-[7px] h-[7px] rounded-full"
                  style={{ backgroundColor: '#D85A30', boxShadow: '0 0 0 1.5px #FFFFFF' }}
                />
              )}
            </button>

            {/* Búsqueda */}
            <button
              aria-label="Buscar"
              onClick={() => navigate('/pagos')}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-lg transition-colors cursor-pointer"
              style={{ color: '#5F5E5A' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0EDE7'; e.currentTarget.style.color = '#1C1917' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
            >
              <IconSearch />
            </button>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-5" style={{ backgroundColor: '#F1EFE8' }}>
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modal — Registrar pago rápido */}
      <Modal
        isOpen={payModal}
        onClose={() => setPayModal(false)}
        title="Registrar pago"
      >
        <PagoForm
          onSubmit={(data) => createPago.mutate(data)}
          isLoading={createPago.isPending}
          apiError={apiError}
        />
      </Modal>
    </div>
  )
}
