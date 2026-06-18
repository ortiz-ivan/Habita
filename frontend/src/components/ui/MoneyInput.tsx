import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { inputClass } from './ModalParts'

const fmt = (v: number | string | undefined | null): string => {
  const s = String(v ?? '').replace(/[^\d]/g, '')
  if (!s) return ''
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

interface MoneyInputProps {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  placeholder?: string
  className?: string
}

export function MoneyInput({ name, control, placeholder, className }: MoneyInputProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, onBlur, ref } }) => (
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={fmt(value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, '')
            onChange(raw ? Number(raw) : '')
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          className={className ?? inputClass}
        />
      )}
    />
  )
}
