'use client'

interface Props {
  value: string // "YYYY-MM"
  onChange: (v: string) => void
}

export default function MonthPicker({ value, onChange }: Props) {
  return (
    <input
      type="month"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-zinc-600 [color-scheme:dark]"
    />
  )
}
