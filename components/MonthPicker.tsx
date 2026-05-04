'use client'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function MonthPicker({ value, onChange }: Props) {
  return (
    <input
      type="month"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base focus:outline-none focus:border-gray-400 shadow-sm"
    />
  )
}
