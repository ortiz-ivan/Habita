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

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const sel = `${inp} bg-white`

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
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
              #{c.id} — {c.inquilino.apellido}, {c.inquilino.nombre} / Hab. {c.habitacion.numero} ({formatGs(c.monto_mensual)})
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

      {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-2 text-sm transition-colors"
      >
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
