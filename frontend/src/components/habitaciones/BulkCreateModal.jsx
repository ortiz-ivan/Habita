import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FormField, FormSection, inputClass, selectClass } from '../ui/ModalParts'
import { useTiposHabitacion, useBulkCreateHabitaciones } from '../../hooks/queries/useHabitaciones'

const schema = z.object({
  tipo_id: z.coerce.number({ invalid_type_error: 'Seleccioná un tipo' }).int().min(1, 'Seleccioná un tipo'),
  piso:    z.coerce.number().int().min(1, 'Mínimo 1'),
  desde:   z.coerce.number().int().min(1, 'Mínimo 1'),
  hasta:   z.coerce.number().int().min(1, 'Mínimo 1'),
  prefijo: z.string().optional().default(''),
}).refine((d) => d.hasta >= d.desde, {
  message: 'Debe ser ≥ Desde',
  path: ['hasta'],
}).refine((d) => (d.hasta - d.desde + 1) <= 200, {
  message: 'Máximo 200 por lote',
  path: ['hasta'],
})

export function BulkCreateModal({ isOpen, onClose }) {
  const [result, setResult] = useState(null)

  const { data: tipos = [] } = useTiposHabitacion()
  const mutation = useBulkCreateHabitaciones()

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { tipo_id: '', piso: '', desde: '', hasta: '', prefijo: '' },
  })

  const [tipoId, desde, hasta, prefijo] = watch(['tipo_id', 'desde', 'hasta', 'prefijo'])
  const selectedTipo = tipos.find((t) => t.id === Number(tipoId))

  const preview = useMemo(() => {
    const d = parseInt(desde), h = parseInt(hasta)
    if (!d || !h || isNaN(d) || isNaN(h) || d > h || (h - d + 1) > 200) return []
    return Array.from({ length: h - d + 1 }, (_, i) => `${prefijo ?? ''}${d + i}`)
  }, [desde, hasta, prefijo])

  const onSubmit = (data) => {
    const habitaciones = Array.from(
      { length: data.hasta - data.desde + 1 },
      (_, i) => ({ numero: `${data.prefijo ?? ''}${data.desde + i}`, piso: data.piso })
    )
    mutation.mutate({ tipo_id: data.tipo_id, habitaciones }, {
      onSuccess: (res) => setResult(res),
      onError:   ()    => setResult({ created: 0, errors: [{ numero: '—', error: 'Error al conectar con el servidor' }] }),
    })
  }

  const handleClose = () => {
    reset()
    setResult(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear habitaciones en lote">
      {result ? (
        <div className="flex flex-col gap-4">
          {result.created > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--color-green-bg)', border: '1px solid var(--color-green-text)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--color-green-text)" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-green-text)' }}>
                {result.created} habitación{result.created !== 1 ? 'es' : ''} creada{result.created !== 1 ? 's' : ''} correctamente
              </p>
            </div>
          )}
          {result.errors?.length > 0 && (
            <div className="rounded-lg p-4" style={{ background: 'var(--color-red-bg)', border: '1px solid var(--color-red-text)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-red-text)' }}>
                {result.errors.length} no se pudo{result.errors.length !== 1 ? 'ieron' : ''} crear:
              </p>
              <ul className="flex flex-col gap-1">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs" style={{ color: 'var(--color-red-text)' }}>
                    N° {e.numero} — {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button onClick={handleClose}>Cerrar</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          <FormSection label="Tipo de habitación">
            <FormField label="Tipo" error={errors.tipo_id}>
              <select {...register('tipo_id')} className={selectClass}>
                <option value="">Seleccioná un tipo…</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </FormField>
            {selectedTipo && (
              <div className="flex flex-wrap gap-2">
                {[
                  `Gs. ${Number(selectedTipo.precio).toLocaleString('es-PY')}`,
                  `${selectedTipo.capacidad} persona${selectedTipo.capacidad !== 1 ? 's' : ''}`,
                  selectedTipo.tiene_banio_privado ? 'Baño privado' : 'Baño compartido',
                ].map((item) => (
                  <span key={item} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#2a1200', color: 'var(--color-brand)' }}>
                    {item}
                  </span>
                ))}
              </div>
            )}
          </FormSection>

          <FormSection label="Rango de numeración">
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Piso" error={errors.piso}>
                <input {...register('piso')} type="number" min="1" className={inputClass} placeholder="1" />
              </FormField>
              <FormField label="Desde" error={errors.desde}>
                <input {...register('desde')} type="number" min="1" className={inputClass} placeholder="101" />
              </FormField>
              <FormField label="Hasta" error={errors.hasta}>
                <input {...register('hasta')} type="number" min="1" className={inputClass} placeholder="120" />
              </FormField>
            </div>
            <FormField label='Prefijo (opcional)' error={errors.prefijo}>
              <input {...register('prefijo')} className={inputClass} placeholder='Ej: "A" genera A101, A102…' />
            </FormField>
          </FormSection>

          {preview.length > 0 && (
            <FormSection label={`Vista previa — ${preview.length} habitación${preview.length !== 1 ? 'es' : ''}`}>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {preview.slice(0, 60).map((n) => (
                  <span
                    key={n}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: 'var(--color-stone-dark)' }}
                  >
                    {n}
                  </span>
                ))}
                {preview.length > 60 && (
                  <span className="text-xs self-center" style={{ color: 'var(--color-stone-text)' }}>
                    y {preview.length - 60} más…
                  </span>
                )}
              </div>
            </FormSection>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending || preview.length === 0}>
              {mutation.isPending
                ? 'Creando…'
                : preview.length > 0
                  ? `Crear ${preview.length} habitación${preview.length !== 1 ? 'es' : ''}`
                  : 'Crear habitaciones'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
