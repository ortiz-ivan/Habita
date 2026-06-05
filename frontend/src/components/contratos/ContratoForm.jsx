import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useHabitacionesSelect } from '../../hooks/queries/useHabitaciones'
import { useInquilinosSelect } from '../../hooks/queries/useInquilinos'
import { FormField, FormSection, FormFooter, inputClass, selectClass } from '../ui/ModalParts'

const schema = z.object({
  habitacion:    z.coerce.number().int().min(1, 'Seleccioná una habitación'),
  inquilino:     z.coerce.number().int().min(1, 'Seleccioná un inquilino'),
  fecha_inicio:  z.string().min(1, 'Requerido'),
  fecha_fin:     z.string().optional(),
  monto_mensual: z.coerce.number().int().min(1, 'Requerido'),
  deposito:      z.coerce.number().int().min(0, 'Mínimo 0'),
  estado:        z.enum(['activo', 'finalizado', 'cancelado', 'moroso']),
  observacion:   z.string().optional().default(''),
})

export default function ContratoForm({ defaultValues, onSubmit, onCancel, isLoading, apiError }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          habitacion: defaultValues.habitacion?.id ?? defaultValues.habitacion,
          inquilino:  defaultValues.inquilino?.id  ?? defaultValues.inquilino,
        }
      : { estado: 'activo', deposito: 0, observacion: '' },
  })

  const { data: habitaciones } = useHabitacionesSelect()
  const { data: inquilinos }   = useInquilinosSelect()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      <FormSection label="Partes">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Habitación" error={errors.habitacion}>
            <select {...register('habitacion')} className={selectClass}>
              <option value="">Seleccionar...</option>
              {habitaciones?.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.numero} — Piso {h.piso} ({h.estado})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Inquilino" error={errors.inquilino}>
            <select {...register('inquilino')} className={selectClass}>
              <option value="">Seleccionar...</option>
              {inquilinos?.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.apellido}, {i.nombre}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Vigencia">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Fecha inicio" error={errors.fecha_inicio}>
            <input {...register('fecha_inicio')} type="date" className={inputClass} />
          </FormField>
          <FormField label="Fecha fin (opcional)" error={errors.fecha_fin}>
            <input {...register('fecha_fin')} type="date" className={inputClass} />
          </FormField>
        </div>
      </FormSection>

      <FormSection label="Condiciones económicas">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Monto mensual (Gs.)" error={errors.monto_mensual}>
            <input {...register('monto_mensual')} type="number" className={inputClass} placeholder="1500000" />
          </FormField>
          <FormField label="Depósito (Gs.)" error={errors.deposito}>
            <input {...register('deposito')} type="number" className={inputClass} placeholder="0" />
          </FormField>
        </div>
        <FormField label="Estado" error={errors.estado}>
          <select {...register('estado')} className={selectClass}>
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
            <option value="moroso">Moroso</option>
          </select>
        </FormField>
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
