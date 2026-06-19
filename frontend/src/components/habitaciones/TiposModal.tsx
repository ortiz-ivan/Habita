import { useState } from 'react'
import type { TipoHabitacion, TipoHabitacionWrite } from '../../types/api'
import { Modal } from '../ui/Modal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Button } from '../ui/Button'
import TipoHabitacionForm from './TipoHabitacionForm'
import {
  useTiposHabitacion,
  useCreateTipoHabitacion,
  useUpdateTipoHabitacion,
  useDeleteTipoHabitacion,
  useApplyTipoToAll,
} from '../../hooks/queries/useHabitaciones'
import { parseApiError } from '../../utils/format'

interface TiposModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TiposModal({ isOpen, onClose }: TiposModalProps) {
  const [view, setView]               = useState<'list' | 'form'>('list')
  const [editingTipo, setEditingTipo] = useState<TipoHabitacion | null>(null)
  const [deleteTarget, setDelete]     = useState<TipoHabitacion | null>(null)
  const [apiError, setApiError]       = useState('')

  const { data: tipos = [], isLoading } = useTiposHabitacion()

  const createMutation   = useCreateTipoHabitacion()
  const updateMutation   = useUpdateTipoHabitacion()
  const deleteMutation   = useDeleteTipoHabitacion()
  const applyAllMutation = useApplyTipoToAll()

  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (data: TipoHabitacionWrite, applyToAll: boolean) => {
    setApiError('')
    if (editingTipo) {
      updateMutation.mutate({ id: editingTipo.id, data }, {
        onSuccess: () => {
          if (applyToAll) applyAllMutation.mutate(editingTipo.id)
          setView('list')
        },
        onError: (err) => setApiError(parseApiError(err)),
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setView('list'),
        onError:   (err) => setApiError(parseApiError(err)),
      })
    }
  }

  const openCreate = () => { setEditingTipo(null); setApiError(''); setView('form') }
  const openEdit   = (t: TipoHabitacion) => { setEditingTipo(t); setApiError(''); setView('form') }
  const goBack     = ()  => { setView('list'); setEditingTipo(null); setApiError('') }

  const handleClose = () => {
    setView('list')
    setEditingTipo(null)
    setApiError('')
    onClose()
  }

  const title = view === 'list'
    ? 'Tipos de habitación'
    : editingTipo ? `Editar: ${editingTipo.nombre}` : 'Nuevo tipo'

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={title}>
        {view === 'list' ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={openCreate}>+ Nuevo tipo</Button>
            </div>

            {isLoading ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--color-stone-text)' }}>Cargando…</p>
            ) : tipos.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: 'var(--color-stone-text)' }}>
                No hay tipos creados. Creá el primero para poder usar la creación en lote.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {tipos.map((tipo) => (
                  <TipoRow key={tipo.id} tipo={tipo} onEdit={() => openEdit(tipo)} onDelete={() => setDelete(tipo)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm w-fit cursor-pointer transition-colors"
              style={{ color: 'var(--color-stone-text)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-fg)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
            >
              ← Volver a tipos
            </button>
            <TipoHabitacionForm
              defaultValues={editingTipo ?? undefined}
              onSubmit={handleSubmit}
              onCancel={goBack}
              isLoading={isSaving}
              apiError={apiError}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`¿Eliminás el tipo "${deleteTarget?.nombre}"? Las habitaciones asociadas no se eliminarán.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDelete(null) })}
        onCancel={() => setDelete(null)}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}

function TipoRow({ tipo, onEdit, onDelete }: { tipo: TipoHabitacion; onEdit: () => void; onDelete: () => void }) {
  const precio = Number(tipo.precio).toLocaleString('es-PY')
  const info   = [
    `Gs. ${precio}`,
    `${tipo.capacidad} persona${tipo.capacidad !== 1 ? 's' : ''}`,
    tipo.tiene_banio_privado ? 'Baño privado' : 'Baño compartido',
  ].join(' · ')

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg"
      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>{tipo.nombre}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-stone-text)' }}>
          {info}
          {(tipo.habitaciones_count ?? 0) > 0 && (
            <span style={{ color: 'var(--color-brand)' }}> · {tipo.habitaciones_count} hab.</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="ghost" onClick={onEdit}>Editar</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Eliminar</Button>
      </div>
    </div>
  )
}
