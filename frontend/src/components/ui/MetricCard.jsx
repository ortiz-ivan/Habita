const config = {
  default: {
    iconBg:  'bg-stone-100',
    iconClr: 'text-stone-500',
    valClr:  'text-stone-800',
    cardBg:  'bg-white',
  },
  brand: {
    iconBg:  'bg-[#FAECE7]',
    iconClr: 'text-[#D85A30]',
    valClr:  'text-[#D85A30]',
    cardBg:  'bg-white',
  },
  warning: {
    iconBg:  'bg-amber-50',
    iconClr: 'text-amber-600',
    valClr:  'text-amber-700',
    cardBg:  'bg-white',
  },
  danger: {
    iconBg:  'bg-red-50',
    iconClr: 'text-red-500',
    valClr:  'text-red-700',
    cardBg:  'bg-white',
  },
  success: {
    iconBg:  'bg-green-50',
    iconClr: 'text-green-600',
    valClr:  'text-green-700',
    cardBg:  'bg-white',
  },
}

export function MetricCard({ label, value, color = 'default', icon }) {
  const { iconBg, iconClr, valClr, cardBg } = config[color] ?? config.default

  return (
    <div className={`${cardBg} rounded-xl p-4 border border-stone-200 shadow-sm flex flex-col gap-3`}>
      {icon && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} ${iconClr}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-stone-500 mb-0.5">{label}</p>
        <p className={`text-2xl font-medium leading-none ${valClr}`}>{value ?? '—'}</p>
      </div>
    </div>
  )
}
