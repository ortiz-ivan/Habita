import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatGs } from '../../utils/format'
import { useContratosSelect } from '../../hooks/queries/useContratos'
import { Button } from '../ui/Button'

const schema = z.object({
  contrato:    z.coerce.number().int().min(1, 'Seleccioná un contrato'),
  monto:       z.coerce.number().int().min(1, 'Requerido'),
  fecha_pago:  z.string().min(1, 'Requerido'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'qr']),
  estado:      z.enum(['pendiente', 'pagado', 'parcial', 'vencido']),
  observacion: z.string().optional().default(''),
})

const inp = 'w-full border border-border-strong rounded px-3.5 py-2.5 text-sm bg-surface-2 text-stone-dark placeholder:text-[#555553] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all'
const sel = `${inp} cursor-pointer`

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-stone-dark">{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 font-medium text-red-text">{error.message}</p>}
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

  const { data: contratos } = useContratosSelect()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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

      <div className="grid grid-cols-2 gap-3">
        <Field label="Monto (Gs.)" error={errors.monto}>
          <input {...register('monto')} type="number" className={inp} placeholder="1500000" />
        </Field>
        <Field label="Fecha de pago" error={errors.fecha_pago}>
          <input {...register('fecha_pago')} type="date" className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <p className="text-sm font-medium text-red-text">{apiError}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full mt-1">
        {isLoading ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
