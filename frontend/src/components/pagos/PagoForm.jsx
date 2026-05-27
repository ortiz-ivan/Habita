import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { formatGs } from '../../utils/format'

const schema = z.object({
  contrato:    z.coerce.number().int().min(1, 'Seleccioná un contrato'),
  monto:       z.coerce.number().int().min(1, 'Requerido'),
  fecha_pago:  z.string().min(1, 'Requerido'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'qr']),
  estado:      z.enum(['pendiente', 'pagado', 'parcial', 'vencido']),
  observacion: z.string().optional().default(''),
})

const inp = 'w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D85A30] focus:border-[#D85A30] transition-all'
const sel = `${inp} cursor-pointer`

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 font-medium" style={{ color: '#A32D2D' }}>{error.message}</p>}
    </div>
  )
}

export default function PagoForm({ defaultValues, onSubmit, isLoading, apiError }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? { ...defaultValues, contrato: defaultValues.contrato?.id ?? defaultValues.contrato }
      : { metodo_pago: 'efectivo', estado: 'pagado', observacion: '' },
  })

  const { data: contratos } = useQuery({
    queryKey: ['contratos-select'],
    queryFn: () => api.get('/api/contratos/?estado=activo&page_size=200').then((r) => r.data.results),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field label="Contrato" error={errors.contrato}>
        <select {...register('contrato')} className={sel}>
          <option value="">Seleccionar...</option>
          {contratos?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} — {c.inquilino.apellido}, {c.inquilino.nombre} / Hab. {c.habitacion.numero} ({formatGs(c.monto_mensual)})
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Monto (Gs.)" error={errors.monto}>
          <input {...register('monto')} type="number" className={inp} placeholder="1500000" />
        </Field>
        <Field label="Fecha de pago" error={errors.fecha_pago}>
          <input {...register('fecha_pago')} type="date" className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Método de pago" error={errors.metodo_pago}>
          <select {...register('metodo_pago')} className={sel}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="qr">QR</option>
          </select>
        </Field>
        <Field label="Estado" error={errors.estado}>
          <select {...register('estado')} className={sel}>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Parcial</option>
            <option value="vencido">Vencido</option>
          </select>
        </Field>
      </div>

      <Field label="Observación" error={errors.observacion}>
        <textarea {...register('observacion')} className={inp} rows={2} placeholder="Opcional" />
      </Field>

      {apiError && (
        <p className="text-sm font-medium" style={{ color: '#A32D2D' }}>{apiError}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 transition-colors mt-1"
        style={{ backgroundColor: '#D85A30' }}
        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#C04E27' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
      >
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
