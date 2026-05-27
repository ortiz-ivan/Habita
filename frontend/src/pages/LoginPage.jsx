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

const inp = 'w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D85A30] text-stone-700 placeholder:text-stone-300'

export default function LoginPage() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')

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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F1EFE8' }}>
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 w-full max-w-sm p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-medium mb-1" style={{ color: '#D85A30' }}>Habita</h1>
          <p className="text-sm text-stone-400">Sistema de gestión de habitaciones</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Usuario</label>
            <input
              {...register('username')}
              className={inp}
              placeholder="admin"
              autoFocus
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Contraseña</label>
            <input
              {...register('password')}
              type="password"
              className={inp}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {apiError && (
            <p className="text-red-500 text-sm text-center">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 mt-1"
            style={{ backgroundColor: '#D85A30' }}
            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#c04e27' }}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
