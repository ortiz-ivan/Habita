import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatGs } from '../../utils/format'
import { useContratosSelect } from '../../hooks/queries/useContratos'
import { FormField, FormSection, FormFooter, inputClass, selectClass } from '../ui/ModalParts'

const schema = z.object({
  contrato:    z.coerce.number().int().min(1, 'Seleccioná un contrato'),
  monto:       z.coerce.number().int().min(1, 'Requerido'),
  fecha_pago:  z.string().min(1, 'Requerido'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'qr']),
  estado:      z.enum(['pendiente', 'pagado', 'parcial', 'vencido']),
  observacion: z.string().optional().default(''),
})

export default function PagoForm({ defaultValues, onSubmit, onCancel, isLoading, apiError }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? { ...defaultValues, contrato: defaultValues.contrato?.id ?? defaultValues.contrato }
      : { metodo_pago: 'efectivo', estado: 'pagado', observacion: '' },
  })

  const { data: contratos } = useContratosSelect()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      <FormSection label="Contrato">
        <FormField label="Contrato" error={errors.contrato}>
          <select {...register('contrato')} className={selectClass}>
            <option value="">Seleccionar...</option>
            {contratos?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.inquilino.apellido}, {c.inquilino.nombre} / Hab. {c.habitacion.numero} ({formatGs(c.monto_mensual)})
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection label="Detalle del pago">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Monto (Gs.)" error={errors.monto}>
            <input {...register('monto')} type="number" className={inputClass} placeholder="1500000" />
          </FormField>
          <FormField label="Fecha de pago" error={errors.fecha_pago}>
            <input {...register('fecha_pago')} type="date" className={inputClass} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Método de pago" error={errors.metodo_pago}>
            <select {...register('metodo_pago')} className={selectClass}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="qr">QR</option>
            </select>
          </FormField>
          <FormField label="Estado" error={errors.estado}>
            <select {...register('estado')} className={selectClass}>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="vencido">Vencido</option>
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Observaciones">
        <FormField label="Observación" error={errors.observacion}>
          <textarea {...register('observacion')} className={inputClass} rows={3} placeholder="Opcional" />
        </FormField>
      </FormSection>

      <FormFooter apiError={apiError} onCancel={onCancel} isLoading={isLoading} isEdit={!!defaultValues?.id} />
    </form>
  )
}
