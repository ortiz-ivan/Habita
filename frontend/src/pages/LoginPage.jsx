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
      {/* Panel izquierdo brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ backgroundColor: '#1C1917' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Habita</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Gestioná tus propiedades con claridad
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Habitaciones, inquilinos, contratos y pagos — todo en un solo lugar.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { value: '100%', label: 'Tiempo real' },
            { value: '0 papel', label: 'Digital' },
            { value: '24/7', label: 'Disponible' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-lg font-bold" style={{ color: 'var(--color-brand)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--color-fg)' }}>Habita</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-fg)' }}>Iniciá sesión</h1>
            <p className="text-sm" style={{ color: 'var(--color-stone-text)' }}>Sistema de gestión de habitaciones</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-stone-dark)' }}>
                Usuario
              </label>
              <input
                {...register('username')}
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-150"
                style={{
                  border: errors.username ? '1.5px solid var(--color-red-text)' : '1.5px solid var(--color-border-strong)',
                  backgroundColor: 'var(--color-surface-2)',
                  color: 'var(--color-stone-dark)',
                  outline: 'none',
                }}
                placeholder="admin"
                autoFocus
                onFocus={(e) => { if (!errors.username) e.target.style.border = '1.5px solid var(--color-brand)' }}
                onBlur={(e) => { if (!errors.username) e.target.style.border = '1.5px solid var(--color-border-strong)' }}
              />
              {errors.username && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--color-red-text)' }}>
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-stone-dark)' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm transition-all duration-150"
                  style={{
                    border: errors.password ? '1.5px solid var(--color-red-text)' : '1.5px solid var(--color-border-strong)',
                    backgroundColor: 'var(--color-surface-2)',
                    color: 'var(--color-stone-dark)',
                    outline: 'none',
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => { if (!errors.password) e.target.style.border = '1.5px solid var(--color-brand)' }}
                  onBlur={(e) => { if (!errors.password) e.target.style.border = '1.5px solid var(--color-border-strong)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer transition-colors"
                  style={{ color: 'var(--color-stone-text)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-stone-dark)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
                  tabIndex={-1}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--color-red-text)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {apiError && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ backgroundColor: 'var(--color-red-bg)', color: 'var(--color-red-text)', border: '1px solid var(--color-red-text)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-semibold rounded-xl py-3 text-sm text-white transition-all duration-150 cursor-pointer mt-1"
              style={{ backgroundColor: isSubmitting ? '#E8927A' : 'var(--color-brand)' }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#C04E27' }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--color-brand)' }}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
