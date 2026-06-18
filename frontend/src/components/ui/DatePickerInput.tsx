import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { es } from 'react-day-picker/locale'
import { inputClass } from './ModalParts'

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function parseDate(str: string | undefined | null): Date | undefined {
  if (!str) return undefined
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date: Date | undefined): string {
  if (!date) return ''
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function displayDate(date: Date | undefined): string {
  if (!date) return ''
  return `${date.getDate()} ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`
}

const CLASSNAMES = {
  root:            'rdp-c',
  months:          'rdp-c-months',
  month:           'rdp-c-month',
  month_caption:   'rdp-c-caption',
  caption_label:   'rdp-c-caption-label',
  nav:             'rdp-c-nav',
  button_previous: 'rdp-c-nav-btn',
  button_next:     'rdp-c-nav-btn',
  chevron:         'rdp-c-chevron',
  month_grid:      'rdp-c-grid',
  weekdays:        'rdp-c-weekdays',
  weekday:         'rdp-c-weekday',
  week:            'rdp-c-week',
  day:             'rdp-c-day',
  day_button:      'rdp-c-day-btn',
  selected:        'rdp-c-sel',
  today:           'rdp-c-today',
  outside:         'rdp-c-outside',
  disabled:        'rdp-c-disabled',
  hidden:          'rdp-c-hidden',
}

const CAL_H = 315

interface CalPos {
  left: number
  top?: number
  bottom?: number
}

function CalIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      style={{ width: size, height: size, flexShrink: 0, opacity: 0.6 }}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="14" height="14" rx="2.5" />
      <path d="M3 8h14M7 2v4M13 2v4" />
    </svg>
  )
}

interface DatePickerInputProps {
  value: string
  onChange: (str: string) => void
  placeholder?: string
  compact?: boolean
}

export function DatePickerInput({ value, onChange, placeholder = 'Seleccionar fecha', compact = false }: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState<CalPos | null>(null)
  const triggerRef      = useRef<HTMLButtonElement>(null)
  const portalRef       = useRef<HTMLDivElement>(null)

  const selected = parseDate(value)

  const calcPos = () => {
    if (!triggerRef.current) return
    const rect  = triggerRef.current.getBoundingClientRect()
    const above = window.innerHeight - rect.bottom < CAL_H + 8
    const left  = Math.max(4, Math.min(rect.left, window.innerWidth - 284))
    setPos({
      left,
      ...(above
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
  }

  useEffect(() => {
    if (!open) { setPos(null); return }
    calcPos()
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && !portalRef.current?.contains(e.target as Node))
        setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = displayDate(selected)

  const triggerClass = compact
    ? 'flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all focus:outline-none'
    : `${inputClass} flex items-center gap-2.5 cursor-pointer`

  const triggerStyle = compact
    ? {
        backgroundColor: 'var(--color-surface-2)',
        borderColor:     open ? 'var(--color-brand)' : 'var(--color-border)',
        color:           label ? 'var(--color-fg)' : 'var(--color-stone-text)',
        boxShadow:       open ? '0 0 0 3px rgba(224,97,58,0.15)' : 'none',
      }
    : {}

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className={triggerClass}
        style={triggerStyle}
      >
        <CalIcon size={compact ? 13 : 15} />
        <span style={compact ? {} : { color: label ? 'var(--color-stone-dark)' : '#55554f' }}>
          {label || placeholder}
        </span>
      </button>

      {open && pos && createPortal(
        <div ref={portalRef} style={{ position: 'fixed', zIndex: 9999, ...pos }}>
          <DayPicker
            mode="single"
            locale={es}
            selected={selected}
            defaultMonth={selected ?? new Date()}
            classNames={CLASSNAMES}
            onSelect={(date) => {
              if (!date) return
              onChange(formatDate(date))
              setOpen(false)
            }}
          />
        </div>,
        document.body
      )}
    </>
  )
}
