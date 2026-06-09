import { Controller } from 'react-hook-form'
import { inputClass } from './ModalParts'

const fmt = (v) => {
  const s = String(v ?? '').replace(/[^\d]/g, '')
  if (!s) return ''
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function MoneyInput({ name, control, placeholder, className }) {
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
