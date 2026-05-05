'use client'

interface Props {
  value: string // "YYYY-MM"
  onChange: (v: string) => void
}

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(ym: string): string {
  return new Date(`${ym}-15`).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

export default function MonthPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <button
        type="button"
        onClick={() => onChange(addMonths(value, -1))}
        className="text-gray-300 hover:text-gray-600 px-3 py-2 text-lg transition-colors"
      >
        ‹
      </button>
      <span className="text-sm text-gray-500 min-w-[140px] text-center">
        {formatMonth(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(addMonths(value, 1))}
        className="text-gray-300 hover:text-gray-600 px-3 py-2 text-lg transition-colors"
      >
        ›
      </button>
    </div>
  )
}
