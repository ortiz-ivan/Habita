import { useState, useRef } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FormField, FormSection, inputClass, SelectInput } from '../ui/ModalParts'
import { useTiposHabitacion, useBulkCreateHabitaciones } from '../../hooks/queries/useHabitaciones'

export function BulkCreateModal({ isOpen, onClose }) {
  const [tipoId,      setTipoId]      = useState('')
  const [piso,        setPiso]        = useState('')
  const [numero,      setNumero]      = useState('')
  const [items,       setItems]       = useState([])  // { numero, piso }
  const [inputError,  setInputError]  = useState('')
  const [tipoError,   setTipoError]   = useState('')
  const [result,      setResult]      = useState(null)

  const numeroRef = useRef(null)
  const { data: tipos = [] } = useTiposHabitacion()
  const mutation = useBulkCreateHabitaciones()
  const selectedTipo = tipos.find((t) => t.id === Number(tipoId))

  const addItem = () => {
    const num = numero.trim()
    if (!num) { setInputError('Ingresá el número de habitación'); return }
    const pisoN = parseInt(piso)
    if (!piso || isNaN(pisoN) || pisoN < 1) { setInputError('Ingresá un piso válido'); return }
    if (items.some((i) => i.numero === num)) {
      setInputError(`"${num}" ya está en la lista`)
      return
    }
    setItems((prev) => [...prev, { numero: num, piso: pisoN }])
    setNumero('')
    setInputError('')
    numeroRef.current?.focus()
  }

  const removeItem = (num) => setItems((prev) => prev.filter((i) => i.numero !== num))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem() }
  }

  const handleSubmit = () => {
    if (!tipoId) { setTipoError('Seleccioná un tipo'); return }
    if (items.length === 0) return
    mutation.mutate(
      { tipo_id: parseInt(tipoId), habitaciones: items },
      {
        onSuccess: (res) => setResult(res),
        onError:   ()    => setResult({ created: 0, errors: [{ numero: '—', error: 'Error al conectar con el servidor' }] }),
      }
    )
  }

  const handleClose = () => {
    setTipoId(''); setPiso(''); setNumero(''); setItems([])
    setInputError(''); setTipoError(''); setResult(null)
    onClose()
  }

  // ── Pantalla de resultado ────────────────────────────────────────────
  if (result) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Crear habitaciones en lote">
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
      </Modal>
    )
  }

  // ── Formulario ───────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear habitaciones en lote">
      <div className="flex flex-col gap-6">

        {/* Tipo */}
        <FormSection label="Tipo de habitación">
          <FormField label="Tipo" error={tipoError ? { message: tipoError } : undefined}>
            <SelectInput
              value={tipoId}
              onChange={(e) => { setTipoId(e.target.value); setTipoError('') }}
            >
              <option value="">Seleccioná un tipo…</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </SelectInput>
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

        {/* Ingreso de habitaciones */}
        <FormSection label="Habitaciones">
          <div className="flex gap-2 items-end">
            <div className="w-24 shrink-0">
              <FormField label="Piso">
                <input
                  type="number"
                  min="1"
                  value={piso}
                  onChange={(e) => { setPiso(e.target.value); setInputError('') }}
                  onKeyDown={handleKeyDown}
                  className={inputClass}
                  placeholder="1"
                />
              </FormField>
            </div>
            <div className="flex-1">
              <FormField label="Número de habitación">
                <input
                  ref={numeroRef}
                  type="text"
                  value={numero}
                  onChange={(e) => { setNumero(e.target.value); setInputError('') }}
                  onKeyDown={handleKeyDown}
                  className={inputClass}
                  placeholder="101"
                />
              </FormField>
            </div>
            <button
              type="button"
              onClick={addItem}
              title="Agregar (Enter)"
              className="mb-0.5 flex items-center justify-center w-10 h-10 rounded shrink-0 transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          {inputError && (
            <p className="text-xs font-medium" style={{ color: 'var(--color-red-text)' }}>{inputError}</p>
          )}

          <p className="text-xs" style={{ color: 'var(--color-stone-text)' }}>
            Presioná <kbd className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-strong)' }}>Enter</kbd> o el botón <span className="font-bold">+</span> para agregar cada habitación.
          </p>
        </FormSection>

        {/* Lista de habitaciones agregadas */}
        {items.length > 0 && (
          <FormSection label={`Lista — ${items.length} habitación${items.length !== 1 ? 'es' : ''}`}>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {items.map(({ numero: n, piso: p }) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1 text-xs pl-2.5 pr-1.5 py-1 rounded"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: 'var(--color-stone-dark)' }}
                >
                  <span className="font-medium">{n}</span>
                  <span style={{ color: 'var(--color-stone-text)' }}>· P{p}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(n)}
                    className="ml-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full transition-colors cursor-pointer"
                    style={{ color: 'var(--color-stone-text)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-red-text)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
                    title={`Quitar ${n}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-xs font-medium transition-colors cursor-pointer w-fit"
              style={{ color: 'var(--color-stone-text)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-red-text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
            >
              Limpiar lista
            </button>
          </FormSection>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending || items.length === 0 || !tipoId}
          >
            {mutation.isPending
              ? 'Creando…'
              : items.length > 0
                ? `Crear ${items.length} habitación${items.length !== 1 ? 'es' : ''}`
                : 'Crear habitaciones'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
