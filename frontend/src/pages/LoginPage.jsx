import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '../services/authService'

const schema = z.object({
  username: z.string().min(1, 'Ingresá tu usuario'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

const features = [
  { icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 13, height: 13 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ), label: 'Cobros automatizados' },
  { icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 13, height: 13 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ), label: 'Alertas de vencimiento' },
  { icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 13, height: 13 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ), label: 'Reportes en tiempo real' },
]

const BrandLogo = ({ size = 36 }) => (
  <div
    style={{
      width: size, height: size,
      borderRadius: '10px',
      background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
      boxShadow: '0 4px 14px rgba(224,97,58,0.40)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" style={{ width: size * 0.52, height: size * 0.52 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
    </svg>
  </div>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ username, password }) => {
    setApiError('')
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      setApiError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-body-bg)' }}>

      {/* ── Panel izquierdo brand ──────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{
          background: 'linear-gradient(160deg, #181410 0%, #100d0b 50%, #0a0908 100%)',
          borderRight: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative radial glows */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,97,58,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,97,58,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div className="flex items-center gap-3" style={{ position: 'relative', zIndex: 1 }}>
          <BrandLogo size={38} />
          <span
            style={{
              fontSize: '20px', fontWeight: 800,
              background: 'linear-gradient(90deg, #F2F2F2 0%, #c8c8c4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.025em',
            }}
          >
            Habita
          </span>
        </div>

        {/* Headline + features */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontSize: '28px', fontWeight: 800, lineHeight: 1.22,
              letterSpacing: '-0.03em', marginBottom: '14px',
              background: 'linear-gradient(135deg, #F2F2F2 0%, #b0afa9 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            Gestioná tus propiedades con claridad
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.42)', marginBottom: '24px' }}>
            Habitaciones, inquilinos, contratos y pagos — todo en un solo lugar.
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {features.map(({ icon, label }) => (
              <div
                key={label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '7px 12px', borderRadius: '8px', width: 'fit-content',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span style={{ color: 'var(--color-brand)', display: 'flex' }}>{icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '28px', position: 'relative', zIndex: 1 }}>
          {[
            { value: '100%', label: 'Tiempo real' },
            { value: '0 papel', label: 'Digital' },
            { value: '24/7', label: 'Disponible' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-brand)', letterSpacing: '-0.02em' }}>{value}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', marginTop: '2px' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel derecho formulario ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <BrandLogo size={34} />
            <span className="text-xl font-bold" style={{ color: 'var(--color-fg)', letterSpacing: '-0.02em' }}>Habita</span>
          </div>

          <div className="mb-8">
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-fg)', marginBottom: '5px' }}>
              Iniciá sesión
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-stone-text)' }}>Sistema de gestión de habitaciones</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Usuario */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '7px', color: 'var(--color-stone-dark)' }}>
                Usuario
              </label>
              <input
                {...register('username')}
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  padding: '11px 14px',
                  fontSize: '14px',
                  border: errors.username ? '1.5px solid var(--color-red-text)' : '1.5px solid var(--color-border-strong)',
                  backgroundColor: 'var(--color-surface-2)',
                  color: 'var(--color-stone-dark)',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                placeholder="admin"
                autoFocus
                onFocus={(e) => {
                  if (!errors.username) {
                    e.target.style.borderColor = 'var(--color-brand)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(224,97,58,0.15)'
                  }
                }}
                onBlur={(e) => {
                  if (!errors.username) {
                    e.target.style.borderColor = 'var(--color-border-strong)'
                    e.target.style.boxShadow = 'none'
                  }
                }}
              />
              {errors.username && (
                <p style={{ fontSize: '12px', marginTop: '6px', fontWeight: 500, color: 'var(--color-red-text)' }}>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '7px', color: 'var(--color-stone-dark)' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    padding: '11px 44px 11px 14px',
                    fontSize: '14px',
                    border: errors.password ? '1.5px solid var(--color-red-text)' : '1.5px solid var(--color-border-strong)',
                    backgroundColor: 'var(--color-surface-2)',
                    color: 'var(--color-stone-dark)',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = 'var(--color-brand)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(224,97,58,0.15)'
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = 'var(--color-border-strong)'
                      e.target.style.boxShadow = 'none'
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    padding: '4px', borderRadius: '4px', cursor: 'pointer',
                    background: 'none', border: 'none',
                    color: 'var(--color-stone-text)', transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-stone-dark)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
                  tabIndex={-1}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: '12px', marginTop: '6px', fontWeight: 500, color: 'var(--color-red-text)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {apiError && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                  backgroundColor: 'var(--color-red-bg)', color: 'var(--color-red-text)',
                  border: '1px solid var(--color-red-border)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15, flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {apiError}
              </div>
            )}

            {/* Submit — gradient primary matching Button.jsx */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                background: isSubmitting
                  ? 'rgba(224,97,58,0.55)'
                  : 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
                boxShadow: isSubmitting ? 'none' : '0 2px 8px rgba(224,97,58,0.30)',
                transition: 'box-shadow 0.2s, transform 0.15s',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(224,97,58,0.50)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(224,97,58,0.30)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
